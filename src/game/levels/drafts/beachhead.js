// FRONTLINE - Level 18, the Beachhead (first draft): a battle map, from Rhys's sheet
// (maps/Frontline_Map_Beachhead_Prelim.xlsx, via tools/map_to_json.py -> src/game/levels/maps/beachhead.json).
// His Info tab: "Battle Map; 10 minute timer; 100 reserve units per team; ends at the timer or when one
// team has zero in reserve AND zero in the field; floors G, 1, 2; 8 m floor to floor; midday, sunny".
//
// How the sheet is read (a square is 2 m): the fast-flowing river down the middle, the sea along the
// south. West of the river the reds' sea wall - 8 m high, a wall-walk along its top (the parapet
// ladders), the gated barricade in the middle of it and the two destructible ones (reinforced: a charge
// opens them), the artillery bunker at its southern end with the gun on its roof (fixed, but it swivels:
// E fires it where you are looking). East of the river Ghost's line - two gated walls and the bastion
// between them, its gate facing the river. The only dry way over is the lower pier at the river's
// mouth; the upper pier over it (its ladder on Ghost's side) looks along the beach. Or swim it - the
// river carries you south, to the sea.
import MAP from '../maps/beachhead.json' with { type: 'json' };

const G0 = MAP.floors.G, F1 = MAP.floors['1'];
const W = G0[0].length, SEA = 8;                      // and more sea south of the sheet's, out to the fence
const H = G0.length + SEA;
const at = (rows, x, y) => (rows[y] && rows[y][x]) || '.';
// the sheet's labelled barricades: gates (doors) and destructible ones (reinforced)
const GATES = [[11, 21, 23], [52, 9, 11], [43, 22, 24], [52, 35, 37]];       // x, rows from-to
const BARRICADES = [[11, 14, 16], [11, 28, 30]];
const inRun = (list, x, y) => list.some(([gx, a, b]) => gx === x && y >= a && y <= b);
const PIER = { x0: 22, x1: 35, y0: 56, y1: 57 };      // the lower pier, over the river's mouth

const ground = [];
for (let y = 0; y < H; y++) {
  let r = '';
  for (let x = 0; x < W; x++) {
    const c = y < G0.length ? at(G0, x, y) : '~';
    if (inRun(GATES, x, y)) r += 'D';
    else if (inRun(BARRICADES, x, y)) r += 'R';
    else if (x >= PIER.x0 && x <= PIER.x1 && y >= PIER.y0 && y <= PIER.y1) r += '~';     // the river runs under the pier
    else if (c === 'W') r += '#';
    else if (c === 'C') r += y === 57 ? '.' : 'S';       // (the pier's cover: on one side only - the beach is two squares wide)
    else if (c === 'A') r += '.';
    else r += c;
  }
  ground.push(r);
}

const LADDERS = [
  { x: 10, y: 10, from: 'G', to: '1', back: [1, 0], off: [11, 10] },
  { x: 10, y: 34, from: 'G', to: '1', back: [1, 0], off: [11, 34] },
  { x: 0, y: 37, from: 'G', to: '1', back: [0, 1], off: [0, 38] },
  { x: 0, y: 41, from: 'G', to: '1', back: [0, 1], off: [0, 40] },
  { x: 37, y: 56, from: 'G', to: '1', back: [-1, 0], off: [36, 56] },
];

// a wall drawn corner to corner (the sheet's curves and slants) is filled in at each step, so it is a wall
// and not a row of posts
{
  const g = ground.map((r) => r.split('')), solid = (x, y) => '#DR'.includes((g[y] || [])[x] || '.');
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W; x++) for (const dx of [1, -1]) {
    if (!solid(x, y) || !solid(x + dx, y + 1) || solid(x + dx, y) || solid(x, y + 1)) continue;
    const free = (a, b) => g[b][a] === '.' && !LADDERS.some((l) => l.x === a && l.y === b);
    if (free(x, y + 1)) g[y + 1][x] = '#'; else if (free(x + dx, y)) g[y][x + dx] = '#';
  }
  ground.splice(0, ground.length, ...g.map((r) => r.join('')));
}

// The first floor (8 m): the top of the reds' wall - every wall square joined to the parapet ladders'
// (diagonal steps filled, so it can be walked) - the bunker's roof, and the upper pier.
const wallSq = (x, y) => '#DR'.includes(at(ground, x, y)) && x <= 12;
const top = new Set(), q = [[11, 10]];
while (q.length) {
  const [x, y] = q.pop(), k = x + ',' + y;
  if (top.has(k) || !wallSq(x, y)) continue;
  top.add(k);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) q.push([x + dx, y + dy]);
}
for (const k of [...top]) {
  const [x, y] = k.split(',').map(Number);
  for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) if (top.has((x + dx) + ',' + (y + dy)) && !top.has((x + dx) + ',' + y) && !top.has(x + ',' + (y + dy))) top.add((x + dx) + ',' + y);
}
for (let y = 38; y <= 42; y++) for (let x = 0; x <= 8; x++) top.add(x + ',' + y);          // the bunker's roof
const upperPier = (x, y) => x >= 25 && x <= 36 && y >= 56 && y <= 57;
const first = [];
for (let y = 0; y < H; y++) {
  let r = '';
  for (let x = 0; x < W; x++) r += upperPier(x, y) ? (at(F1, x, y) === 'C' && x < 36 && y === 56 ? 'S' : '.') : top.has(x + ',' + y) ? '.' : ' ';
  first.push(r);
}


export default {
  id: 'beachhead', no: 18, title: 'The Beachhead', place: 'the Beachhead', tidy: false, windows: false,      // (Rhys's sheet: tidied by its own reading)
  where: 'The Beachhead, on the Severian coast. 12:00, sunny - and a battle.',
  brief: [
    ['The battle', 'A battle, not a mission: <b>Ghost against the reds</b>, ten minutes on the clock and <b>a hundred men a side</b> in reserve. A few of each side are on the field at a time; every man who falls is replaced from the reserve - you as well, each time you go down. The side with more men left when the clock runs out wins; a side with nobody left in reserve or on the field has lost.'],
    ['The ground', 'The river runs down the middle - fast: swim it and it carries you south, to the sea. The only dry way over is the <b>lower pier</b> at its mouth. West of the river, the reds\' <b>sea wall</b>: 8 m high, a wall-walk along its top (the ladders behind it), a gate in the middle and two barricades a charge will open; at its southern end the <b>artillery bunker</b>, the gun on its roof. East, Ghost\'s line: two gated walls and the bastion between them. The <b>upper pier</b>, over the lower, is reached from Ghost\'s side.'],
    ['Your kit', 'A K7, a PX9, C5 charges (for the barricades) and grenades. The artillery gun swivels: stand at it and E fires a shell where you are looking.'],
    ['The aim', 'Push the reds back to their wall and through it, and keep more of Ghost on its feet than they do of theirs. Hold E at Ghost\'s end (where you start) to withdraw.'],
  ],
  time: { date: [21, 6, 2026], hour: 12, minute: 0 }, faction: 'red', cell: 2,
  startLoadout: { primary: 'K7', backup: 'PX9', utility1: 'C5', utility2: 'FRAG', gear: 'LENSES' },
  extractName: 'Ghost\'s end of the field', vehicle: false, navCap: 200000, pieceBudget: 12000,
  outside: { mat: 'desert', tint: [1.0, 0.95, 0.85], margin: 8, fenceMat: 'rock', fenceH: 4, backdrop: 'hills' },
  legend: {
    // sandbags: a low, broad wall of them
    S(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h + 0.1, cy, cz - h + 0.1], [cx + h - 0.1, cy + 1.05, cz + h - 0.1], 'tarp', { tint: [0.78, 0.7, 0.5] }); },
  },
  floors: {
    G: { y: 0, wallH: 8, wall: 'concrete2', wallTint: [0.85, 0.83, 0.78], floor: 'concrete', lamps: false, roof: false, channel: 2.6, surf: 0.45, flow: [0, 1], rows: ground },
    1: { y: 8, wallH: 2, wall: 'concrete2', floor: 'concrete', floorTint: [0.85, 0.83, 0.78], lamps: false, roof: false, rows: first },
  },
  ladders: LADDERS,
  currents: [{ at: [22, 0, 35, 57, 'G'], v: [0, 2.4] }],
  start: { x: 61, y: 23, floor: 'G', yaw: Math.PI / 2 },
  battle: {
    you: 'ghost', timer: 600,
    teams: {
      ghost: {
        name: 'Ghost', short: 'Ghost', faction: 'ally', reserve: 100, field: 10, yaw: Math.PI / 2, arms: ['carbine', 'smg', 'carbine', 'dmr', 'lmg'],
        spawns: [[60, 20, 'G'], [60, 26, 'G'], [62, 23, 'G']],
        lanes: [
          // out through the south gate, down to the beach and over the lower pier, to the reds' gate
          [[57, 30], [53, 36], [46, 42], [40, 52], [38, 57], [30, 57], [20, 56], [16, 44], [14, 25], [13, 22], [8, 22], [4, 23]],
          // through the bastion and its gate, along the riverbank, over the pier, at the southern barricade
          [[56, 23], [48, 23], [41, 23], [39, 40], [38, 57], [28, 57], [17, 52], [14, 36], [13, 29], [8, 30], [4, 26]],
          // out through the north gate, the long way down the bank; the bunker, then the wall
          [[57, 14], [53, 10], [46, 12], [40, 30], [39, 50], [38, 57], [24, 57], [12, 50], [10, 44], [9, 40], [4, 34], [4, 20]],
          // the upper pier: up the ladder and hold it
          [[56, 30], [53, 36], [46, 44], [39, 55], [33, 57, '1']],
        ],
      },
      red: {
        name: 'The reds', short: 'Reds', faction: 'red', reserve: 100, field: 10, yaw: -Math.PI / 2, arms: ['carbine', 'carbine', 'smg', 'dmr', 'lmg'],
        spawns: [[3, 20, 'G'], [3, 26, 'G'], [5, 23, 'G']],
        lanes: [
          // up onto the wall and hold it
          [[8, 18], [11, 16, '1']],
          [[8, 26], [11, 27, '1']],
          // the bunker's roof, by the gun
          [[4, 33], [4, 40, '1']],
          // out through the gate, down to the pier and over, at Ghost's bastion
          [[8, 22], [14, 22], [16, 40], [20, 55], [30, 57], [38, 56], [40, 40], [41, 23], [48, 23], [58, 23]],
          [[8, 22], [14, 22], [15, 48], [24, 57], [38, 57], [45, 44], [53, 36], [58, 28]],
        ],
      },
    },
  },
  extra(kit) {
    const { box, mid, CELL, level, floors } = kit;
    const y1 = floors['1'].y, inTop = (x, y) => (floors['1'].rows[y] || '')[x] && floors['1'].rows[y][x] !== ' ';
    const holes = new Set(LADDERS.map((l) => l.x + ',' + l.y));
    const arrive = new Set(LADDERS.map((l) => l.off[0] + ',' + l.off[1] + ':' + (-l.back[0]) + ',' + (-l.back[1])));
    // the parapets: waist-high, round every open edge up there (not where a ladder comes up)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!inTop(x, y) || holes.has(x + ',' + y)) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (inTop(nx, ny) || holes.has(nx + ',' + ny) || arrive.has(x + ',' + y + ':' + dx + ',' + dy)) continue;
        if (LADDERS.some((l) => l.off[0] === x && l.off[1] === y && l.x === nx && l.y === ny)) continue;
        const x0 = dx > 0 ? (x + 1) * CELL - 0.25 : dx < 0 ? x * CELL : x * CELL, x1 = dx > 0 ? (x + 1) * CELL : dx < 0 ? x * CELL + 0.25 : (x + 1) * CELL;
        const z0 = dy > 0 ? (y + 1) * CELL - 0.25 : dy < 0 ? y * CELL : y * CELL, z1 = dy > 0 ? (y + 1) * CELL : dy < 0 ? y * CELL + 0.25 : (y + 1) * CELL;
        box([x0, y1, z0], [x1, y1 + 1.05, z1], 'concrete2', { tint: [0.8, 0.78, 0.72] });
      }
    }
    // the lower pier: planks over the river's mouth, posts down into it
    box([PIER.x0 * CELL, -0.3, PIER.y0 * CELL], [(PIER.x1 + 1) * CELL, 0.02, (PIER.y1 + 1) * CELL], 'wood', { tint: [0.6, 0.5, 0.38] });
    for (const [sx, sy] of [[25, 56]]) box([mid(sx) - 0.9, 0, mid(sy) - 0.9], [mid(sx) + 0.9, 1.05, mid(sy) + 0.9], 'tarp', { tint: [0.78, 0.7, 0.5] });
    // the upper pier's posts, and the ladder's
    for (let x = 25; x <= 36; x += 3) for (const y of [56, 57]) { const cx = x * CELL + 0.3, cz = mid(y); box([cx - 0.2, -2.5, cz - 0.2], [cx + 0.2, y1 - 0.2, cz + 0.2], 'wood', { tint: [0.45, 0.36, 0.26] }); }
    box([37 * CELL - 0.3, 0, mid(56) - 0.6], [37 * CELL - 0.05, y1 - 0.2, mid(56) + 0.6], 'wood', { tint: [0.45, 0.36, 0.26] });
    // the artillery gun on the bunker's roof (it swivels; E fires it) - its mounting here, its barrel in the game
    box([mid(7) - 0.9, y1, mid(40) - 0.9], [mid(7) + 0.9, y1 + 0.8, mid(40) + 0.9], 'metal', { tint: [0.32, 0.34, 0.3] });
    level.cannons = [{ pos: [mid(7), y1 + 0.8, mid(40)], yaw: -Math.PI / 2, reload: 8 }];
    // the bunker: shells, crates
    for (const [x, y] of [[2, 39], [4, 39], [6, 41], [3, 41]]) box([mid(x) - 0.6, 0, mid(y) - 0.6], [mid(x) + 0.6, 1.1, mid(y) + 0.6], 'cargo');
  },
  zones: [
    { id: 'walk', label: 'The Beachhead - the wall-walk', at: [0, 4, 12, 37], floor: '1' },
    { id: 'roof', label: 'The Beachhead - the gun on the bunker\'s roof', at: [0, 38, 9, 42], floor: '1' },
    { id: 'upper', label: 'The Beachhead - the upper pier', at: [25, 56, 36, 57], floor: '1' },
    { id: 'wall', label: 'The Beachhead - the reds\' sea wall', at: [0, 4, 21, 37] },
    { id: 'bunker', label: 'The Beachhead - the artillery bunker', at: [0, 38, 9, 42] },
    { id: 'river', label: 'The Beachhead - the river', at: [22, 0, 35, 55] },
    { id: 'pier', label: 'The Beachhead - the lower pier', at: [22, 56, 35, 57] },
    { id: 'beachW', label: 'The Beachhead - the beach (west)', at: [0, 43, 21, 61] },
    { id: 'beachE', label: 'The Beachhead - the beach (east)', at: [36, 45, 63, 61] },
    { id: 'bastion', label: 'The Beachhead - Ghost\'s bastion', at: [43, 15, 55, 31] },
    { id: 'east', label: 'The Beachhead - Ghost\'s line', at: [36, 0, 63, 44] },
  ],
  guards: [],
  objectives: [],
};
