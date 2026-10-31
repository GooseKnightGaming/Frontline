// FRONTLINE - vehicles, built in code.
//
// Low-mid-poly in the early-2000s manner: real shapes (a raked windscreen,
// fenders, round wheels), few polygons, painted textures. Each vehicle is one
// mesh per material, plus its wheels as separate entities so they can spin and
// steer once vehicles can be driven.

// ── a small mesh builder ──────────────────────────────────────────────────
class Builder {
  constructor() { this.p = []; this.n = []; this.uv = []; this.i = []; }
  // a quad from four corners (counter-clockwise, seen from outside)
  quad(a, b, c, d, u0 = 0, v0 = 0, u1 = 1, v1 = 1) {
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
    let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const l = Math.hypot(n[0], n[1], n[2]) || 1; n = n.map((x) => x / l);
    const base = this.p.length / 3;
    for (const [v, u, w] of [[a, u0, v0], [b, u1, v0], [c, u1, v1], [d, u0, v1]]) {
      this.p.push(v[0], v[1], v[2]); this.n.push(n[0], n[1], n[2]); this.uv.push(u, w);
    }
    this.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  // a triangle with a given normal (caps of cylinders)
  tri(a, b, c, n, ua, ub, uc) {
    const base = this.p.length / 3;
    for (const [v, uv] of [[a, ua], [b, ub], [c, uc]]) {
      this.p.push(v[0], v[1], v[2]); this.n.push(n[0], n[1], n[2]); this.uv.push(uv[0], uv[1]);
    }
    this.i.push(base, base + 1, base + 2);
  }
  // a box from its eight corners: lets the sides lean (bonnets, windscreens)
  hull(c, uvs) {
    const [a, b, cc, d, e, f, g, h] = c;   // bottom a b c d, top e f g h (anticlockwise from -x-z)
    const s = uvs || 1;
    this.quad(a, b, f, e, 0, 0, s, s);      // front (-z)
    this.quad(b, cc, g, f, 0, 0, s, s);     // right (+x)
    this.quad(cc, d, h, g, 0, 0, s, s);     // back (+z)
    this.quad(d, a, e, h, 0, 0, s, s);      // left (-x)
    this.quad(e, f, g, h, 0, 0, s, s);      // top
    this.quad(d, cc, b, a, 0, 0, s, s);     // bottom
  }
  // an ordinary box by centre and size
  box(cx, cy, cz, sx, sy, sz, uvs) {
    const x0 = cx - sx / 2, x1 = cx + sx / 2, y0 = cy - sy / 2, y1 = cy + sy / 2, z0 = cz - sz / 2, z1 = cz + sz / 2;
    this.hull([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], uvs);
  }
  // a cylinder along x (wheels, tanks, exhausts)
  cylX(cx, cy, cz, r, w, seg = 16, capUV = false) {
    const x0 = cx - w / 2, x1 = cx + w / 2;
    for (let k = 0; k < seg; k++) {
      const a0 = (k / seg) * Math.PI * 2, a1 = ((k + 1) / seg) * Math.PI * 2;
      const p = (a) => [cy + Math.sin(a) * r, cz + Math.cos(a) * r];
      const [y0, z0] = p(a0), [y1, z1] = p(a1);
      this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z1], [x1, y1, z1], k / seg * 4, 0, (k + 1) / seg * 4, 1);
      // the two end caps, as proper triangles with flat normals
      const c = [0.5, 0.5], q0 = [0.5 + Math.sin(a0) * 0.5, 0.5 + Math.cos(a0) * 0.5], q1 = [0.5 + Math.sin(a1) * 0.5, 0.5 + Math.cos(a1) * 0.5];
      this.tri([x1, cy, cz], [x1, y0, z0], [x1, y1, z1], [1, 0, 0], c, q0, q1);
      this.tri([x0, cy, cz], [x0, y1, z1], [x0, y0, z0], [-1, 0, 0], c, q1, q0);
    }
  }
  // a cylinder along z (a spare wheel on a tailgate)
  cylZ(cx, cy, cz, r, d, seg = 16) {
    const z0 = cz - d / 2, z1 = cz + d / 2;
    for (let k = 0; k < seg; k++) {
      const a0 = (k / seg) * Math.PI * 2, a1 = ((k + 1) / seg) * Math.PI * 2;
      const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r, x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
      this.quad([x0, y0, z1], [x1, y1, z1], [x1, y1, z0], [x0, y0, z0], k / seg * 4, 0, (k + 1) / seg * 4, 1);
      this.tri([cx, cy, z1], [x1, y1, z1], [x0, y0, z1], [0, 0, 1], [0.5, 0.5], [1, 0], [0, 0]);
      this.tri([cx, cy, z0], [x0, y0, z0], [x1, y1, z0], [0, 0, -1], [0.5, 0.5], [0, 0], [1, 0]);
    }
  }
  // a cylinder along z (exhaust stacks lying back, rolled canvas)
  cylY(cx, cy, cz, r, h, seg = 12) {
    const y0 = cy - h / 2, y1 = cy + h / 2;
    for (let k = 0; k < seg; k++) {
      const a0 = (k / seg) * Math.PI * 2, a1 = ((k + 1) / seg) * Math.PI * 2;
      const x0 = cx + Math.cos(a0) * r, z0 = cz + Math.sin(a0) * r, x1 = cx + Math.cos(a1) * r, z1 = cz + Math.sin(a1) * r;
      this.quad([x0, y0, z0], [x1, y0, z1], [x1, y1, z1], [x0, y1, z0], k / seg, 0, (k + 1) / seg, 1);
      this.tri([cx, y1, cz], [x1, y1, z1], [x0, y1, z0], [0, 1, 0], [0.5, 0.5], [1, 0], [0, 0]);
    }
  }
  // a flat polygon (3+ points, convex) with its own uvs; the normal
  // is turned to face `out` so lighting never comes out inside-out
  face(pts, uvs, out) {
    const [a, b, c] = pts;
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const l = Math.hypot(n[0], n[1], n[2]);
    if (l < 1e-9) return;                                  // a sliver: nothing to draw
    n = n.map((x) => x / l);
    if (out && n[0] * out[0] + n[1] * out[1] + n[2] * out[2] < 0) n = n.map((x) => -x);
    const base = this.p.length / 3;
    pts.forEach((v, k) => { this.p.push(v[0], v[1], v[2]); this.n.push(n[0], n[1], n[2]); this.uv.push(uvs[k][0], uvs[k][1]); });
    for (let k = 1; k < pts.length - 1; k++) this.i.push(base, base + k, base + k + 1);
  }
  mesh(pc, device) {
    const m = new pc.Mesh(device);
    m.setPositions(this.p); m.setNormals(this.n); m.setUvs(0, this.uv); m.setIndices(this.i);
    m.update(pc.PRIMITIVE_TRIANGLES);
    return m;
  }
}

// ── painted materials ─────────────────────────────────────────────────────
function canvasTex(pc, device, w, h, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); paint(g, w, h);
  const t = new pc.Texture(device, { width: w, height: h, mipmaps: true, anisotropy: 4 });
  t.setSource(c); t.addressU = pc.ADDRESS_REPEAT; t.addressV = pc.ADDRESS_REPEAT;
  return t;
}
let rngSeed = 4242;
const rnd = () => { rngSeed = (rngSeed * 16807) % 2147483647; return rngSeed / 2147483647; };
function paintBody(base) {
  return (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    // panel lines and rivets
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2;
    for (let x = 0; x < w; x += w / 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.beginPath(); g.moveTo(0, h * 0.5); g.lineTo(w, h * 0.5); g.stroke();
    g.fillStyle = 'rgba(0,0,0,0.3)';
    for (let x = 6; x < w; x += 14) { g.fillRect(x, 4, 2, 2); g.fillRect(x, h - 6, 2, 2); }
    // dust low down, streaks, chipped paint
    const grad = g.createLinearGradient(0, h * 0.55, 0, h);
    grad.addColorStop(0, 'rgba(120,100,70,0)'); grad.addColorStop(1, 'rgba(120,100,70,0.45)');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(40,35,25,${0.05 + rnd() * 0.12})`; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 3, 6 + rnd() * 24); }
    for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(150,145,130,${0.15 + rnd() * 0.2})`; g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 4, 1 + rnd() * 3); }
  };
}
function makeMaterials(pc, device) {
  const m = {};
  const mat = (tex, gloss, metal, extra) => {
    const x = new pc.StandardMaterial();
    if (tex) x.diffuseMap = tex;
    x.useMetalness = true; x.metalness = metal || 0; x.gloss = gloss || 0.3;
    if (extra) extra(x);
    x.cull = pc.CULLFACE_NONE;     // leaning hulls: never lose a face to winding
    x.update(); return x;
  };
  m.olive = mat(canvasTex(pc, device, 256, 128, paintBody('#4d5436')), 0.35, 0.3);
  m.sand = mat(canvasTex(pc, device, 256, 128, paintBody('#8a7a56')), 0.35, 0.3);
  // civilian paints, for cars parked in a street
  m.white = mat(canvasTex(pc, device, 256, 128, paintBody('#b9b8b2')), 0.45, 0.3);
  m.red = mat(canvasTex(pc, device, 256, 128, paintBody('#7a2a24')), 0.45, 0.3);
  // Ghost's own: a dark gunmetal grey
  m.ghost = mat(canvasTex(pc, device, 256, 128, paintBody('#3a3f44')), 0.4, 0.35);
  m.canvas = mat(canvasTex(pc, device, 128, 128, (g, w, h) => {
    g.fillStyle = '#56573c'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) { g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(0, y, w, 1); }
    for (let x = 0; x < w; x += 32) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x, 0, 3, h); }
  }), 0.15, 0);
  m.tyre = mat(canvasTex(pc, device, 128, 64, (g, w, h) => {
    g.fillStyle = '#1b1c1d'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 8) { g.fillStyle = '#0c0d0e'; g.fillRect(x, 0, 4, h); }
  }), 0.2, 0);
  m.hub = mat(null, 0.4, 0.6, (x) => { x.diffuse = new pc.Color(0.2, 0.22, 0.2); });
  m.metal = mat(null, 0.5, 0.8, (x) => { x.diffuse = new pc.Color(0.18, 0.18, 0.19); });
  m.chrome = mat(null, 0.85, 1, (x) => { x.diffuse = new pc.Color(0.7, 0.7, 0.72); });
  m.glass = mat(null, 0.92, 0.2, (x) => { x.diffuse = new pc.Color(0.08, 0.11, 0.13); });
  m.lamp = mat(null, 0.8, 0, (x) => { x.emissive = new pc.Color(1, 0.95, 0.8); x.emissiveIntensity = 1.4; x.diffuse = new pc.Color(0.9, 0.9, 0.85); });
  m.tail = mat(null, 0.8, 0, (x) => { x.emissive = new pc.Color(0.6, 0.05, 0.03); x.emissiveIntensity = 1; x.diffuse = new pc.Color(0.5, 0.05, 0.04); });
  m.seat = mat(null, 0.25, 0, (x) => { x.diffuse = new pc.Color(0.08, 0.08, 0.08); });
  // the police car's: clean white paint, the check, black plastic,
  // alloys, the plates, amber lamps and the roof number
  m.policeWhite = mat(null, 0.62, 0.15, (x) => { x.diffuse = new pc.Color(0.88, 0.88, 0.86); });
  m.livery = mat(canvasTex(pc, device, 128, 64, (g, w, h) => {
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { g.fillStyle = (r + c) % 2 ? '#1d3fa8' : '#e8d21a'; g.fillRect(c * 32, r * 32, 32, 32); }
  }), 0.5, 0.1, (x) => { x.emissive = new pc.Color(0.06, 0.06, 0.04); });
  m.trim = mat(null, 0.3, 0.1, (x) => { x.diffuse = new pc.Color(0.05, 0.05, 0.055); });
  m.alloy = mat(null, 0.7, 0.9, (x) => { x.diffuse = new pc.Color(0.55, 0.56, 0.58); });
  m.amber = mat(null, 0.8, 0, (x) => { x.emissive = new pc.Color(0.7, 0.35, 0.02); x.emissiveIntensity = 0.6; x.diffuse = new pc.Color(0.6, 0.35, 0.05); });
  m.plateW = mat(null, 0.5, 0, (x) => { x.diffuse = new pc.Color(0.9, 0.9, 0.88); });
  m.plateY = mat(null, 0.5, 0, (x) => { x.diffuse = new pc.Color(0.92, 0.78, 0.1); });
  // each car its own roof number (Rhys: every one was 14)
  const roofs = {};
  m.roofFor = (no) => (roofs[no] = roofs[no] || mat(canvasTex(pc, device, 128, 96, (g, w, h) => {
    g.fillStyle = '#dcdcd8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#111'; g.font = 'bold 76px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(no), w / 2, h / 2 + 4);
  }), 0.5, 0));
  return m;
}

// ── the vehicles ──────────────────────────────────────────────────────────
// Each returns { parts: { material: Builder }, wheels: [{x,y,z,r,w}] } in
// metres, facing -z (forward), wheels on the ground at y = 0.

function personnelTruck(paint) {
  const B = {}; const get = (k) => (B[k] = B[k] || new Builder());
  const body = get(paint), glass = get('glass'), metal = get('metal'), canvas = get('canvas');
  const W = 2.45, wr = 0.55;
  // chassis rails and bumper
  metal.box(0, 0.75, 0.2, 1.1, 0.25, 7.0);
  metal.box(0, 0.85, -3.55, W + 0.1, 0.28, 0.25);
  // cab: bonnet sloping down to the grille, then a raked windscreen
  const zf = -3.4, zb = -1.25, zw = -2.15;
  body.hull([[-W / 2, 0.95, zf], [W / 2, 0.95, zf], [W / 2, 0.95, zw], [-W / 2, 0.95, zw],
    [-W / 2 + 0.1, 1.55, zf + 0.05], [W / 2 - 0.1, 1.55, zf + 0.05], [W / 2 - 0.05, 1.72, zw], [-W / 2 + 0.05, 1.72, zw]]);
  body.hull([[-W / 2, 0.95, zw], [W / 2, 0.95, zw], [W / 2, 0.95, zb], [-W / 2, 0.95, zb],
    [-W / 2 + 0.12, 2.75, zw + 0.45], [W / 2 - 0.12, 2.75, zw + 0.45], [W / 2 - 0.12, 2.75, zb], [-W / 2 + 0.12, 2.75, zb]]);
  // windscreen and side windows, set just proud of the cab
  glass.hull([[-W / 2 + 0.2, 1.8, zw - 0.02], [W / 2 - 0.2, 1.8, zw - 0.02], [W / 2 - 0.2, 1.8, zw + 0.03], [-W / 2 + 0.2, 1.8, zw + 0.03],
    [-W / 2 + 0.24, 2.62, zw + 0.4], [W / 2 - 0.24, 2.62, zw + 0.4], [W / 2 - 0.24, 2.62, zw + 0.45], [-W / 2 + 0.24, 2.62, zw + 0.45]]);
  for (const s of [-1, 1]) glass.box(s * (W / 2 - 0.04), 2.2, (zw + zb) / 2 + 0.2, 0.04, 0.7, 0.75);
  // grille, headlights, mirrors
  metal.box(0, 1.2, zf - 0.02, W - 0.5, 0.45, 0.06);
  for (const s of [-1, 1]) {
    get('lamp').box(s * 0.85, 1.28, zf - 0.04, 0.3, 0.2, 0.06);
    metal.box(s * (W / 2 + 0.18), 2.2, zw + 0.1, 0.06, 0.4, 0.2);
    metal.box(s * (W / 2 + 0.08), 2.2, zw + 0.1, 0.2, 0.04, 0.04);
  }
  // fenders over the front wheels
  for (const s of [-1, 1]) body.hull([[s * W / 2 - 0.2 * s, 0.95, zf + 0.1], [s * W / 2 + 0.05 * s, 0.95, zf + 0.1], [s * W / 2 + 0.05 * s, 0.95, zf + 1.35], [s * W / 2 - 0.2 * s, 0.95, zf + 1.35],
    [s * W / 2 - 0.2 * s, 1.25, zf + 0.25], [s * W / 2 + 0.05 * s, 1.25, zf + 0.25], [s * W / 2 + 0.05 * s, 1.25, zf + 1.2], [s * W / 2 - 0.2 * s, 1.25, zf + 1.2]]);
  // the bed: floor, sides, tailgate
  const bz0 = -1.1, bz1 = 3.55;
  body.box(0, 1.05, (bz0 + bz1) / 2, W, 0.18, bz1 - bz0);
  for (const s of [-1, 1]) body.box(s * (W / 2 - 0.04), 1.45, (bz0 + bz1) / 2, 0.08, 0.65, bz1 - bz0);
  body.box(0, 1.45, bz1 - 0.04, W, 0.65, 0.08);
  // the canvas tilt over hoops
  const ty = 3.0;
  canvas.hull([[-W / 2, 1.75, bz0 + 0.05], [W / 2, 1.75, bz0 + 0.05], [W / 2, 1.75, bz1 - 0.1], [-W / 2, 1.75, bz1 - 0.1],
    [-W / 2 + 0.15, ty, bz0 + 0.1], [W / 2 - 0.15, ty, bz0 + 0.1], [W / 2 - 0.15, ty, bz1 - 0.15], [-W / 2 + 0.15, ty, bz1 - 0.15]]);
  for (let z = bz0 + 0.5; z < bz1; z += 1.1) metal.box(0, ty + 0.02, z, W - 0.25, 0.04, 0.06);
  // spare wheel on the cab back, fuel tank, exhaust stack, tail lamps
  get('tyre').cylX(-W / 2 - 0.02, 1.5, -0.9, 0.5, 0.3);
  metal.box(W / 2 - 0.15, 0.75, -0.4, 0.45, 0.45, 1.0);
  get('chrome').cylY(W / 2 + 0.1, 2.3, zb - 0.1, 0.07, 1.3);
  for (const s of [-1, 1]) get('tail').box(s * 1.0, 1.1, bz1 + 0.02, 0.2, 0.12, 0.04);
  // six wheels: one axle forward, two at the back
  const wheels = [];
  for (const z of [-2.75, 1.35, 2.6]) for (const s of [-1, 1]) wheels.push({ x: s * (W / 2 - 0.12), y: wr, z, r: wr, w: 0.42 });
  return { parts: B, wheels };
}

function lightUtility(paint) {
  const B = {}; const get = (k) => (B[k] = B[k] || new Builder());
  const body = get(paint), glass = get('glass'), metal = get('metal');
  const W = 2.0, wr = 0.42;
  metal.box(0, 0.6, 0, 0.9, 0.2, 4.2);
  metal.box(0, 0.7, -2.2, W + 0.1, 0.25, 0.2);
  metal.box(0, 0.7, 2.15, W, 0.2, 0.15);
  // a low, square-shouldered body with a short bonnet and an open back
  body.hull([[-W / 2, 0.75, -2.1], [W / 2, 0.75, -2.1], [W / 2, 0.75, -0.9], [-W / 2, 0.75, -0.9],
    [-W / 2 + 0.08, 1.25, -2.0], [W / 2 - 0.08, 1.25, -2.0], [W / 2, 1.35, -0.9], [-W / 2, 1.35, -0.9]]);
  body.box(0, 1.05, 0.65, W, 0.6, 3.0);
  glass.hull([[-W / 2 + 0.1, 1.35, -0.92], [W / 2 - 0.1, 1.35, -0.92], [W / 2 - 0.1, 1.35, -0.88], [-W / 2 + 0.1, 1.35, -0.88],
    [-W / 2 + 0.14, 1.95, -0.62], [W / 2 - 0.14, 1.95, -0.62], [W / 2 - 0.14, 1.95, -0.58], [-W / 2 + 0.14, 1.95, -0.58]]);
  // roll cage
  for (const s of [-1, 1]) {
    metal.box(s * (W / 2 - 0.08), 1.65, -0.7, 0.07, 0.7, 0.07);
    metal.box(s * (W / 2 - 0.08), 1.65, 0.6, 0.07, 1.0, 0.07);
    metal.box(s * (W / 2 - 0.08), 2.12, -0.05, 0.07, 0.07, 1.4);
    get('lamp').box(s * 0.7, 1.05, -2.12, 0.22, 0.16, 0.05);
  }
  metal.box(0, 2.12, 0.6, W - 0.1, 0.07, 0.07);
  get('seat').box(-0.45, 1.45, 0.1, 0.55, 0.15, 0.6); get('seat').box(0.45, 1.45, 0.1, 0.55, 0.15, 0.6);
  get('tyre').cylZ(0, 1.3, 2.3, 0.4, 0.28);       // spare, upright on the back
  const wheels = [];
  for (const z of [-1.45, 1.4]) for (const s of [-1, 1]) wheels.push({ x: s * (W / 2 + 0.02), y: wr, z, r: wr, w: 0.34 });
  return { parts: B, wheels };
}

function motorcycle(paint) {
  const B = {}; const get = (k) => (B[k] = B[k] || new Builder());
  const body = get(paint), metal = get('metal'), chrome = get('chrome');
  const wr = 0.34;
  // frame: a spine from the headstock down to the swingarm pivot
  metal.hull([[-0.05, 0.55, -0.55], [0.05, 0.55, -0.55], [0.05, 0.55, 0.35], [-0.05, 0.55, 0.35],
    [-0.05, 0.95, -0.62], [0.05, 0.95, -0.62], [0.05, 0.7, 0.35], [-0.05, 0.7, 0.35]]);
  // tank, side panels and seat
  body.hull([[-0.16, 0.85, -0.5], [0.16, 0.85, -0.5], [0.16, 0.85, -0.05], [-0.16, 0.85, -0.05],
    [-0.12, 1.08, -0.45], [0.12, 1.08, -0.45], [0.12, 1.0, -0.05], [-0.12, 1.0, -0.05]]);
  body.box(0, 0.75, 0.2, 0.26, 0.2, 0.5);
  get('seat').box(0, 0.93, 0.25, 0.24, 0.08, 0.62);
  // front forks, raked, and the handlebars
  chrome.hull([[-0.1, wr, -0.78], [0.1, wr, -0.78], [0.1, wr, -0.74], [-0.1, wr, -0.74],
    [-0.1, 1.08, -0.6], [0.1, 1.08, -0.6], [0.1, 1.08, -0.56], [-0.1, 1.08, -0.56]]);
  metal.box(0, 1.12, -0.56, 0.72, 0.04, 0.04);
  get('lamp').box(0, 1.0, -0.72, 0.14, 0.12, 0.08);
  // swingarm, exhaust, mudguards
  metal.box(0.08, wr + 0.08, 0.5, 0.05, 0.06, 0.5);
  chrome.cylY(0.18, 0.5, 0.35, 0.04, 0.6);
  body.box(0, wr * 2 + 0.05, -0.78, 0.14, 0.03, 0.35);
  body.box(0, wr * 2 + 0.1, 0.72, 0.14, 0.03, 0.45);
  get('tail').box(0, 0.95, 0.72, 0.1, 0.05, 0.04);
  return { parts: B, wheels: [{ x: 0, y: wr, z: -0.78, r: wr, w: 0.12 }, { x: 0, y: wr, z: 0.78, r: wr, w: 0.14 }] };
}

// (Rhys: build the APC yourself) Ghost's armoured personnel carrier:
// an eight-wheeled hull with a long raked glacis, a flat roof, a small turret
// with a cannon, a ramp at the back, vision blocks, smoke dischargers, and
// wheels half-hidden behind armoured skirts. About 7.4 m long, 2.8 m wide.
function apc(paint) {
  const B = {}; const get = (k) => (B[k] = B[k] || new Builder());
  const body = get(paint), glass = get('glass'), metal = get('metal');
  const W = 2.8, L = 7.4, z0 = -L / 2, z1 = L / 2, wr = 0.62;
  const yb = 0.75, ys = 1.55, yt = 2.25;          // belly, top of the skirts, roof
  // the lower hull: a boat-shaped belly between the wheels
  body.hull([[-W / 2 + 0.35, yb - 0.25, z0 + 0.9], [W / 2 - 0.35, yb - 0.25, z0 + 0.9], [W / 2 - 0.35, yb - 0.25, z1 - 0.4], [-W / 2 + 0.35, yb - 0.25, z1 - 0.4],
    [-W / 2, ys, z0 + 0.35], [W / 2, ys, z0 + 0.35], [W / 2, ys, z1], [-W / 2, ys, z1]]);
  // the upper hull: sides leaning in, the long raked glacis at the front
  body.hull([[-W / 2, ys, z0 + 0.35], [W / 2, ys, z0 + 0.35], [W / 2, ys, z1], [-W / 2, ys, z1],
    [-W / 2 + 0.22, yt, z0 + 2.1], [W / 2 - 0.22, yt, z0 + 2.1], [W / 2 - 0.22, yt, z1 - 0.05], [-W / 2 + 0.22, yt, z1 - 0.05]]);
  // a nose plate under the glacis
  body.hull([[-W / 2 + 0.3, yb - 0.1, z0 + 0.9], [W / 2 - 0.3, yb - 0.1, z0 + 0.9], [W / 2, ys, z0 + 0.35], [-W / 2, ys, z0 + 0.35],
    [-W / 2 + 0.3, yb + 0.1, z0 + 0.6], [W / 2 - 0.3, yb + 0.1, z0 + 0.6], [W / 2, ys - 0.05, z0 + 0.25], [-W / 2, ys - 0.05, z0 + 0.25]]);
  // armoured skirts over the wheels, with a lip
  for (const s of [-1, 1]) {
    body.box(s * (W / 2 + 0.03), ys - 0.32, 0.1, 0.06, 0.5, L - 0.9);
    metal.box(s * (W / 2 + 0.06), ys - 0.07, 0.1, 0.04, 0.05, L - 0.9);
  }
  // the driver's hatch and vision blocks at the top of the glacis
  metal.box(-0.55, yt + 0.04, z0 + 2.3, 0.7, 0.08, 0.7);
  for (const x of [-0.8, -0.55, -0.3]) glass.hull([[x - 0.1, yt - 0.12, z0 + 2.05], [x + 0.1, yt - 0.12, z0 + 2.05], [x + 0.1, yt - 0.12, z0 + 2.1], [x - 0.1, yt - 0.12, z0 + 2.1],
    [x - 0.1, yt + 0.02, z0 + 2.12], [x + 0.1, yt + 0.02, z0 + 2.12], [x + 0.1, yt + 0.02, z0 + 2.17], [x - 0.1, yt + 0.02, z0 + 2.17]]);
  // headlamps in guards on the glacis
  for (const s of [-1, 1]) { metal.box(s * 1.05, ys + 0.12, z0 + 0.42, 0.34, 0.24, 0.16); get('lamp').box(s * 1.05, ys + 0.12, z0 + 0.33, 0.24, 0.14, 0.03); }
  // the turret: a low, faceted block a little back of centre, and its cannon
  const tz = -0.2;
  body.hull([[-0.85, yt, tz - 0.9], [0.85, yt, tz - 0.9], [0.85, yt, tz + 0.9], [-0.85, yt, tz + 0.9],
    [-0.65, yt + 0.55, tz - 0.6], [0.65, yt + 0.55, tz - 0.6], [0.7, yt + 0.55, tz + 0.75], [-0.7, yt + 0.55, tz + 0.75]]);
  metal.box(0, yt + 0.3, tz - 1.0, 0.36, 0.26, 0.3);                        // mantlet
  get('metal').cylZ(0, yt + 0.3, tz - 2.05, 0.07, 1.9);                    // barrel
  metal.cylZ(0, yt + 0.3, tz - 3.0, 0.1, 0.22);                            // muzzle brake
  metal.box(0.35, yt + 0.62, tz + 0.2, 0.5, 0.08, 0.5);                    // commander's hatch
  glass.box(-0.35, yt + 0.6, tz - 0.35, 0.3, 0.12, 0.25);                  // sight
  // smoke dischargers, three a side, angled up and out
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) metal.box(s * 0.78, yt + 0.42 + k * 0.08, tz - 0.55 + k * 0.12, 0.16, 0.08, 0.08);
  // the ramp at the back, with its hinge line and a step
  metal.box(0, (yb + yt) / 2, z1 + 0.03, W - 0.7, yt - yb - 0.2, 0.06);
  metal.box(0, yb + 0.05, z1 + 0.12, W - 0.9, 0.06, 0.2);
  for (const s of [-1, 1]) get('tail').box(s * (W / 2 - 0.2), ys + 0.25, z1 + 0.02, 0.18, 0.12, 0.04);
  // stowage: a box and a rail on the roof, tow hooks, an aerial
  metal.box(0.9, yt + 0.12, z1 - 1.1, 0.5, 0.24, 1.2);
  for (const s of [-1, 1]) metal.box(s * 0.6, yb + 0.15, z0 + 0.62, 0.12, 0.12, 0.12);
  metal.box(-1.05, yt + 0.8, z1 - 0.5, 0.025, 1.6, 0.025);
  // eight wheels, four axles
  const wheels = [];
  for (const z of [z0 + 1.3, z0 + 2.75, z1 - 2.55, z1 - 1.1]) for (const s of [-1, 1]) wheels.push({ x: s * (W / 2 - 0.2), y: wr, z, r: wr, w: 0.42 });
  return { parts: B, wheels };
}

// ── bodies drawn as a side profile ────────────────────────────
// Rhys: "could you actually just draw better vehicles please?" A car is not a
// stack of boxes: its body is a side profile (bumper, bonnet, waist, boot)
// with the wheel arches cut out of its underside, pushed out to its width,
// the top edges rounded off. samples: [{ z, lo, hi }] front (-z) to back.
// w: half width; bev: the rounded shoulder; tuckAt(y): how far the sides
// lean in at height y (the cabin's tumblehome). Planar uvs: one texture
// repeat every `tile` metres.
function profile(B, samples, opts) {
  const w = opts.w, bev = opts.bev || 0, tile = opts.tile || 2;
  const xAt = opts.xAt || (() => w);
  const uvS = (y, z) => [z / tile, y / tile], uvT = (x, z) => [x / tile, z / tile], uvC = (x, y) => [x / tile, y / tile];
  for (let k = 0; k < samples.length - 1; k++) {
    const A = samples[k], C = samples[k + 1];
    for (const sd of [-1, 1]) {
      const xa = (y) => sd * xAt(y);
      // the side, up to the shoulder
      B.face([[xa(A.lo), A.lo, A.z], [xa(C.lo), C.lo, C.z], [xa(C.hi - bev), C.hi - bev, C.z], [xa(A.hi - bev), A.hi - bev, A.z]],
        [uvS(A.lo, A.z), uvS(C.lo, C.z), uvS(C.hi - bev, C.z), uvS(A.hi - bev, A.z)], [sd, 0, 0]);
      // the rounded shoulder
      if (bev) B.face([[xa(A.hi - bev), A.hi - bev, A.z], [xa(C.hi - bev), C.hi - bev, C.z], [sd * (xAt(C.hi) - bev), C.hi, C.z], [sd * (xAt(A.hi) - bev), A.hi, A.z]],
        [uvS(A.hi - bev, A.z), uvS(C.hi - bev, C.z), uvS(C.hi, C.z), uvS(A.hi, A.z)], [sd, 1, 0]);
    }
    // the top (bonnet, roof, boot lid) and the underside
    const ta = xAt(A.hi) - bev, tc = xAt(C.hi) - bev;
    B.face([[-ta, A.hi, A.z], [ta, A.hi, A.z], [tc, C.hi, C.z], [-tc, C.hi, C.z]], [uvT(-ta, A.z), uvT(ta, A.z), uvT(tc, C.z), uvT(-tc, C.z)], [0, 1, 0]);
    B.face([[-xAt(A.lo), A.lo, A.z], [xAt(A.lo), A.lo, A.z], [xAt(C.lo), C.lo, C.z], [-xAt(C.lo), C.lo, C.z]], [uvT(-w, A.z), uvT(w, A.z), uvT(w, C.z), uvT(-w, C.z)], [0, -1, 0]);
  }
  // the two ends
  for (const [S, dir] of [[samples[0], -1], [samples[samples.length - 1], 1]]) {
    if (S.hi - S.lo < 1e-4) continue;
    const xl = xAt(S.lo), xs = xAt(S.hi - bev), xt = xAt(S.hi) - bev;
    B.face([[-xl, S.lo, S.z], [xl, S.lo, S.z], [xs, S.hi - bev, S.z], [-xs, S.hi - bev, S.z]], [uvC(-xl, S.lo), uvC(xl, S.lo), uvC(xs, S.hi - bev), uvC(-xs, S.hi - bev)], [0, 0, dir]);
    if (bev) B.face([[-xs, S.hi - bev, S.z], [xs, S.hi - bev, S.z], [xt, S.hi, S.z], [-xt, S.hi, S.z]], [uvC(-xs, S.hi - bev), uvC(xs, S.hi - bev), uvC(xt, S.hi), uvC(-xt, S.hi)], [0, 0, dir]);
  }
}
// The underside line of a body with its wheel arches cut out: `sill` between
// them, a round arch of radius R over each wheel centre (z, y).
function archLine(sill, wheels, R) {
  return (z) => {
    let lo = sill;
    for (const [wz, wy] of wheels) { const d = z - wz; if (Math.abs(d) < R) lo = Math.max(lo, wy + Math.sqrt(R * R - d * d)); }
    return lo;
  };
}
// Sample points along z: evenly, and closely round each arch so it reads round.
function zSamples(z0, z1, wheels, R, extra) {
  const zs = new Set([z0, z1, ...(extra || [])]);
  for (let z = z0; z < z1; z += 0.25) zs.add(+z.toFixed(4));
  for (const [wz] of wheels) for (let k = 0; k <= 12; k++) zs.add(+(wz - R + (2 * R * k) / 12).toFixed(4));
  return [...zs].filter((z) => z >= z0 && z <= z1).sort((a, b) => a - b);
}
// piecewise-linear height through [[z, y], ...]
function lerpLine(pts) {
  return (z) => {
    if (z <= pts[0][0]) return pts[0][1];
    for (let k = 0; k < pts.length - 1; k++) {
      const [za, ya] = pts[k], [zb, yb] = pts[k + 1];
      if (z <= zb) return ya + (yb - ya) * ((z - za) / ((zb - za) || 1));
    }
    return pts[pts.length - 1][1];
  };
}
// a flat band laid on a side of the body (stripes, door seams, window glass),
// `o` metres proud of it, at side sd: corners given as [y, z]
function sideBand(B, sd, xAt, corners, o, uv) {
  const pts = corners.map(([y, z]) => [sd * (xAt(y) + o), y, z]);
  B.face(pts, uv || corners.map(([y, z]) => [z, y]), [sd, 0, 0]);
}

// A British police estate car, about 4.65 m by 1.8 m: a real
// profile - low nose, raked windscreen, long roof, near-upright tailgate -
// round arches, alloy wheels, and the blue-and-yellow check down its sides.
// The light bar is the mission's own (it flashes), set on the roof at 1.43 m.
function policeCar() {
  const B = {}; const get = (k) => (B[k] = B[k] || new Builder());
  const body = get('policeWhite'), glass = get('glass'), trim = get('trim');
  const L = 4.65, z0 = -L / 2, z1 = L / 2, wr = 0.32, R = 0.4, w = 0.9, bev = 0.07;
  const wheelsZ = [[-1.42, wr], [1.38, wr]];
  const lo = archLine(0.25, wheelsZ, R);
  const nose = lerpLine([[z0, 0.30], [z0 + 0.12, 0.25], [z1 - 0.12, 0.25], [z1, 0.32]]);
  const belt = lerpLine([[z0, 0.64], [z0 + 0.08, 0.74], [z0 + 0.35, 0.80], [-0.85, 0.92], [2.15, 0.96], [z1, 0.90]]);
  const zs = zSamples(z0, z1, wheelsZ, R, [z0 + 0.08, z0 + 0.35, -0.85, 2.15]);
  profile(body, zs.map((z) => ({ z, lo: Math.max(lo(z), nose(z)), hi: belt(z) })), { w, bev, tile: 1.2 });
  // the cabin: glass all round, the sides leaning in; then the roof, the
  // pillars and the frames over it in the body's colour
  const yb = 0.92, yr = 1.42;
  const xg = (y) => (w - bev) - 0.13 * Math.max(0, (y - yb) / (yr - yb));
  const roof = lerpLine([[-0.85, 0.92], [-0.05, 1.42], [2.0, 1.40], [2.2, 1.06]]);
  const czs = [-0.85, -0.45, -0.05, 0.6, 1.3, 2.0, 2.1, 2.2];
  profile(glass, czs.map((z) => ({ z, lo: belt(z), hi: roof(z) })), { w: w - bev, xAt: xg, tile: 2 });
  // the roof panel, a little proud of the glass and wrapping its edges
  const rp = [-0.12, 0.6, 1.3, 2.02].map((z) => ({ z, lo: roof(z) - 0.04, hi: roof(z) + 0.012 }));
  profile(body, rp, { w: xg(yr) + 0.012, bev: 0.02, tile: 1.2 });
  for (const sd of [-1, 1]) {
    // A pillar along the windscreen's edge, B and C pillars, the frame over the doors
    sideBand(body, sd, xg, [[yb, -0.85], [yb, -0.72], [yr, -0.0], [yr, -0.12]], 0.012);
    sideBand(body, sd, xg, [[yb, 0.62], [yb, 0.74], [yr, 0.74], [yr, 0.62]], 0.012);
    sideBand(body, sd, xg, [[yb, 1.72], [yb, 2.2], [1.08, 2.2], [yr - 0.02, 2.0], [yr - 0.02, 1.86]], 0.012);
    sideBand(body, sd, xg, [[yr - 0.07, -0.05], [yr - 0.07, 2.0], [yr, 2.0], [yr, -0.05]], 0.013);
    sideBand(body, sd, xg, [[yb, -0.85], [yb, 2.2], [yb + 0.05, 2.2], [yb + 0.05, -0.85]], 0.013);
    // the check: Battenberg down the doors, a stripe along the wings
    const xb = () => w;
    sideBand(get('livery'), sd, xb, [[0.48, -1.0], [0.48, 0.96], [0.84, 0.96], [0.84, -1.0]], 0.004, [[-1.0 / 0.72, 0], [0.96 / 0.72, 0], [0.96 / 0.72, 1], [-1.0 / 0.72, 1]]);
    for (const [za, zb] of [[0.96, z1 - 0.15]]) sideBand(get('livery'), sd, xb, [[0.76, za], [0.76, zb], [0.84, zb], [0.84, za]], 0.004, [[za / 0.72, 0.5], [zb / 0.72, 0.5], [zb / 0.72, 1], [za / 0.72, 1]]);
    // door seams and handles, the black sill and the arch liners
    for (const zc of [-0.85, 0.66, 1.98]) sideBand(trim, sd, xb, [[0.3, zc], [0.3, zc + 0.012], [0.85, zc + 0.012], [0.85, zc]], 0.006);
    for (const zh of [-0.2, 1.2]) trim.box(sd * (w + 0.01), 0.8, zh, 0.03, 0.04, 0.16);
    trim.box(sd * (w - 0.02), 0.28, 0, 0.06, 0.08, 2.0);
    for (const [wz] of wheelsZ) trim.box(sd * (w - 0.35), 0.7, wz, 0.5, 0.04, 2 * R);
    // the mirror, on its arm
    body.box(sd * (w + 0.1), 1.0, -0.72, 0.16, 0.12, 0.1);
    trim.box(sd * (w + 0.03), 0.98, -0.72, 0.06, 0.04, 0.06);
  }
  // the underside in shadow, so the road does not show through
  trim.box(0, 0.22, 0, 1.2, 0.06, L - 0.6);
  // front: bumper, grille, lamps, plate; back: bumper, lamps, plate
  trim.box(0, 0.38, z0 + 0.04, 1.78, 0.16, 0.1);
  trim.box(0, 0.58, z0 + 0.03, 0.9, 0.12, 0.04);
  for (const sd of [-1, 1]) {
    get('lamp').hull([[sd * 0.5, 0.63, z0 + 0.06], [sd * 0.84, 0.63, z0 + 0.12], [sd * 0.84, 0.63, z0 + 0.16], [sd * 0.5, 0.63, z0 + 0.1],
      [sd * 0.52, 0.72, z0 + 0.12], [sd * 0.82, 0.72, z0 + 0.2], [sd * 0.82, 0.72, z0 + 0.24], [sd * 0.52, 0.72, z0 + 0.16]]);
    get('amber').box(sd * 0.86, 0.42, z0 + 0.08, 0.08, 0.06, 0.04);
    get('tail').box(sd * 0.74, 0.8, z1 - 0.01, 0.26, 0.2, 0.04);
    get('amber').box(sd * 0.74, 0.66, z1 - 0.01, 0.26, 0.06, 0.04);
  }
  get('plateW').box(0, 0.4, z0 - 0.02, 0.52, 0.11, 0.02);
  trim.box(0, 0.4, z1 + 0.01, 1.78, 0.16, 0.08);
  get('plateY').box(0, 0.58, z1 + 0.005, 0.52, 0.11, 0.02);
  // the roof number, for the helicopter
  get('roofNo').box(0, 1.433, 1.15, 1.0, 0.004, 0.8);
  const wheels = [];
  for (const [z] of wheelsZ) for (const sd of [-1, 1]) wheels.push({ x: sd * (w - 0.13), y: wr, z, r: wr, w: 0.22 });
  return { parts: B, wheels, hub: 'alloy', roof: 1.42 };
}

// (Rhys: a "Bulletproof Jeep" rather than a mini-tank APC) Ghost's
// armoured four-by-four: tall and square, a short flat bonnet, an upright
// windscreen in thick dark glass with steel frames, black arch flares over big
// tyres, a bull bar and winch, a snorkel, side steps, a roof rack, the spare on
// the back door. About 4.9 m long, 2.1 m across the flares.
function armouredJeep(paint) {
  const B = {}; const get = (k) => (B[k] = B[k] || new Builder());
  const body = get(paint), glass = get('glass'), metal = get('metal'), trim = get('trim');
  const L = 4.7, z0 = -L / 2, z1 = L / 2, wr = 0.42, R = 0.5, w = 0.98, bev = 0.05;
  const wheelsZ = [[-1.5, wr], [1.42, wr]];
  const lo = archLine(0.52, wheelsZ, R);
  const ends = lerpLine([[z0, 0.6], [z0 + 0.15, 0.52], [z1 - 0.15, 0.52], [z1, 0.6]]);
  const belt = lerpLine([[z0, 1.08], [z0 + 0.1, 1.2], [-0.72, 1.28], [z1 - 0.05, 1.3], [z1, 1.26]]);
  const zs = zSamples(z0, z1, wheelsZ, R, [z0 + 0.1, -0.72, z1 - 0.05]);
  profile(body, zs.map((z) => ({ z, lo: Math.max(lo(z), ends(z)), hi: belt(z) })), { w, bev, tile: 2 });
  // the cabin: nearly upright all round, the sides barely leaning
  const yb = 1.28, yr = 1.95;
  const xg = (y) => (w - bev) - 0.06 * Math.max(0, (y - yb) / (yr - yb));
  const roof = lerpLine([[-0.72, 1.28], [-0.5, 1.95], [z1 - 0.06, 1.95]]);
  const czs = [-0.72, -0.5, 0.2, 1.0, 1.7, z1 - 0.06];
  profile(glass, czs.map((z) => ({ z, lo: belt(z), hi: roof(z) })), { w: w - bev, xAt: xg, tile: 2 });
  // armour over the glass: the roof, wide pillars, and the frames that make
  // the windows small (the glass is thick; the steel round it thicker)
  profile(body, [-0.55, 0.4, 1.4, z1 - 0.04].map((z) => ({ z, lo: yr - 0.06, hi: yr + 0.03 })), { w: xg(yr) + 0.02, bev: 0.03, tile: 2 });
  for (const sd of [-1, 1]) {
    sideBand(body, sd, xg, [[yb, -0.72], [yb, -0.5], [yr, -0.36], [yr, -0.58]], 0.015);
    sideBand(body, sd, xg, [[yb, 0.55], [yb, 0.8], [yr, 0.8], [yr, 0.55]], 0.015);
    sideBand(body, sd, xg, [[yb, 1.75], [yb, z1 - 0.06], [yr, z1 - 0.06], [yr, 1.75]], 0.015);
    sideBand(body, sd, xg, [[yr - 0.16, -0.5], [yr - 0.16, z1 - 0.06], [yr, z1 - 0.06], [yr, -0.5]], 0.016);
    sideBand(body, sd, xg, [[yb, -0.72], [yb, z1 - 0.06], [yb + 0.14, z1 - 0.06], [yb + 0.14, -0.72]], 0.016);
    // black flares over the arches, side steps, door seams and handles
    for (const [wz] of wheelsZ) {
      for (let k = 0; k < 10; k++) {
        const a0 = Math.PI * k / 10, a1 = Math.PI * (k + 1) / 10, r0 = R + 0.01, r1 = R + 0.11;
        const P = (a, r) => [wr + Math.sin(a) * r, wz - Math.cos(a) * r];
        const [y0, za] = P(a0, r0), [y1, zb] = P(a1, r0), [y2, zc] = P(a1, r1), [y3, zd] = P(a0, r1);
        trim.face([[sd * (w + 0.07), y0, za], [sd * (w + 0.07), y1, zb], [sd * (w + 0.07), y2, zc], [sd * (w + 0.07), y3, zd]], [[0, 0], [1, 0], [1, 1], [0, 1]], [sd, 0, 0]);
        trim.face([[sd * (w - 0.02), y3, zd], [sd * (w + 0.07), y3, zd], [sd * (w + 0.07), y2, zc], [sd * (w - 0.02), y2, zc]], [[0, 0], [1, 0], [1, 1], [0, 1]], [0, Math.sin((a0 + a1) / 2), -Math.cos((a0 + a1) / 2)]);
      }
      trim.box(sd * (w - 0.4), wr + R - 0.02, wz, 0.7, 0.05, 2 * R);
    }
    metal.box(sd * (w + 0.08), 0.5, -0.04, 0.2, 0.05, 1.8);
    for (const zc of [-0.72, 0.68]) sideBand(trim, sd, () => w, [[0.55, zc], [0.55, zc + 0.014], [1.22, zc + 0.014], [1.22, zc]], 0.006);
    for (const zh of [-0.15, 1.25]) metal.box(sd * (w + 0.012), 1.15, zh, 0.03, 0.05, 0.2);
    // mirrors on stout arms
    body.box(sd * (w + 0.16), 1.42, -0.6, 0.1, 0.22, 0.16);
    metal.box(sd * (w + 0.06), 1.36, -0.6, 0.12, 0.04, 0.04);
  }
  trim.box(0, 0.5, 0, 1.3, 0.06, L - 0.9);
  // steel frames round the windscreen (split down the middle) and the back window
  const zw = (y) => -0.72 + 0.22 * (y - yb) / (yr - yb);
  for (const x of [0, -0.86, 0.86]) body.hull([[x - 0.05, yb, zw(yb) - 0.03], [x + 0.05, yb, zw(yb) - 0.03], [x + 0.05, yb, zw(yb) + 0.02], [x - 0.05, yb, zw(yb) + 0.02],
    [x - 0.05, yr, zw(yr) - 0.03], [x + 0.05, yr, zw(yr) - 0.03], [x + 0.05, yr, zw(yr) + 0.02], [x - 0.05, yr, zw(yr) + 0.02]]);
  body.box(0, yr - 0.06, zw(yr - 0.06) - 0.01, 1.84, 0.12, 0.06);
  body.box(0, yb + 0.06, zw(yb + 0.06) - 0.01, 1.84, 0.12, 0.06);
  for (const x of [-0.78, 0.78]) body.box(x, (yb + yr) / 2, z1 - 0.04, 0.32, yr - yb, 0.05);
  body.box(0, yr - 0.1, z1 - 0.04, 1.86, 0.2, 0.05);
  body.box(0, yb + 0.08, z1 - 0.04, 1.86, 0.16, 0.05);
  // the front: armoured grille louvres, lamps in cages, bull bar and winch
  for (let k = 0; k < 6; k++) metal.box(0, 0.78 + k * 0.07, z0 - 0.01, 0.9, 0.03, 0.03);
  for (const sd of [-1, 1]) {
    get('lamp').box(sd * 0.7, 0.92, z0 - 0.005, 0.24, 0.18, 0.03);
    for (const dx of [-0.08, 0, 0.08]) metal.box(sd * 0.7 + dx, 0.92, z0 - 0.05, 0.02, 0.22, 0.02);
    get('tail').box(sd * 0.86, 1.05, z1 + 0.01, 0.12, 0.3, 0.04);
  }
  metal.box(0, 0.62, z0 - 0.1, 1.9, 0.2, 0.18);                         // bumper
  for (const sd of [-1, 1]) metal.box(sd * 0.55, 0.92, z0 - 0.22, 0.07, 0.62, 0.07);   // bull bar uprights
  metal.box(0, 1.2, z0 - 0.22, 1.18, 0.07, 0.07);
  metal.box(0, 0.9, z0 - 0.22, 1.18, 0.05, 0.05);
  trim.box(0, 0.62, z0 - 0.22, 0.42, 0.16, 0.14);                       // winch
  get('plateW').box(0, 0.48, z0 - 0.2, 0.5, 0.1, 0.02);
  // the snorkel up the right pillar
  trim.box(w + 0.06, 1.0, -0.85, 0.12, 0.5, 0.12);
  trim.box(w + 0.06, 1.62, -0.66, 0.1, 0.75, 0.1);
  trim.box(w + 0.06, 2.02, -0.66, 0.12, 0.1, 0.22);
  // the back: bumper, plate, the spare on the door
  metal.box(0, 0.62, z1 + 0.08, 1.9, 0.2, 0.16);
  get('plateY').box(0, 0.86, z1 + 0.012, 0.5, 0.1, 0.02);
  get('tyre').cylZ(-0.35, 1.2, z1 + 0.18, 0.4, 0.26);
  get('hub').cylZ(-0.35, 1.2, z1 + 0.32, 0.22, 0.02);
  // the roof rack, a hatch and the aerials
  for (const sd of [-1, 1]) metal.box(sd * 0.82, yr + 0.12, 0.85, 0.05, 0.05, 2.5);
  for (const z of [-0.3, 0.4, 1.1, 1.8]) metal.box(0, yr + 0.15, z, 1.66, 0.04, 0.05);
  for (const z of [-0.35, 1.95]) for (const sd of [-1, 1]) metal.box(sd * 0.82, yr + 0.07, z, 0.05, 0.1, 0.05);
  metal.box(0.35, yr + 0.06, 0.35, 0.6, 0.06, 0.6);
  metal.box(-0.8, yr + 0.8, 2.0, 0.02, 1.6, 0.02);
  metal.box(0.8, yr + 0.55, 2.0, 0.02, 1.1, 0.02);
  const wheels = [];
  for (const [z] of wheelsZ) for (const sd of [-1, 1]) wheels.push({ x: sd * (w - 0.12), y: wr, z, r: wr, w: 0.32 });
  return { parts: B, wheels, roof: yr };
}

// a speedboat: a V-hull rising to a pointed bow, a low deck, a windscreen over the wheel, two seats, an
// outboard on the transom. Waterline at y = 0 (the hull below it); 6 m long, facing -z
function speedboat(paint) {
  const B = {}; const get = (k) => (B[k] = B[k] || new Builder());
  const hull = get(paint), deck = get('white'), glass = get('glass'), metal = get('metal'), trim = get('trim');
  const L0 = -3.0, L1 = 3.0, W = 1.1, keel = -0.45, top = 0.55;
  // the hull: sections along its length, each a V (keel, chines, gunwales); the bow comes to a point
  const sec = (z) => { const t = (z - L0) / (L1 - L0); const bow = Math.min(1, t / 0.32); const w = W * (0.15 + 0.85 * Math.sqrt(bow)); return { z, w, keel: keel + (1 - bow) * 0.4, top: top + (1 - bow) * 0.15 }; };
  const zs = [L0, -2.6, -2.1, -1.4, -0.4, 0.8, 2.0, L1].map(sec);
  for (let k = 0; k + 1 < zs.length; k++) {
    const a = zs[k], b = zs[k + 1];
    for (const sd of [-1, 1]) {
      const ach = [sd * a.w * 0.8, -0.05, a.z], bch = [sd * b.w * 0.8, -0.05, b.z];
      hull.face([[0, a.keel, a.z], [0, b.keel, b.z], bch, ach], [[0, 0], [1, 0], [1, 1], [0, 1]], [sd, -1, 0]);
      hull.face([ach, bch, [sd * b.w, b.top, b.z], [sd * a.w, a.top, a.z]], [[0, 0], [1, 0], [1, 1], [0, 1]], [sd, 0.2, 0]);
    }
  }
  const tr = zs[zs.length - 1];
  hull.face([[-tr.w, tr.top, L1], [tr.w, tr.top, L1], [tr.w * 0.8, -0.05, L1], [0, tr.keel, L1], [-tr.w * 0.8, -0.05, L1]], [[0, 0], [1, 0], [1, 1], [0.5, 1], [0, 1]], [0, 0, 1]);
  // the deck: forward over the bow, a well aft where the seats are
  for (let k = 0; k + 1 < 4; k++) { const a = zs[k], b = zs[k + 1]; deck.face([[-a.w, a.top, a.z], [a.w, a.top, a.z], [b.w, b.top, b.z], [-b.w, b.top, b.z]], [[0, 0], [1, 0], [1, 1], [0, 1]], [0, 1, 0]); }
  deck.box(0, 0.2, 0.9, 2 * W - 0.15, 0.06, 4.0);
  for (const sd of [-1, 1]) deck.box(sd * (W - 0.08), 0.42, 0.9, 0.12, 0.3, 4.0);
  // the console and its windscreen, the seats, the rails
  deck.box(-0.4, 0.55, -0.2, 0.7, 0.7, 0.6);
  glass.hull([[-1.0, 0.9, -0.55], [1.0, 0.9, -0.55], [1.0, 0.9, -0.5], [-1.0, 0.9, -0.5], [-0.95, 1.3, -0.35], [0.95, 1.3, -0.35], [0.95, 1.3, -0.3], [-0.95, 1.3, -0.3]]);
  get('seat').box(-0.4, 0.45, 0.65, 0.6, 0.18, 0.55); get('seat').box(0.4, 0.45, 0.65, 0.6, 0.18, 0.55);
  get('seat').box(-0.4, 0.75, 0.92, 0.6, 0.45, 0.12); get('seat').box(0.4, 0.75, 0.92, 0.6, 0.45, 0.12);
  get('seat').box(0, 0.45, 2.2, 1.9, 0.2, 0.7);
  for (const sd of [-1, 1]) metal.box(sd * (W - 0.1), 0.8, -1.7, 0.04, 0.04, 2.4);
  // the outboard: its cowl on the transom, its leg down into the water
  trim.box(0, 0.75, 3.25, 0.55, 0.7, 0.55); metal.box(0, 0.1, 3.3, 0.18, 0.9, 0.22);
  get('lamp').box(0, 0.7, -2.95, 0.15, 0.1, 0.05);
  return { parts: B, wheels: [] };
}

// a business jet: a long fuselage (the cabin's windows down it), swept wings, the T-tail, two engines
// at the back, the nose wheel and the mains. 15 m long, facing -z; its wheels on y = 0
function jet(paint) {
  const B = {}; const get = (k) => (B[k] = B[k] || new Builder());
  const body = get(paint), white = get('white'), glass = get('glass'), metal = get('metal'), tyre = get('tyre');
  body.box(0, 1.9, 0.5, 2.0, 2.0, 11.0);                   // the fuselage
  body.box(0, 1.75, -5.6, 1.6, 1.6, 1.4); body.box(0, 1.65, -6.7, 1.0, 1.1, 0.9);       // the nose, tapering
  glass.box(0, 2.2, -6.0, 1.3, 0.35, 0.6);                 // the cockpit's windscreen
  for (let z = -3.5; z <= 4.5; z += 1.1) for (const sd of [-1, 1]) glass.box(sd * 1.01, 2.2, z, 0.02, 0.35, 0.45);
  body.box(0, 1.9, 6.6, 1.4, 1.6, 1.4); body.box(0, 2.1, 7.6, 0.8, 1.0, 0.8);            // the tail cone
  white.box(0, 4.0, 6.8, 0.25, 3.2, 1.6); white.box(0, 5.6, 7.3, 4.4, 0.2, 1.3);        // the fin and the T-tailplane
  for (const sd of [-1, 1]) {
    white.box(sd * 3.8, 1.2, 0.8, 5.6, 0.22, 2.6); white.box(sd * 6.4, 1.5, 1.8, 0.2, 0.9, 0.6);   // the wings, winglets
    metal.box(sd * 1.6, 2.6, 5.0, 0.9, 0.9, 2.4);                                        // the engines
    tyre.box(sd * 1.6, 0.4, 1.2, 0.3, 0.8, 0.8); metal.box(sd * 1.6, 0.9, 1.2, 0.12, 0.6, 0.12);
  }
  tyre.box(0, 0.35, -5.4, 0.25, 0.7, 0.7); metal.box(0, 0.8, -5.4, 0.1, 0.6, 0.1);
  return { parts: B, wheels: [] };
}

const MODELS = { personnelTruck, lightUtility, motorcycle, apc, policeCar, armouredJeep, speedboat, jet };
// sizes for the level's solid boxes [width, height, length] and where a roof light sits
export const VEHICLE_SIZE = { policeCar: { W: 1.84, H: 1.42, L: 4.7, roof: 1.42 }, armouredJeep: { W: 2.2, H: 1.95, L: 5.2, roof: 1.98 } };

// a vehicle's parts, without the engine: for the tests
export function vehicleDef(type, paint) { return MODELS[type](paint || 'olive'); }
// its size: [min, max] over every part, wheels included
export function vehicleBounds(def) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const b of Object.values(def.parts)) for (let i = 0; i < b.p.length; i += 3) for (let a = 0; a < 3; a++) { min[a] = Math.min(min[a], b.p[i + a]); max[a] = Math.max(max[a], b.p[i + a]); }
  for (const w of def.wheels) { min[0] = Math.min(min[0], w.x - w.w / 2); max[0] = Math.max(max[0], w.x + w.w / 2); min[1] = Math.min(min[1], w.y - w.r); }
  return { min, max };
}

// Build one vehicle into the scene. spec: { type, pos, yaw, paint }
let MATS = null;
export function buildVehicle(pc, app, spec) {
  const device = app.graphicsDevice;
  MATS = MATS || makeMaterials(pc, device);
  const def = MODELS[spec.type](spec.paint || 'olive');
  const root = new pc.Entity('vehicle-' + spec.type);
  const meshInstances = [];
  for (const [matName, builder] of Object.entries(def.parts)) {
    const mt = matName === 'roofNo' ? MATS.roofFor(spec.roofNo || '14') : (MATS[matName] || MATS.metal);
    meshInstances.push(new pc.MeshInstance(builder.mesh(pc, device), mt));
  }
  root.addComponent('render', { meshInstances, castShadows: true, receiveShadows: true });
  // wheels: separate, so they can turn and spin when vehicles can be driven
  root.wheels = [];
  for (const w of def.wheels) {
    const wb = new Builder(); wb.cylX(0, 0, 0, w.r, w.w, 16);
    const hb = new Builder(); hb.cylX(w.x > 0 ? w.w / 2 : -w.w / 2, 0, 0, w.r * 0.55, 0.04, 12);
    const we = new pc.Entity('wheel');
    we.addComponent('render', { meshInstances: [new pc.MeshInstance(wb.mesh(pc, device), MATS.tyre), new pc.MeshInstance(hb.mesh(pc, device), MATS[def.hub || 'hub'])], castShadows: true });
    we.setLocalPosition(w.x, w.y, w.z);
    root.addChild(we);
    root.wheels.push(we);
  }
  root.setPosition(spec.pos[0], spec.pos[1] || 0, spec.pos[2]);
  root.setEulerAngles(0, spec.yaw || 0, 0);
  app.root.addChild(root);
  return root;
}
