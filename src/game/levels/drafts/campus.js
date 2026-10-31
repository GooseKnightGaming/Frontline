// FRONTLINE - Level 14, the Campus (first draft). Rhys (after M6.12.1): "a fictional campus
// based on [Edge Hill's] layout - renamed, no crest or real signage, rearranged where it helps play",
// built from his descriptions of each building; the whole campus as one map (Rhys, after M6.18.11).
// Brookvale University: the reds have come for the pathogen work in BioSciences, on an open day.
//
// Storeys across the campus: LG -3.6 (Health's lower ground, the Hub's and Creative Edge's basements),
// G 0, Mz 2.2 (the Catalyst's mezzanine, the sports building's half-floor annex), 1 at 4.2, 2 at 8.2,
// 3 at 12.2. Buildings drawn as teaching blocks (a corridor down the middle, rooms off it, a stair at
// each end, alternating) unless the brief says otherwise.
const W = 200, H = 132;
const F = { LG: [], G: [], Mz: [], 1: [], 2: [], 3: [], C1: [], C2: [], C3: [] }, A = { LG: [], G: [], Mz: [], 1: [], 2: [], 3: [], C1: [], C2: [], C3: [] };
const stairs = [], zones = [];
const ORDER = ['LG', 'G', '1', '2', '3'];
const room = (f, x0, y0, x1, y1, ch) => F[f].push(['room', x0, y0, x1, y1, ch || '.']);
const after = (f, op) => A[f].push(op);
const cells = (f, list, ch) => A[f].push(['cells', list, ch]);
// a teaching block: interior x0..x1, y0..y1; corridor along x (rows cy, cy+1) or along y (cols cx, cx+1);
// rooms either side split every `rw` squares; storeys from..to; stairs at the ends, alternating
// a room's door: the middle of its run of wall - but never onto the corridor's stair (s0..s1)
const doorAt = (a, b, s0, s1) => {
  const mids = []; for (let i = a; i <= b; i++) mids.push(i);
  mids.sort((p, q) => Math.abs(p - (a + b) / 2) - Math.abs(q - (a + b) / 2));
  return mids.find((i) => i < s0 - 1 || i > s1 + 1) ?? mids[0];
};
function block(name, x0, y0, x1, y1, from, to, o) {
  o = o || {};
  const along = o.along || 'x', rw = o.rw || 6;
  const fl = ORDER.slice(ORDER.indexOf(from), ORDER.indexOf(to) + 1);
  const c = along === 'x' ? Math.floor((y0 + y1) / 2) : Math.floor((x0 + x1) / 2);
  for (const f of fl) {
    room(f, x0, y0, x1, y1);
    if (along === 'x') {
      room(f, x0, c - 1, x1, c - 1, '#'); room(f, x0, c + 2, x1, c + 2, '#');
      for (let x = x0 + rw; x < x1; x += rw + 1) { room(f, x, y0, x, c - 1, '#'); room(f, x, c + 2, x, y1, '#'); }
      // (a door in the middle of each room's run of wall - not where a partition meets it)
      for (let x = x0; x <= x1; x += rw + 1) { const e = Math.min(x1, x + rw - 1); after(f, ['cell', doorAt(x, e, x0 + 2, x0 + 6), c - 1, 'D']); after(f, ['cell', doorAt(x, e, x1 - 6, x1 - 2), c + 2, 'D']); }
      if (f === 'G') { after(f, ['cell', x0 - 1, c, 'D']); after(f, ['cell', x1 + 1, c + 1, 'D']); }
      for (let x = x0 + 1; x < x1; x += 3) { after(f, ['cell', x, y0 - 1, 'W']); after(f, ['cell', x, y1 + 1, 'W']); }
    } else {
      room(f, c - 1, y0, c - 1, y1, '#'); room(f, c + 2, y0, c + 2, y1, '#');
      for (let y = y0 + rw; y < y1; y += rw + 1) { room(f, x0, y, c - 1, y, '#'); room(f, c + 2, y, x1, y, '#'); }
      for (let y = y0; y <= y1; y += rw + 1) { const e = Math.min(y1, y + rw - 1); after(f, ['cell', c - 1, doorAt(y, e, y0 + 2, y0 + 6), 'D']); after(f, ['cell', c + 2, doorAt(y, e, y1 - 6, y1 - 2), 'D']); }
      if (f === 'G') { after(f, ['cell', c, y0 - 1, 'D']); after(f, ['cell', c + 1, y1 + 1, 'D']); }
      for (let y = y0 + 1; y < y1; y += 3) { after(f, ['cell', x0 - 1, y, 'W']); after(f, ['cell', x1 + 1, y, 'W']); }
    }
    if (o.furnish) o.furnish(f);
  }
  // the stairs: up the corridor at one end, then the other
  for (let i = 0; i + 1 < fl.length; i++) {
    const west = i % 2 === 0;
    if (along === 'x') stairs.push(west ? { x: x0 + 6, y: c, dir: 'W', len: 5, w: 1, from: fl[i], to: fl[i + 1] } : { x: x1 - 6, y: c + 1, dir: 'E', len: 5, w: 1, from: fl[i], to: fl[i + 1] });
    else stairs.push(west ? { x: c, y: y0 + 6, dir: 'N', len: 5, w: 1, from: fl[i], to: fl[i + 1] } : { x: c + 1, y: y1 - 6, dir: 'S', len: 5, w: 1, from: fl[i], to: fl[i + 1] });
  }
  for (const f of fl) zones.push({ id: name.replace(/\W+/g, '') + f, label: 'Brookvale - ' + name + (f === 'G' ? '' : f === 'LG' ? ', lower ground' : ', floor ' + f), at: [x0, y0, x1, y1], floor: f });
}

// 10 - the Faculty of Education (Lakeside): three storeys, its cafe on the ground floor nearest the lake
block('the Faculty of Education', 9, 53, 29, 67, 'G', '2', { furnish: (f) => { if (f === 'G') { cells('G', [[25, 54], [27, 56], [24, 56]], 'T'); after('G', ['room', 23, 53, 29, 53, 'K']); } else cells(f, [[11, 55], [18, 55], [11, 64], [18, 64], [25, 64]], 'T'); } });
zones.push({ id: 'educafe', label: 'Brookvale - the Lakeside cafe', at: [23, 53, 29, 57], floor: 'G' });
// 9 - Health, Social Care and Medicine: lower ground, ground (a small cafe), first; the wards they train in
block('Health, Social Care and Medicine', 9, 79, 29, 91, 'LG', '1', { furnish: (f) => cells(f, f === 'G' ? [[11, 81], [13, 81], [25, 81], [18, 89]] : [[11, 81], [13, 81], [18, 81], [20, 81], [11, 89], [13, 89], [25, 89], [27, 89]], f === 'G' ? 'T' : 'Y') });
// 15 - BioSciences: four storeys; the CAVE on the ground floor; the pathogen lab on the third, restricted
block('BioSciences', 41, 25, 56, 39, 'G', '3', { along: 'y', furnish: (f) => { if (f === 'G') cells('G', [[43, 27], [43, 30], [53, 27], [53, 30]], 'M'); if (f === '3') cells('3', [[43, 27], [44, 27], [45, 27], [43, 29], [45, 29]], 'K'); } });
// 16 - the Business School: very long, a stair at each end; the first floor a gallery all along, over the ground floor
room('G', 61, 27, 103, 35); room('1', 61, 27, 64, 35); room('1', 100, 27, 103, 35); room('1', 65, 27, 99, 28); room('1', 65, 34, 99, 35);
room('1', 65, 29, 99, 29, '='); room('1', 65, 33, 99, 33, '='); room('1', 65, 30, 99, 32, 'O');
cells('G', [[70, 29], [76, 29], [82, 29], [88, 29], [94, 29], [70, 33], [76, 33], [82, 33], [88, 33], [94, 33]], 'T');
after('G', ['cell', 60, 31, 'D']); after('G', ['cell', 104, 31, 'D']); after('G', ['cell', 82, 36, 'D']); after('G', ['cell', 83, 36, 'D']);
for (let x = 62; x < 103; x += 3) { after('G', ['cell', x, 26, 'W']); after('G', ['cell', x, 36, 'W']); after('1', ['cell', x, 26, 'W']); after('1', ['cell', x, 36, 'W']); }
stairs.push({ x: 66, y: 31, dir: 'W', len: 5, w: 1, from: 'G', to: '1' }, { x: 98, y: 31, dir: 'E', len: 5, w: 1, from: 'G', to: '1' });
zones.push({ id: 'business', label: 'Brookvale - the Business School', at: [61, 27, 103, 35], floor: 'G' }, { id: 'business1', label: 'Brookvale - the Business School gallery', at: [61, 27, 103, 35], floor: '1' });
// 19 - Sport and Physical Activity, the curved building: two parallel curved corridors on each floor, rooms
// between them, a stair at each end; an annex up a half-floor on its straight end
const SC = [125, 62];
// what a square of the curved building is: 'f' floor (a corridor or a room), 'w' a ring of wall, '-' neither
const arcCls = (x, y) => {
  const dx = x + 0.5 - SC[0], dy = y + 0.5 - SC[1], r = Math.hypot(dx, dy), deg = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
  if (deg < 205 || deg > 335) return '-';
  return (r >= 12 && r < 14) || (r >= 15 && r < 18) || (r >= 19 && r < 21) ? 'f' : (r >= 14 && r < 15) || (r >= 18 && r < 19) ? 'w' : '-';
};
function doorIn(px, py, ring) {
  let best = null, bd = 1e9;
  for (let y = Math.floor(py) - 3; y <= Math.floor(py) + 3; y++) for (let x = Math.floor(px) - 3; x <= Math.floor(px) + 3; x++) {
    const r = Math.hypot(x + 0.5 - SC[0], y + 0.5 - SC[1]);
    if (r < ring[0] || r >= ring[1] || arcCls(x, y) !== 'w') continue;
    const ew = arcCls(x - 1, y) === 'f' && arcCls(x + 1, y) === 'f';
    const ns = arcCls(x, y - 1) === 'f' && arcCls(x, y + 1) === 'f' && (arcCls(x - 1, y) === 'w' || arcCls(x + 1, y) === 'w');
    const d = Math.hypot(x + 0.5 - px, y + 0.5 - py) - (arcCls(x, y - 1) === 'w' && arcCls(x, y + 1) === 'w' || arcCls(x - 1, y) === 'w' && arcCls(x + 1, y) === 'w' ? 0.5 : 0);
    if ((ew || ns) && d < bd) { bd = d; best = [x, y]; }
  }
  return best || [Math.floor(px), Math.floor(py)];
}
for (const f of ['G', '1']) {
  const arc = [], rooms = [], walls = [], doors = [];
  for (let y = 38; y < 62; y++) for (let x = 104; x < 147; x++) {
    const dx = x + 0.5 - SC[0], dy = y + 0.5 - SC[1], r = Math.hypot(dx, dy), a = Math.atan2(dy, dx) * 180 / Math.PI + 360;
    const deg = a % 360;
    if (deg < 205 || deg > 335) continue;
    if (r >= 12 && r < 14) arc.push([x, y]);
    else if (r >= 14 && r < 15) walls.push([x, y]);
    else if (r >= 15 && r < 18) rooms.push([x, y, Math.floor((deg - 205) / 16)]);
    else if (r >= 18 && r < 19) walls.push([x, y]);
    else if (r >= 19 && r < 21) arc.push([x, y]);
  }
  F[f].push(['cells', arc, '.'], ['cells', rooms.map(([x, y]) => [x, y]), '.'], ['cells', walls, '#']);
  // walls between the rooms, and a door from each room onto each corridor
  const by = {}; for (const [x, y, k] of rooms) (by[k] = by[k] || []).push([x, y]);
  for (const k of Object.keys(by)) {
    const deg = 205 + (+k + 1) * 16, t = deg * Math.PI / 180;
    if (+k < 7) for (let r = 15; r < 18; r += 0.5) walls.push([Math.floor(SC[0] + Math.cos(t) * r), Math.floor(SC[1] + Math.sin(t) * r)]);
    const m = (205 + (+k + 0.5) * 16) * Math.PI / 180;
    // (Rhys: doors into walls) each door where the ring is straight across: floor either side of it,
    // wall to its other two sides - the nearest such square to the room's middle
    for (const rr of [14.5, 18.5]) doors.push(doorIn(SC[0] + Math.cos(m) * rr, SC[1] + Math.sin(m) * rr, rr < 16 ? [14, 15] : [18, 19]));
  }
  F[f].push(['cells', walls, '#']);
  A[f].push(['cells', doors, 'D']);
  // the stairwells at each end
  room(f, 104, 50, 109, 56); room(f, 141, 50, 146, 56);
}
stairs.push({ x: 105, y: 56, dir: 'N', len: 5, w: 1, from: 'G', to: '1' }, { x: 145, y: 56, dir: 'N', len: 5, w: 1, from: 'G', to: '1' });
after('G', ['cell', 106, 57, 'D']); after('G', ['cell', 144, 57, 'D']);
// the annex: half a floor up from the east stairwell, on its own plinth
room('Mz', 150, 48, 158, 56); after('Mz', ['cell', 149, 55, 'D']); cells('Mz', [[152, 50], [155, 50], [152, 53], [155, 53]], 'M');
room('G', 147, 55, 148, 55);
stairs.push({ x: 146, y: 55, dir: 'E', len: 3, w: 1, from: 'G', to: 'Mz' });
after('G', ['cell', 149, 55, 'J']);      // (the annex's door, over the top of the stair: the plinth below it, not a wall; M6.19.6: closed - it let the outdoors into the building)
zones.push({ id: 'sport', label: 'Brookvale - Sport and Physical Activity', at: [104, 38, 146, 61], floor: 'G' }, { id: 'sport1', label: 'Brookvale - Sport and Physical Activity, floor 1', at: [104, 38, 146, 61], floor: '1' }, { id: 'annex', label: 'Brookvale - the sports annex', at: [150, 48, 158, 56], floor: 'Mz' });
// 3 - the Students' Union: the bar and its dance venue, the launderette, the sandwich shop, the shop
room('G', 61, 50, 71, 63); room('G', 73, 50, 79, 54); room('G', 73, 56, 79, 58); room('G', 73, 60, 79, 63); room('G', 72, 50, 72, 63);
room('G', 73, 55, 79, 55, '#'); room('G', 73, 59, 79, 59, '#'); room('G', 72, 50, 72, 63, '.');
after('G', ['room', 62, 51, 66, 51, 'K']); after('G', ['cells', [[75, 51], [77, 51], [75, 53], [77, 53]], 'M']); after('G', ['room', 74, 57, 78, 57, 'K']); after('G', ['cells', [[74, 61], [76, 61], [78, 61], [74, 63], [76, 63]], 'H']);
after('G', ['cell', 66, 64, 'D']); after('G', ['cell', 67, 64, 'D']); after('G', ['cell', 72, 64, 'D']);
zones.push({ id: 'su', label: 'Brookvale - the Students\' Union bar', at: [61, 50, 71, 63], floor: 'G' }, { id: 'laund', label: 'Brookvale - the launderette', at: [73, 50, 79, 54], floor: 'G' });
// 22 - the Catalyst (the library): big and open; ground, mezzanine, first, second, and the third floor's rooftop garden
room('G', 113, 64, 133, 80);
for (let x = 115; x <= 131; x += 4) for (let y = 66; y <= 78; y += 4) if (!(x > 118 && x < 128 && y > 68 && y < 76)) cells('G', [[x, y], [x + 1, y]], 'H');
// (Rhys: "ceilings in the Catalyst are too low") its own storeys, not the campus's: the mezzanine
// (C1) at 3.2 m - 3 m clear under it - round an atrium open from the ground floor to the floor above (C2,
// 7.0 m); the rooftop garden (C3) over that
room('C1', 113, 64, 133, 66, '.'); room('C1', 113, 78, 133, 80, '.'); room('C1', 113, 67, 115, 77, '.'); room('C1', 131, 67, 133, 77, '.');
room('C1', 116, 67, 130, 77, 'O'); room('C1', 116, 67, 130, 67, '='); room('C1', 116, 77, 130, 77, '='); room('C1', 116, 68, 116, 76, '='); room('C1', 130, 68, 130, 76, '=');
for (const f of ['C2']) { room(f, 113, 64, 133, 80); cells(f, [[117, 67], [121, 67], [125, 67], [129, 67], [117, 77], [121, 77], [125, 77], [129, 77]], 'H'); cells(f, [[119, 71], [123, 71], [127, 71], [119, 74], [123, 74], [127, 74]], 'T'); }
room('C3', 113, 64, 133, 80, 'g'); room('C3', 113, 64, 133, 64, '='); room('C3', 113, 80, 133, 80, '='); room('C3', 113, 65, 113, 79, '='); room('C3', 133, 65, 133, 79, '=');
cells('C3', [[117, 68], [129, 68], [117, 76], [129, 76], [123, 72]], 't');
after('G', ['cell', 122, 81, 'D']); after('G', ['cell', 123, 81, 'D']);
for (let x = 114; x < 133; x += 3) for (const f of ['G', 'C1', 'C2']) { after(f, ['cell', x, 63, 'W']); after(f, ['cell', x, 81, 'W']); }
stairs.push({ x: 114, y: 70, dir: 'N', len: 5, w: 1, from: 'G', to: 'C1' }, { x: 132, y: 68, dir: 'S', len: 6, w: 1, from: 'C1', to: 'C2' },
  { x: 114, y: 77, dir: 'N', len: 6, w: 1, from: 'C2', to: 'C3' });
zones.push({ id: 'cat', label: 'Brookvale - the Catalyst', at: [113, 64, 133, 80], floor: 'G' }, { id: 'catm', label: 'The Catalyst - the mezzanine', at: [113, 64, 133, 80], floor: 'C1' },
  { id: 'cat2', label: 'The Catalyst - upstairs', at: [113, 64, 133, 80], floor: 'C2' }, { id: 'cat3', label: 'The Catalyst - the rooftop garden', at: [113, 64, 133, 80], floor: 'C3' });
// 2 - the Hub: the shop's store below; the shop, the coffee counter, the restaurant, a hall and the dining hall;
// upstairs, on the right small rooms through to the Main Building, on the left an open space, a bridge, the prayer
// room and toilets - the two sides not joined
room('LG', 83, 52, 104, 66); cells('LG', [[86, 54], [90, 54], [94, 54], [98, 54], [86, 58], [90, 58], [94, 58], [98, 58], [86, 62], [90, 62]], 'H');
room('G', 83, 52, 104, 66);
room('G', 88, 52, 88, 57, '#'); room('G', 83, 57, 88, 57, '#'); room('G', 89, 57, 89, 66, '#'); room('G', 98, 52, 98, 60, '#'); room('G', 98, 60, 104, 60, '#');
after('G', ['cell', 88, 55, 'D']); after('G', ['cell', 89, 62, 'D']); after('G', ['cell', 98, 56, 'D']); after('G', ['cell', 93, 67, 'D']); after('G', ['cell', 94, 67, 'D']); after('G', ['cell', 93, 51, 'D']); after('G', ['cell', 94, 51, 'D']);
after('G', ['room', 92, 54, 95, 54, 'K']); cells('G', [[86, 53], [87, 55]], 'H'); cells('G', [[100, 53], [102, 53], [100, 57], [102, 57]], 'T'); cells('G', [[91, 61], [94, 61], [97, 61], [91, 64], [94, 64], [97, 64], [101, 63]], 'T'); cells('G', [[84, 60], [86, 63]], 'T');
room('1', 83, 52, 89, 60); room('1', 90, 56, 92, 57); room('1', 93, 52, 96, 60); room('1', 93, 56, 93, 56, '#');
room('1', 90, 52, 92, 55, 'O'); room('1', 90, 58, 92, 60, 'O'); room('1', 97, 52, 97, 66, '#');
room('1', 98, 52, 104, 66); room('1', 101, 52, 101, 66, '#'); room('1', 98, 56, 100, 56, '#'); room('1', 98, 61, 100, 61, '#'); room('1', 102, 56, 104, 56, '#'); room('1', 102, 61, 104, 61, '#');
after('1', ['cell', 93, 56, 'D']); after('1', ['cells', [[101, 54], [101, 59], [101, 64], [99, 56], [103, 61]], 'D']); after('1', ['cell', 100, 67, 'D']);
cells('1', [[95, 58], [95, 59]], 'K');
stairs.push({ x: 84, y: 65, dir: 'N', len: 5, w: 1, from: 'LG', to: 'G' }, { x: 84, y: 56, dir: 'N', len: 4, w: 1, from: 'G', to: '1' });
zones.push({ id: 'hub', label: 'Brookvale - the Hub', at: [83, 52, 104, 66], floor: 'G' }, { id: 'hubdining', label: 'The Hub - the dining hall', at: [90, 58, 104, 66], floor: 'G' }, { id: 'hubstore', label: 'The Hub - the shop\'s store', at: [83, 52, 104, 66], floor: 'LG' });
// 1 - the Main Building: from the old halls to the Hub; three storeys, the old lecturers' rooms
block('the Main Building', 83, 68, 104, 78, 'G', '2', { furnish: (f) => cells(f, [[85, 70], [92, 70], [99, 70], [85, 76], [92, 76], [99, 76]], 'T') });
// I, J, H, G - the old halls: offices and social spaces below, rooms, kitchens and bathrooms above
const hall = (name, x0, y0, x1, y1) => block(name, x0, y0, x1, y1, 'G', '2', { along: 'y', rw: 4, furnish: (f) => cells(f, f === 'G' ? [[x0 + 2, y0 + 2], [x1 - 2, y0 + 2], [x0 + 2, y1 - 2]] : [[x0 + 1, y0 + 1], [x1 - 1, y0 + 1], [x0 + 1, y0 + 6], [x1 - 1, y0 + 6], [x0 + 1, y1 - 1]], f === 'G' ? 'Z' : 'Y') });
hall('the old halls (I)', 72, 68, 81, 82); hall('the old halls (H)', 106, 84, 115, 98); hall('the old halls (J)', 72, 86, 81, 100); hall('the old halls (G)', 88, 84, 97, 98);
// 5 and 6a - the Arts Centre and Performance Studio: the theatre, band and rehearsal rooms, the lounge bar
room('G', 37, 99, 53, 115); room('G', 37, 99, 53, 102, '.'); cells('G', [[45, 100]], 'M');
for (let y = 105; y <= 114; y += 2) cells('G', [[39, y], [40, y], [41, y], [42, y], [43, y], [47, y], [48, y], [49, y], [50, y], [51, y]].map((p) => p), 'q');
room('G', 37, 103, 53, 103, '='); after('G', ['cell', 45, 103, '.']); after('G', ['cell', 44, 103, '.']);
room('G', 55, 99, 63, 103); room('G', 55, 105, 63, 109); room('G', 55, 111, 63, 115); room('G', 55, 104, 63, 104, '#'); room('G', 55, 110, 63, 110, '#');
after('G', ['cells', [[54, 101], [54, 107], [54, 113], [45, 116], [46, 116], [64, 113]], 'D']); cells('G', [[57, 101], [61, 101], [58, 107]], 'M'); after('G', ['room', 56, 112, 62, 112, 'K']); cells('G', [[57, 114], [60, 114]], 'Z');
zones.push({ id: 'theatre', label: 'Brookvale - the Arts Centre theatre', at: [37, 99, 53, 115], floor: 'G' }, { id: 'lounge', label: 'The Arts Centre - the lounge bar', at: [55, 111, 63, 115], floor: 'G' });
// 23 - Creative Edge: largely open plan; a basement; a small rooftop garden off the first floor
room('LG', 137, 86, 155, 96); cells('LG', [[140, 89], [146, 89], [152, 89], [140, 93], [146, 93]], 'M');
room('G', 137, 86, 155, 100); cells('G', [[140, 89], [144, 89], [148, 89], [140, 94], [144, 94], [148, 94], [152, 92]], 'T'); room('G', 151, 96, 155, 96, '#'); after('G', ['cell', 153, 96, 'D']);
room('1', 137, 86, 150, 100); room('1', 152, 86, 156, 100, 'g'); room('1', 152, 86, 156, 86, '='); room('1', 156, 87, 156, 100, '='); room('1', 152, 100, 156, 100, '=');
after('1', ['cell', 151, 93, 'D']); cells('1', [[140, 90], [145, 90], [140, 96], [145, 96]], 'T'); cells('1', [[154, 90], [154, 97]], 't');
after('G', ['cell', 146, 101, 'D']); after('G', ['cell', 136, 92, 'D']);
stairs.push({ x: 138, y: 95, dir: 'N', len: 5, w: 1, from: 'LG', to: 'G' }, { x: 140, y: 99, dir: 'N', len: 5, w: 1, from: 'G', to: '1' });
zones.push({ id: 'ce', label: 'Brookvale - Creative Edge', at: [137, 86, 155, 100], floor: 'G' }, { id: 'ce1', label: 'Creative Edge - first floor', at: [137, 86, 150, 100], floor: '1' }, { id: 'ceg', label: 'Creative Edge - the rooftop garden', at: [152, 86, 156, 100], floor: '1' });
// 24 - the Sports Centre: the swimming pool and the gym
room('G', 165, 40, 195, 64); room('G', 182, 40, 182, 64, '#'); room('G', 168, 43, 179, 60, '~'); after('G', ['cell', 182, 52, 'D']); after('G', ['cell', 176, 65, 'D']); after('G', ['cell', 188, 65, 'D']);
cells('G', [[185, 43], [188, 43], [191, 43], [185, 47], [188, 47], [191, 47], [185, 51], [188, 51]], 'M');
zones.push({ id: 'pool', label: 'Brookvale - the swimming pool', at: [165, 40, 181, 64], floor: 'G' }, { id: 'gym', label: 'Brookvale - the gym', at: [183, 40, 195, 64], floor: 'G' });
// the grounds: the lakes, the paths, trees, the car parks, the road along the south
const out = [];
const rect = (x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) out.push([x, y, ch]); };
rect(34, 55, 52, 70, '~'); rect(138, 66, 160, 78, '~');
rect(30, 72, 160, 73, 'p'); rect(96, 82, 97, 124, 'p'); rect(58, 40, 59, 120, 'p'); rect(107, 24, 108, 50, 'p'); rect(10, 118, 190, 119, 'p');
rect(0, 124, 199, 128, 'k');
{ let sd = 3; const rr = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 160; i++) { const x = Math.floor(rr() * W), y = Math.floor(rr() * 122); out.push([x, y, 't']); } }
for (const [x, y] of [[100, 104], [104, 104], [108, 104], [100, 110], [104, 110], [112, 110], [70, 106], [74, 106], [78, 112], [82, 112], [120, 108], [124, 114]]) out.push([x, y, 'v']);
const ground = new Set(); for (const op of F.G) if (op[0] === 'room') { const [, a, b, c, d] = op; for (let y = Math.min(b, d) - 1; y <= Math.max(b, d) + 1; y++) for (let x = Math.min(a, c) - 1; x <= Math.max(a, c) + 1; x++) ground.add(x + ',' + y); } else if (op[0] === 'cells') for (const [x, y] of op[1]) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) ground.add((x + dx) + ',' + (y + dy));
A.G.unshift(...['~', 'p', 'k', 't', 'v'].map((ch) => ['cells', out.filter(([x, y, c]) => c === ch && !ground.has(x + ',' + y)).map(([x, y]) => [x, y]), ch]));

export default {
  id: 'campus', no: 14, title: 'The Campus', place: 'Brookvale University', navCap: 250000, pieceBudget: 12000,
  where: 'Brookvale University, on its open day. 14:20, bright, the lawns full of visitors - until the reds came.',
  brief: [
    ['The place', 'The whole campus. West: the Faculty of Education by its lake (the Lakeside cafe nearest the water), Health, Social Care and Medicine below it, the Arts Centre and its theatre to the south. North: BioSciences (four storeys), the long Business School with its gallery, the curved Sport and Physical Activity building. In the middle: the Students\' Union, the Hub, the Main Building, the old halls round them, the Catalyst library (its rooftop garden). East: Creative Edge by the second lake, and the Sports Centre - pool and gym.'],
    ['The reds', 'Twenty-four of them, across the campus and in every building that matters.'],
    ['Objectives', 'Take the <b>pathogen sample</b> from BioSciences\' restricted lab (third floor; its door is reinforced - breach it). Bring out <b>Professor Amara Qureshi</b>, held upstairs in the Catalyst. Optionally, hack the <b>campus security terminal</b> in the Main Building, and clear the reds out.'],
    ['Getting about', 'Stairs at the ends of each building\'s corridors; the Catalyst\'s stairs: the ground floor to the mezzanine, the mezzanine upstairs, upstairs to the rooftop garden. The Hub\'s upstairs is in two halves: the left from the Hub, the right from the Main Building.'],
  ],
  time: { date: [3, 9, 2026], hour: 14, minute: 20 }, faction: 'red',
  extractName: 'the van at the visitors\' entrance',
  outside: { backdrop: 'woods', mat: 'lawn', margin: 10 },
  decals: { p: { mat: 'concrete2', tint: [0.8, 0.78, 0.72] }, k: { mat: 'asphalt' } },
  legend: {
    q(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h + 0.05, cy, cz - 0.25], [cx + h - 0.05, cy + 0.45, cz + 0.25], 'fabric', { tint: [0.55, 0.12, 0.15] }); k.box([cx - h + 0.05, cy + 0.45, cz + 0.15], [cx + h - 0.05, cy + 0.95, cz + 0.25], 'fabric', { tint: [0.5, 0.1, 0.12] }); },
  },
  floors: {
    LG: { y: -3.6, wallH: 3.4, wall: 'concrete2', floor: 'concrete', ceil: 'concrete2', lampPower: 0.7, carve: { size: [W, H], ops: F.LG, after: A.LG } },
    G: { y: 0, wallH: 4.0, wall: 'brick', floor: 'carpet', floorTint: [0.75, 0.75, 0.8], ceil: 'plaster', lampPower: 0.85, lampEvery: 14, channel: 2.0, noRoof: [[66, 30, 98, 32], [91, 52, 92, 60], [117, 68, 129, 76]], carve: { size: [W, H], ops: F.G, after: A.G } },
    Mz: { y: 2.2, wallH: 1.8, wall: 'brick', floor: 'carpet', floorTint: [0.7, 0.7, 0.75], ceil: 'plaster', lamps: false, carve: { size: [W, H], walls: false, ops: F.Mz.concat([['room', 149, 47, 159, 47, '#'], ['room', 149, 57, 159, 57, '#'], ['room', 149, 48, 149, 56, '#'], ['room', 159, 48, 159, 56, '#']]), after: A.Mz } },
    C1: { y: 3.2, wallH: 3.6, wall: 'brick', floor: 'carpet', floorTint: [0.7, 0.7, 0.75], ceil: 'plaster', lampPower: 0.85, lampEvery: 12, carve: { size: [W, H], ops: F.C1, after: A.C1 } },
    C2: { y: 7.0, wallH: 3.6, wall: 'brick', floor: 'carpet', floorTint: [0.75, 0.72, 0.7], ceil: 'plaster', lampPower: 0.85, lampEvery: 12, carve: { size: [W, H], ops: F.C2, after: A.C2 } },
    C3: { y: 10.8, wallH: 3.0, roof: false, lamps: false, wall: 'brick', floor: 'carpet', carve: { size: [W, H], ops: F.C3, after: A.C3, walls: false } },
    1: { y: 4.2, wallH: 3.8, wall: 'brick', floor: 'carpet', floorTint: [0.75, 0.72, 0.7], ceil: 'plaster', lampPower: 0.85, lampEvery: 14, carve: { size: [W, H], ops: F[1], after: A[1] } },
    2: { y: 8.2, wallH: 3.8, wall: 'brick', floor: 'carpet', floorTint: [0.75, 0.72, 0.7], ceil: 'plaster', lampPower: 0.85, lampEvery: 14, carve: { size: [W, H], ops: F[2], after: A[2] } },
    3: { y: 12.2, wallH: 3.6, wall: 'brick', floor: 'carpet', floorTint: [0.75, 0.72, 0.7], ceil: 'plaster', lampPower: 0.85, lampEvery: 14, carve: { size: [W, H], ops: F[3], after: A[3] } },
  },
  stairs,
  start: { x: 96, y: 127, floor: 'G', yaw: 0, van: [-4, 0] },
  extra(kit) {
    // the sports annex's plinth: solid under its half-floor
    kit.box([150 * kit.CELL, 0, 48 * kit.CELL], [159 * kit.CELL, 2.0, 57 * kit.CELL], 'concrete2');
  },
  zones,
  guards: [
    { id: 'u1', at: [101, 112, 'G'], route: [[101, 82], [101, 120]], arms: 'carbine' },
    { id: 'u2', at: [60, 80, 'G'], route: [[59, 44], [59, 118]], arms: 'carbine' },
    { id: 'u3', at: [40, 80, 'G'], route: [[33, 75], [56, 75], [56, 95], [33, 95]], arms: 'smg' },
    { id: 'u4', at: [48, 32, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'u5', at: [53, 28, '1'], arms: 'smg' },
    { id: 'u6', at: [44, 36, '3'], arms: 'shotgun', rank: 'sergeant', temper: 'steady' },
    { id: 'u7', at: [53, 32, '3'], arms: 'carbine', temper: 'steady' },
    { id: 'u8', at: [80, 32, 'G'], route: [[68, 32], [96, 32]], arms: 'carbine' },
    { id: 'u9', at: [80, 28, '1'], route: [[66, 28], [98, 28]], arms: 'dmr', rank: 'specialist' },
    { id: 'u10', at: [125, 42, 'G'], arms: 'smg' },
    { id: 'u11', at: [66, 56, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'u12', at: [94, 63, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'u13', at: [86, 54, 'G'], arms: 'pistol' },
    { id: 'u14', at: [118, 70, 'G'], arms: 'carbine' },
    { id: 'u15', at: [124, 72, 'C2'], arms: 'smg', rank: 'officer', temper: 'steady' },
    { id: 'u16', at: [118, 78, 'C2'], arms: 'carbine', temper: 'steady' },
    { id: 'u17', at: [92, 74, 'G'], route: [[90, 74], [97, 73]], arms: 'smg' },
    { id: 'u18', at: [20, 61, 'G'], route: [[16, 61], [23, 60]], arms: 'carbine' },
    { id: 'u19', at: [20, 85, 'LG'], arms: 'pistol', temper: 'steady' },
    { id: 'u20', at: [45, 108, 'G'], arms: 'carbine' },
    { id: 'u21', at: [146, 93, 'G'], arms: 'smg' },
    { id: 'u22', at: [188, 58, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'u23', at: [124, 70, 'C3'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'u24', at: [76, 75, 'G'], arms: 'pistol' },
  ],
  hostages: [{ id: 'qureshi', name: 'Professor Amara Qureshi', she: true, at: [123, 73, 'C2'] }],
  pickups: [{ id: 'pathogen', name: 'The pathogen sample', what: 'the sample', at: [44, 27, '3'], table: false, h: 1.12, colour: [0.9, 0.3, 0.3] }],
  terminals: [{ id: 'security', name: 'the campus security terminal', at: [99, 70, 'G'], face: [0, -1], time: 6, reveal: 40,
    said: 'Campus security: the cameras put every red on your radar for 40 seconds.' }],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'pathogen', text: 'Take the pathogen sample (BioSciences, third floor)' },
    { id: 'o2', kind: 'rescue', ref: 'qureshi', text: 'Bring out Professor Qureshi (the Catalyst, upstairs)' },
    { id: 'o3', kind: 'hack', ref: 'security', text: 'Hack the campus security terminal (the Main Building)', optional: true },
    { id: 'o4', kind: 'clear', text: 'Clear the reds out', optional: true },
  ],
};
// the pathogen lab's door: reinforced - the room on the third floor's west side, nearest its north end
A[3].push(['cell', 47, 29, '#'], ['cell', 47, 25, 'R']);      // (the lab's door, off the stair)
