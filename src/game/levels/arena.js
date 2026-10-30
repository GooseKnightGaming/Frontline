// FRONTLINE - Level 29, the Colosseum: Battle (M6.20.5, first draft). From Rhys's location boards (M6.8.1):
// "Colosseum / Arena - arena equipment, seating and spectators". Varnholm's old amphitheatre, the Arena
// Vetera: the oval of sand, its podium wall, two tiers of stone seating, the arcaded corridor round the
// outside - and the hypogeum, the tunnels under the sand, with trapdoor stairs up into it. A battle: Ghost
// from the west gate, the reds from the east.
//
// Built from an ellipse: the sand inside it; the first tier (2.4 m) and the second (4.8 m) in rings round
// it; the corridor round them on the ground; the gate tunnels under the tiers. A square is 2 m.
const CELL = 2, W = 74, H = 62, cx = 37, cy = 31, A = 18, Bq = 12;
const grid = () => Array.from({ length: H }, () => new Array(W).fill(' '));
const G = grid(), T1 = grid(), T2 = grid(), B = grid();
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const e = (x, y, k) => ((x + 0.5 - cx) / (A + k)) ** 2 + ((y + 0.5 - cy) / (Bq + k)) ** 2;      // < 1: inside ring k
const inside = (x, y, k) => e(x, y, k) < 1;
let sd = 29; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
const nb4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const jcells = [], t2cells = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (inside(x, y, 0)) { put(G, x, y, '.'); continue; }
  if (inside(x, y, 3)) { put(T1, x, y, '.'); }
  else if (inside(x, y, 7)) { put(T2, x, y, '.'); t2cells.push([x, y]); }
  if (inside(x, y, 7)) { put(G, x, y, nb4.some(([a, b]) => inside(x + a, y + b, 0)) ? '#' : 'J'); if (G[y][x] === 'J') jcells.push([x, y]); continue; }
  if (inside(x, y, 10)) put(G, x, y, nb4.some(([a, b]) => inside(x + a, y + b, 7)) ? '#' : '.');
  else if (nb4.some(([a, b]) => inside(x + a, y + b, 10))) put(G, x, y, '#');
}
// walls round a curve step diagonally: close each step (a wall square in the corner, on the outside)
const WALLY = '#:';
for (let pass = 0; pass < 2; pass++) for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
  if (G[y][x] !== '#') continue;
  for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    if (G[y + dy][x + dx] !== '#' || WALLY.includes(G[y][x + dx]) || WALLY.includes(G[y + dy][x])) continue;
    // whichever corner square is further from the middle (outside the curve) - unless it is sand
    const a = [x + dx, y], b = [x, y + dy], pick = e(a[0], a[1], 0) > e(b[0], b[1], 0) ? a : b;
    if (!inside(pick[0], pick[1], 0)) put(G, pick[0], pick[1], '#');
  }
}
// the outer arcade: arches at eight points round it
for (let i = 0; i < 16; i++) {
  const t = i / 16 * Math.PI * 2, x = Math.round(cx - 0.5 + Math.cos(t) * (A + 10.4)), y = Math.round(cy - 0.5 + Math.sin(t) * (Bq + 10.4));
  for (const [a, b] of [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]) if (G[y + b] && G[y + b][x + a] === '#') put(G, x + a, y + b, ':');
}
// the two gates: tunnels from the corridor, under the tiers, onto the sand (west and east)
for (const dir of [-1, 1]) {
  for (let x = cx; x >= 0 && x < W; x += dir) {
    if (inside(x, cy, 0)) continue;
    if (!inside(x, cy, 7.9)) break;
    for (const y of [cy - 2, cy - 1, cy, cy + 1]) put(G, x, y, (y === cy - 2 || y === cy + 1) ? '#' : '.');
  }
}
// the inner gate itself: a portcullis-wide opening in the podium wall; the outer end opens on the corridor
for (let y = cy - 1; y <= cy; y++) for (let x = 0; x < W; x++) if (G[y][x] === '#' && (inside(x - 1, y, 0) || inside(x + 1, y, 0))) put(G, x, y, ':');
// the hypogeum (B, 3.5 m down): a cross of tunnels under the sand, the animal pens either side
for (let x = cx - 13; x <= cx + 12; x++) for (let y = cy - 2; y <= cy + 1; y++) put(B, x, y, (y === cy - 2 || y === cy + 1) ? '#' : '.');
for (let y = cy - 10; y <= cy + 9; y++) for (let x = cx - 2; x <= cx + 1; x++) if (B[y][x] !== '.') put(B, x, y, (x === cx - 2 || x === cx + 1) ? '#' : '.');
for (const x of [cx - 13, cx + 12]) for (let y = cy - 2; y <= cy + 1; y++) put(B, x, y, '#');
for (const y of [cy - 10, cy + 9]) for (let x = cx - 2; x <= cx + 1; x++) put(B, x, y, '#');
for (const [x0, y0] of [[cx - 9, cy - 6], [cx + 4, cy - 6], [cx - 9, cy + 1], [cx + 4, cy + 1]]) {
  for (let y = y0; y <= y0 + 4; y++) for (let x = x0; x <= x0 + 5; x++) put(B, x, y, (y === y0 || y === y0 + 4 || x === x0 || x === x0 + 5) ? '#' : '.');
}
put(B, cx - 6, cy - 2, 'D'); put(B, cx + 6, cy - 2, 'D'); put(B, cx - 6, cy + 1, 'D'); put(B, cx + 6, cy + 1, 'D');
put(B, cx - 7, cy - 4, 'C'); put(B, cx + 7, cy - 4, 'C'); put(B, cx - 7, cy + 4, 'B'); put(B, cx + 7, cy + 4, 'C');
// cover on the sand: crates, broken columns, the old chariot barricades
const cover = [[cx - 10, cy - 6, 'C'], [cx - 9, cy - 6, 'C'], [cx + 9, cy + 6, 'C'], [cx + 10, cy + 6, 'C'], [cx - 4, cy + 4, 'P'], [cx + 4, cy - 4, 'P'],
  [cx - 14, cy + 3, 'w'], [cx + 14, cy - 3, 'w'], [cx, cy - 6, 'w'], [cx + 1, cy - 6, 'w'], [cx - 1, cy + 6, 'w'], [cx, cy + 6, 'w'], [cx - 7, cy, 'C'], [cx + 7, cy, 'C'], [cx - 6, cy - 9, 'P'], [cx + 6, cy + 9, 'P']];
for (const [x, y, c] of cover) put(G, x, y, c);
// debris on the tiers
for (let i = 0; i < 22; i++) { const t = rnd() * Math.PI * 2, r = rnd() < 0.5 ? 1.5 : 5, x = Math.round(cx - 0.5 + Math.cos(t) * (A + r)), y = Math.round(cy - 0.5 + Math.sin(t) * (Bq + r)); const g = r < 3 ? T1 : T2; if (g[y] && g[y][x] === '.') put(g, x, y, rnd() < 0.5 ? 'C' : 'r'); }

// the stairs: up from the corridor to the second tier at the four diagonals; down from the second to the
// first; and the trapdoor stairs up from the hypogeum onto the sand
const stairs = [], DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
for (const [sx, sy, dir] of [[cx - 22, cy - 12, 'E'], [cx + 21, cy - 12, 'W'], [cx - 22, cy + 11, 'E'], [cx + 21, cy + 11, 'W']]) {
  stairs.push({ x: sx, y: sy, dir, len: 4, w: 2, from: 'G', to: 'T2' });
}
for (const [sx, sy, dir] of [[cx - 2, cy - 18, 'S'], [cx, cy + 17, 'N']]) stairs.push({ x: sx, y: sy, dir, len: 2, w: 2, from: 'T2', to: 'T1' });
stairs.push({ x: cx - 10, y: cy - 1, dir: 'W', len: 2, w: 2, from: 'B', to: 'G' }, { x: cx + 9, y: cy - 1, dir: 'E', len: 2, w: 2, from: 'B', to: 'G' },
  { x: cx - 1, y: cy - 7, dir: 'N', len: 2, w: 2, from: 'B', to: 'G' }, { x: cx - 1, y: cy + 6, dir: 'S', len: 2, w: 2, from: 'B', to: 'G' });
// make sure each stair's squares, and where it comes out, are open on the floors they use
for (const st of stairs) {
  const [dx, dy] = DIRS[st.dir], gF = { G, T1, T2, B };
  for (let i = -1; i <= st.len; i++) for (let j = 0; j < st.w; j++) {
    const x = st.x + dx * i + (dx ? 0 : j), y = st.y + dy * i + (dy ? 0 : j);
    if (i < st.len) { const f = gF[st.from]; if (f[y][x] !== '.') { if (st.from === 'G' && G[y][x] === 'J') { put(G, x, y, '.'); } else if (i >= 0) put(f, x, y, '.'); } }
    if (i === st.len) { const f = gF[st.to]; if (f[y][x] === ' ' || f[y][x] === 'J' || f[y][x] === '#') put(f, x, y, '.'); }
  }
}
// the sand is open to the sky: no roof over it (row by row, the ellipse's span)
const sky = [];
for (let y = 0; y < H; y++) { let a = -1, b = -1; for (let x = 0; x < W; x++) if (inside(x, y, 0.6)) { if (a < 0) a = x; b = x; } if (a >= 0) sky.push([a, y, b, y]); }
const lane = (pts) => pts.map(([x, y, f]) => [x, y, f || 'G']);

export default {
  id: 'arena', no: 29, title: 'The Colosseum: Battle', place: 'the Arena Vetera', cell: CELL, tidy: false, windows: false,
  where: 'The Arena Vetera, Varnholm\'s old amphitheatre. 17:40, the sun low over the stands - and a battle.',
  brief: [
    ['The battle', '<b>Ghost against the reds</b>, eight minutes on the clock, sixty men a side in reserve. Ghost comes in by the <b>west gate</b>, the reds by the east. Every man who falls is replaced from the reserve, you as well; the side with more left when the clock runs out wins.'],
    ['The ground', 'The oval of sand in the middle, a little cover on it; the podium wall round it, the <b>two tiers</b> of stone seating above (up from the corridor at the four diagonals - good for a rifle, nowhere to hide); the arcaded <b>corridor</b> round the outside; and the <b>hypogeum</b> under the sand - tunnels, the old animal pens, trapdoor stairs up into the arena at four points.'],
    ['Your kit', 'A K7, a PX9, frags and a smoke grenade.'],
  ],
  time: { date: [8, 8, 2026], hour: 17, minute: 40 }, faction: 'red',
  atmos: { fog: [0.85, 0.72, 0.55, 60, 500], sun: [1, 0.8, 0.55, 1.25, 22, 250], ambient: [0.5, 0.45, 0.4] },
  startLoadout: { primary: 'K7', backup: 'PX9', utility1: 'FRAG', utility2: 'SMOKE', gear: 'LENSES' },
  extractName: 'the west gate', vehicle: false, navCap: 150000,
  outside: { backdrop: 'city', mat: 'concrete', tint: [0.85, 0.8, 0.7], margin: 14 },
  floors: {
    B: { y: -3.5, wallH: 3.2, wall: 'brick', wallTint: [0.6, 0.5, 0.42], floor: 'rock', floorTint: [0.5, 0.45, 0.38], ceil: 'wood', ceilTint: [0.4, 0.32, 0.25], lampPower: 0.5, lampColour: [1, 0.7, 0.4], lampEvery: 7, rows: B.map((r) => r.join('')) },
    G: { y: 0, wallH: 2.4, wall: 'marble', wallTint: [0.85, 0.78, 0.66], floor: 'desert', floorTint: [0.95, 0.85, 0.65], ceil: 'marble', ceilTint: [0.75, 0.7, 0.6], lampPower: 0.5, lampColour: [1, 0.8, 0.55], lampEvery: 10, noRoof: sky, rows: G.map((r) => r.join('')) },
    T1: { y: 2.4, wallH: 2, roof: false, lamps: false, floor: 'marble', floorTint: [0.82, 0.76, 0.64], slab: 0.25, rows: T1.map((r) => r.join('')) },
    T2: { y: 4.8, wallH: 2, roof: false, lamps: false, floor: 'marble', floorTint: [0.8, 0.74, 0.62], slab: 0.25, rows: T2.map((r) => r.join('')) },
  },
  stairs,
  start: { x: cx - 26, y: cy, floor: 'G', yaw: -Math.PI / 2 },
  battle: {
    you: 'ghost', timer: 480,
    teams: {
      ghost: {
        name: 'Ghost', short: 'Ghost', faction: 'ally', reserve: 60, field: 10, arms: ['carbine', 'smg', 'carbine', 'dmr'],
        spawns: [[cx - 26, cy - 1, 'G'], [cx - 26, cy + 1, 'G'], [cx - 25, cy - 4, 'G']],
        lanes: [
          lane([[cx - 26, cy], [cx - 19, cy], [cx - 8, cy - 2], [cx + 8, cy + 2], [cx + 19, cy], [cx + 26, cy]]),
          lane([[cx - 26, cy], [cx - 22, cy - 12], [cx, cy - 21], [cx + 22, cy - 12], [cx + 26, cy]]),
          lane([[cx - 26, cy], [cx - 22, cy + 12], [cx, cy + 21], [cx + 22, cy + 12], [cx + 26, cy]]),
          lane([[cx - 26, cy], [cx - 19, cy], [cx - 13, cy - 1], [cx - 11, cy - 1, 'B'], [cx + 10, cy - 1, 'B'], [cx + 12, cy - 1], [cx + 19, cy], [cx + 26, cy]]),
        ],
      },
      red: {
        name: 'The reds', short: 'Reds', faction: 'red', reserve: 60, field: 10, arms: ['carbine', 'smg', 'shotgun', 'carbine'],
        spawns: [[cx + 25, cy - 1, 'G'], [cx + 25, cy + 1, 'G'], [cx + 24, cy + 4, 'G']],
        lanes: [
          lane([[cx + 26, cy], [cx + 19, cy], [cx + 8, cy + 2], [cx - 8, cy - 2], [cx - 19, cy], [cx - 26, cy]]),
          lane([[cx + 26, cy], [cx + 22, cy - 12], [cx, cy - 21], [cx - 22, cy - 12], [cx - 26, cy]]),
          lane([[cx + 26, cy], [cx + 22, cy + 12], [cx, cy + 21], [cx - 22, cy + 12], [cx - 26, cy]]),
          lane([[cx + 26, cy], [cx + 19, cy], [cx + 12, cy - 1], [cx + 10, cy - 1, 'B'], [cx - 11, cy - 1, 'B'], [cx - 13, cy - 1], [cx - 19, cy], [cx - 26, cy]]),
        ],
      },
    },
  },
  extra(kit) {
    const { box, CELL: C, level } = kit;
    // under the tiers: solid masonry - to the first tier under it all, and on up to the second under that
    const runs = (cells, y0, y1, mat, tint) => {
      const set = new Set(cells.map(([x, y]) => x + ',' + y));
      for (let y = 0; y < H; y++) { let x = 0; while (x < W) { if (!set.has(x + ',' + y)) { x++; continue; } let e2 = x; while (set.has((e2 + 1) + ',' + y)) e2++; box([x * C, y0, y * C], [(e2 + 1) * C, y1, (y + 1) * C], mat, { tint }); x = e2 + 1; } }
    };
    runs(jcells.filter(([x, y]) => G[y][x] === 'J'), 0, 2.4 - 0.25, 'marble', [0.78, 0.72, 0.6]);
    runs(t2cells.filter(([x, y]) => T2[y][x] === '.' || T2[y][x] === 'C' || T2[y][x] === 'r'), 2.4, 4.8 - 0.25, 'marble', [0.8, 0.74, 0.62]);
    // the outer wall's upper storeys: arches above the arcade, to the top of the stands
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((G[y][x] === '#' || G[y][x] === ':') && !inside(x, y, 7.5)) box([x * C, 2.4, y * C], [(x + 1) * C, 9.5, (y + 1) * C], 'marble', { tint: [0.82, 0.74, 0.6] });
    // banners over the gates
    for (const s of [-1, 1]) { const x = cx + s * (A + 0.4); box([x * C - 0.1, 2.4, (cy - 2) * C], [x * C + 0.1, 4.4, (cy + 2) * C], 'cloth', { solid: false, tint: s < 0 ? [0.2, 0.3, 0.45] : [0.6, 0.12, 0.1] }); }
    level.signs.push({ pos: [(cx - A - 10.6) * C, 3.6, cy * C], yaw: -Math.PI / 2, w: 3.6, h: 0.7, text: 'PORTA OCCIDENS', sub: 'Ghost', col: '#2a3a52' });
    level.signs.push({ pos: [(cx + A + 10.6) * C, 3.6, cy * C], yaw: Math.PI / 2, w: 3.6, h: 0.7, text: 'PORTA ORIENS', sub: 'the reds', col: '#5a1a14' });
  },
  zones: [
    { id: 'hypo', label: 'The Arena - the hypogeum', at: [cx - 14, cy - 11, cx + 13, cy + 10], floor: 'B' },
    { id: 't2', label: 'The Arena - the upper tier', at: [0, 0, W - 1, H - 1], floor: 'T2' },
    { id: 't1', label: 'The Arena - the lower tier', at: [0, 0, W - 1, H - 1], floor: 'T1' },
    { id: 'west', label: 'The Arena - the west gate (Ghost)', at: [0, cy - 3, cx - A, cy + 3] },
    { id: 'east', label: 'The Arena - the east gate (the reds)', at: [cx + A, cy - 3, W - 1, cy + 3] },
    { id: 'sand', label: 'The Arena - the sand', at: [cx - A, cy - Bq, cx + A, cy + Bq] },
    { id: 'all', label: 'The Arena Vetera', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [],
  objectives: [],
};
