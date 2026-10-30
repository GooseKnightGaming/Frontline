// FRONTLINE - Level 3, the Casino (M6.15.0): round, from Rhys's preliminary map. Plain node.
import { casinoRedDefs, COIL, coilFloor, RAMP_KEYS as RK, LETTERS } from '../src/game/level_casino.js';
import { DrawCull, sightPoints, inSight } from '../src/sim/drawcull.js';
import { buildCasino, casinoRamp, casinoStairs, CX, CZ, R_OUT, R_MID, T_MID, BAND, C_FLOORS, RAMP_KEYS, RAMP_TOP, ACCESS, CASINO_REDS, STREET, JEEP_AT } from '../src/game/level_casino.js';
import { insideMask, rooms } from '../src/game/level_hotel.js';
import { pointInPoly } from '../src/sim/shapes.js';
import { Loadout, ITEMS } from '../src/sim/loadout.js';
import { Arsenal } from '../src/sim/weapons.js';
import MAP from '../src/game/maps/casino.json' with { type: 'json' };
import { arcWallBoxes, gridWallSegments, segmentRect, Ramp } from '../src/sim/curves.js';
import { World } from '../src/sim/world.js';
import { Player, repackChute, chuteLabel, packGrip, CHUTE } from '../src/sim/player.js';
import { NavGrid } from '../src/sim/nav.js';
import { Mission, casinoTrophies, kickOpens } from '../src/sim/mission.js';
const kickOpensAny = (d) => [0, 0.5, 0.999].some((r) => kickOpens(d, r));
import { RULES } from '../src/sim/story.js';
import { pickFoe, hostileTo, hostileToYou, Standing, STANDING, YELLOW_TALK, YellowJob, JOB, vaultWhere, LOCKET_CHOICES } from '../src/sim/factions.js';
import { YELLOW_LINES, LINES } from '../src/sim/guard.js';
import { Guard, ARMS, seatFor, SEAT, raiseAlarm } from '../src/sim/guard.js';
import { pickClip } from '../src/sim/anim.js';
import { readFileSync } from 'fs';
import { fillFor, FILL } from '../src/game/character.js';
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const TAU = Math.PI * 2;
const t0 = Date.now();
const L = buildCasino();
const buildMs = Date.now() - t0;
const step = (p, inp, n) => { for (let i = 0; i < n; i++) p.step(1 / 60, Object.assign({ moveX: 0, moveZ: 0, yaw: p.yaw, pitch: 0 }, inp)); };
const yawTo = (p, x, z) => Math.atan2(-(x - p.pos[0]), -(z - p.pos[2]));
// walk towards a point (x, z) until within 0.4 m, or give up
const walkTo = (p, x, z, secs) => { for (let i = 0; i < 60 * (secs || 20); i++) { if (Math.hypot(x - p.pos[0], z - p.pos[2]) < 0.4) return true; step(p, { moveZ: 1, yaw: yawTo(p, x, z) }, 1); } return false; };
const at = (r, a) => [CX + Math.cos(a) * r, CZ + Math.sin(a) * r];
const RMID = (BAND[0] + BAND[1]) / 2;

T('Rhys\'s preliminary map came through: seven levels, the ground floor to the roof terrace', () => {
  A(['G', '1', '2', '2A', '3', '4', 'RT'].every((k) => MAP.floors[k] && MAP.floors[k].length >= 59), Object.keys(MAP.floors).join());
});
T('built quickly, its collision quick to ask (M6.16.0: a grid over the ground), and the lamps bakeable', () => {
  A(buildMs < 5600, buildMs + ' ms');          // (M6.17.6: the sandbox itself has slowed - M6.17.5's own build measures 4.2-4.6 s here now; M6.17.11: a slower machine again - M6.17.10's own build 4.4 s cold)
  A(L.world.solids.length < 14000, L.world.solids.length + ' boxes');
  // a thousand looks across the building: the grid's answers, and the time they take
  let r = 7; const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  let t = Date.now();
  for (let i = 0; i < 1000; i++) { const a = rnd() * TAU; L.world.raycast([CX + (rnd() - 0.5) * 50, 1 + rnd() * 20, CZ + (rnd() - 0.5) * 50], [Math.cos(a), (rnd() - 0.5) * 0.3, Math.sin(a)], 40); }
  const grid = Date.now() - t; t = Date.now();
  for (let i = 0; i < 1000; i++) { const a = rnd() * TAU; L.world.raycastAll([CX + (rnd() - 0.5) * 50, 1 + rnd() * 20, CZ + (rnd() - 0.5) * 50], [Math.cos(a), (rnd() - 0.5) * 0.3, Math.sin(a)], 40); }
  const all = Date.now() - t;
  A(grid * 2 < all, 'the grid is no quicker: ' + grid + ' ms against ' + all + ' ms');
  A(L.lights.length <= 195, L.lights.length + ' lamps');      // (M6.17.1: every room lit; the front lit up)
  A(L.pieces.filter((p) => p.quads).length > 100, 'no curved pieces');
});
T('a curved wall\'s boxes follow it: every point along the arc is inside one, nothing far off it is', () => {
  const bx = arcWallBoxes(0, 0, 20, 0.3, 0, Math.PI, 0, 3, 0.6);
  for (let a = 0.01; a < Math.PI; a += 0.013) {
    const x = Math.cos(a) * 20, z = Math.sin(a) * 20;
    A(bx.some(([mn, mx]) => x >= mn[0] && x <= mx[0] && z >= mn[2] && z <= mx[2]), 'a gap at ' + a.toFixed(2));
    const x2 = Math.cos(a) * 19.4, z2 = Math.sin(a) * 19.4;
    A(!bx.some(([mn, mx]) => x2 >= mn[0] && x2 <= mx[0] && z2 >= mn[2] && z2 <= mx[2]), 'a box sticks 0.6 m off the wall at ' + a.toFixed(2));
  }
});
T('a wall drawn as a pixel staircase has no gap between its steps', () => {
  const cells = (x, y) => (x >= 0 && y >= 0 && x < 10 && x === y ? 'W' : null);
  const segs = gridWallSegments(10, 10, cells, 1);
  const w = new World(); for (const sg of segs) { const [[x0, z0], [x1, z1]] = segmentRect(sg, 0.2); w.addSolid([x0, 0, z0], [x1, 3, z1], 'w'); }
  // a ray from one side of the staircase to the other, between two steps
  for (let i = 0; i < 8; i++) { const h = w.raycast([i + 1.5, 1, i + 0.2], [-0.7071, 0, 0.7071], 3, null); A(h, 'a gap between steps ' + i + ' and ' + (i + 1)); }
});
T('the ramp: a turn a floor, at each floor\'s height where it meets it (east below, north above)', () => {
  const R = casinoRamp();
  for (const [phi, y] of RAMP_KEYS) A(Math.abs(R.heightAt(phi) - y) < 1e-9, 'at ' + phi);
  for (const k of ['G', '1', '2', '3', '4', 'RT']) A(R.heightsAtTheta(ACCESS[k]).some((h) => Math.abs(h.y - C_FLOORS[k]) < 0.01), 'no ramp at ' + k + '\'s height at its access');
  // headroom: over any spot on the ramp, the next turn is at least 3.6 m up
  for (let a = -Math.PI; a < Math.PI; a += 0.1) { const hs = R.heightsAtTheta(a); for (let i = 1; i < hs.length; i++) A(hs[i].y - hs[i - 1].y >= 3.6, 'headroom ' + (hs[i].y - hs[i - 1].y).toFixed(2) + ' at ' + a.toFixed(1)); }
});
let topReached = null;
T('from the plaza, in by the main doors onto the ramp\'s level start - and up it, clockwise (M6.16.0), turn after turn, to the roof terrace', () => {
  const p = new Player(L.world); p.pos = L.world.spawn.pos.slice(); p.settle();
  A(walkTo(p, CX, CZ + R_OUT + 1.2), 'did not reach the main entrance');
  // (M6.17.0) the glass front doors: open them
  const front = L.swingDoors.filter((q) => q.def.pair === 'casino:front');
  A(front.length === 2 && front.every((d) => d.use(p.pos, p.box()) === 'opened'), 'the front doors would not open');
  A(walkTo(p, CX, CZ + RMID), 'could not get in through the outer wall: ' + p.pos.map((v) => v.toFixed(2)));
  // round to the west - clockwise, as the map is drawn - and up
  let maxY = 0, prevY = 0, drop = 0;
  for (let i = 0; i < 60 * 260 && p.pos[1] < C_FLOORS.RT - 0.05; i++) {
    const th = Math.atan2(p.pos[2] - CZ, p.pos[0] - CX), [tx, tz] = at(RMID, th + 0.12);
    step(p, { moveZ: 1, yaw: yawTo(p, tx, tz) }, 1);
    if (prevY - p.pos[1] > 0.6) drop++;
    prevY = p.pos[1]; maxY = Math.max(maxY, p.pos[1]);
  }
  A(Math.abs(p.pos[1] - C_FLOORS.RT) < 0.1, 'stopped at y ' + p.pos[1].toFixed(2) + ' (' + p.pos.map((v) => v.toFixed(1)) + ')');
  A(drop === 0, 'fell ' + drop + ' times on the way up');
  topReached = p.pos.slice();
});
T('from the ramp, each floor: step in through the middle wall where the ramp meets it', () => {
  const R = casinoRamp();
  for (const k of ['G', '1', '2', '3', '4', 'RT']) {
    const a = ACCESS[k], [x, z] = at(RMID, a), [ix, iz] = at(R_MID - 3, a);
    const p = new Player(L.world); p.pos = [x, C_FLOORS[k] + 0.3, z]; p.vel = [0, 0, 0]; p.settle();
    A(Math.abs(p.pos[1] - C_FLOORS[k]) < 0.15, k + ': not on the ramp at its height - y ' + p.pos[1].toFixed(2));
    A(walkTo(p, ix, iz, 10) && Math.abs(p.pos[1] - C_FLOORS[k]) < 0.15, k + ': could not step in - ' + p.pos.map((v) => v.toFixed(2)));
  }
});
T('the main doors: from the passage under the ramp into the gaming floor', () => {
  const p = new Player(L.world); p.pos = [CX, 0, CZ + RMID]; p.settle();
  for (const d of L.swingDoors) if (d.def.y0 === 0) d.set(true, d.def.swingTo || 1);
  A(walkTo(p, CX, CZ + 20), 'could not get from the passage in to the gaming floor: ' + p.pos.map((v) => v.toFixed(2)));
});
T('every spiral stair takes you up, and back down', () => {
  for (const s of L.stairs) {
    const p = new Player(L.world); p.pos = s.foot.slice(); p.pos[1] += 0.2; p.vel = [0, 0, 0]; p.settle();
    A(Math.abs(p.pos[1] - s.y0) < 0.25, s.id + ': the foot is not on the floor (y ' + p.pos[1].toFixed(2) + ')');
    // round the post, climbing
    for (let i = 0; i < 60 * 30 && p.pos[1] < s.y1 - 0.05; i++) {
      const th = Math.atan2(p.pos[2] - s.cz, p.pos[0] - s.cx), r = (0.18 + s.rOut) / 2 + 0.05;
      step(p, { moveZ: 1, yaw: yawTo(p, s.cx + Math.cos(th + 0.5) * r, s.cz + Math.sin(th + 0.5) * r) }, 1);
    }
    A(Math.abs(p.pos[1] - s.y1) < 0.15, s.id + ': stopped at y ' + p.pos[1].toFixed(2));
    A(walkTo(p, s.top[0], s.top[2], 6) || Math.abs(p.pos[1] - s.y1) < 0.15, s.id + ': cannot step off at the top');
  }
});
T('fifteen reds, each standing on a floor and not inside anything', () => {
  A(L.guards.filter((g) => g.faction === 'red').length === CASINO_REDS, L.guards.filter((g) => g.faction === 'red').length + ' reds');
  for (const g of L.guards) {
    const gy = L.world.groundBelow(g.pos[0], g.pos[1] + 0.4, g.pos[2], 0.1);
    A(Math.abs(gy - g.pos[1]) < 0.3, g.id + ' floats or sinks: ground ' + gy.toFixed(2) + ' at ' + g.pos.map((v) => v.toFixed(1)));
    A(!L.world.hits([g.pos[0] - 0.3, g.pos[1] + 0.05, g.pos[2] - 0.3], [g.pos[0] + 0.3, g.pos[1] + 1.7, g.pos[2] + 0.3]).some((s) => s !== g.target.solid && !s.person), g.id + ' stands inside something');
  }
  const nav = new NavGrid(L.world, L.navFloors, L.navLinks); nav.syncDoors(L.swingDoors);
  for (const g of L.guards.filter((q) => q.route)) for (const [x, z] of g.route) A(nav.find(g.pos, [x, g.pos[1], z]), g.id + ' cannot walk his route to ' + [x, z]);
});
T('every door hung one way with room for its leaf; the rules, the story and the trophies; on the title screen', () => {
  const mine = new Set(L.swingDoors.map((d) => d.solid));
  for (const d of L.swingDoors) {
    A(d.def.swingTo === 1 || d.def.swingTo === -1, 'a two-way door at ' + d.centre.map((v) => v.toFixed(1)));
    const [mn, mx] = d.openBox(d.def.swingTo);
    A(!L.world.hits(mn.map((v) => v + 0.02), mx.map((v) => v - 0.02)).some((s) => !mine.has(s) && !s.person && !s.target), 'a leaf runs into something at ' + d.centre.map((v) => v.toFixed(1)));
  }
  const R = RULES.casino, gs = (n) => Array.from({ length: 15 }, (_, i) => ({ dead: i < n, knockedOut: false }));
  // (M6.17.11) the ledger is the mission; the reds down a trophy
  A(R.grade(R.outcome({ guards: gs(0), ledger: true })) === 'success' && R.grade(R.outcome({ guards: gs(3) })) === 'partial' && R.grade(R.outcome({ guards: gs(0) })) === 'failed' && /ledger/.test(R.undone(R.outcome({ guards: gs(15) }))), 'rules');
  const m = new Mission({ id: 'casino', guards: 15 }); Object.assign(m, { done: true, result: 'success', kills: 0, knockouts: 15, spotted: 0, headshots: 0 });
  const tr = casinoTrophies(m, gs(15));
  A(tr.length === 3 && tr[0].id === 'casino_clean_sweep' && casinoTrophies(m, gs(14)).length === 0, 'trophies: ' + tr.map((t) => t.id));
  A(/id="t-casino"/.test(readFileSync(new URL('../src/index.html', import.meta.url), 'utf8')), 'no way to the casino from the title screen');
});

// ── M6.16.0: Rhys's notes on the casino ──
console.log('\n-- M6.16.0 --');
T('the ramp climbs clockwise as the map is drawn: east, south, west, north', () => {
  const R = casinoRamp();
  const h = (a) => R.heightsAtTheta(a)[0].y;
  // first turn: level from east round to the doors (south), then up through west to north
  A(h(0.01) === 0 && h(Math.PI / 2) === 0, 'not level from the east to the doors');
  A(h(Math.PI) > 0.5 && h(-Math.PI / 2) > h(Math.PI) && h(-0.05) > h(-Math.PI / 2), 'not rising west then north: ' + [h(Math.PI), h(-Math.PI / 2), h(-0.05)].map((v) => v.toFixed(2)));
  // seen from above with north up, going east -> south is turning clockwise: theta (atan2 z, x) grows
  A(R.thetaOf(1) > R.thetaOf(0), 'turning the wrong way');
});
T('no invisible wall under the first climb: the solid base stops where it is drawn, and the passage beyond it is clear', () => {
  const [phiA, phiB] = L.rampFill, R = casinoRamp();
  // just past the drawn end of the base, at the ground: room to stand, all across the band
  for (const rr of [BAND[0] + 0.6, (BAND[0] + BAND[1]) / 2, BAND[1] - 0.6]) {
    const a = R.thetaOf(phiB + 0.45 / rr), x = CX + Math.cos(a) * rr, z = CZ + Math.sin(a) * rr;
    A(!L.world.hit([x - 0.3, 0.05, z - 0.3], [x + 0.3, 1.75, z + 0.3]), 'something unseen at ' + [x, z].map((v) => v.toFixed(1)));
  }
  // and the base's collision never reaches past it
  for (const s of L.world.solids.filter((q) => q.tag === 'ramp' && q.min[1] === 0)) {
    const mx = (s.min[0] + s.max[0]) / 2, mz = (s.min[2] + s.max[2]) / 2, base = R.heightsAtTheta(Math.atan2(mz - CZ, mx - CX))[0];
    A(base.phi <= phiB + 0.02 || base.phi >= TAU - 0.02, 'a solid base piece past the end of the base, at phi ' + base.phi.toFixed(2));
  }
  // the curved walls' collision keeps within a quarter of a metre of their faces, all the way round
  for (let a = -Math.PI; a < Math.PI; a += 0.02) for (const [r, y] of [[R_OUT - 0.2 - 0.25, 12], [R_MID + 0.175 + 0.25, 12], [R_MID - 0.175 - 0.25, 1]]) {
    const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r;
    A(!L.world.hits([x - 0.01, y, z - 0.01], [x + 0.01, y + 0.02, z + 0.01]).some((s) => s.tag === 'ring'), 'a ring wall\'s box sticks out at ' + a.toFixed(2) + ', r ' + r.toFixed(2));
  }
  // Rhys's spot (5.5, 0, 43): on the ramp now, walkable
  const p = new Player(L.world); p.pos = [5.5, 2, 43]; p.vel = [0, 0, 0]; p.settle();
  A(Math.abs(p.pos[1] - R.heightsAtTheta(Math.atan2(43 - CZ, 5.5 - CX))[0].y) < 0.2, 'not standing on the ramp at (5.5, 43): y ' + p.pos[1].toFixed(2));
});
T('windows you can see out of, a metre above the ramp beside them, climbing with it all the way round', () => {
  A(L.windows.length > 200, L.windows.length + ' windows');
  const R = casinoRamp();
  for (const w of L.windows) { const hs = R.heightsAtTheta(w.a + 0.001); A(hs.some((h) => Math.abs(h.y + 1.0 - w.y) < 0.08), 'a window not a metre above the ramp at ' + w.a.toFixed(2)); }
  const turns = new Set(L.windows.map((w) => Math.floor(w.phi / TAU)));
  A(turns.size >= 5, 'windows on only ' + turns.size + ' turns');
  // glass in them, and the outside wall's stone no longer painted with windows of its own
  A(L.pieces.some((p) => p.mat === 'glass' && p.quads && p.min[0] < 2) && !L.pieces.some((p) => p.mat === 'facade' && p.min[1] > 0.5 && Math.hypot((p.min[0] + p.max[0]) / 2 - CX, (p.min[2] + p.max[2]) / 2 - CZ) < R_OUT + 1), 'the windows are not real');
});
T('the round floors: one face each, no wedges meeting at a point, the stairs\' holes round', () => {
  const tops = L.pieces.filter((p) => p.quads && p.quads.length && p.quads.every((q) => q.v.length === 3 && q.n[1] === 1) && p.max[0] - p.min[0] > 45 && p.max[0] - p.min[0] < 2 * R_MID + 1);
  A(tops.length >= 6, tops.length + ' round floors');
  for (const p of tops) {
    A(new Set(p.quads.map((q) => q.sheet)).size === 1, 'a floor in several lightmap patches');
    // the middle, covered (no seam to see through), and nothing over the stair holes
    const y = p.min[1], covered = (x, z) => p.quads.some((q) => { const [a, b, c] = q.v; const s = (u, v, w) => (v[0] - u[0]) * (w[2] - u[2]) - (v[2] - u[2]) * (w[0] - u[0]); const d1 = s(a, b, [x, 0, z]), d2 = s(b, c, [x, 0, z]), d3 = s(c, a, [x, 0, z]); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); });
    const holes = L.stairs.filter((s) => Math.abs(s.y1 - y) < 0.05);
    if (!holes.some((s) => s.cx === CX && s.cz === CZ) && Math.abs(y - C_FLOORS.RT) > 0.01) A(covered(CX, CZ) && covered(CX + 0.01, CZ - 0.01), 'a gap in the middle of the floor at y ' + y);
    if (Math.abs(y - C_FLOORS.RT) < 0.01) A(!covered(CX, CZ) && covered(CX - 20, CZ), 'the roof: no hole for the pool, or no roof');
    for (const s of holes) A(!covered(s.cx + 0.5, s.cz + 0.5), 'floor over the hole for the ' + s.id + ' stair');
  }
});
T('the spiral stairs: a turn climbs 3.6 m (head-room), the landing comes out over the floor beside the hole, and back down again', () => {
  for (const s of L.stairs) {
    // (M6.17.0, Rhys: "I can still fall off them too easily") a rail you cannot go over, all the way up its outer edge
    for (let i = 1; i < s.plan.n - 1; i++) {
      const a = s.plan.a0 + s.plan.per * (i + 0.5), yt = s.y0 + s.plan.h * (i + 1), x = s.cx + Math.cos(a) * (s.rOut - 0.05), z = s.cz + Math.sin(a) * (s.rOut - 0.05);
      A(L.world.hits([x - 0.02, yt + 0.4, z - 0.02], [x + 0.02, yt + 0.5, z + 0.02]).some((q) => q.tag === 'rail'), s.id + ': no rail at step ' + i);
    }
    A(s.plan.per * 18 > TAU - 1e-6 && s.plan.per * 18 < TAU + 1e-6, s.id + ': not eighteen steps a turn');
    // the top: standing room on the floor beyond the landing
    const t = s.top, g = L.world.groundBelow(t[0], t[1] + 0.3, t[2], 0.05);
    A(Math.abs(g - s.y1) < 0.05, s.id + ': nothing to step off onto at the top (' + g.toFixed(2) + ')');
    // down: from the top, round the post the other way, to the foot
    const p = new Player(L.world); p.pos = [s.cx + Math.cos(s.aEnd + 0.4) * 1.0, s.y1 + 0.2, s.cz + Math.sin(s.aEnd + 0.4) * 1.0]; p.vel = [0, 0, 0]; p.settle();
    for (let i = 0; i < 60 * 30 && p.pos[1] > s.y0 + 0.05; i++) {
      const th = Math.atan2(p.pos[2] - s.cz, p.pos[0] - s.cx), r = 0.85;
      step(p, { moveZ: 1, yaw: yawTo(p, s.cx + Math.cos(th - 0.5) * r, s.cz + Math.sin(th - 0.5) * r) }, 1);
    }
    A(Math.abs(p.pos[1] - s.y0) < 0.15, s.id + ': coming down, stopped at y ' + p.pos[1].toFixed(2));
  }
});
T('the walls smoothed: no pixel staircases left, doors still square, and lines carried into the middle wall', () => {
  let lines = 0, reached = 0;
  for (const [k, W] of Object.entries(L.floorWalls)) for (const line of W.lines) {
    lines++; reached += line.reached;
    const pts = line.runs.flatMap((r, i) => (i ? r.pts.slice(1) : r.pts));
    // a staircase: a sharp turn (over 35 degrees) between two short legs (under 1.1 m) - the
    // map's squares, step by step. Smoothed, a line turns gently, or once at a real corner
    for (let i = 1; i + 1 < pts.length; i++) {
      const a = [pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]], b = [pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]];
      const la = Math.hypot(...a), lb = Math.hypot(...b), turn = Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1]) / (la * lb || 1))));
      A(!(turn > 35 * Math.PI / 180 && la < 1.1 && lb < 1.1), k + ': a staircase at ' + pts[i].map((v) => v.toFixed(1)));
    }
  }
  A(lines > 30 && reached > 10, lines + ' lines, ' + reached + ' carried to the middle wall');
  // and every wall square of the map has a wall through it (within 0.75 m), nothing dropped
  for (const [k, W] of Object.entries(L.floorWalls)) {
    const segs = W.lines.flatMap((l) => l.runs.flatMap((r) => r.pts.slice(1).map((p, i) => [r.pts[i], p])));
    const dist = (x, z) => Math.min(...segs.map(([a, b]) => { const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz; let t = l2 ? ((x - a[0]) * dx + (z - a[1]) * dz) / l2 : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); }));
    const rows = MAP.floors[k];
    for (let z = 0; z < 60; z++) for (let x = 0; x < 60; x++) {
      const c = rows[z] && rows[z][x];
      const r = Math.hypot(x + 0.5 - CX, z + 0.5 - CZ);
      if (c !== 'W' || r > R_MID - 1.2 || (k === '2' && r < 2.6)) continue;
      A(dist(x + 0.5, z + 0.5) < 0.75, k + ': no wall through the map\'s wall square ' + [x, z]);
    }
  }
});
T('the kiosks: one counter the whole length of each, under a glass screen', () => {
  const W = L.floorWalls.G, counters = W.lines.flatMap((l) => l.runs.filter((r) => r.kind === 'C'));
  A(counters.length === 2, counters.length + ' counters on the ground floor');
  for (const r of counters) { let len = 0; for (let i = 0; i + 1 < r.pts.length; i++) len += Math.hypot(r.pts[i + 1][0] - r.pts[i][0], r.pts[i + 1][1] - r.pts[i][1]); A(len > 6.5, 'a counter only ' + len.toFixed(1) + ' m long'); }
});
T('the gaming floor: poker, roulette, blackjack, baccarat and craps tables, each its own shape, with chairs or stools', () => {
  const F = L.furniture.G, kinds = new Set(F.tables.map((t) => t.kind));
  for (const k of ['poker', 'roulette', 'blackjack', 'baccarat', 'craps']) A(kinds.has(k), 'no ' + k + ' table');
  // a table's outline is not a box: more than four corners
  A(F.tables.every((t) => t.outline.length > 8), 'a table still a rectangle');
  const chairs = L.world.solids.filter((s) => s.tag === 'chair' && s.min[1] < 1);
  A(chairs.length > 80, chairs.length + ' chairs and stools on the ground floor');
  // nobody's chair is inside a table or a wall
  for (const c of L.world.solids.filter((s) => s.tag === 'chair')) A(!L.world.hits([c.min[0] + 0.05, c.min[1] + 0.05, c.min[2] + 0.05], [c.max[0] - 0.05, c.max[1] - 0.05, c.max[2] - 0.05]).some((s) => s !== c && (s.tag === 'table' || s.tag === 'plaster' || s.tag === 'ring' || s.tag === 'chair' || s.tag === 'slot' || s.tag === 'banquette' || s.tag === 'bar' || s.tag === 'wc' || s.tag === 'vault')), 'a chair inside something at ' + c.min.map((v) => v.toFixed(1)));
  // the reds still stand clear, and can still walk their routes (the earlier test)
});
T('the restaurant\'s round tables: still room to crawl under (Rhys loves it)', () => {
  A(L.furniture['1'].dining === 20, L.furniture['1'].dining + ' dining tables');
  const y = C_FLOORS[1];
  const t = L.world.solids.find((s) => s.tag === 'table' && Math.abs(s.min[1] - (y + 0.72)) < 0.01);
  const cx = (t.min[0] + t.max[0]) / 2 + 0.45, cz = (t.min[2] + t.max[2]) / 2;
  A(!L.world.hit([cx - 0.25, y + 0.05, cz - 0.25], [cx + 0.25, y + 0.6, cz + 0.25]), 'no room under a dining table');
});
T('the bars: a round one on the ground floor, glasses hanging round over it, stools; an arc of bar upstairs with its shelves', () => {
  A(L.furniture.G.bars === 1 && L.furniture['1'].bars === 1, 'bars ' + L.furniture.G.bars + ', ' + L.furniture['1'].bars);
  const glasses = L.pieces.filter((p) => p.mat === 'glass' && !p.quads && p.min[1] > 2 && p.max[1] < 3.7 && Math.hypot(p.min[0] - CX, p.min[2] - CZ) < 5.5);
  A(glasses.length > 150, glasses.length + ' bits of glassware over the ground floor bar');
  const stools = L.world.solids.filter((s) => s.tag === 'chair' && s.max[1] > 0.75 && s.max[1] < 0.85 && Math.hypot((s.min[0] + s.max[0]) / 2 - CX, (s.min[2] + s.max[2]) / 2 - CZ) < 6);
  A(stools.length > 20, stools.length + ' stools round the bar');
});
T('slot machines: each backed onto its wall, a lit face (M6.17.0: reading the right way round), a topper, a stool', () => {
  for (const p of L.pieces.filter((q) => /^slotface/.test(q.mat))) {
    const q = p.quads[0], d = [-q.n[0], -q.n[2]], right = [-d[1], d[0]];
    const u1 = q.v[q.uv.findIndex((t) => t[0] === 1 && t[1] === 1)], u0 = q.v[q.uv.findIndex((t) => t[0] === 0 && t[1] === 1)];
    A((u1[0] - u0[0]) * right[0] + (u1[2] - u0[2]) * right[1] > 0, 'a slot machine\'s face is back to front');
  }
  A(L.furniture.G.slots >= 10, L.furniture.G.slots + ' slot machines');
  A(L.pieces.filter((p) => /^slotface/.test(p.mat)).length === L.furniture.G.slots + L.coil.items.filter((i) => i.kind === 'slot').length, 'a machine without its face');      // (M6.17.12: and the coil's)
  for (const s of L.world.solids.filter((q) => q.tag === 'slot')) {
    const cx = (s.min[0] + s.max[0]) / 2, cz = (s.min[2] + s.max[2]) / 2;
    const backed = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => L.world.hit([cx + dx * 0.6 - 0.05, 1, cz + dz * 0.6 - 0.05], [cx + dx * 0.6 + 0.05, 1.2, cz + dz * 0.6 + 0.05], s));
    A(backed, 'a slot machine standing free at ' + [cx, cz].map((v) => v.toFixed(1)));
  }
});
T('the washrooms (M6.17.0, Rhys: too crowded): one cubicle with its toilet, and one basin under a mirror, each', () => {
  const all = Object.values(L.furniture).flatMap((f) => f.washrooms);
  A(all.length === 6, all.length + ' washrooms');
  for (const w of all) A(w.cubicles === 1 && w.basins === 1 && w.urinals === 0, w.floor + ' ' + w.name + ': ' + [w.cubicles, w.basins, w.urinals]);
  A(L.pieces.some((p) => p.mat === 'mirror') && L.pieces.some((p) => p.mat === 'wctile'), 'no mirrors or tiles');
});
T('the roof pool: its glass is its side, and the ladders go up and over it, in and out', () => {
  const P = L.pool, y = C_FLOORS.RT;
  A(P.ladders.length === 8, P.ladders.length + ' ladders');
  // nothing but the pool's own glass between the terrace and each outside ladder
  for (const l of P.ladders.filter((q) => q.outside)) {
    const x = l.pos[0] + l.face[0] * 1.2, z = l.pos[1] + l.face[1] * 1.2;
    A(!L.world.hit([x - 0.3, y + 0.05, z - 0.3], [x + 0.3, y + 1.8, z + 0.3]), 'something in the way of the ladder at ' + l.pos.map((v) => v.toFixed(1)));
  }
  // up the outside, over, and down into the water
  const l = P.ladders.find((q) => q.outside), p = new Player(L.world);
  p.pos = [l.pos[0] + l.face[0] * 1.3, y + 0.1, l.pos[1] + l.face[1] * 1.3]; p.vel = [0, 0, 0]; p.settle();
  const toward = Math.atan2(l.face[0], l.face[1]);
  let wet = false;
  for (let i = 0; i < 60 * 12 && !wet; i++) { step(p, { moveZ: 1, yaw: toward }, 1); wet = !!L.world.waterAt(p.pos[0], p.pos[1] + 0.3, p.pos[2]); }
  A(wet, 'never got into the pool: ' + p.pos.map((v) => v.toFixed(2)) + ' ' + p.mode);
  // (M6.17.0, Rhys: "very shallow? Can't actually swim in it?") deep enough to swim
  for (let i = 0; i < 60 * 3; i++) step(p, { moveZ: 1, yaw: toward }, 1);
  A(p.mode === 'swim', 'not swimming in the pool: ' + p.mode + ' at ' + p.pos.map((v) => v.toFixed(2)));
  A(P.surface - P.floor > 2.0, 'only ' + (P.surface - P.floor).toFixed(2) + ' m deep');
  // water only inside it: the terrace beside it is dry
  A(!L.world.waterAt(P.loop[0][0] + 1.5 * Math.sign(P.loop[0][0] - CX), y + 0.3, P.loop[0][1]), 'water outside the pool');
});
T('a neighbourhood: a road round the casino, pavements, buildings, shop signs - and no firing range fence', () => {
  A(!L.world.solids.some((s) => s.tag === 'fence'), 'the range fence is still there');
  A(L.pieces.filter((p) => p.mat === 'facade').length > 20, 'no buildings');
  A(L.signs.filter((s) => s.text !== 'CASINO').length >= 10 && !L.signs.some((s) => /RANGE/.test(s.text)), 'no shop signs');
  // walk the road all the way round
  const r = L.street.road, p = new Player(L.world); p.pos = L.world.spawn.pos.slice(); p.settle();
  const mid = [(r[0] + STREET.plaza[0]) / 2, (r[1] + STREET.plaza[1]) / 2, (r[2] + STREET.plaza[2]) / 2, (r[3] + STREET.plaza[3]) / 2];
  for (const [x, z] of [[mid[2], mid[3]], [mid[2], mid[1]], [mid[0], mid[1]], [mid[0], mid[3]], [30, mid[3]]]) A(walkTo(p, x, z, 40), 'could not walk the road to ' + [x, z] + ': ' + p.pos.map((v) => v.toFixed(1)));
  // and no way out past the buildings
  const b = L.street.blocks;
  for (const [x, z] of [[b[0] - 1, 30], [b[2] + 1, 30], [30, b[1] - 1], [30, b[3] + 1]]) {
    const q = new Player(L.world); q.pos = [(x + 30) / 2, 0.2, (z + 30) / 2 > 70 ? STREET.plaza[3] + 5 : (z + 30) / 2]; q.settle();
    walkTo(q, x, z, 30);
    A(Math.abs(q.pos[0] - x) > 3 || Math.abs(q.pos[2] - z) > 3, 'walked out of the city to ' + [x, z]);
  }
});
T('the grid over the ground gives the same answers as looking at every solid', () => {
  let r = 99; const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 400; i++) {
    const o = [CX + (rnd() - 0.5) * 80, rnd() * 25, CZ + (rnd() - 0.5) * 80], a = rnd() * TAU, d = [Math.cos(a) * 0.95, (rnd() - 0.5) * 0.6, Math.sin(a) * 0.95], l = Math.hypot(...d);
    const dir = d.map((v) => v / l);
    const g = L.world.raycast(o, dir, 50), all = L.world.raycastAll(o, dir, 50);
    A((!g && !all) || (g && all && g.solid === all.solid && Math.abs(g.t - all.t) < 1e-9), 'raycast differs at ' + o.map((v) => v.toFixed(1)));
    const mn = [o[0] - 0.4, o[1], o[2] - 0.4], mx = [o[0] + 0.4, o[1] + 1.8, o[2] + 0.4];
    const lin = L.world.solids.find((s) => !s.disabled && mn[0] < s.max[0] - 1e-4 && mx[0] > s.min[0] + 1e-4 && mn[1] < s.max[1] - 1e-4 && mx[1] > s.min[1] + 1e-4 && mn[2] < s.max[2] - 1e-4 && mx[2] > s.min[2] + 1e-4) || null;
    A(L.world.hit(mn, mx) === lin, 'hit differs at ' + o.map((v) => v.toFixed(1)));
  }
});

// ── M6.17.0 ──
console.log('\n-- M6.17.0 --');
T('the casino kit (Rhys): bare hands, a silenced V-27C, two lures, two smoke grenades, a parachute pack', () => {
  const K = L.startLoadout;
  const lo = new Loadout(Object.fromEntries(Object.entries(K).filter(([k]) => k !== 'mods')));
  for (const [slot, mods] of Object.entries(K.mods)) for (const m of mods) lo.fit(slot, m);
  A(lo.get('primary') === null && lo.get('backup') === 'V27C' && lo.get('utility1') === 'LURE' && lo.get('utility2') === 'SMOKE' && lo.get('gear') === 'PARACHUTE', JSON.stringify(lo.slots));
  A(lo.statsFor('backup').quiet < 1, 'the V-27C is not silenced');
  A(ITEMS.LURE.count === 2 && ITEMS.SMOKE.count === 2 && lo.gearTrait('chute'), 'counts or the parachute');
  const ar = new Arsenal(L.world, { loadout: lo });
  A(ar.current === 'V27C', 'starts with ' + ar.current);
});
T('a lure: placed, then set off from afar - a noise, not a blast', () => {
  const W = new World(); W.addSolid([-10, -1, -10], [10, 0, 10], 'floor'); W.addSolid([2, 0, -5], [2.3, 3, 5], 'wall');
  const lo = new Loadout({ utility1: 'LURE' }), ar = new Arsenal(W, { loadout: lo });
  ar.select('LURE');
  const me = { eyePos: [0, 1.6, 0], pos: [0, 0, 0], damage() {}, health: 100 };
  const r = ar.placeCharge([0, 1.6, 0], [1, -0.2, 0]);
  A(r && r.placed, 'not placed');
  ar.detonateAll();
  for (let i = 0; i < 10; i++) ar.step(1 / 60, me);
  const ev = ar.events.filter((e) => e.type === 'lure' || e.type === 'blast');
  A(ev.length === 1 && ev[0].type === 'lure' && ev[0].noise > 1, JSON.stringify(ev.map((e) => e.type)));
});
T('the gantry: off the roof with the parachute, open it, steer down to the jeep - and land softly', () => {
  const g = L.gantry, p = new Player(L.world);
  p.pos = [g.pos[0], g.pos[1] + 0.1, g.pos[2] - 1.5]; p.vel = [0, 0, 0]; p.settle(); p.parachute = true;
  p.yaw = Math.PI;                      // facing south, off the end
  let opened = false, landed = null;
  for (let i = 0; i < 60 * 40 && !landed; i++) {
    const falling = !p.onGround && p.vel[1] < -3;
    // steer for the jeep once the canopy is open
    const yaw = p.chute ? yawTo(p, JEEP_AT[0], JEEP_AT[2] - 2.5) : Math.PI;
    p.step(1 / 60, { moveX: 0, moveZ: p.chute ? (Math.hypot(JEEP_AT[0] - p.pos[0], JEEP_AT[2] - 2.5 - p.pos[2]) > p.pos[1] ? 1 : -1) : 1, yaw, pitch: 0, jumpPressed: falling && !opened });
    if (p.chute) opened = true;
    if (opened && !p.chute && p.onGround) landed = p.pos.slice();
  }
  A(opened, 'the parachute never opened');
  A(landed && landed[1] < 0.5, 'never came down: ' + p.pos.map((v) => v.toFixed(1)));
  A(Math.hypot(landed[0] - JEEP_AT[0], landed[2] - JEEP_AT[2]) < 9, 'came down ' + Math.hypot(landed[0] - JEEP_AT[0], landed[2] - JEEP_AT[2]).toFixed(1) + ' m from the jeep');
  A(p.health === 100, 'hurt landing: ' + p.health.toFixed(0));
  // and without one, the same jump is a long fall
  const q = new Player(L.world); q.pos = [g.pos[0], g.pos[1] + 0.1, g.pos[2] - 1.5]; q.settle(); q.yaw = Math.PI;
  for (let i = 0; i < 60 * 8; i++) q.step(1 / 60, { moveX: 0, moveZ: 1, yaw: Math.PI, pitch: 0, jumpPressed: true });
  A(q.health < 100, 'jumping off the roof without a parachute did not hurt');
});
T('glassware at the bars: bullets meet it (and shatter it), nobody walks into it', () => {
  const gw = L.world.solids.filter((s) => s.glassware);
  A(gw.length > 100, gw.length + ' pieces');
  const g = gw[0], c = [(g.min[0] + g.max[0]) / 2, (g.min[1] + g.max[1]) / 2, (g.min[2] + g.max[2]) / 2];
  A(!L.world.hit([c[0] - 0.05, c[1] - 0.05, c[2] - 0.05], [c[0] + 0.05, c[1] + 0.05, c[2] + 0.05]), 'something solid where the glasses hang');
  const lo = new Loadout({ backup: 'V27C' }), ar = new Arsenal(L.world, { loadout: lo });
  const from = [c[0], c[1], c[2] + 3], hit = ar.trace(from, [0, 0, -1], 6);
  A(ar.events.some((e) => e.type === 'pierce' && e.solid && e.solid.glassware), 'the round did not go through the glassware');
});
T('the Quiet Booth\'s banquette, the Cash Vault\'s boxes, notes and gold; the kiosks and the staff door reachable', () => {
  const B = L.furniture.G.booth, V = L.furniture['2'].vault;
  A(B && B.length > 6 && B.tables >= 1, 'banquette ' + JSON.stringify(B));
  A(V && V.boxes > 100 && V.shelves >= 1 && V.table, 'vault ' + JSON.stringify(V));
  A(L.zones.cash_vault, 'no Cash Vault zone');
  const nav = new NavGrid(L.world, L.navFloors, L.navLinks); nav.syncDoors(L.swingDoors);
  for (const [x, z, what] of [[6.5, 30, 'the Chips Counter'], [53.5, 30, 'the Check-in Desk']]) A(nav.find([14, 0, 40.5], [x, 0, z]), 'no way into ' + what);
  // the staff door: from the plaza, in, along the passage under the ramp, to the ground floor's way in (east)
  const sd = L.outerDoors.find((d) => d.id === 'staff');
  const p = new Player(L.world); p.pos = [CX + Math.cos(sd.a) * (R_OUT + 2), 0.2, CZ + Math.sin(sd.a) * (R_OUT + 2)]; p.settle();
  // (M6.17.1) a door in it now: shut, it stops you; opened, it lets you by
  const leaf = L.staffDoor;
  A(leaf, 'no staff door leaf');
  if (leaf.open) leaf.use([CX, 0, CZ - R_OUT - 2], null);          // (an earlier test may have left it open)
  A(!leaf.open && L.world.hit([CX - 0.2, 0.2, CZ - R_OUT - 0.05], [CX + 0.2, 1.8, CZ - R_OUT + 0.05]), 'no shut leaf in the staff doorway');
  A(leaf.use(p.pos, null) === 'opened', 'the staff door would not open');
  A(walkTo(p, CX + Math.cos(sd.a) * RMID, CZ + Math.sin(sd.a) * RMID, 10), 'could not get in by the staff door: ' + p.pos.map((v) => v.toFixed(1)));
  for (let i = 0; i < 60 * 40 && Math.abs(Math.atan2(p.pos[2] - CZ, p.pos[0] - CX)) > 0.05; i++) {
    const th = Math.atan2(p.pos[2] - CZ, p.pos[0] - CX), [tx, tz] = at(RMID, th + 0.1);
    step(p, { moveZ: 1, yaw: yawTo(p, tx, tz) }, 1);
  }
  A(Math.abs(Math.atan2(p.pos[2] - CZ, p.pos[0] - CX)) <= 0.05 && p.pos[1] < 0.3, 'the passage from the staff door did not lead round to the east: ' + p.pos.map((v) => v.toFixed(1)));
});
T('the shops: every one different, none open all night, each sign on the front you can see', () => {
  const S = L.shopSigns;
  A(S.length >= 15 && new Set(S.map((q) => q.text)).size === S.length, 'repeated shops');
  A(!S.some((q) => /24/.test(q.text)), 'a 24-hour shop');
  for (const q of S) A(q.from >= q.span[0] - 1e-6 && q.to <= q.span[1] + 1e-6, q.text + ' hangs off its front');
});
T('the jeep is where you start and where you leave; a gap in the roof\'s glass to the gantry; no lamp hangs in the air', () => {
  const z = L.apcZone, sp = L.world.spawn.pos;
  A(JEEP_AT[0] >= z.x0 && JEEP_AT[0] <= z.x1 && JEEP_AT[2] >= z.z0 && JEEP_AT[2] <= z.z1, 'the jeep is not in the extraction zone');
  A(sp[0] >= z.x0 && sp[0] <= z.x1 && sp[2] >= z.z0 && sp[2] <= z.z1, 'you do not start at the jeep');
  // the roof terrace's glass is open where the gantry goes out
  const y = C_FLOORS.RT + 0.6, gz = CZ + R_OUT;
  A(!L.world.hits([CX - 0.3, y, gz - 0.3], [CX + 0.3, y + 0.5, gz + 0.3]).some((s) => s.glass), 'glass across the gantry');
  for (const p of L.pieces.filter((q) => q.mat === 'lamp')) {
    const cx = (p.min[0] + p.max[0]) / 2, cz = (p.min[2] + p.max[2]) / 2, r = Math.hypot(cx - CX, cz - CZ);
    A(!(r > R_MID && p.min[1] > C_FLOORS.RT), 'a lamp hanging in the air over the roof at ' + [cx, p.min[1], cz].map((v) => v.toFixed(1)));
  }
});
T('roulette: the layout stops short of the wheel; the half-moon tables have room between them; washroom tiles and small ceilings keep within their walls', () => {
  for (const t of L.furniture.G.tables.filter((q) => q.kind === 'roulette')) A(t.layout[1] < t.wheel[0] - t.wheel[1], 'the wheel sits on the numbers');
  const hm = L.furniture.G.tables.filter((q) => q.kind === 'baccarat');
  for (const a of hm) for (const b of hm) if (a !== b) A(Math.hypot(a.cx - b.cx, a.cz - b.cz) >= 4.6, 'baccarat tables ' + Math.hypot(a.cx - b.cx, a.cz - b.cz).toFixed(1) + ' m apart');
  // a washroom's tiles: never further beyond the room's own squares than the far face of its wall
  for (const w of Object.values(L.furniture).flatMap((f) => f.washrooms)) {
    const { outline, cells } = w.tiles;
    for (const [x, z] of outline) {
      const d = Math.min(...cells.map(([cx, cz]) => Math.hypot(Math.max(cx - x, 0, x - cx - 1), Math.max(cz - z, 0, z - cz - 1))));
      A(d < 0.62, w.floor + ' ' + w.name + ': tiles ' + d.toFixed(2) + ' m beyond the room at ' + [x, z].map((u) => u.toFixed(1)));
    }
  }
});

console.log('\n-- M6.17.1 --');
T('the half-moon tables: a true half-moon, its outline never crossing itself', () => {
  const cross = (a, b, c, d) => { const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])); return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0; };
  const hm = Object.values(L.furniture).flatMap((f) => f.tables).filter((t) => /blackjack|baccarat/.test(t.kind));
  A(hm.length >= 2, hm.length + ' half-moon tables');
  for (const t of hm) {
    const o = t.outline, n = o.length;
    for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      A(!cross(o[i], o[(i + 1) % n], o[j], o[(j + 1) % n]), t.kind + ' table at ' + [t.cx, t.cz].map((v) => v.toFixed(1)) + ': its outline crosses itself (edges ' + i + ', ' + j + ')');
    }
  }
});
T('the staff door: round at due north, under the ramp, a leaf in it; the lockers inside, a box of pistol rounds', () => {
  const sd = L.outerDoors.find((d) => d.id === 'staff');
  A(Math.abs(sd.a + Math.PI / 2) < 1e-6, 'the staff door is not due north');
  A(L.staffDoor && L.staffDoor.def.plane === 'z' && Math.abs(L.staffDoor.def.at - (CZ - R_OUT)) < 0.01 && L.staffDoor.width > 1.2, 'no leaf hung in the staff doorway');
  // headroom through it: the ramp passes over well above the door
  A(!L.world.hit([CX - 0.6, 0.1, CZ - R_OUT + 0.3], [CX + 0.6, 2.0, CZ - R_OUT + 2.5]), 'something in the way just inside the staff door');
  A(L.staffAmmo && L.staffAmmo.items.includes('AMMO_PISTOL') && L.crates.includes(L.staffAmmo), 'no pistol rounds by the staff door');
  const nav = new NavGrid(L.world, L.navFloors, L.navLinks); nav.syncDoors(L.swingDoors);
  const c = L.staffAmmo.pos;
  A(nav.find([CX, 0, CZ - R_OUT + 1.2], [c[0] + (CX - c[0]) * 0.03, 0, c[2] + (CZ - c[2]) * 0.03]), 'cannot get from the staff door to the pistol rounds');
});
T('C5 before the Tournament Room: a case of it on the crates in the nook at the west end of floor 2 (Rhys\'s dead end)', () => {
  const c = L.c5Crate;
  A(c && c.items.includes('C5') && L.crates.includes(c), 'no C5 crate');
  A(Math.hypot(c.pos[0] - 6, c.pos[2] - 31) < 2.5 && Math.abs(c.pos[1] - C_FLOORS[2] - 0.7) < 0.3, 'the C5 is not in the nook: ' + c.pos.map((v) => v.toFixed(1)));
  const nav = new NavGrid(L.world, L.navFloors, L.navLinks); nav.syncDoors(L.swingDoors);
  A(nav.find([CX + RMID, C_FLOORS[2], CZ], [6.3, C_FLOORS[2], 30.1]), 'no way from the ramp on floor 2 to the C5');
  // within reach of where you stand, in front of it
  const p = new Player(L.world); p.pos = [6.3, C_FLOORS[2] + 0.2, 30.4]; p.settle();
  A(Math.abs(p.pos[1] - C_FLOORS[2]) < 0.1 && Math.hypot(p.pos[0] - c.pos[0], p.pos[2] - c.pos[2]) < 1.6, 'nowhere to stand by the C5');
});
T('slot machines: a mix of six games, no two neighbours the same', () => {
  const faces = L.pieces.filter((q) => /^slotface/.test(q.mat)).map((q) => ({ mat: q.mat, x: (q.min[0] + q.max[0]) / 2, z: (q.min[2] + q.max[2]) / 2 }));
  const kinds = new Set(faces.map((f) => f.mat));
  A(kinds.size >= 5, kinds.size + ' different games');
  for (const a of faces) for (const b of faces) if (a !== b && Math.hypot(a.x - b.x, a.z - b.z) < 1.05) A(a.mat !== b.mat, 'neighbouring machines on the same game at ' + [a.x, a.z].map((v) => v.toFixed(1)));
  const tex = readFileSync(new URL('../src/game/textures.js', import.meta.url), 'utf8');
  const titles = [...tex.matchAll(/title: '([^']+)', prize: '([^']+)'/g)].map((m) => m[1] + m[2]);
  A(titles.length === 6 && new Set(titles).size === 6, 'the games\' names and prizes: ' + titles.join(', '));
  for (const k of kinds) A(new RegExp('\\b' + k + '\\(g, w, h, r\\)').test(tex), 'no painting for ' + k);
});
T('every room off the halls on the ground and second floors has its lamps (the Tournament Room and the Businessman\'s Booth well lit)', () => {
  for (const key of ['G', '2']) {
    const rows = MAP.floors[key], y0 = C_FLOORS[key], rl = rooms(rows, insideMask(rows));
    for (const cells of rl) {
      if (cells.length >= 400 || cells.some(([x, y]) => Math.hypot(x + 0.5 - CX, y + 0.5 - CZ) > R_MID + 0.5)) continue;
      const own = new Set(cells.map(([x, y]) => x + ',' + y));
      const n = L.lights.filter((l) => l.pos[1] > y0 && l.pos[1] < y0 + 4.5 && own.has(Math.floor(l.pos[0]) + ',' + Math.floor(l.pos[2]))).length;
      const name = MAP.labels.filter((l) => l[1] === key && cells.some(([x, y]) => Math.abs(x - l[2]) <= 1 && Math.abs(y - l[3]) <= 1)).map((l) => l[0]).join('|') || 'a room at ' + cells[0];
      A(n >= Math.max(1, Math.round(cells.length / 30)), key + ' ' + name + ': ' + n + ' lamps for ' + cells.length + ' squares');
      if (/Tournament|Businessman/.test(name)) A(n >= 4, name + ': only ' + n + ' lamps');
    }
  }
});
T('the front lit up at night: uplighters round the foot, a band of light round the top, strips up the front', () => {
  A(L.facadeLights.length >= 12, L.facadeLights.length + ' uplighters');
  A(L.facadeStrips.length === 4 && L.facadeStrips.every((a) => Math.abs(a - Math.PI / 2) < 0.75), 'the strips up the front');
  const crown = L.pieces.filter((p) => p.mat === 'neon' && p.min[1] > C_FLOORS.RT - 0.5 && p.max[0] - p.min[0] > 50);
  A(crown.length >= 2, 'no band of light round the top');
  for (const a of L.facadeLights) {
    const x = CX + Math.cos(a) * (R_OUT + 1.1), z = CZ + Math.sin(a) * (R_OUT + 1.1);
    A(L.lights.some((l) => Math.hypot(l.pos[0] - x, l.pos[2] - z) < 0.1), 'an uplighter with no light');
  }
});
T('the ramp\'s top: a level landing beside the way onto the roof, a rail across its end - walk on and you stop, not fall', () => {
  const R = casinoRamp();
  A(Math.abs(R.heightAt(R.end) - C_FLOORS.RT) < 1e-6 && Math.abs(R.heightAt(R.end - 2.0 / RMID) - C_FLOORS.RT) < 1e-6, 'no level landing at the top');
  A(Math.abs(Math.atan2(Math.sin(R.thetaOf(R.end - RAMP_TOP / RMID) - ACCESS.RT), Math.cos(R.thetaOf(R.end - RAMP_TOP / RMID) - ACCESS.RT))) < 0.01, 'the landing does not start at the way onto the roof');
  const rr = L.rampRail;
  A(rr && L.world.solids.filter((s) => s.tag === 'rail' && s.min[1] >= C_FLOORS.RT - 0.01 && Math.hypot((s.min[0] + s.max[0]) / 2 - CX, (s.min[2] + s.max[2]) / 2 - CZ) > BAND[0] - 0.2).length >= 8, 'no rail across the end');
  // walk along the landing, on round, at every width across the band
  for (const r of [BAND[0] + 0.4, RMID, BAND[1] - 0.4]) {
    const p = new Player(L.world), a0 = R.thetaOf(R.end - 1.8 / r);
    p.pos = [CX + Math.cos(a0) * r, C_FLOORS.RT + 0.3, CZ + Math.sin(a0) * r]; p.settle();
    for (let i = 0; i < 60 * 4; i++) {
      const th = Math.atan2(p.pos[2] - CZ, p.pos[0] - CX), [tx, tz] = at(r, th + 0.2);
      step(p, { moveZ: 1, yaw: yawTo(p, tx, tz) }, 1);
    }
    A(p.pos[1] > C_FLOORS.RT - 0.2, 'walked off the top of the ramp at r ' + r.toFixed(1) + ': y ' + p.pos[1].toFixed(2));
  }
});
T('no GANTRY sign; nothing from the rooms inside pokes through the middle ring into the ramp', () => {
  A(!L.signs.some((s) => /GANTRY/.test(s.text)), 'a GANTRY sign');
  const face = R_MID + T_MID / 2;
  for (const p of L.pieces.filter((q) => /wctile|mirror/.test(q.mat))) {
    for (const q of p.quads || []) for (const v of q.v) A(Math.hypot(v[0] - CX, v[2] - CZ) < face, p.mat + ' in the ramp at ' + v.map((u) => u.toFixed(1)));
  }
  for (const s of L.world.solids.filter((q) => /^(wc|banquette|vault)$/.test(q.tag))) {
    for (const x of [s.min[0], s.max[0]]) for (const z of [s.min[2], s.max[2]]) {
      const r = Math.hypot(x - CX, z - CZ), mid = Math.hypot((s.min[0] + s.max[0]) / 2 - CX, (s.min[2] + s.max[2]) / 2 - CZ);
      A(mid < R_MID, s.tag + ' in the ramp at ' + [x, z].map((u) => u.toFixed(1)) + ' r ' + r.toFixed(2));
    }
  }
});
T('the Quiet Booth\'s banquette fills its wall, wall lights over it; the washrooms: basin, tap, lit mirror, a dryer; the pool\'s ladders all in its tank', () => {
  const B = L.furniture.G.booth;
  A(B.length >= 0.8 * B.span, 'the banquette runs ' + B.length.toFixed(1) + ' m of ' + B.span.toFixed(1));
  A(B.sconces >= 6, (B.sconces || 0) + ' wall lights');
  for (const w of Object.values(L.furniture).flatMap((f) => f.washrooms)) A(w.basins === 1 && w.cubicles === 1 && w.dryer, w.floor + ' ' + w.name + ': ' + JSON.stringify({ b: w.basins, c: w.cubicles, d: w.dryer }));
  for (const l of L.pool.ladders.filter((q) => !q.outside)) {
    const [lx, lz] = l.pos, f = l.face, side = [-f[1], f[0]];
    for (const s of [-0.45, 0.45]) A(pointInPoly(lx + side[0] * s + f[0] * 0.3, lz + side[1] * s + f[1] * 0.3, L.pool.water), 'a ladder in the pool reaches past its tank at ' + [lx, lz].map((v) => v.toFixed(1)));
  }
  // (M6.17.1, Rhys: "the very bottom feet of the ladders clip into the floor below") none reaches below the tank's floor
  const xs = L.pool.loop.map((q) => q[0]), zs = L.pool.loop.map((q) => q[1]);
  const inPool = (p) => p.max[0] > Math.min(...xs) - 1 && p.min[0] < Math.max(...xs) + 1 && p.max[2] > Math.min(...zs) - 1 && p.min[2] < Math.max(...zs) + 1;
  for (const p of L.pieces.filter((q) => q.mat === 'iron' && inPool(q))) A(p.min[1] >= L.pool.floor - 0.01, 'a ladder\'s foot through the tank\'s floor: ' + p.min[1].toFixed(2));
  for (const l of L.world.ladders.filter(inPool)) A(l.min[1] >= L.pool.floor - 0.01, 'a ladder (to climb) below the tank\'s floor');
});

console.log('\n-- M6.17.2 --');
T('no gap through the middle ring beside a doorway onto the ramp (Rhys: a slit into floor 2\'s washroom at ~52, 8, 31)', () => {
  for (const [k, y0] of Object.entries(C_FLOORS)) {
    if (k === 'RT' || k === '2A') continue;
    const runs = []; let cur = null;
    for (let a = -Math.PI; a < Math.PI; a += 0.002) {
      let clear = true;
      for (let r = R_MID - 0.35; r <= R_MID + 0.35 && clear; r += 0.05) {
        const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r;
        if (L.world.hit([x - 0.01, y0 + 1.2, z - 0.01], [x + 0.01, y0 + 1.6, z + 0.01])) clear = false;
      }
      if (clear) { if (!cur) cur = [a, a]; cur[1] = a; } else if (cur) { runs.push(cur); cur = null; }
    }
    for (const [a, b] of runs) A((b - a) * R_MID > 1.0, k + ': a ' + ((b - a) * R_MID).toFixed(2) + ' m slit through the middle ring at ' + [CX + Math.cos(a) * R_MID, CZ + Math.sin(a) * R_MID].map((v) => v.toFixed(1)));
    A(runs.length >= 1, k + ': no way in from the ramp');
  }
});
T('the washrooms: every fitting inside the room, flush to a wall and clear of it, the door kept clear, room to use each', () => {
  for (const w of Object.values(L.furniture).flatMap((f) => f.washrooms)) {
    const y = C_FLOORS[w.floor], tag = w.floor + ' ' + w.name;
    A(w.cubicles === 1 && w.basins === 1 && w.dryer, tag + ': ' + JSON.stringify({ c: w.cubicles, b: w.basins, d: w.dryer }));
    for (const f of w.fittings) {
      // its footprint: corners and middle, inside the room's walls, and in no wall
      const [a, b, c, d] = f.pts, pts = [a, b, c, d, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2]].map(([x, z], i) => i < 4 ? [x + ((a[0] + c[0]) / 2 - x) * 0.05, z + ((a[1] + c[1]) / 2 - z) * 0.05] : [x, z]);
      for (const [x, z] of pts) {
        A(pointInPoly(x, z, w.free), tag + ': its ' + f.kind + ' reaches out of the room at ' + [x, z].map((v) => v.toFixed(2)));
        const h = f.high ? [1.1, 1.3] : [0.2, 0.8];
        const hit = L.world.hits([x - 0.02, y + h[0], z - 0.02], [x + 0.02, y + h[1], z + 0.02]).filter((s) => s.tag !== 'wc');
        A(!hit.length, tag + ': its ' + f.kind + ' runs into ' + (hit[0] && hit[0].tag) + ' at ' + [x, z].map((v) => v.toFixed(2)));
      }
    }
    // room to stand: most of the floor left free
    const cells = w.tiles.cells, open = cells.filter(([x, z]) => !L.world.hit([x + 0.3, y + 0.2, z + 0.3], [x + 0.7, y + 1.6, z + 0.7]));
    A(open.length >= cells.length * 0.45, tag + ': only ' + open.length + ' of ' + cells.length + ' squares free to stand in');
  }
});
T('the parachute: used, it is unpacked - and you repack it yourself, holding E, standing still on the ground, and it takes time', () => {
  const st = { used: true, repack: 0 }, ok = { holding: true, still: true, onGround: true, open: false };
  A(chuteLabel({ used: false, repack: 0 }) === 'packed' && chuteLabel(st) === 'unpacked', 'labels: ' + chuteLabel(st));
  for (const [what, o] of [['without holding E', { holding: false }], ['on the move', { still: false }], ['in the air', { onGround: false }], ['while open', { open: true }]]) {
    const s2 = { used: true, repack: 0 };
    for (let i = 0; i < 60 * 30; i++) repackChute(s2, Object.assign({}, ok, o), 1 / 60);
    A(s2.used && !s2.repack, 'repacked ' + what);
  }
  A(CHUTE.repack >= 8 && CHUTE.repack <= 20, 'repacking takes ' + CHUTE.repack + ' s');
  let res = null, t = 0;
  for (; t < CHUTE.repack / 2; t += 1 / 60) res = repackChute(st, ok, 1 / 60);
  A(res === 'packing' && st.used && /repacking, 4\d%|repacking, 50%/.test(chuteLabel(st)), 'half way: ' + res + ' ' + chuteLabel(st));
  // let go, walk off, come back: what was done is kept
  repackChute(st, Object.assign({}, ok, { holding: false }), 5);
  for (; t < CHUTE.repack + 0.1 && res !== 'repacked'; t += 1 / 60) res = repackChute(st, ok, 1 / 60);
  A(res === 'repacked' && !st.used && chuteLabel(st) === 'packed', 'never repacked: ' + res);
  // falling with it unpacked: told so, and how to fix it
  const g = L.gantry, p = new Player(L.world);
  p.pos = [g.pos[0], g.pos[1] + 0.1, g.pos[2] - 1.5]; p.settle(); p.parachute = false; p.chuteRepacking = true; p.yaw = Math.PI;
  let told = false;
  for (let i = 0; i < 60 * 3; i++) { p.step(1 / 60, { moveX: 0, moveZ: 1, yaw: Math.PI, pitch: 0, jumpPressed: false }); if (/not packed.*hold E/.test(p.prompt || '')) told = true; }
  A(told, 'falling without a packed parachute: nothing said');
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/repackChute\(S\.chute, \{ holding, still, onGround: player\.onGround, open: player\.chute \}/.test(main) && /chuteLabel\(S\.chute\)/.test(main), 'the game does not repack it by hand, or YOUR GEAR does not say how it stands');
});

console.log('\n-- M6.17.4 --');
T('repacking takes a hold that began with a press: a key stuck down does not do it, nor does coming back from the pause menu', () => {
  // E already down (never seen let go) when repacking comes on offer: no
  let g = {};
  packGrip(g, true, false);
  for (let i = 0; i < 30; i++) A(!packGrip(g, true, true), 'a stuck key held it');
  // let go, press again: yes - until it is let go, or the offer goes
  A(!packGrip(g, false, true) && packGrip(g, true, true) && packGrip(g, true, true), 'a fresh press did not hold');
  A(!packGrip(g, false, true), 'still held after letting go');
  g = {}; packGrip(g, false, true); packGrip(g, true, true);
  A(!packGrip(g, true, false) && !packGrip(g, true, true), 'held on after walking away from the offer');
  // through the whole repack: only the frames actually held count
  const st = { used: true, repack: 0 }, ok = { still: true, onGround: true, open: false };
  g = { was: true };                  // E down before the offer came, never seen let go
  let res = null;
  for (let i = 0; i < 60 * (CHUTE.repack + 2) && res !== 'repacked'; i++) res = repackChute(st, Object.assign({ holding: packGrip(g, true, true) }, ok), 1 / 60);
  A(st.used && !st.repack, 'held "from before" and it repacked: ' + st.repack);
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/const holding = packGrip\(S\.packGrip, input\.held\('interact'\)/.test(main) && /S\.playing && !S\.menu && !openCrate\);/.test(main), 'the game does not use the press-started hold, or repacks in a menu');
  A(/function deploy\(\) \{[\s\S]{0,400}if \(!S\.startedOnce\) S\.chute = /.test(main), 'Resume still hands you a fresh parachute');
  A(/S\.frameDt = dt;/.test(main), 'repacking is not on the real clock');
  const inp = readFileSync(new URL('../src/game/input.js', import.meta.url), 'utf8');
  A(/visibilitychange[\s\S]{0,80}this\.down\.clear\(\)/.test(inp), 'keys are not let go when the page is hidden');
});

console.log('\n-- M6.17.5 --');
T('down the spiral stairs: from the floor above to the foot, walking or running, close in or out by the rail - never lifted, never stuck, never on the handrail', () => {
  for (const s of L.stairs) for (const sprint of [false, true]) for (const r of [0.6, 0.75, 0.9]) {
    const p = new Player(L.world);
    p.pos = [s.top[0], s.y1 + 0.1, s.top[2]]; p.vel = [0, 0, 0]; p.settle();
    let onto = false, phase = 0, rose = 0, onRail = 0, i = 0;
    for (; i < 60 * 15 && p.pos[1] > s.y0 + 0.02; i++) {
      const th = Math.atan2(p.pos[2] - s.cz, p.pos[0] - s.cx), d = Math.hypot(p.pos[0] - s.cx, p.pos[2] - s.cz);
      let tx, tz;
      if (phase === 0) { const a = s.aEnd + 0.4; tx = s.cx + Math.cos(a) * r; tz = s.cz + Math.sin(a) * r; if (d < r + 0.25) phase = 1; }
      else { tx = s.cx + Math.cos(th - 0.9) * r; tz = s.cz + Math.sin(th - 0.9) * r; }
      const y0 = p.pos[1];
      step(p, { moveZ: 1, sprint, yaw: yawTo(p, tx, tz) }, 1);
      if (phase === 1 && p.pos[1] > y0 + 0.25) rose++;
      const under = L.world.hits([p.pos[0] - 0.1, p.pos[1] - 0.06, p.pos[2] - 0.1], [p.pos[0] + 0.1, p.pos[1] + 0.01, p.pos[2] + 0.1]);
      if (p.onGround && under.length && under.every((q) => q.tag === 'rail')) onRail++;
    }
    const tag = s.id + (sprint ? ' running' : ' walking') + ' at ' + r;
    A(p.pos[1] <= s.y0 + 0.05, tag + ': stuck at y ' + p.pos[1].toFixed(2));
    A(i / 60 < 6, tag + ': took ' + (i / 60).toFixed(1) + ' s');
    A(!onRail, tag + ': stood on the handrail');
    A(rose === 0, tag + ': lifted onto a higher tread ' + rose + ' times');
  }
  // nobody walks through the post: a guard round it, all the way up
  for (const st of L.stairs) for (const y of [st.y0 + 0.5, (st.y0 + st.y1) / 2, st.y1 - 0.3]) {
    A(L.world.hits([st.cx - 0.15, y, st.cz - 0.15], [st.cx + 0.15, y + 0.2, st.cz + 0.15]).some((q) => q.tag === 'stairpost' && q.max[0] - q.min[0] >= 0.4), st.id + ': you could walk through the post at y ' + y.toFixed(1));
  }
  // the rail is never stepped up onto
  const s = L.stairs[0], P = s.plan, i = 9, a = P.a0 + P.per * (i + 0.5), yt = s.y0 + P.h * (i + 1);
  A(L.world.hits([s.cx + Math.cos(a) * 1.0 - 0.05, yt, s.cz + Math.sin(a) * 1.0 - 0.05], [s.cx + Math.cos(a) * 1.0 + 0.05, yt + 1.7, s.cz + Math.sin(a) * 1.0 + 0.05]).every((q) => q.tag !== 'stairpost'), 'the post guard reaches out over the treads');
  const pl = readFileSync(new URL('../src/sim/player.js', import.meta.url), 'utf8');
  A(/!hits\.some\(\(s\) => s\.person \|\| s\.tag === 'rail'\)/.test(pl), 'a rail can still be stepped up onto');
});
T('the guard by the bar: his post out in the room, clear of the stools; the patrol\'s corner not on top of him; nobody posted inside anything', () => {
  const C6 = L.guards.find((g) => g.id === 'C6'), C8 = L.guards.find((g) => g.id === 'C8');
  const stools = L.world.solids.filter((q) => q.tag === 'chair' && Math.abs(q.min[1] - C_FLOORS[1]) < 0.1);
  const nearest = Math.min(...stools.map((q) => Math.hypot(Math.max(q.min[0] - C6.pos[0], 0, C6.pos[0] - q.max[0]), Math.max(q.min[2] - C6.pos[2], 0, C6.pos[2] - q.max[2]))));
  A(nearest > 1.0, 'C6 stands ' + nearest.toFixed(2) + ' m from a stool');
  for (const [x, z] of C8.route) A(Math.hypot(x - C6.pos[0], z - C6.pos[2]) > 2.5, 'C8 walks through C6\'s post at ' + [x, z]);
  // every post and route point: room for a man
  for (const g of L.guards) for (const [x, z] of [[g.home.pos[0], g.home.pos[2]]].concat(g.route || [])) {
    A(!L.world.hits([x - 0.3, g.pos[1] + 0.2, z - 0.3], [x + 0.3, g.pos[1] + 1.6, z + 0.3]).some((q) => !q.person && !q.target && q !== g.target.solid), g.id + ': a point inside something at ' + [x, z]);
  }
});
T('a red who dies by a stool or a chair is left sitting in it - slumped, the seat taken; one dying in the open falls as before', () => {
  A(L.seats && L.seats.filter((q) => q.kind === 'stool').length > 20, (L.seats || []).length + ' seats');
  const st = L.seats.find((q) => q.kind === 'stool');
  const w = new World(); w.addSolid([-50, -1, -50], [50, 0, 50], 'floor');
  const g = new Guard(w, { id: 'x', pos: [st.pos[0] + 0.5, st.pos[1], st.pos[2]], faction: 'red' });
  const seats = [Object.assign({}, st)];
  g.target.hp = 0; g.target.down = true; g.target.lethalHit = true;
  g.step(1 / 60, { world: w, seats, guards: [g] });
  A(g.dead && g.seat === seats[0] && seats[0].taken, 'not seated');
  // (M6.17.6, Rhys: not a jump to the chair) he goes there over a moment: at first still where he stood, staggering
  A(Math.hypot(g.pos[0] - (st.pos[0] + 0.5), g.pos[2] - st.pos[2]) < 0.05 && pickClip(g.animState()).clip === 'Hit_Knockback', 'he jumped straight into the seat');
  let maxStep = 0;
  for (let i = 0; i < 60; i++) { const before = g.pos.slice(); g.step(1 / 60, { world: w, seats, guards: [g] }); maxStep = Math.max(maxStep, Math.hypot(g.pos[0] - before[0], g.pos[1] - before[1], g.pos[2] - before[2])); }
  A(maxStep < 0.06, 'he moved ' + maxStep.toFixed(2) + ' m in one frame');
  A(Math.abs(g.pos[1] - (st.top - SEAT.hips)) < 1e-6 && Math.abs(g.yaw - st.yaw) < 1e-6, 'not placed on the seat: ' + g.pos.map((v) => v.toFixed(2)));
  const hips = [g.pos[0] + Math.sin(g.yaw) * SEAT.feet, g.pos[2] + Math.cos(g.yaw) * SEAT.feet];
  A(Math.hypot(hips[0] - st.pos[0], hips[1] - st.pos[2]) < 0.05, 'his hips are not over the seat');
  A(pickClip(g.animState()).clip === 'Driving_Loop' && pickClip(g.animState()).speed === 0, 'not in the seated pose');
  // a second man by the same stool: it is taken
  const g2 = new Guard(w, { id: 'y', pos: [st.pos[0] - 0.5, st.pos[1], st.pos[2]], faction: 'red' });
  g2.target.hp = 0; g2.target.down = true; g2.step(1 / 60, { world: w, seats, guards: [g2] });
  A(!g2.seat, 'two men in one seat');
  // far from any seat: the fall
  const g3 = new Guard(w, { id: 'z', pos: [40, 0, 40], faction: 'red' });
  g3.target.hp = 0; g3.target.down = true; g3.step(1 / 60, { world: w, seats, guards: [g3] });
  A(!g3.seat && pickClip(g3.animState()).clip === 'Death01', 'fell into a seat from afar');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/seats: level\.seats \|\| null/.test(rt), 'the mission does not hand the guards the seats');
});
T('the Yellows: the boss and two bodyguards in the Businessman\'s Suite - not counted as reds, not against you; the reds against you both', () => {
  const Y = L.guards.filter((g) => g.faction === 'yellow');
  A(Y.length === 3 && Y.filter((g) => g.boss).length === 1, Y.length + ' yellows');
  const zone = L.zones.businessman_s_booth;
  for (const y of Y) {
    A(y.pos[0] >= zone[0][0] && y.pos[0] <= zone[1][0] && y.pos[2] >= zone[0][2] && y.pos[2] <= zone[1][2] && Math.abs(y.pos[1]) < 0.1, y.id + ' is not in the suite');
    A(y.objective === false, y.id + ' counts towards clearing the casino');
  }
  A(Y.find((g) => g.boss).armsName === 'revolver' && ARMS.revolver.item === 'RV357' && Y.filter((g) => !g.boss).every((g) => g.armsName === 'smg'), 'their weapons');
  const R = L.relations, red = L.guards.find((g) => g.faction === 'red'), boss = Y.find((g) => g.boss);
  A(hostileToYou(red, R) && !hostileToYou(boss, R) && hostileTo(red, boss, R) && hostileTo(boss, red, R) && !hostileTo(boss, Y[1], R), 'relations');
  A(!hostileTo(red, L.guards.find((g) => g !== red && g.faction === 'red'), R), 'reds against reds');
  // a level with no relations: everyone against you only, as ever
  A(hostileToYou(boss, null) && !hostileTo(red, boss, null), 'no relations should mean the old way');
  // the casino's rules count the reds only
  const o = RULES.casino.outcome({ guards: L.guards.filter((g) => g.objective !== false), ledger: false, yellows: Y });
  A(o.total === CASINO_REDS, o.total + ' to clear');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/const targets = level\.guards\.filter\(\(g\) => g\.objective !== false\)/.test(rt) && /guards: targets/.test(rt), 'the mission counts the Yellows');
});
T('who each goes for: a calm Yellow - no one, until a red is in sight; a red - a Yellow he can see, or you; a Yellow hurt by an unseen red goes for him', () => {
  const w = new World(); w.addSolid([-60, -1, -60], [60, 0, 60], 'floor');
  const R = L.relations;
  const red = new Guard(w, { id: 'r', pos: [0, 0, 0], yaw: 0, faction: 'red' });
  const yel = new Guard(w, { id: 'y', pos: [0, 0, -8], yaw: Math.PI, faction: 'yellow' });
  const gs = [red, yel], ctx = { world: w };
  const you = { pos: [0, 0, 6], eye: [0, 1.6, 6], chest: [0, 1, 6], stance: 0, speed: 0, noise: 0, box: [[-0.3, 0, 5.7], [0.3, 1.8, 6.3]] };
  // the red faces the Yellow (north); you are behind him, further off
  const f = pickFoe(red, you, gs, R, ctx, 0.5);
  A(f && f.guard === yel, 'the red does not go for the Yellow in front of him');
  // the Yellow: the red in front of him
  const fy = pickFoe(yel, you, gs, R, ctx, 0.5);
  A(fy && fy.guard === red, 'the Yellow does not go for the red');
  // no red about: the Yellow goes for no one - not you
  red.dead = true; yel.foeT = 0;
  A(pickFoe(yel, you, gs, R, ctx, 0.5) === null, 'a calm Yellow goes for you');
  // provoked, he does
  yel.provoked = true; yel.foeT = 0;
  A(pickFoe(yel, you, gs, R, ctx, 0.5) === you, 'a provoked Yellow ignores you');
  // a red behind him, unseen, who shot him: he turns on that red
  const red2 = new Guard(w, { id: 'r2', pos: [0, 0, -14], faction: 'red' });
  const y2 = new Guard(w, { id: 'y2', pos: [0, 0, -10], yaw: Math.PI, faction: 'yellow' });
  y2.hurtBy = red2;
  const fz = pickFoe(y2, you, [red2, y2], R, ctx, 0.5);
  A(fz && fz.guard === red2, 'hurt from behind, he does not go for the red who hurt him');
  // the red's shot at the Yellow is marked as his, for the game to hurt the Yellow, not you
  const red3 = new Guard(w, { id: 'r3', pos: [0, 0, 0], yaw: 0, faction: 'red' });
  const y3 = new Guard(w, { id: 'y3', pos: [0, 0, -6], yaw: Math.PI, faction: 'yellow' });
  const c3 = { world: w, guards: [red3, y3], noises: [], random: () => 0.1 };
  let shotAt = null;
  for (let i = 0; i < 60 * 6 && !shotAt; i++) {
    const foe = pickFoe(red3, null, [red3, y3], R, c3, 1 / 60);
    red3.step(1 / 60, Object.assign({}, c3, { you: foe }));
    for (const ev of red3.events) if (ev.type === 'shot') shotAt = ev.at;
    red3.events.length = 0;
  }
  A(shotAt === y3, 'the red never fired at the Yellow');
});
T('how the Yellows take it: a stray round in a fire-fight forgiven (twice); a round with no reds about, a kill or a gun held on them is not; a knock-out forgiven', () => {
  let s = new Standing();
  A(s.shot(false, true, 0) === 'forgiven' && s.shot(false, true, 5) === 'forgiven' && s.shot(false, true, 9) === 'hostile', 'strays');
  s = new Standing(); A(s.shot(false, true, 0) === 'forgiven' && s.shot(false, true, STANDING.strayWindow + 5) === 'forgiven' && !s.hostile, 'old strays should be forgotten');
  s = new Standing(); A(s.shot(false, false, 0) === 'hostile', 'a round with no reds about');
  s = new Standing(); A(s.shot(true, true, 0) === 'hostile' && s.why === 'killed', 'a kill');
  s = new Standing(); A(s.takenDown(false) === 'forgiven' && !s.hostile && s.takenDown(true) === 'hostile', 'takedowns');
  s = new Standing(); let warned = 0, res = null;
  for (let t = 0; t < STANDING.aimHostile + 0.5 && res !== 'hostile'; t += 0.1) { res = s.aim(0.1, true); if (res === 'warn') warned++; }
  A(warned === 1 && s.hostile && s.why === 'aimed', 'a gun held on them: ' + warned + ' warnings, ' + s.state);
  s = new Standing(); for (let t = 0; t < 1.5; t += 0.1) s.aim(0.1, true); for (let t = 0; t < 5; t += 0.1) s.aim(0.1, false);
  A(s.aimT === 0 && !s.hostile, 'lowering the gun did not ease it');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/if \(g && g\.faction === 'yellow'\) yellowHit\(g\);/.test(rt) && /standing\.takenDown\(lethal\)/.test(rt) && /standing\.aim\(simDt/.test(rt), 'the mission does not ask how they take it');
});
T('talking to the Yellows: E beside one at peace; the boss tells of the ledger in the Cash Vault, and knows when you have it', () => {
  A(YELLOW_TALK.boss.length >= 3 && YELLOW_TALK.boss.some((l) => /ledger/i.test(l) && /vault/i.test(YELLOW_TALK.boss.join(' '))) && YELLOW_TALK.bossLedger && YELLOW_TALK.guard.length >= 3, 'lines');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/'E  Talk to ' \+ \(yn\.boss/.test(rt) && /const yn = yellowNear\(\); if \(yn\) \{ talkTo\(yn\); return true; \}/.test(rt), 'no talking');
});
T('the reds\' ledger: on the Cash Vault\'s counting table, taken with E, and in the debrief', () => {
  A(L.ledger && !L.ledger.taken, 'no ledger');
  const z = L.zones.cash_vault, p = L.ledger.pos;
  A(p[0] >= z[0][0] - 0.5 && p[0] <= z[1][0] + 0.5 && p[2] >= z[0][2] - 0.5 && p[2] <= z[1][2] + 0.5 && Math.abs(p[1] - C_FLOORS[2] - 0.8) < 0.1, 'not on the table in the vault: ' + p.map((v) => v.toFixed(2)));
  const lines = (ledger) => RULES.casino.lines(RULES.casino.outcome({ guards: [], ledger, yellows: [] }));
  A(lines(true).some((l) => l.ok && /ledger/.test(l.text)) && lines(false).some((l) => !l.ok && /ledger/.test(l.text)), 'no ledger line');
  A(RULES.casino.grade(RULES.casino.outcome({ guards: [{ dead: true }], ledger: false })) === 'partial' && RULES.casino.grade(RULES.casino.outcome({ guards: [{ dead: false }], ledger: true })) === 'success', 'the ledger is not the mission');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/'E  Take the ledger'/.test(rt) && /level\.ledger\.taken = true; m\.ledger = true;/.test(rt), 'the ledger cannot be taken');
});

console.log('\n-- M6.17.6 --');
T('the Yellows\' errand: a word with them and they follow where you walk; in sight of the locket the boss takes it; then out by the way out, and gone', () => {
  const w = new World(); w.addSolid([-60, -1, -60], [60, 0, 60], 'floor');
  const mk = (id, pos, boss) => { const g = new Guard(w, { id, pos, faction: 'yellow' }); g.boss = !!boss; return g; };
  const ys = [mk('b', [0, 0, 0], true), mk('g1', [1, 0, 1]), mk('g2', [-1, 0, 1])];
  const locket = { pos: [0, 0.5, -30], taken: false }, exit = [20, 0, 10];
  const job = new YellowJob(ys, locket, exit);
  A(job.start() && ys.every((y) => y.escort && y.escort.lead && y.escort.way === job.way), 'they did not fall in with you');
  A(!job.start(), 'the errand began twice');
  A(ys[0].escort.lag > ys[1].escort.lag && ys[0].escort.lag > ys[2].escort.lag, 'the boss is not the one hanging back');
  // you walk north 20 m at a walk (4.3 m/s); they keep with you, his men in front of him
  const you = [0, 0, 2], ctx = { world: w, guards: ys, noises: [], lead: you };
  for (let i = 0; i < 60 * 8; i++) {
    if (you[2] > -18) you[2] -= 4.3 / 60;
    for (const y of ys) y.step(1 / 60, Object.assign({}, ctx, { you: null, blockers: [[[you[0] - 0.3, 0, you[2] - 0.3], [you[0] + 0.3, 1.8, you[2] + 0.3]]] }));
    job.tick(() => false, () => null);
  }
  const d = ys.map((y) => Math.hypot(y.pos[0] - you[0], y.pos[2] - you[2]));
  A(d.every((x) => x < 6.5) && d[0] > d[1] && d[0] > d[2] && d[1] > 1.5, 'not keeping with you: ' + d.map((x) => x.toFixed(1)));
  A(job.stage === 'escort', 'stage ' + job.stage);
  // nearer the locket, in sight of it: the boss goes for it, takes it, and they leave
  you[2] = -26;
  let took = null, gone = false;
  for (let i = 0; i < 60 * 40 && !gone; i++) {
    for (const y of ys) y.step(1 / 60, Object.assign({}, ctx, { you: null }));
    for (const e of job.tick(() => true, (a, b) => [[a[0], 0, a[2] + 5], b])) { if (e.type === 'locket') took = e.by; if (e.type === 'gone') gone = true; }
  }
  A(took === ys[0] && locket.taken, 'the boss did not take the locket');
  A(gone && job.stage === 'gone' && ys.every((y) => y.away && y.hidden && y.target.solid.disabled) && job.left === 3, 'they did not leave: ' + job.stage + ' ' + ys.map((y) => !!y.away));
  // turned against you on the way: the errand is off
  const ys2 = [mk('b2', [0, 0, 0], true)], j2 = new YellowJob(ys2, { pos: [0, 0, -9], taken: false }, exit);
  j2.start([0, 0, 1]); j2.stop();
  A(j2.stage === 'off' && !ys2[0].escort, 'still following after turning on you');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/job\.start\(\)/.test(rt) && /ctxG\.lead = /.test(rt) && /if \(job\) job\.stop\(\);/.test(rt), 'the mission does not run the errand');
  A(L.locket && L.yellowExit && Math.abs(L.locket.pos[1] - C_FLOORS[2] - 1.11) < 0.05, 'no locket in the vault');
});
T('the ramp, for those who find their way: from the Suite up to the Cash Vault\'s floor, and from there out of the front door - along the coil, not through the wall', () => {
  const nav = new NavGrid(L.world, L.navFloors, L.navLinks);
  // (M6.17.15) the Tournament Room's doors are reinforced now: breached, for this
  for (const d of L.swingDoors) if (d.locked && !d.def.vault && d.centre[1] > C_FLOORS[2]) d.unlock();
  for (const d of L.swingDoors) if (!d.locked) d.set(true, d.def.swingTo || 1);
  nav.syncDoors(L.swingDoors);
  const up = nav.find([30, 0, 10.5], [30, C_FLOORS[2], 9]);
  A(up && up.length > 10, 'no way up to floor 2');
  // every leg between two points of the way: short, or along the ramp's band
  for (let i = 1; i < up.length; i++) {
    const a = up[i - 1], b = up[i];
    if (Math.abs(a[1] - b[1]) < 0.01) continue;
    A(Math.hypot(b[0] - a[0], b[2] - a[2]) < 3.2, 'a leg up of ' + Math.hypot(b[0] - a[0], b[2] - a[2]).toFixed(1) + ' m - straight through the wall?');
    const r = Math.hypot((a[0] + b[0]) / 2 - CX, (a[2] + b[2]) / 2 - CZ);
    A(r > R_MID - 0.2, 'a climb inside the middle wall at r ' + r.toFixed(1));
  }
  const out = nav.find([30, C_FLOORS[2], 9], L.yellowExit);
  A(out && Math.abs(out[out.length - 1][2] - L.yellowExit[2]) < 0.6, 'no way out of the front door');
  for (const d of L.swingDoors) if (!d.locked) d.set(false, 1);
});
T('the Yellows speak as Yellows - no reds\' lines (no "Target engaged") - and a red who sees them calls them Yellows; their name in gold', () => {
  const said = [];
  const y = new Guard(new World(), { id: 'y', pos: [0, 0, 0], faction: 'yellow' });
  const ctxY = { bark: (g, text, key) => said.push([text, key]), yellowLines: true };
  for (const k of ['alert', 'hit', 'reload', 'search', 'suspicious', 'nothing', 'manDown']) y.say(ctxY, k);
  A(said.length && said.every(([t, k]) => /^y_/.test(k) && Object.values(YELLOW_LINES).flat().includes(t)), 'a Yellow spoke a red\'s line: ' + JSON.stringify(said));
  A(!said.some(([, k]) => /search|suspicious|nothing/.test(k)), 'a Yellow spoke for a red\'s key');
  // a level whose Yellows are the enemy (the factory): as before
  const f = []; y.say({ bark: (g, t, k) => f.push(k) }, 'alert'); A(f[0] === 'alert', 'the factory\'s Yellows changed');
  const r = new Guard(new World(), { id: 'r', pos: [0, 0, 0], faction: 'red' }), rs = [];
  r.say({ bark: (g, t, k) => rs.push([t, k]), you: { guard: y } }, 'alert');
  A(rs[0][1] === 'alertRival' && LINES.alertRival.includes(rs[0][0]), 'the red called the Yellows intruders');
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8'), rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/#bark span\.yellow \{ color: #e8b423; \}/.test(html) && /class="' \+ \(g\.faction === 'yellow' \? 'yellow' : g\.faction === 'staff' \? 'staff' : /.test(rt), 'the Yellows\' names are not gold');
});
T('words on screen when they are heard: a recording from where its sound starts; the browser\'s speech when it starts to speak', () => {
  const v = readFileSync(new URL('../src/game/voice.js', import.meta.url), 'utf8'), a = readFileSync(new URL('../src/game/audio.js', import.meta.url), 'utf8');
  A(/u\.onstart = begin;/.test(v) && /setTimeout\(begin, SPEECH_WAIT \* 1000\)/.test(v), 'speech: words shown before it is said');
  A(/src\.start\(t, Math\.max\(0, \(\(this\.leads && this\.leads\[name\]\) \|\| 0\) - 0\.02\)\)/.test(a) && /this\.leads\[name\] = leadingSilence\(buf\)/.test(a), 'recordings: their silence first');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/voices\.say\(g\.id, text, key, Math\.max\(0\.15, Math\.min\(1, 1\.25 - d \/ 20\)\), \(said\) => subtitle\(g, said, 2\.8\), spokenVoice\(g, key\.startsWith\('y_'\)\)\)/.test(rt), 'barks shown before they are heard');
});

console.log('\n-- M6.17.7 --');
// a hall with a card table and a block of rooms in it, as the guards' nav sees it
const yHall = () => {
  const w = new World(); w.addSolid([-20, -1, -20], [20, 0, 20], 'floor');
  const table = w.addSolid([-2, 0, -3.2], [2, 0.82, -2], 'table');
  w.addSolid([-3, 0, -11], [3, 3, -5], 'wall');
  const nav = new NavGrid(w, [{ y: 0, bounds: [-20, -20, 20, 20] }], []);
  return { w, nav, table };
};
const yRun = (h, ys, you, moveYou, secs) => {
  const job = new YellowJob(ys, { pos: [0, 0.5, 50], taken: false }, [0, 0, 19]);
  job.start();
  const walked = ys.map(() => 0), into = ys.map(() => 0);
  for (let i = 0; i < 60 * secs; i++) {
    moveYou(i / 60);
    const ctx = { world: h.w, nav: h.nav, guards: ys, noises: [], lead: you, pathBudget: { left: 1 }, you: null, blockers: [[[you[0] - 0.3, 0, you[2] - 0.3], [you[0] + 0.3, 1.8, you[2] + 0.3]]] };
    ys.forEach((y, k) => {
      const p0 = y.pos.slice(); y.step(1 / 60, ctx); walked[k] += Math.hypot(y.pos[0] - p0[0], y.pos[2] - p0[2]);
      const t = h.table; if (y.pos[0] > t.min[0] && y.pos[0] < t.max[0] && y.pos[2] > t.min[2] && y.pos[2] < t.max[2]) into[k]++;
    });
  }
  return { walked, into };
};
T('the Yellows round the card table, not over it (Rhys: "Yellow Boss walked straight through the large poker table")', () => {
  const h = yHall(), y = new Guard(h.w, { id: 'b', pos: [0, 0, 0], faction: 'yellow' }); y.boss = true;
  const you = [0.3, 0, -7];
  const r = yRun(h, [y], you, () => {}, 8);
  A(r.into[0] === 0, 'walked through the table (' + r.into[0] + ' frames inside it)');
  A(Math.hypot(y.pos[0] - you[0], y.pos[2] - you[2]) < 6, 'never came round to you: ' + y.pos.map((v) => v.toFixed(1)));
});
T('the Yellows do not walk your circuit after you: you go round the block and come back, they cut across to you', () => {
  const h = yHall(), y = new Guard(h.w, { id: 'g', pos: [0, 0, 0], faction: 'yellow' });
  // you: west, up the far side of the block, back the way you came
  const legs = [[-5, -1.5], [-5, -14], [-5, -1.5], [1, -1.5]], you = [0, 0, -1.5];
  let leg = 0, youWalk = 0;
  const r = yRun(h, [y], you, () => {
    if (leg >= legs.length) return;
    const [tx, tz] = legs[leg], dx = tx - you[0], dz = tz - you[2], d = Math.hypot(dx, dz), st = Math.min(d, 4.3 / 60);
    if (d < 1e-3) { leg++; return; }
    you[0] += dx / d * st; you[2] += dz / d * st; youWalk += st;
  }, 16);
  A(Math.hypot(y.pos[0] - you[0], y.pos[2] - you[2]) < 4, 'not back with you: ' + y.pos.map((v) => v.toFixed(1)));
  A(r.walked[0] < youWalk * 0.85, 'walked the whole circuit after you: ' + r.walked[0].toFixed(1) + ' m of your ' + youWalk.toFixed(1));
});
T('the Yellows keep your pace: they run to catch up, and never fall back a whole room behind', () => {
  const h = yHall(), y = new Guard(h.w, { id: 'g', pos: [8, 0, 18], faction: 'yellow' });
  const you = [8, 0, 16];
  let far = 0;
  yRun(h, [y], you, (t) => { if (you[0] > -15) you[0] -= 4.3 / 60; far = Math.max(far, Math.hypot(y.pos[0] - you[0], y.pos[2] - you[2])); }, 8);
  A(far < 9, 'fell ' + far.toFixed(1) + ' m behind');
  const src = readFileSync(new URL('../src/sim/guard.js', import.meta.url), 'utf8');
  A(!/followTrail/.test(src), 'still replaying your steps');
});
T('"Lead on" is not said (a word a voice reads two ways); the locket shows: big enough to see, and it glints', () => {
  A(!/\blead on\b/i.test(JSON.stringify(YELLOW_TALK)), 'still "Lead on"');
  const fit = readFileSync(new URL('../src/game/casino_fit.js', import.meta.url), 'utf8');
  A(/locketGlint/.test(fit), 'no glint on the locket');
  A(L.locket && L.locket.size >= 0.06, 'the locket is too small to see: ' + (L.locket && L.locket.size));
  // its plinth stands clear of everything else in the vault, inside the vault
  const k = L.locket.pos, z = L.zones.cash_vault;
  A(k[0] >= z[0][0] && k[0] <= z[1][0] && k[2] >= z[0][2] && k[2] <= z[1][2], 'the locket is not in the vault: ' + k.map((v) => v.toFixed(2)));
  const fl = C_FLOORS[2], mine = (q) => Math.abs(q.min[0] - (k[0] - 0.18)) < 1e-6 && Math.abs(q.min[2] - (k[2] - 0.18)) < 1e-6;
  const hits = L.world.solids.filter((q) => !mine(q) && q.max[1] > fl + 0.1 && q.min[1] < fl + 1.0 && q.max[0] > k[0] - 0.25 && q.min[0] < k[0] + 0.25 && q.max[2] > k[2] - 0.25 && q.min[2] < k[2] + 0.25);
  A(!hits.length, 'the plinth stands in ' + hits.map((q) => q.tag).join(', '));
  A(L.lights.some((l) => Math.hypot(l.pos[0] - k[0], l.pos[2] - k[2]) < 0.1 && l.pos[1] > k[1]), 'no lamp over the locket');
  // and the gold trolley beside it, out in the room - not set down inside the shelving
  const inZ = (q) => q.min[0] > z[0][0] - 1 && q.max[0] < z[1][0] + 1 && q.min[2] > z[0][2] - 1 && q.max[2] < z[1][2] + 1;
  const trolley = L.world.solids.find((q) => q.tag === 'table' && Math.abs(q.min[1] - fl) < 0.01 && Math.abs(q.max[1] - fl - 0.45) < 0.01 && inZ(q));
  A(trolley, 'no gold trolley');
  const inIt = L.world.solids.filter((q) => q !== trolley && q.tag !== 'floor' && q.max[1] > fl + 0.1 && q.min[1] < fl + 0.45 && q.max[0] > trolley.min[0] + 0.05 && q.min[0] < trolley.max[0] - 0.05 && q.max[2] > trolley.min[2] + 0.05 && q.min[2] < trolley.max[2] - 0.05);
  A(!inIt.length, 'the trolley stands in ' + inIt.map((q) => q.tag).join(', '));
});
T('the debrief: a Yellow the reds killed is not counted against you (Rhys\'s screenshot: "1 of 3 down (1 killed)", the boss shot by reds)', () => {
  const y = (dead, by, extra) => Object.assign({ dead, target: { lastBy: by } }, extra || {});
  const reds = { lastBy: null };
  const o = RULES.casino.outcome({ guards: [], ledger: true, locket: true, yellows: [y(true, reds), y(false, null, { away: true }), y(false, null, { away: true })] });
  A(o.yellows.down === 0 && o.yellows.lost === 1, JSON.stringify(o.yellows));
  const ls = RULES.casino.lines(o);
  A(!ls.some((l) => !l.ok && /Yellow/.test(l.text)), 'still a cross against you: ' + ls.map((l) => l.text).join(' | '));
  A(ls.some((l) => l.neutral && /killed by the reds/.test(l.text)), 'not told the reds killed him');
  const mine = RULES.casino.outcome({ guards: [], yellows: [y(true, 'you'), y(false, null)] });
  A(mine.yellows.down === 1 && RULES.casino.lines(mine).some((l) => !l.ok && /by your hand/.test(l.text)), 'yours not counted');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/l\.neutral \?/.test(rt), 'the debrief does not show a neutral line');
});
T('people across a dark room are not black cut-outs: on a night level their ambient is lifted to a daylight level\'s (Rhys\'s screenshots)', () => {
  A(fillFor([0.40, 0.43, 0.50]) === 1, 'daylight changed: ' + fillFor([0.40, 0.43, 0.50]));
  const k = fillFor([0.15, 0.16, 0.22]), lum = 0.2126 * 0.15 + 0.7152 * 0.16 + 0.0722 * 0.22;
  A(k > 2 && Math.abs(k * lum - FILL.target) < 0.01, 'night fill ' + k);
  A(fillFor([0, 0, 0]) === FILL.most, 'no ceiling in the dark');
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8'), ch = readFileSync(new URL('../src/game/character.js', import.meta.url), 'utf8');
  A(/characterFill\(pc, \[a\.r, a\.g, a\.b\]\)/.test(main) && /rc\.meshInstances\) fill\(pc, mi\.material\)/.test(ch), 'not applied to the people');
});
console.log('\n-- M6.17.9 --');
// the real casino, the Yellows following you: a fresh building, every door open
const yCasino = () => {
  const C = buildCasino();
  for (const d of C.swingDoors) { if (d.locked) d.unlock(); d.set(true, d.def.swingTo || 1); }
  const nav = new NavGrid(C.world, C.navFloors, C.navLinks); nav.syncDoors(C.swingDoors);
  const ys = C.guards.filter((g) => g.faction === 'yellow');
  return { C, nav, ys };
};
// you walk a found way at walking pace; each frame, they step; watch(t, ys, you) sees it all
const yWalk = (h, you, legs, secs, job, watch) => {
  let leg = 0, route = h.nav.find(you, legs[0]), ri = 0, wait = 0, t = 0;
  const dt = 1 / 30;
  for (let i = 0; i < secs * 30; i++) {
    t += dt;
    if (route && ri < route.length) { const q = route[ri], d = [q[0] - you[0], q[1] - you[1], q[2] - you[2]], l = Math.hypot(...d); if (l < 1e-3) ri++; else { const st = Math.min(l, 4.3 * dt); for (let k = 0; k < 3; k++) you[k] += d[k] / l * st; } }
    else if (leg + 1 < legs.length) { wait += dt; if (wait > 6) { wait = 0; leg++; route = h.nav.find(you, legs[leg]); ri = 0; } }
    const ctx = { world: h.C.world, nav: h.nav, guards: h.C.guards, doors: h.C.swingDoors, noises: [], lead: you, pathBudget: { left: 1 }, you: null, blockers: [[[you[0] - 0.3, you[1], you[2] - 0.3], [you[0] + 0.3, you[1] + 1.8, you[2] + 0.3]]] };
    const was = h.ys.map((y) => y.pos.slice());
    for (const y of h.ys) y.step(dt, ctx);
    const ev = job ? job.tick((y) => Math.hypot(y.pos[0] - h.C.locket.pos[0], y.pos[2] - h.C.locket.pos[2]) < 6 && Math.abs(y.pos[1] - h.C.locket.pos[1]) < 1.5, (a, b) => h.nav.find(a, b)) : [];
    watch(t, h.ys, you, was, ev, route && ri >= route.length && leg + 1 >= legs.length);
  }
};
// a step that went through something solid (a wall, a floor): a ray from where he was to where he is
const throughSolid = (C, a, b) => {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...d);
  if (l < 1e-4) return null;
  const hit = C.world.raycast([a[0], a[1] + 0.9, a[2]], d.map((v) => v / l), l, (s) => s.person || s.target || s.tag === 'hdoor');
  return hit && hit.solid;
};
T('the Yellows\' errand in the casino itself: up the coil with you to the Cash Vault - never outside, never through a wall or a floor, keeping up - the locket, then down the coil and out of the front door (Rhys: "they ran outside", "trying to get in THROUGH the wall", "glorched through the floor")', () => {
  const h = yCasino(), job = new YellowJob(h.ys, h.C.locket, h.C.yellowExit);
  job.start();
  const you = [30, 0, 13.5], goal = [h.C.locket.pos[0], C_FLOORS[2], h.C.locket.pos[2] + 1.0];
  const bad = [], gaps = [];
  let stage = 'escort', took = false, gone = false, arrivedT = null, nearAfter = null;
  yWalk(h, you, [goal], 260, job, (t, ys, y0, was, ev, arrived) => {
    for (const e of ev) { if (e.type === 'locket') took = true; if (e.type === 'gone') gone = true; }
    if (arrived && arrivedT === null) arrivedT = t;
    ys.forEach((y, k) => {
      if (y.away) return;
      const r = Math.hypot(y.pos[0] - CX, y.pos[2] - CZ);
      // outside the building only on the way out, on the ground, by the front
      if (r > R_OUT + 0.2 && !(job.stage === 'leaving' && y.pos[1] < 0.3)) bad.push(y.id + ' outside at ' + y.pos.map((v) => v.toFixed(1)) + ' (' + job.stage + ')');
      const s = throughSolid(h.C, was[k], y.pos);
      if (s) bad.push(y.id + ' through ' + s.tag + ' at ' + y.pos.map((v) => v.toFixed(1)));
    });
    if (job.stage === 'escort' && t > 45 && !arrivedT) gaps.push(Math.max(...ys.map((y) => Math.hypot(y.pos[0] - y0[0], y.pos[1] - y0[1], y.pos[2] - y0[2]))));
    if (arrivedT && t > arrivedT + 12 && nearAfter === null) nearAfter = took;
  });
  A(!bad.length, bad.slice(0, 4).join('; '));
  gaps.sort((a, b) => a - b);
  A(gaps.length && gaps[Math.floor(gaps.length * 0.9)] < 12, 'falling behind on the coil: 90% of the time within ' + (gaps.length ? gaps[Math.floor(gaps.length * 0.9)].toFixed(1) : '?') + ' m');
  A(took && nearAfter, 'the locket not taken soon after you got there');
  A(gone && h.ys.every((y) => y.away), 'they did not leave: ' + job.stage + ' ' + h.ys.map((y) => y.pos.map((v) => v.toFixed(1))).join(' | '));
});
T('the spiral stairs: they follow you up and back down, and end on the floor with you - not stuck at the top, not standing in the air (Rhys: "Two yellows collided at top of spiral stairs - neither seem able to descend")', () => {
  const h = yCasino(), job = new YellowJob(h.ys, { pos: [0, 50, 0], taken: false }, h.C.yellowExit);
  h.ys.forEach((y, k) => { y.pos = [33 + k, C_FLOORS[2], 24]; });
  job.start();
  const you = [33, C_FLOORS[2], 26];
  let top = null;
  yWalk(h, you, [[28.5, C_FLOORS['2A'], 33.5], [35, C_FLOORS[2], 33]], 40, null, (t, ys, y0) => {
    if (t > 9 && t < 10 && !top) top = ys.map((y) => y.pos.slice());
  });
  A(top && top.every((p) => Math.abs(p[1] - C_FLOORS['2A']) < 0.01), 'not up on the landing with you: ' + (top || []).map((p) => p[1].toFixed(2)).join(', '));
  const end = h.ys.map((y) => y.pos);
  A(end.every((p) => Math.abs(p[1] - C_FLOORS[2]) < 0.01), 'not back down on the floor: ' + end.map((p) => p[1].toFixed(2)).join(', '));
  A(end.every((p) => Math.hypot(p[0] - you[0], p[2] - you[2]) < 6), 'not with you: ' + end.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' | '));
  for (let i = 0; i < end.length; i++) for (let j = i + 1; j < end.length; j++) A(Math.hypot(end[i][0] - end[j][0], end[i][2] - end[j][2]) > 0.5, 'two of them on the one spot');
});
T('stopped half way up the coil: they stop short of you, one behind another, not on top of you or each other - and one left behind finds his own way to you, not the others\' (Rhys: two "collided"; M6.17.9: two fell a floor behind on a way found for the third)', () => {
  const h = yCasino(), job = new YellowJob(h.ys, { pos: [0, 50, 0], taken: false }, h.C.yellowExit);
  const ramp = h.C.navLinks.find((l) => l.ramp && Math.abs(l.a[1]) < 0.01);
  const v = ramp.via, at = (f) => v[Math.floor(v.length * f)];
  const you = at(0.55).slice();
  h.ys[2].pos = [26.4, 0, 11.4];                                // one of his men, still in the Suite (the last to plan)
  h.ys[0].pos = at(0.45).slice(); h.ys[1].pos = at(0.42).slice();
  job.start();
  const bad = [];
  yWalk(h, you, [at(0.7)], 50, null, (t, ys, y0, was) => ys.forEach((y, k) => { const s = throughSolid(h.C, was[k], y.pos); if (s && bad.length < 3) bad.push(y.id + ' through ' + s.tag + ' at ' + y.pos.map((q) => q.toFixed(1))); }));
  A(!bad.length, bad.join('; '));
  const d = h.ys.map((y) => Math.hypot(y.pos[0] - you[0], y.pos[1] - you[1], y.pos[2] - you[2]));
  A(d.every((x) => x < 9), 'not with you on the coil: ' + d.map((x) => x.toFixed(1)).join(', '));
  A(d.every((x) => x > 1.2), 'on top of you: ' + d.map((x) => x.toFixed(1)).join(', '));
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) A(Math.hypot(h.ys[i].pos[0] - h.ys[j].pos[0], h.ys[i].pos[1] - h.ys[j].pos[1], h.ys[i].pos[2] - h.ys[j].pos[2]) > 0.5, h.ys[i].id + ' and ' + h.ys[j].id + ' on the one spot');
});
T('a way from part way up the ramp stays on the ramp: to the floor above or below, never via the street outside', () => {
  const h = yCasino();
  const ramp = h.C.navLinks.find((l) => l.ramp && Math.abs(l.a[1]) < 0.01);
  const mid = ramp.via[Math.floor(ramp.via.length * 0.6)];
  for (const to of [[30, 0, 13.5], [30, C_FLOORS[1], 12], [h.C.locket.pos[0], C_FLOORS[2], h.C.locket.pos[2] + 1]]) {
    for (const [a, b] of [[mid, to], [to, mid]]) {
      const p = h.nav.find(a, b);
      A(p && p.length > 1, 'no way between ' + a.map((v) => v.toFixed(1)) + ' and ' + b);
      for (const q of p) A(Math.hypot(q[0] - CX, q[2] - CZ) < R_OUT, 'out in the street at ' + q.map((v) => v.toFixed(1)));
      for (let i = 1; i < p.length; i++) if (Math.abs(p[i][1] - p[i - 1][1]) > 0.01) A(Math.hypot(p[i][0] - p[i - 1][0], p[i][2] - p[i - 1][2]) < 3.2, 'a leg of ' + Math.hypot(p[i][0] - p[i - 1][0], p[i][2] - p[i - 1][2]).toFixed(1) + ' m between heights - through a wall or floor');
    }
  }
});
T('"The vault is upstairs. Keep moving." is gone: where the vault is, said from where they are; and no orders', () => {
  A(!/Keep moving/.test(JSON.stringify(YELLOW_TALK)), 'still giving orders');
  A(vaultWhere(8, false) === YELLOW_TALK.vault.above && vaultWhere(0, false) === YELLOW_TALK.vault.here && vaultWhere(-7, false) === YELLOW_TALK.vault.below && vaultWhere(0, true) === YELLOW_TALK.vault.in, 'not by where they are');
  A(/up/.test(YELLOW_TALK.vault.above) && /this floor/.test(YELLOW_TALK.vault.here) && /down/.test(YELLOW_TALK.vault.below), 'the words do not say it');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/line = vaultWhere\(/.test(rt), 'the mission does not use it');
});
T('the locket is a locket, not an Oreo: an upright oval in an open case, lid up, on its chain', () => {
  const fit = readFileSync(new URL('../src/game/casino_fit.js', import.meta.url), 'utf8');
  A(!/cylinder\(kx, kz, 0\.065/.test(fit), 'still the flat gold disc');
  A(/the oval: slices/.test(fit) && /its lid up behind/.test(fit) && /its chain looped/.test(fit), 'not an upright locket in an open case');
});
console.log('\n-- M6.17.10 --');
T('a man whose foe falls says so and stands down: a Yellow "Red down", back to the escort; a red "Yellow down", back to his post - not "Lost him" and a search for a dead man (Rhys)', () => {
  const C = buildCasino();
  const nav = new NavGrid(C.world, C.navFloors, C.navLinks); nav.syncDoors(C.swingDoors);
  const y = C.guards.find((g) => g.faction === 'yellow'), r = C.guards.find((g) => g.faction === 'red');
  const said = [];
  const ctx = { world: C.world, nav, guards: C.guards, doors: C.swingDoors, noises: [], you: null, pathBudget: { left: 1 }, bark: (g, t, k) => said.push([g, t, k]), yellowLines: true, random: () => 0 };
  const rel = C.relations;
  // the Yellow, escorting, sees his red fall
  y.escort = true; y.foe = r; r.dead = true;
  pickFoe(y, null, C.guards, rel, ctx, 0.1);
  A(y.foeDown === r, 'the fallen red was not noted');
  y.state = 'alert'; y.stateT = 0; y.awareness = 1;
  y.think(1 / 30, ctx);
  const ys = said.filter((l) => l[0] === y);
  A(ys.length === 1 && ys[0][2] === 'y_down' && YELLOW_LINES.down.includes(ys[0][1]), 'the Yellow said ' + JSON.stringify(ys.map((l) => l.slice(1))));
  A(y.state === 'escort' && !y.foeDown, 'the Yellow did not go back to the escort: ' + y.state);
  for (let i = 0; i < 90; i++) y.think(1 / 30, ctx);
  A(!said.some((l) => l[0] === y && /lost|search/.test(l[2])), 'he went looking for him anyway');
  // a red sees his Yellow fall
  r.dead = false; y.dead = true; r.foe = y; said.length = 0;
  pickFoe(r, null, C.guards, rel, ctx, 0.1);
  r.state = 'alert'; r.stateT = 0; r.awareness = 1;
  r.think(1 / 30, ctx);
  const rs = said.filter((l) => l[0] === r);
  A(rs.length === 1 && rs[0][2] === 'down' && LINES.down.includes(rs[0][1]), 'the red said ' + JSON.stringify(rs.map((l) => l.slice(1))));
  A(r.state === 'return', 'the red did not go back to his post: ' + r.state);
  A(YELLOW_LINES.down.every((l) => !/lost|where/i.test(l)), 'a "down" line sounds like losing him');
});
T('the reds may take the coil after you - but none starts on it, patrols it, or wanders onto it while all is quiet (M6.17.11, Rhys: "happy for Reds to be able to follow you up/down the coil ... but I expect them to start in their positions")', () => {
  const { C, nav } = yCasino();
  const onRamp = (p) => { const o = nav.onLink(p); return o && o.l.ramp && !nav.onFloor(p); };
  const reds = C.guards.filter((g) => g.faction === 'red');
  A(reds.every((g) => g.navOpts() === null), 'the reds are still kept off the coil');
  // the way up from the ground floor is the coil: a red can come after you
  const up = nav.find([30, 0, 13.5], [C.locket.pos[0], C_FLOORS['2'], C.locket.pos[2] + 1], reds[0].navOpts());
  A(up && up.some(onRamp), 'a red has no way up');
  // where each starts, and where each patrols: on a floor, off the coil
  for (const g of reds) A(!nav.onLink(g.pos) && nav.onFloor(g.pos), g.id + ' starts on the coil at ' + g.pos);
  for (const d of casinoRedDefs()) for (const r of d.route || []) A(!nav.onLink([r[0], d.pos[1], r[1]]), d.id + ' patrols on the coil at ' + r);
  // two quiet minutes: nobody on the coil, nobody off his floor
  const start = new Map(reds.map((g) => [g, g.pos[1]])), bad = [];
  for (let i = 0; i < 120 * 30; i++) {
    const ctx = { world: C.world, nav, guards: C.guards, doors: C.swingDoors, noises: [], you: null, pathBudget: { left: 1 } };
    for (const g of reds) { g.step(1 / 30, ctx); if (onRamp(g.pos) || Math.abs(g.pos[1] - start.get(g)) > 0.5) bad.push(g.id); }
  }
  A(!bad.length, 'on the coil while all was quiet: ' + [...new Set(bad)]);
});
T('a locked double door has no slit to see through: its leaves overlap (M6.17.11, Rhys: the Yellows saw reds through the Tournament Room\'s locked doors)', () => {
  const C = buildCasino();
  const pair = C.swingDoors.filter((d) => d.locked && !d.def.vault && d.centre[1] > C_FLOORS['2']);
  A(pair.length === 2, 'the Tournament Room\'s doors');
  const c = pair[0].centre, z = c[2];
  // straight down the middle, where the officer stands
  for (const x of [29.99, 30, 30.01]) {
    const e = [x, C_FLOORS['2'] + 1.6, z + 4.5], p = [x, C_FLOORS['2'] + 1.15, z - 5.5], d = Math.hypot(p[0] - e[0], p[1] - e[1], p[2] - e[2]);
    const hit = C.world.raycast(e, [(p[0] - e[0]) / d, (p[1] - e[1]) / d, (p[2] - e[2]) / d], d, (s) => s.glass || s.person || s.shootThrough);
    A(hit && hit.solid.tag === 'hdoor', 'seen through the doors at x ' + x);
  }
  const g = new Guard(C.world, { id: 'y', pos: [30, C_FLOORS['2'], z + 4.5], yaw: 0, faction: 'yellow' });
  A(!g.canSee([30, C_FLOORS['2'] + 1.15, 15], { world: C.world }), 'a Yellow sees the officer through the shut doors');
});
T('a foe who dies a moment after going out of sight is still "down", not "lost" (M6.17.11, Rhys: "only got one instance of \'Where did they go?\' after a Red death")', () => {
  const C = buildCasino();
  const nav = new NavGrid(C.world, C.navFloors, C.navLinks);
  const y = C.guards.find((g) => g.faction === 'yellow'), r = C.guards.find((g) => g.faction === 'red');
  const said = [];
  const ctx = { world: C.world, nav, guards: C.guards, doors: C.swingDoors, noises: [], you: null, pathBudget: { left: 1 }, bark: (g, t, k) => said.push(k), yellowLines: true, random: () => 0 };
  y.foe = r; y.lastFoe = r; y.state = 'alert'; y.stateT = 0; y.awareness = 1;
  // out of sight: pickFoe lets him go as a target...
  y.foe = null;
  // ...and then he dies
  r.dead = true;
  pickFoe(y, null, C.guards, C.relations, ctx, 0.1);
  y.think(1 / 30, ctx);
  A(said.includes('y_down') && !said.includes('y_lost') && (y.state === 'return' || y.state === 'escort'), 'said ' + said + ', ' + y.state);
  // not saved up: a fallen foe noticed out of the fight is forgotten, not announced later
  const y2 = C.guards.filter((g) => g.faction === 'yellow')[1];
  y2.foeDown = r; y2.state = 'patrol'; y2.think(1 / 30, ctx);
  A(!y2.foeDown, 'kept for later');
});
T('a man is drawn while any of him is in sight, and one stepping out of the near/same-floor test stays drawn until his sight is checked (M6.17.11, Rhys: a red "became invisible for a moment")', () => {
  const w = new World();
  // a shelf hiding his head and chest from you, his legs and shoulders in view
  w.addSolid([9.8, 1.0, -1], [10.0, 1.8, 1], 'wall');
  const eye = [0, 1.4, 0];
  A(inSight(w, eye, sightPoints([12, 0, 0], eye)), 'hidden behind a shelf that hides only his head and chest');
  // the same through the drawing itself: you 3 m up (a stair), so his sight decides
  const c0 = new DrawCull(w); let v = false;
  for (let i = 0; i < 4; i++) v = c0.frame([{ pos: [12, 0, 0] }], eye, 3, 1 / 60)[0];
  A(v, 'not drawn behind the shelf');
  // he is 7 m off on your floor (drawn), then steps to 9 m and you are on a stair 3 m up
  // (twenty others on another floor keep the sight checks busy elsewhere)
  const c = new DrawCull(new World()), people = [{ pos: [0, 0, 7] }, ...Array.from({ length: 20 }, (_, i) => ({ pos: [i - 10, 10, 30] }))];
  c.frame(people, [0, 1.6, 0], 0, 1 / 60);
  people[0].pos = [0, 0, 9];
  const out = c.frame(people, [0, 4.6, 0], 3, 1 / 60);
  A(out[0], 'he vanished the moment he left the near test');
});

T('the locket and the ledger are gone once taken: each its own thing to draw, hidden when taken - the case and the table stay (Rhys)', () => {
  const C = buildCasino();
  const lk = C.pieces.filter((p) => p.prop === 'locket'), lg = C.pieces.filter((p) => p.prop === 'ledger');
  A(lk.length >= 10 && lg.length === 2, 'locket ' + lk.length + ' pieces, ledger ' + lg.length);
  const near = (list, pos, r) => list.every((p) => Math.hypot((p.min[0] + p.max[0]) / 2 - pos[0], (p.min[2] + p.max[2]) / 2 - pos[2]) < r);
  A(near(lk, C.locket.pos, 0.25) && near(lg, C.ledger.pos, 0.3), 'a tagged piece is not the locket or ledger');
  // every bit of gold by the case is the locket's (none left behind in the merged room)
  const left = C.pieces.filter((p) => !p.prop && p.mat === 'neon' && Math.hypot((p.min[0] + p.max[0]) / 2 - C.locket.pos[0], (p.min[2] + p.max[2]) / 2 - C.locket.pos[2]) < 0.2 && Math.abs(p.min[1] - C.locket.pos[1]) < 0.3);
  A(!left.length, left.length + ' pieces of the locket left behind');
  // the case stays: velvet still in the merged geometry by the locket
  A(C.pieces.some((p) => !p.prop && Math.hypot((p.min[0] + p.max[0]) / 2 - C.locket.pos[0], (p.min[2] + p.max[2]) / 2 - C.locket.pos[2]) < 0.2 && p.max[1] > C.locket.pos[1]), 'the case went with it');
  const rd = readFileSync(new URL('../src/game/render.js', import.meta.url), 'utf8'), main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/staticPieces = level\.pieces\.filter\(\(p\) => !doorTag\(p\) && !p\.prop\)/.test(rd), 'still merged into the room');
  A(/tickProps\(\) \{[^\n]*level\[name\]\.taken/.test(rd) && /view\.tickProps\(\)/.test(main), 'never hidden when taken');
});

T('the casino\'s objectives: the ledger the main task; teaming up with the Yellows optional; their locket only once teamed up; a Yellow caught in your blast counted apart (M6.17.11, Rhys)', () => {
  const R = RULES.casino, reds = (n) => Array.from({ length: 15 }, (_, i) => ({ dead: i < n }));
  const ys = (o) => [Object.assign({ dead: false }, o || {}), { dead: false }, { dead: false }];
  const o0 = R.outcome({ guards: reds(0), ledger: true, yellows: ys(), job: 'idle' });
  A(R.settled(o0) && R.grade(o0) === 'success', 'the ledger alone does not finish it');
  const lines = R.lines(o0).map((l) => l.text);
  A(/^Find the reds' ledger/.test(lines[0]) && /^Team up with the Yellows \(optional\)/.test(lines[1]) && /^Help the Yellows find their locket/.test(lines[2]) && lines.some((t) => /Reds down — 0 of 15/.test(t)), 'lines: ' + lines);
  A(R.lines(o0)[1].neutral && R.lines(o0)[2].neutral, 'not teaming up counted against you');
  // teamed up, the locket still to find: not settled until it is (or they are gone or turned)
  const o1 = R.outcome({ guards: reds(0), ledger: true, yellows: ys(), job: 'escort' });
  A(!R.settled(o1) && /locket/.test(R.undone(o1)), 'the errand did not hold the ending');
  A(R.settled(R.outcome({ guards: reds(0), ledger: true, yellows: ys(), job: 'leaving', locket: true })) && R.settled(R.outcome({ guards: reds(0), ledger: true, yellows: ys(), job: 'off' })), 'a finished errand still held it');
  const lk = R.lines(R.outcome({ guards: reds(0), ledger: true, yellows: ys(), job: 'leaving', locket: true }))[2];
  A(lk.ok && !lk.neutral && /found/.test(lk.text), 'the locket line');
  // the ledger not found: never a success, whatever else
  A(R.grade(R.outcome({ guards: reds(15), ledger: false, yellows: ys(), job: 'gone', locket: true })) === 'partial', 'a success without the ledger');
  // a Yellow caught in your blast: counted apart from those you shot
  const bl = R.outcome({ guards: reds(0), ledger: true, job: 'escort', yellows: ys({ dead: true, target: { downBy: 'blast' } }) });
  A(bl.yellows.blast === 1 && bl.yellows.down === 0 && R.lines(bl).some((l) => l.neutral && /caught in your blast/.test(l.text)) && !R.lines(bl).some((l) => /by your hand/.test(l.text)), 'the blast line: ' + JSON.stringify(bl.yellows));
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/job: job \? job\.stage : 'idle'/.test(rt) && /Find the reds\\' ledger \(the Cash Vault\)/.test(rt) && /casinoTrophies\(m, targets\)/.test(rt), 'the runtime does not follow them');
});

console.log('\n-- M6.17.12 --');
T('the coil, dressed: a strip along the inner wall in the colour of the floor it climbs to; each floor named at its way in; something of its own along each turn - and the walkway kept clear (Rhys: "it needs something more to it")', () => {
  const R = L.ramp;
  // the colour changes as you pass a floor's way in, not before
  A(coilFloor(R, RK[2][0] - 0.01) === '1' && coilFloor(R, RK[2][0] + 0.01) === '2' && coilFloor(R, RK[3][0] + 0.01) === '3' && coilFloor(R, RK[4][0] + 0.01) === '4' && coilFloor(R, RK[5][0] + 0.01) === 'RT', 'the floors along the coil');
  for (const f of ['1', '2', '3', '4', 'RT']) {
    A(L.coil.strips[f] > 150, 'too little strip to floor ' + f + ': ' + L.coil.strips[f]);
    const want = COIL.colours[f].map((v) => v * 0.42);
    A(L.pieces.some((p) => p.mat === 'neon' && p.tint && p.tint.every((v, i) => Math.abs(v - want[i]) < 1e-9)), 'no strip in floor ' + f + '\'s colour');
  }
  // every floor named over its way in, from the coil
  for (const k of ['G', '1', '2', '3', '4', 'RT']) A(L.signs.some((s) => s.coil === k && Math.abs(s.pos[1] - C_FLOORS[k] - 2.62) < 0.01), 'no sign for ' + k);
  // each turn has its own things
  const kinds = (f) => new Set(L.coil.items.filter((i) => i.floor === f).map((i) => i.kind));
  A(kinds('1').has('slot') && kinds('2').has('post') && kinds('3').has('picture') && kinds('4').has('vending') && kinds('RT').has('planter'), 'a turn without its own: ' + ['1', '2', '3', '4', 'RT'].map((f) => f + ':' + [...kinds(f)]));
  A(L.coil.items.length > 50, L.coil.items.length + ' things along the coil');
  // the security post is on the second floor's stretch, before its way in
  A(L.coil.post && L.coil.post.phi < RK[3][0] && L.coil.post.phi > RK[3][0] - 30 / 27.6, 'the security post is not before the private floor');
  // nothing in the walkway: every collision box against a wall, none across the middle
  for (const s of L.world.solids.filter((q) => q.tag === 'coil')) {
    const rs = [[s.min[0], s.min[2]], [s.max[0], s.min[2]], [s.min[0], s.max[2]], [s.max[0], s.max[2]]].map(([x, z]) => Math.hypot(x - CX, z - CZ));
    A(Math.max(...rs) <= COIL.clear[0] + 1e-6 || Math.min(...rs) >= COIL.clear[1] - 1e-6, 'in the walkway at ' + s.min.map((v) => v.toFixed(1)));
  }
  A(COIL.clear[1] - COIL.clear[0] >= 1.5, 'the walkway is narrower than 1.5 m');
  // and nothing over a way in from the coil
  for (const it of L.coil.items) {
    const a = R.thetaOf(it.phi), y = R.heightAt(it.phi);
    for (const o of L.ringOpenings) if (o.ring === 'middle' && Math.abs(o.y - y) < 1.2) A(Math.abs(Math.atan2(Math.sin(a - (o.a0 + o.a1) / 2), Math.cos(a - (o.a0 + o.a1) / 2))) * R_MID > (o.a1 - o.a0) / 2 * R_MID + 3.4, 'a ' + it.kind + ' by the way in to floor ' + o.floor);
  }
});
T('the reds keep off the coil for a noise or a fight with the Yellows on another floor; only one after you follows you up or down (M6.17.12, Rhys: two reds "randomly on the coil ... SO far from their posts")', () => {
  const { C, nav } = yCasino();
  const r = C.guards.find((g) => g.id === 'C8');           // the first floor's patrol, bold
  const ctx = { world: C.world, nav, guards: C.guards, doors: C.swingDoors, noises: [], you: null, pathBudget: { left: 1 } };
  const home = r.pos[1];
  // gunfire two floors up: he holds his floor
  r.stim = [30, C_FLOORS['2'], 30]; r.since = 0; r.awareness = 0.7; r.setState('search', ctx, 'search');
  for (let i = 0; i < 30 * 20; i++) { ctx.pathBudget.left = 1; r.step(1 / 30, ctx); }
  A(Math.abs(r.pos[1] - home) < 0.5, 'he went up the coil after a noise: y ' + r.pos[1].toFixed(1));
  // after you, out of a fight: he may follow
  r.setState('patrol', ctx); r.fightingYou = true; r.setState('search', ctx, 'lost');
  A(r.pursuit === true && r.navOpts() === null, 'a search out of a fight is not a pursuit, or keeps off the coil');
  r.setState('patrol', ctx); r.setState('search', ctx, 'search');
  A(r.navOpts() && r.navOpts().noRamp, 'a search for a noise takes the coil');
  // a shout about a fight with the Yellows brings only his own floor; one about you, more
  const officer = C.guards.find((g) => g.id === 'C9');
  const fresh = () => yCasino().C.guards;
  const g1 = fresh(), o1 = g1.find((g) => g.id === 'C9');
  const rivalAns = raiseAlarm(g1, o1, o1.pos, { rival: true });
  A(rivalAns.length && rivalAns.every((g) => Math.abs(g.pos[1] - o1.pos[1]) < 2.2), 'a shout about the Yellows brought men from other floors');
  const g2 = fresh(), o2 = g2.find((g) => g.id === 'C9');
  const youAns = raiseAlarm(g2, o2, o2.pos);
  A(youAns.some((g) => Math.abs(g.pos[1] - o2.pos[1]) > 2.2) && youAns.every((g) => !g.pursuit && g.navOpts().noRamp), 'a shout about you: no one from another floor, or they came by the coil');
  // (M6.17.13, Rhys: "they DON'T do it if you don't meet the Yellows") a fight with a Yellow, lost sight of, is no chase
  r.setState('patrol', ctx); r.fightingYou = false; r.setState('search', ctx, 'lost');
  A(!r.pursuit && r.navOpts().noRamp, 'losing a Yellow sent him round the coil');
  r.setState('patrol', ctx); r.fightingYou = true; r.setState('search', ctx, 'lost');
  A(r.pursuit && r.navOpts() === null, 'losing you did not');
  const gs2 = readFileSync(new URL('../src/sim/guard.js', import.meta.url), 'utf8');
  A(/this\.fightingYou = !ctx\.you\.guard;/.test(gs2) && /this\.pursuit = this\.target\.lastBy === 'you';/.test(gs2), 'who he was fighting is not kept');
  const gsrc = readFileSync(new URL('../src/sim/guard.js', import.meta.url), 'utf8');
  A(/ctx\.alarm\(this, ctx\.you\.pos, \{ rival: !!ctx\.you\.guard \}\)/.test(gsrc), 'the alarm does not say whom it is about');
  void officer;
});
T('a Yellow notices a red three times as fast as a guard notices you (M6.17.12, Rhys: "Yellows were very slow to react to a Red\'s presence")', () => {
  const w = new World(); w.addSolid([-50, -1, -50], [50, 0, 50], 'ground');
  const y = new Guard(w, { id: 'y', pos: [0, 0, 0], yaw: 0, faction: 'yellow' });
  const view = (guard) => ({ pos: [0, 0, -10], eye: [0, 1.6, -10], chest: [0, 1.15, -10], box: [[-0.3, 0, -10.3], [0.3, 1.8, -9.7]], noise: 0, stance: 0, speed: 1, guard });
  const t = (guard) => { y.awareness = 0; let k = 0; while (y.awareness < 1 && k < 600) { y.perceive(1 / 60, { world: w, you: view(guard), guards: [], noises: [] }); k++; } return k / 60; };
  const tYou = t(null), tRed = t({});
  A(tRed < tYou / 2.5 && tRed < 0.6, 'a red noticed in ' + tRed.toFixed(2) + ' s (you: ' + tYou.toFixed(2) + ' s)');
});
T('with the locket, each Yellow takes his own way out from where he stands - not the boss\'s, from where the boss stood (M6.17.12, Rhys: they "glorched up through the ceiling, and THEN came down")', () => {
  const ys = [{ pos: [29.6, 8, 7.6], boss: true, escort: { arrived: true } }, { pos: [30, 4, 30] }, { pos: [20, 0, 40] }].map((y) => Object.assign({ dead: false, away: false, target: { solid: {} } }, y));
  const job = new YellowJob(ys, { pos: [29.6, 9.1, 6.4], taken: false }, [20, 0, 64]);
  job.stage = 'locket'; job.taker = ys[0];
  const asked = [];
  job.tick(() => true, (a, b) => { asked.push(a.slice()); return [a.slice(), b.slice()]; });
  A(job.stage === 'leaving', 'did not leave');
  for (const y of ys) A(y.escort.path[0][1] === y.pos[1] && Math.hypot(y.escort.path[0][0] - y.pos[0], y.escort.path[0][2] - y.pos[2]) < 1e-9, 'a Yellow starts his way out from somewhere else: ' + y.pos + ' -> ' + y.escort.path[0]);
  A(asked.length === 3, 'ways found: ' + asked.length);
});
T('no reds-down count on the screen (M6.17.12, Rhys)', () => {
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(!/reds down: ' \+ now\.down/.test(rt), 'still counting the reds on screen');
});

console.log('\n-- M6.17.13 --');
T('the locket for yourself: take it, and the boss asks - hand it over and they go with it; deny it and, unless one of them saw you, they go without; caught lying, they turn (Rhys)', () => {
  const mk = () => {
    const ys = [{ id: 'Y1', pos: [29.6, 8, 9], boss: true }, { id: 'Y2', pos: [30, 8, 10] }, { id: 'Y3', pos: [31, 8, 10] }].map((y) => Object.assign({ dead: false, away: false, target: { solid: {} } }, y));
    const job = new YellowJob(ys, { pos: [29.6, 9.1, 6.4], taken: false }, [20, 0, 64]);
    return { ys, job };
  };
  const find = (a, b) => [a.slice(), b.slice()];
  // taken by you before they got there: they arrive, see it gone - 'missing'
  { const { ys, job } = mk(); job.start(); job.locket.taken = true; job.locket.by = 'you';
    const ev = job.tick(() => true, find);
    A(job.stage === 'missing' && ev.some((e) => e.type === 'missing'), 'they did not notice: ' + job.stage);
    A(job.give(find) && job.stage === 'leaving' && job.locket.by === 'yellows' && ys.every((y) => y.escort && y.escort.path), 'handing it over: ' + job.stage); }
  // denied (believed): they leave without it, and it stays yours
  { const { job } = mk(); job.start(); job.locket.taken = true; job.locket.by = 'you'; job.tick(() => true, find);
    A(job.giveUp(find) && job.stage === 'leaving' && job.gaveUp && job.locket.by === 'you', 'believed: ' + job.stage); }
  // the boss on his way to take it when you snatch it: he notices, stops, and asks
  { const { ys, job } = mk(); job.start(); job.tick(() => true, find);
    A(job.stage === 'locket', 'not going for it');
    job.locket.taken = true; job.locket.by = 'you'; job.tick(() => true, find);
    A(job.stage === 'missing' && !ys[0].escort.goto, 'he kept walking to the empty plinth'); }
  // the story of it
  const R = RULES.casino, reds = Array.from({ length: 15 }, () => ({ dead: false })), ys3 = [{ dead: false }, { dead: false }, { dead: false }];
  const line = (o) => R.lines(R.outcome(Object.assign({ guards: reds, ledger: true, yellows: ys3 }, o)))[2];
  A(/handed over by you/.test(line({ job: 'leaving', locket: true, locketAnswer: 'gave' }).text) && line({ job: 'leaving', locket: true, locketAnswer: 'gave' }).ok, 'gave');
  A(/kept it for yourself; they believed/.test(line({ job: 'leaving', locketMine: true, locketAnswer: 'lied' }).text) && line({ job: 'leaving', locketMine: true, locketAnswer: 'lied' }).neutral, 'lied');
  A(/caught you lying/.test(line({ job: 'off', locketMine: true, locketAnswer: 'caught' }).text) && !line({ job: 'off', locketMine: true, locketAnswer: 'caught' }).ok, 'caught');
  A(/in your pocket/.test(line({ job: 'idle', locketMine: true }).text), 'not teamed, pocketed');
  A(R.settled(R.outcome({ guards: reds, ledger: true, yellows: ys3, job: 'missing', locketMine: true, locketAnswer: 'lied' })) && !R.settled(R.outcome({ guards: reds, ledger: true, yellows: ys3, job: 'missing', locketMine: true })), 'an unanswered question holds the ending; an answered one does not');
  // the game's side: E takes it; the boss asks, with your two answers as buttons; caught if one of them watched
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/if \(locketNear\(\)\) \{ takeLocket\(\); return true; \}/.test(rt) && /'E  Take the locket'/.test(rt), 'no taking it');
  A(/\[LOCKET_CHOICES\.give, \(\) => answerLocket\('give', boss\)\]/.test(rt) && /\[LOCKET_CHOICES\.deny, \(\) => answerLocket\('deny', boss\)\]/.test(rt), 'no choice');
  A(/rt\.locketSeenBy = guards\.filter/.test(rt) && /if \(rt\.locketSeenBy && rt\.locketSeenBy\.length\) \{/.test(rt) && /turnYellows\(YELLOW_TALK\.caught\)/.test(rt), 'never caught out');
  A(LOCKET_CHOICES.give === 'Just keeping it safe - all yours.' && LOCKET_CHOICES.deny === 'It wasn\'t in there.', 'the answers');
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/!openCrate && !S\.dialog && !S\.transport/.test(main) && /!S\.menu && !S\.dialog\) openMenu\(\)/.test(main), 'the game does not wait for the answer');
});
T('the security post\'s terminal: hold E to hack it - the Cash Vault\'s steel doors unlock and every red is on the radar a while; its sign says staff & VIPs (Rhys)', () => {
  A(L.terminals && L.terminals.length === 1, 'no terminal');
  const t = L.terminals[0], post = L.coil.post.pos;
  A(Math.hypot(t.pos[0] - post[0], t.pos[2] - post[2]) < 0.5 && t.time >= 4 && t.reveal >= 30, 'not at the post');
  // reachable from the walkway
  const r = Math.hypot(t.pos[0] - CX, t.pos[2] - CZ);
  A(r - COIL.clear[1] < 1.4, 'out of reach from the walkway: ' + (r - COIL.clear[1]).toFixed(2));
  A(L.signs.some((s) => s.coil === 'post' && /staff & VIPs/.test(s.sub)), 'the sign');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8'), main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/'Hold E  ' \+ \(tn\.verb \|\| 'Hack'\) \+ ' ' \+ tnm/.test(rt) && /tn\.label \|\| 'the security terminal'/.test(rt) && /input\.held\('interact'\) && player\.mode !== 'dead'\) \{ rt\.hackT = \(rt\.hackT \|\| 0\) \+ simDt/.test(rt), 'no hacking');
  A(/if \(d\.locked && d\.def\.vault\) d\.unlock\(\);/.test(rt) && /level\.revealT = t\.reveal/.test(rt), 'hacking does nothing');
  A(/level\.revealT > 0 && t\.guard && t\.guard\.faction === 'red'/.test(main), 'the reds are not shown on the radar');
});
T('CASINO in big red letters over the door: six of them on the canopy, red neon faces, bulbs down every stroke (Rhys: "Big Red Las Vegas Lettering")', () => {
  A(L.casinoSign && L.casinoSign.letters.join('') === 'CASINO' && L.casinoSign.bulbs > 100, 'no lettering');
  A(!L.signs.some((s) => s.text === 'CASINO'), 'the flat panel is still there');
  for (const ch of 'CASINO') A(LETTERS[ch] && LETTERS[ch].length >= 1, ch);
  // on the canopy (z between its inner and outer edge, over it), wider than the doors, not as wide as the canopy
  const zr = L.casinoSign.z - CZ;
  A(zr > R_OUT + 0.15 && zr < R_OUT + 3.4 && L.casinoSign.y0 > 3.3 && L.casinoSign.width > 8 && Math.atan2(L.casinoSign.width / 2, zr) < 0.2, 'not standing on the canopy');
  A(L.pieces.filter((p) => p.mat === 'neon' && p.tint && p.tint[0] > 0.5 && p.tint[1] < 0.1).length >= 20, 'no red neon');
});
T('the frame rate counted against the clock, not from one frame (M6.17.13, Rhys: after Begin it read "over 900")', () => {
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/if \(nowMs - S\.fpsAt >= 500\) \{ S\.fps = S\.fpsN \* 1000 \/ \(nowMs - S\.fpsAt\);/.test(main) && !/1 \/ Math\.max\(dt, 1e-3\)/.test(main), 'still from one frame');
});

console.log('\n-- M6.17.14 --');
T('a dead red is no "man down" to a Yellow - only one of his own is (Rhys: "Man down - The Reds did this" with all 3 Yellows standing)', () => {
  const w = new World(); w.addSolid([-50, -1, -50], [50, 0, 50], 'ground');
  const y = new Guard(w, { id: 'y', pos: [0, 0, 0], yaw: 0, faction: 'yellow' });
  const red = new Guard(w, { id: 'r', pos: [0, 0, -6], yaw: 0, faction: 'red' }); red.dead = true;
  const said = [], ctx = { world: w, you: null, guards: [y, red], noises: [], bark: (g, t, k) => said.push(k), yellowLines: true };
  y.perceive(1 / 60, Object.assign({}, ctx, { you: { pos: [0, 0, 40], eye: [0, 1.6, 40], chest: [0, 1.1, 40], noise: 0, stance: 0, speed: 0 } }));
  A(!said.length && y.awareness < 0.5, 'a Yellow mourned a red: ' + said);
  const mate = new Guard(w, { id: 'y2', pos: [2, 0, -6], yaw: 0, faction: 'yellow' }); mate.dead = true;
  ctx.guards.push(mate);
  y.perceive(1 / 60, Object.assign({}, ctx, { you: { pos: [0, 0, 40], eye: [0, 1.6, 40], chest: [0, 1.1, 40], noise: 0, stance: 0, speed: 0 } }));
  A(said.includes('y_manDown'), 'his own man down went unremarked: ' + said);
});
T('after answering the boss the game carries on: the pointer is asked for afresh, so the pause menu does not open in the moment it takes (Rhys: it "remains paused")', () => {
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/el\.style\.display = 'none'; S\.dialog = false; audio\.click\(\); fn\(\);\s+if \(S\.dialog\) return;[^\n]*\s+S\.wantLock = S\.time; input\.requestLock\(\);/.test(rt) && /for \(const ms of \[400, 1100\]\)/.test(rt), 'still paused after the answer');
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/const settled = S\.time - \(S\.wantLock \|\| 0\) > 2;/.test(main), 'the pause watch changed');
});

console.log('\n-- M6.17.15 --');
T('the Tournament Room\'s doors are reinforced (breach them); the terminal opens only the vault\'s own (Rhys)', () => {
  const C = buildCasino();
  const t = C.swingDoors.filter((d) => d.locked && d.centre[1] > C_FLOORS[2] && d.centre[2] > 15), v = C.swingDoors.filter((d) => d.def.vault);
  A(t.length === 2 && t.every((d) => d.def.build === 'reinforced' && !d.def.vault), 'the Tournament Room\'s doors: ' + t.map((d) => d.def.build));
  A(v.length === 2 && v.every((d) => d.locked && d.def.build === 'reinforced'), 'the vault\'s doors');
  A(kickOpensAny(t[0]) === false, 'a kick opens the Tournament Room');
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/find the reds' <b>ledger<\/b>/.test(main) && !/clear the reds out: every one of them/.test(main), 'the briefing still asks you to clear the reds out');
});

console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + ')' : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
