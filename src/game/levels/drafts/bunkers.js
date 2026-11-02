// FRONTLINE - Level 28, Bunkers and Open Ground (first draft). From Rhys's location boards
//: "Bunkers and Open Space - bunker interiors, defences and fortifications, military equipment".
// The Kessel Line: an old defence line across a mountain valley - a zigzag trench with three pillboxes on it,
// open meadow in front (nowhere to hide), the command bunker dug in behind, and the radar on the knoll to
// the north-east. The Yellows have it, and the launch codes they took with it.
//
// The trench: dug a man's height into the ground - the pillboxes are on it, their firing slits just above
// the grass. The command bunker's strongroom is behind a blast door: its controls are in the bunker's
// comms room. A square is 3 m.
const CELL = 3, W = 80, H = 72;
const grid = () => Array.from({ length: H }, () => new Array(W).fill(' '));
const G = grid(), T = grid(), B = grid();
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const ring = (g, x0, y0, x1, y1, ch) => { for (let x = x0; x <= x1; x++) { put(g, x, y0, ch); put(g, x, y1, ch); } for (let y = y0; y <= y1; y++) { put(g, x0, y, ch); put(g, x1, y, ch); } };
let sd = 17; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;

// ── the trench (T, 1.7 m down): a zigzag across the valley, two squares wide; its sides earth (built in extra) ──
const pts = [[8, 40], [14, 40], [18, 36], [26, 36], [30, 40], [40, 40], [44, 36], [52, 36], [56, 40], [66, 40], [70, 36], [73, 36]];
const dug = new Set(), D = (x, y) => { dug.add(x + ',' + y); put(T, x, y, '.'); };
for (let i = 0; i + 1 < pts.length; i++) {
  const [a, b] = pts[i], [c, d] = pts[i + 1], n = Math.max(Math.abs(c - a), Math.abs(d - b));
  for (let k = 0; k <= n; k++) { const x = Math.round(a + (c - a) * k / n), y = Math.round(b + (d - b) * k / n); D(x, y); D(x + 1, y); D(x, y + 1); D(x + 1, y + 1); }
}
// the pillboxes: on the ground just north of the trench, slits forward (north - you come from the south,
// behind them); a short stair up out of the trench to each one's back door
const boxes = [[19, 29], [45, 29], [59, 33]];
for (const [x, y] of boxes) { ring(G, x, y, x + 5, y + 4, '#'); fill(G, x + 1, y + 1, x + 4, y + 3, '.'); for (const sx of [x + 1, x + 2, x + 3, x + 4]) put(G, sx, y, 'W'); put(G, x + 2, y + 4, 'D'); put(G, x + 3, y + 4, 'D'); put(G, x + 3, y + 1, 'T'); }
const stairs = [
  { x: 21, y: 36, dir: 'N', len: 2, w: 2, from: 'T', to: 'G' },           // up to the pillboxes
  { x: 47, y: 36, dir: 'N', len: 2, w: 2, from: 'T', to: 'G' },
  { x: 61, y: 40, dir: 'N', len: 2, w: 2, from: 'T', to: 'G' },
  { x: 35, y: 41, dir: 'S', len: 2, w: 2, from: 'T', to: 'G' },           // out of the back of the trench
  { x: 9, y: 40, dir: 'W', len: 2, w: 2, from: 'T', to: 'G' },            // out at either end
  { x: 72, y: 36, dir: 'E', len: 2, w: 2, from: 'T', to: 'G' },
  { x: 38, y: 56, dir: 'N', len: 3, w: 2, from: 'G', to: 'B' },           // down into the command bunker
];
const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
const exits = new Set();
for (const st of stairs.filter((q) => q.from === 'T')) {
  const [dx, dy] = DIRS[st.dir];
  for (let i = 0; i < st.len; i++) for (let j = 0; j < st.w; j++) D(st.x + dx * i + (dx ? 0 : j), st.y + dy * i + (dy ? 0 : j));
  for (let j = 0; j < st.w; j++) { const lx = st.x + dx * (st.len - 1) + (dx ? 0 : j), ly = st.y + dy * (st.len - 1) + (dy ? 0 : j); exits.add(lx + ',' + ly + ':' + dx + ',' + dy); }
}
// sandbags along the trench's front lip
for (const k of dug) { const [x, y] = k.split(',').map(Number); if (!dug.has(x + ',' + (y - 1)) && G[y - 1] && G[y - 1][x] === ' ' && !dug.has(x + ',' + (y - 2)) && rnd() < 0.45 && !boxes.some(([bx, by]) => x >= bx && x <= bx + 5 && y - 1 >= by && y - 1 <= by + 5)) put(G, x, y - 1, 'w'); }
// ── the command bunker: its blockhouse (G) behind the line, the stair down, the bunker (B, 5 m down) ──
ring(G, 36, 52, 43, 57, '#'); fill(G, 37, 53, 42, 56, '.'); put(G, 39, 57, 'D'); put(G, 40, 57, 'D'); put(G, 42, 53, 'C');
ring(B, 30, 44, 50, 62, '#'); fill(B, 31, 45, 49, 61, '.');
for (let x = 31; x <= 49; x++) put(B, x, 51, '#'); put(B, 34, 51, 'D'); put(B, 46, 51, 'D');     // the corridor (52-61) and the rooms north of it
for (const x of [37, 43]) for (let y = 45; y <= 50; y++) put(B, x, y, '#');
put(B, 40, 51, 'Q'); put(B, 39, 51, '#');                                   // the strongroom's blast door
for (const [x, y] of [[32, 46], [33, 46], [35, 49]]) put(B, x, y, 'M');      // the comms room (west)
for (const [x, y] of [[45, 46], [48, 46], [45, 49], [48, 49]]) put(B, x, y, 'Y');   // the bunk room (east)
for (const [x, y] of [[38, 45], [42, 45]]) put(B, x, y, 'H');               // the strongroom (middle)
for (const [x, y] of [[32, 58], [33, 58], [47, 58], [47, 59]]) put(B, x, y, 'C'); put(B, 44, 60, 'T');
// ── the radar on the knoll (north-east), its hut; the AA gun; the meadow, woods at the edges ──
ring(G, 62, 8, 67, 12, '#'); fill(G, 63, 9, 66, 11, '.'); put(G, 64, 12, 'D'); put(G, 65, 10, 'M');
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (G[y][x] !== ' ' || dug.has(x + ',' + y)) continue;
  const edge = x < 4 || x > W - 5 || y < 4;
  if (edge && rnd() < 0.3) put(G, x, y, 't'); else if (rnd() < 0.35) put(G, x, y, 'g');
}
for (const [x, y] of [[22, 46], [58, 47], [10, 28], [50, 24]]) put(G, x, y, 'C');
for (const [x, y] of [[30, 20], [46, 14], [20, 12], [55, 26]]) put(G, x, y, 'r');
const holes = [...dug].map((k) => k.split(',').map(Number));


export default {
  id: 'bunkers', no: 28, title: 'Bunkers and Open Ground', place: 'the Kessel Line', cell: CELL, windows: false,
  where: 'The Kessel Line, the Arn valley. 10:30, clear and cold.',
  brief: [
    ['The place', 'An old defence line across a mountain valley: a zigzag <b>trench</b> dug a man\'s height into the meadow, <b>three pillboxes</b> along it facing north (steps up to each from the trench); the <b>command bunker</b> dug in behind it (its blockhouse, and a stair down); the <b>radar</b> on the knoll to the north-east. You come from the south - behind the line.'],
    ['Open ground', 'In front of the line and round the knoll the meadow is bare: nowhere to hide. The trench is your way along the line; the woods are at the valley\'s edges.'],
    ['Objectives', 'Take the <b>launch codes</b> from the bunker\'s strongroom - its blast door opens from the <b>comms room</b>, next to it. <b>Wreck the radar</b>: a charge on its control desk, in the hut on the knoll. Optionally, clear the Yellows off the line.'],
  ],
  time: { date: [19, 11, 2026], hour: 10, minute: 30 }, faction: 'yellow',
  atmos: { fog: [0.75, 0.8, 0.88, 80, 600], ambient: [0.48, 0.52, 0.58], sun: [1, 0.96, 0.9, 1.3, 30, 160] },
  startLoadout: { primary: 'K7', backup: 'PX9', utility1: 'FRAG', utility2: 'SMOKE', gear: 'LENSES' },
  extractName: 'the road, south', navCap: 120000, testNavCap: 600000, chaseMax: 70,
  outside: { backdrop: 'hills', mat: 'desert', tint: [0.6, 0.66, 0.5], margin: 14, holes },
  decals: { g: { mat: 'lawn', tint: [0.75, 0.82, 0.6] } },
  legend: {
    // sandbags: a low wall of them, khaki
    w(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; for (let i = 0; i < 3; i++) k.box([cx - h + 0.05, cy + i * 0.32, cz - 0.45 + (i % 2) * 0.05], [cx + h - 0.05, cy + i * 0.32 + 0.3, cz + 0.45 - (i % 2) * 0.05], 'cloth', { tint: [0.62, 0.56, 0.4] }); },
  },
  floors: {
    B: { y: -5.0, wallH: 3.2, wall: 'concrete2', wallTint: [0.7, 0.72, 0.68], floor: 'concrete', ceil: 'concrete2', lampPower: 0.6, lampColour: [1, 0.95, 0.8], rows: B.map((r) => r.join('')) },
    T: { y: -1.7, wallH: 1.7, floor: 'wood', floorTint: [0.4, 0.33, 0.25], roof: false, lamps: false, rows: T.map((r) => r.join('')) },
    G: { y: 0, wallH: 3.0, wall: 'concrete2', wallTint: [0.72, 0.72, 0.68], floor: 'concrete', ceil: 'concrete2', lampPower: 0.6, rows: G.map((r) => r.join('')) },
  },
  stairs,
  start: { x: 40, y: 70, floor: 'G', yaw: 0 },
  extract: { x: 40, y: 69, floor: 'G' },
  extra(kit) {
    const { box, level, CELL: C } = kit;
    // the trench's sides: earth, boarded, wherever a dug square meets undug ground (not across a stair's top)
    for (const k of dug) {
      const [x, y] = k.split(',').map(Number);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (dug.has((x + dx) + ',' + (y + dy)) || exits.has(x + ',' + y + ':' + dx + ',' + dy)) continue;
        const x0 = dx > 0 ? (x + 1) * C : dx < 0 ? x * C - 0.25 : x * C, x1 = dx > 0 ? (x + 1) * C + 0.25 : dx < 0 ? x * C : (x + 1) * C;
        const z0 = dy > 0 ? (y + 1) * C : dy < 0 ? y * C - 0.25 : y * C, z1 = dy > 0 ? (y + 1) * C + 0.25 : dy < 0 ? y * C : (y + 1) * C;
        box([x0, -1.7, z0], [x1, 0, z1], 'wood', { tint: [0.42, 0.35, 0.27] });
      }
    }
    // the radar: a lattice mast, its dish
    const rx = 70 * C, rz = 10 * C;
    for (const [a, b] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) box([rx + a - 0.1, 0, rz + b - 0.1], [rx + a + 0.1, 12, rz + b + 0.1], 'metal', { tint: [0.6, 0.62, 0.6] });
    for (let h = 2; h < 12; h += 2.5) box([rx - 1.6, h, rz - 1.6], [rx + 1.6, h + 0.12, rz + 1.6], 'metal', { solid: false, tint: [0.55, 0.57, 0.55] });
    box([rx - 4, 12, rz - 0.4], [rx + 4, 15.5, rz + 0.1], 'metal', { tint: [0.82, 0.84, 0.82] });
    level.lights.push({ pos: [rx, 15.8, rz], range: 6, intensity: 1.2, color: [1, 0.2, 0.15] });
    // the AA gun behind the line: its mounting and barrels (a prop)
    const gx = 26 * C, gz = 52 * C;
    box([gx - 1.5, 0, gz - 1.5], [gx + 1.5, 1.0, gz + 1.5], 'metal', { tint: [0.38, 0.42, 0.34] });
    box([gx - 0.3, 1.0, gz - 0.3], [gx + 0.3, 2.2, gz + 0.3], 'metal', { tint: [0.35, 0.38, 0.3] });
    for (const o of [-0.25, 0.25]) box([gx + o - 0.07, 2.1, gz - 3.5], [gx + o + 0.07, 2.3, gz], 'metal', { solid: false, tint: [0.25, 0.27, 0.24] });
    level.signs.push({ pos: [39.95 * C, 2.4, 57 * C + C / 2 + 0.12], yaw: 0, w: 2.4, h: 0.5, text: 'KL-4 COMMAND', sub: 'authorised personnel', col: '#3a4428' });
  },
  zones: [
    { id: 'strong', label: 'The Kessel Line - the bunker\'s strongroom', at: [38, 45, 42, 50], floor: 'B' },
    { id: 'comms', label: 'The Kessel Line - the comms room', at: [31, 45, 36, 50], floor: 'B' },
    { id: 'bunker', label: 'The Kessel Line - the command bunker', at: [30, 44, 50, 62], floor: 'B' },
    { id: 'trench', label: 'The Kessel Line - the trench', at: [0, 30, W - 1, 50], floor: 'T' },
    { id: 'radar', label: 'The Kessel Line - the radar', at: [60, 4, 75, 16] },
    { id: 'all', label: 'The Arn valley', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'p1', at: [22, 31, 'G'], arms: 'lmg', temper: 'steady' },
    { id: 'p2', at: [48, 31, 'G'], arms: 'lmg', temper: 'steady' },
    { id: 'p3', at: [61, 35, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 't1', at: [24, 37, 'T'], route: [[19, 37], [26, 37]], arms: 'carbine' },
    { id: 't2', at: [50, 37, 'T'], route: [[45, 37], [52, 37]], arms: 'smg' },
    { id: 't3', at: [12, 41, 'T'], arms: 'dmr', rank: 'specialist' },
    { id: 'aa', at: [27, 50, 'G'], arms: 'carbine' },
    { id: 'bh', at: [39, 54, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'b1', at: [34, 56, 'B'], route: [[32, 56], [48, 56]], arms: 'carbine' },
    { id: 'b2', at: [34, 47, 'B'], arms: 'pistol', temper: 'cowardly' },
    { id: 'b3', at: [46, 48, 'B'], arms: 'shotgun' },
    { id: 'b4', at: [44, 59, 'B'], arms: 'smg', rank: 'sergeant' },
    { id: 'r1', at: [64, 14, 'G'], route: [[60, 15], [72, 15]], arms: 'dmr', temper: 'steady' },
    { id: 'r2', at: [65, 9, 'G'], arms: 'carbine' },
    { id: 'm1', at: [40, 26, 'G'], route: [[20, 26], [60, 26]], arms: 'carbine' },
  ],
  pickups: [{ id: 'codes', name: 'The launch codes', what: 'the codes', at: [40, 47, 'B'], h: 0.9, colour: [0.9, 0.3, 0.2] }],
  terminals: [
    { id: 'comms', name: 'the comms desk', at: [34, 48, 'B'], face: [0, -1], time: 6, reveal: 25, said: 'The comms desk: the strongroom\'s blast door unlocks - and the line\'s radio net puts every Yellow on your radar for 25 seconds.' },
    { id: 'radar', name: 'the radar\'s control desk', at: [63, 10, 'G'], face: [1, 0], time: 5, reveal: 0.01, verb: 'Plant a charge on', doing: 'Planting a charge on', said: 'The charge is set - and it goes: the radar\'s desk is smoke, and the dish stops turning.' },
  ],
  // (M6.71) papers to read: lore, not needed to finish
  intel: [
    { id: 'duty', at: [44, 60, 'B'], h: 0.78, kind: 'Duty book', title: 'The command bunker\'s duty book', text: ['Watches doubled since the reds were seen in the valley. Nobody has slept above ground for a week.', 'The last entry: "Radar on the knoll reports nothing. Radar on the knoll always reports nothing."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'comms', text: 'Open the strongroom (the comms room, in the bunker)' },
    { id: 'o2', kind: 'take', ref: 'codes', text: 'Take the launch codes (the strongroom)' },
    { id: 'o3', kind: 'hack', ref: 'radar', text: 'Wreck the radar (its hut on the knoll)' },
    { id: 'o4', kind: 'clear', text: 'Clear the Yellows off the line', optional: true },
  ],
};
