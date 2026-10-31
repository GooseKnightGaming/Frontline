// FRONTLINE - Level 8, the Housing Estate (first draft). Rhys: "several houses,
// tightly packed - terraced, detached and semis; ordinary houses and bungalows; a corner shop,
// garages... one an 'upside-down' house - bedrooms on the ground floor, kitchen and dining room
// upstairs. Heights vary: two floors, two and an attic, three." The houses are stamped from one plan
// (a hall and its stair up one side, two rooms either side of a cross wall), mirrored for the
// south side of the street.
const W = 72, H = 46, CELL = 1.2;
const grid = () => Array.from({ length: H }, () => new Array(W).fill(' '));
const G = grid(), F1 = grid(), F2 = grid();
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const stamp = (g, x0, y0, rows, flip) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '?') put(g, x0 + i, flip ? y0 + rows.length - 1 - j : y0 + j, r[i]); });
const stairs = [], ladders = [];
// a house 7 squares wide and 9 deep, its front at the bottom (flip: at the top); kind: 'house' | 'upside' | 'bungalow'; storeys 1-3
const HOUSE_G = {
  // (Rhys: "back doors still lead directly into the concrete pillars of stairs") the back room opens
  // off the front room through the cross wall - the hall's far end is the stair
  house:  ['####D##', '#.#...#', '#.#.T.#', '#.#...#', '#.##D##', '#.#...#', '#.D.Z.#', '#.#...#', '#D##W##'],
  upside: ['####D##', '#.#...#', '#.#.Y.#', '#.#...#', '#.##D##', '#.#...#', '#.D.Y.#', '#.#...#', '#D##W##'],
  bungalow: ['####D##', '#...#.#', '#.Y.D.#', '#...#.#', '###D#.#', '#...#.#', '#.Z.D.#', '#...#.#', '#D##W##'],
};
const HOUSE_1 = {
  house:  ['###W###', '#.D...#', '#.#.Y.#', '#.#...#', '#.##D##', '#.#...#', '###.Y.#', '###...#', '###W###'],
  upside: ['###W###', '#.D...#', '#.#.T.#', '#.#.K.#', '#.##D##', '#.#...#', '###.Z.#', '###...#', '###W###'],
};
const ATTIC = ['#######', '#.....#', '#.....#', '#..Y..#', '#.....#', '#.....#', '#.....#', '#.....#', '#######'];
const houses = [];
function house(x0, y0, kind, storeys, flip) {
  stamp(G, x0, y0, HOUSE_G[kind], flip);
  const Y = (j) => (flip ? y0 + 8 - j : y0 + j);
  if (storeys > 1) {
    stamp(F1, x0, y0, HOUSE_1[kind === 'upside' ? 'upside' : 'house'], flip);
    // the stair up the hall: from the front (foot) to the back (head), on the left-hand side
    stairs.push({ x: x0 + 1, y: Y(5), dir: flip ? 'S' : 'N', len: 4, w: 1, from: 'G', to: '1' });
  }
  if (storeys > 2) {
    stamp(F2, x0, y0, ATTIC, flip);
    // a ladder up to the attic, in the back bedroom against the side wall
    ladders.push({ x: x0 + 5, y: Y(2), from: '1', to: '2', back: [1, 0] });
  }
  houses.push({ x0, y0, kind, storeys, flip });
}
// ── the north side of Linden Row (fronts facing south onto the road) ──
// the corner shop, then a terrace of five, a pair of semis, a detached house of three storeys
stamp(G, 1, 11, ['############', '#..........#', '#.KKKKKK...#', '#..........#', '#.H.H.H.H..#', '#..........#', '#.H.H.H.H..#', '#..........#', '##WWDDWW####']);
stamp(G, 9, 11, ['####', '#..#', 'D..#', '#..#', '####']);      // the shop's back store
for (let i = 0; i < 5; i++) house(14 + i * 6, 11, i === 2 ? 'upside' : 'house', i === 4 ? 3 : 2, false);
house(47, 11, 'house', 2, false); house(53, 11, 'house', 2, false);
house(63, 11, 'house', 3, false);
// ── the south side (fronts facing north) ──
house(2, 25, 'bungalow', 1, true); house(10, 25, 'bungalow', 1, true);
house(19, 25, 'house', 2, true); house(25, 25, 'house', 3, true);
for (let i = 0; i < 3; i++) house(34 + i * 6, 25, 'house', 2, true);
// the lock-up garages, east end
// (Rhys: "garages need garage doors") each a pair of up-and-over doors across its front
for (let i = 0; i < 3; i++) stamp(G, 57 + i * 4, 26, ['#####', '#...#', '#...#', '#...#', '#...#', '#LL##'].reverse());
// ── gardens and alleys: fences between the back gardens; gates to the back alleys ──
for (const [y0, y1] of [[4, 10], [35, 41]]) {
  for (let x = 1; x < 70; x++) { put(G, x, y0 === 4 ? 3 : 42, 'f'); }
  for (const h of houses) if ((h.flip ? 35 : 4) === y0) { for (let y = y0; y <= y1; y++) { put(G, h.x0, y, 'f'); put(G, h.x0 + 6, y, 'f'); } put(G, h.x0 + 3, y0 === 4 ? 3 : 42, ' '); }
}
// the road: parked cars along it
for (const [x, y] of [[8, 21], [18, 23], [30, 21], [41, 23], [52, 21], [60, 23], [5, 23]]) put(G, x, y, 'v');
for (const [x, y] of [[16, 6], [29, 8], [50, 7], [22, 38], [40, 37], [66, 6]]) put(G, x, y, 't');
for (const [x, y] of [[20, 7], [36, 8], [44, 38], [14, 37]]) put(G, x, y, 'C');

export default {
  id: 'estate', no: 8, title: 'The Housing Estate', place: 'the Linden Row estate', cell: CELL,
  where: 'Linden Row, the Hollins estate. 16:40, a grey afternoon.',
  brief: [
    ['The place', 'One street of ordinary houses: on the north side the corner shop, a terrace of five, a pair of semis and a three-storey house at the end; on the south side two bungalows, more houses and the lock-up garages. Back gardens behind every house, fenced, with gates onto the back alleys. Two houses have attics - up a ladder from the back bedroom. Number 7, the middle of the terrace, is an upside-down house: its bedrooms are downstairs.'],
    ['The reds', 'A cell of twelve, living here as neighbours: in the houses, in the gardens, on the street, and two walking the alleys.'],
    ['Objectives', 'Take the <b>bomb plans</b> from Number 7 (the kitchen, upstairs). Stop the cell\'s bomb-maker, <b>Ferris</b> - in the attic of the three-storey house at the end of the terrace. Optionally, bring <b>Mrs Adeyemi</b> out of Number 22 - they have kept her in her own front room for a week.'],
    ['Doors', 'House doors are ordinary - E opens them. The lock-up garages are locked: kick them in.'],
  ],
  time: { date: [30, 7, 2026], hour: 16, minute: 40 }, faction: 'red',
  extractName: 'the van at the end of Linden Row',
  outside: { backdrop: 'city', mat: 'asphalt', margin: 16 },
  floors: {
    G: { y: 0, wallH: 2.8, rows: G.map((r) => r.join('')), wall: 'brick', floor: 'carpet', ceil: 'plaster', lampEvery: 6, lampPower: 0.8 },
    1: { y: 3.0, wallH: 2.8, rows: F1.map((r) => r.join('')), wall: 'brick', floor: 'carpet', ceil: 'plaster', lampEvery: 6, lampPower: 0.8 },
    2: { y: 6.0, wallH: 2.3, rows: F2.map((r) => r.join('')), wall: 'brick', floor: 'wood', ceil: 'wood', lampEvery: 6, lampPower: 0.7 },
  },
  stairs, ladders,
  doorSkins: Object.fromEntries([0, 1, 2].map((i) => ['G:' + (58 + i * 4) + ',26', { mat: 'shutter', build: 'sturdy', locked: true, label: 'garage door' }])),
  // (Rhys: "no indication of which house is which?") a number on every front door - odd along the
  // north side (the shop is 1), even along the south - and the shop's sign over its window
  extra(kit) {
    const { level, CELL: C } = kit, T = kit.S.wallT;
    const north = houses.filter((h) => !h.flip).sort((a, b) => a.x0 - b.x0), south = houses.filter((h) => h.flip).sort((a, b) => a.x0 - b.x0);
    const plate = (h, no) => {
      const wy = h.flip ? h.y0 : h.y0 + 8, out = h.flip ? -1 : 1;
      level.signs.push({ pos: [(h.x0 + 2.6) * C, 1.75, (wy + 0.5) * C + out * (T / 2 + 0.03)], yaw: h.flip ? Math.PI : 0, w: 0.42, h: 0.3, text: String(no), sub: '', col: '#e9e4d8' });
    };
    north.forEach((h, i) => plate(h, 3 + i * 2));
    south.forEach((h, i) => plate(h, 18 + i * 2));
    level.signs.push({ pos: [6.5 * C, 2.35, (19 + 0.5) * C + T / 2 + 0.03], yaw: 0, w: 2.6, h: 0.42, text: 'LINDEN STORES', sub: 'No. 1 - open till late', col: '#2f6f4f' });
    level.signs.push({ pos: [70.5 * C, 2.4, 20.2 * C], yaw: -Math.PI / 2, w: 1.6, h: 0.36, text: 'LINDEN ROW', sub: 'Hollins Estate', col: '#24364f' });
  },
  start: { x: 70, y: 22, floor: 'G', yaw: Math.PI / 2, van: [0, 3] },
  zones: [
    { id: 'shop', label: 'Linden Row - the corner shop', at: [1, 11, 12, 19], floor: 'G' },
    { id: 'n7', label: 'Linden Row - Number 7', at: [26, 11, 32, 19], floor: 'G' },
    { id: 'n7up', label: 'Linden Row - Number 7, upstairs', at: [26, 11, 32, 19], floor: '1' },
    { id: 'end', label: 'Linden Row - Number 11, the end of the terrace', at: [38, 11, 44, 19], floor: 'G' },
    { id: 'attic', label: 'Number 11 - the attic', at: [38, 11, 44, 19], floor: '2' },
    { id: 'n22', label: 'Linden Row - Number 22', at: [19, 25, 25, 33], floor: 'G' },
    { id: 'garages', label: 'Linden Row - the lock-up garages', at: [56, 25, 71, 31], floor: 'G' },
  ],
  guards: [
    { id: 'e1', at: [20, 22, 'G'], route: [[4, 22], [66, 22]], arms: 'carbine' },
    { id: 'e2', at: [40, 2, 'G'], route: [[2, 2], [68, 2]], arms: 'pistol' },
    { id: 'e3', at: [30, 43, 'G'], route: [[68, 43], [2, 43]], arms: 'smg' },
    { id: 'e4', at: [5, 15, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'e5', at: [29, 13, '1'], arms: 'smg', temper: 'steady' },
    { id: 'e6', at: [30, 17, 'G'], arms: 'carbine' },
    { id: 'ferris', at: [41, 15, '2'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'Ferris' },
    { id: 'e8', at: [42, 13, '1'], arms: 'shotgun', temper: 'steady' },
    { id: 'e9', at: [22, 30, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'e10', at: [57, 7, 'G'], arms: 'carbine', rank: 'sergeant' },
    { id: 'e11', at: [59, 28, 'G'], arms: 'smg' },
    { id: 'e12', at: [28, 30, '1'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
  ],
  hostages: [{ id: 'adeyemi', name: 'Mrs Adeyemi', she: true, at: [22, 27, 'G'] }],
  pickups: [{ id: 'plans', name: 'The bomb plans', what: 'the plans', at: [30, 13, '1'], table: false, h: 0.8, colour: [0.55, 0.65, 0.85] }],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'plans', text: 'Take the bomb plans (Number 7, upstairs)' },
    { id: 'o2', kind: 'kill', ref: 'ferris', text: 'Stop Ferris, the bomb-maker (Number 11, the attic)' },
    { id: 'o3', kind: 'rescue', ref: 'adeyemi', text: 'Bring Mrs Adeyemi out of Number 22', optional: true },
  ],
};
