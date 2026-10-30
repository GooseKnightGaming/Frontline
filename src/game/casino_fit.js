// FRONTLINE - the casino's second pass (M6.16.0, Rhys's notes on M6.15.0).
// Its floors, holes, spiral stairs and pool; its walls smoothed out of the
// map's pixel staircases; and its furniture - gaming tables of every kind,
// chairs and stools, the bars, the slot machines, the washrooms.
//
// Everything is built through a kit from level_casino.js:
//   box(min, max, mat, opts)     an axis-aligned box, drawn and/or solid
//   curve(faces, mat, opts)      free-form faces (opts.tint colours them)
//   solids(boxes, tag, opts)     collision only
// Pure: no engine (tested in node).

import { pt, discBoxes, arcWallBoxes } from '../sim/curves.js';
import { circlePts, rectPts, ellipsePts, roundRectPts, flatPoly, polySides, prism, cylinder, orientedBox, outlineBoxes, sweep,
  traceCells, simplify, simplifyLoop, fillet, offsetLoop, polyWallQuads, polyWallBoxes, signedArea, pointInPoly } from '../sim/shapes.js';

const TAU = Math.PI * 2;

// ── a spiral stair ──
// s: { cx, cz, rOut, y0, y1, foot, land } - foot: the angle you come to it
// from; land: the angle you step off at the top, onto its landing. The
// stair turns a little more or less than its usual 26 degrees a step so the
// two come out where they are wanted.
export const STAIR = { rise: 0.2, rPost: 0.11, landing: 0.95, holeGap: 0.3, rail: 0.95, landIn: 0.6, perTurn: 18, postGuard: 0.22, solidIn: 0.36 };
// (M6.16.0) Eighteen steps a turn: a turn climbs 3.6 m, head-room under the
// turn above even close in by the post. A stair is set either by where its
// foot must be (s.fix 'foot': the middle one, in its little walled room open
// to the south) or by where you must step off (the rest: along the walkway).
export function stairPlan(s) {
  const n = Math.ceil((s.y1 - s.y0) / STAIR.rise - 1e-9), h = (s.y1 - s.y0) / n, per = TAU / STAIR.perTurn;
  const a0 = s.fix === 'foot' ? s.foot + 0.8 * per : s.land - STAIR.landing / 2 - n * per;
  const footA = a0 - 0.8 * per, aEnd = a0 + n * per, rHole = s.rOut + STAIR.holeGap;
  return { n, h, per, a0, aEnd, rHole, footA,
    foot: pt(s.cx, s.cz, (STAIR.rPost + s.rOut) / 2 + 0.25, footA, s.y0),
    top: pt(s.cx, s.cz, rHole + 0.6, aEnd + STAIR.landing / 2, s.y1) };
}
export function buildStair(kit, s) {
  const P = stairPlan(s), { n, h, per, a0, aEnd, rHole } = P, rp = STAIR.rPost, ro = s.rOut;
  const treads = [], metal = [], boxes = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + per * i, b = a + per * 1.06, yt = s.y0 + h * (i + 1);
    // the tread: a wedge, its front edge (nosing) a little over the one below
    const outline = [pt(s.cx, s.cz, rp, a, 0), pt(s.cx, s.cz, rp, b, 0)];
    for (let k = 4; k >= 0; k--) outline.push(pt(s.cx, s.cz, ro, a + (b - a) * k / 4, 0));
    treads.push(...prism(outline.map((p) => [p[0], p[2]]), yt - 0.06, yt, { sheet: 't' + i }));
    // collision: small boxes over its wedge (as before: they barely reach the next tread)
    for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) {
      // (M6.17.5) from a little out from the post: in by it every tread meets
      // every other, and a body coming down hung on the corner of one behind
      const ri = STAIR.solidIn, r0 = ri + (ro - ri) * k / 4, r1 = ri + (ro - ri) * (k + 1) / 4, p0 = a + per * j / 3, p1 = a + per * (j + 1) / 3;
      const cs = [pt(s.cx, s.cz, r0, p0, 0), pt(s.cx, s.cz, r0, p1, 0), pt(s.cx, s.cz, r1, p0, 0), pt(s.cx, s.cz, r1, p1, 0)];
      const xs = cs.map((c) => c[0]), zs = cs.map((c) => c[2]);
      boxes.push([[Math.min(...xs), yt - 0.12, Math.min(...zs)], [Math.max(...xs), yt, Math.max(...zs)]]);
    }
    // (M6.17.0, Rhys: "I can still fall off them too easily") the handrail
    // holds you: along each tread's outer edge, waist high
    for (const [mn, mx] of polyWallBoxes([[s.cx + Math.cos(a) * (ro - 0.05), s.cz + Math.sin(a) * (ro - 0.05)], [s.cx + Math.cos(a + per) * (ro - 0.05), s.cz + Math.sin(a + per) * (ro - 0.05)]], 0.08, yt, yt + STAIR.rail + 0.05, 0.2)) kit.world.addSolid(mn, mx, 'rail', { noClimb: true, shootThrough: true });
    // a baluster at its outer edge
    const bp = pt(s.cx, s.cz, ro - 0.06, a + per * 0.5, 0);
    kit.box([bp[0] - 0.015, yt, bp[2] - 0.015], [bp[0] + 0.015, yt + STAIR.rail, bp[2] + 0.015], 'metal', { solid: false });
  }
  kit.curve(treads, 'wood');
  kit.solids(boxes, 'stair');
  // the post, and the handrail and the stringer: helices round the outside
  metal.push(...cylinder(s.cx, s.cz, rp, s.y0, s.y1 + 1.05, 14));
  // (M6.17.5, Rhys: hard to walk DOWN - "if you catch your head") close in by
  // the post the treads above and below crowd one another: there you were
  // lifted onto the one behind you, or met the one over you. A guard round
  // the post keeps you out where a stair is walkable.
  // (a cross of two boxes, near enough round: a square's corners would leave
  // too narrow a way between it and the rail for a body to pass)
  const g = STAIR.postGuard, gw = g * 0.45;
  for (const [hx, hz] of [[g, gw], [gw, g]]) kit.world.addSolid([s.cx - hx, s.y0 + 0.02, s.cz - hz], [s.cx + hx, s.y1 + 1.05, s.cz + hz], 'stairpost', { noClimb: true, shootThrough: true });
  const rail = [], stringer = [];
  for (let t = 0; t <= n * 4; t++) {
    const a = a0 + per * (t / 4 + 0.5), y = s.y0 + h * (t / 4 + 1);
    rail.push(pt(s.cx, s.cz, ro - 0.06, a, y + STAIR.rail));
    stringer.push(pt(s.cx, s.cz, ro + 0.01, a, y - 0.24));
  }
  metal.push(...sweep(rail, 0.06, 0.05), ...sweep(stringer, 0.03, 0.2));
  kit.curve(metal, 'metal');
  // the landing at the top: a slice of the circle, out to the edge of the floor's hole
  // (from a little out from the post: close in, it hung over the heads of
  // those coming up the turn below)
  const land = [];
  for (let k = 0; k <= 6; k++) { const a = aEnd + STAIR.landing * k / 6; land.push([s.cx + Math.cos(a) * rHole, s.cz + Math.sin(a) * rHole]); }
  for (let k = 6; k >= 0; k--) { const a = aEnd + STAIR.landing * k / 6; land.push([s.cx + Math.cos(a) * STAIR.landIn, s.cz + Math.sin(a) * STAIR.landIn]); }
  kit.curve(prism(land, s.y1 - 0.08, s.y1, { sheet: 'land' }), 'wood');
  kit.solids(outlineBoxes(land, s.y1 - 0.12, s.y1, 0.2), 'stair');
  // round the hole, on the floor above: a balustrade, open across the landing
  balustrade(kit, s.cx, s.cz, rHole + 0.05, aEnd + STAIR.landing, aEnd + TAU, s.y1);
  return Object.assign(P, { id: s.id });
}
// a curved railing: posts, a top rail, a bottom rail; it stops you, not a bullet or a look
export function balustrade(kit, cx, cz, r, a0, a1, y) {
  const n = Math.max(2, Math.ceil((a1 - a0) * r / 0.12)), top = [], low = [];
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; top.push(pt(cx, cz, r, a, y + 1.0)); low.push(pt(cx, cz, r, a, y + 0.08)); }
  kit.curve([...sweep(top, 0.06, 0.05), ...sweep(low, 0.04, 0.04)], 'metal');
  const posts = Math.max(2, Math.ceil((a1 - a0) * r / 0.3));
  for (let i = 0; i <= posts; i++) {
    const p = pt(cx, cz, r, a0 + (a1 - a0) * i / posts, 0);
    kit.box([p[0] - 0.015, y + 0.12, p[2] - 0.015], [p[0] + 0.015, y + 1.0, p[2] + 0.015], 'metal', { solid: false });
  }
  const m = Math.max(1, Math.ceil((a1 - a0) * r / 0.4));
  for (let i = 0; i < m; i++) {
    const p = pt(cx, cz, r, a0 + (a1 - a0) * i / m, 0), q = pt(cx, cz, r, a0 + (a1 - a0) * (i + 1) / m, 0);
    kit.world.addSolid([Math.min(p[0], q[0]) - 0.04, y, Math.min(p[2], q[2]) - 0.04], [Math.max(p[0], q[0]) + 0.04, y + 1.05, Math.max(p[2], q[2]) + 0.04], 'rail', { noClimb: true, shootThrough: true });
  }
}

// ── a round floor (M6.16.0) ──
// One face for its top and one for its underside, round holes cut cleanly for
// the stairs, each a single patch in the lightmap. (The wedge tiles it was
// made of came to a point in the middle - the odd spot at (30, y, 30) - and
// lit as a patchwork.) Stood on as strips a quarter of a metre deep.
export function roundFloor(kit, cx, cz, r, y, thick, topMat, holes) {
  holes = holes || [];
  const outline = circlePts(cx, cz, r, 200), cut = holes.map((h) => (h.poly ? h.poly : circlePts(h.cx, h.cz, h.r, 32)));
  kit.curve(flatPoly(outline, cut, y, true), topMat);
  if (thick > 0) {
    kit.curve(flatPoly(outline, cut, y - thick, false), 'plaster');
    for (const c of cut) kit.curve(polySides(c, y - thick, y, { inward: true, sheet: 'hole' }), 'plaster');
    kit.solids(discBoxes(cx, cz, 0, r, y - thick, y, 0.25, holes), 'floor');
  }
}

// ── a deck over a set of map squares (the 2A mezzanine), round holes in it ──
export function deck(kit, cells, y, thick, holes, mat) {
  const loops = traceCells(cells);
  const outer = loops[0], inner = loops.slice(1), cut = holes.map((h) => circlePts(h.cx, h.cz, h.r, 32));
  kit.curve(flatPoly(outer, inner.concat(cut), y, true), mat);
  kit.curve(flatPoly(outer, inner.concat(cut), y - thick, false), 'plaster');
  kit.curve(polySides(outer, y - thick, y, { sheet: 'edge' }), mat);
  for (const c of cut) kit.curve(polySides(c, y - thick, y, { inward: true, sheet: 'hole' }), mat);
  // collision: strips a quarter of a metre deep, the holes left out
  const out = [], res = 0.25;
  let z0 = Infinity, z1 = -Infinity;
  for (const k of cells) { const z = +k.split(',')[1]; z0 = Math.min(z0, z); z1 = Math.max(z1, z + 1); }
  for (let z = z0; z < z1 - 1e-6; z += res) {
    const zc = z + res / 2, row = Math.floor(zc);
    let start = null;
    for (let x = 0; x <= 60; x += res) {
      const xc = x + res / 2;
      const on = x < 60 && cells.has(Math.floor(xc) + ',' + row) && !holes.some((h) => Math.hypot(xc - h.cx, zc - h.cz) < h.r);
      if (on && start === null) start = x;
      if (!on && start !== null) { out.push([[start, y - thick, z], [x, y, z + res]]); start = null; }
    }
  }
  kit.solids(out, 'floor');
}

// ── the roof terrace's pool: raised, glass-sided, the shape Rhys drew ──
// cells: the water's squares (and the ladders' - the map's A). Its glass wall
// runs round the outside of them, smoothed; a ladder up the outside of the
// glass at each A and another down into the water.
// (M6.17.0, Rhys: "it seems very shallow? Can't actually swim in it?") it
// is sunk `sink` metres into the roof as well - a tank hanging into the
// fourth floor's ceiling - so the water is deep enough to swim in.
export function poolShape(cells) {
  const loop = fillet(simplifyLoop(traceCells(cells)[0], 0.75), 0.6, 4, true);
  return { loop, wall: offsetLoop(loop, 0.06), water: offsetLoop(loop, -0.02) };
}
export function glassPool(kit, cells, ladders, y, depth, drawLadder, sink) {
  sink = sink || 0;
  const { wall, water } = poolShape(cells);
  const closed = wall.concat([wall[0]]);
  kit.curve(polyWallQuads(closed, 0.12, y, y + depth, { noEnds: true, noTop: true }), 'glass');
  kit.curve(polyWallQuads(closed, 0.3, y + depth, y + depth + 0.07, { noEnds: true, bottom: true }), 'marble');
  kit.solids(polyWallBoxes(closed, 0.14, y, y + depth + 0.07, 0.4), 'glass', { glass: true, noClimb: true });
  kit.curve(flatPoly(water, null, y - sink + 0.03, true), 'pooltile');
  if (sink > 0) {
    // the sunk part: tiled inside, a plastered tank underneath, seen from the floor below
    kit.curve(polySides(water, y - sink, y, { inward: true, sheet: 'lining' }), 'pooltile');
    kit.curve(prism(wall, y - sink - 0.12, y - 0.3, { top: false, sheet: 'tank' }), 'plaster');
    kit.solids(outlineBoxes(wall, y - sink - 0.12, y - sink + 0.03, 0.25), 'floor');
    kit.solids(polyWallBoxes(wall.concat([wall[0]]), 0.14, y - sink, y, 0.4), 'pooltile');
  }
  const surface = y + depth - 0.15;
  for (const [mn, mx] of outlineBoxes(water, y - sink, surface, 0.25)) kit.world.addWater(mn, mx);
  kit.level.water.push({ poly: water, y: surface });
  // the ladders: each on the straight side nearest its A, in and out
  const placed = [];
  for (const [ax, az] of ladders) {
    // which side of the pool the A is on: the edge of the wall nearest it
    let best = null;
    for (let i = 0; i < wall.length; i++) {
      const p = wall[i], q = wall[(i + 1) % wall.length], dx = q[0] - p[0], dz = q[1] - p[1];
      if (Math.abs(dx) > 1e-6 && Math.abs(dz) > 1e-6) continue;               // only straight, square-on sides
      const along = Math.abs(dx) > 0 ? 'x' : 'z';
      // (M6.17.1, Rhys: the ladders' feet showed through the floor below) a whole
      // ladder's width in from the bend at each end of the side, so all of it is in the sunk tank
      const c = along === 'x' ? [Math.max(Math.min(p[0], q[0]) + 1.0, Math.min(Math.max(p[0], q[0]) - 1.0, ax + 0.5)), p[1]] : [p[0], Math.max(Math.min(p[1], q[1]) + 1.0, Math.min(Math.max(p[1], q[1]) - 1.0, az + 0.5))];
      const d = Math.hypot(c[0] - ax - 0.5, c[1] - az - 0.5);
      if (!best || d < best.d) best = { d, c, along };
    }
    if (!best) continue;
    const [lx, lz] = best.c;
    // facing out from the water
    const inside = pointInPoly(lx + (best.along === 'x' ? 0 : 0.3), lz + (best.along === 'x' ? 0.3 : 0), water);
    const face = best.along === 'x' ? [0, inside ? -1 : 1] : [inside ? -1 : 1, 0];
    const top = y + depth + 0.9;
    for (const [sgn, f] of [[1, face], [-1, [-face[0], -face[1]]]]) {
      // sgn 1: outside, climbing up the glass; -1: inside, down into the water
      const ox = lx + f[0] * 0.08, oz = lz + f[1] * 0.08, foot = sgn > 0 ? y : y - sink + 0.03;
      drawLadder(kit.box, ox, oz, f, foot, top, 'iron');
      const near = [ox, oz], far = [ox + f[0] * 0.8, oz + f[1] * 0.8];
      const mn = [f[0] ? Math.min(near[0], far[0]) : lx - 0.5, foot, f[1] ? Math.min(near[1], far[1]) : lz - 0.5];
      const mx = [f[0] ? Math.max(near[0], far[0]) : lx + 0.5, y + depth + 0.3, f[1] ? Math.max(near[1], far[1]) : lz + 0.5];
      kit.world.addLadder(mn, mx, f);
      placed.push({ pos: [lx, lz], face: f, outside: sgn > 0 });
    }
  }
  return { loop: wall, water, ladders: placed, surface, floor: y - sink };
}

// ── walls, smoothed out of the map's pixel staircases ──
// (M6.16.0, Rhys: "IK I drew them with staggered walls, but the WC blocks and
// other 'internal buildings' need smoothing in.") The map's wall squares are
// joined into lines - corner to corner where they step diagonally - and each
// line, from one junction or door to the next, is straightened where it runs
// straight and rounded where it bends (Douglas-Peucker, then filleted). Doors
// stay square to the grid (a door swings on one axis); the lines end at their
// jambs. A post stands where lines meet. A line with a counter in it (the
// map's C between wall squares: the kiosks) is a counter its whole glazed
// length, a glass screen over it (Rhys: "fill the space with the whole of the
// counter", like the hotel's bar).
//   cellKind(x, y): 'W' | 'G' | 'C' (a counter square in a wall line) | null
//   doors: doorways(rows) - each { axis, cells }
//   ring: { cx, cz, r } - lines that run into the middle wall are carried on to it
export const SMOOTH = { tol: 0.6, fillet: 1.4, seg: 0.45 };
export function wallLines(cellKind, doors, ring) {
  // ring: { cx, cz, r, cell(x, y) } - the middle wall, and its squares on the map
  const key = (x, y) => x + ',' + y;
  const isW = (x, y) => !!cellKind(x, y);
  const nodes = new Map();        // key -> { id, p: [x, z], kind, links: [] }
  for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) if (isW(x, y)) nodes.set(key(x, y), { id: key(x, y), p: [x + 0.5, y + 0.5], kind: cellKind(x, y), links: [], cell: [x, y] });
  const link = (a, b) => { if (!a.links.includes(b)) a.links.push(b); if (!b.links.includes(a)) b.links.push(a); };
  for (const n of nodes.values()) {
    const [x, y] = n.cell;
    if (isW(x + 1, y)) link(n, nodes.get(key(x + 1, y)));
    if (isW(x, y + 1)) link(n, nodes.get(key(x, y + 1)));
    for (const dx of [1, -1]) if (isW(x + dx, y + 1) && !isW(x + dx, y) && !isW(x, y + 1)) link(n, nodes.get(key(x + dx, y + 1)));
  }
  // doors: an anchor at each jamb, joined to the wall squares beside that end
  const doorCells = new Set();
  doors.forEach((d, i) => {
    for (const c of d.cells) doorCells.add(key(c[0], c[1]));
    const first = d.cells[0], last = d.cells[d.cells.length - 1];
    const ends = d.axis === 'x'
      ? [{ p: [first[0], first[1] + 0.5], cell: first, step: [-1, 0] }, { p: [last[0] + 1, last[1] + 0.5], cell: last, step: [1, 0] }]
      : [{ p: [first[0] + 0.5, first[1]], cell: first, step: [0, -1] }, { p: [last[0] + 0.5, last[1] + 1], cell: last, step: [0, 1] }];
    ends.forEach((e, k) => {
      const a = { id: 'door' + i + ':' + k, p: e.p, kind: 'W', links: [], anchor: true };
      nodes.set(a.id, a);
      // the wall square straight on from this end; failing that, one diagonally on
      const [cx, cy] = e.cell, sx = e.step[0], sy = e.step[1];
      const straight = nodes.get(key(cx + sx, cy + sy));
      if (straight) link(a, straight);
      else for (const o of [-1, 1]) { const q = nodes.get(key(cx + sx + (sx ? 0 : o), cy + sy + (sy ? 0 : o))); if (q) link(a, q); }
    });
  });
  // lines: from every node that is not simply a link in a chain, along each way out of it
  const keyNode = (n) => n.links.length !== 2 || n.anchor;
  const done = new Set(), lines = [];
  const edgeKey = (a, b) => (a.id < b.id ? a.id + '|' + b.id : b.id + '|' + a.id);
  for (const n of nodes.values()) {
    if (!keyNode(n)) continue;
    for (const first of n.links) {
      if (done.has(edgeKey(n, first))) continue;
      const path = [n];
      let prev = n, cur = first;
      done.add(edgeKey(n, first));
      for (;;) {
        path.push(cur);
        if (keyNode(cur)) break;
        const next = cur.links.find((m) => m !== prev);
        if (!next || done.has(edgeKey(cur, next))) break;
        done.add(edgeKey(cur, next));
        prev = cur; cur = next;
      }
      lines.push({ nodes: path, closed: false });
    }
  }
  // rings with no junction on them: whole loops
  for (const n of nodes.values()) {
    if (keyNode(n) || n.links.some((m) => done.has(edgeKey(n, m)))) continue;
    const path = [n]; let prev = n, cur = n.links[0];
    done.add(edgeKey(n, cur));
    while (cur && cur !== n) { path.push(cur); const next = cur.links.find((m) => m !== prev); if (!next) break; done.add(edgeKey(cur, next)); prev = cur; cur = next; }
    lines.push({ nodes: path, closed: true });
  }
  // each line: smoothed, its kinds carried along
  const out = [];
  for (const L of lines) {
    let pts = L.nodes.map((n) => n.p.slice());
    const kinds = L.nodes.map((n) => n.kind);
    // a line ending on a square next to the middle wall (left out of the
    // squares: it is drawn round, true) is carried on into it
    const reached = [];
    if (ring && !L.closed) for (const [end, prevI] of [[0, 1], [pts.length - 1, pts.length - 2]]) {
      const n = L.nodes[end];
      if (n.anchor || n.links.length !== 1 || !n.cell) continue;
      const [x, y] = n.cell;
      let touches = false;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (ring.cell(x + dx, y + dy)) touches = true;
      if (!touches) continue;
      const e = pts[end], q = pts[prevI] || e;
      let d = [e[0] - q[0], e[1] - q[1]], l = Math.hypot(d[0], d[1]);
      const out = [e[0] - ring.cx, e[1] - ring.cz], lo = Math.hypot(out[0], out[1]) || 1;
      if (l < 1e-6 || (d[0] * out[0] + d[1] * out[1]) / l / lo < 0.3) { d = [out[0] / lo, out[1] / lo]; l = 1; } else d = [d[0] / l, d[1] / l];
      // where it meets the circle
      const fx = e[0] - ring.cx, fz = e[1] - ring.cz, b = fx * d[0] + fz * d[1], c = fx * fx + fz * fz - ring.r * ring.r, disc = b * b - c;
      if (disc < 0) continue;
      const t = -b + Math.sqrt(disc);
      if (t > 0 && t < 3) { pts[end] = [e[0] + d[0] * t, e[1] + d[1] * t]; reached.push(end); }
    }
    // a line with a counter in it: the counter runs from its first glazed or counter square to its last
    if (kinds.includes('C')) {
      const firstI = kinds.findIndex((k) => k === 'C' || k === 'G'), lastI = kinds.length - 1 - [...kinds].reverse().findIndex((k) => k === 'C' || k === 'G');
      for (let i = firstI; i <= lastI; i++) kinds[i] = 'C';
    }
    const smooth = L.closed ? fillet(simplifyLoop(pts, SMOOTH.tol), SMOOTH.fillet, 5, true) : fillet(simplify(pts, SMOOTH.tol), SMOOTH.fillet, 5, false);
    if (L.closed) smooth.push(smooth[0].slice());
    // the kind of each piece: the kind of the map square nearest its middle
    const kindAt = (m) => { let b = 0, bd = Infinity; pts.forEach((p, i) => { const d = Math.hypot(p[0] - m[0], p[1] - m[1]); if (d < bd) { bd = d; b = i; } }); return kinds[b]; };
    const runs = [];
    for (let i = 0; i + 1 < smooth.length; i++) {
      const k = kindAt([(smooth[i][0] + smooth[i + 1][0]) / 2, (smooth[i][1] + smooth[i + 1][1]) / 2]);
      const last = runs[runs.length - 1];
      if (last && last.kind === k) last.pts.push(smooth[i + 1]);
      else runs.push({ kind: k, pts: [smooth[i], smooth[i + 1]] });
    }
    const ends = [];
    if (!L.closed) for (const [end, n] of [[0, L.nodes[0]], [L.nodes.length - 1, L.nodes[L.nodes.length - 1]]]) if (!n.anchor && n.links.length === 1 && !reached.includes(end)) ends.push(n.p);
    out.push({ runs, ends, raw: pts, closed: L.closed, reached: reached.length });
  }
  return { lines: out, doorCells, junctions: [...nodes.values()].filter((n) => !n.anchor && n.links.length > 2).map((n) => n.p) };
}

// Build them: walls (W) full height; glazing (G) plaster to 0.9, glass to 2.4,
// plaster above; counters (C) a counter, a glass screen over it with a gap to
// pass things through, plaster above.
export function buildWallLines(kit, W, y0, wallH) {
  const boxesFor = (pts, t, ya, yb) => {
    const out = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const [a, b] = [pts[i], pts[i + 1]];
      if (Math.abs(a[0] - b[0]) < 1e-6 || Math.abs(a[1] - b[1]) < 1e-6) {
        // (M6.17.0) square to the grid: thick across, but not run on past its ends - it
        // had reached 0.1 m into each doorway beside it (a guard's way into the west kiosk's rooms)
        const alongX = Math.abs(a[1] - b[1]) < 1e-6;
        out.push([[Math.min(a[0], b[0]) - (alongX ? 0 : t / 2), ya, Math.min(a[1], b[1]) - (alongX ? t / 2 : 0)], [Math.max(a[0], b[0]) + (alongX ? 0 : t / 2), yb, Math.max(a[1], b[1]) + (alongX ? t / 2 : 0)]]);
      } else out.push(...polyWallBoxes([a, b], t, ya, yb, SMOOTH.seg));
    }
    return out;
  };
  const T = 0.2, top = y0 + wallH;
  for (const line of W.lines) for (const run of line.runs) {
    const p = run.pts;
    if (run.kind === 'W') {
      kit.curve(polyWallQuads(p, T, y0, top), 'plaster');
      kit.solids(boxesFor(p, T, y0, top), 'plaster');
    } else if (run.kind === 'G') {
      kit.curve(polyWallQuads(p, T, y0, y0 + 0.9), 'plaster');
      kit.curve(polyWallQuads(p, 0.06, y0 + 0.9, y0 + 2.4, { noEnds: true }), 'glass');
      kit.solids(boxesFor(p, T, y0, y0 + 0.9), 'plaster');
      kit.solids(boxesFor(p, 0.1, y0 + 0.9, y0 + 2.4), 'glass', { glass: true });
      if (wallH > 2.4) { kit.curve(polyWallQuads(p, T, y0 + 2.4, top, { bottom: true }), 'plaster'); kit.solids(boxesFor(p, T, y0 + 2.4, top), 'plaster'); }
    } else if (run.kind === 'R') {
      // on the roof terrace: glass, the whole height of a door
      kit.curve(polyWallQuads(p, 0.06, y0, y0 + 2.4), 'glass');
      kit.curve(polyWallQuads(p, 0.08, y0 + 2.4, y0 + 2.46, { bottom: true }), 'metal');
      kit.solids(boxesFor(p, 0.1, y0, y0 + 2.4), 'glass', { glass: true });
    } else {
      // a counter: a panelled front, a marble top, a glass screen with a gap under it
      kit.curve(polyWallQuads(p, 0.5, y0, y0 + 1.02), 'wood');
      kit.curve(polyWallQuads(p, 0.62, y0 + 1.02, y0 + 1.08, { bottom: true }), 'marble');
      kit.curve(polyWallQuads(p, 0.04, y0 + 1.24, y0 + 2.3, { noEnds: true }), 'glass');
      kit.solids(boxesFor(p, 0.5, y0, y0 + 1.08), 'wood');
      kit.solids(boxesFor(p, 0.06, y0 + 1.24, y0 + 2.3), 'glass', { glass: true });
      if (wallH > 2.3) { kit.curve(polyWallQuads(p, T, y0 + 2.3, top, { bottom: true }), 'plaster'); kit.solids(boxesFor(p, T, y0 + 2.3, top), 'plaster'); }
    }
  }
  // (M6.17.0, Rhys: "there's several gaps into the ground floor central
  // room... they don't look right") two loose ends facing each other across a
  // gap are a doorway: a lintel over it, trimmed in wood
  W.openings = [];
  const ends = W.lines.flatMap((l) => l.ends);
  const nearest = (e) => { let b = null, bd = Infinity; for (const f of ends) { if (f === e) continue; const d = Math.hypot(f[0] - e[0], f[1] - e[1]); if (d < bd) { bd = d; b = f; } } return [b, bd]; };
  for (const e of ends) {
    const [f, d] = nearest(e);
    if (!f || d < 0.8 || d > 3.6 || nearest(f)[0] !== e || e[0] > f[0] || (e[0] === f[0] && e[1] > f[1]) || wallH < 2.7) continue;
    kit.curve(polyWallQuads([e, f], 0.24, y0 + 2.4, top, { bottom: true }), 'plaster');
    kit.curve(polyWallQuads([e, f], 0.3, y0 + 2.34, y0 + 2.4, { bottom: true }), 'wood');
    kit.solids(polyWallBoxes([e, f], 0.24, y0 + 2.34, top, 0.4), 'plaster');
    W.openings.push([e, f]);
  }
  // a post where lines meet, and at every loose end
  const jamb = new Set(W.openings.flat());
  for (const p of [...W.junctions, ...W.lines.flatMap((l) => l.ends)]) {
    const [x, z] = p;
    kit.curve(cylinder(x, z, jamb.has(p) ? 0.16 : 0.14, y0, Math.max(top, y0 + 1.1), 10), jamb.has(p) ? 'wood' : 'plaster');
  }
}

// ── furniture ─────────────────────────────────────────────────────────────
// Colours (tints on the plain 'paint'): leather, brass, porcelain, laminate
export const TINT = {
  leather: [0.34, 0.07, 0.07], rail: [0.16, 0.09, 0.07], brass: [1.0, 0.78, 0.42], porcelain: [0.96, 0.96, 0.95],
  cabinet: [0.14, 0.11, 0.17], partition: [0.55, 0.6, 0.62], cubicle: [0.86, 0.84, 0.8], chrome: [0.85, 0.87, 0.9], black: [0.08, 0.08, 0.09],
};
const facing = (x, z, tx, tz) => Math.atan2(tz - z, tx - x);      // the angle (x-z plane) from a point towards another

// A chair turned to face (tx, tz). kind: 'casino' (padded, on a pedestal),
// 'dining' (wooden, four legs), 'stool' (a bar stool, round)
// (M6.17.0, Rhys's screenshot: chairs of neighbouring tables inside one
// another) while kit.chairs is a list, chairs are only noted; placeChairs puts
// them in once every table is built, leaving out any that would sit in a
// table, a wall or another chair.
export function chair(kit, x, y, z, tx, tz, kind) {
  if (kit.chairs) { kit.chairs.push([x, y, z, tx, tz, kind]); return; }
  const r = kind === 'stool' ? 0.2 : kind === 'dining' ? 0.22 : 0.24;
  if (kit.world.hit([x - r + 0.02, y + 0.05, z - r + 0.02], [x + r - 0.02, y + (kind === 'stool' ? 0.8 : 0.53), z + r - 0.02])) return false;
  const a = facing(x, z, tx, tz), back = [x - Math.cos(a) * 0.22, z - Math.sin(a) * 0.22];
  // (M6.17.5) the seats, for a red who dies beside one to end up sat in it
  // (yaw as the game's: 0 faces -z; facing the table or bar the seat faces)
  if (kit.level) (kit.level.seats = kit.level.seats || []).push({ pos: [x, y, z], top: y + (kind === 'stool' ? 0.8 : kind === 'dining' ? 0.48 : 0.53), yaw: Math.atan2(-(tx - x), -(tz - z)), kind });
  if (kind === 'stool') {
    kit.curve(cylinder(x, z, 0.2, y + 0.72, y + 0.8, 12), 'paint', { tint: TINT.leather });
    kit.curve([...cylinder(x, z, 0.03, y + 0.02, y + 0.72, 6), ...cylinder(x, z, 0.2, y, y + 0.03, 10)], 'metal', { tint: TINT.chrome });
    kit.curve(sweep(circlePts(x, z, 0.17, 10).concat([circlePts(x, z, 0.17, 10)[0]]).map(([px, pz]) => [px, y + 0.3, pz]), 0.025, 0.025), 'metal', { tint: TINT.brass });
    kit.world.addSolid([x - 0.2, y, z - 0.2], [x + 0.2, y + 0.8, z + 0.2], 'chair');
    return;
  }
  const rot = a + Math.PI / 2;                 // the seat's width runs across the way it faces
  if (kind === 'dining') {
    kit.curve(orientedBox(x, z, 0.44, 0.44, y + 0.43, y + 0.48, rot), 'wood');
    kit.curve(orientedBox(back[0], back[1], 0.44, 0.05, y + 0.48, y + 0.95, rot), 'wood');
    for (const [u, v] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
      const c = Math.cos(rot), s = Math.sin(rot);
      kit.curve(orientedBox(x + u * c - v * s, z + u * s + v * c, 0.04, 0.04, y, y + 0.43, rot), 'wood');
    }
    kit.world.addSolid([x - 0.22, y, z - 0.22], [x + 0.22, y + 0.48, z + 0.22], 'chair');
    return;
  }
  // a casino chair: a padded seat and back in red leather, on a chrome pedestal
  kit.curve([...orientedBox(x, z, 0.5, 0.48, y + 0.42, y + 0.53, rot), ...orientedBox(back[0], back[1], 0.5, 0.09, y + 0.53, y + 1.02, rot)], 'paint', { tint: TINT.leather });
  kit.curve([...cylinder(x, z, 0.035, y + 0.03, y + 0.42, 6), ...cylinder(x, z, 0.24, y, y + 0.03, 10)], 'metal', { tint: TINT.chrome });
  kit.world.addSolid([x - 0.24, y, z - 0.24], [x + 0.24, y + 0.53, z + 0.24], 'chair');
}

export function placeChairs(kit) {
  const list = kit.chairs || [];
  kit.chairs = null;
  let n = 0;
  for (const c of list) if (chair(kit, ...c) !== false) n++;
  return { placed: n, left: list.length - n };
}

// chairs round an oval table (half-axes rx, rz, turned rot), each set `off`
// out from its edge along the edge's normal and facing the table, spaced
// evenly round it; `gap`: an angle round it with no chair (the dealer's place)
function chairsRound(kit, cx, cz, rx, rz, rot, y, n, kind, gap, off) {
  off = off === undefined ? 0.5 : off;
  const c = Math.cos(rot), s = Math.sin(rot), M = 360;
  // evenly by distance round the edge
  const P = (t) => [Math.cos(t) * rx, Math.sin(t) * rz], len = [0];
  for (let i = 1; i <= M; i++) { const a = P(TAU * (i - 1) / M), b = P(TAU * i / M); len.push(len[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  for (let k = 0; k < n; k++) {
    const want = len[M] * (k + 0.5) / n;
    let i = 1; while (i < M && len[i] < want) i++;
    const t = TAU * (i - 1 + (want - len[i - 1]) / ((len[i] - len[i - 1]) || 1)) / M;
    if (gap !== undefined && Math.abs(Math.atan2(Math.sin(t - gap), Math.cos(t - gap))) < Math.PI / n * 1.1) continue;
    const [px, pz] = P(t), nx = Math.cos(t) / rx, nz = Math.sin(t) / rz, nl = Math.hypot(nx, nz);
    const lx = px + nx / nl * off, lz = pz + nz / nl * off;
    const tx = px - nx / nl, tz = pz - nz / nl;            // facing in, square to the edge
    chair(kit, cx + lx * c - lz * s, y, cz + lx * s + lz * c, cx + tx * c - tz * s, cz + tx * s + tz * c, kind);
  }
}

// A stack of chips
function chips(kit, x, y, z, n, tint) {
  kit.curve(cylinder(x, z, 0.02, y, y + 0.004 * n, 8), 'paint', { tint });
}
const CHIP_TINTS = [[0.85, 0.1, 0.1], [0.1, 0.25, 0.8], [0.1, 0.55, 0.2], [0.1, 0.1, 0.1], [0.92, 0.92, 0.9]];

// ── gaming tables ──
// t: { kind, cx, cz, w, d, rot, y } - w along rot, d across; the footprint Rhys drew
export function gamingTable(kit, t) {
  const { cx, cz, y } = t, rot = t.rot || 0;
  const big = Math.min(t.w, t.d) >= 3.5;                         // chairs inside the drawn squares
  const pad = big ? 0.9 : 0;
  const w = t.w - pad * 2, d = t.d - pad * 2;
  const out = [];
  const dealer = rot - Math.PI / 2;                                // the dealer's side: the table's far long side
  if (t.kind === 'craps') {
    // a long tub: a high padded rail all round, the felt bed sunk inside it
    const L = Math.max(w, d), D = Math.min(Math.max(1.5, Math.min(w, d) * 0.6), 1.8), r2 = L > d ? rot : rot + Math.PI / 2;
    const outer = roundRectPts(cx, cz, Math.min(L, 4.4), D, 0.6, r2, 5), inner = roundRectPts(cx, cz, Math.min(L, 4.4) - 0.5, D - 0.5, 0.4, r2, 5);
    kit.curve(prism(outer, y, y + 0.88, { holes: [inner], sheet: 'tub' }), 'wood');
    kit.curve(prism(offsetLoop(outer, 0.04), y + 0.88, y + 1.0, { holes: [offsetLoop(inner, -0.04)], sheet: 'rail' }), 'paint', { tint: TINT.rail });
    kit.curve(flatPoly(inner, null, y + 0.72, true), 'felt');
    kit.solids(outlineBoxes(outer, y, y + 1.0, 0.3), 'table');
    // the dice, mid-throw
    kit.box([cx - 0.03, y + 0.72, cz - 0.03], [cx + 0.01, y + 0.76, cz + 0.01], 'paint', { solid: false, tint: [0.9, 0.1, 0.1] });
    kit.box([cx + 0.06, y + 0.72, cz + 0.02], [cx + 0.1, y + 0.76, cz + 0.06], 'paint', { solid: false, tint: [0.9, 0.1, 0.1] });
    return { kind: 'craps', outline: outer };
  }
  if (t.kind === 'roulette') {
    // a long table, rounded at the corners; the wheel at one end, the layout along it
    // (M6.17.0, Rhys: the numbers spilled into each other, the wheel sat on
    // them) a table a metre and a half across at most, the wheel in its own
    // end, the layout stopping short of it, its numbers sized to their boxes
    const L = Math.max(w, d), D = Math.min(Math.min(w, d), 1.5), r2 = w >= d ? rot : rot + Math.PI / 2;
    const top = roundRectPts(cx, cz, L, D, 0.35, r2, 4);
    kit.curve(prism(offsetLoop(top, -0.12), y, y + 0.7, { sheet: 'base' }), 'wood');
    kit.curve(prism(top, y + 0.7, y + 0.8, { holes: [offsetLoop(top, -0.14)], sheet: 'rim' }), 'paint', { tint: TINT.rail });
    const c = Math.cos(r2), s = Math.sin(r2);
    // the layout: the part away from the wheel, printed baize
    const R0 = Math.min(0.45, D / 2 - 0.12), wheelAt = L / 2 - R0 - 0.18;
    const lay0 = -L / 2 + 0.16, lay1 = wheelAt - R0 - 0.14, layW = D - 0.3, layMid = (lay0 + lay1) / 2;
    const lay = rectPts(cx + c * layMid, cz + s * layMid, lay1 - lay0, layW, r2);
    const fq = flatPoly(lay, null, y + 0.78, true);
    const ux = [c, s], uz = [-s, c];
    for (const q of fq) q.uv = q.v.map((v) => { const px = v[0] - cx, pz = v[2] - cz; return [((px * ux[0] + pz * ux[1]) - lay0) / (lay1 - lay0), (px * uz[0] + pz * uz[1] + layW / 2) / layW]; });
    kit.curve(fq, 'layout');
    kit.curve(flatPoly(offsetLoop(top, -0.14), null, y + 0.775, true), 'felt');
    // the wheel: a wooden bowl, its turning centre, the spindle
    const wx = cx + c * wheelAt, wz = cz + s * wheelAt, R = R0;
    kit.curve(prism(circlePts(wx, wz, R, 24), y + 0.78, y + 0.93, { holes: [circlePts(wx, wz, R - 0.08, 24)], sheet: 'bowl' }), 'wood');
    kit.curve(cylinder(wx, wz, R - 0.1, y + 0.8, y + 0.86, 20), 'paint', { tint: TINT.black });
    kit.curve([...cylinder(wx, wz, 0.08, y + 0.86, y + 0.9, 10), ...cylinder(wx, wz, 0.015, y + 0.9, y + 1.0, 6)], 'metal', { tint: TINT.brass });
    kit.solids(outlineBoxes(top, y, y + 0.8, 0.3), 'table');
    // stools along the side away from the dealer
    const n = Math.max(2, Math.floor(L * 0.7 / 0.75));
    for (let i = 0; i < n; i++) {
      const along = -L / 2 + (i + 0.5) * (L * 0.7) / n;
      const px = cx + c * along - (-s) * (D / 2 + 0.45), pz = cz + s * along - c * (D / 2 + 0.45);
      chair(kit, px, y, pz, px - (-s), pz - c, 'stool');
    }
    for (let i = 0; i < 5; i++) chips(kit, cx - c * L * 0.3 + (i - 2) * 0.12 * c, y + 0.8, cz - s * L * 0.3 + (i - 2) * 0.12 * s + uz[1] * 0.25, 4 + i * 2, CHIP_TINTS[i]);
    return { kind: 'roulette', outline: top, layout: [lay0, lay1], wheel: [wheelAt, R], along: [c, s] };
  }
  if (t.kind === 'blackjack' || t.kind === 'baccarat') {
    // a half-moon: the round side for the players, the straight side the dealer's
    const R = Math.min(Math.max(w, d) / 2, t.kind === 'baccarat' ? 1.35 : 1.5), depth = Math.min(Math.min(w, d), R + 0.25);
    const toCentre = t.face !== undefined ? t.face : rot;
    const fx = Math.cos(toCentre), fz = Math.sin(toCentre);               // from the straight side towards the players
    const bx = cx - fx * (depth / 2 - 0.12), bz = cz - fz * (depth / 2 - 0.12);
    const half = [];
    const sx0 = Math.cos(toCentre + Math.PI / 2), sz0 = Math.sin(toCentre + Math.PI / 2);
    for (let k = 0; k <= 16; k++) { const t = Math.PI * k / 16, u = Math.cos(t) * R, v = Math.sin(t) * depth; half.push([bx + sx0 * u + fx * v, bz + sz0 * u + fz * v]); }
    // (M6.17.1, Rhys: "still something a little... triangular about the half-moon tables" -
    // its two back corners had been joined in the wrong order, the outline crossing itself)
    const outline = half.concat([[bx + Math.cos(toCentre - Math.PI / 2) * R - fx * 0.15, bz + Math.sin(toCentre - Math.PI / 2) * R - fz * 0.15], [bx + Math.cos(toCentre + Math.PI / 2) * R - fx * 0.15, bz + Math.sin(toCentre + Math.PI / 2) * R - fz * 0.15]]);
    kit.curve(prism(offsetLoop(outline, -0.15), y, y + 0.7, { sheet: 'base' }), 'wood');
    kit.curve(prism(outline, y + 0.7, y + 0.8, { holes: [offsetLoop(outline, -0.2)], sheet: 'rim' }), 'paint', { tint: TINT.rail });
    kit.curve(flatPoly(offsetLoop(outline, -0.2), null, y + 0.775, true), 'felt');
    // the dealer's chip tray and the shoe
    kit.curve(orientedBox(bx - fx * 0.05, bz - fz * 0.05, 0.6, 0.18, y + 0.775, y + 0.81, toCentre + Math.PI / 2), 'paint', { tint: TINT.black });
    kit.curve(orientedBox(bx + Math.cos(toCentre + 1.1) * 0.6, bz + Math.sin(toCentre + 1.1) * 0.6, 0.16, 0.3, y + 0.775, y + 0.9, toCentre), 'paint', { tint: TINT.rail });
    kit.solids(outlineBoxes(outline, y, y + 0.8, 0.3), 'table');
    // chairs round the curve
    const n = t.kind === 'baccarat' ? 7 : 5;
    const sx = Math.cos(toCentre + Math.PI / 2), sz = Math.sin(toCentre + Math.PI / 2);
    for (let i = 0; i < n; i++) {
      const t = Math.PI * (i + 0.5) / n, ex = Math.cos(t) * R, ez = Math.sin(t) * depth;
      const nx = Math.cos(t) / R, nz = Math.sin(t) / depth, nl = Math.hypot(nx, nz);
      const at = (u, v) => [bx + sx * u + fx * v, bz + sz * u + fz * v];
      const [px, pz] = at(ex + nx / nl * 0.5, ez + nz / nl * 0.5), [qx, qz] = at(ex - nx / nl, ez - nz / nl);
      chair(kit, px, y, pz, qx, qz, 'casino');
      const [cx2, cz2] = at(ex - nx / nl * 0.35, ez - nz / nl * 0.35);
      chips(kit, cx2, y + 0.78, cz2, 6, CHIP_TINTS[i % 5]);
    }
    return { kind: t.kind, outline };
  }
  // poker: an oval (round if it is square), a padded rail, a dealer's place
  const rx = Math.max(w, d) / 2, rz = Math.min(w, d) / 2, r2 = w >= d ? rot : rot + Math.PI / 2;
  const outer = ellipsePts(cx, cz, rx, rz, 40, r2), inner = ellipsePts(cx, cz, rx - 0.28, rz - 0.28, 40, r2);
  kit.curve(prism(ellipsePts(cx, cz, rx * 0.55, rz * 0.5, 24, r2), y, y + 0.66, { sheet: 'base' }), 'wood');
  kit.curve(prism(ellipsePts(cx, cz, rx - 0.05, rz - 0.05, 40, r2), y + 0.66, y + 0.72, { sheet: 'apron' }), 'wood');
  kit.curve(prism(outer, y + 0.72, y + 0.82, { holes: [inner], sheet: 'rail' }), 'paint', { tint: TINT.rail });
  kit.curve(flatPoly(inner, null, y + 0.775, true), 'felt');
  kit.solids(outlineBoxes(outer, y, y + 0.82, 0.3), 'table');
  const seats = Math.max(4, Math.min(10, Math.floor((Math.PI * (rx + rz + 1.0)) / 0.85)));
  chairsRound(kit, cx, cz, rx, rz, r2, y, seats, 'casino', Math.PI * 1.5, 0.5);
  // the dealer's tray, at the gap
  const c = Math.cos(r2), s = Math.sin(r2);
  kit.curve(orientedBox(cx + s * (rz - 0.4), cz - c * (rz - 0.4), 0.5, 0.15, y + 0.775, y + 0.8, r2), 'paint', { tint: TINT.black });
  for (let i = 0; i < 4; i++) chips(kit, cx + Math.cos(i * 1.7) * rx * 0.4, y + 0.78, cz + Math.sin(i * 1.7) * rz * 0.4, 5 + i * 3, CHIP_TINTS[i]);
  return { kind: 'poker', outline: outer };
}

// ── a round dining table on a pedestal, chairs round it (you can still get under it) ──
export function diningTable(kit, cx, cz, r, y, chairsN) {
  kit.curve(prism(circlePts(cx, cz, r, 28), y + 0.72, y + 0.77, { sheet: 'top' }), 'wood');
  kit.curve(flatPoly(circlePts(cx, cz, r - 0.03, 28), null, y + 0.772, true), 'cloth');
  kit.curve([...cylinder(cx, cz, 0.07, y + 0.05, y + 0.72, 8), ...cylinder(cx, cz, 0.35, y, y + 0.05, 14)], 'metal', { tint: TINT.black });
  // stood on, crawled under: the top only, and the column
  kit.solids(outlineBoxes(circlePts(cx, cz, r, 28), y + 0.72, y + 0.77, 0.3), 'table');
  kit.world.addSolid([cx - 0.08, y, cz - 0.08], [cx + 0.08, y + 0.72, cz + 0.08], 'table');
  chairsRound(kit, cx, cz, r, r, 0, y, chairsN, 'dining', undefined, 0.32);
}

// ── a slot machine, backed onto (bx, bz), facing `a` ──
export const SLOT_FACES = ['slotface', 'slotface1', 'slotface2', 'slotface3', 'slotface4', 'slotface5'];
// game: which of the six (M6.17.1) - SLOT_FACES
export function slotMachine(kit, x, y, z, a, hue, game) {
  const rot = a + Math.PI / 2, f = [Math.cos(a), Math.sin(a)];
  kit.curve(orientedBox(x, z, 0.7, 0.62, y, y + 0.95, rot), 'paint', { tint: TINT.cabinet });
  kit.curve(orientedBox(x - f[0] * 0.08, z - f[1] * 0.08, 0.7, 0.46, y + 0.95, y + 1.78, rot), 'paint', { tint: TINT.cabinet });
  // the button deck, a step out at waist height, its buttons lit
  kit.curve(orientedBox(x + f[0] * 0.2, z + f[1] * 0.2, 0.68, 0.24, y + 0.88, y + 0.97, rot), 'paint', { tint: TINT.black });
  for (let k = -2; k <= 2; k++) {
    const c = Math.cos(rot), s = Math.sin(rot), bx = x + f[0] * 0.24 + c * k * 0.11, bz = z + f[1] * 0.24 + s * k * 0.11;
    kit.curve(orientedBox(bx, bz, 0.07, 0.05, y + 0.97, y + 0.99, rot), 'neon', { tint: k === 2 ? [1, 0.25, 0.2] : [1, 0.8, 0.3] });
  }
  // its face: the lit screen and reels (one painted face, fitted)
  const fx = x + f[0] * 0.152, fz = z + f[1] * 0.152, c = Math.cos(rot), s = Math.sin(rot);
  const l = [fx - c * 0.31, fz - s * 0.31], r = [fx + c * 0.31, fz + s * 0.31];
  kit.curve([{ v: [[l[0], y + 0.98, l[1]], [r[0], y + 0.98, r[1]], [r[0], y + 1.72, r[1]], [l[0], y + 1.72, l[1]]], n: [f[0], 0, f[1]], uv: [[1, 1], [0, 1], [0, 0], [1, 0]] }], SLOT_FACES[(game || 0) % SLOT_FACES.length]);   // (M6.17.0: it read back to front)
  // the topper: a glowing sign
  kit.curve(orientedBox(x - f[0] * 0.08, z - f[1] * 0.08, 0.66, 0.3, y + 1.78, y + 2.0, rot), 'neon', { tint: hue });
  kit.world.addSolid([x - 0.36, y, z - 0.36], [x + 0.36, y + 2.0, z + 0.36], 'slot');
  // and a stool in front
  chair(kit, x + f[0] * 0.75, y, z + f[1] * 0.75, x, z, 'stool');
}

// ── a round bar: the counter, the back bar of bottles in the middle, a
// gantry overhead hung with glasses, stools round it (Rhys: "can the ground
// floor bar look more... bar-ish please? (including glasses on racks hanging
// round the ceiling of it?)") ──
export function roundBar(kit, cx, cz, rIn, rOut, y, ceiling) {
  const ring = (r, n) => circlePts(cx, cz, r, n || 64);
  // the counter: a panelled front, a marble top, a brass foot rail
  kit.curve(prism(ring(rOut), y, y + 1.0, { holes: [ring(rIn)], top: false, sheet: 'front' }), 'wood');
  kit.curve(prism(ring(rOut + 0.12), y + 1.0, y + 1.07, { holes: [ring(rIn - 0.05)], sheet: 'top' }), 'marble');
  kit.curve(prism(ring(rIn + 0.05), y + 0.85, y + 0.9, { holes: [ring(rIn - 0.35)], sheet: 'shelf' }), 'wood');
  const foot = ring(rOut + 0.25, 64); foot.push(foot[0]);
  kit.curve(sweep(foot.map(([x, z]) => [x, y + 0.2, z]), 0.05, 0.05), 'metal', { tint: TINT.brass });
  kit.solids(outlineBoxes(ring(rOut + 0.12), y, y + 1.07, 0.3, [ring(rIn - 0.05)]), 'bar');
  // the back bar: a round island of shelves, lit underneath, bottles on every tier
  const tiers = [[1.5, y, y + 1.0], [1.25, y + 1.0, y + 1.5], [1.0, y + 1.5, y + 2.0], [0.75, y + 2.0, y + 2.5]];
  for (const [r, a, b] of tiers) {
    kit.curve(prism(ring(r, 40), a, b - 0.06, { sheet: 'tier' + a }), 'wood');
    kit.curve(prism(ring(r + 0.06, 40), b - 0.06, b, { sheet: 'lip' + a }), 'marble');
    kit.curve(polySides(ring(r + 0.02, 40), b - 0.07, b - 0.05, { sheet: 'glow' }), 'neon', { tint: [1, 0.72, 0.35] });
  }
  kit.curve(cylinder(cx, cz, 0.45, y + 2.5, ceiling, 20), 'marble');
  kit.solids(outlineBoxes(ring(1.5, 40), y, ceiling, 0.4), 'bar');
  const BOTTLES = [[0.35, 0.18, 0.06], [0.1, 0.35, 0.12], [0.75, 0.55, 0.2], [0.85, 0.85, 0.8], [0.45, 0.08, 0.1], [0.2, 0.3, 0.55]];
  // (M6.17.0) what a round can shatter: a ring of bottles on each tier, a ring of glasses on each rail
  const GLASSWARE = { glass: true, tough: 0, shotOnly: true, glassware: true, noClimb: true };
  const ringOf = (r, y0, y1) => kit.solids(arcWallBoxes(cx, cz, r, 0.1, 0, TAU, y0, y1, 0.5), 'glassware', GLASSWARE);
  for (const [ti, [r, a, b]] of tiers.slice(0, 3).entries()) {
    ringOf(r + 0.1, b, b + 0.36);
    const nb = Math.floor(TAU * (r + 0.1) / 0.13);
    for (let i = 0; i < nb; i++) {
      const ang = TAU * i / nb, px = cx + Math.cos(ang) * (r + 0.1), pz = cz + Math.sin(ang) * (r + 0.1), h = 0.24 + ((i * 7) % 5) * 0.025;
      kit.curve([...cylinder(px, pz, 0.035, b, b + h, 6, { bottom: false }), ...cylinder(px, pz, 0.012, b + h, b + h + 0.08, 4, { bottom: false })], 'paint', { tint: BOTTLES[(i * 5 + Math.floor(i / 4) + ti * 2) % BOTTLES.length] });
    }
  }
  // the gantry overhead, hung from the ceiling: a ring, rails of glasses upside down under it
  const gy = Math.min(ceiling - 0.6, y + 2.75);
  kit.curve(prism(ring(rOut - 0.05), gy, gy + 0.14, { holes: [ring(rIn - 0.6)], sheet: 'gantry' }), 'wood');
  for (const a of [0, 1, 2, 3, 4, 5].map((i) => i * TAU / 6)) {
    const p = [cx + Math.cos(a) * (rOut - 0.4), cz + Math.sin(a) * (rOut - 0.4)];
    kit.curve(cylinder(p[0], p[1], 0.02, gy + 0.14, ceiling, 6), 'metal', { tint: TINT.brass });
  }
  for (const rr of [rIn - 0.35, rIn + 0.05, rOut - 0.3]) {
    const n = Math.floor(TAU * rr / 0.16), rail = ring(rr, 64); rail.push(rail[0]);
    ringOf(rr, gy - 0.25, gy - 0.03);
    kit.curve(sweep(rail.map(([x, z]) => [x, gy - 0.03, z]), 0.02, 0.03), 'metal', { tint: TINT.chrome });
    for (let i = 0; i < n; i++) {
      const a = TAU * (i + 0.5) / n, px = cx + Math.cos(a) * rr, pz = cz + Math.sin(a) * rr;
      // a wine glass, upside down: the foot at the rail, the stem, the bowl below
      kit.box([px - 0.035, gy - 0.05, pz - 0.035], [px + 0.035, gy - 0.04, pz + 0.035], 'glass', { solid: false });
      kit.box([px - 0.006, gy - 0.13, pz - 0.006], [px + 0.006, gy - 0.05, pz + 0.006], 'glass', { solid: false });
      kit.box([px - 0.04, gy - 0.25, pz - 0.04], [px + 0.04, gy - 0.13, pz + 0.04], 'glass', { solid: false });
    }
  }
  // pendant lamps over the counter
  for (let i = 0; i < 8; i++) {
    const a = TAU * (i + 0.5) / 8, px = cx + Math.cos(a) * (rIn + rOut) / 2, pz = cz + Math.sin(a) * (rIn + rOut) / 2;
    kit.box([px - 0.09, gy - 0.5, pz - 0.09], [px + 0.09, gy - 0.4, pz + 0.09], 'lamp', { solid: false });
    kit.box([px - 0.008, gy - 0.4, pz - 0.008], [px + 0.008, gy, pz + 0.008], 'metal', { solid: false });
  }
  // stools round it
  const ns = Math.floor(TAU * (rOut + 0.55) / 1.05);
  for (let i = 0; i < ns; i++) { const a = TAU * (i + 0.5) / ns; chair(kit, cx + Math.cos(a) * (rOut + 0.55), y, cz + Math.sin(a) * (rOut + 0.55), cx, cz, 'stool'); }
}

// ── an arc of bar: the first floor's, against the middle wall ──
export function arcBar(kit, cx, cz, r, a0, a1, y, back) {
  // back: { cx, cz, r, a0, a1 } - the wall behind, for its shelves
  const arc = (rr, n) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rr, cz + Math.sin(a) * rr]); } return o; };
  const counter = arc(r + 0.3, 32).concat(arc(r - 0.3, 32).reverse());
  kit.curve(prism(counter, y, y + 1.0, { top: false, sheet: 'front' }), 'wood');
  kit.curve(prism(arc(r + 0.42, 32).concat(arc(r - 0.35, 32).reverse()), y + 1.0, y + 1.07, { sheet: 'top' }), 'marble');
  const foot = arc(r + 0.55, 32);
  kit.curve(sweep(foot.map(([x, z]) => [x, y + 0.2, z]), 0.05, 0.05), 'metal', { tint: TINT.brass });
  kit.solids(outlineBoxes(arc(r + 0.42, 32).concat(arc(r - 0.35, 32).reverse()), y, y + 1.07, 0.3), 'bar');
  // shelves of bottles on the wall behind, lit from under each shelf
  if (back) {
    const sh = (rr, n) => { const o = []; for (let i = 0; i <= n; i++) { const a = back.a0 + (back.a1 - back.a0) * i / n; o.push([back.cx + Math.cos(a) * rr, back.cz + Math.sin(a) * rr]); } return o; };
    for (const [h, dep] of [[0, 0.55], [1.2, 0.3], [1.6, 0.3], [2.0, 0.3]]) {
      const shape = sh(back.r, 40).concat(sh(back.r - dep, 40).reverse());
      kit.curve(prism(shape, y + h + (h ? 0 : 0), y + (h ? h + 0.04 : 1.0), { sheet: 'shelf' + h }), h ? 'marble' : 'wood');
      if (h) kit.curve(polySides(sh(back.r - dep + 0.01, 40).concat(sh(back.r - 0.02, 40).reverse()), y + h - 0.02, y + h, { sheet: 'glow' + h }), 'neon', { tint: [1, 0.72, 0.35] });
      if (h) {
        const n = Math.floor((back.a1 - back.a0) * back.r / 0.12);
        for (let i = 0; i < n; i++) {
          const a = back.a0 + (back.a1 - back.a0) * (i + 0.5) / n, px = back.cx + Math.cos(a) * (back.r - 0.15), pz = back.cz + Math.sin(a) * (back.r - 0.15), hh = 0.24 + ((i * 7) % 5) * 0.025;
          kit.curve([...cylinder(px, pz, 0.035, y + h + 0.04, y + h + 0.04 + hh, 6, { bottom: false })], 'paint', { tint: [[0.35, 0.18, 0.06], [0.1, 0.35, 0.12], [0.75, 0.55, 0.2], [0.85, 0.85, 0.8], [0.45, 0.08, 0.1]][(i * 3 + h * 10) % 5] });
        }
      }
    }
    kit.solids(outlineBoxes(sh(back.r, 40).concat(sh(back.r - 0.55, 40).reverse()), y, y + 1.0, 0.3), 'bar');
  }
  // a rack of glasses over the counter, and stools along it
  const gy = y + 2.6, rack = arc(r, 48);
  const GLASSWARE = { glass: true, tough: 0, shotOnly: true, glassware: true, noClimb: true };
  kit.solids(arcWallBoxes(cx, cz, r, 0.5, a0, a1, gy - 0.25, gy - 0.03, 0.5), 'glassware', GLASSWARE);
  if (back) for (const h of [1.2, 1.6, 2.0]) kit.solids(arcWallBoxes(back.cx, back.cz, back.r - 0.15, 0.1, back.a0, back.a1, y + h + 0.04, y + h + 0.36, 0.5), 'glassware', GLASSWARE);
  kit.curve(prism(arc(r + 0.35, 32).concat(arc(r - 0.35, 32).reverse()), gy, gy + 0.1, { sheet: 'gantry' }), 'wood');
  for (let i = 0; i < rack.length; i += 1) {
    const [px, pz] = rack[i];
    for (const o of [-0.18, 0, 0.18]) {
      const a = a0 + (a1 - a0) * i / (rack.length - 1), qx = px + Math.cos(a) * o, qz = pz + Math.sin(a) * o;
      kit.box([qx - 0.035, gy - 0.05, qz - 0.035], [qx + 0.035, gy - 0.04, qz + 0.035], 'glass', { solid: false });
      kit.box([qx - 0.006, gy - 0.13, qz - 0.006], [qx + 0.006, gy - 0.05, qz + 0.006], 'glass', { solid: false });
      kit.box([qx - 0.04, gy - 0.25, qz - 0.04], [qx + 0.04, gy - 0.13, qz + 0.04], 'glass', { solid: false });
    }
  }
  const ns = Math.floor((a1 - a0) * (r + 0.85) / 1.0);
  for (let i = 0; i < ns; i++) { const a = a0 + (a1 - a0) * (i + 0.5) / ns; chair(kit, cx + Math.cos(a) * (r + 0.85), y, cz + Math.sin(a) * (r + 0.85), cx, cz, 'stool'); }
}

// A room's outline as its walls are drawn: the edge of its map squares moved
// out to the middle of the walls round it (`off` 0.5), then straightened and
// rounded exactly as the walls are (SMOOTH). (M6.17.0, Rhys: the washroom
// tiles and the second floor's small ceilings "still need smoothing up AND
// some of it juts through the walls" - they had followed the squares.)
export function roomOutline(cells, off, cap) {
  const set = cells instanceof Set ? cells : new Set(cells.map(([x, z]) => x + ',' + z));
  const loop = traceCells(set)[0];
  if (!loop) return null;
  // smoothed at the walls' middle (where the walls themselves are smoothed), then moved in or out
  const mid = fillet(simplifyLoop(offsetLoop(loop, 0.5), SMOOTH.tol), SMOOTH.fillet, 5, true);
  // no further from the room's own squares than the middle of its walls: a
  // point the straightening carried out past a staircase's corners is drawn back
  const cl = [...set].map((k) => k.split(',').map(Number));
  for (const p of mid) {
    let best = null, bd = Infinity;
    for (const [cx, cz] of cl) {
      const qx = Math.max(cx, Math.min(cx + 1, p[0])), qz = Math.max(cz, Math.min(cz + 1, p[1])), d = Math.hypot(p[0] - qx, p[1] - qz);
      if (d < bd) { bd = d; best = [qx, qz]; }
    }
    if (bd > 0.5) { const t = 0.5 / bd; p[0] = best[0] + (p[0] - best[0]) * t; p[1] = best[1] + (p[1] - best[1]) * t; }
    // and never through the middle wall into the ramp: cap { cx, cz, r }
    if (cap) { const dx = p[0] - cap.cx, dz = p[1] - cap.cz, d = Math.hypot(dx, dz), lim = cap.r - (0.5 - off); if (d > lim) { p[0] = cap.cx + dx / d * lim; p[1] = cap.cz + dz / d * lim; } }
  }
  return Math.abs(off - 0.5) < 1e-6 ? mid : offsetLoop(mid, off - 0.5);
}

// ── a washroom (Rhys: "can the WCs be made to be WCs, please?") ──
// (M6.17.1, Rhys: "WCs still need slight restructuring, so they don't feel
// cramped, and so that sinks don't clip out of the rooms") The fittings had
// been set out by angle round the ring, as if every washroom were a slice of
// it; most are triangles and wedges, and the vanity stood across a wall. Now
// each fitting is a rectangle set flush against the room's actual wall - its
// floor plan as the walls run - and only where all of it, and the space you
// stand in to use it, is inside the room, clear of the walls, the door and
// the other fittings: the cubicle as far from the door as it fits, the basin
// as near the door as it fits, the dryer beside the basin. A tiled floor.
//   cells: the room's map squares; door: [x, z] of its door; gents: true/false
export function washroom(kit, cells, door, y, wallH, gents, centre) {
  const placed = { cubicles: 0, urinals: 0, basins: 0, fittings: [] };
  const ring = centre[2] ? (r) => ({ cx: centre[0], cz: centre[1], r }) : () => null;
  // the floor: tiles, out under the walls
  const tiles = roomOutline(cells, 0.42, ring(centre[2]));
  placed.tiles = { outline: tiles, cells };
  if (tiles) kit.curve(flatPoly(tiles, null, y + 0.006, true), 'wctile');
  // the floor you can use: to the walls' faces
  const free = roomOutline(cells, 0.37, ring(centre[2] + 0.11));
  if (!free) return placed;
  placed.free = free;
  // round the walls by distance
  const cum = [0];
  for (let i = 0; i < free.length; i++) { const a = free[i], b = free[(i + 1) % free.length]; cum.push(cum[i] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const P = cum[cum.length - 1];
  const at = (s) => {
    s = ((s % P) + P) % P;
    let i = 0; while (cum[i + 1] < s) i++;
    const a = free[i], b = free[(i + 1) % free.length], f = (s - cum[i]) / Math.max(1e-9, cum[i + 1] - cum[i]);
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  };
  const inward = signedArea(free) > 0 ? 1 : -1;
  const frame = (s, w) => {
    // the wall's run under the fitting's whole width, not one short piece of a curve
    const a = at(s - w / 2), b = at(s + w / 2), q = at(s), L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const t = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    let n = [-t[1] * inward, t[0] * inward];
    if (!pointInPoly(q[0] + n[0] * 0.25, q[1] + n[1] * 0.25, free)) n = [-n[0], -n[1]];
    // back flush with whichever of its corners is nearer the room's middle
    const back = Math.max(...[a, b, q].map((p) => (p[0] - q[0]) * n[0] + (p[1] - q[1]) * n[1]));
    const o = [q[0] + n[0] * back, q[1] + n[1] * back];
    return { o, t, n, s, rot: Math.atan2(t[1], t[0]), L: (u, v) => [o[0] + t[0] * u + n[0] * v, o[1] + t[1] * u + n[1] * v] };
  };
  const rect = (F, w, d, v0) => ({ F, w, d, v0: v0 || 0, pts: rectPts(...F.L(0, (v0 || 0) + d / 2), w, d, F.rot) });
  const samples = (r) => {
    const out = [], nu = Math.max(2, Math.ceil(r.w / 0.12)), nv = Math.max(2, Math.ceil(r.d / 0.12));
    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) out.push(r.F.L(-r.w / 2 + 0.02 + (r.w - 0.04) * i / nu, r.v0 + 0.02 + (r.d - 0.04) * j / nv));
    return out;
  };
  const dc = [door[0] + 0.5, door[1] + 0.5];
  const taken = [];
  const clearOf = (r, hBand) => samples(r).every(([x, z]) => pointInPoly(x, z, free) &&
    !taken.some((tk) => pointInPoly(x, z, tk.pts)) &&
    !kit.world.hit([x - 0.03, y + hBand[0], z - 0.03], [x + 0.03, y + hBand[1], z + 0.03])) &&
    !taken.some((tk) => samples(tk).some(([x, z]) => pointInPoly(x, z, r.pts)));
  const nearDoor = (r, lim) => samples(r).some(([x, z]) => Math.hypot(x - dc[0], z - dc[1]) < lim);
  // the best place round the walls for a fitting w by d, with room in front of it to stand
  const best = (w, d, stand, score, doorGap) => {
    let top = null;
    for (let s = 0; s < P; s += 0.08) {
      const F = frame(s, w), r = rect(F, w, d), c = rect(F, w, stand, d);
      if (nearDoor(r, doorGap || 1.05) || !clearOf(r, [0.1, 1.9]) || !clearOf(c, [0.1, 1.9])) continue;
      const sc = score(F, r);
      if (!top || sc > top.sc) top = { sc, F, r, c };
    }
    return top;
  };
  const dist = (F) => Math.hypot(F.o[0] - dc[0], F.o[1] - dc[1]);
  // the cubicle: as far from the door as it will go
  let cub = null;
  for (const [w, d, g] of [[0.95, 1.45, 1.3], [0.95, 1.45, 1.05], [0.9, 1.3, 1.05], [0.85, 1.2, 1.05]]) { cub = best(w, d, 0.6, (F) => dist(F), g); if (cub) break; }
  if (cub) {
    const { F, r } = cub, w = r.w, d = r.d, rot = F.rot, ang = Math.atan2(F.n[1], F.n[0]);
    // a toilet with a rounded bowl and a seat, its cistern against the wall
    const [tx, tz] = F.L(0, 0.47), [kx, kz] = F.L(0, 0.1);
    kit.curve(prism(ellipsePts(tx, tz, 0.17, 0.12, 16, ang), y, y + 0.22), 'paint', { tint: TINT.porcelain });
    kit.curve(prism(ellipsePts(tx, tz, 0.28, 0.19, 20, ang), y + 0.22, y + 0.4, { holes: [ellipsePts(tx, tz, 0.2, 0.12, 16, ang)] }), 'paint', { tint: TINT.porcelain });
    kit.curve(flatPoly(ellipsePts(tx, tz, 0.2, 0.12, 16, ang), null, y + 0.3, true), 'paint', { tint: [0.55, 0.7, 0.78] });
    kit.curve(prism(ellipsePts(tx, tz, 0.29, 0.2, 20, ang), y + 0.4, y + 0.43, { holes: [ellipsePts(tx, tz, 0.19, 0.11, 16, ang)] }), 'paint', { tint: [0.95, 0.94, 0.9] });
    kit.curve(orientedBox(kx, kz, 0.44, 0.18, y + 0.38, y + 0.8, rot), 'paint', { tint: TINT.porcelain });
    kit.curve(orientedBox(kx, kz, 0.46, 0.2, y + 0.8, y + 0.83, rot), 'paint', { tint: TINT.porcelain });
    const [fl, fz] = F.L(0.12, 0.1);
    kit.curve(cylinder(fl, fz, 0.025, y + 0.83, y + 0.85, 8), 'metal', { tint: TINT.chrome });
    kit.solids(outlineBoxes(rectPts(...F.L(0, 0.36), 0.44, 0.7, rot), y, y + 0.43, 0.25), 'wc');
    kit.solids(outlineBoxes(rectPts(kx, kz, 0.44, 0.18, rot), y, y + 0.83, 0.25), 'wc');
    // partitions, light, either side - where its side is not a wall already
    placed.partitions = 0;
    for (const side of [-1, 1]) {
      const beyond = [0.3, 0.7, 1.1].map((v) => F.L(side * (w / 2 + 0.15), Math.min(v, d - 0.05)));
      const hold = F.L(side * (w / 2 - 0.08), 0.62);
      if (!beyond.some(([x, z]) => pointInPoly(x, z, free))) { kit.curve(cylinder(hold[0], hold[1], 0.06, y + 0.62, y + 0.74, 10), 'paint', { tint: [0.97, 0.97, 0.95] }); continue; }
      const p0 = F.L(side * w / 2, 0.02), p1 = F.L(side * w / 2, d);
      kit.curve(polyWallQuads([p0, p1], 0.035, y + 0.12, y + 1.95), 'paint', { tint: TINT.cubicle });
      kit.curve(polyWallQuads([p0, p1], 0.045, y + 1.95, y + 1.99), 'metal', { tint: TINT.chrome });
      kit.solids(polyWallBoxes([p0, p1], 0.05, y + 0.12, y + 1.95, 0.3), 'wc');
      kit.curve(cylinder(hold[0], hold[1], 0.06, y + 0.62, y + 0.74, 10), 'paint', { tint: [0.97, 0.97, 0.95] });
      placed.partitions++;
    }
    // its door, ajar: hinged at a front corner, swung in
    const h0 = F.L(-w / 2, d), h1 = F.L(-w / 2 + w * 0.55, d - 0.35);
    kit.curve(polyWallQuads([h0, h1], 0.03, y + 0.12, y + 1.95), 'paint', { tint: TINT.cubicle });
    taken.push(r, cub.c);
    placed.cubicles++;
    placed.fittings.push({ kind: 'cubicle', pts: r.pts });
  }
  // the basin: as near the door as it will go
  // (a step clear of the doorway: the door's leaf swings in beside it)
  let bas = null;
  for (const [w, d, g] of [[0.9, 0.55, 1.3], [0.9, 0.55, 1.1], [0.75, 0.5, 1.05]]) { bas = best(w, d, 0.7, (F) => -dist(F), g); if (bas) break; }
  if (bas) {
    const { F, r } = bas, rot = F.rot, ang = Math.atan2(F.n[1], F.n[0]);
    const [vx, vz] = F.L(0, r.d / 2), vw = r.w;
    kit.curve(orientedBox(vx, vz, vw, r.d, y + 0.82, y + 0.88, rot), 'marble');
    kit.curve(orientedBox(...F.L(0, r.d / 2 - 0.02), vw - 0.04, r.d - 0.05, y, y + 0.82, rot), 'wood');
    // a round basin set in the marble, a tap arching over it
    const [bx, bz] = F.L(0, 0.32);
    kit.curve(prism(ellipsePts(bx, bz, 0.19, 0.25, 22, ang), y + 0.88, y + 0.93, { holes: [ellipsePts(bx, bz, 0.14, 0.2, 18, ang)] }), 'paint', { tint: TINT.porcelain });
    kit.curve(flatPoly(ellipsePts(bx, bz, 0.14, 0.2, 18, ang), null, y + 0.885, true), 'paint', { tint: [0.9, 0.9, 0.9] });
    kit.curve(cylinder(bx, bz, 0.025, y + 0.886, y + 0.889, 8), 'metal', { tint: TINT.chrome });
    const tap = [0.08, 0.14, 0.2, 0.24].map((v, k) => { const [px, pz] = F.L(0, v); return [px, y + [0.88, 1.06, 1.08, 1.02][k], pz]; });
    kit.curve(sweep(tap, 0.025, 0.025), 'metal', { tint: TINT.chrome });
    // the mirror over it, a lit strip over that
    kit.curve(orientedBox(...F.L(0, 0.012), vw - 0.04, 0.015, y + 1.1, y + 1.9, rot), 'mirror');
    kit.curve(orientedBox(...F.L(0, 0.04), vw - 0.1, 0.05, y + 1.93, y + 1.97, rot), 'neon', { tint: [1, 0.95, 0.85] });
    kit.solids(outlineBoxes(r.pts, y, y + 0.92, 0.25), 'wc');
    taken.push(r);
    placed.basins++;
    placed.fittings.push({ kind: 'basin', pts: r.pts });
    // the hand dryer, on the wall a step to one side of it (the side away from the door first)
    const away = Math.hypot(...F.L(0.8, 0).map((v, i) => v - dc[i])) > Math.hypot(...F.L(-0.8, 0).map((v, i) => v - dc[i])) ? 1 : -1;
    for (const off of [0.75, 0.95, 1.2, -0.75, -0.95, -1.2].map((o) => o * away)) {
      const G = frame(F.s + off, 0.3), dr = rect(G, 0.3, 0.2);
      if (nearDoor(dr, 0.75) || !samples(dr).every(([x, z]) => pointInPoly(x, z, free) && !taken.some((tk) => pointInPoly(x, z, tk.pts)) && !kit.world.hit([x - 0.03, y + 1.05, z - 0.03], [x + 0.03, y + 1.35, z + 0.03]))) continue;
      kit.curve(orientedBox(...G.L(0, 0.09), 0.28, 0.18, y + 1.05, y + 1.35, G.rot), 'metal', { tint: TINT.chrome });
      kit.curve(cylinder(...G.L(0, 0.14), 0.035, y + 0.99, y + 1.05, 8), 'metal', { tint: TINT.chrome });
      placed.dryer = true;
      placed.fittings.push({ kind: 'dryer', pts: dr.pts, high: true });
      break;
    }
  }
  return placed;
}

// ── rooms in the ring: where their walls are, angle by angle ──
// (the casino's rooms are slices of its ring: an inner wall, an outer wall)
export function ringRoom(cells, centre) {
  const [cx, cz] = centre;
  const pts = cells.map(([x, z]) => { const px = x + 0.5, pz = z + 0.5; return { a: Math.atan2(pz - cz, px - cx), r: Math.hypot(px - cx, pz - cz) }; });
  const mean = Math.atan2(pts.reduce((s, p) => s + Math.sin(p.a), 0), pts.reduce((s, p) => s + Math.cos(p.a), 0));
  for (const p of pts) { let d = p.a - mean; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; p.u = d; }
  const rm = pts.reduce((s, p) => s + p.r, 0) / pts.length;
  const span = (u) => {
    const near = pts.filter((p) => Math.abs(p.u - u) * p.r < 0.75);
    if (!near.length) return null;
    // (M6.17.1, Rhys: "still some jutty-out bits" - fittings by the middle wall poked through it into the ramp) never past the ring's inner face, centre[2]
    return [Math.min(...near.map((p) => p.r)) - 0.5 + 0.12, Math.min(centre[2] || Infinity, Math.max(...near.map((p) => p.r)) + 0.5 - 0.12)];
  };
  const along = (u, r) => { const a = mean + u; return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; };
  return { mean, rm, u0: Math.min(...pts.map((p) => p.u)), u1: Math.max(...pts.map((p) => p.u)), span, along };
}

// ── the Quiet Booth (Rhys: "comfy seating along the curved wall, please") ──
// A deep, buttoned banquette following the outer wall from end to end, low
// round tables in front of it, lamps on them. Keeps clear of the door.
export function quietBooth(kit, cells, door, y, centre) {
  const R = ringRoom(cells, centre), plum = [0.32, 0.1, 0.22];
  const du = Math.atan2(door[1] + 0.5 - centre[1], door[0] + 0.5 - centre[0]) - R.mean;
  // (M6.17.1, Rhys: "Quiet Room's seating should FILL along the wall") from
  // the room's very ends - the far side of its end squares, not their middles -
  // up to the walls there, and only a doorway's width spared at the door
  const ua = R.u0 - 0.5 / R.rm, ub = R.u1 + 0.5 / R.rm;
  const n = Math.max(2, Math.ceil((ub - ua) * R.rm / 0.25));
  const clear = (u, sp) => [sp[1] - 0.3, sp[1] - 0.8].every((r) => { const [x, z] = R.along(u, r); return !kit.world.hits([x - 0.04, y + 0.1, z - 0.04], [x + 0.04, y + 0.9, z + 0.04]).some((h) => h.tag !== 'ring'); });
  const runs = [[]];
  for (let i = 0; i <= n; i++) {
    const u = ua + (ub - ua) * i / n, sp = R.span(u);
    if (!sp || !clear(u, sp) || Math.abs(Math.atan2(Math.sin(u - du), Math.cos(u - du))) * R.rm < 0.9) { if (runs[runs.length - 1].length) runs.push([]); continue; }
    runs[runs.length - 1].push({ u, sp });
  }
  const out = { seats: 0, tables: 0, length: 0, span: (ub - ua) * R.rm };
  for (const run of runs.filter((r) => r.length >= 3)) {
    const back = run.map((q) => R.along(q.u, q.sp[1] - 0.02)), seatBack = run.map((q) => R.along(q.u, q.sp[1] - 0.24)), front = run.map((q) => R.along(q.u, q.sp[1] - 0.8));
    const seat = back.concat(front.slice().reverse()), backRest = back.concat(seatBack.slice().reverse());
    kit.curve(prism(offsetLoop(seat, -0.04), y, y + 0.22, { sheet: 'plinth' }), 'wood');
    kit.curve(prism(seat, y + 0.22, y + 0.46, { sheet: 'seat' }), 'paint', { tint: plum });
    kit.curve(prism(backRest, y + 0.46, y + 1.0, { sheet: 'back' }), 'paint', { tint: plum });
    kit.solids(outlineBoxes(seat, y, y + 0.46, 0.25), 'banquette');
    kit.solids(outlineBoxes(backRest, y + 0.46, y + 1.0, 0.25), 'banquette');
    out.seats += run.length; out.length += (run[run.length - 1].u - run[0].u) * R.rm;
    out.runs = (out.runs || []).concat([[run[0].u, run[run.length - 1].u]]);
    // (M6.17.1: "and needs illuminating better") brass wall lights over it, every couple of metres
    for (let i = 3; i < run.length - 2; i += 8) {
      const q = run[i], [x, z] = R.along(q.u, q.sp[1] - 0.08), rot = R.mean + q.u + Math.PI / 2;
      kit.curve(orientedBox(x, z, 0.14, 0.1, y + 1.55, y + 1.62, rot), 'metal', { tint: TINT.brass });
      const [lx, lz] = R.along(q.u, q.sp[1] - 0.16);
      kit.box([lx - 0.07, y + 1.62, lz - 0.07], [lx + 0.07, y + 1.82, lz + 0.07], 'lamp', { solid: false });
      out.sconces = (out.sconces || 0) + 1;
    }
    // low round tables in front of it, a lamp on each, every few metres
    for (let i = 4; i < run.length - 2; i += 9) {
      const q = run[i];
      if (q.sp[1] - q.sp[0] < 2.3) continue;
      const t = R.along(q.u, q.sp[1] - 1.3);
      if (kit.world.hit([t[0] - 0.3, y + 0.05, t[1] - 0.3], [t[0] + 0.3, y + 0.5, t[1] + 0.3])) continue;
      kit.curve([...cylinder(t[0], t[1], 0.32, y + 0.42, y + 0.46, 18), ...cylinder(t[0], t[1], 0.05, y, y + 0.42, 8)], 'wood');
      kit.curve(cylinder(t[0], t[1], 0.1, y + 0.46, y + 0.52, 10), 'metal', { tint: TINT.brass });
      kit.box([t[0] - 0.08, y + 0.52, t[1] - 0.08], [t[0] + 0.08, y + 0.68, t[1] + 0.08], 'lamp', { solid: false });
      kit.world.addSolid([t[0] - 0.32, y, t[1] - 0.32], [t[0] + 0.32, y + 0.46, t[1] + 0.32], 'table');
      out.tables++;
    }
  }
  return out;
}

// ── the Cash Vault (Rhys: "That's the Cash Vault") ──
// Behind the second floor's reinforced doors: a wall of safe-deposit boxes
// along the curved outer wall, steel shelving stacked with banknotes, a
// counting table with its machine, gold on a trolley.
export function cashVault(kit, cells, door, y, wallH, centre) {
  const R = ringRoom(cells, centre), steel = [0.55, 0.58, 0.62], notes = [0.42, 0.55, 0.38], bands = [0.85, 0.75, 0.55];
  const du = Math.atan2(door[1] + 0.5 - centre[1], door[0] + 0.5 - centre[0]) - R.mean;
  const out = { boxes: 0, shelves: 0, bundles: 0 };
  // the deposit boxes: a grid of little doors, the whole outer wall, floor to 2.4
  const n = Math.floor((R.u1 - R.u0) * R.rm / 0.5);
  for (let i = 0; i < n; i++) {
    const u = R.u0 + (i + 0.5) * (R.u1 - R.u0) / n, sp = R.span(u);
    if (!sp) continue;
    const [x, z] = R.along(u, sp[1] - 0.15), rot = R.mean + u + Math.PI / 2;
    kit.curve(orientedBox(x, z, 0.5, 0.3, y, y + 2.4, rot), 'metal', { tint: steel });
    const f = R.along(u, sp[1] - 0.31);
    for (let k = 0; k < 8; k++) {
      kit.curve(orientedBox(f[0], f[1], 0.44, 0.02, y + 0.06 + k * 0.29, y + 0.31 + k * 0.29, rot), 'metal', { tint: [0.68, 0.7, 0.74] });
      const kn = R.along(u + 0.12 / R.rm, sp[1] - 0.33);
      kit.curve(orientedBox(kn[0], kn[1], 0.04, 0.02, y + 0.17 + k * 0.29, y + 0.21 + k * 0.29, rot), 'metal', { tint: TINT.brass });
      out.boxes++;
    }
    kit.world.addSolid([x - 0.3, y, z - 0.3], [x + 0.3, y + 2.4, z + 0.3], 'vault');
  }
  // shelving down the middle of the room, laden with banknotes in their bands
  const mid = (R.u0 + R.u1) / 2;
  for (const off of [-0.32, 0.32]) {
    const u = mid + off * (R.u1 - R.u0) / 2;
    if (Math.abs(Math.atan2(Math.sin(u - du), Math.cos(u - du))) * R.rm < 1.6) continue;
    const sp = R.span(u);
    if (!sp || sp[1] - sp[0] < 2.6) continue;
    const r = (sp[0] + sp[1]) / 2 - 0.2, [x, z] = R.along(u, r), rot = R.mean + u;      // set radially: you walk round its ends
    for (const h of [0.05, 0.6, 1.15, 1.7]) {
      kit.curve(orientedBox(x, z, 1.6, 0.5, y + h, y + h + 0.03, rot), 'metal', { tint: steel });
      // bundles of notes
      for (let b = -3; b <= 3; b++) for (const side of [-0.12, 0.12]) {
        const c = Math.cos(rot), s = Math.sin(rot), bx = x + c * b * 0.2 - s * side, bz = z + s * b * 0.2 + c * side;
        const tall = 0.08 + ((b + 3 + (side > 0 ? 2 : 0) + h * 10) % 3) * 0.05;
        kit.curve(orientedBox(bx, bz, 0.16, 0.08, y + h + 0.03, y + h + 0.03 + tall, rot), 'paint', { tint: notes });
        kit.curve(orientedBox(bx, bz, 0.03, 0.085, y + h + 0.03, y + h + 0.035 + tall, rot), 'paint', { tint: bands });
        out.bundles++;
      }
    }
    for (const [ex, ez] of [[-0.78, -0.23], [0.78, -0.23], [-0.78, 0.23], [0.78, 0.23]]) {
      const c = Math.cos(rot), s = Math.sin(rot);
      kit.curve(orientedBox(x + c * ex - s * ez, z + s * ex + c * ez, 0.04, 0.04, y, y + 1.75, rot), 'metal', { tint: steel });
    }
    kit.solids(outlineBoxes(rectPts(x, z, 1.6, 0.5, rot), y, y + 1.75, 0.25), 'vault');
    out.shelves++;
  }
  // a counting table with its machine, and a trolley of gold, by the door side
  const tu = du + (du > mid ? -1 : 1) * 2.4 / R.rm, tsp = R.span(tu);
  if (tsp) {
    const [x, z] = R.along(tu, (tsp[0] + tsp[1]) / 2), rot = R.mean + tu + Math.PI / 2;
    kit.curve(orientedBox(x, z, 1.4, 0.7, y + 0.72, y + 0.76, rot), 'metal', { tint: steel });
    for (const [ex, ez] of [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]]) {
      const c = Math.cos(rot), s = Math.sin(rot);
      kit.curve(orientedBox(x + c * ex - s * ez, z + s * ex + c * ez, 0.04, 0.04, y, y + 0.72, rot), 'metal', { tint: steel });
    }
    kit.curve(orientedBox(x, z, 0.32, 0.3, y + 0.76, y + 0.98, rot), 'paint', { tint: [0.2, 0.2, 0.22] });
    kit.curve(orientedBox(x + 0.4 * Math.cos(rot), z + 0.4 * Math.sin(rot), 0.3, 0.2, y + 0.76, y + 0.86, rot), 'paint', { tint: notes });
    kit.solids(outlineBoxes(rectPts(x, z, 1.4, 0.7, rot), y + 0.72, y + 0.76, 0.25), 'table');
    kit.world.addSolid([x - 0.06, y, z - 0.06], [x + 0.06, y + 0.72, z + 0.06], 'table');
    // (M6.17.7) somewhere free on the floor: clear of everything already in the
    // room (the trolley had been set down in the middle shelving) and of the door
    const doorAt = [door[0] + 0.5, door[1] + 0.5];
    const free = (cx, cz, half) => Math.hypot(cx - doorAt[0], cz - doorAt[1]) > 1.4 && R.span(Math.atan2(cz - centre[1], cx - centre[0]) - R.mean) &&
      !kit.world.solids.some((q) => q.max[1] > y + 0.1 && q.min[1] < y + 1.2 && q.max[0] > cx - half && q.min[0] < cx + half && q.max[2] > cz - half && q.min[2] < cz + half);
    const spots = [];
    for (const du2 of [1.3, -1.3, 1.6, -1.6, 2.0, -2.0, 2.6, -2.6]) for (const dr of [0, -0.6, 0.6]) spots.push([tu + du2 / R.rm, dr]);
    const spotAt = ([u, dr]) => { const sp = R.span(u); return sp ? R.along(u, (sp[0] + sp[1]) / 2 + dr) : null; };
    // gold: bars stacked on a low trolley beside it
    const gs = spots.find((q) => { const p = spotAt(q); return p && free(p[0], p[1], 0.5); });
    const g = gs ? spotAt(gs) : R.along(tu + 1.3 / R.rm, (tsp[0] + tsp[1]) / 2);
    kit.curve(orientedBox(g[0], g[1], 0.9, 0.55, y + 0.25, y + 0.3, rot), 'metal', { tint: steel });
    for (let row = 0; row < 3; row++) for (let b = -2; b <= 2; b++) for (const side of [-0.13, 0.13]) {
      const c = Math.cos(rot), s = Math.sin(rot), bx = g[0] + c * b * 0.15 - s * side, bz = g[1] + s * b * 0.15 + c * side;
      if (row === 2 && Math.abs(b) > 1) continue;
      kit.curve(orientedBox(bx, bz, 0.12, 0.22, y + 0.3 + row * 0.05, y + 0.35 + row * 0.05, rot), 'metal', { tint: [1.0, 0.8, 0.3] });
    }
    kit.world.addSolid([g[0] - 0.45, y, g[1] - 0.45], [g[0] + 0.45, y + 0.45, g[1] + 0.45], 'table');
    out.table = true;
    // (M6.17.5, Rhys: "Bundles of cash in Vault - there surely must be something
    // valuable in there?") the reds' ledger: who paid, who was paid, and where the
    // money went - on the counting table, by the machine. Worth more than the cash.
    const lx = x - 0.4 * Math.cos(rot), lz = z - 0.4 * Math.sin(rot);
    kit.curve(orientedBox(lx, lz, 0.24, 0.32, y + 0.76, y + 0.8, rot + 0.2), 'paint', { tint: [0.36, 0.06, 0.07], prop: 'ledger' });
    kit.curve(orientedBox(lx, lz, 0.22, 0.3, y + 0.8, y + 0.805, rot + 0.2), 'paint', { tint: [0.9, 0.86, 0.72], prop: 'ledger' });
    out.ledger = [lx, y + 0.8, lz];
    // (M6.17.6, Rhys: the Yellows want "something in a locket"; M6.17.7: "I
    // didn't see the locket/golden trolley anywhere") beyond the gold, on a
    // plinth of its own at chest height under a little lamp: an open velvet case,
    // a gold locket the size of a coin-purse, a glint on its rim
    const c = Math.cos(rot), sn = Math.sin(rot);
    const ends = [[0.95, 0], [-0.95, 0], [0, 0.75], [0, -0.75], [1.3, 0], [-1.3, 0]].map(([a, b]) => [g[0] + a * c - b * sn, g[1] + a * sn + b * c]);
    const [kx, kz] = ends.find((e) => free(e[0], e[1], 0.3)) || ends[0];
    const top = y + 1.05;
    kit.curve(orientedBox(kx, kz, 0.34, 0.34, y, y + 0.06, rot), 'metal', { tint: steel });
    kit.curve(orientedBox(kx, kz, 0.22, 0.22, y + 0.06, top - 0.04, rot), 'paint', { tint: [0.12, 0.1, 0.1] });
    kit.curve(orientedBox(kx, kz, 0.36, 0.36, top - 0.04, top, rot), 'metal', { tint: [0.85, 0.7, 0.35] });
    kit.world.addSolid([kx - 0.18, y, kz - 0.18], [kx + 0.18, top, kz + 0.18], 'table');
    // (M6.17.9, Rhys: "the locket kinda looks like an oreo" - a gold disc lying
    // flat in a box) an open case, its lid up behind, and the locket standing in
    // it facing the door: an upright oval on its bail and chain
    const velvet = [0.45, 0.05, 0.12];
    let px = -sn, pz = c;                                         // across the case: the lid on the side away from the door
    if (Math.hypot(kx + px - doorAt[0], kz + pz - doorAt[1]) < Math.hypot(kx - px - doorAt[0], kz - pz - doorAt[1])) { px = -px; pz = -pz; }
    kit.curve(orientedBox(kx, kz, 0.24, 0.18, top, top + 0.045, rot), 'paint', { tint: [0.16, 0.05, 0.07] });
    kit.curve(orientedBox(kx, kz, 0.21, 0.15, top + 0.045, top + 0.05, rot), 'paint', { tint: velvet });
    kit.curve(orientedBox(kx + px * 0.095, kz + pz * 0.095, 0.24, 0.02, top + 0.045, top + 0.25, rot), 'paint', { tint: [0.16, 0.05, 0.07] });
    kit.curve(orientedBox(kx + px * 0.082, kz + pz * 0.082, 0.21, 0.006, top + 0.06, top + 0.24, rot), 'paint', { tint: velvet });
    // the oval: slices, each as wide as the oval is at its height; its rim catches the light (locketGlint)
    const oy = top + 0.13, A = 0.05, B = 0.065, n = 12, lx2 = kx + px * 0.02, lz2 = kz + pz * 0.02;
    for (let k = 0; k < n; k++) {
      const y0 = oy - B + (2 * B) * k / n, y1 = oy - B + (2 * B) * (k + 1) / n, ym = (y0 + y1) / 2;
      const w = A * Math.sqrt(Math.max(0, 1 - ((ym - oy) / B) ** 2));
      if (w < 0.006) continue;
      kit.curve(orientedBox(lx2, lz2, 2 * w, 0.016, y0, y1, rot), 'neon', { tint: [0.72, 0.43, 0.07], prop: 'locket' });   // (a soft glow: as metal it showed black in the dim vault)
      for (const sd of [-1, 1]) kit.curve(polySides(rectPts(lx2 + c * sd * w, lz2 + sn * sd * w, 0.008, 0.02, rot), y0, y1, { sheet: 'locketGlint' }), 'neon', { tint: [1, 0.86, 0.45], prop: 'locket' });
    }
    // a raised panel on its face, the bail on top, and its chain looped up over the lid
    kit.curve(orientedBox(lx2 - px * 0.009, lz2 - pz * 0.009, 0.05, 0.004, oy - 0.035, oy + 0.035, rot), 'neon', { tint: [0.95, 0.68, 0.2], prop: 'locket' });
    kit.curve(orientedBox(lx2 + px * 0.009, lz2 + pz * 0.009, 0.05, 0.004, oy - 0.035, oy + 0.035, rot), 'neon', { tint: [0.95, 0.68, 0.2], prop: 'locket' });
    kit.curve(orientedBox(lx2, lz2, 0.012, 0.012, oy + B, oy + B + 0.02, rot), 'neon', { tint: [0.72, 0.43, 0.07], prop: 'locket' });
    for (let k = 0; k <= 6; k++) {
      const f = k / 6, cy = oy + B + 0.02 + Math.sin(f * Math.PI) * 0.03 + f * 0.02;
      kit.curve(orientedBox(lx2 + px * 0.07 * f, lz2 + pz * 0.07 * f, 0.008, 0.008, cy, cy + 0.008, rot), 'neon', { tint: [0.72, 0.43, 0.07], prop: 'locket' });
    }
    out.locket = [kx, top + 0.06, kz];
    out.locketSize = 2 * B;
    out.locketLamp = [kx, top + 1.1, kz];
  }
  return out;
}
