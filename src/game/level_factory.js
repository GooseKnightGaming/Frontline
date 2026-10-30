// FRONTLINE - Level 2, the Derelict Factory (M6.14.0, Rhys: "I'm getting bored
// of the Riverside Hotel... let's build up some of the other maps").
//
// Built from Rhys's map (maps/Frontline_Battle_Map_Factory.xlsx, via
// tools/map_to_json.py): two floors, 60 x 60 squares, four-way symmetrical -
// corner rooms, a ring of corridors, a reinforced core in the middle with its
// ladders. Drawn as a battle map (two sides, reserves, a timer - the battle mode
// is still to come); for now it is a mission: the yellows have been bunkered
// down in here for a while, and it is up to Ghost to flush them out.
// One square = 1.5 m (the roadmap's note: at 1 m the corridors would be too
// cramped for a firefight), so the building is 90 m across. Midday, sunny:
// skylights in the roof, a lamp in every room. Floors are joined only by
// ladders (the map's A): a hole in the floor above, the ladder on the wall
// beside it, a rail round the rest.

import { World } from '../sim/world.js';
import { SwingDoor, hangDoors } from '../sim/doors.js';
import { Guard, GUARD } from '../sim/guard.js';
import { drawLadder } from './ladders.js';
import { cellAt, insideMask, rooms, doorways, railing } from './level_hotel.js';
import MAP from './maps/factory.json' with { type: 'json' };

export const FS = 1.5;                         // metres a square
export const F_STOREY = 3.6, F_WALL_H = 3.3;
export const F_FLOORS = { G: 0, 1: 3.6 };
const T = 0.25;                                // wall thickness: brick
const WALLISH = new Set(['W', 'G', 'D', 'L', 'R']);
const DOORISH = new Set(['D', 'L', 'R']);
export const FACTORY_TIME = { date: [14, 7, 2026], hour: 12, minute: 40 };

// the map's rows, with the spawn marks (E) read as open floor
export function factoryRows(key) { return MAP.floors[key].map((r) => r.replace(/E/g, '.')); }

// Where the map says each side may start: [{ side: 'ghost' | 'yellow', floor, x, y }]
export function spawnPoints() {
  return MAP.labels.filter(([t]) => /Valid Spawn Point/i.test(t)).map(([t, floor, x, y]) => ({ side: /Ghost/i.test(t) ? 'ghost' : 'yellow', floor, x, y }));
}

// The ladders: every A on the ground floor, with the wall it stands against
// (its back), the way the climber faces from it, and the square on the first
// floor you step off onto at the top (beside the hole, along the wall).
export function factoryLadders() {
  const g = factoryRows('G'), f1 = factoryRows('1'), out = [];
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[y].length; x++) {
    if (cellAt(g, x, y) !== 'A') continue;
    // the wall behind it: a neighbour that is wall on both floors
    const backs = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => WALLISH.has(cellAt(g, x + dx, y + dy)) && WALLISH.has(cellAt(f1, x + dx, y + dy)));
    if (!backs.length) continue;
    const [bx, by] = backs[0];
    // step off at the top: a side square (along the wall) open on the first floor;
    // failing that, the square in front
    const sides = (bx ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]]).concat([[-bx, -by]]);
    const off = sides.find(([dx, dy]) => cellAt(f1, x + dx, y + dy) === '.');
    out.push({ x, y, back: [bx, by], face: [-bx, -by], off: off ? [x + off[0], y + off[1]] : null });
  }
  return out;
}

export function buildFactory() {
  const world = new World();
  const pieces = [], signs = [], lamps = [], water = [], lights = [], crates = [], props = [], vehicles = [];
  const level = { world, pieces, signs, lamps, water, lights, crates, props, vehicles, securityTurrets: [], surfaces: [],
    swingDoors: [], guards: [], zones: {}, factory: true, rules: 'factory',
    missionTime: FACTORY_TIME, startGear: 'LENSES',
    bake: true, bakeRegion: [-2, -2, 92, 92] };
  const box = (min, max, mat, opts) => {
    opts = opts || {};
    const p = { min, max, mat, uv: opts.uv || 'world', tag: opts.tag };
    if (opts.render !== false) pieces.push(p);
    if (opts.solid !== false) world.addSolid(min, max, opts.tag || mat, { noClimb: opts.noClimb, glass: opts.glass, shootThrough: opts.shootThrough });
    return p;
  };
  const mid = (i) => (i + 0.5) * FS;
  const W = 60 * FS, D = 60 * FS;

  // ── outside: a yard of broken concrete, a fence round it ──
  box([-30, -1, -30], [W + 30, 0, D + 30], 'concrete');
  for (const [a, b] of [[[-29, -29], [W + 29, -29]], [[-29, D + 29], [W + 29, D + 29]], [[-29, -29], [-29, D + 29]], [[W + 29, -29], [W + 29, D + 29]]]) {
    box([Math.min(a[0], b[0]) - 0.05, 0, Math.min(a[1], b[1]) - 0.05], [Math.max(a[0], b[0]) + 0.05, 2.4, Math.max(a[1], b[1]) + 0.05], 'fence', { noClimb: true });
  }

  const ladders = factoryLadders();
  const holeCells = new Set(ladders.map((l) => l.x + ',' + l.y));
  level.navFloors = [];
  level.navLinks = [];
  const floorInfo = {};

  for (const key of ['G', '1']) {
    const rows = factoryRows(key), y0 = F_FLOORS[key];
    const c = (x, y) => cellAt(rows, x, y);
    // walls: a post in each wall square, half a wall out to each wall neighbour
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
      const code = c(x, y);
      if (!WALLISH.has(code) || DOORISH.has(code)) continue;
      const cx = mid(x), cz = mid(y), mat = 'brick';
      box([cx - T / 2, y0, cz - T / 2], [cx + T / 2, y0 + F_WALL_H, cz + T / 2], mat);
      if (WALLISH.has(c(x + 1, y))) box([cx + T / 2, y0, cz - T / 2], [cx + FS / 2, y0 + F_WALL_H, cz + T / 2], mat);
      if (WALLISH.has(c(x - 1, y))) box([cx - FS / 2, y0, cz - T / 2], [cx - T / 2, y0 + F_WALL_H, cz + T / 2], mat);
      if (WALLISH.has(c(x, y + 1))) box([cx - T / 2, y0, cz + T / 2], [cx + T / 2, y0 + F_WALL_H, cz + FS / 2], mat);
      if (WALLISH.has(c(x, y - 1))) box([cx - T / 2, y0, cz - FS / 2], [cx + T / 2, y0 + F_WALL_H, cz - T / 2], mat);
    }
    // doors: one leaf a square, a double door a pair; the core's are reinforced and locked
    for (const d of doorways(rows)) {
      const a0 = (d.axis === 'x' ? d.cells[0][0] : d.cells[0][1]) * FS, a1 = a0 + d.cells.length * FS;
      const at = d.axis === 'x' ? mid(d.cells[0][1]) : mid(d.cells[0][0]);
      if (d.axis === 'x') box([a0, y0 + 2.2, at - T / 2], [a1, y0 + F_WALL_H, at + T / 2], 'brick');
      else box([at - T / 2, y0 + 2.2, a0], [at + T / 2, y0 + F_WALL_H, a1], 'brick');
      const opts = d.code === 'R' ? { build: 'reinforced', locked: true, mat: 'armour', thick: 0.08, label: 'reinforced door' }
        : d.code === 'L' ? { build: 'sturdy', locked: true, mat: 'metal', label: 'locked door' }
        : { mat: 'metal', build: 'sturdy', label: 'steel door' };
      const leaf = (b0, b1, pair, seal) => level.swingDoors.push(new SwingDoor(world, Object.assign({
        plane: d.axis === 'x' ? 'z' : 'x', at, wall: [at - T / 2, at + T / 2], from: b0, to: b1, y0, h: 2.15, pair, seal,
      }, opts)));
      const pair = d.cells.length === 2 ? key + ':' + d.cells[0].join(',') : undefined;
      if (d.cells.length === 1) leaf(a0 + 0.02, a1 - 0.02, undefined, [0.02, 0.02, 0.05]);
      else { leaf(a0 + 0.02, (a0 + a1) / 2 - 0.01, pair, [0.02, 0.01, 0.05, 1]); leaf(a1 - 0.02, (a0 + a1) / 2 + 0.01, pair, [0.02, 0.01, 0.05]); }
    }
    // the floor: the ground's concrete; upstairs, a slab over the whole
    // building (holed where the ladders come up) that is the ground floor's ceiling
    const inside = insideMask(rows);
    if (key === '1') {
      for (let y = 0; y < 60; y++) {
        let x = 0;
        while (x < 60) {
          if (holeCells.has(x + ',' + y)) { x++; continue; }
          let e = x; while (e + 1 < 60 && !holeCells.has((e + 1) + ',' + y)) e++;
          box([x * FS, y0 - (F_STOREY - F_WALL_H), y * FS], [(e + 1) * FS, y0, (y + 1) * FS], 'concrete2');
          x = e + 1;
        }
      }
    }
    // cover: crates and the odd machine, chest high; barrels here and there
    let n = 0;
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
      if (c(x, y) !== 'C') continue;
      n++;
      const cx = mid(x), cz = mid(y), kind = (x * 7 + y * 13) % 5;
      if (kind === 0) box([cx - 0.65, y0, cz - 0.65], [cx + 0.65, y0 + 1.6, cz + 0.65], 'metal');           // a machine
      else if (kind === 1) { box([cx - 0.3, y0, cz - 0.3], [cx + 0.3, y0 + 0.95, cz + 0.3], 'barrel'); box([cx + 0.05, y0, cz - 0.6], [cx + 0.65, y0 + 0.95, cz], 'barrel'); }
      else box([cx - 0.6, y0, cz - 0.6], [cx + 0.6, y0 + 1.15, cz + 0.6], 'crate');
    }
    // rooms: a lamp in each (a big one, a few), and its name as a zone
    const roomList = rooms(rows, inside);
    for (const cells of roomList) {
      const xs = cells.map((p) => p[0]), ys = cells.map((p) => p[1]);
      const [x0, x1, yy0, yy1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      const spots = [];
      const nx = Math.max(1, Math.round((x1 - x0 + 1) / 13)), ny = Math.max(1, Math.round((yy1 - yy0 + 1) / 13));
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
        const tx = x0 + (i + 0.5) * (x1 - x0 + 1) / nx - 0.5, ty = yy0 + (j + 0.5) * (yy1 - yy0 + 1) / ny - 0.5;
        const best = cells.reduce((b, p) => (Math.hypot(p[0] - tx, p[1] - ty) < Math.hypot(b[0] - tx, b[1] - ty) ? p : b));
        if (!spots.some((s) => s[0] === best[0] && s[1] === best[1])) spots.push(best);
      }
      for (const [lx, ly] of spots) {
        const yc = y0 + F_WALL_H;
        lights.push({ pos: [mid(lx), yc - 0.4, mid(ly)], range: 13, intensity: 0.95, color: [1, 0.93, 0.8] });
        box([mid(lx) - 0.7, yc - 0.12, mid(ly) - 0.15], [mid(lx) + 0.7, yc, mid(ly) + 0.15], 'lamp', { solid: false });
      }
    }
    level.navFloors.push({ y: y0, bounds: [0, 0, W, D] });
    floorInfo[key] = { rows, inside, rooms: roomList, cover: n };
  }

  // the roof over it all, with long skylights letting the midday sun in
  const yR = F_FLOORS[1] + F_WALL_H;
  for (let z = 0; z < D; z += 6) {
    const lit = Math.floor(z / 6) % 3 === 1;
    if (lit) {
      for (let x = 0; x < W; x += 15) {
        box([x, yR, z], [x + 4, F_FLOORS[1] + F_STOREY, z + 6], 'concrete2');
        box([x + 4, yR + 0.2, z + 1], [x + 15, yR + 0.25, z + 5], 'glass', { glass: true });
        box([x + 4, yR, z], [x + 15, F_FLOORS[1] + F_STOREY, z + 1], 'concrete2');
        box([x + 4, yR, z + 5], [x + 15, F_FLOORS[1] + F_STOREY, z + 6], 'concrete2');
      }
    } else box([0, yR, z], [W, F_FLOORS[1] + F_STOREY, Math.min(D, z + 6)], 'concrete2');
  }

  // ── the ladders: on the wall beside the hole, a rail round the rest ──
  const f1rows = floorInfo['1'].rows;
  for (const l of ladders) {
    const cx = mid(l.x), cz = mid(l.y);
    // the wall's face, where the ladder's back sits
    const wx = cx + l.back[0] * (FS / 2 - T / 2), wz = cz + l.back[1] * (FS / 2 - T / 2);
    drawLadder(box, wx, wz, l.face, 0, F_FLOORS[1] + 0.9, 'iron');
    const vol = l.face[0]
      ? [[l.face[0] > 0 ? wx : wx - 0.8, 0, wz - 0.5], [l.face[0] > 0 ? wx + 0.8 : wx, F_FLOORS[1] + 0.3, wz + 0.5]]
      : [[wx - 0.5, 0, l.face[1] > 0 ? wz : wz - 0.8], [wx + 0.5, F_FLOORS[1] + 0.3, l.face[1] > 0 ? wz + 0.8 : wz]];
    world.addLadder(vol[0], vol[1], l.face);
    // round the hole upstairs: a rail on every open side but the one you step off by
    const x0 = l.x * FS, x1 = x0 + FS, z0 = l.y * FS, z1 = z0 + FS, y1 = F_FLOORS[1];
    const sidesOf = [[[x0, z0], [x1, z0], 0, -1], [[x0, z1], [x1, z1], 0, 1], [[x0, z0], [x0, z1], -1, 0], [[x1, z0], [x1, z1], 1, 0]];
    for (const [a, b, dx, dy] of sidesOf) {
      const nb = cellAt(f1rows, l.x + dx, l.y + dy);
      if (WALLISH.has(nb)) continue;
      if (l.off && l.off[0] === l.x + dx && l.off[1] === l.y + dy) continue;
      railing(box, a, b, y1, y1);
    }
    // for guards (and anyone following you): up the ladder and off at the top
    if (l.off) level.navLinks.push({ a: [(vol[0][0] + vol[1][0]) / 2, 0, (vol[0][2] + vol[1][2]) / 2], b: [mid(l.off[0]), F_FLOORS[1], mid(l.off[1])], ladder: true });
  }
  level.ladders = ladders;

  // ── where you start, and where you leave: Ghost's corner (the map's spawn) ──
  const spawns = spawnPoints();
  const start = spawns.find((s) => s.side === 'ghost' && s.floor === 'G');
  const sp = [mid(start.x), 0, mid(start.y)];
  world.spawn = { pos: sp, yaw: -Math.PI * 0.75 };              // looking into the building (south-east)
  level.apcZone = { x0: sp[0] - 2.4, x1: sp[0] + 2.4, z0: sp[2] - 2.4, z1: sp[2] + 2.4, pos: sp.slice() };
  level.extraction = { pos: sp.slice(), radius: 2.4 };
  level.settledHint = 'The last of the yellows is down. Back to your way in (the north-west corner) to extract.';
  box([sp[0] - 0.5, 0.01, sp[2] - 0.5], [sp[0] + 0.5, 0.02, sp[2] + 0.5], 'hazard', { solid: false });   // the way in, marked on the floor
  world.addZone([sp[0] - 3, 0, sp[2] - 3], [sp[0] + 3, 3, sp[2] + 3], 'way_in', 'Derelict Factory - Ghost’s way in');

  factoryYellows(level, floorInfo, spawns);
  hangDoors(world, level.swingDoors);
  level.floorInfo = floorInfo;
  return level;
}

// ── the yellows (Rhys's Info tab: 11 of them) ──────────────────────────────
// Two at each of their own corners (one a floor), two in the core and one on
// its upper floor, two patrolling the ground floor's ring of corridors, and two
// upstairs walking theirs. Their uniform is the field kit tinted yellow.
export const YELLOW_COUNT = 11;
export function yellowDefs(spawns) {
  const m = (i) => (i + 0.5) * FS;
  const ys = spawns.filter((s) => s.side === 'yellow');
  const defs = [];
  let n = 0;
  const id = () => 'Y' + (++n);
  for (const s of ys) defs.push({ id: id(), pos: [m(s.x), F_FLOORS[s.floor], m(s.y)], rank: s.floor === 'G' ? 'sergeant' : 'guard', arms: 'carbine', temper: 'steady' });
  // the core: behind its reinforced doors, a ladder each side of it
  defs.push({ id: id(), pos: [m(29), 0, m(28)], rank: 'officer', arms: 'pistol', temper: 'steady' });
  defs.push({ id: id(), pos: [m(31), 0, m(32)], rank: 'guard', arms: 'shotgun', temper: 'bold' });
  defs.push({ id: id(), pos: [m(30), F_FLOORS[1], m(30)], rank: 'specialist', arms: 'marksman', temper: 'steady' });
  // the ring of corridors, round the middle: one each way on the ground floor
  const ring = [[12.5, 7.5], [46.5, 7.5], [46.5, 51.5], [12.5, 51.5]].map(([x, y]) => [m(x), m(y)]);      // the corridors' middles (two squares wide)
  defs.push({ id: id(), pos: [ring[0][0], 0, ring[0][1]], route: ring, rank: 'guard', arms: 'carbine', temper: 'bold' });
  const back = ring.slice(2).concat(ring.slice(0, 2));
  defs.push({ id: id(), pos: [back[0][0], 0, back[0][1]], route: back.slice().reverse(), rank: 'guard', arms: 'carbine', temper: 'bold' });
  // upstairs: the same ring, two of them
  defs.push({ id: id(), pos: [ring[1][0], F_FLOORS[1], ring[1][1]], route: ring.slice(1).concat(ring.slice(0, 1)), rank: 'guard', arms: 'carbine', temper: 'bold' });
  defs.push({ id: id(), pos: [ring[3][0], F_FLOORS[1], ring[3][1]], route: ring.slice(3).concat(ring.slice(0, 3)), rank: 'sergeant', arms: 'shotgun', temper: 'steady' });
  return defs;
}

function factoryYellows(level, floorInfo, spawns) {
  const world = level.world;
  const fits = (p) => !world.hit([p[0] - GUARD.radius, p[1] + 0.05, p[2] - GUARD.radius], [p[0] + GUARD.radius, p[1] + GUARD.height, p[2] + GUARD.radius]);
  const free = (p) => {
    if (fits(p)) return p;
    for (let r = 0.25; r <= 2; r += 0.25) for (let a = 0; a < 16; a++) {
      const q = [p[0] + Math.cos(a / 16 * Math.PI * 2) * r, p[1], p[2] + Math.sin(a / 16 * Math.PI * 2) * r];
      if (fits(q)) return q;
    }
    return p;
  };
  const clear = (p, yaw) => { const e = [p[0], p[1] + GUARD.eye, p[2]], d = [-Math.sin(yaw), 0, -Math.cos(yaw)]; const h = world.raycast(e, d, 30, (q) => q.glass); return h ? h.t : 30; };
  for (const d of yellowDefs(spawns)) {
    const pos = free(d.pos.slice());
    let yaw = 0;
    if (d.route && d.route.length > 1) yaw = Math.atan2(-(d.route[1][0] - pos[0]), -(d.route[1][1] - pos[2]));
    else { let bd = -1; for (let i = 0; i < 8; i++) { const y = i * Math.PI / 4, c = clear(pos, y); if (c > bd) { bd = c; yaw = y; } } }
    const g = new Guard(world, { id: d.id, pos, yaw, route: d.route, faction: 'yellow', rank: d.rank, arms: d.arms, temper: d.temper });
    g.floorKey = pos[1] > 1 ? '1' : 'G';
    level.guards.push(g);
  }
}
