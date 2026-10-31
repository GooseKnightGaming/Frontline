// FRONTLINE - Level 20, the Riverboat Pursuit (the first vehicle mission; M8 begins). From Rhys's
// Riverside Hotel notes: the reds' leader "flees ... at the first sign of danger; the mission runs straight on
// into a Riverboat Pursuit (no extraction)". Here, on its own for now: the hotel is behind you, the captain is
// away down the River Vell in a launch, and Ghost's speedboat is at the hotel jetty. Catch him before he
// reaches the harbour and the ship waiting there.
//
// The river winds a kilometre south through the warehouse district - three bridges over it, reds on the
// banks and the bridges with rifles and rocket launchers, a gunboat working the middle reach - then opens
// into the harbour basin. A square is 3 m.
const W = 96, H = 330, CELL = 3, RW = 6;              // the river: 2 x RW + 1 squares wide
const cx = (y) => Math.round(48 + 20 * Math.sin(y / 38) + 9 * Math.sin(y / 15 + 1.1));
const BASIN = 300;                                      // from here south, the harbour basin
const G = Array.from({ length: H }, () => new Array(W).fill(' '));
const F1 = Array.from({ length: H }, () => new Array(W).fill(' '));
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
// the river, and the quays along it
for (let y = 0; y < H; y++) {
  if (y >= BASIN) { for (let x = 4; x < W - 4; x++) put(G, x, y, '~'); continue; }
  const c = cx(y), r = RW + Math.max(0, y - (BASIN - 12));          // (the river's mouth opens out into the basin)
  for (let x = c - r; x <= c + r; x++) put(G, x, y, '~');
  for (const x of [c - r - 3, c - r - 2, c - r - 1, c + r + 1, c + r + 2, c + r + 3]) if (G[y][x] === ' ') put(G, x, y, 'p');
}
// warehouses along the banks: rows of them, set back from the quays; doors onto the quay side
const sheds = [];
for (let y0 = 14; y0 < BASIN - 16; y0 += 22) {
  for (const side of [-1, 1]) {
    const c = cx(y0 + 7), x0 = side < 0 ? c - RW - 5 - 12 : c + RW + 5;
    let clear = true;
    for (let y = y0; y < y0 + 14 && clear; y++) for (let x = x0 - 1; x < x0 + 13; x++) if (x < 1 || x >= W - 1 || G[y][x] === '~' || G[y][x] === 'p') { clear = false; break; }
    if (!clear) continue;
    for (let y = y0; y < y0 + 14; y++) for (let x = x0; x < x0 + 12; x++) put(G, x, y, (y === y0 || y === y0 + 13 || x === x0 || x === x0 + 11) ? '#' : '.');
    const dx = side < 0 ? x0 + 11 : x0;
    put(G, dx, y0 + 6, 'D'); put(G, dx, y0 + 7, 'D');
    for (const [a, b] of [[x0 + 3, y0 + 4], [x0 + 8, y0 + 9], [x0 + 3, y0 + 10]]) put(G, a, b, 'C');
    put(G, x0 + 8, y0 + 3, 'B');
    sheds.push({ x0, y0, side });
  }
}
// the bridges: decks over the river at 7 m, stairs up to them from the quays on both sides
const BRIDGES = [70, 150, 230];
const stairs = [];
for (const by of BRIDGES) {
  const c = cx(by), a = c - RW - 6, b = c + RW + 6;
  for (let x = a; x <= b; x++) for (const y of [by, by + 1]) put(F1, x, y, '.');
  stairs.push({ x: a - 1, y: by, dir: 'E', len: 0, w: 2, from: 'G', to: '1', skip: true });
  // up from the west quay (heading east) and from the east quay (heading west), each landing on the deck's end
  for (let k = 1; k <= 8; k++) { put(G, a - k, by, 'p'); put(G, a - k, by + 1, 'p'); put(G, b + k, by, 'p'); put(G, b + k, by + 1, 'p'); }
  stairs.push({ x: a - 8, y: by, dir: 'E', len: 7, w: 2, from: 'G', to: '1' }, { x: b + 8, y: by, dir: 'W', len: 7, w: 2, from: 'G', to: '1' });
  for (const [x, y] of [[a - 1, by], [a - 1, by + 1], [b + 1, by], [b + 1, by + 1]]) put(F1, x, y, '.');
}
// the harbour: a quay along its west side with the police launch's berth (the way out); the ship's berth south
for (let y = BASIN - 2; y < H - 2; y++) for (let x = 0; x < 4; x++) put(G, x, y, 'p');
for (const [x, y] of [[2, 312], [2, 316], [1, 320]]) put(G, x, y, 'C');
// trees and parked cars on the open ground
let sd = 11; const rr = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < 140; i++) { const x = Math.floor(rr() * W), y = Math.floor(rr() * (BASIN - 4)); if (G[y][x] === ' ') put(G, x, y, rr() < 0.75 ? 't' : 'v'); }
// the path the captain's launch takes: down the middle of the river, into the basin, to the ship's berth
const path = [];
for (let y = 30; y < BASIN; y += 6) path.push([cx(y), y]);
path.push([cx(BASIN - 1), BASIN + 4], [48, 312], [48, 316], [48, 321]);
// the gunboat: up and down the middle reach
const gunPath = []; for (let y = 120; y <= 200; y += 6) gunPath.push([cx(y), y]); for (let y = 200; y >= 120; y -= 6) gunPath.push([cx(y) + 2, y]);
const c0 = cx(10);

export default {
  id: 'riverboat', no: 20, title: 'The Riverboat Pursuit', place: 'the River Vell', cell: CELL, windows: true,
  where: 'The River Vell, below the Riverside Hotel. 19:40, an overcast evening.',
  brief: [
    ['The chase', 'The reds\' captain got out of the Riverside Hotel and down to the river: he is away in a launch, heading for the harbour and the ship waiting for him there. <b>Ghost\'s speedboat is at the hotel jetty</b> - E to take the helm.'],
    ['Driving', '<b>W</b> opens the throttle, <b>S</b> eases off and goes astern, <b>A</b> and <b>D</b> steer, <b>SPACE</b> brakes; the view turns with the boat; hold <b>right mouse</b> to keep it where you point it while you shoot - a shot near enough on a man finds him. <b>E</b> gets you out again. The bank stops a boat as a wall does - and hard knocks damage it.'],
    ['The river', 'A kilometre of it winding south through the warehouse district, under three bridges, into the harbour basin. Reds on the quays and the bridges - rifles, and rocket launchers. A gunboat works the middle reach.'],
    ['Objective', '<b>Stop the captain\'s launch</b> before it reaches the ship: its helmsman or the captain down, or the launch wrecked. Then the <b>police launch at Kell Quay</b>, on the harbour\'s west side.'],
  ],
  time: { date: [9, 7, 2026], hour: 19, minute: 40 }, faction: 'red',
  startLoadout: { primary: 'K7', backup: 'PX9', utility1: 'FRAG', utility2: 'SMOKE', gear: 'LENSES' },
  extractName: 'the police launch at Kell Quay', vehicle: false, navCap: 40000, testNavCap: 1200000, chaseMax: 60, pieceBudget: 9000,
  outside: { backdrop: 'city', mat: 'lawn', tint: [0.75, 0.82, 0.7], margin: 10 },
  decals: { p: { mat: 'concrete2', tint: [0.72, 0.7, 0.66] } },
  floors: {
    G: { y: 0, wallH: 5.5, wall: 'brick', wallTint: [0.75, 0.7, 0.66], floor: 'concrete', ceil: 'metal', channel: 3.0, surf: 0.6, flow: [0, 1], lampPower: 0.8, lampEvery: 12, rows: G.map((r) => r.join('')), windows: false },
    1: { y: 7, wallH: 2, roof: false, lamps: false, floor: 'concrete2', floorTint: [0.6, 0.6, 0.62], slab: 0.5, rows: F1.map((r) => r.join('')) },
  },
  stairs: stairs.filter((s) => !s.skip),
  start: { x: c0 + RW + 1, y: 10, floor: 'G', yaw: Math.PI / 2 },
  extract: { x: 2, y: 306, floor: 'G' },
  vehicles: [
    { id: 'ghostboat', kind: 'boat', at: [c0 + RW, 10], yaw: Math.PI, paint: 'ghost', hp: 500 },
    { id: 'launch', kind: 'boat', at: [cx(30), 30], yaw: Math.PI, paint: 'red', path, speed: 12.5, goal: 'escape', name: 'The captain\'s launch',
      crew: [{ id: 'cap_helm', at: [-0.4, 0.6] }, { id: 'captain', at: [0.4, 0.9] }, { id: 'cap_guard', at: [0, 2.2] }] },
    { id: 'gunboat', kind: 'boat', at: [cx(120), 120], yaw: Math.PI, paint: 'olive', path: gunPath, speed: 8, hp: 600, loop: true,
      crew: [{ id: 'gb_helm', at: [-0.4, 0.6] }, { id: 'gb_gun', at: [0, 2.2] }] },
  ],
  extra(kit) {
    const { box, mid, level } = kit;
    // the jetties: the hotel's (Ghost's boat there), the police launch's at Kell Quay
    box([mid(c0 + RW - 2), -0.2, mid(4)], [mid(c0 + RW) + 1.5, 0.05, mid(6)], 'wood', { tint: [0.55, 0.45, 0.35] });
    box([mid(4) - 1.5, -0.2, mid(304)], [mid(7), 0.05, mid(306)], 'wood', { tint: [0.55, 0.45, 0.35] });
    // the police launch, moored (a shape, not to drive), and the ship at the end of the basin
    box([mid(5), -0.4, mid(307) - 3], [mid(5) + 2.4, 1.6, mid(307) + 3], 'paint', { tint: [0.15, 0.2, 0.45] });
    box([mid(36), -1, mid(327)], [mid(62), 9, mid(329) + 4], 'paint', { tint: [0.28, 0.3, 0.32] });
    box([mid(44), 9, mid(327)], [mid(52), 15, mid(329) + 2], 'paint', { tint: [0.85, 0.85, 0.82] });
    // the bridges' piers, on the river's edges, and lamps along them
    for (const by of BRIDGES) {
      const c = cx(by);
      for (const x of [c - RW, c + RW]) box([mid(x) - 0.6, -3, mid(by) - 1], [mid(x) + 0.6, 6.5, mid(by + 1) + 1], 'concrete2', { tint: [0.6, 0.6, 0.62] });
      // parapets along both sides of the deck, chest high
      for (const z of [by * CELL, (by + 2) * CELL]) box([(c - RW - 7) * CELL, 7, z - 0.2], [(c + RW + 8) * CELL, 8.1, z + 0.2], 'concrete2', { tint: [0.62, 0.6, 0.6] });
      for (const x of [c - RW - 4, c + RW + 4]) level.lights.push({ pos: [mid(x), 9.5, mid(by) + 1.5], range: 16, intensity: 1.2, color: [1, 0.8, 0.55], street: true });
    }
    // lamps along the quays
    for (let y = 6, n = 0; y < BASIN; y += 13, n++) { const side = n % 2 ? 1 : -1, x = cx(y) + side * (RW + 2); level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 14, intensity: 1.0, color: [1, 0.82, 0.58], street: true }); box([mid(x) - 0.08, 0, mid(y) - 0.08], [mid(x) + 0.08, 4.6, mid(y) + 0.08], 'metal', { tint: [0.2, 0.2, 0.22], solid: false }); box([mid(x) - 0.25, 4.5, mid(y) - 0.25], [mid(x) + 0.25, 4.7, mid(y) + 0.25], 'lamp', { solid: false }); }
  },
  reach: [],
  zones: [
    { id: 'jetty', label: 'The River Vell - the hotel jetty', at: [c0 - 12, 0, c0 + 12, 16] },
    ...BRIDGES.map((by, i) => ({ id: 'br' + i, label: 'The River Vell - ' + ['Mill Bridge', 'Tanners\' Bridge', 'the Iron Bridge'][i], at: [cx(by) - RW - 8, by - 1, cx(by) + RW + 8, by + 2], floor: '1' })),
    { id: 'basin', label: 'Kell Harbour - the basin', at: [0, BASIN, W - 1, H - 1] },
    { id: 'river', label: 'The River Vell', at: [0, 0, W - 1, BASIN - 1] },
  ],
  guards: [
    // aboard the captain's launch
    { id: 'cap_helm', at: [cx(30), 30, 'G'], arms: 'smg', temper: 'steady', objective: false },
    { id: 'captain', at: [cx(30), 31, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The captain', tint: [1.35, 0.5, 0.46] },
    { id: 'cap_guard', at: [cx(30), 32, 'G'], arms: 'carbine', temper: 'steady' },
    // aboard the gunboat
    { id: 'gb_helm', at: [cx(120), 120, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'gb_gun', at: [cx(120), 121, 'G'], arms: 'lmg', temper: 'steady' },
    // on the bridges
    { id: 'b1a', at: [cx(70) - 3, 70, '1'], arms: 'rocket', temper: 'steady' },
    { id: 'b1b', at: [cx(70) + 4, 71, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'b2a', at: [cx(150), 150, '1'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'b2b', at: [cx(150) - 5, 151, '1'], arms: 'rocket', temper: 'steady' },
    { id: 'b3a', at: [cx(230) + 3, 230, '1'], arms: 'lmg', temper: 'steady' },
    { id: 'b3b', at: [cx(230) - 4, 231, '1'], arms: 'rocket', temper: 'steady' },
    // on the quays
    { id: 'q1', at: [cx(40) + RW + 2, 40, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'q2', at: [cx(105) - RW - 2, 105, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'q3', at: [cx(190) + RW + 2, 190, 'G'], arms: 'rocket', temper: 'steady' },
    { id: 'q4', at: [cx(265) - RW - 2, 265, 'G'], arms: 'dmr', temper: 'steady' },
    { id: 'q5', at: [cx(285) + RW + 2, 285, 'G'], arms: 'carbine', temper: 'steady' },
  ],
  objectives: [
    { id: 'o1', kind: 'stop', ref: 'launch', text: 'Stop the captain\'s launch before it reaches the ship' },
    { id: 'o2', kind: 'kill', ref: 'captain', text: 'Stop the captain', optional: true },
    { id: 'o3', kind: 'stop', ref: 'gunboat', text: 'Take out the gunboat', optional: true },
  ],
};
