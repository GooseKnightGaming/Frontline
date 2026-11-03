// FRONTLINE - Level 60, the Varna Star (first draft, M6.77; the handler's third order, and the end of him). The
// loading list named a ship: the Varna Star, a coaster at the Varnholm quay, sailing on the evening tide for Kessin.
// The gold was to go with her. It will not now, but the handler will: him, and every red in Varnholm whose name is
// in his book. Take him alive before she sails, and copy the passenger list from her bridge.
//
// A square is 1.5 m. Built from rows drawn here: the hold, the main deck, the bridge deck (as the Dalmar Star).
const W = 56, H = 26;
const grid = (ch) => Array.from({ length: H }, () => new Array(W).fill(ch));
const G = grid('~'), D1 = grid(' '), D2 = grid(' ');
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const ring = (g, x0, y0, x1, y1, ch) => { for (let x = x0; x <= x1; x++) { put(g, x, y0, ch); put(g, x, y1, ch); } for (let y = y0; y <= y1; y++) { put(g, x0, y, ch); put(g, x1, y, ch); } };
const rail = (g, x0, y0, x1, y1, gaps) => { ring(g, x0, y0, x1, y1, '='); for (const [x, y] of gaps || []) put(g, x, y, '.'); };

// ── the hold (G): the engine room aft (west) of a bulkhead, the cargo hold forward; the quay along her south side
fill(G, 0, 20, W - 1, 25, 'p');
ring(G, 6, 8, 49, 19, '#'); fill(G, 7, 9, 48, 18, '.');
for (let y = 9; y <= 18; y++) put(G, 16, y, '#');
put(G, 16, 13, 'D'); put(G, 16, 14, 'D');
for (const [x, y] of [[9, 12], [12, 12], [9, 16], [12, 16]]) put(G, x, y, 'M');                     // the engines
for (const [x0, x1] of [[20, 23], [27, 30], [44, 47]]) { fill(G, x0, 10, x1, 11, 'C'); fill(G, x0, 16, x1, 17, 'C'); }
for (const [x, y] of [[4, 22], [14, 24], [40, 23], [52, 22]]) put(G, x, y, 'C');                     // the quay's crates

// ── the main deck (1): hatch covers and deck cargo, the passenger saloon aft
fill(D1, 6, 8, 49, 19, '.');
rail(D1, 6, 8, 49, 19, [[28, 19], [29, 19]]);
fill(D1, 28, 20, 29, 20, '.');                                              // the gangway's top, over the quay
ring(D1, 7, 10, 16, 17, '#'); fill(D1, 8, 11, 15, 16, '.');                 // the passenger saloon
put(D1, 16, 13, 'D'); put(D1, 16, 14, 'D'); put(D1, 11, 10, 'W'); put(D1, 11, 17, 'W');
put(D1, 13, 12, 'T'); put(D1, 13, 15, 'T'); put(D1, 8, 11, 'K');
for (const [x0, x1] of [[21, 25], [32, 35], [44, 47]]) { fill(D1, x0, 10, x1, 11, 'C'); fill(D1, x0, 16, x1, 17, 'C'); }

// ── the bridge deck (2): the bridge over the saloon, a wing either side
fill(D2, 6, 8, 17, 19, '.');
rail(D2, 6, 8, 17, 19);
ring(D2, 8, 10, 16, 17, '#'); fill(D2, 9, 11, 15, 16, '.');
put(D2, 16, 13, 'D'); put(D2, 16, 14, 'D'); put(D2, 12, 10, 'W'); put(D2, 12, 17, 'W'); put(D2, 16, 11, 'W'); put(D2, 16, 16, 'W');
fill(D2, 15, 12, 15, 15, 'M');                                              // the consoles, looking forward
put(D2, 12, 12, 'T');

const stairs = [
  { x: 28, y: 24, dir: 'N', len: 4, w: 2, from: 'G', to: '1' },       // the gangway, up from the quay
  { x: 37, y: 13, dir: 'E', len: 4, w: 2, from: 'G', to: '1' },       // the hold's stair, up to the deck
  { x: 10, y: 15, dir: 'N', len: 3, w: 2, from: '1', to: '2' },       // up from the saloon to the bridge
];

export default {
  id: 'varna', no: 60, title: 'The Varna Star', place: 'the Varna Star, at the Varnholm quay',
  where: 'The Varna Star, at the Varnholm quay. 17:40, an hour before the evening tide.',
  brief: [
    ['The job', 'The handler\'s third order: the <b>Varna Star</b> takes him out of Varnholm tonight, with everyone in his book. <b>Take the handler alive</b>: hold him up and tie him, or knock him out. Dead, he tells Ghost nothing. Copy the <b>passenger list</b> from her bridge. It names his people. If you can, <b>disable her engines</b> so that nobody sails on her.'],
    ['The ship', 'A coaster at the quay. Up the gangway to her <b>main deck</b> (deck cargo, the <b>passenger saloon</b> aft), down the stair amidships to the <b>hold</b> (cargo forward, the <b>engine room</b> aft), and up from the saloon to the <b>bridge</b>.'],
    ['Security', 'Cameras on the deck and in the hold, the alarm, all run from the bridge. The radio is on the bridge, the engineer in the engine room, a dog on the quay. The handler is a coward. Shot at, he runs.'],
    ['Objectives', '<b>Take the handler alive</b> (the saloon). Copy the <b>passenger list</b> (the bridge). If you can, <b>disable the engines</b> (the engine room). Out along the quay, west.'],
  ],
  epilogue: {
    success: 'The handler talks for three days. The passenger list and his book have the same forty names, and by the end of the week thirty-one of them are in custody. The Varna Star never sails. The reds in Varnholm have nobody left to give them orders.',
    partial: 'Either the handler or his list, not both. Some of his people will be on the next ship out, and the reds will send Varnholm a new handler.',
  },
  time: { date: [4, 2, 2027], hour: 17, minute: 40 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'wind',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.2, 0.21, 0.26, 25, 180], ambient: [0.3, 0.3, 0.35] },
  extractName: 'the quay, west',
  outside: { backdrop: 'city', mat: 'concrete', margin: 10 },
  decals: { p: { mat: 'concrete2', tint: [0.6, 0.6, 0.62] } },
  floors: {
    G: { y: 0, wallH: 3.6, wall: 'metal', wallTint: [0.4, 0.45, 0.5], floor: 'metal', floorTint: [0.4, 0.38, 0.36], ceil: 'metal', lampPower: 0.55, lampColour: [1, 0.85, 0.6], lampEvery: 8, rows: G.map((r) => r.join('')) },
    1: { y: 3.8, wallH: 3.0, wall: 'paint', wallTint: [0.85, 0.85, 0.82], floor: 'metal', floorTint: [0.25, 0.3, 0.4], ceil: 'metal', lampPower: 0.6, lampColour: [1, 0.9, 0.75], lampEvery: 8, rows: D1.map((r) => r.join('')) },
    2: { y: 7.0, wallH: 3.0, wall: 'paint', wallTint: [0.85, 0.85, 0.82], floor: 'metal', floorTint: [0.45, 0.45, 0.47], ceil: 'metal', lampPower: 0.6, lampColour: [1, 0.9, 0.75], lampEvery: 8, rows: D2.map((r) => r.join('')) },
  },
  stairs,
  start: { x: 1, y: 23, floor: 'G', yaw: -Math.PI / 2 },
  extract: { x: 1, y: 22, floor: 'G' },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // her hull and bow; the funnel; her name
    box([6 * C, -3, 8 * C], [50 * C, 0, 20 * C], 'paint', { tint: [0.15, 0.2, 0.3] });
    box([50 * C, -3, 10 * C], [53 * C, 3.7, 18 * C], 'paint', { tint: [0.2, 0.22, 0.26] });
    box([mid(10) - 1.0, 10, mid(13.5) - 0.9], [mid(10) + 1.0, 14, mid(13.5) + 0.9], 'paint', { tint: [0.85, 0.2, 0.15] });
    level.signs.push({ pos: [mid(30), 2.6, 20 * C + 0.12], yaw: 0, w: 4.4, h: 0.8, text: 'VARNA STAR', sub: 'Varnholm', col: '#16202b' });
    for (const x of [6, 22, 38, 52]) { box([mid(x) - 0.08, 0, mid(25) - 0.08], [mid(x) + 0.08, 4, mid(25) + 0.08], 'metal', { tint: [0.3, 0.3, 0.32] }); level.lights.push({ pos: [mid(x), 3.9, mid(24.5)], range: 13, intensity: 1, color: [1, 0.85, 0.6], street: true }); }
  },
  zones: [
    { id: 'bridge', label: 'Varna Star - the bridge', at: [8, 10, 16, 17], floor: '2' },
    { id: 'wing', label: 'Varna Star - the bridge deck', at: [6, 8, 17, 19], floor: '2' },
    { id: 'saloon', label: 'Varna Star - the passenger saloon', at: [7, 10, 16, 17], floor: '1' },
    { id: 'deck', label: 'Varna Star - the main deck', at: [6, 8, 49, 20], floor: '1' },
    { id: 'engine', label: 'Varna Star - the engine room', at: [7, 9, 15, 18] },
    { id: 'hold', label: 'Varna Star - the hold', at: [17, 9, 48, 18] },
    { id: 'quay', label: 'The Varnholm quay', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'handler', at: [12, 14, '1'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The handler', tint: [0.55, 0.4, 0.3] },
    { id: 'bg', at: [14, 12, '1'], arms: 'smg', temper: 'steady' },
    { id: 'capt', at: [13, 15, '2'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio', name: 'The captain' },
    { id: 'mate', at: [13, 13, '2'], arms: 'carbine', temper: 'steady' },
    { id: 'eng', at: [10, 14, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'h1', at: [33, 13, 'G'], route: [[18, 13], [47, 13]], arms: 'carbine' },
    { id: 'd1', at: [30, 18, '1'], route: [[18, 18], [48, 18], [48, 9], [18, 9]], arms: 'carbine' },
    { id: 'd2', at: [41, 13, '1'], arms: 'smg', temper: 'steady' },
    { id: 'gang', at: [27, 18, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'q1', at: [24, 22, 'G'], route: [[8, 22], [48, 22]], arms: 'carbine', dog: true },
  ],
  civilians: [
    { id: 'cook', at: [9, 15, '1'], yaw: -Math.PI / 2, title: 'The ship\'s cook', tint: [1.1, 1.1, 1.05], says: ['Forty covers tonight, he says. Forty passengers, on a coaster. I have plates for twelve.', 'The man in the brown coat jumps at every door.'] },
  ],
  devices: [
    { id: 'c-deck', kind: 'camera', at: [49, 8, '1'], face: [-1, 1], net: 'varna' },
    { id: 'c-gang', kind: 'camera', at: [17, 19, '1'], face: [1, -1], net: 'varna' },
    { id: 'c-hold', kind: 'camera', at: [48, 9, 'G'], face: [-1, 1], net: 'varna' },
    { id: 'a-ship', kind: 'alarm', at: [16, 12, '1'], face: [1, 0], net: 'varna' },
  ],
  terminals: [
    { id: 'sec', name: 'the bridge\'s security console', at: [9, 16, '2'], face: [1, 0], time: 6, net: 'varna' },
    { id: 'list', name: 'the passenger list', at: [14, 11, '2'], face: [0, 1], time: 8, reveal: 20, verb: 'Copy', doing: 'Copying',
      said: 'Forty names, and a cabin each. Ghost has them all. Every red aboard is on your radar for 20 seconds.' },
    { id: 'engines', name: 'the engine controls', at: [13, 9, 'G'], face: [0, 1], time: 8, verb: 'Disable', doing: 'Disabling',
      said: 'The fuel cut, the starters pulled. The Varna Star will not sail tonight, or any night soon.' },
  ],
  intel: [
    { id: 'book', at: [13, 12, '1'], kind: 'Notebook', title: 'The handler\'s pocket book', text: ['Forty names, the same forty, in his own hand. Beside each a sum, and beside some, "loyal", and beside a few, "watch".', 'On the last page: "If taken, say nothing. They cannot prove anything without the book."'] },
    { id: 'orders', at: [12, 12, '2'], kind: 'Orders', title: 'Sailing orders', text: ['Sail on the evening tide. Kessin by morning. No stop, no signal, no questions about the passengers.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'capture', ref: 'handler', text: 'Take the handler alive (the saloon)' },
    { id: 'o2', kind: 'hack', ref: 'list', text: 'Copy the passenger list (the bridge)' },
    { id: 'o3', kind: 'hack', ref: 'engines', text: 'Disable the engines (the engine room)', optional: true },
  ],
};
