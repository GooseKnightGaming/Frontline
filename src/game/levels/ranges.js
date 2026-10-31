// FRONTLINE - the weapons half of the training course.
//
// Four ranges and a turret bay, south of the movement course, each opened by
// the one before. Every range is roofed and walled: you cannot climb out, and
// nothing you fire leaves the building.

import { makeTarget } from '../../sim/arms/weapons.js';
import { Crate } from '../../sim/arms/loadout.js';
import { SwingDoor } from '../../sim/world/doors.js';

import { COURSE_DY, sinkAll, mark } from './course.js';

export function buildWeapons(level) {
  const from = mark(level);
  const marksBefore = new Set(Object.keys(level.marks || {}));
  const { world, pieces, signs, crates } = level;
  const marks = level.marks || (level.marks = {});
  const groups = {};
  const lights = level.lights || (level.lights = []);

  const box = (min, max, mat, opts) => {
    opts = opts || {};
    const p = { min, max, mat, uv: opts.uv || 'world', tag: opts.tag };
    if (opts.render !== false) pieces.push(p);
    if (opts.solid !== false) world.addSolid(min, max, opts.tag || mat, { noClimb: opts.noClimb, ghost: opts.ghost });
    return p;
  };
  const boxc = (cx, cy, cz, sx, sy, sz, mat, opts) =>
    box([cx - sx / 2, cy, cz - sz / 2], [cx + sx / 2, cy + sy, cz + sz / 2], mat, opts);
  const sign = (x, y, z, yaw, text, sub, w, col) =>
    signs.push({ pos: [x, y, z], yaw, w: w || 3.0, h: (w || 3.0) * 0.34, text, sub: sub || '', col: col || '#6cc4e8' });
  // a roofed hall: floor, roof, four walls, with lights down the middle
  // gap: an opening in the near wall (z0), by x range. gapW: the west wall
  // (x0), by z range. gapS: the far wall (z1), by x range. gapE: the east
  // wall (x1), by z range.
  const hall = (x0, x1, z0, z1, h, name, gap, gapW, gapS, gapE) => {
    box([x0 - 0.4, -0.4, z0 - 0.4], [x1 + 0.4, 0, z1 + 0.4], 'concrete2');
    box([x0 - 0.4, h, z0 - 0.4], [x1 + 0.4, h + 0.4, z1 + 0.4], 'metal');
    if (gap) {
      // a way in through the near wall, sealed above the opening
      box([x0 - 0.4, 0, z0 - 0.4], [gap[0], h, z0], 'wall');
      box([gap[1], 0, z0 - 0.4], [x1 + 0.4, h, z0], 'wall');
      box([gap[0], 3.4, z0 - 0.4], [gap[1], h, z0], 'wall');
    } else box([x0 - 0.4, 0, z0 - 0.4], [x1 + 0.4, h, z0], 'wall');
    if (gapS) {
      box([x0 - 0.4, 0, z1], [gapS[0], h, z1 + 0.4], 'wall');
      box([gapS[1], 0, z1], [x1 + 0.4, h, z1 + 0.4], 'wall');
      box([gapS[0], 2.6, z1], [gapS[1], h, z1 + 0.4], 'wall');
    } else box([x0 - 0.4, 0, z1], [x1 + 0.4, h, z1 + 0.4], 'wall');
    if (gapW) {
      box([x0 - 0.4, 0, z0], [x0, h, gapW[0]], 'wall');
      box([x0 - 0.4, 0, gapW[1]], [x0, h, z1], 'wall');
      box([x0 - 0.4, 2.6, gapW[0]], [x0, h, gapW[1]], 'wall');
    } else box([x0 - 0.4, 0, z0], [x0, h, z1], 'wall');
    if (gapE) {
      box([x1, 0, z0], [x1 + 0.4, h, gapE[0]], 'wall');
      box([x1, 0, gapE[1]], [x1 + 0.4, h, z1], 'wall');
      box([x1, 2.6, gapE[0]], [x1 + 0.4, h, gapE[1]], 'wall');
    } else box([x1, 0, z0], [x1 + 0.4, h, z1], 'wall');
    for (let x = x0 + 4; x < x1; x += 9) {
      box([x - 0.8, h - 0.12, (z0 + z1) / 2 - 0.25], [x + 0.8, h - 0.02, (z0 + z1) / 2 + 0.25], 'lamp', { solid: false });
      lights.push({ pos: [x, h - 0.5, (z0 + z1) / 2], range: 16, intensity: 0.85 });
    }
    if (name) world.addZone([x0, 0, z0], [x1, h, z1], name.toLowerCase(), name);
  };
  const door = (x, z0, z1, y0, tag) => {
    box([x - 0.15, y0, z0], [x + 0.15, y0 + 2.2, z1], 'metal', { tag });
    box([x - 0.2, y0 + 2.2, z0 - 0.1], [x + 0.2, y0 + 2.5, z1 + 0.1], 'hazard', { solid: false });
  };
  const doorZ = (z, x0, x1, y0, tag) => {
    box([x0, y0, z - 0.15], [x1, y0 + 2.2, z + 0.15], 'metal', { tag });
    box([x0 - 0.1, y0 + 2.2, z - 0.2], [x1 + 0.1, y0 + 2.5, z + 0.2], 'hazard', { solid: false });
  };
  const target = (x, y, z, group, opts) => {
    opts = opts || {};
    const w = opts.w || 0.9, h = opts.h || 1.8;
    // a target faces down the range: thin across the line of fire
    const made = { hp: opts.hp || 20, score: opts.score || 10, respawn: 1e6, lane: group, fall: 1 };
    const t = opts.axis === 'x'
      ? makeTarget(world, [x - 0.04, y, z - w / 2], [x + 0.04, y + h, z + w / 2], made)
      : makeTarget(world, [x - w / 2, y, z - 0.04], [x + w / 2, y + h, z + 0.04], made);
    t.group = group;
    t.silhouette = !!opts.silhouette;
    if (opts.track) t.track = opts.track;     // {from, to, speed} along x
    (groups[group] = groups[group] || []).push(t);
    return t;
  };
  // face: which way the label looks ('+z' by default, or '+x' / '-x' / '-z')
  const crate = (x, z, kind, items, labelText, face) => {
    boxc(x, 0, z, 1.2, 1.0, 1.2, kind === 'weapon' ? 'crate' : 'metal', { tag: 'crate' });
    const F = { '+z': [0, 0.62, 0], '-z': [0, -0.62, Math.PI], '+x': [0.62, 0, Math.PI / 2], '-x': [-0.62, 0, -Math.PI / 2] }[face || '+z'];
    sign(x + F[0], 1.35, z + F[1], F[2], labelText, '', 1.5, '#7fd07f');
    const c = new Crate(kind, items, [x, 0.5, z]);
    c.label = labelText;
    c.stock = items.slice();          // so a course restart refills it
    crates.push(c);
    return c;
  };

  // ── A shooting gallery ───────────────────────────────────────────────────
  // You stand at a covered firing line and look out at the scene: a berm at
  // the back, barriers and sandbags, targets at different heights, and rails
  // for the movers. The firing line runs east-west along z = FIRE_Z.
  const FZ0 = 12, FZ1 = 16;            // the covered corridor you stand in
  const berm = (x0, x1, z, h) => {
    for (let i = 0; i < 3; i++) {
      box([x0, 0, z + i * 0.9], [x1, h - i * (h / 3.4), z + (i + 1) * 0.9], 'concrete');
    }
  };
  const sandbags = (x, z, n, h) => {
    for (let i = 0; i < n; i++) boxc(x + (i % 2) * 0.25, i * 0.32, z + (i % 3) * 0.2, 1.5, 0.34, 0.8, 'crate');
  };
  const gallery = (x0, x1, deep, opts) => {
    opts = opts || {};
    const z1 = FZ1 + deep;
    // the ground out to the berm, and the walls around it
    box([x0 - 0.4, -0.4, FZ1], [x1 + 0.4, 0, z1 + 0.4], 'concrete2');
    box([x0 - 0.4, 0, FZ1], [x0, 6.5, z1 + 0.4], 'wall');
    box([x1, 0, FZ1], [x1 + 0.4, 6.5, z1 + 0.4], 'wall');
    box([x0 - 0.4, 0, z1], [x1 + 0.4, 6.5, z1 + 0.4], 'wall');
    box([x0 - 0.4, 6.5, FZ1], [x1 + 0.4, 6.9, z1 + 0.4], 'metal');   // roof over the whole bay
    berm(x0, x1, z1 - 3.2, 2.6);
    // the firing line: bench, overhang, lane numbers
    box([x0, 0, FZ1 - 0.75], [x1, 0.95, FZ1 - 0.15], 'crate', { noClimb: true });   // the bench
    // wire above the bench: you shoot over it, you do not climb it
    box([x0, 0.95, FZ1 - 0.5], [x1, 1.22, FZ1 - 0.42], 'fence', { noClimb: true });
    for (let x = x0 + 3; x < x1; x += 6) box([x - 0.06, 0.95, FZ1 - 0.56], [x + 0.06, 1.32, FZ1 - 0.36], 'metal', { noClimb: true });
    box([x0, 1.22, FZ1 - 0.6], [x1, 1.32, FZ1 - 0.32], 'rail', { noClimb: true });   // the coil along the top
    box([x0, 1.32, FZ1 - 0.55], [x1, 2.6, FZ1 - 0.45], 'barrier', { render: false, noClimb: true, ghost: true });
    box([x0, 2.6, FZ0 - 0.4], [x1, 2.9, FZ1 + 2.2], 'metal');         // overhang
    for (let i = 0; i < 3; i++) {
      const x = x0 + ((x1 - x0) * (i + 0.5)) / 3;
      sign(x, 0.62, FZ1 - 0.78, Math.PI, String(i + 1), '', 0.55, '#e8b423');
      lights.push({ pos: [x, 2.6, FZ1 + 1], range: 14, intensity: 0.85 });
      // and light down the range itself, so you can see what you are shooting at
      for (let d = 8; d < deep; d += 9) lights.push({ pos: [x, 5.6, FZ1 + d], range: 22, intensity: 0.75 });
    }
    // barriers out in the scene, to break it up and give the low targets cover
    for (const [bx, bz, bh] of opts.barriers || []) box([bx - 2, 0, bz], [bx + 2, bh, bz + 0.5], 'concrete');
    for (const [sx, sz] of opts.bags || []) sandbags(sx, sz, 5, 1);
    return { z1 };
  };
  // a target standing in the scene, facing the firing line
  const gtarget = (x, z, group, opts) => {
    opts = opts || {};
    const stand = opts.y || 0;
    if (opts.post) box([x - 0.08, 0, z - 0.08], [x + 0.08, stand, z + 0.08], 'metal');
    if (opts.track) box([opts.track.from - 0.6, 0.12, z - 0.25], [opts.track.to + 0.6, 0.22, z + 0.25], 'metal');
    else {
      // a stand that stays put while the figure falls: base plate and upright
      box([x - 0.25, 0, z - 0.15], [x + 0.25, 0.04, z + 0.15], 'metal', { solid: false });
      box([x - 0.03, 0, z - 0.03], [x + 0.03, Math.max(0.2, stand + 0.18), z + 0.03], 'metal', { solid: false });
    }
    return target(x, stand, z, group, Object.assign({ axis: 'z' }, opts));
  };

  // ── link down from the movement course ───────────────────────────────────
  box([-94, -0.4, -4], [-84, 0, 4], 'concrete2');
  box([-94, 0, -4.4], [-84, 3.4, -4], 'wall');
  box([-94, 3.4, -4.4], [-91, 3.8, 4.4], 'metal');
  box([-86.5, 3.4, -4.4], [-84, 3.8, 4.4], 'metal');
  box([-91, 3.4, -4.4], [-86.5, 3.8, -1.2], 'metal');
  box([-91, 3.4, 1.2], [-86.5, 3.8, 4.4], 'metal');
  box([-94, 0, 4], [-92, 3.4, 4.4], 'wall');
  box([-86, 0, 4], [-84, 3.4, 4.4], 'wall');
  box([-92, 2.6, 4], [-86, 3.4, 4.4], 'wall');
  box([-94.4, 0, -4], [-94, 3.4, 4], 'wall');
  // the east wall: an ordinary door through to the stairs up to the yard.
  // The stairs used to stare you in the face as you landed, and the ranges
  // (to your right, through the south opening) were easy to miss.
  box([-84, 0, -4], [-83.6, 3.4, -0.5], 'wall');
  box([-84, 0, 0.5], [-83.6, 3.4, 4], 'wall');
  box([-84, 2.15, -0.5], [-83.6, 3.4, 0.5], 'wall');
  // a wooden frame round the doorway, on both faces
  for (const [x0, x1] of [[-84.06, -84], [-83.6, -83.54]]) {
    box([x0, 0, -0.62], [x1, 2.27, -0.5], 'wood', { solid: false });
    box([x0, 0, 0.5], [x1, 2.27, 0.62], 'wood', { solid: false });
    box([x0, 2.15, -0.62], [x1, 2.27, 0.62], 'wood', { solid: false });
  }
  lights.push({ pos: [-89, 3, 0], range: 14, intensity: 0.8 });
  // which way to go: on the wall beside the door, and over the opening itself
  sign(-84.03, 1.15, 2.3, -Math.PI / 2, 'WEAPONS RANGE  \u2192', 'turn right', 2.4, '#e8b423');
  sign(-89, 2.63, 3.97, Math.PI, 'WEAPONS RANGE', '', 2.2, '#e8b423');
  box([-92.4, -0.4, 3.6], [-85.6, 0, 12.4], 'concrete2');
  box([-92.4, 0, 3.6], [-92, 3.4, 12.4], 'wall');
  box([-86, 0, 3.6], [-85.6, 3.4, 12.4], 'wall');
  box([-92.4, 3.4, 3.6], [-85.6, 3.8, 12.4], 'metal');

  // ── the firing corridor: you walk west along it, galleries open to the south
  const CX0 = -246, CX1 = -84;
  box([CX0 - 0.4, -0.4, FZ0 - 0.4], [CX1 + 0.4, 0, FZ1], 'concrete2');
  const alcoveMouths = [[-104, 3.2], [-150, 3.2], [-212, 3.2]];
  {
    const edges = [[CX0 - 0.4, -92], [-86, CX1 + 0.4]];
    for (const [a0, a1] of edges) {
      let x = a0;
      for (const [mx, mw] of alcoveMouths.slice().sort((p, q) => p[0] - q[0])) {
        const m0 = mx - mw / 2, m1 = mx + mw / 2;
        if (m1 < a0 || m0 > a1) continue;
        if (m0 > x) box([x, 0, FZ0 - 0.4], [m0, 3.4, FZ0], 'wall');
        x = Math.max(x, m1);
      }
      if (x < a1) box([x, 0, FZ0 - 0.4], [a1, 3.4, FZ0], 'wall');
    }
  }
  box([-92, 2.6, FZ0 - 0.4], [-86, 3.4, FZ0], 'wall');
  box([CX0 - 0.4, 3.4, FZ0 - 0.4], [CX1 + 0.4, 3.8, FZ1 + 0.4], 'metal');

  box([CX1, 0, FZ0], [CX1 + 0.4, 3.4, FZ1], 'wall');
  for (let x = CX0 + 8; x < CX1; x += 12) lights.push({ pos: [x, 3.1, FZ0 + 1.6], range: 15, intensity: 0.7 });
  // doors across the corridor, one per range
  // south wall of the corridor, except where a gallery opens
  const galleryGaps = [[-124, -86], [-176, -127], [-246, -178]];
  let cursor = CX1;
  for (const [gx0, gx1] of galleryGaps) {
    if (gx1 < cursor) box([gx1, 0, FZ1], [cursor, 3.4, FZ1 + 0.4], 'wall');
    cursor = gx0;
  }
  if (CX0 < cursor) box([CX0 - 0.4, 0, FZ1], [cursor, 3.4, FZ1 + 0.4], 'wall');

  // an alcove in the corridor's north wall: the weapon crate and the range's
  // sign live in here, out of the firing line and facing the right way
  const alcove = (x, label) => {
    const w = 3.2, d = 2.6;
    box([x - w / 2, -0.4, FZ0 - d], [x + w / 2, 0, FZ0], 'concrete2');
    box([x - w / 2 - 0.4, 0, FZ0 - d - 0.4], [x - w / 2, 3.4, FZ0], 'wall');
    box([x + w / 2, 0, FZ0 - d - 0.4], [x + w / 2 + 0.4, 3.4, FZ0], 'wall');
    box([x - w / 2 - 0.4, 0, FZ0 - d - 0.4], [x + w / 2 + 0.4, 3.4, FZ0 - d], 'wall');
    box([x - w / 2 - 0.4, 3.4, FZ0 - d - 0.4], [x + w / 2 + 0.4, 3.8, FZ0], 'metal');
    sign(x, 2.1, FZ0 - d + 0.05, 0, label, '', 2.8, '#7fd07f');
    lights.push({ pos: [x, 3.1, FZ0 - d / 2], range: 10, intensity: 0.8 });
    return [x, FZ0 - d / 2];
  };

  const cdoor = (x, tag) => {
    box([x - 0.12, 0, FZ0], [x + 0.12, 3.1, FZ1], 'metal', { tag });
    box([x - 0.12, 3.1, FZ0], [x + 0.12, 3.4, FZ1], 'hazard', { tag: tag + '_top' });
    // the firing corridor runs westwards, so each door's rear is its -x side;
    // the panel sits in the corridor's back wall there
    box([x - 1.15, 1.0, FZ0], [x - 0.55, 1.7, FZ0 + 0.06], 'panel', { solid: false, uv: 'fit' });
  };

  // ── 1. Pistol gallery ────────────────────────────────────────────────────
  world.addZone([-124, 0, FZ0], [-84, 6, 44], 'pistol range', 'Pistol gallery');
  { const [ax, az] = alcove(-104, 'PISTOL GALLERY'); crate(ax, az, 'weapon', ['PX9'], 'PX9 SIDEARM'); }
  gallery(-124, -86, 26, { barriers: [[-104, 30, 0.9]], bags: [[-96, 24]] });
  gtarget(-92, 26, 'pistol', { w: 0.7, h: 0.7, hp: 15, y: 1.1, post: true });
  gtarget(-100, 22, 'pistol', { w: 0.7, h: 0.7, hp: 15, y: 0.9, post: true });
  gtarget(-107, 34, 'pistol', { w: 0.7, h: 0.7, hp: 15, y: 1.5, post: true });
  gtarget(-114, 28, 'pistol', { w: 0.7, h: 0.7, hp: 15, y: 0.5, post: true });
  gtarget(-120, 38, 'pistol', { w: 0.7, h: 0.7, hp: 15, y: 1.2, post: true });
  cdoor(-125, 'wdoor1');

  // ── 2. Rifle gallery: movers on rails ────────────────────────────────────
  world.addZone([-176, 0, FZ0], [-126, 6, 50], 'rifle range', 'Rifle gallery');
  { const [ax, az] = alcove(-150, 'RIFLE GALLERY'); crate(ax, az, 'weapon', ['K7'], 'K7 CARBINE'); }
  gallery(-176, -127, 32, { barriers: [[-152, 32, 0.9]], bags: [[-134, 26]] });
  for (const [x, z, y] of [[-136, 28, 0], [-146, 40, 0.8], [-166, 34, 0]]) {
    gtarget(x, z, 'rifle', { silhouette: true, hp: 25, y, post: y > 0 });
  }
  gtarget(-142, 24, 'rifle', { silhouette: true, hp: 25, track: { from: -150, to: -134, speed: 2.6 } });
  gtarget(-160, 44, 'rifle', { silhouette: true, hp: 25, track: { from: -170, to: -150, speed: 3.4 } });
  gtarget(-172, 30, 'rifle', { silhouette: true, hp: 25, y: 1.6, post: true });
  cdoor(-177, 'wdoor2');

  // ── 3. Sniper gallery: long, with bunkers ────────────────────────────────
  world.addZone([-246, 0, FZ0], [-178, 6, 96], 'sniper range', 'Sniper gallery');
  { const [ax, az] = alcove(-212, 'SNIPER GALLERY'); crate(ax, az, 'weapon', ['LR7'], 'LR7 MARKSMAN'); }
  gallery(-246, -178, 74, { barriers: [[-192, 46, 0.9], [-228, 62, 0.9]], bags: [[-216, 54]] });
  for (const [x, z, y] of [[-196, 54, 0], [-210, 72, 0], [-232, 80, 0], [-186, 66, 1.8]]) {
    gtarget(x, z, 'sniper', { silhouette: true, hp: 25, y, post: y > 0 });
  }
  gtarget(-220, 66, 'sniper', { silhouette: true, hp: 25, track: { from: -232, to: -206, speed: 3.2 } });
  for (const [x, z] of [[-204, 82], [-238, 70]]) {
    box([x - 2.4, 0, z - 1.4], [x + 2.4, 1.15, z + 1.4], 'concrete');
    box([x - 2.4, 1.95, z - 1.4], [x + 2.4, 3.4, z + 1.4], 'concrete');
    gtarget(x, z, 'sniper', { w: 0.7, h: 0.7, hp: 25, y: 1.2 });
  }
  cdoor(-245.8, 'wdoor3');

  // ── 4. Grenade bay: through the glass, in at the vent ────────────────────
  // reached from the west end of the corridor, turning south
  box([-258, -0.4, FZ0 - 0.4], [-246, 0, 30], 'concrete2');
  box([-258.4, 0, FZ0 - 0.4], [-258, 5, 30.4], 'wall');
  // the bay's north wall, with the crate alcove's mouth cut through it
  box([-258.4, 0, FZ0 - 0.4], [-256, 5, FZ0], 'wall');
  box([-252, 0, FZ0 - 0.4], [-246, 5, FZ0], 'wall');
  box([-256, 3.4, FZ0 - 0.4], [-252, 5, FZ0], 'wall');
  box([-246, 0, FZ1], [-245.6, 5, 30], 'wall');
  box([-258.4, 5, FZ0 - 0.4], [-245.6, 5.4, 30.4], 'metal');
  lights.push({ pos: [-252, 4.4, 22], range: 16, intensity: 0.8 });
  // the crate alcove, off the bay's north side, open to the bay
  box([-256, -0.4, 8.4], [-252, 0, 11.6], 'concrete2');
  box([-256.4, 0, 8.0], [-256, 3.4, 11.6], 'wall');
  box([-252, 0, 8.0], [-251.6, 3.4, 11.6], 'wall');
  box([-256.4, 0, 8.0], [-251.6, 3.4, 8.4], 'wall');
  box([-256.4, 3.4, 8.0], [-251.6, 3.8, 11.6], 'metal');
  sign(-254, 2.2, 8.45, 0, 'FRAG GRENADES', '', 2.6, '#7fd07f');
  lights.push({ pos: [-254, 3.0, 10], range: 9, intensity: 0.85 });
  crate(-254, 9.4, 'weapon', ['FRAG'], 'FRAG GRENADES');
  const bz = 28;
  box([-258, 0, bz], [-250.5, 3.4, bz + 0.4], 'wall');
  box([-257.6, 0.5, bz - 6], [-250.9, 3.4, bz - 5.8], 'glass');
  box([-258, 0, bz - 6], [-255.6, 0.5, bz - 5.8], 'metal');
  box([-252.9, 0, bz - 6], [-250.5, 0.5, bz - 5.8], 'metal');
  box([-250.9, 0, bz - 6.2], [-250.5, 3.4, bz + 0.4], 'wall');
  for (const x of [-256.4, -254.8, -253.2, -251.8]) gtarget(x, bz - 2.5, 'grenade', { silhouette: true, hp: 18 });
  lights.push({ pos: [-252, 3, bz - 3], range: 14, intensity: 0.9 });
  box([-258, 0, 30], [-250.5, 4, 30.4], 'wall');
  box([-250.5, 0, 30], [-246, 4, 30.4], 'wall', { tag: 'wdoor4' });
  box([-251.4, 1.0, 30.4], [-250.8, 1.7, 30.46], 'panel', { solid: false, uv: 'fit' });   // rear: the turret-bay side
  box([-250.5, 4, 30], [-246, 4.4, 30.4], 'hazard', { tag: 'wdoor4_top' });
  sign(-248.2, 2.4, 29.85, Math.PI, 'TURRET BAY', '', 2.2, '#e05050');

  // ── 5. Turret bay ────────────────────────────────────────────────────────
  // You come in behind a baffle where the turrets cannot see you at all, and
  // have to cross to the low walls to get a shot.
  // clear of the sniper gallery's east wall, which runs down x = -246
  const TB = { x0: -268, x1: -246.8, z0: 30.4, z1: 76 };
  level.turretBay = TB;
  hall(TB.x0, TB.x1, TB.z0, TB.z1, 7.0, 'Turret bay', [-250.5, -247.2], null, [-262, -254], null);
  // the baffle: a wall across the entrance, so the safe corner is truly safe
  box([-254, 0, 36], [-246.8, 4.6, 36.5], 'concrete');
  box([-254, 0, 36], [-253.5, 4.6, 45], 'concrete');
  marks.turretSafe = [[-251, 0, 31], [-247.4, 3, 35.5]];
  sign(-250, 2.3, 35.95, Math.PI, 'SAFE BEHIND THE BAFFLE', '', 2.8, '#7fd07f');
  // cover to work forward from: two low walls, offset
  box([-266, 0, 48], [-258, 1.15, 48.6], 'concrete');
  box([-256, 0, 56], [-248, 1.15, 56.6], 'concrete');
  box([-264, 0, 64], [-257, 1.15, 64.6], 'concrete');
  for (const [lx, lz] of [[-260, 44], [-252, 54], [-260, 68]]) lights.push({ pos: [lx, 5.6, lz], range: 18, intensity: 0.7 });
  const turrets = [];
  for (const [x, z] of [[-264, 73], [-251, 73]]) {
    boxc(x, 4.2, z, 1.0, 0.8, 1.0, 'metal', { solid: false });
    const t = makeTarget(world, [x - 0.5, 4.2, z - 0.5], [x + 0.5, 5.0, z + 0.5],
      { hp: 60, score: 100, respawn: 1e6, lane: 'turret', fall: 1 });
    t.group = 'turret'; t.turret = { pos: [x, 4.6, z], fire: 0, burst: 0, reload: 0, seen: 0 };
    (groups.turret = groups.turret || []).push(t);
    turrets.push(t);
    lights.push({ pos: [x, 5.4, z - 2], range: 12, intensity: 0.55, color: [1, 0.45, 0.4] });
  }
  // and the way out, in the far wall past them
  box([-262, 0, TB.z1], [-254, 4, TB.z1 + 0.4], 'wall', { tag: 'wdoor5' });
  box([-253.4, 1.0, TB.z1 + 0.4], [-252.8, 1.7, TB.z1 + 0.46], 'panel', { solid: false, uv: 'fit' });   // rear: the transport side
  box([-262, 4, TB.z1], [-254, 4.4, TB.z1 + 0.4], 'hazard', { tag: 'wdoor5_top' });

  // ── the way home: east along z = 66, then north to the yard gateway ──────
  // Out: a transport bay east of the turret bay. Walking the length of the
  // facility again taught nobody anything.
  box([-264, -0.4, 76], [-252, 0, 88.4], 'concrete2');
  box([-264.4, 0, 76], [-264, 4.4, 78.4], 'wall');
  box([-264.4, 0, 81.6], [-264, 4.4, 88.4], 'wall');
  box([-264.4, 3.4, 78.4], [-264, 4.4, 81.6], 'wall');
  box([-267.6, -0.4, 78.4], [-264, 0, 81.6], 'concrete2');
  box([-268, 0, 78], [-264.4, 3.4, 78.4], 'wall');
  box([-268, 0, 81.6], [-264.4, 3.4, 82], 'wall');
  box([-268, 0, 78], [-267.6, 3.4, 82], 'wall');
  box([-268, 3.4, 78], [-264.4, 3.8, 82], 'metal');

  box([-252, 0, 76], [-251.6, 4.4, 88.4], 'wall');
  box([-264.4, 0, 88], [-251.6, 4.4, 88.4], 'wall');
  box([-264.4, 0, 76], [-262, 4.4, 76.4], 'wall');
  box([-254, 0, 76], [-251.6, 4.4, 76.4], 'wall');
  box([-264.4, 4.4, 76], [-251.6, 4.8, 88.4], 'metal');
  lights.push({ pos: [-258, 4, 82], range: 16, intensity: 0.85 });
  // the panel that takes you back
  boxc(-258, 0, 87.6, 2.4, 2.2, 0.5, 'metal', { tag: 'extract' });
  sign(-258, 1.35, 87.3, Math.PI, 'RETURN TO YARD 7', 'E', 2.6, '#7fd07f');
  level.extract = { pos: [-258, 0, 87.6], to: [-64, 0, 0], yaw: -Math.PI / 2 };

  crate(-265.8, 80, 'ammo', ['AMMO_PISTOL', 'AMMO_RIFLE', 'AMMO_SNIPER'], 'AMMUNITION', '+x');

  sign(-66, 2.2, -2.6, 0, 'YARD 7', '', 2.6, '#7fd07f');
  marks.finished = [[-70, 0, -3], [-61, 3, 3]];

  level.groups = groups;
  level.turrets = turrets;
  // down it all goes, 12 m below the yard (only the marks this builder added:
  // the movement course has already sunk its own)
  const mine = {};
  for (const k of Object.keys(marks)) if (!marksBefore.has(k)) mine[k] = marks[k];
  sinkAll(level, mine, from, COURSE_DY);
  level.extract.to = [-64, 0, 0];          // the yard is still where it was
  level.turretBay = TB;

  // ── The stairwell: yard level down to the course, 16 m below ────────────
  // A switchback in a shaft just wide enough for two flights side by side.
  // Landings span the whole shaft at each end, so there is nowhere to fall.
  {
    const X0 = -74, X1 = -60;          // the shaft
    const Z0 = -3.2, Z1 = 3.2;
    const FX0 = -70.5, FX1 = -63.5;    // where the flights run
    const cy = COURSE_DY;
    // shell: floor at the bottom, walls all the way up, roof over the top
    box([X0 - 0.4, cy - 0.4, Z0 - 0.4], [X1, cy, Z1 + 0.4], 'concrete2');
    box([X0 - 0.4, cy, Z0 - 0.4], [X1, 4, Z0], 'wall');
    box([X0 - 0.4, cy, Z1], [X1, 4, Z1 + 0.4], 'wall');
    box([X0 - 0.4, cy + 3.8, Z0], [X0, 4, Z1], 'wall');            // west wall above the corridor
    box([X0 - 0.4, cy, Z0], [X0, cy + 3.4, -2.4], 'wall');
    box([X0 - 0.4, cy, 2.4], [X0, cy + 3.4, Z1], 'wall');
    box([X1 - 0.4, cy, Z0 - 0.4], [X1, -0.4, Z1 + 0.4], 'wall');   // east, below the gateway
    box([X0 - 0.4, 4, Z0 - 0.4], [X1, 4.4, Z1 + 0.4], 'metal');
    // the landing you step onto from the yard gateway, with a rail along the
    // side of the opening where there are no treads
    box([-63.5, -0.4, -2.8], [-59.8, 0, 2.6], 'concrete2');
    // and ground over the rest of the shaft's roof, so there is no void round it
    box([X0 - 0.4, -0.4, 2.6], [X1, 0, Z1 + 0.4], 'concrete2');
    box([X0 - 0.4, -0.4, Z0 - 0.4], [X1, 0, -2.8], 'concrete2');
    box([X0 - 0.4, -0.4, -2.8], [-70.5, 0, 2.6], 'concrete2');
    box([-63.6, 0, -0.1], [-63.3, 1.1, 2.7], 'rail', { render: false, noClimb: true });
    box([-63.6, 1.0, -0.1], [-63.3, 1.1, 2.7], 'rail', { solid: false });
    box([-63.6, 0.5, -0.1], [-63.3, 0.6, 2.7], 'rail', { solid: false });
    for (const z of [0, 1.3, 2.6]) box([-63.58, 0, z - 0.04], [-63.32, 1.1, z + 0.04], 'rail', { solid: false });
    // one flight: treads from y0 down to y1, along x, within one half of the shaft
    const flight = (y0, y1, z0, z1, west) => {
      const n = Math.round((y0 - y1) / 0.22);
      const run = (FX1 - FX0) / n;
      for (let i = 0; i < n; i++) {
        const y = y0 - (i + 1) * 0.22;
        const x = west ? FX1 - (i + 1) * run : FX0 + i * run;
        box([x, y, z0], [x + run, y + 0.22, z1], 'concrete');
      }
    };
    const landing = (y, xa, xb) => box([xa, y - 0.25, Z0], [xb, y, Z1], 'concrete');
    flight(0, -4, Z0, 0, true);          landing(-4, X0, FX0 + 0.5);
    flight(-4, -8, 0, Z1, false);        landing(-8, FX1 - 0.5, X1 - 0.4);
    flight(-8, -12, Z0, 0, true);        landing(-12, X0, FX0 + 0.5);
    flight(-12, cy, 0, Z1, false);       landing(cy, FX1 - 0.5, X1 - 0.4);
    for (const y of [-1.5, -5.5, -9.5, -13.5]) lights.push({ pos: [-67, y, 0], range: 12, intensity: 0.85 });
    sign(-62.4, 1.5, 2.55, Math.PI, 'TRAINING COURSE', 'Stairs down', 2.2, '#7fd07f');
    // the corridor at the bottom, west into the link room under the crawl drop
    box([-84, cy - 0.4, -2.8], [X0, cy, 2.8], 'concrete2');
    box([-84, cy, -2.8], [X0, cy + 3.4, -2.4], 'wall');
    box([-84, cy, 2.4], [X0, cy + 3.4, 2.8], 'wall');
    box([-84, cy + 3.4, -2.8], [X0, cy + 3.8, 2.8], 'metal');
    lights.push({ pos: [-79, cy + 3.0, 0], range: 14, intensity: 0.8 });
    // the door at the end of it, into the link room, and a word for anyone
    // coming down from the yard: the ranges are through it and to the left
    const door = new SwingDoor(world, { plane: 'x', at: -83.8, wall: [-84, -83.6],
      from: -0.47, to: 0.49, y0: cy, h: 2.12, label: 'door',
      seal: [0.03, 0.01, 0.03] });      // drawn out to the jambs (z +-0.5) and the lintel at 2.15
    (level.swingDoors = level.swingDoors || []).push(door);
    sign(-83.57, cy + 1.2, -1.5, Math.PI / 2, 'WEAPONS RANGE', 'through the door, then left', 1.7, '#e8b423');
    // where the weapons half starts, for skipping straight to it
    level.weaponsStart = { pos: [-89, cy, 0], yaw: Math.PI };


  }
  return { groups, turrets };
}

export function stepRanges(level, player, arsenal, dt, t) {
  for (const list of Object.values(level.groups || {})) {
    for (const tg of list) {
      if (tg.track && !tg.down) {
        const { from, to, speed } = tg.track;
        const span = to - from;
        const k = (Math.sin((t * speed) / Math.max(1, Math.abs(span)) * 2) + 1) / 2;
        const x = from + span * k;
        const dx = x - tg.centre[0];
        tg.centre[0] = x;
        tg.min[0] += dx; tg.max[0] += dx;
        tg.solid.min[0] += dx; tg.solid.max[0] += dx;
      }
    }
  }
  // turrets: watch, fire in bursts, then reload - which is your moment
  for (const tg of level.turrets || []) {
    const q = tg.turret;
    if (!q || tg.down) continue;
    // an EMP: blind and quiet until it comes back (sim/arms/emp.js)
    if (q.jammed > 0) { q.jammed = Math.max(0, q.jammed - dt); q.canSee = false; q.firing = false; q.seen = 0; continue; }
    const eye = player.eyePos;
    const d = [eye[0] - q.pos[0], eye[1] - q.pos[1], eye[2] - q.pos[2]];
    const dist = Math.hypot(d[0], d[1], d[2]);
    const dir = [d[0] / dist, d[1] / dist, d[2] / dist];
    // look from just outside the turret's own housing, or it only sees itself
    const from = [q.pos[0] + dir[0] * 0.8, q.pos[1] + dir[1] * 0.8, q.pos[2] + dir[2] * 0.8];
    const hit = level.world.raycast(from, dir, dist - 0.8);
    const clear = !hit || hit.t > dist - 1.2;
    // they watch their whole bay; only walls (the baffle, the cover) hide you
    const b = level.turretBay;
    const inBay = b && player.pos[0] > b.x0 && player.pos[0] < b.x1 && player.pos[2] > b.z0 && player.pos[2] < b.z1;
    q.canSee = clear && inBay;
    if (q.reload > 0) { q.reload -= dt; q.firing = false; continue; }
    if (q.canSee) {
      q.seen += dt;
      if (q.seen > 0.6) {
        q.firing = true;
        q.fire -= dt;
        if (q.fire <= 0) {
          q.fire = 0.12;
          q.burst++;
          player.damage(1.6, 'turret', q.pos.slice());
          arsenal.events.push({ type: 'turret', pos: q.pos.slice() });
          if (q.burst > 26) { q.burst = 0; q.reload = 3.2; q.seen = 0; q.firing = false; }
        }
      }
    } else { q.seen = Math.max(0, q.seen - dt * 2); q.firing = false; }
  }
}
