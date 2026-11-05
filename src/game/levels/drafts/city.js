// FRONTLINE - Level 21, the Busy City (first draft). Rhys (after M6.13.7): "Busy City; Desolated
// City; Post-Apocalyptic Nuclear Wasteland" - and (M8) vehicle missions. Varnholm's commercial district at
// midday: a grid of blocks, towers on them, traffic going round. The reds' paymaster is moving the month's
// money out of the city in a courier van; their books are in an office in Kessel Tower.
//
// The grid: four blocks by three, each 18 squares, the streets between them 4 (a square 2.5 m). Most of the
// blocks are built up solid (towers you see, not go into); Kessel Tower, the Corso cafe and the car park
// are the places you go. Traffic loops round three of the blocks - it stops for whoever is in its way, and
// you can take one of the parked cars by the way in.
const CELL = 2.5, B = 18, S = 4, NX = 4, NY = 3;
const W = S + NX * (B + S), H = S + NY * (B + S);
const bx0 = (i) => i * (B + S) + S, bx1 = (i) => bx0(i) + B - 1;
const G = Array.from({ length: H }, () => new Array(W).fill(' '));
const F1 = Array.from({ length: H }, () => new Array(W).fill(' '));
const F2 = Array.from({ length: H }, () => new Array(W).fill(' '));
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const stamp = (g, x0, y0, rows) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '?') put(g, x0 + i, y0 + j, r[i]); });
let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;

// every block: a pavement round its edge; the streets are the ground (asphalt) between
for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
  const x0 = bx0(i), y0 = bx0(j), x1 = bx1(i), y1 = bx1(j);
  for (let x = x0; x <= x1; x++) { put(G, x, y0, 'p'); put(G, x, y1, 'p'); }
  for (let y = y0; y <= y1; y++) { put(G, x0, y, 'p'); put(G, x1, y, 'p'); }
}
// the solid towers: a block's lot (inside its pavement) split into two to four buildings with alleys between
const towers = [];
const SPECIAL = { '1,1': 'kessel', '2,1': 'carpark', '1,2': 'corso', '3,0': 'plaza', '0,2': 'start' };
for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
  const kind = SPECIAL[i + ',' + j];
  const x0 = bx0(i) + 1, y0 = bx0(j) + 1, x1 = bx1(i) - 1, y1 = bx1(j) - 1;
  if (kind === 'plaza') continue;
  const lots = [];
  if (kind === 'start') lots.push([x0, y0, x1, y0 + 6], [x0, y0 + 9, x0 + 6, y1], [x0 + 9, y0 + 9, x1, y1]);
  else if (kind === 'kessel' || kind === 'carpark' || kind === 'corso') lots.push(...(kind === 'corso' ? [[x0 + 9, y0, x1, y1]] : []));
  else {
    const cut = 6 + Math.floor(rnd() * 5);
    if (rnd() < 0.5) lots.push([x0, y0, x0 + cut - 1, y1], [x0 + cut + 2, y0, x1, y0 + 6], [x0 + cut + 2, y0 + 9, x1, y1]);
    else lots.push([x0, y0, x1, y0 + cut - 1], [x0, y0 + cut + 2, x0 + 6, y1], [x0 + 9, y0 + cut + 2, x1, y1]);
  }
  for (const [a, b, c, d] of lots) {
    if (c - a < 2 || d - b < 2) continue;
    fill(G, a, b, c, d, 'J');
    towers.push({ x0: a, y0: b, x1: c, y1: d, h: 14 + Math.floor(rnd() * 10) * 4, tint: [0.65 + rnd() * 0.3, 0.65 + rnd() * 0.3, 0.68 + rnd() * 0.3], awning: rnd() < 0.5 });
  }
}

// ── Kessel Tower (block 1,1): the reds' front - "Kessel Freight Services" - three storeys you go into, the
// rest of the tower solid above them. The lobby and its desk; offices on the first floor; the books upstairs
const KX = bx0(1) + 2, KY = bx0(1) + 2;          // its north-west corner
stamp(G, KX, KY, [
  '##W##W##W##W##',
  '#....#.......#',
  '#....#.......W',
  '#....D.......#',
  '#....#..H.H..#',
  'W....#.......W',
  '###D##.......#',
  '#............#',
  '#..KKK.......W',
  '#............#',
  'W.....P..P...#',
  '#............#',
  '#............W',
  '##W##DD##W####',
]);
stamp(F1, KX, KY, [
  '##W##W##W##W##',
  '#....#.......#',
  '#....#..T.T..W',
  '#....D.......#',
  '#....#..T.T..#',
  'W....#.......W',
  '###D##...#####',
  '#........#...#',
  '#........D.Z.W',
  '#........#...#',
  'W..T.....#####',
  '#........#...#',
  '#........D.H.W',
  '##W##W##W#####',
]);
stamp(F2, KX, KY, [
  '##W##W##W##W##',
  '#....#.......#',
  '#....#..T....W',
  '#....D.......#',
  '#....#..H.H..#',
  'W....#.......W',
  '###D##.......#',
  '#........#####',
  '#........D...W',
  '#........#.T.#',
  'W..T..T..#...#',
  '#........#####',
  '#............W',
  '##W##W##W#####',
]);
// the stairs: up from the lobby's west side, and on up from the first floor
const stairs = [
  { x: KX + 1, y: KY + 7, dir: 'S', len: 4, w: 2, from: 'G', to: '1' },
  { x: KX + 6, y: KY + 12, dir: 'N', len: 4, w: 2, from: '1', to: '2' },
];
// ── the car park (block 2,1): an open lot, its booth, the cars - and the courier's van
const PX = bx0(2), PY = bx0(1);
for (let x = PX + 2; x <= bx1(2) - 2; x += 2) for (const y of [PY + 3, PY + 8, PY + 12]) if (rnd() < 0.7) put(G, x, y, 'v');
stamp(G, PX + 13, PY + 14, ['####', '#..W', 'D..#', '####']);
for (let x = PX + 1; x <= bx1(2) - 1; x++) { put(G, x, PY + 1, 'w'); }
put(G, PX + 8, PY + 1, ' '); put(G, PX + 9, PY + 1, ' '); put(G, PX + 10, PY + 1, ' ');
// ── the Corso cafe (block 1,2), on the corner: tables inside and out
const CX = bx0(1) + 1, CY = bx0(2) + 1;
stamp(G, CX, CY, [
  '###W##W##',
  '#.......#',
  'W.T..T..W',
  '#.......#',
  'D..T....#',
  'D.......W',
  '#.KKKK..#',
  '#.......#',
  '####D#W##',
]);
for (const [x, y] of [[CX + 2, CY + 10], [CX + 5, CY + 10], [CX + 2, CY + 13], [CX + 5, CY + 13]]) put(G, x, y, 'T');
// ── the plaza (block 3,0): trees, benches, a fountain
const ZX = bx0(3), ZY = bx0(0);
for (const [x, y] of [[ZX + 3, ZY + 3], [ZX + 14, ZY + 3], [ZX + 3, ZY + 14], [ZX + 14, ZY + 14], [ZX + 8, ZY + 2], [ZX + 2, ZY + 9]]) put(G, x, y, 't');
fill(G, ZX + 7, ZY + 7, ZX + 10, ZY + 10, 'o');
for (const [x, y] of [[ZX + 5, ZY + 8], [ZX + 12, ZY + 8], [ZX + 8, ZY + 5], [ZX + 8, ZY + 12]]) put(G, x, y, 'w');

// street trees along the pavements, here and there
for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) for (const [x, y] of [[bx0(i) + 4, bx0(j)], [bx1(i) - 4, bx1(j)], [bx0(i), bx0(j) + 9]]) if (G[y][x] === 'p' && rnd() < 0.6) put(G, x, y, 'q');

// traffic: three cars round three blocks (on the left - the road's inner lane), and a bus round the middle
const lane = (i, j, o) => { const a = bx0(i) - o, b = bx1(i) + o, c = bx0(j) - o, d = bx1(j) + o, m = (u, v) => (u + v) / 2; return [[a, c], [m(a, b), c], [b, c], [b, m(c, d)], [b, d], [m(a, b), d], [a, d], [a, m(c, d)]]; };
const loopOf = (i, j, o, from) => { const L = lane(i, j, o); return L.slice(from).concat(L.slice(0, from)); };
// the courier's way out: from the car park's gate, round the Corso's block, west, then north up the far side
// and out of the city to the east along the top street
const sx = (k) => k * (B + S) + 1.5;          // a street's middle (squares)
const courier = [[PX + 9, PY - 1.2], [sx(2) + 0.8, PY - 1.2], [sx(2) + 0.8, sx(3) - 0.8], [sx(1) - 0.8, sx(3) - 0.8], [sx(0) + 0.8, sx(3) - 0.8], [sx(0) + 0.8, sx(2)], [sx(0) + 0.8, sx(1)], [sx(0) + 0.8, sx(0) + 0.8], [sx(1), sx(0) + 0.8], [sx(2), sx(0) + 0.8], [sx(3), sx(0) + 0.8], [sx(4), sx(0) + 0.8], [W + 2, sx(0) + 0.8], [W + 6, sx(0) + 0.8]];

const startX = sx(0) + 1, startY = bx0(2) + 14;
export default {
  id: 'city', no: 21, title: 'The Busy City', place: 'Varnholm - the commercial district', cell: CELL,
  where: 'Varnholm, the commercial district. 12:55, a bright, busy lunchtime.',
  brief: [
    ['The place', 'Twelve blocks of the commercial district, towers on most of them, traffic going round. <b>Kessel Tower</b> (the middle of the second row) - the reds\' front, "Kessel Freight Services": a lobby, offices on the first floor, the books on the second. The <b>car park</b> beside it. The <b>Corso cafe</b>, south of the tower, on the corner. The plaza in the north-east.'],
    ['The money', 'At five past one their paymaster\'s courier leaves the car park in a van with the month\'s money, round the district and out of the city to the east along the top street. <b>Stop the van</b> before it gets out of the city - two cars are parked by the way in for you, and a car hits a man hard.'],
    ['The books', 'Take the <b>ledger</b> from Kessel Freight\'s office (the second floor, the north-east room). Optionally stop <b>Vos</b>, the paymaster: he takes his lunch at the Corso.'],
    ['Driving', 'E beside a car to get in: W/S, A/D, SPACE to brake, E to get out. Hold right mouse to keep the view where you aim. The traffic stops for whoever is in its way.'],
  ],
  epilogue: {
    success: "Kessel Freight Services is closed for good by Friday. Its ledger is on Ghost's desk, its courier's van never left the city, and Vos has paid for his last lunch at the Corso.",
    partial: "Part of Kessel's business is broken up, and the rest of it has gone very quiet.",
  },
  time: { date: [17, 8, 2026], hour: 12, minute: 55 }, faction: 'red',
  startLoadout: { primary: 'K7', backup: 'PX9', utility1: 'FRAG', utility2: 'SMOKE', gear: 'LENSES' },
  extractName: 'Ghost\'s car, back where you came in', vehicle: false, navCap: 60000, testNavCap: 800000, chaseMax: 70, pieceBudget: 9000,
  outside: { backdrop: 'city', mat: 'asphalt', tint: [1.35, 1.35, 1.38], margin: 14 },
  decals: { p: { mat: 'concrete2', tint: [0.78, 0.76, 0.72] } },
  legend: {
    // a fountain's basin (four squares make it): a rim, the water
    o(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h, cy, cz - h], [cx + h, cy + 0.55, cz + h], 'marble', { tint: [0.82, 0.8, 0.76] }); k.box([cx - h + 0.2, cy + 0.5, cz - h + 0.2], [cx + h - 0.2, cy + 0.56, cz + h - 0.2], 'glass', { solid: false, tint: [0.4, 0.6, 0.8] }); },
    // a street tree in its pit on the pavement
    q(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 0.15, cy, cz - 0.15], [cx + 0.15, cy + 3, cz + 0.15], 'wood', { tint: [0.45, 0.32, 0.22] }); k.box([cx - 1.2, cy + 2.6, cz - 1.2], [cx + 1.2, cy + 4.8, cz + 1.2], 'hedge', { solid: false }); },
  },
  floors: {
    G: { y: 0, wallH: 4.0, wall: 'cladding', wallTint: [0.85, 0.87, 0.9], floor: 'marble', floorTint: [0.85, 0.85, 0.82], ceil: 'plaster', lampPower: 0.75, rows: G.map((r) => r.join('')) },
    1: { y: 4.4, wallH: 3.4, wall: 'plaster', floor: 'carpet', floorTint: [0.5, 0.55, 0.62], ceil: 'plaster', lampPower: 0.75, rows: F1.map((r) => r.join('')) },
    2: { y: 8.2, wallH: 3.4, wall: 'plaster', floor: 'carpet', floorTint: [0.55, 0.45, 0.4], ceil: 'plaster', lampPower: 0.75, rows: F2.map((r) => r.join('')) },
  },
  stairs,
  start: { x: startX, y: startY, floor: 'G', yaw: Math.PI },
  extract: { x: startX, y: startY, floor: 'G' },
  vehicles: [
    // yours: by the way in
    { id: 'ghostcar', kind: 'car', model: 'lightUtility', paint: 'ghost', at: [sx(0) + 0.6, startY - 7], yaw: 0, hp: 450 },
    { id: 'ghostjeep', kind: 'jeep', model: 'armouredJeep', paint: 'olive', at: [sx(0) + 0.6, startY + 7], yaw: 0, hp: 700 },
    // the courier: waits in the car park till five past one, then goes
    { id: 'van', kind: 'car', model: 'lightUtility', paint: 'red', at: [PX + 9, PY + 5], yaw: 0, path: courier, speed: 13, goal: 'escape', wait: 40, hp: 520, name: 'The courier\'s van',
      crew: [{ id: 'courier', at: [-0.42, 0.15] }, { id: 'vanguard', at: [0.42, 0.15] }] },
    // the traffic
    { id: 't1', kind: 'car', model: 'policeCar', paint: 'white', path: loopOf(0, 0, 1.2, 1), speed: 9, loop: true, traffic: true, hp: 300 },
    { id: 't2', kind: 'car', model: 'lightUtility', paint: 'sand', path: loopOf(3, 1, 1.2, 4), speed: 8, loop: true, traffic: true, hp: 300 },
    { id: 't3', kind: 'car', model: 'lightUtility', paint: 'white', path: loopOf(2, 2, 1.2, 7), speed: 9, loop: true, traffic: true, hp: 300 },
    { id: 't4', kind: 'car', model: 'policeCar', paint: 'white', path: loopOf(1, 0, 1.2, 3), speed: 8, loop: true, traffic: true, hp: 300 },
  ],
  extra(kit) {
    const { box, level, CELL: C } = kit;
    // the towers: each a solid block, its height in storeys, a roof edge, and an awning over the pavement on some
    for (const t of towers) {
      const x0 = t.x0 * C, z0 = t.y0 * C, x1 = (t.x1 + 1) * C, z1 = (t.y1 + 1) * C;
      box([x0, 0, z0], [x1, t.h, z1], 'facade', { tint: t.tint });
      box([x0 - 0.2, t.h, z0 - 0.2], [x1 + 0.2, t.h + 0.6, z1 + 0.2], 'concrete2', { tint: [0.6, 0.6, 0.62] });
      box([x0 - 0.15, 0, z0 - 0.15], [x1 + 0.15, 4, z1 + 0.15], 'cladding', { tint: [0.35, 0.36, 0.38], solid: false });
      if (t.awning) box([x0, 3.2, z1], [x1, 3.35, z1 + 1.6], 'cloth', { solid: false, tint: [0.7 * t.tint[0], 0.25, 0.22] });
    }
    // Kessel Tower above its three storeys, the car park booth's roof, a cafe awning
    const kx0 = KX * C, kz0 = KY * C, kx1 = (KX + 14) * C, kz1 = (KY + 14) * C;
    box([kx0, 11.8, kz0], [kx1, 46, kz1], 'facade', { tint: [0.55, 0.62, 0.72] });
    box([CX * C, 3.5, (CY + 9) * C], [(CX + 9) * C, 3.65, (CY + 9) * C + 2], 'cloth', { solid: false, tint: [0.2, 0.45, 0.35] });
    // the road markings: a dashed line down the middle of every street
    for (let k = 0; k <= NX; k++) { const x = (k * (B + S) + 2) * C; for (let z = 2; z < H * C; z += 6) box([x - 0.08, 0.02, z], [x + 0.08, 0.035, z + 2.5], 'paint', { solid: false, tint: [0.9, 0.88, 0.8] }); }
    for (let k = 0; k <= NY; k++) { const z = (k * (B + S) + 2) * C; for (let x = 2; x < W * C; x += 6) box([x, 0.02, z - 0.08], [x + 2.5, 0.035, z + 0.08], 'paint', { solid: false, tint: [0.9, 0.88, 0.8] }); }
    // signs: the tower's name over its doors, the cafe, the car park
    level.signs.push({ pos: [(KX + 6) * C, 4.6, (KY + 14) * C + 0.12], yaw: 0, w: 5, h: 0.7, text: 'KESSEL TOWER', sub: 'Kessel Freight Services - floors 1 and 2', col: '#1f2c3d' });
    level.signs.push({ pos: [(CX + 4.5) * C, 3.0, (CY + 9) * C + 0.12], yaw: 0, w: 3, h: 0.5, text: 'CAFFE CORSO', sub: 'lunch - coffee', col: '#2c5a46' });
    level.signs.push({ pos: [(PX + 9.5) * C, 3.2, PY * C - 0.1], yaw: Math.PI, w: 3.2, h: 0.5, text: 'CAR PARK', sub: 'Kessel Tower - permit holders', col: '#24364f' });
  },
  zones: [
    { id: 'k2', label: 'Kessel Tower - Kessel Freight, the second floor', at: [KX, KY, KX + 13, KY + 13], floor: '2' },
    { id: 'k1', label: 'Kessel Tower - the first floor', at: [KX, KY, KX + 13, KY + 13], floor: '1' },
    { id: 'kg', label: 'Kessel Tower - the lobby', at: [KX, KY, KX + 13, KY + 13] },
    { id: 'park', label: 'Varnholm - the car park', at: [bx0(2), bx0(1), bx1(2), bx1(1)] },
    { id: 'corso', label: 'Varnholm - Caffe Corso', at: [CX, CY, CX + 8, CY + 14] },
    { id: 'plaza', label: 'Varnholm - Market Plaza', at: [bx0(3), bx0(0), bx1(3), bx1(0)] },
    { id: 'all', label: 'Varnholm - the commercial district', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    // the van
    { id: 'courier', at: [PX + 9, PY + 5, 'G'], arms: 'smg', temper: 'steady', name: 'The courier' },
    { id: 'vanguard', at: [PX + 9, PY + 6, 'G'], arms: 'carbine', temper: 'steady' },
    // the car park
    { id: 'p1', at: [PX + 14, PY + 15, 'G'], arms: 'pistol' },
    { id: 'p2', at: [PX + 4, PY + 10, 'G'], route: [[PX + 3, PY + 10], [PX + 15, PY + 10]], arms: 'carbine' },
    // Kessel Tower
    { id: 'k1', at: [KX + 3, KY + 9, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'k2', at: [KX + 9, KY + 10, 'G'], arms: 'smg' },
    { id: 'k3', at: [KX + 9, KY + 3, 'G'], arms: 'carbine' },
    { id: 'k4', at: [KX + 4, KY + 8, '1'], route: [[KX + 3, KY + 8], [KX + 4, KY + 12]], arms: 'smg' },
    { id: 'k5', at: [KX + 10, KY + 4, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'k6', at: [KX + 11, KY + 11, '1'], arms: 'shotgun' },
    { id: 'k7', at: [KX + 3, KY + 3, '2'], arms: 'smg', temper: 'steady' },
    { id: 'k8', at: [KX + 10, KY + 9, '2'], arms: 'carbine', rank: 'sergeant', temper: 'steady' },
    { id: 'k9', at: [KX + 5, KY + 10, '2'], arms: 'dmr', rank: 'specialist' },
    // the Corso
    { id: 'vos', at: [CX + 5, CY + 2, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Vos' },
    { id: 'c1', at: [CX + 2, CY + 3, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'c2', at: [CX + 3, CY + 11, 'G'], arms: 'carbine' },
    // the streets
    { id: 's1', at: [bx0(2) + 3, bx1(2), 'G'], route: [[bx0(2) + 1, bx1(2)], [bx1(2) - 1, bx1(2)]], arms: 'carbine' },
    { id: 's2', at: [bx0(3) + 8, bx0(0) + 4, 'G'], route: [[bx0(3) + 2, bx0(0) + 5], [bx0(3) + 15, bx0(0) + 5]], arms: 'smg' },
    { id: 's3', at: [bx1(0), bx0(1) + 5, 'G'], route: [[bx1(0), bx0(1) + 1], [bx1(0), bx1(1) - 1]], arms: 'pistol' },
  ],
  pickups: [{ id: 'ledger', name: 'The Kessel ledger', what: 'the ledger', at: [KX + 11, KY + 9, '2'], h: 0.8, colour: [0.55, 0.25, 0.2] }],
  // (M6.68) papers to read: lore, not needed to finish
  intel: [
    { id: 'receipt', at: [29, 51, 'G'], h: 0.78, kind: 'Receipt', title: 'A receipt, left under a saucer', text: ['Two coffees, Caffe Corso, 12:10. On the back, a time and a word: "13:05 - Kessel."'] },
    { id: 'invoice', at: [39, 37, '2'], h: 0.78, kind: 'Invoice', title: 'An invoice, Kessel Freight', text: ['"Machine parts", forty crates, paid in cash, collected by a customer who gave no name.', 'Someone has written "again" on it and filed it under nothing.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'stop', ref: 'van', text: 'Stop the courier\'s van before it leaves the city' },
    { id: 'o2', kind: 'take', ref: 'ledger', text: 'Take the ledger (Kessel Tower, the second floor)' },
    { id: 'o3', kind: 'kill', ref: 'vos', text: 'Stop Vos, the paymaster (Caffe Corso)', optional: true },
  ],
};
