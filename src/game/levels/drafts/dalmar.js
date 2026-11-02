// FRONTLINE - Level 45, the Dalmar Star (first draft, M6.44): the end of the blight. The manifest from the grain
// terminal named her: a bulk freighter at the Kessin docks, loading the export grain at dawn - and the blight
// with it. Go aboard before she sails: take the blight out of her hold, and find out from her radio log who it was
// for. The man who bought it is aboard to see it loaded.
//
// A square is 1.5 m. Built from rows drawn here: the hold, the main deck, the bridge deck.
const W = 62, H = 27;
const grid = (ch) => Array.from({ length: H }, () => new Array(W).fill(ch));
const G = grid('~'), D1 = grid(' '), D2 = grid(' ');
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const ring = (g, x0, y0, x1, y1, ch) => { for (let x = x0; x <= x1; x++) { put(g, x, y0, ch); put(g, x, y1, ch); } for (let y = y0; y <= y1; y++) { put(g, x0, y, ch); put(g, x1, y, ch); } };
const rail = (g, x0, y0, x1, y1, gaps) => { ring(g, x0, y0, x1, y1, '='); for (const [x, y] of gaps || []) put(g, x, y, '.'); };

// ── the hold (G): the grain hold forward, the engine room aft of a bulkhead; the dock along her south side
fill(G, 0, 20, W - 1, 26, 'p');
ring(G, 6, 8, 57, 19, '#'); fill(G, 7, 9, 56, 18, '.');
for (let y = 9; y <= 18; y++) put(G, 18, y, '#');                         // the engine room's bulkhead (aft, west)
put(G, 18, 13, 'D'); put(G, 18, 14, 'D');
for (const [x, y] of [[9, 11], [12, 11], [15, 11], [9, 16], [12, 16], [15, 16]]) put(G, x, y, 'M');      // the engines
for (const [x0, x1] of [[22, 25], [29, 32], [47, 50], [53, 55]]) { fill(G, x0, 10, x1, 11, 'C'); fill(G, x0, 16, x1, 17, 'C'); }   // the cargo
for (const [x, y] of [[36, 10], [37, 10], [36, 17], [37, 17], [44, 13]]) put(G, x, y, 'B');              // the blight's drums, and others
for (const [x, y] of [[3, 22], [12, 24], [46, 23], [58, 22]]) put(G, x, y, 'C');                         // the dock's crates

// ── the main deck (1): containers in rows, the superstructure aft
fill(D1, 6, 8, 57, 19, '.');
rail(D1, 6, 8, 57, 19, [[30, 19], [31, 19]]);
fill(D1, 30, 20, 31, 20, '.');                                              // the gangway's top, over the dock
ring(D1, 7, 10, 17, 17, '#'); fill(D1, 8, 11, 16, 16, '.');                 // the superstructure: the crew's mess
put(D1, 17, 13, 'D'); put(D1, 17, 14, 'D'); put(D1, 12, 10, 'W'); put(D1, 12, 17, 'W');
put(D1, 14, 12, 'T'); put(D1, 14, 15, 'T'); put(D1, 9, 11, 'K');
for (const [x0, x1] of [[22, 26], [33, 37], [48, 52]]) { fill(D1, x0, 10, x1, 11, 'C'); fill(D1, x0, 16, x1, 17, 'C'); }

// ── the bridge deck (2): the bridge over the superstructure, a wing either side
fill(D2, 6, 8, 18, 19, '.');
rail(D2, 6, 8, 18, 19);
ring(D2, 8, 10, 17, 17, '#'); fill(D2, 9, 11, 16, 16, '.');
put(D2, 17, 13, 'D'); put(D2, 17, 14, 'D'); put(D2, 13, 10, 'W'); put(D2, 13, 17, 'W'); put(D2, 17, 11, 'W'); put(D2, 17, 16, 'W');
fill(D2, 16, 12, 16, 15, 'M');                                              // the bridge's consoles, looking forward
put(D2, 13, 12, 'T');

const stairs = [
  { x: 30, y: 24, dir: 'N', len: 4, w: 2, from: 'G', to: '1' },       // the gangway, up from the dock
  { x: 40, y: 14, dir: 'E', len: 4, w: 2, from: 'G', to: '1' },       // the hold's ladder-stair, up to the deck
  { x: 10, y: 15, dir: 'N', len: 3, w: 2, from: '1', to: '2' },       // up from the mess to the bridge
];

export default {
  id: 'dalmar', no: 45, title: 'The Dalmar Star', place: 'the Dalmar Star',
  where: 'The Dalmar Star, at the Kessin docks. 05:10, an hour before she sails.',
  brief: [
    ['The ship', 'A bulk freighter, loading the export grain - and the blight with it. Up the gangway from the dock to her <b>main deck</b> (containers in rows, the superstructure aft); down the stair amidships to the <b>hold</b> (cargo forward, the engine room aft); up from the crew\'s mess to the <b>bridge</b>.'],
    ['The blight', 'In drums, in the hold. Take the <b>blight</b> off her. Her <b>radio log</b> on the bridge says who it was for - and the man who bought it, <b>Anselm Rook</b>, is aboard to see it loaded.'],
    ['Security', 'Cameras on the deck and in the hold, the hold\'s lights, a turret on the bridge wing, the alarm - run from the bridge. The radio is on the bridge; the engineer in the engine room; a dog with the man on the dock.'],
    ['Objectives', 'Take the <b>blight</b> (the hold). Copy the <b>radio log</b> (the bridge). Optionally, stop <b>Anselm Rook</b>. Out along the dock, to the west.'],
  ],
  // (M6.44) how the blight ends (the debrief)
  epilogue: {
    success: 'The drums go into the river police\'s launch at six; the Dalmar Star sails empty of them at seven. Rook\'s radio log names the buyer - a ministry, not a market - and the spring\'s consignment is cancelled before it is grown. The blight is finished.',
    partial: 'The Dalmar Star sails late, and lighter than she meant to. But something of what Varn grew is still out there, and the radio log could have said where. The blight is not quite finished.',
  },
  time: { date: [30, 12, 2026], hour: 5, minute: 10 }, night: true, faction: 'red', requires: 'HACKKIT', startGear: 'MULTIVIS', weather: 'wind',
  atmos: { fog: [0.16, 0.18, 0.22, 25, 180], ambient: [0.3, 0.31, 0.36] },
  extractName: 'the dock, to the west',
  outside: { backdrop: 'city', mat: 'concrete', margin: 10 },
  decals: { p: { mat: 'concrete2', tint: [0.6, 0.6, 0.62] } },
  floors: {
    G: { y: 0, wallH: 3.6, wall: 'metal', wallTint: [0.5, 0.42, 0.36], floor: 'metal', floorTint: [0.4, 0.38, 0.36], ceil: 'metal', lampPower: 0.55, lampColour: [1, 0.85, 0.6], lampEvery: 8, rows: G.map((r) => r.join('')) },
    1: { y: 3.8, wallH: 3.0, wall: 'paint', wallTint: [0.85, 0.85, 0.82], floor: 'metal', floorTint: [0.5, 0.25, 0.2], ceil: 'metal', lampPower: 0.6, lampColour: [1, 0.9, 0.75], lampEvery: 8, rows: D1.map((r) => r.join('')) },
    2: { y: 7.0, wallH: 3.0, wall: 'paint', wallTint: [0.85, 0.85, 0.82], floor: 'metal', floorTint: [0.45, 0.45, 0.47], ceil: 'metal', lampPower: 0.6, lampColour: [1, 0.9, 0.75], lampEvery: 8, rows: D2.map((r) => r.join('')) },
  },
  stairs,
  start: { x: 1, y: 23, floor: 'G', yaw: -Math.PI / 2 },
  extract: { x: 1, y: 22, floor: 'G' },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // her hull below the waterline and her bow; the funnel over the superstructure; her name
    box([6 * C, -3, 8 * C], [58 * C, 0, 20 * C], 'paint', { tint: [0.35, 0.12, 0.1] });
    box([58 * C, -3, 10 * C], [61 * C, 3.7, 18 * C], 'paint', { tint: [0.2, 0.22, 0.26] });
    box([mid(11) - 1.2, 10, mid(13.5) - 1.0], [mid(11) + 1.2, 15, mid(13.5) + 1.0], 'paint', { tint: [0.85, 0.7, 0.15] });
    level.signs.push({ pos: [mid(30), 2.6, 20 * C + 0.12], yaw: 0, w: 4.4, h: 0.8, text: 'DALMAR STAR', sub: 'Kessin', col: '#2b1a16' });
    // the dock's lamps, and cranes over it (a skyline)
    for (const x of [6, 22, 38, 54]) { box([mid(x) - 0.08, 0, mid(26) - 0.08], [mid(x) + 0.08, 4, mid(26) + 0.08], 'metal', { tint: [0.3, 0.3, 0.32] }); level.lights.push({ pos: [mid(x), 3.9, mid(25.5)], range: 13, intensity: 1, color: [1, 0.85, 0.6], street: true }); }
    for (const x of [20, 44]) { box([mid(x) - 0.6, 0, mid(26) - 0.6], [mid(x) + 0.6, 24, mid(26) + 0.6], 'metal', { tint: [0.75, 0.55, 0.15] }); box([mid(x) - 0.4, 23, mid(10)], [mid(x) + 0.4, 24, mid(26) + 0.6], 'metal', { tint: [0.75, 0.55, 0.15], solid: false }); }
  },
  zones: [
    { id: 'bridge', label: 'Dalmar Star - the bridge', at: [8, 10, 17, 17], floor: '2' },
    { id: 'wing', label: 'Dalmar Star - the bridge deck', at: [6, 8, 18, 19], floor: '2' },
    { id: 'mess', label: 'Dalmar Star - the crew\'s mess', at: [7, 10, 17, 17], floor: '1' },
    { id: 'deck', label: 'Dalmar Star - the main deck', at: [6, 8, 57, 20], floor: '1' },
    { id: 'engine', label: 'Dalmar Star - the engine room', at: [7, 9, 17, 18] },
    { id: 'hold', label: 'Dalmar Star - the hold', at: [19, 9, 56, 18] },
    { id: 'dock', label: 'The Kessin docks', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'rook', at: [34, 13, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Anselm Rook', tint: [0.95, 0.95, 1.0] },
    { id: 'hd1', at: [38, 12, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'hd2', at: [27, 14, 'G'], route: [[20, 14], [52, 14]], arms: 'smg' },
    { id: 'eng', at: [11, 13, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'capt', at: [12, 13, '2'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'br2', at: [15, 16, '2'], arms: 'smg' },
    { id: 'wing', at: [7, 9, '2'], arms: 'dmr', rank: 'specialist', temper: 'steady', perches: [[7, 9, '2'], [7, 18, '2'], [18, 9, '2']] },
    { id: 'm1', at: [28, 18, '1'], route: [[19, 18], [56, 18], [56, 9], [19, 9]], arms: 'carbine' },
    { id: 'm2', at: [42, 13, '1'], arms: 'shotgun', temper: 'steady' },
    { id: 'mess', at: [12, 14, '1'], arms: 'pistol', temper: 'cowardly', role: 'medic' },
    { id: 'gang', at: [33, 18, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'dk', at: [24, 23, 'G'], route: [[10, 23], [50, 23]], arms: 'carbine', dog: true },
  ],
  pickups: [{ id: 'blight', name: 'The blight', what: 'the blight', at: [36, 11, 'G'], table: false, h: 1.05, colour: [0.55, 0.75, 0.2] }],
  devices: [
    { id: 'c-deck', kind: 'camera', at: [57, 8, '1'], face: [-1, 1], net: 'dalmar' },
    { id: 'c-gang', kind: 'camera', at: [18, 19, '1'], face: [1, -1], net: 'dalmar' },
    { id: 'c-hold', kind: 'camera', at: [56, 9, 'G'], face: [-1, 1], net: 'dalmar' },
    { id: 'c-pin-br', kind: 'camera', at: [9, 11, '2'], face: [1, 1], net: 'dalmar', hidden: true },
    { id: 't-wing', kind: 'turret', at: [18, 19, '2'], face: [1, -1], net: 'dalmar' },
    { id: 'l-hold', kind: 'lights', at: [19, 10, 'G'], face: [1, 0], area: [19, 9, 56, 18], name: 'the hold', net: 'dalmar' },
    { id: 'a-ship', kind: 'alarm', at: [17, 12, '1'], face: [1, 0], net: 'dalmar' },
  ],
  terminals: [
    { id: 'sec', name: 'the bridge\'s security console', at: [9, 16, '2'], face: [1, 0], time: 6, net: 'dalmar' },
    { id: 'log', name: 'the radio log', at: [15, 11, '2'], face: [0, 1], time: 8, reveal: 25, verb: 'Copy', doing: 'Copying',
      said: 'The radio log: Rook\'s traffic, and the buyer named in it. Ghost has it. Every red aboard on your radar for 25 seconds.' },
  ],
  // (M6.58) papers to read: lore, not needed to finish
  intel: [
    { id: "notice", at: [14, 12, "1"], kind: "Crew notice", title: "Notice - the crew mess", text: ["By order of the Master: no crew in No. 2 hold while the special cargo is aboard.", "Mr Rook and his men have the run of the ship. Do not ask them anything."] },
    { id: "log", at: [13, 12, "2"], kind: "Log page", title: "A page from the deck log", text: ["04:20 - Mr Rook aboard with two men. Inspected the hold. Satisfied.", "04:45 - Radio traffic for Mr Rook from Varnholm, in code. Logged as \"private\"."] },
  ],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'blight', text: 'Take the blight (the hold)' },
    { id: 'o2', kind: 'hack', ref: 'log', text: 'Copy the radio log (the bridge)' },
    { id: 'o3', kind: 'kill', ref: 'rook', text: 'Stop Anselm Rook', optional: true },
  ],
};
