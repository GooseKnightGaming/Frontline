// FRONTLINE - Level 26, the Ancient Temple (first draft). From Rhys's location boards:
// "Abandoned Ancient Temple - ruins and statues, archaeological props". The temple of Ix Tolun, in the
// jungle: a stepped pyramid - its Hall of Pillars inside, the sanctum behind a stone door, the tomb under it,
// the shrine on its top - and the overgrown court round it. A ring of looters (the reds) is stripping it,
// with an archaeologist they took to read it for them.
//
// The stone door: nothing you carry opens it. The glyph wheel in the shrine on the top does (hold E to turn
// it). A square is 2 m.
const CELL = 2, W = 60, H = 62;
const grid = () => Array.from({ length: H }, () => new Array(W).fill(' '));
const G = grid(), T1 = grid(), T2 = grid(), B = grid();
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const ring = (g, x0, y0, x1, y1, ch) => { for (let x = x0; x <= x1; x++) { put(g, x, y0, ch); put(g, x, y1, ch); } for (let y = y0; y <= y1; y++) { put(g, x0, y, ch); put(g, x1, y, ch); } };
let sd = 5; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;

// the jungle: everywhere outside the court, trees thick, undergrowth
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const inCourt = x >= 8 && x <= 51 && y >= 6 && y <= 50;
  put(G, x, y, inCourt ? (rnd() < 0.5 ? 'g' : ' ') : rnd() < 0.16 ? 't' : rnd() < 0.08 ? 'h' : 'g');
}
// the way in from the south: a path through the trees
for (let y = 50; y < H; y++) for (let x = 28; x <= 31; x++) put(G, x, y, ' ');
// the court's old wall, broken, the gate in the south
for (let x = 8; x <= 51; x++) for (const y of [6, 50]) put(G, x, y, rnd() < 0.75 ? 'w' : 'r');
for (let y = 6; y <= 50; y++) for (const x of [8, 51]) put(G, x, y, rnd() < 0.75 ? 'w' : 'r');
for (let x = 27; x <= 32; x++) put(G, x, 50, ' ');
// ── the pyramid: base (G, x 20-39, y 14-33), first terrace (T1, 4 m), the upper tier (24-35, 18-29) to 8 m,
// the shrine on top
ring(G, 20, 14, 39, 33, '#'); fill(G, 21, 15, 38, 32, '.');
for (let x = 21; x <= 38; x++) put(G, x, 19, '#');                         // the hall's north wall
put(G, 29, 19, 'Q'); put(G, 30, 19, 'Q');                                   // the stone door
for (const x of [25, 34]) for (let y = 15; y <= 18; y++) put(G, x, y, '#');
put(G, 23, 19, 'D'); put(G, 36, 19, 'D');                                   // the side chambers
put(G, 39, 25, ':'); put(G, 39, 26, ':');                                   // the way in: the east face
put(G, 20, 25, ':'); put(G, 20, 26, ':');                                   // and a fallen-in hole on the west
for (let y = 22; y <= 30; y += 4) for (const x of [24, 28, 31, 35]) put(G, x, y, 'P');   // the Hall of Pillars
put(G, 22, 16, 'X'); put(G, 37, 16, 'C'); put(G, 37, 17, 'C'); put(G, 22, 31, 'r'); put(G, 37, 31, 'r');
fill(T1, 20, 14, 39, 33, '.'); fill(T1, 24, 18, 35, 29, 'J');
fill(T2, 24, 18, 35, 29, '.'); ring(T2, 27, 21, 32, 26, '#'); fill(T2, 28, 22, 31, 25, '.');
put(T2, 29, 26, ':'); put(T2, 30, 26, ':');                                 // the shrine's door, on the stair
// ── the tomb, under the hall
ring(B, 22, 12, 37, 26, '#'); fill(B, 23, 13, 36, 25, '.');
for (let x = 23; x <= 36; x++) put(B, x, 20, '#'); put(B, 26, 20, ':'); put(B, 33, 20, ':');
for (const [x, y] of [[25, 23], [29, 23], [33, 23], [27, 15], [32, 15]]) put(B, x, y, 'X');
for (const [x, y] of [[23, 13], [36, 13], [23, 25], [36, 25]]) put(B, x, y, 'P');
// ── the looters' camp: in the court's west side - tents, crates, the generator, a truck
for (const [x, y] of [[12, 12], [12, 18], [16, 12]]) put(G, x, y, 'n');
for (const [x, y] of [[11, 24], [12, 24], [11, 25], [15, 22], [16, 22]]) put(G, x, y, 'C');
put(G, 14, 28, 'M'); put(G, 10, 34, 'v'); put(G, 15, 16, 'T');
// the court: fallen statues, broken columns, the avenue of heads up to the steps
for (const [x, y] of [[26, 40], [33, 40], [26, 45], [33, 45]]) put(G, x, y, 'S');
for (const [x, y] of [[44, 12], [46, 20], [45, 30], [43, 42], [17, 44], [12, 40]]) put(G, x, y, rnd() < 0.5 ? 'P' : 'r');

const stairs = [
  { x: 28, y: 36, dir: 'N', len: 3, w: 4, from: 'G', to: 'T1' },          // the great stair, up the south face
  { x: 28, y: 32, dir: 'N', len: 3, w: 4, from: 'T1', to: 'T2' },
  { x: 27, y: 17, dir: 'E', len: 3, w: 1, from: 'B', to: 'G' },           // down from the sanctum to the tomb
];

export default {
  id: 'temple', no: 26, title: 'The Ancient Temple', place: 'Ix Tolun', cell: CELL,
  where: 'The temple of Ix Tolun, in the Cerra jungle. 07:10, steaming after the night\'s rain.',
  brief: [
    ['The place', 'A stepped pyramid in a court gone back to the jungle. The great stair climbs its south face to the first terrace and on to the <b>shrine</b> on the top. Inside the base, the <b>Hall of Pillars</b> (in from the east face, or the fallen-in hole on the west); behind the hall, the <b>sanctum</b> - through a <b>stone door</b> nothing you carry will open - and under it, the <b>tomb</b>.'],
    ['The stone door', 'The <b>glyph wheel</b> in the shrine on the top turns it: hold E at the wheel.'],
    ['The looters', 'A ring of them (the reds), camped on the court\'s west side. They took <b>Dr Anaya Rook</b> from the university\'s dig to read the temple for them. Their boss is <b>Calder</b>.'],
    ['Objectives', 'Turn the glyph wheel. Take the <b>Tolun tablet</b> from the tomb before they do. Bring <b>Dr Rook</b> out (their camp). Optionally, stop Calder.'],
  ],
  time: { date: [6, 9, 2026], hour: 7, minute: 10 }, faction: 'red',
  atmos: { fog: [0.55, 0.62, 0.5, 18, 160], ambient: [0.42, 0.48, 0.4], sun: [1, 0.95, 0.8, 1.2, 40, 120], sky: [0.8, 0.92, 0.82] },
  extractName: 'the jungle path, south', navCap: 120000, windows: false,
  outside: { backdrop: 'woods', mat: 'desert', tint: [0.55, 0.5, 0.38], margin: 14 },
  decals: { g: { mat: 'lawn', tint: [0.6, 0.75, 0.45] } },
  legend: {
    // a fallen statue's head, as tall as a man, on its side in the grass
    S(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 0.9, cy, cz - 0.8], [cx + 0.9, cy + 1.7, cz + 0.8], 'rock', { tint: [0.62, 0.58, 0.48] }); k.box([cx - 0.5, cy + 0.6, cz + 0.8], [cx + 0.5, cy + 1.0, cz + 1.1], 'rock', { tint: [0.58, 0.54, 0.44] }); k.box([cx - 1.0, cy + 1.6, cz - 0.6], [cx + 1.0, cy + 2.0, cz + 0.6], 'hedge', { solid: false, tint: [0.6, 0.8, 0.5] }); },
    n(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 1.4, cy, cz - 1.2], [cx + 1.4, cy + 1.5, cz + 1.2], 'cloth', { tint: [0.45, 0.5, 0.3] }); k.box([cx - 0.9, cy + 1.5, cz - 1.2], [cx + 0.9, cy + 2.1, cz + 1.2], 'cloth', { tint: [0.4, 0.45, 0.27], solid: false }); },
  },
  floors: {
    B: { y: -4.5, wallH: 3.6, wall: 'rock', wallTint: [0.6, 0.55, 0.45], floor: 'rock', floorTint: [0.55, 0.5, 0.42], ceil: 'rock', lampPower: 0.45, lampColour: [1, 0.65, 0.35], lampEvery: 9, rows: B.map((r) => r.join('')) },
    G: { y: 0, wallH: 3.8, wall: 'rock', wallTint: [0.68, 0.62, 0.5], floor: 'rock', floorTint: [0.6, 0.55, 0.45], ceil: 'rock', lampPower: 0.5, lampColour: [1, 0.7, 0.4], lampEvery: 9, rows: G.map((r) => r.join('')) },
    T1: { y: 4.0, wallH: 3, roof: false, lamps: false, floor: 'rock', floorTint: [0.66, 0.6, 0.48], slab: 0.2, rows: T1.map((r) => r.join('')) },
    T2: { y: 8.0, wallH: 3.2, wall: 'rock', wallTint: [0.7, 0.64, 0.5], floor: 'rock', floorTint: [0.64, 0.58, 0.46], ceil: 'rock', lampPower: 0.4, lampColour: [1, 0.7, 0.4], rows: T2.map((r) => r.join('')) },
  },
  doorSkins: Object.fromEntries([29, 30].map((x) => ['G:' + x + ',19', { build: 'reinforced', locked: true, mat: 'rock', thick: 0.5, label: 'stone door', vault: true, blastDoor: true, lockedText: 'A stone door - it will not move for anything you carry. The glyph wheel on the top turns it.' }])),
  stairs,
  start: { x: 29.5, y: 60, floor: 'G', yaw: 0 },
  extract: { x: 29.5, y: 59, floor: 'G' },
  vehicle: false,
  extra(kit) {
    const { box, level, CELL: C } = kit;
    // the upper tier: solid stone from the first terrace to the second; the faces dressed in carved courses
    box([24 * C, 4.0, 18 * C], [36 * C, 8.0, 30 * C], 'rock', { tint: [0.66, 0.6, 0.48] });
    const course = (x0, z0, x1, z1, h) => { const o = { solid: false, tint: [0.55, 0.5, 0.4] }, t = 0.1;
      box([x0 - t, h, z0 - t], [x1 + t, h + 0.12, z0], 'rock', o); box([x0 - t, h, z1], [x1 + t, h + 0.12, z1 + t], 'rock', o);
      box([x0 - t, h, z0], [x0, h + 0.12, z1], 'rock', o); box([x1, h, z0], [x1 + t, h + 0.12, z1], 'rock', o); };
    for (let h = 0.6; h < 3.8; h += 1.0) course(20 * C, 14 * C, 40 * C, 34 * C, h);
    for (let h = 4.6; h < 8; h += 1.0) course(24 * C, 18 * C, 36 * C, 30 * C, h);
    // vines down the faces, roots over the terrace
    for (let i = 0; i < 24; i++) { const x = 20 + Math.floor(rnd() * 20), side = i % 2; box([x * C, 1 + rnd() * 2, side ? 14 * C - 0.15 : 34 * C], [x * C + 0.5, 4.0, side ? 14 * C : 34 * C + 0.15], 'hedge', { solid: false, tint: [0.4, 0.6, 0.3] }); }
    // the shrine's roof comb, and the braziers either side of its door
    box([27 * C, 11.2, 23 * C], [33 * C, 13.5, 24 * C], 'rock', { tint: [0.7, 0.64, 0.5] });
    for (const x of [27, 32]) { box([x * C + 0.6, 8.0, 27 * C + 0.4], [x * C + 1.4, 9.0, 27 * C + 1.2], 'metal', { tint: [0.35, 0.28, 0.2] }); level.lights.push({ pos: [x * C + 1, 9.5, 27 * C + 0.8], range: 8, intensity: 1.0, color: [1, 0.6, 0.25] }); }
    // the tablet's altar in the tomb
    box([29 * C, -4.5, 16 * C], [31 * C, -3.6, 17 * C], 'marble', { tint: [0.7, 0.62, 0.45] });
    level.signs.push({ pos: [29.9 * C, 2.9, 19 * C + 0.32], yaw: 0, w: 2.6, h: 0.6, text: 'ᚷ ᛁ ᛉ ᛏ ᛟ', sub: '', col: '#4a3a22' });
  },
  zones: [
    { id: 'shrine', label: 'Ix Tolun - the shrine', at: [27, 21, 32, 26], floor: 'T2' },
    { id: 'top', label: 'Ix Tolun - the upper tier', at: [24, 18, 35, 29], floor: 'T2' },
    { id: 'terrace', label: 'Ix Tolun - the first terrace', at: [20, 14, 39, 33], floor: 'T1' },
    { id: 'tomb', label: 'Ix Tolun - the tomb', at: [22, 12, 37, 26], floor: 'B' },
    { id: 'sanctum', label: 'Ix Tolun - the sanctum', at: [26, 15, 33, 18] },
    { id: 'hall', label: 'Ix Tolun - the Hall of Pillars', at: [21, 15, 38, 32] },
    { id: 'camp', label: 'Ix Tolun - the looters\' camp', at: [9, 7, 18, 36] },
    { id: 'court', label: 'Ix Tolun - the court', at: [8, 6, 51, 50] },
    { id: 'jungle', label: 'The Cerra jungle', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'calder', at: [15, 15, 'G'], arms: 'shotgun', rank: 'officer', temper: 'steady', name: 'Calder' },
    { id: 'c1', at: [13, 22, 'G'], arms: 'carbine' },
    { id: 'c2', at: [17, 26, 'G'], route: [[17, 9], [17, 34]], arms: 'smg' },
    { id: 'c3', at: [11, 30, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'gate', at: [30, 48, 'G'], arms: 'carbine' },
    { id: 'cr1', at: [42, 38, 'G'], route: [[42, 10], [42, 46]], arms: 'smg' },
    { id: 't1', at: [22, 20, 'T1'], route: [[21, 15], [21, 32]], arms: 'dmr', rank: 'specialist' },
    { id: 't2', at: [37, 31, 'T1'], arms: 'carbine', temper: 'steady' },
    { id: 's1', at: [29, 24, 'T2'], arms: 'smg', temper: 'steady' },
    { id: 'h1', at: [26, 26, 'G'], route: [[22, 28], [37, 28]], arms: 'carbine' },
    { id: 'h2', at: [36, 22, 'G'], arms: 'shotgun' },
    { id: 'b1', at: [30, 23, 'B'], arms: 'smg', temper: 'steady' },
    { id: 'b2', at: [24, 16, 'B'], arms: 'carbine' },
  ],
  hostages: [{ id: 'rook', name: 'Dr Anaya Rook', she: true, at: [12, 13, 'G'] }],
  pickups: [{ id: 'tablet', name: 'The Tolun tablet', what: 'the tablet', at: [30, 16, 'B'], table: false, h: 0.95, colour: [0.85, 0.7, 0.35] }],
  terminals: [{ id: 'wheel', name: 'the glyph wheel', at: [30, 23, 'T2'], face: [0, 1], time: 5, reveal: 0.01, verb: 'Turn', doing: 'Turning', look: 'stone',
    said: 'The glyph wheel turns - far below, stone grinds on stone: the sanctum\'s door is open.' }],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'wheel', text: 'Turn the glyph wheel (the shrine, on the top)' },
    { id: 'o2', kind: 'take', ref: 'tablet', text: 'Take the Tolun tablet (the tomb, under the sanctum)' },
    { id: 'o3', kind: 'rescue', ref: 'rook', text: 'Bring Dr Rook out (the looters\' camp)' },
    { id: 'o4', kind: 'kill', ref: 'calder', text: 'Stop Calder', optional: true },
  ],
};
