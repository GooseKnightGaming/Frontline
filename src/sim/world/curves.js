// FRONTLINE - curved building (Rhys: "the Casino next please -
// including the smooth/circular walls"). The collision world is boxes, which
// keeps it exact and cheap; a curve is drawn as a true curve (quads, see
// render.js) and stood on or walked into as a run of small boxes that follow
// it closely. Pure: no engine.
//
// Angles: theta = atan2(z - cz, x - cx) - east 0, south +pi/2, north -pi/2.

const TAU = Math.PI * 2;
export const pt = (cx, cz, r, a, y) => [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r];

// A wall along an arc, a0 -> a1 (radians, a1 > a0), radius r (its middle),
// thickness t, from y0 to y1. Drawn: the inner and outer faces, its top, and
// both ends. Steps: ~one every 0.5 m along it.
export function arcWallQuads(cx, cz, r, t, a0, a1, y0, y1, opts) {
  opts = opts || {};
  const n = Math.max(1, Math.ceil(Math.abs(a1 - a0) * r / (opts.step || 0.5)));
  const ri = r - t / 2, ro = r + t / 2, quads = [];
  for (let i = 0; i < n; i++) {
    const p = a0 + (a1 - a0) * i / n, q = a0 + (a1 - a0) * (i + 1) / n, m = (p + q) / 2;
    const out = [Math.cos(m), 0, Math.sin(m)], inn = [-out[0], 0, -out[2]];
    const s0 = r * (p - a0), s1 = r * (q - a0);                // arc length, for the texture
    // outer face (seen from outside): p -> q runs anticlockwise seen from above... wound by normal anyway
    // each face of the wall, a stretch at a time, is one patch in the
    // lightmap (sheet): no seam at every half metre (the banding round the casino)
    const lm = [[s0, -y0], [s1, -y0], [s1, -y1], [s0, -y1]], blk = Math.floor(s0 / 12);
    quads.push({ v: [pt(cx, cz, ro, p, y0), pt(cx, cz, ro, q, y0), pt(cx, cz, ro, q, y1), pt(cx, cz, ro, p, y1)], n: out, uv: lm, lm, sheet: 'o' + blk });
    if (!opts.outerOnly) quads.push({ v: [pt(cx, cz, ri, p, y0), pt(cx, cz, ri, q, y0), pt(cx, cz, ri, q, y1), pt(cx, cz, ri, p, y1)], n: inn, uv: lm, lm, sheet: 'i' + blk });
    if (!opts.noTop) quads.push({ v: [pt(cx, cz, ri, p, y1), pt(cx, cz, ri, q, y1), pt(cx, cz, ro, q, y1), pt(cx, cz, ro, p, y1)], n: [0, 1, 0] });
  }
  if (!opts.noEnds) for (const [a, sg] of [[a0, -1], [a1, 1]]) {
    const tan = [-Math.sin(a) * sg, 0, Math.cos(a) * sg];
    quads.push({ v: [pt(cx, cz, ri, a, y0), pt(cx, cz, ro, a, y0), pt(cx, cz, ro, a, y1), pt(cx, cz, ri, a, y1)], n: tan });
  }
  return quads;
}

// ...and its collision: a box round each short chord (seg metres long).
export function arcWallBoxes(cx, cz, r, t, a0, a1, y0, y1, seg) {
  const n = Math.max(1, Math.ceil(Math.abs(a1 - a0) * r / (seg || 0.6)));
  const ri = r - t / 2, ro = r + t / 2, out = [];
  for (let i = 0; i < n; i++) {
    const p = a0 + (a1 - a0) * i / n, q = a0 + (a1 - a0) * (i + 1) / n;
    const cs = [pt(cx, cz, ri, p, 0), pt(cx, cz, ri, q, 0), pt(cx, cz, ro, p, 0), pt(cx, cz, ro, q, 0)];
    const xs = cs.map((c) => c[0]), zs = cs.map((c) => c[2]);
    out.push([[Math.min(...xs), y0, Math.min(...zs)], [Math.max(...xs), y1, Math.max(...zs)]]);
  }
  return out;
}

// The bounding box of a list of quads (for the bake's chunks)
export function quadsBox(quads) {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (const q of quads) for (const v of q.v) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], v[k]); mx[k] = Math.max(mx[k], v[k]); }
  return { min: mn, max: mx };
}

// ── the helical ramp ──────────────────────────────────────────────────────
// A ramp coiling up between two radii. keys: [[phi, y], ...] - phi the angle
// travelled (0 at the start, growing as it climbs; the direction is `dir`:
// -1 = east -> north -> west -> south, theta = start - phi), y the height
// there. Height between keys is linear in phi.
export class Ramp {
  constructor(def) {
    this.cx = def.cx; this.cz = def.cz; this.rIn = def.rIn; this.rOut = def.rOut;
    this.start = def.start || 0; this.dir = def.dir || -1; this.keys = def.keys;
    this.end = this.keys[this.keys.length - 1][0];
  }
  heightAt(phi) {
    const k = this.keys;
    if (phi <= k[0][0]) return k[0][1];
    for (let i = 1; i < k.length; i++) if (phi <= k[i][0]) return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * (phi - k[i - 1][0]) / (k[i][0] - k[i - 1][0]);
    return k[k.length - 1][1];
  }
  thetaOf(phi) { return this.start + this.dir * phi; }
  // the first point (from `from` on) where it reaches height y
  phiAtHeight(y, from) {
    const k = this.keys;
    for (let i = 1; i < k.length; i++) {
      if (k[i][0] < (from || 0) || k[i][1] < y || k[i][1] === k[i - 1][1]) continue;
      const phi = k[i - 1][0] + (y - k[i - 1][1]) * (k[i][0] - k[i - 1][0]) / (k[i][1] - k[i - 1][1]);
      return Math.max(phi, from || 0);
    }
    return this.end;
  }
  // every height the ramp has above a point at this angle (one per turn), lowest first
  heightsAtTheta(theta) {
    let base = ((theta - this.start) * this.dir) % TAU; if (base < 0) base += TAU;
    const out = [];
    for (let phi = base; phi <= this.end + 1e-9; phi += TAU) out.push({ phi, y: this.heightAt(phi) });
    return out;
  }
  // Collision: the band cut into cells, each turn's surface over each cell a
  // thin slab, merged along runs of the same height (to within `tol`). Under
  // the first stretch, where the ramp is too low to walk under (below
  // `fillBelow`), it is solid down to the ground.
  boxes(opts) {
    opts = opts || {};
    const cell = opts.cell || 0.75, tol = opts.tol || 0.05, thick = opts.thick || 0.25, fill = opts.fillBelow;
    const { cx, cz, rIn, rOut } = this, out = [];
    for (let z = cz - rOut; z < cz + rOut; z += cell) {
      let run = null;
      const flush = () => { if (run) { out.push(run.box); run = null; } };
      const rowRuns = new Map();                  // by turn index: the open run
      for (let x = cx - rOut; x < cx + rOut; x += cell) {
        const mx = x + cell / 2, mz = z + cell / 2, r = Math.hypot(mx - cx, mz - cz);
        const inBand = r >= rIn && r <= rOut;
        const hs = inBand ? this.heightsAtTheta(Math.atan2(mz - cz, mx - cx)) : [];
        const seen = new Set();
        hs.forEach((h, i) => {
          seen.add(i);
          const yTop = h.y, yBot = fill !== undefined && h.phi < Math.PI * 2 && yTop < fill ? 0 : yTop - thick;
          const cur = rowRuns.get(i);
          if (cur && Math.abs(cur.y - yTop) <= tol && Math.abs(cur.bot - yBot) <= tol + 0.001 && Math.abs(cur.box[1][0] - x) < 1e-6) {
            cur.box[1][0] = x + cell; cur.box[1][1] = Math.max(cur.box[1][1], yTop); cur.box[0][1] = Math.min(cur.box[0][1], yBot);
          } else {
            if (cur) out.push(cur.box);
            rowRuns.set(i, { y: yTop, bot: yBot, box: [[x, yBot, z], [x + cell, yTop, z + cell]] });
          }
        });
        for (const [i, cur] of [...rowRuns]) if (!seen.has(i)) { out.push(cur.box); rowRuns.delete(i); }
      }
      for (const cur of rowRuns.values()) out.push(cur.box);
      flush();
    }
    return out;
  }
  // Drawn: the walking surface and its underside, smooth, a quad every `step` radians
  quads(step) {
    step = step || 0.035;
    const { cx, cz, rIn, rOut } = this, out = [];
    const n = Math.ceil(this.end / step);
    for (let i = 0; i < n; i++) {
      const p0 = this.end * i / n, p1 = this.end * (i + 1) / n;
      const a0 = this.thetaOf(p0), a1 = this.thetaOf(p1), y0 = this.heightAt(p0), y1 = this.heightAt(p1);
      const s0 = p0 * (rIn + rOut) / 2, s1 = p1 * (rIn + rOut) / 2;
      const top = [pt(cx, cz, rIn, a0, y0), pt(cx, cz, rIn, a1, y1), pt(cx, cz, rOut, a1, y1), pt(cx, cz, rOut, a0, y0)];
      const lm = [[s0, rIn], [s1, rIn], [s1, rOut], [s0, rOut]], blk = Math.floor(s0 / 12);
      out.push({ v: top, n: [0, 1, 0], uv: lm, lm, sheet: 't' + blk });
      const t = 0.25;
      out.push({ v: top.map((v) => [v[0], v[1] - t, v[2]]), n: [0, -1, 0], uv: lm, lm, sheet: 'u' + blk });
    }
    return out;
  }
}

// ── a round floor: a disc (or an annulus), drawn smooth, stood on as row runs ──
// holes: [[x0, z0, x1, z1]] left open (stairs coming through)
export function discBoxes(cx, cz, r0, r1, y0, y1, cell, holes) {
  cell = cell || 0.5; holes = holes || [];
  const out = [];
  // a hole may be round: { cx, cz, r }
  const inPoly = (x, z, pts) => { let o = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, zi] = pts[i], [xj, zj] = pts[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) o = !o; } return o; };
  // or any outline: { poly: [[x, z], ...] } (the roof pool, sunk into the floor)
  const inHole = (x, z) => holes.some((h) => (Array.isArray(h) ? x > h[0] && x < h[2] && z > h[1] && z < h[3] : h.poly ? inPoly(x, z, h.poly) : Math.hypot(x - h.cx, z - h.cz) < h.r));
  const n = Math.ceil(2 * r1 / cell) + 1;
  for (let k = 0; k < n; k++) {
    const z = cz - r1 + k * cell;
    let start = null;
    for (let i = 0; i <= n; i++) {
      const x = cx - r1 + i * cell, mx = x + cell / 2, mz = z + cell / 2, r = Math.hypot(mx - cx, mz - cz);
      const on = i < n && r >= r0 && r <= r1 && !inHole(mx, mz);
      if (on && start === null) start = x;
      // a run reaching the end of the row is closed too - the widest rows were lost
      if (!on && start !== null) { out.push([[start, y0, z], [x, y1, z + cell]]); start = null; }
    }
  }
  return out;
}
export function discQuads(cx, cz, r0, r1, y, up, holes) {
  // a fan of thin wedges (r0 = 0: a disc); holes are cut by the boxes only -
  // drawn floors under stairs are covered by the treads anyway
  const out = [], n = Math.ceil(TAU * r1 / 1.2);
  for (let i = 0; i < n; i++) {
    const a = TAU * i / n, b = TAU * (i + 1) / n;
    const v = [pt(cx, cz, r0, a, y), pt(cx, cz, r1, a, y), pt(cx, cz, r1, b, y), pt(cx, cz, r0, b, y)];
    out.push({ v, n: [0, up ? 1 : -1, 0] });
  }
  return out;
}

// ── a spiral stair: treads round a post, from y0 to y1 ──
// Returns { boxes, quads, top: [x, y, z] (where you step off), foot }
export function spiralStair(cx, cz, rPost, rOut, y0, y1, a0, opts) {
  opts = opts || {};
  const rise = 0.2, nSteps = Math.ceil((y1 - y0) / rise), per = opts.per || (Math.PI * 2) / 14;   // a tread every ~26 degrees
  const h = (y1 - y0) / nSteps, boxes = [], quads = [];
  for (let i = 0; i < nSteps; i++) {
    const a = a0 + per * i, b = a + per, yt = y0 + h * (i + 1);
    // the tread, as small boxes over its wedge - small enough (a few across, a
    // few round) that one tread's boxes barely reach over the next tread
    const cells = 4, slices = 3;
    for (let k = 0; k < cells; k++) for (let j = 0; j < slices; j++) {
      const r0 = rPost + (rOut - rPost) * k / cells, r1 = rPost + (rOut - rPost) * (k + 1) / cells;
      const p0 = a + (b - a) * j / slices, p1 = a + (b - a) * (j + 1) / slices;
      const cs = [pt(cx, cz, r0, p0, 0), pt(cx, cz, r0, p1, 0), pt(cx, cz, r1, p0, 0), pt(cx, cz, r1, p1, 0)];
      const xs = cs.map((c) => c[0]), zs = cs.map((c) => c[2]);
      boxes.push([[Math.min(...xs), yt - 0.12, Math.min(...zs)], [Math.max(...xs), yt, Math.max(...zs)]]);
    }
    quads.push({ v: [pt(cx, cz, rPost, a, yt), pt(cx, cz, rPost, b, yt), pt(cx, cz, rOut, b, yt), pt(cx, cz, rOut, a, yt)], n: [0, 1, 0] });
    quads.push({ v: [pt(cx, cz, rPost, a, yt - 0.12), pt(cx, cz, rPost, b, yt - 0.12), pt(cx, cz, rOut, b, yt - 0.12), pt(cx, cz, rOut, a, yt - 0.12)], n: [0, -1, 0] });
    const fa = [-Math.sin(a), 0, Math.cos(a)];
    quads.push({ v: [pt(cx, cz, rPost, a, yt - h), pt(cx, cz, rOut, a, yt - h), pt(cx, cz, rOut, a, yt), pt(cx, cz, rPost, a, yt)], n: [-fa[0], 0, -fa[2]] });
  }
  const aEnd = a0 + per * nSteps;
  const foot = pt(cx, cz, (rPost + rOut) / 2, a0 - per * 0.8, y0);
  const top = pt(cx, cz, (rPost + rOut) / 2, aEnd + per * 0.9, y1);
  return { boxes, quads, foot, top, aEnd, steps: nSteps };
}

// ── walls from a map grid, merged (the casino's 2,000 wall boxes) ──
// cells: a function (x, y) -> 'W' | 'G' | null (null: not a wall here). One
// square = `size` metres. Each wall square joins its wall neighbours along the
// grid; a wall drawn as a pixel staircase (diagonal neighbours only) is joined
// round the corner, so there is no gap between its steps. Straight runs come
// out as single segments: { kind, axis: 'x' | 'z', at, from, to } (metres).
export function gridWallSegments(w, h, cells, size) {
  size = size || 1;
  const segs = new Map();
  const add = (kind, axis, at, a, b) => {
    const key = kind + axis + at.toFixed(3);
    if (!segs.has(key)) segs.set(key, { kind, axis, at, list: [] });
    segs.get(key).list.push([Math.min(a, b), Math.max(a, b)]);
  };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const k = cells(x, y);
    if (!k) continue;
    const cx = (x + 0.5) * size, cz = (y + 0.5) * size;
    add(k, 'x', cz, cx, cx);                                  // the post
    if (cells(x + 1, y)) add(k, 'x', cz, cx, cx + size);
    if (cells(x, y + 1)) add(k, 'z', cx, cz, cz + size);
    for (const [dx, dy] of [[1, 1], [1, -1]]) {
      if (!cells(x + dx, y + dy) || cells(x + dx, y) || cells(x, y + dy)) continue;
      // round the corner: along x to the corner, then along z to the neighbour's row, then on along x
      const xc = cx + dx * size / 2;
      add(k, 'x', cz, cx, xc);
      add(k, 'z', xc, cz, cz + dy * size);
      add(k, 'x', cz + dy * size, xc, cx + dx * size);
    }
  }
  const out = [];
  for (const sg of segs.values()) {
    const l = sg.list.sort((a, b) => a[0] - b[0]);
    let cur = l[0].slice();
    for (let i = 1; i < l.length; i++) {
      if (l[i][0] <= cur[1] + 1e-6) cur[1] = Math.max(cur[1], l[i][1]);
      else { out.push({ kind: sg.kind, axis: sg.axis, at: sg.at, from: cur[0], to: cur[1] }); cur = l[i].slice(); }
    }
    out.push({ kind: sg.kind, axis: sg.axis, at: sg.at, from: cur[0], to: cur[1] });
  }
  return out;
}
// a segment's footprint, thickness t: [[x0, z0], [x1, z1]]
export function segmentRect(sg, t) {
  return sg.axis === 'x' ? [[sg.from - t / 2, sg.at - t / 2], [sg.to + t / 2, sg.at + t / 2]] : [[sg.at - t / 2, sg.from - t / 2], [sg.at + t / 2, sg.to + t / 2]];
}
// runs along x of cells sharing a key: [{ key, x0, x1, y }] (x1 exclusive)
export function rowRuns(w, h, keyOf) {
  const out = [];
  for (let y = 0; y < h; y++) {
    let start = null, cur = null;
    for (let x = 0; x <= w; x++) {
      const k = x < w ? keyOf(x, y) : null;
      if (k !== cur) { if (cur !== null && cur !== undefined) out.push({ key: cur, x0: start, x1: x, y }); start = x; cur = k; }
    }
  }
  return out.filter((r) => r.key !== null && r.key !== undefined);
}
