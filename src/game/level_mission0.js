// FRONTLINE - Level 0: the training mission.
//
// An office block held by the reds, three floors, on a street at night-ish.
// The file you want is on a private-network computer in a reinforced room in
// the middle of the second floor, which can only be reached by the stairs
// from the first. The ground and first floors can be entered however you
// like: the front door, the loading bay at the back, or the fire escape up
// the side to a first-floor window.
//
// Plan (metres; x runs west to east, z north to south, floors 3.6 m apart):
//   Ground  lobby 0-12 | security 12-21 | stairs 21-28 | toilets 28-34 | loading bay 34-40
//           corridor z 9-12 from the lobby to the bay; storage and break room south of it
//   First   open-plan 0-21 | stairs | manager 28-34 | IT office 34-40; meeting room south
//   Second  commander's office NW, comms NE, operations floor round the server room
//           (x 14-26, z 11-16), guard room SW, kitchenette SE
// Every door is an ordinary hinged door except the server room's, which is
// reinforced and locked. The guard room's is locked: that one is for breaching.

import { World } from '../sim/world.js';
import { SwingDoor, hangDoors } from '../sim/doors.js';
import { Guard } from '../sim/guard.js';
import { Crate } from '../sim/loadout.js';
import { drawLadder } from './ladders.js';

export const FLOORS = [0, 3.6, 7.2];
export const STOREY = 3.3;                  // wall height: floor to the slab above
const W = 40, D = 20;                       // the building's footprint

export function buildMission0() {
  const world = new World();
  const pieces = [], signs = [], lamps = [], water = [], lights = [], crates = [], props = [], vehicles = [];
  const level = { world, pieces, signs, lamps, water, lights, crates, props, vehicles, securityTurrets: [],
    swingDoors: [], guards: [], zones: {}, mission0: true,
    bake: true };           // lighting worked out once and painted in (render.js bakeLighting)

  const box = (min, max, mat, opts) => {
    opts = opts || {};
    const p = { min, max, mat, uv: opts.uv || 'world', tag: opts.tag };
    if (opts.render !== false) pieces.push(p);
    if (opts.solid !== false) world.addSolid(min, max, opts.tag || mat, { noClimb: opts.noClimb, tough: opts.tough, glass: opts.glass, ghost: opts.ghost });
    return p;
  };
  const boxc = (cx, cy, cz, sx, sy, sz, mat, opts) => box([cx - sx / 2, cy, cz - sz / 2], [cx + sx / 2, cy + sy, cz + sz / 2], mat, opts);
  const sign = (x, y, z, yaw, text, sub, w, col) => signs.push({ pos: [x, y, z], yaw, w: w || 2.4, h: (w || 2.4) * 0.34, text, sub: sub || '', col: col || '#e8b423' });
  const light = (x, y, z, range) => {
    lights.push({ pos: [x, y - 0.4, z], range: range || 10, intensity: 0.85, color: [1, 0.9, 0.74] });   // warm office light
    box([x - 0.6, y - 0.1, z - 0.2], [x + 0.6, y, z + 0.2], 'lamp', { solid: false });
  };

  // A wall with openings. Along x (at z) or along z (at x); openings are
  // [from, to, bottom, top] along its length, bottom/top above its foot.
  const wall = (axis, at, a0, a1, y0, t, mat, openings, h, drawOnly) => {
    h = h || STOREY;
    const o = drawOnly ? { solid: false } : undefined;
    const piece = (b0, b1, lo, hi) => {
      if (b1 - b0 < 0.01 || hi - lo < 0.01) return;
      if (axis === 'x') box([b0, y0 + lo, at - t / 2], [b1, y0 + hi, at + t / 2], mat, o);
      else box([at - t / 2, y0 + lo, b0], [at + t / 2, y0 + hi, b1], mat, o);
    };
    let cur = a0;
    for (const [o0, o1, ob, ot] of (openings || []).slice().sort((p, q) => p[0] - q[0])) {
      piece(cur, o0, 0, h);
      piece(o0, o1, 0, ob);                // below a window
      piece(o0, o1, ot, h);                // above a door or window
      cur = o1;
    }
    piece(cur, a1, 0, h);
  };
  const DOOR = (a0, a1) => [a0, a1, 0, 2.1];

  // An ordinary door in an opening, with a wooden frame on both faces.
  // axis: the wall's direction ('x' or 'z'); at: the wall's line; a0..a1: the opening
  const pairsSeen = new Set();
  const door = (axis, at, a0, a1, y0, opts) => {
    opts = opts || {};
    const t = opts.t || 0.2;
    const d = new SwingDoor(world, Object.assign({
      plane: axis === 'x' ? 'z' : 'x', at, wall: [at - t / 2, at + t / 2],
      from: a0 + 0.02 * Math.sign(a1 - a0), to: a1 - 0.02 * Math.sign(a1 - a0), y0, h: 2.08,   // hinged at a0 (either end)
      // (M6.13.6, Rhys: gapless, as at the hotel) drawn out to the jambs and
      // the lintel at 2.1; the first leaf of a pair carries the strip over the join
      seal: [0.02, 0.02, 0.02, opts.pair && !pairsSeen.has(opts.pair) ? 1 : 0],
    }, opts));
    if (opts.pair) pairsSeen.add(opts.pair);
    level.swingDoors.push(d);
    if (!opts.noFrame) for (const s of [-1, 1]) {
      const f = at + s * (t / 2 + 0.03);
      const trim = (b0, b1, lo, hi) => (axis === 'x'
        ? box([b0, y0 + lo, f - 0.03], [b1, y0 + hi, f + 0.03], 'wood', { solid: false })
        : box([f - 0.03, y0 + lo, b0], [f + 0.03, y0 + hi, b1], 'wood', { solid: false }));
      trim(a0 - 0.1, a0, 0, 2.2); trim(a1, a1 + 0.1, 0, 2.2); trim(a0 - 0.1, a1 + 0.1, 2.1, 2.2);
    }
    return d;
  };

  // A floor slab over the footprint, with at most one hole (a stairwell).
  const slab = (yTop, hole, mat) => {
    const y0 = yTop - 0.3;
    if (!hole) { box([0, y0, 0], [W, yTop, D], mat); return; }
    const [hx0, hz0, hx1, hz1] = hole;
    box([0, y0, 0], [W, yTop, hz0], mat);
    box([0, y0, hz1], [W, yTop, D], mat);
    box([0, y0, hz0], [hx0, yTop, hz1], mat);
    box([hx1, y0, hz0], [W, yTop, hz1], mat);
  };

  // ── The street and the lot ───────────────────────────────────────────────
  box([-30, -0.3, -20], [-22, 0, 40], 'concrete2');          // far pavement
  box([-22, -0.32, -20], [-6, -0.02, 40], 'asphalt');        // the road
  box([-6, -0.3, -20], [0, 0, 40], 'concrete2');             // near pavement
  box([0, -0.3, -20], [70, 0, 0], 'concrete');               // round the building
  box([0, -0.3, D], [70, 0, 40], 'concrete');
  box([W, -0.3, 0], [70, 0, D], 'concrete');
  for (let z = -18; z < 40; z += 6) box([-14.1, -0.02, z], [-13.9, 0.0, z + 3], 'hazard', { solid: false });   // road markings
  // the lot's edge: buildings across the road, a wall round the rest
  // the neighbourhood: faced buildings across the road and round the lot, so
  // Meridian House is a building in a street rather than a box in a desert
  for (const [z0, z1, h] of [[-20, -6, 12], [-6, 6, 9], [6, 18, 14], [18, 28, 8], [28, 40, 11]]) {
    box([-36, 0, z0], [-30, h, z1], 'facade');
    box([-36.2, h, z0 - 0.2], [-29.8, h + 0.4, z1 + 0.2], 'concrete', { solid: false });   // a cornice
  }
  for (const [x0, x1, h] of [[-36, -14, 15], [-14, 8, 10], [8, 30, 18], [30, 52, 12], [52, 72, 16]]) {
    box([x0, 0, -34], [x1, h, -22], 'facade', { solid: false });
    box([x0, 0, 42], [x1, h - 3, 54], 'facade', { solid: false });
  }
  for (const [z0, z1, h] of [[-22, 0, 13], [0, 20, 9], [20, 42, 15]]) box([72, 0, z0], [84, h, z1], 'facade', { solid: false });
  vehicles.push({ type: 'lightUtility', pos: [-19.5, 0, -8], yaw: 180, paint: 'white' });
  vehicles.push({ type: 'lightUtility', pos: [-19.5, 0, 26], yaw: 180, paint: 'red' });
  box([-20.6, 0, -10.3], [-18.4, 1.9, -5.7], 'metal', { render: false });
  box([-20.6, 0, 23.7], [-18.4, 1.9, 28.3], 'metal', { render: false });
  box([-30, 0, -21], [70, 3, -20], 'wall'); box([-30, 0, 40], [70, 3, 41], 'wall'); box([70, 0, -21], [71, 3, 41], 'wall');
  box([-37, 3, -21], [71, 40, -20], 'wall', { render: false }); box([-37, 3, 40], [71, 40, 41], 'wall', { render: false });
  box([70, 3, -21], [71, 40, 41], 'wall', { render: false }); box([-37, 0, -21], [-36, 40, 41], 'wall', { render: false });
  for (const [x, z] of [[-4, -8], [-4, 8], [-4, 24], [-4, 36]]) { boxc(x, 0, z, 0.25, 6, 0.25, 'metal'); lamps.push({ pos: [x, 6.1, z] }); }
  // cars parked round the back, and skips: cover on the way to the loading bay
  vehicles.push({ type: 'lightUtility', pos: [52, 0, 6], yaw: 90, paint: 'sand' });
  box([49.8, 0, 3.8], [54.2, 1.9, 8.2], 'metal', { render: false });
  boxc(46, 0, 28, 3.6, 1.6, 2, 'cont_green'); boxc(58, 0, 26, 3.6, 1.6, 2, 'cont_blue');

  // the van that dropped you off, and takes you home
  vehicles.push({ type: 'lightUtility', pos: [-12, 0, 10], yaw: 0, paint: 'olive' });
  box([-13.1, 0, 7.7], [-10.9, 1.9, 12.3], 'metal', { render: false });
  world.spawn = { pos: [-9.5, 0, 10], yaw: -Math.PI / 2 };   // facing the building (east)

  // the extraction: all round the van, not one side of it (Rhys never saw the
  // end screen: coming back round the far side, he was outside the old circle)
  level.van = { pos: [-12, 0, 10], radius: 4.4 };

  // ── The shell ────────────────────────────────────────────────────────────
  slab(0, null, 'concrete2');
  slab(FLOORS[1], [21, 3.5, 23.4, 8.5], 'concrete2');        // over the first flight
  slab(FLOORS[2], [25.6, 1.5, 28, 6.5], 'concrete2');        // over the second
  slab(10.8, null, 'metal');                                   // the roof
  // its underside, the top floor's ceiling: metal takes almost no baked light
  // (a metallic surface has hardly any diffuse colour), so the top floor's
  // ceiling was black whatever lit it. A skin like the other floors' slabs.
  box([0, 10.48, 0], [W, 10.5, D], 'concrete2', { solid: false });
  const carpet = (yTop, hole) => {
    const y0 = yTop, y1 = yTop + 0.012, o = { solid: false };
    const [hx0, hz0, hx1, hz1] = hole;
    box([0, y0, 0], [W, y1, hz0], 'carpet', o); box([0, y0, hz1], [W, y1, D], 'carpet', o);
    box([0, y0, hz0], [hx0, y1, hz1], 'carpet', o); box([hx1, y0, hz0], [W, y1, hz1], 'carpet', o);
  };
  carpet(FLOORS[1], [21, 3.5, 23.5, 8.6]);
  // (and footsteps know it: the upper floors are carpeted)
  level.surfaces = [
    { min: [0, FLOORS[1], 0], max: [W, FLOORS[1] + 1, D], kind: 'carpet' },
    { min: [0, FLOORS[2], 0], max: [W, FLOORS[2] + 1, D], kind: 'carpet' },
  ];
  carpet(FLOORS[2], [25.5, 1.4, 28, 6.5]);
  // Windows all round (Rhys: "isolated, no windows, very grey"): glazed, 2 m
  // wide, sill at 0.9 m, kept clear of doors and of where the inside walls
  // meet the outside. The glass stops a body, not a round.
  const JOIN = {                                  // inside walls meeting each outer wall, by floor
    north: [[12, 21, 28, 34], [21, 28, 34], [12, 21, 28, 32]],
    south: [[12, 23, 34], [21, 34], [11, 29]],
    west: [[], [], [7, 15]],
    east: [[], [], [7, 15]],
  };
  const windows = (along, len, joins, keep) => {
    const out = [];
    for (let a = 1; a + 2 <= len - 0.8; a += 4) {
      if (joins.some((j) => j > a - 0.5 && j < a + 2.5)) continue;
      if (keep.some(([k0, k1]) => a < k1 + 0.4 && a + 2 > k0 - 0.4)) continue;
      out.push([a, a + 2, 0.9, 2.3]);
    }
    return out;
  };
  const glaze = (axis, at, list, y) => {
    for (const [a0, a1] of list) {
      if (axis === 'x') {
        box([a0, y + 0.9, at - 0.02], [a1, y + 2.3, at + 0.02], 'glass', { glass: true, tough: 1 });
        box([a0 - 0.05, y + 0.85, at - 0.2], [a1 + 0.05, y + 0.9, at + 0.2], 'wood', { solid: false });
      } else {
        box([at - 0.02, y + 0.9, a0], [at + 0.02, y + 2.3, a1], 'glass', { glass: true, tough: 1 });
        box([at - 0.2, y + 0.85, a0 - 0.05], [at + 0.2, y + 0.9, a1 + 0.05], 'wood', { solid: false });
      }
    }
  };
  for (let f = 0; f < 3; f++) {
    const y = FLOORS[f];
    const westDoors = f === 0 ? [[8, 12, 0, 2.6]] : f === 1 ? [[14, 16, 0.9, 2.2]] : [];
    const eastDoors = f === 0 ? [[12, 16, 0, 3.0], [17, 18, 0, 2.1]] : [];      // the loading bay's shutter, and the back door
    const wN = windows('x', W, JOIN.north[f], []), wS = windows('x', W, JOIN.south[f], []);
    const wW = windows('z', D, JOIN.west[f], westDoors), wE = windows('z', D, JOIN.east[f], eastDoors);
    wall('z', -0.15, -0.3, D + 0.3, y, 0.3, 'brick', westDoors.concat(wW));
    wall('z', W + 0.15, -0.3, D + 0.3, y, 0.3, 'brick', eastDoors.concat(wE));
    wall('x', -0.15, 0, W, y, 0.3, 'brick', wN);
    wall('x', D + 0.15, 0, W, y, 0.3, 'brick', wS);
    // plaster on the inside faces: brick outside, office inside
    const skin = (axis, at, a0, a1, list) => wall(axis, at, a0, a1, y, 0.02, 'plaster', list, STOREY, true);
    skin('z', 0.01, 0, D, westDoors.concat(wW)); skin('z', W - 0.01, 0, D, eastDoors.concat(wE));
    skin('x', 0.01, 0, W, wN); skin('x', D - 0.01, 0, W, wS);
    glaze('z', -0.15, wW, y); glaze('z', W + 0.15, wE, y);
    glaze('x', -0.15, wN, y); glaze('x', D + 0.15, wS, y);
    // a stone band between storeys
    box([-0.35, y + STOREY - 0.05, -0.35], [W + 0.35, y + STOREY + 0.3, -0.3], 'concrete', { solid: false });
    box([-0.35, y + STOREY - 0.05, D + 0.3], [W + 0.35, y + STOREY + 0.3, D + 0.35], 'concrete', { solid: false });
  }
  wall('z', -0.15, -0.3, D + 0.3, 10.8, 0.3, 'brick', [], 0.8);   // the parapet
  wall('z', W + 0.15, -0.3, D + 0.3, 10.8, 0.3, 'brick', [], 0.8);
  wall('x', -0.15, 0, W, 10.8, 0.3, 'brick', [], 0.8);
  wall('x', D + 0.15, 0, W, 10.8, 0.3, 'brick', [], 0.8);
  sign(-0.33, 3.0, 10, -Math.PI / 2, 'MERIDIAN HOUSE', 'Offices', 3.4, '#c9d4d8');

  // ── The front: a glazed entrance ─────────────────────────────────────────
  // fixed glass either side, a glass fanlight above, and a pair of glass
  // doors in the middle (Rhys: "a proper front door")
  box([-0.2, 0, 8], [-0.1, 2.6, 9], 'glass', { glass: true, tough: 1 });
  box([-0.2, 0, 11], [-0.1, 2.6, 12], 'glass', { glass: true, tough: 1 });
  box([-0.2, 2.12, 9], [-0.1, 2.6, 11], 'glass', { glass: true, tough: 1 });
  for (const z of [8, 9, 11, 12]) box([-0.24, 0, z - 0.04], [-0.06, 2.6, z + 0.04], 'metal', { solid: false });
  box([-0.24, 2.08, 9], [-0.06, 2.14, 11], 'metal', { solid: false });
  level.frontDoors = [
    door('z', -0.15, 9, 10, 0, { t: 0.3, mat: 'glass', thick: 0.05, tough: 1, noFrame: true, label: 'front door', pair: 'front' }),
    door('z', -0.15, 11, 10, 0, { t: 0.3, mat: 'glass', thick: 0.05, tough: 1, noFrame: true, label: 'front door', pair: 'front' }),
  ];
  // ── The back: the loading bay's shutter is down; a steel door beside it ──
  box([W, 0, 12], [W + 0.25, 3.0, 16], 'metal', { tag: 'shutter', noClimb: true });
  for (let y = 0.25; y < 3; y += 0.25) box([W + 0.25, y - 0.02, 12], [W + 0.28, y, 16], 'rail', { solid: false });   // its slats
  sign(W + 0.3, 3.05, 14, Math.PI / 2, 'LOADING BAY', 'No parking', 2.2, '#e8b423');
  level.backDoor = door('z', W + 0.15, 17, 18, 0, { t: 0.3, build: 'sturdy', mat: 'metal', thick: 0.07, label: 'back door' });

  // ── The stairs: two flights in one shaft, x 21-28, z 0-9 ─────────────────
  const flight = (x0, x1, zStart, dir, y0) => {
    const n = 16, rise = FLOORS[1] / n, run = 5 / n;
    for (let i = 0; i < n; i++) {
      const za = zStart + dir * i * run, zb = zStart + dir * (i + 1) * run;
      box([x0, y0, Math.min(za, zb)], [x1, y0 + (i + 1) * rise, Math.max(za, zb)], 'concrete');
    }
  };
  flight(21, 23.4, 8.5, -1, 0);               // ground to first: up, heading north
  flight(25.6, 28, 1.5, 1, FLOORS[1]);        // first to second: up, heading south
  // rails round the holes, so the drop is not a surprise
  const rail = (a, b) => { box(a, b, 'rail', { render: false, noClimb: true }); box([a[0], b[1] - 0.06, a[2]], [b[0], b[1], b[2]], 'rail', { solid: false }); };
  rail([23.4, FLOORS[1], 3.5], [23.5, FLOORS[1] + 1.0, 8.5]);
  rail([21, FLOORS[1], 8.5], [23.5, FLOORS[1] + 1.0, 8.6]);
  rail([25.5, FLOORS[2], 1.5], [25.6, FLOORS[2] + 1.0, 6.5]);
  rail([25.5, FLOORS[2], 1.4], [28, FLOORS[2] + 1.0, 1.5]);
  for (const f of [0, 1, 2]) sign(f === 2 ? 25.3 : 24.45, FLOORS[f] + 2.2, 8.98, Math.PI, 'FLOOR ' + f, f === 1 ? 'Up: 2   Down: G' : f === 2 ? 'Top floor' : 'Up: 1', 1.2, '#c9d4d8');

  // Lights in the stairwell (M6.8.0): it had none, and read as a black shaft
  // between lit floors. Wall lamps, not ceiling ones - the shaft is open from
  // top to bottom, and the top floor's ceiling duct runs over its west side.
  const wallLight = (x, y, z, fixture) => {
    lights.push({ pos: [x, y, z], range: 8, intensity: 0.8, color: [1, 0.92, 0.8] });
    box(fixture[0], fixture[1], 'lamp', { solid: false });
  };
  wallLight(27.4, FLOORS[0] + 2.3, 7.6, [[27.84, FLOORS[0] + 2.35, 7.2], [27.9, FLOORS[0] + 2.55, 8.0]]);   // ground, east wall
  wallLight(24.5, FLOORS[1] + 2.4, 0.6, [[24.1, FLOORS[1] + 2.45, 0.1], [24.9, FLOORS[1] + 2.65, 0.16]]);  // first, north wall
  wallLight(27.4, FLOORS[2] + 2.4, 7.8, [[27.84, FLOORS[2] + 2.45, 7.4], [27.9, FLOORS[2] + 2.65, 8.2]]);  // second, east wall
  level.stairLights = 3;

  // the top-floor sign hangs from the ceiling on two rods, to the east of the duct (M6.7.5)
  for (const rx of [24.8, 25.8]) box([rx - 0.015, FLOORS[2] + 2.42, 8.96], [rx + 0.015, FLOORS[2] + STOREY, 9.0], 'metal', { solid: false });

  // ── Ground floor ─────────────────────────────────────────────────────────
  {
    const y = FLOORS[0];
    wall('z', 12, 0, 9, y, 0.2, 'plaster');
    wall('z', 12, 12, D, y, 0.2, 'plaster');
    wall('x', 9, 12, 21, y, 0.2, 'plaster', [DOOR(15, 16)]);
    door('x', 9, 15, 16, y);
    wall('z', 21, 0, 9, y, 0.2, 'plaster');
    wall('z', 28, 0, 9, y, 0.2, 'plaster');
    wall('x', 9, 28, 34, y, 0.2, 'plaster', [DOOR(30, 31)]);
    door('x', 9, 30, 31, y);
    wall('z', 34, 0, 9, y, 0.2, 'plaster');
    wall('z', 34, 9, 12, y, 0.2, 'plaster', [DOOR(10, 11)]);
    door('z', 34, 10, 11, y);
    wall('z', 34, 12, D, y, 0.2, 'plaster');
    wall('x', 12, 12, 34, y, 0.2, 'plaster', [DOOR(16, 17), DOOR(28, 29)]);
    door('x', 12, 16, 17, y); door('x', 12, 28, 29, y);
    wall('z', 23, 12, D, y, 0.2, 'plaster');
    // lobby: the reception desk, and chairs
    box([6, y, 6], [7, y + 1.05, 14], 'wood');
    box([6, y, 6], [8, y + 1.05, 7], 'wood');
    for (const z of [3, 17]) boxc(2, y, z, 2.2, 0.45, 0.8, 'cont_grey');
    // security office: a desk of screens, and the keycard on it
    box([13, y, 1], [19, y + 0.8, 2.2], 'wood');
    for (let x = 13.5; x < 19; x += 1.4) box([x, y + 0.8, 1.2], [x + 1.1, y + 1.5, 1.35], 'metal', { solid: false });
    level.keycard = { pos: [16.2, y + 0.82, 2.0] };
    // toilets: cubicle walls
    for (let x = 29.5; x < 34; x += 1.5) box([x, y, 0], [x + 0.06, y + 2.0, 5], 'cont_white');
    // storage: shelving and boxes
    for (let x = 13; x < 22; x += 3) box([x, y, 18.6], [x + 2.4, y + 2.2, 19.8], 'metal');
    for (const [x, z] of [[14, 15], [15.3, 15.2], [19, 14.6], [20.2, 16]]) boxc(x, y, z, 1.1, 1.0, 1.1, 'crate');
    // break room: a table and a counter
    boxc(28.5, y, 16, 3, 0.75, 1.4, 'wood');
    // a box of smoke grenades left on the table (Rhys: find them, like the keycard)
    box([27.9, y + 0.75, 15.75], [28.5, y + 0.95, 16.15], 'hazard', { solid: false });
    const smoke = new Crate('gear', ['SMOKE', 'SMOKE'], [28.2, y + 0.85, 15.95]);
    smoke.label = 'Smoke grenades';
    crates.push(smoke);
    level.smokeBox = smoke;
    box([24, y, 19], [33.8, y + 0.9, 19.8], 'cont_white');
    // loading bay: pallets and crates, a forklift's worth of cover
    for (const [x, z, h] of [[36, 3, 1.2], [38.2, 3.4, 2.2], [35.6, 7, 1.0], [38, 17.5, 1.4], [36, 18.4, 2.2]]) boxc(x, y, z, 1.5, h, 1.5, 'crate');
    for (const [x, z] of [[4, 4], [4, 16], [9, 10], [16.5, 4.5], [17, 16], [28.5, 16], [31, 4], [37, 10], [24.5, 10.5]]) light(x, y + STOREY, z, 11);
  }

  // ── First floor ──────────────────────────────────────────────────────────
  {
    const y = FLOORS[1];
    wall('z', 21, 0, 9, y, 0.2, 'plaster');
    wall('z', 21, 12, D, y, 0.2, 'plaster');
    wall('z', 28, 0, 9, y, 0.2, 'plaster');
    wall('x', 9, 28, 34, y, 0.2, 'plaster', [DOOR(30, 31)]);
    door('x', 9, 30, 31, y);
    wall('z', 34, 0, 9, y, 0.2, 'plaster');
    wall('z', 34, 9, 12, y, 0.2, 'plaster', [DOOR(10, 11)]);
    door('z', 34, 10, 11, y);
    wall('z', 34, 12, D, y, 0.2, 'plaster');
    wall('x', 12, 21, 34, y, 0.2, 'plaster', [DOOR(26, 27)]);
    door('x', 12, 26, 27, y);
    // the open-plan office: clusters of desks with partitions - cover
    for (const cx of [4.5, 10.5, 16.5]) for (const cz of [4, 10, 16]) {
      if (cx === 4.5 && cz === 16) continue;               // clear by the fire-escape window
      box([cx - 2, y, cz - 1.4], [cx + 2, y + 0.75, cz + 1.4], 'wood');
      box([cx - 2, y, cz - 0.05], [cx + 2, y + 1.35, cz + 0.05], 'wood');
      box([cx - 0.05, y, cz - 1.4], [cx + 0.05, y + 1.35, cz + 1.4], 'wood');
    }
    // manager's office and the meeting room
    boxc(31, y, 4, 3, 0.75, 1.4, 'wood');
    boxc(27.5, y, 16, 7, 0.75, 2.2, 'wood');
    // IT office: benches of kit, and the network map that says where to go
    box([38.8, y, 1], [39.8, y + 0.9, 8], 'wood');
    box([38.8, y, 13], [39.8, y + 0.9, 19], 'wood');
    sign(39.8, y + 1.2, 10.5, -Math.PI / 2, 'NETWORK MAP', 'SRV-02: floor 2, secure room', 2.8, '#6cc4e8');
    level.zones.itOffice = [[34, y, 0], [W, y + 3, D]];
    for (const [x, z] of [[4, 4], [10, 10], [16, 16], [4, 13], [16, 4], [10, 17], [31, 4], [27.5, 16], [37, 5], [37, 15], [24.5, 10.5]]) light(x, y + STOREY, z, 10);
  }

  // ── Second floor ─────────────────────────────────────────────────────────
  {
    const y = FLOORS[2];
    wall('z', 21, 0, 9, y, 0.2, 'plaster');
    // (the duct passes through at ceiling height: no lintel, so built by hand)
    wall('z', 28, 0, 2.2, y, 0.2, 'plaster'); wall('z', 28, 3.9, 9, y, 0.2, 'plaster');
    box([27.9, y, 2.2], [28.1, y + 1.93, 3.9], 'plaster');
    wall('z', 12, 0, 7, y, 0.2, 'plaster');
    wall('x', 7, 0, 12, y, 0.2, 'plaster', [DOOR(5.5, 6.5)]);
    door('x', 7, 5.5, 6.5, y);
    // the comms room's west wall, built by hand: the duct passes through it at
    // ceiling height, and the wall helper would put a lintel over the gap
    wall('z', 32, 0, 2.2, y, 0.2, 'plaster'); wall('z', 32, 3.9, 7, y, 0.2, 'plaster');
    box([31.9, y, 2.2], [32.1, y + 1.93, 3.9], 'plaster');   // the ceiling duct leaves the comms room here
    wall('x', 7, 32, W, y, 0.2, 'plaster', [DOOR(35.5, 36.5)]);
    door('x', 7, 35.5, 36.5, y);
    // the server room: reinforced walls, one reinforced door, locked
    // (its north wall, by hand: the door, and a gap at ceiling height where the duct comes in)
    wall('x', 11, 14, 23.0, y, 0.4, 'metal', [[19.4, 20.6, 0, 2.1]]);
    wall('x', 11, 24.4, 26, y, 0.4, 'metal');
    box([23.0, y, 10.8], [24.4, y + 1.93, 11.2], 'metal');
    wall('x', 16, 14, 26, y, 0.4, 'metal');
    wall('z', 14, 11, 16, y, 0.4, 'metal');
    wall('z', 26, 11, 16, y, 0.4, 'metal');
    level.serverDoor = door('x', 11, 19.4, 20.6, y, { t: 0.4, build: 'reinforced', locked: true, mat: 'metal', thick: 0.1, tough: undefined, label: 'server room' });
    sign(20, y + 2.3, 10.77, Math.PI, 'SECURE', 'Authorised personnel only', 1.8, '#e05050');
    // racks, and the private-network terminal at the back
    for (const [x0, x1] of [[15, 18.8], [21.2, 25]]) for (const z of [12.2, 13.8]) box([x0, y, z], [x1, y + 2.0, z + 0.6], 'metal');
    box([18.8, y, 15], [21.2, y + 0.8, 15.6], 'metal');
    box([19.4, y + 0.8, 15.35], [20.6, y + 1.55, 15.45], 'cont_blue', { solid: false });
    level.terminal = { pos: [20, y, 14.6] };
    // guard room (locked: the one to breach) and kitchenette
    wall('z', 11, 15, D, y, 0.2, 'plaster');
    wall('x', 15, 0, 11, y, 0.2, 'plaster', [DOOR(5, 6)]);
    level.guardRoomDoor = door('x', 15, 5, 6, y, { locked: true, label: 'guard room' });
    wall('z', 29, 15, D, y, 0.2, 'plaster');
    wall('x', 15, 29, W, y, 0.2, 'plaster', [DOOR(34, 35)]);
    door('x', 15, 34, 35, y);
    boxc(5.5, y, 18, 3, 0.75, 1.4, 'wood');                 // the guards' card table
    box([30, y, 19], [39.8, y + 0.9, 19.8], 'cont_white');  // kitchen counter
    boxc(6, y, 3.4, 3, 0.75, 1.4, 'wood');                  // the commander's desk
    box([33, y, 0.2], [39.8, y + 1.6, 1.2], 'metal');      // comms: racks of radios
    // The ceiling duct (Rhys: a quiet way into the server room that does not
    // walk you past its guards). In the comms room, by the top of the stairs:
    // climb the crate, climb into the duct, crouch along it - west over the
    // stairwell, south above the hall, over the patrol - into the server room,
    // and drop through the hatch between the racks. 1.3 m high inside; its
    // floor 1.95 m up, so guards walk underneath.
    boxc(34.5, y, 3.0, 1.1, 1.1, 1.1, 'crate');
    const dy0 = y + 1.95, dy1 = y + STOREY - 0.3;
    const dfloor = (x0, z0, x1, z1) => box([x0, dy0, z0], [x1, dy0 + 0.08, z1], 'metal');
    const dside = (x0, z0, x1, z1) => box([x0, dy0, z0], [x1, dy1, z1], 'metal');
    dfloor(23.1, 2.3, 33.95, 3.8);                          // east-west, from the comms room (1.5 m wide)
    dfloor(23.1, 3.8, 24.3, 12.8);                          // north-south, to the server room
    dfloor(23.1, 13.8, 24.3, 14.2);                         // (the hatch is 12.8-13.8)
    dside(23.0, 2.2, 32.9, 2.3); dside(24.3, 3.8, 32.9, 3.9);   // the sides of the long run (stopping just short of its open end, so the lip can be climbed)
    dside(23.0, 2.2, 23.1, 14.3); dside(24.3, 3.9, 24.4, 11);   // and of the run south
    dside(23.0, 14.2, 24.4, 14.3);                          // its end, over the terminal
    box([23.25, dy0 - 0.02, 12.8], [24.15, dy0, 12.85], 'rail', { solid: false });   // the hatch's edge
    level.zones.duct = [[32, y, 0], [40, y + 3, 7]];
    // the operations floor: a few desks and crates for cover round the room
    for (const [x, z] of [[8, 10], [32, 10], [8, 13], [33, 13]]) boxc(x, y, z, 2.2, 0.75, 1.2, 'wood');
    for (const [x, z] of [[13, 19.2], [20.5, 19.2], [17, 7.9], [30.5, 9.3]]) boxc(x, y, z, 1.1, 1.1, 1.1, 'crate');   // (one moved out of the duct's way)
    for (const [x, z] of [[6, 3], [37, 4.5], [5.5, 17.5], [34.5, 17.5], [6, 11], [34, 11], [20, 8.6], [20, 18], [20, 13.5], [29.5, 4.5]]) light(x, y + STOREY, z, 11);   // (two moved clear of the duct)
  }

  // ── The fire escape: a ladder up the west wall to the first-floor window ──
  {
    const y1 = FLOORS[1];
    box([-1.6, y1 - 0.15, 13.4], [-0.3, y1, 16.6], 'grating');           // the landing
    box([-1.7, y1, 13.3], [-1.6, y1 + 1.0, 16.7], 'rail', { noClimb: true });
    box([-1.7, y1, 13.3], [-0.3, y1 + 1.0, 13.4], 'rail', { noClimb: true });
    box([-1.7, y1, 16.6], [-1.2, y1 + 1.0, 16.7], 'rail', { noClimb: true });
    drawLadder(box, -0.85, 16.7, [0, 1], 0, y1, 'iron');
    world.addLadder([-1.35, 0, 16.75], [-0.35, y1 + 0.3, 17.55], [0, 1]);
    level.zones.fireEscape = [[-4, 0, 14], [0, 3, 21]];
  }

  // how guards find their way: the floors (the ground floor takes in the lot
  // round the building) and the two flights of stairs between them
  level.navFloors = [
    { y: FLOORS[0], bounds: [-24, -18, 62, 38] },
    { y: FLOORS[1], bounds: [0, 0, W, D] },
    { y: FLOORS[2], bounds: [0, 0, W, D] },
  ];
  level.navLinks = [
    // Each link runs along the nosings of its flight (one step is 0.225 m up over 0.3125 m along), so a
    // guard's feet stay on or just above the treads. A shallower line went through the concrete (M6.7.7).
    { a: [22.2, FLOORS[0], 8.8125], b: [22.2, FLOORS[1], 3.8125] },
    { a: [26.8, FLOORS[1], 1.1875], b: [26.8, FLOORS[2], 6.1875] },
  ];

  // zones for the hints
  level.zones.lobby = [[0, 0, 0], [12, 3, D]];
  level.zones.guardRoomDoor = [[3, FLOORS[2], 12.5], [8, FLOORS[2] + 3, 15]];
  level.zones.serverDoor = [[17.5, FLOORS[2], 8.5], [22.5, FLOORS[2] + 3, 11]];
  level.zones.secondFloor = [[0, FLOORS[2] - 0.2, 0], [W, FLOORS[2] + 3, D]];

  // ── The reds: ten of them ────────────────────────────────────────────────
  // rank (the hat), weapon, and temperament: bold ones come running when
  // there is trouble; steady ones hold their station
  const g = (id, pos, yaw, route, o) => level.guards.push(new Guard(world, Object.assign({ id, pos, yaw, route, faction: 'red' }, o)));
  const [y0, y1, y2] = FLOORS;
  g('lobby', [4, y0, 4], Math.PI, [[4, 4], [4, 16]], { rank: 'guard', arms: 'carbine', temper: 'bold' });
  g('security', [16, y0, 3.2], 0, null, { rank: 'guard', arms: 'pistol', temper: 'steady' });
  g('bay', [37, y0, 5], Math.PI, [[37, 5], [37, 15]], { rank: 'guard', arms: 'marksman', temper: 'steady' });
  g('open-plan', [7.5, y1, 7], 0, [[7.5, 7], [13.5, 7], [13.5, 13], [7.5, 13]], { rank: 'guard', arms: 'carbine', temper: 'bold' });
  g('corridor-1', [31.5, y1, 10.5], Math.PI / 2, null, { rank: 'sergeant', arms: 'carbine', temper: 'steady' });
  g('server-left', [18.6, y2, 10.35], 0, null, { rank: 'sergeant', arms: 'carbine', temper: 'steady' });   // facing out, away from the door they guard
  g('server-right', [21.4, y2, 10.35], 0, null, { rank: 'guard', arms: 'carbine', temper: 'steady' });
  g('ops-patrol', [12.5, y2, 9.6], 0, [[12.5, 9.6], [27.8, 9.6], [27.8, 17.5], [12.5, 17.5]], { rank: 'sergeant', arms: 'carbine', temper: 'bold' });
  g('guard-room-1', [3.5, y2, 18.6], 0, null, { rank: 'guard', arms: 'carbine', temper: 'bold' });
  g('guard-room-2', [7.8, y2, 17.6], Math.PI / 2, null, { rank: 'guard', arms: 'pistol', temper: 'bold' });
  // the man in charge, at his desk, facing the door
  g('commander', [6, y2, 5.2], Math.PI, null, { rank: 'officer', arms: 'pistol', temper: 'steady' });
  // (M6.13.6) every door hung to swing one way, as at the hotel: into the
  // room, in from outside - now that the furniture is in to be cleared
  hangDoors(world, level.swingDoors);
  return level;
}
