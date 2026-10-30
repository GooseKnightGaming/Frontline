// FRONTLINE - planning the light bake (pure logic, no engine: tested in node).
//
// The lightmapper gives every mesh one lightmap, sized from how big the mesh
// is. With one mesh per material for the whole map (M6.6.0), Meridian House's
// plaster got a single 256-pixel lightmap - about four pixels a metre, which
// is where the blotches came from. So a baked level is cut into square
// chunks, each chunk's material its own mesh, and each mesh asks for a
// lightmap big enough for a set number of pixels per metre. Chunks also mean
// a lamp only has to be baked into the few meshes near it.

export const BAKE = {
  // the lamps' shadows in the bake (M6.9.26): without the normal offset,
  // slanting surfaces shadow themselves and the baked lamps light only a pool
  lampShadowBias: 0.05, lampNormalOffset: 0.05,
  cell: 24,          // chunk size, metres
  tile: 12,          // big faces are cut to this, so a yard floor is not one smeared patch
  density: 8,        // lightmap pixels per metre
  pad: 0.35,         // gap round each face in the lightmap, metres (about 3 px)
  maxRes: 1024,      // the largest lightmap one mesh may have
  sizeMult: 10,      // the engine's scene.lightmapSizeMultiplier (render.js sets the same)
};

// Cut a box into tiles no bigger than `size` along x and z. Only the drawing
// is cut: collision is untouched. A box already small enough comes back as is.
export function tilePiece(p, size) {
  if (p.quads) return [p];               // (M6.15.0) a curved piece (the casino's walls, its ramp) stays whole
  const nx = Math.max(1, Math.ceil((p.max[0] - p.min[0]) / size - 1e-9));
  const nz = Math.max(1, Math.ceil((p.max[2] - p.min[2]) / size - 1e-9));
  if (nx === 1 && nz === 1) return [p];
  const out = [];
  const dx = (p.max[0] - p.min[0]) / nx, dz = (p.max[2] - p.min[2]) / nz;
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
    out.push(Object.assign({}, p, {
      min: [p.min[0] + i * dx, p.min[1], p.min[2] + k * dz],
      max: [i === nx - 1 ? p.max[0] : p.min[0] + (i + 1) * dx, p.max[1], k === nz - 1 ? p.max[2] : p.min[2] + (k + 1) * dz],
    }));
  }
  return out;
}

const inRegion = (p, r) => {
  if (!r) return true;
  const cx = (p.min[0] + p.max[0]) / 2, cz = (p.min[2] + p.max[2]) / 2;
  return cx >= r[0] && cx <= r[2] && cz >= r[1] && cz <= r[3];
};

// Sort a level's static pieces into baked chunks and the rest.
//   region: [x0, z0, x1, z1] - only pieces centred inside are baked (the far
//           desert and the mesas keep live sunlight: they are only ever seen
//           from a distance, and would waste lightmap on nothing)
//   skip:   materials never baked (glass is see-through, lamps glow)
//   below:  if set, only pieces reaching below this height are baked (Yard 7:
//           the course and galleries underground, where the lamps are)
// Returns { chunks: [{ key, mat, pieces }], live: [pieces] }.
export function planChunks(pieces, opts) {
  opts = opts || {};
  const cell = opts.cell || BAKE.cell, tile = opts.tile || BAKE.tile;
  const skip = new Set(opts.skip || ['glass', 'glassT', 'glassB', 'lamp', 'neon', 'slotface']);   // (M6.16.0) glowing signs and screens light themselves
  const map = new Map(), live = [];
  for (const p of pieces) {
    if (skip.has(p.mat) || /^slotface\d$/.test(p.mat) || !inRegion(p, opts.region) || (opts.below !== undefined && !(p.min[1] < opts.below))) { live.push(p); continue; }
    for (const t of tilePiece(p, tile)) {
      const cx = Math.floor((t.min[0] + t.max[0]) / 2 / cell);
      const cz = Math.floor((t.min[2] + t.max[2]) / 2 / cell);
      const key = cx + ',' + cz + ':' + t.mat;
      if (!map.has(key)) map.set(key, { key, mat: t.mat, pieces: [] });
      map.get(key).pieces.push(t);
    }
  }
  return { chunks: [...map.values()], live };
}

// Lay out a lightmap: every face its own patch, packed in rows.
// faces: [[firstVertex, width, height], ...] in metres (four vertices each,
// corners in u-then-v order). Returns { uv1, side } - side is the square the
// patches fill, in metres, so side * density is the lightmap size wanted.
// (M6.16.0) A face may instead be a sheet: { verts: [vertex indices],
// coords: [[u, v] in metres, one per vertex] } - many faces laid out as one
// patch by where they really are (a floor by x and z, a curved wall unrolled
// by distance round it and height). One patch has no seams inside it: the
// casino's round floors had been hundreds of wedge patches, each squashed
// into a rectangle - a patchwork in the light, and black where a wedge came
// to a point (Rhys: "the central point looks odd"; the ceiling's "square
// tiling").
export function packLightmap(faces, nverts, pad) {
  pad = pad === undefined ? BAKE.pad : pad;
  const items = faces.map((f) => {
    if (Array.isArray(f)) return { w: f[1], h: f[2], base: f[0] };
    let u0 = Infinity, v0 = Infinity, u1 = -Infinity, v1 = -Infinity;
    for (const [u, v] of f.coords) { u0 = Math.min(u0, u); v0 = Math.min(v0, v); u1 = Math.max(u1, u); v1 = Math.max(v1, v); }
    return { w: Math.max(0.05, u1 - u0), h: Math.max(0.05, v1 - v0), sheet: f, u0, v0 };
  });
  let area = 0;
  for (const { w, h } of items) area += (w + pad) * (h + pad);
  let widest = 0;
  for (const { w } of items) widest = Math.max(widest, w + pad);
  const side = Math.max(Math.sqrt(area) * 1.08 + 1, widest);
  const place = [];
  let x = 0, y = 0, row = 0;
  // tall faces first packs tighter
  const order = items.map((f, i) => i).sort((a, b) => items[b].h - items[a].h);
  for (const i of order) {
    const { w, h } = items[i];
    if (x + w + pad > side + 1e-9) { x = 0; y += row; row = 0; }
    place[i] = [x + pad / 2, y + pad / 2];
    x += w + pad; row = Math.max(row, h + pad);
  }
  const S = Math.max(side, y + row);
  const uv1 = new Float32Array(nverts * 2);
  const corners = [[0, 0], [1, 0], [1, 1], [0, 1]];
  items.forEach((it, i) => {
    const [px, py] = place[i];
    if (it.sheet) {
      it.sheet.verts.forEach((vi, k) => { const [u, v] = it.sheet.coords[k]; uv1[vi * 2] = (px + u - it.u0) / S; uv1[vi * 2 + 1] = (py + v - it.v0) / S; });
      return;
    }
    corners.forEach(([a, b], k) => { uv1[(it.base + k) * 2] = (px + a * it.w) / S; uv1[(it.base + k) * 2 + 1] = (py + b * it.h) / S; });
  });
  return { uv1, side: S };
}

const nextPow2 = (v) => Math.pow(2, Math.ceil(Math.log2(Math.max(1, v))));

// What the engine will make of a mesh: it sizes a lightmap as
//   nextPow2(sqrt(m * (hy*hz + hx*hz + hx*hy)) * sizeMult), capped at maxRes
// (h = the mesh's half extents, m = the render component's
// lightmapSizeMultiplier). Work backwards to the m that gives `side` metres
// of patches `density` pixels a metre.
export function lightmapMultiplier(half, side, o) {
  o = Object.assign({}, BAKE, o || {});
  const base = Math.max(1e-6, half[1] * half[2] + half[0] * half[2] + half[0] * half[1]);
  const want = Math.min(o.maxRes, side * o.density);
  return (want * want) / (base * o.sizeMult * o.sizeMult);
}
export function lightmapSize(half, mult, o) {
  o = Object.assign({}, BAKE, o || {});
  const base = half[1] * half[2] + half[0] * half[2] + half[0] * half[1];
  return Math.min(nextPow2(Math.sqrt(mult * base) * o.sizeMult), o.maxRes);
}

// Bounce light, faked. A ceiling lamp lights the floor well and the ceiling
// hardly at all (it hangs just under it), so rooms read as dark caves with
// bright carpets. Real rooms get a lot of their light bounced off the floor
// and walls. Each lamp gets a soft companion, lower down, no shadows, baked
// only (it never costs a frame): it lifts the ceiling and the far walls.
export function bounceFill(lights, o) {
  o = Object.assign({ drop: 1.6, share: 0.38, reach: 1.05 }, o || {});
  return lights.filter((l) => !l.noFill).map((l) => ({
    pos: [l.pos[0], l.pos[1] - o.drop, l.pos[2]],
    color: l.color || [1, 0.96, 0.9],
    intensity: (l.intensity === undefined ? 0.8 : l.intensity) * o.share,
    range: (l.range || 14) * o.reach,
  }));
}

// When to bake the light (M6.9.28). Baked before the engine has drawn a frame,
// lamps are silently left out of the lightmaps (found in the hotel's sewer:
// whole walls black, while a second bake later came out right). So the bake
// waits for a few frames. ?bakemode=boot keeps the old way, to compare. (Pure.)
export const BAKE_AFTER_FRAMES = 3;
export function bakeWhen(search) {
  const m = /[?&]bakemode=(late|boot)\b/.exec(search || '');
  return m ? m[1] : 'late';
}
