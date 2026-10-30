// FRONTLINE - Level 3, the Casino (M6.15.0, Rhys: "can we set about building
// the Casino next please (including the smooth/circular walls?)").
//
// From Rhys's preliminary map (maps/Frontline_Map_Casino__Prelim.xlsx, via
// tools/map_to_json.py -> maps/casino.json): a round building 60 m across
// (one square = 1 m), drawn pixel-round and built with true curves. Two rings
// on every floor: the outer wall, and a middle wall 3 m inside it; between
// them, "the stairs round the outside" - one smooth ramp coiling up round the
// building (Rhys), a turn a floor, meeting each floor where the map marks it
// (east for the ground, first and second floors; north for the third, fourth
// and the roof terrace). Inside: the ground floor's gaming floor (poker,
// roulette, blackjack, baccarat, craps, a round central bar, the cage) in its
// ring of rooms; the first floor's bar and restaurant; the second floor's
// private room behind reinforced doors and its viewing galleries, in a hall
// two floors high with the 2A mezzanine - a cross of glass-walled walkways -
// across it, reached by spiral stairs; the third and fourth floors (not yet
// furnished on the map); and the roof terrace with its pool.
// The map's Info tab is still the factory's, so the story is a placeholder:
// the reds have taken the casino; clear them out.

import { World } from '../sim/world.js';
import { Crate } from '../sim/loadout.js';
import { SwingDoor, hangDoors } from '../sim/doors.js';
import { Guard, GUARD } from '../sim/guard.js';
import { drawLadder } from './ladders.js';
import { cellAt, insideMask, rooms, doorways, railing } from './level_hotel.js';
import { arcWallQuads, arcWallBoxes, quadsBox, Ramp, discBoxes, pt, gridWallSegments, segmentRect, rowRuns } from '../sim/curves.js';
import { flatPoly, rectPts, circlePts, prism, outlineBoxes, pointInPoly, polySides, cylinder, sweep, orientedBox } from '../sim/shapes.js';
import { STAIR, buildStair, roundFloor, deck, glassPool, wallLines, buildWallLines, gamingTable, diningTable, slotMachine, roundBar, arcBar, washroom, placeChairs, roomOutline, poolShape, TINT, quietBooth, cashVault } from './casino_fit.js';
import MAP from './maps/casino.json' with { type: 'json' };

const TAU = Math.PI * 2;
// (M6.17.0) changes to Rhys's map, made here so his spreadsheet stays his:
// doors into the Chips Counter and the Check-in Desk from the rooms beside
// them (Rhys: "one isn't accessible" - neither had a way in), and the room
// behind the reinforced doors on the second floor named the Cash Vault (Rhys)
export const MAP_PATCH = [['G', 7, 35, 'D'], ['G', 52, 35, 'D']];
for (const [fl, x, y, c] of MAP_PATCH) { const r = MAP.floors[fl][y]; if (r[x] !== c) MAP.floors[fl][y] = r.slice(0, x) + c + r.slice(x + 1); }
if (!MAP.labels.some((l) => l[0] === 'Cash Vault')) MAP.labels.push(['Cash Vault', '2', 30, 6]);
export const CX = 30, CZ = 30;                      // the middle (map squares 0-59, 1 m each)
export const R_OUT = 29.5, T_OUT = 0.4;             // the outer wall
export const R_MID = 25.8, T_MID = 0.35;            // the middle wall, the ramp's inner side
export const BAND = [R_MID + T_MID / 2, R_OUT - T_OUT / 2];   // the ramp's band
const RING_FACE = R_MID - T_MID / 2 - 0.03;                    // (M6.17.1) nothing inside reaches past this
const RMID_ = (BAND[0] + BAND[1]) / 2;
export const C_FLOORS = { G: 0, 1: 4, 2: 8, '2A': 11.6, 3: 15.2, 4: 19.2, RT: 23.2 };
const ORDER = ['G', '1', '2', '3', '4', 'RT'];
const NEXT = { G: 4, 1: 8, 2: 15.2, 3: 19.2, 4: 23.2 };
const SLAB = 0.3;
// the ramp: how far round it has come at each floor (east 0; north a quarter turn on)
// (M6.16.0, Rhys: "I was expecting the sloping floor to run with a clockwise
// ascent") clockwise now, as the map is drawn: east, south, west, north. It
// starts level, from the ground floor's way in (east) round to the main doors
// (south), and climbs from there; so the doors open onto the ramp's foot, not
// under its first, lowest stretch. The third floor is reached a turn and
// three quarters on from the second (north), the steepness of the rest.
// (M6.17.1, Rhys: at the top, "a short rail to prevent Player from spiraling
// up just to fall down again") it ends in a level landing alongside the way
// onto the roof terrace, and a rail across its end
export const RAMP_TOP = 2.4;
export const RAMP_KEYS = [[0, 0], [0.3 * TAU, 0], [TAU, 4], [2 * TAU, 8], [3.75 * TAU, 15.2], [4.75 * TAU, 19.2], [5.75 * TAU, 23.2], [5.75 * TAU + RAMP_TOP / ((R_MID + T_MID / 2 + R_OUT - T_OUT / 2) / 2), 23.2]];
// (M6.17.0, Rhys: a point on the roof to jump off, and parachute down to the
// jeep) a maintenance gantry out over the plaza, south, from the roof terrace
export const JUMP = { half: 0.75, out: 2.4 };
export const JEEP_AT = [38, 0, 68.4];
export const POOL_SINK = 1.1;          // (M6.17.0) the pool's floor is this far below the roof terrace
export const ACCESS = { G: 0, 1: 0, 2: 0, 3: -Math.PI / 2, 4: -Math.PI / 2, RT: -Math.PI / 2 };
export const CASINO_TIME = { date: [21, 8, 2026], hour: 23, minute: 15 };
const WALLISH = new Set(['W', 'G', 'D', 'L', 'R', 'E']);
const DOORISH = new Set(['D', 'L', 'R', 'E']);

export const casinoRamp = () => new Ramp({ cx: CX, cz: CZ, rIn: BAND[0], rOut: BAND[1], start: 0, dir: 1, keys: RAMP_KEYS });
// under the ramp's first turn, too low to stand under: solid (the height of its top there)
export const RAMP_FILL = 2.3;
// the outer wall's windows (M6.16.0, Rhys: "some look-out-of-able windows ...
// and for the lit windows to stagger up with the slope-coil"): one in every
// six of its half-metre strips is the start of a window three strips wide,
// each a metre above the ramp beside it, climbing with it
export const WIN = { strips: 372, every: 6, wide: 3, sill: 1.0, head: 2.3 };
const rOf = (x, y) => Math.hypot(x + 0.5 - CX, y + 0.5 - CZ);
const roomName = (labels, cells) => labels.filter(([t, , lx, ly]) => cells.some(([x, y]) => Math.abs(x - lx) <= 1 && Math.abs(y - ly) <= 1)).map((l) => l[0]).join('|');
const thetaOf = (x, z) => Math.atan2(z - CZ, x - CX);
const wrap = (a) => { while (a > Math.PI) a -= TAU; while (a <= -Math.PI) a += TAU; return a; };

// What the map has on a ring at an angle: the codes of the squares within a
// metre of it - 'door' (D, L, R, E), 'glass' (G), 'wall' (W) or 'open'
export function ringCode(rows, r, a) {
  const p = pt(CX, CZ, r, a, 0), codes = new Set();
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const x = Math.floor(p[0]) + dx, y = Math.floor(p[2]) + dy;
    if (Math.hypot(x + 0.5 - p[0], y + 0.5 - p[2]) <= 0.95) codes.add(cellAt(rows, x, y));
  }
  if ([...codes].some((c) => DOORISH.has(c))) return 'door';
  if (codes.has('W')) return 'wall';
  if (codes.has('G')) return 'glass';
  return 'open';
}

export function buildCasino() {
  const world = new World();
  const pieces = [], signs = [], lamps = [], water = [], lights = [], crates = [], props = [], vehicles = [];
  const level = { world, pieces, signs, lamps, water, lights, crates, props, vehicles, securityTurrets: [], surfaces: [],
    swingDoors: [], guards: [], zones: {}, casino: true, rules: 'casino', night: true,
    missionTime: CASINO_TIME, startGear: 'LENSES', bake: true,
    // (M6.17.0, Rhys) the casino kit: bare hands for a primary, a silenced V-27C, two lures, two smoke grenades, a parachute
    startLoadout: { primary: null, backup: 'V27C', utility1: 'LURE', utility2: 'SMOKE', gear: 'PARACHUTE', mods: { backup: ['SILENCER'] } }, bakeRegion: [-6, -6, 66, 64] };
  const box = (min, max, mat, opts) => {
    opts = opts || {};
    const p = { min, max, mat, uv: opts.uv || 'world', tag: opts.tag, tint: opts.tint };
    if (opts.render !== false) pieces.push(p);
    if (opts.solid !== false) world.addSolid(min, max, opts.tag || mat, { noClimb: opts.noClimb, glass: opts.glass, shootThrough: opts.shootThrough });
    return p;
  };
  const curve = (quads, mat, opts) => { if (quads.length) pieces.push(Object.assign({ quads, mat, uv: 'world' }, opts && opts.tint ? { tint: opts.tint } : {}, opts && opts.prop ? { prop: opts.prop } : {}, quadsBox(quads))); };
  const solids = (list, tag, opts) => { for (const [a, b] of list) world.addSolid(a, b, tag, opts); };
  const ramp = casinoRamp();
  level.ramp = ramp;
  const kit = { box, curve, solids, world, level };

  // ── outside (M6.16.0, Rhys: "Why does the map-edge say 'Range'? - I'd
  // like some sort of 'neighbourhood' for the Casino to exist in") ──
  // The fence round the edge was the firing range's, its RANGE sign and all.
  // Now: the casino's plaza, a road all the way round it, pavements, and the
  // city's blocks beyond - lit windows, shopfronts, street lamps, parked cars.
  // The way out of the square is by the side streets, closed off for the night.
  neighbourhood(level, box);

  // ── the ramp, round the outside, a turn a floor ──
  solids(ramp.boxes({ cell: 1.0 }), 'ramp');
  { const q = ramp.quads(0.03); for (let i = 0; i < q.length; i += 60) curve(q.slice(i, i + 60), 'concrete2'); }
  // the solid base under its first climb, where it is too low to walk under.
  // (M6.16.0, Rhys: an invisible barrier at 5.5, 0, 43) Its collision had been
  // the ramp's own metre squares, filled to the ground wherever the ramp over
  // a square's middle was low: squares reaching past the drawn end of the base,
  // up to half a metre of nothing you could walk into. Now the base is drawn
  // where it is solid: along the band, in short pieces, its end square across.
  {
    const phiA = RAMP_KEYS[1][0], phiB = ramp.phiAtHeight(RAMP_FILL, phiA);
    level.rampFill = [phiA, phiB];
    const quads = [], n = Math.ceil((phiB - phiA) * BAND[1] / 0.5);
    for (const r of [BAND[0], BAND[1]]) for (let i = 0; i < n; i++) {
      const p0 = phiA + (phiB - phiA) * i / n, p1 = phiA + (phiB - phiA) * (i + 1) / n, a0 = ramp.thetaOf(p0), a1 = ramp.thetaOf(p1);
      const out = r === BAND[1] ? -1 : 1, mid = (a0 + a1) / 2, nn = [Math.cos(mid) * out, 0, Math.sin(mid) * out];
      const s0 = (p0 - phiA) * r, s1 = (p1 - phiA) * r, h0 = ramp.heightAt(p0), h1 = ramp.heightAt(p1);
      const lm = [[s0, 0], [s1, 0], [s1, -h1], [s0, -h0]];
      quads.push({ v: [pt(CX, CZ, r, a0, 0), pt(CX, CZ, r, a1, 0), pt(CX, CZ, r, a1, h1), pt(CX, CZ, r, a0, h0)], n: nn, lm, uv: lm, sheet: (out < 0 ? 'o' : 'i') + Math.floor(s0 / 12) });
    }
    const aB = ramp.thetaOf(phiB), hB = ramp.heightAt(phiB), tan = [-Math.sin(aB), 0, Math.cos(aB)];
    quads.push({ v: [pt(CX, CZ, BAND[0], aB, 0), pt(CX, CZ, BAND[1], aB, 0), pt(CX, CZ, BAND[1], aB, hB), pt(CX, CZ, BAND[0], aB, hB)], n: tan });
    curve(quads, 'concrete2');
    // its collision: short pieces across the band, stopping just short of the drawn end
    const stop = phiB - 0.3 / BAND[0];
    for (let r0 = BAND[0]; r0 < BAND[1] - 1e-6; r0 += 0.55) {
      const r1 = Math.min(BAND[1], r0 + 0.55), rm = (r0 + r1) / 2, m = Math.max(1, Math.ceil((stop - phiA) * rm / 0.45));
      for (let i = 0; i < m; i++) {
        const p0 = phiA + (stop - phiA) * i / m, p1 = phiA + (stop - phiA) * (i + 1) / m;
        const top = ramp.heightAt(p0) - 0.08;
        if (top <= 0.05) continue;
        const cs = [pt(CX, CZ, r0, ramp.thetaOf(p0), 0), pt(CX, CZ, r1, ramp.thetaOf(p0), 0), pt(CX, CZ, r0, ramp.thetaOf(p1), 0), pt(CX, CZ, r1, ramp.thetaOf(p1), 0)];
        const xs = cs.map((c) => c[0]), zs = cs.map((c) => c[2]);
        world.addSolid([Math.min(...xs), 0, Math.min(...zs)], [Math.max(...xs), top, Math.max(...zs)], 'ramp');
      }
    }
    // under the rest of the first turn there is headroom: a dim passage, lit
    for (let phi = phiB + 3 / RMID_; phi < TAU - 1 / RMID_; phi += 9 / RMID_) {     // (M6.17.0: '+ 2' had been radians - none were ever put up)
      const a = ramp.thetaOf(phi), y = ramp.heightAt(phi) - 0.35, p = pt(CX, CZ, BAND[1] - 0.3, a, y);
      lights.push({ pos: [p[0], y - 0.3, p[2]], range: 8, intensity: 0.7, color: [1, 0.85, 0.65], noFill: true });
      box([p[0] - 0.12, y - 0.08, p[2] - 0.12], [p[0] + 0.12, y, p[2] + 0.12], 'lamp', { solid: false });
    }
  }
  // (M6.17.1) the rail across the top landing's end, over the drop to the turn below
  {
    const a = ramp.thetaOf(ramp.end - 0.06 / RMID_), y = ramp.heightAt(ramp.end), rs = [BAND[0] + 0.02, BAND[1] - 0.02];
    const P = (r, h) => pt(CX, CZ, r, a, h);
    curve(sweep([P(rs[0], y + 1.0), P(rs[1], y + 1.0)], 0.04, 0.04), 'metal');
    curve(sweep([P(rs[0], y + 0.5), P(rs[1], y + 0.5)], 0.02, 0.02), 'metal');
    for (let r = rs[0] + 0.05; r <= rs[1]; r += (rs[1] - rs[0] - 0.1) / 3) { const q = P(r, 0); box([q[0] - 0.03, y, q[2] - 0.03], [q[0] + 0.03, y + 1.0, q[2] + 0.03], 'metal', { solid: false }); }
    for (let r = rs[0]; r < rs[1] - 1e-6; r += 0.3) {
      const q0 = P(r, 0), q1 = P(Math.min(rs[1], r + 0.3), 0);
      world.addSolid([Math.min(q0[0], q1[0]) - 0.06, y, Math.min(q0[2], q1[2]) - 0.06], [Math.max(q0[0], q1[0]) + 0.06, y + 1.04, Math.max(q0[2], q1[2]) + 0.06], 'rail', { noClimb: true, shootThrough: true });
    }
    level.rampRail = { a, y, r: rs };
  }
  // lights along it, on the outer wall between the windows
  for (let phi = 0.5; phi < ramp.end; phi += 19 / RMID_) {
    const a = ramp.thetaOf(phi), y = ramp.heightAt(phi) + 2.6, p = pt(CX, CZ, BAND[1] - 0.25, a, y);
    if (y > C_FLOORS.RT - 0.3) continue;            // (M6.17.0, Rhys: "floating light?" - over the last stretch there is no wall left to hang it on)
    lights.push({ pos: p, range: 11, intensity: 0.9, color: [1, 0.85, 0.65] });
    box([p[0] - 0.15, y - 0.1, p[2] - 0.15], [p[0] + 0.15, y + 0.1, p[2] + 0.15], 'lamp', { solid: false });
  }

  // ── the rings, floor by floor ──
  // where there is something to step onto beyond the middle ring at this height: the ramp, or the ground corridor under it
  const bandFloorAt = (a, y) => ramp.heightsAtTheta(a).some((h) => Math.abs(h.y - y) < 0.45) ||
    (y === 0 && ramp.heightsAtTheta(a)[0].y > 2.3);
  level.ringOpenings = [];
  // collision for the rings: per ring, per half-metre of it, the heights it is
  // solid over - joined up floor to floor afterwards (one box where a wall
  // runs the whole height, not one a floor)
  const ringSpans = { middle: [] };
  for (const key of ORDER) {
    const rows = MAP.floors[key], y0 = C_FLOORS[key], top = key === 'RT' ? y0 + 1.1 : NEXT[key] - SLAB;
    for (const [r, t, which] of [[R_MID, T_MID, 'middle']]) {     // (M6.16.0) the outer wall is built whole, below
      const step = 0.5 / r, n = Math.ceil(TAU / step), kinds = [];
      for (let i = 0; i < n; i++) {
        const a = -Math.PI + (i + 0.5) * TAU / n;
        let k = ringCode(rows, r, a);
        // the ramp meets this floor here: always a way through the middle ring
        if (which === 'middle' && key !== 'RT' && Math.abs(wrap(a - ACCESS[key])) * r < 1.6) k = 'door';
        // (M6.17.2, Rhys: "TINY gap ~(52, 8, 31) can see into WCs from outer coil") - but
        // not across the end of a wall inside that meets the ring there: the
        // doorway had run 0.3 m past the end of floor 2's east washroom wall,
        // leaving a slit between them, into the washroom
        if (k === 'door' && which === 'middle' && key !== 'RT') {
          const ix = CX + Math.cos(a) * (r - 1.2), iz = CZ + Math.sin(a) * (r - 1.2);
          if (WALLISH.has(cellAt(rows, Math.floor(ix), Math.floor(iz)))) k = 'wall';
        }
        if (which === 'middle' && key === 'RT' && Math.abs(wrap(a - ACCESS.RT)) * r < 1.6) k = 'door';
        if (which === 'middle' && key === 'RT' && Math.abs(wrap(a - Math.PI / 2)) * r < JUMP.half) k = 'door';    // the way out to the gantry
        // a door in the middle ring with nothing at its height beyond it: walled up
        if (k === 'door' && which === 'middle' && key !== 'RT' && !bandFloorAt(a, y0)) k = 'wall';
        // (M6.17.0, Rhys: "several gaps into the ground floor central room... they
        // don't look right") on the ground floor the ramp's level start runs
        // past them: the ways in from it are at the east, where the ramp begins
        // and from the main doors, straight on in (south)
        if (k === 'door' && which === 'middle' && key === 'G' && Math.abs(wrap(a - ACCESS.G)) * r >= 1.6 && Math.abs(wrap(a - Math.PI / 2)) * r >= 2.0) k = 'wall';
        // the main entrance, south, in the outer ring; no other way out of the band
        if (which === 'outer') k = key === 'G' && Math.abs(wrap(a - Math.PI / 2)) * r < 1.6 ? 'door' : (key === 'RT' ? 'glass' : 'wall');
        if (key === 'RT' && k !== 'door') k = 'glass';
        if (k === 'open') k = 'wall';                       // a pixel-step gap in the drawing
        kinds.push(k);
      }
      // its collision, sample by sample
      kinds.forEach((k, i) => {
        const span = ringSpans[which][i] = ringSpans[which][i] || { n, r, t, list: [] };
        if (key === 'RT') { if (k === 'glass') span.list.push([y0, top, true]); }
        else if (k === 'wall') span.list.push([y0, top + SLAB, false]);
        else if (k === 'glass') span.list.push([y0, top + SLAB, true]);
        else span.list.push([y0 + 2.3, top + SLAB, false]);
      });
      // runs of the same kind
      let i0 = 0;
      for (let i = 1; i <= n; i++) {
        if (i < n && kinds[i] === kinds[i0]) continue;
        const a0 = -Math.PI + i0 * TAU / n, a1 = -Math.PI + i * TAU / n, k = kinds[i0];
        const mat = which === 'outer' ? 'facade' : 'plaster';
        if (key === 'RT') {
          if (k === 'glass') {
            curve(arcWallQuads(CX, CZ, r, 0.06, a0, a1, y0, top, { noEnds: true }), 'glass');
            solids(arcWallBoxes(CX, CZ, r, 0.1, a0, a1, y0, top, 0.6), 'glass', { glass: true, noClimb: true });
            curve(arcWallQuads(CX, CZ, r, 0.1, a0, a1, top, top + 0.06, { noEnds: true }), 'metal');
          }
        } else if (k === 'wall') {
          curve(arcWallQuads(CX, CZ, r, t, a0, a1, y0, top + SLAB), mat);
        } else if (k === 'glass') {
          curve(arcWallQuads(CX, CZ, r, t, a0, a1, y0, y0 + 0.9), mat);
          curve(arcWallQuads(CX, CZ, r, t, a0, a1, y0 + 2.4, top + SLAB), mat);
          curve(arcWallQuads(CX, CZ, r, 0.06, a0, a1, y0 + 0.9, y0 + 2.4, { noEnds: true, noTop: true }), 'glass');
        } else {
          // a doorway: open to 2.3, wall above
          curve(arcWallQuads(CX, CZ, r, t, a0, a1, y0 + 2.3, top + SLAB), mat);
          level.ringOpenings.push({ floor: key, ring: which, a0, a1, y: y0 });
        }
        i0 = i;
      }
    }
  }
  for (const which of ['middle']) {
    const list = ringSpans[which], mergedOf = (sp) => {
      const l = sp.list.slice().sort((p, q) => p[0] - q[0]), merged = [];
      for (const v of l) {
        const last = merged[merged.length - 1];
        if (last && last[2] === v[2] && v[0] <= last[1] + 1e-6) last[1] = Math.max(last[1], v[1]);
        else merged.push(v.slice());
      }
      return merged;
    };
    // neighbouring samples solid over the same heights share their boxes (a metre each)
    let i0 = 0, m0 = mergedOf(list[0]);
    for (let i = 1; i <= list.length; i++) {
      const mi = i < list.length ? mergedOf(list[i]) : null;
      if (mi && JSON.stringify(mi) === JSON.stringify(m0)) continue;
      const sp = list[i0], a0 = -Math.PI + i0 * TAU / sp.n, a1 = -Math.PI + i * TAU / sp.n;
      for (const [y0, y1, glass] of m0) solids(arcWallBoxes(CX, CZ, sp.r, glass && y1 - y0 < 1.5 ? 0.1 : sp.t, a0, a1, y0, y1, 0.35), glass ? 'glass' : 'ring', glass ? { glass: true, noClimb: y1 - y0 < 1.5 } : undefined);
      i0 = i; m0 = mi;
    }
  }
  outerWall(level, ramp, box, curve, solids);
  coilDressing(level, ramp, kit);
  // the gantry: a grating walkway from the roof terrace across the ramp's
  // shaft and out past the wall, rails along its sides, open at the end
  {
    const y = C_FLOORS.RT + 0.12, z0 = CZ + R_MID - 0.6, z1 = CZ + R_OUT + JUMP.out, hw = JUMP.half - 0.05;
    box([CX - hw, y - 0.15, z0], [CX + hw, y, z1], 'grating', { noClimb: true });
    for (const sx of [-hw, hw]) {
      box([CX + sx - 0.03, y + 1.0, z0 + 0.4], [CX + sx + 0.03, y + 1.06, z1], 'metal', { solid: false });
      for (let z = z0 + 0.4; z <= z1 + 1e-6; z += 0.9) box([CX + sx - 0.025, y, z - 0.025], [CX + sx + 0.025, y + 1.0, z + 0.025], 'metal', { solid: false });
      world.addSolid([CX + sx - 0.05, y, z0 + 0.4], [CX + sx + 0.05, y + 1.06, z1], 'rail', { noClimb: true, shootThrough: true });
    }
    // (M6.17.1, Rhys: "'GANTRY' doesn't need a sign") - none
    world.addZone([CX - hw, y - 0.2, z1 - 1.2], [CX + hw, y + 2, z1], 'gantry', 'Casino - the gantry');
    level.gantry = { pos: [CX, y, z1 - 0.4], edge: z1 };
  }
  frontage(level, kit);

  // ── the floors inside the middle ring ──
  const rIn = R_MID - T_MID / 2;
  const stairs = casinoStairs();
  const holesFor = (key) => stairs.filter((s) => s.hole === key).map((s) => ({ cx: s.cx, cz: s.cz, r: s.rOut + STAIR.holeGap }));
  roundFloor(kit, CX, CZ, rIn + 0.05, 0.01, 0, 'carpet');
  // the roof pool's squares (and its ladders'): it is sunk into the roof, so the roof has a hole its shape
  const poolCells = new Set(), poolLadders = [];
  for (let z = 0; z < 60; z++) for (let x = 0; x < 60; x++) {
    const c = cellAt(MAP.floors.RT, x, z);
    if (c === '~' || c === 'A') poolCells.add(x + ',' + z);
    if (c === 'A') poolLadders.push([x, z]);
  }
  const poolHole = { poly: poolShape(poolCells).wall };
  for (const key of ['1', '2', '3', '4', 'RT']) roundFloor(kit, CX, CZ, rIn + 0.05, C_FLOORS[key], SLAB, key === 'RT' || key === '1' ? 'wood' : 'carpet', holesFor(key).concat(key === 'RT' ? [poolHole] : []));

  // ── inside each floor: walls, doors, furniture, lamps, from the map ──
  level.navFloors = [];
  level.navLinks = [];
  const floorInfo = {}, floorWalls = {};
  level.floorWalls = floorWalls;
  for (const key of ORDER) {
    const rows = MAP.floors[key], y0 = C_FLOORS[key];
    const c = (x, y) => cellAt(rows, x, y);
    const indoors = (x, y) => rOf(x, y) < R_MID - 0.95 && !(key === '2' && rOf(x, y) < 2.4);
    const wallH = key === '2' ? 3.3 : (key === 'RT' ? 1.1 : NEXT[key] - SLAB - y0);
    const T = 0.2;
    // the walls (M6.16.0): smoothed out of the map's staircases - casino_fit.js wallLines
    const wallish = (x, y) => c(x, y) === 'W' || c(x, y) === 'G';
    const nearPool = (x, y) => key === 'RT' && [-1, 0, 1].some((dy) => [-1, 0, 1].some((dx) => c(x + dx, y + dy) === '~' || c(x + dx, y + dy) === 'A'));
    const kiosk = (x, y) => c(x, y) === 'C' && ((wallish(x - 1, y) || c(x - 1, y) === 'C') && (wallish(x + 1, y) || c(x + 1, y) === 'C') && !(c(x - 1, y) === 'C' && c(x + 1, y) === 'C')
      || (wallish(x, y - 1) || c(x, y - 1) === 'C') && (wallish(x, y + 1) || c(x, y + 1) === 'C') && !(c(x, y - 1) === 'C' && c(x, y + 1) === 'C'));
    const cellKind = (x, y) => {
      if (x < 0 || y < 0 || x > 59 || y > 59 || !indoors(x, y) || nearPool(x, y)) return null;
      const code = c(x, y);
      if (code === 'W') return 'W';
      if (code === 'G') return key === 'RT' ? 'R' : 'G';
      if (kiosk(x, y)) return 'C';
      return null;
    };
    const ringCell = (x, y) => (c(x, y) === 'W' || c(x, y) === 'G' || DOORISH.has(c(x, y))) && !indoors(x, y) && rOf(x, y) < R_MID + 1.5 && !(key === '2' && rOf(x, y) < 2.4);
    const doorList = doorways(rows).filter((d) => d.cells.every(([x, y]) => indoors(x, y)));
    const W = wallLines(cellKind, doorList, { cx: CX, cz: CZ, r: R_MID - T_MID / 2 + 0.08, cell: ringCell });
    buildWallLines(kit, W, y0, wallH);
    floorWalls[key] = W;
    for (const d of doorList) {
      const a0 = (d.axis === 'x' ? d.cells[0][0] : d.cells[0][1]), a1 = a0 + d.cells.length;
      const at = d.axis === 'x' ? d.cells[0][1] + 0.5 : d.cells[0][0] + 0.5;
      if (d.axis === 'x') box([a0, y0 + 2.2, at - T / 2], [a1, y0 + wallH, at + T / 2], 'plaster');
      else box([at - T / 2, y0 + 2.2, a0], [at + T / 2, y0 + wallH, a1], 'plaster');
      // (M6.17.15, Rhys: the terminal may open the Cash Vault "but the locked doors to the Tournament
      // Room become Reinforced so you still have to Breach them open") the private floor's locked
      // doors - the Tournament Room's - are reinforced: C5 or a breaching shotgun, no kicking
      const R = d.code === 'R' || (d.code === 'L' && key === '2');
      const opts = R ? { build: 'reinforced', locked: true, mat: 'armour', thick: 0.08, label: 'reinforced door', vault: d.code === 'R' }
        : d.code === 'L' ? { build: 'sturdy', locked: true, label: 'locked door' } : {};
      const leaf = (b0, b1, pair, seal) => level.swingDoors.push(new SwingDoor(world, Object.assign({
        plane: d.axis === 'x' ? 'z' : 'x', at, wall: [at - T / 2, at + T / 2], from: b0, to: b1, y0, h: 2.15, pair, seal }, opts)));
      const pair = d.cells.length === 2 ? key + ':' + d.cells[0].join(',') : undefined;
      if (d.cells.length === 1) leaf(a0 + 0.02, a1 - 0.02, undefined, [0.02, 0.02, 0.05]);
      else { leaf(a0 + 0.02, (a0 + a1) / 2 - 0.01, pair, [0.02, 0.01, 0.05, 1]); leaf(a1 - 0.02, (a0 + a1) / 2 + 0.01, pair, [0.02, 0.01, 0.05]); }
    }
    // the furniture (M6.16.0): the map's C squares in clumps, each clump told
    // apart by where it is and the label nearest it - casino_fit.js
    const labels = MAP.labels.filter(([, fl]) => fl === key);
    const n = furnish(kit, key, rows, y0, labels, (x, y) => c(x, y) === 'C' && indoors(x, y) && !kiosk(x, y), wallish, doorList);
    // rooms: names as zones, a ceiling over floor 2's small rooms, lamps
    const inside = insideMask(rows), roomList = rooms(rows, inside).filter((cells) => cells.some(([x, y]) => indoors(x, y)));
    const biggest = roomList.reduce((b, r) => (r.length > b.length ? r : b), []);
    for (const cells of roomList) {
      const lab = labels.find(([tt, , lx, ly]) => /^[A-Z][a-z]/.test(tt) && cells.some(([x, y]) => Math.abs(x - lx) <= 1 && Math.abs(y - ly) <= 1));
      if (lab) {
        // (M6.15.0: a curved room's box spilled into the ramp's band) a zone a row of its squares
        const id = lab[0].toLowerCase().replace(/[^a-z0-9]+/g, '_'), name = 'Casino - ' + lab[0].replace(/Blackjacl/, 'Blackjack').replace(/Sgimming/, 'Swimming');
        const own = new Set(cells.map(([x, y]) => x + ',' + y));
        for (const run of rowRuns(60, 60, (x, y) => (own.has(x + ',' + y) ? 1 : null))) world.addZone([run.x0, y0, run.y], [run.x1, y0 + 3, run.y + 1], id, name);
        const xs = cells.map((p) => p[0]), ys = cells.map((p) => p[1]);
        level.zones[id] = [[Math.min(...xs), y0, Math.min(...ys)], [Math.max(...xs) + 1, y0 + 3, Math.max(...ys) + 1]];
      }
      if (key === '2' && cells !== biggest && cells.length < 400) {
        // (M6.17.0) the ceiling over a small room: its outline as its walls run, not its squares
        const o = roomOutline(cells, 0.55, { cx: CX, cz: CZ, r: RING_FACE + 0.05 });
        if (o) { curve(prism(o, y0 + 3.3, y0 + 3.45, { sheet: 'ceil' }), 'plaster'); solids(outlineBoxes(o, y0 + 3.3, y0 + 3.45, 0.3), 'plaster'); }
      }
    }
    // lamps: a grid over the floor (more spread out where there is less)
    const sp = key === '3' || key === '4' ? 14 : 10.5;
    if (key !== 'RT') for (let lx = CX - 27; lx <= CX + 27; lx += sp) for (let lz = CZ - 27; lz <= CZ + 27; lz += sp) {
      if (Math.hypot(lx - CX, lz - CZ) > R_MID - 2.5) continue;
      const yc = key === '2' ? y0 + 6.9 : NEXT[key] - SLAB;
      let yl = key === '2' && Math.hypot(lx - CX, lz - CZ) > 12 ? y0 + 3.3 : yc;
      if (key === '4' && pointInPoly(lx, lz, poolHole.poly)) yl = C_FLOORS.RT - POOL_SINK - 0.12;     // under the pool's tank
      lights.push({ pos: [lx, yl - 0.4, lz], range: 13, intensity: 1.0, color: [1, 0.9, 0.72] });
      box([lx - 0.5, yl - 0.1, lz - 0.5], [lx + 0.5, yl, lz + 0.5], 'lamp', { solid: false });
    }
    // (M6.17.1, Rhys: "Tournament Room and Businessman's Suite are VERY dark")
    // the grid's lamps fall where they fall: a room off the hall could get
    // none. Every room inside the ring gets its share - a lamp to every thirty
    // squares or so - set out as far from each other (and from any already
    // there) as its floor allows.
    if (key === 'G' || key === '2') {
      const ceil = key === '2' ? y0 + 3.3 : NEXT[key] - SLAB;
      for (const cells of roomList) {
        if (cells === biggest || cells.length >= 400 || cells.some(([x, y]) => rOf(x, y) > R_MID + 0.5)) continue;
        const own = new Set(cells.map(([x, y]) => x + ',' + y));
        const at = lights.filter((l) => l.pos[1] > y0 && l.pos[1] < y0 + 4.5 && own.has(Math.floor(l.pos[0]) + ',' + Math.floor(l.pos[2]))).map((l) => [l.pos[0], l.pos[2]]);
        const want = Math.max(1, Math.round(cells.length / 30)) + (/booth|tournament|vault/i.test(roomName(labels, cells)) ? 1 : 0);
        // squares with floor all round them, where there are any
        const deep = cells.filter(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => own.has((x + dx) + ',' + (y + dy))));
        const pool = (deep.length ? deep : cells).filter(([x, y]) => rOf(x, y) < R_MID - 1.1).map(([x, y]) => [x + 0.5, y + 0.5]);
        if (!pool.length) continue;
        if (!at.length) { const mx = pool.reduce((s, p) => s + p[0], 0) / pool.length, mz = pool.reduce((s, p) => s + p[1], 0) / pool.length; at.push(null); pool.sort((p, q) => Math.hypot(p[0] - mx, p[1] - mz) - Math.hypot(q[0] - mx, q[1] - mz)); }
        let placed = 0;
        while (at.filter(Boolean).length < want && placed < 8) {
          const best = at[0] === null ? pool[0] : pool.reduce((b, p) => { const d = Math.min(...at.map((a) => Math.hypot(p[0] - a[0], p[1] - a[1]))); return d > b[1] ? [p, d] : b; }, [null, -1])[0];
          if (at[0] === null) at.shift();
          if (!best) break;
          at.push(best); placed++;
          lights.push({ pos: [best[0], ceil - 0.45, best[1]], range: 8, intensity: 0.95, color: [1, 0.88, 0.7], room: true });
          box([best[0] - 0.3, ceil - 0.08, best[1] - 0.3], [best[0] + 0.3, ceil, best[1] + 0.3], 'lamp', { solid: false });
        }
      }
    }
    level.navFloors.push({ y: y0, bounds: [-6, -6, 66, 72] });
    floorInfo[key] = { rows, rooms: roomList, cover: n };
  }

  // ── (M6.17.1, Rhys: "we're gonna need to find some C5 before reaching the
  // Poker Tournament Room", and "another dead end ~(6, 8, 32)... either
  // something useful or NOT a dead-end") the nook at the west end of floor 2's
  // gallery: a maintenance store's crates, and on them a case of C5 ──
  {
    const y = C_FLOORS[2];
    box([4.75, y, 28.67], [5.75, y + 0.9, 29.57], 'crate');
    box([4.8, y + 0.9, 28.72], [5.6, y + 1.5, 29.47], 'crate');
    box([5.85, y, 28.72], [6.65, y + 0.6, 29.52], 'crate');
    box([5.98, y + 0.6, 28.9], [6.52, y + 0.74, 29.34], 'hazard', { solid: false });
    const c5 = new Crate('gear', ['C5'], [6.25, y + 0.67, 29.12]);
    c5.label = 'Breaching charges';
    level.crates.push(c5);
    level.c5Crate = c5;
    signs.push({ pos: [6.25, y + 1.75, 28.62], yaw: 0, w: 1.0, h: 0.32, text: 'MAINTENANCE', sub: 'Authorised staff only', col: '#e8b423' });
  }

  // ── the 2A mezzanine: a cross of glass-walled walkways over floor 2's hall ──
  {
    const rows = MAP.floors['2A'], y = C_FLOORS['2A'];
    const walk = new Set(), q = [[29, 29]];
    while (q.length) {
      const [x, z] = q.pop(), k = x + ',' + z;
      if (walk.has(k) || x < 0 || z < 0 || x > 59 || z > 59) continue;
      const code = cellAt(rows, x, z);
      if (code === 'G' || rOf(x, z) > R_MID - 0.6) continue;
      walk.add(k);
      q.push([x + 1, z], [x - 1, z], [x, z + 1], [x, z - 1]);
    }
    const glassAt = (x, z) => cellAt(rows, x, z) === 'G' && rOf(x, z) <= R_MID - 0.6 && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => walk.has((x + dx) + ',' + (z + dz)));
    // (M6.16.0) one deck, its outline the walkways', round holes for the stairs up to it
    const cells = new Set(walk);
    for (let z = 0; z < 60; z++) for (let x = 0; x < 60; x++) if (glassAt(x, z)) cells.add(x + ',' + z);
    deck(kit, cells, y, 0.2, holesFor('2A'), 'wood');
    // the glass either side, waist high
    for (const sg of gridWallSegments(60, 60, (x, z) => (glassAt(x, z) ? 'G' : null), 1)) {
      const [[x0, z0], [x1, z1]] = segmentRect(sg, 0.08);
      box([x0, y, z0], [x1, y + 1.1, z1], 'glass', { glass: true, noClimb: true });
    }
    level.navFloors.push({ y, bounds: [-6, -6, 66, 72] });
    level.mezzanine = walk;
  }

  // ── the spiral stairs (M6.16.0: rebuilt - Rhys: "I like spiral staircases,
  // but I don't like the way they're done") ──
  for (const s of stairs) {
    const st = buildStair(kit, s);
    level.navLinks.push({ a: st.foot, b: st.top });
    s.foot = st.foot; s.top = st.top; s.aEnd = st.aEnd; s.plan = st;
  }
  level.stairs = stairs;
  // (M6.17.6) the ramp, for those who find their way by the nav grid (the
  // Yellows, following you up to the Cash Vault and down and out again): a
  // link from each floor's way onto the ramp to the next floor's, walked
  // along the coil - not straight through the middle wall
  {
    const R = casinoRamp(), keys = ['G', '1', '2', '3', '4', 'RT'];
    const inside = (k, a) => pt(CX, CZ, R_MID - 1.4, a, C_FLOORS[k]);
    let phi = 0;
    for (let i = 0; i + 1 < keys.length; i++) {
      const k0 = keys[i], k1 = keys[i + 1], a0 = ACCESS[k0], a1 = ACCESS[k1];
      const p0 = i === 0 ? 0 : phi, p1 = R.phiAtHeight(C_FLOORS[k1], p0 + 0.5);
      const via = [pt(CX, CZ, R_MID + 0.6, a0, C_FLOORS[k0])];
      const n = Math.max(2, Math.ceil((p1 - p0) * RMID_ / 2.5));
      for (let j = 0; j <= n; j++) { const ph = p0 + (p1 - p0) * j / n; via.push(pt(CX, CZ, RMID_, R.thetaOf(ph), R.heightAt(ph))); }
      via.push(pt(CX, CZ, R_MID + 0.6, a1, C_FLOORS[k1]));
      level.navLinks.push({ a: inside(k0, a0), b: inside(k1, a1), via, ramp: true });
      phi = p1;
    }
  }

  // ── the roof terrace's pool: raised, glass-sided, the shape on the map ──
  // (M6.16.0, Rhys: "the ladders into the rooftop pool are blocked by the
  // glass surround" - the map's glass round the pool had been built as a
  // wall two and a half metres high, a metre outside the pool's own. The glass
  // is the pool's side now, and the ladders go up and over it.)
  {
    const y = C_FLOORS.RT;
    const pool = glassPool(kit, poolCells, poolLadders, y, 1.3, drawLadder, POOL_SINK);
    level.pool = Object.assign(pool, { y, depth: 1.3 + POOL_SINK });
    const xs = pool.loop.map((p) => p[0]), zs = pool.loop.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
    for (const [lx, lz] of [[x0 - 3, z0 - 3], [x1 + 3, z0 - 3], [x0 - 3, z1 + 3], [x1 + 3, z1 + 3], [CX - 18, CZ], [CX + 18, CZ]]) {
      lights.push({ pos: [lx, y + 3, lz], range: 12, intensity: 0.9, color: [0.85, 0.9, 1] });
      box([lx - 0.06, y, lz - 0.06], [lx + 0.06, y + 3, lz + 0.06], 'metal');
      box([lx - 0.2, y + 3, lz - 0.2], [lx + 0.2, y + 3.25, lz + 0.2], 'lamp', { solid: false });
    }
  }

  // ── where you come in: the plaza, south, facing the doors ──
  // (M6.17.0, Rhys: "the Withdraw point seems very far from the actual Jeep")
  // you start beside the jeep and leave from it
  const sp = [JEEP_AT[0] - 3.4, 0, JEEP_AT[2] - 1.6];
  world.spawn = { pos: sp, yaw: 0 };
  level.apcZone = { x0: JEEP_AT[0] - 5.5, x1: JEEP_AT[0] + 5.5, z0: JEEP_AT[2] - 4, z1: JEEP_AT[2] + 3.5, pos: sp.slice() };
  level.settledHint = 'Nothing more to do here. Back to the jeep, out by the main doors, to extract.';
  world.addZone([sp[0] - 6, 0, sp[2] - 4], [sp[0] + 6, 3, sp[2] + 6], 'plaza', 'Casino - the plaza');
  world.addZone([CX - 30, 0, CZ - 30], [CX + 30, 30, CZ + 30], 'casino', 'Casino');
  casinoReds(level);
  hangDoors(world, level.swingDoors);
  level.floorInfo = floorInfo;
  return level;
}

// ── the front (M6.17.0, Rhys: "some actual nice frontage and some front
// doors to the Casino would be, well, nice") ──
// Glass double doors; a curved canopy edged in light on brass columns; the
// name in lights over it; a red carpet between brass posts and ropes; planters;
// lamps under the canopy. And round the north side, the staff door: a little
// canopy, a lamp, a sign.
// ── the name over the door (M6.17.13): big red letters, Las Vegas style ──
// Each letter on a 5 x 7 grid, from strokes [x0, y0, x1, y1]; u metres a square.
export const LETTERS = {
  C: [[0, 0, 1, 7], [0, 6, 5, 7], [0, 0, 5, 1]],
  A: [[0, 0, 1, 6], [4, 0, 5, 6], [0, 6, 5, 7], [1, 3, 4, 4]],
  S: [[0, 6, 5, 7], [0, 3, 1, 7], [0, 3, 5, 4], [4, 0, 5, 4], [0, 0, 5, 1]],
  I: [[1.75, 0, 3.25, 7]],                 // a plain bar: with serifs it read as a T
  N: [[0, 0, 1, 7], [4, 0, 5, 7], [1, 4.4, 2, 6.4], [2, 2.6, 3, 4.6], [3, 0.6, 4, 2.6]],
  O: [[0, 0, 1, 7], [4, 0, 5, 7], [1, 6, 4, 7], [1, 0, 4, 1]],
};
function casinoLetters(level, kit, zf, y0) {
  const { box } = kit, word = 'CASINO', u = 0.3, w = 5 * u, gap = 0.4, depth = 0.22;
  const total = word.length * w + (word.length - 1) * gap, red = [1, 0.07, 0.05], body = [0.3, 0.02, 0.02], bulb = [1, 0.85, 0.55];
  level.casinoSign = { letters: [], bulbs: 0, z: zf, y0, width: total };
  // a steel rail along the canopy for them to stand on
  box([CX - total / 2 - 0.2, y0 - 0.03, zf - depth / 2 - 0.05], [CX + total / 2 + 0.2, y0 + 0.05, zf + depth / 2 + 0.05], 'metal', { solid: false, tint: [0.25, 0.25, 0.27] });
  [...word].forEach((ch, i) => {
    const x0 = CX - total / 2 + i * (w + gap);
    for (const [a, b, c, d] of LETTERS[ch]) {
      const mn = [x0 + a * u, y0 + 0.05 + b * u, zf - depth / 2], mx = [x0 + c * u, y0 + 0.05 + d * u, zf + depth / 2];
      box(mn, mx, 'paint', { solid: false, tint: body });
      box([mn[0] + 0.02, mn[1] + 0.02, mx[2]], [mx[0] - 0.02, mx[1] - 0.02, mx[2] + 0.015], 'neon', { solid: false, tint: red.map((v) => v * 0.6) });
      // bulbs down the middle of the stroke, a hand's width apart
      const long = (c - a) >= (d - b), len = (long ? c - a : d - b) * u, n = Math.max(1, Math.round(len / 0.22));
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n, bx = long ? mn[0] + (mx[0] - mn[0]) * t : (mn[0] + mx[0]) / 2, by = long ? (mn[1] + mx[1]) / 2 : mn[1] + (mx[1] - mn[1]) * t;
        box([bx - 0.03, by - 0.03, mx[2] + 0.015], [bx + 0.03, by + 0.03, mx[2] + 0.05], 'neon', { solid: false, tint: bulb });
        level.casinoSign.bulbs++;
      }
    }
    level.casinoSign.letters.push(ch);
    // a pair of stays behind each letter, down to the canopy
    for (const sx of [0.3, w - 0.3]) box([x0 + sx - 0.02, y0, zf - depth / 2 - 0.25], [x0 + sx + 0.02, y0 + 7 * u * 0.8, zf - depth / 2 - 0.21], 'metal', { solid: false, tint: [0.2, 0.2, 0.22] });
  });
  // its red glow on the canopy and the plaza
  level.lights.push({ pos: [CX, y0 + 0.6, zf + 1.6], range: 6, intensity: 0.7, color: [1, 0.2, 0.14], noFill: true });
}

function frontage(level, kit) {
  const { box, curve, world } = kit, z = CZ + R_OUT;
  const leaf = (from, to, pair, seal) => level.swingDoors.push(new SwingDoor(world, { plane: 'z', at: z, wall: [z - 0.2, z + 0.2], from, to, y0: 0, h: 2.25, pair, seal, mat: 'glass', label: 'glass door', thick: 0.05 }));
  leaf(CX - 1.58, CX - 0.01, 'casino:front', [0.02, 0.01, 0.05, 1]);
  leaf(CX + 1.58, CX + 0.01, 'casino:front', [0.02, 0.01, 0.05]);
  // the canopy: a slice of a ring, standing out from the wall
  const a0 = Math.PI / 2 - 0.2, a1 = Math.PI / 2 + 0.2, rA = R_OUT + 0.15, rB = R_OUT + 3.4;
  const arc = (r, n) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([CX + Math.cos(a) * r, CZ + Math.sin(a) * r]); } return o; };
  const slab = arc(rB, 24).concat(arc(rA, 24).reverse());
  curve(prism(slab, 3.05, 3.35, { sheet: 'canopy' }), 'cladding');
  curve(polySides(arc(rB + 0.01, 24), 3.08, 3.18, { open: true, sheet: 'glow' }), 'neon', { tint: [1, 0.78, 0.4] });
  kit.solids(outlineBoxes(slab, 3.05, 3.35, 0.3), 'canopy');
  for (const a of [a0 + 0.03, a1 - 0.03]) {
    const p = [CX + Math.cos(a) * (rB - 0.3), CZ + Math.sin(a) * (rB - 0.3)];
    curve(cylinder(p[0], p[1], 0.16, 0, 3.05, 14), 'metal', { tint: TINT.brass });
    world.addSolid([p[0] - 0.16, 0, p[1] - 0.16], [p[0] + 0.16, 3.05, p[1] + 0.16], 'metal');
    // a planter beside each
    const q = [p[0] + (a < Math.PI / 2 ? 1.1 : -1.1), p[1]];
    curve(cylinder(q[0], q[1], 0.55, 0, 0.7, 18), 'concrete2');
    curve(cylinder(q[0], q[1], 0.5, 0.7, 1.25, 14), 'hedge');
    world.addSolid([q[0] - 0.55, 0, q[1] - 0.55], [q[0] + 0.55, 1.25, q[1] + 0.55], 'planter');
  }
  for (const [dx, dz] of [[-1.6, 1.2], [1.6, 1.2], [-1.6, 2.6], [1.6, 2.6]]) {
    box([CX + dx - 0.2, 2.98, z + dz - 0.2], [CX + dx + 0.2, 3.05, z + dz + 0.2], 'lamp', { solid: false });
  }
  level.lights.push({ pos: [CX, 2.6, z + 1.8], range: 10, intensity: 1.0, color: [1, 0.85, 0.62] });
  // the name, in lights, over the canopy
  // (M6.17.13, Rhys: "I thought you said the 'CASINO' sign would be made out of Big Red Las
  // Vegas Lettering?") - it is now: six letters standing on the canopy, red neon faces on
  // deep red bodies, and a run of bulbs down every stroke
  casinoLetters(level, kit, z + 1.2, 3.38);
  // (M6.17.1, Rhys: "Didn't see Casino's frontal illuminations very clearly")
  // the building lit up at night: uplighters round its foot washing the stone
  // with light, a band of light round the top, and strips of it up the front
  // either side of the doors (in the solid strips between the windows)
  const top = C_FLOORS.RT, rf = R_OUT + T_OUT / 2;
  level.facadeLights = [];
  for (let k = 0; k < 16; k++) {
    const a = Math.PI / 2 + TAU * (k + 0.5) / 16;
    if (Math.abs(wrap(a - Math.PI / 2)) < 0.3) continue;                      // the canopy's own lamps light the doors
    const [ux, uz] = [CX + Math.cos(a) * (R_OUT + 0.9), CZ + Math.sin(a) * (R_OUT + 0.9)];
    curve(cylinder(ux, uz, 0.16, 0, 0.12, 12), 'metal', { tint: [0.2, 0.2, 0.22] });
    box([ux - 0.1, 0.12, uz - 0.1], [ux + 0.1, 0.15, uz + 0.1], 'lamp', { solid: false });
    level.lights.push({ pos: [CX + Math.cos(a) * (R_OUT + 1.1), 1.2, CZ + Math.sin(a) * (R_OUT + 1.1)], range: 9, intensity: 1.3, color: [1, 0.86, 0.6], noFill: true });
    level.facadeLights.push(a);
  }
  curve(polySides(circlePts(CX, CZ, rf + 0.05, 160), top - 0.42, top - 0.34, { sheet: 'crown' }), 'neon', { tint: [1, 0.8, 0.45] });
  curve(polySides(circlePts(CX, CZ, rf + 0.05, 160), top + 0.02, top + 0.07, { sheet: 'crown2' }), 'neon', { tint: [1, 0.8, 0.45] });
  level.facadeStrips = [];
  for (const off of [-0.62, -0.42, 0.42, 0.62]) {
    // the nearest solid strip (not one with windows in it)
    let j = Math.round((Math.PI / 2 + off) / TAU * WIN.strips);
    while (j % WIN.every !== WIN.wide + 1) j++;
    const a = TAU * (j + 0.5) / WIN.strips, sx = CX + Math.cos(a) * (rf + 0.04), sz = CZ + Math.sin(a) * (rf + 0.04);
    box([sx - 0.05, 0.6, sz - 0.05], [sx + 0.05, top - 0.5, sz + 0.05], 'neon', { solid: false, tint: [1, 0.8, 0.45] });
    level.facadeStrips.push(a);
  }
  // the red carpet, the posts and ropes along it
  const zc0 = z + 0.25, zc1 = STREET.plaza[3] - 0.05;
  box([CX - 1.3, 0.02, zc0], [CX + 1.3, 0.035, zc1], 'paint', { solid: false, tint: [0.42, 0.05, 0.06] });
  for (const sx of [-1.65, 1.65]) {
    const posts = [];
    for (let pz = zc0 + 1.6; pz < zc1 - 0.3; pz += 1.4) posts.push(pz);
    for (const pz of posts) {
      curve([...cylinder(CX + sx, pz, 0.04, 0, 0.9, 8), ...cylinder(CX + sx, pz, 0.15, 0, 0.04, 10)], 'metal', { tint: TINT.brass });
    }
    for (let i = 0; i + 1 < posts.length; i++) {
      const sag = [];
      for (let k = 0; k <= 6; k++) { const t = k / 6; sag.push([CX + sx, 0.84 - Math.sin(t * Math.PI) * 0.12, posts[i] + (posts[i + 1] - posts[i]) * t]); }
      curve(sweep(sag, 0.035, 0.035), 'paint', { tint: [0.5, 0.06, 0.08] });
    }
    world.addSolid([CX + sx - 0.05, 0, posts[0]], [CX + sx + 0.05, 0.9, posts[posts.length - 1]], 'rope', { shootThrough: true });
  }
  // the staff door, round the north side
  const sd = level.outerDoors.find((d) => d.id === 'staff'), sa = sd.a;
  const out = (r, da) => [CX + Math.cos(sa + da) * r, CZ + Math.sin(sa + da) * r];
  const can = [out(R_OUT + 1.3, -0.04), out(R_OUT + 1.3, 0.04), out(R_OUT + 0.15, 0.04), out(R_OUT + 0.15, -0.04)];
  curve(prism(can, 2.3, 2.42, { sheet: 'staffcan' }), 'metal');
  const lp = out(R_OUT + 0.6, 0);
  box([lp[0] - 0.12, 2.24, lp[1] - 0.12], [lp[0] + 0.12, 2.3, lp[1] + 0.12], 'lamp', { solid: false });
  // its leaf: a plain steel door, opening outwards
  level.swingDoors.push(new SwingDoor(world, { plane: 'z', at: CZ - R_OUT, wall: [CZ - R_OUT - 0.2, CZ - R_OUT + 0.2], from: CX - 0.68, to: CX + 0.68, y0: 0, h: 2.0, mat: 'metal', label: 'staff door', build: 'sturdy', thick: 0.05 }));
  level.staffDoor = level.swingDoors[level.swingDoors.length - 1];
  // and, inside, at the dead end where the ramp's base comes down to the floor:
  // the staff's lockers - and a box of pistol rounds on the bench (Rhys, M6.17.0: "something there")
  {
    const phi = level.rampFill[1] + 1.7 / RMID_, a = wrap(casinoRamp().thetaOf(phi));
    const lk = (r, w, h, mat, solid) => { const p = pt(CX, CZ, r, a, 0); box([p[0] - w, 0, p[2] - w], [p[0] + w, h, p[2] + w], mat, { solid }); return p; };
    const b = pt(CX, CZ, RMID_, a, 0);
    box([b[0] - 0.45, 0, b[2] - 0.45], [b[0] + 0.45, 0.45, b[2] + 0.45], 'wood');
    box([b[0] - 0.14, 0.45, b[2] - 0.1], [b[0] + 0.14, 0.58, b[2] + 0.1], 'hazard', { solid: false });
    const c = new Crate('gear', ['AMMO_PISTOL', 'AMMO_PISTOL'], [b[0], 0.52, b[2]]);
    c.label = 'Pistol rounds';
    level.crates.push(c);
    level.staffAmmo = c;
    lk(BAND[1] - 0.35, 0.3, 1.9, 'metal', true);
    level.lights.push({ pos: [b[0], 1.9, b[2]], range: 6, intensity: 0.6, color: [0.9, 0.95, 1], noFill: true });
  }
  const sgp = out(R_OUT + 0.22, 0.045);
  level.signs.push({ pos: [sgp[0], 1.7, sgp[1]], yaw: Math.atan2(Math.cos(sa), Math.sin(sa)), w: 0.6, h: 0.28, text: 'STAFF', sub: 'No entry', col: '#c9d4d8' });
}

// ── the neighbourhood (M6.16.0) ──
export const STREET = { plaza: [-6, -6, 66, 64], road: 10, pave: 3, block: 18 };
function neighbourhood(level, box) {
  const world = level.world, [px0, pz0, px1, pz1] = STREET.plaza, R = STREET.road, P = STREET.pave, B = STREET.block;
  // the outer edge of the roads, of the pavements, of the blocks
  const r0 = [px0 - R, pz0 - R, px1 + R, pz1 + R], p0 = [r0[0] - P, r0[1] - P, r0[2] + P, r0[3] + P], b0 = [p0[0] - B, p0[1] - B, p0[2] + B, p0[3] + B];
  level.street = { plaza: STREET.plaza, road: r0, pave: p0, blocks: b0 };
  box([b0[0] - 4, -1, b0[1] - 4], [b0[2] + 4, 0, b0[3] + 4], 'concrete');                  // the ground
  // the plaza's paving: round the building, not inside it (it had covered the gaming floor's carpet)
  level.pieces.push(Object.assign({ quads: flatPoly(rectPts((px0 + px1) / 2, (pz0 + pz1) / 2, px1 - px0, pz1 - pz0, 0), [circlePts(CX, CZ, R_OUT, 120)], 0.02, true), mat: 'concrete2', uv: 'world' }, { min: [px0, 0.02, pz0], max: [px1, 0.02, pz1] }));
  // the roads, and their markings: a dashed white line round the middle
  for (const [a, b] of [[[r0[0], r0[1]], [r0[2], pz0]], [[r0[0], pz1], [r0[2], r0[3]]], [[r0[0], pz0], [px0, pz1]], [[px1, pz0], [r0[2], pz1]]]) box([a[0], 0, a[1]], [b[0], 0.012, b[1]], 'asphalt', { solid: false });
  const dash = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / 6); for (let i = 0; i < n; i++) { const t0 = (i * 6 + 1) / L, t1 = (i * 6 + 4) / L; const ax = x0 + (x1 - x0) * t0, az = z0 + (z1 - z0) * t0, bx = x0 + (x1 - x0) * t1, bz = z0 + (z1 - z0) * t1; box([Math.min(ax, bx) - 0.07, 0.013, Math.min(az, bz) - 0.07], [Math.max(ax, bx) + 0.07, 0.016, Math.max(az, bz) + 0.07], 'paint', { solid: false, tint: [0.9, 0.9, 0.86] }); } };
  const mx0 = px0 - R / 2, mz0 = pz0 - R / 2, mx1 = px1 + R / 2, mz1 = pz1 + R / 2;
  dash(mx0, mz0, mx1, mz0); dash(mx0, mz1, mx1, mz1); dash(mx0, mz0, mx0, mz1); dash(mx1, mz0, mx1, mz1);
  // the pavements: a kerb up from the road, all round
  for (const [a, b] of [[[p0[0], p0[1]], [p0[2], r0[1]]], [[p0[0], r0[3]], [p0[2], p0[3]]], [[p0[0], r0[1]], [r0[0], r0[3]]], [[r0[2], r0[1]], [p0[2], r0[3]]]]) box([a[0], 0, a[1]], [b[0], 0.12, b[1]], 'concrete2');
  // the city's blocks: buildings shoulder to shoulder, lit windows, shops at street level
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // (M6.17.0, Rhys: "lots are samey... one laundry station's sign is
  // half-clipped... the 24HR shops are inaccessible, so they're not really
  // 24HR") every shop different, each sign on the part of its front you can
  // see from the street, and the shops shut for the night: a low glow behind
  // the windows, a dark door
  const SHOPS = [['THE GILDED LILY', '#e8b423'], ['NOODLE BAR', '#e05050'], ['PAWNBROKER', '#4ab0e0'], ['TAILOR', '#c0a0e0'], ['CAFE ROMA', '#e8b423'],
    ['BOOKSHOP', '#c0a0e0'], ['LAUNDERETTE', '#4ab0e0'], ['PHARMACY', '#60d070'], ['MINICABS', '#e8b423'], ['KEBAB HOUSE', '#e05050'],
    ['FLORIST', '#e070b0'], ['JEWELLERS', '#e8d070'], ['BARBER', '#4ab0e0'], ['BAKERY', '#e8b423'], ['WINE BAR', '#a03050'],
    ['OPTICIAN', '#60c0d0'], ['TOBACCONIST', '#c08040'], ['BUREAU DE CHANGE', '#60d070'], ['NAIL BAR', '#e070b0'], ['RECORDS', '#c0a0e0'],
    ['DELI', '#e05050'], ['ESTATE AGENT', '#4ab0e0'], ['BOOKMAKER', '#60d070'], ['PIZZERIA', '#e05050'], ['HARDWARE', '#e8b423'], ['TEA ROOMS', '#c08040']];
  let shop = 0;
  level.shopSigns = [];
  const side = (x0, z0, x1, z1, face, span) => {
    // face: which way the fronts look (towards the casino): [fx, fz]; span: the stretch of street in front
    const alongX = Math.abs(face[1]) > 0, len = alongX ? x1 - x0 : z1 - z0;
    let t = 0;
    while (t < len - 0.01) {
      let w = 9 + rnd() * 9; if (len - t - w < 7) w = len - t;
      const h = 9 + Math.floor(rnd() * 8) * 3.6;
      const a = alongX ? [x0 + t, z0] : [x0, z0 + t], b = alongX ? [x0 + t + w, z1] : [x1, z0 + t + w];
      box([a[0], 0, a[1]], [b[0], h, b[1]], 'facade', { noClimb: true });
      box([a[0] - 0.2, h, a[1] - 0.2], [b[0] + 0.2, h + 0.4, b[1] + 0.2], 'concrete2', { noClimb: true });
      // the shopfront, on what of the front faces the street
      const fx = face[0], fz = face[1], frontX = fx > 0 ? b[0] : fx < 0 ? a[0] : null, frontZ = fz > 0 ? b[1] : fz < 0 ? a[1] : null;
      const s0 = Math.max(alongX ? a[0] : a[1], span[0]), s1 = Math.min(alongX ? b[0] : b[1], span[1]), vis = s1 - s0;
      if (vis > 6 && shop < SHOPS.length && rnd() < 0.85) {
        const [txt, col] = SHOPS[shop++];
        const m = (s0 + s1) / 2, mid = alongX ? [m, frontZ + fz * 0.05] : [frontX + fx * 0.05, m];
        const sw = Math.min(vis - 2, 5);
        level.signs.push({ pos: [mid[0], 3.4, mid[1]], yaw: fz > 0 ? 0 : fz < 0 ? Math.PI : fx > 0 ? Math.PI / 2 : -Math.PI / 2, w: sw, h: 0.8, text: txt, sub: '', col });
        level.shopSigns.push({ text: txt, from: m - sw / 2, to: m + sw / 2, span: [s0, s1] });
        const ww = Math.min(vis - 2.5, 7), glow = [0.2, 0.15, 0.09];
        const pane = (u0, u1, y0, y1, mat, tint) => {
          if (alongX) box([u0, y0, frontZ + (fz > 0 ? 0 : -0.05)], [u1, y1, frontZ + (fz > 0 ? 0.05 : 0)], mat, { solid: false, tint });
          else box([frontX + (fx > 0 ? 0 : -0.05), y0, u0], [frontX + (fx > 0 ? 0.05 : 0), y1, u1], mat, { solid: false, tint });
        };
        pane(m - ww / 2, m - 0.7, 0.6, 2.7, 'neon', glow);
        pane(m + 0.7, m + ww / 2, 0.6, 2.7, 'neon', glow);
        pane(m - 0.65, m + 0.65, 0, 2.3, 'paint', [0.1, 0.09, 0.08]);              // the door, shut
        for (const u of [m - ww / 2, m - 0.7, m + 0.7, m + ww / 2, m - (ww / 2 + 0.7) / 2, m + (ww / 2 + 0.7) / 2]) pane(u - 0.04, u + 0.04, 0.55, 2.75, 'metal', [0.25, 0.25, 0.27]);
      }
      t += w;
    }
  };
  // north and south sides run the whole width (their corners included); west and east between them
  side(b0[0], b0[1], b0[2], p0[1], [0, 1], [p0[0], p0[2]]);
  side(b0[0], p0[3], b0[2], b0[3], [0, -1], [p0[0], p0[2]]);
  side(b0[0], p0[1], p0[0], p0[3], [1, 0], [p0[1], p0[3]]);
  side(p0[2], p0[1], b0[2], p0[3], [-1, 0], [p0[1], p0[3]]);
  // street lamps along the pavements, facing the road (their heads glow; the plaza's own lamps light it)
  const lamp = (x, z) => {
    box([x - 0.07, 0.12, z - 0.07], [x + 0.07, 6, z + 0.07], 'metal', { noClimb: true });
    box([x - 0.25, 5.85, z - 0.25], [x + 0.25, 6.05, z + 0.25], 'lamp', { solid: false });
  };
  for (let x = p0[0] + 6; x < p0[2] - 3; x += 16) { lamp(x, r0[1] - 0.6); lamp(x, r0[3] + 0.6); }
  for (let z = r0[1] + 10; z < r0[3] - 5; z += 16) { lamp(r0[0] - 0.6, z); lamp(r0[2] + 0.6, z); }
  // round the plaza: bollards, so no car drives onto it, and lamps that do light it
  for (let x = px0 + 2; x < px1; x += 4) for (const z of [pz0 + 0.3, pz1 - 0.3]) if (Math.abs(x - 30) > 6) box([x - 0.12, 0, z - 0.12], [x + 0.12, 0.9, z + 0.12], 'metal');
  for (const [x, z] of [[2, 62], [58, 62], [2, -3], [58, -3], [-3, 30], [63, 30]]) {
    box([x - 0.08, 0, z - 0.08], [x + 0.08, 4.5, z + 0.08], 'metal', { noClimb: true });
    box([x - 0.22, 4.4, z - 0.22], [x + 0.22, 4.6, z + 0.22], 'lamp', { solid: false });
    level.lights.push({ pos: [x, 4.2, z], range: 16, intensity: 0.8, color: [1, 0.85, 0.62], noFill: true });
  }
  // cars parked along the far kerb; the Ghost jeep by the plaza, where you start
  const parked = [[18, r0[3] - 1.2, 1], [52, r0[3] - 1.2, -1], [r0[0] + 1.2, 12, 0], [r0[2] - 1.2, 44, 0], [8, r0[1] + 1.2, -1]];
  const paints = ['white', 'red', 'sand', 'white', 'red'];
  parked.forEach(([x, z, back], i) => {
    const alongX = back !== 0;
    level.vehicles.push({ type: 'lightUtility', pos: [x, 0, z], yaw: alongX ? back * 90 : (x < 30 ? 0 : 180), paint: paints[i] });
    if (alongX) world.addSolid([x - 2.4, 0, z - 1.0], [x + 2.4, 1.9, z + 1.0], 'car');
    else world.addSolid([x - 1.0, 0, z - 2.4], [x + 1.0, 1.9, z + 2.4], 'car');
  });
  const jeep = JEEP_AT;                                   // (M6.17.0) by the main doors: where you start, and where you leave
  level.vehicles.push({ type: 'armouredJeep', pos: jeep, yaw: 90, paint: 'ghost' });
  world.addSolid([jeep[0] - 2.6, 0, jeep[2] - 1.1], [jeep[0] + 2.6, 1.95, jeep[2] + 1.1], 'jeep');
}

// ── the furniture of one floor (M6.16.0) ──
const GAMES = [[/poker|tournament/i, 'poker'], [/roulette/i, 'roulette'], [/blackjac/i, 'blackjack'], [/baccarat/i, 'baccarat'], [/craps/i, 'craps']];
function furnish(kit, key, rows, y0, labels, isC, wallish, doorList) {
  const level = kit.level, seen = new Set(), clumps = [];
  for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) {
    if (!isC(x, y) || seen.has(x + ',' + y)) continue;
    const q = [[x, y]], cells = [];
    while (q.length) { const [a, b] = q.pop(); const k = a + ',' + b; if (seen.has(k) || !isC(a, b)) continue; seen.add(k); cells.push([a, b]); q.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]); }
    const xs = cells.map((p) => p[0]), ys = cells.map((p) => p[1]);
    clumps.push({ cells, x0: Math.min(...xs), x1: Math.max(...xs) + 1, z0: Math.min(...ys), z1: Math.max(...ys) + 1 });
  }
  const nearest = (cx, cz, test) => labels.filter((l) => test(l[0])).map((l) => [Math.hypot(l[2] - cx, l[3] - cz), l[0]]).sort((a, b) => a[0] - b[0])[0];
  const out = { tables: [], slots: 0, dining: 0, bars: 0, washrooms: [] }, specs = [];
  kit.chairs = [];                                  // every chair goes in last, where there is room (casino_fit.js placeChairs)
  const ceiling = key === '2' ? y0 + 3.3 : (key === 'RT' ? y0 + 3 : NEXT[key] - SLAB);
  // the ground floor's round bar: the ring of counter round the middle
  if (key === 'G') {
    const ring = clumps.filter((cl) => cl.cells.every(([x, y]) => rOf(x, y) > 3.2 && rOf(x, y) < 6.5));
    if (ring.length) { roundBar(kit, CX, CZ, 4.0, 4.7, y0, ceiling); out.bars++; }
    for (const cl of ring) cl.used = true;
  }
  // the first floor's bar: an arc of counter against the north wall
  if (key === '1') {
    const bar = clumps.filter((cl) => { const L = nearest((cl.x0 + cl.x1) / 2, (cl.z0 + cl.z1) / 2, (t) => /bar/i.test(t)); return L && L[0] < 7 && cl.cells.length < 8; });
    if (bar.length) {
      const pts = bar.flatMap((cl) => cl.cells.map(([x, y]) => [x + 0.5, y + 0.5]));
      const [fx, fz, fr] = fitCircle(pts);
      const angs = pts.map(([x, z]) => Math.atan2(z - fz, x - fx));
      arcBar(kit, fx, fz, fr, Math.min(...angs) - 0.08, Math.max(...angs) + 0.08, y0,
        { cx: CX, cz: CZ, r: R_MID - T_MID / 2 - 0.02, a0: -Math.PI / 2 - (fr + 0.4) / R_MID, a1: -Math.PI / 2 + (fr + 0.4) / R_MID });
      for (const cl of bar) cl.used = true;
      out.bars++;
    }
  }
  for (const cl of clumps) {
    if (cl.used) continue;
    const cx = (cl.x0 + cl.x1) / 2, cz = (cl.z0 + cl.z1) / 2, w = cl.x1 - cl.x0, d = cl.z1 - cl.z0;
    const L = nearest(cx, cz, () => true), Ls = L ? L[1] : '';
    // slot machines: one a square, backed onto the wall beside it
    if (/slo/i.test(Ls) && L[0] < 6) {
      cl.cells.forEach(([x, y], i) => {
        const a = wallish(x - 1, y) ? 0 : wallish(x + 1, y) ? Math.PI : wallish(x, y - 1) ? Math.PI / 2 : wallish(x, y + 1) ? -Math.PI / 2 : Math.atan2(CZ - y - 0.5, CX - x - 0.5);
        const hues = [[1, 0.3, 0.6], [0.3, 0.7, 1], [1, 0.75, 0.2], [0.5, 1, 0.4]];
        slotMachine(kit, x + 0.5 - Math.cos(a) * 0.15, y0, y + 0.5 - Math.sin(a) * 0.15, a, hues[(x + y + i) % 4], (x + y * 5) % 6);     // (M6.17.1) a mix of games, neighbours different
        out.slots++;
      });
      continue;
    }
    // the restaurant's round tables
    if (key === '1') { diningTable(kit, cx, cz, Math.min(1.0, Math.min(w, d) / 2 - 0.9), y0, 6); out.dining++; continue; }
    // a gaming table: its game, from the nearest label naming one
    // (in a room of its own - the Businessman's Booth - a card table: poker)
    const G = L && L[0] < 3.5 && !GAMES.some(([re]) => re.test(Ls)) ? null : nearest(cx, cz, (t) => GAMES.some(([re]) => re.test(t)));
    const kind = G ? GAMES.find(([re]) => re.test(G[1]))[1] : 'poker';
    specs.push({ kind, cx, cz, w: Math.max(w, d), d: Math.min(w, d), rot: w >= d ? 0 : Math.PI / 2, y: y0, face: Math.atan2(CZ - cz, CX - cx) });
  }
  // (M6.17.0, Rhys: the two baccarat tables a little too close) half-moon
  // tables side by side are moved apart until there is room for both rows of chairs
  for (let pass = 0; pass < 4; pass++) for (const a of specs) for (const b of specs) {
    if (a === b || !/blackjack|baccarat/.test(a.kind) || a.kind !== b.kind) continue;
    const need = (a.kind === 'baccarat' ? 1.35 : 1.5) * 2 + 2.0, dx = b.cx - a.cx, dz = b.cz - a.cz, dd = Math.hypot(dx, dz);
    if (dd >= need || dd < 1e-6) continue;
    const push = (need - dd) / 2 / dd;
    a.cx -= dx * push; a.cz -= dz * push; b.cx += dx * push; b.cz += dz * push;
  }
  for (const t of specs) out.tables.push(Object.assign(gamingTable(kit, t), { cx: t.cx, cz: t.cz }));
  // the washrooms
  const inside = insideMask(rows);
  for (const lab of labels.filter((l) => /WC/.test(l[0]))) {
    const room = rooms(rows, inside).find((cells) => cells.some(([x, y]) => Math.abs(x - lab[2]) <= 1 && Math.abs(y - lab[3]) <= 1));
    if (!room) continue;
    const own = new Set(room.map(([x, y]) => x + ',' + y));
    const dr = doorList.find((dd) => dd.cells.some(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => own.has((x + dx) + ',' + (y + dy)))));
    const door = dr ? dr.cells[0] : room[0];
    const placed = washroom(kit, room, door, y0, ceiling - y0, /gent/i.test(lab[0]), [CX, CZ, RING_FACE]);
    out.washrooms.push(Object.assign({ name: lab[0], floor: key }, placed));
  }
  // (M6.17.0) the Quiet Booth's banquette, and the Cash Vault
  for (const lab of labels.filter((l) => /Quiet Booth|Cash Vault/.test(l[0]))) {
    const room = rooms(rows, inside).find((cells) => cells.some(([x, y]) => Math.abs(x - lab[2]) <= 1 && Math.abs(y - lab[3]) <= 1));
    if (!room) continue;
    const own = new Set(room.map(([x, y]) => x + ',' + y));
    const dr = doorList.find((dd) => dd.cells.some(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => own.has((x + dx) + ',' + (y + dy)))));
    const door = dr ? dr.cells[0] : room[0];
    if (/Quiet/.test(lab[0])) out.booth = quietBooth(kit, room, door, y0, [CX, CZ, RING_FACE]);
    else { out.vault = cashVault(kit, room, door, y0, ceiling - y0, [CX, CZ, RING_FACE]); if (out.vault.ledger) level.ledger = { pos: out.vault.ledger, taken: false }; if (out.vault.locket) { level.locket = { pos: out.vault.locket, taken: false, size: out.vault.locketSize }; level.lights.push({ pos: out.vault.locketLamp, range: 3.5, intensity: 1.4, color: [1, 0.9, 0.7], noFill: true }); } }
  }
  out.chairs = placeChairs(kit);
  level.furniture = level.furniture || {};
  level.furniture[key] = out;
  return out;
}
// a circle through points (least squares): [cx, cz, r]
function fitCircle(pts) {
  let sx = 0, sz = 0; for (const [x, z] of pts) { sx += x; sz += z; }
  const mx = sx / pts.length, mz = sz / pts.length;
  let Suu = 0, Svv = 0, Suv = 0, Suuu = 0, Svvv = 0, Suvv = 0, Svuu = 0;
  for (const [x, z] of pts) { const u = x - mx, v = z - mz; Suu += u * u; Svv += v * v; Suv += u * v; Suuu += u * u * u; Svvv += v * v * v; Suvv += u * v * v; Svuu += v * u * u; }
  const a = (Suuu + Suvv) / 2, b = (Svvv + Svuu) / 2, det = Suu * Svv - Suv * Suv;
  const uc = (a * Svv - b * Suv) / det, vc = (b * Suu - a * Suv) / det;
  return [mx + uc, mz + vc, Math.sqrt(uc * uc + vc * vc + (Suu + Svv) / pts.length)];
}

// ── the coil, dressed (M6.17.12, Rhys: "The Coil is a lot of just spiralling corridor...
// I want to keep the Coil, but... it needs something more to it" - and "I do kinda like the
// coil corridor feeling of 'when did we actually ascend?'") ──
// Nothing that counts the climb: a glowing strip along the inner wall, in the colour of the
// floor it climbs to (it changes as you pass a floor's way in, not before); each floor's
// name over its way in; and along each turn something of its own - slot machines, benches
// and planters, a security post before the private floor, pictures, vending machines - low
// against the walls, cover in a fight, and never in the walkway (COIL.clear).
export const COIL = {
  clear: [26.85, 28.45],                 // radii: the walkway down the middle, kept clear (1.6 m, at its narrowest by an item)
  colours: { 1: [1.0, 0.6, 0.15], 2: [0.15, 0.85, 0.8], 3: [0.95, 0.25, 0.65], 4: [0.45, 0.95, 0.35], RT: [0.35, 0.55, 1.0] },
  names: { G: ['GAMING FLOOR', ''], 1: ['LEVEL 1', 'Restaurant & Bar'], 2: ['LEVEL 2', 'Private Rooms'], 3: ['LEVEL 3', ''], 4: ['LEVEL 4', ''], RT: ['ROOF TERRACE', 'Pool'] },
};
const FLOOR_AT = [[4, '1'], [8, '2'], [15.2, '3'], [19.2, '4'], [23.2, 'RT']];
// the floor the coil is climbing to at phi
export function coilFloor(ramp, phi) {
  for (let i = 1; i < RAMP_KEYS.length; i++) if (phi < RAMP_KEYS[i][0] - 1e-6) { const y = Math.max(4, RAMP_KEYS[i][1]); return (FLOOR_AT.find((f) => f[0] >= y - 0.01) || FLOOR_AT[FLOOR_AT.length - 1])[1]; }
  return 'RT';
}
const hexOf = (c) => '#' + c.map((v) => Math.round(Math.min(1, v) * 255).toString(16).padStart(2, '0')).join('');
function coilDressing(level, ramp, kit) {
  const { world, curve } = kit;
  level.coil = { strips: {}, items: [], solids: [] };
  // a wall (not glass, not a person) within 0.3 m beyond radius r, at height y, at angle a: inward (sg -1) or outward (+1)
  const wallAt = (a, r, y, sg) => {
    const o = pt(CX, CZ, r - sg * 0.25, a, y), d = [Math.cos(a) * sg, 0, Math.sin(a) * sg];
    const h = world.raycast(o, d, 0.55, (q) => q.glass || q.person || q.target || q.tag === 'hdoor' || q.tag === 'coil');
    return !!h && (h.solid.tag === 'ring' || h.solid.tag === 'wall');
  };
  // collision for an item turned to rot: a row of short boxes along it, so none bulges into the walkway
  const solidRow = (x, z, w, d, y0, y1, rot) => {
    const n = Math.max(1, Math.ceil(w / 0.4)), c = Math.cos(rot), s = Math.sin(rot);
    for (let i = 0; i < n; i++) {
      const t = -w / 2 + (i + 0.5) * w / n, cx = x + c * t, cz = z + s * t;
      const pts = [[-w / n / 2, -d / 2], [w / n / 2, -d / 2], [w / n / 2, d / 2], [-w / n / 2, d / 2]].map(([u, v]) => [cx + c * u - s * v, cz + s * u + c * v]);
      const xs = pts.map((q) => q[0]), zs = pts.map((q) => q[1]);
      const b = world.addSolid([Math.min(...xs), y0, Math.min(...zs)], [Math.max(...xs), y1, Math.max(...zs)], 'coil');
      level.coil.solids.push(b);
    }
  };
  // ── the strip: 4 cm of light, a metre up the inner wall, where there is wall ──
  const IN = BAND[0] + 0.012, step = 0.4 / BAND[0], byFloor = {};
  for (let phi = 0; phi + step <= ramp.end; phi += step) {
    const a0 = ramp.thetaOf(phi), a1 = ramp.thetaOf(phi + step), y0 = ramp.heightAt(phi), y1 = ramp.heightAt(phi + step);
    if (!wallAt(a0, BAND[0], y0 + 1.07, -1) || !wallAt(a1, BAND[0], y1 + 1.07, -1)) continue;
    const f = coilFloor(ramp, phi + step / 2), am = (a0 + a1) / 2;
    (byFloor[f] = byFloor[f] || []).push({ v: [pt(CX, CZ, IN, a0, y0 + 1.04), pt(CX, CZ, IN, a1, y1 + 1.04), pt(CX, CZ, IN, a1, y1 + 1.09), pt(CX, CZ, IN, a0, y0 + 1.09)], n: [Math.cos(am), 0, Math.sin(am)] });
  }
  for (const [f, q] of Object.entries(byFloor)) {
    level.coil.strips[f] = q.length;
    // (deeper than the colour itself: the neon glows at twice its tint, and paled to white)
    for (let i = 0; i < q.length; i += 120) curve(q.slice(i, i + 120), 'neon', { tint: COIL.colours[f].map((v) => v * 0.42) });
  }
  // ── each floor's name over its way in, on the outer wall, in its colour ──
  for (const key of ['G', '1', '2', '3', '4', 'RT']) {
    const a = ACCESS[key], y = C_FLOORS[key], p = pt(CX, CZ, BAND[1] - 0.03, a, y + 2.62);
    const [text, sub] = COIL.names[key], col = key === 'G' ? '#e8b423' : hexOf(COIL.colours[key]);
    level.signs.push({ pos: p, yaw: Math.atan2(-Math.cos(a), -Math.sin(a)), w: 1.8, h: 0.42, text, sub, col, coil: key });
  }
  // ── what stands along each turn ──
  const away = (a, y, gap) => {
    // clear of every way in from the coil at this height, of the doors out, and of the top's end
    for (const o of level.ringOpenings) if (o.ring === 'middle' && Math.abs(o.y - y) < 1.2 && Math.abs(wrap(a - (o.a0 + o.a1) / 2)) * R_MID < (o.a1 - o.a0) / 2 * R_MID + gap) return false;
    for (const d of level.outerDoors || []) if (y < 2.6 && Math.abs(wrap(a - d.a)) * R_OUT < d.half + gap) return false;
    return true;
  };
  const okIn = (phi, half) => [-half, 0, half].every((t) => { const ph = phi + t / BAND[0], a = ramp.thetaOf(ph), y = ramp.heightAt(ph); return [0.3, 1.0, 1.9].every((h) => wallAt(a, BAND[0], y + h, -1)); });
  const okOut = (phi, half) => [-half, 0, half].every((t) => { const ph = phi + t / BAND[1], a = ramp.thetaOf(ph), y = ramp.heightAt(ph); return [0.25, 0.8].every((h) => wallAt(a, BAND[1], y + h, 1)); });
  const note = (kind, phi, side) => level.coil.items.push({ kind, phi, side, floor: coilFloor(ramp, phi) });
  const bench = (phi) => {
    const a = ramp.thetaOf(phi), y = ramp.heightAt(phi), r = BAND[1] - 0.24, [x, , z] = pt(CX, CZ, r, a, 0), rot = a + Math.PI / 2;
    curve(orientedBox(x, z, 1.4, 0.42, y + 0.4, y + 0.46, rot), 'wood');
    curve(orientedBox(x + Math.cos(a) * 0.17, z + Math.sin(a) * 0.17, 1.4, 0.06, y + 0.46, y + 0.8, rot), 'wood');
    for (const t of [-0.6, 0.6]) curve(orientedBox(x + Math.cos(rot) * t, z + Math.sin(rot) * t, 0.06, 0.38, y, y + 0.4, rot), 'metal', { tint: TINT.black });
    solidRow(x, z, 1.4, 0.42, y, y + 0.46, rot);
    note('bench', phi, 'out');
  };
  const planter = (phi) => {
    const a = ramp.thetaOf(phi), y = ramp.heightAt(phi), [x, , z] = pt(CX, CZ, BAND[1] - 0.32, a, 0);
    curve(cylinder(x, z, 0.27, y, y + 0.55, 12), 'paint', { tint: [0.16, 0.15, 0.17] });
    curve(cylinder(x, z, 0.29, y + 0.55, y + 0.6, 12), 'metal', { tint: TINT.brass });
    for (let k = 0; k < 5; k++) { const b = k * 1.3, rr = k ? 0.14 : 0; curve(orientedBox(x + Math.cos(b) * rr, z + Math.sin(b) * rr, 0.3, 0.3, y + 0.6, y + 0.8 + (k % 3) * 0.08, b), 'hedge'); }
    world.addSolid([x - 0.22, y, z - 0.22], [x + 0.22, y + 0.6, z + 0.22], 'coil');
    note('planter', phi, 'out');
  };
  const slot = (phi, hue, game) => {
    const a = ramp.thetaOf(phi), y = ramp.heightAt(phi), [x, , z] = pt(CX, CZ, BAND[0] + 0.33, a, 0), rot = a + Math.PI / 2, f = [Math.cos(a), Math.sin(a)];
    curve(orientedBox(x, z, 0.7, 0.62, y, y + 0.95, rot), 'paint', { tint: TINT.cabinet });
    curve(orientedBox(x - f[0] * 0.08, z - f[1] * 0.08, 0.7, 0.46, y + 0.95, y + 1.78, rot), 'paint', { tint: TINT.cabinet });
    curve(orientedBox(x + f[0] * 0.2, z + f[1] * 0.2, 0.68, 0.24, y + 0.88, y + 0.97, rot), 'paint', { tint: TINT.black });
    const fx = x + f[0] * 0.152, fz = z + f[1] * 0.152, c = Math.cos(rot), sn = Math.sin(rot), l = [fx - c * 0.31, fz - sn * 0.31], r = [fx + c * 0.31, fz + sn * 0.31];
    curve([{ v: [[l[0], y + 0.98, l[1]], [r[0], y + 0.98, r[1]], [r[0], y + 1.72, r[1]], [l[0], y + 1.72, l[1]]], n: [f[0], 0, f[1]], uv: [[1, 1], [0, 1], [0, 0], [1, 0]] }], ['slotface', 'slotface1', 'slotface4'][game % 3]);
    curve(orientedBox(x - f[0] * 0.08, z - f[1] * 0.08, 0.66, 0.3, y + 1.78, y + 2.0, rot), 'neon', { tint: hue });
    solidRow(x, z, 0.7, 0.62, y, y + 2.0, rot);
    note('slot', phi, 'in');
  };
  const vending = (phi, hue) => {
    const a = ramp.thetaOf(phi), y = ramp.heightAt(phi), [x, , z] = pt(CX, CZ, BAND[0] + 0.36, a, 0), rot = a + Math.PI / 2, f = [Math.cos(a), Math.sin(a)];
    curve(orientedBox(x, z, 0.9, 0.7, y, y + 1.9, rot), 'paint', { tint: [0.12, 0.13, 0.16] });
    curve(orientedBox(x + f[0] * 0.355, z + f[1] * 0.355, 0.7, 0.01, y + 0.5, y + 1.75, rot), 'neon', { tint: hue.map((v) => v * 0.7) });
    curve(orientedBox(x + f[0] * 0.36, z + f[1] * 0.36, 0.5, 0.02, y + 0.12, y + 0.35, rot), 'metal', { tint: TINT.black });
    solidRow(x, z, 0.9, 0.7, y, y + 1.9, rot);
    note('vending', phi, 'in');
  };
  const picture = (phi, k) => {
    const a = ramp.thetaOf(phi), y = ramp.heightAt(phi), [x, , z] = pt(CX, CZ, BAND[0] + 0.02, a, 0), rot = a + Math.PI / 2, f = [Math.cos(a), Math.sin(a)];
    curve(orientedBox(x, z, 1.1, 0.04, y + 1.25, y + 2.05, rot), 'wood', { tint: TINT.brass });
    const c = Math.cos(rot), sn = Math.sin(rot), px = x + f[0] * 0.022, pz = z + f[1] * 0.022, l = [px - c * 0.5, pz - sn * 0.5], r = [px + c * 0.5, pz + sn * 0.5];
    curve([{ v: [[l[0], y + 1.3, l[1]], [r[0], y + 1.3, r[1]], [r[0], y + 2.0, r[1]], [l[0], y + 2.0, l[1]]], n: [f[0], 0, f[1]], uv: k % 2 ? [[1, 1], [0, 1], [0, 0], [1, 0]] : [[0, 1], [1, 1], [1, 0], [0, 0]] }], 'painting');
    note('picture', phi, 'in');
  };
  // the security post on the private floor's stretch, before its way in: a desk, a screen, a chair, a barrier
  const post = (phi) => {
    const a = ramp.thetaOf(phi), y = ramp.heightAt(phi), [x, , z] = pt(CX, CZ, BAND[1] - 0.36, a, 0), rot = a + Math.PI / 2, f = [-Math.cos(a), -Math.sin(a)];
    curve(orientedBox(x, z, 1.6, 0.6, y + 0.74, y + 0.79, rot), 'wood');
    curve(orientedBox(x - f[0] * 0.2, z - f[1] * 0.2, 1.6, 0.06, y, y + 0.74, rot), 'wood');
    curve(orientedBox(x - f[0] * 0.12, z - f[1] * 0.12, 0.5, 0.05, y + 0.82, y + 1.15, rot), 'screen');
    curve(orientedBox(x - f[0] * 0.15, z - f[1] * 0.15, 0.08, 0.08, y + 0.79, y + 0.82, rot), 'metal', { tint: TINT.black });
    solidRow(x, z, 1.6, 0.6, y, y + 0.79, rot);
    // the barrier: from the inner wall, a metre out - waist-high steel, cover
    const b = pt(CX, CZ, BAND[0] + 0.42, a + 0.9 / RMID_, 0);
    curve(orientedBox(b[0], b[2], 0.84, 0.08, y, y + 1.05, a), 'metal', { tint: [0.35, 0.36, 0.38] });
    curve(orientedBox(b[0], b[2], 0.84, 0.12, y + 1.0, y + 1.06, a), 'paint', { tint: [0.85, 0.65, 0.1] });
    solidRow(b[0], b[2], 0.84, 0.08, y, y + 1.05, a);
    // (M6.17.13, Rhys: "the Rooftop Pool is clearly for Guests") staff and VIPs
    level.signs.push({ pos: pt(CX, CZ, BAND[1] - 0.03, a, y + 1.95), yaw: Math.atan2(f[0], f[1]), w: 1.2, h: 0.32, text: 'SECURITY', sub: 'Private floors - staff & VIPs', col: '#d8433a', coil: 'post' });
    level.coil.post = { phi, pos: [x, y, z] };
    // (M6.17.13, Rhys: "Players will now expect to be able to use terminals") its screen can be hacked
    level.terminals = level.terminals || [];
    level.terminals.push({ id: 'security', name: 'the security terminal', pos: [x - f[0] * 0.12, y, z - f[1] * 0.12], time: 6, reveal: 45, done: false });
    note('post', phi, 'out');
  };
  const at = (phi0, phi1, every, fn, ok) => { let k = 0; for (let ph = phi0 + every / RMID_; ph < phi1 - 2 / RMID_; ph += every / RMID_) { const a = ramp.thetaOf(ph), y = ramp.heightAt(ph); if (away(a, y, 3.5) && ok(ph)) fn(ph, k++); } };
  const K = RAMP_KEYS.map((k) => k[0]), end = ramp.end - 3 / RMID_;
  // to the first floor: slot alley, along the inner wall
  at(K[1], K[2], 21, (ph, k) => { slot(ph, COIL.colours[1], k); slot(ph + 0.78 / BAND[0], [1, 0.3, 0.25], k + 1); }, (ph) => okIn(ph, 1.2));
  at(K[0] + 4 / RMID_, K[2], 26, (ph, k) => (k % 2 ? planter(ph) : bench(ph)), (ph) => okOut(ph, 0.8));
  // to the second: benches and planters - and the security post before its way in
  const postPhi = K[3] - 12 / RMID_;
  at(K[2], postPhi - 6 / RMID_, 17, (ph, k) => (k % 2 ? planter(ph) : bench(ph)), (ph) => okOut(ph, 0.8));
  for (let d = 0; d < 8; d++) { const ph = postPhi - d * 0.6 / RMID_; if (okOut(ph, 0.9) && okIn(ph + 0.9 / RMID_, 0.5) && away(ramp.thetaOf(ph), ramp.heightAt(ph), 2)) { post(ph); break; } }
  // to the third (the long climb): pictures on the inner wall, benches and planters on the outer
  at(K[3], K[4], 13, (ph, k) => picture(ph, k), (ph) => okIn(ph, 0.6));
  at(K[3] + 6 / RMID_, K[4], 23, (ph, k) => (k % 2 ? bench(ph) : planter(ph)), (ph) => okOut(ph, 0.8));
  // to the fourth: vending machines and planters
  at(K[4], K[5], 34, (ph) => vending(ph, COIL.colours[4]), (ph) => okIn(ph, 0.6));
  at(K[4] + 8 / RMID_, K[5], 19, (ph) => planter(ph), (ph) => okOut(ph, 0.4));
  // to the roof: planters, a picture or two
  at(K[5], end, 24, (ph) => planter(ph), (ph) => okOut(ph, 0.4));
  at(K[5] + 10 / RMID_, end, 31, (ph, k) => picture(ph, k + 1), (ph) => okIn(ph, 0.6));
}

// ── the outer wall (M6.16.0) ──
// Stone outside, plaster in; its windows climb with the ramp behind it (WIN);
// the main doors south on the ground; a glass balustrade round the roof
// terrace. Drawn a half-metre strip at a time: each strip solid but for its
// windows, their sills and heads sloping with the ramp.
function outerWall(level, ramp, box, curve, solids) {
  const world = level.world, n = WIN.strips, top = C_FLOORS.RT, ro = R_OUT + T_OUT / 2, ri = R_OUT - T_OUT / 2;
  // (M6.17.0) the doors in it: the main doors (south), and - Rhys, at the
  // dead end of the passage under the ramp's first turn, "I'd like
  // *something* there" - a staff door out to the north side of the plaza
  // (M6.17.1, Rhys: "Staff door needs a door") moved round to due north, where
  // the wall runs square to the map and a leaf can hang in it; the ramp is
  // well over head height there
  const DOORS = level.outerDoors = [{ id: 'main', a: Math.PI / 2, half: 1.6, h: 2.3 }, { id: 'staff', a: -Math.PI / 2, half: 0.7, h: 2.0 }];
  const doorAt = (a) => DOORS.find((d) => Math.abs(wrap(a - d.a)) * R_OUT < d.half);
  const door = (a) => !!doorAt(a);
  level.windows = [];
  const outQ = [], inQ = [], glassQ = [], trimQ = [];
  for (let j = 0; j < n; j++) {
    const a0 = TAU * j / n, a1 = TAU * (j + 1) / n, mid = (a0 + a1) / 2, s0 = R_OUT * a0, s1 = R_OUT * a1;
    // the openings in this strip, lowest first: [y at a0, y at a1] for the bottom and the top of each
    const holes = [];
    if (door(mid)) { const dd = doorAt(mid); holes.push([[0, 0], [dd.h, dd.h]]); }
    if (j % WIN.every < WIN.wide) {
      const h0 = ramp.heightsAtTheta(a0), h1 = ramp.heightsAtTheta(a1);
      for (let k = 0; k < Math.min(h0.length, h1.length); k++) {
        // the same turn at both edges (not one strip across the ramp's start)
        if (Math.abs(h0[k].phi - h1[k].phi) > 0.1) continue;
        const lo = [h0[k].y + WIN.sill, h1[k].y + WIN.sill], hi = [h0[k].y + WIN.head, h1[k].y + WIN.head];
        if (hi[0] > top - 0.3 || door(mid) || DOORS.some((d) => Math.abs(wrap(mid - d.a)) * R_OUT < d.half + 1.6 && lo[0] < d.h + 1.7)) continue;
        holes.push([lo, hi]);
        if (j % WIN.every === 0) level.windows.push({ a: mid, y: lo[0], phi: h0[k].phi });
      }
    }
    holes.sort((p, q) => p[0][0] - q[0][0]);
    // the solid parts between them
    let y = [0, 0];
    const runs = [];
    for (const [lo, hi] of holes) { if (lo[0] > y[0] + 0.01) runs.push([y, lo]); y = hi; }
    runs.push([y, [top, top]]);
    for (const [b, t] of runs) {
      for (const [r, list, sgn] of [[ro, outQ, 1], [ri, inQ, -1]]) {
        const lm = [[s0, -b[0]], [s1, -b[1]], [s1, -t[1]], [s0, -t[0]]];
        list.push({ v: [pt(CX, CZ, r, a0, b[0]), pt(CX, CZ, r, a1, b[1]), pt(CX, CZ, r, a1, t[1]), pt(CX, CZ, r, a0, t[0])], n: [Math.cos(mid) * sgn, 0, Math.sin(mid) * sgn], lm, uv: lm, sheet: (sgn > 0 ? 'o' : 'i') + Math.floor(s0 / 12) });
      }
    }
    // each opening: its sill and head across the wall's thickness, and a pane in a window
    for (const [lo, hi] of holes) {
      if (lo[0] > 0.01) trimQ.push({ v: [pt(CX, CZ, ri, a0, lo[0]), pt(CX, CZ, ri, a1, lo[1]), pt(CX, CZ, ro, a1, lo[1]), pt(CX, CZ, ro, a0, lo[0])], n: [0, 1, 0] });
      trimQ.push({ v: [pt(CX, CZ, ri, a0, hi[0]), pt(CX, CZ, ri, a1, hi[1]), pt(CX, CZ, ro, a1, hi[1]), pt(CX, CZ, ro, a0, hi[0])], n: [0, -1, 0] });
      if (lo[0] > 0.01) glassQ.push({ v: [pt(CX, CZ, R_OUT, a0, lo[0]), pt(CX, CZ, R_OUT, a1, lo[1]), pt(CX, CZ, R_OUT, a1, hi[1]), pt(CX, CZ, R_OUT, a0, hi[0])], n: [Math.cos(mid), 0, Math.sin(mid)] });
    }
    // the sides of an opening, where a strip with one meets a strip without
    for (const [jj, aa, sg] of [[j - 1, a0, -1], [j + 1, a1, 1]]) {
      const other = ((jj % n) + n) % n;
      const oa = TAU * (other + 0.5) / n;
      // a doorway's sides: where a strip in the doorway meets one that is not
      if (door(mid) && !door(oa)) {
        const hh = doorAt(mid).h;
        trimQ.push({ v: [pt(CX, CZ, ri, aa, 0), pt(CX, CZ, ro, aa, 0), pt(CX, CZ, ro, aa, hh), pt(CX, CZ, ri, aa, hh)], n: [-Math.sin(aa) * -sg, 0, Math.cos(aa) * -sg] });
      }
      if (holes.length && (other % WIN.every < WIN.wide) !== (j % WIN.every < WIN.wide)) {
        for (const [lo, hi] of holes) {
          if (lo[0] < 0.01) continue;
          const yy0 = sg < 0 ? lo[0] : lo[1], yy1 = sg < 0 ? hi[0] : hi[1], tn = [-Math.sin(aa) * -sg, 0, Math.cos(aa) * -sg];
          trimQ.push({ v: [pt(CX, CZ, ri, aa, yy0), pt(CX, CZ, ro, aa, yy0), pt(CX, CZ, ro, aa, yy1), pt(CX, CZ, ri, aa, yy1)], n: tn });
        }
      }
    }
  }
  for (let i = 0; i < outQ.length; i += 120) curve(outQ.slice(i, i + 120), 'cladding');
  for (let i = 0; i < inQ.length; i += 120) curve(inQ.slice(i, i + 120), 'plaster');
  for (let i = 0; i < trimQ.length; i += 150) curve(trimQ.slice(i, i + 150), 'cladding');
  for (let i = 0; i < glassQ.length; i += 150) curve(glassQ.slice(i, i + 150), 'glass');
  // a coping round the top, and the parapet's base under the roof terrace's glass
  curve(arcWallQuads(CX, CZ, R_OUT, T_OUT + 0.08, 0, TAU, top - 0.05, top + 0.12, { noEnds: true, step: 0.8 }), 'cladding');
  // its collision: the whole height, but for the doorway
  // (in pieces a third of a metre long: a box round a longer piece of the curve bulged out
  // of the wall's face - unseen, in the way - where it runs diagonally)
  const cuts = DOORS.map((d) => [d.a - d.half / R_OUT, d.a + d.half / R_OUT, d.h]).sort((p, q) => p[0] - q[0]);
  for (let i = 0; i < cuts.length; i++) {
    const [, b] = cuts[i], next = cuts[(i + 1) % cuts.length][0] + (i + 1 === cuts.length ? TAU : 0);
    solids(arcWallBoxes(CX, CZ, R_OUT, T_OUT, b, next, 0, top, 0.35), 'ring');
    solids(arcWallBoxes(CX, CZ, R_OUT, T_OUT, cuts[i][0], b, cuts[i][2], top, 0.35), 'ring');
    level.ringOpenings.push({ floor: 'G', ring: 'outer', a0: cuts[i][0], a1: b, y: 0 });
  }
  // the roof terrace: a glass balustrade - open, south, where the jumping-off
  // board goes out over the plaza (M6.17.0, the parachute)
  const gap = JUMP.half / R_OUT, j0 = Math.PI / 2 + gap, j1 = Math.PI / 2 - gap + TAU;
  curve(arcWallQuads(CX, CZ, R_OUT, 0.06, j0, j1, top, top + 1.1, { noEnds: true }), 'glass');
  curve(arcWallQuads(CX, CZ, R_OUT, 0.1, j0, j1, top + 1.1, top + 1.16, { noEnds: true }), 'metal');
  solids(arcWallBoxes(CX, CZ, R_OUT, 0.1, j0, j1, top, top + 1.1, 0.6), 'glass', { glass: true, noClimb: true });
}

// The spiral stairs: the second floor up to the mezzanine (in the middle, and at
// the ends of its east and west walkways), and the mezzanine up to the third
// floor (at the ends of its north and south walkways, just inside the ring)
export function casinoStairs() {
  const y2 = C_FLOORS[2], yA = C_FLOORS['2A'], y3 = C_FLOORS[3], r = 1.35;
  // land: the way you step off at the top (the middle one: foot, the side you come to it from)
  return [
    // in the middle, inside its little walled room on the second floor (open to the south), up to the cross of walkways
    { id: 'centre', cx: CX, cz: CZ, rOut: r, y0: y2, y1: yA, foot: Math.PI / 2, fix: 'foot', hole: '2A' },
    // (in the hall, under the walkways' ends: the map's own spots, in the ring of rooms, are where the ramp comes in)
    { id: 'west', cx: 12, cz: 29.5, rOut: r, y0: y2, y1: yA, land: 0, hole: '2A' },
    { id: 'east', cx: 48, cz: 29.5, rOut: r, y0: y2, y1: yA, land: Math.PI, hole: '2A' },
    // (along the walkways, clear of the doorways the ramp comes in by on the third floor)
    { id: 'north', cx: 29.5, cz: 15, rOut: r, y0: yA, y1: y3, land: -Math.PI / 2, hole: '3' },
    { id: 'south', cx: 29.5, cz: 45, rOut: r, y0: yA, y1: y3, land: Math.PI / 2, hole: '3' },
  ];
}

// ── the reds (a placeholder garrison: the map has no guards tab yet) ──
export function casinoRedDefs() {
  const G = C_FLOORS;
  return [
    // the gaming floor: one at each kind of table, one walking round the central bar
    { id: 'C1', pos: [21, G.G, 18.5], rank: 'guard', arms: 'carbine', temper: 'bold' },
    { id: 'C2', pos: [38, G.G, 18.5], rank: 'guard', arms: 'carbine', temper: 'steady' },
    { id: 'C3', pos: [21, G.G, 44], rank: 'guard', arms: 'shotgun', temper: 'bold' },
    { id: 'C4', pos: [41, G.G, 44], rank: 'sergeant', arms: 'carbine', temper: 'steady' },
    { id: 'C5', pos: [30, G.G, 23.5], route: [[24, 24], [36, 24], [36, 36], [24, 36]], rank: 'guard', arms: 'carbine', temper: 'bold' },
    // the first floor: the bar, the restaurant, a walk round
    // (M6.17.5, Rhys: "one guard near the bar who's constantly walking INTO the bar") the
    // patrol's north corner was this man's post, hard by the stools: the one walking it
    // shouldered into him and the stools at every lap. The post is out in the room now,
    // and the corner further off.
    { id: 'C6', pos: [32.5, G[1], 14], rank: 'guard', arms: 'pistol', temper: 'steady' },
    { id: 'C7', pos: [30, G[1], 50], rank: 'guard', arms: 'carbine', temper: 'steady' },
    { id: 'C8', pos: [12, G[1], 30], route: [[12, 30], [28, 16], [48, 30], [30, 48]], rank: 'guard', arms: 'carbine', temper: 'bold' },
    // the second floor: the private room (behind its reinforced doors), the galleries, the hall
    { id: 'C9', pos: [30, G[2], 15], rank: 'officer', arms: 'pistol', temper: 'steady' },
    { id: 'C10', pos: [26, G[2], 13], rank: 'guard', arms: 'shotgun', temper: 'steady' },
    { id: 'C11', pos: [30, G[2], 40], route: [[20, 40], [40, 40]], rank: 'guard', arms: 'carbine', temper: 'bold' },
    // the mezzanine: a marksman over the hall
    // (M6.17.3, Rhys: "can the Guard with the LR7 Marksman have a VX-40 instead") a VX-40
    { id: 'C12', pos: [30, G['2A'], 24], rank: 'specialist', arms: 'dmr', temper: 'steady' },
    // the third floor, and the roof terrace by the pool
    { id: 'C13', pos: [30, G[3], 30], route: [[18, 18], [42, 18], [42, 42], [18, 42]], rank: 'guard', arms: 'carbine', temper: 'bold' },
    { id: 'C14', pos: [17, G.RT, 30], rank: 'sergeant', arms: 'carbine', temper: 'steady' },
    { id: 'C15', pos: [43, G.RT, 30], rank: 'guard', arms: 'carbine', temper: 'steady' },
  ];
}
export const CASINO_REDS = 15;
// (M6.17.5, Rhys) in the Businessman's Suite, the Yellows: the boss with his
// revolver, behind the card table, and two bodyguards by the door. Not against
// you, unless you give them reason; the reds are against you both.
export function casinoYellowDefs() {
  const G = C_FLOORS;
  return [
    { id: 'Y1', name: 'the boss', pos: [30, G.G, 6.3], yaw: Math.PI, rank: 'officer', arms: 'revolver', temper: 'steady', boss: true },
    { id: 'Y2', name: 'bodyguard', pos: [26.4, G.G, 11.4], yaw: Math.PI * 0.9, rank: 'specialist', arms: 'smg', temper: 'steady' },
    { id: 'Y3', name: 'bodyguard', pos: [33.6, G.G, 11.4], yaw: Math.PI * 1.1, rank: 'specialist', arms: 'smg', temper: 'steady' },
  ];
}
export const CASINO_RELATIONS = { red: { you: true, yellow: true }, yellow: { you: false, red: true } };

function casinoReds(level) {
  const world = level.world;
  const fits = (p) => !world.hit([p[0] - GUARD.radius, p[1] + 0.05, p[2] - GUARD.radius], [p[0] + GUARD.radius, p[1] + GUARD.height, p[2] + GUARD.radius]);
  const ground = (p) => { const g = world.groundBelow(p[0], p[1] + 0.4, p[2], 0.1); return g > p[1] - 0.6; };
  const free = (p) => {
    if (fits(p) && ground(p)) return p;
    for (let r = 0.25; r <= 3; r += 0.25) for (let a = 0; a < 16; a++) {
      const q = [p[0] + Math.cos(a / 16 * TAU) * r, p[1], p[2] + Math.sin(a / 16 * TAU) * r];
      if (fits(q) && ground(q)) return q;
    }
    return p;
  };
  const clear = (p, yaw) => { const e = [p[0], p[1] + GUARD.eye, p[2]], d = [-Math.sin(yaw), 0, -Math.cos(yaw)]; const h = world.raycast(e, d, 30, (q) => q.glass); return h ? h.t : 30; };
  for (const d of casinoRedDefs()) {
    const pos = free(d.pos.slice());
    let yaw = 0;
    if (d.route && d.route.length > 1) yaw = Math.atan2(-(d.route[1][0] - pos[0]), -(d.route[1][1] - pos[2]));
    else { let bd = -1; for (let i = 0; i < 8; i++) { const y = i * Math.PI / 4, c = clear(pos, y); if (c > bd) { bd = c; yaw = y; } } }
    const g = new Guard(world, { id: d.id, pos, yaw, route: d.route, faction: 'red', rank: d.rank, arms: d.arms, temper: d.temper });
    g.floorKey = Object.keys(C_FLOORS).find((k) => Math.abs(C_FLOORS[k] - pos[1]) < 0.5) || 'G';
    level.guards.push(g);
  }
  for (const d of casinoYellowDefs()) {
    const pos = free(d.pos.slice());
    const g = new Guard(world, { id: d.id, pos, yaw: d.yaw, faction: 'yellow', rank: d.rank, arms: d.arms, temper: d.temper });
    g.floorKey = 'G'; g.objective = false; g.boss = !!d.boss; g.title = d.name;
    level.guards.push(g);
  }
  level.relations = CASINO_RELATIONS;
  // (M6.17.6) where the Yellows leave, the locket in hand: out of the front door and off along the street
  level.yellowExit = [CX - 10, C_FLOORS.G, CZ + R_OUT + 4.5];
}
