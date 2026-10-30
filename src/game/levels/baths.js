// FRONTLINE - Level 25, the Swimming Baths (M6.20.4, first draft). From Rhys's location boards (M6.8.1):
// "Swimming Baths - pool area, changing rooms, pool equipment". The Corporation Baths, Varnholm: the big
// pool under its glass roof, the diving board at the deep end, the spectators' gallery down one side; the
// changing rooms, the reception; the manager's office upstairs; the plant room underneath. Closed for the
// night - a red cell uses it as a drop: things go into the plant room's filter house, and out again.
//
// Water: the pool is deep (over your head at the deep end - watch your breath). Climb out up its ladders.
// A square is 1.5 m.
const CELL = 1.5, W = 46, H = 42;
const grid = () => Array.from({ length: H }, () => new Array(W).fill(' '));
const G = grid(), F1 = grid(), B = grid(), D = grid();
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const ring = (g, x0, y0, x1, y1, ch) => { for (let x = x0; x <= x1; x++) { put(g, x, y0, ch); put(g, x, y1, ch); } for (let y = y0; y <= y1; y++) { put(g, x0, y, ch); put(g, x1, y, ch); } };

// ── G ──
ring(G, 2, 2, 43, 38, '#'); fill(G, 3, 3, 42, 37, '.');
// the pool hall (x 17-42): the pool itself, a learner pool beside it
fill(G, 20, 6, 35, 33, '~');
fill(G, 38, 20, 41, 26, '~');
for (let y = 3; y <= 37; y++) put(G, 16, y, '#');
for (const y of [8, 9, 22, 23]) put(G, 16, y, 'D');                       // from the changing rooms
for (const y of [6, 12, 18, 24, 30, 36]) put(G, 43, y, 'W');
for (let x = 17; x <= 42; x += 4) put(G, x, 2, 'W');
// the changing rooms (x 3-15, y 3-27): men's north, women's south, lockers, cubicles, showers
for (let x = 3; x <= 15; x++) { put(G, x, 15, '#'); put(G, x, 28, '#'); }
put(G, 9, 28, 'D'); put(G, 10, 28, 'D'); put(G, 5, 15, 'D');
for (const y of [5, 7, 11, 13]) for (let x = 4; x <= 9; x++) put(G, x, y, 'H');
for (const y of [18, 20, 24, 26]) for (let x = 4; x <= 9; x++) put(G, x, y, 'H');
for (let y = 3; y <= 27; y++) if (y !== 15) put(G, 12, y, '#');
for (const y of [9, 22]) put(G, 12, y, 'D');
put(G, 14, 4, 'T'); put(G, 14, 26, 'T');
// reception (x 3-15, y 29-37): the desk, the turnstiles, the cafe tables; the front doors
fill(G, 5, 31, 9, 31, 'K'); put(G, 12, 33, 'T'); put(G, 14, 35, 'T');
put(G, 2, 33, 'D'); put(G, 2, 34, 'D');
for (let y = 29; y <= 37; y++) put(G, 16, y, '#'); put(G, 16, 32, 'D');
// the poolside: benches, lifeguard's chair, a stack of floats (crates), the first-aid post
for (const [x, y] of [[18, 10], [18, 20], [18, 30]]) put(G, x, y, 'Z');
put(G, 37, 16, 'M'); put(G, 40, 6, 'C'); put(G, 41, 6, 'C'); put(G, 40, 30, 'T');
// ── the diving board's platform (D, 3.5 m): out over the deep end from the north wall, up a ladder
fill(D, 27, 3, 28, 7, '.');
// ── 1: the spectators' gallery (east, over the poolside) and the manager's office (over reception)
ring(F1, 2, 2, 43, 38, '#');
fill(F1, 37, 3, 42, 37, '.');
for (let y = 3; y <= 37; y++) put(F1, 36, y, 'a');
for (let y = 4; y <= 36; y += 2) for (const x of [39, 41]) put(F1, x, y, 's');
for (let y = 3; y <= 37; y++) for (let x = 3; x <= 35; x++) put(F1, x, y, y >= 29 && x <= 15 ? '.' : ' ');
for (let x = 3; x <= 16; x++) put(F1, x, 28, '#'); for (let y = 28; y <= 38; y++) put(F1, 16, y, '#');
put(F1, 16, 31, 'W'); put(F1, 16, 34, 'W');                                // the office looks out over the pool
put(F1, 8, 33, 'T'); put(F1, 4, 36, 'H'); put(F1, 12, 36, 'Z');
// the gallery is a separate room: its own wall along the pool side is the rail ('='), so close its ends
// ── B: the plant room, under the changing rooms: the filter tanks, the pumps, the chlorine store
ring(B, 3, 3, 15, 20, '#'); fill(B, 4, 4, 14, 19, '.');
for (const [x, y] of [[6, 6], [6, 9], [6, 12], [10, 6], [10, 9]]) put(B, x, y, 'M');
for (let x = 4; x <= 14; x++) put(B, x, 15, '#'); put(B, 9, 15, 'D');
for (const [x, y] of [[5, 17], [6, 17], [5, 18]]) put(B, x, y, 'B');


const stairs = [
  { x: 13, y: 12, dir: 'N', len: 4, w: 2, from: 'B', to: 'G' },           // down from the men's changing room
  { x: 38, y: 36, dir: 'N', len: 5, w: 2, from: 'G', to: '1' },           // up to the gallery
  { x: 14, y: 36, dir: 'N', len: 5, w: 1, from: 'G', to: '1' },           // up to the office, from reception
];
const ladders = [{ x: 27, y: 3, from: 'G', to: 'D', back: [0, -1], off: [27, 4] }];

export default {
  id: 'baths', no: 25, title: 'The Swimming Baths', place: 'the Corporation Baths', cell: CELL,
  where: 'The Corporation Baths, Varnholm. 23:30, closed for the night.',
  brief: [
    ['The place', 'The big pool under its glass roof, the learner pool in the corner, the three-metre diving board out over the deep end (up a ladder from the north wall); the spectators\' gallery along the east side, up the stairs at its south end. The changing rooms on the west - lockers, cubicles - and reception south of them. The manager\'s office over reception, its windows on the pool. The plant room underneath: the stairs go down from the men\'s changing room.'],
    ['The drop', 'A red cell uses the baths after dark: what they move goes into the plant room\'s filter house, and out again. Tonight it is a <b>hard drive</b>. Their leader, <b>Teague</b>, waits in the manager\'s office.'],
    ['Objectives', 'Take the <b>drive</b> from the plant room. Stop <b>Teague</b>. Optionally, bring out <b>Ms Lund</b>, the night attendant - they have her in the women\'s changing room.'],
    ['Water', 'The deep end is over your head: watch your breath under water. The pool has ladders up its sides.'],
  ],
  time: { date: [4, 10, 2026], hour: 23, minute: 30 }, faction: 'red', night: true,
  atmos: { water: [0.35, 0.72, 0.88, 0.06, 0.2, 0.26], ambient: [0.32, 0.36, 0.42] },
  extractName: 'the front doors', navCap: 120000,
  outside: { backdrop: 'city', mat: 'asphalt', margin: 16 },
  legend: {
    // the gallery's front: a parapet along it (north-south), a rail on top
    a(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - 0.1, cy, cz - h], [cx + 0.1, cy + 1.05, cz + h], 'pooltile', { tint: [0.85, 0.92, 0.95] }); },
    s(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - 0.3, cy, cz - h], [cx + 0.25, cy + 0.45, cz + h], 'paint', { tint: [0.2, 0.35, 0.6] }); k.box([cx + 0.2, cy + 0.45, cz - h], [cx + 0.32, cy + 0.9, cz + h], 'paint', { tint: [0.18, 0.32, 0.55] }); },
  },
  floors: {
    B: { y: -4.0, wallH: 3.4, wall: 'concrete2', floor: 'concrete', ceil: 'concrete2', lampPower: 0.5, lampColour: [0.9, 1, 0.9], rows: B.map((r) => r.join('')) },
    G: { y: 0, wallH: 7.5, wall: 'pooltile', wallTint: [0.85, 0.92, 0.95], floor: 'pooltile', floorTint: [0.8, 0.88, 0.92], ceil: 'metal', ceilTint: [0.8, 0.85, 0.9], lampPower: 0.85, lampColour: [0.9, 0.95, 1], lampEvery: 7, channel: 2.4, surf: 0.15, bedMat: 'pooltile', windows: false, rows: G.map((r) => r.join('')) },
    D: { y: 3.0, wallH: 1.0, roof: false, lamps: false, floor: 'wood', floorTint: [0.9, 0.9, 0.85], slab: 0.25, rows: D.map((r) => r.join('')) },
    1: { y: 4.6, wallH: 2.9, wall: 'pooltile', wallTint: [0.85, 0.92, 0.95], floor: 'concrete2', ceil: 'metal', lampPower: 0.7, roof: false, lamps: false, rows: F1.map((r) => r.join('')) },
  },
  stairs, ladders,
  start: { x: 0, y: 33, floor: 'G', yaw: -Math.PI / 2 },
  extract: { x: 0, y: 34, floor: 'G' },
  extra(kit) {
    const { box, level, CELL: C } = kit;
    // the lane ropes, red and white floats on the water
    for (let x = 23; x <= 33; x += 3) box([x * C - 0.05, -0.17, 6 * C], [x * C + 0.05, -0.08, 34 * C], 'paint', { solid: false, tint: [0.85, 0.2, 0.15] });
    // the diving board's rail, its end over the water
    box([27 * C - 0.05, 3.0, 3 * C], [27 * C + 0.03, 4.0, 8 * C], 'metal', { solid: false, tint: [0.7, 0.72, 0.75] });
    box([29 * C - 0.03, 3.0, 3 * C], [29 * C + 0.05, 4.0, 8 * C], 'metal', { solid: false, tint: [0.7, 0.72, 0.75] });
    
    // the glass roof's ribs over the pool hall
    for (let z = 3; z <= 37; z += 4) box([17 * C, 7.3, z * C], [43 * C, 7.5, z * C + 0.2], 'metal', { solid: false, tint: [0.5, 0.52, 0.55] });
    // the gallery's front: a glass screen above its rail
    box([36.5 * C - 0.05, 5.65, 3 * C], [36.5 * C + 0.05, 6.6, 38 * C], 'glass', { solid: false });
    // the office's ceiling (the gallery and the office are roofed by the hall)
    box([3 * C, 7.3, 29 * C], [16 * C, 7.5, 38 * C], 'plaster');
    box([36 * C, 7.5, 2 * C], [43 * C, 7.75, 39 * C], 'metal', { tint: [0.8, 0.85, 0.9] });       // and the hall's roof over the gallery
    level.lights.push({ pos: [9 * C, 7.0, 33 * C], range: 10, intensity: 0.9, color: [1, 0.9, 0.75] });
    // the clock and the depth markings
    level.signs.push({ pos: [30 * C, 5.2, 3 * C + 0.12], yaw: 0, w: 1.4, h: 1.4, text: '11:30', sub: '', col: '#1a1a1a' });
    level.signs.push({ pos: [19.6 * C, 0.6, 7 * C], yaw: -Math.PI / 2, w: 1.2, h: 0.4, text: '2.4 m', sub: 'deep end', col: '#244a7a' });
    level.signs.push({ pos: [2 * C - 0.12, 2.6, 33.5 * C], yaw: Math.PI / 2, w: 3.4, h: 0.6, text: 'CORPORATION BATHS', sub: 'closed', col: '#1f4a6a' });
  },
  zones: [
    { id: 'plant', label: 'The Baths - the plant room', at: [3, 3, 15, 20], floor: 'B' },
    { id: 'office', label: 'The Baths - the manager\'s office', at: [3, 29, 15, 37], floor: '1' },
    { id: 'gallery', label: 'The Baths - the gallery', at: [37, 3, 42, 37], floor: '1' },
    { id: 'board', label: 'The Baths - the diving board', at: [27, 3, 28, 7], floor: 'D' },
    { id: 'men', label: 'The Baths - the men\'s changing room', at: [3, 3, 15, 14] },
    { id: 'women', label: 'The Baths - the women\'s changing room', at: [3, 16, 15, 27] },
    { id: 'reception', label: 'The Baths - reception', at: [3, 29, 15, 37] },
    { id: 'pool', label: 'The Baths - the pool', at: [17, 3, 42, 37] },
  ],
  guards: [
    { id: 'teague', at: [10, 32, '1'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'Teague' },
    { id: 'o1', at: [6, 35, '1'], arms: 'smg' },
    { id: 'p1', at: [24, 4, 'G'], route: [[18, 4], [41, 4]], arms: 'carbine' },
    { id: 'p2', at: [18, 25, 'G'], route: [[18, 5], [18, 35]], arms: 'smg' },
    { id: 'p3', at: [37, 10, 'G'], route: [[37, 4], [37, 26]], arms: 'carbine' },
    { id: 'gl1', at: [40, 15, '1'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'gl2', at: [38, 30, '1'], arms: 'carbine' },
    { id: 'c1', at: [8, 9, 'G'], arms: 'shotgun' },
    { id: 'c2', at: [14, 20, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'r1', at: [11, 35, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'b1', at: [9, 10, 'B'], arms: 'carbine', temper: 'steady' },
    { id: 'b2', at: [11, 17, 'B'], arms: 'smg' },
  ],
  hostages: [{ id: 'lund', name: 'Ms Lund', she: true, at: [5, 22, 'G'] }],
  pickups: [{ id: 'drive', name: 'The hard drive', what: 'the drive', at: [12, 18, 'B'], colour: [0.3, 0.75, 0.95] }],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'drive', text: 'Take the drive (the plant room, underneath)' },
    { id: 'o2', kind: 'kill', ref: 'teague', text: 'Stop Teague (the manager\'s office, upstairs)' },
    { id: 'o3', kind: 'rescue', ref: 'lund', text: 'Bring Ms Lund out (the women\'s changing room)', optional: true },
  ],
};
