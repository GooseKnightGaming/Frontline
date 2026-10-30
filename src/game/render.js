// FRONTLINE - turns level data into a PlayCanvas scene.
// Static geometry is merged into one mesh per material (few draw calls, kind
// to a Chromebook). A cheap "baked" look comes from shading painted into the
// vertices: surfaces darken toward the ground and in crevices.

import { makeTextures, makeSignTexture, makeMatrixSign } from './textures.js';
import { BAKE, planChunks, packLightmap, lightmapMultiplier, bounceFill } from '../sim/bake.js';
import { flatPoly } from '../sim/shapes.js';

// scale = metres per texture repeat for 'world' mapping
const MATS = {
  desert:    { scale: 24,  gloss: 0.08, metal: 0 },
  rock:      { scale: 12,  gloss: 0.1,  metal: 0 },
  asphalt:   { scale: 10,  gloss: 0.15, metal: 0 },
  crate_ghost:  { scale: 1, gloss: 0.2, metal: 0 },
  crate_upright:{ scale: 1, gloss: 0.2, metal: 0 },
  crate_fragile:{ scale: 1, gloss: 0.2, metal: 0 },
  concrete:  { scale: 6,   gloss: 0.18, metal: 0 },
  concrete2: { scale: 3,   gloss: 0.2,  metal: 0 },
  wall:      { scale: 4,   gloss: 0.12, metal: 0 },
  metal:     { scale: 2,   gloss: 0.45, metal: 0.55 },
  grating:   { scale: 1.6, gloss: 0.4,  metal: 0.6 },
  rail:      { scale: 1.5, gloss: 0.45, metal: 0.3 },
  hazard:    { scale: 1.6, gloss: 0.25, metal: 0 },
  pooltile:  { scale: 2,   gloss: 0.7,  metal: 0 },
  crate:     { scale: 1.2, gloss: 0.1,  metal: 0 },
  parcel:    { scale: 1.2, gloss: 0.1,  metal: 0 },
  cargo:     { scale: 1.2, gloss: 0.1,  metal: 0 },
  barrel:    { scale: 1.1, gloss: 0.35, metal: 0.3 },
  board:     { scale: 1.4, gloss: 0.5,  metal: 0 },
  ladder:    { scale: 0.42, gloss: 0.35, metal: 0.6 },
  fence:     { scale: 3,   gloss: 0.3,  metal: 0.4 },
  target:    { scale: 1,   gloss: 0.1,  metal: 0 },
  lamp:      { scale: 1,   gloss: 0.4,  metal: 0.2 },
  glass:     { scale: 3,   gloss: 0.9,  metal: 0.1 },
  wood:      { scale: 1.2, gloss: 0.3,  metal: 0 },
  door:      { scale: 1,   gloss: 0.3,  metal: 0 },
  brick:     { scale: 2,   gloss: 0.12, metal: 0 },
  plaster:   { scale: 3,   gloss: 0.15, metal: 0 },
  carpet:    { scale: 2,   gloss: 0.05, metal: 0 },
  facade:    { scale: 12,  gloss: 0.3,  metal: 0 },
  lawn:      { scale: 4,   gloss: 0.05, metal: 0 },
  hedge:     { scale: 1.5, gloss: 0.05, metal: 0 },
  cloth:     { scale: 1.5, gloss: 0.1,  metal: 0 },
  felt:      { scale: 1.5, gloss: 0.04, metal: 0 },      // (M6.15.0) a gaming table's green baize
  screen:    { scale: 1.2, gloss: 0.75, metal: 0 },
  painting:  { scale: 1.2, gloss: 0.2,  metal: 0 },
  fabric:    { scale: 1,   gloss: 0.05, metal: 0 },
  armour:    { scale: 1.2, gloss: 0.35, metal: 0.35 },   // a reinforced door's painted steel (M6.9.19)
  paper:     { scale: 1,   gloss: 0.1,  metal: 0 },      // (M6.13.0) intel lying on a table
  // (M6.16.0, the casino's fittings) coloured by each piece's tint
  paint:     { scale: 1,   gloss: 0.35, metal: 0 },      // upholstery, porcelain, bottles, partitions
  neon:      { scale: 1,   gloss: 0.3,  metal: 0 },      // a glowing strip or sign, its colour the tint
  slotface:  { scale: 1,   gloss: 0.6,  metal: 0 },      // a slot machine's lit front
  slotface1: { scale: 1, gloss: 0.6, metal: 0 }, slotface2: { scale: 1, gloss: 0.6, metal: 0 }, slotface3: { scale: 1, gloss: 0.6, metal: 0 },
  slotface4: { scale: 1, gloss: 0.6, metal: 0 }, slotface5: { scale: 1, gloss: 0.6, metal: 0 },     // (M6.17.1) the other games
  cladding:  { scale: 4,   gloss: 0.35, metal: 0 },      // the casino's stone outside
  marble:    { scale: 2,   gloss: 0.7,  metal: 0 },      // a bar top, a vanity
  wctile:    { scale: 1.2, gloss: 0.55, metal: 0 },      // washroom tiles
  mirror:    { scale: 1,   gloss: 0.97, metal: 1 },
  layout:    { scale: 1,   gloss: 0.05, metal: 0 },      // a roulette table's printed baize
};
for (const c of ['blue', 'grey', 'orange', 'green', 'red', 'white']) MATS['cont_' + c] = { scale: 6, gloss: 0.32, metal: 0.25 };

// face definitions: normal, and the two axes that map to u and v
const FACES = [
  { n: [1, 0, 0], u: 2, v: 1, flipU: true },
  { n: [-1, 0, 0], u: 2, v: 1, flipU: false },
  { n: [0, 1, 0], u: 0, v: 2, flipU: false },
  { n: [0, -1, 0], u: 0, v: 2, flipU: false },
  { n: [0, 0, 1], u: 0, v: 1, flipU: false },
  { n: [0, 0, -1], u: 0, v: 1, flipU: true },
];

function shadeAt(x, y, z, piece) {
  // darker near the ground, and a little darker low on tall things
  const base = piece.min[1] < -0.5 && piece.max[1] <= 0.05 ? 0.78 : 1;   // pool interior
  const h = y - Math.max(0, piece.min[1] < 0 && piece.max[1] > 0 ? 0 : piece.min[1]);
  const lift = Math.min(1, Math.max(0, h / 1.3));
  return base * (0.62 + 0.38 * Math.sqrt(lift));
}

// atlas: also lay out a second set of texture coordinates for a lightmap
// (src/sim/bake.js packLightmap: every face its own patch, packed in rows).
// A building's windows run on round its corners (M6.9.15, Rhys: a corner
// window was lit seen from one side, dark from the other). The facade's u goes
// once round the block's walls, left to right as seen from outside, starting
// at its north-east corner; the repeat is stretched a little so a whole number
// of them fits the way round, and the texture meets itself at every corner.
export function wrapU(p, n, v) {
  const W = p.max[0] - p.min[0], D = p.max[2] - p.min[2], per = 2 * (W + D);
  const reps = Math.max(1, Math.round(per / MATS.facade.scale));
  let P;
  if (n[2] < 0) P = p.max[0] - v[0];
  else if (n[0] < 0) P = W + (v[2] - p.min[2]);
  else if (n[2] > 0) P = W + D + (v[0] - p.min[0]);
  else P = 2 * W + D + (p.max[2] - v[2]);
  return (P / per) * reps;
}

// (M6.18.3) a mover's pieces, grouped by where they stand (cells of MOVER_CELL metres), when there are many
export const MOVER_CELL = 60;
export function moverChunks(pieces) {
  if (pieces.length < 300) return [pieces];
  const cells = {};
  for (const p of pieces) {
    const lo = p.min || (p.quads && p.quads[0].v[0]) || [0, 0, 0], hi = p.max || lo;
    const k = Math.floor((lo[0] + hi[0]) / 2 / MOVER_CELL) + ',' + Math.floor((lo[2] + hi[2]) / 2 / MOVER_CELL);
    (cells[k] = cells[k] || []).push(p);
  }
  return Object.values(cells);
}
export function buildMergedMeshes(pc, device, pieces, atlas, sides) {
  const groups = {};
  // (M6.18.3) a piece marked unlit (the city far off) goes in a group of its own: drawn with no lamps on it
  // (M6.18.8) and a piece marked twoSided (the train's nose, seen from its own cab) in another
  for (const p of pieces) { const k = p.mat + (p.unlit ? '!' : '') + (p.twoSided ? '^' : ''); (groups[k] = groups[k] || []).push(p); }
  const out = {}, built = [];
  for (const [key, list] of Object.entries(groups)) {
    const mat = key.replace(/[!^]/g, '');
    const def = MATS[mat] || { scale: 2 };
    const pos = [], nrm = [], uv = [], col = [], idx = [], faces = [];
    for (const p of list) {
      // (M6.15.0, the casino) a free-form piece: its own faces, four corners
      // each, counter-clockwise seen from the front - curved walls, a ramp
      // (M6.16.0) a face may be a triangle; faces sharing a `sheet` (with `lm`,
      // where each corner really is, in metres) are one patch in the lightmap
      // (bake.js packLightmap); `tint` colours a piece (a chair's red leather)
      if (p.quads) {
        const sheets = new Map(), tint = p.tint || [1, 1, 1];
        for (const q of p.quads) {
          const base = pos.length / 3, n = q.n, nv = q.v.length;
          const top = Math.abs(n[1]) > 0.7;
          const right = [n[2], 0, -n[0]], rl = Math.hypot(right[0], right[2]) || 1;
          const tq = q.tint || tint;
          q.v.forEach((v, i) => {
            pos.push(v[0], v[1], v[2]); nrm.push(n[0], n[1], n[2]);
            if (q.uv) uv.push(q.uv[i][0] / def.scale, q.uv[i][1] / def.scale);
            else if (top) uv.push(v[0] / def.scale, v[2] / def.scale);
            else uv.push((v[0] * right[0] + v[2] * right[2]) / rl / def.scale, -v[1] / def.scale);
            let s = q.flat ? 1 : shadeAt(v[0], v[1], v[2], p);
            if (!q.flat && n[1] > 0.7) s = Math.min(1, s * 1.06 + 0.04);
            if (!q.flat && n[1] < -0.7) s *= 0.7;
            s = Math.min(1, s);
            col.push(Math.round(s * tq[0] * 255), Math.round(s * tq[1] * 255), Math.round(s * tq[2] * 255), 255);
          });
          const [a, b] = q.v, d = q.v[nv - 1];
          if (atlas) {
            if (q.lm) {
              const key = q.sheet === undefined ? '' : q.sheet;
              if (!sheets.has(key)) sheets.set(key, { verts: [], coords: [] });
              const sh = sheets.get(key);
              q.lm.forEach((c, i) => { sh.verts.push(base + i); sh.coords.push(c); });
            } else if (nv === 3) {
              // a lone triangle: its own patch, laid flat in its own plane
              const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l1 = Math.hypot(...e1) || 1, u = e1.map((x) => x / l1);
              const w2 = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
              const c = q.v[2], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
              faces.push({ verts: [base, base + 1, base + 2], coords: [[0, 0], [l1, 0], [e2[0] * u[0] + e2[1] * u[1] + e2[2] * u[2], e2[0] * w2[0] + e2[1] * w2[1] + e2[2] * w2[2]]] });
            } else faces.push([base, Math.min(BAKE.tile * 1.5, Math.max(0.05, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]))), Math.min(BAKE.tile * 1.5, Math.max(0.05, Math.hypot(d[0] - a[0], d[1] - a[1], d[2] - a[2])))]);
          }
          // wound to face its normal
          const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [q.v[2][0] - a[0], q.v[2][1] - a[1], q.v[2][2] - a[2]];
          const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
          // (M6.18.9) or, `inward`, to face away from it - seen from behind, lit as from the front (the nose's hood, from its cab)
          const fwd = (cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] >= 0) !== !!q.inward;
          if (nv === 3) idx.push(...(fwd ? [base, base + 1, base + 2] : [base, base + 2, base + 1]));
          else if (fwd) idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
          else idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
        }
        for (const sh of sheets.values()) faces.push(sh);
        continue;
      }
      const size = [p.max[0] - p.min[0], p.max[1] - p.min[1], p.max[2] - p.min[2]];
      for (const f of FACES) {
        const ax = f.n[0] ? 0 : f.n[1] ? 1 : 2;
        const fixed = f.n[ax] > 0 ? p.max[ax] : p.min[ax];
        const base = pos.length / 3;
        const corners = [[0, 0], [1, 0], [1, 1], [0, 1]];
        // Side faces: u runs left-to-right as seen from outside (right = up x normal),
        // v runs downward (texture row 0 is the top of the image).
        const side = f.n[1] === 0;
        const right = side ? [f.n[2], 0, -f.n[0]] : null;
        let uMin = Infinity, uMax = -Infinity;
        if (side) for (const [a, b] of corners) {
          const q = [0, 0, 0]; q[ax] = fixed; q[f.u] = p.min[f.u] + size[f.u] * a; q[f.v] = p.min[f.v] + size[f.v] * b;
          const d = q[0] * right[0] + q[2] * right[2]; uMin = Math.min(uMin, d); uMax = Math.max(uMax, d);
        }
        for (const [a, b] of corners) {
          const v = [0, 0, 0];
          v[ax] = fixed;
          v[f.u] = p.min[f.u] + size[f.u] * a;
          v[f.v] = p.min[f.v] + size[f.v] * b;
          // a sloping piece (M6.9.7): lifted along one axis, from 0 at its min end to dy at its max end
          if (p.slope) v[1] += ((v[p.slope.axis] - p.min[p.slope.axis]) / (size[p.slope.axis] || 1)) * p.slope.dy;
          pos.push(v[0], v[1], v[2]);
          nrm.push(f.n[0], f.n[1], f.n[2]);
          let uu, vv;
          if (side) {
            const d = v[0] * right[0] + v[2] * right[2];
            if (p.uv === 'fit') { uu = (d - uMin) / (uMax - uMin || 1); vv = 1 - (v[1] - p.min[1]) / (size[1] || 1); }
            else if (mat === 'facade') { uu = wrapU(p, f.n, v) ; vv = -v[1] / def.scale; }
            else { uu = d / def.scale; vv = -v[1] / def.scale; }
          } else if (p.uv === 'fit') { uu = a; vv = b; }
          else { uu = v[f.u] / def.scale; vv = v[f.v] / def.scale; }
          uv.push(uu, vv);
          let s = shadeAt(v[0], v[1], v[2], p);
          if (f.n[1] > 0) s = Math.min(1, s * 1.06 + 0.04);
          if (f.n[1] < 0) s *= 0.7;
          const c = Math.round(Math.min(1, s) * 255);
          if (p.tint) col.push(Math.round(c * p.tint[0]), Math.round(c * p.tint[1]), Math.round(c * p.tint[2]), 255); else col.push(c, c, c, 255);
        }
        // winding: counter-clockwise seen from outside. The corners run along
        // u then v, so the face points along cross(u, v); compare with the normal.
        if (atlas) faces.push([base, Math.min(BAKE.tile * 1.5, size[f.u]), Math.min(BAKE.tile * 1.5, size[f.v])]);
        const eu = [0, 0, 0], ev = [0, 0, 0]; eu[f.u] = 1; ev[f.v] = 1;
        const cr = [eu[1] * ev[2] - eu[2] * ev[1], eu[2] * ev[0] - eu[0] * ev[2], eu[0] * ev[1] - eu[1] * ev[0]];
        if (cr[0] * f.n[0] + cr[1] * f.n[1] + cr[2] * f.n[2] > 0) idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
        else idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
      }
    }
    built.push({ mat: key, pos, nrm, uv, col, idx, faces });
  }
  // atlas: one lightmap shared by every material in this lot (they become one
  // entity with several mesh instances), so the patches are packed together
  let uv1All = null, nv = 0;
  if (atlas) {
    const all = [];
    for (const b of built) {
      // (M6.16.0) a sheet's vertices are moved along with the rest
      for (const f of b.faces) all.push(Array.isArray(f) ? [f[0] + nv, f[1], f[2]] : { verts: f.verts.map((v) => v + nv), coords: f.coords });
      b.first = nv; nv += b.pos.length / 3;
    }
    const lm = packLightmap(all, nv);
    uv1All = lm.uv1;
    if (sides) sides._all = lm.side;
  }
  for (const b of built) {
    const n = b.pos.length / 3;
    const mesh = new pc.Mesh(device);
    mesh.setPositions(new Float32Array(b.pos));
    mesh.setNormals(new Float32Array(b.nrm));
    mesh.setUvs(0, new Float32Array(b.uv));
    if (atlas) mesh.setUvs(1, uv1All.slice(b.first * 2, (b.first + n) * 2));
    mesh.setColors32(new Uint8Array(b.col));
    mesh.setIndices(n > 65535 ? new Uint32Array(b.idx) : new Uint16Array(b.idx));
    mesh.update(pc.PRIMITIVE_TRIANGLES);
    out[b.mat] = mesh;
  }
  return out;
}

// A 16-pixel cube of the sky, for reflections: the faces in the engine's
// order (+x, -x, +y, -y, +z, -z), each texel coloured by how far up it looks.
export function skyColour(dirY, night) {
  const top = night ? [8, 12, 26] : [140, 163, 184], haze = night ? [48, 40, 38] : [199, 189, 168], dust = night ? [14, 14, 16] : [110, 100, 88];
  const t = Math.max(-1, Math.min(1, dirY));
  const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  return t >= 0 ? mix(haze, top, Math.pow(t, 0.6)) : mix(haze, dust, Math.min(1, -t * 3));
}
function makeSkyCube(pc, device, night) {
  const N = 16, faces = [];
  const dirOf = [
    (u, v) => [1, -v, -u], (u, v) => [-1, -v, u], (u, v) => [u, 1, v],
    (u, v) => [u, -1, -v], (u, v) => [u, -v, 1], (u, v) => [-u, -v, -1],
  ];
  for (let f = 0; f < 6; f++) {
    const px = new Uint8Array(N * N * 4);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const u = (i + 0.5) / N * 2 - 1, v = (j + 0.5) / N * 2 - 1;
      const d = dirOf[f](u, v), l = Math.hypot(d[0], d[1], d[2]);
      const col = skyColour(d[1] / l, night), k = (j * N + i) * 4;
      px[k] = col[0]; px[k + 1] = col[1]; px[k + 2] = col[2]; px[k + 3] = 255;
    }
    faces.push(px);
  }
  return new pc.Texture(device, { name: 'skyReflect', cubemap: true, width: N, height: N, format: pc.PIXELFORMAT_RGBA8, mipmaps: true, levels: [faces] });
}

export function buildScene(pc, app, level, settings) {
  const device = app.graphicsDevice;
  const tex = makeTextures(pc, device);
  const root = new pc.Entity('level');
  app.root.addChild(root);

  // Something for metal to reflect (M6.9.0, Rhys: a lamp post near-black
  // from every side). A metallic surface shows almost only reflection, and
  // with nothing set to reflect, its shaded side went black. A small cube of
  // the sky - blue above, the warm haze at the horizon, dust below - given to
  // every metallic material; the level's lighting is left exactly as it was.
  const night = !!level.night;                      // (M6.9.17) the hotel is at night
  const envCube = makeSkyCube(pc, device, night);
  const mats = {};
  const matFor = (name) => {
    // (M6.9.10, Rhys: the yellow 'rail' paint looked like sponge everywhere -
    // every rail is drawn in the plain metal instead)
    if (name === 'rail') return matFor('metal');
    if (mats[name]) return mats[name];
    // (M6.18.3) the same, lit by nothing but itself (the night city: no lamp reaches it; the frame rate)
    // (M6.18.8, Rhys: "the train's nose is invisible from inside the train's cab") drawn from both sides:
    // the cab sits inside the nose's own shell, and saw only its backs (culled) - so, nothing
    if (name.endsWith('^')) {
      const m = matFor(name.slice(0, -1)).clone();
      m.cull = pc.CULLFACE_NONE; m.twoSidedLighting = true;
      m.update();
      return (mats[name] = m);
    }
    // the windscreen's tinted glass: dark from outside, seen through from inside
    if (name === 'tintglass') {
      const m = new pc.StandardMaterial();
      m.diffuse = new pc.Color(0.03, 0.05, 0.08); m.opacity = 0.62; m.blendType = pc.BLEND_NORMAL; m.depthWrite = false;
      m.cull = pc.CULLFACE_NONE; m.useMetalness = true; m.metalness = 0.3; m.gloss = 0.9; m.diffuseVertexColor = false;
      m.update();
      return (mats[name] = m);
    }
    if (name.endsWith('!')) {
      const m = matFor(name.slice(0, -1)).clone();
      m.useLighting = false; m.useSkybox = false; m.cubeMap = null;
      // (unlit, only the emissive shows: the windows glow, the walls are night-dark)
      m.update();
      return (mats[name] = m);
    }
    const def = MATS[name] || { gloss: 0.3, metal: 0 };
    const m = new pc.StandardMaterial();
    m.diffuseMap = tex[name] || null;
    m.diffuseVertexColor = true;
    m.useMetalness = true;
    m.metalness = def.metal;
    m.gloss = def.gloss;
    if (def.metal > 0) { m.cubeMap = envCube; m.reflectivity = 1; }
    // at night the buildings opposite: dark walls, their lit windows glowing
    // the power is off (M6.9.19): light fittings hang dark
    // (M6.13.0) a paper catches what light there is: faintly pale, findable in the dark
    if (name === 'paper') { m.emissive = new pc.Color(0.16, 0.15, 0.12); }
    // (M6.16.0) glowing in its own colour (the vertex colour carries the tint)
    if (name === 'neon') { m.diffuseMap = null; m.diffuse = new pc.Color(0.05, 0.05, 0.05); m.emissive = new pc.Color(1, 1, 1); m.emissiveVertexColor = true; m.emissiveIntensity = 2.2; }
    if (/^slotface\d?$/.test(name) && tex[name]) { m.emissiveMap = tex[name]; m.emissive = new pc.Color(1, 1, 1); m.emissiveIntensity = 1.1; }
    if (name === 'facade' && night && tex.facade_night) {
      m.diffuseMap = tex.facade_night;
      m.emissiveMap = tex.facade_glow; m.emissive = new pc.Color(1, 1, 1); m.emissiveIntensity = 1.4;
    }
    m.update();
    mats[name] = m;
    return m;
  };

  // doors are drawn separately: an open door has to be invisible, and merged
  // static geometry cannot be taken apart afterwards
  const doorTag = (p) => (p.tag && /^w?door\d/.test(p.tag) ? p.tag.replace('_trim', '') : null);
  const doorPieces = level.pieces.filter((p) => doorTag(p));
  // (M6.17.10, Rhys: "Locket and ledger need to disappear once they're
  // acquired") so are the things you can take: one entity each, hidden once taken
  const propPieces = level.pieces.filter((p) => p.prop && !doorTag(p));
  const staticPieces = level.pieces.filter((p) => !doorTag(p) && !p.prop);
  const doorEntities = {};
  // these two need making before the meshes, or they are built with a default
  const lampMat = mats.lamp = new pc.StandardMaterial();
  lampMat.emissive = new pc.Color(1, 0.97, 0.9); lampMat.emissiveIntensity = 3;
  lampMat.diffuse = new pc.Color(0.05, 0.05, 0.05);
  // the power is off (M6.9.19): the light fittings hang dark
  if (level.powerOut) { lampMat.emissive = new pc.Color(0.06, 0.06, 0.06); lampMat.emissiveIntensity = 1; lampMat.diffuse = new pc.Color(0.55, 0.55, 0.55); }
  lampMat.update();
  const glassMat = mats.glass = new pc.StandardMaterial();
  glassMat.diffuse = new pc.Color(0.55, 0.72, 0.78); glassMat.opacity = 0.22;
  glassMat.blendType = pc.BLEND_NORMAL; glassMat.depthWrite = false;
  glassMat.cull = pc.CULLFACE_NONE;
  glassMat.useMetalness = true; glassMat.metalness = 0.4; glassMat.gloss = 0.92; glassMat.update();
  // (M6.19.7, Rhys: "no way for a player to tell if glass is normal, resistant, toughened, or totally
  // bulletproof") each kind looks its kind: ordinary clear and pale; toughened greener and a little cloudier;
  // bulletproof thick, deep green at its edges, more mirror than window
  for (const [name, col, op, metal] of [['glassT', [0.45, 0.72, 0.6], 0.34, 0.5], ['glassB', [0.3, 0.5, 0.36], 0.52, 0.7]]) {
    const g = mats[name] = new pc.StandardMaterial();
    g.diffuse = new pc.Color(col[0], col[1], col[2]); g.opacity = op; g.blendType = pc.BLEND_NORMAL; g.depthWrite = false; g.cull = pc.CULLFACE_NONE;
    g.useMetalness = true; g.metalness = metal; g.gloss = 0.95; g.update();
  }

  const bake = !!level.bake;
  const lightmapped = [];
  // a level may ask for coarser lightmaps (Yard 7: plain blockwork, a big place, a long bake)
  const lmOpts = { density: level.bakeDensity || BAKE.density, maxRes: level.bakeMaxRes || BAKE.maxRes };
  const addMeshes = (list, lm, label) => {
    const sides = {};
    const meshes = buildMergedMeshes(pc, device, list, lm, sides);
    const one = (name, mis, mult) => {
      const e = new pc.Entity('mesh_' + name + (label ? '_' + label : ''));
      e.addComponent('render', { meshInstances: mis, castShadows: true, receiveShadows: true, lightmapped: lm, lightmapSizeMultiplier: mult });
      for (const mi of e.render.meshInstances) if (mi._frMat === 'hazard' || mi._frMat === 'lamp') mi.castShadow = false;
      root.addChild(e);
      if (lm) lightmapped.push(e);
    };
    const mis = Object.entries(meshes).map(([name, mesh]) => { const mi = new pc.MeshInstance(mesh, matFor(name)); mi._frMat = name; return mi; });
    if (lm) {
      // one entity (one lightmap) per chunk, asking for BAKE.density pixels a
      // metre: the engine sizes it from the bounds; bake.js works it backwards
      const box = new pc.BoundingBox(); box.copy(mis[0].mesh.aabb);
      for (const mi of mis) box.add(mi.mesh.aabb);
      const h = box.halfExtents;
      one('chunk', mis, lightmapMultiplier([h.x, h.y, h.z], sides._all, lmOpts));
    } else for (const mi of mis) one(mi._frMat, [mi], 1);
  };
  if (bake) {
    // baked: cut into chunks (see src/sim/bake.js for why), the rest live
    const plan = planChunks(staticPieces, { region: level.bakeRegion, cell: level.bakeCell, below: level.bakeBelow });
    const byCell = new Map();   // every material in a cell shares one lightmap
    for (const c of plan.chunks) {
      const cellKey = c.key.split(':')[0];
      if (!byCell.has(cellKey)) byCell.set(cellKey, []);
      byCell.get(cellKey).push(...c.pieces);
    }
    for (const [cellKey, list] of byCell) addMeshes(list, true, cellKey);
    addMeshes(plan.live, false);
  } else addMeshes(staticPieces, false);

  // one entity per door
  const byTag = {};
  for (const p of doorPieces) (byTag[doorTag(p)] = byTag[doorTag(p)] || []).push(p);
  for (const [tag, list] of Object.entries(byTag)) {
    const e = new pc.Entity('door_' + tag);
    const dm = buildMergedMeshes(pc, device, list);
    for (const [name, mesh] of Object.entries(dm)) {
      e.addChild(Object.assign(new pc.Entity(), {}));
      const child = e.children[e.children.length - 1];
      child.addComponent('render', { meshInstances: [new pc.MeshInstance(mesh, matFor(name))], castShadows: true, receiveShadows: true });
    }
    root.addChild(e);
    doorEntities[tag] = e;
  }

  const propEntities = {};
  const byProp = {};
  for (const p of propPieces) (byProp[p.prop] = byProp[p.prop] || []).push(p);
  for (const [name, list] of Object.entries(byProp)) {
    const e = new pc.Entity('prop_' + name);
    for (const [mname, mesh] of Object.entries(buildMergedMeshes(pc, device, list))) {
      const child = new pc.Entity();
      child.addComponent('render', { meshInstances: [new pc.MeshInstance(mesh, matFor(mname))], castShadows: false, receiveShadows: true });
      e.addChild(child);
    }
    root.addChild(e);
    propEntities[name] = e;
  }

  // ordinary doors: a leaf on a pivot at the hinge, turned as it swings.
  // Modelled with local +z running from the hinge to the latch edge.
  const swingDoors = [];
  for (const d of level.swingDoors || []) {
    const pivot = new pc.Entity('swingdoor');
    const w = d.width - 0.03, h = d.def.h, t = d.def.thick / 2;
    // (M6.12.3, Rhys: "I can see straight through the gaps around/between
    // closed doors") the leaf is drawn out to the frame: its hinge edge into
    // the jamb, its latch edge to the jamb or to the middle of a pair, its
    // top to the lintel. Only the picture - the solid keeps its clearance.
    const seal = d.def.seal || null;
    const z0 = seal ? -seal[0] : 0.01, z1 = seal ? d.width + seal[1] : w, hh = seal ? h + seal[2] : h;
    const pieces = [
      // each door in its own material: wood (painted panels), metal (the secure room), glass (the front)
      { min: [-t, 0, z0], max: [t, hh, z1], mat: d.def.mat || 'door', uv: (d.def.mat || 'door') === 'door' ? 'fit' : 'world' },
      // a handle on each face, near the latch edge
      { min: [-t - 0.06, 0.98, w - 0.16], max: [-t, 1.03, w - 0.06], mat: 'metal' },
      { min: [t, 0.98, w - 0.16], max: [t + 0.06, 1.03, w - 0.06], mat: 'metal' },
    ];
    // the first leaf of a pair carries a strip over the join, on both faces
    if (seal && seal[3]) for (const sg of [-1, 1]) {
      pieces.push({ min: [sg < 0 ? -t - 0.012 : t, 0, z1 - 0.025], max: [sg < 0 ? -t : t + 0.012, hh, z1 + 0.025], mat: d.def.mat || 'door', uv: 'world' });
    }
    for (const [name, mesh] of Object.entries(buildMergedMeshes(pc, device, pieces))) {
      const child = new pc.Entity();
      child.addComponent('render', { meshInstances: [new pc.MeshInstance(mesh, matFor(name))], castShadows: true, receiveShadows: true });
      pivot.addChild(child);
    }
    const hg = d.hinge();
    pivot.setPosition(hg[0], hg[1], hg[2]);
    root.addChild(pivot);
    swingDoors.push({ door: d, pivot });
  }

  // things that move as a whole (M6.9.8: the hotel's lift car and its doors):
  // built once, in their own coordinates, and moved to where at() says
  const movers = [];
  for (const m of level.movers || []) {
    const e = new pc.Entity('mover_' + m.id);
    // (M6.18.3) a big one (the station and its city) in pieces by place, so what is out of sight is not drawn
    for (const part of moverChunks(m.pieces)) for (const [name, mesh] of Object.entries(buildMergedMeshes(pc, device, part))) {
      const child = new pc.Entity();
      child.addComponent('render', { meshInstances: [new pc.MeshInstance(mesh, matFor(name))], castShadows: false, receiveShadows: true });
      e.addChild(child);
    }
    const a = m.at();
    e.setPosition(a[0], a[1], a[2]);
    root.addChild(e);
    movers.push({ m, e });
  }

  // signs: a textured panel with a dark back
  const signHolders = [];

  level.signs.forEach((s, i) => {
    const holder = new pc.Entity('sign' + i);
    holder.setPosition(s.pos[0], s.pos[1] + s.h / 2, s.pos[2]);
    holder.setEulerAngles(0, s.yaw * 180 / Math.PI, 0);
    root.addChild(holder);
    const sh = { e: holder, pos: s.pos.slice(), home: s.pos.slice(), h: s.h, follow: s.follow || null };
    signHolders.push(sh);
    const m = new pc.StandardMaterial();
    // (M6.18.3) a dot-matrix board: drawn again whenever what it shows changes (s.board())
    let t;
    if (s.board) { const mx = makeMatrixSign(pc, device, s); t = mx.t; sh.board = s.board; sh.draw = mx.draw; sh.shown = ''; }
    else t = makeSignTexture(pc, device, s);
    m.diffuseMap = t; m.emissiveMap = t; m.emissive = new pc.Color(s.board ? 1.6 : 0.35, s.board ? 1.6 : 0.35, s.board ? 1.6 : 0.35);
    // (M6.18.11, Rhys: Belyagorsk's signs "printed backwards") readable from both sides - each side its own
    // face, the right way round (one face drawn two-sided showed its back mirrored)
    m.gloss = 0.2; m.cull = pc.CULLFACE_BACK;
    m.update();
    for (const turn of [0, 180]) {
      const side = new pc.Entity();
      side.setLocalEulerAngles(0, turn, 0);
      const face = new pc.Entity();
      face.addComponent('render', { type: 'plane', material: m, castShadows: false });
      face.setLocalEulerAngles(90, 0, 0);
      face.setLocalScale(s.w, 1, s.h);
      side.addChild(face);
      holder.addChild(side);
    }
  });

  // Indoor lights. The level's geometry is merged into a few map-wide meshes,
  // so every enabled light touches every mesh: only the handful nearest the
  // camera are switched on, which is all you can see anyway.
  const lampEntities = [];
  // ?lamps=live (M6.9.27): lamps not baked, but lighting the baked level live
  // instead - the comparison for GPUs whose bake leaves the lamps out
  const lampsLive = typeof location !== 'undefined' && /[?&]lamps=live\b/.test(location.search);
  for (const l of level.lights || []) {
    const e = new pc.Entity('light');
    e.addComponent('light', {
      type: 'omni', color: new pc.Color(...(l.color || [1, 0.96, 0.9])),
      intensity: l.intensity === undefined ? 0.8 : l.intensity,
      range: l.range || 14, castShadows: false,
      // baked: painted into the level once; still lights people as they pass
      bake: bake && !lampsLive, affectDynamic: true, affectLightmapped: bake && lampsLive,
    });
    e.setPosition(l.pos[0], l.pos[1], l.pos[2]);
    e.enabled = false;
    root.addChild(e);
    lampEntities.push({ e, pos: l.pos.slice(), home: l.pos.slice(), range: l.range || 14, follow: l.follow || null });
  }
  // bounce light, faked (bake.js bounceFill): baked only, removed after the bake
  const fillEntities = [];
  // level.bakeFill: 'shadow' (fills cast shadows: no light through walls, a
  // slower bake), 'soft' (no shadows, shorter reach) or 'none'
  const fillMode = level.bakeFill || 'soft';
  const fillOpts = fillMode === 'soft' ? { share: 0.45, reach: 0.6 } : {};
  if (bake && fillMode !== 'none') for (const f of bounceFill(level.lights || [], fillOpts)) {
    const e = new pc.Entity('fill');
    e.addComponent('light', {
      type: 'omni', color: new pc.Color(...f.color), intensity: f.intensity, range: f.range,
      castShadows: fillMode === 'shadow', bake: true, affectDynamic: false,
    });
    e.setPosition(f.pos[0], f.pos[1], f.pos[2]);
    e.enabled = false;
    root.addChild(e);
    fillEntities.push(e);
  }

  // lamps: glowing heads on the posts
  const postMat = new pc.StandardMaterial();
  postMat.emissive = new pc.Color(1, 0.93, 0.75); postMat.emissiveIntensity = 2; postMat.diffuse = new pc.Color(0.1, 0.1, 0.1); postMat.update();
  for (const l of level.lamps) {
    const e = new pc.Entity();
    e.addComponent('render', { type: 'box', material: postMat, castShadows: false });
    e.setPosition(l.pos[0], l.pos[1], l.pos[2]);
    e.setLocalScale(0.9, 0.25, 0.5);
    root.addChild(e);
  }

  // water surfaces
  const waterMat = new pc.StandardMaterial();
  waterMat.diffuseMap = tex.water;
  waterMat.diffuse = new pc.Color(0.6, 0.85, 0.95);
  waterMat.emissive = new pc.Color(0.04, 0.12, 0.16);
  waterMat.opacity = 0.72;
  waterMat.blendType = pc.BLEND_NORMAL;
  waterMat.depthWrite = false;
  waterMat.cull = pc.CULLFACE_NONE;
  waterMat.useMetalness = true; waterMat.metalness = 0.1; waterMat.gloss = 0.9;
  waterMat.diffuseMapTiling = new pc.Vec2(4, 3);
  waterMat.update();
  // (M6.9.25) the sewer's water: murkier, and running - each surface its own
  // material, so the texture keeps its size and moves along the flow
  const flowing = [];
  const sewerWaterMat = (w) => {
    const m = new pc.StandardMaterial();
    m.diffuseMap = tex.water;
    m.diffuse = new pc.Color(0.34, 0.36, 0.24);
    m.emissive = new pc.Color(0.012, 0.014, 0.008);
    m.opacity = 0.9; m.blendType = pc.BLEND_NORMAL; m.depthWrite = false; m.cull = pc.CULLFACE_NONE;
    m.useMetalness = true; m.metalness = 0.1; m.gloss = 0.75;
    m.diffuseMapTiling = new pc.Vec2(Math.max(1, (w.x1 - w.x0) / 2.5), Math.max(1, (w.z1 - w.z0) / 2.5));
    m.update();
    flowing.push({ m, flow: w.flow, tiles: [(w.x1 - w.x0) / 2.5, (w.z1 - w.z0) / 2.5] });
    return m;
  };
  const waters = [];
  for (const w of level.water) {
    // (M6.16.0) a pool of any shape: its outline, as one flat mesh
    if (w.poly) {
      const tris = flatPoly(w.poly, null, w.y, true), P = [], U = [], N = [], I = [];
      for (const t of tris) for (const v of t.v) { I.push(P.length / 3); P.push(v[0], v[1], v[2]); N.push(0, 1, 0); U.push(v[0] / 4, v[2] / 4); }
      const mesh = new pc.Mesh(device);
      mesh.setPositions(new Float32Array(P)); mesh.setNormals(new Float32Array(N)); mesh.setUvs(0, new Float32Array(U)); mesh.setIndices(new Uint16Array(I));
      mesh.update(pc.PRIMITIVE_TRIANGLES);
      const m = waterMat.clone(); m.diffuseMapTiling = new pc.Vec2(1, 1); m.update();
      const e = new pc.Entity('water');
      e.addComponent('render', { meshInstances: [new pc.MeshInstance(mesh, m)], castShadows: false });
      root.addChild(e);
      continue;
    }
    const e = new pc.Entity('water');
    e.addComponent('render', { type: 'plane', material: w.sewer ? sewerWaterMat(w) : waterMat, castShadows: false });
    e.setPosition((w.x0 + w.x1) / 2, w.y, (w.z0 + w.z1) / 2);
    e.setLocalScale(w.x1 - w.x0, 1, w.z1 - w.z0);
    root.addChild(e);
    waters.push(e);
  }

  // sky dome, following the camera
  const skyMat = new pc.StandardMaterial();
  skyMat.useLighting = false; skyMat.useFog = false; skyMat.useSkybox = false;
  skyMat.emissiveVertexColor = true; skyMat.emissive = new pc.Color(1, 1, 1);
  skyMat.diffuse = new pc.Color(0, 0, 0);
  skyMat.cull = pc.CULLFACE_NONE;
  skyMat.depthWrite = false;
  skyMat.update();
  const sky = new pc.Entity('sky');
  sky.addComponent('render', { meshInstances: [new pc.MeshInstance(skyDome(pc, device, night), skyMat)], castShadows: false, receiveShadows: false });
  sky.setLocalScale(700, 700, 700);
  app.root.addChild(sky);

  // light and atmosphere
  const sun = new pc.Entity('sun');
  sun.addComponent('light', {
    type: 'directional', color: new pc.Color(1.0, 0.95, 0.86), intensity: 1.35,
    castShadows: !level.noSunShadow, shadowDistance: 70, shadowResolution: 2048, numCascades: 2,
    shadowBias: 0.25, normalOffsetBias: 0.06, shadowType: pc.SHADOW_PCF3_32F,
    bake: bake, affectDynamic: true,          // baked into the level; people still lit live
  });
  sun.setEulerAngles(52, 35, 0);
  app.root.addChild(sun);
  app.scene.ambientLight = new pc.Color(0.40, 0.43, 0.50);
  app.scene.fog.type = pc.FOG_LINEAR;
  app.scene.fog.color = new pc.Color(0.78, 0.74, 0.66);
  // far enough to keep the ridges and mesas visible, with a warm desert haze
  app.scene.fog.start = 120;
  app.scene.fog.end = 850;
  if (night) {
    // the moon for a sun: faint and blue; a dark blue ambient; the town's lamps
    // and windows do the rest
    sun.light.color = new pc.Color(0.55, 0.64, 0.9); sun.light.intensity = 0.32;
    sun.setEulerAngles(58, 210, 0);
    app.scene.ambientLight = level.draft ? new pc.Color(0.24, 0.25, 0.32) : new pc.Color(0.15, 0.16, 0.22);      // (M6.19.6: the drafts' nights were too dark to play)
    app.scene.fog.color = new pc.Color(0.06, 0.065, 0.09);
    app.scene.fog.start = 50; app.scene.fog.end = 380;
    waterMat.emissive = new pc.Color(0.01, 0.025, 0.04); waterMat.diffuse = new pc.Color(0.3, 0.42, 0.5); waterMat.update();
  }
  // (M6.20.3) a level's own air: { fog: [r, g, b, start, end], ambient: [r, g, b], sun: [r, g, b, intensity, pitch, yaw] }
  // - the dust over a ruined city, the haze of a wasteland
  if (level.atmos) {
    const a = level.atmos;
    if (a.fog) { app.scene.fog.color = new pc.Color(a.fog[0], a.fog[1], a.fog[2]); app.scene.fog.start = a.fog[3]; app.scene.fog.end = a.fog[4]; }
    if (a.sky) { skyMat.emissive = new pc.Color(a.sky[0], a.sky[1], a.sky[2]); skyMat.update(); }        // (the sky's colours, tinted)
    if (a.water) { waterMat.diffuse = new pc.Color(a.water[0], a.water[1], a.water[2]); waterMat.emissive = new pc.Color(a.water[3] || 0, a.water[4] || 0, a.water[5] || 0); waterMat.update(); }     // (a lit pool, at night)
    if (a.ambient) app.scene.ambientLight = new pc.Color(a.ambient[0], a.ambient[1], a.ambient[2]);
    if (a.sun) { sun.light.color = new pc.Color(a.sun[0], a.sun[1], a.sun[2]); if (a.sun[3] !== undefined) sun.light.intensity = a.sun[3]; if (a.sun[4] !== undefined) sun.setEulerAngles(a.sun[4], a.sun[5] || 35, 0); }
  }

  const view = {
    root, sky, sun, waters, waterMat, tex, doorEntities, swingDoors, propEntities,
    // a thing taken (the locket, the ledger) is no longer there
    tickProps() { for (const [name, e] of Object.entries(propEntities)) { const gone = !!(level[name] && (level[name].taken || level[name].hidden)); if (e.enabled === gone) e.enabled = !gone; } },
    // turn each door's leaf to where its swing has got to
    // (a door blown off its hinges is gone)
    tickSwingDoors() {
      for (const s of swingDoors) {
        if (s.pivot.enabled === !!s.door.blown) s.pivot.enabled = !s.door.blown;
        if (!s.door.blown) s.pivot.setEulerAngles(0, s.door.yaw() * 180 / Math.PI, 0);
      }
    },
    tickMovers() {
      for (const o of movers) { const a = o.m.at(); o.e.setPosition(a[0], a[1], a[2]); if (o.m.yaw) o.e.setLocalEulerAngles(0, o.m.yaw(), 0); }   // (M6.9.21: and turn - the helicopter's rotor)
      // (M6.18.0) signs and lights that go with something moving (the train's station, sliding away): follow() gives their offset
      for (const s of signHolders) if (s.board) { const rows = s.board(), key = JSON.stringify(rows); if (key !== s.shown) { s.shown = key; s.draw(rows); } }
      for (const s of signHolders) if (s.follow) { const o = s.follow(); for (let k = 0; k < 3; k++) s.pos[k] = s.home[k] + o[k]; s.e.setPosition(s.pos[0], s.pos[1] + s.h / 2, s.pos[2]); }
      for (const l of lampEntities) if (l.follow) { const o = l.follow(); for (let k = 0; k < 3; k++) l.pos[k] = l.home[k] + o[k]; l.e.setPosition(l.pos[0], l.pos[1], l.pos[2]); }
    },
    showDoor(tag, open) { const e = doorEntities[tag]; if (e) e.enabled = !open; },
    fogAir: { color: app.scene.fog.color.clone(), start: app.scene.fog.start, end: app.scene.fog.end },
    fogWater: { color: new pc.Color(0.10, 0.32, 0.40), start: 0, end: 16 },
    underwater: false,
    lamps: lampEntities, signs: signHolders,
    // signs far away are unreadable anyway
    tickSigns(camPos) {
      for (const s of signHolders) {
        const d = Math.hypot(s.pos[0] - camPos.x, s.pos[2] - camPos.z);
        const on = d < 70;
        if (s.e.enabled !== on) s.e.enabled = on;
      }
    },
    lampBudget: level.lampCap ? Math.min(8, level.lampCap) : 8,
    // switch on the nearest few, off with the rest
    // Baked lighting (Rhys: the original Battlefront look - and the cure for
    // indoor frame rate). Every light is worked out once, shadows and all,
    // and painted into the level; afterwards lights only touch moving people.
    // Returns { ok, ms }; on any failure the level goes back to live light.
    bakeLighting() {
      if (!bake || !app.lightmapper) return { ok: false, ms: 0 };
      const t0 = performance.now();
      let ok = true;
      // ?lmhdr=1: bake into a floating-point lightmap instead of RGBM (M6.9.26 -
      // a diagnostic for the Chromebook, where baked lamps come out dark)
      if (/[?&]lmhdr=1\b/.test(typeof location !== 'undefined' ? location.search : '')) app.scene.lightmapHDR = true;
      app.scene.lightmapMaxResolution = lmOpts.maxRes;
      app.scene.lightmapSizeMultiplier = BAKE.sizeMult;
      const dbg = typeof location !== 'undefined' ? location.search : '';
      const lampShadows = !/[?&]lampshadow=0\b/.test(dbg);
      // (M6.9.26) a normal offset on the lamps' shadows. Without it every
      // surface the light met at a slant shadowed itself (shadow acne), so the
      // baked lamps lit only a small pool under themselves - walls beside a
      // lamp, and floors past a couple of metres, stayed dark (found with a
      // test scene: baked matched live exactly without shadows; with shadows
      // it fell to 60% at 3 m; this offset brings it back, real shadows kept)
      for (const l of lampEntities) {
        l.e.enabled = true; l.e.light.castShadows = lampShadows; l.e.light.shadowResolution = 256;
        l.e.light.shadowBias = BAKE.lampShadowBias; l.e.light.normalOffsetBias = /[?&]lampnob=0\b/.test(dbg) ? 0 : BAKE.lampNormalOffset;   // ?lampnob=0: the old way, to compare
      }
      for (const e of fillEntities) e.enabled = true;
      // smooth the speckle out of the baked shadows (the engine's own filter)
      app.scene.lightmapFilterEnabled = level.bakeFilter !== false;
      app.scene.lightmapFilterRange = 8;
      app.scene.lightmapFilterSmoothness = 0.25;
      try {
        app.lightmapper.bake(lightmapped, pc.BAKE_COLOR);
      } catch (err) {
        ok = false;
        console.warn('Baking the light failed; using live light', err);
        for (const e of lightmapped) e.render.lightmapped = false;
        for (const l of lampEntities) l.e.light.bake = false;
        sun.light.bake = false;
      }
      for (const l of lampEntities) { l.e.light.castShadows = false; l.e.enabled = false; }
      for (const e of fillEntities) e.destroy();
      fillEntities.length = 0;
      this.lightT = 1;
      return { ok, ms: Math.round(performance.now() - t0), meshes: lightmapped.length };
    },
    tickLights(camPos) {
      const near = [];
      for (const l of lampEntities) {
        const d = Math.hypot(l.pos[0] - camPos.x, l.pos[1] - camPos.y, l.pos[2] - camPos.z);
        if (d < l.range + 12) near.push([d, l]);
      }
      near.sort((a, b) => a[0] - b[0]);
      const want = new Set(near.slice(0, this.lampBudget).map((n) => n[1]));
      for (const l of lampEntities) {
        const on = want.has(l);
        if (l.e.enabled !== on) l.e.enabled = on;
      }
    },
    applyQuality(q) {
      const lc = sun.light;
      this.lampBudget = q === 'high' ? 10 : q === 'medium' ? 7 : 4;
      // (M6.18.3) a level lit live, not baked (the Night Train), may ask for fewer: each lamp costs every pixel
      if (level.lampCap) this.lampBudget = Math.min(this.lampBudget, level.lampCap);
      // (M6.18.5) a night level lit live (the Night Train): the moon's shadows cost every frame two more
      // drawings of the whole level, for shadows nobody can see under the station's roof
      lc.castShadows = q !== 'low' && !level.noSunShadow;
      lc.shadowResolution = q === 'high' ? 2048 : 1024;
      lc.numCascades = q === 'high' ? 2 : 1;
      app.graphicsDevice.maxPixelRatio = q === 'high' ? Math.min(window.devicePixelRatio || 1, 1.5) : q === 'medium' ? 1 : 0.75;
      // (M6.18.6) how far a struggling frame rate may bring it down (main.js ResScaler)
      this.ratioCap = app.graphicsDevice.maxPixelRatio; this.ratioFloor = q === 'low' ? 0.75 : Math.min(this.ratioCap, 0.8);
    },
    setUnderwater(on) {
      if (on === this.underwater) return;
      this.underwater = on;
      // from below, the surface caught the sun as one bright spot (M6.9.1)
      waterMat.gloss = on ? 0.1 : 0.9; waterMat.update();
      const f = on ? this.fogWater : this.fogAir;
      app.scene.fog.color = f.color; app.scene.fog.start = f.start; app.scene.fog.end = f.end;
    },
    tick(dt, t, camPos) {
      this.lightT = (this.lightT || 0) + dt;
      if (this.lightT > 0.2) { this.lightT = 0; this.tickLights(camPos); this.tickSigns(camPos); }
      waterMat.diffuseMapOffset = new pc.Vec2((t * 0.02) % 1, (t * 0.013) % 1);
      waterMat.update();
      // the sewer runs south at about 0.4 m/s: the texture moves with it
      for (const f of flowing) {
        f.m.diffuseMapOffset = new pc.Vec2((-t * 0.4 / 2.5 * f.flow[0]) % 1, (-t * 0.4 / 2.5 * f.flow[1]) % 1);
        f.m.update();
      }
      sky.setPosition(camPos.x, camPos.y, camPos.z);
    },
  };
  view.applyQuality(settings.quality);
  return view;
}

// A dome whose texture runs top-to-bottom with height (v) and round the
// horizon (u), so the sky gradient lines up with the world.
// the night sky (M6.9.17, Rhys: the hotel at 22:47 should look it): deep blue
// overhead, a sodium-orange glow of town along the horizon
// (M6.16.1, Rhys: "Sky looks bright for nearing midnight") darker overhead,
// the town's glow kept low along the horizon
export const NIGHT_SKY = [[-1, [6, 7, 9]], [-0.02, [14, 14, 17]], [0, [40, 32, 28]], [0.05, [20, 20, 28]], [0.25, [6, 8, 15]], [1, [2, 3, 7]]];
const DAY_SKY = [[-1, [92, 98, 96]], [-0.02, [120, 128, 126]], [0, [196, 206, 212]], [0.08, [168, 192, 212]], [0.35, [104, 146, 186]], [1, [52, 94, 146]]];
function skyDome(pc, device, night) {
  const LON = 48, LAT = 32, pos = [], col = [], idx = [];
  // colour by height above the horizon (sin of elevation), -1..1
  const stops = night ? NIGHT_SKY : DAY_SKY;
  const colourAt = (h) => {
    for (let k = 1; k < stops.length; k++) {
      if (h <= stops[k][0]) {
        const [h0, c0] = stops[k - 1], [h1, c1] = stops[k];
        const t = (h - h0) / (h1 - h0);
        return c0.map((c, i) => Math.round(c + (c1[i] - c) * t));
      }
    }
    return stops[stops.length - 1][1];
  };
  for (let j = 0; j <= LAT; j++) {
    const el = Math.PI / 2 - (j / LAT) * Math.PI;        // +90 (up) to -90 (down)
    for (let i = 0; i <= LON; i++) {
      const az = (i / LON) * Math.PI * 2;
      pos.push(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
      const c = colourAt(Math.sin(el));
      col.push(c[0], c[1], c[2], 255);
    }
  }
  for (let j = 0; j < LAT; j++) for (let i = 0; i < LON; i++) {
    const a = j * (LON + 1) + i, b = a + LON + 1;
    idx.push(a, a + 1, b, a + 1, b + 1, b);
  }
  const mesh = new pc.Mesh(device);
  mesh.setPositions(new Float32Array(pos));
  mesh.setColors32(new Uint8Array(col));
  mesh.setIndices(new Uint16Array(idx));
  mesh.update(pc.PRIMITIVE_TRIANGLES);
  return mesh;
}

// A stand-in operative for third-person view: boxes, Ghost colours.
export function buildOperative(pc, app) {
  const e = new pc.Entity('operative');
  const mk = (col) => { const m = new pc.StandardMaterial(); m.diffuse = new pc.Color(...col); m.gloss = 0.3; m.update(); return m; };
  const suit = mk([0.18, 0.22, 0.26]), vest = mk([0.28, 0.32, 0.26]), skin = mk([0.55, 0.43, 0.34]), dark = mk([0.08, 0.08, 0.09]);
  const part = (name, mat, px, py, pz, sx, sy, sz) => {
    const p = new pc.Entity(name);
    p.addComponent('render', { type: 'box', material: mat });
    p.setLocalPosition(px, py, pz); p.setLocalScale(sx, sy, sz);
    e.addChild(p); return p;
  };
  const parts = {
    legL: part('legL', suit, -0.12, 0.45, 0, 0.18, 0.9, 0.2),
    legR: part('legR', suit, 0.12, 0.45, 0, 0.18, 0.9, 0.2),
    torso: part('torso', vest, 0, 1.2, 0, 0.5, 0.62, 0.3),
    armL: part('armL', suit, -0.33, 1.18, 0, 0.14, 0.6, 0.16),
    armR: part('armR', suit, 0.33, 1.18, 0, 0.14, 0.6, 0.16),
    head: part('head', skin, 0, 1.64, 0, 0.24, 0.26, 0.26),
    visor: part('visor', dark, 0, 1.66, -0.13, 0.22, 0.08, 0.02),
  };
  e.parts = parts;
  app.root.addChild(e);
  return e;
}
