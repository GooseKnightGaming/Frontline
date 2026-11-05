// FRONTLINE - Level 34, the Subway (first draft). From Rhys's location boards (part 2):
// "Subway / Underground station - exteriors, interiors, props and furniture". Holm Street station, after
// the last train: the street with its two entrances, the ticket hall below it, and down again the platforms
// either side of the track - a train standing at them, its doors open. The reds have left something on that
// train, set to go off when the morning crowds come. Their man Vey watches it from the signal room.
//
// Storeys: G (the street), B1 (the ticket hall, 5 m down), B2 (the platforms, 10 m down), T (the track bed,
// a metre and a bit below the platforms). The train stands on B2, over the track. A square is 1.5 m.
const CELL = 1.5, W = 90, H = 40;
const grid = () => Array.from({ length: H }, () => new Array(W).fill(' '));
const G = grid(), B1 = grid(), B2 = grid(), T = grid();
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const ring = (g, x0, y0, x1, y1, ch) => { for (let x = x0; x <= x1; x++) { put(g, x, y0, ch); put(g, x, y1, ch); } for (let y = y0; y <= y1; y++) { put(g, x0, y, ch); put(g, x1, y, ch); } };

// ── G: the street; the two entrances' pavilions (their doors on the north, the stairs down inside them) ──
for (const x0 of [12, 72]) { ring(G, x0, 2, x0 + 6, 11, '#'); fill(G, x0 + 1, 3, x0 + 5, 10, '.'); put(G, x0 + 2, 2, 'D'); put(G, x0 + 3, 2, 'D'); }
for (const [x, y] of [[30, 1], [50, 1], [62, 1]]) put(G, x, y, 'l');
put(G, 40, 6, 'v'); put(G, 55, 7, 'v');
// ── B1: the ticket hall - the barriers across it, the ticket machines, the kiosk; corridors to the platforms ──
ring(B1, 6, 2, 83, 14, '#'); fill(B1, 7, 3, 82, 13, '.');
for (let x = 30; x <= 60; x++) put(B1, x, 8, x % 3 === 0 ? 'K' : '.');      // the barrier line (gaps between)
for (const x of [34, 37, 52, 55]) put(B1, x, 4, 'M');                       // ticket machines
fill(B1, 66, 4, 70, 4, 'K'); put(B1, 68, 6, 'H');                           // the kiosk
fill(B1, 40, 14, 41, 21, '.'); for (let y = 14; y <= 22; y++) { put(B1, 39, y, '#'); put(B1, 42, y, '#'); } put(B1, 40, 22, '#'); put(B1, 41, 22, '#');   // the way down to the platforms: its stairwell
// ── B2: the platforms (north 17-22, south 27-32), the track between (23-26), the signal room ──
ring(B2, 2, 12, 87, 34, '#'); fill(B2, 3, 13, 86, 33, '.');
for (let x = 3; x <= 86; x++) for (const y of [13, 14, 15, 16]) put(B2, x, y, x >= 70 && x <= 80 ? '.' : '#');
ring(B2, 69, 12, 81, 16, '#'); fill(B2, 70, 13, 80, 15, '.'); put(B2, 74, 16, 'D');
for (const x of [71, 72, 73]) put(B2, x, 13, 'M'); put(B2, 78, 14, 'T'); put(B2, 76, 13, 'H');
for (let x = 3; x <= 86; x++) for (let y = 23; y <= 26; y++) put(B2, x, y, ' ');
fill(B2, 4, 23, 5, 26, '.');                                                // the boarded crossing at the west end
for (let x = 10; x <= 80; x += 10) { put(B2, x, 20, 'P'); put(B2, x, 30, 'P'); }
for (const x of [20, 35, 50, 65]) { put(B2, x, 18, 'Z'); put(B2, x, 31, 'Z'); }
// the train: three cars over the track (rows 23-26), doors both sides, gaps between the cars
const cars = [[14, 33], [36, 55], [58, 77]];
for (const [a, b] of cars) {
  ring(B2, a, 23, b, 26, '#'); fill(B2, a + 1, 24, b - 1, 25, '.');
  for (let x = a + 3; x <= b - 3; x += 6) { put(B2, x, 23, ':'); put(B2, x + 1, 23, ':'); put(B2, x, 26, ':'); put(B2, x + 1, 26, ':'); }
}
// ── T: the track bed, under the track ──
fill(T, 3, 23, 86, 26, '.');
// the lift shafts' doors, the vending machines, the benches on the concourse
put(B1, 12, 6, 'Z'); put(B1, 78, 10, 'Z');

// the stairs: up from the ticket hall into each pavilion; down from the hall to the north platform
const stairs = [
  { x: 14, y: 10, dir: 'N', len: 5, w: 2, from: 'B1', to: 'G' },          // the west entrance (arrives in its pavilion)
  { x: 74, y: 10, dir: 'N', len: 5, w: 2, from: 'B1', to: 'G' },          // the east entrance
  { x: 40, y: 21, dir: 'N', len: 5, w: 2, from: 'B2', to: 'B1' },         // the platforms, up to the hall
];

export default {
  id: 'subway', no: 34, title: 'The Subway', place: 'Holm Street station', cell: CELL, windows: false,
  where: 'Holm Street station, after the last train. 01:50.',
  brief: [
    ['The place', 'The street, with the station\'s two entrances; below it the <b>ticket hall</b> - the barriers, the machines, the kiosk; below that the <b>platforms</b>, north and south of the track, and a <b>train</b> standing at them with its doors open both sides. The stair down from the hall comes onto the north platform; cross to the south one through the train, or over the boards at the platforms\' west end. The <b>signal room</b> is off the north platform, east.'],
    ['The device', 'The reds have left a device on the train - in the middle car - set to go off when the morning crowds come. <b>Vey</b> watches it from the signal room.'],
    ['Objectives', '<b>Disarm the device</b> (the train\'s middle car). Take <b>Vey\'s trigger</b> - the radio that sets it off early - from the signal room. Optionally, stop Vey.'],
    ['The track', 'The track is a drop of a metre and more - you can walk it, and climb back up.'],
  ],
  epilogue: {
    success: "The morning crowds come down into Holm Street at seven and catch their trains, and none of them knows how close it was. Vey's trigger is in an evidence bag at Ghost HQ.",
    partial: "The trains run in the morning, but Holm Street is closed for a day while it is searched again, and again.",
  },
  time: { date: [31, 10, 2026], hour: 1, minute: 50 }, faction: 'red', night: true,
  startLoadout: { primary: 'K7', backup: 'PX9', utility1: 'FLASH', utility2: 'SMOKE', gear: 'LENSES' },
  extractName: 'the street', navCap: 120000,
  outside: { backdrop: 'city', mat: 'asphalt', margin: 16 },
  floors: {
    T: { y: -11.2, wallH: 1.2, roof: false, lamps: false, floor: 'rock', floorTint: [0.3, 0.28, 0.26], rows: T.map((r) => r.join('')) },
    B2: { y: -10.0, wallH: 4.2, wall: 'wctile', wallTint: [0.85, 0.82, 0.7], floor: 'concrete2', floorTint: [0.62, 0.6, 0.56], ceil: 'concrete2', ceilTint: [0.45, 0.45, 0.45], lampPower: 0.7, lampColour: [1, 0.95, 0.85], lampEvery: 9, rows: B2.map((r) => r.join('')) },
    B1: { y: -5.0, wallH: 3.8, wall: 'wctile', wallTint: [0.8, 0.85, 0.82], floor: 'marble', floorTint: [0.7, 0.7, 0.68], ceil: 'concrete2', lampPower: 0.75, lampColour: [1, 0.97, 0.9], rows: B1.map((r) => r.join('')) },
    G: { y: 0, wallH: 3.2, wall: 'brick', wallTint: [0.6, 0.35, 0.3], floor: 'concrete', ceil: 'metal', lampPower: 0.7, rows: G.map((r) => r.join('')) },
  },
  stairs,
  start: { x: 45, y: 0, floor: 'G', yaw: Math.PI },
  extract: { x: 46, y: 0, floor: 'G' },
  vehicle: false,
  extra(kit) {
    const { box, level, CELL: C } = kit;
    // the platform edges: a yellow line; the rails in the track bed
    for (const z of [22.8, 27.05]) box([3 * C, -9.99, z * C], [87 * C, -9.97, (z + 0.12) * C], 'paint', { solid: false, tint: [0.95, 0.8, 0.15] });
    for (const z of [24.3, 25.5]) box([3 * C, -11.2, z * C], [87 * C, -11.05, z * C + 0.08], 'metal', { solid: false, tint: [0.55, 0.55, 0.58] });
    for (let x = 4; x < 87; x += 1) box([x * C, -11.2, 23.6 * C], [x * C + 0.25, -11.13, 26.3 * C], 'wood', { solid: false, tint: [0.3, 0.24, 0.18] });
    // the track's sides, from the bed up to the platforms
    box([3 * C, -11.2, 23 * C - 0.1], [87 * C, -10.2, 23 * C], 'concrete2', { tint: [0.5, 0.48, 0.45] });
    box([3 * C, -11.2, 27 * C], [87 * C, -10.2, 27 * C + 0.1], 'concrete2', { tint: [0.5, 0.48, 0.45] });
    // the train's skin: red and cream, its roof, under-frame, the cab windows at either end
    for (const [a, b] of cars) {
      box([a * C, -10.0, 23 * C], [(b + 1) * C, -9.4, 27 * C], 'paint', { tint: [0.2, 0.2, 0.22] });
      box([a * C, -6.6, 23 * C], [(b + 1) * C, -6.3, 27 * C], 'paint', { tint: [0.75, 0.15, 0.12] });
      box([a * C, -11.2, 23.6 * C], [(b + 1) * C, -10.2, 26.4 * C], 'metal', { tint: [0.15, 0.15, 0.16] });
    }
    // the tunnel mouths at either end: black arches in the end walls
    for (const x of [2, 87]) box([x * C - 0.2, -11.2, 23 * C], [x * C + 0.2, -6.5, 27 * C], 'paint', { solid: false, tint: [0.02, 0.02, 0.02] });
    // signs: the station's roundel on the platform walls; the entrances
    for (const x of [15, 45, 75]) { level.signs.push({ pos: [x * C, -7.4, 17 * C - 0.1 + 0.2], yaw: 0, w: 3.2, h: 0.8, text: 'HOLM STREET', sub: '', col: '#1d3f8a' }); level.signs.push({ pos: [x * C, -7.4, 33 * C + 0.65], yaw: Math.PI, w: 3.2, h: 0.8, text: 'HOLM STREET', sub: '', col: '#1d3f8a' }); }
    for (const x0 of [12, 72]) level.signs.push({ pos: [(x0 + 3.5) * C, 3.6, 2 * C + C / 2 - 0.13], yaw: Math.PI, w: 3, h: 0.6, text: 'UNDERGROUND', sub: 'Holm Street', col: '#1d3f8a' });
  },
  zones: [
    { id: 'signal', label: 'Holm Street - the signal room', at: [70, 13, 80, 15], floor: 'B2' },
    { id: 'car2', label: 'Holm Street - the train, the middle car', at: [36, 23, 55, 26], floor: 'B2' },
    { id: 'train', label: 'Holm Street - the train', at: [14, 23, 77, 26], floor: 'B2' },
    { id: 'plN', label: 'Holm Street - the north platform', at: [3, 17, 86, 22], floor: 'B2' },
    { id: 'plS', label: 'Holm Street - the south platform', at: [3, 27, 86, 33], floor: 'B2' },
    { id: 'track', label: 'Holm Street - the track', at: [3, 23, 86, 26], floor: 'T' },
    { id: 'hall', label: 'Holm Street - the ticket hall', at: [6, 2, 83, 16], floor: 'B1' },
    { id: 'street', label: 'Holm Street', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'vey', at: [77, 14, 'B2'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Vey' },
    { id: 's1', at: [72, 15, 'B2'], arms: 'smg', temper: 'steady' },
    { id: 'n1', at: [25, 22, 'B2'], route: [[6, 22], [84, 22]], arms: 'carbine' },
    { id: 'n2', at: [60, 21, 'B2'], arms: 'shotgun' },
    { id: 's2', at: [33, 32, 'B2'], route: [[6, 32], [84, 32]], arms: 'smg' },
    { id: 's3', at: [70, 29, 'B2'], arms: 'carbine', temper: 'steady' },
    { id: 't1', at: [45, 24, 'B2'], arms: 'smg', temper: 'steady' },
    { id: 't2', at: [20, 25, 'B2'], arms: 'carbine' },
    { id: 'h1', at: [45, 6, 'B1'], arms: 'carbine' },
    { id: 'h2', at: [20, 11, 'B1'], route: [[10, 11], [80, 11]], arms: 'smg' },
    { id: 'h3', at: [68, 7, 'B1'], arms: 'pistol', temper: 'cowardly' },
    { id: 'g1', at: [20, 1, 'G'], route: [[4, 0], [26, 0]], arms: 'carbine' },      // (M6.86) the west end of the street only: he walked through the start
  ],
  pickups: [{ id: 'trigger', name: 'Vey\'s trigger', what: 'the trigger', at: [78, 14, 'B2'], table: false, h: 0.8, colour: [0.9, 0.3, 0.2] }],
  terminals: [{ id: 'device', name: 'the device', at: [45, 25, 'B2'], face: [0, -1], time: 9, reveal: 20, verb: 'Disarm', doing: 'Disarming',
    said: 'The device is dead in your hands - the timer stops at 05:58. The station\'s cameras put every red on your radar for 20 seconds.' }],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'device', text: 'Disarm the device (the train, the middle car)' },
    { id: 'o2', kind: 'take', ref: 'trigger', text: 'Take Vey\'s trigger (the signal room)' },
    { id: 'o3', kind: 'kill', ref: 'vey', text: 'Stop Vey', optional: true },
  ],
};
