// FRONTLINE - Level 32, the Desert Outpost (first draft). From Rhys's location boards (part
// 2): "Desert Outpost - exteriors, interiors, props and equipment". Outpost Kharun, in a canyon in the
// Shael: a ring of sand-filled barriers round a compound - the command post (its roof sandbagged), the
// tents, the motor pool, the cell block, the fuel and ammunition dump, two watchtowers. Mercenaries (the
// Yellows) hold it; they shot down a Ghost helicopter two days ago and have its pilot.
//
// The dump is a charge you set at its stack of drums; the jeeps in the motor pool will drive. A square is 3 m.
const CELL = 3, W = 72, H = 62;
const grid = () => Array.from({ length: H }, () => new Array(W).fill(' '));
const G = grid(), R = grid(), Tw = grid();
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const ring = (g, x0, y0, x1, y1, ch) => { for (let x = x0; x <= x1; x++) { put(g, x, y0, ch); put(g, x, y1, ch); } for (let y = y0; y <= y1; y++) { put(g, x0, y, ch); put(g, x1, y, ch); } };
let sd = 61; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;

// the canyon: its walls along the north and south (rock, built in extra), the floor between; boulders
const wallN = [], wallS = [];
for (let x = 0; x < W; x++) { const n = 4 + Math.round(2 * Math.sin(x / 7) + rnd()), s = 54 - Math.round(2 * Math.sin(x / 6 + 2) + rnd()); wallN.push(n); wallS.push(s); for (let y = 0; y <= n; y++) put(G, x, y, 'J'); for (let y = s; y < H; y++) put(G, x, y, 'J'); }
// the compound's barrier ring (HESCO: 'm'), the gate on the west (the track comes up the canyon from there)
ring(G, 16, 14, 56, 46, 'm'); for (const y of [29, 30, 31]) put(G, 16, y, ' ');
// ── the command post (two storeys: its ops room below, the roof - sandbagged, a way up from inside) ──
ring(G, 34, 18, 45, 26, '#'); fill(G, 35, 19, 44, 25, '.');
for (let y = 19; y <= 25; y++) put(G, 39, y, '#'); put(G, 39, 22, 'D'); put(G, 37, 26, 'D'); put(G, 42, 26, 'D');
for (const x of [36, 41, 43]) put(G, x, 18, 'W'); put(G, 34, 22, 'W'); put(G, 45, 22, 'W');
fill(G, 40, 19, 43, 19, 'M'); put(G, 42, 22, 'T'); put(G, 36, 20, 'T'); put(G, 37, 24, 'H');
fill(R, 34, 18, 45, 26, '.');                                              // its roof (R, 3.6 m)
for (let x = 34; x <= 45; x++) { put(R, x, 18, 'w'); put(R, x, 26, 'w'); } for (let y = 19; y <= 25; y++) { put(R, 34, y, 'w'); put(R, 45, y, 'w'); }
// ── the cell block (south-east): a corridor, three barred cells ──
ring(G, 46, 34, 54, 42, '#'); fill(G, 47, 35, 53, 41, '.');
for (let y = 35; y <= 41; y++) put(G, 50, y, '#');
for (const y of [37, 40]) for (let x = 51; x <= 53; x++) put(G, x, y, '#');
for (const y of [35, 36, 39, 41]) put(G, 50, y, 'b'); put(G, 50, 38, 'L');      // the middle cell's door (locked: kick it)
put(G, 46, 38, 'D'); put(G, 48, 36, 'T');
// ── the tents (north-west), the mess tent, the motor pool (south-west), the dump (north-east) ──
for (const [x, y] of [[20, 18], [24, 18], [28, 18], [20, 23], [24, 23]]) put(G, x, y, 'n');
for (const [x, y] of [[29, 24], [30, 24]]) put(G, x, y, 'T');
for (let x = 20; x <= 30; x += 3) put(G, x, 43, 'v');
fill(G, 19, 36, 31, 36, 'p'); fill(G, 19, 41, 31, 41, 'p');
for (const [x, y] of [[49, 17], [50, 17], [51, 17], [49, 18], [50, 18], [52, 19], [51, 20]]) put(G, x, y, 'B');
for (const [x, y] of [[53, 17], [54, 17], [53, 18], [54, 20], [54, 21]]) put(G, x, y, 'C');
// the comms mast, crates and sandbag nests about the yard
for (const [x, y] of [[33, 33], [36, 38], [44, 31], [22, 30], [28, 30]]) put(G, x, y, 'C');
for (const [x, y] of [[18, 26], [18, 34], [55, 25], [55, 33]]) put(G, x, y, 'w');
// the watchtowers: at the north-west and south-east corners, up a ladder each (Tw, 6 m)
for (const [x, y] of [[17, 15], [55, 45]]) { put(G, x, y, 'J'); put(Tw, x, y, '.'); }
// outside: the track up the canyon from the west, wrecks of the helicopter (east, out past the wall)
for (let x = 0; x < 16; x++) for (const y of [29, 30, 31]) if (G[y][x] === ' ') put(G, x, y, 'k');
for (let i = 0; i < 40; i++) { const x = Math.floor(rnd() * W), y = Math.floor(rnd() * H); if (G[y][x] === ' ' && (x < 15 || x > 57 || y < 13 || y > 47)) put(G, x, y, 'r'); }

const stairs = [{ x: 36, y: 24, dir: 'N', len: 3, w: 1, from: 'G', to: 'R' }];
const ladders = [{ x: 18, y: 15, from: 'G', to: 'T', back: [-1, 0], off: [17, 15] }, { x: 54, y: 45, from: 'G', to: 'T', back: [1, 0], off: [55, 45] }];

export default {
  id: 'outpost', no: 32, title: 'The Desert Outpost', place: 'Outpost Kharun', cell: CELL, windows: false,
  where: 'Outpost Kharun, a canyon in the Shael. 16:50, the wind getting up - dust coming.',
  brief: [
    ['The place', 'A compound in a canyon: a ring of sand-filled barriers, the gate on the west where the track comes up. Inside: the <b>command post</b> (its ops room, and a way up inside onto its sandbagged roof), the tents (north-west), the motor pool (south-west - the jeeps will drive), the <b>cell block</b> (south-east), the <b>fuel and ammunition dump</b> (north-east). Two watchtowers, at the north-west and south-east corners.'],
    ['The Yellows', 'Mercenaries, holding the canyon road. Two days ago they shot down a Ghost helicopter: its pilot, <b>Lieutenant Osei-Brandt</b>, is in the cell block. Their commander is <b>Rask</b>.'],
    ['Objectives', 'Bring the <b>pilot</b> out (the cell block). <b>Blow the dump</b> - set a charge at its stack of drums. Optionally, stop Rask (the ops room).'],
  ],
  time: { date: [3, 7, 2026], hour: 16, minute: 50 }, faction: 'yellow',
  atmos: { fog: [0.85, 0.66, 0.42, 30, 260], ambient: [0.55, 0.48, 0.38], sun: [1, 0.85, 0.6, 1.25, 30, 230], sky: [1.0, 0.8, 0.58] },
  startLoadout: { primary: 'K7', backup: 'PX9', utility1: 'FRAG', utility2: 'SMOKE', gear: 'LENSES' },
  extractName: 'the track, down the canyon', navCap: 120000, testNavCap: 600000, chaseMax: 70,
  outside: { backdrop: 'hills', mat: 'desert', tint: [1.0, 0.85, 0.62], margin: 14 },
  decals: { k: { mat: 'desert', tint: [0.8, 0.65, 0.45] }, p: { mat: 'paint', tint: [0.9, 0.85, 0.5] } },
  legend: {
    // a HESCO barrier: a sand-filled wire basket, head high - cover, a wall you cannot see over
    m(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h, cy, cz - h], [cx + h, cy + 2.1, cz + h], 'desert', { tint: [0.85, 0.72, 0.5] }); k.box([cx - h - 0.02, cy + 0.05, cz - h - 0.02], [cx + h + 0.02, cy + 2.05, cz + h + 0.02], 'grating', { solid: false, tint: [0.5, 0.48, 0.42] }); },
    n(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 1.4, cy, cz - 1.2], [cx + 1.4, cy + 1.7, cz + 1.2], 'cloth', { tint: [0.72, 0.62, 0.45] }); k.box([cx - 0.9, cy + 1.7, cz - 1.2], [cx + 0.9, cy + 2.3, cz + 1.2], 'cloth', { tint: [0.68, 0.58, 0.42], solid: false }); },
    w(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; for (let i = 0; i < 3; i++) k.box([cx - h + 0.05, cy + i * 0.32, cz - 0.45], [cx + h - 0.05, cy + i * 0.32 + 0.3, cz + 0.45], 'cloth', { tint: [0.7, 0.62, 0.44] }); },
    b(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2, top = cy + (k.floors[f].wallH || 3); for (let i = 0; i < 8; i++) { const z = cz - h + 0.15 + i * (k.CELL - 0.3) / 7; k.box([cx - 0.03, cy, z - 0.03], [cx + 0.03, top, z + 0.03], 'metal', { solid: false, tint: [0.3, 0.3, 0.32] }); } k.box([cx - 0.06, cy, cz - h], [cx + 0.06, top, cz + h], 'metal', { render: false, shootThrough: true, noClimb: true }); },
  },
  floors: {
    G: { y: 0, wallH: 3.4, wall: 'concrete2', wallTint: [0.85, 0.75, 0.6], floor: 'concrete', floorTint: [0.75, 0.68, 0.58], ceil: 'concrete2', lampPower: 0.55, lampColour: [1, 0.85, 0.65], rows: G.map((r) => r.join('')) },
    R: { y: 3.6, wallH: 2, roof: false, lamps: false, floor: 'concrete2', floorTint: [0.8, 0.72, 0.6], slab: 0.2, rows: R.map((r) => r.join('')) },
    T: { y: 6.0, wallH: 1.2, roof: false, lamps: false, floor: 'wood', floorTint: [0.55, 0.45, 0.35], slab: 0.25, rows: Tw.map((r) => r.join('')) },
  },
  stairs, ladders,
  start: { x: 1, y: 30, floor: 'G', yaw: -Math.PI / 2 },
  extract: { x: 2, y: 30, floor: 'G' },
  vehicles: [
    { id: 'jeep1', kind: 'jeep', model: 'armouredJeep', paint: 'sand', at: [21.5, 39], yaw: Math.PI / 2, hp: 700 },
    { id: 'jeep2', kind: 'jeep', model: 'armouredJeep', paint: 'sand', at: [26.5, 39], yaw: Math.PI / 2, hp: 700 },
  ],
  extra(kit) {
    const { box, level, CELL: C } = kit;
    // the canyon's walls: rock faces, high, in steps
    for (let x = 0; x < W; x++) {
      const n = wallN[x], s = wallS[x];
      box([x * C, 0, -14 * C], [(x + 1) * C, 14 + (x % 3) * 2, (n + 1) * C], 'rock', { tint: [0.78, 0.55, 0.38] });
      box([x * C, 0, s * C], [(x + 1) * C, 13 + ((x + 1) % 4) * 2, (H + 14) * C], 'rock', { tint: [0.75, 0.53, 0.36] });
    }
    // the watchtowers: boarded bases, a rail round each platform (open at the ladder), a roof
    for (const [x, y, side] of [[17, 15, 1], [55, 45, -1]]) {
      const cx = (x + 0.5) * C, cz = (y + 0.5) * C, h = C / 2, o = { tint: [0.5, 0.4, 0.3] };
      box([cx - h, 0, cz - h], [cx + h, 5.75, cz + h], 'wood', o);
      box([cx - h, 6.0, cz - h], [cx + h, 7.05, cz - h + 0.08], 'wood', o); box([cx - h, 6.0, cz + h - 0.08], [cx + h, 7.05, cz + h], 'wood', o);
      if (side > 0) box([cx - h, 6.0, cz - h], [cx - h + 0.08, 7.05, cz + h], 'wood', o); else box([cx + h - 0.08, 6.0, cz - h], [cx + h, 7.05, cz + h], 'wood', o);
      box([cx - h - 0.3, 8.6, cz - h - 0.3], [cx + h + 0.3, 8.8, cz + h + 0.3], 'metal', { solid: false, tint: [0.5, 0.45, 0.38] });
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box([cx + a * (h - 0.1) - 0.06, 7.0, cz + b * (h - 0.1) - 0.06], [cx + a * (h - 0.1) + 0.06, 8.6, cz + b * (h - 0.1) + 0.06], 'wood', { solid: false, tint: [0.45, 0.36, 0.28] });
    }
    // the comms mast beside the command post; the wreck of the helicopter out east
    const mx = 46.5 * C, mz = 17 * C;
    box([mx - 0.12, 0, mz - 0.12], [mx + 0.12, 18, mz + 0.12], 'metal', { tint: [0.65, 0.65, 0.62] });
    level.lights.push({ pos: [mx, 18.3, mz], range: 6, intensity: 1.2, color: [1, 0.2, 0.15] });
    const hx = 64 * C, hz = 33 * C;
    box([hx - 1.4, 0, hz - 4], [hx + 1.4, 2.4, hz + 2], 'paint', { tint: [0.22, 0.24, 0.22] });
    box([hx - 0.3, 1.0, hz + 2], [hx + 0.3, 1.6, hz + 9], 'paint', { tint: [0.2, 0.22, 0.2] });
    box([hx - 6, 2.5, hz - 0.12], [hx + 2, 2.6, hz + 0.12], 'metal', { solid: false, tint: [0.15, 0.15, 0.15] });
    level.signs.push({ pos: [16 * C - 0.4, 2.6, 27.5 * C], yaw: -Math.PI / 2, w: 2.4, h: 0.6, text: 'KHARUN', sub: 'keep out', col: '#6a4a1a' });
  },
  zones: [
    { id: 'roof', label: 'Outpost Kharun - the command post\'s roof', at: [34, 18, 45, 26], floor: 'R' },
    { id: 'ops', label: 'Outpost Kharun - the ops room', at: [40, 19, 44, 25] },
    { id: 'cp', label: 'Outpost Kharun - the command post', at: [34, 18, 45, 26] },
    { id: 'cells', label: 'Outpost Kharun - the cell block', at: [46, 34, 54, 42] },
    { id: 'dump', label: 'Outpost Kharun - the dump', at: [48, 16, 55, 22] },
    { id: 'motor', label: 'Outpost Kharun - the motor pool', at: [18, 35, 32, 45] },
    { id: 'tents', label: 'Outpost Kharun - the tents', at: [18, 16, 32, 26] },
    { id: 'compound', label: 'Outpost Kharun', at: [16, 14, 56, 46] },
    { id: 'canyon', label: 'The Shael - the canyon', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'rask', at: [42, 23, 'G'], arms: 'carbine', rank: 'officer', temper: 'steady', name: 'Rask' },
    { id: 'o1', at: [36, 22, 'G'], arms: 'smg' },
    { id: 'r1', at: [38, 20, 'R'], arms: 'lmg', temper: 'steady' },
    { id: 'r2', at: [43, 25, 'R'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'w1', at: [17, 15, 'T'], arms: 'dmr', temper: 'steady' },
    { id: 'w2', at: [55, 45, 'T'], arms: 'carbine', temper: 'steady' },
    { id: 'g1', at: [19, 29, 'G'], arms: 'carbine' },
    { id: 'g2', at: [19, 32, 'G'], arms: 'smg' },
    { id: 'c1', at: [48, 39, 'G'], arms: 'shotgun' },
    { id: 'c2', at: [47, 44, 'G'], route: [[40, 44], [53, 44]], arms: 'carbine' },
    { id: 'd1', at: [52, 22, 'G'], arms: 'carbine' },
    { id: 't1', at: [26, 21, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'm1', at: [24, 38, 'G'], arms: 'smg' },
    { id: 'y1', at: [32, 30, 'G'], route: [[20, 28], [52, 28], [52, 32], [20, 32]], arms: 'carbine' },
    { id: 'y2', at: [38, 40, 'G'], arms: 'rocket', temper: 'steady' },
  ],
  hostages: [{ id: 'pilot', name: 'Lieutenant Osei-Brandt', at: [52, 38, 'G'] }],
  terminals: [{ id: 'dump', name: 'the stack of drums', at: [51, 19, 'G'], face: [0, 1], time: 5, reveal: 0.01, verb: 'Set a charge on', doing: 'Setting a charge on',
    said: 'The charge is set on the drums - and they go up: the dump is fire and smoke, and the compound with it.' }],
  objectives: [
    { id: 'o1', kind: 'rescue', ref: 'pilot', text: 'Bring the pilot out (the cell block)' },
    { id: 'o2', kind: 'hack', ref: 'dump', text: 'Blow the dump (a charge on its drums)' },
    { id: 'o3', kind: 'kill', ref: 'rask', text: 'Stop Rask (the ops room)', optional: true },
  ],
};
