// FRONTLINE - Level 27, the Mega-Prison (first draft). From Rhys's location boards:
// "Mega-Prison - cells and blocks, security". HMP Greyhallow: A Wing - four tiers of cells round a hall open
// to the roof, the galleries along the cell fronts, two bridges across; the control room over the hall's
// south end, the governor's office above it. The yard, the wall, the towers. The reds have bought the
// governor; a Ghost operative is held on the top tier under another name.
//
// The cells are barred: you see in, you do not go in - but for the few with doors. Sergeant Venn's cell is
// opened from the control room (hack it: every cell door on the wing unlocks). A square is 1.6 m.
const CELL = 1.6, W = 64, H = 60;
const grid = () => Array.from({ length: H }, () => new Array(W).fill(' '));
const G = grid(), F = [grid(), grid(), grid()];
const ALL = [G, ...F];
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const ring = (g, x0, y0, x1, y1, ch) => { for (let x = x0; x <= x1; x++) { put(g, x, y0, ch); put(g, x, y1, ch); } for (let y = y0; y <= y1; y++) { put(g, x0, y, ch); put(g, x1, y, ch); } };

// A Wing: x 12-51, y 10-45. The hall x 20-43, y 13-38; the galleries x 17-19 and 44-46; cells behind them.
const X0 = 12, X1 = 51, Y0 = 10, Y1 = 45;
for (const [k, g] of ALL.entries()) {
  ring(g, X0, Y0, X1, Y1, '#'); fill(g, X0 + 1, Y0 + 1, X1 - 1, Y1 - 1, '.');
  // the cells: three squares deep, two wide, barred fronts ('b'), cross walls between
  for (const [cx0, front, dir] of [[X0 + 1, 16, 1], [X1 - 3, 47, -1]]) {
    for (let y = 13; y <= 37; y += 3) {
      for (let x = Math.min(cx0, cx0 + 2); x <= Math.max(cx0, cx0 + 2); x++) put(g, x, y, '#');
      put(g, front, y, '#'); put(g, front, y + 1, 'b'); put(g, front, y + 2, 'b');
      put(g, dir > 0 ? cx0 + 1 : cx0 + 1, y + 1, 'Y');
    }
    for (let x = Math.min(cx0, cx0 + 2); x <= Math.max(cx0, cx0 + 2); x++) put(g, x, 40, '#');
    put(g, front, 40, '#');
  }
  if (k > 0) {
    // upper tiers: the hall is open (holes), the galleries' edges railed, two bridges across the middle
    fill(g, 20, 13, 43, 38, 'O');
    for (let y = 13; y <= 38; y++) { put(g, 19, y, 'q'); put(g, 44, y, 'q'); }
    for (const y of [25, 26]) for (let x = 19; x <= 44; x++) put(g, x, y, '.');
    for (let x = 20; x <= 43; x++) { put(g, x, 24, 'k'); put(g, x, 27, 'k'); put(g, x, 12, 'k'); put(g, x, 39, 'k'); }
  }
  // the north end: the stairs' landings; the south end (y 39-44): offices over the wing's entrance
  for (let x = X0 + 1; x <= X1 - 1; x++) put(g, x, 41, '#');
  for (const x of [18, 19, 44, 45]) put(g, x, 41, k === 0 ? 'D' : 'D');
}
// G: the hall's floor - the tables of the mess; the wing's entrance (south) and its lobby
for (let y = 16; y <= 34; y += 4) for (const x of [24, 28, 35, 39]) put(G, x, y, 'T');
for (const x of [31, 32]) { put(G, x, 41, 'D'); put(G, x, Y1, 'D'); }
fill(G, 25, 43, 27, 43, 'K'); put(G, 40, 43, 'H');
// 1: the control room over the entrance - its windows on the hall
for (let x = 21; x <= 42; x++) put(F[0], x, 41, 'W'); put(F[0], 31, 41, 'D');
fill(F[0], 24, 43, 30, 43, 'M'); put(F[0], 36, 43, 'T');
// 2: the staff room; 3: the governor's office
put(F[1], 30, 43, 'T'); put(F[1], 34, 43, 'Z'); put(F[1], 26, 42, 'H');
put(F[2], 32, 43, 'T'); put(F[2], 28, 42, 'H'); put(F[2], 36, 43, 'Z');
// the doors into the cells that have them: Venn's on the top tier (a vault door: the control room opens it),
// and a few others
put(F[2], 47, 26, 'V'); put(F[2], 47, 27, '#');
put(G, 16, 20, 'L'); put(G, 16, 21, 'b'); put(F[0], 47, 32, 'L'); put(F[1], 16, 14, 'L');

// the stairs: up the galleries at the north end, turn and turn about
const stairs = [
  { x: 17, y: 16, dir: 'N', len: 3, w: 2, from: 'G', to: '1' },
  { x: 45, y: 16, dir: 'N', len: 3, w: 2, from: '1', to: '2' },
  { x: 17, y: 16, dir: 'N', len: 3, w: 2, from: '2', to: '3' },
  { x: 18, y: 42, dir: 'E', len: 3, w: 2, from: 'G', to: '1' },            // the staff stair, south end
  { x: 22, y: 42, dir: 'E', len: 3, w: 2, from: '1', to: '2' },
  { x: 26, y: 42, dir: 'E', len: 3, w: 2, from: '2', to: '3' },
];
// the yard, the wall round it all, two towers
for (const [x, y] of [[8, 52], [55, 6]]) { put(G, x, y, 'J'); put(F[1], x, y, '.'); }
put(G, 14, 50, 'B'); put(G, 15, 50, 'B'); put(G, 48, 52, 'C'); put(G, 49, 52, 'C');

export default {
  id: 'prison', no: 27, title: 'The Mega-Prison', place: 'HMP Greyhallow', cell: CELL, windows: false,
  where: 'HMP Greyhallow, A Wing. 14:20, a flat grey afternoon - the wing locked down.',
  brief: [
    ['The place', 'A Wing: four tiers of cells round a hall open to the roof; galleries along the cell fronts, railed; two bridges across the middle of the upper tiers; the stairs up the galleries at the north end, and the staff stair at the south. Over the wing\'s entrance (south): the <b>control room</b> on the first tier, its windows on the hall; the staff room above it; the <b>governor\'s office</b> on the top. The yard outside, the wall, two towers.'],
    ['Inside', 'The reds have bought the governor, <b>Ashdown-Pryce</b>, and the wing\'s officers with him. Ghost\'s <b>Sergeant Venn</b> is on the top tier, east side, under another name. Her cell door opens only from the control room.'],
    ['Objectives', '<b>Hack the control room</b> (first tier, over the entrance): it unlocks every cell door on the wing. <b>Bring Sergeant Venn out</b> (the top tier, east gallery, the middle). Optionally, stop the governor.'],
    ['The cells', 'Barred fronts: you can see in, and shoot through, but not go in - only a few cells have doors.'],
    ['The specialists', 'The guard in the lobby carries the <b>radio</b>: if he sees you, a few seconds and the whole wing is coming - drop him first. The wing\'s <b>engineer</b> (in the staff room, third tier) goes to the security terminal to put a hacked system back on: stop him, or hack it again.'],
    ['Security', 'Cameras over the hall, the first tier and the entrance raise the alarm if they see you; a turret covers the lobby. The <b>security terminal</b> in the control room runs them all: hack it (hold E) to disable them, have them ignore you, or turn the turret on the reds. Hack too long and they trace you. Your <b>hacking kit</b> (this mission\'s Special) takes them one at a time, up close. The control room\'s own door is <b>maglocked</b> - use the kit on its keypad, or blow it - the hall\'s <b>lights</b> are on the system too (out, the reds see only what is close), and while the <b>alarm</b> is live one shout sets off the siren for the whole wing.'],
  ],
  time: { date: [24, 10, 2026], hour: 14, minute: 20 }, faction: 'red', requires: 'HACKKIT',
  atmos: { fog: [0.62, 0.64, 0.68, 40, 400], ambient: [0.45, 0.47, 0.52] },
  extractName: 'the yard gate', navCap: 150000,
  outside: { backdrop: 'hills', mat: 'concrete', tint: [0.75, 0.75, 0.75], margin: 12 },
  decals: { p: { mat: 'paint', tint: [0.8, 0.75, 0.3] } },
  legend: {
    // a cell's barred front: bars, top to bottom, a solid you can see and shoot through
    b(k, x, y, f) {
      const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2, F0 = k.floors[f], top = cy + (F0.wallH || 3);
      for (let i = 0; i < 6; i++) { const z = cz - h + 0.13 + i * (k.CELL - 0.26) / 5; k.box([cx - 0.03, cy, z - 0.025], [cx + 0.03, top, z + 0.025], 'metal', { solid: false, tint: [0.3, 0.32, 0.34] }); }
      k.box([cx - 0.04, cy + 1.1, cz - h], [cx + 0.04, cy + 1.18, cz + h], 'metal', { solid: false, tint: [0.3, 0.32, 0.34] });
      k.box([cx - 0.06, cy, cz - h], [cx + 0.06, top, cz + h], 'metal', { render: false, shootThrough: true, noClimb: true });
    },
    // a gallery's rail, along it (north-south)
    q(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - 0.04, cy, cz - h], [cx + 0.04, cy + 1.05, cz + h], 'metal', { tint: [0.35, 0.37, 0.4], shootThrough: true }); },
    // a bridge's rail (east-west)
    k(k2, x, y, f) { const [cx, cy, cz] = k2.at(x, y, f), h = k2.CELL / 2; k2.box([cx - h, cy, cz - 0.04], [cx + h, cy + 1.05, cz + 0.04], 'metal', { tint: [0.35, 0.37, 0.4], shootThrough: true }); },
  },
  floors: {
    G: { y: 0, wallH: 3.2, wall: 'concrete2', wallTint: [0.78, 0.8, 0.8], floor: 'concrete', floorTint: [0.62, 0.64, 0.66], ceil: 'concrete2', lampPower: 0.7, lampColour: [0.95, 0.98, 1], noRoof: [[20, 13, 43, 38]], rows: G.map((r) => r.join('')) },
    1: { y: 3.4, wallH: 3.2, wall: 'concrete2', wallTint: [0.78, 0.8, 0.8], floor: 'grating', floorTint: [0.6, 0.62, 0.65], ceil: 'concrete2', lampPower: 0.7, noRoof: [[20, 13, 43, 38]], rows: F[0].map((r) => r.join('')) },
    2: { y: 6.8, wallH: 3.2, wall: 'concrete2', wallTint: [0.78, 0.8, 0.8], floor: 'grating', floorTint: [0.6, 0.62, 0.65], ceil: 'concrete2', lampPower: 0.7, noRoof: [[20, 13, 43, 38]], rows: F[1].map((r) => r.join('')) },
    3: { y: 10.2, wallH: 3.4, wall: 'concrete2', wallTint: [0.78, 0.8, 0.8], floor: 'grating', floorTint: [0.6, 0.62, 0.65], ceil: 'metal', ceilTint: [0.75, 0.78, 0.8], lampPower: 0.75, rows: F[2].map((r) => r.join('')) },
  },
  stairs,
  ladders: [{ x: 8, y: 51, from: 'G', to: '2', back: [0, 1], off: [8, 52] }, { x: 55, y: 7, from: 'G', to: '2', back: [0, -1], off: [55, 6] }],
  start: { x: 31.5, y: 58, floor: 'G', yaw: 0 },
  extract: { x: 31.5, y: 57, floor: 'G' },
  vehicle: false,
  extra(kit) {
    const { box, level, CELL: C } = kit;
    // the wall: high, concrete, round the fence line (the gate left open)
    for (const [a, b, c, d] of [[2, 2, W - 2, 2.3], [2, H - 3, 30, H - 2.7], [34, H - 3, W - 2, H - 2.7], [2, 2, 2.3, H - 2], [W - 3, 2, W - 2.7, H - 2]]) box([a * C, 0, b * C], [c * C, 6, d * C], 'concrete2', { tint: [0.7, 0.7, 0.68] });
    // the towers: a boarded base, a cabin with windows round, its roof
    for (const [x, y] of [[8, 52], [55, 6]]) {
      const cx = (x + 0.5) * C, cz = (y + 0.5) * C;
      box([cx - C / 2, 0, cz - C / 2], [cx + C / 2, 6.6, cz + C / 2], 'concrete2', { tint: [0.65, 0.65, 0.63] });
      box([cx - C / 2 - 0.4, 9.6, cz - C / 2 - 0.4], [cx + C / 2 + 0.4, 9.8, cz + C / 2 + 0.4], 'metal', { solid: false, tint: [0.35, 0.36, 0.38] });
      level.lights.push({ pos: [cx, 9.4, cz], range: 14, intensity: 1.0, color: [1, 0.95, 0.85] });
      // its rail, open where the ladder comes up
      const h = C / 2, up = y === 52 ? -1 : 1, o = { tint: [0.35, 0.36, 0.38] };
      box([cx - h, 6.8, cz - h], [cx - h + 0.06, 7.85, cz + h], 'metal', o); box([cx + h - 0.06, 6.8, cz - h], [cx + h, 7.85, cz + h], 'metal', o);
      if (up < 0) box([cx - h, 6.8, cz + h - 0.06], [cx + h, 7.85, cz + h], 'metal', o); else box([cx - h, 6.8, cz - h], [cx + h, 7.85, cz - h + 0.06], 'metal', o);
    }
    // the hall's skylight
    box([20 * C, 13.6, 13 * C], [44 * C, 13.8, 39 * C], 'glass', { solid: false, tint: [0.8, 0.85, 0.9] });
    // the exercise yard's lines: a court marked out on the concrete
    for (const [a, b, c, d] of [[20, 48, 44, 48.1], [20, 55, 44, 55.1], [20, 48, 20.1, 55.1], [44, 48, 44.1, 55.1], [32, 48, 32.1, 55.1]]) box([a * C, 0.01, b * C], [c * C, 0.03, d * C], 'paint', { solid: false, tint: [0.9, 0.85, 0.4] });
    level.signs.push({ pos: [31.9 * C, 3.6, Y1 * C + C / 2 + 0.14], yaw: 0, w: 3.4, h: 0.6, text: 'A WING', sub: 'HMP Greyhallow', col: '#2a3340' });
  },
  zones: [
    { id: 'gov', label: 'A Wing - the governor\'s office', at: [13, 42, 50, 44], floor: '3' },
    { id: 'control', label: 'A Wing - the control room', at: [13, 42, 50, 44], floor: '1' },
    { id: 'staff', label: 'A Wing - the staff room', at: [13, 42, 50, 44], floor: '2' },
    { id: 'venn', label: 'A Wing - the top tier, Venn\'s cell', at: [48, 25, 50, 27], floor: '3' },
    { id: 't3', label: 'A Wing - the fourth tier', at: [X0, Y0, X1, Y1], floor: '3' },
    { id: 't2', label: 'A Wing - the third tier', at: [X0, Y0, X1, Y1], floor: '2' },
    { id: 't1', label: 'A Wing - the second tier', at: [X0, Y0, X1, Y1], floor: '1' },
    { id: 'hall', label: 'A Wing - the hall', at: [X0, Y0, X1, Y1] },
    { id: 'yard', label: 'HMP Greyhallow - the yard', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'gov', at: [33, 43, '3'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Governor Ashdown-Pryce', tint: [0.6, 0.62, 0.7] },
    { id: 'g3a', at: [18, 30, '3'], route: [[18, 19], [18, 38]], arms: 'carbine' },
    { id: 'g3b', at: [45, 20, '3'], route: [[45, 20], [45, 38]], arms: 'smg', temper: 'steady' },
    { id: 'g2a', at: [30, 25, '2'], route: [[21, 25], [42, 25]], arms: 'dmr', rank: 'specialist' },
    { id: 'g2b', at: [18, 36, '2'], arms: 'carbine' },
    { id: 'g1a', at: [45, 30, '1'], route: [[45, 20], [45, 38]], arms: 'carbine' },
    { id: 'c1', at: [27, 42, '1'], arms: 'smg', temper: 'steady' },
    { id: 'c2', at: [36, 44, '1'], arms: 'pistol', temper: 'cowardly' },
    { id: 'h1', at: [31, 22, 'G'], route: [[22, 15], [41, 15], [41, 37], [22, 37]], arms: 'carbine' },
    { id: 'h2', at: [26, 30, 'G'], arms: 'shotgun', temper: 'steady' },
    { id: 'l1', at: [36, 43, 'G'], arms: 'smg', role: 'radio' },                     // the lobby's radio
    { id: 'e1', at: [30, 43, '2'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },   // the wing's engineer, in the staff room
    { id: 'y1', at: [30, 51, 'G'], route: [[10, 50], [53, 50]], arms: 'carbine' },
    { id: 'tw1', at: [8, 52, '2'], arms: 'dmr', temper: 'steady' },
    { id: 'tw2', at: [55, 6, '2'], arms: 'dmr', temper: 'steady' },
    { id: 's2', at: [44, 43, '2'], arms: 'carbine' },
  ],
  hostages: [{ id: 'venn', name: 'Sergeant Venn', she: true, at: [49, 26, '3'] }],
  // (hacking and control) A Wing's security: cameras over the hall, the first tier's galleries and the
  // entrance, a turret covering the lobby - one network, run from the security terminal in the control room
  devices: [
    { id: 'c-hall-nw', kind: 'camera', at: [20, 13, 'G'], face: [1, 1], net: 'awing' },
    { id: 'c-hall-se', kind: 'camera', at: [43, 38, 'G'], face: [-1, -1], net: 'awing' },
    { id: 'c-tier-w', kind: 'camera', at: [18, 13, '1'], face: [0, 1], net: 'awing' },
    { id: 'c-tier-e', kind: 'camera', at: [45, 38, '1'], face: [0, -1], net: 'awing' },
    { id: 'c-lobby', kind: 'camera', at: [20, 42, 'G'], face: [1, 0], net: 'awing' },
    { id: 't-lobby', kind: 'turret', at: [47, 43, 'G'], face: [-1, 0], net: 'awing' },
    // (M6.28) the control room's door maglocked; the hall's lights; the wing's alarm
    { id: 'm-control', kind: 'lock', at: [31, 41, '1'], net: 'awing' },
    { id: 'l-hall', kind: 'lights', at: [21, 40, 'G'], face: [0, -1], area: [20, 13, 43, 38], name: 'the hall', net: 'awing' },
    { id: 'a-bell', kind: 'alarm', at: [33, 40, 'G'], face: [0, -1], net: 'awing' },
    { id: 'z-lobby', kind: 'laser', at: [28, 42, 'G'], to: [28, 44], net: 'awing' },     // a tripwire across the lobby
  ],
  terminals: [{ id: 'sec', name: 'the security terminal', at: [40, 43, '1'], face: [0, -1], time: 6, net: 'awing' },
    { id: 'control', name: 'the control desk', at: [33, 42, '1'], face: [0, -1], time: 7, reveal: 30,
    said: 'The control desk: every cell door on A Wing unlocks with a crash of bolts - and the wing\'s cameras put every red on your radar for 30 seconds.' }],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'control', text: 'Hack the control desk (the control room, the second tier, south)' },
    { id: 'o2', kind: 'rescue', ref: 'venn', text: 'Bring Sergeant Venn out (the top tier, east gallery)' },
    { id: 'o3', kind: 'kill', ref: 'gov', text: 'Stop the governor (his office, the top tier, south)', optional: true },
  ],
};
