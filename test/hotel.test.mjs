// FRONTLINE - Level 1, the Riverside Hotel: built from Rhys's map (node).
import { buildHotel, insideMask, rooms, doorways, furnitureKind, kitchenPlan, S, FLOORS, STAIR, LIFT_CELL, BUILT, STOREY, SEWER, MANHOLE, CELLAR_STAIR, slabPieces, slabHoles } from '../src/game/levels/hotel.js';
import MAP from '../src/game/levels/maps/riverside.json' with { type: 'json' };
import { skyColour, wrapU } from '../src/game/draw/render.js';
import { Player } from '../src/sim/people/player.js';
import { Safe, cameraGlitch, glitchSpot } from '../src/sim/world/safe.js';
import { Guard, ARMS, RANKS, TEMPER, DARK, raiseAlarm, groundBelow } from '../src/sim/people/guard.js';
import { orderRoute, corners, hotelGuards } from '../src/sim/people/hotel_guards.js';
import { NavGrid } from '../src/sim/world/nav.js';
import { holdLiftFor, shove, Hostage, standable, inStreetZone } from '../src/sim/people/hostage.js';
import { Mission, hotelTrophies, HOTEL_PAR } from '../src/sim/play/mission.js';
import { hotelOutcome, hotelSettled, grade, outcomeLines, recordOutcome } from '../src/sim/play/story.js';
import { readFileSync } from 'fs';
import { World } from '../src/sim/world/world.js';
import { DoorMove } from '../src/sim/world/doors.js';
import { CaptainRun, HELI } from '../src/sim/people/captain.js';
import { DrawCull, DRAW, inSight } from '../src/sim/world/drawcull.js';
import { vehicleDef, vehicleBounds, VEHICLE_SIZE } from '../src/game/draw/vehicle_models.js';
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const G = MAP.floors.G;

T('the map came through: six floors, the ground floor 40 squares across with the river along the bottom', () => {
  A(['B', 'G', '1', '2', '3', 'R'].every((k) => MAP.floors[k] && MAP.floors[k].length > 20), Object.keys(MAP.floors).join());
  A(G[44].startsWith('~~~~~~~~~~'), 'no river on row 44');
});
T('inside and outside: the foyer is inside, the road is not, and rooms are told apart', () => {
  const inside = insideMask(G);
  A(inside.has('12,8'), 'the foyer is not inside');
  A(!inside.has('12,2'), 'the road counted as inside');
  const list = rooms(G, inside);
  A(list.length >= 6, 'only ' + list.length + ' rooms');
  const foyer = list.find((r) => r.some(([x, y]) => x === 12 && y === 8));
  A(foyer && !foyer.some(([x, y]) => y > 12), 'the foyer runs into the restaurant through a door');
});
T('the hotel sends you in wearing night vision goggles (M6.9.24, Rhys)', () => {
  const lv = buildHotel();
  if (lv.startGear !== 'NVG') throw new Error('starting gear is ' + lv.startGear);
});
T('the doors on the map: the two pairs of front doors, the kitchen way in, the locked pair to the CCTV room', () => {
  const d = doorways(G);
  const at = (x, y) => d.find((q) => q.cells.some(([a, b]) => a === x && b === y));
  A(at(11, 5) && at(11, 5).cells.length === 2 && at(11, 5).axis === 'x', 'front doors');
  A(at(17, 5) && at(17, 5).cells.length === 2, 'the second front doors');
  A(at(4, 17) && at(4, 17).cells.length === 1 && at(4, 17).axis === 'x', 'the kitchen way in');
  A(at(14, 36) && at(14, 36).code === 'L', 'the locked doors');
  A(at(9, 20) && at(9, 20).axis === 'x', 'the bar door');
});
T('the ground floor builds: walls, glass, doors, lights in every room, the named rooms as zones', () => {
  const L = buildHotel();
  A(L.pieces.length > 300, 'only ' + L.pieces.length + ' pieces');
  A(L.swingDoors.length >= 14, L.swingDoors.length + ' door leaves');
  A(L.swingDoors.some((d) => d.def.build === 'sturdy' && d.locked), 'no locked door');
  A(L.pieces.some((p) => p.mat === 'glass'), 'no glass');
  A(L.lights.length >= 10, L.lights.length + ' lights');
  for (const z of ['foyer', 'restaurant', 'kitchen', 'bar']) A(L.zones[z], 'no zone ' + z);
});
T('corridors are wide enough to pass: 1.5 m a square, walls 0.2 m', () => {
  A(S === 1.5, 'scale');
  const L = buildHotel();
  // the corridor from the lobby to the back: a square wide on the map
  const w = L.world;
  const clear = (x, z) => !w.solids.some((s) => !s.disabled && x > s.min[0] && x < s.max[0] && z > s.min[2] && z < s.max[2] && s.max[1] > 0.5 && s.min[1] < 1.5);
  let ok = 0; for (let x = 11 * S; x < 20 * S; x += 0.25) if (clear(x, 38.5 * S)) ok++;
  A(ok > 30, 'the CCTV room is blocked: ' + ok);
});
T('you can walk in through the front doors', () => {
  const L = buildHotel();
  const p = new Player(L.world);
  p.pos = [12 * S, 0, 3.5 * S]; p.vel = [0, 0, 0];
  const front = L.swingDoors.filter((d) => Math.abs(d.def.at - 5.5 * S) < 0.01);
  A(front.length === 4, 'front door leaves (two pairs): ' + front.length);
  for (const d of front) d.set(true, 1);
  for (let i = 0; i < 300; i++) p.step(1 / 60, { moveX: 0, moveZ: 1, yaw: Math.PI, pitch: 0, sprint: false, crouch: false, aim: false });
  A(p.pos[2] > 7 * S, 'stopped at z ' + p.pos[2].toFixed(2));
});
T('metal has a sky to reflect: blue up, haze level, darker below', () => {
  const up = skyColour(1), level = skyColour(0), down = skyColour(-1);
  A(up[2] > up[0] && level[0] > up[0] && down[0] < level[0], JSON.stringify([up, level, down]));
});

const L1 = buildHotel();
const step = (p, inp, n) => { for (let i = 0; i < n; i++) p.step(1 / 60, Object.assign({ moveX: 0, moveZ: 0, yaw: 0, pitch: 0, sprint: false, crouch: false, aim: false, jump: false, jumpPressed: false }, inp)); };
T('a city round it: buildings on every side, and no walking off the edge of the world (M6.9.1)', () => {
  const facades = L1.pieces.filter((p) => p.mat === 'facade');
  A(facades.some((p) => p.max[2] < 0) && facades.some((p) => p.min[0] > 36) && facades.some((p) => p.max[0] < 0) && facades.some((p) => p.min[2] > 70), 'not on every side');
  const p = new Player(L1.world);
  p.pos = [0, 0, 2]; p.vel = [0, 0, 0];
  step(p, { moveZ: 1, yaw: Math.PI / 2, sprint: true }, 60 * 40);                 // west along the road, for 40 s
  A(p.pos[0] > -46 && p.pos[1] > -1, 'walked off at ' + p.pos.map((v) => v.toFixed(1)));
});
T('street lamps stand on posts', () => {
  for (const l of L1.lamps) A(L1.pieces.some((q) => q.mat === 'metal' && Math.abs((q.min[0] + q.max[0]) / 2 - l.pos[0]) < 0.01 && Math.abs((q.min[2] + q.max[2]) / 2 - l.pos[2]) < 0.01 && q.max[1] > 5), 'a floating lamp at ' + l.pos);
});
T('out of the river: ladders up both banks, and one takes you up from the water (M6.9.1)', () => {
  const RZ = 44 * S;
  A(L1.world.ladders.filter((l) => l.max[2] <= RZ + 1).length >= 5 && L1.world.ladders.filter((l) => l.min[2] > RZ + 10).length >= 5, 'ladders: ' + L1.world.ladders.length);
  for (const [x, z, yaw] of [[5, RZ + 1.5, 0], [-5, RZ + 16.5, Math.PI]]) {        // the near bank's ladder at x 5, the far bank's at x -5
    const p = new Player(L1.world);
    p.pos = [x, -2.5, z]; p.vel = [0, 0, 0];                                      // swimming, as Rhys was
    let onLadder = false;
    for (let i = 0; i < 60 * 12; i++) { step(p, { moveZ: 1, yaw }, 1); if (p.mode === 'ladder') onLadder = true; }
    A(onLadder, 'never got on the ladder at x ' + x + ' (' + p.mode + ' ' + p.pos.map((v) => v.toFixed(2)) + ')');
    A(p.pos[1] > -0.3, 'still in the river at x ' + x + ': ' + p.pos.map((v) => v.toFixed(2)) + ' ' + p.mode);
  }
});
T('the garden: a lawn along the west side, hedged, reached by the back door', () => {
  const lawn = L1.pieces.find((q) => q.mat === 'lawn');
  A(lawn && lawn.min[0] <= 4.6 && lawn.max[0] >= 10 && lawn.min[2] <= 34 && lawn.max[2] >= 63, 'lawn ' + JSON.stringify(lawn));
  A(L1.pieces.filter((q) => q.mat === 'hedge').length >= 3, 'no hedges');
  A(L1.swingDoors.some((d) => d.def.plane === 'x' && Math.abs(d.def.at - 7.5 * S) < 0.01 && d.def.from > 60), 'no back door on to it');
});
T('double doors are pairs, single doors are not (M6.9.1)', () => {
  const front = L1.swingDoors.filter((d) => Math.abs(d.def.at - 5.5 * S) < 0.01);
  A(front.length === 4 && front.every((d) => d.def.pair), 'front doors not paired');
  A(new Set(front.map((d) => d.def.pair)).size === 2, 'the two pairs share a name');
  A(L1.swingDoors.some((d) => !d.def.pair), 'every door paired');
});
T('the hedge stays out of the kitchen (M6.9.2)', () => {
  const kitchen = L1.zones.kitchen;
  for (const h of L1.pieces.filter((q) => q.mat === 'hedge' && q.min[1] < 1)) {
    // the zone runs square to square; the walls stand half a square further out, so go by their inner faces
    const overlap = h.max[0] > kitchen[0][0] - S / 2 + 0.15 && h.min[0] < kitchen[1][0] && h.max[2] > kitchen[0][2] && h.min[2] < kitchen[1][2] + S / 2 - 0.15;
    A(!overlap, 'a hedge in the kitchen: ' + h.min + ' ' + h.max);
  }
});
T('furniture by room: tables with chairs in the restaurant, one bar counter, steel in the kitchen (M6.9.1)', () => {
  const G2 = MAP.floors.G, inside = insideMask(G2), list = rooms(G2, inside), roomOf = new Map();
  list.forEach((cells, i) => { for (const [x, y] of cells) roomOf.set(x + ',' + y, i); });
  const labels = MAP.labels.filter((l) => l[1] === 'G');
  A(furnitureKind(12, 25, roomOf, labels) === 'bar', 'the bar counter: ' + furnitureKind(12, 25, roomOf, labels));
  A(furnitureKind(16, 15, roomOf, labels) === 'table', 'a restaurant table: ' + furnitureKind(16, 15, roomOf, labels));
  A(furnitureKind(9, 15, roomOf, labels) === 'kitchen', 'the kitchen: ' + furnitureKind(9, 15, roomOf, labels));
  const k = L1.zones.kitchen, inK = (q) => q.min[0] > k[0][0] - 0.1 && q.max[0] < k[1][0] + 0.1 && q.min[2] > k[0][2] - 0.1 && q.max[2] < k[1][2] + 0.1;
  A(L1.pieces.some((q) => inK(q) && q.mat === 'plaster' && q.max[1] < 0.9) && L1.pieces.some((q) => inK(q) && q.mat === 'metal' && q.min[1] > 1.9), 'no units or hood in the kitchen');
  A(L1.pieces.filter((q) => q.mat === 'cloth').length >= 20, 'no tablecloths');
  const counters = L1.pieces.filter((q) => q.mat === 'wood' && q.min[1] > 1.0 && q.min[1] < 1.05 && q.max[2] - q.min[2] > 5);
  A(counters.length === 1 && counters[0].max[0] - counters[0].min[0] < 1.5, 'the bar is not one narrow counter: ' + counters.map((q) => q.min + ' ' + q.max).join(' | '));
  A(counters[0].min[0] > 17 && counters[0].max[0] < 20 && counters[0].min[2] > 35 && counters[0].max[2] < 42.5, 'the counter is not where the map puts it');
  A(L1.pieces.filter((q) => q.mat === 'barrel' && q.max[1] - q.min[1] < 0.4).length >= 10, 'no bottles behind the bar');
});
T('CCTV: the cameras up on the walls (seven downstairs, the eighth on the first floor, the ninth on the second), in order, and the consoles (M6.9.1, M6.9.4, M6.9.11)', () => {
  const c = L1.cctv;
  A(c && c.cameras.length === 9, 'cameras: ' + (c && c.cameras.length));
  A(c.cameras[8].pos[1] > FLOORS[2] + 2.5, 'camera 9 is not on the second floor');
  A(c.consoles.length === 1 && Math.abs(c.consoles[0][1]) < 0.01, 'consoles (one, downstairs - M6.9.12): ' + JSON.stringify(c.consoles));
  // and nothing in front of the lift's stop button
  const st = L1.liftStop.pos;
  A(!L1.world.solids.some((q) => q.max[1] > FLOORS[2] + 0.2 && q.min[1] < FLOORS[2] + 1.8 && q.min[0] < st[0] + 0.5 && q.max[0] > st[0] - 0.5 && q.min[2] < st[2] + 0.5 && q.max[2] > st[2] - 0.4), 'something stands at the stop button');
  A(c.cameras[7].pos[1] > FLOORS[1] + 2.5, 'camera 8 is not upstairs');
  A(c.cameras.every((k, i) => k.n === i + 1 && k.pos[1] > 2.5), 'numbering or height');
  A(Math.abs(c.console[0] - 21.5 * S) < 0.01 && Math.abs(c.console[2] - 37.5 * S) < 0.01, 'console at ' + c.console);
  const cam1 = c.cameras[0];
  A(cam1.look[2] < cam1.pos[2], 'camera 1 (outside) does not look out across the street');
});

T('forcing one leaf of a locked pair forces both (M6.9.3)', () => {
  const L = buildHotel();
  const locked = L.swingDoors.filter((d) => d.def.pair && d.locked);
  A(locked.length >= 2, 'no locked pair to try');
  const d = locked[0], other = locked.find((q) => q !== d && q.def.pair === d.def.pair);
  d.breachWith(L.swingDoors, [0, 0, 0], 'kick');
  A(!d.locked && !other.locked, 'the other leaf is still locked');
  const lone = L.swingDoors.find((q) => !q.def.pair && q !== d && q !== other);
  A(!lone || lone.def.build !== 'sturdy' || lone.locked === !!lone.def.locked, 'a door that is not its pair was forced');
});
T('the kitchen filled out: fittings round its walls, fridges in a corner, a range, and its doors kept clear (M6.9.3)', () => {
  const G2 = MAP.floors.G, list = rooms(G2, insideMask(G2));
  const kitchen = list.find((cells) => cells.some(([x, y]) => x === 9 && y === 15));
  const plan = kitchenPlan(G2, kitchen);
  A(plan.length >= 8, 'only ' + plan.length + ' fittings');
  A(plan.some((p) => p.kind === 'fridge') && plan.some((p) => p.kind === 'range'), plan.map((p) => p.kind).join());
  const doorish = (x, y) => 'DLRE'.includes((G2[y] || '')[x] || '.');
  A(plan.every((p) => ![-1, 0, 1].some((dx) => [-1, 0, 1].some((dy) => doorish(p.x + dx, p.y + dy)))), 'a fitting in front of a door');
});

T('up the stairs from the lobby to the first floor, and back down (M6.9.4)', () => {
  const p = new Player(L1.world);
  p.pos = [STAIR.x0 * S + 0.1, 0, (STAIR.y0 + 4.5) * S]; p.vel = [0, 0, 0];     // the middle of the west flight
  step(p, { moveZ: 1, yaw: 0 }, 60 * 3);                       // up the west flight, north, to the landing
  A(Math.abs(p.pos[1] - FLOORS[1] / 2) < 0.3, 'not on the half landing: ' + p.pos.map((v) => v.toFixed(2)));
  step(p, { moveX: 1, yaw: 0 }, 60 * 1);                       // across the landing
  step(p, { moveZ: 1, yaw: Math.PI }, 60 * 3);                 // up the east flight, south
  A(Math.abs(p.pos[1] - FLOORS[1]) < 0.1 && p.pos[2] > (STAIR.y0 + 4) * S, 'not out on the first floor: ' + p.pos.map((v) => v.toFixed(2)));
  step(p, { moveZ: 1, yaw: 0 }, 60 * 3);                       // and back down
  step(p, { moveX: -1, yaw: 0 }, 60 * 1);
  step(p, { moveZ: 1, yaw: Math.PI }, 60 * 3);
  A(p.pos[1] < 0.1, 'did not get back down: ' + p.pos.map((v) => v.toFixed(2)));
});
T('the stairwell is walled: from the landing you cannot step off into the lobby (M6.9.4)', () => {
  const p = new Player(L1.world);
  p.pos = [STAIR.x0 * S + 0.1, 0, (STAIR.y0 + 4.5) * S]; p.vel = [0, 0, 0];     // the middle of the west flight
  step(p, { moveZ: 1, yaw: 0 }, 60 * 4);                       // up to the landing
  step(p, { moveX: 1, yaw: 0 }, 60 * 3);                       // and on east, past where the landing ends
  A(p.pos[1] > FLOORS[1] / 2 - 0.2, 'fell off the landing: ' + p.pos.map((v) => v.toFixed(2)));
  step(p, { moveZ: 1, moveX: -0.4, yaw: Math.PI }, 60 * 4);    // then up the east flight against its outer side
  A(Math.abs(p.pos[1] - FLOORS[1]) < 0.1, 'did not get up: ' + p.pos.map((v) => v.toFixed(2)));
});
T('the first floor: its rooms with beds, its windows, no floor over the stairs, a way on to the back roof and down (M6.9.4)', () => {
  A(L1.zones.room_101 && L1.zones.room_106 && L1.zones.estate_room, 'rooms: ' + Object.keys(L1.zones).join());
  const beds = L1.pieces.filter((q) => q.mat === 'cloth' && q.min[1] > FLOORS[1] + 0.3 && q.max[0] - q.min[0] > 1.4 && q.max[2] - q.min[2] > 1.4);
  A(beds.length >= 6, 'beds: ' + beds.length);
  const overStairs = L1.pieces.filter((q) => (q.mat === 'carpet' || q.mat === 'concrete2') && Math.abs(q.min[1] - FLOORS[1]) < 0.35 && q.max[1] <= FLOORS[1] + 0.05 &&
    q.min[0] < (STAIR.x0 + 2) * S - 0.2 && q.max[0] > STAIR.x0 * S + 0.2 && q.min[2] < (STAIR.y0 + 4) * S - 0.2 && q.max[2] > STAIR.y0 * S + 0.2 && q.max[1] - q.min[1] > 0.01 && q.min[1] > 3);
  A(!overStairs.length, 'floor over the stairwell: ' + overStairs.map((q) => q.mat + ' ' + q.min + ' ' + q.max).join(' | '));
  A(L1.swingDoors.filter((d) => d.def.y0 === FLOORS[1] && d.locked).length >= 4, 'the locked doors upstairs');
  A(L1.world.ladders.some((l) => l.max[1] > FLOORS[1] && l.min[1] <= 0.01 && l.min[2] > 60), 'no emergency ladder');
  const est = L1.zones.estate_room;
  A(L1.pieces.some((q) => q.mat === 'glass' && q.min[1] > FLOORS[1] + 0.9 && q.min[1] < FLOORS[1] + 1.1 && q.min[2] > est[0][2] && q.max[2] < est[1][2]), 'the Estate Room has no screen (it is the first room, number 0)');
});

const segBlocked = (a, b, pieces) => {
  for (const q of pieces) {
    let t0 = 0, t1 = 1, ok = true;
    for (let i = 0; i < 3 && ok; i++) {
      const d = b[i] - a[i];
      if (Math.abs(d) < 1e-9) { if (a[i] < q.min[i] || a[i] > q.max[i]) ok = false; continue; }
      let u = (q.min[i] - a[i]) / d, v = (q.max[i] - a[i]) / d; if (u > v) [u, v] = [v, u];
      t0 = Math.max(t0, u); t1 = Math.min(t1, v); if (t0 > t1) ok = false;
    }
    if (ok && t1 > 0.02 && t0 < 0.98) return q;
  }
  return null;
};
T('the stairs run tight to the walls, and camera 6 watches the lobby and the stairs (M6.9.5)', () => {
  const st = L1.stairs[0];
  const steps = L1.pieces.filter((q) => q.mat === 'concrete2' && q.min[1] < 0.05 && q.max[1] < 1.9 && q.max[2] <= st.z1 + 0.01 && q.min[2] >= st.z0 - 0.01);
  A(steps.length && Math.min(...steps.map((q) => q.min[0])) - st.x0 < 0.05, 'a gap between the stairs and the west wall');
  const landing = L1.pieces.find((q) => q.mat === 'concrete2' && Math.abs(q.max[1] - FLOORS[1] / 2) < 0.01 && q.max[0] - q.min[0] > 3);
  A(landing && landing.min[2] - st.z0 < 0.05, 'a gap between the landing and the north wall');
  // every camera on a wall (M6.9.6: camera 6 floated in the stairwell)
  for (const c of L1.cctv.cameras) {
    const onWall = L1.pieces.some((q) => (q.mat === 'plaster' || q.mat === 'wall') && q.max[1] > c.pos[1] && q.min[1] < c.pos[1] &&
      Math.max(q.min[0] - c.pos[0], 0, c.pos[0] - q.max[0]) + Math.max(q.min[2] - c.pos[2], 0, c.pos[2] - q.max[2]) < 0.35);
    A(onWall, 'camera ' + c.n + ' is not on a wall');
  }
  const cam6 = L1.cctv.cameras.find((c) => c.n === 6);
  const opaque = L1.pieces.filter((q) => q.mat !== 'glass' && q.mat !== 'metal' && q.max[1] - q.min[1] > 0.3);
  const targets = { 'the lobby centre': [(15 * S), 1.0, 33 * S], 'the lobby east end': [21 * S, 1.0, 33 * S], 'the landing': [(STAIR.x0 + 1) * S, FLOORS[1] / 2 + 0.8, (STAIR.y0 + 0.5) * S], 'the east flight': [(STAIR.x0 + 1.5) * S, FLOORS[1] / 2 + 1.5, (STAIR.y0 + 3) * S] };
  for (const [name, t] of Object.entries(targets)) {
    const hit = segBlocked(cam6.pos, t, opaque);
    A(!hit, 'camera 6 cannot see ' + name + ' (blocked by ' + (hit && hit.mat + ' ' + hit.min.map((v) => v.toFixed(2)) + ' ' + hit.max.map((v) => v.toFixed(2))) + ')');
  }
});
T('the back roof: a metal railing with a gap, through which the ladder takes you down (M6.9.5)', () => {
  A(!L1.pieces.some((q) => q.mat === 'rail' && q.min[2] > 60), 'still the old yellow rail');
  const lad = L1.emergencyLadder;
  const p = new Player(L1.world);
  p.pos = [lad.x, FLOORS[1], lad.z - 1.8]; p.vel = [0, 0, 0];
  let on = false;
  // backing down on to it, facing the building, as with every ladder
  for (let i = 0; i < 60 * 10; i++) { step(p, { moveZ: -1, yaw: 0 }, 1); if (p.mode === 'ladder') on = true; if (on) break; }
  A(on, 'could not get on the ladder from the roof: ' + p.pos.map((v) => v.toFixed(2)) + ' ' + p.mode);
  step(p, { moveZ: -1, yaw: 0 }, 60 * 8);
  A(p.pos[1] < 0.5, 'did not get down: ' + p.pos.map((v) => v.toFixed(2)) + ' ' + p.mode);
});
T('the bedrooms: fuller, and the wardrobe out of the way of the door (M6.9.5)', () => {
  for (const id of ['room_101', 'room_102', 'room_103', 'room_104', 'room_105', 'room_106']) {
    const [mn, mx] = L1.zones[id];
    const inRoom = L1.pieces.filter((q) => q.min[1] >= FLOORS[1] - 0.01 && q.max[1] < FLOORS[1] + 2.5 && q.min[0] > mn[0] - 0.7 && q.max[0] < mx[0] + 0.7 && q.min[2] > mn[2] - 0.7 && q.max[2] < mx[2] + 0.7);
    A(inRoom.length >= 24 && inRoom.filter((q) => q.mat === 'cloth' || q.mat === 'fabric').length >= 7, id + ': only ' + inRoom.length + ' pieces');   // (M6.9.4 had 17)
    // (M6.9.6) a television you can watch from the bed; a painting, not glass; a red throw; an en-suite
    const bed = inRoom.find((q) => q.mat === 'cloth' && q.max[0] - q.min[0] > 1.4 && q.max[2] - q.min[2] > 1.4);
    const scr = inRoom.find((q) => q.mat === 'screen');
    A(bed && scr, id + ': no bed or no television screen');
    const bc = [(bed.min[0] + bed.max[0]) / 2, (bed.min[2] + bed.max[2]) / 2], sc = [(scr.min[0] + scr.max[0]) / 2, (scr.min[2] + scr.max[2]) / 2];
    const thinX = scr.max[0] - scr.min[0] < 0.05;                                   // the screen faces along x if it is thin in x
    A(thinX ? Math.abs(sc[1] - bc[1]) < 0.3 && (Math.abs(sc[0] - bed.min[0]) > 1.5 || Math.abs(sc[0] - bed.max[0]) > 1.5) : Math.abs(sc[0] - bc[0]) < 0.3, id + ': the television is not facing the bed');
    A(thinX ? Math.min(Math.abs(sc[0] - bed.min[0]), Math.abs(sc[0] - bed.max[0])) < 1.5 : Math.min(Math.abs(sc[1] - bed.min[2]), Math.abs(sc[1] - bed.max[2])) < 1.5, id + ': the television is not at the foot of the bed');
    A(inRoom.some((q) => q.mat === 'painting') && inRoom.some((q) => q.mat === 'fabric') && inRoom.some((q) => q.mat === 'pooltile'), id + ': no painting, throw or shower');
    // the room's door: the one whose middle is on the room's edge (the wall is 0.65 beyond the zone)
    const mid = (d) => d.def.plane === 'x' ? [d.def.at, (d.def.from + d.def.to) / 2] : [(d.def.from + d.def.to) / 2, d.def.at];
    const doors = L1.swingDoors.filter((d) => {
      if (d.def.y0 !== FLOORS[1]) return false;
      const [x, z] = mid(d);
      return x > mn[0] - 1.0 && x < mx[0] + 1.0 && z > mn[2] - 1.0 && z < mx[2] + 1.0;
    });
    A(doors.length, id + ': no door found');
    for (const d of doors) {
      const [x, z] = mid(d);
      for (const w of inRoom.filter((q) => q.mat === 'door' && q.max[1] - q.min[1] > 2)) {
        const dx = Math.max(w.min[0] - x, 0, x - w.max[0]), dz = Math.max(w.min[2] - z, 0, z - w.max[2]);
        A(Math.hypot(dx, dz) >= 1.0, id + ': the wardrobe is ' + Math.hypot(dx, dz).toFixed(2) + ' m from the door');
      }
    }
  }
});

T('Room 101 upstairs has its whole floor (M6.9.7: a gap along its wall over the stairwell)', () => {
  const [mn, mx] = L1.zones.room_101;
  const walkable = (x, z) => L1.world.solids.some((q) => !q.disabled && x > q.min[0] && x < q.max[0] && z > q.min[2] && z < q.max[2] && q.max[1] > FLOORS[1] - 0.05 && q.max[1] < FLOORS[1] + 0.05);
  for (let x = mn[0] - 0.47; x <= mx[0] + 0.5; x += 0.25) for (const z of [mx[2] + 0.1, mx[2] + 0.4, mx[2] + 0.6]) A(walkable(x, z), 'no floor at ' + x.toFixed(2) + ', ' + z.toFixed(2));
});
T('the en-suites: the way in is clear - nothing in front of or behind the opening (M6.9.7)', () => {
  const G1 = MAP.floors['1'];
  for (const id of ['room_101', 'room_102', 'room_103', 'room_104', 'room_105', 'room_106']) {
    const [mn, mx] = L1.zones[id];
    const near = (q) => q.min[1] >= FLOORS[1] - 0.01 && q.max[1] < FLOORS[1] + 3.4 && q.min[0] > mn[0] - 0.7 && q.max[0] < mx[0] + 0.7 && q.min[2] > mn[2] - 0.7 && q.max[2] < mx[2] + 0.7;
    const screen = L1.pieces.find((q) => near(q) && q.mat === 'glass' && q.max[1] - q.min[1] > 1.5);
    const tray = L1.pieces.find((q) => near(q) && q.mat === 'pooltile');
    A(screen && tray, id + ': no shower');
    // the opening: a lintel (plaster from 2.1 up), 0.9 wide
    const lintel = L1.pieces.find((q) => near(q) && q.mat === 'plaster' && Math.abs(q.min[1] - (FLOORS[1] + 2.1)) < 0.01 && Math.abs(Math.max(q.max[0] - q.min[0], q.max[2] - q.min[2]) - 0.9) < 0.02);
    A(lintel, id + ': no way into the en-suite');
    // a walker's box going through the opening, 0.8 m each side, must not meet the shower or the toilet
    const alongX = lintel.max[0] - lintel.min[0] > lintel.max[2] - lintel.min[2];
    const c = [(lintel.min[0] + lintel.max[0]) / 2, (lintel.min[2] + lintel.max[2]) / 2];
    const lane = alongX ? { x0: c[0] - 0.3, x1: c[0] + 0.3, z0: c[1] - 0.8, z1: c[1] + 0.8 } : { x0: c[0] - 0.8, x1: c[0] + 0.8, z0: c[1] - 0.3, z1: c[1] + 0.3 };
    const blockers = L1.world.solids.filter((q) => !q.disabled && q.max[1] > FLOORS[1] + 0.2 && q.min[1] < FLOORS[1] + 1.8 && q.max[0] > lane.x0 && q.min[0] < lane.x1 && q.max[2] > lane.z0 && q.min[2] < lane.z1);
    A(!blockers.length, id + ': something in the way of the en-suite: ' + blockers.map((q) => q.min.map((v) => v.toFixed(2)) + '..' + q.max.map((v) => v.toFixed(2))).join(' | '));
  }
});
T('the stair railings slope with the stairs, one bar each (M6.9.7)', () => {
  const sloped = L1.pieces.filter((q) => q.slope && q.mat === 'metal');
  A(sloped.length >= 4, 'sloping bars: ' + sloped.length);
  A(sloped.every((q) => Math.abs(q.slope.dy) > 0.4 && Math.max(q.max[0] - q.min[0], q.max[2] - q.min[2]) > 1.1), 'a bar is not a whole flight long');   // (M6.9.21: the suite stairs' foot is a short flight)
});

T('Room 101: the strip along its wall over the stairwell is carpeted like the rest (M6.9.8: an off-colour patch)', () => {
  const [mn, mx] = L1.zones.room_101;
  const carpeted = (x, z) => L1.pieces.some((q) => q.mat === 'carpet' && x > q.min[0] && x < q.max[0] && z > q.min[2] && z < q.max[2] && Math.abs(q.max[1] - (FLOORS[1] + 0.02)) < 0.005);
  for (let x = mn[0] + 0.1; x <= mx[0] - 0.1; x += 0.25) for (const z of [mx[2] - 0.5, mx[2] + 0.1, mx[2] + 0.4, mx[2] + 0.6]) A(carpeted(x, z), 'bare floor at ' + x.toFixed(2) + ', ' + z.toFixed(2));
});
// the lift (M6.9.8): ride it, with the game's rule that the car carries whoever stands in it
const liftStep = (L, p, inp, n) => { for (let i = 0; i < n; i++) { const r = L.lift.carries(p.pos); const dy = L.lift.step(1 / 60, [p.box()]); if (r && dy) p.pos[1] += dy; step(p, inp, 1); } };
const EAST = -Math.PI / 2, WEST = Math.PI / 2;
const doorZ = (L) => (L.lift.def.door.z0 + L.lift.def.door.z1) / 2;
T('the lift: at (21, 35), serving the floors built so far; its shaft is clear of every floor and wall', () => {
  const L = buildHotel(), lift = L.lift;
  lift.setStopped(false);                       // (M6.10.1) it starts stopped: these tests ride it
  A(lift, 'no lift');
  A(lift.def.floors.map((f) => f.key).join() === ['G', '1', '2'].filter((k) => BUILT.includes(k)).join(), 'floors: ' + lift.def.floors.map((f) => f.key));
  const { x0, x1, z0, z1 } = lift.def;
  A(x0 >= LIFT_CELL.x * S && x1 <= (LIFT_CELL.x + 1) * S && z0 >= LIFT_CELL.y * S && z1 <= (LIFT_CELL.y + 1) * S, 'the car is not in its square');
  A(x1 - x0 > 1.1 && z1 - z0 > 1.1, 'the car is too small: ' + (x1 - x0).toFixed(2) + ' x ' + (z1 - z0).toFixed(2));
  // nothing but the lift's own solids anywhere in the shaft, top to bottom
  const top = lift.def.floors[lift.def.floors.length - 1].y + 2.6;
  const inShaft = L.world.hits([x0 + 0.01, 0.05, z0 + 0.01], [x1 - 0.01, top, z1 - 0.01]).filter((q) => !/^lift/.test(q.tag));
  A(!inShaft.length, 'in the shaft: ' + inShaft.map((q) => q.tag + ' ' + q.min.map((v) => v.toFixed(2)) + '..' + q.max.map((v) => v.toFixed(2))).join(' | '));
  const drawn = L.pieces.filter((q) => q.max[0] > x0 + 0.01 && q.min[0] < x1 - 0.01 && q.max[2] > z0 + 0.01 && q.min[2] < z1 - 0.01 && q.max[1] > 0.05 && q.min[1] < top);
  A(!drawn.length, 'drawn in the shaft: ' + drawn.map((q) => q.mat + ' ' + q.min.map((v) => v.toFixed(2)) + '..' + q.max.map((v) => v.toFixed(2))).join(' | '));
  A(L.movers.some((m) => m.id === 'lift_car') && L.movers.filter((m) => /^lift_door_/.test(m.id)).length === 2 * lift.def.floors.length, 'movers: ' + L.movers.map((m) => m.id));
});
T('the lift: call it, walk in, press First floor, ride up, walk out on the first floor; and back down', () => {
  const L = buildHotel(), lift = L.lift;
  lift.setStopped(false);                       // (M6.10.1) it starts stopped: these tests ride it
  const p = new Player(L.world);
  p.pos = [lift.def.door.x - 1.2, 0, doorZ(L)]; p.vel = [0, 0, 0];
  liftStep(L, p, { moveZ: 1, yaw: EAST }, 60);
  A(p.pos[0] < lift.def.door.x, 'walked through the shut doors: ' + p.pos.map((v) => v.toFixed(2)));
  A(lift.landingNear(p.pos) === 0, 'not at the call button');
  A(lift.call(0) === 'here', 'call');
  liftStep(L, p, {}, 60);
  liftStep(L, p, { moveZ: 1, yaw: EAST }, 90);
  A(lift.carries(p.pos), 'did not get into the car: ' + p.pos.map((v) => v.toFixed(2)));
  // look at the First floor button
  const b = lift.buttons()[1], e = p.eyePos;
  const hit = lift.buttonAt(e, [b.pos[0] - e[0], b.pos[1] - e[1], b.pos[2] - e[2]]);
  A(hit && hit.i === 1, 'looking at the First floor button picked ' + (hit && hit.label));
  lift.call(hit.i);
  liftStep(L, p, {}, 60 * 8);
  A(lift.at === 1 && lift.doors === 1 && Math.abs(p.pos[1] - FLOORS[1]) < 0.02 && p.onGround, 'did not arrive upstairs: ' + p.pos.map((v) => v.toFixed(2)) + ' at ' + lift.at);
  liftStep(L, p, { moveZ: 1, yaw: WEST }, 90);
  A(p.pos[0] < lift.def.door.x - 1 && Math.abs(p.pos[1] - FLOORS[1]) < 0.05, 'did not walk out upstairs: ' + p.pos.map((v) => v.toFixed(2)));
  // back in and down
  liftStep(L, p, { moveZ: 1, yaw: EAST }, 90);
  A(lift.carries(p.pos), 'back into the car upstairs');
  lift.call(0);
  liftStep(L, p, {}, 60 * 8);
  A(lift.at === 0 && Math.abs(p.pos[1]) < 0.02, 'did not come back down: ' + p.pos.map((v) => v.toFixed(2)));
});
T('the lift: a landing it is not at stays shut (nobody falls down the shaft), and the doors will not shut on you', () => {
  const L = buildHotel(), lift = L.lift;
  lift.setStopped(false);                       // (M6.10.1) it starts stopped: these tests ride it
  const p = new Player(L.world);
  p.pos = [lift.def.door.x - 1.2, FLOORS[1], doorZ(L)]; p.vel = [0, 0, 0];     // upstairs, the car below
  liftStep(L, p, { moveZ: 1, yaw: EAST }, 120);
  A(p.pos[0] < lift.def.door.x && p.pos[1] > FLOORS[1] - 0.05, 'went through the first floor doors: ' + p.pos.map((v) => v.toFixed(2)));
  // downstairs: open, stand in the doorway through the whole dwell, and it stays open
  const q = new Player(L.world);
  lift.call(0);
  for (let i = 0; i < 60; i++) lift.step(1 / 60, []);
  q.pos = [lift.def.door.x, 0, doorZ(L)]; q.vel = [0, 0, 0];
  liftStep(L, q, {}, 60 * 12);
  A(Math.abs(q.pos[0] - lift.def.door.x) < 0.05, 'not standing in the doorway: ' + q.pos.map((v) => v.toFixed(2)));
  A(lift.doors === 1 && lift.wantOpen, 'the doors shut on someone in the doorway: ' + lift.doors + ' ' + lift.wantOpen + ' ' + q.pos.map((v) => v.toFixed(2)));
  // step clear (out into the lobby) and they shut
  liftStep(L, q, { moveZ: 1, yaw: WEST }, 60);
  liftStep(L, q, {}, 60 * 7);
  A(lift.doors === 0, 'the doors stayed open with nobody there');
});

T('the Estate Room is a suite: a king bed, a bathroom behind the screen (bath, shower, basins), a safe, a lounge (M6.9.9)', () => {
  const [mn, mx] = L1.zones.estate_room;
  const inside = (q) => q.min[0] > mn[0] - 0.7 && q.max[0] < mx[0] + 0.7 && q.min[2] > mn[2] - 0.7 && q.max[2] < mx[2] + 0.7 && q.min[1] >= FLOORS[1] - 0.01 && q.max[1] < FLOORS[1] + 3.4;
  const P = L1.pieces.filter(inside);
  A(P.some((q) => q.mat === 'cloth' && q.max[0] - q.min[0] > 1.9 && q.max[2] - q.min[2] > 1.9), 'no king bed');
  // the bath: a white tub with sunken water, no tiles on top (M6.9.10)
  const sides = P.filter((q) => q.mat === 'cloth' && q.max[0] - q.min[0] > 1.6 && q.max[2] - q.min[2] < 0.2 && Math.abs(q.max[1] - (FLOORS[1] + 0.62)) < 0.01);
  A(sides.length >= 2, 'no bath (its long sides): ' + sides.length);
  const [b0, b1] = sides;
  const water = P.find((q) => q.mat === 'glass' && q.max[1] < FLOORS[1] + 0.6 && q.min[1] > FLOORS[1] + 0.4 && q.min[0] >= b0.min[0] && q.max[0] <= b0.max[0]);
  A(water, 'no water in the bath');
  A(!P.some((q) => q.mat === 'pooltile' && q.min[0] >= b0.min[0] - 0.01 && q.max[0] <= b0.max[0] + 0.01 && q.min[2] >= Math.min(b0.min[2], b1.min[2]) - 0.01 && q.max[2] <= Math.max(b0.max[2], b1.max[2]) + 0.01), 'tiles on the bath');
  A(P.filter((q) => q.mat === 'pooltile').length >= 2, 'no shower tray or vanity top');
  A(P.some((q) => q.mat === 'screen'), 'no television');
  A(P.filter((q) => q.mat === 'fabric' && q.max[0] - q.min[0] > 2).length >= 1, 'no sofa');
  A((L1.safes || []).some((sf) => sf.room === 'estate_room' && sf.pos[0] > mn[0] - 1 && sf.pos[0] < mx[0] && sf.pos[2] > mn[2] - 1 && sf.pos[2] < mx[2]), 'no safe');
  A(!P.some((q) => q.mat === 'cloth' && Math.abs(q.min[1] - (FLOORS[1] + 0.72)) < 0.01), 'a meeting table is still there');
});
T('the Estate Room: walk in at its doors, round the patrol loop, into the bathroom and to the safe (M6.9.9)', () => {
  // from the corridor through the double doors (row 12, x 14-15) up to row 8
  const p = new Player(L1.world);
  p.pos = [15 * S, FLOORS[1], 13 * S + 0.1]; p.vel = [0, 0, 0];
  for (const d of L1.swingDoors) if (d.def.y0 === FLOORS[1] && d.near(p.pos) && !d.open) d.use(p.pos, p.box());
  step(p, { moveZ: 1, yaw: 0 }, 60 * 3);
  A(p.pos[2] < 9 * S && Math.abs(p.pos[1] - FLOORS[1]) < 0.05, 'could not walk in to row 8: ' + p.pos.map((v) => v.toFixed(2)));
  // the patrol loop (R6, rows 8 and 10) stays walkable
  const clear = (x0, z0, x1, z1) => !L1.world.solids.some((q) => !q.disabled && !q.person && q.max[1] > FLOORS[1] + 0.2 && q.min[1] < FLOORS[1] + 1.8 && q.max[0] > x0 && q.min[0] < x1 && q.max[2] > z0 && q.min[2] < z1);
  A(clear(9 * S + 0.3, 8 * S + 0.4, 21 * S - 0.4, 9 * S - 0.4), 'row 8 is blocked');
  A(clear(9 * S + 0.3, 10 * S + 0.4, 13 * S - 0.4, 11 * S - 0.4) && clear(14 * S, 10 * S + 0.6, 21 * S - 0.4, 11 * S - 0.4), 'row 10 is blocked');
  // into the bathroom by its open west end, south along column 9
  const q = new Player(L1.world);
  q.pos = [9.5 * S, FLOORS[1], 8.5 * S]; q.vel = [0, 0, 0];
  step(q, { moveZ: 1, yaw: Math.PI }, 60 * 2);
  A(q.pos[2] > 10 * S, 'could not get into the bathroom: ' + q.pos.map((v) => v.toFixed(2)));
  // the safe can be stood at
  const sf = L1.safes.find((x) => x.room === 'estate_room');
  A(clear(sf.pos[0] - 0.25, sf.pos[2] - 0.25, sf.pos[0] + 0.25, sf.pos[2] + 0.25), 'nowhere to stand at the safe');
});

// ── the second floor (M6.9.11) ──
T('the stairs go on up: lobby to the first floor to the second, and back down', () => {
  const p = new Player(L1.world);
  p.pos = [STAIR.x0 * S + 0.1, FLOORS[1], (STAIR.y0 + 4.5) * S]; p.vel = [0, 0, 0];     // the first floor, at the foot of the next flight
  step(p, { moveZ: 1, yaw: 0 }, 60 * 3);
  A(Math.abs(p.pos[1] - (FLOORS[1] + STOREY / 2)) < 0.3, 'not on the upper half landing: ' + p.pos.map((v) => v.toFixed(2)));
  step(p, { moveX: 1, yaw: 0 }, 60 * 1);
  step(p, { moveZ: 1, yaw: Math.PI }, 60 * 3);
  A(Math.abs(p.pos[1] - FLOORS[2]) < 0.1 && p.pos[2] > (STAIR.y0 + 4) * S, 'not out on the second floor: ' + p.pos.map((v) => v.toFixed(2)));
  step(p, { moveZ: 1, yaw: 0 }, 60 * 3);
  step(p, { moveX: -1, yaw: 0 }, 60 * 1);
  step(p, { moveZ: 1, yaw: Math.PI }, 60 * 3);
  A(Math.abs(p.pos[1] - FLOORS[1]) < 0.1, 'did not get back down to the first floor: ' + p.pos.map((v) => v.toFixed(2)));
  // and the flights below still have headroom (the ones above are slabs now)
  const q = new Player(L1.world);
  q.pos = [STAIR.x0 * S + 0.1, 0, (STAIR.y0 + 4.5) * S]; q.vel = [0, 0, 0];
  step(q, { moveZ: 1, yaw: 0 }, 60 * 3); step(q, { moveX: 1, yaw: 0 }, 60); step(q, { moveZ: 1, yaw: Math.PI }, 60 * 3);
  A(Math.abs(q.pos[1] - FLOORS[1]) < 0.1, 'the ground floor flights are blocked: ' + q.pos.map((v) => v.toFixed(2)));
});
T('the lift goes to the second floor', () => {
  const L = buildHotel(), lift = L.lift;
  lift.setStopped(false);                       // (M6.10.1) it starts stopped: these tests ride it
  A(lift.def.floors.length === 3 && lift.def.floors[2].key === '2', 'floors: ' + lift.def.floors.map((f) => f.key));
  const p = new Player(L.world);
  p.pos = [(lift.def.x0 + lift.def.x1) / 2, 0, (lift.def.z0 + lift.def.z1) / 2]; p.vel = [0, 0, 0];
  lift.call(2);
  for (let i = 0; i < 60 * 14 && !(lift.at === 2 && lift.doors === 1); i++) liftStep(L, p, {}, 1);
  A(lift.at === 2 && Math.abs(p.pos[1] - FLOORS[2]) < 0.02, 'did not get to the second floor: ' + p.pos.map((v) => v.toFixed(2)));
  liftStep(L, p, { moveZ: 1, yaw: WEST }, 90);
  A(p.pos[0] < lift.def.door.x - 1 && Math.abs(p.pos[1] - FLOORS[2]) < 0.05, 'did not walk out on the second floor: ' + p.pos.map((v) => v.toFixed(2)));
});
T('the barricades block the corridor wall to wall, chest high: shoot over, no climbing over (M6.9.12)', () => {
  for (const row of [18, 24]) {
    const z = (row + 0.5) * S;
    const wall = L1.world.solids.find((q) => q.tag === 'plaster' && q.min[1] >= FLOORS[2] - 0.01 && q.max[1] > FLOORS[2] + 1.2 && q.min[2] < z && q.max[2] > z && q.min[0] < 13 * S && q.max[0] > 17 * S);
    A(wall && wall.noClimb, 'nothing across the corridor at row ' + row);
    A(wall.max[1] < FLOORS[2] + 1.5, 'too high to shoot over: ' + (wall.max[1] - FLOORS[2]).toFixed(2));
    // a standing shot along the corridor over it is clear
    const r = L1.world.raycast([15 * S, FLOORS[2] + 1.64, z + 2.5], [0, 0, -1], 5);
    A(!r, 'a shot over the barricade at row ' + row + ' hits ' + (r && r.solid.tag));
    A(!L1.pieces.some((q) => q.min[1] > FLOORS[2] + 1.4 && q.max[1] < FLOORS[2] + 3 && q.min[2] > z - 1 && q.max[2] < z + 1 && q.min[0] > 13 * S && q.max[0] < 17 * S), 'furniture piled above the solid (looks like cover, is not)');
    A(L1.pieces.filter((q) => q.min[1] >= FLOORS[2] - 0.01 && q.min[1] < FLOORS[2] + 3 && q.min[2] > z - 1 && q.max[2] < z + 1 && q.min[0] > 12 * S && q.max[0] < 18 * S).length > 12, 'the barricade at row ' + row + ' is bare');
  }
  const p = new Player(L1.world);
  p.pos = [15 * S, FLOORS[2], 21 * S]; p.vel = [0, 0, 0];
  step(p, { moveZ: 1, yaw: 0, jumpPressed: true, jump: true }, 60 * 3);
  A(p.pos[2] > 19 * S, 'got past the barricade: ' + p.pos.map((v) => v.toFixed(2)));
});
T('the holes blown through walls: walk through each, past rubble, nothing standing in the way', () => {
  for (const [x, yFrom, yTo] of [[9, 17, 19], [20, 25, 23]]) {
    const p = new Player(L1.world);
    p.pos = [(x + 0.5) * S, FLOORS[2], (yFrom + 0.5) * S]; p.vel = [0, 0, 0];
    const dir = yTo > yFrom ? Math.PI : 0;
    step(p, { moveZ: 1, yaw: dir }, 60 * 2);
    A(yTo > yFrom ? p.pos[2] > (yTo + 0.3) * S : p.pos[2] < (yTo + 0.7) * S, 'could not get through the hole at (' + x + ', ' + (yFrom + yTo) / 2 + '): ' + p.pos.map((v) => v.toFixed(2)));
    A(Math.abs(p.pos[1] - FLOORS[2]) < 0.2, 'not on the floor after the hole');
  }
  A(L1.zones.room_205 && L1.zones.room_203 && L1.zones.room_201 && L1.zones.room_202, 'the rooms either side are not each their own room');
  const [a, b] = L1.zones.room_205;
  A(b[2] - a[2] < 9, 'Room 205 runs into Room 203 through the hole');
});
T('the Room 207 key is in the Estate Room safe; the Balcony Suite doors take it (M6.9.13)', () => {
  const key = (L1.keys || []).find((k) => k.id === 'room_207');
  A(key && key.safe, 'no key, or not in a safe');
  const sf = L1.safes.find((x) => x.room === 'estate_room');
  A(sf && key.safe === sf.safe && Math.hypot(key.pos[0] - sf.inside[0], key.pos[2] - sf.inside[2]) < 0.05 && Math.abs(key.pos[1] - FLOORS[1] - 0.18) < 0.05, 'the key is not inside the Estate Room safe: ' + key.pos);
  const doors = L1.swingDoors.filter((d) => d.needs === 'room_207');
  A(doors.length === 2 && doors.every((d) => d.locked && d.def.build === 'reinforced' && Math.abs(d.centre[2] - 12.5 * S) < 0.2), 'suite doors: ' + doors.length);
  // (M6.9.14) no note left out: the combination is in four cameras' glitches, in camera order
  A(!(L1.notes || []).length, 'a note is still lying about');
  const clued = L1.cctv.cameras.filter((c) => c.clue !== undefined);
  A(clued.length === 4 && clued.map((c) => c.clue).join('') === L1.safeCode.join(''), 'the cameras do not spell the combination: ' + clued.map((c) => c.n + ':' + c.clue));
  A(clued.every((c, i) => i === 0 || c.n > clued[i - 1].n), 'not in camera order');
  // (M6.9.15) one combination for this level, 1962, on cameras 2, 4, 6 and 8 - every time
  A(L1.missionTime && L1.missionTime.date.join('-') === '9-7-2026' && L1.missionTime.hour >= 20, 'the hotel is not set late on 9 July 2026');
  A(L1.safeCode.join('') === '1962' && clued.map((c) => c.n).join(',') === '2,4,6,8', 'not 1962 on cameras 2, 4, 6, 8: ' + L1.safeCode.join('') + ' on ' + clued.map((c) => c.n));
  // they glitch now and then, briefly; the others never do
  for (const c of L1.cctv.cameras) {
    let on = 0, n = 0;
    for (let t = 0; t < 60; t += 0.05) { n++; if (cameraGlitch(c, t)) on++; }
    if (c.clue === undefined) A(on === 0, 'camera ' + c.n + ' glitches with nothing to tell');
    else A(on > 0 && on / n < 0.08, 'camera ' + c.n + ' glitches ' + (100 * on / n).toFixed(1) + '% of the time');
  }
});
T('the safe: the combination cycled in on the dial opens it; a wrong one does not; a breaching charge blows the door off (M6.9.13)', () => {
  const s0 = new Safe([3, 0, 9, 1]);
  const dialTo = (sf, n) => { let g = 0; while (sf.dial !== n && g++ < 20) sf.turn(1); };
  for (const n of [3, 0, 9, 2]) { dialTo(s0, n); s0.set(); }
  A(!s0.open, 'a wrong combination opened it');
  let heavy = 0;
  for (const n of [3, 0, 9, 1]) { s0.events.length = 0; dialTo(s0, n); heavy += s0.events.filter((e) => e.on).length; A(s0.events.length === 0 || s0.events[s0.events.length - 1].on, 'no heavy click on the right number'); s0.set(); }
  A(s0.open && !s0.blown, 'the right combination did not open it');
  // turning back the other way works too
  const s1 = new Safe([8, 2, 5, 5]);
  for (const n of [8, 2, 5, 5]) { let g = 0; while (s1.dial !== n && g++ < 20) s1.turn(-1); s1.set(); }
  A(s1.open, 'turning anticlockwise did not open it');
  // blast: a breach close by takes the door off; a frag (no breach) or a far one does not
  const s2 = new Safe([1, 1, 1, 1]);
  A(!s2.blast([0, 0, 0], [0, 0, 0], false) && !s2.blast([5, 0, 0], [0, 0, 0], true), 'the wrong blast opened it');
  A(s2.blast([1, 0, 0], [0, 0, 0], true) && s2.open && s2.blown, 'a breaching charge beside it did not');
  // in the level: the Estate Room safe has the level's combination and a door that moves
  const sf = L1.safes.find((x) => x.room === 'estate_room');
  A(sf.safe.code.join('') === L1.safeCode.join(''), 'the safe and the note disagree');
  A(['safe_door', 'safe_door_open', 'safe_door_blown'].every((id) => L1.movers.some((m) => m.id === id)), 'the safe door is not drawn as moving');
});
T('the lift is drawn in step with you between steps (M6.9.13: third person floated or sank)', () => {
  const L = buildHotel(), lift = L.lift;
  lift.setStopped(false);                       // (M6.10.1) it starts stopped: these tests ride it
  lift.call(1);
  for (let i = 0; i < 120; i++) lift.step(1 / 60, []);
  const a = lift.prevY, b = lift.carY;
  A(b > a, 'not moving');
  A(Math.abs(lift.drawY(0) - a) < 1e-9 && Math.abs(lift.drawY(1) - b) < 1e-9 && Math.abs(lift.drawY(0.5) - (a + b) / 2) < 1e-9, 'drawY does not go between steps');
});
T('the balcony loungers face out; the emergency exit roof is railed all round but at the ladder (M6.9.13)', () => {
  const back = L1.pieces.filter((q) => q.mat === 'cloth' && q.min[1] > FLOORS[2] + 0.37 && q.min[1] < FLOORS[2] + 0.39 && q.max[1] > FLOORS[2] + 0.7 && q.min[2] > 7 * S && q.max[2] < 8 * S);
  A(back.length === 2 && back.every((q) => q.min[2] > 7 * S + 0.9), 'the loungers\' backs are not on the room side: ' + back.map((q) => q.min[2].toFixed(2)));
  const y = FLOORS[1];
  const railAt = (x, z) => L1.world.solids.some((q) => q.min[0] <= x + 0.1 && q.max[0] >= x - 0.1 && q.min[2] <= z + 0.1 && q.max[2] >= z - 0.1 && q.max[1] > y + 0.8 && q.min[1] < y + 0.5);
  for (const x of [7 * S + 0.05, 23 * S - 0.05]) A(railAt(x, 42 * S), 'no railing at the roof\'s end x=' + x);
  A(!railAt(13.5 * S, 43 * S), 'the railing closes off the ladder');
});
T('the Balcony Suite: a bed, its balcony open to the sky behind a glass balustrade, stepped out on to', () => {
  const [mn, mx] = L1.zones.balcony_suite;
  const P = L1.pieces.filter((q) => q.min[1] >= FLOORS[2] - 0.01 && q.max[1] < FLOORS[2] + 3.4 && q.min[0] > mn[0] - 1 && q.max[0] < mx[0] + 1 && q.min[2] > 6 * S - 0.5 && q.max[2] < 12 * S);
  A(P.some((q) => q.mat === 'cloth' && q.max[0] - q.min[0] > 1.9 && q.max[2] - q.min[2] > 1.9), 'no bed');
  const z = 7.5 * S;
  A(!L1.world.solids.some((q) => q.min[1] > FLOORS[2] + 2 && q.min[1] < FLOORS[2] + 5 && q.min[2] < z && q.max[2] > z && q.min[0] < 15 * S && q.max[0] > 14 * S), 'a ceiling over the balcony');
  A(L1.world.solids.some((q) => q.glass && q.min[2] < 6.5 * S && q.max[2] > 6.5 * S && Math.abs(q.max[1] - (FLOORS[2] + 1.05)) < 0.01), 'no glass balustrade along the front');
  const p = new Player(L1.world);
  p.pos = [15 * S, FLOORS[2], 10 * S]; p.vel = [0, 0, 0];
  step(p, { moveZ: 1, yaw: 0 }, 60 * 3);
  A(p.pos[2] < 8 * S && p.pos[2] > 6.5 * S && Math.abs(p.pos[1] - FLOORS[2]) < 0.1, 'not out on the balcony, or through the balustrade: ' + p.pos.map((v) => v.toFixed(2)));
});
T('the lift\'s emergency stop: it finishes its trip, then refuses calls till it is reset', () => {
  const L = buildHotel(), lift = L.lift;
  lift.setStopped(false);                       // (M6.10.1) it starts stopped: these tests ride it
  A(L.liftStop && Math.abs(L.liftStop.pos[1] - FLOORS[2]) < 0.01, 'no emergency stop on the second floor');
  lift.call(1);
  for (let i = 0; i < 90; i++) lift.step(1 / 60, []);
  lift.setStopped(true);
  for (let i = 0; i < 60 * 10; i++) lift.step(1 / 60, []);
  A(lift.at === 1 && !lift.moving, 'it did not finish its trip: at ' + lift.at);
  A(lift.call(2) === 'stopped' && lift.call(0) === 'stopped', 'it took a call while stopped');
  lift.setStopped(false);
  A(lift.call(2) === 'coming', 'it did not come back into service');
});

T('the buildings\' windows run on round their corners: the facade meets itself at each corner (M6.9.15)', () => {
  const p = { min: [3, 0, 7], max: [19.4, 20, 31.1] };
  const reps = Math.round(2 * (16.4 + 24.1) / 12);
  const frac = (u) => ((u % 1) + 1) % 1;
  const corners = [
    [[0, 0, -1], [3, 5, 7], [-1, 0, 0], [3, 5, 7]],
    [[-1, 0, 0], [3, 5, 31.1], [0, 0, 1], [3, 5, 31.1]],
    [[0, 0, 1], [19.4, 5, 31.1], [1, 0, 0], [19.4, 5, 31.1]],
    [[1, 0, 0], [19.4, 5, 7], [0, 0, -1], [19.4, 5, 7]],
  ];
  for (const [na, va, nb, vb] of corners) {
    const ua = wrapU(p, na, va), ub = wrapU(p, nb, vb);
    A(Math.abs(frac(ua) - frac(ub)) < 1e-9 || Math.abs(Math.abs(frac(ua) - frac(ub)) - 1) < 1e-9, 'a seam at corner ' + va + ': ' + ua + ' / ' + ub);
  }
  A(Math.abs(wrapU(p, [1, 0, 0], [19.4, 5, 7]) - reps) < 1e-9, 'not a whole number of repeats round');
});

T('the hotel at night: a dark sky with a town glow, street lamps that light the street, lit windows opposite (M6.9.17)', () => {
  A(L1.night === true, 'the hotel is not set at night');
  const lum = (c) => c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
  A(lum(skyColour(0.6, true)) < lum(skyColour(0.6)) * 0.25, 'the night sky is not dark');
  A(lum(skyColour(0.0, true)) > lum(skyColour(0.6, true)), 'no glow of town along the horizon');
  const street = L1.lights.filter((l) => l.street);
  A(street.length === L1.lamps.length && street.length >= 15, 'street lamps lit: ' + street.length + ' of ' + L1.lamps.length);
  const rooms = L1.lights.filter((l) => !l.street && !l.sewer);   // (M6.9.25) the sewer's lamps are the city's
  // (M6.9.19, Rhys) the power is cut: the fittings hang there, giving no light - night vision's job
  A(L1.powerOut === true && rooms.length === 0, 'lights on inside with the power cut: ' + rooms.length);
  A(L1.pieces.filter((q) => q.mat === 'lamp' && q.max[1] - q.min[1] < 0.15 && q.max[0] - q.min[0] > 1.1).length > 30, 'the ceiling fittings are gone');
  // the reinforced doors (that a charge opens) do not look like the lift's (that nothing opens)
  A(L1.swingDoors.filter((d) => d.def.build === 'reinforced').every((d) => d.def.mat === 'armour'), 'a reinforced door is not in armour plate');
  A(street.every((l) => L1.lamps.some((p) => Math.hypot(p.pos[0] - l.pos[0], p.pos[2] - l.pos[2]) < 0.01)), 'a street light with no lamp post');
});

// ── the third floor (M6.9.20) ──
T('up the Balcony Suite\'s stairs to the third floor, and back down', () => {
  const p = new Player(L1.world);
  // (M6.9.21) the foot swung round: up four steps southwards out of the room, then east
  p.pos = [13.7, FLOORS[2], 14.2]; p.vel = [0, 0, 0];
  for (let i = 0; i < 60 * 3 && p.pos[2] < 17.1; i++) step(p, { moveZ: 1, yaw: Math.PI }, 1);   // south, up the foot to the landing
  A(p.pos[1] > FLOORS[2] + 0.6 && p.pos[2] > 16.4, 'not up on the landing: ' + p.pos.map((v) => v.toFixed(2)));
  step(p, { moveZ: 1, yaw: -Math.PI / 2 }, 60 * 5);               // east, up
  A(Math.abs(p.pos[1] - FLOORS[3]) < 0.1 && p.pos[0] > 19.5, 'not up on the third floor: ' + p.pos.map((v) => v.toFixed(2)));
  step(p, { moveZ: 1, yaw: Math.PI / 2 }, 60 * 5);                // west, back down to the landing
  step(p, { moveZ: 1, yaw: 0 }, 60 * 2);                           // north, down the foot into the room
  A(Math.abs(p.pos[1] - FLOORS[2]) < 0.1, 'not back down: ' + p.pos.map((v) => v.toFixed(2)));
  // no carpet over the opening upstairs
  A(!L1.pieces.some((q) => q.mat === 'carpet' && Math.abs(q.min[1] - FLOORS[3]) < 0.01 && q.min[0] < 18 && q.max[0] > 15 && q.min[2] < 17.5 && q.max[2] > 17), 'carpet laid over the stairs\' opening');
});
T('the third floor: the Upper Balcony Suite - four-poster, kitchenette with the Roof key, dining table, corner sofa; no crates', () => {
  const [mn, mx] = L1.zones.upper_balcony_suite || [];
  A(mn, 'no Upper Balcony Suite');
  const P = L1.pieces.filter((q) => q.min[1] >= FLOORS[3] - 0.01 && q.max[1] < FLOORS[3] + 3.4);
  A(P.filter((q) => q.mat === 'wood' && q.max[1] - q.min[1] > 2.4 && q.max[0] - q.min[0] < 0.2).length >= 4, 'no four-poster');
  A(P.some((q) => q.mat === 'wood' && q.max[2] - q.min[2] > 8 && Math.abs(q.max[1] - FLOORS[3] - 0.77) < 0.01), 'no long dining table');
  A(P.filter((q) => q.mat === 'fabric' && q.max[1] - q.min[1] < 0.45 && Math.max(q.max[0] - q.min[0], q.max[2] - q.min[2]) > 4).length >= 2, 'no corner sofa');
  // no plain 'cover' blocks (1.2 m wooden cubes standing in the C squares)
  A(!P.some((q) => q.mat === 'wood' && Math.abs(q.max[1] - q.min[1] - 1.0) < 0.01 && Math.abs(q.max[0] - q.min[0] - 1.2) < 0.01 && Math.abs(q.max[2] - q.min[2] - 1.2) < 0.01), 'cover blocks in the suite');
  const key = L1.keys.find((k) => k.id === 'roof');
  A(key && key.pos[1] > FLOORS[3] + 0.9 && key.pos[0] < 15 && key.pos[2] > 39 && key.pos[2] < 41, 'the Roof key is not on the breakfast bar: ' + (key && key.pos));
  const door = L1.swingDoors.find((d) => d.needs === 'roof');
  A(door && door.def.build === 'reinforced' && Math.abs(door.def.y0 - FLOORS[3]) < 0.01, 'the door to the roof does not take the key');
});
T('the third floor\'s balcony is open to the sky; the rest has its roof', () => {
  const roofOver = (x, z) => L1.world.solids.some((q) => q.min[1] > FLOORS[3] + 3 && q.min[1] < FLOORS[3] + 3.7 && q.min[0] < x && q.max[0] > x && q.min[2] < z && q.max[2] > z);
  A(!roofOver(14.6 * S, 9.5 * S), 'a roof over the balcony');
  A(roofOver(14.6 * S, 20.5 * S) && roofOver(10.5 * S, 34.5 * S), 'no roof over the suite');
  // and you can step out on to it through the doorway in the front wall
  const p = new Player(L1.world);
  p.pos = [15 * S, FLOORS[3], 12 * S]; p.vel = [0, 0, 0];
  step(p, { moveZ: 1, yaw: 0 }, 60 * 3);
  A(p.pos[2] < 10 * S && p.pos[2] > 8.5 * S && Math.abs(p.pos[1] - FLOORS[3]) < 0.1, 'not out on the balcony: ' + p.pos.map((v) => v.toFixed(2)));
});

// ── the roof (M6.9.21) ──
T('up the ladder from the third floor\'s back room, through the hatch, out on to the roof', () => {
  const lad = L1.roofLadder;
  A(lad, 'no roof ladder');
  const p = new Player(L1.world);
  p.pos = [lad.x, FLOORS[3], lad.z - 1.2]; p.vel = [0, 0, 0];
  let on = false;
  for (let i = 0; i < 60 * 4 && !on; i++) { step(p, { moveZ: 1, yaw: Math.PI }, 1); if (p.mode === 'ladder') on = true; }
  A(on, 'could not get on the ladder: ' + p.pos.map((v) => v.toFixed(2)) + ' ' + p.mode);
  step(p, { moveZ: 1, yaw: Math.PI }, 60 * 8);
  A(p.mode !== 'ladder' && Math.abs(p.pos[1] - FLOORS.R) < 0.15, 'not out on the roof: ' + p.pos.map((v) => v.toFixed(2)) + ' ' + p.mode);
  // (M6.9.22) and away from the top of it, past the hatch's rail, along the edge
  const x0 = p.pos[0];
  step(p, { moveZ: 1, yaw: Math.PI / 2 }, 60 * 2);
  A(x0 - p.pos[0] > 1.5 && Math.abs(p.pos[1] - FLOORS.R) < 0.15, 'stuck at the top of the ladder: ' + p.pos.map((v) => v.toFixed(2)));
});
T('the roof: a parapet all round (not climbable), plant on it, the helicopter hovering beyond the north parapet', () => {
  const y = FLOORS.R;
  const wallAt = (x, z) => L1.world.solids.find((q) => q.min[0] <= x && q.max[0] >= x && q.min[2] <= z && q.max[2] >= z && q.min[1] >= y - 0.01 && q.max[1] > y + 0.9 && q.max[1] < y + 1.3);
  for (const [x, z] of [[7 * S + 0.15, 24 * S], [23 * S - 0.15, 24 * S], [11 * S, 12 * S + 0.15], [10 * S, 37 * S - 0.15], [15.5 * S, 40 * S - 0.15]]) {
    const w = wallAt(x, z);
    A(w && w.noClimb, 'no parapet at ' + x + ', ' + z);
  }
  A(L1.pieces.filter((q) => q.mat === 'metal' && Math.abs(q.min[1] - y) < 0.01 && Math.abs(q.max[1] - y - 1.1) < 0.01).length >= 10, 'no rooftop plant');
  const h = L1.helicopter;
  A(h && h.pos[1] > y + 2 && h.pos[2] < 12 * S, 'no helicopter over the north edge: ' + (h && h.pos));
  const rotor = L1.movers.find((m) => m.id === 'heli_rotor');
  A(rotor && typeof rotor.yaw === 'function', 'its rotor does not turn');
  h.t = 0.1; const a = rotor.yaw(); h.t = 0.2; A(rotor.yaw() !== a, 'its rotor stands still');
});

T('the helicopter\'s way out: a gap in the north parapet before it, the strip beyond railed, a rope ladder down (M6.9.23)', () => {
  const y = FLOORS.R;
  const solidAt = (x, z) => L1.world.solids.some((q) => q.min[0] <= x && q.max[0] >= x && q.min[2] <= z && q.max[2] >= z && q.min[1] >= y - 0.01 && q.min[1] < y + 0.5 && q.max[1] > y + 0.8);
  A(!solidAt(22.5, 12 * S + 0.15), 'no gap in the parapet before the helicopter');
  A(solidAt(22.5, 10 * S + 0.08), 'the strip beyond the gap is not railed at its edge');
  const body = L1.movers.find((m) => m.id === 'heli_body');
  const rungs = body.pieces.filter((q) => q.mat === 'wood');
  A(rungs.length >= 8 && Math.min(...rungs.map((q) => q.min[1])) + L1.helicopter.pos[1] < y + 0.6, 'no rope ladder down to the roof');
});
T('the buildings round about have plain roofs (a lip, chimneys, vents), not windows (M6.9.23)', () => {
  const blocks = L1.pieces.filter((q) => q.mat === 'facade');
  A(blocks.length > 5, 'no buildings');
  for (const b of blocks) {
    const cap = L1.pieces.some((q) => q.mat === 'concrete2' && Math.abs(q.min[1] - b.max[1]) < 0.01 && q.min[0] <= b.min[0] + 0.01 && q.max[0] >= b.max[0] - 0.01 && q.min[2] <= b.min[2] + 0.01 && q.max[2] >= b.max[2] - 0.01);
    A(cap, 'a building with windows on its roof at ' + b.min.map((v) => v.toFixed(1)));
  }
});

console.log('\n-- THE BASEMENT AND THE SEWER (M6.9.25) --');
const zoneAt = (L, p) => (L.world.zones.find((z) => p[0] > z.min[0] && p[0] < z.max[0] && p[1] > z.min[1] && p[1] < z.max[1] && p[2] > z.min[2] && p[2] < z.max[2]) || {}).id;
T('the ground\'s slab is whole but for two holes: the manhole and the cellar stairs', () => {
  const pcs = slabPieces(-10, -10, 40, 70, slabHoles());
  const covered = (x, z) => pcs.some((q) => x > q.x0 && x < q.x1 && z > q.z0 && z < q.z1);
  A(!covered(MANHOLE.x, (MANHOLE.z0 + MANHOLE.z1) / 2), 'no manhole');
  A(!covered((CELLAR_STAIR.xW + CELLAR_STAIR.xE) / 2, (CELLAR_STAIR.zN + CELLAR_STAIR.zS) / 2), 'no opening for the cellar stairs');
  let holes = 0; for (let x = -9.75; x < 40; x += 0.5) for (let z = -9.75; z < 70; z += 0.5) if (!covered(x, z)) holes++;
  A(holes > 10 && holes < 70, 'the slab has ' + holes + ' half-metre squares missing');
  const p = new Player(L1.world); p.pos = [20, 0.5, 3]; p.vel = [0, 0, 0]; step(p, {}, 60);
  A(Math.abs(p.pos[1]) < 0.02, 'the road does not hold you up: ' + p.pos[1]);
});
T('down the cellar stairs from the bar, into the basement, and back up', () => {
  const st = CELLAR_STAIR, xM = (st.xW + st.xE) / 2;
  const p = new Player(L1.world); p.pos = [(xM + st.xE) / 2, 0, st.zN - 1.5]; p.vel = [0, 0, 0];
  step(p, { moveZ: 1, yaw: Math.PI }, 150);                         // down the east flight, south
  A(Math.abs(p.pos[1] - SEWER.floor / 2) < 0.1, 'not on the half landing: ' + p.pos.map((v) => v.toFixed(2)));
  step(p, { moveX: 1, yaw: Math.PI }, 60);                          // across the landing
  step(p, { moveZ: 1, yaw: 0 }, 150);                               // down the west flight, north
  A(Math.abs(p.pos[1] - SEWER.floor) < 0.05 && zoneAt(L1, p.pos) === 'basement', 'not in the basement: ' + p.pos.map((v) => v.toFixed(2)) + ' ' + zoneAt(L1, p.pos));
  step(p, { moveX: -1, yaw: 0 }, 90);                               // west, into the cellar proper
  A(p.pos[0] < 9.5, 'cannot get into the cellar from the foot of the stairs: ' + p.pos.map((v) => v.toFixed(2)));
  step(p, { moveX: 1, yaw: 0 }, 90); p.pos[0] = (st.xW + xM) / 2;   // back to the foot
  step(p, { moveZ: 1, yaw: Math.PI }, 150);
  step(p, { moveX: -1, yaw: Math.PI }, 60);
  step(p, { moveZ: 1, yaw: 0 }, 150);
  A(Math.abs(p.pos[1]) < 0.05 && p.pos[2] < st.zN, 'did not get back up to the bar: ' + p.pos.map((v) => v.toFixed(2)));
});
T('the opening in the bar is railed, but at the head of the stairs; the back bar stops short of it', () => {
  const st = CELLAR_STAIR, xM = (st.xW + st.xE) / 2;
  // across the head of the lower flight (the back bar's cupboard stands in front of most of it)
  const railed = (x, z) => L1.world.solids.some((q) => q.noClimb && x > q.min[0] && x < q.max[0] && z > q.min[2] && z < q.max[2] && q.min[1] <= 0.01 && q.max[1] >= 0.9);
  for (let x = st.xW + 0.1; x < xM - 0.1; x += 0.2) A(railed(x, st.zN - 0.06), 'no railing over the lower flight at x ' + x.toFixed(2));
  let p = new Player(L1.world); p.pos = [st.xE + 0.8, 0, (st.zN + st.zS) / 2]; p.vel = [0, 0, 0];
  step(p, { moveX: -1, yaw: 0 }, 120);
  A(Math.abs(p.pos[1]) < 0.02, 'fell in from the side: ' + p.pos.map((v) => v.toFixed(2)));
  const shelves = L1.pieces.filter((q) => q.min[1] >= 0.85 && q.max[1] < 2.0 && q.min[0] > st.xW && q.max[0] < st.xW + 1.4 && q.max[2] > 34 && q.min[2] < 46 && (q.mat === 'glass' || q.mat === 'barrel'));
  A(shelves.length > 10 && shelves.every((q) => q.max[2] <= st.zN), 'the back bar runs over the stairs');
});
T('the cellar\'s door to the sewer is locked, and gives to a kick or a charge, not a key', () => {
  A(L1.cellarDoors.length === 1, 'cellar doors: ' + L1.cellarDoors.length);
  const d = L1.cellarDoors[0];
  A(d.locked && d.def.build === 'sturdy' && Math.abs(d.def.y0 - SEWER.floor) < 0.01, 'not a locked, sturdy door down below');
  const L = buildHotel(), dd = L.cellarDoors[0];
  const p = new Player(L.world); p.pos = [(dd.def.from + dd.def.to) / 2, SEWER.floor, dd.def.at + 1.5]; p.vel = [0, 0, 0];
  step(p, { moveZ: 1, yaw: 0 }, 120);
  A(p.pos[2] > dd.def.at, 'walked through a locked door: ' + p.pos.map((v) => v.toFixed(2)));
  dd.locked = false; dd.set(true, 1);
  step(p, { moveZ: 1, yaw: 0 }, 120);
  A(p.pos[2] < dd.def.at - 2 && zoneAt(L, p.pos) === 'sewer', 'did not get through into the sewer: ' + p.pos.map((v) => v.toFixed(2)) + ' ' + zoneAt(L, p.pos));
});
T('down the manhole by the Ghost APC on the sewer\'s ladder, and back up', () => {
  A(L1.sewerLadder && Math.abs(L1.sewerLadder.x - MANHOLE.x) < 0.01, 'the ladder is not under the manhole');
  let p = new Player(L1.world); p.pos = [MANHOLE.x, 0, 0.3]; p.vel = [0, 0, 0];
  let on = false; for (let i = 0; i < 600 && !on; i++) { step(p, { moveZ: -1, yaw: 0 }, 1); on = p.mode === 'ladder'; }
  A(on, 'could not back on to the ladder from the road: ' + p.pos.map((v) => v.toFixed(2)) + ' ' + p.mode);
  step(p, { moveZ: -1, yaw: 0 }, 240);
  A(Math.abs(p.pos[1] - SEWER.floor) < 0.05 && zoneAt(L1, p.pos) === 'sewer', 'not down in the sewer: ' + p.pos.map((v) => v.toFixed(2)));
  p = new Player(L1.world); p.pos = [MANHOLE.x, SEWER.floor, 3]; p.vel = [0, 0, 0];
  step(p, { moveZ: 1, yaw: 0 }, 300);
  A(Math.abs(p.pos[1]) < 0.05 && p.pos[2] < MANHOLE.z0, 'did not climb out on to the road: ' + p.pos.map((v) => v.toFixed(2)) + ' ' + p.mode);
});
T('the sewer: water you wade, not swim, running south between dry walkways; steps down and across', () => {
  A(L1.sewerWater.length >= 3 && L1.water.filter((w) => w.sewer).every((w) => w.flow && w.flow[1] > 0), 'no flowing water');
  A(SEWER.water - SEWER.bed < 1.25, 'deep enough to swim');
  A(L1.sewerSteps.length >= 4, 'steps: ' + L1.sewerSteps.length);
  const z = L1.sewerSteps[0].z;
  const p = new Player(L1.world); p.pos = [12.5, SEWER.floor, z]; p.vel = [0, 0, 0];
  let wading = false;
  for (let i = 0; i < 240; i++) { step(p, { moveX: 1, yaw: 0 }, 1); if (p.waterInfo()) { wading = true; A(p.mode === 'walk', 'swimming in the sewer'); } }
  A(wading, 'never in the water');
  A(Math.abs(p.pos[1] - SEWER.floor) < 0.05 && p.pos[0] > 17, 'did not get across and up on to the east walkway: ' + p.pos.map((v) => v.toFixed(2)));
  // the west walkway's low wall: cover, chest high from the channel
  const wall = L1.world.solids.filter((q) => Math.abs(q.max[1] - (SEWER.floor + 1.0)) < 0.01 && q.max[0] - q.min[0] < 0.3 && Math.abs(q.max[0] - 9 * S) < 0.01);
  A(wall.length >= 16, 'the low wall along the west walkway: ' + wall.length);
});
T('the basement holds the bar\'s kegs, a boiler and the mains board; the sewer has grilles at both ends', () => {
  const [mn, mx] = L1.zones.basement;
  const inB = L1.pieces.filter((q) => q.min[1] >= SEWER.floor - 0.01 && q.max[1] <= -0.99 && q.min[0] >= mn[0] - 0.01 && q.max[0] <= mx[0] + 0.01 && q.min[2] >= mn[2] - 0.01 && q.max[2] <= mx[2] + 0.01);
  A(inB.filter((q) => q.mat === 'barrel').length >= 6, 'no kegs and boiler');
  A(L1.signs.some((s) => s.text === 'MAINS') && L1.signs.some((s) => s.text === 'CELLAR'), 'no signs');
  const bars = L1.pieces.filter((q) => q.mat === 'metal' && q.min[1] <= SEWER.bed + 0.01 && q.max[0] - q.min[0] < 0.06);
  A(bars.some((q) => q.min[2] < 3) && bars.some((q) => q.min[2] > 45), 'no grilles at the ends');
  A(BUILT.includes('B'), 'the basement is not counted as built');
  // the city's power is on: lamps in the sewer, none in the hotel's cellar
  const sewerLights = L1.lights.filter((l) => l.pos[1] < -1 && l.pos[2] < 25 * S);
  A(sewerLights.length >= 4, 'the sewer is unlit: ' + sewerLights.length);
  A(!L1.lights.some((l) => l.pos[0] > mn[0] && l.pos[0] < mx[0] && l.pos[1] > mn[1] && l.pos[1] < mx[1] && l.pos[2] > mn[2] && l.pos[2] < mx[2]), 'a light in the cellar, with the power cut');
});

console.log('\n-- THE REDS (M6.10.0) --');
T('nineteen reds from the Guards tab, on their floors, each where he fits (P13 A is P13, not a twentieth)', () => {
  const g = L1.guards;
  A(g.length === 19, 'guards: ' + g.length);
  A(!g.some((q) => q.id === 'P13A'), 'P13 A came in as a second man');
  const want = { P1: 'G', P2: 'G', P19: 'G', P3: '1', P4: '1', P5: '1', P6: '1', P7: '2', P8: '2', P9: '2', P10: '2', P11: '3', P12: '3', P13: '3', P14: 'R', P15: 'R', P16: 'R', P17: 'R', P18: 'R' };
  for (const [id, fl] of Object.entries(want)) {
    const q = g.find((x) => x.id === id);
    A(q && Math.abs(q.pos[1] - FLOORS[fl]) < 0.01, id + ' not on floor ' + fl);
  }
  for (const q of g) {
    A(ARMS[q.armsName] && RANKS[q.rank] && TEMPER[q.temper], q.id + ' has something the brain does not know: ' + [q.armsName, q.rank, q.temper]);
    const b = q.box(), hit = L1.world.hits([b[0][0], b[0][1] + 0.05, b[0][2]], b[1][2] !== undefined ? b[1] : b[1]).filter((s2) => !s2.person && s2 !== q.target.solid);
    A(!hit.length, q.id + ' stands inside ' + (hit[0] && hit[0].tag));
  }
  const by = (id) => g.find((x) => x.id === id);
  A(by('P1').armsName === 'shotgun' && by('P5').rank === 'specialist' && by('P9').temper === 'cowardly' && by('P13').rank === 'officer', 'the sheet\'s details did not come through');
});
T('their rounds: R2 clockwise, R3 anticlockwise, P7 and P8 opposite each other on one ring, open routes walked there and back', () => {
  const g = (id) => L1.guards.find((x) => x.id === id);
  const sq = (p) => [Math.round(p[0] / S - 0.5), Math.round(p[1] / S - 0.5)];
  const area = (r) => { let a = 0; for (let i = 0; i < r.length; i++) { const p = sq(r[i]), q = sq(r[(i + 1) % r.length]); a += p[0] * q[1] - q[0] * p[1]; } return a; };
  A(area(g('P2').route) > 0, 'R2 is not clockwise');
  A(area(g('P3').route) < 0, 'R3 is not anticlockwise');
  const p7 = sq(g('P7').route[0]), p8 = sq(g('P8').route[0]);
  A(p7.join() === '19,34' && p8.join() === '10,32', 'P7 and P8 do not start across the ring: ' + p7 + ' / ' + p8);
  const r6 = g('P6').route.map(sq).map(String);
  A(r6[0] === '12,10' && r6.includes('14,10') && r6[r6.length - 1] !== '14,10', 'R6 is not walked to (14, 10) and back: ' + r6.join(' '));
  // every leg of every round is a straight walk with nothing in the way
  for (const q of L1.guards) {
    if (!q.route) continue;
    for (let i = 0; i < q.route.length; i++) {
      const a = q.route[i], b = q.route[(i + 1) % q.route.length], y = q.pos[1] + 1.0;
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (d < 0.01) continue;
      const hit = L1.world.raycast([a[0], y, a[1]], [(b[0] - a[0]) / d, 0, (b[1] - a[1]) / d], d, (s2) => s2.person || s2.tag === 'hdoor');
      A(!hit, q.id + ' walks into ' + (hit && hit.solid && hit.solid.tag) + ' between ' + sq(a) + ' and ' + sq(b));
    }
  }
});
T('route order: a ring is walked round from the post, a line to its end and back (pure)', () => {
  const ring = [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1]];
  const o = orderRoute(ring, [0, 0], 'clockwise');
  A(o.loop && o.order[0].join() === '0,0' && o.order[1].join() === '1,0', 'clockwise from the top-left goes east first: ' + o.order.map(String).join(' '));
  const a = orderRoute(ring, [0, 0], 'anticlockwise');
  A(a.order[1].join() === '0,1', 'anticlockwise goes south first');
  A(corners(o.order, true).length === 4, 'a square ring has four corners');
  const line = orderRoute([[5, 0], [5, 1], [5, 2], [5, 3]], [4, 1], null);
  A(!line.loop && line.order.length === 4, 'a line with the post beside its middle: no branch');
});
T('in the dark: the officers and specialists wear night vision, the rest carry torches', () => {
  A(L1.dark === true, 'the hotel is not dark to the guards');
  for (const q of L1.guards) A(q.sees === (q.rank === 'officer' || q.rank === 'specialist' ? 'nvg' : 'torch'), q.id + ' sees by ' + q.sees);
});
T('they can find their way between floors: the lobby stairs, both half landings', () => {
  const nav = new NavGrid(L1.world, L1.navFloors, L1.navLinks);
  const g = (id) => L1.guards.find((x) => x.id === id).pos;
  for (const [a, b] of [['P2', 'P3'], ['P1', 'P8'], ['P19', 'P6']]) {
    const p = nav.find(g(a), g(b));
    A(p && Math.abs(p[p.length - 1][1] - g(b)[1]) < 0.1, 'no way from ' + a + ' to ' + b);
  }
});
const darkWorld = () => { const w = new World(); w.addSolid([-50, -1, -50], [50, 0, 50], 'floor'); return w; };
const youAt = (x, z) => ({ pos: [x, 0, z], eye: [x, 1.64, z], chest: [x, 1.0, z], stance: 0, speed: 0, noise: 0, box: [[x - 0.3, 0, z - 0.3], [x + 0.3, 1.8, z + 0.3]] });
T('a torch sees only down its beam (and close by); night vision sees as by day; with neither, only close by', () => {
  const w = darkWorld();
  const sees = (kit, x, z, dark) => { const g = new Guard(w, { pos: [0, 0, 0], yaw: 0, sees: kit }); return g.visibility({ world: w, you: youAt(x, z), dark }) > 0; };
  A(sees('torch', 0, -15, true), 'a torch does not see straight down its beam at 15 m');
  A(!sees('torch', 6, -10, true), 'a torch sees 30 degrees off its beam at 12 m');
  A(sees('torch', 2, -2.5, true), 'a torch does not see someone right beside him');
  A(sees('nvg', 6, -10, true), 'night vision does not see off to the side');
  A(!sees(null, 6, -10, true) && sees(null, 6, -10, false), 'no kit: blind in the dark, fine by day');
  A(!sees('torch', 0, -25, true), 'a torch beam reaches past ' + DARK.beamRange + ' m');
});
T('a flashbang is far worse through night vision; a coward runs when hit', () => {
  const w = darkWorld();
  const blind = (kit) => { const g = new Guard(w, { pos: [0, 0, 0], yaw: 0, sees: kit }); return g.flash([0, 1.6, -3], 9, 4.5, { world: w, dark: true }); };
  A(blind('nvg') > blind('torch') * 1.4, 'night vision made no difference: ' + blind('nvg') + ' vs ' + blind('torch'));
  const c = new Guard(w, { pos: [0, 0, 0], yaw: 0, temper: 'cowardly', route: [[0, 0], [0, -20]] });
  const ctx = { world: w, you: youAt(0, 8), dark: false };
  c.target.hp -= 10;
  c.step(1 / 15, ctx);
  A(c.state === 'flee' && c.fleeTo, 'a coward hit did not run: ' + c.state);
  for (let i = 0; i < 60 * 12; i++) c.step(1 / 60, ctx);
  A(Math.hypot(c.pos[0], c.pos[2] - 8) > 15, 'he did not get away from you: ' + c.pos.map((v) => v.toFixed(1)));
  const b = new Guard(w, { pos: [0, 0, 0], yaw: 0, temper: 'bold' });
  b.target.hp -= 10; b.step(1 / 15, ctx);
  A(b.state !== 'flee', 'a bold man ran');
  A(ARMS.shotgun.damage > ARMS.carbine.damage && ARMS.shotgun.far < ARMS.carbine.far, 'a shotgun should hit hard and reach short');
});
T('the lift starts stopped: out of service till its reset in the machine room is pressed (M6.10.1, Rhys)', () => {
  const L = buildHotel();
  A(L.lift.stopped === true, 'the lift is running at the start');
  A(L.lift.call(1) === 'stopped', 'a stopped lift took a call to another floor');
  L.lift.setStopped(false);
  A(L.lift.call(1) !== 'stopped', 'reset, it still refuses');
});
T('a coward hurt runs to somewhere he can actually reach, far from you (M6.10.1, Rhys: they did not run)', () => {
  const L = buildHotel(), nav = new NavGrid(L.world, L.navFloors, L.navLinks);
  const g = L.guards.find((q) => q.id === 'P9'), s0 = g.pos.slice();
  const yp = [g.pos[0] - Math.sin(g.yaw) * 5, g.pos[1], g.pos[2] - Math.cos(g.yaw) * 5];
  const you = { pos: yp, eye: [yp[0], yp[1] + 1.64, yp[2]], chest: [yp[0], yp[1] + 1, yp[2]], stance: 0, speed: 0, noise: 0, box: [[yp[0] - 0.3, yp[1], yp[2] - 0.3], [yp[0] + 0.3, yp[1] + 1.8, yp[2] + 0.3]] };
  const ctx = { world: L.world, nav, guards: L.guards, doors: L.swingDoors, noises: [], pathBudget: { left: 1 }, dark: false, you };
  g.target.hp -= 10;
  for (let i = 0; i < 60 * 15; i++) { ctx.pathBudget.left = 1; g.step(1 / 60, ctx); }
  A(g.state === 'flee', 'he is not fleeing: ' + g.state);
  A(Math.hypot(g.pos[0] - s0[0], g.pos[2] - s0[2]) > 10 && Math.hypot(g.pos[0] - yp[0], g.pos[2] - yp[2]) > 15, 'he did not get away: moved ' + Math.hypot(g.pos[0] - s0[0], g.pos[2] - s0[2]).toFixed(1));
  A(L.guards.find((q) => q.id === 'P13').fleeOn === 'alert' && g.fleeOn === 'hurt', 'P13 should run at the first sign of trouble, P9 when hurt');
});
T('a railing stops you, not a bullet or a look through its gaps (M6.10.1, Rhys)', () => {
  const rails = L1.world.solids.filter((q) => q.noClimb && q.shootThrough);
  A(rails.length > 20, 'railings that let shots through: ' + rails.length);
  const r = rails[0], c = [(r.min[0] + r.max[0]) / 2, (r.min[1] + r.max[1]) / 2, (r.min[2] + r.max[2]) / 2];
  const wide = r.max[0] - r.min[0] > r.max[2] - r.min[2];
  const from = wide ? [c[0], c[1], c[2] - 2] : [c[0] - 2, c[1], c[2]], dir = wide ? [0, 0, 1] : [1, 0, 0];
  const hit = L1.world.raycast(from, dir, 4, (q) => q.shootThrough);
  A(!hit || hit.solid !== r, 'a shot stopped at the railing');
});

T('the captain runs through the roof door, slams and locks it behind him, and climbs to the roof (M6.10.2, Rhys)', () => {
  const L = buildHotel(), nav = new NavGrid(L.world, L.navFloors, L.navLinks);
  const cap = L.guards.find((g) => g.id === 'P13'), door = L.captainEscape.door;
  A(cap.escape && cap.escape.length >= 6 && door.needs === 'roof', 'no way out planned');
  const ctx = { world: L.world, nav, guards: L.guards, doors: L.swingDoors, you: null, noises: [], dark: true, pathBudget: { left: 1 } };
  cap.flee(ctx);
  let slam = null, wasOpen = false, throughLocked = false;
  for (let i = 0; i < 60 * 60; i++) {
    ctx.pathBudget.left = 1; nav.syncDoors(L.swingDoors);
    // he must never pass the door's line while it is locked and shut
    const before = Math.sign(cap.pos[door.n] - door.def.at);
    cap.step(1 / 60, ctx);
    const after = Math.sign(cap.pos[door.n] - door.def.at);
    if (before !== after && Math.abs(cap.pos[1] - door.def.y0) < 1 && door.locked && !door.open) throughLocked = true;
    if (door.open) wasOpen = true;
    for (const ev of cap.events) if (ev.type === 'slam') slam = i / 60;
    cap.events.length = 0;
  }
  A(wasOpen && slam !== null, 'he never opened and slammed the door');
  A(!throughLocked, 'he walked through a locked door');
  A(door.locked && !door.open, 'the door is not locked behind him');
  A(Math.abs(cap.pos[1] - FLOORS.R) < 0.05 && Math.hypot(cap.pos[0] - L.captainEscape.post[0], cap.pos[2] - L.captainEscape.post[2]) < 1.5, 'he is not at his place on the roof: ' + cap.pos.map((v) => v.toFixed(1)));
  A(cap.cowering, 'he does not settle there');
});
T('supplies: two C5 charges in Room 104, a one-use trauma kit in Room 201 (M6.10.3, Rhys)', () => {
  const by = (r) => L1.supplies.find((s2) => s2.room === r);
  const c5 = by('Room 104'), tk = by('Room 201');
  A(c5 && c5.crate.items.filter((i) => i === 'C5').length === 2 && Math.abs(c5.crate.pos[1] - FLOORS[1]) < 1.0, 'no C5 box in Room 104');
  A(tk && tk.crate.items.join() === 'MEDKIT_FULL' && Math.abs(tk.crate.pos[1] - FLOORS[2]) < 1.0, 'no trauma kit in Room 201');
  A(L1.crates.includes(c5.crate) && L1.crates.includes(tk.crate), 'they cannot be opened');
  // in its room (the zones stop short of the walls the furniture stands against: 0.7 m of grace)
  for (const s2 of [c5, tk]) {
    const zn = L1.world.zones.find((q) => q.label && q.label.endsWith(' - ' + s2.room)), p = s2.crate.pos;
    A(zn && p[0] > zn.min[0] - 0.7 && p[0] < zn.max[0] + 0.7 && p[2] > zn.min[2] - 0.7 && p[2] < zn.max[2] + 0.7 && p[1] >= zn.min[1] && p[1] < zn.max[1], s2.room + ': not inside its room');
  }
  for (const s2 of [c5, tk]) A(s2.onTable, s2.room + ': left on the floor, not on a table (M6.11.0)');
});
console.log('\n-- THE HOSTAGES (M6.11.0) --');
T('three hostages where the map has them, bound, and shootable', () => {
  const h = L1.hostages;
  A(h.length === 3, 'hostages: ' + h.length);
  const want = { H1: '1', H2: '2', H3: '3' };
  for (const q of h) {
    A(Math.abs(q.pos[1] - FLOORS[want[q.id]]) < 0.01, q.id + ' not on floor ' + want[q.id]);
    A(q.state === 'held' && q.target && q.target.solid.person, q.id + ' is not held, or cannot be hit');
  }
});
T('Hostage 3: freed, he follows you down from the third floor, out of the front doors to the police cars, and is safe', () => {
  const L = buildHotel(), nav = new NavGrid(L.world, L.navFloors, L.navLinks);
  const h = L.hostages.find((q) => q.id === 'H3'), z = L.policeZone;
  const safe = (p) => p[1] < 1 && p[0] > z.x0 && p[0] < z.x1 && p[2] > z.z0 && p[2] < z.z1;
  // freed: E held over him
  for (let i = 0; i < 120 && h.state === 'held'; i++) h.work(1 / 60);
  A(h.state === 'following', 'not freed by a held E');
  // you walk out: along the way out, at a walk, and he keeps up
  const goal = [(z.x0 + z.x1) / 2, 0, (z.z0 + z.z1) / 2];
  const way = nav.find([h.pos[0] - 1.5, h.pos[1], h.pos[2]], goal);
  A(way && way.length > 3, 'no way out for you');
  const you = { pos: way[0].slice() };
  let k = 0, maxGap = 0;
  for (let t = 0; t < 120 && h.state !== 'rescued'; t += 1 / 30) {
    // you move 3 m/s along the way
    let left = 3 / 30;
    while (left > 0 && k < way.length) {
      const q = way[k], d = Math.hypot(q[0] - you.pos[0], q[1] - you.pos[1], q[2] - you.pos[2]);
      if (d <= left) { you.pos = q.slice(); left -= d; k++; } else { for (let a = 0; a < 3; a++) you.pos[a] += (q[a] - you.pos[a]) / d * left; left = 0; }
    }
    h.step(1 / 30, { nav, you, safe });
    if (k > 2 && k < way.length) maxGap = Math.max(maxGap, Math.hypot(h.pos[0] - you.pos[0], h.pos[2] - you.pos[2]));
  }
  A(h.state === 'rescued', 'he never reached the police: ' + h.state + ' at ' + h.pos.map((v) => v.toFixed(1)) + ' (you at ' + you.pos.map((v) => v.toFixed(1)) + ')');
  A(maxGap < 12, 'he fell far behind you: ' + maxGap.toFixed(1) + ' m');
  A(h.events.some((e) => e.type === 'freed') && h.events.some((e) => e.type === 'rescued'), 'no freed/rescued events');
});
T('told to wait, he waits; told to come on, he follows; shot, he is dead', () => {
  const L = buildHotel(), nav = new NavGrid(L.world, L.navFloors, L.navLinks);
  const h = L.hostages.find((q) => q.id === 'H2');
  for (let i = 0; i < 120; i++) h.work(1 / 60);
  h.order();
  const start = h.pos.slice(), you = { pos: [h.pos[0] - 8, h.pos[1], h.pos[2]] };
  for (let i = 0; i < 90; i++) h.step(1 / 30, { nav, you });
  A(h.state === 'waiting' && Math.hypot(h.pos[0] - start[0], h.pos[2] - start[2]) < 0.01, 'he did not wait');
  h.order();
  for (let i = 0; i < 150; i++) h.step(1 / 30, { nav, you });
  A(h.state === 'following' && Math.hypot(h.pos[0] - you.pos[0], h.pos[2] - you.pos[2]) < 4, 'he did not come on: ' + h.pos.map((v) => v.toFixed(1)));
  h.target.hp = 0; h.target.down = true;
  h.step(1 / 30, { nav, you });
  A(h.state === 'dead' && h.events.some((e) => e.type === 'killed'), 'shot, he is not dead');
});
T('a freed hostage walks into the lift with you, rides it up, and follows you out (M6.11.1, Rhys)', () => {
  const L = buildHotel(), nav = new NavGrid(L.world, L.navFloors, L.navLinks), lift = L.lift;
  lift.setStopped(false);
  const h = L.hostages.find((q) => q.id === 'H1');
  for (let i = 0; i < 120; i++) h.work(1 / 60);
  // the car at the ground floor, doors open; the hostage brought down near its landing
  const d = lift.def.door, cz = (d.z0 + d.z1) / 2;
  h.pos = [d.x - 4, lift.carY, cz]; h.moveBody();
  lift.call(0);
  for (let i = 0; i < 120; i++) lift.step(1 / 30, []);
  // you step in and to the back of the car, leaving him room (M6.12.2)
  const you = { pos: [lift.def.x1 - 0.3, lift.carY, lift.def.z1 - 0.3] };
  const ctx = () => ({ nav, you, lift, doors: L.swingDoors });
  for (let i = 0; i < 300 && !lift.carries(h.pos); i++) { holdLiftFor(lift, [h]); lift.step(1 / 30, [h.box()]); h.step(1 / 30, ctx()); }
  A(lift.carries(h.pos), 'he did not get into the lift with you: ' + h.pos.map((v) => v.toFixed(2)));
  // up to the first floor: you both ride
  lift.call(1);
  for (let i = 0; i < 600 && (lift.moving || lift.at !== 1 || lift.doors < 1); i++) {
    const inH = lift.carries(h.pos), dy = lift.step(1 / 30, [h.box()]);
    you.pos[1] += dy; if (inH) { h.pos[1] += dy; h.moveBody(); }
    h.step(1 / 30, ctx());
  }
  A(Math.abs(h.pos[1] - FLOORS[1]) < 0.1 && Math.abs(you.pos[1] - FLOORS[1]) < 0.1, 'did not ride up together: ' + h.pos[1].toFixed(2) + ' / ' + you.pos[1].toFixed(2));
  // you step out onto the landing and walk off: he follows you out
  you.pos = [d.x - 4, FLOORS[1], cz];
  // (M6.12.0) you take your time: the doors would have shut on him by now - he holds them
  for (let i = 0; i < 200; i++) lift.step(1 / 30, [h.box()]);
  for (let i = 0; i < 300; i++) { holdLiftFor(lift, [h], you.pos); lift.step(1 / 30, [h.box()]); h.step(1 / 30, ctx()); }
  A(!lift.carries(h.pos) && Math.hypot(h.pos[0] - you.pos[0], h.pos[2] - you.pos[2]) < 4, 'he did not follow you out: ' + h.pos.map((v) => v.toFixed(2)));
});
T('hostages can follow you down the cellar stairs, through the sewer and up the manhole ladder (M6.11.1, Rhys)', () => {
  const L = buildHotel(), nav = new NavGrid(L.world, L.navFloors, L.navLinks);
  const a = nav.find([14.2, 0, 38], [9.5, -3.6, 20]), b = nav.find([9.5, -3.6, 20], [11.25, 0, -1]);
  A(a && a.length > 3 && a.some((q) => Math.abs(q[1] + 1.8) < 0.05), 'no way from the bar down the cellar stairs into the sewer');
  A(b && b.length > 2 && Math.abs(b[b.length - 1][1]) < 0.05, 'no way up the manhole ladder to the road');
});
T('shoving: people who meet push apart; you push whoever you walk into - but never into a wall (M6.11.1, Rhys)', () => {
  const free = () => true;
  const a = { pos: [0, 0, 0], r: 0.3 }, b = { pos: [0.2, 0, 0], r: 0.3 };
  shove([a, b], null, 1 / 30, free);
  A(Math.abs(b.pos[0] - a.pos[0]) >= 0.6 - 1e-6, 'two people on top of each other did not part: ' + (b.pos[0] - a.pos[0]));
  const h = { pos: [0.65, 0, 0], r: 0.3 };
  const you = { pos: [0, 0, 0], intent: [1, 0], r: 0.3 };
  let moved = 0;
  for (let i = 0; i < 30; i++) { const before = h.pos[0]; shove([h], you, 1 / 30, free); moved += h.pos[0] - before; you.pos[0] = h.pos[0] - 0.62; }
  A(moved > 1.5, 'walking into him for a second did not shove him: ' + moved.toFixed(2) + ' m');
  const w = { pos: [0.65, 0, 0], r: 0.3 }, wall = (p, dx) => p.pos[0] + dx < 0.7;
  for (let i = 0; i < 30; i++) shove([w], { pos: [0, 0, 0], intent: [1, 0], r: 0.3 }, 1 / 30, wall);
  A(w.pos[0] < 0.7, 'shoved through a wall');
  const side = { pos: [0, 0, 0.62], r: 0.3 }, z0 = side.pos.slice();
  shove([side], { pos: [0, 0, 0], intent: [1, 0], r: 0.3 }, 1 / 30, free);
  A(side.pos[0] === z0[0] && side.pos[2] === z0[2], 'shoved someone beside you, not in front');
});
T('the Riverside Hotel trophies: four - headshots, time, pacifist, not a scratch (M6.12.1, Rhys: seven was a lot)', () => {
  const run = (o) => { const m = new Mission({ id: 'hotel', guards: 19 }); Object.assign(m, { done: true, result: 'success', time: 900, kills: 5, headshots: 3, knockouts: 0 }, o); return m; };
  const H = (o) => Object.assign({ state: 'rescued', unhurt: false, rodeLift: false, wentSewer: false }, o);
  const ids = (m, hs) => hotelTrophies(m, hs || [H(), H(), H()], 19).map((t) => t.id).sort().join(' ');
  A(ids(run()) === '', 'an ordinary run earned something: ' + ids(run()));
  A(ids(run({ kills: 4, headshots: 4 })) === 'hotel_sharpshooter', 'headshots');
  A(ids(run({ time: HOTEL_PAR - 1 })) === 'hotel_quick', 'time');
  A(ids(run({ kills: 0, headshots: 0, knockouts: 6 })) === 'hotel_pacifist', 'pacifist');
  A(ids(run(), [H({ unhurt: true }), H({ unhurt: true }), H({ unhurt: true })]) === 'hotel_unhurt', 'not a scratch');
  A(ids(run(), [H({ rodeLift: true, wentSewer: true }), H(), H()]) === '' && ids(run({ kills: 15, headshots: 0, knockouts: 4 })) === '', 'a retired trophy is still awarded');
  A(hotelTrophies(Object.assign(run({ kills: 0 }), { result: 'failure' }), [H()], 19).length === 0, 'trophies for a failed run');
});
T('a hostage pushed somewhere a route cannot start (into the bed) still comes to you (M6.12.2, Rhys: one would not move)', () => {
  const L = buildHotel(), nav = new NavGrid(L.world, L.navFloors, L.navLinks);
  const h = L.hostages.find((q) => q.id === 'H2');
  for (let i = 0; i < 120; i++) h.work(1 / 60);
  h.pos = [32.25, FLOORS[2], 23.25]; h.moveBody();          // on the bed, where the map first put him
  const c = nav.cellAt(h.pos);
  A(!(c && nav.isOpen(c)), 'expected that spot not to be open floor');
  const you = { pos: [h.pos[0] - 5, h.pos[1], h.pos[2] - 1.5] }, start = h.pos.slice();
  for (let i = 0; i < 150; i++) h.step(1 / 30, { nav, you, doors: L.swingDoors });
  A(Math.hypot(h.pos[0] - start[0], h.pos[2] - start[2]) > 2, 'he stayed put: ' + h.pos.map((v) => v.toFixed(2)));
});
T('a door that will not swing for him: after a moment he shoulders it open, not stands there for good (M6.12.2)', () => {
  const w = darkWorld();
  const h = new Hostage(w, { id: 'H9', pos: [0, 0, 0] });
  for (let i = 0; i < 120; i++) h.work(1 / 60);
  const door = { open: false, blown: false, locked: false, solid: { min: [-1, 0, -2.1], max: [1, 2.2, -1.9] }, use() { return 'blocked'; }, set(o) { this.open = o; } };
  const you = { pos: [0, 0, -6] };
  for (let i = 0; i < 120; i++) h.step(1 / 30, { you, doors: [door] });
  A(door.open && h.pos[2] < -2.5, 'he never got past the door: ' + h.pos.map((v) => v.toFixed(2)));
  const locked = { open: false, blown: false, locked: true, solid: { min: [-1, 0, -2.1], max: [1, 2.2, -1.9] }, use() { return 'locked'; }, set(o) { this.open = o; } };
  const h2 = new Hostage(w, { id: 'H8', pos: [0, 0, 0] });
  for (let i = 0; i < 120; i++) h2.work(1 / 60);
  for (let i = 0; i < 120; i++) h2.step(1 / 30, { you, doors: [locked] });
  A(!locked.open && h2.pos[2] > -1.95, 'he went through a locked door');
});

// ── M6.12.3 ─────────────────────────────────────────────────────────────
const freeH = (L, id) => { const h = L.hostages.find((q) => q.id === id); for (let i = 0; i < 120; i++) h.work(1 / 60); return h; };
const walkWith = (h, way, ctxOf, speed, secs) => {
  const you = { pos: way[0].slice() };
  let k = 0, maxGap = 0;
  for (let t = 0; t < secs; t += 1 / 30) {
    let left = speed / 30;
    while (left > 0 && k < way.length) {
      const q = way[k], d = Math.hypot(q[0] - you.pos[0], q[1] - you.pos[1], q[2] - you.pos[2]);
      if (d <= left) { you.pos = q.slice(); left -= d; k++; } else { for (let a = 0; a < 3; a++) you.pos[a] += (q[a] - you.pos[a]) / d * left; left = 0; }
    }
    h.step(1 / 30, ctxOf(you));
    if (k > 2 && k < way.length) maxGap = Math.max(maxGap, Math.hypot(h.pos[0] - you.pos[0], h.pos[2] - you.pos[2]));
  }
  return { you, maxGap };
};
T('out of the front doors and down the pavement beside the hotel: he follows you all the way, no invisible line (M6.12.3, Rhys)', () => {
  const L = buildHotel(), nav = new NavGrid(L.world, L.navFloors, L.navLinks);
  const h = freeH(L, 'H1');
  h.pos = [12, 0, 4.5]; h.moveBody();
  // west along the road, then south down the pavement on the hotel's west side, to near the river
  const way = nav.find([13.5, 0, 3.5], [-2, 0, 60]);
  A(way && way.length > 2, 'no way down the west pavement: the ground floor grid does not reach it');
  const { you, maxGap } = walkWith(h, way, (y) => ({ nav, you: y, doors: L.swingDoors }), 3, 40);
  A(Math.hypot(h.pos[0] - you.pos[0], h.pos[2] - you.pos[2]) < 4.5, 'he stopped short: at ' + h.pos.map((v) => v.toFixed(1)) + ', you at ' + you.pos.map((v) => v.toFixed(1)));
  A(maxGap < 10, 'he fell far behind: ' + maxGap.toFixed(1));
  // and the far pavement, across the road
  const way2 = nav.find([13.5, 0, 3.5], [20, 0, -3]);
  A(way2 && way2.length, 'no way to the far pavement');
});
T('out of the lift, he steps aside from its doors - he does not stand in the doorway (M6.12.3, Rhys)', () => {
  const L = buildHotel(), nav = new NavGrid(L.world, L.navFloors, L.navLinks), lift = L.lift;
  lift.setStopped(false);
  const h = freeH(L, 'H1');
  const d = lift.def.door, cz = (d.z0 + d.z1) / 2;
  lift.call(1);
  for (let i = 0; i < 900 && (lift.moving || lift.at !== 1 || lift.doors < 1); i++) lift.step(1 / 30, []);
  // he is in the car; you have just stepped out and stand 1.8 m from the doors, in line with them
  h.pos = [(lift.def.x0 + lift.def.x1) / 2, FLOORS[1], cz]; h.moveBody();
  const you = { pos: [d.x - 1.8, FLOORS[1], cz] };
  for (let i = 0; i < 240; i++) { holdLiftFor(lift, [h], you.pos); lift.step(1 / 30, [h.box()]); h.step(1 / 30, { nav, you, lift, doors: L.swingDoors }); }
  A(!lift.carries(h.pos), 'he stayed in the car');
  const apron = h.pos[0] > d.x - 1.1 && h.pos[0] < lift.def.x0 + 0.02 && h.pos[2] > d.z0 - 0.35 && h.pos[2] < d.z1 + 0.35;
  A(!apron, 'he is standing in front of the lift doors: ' + h.pos.map((v) => v.toFixed(2)));
  A(Math.hypot(h.pos[0] - you.pos[0], h.pos[2] - you.pos[2]) < 3, 'and he wandered off: ' + h.pos.map((v) => v.toFixed(2)));
});
T('the vehicles are drawn in code to real sizes: a police estate, and the Ghost jeep in place of the APC (M6.12.3, Rhys)', () => {
  for (const [type, want] of Object.entries(VEHICLE_SIZE)) {
    const b = vehicleBounds(vehicleDef(type, 'ghost'));
    const L = b.max[2] - b.min[2], W = b.max[0] - b.min[0], H = b.max[1];
    A(Math.abs(L - want.L) < 0.4 && W > want.W - 0.35 && W < want.W + 0.4 && H > want.roof - 0.05 && H < want.roof + 1.7 && b.min[1] > -0.05,
      type + ' is ' + [W, H, L].map((v) => v.toFixed(2)).join(' x ') + ', wanted about ' + [want.W, want.roof, want.L].join(' x '));
  }
  const L1v = buildHotel();
  A(L1v.vehicles.filter((v) => v.type === 'policeCar').length === 4 && L1v.vehicles.some((v) => v.type === 'armouredJeep') && !L1v.vehicles.some((v) => v.type === 'apc'), 'the street: ' + L1v.vehicles.map((v) => v.type).join());
  A(!L1v.props.some((p) => p.model === 'police'), 'the Kenney police car is still placed');
  // (M6.13.0, Rhys: "kissing cars") no two vehicles' solids overlap, and the roof numbers differ
  const cars = L1v.world.solids.filter((q) => q.tag === 'car' || q.tag === 'jeep');
  for (let i = 0; i < cars.length; i++) for (let j = i + 1; j < cars.length; j++) {
    const a = cars[i], b = cars[j];
    const same = Math.abs((a.min[0] + a.max[0]) - (b.min[0] + b.max[0])) < 1e-6 && false;
    const over = a.min[0] < b.max[0] + 0.3 && b.min[0] < a.max[0] + 0.3 && a.min[2] < b.max[2] + 0.3 && b.min[2] < a.max[2] + 0.3 && a.min[1] < b.max[1] && b.min[1] < a.max[1];
    const own = Math.abs((a.min[2] + a.max[2]) / 2 - (b.min[2] + b.max[2]) / 2) < 0.01 && (a.min[1] === 0) !== (b.min[1] === 0);   // a car's body and cabin
    A(!over || own || same, 'two vehicles kiss: ' + JSON.stringify([a.min, a.max, b.min, b.max]));
  }
  for (const q of cars) for (const [x0, x1] of [[16.5, 19.5], [25.5, 28.5]]) A(!(q.max[2] > 3.2 && q.min[0] < x1 && q.max[0] > x0), 'a car parked across the front doors');
  const nos = L1v.vehicles.filter((v) => v.type === 'policeCar').map((v) => v.roofNo);
  A(new Set(nos).size === 4, 'roof numbers: ' + nos.join());
  // the light bars sit on the roofs, not floating over them
  for (const lb of L1v.lightbars) A(Math.abs(lb.pos[1] - (VEHICLE_SIZE.policeCar.roof + 0.08)) < 0.02, 'a light bar at ' + lb.pos[1]);
  // and you cannot walk through the jeep
  const p = new Player(L1v.world); p.pos = [4.9 + 3, 0, 2.2]; p.vel = [0, 0, 0];
  for (let i = 0; i < 90; i++) p.step(1 / 60, { moveX: 0, moveZ: 1, yaw: Math.PI / 2, pitch: 0 });
  A(p.pos[0] > 4.9 + 1.0, 'you walked into the jeep: x ' + p.pos[0].toFixed(2));
});
T('a shut door is drawn out to its frame: no gap at the jamb, between a pair, or under the lintel (M6.12.3, Rhys)', () => {
  const L = buildHotel();
  const hotelDoors = L.swingDoors.filter((d) => d.def.seal);
  A(hotelDoors.length > 20, 'only ' + hotelDoors.length + ' doors sealed');
  for (const d of hotelDoors) {
    const sl = d.def.seal, span = d.width + sl[0] + sl[1];
    A(Math.abs(span - 1.5) < 1e-6, 'a leaf drawn ' + span.toFixed(3) + ' m across a 1.5 m opening');
    A(Math.abs(d.def.y0 + d.def.h + sl[2] - (d.def.y0 + 2.2)) < 1e-6, 'a leaf short of its lintel');
  }
  const pairs = {};
  for (const d of hotelDoors) if (d.def.pair) (pairs[d.def.pair] = pairs[d.def.pair] || []).push(d);
  for (const [k, ds] of Object.entries(pairs)) A(ds.length === 2 && ds.filter((d) => d.def.seal[3]).length === 1, 'pair ' + k + ': the strip over the join on ' + ds.filter((d) => d.def.seal[3]).length + ' leaves');
});
T('camera glitch hints: each clue camera has its own spot on the picture, inside it (M6.13.0, Rhys)', () => {
  const spots = [2, 4, 6, 8].map((n) => glitchSpot({ n }));
  for (const [x, y] of spots) A(x >= 10 && x <= 80 && y >= 20 && y <= 72, 'a spot off the picture: ' + [x, y]);
  A(new Set(spots.map((q) => q.join())).size === 4, 'two cameras share a spot');
});
T('the police take hostages at the street, not from the sewer under it (M6.13.0, Rhys)', () => {
  const L = buildHotel(), z = L.policeZone, x = (z.x0 + z.x1) / 2, zz = (z.z0 + z.z1) / 2;
  A(inStreetZone(z, [x, 0, zz]), 'not safe at the police cars');
  A(!inStreetZone(z, [x, FLOORS.B, zz]) && !inStreetZone(z, [x, -3.6, zz]), 'safe in the sewer under them');
  A(!inStreetZone(L.apcZone, [L.apcZone.pos[0], -3.6, L.apcZone.pos[2]]), 'the jeep reached from under the road');
});
T('nobody is shoved into the river, or off a ledge into the air (M6.13.0, Rhys: he stood on the water)', () => {
  const L = buildHotel(), w = L.world;
  A(standable(w, 10, 0, 60) && !standable(w, 10, 0, 70), 'the river bank / the river');
  A(!standable(w, 10, 4.5, 60), 'standing in mid-air');
  const p = { pos: [10, 0, 64.6], r: 0.3 };
  const fits = (q, dx, dz) => standable(w, q.pos[0] + dx, q.pos[1], q.pos[2] + dz);
  for (let i = 0; i < 120; i++) shove([p], { pos: [10, 0, p.pos[2] - 0.62], intent: [0, 1], r: 0.3, strong: true }, 1 / 30, fits);
  A(p.pos[2] < 66.1 && standable(w, p.pos[0], 0, p.pos[2]), 'shoved over the embankment to z ' + p.pos[2].toFixed(2));
});
const doorTest = () => {
  const L = buildHotel();
  // a single door on the first floor, swinging one way, with open floor both sides
  const d = L.swingDoors.find((q) => q.def.swingTo && !q.def.pair && !q.locked && Math.abs(q.def.y0 - FLOORS[1]) < 0.01 && (() => {
    const c = q.centre; return [-1.2, 1.2].every((o) => { const p = c.slice(); p[q.n] += o; p[1] = q.def.y0; const pl = new Player(L.world); return pl.free(p, pl.h); });
  })());
  A(d, 'no plain one-way door with room both sides');
  const at = (o, along) => { const p = d.centre.slice(); p[d.n] += o; p[1] = d.def.y0; if (along !== undefined) p[d.a] = along; return p; };
  return { L, d, at };
};
T('doors swing one way: into the smaller room (a bedroom off the corridor), in from the street - from either side (M6.13.0, Rhys)', () => {
  const { d, at } = doorTest();
  for (const o of [-1, 1]) {
    d.set(false, 1);
    const r = d.use(at(o * 1.2), null);
    A(r === 'opened' && d.side === d.def.swingTo, 'from the ' + o + ' side it swung ' + d.side + ', hung to swing ' + d.def.swingTo);
  }
  const L = buildHotel();
  const front = L.swingDoors.filter((q) => Math.abs(q.def.at - 5.5 * S) < 0.01);
  A(front.every((q) => q.def.swingTo === 1), 'the front doors do not swing in from the street');
});
T('keep E held at a door you open: you walk through and it shuts behind you; let go, and it only opened (M6.13.0, Rhys)', () => {
  const { L, d, at } = doorTest();
  const push = -d.def.swingTo;                    // stand on the side it swings away from
  const p = new Player(L.world); p.pos = at(push * 1.0); p.vel = [0, 0, 0];
  A(d.use(p.pos, p.box()) === 'opened', 'did not open');
  let dm = new DoorMove(d, [], d.stepClear(p.pos, 0.3)), res = null;
  for (let i = 0; i < 300 && !res; i++) res = dm.step(1 / 60, p, true);
  A(res === 'through', 'slip: ' + res);
  A((p.pos[d.n] - d.def.at) * -push > 0.6, 'not through: ' + ((p.pos[d.n] - d.def.at) * -push).toFixed(2));
  A(!d.open, 'it was left open');
  // a tap: it just opens
  d.use(p.pos, p.box());
  dm = new DoorMove(d, [], null); res = null;
  for (let i = 0; i < 30 && !res; i++) res = dm.step(1 / 60, p, i < 5);
  A(res === 'cancel' && d.open, 'a tap did more than open it: ' + res);
});
T('pulling a door towards you, you step back out of its swing (M6.13.0)', () => {
  const { L, d, at } = doorTest();
  d.set(false, 1);
  const st = d.def.swingTo, mid = (d.def.from + d.def.to) / 2;
  const p = new Player(L.world); p.pos = at(st * 0.6, mid); p.vel = [0, 0, 0];
  const back = d.stepClear(p.pos, 0.3);
  A(back && (back[d.n] - d.def.at) * st > 1.0, 'no step back: ' + JSON.stringify(back));
  A(d.use(p.pos, p.box()) === 'opened', 'did not open');
  const dm = new DoorMove(d, [], back); let res = null;
  for (let i = 0; i < 60 && !res; i++) res = dm.step(1 / 60, p, false);
  A(res === 'stepped' && (p.pos[d.n] - d.def.at) * st > 1.0, 'did not step back: ' + res + ' ' + ((p.pos[d.n] - d.def.at) * st).toFixed(2));
  A(d.stepClear(at(-st * 0.6, mid), 0.3) === null, 'a step back from a door that swings away');
});
T('intel in the rooms: eight papers, each in its own room on its own floor, readable - and two of them give away the safe (M6.13.0, Rhys)', () => {
  const L = buildHotel();
  A(L.intel.length === 8, 'intel: ' + L.intel.length);
  const keys = new Set();
  for (const it of L.intel) {
    const lab = MAP.labels.find((l) => l[0] === it.room);
    A(lab && Math.abs(it.floorY - FLOORS[lab[1]]) < 1e-6, it.id + ' on the wrong floor');
    A(Math.hypot(it.pos[0] - (lab[2] + 0.5) * S, it.pos[2] - (lab[3] + 0.5) * S) < 12, it.id + ' far from its room');
    A(it.pos[1] >= it.floorY - 1e-6 && it.pos[1] < it.floorY + 1.2, it.id + ' floating');
    A(it.title && it.kind && it.text.length >= 2 && it.text.every((t) => t.length > 10), it.id + ' has no proper text');
    keys.add(it.pos.map((v) => v.toFixed(2)).join());
  }
  A(keys.size === 8, 'two papers on one spot');
  const code = L.safeCode.join('');
  A(L.intel.find((i) => i.id === 'delivery').text.join(' ').indexOf(code) >= 0, 'the letterhead does not give the year the safe uses');
  A(/year we opened/.test(L.intel.find((i) => i.id === 'memo').text.join(' ')), 'the memo does not point at the year');
  // (M6.13.1, Rhys: they lay at the foot of the doorways) every one on a real
  // tabletop - a desk, a bedside table, a table, a counter - not the floor
  const off = L.intel.filter((i) => !i.on || i.pos[1] < i.floorY + 0.35);      // (a coffee table counts)
  A(!off.length, 'papers not on furniture: ' + off.map((i) => i.id + ' (' + i.room + ')').join(', '));
  A(L.supplies.every((q) => q.onTable), 'a supply case on the floor');
  // and lying ON the top, inside its edges, clear of what stands there
  for (const it of L.intel) {
    const q = L.surfaces.find((t) => Math.abs(t.max[1] - it.pos[1]) < 1e-6 && it.pos[0] > t.min[0] && it.pos[0] < t.max[0] && it.pos[2] > t.min[2] && it.pos[2] < t.max[2]);
    A(q, it.id + ' is not on the top it was laid on');
  }
});
const capRunFor = (opts) => {
  const L = buildHotel(), nav = new NavGrid(L.world, L.navFloors, L.navLinks);
  const cap = L.captain, heli = L.helicopter, run = new CaptainRun(cap, heli, FLOORS.R);
  const ctx = { world: L.world, nav, guards: L.guards, doors: L.swingDoors, you: null, noises: [], dark: true, pathBudget: { left: 1 } };
  if (!opts || !opts.clock) cap.flee(ctx);
  const seen = [];
  const tick = (secs, now, each) => {
    for (let i = 0; i < secs * 60; i++) {
      ctx.pathBudget.left = 1; nav.syncDoors(L.swingDoors);
      if (cap.target.down && !cap.dead) cap.die(ctx);
      cap.step(1 / 60, ctx);
      run.step(1 / 60, { now: now || { hour: 22, minute: 50 }, guardCtx: ctx });
      for (const ev of run.events) seen.push(ev.type);
      run.events.length = 0; cap.events.length = 0;
      if (each && each(run)) break;
    }
  };
  return { L, cap, heli, run, tick, seen, ctx };
};
T('stop the captain: left alone he reaches the helicopter, climbs in, and it lifts away with him - escaped (M6.13.0, Rhys)', () => {
  const { cap, heli, run, tick, seen } = capRunFor();
  const start = heli.pos.slice();
  tick(150);
  A(seen.join(' ') === 'fleeing boarding aboard escaped gone', 'stages: ' + seen.join(' '));
  A(run.escaped && !run.stopped, 'not escaped');
  A(heli.pos[1] > start[1] + 8 && heli.pos[2] < start[2] - 30, 'the helicopter did not fly off: ' + heli.pos.map((v) => v.toFixed(1)));
  A(cap.hidden, 'he is still drawn, far off');
});
T('stop the captain: shot on the rope ladder he falls to the roof, stopped, and the helicopter leaves empty (M6.13.0)', () => {
  const { cap, heli, run, tick, seen } = capRunFor();
  const start = heli.pos.slice();
  tick(150, null, (r) => r.stage === 'climb' && cap.pos[1] > FLOORS.R + 1);
  A(run.stage === 'climb', 'never on the ladder: ' + run.stage);
  cap.target.hp = 0; cap.target.down = true; cap.target.lethalHit = true;
  tick(20);
  A(run.stopped && seen.includes('stopped') && !seen.includes('escaped'), 'stages: ' + seen.join(' '));
  A(Math.abs(cap.pos[1] - FLOORS.R) < 0.05, 'his body hangs in the air: y ' + cap.pos[1].toFixed(2));
  A(heli.pos[1] > start[1] + 5, 'the empty helicopter did not leave');
});
T('stop the captain: there is a window - in the door while the rotors wind up - and a shot then stops him (M6.13.0)', () => {
  const { cap, run, tick, seen } = capRunFor();
  tick(150, null, (r) => r.stage === 'aboard' && r.t > HELI.spool - 2);
  A(run.stage === 'aboard', 'never aboard: ' + run.stage);
  A(cap.pos[1] > FLOORS.R + 2.5 && !cap.target.solid.disabled, 'aboard, he cannot be hit');
  cap.target.hp = 0; cap.target.down = true; cap.target.lethalHit = true;
  tick(10);
  A(run.stopped && !seen.includes('escaped'), 'stages: ' + seen.join(' '));
});
T('stop the captain: at 23:30 he leaves for the helicopter, seen or not - his orders (M6.13.0)', () => {
  const { cap, run, tick, seen } = capRunFor({ clock: true });
  tick(5, { hour: 23, minute: 10 });
  A(run.stage === 'hotel' && !cap.fled, 'he left early');
  tick(120, { hour: 23, minute: 30 });
  A(seen[0] === 'leaving' && seen.includes('boarding'), 'he did not go at half past: ' + seen.join(' '));
});
T('stop the captain: time enough to catch him - over a minute from his first step to lift-off, and a fumble at his door (M6.13.2, Rhys)', () => {
  const { cap, run, tick } = capRunFor();
  const door = run.g && cap.escape.find((st) => st.door && st.open).door;
  let t = 0, openedAt = null, atDoor = null;
  tick(200, null, (r) => {
    t += 1 / 60;
    if (atDoor === null && cap.escapeI === 1) atDoor = t;
    if (openedAt === null && door.open) openedAt = t;
    return r.stage === 'takeoff';
  });
  A(run.stage === 'takeoff', 'he never left');
  A(t > 60, 'only ' + t.toFixed(1) + ' s from his first step to lift-off');
  A(atDoor !== null && openedAt - atDoor >= 3.5, 'no fumble at the door: ' + ((openedAt || 0) - (atDoor || 0)).toFixed(1) + ' s');
});
T('stop the captain: about 90 s from slamming the roof door to lifting off (M6.13.3, Rhys)', () => {
  const { cap, run, tick } = capRunFor();
  let t = 0, slam = null;
  const door = cap.escape.find((st) => st.door && st.lock).door;
  tick(200, null, (r) => { t += 1 / 60; if (slam === null && door.locked && cap.escapeI > 3) slam = t; return r.stage === 'takeoff'; });
  A(run.stage === 'takeoff' && slam !== null, 'no slam, or no lift-off: ' + run.stage);
  A(t - slam > 80 && t - slam < 100, (t - slam).toFixed(1) + ' s from the slam to lift-off');
});
T('stop the captain: hurt on the roof he keeps going for the helicopter - not back down the ladder (M6.13.3, Rhys)', () => {
  const { cap, run, tick, ctx, L } = capRunFor();
  tick(200, null, (r) => r.stage === 'signal');
  A(run.stage === 'signal', 'never on the roof: ' + run.stage);
  // you, on the roof by the hatch - and you hit him (he lives)
  const p = [L.roofLadder.x, FLOORS.R, L.roofLadder.z - 1.5];
  ctx.you = { pos: p, eye: [p[0], p[1] + 1.6, p[2]], chest: [p[0], p[1] + 1.0, p[2]], stance: 1, speed: 0, noise: 0, box: [[p[0] - 0.3, p[1], p[2] - 0.3], [p[0] + 0.3, p[1] + 1.2, p[2] + 0.3]] };
  cap.target.hp -= 10;
  tick(0.2);
  A(cap.lastHp === cap.target.hp, 'the hit did not register');
  tick(150, null, (r) => r.stage === 'aboard');
  A(run.stage === 'aboard' && cap.state === 'flee', 'he went off: ' + run.stage + ', ' + cap.state + ' at y ' + cap.pos[1].toFixed(1));
});
T('stop the captain: the helicopter waits two minutes from his running - late, it goes without him and he is stranded (M6.13.3, Rhys)', () => {
  const { cap, heli, run, tick, seen } = capRunFor();
  cap.escapeSpeed = 0.05;                                // something holds him up
  const y0 = heli.pos[1];
  tick(115);
  A(!heli.leaving && run.stage === 'hotel', 'it went early: ' + run.stage);
  tick(10);
  A(run.stage === 'stranded' && seen.includes('stranded') && heli.leaving && !run.escaped && !run.stopped, 'stages: ' + seen.join(' ') + ' / ' + run.stage);
  tick(8);
  A(heli.pos[1] > y0 + 4, 'it did not leave');
});
T('stop the captain: down on the roof, it leaves at once; down before the roof, it waits out its two minutes (M6.13.3, Rhys)', () => {
  const a = capRunFor();
  a.tick(200, null, (r) => r.stage === 'signal');
  a.cap.target.hp = 0; a.cap.target.down = true; a.cap.target.lethalHit = true;
  const y0 = a.heli.pos[1];
  a.tick(2);
  A(a.run.stopped && a.heli.leaving && a.heli.pos[1] > y0 + 1, 'it did not go at once');
  const b = capRunFor();
  b.tick(3);                                             // he has run; taken down inside the hotel
  b.cap.target.hp = 0; b.cap.target.down = true; b.cap.target.lethalHit = true;
  b.tick(60);
  A(b.run.stopped && !b.heli.leaving, 'it left before its two minutes');
  b.tick(65);
  A(b.heli.leaving, 'it never left');
});
T('the score: a guard down is worth 10, a hostage nothing - on purpose (M6.13.3, Rhys liked the score)', () => {
  const L = buildHotel();
  A(L.guards.every((g) => g.target.score === 10), 'a guard is worth ' + L.guards.map((g) => g.target.score).join());
  A(L.hostages.every((h) => h.target.score === 0), 'a hostage is worth ' + L.hostages.map((h) => h.target.score).join());
});
T('the roof sentries hold the roof: a shout on the third floor does not bring them to the top of the ladder (M6.13.4, Rhys)', () => {
  const L = buildHotel();
  const p11 = L.guards.find((g) => g.id === 'P11');
  const ans = raiseAlarm(L.guards, p11, L.captainEscape.door.centre);
  A(!ans.some((g) => g.floorKey === 'R'), 'roof guards answered: ' + ans.filter((g) => g.floorKey === 'R').map((g) => g.id).join());
  const L2 = buildHotel(), r = L2.guards.find((g) => g.floorKey === 'R');
  const ans2 = raiseAlarm(L2.guards, r, r.pos);
  A(ans2.some((g) => g.floorKey === 'R'), 'a shout on the roof brought nobody on the roof');
});
T('a dropped gun comes to rest on the floor under it, not in the air (M6.13.4, Rhys: the captain\'s pistol hung in mid-air)', () => {
  const L = buildHotel(), h = L.helicopter;
  const p = groundBelow(L.world, [h.pos[0], h.pos[1] + 0.5, h.pos[2] + 0.55]);
  A(p[1] < h.pos[1] - 2 && p[1] >= FLOORS.R - 0.5, 'it rests at y ' + p[1].toFixed(2));
  const q = groundBelow(L.world, [20, FLOORS[1] + 1.2, 30]);
  A(Math.abs(q[1] - FLOORS[1]) < 0.6, 'on the first floor it rests at y ' + q[1].toFixed(2));
});
T('a guard in plain sight a floor away is drawn - nobody "spawns in from nowhere" (M6.13.5, Rhys)', () => {
  const w = new World(), eye = [0, 1.6, 0], g = { pos: [20, -3.6, 0] };
  const run = (world, frames) => { const c = new DrawCull(world); let v; for (let i = 0; i < frames; i++) v = c.frame([g], eye, 0, 1 / 60)[0]; return { v, c }; };
  A(run(w, 3).v, 'a guard 20 m off, a floor down, with nothing between, is not drawn');
  const w2 = new World(); w2.addSolid([-50, -0.3, -50], [50, 0, 50], 'slab');
  A(!run(w2, 3).v, 'drawn through a floor slab');
  A(DRAW.near === 8 && DRAW.far === 42, 'the old reach changed');
});
T('a guard seen and then lost behind a wall stays drawn a moment, then goes (no flicker)', () => {
  const w = new World(), eye = [0, 1.6, 0], g = { pos: [20, -3.6, 0] }, c = new DrawCull(w);
  A(c.frame([g], eye, 0, 1 / 60)[0], 'not drawn at first');
  const wall = w.addSolid([10, -5, -5], [10.3, 5, 5], 'wall');
  let t = 0; while (c.frame([g], eye, 0, 1 / 60)[0] && t < 5) t += 1 / 60;
  A(t > 0.2 && t <= DRAW.linger + 0.05, 'stayed drawn ' + t.toFixed(2) + ' s');
  wall.disabled = true; c.frame([g], eye, 0, 1 / 60);
  A(c.frame([g], eye, 0, 1 / 60)[0], 'seen again, not drawn again');
});
T('in the hotel, a guard on the floor above you, behind the ceiling, is still not drawn (the frame-rate saving stands)', () => {
  const L = buildHotel(), c = new DrawCull(L.world);
  const eye = [20, FLOORS[1] + 1.6, 30], g = { pos: [32, FLOORS[2], 34] };
  A(!inSight(L.world, eye, [[g.pos[0], g.pos[1] + 1.6, g.pos[2]]]), 'seen through the ceiling');
  let v; for (let i = 0; i < 4; i++) v = c.frame([g], eye, FLOORS[1], 1 / 60)[0];
  A(!v, 'drawn through the ceiling');
});
T('looking down off the roof at the street, a guard down there is drawn', () => {
  const L = buildHotel(), w = L.world;
  // find a spot on the roof edge with a clear look down to the road (south of the hotel, the road side)
  let found = null;
  for (let x = 4; x < 60 && !found; x += 1) for (let z = -4; z < 30 && !found; z += 0.5) {
    const top = w.groundBelow(x, FLOORS.R + 1.5, z, 0.2);
    if (Math.abs(top - FLOORS.R) > 0.3) continue;
    const eye = [x, FLOORS.R + 1.6, z], g = [x, 0, z - 12];
    if (Math.abs(w.groundBelow(g[0], 1, g[2], 0) - 0) > 0.3) continue;
    if (inSight(w, eye, [[g[0], 1.6, g[2]]])) found = { eye, g };
  }
  A(found, 'no roof spot looks down on the road at all');
  const c = new DrawCull(w); let v; for (let i = 0; i < 3; i++) v = c.frame([{ pos: found.g }], found.eye, FLOORS.R, 1 / 60)[0];
  A(v, 'the guard in the road is not drawn');
});
T('the pilot calls the last thirty seconds once - and not once the captain is aboard (M6.13.5)', () => {
  const g = { pos: [0, 0, 0], dead: false, fled: true, escape: [{}], escapeI: 0 }, h = { pos: [0, 15, 0] };
  const run = new CaptainRun(g, h, 14.4);
  const evs = []; let t = 0;
  while (t < HELI.wait + 5) { run.step(0.1, {}); evs.push(...run.events.map((e) => [e.type, t])); run.events.length = 0; t += 0.1; }
  const hurry = evs.filter((e) => e[0] === 'hurry');
  A(hurry.length === 1 && Math.abs(hurry[0][1] - (HELI.wait - HELI.hurry)) < 0.3, 'hurry: ' + JSON.stringify(hurry));
  A(evs.findIndex((e) => e[0] === 'hurry') < evs.findIndex((e) => e[0] === 'stranded'), 'the call came after he was stranded');
  const g2 = { pos: [0, 0, 0], dead: false, fled: true, escape: [{}], escapeI: 0 }, r2 = new CaptainRun(g2, { pos: [0, 15, 0] }, 14.4);
  r2.step(0.1, {}); r2.stage = 'aboard'; r2.t = -1e9;
  let any = false; for (let i = 0; i < 1300; i++) { r2.step(0.1, {}); if (r2.events.some((e) => e.type === 'hurry')) any = true; r2.events.length = 0; }
  A(!any, 'called thirty seconds to a man already aboard');
});
T('objectives no longer decide whether the mission ends: outcomes, graded and remembered (M6.13.8, Rhys)', () => {
  const hs = (a, b, c) => [{ id: 'H1', name: 'Dr Imogen Hale', state: a }, { id: 'H2', name: 'Tony Ashdown', state: b }, { id: 'H3', name: 'Elijah Pellow', state: c }];
  const all = hotelOutcome(hs('rescued', 'rescued', 'rescued'), { stage: 'stopped', dead: true });
  A(all.captain === 'killed' && all.stopped && all.rescued === 3 && hotelSettled(all) && grade(all) === 'success', 'everything done: ' + JSON.stringify(all));
  const lost = hotelOutcome(hs('rescued', 'dead', 'rescued'), { stage: 'gone' });
  A(lost.captain === 'escaped' && !lost.stopped && hotelSettled(lost) && grade(lost) === 'partial', 'a hostage killed and the captain away is settled, and partial: ' + grade(lost));
  A(lost.hostages[1].fate === 'killed' && lost.hostages[1].name === 'Tony Ashdown', 'the dead hostage is not named as killed');
  const open = hotelOutcome(hs('rescued', 'following', 'held'), { stage: 'hotel' });
  A(!hotelSettled(open) && open.captain === 'at large' && open.hostages.filter((p) => p.fate === 'left behind').length === 2, 'with two still inside it is settled');
  A(grade(open) === 'partial', 'one hostage out is something achieved');
  const none = hotelOutcome(hs('held', 'held', 'dead'), { stage: 'stranded' });
  A(none.captain === 'stranded' && grade(none) === 'failed', 'nothing achieved is not a failure');
  A(hotelOutcome(hs('held', 'held', 'held'), { stage: 'stopped', knockedOut: true, dead: true }).captain === 'knocked out', 'knocked out reads as killed');
  const lines = outcomeLines(lost);
  A(lines.length === 4 && lines[0].ok && !lines[1].ok && /Ashdown.*killed/.test(lines[1].text) && /captain.*escaped/.test(lines[3].text), 'debrief lines: ' + JSON.stringify(lines));
  const save = recordOutcome(null, lost, 'partial', 5);
  A(save.story.missions.riverside.captain === 'escaped' && save.story.log.length === 1, 'not recorded');
  for (let i = 0; i < 25; i++) recordOutcome(save, all, 'success', 10 + i);
  A(save.story.missions.riverside.result === 'success' && save.story.log.length === 20, 'the latest outcome or the log length is wrong');
  // and the runtime no longer fails the mission on them
  const src = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(!/rt\.fail\('A hostage was killed'\)/.test(src) && !/rt\.fail\('The captain escaped/.test(src), 'a hostage killed or the captain escaped still fails the mission');
  A(/endHotel\(now\)/.test(src) && /LEAVE_HOLD/.test(src), 'no way to end at the jeep, or to withdraw');
});
T('the hostages have their names (Rhys, after M6.13.6)', () => {
  const L = buildHotel(), by = Object.fromEntries(L.hostages.map((h) => [h.id, h]));
  A(by.H1.name === 'Dr Imogen Hale' && by.H1.she === true, 'H1 is not Dr Hale');
  A(by.H2.name === 'Tony Ashdown' && by.H3.name === 'Elijah Pellow' && !by.H2.she && !by.H3.she, 'H2/H3 names');
});
T('trophies on a mission complete with losses, not on a failed one; Swift Extraction needs every hostage out (M6.13.8)', () => {
  const m = new Mission({ id: 'hotel', guards: 19 }); Object.assign(m, { done: true, result: 'partial', time: 300, kills: 0, headshots: 0, knockouts: 4 });
  const ids = (hs) => hotelTrophies(m, hs, 19).map((t) => t.id).sort().join(' ');
  A(ids([{ state: 'rescued' }, { state: 'dead' }, { state: 'rescued' }]) === 'hotel_pacifist', 'partial: ' + ids([{ state: 'rescued' }, { state: 'dead' }, { state: 'rescued' }]));
  A(/hotel_quick/.test(ids([{ state: 'rescued' }, { state: 'rescued' }, { state: 'rescued' }])), 'all out, quick, not awarded');
  m.result = 'failed'; A(ids([{ state: 'rescued' }]) === '', 'trophies for a failed run');
});
// (M6.13.9, Rhys: "I took the Hostages up to the Roof... none of them wanted to come back down")
const ladderWalk = (pts, start) => {
  const L = buildHotel(), nav = new NavGrid(L.world, L.navFloors, L.navLinks);
  const door = L.captainEscape.door; door.unlock(); door.use([23.25, FLOORS[3], 50], null); nav.syncDoors(L.swingDoors);
  const lad = L.navLinks.find((k) => k.ladder && k.b[1] > 14);
  const hs = L.hostages; hs.forEach((h, i) => { h.state = 'following'; h.pos = start(i); h.path = null; });
  const route = pts(lad), you = { pos: route[0].slice() };
  const fitsAt = (p, dx, dz) => { const x = p.pos[0] + dx, z = p.pos[2] + dz, r = p.r, y = p.pos[1]; const own = p.who.target && p.who.target.solid; if (!standable(L.world, x, y, z)) return false; return !L.world.hits([x - r, y + 0.35, z - r], [x + r, y + p.h, z + r]).some((q) => q !== own && !q.person); };
  let seg = 0;
  for (let t = 0; t < 60 * 40; t++) {
    const dt = 1 / 60;
    if (seg < route.length - 1) { const q = route[seg + 1], d = Math.hypot(q[0] - you.pos[0], q[1] - you.pos[1], q[2] - you.pos[2]), st = Math.min(d, 1.6 * dt); if (d < 0.02) seg++; else for (let k = 0; k < 3; k++) you.pos[k] += (q[k] - you.pos[k]) / d * st; }
    const ctx = { nav, you: { pos: you.pos }, doors: L.swingDoors, lift: L.lift, safe: () => false, pathBudget: { left: 1 }, crowd: hs };
    for (const h of hs) h.step(dt, ctx);
    shove(hs.filter((h) => h.free && !h.climbing).map((h) => ({ pos: h.pos, r: 0.3, who: h, h: 1.75 })), { pos: you.pos, intent: [0, 0], r: 0.3 }, dt, fitsAt);
  }
  return { hs, you, lad };
};
T('three hostages on the roof follow you back down the ladder - one at a time - and on along the corridor (M6.13.9, Rhys)', () => {
  const { hs, you } = ladderWalk((lad) => [[23.25, FLOORS.R, 57], lad.b, [lad.a[0], 12.6, lad.a[2]], lad.a, [23.25, FLOORS[3], 56.6], [23.25, FLOORS[3], 50], [23.25, FLOORS[3], 44], [18, FLOORS[3], 44]], (i) => [22 + i, FLOORS.R, 56 - i]);
  for (const h of hs) A(Math.abs(h.pos[1] - FLOORS[3]) < 0.3 && Math.hypot(h.pos[0] - you.pos[0], h.pos[2] - you.pos[2]) < 4, h.id + ' did not come down: ' + h.pos.map((v) => v.toFixed(1)));
});
T('...and up it again, the same way', () => {
  const { hs, you } = ladderWalk((lad) => [[18, FLOORS[3], 44], [23.25, FLOORS[3], 50], [23.25, FLOORS[3], 56.6], lad.a, [lad.a[0], 12.6, lad.a[2]], lad.b, [23.25, FLOORS.R, 55], [23.25, FLOORS.R, 50]], (i) => [19 + i * 0.8, FLOORS[3], 45 + (i % 2)]);
  for (const h of hs) A(Math.abs(h.pos[1] - FLOORS.R) < 0.3 && Math.hypot(h.pos[0] - you.pos[0], h.pos[2] - you.pos[2]) < 4, h.id + ' did not come up: ' + h.pos.map((v) => v.toFixed(1)));
});
console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + ')' : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
