// FRONTLINE - Level 22, the Desolated City (M6.20.3, first draft). Rhys (after M6.13.7): "Desolated City".
// Drosk, two winters after the fighting moved on: nine blocks of a city nobody lives in - towers broken off
// at different heights, rubble down the streets, burnt-out cars, the park gone to seed, a flooded crater in
// the square. Scavenger militia (the Yellows) hold it now. A Ghost recon team, LANTERN, went quiet here
// three days ago.
//
// Places you go into: the Meridian hotel's shell (two storeys, holes blown in its floors), the radio station
// (its transmitter upstairs), a shop where one of LANTERN is hiding. A square is 2.5 m.
const CELL = 2.5, B = 16, S = 4, N = 3;
const W = S + N * (B + S), H = W;
const bx0 = (i) => i * (B + S) + S, bx1 = (i) => bx0(i) + B - 1;
const grid = () => Array.from({ length: H }, () => new Array(W).fill(' '));
const G = grid(), F1 = grid();
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const stamp = (g, x0, y0, rows) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '?') put(g, x0 + i, y0 + j, r[i]); });
let sd = 23; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;

// pavements, cracked: here and there gone to grass
for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
  const x0 = bx0(i), y0 = bx0(j), x1 = bx1(i), y1 = bx1(j);
  for (let x = x0; x <= x1; x++) for (const y of [y0, y1]) put(G, x, y, rnd() < 0.2 ? 'g' : 'p');
  for (let y = y0; y <= y1; y++) for (const x of [x0, x1]) put(G, x, y, rnd() < 0.2 ? 'g' : 'p');
}
// the broken towers: solid, each broken off at its own height; some fallen in a heap of rubble
const towers = [], heaps = [];
const SPECIAL = { '1,0': 'hotel', '0,1': 'park', '1,1': 'square', '2,1': 'radio', '0,2': 'shop', '2,2': 'camp' };
for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
  const kind = SPECIAL[i + ',' + j];
  const x0 = bx0(i) + 1, y0 = bx0(j) + 1, x1 = bx1(i) - 1, y1 = bx1(j) - 1;
  let lots = [];
  if (!kind) lots = [[x0, y0, x0 + 5, y1], [x0 + 8, y0, x1, y0 + 5], [x0 + 8, y0 + 8, x1, y1]];
  if (kind === 'radio') lots = [[x0, y0 + 10, x0 + 5, y1]];
  if (kind === 'shop') lots = [[x0 + 8, y0, x1, y1]];
  if (kind === 'hotel') lots = [[x0, y0 + 11, x1, y1]];
  for (const [a, b, c, d] of lots) {
    if (rnd() < 0.3) { heaps.push([a, b, c, d]); continue; }          // fallen in: a heap
    fill(G, a, b, c, d, 'J');
    // broken off: three pieces, each at its own height
    const h = 10 + Math.floor(rnd() * 8) * 3.5, mx = Math.floor((a + c) / 2);
    towers.push({ x0: a, y0: b, x1: c, y1: d, cuts: [[a, mx, h], [mx + 1, c, h - 3 - rnd() * 8]], tint: [0.4 + rnd() * 0.12, 0.37 + rnd() * 0.1, 0.35 + rnd() * 0.08] });      // (dim: no lights in these windows)
  }
}
for (const [a, b, c, d] of heaps) for (let y = b; y <= d; y++) for (let x = a; x <= c; x++) if (rnd() < 0.55) put(G, x, y, 'y');

// ── the Meridian hotel (block 1,0): a shell, two storeys; holes in the first floor; blast holes for doors
const HX = bx0(1) + 1, HY = bx0(0) + 1;
stamp(G, HX, HY, [
  '##W##W##W##W##',
  'W.....:......W',
  '#.....#..C...#',
  '#..y..#......#',
  ':.....###:####',
  '#............W',
  '#..K.K.......:',
  '#........y...#',
  '#............#',
  '###:##W##W####',
]);
stamp(F1, HX, HY, [
  '##W##W##W##W##',
  'W.....:...OO.W',
  '#.....#...OO.#',
  '#.....#......#',
  '###:###:######',
  '#..OO........W',
  '#..OO....C...#',
  '#............#',
  '#.......OO...#',
  '##W##W##W##W##',
]);
// ── the radio station (block 2,1): its studio below, the transmitter room above
const RX = bx0(2) + 1, RY = bx0(1) + 1;
stamp(G, RX, RY, [
  '#####W##W###',
  '#....#.....#',
  'W....D..T..W',
  '#....#.....#',
  '##D###..H..#',
  '#..........D',
  '#..T...M...#',
  '#####:######',
]);
stamp(F1, RX, RY, [
  '#####W##W###',
  '#....#.....#',
  'W....D..M..W',
  '#....#.....#',
  '######..M..#',
  '#..........W',
  '#....T.....#',
  '############',
]);
const stairs = [
  { x: HX + 11, y: HY + 5, dir: 'S', len: 3, w: 2, from: 'G', to: '1' },
  { x: RX + 1, y: RY + 5, dir: 'E', len: 3, w: 2, from: 'G', to: '1' },
];
// ── the shop (block 0,2) where Corporal Takacs is hiding, its back room
const SX = bx0(0) + 2, SY = bx0(2) + 2;
stamp(G, SX, SY, ['##W##W##', '#......#', 'D..KK..#', '#......#', '###D####', '#..C...#', '#.....y#', '########']);
// ── the square (1,1): a crater, flooded, round the plinth of a statue that is not there any more
const QX = bx0(1), QY = bx0(1);
for (let y = QY + 4; y <= QY + 11; y++) for (let x = QX + 4; x <= QX + 11; x++) { const d = Math.hypot(x - QX - 7.5, y - QY - 7.5); if (d < 3.6) put(G, x, y, '~'); else if (d < 4.4) put(G, x, y, 'y'); }
put(G, QX + 2, QY + 2, 'J'); put(G, QX + 3, QY + 2, 'J'); put(G, QX + 2, QY + 3, 'J'); put(G, QX + 3, QY + 3, 'J');
// ── the park (0,1): long grass, trees, LANTERN's burnt-out vehicle
const PX = bx0(0), PY = bx0(1);
for (let y = PY + 1; y < PY + B - 1; y++) for (let x = PX + 1; x < PX + B - 1; x++) put(G, x, y, rnd() < 0.12 ? 't' : rnd() < 0.08 ? 'h' : 'g');
fill(G, PX + 6, PY + 7, PX + 8, PY + 8, 'g'); put(G, PX + 7, PY + 7, 'x');
// ── the Yellows' camp (2,2): barricades of cars and crates, tents, fires in drums
const CX = bx0(2), CY = bx0(2);
for (let x = CX + 1; x < CX + B - 1; x++) if (x % 3 !== 0) put(G, x, CY + 1, x % 4 === 1 ? 'x' : 'C');
for (let y = CY + 2; y < CY + B - 1; y++) if (y % 3 !== 0) put(G, CX + 1, y, y % 4 === 1 ? 'x' : 'C');
for (const [x, y] of [[CX + 5, CY + 5], [CX + 10, CY + 5], [CX + 5, CY + 10], [CX + 10, CY + 10]]) put(G, x, y, 'n');
for (const [x, y] of [[CX + 7, CY + 7], [CX + 12, CY + 12]]) put(G, x, y, 'e');
// the streets: rubble, burnt-out cars, the odd crater (cars kept out of the camp's gaps)
for (let k = 0; k <= N; k++) for (let t = 2; t < W - 2; t += 3) {
  const a = k * (B + S) + 1 + Math.floor(rnd() * 2);
  if (rnd() < 0.12) put(G, a, t, 'r'); else if (rnd() < 0.06) put(G, a, t, 'x');
  if (rnd() < 0.12) put(G, t, a, 'r'); else if (rnd() < 0.05) put(G, t, a, 'x');
}

export default {
  id: 'ruins', no: 22, title: 'The Desolated City', place: 'Drosk', cell: CELL, tidy: true,
  where: 'Drosk, the old centre. 18:20, a dust-brown dusk.',
  brief: [
    ['The place', 'Nine blocks of a city nobody lives in any more. The towers are broken off at every height; the streets are rubble and burnt-out cars; the park has gone to seed; a crater full of water where the square\'s statue was. Scavenger militia - the Yellows - hold it, with a camp in the south-east block.'],
    ['LANTERN', 'A Ghost recon team, quiet for three days. Their vehicle is in the park (the west block). Their <b>black box</b> - the team radio and its log - was last heard from the <b>Meridian hotel</b>\'s shell, north of the square, the first floor. One of them, <b>Corporal Takacs</b>, may still be alive: a shop in the south-west block.'],
    ['Objectives', 'Find <b>LANTERN\'s vehicle</b> in the park. Take the <b>black box</b> (the Meridian, upstairs). Send it home from the <b>radio station</b>\'s transmitter (east block, upstairs). Optionally, bring <b>Takacs</b> out.'],
    ['Watch your step', 'The Meridian\'s floors are blown through in places. Snipers in the high windows.'],
  ],
  time: { date: [2, 11, 2026], hour: 18, minute: 20 }, faction: 'yellow',
  atmos: { fog: [0.5, 0.42, 0.33, 25, 210], ambient: [0.5, 0.45, 0.4], sun: [1, 0.7, 0.48, 1.1, 26, 250], sky: [0.85, 0.7, 0.55] },
  startLoadout: { primary: 'K7', backup: 'PX9', utility1: 'FRAG', utility2: 'REMOTE', gear: 'LENSES' },
  extractName: 'the way in, at the north-west corner', vehicle: false, navCap: 60000, testNavCap: 600000, chaseMax: 60,
  outside: { backdrop: 'city', mat: 'asphalt', tint: [0.95, 0.9, 0.85], margin: 12 },
  decals: { p: { mat: 'concrete2', tint: [0.6, 0.57, 0.52] } },
  legend: {
    // a heap of fallen building: broken slabs, chest to head high - cover, and climbable
    y(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2, v = (x * 7 + y * 3) % 4; k.box([cx - h, cy, cz - h], [cx + h, cy + 0.6 + v * 0.25, cz + h], 'concrete2', { tint: [0.55, 0.52, 0.48] }); k.box([cx - h * 0.6, cy + 0.6 + v * 0.25, cz - h * 0.5], [cx + h * 0.4, cy + 1.0 + v * 0.3, cz + h * 0.6], 'brick', { tint: [0.6, 0.45, 0.4] }); if (v === 2) k.box([cx - 0.05, cy + 0.8, cz - h], [cx + 0.05, cy + 1.6, cz + h * 0.3], 'metal', { solid: false, tint: [0.35, 0.25, 0.2] }); },
    // a burnt-out car: black and rust, its glass gone
    x(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), ax = (x + y) % 2 === 0, P = (a, b) => (ax ? [b, a] : [a, b]); const [w1, l1] = P(0.85, 2.05), [w2, l2] = P(0.75, 1.0); k.box([cx - w1, cy + 0.2, cz - l1], [cx + w1, cy + 0.9, cz + l1], 'paint', { tint: [0.13, 0.1, 0.09] }); k.box([cx - w2, cy + 0.9, cz - l2], [cx + w2, cy + 1.35, cz + l2], 'metal', { tint: [0.3, 0.17, 0.1], solid: false }); },
    // a tent
    n(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 1.1, cy, cz - 1.0], [cx + 1.1, cy + 1.2, cz + 1.0], 'cloth', { tint: [0.45, 0.45, 0.3] }); k.box([cx - 0.7, cy + 1.2, cz - 1.0], [cx + 0.7, cy + 1.7, cz + 1.0], 'cloth', { tint: [0.4, 0.4, 0.27], solid: false }); },
    // a fire in an oil drum
    e(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 0.35, cy, cz - 0.35], [cx + 0.35, cy + 0.9, cz + 0.35], 'metal', { tint: [0.3, 0.2, 0.15] }); k.box([cx - 0.25, cy + 0.9, cz - 0.25], [cx + 0.25, cy + 1.2, cz + 0.25], 'lamp', { solid: false, tint: [1, 0.5, 0.15] }); k.level.lights.push({ pos: [cx, cy + 1.6, cz], range: 9, intensity: 1.1, color: [1, 0.55, 0.25] }); },
  },
  floors: {
    G: { y: 0, wallH: 3.6, wall: 'concrete2', wallTint: [0.62, 0.58, 0.54], floor: 'concrete', floorTint: [0.6, 0.57, 0.52], ceil: 'concrete2', lampPower: 0.35, lampColour: [1, 0.7, 0.45], lampEvery: 14, channel: 2.2, surf: 0.5, rows: G.map((r) => r.join('')) },
    1: { y: 4.0, wallH: 3.4, wall: 'concrete2', wallTint: [0.6, 0.56, 0.52], floor: 'concrete', floorTint: [0.55, 0.52, 0.48], roof: false, lamps: false, rows: F1.map((r) => r.join('')) },
  },
  stairs,
  start: { x: 1.5, y: 1.5, floor: 'G', yaw: -Math.PI * 0.75 },
  extract: { x: 1.5, y: 1.5, floor: 'G' },
  extra(kit) {
    const { box, level, CELL: C } = kit;
    for (const t of towers) {
      const z0 = t.y0 * C, z1 = (t.y1 + 1) * C;
      for (const [a, b, h] of t.cuts) {
        const x0 = a * C, x1 = (b + 1) * C;
        box([x0, 0, z0], [x1, h, z1], 'facade', { tint: t.tint });
        // its broken top: a jagged course, and reinforcing bars sticking out of it
        box([x0 + 0.5, h, z0 + 0.5], [x0 + (x1 - x0) * 0.55, h + 1.2, z1 - 0.8], 'concrete2', { tint: [0.5, 0.48, 0.45] });
        for (let q = 0; q < 4; q++) { const bx = x0 + 1 + q * (x1 - x0 - 2) / 3; box([bx - 0.04, h, z0 + 1], [bx + 0.04, h + 2.2, z0 + 1.08], 'metal', { solid: false, tint: [0.3, 0.2, 0.15] }); }
      }
      box([t.x0 * C - 0.1, 0, z0 - 0.1], [(t.x1 + 1) * C + 0.1, 3.6, z1 + 0.1], 'concrete2', { tint: [0.35, 0.33, 0.31], solid: false });
    }
    // the statue's plinth in the square
    box([(bx0(1) + 2) * C + 0.2, 0, (bx0(1) + 2) * C + 0.2], [(bx0(1) + 4) * C - 0.2, 2.6, (bx0(1) + 4) * C - 0.2], 'marble', { tint: [0.6, 0.58, 0.55] });
    // the radio mast on the station's roof
    const mx = (RX + 8) * C, mz = (RY + 3) * C;
    box([mx - 0.15, 7.4, mz - 0.15], [mx + 0.15, 30, mz + 0.15], 'metal', { tint: [0.6, 0.25, 0.2] });
    for (let h = 10; h < 30; h += 4) box([mx - 1.2, h, mz - 0.04], [mx + 1.2, h + 0.08, mz + 0.04], 'metal', { solid: false, tint: [0.5, 0.5, 0.52] });
    level.lights.push({ pos: [mx, 30.4, mz], range: 6, intensity: 1.4, color: [1, 0.15, 0.1] });
    level.signs.push({ pos: [(HX + 7) * C, 3.2, (HY + 10) * C + 0.12], yaw: 0, w: 4, h: 0.6, text: 'HOTEL MER DIAN', sub: '', col: '#3d2a22' });
    level.signs.push({ pos: [(RX + 12) * C + 0.12, 3.0, (RY + 5) * C], yaw: Math.PI / 2, w: 3, h: 0.5, text: 'RADIO DROSK', sub: '', col: '#26303d' });
  },
  zones: [
    { id: 'hotel1', label: 'Drosk - the Meridian, the first floor', at: [HX, HY, HX + 13, HY + 9], floor: '1' },
    { id: 'hotel', label: 'Drosk - the Meridian hotel', at: [HX, HY, HX + 13, HY + 9] },
    { id: 'radio1', label: 'Radio Drosk - the transmitter room', at: [RX, RY, RX + 11, RY + 7], floor: '1' },
    { id: 'radio', label: 'Radio Drosk', at: [RX, RY, RX + 11, RY + 7] },
    { id: 'shop', label: 'Drosk - the corner shop', at: [SX, SY, SX + 7, SY + 7] },
    { id: 'park', label: 'Drosk - the park', at: [PX, PY, PX + B - 1, PY + B - 1] },
    { id: 'square', label: 'Drosk - the square', at: [QX, QY, QX + B - 1, QY + B - 1] },
    { id: 'camp', label: 'Drosk - the Yellows\' camp', at: [CX, CY, CX + B - 1, CY + B - 1] },
    { id: 'all', label: 'Drosk', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'h1', at: [HX + 3, HY + 6, 'G'], arms: 'carbine' },
    { id: 'h2', at: [HX + 9, HY + 2, 'G'], arms: 'shotgun', temper: 'steady' },
    { id: 'h3', at: [HX + 3, HY + 2, '1'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'h4', at: [HX + 6, HY + 7, '1'], arms: 'smg' },
    { id: 'r1', at: [RX + 8, RY + 6, 'G'], arms: 'carbine' },
    { id: 'r2', at: [RX + 2, RY + 2, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'r3', at: [RX + 8, RY + 2, '1'], arms: 'smg', temper: 'steady' },
    { id: 'r4', at: [RX + 7, RY + 6, '1'], arms: 'dmr', rank: 'specialist' },
    { id: 'c1', at: [CX + 7, CY + 9, 'G'], arms: 'carbine', rank: 'sergeant' },
    { id: 'c2', at: [CX + 11, CY + 7, 'G'], arms: 'lmg', temper: 'steady' },
    { id: 'c3', at: [CX + 4, CY + 12, 'G'], arms: 'smg' },
    { id: 'c4', at: [CX + 12, CY + 11, 'G'], arms: 'rocket', temper: 'steady' },
    { id: 's1', at: [bx0(1) - 2, bx0(1) + 4, 'G'], route: [[bx0(1) - 2, bx0(0) + 2], [bx0(1) - 2, bx1(2) - 2]], arms: 'carbine' },
    { id: 's2', at: [bx0(1) + 3, bx1(1) + 2, 'G'], route: [[bx0(0) + 2, bx1(1) + 2], [bx1(2) - 2, bx1(1) + 2]], arms: 'smg' },
    { id: 'p1', at: [PX + 10, PY + 10, 'G'], route: [[PX + 10, PY + 3], [PX + 10, PY + 12]], arms: 'carbine' },
    { id: 'q1', at: [QX + 13, QY + 3, 'G'], arms: 'dmr', temper: 'steady' },
    { id: 'sh1', at: [SX + 5, SY + 2, 'G'], arms: 'shotgun' },
  ],
  hostages: [{ id: 'takacs', name: 'Corporal Takacs', at: [SX + 3, SY + 5, 'G'] }],
  pickups: [{ id: 'blackbox', name: 'LANTERN\'s black box', what: 'the black box', at: [HX + 8, HY + 2, '1'], h: 0.8, colour: [0.9, 0.5, 0.15] }],
  reach: [{ id: 'lantern', name: 'LANTERN\'s vehicle', at: [PX + 5, PY + 6, PX + 9, PY + 9] }],
  terminals: [{ id: 'tx', name: 'the transmitter', at: [RX + 9, RY + 5, '1'], face: [0, -1], time: 8, reveal: 25, said: 'The transmitter: LANTERN\'s log goes home - and their last message comes back to you: "Yellows have the bridge. Do not come in from the east."' }],
  objectives: [
    { id: 'o1', kind: 'reach', ref: 'lantern', text: 'Find LANTERN\'s vehicle (the park)' },
    { id: 'o2', kind: 'take', ref: 'blackbox', text: 'Take the black box (the Meridian, the first floor)' },
    { id: 'o3', kind: 'hack', ref: 'tx', text: 'Send it home from the transmitter (Radio Drosk, upstairs)' },
    { id: 'o4', kind: 'rescue', ref: 'takacs', text: 'Bring Corporal Takacs out (the corner shop)', optional: true },
  ],
};
