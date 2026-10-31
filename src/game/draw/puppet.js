// FRONTLINE - a person drawn in code: a smooth, rounded body on a skeleton of joints, as one skinned mesh
// (one draw for the whole body), coloured by vertex. The joints are moved by poses from src/sim/people/poses.js.
//
// Everything is built standing in the bind pose: facing +z, feet on y = 0, 1.8 m tall, arms hanging. Each
// point follows one joint, or two where the body bends (elbows, knees, waist, neck), so the skin bends with it.

import { JOINTS } from '../../sim/people/poses.js';

// the skeleton: each joint's parent and where it sits from its parent, standing
export const BONES = {
  pelvis: [null, [0, 1.0, 0]],
  spine: ['pelvis', [0, 0.1, 0]],
  chest: ['spine', [0, 0.2, 0]],
  neck: ['chest', [0, 0.24, 0]],
  head: ['neck', [0, 0.07, 0]],
  upperarm_l: ['chest', [0.19, 0.15, 0]], lowerarm_l: ['upperarm_l', [0, -0.29, 0]], hand_l: ['lowerarm_l', [0, -0.26, 0]],
  upperarm_r: ['chest', [-0.19, 0.15, 0]], lowerarm_r: ['upperarm_r', [0, -0.29, 0]], hand_r: ['lowerarm_r', [0, -0.26, 0]],
  thigh_l: ['pelvis', [0.1, -0.06, 0]], calf_l: ['thigh_l', [0, -0.44, 0]], foot_l: ['calf_l', [0, -0.42, 0]],
  thigh_r: ['pelvis', [-0.1, -0.06, 0]], calf_r: ['thigh_r', [0, -0.44, 0]], foot_r: ['calf_r', [0, -0.42, 0]],
};
// where each joint sits in the standing body (model space)
export const REST = {};
for (const n of JOINTS) {
  const [parent, off] = BONES[n];
  const p = parent ? REST[parent] : [0, 0, 0];
  REST[n] = [p[0] + off[0], p[1] + off[1], p[2] + off[2]];
}

// colours: field kit unless told otherwise; tint multiplies the uniform (a faction's colours)
export const KIT = {
  skin: [0.80, 0.62, 0.50], hair: [0.20, 0.15, 0.11], top: [0.33, 0.36, 0.27], legs: [0.27, 0.29, 0.23],
  vest: [0.21, 0.23, 0.18], belt: [0.12, 0.11, 0.09], boots: [0.10, 0.09, 0.08], gloves: [0.12, 0.12, 0.11],
  eyes: [0.08, 0.07, 0.06], brows: [0.16, 0.12, 0.09], lips: [0.62, 0.40, 0.36],
};
export function palette(opts) {
  const o = opts || {}, K = {};
  for (const k in KIT) K[k] = (o.colours && o.colours[k]) || KIT[k];
  if (o.tint) for (const k of ['top', 'legs', 'vest']) K[k] = K[k].map((v, i) => Math.min(1, v * o.tint[i] * 1.6));
  return K;
}

// ── the body's shapes ─────────────────────────────────────────────────────
// A small mesh builder for smooth, rounded shapes (in the manner of Quaternius's
// characters): surfaces of shared vertices whose normals are averaged, so they
// shade smoothly, and each vertex follows up to two joints - blended across
// the elbows, knees, waist and neck, so the body bends rather than breaks.
const sp = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);       // a signed power: rounds a shape towards a box
const clamp01 = (v) => Math.max(0, Math.min(1, v));
class Shapes {
  constructor() { this.p = []; this.c = []; this.b = []; this.w = []; this.i = []; }
  vert(pos, col, wts) {
    const k = this.p.length / 3;
    this.p.push(pos[0], pos[1], pos[2]); this.c.push(col[0], col[1], col[2], 1);
    const w = wts.filter((x) => x[1] > 0.001).slice(0, 4);
    for (let q = 0; q < 4; q++) { this.b.push(w[q] ? w[q][0] : 0); this.w.push(w[q] ? w[q][1] : 0); }
    return k;
  }
  // a face, turned to face away from ctr (the middle of the part of the shape it is on)
  face(a, b, c, ctr) {
    const P = this.p, A = [P[a * 3], P[a * 3 + 1], P[a * 3 + 2]], B = [P[b * 3], P[b * 3 + 1], P[b * 3 + 2]], C = [P[c * 3], P[c * 3 + 1], P[c * 3 + 2]];
    const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (Math.hypot(nx, ny, nz) < 1e-10) return;
    const mx = (A[0] + B[0] + C[0]) / 3 - ctr[0], my = (A[1] + B[1] + C[1]) / 3 - ctr[1], mz = (A[2] + B[2] + C[2]) / 3 - ctr[2];
    if (nx * mx + ny * my + nz * mz < 0) this.i.push(a, c, b); else this.i.push(a, b, c);
  }
  // rows of vertices, each row a closed loop; ctr(r) is the middle of row r
  grid(rows, ctr) {
    const ids = rows.map((row) => row.map((v) => this.vert(v.pos, v.col, v.w)));
    for (let r = 0; r + 1 < ids.length; r++) {
      const A = ids[r], B = ids[r + 1], n = A.length, c0 = ctr(r), c1 = ctr(r + 1), C = [(c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2, (c0[2] + c1[2]) / 2];
      for (let k = 0; k < n; k++) { const k2 = (k + 1) % n; this.face(A[k], A[k2], B[k2], C); this.face(A[k], B[k2], B[k], C); }
    }
  }
  // a tube through rings {c:[x,y,z], rx, rzf (front), rzb (back), n (roundness: 2 round, 3+ boxier), col};
  // wts(pos) gives the joints a point follows. A ring of radius 0 closes an end.
  loft(rings, wts, segs) {
    const S = segs || 16, R = [];
    for (let r = 0; r < rings.length; r++) {
      // where the colour changes, the same ring twice, so the colours meet in a clean line
      if (r > 0 && rings[r].col !== rings[r - 1].col) R.push(Object.assign({}, rings[r], { col: rings[r - 1].col }));
      R.push(rings[r]);
    }
    const rows = R.map((g) => {
      const e = 2 / (g.n || 2), row = [];
      for (let k = 0; k < S; k++) {
        const u = (k / S) * Math.PI * 2, cs = Math.cos(u), sn = Math.sin(u);
        const pos = [g.c[0] + g.rx * sp(cs, e), g.c[1], g.c[2] + (sn > 0 ? g.rzf : (g.rzb === undefined ? g.rzf : g.rzb)) * sp(sn, e)];
        row.push({ pos, col: g.col, w: wts(pos) });
      }
      return row;
    });
    this.grid(rows, (r) => R[r].c);
  }
  // a rounded lump: an ellipsoid of radii r, rounded towards a box by n; options:
  //   floor - flattened below this height (a sole); cut(u) - how far down it goes, -1..1, round the way (hair)
  blob(c, r, col, wts, o) {
    o = o || {};
    const e = 2 / (o.n || 2), RN = o.rings || 10, S = o.segs || 16, rows = [];
    for (let i = 0; i <= RN; i++) {
      const row = [];
      for (let k = 0; k < S; k++) {
        const u = (k / S) * Math.PI * 2, low = o.cut ? Math.asin(Math.max(-1, Math.min(1, o.cut(u)))) : -Math.PI / 2;
        const v = Math.PI / 2 - (i / RN) * (Math.PI / 2 - low);
        let y = c[1] + r[1] * sp(Math.sin(v), e);
        if (o.floor !== undefined) y = Math.max(y, o.floor);
        const pos = [c[0] + r[0] * sp(Math.cos(v), e) * sp(Math.cos(u), e), y, c[2] + r[2] * sp(Math.cos(v), e) * sp(Math.sin(u), e)];
        row.push({ pos, col, w: typeof wts === 'function' ? wts(pos) : [[wts, 1]] });
      }
      rows.push(row);
    }
    this.grid(rows, () => c);
  }
  // smooth normals: each vertex the average of the faces round it
  normals() {
    const N = new Float32Array(this.p.length), P = this.p, I = this.i;
    for (let t = 0; t < I.length; t += 3) {
      const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
      const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      for (const q of [a, b, c]) { N[q] += nx; N[q + 1] += ny; N[q + 2] += nz; }
    }
    for (let q = 0; q < N.length; q += 3) { const l = Math.hypot(N[q], N[q + 1], N[q + 2]) || 1; N[q] /= l; N[q + 1] /= l; N[q + 2] /= l; }
    return N;
  }
}

// a point between two joints: wholly `above` over y1, wholly `below` under y0, shared between
const between = (above, below, y0, y1) => (pos) => { const t = clamp01((pos[1] - y0) / (y1 - y0)); return [[above, t], [below, 1 - t]]; };

function buildShapes(K) {
  const g = new Shapes(), B = (n) => JOINTS.indexOf(n);
  const ring = (y, rx, rzf, rzb, col, n, x, z) => ({ c: [x || 0, y, z || 0], rx, rzf, rzb, col, n: n || 2.4 });

  // ── the trunk, hips to shoulders: legs' colour below the belt, the shirt above
  {
    const pel = B('pelvis'), spi = B('spine'), che = B('chest');
    const wts = (pos) => {
      const y = pos[1];
      if (y < 1.0) return [[pel, 1]];
      if (y < 1.12) { const t = (y - 1.0) / 0.12; return [[spi, t], [pel, 1 - t]]; }
      if (y < 1.28) { const t = (y - 1.12) / 0.16; return [[che, t], [spi, 1 - t]]; }
      return [[che, 1]];
    };
    g.loft([
      ring(0.83, 0.0, 0.0, 0.0, K.legs),
      ring(0.845, 0.11, 0.07, 0.08, K.legs),
      ring(0.88, 0.165, 0.095, 0.11, K.legs, 2.6),
      ring(0.96, 0.172, 0.1, 0.115, K.legs, 2.6),
      ring(1.0, 0.168, 0.1, 0.108, K.belt, 2.6),
      ring(1.06, 0.164, 0.098, 0.104, K.belt, 2.6),
      ring(1.06, 0.158, 0.094, 0.1, K.top, 2.6),
      ring(1.14, 0.152, 0.092, 0.096, K.top, 2.6),
      ring(1.24, 0.17, 0.106, 0.1, K.top, 2.8),
      ring(1.34, 0.19, 0.118, 0.104, K.top, 3),
      ring(1.43, 0.198, 0.11, 0.1, K.top, 3),
      ring(1.49, 0.185, 0.095, 0.09, K.top, 2.8),
      ring(1.53, 0.13, 0.075, 0.075, K.top, 2.4),
      ring(1.555, 0.07, 0.055, 0.055, K.top),
      ring(1.56, 0.0, 0.0, 0.0, K.top),
    ], wts, 20);
    // the vest over the chest and back, with pouches; a buckle on the belt
    g.loft([
      ring(1.13, 0.0, 0.0, 0.0, K.vest),
      ring(1.13, 0.16, 0.102, 0.104, K.vest, 3),
      ring(1.24, 0.177, 0.116, 0.11, K.vest, 3),
      ring(1.34, 0.196, 0.128, 0.113, K.vest, 3.2),
      ring(1.43, 0.19, 0.12, 0.108, K.vest, 3),
      ring(1.46, 0.0, 0.0, 0.0, K.vest),
    ], wts, 20);
    for (const x of [-0.085, 0, 0.085]) g.blob([x, 1.26, 0.122], [0.036, 0.052, 0.024], K.vest, wts, { n: 3.2, rings: 6, segs: 12 });
    g.blob([0, 1.33, -0.112], [0.1, 0.07, 0.025], K.vest, che, { n: 3.5, rings: 6, segs: 14 });          // a pack on the back
    g.blob([0, 1.03, 0.104], [0.026, 0.024, 0.008], [0.55, 0.5, 0.36], pel, { n: 4, rings: 4, segs: 10 });
    // a collar
    g.loft([ring(1.5, 0.085, 0.072, 0.072, K.top), ring(1.54, 0.078, 0.066, 0.066, K.top), ring(1.555, 0.06, 0.05, 0.05, K.top)], () => [[che, 1]], 14);
  }

  // ── the neck and the head
  {
    const che = B('chest'), nec = B('neck'), hd = B('head');
    const nw = (pos) => pos[1] < 1.56 ? between(nec, che, 1.5, 1.56)(pos) : between(hd, nec, 1.6, 1.65)(pos);
    g.loft([ring(1.5, 0.058, 0.056, 0.058, K.skin), ring(1.58, 0.056, 0.054, 0.056, K.skin, 2, 0, 0.005), ring(1.66, 0.056, 0.05, 0.05, K.skin, 2, 0, 0.012)], nw, 14);
    // the head, crown to chin, as one smooth shape: [y, half-width, front, back, centre z]
    const HEAD = [[1.598, 0, 0, 0, 0.062], [1.603, 0.028, 0.022, 0.02, 0.058], [1.618, 0.058, 0.05, 0.042, 0.046],
      [1.642, 0.084, 0.076, 0.07, 0.032], [1.672, 0.099, 0.098, 0.088, 0.02], [1.71, 0.107, 0.108, 0.104, 0.012],
      [1.75, 0.108, 0.105, 0.11, 0.008], [1.79, 0.099, 0.092, 0.102, 0.004], [1.82, 0.077, 0.07, 0.08, 0.002],
      [1.838, 0.045, 0.04, 0.046, 0], [1.846, 0, 0, 0, 0]];
    g.loft(HEAD.map(([y, rx, f, bk, z]) => ring(y, rx, f, bk, K.skin, 2, 0, z)), () => [[hd, 1]], 24);
    // where the face is, at (x, y): on the head's surface, less sink
    const onFace = (x, y, sink) => {
      let k = 0; while (k < HEAD.length - 2 && HEAD[k + 1][0] < y) k++;
      const A = HEAD[k], Bq = HEAD[k + 1], t = clamp01((y - A[0]) / (Bq[0] - A[0])), L = (i) => A[i] + (Bq[i] - A[i]) * t;
      return L(4) + L(2) * Math.sqrt(Math.max(0, 1 - (x / L(1)) ** 2)) - (sink || 0);
    };
    // the hair: down to the forehead in front, over the ears at the sides, to the nape behind
    g.blob([0, 1.734, 0.006], [0.115, 0.13, 0.124], K.hair, hd, { rings: 12, segs: 24, cut: (u) => -0.35 + 0.65 * Math.pow(Math.max(0, Math.sin(u)), 1.5) + 0.25 * Math.min(0, Math.sin(u)) });
    for (const s of [1, -1]) {
      const ex = 0.04 * s, ey = 1.722;
      g.blob([ex, ey, onFace(ex, ey, 0.005)], [0.013, 0.017, 0.009], K.eyes, hd, { rings: 6, segs: 12 });          // eyes
      g.blob([0.042 * s, 1.752, onFace(0.042 * s, 1.752, 0.004)], [0.025, 0.0065, 0.01], K.brows, hd, { n: 2.6, rings: 4, segs: 10 });
      g.blob([0.106 * s, 1.712, 0.004], [0.013, 0.026, 0.019], K.skin, hd, { rings: 6, segs: 10 });               // ears
    }
    g.blob([0, 1.697, onFace(0, 1.697, 0.007)], [0.012, 0.019, 0.015], K.skin, hd, { rings: 6, segs: 10 });          // nose
    g.blob([0, 1.658, onFace(0, 1.658, 0.005)], [0.021, 0.005, 0.007], K.lips, hd, { rings: 4, segs: 10 });          // mouth
  }

  // ── arms: a sleeve to the elbow, the forearm rolled up to a cuff, a glove
  for (const [s, side] of [[1, 'l'], [-1, 'r']]) {
    const up = B('upperarm_' + side), lo = B('lowerarm_' + side), ha = B('hand_' + side), x = 0.19 * s;
    const aw = (pos) => pos[1] > 0.95 ? between(up, lo, 1.13, 1.21)(pos) : between(lo, ha, 0.9, 0.95)(pos);
    g.loft([
      ring(1.52, 0.0, 0.0, 0.0, K.top, 2, x),
      ring(1.51, 0.036, 0.038, 0.038, K.top, 2, x),
      ring(1.49, 0.054, 0.056, 0.056, K.top, 2, x),
      ring(1.46, 0.064, 0.064, 0.064, K.top, 2, x),
      ring(1.38, 0.064, 0.064, 0.064, K.top, 2, x),
      ring(1.26, 0.057, 0.058, 0.058, K.top, 2, x),
      ring(1.2, 0.053, 0.054, 0.054, K.top, 2, x),
      ring(1.17, 0.05, 0.051, 0.051, K.top, 2, x),
      ring(1.12, 0.05, 0.05, 0.05, K.top, 2, x),
      ring(1.07, 0.049, 0.049, 0.049, K.top, 2, x),
      ring(1.0, 0.043, 0.043, 0.043, K.top, 2, x),
      ring(0.96, 0.038, 0.038, 0.038, K.vest, 2, x),
      ring(0.93, 0.037, 0.037, 0.037, K.vest, 2, x),
      ring(0.925, 0.0, 0.0, 0.0, K.vest, 2, x),
    ], aw, 14);
    g.blob([x, 0.86, 0.006], [0.04, 0.064, 0.045], K.gloves, ha, { n: 2.6, rings: 8, segs: 14 });                // the glove
    g.blob([x + 0.028 * s, 0.872, 0.034], [0.015, 0.032, 0.016], K.gloves, ha, { rings: 6, segs: 10 });           // its thumb
  }

  // ── legs: trousers with knee pads and a pocket, then boots
  for (const [s, side] of [[1, 'l'], [-1, 'r']]) {
    const th = B('thigh_' + side), ca = B('calf_' + side), ft = B('foot_' + side), x = 0.1 * s;
    const lw = (pos) => pos[1] > 0.3 ? between(th, ca, 0.46, 0.55)(pos) : between(ca, ft, 0.06, 0.1)(pos);
    g.loft([
      ring(1.0, 0.0, 0.0, 0.0, K.legs, 2, x),
      ring(0.99, 0.08, 0.085, 0.09, K.legs, 2, x),
      ring(0.88, 0.09, 0.09, 0.095, K.legs, 2, x),
      ring(0.72, 0.078, 0.08, 0.08, K.legs, 2, x),
      ring(0.58, 0.066, 0.066, 0.066, K.legs, 2, x),
      ring(0.5, 0.062, 0.062, 0.062, K.legs, 2, x),
      ring(0.42, 0.064, 0.066, 0.068, K.legs, 2, x),
      ring(0.32, 0.058, 0.058, 0.06, K.legs, 2, x),
      ring(0.29, 0.062, 0.062, 0.064, K.boots, 2.4, x),
      ring(0.18, 0.058, 0.06, 0.062, K.boots, 2.4, x),
      ring(0.1, 0.056, 0.06, 0.062, K.boots, 2.4, x),
      ring(0.08, 0.0, 0.0, 0.0, K.boots, 2.4, x),
    ], lw, 16);
    g.blob([x, 0.505, 0.058], [0.05, 0.055, 0.022], K.vest, ca, { n: 2.6, rings: 7, segs: 12 });                 // the knee pad
    g.blob([x + 0.068 * s, 0.73, 0.004], [0.02, 0.06, 0.045], K.vest, th, { n: 3.2, rings: 6, segs: 12 });         // a thigh pocket
    g.blob([x, 0.07, 0.045], [0.06, 0.07, 0.125], K.boots, ft, { n: 2.8, rings: 9, segs: 16, floor: 0.025 });   // the boot
    g.blob([x, 0.03, 0.045], [0.064, 0.03, 0.132], [0.05, 0.05, 0.05], ft, { n: 4, rings: 5, segs: 16, floor: 0.0 });  // its sole
  }
  return g;
}

// colours are written as painters' values; the engine lights in linear
const lin = (v) => Math.pow(v, 2.2);
const MESHES = {};

// A body: an entity tree of joints, and one skinned mesh that follows them.
//   root (where he stands) > body (the mesh's node) > pelvis > ...
export function makeBody(pc, app, opts) {
  const K = palette(opts), key = JSON.stringify(K);
  const device = app.graphicsDevice;
  let made = MESHES[key];
  if (!made) {
    const g = buildShapes(K), n = g.p.length / 3;
    const mesh = new pc.Mesh(device);
    mesh.setPositions(new Float32Array(g.p));
    mesh.setNormals(g.normals());
    mesh.setColors(new Float32Array(g.c.map((v, i) => (i % 4 === 3 ? v : lin(v)))));
    const bi = new Uint8Array(n * 4), bw = new Float32Array(n * 4);
    for (let v = 0; v < n * 4; v++) { bi[v] = g.b[v]; bw[v] = g.w[v]; }
    mesh.setVertexStream(pc.SEMANTIC_BLENDINDICES, bi, 4, n, pc.TYPE_UINT8);
    mesh.setVertexStream(pc.SEMANTIC_BLENDWEIGHT, bw, 4, n);
    mesh.setIndices(n > 65535 ? new Uint32Array(g.i) : new Uint16Array(g.i));
    mesh.update(pc.PRIMITIVE_TRIANGLES);
    // each joint's standing place, undone: the skin's inverse bind matrices
    const ibp = JOINTS.map((j) => new pc.Mat4().setTranslate(-REST[j][0], -REST[j][1], -REST[j][2]));
    const skin = new pc.Skin(device, ibp, JOINTS.slice());
    mesh.skin = skin;
    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(1, 1, 1); mat.diffuseVertexColor = true;
    mat.useMetalness = true; mat.metalness = 0; mat.gloss = 0.35;
    mat.name = 'MI_Puppet';
    mat.update();
    made = MESHES[key] = { mesh, skin, mat, tris: g.i.length / 3 };
  }
  const body = new pc.Entity('puppet');
  const joints = {};
  for (const j of JOINTS) {
    const e = new pc.Entity(j);
    const [parent, off] = BONES[j];
    (parent ? joints[parent] : body).addChild(e);
    e.setLocalPosition(off[0], off[1], off[2]);
    joints[j] = e;
  }
  // the knuckles: where a weapon sits in the hand (between the wrist and here)
  const knuckle = new pc.Entity('middle_01_r'); knuckle.setLocalPosition(0, -0.1, 0.01); joints.hand_r.addChild(knuckle);
  const mi = new pc.MeshInstance(made.mesh, made.mat, body);
  mi.skinInstance = new pc.SkinInstance(made.skin);
  mi.skinInstance.bones = JOINTS.map((j) => joints[j]);
  mi.setCustomAabb(new pc.BoundingBox(new pc.Vec3(0, 0.9, 0), new pc.Vec3(1.3, 1.3, 1.3)));
  body.addComponent('render', { meshInstances: [mi], castShadows: !opts || opts.shadows !== false, receiveShadows: true });
  return { body, joints, knuckle, material: made.mat, tris: made.tris };
}

// put a pose on a body's joints
export function applyPose(pc, b, P) {
  for (const j of JOINTS) {
    const a = P.j[j];
    b.joints[j].setLocalEulerAngles(a[0], a[1], a[2]);
  }
  // the pelvis carries the whole body: moved by hip, and tipped by pitch about itself
  const pe = b.joints.pelvis, r = BONES.pelvis[1];
  pe.setLocalPosition(r[0] + P.hip[0], r[1] + P.hip[1], r[2] + P.hip[2]);
  if (P.pitch) {
    const a = P.j.pelvis;
    pe.setLocalEulerAngles(a[0] + P.pitch, a[1], a[2]);
  }
}
