// FRONTLINE - Level 1: the Riverside Hotel, built from Rhys's map
// (maps/Frontline_Map_Riverside_Hotel.xlsx -> tools/map_to_json.py ->
// src/game/maps/riverside.json). Built a floor at a time (M6.9.0: the
// ground floor), the new systems added step by step.
//
// Scale: one square of the map is 1.5 m (Rhys's corridors were one square
// wide; at 1.5 m two people pass and the camera fits). Walls are drawn thin,
// along the middle of their squares, joining their neighbours - so a row of
// W squares is one wall, and a room of 4 squares across is 6 m, wall to wall.
// North is up the sheet (-z); the river is to the south.

import { World } from '../sim/world.js';
import { SwingDoor, hangDoors } from '../sim/doors.js';
import { drawLadder } from './ladders.js';
import { Lift, LIFT } from '../sim/lift.js';
import { Safe } from '../sim/safe.js';
import { Guard, GUARD } from '../sim/guard.js';
import { Crate } from '../sim/loadout.js';
import { hotelGuards } from '../sim/hotel_guards.js';
import { Hostage, hostagePlaces } from '../sim/hostage.js';
import MAP from './maps/riverside.json' with { type: 'json' };
import { VEHICLE_SIZE } from './vehicle_models.js';
import { HOTEL_INTEL } from './hotel_intel.js';

export const S = 1.5;                        // metres a square
export const STOREY = 3.6, WALL_H = 3.3;
export const FLOORS = { B: -3.6, G: 0, 1: 3.6, 2: 7.2, 3: 10.8, R: 14.4 };
// the stairwell: its north-west square on the map, the same on every floor
export const STAIR = { x0: 8, y0: 31 };
const T = 0.2;                               // wall thickness
// the lift: its square on the map (the SE corner of the lobby), the floors it
// serves, and the floors built so far (the lift only stops at those)
export const LIFT_CELL = { x: 21, y: 35 };
// when the mission happens (M6.9.16, Rhys: each mission its own date and
// rough time; the hotel late in the evening). The clock starts here as you
// begin and runs while you play.
export const MISSION_TIME = { date: [9, 7, 2026], hour: 22, minute: 47 };
export const ROOM_LIGHT_NIGHT = { intensity: 2.2, range: 12.5 };
export const ROOF_HATCH = { x: 15, y: 38 };              // the hatch over the third floor's back room (M6.9.21)
export const SAFE_CODE = [1, 9, 6, 2];               // the Estate Room safe (M6.9.15: one code for this level)
export const CLUE_CAMERAS = [2, 4, 6, 8];            // the cameras that give it away, in order
export const BARRICADE_H = 1.35;                     // chest high: shoot over it, not climb it (M6.9.12)
export const LIFT_FLOORS = ['G', '1', '2'];
export const BUILT = ['B', 'G', '1', '2', '3'];
const FLOOR_NAMES = { B: 'Basement', G: 'Ground floor', 1: 'First floor', 2: 'Second floor', 3: 'Third floor', R: 'Roof' };

// what the codes are, for building
const WALLISH = new Set(['W', 'G', 'D', 'L', 'R', 'E']);
const DOORISH = new Set(['D', 'L', 'R', 'E']);
const COVER = new Set(['C']);

export function cellAt(rows, x, y) { return (rows[y] && rows[y][x]) || '.'; }

// Which squares are inside the building: everything the outside cannot
// reach without crossing a wall, glass or a door. (Pure: tested.)
export function insideMask(rows) {
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  const out = new Set(), q = [];
  const key = (x, y) => x + ',' + y;
  for (let x = -1; x <= w; x++) { q.push([x, -1]); q.push([x, h]); }
  for (let y = -1; y <= h; y++) { q.push([-1, y]); q.push([w, y]); }
  while (q.length) {
    const [x, y] = q.pop();
    if (x < -1 || y < -1 || x > w || y > h || out.has(key(x, y))) continue;
    if (WALLISH.has(cellAt(rows, x, y))) continue;
    out.add(key(x, y));
    q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  const inside = new Set();
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!out.has(key(x, y)) && !WALLISH.has(cellAt(rows, x, y))) inside.add(key(x, y));
  return inside;
}

// Rooms: inside squares joined without crossing walls or doors. (Pure.)
export function rooms(rows, inside) {
  const seen = new Set(), list = [];
  for (const k of inside) {
    if (seen.has(k)) continue;
    const cells = [], q = [k];
    while (q.length) {
      const c = q.pop();
      if (seen.has(c) || !inside.has(c)) continue;
      seen.add(c); cells.push(c);
      const [x, y] = c.split(',').map(Number);
      q.push((x + 1) + ',' + y, (x - 1) + ',' + y, x + ',' + (y + 1), x + ',' + (y - 1));
    }
    list.push(cells.map((c) => c.split(',').map(Number)));
  }
  return list;
}

// Doorways: runs of door squares along a wall. (Pure.) Each is
// { code, axis: 'x' (the wall runs east-west) or 'z', cells: [[x, y]...] }.
export function doorways(rows) {
  const used = new Set(), list = [];
  const h = rows.length;
  for (let y = 0; y < h; y++) for (let x = 0; x < rows[y].length; x++) {
    const c = cellAt(rows, x, y);
    if (!DOORISH.has(c) || used.has(x + ',' + y)) continue;
    const ew = WALLISH.has(cellAt(rows, x - 1, y)) || WALLISH.has(cellAt(rows, x + 1, y));
    const run = [];
    let cx = x, cy = y;
    while (cellAt(rows, cx, cy) === c && run.length < 2) {   // at most a double door
      run.push([cx, cy]); used.add(cx + ',' + cy);
      if (ew) cx++; else cy++;
    }
    list.push({ code: c, axis: ew ? 'x' : 'z', cells: run });
  }
  return list;
}

export function buildHotel() {
  const world = new World();
  const pieces = [], signs = [], lamps = [], water = [], lights = [], crates = [], props = [], vehicles = [];
  SURFACES = [];
  const level = { world, pieces, signs, lamps, water, lights, crates, props, vehicles, securityTurrets: [], surfaces: SURFACES,
    swingDoors: [], guards: [], zones: {}, hotel: true,
    night: true,                         // 22:47 (M6.9.17): a night sky, the moon, lamps and lit windows
    powerOut: true,                      // (M6.9.19, Rhys) the hotel's power is cut: no lights inside - night vision
    startGear: 'NVG',                    // (M6.9.24, Rhys) so you go in wearing night vision goggles, not polarised lenses
    // baked round the building; the road, the embankment and the river keep live sun
    bake: true, bakeRegion: [-3, -3, 38, 68] };

  const box = (min, max, mat, opts) => {
    opts = opts || {};
    const p = { min, max, mat, uv: opts.uv || 'world', tag: opts.tag, slope: opts.slope };
    if (opts.render !== false) pieces.push(p);
    if (opts.solid !== false) world.addSolid(min, max, opts.tag || mat, { noClimb: opts.noClimb, glass: opts.glass, shootThrough: opts.shootThrough });
    return p;
  };

  // ── outside: the road to the north, the hotel, the river to the south ──
  const RIVER_Z = 44 * S;
  // the ground: one slab, holed where the manhole and the cellar stairs go
  // through it (M6.9.25); its underside is the sewer's ceiling
  for (const q of slabPieces(-60, -40, 120, RIVER_Z, slabHoles())) box([q.x0, -1, q.z0], [q.x1, 0, q.z1], 'concrete');
  for (const q of slabPieces(-60, 0, 120, 4 * S, slabHoles())) box([q.x0, 0, q.z0], [q.x1, 0.01, q.z1], 'asphalt', { solid: false });   // the main road
  box([-60, -5.5, RIVER_Z], [120, -4.5, RIVER_Z + 20], 'rock');               // the river bed
  box([-60, -4.5, RIVER_Z - 0.5], [120, 0, RIVER_Z], 'concrete');            // the embankment wall
  box([-60, -1, RIVER_Z + 18], [120, 0, RIVER_Z + 60], 'concrete');          // the far bank
  box([-60, -4.5, RIVER_Z + 17.5], [120, 0, RIVER_Z + 18], 'concrete');
  water.push({ x0: -60, x1: 120, z0: RIVER_Z, z1: RIVER_Z + 18, y: -1.0 });
  world.addWater([-60, -4.5, RIVER_Z], [120, -1.0, RIVER_Z + 18]);
  buildCity(level, box);

  // the stairwell (M6.9.4): a dog-leg in the lobby's west end, squares
  // x 8-9, rows 31-35 on every floor; the floor above is open over rows 31-34
  const well = new Set();
  for (let x = STAIR.x0 - 1; x <= STAIR.x0 + 1; x++) for (let y = STAIR.y0 - 1; y < STAIR.y0 + 4; y++) well.add(x + ',' + y);
  // the lift (M6.9.8): its shaft at (21, 35), through every floor it serves
  // that is built so far (the map says G, 1 and 2)
  const liftFloors = LIFT_FLOORS.filter((k) => BUILT.includes(k));
  const liftCell = LIFT_CELL.x + ',' + LIFT_CELL.y;
  const holes = (k, set) => {
    const ceil = new Set(set.ceil || []), floor = new Set(set.floor || []);
    const i = liftFloors.indexOf(k);
    if (i >= 0) floor.add(liftCell);                                      // no carpet in the shaft
    if (i >= 0 && i < liftFloors.length - 1) ceil.add(liftCell);           // open up to the next floor it serves
    return { ceilHoles: ceil, floorHoles: floor };
  };
  // the Estate Room safe's combination (M6.9.13): new every time; hidden in
  // the cameras (below)
  level.safeCode = SAFE_CODE.slice();
  level.missionTime = MISSION_TIME;
  // the second floor (M6.9.11): its balcony, row 7 in front of the Balcony
  // Suite, is open to the sky behind a glass balustrade
  const balcony = [];
  for (let x = 9; x <= 20; x++) balcony.push([x, 7]);
  const g = buildFloor(level, box, 'G', FLOORS.G, holes('G', { ceil: well, floor: CELLAR_STAIR_CELLS }));
  const f1 = buildFloor(level, box, '1', FLOORS[1], holes('1', { ceil: well, floor: well }));
  // the stairs from the Balcony Suite up to the floor above (M6.9.20): one
  // straight flight along row 11, from the map's "S" at its west end
  const suiteStair = [9, 10, 11, 12].map((x) => x + ',11');
  const f2 = buildFloor(level, box, '2', FLOORS[2], Object.assign(holes('2', { floor: well, ceil: suiteStair }), { balcony }));
  // the third floor (M6.9.20): the Upper Balcony Suite, the whole floor; its
  // own balcony (row 9); the way up to the roof behind a door at the back (the
  // ladder comes with the roof, its square stands as wall for now)
  const balcony3 = [];
  for (let x = 9; x <= 20; x++) balcony3.push([x, 9]);
  const rows3 = MAP.floors['3'].map((r) => r.replace(/A/g, 'W'));
  const f3 = buildFloor(level, box, '3', FLOORS[3], { floorHoles: new Set(suiteStair), ceilHoles: new Set([ROOF_HATCH.x + ',' + ROOF_HATCH.y]), balcony: balcony3, rows: rows3 });
  buildStairs(level, box, FLOORS.G, false);
  buildStairs(level, box, FLOORS[1], true);
  suiteStairs(level, box);
  buildLift(level, box, liftFloors);
  secondFloorThings(level, box, f2);
  penthouse(level, box, f3);
  buildRoof(level, box);
  buildRoofWalk(level, box);
  buildGarden(level, box);
  buildBasement(level, box);
  // every floor's cameras, watched from the ground floor's console
  // (M6.9.11: and from the second floor's, in the lift's control room)
  const floorsCctv = [g, f1, f2, f3].map((f) => f.cctv).filter(Boolean);
  const consoles = floorsCctv.map((c) => c.console).filter(Boolean);
  level.cctv = consoles.length ? { cameras: [].concat(...floorsCctv.map((c) => c.cameras)).sort((a, b) => a.n - b.n), console: consoles[0], consoles } : null;
  // the combination, for a trained eye (M6.9.14, Rhys: deduced from the
  // cameras, not a note left out): four of the cameras glitch now and then,
  // and in the glitch their clock's seconds show one number of it - read in
  // the cameras' own order, lowest first
  level.notes = [];
  const cams = level.cctv ? level.cctv.cameras : [];
  if (cams.length >= 4) {
    // (M6.9.15, Rhys: one combination for this level, 1962; the same
    // cameras every time - 2, 4, 6 and 8)
    CLUE_CAMERAS.forEach((n, k) => { const c = cams.find((q) => q.n === n); if (c) c.clue = level.safeCode[k]; });
  }

  // start by the Ghost jeep, across the road from the front doors
  world.spawn = { pos: [5 * S, 0, 3 * S], yaw: Math.PI };           // facing south, at the hotel
  hotelReds(level);
  hotelSupplies(level, box);
  streetVehicles(level, box);
  hotelHostages(level);
  // (M6.13.6) any door the map did not hang (the cellar's) hung by the same rule as Meridian House's
  hangDoors(world, level.swingDoors);
  return level;
}

// One floor from the map: walls, glass, doors, furniture, the ceiling over
// it, and a light or two in every room.
export function buildFloor(level, box, key, y0, opts) {
  opts = opts || {};
  const ceilHoles = new Set(opts.ceilHoles || []), floorHoles = new Set(opts.floorHoles || []);
  const rows = opts.rows || MAP.floors[key];
  const world = level.world;
  const c = (x, y) => cellAt(rows, x, y);
  const mid = (i) => (i + 0.5) * S;
  const labelsHere = MAP.labels.filter(([t, fl]) => fl === key);
  // a balcony (M6.9.11): open to the sky, decked, behind a glass balustrade -
  // the glass squares round it that are not also windows of a room
  const balc = new Set((opts.balcony || []).map((q) => q.join(',')));
  const railCells = new Set();
  if (balc.size) {
    const insideAll = insideMask(rows);
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
      if (c(x, y) !== 'G') continue;
      const n4 = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => (x + dx) + ',' + (y + dy));
      const n8 = n4.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([dx, dy]) => (x + dx) + ',' + (y + dy)));
      if (n8.some((k) => balc.has(k)) && !n4.some((k) => insideAll.has(k) && !balc.has(k))) railCells.add(x + ',' + y);
    }
    for (const k of balc) { ceilHoles.add(k); floorHoles.add(k); }
    for (const k of railCells) ceilHoles.add(k);
  }
  // holes blown through walls (M6.9.11, "hole blown through wall" on the map):
  // the map leaves the square open; they join no room, and nothing stands in them
  const holeCells = [];
  for (const [t, , lx, ly] of labelsHere) {
    if (!/hole blown/i.test(t)) continue;
    let best = null;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = lx + dx, y = ly + dy;
      if (c(x, y) !== '.') continue;
      const ew = WALLISH.has(c(x - 1, y)) && WALLISH.has(c(x + 1, y)), ns = WALLISH.has(c(x, y - 1)) && WALLISH.has(c(x, y + 1));
      if ((ew || ns) && (!best || Math.abs(dx) + Math.abs(dy) < best.d)) best = { x, y, axis: ew ? 'x' : 'z', d: Math.abs(dx) + Math.abs(dy) };
    }
    if (best) holeCells.push(best);
  }

  // walls and glass: a post in the middle of each square, and half a wall
  // out to each neighbour that is wall, glass or a door
  let wallTop = WALL_H;                                        // up to the floor above where no ceiling covers it (the stairwell)
  const drawWall = (x0, z0, x1, z1, code) => {
    if (code === 'R') {
      // a balcony's balustrade: glass to waist height, a steel rail on top
      const thin = (a0, a1) => (a1 - a0 > T ? [a0, a1] : [(a0 + a1) / 2 - 0.03, (a0 + a1) / 2 + 0.03]);
      const [gx0, gx1] = thin(x0, x1), [gz0, gz1] = thin(z0, z1);
      box([gx0, y0, gz0], [gx1, y0 + 1.05, gz1], 'glass', { glass: true, noClimb: true });
      box([gx0 - 0.02, y0 + 1.05, gz0 - 0.02], [gx1 + 0.02, y0 + 1.1, gz1 + 0.02], 'metal', { noClimb: true });
    } else if (code === 'G') {
      box([x0, y0, z0], [x1, y0 + 0.9, z1], 'plaster');
      box([x0, y0 + 2.4, z0], [x1, y0 + WALL_H, z1], 'plaster');
      box([x0 + (x1 - x0 > T ? 0 : 0.06), y0 + 0.9, z0 + (z1 - z0 > T ? 0 : 0.06)], [x1 - (x1 - x0 > T ? 0 : 0.06), y0 + 2.4, z1 - (z1 - z0 > T ? 0 : 0.06)], 'glass', { glass: true });
    } else box([x0, y0, z0], [x1, y0 + wallTop, z1], 'plaster');
  };
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
    const code = c(x, y);
    if (!WALLISH.has(code) || DOORISH.has(code)) continue;
    const cx = mid(x), cz = mid(y);
    wallTop = ceilHoles.has(x + ',' + y) ? STOREY : WALL_H;
    const isRail = railCells.has(x + ',' + y), code2 = isRail ? 'R' : code;
    drawWall(cx - T / 2, cz - T / 2, cx + T / 2, cz + T / 2, isRail ? 'R' : code === 'G' ? 'W' : code);   // the post
    // a wall meeting a balustrade stops at the rail's height there
    const arm = (nx, ny) => (railCells.has(nx + ',' + ny) && !isRail ? 'R' : code2);
    if (WALLISH.has(c(x + 1, y))) drawWall(cx + T / 2, cz - T / 2, cx + S / 2, cz + T / 2, arm(x + 1, y));
    if (WALLISH.has(c(x - 1, y))) drawWall(cx - S / 2, cz - T / 2, cx - T / 2, cz + T / 2, arm(x - 1, y));
    if (WALLISH.has(c(x, y + 1))) drawWall(cx - T / 2, cz + T / 2, cx + T / 2, cz + S / 2, arm(x, y + 1));
    if (WALLISH.has(c(x, y - 1))) drawWall(cx - T / 2, cz - S / 2, cx + T / 2, cz - T / 2, arm(x, y - 1));
  }

  // doors: one leaf a square (two squares: a double door), a lintel above
  const doors = doorways(rows);
  // (M6.13.0, Rhys: real doors open one way) each door swings into the
  // smaller of the two spaces it joins - into a bedroom off the corridor, into
  // the kitchen off the restaurant - and in from the street
  const roomOf = new Map();
  { const ins = insideMask(rows); for (const r of rooms(rows, ins)) for (const [x, y] of r) roomOf.set(x + ',' + y, r.length); }
  const swingOf = (d) => {
    const [x, y] = d.cells[0];
    const [a, b] = d.axis === 'x' ? [[x, y - 1], [x, y + 1]] : [[x - 1, y], [x + 1, y]];   // the -n side, the +n side
    const sa = roomOf.get(a.join(',')) || Infinity, sb = roomOf.get(b.join(',')) || Infinity;
    if (sa === Infinity && sb === Infinity) return undefined;
    return sa < sb ? -1 : 1;
  };
  for (const d of doors) {
    const a0 = (d.axis === 'x' ? d.cells[0][0] : d.cells[0][1]) * S;
    const a1 = a0 + d.cells.length * S;
    const at = d.axis === 'x' ? mid(d.cells[0][1]) : mid(d.cells[0][0]);
    if (d.axis === 'x') box([a0, y0 + 2.2, at - T / 2], [a1, y0 + WALL_H, at + T / 2], 'plaster');
    else box([at - T / 2, y0 + 2.2, a0], [at + T / 2, y0 + WALL_H, a1], 'plaster');
    const opts = d.code === 'R' ? { build: 'reinforced', locked: true, mat: 'armour', thick: 0.08, label: 'reinforced door' }
      : d.code === 'L' ? { build: 'sturdy', locked: true, label: 'locked door' }
      : d.code === 'E' && d.cells.length === 2 ? { mat: 'glass', label: 'glass door' } : {};
    // seal (M6.12.3): how far the drawn leaf reaches past its solid - hinge
    // edge, latch edge, top (to the lintel at 2.2), and whether it carries
    // the strip over a pair's join - so no light shows round a shut door
    const leaf = (b0, b1, pair, seal) => {
      const door = new SwingDoor(world, Object.assign({
        plane: d.axis === 'x' ? 'z' : 'x', at, wall: [at - T / 2, at + T / 2],
        from: b0, to: b1, y0, h: 2.15, pair, seal, swingTo: swingOf(d),
      }, opts));
      level.swingDoors.push(door);
    };
    // the two leaves of a double door are a pair: standing, E opens both (M6.9.1)
    const pair = d.cells.length === 2 ? key + ':' + d.cells[0].join(',') : undefined;
    if (d.cells.length === 1) leaf(a0 + 0.02, a1 - 0.02, undefined, [0.02, 0.02, 0.05]);
    else { leaf(a0 + 0.02, (a0 + a1) / 2 - 0.01, pair, [0.02, 0.01, 0.05, 1]); leaf(a1 - 0.02, (a0 + a1) / 2 + 0.01, pair, [0.02, 0.01, 0.05]); }
  }

  // the floor, the ceiling over every inside square, and the lights
  const inside = insideMask(rows);
  const under = new Set(inside);
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) if (WALLISH.has(c(x, y))) under.add(x + ',' + y);
  for (let y = 0; y < rows.length; y++) {
    let x = 0;
    while (x < rows[y].length) {
      if (!under.has(x + ',' + y)) { x++; continue; }
      let e = x; while (under.has((e + 1) + ',' + y)) e++;
      // the ceiling (the floor of the storey above) and this floor's carpet,
      // each broken where the stairs come through
      let a = x;
      while (a <= e) {
        const skipC = ceilHoles.has(a + ',' + y);
        let b = a; while (b + 1 <= e && ceilHoles.has((b + 1) + ',' + y) === skipC) b++;
        if (!skipC) box([a * S, y0 + WALL_H, y * S], [(b + 1) * S, y0 + STOREY, (y + 1) * S], 'concrete2');
        a = b + 1;
      }
      a = x;
      while (a <= e) {
        const skipF = floorHoles.has(a + ',' + y);
        let b = a; while (b + 1 <= e && floorHoles.has((b + 1) + ',' + y) === skipF) b++;
        if (!skipF) box([a * S, y0, y * S], [(b + 1) * S, y0 + 0.02, (y + 1) * S], 'carpet', { solid: false });
        a = b + 1;
      }
      x = e + 1;
    }
  }
  const roomInside = new Set(inside);
  for (const h of holeCells) roomInside.delete(h.x + ',' + h.y);
  const roomList = rooms(rows, roomInside);
  // the balcony's decking
  for (const k of balc) {
    const [x, y] = k.split(',').map(Number);
    box([x * S, y0, y * S], [(x + 1) * S, y0 + 0.03, (y + 1) * S], 'wood', { solid: false });
  }
  for (const h of holeCells) blownHole(box, h, y0);
  furnish(level, box, rows, roomList, labelsHere, y0);
  const cctv = cameras(level, box, rows, roomList, labelsHere, y0);
  bedrooms(box, rows, roomList, labelsHere, doors, y0, holeCells);
  estateSuite(level, box, roomList, labelsHere, y0);
  for (const cells of roomList) {
    let placed = 0;
    for (const [x, y] of cells) if (x % 4 === 2 && y % 4 === 2 && c(x, y) === '.') { addLight(level, box, mid(x), y0 + WALL_H, mid(y)); placed++; }
    if (!placed) {
      const cx = cells.reduce((a, p) => a + p[0], 0) / cells.length, cy = cells.reduce((a, p) => a + p[1], 0) / cells.length;
      const best = cells.reduce((b, p) => (Math.hypot(p[0] - cx, p[1] - cy) < Math.hypot(b[0] - cx, b[1] - cy) ? p : b));
      addLight(level, box, mid(best[0]), y0 + WALL_H, mid(best[1]));
    }
  }

  // the rooms' names from the map, as zones
  for (const [text, fl, lx, ly] of MAP.labels) {
    if (fl !== key || !/^[A-Z][a-z]/.test(text) || /Camera|Tables|Main Road|Police|River|Ghost|Sewer|Hostage|Elevator|Emergency|Down|Console|Key\b/.test(text)) continue;
    const room = roomList.find((cells) => cells.some(([x, y]) => Math.abs(x - lx) <= 1 && Math.abs(y - ly) <= 1));
    if (!room) continue;
    const xs = room.map((p) => p[0]), ys = room.map((p) => p[1]);
    const zmin = [Math.min(...xs) * S, y0, Math.min(...ys) * S], zmax = [(Math.max(...xs) + 1) * S, y0 + 3, (Math.max(...ys) + 1) * S];
    const id = text.toLowerCase().replace(/\s*\(.*\)/, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    world.addZone(zmin, zmax, id, 'Riverside Hotel - ' + text.replace(/\s*\(.*\)/, ''));
    level.zones[id] = [zmin, zmax];
  }
  return { rows, inside, rooms: roomList, doors, cctv, holes: holeCells, y0, key };
}

function addLight(level, box, x, yCeil, z) {
  // the fitting is there either way; with the power off it gives no light
  if (level.powerOut) { box([x - 0.6, yCeil - 0.1, z - 0.2], [x + 0.6, yCeil, z + 0.2], 'lamp', { solid: false }); return; }
  // (M6.9.18, Rhys: at night the rooms' lights lit very little - the day's
  // ambient had been doing most of the work) brighter and further at night
  level.lights.push({ pos: [x, yCeil - 0.4, z], range: level.night ? ROOM_LIGHT_NIGHT.range : 10, intensity: level.night ? ROOM_LIGHT_NIGHT.intensity : 0.85, color: [1, 0.9, 0.74] });
  box([x - 0.6, yCeil - 0.1, z - 0.2], [x + 0.6, yCeil, z + 0.2], 'lamp', { solid: false });
}

// The city round the hotel (M6.9.1, Rhys: it stood alone at the edge of the
// world). Blocks of neighbouring buildings on every side - across the road,
// either side of the hotel, beyond the far bank - street lamps on posts,
// ladders out of the river, and an invisible fence where the city ends.
function buildCity(level, box) {
  const RIVER_Z = 44 * S;
  // (M6.9.23, Rhys: lit windows on the roofs) a plain roof on each block, the
  // odd chimney stack and vent on it
  let seed = 911;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const block = (x0, z0, x1, z1, h) => {
    box([x0, 0, z0], [x1, h, z1], 'facade');
    box([x0 - 0.02, h, z0 - 0.02], [x1 + 0.02, h + 0.06, z1 + 0.02], 'concrete2', { solid: false });
    box([x0, h + 0.06, z0], [x1, h + 0.5, z0 + 0.25], 'concrete2', { solid: false });      // a low lip round it
    box([x0, h + 0.06, z1 - 0.25], [x1, h + 0.5, z1], 'concrete2', { solid: false });
    box([x0, h + 0.06, z0], [x0 + 0.25, h + 0.5, z1], 'concrete2', { solid: false });
    box([x1 - 0.25, h + 0.06, z0], [x1, h + 0.5, z1], 'concrete2', { solid: false });
    const n = 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const cx = x0 + 1.5 + rnd() * Math.max(0.1, x1 - x0 - 3), cz = z0 + 1.5 + rnd() * Math.max(0.1, z1 - z0 - 3);
      if (rnd() < 0.5) box([cx - 0.5, h + 0.06, cz - 0.35], [cx + 0.5, h + 1.4 + rnd() * 0.8, cz + 0.35], 'brick', { solid: false });   // a chimney stack
      else box([cx - 0.8, h + 0.06, cz - 0.6], [cx + 0.8, h + 1.0, cz + 0.6], 'metal', { solid: false });                              // a vent housing
    }
  };
  // across the road (north), with alleys between
  for (const [x0, x1, h] of [[-44, -22, 14], [-20, 2, 11], [4, 26, 16], [28, 42, 12], [44, 66, 15], [68, 84, 10]]) block(x0, -30, x1, -4, h);
  box([-45, 0, -4], [85, 0.15, -1], 'concrete', { solid: false });           // the far pavement
  // either side of the hotel, with a side street to the east
  for (const [z0, z1, h] of [[8, 26, 12], [28, 46, 15], [48, 64, 10]]) { block(-44, z0, -4, z1, h); block(40, z0, 84, z1, h + 2); }
  // beyond the river
  for (const [x0, x1, h] of [[-44, -14, 18], [-12, 20, 12], [22, 50, 16], [52, 84, 13]]) block(x0, RIVER_Z + 22, x1, RIVER_Z + 44, h);
  // street lamps along both pavements and the embankment, on posts
  // (M6.9.17) at night the street lamps light the street - baked in with the rest
  const lamp = (x, z) => {
    box([x - 0.08, 0, z - 0.08], [x + 0.08, 5.15, z + 0.08], 'metal', { noClimb: true });
    level.lamps.push({ pos: [x, 5.2, z] });
    if (level.night) level.lights.push({ pos: [x, 4.9, z], range: 14, intensity: 1.6, color: [1, 0.78, 0.5], street: true });
  };
  for (let x = -36; x <= 78; x += 19) { lamp(x, -1.5); lamp(x + 9, 7); }
  for (let x = -38; x <= 80; x += 20) lamp(x, RIVER_Z - 1.2);
  // ladders out of the river: both banks, every 20 m (M6.9.1: you could swim in, not out)
  for (let x = -35; x <= 80; x += 20) {
    drawLadder(box, x, RIVER_Z, [0, 1], -4.5, 0, 'iron');
    level.world.addLadder([x - 0.5, -4.5, RIVER_Z], [x + 0.5, 0.3, RIVER_Z + 0.8], [0, 1]);
    drawLadder(box, x + 10, RIVER_Z + 17.5, [0, -1], -4.5, 0, 'iron');
    level.world.addLadder([x + 9.5, -4.5, RIVER_Z + 16.7], [x + 10.5, 0.3, RIVER_Z + 17.5], [0, -1]);
  }
  // where the city ends: unseen walls round it all, the river included
  const fence = (min, max) => box(min, max, 'wall', { render: false, noClimb: true });
  fence([-46, -6, -32], [-45, 30, RIVER_Z + 46]); fence([85, -6, -32], [86, 30, RIVER_Z + 46]);
  fence([-46, -6, -33], [86, 30, -32]); fence([-46, -6, RIVER_Z + 45], [86, 30, RIVER_Z + 46]);
}

// The garden (M6.9.1, Rhys: a long lawn along the hotel's west side, from
// the kitchen to the river, reached by the back door). Lawn, a hedge round
// it, a path from the back door, a few trees, benches.
function buildGarden(level, box) {
  const x0 = 4.5, x1 = 10.9, z0 = 26.5, z1 = 63.4;
  box([x0, 0, z0], [x1, 0.03, z1], 'lawn', { solid: false });
  box([x0 - 0.6, 0, z0], [x0, 1.1, z1 + 0.6], 'hedge');                      // west hedge
  box([x0 - 0.6, 0, z1], [x1, 1.1, z1 + 0.6], 'hedge');                      // south hedge, the river side
  box([x0 - 0.6, 0, z0 - 0.1], [5.1, 1.1, z0 + 0.5], 'hedge');             // the gap by the kitchen's corner (clear of its wall)
  box([8.4, 0, 40], [9.6, 0.04, 62.2], 'concrete2', { solid: false });       // the path from the back door
  box([9.6, 0, 61.2], [x1, 0.04, 62.2], 'concrete2', { solid: false });
  for (const z of [32, 44, 56]) {                                              // trees
    box([5.8, 0, z - 0.18], [6.16, 2.4, z + 0.18], 'wood');
    box([4.9, 2.2, z - 1.1], [7.1, 4.4, z + 1.1], 'hedge', { solid: false });
  }
  for (const z of [38, 50]) {                                                  // benches
    box([5.1, 0.42, z - 0.8], [5.6, 0.48, z + 0.8], 'wood');
    box([4.95, 0.48, z - 0.8], [5.05, 0.95, z + 0.8], 'wood', { solid: false });
    box([5.2, 0, z - 0.75], [5.5, 0.42, z - 0.65], 'metal', { solid: false });
    box([5.2, 0, z + 0.65], [5.5, 0.42, z + 0.75], 'metal', { solid: false });
  }
}

// What each C square is depends on where it is (M6.9.1, Rhys: the tables
// should look like a restaurant's, the bar like one bar). A square's room is
// the region it is in; where a region holds more than one name (the bar opens
// on to the restaurant), the nearest name wins.
export function furnitureKind(x, y, roomOf, labels) {
  const room = roomOf.get(x + ',' + y);
  let best = null, bd = Infinity;
  for (const [t, , lx, ly] of labels) {
    if (!/^(Restaurant|Tables|Bar|Kitchen|Foyer|Estate|artificial barricade|Upper Balcony Suite)/i.test(t)) continue;
    // (?? not ||: the first room is number 0 - M6.9.4, the Estate Room's table came out as crates)
    const lr = roomOf.get(lx + ',' + ly) ?? roomOf.get((lx + 1) + ',' + ly) ?? roomOf.get(lx + ',' + (ly + 1));
    if (lr !== room) continue;
    const dd = Math.hypot(lx - x, ly - y);
    if (dd < bd) { bd = dd; best = t; }
  }
  if (!best) return 'cover';
  if (/Upper Balcony Suite/i.test(best)) return 'none';    // M6.9.20: the penthouse is furnished on its own
  if (/barricade/i.test(best)) return 'barricade';        // M6.9.11: furniture piled across the corridor
  if (/^Estate/.test(best)) return 'partition';          // M6.9.9: the suite's screen between bathroom and room
  if (/^(Restaurant|Tables)/.test(best)) return 'table';
  return best.toLowerCase();
}

function furnish(level, box, rows, roomList, labels, y0) {
  const roomOf = new Map();
  roomList.forEach((cells, i) => { for (const [x, y] of cells) roomOf.set(x + ',' + y, i); });
  const isC = (x, y) => cellAt(rows, x, y) === 'C';
  const byKind = {};
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
    if (!isC(x, y)) continue;
    const k = furnitureKind(x, y, roomOf, labels);
    (byKind[k] = byKind[k] || []).push([x, y]);
  }
  // The bar is only the run of squares joined to the one nearest its name;
  // other squares near it are the restaurant's tables (M6.9.1: at first the
  // whole middle of the restaurant became one counter).
  const barLabel = labels.find(([t]) => /^Bar\b/.test(t));
  if (byKind.bar && barLabel) {
    const near = byKind.bar.reduce((best, q) => (Math.hypot(q[0] - barLabel[2], q[1] - barLabel[3]) < Math.hypot(best[0] - barLabel[2], best[1] - barLabel[3]) ? q : best));
    const inBar = new Set(), todo = [near];
    const pool = new Set(byKind.bar.map((q) => q.join(',')));
    while (todo.length) {
      const [x, y] = todo.pop(), k = x + ',' + y;
      if (inBar.has(k) || !pool.has(k)) continue;
      inBar.add(k); todo.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    byKind.table = (byKind.table || []).concat(byKind.bar.filter((q) => !inBar.has(q.join(','))));
    byKind.bar = byKind.bar.filter((q) => inBar.has(q.join(',')));
  }
  // restaurant: a table with a cloth to each square, chairs on its open sides
  for (const [x, y] of byKind.table || []) {
    const cx = (x + 0.5) * S, cz = (y + 0.5) * S;
    surface(box([cx - 0.55, y0 + 0.72, cz - 0.55], [cx + 0.55, y0 + 0.77, cz + 0.55], 'cloth', { solid: false }), 'table');
    box([cx - 0.56, y0 + 0.5, cz - 0.56], [cx + 0.56, y0 + 0.72, cz + 0.56], 'cloth', { solid: false });   // the drop of the cloth
    box([cx - 0.5, y0, cz - 0.5], [cx + 0.5, y0 + 0.77, cz + 0.5], 'wood', { render: false });           // what you bump into
    box([cx - 0.06, y0, cz - 0.06], [cx + 0.06, y0 + 0.5, cz + 0.06], 'wood', { solid: false });
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (isC(x + dx, y + dz)) continue;
      const sx = cx + dx * 0.72, sz = cz + dz * 0.72;
      box([sx - 0.22, y0 + 0.42, sz - 0.22], [sx + 0.22, y0 + 0.47, sz + 0.22], 'wood');                 // seat
      box([sx - 0.2, y0, sz - 0.2], [sx + 0.2, y0 + 0.42, sz + 0.2], 'wood', { render: false });
      for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) box([sx + lx - 0.02, y0, sz + lz - 0.02], [sx + lx + 0.02, y0 + 0.42, sz + lz + 0.02], 'metal', { solid: false });
      const bx = sx + dx * 0.2, bz = sz + dz * 0.2;                                                          // back, away from the table
      if (dx) box([bx - 0.025, y0 + 0.47, sz - 0.22], [bx + 0.025, y0 + 0.95, sz + 0.22], 'wood', { solid: false });
      else box([sx - 0.22, y0 + 0.47, bz - 0.025], [sx + 0.22, y0 + 0.95, bz + 0.025], 'wood', { solid: false });
    }
  }
  // the bar: one counter over all its squares, a brass foot rail, and shelves of bottles behind
  const bar = byKind.bar || [];
  if (bar.length) {
    const xs = bar.map((p) => p[0]), ys = bar.map((p) => p[1]);
    const bx0 = Math.min(...xs) * S + 0.3, bx1 = (Math.max(...xs) + 1) * S - 0.3;
    const bz0 = Math.min(...ys) * S + 0.1, bz1 = (Math.max(...ys) + 1) * S - 0.1;
    const alongZ = bz1 - bz0 > bx1 - bx0;
    box([bx0, y0, bz0], [bx1, y0 + 1.02, bz1], 'door');                                                    // the counter front, dark wood
    surface(box([bx0 - 0.08, y0 + 1.02, bz0 - 0.08], [bx1 + 0.08, y0 + 1.1, bz1 + 0.08], 'wood'), 'bar');                 // the top
    if (alongZ) box([bx1 + 0.12, y0 + 0.18, bz0], [bx1 + 0.16, y0 + 0.22, bz1], 'metal', { solid: false });
    else box([bx0, y0 + 0.18, bz1 + 0.12], [bx1, y0 + 0.22, bz1 + 0.16], 'metal', { solid: false });
    // the back bar, on the wall across from the counter
    if (alongZ) {
      const room = roomList.find((cells) => cells.some(([x, y]) => x === Math.min(...xs) - 1 && y === Math.min(...ys)));
      const wx = room ? Math.min(...room.map((p) => p[0])) * S + 0.1 : bx0 - 3;
      // (M6.9.25) it stops short of the cellar stairs in the bar's corner
      const bzE = y0 === 0 && wx < CELLAR_STAIR.xE && wx > CELLAR_STAIR.xW - 1 ? Math.min(bz1, CELLAR_STAIR.zN - 0.15) : bz1;
      for (const h of [0.9, 1.35, 1.8]) {
        box([wx, y0 + h, bz0], [wx + 0.35, y0 + h + 0.04, bzE], 'wood', { solid: false });
        for (let z = bz0 + 0.15, i = 0; z < bzE - 0.1; z += 0.16, i++) {
          const tall = 0.22 + ((i * 7) % 5) * 0.03;
          box([wx + 0.1, y0 + h + 0.04, z - 0.04], [wx + 0.18, y0 + h + 0.04 + tall, z + 0.04], i % 3 ? 'glass' : 'barrel', { solid: false });
        }
      }
      box([wx, y0, bz0], [wx + 0.5, y0 + 0.9, bzE], 'door');                                             // the low cupboard under the shelves
    }
  }
  // the kitchen (M6.9.2, Rhys: make it look like one): white units with a
  // steel top, a hob with four rings under a steel hood on the first, a sink
  // and tap on the next, and a pan rack over them
  (byKind.kitchen || []).sort((a, b) => a[1] - b[1] || a[0] - b[0]).forEach(([x, y], i) => {
    const x0 = x * S + 0.02, x1 = (x + 1) * S - 0.02, z0 = y * S + 0.3, z1 = (y + 1) * S - 0.3;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    box([x0, y0, z0], [x1, y0 + 0.86, z1], 'plaster');                                                     // the units
    for (const dx of [-0.36, 0.36]) box([cx + dx - 0.05, y0 + 0.62, z1 + 0.005], [cx + dx + 0.05, y0 + 0.64, z1 + 0.03], 'metal', { solid: false });   // handles
    box([x0, y0 + 0.08, z1], [x1, y0 + 0.1, z1 + 0.005], 'metal', { solid: false });                         // the kick plate line
    box([x0 - 0.02, y0 + 0.86, z0 - 0.02], [x1 + 0.02, y0 + 0.9, z1 + 0.04], 'metal');                   // the steel top
    if (i % 2 === 0) {
      for (const [dx, dz] of [[-0.25, -0.12], [0.25, -0.12], [-0.25, 0.14], [0.25, 0.14]]) box([cx + dx - 0.1, y0 + 0.9, cz + dz - 0.1], [cx + dx + 0.1, y0 + 0.915, cz + dz + 0.1], 'door', { solid: false });
      box([x0 + 0.1, y0 + 2.0, z0 - 0.05], [x1 - 0.1, y0 + 2.35, z1 + 0.1], 'metal', { solid: false });   // the extractor hood
      box([cx - 0.12, y0 + 2.35, cz - 0.12], [cx + 0.12, y0 + WALL_H, cz + 0.12], 'metal', { solid: false });
    } else {
      box([cx - 0.3, y0 + 0.9, cz - 0.2], [cx + 0.3, y0 + 0.905, cz + 0.2], 'glass', { solid: false });    // the sink
      box([cx - 0.02, y0 + 0.9, z0 + 0.02], [cx + 0.02, y0 + 1.2, z0 + 0.06], 'metal', { solid: false });   // the tap
      box([cx - 0.02, y0 + 1.16, z0 + 0.06], [cx + 0.02, y0 + 1.2, z0 + 0.2], 'metal', { solid: false });
      box([x0 + 0.1, y0 + 1.9, cz - 0.02], [x1 - 0.1, y0 + 1.94, cz + 0.02], 'metal', { solid: false });   // the pan rack
      for (const dx of [-0.35, -0.05, 0.3]) box([cx + dx - 0.1, y0 + 1.55, cz - 0.1], [cx + dx + 0.1, y0 + 1.7, cz + 0.1], 'barrel', { solid: false });
    }
  });
  // ...and the rest of the kitchen (M6.9.3, Rhys: fill it out): units and
  // wall cupboards along the walls, a pair of tall fridges in a corner, a
  // range cooker, a steel prep table, shelves of pans - clear of its doors
  const kitchenRoom = (byKind.kitchen || []).length ? roomList[roomOf.get(byKind.kitchen[0].join(','))] : null;
  if (kitchenRoom) fillKitchen(box, rows, kitchenRoom, y0);
  // the foyer: the concierge desk (a run of three or more), sofas otherwise
  const foyer = byKind.foyer || [];
  const runs = [];
  for (const [x, y] of foyer.sort((a, b) => a[1] - b[1] || a[0] - b[0])) {
    const r = runs.find((q) => q.y === y && q.x1 === x - 1);
    if (r) r.x1 = x; else runs.push({ y, x0: x, x1: x });
  }
  for (const r of runs) {
    const x0 = r.x0 * S + 0.1, x1 = (r.x1 + 1) * S - 0.1, z0 = r.y * S + 0.35, z1 = (r.y + 1) * S - 0.35;
    if (r.x1 - r.x0 >= 2) {
      box([x0, y0, z0], [x1, y0 + 1.05, z1], 'door');
      surface(box([x0 - 0.05, y0 + 1.05, z0 - 0.05], [x1 + 0.05, y0 + 1.1, z1 + 0.05], 'wood'), 'desk');
    } else {
      box([x0, y0, z0], [x1, y0 + 0.45, z1], 'carpet');
      box([x0, y0 + 0.45, z1 - 0.2], [x1, y0 + 0.9, z1], 'carpet', { solid: false });
    }
  }
  // a screen: a low panelled wall with frosted glass above, joined like walls
  // (M6.9.9, the Estate Room: its C squares divide the bathroom from the room)
  const part = new Set((byKind.partition || []).map((q) => q.join(',')));
  const joins = (x, y) => part.has(x + ',' + y) || WALLISH.has(cellAt(rows, x, y));
  for (const [x, y] of byKind.partition || []) {
    const cx = (x + 0.5) * S, cz = (y + 0.5) * S, h = 0.07;
    const seg = (x0, z0, x1, z1) => {
      box([x0, y0, z0], [x1, y0 + 1.0, z1], 'door');
      const gx = x1 - x0 > z1 - z0 ? 0 : 0.05, gz = gx ? 0 : 0.05;
      box([x0 + gx, y0 + 1.0, z0 + gz], [x1 - gx, y0 + 2.0, z1 - gz], 'glass', { glass: true });
      box([x0 - 0.01, y0 + 2.0, z0 - 0.01], [x1 + 0.01, y0 + 2.06, z1 + 0.01], 'wood', { solid: false });
    };
    seg(cx - h, cz - h, cx + h, cz + h);
    if (joins(x + 1, y)) seg(cx + h, cz - h, cx + S / 2, cz + h);
    if (joins(x - 1, y)) seg(cx - S / 2, cz - h, cx - h, cz + h);
    if (joins(x, y + 1)) seg(cx - h, cz + h, cx + h, cz + S / 2);
    if (joins(x, y - 1)) seg(cx - h, cz - S / 2, cx + h, cz - h);
  }
  // a barricade (M6.9.11, "artificial barricade"): the furniture of the rooms
  // round it piled wall to wall across the corridor - wardrobes, a sofa,
  // mattresses, tables, chairs. Chest high (M6.9.12, Rhys: no way past, but
  // you can shoot over it), and too loose to climb.
  const barr = new Set((byKind.barricade || []).map((q) => q.join(',')));
  const doneB = new Set();
  for (const [x, y] of byKind.barricade || []) {
    if (doneB.has(x + ',' + y)) continue;
    const ew = barr.has((x + 1) + ',' + y) || barr.has((x - 1) + ',' + y) || !(barr.has(x + ',' + (y + 1)) || barr.has(x + ',' + (y - 1)));
    let a0 = ew ? x : y, a1 = a0;
    const at = (a) => (ew ? a + ',' + y : x + ',' + a);
    while (barr.has(at(a0 - 1))) a0--;
    while (barr.has(at(a1 + 1))) a1++;
    for (let a = a0; a <= a1; a++) doneB.add(at(a));
    const wallAt = (a) => WALLISH.has(ew ? cellAt(rows, a, y) : cellAt(rows, x, a));
    const face = S / 2 - T / 2;
    const lo = a0 * S - (wallAt(a0 - 1) ? face : 0), hi = (a1 + 1) * S + (wallAt(a1 + 1) ? face : 0);
    const c0 = ((ew ? y : x) + 0.5) * S;
    let seed = x * 73 + y * 19 + 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    // along a, across c: into world boxes
    const P = (u0, u1, ya, yb, v0, v1, mat, opts) => box(ew ? [u0, y0 + ya, c0 + v0] : [c0 + v0, y0 + ya, u0], ew ? [u1, y0 + yb, c0 + v1] : [c0 + v1, y0 + yb, u1], mat, opts || { solid: false });
    const BH = BARRICADE_H;
    P(lo, hi, 0, BH, -0.55, 0.55, 'plaster', { render: false, noClimb: true });           // what stops you
    const kit = [['door', 1.6, 2.1, 0.55, 0.7, 0.55], ['fabric', 1.5, 1.9, 0.75, 0.85, 0.85], ['wood', 0.9, 1.4, 0.35, 0.5, 0.75], ['cloth', 1.6, 2.0, 0.2, 0.28, 0.95], ['wood', 0.4, 0.5, 0.45, 0.9, 0.45], ['metal', 0.5, 0.7, 0.3, 0.45, 0.4], ['door', 0.8, 1.2, 0.5, 0.8, 0.5]];
    for (let layer = 0, base = new Array(1).fill(0); layer < 2; layer++) {
      let u = lo + 0.02 + rnd() * 0.2, i = Math.floor(rnd() * kit.length);
      while (u < hi - 0.25) {
        const [mat, w0, w1, h0, h1, d] = kit[i++ % kit.length];
        const w = Math.min(hi - 0.02 - u, w0 + rnd() * (w1 - w0));
        const yb = layer * 0.62 + (layer ? rnd() * 0.08 : 0), h = Math.min(h0 + rnd() * (h1 - h0), BH - yb);
        if (h > 0.15) P(u, u + w, yb, yb + h, -d / 2 + (rnd() - 0.5) * 0.25, d / 2 + (rnd() - 0.5) * 0.25, mat);
        u += w + 0.02 + rnd() * 0.15;
      }
      void base;
    }
    // mattresses leant against it on both sides
    for (const side of [-1, 1]) for (let k = 0; k < 2; k++) {
      const u = lo + 0.4 + rnd() * (hi - lo - 2.4);
      P(u, u + 1.4 + rnd() * 0.5, 0, BH - 0.1 - rnd() * 0.25, side > 0 ? 0.56 : -0.84, side > 0 ? 0.84 : -0.56, 'cloth');
    }
  }
  for (const [x, y] of byKind.cover || []) box([x * S + 0.15, y0, y * S + 0.15], [(x + 1) * S - 0.15, y0 + 1.0, (y + 1) * S - 0.15], 'wood');
}

// CCTV (M6.9.1, Rhys: the Ts beside "CCTV Camera n" are cameras, watched from
// the CCTV console). A camera high on the wall, looking into its room (or,
// outside, out across the street); the console a desk of screens.
function cameras(level, box, rows, roomList, labels, y0) {
  const list = [];
  let consolePos = null;
  const tCells = [];
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) if (cellAt(rows, x, y) === 'T') tCells.push([x, y]);
  const labelNear = (x, y, re) => labels.find(([t, , lx, ly]) => re.test(t) && Math.abs(lx - x) <= 1 && Math.abs(ly - y) <= 1);
  for (const [x, y] of tCells) {
    const cam = labelNear(x, y, /CCTV Camera/i);
    const cx = (x + 0.5) * S, cz = (y + 0.5) * S;
    if (!cam) {
      // one CCTV console, on the ground floor (M6.9.12, Rhys: the second
      // floor's got in the way of the lift's stop button)
      if (y0 > 0.01) continue;
      box([cx - 0.6, y0, cz - 0.35], [cx + 0.6, y0 + 0.75, cz + 0.35], 'metal');                         // the console desk
      for (const dx of [-0.34, 0.34]) box([cx + dx - 0.26, y0 + 0.78, cz - 0.03], [cx + dx + 0.26, y0 + 1.15, cz + 0.03], 'metal', { solid: false });
      if (labelNear(x, y, /Console/i) || !consolePos) consolePos = [cx, y0, cz];
      continue;
    }
    // which way is the nearest wall: the camera hangs off it
    let wall = [0, 0];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (WALLISH.has(cellAt(rows, x + dx, y + dy))) { wall = [dx, dy]; break; }
    const room = roomList.find((cells) => cells.some(([a, b]) => a === x && b === y));
    let look;
    if (room) {
      const mx = room.reduce((a, p) => a + p[0], 0) / room.length, my = room.reduce((a, p) => a + p[1], 0) / room.length;
      look = [(mx + 0.5) * S, y0 + 0.6, (my + 0.5) * S];
    } else look = [cx - wall[0] * 9, y0 + 0.6, cz - wall[1] * 9];                                         // outside: out across the street
    // on the wall itself (M6.9.6, Rhys: camera 6 floated in the stairwell - it
    // hung on a rod from the ceiling, and there is no ceiling there): its face
    // is a whole square out from here less half a wall; a bracket into it
    const reach = S - T / 2;
    const face = [cx + wall[0] * reach, cz + wall[1] * reach];
    const pos = [face[0] - wall[0] * 0.28, y0 + 3.0, face[1] - wall[1] * 0.28];
    box([pos[0] - 0.12, pos[1] - 0.1, pos[2] - 0.12], [pos[0] + 0.12, pos[1] + 0.06, pos[2] + 0.12], 'metal', { solid: false });
    box([Math.min(pos[0], face[0]) - 0.03, pos[1] - 0.03, Math.min(pos[2], face[1]) - 0.03], [Math.max(pos[0], face[0]) + 0.03, pos[1] + 0.03, Math.max(pos[2], face[1]) + 0.03], 'metal', { solid: false });
    box([face[0] - (wall[1] ? 0.1 : 0.02), pos[1] - 0.12, face[1] - (wall[0] ? 0.1 : 0.02)], [face[0] + (wall[1] ? 0.1 : 0.02), pos[1] + 0.12, face[1] + (wall[0] ? 0.1 : 0.02)], 'metal', { solid: false });
    const n = +(cam[0].match(/\d+/) || [list.length + 1])[0];
    list.push({ n, label: cam[0], pos, look });
  }
  list.sort((a, b) => a.n - b.n);
  return list.length || consolePos ? { cameras: list, console: consolePos } : null;
}

// The kitchen's fittings round its walls. Squares next to a wall and not
// within a square of a door get fittings; a square left clear down the middle.
export function kitchenPlan(rows, cells) {
  const inRoom = new Set(cells.map((c) => c.join(',')));
  const code = (x, y) => cellAt(rows, x, y);
  const nearDoor = (x, y) => { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (DOORISH.has(code(x + dx, y + dy))) return true; return false; };
  const plan = [];
  for (const [x, y] of cells) {
    if (code(x, y) !== '.' || nearDoor(x, y)) continue;
    let wall = null;
    for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) if (WALLISH.has(code(x + dx, y + dy))) { wall = [dx, dy]; break; }
    if (!wall) continue;
    // keep the way round the room open: skip a square whose neighbour along the wall is a C (the island)
    plan.push({ x, y, wall });
  }
  // corners get the fridges
  for (const p of plan) {
    const walls = [[0, -1], [-1, 0], [1, 0], [0, 1]].filter(([dx, dy]) => WALLISH.has(code(p.x + dx, p.y + dy))).length;
    p.kind = walls >= 2 ? 'fridge' : 'unit';
  }
  let ranges = 0;
  for (const p of plan) if (p.kind === 'unit' && p.wall[1] === -1 && ranges < 1 && (p.x % 3 === 1)) { p.kind = 'range'; ranges++; }
  return plan.filter((p) => inRoom.has(p.x + ',' + p.y));
}

function fillKitchen(box, rows, cells, y0) {
  for (const p of kitchenPlan(rows, cells)) {
    // the square, and the strip of it against the wall (0.7 m deep)
    const sx0 = p.x * S, sx1 = (p.x + 1) * S, sz0 = p.y * S, sz1 = (p.y + 1) * S;
    const wallFace = { x0: sx0 + 0.12, x1: sx1 - 0.12, z0: sz0 + 0.12, z1: sz1 - 0.12 };
    let u;
    if (p.wall[1] === -1) u = [sx0 + 0.02, sz0 + 0.12, sx1 - 0.02, sz0 + 0.82];
    else if (p.wall[1] === 1) u = [sx0 + 0.02, sz1 - 0.82, sx1 - 0.02, sz1 - 0.12];
    else if (p.wall[0] === -1) u = [sx0 + 0.12, sz0 + 0.02, sx0 + 0.82, sz1 - 0.02];
    else u = [sx1 - 0.82, sz0 + 0.02, sx1 - 0.12, sz1 - 0.02];
    const [x0, z0, x1, z1] = u, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (p.kind === 'fridge') {
      box([x0 + 0.05, y0, z0 + 0.05], [x1 - 0.05, y0 + 2.05, z1 - 0.05], 'metal');                          // a tall steel fridge
      box([cx - 0.03, y0 + 0.9, cz - 0.03], [cx + 0.03, y0 + 1.5, cz + 0.03], 'rail', { solid: false });
      continue;
    }
    if (p.kind === 'range') {
      box([x0, y0, z0], [x1, y0 + 0.9, z1], 'metal');                                                          // the range, steel
      box([x0 + 0.1, y0 + 0.15, z0 + 0.1], [x1 - 0.1, y0 + 0.6, z1 - 0.1], 'door', { solid: false });       // its oven doors
      for (const [a, b] of [[0.28, 0.25], [0.72, 0.25], [0.28, 0.72], [0.72, 0.72]]) {
        const px = x0 + (x1 - x0) * a, pz = z0 + (z1 - z0) * b;
        box([px - 0.11, y0 + 0.9, pz - 0.11], [px + 0.11, y0 + 0.92, pz + 0.11], 'door', { solid: false });
      }
      box([x0, y0 + 2.0, z0], [x1, y0 + 2.35, z1], 'metal', { solid: false });                              // its hood
      continue;
    }
    box([x0, y0, z0], [x1, y0 + 0.86, z1], 'plaster');                                                       // a unit
    surface(box([x0 - 0.01, y0 + 0.86, z0 - 0.01], [x1 + 0.01, y0 + 0.9, z1 + 0.01], 'metal'), 'counter');                     // its steel top
    // wall cupboards over it, and something on the worktop now and then
    const wx0 = p.wall[0] === -1 ? x0 : p.wall[0] === 1 ? x1 - 0.35 : x0, wx1 = p.wall[0] === -1 ? x0 + 0.35 : p.wall[0] === 1 ? x1 : x1;
    const wz0 = p.wall[1] === -1 ? z0 : p.wall[1] === 1 ? z1 - 0.35 : z0, wz1 = p.wall[1] === -1 ? z0 + 0.35 : p.wall[1] === 1 ? z1 : z1;
    box([wx0, y0 + 1.55, wz0], [wx1, y0 + 2.2, wz1], 'plaster', { solid: false });
    if ((p.x + p.y) % 3 === 0) box([cx - 0.15, y0 + 0.9, cz - 0.15], [cx + 0.15, y0 + 1.15, cz + 0.15], 'barrel', { solid: false });   // a stock pot
    if ((p.x + p.y) % 3 === 1) box([cx - 0.22, y0 + 0.9, cz - 0.15], [cx + 0.22, y0 + 0.93, cz + 0.15], 'wood', { solid: false });     // a chopping board
  }
}

// A railing: metal posts, a top bar and a middle bar, from a to b ([x, z]),
// its foot at ya (at a) rising to yb (at b) - so it can follow a flight of
// stairs. Unless told otherwise, an unseen solid wall along it stops you
// (M6.9.5, Rhys: a proper rail, not "yellow sponge").
export function railing(box, a, b, ya, yb, opts) {
  opts = opts || {};
  const h = opts.h || 1.0, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const at = (t) => [a[0] + (b[0] - a[0]) * t, ya + (yb - ya) * t, a[1] + (b[1] - a[1]) * t];
  const posts = Math.max(1, Math.ceil(len / 1.2));
  for (let i = 0; i <= posts; i++) {
    const [x, y, z] = at(i / posts);
    box([x - 0.025, y, z - 0.025], [x + 0.025, y + h, z + 0.025], 'metal', { solid: false });
  }
  // the bars: one straight piece each, sloping with the stairs (M6.9.7 - the
  // stepped look of M6.9.6 did not go down well)
  const axis = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]) ? 0 : 2;
  const lowEndIsA = (axis === 0 ? a[0] <= b[0] : a[1] <= b[1]);
  const yMinEnd = lowEndIsA ? ya : yb, yMaxEnd = lowEndIsA ? yb : ya;
  for (const off of [h - 0.05, h * 0.5]) {
    box([Math.min(a[0], b[0]) - 0.025, yMinEnd + off, Math.min(a[1], b[1]) - 0.025], [Math.max(a[0], b[0]) + 0.025, yMinEnd + off + 0.05, Math.max(a[1], b[1]) + 0.025], 'metal',
      { solid: false, slope: yMaxEnd !== yMinEnd ? { axis, dy: yMaxEnd - yMinEnd } : undefined });
  }
  if (opts.solid !== false) box([Math.min(a[0], b[0]) - 0.05, Math.min(ya, yb), Math.min(a[1], b[1]) - 0.05], [Math.max(a[0], b[0]) + 0.05, Math.max(ya, yb) + h, Math.max(a[1], b[1]) + 0.05], 'wall', { render: false, noClimb: true, shootThrough: true });
}

// One storey of the stairs, from y0 to y0 + STOREY (M6.9.4; M6.9.5: tight to
// the lobby's walls, and see-through railings where there were walls, so
// camera 6 watches both the lobby and the stairs). A dog-leg: up the west
// half going north (10 steps), a half landing across the north end, up the
// east half coming back south, out on to the floor above at row 35.
export function buildStairs(level, box, y0, topFloor) {
  const n = 10, rise = STOREY / 2 / n, run = 3 / n;
  const face = S / 2 - T / 2;                                  // from a wall square's edge to its face
  const xW = STAIR.x0 * S - face;                              // the lobby's west wall face
  const xE = (STAIR.x0 + 2) * S - 0.2;                         // the railing on the lobby side
  const xM = (xW + xE) / 2;                                    // down the middle
  const zN = STAIR.y0 * S - face;                              // the lobby's north wall face
  const zMid = (STAIR.y0 + 2) * S, zS = (STAIR.y0 + 4) * S;
  const yL = y0 + STOREY / 2;
  // above the ground the flights are slabs with an underside, not solid to
  // the floor, so there is headroom on the flights below (M6.9.11: the first
  // floor's stairs up stand over the ground floor's)
  const under = (top) => (y0 > 0.01 ? Math.max(y0, top - 0.35) : y0);
  for (let i = 0; i < n; i++) {                                // up going north
    const top = y0 + rise * (i + 1);
    box([xW + 0.02, under(top), zS - run * (i + 1)], [xM - 0.1, top, zS - run * i], 'concrete2');
  }
  box([xW + 0.02, under(yL), zN + 0.02], [xE - 0.05, yL, zMid], 'concrete2');                  // the half landing
  for (let i = 0; i < n; i++) {                                // up coming south
    const top = yL + rise * (i + 1);
    box([xM + 0.1, under(top), zMid + run * i], [xE - 0.05, top, zMid + run * (i + 1)], 'concrete2');
  }
  // between the flights: a low wall, a railing on it rising with the east flight
  box([xM - 0.1, y0, zMid], [xM + 0.1, yL + 1.0, zS], 'plaster', { noClimb: true });
  railing(box, [xM, zMid], [xM, zS], yL + 1.0, y0 + STOREY, { h: 1.0 });
  // the lobby side: along the landing, then up with the east flight
  railing(box, [xE, zN], [xE, zMid], yL, yL);
  railing(box, [xE, zMid], [xE, zS], yL, y0 + STOREY);
  box([xM + 0.1, yL + 0.85, zMid], [xM + 0.14, yL + 0.9, zS], 'wood', { solid: false });      // a wooden handrail on the middle wall
  const y1 = y0 + STOREY;
  // on the floor above: a railing along the opening on the lobby side
  railing(box, [(STAIR.x0 + 2) * S - 0.05, zN], [(STAIR.x0 + 2) * S - 0.05, zS], y1, y1);
  // across the foot of the next flight up - only on the top floor, where
  // there is none (M6.9.11: on the first floor it would bar the way up)
  if (topFloor) railing(box, [xW, zS], [xM - 0.1, zS], y1, y1);
  // the floor above stops at the well's north wall squares; the room beyond
  // (Room 101, Room 201 upstairs) needs the half of that square on its side
  // (M6.9.7: a gap in its floor along the wall)
  box([(STAIR.x0 - 1) * S, y0 + WALL_H, (STAIR.y0 - 1) * S], [(STAIR.x0 + 2) * S, y0 + STOREY, (STAIR.y0 - 1) * S + S / 2 + 0.05], 'concrete2');
  // ...and its carpet (M6.9.8, Rhys: that strip was bare concrete, an off-colour
  // patch in the room's floor)
  box([(STAIR.x0 - 1) * S, y0 + STOREY, (STAIR.y0 - 1) * S], [(STAIR.x0 + 2) * S, y0 + STOREY + 0.02, (STAIR.y0 - 1) * S + S / 2 + 0.05], 'carpet', { solid: false });
  level.stairs = level.stairs || [];
  level.stairs.push({ y0, x0: xW, x1: xE, z0: zN, z1: zS });
}

// Out of the first floor's locked back doors on to the flat roof over the
// ground floor's back corridor, and an iron ladder down the back of the
// hotel to the ground ("Emergency Escape" on the map).
function buildRoofWalk(level, box) {
  const y = FLOORS[1], z0 = 40.5 * S + 0.1, z1 = 43 * S;
  box([7 * S, y - 0.3, 42.5 * S], [23 * S, y, z1], 'concrete2');             // the roof's edge past the back wall
  const lx = 13.5 * S;
  // a railing along the edge, with a gap at the ladder (M6.9.5: a proper
  // rail, and a way through it to the ladder)
  railing(box, [7 * S, z1], [lx - 0.55, z1], y, y);
  railing(box, [lx + 0.55, z1], [23 * S, z1], y, y);
  // and round its ends (M6.9.13, Rhys: railings all the way round, but at the ladder)
  railing(box, [7 * S + 0.05, z0], [7 * S + 0.05, z1], y, y);
  railing(box, [23 * S - 0.05, z0], [23 * S - 0.05, z1], y, y);
  drawLadder(box, lx, z1, [0, 1], 0, y, 'iron');
  level.world.addLadder([lx - 0.5, 0, z1], [lx + 0.5, y + 0.3, z1 + 0.8], [0, 1]);
  level.emergencyLadder = { x: lx, z: z1 + 0.4 };
}

// Hotel rooms (labels "Room nnn"), laid out from the door (M6.9.4-6). u runs
// from the wall across from the door (the bed's head) to the door's wall; v
// across. The bed, bedside tables and lamps, a painting over the bed; a
// television on a stand at the bed's foot, facing it; an en-suite in the
// corner at the end of the door's wall away from the door (toilet, basin,
// shower); the wardrobe beside it; a desk and chair; an armchair; a suitcase.
function bedrooms(box, rows, roomList, labels, doors, y0, holes) {
  const face = S / 2 - T / 2;
  // nothing stands in front of a hole in a wall (M6.9.11): a clear way through
  const clearOf = (holes || []).map((h) => (h.axis === 'x'
    ? [h.x * S - 0.1, (h.y - 0.4) * S, (h.x + 1) * S + 0.1, (h.y + 1.4) * S]
    : [(h.x - 0.4) * S, h.y * S - 0.1, (h.x + 1.4) * S, (h.y + 1) * S + 0.1]));
  const blocks = (a, b) => clearOf.some(([x0, z0, x1, z1]) => Math.max(a[0], b[0]) > x0 && Math.min(a[0], b[0]) < x1 && Math.max(a[1], b[1]) > z0 && Math.min(a[1], b[1]) < z1);
  for (const [text, , lx, ly] of labels) {
    if (!/^Room \d+/.test(text)) continue;
    const room = roomList.find((cells) => cells.some(([x, y]) => x === lx && y === ly));
    if (!room) continue;
    const xs = room.map((p) => p[0]), ys = room.map((p) => p[1]);
    const mnX = Math.min(...xs), mxX = Math.max(...xs), mnY = Math.min(...ys), mxY = Math.max(...ys);
    const rx0 = mnX * S - face, rx1 = (mxX + 1) * S + face, rz0 = mnY * S - face, rz1 = (mxY + 1) * S + face;
    const inRoom = new Set(room.map((p) => p.join(',')));
    const door = doors.find((d) => d.cells.some(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => inRoom.has((x + dx) + ',' + (y + dy)))));
    if (!door) continue;
    const [dcx, dcy] = door.cells[0];
    const side = dcx > mxX ? 'E' : dcx < mnX ? 'W' : dcy > mxY ? 'S' : 'N';
    const ew = side === 'E' || side === 'W';
    const U = ew ? rx1 - rx0 : rz1 - rz0, V0 = ew ? rz1 - rz0 : rx1 - rx0;
    const vDoor0 = ew ? (dcy + door.cells.length / 2) * S - rz0 : (dcx + door.cells.length / 2) * S - rx0;
    // mirror v so the door is always toward high v: the en-suite and wardrobe go at low v
    const flip = vDoor0 < V0 / 2;
    const V = V0;
    const toW = (u, v0) => { const v = flip ? V - v0 : v0; return side === 'E' ? [rx0 + u, rz0 + v] : side === 'W' ? [rx1 - u, rz0 + v] : side === 'S' ? [rx0 + v, rz0 + u] : [rx0 + v, rz1 - u]; };
    const bx = (u0, v0, u1, v1, ya, yb, mat, opts) => {
      const p = toW(u0, v0), q = toW(u1, v1);
      if (mat !== 'plaster' && blocks(p, q)) return;
      return box([Math.min(p[0], q[0]), y0 + ya, Math.min(p[1], q[1])], [Math.max(p[0], q[0]), y0 + yb, Math.max(p[1], q[1])], mat, opts);
    };
    const vc = V / 2 + 0.5;                                                                        // the bed, a little toward the door's side
    // the bed
    bx(0.02, vc - 0.8, 2.12, vc + 0.8, 0, 0.42, 'wood');
    bx(0.06, vc - 0.76, 2.08, vc + 0.76, 0.42, 0.6, 'cloth', { solid: false });
    bx(0.0, vc - 0.84, 0.06, vc + 0.84, 0, 1.15, 'door', { solid: false });                        // headboard
    for (const k of [-0.38, 0.38]) bx(0.1, vc + k - 0.3, 0.5, vc + k + 0.3, 0.6, 0.72, 'cloth', { solid: false });
    bx(1.5, vc - 0.81, 2.13, vc + 0.81, 0.58, 0.63, 'fabric', { solid: false });                   // a red woollen throw across the foot
    for (const s2 of [-1, 1]) {
      const v = vc + s2 * 1.12;
      surface(bx(0.02, v - 0.24, 0.48, v + 0.24, 0, 0.55, 'wood'), 'bedside');
      bx(0.06, v + s2 * 0.08 - 0.07, 0.2, v + s2 * 0.08 + 0.07, 0.55, 0.85, 'lamp', { solid: false });   // (M6.13.1: to the back corner, room for a paper)
    }
    bx(0.0, vc - 0.62, 0.05, vc + 0.62, 1.38, 2.12, 'wood', { solid: false });                     // the painting's frame...
    bx(0.05, vc - 0.54, 0.06, vc + 0.54, 1.46, 2.04, 'painting', { solid: false, uv: 'fit' });    // ...and a landscape in it
    // the television: on a stand at the bed's foot, facing the bed
    const tu = 3.2;
    bx(tu, vc - 0.6, tu + 0.45, vc + 0.6, 0, 0.5, 'wood');
    bx(tu + 0.15, vc - 0.1, tu + 0.3, vc + 0.1, 0.5, 0.56, 'metal', { solid: false });
    bx(tu + 0.2, vc - 0.55, tu + 0.26, vc + 0.55, 0.56, 1.2, 'metal', { solid: false });           // its case
    bx(tu + 0.19, vc - 0.51, tu + 0.2, vc + 0.51, 0.6, 1.16, 'screen', { solid: false });          // its screen, toward the bed
    // the en-suite: the corner at the door's wall, low v. Its way in is at the
    // door's-wall end (M6.9.7: the shower stood right behind it); the shower
    // in the far corner, the basin on the inner wall, the toilet by the door's wall
    const eu = U - 2.4, ev = 2.3, gap0 = U - 1.25, gap1 = U - 0.35;
    bx(eu, 0, eu + 0.1, ev, 0, WALL_H, 'plaster');
    bx(eu, ev - 0.1, gap0, ev, 0, WALL_H, 'plaster');
    bx(gap1, ev - 0.1, U, ev, 0, WALL_H, 'plaster');
    bx(gap0, ev - 0.1, gap1, ev, 2.1, WALL_H, 'plaster');
    bx(eu + 0.1, 0.02, eu + 1.0, 0.95, 0, 0.06, 'pooltile', { solid: false });                   // the shower tray, far corner
    bx(eu + 1.0, 0.02, eu + 1.03, 0.95, 0.06, 2.0, 'glass', { glass: true });                     // its screen
    bx(eu + 0.1, 0.02, eu + 0.2, 0.12, 1.7, 2.0, 'metal', { solid: false });                     // its head
    bx(U - 0.62, 0.05, U - 0.05, 0.5, 0, 0.42, 'cloth');                                           // toilet, by the door's wall
    bx(U - 0.25, 0.05, U - 0.05, 0.5, 0.42, 0.85, 'cloth', { solid: false });
    bx(eu + 0.1, 1.35, eu + 0.55, 1.95, 0.8, 0.88, 'cloth');                                       // basin, on the inner wall
    bx(eu + 0.1, 1.45, eu + 0.12, 1.85, 1.0, 1.6, 'glass', { solid: false });                      // a mirror over it
    // the wardrobe: beside the en-suite, against the side wall
    bx(eu - 1.25, 0.02, eu - 0.05, 0.62, 0, 2.1, 'door');
    // the desk and chair, the low side toward the bed's head
    surface(bx(0.7, 0.02, 1.9, 0.62, 0.72, 0.76, 'wood'), 'desk');
    bx(0.75, 0.02, 0.8, 0.62, 0, 0.72, 'wood', { solid: false });
    bx(1.8, 0.02, 1.85, 0.62, 0, 0.72, 'wood', { solid: false });
    bx(0.85, 0.25, 0.97, 0.37, 0.76, 1.1, 'lamp', { solid: false });
    bx(1.08, 0.72, 1.52, 1.16, 0.42, 0.46, 'wood');
    bx(1.08, 0.72, 1.52, 1.16, 0, 0.42, 'wood', { render: false });
    // an armchair on the door's side, by the bed's head, and a suitcase by the wardrobe
    bx(0.3, V - 0.95, 1.1, V - 0.15, 0, 0.42, 'fabric');
    bx(0.3, V - 0.33, 1.1, V - 0.15, 0.42, 0.9, 'fabric', { solid: false });
    for (const au of [0.3, 0.94]) bx(au, V - 0.95, au + 0.16, V - 0.15, 0.42, 0.62, 'fabric', { solid: false });
    bx(eu - 1.9, 0.1, eu - 1.3, 0.35, 0, 0.45, 'metal');
  }
}

// The lift (M6.9.8, Rhys's map: "Elevator (G, 1, 2)" at (21, 35), the lobby's
// south-east corner). A shaft the size of that square - its west and north
// walls on the square's edges, linings out to the lobby's own east and south
// walls - with a doorway facing west down the lobby on every floor. Inside
// the shaft stays within the square, so the floors above, cut only over this
// one square, never reach into it. The car, its doors and the landing doors
// move, so they are drawn as movers (render.js), not baked.
function buildLift(level, box, keys) {
  if (!keys.length) return;
  const x0s = LIFT_CELL.x * S, z0s = LIFT_CELL.y * S;               // the square's north-west corner
  const face = S / 2 - T / 2;
  const xE = (LIFT_CELL.x + 1) * S + face, zS = (LIFT_CELL.y + 1) * S + face;   // the lobby's east and south wall faces
  const wW = [x0s - T / 2, x0s + T / 2];                               // the shaft's west wall, on the square's edge
  const wN = [z0s - T / 2, z0s + T / 2];                               // and its north wall
  const inX1 = (LIFT_CELL.x + 1) * S - 0.02, inZ1 = (LIFT_CELL.y + 1) * S - 0.02;   // the inside stops at the square's edge
  const car = { x0: wW[1] + 0.12, x1: inX1 - 0.03, z0: wN[1] + 0.03, z1: inZ1 - 0.03 };
  const dz0 = (car.z0 + car.z1) / 2 - 0.45, dz1 = dz0 + 0.9;          // the doorway, 0.9 m, in the middle of the west wall
  const floors = keys.map((k) => ({ key: k, label: FLOOR_NAMES[k] || k, y: FLOORS[k] }));
  for (const f of floors) {
    const y = f.y, top = y + STOREY;
    box([wW[0], y, wN[0]], [wW[1], top, dz0], 'plaster');                // west wall, north of the doorway
    box([wW[0], y, dz1], [wW[1], top, zS], 'plaster');                   // and south of it
    box([wW[0], y + LIFT.doorH, dz0], [wW[1], top, dz1], 'plaster');     // over it
    box([wW[0], y, wN[0]], [xE, top, wN[1]], 'plaster');                 // north wall
    box([inX1, y, wN[0]], [xE, top, zS], 'plaster');                     // lining to the east wall
    box([wW[0], y, inZ1], [xE, top, zS], 'plaster');                     // lining to the south wall
    // on the landing: a steel frame round the doorway, the call button beside it, a sign over it
    box([wW[0] - 0.04, y, dz0 - 0.08], [wW[0], y + LIFT.doorH + 0.08, dz0], 'metal', { solid: false });
    box([wW[0] - 0.04, y, dz1], [wW[0], y + LIFT.doorH + 0.08, dz1 + 0.08], 'metal', { solid: false });
    box([wW[0] - 0.04, y + LIFT.doorH, dz0], [wW[0], y + LIFT.doorH + 0.08, dz1], 'metal', { solid: false });
    box([wW[0] - 0.03, y + 0.95, dz0 - 0.36], [wW[0], y + 1.25, dz0 - 0.2], 'metal', { solid: false });      // the call panel
    box([wW[0] - 0.045, y + 1.06, dz0 - 0.31], [wW[0] - 0.03, y + 1.14, dz0 - 0.25], 'lamp', { solid: false }); // its button
    level.signs.push({ pos: [wW[0] - 0.02, y + LIFT.doorH + 0.14, (dz0 + dz1) / 2], yaw: -Math.PI / 2, w: 0.8, h: 0.8 * 0.34, text: 'LIFT', sub: f.label, col: '#e8b423' });
  }
  const lift = new Lift(level.world, {
    ...car, floors,
    door: { x: wW[0] + 0.05, z0: dz0, z1: dz1 },
    panel: { x: car.x0 + 0.22, z: car.z0 + 0.03, y: 1.0 },
    call: { x: wW[0] - 0.04, z: dz0 - 0.28, dy: 1.1 },
  });
  level.lift = lift;
  // what moves, for drawing: the car (its walls, floor, ceiling, light,
  // handrail and buttons), its two door leaves, and two leaves on each landing
  const cp = [];
  const P = (min, max, mat, uv) => cp.push({ min, max, mat, uv: uv || 'world' });
  const { x0, x1, z0, z1 } = car, H = LIFT.roof;
  P([x0 - 0.1, -0.12, z0], [x1, 0.012, z1], 'wood');                                // the floor (a hair proud of the pit's concrete)
  P([x0 - 0.1, H, z0], [x1, H + 0.1, z1], 'metal');                                 // the ceiling
  P([(x0 + x1) / 2 - 0.35, H - 0.02, (z0 + z1) / 2 - 0.12], [(x0 + x1) / 2 + 0.35, H, (z0 + z1) / 2 + 0.12], 'lamp');
  P([x1, 0, z0], [x1 + 0.03, H, z1], 'metal');                                      // back wall
  P([x0 - 0.1, 0, z0 - 0.03], [x1 + 0.03, H, z0], 'metal');                         // side walls
  P([x0 - 0.1, 0, z1], [x1 + 0.03, H, z1 + 0.03], 'metal');
  P([x0 - 0.1, 0, z0], [x0 - 0.05, H, dz0], 'metal');                               // front, either side of the doors
  P([x0 - 0.1, 0, dz1], [x0 - 0.05, H, z1], 'metal');
  P([x0 - 0.1, LIFT.doorH, dz0], [x0 - 0.05, H, dz1], 'metal');
  P([x1 - 0.06, 0.9, z0 + 0.1], [x1, 0.94, z1 - 0.1], 'rail');                      // a handrail on the back wall
  P([x0 + 0.1, 0.85, z0], [x0 + 0.34, 0.85 + LIFT.buttonGap * floors.length + 0.1, z0 + 0.02], 'metal');   // the button panel
  const btn = lift.buttons();
  const buttonPieces = btn.map((b) => ({ min: [b.pos[0] - 0.035, b.pos[1] - lift.carY - 0.035, b.pos[2] - 0.01], max: [b.pos[0] + 0.035, b.pos[1] - lift.carY + 0.035, b.pos[2] + 0.01], mat: 'lamp', uv: 'world' }));
  level.movers = level.movers || [];
  level.movers.push({ id: 'lift_car', pieces: cp.concat(buttonPieces), at: () => [0, lift.drawY(lift.alpha), 0] });
  // the car's doors: two leaves, parting from the middle, riding with the car
  const half = (dz1 - dz0) / 2, dx = [wW[1] + 0.003, wW[1] + 0.018];    // between the shaft wall and the car's front
  level.movers.push({ id: 'lift_cardoor_n', pieces: [{ min: [dx[0], 0, dz0], max: [dx[1], LIFT.doorH, dz0 + half], mat: 'metal', uv: 'world' }], at: () => [0, lift.drawY(lift.alpha), -lift.doors * (half - 0.03)] });
  level.movers.push({ id: 'lift_cardoor_s', pieces: [{ min: [dx[0], 0, dz0 + half], max: [dx[1], LIFT.doorH, dz1], mat: 'metal', uv: 'world' }], at: () => [0, lift.drawY(lift.alpha), lift.doors * (half - 0.03)] });
  // each landing's doors, in the wall: they slide into it
  const lx = [wW[0] + 0.03, wW[0] + 0.09];
  floors.forEach((f, i) => {
    level.movers.push({ id: 'lift_door_' + f.key + '_n', pieces: [{ min: [lx[0], 0, dz0], max: [lx[1], LIFT.doorH, dz0 + half], mat: 'metal', uv: 'world' }], at: () => [0, f.y, -lift.leafOpen(i) * (half - 0.03)] });
    level.movers.push({ id: 'lift_door_' + f.key + '_s', pieces: [{ min: [lx[0], 0, dz0 + half], max: [lx[1], LIFT.doorH, dz1], mat: 'metal', uv: 'world' }], at: () => [0, f.y, lift.leafOpen(i) * (half - 0.03)] });
  });
}

// The Estate Room (107) as the hotel's best suite (M6.9.9, Rhys: "an extra
// posh hotel room - open plan, a bed area, a bathroom area, and an area with a
// safe"). The map's screen (its C squares) closes off the south-west corner:
// that is the bathroom, open to the room at its west end. North of the screen,
// by the window, the dressing area with the safe (where guard P6 stands). East
// of the entrance, the bedroom: a king bed against the east wall, a sofa and
// armchairs by the window, a TV on a sideboard facing the bed, a small table
// for two. The patrol loop (R6) along rows 8 and 10 is left walkable.
function estateSuite(level, box, roomList, labels, y0) {
  const lab = labels.find(([t]) => /^Estate Room/.test(t));
  if (!lab) return;
  const room = roomList.find((cells) => cells.some(([x, y]) => Math.abs(x - lab[2]) <= 1 && Math.abs(y - lab[3]) <= 1));
  if (!room) return;
  const face = S / 2 - T / 2;
  const xs = room.map((p) => p[0]), ys = room.map((p) => p[1]);
  const X0 = Math.min(...xs) * S - face, X1 = (Math.max(...xs) + 1) * S + face;     // its real wall faces
  const Z0 = Math.min(...ys) * S - face, Z1 = (Math.max(...ys) + 1) * S + face;
  const B = (x0, z0, x1, z1, ya, yb, mat, opts) => box([x0, y0 + ya, z0], [x1, y0 + yb, z1], mat, opts);
  const deco = { solid: false };
  // ── the bathroom: the corner behind the screen (the screen runs along row 9,
  // turning down to the entrance's west wall) ──
  const sx = 13.5 * S - 0.1;                                         // the entrance's west wall, the bathroom's east side
  // a double vanity on the west wall: marble top, two basins, a long mirror
  B(X0, Z1 - 2.2, X0 + 0.6, Z1 - 0.15, 0, 0.82, 'door');
  B(X0, Z1 - 2.22, X0 + 0.62, Z1 - 0.13, 0.82, 0.87, 'pooltile');
  for (const k of [0.6, 1.45]) {
    B(X0 + 0.15, Z1 - 0.15 - k - 0.25, X0 + 0.45, Z1 - 0.15 - k + 0.25, 0.86, 0.875, 'glass', deco);
    B(X0 + 0.05, Z1 - 0.15 - k - 0.02, X0 + 0.09, Z1 - 0.15 - k + 0.02, 0.87, 1.12, 'metal', deco);
  }
  B(X0, Z1 - 2.1, X0 + 0.02, Z1 - 0.25, 1.1, 1.95, 'glass', deco);
  // the WC on the south wall, then a freestanding roll-top bath with its taps
  B(X0 + 1.35, Z1 - 0.7, X0 + 1.85, Z1, 0, 0.42, 'cloth');
  B(X0 + 1.35, Z1 - 0.22, X0 + 1.85, Z1, 0.42, 0.85, 'cloth', deco);
  const bx0 = X0 + 2.6, bx1 = bx0 + 1.75, bz1 = Z1 - 0.2, bz0 = bz1 - 0.8;
  // a tub, not a block (M6.9.10, Rhys: it looked like tiles floating on it):
  // a white shell round a sunken inside, and still water part way up
  const r = 0.08;
  B(bx0, bz0, bx1, bz1, 0.08, 0.62, 'cloth', { render: false });                        // what you bump into
  B(bx0, bz0, bx1, bz1, 0.08, 0.3, 'cloth', deco);                                        // its base, the inside's floor on top
  B(bx0, bz0, bx1, bz0 + r, 0.3, 0.62, 'cloth', deco);                                    // its sides and ends
  B(bx0, bz1 - r, bx1, bz1, 0.3, 0.62, 'cloth', deco);
  B(bx0, bz0 + r, bx0 + r, bz1 - r, 0.3, 0.62, 'cloth', deco);
  B(bx1 - r, bz0 + r, bx1, bz1 - r, 0.3, 0.62, 'cloth', deco);
  B(bx0 - 0.02, bz0 - 0.02, bx1 + 0.02, bz0 + 0.03, 0.62, 0.65, 'cloth', deco);         // a rolled rim
  B(bx0 - 0.02, bz1 - 0.03, bx1 + 0.02, bz1 + 0.02, 0.62, 0.65, 'cloth', deco);
  B(bx0 - 0.02, bz0 + 0.03, bx0 + 0.03, bz1 - 0.03, 0.62, 0.65, 'cloth', deco);
  B(bx1 - 0.03, bz0 + 0.03, bx1 + 0.02, bz1 - 0.03, 0.62, 0.65, 'cloth', deco);
  for (const [px, pz] of [[bx0 + 0.1, bz0 + 0.1], [bx1 - 0.1, bz0 + 0.1], [bx0 + 0.1, bz1 - 0.1], [bx1 - 0.1, bz1 - 0.1]]) B(px - 0.05, pz - 0.05, px + 0.05, pz + 0.05, 0, 0.08, 'metal', deco);   // its feet
  B(bx0 + r, bz0 + r, bx1 - r, bz1 - r, 0.5, 0.505, 'glass', deco);                       // the water
  B(bx1 - 0.08, (bz0 + bz1) / 2 - 0.03, bx1 - 0.02, (bz0 + bz1) / 2 + 0.03, 0.62, 0.95, 'metal', deco);
  B(bx0 + 0.2, bz0 - 0.75, bx1 - 0.2, bz0 - 0.15, 0, 0.008, 'fabric', deco);              // a bath mat
  // a walk-in shower in the corner by the entrance wall: tray, glass, a rain head
  const shx = sx - 1.6, shz = Z1 - 1.5;
  B(shx, shz, sx, Z1, 0, 0.04, 'pooltile', deco);
  B(shx, shz, shx + 0.03, Z1, 0.04, 2.05, 'glass', { glass: true });
  B(shx, shz, shx + 0.8, shz + 0.03, 0.04, 2.05, 'glass', { glass: true });
  B(sx - 0.9, Z1 - 0.9, sx - 0.5, Z1 - 0.5, 2.15, 2.18, 'metal', deco);
  B(sx - 0.72, Z1 - 0.72, sx - 0.68, Z1 - 0.02, 2.18, 2.2, 'metal', deco);
  // ── the dressing area with the safe: by the window, north of the screen ──
  B(X0, Z0 + 0.1, X0 + 0.62, Z0 + 2.15, 0, 2.2, 'door');                                  // wardrobes along the west wall
  B(X0 + 0.62, Z0 + 1.1, X0 + 0.64, Z0 + 1.15, 0.05, 2.15, 'metal', deco);                 // where its doors meet
  // the safe (M6.9.13: it opens - the dial, or a charge): a steel box on a
  // plinth, hollow, its door facing the room on a hinge at the north side
  const sfz = Z0 + 2.3, sfx1 = X0 + 0.62;
  const safe = new Safe(level.safeCode || [0, 0, 0, 0]);
  B(X0, sfz, sfx1, sfz + 0.62, 0, 0.12, 'door');
  B(X0 + 0.02, sfz + 0.02, sfx1 - 0.02, sfz + 0.6, 0.12, 0.78, 'metal', { render: false });  // what you bump into
  B(X0 + 0.02, sfz + 0.02, X0 + 0.08, sfz + 0.6, 0.12, 0.78, 'metal', deco);                // back
  B(X0 + 0.02, sfz + 0.02, sfx1 - 0.02, sfz + 0.07, 0.12, 0.78, 'metal', deco);             // sides
  B(X0 + 0.02, sfz + 0.55, sfx1 - 0.02, sfz + 0.6, 0.12, 0.78, 'metal', deco);
  B(X0 + 0.02, sfz + 0.02, sfx1 - 0.02, sfz + 0.6, 0.72, 0.78, 'metal', deco);              // top
  B(X0 + 0.02, sfz + 0.02, sfx1 - 0.02, sfz + 0.6, 0.12, 0.18, 'metal', deco);              // floor
  B(X0 + 0.08, sfz + 0.07, X0 + 0.09, sfz + 0.55, 0.18, 0.72, 'concrete2', deco);           // its dark inside
  const dz0 = sfz + 0.06, dz1 = sfz + 0.56, dx0 = sfx1 - 0.02, dx1 = sfx1 + 0.03;
  const door = [{ min: [dx0, y0 + 0.16, dz0], max: [dx1, y0 + 0.74, dz1], mat: 'metal', uv: 'world' },
    { min: [dx1, y0 + 0.38, dz0 + 0.08], max: [dx1 + 0.04, y0 + 0.54, dz0 + 0.24], mat: 'asphalt', uv: 'world' },    // the dial
    { min: [dx1, y0 + 0.45, dz0 + 0.12], max: [dx1 + 0.05, y0 + 0.47, dz0 + 0.2], mat: 'lamp', uv: 'world' },        // its pointer
    { min: [dx1, y0 + 0.42, dz1 - 0.14], max: [dx1 + 0.06, y0 + 0.5, dz1 - 0.06], mat: 'metal', uv: 'world' }];      // the handle
  const swung = [{ min: [sfx1, y0 + 0.16, dz0 - 0.05], max: [sfx1 + 0.5, y0 + 0.74, dz0], mat: 'metal', uv: 'world' }];   // open, on its hinge
  const gone = [{ min: [sfx1 + 0.5, y0, dz0 + 0.1], max: [sfx1 + 1.08, y0 + 0.05, dz0 + 0.6], mat: 'metal', uv: 'world' }]; // blown off, on the floor
  const away = [0, -500, 0], here = [0, 0, 0];
  level.movers = level.movers || [];
  level.movers.push({ id: 'safe_door', pieces: door, at: () => (safe.open ? away : here) });
  level.movers.push({ id: 'safe_door_open', pieces: swung, at: () => (safe.open && !safe.blown ? here : away) });
  level.movers.push({ id: 'safe_door_blown', pieces: gone, at: () => (safe.blown ? here : away) });
  (level.safes = level.safes || []).push({ pos: [sfx1 + 0.45, y0, sfz + 0.31], face: [1, 0], room: 'estate_room', safe, inside: [X0 + 0.35, y0 + 0.18, sfz + 0.31] });
  // a writing desk at the window, its chair, a lamp
  const dx = X0 + 2.4;
  surface(B(dx, Z0 + 0.05, dx + 1.6, Z0 + 0.7, 0.72, 0.76, 'wood'), 'desk');
  for (const [px, pz] of [[dx + 0.05, Z0 + 0.1], [dx + 1.5, Z0 + 0.1], [dx + 0.05, Z0 + 0.6], [dx + 1.5, Z0 + 0.6]]) B(px, pz, px + 0.05, pz + 0.05, 0, 0.72, 'wood', deco);
  B(dx, Z0 + 0.05, dx + 1.6, Z0 + 0.7, 0, 0.72, 'wood', { render: false });
  B(dx + 0.2, Z0 + 0.2, dx + 0.32, Z0 + 0.32, 0.76, 1.15, 'lamp', deco);
  B(dx + 0.55, Z0 + 0.85, dx + 1.05, Z0 + 1.35, 0, 0.46, 'fabric');
  B(dx + 0.55, Z0 + 1.28, dx + 1.05, Z0 + 1.35, 0.46, 0.95, 'fabric', deco);
  // ── the bedroom: east of the entrance ──
  // a king bed, its head against the east wall in the middle of the room
  const bzc = (Z0 + Z1) / 2 - 0.05, kx1 = X1 - 0.02, kx0 = kx1 - 2.2;
  B(kx0, bzc - 1.05, kx1, bzc + 1.05, 0, 0.45, 'wood');
  B(kx0 + 0.04, bzc - 1.0, kx1 - 0.04, bzc + 1.0, 0.45, 0.68, 'cloth', deco);
  B(X1 - 0.14, bzc - 1.3, X1, bzc + 1.3, 0, 1.55, 'fabric', deco);                        // an upholstered headboard
  for (const k of [-0.6, -0.2, 0.2, 0.6]) B(kx1 - 0.6, bzc + k - 0.18, kx1 - 0.18, bzc + k + 0.18, 0.68, 0.82, 'cloth', deco);
  B(kx0 + 0.02, bzc - 1.02, kx0 + 0.65, bzc + 1.02, 0.66, 0.71, 'fabric', deco);           // a throw across the foot
  B(kx0 - 0.6, bzc - 0.75, kx0 - 0.15, bzc + 0.75, 0, 0.45, 'fabric');                     // a bench at the bed's foot
  for (const s2 of [-1, 1]) {
    const v = bzc + s2 * 1.4;
    surface(B(X1 - 0.55, v - 0.25, X1 - 0.05, v + 0.25, 0, 0.55, 'wood'), 'bedside');
    B(X1 - 0.36, v - 0.07, X1 - 0.24, v + 0.07, 0.55, 0.95, 'lamp', deco);
  }
  B(X1 - 0.05, bzc - 0.8, X1 - 0.01, bzc + 0.8, 1.7, 2.55, 'wood', deco);                 // a painting over the bed
  B(X1 - 0.06, bzc - 0.72, X1 - 0.05, bzc + 0.72, 1.78, 2.47, 'painting', { solid: false, uv: 'fit' });
  // the TV on a long sideboard, facing the bed across the room
  const tvx = kx0 - 3.0;
  B(tvx - 0.5, bzc - 0.9, tvx, bzc + 0.9, 0, 0.6, 'door');
  B(tvx - 0.52, bzc - 0.92, tvx + 0.02, bzc + 0.92, 0.6, 0.63, 'wood', deco);
  B(tvx - 0.3, bzc - 0.08, tvx - 0.2, bzc + 0.08, 0.63, 0.7, 'metal', deco);
  B(tvx - 0.28, bzc - 0.7, tvx - 0.22, bzc + 0.7, 0.7, 1.5, 'metal', deco);
  B(tvx - 0.22, bzc - 0.66, tvx - 0.21, bzc + 0.66, 0.74, 1.46, 'screen', deco);         // its screen, toward the bed
  // a sofa with its back to the window, a coffee table, an armchair each side, a floor lamp, a plant
  const lx = (tvx + X1) / 2 - 0.6;
  B(lx - 1.2, Z0 + 0.1, lx + 1.2, Z0 + 0.95, 0, 0.42, 'fabric');
  B(lx - 1.2, Z0 + 0.1, lx + 1.2, Z0 + 0.35, 0.42, 0.88, 'fabric', deco);
  for (const ax of [lx - 1.2, lx + 1.02]) B(ax, Z0 + 0.1, ax + 0.18, Z0 + 0.95, 0.42, 0.62, 'fabric', deco);
  surface(B(lx - 0.6, Z0 + 1.25, lx + 0.6, Z0 + 1.85, 0.38, 0.42, 'wood'), 'table');
  B(lx - 0.55, Z0 + 1.3, lx + 0.55, Z0 + 1.8, 0, 0.38, 'wood', { render: false });
  B(lx - 0.05, Z0 + 1.5, lx + 0.05, Z0 + 1.6, 0, 0.38, 'metal', deco);
  for (const ax of [lx - 2.25, lx + 1.45]) {
    B(ax, Z0 + 0.9, ax + 0.8, Z0 + 1.7, 0, 0.42, 'fabric');
    B(ax, Z0 + 0.9, ax + 0.8, Z0 + 1.1, 0.42, 0.9, 'fabric', deco);
  }
  B(X1 - 0.45, Z0 + 0.25, X1 - 0.4, Z0 + 0.3, 0, 1.55, 'metal', { noClimb: true });
  B(X1 - 0.58, Z0 + 0.12, X1 - 0.27, Z0 + 0.43, 1.45, 1.75, 'lamp', deco);
  const plant = (x, z) => { B(x - 0.22, z - 0.22, x + 0.22, z + 0.22, 0, 0.45, 'barrel'); B(x - 0.35, z - 0.35, x + 0.35, z + 0.35, 0.45, 1.3, 'hedge', deco); };
  plant(tvx - 2.0, Z0 + 0.4);
  plant(sx + 5.2, Z1 - 0.4);                                         // just inside, past the entrance's east wall
  // a small round table for two in the south-east corner
  const tx = X1 - 1.4, tz = Z1 - 1.1;
  surface(B(tx - 0.45, tz - 0.45, tx + 0.45, tz + 0.45, 0.72, 0.76, 'wood'), 'table');
  B(tx - 0.06, tz - 0.06, tx + 0.06, tz + 0.06, 0, 0.72, 'wood');
  for (const s2 of [-1, 1]) {
    const cx = tx + s2 * 0.75;
    B(cx - 0.22, tz - 0.22, cx + 0.22, tz + 0.22, 0, 0.46, 'fabric');
    B(s2 > 0 ? cx + 0.17 : cx - 0.22, tz - 0.22, s2 > 0 ? cx + 0.22 : cx - 0.17, tz + 0.22, 0.46, 0.95, 'fabric', deco);
  }
  // a drinks cabinet on the south wall by the entrance, a tray of bottles on it
  const cx0 = sx + 5.95;
  B(cx0, Z1 - 0.5, cx0 + 1.3, Z1, 0, 0.95, 'door');
  for (let i = 0; i < 5; i++) B(cx0 + 0.2 + i * 0.2, Z1 - 0.3, cx0 + 0.28 + i * 0.2, Z1 - 0.22, 0.95, 1.2 + (i % 2) * 0.06, i % 2 ? 'glass' : 'barrel', deco);
}

// A hole blown through a wall (M6.9.11): the map leaves the whole square
// open; the wall comes back to a ragged gap about a metre and a quarter wide
// and two high, with broken edges, scorching and rubble on both sides.
function blownHole(box, h, y0) {
  const ew = h.axis === 'x';                                           // the wall runs east-west
  const a0 = (ew ? h.x : h.y) * S, a1 = a0 + S;                        // along the wall
  const c0 = ((ew ? h.y : h.x) + 0.5) * S;                             // the wall's line
  const P = (u0, u1, ya, yb, v0, v1, mat, opts) => box(ew ? [u0, y0 + ya, c0 + v0] : [c0 + v0, y0 + ya, u0], ew ? [u1, y0 + yb, c0 + v1] : [c0 + v1, y0 + yb, u1], mat, opts);
  const t = T / 2;
  // the wall back from the posts either side to the hole's square
  P(a0 - S / 2 + t, a0, 0, WALL_H, -t, t, 'plaster');
  P(a1, a1 + S / 2 - t, 0, WALL_H, -t, t, 'plaster');
  // ragged edges: broken bands of wall reaching in by different amounts
  const bands = [[0, 0.5, 0.18, 0.1], [0.5, 1.1, 0.1, 0.22], [1.1, 1.7, 0.2, 0.12], [1.7, 2.2, 0.14, 0.26]];
  for (const [ya, yb, l, r] of bands) {
    P(a0, a0 + l, ya, yb, -t, t, 'plaster');
    P(a1 - r, a1, ya, yb, -t, t, 'plaster');
  }
  // over the hole: the wall comes down to a broken edge
  const tops = [[0, 0.3, 2.05], [0.3, 0.7, 2.3], [0.7, 1.05, 2.15], [1.05, 1.5, 2.0]];
  for (const [u0, u1, yb] of tops) P(a0 + u0, a0 + u1, yb, WALL_H, -t, t, 'plaster');
  // scorch round it on both faces, and on the floor
  for (const s2 of [-1, 1]) {
    const v0 = s2 > 0 ? t : -t - 0.006, v1 = s2 > 0 ? t + 0.006 : -t;
    P(a0 - 0.35, a0 + 0.2, 0.1, 2.5, v0, v1, 'asphalt', { solid: false });
    P(a1 - 0.25, a1 + 0.35, 0.1, 2.6, v0, v1, 'asphalt', { solid: false });
    P(a0 - 0.2, a1 + 0.2, 2.25, 2.75, v0, v1, 'asphalt', { solid: false });
    P(a0 - 0.2, a1 + 0.2, 0.02, 0.025, s2 > 0 ? t : -1.2, s2 > 0 ? 1.2 : -t, 'asphalt', { solid: false });
  }
  // bent bars sticking out of the edges
  for (const [u, y, d] of [[a0 + 0.18, 0.9, 0.3], [a1 - 0.22, 1.5, -0.25], [a0 + 0.25, 2.1, 0.2]]) P(Math.min(u, u + d), Math.max(u, u + d), y, y + 0.02, -0.01, 0.01, 'metal', { solid: false });
  // rubble: chunks of wall on the floor either side (low, so you walk over it)
  let seed = h.x * 31 + h.y * 17 + 3;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1, w = 0.06 + rnd() * 0.22, d = 0.06 + rnd() * 0.2, hh = 0.03 + rnd() * 0.12;
    const u = a0 - 0.3 + rnd() * (S + 0.6), v = side * (t + 0.05 + rnd() * 1.0);
    P(u, u + w, 0.02, 0.02 + hh, v, v + d, rnd() < 0.6 ? 'plaster' : 'concrete2', { solid: false });
  }
}

// The second floor's particular things (M6.9.11): the Room 207 key on the
// desk in Room 201 and the Balcony Suite's doors it opens; the lift's
// emergency stop in the room behind the lobby; the Balcony Suite itself.
function secondFloorThings(level, box, f2) {
  const y0 = FLOORS[2], labels = MAP.labels.filter(([, fl]) => fl === '2');
  const mid = (i) => (i + 0.5) * S;
  const suite = f2.rooms.find((cells) => cells.some(([x, y]) => x === 14 && y === 11));
  // ── the key: on the desk nearest the map's K ──
  // (M6.9.13, Rhys: it goes in the safe - the Estate Room's, on the first floor)
  const estateSafe = (level.safes || []).find((sf) => sf.room === 'estate_room');
  if (estateSafe) {
    const pos = estateSafe.inside;
    const key = { id: 'room_207', label: 'Room 207 key', pos, taken: false, safe: estateSafe.safe };
    (level.keys = level.keys || []).push(key);
    level.movers = level.movers || [];
    level.movers.push({ id: 'key_room_207', at: () => (key.taken ? [0, -500, 0] : [0, 0, 0]), pieces: [
      { min: [pos[0] - 0.05, pos[1], pos[2] - 0.035], max: [pos[0] + 0.05, pos[1] + 0.012, pos[2] + 0.035], mat: 'fabric', uv: 'world' },
      { min: [pos[0] + 0.05, pos[1], pos[2] - 0.008], max: [pos[0] + 0.14, pos[1] + 0.008, pos[2] + 0.008], mat: 'metal', uv: 'world' },
    ] });
  }
  // ── the Balcony Suite's reinforced doors take the key ──
  if (suite) {
    const inSuite = new Set(suite.map((p) => p.join(',')));
    for (const d of f2.doors) {
      if (d.code !== 'R' || !d.cells.some(([x, y]) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => inSuite.has((x + dx) + ',' + (y + dy))))) continue;
      const pair = d.cells.length === 2 ? '2:' + d.cells[0].join(',') : null;
      for (const sd of level.swingDoors) {
        if (sd.def.y0 !== y0) continue;
        if (pair ? sd.def.pair === pair : Math.abs(sd.centre[0] - mid(d.cells[0][0])) < 0.8 && Math.abs(sd.centre[2] - mid(d.cells[0][1])) < 0.8) { sd.needs = 'room_207'; sd.def.label = 'Balcony Suite door'; }
      }
    }
  }
  // ── the lift's emergency stop: a red button on a yellow box, on the wall ──
  const stopLab = labels.find(([t]) => /Emergency STOP/i.test(t));
  if (stopLab && level.lift) {
    const sx = mid(stopLab[2]), wallZ = (stopLab[3] - 0.5) * S + T / 2;   // the wall behind it, to the north
    box([sx - 0.2, y0 + 1.0, wallZ], [sx + 0.2, y0 + 1.5, wallZ + 0.12], 'metal');
    box([sx - 0.18, y0 + 1.02, wallZ + 0.12], [sx + 0.18, y0 + 1.48, wallZ + 0.125], 'lamp', { solid: false });
    box([sx - 0.07, y0 + 1.18, wallZ + 0.125], [sx + 0.07, y0 + 1.32, wallZ + 0.2], 'fabric', { solid: false });
    level.signs.push({ pos: [sx, y0 + 1.75, wallZ + 0.02], yaw: 0, w: 0.7, h: 0.24, text: 'LIFT STOP', sub: 'Emergency only', col: '#d02020' });
    level.liftStop = { pos: [sx, y0, wallZ + 0.6] };
    // (M6.10.1, Rhys) the reds have stopped the lift: it is out of service
    // until you find this button and reset it - a way to bring hostages down
    level.lift.setStopped(true);
    // lift machinery along the room: cabinets and a motor housing
    box([sx - 2.6, y0, wallZ], [sx - 0.8, y0 + 1.9, wallZ + 0.6], 'metal');
    box([sx - 5.2, y0, wallZ], [sx - 3.2, y0 + 1.2, wallZ + 0.9], 'metal');
  }
  if (suite) balconySuite(level, box, suite, y0);
}

// The Balcony Suite (Room 207, M6.9.11): the bedroom east of its entrance, a
// lounge west of it by the windows (the square at the west end left for the
// stairs up to the floor above, to come), and the balcony: decked, open to
// the sky, with loungers, a table for two and planters. The way from the
// doors through to the balcony is kept clear.
function balconySuite(level, box, suite, y0) {
  const face = S / 2 - T / 2;
  const xs = suite.map((p) => p[0]), ys = suite.filter((p) => p[1] >= 9).map((p) => p[1]);
  const X0 = Math.min(...xs) * S - face, X1 = (Math.max(...xs) + 1) * S + face;
  const Z0 = 9 * S - face, Z1 = (Math.max(...ys) + 1) * S + face;          // the room behind the front wall
  const B = (x0, z0, x1, z1, ya, yb, mat, opts) => box([x0, y0 + ya, z0], [x1, y0 + yb, z1], mat, opts);
  const deco = { solid: false };
  // the bedroom: a king bed against the east wall
  const bzc = (Z0 + Z1) / 2, kx1 = X1 - 0.02, kx0 = kx1 - 2.2;
  B(kx0, bzc - 1.05, kx1, bzc + 1.05, 0, 0.45, 'wood');
  B(kx0 + 0.04, bzc - 1.0, kx1 - 0.04, bzc + 1.0, 0.45, 0.68, 'cloth', deco);
  B(X1 - 0.14, bzc - 1.3, X1, bzc + 1.3, 0, 1.6, 'door', deco);
  for (const k of [-0.6, -0.2, 0.2, 0.6]) B(kx1 - 0.6, bzc + k - 0.18, kx1 - 0.18, bzc + k + 0.18, 0.68, 0.82, 'cloth', deco);
  B(kx0 + 0.02, bzc - 1.02, kx0 + 0.65, bzc + 1.02, 0.66, 0.71, 'fabric', deco);
  for (const s2 of [-1, 1]) { const v = bzc + s2 * 1.4; surface(B(X1 - 0.55, v - 0.25, X1 - 0.05, v + 0.25, 0, 0.55, 'wood'), 'bedside'); B(X1 - 0.36, v - 0.07, X1 - 0.24, v + 0.07, 0.55, 0.95, 'lamp', deco); }
  B(X1 - 0.05, bzc - 0.7, X1 - 0.01, bzc + 0.7, 1.75, 2.5, 'wood', deco);
  B(X1 - 0.06, bzc - 0.62, X1 - 0.05, bzc + 0.62, 1.83, 2.42, 'painting', { solid: false, uv: 'fit' });
  const tvx = kx0 - 2.6;                                                   // a TV facing the bed
  B(tvx - 0.45, bzc - 0.8, tvx, bzc + 0.8, 0, 0.55, 'door');
  B(tvx - 0.26, bzc - 0.65, tvx - 0.2, bzc + 0.65, 0.6, 1.35, 'metal', deco);
  B(tvx - 0.2, bzc - 0.61, tvx - 0.19, bzc + 0.61, 0.64, 1.31, 'screen', deco);
  // the lounge, west of the entrance: a sofa facing the windows, a coffee table, armchairs
  // (M6.9.20: north of the stairs up, which run along the south wall)
  const lx = X0 + 3.4;
  B(lx - 1.1, Z0 + 2.2, lx + 1.1, Z0 + 3.0, 0, 0.42, 'fabric');
  B(lx - 1.1, Z0 + 2.8, lx + 1.1, Z0 + 3.0, 0.42, 0.88, 'fabric', deco);
  surface(B(lx - 0.55, Z0 + 1.0, lx + 0.55, Z0 + 1.6, 0.38, 0.42, 'wood'), 'table');
  B(lx - 0.5, Z0 + 1.05, lx + 0.5, Z0 + 1.55, 0, 0.38, 'wood', { render: false });
  for (const ax of [lx - 2.0, lx + 1.25]) { B(ax, Z0 + 0.95, ax + 0.75, Z0 + 1.7, 0, 0.42, 'fabric'); B(ax + (ax < lx ? 0 : 0.55), Z0 + 0.95, ax + (ax < lx ? 0.2 : 0.75), Z0 + 1.7, 0.42, 0.9, 'fabric', deco); }
  // ── the balcony ──
  const bz0 = 7 * S + 0.05, bz1 = 8 * S - 0.15;
  for (const ux of [X0 + 1.0, X0 + 3.0]) {                                 // two loungers, west of the doors
    B(ux, bz0 + 0.1, ux + 0.7, bz0 + 1.25, 0, 0.3, 'wood');
    B(ux + 0.03, bz0 + 0.12, ux + 0.67, bz0 + 1.23, 0.3, 0.38, 'cloth', deco);
    B(ux + 0.03, bz0 + 1.0, ux + 0.67, bz0 + 1.23, 0.38, 0.8, 'cloth', deco);                // backs to the room: facing out (M6.9.13)
  }
  const tx = X1 - 3.0, tz = (bz0 + bz1) / 2;                               // a table for two, east of the doors
  B(tx - 0.35, tz - 0.35, tx + 0.35, tz + 0.35, 0.7, 0.73, 'glass', { glass: true });
  B(tx - 0.04, tz - 0.04, tx + 0.04, tz + 0.04, 0, 0.7, 'metal');
  for (const s2 of [-1, 1]) { const cx = tx + s2 * 0.7; B(cx - 0.22, tz - 0.22, cx + 0.22, tz + 0.22, 0, 0.45, 'metal'); B(s2 > 0 ? cx + 0.18 : cx - 0.22, tz - 0.22, s2 > 0 ? cx + 0.22 : cx - 0.18, tz + 0.22, 0.45, 0.9, 'metal', deco); }
  for (const px of [X0 + 0.35, X1 - 0.35, X1 - 1.4]) {                     // planters along the rail
    B(px - 0.3, bz0 + 0.05, px + 0.3, bz0 + 0.5, 0, 0.5, 'concrete2');
    B(px - 0.35, bz0 + 0.02, px + 0.35, bz0 + 0.55, 0.5, 1.05, 'hedge', deco);
  }
}

// The stairs from the Balcony Suite (207) up to the floor above (M6.9.20). The
// map gives one square ("S" at (9, 11)) on each floor; a stair that fits a
// person needs more, so it is one straight flight along the suite's south
// wall, row 11, from the west end (stepped on to from the room's side) up
// eastwards, arriving on the third floor at the end of its opening. Flights
// are slabs with an underside, like the main stairs above the ground.
export const SUITE_STAIR = { x0: 13.0, x1: 19.5, z0: 16.55, z1: 17.95, n: 24, foot: 4, footZ0: 15.0 };
function suiteStairs(level, box) {
  // (M6.9.21, Rhys: the foot swung round) four steps come up out of the room,
  // going south, to a landing in the corner; the flight then turns east along
  // the wall. You step on from the room, not tight against the west wall.
  const { x0, x1, z0, z1, n, foot, footZ0 } = SUITE_STAIR, y0 = FLOORS[2], rise = STOREY / n;
  const fx1 = x0 + (z1 - z0);                                        // the landing is square
  const frun = (z0 - footZ0) / foot;
  for (let i = 0; i < foot; i++) {
    const top = y0 + rise * (i + 1);
    box([x0, y0, footZ0 + frun * i], [fx1, top, footZ0 + frun * (i + 1)], 'wood');
  }
  const yLand = y0 + rise * (foot + 1);
  const zw = 12 * S + (S / 2 - T / 2) - 0.02;                       // right back to the wall: no gap behind it
  box([x0, Math.max(y0, yLand - 0.35), z0], [fx1, yLand, zw], 'wood');                      // the landing
  box([x0, y0, z0], [fx1, Math.max(y0, yLand - 0.35), zw], 'plaster', { noClimb: true });      // closed in under it
  const rest = n - foot - 1, run = (x1 - fx1) / rest;
  for (let i = 0; i < rest; i++) {
    const top = yLand + rise * (i + 1);
    box([fx1 + run * i, Math.max(y0, top - 0.35), z0], [fx1 + run * (i + 1), top, z1], 'wood');
  }
  // railings: up the foot's open side, then up the flight's room side
  railing(box, [fx1 + 0.05, footZ0 + frun], [fx1 + 0.05, z0], y0 + rise * 2, yLand);
  railing(box, [fx1, z0 - 0.05], [x1, z0 - 0.05], yLand, y0 + STOREY);
  // a handrail on the wall side, all the way up (nobody drops behind the flight)
  railing(box, [fx1, z1 + 0.05], [x1, z1 + 0.05], yLand, y0 + STOREY);
  // upstairs: railed round the opening but at the top of the flight
  const y3 = FLOORS[3], hx0 = 9 * S, hx1 = 13 * S, hz0 = 11 * S, hz1 = 12 * S;
  // (just outside the opening, on the floor - not over the flight, where heads come up)
  railing(box, [8 * S + S / 2 - T / 2 + 0.05, hz0 - 0.06], [hx1, hz0 - 0.06], y3, y3);
  railing(box, [8 * S + S / 2 - T / 2 + 0.05, hz1 + 0.06], [hx1, hz1 + 0.06], y3, y3);
  railing(box, [hx0 - 0.05, hz0], [hx0 - 0.05, hz1], y3, y3);
  level.stairs = level.stairs || [];
  level.stairs.push({ y0, x0, x1, z0, z1 });
}

// The third floor: the Upper Balcony Suite (Room 207's upper floor, M6.9.20),
// built from Rhys's map - the Empress bed (a four-poster) against the west
// wall, the kitchenette (a counter with sink and hob, a breakfast bar with
// stools - the Roof key lies on it), the long dining table, the corner sofa,
// the balcony with its loungers and planters. The reinforced door at the back
// leads to the way up to the roof, and takes the Roof key.
function penthouse(level, box, f3) {
  const y0 = FLOORS[3];
  const B = (x0, z0, x1, z1, ya, yb, mat, opts) => box([x0, y0 + ya, z0], [x1, y0 + yb, z1], mat, opts);
  const deco = { solid: false };
  const W0 = 7 * S + S / 2 + T / 2;                                     // the west wall's face (rows 13-35)
  // ── the Empress bed: a four-poster, its head to the west wall (C rows 14-15) ──
  const bx0 = W0 + 0.05, bx1 = bx0 + 2.9, bz0 = 14 * S + 0.1, bz1 = 16 * S - 0.1;
  B(bx0, bz0, bx1, bz1, 0, 0.45, 'wood');
  B(bx0 + 0.05, bz0 + 0.05, bx1 - 0.05, bz1 - 0.05, 0.45, 0.72, 'cloth', deco);
  B(bx0, bz0 - 0.1, bx0 + 0.15, bz1 + 0.1, 0, 1.7, 'fabric', deco);                    // a tall padded headboard
  for (const k of [0.4, 0.95, 1.5, 2.05, 2.6]) B(bx0 + 0.2, bz0 + k - 0.2, bx0 + 0.65, bz0 + k + 0.2, 0.72, 0.88, 'cloth', deco);
  B(bx1 - 0.8, bz0 + 0.02, bx1 - 0.02, bz1 - 0.02, 0.7, 0.76, 'fabric', deco);          // a throw
  for (const [px, pz] of [[bx0, bz0], [bx1 - 0.12, bz0], [bx0, bz1 - 0.12], [bx1 - 0.12, bz1 - 0.12]]) B(px, pz, px + 0.12, pz + 0.12, 0, 2.5, 'wood');   // the posts
  B(bx0, bz0, bx1, bz0 + 0.1, 2.4, 2.5, 'wood', deco); B(bx0, bz1 - 0.1, bx1, bz1, 2.4, 2.5, 'wood', deco);
  B(bx1 - 0.1, bz0, bx1, bz1, 2.4, 2.5, 'wood', deco);
  B(bx0, bz0, bx1, bz1, 2.48, 2.5, 'fabric', deco);                                    // the canopy
  for (const z of [bz0 - 0.55, bz1 + 0.05]) { surface(B(bx0 + 0.02, z, bx0 + 0.52, z + 0.5, 0, 0.6, 'wood'), 'bedside'); B(bx0 + 0.2, z + 0.18, bx0 + 0.34, z + 0.32, 0.6, 1.0, 'lamp', deco); }
  // ── the kitchenette: a counter (C row 22), a breakfast bar (C row 26) ──
  const cz0 = 22 * S + 0.3, cz1 = cz0 + 0.75, cx1 = 12 * S;
  B(W0 + 0.05, cz0, cx1, cz1, 0, 0.88, 'door');
  B(W0 + 0.03, cz0 - 0.02, cx1 + 0.02, cz1 + 0.02, 0.88, 0.92, 'pooltile');
  B(W0 + 0.05, cz0, W0 + 0.85, cz1, 0.92, 2.1, 'metal');                               // a tall fridge at the wall end
  B(W0 + 1.6, cz0 + 0.15, W0 + 2.3, cz1 - 0.15, 0.905, 0.925, 'glass', deco);          // the sink
  // its tap, behind it, the spout reaching out over the bowl (M6.9.21, Rhys:
  // it looked disconnected from the sink)
  B(W0 + 1.92, cz0 + 0.05, W0 + 1.98, cz0 + 0.12, 0.92, 1.22, 'metal', deco);
  B(W0 + 1.92, cz0 + 0.05, W0 + 1.98, cz0 + 0.36, 1.17, 1.22, 'metal', deco);
  B(W0 + 1.925, cz0 + 0.31, W0 + 1.975, cz0 + 0.36, 1.1, 1.17, 'metal', deco);
  B(W0 + 3.2, cz0 + 0.1, W0 + 3.9, cz1 - 0.1, 0.92, 0.935, 'asphalt', deco);           // the hob
  const iz0 = 26 * S + 0.3, iz1 = iz0 + 0.8;
  B(W0 + 0.6, iz0, cx1, iz1, 0, 0.95, 'door');
  B(W0 + 0.55, iz0 - 0.05, cx1 + 0.05, iz1 + 0.05, 0.95, 1.0, 'pooltile');
  for (let x = W0 + 1.1; x < cx1 - 0.3; x += 0.9) { B(x - 0.18, iz1 + 0.25, x + 0.18, iz1 + 0.61, 0.62, 0.68, 'fabric'); B(x - 0.03, iz1 + 0.4, x + 0.03, iz1 + 0.46, 0, 0.62, 'metal'); }
  // the Roof key, on the bar near its west end (the map's K)
  const kpos = [W0 + 1.2, y0 + 1.0, (iz0 + iz1) / 2];
  const key = { id: 'roof', label: 'Roof key', pos: kpos, taken: false };
  (level.keys = level.keys || []).push(key);
  level.movers = level.movers || [];
  level.movers.push({ id: 'key_roof', at: () => (key.taken ? [0, -500, 0] : [0, 0, 0]), pieces: [
    { min: [kpos[0] - 0.05, kpos[1], kpos[2] - 0.035], max: [kpos[0] + 0.05, kpos[1] + 0.012, kpos[2] + 0.035], mat: 'cloth', uv: 'world' },
    { min: [kpos[0] + 0.05, kpos[1], kpos[2] - 0.008], max: [kpos[0] + 0.14, kpos[1] + 0.008, kpos[2] + 0.008], mat: 'metal', uv: 'world' },
  ] });
  // ── the dining table (C x 16-18, rows 21-27): long enough for sixteen ──
  const tcx = 17.5 * S, tz0 = 21 * S + 0.4, tz1 = 28 * S - 0.4;
  B(tcx - 0.7, tz0, tcx + 0.7, tz1, 0.72, 0.77, 'wood');
  surface(B(tcx - 0.66, tz0 + 0.04, tcx + 0.66, tz1 - 0.04, 0.77, 0.775, 'cloth', deco), 'table');
  for (const z of [tz0 + 0.3, (tz0 + tz1) / 2, tz1 - 0.3]) B(tcx - 0.08, z - 0.08, tcx + 0.08, z + 0.08, 0, 0.72, 'wood');
  for (let z = tz0 + 0.6; z < tz1 - 0.4; z += 1.15) for (const sd of [-1, 1]) {
    const cx = tcx + sd * 1.0;
    B(cx - 0.22, z - 0.22, cx + 0.22, z + 0.22, 0, 0.46, 'fabric');
    B(sd > 0 ? cx + 0.17 : cx - 0.22, z - 0.22, sd > 0 ? cx + 0.22 : cx - 0.17, z + 0.22, 0.46, 1.05, 'fabric', deco);
  }
  for (const [z, dz] of [[tz0 - 0.45, -1], [tz1 + 0.45, 1]]) { B(tcx - 0.22, z - 0.22, tcx + 0.22, z + 0.22, 0, 0.46, 'fabric'); B(tcx - 0.22, dz > 0 ? z + 0.17 : z - 0.22, tcx + 0.22, dz > 0 ? z + 0.22 : z - 0.17, 0.46, 1.1, 'fabric', deco); }
  // ── the corner sofa (C column 9 rows 30-33, row 33 x 9-12), facing into the room ──
  const sx0 = 9 * S + 0.1, sz1 = 34 * S - 0.1;
  B(sx0, 30 * S + 0.1, sx0 + 0.95, sz1, 0, 0.42, 'fabric');
  B(sx0, 30 * S + 0.1, sx0 + 0.25, sz1, 0.42, 0.9, 'fabric', deco);
  B(sx0, sz1 - 0.95, 13 * S - 0.1, sz1, 0, 0.42, 'fabric');
  B(sx0, sz1 - 0.25, 13 * S - 0.1, sz1, 0.42, 0.9, 'fabric', deco);
  B(sx0 + 2.0, 31 * S, sx0 + 3.6, 32 * S, 0.36, 0.4, 'glass', { glass: true });
  B(sx0 + 2.6, 31 * S + 0.6, sx0 + 3.0, 32 * S - 0.6, 0, 0.36, 'metal');
  B(sx0 + 1.1, 30 * S + 0.5, sx0 + 4.4, sz1 - 1.1, 0, 0.01, 'fabric', deco);           // a rug
  // plants by the long window
  const E0 = 22 * S + S / 2 - T / 2;
  for (const z of [17 * S, 29 * S, 35 * S]) { B(E0 - 0.75, z, E0 - 0.25, z + 0.5, 0, 0.5, 'barrel'); B(E0 - 0.85, z - 0.1, E0 - 0.15, z + 0.6, 0.5, 1.4, 'hedge', deco); }
  // ── the balcony (row 9): loungers facing out, planters ──
  const pz0 = 9 * S + 0.05;
  for (const ux of [10 * S, 11.2 * S, 18 * S]) {
    B(ux, pz0 + 0.1, ux + 0.7, pz0 + 1.25, 0, 0.3, 'wood');
    B(ux + 0.03, pz0 + 0.12, ux + 0.67, pz0 + 1.23, 0.3, 0.38, 'cloth', deco);
    B(ux + 0.03, pz0 + 1.0, ux + 0.67, pz0 + 1.23, 0.38, 0.8, 'cloth', deco);
  }
  for (const px of [9 * S + 0.4, 21 * S - 0.4]) { B(px - 0.3, pz0 + 0.05, px + 0.3, pz0 + 0.55, 0, 0.5, 'concrete2'); B(px - 0.35, pz0, px + 0.35, pz0 + 0.6, 0.5, 1.05, 'hedge', deco); }
  // ── the door to the roof's way up takes the Roof key ──
  for (const d of f3.doors) {
    if (d.code !== 'R') continue;
    for (const sd of level.swingDoors) if (sd.def.y0 === y0 && Math.abs(sd.centre[0] - (d.cells[0][0] + 0.5) * S) < 0.9 && Math.abs(sd.centre[2] - (d.cells[0][1] + 0.5) * S) < 0.9) { sd.needs = 'roof'; sd.def.label = 'door to the roof'; }
  }
}

// The roof (M6.9.21, Rhys's map 'R'): over the third floor, a parapet round
// its edge (the C border, chest high, not to be climbed over), rooftop plant
// (the inner C: air-conditioning units and vents; the W: a screen wall), and
// the way up: a ladder in the third floor's back room, through a hatch, out
// on to the roof's little back extension. Beyond the north parapet the enemy
// helicopter hovers (the map's VV), rotors turning.
function buildRoof(level, box) {
  const rows = MAP.floors.R, y0 = FLOORS.R, c = (x, y) => cellAt(rows, x, y);
  const mid = (i) => (i + 0.5) * S, H = 1.05;
  // the roof's own squares: everything inside the border
  const roofSet = new Set();
  const insideRoof = (x, y) => roofSet.has(x + ',' + y);
  {
    const seen = new Set(), out = new Set(), q = [];
    const W = Math.max(...rows.map((r) => r.length)), Hh = rows.length;
    for (let x = -1; x <= W; x++) for (const y of [-1, Hh]) q.push([x, y]);
    for (let y = -1; y <= Hh; y++) for (const x of [-1, W]) q.push([x, y]);
    while (q.length) {
      const [x, y] = q.pop(), k = x + ',' + y;
      if (seen.has(k) || x < -1 || y < -1 || x > W || y > Hh) continue;
      seen.add(k);
      const ch = c(x, y);
      if (ch === 'C' || ch === 'A' || ch === 'W') continue;
      out.add(k);
      q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) if (!out.has(x + ',' + y)) roofSet.add(x + ',' + y);
  }
  const edge = new Set();
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
    const ch = c(x, y);
    if ((ch === 'C' || ch === 'A') && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !roofSet.has((x + dx) + ',' + (y + dy)))) edge.add(x + ',' + y);
  }
  // the helicopter's way in (M6.9.23, Rhys: the captain needs a way out to it):
  // no parapet on the north edge in front of the map's VV squares
  const vvx = new Set();
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) if (c(x, y) === 'V') vvx.add(x);
  // the parapet: right at the roof's outer edge, along each side of an edge
  // square that has outside beyond it (M6.9.22, Rhys: centred on the squares
  // like walls, it left too narrow a way past the top of the ladder)
  const PT = 0.3;
  for (const k of edge) {
    const [x, y] = k.split(',').map(Number), x0 = x * S, x1 = x0 + S, z0 = y * S, z1 = z0 + S;
    const out = (dx, dy) => !roofSet.has((x + dx) + ',' + (y + dy));
    const seg = (a, b) => {
      box([a[0], y0, a[1]], [b[0], y0 + H, b[1]], 'concrete2', { noClimb: true });
      box([a[0] - 0.03, y0 + H, a[1] - 0.03], [b[0] + 0.03, y0 + H + 0.05, b[1] + 0.03], 'concrete', { solid: false });   // its coping
    };
    if (out(0, -1) && !(vvx.has(x) && c(x, y - 1) === 'V')) seg([x0, z0], [x1, z0 + PT]);
    if (out(0, 1)) seg([x0, z1 - PT], [x1, z1]);
    if (out(-1, 0)) seg([x0, z0], [x0 + PT, z1]);
    if (out(1, 0)) seg([x1 - PT, z0], [x1, z1]);
  }
  // beyond the gap: the strip of roof over the third floor's front, railed at
  // its edge (it drops to the balcony) - where the rope ladder comes down
  if (vvx.size) {
    const sz0 = 10 * S, sz1 = 12 * S, sx0 = 8 * S, sx1 = 22 * S;
    railing(box, [sx0, sz0 + 0.08], [sx1, sz0 + 0.08], y0, y0);
    railing(box, [sx0 + 0.08, sz0], [sx0 + 0.08, sz1], y0, y0);
    railing(box, [sx1 - 0.08, sz0], [sx1 - 0.08, sz1], y0, y0);
  }
  // rooftop plant: air-conditioning units (the inner C), a screen wall (the W)
  const plant = [];
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) if (c(x, y) === 'C' && !edge.has(x + ',' + y) && roofSet.has(x + ',' + y)) plant.push([x, y]);
  for (const [x, y] of plant) {
    const x0 = x * S + 0.1, x1 = (x + 1) * S - 0.1, z0 = y * S + 0.15, z1 = (y + 1) * S - 0.15;
    surface(box([x0, y0, z0], [x1, y0 + 1.1, z1], 'metal'), 'ledge');                                           // (M6.13.1) something can lie on it
    box([x0 + 0.15, y0 + 1.1, z0 + 0.15], [x1 - 0.15, y0 + 1.12, z1 - 0.15], 'grating', { solid: false });        // the fan grille
    box([x0 - 0.02, y0 + 0.2, z0 + 0.1], [x0, y0 + 0.9, z1 - 0.1], 'grating', { solid: false });
  }
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
    if (c(x, y) !== 'W') continue;
    box([x * S, y0, mid(y) - 0.15], [(x + 1) * S, y0 + 2.2, mid(y) + 0.15], 'concrete2');
  }
  // ── the way up: a ladder on a steel frame in the back room, through the hatch ──
  const hx = mid(ROOF_HATCH.x), hz1 = (ROOF_HATCH.y + 1) * S;                // the hatch's south edge
  const y3 = FLOORS[3];
  box([hx - 0.45, y3, hz1], [hx + 0.45, y0 - 0.02, hz1 + 0.1], 'metal');                  // the frame it is fixed to
  drawLadder(box, hx, hz1, [0, -1], y3, y0 + 0.9, 'iron');
  level.world.addLadder([hx - 0.5, y3, hz1 - 0.8], [hx + 0.5, y0 + 0.3, hz1], [0, -1]);
  level.roofLadder = { x: hx, z: hz1 - 0.4 };
  // round the hatch on the roof: a steel curb, a rail on three sides (out to the south, at the ladder's top)
  const hx0 = ROOF_HATCH.x * S, hx1 = hx0 + S, hz0 = ROOF_HATCH.y * S;
  box([hx0 - 0.08, y0, hz0 - 0.08], [hx1 + 0.08, y0 + 0.12, hz0], 'metal', { solid: false });
  railing(box, [hx0 - 0.05, hz0], [hx0 - 0.05, hz1], y0, y0);
  railing(box, [hx1 + 0.05, hz0], [hx1 + 0.05, hz1], y0, y0);
  railing(box, [hx0, hz0 - 0.05], [hx1, hz0 - 0.05], y0, y0);
  // ── the enemy helicopter, hovering beyond the north parapet (the map's VV) ──
  const vv = [];
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) if (c(x, y) === 'V') vv.push([x, y]);
  if (vv.length) {
    const hcx = vv.reduce((a, q) => a + mid(q[0]), 0) / vv.length, hcz = vv.reduce((a, q) => a + mid(q[1]), 0) / vv.length - 1.4;
    const heli = { pos: [hcx, y0 + 3.2, hcz], t: 0 };
    level.helicopter = heli;
    const P = (min, max, mat) => ({ min, max, mat, uv: 'world' });
    const body = [
      P([-1.6, 0.45, -0.95], [1.6, 2.0, 0.95], 'asphalt'),                          // the cabin
      P([1.6, 0.65, -0.75], [2.5, 1.75, 0.75], 'asphalt'),                          // the nose
      P([1.62, 1.0, -0.72], [2.52, 1.7, 0.72], 'glass'),                            // its windscreen
      P([-1.0, 1.1, -0.97], [1.2, 1.75, -0.95], 'glass'), P([-1.0, 1.1, 0.95], [1.2, 1.75, 0.97], 'glass'),   // side windows
      P([-1.1, 2.0, -0.6], [0.8, 2.5, 0.6], 'asphalt'),                             // the engine housing
      P([-0.1, 2.5, -0.12], [0.1, 2.75, 0.12], 'metal'),                            // the mast
      P([-6.2, 1.2, -0.2], [-1.6, 1.6, 0.2], 'asphalt'),                            // the tail boom
      P([-6.2, 1.6, -0.08], [-5.6, 2.9, 0.08], 'asphalt'),                          // the fin
      P([-6.25, 2.0, 0.08], [-5.85, 2.4, 0.12], 'metal'),                           // the tail rotor
      P([-1.7, 0, -1.08], [1.9, 0.08, -0.98], 'metal'), P([-1.7, 0, 0.98], [1.9, 0.08, 1.08], 'metal'),         // the skids
      P([-1.0, 0.08, -1.05], [-0.9, 0.45, -0.95], 'metal'), P([0.9, 0.08, -1.05], [1.0, 0.45, -0.95], 'metal'),
      P([-1.0, 0.08, 0.95], [-0.9, 0.45, 1.05], 'metal'), P([0.9, 0.08, 0.95], [1.0, 0.45, 1.05], 'metal'),
      P([2.48, 0.7, -0.15], [2.56, 0.85, 0.15], 'lamp'),                             // its searchlight
    ];
    const rotor = [P([-5.2, -0.03, -0.14], [5.2, 0.03, 0.14], 'asphalt'), P([-0.14, -0.03, -5.2], [0.14, 0.03, 5.2], 'asphalt'), P([-0.25, -0.08, -0.25], [0.25, 0.06, 0.25], 'metal')];
    // a rope ladder from its open side down to the roof beyond the gap
    const lz = 1.15, ly1 = 0.45, ly0 = (y0 + 0.22) - heli.pos[1];
    body.push(P([-0.32, ly0, lz - 0.02], [-0.28, ly1, lz + 0.02], 'fabric'), P([0.28, ly0, lz - 0.02], [0.32, ly1, lz + 0.02], 'fabric'));
    for (let yy = ly0 + 0.15; yy < ly1; yy += 0.32) body.push(P([-0.3, yy, lz - 0.025], [0.3, yy + 0.04, lz + 0.025], 'wood'));
    body.push(P([-0.35, 0.4, 0.95], [0.35, 1.7, 0.97], 'asphalt'));                // its door, slid open (dark)
    const at = () => [heli.pos[0], heli.pos[1] + Math.sin(heli.t * 1.3) * 0.18, heli.pos[2]];
    level.movers = level.movers || [];
    level.movers.push({ id: 'heli_body', pieces: body, at });
    level.movers.push({ id: 'heli_rotor', pieces: rotor, at: () => { const a = at(); return [a[0], a[1] + 2.78, a[2]]; }, yaw: () => (heli.t * 1100) % 360 });
  }
}

// ── the basement and the sewer (M6.9.25, Rhys's 'B' floor) ─────────────────
// The map's B sheet lines up square for square with the floors above. The
// sewer runs north-south under the street and the hotel: a walkway on the west
// (a low wall along the channel's edge, with gaps), the channel (water flowing
// south), a wider walkway on the east. The access ladder (A, row 1) comes up
// through a manhole in the road, beside the Ghost jeep. At the south end, behind
// a locked door (L), the hotel's cellar: the stairs (S) come down into it from
// the bar. Everything hangs from the ground's slab: its underside is the
// ceiling down here.
export const SEWER = { floor: -3.6, bed: -4.5, water: -4.0 };              // walkway, channel bed, the water's surface
export const MANHOLE = { x: 7.5 * S, z0: 0.85, z1: 1.85, hw: 0.5 };         // the access ladder's shaft through the road
// the cellar stairs: a dog-leg in the bar's south-west corner, squares x 8-9,
// rows 27-29 - from the bar, down going south to a landing, back down going
// north into the cellar
export const CELLAR_STAIR = { xW: 8 * S - (S / 2 - T / 2), xE: 10 * S - 0.2, zN: 27 * S, zL: 29 * S, zS: 30 * S, n: 10 };
export const CELLAR_STAIR_CELLS = [];
for (let x = 7; x <= 9; x++) for (let y = 27; y <= 29; y++) CELLAR_STAIR_CELLS.push(x + ',' + y);

// The holes in the ground's slab: the manhole and the cellar stairs. (Pure.)
export function slabHoles() {
  const st = CELLAR_STAIR;
  return [
    { x0: MANHOLE.x - MANHOLE.hw, x1: MANHOLE.x + MANHOLE.hw, z0: MANHOLE.z0, z1: MANHOLE.z1 },
    { x0: st.xW, x1: st.xE, z0: st.zN, z1: st.zS },
  ];
}

// A flat slab [x0,z0]-[x1,z1] cut into rectangles that miss the holes. (Pure.)
export function slabPieces(x0, z0, x1, z1, holes) {
  const xs = [...new Set([x0, x1, ...holes.flatMap((h) => [h.x0, h.x1])])].filter((v) => v >= x0 && v <= x1).sort((a, b) => a - b);
  const zs = [...new Set([z0, z1, ...holes.flatMap((h) => [h.z0, h.z1])])].filter((v) => v >= z0 && v <= z1).sort((a, b) => a - b);
  const inHole = (cx, cz) => holes.some((h) => cx > h.x0 && cx < h.x1 && cz > h.z0 && cz < h.z1);
  const out = [];
  for (let j = 0; j < zs.length - 1; j++) {
    let i = 0;
    while (i < xs.length - 1) {
      if (inHole((xs[i] + xs[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2)) { i++; continue; }
      let e = i; while (e + 1 < xs.length - 1 && !inHole((xs[e + 1] + xs[e + 2]) / 2, (zs[j] + zs[j + 1]) / 2)) e++;
      out.push({ x0: xs[i], x1: xs[e + 1], z0: zs[j], z1: zs[j + 1] });
      i = e + 1;
    }
  }
  return out;
}

function buildBasement(level, box) {
  const rows = MAP.floors.B, c = (x, y) => cellAt(rows, x, y);
  const world = level.world, F = SEWER.floor, BED = SEWER.bed, WTR = SEWER.water, CEIL = -1;
  const mid = (i) => (i + 0.5) * S, face = S / 2 - T / 2;
  const H = rows.length, Wd = Math.max(...rows.map((r) => r.length));
  const isWater = (x, y) => c(x, y) === '~';
  const isWall = (x, y) => WALLISH.has(c(x, y));
  // what lies inside the outer walls (the map's border of W squares)
  const inside = insideMask(rows);
  const under = (x, y) => inside.has(x + ',' + y) || isWall(x, y);

  // the bed under it all, then the walkways raised on it; the channel is what is left
  box([4 * S, BED - 0.5, 0], [16 * S, BED, 32 * S], 'concrete2');
  for (let y = 0; y < H; y++) {
    let x = 0;
    while (x < Wd) {
      if (!under(x, y) || isWater(x, y)) { x++; continue; }
      let e = x; while (e + 1 < Wd && under(e + 1, y) && !isWater(e + 1, y)) e++;
      box([x * S, BED, y * S], [(e + 1) * S, F, (y + 1) * S], 'concrete');
      x = e + 1;
    }
  }
  // the water: runs of channel squares, joined down the rows where they line
  // up - one volume (and one surface) each, flowing south
  level.sewerWater = [];
  for (let y = 0; y < H; y++) {
    let x = 0;
    while (x < Wd) {
      if (!isWater(x, y)) { x++; continue; }
      let e = x; while (e + 1 < Wd && isWater(e + 1, y)) e++;
      const x0 = x * S, x1 = (e + 1) * S, z0 = y * S, z1 = (y + 1) * S;
      const prev = level.sewerWater.find((w) => w.x0 === x0 && w.x1 === x1 && Math.abs(w.z1 - z0) < 1e-6);
      if (prev) prev.z1 = z1; else level.sewerWater.push({ x0, x1, z0, z1 });
      x = e + 1;
    }
  }
  for (const w of level.sewerWater) {
    level.water.push({ x0: w.x0, x1: w.x1, z0: w.z0, z1: w.z1, y: WTR, flow: [0, 1], sewer: true });
    world.addWater([w.x0, BED, w.z0], [w.x1, WTR, w.z1]);
  }

  // the walls: thin, along the middle of their squares, joining their
  // neighbours (as upstairs), brick from the walkway up to the slab
  for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) {
    if (!isWall(x, y) || DOORISH.has(c(x, y))) continue;
    const cx = mid(x), cz = mid(y);
    box([cx - T / 2, F, cz - T / 2], [cx + T / 2, CEIL, cz + T / 2], 'brick');
    if (isWall(x + 1, y)) box([cx + T / 2, F, cz - T / 2], [cx + S / 2, CEIL, cz + T / 2], 'brick');
    if (isWall(x - 1, y)) box([cx - S / 2, F, cz - T / 2], [cx - T / 2, CEIL, cz + T / 2], 'brick');
    if (isWall(x, y + 1)) box([cx - T / 2, F, cz + T / 2], [cx + T / 2, CEIL, cz + S / 2], 'brick');
    if (isWall(x, y - 1)) box([cx - T / 2, F, cz - S / 2], [cx + T / 2, CEIL, cz - T / 2], 'brick');
  }
  // the door into the cellar (L): locked - it gives to a kick or a charge
  level.cellarDoors = [];
  for (const d of doorways(rows)) {
    const a0 = (d.axis === 'x' ? d.cells[0][0] : d.cells[0][1]) * S, a1 = a0 + d.cells.length * S;
    const at = d.axis === 'x' ? mid(d.cells[0][1]) : mid(d.cells[0][0]);
    if (d.axis === 'x') box([a0, F + 2.2, at - T / 2], [a1, CEIL, at + T / 2], 'brick');
    else box([at - T / 2, F + 2.2, a0], [at + T / 2, CEIL, a1], 'brick');
    const opts = d.code === 'R' ? { build: 'reinforced', locked: true, mat: 'armour', thick: 0.08, label: 'reinforced door' }
      : d.code === 'L' ? { build: 'sturdy', locked: true, mat: 'armour', label: 'locked door' } : {};
    const door = new SwingDoor(world, Object.assign({ plane: d.axis === 'x' ? 'z' : 'x', at, wall: [at - T / 2, at + T / 2], from: a0 + 0.02, to: a1 - 0.02, y0: F, h: 2.15, seal: [0.02, 0.02, 0.05] }, opts));
    level.swingDoors.push(door); level.cellarDoors.push(door);
  }

  // the low wall along the west walkway's edge (the map's C squares): chest
  // height to someone in the channel, waist height up here; the gaps between
  // its runs are where iron steps go down into the water - on both sides
  for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) {
    if (c(x, y) !== 'C' || !isWater(x + 1, y)) continue;
    const x1 = (x + 1) * S;
    box([x1 - 0.25, F, y * S], [x1, F + 1.0, (y + 1) * S], 'concrete2');
    box([x1 - 0.29, F + 1.0, y * S], [x1 + 0.04, F + 1.06, (y + 1) * S], 'concrete2', { solid: false });   // its coping
  }
  level.sewerSteps = [];
  const steps = (xEdge, dir, z0, z1) => {
    // two treads down from the walkway, then the bed: 0.3 m each
    for (let i = 0; i < 2; i++) {
      const a = xEdge + dir * 0.3 * i, b = xEdge + dir * 0.3 * (i + 1);
      box([Math.min(a, b), BED, z0 + 0.15], [Math.max(a, b), F - 0.3 * (i + 1), z1 - 0.15], 'metal');
    }
    level.sewerSteps.push({ x: xEdge, dir, z: (z0 + z1) / 2 });
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < Wd; x++) {
      // a gap in the west wall's line: walkway square, channel to its east, wall squares above or below in the line
      if (c(x, y) === '.' && isWater(x + 1, y) && !isWater(x, y) && (c(x, y - 1) === 'C' || c(x, y + 1) === 'C') && y > 2) steps((x + 1) * S, 1, y * S, (y + 1) * S);
    }
  }
  // ...and the same rows on the east walkway, opposite
  for (const st of level.sewerSteps.slice()) {
    const y = Math.floor(st.z / S);
    let x = Math.floor(st.x / S); while (isWater(x, y)) x++;
    if (!isWater(x, y) && isWater(x - 1, y) && under(x, y) && !isWall(x, y)) steps(x * S, -1, y * S, (y + 1) * S);
  }

  // the access ladder (A): up the north wall to the manhole in the road
  for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) {
    if (c(x, y) !== 'A') continue;
    const lx = mid(x), zf = (y - 1) * S + S / 2 + T / 2;                       // on the north wall's face
    drawLadder(box, lx, zf, [0, 1], F, 0, 'iron');
    world.addLadder([lx - 0.5, F, zf], [lx + 0.5, 0.3, zf + 0.8], [0, 1]);
    level.sewerLadder = { x: lx, z: zf + 0.4 };
  }
  // up top: the manhole's frame, and its lid lifted off and left beside it
  const mh = MANHOLE;
  box([mh.x - mh.hw - 0.12, 0, mh.z0 - 0.12], [mh.x + mh.hw + 0.12, 0.03, mh.z0], 'metal', { solid: false });
  box([mh.x - mh.hw - 0.12, 0, mh.z1], [mh.x + mh.hw + 0.12, 0.03, mh.z1 + 0.12], 'metal', { solid: false });
  box([mh.x - mh.hw - 0.12, 0, mh.z0], [mh.x - mh.hw, 0.03, mh.z1], 'metal', { solid: false });
  box([mh.x + mh.hw, 0, mh.z0], [mh.x + mh.hw + 0.12, 0.03, mh.z1], 'metal', { solid: false });
  box([mh.x + mh.hw + 0.35, 0, mh.z0 + 0.1], [mh.x + mh.hw + 1.15, 0.05, mh.z1 - 0.1], 'metal', { solid: false });
  // the shaft's lining, through the slab
  box([mh.x - mh.hw, CEIL, mh.z0], [mh.x + mh.hw, 0, mh.z0 + 0.02], 'brick', { solid: false });
  box([mh.x - mh.hw, CEIL, mh.z1 - 0.02], [mh.x + mh.hw, 0, mh.z1], 'brick', { solid: false });
  box([mh.x - mh.hw, CEIL, mh.z0], [mh.x - mh.hw + 0.02, 0, mh.z1], 'brick', { solid: false });
  box([mh.x + mh.hw - 0.02, CEIL, mh.z0], [mh.x + mh.hw, 0, mh.z1], 'brick', { solid: false });

  // grilles where the water comes in (north) and goes on (south, towards the river)
  const grille = (xa, xb, z, out) => {
    box([xa, BED, z - out * 0.01 - (out > 0 ? 0 : 0.01)], [xb, F - 0.05, z + (out > 0 ? 0.01 : 0)], 'asphalt', { solid: false });   // the dark of the culvert behind
    for (let x = xa + 0.12; x < xb - 0.05; x += 0.22) box([x - 0.025, BED, z + (out > 0 ? 0.01 : -0.05)], [x + 0.025, F - 0.05, z + (out > 0 ? 0.05 : -0.01)], 'metal', { solid: false });
    box([xa, F - 0.12, z + (out > 0 ? 0.01 : -0.05)], [xb, F - 0.05, z + (out > 0 ? 0.05 : -0.01)], 'metal', { solid: false });
  };
  {
    const north = level.sewerWater.filter((w) => w.z0 === Math.min(...level.sewerWater.map((q) => q.z0)));
    for (const w of north) grille(w.x0, w.x1, w.z0, 1);
    const south = level.sewerWater.filter((w) => w.z1 === Math.max(...level.sewerWater.map((q) => q.z1)));
    for (const w of south) grille(w.x0, w.x1, w.z1, -1);
  }
  // pipes along the west wall and under the slab
  const wx = 4 * S + S / 2 + T / 2;
  for (const [y, r] of [[F + 1.9, 0.12], [F + 2.25, 0.08]]) box([wx, y - r, 0.85], [wx + 2 * r, y + r, 25 * S - 0.1], 'metal', { solid: false });
  box([15 * S - 0.2, CEIL - 0.3, 0.85], [15 * S, CEIL - 0.1, 25 * S], 'metal', { solid: false });
  box([18 * S, CEIL - 0.22, 0.85], [18 * S + 0.16, CEIL - 0.06, 47.15], 'metal', { solid: false });

  // (M6.9.25) the city's power is on, so the sewer keeps its own lamps: dim
  // caged bulkheads on the walls, dark stretches between. The cellar is the
  // hotel's, and stays dark.
  level.sewerLamps = [];
  const bulkhead = (x, z, dir) => {
    const y = F + 2.0;
    box([Math.min(x, x + dir * 0.12), y - 0.12, z - 0.18], [Math.max(x, x + dir * 0.12), y + 0.12, z + 0.18], 'lamp', { solid: false });   // (M6.9.28: min before max - the east ones were inside out)
    for (const dz of [-0.12, 0, 0.12]) box([Math.min(x, x + dir * 0.15), y - 0.13, z + dz - 0.01], [Math.max(x, x + dir * 0.15), y + 0.13, z + dz + 0.01], 'metal', { solid: false });   // the cage
    level.lights.push({ pos: [x + dir * 0.9, y, z], range: 11, intensity: 2.0, color: [1, 0.82, 0.55], sewer: true });
    level.sewerLamps.push([x, y, z]);
  };
  const wW = 4 * S + S / 2 + T / 2, wE = 15 * S + S / 2 - T / 2;
  for (const z of [7, 19, 31]) bulkhead(wW, z, 1);
  for (const z of [13, 25]) bulkhead(wE, z, -1);
  bulkhead(wE, 43.5, -1);
  buildCellarStairs(level, box);
  furnishCellar(level, box);

  // names, for the HUD: the sewer, and the cellar
  const zs = (min, max, id, label) => { world.addZone(min, max, id, label); level.zones[id] = [min, max]; };
  zs([4 * S + face, BED - 0.1, 0.85], [15 * S + S / 2 - face, CEIL, 25 * S + face], 'sewer', 'Riverside Hotel - Sewer');
  zs([10 * S + S / 2 + T / 2, BED - 0.1, 25 * S + face], [15 * S + S / 2 - face, CEIL, 31 * S + S / 2 - face], 'sewer_south', 'Riverside Hotel - Sewer');
  zs([4 * S + S / 2 + T / 2, F - 0.1, 25 * S + S / 2 + T / 2], [10 * S + S / 2 - T / 2, CEIL, 31 * S + S / 2 - T / 2], 'basement', 'Riverside Hotel - Basement');
}

// The cellar stairs: down from the bar going south to a half landing, then
// down going north into the cellar (M6.9.25).
function buildCellarStairs(level, box) {
  const { xW, xE, zN, zL, zS, n } = CELLAR_STAIR, F = SEWER.floor, CEIL = -1;
  const rise = (0 - F) / 2 / n, run = (zL - zN) / n, xM = (xW + xE) / 2, yL = F / 2;
  // from the bar: the east flight, going south, down to the landing
  for (let i = 0; i < n; i++) {
    const top = -rise * (i + 1);
    box([xM + 0.1, F, zN + run * i], [xE, top, zN + run * (i + 1)], 'concrete2');
    // the wall between the flights, as high as this flight's tread
    box([xM - 0.1, F, zN + run * i], [xM + 0.1, top, zN + run * (i + 1)], 'plaster', { noClimb: true });
  }
  box([xW, F, zL], [xE, yL, zS], 'concrete2');                                    // the half landing
  // from the landing: the west flight, going north, down into the cellar
  for (let i = 0; i < n; i++) {
    const top = yL - rise * (i + 1);
    box([xW, F, zL - run * (i + 1)], [xM - 0.1, top, zL - run * i], 'concrete2');
  }
  // closed in down below: a wall on the west (the bar's wall, carried down),
  // the space east of the flights and south of the landing filled
  box([xW - T, F, zN], [xW, CEIL, 31 * S + S / 2 - T / 2], 'brick');
  box([xE, F, zN], [10 * S + S / 2 - T / 2, CEIL, 31 * S + S / 2 - T / 2], 'brick');
  box([xW, F, zS], [xE, CEIL, 31 * S + S / 2 - T / 2], 'brick');
  // railings: on the middle wall, falling with the east flight; and upstairs
  // round the opening, but at the head of the flight
  railing(box, [xM, zN], [xM, zL], 0, -rise * n, { h: 1.0 });
  // (on the floor's edge, just outside the opening: over it, they would catch
  // the heads of people coming up the flights)
  railing(box, [xW, zN - 0.06], [xM - 0.1, zN - 0.06], 0, 0);
  railing(box, [xE + 0.06, zN - 0.06], [xE + 0.06, zS], 0, 0);
  // a handrail down the west wall, for the flight into the cellar
  box([xW, yL + 0.85 - rise * n, zN], [xW + 0.05, yL + 0.9, zL], 'wood', { solid: false, slope: { axis: 2, dy: rise * n } });
  // the bar's carpet back over the strip between the opening and the next square
  box([xE, 0, zN], [10 * S, 0.02, zS], 'carpet', { solid: false });
  level.signs.push({ pos: [xE + 0.02, 1.9, zN + 0.9], yaw: Math.PI / 2, w: 0.7, h: 0.22, text: 'CELLAR', sub: 'Staff only', col: '#c9d4d8' });
  level.stairs = level.stairs || [];
  level.stairs.push({ y0: F, x0: xW, x1: xE, z0: zN, z1: zS, cellar: true });
}

// The cellar: the bar's kegs, the boiler, and the mains board - isolated.
function furnishCellar(level, box) {
  const F = SEWER.floor, x0 = 4 * S + S / 2 + T / 2, x1 = CELLAR_STAIR.xW - T, z0 = 25 * S + S / 2 + T / 2, z1 = 31 * S + S / 2 - T / 2;
  // the boiler in the south-west corner, its flue up through the slab
  box([x0 + 0.1, F, z1 - 1.6], [x0 + 1.3, F + 2.0, z1 - 0.1], 'barrel');
  box([x0 + 0.55, F + 2.0, z1 - 1.0], [x0 + 0.85, -1, z1 - 0.7], 'metal', { solid: false });
  // the hot-water cylinder beside it
  box([x0 + 0.15, F, z1 - 2.6], [x0 + 0.85, F + 1.8, z1 - 1.9], 'barrel');
  // kegs along the east side, two high in places - clear of the way in from
  // the foot of the stairs
  for (let i = 0; i < 4; i++) {
    const z = CELLAR_STAIR.zN + 0.6 + i * 0.7;
    box([x1 - 0.65, F, z - 0.3], [x1 - 0.05, F + 0.62, z + 0.3], 'barrel');
    if (i % 2 === 0) box([x1 - 0.65, F + 0.62, z - 0.3], [x1 - 0.05, F + 1.24, z + 0.3], 'barrel');
  }
  // racks of crates against the stairs' wall, further south
  for (const h of [0, 0.7, 1.4]) box([x1 - 0.6, F + h + 0.4, z1 - 3.4], [x1 - 0.02, F + h + 0.44, z1 - 0.2], 'wood', { solid: false });
  box([x1 - 0.6, F, z1 - 3.4], [x1 - 0.02, F + 0.4, z1 - 0.2], 'crate');
  for (const [h, zz] of [[0.44, -3.0], [0.44, -1.4], [1.14, -2.2], [1.84, -0.9]]) box([x1 - 0.55, F + h, z1 + zz - 0.3], [x1 - 0.1, F + h + 0.4, z1 + zz + 0.3], 'crate', { solid: false });
  // the mains board on the west wall: the power was cut here
  box([x0, F + 1.1, z0 + 1.6], [x0 + 0.18, F + 2.1, z0 + 2.6], 'metal');
  level.signs.push({ pos: [x0 + 0.2, F + 2.25, z0 + 2.1], yaw: Math.PI / 2, w: 0.8, h: 0.24, text: 'MAINS', sub: 'Isolated', col: '#d02020' });
  // pipes under the slab
  box([x0, -1.3, z0 + 0.4], [x1, -1.15, z0 + 0.55], 'metal', { solid: false });
  box([x0 + 0.4, -1.25, z0], [x0 + 0.55, -1.1, z1], 'metal', { solid: false });
}


// ── the reds (M6.10.0, Rhys's Guards tab) ──────────────────────────────────
// Who they are comes from the Guards tab, where they stand from their P
// squares, where they walk from their R squares (src/sim/hotel_guards.js).
// The hotel's power is cut: each sees by night-vision goggles or a torch.
export const GUARD_FLOORS = ['G', '1', '2', '3', 'R'];
export const NAV_BOUNDS = [3 * S, 4 * S, 24 * S, 44 * S];
// (M6.13.1, Rhys: the papers lay at the foot of the doorways) the real
// tabletops - desks, bedside tables, dining tables, the bar, the counters -
// recorded as the furniture is made, for laying things on
let SURFACES = null;
function surface(p, kind) { if (p && SURFACES) SURFACES.push({ min: p.min, max: p.max, kind }); return p; }
export const GROUND_NAV = [-20, -4, 56, 44 * S];      // (M6.12.3) street level, all of it
function hotelReds(level) {
  const world = level.world;
  level.dark = true;                                   // no lights inside: guards see by what they carry
  level.guards = [];
  const defs = hotelGuards(MAP, S, FLOORS, GUARD_FLOORS);
  const fits = (p) => !world.hit([p[0] - GUARD.radius, p[1] + 0.05, p[2] - GUARD.radius], [p[0] + GUARD.radius, p[1] + GUARD.height, p[2] + GUARD.radius]);
  const free = (p) => {
    if (fits(p)) return p;
    for (let r = 0.25; r <= 1.5; r += 0.25) for (let a = 0; a < 16; a++) {
      const q = [p[0] + Math.cos(a / 16 * Math.PI * 2) * r, p[1], p[2] + Math.sin(a / 16 * Math.PI * 2) * r];
      if (fits(q)) return q;
    }
    return p;
  };
  const yawTo = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[2] - from[2]));
  // how far he can see along a heading, at eye height
  const clear = (p, yaw) => { const e = [p[0], p[1] + GUARD.eye, p[2]], d = [-Math.sin(yaw), 0, -Math.cos(yaw)]; const h = world.raycast(e, d, 30, (q) => q.glass); return h ? h.t : 30; };
  for (const d of defs) {
    const pos = free(d.pos.slice());
    let yaw = 0;
    if (d.route && d.route.length > 1) yaw = yawTo(pos, [d.route[1][0], 0, d.route[1][1]]);
    else if (d.watch === 'door') {
      const doors = level.swingDoors.filter((q) => Math.abs(q.def.y0 - pos[1]) < 0.5);
      const near = doors.sort((a, b) => Math.hypot(a.centre[0] - pos[0], a.centre[2] - pos[2]) - Math.hypot(b.centre[0] - pos[0], b.centre[2] - pos[2]))[0];
      if (near) yaw = yawTo(pos, near.centre);
    } else if (d.watch === 'window') {
      const panes = world.solids.filter((q) => q.glass && q.min[1] < pos[1] + 2 && q.max[1] > pos[1] + 1);
      let best = null, bd = 1e9;
      for (const q of panes) { const c = [(q.min[0] + q.max[0]) / 2, 0, (q.min[2] + q.max[2]) / 2], dd = Math.hypot(c[0] - pos[0], c[2] - pos[2]); if (dd < bd) { bd = dd; best = c; } }
      if (best) yaw = yawTo(pos, best);
    } else {
      // a post with no word on it: he faces the longest view he has
      let bd = -1;
      for (let i = 0; i < 8; i++) { const y = i * Math.PI / 4, c = clear(pos, y); if (c > bd) { bd = c; yaw = y; } }
    }
    const g = new Guard(world, { id: d.id, pos, yaw, route: d.route, faction: 'red', rank: d.rank, arms: d.arms, temper: d.temper, sees: d.sees, fleeOn: d.fleeOn });
    g.floorKey = d.floor; g.notes = d.notes;
    if (d.floor === 'R') g.holdFloor = true;          // (M6.13.4) the roof's sentries hold the roof
    level.guards.push(g);
  }
  // (M6.10.2, Rhys) the captain's way out: through the reinforced roof door
  // (he has its key), slammed and locked behind him, up the ladder, and across
  // the roof to his place by the helicopter (P13 A)
  {
    const cap = level.guards.find((q) => q.id === 'P13');
    const door = level.swingDoors.find((q) => q.needs === 'roof');
    const lad = world.ladders.find((l) => Math.abs(l.min[1] - FLOORS['3']) < 0.3 && l.max[1] > FLOORS.R);
    const posts = MAP.labels.filter((l) => String(l[0]).toUpperCase().replace(/\s+/g, '') === 'P13A');
    if (cap && door && lad && posts.length) {
      const c = door.centre, y3 = FLOORS['3'], n = door.n;
      const inner = c.slice(), outer = c.slice();
      // which side is the suite's: the side the captain's post is on
      const sgn = Math.sign(cap.pos[n] - c[n]) || -1;
      inner[n] = c[n] + sgn * 0.8; outer[n] = c[n] - sgn * 0.8; inner[1] = outer[1] = y3;
      const lx = (lad.min[0] + lad.max[0]) / 2, lz = (lad.min[2] + lad.max[2]) / 2;
      const foot = [lx, y3, lz + lad.face[1] * 0.1];
      // off the top of the ladder onto the roof, over the top as you go (past the hatch)
      const exit = [lx - lad.face[0] * 0.95, FLOORS.R, lz - lad.face[1] * 0.95];
      const p13a = [(posts[0][2] + 0.5) * S, FLOORS.R, (posts[0][3] + 0.5) * S];
      cap.escape = [
        { to: inner }, { door, open: true, fumble: 4 }, { to: outer }, { door, lock: true },
        { to: foot }, { climb: FLOORS.R, at: [lx, lz], face: Math.atan2(lad.face[0], lad.face[1]), exit, rate: 0.9 },
        { to: p13a },
      ];
      cap.escapeSpeed = GUARD.search;            // (M6.13.2) a hurry, not a sprint
      level.captainEscape = { door, ladder: lad, exit, post: p13a };
      level.captain = cap;
    }
  }
  // how they find their way: each floor, the half landings of the main stairs,
  // and the flights between (along the nosings, as at Meridian House)
  const [x0, z0, x1, z1] = NAV_BOUNDS;
  // (M6.11.0) the ground floor's reaches out of the front doors to the street,
  // where the police cars are: the hostages walk out to them
  // (M6.12.3, Rhys: "Hostage still stops at seemingly random 'invisible
  // lines'") and now the whole of the outside at street level - the road both
  // ways, the far pavement, the pavements down both sides of the hotel to the
  // river - since walking out of the old bounds left him at their edge
  level.navFloors = GUARD_FLOORS.map((k) => ({ y: FLOORS[k], bounds: k === 'G' ? GROUND_NAV : [x0, z0, x1, z1] }));
  level.navLinks = [];
  const st = level.stairs || [];
  // (M6.11.1, Rhys: hostages would not follow down ladders, or into the
  // sewer) the basement and the sewer's west walkway, the cellar stairs from
  // the bar (a dog-leg, like the lobby's), and the ladders - the manhole and
  // the roof's - as straight links up and down
  {
    const cs = CELLAR_STAIR, xM = (cs.xW + cs.xE) / 2, xe = (xM + cs.xE) / 2, xw = (cs.xW + xM) / 2;
    level.navFloors.push({ y: SEWER.floor, bounds: [4 * S, 0, 16 * S, 32 * S] });
    level.navFloors.push({ y: SEWER.floor / 2, bounds: [cs.xW, cs.zL, cs.xE, cs.zS] });
    level.navLinks.push({ a: [xe, 0, cs.zN - 0.3], b: [xe, SEWER.floor / 2, cs.zL + 0.3] });
    level.navLinks.push({ a: [xw, SEWER.floor / 2, cs.zL + 0.3], b: [xw, SEWER.floor, cs.zN - 0.3] });
  }
  // (M6.12.0, Rhys: he went for the stairs when you went down a ladder) every
  // ladder whose foot and top are on floors the guards and hostages know:
  // a straight link from its foot, up, and over the top
  for (const lad of world.ladders) {
    const floorAt = (y, tol) => level.navFloors.map((f) => f.y).filter((fy) => Math.abs(fy - y) < tol).sort((a, b) => Math.abs(a - y) - Math.abs(b - y))[0];
    const yFoot = floorAt(lad.min[1], 0.3), yTop = floorAt(lad.max[1] - 0.3, 0.5);
    if (yFoot === undefined || yTop === undefined || yTop - yFoot < 1) continue;
    const lx = (lad.min[0] + lad.max[0]) / 2, lz = (lad.min[2] + lad.max[2]) / 2;
    const inNav = (x, z) => x > NAV_BOUNDS[0] && x < NAV_BOUNDS[2] && z > -2 && z < NAV_BOUNDS[3];
    const top = [lx - lad.face[0] * 0.95, yTop, lz - lad.face[1] * 0.95];
    if (!inNav(lx, lz) || !inNav(top[0], top[2])) continue;
    level.navLinks.push({ a: [lx, yFoot, lz], b: top, ladder: true });
  }
  // (M6.11.0) the suite's stairs, floor 2 to 3: up the foot onto the corner
  // landing, then along the flight to the top (for the hostage held up there)
  {
    const ss = SUITE_STAIR, rise = STOREY / ss.n, yLand = FLOORS[2] + rise * (ss.foot + 1), fx1 = ss.x0 + (ss.z1 - ss.z0);
    const zm = (ss.z0 + ss.z1) / 2, xl = (ss.x0 + fx1) / 2;
    level.navFloors.push({ y: yLand, bounds: [ss.x0, ss.z0, fx1, ss.z1] });
    level.navLinks.push({ a: [xl, FLOORS[2], ss.footZ0 - 0.4], b: [xl, yLand, zm] });
    level.navLinks.push({ a: [fx1 - 0.3, yLand, zm], b: [ss.x1 + 0.45, FLOORS[3], zm] });
  }
  for (const s of st) {
    if (s.cellar || s.y0 === undefined || Math.abs(s.x0 - (STAIR.x0 * S - (S / 2 - T / 2))) > 0.01) continue;   // the lobby's dog-leg only
    const n = 10, rise = STOREY / 2 / n, run = 3 / n, yL = s.y0 + STOREY / 2;
    const xM = (s.x0 + s.x1) / 2, zMid = (STAIR.y0 + 2) * S, zS = (STAIR.y0 + 4) * S;
    level.navFloors.push({ y: yL, bounds: [s.x0, s.z0, s.x1, zMid + 0.6] });
    const xw = (s.x0 + xM) / 2, xe = (xM + s.x1) / 2;
    // up the west flight going north: from the floor to the landing
    level.navLinks.push({ a: [xw, s.y0, zS + run], b: [xw, yL, zMid - 0.25] });
    // up the east flight going south: from the landing to the floor above
    level.navLinks.push({ a: [xe, yL, zMid - 0.25], b: [xe, s.y0 + STOREY, zS + run] });
    void rise;
  }
}


// ── supplies left about the hotel (M6.10.3, Rhys) ──────────────────────────
// Room 104: a box of two C5 charges. Room 201: a trauma kit - one use, puts
// you right at once. Each a small case on the floor of its room (where the
// room's name is on the map, or the nearest clear floor to it), opened like
// any crate.
export const SUPPLIES = [
  { room: 'Room 104', items: ['C5', 'C5'], label: 'C5 charges', mat: 'hazard' },
  { room: 'Room 201', items: ['MEDKIT_FULL'], label: 'Trauma kit', mat: 'lamp' },
];
// A spot in a room to lay something on (M6.13.1, Rhys: on desks - not at
// the foot of the doorway): one of the room's real tabletops (level.surfaces)
// - a desk first, then a bedside table, a table, the bar or a counter - at a
// place on it clear of what already stands there (a lamp); the nearest the
// room's label of that kind. Only a room with no tabletop at all gets the
// floor. `taken`: surfaces already used. size: [w, d] of the thing.
const SURFACE_ORDER = { desk: 0, bedside: 1, table: 2, bar: 3, counter: 3, ledge: 4 };
function tableSpot(level, room, taken, size, order) {
  order = order || SURFACE_ORDER;
  const world = level.world;
  const lab = MAP.labels.find((l) => l[0] === room);
  if (!lab) return null;
  const y = FLOORS[lab[1]];
  const c0 = [(lab[2] + 0.5) * S, y, (lab[3] + 0.5) * S];
  const [hw0, hd0] = (size || [0.3, 0.22]).map((v) => v / 2);
  const name = room.replace(/\s*\(.*\)/, '');
  const onFloor = (q) => q.min[1] <= y + 0.5 && q.max[1] >= y + 0.5;
  // the room's zone - or, where the map's label is not a room (the helicopter
  // on the roof), the few metres round it
  const zn = world.zones.find((q) => q.label && onFloor(q) && q.label.endsWith(' - ' + name)) ||
    world.zones.find((q) => q.label && onFloor(q) && q.label.indexOf(room) >= 0) ||
    { min: [c0[0] - 8, y, c0[2] - 8], max: [c0[0] + 8, y + 3, c0[2] + 8] };
  if (zn) {
    // (the zones stop short of the walls the furniture stands against: a
    // margin, but nothing solid at head height between it and the room's
    // middle - so never a table through the wall in the next room)
    const M = 0.7;
    const seen = (cx, cz) => {
      const from = [c0[0], y + 1.5, c0[2]], d = [cx - c0[0], 0, cz - c0[2]], len = Math.hypot(d[0], d[2]);
      if (len < 0.05) return true;
      const r = world.raycast(from, [d[0] / len, 0, d[2] / len], len);
      return !r || r.t > len - 0.6;
    };
    const inZone = (q) => { const cx = (q.min[0] + q.max[0]) / 2, cz = (q.min[2] + q.max[2]) / 2; return cx > zn.min[0] - M && cx < zn.max[0] + M && cz > zn.min[2] - M && cz < zn.max[2] + M && seen(cx, cz); };
    const cands = (level.surfaces || []).filter((q) => !(taken && taken.has(q)) && q.max[1] > y + 0.3 && q.max[1] < y + 1.2 && inZone(q))
      .sort((a, b) => (order[a.kind] - order[b.kind]) ||
        (Math.hypot((a.min[0] + a.max[0]) / 2 - c0[0], (a.min[2] + a.max[2]) / 2 - c0[2]) - Math.hypot((b.min[0] + b.max[0]) / 2 - c0[0], (b.min[2] + b.max[2]) / 2 - c0[2])));
    for (const q of cands) {
      const top = q.max[1];
      // what stands on it: a lamp, a chopping board, the paper already laid
      const onIt = level.pieces.filter((o) => o.min !== q.min && Math.abs(o.min[1] - top) < 0.03 && o.max[0] > q.min[0] && o.min[0] < q.max[0] && o.max[2] > q.min[2] && o.min[2] < q.max[2]);
      let best = null, bd = -1;
      const ni = Math.max(6, Math.ceil((q.max[0] - q.min[0]) / 0.1)), nk = Math.max(6, Math.ceil((q.max[2] - q.min[2]) / 0.1));
      for (const [hw, hd] of [[hw0, hd0], [hd0, hw0]]) for (let i = 0; i <= ni; i++) for (let k = 0; k <= nk; k++) {
        const x = q.min[0] + hw + 0.03 + (q.max[0] - q.min[0] - 2 * hw - 0.06) * i / ni, z = q.min[2] + hd + 0.03 + (q.max[2] - q.min[2] - 2 * hd - 0.06) * k / nk;
        if (x - hw < q.min[0] - 1e-6 || x + hw > q.max[0] + 1e-6 || z - hd < q.min[2] - 1e-6 || z + hd > q.max[2] + 1e-6) continue;
        const clearOf = onIt.every((o) => x + hw < o.min[0] - 0.02 || x - hw > o.max[0] + 0.02 || z + hd < o.min[2] - 0.02 || z - hd > o.max[2] + 0.02);
        if (!clearOf) continue;
        // away from the edges a little, so it reads as laid on it, not hanging off
        const d = Math.min(x - q.min[0], q.max[0] - x, z - q.min[2], q.max[2] - z);
        if (d > bd) { bd = d; best = [x, z, hw, hd]; }
      }
      if (!best) continue;
      if (taken) taken.add(q);
      return { at: [best[0], best[1]], half: [best[2], best[3]], top, y, surface: q.kind };
    }
  }
  // no tabletop in the room: a clear patch of floor nearest the room's middle
  const clear = (x, z) => !world.hit([x - 0.4, y + 0.05, z - 0.3], [x + 0.4, y + 0.5, z + 0.3]) &&
    world.solids.some((q) => q.max[1] > y - 0.1 && q.max[1] <= y + 0.05 && x >= q.min[0] && x <= q.max[0] && z >= q.min[2] && z <= q.max[2]);
  let at = null;
  for (let r = 0; r <= 2.5 && !at; r += 0.25) for (let a = 0; a < 16 && !at; a++) {
    const x = c0[0] + Math.cos(a / 16 * Math.PI * 2) * r, z = c0[2] + Math.sin(a / 16 * Math.PI * 2) * r;
    if (clear(x, z)) at = [x, z];
  }
  return { at: at || [c0[0], c0[2]], top: y, y, surface: null };
}
function hotelSupplies(level, box) {
  level.supplies = [];
  const taken = new Set();
  for (const sp of SUPPLIES) {
    const spot = tableSpot(level, sp.room, taken, [0.38, 0.28]);
    if (!spot) continue;
    const { at, top, y } = spot;
    box([at[0] - 0.19, top, at[1] - 0.14], [at[0] + 0.19, top + 0.14, at[1] + 0.14], sp.mat, { solid: false });
    const c = new Crate('gear', sp.items.slice(), [at[0], top + 0.07, at[1]]);
    c.label = sp.label;
    level.crates.push(c);
    level.supplies.push({ room: sp.room, crate: c, onTable: top > y + 0.1 });
  }
  // (M6.13.0, Rhys: lore in the rooms) the papers: a pale sheet or folder on
  // a table where there is one, readable with E (hotel_intel.js)
  level.intel = [];
  for (const it of HOTEL_INTEL) {
    const spot = tableSpot(level, it.room, taken, [0.26, 0.19]);
    if (!spot) continue;
    const { at, top, y } = spot;
    const [hx, hz] = spot.half || [0.15, 0.11];
    box([at[0] - hx, top, at[1] - hz], [at[0] + hx, top + 0.02, at[1] + hz], 'paper', { solid: false });
    level.intel.push(Object.assign({ pos: [at[0], top, at[1]], floorY: y, found: false, on: spot.surface }, it));
  }
}

// ── the street: the Ghost APC and the police cars (M6.11.0, Rhys: "remember
// there will be the Ghost APC AND Police Cars") ───────────────────────────
// Blocky stand-ins, where the map's V squares are: solid, so they are cover.
// The police cars are where the hostages are taken: the safe zone round them.
// [x, z, which way its back faces along x, roof number]
export const POLICE_CARS = [[18.0, 1.6, -1, '14'], [28.0, 1.6, 1, '22'], [22.5, 4.3, 1, '31'], [33.4, 4.3, -1, '47']];   // (the kerb pair clear of both front doors)
export const POLICE_ZONE = { x0: 11 * S, x1: 24 * S, z0: -2, z1: 4 * S };
function streetVehicles(level, box) {
  const world = level.world;
  // (M6.12.3, Rhys: "could you actually just draw better vehicles please?")
  // the police cars are drawn in code now (vehicle_models.js 'policeCar'),
  // laid along the road, with a solid box for each and the flashing light
  // bar on the roof - blues, as in Britain
  level.lightbars = [];
  const CAR = VEHICLE_SIZE.policeCar;
  // (M6.13.0, Rhys: "kissing cars") placed by hand, clear of each other:
  // two along the near side of the road, two along the hotel's kerb, a car's
  // length and more apart - each with its own roof number
  for (const [x, z, back, no] of POLICE_CARS) {
    // the model faces -z; turned 90 its back (+z) lies toward +x, turned -90 toward -x
    level.vehicles.push({ type: 'policeCar', pos: [x, 0, z], yaw: back * 90, roofNo: no });
    world.addSolid([x - CAR.L / 2, 0, z - CAR.W / 2], [x + CAR.L / 2, 0.95, z + CAR.W / 2], 'car');
    const c0 = x + back * -0.85, c1 = x + back * 2.2;            // the cabin, windscreen to tailgate
    world.addSolid([Math.min(c0, c1), 0.95, z - CAR.W / 2 + 0.15], [Math.max(c0, c1), CAR.H, z + CAR.W / 2 - 0.15], 'car');
    // the light bar across the front of the roof
    level.lightbars.push({ pos: [x + back * 0.3, CAR.roof + 0.08, z], along: 'x', colours: ['blue', 'blue'] });
  }
  // (M6.12.3, Rhys: a "Bulletproof Jeep" rather than a mini-tank APC) the
  // Ghost jeep (vehicle_models.js 'armouredJeep'), parked along the road west
  // of where you start
  const JEEP = VEHICLE_SIZE.armouredJeep;
  const jeep = { pos: [4.9, 0, 2.2], yaw: 0, L: JEEP.L, W: JEEP.W };
  level.vehicles.push({ type: 'armouredJeep', pos: jeep.pos, yaw: jeep.yaw, paint: 'ghost' });
  world.addSolid([jeep.pos[0] - jeep.W / 2, 0, jeep.pos[2] - jeep.L / 2], [jeep.pos[0] + jeep.W / 2, 1.3, jeep.pos[2] + jeep.L / 2], 'jeep');
  world.addSolid([jeep.pos[0] - 0.95, 1.3, jeep.pos[2] - 0.7], [jeep.pos[0] + 0.95, JEEP.H, jeep.pos[2] + 2.3], 'jeep');
  level.policeZone = POLICE_ZONE;
  // (M6.11.1) the way out: back to the jeep once the hostages are safe
  level.apcZone = { x0: jeep.pos[0] - jeep.W / 2 - 1.6, x1: jeep.pos[0] + jeep.W / 2 + 1.6, z0: jeep.pos[2] - jeep.L / 2 - 1.2, z1: jeep.pos[2] + jeep.L / 2 + 1.2, pos: jeep.pos.slice() };
  void box;
}

// ── the hostages (M6.11.0) ──────────────────────────────────────────────
// Where Rhys's map puts them: Hostage 1 on the first floor (behind the
// reinforced door P4 watches), Hostage 2 on the second, Hostage 3 on the
// third with P12.
function hotelHostages(level) {
  // (M6.11.1, Rhys: Hostage 3 was in the bed) nudged to the nearest clear
  // floor, as the guards are
  const w = level.world;
  const fits = (p) => !w.hit([p[0] - 0.3, p[1] + 0.05, p[2] - 0.3], [p[0] + 0.3, p[1] + 1.1, p[2] + 0.3]);
  const clear = (p) => {
    if (fits(p)) return p;
    for (let r = 0.25; r <= 2; r += 0.25) for (let a = 0; a < 16; a++) {
      const q = [p[0] + Math.cos(a / 16 * Math.PI * 2) * r, p[1], p[2] + Math.sin(a / 16 * Math.PI * 2) * r];
      if (fits(q)) return q;
    }
    return p;
  };
  level.hostages = hostagePlaces(MAP.labels, S, FLOORS).map((h) => {
    const q = new Hostage(level.world, { id: h.id, label: h.label, pos: clear(h.pos), yaw: 0 });
    q.floorKey = h.floor;
    // (M6.13.8, Rhys) who they are - the debrief names them, and the story remembers them
    const who = HOSTAGE_CAST[h.id];
    if (who) { q.name = who.name; q.she = who.she; }
    return q;
  });
}
// (Rhys, after M6.13.6) the three: Dr Imogen Hale in Room 103 (her own room is
// 104), Tony Ashdown in 206 (his is 205), Elijah Pellow in the Upper Balcony
// Suite (his ledger is in the suite below). Ashdown/Pellow's rooms are Claude's
// reading of the intel - swap them here if Rhys says so.
export const HOSTAGE_CAST = {
  H1: { name: 'Dr Imogen Hale', she: true },
  H2: { name: 'Tony Ashdown', she: false },
  H3: { name: 'Elijah Pellow', she: false },
};
