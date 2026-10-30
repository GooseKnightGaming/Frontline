// FRONTLINE (M6.9.28) - the bake check, for the machine that matters. Each
// case: two floors, the same lamps over each - baked into the left floor,
// lighting the right one live. With nothing in the way they should match.
// M6.9.27 showed one lamp bakes fine on Rhys's Chromebook while the game's
// lamps come out dark, so the cases now try MORE than one lamp (does each new
// lamp add to the last, or wipe it?), lamps far from the origin (precision),
// the sun first then lamps (as in the game), and clustered lighting off.
// Built into dist/bakecheck.js.
import * as pc from 'playcanvas';

const CASES = [
  { name: '1 lamp', lamps: 1 },
  { name: '2 lamps', lamps: 2 },
  { name: '6 lamps', lamps: 6 },
  { name: 'sun + 2 lamps', lamps: 2, sun: true },
  { name: '2 lamps, 60 m out', lamps: 2, off: [60, 40] },
  { name: '1 lamp, clustered off', lamps: 1, cl: false },
  { name: '2 lamps, clustered off', lamps: 2, cl: false },
  { name: '6 lamps, clustered off', lamps: 6, cl: false },
  { name: 'sun + 2 lamps, clustered off', lamps: 2, sun: true, cl: false },
];

function runCase(c) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 120;
    document.getElementById('cv').appendChild(canvas);
    const app = new pc.Application(canvas, { graphicsDeviceOptions: { preserveDrawingBuffer: true, antialias: false } });
    if (c.cl === false) app.scene.clusteredLightingEnabled = false;
    app.start();
    app.scene.ambientLight = new pc.Color(0, 0, 0);
    const [ox, oz] = c.off || [0, 0];
    const mat = new pc.StandardMaterial(); mat.diffuse = new pc.Color(1, 1, 1); mat.useMetalness = true; mat.metalness = 0; mat.gloss = 0; mat.update();
    // two long floors, 18 x 4 m, one above the other on screen
    const floor = (z, lm) => { const e = new pc.Entity(); e.addComponent('render', { type: 'box', material: mat, lightmapped: lm, castShadows: true, receiveShadows: true }); e.setPosition(ox, -0.5, oz + z); e.setLocalScale(18, 1, 4); app.root.addChild(e); return e; };
    const fA = floor(-2.5, true); floor(2.5, false);
    // lamps along each floor, every 18/N m, alternating colours so each one shows
    const xs = Array.from({ length: c.lamps }, (_, i) => -9 + (i + 0.5) * 18 / c.lamps);
    const cols = [[1, 0.82, 0.55], [0.55, 0.8, 1], [0.8, 1, 0.6]];
    xs.forEach((x, i) => {
      for (const baked of [true, false]) {
        const e = new pc.Entity();
        e.addComponent('light', { type: 'omni', color: new pc.Color(...cols[i % 3]), intensity: 1.6, range: 4.5,
          castShadows: baked, shadowResolution: 256, shadowBias: 0.05, normalOffsetBias: 0.05, bake: baked, affectDynamic: !baked });
        e.setPosition(ox + x, 1.5, oz + (baked ? -2.5 : 2.5)); app.root.addChild(e);
      }
    });
    if (c.sun) {
      // a faint sun, baked into the left and live on the right
      for (const baked of [true, false]) {
        const s = new pc.Entity(); s.addComponent('light', { type: 'directional', color: new pc.Color(0.3, 0.35, 0.5), intensity: 0.3, castShadows: baked, bake: baked, affectDynamic: !baked, mask: baked ? pc.MASK_BAKE : pc.MASK_AFFECT_DYNAMIC });
        s.setEulerAngles(60, 30, 0); app.root.addChild(s);
      }
    }
    const cam = new pc.Entity(); cam.addComponent('camera', { projection: pc.PROJECTION_ORTHOGRAPHIC, orthoHeight: 6, clearColor: new pc.Color(0, 0, 0.3), toneMapping: pc.TONEMAP_ACES, gammaCorrection: pc.GAMMA_SRGB });
    cam.setPosition(ox, 20, oz); cam.setEulerAngles(-90, 0, 0); app.root.addChild(cam);
    app.scene.lightmapFilterEnabled = true; app.scene.lightmapFilterRange = 8; app.scene.lightmapFilterSmoothness = 0.25;
    app.scene.lightmapMaxResolution = 1024; app.scene.lightmapSizeMultiplier = 32;
    let err = null;
    const t0 = performance.now();
    try { app.lightmapper.bake([fA], pc.BAKE_COLOR); } catch (e) { err = String(e); }
    const ms = Math.round(performance.now() - t0);
    setTimeout(() => {
      app.render();
      const gl = app.graphicsDevice.gl, px = new Uint8Array(4), W = canvas.width, H = canvas.height;
      // screen: 40 m wide x 12 m tall; baked floor at z -2.5 (upper half), live at +2.5
      const toPx = (x, z) => [W / 2 + (x / 40) * W, H / 2 + (z / 12) * H];
      const read = (x, z) => { const [u, v] = toPx(x, z); gl.readPixels(Math.round(u), Math.round(H - v), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return (px[0] + px[1] + px[2]) / 3; };
      let worst = 1;
      const each = xs.map((x) => { const b = read(x, -2.5), l = read(x, 2.5); const r = l > 3 ? b / l : 1; worst = Math.min(worst, r); return Math.round(r * 100); });
      app.destroy();
      resolve({ c, worst, each, ms, err });
    }, 400);
  });
}

(async () => {
  const out = document.getElementById('out');
  const rows = [];
  const g = (() => { const cv = document.createElement('canvas'); const gl = cv.getContext('webgl2'); try { const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); } catch (_) { return '?'; } })();
  let all = '';
  for (const c of CASES) {
    out.innerHTML = '<p>Baking: ' + c.name + '...</p>' + table(rows);
    const r = await runCase(c);
    rows.push(r);
    all += (all ? ' ' : '') + Math.round(r.worst * 100);
  }
  out.innerHTML = table(rows) + `<p style="font-size:12px;opacity:.7">${g}</p>`;
  document.title = 'bakecheck ' + all;
})();

function table(rows) {
  return '<table><tr><th>case</th><th>result</th><th>each lamp, baked / live</th><th>bake</th></tr>' + rows.map((r) =>
    `<tr><td>${r.c.name}</td><td style="color:${r.worst > 0.85 ? '#5c5' : '#e55'};font-weight:bold">${r.worst > 0.85 ? 'WORKS' : 'FAILS'} (${Math.round(r.worst * 100)}%)</td><td>${r.each.join('% &nbsp;')}%</td><td>${r.ms} ms${r.err ? ' ERROR ' + r.err : ''}</td></tr>`).join('') + '</table>';
}
