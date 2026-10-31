// FRONTLINE - Level 31, the Airport (first draft). From Rhys's location boards (part 2):
// "Airport - exteriors, interiors, props and furniture". Varnholm Airfield, after the last flight: the
// terminal - the check-in hall, security, the departure lounge, the VIP lounge and offices upstairs - the
// apron with an airliner on its stand, the control tower, the taxiway and the runway. A private jet waits on
// the far stand for Rourke, the reds' arms dealer: at 23:40 it taxis out and takes off.
//
// Stop the jet: shoot it to pieces, stop its pilot - or take the control tower and hold every departure.
// A square is 2.5 m.
const CELL = 2.5, W = 80, H = 66;
const grid = () => Array.from({ length: H }, () => new Array(W).fill(' '));
const G = grid(), F1 = grid(), P = grid(), T = grid();
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const ring = (g, x0, y0, x1, y1, ch) => { for (let x = x0; x <= x1; x++) { put(g, x, y0, ch); put(g, x, y1, ch); } for (let y = y0; y <= y1; y++) { put(g, x0, y, ch); put(g, x1, y, ch); } };

// ── the terminal: x 6-53, y 4-24. G: the check-in hall (west), security (middle), the departure lounge (east);
// its landside front (north), the airside glass wall (south) onto the apron
ring(G, 6, 4, 53, 24, '#'); fill(G, 7, 5, 52, 23, '.');
for (let x = 8; x <= 52; x += 3) put(G, x, 24, 'W');                        // the glass onto the apron
for (const x of [12, 13, 28, 29]) put(G, x, 4, 'D');                        // the front doors
for (const y of [11, 15, 19]) fill(G, 9, y, 19, y, 'K');                     // the check-in desks
for (let y = 5; y <= 23; y++) put(G, 24, y, '#');                           // the hall's east wall, security's west
for (const y of [8, 13, 18]) put(G, 24, y, 'D');
for (const y of [7, 11, 15, 19]) { fill(G, 26, y, 30, y, 'K'); put(G, 31, y, 'M'); }    // the security lanes and scanners
for (let y = 5; y <= 23; y++) put(G, 33, y, '#');
for (const y of [6, 9, 12, 15, 18, 21]) put(G, 33, y, 'D');
for (let y = 7; y <= 21; y += 3) for (let x = 38; x <= 50; x += 2) if (x !== 42 && x !== 44) put(G, x, y, 's');   // the lounge's seats
fill(G, 46, 5, 51, 5, 'H'); put(G, 40, 22, 'T'); put(G, 37, 22, 'T');        // the duty-free shelves; the cafe
put(G, 44, 24, 'D'); put(G, 45, 24, 'D');                                   // the gate: out onto the apron
// ── 1: the mezzanine over security and the lounge - the VIP lounge (east), the security office (west)
ring(F1, 24, 4, 53, 24, '#'); fill(F1, 25, 5, 52, 23, '.');
for (let y = 5; y <= 23; y++) put(F1, 38, y, '#'); put(F1, 38, 10, 'D'); put(F1, 38, 18, 'D');
for (let x = 25; x <= 37; x++) put(F1, x, 14, '#'); put(F1, 31, 14, 'D');
for (let x = 40; x <= 52; x += 3) put(F1, x, 24, 'W');
fill(F1, 26, 6, 29, 6, 'M'); put(F1, 32, 8, 'T'); put(F1, 35, 10, 'H');      // the security office (north-west)
put(F1, 30, 18, 'T'); put(F1, 27, 21, 'Y');                                  // the staff rest room (south-west)
for (const [x, y] of [[41, 8], [45, 8], [49, 8], [41, 16], [45, 16], [49, 16]]) put(F1, x, y, 'Z');   // the VIP lounge
for (const [x, y] of [[43, 11], [47, 11], [43, 19], [47, 19]]) put(F1, x, y, 'T'); fill(F1, 50, 21, 52, 21, 'K');
// ── the control tower: its foot on the apron's edge (west), a ladder up the shaft, the cab on top (T, 15 m)
ring(G, 2, 28, 6, 32, '#'); fill(G, 3, 29, 5, 31, '.'); put(G, 4, 32, 'D');
ring(T, 1, 27, 7, 33, 'W'); fill(T, 2, 28, 6, 32, '.'); put(T, 1, 27, '#'); put(T, 7, 27, '#'); put(T, 1, 33, '#'); put(T, 7, 33, '#');
fill(T, 2, 28, 6, 28, 'M'); put(T, 6, 31, 'T');
// ── the airliner on stand 2 (its cabin, P, 3 m up the airstairs)
const AX = 14, AY = 38;                                                       // the cabin: x 14-41, y 38-40
ring(P, AX - 1, AY - 1, AX + 28, AY + 3, '#'); fill(P, AX, AY, AX + 27, AY + 2, '.');
for (let x = AX + 3; x <= AX + 25; x += 2) { put(P, x, AY, 's'); put(P, x, AY + 2, 's'); }
put(P, AX + 26, AY - 1, 'D'); put(P, AX + 26, AY - 2, '.');                 // the door, onto the airstairs' top
fill(P, AX, AY, AX + 1, AY + 2, '.'); put(P, AX + 1, AY + 1, 'K');            // the galley
// the apron: the terminal's stands, baggage carts, a fuel bowser; the taxiway lines; the runway
for (const [x, y] of [[50, 30], [52, 30], [54, 30]]) put(G, x, y, 'C');
put(G, 30, 30, 'v'); put(G, 58, 28, 'v');

const stairs = [
  { x: 35, y: 22, dir: 'N', len: 4, w: 2, from: 'G', to: '1' },           // up from the lounge to the mezzanine
  { x: AX + 26, y: AY - 5, dir: 'S', len: 3, w: 1, from: 'G', to: 'P' },   // the airstairs
];
const ladders = [{ x: 3, y: 30, from: 'G', to: 'T', back: [-1, 0], off: [4, 30] }];
// the jet's way: off its stand, down the taxiway, onto the runway, and away west down it
const jetPath = [[64, 40], [64, 49], [62, 54], [57, 57.5], [50, 58.5], [35, 58.5], [18, 58.5], [3, 58.5]];

export default {
  id: 'airport', no: 31, title: 'The Airport', place: 'Varnholm Airfield', cell: CELL, windows: false,
  where: 'Varnholm Airfield, after the last flight. 23:25.',
  brief: [
    ['The place', 'The terminal: the check-in hall (west), security (the middle), the departure lounge (east) and its gate onto the apron; upstairs over them, the security office and the <b>VIP lounge</b>. The apron: an airliner on stand 2 (its door up the airstairs), the <b>control tower</b> on the apron\'s west edge (a ladder up its shaft to the cab). The taxiway, and the runway along the south.'],
    ['The jet', '<b>Rourke</b>, the reds\' arms dealer, has a private jet waiting on the far stand (east). At 23:40 it taxis out, down to the runway and away west. <b>Stop it</b>: wreck it, stop its pilot - or take the tower: the ground control desk holds every departure where it is.'],
    ['Objectives', 'Stop Rourke\'s jet. Take his <b>contracts</b> from the VIP lounge (upstairs over the departure lounge). Optionally, stop Rourke himself - he boards when it goes.'],
  ],
  time: { date: [22, 10, 2026], hour: 23, minute: 25 }, faction: 'red', night: true,
  startLoadout: { primary: 'K7', backup: 'PX9', utility1: 'FRAG', utility2: 'REMOTE', gear: 'LENSES' },
  extractName: 'the car park, landside', navCap: 120000, testNavCap: 600000, chaseMax: 70,
  outside: { backdrop: 'city', mat: 'asphalt', tint: [0.8, 0.8, 0.8], margin: 14 },
  legend: {
    s(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h, cy, cz - 0.35], [cx + h, cy + 0.45, cz + 0.3], 'fabric', { tint: [0.2, 0.25, 0.45] }); k.box([cx - h, cy + 0.45, cz + 0.22], [cx + h, cy + 1.0, cz + 0.35], 'fabric', { tint: [0.18, 0.22, 0.4] }); },
  },
  floors: {
    G: { y: 0, wallH: 4.2, wall: 'cladding', wallTint: [0.85, 0.87, 0.9], floor: 'marble', floorTint: [0.82, 0.82, 0.8], ceil: 'plaster', lampPower: 0.8, lampColour: [0.95, 0.98, 1], rows: G.map((r) => r.join('')) },
    P: { y: 3.0, wallH: 2.3, wall: 'paint', wallTint: [0.9, 0.9, 0.92], floor: 'carpet', floorTint: [0.3, 0.32, 0.42], ceil: 'plaster', lampPower: 0.6, rows: P.map((r) => r.join('')) },
    1: { y: 4.4, wallH: 3.4, wall: 'cladding', wallTint: [0.85, 0.87, 0.9], floor: 'carpet', floorTint: [0.4, 0.3, 0.3], ceil: 'plaster', lampPower: 0.75, rows: F1.map((r) => r.join('')) },
    T: { y: 15.0, wallH: 3.2, wall: 'metal', wallTint: [0.6, 0.62, 0.65], floor: 'carpet', floorTint: [0.3, 0.3, 0.35], ceil: 'metal', lampPower: 0.5, rows: T.map((r) => r.join('')) },
  },
  stairs, ladders,
  start: { x: 20, y: 1, floor: 'G', yaw: Math.PI },
  extract: { x: 20, y: 2, floor: 'G' },
  vehicles: [
    { id: 'jet', kind: 'jet', model: 'jet', paint: 'white', path: jetPath, speed: 12, goal: 'escape', wait: 75, holdOn: 'tower', hp: 900, name: 'Rourke\'s jet',
      crew: [{ id: 'pilot', at: [-0.4, -5.0] }, { id: 'rourke', at: [0.3, -1.0] }] },
  ],
  extra(kit) {
    const { box, level, CELL: C } = kit;
    // the airliner: its fuselage round the cabin, the wings, the tail, engines, the airstairs' rails
    const ax0 = (AX - 1.5) * C, ax1 = (AX + 29) * C, az0 = (AY - 1) * C - 0.3, az1 = (AY + 4) * C + 0.3;
    box([ax0, 0.6, az0], [ax1, 3.0, az1], 'paint', { tint: [0.92, 0.92, 0.94] });
    box([ax0, 5.4, az0], [ax1, 6.4, az1], 'paint', { tint: [0.92, 0.92, 0.94] });
    box([ax0 - 6, 2.0, az0 + 2], [ax0, 5.6, az1 - 2], 'paint', { tint: [0.92, 0.92, 0.94] });                // the nose
    box([ax1, 2.6, az0 + 2.5], [ax1 + 7, 5.6, az1 - 2.5], 'paint', { tint: [0.92, 0.92, 0.94] });            // the tail cone
    box([ax1 + 3, 5.6, (az0 + az1) / 2 - 0.3], [ax1 + 7, 12, (az0 + az1) / 2 + 0.3], 'paint', { tint: [0.15, 0.3, 0.6] });   // the fin
    for (const sd of [-1, 1]) {
      const z0 = sd < 0 ? az0 - 16 : az1, z1 = sd < 0 ? az0 : az1 + 16;
      box([(AX + 9) * C, 2.4, z0], [(AX + 17) * C, 2.8, z1], 'paint', { tint: [0.85, 0.86, 0.88] });
      box([(AX + 10) * C, 0.9, sd < 0 ? az0 - 7 : az1 + 4], [(AX + 13) * C, 2.4, sd < 0 ? az0 - 4 : az1 + 7], 'metal', { tint: [0.5, 0.52, 0.55] });
    }
    box([ax0, 3.0, az0 - 0.1], [ax1, 3.25, az0], 'paint', { solid: false, tint: [0.15, 0.3, 0.6] });
    box([ax0, 3.0, az1], [ax1, 3.25, az1 + 0.1], 'paint', { solid: false, tint: [0.15, 0.3, 0.6] });
    // the runway: its edge lights and centre line; the taxiway's yellow line
    for (let x = 0; x < W * C; x += 10) { box([x, 0.02, 58.5 * C - 0.1], [x + 5, 0.04, 58.5 * C + 0.1], 'paint', { solid: false, tint: [0.95, 0.95, 0.9] }); for (const z of [55.5, 61.5]) box([x, 0, z * C], [x + 0.3, 0.3, z * C + 0.3], 'neon', { solid: false, tint: [1, 0.85, 0.4] }); }
    for (let z = 40; z < 56; z += 1) box([64.5 * C - 0.08, 0.02, z * C], [64.5 * C + 0.08, 0.04, z * C + 2], 'paint', { solid: false, tint: [0.95, 0.8, 0.2] });
    box([56 * C, 0.01, 52 * C], [80 * C, 0.025, 63 * C], 'asphalt', { solid: false, tint: [0.65, 0.65, 0.65] });
    box([0, 0.01, 55 * C], [80 * C, 0.025, 62 * C], 'asphalt', { solid: false, tint: [0.55, 0.55, 0.55] });
    // the tower's shaft up to the cab
    box([1.5 * C, 0, 27.5 * C], [6.5 * C, 15, 28 * C], 'concrete2', { tint: [0.8, 0.8, 0.78] });
    box([1.5 * C, 3.2, 32 * C], [6.5 * C, 15, 32.5 * C], 'concrete2', { tint: [0.8, 0.8, 0.78] });
    box([1.5 * C, 0, 28 * C], [2 * C, 15, 32 * C], 'concrete2', { tint: [0.8, 0.8, 0.78] });
    box([6 * C, 3.2, 28 * C], [6.5 * C, 15, 32 * C], 'concrete2', { tint: [0.8, 0.8, 0.78] });
    level.lights.push({ pos: [4 * C, 19.5, 30 * C], range: 10, intensity: 1.0, color: [0.4, 1, 0.5] });
    // the apron's floodlights
    for (const [x, y] of [[20, 30], [50, 34], [66, 34]]) { box([x * C - 0.15, 0, y * C - 0.15], [x * C + 0.15, 14, y * C + 0.15], 'metal', { tint: [0.4, 0.42, 0.45] }); level.lights.push({ pos: [x * C, 13.5, y * C], range: 30, intensity: 1.3, color: [1, 0.95, 0.8], street: true }); }
    level.signs.push({ pos: [20 * C, 5.0, 4 * C - 0.13], yaw: Math.PI, w: 8, h: 1.2, text: 'VARNHOLM AIRFIELD', sub: 'departures', col: '#1d3557' });
    level.signs.push({ pos: [44.5 * C, 3.6, 24 * C + C / 2 + 0.13], yaw: 0, w: 2.6, h: 0.6, text: 'GATE 2', sub: '', col: '#1d3557' });
  },
  zones: [
    { id: 'vip', label: 'Varnholm Airfield - the VIP lounge', at: [39, 5, 52, 23], floor: '1' },
    { id: 'secoff', label: 'Varnholm Airfield - the security office', at: [25, 5, 37, 23], floor: '1' },
    { id: 'tower', label: 'Varnholm Airfield - the tower cab', at: [1, 27, 7, 33], floor: 'T' },
    { id: 'cabin', label: 'Varnholm Airfield - the airliner\'s cabin', at: [AX - 1, AY - 1, AX + 28, AY + 3], floor: 'P' },
    { id: 'checkin', label: 'Varnholm Airfield - the check-in hall', at: [7, 5, 23, 23] },
    { id: 'security', label: 'Varnholm Airfield - security', at: [25, 5, 32, 23] },
    { id: 'lounge', label: 'Varnholm Airfield - the departure lounge', at: [34, 5, 52, 23] },
    { id: 'runway', label: 'Varnholm Airfield - the runway', at: [0, 54, W - 1, H - 1] },
    { id: 'apron', label: 'Varnholm Airfield - the apron', at: [0, 25, W - 1, 53] },
    { id: 'land', label: 'Varnholm Airfield', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'pilot', at: [64, 40, 'G'], arms: 'pistol', temper: 'steady', name: 'The pilot' },
    { id: 'rourke', at: [64, 41, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Rourke' },
    { id: 'j1', at: [61, 38, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'j2', at: [67, 44, 'G'], arms: 'smg' },
    { id: 'tw', at: [4, 30, 'T'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'tw2', at: [3, 30, 'G'], arms: 'carbine' },
    { id: 'a1', at: [30, 31, 'G'], route: [[10, 31], [56, 31]], arms: 'carbine' },
    { id: 'a2', at: [AX + 10, AY + 1, 'P'], arms: 'smg' },
    { id: 'c1', at: [15, 8, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'c2', at: [21, 21, 'G'], arms: 'carbine' },
    { id: 's1', at: [28, 9, 'G'], arms: 'smg', temper: 'steady' },
    { id: 's2', at: [28, 21, 'G'], arms: 'shotgun' },
    { id: 'l1', at: [42, 12, 'G'], route: [[43, 6], [43, 22]], arms: 'carbine' },
    { id: 'v1', at: [45, 12, '1'], arms: 'smg', temper: 'steady' },
    { id: 'v2', at: [50, 18, '1'], arms: 'carbine', rank: 'sergeant' },
    { id: 'o1', at: [32, 9, '1'], arms: 'pistol' },
  ],
  pickups: [{ id: 'contracts', name: 'Rourke\'s contracts', what: 'the contracts', at: [47, 11, '1'], table: false, h: 0.8, colour: [0.9, 0.85, 0.65] }],
  terminals: [{ id: 'tower', name: 'the ground control desk', at: [4, 29, 'T'], face: [0, 1], time: 6, reveal: 25, verb: 'Take over', doing: 'Taking over',
    said: 'Ground control: every departure is held - Rourke\'s jet stops where it is - and the airfield\'s cameras put every red on your radar for 25 seconds.' }],
  objectives: [
    { id: 'o1', kind: 'stop', ref: 'jet', text: 'Stop Rourke\'s jet before it takes off' },
    { id: 'o2', kind: 'take', ref: 'contracts', text: 'Take the contracts (the VIP lounge, upstairs)' },
    { id: 'o3', kind: 'kill', ref: 'rourke', text: 'Stop Rourke', optional: true },
  ],
};
