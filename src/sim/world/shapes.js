// FRONTLINE - shapes that are not boxes (the casino's second pass:
// round floors with round holes, smooth walls, oval tables, chairs turned to
// face them). Drawn as faces (render.js: quads and triangles, each with where
// it really is for the lightmap, `lm`, so a whole surface is one patch);
// walked into as boxes that follow the shape closely. Pure: no engine.
//
// Outlines are lists of [x, z] points, in either direction.

import earcut from './earcut.js';

const TAU = Math.PI * 2;

export const circlePts = (cx, cz, r, n, a0) => {
  a0 = a0 || 0; const out = [];
  for (let i = 0; i < n; i++) { const a = a0 + TAU * i / n; out.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); }
  return out;
};
export const ellipsePts = (cx, cz, rx, rz, n, rot) => {
  rot = rot || 0; const c = Math.cos(rot), s = Math.sin(rot), out = [];
  for (let i = 0; i < n; i++) { const a = TAU * i / n, x = Math.cos(a) * rx, z = Math.sin(a) * rz; out.push([cx + x * c - z * s, cz + x * s + z * c]); }
  return out;
};
// a rectangle w (along the yaw) by d, its middle at cx, cz; yaw as the game's (0 = facing -z)
export const rectPts = (cx, cz, w, d, rot) => {
  const c = Math.cos(rot || 0), s = Math.sin(rot || 0);
  return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([x, z]) => [cx + x * c - z * s, cz + x * s + z * c]);
};
// a rectangle with its corners rounded off (radius rr)
export const roundRectPts = (cx, cz, w, d, rr, rot, per) => {
  per = per || 4; rr = Math.min(rr, w / 2, d / 2);
  const c = Math.cos(rot || 0), s = Math.sin(rot || 0), out = [];
  const corners = [[w / 2 - rr, d / 2 - rr, 0], [-w / 2 + rr, d / 2 - rr, Math.PI / 2], [-w / 2 + rr, -d / 2 + rr, Math.PI], [w / 2 - rr, -d / 2 + rr, 1.5 * Math.PI]];
  for (const [x0, z0, a0] of corners) for (let i = 0; i <= per; i++) {
    const a = a0 + (Math.PI / 2) * i / per, x = x0 + Math.cos(a) * rr, z = z0 + Math.sin(a) * rr;
    out.push([cx + x * c - z * s, cz + x * s + z * c]);
  }
  return out;
};

export const signedArea = (pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
export function pointInPoly(x, z, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

// A flat face with holes: triangles, up or down, all one lightmap sheet
export function flatPoly(outer, holes, y, up, sheet) {
  holes = holes || [];
  const data = [], holeIdx = [];
  for (const [x, z] of outer) data.push(x, z);
  for (const h of holes) { holeIdx.push(data.length / 2); for (const [x, z] of h) data.push(x, z); }
  const tri = earcut(data, holeIdx.length ? holeIdx : null, 2), out = [];
  const n = [0, up ? 1 : -1, 0];
  for (let i = 0; i < tri.length; i += 3) {
    const v = [tri[i], tri[i + 1], tri[i + 2]].map((k) => [data[k * 2], y, data[k * 2 + 1]]);
    out.push({ v, n, lm: v.map((p) => [p[0], up ? p[2] : -p[2]]), sheet: sheet || (up ? 'top' : 'bottom') });
  }
  return out;
}

// The sides of an outline, from y0 to y1, facing out (or in, for a hole's lining)
export function polySides(pts, y0, y1, opts) {
  opts = opts || {};
  const ccw = signedArea(pts) > 0, out = [], inward = !!opts.inward;
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    if (opts.open && i === pts.length - 1) break;
    const dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz);
    if (l < 1e-6) continue;
    // outward: for an anticlockwise outline (x right, z down, as the maps are drawn) the right-hand normal
    let n = ccw ? [dz / l, 0, -dx / l] : [-dz / l, 0, dx / l];
    if (inward) n = [-n[0], 0, -n[2]];
    const ya0 = opts.y0At ? opts.y0At(i, 0) : y0, ya1 = opts.y1At ? opts.y1At(i, 0) : y1;
    const yb0 = opts.y0At ? opts.y0At(i, 1) : y0, yb1 = opts.y1At ? opts.y1At(i, 1) : y1;
    out.push({ v: [[p[0], ya0, p[1]], [q[0], yb0, q[1]], [q[0], yb1, q[1]], [p[0], ya1, p[1]]], n,
      lm: [[s, -ya0], [s + l, -yb0], [s + l, -yb1], [s, -ya1]], uv: [[s, -ya0], [s + l, -yb0], [s + l, -yb1], [s, -ya1]], sheet: (opts.sheet || 'side') + Math.floor(s / 12) });
    s += l;
  }
  return out;
}

// A solid slab of an outline (with holes): top, bottom, sides
export function prism(pts, y0, y1, opts) {
  opts = opts || {};
  const out = [];
  if (opts.top !== false) out.push(...flatPoly(pts, opts.holes, y1, true, opts.sheet ? opts.sheet + 't' : undefined));
  if (opts.bottom !== false) out.push(...flatPoly(pts, opts.holes, y0, false, opts.sheet ? opts.sheet + 'b' : undefined));
  if (opts.sides !== false) {
    out.push(...polySides(pts, y0, y1, { sheet: (opts.sheet || '') + 's' }));
    for (const h of opts.holes || []) out.push(...polySides(h, y0, y1, { inward: true, sheet: (opts.sheet || '') + 'h' }));
  }
  return out;
}
export const cylinder = (cx, cz, r, y0, y1, n, opts) => prism(circlePts(cx, cz, r, n || 12), y0, y1, opts);
export const orientedBox = (cx, cz, w, d, y0, y1, rot, opts) => prism(rectPts(cx, cz, w, d, rot), y0, y1, opts);

// Collision for an outline: a box per strip `cell` deep, as wide as the
// outline is across that strip (holes left out). Close enough to stand on.
export function outlineBoxes(pts, y0, y1, cell, holes) {
  cell = cell || 0.25; holes = holes || [];
  let z0 = Infinity, z1 = -Infinity;
  for (const [, z] of pts) { z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
  const out = [];
  for (let z = z0; z < z1 - 1e-6; z += cell) {
    const za = z, zb = Math.min(z1, z + cell);
    // where the outline crosses this strip's middle, in and out in pairs (an
    // outline may be hollow - a landing round a post), each widened to where
    // it crosses the strip's edges
    const pairs = (zz) => { const c = crossings(pts, zz), o = []; for (let i = 0; i + 1 < c.length; i += 2) o.push([c[i], c[i + 1]]); return o; };
    const mid = pairs((za + zb) / 2);
    for (const e of [...pairs(za + 1e-4), ...pairs(zb - 1e-4)]) for (const m of mid) if (e[0] < m[1] && e[1] > m[0]) { m[0] = Math.min(m[0], e[0]); m[1] = Math.max(m[1], e[1]); }
    for (const [xa, xb] of mid) {
      if (!holes.length) { out.push([[xa, y0, za], [xb, y1, zb]]); continue; }
      // holes: cut the strip where a hole covers its middle
      const cut = [];
      for (const h of holes) { const c = crossings(h, (za + zb) / 2); for (let i = 0; i + 1 < c.length; i += 2) cut.push([c[i], c[i + 1]]); }
      cut.sort((a, b) => a[0] - b[0]);
      let x = xa;
      for (const [c0, c1] of cut) { if (c0 > x + 0.02 && c0 < xb) out.push([[x, y0, za], [Math.min(c0, xb), y1, zb]]); x = Math.max(x, c1); }
      if (xb > x + 0.02) out.push([[x, y0, za], [xb, y1, zb]]);
    }
  }
  return out;
}
function crossings(pts, z) {
  const xs = [];
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    if ((z0 <= z && z1 > z) || (z1 <= z && z0 > z)) xs.push(x0 + (x1 - x0) * (z - z0) / (z1 - z0));
  }
  return xs.sort((a, b) => a - b);
}

// A tube of square section along a path of [x, y, z] points (a handrail)
export function sweep(path, w, h) {
  const out = [];
  for (let i = 0; i + 1 < path.length; i++) {
    const a = path[i], b = path[i + 1];
    const dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz) || 1;
    const sx = -dz / l * w / 2, sz = dx / l * w / 2;
    const c = (p, sgn, up) => [p[0] + sx * sgn, p[1] + up, p[2] + sz * sgn];
    const n1 = [-dz / l, 0, dx / l], n2 = [dz / l, 0, -dx / l];
    out.push({ v: [c(a, 1, 0), c(b, 1, 0), c(b, 1, h), c(a, 1, h)], n: n1 });
    out.push({ v: [c(a, -1, 0), c(b, -1, 0), c(b, -1, h), c(a, -1, h)], n: n2 });
    out.push({ v: [c(a, -1, h), c(b, -1, h), c(b, 1, h), c(a, 1, h)], n: [0, 1, 0] });
    out.push({ v: [c(a, -1, 0), c(b, -1, 0), c(b, 1, 0), c(a, 1, 0)], n: [0, -1, 0] });
  }
  return out;
}

// ── a wall along a polyline (a smoothed map wall) ──
// points: [[x, z], ...] (open). Mitred at the bends. Both faces, the top, the ends.
export function polyWallQuads(points, t, y0, y1, opts) {
  opts = opts || {};
  const L = offsetPolyline(points, t / 2), R = offsetPolyline(points, -t / 2), out = [];
  let s = 0;
  for (let i = 0; i + 1 < points.length; i++) {
    const l = Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]);
    const d = [(points[i + 1][0] - points[i][0]) / (l || 1), (points[i + 1][1] - points[i][1]) / (l || 1)];
    const nl = [-d[1], 0, d[0]], nr = [d[1], 0, -d[0]];
    const sheet = (opts.sheet || 'w') + Math.floor(s / 12);
    const lmq = (ya, yb) => [[s, -ya], [s + l, -ya], [s + l, -yb], [s, -yb]];
    out.push({ v: [[L[i][0], y0, L[i][1]], [L[i + 1][0], y0, L[i + 1][1]], [L[i + 1][0], y1, L[i + 1][1]], [L[i][0], y1, L[i][1]]], n: nl, lm: lmq(y0, y1), uv: lmq(y0, y1), sheet: sheet + 'l' });
    out.push({ v: [[R[i][0], y0, R[i][1]], [R[i + 1][0], y0, R[i + 1][1]], [R[i + 1][0], y1, R[i + 1][1]], [R[i][0], y1, R[i][1]]], n: nr, lm: lmq(y0, y1), uv: lmq(y0, y1), sheet: sheet + 'r' });
    if (!opts.noTop) out.push({ v: [[L[i][0], y1, L[i][1]], [L[i + 1][0], y1, L[i + 1][1]], [R[i + 1][0], y1, R[i + 1][1]], [R[i][0], y1, R[i][1]]], n: [0, 1, 0] });
    if (opts.bottom) out.push({ v: [[L[i][0], y0, L[i][1]], [L[i + 1][0], y0, L[i + 1][1]], [R[i + 1][0], y0, R[i + 1][1]], [R[i][0], y0, R[i][1]]], n: [0, -1, 0] });
    s += l;
  }
  if (!opts.noEnds) {
    const k = points.length - 1;
    for (const [i, j, sg] of [[0, 1, -1], [k, k - 1, -1]]) {
      const d = [points[j][0] - points[i][0], points[j][1] - points[i][1]], l = Math.hypot(d[0], d[1]) || 1;
      out.push({ v: [[L[i][0], y0, L[i][1]], [R[i][0], y0, R[i][1]], [R[i][0], y1, R[i][1]], [L[i][0], y1, L[i][1]]], n: [sg * d[0] / l, 0, sg * d[1] / l] });
    }
  }
  return out;
}
// the line moved sideways by `off` (left, looking along it), mitred
export function offsetPolyline(pts, off) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const d0 = i > 0 ? norm2([p[0] - a[0], p[1] - a[1]]) : norm2([b[0] - p[0], b[1] - p[1]]);
    const d1 = i < pts.length - 1 ? norm2([b[0] - p[0], b[1] - p[1]]) : d0;
    const n0 = [-d0[1], d0[0]], n1 = [-d1[1], d1[0]];
    let m = norm2([n0[0] + n1[0], n0[1] + n1[1]]);
    const c = m[0] * n1[0] + m[1] * n1[1];
    const k = c > 0.35 ? off / c : off;
    if (!(Math.abs(m[0]) + Math.abs(m[1]))) m = n1;
    out.push([p[0] + m[0] * k, p[1] + m[1] * k]);
  }
  return out;
}
const norm2 = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
// ...and its collision: a box round each short piece of it
export function polyWallBoxes(points, t, y0, y1, seg) {
  seg = seg || 0.4; const out = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const [ax, az] = points[i], [bx, bz] = points[i + 1], l = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.ceil(l / seg));
    const ux = (bx - ax) / (l || 1), uz = (bz - az) / (l || 1), px = -uz * t / 2, pz = ux * t / 2;
    for (let k = 0; k < n; k++) {
      const p0 = [ax + (bx - ax) * k / n, az + (bz - az) * k / n], p1 = [ax + (bx - ax) * (k + 1) / n, az + (bz - az) * (k + 1) / n];
      const xs = [p0[0] + px, p0[0] - px, p1[0] + px, p1[0] - px], zs = [p0[1] + pz, p0[1] - pz, p1[1] + pz, p1[1] - pz];
      out.push([[Math.min(...xs), y0, Math.min(...zs)], [Math.max(...xs), y1, Math.max(...zs)]]);
    }
  }
  return out;
}

// ── smoothing a line drawn in map squares ──
// Douglas-Peucker: the fewest points within `tol` of the line
export function simplify(pts, tol) {
  if (pts.length < 3) return pts.slice();
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let worst = -1, wi = 0;
  for (let i = 1; i < pts.length - 1; i++) { const d = segDist(pts[i], a, b); if (d > worst) { worst = d; wi = i; } }
  if (worst <= tol) return [a, b];
  const l = simplify(pts.slice(0, wi + 1), tol), r = simplify(pts.slice(wi), tol);
  return l.slice(0, -1).concat(r);
}
export function segDist(p, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz;
  let t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / l2 : 0; t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dz * t);
}
// Chaikin: the corners cut, `n` times (the ends stay put)
export function chaikin(pts, n) {
  let p = pts;
  for (let k = 0; k < n; k++) {
    if (p.length < 3) return p;
    const q = [p[0]];
    for (let i = 0; i + 1 < p.length; i++) {
      const a = p[i], b = p[i + 1];
      const A = [a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], B = [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75];
      if (i > 0) q.push(A);
      if (i + 1 < p.length - 1) q.push(B);
    }
    q.push(p[p.length - 1]);
    p = q;
  }
  return p;
}

// ── outlines of sets of map squares ──
// cells: a Set of 'x,z' keys, one square = one metre. Returns the outline
// loops (corner points, straight runs merged), the biggest first: the outside,
// then any holes.
export function traceCells(cells) {
  const has = (x, z) => cells.has(x + ',' + z), edges = new Map();
  const add = (a, b) => { const k = a.join(','); if (!edges.has(k)) edges.set(k, []); edges.get(k).push(b); };
  for (const key of cells) {
    const [x, z] = key.split(',').map(Number);
    if (!has(x, z - 1)) add([x, z], [x + 1, z]);
    if (!has(x + 1, z)) add([x + 1, z], [x + 1, z + 1]);
    if (!has(x, z + 1)) add([x + 1, z + 1], [x, z + 1]);
    if (!has(x - 1, z)) add([x, z + 1], [x, z]);
  }
  const loops = [];
  for (;;) {
    let startKey = null;
    for (const [k, l] of edges) if (l.length) { startKey = k; break; }
    if (startKey === null) break;
    const loop = [];
    let k = startKey;
    for (let guard = 0; guard < 100000; guard++) {
      const l = edges.get(k);
      if (!l || !l.length) break;
      const b = l.shift();
      loop.push(k.split(',').map(Number));
      k = b.join(',');
      if (k === startKey) break;
    }
    // straight runs: drop the points in the middle of them
    const pts = loop.filter((p, i) => {
      const a = loop[(i + loop.length - 1) % loop.length], c = loop[(i + 1) % loop.length];
      return (p[0] - a[0]) * (c[1] - p[1]) - (p[1] - a[1]) * (c[0] - p[0]) !== 0;
    });
    if (pts.length >= 3) loops.push(pts);
  }
  return loops.sort((a, b) => Math.abs(signedArea(b)) - Math.abs(signedArea(a)));
}

// Douglas-Peucker round a closed loop
export function simplifyLoop(pts, tol) {
  if (pts.length < 4) return pts.slice();
  // split at the point furthest from the first
  let far = 0, fd = -1;
  pts.forEach((p, i) => { const d = Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]); if (d > fd) { fd = d; far = i; } });
  const a = simplify(pts.slice(0, far + 1), tol), b = simplify(pts.slice(far).concat([pts[0]]), tol);
  return a.slice(0, -1).concat(b.slice(0, -1));
}
// Corners rounded off: each bend cut back by up to `d` along both its sides,
// the cut bridged by a curve (`per` points). closed: a loop.
export function fillet(pts, d, per, closed) {
  per = per || 4;
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    if (!closed && (i === 0 || i === n - 1)) { out.push(p); continue; }
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const cut = Math.min(d, la * 0.45, lb * 0.45);
    const u = [(a[0] - p[0]) / (la || 1), (a[1] - p[1]) / (la || 1)], v = [(b[0] - p[0]) / (lb || 1), (b[1] - p[1]) / (lb || 1)];
    // nearly straight on: no rounding needed
    if (u[0] * v[0] + u[1] * v[1] < -0.996 || cut < 1e-3) { out.push(p); continue; }
    const s = [p[0] + u[0] * cut, p[1] + u[1] * cut], e = [p[0] + v[0] * cut, p[1] + v[1] * cut];
    for (let k = 0; k <= per; k++) {
      const t = k / per, w0 = (1 - t) * (1 - t), w1 = 2 * t * (1 - t), w2 = t * t;
      out.push([s[0] * w0 + p[0] * w1 + e[0] * w2, s[1] * w0 + p[1] * w1 + e[1] * w2]);
    }
  }
  return out;
}
// a closed loop moved outwards by `off` (inwards if negative)
export function offsetLoop(pts, off) {
  const ccw = signedArea(pts) > 0, n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const a = pts[(i + n - 1) % n], p = pts[i], b = pts[(i + 1) % n];
    const d0 = norm2([p[0] - a[0], p[1] - a[1]]), d1 = norm2([b[0] - p[0], b[1] - p[1]]);
    // outward: right of the way round for an anticlockwise loop
    const o0 = ccw ? [d0[1], -d0[0]] : [-d0[1], d0[0]], o1 = ccw ? [d1[1], -d1[0]] : [-d1[1], d1[0]];
    const m = norm2([o0[0] + o1[0], o0[1] + o1[1]]), c = m[0] * o1[0] + m[1] * o1[1];
    const k = off / Math.max(0.35, c);
    out.push([p[0] + m[0] * k, p[1] + m[1] * k]);
  }
  return out;
}
