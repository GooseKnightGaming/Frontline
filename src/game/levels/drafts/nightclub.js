// FRONTLINE - Level 30, the Neon Nightclub (first draft). From Rhys's location boards (part
// 2): "Neon Nightclub - exteriors, interiors, props and furniture, VIP". Club VELVET on the waterfront strip:
// the queue under its neon, the door; the dance floor under the coloured lights, the DJ on his stage, the two
// bars; the VIP lounge on the mezzanine over the floor; the office and the store behind. It belongs to
// "Saint", the reds' money man - and tonight it is shut for his private party.
// A square is 1.5 m.
const CELL = 1.5, W = 48, H = 46;
const grid = () => Array.from({ length: H }, () => new Array(W).fill(' '));
const G = grid(), M = grid();
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const ring = (g, x0, y0, x1, y1, ch) => { for (let x = x0; x <= x1; x++) { put(g, x, y0, ch); put(g, x, y1, ch); } for (let y = y0; y <= y1; y++) { put(g, x0, y, ch); put(g, x1, y, ch); } };

// the club: x 4-43, y 8-41. The entrance and coat check (south), the dance floor (middle), the stage (north)
ring(G, 4, 8, 43, 41, '#'); fill(G, 5, 9, 42, 40, '.');
for (let x = 5; x <= 42; x++) put(G, x, 34, '#');                         // the lobby's wall
put(G, 23, 34, 'D'); put(G, 24, 34, 'D');
put(G, 23, 41, 'D'); put(G, 24, 41, 'D');                                  // the front doors
fill(G, 8, 37, 13, 37, 'K'); put(G, 36, 38, 'H'); put(G, 38, 38, 'H');     // the coat check; the cloakroom rails
// the dance floor (x 14-33, y 15-31) - the lit floor itself is built in extra; the bars along the sides
fill(G, 6, 16, 6, 30, 'K'); fill(G, 41, 16, 41, 30, 'K');                  // the bars, their counters
for (const y of [18, 22, 26]) { put(G, 9, y, 'T'); put(G, 38, y, 'T'); }
for (const y of [20, 24, 28]) { put(G, 11, y, 'Z'); put(G, 36, y, 'Z'); }
// the stage (north): the DJ's booth on it, speaker stacks either side
fill(G, 15, 9, 32, 12, 'J');
// the back: the office (north-west), the store (north-east), the corridor behind the stage
for (let y = 9; y <= 14; y++) { put(G, 13, y, '#'); put(G, 34, y, '#'); }
for (let x = 5; x <= 12; x++) put(G, x, 14, '#'); for (let x = 35; x <= 42; x++) put(G, x, 14, '#');
put(G, 10, 14, 'D'); put(G, 37, 14, 'D'); put(G, 13, 11, 'D'); put(G, 34, 11, 'D');
put(G, 7, 10, 'T'); put(G, 11, 12, 'H'); put(G, 37, 10, 'C'); put(G, 39, 10, 'C'); put(G, 41, 12, 'B');
// the mezzanine (M, 4 m): the VIP lounge round three sides of the floor, open over it, railed; Saint's booth
// in the north-east corner, over the store
ring(M, 4, 8, 43, 41, '#'); fill(M, 5, 9, 42, 33, '.');
fill(M, 13, 15, 34, 33, 'O');                                              // open over the dance floor
for (let x = 13; x <= 34; x++) put(M, x, 14, 'k'); for (let y = 15; y <= 33; y++) { put(M, 12, y, 'q'); put(M, 35, y, 'q'); }
for (let x = 5; x <= 42; x++) put(M, x, 34, '#');
for (const [x, y] of [[7, 18], [7, 24], [7, 30], [40, 18], [40, 24], [40, 30], [24, 10]]) put(M, x, y, 'Z');
for (const [x, y] of [[9, 18], [9, 24], [38, 18], [38, 24], [26, 11]]) put(M, x, y, 'T');
ring(M, 34, 8, 43, 14, '#'); fill(M, 35, 9, 42, 13, '.'); put(M, 38, 14, 'D'); put(M, 39, 14, 'D');   // Saint's booth
put(M, 40, 10, 'Z'); put(M, 37, 10, 'T');
// the street out front: palms, the queue's rope, a parked car
for (const x of [2, 12, 34, 45]) put(G, x, 43, 'a');
for (const [x, y] of [[16, 44], [30, 44]]) put(G, x, y, 'v');

const stairs = [
  { x: 5, y: 31, dir: 'N', len: 4, w: 2, from: 'G', to: 'M' },            // up to the VIP lounge (west side)
  { x: 41, y: 32, dir: 'N', len: 4, w: 1, from: 'G', to: 'M' },           // the staff stair (east)
];

export default {
  id: 'nightclub', no: 30, title: 'The Neon Nightclub', place: 'Club VELVET', cell: CELL, windows: false,
  where: 'Club VELVET, the waterfront strip, Varnholm. 01:30, a closed party.',
  brief: [
    ['The place', 'Club VELVET: the door and the coat check (south); the <b>dance floor</b> under the coloured lights, the DJ on the stage at its north end, a bar down each side. The <b>VIP lounge</b> on the mezzanine round three sides of the floor, open over it - the stair up at the floor\'s south-west corner, the staff stair at the south-east. Behind the stage: the <b>office</b> (west) and the store (east).'],
    ['The party', 'Shut tonight for <b>Saint</b> - the reds\' money man - and his guests: all of them his. Saint keeps to his own booth up on the mezzanine, over the store.'],
    ['Objectives', 'Stop <b>Saint</b> (his booth, the mezzanine\'s north-east corner). Take his <b>ledger</b> from the office behind the stage. Optionally, cut the club\'s power at the DJ\'s desk - lights out, they will not see you coming.'],
  ],
  time: { date: [17, 10, 2026], hour: 1, minute: 30 }, faction: 'red', night: true,
  atmos: { ambient: [0.22, 0.18, 0.3] },
  extractName: 'the street, out of the front doors', navCap: 120000,
  outside: { backdrop: 'city', mat: 'asphalt', margin: 16 },
  legend: {
    // a palm tree in a planter
    a(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 0.5, cy, cz - 0.5], [cx + 0.5, cy + 0.6, cz + 0.5], 'concrete2'); k.box([cx - 0.12, cy, cz - 0.12], [cx + 0.12, cy + 5, cz + 0.12], 'wood', { tint: [0.55, 0.42, 0.3] }); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) k.box([cx + Math.min(0, a * 1.6), cy + 4.6, cz + Math.min(0, b * 1.6)], [cx + Math.max(0, a * 1.6) + (a ? 0 : 0.3), cy + 4.8, cz + Math.max(0, b * 1.6) + (b ? 0 : 0.3)], 'hedge', { solid: false, tint: [0.4, 0.7, 0.35] }); },
    q(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - 0.04, cy, cz - h], [cx + 0.04, cy + 1.05, cz + h], 'metal', { tint: [0.8, 0.8, 0.85], shootThrough: true }); k.box([cx - 0.02, cy + 1.0, cz - h], [cx + 0.02, cy + 1.05, cz + h], 'neon', { solid: false, tint: [1, 0.2, 0.8] }); },
    k(k2, x, y, f) { const [cx, cy, cz] = k2.at(x, y, f), h = k2.CELL / 2; k2.box([cx - h, cy, cz - 0.04], [cx + h, cy + 1.05, cz + 0.04], 'metal', { tint: [0.8, 0.8, 0.85], shootThrough: true }); k2.box([cx - h, cy + 1.0, cz - 0.02], [cx + h, cy + 1.05, cz + 0.02], 'neon', { solid: false, tint: [0.2, 0.9, 1] }); },
  },
  floors: {
    G: { y: 0, wallH: 3.8, wall: 'paint', wallTint: [0.12, 0.1, 0.16], floor: 'paint', floorTint: [0.1, 0.09, 0.12], ceil: 'paint', ceilTint: [0.06, 0.05, 0.08], lampPower: 0.5, lampColour: [1, 0.3, 0.8], noRoof: [[13, 15, 34, 33]], rows: G.map((r) => r.join('')) },
    M: { y: 4.0, wallH: 3.6, wall: 'paint', wallTint: [0.14, 0.1, 0.18], floor: 'carpet', floorTint: [0.3, 0.08, 0.25], ceil: 'paint', ceilTint: [0.06, 0.05, 0.08], lampPower: 0.5, lampColour: [0.4, 0.6, 1], rows: M.map((r) => r.join('')) },
  },
  stairs,
  start: { x: 23.5, y: 45, floor: 'G', yaw: 0 },
  extract: { x: 23.5, y: 44, floor: 'G' },
  extra(kit) {
    const { box, level, CELL: C } = kit;
    // the stage: a step up, the DJ's booth on it, the speaker stacks
    box([15 * C, 0, 9 * C], [33 * C, 1.0, 13 * C], 'paint', { tint: [0.08, 0.07, 0.1] });
    box([21 * C, 1.0, 10 * C], [27 * C, 2.1, 11 * C], 'metal', { tint: [0.15, 0.15, 0.18] });
    for (const x of [15.2, 30.6]) box([x * C, 1.0, 9.2 * C], [(x + 1.2) * C, 4.4, 11 * C], 'paint', { tint: [0.06, 0.06, 0.07] });
    // the dance floor: squares that light, in colours
    const cols = [[0.45, 0.06, 0.3], [0.06, 0.3, 0.45], [0.25, 0.06, 0.45], [0.45, 0.32, 0.06]];
    for (let y = 15; y <= 31; y += 2) for (let x = 14; x <= 32; x += 2) box([x * C + 0.08, 0.01, y * C + 0.08], [(x + 2) * C - 0.08, 0.04, (y + 2) * C - 0.08], 'neon', { solid: false, tint: cols[(x + y) % 4] });
    // the lights over the floor - each its own colour - and the mirror ball
    const L = [[18, 20, [1, 0.15, 0.6]], [29, 20, [0.15, 0.6, 1]], [18, 28, [0.6, 0.15, 1]], [29, 28, [1, 0.5, 0.1]], [24, 24, [0.3, 1, 0.6]]];
    for (const [x, y, c] of L) level.lights.push({ pos: [x * C, 6.5, y * C], range: 14, intensity: 1.6, color: c });
    box([23.5 * C, 6.4, 23.5 * C], [24.5 * C, 7.4, 24.5 * C], 'mirror', { solid: false });
    // neon along the walls: strips at head height round the floor and the lounge
    for (const [x0, z0, x1, z1, c] of [[5, 15, 5.1, 33, [1, 0.2, 0.8]], [42.9, 15, 43, 33, [0.2, 0.9, 1]], [5, 9.1, 13, 9.2, [0.6, 0.2, 1]], [35, 9.1, 43, 9.2, [1, 0.6, 0.1]]]) for (const yy of [2.6, 6.6]) box([x0 * C, yy, z0 * C], [x1 * C, yy + 0.08, z1 * C], 'neon', { solid: false, tint: c });
    // the bars' shelves of bottles, lit from below
    for (const x of [5.05, 42.6]) box([x * C, 1.2, 16 * C], [(x + 0.35) * C, 2.4, 31 * C], 'neon', { solid: false, tint: [0.9, 0.7, 0.3] });
    // outside: the neon sign over the door - CLUB VELVET - and its glow; the queue's posts and rope
    level.signs.push({ pos: [24 * C, 5.0, 41 * C + C / 2 + 0.13], yaw: 0, w: 7.5, h: 1.6, text: 'VELVET', sub: 'club - members only', col: '#d0208a' });
    box([19 * C, 3.9, 41 * C + 1.3], [29 * C, 4.0, 41 * C + 1.4], 'neon', { solid: false, tint: [1, 0.2, 0.8] });
    box([19 * C, 6.0, 41 * C + 1.3], [29 * C, 6.1, 41 * C + 1.4], 'neon', { solid: false, tint: [0.2, 0.9, 1] });
    level.lights.push({ pos: [24 * C, 4.5, 43 * C], range: 16, intensity: 1.8, color: [1, 0.25, 0.75] });
    for (let x = 16; x <= 30; x += 2) box([x * C - 0.05, 0, 43 * C - 0.05], [x * C + 0.05, 1.0, 43 * C + 0.05], 'metal', { tint: [0.8, 0.7, 0.3] });
    box([16 * C, 0.9, 43 * C - 0.03], [30 * C, 0.95, 43 * C + 0.03], 'cloth', { solid: false, tint: [0.6, 0.05, 0.1] });
  },
  zones: [
    { id: 'booth', label: 'Club VELVET - Saint\'s booth', at: [35, 9, 42, 13], floor: 'M' },
    { id: 'vip', label: 'Club VELVET - the VIP lounge', at: [5, 9, 42, 33], floor: 'M' },
    { id: 'office', label: 'Club VELVET - the office', at: [5, 9, 12, 13] },
    { id: 'store', label: 'Club VELVET - the store', at: [35, 9, 42, 13] },
    { id: 'stage', label: 'Club VELVET - the stage', at: [14, 9, 33, 14] },
    { id: 'floor', label: 'Club VELVET - the dance floor', at: [5, 15, 42, 33] },
    { id: 'lobby', label: 'Club VELVET - the lobby', at: [5, 35, 42, 40] },
    { id: 'street', label: 'The waterfront strip', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'saint', at: [39, 11, 'M'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Saint', tint: [1.4, 1.35, 1.3] },
    { id: 'sb1', at: [36, 12, 'M'], arms: 'smg', temper: 'steady' },
    { id: 'v1', at: [8, 21, 'M'], route: [[8, 16], [8, 32]], arms: 'smg' },
    { id: 'v2', at: [39, 27, 'M'], route: [[39, 16], [39, 32]], arms: 'carbine' },
    { id: 'v3', at: [24, 12, 'M'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'd1', at: [8, 36, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'd2', at: [30, 37, 'G'], arms: 'smg' },
    { id: 'f1', at: [20, 22, 'G'], route: [[16, 18], [31, 18], [31, 30], [16, 30]], arms: 'carbine' },
    { id: 'f2', at: [9, 20, 'G'], arms: 'shotgun', temper: 'steady' },
    { id: 'f3', at: [38, 24, 'G'], arms: 'smg' },
    { id: 'dj', at: [27, 13, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'o1', at: [9, 11, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'st1', at: [38, 12, 'G'], arms: 'smg' },
  ],
  pickups: [{ id: 'ledger', name: 'Saint\'s ledger', what: 'the ledger', at: [7, 10, 'G'], table: false, h: 0.8, colour: [0.7, 0.2, 0.5] }],
  terminals: [{ id: 'power', name: 'the DJ\'s desk', at: [22, 13, 'G'], face: [0, -1], time: 4, reveal: 20, verb: 'Kill the power at', doing: 'Killing the power at', said: 'The power dies - the music cuts out, the lights go dark; in the dark they are on your radar for 20 seconds.' }],
  objectives: [
    { id: 'o1', kind: 'kill', ref: 'saint', text: 'Stop Saint (his booth, the mezzanine)' },
    { id: 'o2', kind: 'take', ref: 'ledger', text: 'Take the ledger (the office, behind the stage)' },
    { id: 'o3', kind: 'hack', ref: 'power', text: 'Cut the power (the DJ\'s desk)', optional: true },
  ],
};
