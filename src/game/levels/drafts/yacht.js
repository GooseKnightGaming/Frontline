// FRONTLINE - Level 36, the Megayacht (first draft, M6.29). From Rhys's environment-pack concept sheet:
// "Megayacht (onboard)". The Salt Crown, seventy metres of her, moored stern-in at the end of the Port Aurel
// marina - the arms broker Ilya Corwen's floating office. Four decks: the lower deck (the engine room, the
// crew's mess and cabins, the stores), the main deck (the aft deck, the saloon, the dining room, the galley,
// the foredeck), the upper deck (the owner's suite, the panic room, the sky lounge, the bridge) and the sun
// deck with its helipad. Her security runs from the bridge.
//
// A square is 1.5 m. Built from rows drawn here: the hull, decks and superstructure.
const W = 60, H = 28;
const grid = (ch) => Array.from({ length: H }, () => new Array(W).fill(ch));
const G = grid('~'), D1 = grid(' '), D2 = grid(' '), D3 = grid(' ');
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const ring = (g, x0, y0, x1, y1, ch) => { for (let x = x0; x <= x1; x++) { put(g, x, y0, ch); put(g, x, y1, ch); } for (let y = y0; y <= y1; y++) { put(g, x0, y, ch); put(g, x1, y, ch); } };
const rail = (g, x0, y0, x1, y1, gaps) => { ring(g, x0, y0, x1, y1, '='); for (const [x, y] of gaps || []) put(g, x, y, '.'); };

// ── the lower deck (G): the hull, in the water; the marina's pier along her south side
fill(G, 0, 20, W - 1, 25, 'p');
ring(G, 6, 8, 53, 19, '#'); fill(G, 7, 9, 52, 18, '.');
for (let y = 9; y <= 18; y++) { put(G, 19, y, '#'); put(G, 34, y, '#'); put(G, 45, y, '#'); }
for (let x = 20; x <= 33; x++) put(G, x, 14, '#');
for (const [x, y] of [[19, 11], [19, 16], [26, 14], [34, 12], [45, 13]]) put(G, x, y, 'D');
put(G, 34, 16, ':');
for (const [x, y] of [[9, 11], [12, 11], [15, 11], [9, 16], [12, 16], [15, 16]]) put(G, x, y, 'M');      // the engines
for (const [x, y] of [[22, 17], [25, 17], [28, 17], [31, 17]]) put(G, x, y, 'Y');                      // the crew's bunks
for (const [x, y] of [[24, 11], [29, 11]]) put(G, x, y, 'T');                                            // the mess
for (const [x, y] of [[41, 10], [42, 10], [43, 18], [44, 18]]) put(G, x, y, 'C'); put(G, 42, 12, 'B');   // the stores
for (const [x, y] of [[3, 22], [56, 23], [12, 24], [44, 24]]) put(G, x, y, 'C');                         // the pier's crates

// ── the main deck (1): open decks round the superstructure - the saloon, the dining room, the galley
fill(D1, 6, 8, 53, 19, '.');
rail(D1, 6, 8, 53, 19, [[30, 19], [31, 19]]);
fill(D1, 30, 20, 31, 20, '.');                                                // the gangway's top, over the pier
ring(D1, 15, 10, 47, 17, '#'); fill(D1, 16, 11, 46, 16, '.');                    // (side decks either side of it)
for (let y = 11; y <= 16; y++) { put(D1, 31, y, '#'); put(D1, 41, y, '#'); }
for (const [x, y] of [[15, 13], [15, 14], [31, 12], [31, 15], [41, 12], [41, 15], [47, 13], [22, 10], [36, 17]]) put(D1, x, y, 'D');
for (const [x, y] of [[18, 10], [26, 10], [18, 17], [26, 17], [33, 10], [38, 10], [33, 17]]) put(D1, x, y, 'W');
for (const [x, y] of [[18, 12], [18, 15], [24, 12], [20, 13]]) put(D1, x, y, 'Z'); fill(D1, 28, 11, 29, 11, 'K');     // the saloon
for (const [x, y] of [[34, 12], [37, 12]]) put(D1, x, y, 'T');                                            // the dining room
fill(D1, 43, 11, 46, 11, 'K'); fill(D1, 43, 16, 46, 16, 'K');                                              // the galley
for (const [x, y] of [[8, 11], [8, 16], [11, 11], [11, 16]]) put(D1, x, y, 'Z'); put(D1, 10, 13, 'T');     // the aft deck's loungers

// ── the upper deck (2): the owner's suite, the panic room, the sky lounge, the bridge
fill(D2, 6, 8, 48, 19, '.');
rail(D2, 6, 8, 48, 19);
ring(D2, 15, 10, 45, 17, '#'); fill(D2, 16, 11, 44, 16, '.');                    // (side decks either side, a walk round the bridge)
for (let y = 11; y <= 16; y++) { put(D2, 28, y, '#'); put(D2, 37, y, '#'); }
for (let x = 29; x <= 36; x++) put(D2, x, 14, '#'); for (let y = 11; y <= 13; y++) put(D2, 33, y, '#');
for (const [x, y] of [[28, 13], [31, 14], [37, 15], [15, 13], [33, 17], [22, 17]]) put(D2, x, y, 'D');
for (const [x, y] of [[45, 11], [45, 12], [45, 15], [45, 16], [40, 10], [43, 10], [40, 17], [43, 17], [19, 10], [25, 10]]) put(D2, x, y, 'W');
put(D2, 18, 12, 'Y'); put(D2, 25, 15, 'Z'); put(D2, 21, 16, 'H');                                         // the suite
fill(D2, 34, 11, 36, 11, 'H');                                                                             // cabinets (behind the panic room)
fill(D2, 43, 12, 43, 15, 'M');                                                                             // the bridge's consoles

// ── the sun deck (3): the helipad, aft, over the upper deck
fill(D3, 6, 8, 14, 19, '.');
rail(D3, 6, 8, 14, 19, [[9, 13], [10, 13]]);

const stairs = [
  { x: 30, y: 24, dir: 'N', len: 4, w: 2, from: 'G', to: '1' },       // the gangway, up from the pier
  { x: 36, y: 15, dir: 'E', len: 4, w: 2, from: 'G', to: '1' },       // the crew's stair, the stores to the dining room
  { x: 26, y: 15, dir: 'W', len: 4, w: 2, from: '1', to: '2' },       // the saloon's stair, up to the owner's suite
  { x: 9, y: 17, dir: 'N', len: 4, w: 2, from: '2', to: '3' },        // up to the sun deck
];

export default {
  id: 'yacht', no: 36, title: 'The Megayacht', place: 'the Salt Crown',
  where: 'The Salt Crown, moored at Port Aurel marina. 23:50, a warm night, music still coming from the saloon.',
  brief: [
    ['The place', 'Seventy metres of yacht, stern-in at the end of the marina; the gangway up from the pier to her main deck. <b>Lower deck</b>: the engine room (aft), the crew\'s mess and cabins, the stores (the crew\'s stair is there). <b>Main deck</b>: the aft deck, the saloon, the dining room, the galley, the foredeck. <b>Upper deck</b>: the owner\'s suite, the panic room, the sky lounge, the bridge (forward). The <b>sun deck</b> and its helipad, aft, at the top.'],
    ['The man', '<b>Ilya Corwen</b> brokers arms to anyone who pays - the reds most of all. His files are in the <b>panic room</b> off his suite. He has a journalist, <b>Mara Quill</b>, held below in the crew\'s cabins: she came too close.'],
    ['Security', 'Her security runs from the <b>bridge</b>: cameras over the decks (and a <b>pinhole camera</b> in the suite - EMF), a <b>laser tripwire</b> across the sky lounge, the suite and the panic room <b>maglocked</b>, turrets on the sun deck and the foredeck, the saloon\'s and the engine room\'s lights, the alarm. You carry a <b>hacking kit</b>. Corwen carries a <b>keycard</b>.'],
    ['The crew', 'Fifteen of his men. The bridge officer has the <b>radio</b>; the <b>engineer</b> is in the engine room; a <b>medic</b> in the crew\'s mess; a man with a <b>ballistic shield</b> on the main deck; a <b>marksman</b> on the sun deck who will not stay in one place.'],
    ['Objectives', 'Take Corwen\'s <b>files</b> from the panic room. Bring <b>Mara Quill</b> out. Optionally, stop Corwen.'],
  ],
  time: { date: [14, 11, 2026], hour: 23, minute: 50 }, night: true, faction: 'red', requires: 'HACKKIT', startGear: 'MULTIVIS',
  extractName: 'the end of the pier',
  outside: { backdrop: 'city', mat: 'concrete', margin: 10 },
  decals: { p: { mat: 'wood', tint: [0.55, 0.45, 0.35] } },
  floors: {
    G: { y: 0, wallH: 3.2, wall: 'paint', wallTint: [0.92, 0.92, 0.9], floor: 'wood', floorTint: [0.7, 0.62, 0.5], ceil: 'plaster', lampPower: 0.6, lampColour: [1, 0.92, 0.8], lampEvery: 8, rows: G.map((r) => r.join('')) },
    1: { y: 3.4, wallH: 3.0, wall: 'paint', wallTint: [0.95, 0.95, 0.93], floor: 'wood', floorTint: [0.75, 0.66, 0.52], ceil: 'plaster', lampPower: 0.75, lampColour: [1, 0.9, 0.75], lampEvery: 8, rows: D1.map((r) => r.join('')) },
    2: { y: 6.8, wallH: 3.0, wall: 'paint', wallTint: [0.95, 0.95, 0.93], floor: 'wood', floorTint: [0.75, 0.66, 0.52], ceil: 'plaster', lampPower: 0.7, lampColour: [1, 0.9, 0.75], lampEvery: 8, rows: D2.map((r) => r.join('')) },
    3: { y: 10.0, wallH: 1.2, roof: false, lamps: false, floor: 'concrete2', floorTint: [0.5, 0.52, 0.55], rows: D3.map((r) => r.join('')) },
  },
  stairs,
  start: { x: 2, y: 22, floor: 'G', yaw: -Math.PI / 2 },
  extract: { x: 1, y: 22, floor: 'G' },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // her hull below the waterline, her bow's point, the helipad's H, the mast over the bridge
    box([6 * C, -2.5, 8 * C], [54 * C, 0, 20 * C], 'paint', { tint: [0.15, 0.17, 0.22] });
    box([54 * C, -2.5, 10 * C], [57 * C, 3.3, 18 * C], 'paint', { tint: [0.92, 0.92, 0.9] });
    box([57 * C, -2.5, 12 * C], [59 * C, 3.3, 16 * C], 'paint', { tint: [0.92, 0.92, 0.9] });
    for (const [x0, z0, x1, z1] of [[8.2, 11, 8.6, 17], [11.4, 11, 11.8, 17], [8.6, 13.8, 11.4, 14.2]]) box([x0 * C, 10.01, z0 * C], [x1 * C, 10.03, z1 * C], 'hazard', { solid: false });
    box([mid(41) - 0.15, 9.8, mid(13) - 0.15], [mid(41) + 0.15, 16, mid(13) + 0.15], 'metal', { tint: [0.85, 0.85, 0.85] });
    level.lights.push({ pos: [mid(41), 15.6, mid(13)], range: 5, intensity: 1.2, color: [1, 0.2, 0.15], street: true });
    level.signs.push({ pos: [6 * C - 0.1, 2.0, 14 * C], yaw: -Math.PI / 2, w: 3.6, h: 0.7, text: 'SALT CROWN', sub: 'Port Aurel', col: '#1d2a40' });
    // the marina's lamps along the pier
    for (const x of [8, 20, 32, 44, 56]) { box([mid(x) - 0.08, 0, mid(25) - 0.08], [mid(x) + 0.08, 3.6, mid(25) + 0.08], 'metal', { tint: [0.3, 0.3, 0.32] }); level.lights.push({ pos: [mid(x), 3.5, mid(24.5)], range: 12, intensity: 0.9, color: [1, 0.9, 0.7], street: true }); }
  },
  zones: [
    { id: 'pad', label: 'Salt Crown - the sun deck', at: [6, 8, 14, 19], floor: '3' },
    { id: 'suite', label: 'Salt Crown - the owner\'s suite', at: [16, 11, 27, 16], floor: '2' },
    { id: 'panic', label: 'Salt Crown - the panic room', at: [29, 11, 32, 13], floor: '2' },
    { id: 'lounge', label: 'Salt Crown - the sky lounge', at: [29, 15, 36, 16], floor: '2' },
    { id: 'bridge', label: 'Salt Crown - the bridge', at: [38, 11, 44, 16], floor: '2' },
    { id: 'updeck', label: 'Salt Crown - the upper deck', at: [6, 8, 48, 19], floor: '2' },
    { id: 'saloon', label: 'Salt Crown - the saloon', at: [16, 11, 30, 16], floor: '1' },
    { id: 'dining', label: 'Salt Crown - the dining room', at: [32, 11, 40, 16], floor: '1' },
    { id: 'galley', label: 'Salt Crown - the galley', at: [42, 11, 46, 16], floor: '1' },
    { id: 'main', label: 'Salt Crown - the main deck', at: [6, 8, 53, 20], floor: '1' },
    { id: 'engine', label: 'Salt Crown - the engine room', at: [7, 9, 18, 18] },
    { id: 'mess', label: 'Salt Crown - the crew\'s mess', at: [20, 9, 33, 13] },
    { id: 'cabins', label: 'Salt Crown - the crew\'s cabins', at: [20, 15, 33, 18] },
    { id: 'stores', label: 'Salt Crown - the stores', at: [35, 9, 52, 18] },
    { id: 'pier', label: 'Port Aurel marina', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'corwen', at: [20, 14, '2'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Ilya Corwen', tint: [0.95, 0.95, 1.0], card: 'crown' },
    { id: 'bo', at: [40, 14, '2'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'b2', at: [41, 12, '2'], arms: 'smg' },
    { id: 'u1', at: [10, 18, '2'], route: [[7, 18], [47, 18], [47, 9], [7, 9]], arms: 'carbine' },
    { id: 'l1', at: [32, 16, '2'], arms: 'carbine', temper: 'steady' },
    { id: 'sun', at: [12, 10, '3'], arms: 'dmr', rank: 'specialist', temper: 'steady', perches: [[12, 10, '3'], [7, 18, '3'], [13, 18, '3']] },
    { id: 'a1', at: [9, 13, '1'], arms: 'smg' },
    { id: 's1', at: [22, 14, '1'], arms: 'pistol', temper: 'steady', shield: true },
    { id: 's2', at: [27, 12, '1'], arms: 'carbine' },
    { id: 'm1', at: [20, 18, '1'], route: [[7, 18], [52, 18], [52, 9], [7, 9]], arms: 'carbine' },
    { id: 'f1', at: [50, 13, '1'], arms: 'shotgun', temper: 'steady' },
    { id: 'g1', at: [44, 13, '1'], arms: 'pistol', temper: 'cowardly' },
    { id: 'eng', at: [13, 13, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'med', at: [27, 11, 'G'], arms: 'pistol', temper: 'cowardly', role: 'medic' },
    { id: 'c1', at: [27, 16, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'p1', at: [40, 22, 'G'], route: [[34, 22], [56, 22]], arms: 'carbine' },
  ],
  hostages: [{ id: 'quill', name: 'Mara Quill', she: true, at: [30, 17, 'G'] }],
  pickups: [{ id: 'files', name: 'Corwen\'s files', what: 'the files', at: [30, 11, '2'], h: 0.9, colour: [0.85, 0.8, 0.6] }],
  devices: [
    { id: 'c-saloon', kind: 'camera', at: [16, 11, '1'], face: [1, 1], net: 'crown' },
    { id: 'c-galley', kind: 'camera', at: [46, 12, '1'], face: [-1, 1], net: 'crown' },
    { id: 'c-bridge', kind: 'camera', at: [44, 16, '2'], face: [-1, -1], net: 'crown' },
    { id: 'c-engine', kind: 'camera', at: [7, 9, 'G'], face: [1, 1], net: 'crown' },
    { id: 'c-cabins', kind: 'camera', at: [20, 15, 'G'], face: [1, 1], net: 'crown' },
    { id: 'c-pin-suite', kind: 'camera', at: [27, 11, '2'], face: [-1, 1], net: 'crown', hidden: true },
    { id: 't-sun', kind: 'turret', at: [7, 9, '3'], face: [1, 1], net: 'crown' },
    { id: 't-fore', kind: 'turret', at: [51, 13, '1'], face: [-1, 0], net: 'crown' },
    { id: 'm-suite', kind: 'lock', at: [28, 13, '2'], net: 'crown' },
    { id: 'm-panic', kind: 'lock', at: [31, 14, '2'], net: 'crown' },
    { id: 'z-lounge', kind: 'laser', at: [34, 15, '2'], to: [34, 16], net: 'crown' },
    { id: 'l-saloon', kind: 'lights', at: [30, 15, '1'], face: [-1, 0], area: [16, 11, 30, 16], name: 'the saloon', net: 'crown' },
    { id: 'l-engine', kind: 'lights', at: [18, 10, 'G'], face: [-1, 0], area: [7, 9, 18, 18], name: 'the engine room', net: 'crown' },
    { id: 'a-bell', kind: 'alarm', at: [36, 11, '1'], face: [0, 1], net: 'crown' },
  ],
  terminals: [{ id: 'sec', name: 'the bridge\'s security console', at: [39, 12, '2'], face: [0, 1], time: 6, net: 'crown' }],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'files', text: 'Take Corwen\'s files (the panic room, the upper deck)' },
    { id: 'o2', kind: 'rescue', ref: 'quill', text: 'Bring Mara Quill out (the crew\'s cabins, the lower deck)' },
    { id: 'o3', kind: 'kill', ref: 'corwen', text: 'Stop Ilya Corwen', optional: true },
  ],
};
