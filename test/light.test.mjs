// FRONTLINE - baked lighting and the frame-rate watch (node).
import { BAKE, tilePiece, planChunks, packLightmap, lightmapMultiplier, lightmapSize, bounceFill, bakeWhen, BAKE_AFTER_FRAMES } from '../src/sim/bake.js';
import { FpsWatch } from '../src/sim/perf.js';
import { buildMission0 } from '../src/game/level_mission0.js';
import { buildTraining } from '../src/game/level_training.js';
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const vol = (p) => (p.max[0] - p.min[0]) * (p.max[1] - p.min[1]) * (p.max[2] - p.min[2]);

T('a big box is cut into tiles that fill it exactly, none bigger than a tile', () => {
  const p = { min: [-60, -6, -60], max: [20, 0, 60], mat: 'concrete' };
  const t = tilePiece(p, 12);
  A(t.length === 7 * 10, 'expected 70 tiles, got ' + t.length);
  A(t.every((q) => q.max[0] - q.min[0] <= 12 + 1e-9 && q.max[2] - q.min[2] <= 12 + 1e-9), 'a tile too big');
  A(Math.abs(t.reduce((a, q) => a + vol(q), 0) - vol(p)) < 1e-6, 'tiles do not add up to the box');
  A(t.every((q) => q.mat === 'concrete'), 'material lost');
  A(tilePiece({ min: [0, 0, 0], max: [2, 3, 2], mat: 'wood' }, 12).length === 1, 'a small box was cut');
});

T('the lightmap: every face inside the square, none overlapping, a gap between', () => {
  const faces = []; let v = 0;
  for (let i = 0; i < 60; i++) { faces.push([v, 0.3 + (i * 7 % 11), 0.2 + (i * 5 % 9)]); v += 4; }
  const { uv1, side } = packLightmap(faces, v);
  const rects = faces.map(([b]) => [uv1[b * 2], uv1[b * 2 + 1], uv1[(b + 2) * 2], uv1[(b + 2) * 2 + 1]]);
  A(rects.every((r) => r.every((x) => x >= 0 && x <= 1)), 'outside 0..1');
  const gap = BAKE.pad / side * 0.99;
  for (let i = 0; i < rects.length; i++) for (let k = i + 1; k < rects.length; k++) {
    const a = rects[i], b = rects[k];
    const apart = a[2] + gap <= b[0] || b[2] + gap <= a[0] || a[3] + gap <= b[1] || b[3] + gap <= a[1];
    A(apart, 'faces ' + i + ' and ' + k + ' overlap or touch');
  }
});

T('a mesh gets the lightmap size it asks for (pixels per metre), up to the cap', () => {
  const half = [12, 5, 12];
  const m = lightmapMultiplier(half, 50);           // 50 m of patches at 8 px/m = 400 px -> 512
  A(lightmapSize(half, m) === 512, 'expected 512, got ' + lightmapSize(half, m));
  const big = lightmapMultiplier(half, 400);        // would be 3200 px: capped
  A(lightmapSize(half, big) === BAKE.maxRes, 'not capped');
  A(lightmapSize(half, 1) < 512, 'the engine default was already enough - test proves nothing');
});

T('Meridian House: chunked, every chunk\'s lightmap within the cap and at least 6 px a metre where it fits', () => {
  const L = buildMission0();
  const plan = planChunks(L.pieces.filter((p) => !/^w?door\d/.test(p.tag || '')), { region: L.bakeRegion });
  const cells = new Map();   // every material in a cell shares one lightmap (render.js)
  for (const c of plan.chunks) { const k = c.key.split(':')[0]; if (!cells.has(k)) cells.set(k, []); cells.get(k).push(...c.pieces); }
  A(cells.size > 6, 'too few chunks: ' + cells.size);
  A(plan.live.every((p) => p.mat === 'glass' || p.mat === 'lamp'), 'something other than glass or lamps left unbaked');
  let dense = 0;
  for (const pieces of cells.values()) {
    const c = { pieces };
    // (the same face layout render.js makes: six faces a box)
    const faces = []; let v = 0, lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (const p of c.pieces) {
      const s = [0, 1, 2].map((i) => p.max[i] - p.min[i]);
      for (const [u, w] of [[2, 1], [2, 1], [0, 2], [0, 2], [0, 1], [0, 1]]) { faces.push([v, Math.min(18, s[u]), Math.min(18, s[w])]); v += 4; }
      for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], p.min[i]); hi[i] = Math.max(hi[i], p.max[i]); }
    }
    const { side } = packLightmap(faces, v);
    const half = [0, 1, 2].map((i) => (hi[i] - lo[i]) / 2);
    const size = lightmapSize(half, lightmapMultiplier(half, side));
    A(size <= BAKE.maxRes, 'over the cap');
    if (size / side >= 6 || size === BAKE.maxRes) dense++;
  }
  A(dense === cells.size, (cells.size - dense) + ' of ' + cells.size + ' chunks are thin on pixels');
});

T('the stairwell is lit, and the top floor has a ceiling that takes light', () => {
  const L = buildMission0();
  const inShaft = L.lights.filter((l) => l.pos[0] > 21 && l.pos[0] < 28 && l.pos[2] > 0 && l.pos[2] < 9);
  A(inShaft.length >= 3, 'lights in the stairwell: ' + inShaft.length);
  for (const f of [0, 3.6, 7.2]) A(inShaft.some((l) => l.pos[1] > f && l.pos[1] < f + 3.3), 'no stair light on the floor at ' + f);
  A(inShaft.every((l) => !(l.pos[0] > 22.9 && l.pos[0] < 24.5 && l.pos[1] > 9)), 'a light in the ceiling duct');
  const skin = L.pieces.find((p) => p.mat !== 'metal' && p.min[1] > 10.4 && p.max[1] <= 10.5 && p.max[0] - p.min[0] >= 39);
  A(skin, 'the top floor\'s ceiling is still bare metal');
});

T('Yard 7: the underground baked, the open yard live, every lamp inside the baked part', () => {
  const L = buildTraining();
  A(L.bake === true && L.bakeBelow < 0, 'not baking just the underground');
  const [x0, z0, x1, z1] = L.bakeRegion;
  const out = L.lights.filter((l) => l.pos[0] < x0 || l.pos[0] > x1 || l.pos[2] < z0 || l.pos[2] > z1);
  A(out.length === 0, out.length + ' lights outside');
  const plan = planChunks(L.pieces, { region: L.bakeRegion, cell: L.bakeCell, below: L.bakeBelow });
  A(plan.live.some((p) => p.mat === 'desert'), 'the open desert was baked');
  A(plan.live.some((p) => /^cont_/.test(p.mat)), 'the yard\'s containers were baked');
  const baked = plan.chunks.flatMap((c) => c.pieces);
  A(baked.every((p) => p.min[1] < L.bakeBelow), 'something above ground was baked');
  // every lamp lights something baked: the pieces within its reach
  for (const l of L.lights) {
    const near = baked.some((p) => l.pos[0] > p.min[0] - 6 && l.pos[0] < p.max[0] + 6 && l.pos[2] > p.min[2] - 6 && l.pos[2] < p.max[2] + 6 && l.pos[1] > p.min[1] - 6 && l.pos[1] < p.max[1] + 6);
    A(near, 'a lamp at ' + l.pos.map((v) => v.toFixed(0)) + ' lights nothing baked');
  }
});

T('bounce fill: one per lamp, lower down, softer, never for a lamp that opts out', () => {
  const f = bounceFill([{ pos: [0, 3, 0], intensity: 1, range: 10 }, { pos: [5, 3, 5], noFill: true }]);
  A(f.length === 1 && f[0].pos[1] < 3 && f[0].intensity < 1, JSON.stringify(f));
});

const run = (w, fps, secs, ctx) => { let hit = 0; for (let t = 0; t < secs; t += 1 / fps) if (w.step(1 / fps, Object.assign({ quality: 'medium' }, ctx || {}))) hit++; return hit; };
T('frame rate: a long run of slow frames offers Low Quality, once', () => {
  const w = new FpsWatch();
  A(run(w, 12, 30) === 1, 'not offered exactly once');
});
T('frame rate: smooth play, a short stutter, the menus, Low already or asked before - no offer', () => {
  A(run(new FpsWatch(), 45, 60) === 0, 'offered at 45 fps');
  const w = new FpsWatch(); run(w, 45, 10); run(w, 12, 3); A(run(w, 45, 30) === 0, 'a stutter set it off');
  A(run(new FpsWatch(), 12, 60, { paused: true }) === 0, 'offered in the menus');
  A(run(new FpsWatch(), 12, 60, { quality: 'low' }) === 0, 'offered on Low');
  A(run(new FpsWatch(), 12, 60, { asked: true }) === 0, 'asked twice');
  A(run(new FpsWatch(), 12, 5) === 0, 'offered while loading');
});

T('baked lamps shadow with a normal offset, so slanting surfaces do not shadow themselves (M6.9.26)', () => {
  A(BAKE.lampNormalOffset >= 0.02 && BAKE.lampNormalOffset <= 0.2, 'normal offset: ' + BAKE.lampNormalOffset);
  A(BAKE.lampShadowBias > 0 && BAKE.lampShadowBias <= 0.2, 'shadow bias: ' + BAKE.lampShadowBias);
});

T('the light is baked after the first frames, not before (M6.9.28: before, lamps were left out)', () => {
  A(bakeWhen('?level=1') === 'late' && bakeWhen('') === 'late', 'not late by default: ' + bakeWhen('?level=1'));
  A(bakeWhen('?level=1&bakemode=boot') === 'boot', 'the old way cannot be asked for');
  A(BAKE_AFTER_FRAMES >= 1 && BAKE_AFTER_FRAMES <= 10, 'frames: ' + BAKE_AFTER_FRAMES);
});

T('(M6.16.0) a sheet - many faces laid out where they really are - is one patch: no seams inside it', () => {
  // a 4 x 3 m floor of four triangles round its middle, and a lone 1 x 1 face beside it
  const coords = [[0, 0], [4, 0], [2, 1.5], [4, 0], [4, 3], [2, 1.5], [4, 3], [0, 3], [2, 1.5], [0, 3], [0, 0], [2, 1.5]];
  const sheet = { verts: coords.map((c, i) => i), coords };
  const { uv1, side } = packLightmap([sheet, [12, 1, 1]], 16);
  const at = (i) => [uv1[i * 2], uv1[i * 2 + 1]];
  for (const [a, b] of [[1, 3], [4, 6], [7, 9], [0, 10], [2, 5]]) A(Math.hypot(at(a)[0] - at(b)[0], at(a)[1] - at(b)[1]) < 1e-9, 'a seam between ' + a + ' and ' + b);
  A(Math.abs((at(1)[0] - at(0)[0]) * side - 4) < 1e-6, 'not to scale');
  for (let i = 0; i < 32; i++) A(uv1[i] >= 0 && uv1[i] <= 1, 'outside the lightmap');
});

{
  // (the renderer's mesh-building, run with a stand-in for the engine: in M6.16.0 the chunks'
  // sheets were left out where a chunk's materials are packed together, and only a browser found it)
  const { buildMergedMeshes } = await import('../src/game/render.js');
  const { buildCasino } = await import('../src/game/level_casino.js');
  const C = buildCasino();
  const fake = { Mesh: class { setPositions(p) { this.p = p; } setNormals() {} setUvs(i, u) { if (i === 1) this.uv1 = u; } setColors32() {} setIndices(i) { this.i = i; } update() {} }, PRIMITIVE_TRIANGLES: 4 };
  T('the casino\'s baked chunks build, their lightmap coordinates all inside the map', () => {
    const plan = planChunks(C.pieces.filter((p) => !/^w?door\d/.test(p.tag || '')), { region: C.bakeRegion });
    const lots = new Map();
    for (const ch of plan.chunks) { const k = ch.key.split(':')[0]; if (!lots.has(k)) lots.set(k, []); lots.get(k).push(...ch.pieces); }
    let meshes = 0;
    for (const pieces of lots.values()) {
      const out = buildMergedMeshes(fake, null, pieces, true, {});
      for (const m of Object.values(out)) { meshes++; for (const v of m.uv1) A(v >= -1e-6 && v <= 1 + 1e-6, 'a lightmap coordinate outside the map: ' + v); A(m.uv1.length * 3 === m.p.length * 2, 'lightmap coordinates missing'); }
    }
    A(meshes > 20, meshes + ' meshes');
    // and unbaked (?live): everything at once
    A(Object.keys(buildMergedMeshes(fake, null, C.pieces, false, {})).length > 10, 'the live meshes did not build');
  });
}

console.log(fails.length ? `${fails.length} FAILED: ${fails.join('; ')}` : `ALL ${pass} PASSED`);
