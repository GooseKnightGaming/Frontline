// FRONTLINE - Level 33, the Space Port (first draft). From Rhys's location boards (part 2):
// "Space Port / small orbital station - exteriors, interiors, props and equipment". The Teskel launch
// complex on the coast: Pad 2 - the rocket on it, the gantry beside it (its platforms up ladders, to the
// payload at the top), the flame trench under it; mission control in its blast-proof blockhouse; the
// assembly hangar with a spaceplane in it. The reds have bought the launch: tonight their satellite goes up
// on it - with what it carries.
//
// The payload's arming unit is at the top of the gantry: pull it and the launch is dead. A square is 3 m.
const CELL = 3, W = 70, H = 60;
const grid = () => Array.from({ length: H }, () => new Array(W).fill(' '));
const G = grid(), P1 = grid(), P2 = grid(), P3 = grid(), MC = grid();
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const ring = (g, x0, y0, x1, y1, ch) => { for (let x = x0; x <= x1; x++) { put(g, x, y0, ch); put(g, x, y1, ch); } for (let y = y0; y <= y1; y++) { put(g, x0, y, ch); put(g, x1, y, ch); } };
let sd = 71; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;

// ── Pad 2 (north-east): the pad's concrete, the rocket on it (solid), the flame trench; the gantry beside it
const RX = 50, RY = 14;                                                     // the rocket's square (2 x 2)
fill(G, 42, 6, 60, 24, 'p');
fill(G, RX, RY, RX + 1, RY + 1, 'J');
fill(G, RX - 4, RY, RX - 2, RY + 2, 'J');                                   // the gantry's base, west of the rocket
// the gantry's platforms (8, 16, 24 m): each a deck round its tower, an arm out to the rocket
for (const g of [P1, P2, P3]) { fill(g, RX - 5, RY - 1, RX - 1, RY + 3, '.'); fill(g, RX - 4, RY, RX - 2, RY + 2, 'J'); }
fill(P3, RX - 1, RY, RX - 1, RY + 1, '.');                                   // the top platform's arm to the payload
// ── mission control (west): the blockhouse - its control room, the director's office; and a mezzanine (MC)
// over the control room's back, the viewing gallery
ring(G, 6, 8, 24, 22, '#'); fill(G, 7, 9, 23, 21, '.');
for (let y = 9; y <= 21; y++) put(G, 18, y, '#'); put(G, 18, 12, 'D'); put(G, 18, 18, 'D');
for (let x = 19; x <= 23; x++) put(G, x, 15, '#'); put(G, 21, 15, 'D');
for (const y of [11, 14, 17]) fill(G, 9, y, 15, y, 'M');                   // the rows of consoles
put(G, 15, 22, 'D'); put(G, 16, 22, 'D'); put(G, 24, 12, 'D');
put(G, 21, 11, 'T'); put(G, 22, 19, 'H'); put(G, 20, 19, 'T');
fill(MC, 6, 8, 18, 22, ' '); ring(MC, 6, 8, 18, 22, '#'); fill(MC, 7, 19, 17, 21, '.'); fill(MC, 7, 9, 17, 18, 'O');
for (let x = 7; x <= 17; x++) put(MC, x, 18, 'q');
// ── the assembly hangar (south): the spaceplane on its cradle, crates, the crawler parked outside
ring(G, 8, 32, 40, 52, '#'); fill(G, 9, 33, 39, 51, '.');
for (let x = 18; x <= 30; x++) put(G, x, 32, 'L');                          // its great door (locked; there are side doors)
for (let x = 18; x <= 30; x++) put(G, x, 32, '#'); put(G, 12, 32, 'D'); put(G, 36, 32, 'D'); put(G, 40, 42, 'D');
fill(G, 18, 38, 30, 46, 'J');                                               // the spaceplane, on its cradle
for (const [x, y] of [[10, 34], [11, 34], [10, 35], [38, 48], [38, 49], [37, 49], [12, 49]]) put(G, x, y, 'C');
for (const [x, y] of [[10, 44], [10, 46], [37, 36]]) put(G, x, y, 'M');
// roads between them; floodlights; the coast (east edge) beyond
for (let x = 0; x < W; x++) for (const y of [27, 28]) if (G[y][x] === ' ') put(G, x, y, 'k');
for (let y = 0; y < 27; y++) for (const x of [32, 33]) if (G[y][x] === ' ') put(G, x, y, 'k');
for (let i = 0; i < 26; i++) { const x = Math.floor(rnd() * W), y = Math.floor(rnd() * H); if (G[y][x] === ' ' && (x < 4 || x > 62 || y > 54)) put(G, x, y, 'h'); }

const stairs = [{ x: 8, y: 21, dir: 'E', len: 4, w: 1, from: 'G', to: 'MC' }];
// the gantry's ladders: up the tower's south face to the first platform, the west face to the second, the north to the top
const ladders = [
  { x: RX - 3, y: RY + 3, from: 'G', to: 'P1', back: [0, -1], off: [RX - 2, RY + 3] },
  { x: RX - 5, y: RY + 1, from: 'P1', to: 'P2', back: [1, 0], off: [RX - 5, RY] },
  { x: RX - 3, y: RY - 1, from: 'P2', to: 'P3', back: [0, 1], off: [RX - 2, RY - 1] },
];

export default {
  id: 'spaceport', no: 33, title: 'The Space Port', place: 'Teskel launch complex', cell: CELL, windows: false,
  where: 'The Teskel launch complex, Pad 2. 21:10 - the count is running.',
  brief: [
    ['The place', '<b>Pad 2</b> (north-east): the rocket on it; the <b>gantry</b> beside it, its platforms at 8, 16 and 24 metres up a ladders up its faces; the arm from the top platform to the payload. <b>Mission control</b> (west): the control room and its rows of consoles, the director\'s office, a viewing gallery over the back of the room. The <b>assembly hangar</b> (south), a spaceplane in it.'],
    ['The launch', 'The reds have bought tonight\'s launch: their satellite goes up on it, carrying what it should not. Its <b>arming unit</b> is in the payload, at the top of the gantry - pull it and the launch is dead.'],
    ['Security', 'Two <b>turrets</b> cover the pad\'s approach from the road; <b>cameras</b> watch mission control and the hangar; the director\'s office is <b>maglocked</b>; the blockhouse\'s <b>lights</b> and its <b>alarm</b> are on the same network. The <b>range-safety console</b>, in the room behind the control room, runs them all - and you are issued a <b>hacking kit</b>. The man by the big screen carries the <b>radio</b>; the hangar has an <b>engineer</b> who will put a hacked system back on.'],
    ['Objectives', '<b>Pull the arming unit</b> (the gantry\'s top platform). Take the <b>flight program</b> - the satellite\'s orders - from the director\'s office in mission control. Optionally, stop <b>Director Halvorsen</b>.'],
  ],
  time: { date: [29, 10, 2026], hour: 21, minute: 10 }, faction: 'red', night: true, requires: 'HACKKIT',
  atmos: { fog: [0.08, 0.1, 0.16, 60, 420], ambient: [0.26, 0.28, 0.36] },
  startLoadout: { primary: 'K7', backup: 'PX9', utility1: 'FRAG', utility2: 'SMOKE', gear: 'LENSES' },
  extractName: 'the coast road, west', navCap: 120000, testNavCap: 600000, chaseMax: 70,
  outside: { backdrop: 'hills', mat: 'concrete', tint: [0.7, 0.72, 0.72], margin: 14 },
  decals: { p: { mat: 'concrete2', tint: [0.75, 0.75, 0.73] }, k: { mat: 'asphalt' } },
  legend: {
    q(k2, x, y, f) { const [cx, cy, cz] = k2.at(x, y, f), h = k2.CELL / 2; k2.box([cx - h, cy, cz - 0.04], [cx + h, cy + 1.05, cz + 0.04], 'metal', { tint: [0.6, 0.62, 0.65], shootThrough: true }); },
  },
  floors: {
    G: { y: 0, wallH: 4.5, wall: 'concrete2', wallTint: [0.78, 0.8, 0.8], floor: 'concrete', floorTint: [0.7, 0.72, 0.72], ceil: 'metal', lampPower: 0.75, lampColour: [0.9, 0.95, 1], noRoof: [[9, 33, 39, 51], [7, 9, 17, 18]], rows: G.map((r) => r.join('')) },
    MC: { y: 4.8, wallH: 3.0, wall: 'concrete2', wallTint: [0.78, 0.8, 0.8], floor: 'grating', ceil: 'metal', lampPower: 0.6, rows: MC.map((r) => r.join('')) },
    P1: { y: 8.0, wallH: 1.2, roof: false, lamps: false, floor: 'grating', floorTint: [0.6, 0.5, 0.35], slab: 0.25, rows: P1.map((r) => r.join('')) },
    P2: { y: 16.0, wallH: 1.2, roof: false, lamps: false, floor: 'grating', floorTint: [0.6, 0.5, 0.35], slab: 0.25, rows: P2.map((r) => r.join('')) },
    P3: { y: 24.0, wallH: 1.2, roof: false, lamps: false, floor: 'grating', floorTint: [0.6, 0.5, 0.35], slab: 0.25, rows: P3.map((r) => r.join('')) },
  },
  stairs, ladders,
  start: { x: 1, y: 27.5, floor: 'G', yaw: -Math.PI / 2 },
  extract: { x: 2, y: 27.5, floor: 'G' },
  extra(kit) {
    const { box, level, CELL: C } = kit;
    // the rocket: stages, white, black bands, its nose; the flame trench in front of the pad
    const rx = (RX + 1) * C, rz = (RY + 1) * C;
    box([rx - 2.4, 0, rz - 2.4], [rx + 2.4, 1.0, rz + 2.4], 'metal', { tint: [0.35, 0.35, 0.36] });
    box([rx - 2.0, 1.0, rz - 2.0], [rx + 2.0, 30, rz + 2.0], 'paint', { tint: [0.92, 0.92, 0.9] });
    for (const h of [10, 20]) box([rx - 2.05, h, rz - 2.05], [rx + 2.05, h + 0.8, rz + 2.05], 'paint', { solid: false, tint: [0.1, 0.1, 0.1] });
    box([rx - 2.2, 23.5, rz - 2.2], [rx + 2.2, 30, rz + 2.2], 'paint', { tint: [0.9, 0.9, 0.88] });          // the payload fairing
    box([rx - 1.4, 30, rz - 1.4], [rx + 1.4, 33, rz + 1.4], 'paint', { tint: [0.9, 0.9, 0.88] });
    box([rx - 0.6, 33, rz - 0.6], [rx + 0.6, 35, rz + 0.6], 'paint', { tint: [0.85, 0.85, 0.83] });
    for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) box([rx + a * 2.0 - (a ? 0.1 : 0.9), 1.0, rz + b * 2.0 - (b ? 0.1 : 0.9)], [rx + a * 2.0 + (a ? 0.6 * a + 0.1 : 0.9), 5, rz + b * 2.0 + (b ? 0.6 * b + 0.1 : 0.9)], 'paint', { tint: [0.2, 0.2, 0.22] });
    level.lights.push({ pos: [rx, 12, rz + 6], range: 24, intensity: 1.6, color: [0.9, 0.95, 1], street: true });
    // the gantry: its tower (lattice, solid at its core), from the ground to the top platform and on above
    const gx0 = (RX - 4) * C, gz0 = RY * C, gx1 = (RX - 1) * C, gz1 = (RY + 3) * C;
    box([gx0 + 0.4, 0, gz0 + 0.4], [gx1 - 0.4, 30, gz1 - 0.4], 'grating', { tint: [0.65, 0.35, 0.15] });
    for (let h = 2; h < 30; h += 4) box([gx0, h, gz0], [gx1, h + 0.2, gz1], 'metal', { solid: false, tint: [0.6, 0.32, 0.14] });
    // the platforms' rails (open at the ladder, and along the arm)
    for (const y0 of [8, 16, 24]) {
      const x0 = (RX - 5) * C, x1 = RX * C, z0 = (RY - 1) * C, z1 = (RY + 4) * C, o = { tint: [0.8, 0.6, 0.15] };
      box([x0, y0, z0], [x1, y0 + 1.05, z0 + 0.06], 'metal', o);
      box([x0, y0, z0], [x0 + 0.06, y0 + 1.05, z1], 'metal', o);
      if (y0 === 8) { box([x0, y0, z1 - 0.06], [(RX - 3) * C, y0 + 1.05, z1], 'metal', o); box([(RX - 2) * C, y0, z1 - 0.06], [x1, y0 + 1.05, z1], 'metal', o); }
      else box([x0, y0, z1 - 0.06], [x1, y0 + 1.05, z1], 'metal', o);
      if (y0 < 24) box([x1 - 0.06, y0, z0], [x1, y0 + 1.05, z1], 'metal', o);
      else { box([x1 - 0.06, y0, z0], [x1, y0 + 1.05, RY * C], 'metal', o); box([x1 - 0.06, y0, (RY + 2) * C], [x1, y0 + 1.05, z1], 'metal', o); }
    }
    // the flame trench, a concrete channel down from the pad
    box([(RX - 1) * C, -0.05, (RY + 3) * C], [(RX + 3) * C, 0.02, (RY + 9) * C], 'concrete2', { solid: false, tint: [0.25, 0.25, 0.26] });
    // the spaceplane in the hangar: its fuselage, delta wings, fin
    const sx = 24.5 * C, sz = 42.5 * C;
    box([sx - 1.6, 1.2, sz - 12], [sx + 1.6, 4.4, sz + 12], 'paint', { tint: [0.9, 0.9, 0.9] });
    box([sx - 10, 1.4, sz - 2], [sx + 10, 1.8, sz + 11], 'paint', { tint: [0.25, 0.25, 0.27] });
    box([sx - 0.2, 4.4, sz + 6], [sx + 0.2, 9.5, sz + 12], 'paint', { tint: [0.9, 0.9, 0.9] });
    box([sx - 1.2, 0, sz - 8], [sx + 1.2, 1.2, sz + 8], 'metal', { tint: [0.35, 0.35, 0.38] });
    box([8 * C, 9.0, 32 * C], [41 * C, 9.4, 53 * C], 'metal', { tint: [0.45, 0.47, 0.5] });               // the hangar's roof
    box([8 * C, 4.5, 32 * C], [41 * C, 9.0, 32 * C + 0.25], 'metal', { tint: [0.6, 0.62, 0.65] });
    box([8 * C, 4.5, 53 * C - 0.25], [41 * C, 9.0, 53 * C], 'metal', { tint: [0.6, 0.62, 0.65] });
    box([8 * C, 4.5, 32 * C], [8 * C + 0.25, 9.0, 53 * C], 'metal', { tint: [0.6, 0.62, 0.65] });
    box([41 * C - 0.25, 4.5, 32 * C], [41 * C, 9.0, 53 * C], 'metal', { tint: [0.6, 0.62, 0.65] });
    for (const [x, z] of [[16, 40], [32, 40], [16, 48], [32, 48]]) { level.lights.push({ pos: [x * C, 8.4, z * C], range: 20, intensity: 1.1, color: [0.92, 0.95, 1] }); box([x * C - 1, 8.8, z * C - 0.3], [x * C + 1, 9.0, z * C + 0.3], 'lamp', { solid: false }); }
    // the big screen in mission control; the floodlight masts round the pad
    level.signs.push({ pos: [12 * C, 3.0, 9 * C + 0.12], yaw: 0, w: 9, h: 2.2, text: 'T - 00:41:12', sub: 'TESKEL 2  -  PAYLOAD ARMED', col: '#0a1a2a' });
    for (const [x, y] of [[42, 6], [60, 6], [42, 24], [60, 24]]) { box([x * C - 0.2, 0, y * C - 0.2], [x * C + 0.2, 20, y * C + 0.2], 'metal', { tint: [0.5, 0.5, 0.52] }); level.lights.push({ pos: [x * C, 19.5, y * C], range: 30, intensity: 1.2, color: [1, 0.95, 0.85], street: true }); }
    level.signs.push({ pos: [24 * C + 0.4, 3.4, 12 * C], yaw: Math.PI / 2, w: 3.2, h: 0.6, text: 'MISSION CONTROL', sub: 'Teskel', col: '#1d2a40' });
  },
  zones: [
    { id: 'top', label: 'Pad 2 - the gantry\'s top platform', at: [RX - 5, RY - 1, RX - 1, RY + 3], floor: 'P3' },
    { id: 'p2', label: 'Pad 2 - the gantry, 16 metres', at: [RX - 5, RY - 1, RX - 1, RY + 3], floor: 'P2' },
    { id: 'p1', label: 'Pad 2 - the gantry, 8 metres', at: [RX - 5, RY - 1, RX - 1, RY + 3], floor: 'P1' },
    { id: 'gallery', label: 'Mission control - the viewing gallery', at: [6, 8, 18, 22], floor: 'MC' },
    { id: 'office', label: 'Mission control - the director\'s office', at: [19, 9, 23, 14] },
    { id: 'mc', label: 'Mission control', at: [6, 8, 24, 22] },
    { id: 'hangar', label: 'Teskel - the assembly hangar', at: [8, 32, 40, 52] },
    { id: 'pad', label: 'Teskel - Pad 2', at: [40, 4, 62, 26] },
    { id: 'all', label: 'The Teskel launch complex', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'halvorsen', at: [21, 12, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Director Halvorsen', tint: [0.9, 0.95, 1.05] },
    { id: 'm1', at: [12, 13, 'G'], arms: 'smg', role: 'radio' },
    { id: 'm2', at: [16, 19, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'm3', at: [12, 20, 'MC'], arms: 'dmr', rank: 'specialist' },
    { id: 'm4', at: [21, 18, 'G'], arms: 'shotgun' },
    { id: 'p1', at: [RX - 3, RY - 1, 'P1'], arms: 'carbine' },
    { id: 'p2', at: [RX - 5, RY + 2, 'P2'], arms: 'smg', temper: 'steady' },
    { id: 'p3', at: [RX - 4, RY - 1, 'P3'], arms: 'carbine', rank: 'sergeant', temper: 'steady' },
    { id: 'pad1', at: [45, 20, 'G'], route: [[44, 8], [44, 22], [58, 22], [58, 8]], arms: 'carbine' },
    { id: 'pad2', at: [56, 10, 'G'], arms: 'lmg', temper: 'steady' },
    { id: 'h1', at: [14, 40, 'G'], route: [[12, 36], [12, 50], [36, 50], [36, 36]], arms: 'smg' },
    { id: 'h2', at: [34, 44, 'G'], arms: 'carbine', role: 'engineer', temper: 'cowardly' },
    { id: 'r1', at: [30, 27, 'G'], route: [[4, 27], [60, 27]], arms: 'carbine' },
    { id: 'r2', at: [32, 14, 'G'], route: [[32, 2], [32, 26]], arms: 'dmr', temper: 'steady' },
  ],
  // (M6.28, hacking and control) the complex's security, all on one network: two turrets guarding the pad's
  // approach, cameras in mission control and the hangar, the director's office maglocked, the blockhouse's
  // lights, its alarm - run from the range-safety console in the back room
  devices: [
    { id: 't-pad-n', kind: 'turret', at: [43, 9, 'G'], face: [-1, 0], net: 'teskel' },
    { id: 't-pad-s', kind: 'turret', at: [43, 21, 'G'], face: [-1, 0], net: 'teskel' },
    { id: 'c-mc', kind: 'camera', at: [7, 9, 'G'], face: [1, 1], net: 'teskel' },
    { id: 'c-mc-s', kind: 'camera', at: [17, 21, 'G'], face: [-1, -1], net: 'teskel' },
    { id: 'c-hangar', kind: 'camera', at: [9, 33, 'G'], face: [1, 1], net: 'teskel' },
    { id: 'm-office-w', kind: 'lock', at: [18, 12, 'G'], net: 'teskel' },
    { id: 'm-office-s', kind: 'lock', at: [21, 15, 'G'], net: 'teskel' },
    { id: 'l-mc', kind: 'lights', at: [17, 10, 'G'], face: [-1, 0], area: [7, 9, 17, 21], name: 'mission control', net: 'teskel' },
    { id: 'a-mc', kind: 'alarm', at: [12, 21, 'G'], face: [0, -1], net: 'teskel' },
  ],
  pickups: [{ id: 'program', name: 'The flight program', what: 'the program', at: [22, 11, 'G'], h: 0.9, colour: [0.3, 0.9, 0.7] }],
  terminals: [{ id: 'sec', name: 'the range-safety console', at: [22, 17, 'G'], face: [0, 1], time: 6, net: 'teskel' },
    { id: 'arming', name: 'the payload\'s arming unit', at: [RX - 1, RY + 1, 'P3'], face: [1, 0], time: 7, reveal: 20, verb: 'Pull', doing: 'Pulling',
    said: 'The arming unit comes out of the payload in your hands - the count stops at T-38 minutes, and the pad\'s cameras put every red on your radar for 20 seconds.' }],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'arming', text: 'Pull the arming unit (the gantry\'s top platform)' },
    { id: 'o2', kind: 'take', ref: 'program', text: 'Take the flight program (the director\'s office, mission control)' },
    { id: 'o3', kind: 'kill', ref: 'halvorsen', text: 'Stop Director Halvorsen', optional: true },
  ],
};
