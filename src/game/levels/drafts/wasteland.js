// FRONTLINE - Level 23, the Nuclear Wasteland (first draft). Rhys (after M6.13.7): "Post-Apocalyptic
// Nuclear Wasteland". The Vell valley, downwind of the Hesk power station: grey dust, dead trees, the old
// highway full of wrecks, a village nobody came back to - and Site 9, the army's research compound, its
// laboratory underground. Raiders - the reds - live off what is left.
//
// New: radiation. The reactor's ruin is hot, and there are hot spots elsewhere (a crater, a dump of drums):
// the Geiger counter clicks faster the worse it is, it hurts you while you are in it, and you do not heal
// till you are out. A square is 3 m.
const CELL = 3, W = 90, H = 80;
const grid = () => Array.from({ length: H }, () => new Array(W).fill(' '));
const G = grid(), F1 = grid(), B = grid();
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const stamp = (g, x0, y0, rows) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '?') put(g, x0 + i, y0 + j, r[i]); });
let sd = 41; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;

// the old highway, east-west across the south; wrecks along it
for (let x = 0; x < W; x++) for (let y = 66; y <= 69; y++) put(G, x, y, 'k');
for (let x = 3; x < W - 3; x += 4 + Math.floor(rnd() * 5)) put(G, x, 66 + Math.floor(rnd() * 4), rnd() < 0.7 ? 'x' : 'b');
// the track north from it to Site 9, and on to the power station
for (let y = 20; y < 66; y++) { put(G, 30, y, 'k'); put(G, 31, y, 'k'); }
for (let x = 31; x < 70; x++) { put(G, x, 20, 'k'); put(G, x, 21, 'k'); }
// ── Site 9 (west of the track): a fence round it, two watchtowers, the guardhouse, the bunker's head
const SX = 8, SY = 30, SX1 = 27, SY1 = 50;
for (let x = SX; x <= SX1; x++) { put(G, x, SY, 'f'); put(G, x, SY1, 'f'); }
for (let y = SY; y <= SY1; y++) { put(G, SX, y, 'f'); put(G, SX1, y, 'f'); }
put(G, SX1, 40, ' '); put(G, SX1, 41, ' ');                    // the gate, onto the track
stamp(G, 11, 33, ['#####', '#...#', '#.T.D', '#...#', '#####']);                       // the guardhouse
stamp(G, 16, 41, ['#######', '#.....#', '#.....D', '#.....#', '#######']);             // the bunker's head: the stair down
for (const [x, y] of [[10, 47], [24, 32]]) put(G, x, y, 'J');                         // the watchtowers' legs (a platform up a ladder)
for (const [x, y] of [[10, 47], [24, 32]]) { put(F1, x, y, '.'); }
// ── the laboratory, under Site 9
stamp(B, 12, 38, [
  '###############',
  '#.....#.......#',
  '#..M..D...T...#',
  '#.....#.......#',
  '###D###.......#',
  '#.............#',
  '#...#####D#####',
  '#...#.......M.#',
  '#...D...H.H...#',
  '#...#.........#',
  '###############',
]);
const stairs = [{ x: 17, y: 43, dir: 'E', len: 4, w: 1, from: 'B', to: 'G' }];
// ── the village (south-east): five houses, shells
const houses = [[56, 44], [64, 44], [72, 44], [60, 54], [70, 54]];
for (const [x, y] of houses) stamp(G, x, y, ['###W##', '#....#', 'W....:', '#....#', '##:###']);
// ── the Hesk power station (north-east): the reactor hall, broken open; two cooling towers
stamp(G, 60, 6, [
  '####:#########',
  '#............#',
  '#..MM....MM..#',
  ':............#',
  '#....####....#',
  '#....#..#....:',
  '#....#..#....#',
  '#....##:#....#',
  '#............#',
  '#.K.......K..#',
  '######:#######',
]);
for (const [x, y] of [[78, 4], [78, 14]]) fill(G, x, y, x + 5, y + 5, 'J');
// the crater, the drum dump
for (let y = 52; y <= 60; y++) for (let x = 36; x <= 44; x++) { const d = Math.hypot(x - 40, y - 56); if (d < 4.6 && d > 3.4) put(G, x, y, 'y'); }
for (const [x, y] of [[48, 30], [49, 30], [48, 31], [50, 31], [49, 32]]) put(G, x, y, 'B');
// dead trees, boulders, here and there
for (let i = 0; i < 90; i++) { const x = Math.floor(rnd() * W), y = Math.floor(rnd() * H); if (G[y][x] === ' ') put(G, x, y, rnd() < 0.6 ? 'd' : 'r'); }

export default {
  id: 'wasteland', no: 23, title: 'The Nuclear Wasteland', place: 'the Vell valley, downwind of Hesk', cell: CELL,
  where: 'The Vell valley, downwind of the Hesk power station. 15:10, a sick yellow sky.',
  brief: [
    ['The place', 'Grey dust and dead trees. The old highway across the south, full of wrecks; a track north from it past <b>Site 9</b> - the army\'s research compound, fenced, its laboratory underground - to the broken <b>Hesk power station</b> in the north-east. The village in the south-east, empty. Raiders live off what is left.'],
    ['Radiation', 'The reactor hall is hot - and so are the crater south of the track and the dump of drums by it. Your Geiger counter clicks faster the worse it gets. It hurts you while you are in it, and you will not heal till you are out: go in, do what you came for, get out.'],
    ['Objectives', 'Take the <b>Site 9 drive</b> - the lab\'s research, from its strongroom (underground, the north-east room). Take the <b>reactor log</b> from the control room in the middle of the reactor hall. Optionally, stop <b>Harrow</b>, the raiders\' chief, in the village.'],
    ['Your kit', 'An R4 rifle, a PX9, frags and a medkit.'],
  ],
  time: { date: [21, 9, 2026], hour: 15, minute: 10 }, faction: 'red',
  atmos: { fog: [0.62, 0.6, 0.45, 30, 300], ambient: [0.5, 0.5, 0.4], sun: [1, 0.92, 0.6, 1.15, 38, 200], sky: [0.95, 0.9, 0.62] },
  startLoadout: { primary: 'K7', backup: 'PX9', utility1: 'FRAG', utility2: 'MEDKIT', gear: 'LENSES' },
  extractName: 'the way in, on the highway', navCap: 60000, testNavCap: 600000, chaseMax: 60,
  outside: { backdrop: 'hills', mat: 'desert', tint: [0.68, 0.68, 0.62], margin: 14 },
  decals: { k: { mat: 'asphalt', tint: [0.6, 0.6, 0.58] } },
  legend: {
    d(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), v = (x * 3 + y) % 3; k.box([cx - 0.18, cy, cz - 0.18], [cx + 0.18, cy + 3.5 + v, cz + 0.18], 'wood', { tint: [0.25, 0.22, 0.2] }); k.box([cx - 1.2, cy + 2.6 + v * 0.5, cz - 0.05], [cx + 0.1, cy + 2.75 + v * 0.5, cz + 0.05], 'wood', { solid: false, tint: [0.25, 0.22, 0.2] }); k.box([cx - 0.05, cy + 1.9, cz], [cx + 0.05, cy + 2.05, cz + 1.1], 'wood', { solid: false, tint: [0.25, 0.22, 0.2] }); },
    x(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 2.05, cy + 0.2, cz - 0.85], [cx + 2.05, cy + 0.9, cz + 0.85], 'paint', { tint: [0.3, 0.2, 0.14] }); k.box([cx - 1.0, cy + 0.9, cz - 0.75], [cx + 0.8, cy + 1.35, cz + 0.75], 'metal', { tint: [0.32, 0.22, 0.16], solid: false }); },
    // a wrecked bus: long, on its side of the road
    b(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 5, cy + 0.3, cz - 1.25], [cx + 5, cy + 3.0, cz + 1.25], 'paint', { tint: [0.45, 0.4, 0.22] }); k.box([cx - 4.6, cy + 1.7, cz - 1.27], [cx + 4.6, cy + 2.6, cz + 1.27], 'glass', { solid: false, tint: [0.2, 0.2, 0.18] }); },
    y(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h, cy, cz - h], [cx + h, cy + 0.8 + ((x + y) % 3) * 0.3, cz + h], 'desert', { tint: [0.5, 0.48, 0.42] }); },
  },
  floors: {
    B: { y: -4.5, wallH: 3.2, wall: 'concrete2', wallTint: [0.72, 0.76, 0.74], floor: 'concrete', ceil: 'concrete2', lampPower: 0.55, lampColour: [0.85, 1, 0.9], lampEvery: 8, rows: B.map((r) => r.join('')) },
    G: { y: 0, wallH: 4.2, wall: 'concrete2', wallTint: [0.62, 0.6, 0.55], floor: 'concrete', floorTint: [0.6, 0.58, 0.54], ceil: 'metal', lampPower: 0.45, lampEvery: 12, rows: G.map((r) => r.join('')) },
    1: { y: 5.0, wallH: 1.2, roof: false, lamps: false, wall: 'wood', floor: 'wood', slab: 0.3, rows: F1.map((r) => r.join('')) },
  },
  stairs,
  ladders: [{ x: 10, y: 46, from: 'G', to: '1', back: [0, 1], off: [10, 47] }, { x: 24, y: 33, from: 'G', to: '1', back: [0, -1], off: [24, 32] }],
  start: { x: 2, y: 67, floor: 'G', yaw: -Math.PI / 2 },
  extract: { x: 2, y: 68, floor: 'G' },
  radiation: [
    { at: [67, 11], r: 20, rate: 4, name: 'the reactor' },
    { at: [40, 56], r: 6, rate: 3, name: 'the crater' },
    { at: [49, 31], r: 5, rate: 2.5, name: 'the drums' },
  ],
  extra(kit) {
    const { box, level, CELL: C } = kit;
    // the cooling towers: waisted, open-topped shells of rings
    for (const [x, y] of [[78, 4], [78, 14]]) {
      const cx = (x + 3) * C, cz = (y + 3) * C;
      for (let i = 0; i < 9; i++) { const h = i * 4, r = 8 - Math.sin(i / 8 * Math.PI) * 2.2; box([cx - r, h, cz - r], [cx + r, h + 4, cz + r], 'concrete2', { tint: [0.62 - i * 0.01, 0.6, 0.55], solid: i === 0 }); }
    }
    // the reactor hall's roof, broken: half of it fallen in; the vent stack
    box([60 * C, 4.2, 6 * C], [67 * C, 4.6, 17 * C], 'metal', { tint: [0.4, 0.38, 0.34] });
    box([71 * C, 0, 3 * C], [72.5 * C, 34, 4.5 * C], 'concrete2', { tint: [0.55, 0.52, 0.5] });
    // the watchtowers: legs, a platform, a roof
    for (const [x, y] of [[10, 47], [24, 32]]) {
      const cx = (x + 0.5) * C, cz = (y + 0.5) * C;
      box([cx - 1.4, 0, cz - 1.4], [cx + 1.4, 4.7, cz + 1.4], 'wood', { tint: [0.35, 0.3, 0.25] });      // its boarded-in base (the ladder up its side)
      box([cx - 1.6, 7.6, cz - 1.6], [cx + 1.6, 7.8, cz + 1.6], 'metal', { solid: false, tint: [0.4, 0.38, 0.32] });
      // a waist-high rail round the platform, open on the ladder's side
      const h = C / 2, ladN = y === 47;
      box([cx - h, 5, cz - h], [cx - h + 0.08, 6.1, cz + h], 'wood', { tint: [0.4, 0.34, 0.28] }); box([cx + h - 0.08, 5, cz - h], [cx + h, 6.1, cz + h], 'wood', { tint: [0.4, 0.34, 0.28] });
      if (ladN) box([cx - h, 5, cz + h - 0.08], [cx + h, 6.1, cz + h], 'wood', { tint: [0.4, 0.34, 0.28] }); else box([cx - h, 5, cz - h], [cx + h, 6.1, cz - h + 0.08], 'wood', { tint: [0.4, 0.34, 0.28] });
    }
    // the drums glow faintly; a warning sign at Site 9's gate and at the reactor
    level.lights.push({ pos: [49 * C, 1.5, 31 * C], range: 8, intensity: 0.8, color: [0.5, 1, 0.3] });
    level.signs.push({ pos: [27.5 * C + 0.4, 2.2, 39.5 * C], yaw: Math.PI / 2, w: 2.2, h: 0.6, text: 'SITE 9', sub: 'Ministry of Defence - no entry', col: '#5a4a14' });
    level.signs.push({ pos: [63 * C, 3.0, 17 * C + 0.15], yaw: 0, w: 2.6, h: 0.7, text: 'DANGER', sub: 'radiation - Hesk Unit 2', col: '#7a5a0a' });
  },
  zones: [
    { id: 'lab', label: 'Site 9 - the laboratory', at: [12, 38, 26, 48], floor: 'B' },
    { id: 'site9', label: 'Site 9', at: [SX, SY, SX1, SY1] },
    { id: 'hall', label: 'Hesk power station - the reactor hall', at: [60, 6, 73, 16] },
    { id: 'hesk', label: 'Hesk power station', at: [56, 0, 89, 24] },
    { id: 'village', label: 'The Vell valley - the village', at: [54, 42, 79, 60] },
    { id: 'road', label: 'The Vell valley - the old highway', at: [0, 64, W - 1, 71] },
    { id: 'all', label: 'The Vell valley', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'g1', at: [10, 47, '1'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'g2', at: [24, 32, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'g3', at: [13, 35, 'G'], arms: 'smg' },
    { id: 'g4', at: [22, 38, 'G'], route: [[20, 37], [20, 48]], arms: 'carbine' },
    { id: 'l1', at: [16, 43, 'B'], arms: 'smg', temper: 'steady' },
    { id: 'l2', at: [22, 40, 'B'], arms: 'shotgun' },
    { id: 'l3', at: [18, 47, 'B'], arms: 'carbine' },
    { id: 'v1', at: [58, 46, 'G'], arms: 'carbine' },
    { id: 'v2', at: [66, 47, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'harrow', at: [73, 46, 'G'], arms: 'shotgun', rank: 'officer', temper: 'steady', name: 'Harrow' },
    { id: 'v3', at: [62, 56, 'G'], arms: 'rocket' },
    { id: 'v4', at: [66, 51, 'G'], route: [[56, 51], [78, 51]], arms: 'carbine' },
    { id: 'r1', at: [44, 21, 'G'], route: [[36, 21], [56, 21]], arms: 'carbine' },
    { id: 'r2', at: [30, 58, 'G'], route: [[30, 54], [30, 64]], arms: 'smg' },
    { id: 'h1', at: [62, 13, 'G'], arms: 'lmg', temper: 'steady' },
  ],
  pickups: [
    { id: 'drive', name: 'The Site 9 drive', what: 'the drive', at: [24, 40, 'B'], h: 0.8, colour: [0.3, 0.8, 0.9] },
    { id: 'log', name: 'The reactor log', what: 'the log', at: [66, 11, 'G'], h: 0.8, colour: [0.85, 0.8, 0.3] },
  ],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'drive', text: 'Take the Site 9 drive (the laboratory, underground)' },
    { id: 'o2', kind: 'take', ref: 'log', text: 'Take the reactor log (the reactor hall\'s control room)' },
    { id: 'o3', kind: 'kill', ref: 'harrow', text: 'Stop Harrow, the raiders\' chief (the village)', optional: true },
  ],
};
