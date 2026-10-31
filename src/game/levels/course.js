// FRONTLINE - the training course.
//
// A chain of boxes of different sizes. Every junction is sealed automatically:
// the opening is the part the two boxes have in common, and everything around
// it is walled in. That is what stops you seeing - or walking - into the void
// where two sections meet.

import { drawLadder } from '../draw/ladders.js';

// The whole course sits 12 m below the yard, so its odd shape is out of sight.
// Everything here is written at ground level and moved down at the end.
export const COURSE_DY = -16;      // deeper than the tallest hall (13.6 m)

// Move everything a builder added: pieces, solids, signs, lights, ladders,
// zones, targets and crates, from a remembered starting point.
export function sinkAll(level, marks, from, dy) {
  const { world } = level;
  const shiftBox = (b) => { b.min[1] += dy; b.max[1] += dy; if (b.centre) b.centre[1] += dy; };
  for (let i = from.pieces; i < level.pieces.length; i++) shiftBox(level.pieces[i]);
  for (let i = from.solids; i < world.solids.length; i++) shiftBox(world.solids[i]);
  for (let i = from.signs; i < level.signs.length; i++) level.signs[i].pos[1] += dy;
  for (let i = from.lights; i < (level.lights || []).length; i++) level.lights[i].pos[1] += dy;
  for (let i = from.ladders; i < world.ladders.length; i++) shiftBox(world.ladders[i]);
  for (let i = from.zones; i < (world.zones || []).length; i++) shiftBox(world.zones[i]);
  for (let i = from.targets; i < (world.targets || []).length; i++) {
    const t = world.targets[i];
    t.min[1] += dy; t.max[1] += dy; t.centre[1] += dy;
    if (t.turret) t.turret.pos[1] += dy;
  }
  for (let i = from.crates; i < level.crates.length; i++) level.crates[i].pos[1] += dy;
  for (const k of Object.keys(marks || {})) { marks[k][0][1] += dy; marks[k][1][1] += dy; }
}
export function mark(level) {
  return { pieces: level.pieces.length, solids: level.world.solids.length, signs: level.signs.length,
    lights: (level.lights || []).length, ladders: level.world.ladders.length,
    zones: (level.world.zones || []).length, targets: (level.world.targets || []).length,
    crates: level.crates.length };
}

export function buildTutorial(level) {
  const { world, pieces, signs } = level;
  const from = mark(level);
  const marks = level.marks || (level.marks = {});
  const lights = level.lights || (level.lights = []);

  const box = (min, max, mat, opts) => {
    opts = opts || {};
    const p = { min, max, mat, uv: opts.uv || 'world', tag: opts.tag };
    if (opts.render !== false) pieces.push(p);
    if (opts.solid !== false) world.addSolid(min, max, opts.tag || mat);
    return p;
  };
  const boxc = (cx, cy, cz, sx, sy, sz, mat, opts) =>
    box([cx - sx / 2, cy, cz - sz / 2], [cx + sx / 2, cy + sy, cz + sz / 2], mat, opts);
  const sign = (x, y, z, yaw, text, sub, w, col) =>
    signs.push({ pos: [x, y, z], yaw, w: w || 3.0, h: (w || 3.0) * 0.34, text, sub: sub || '', col: col || '#6cc4e8' });
  const zone = (a, b) => [a, b];
  // a door fills the opening it sits in, with a hazard stripe across the top
  const door = (x, z0, z1, y0, y1, tag) => {
    box([x - 0.12, y0, z0], [x + 0.12, y1 - 0.25, z1], 'metal', { tag });
    box([x - 0.12, y1 - 0.25, z0], [x + 0.12, y1, z1], 'hazard', { tag: tag + '_top' });
    // the override panel, set into the side wall on the far side of the door
    // (you go through eastwards, so its rear is +x): for coming back
    box([x + 0.55, y0 + 1.0, z1 - 0.06], [x + 1.15, y0 + 1.7, z1], 'panel', { solid: false, uv: 'fit' });
  };

  const W = 0.4;
  const S = [
    { x: [-198, -181], z: [-4, 4], y: 0, h: 3.2 },        // start
    { x: [-181, -178], z: [-4, 4], y: -6.4, h: 9.6 },     // the trench
    { x: [-178, -166], z: [-4, 4], y: 0, h: 3.2 },        // landing
    { x: [-166, -148], z: [-6, 6], y: 0, h: 9.5 },        // ladder hall
    { x: [-148, -134], z: [-7, 7], y: 5, h: 8.2 },        // crate hall
    { x: [-134, -118], z: [-9, 9], y: 7, h: 6.2 },        // vault hall
    { x: [-118, -86], z: [-2.4, 2.4], y: 6.6, h: 2.8, hole: [-90, -87] },   // crawl tunnel
  ];
  S.forEach((s, i) => {
    const [x0, x1] = s.x, [z0, z1] = s.z, y0 = s.y, y1 = s.y + s.h;
    if (s.hole) {
      box([x0, y0 - W, z0 - W], [s.hole[0], y0, z1 + W], 'concrete2');
      box([s.hole[1], y0 - W, z0 - W], [x1, y0, z1 + W], 'concrete2');
    } else box([x0, y0 - W, z0 - W], [x1, y0, z1 + W], 'concrete2');
    box([x0, y1, z0 - W], [x1, y1 + W, z1 + W], 'metal');
    box([x0, y0, z0 - W], [x1, y1, z0], 'wall');
    box([x0, y0, z1], [x1, y1, z1 + W], 'wall');
    if (i === 0) box([x0 - W, y0 - W, z0 - W], [x0, y1 + W, z1 + W], 'wall');
    for (let x = x0 + 5; x < x1; x += 10) {
      box([x - 0.7, y1 - 0.12, (z0 + z1) / 2 - 0.22], [x + 0.7, y1 - 0.02, (z0 + z1) / 2 + 0.22], 'lamp', { solid: false });
      lights.push({ pos: [x, y1 - 0.5, (z0 + z1) / 2], range: 15, intensity: 0.8 });
    }
  });
  // bulkheads round every opening
  for (let i = 0; i < S.length - 1; i++) {
    const a = S[i], b = S[i + 1], x = a.x[1];
    const z0 = Math.min(a.z[0], b.z[0]), z1 = Math.max(a.z[1], b.z[1]);
    const y0 = Math.min(a.y, b.y), y1 = Math.max(a.y + a.h, b.y + b.h);
    const oz0 = Math.max(a.z[0], b.z[0]), oz1 = Math.min(a.z[1], b.z[1]);
    const oy0 = Math.max(a.y, b.y), oy1 = Math.min(a.y + a.h, b.y + b.h);
    if (z0 < oz0) box([x - W, y0, z0], [x, y1, oz0], 'wall');
    if (oz1 < z1) box([x - W, y0, oz1], [x, y1, z1], 'wall');
    if (y0 < oy0) box([x - W, y0, oz0], [x, oy0, oz1], 'wall');
    if (oy1 < y1) box([x - W, oy1, oz0], [x, y1, oz1], 'wall');
  }

  // ── 1. Walk and jump ─────────────────────────────────────────────────────
  world.spawn = { pos: [-194, 0, 0], yaw: -Math.PI / 2 };
  sign(-195.6, 2.0, 0, -Math.PI / 2, 'GHOST TRAINING', 'COURSE', 3.0);
  marks.walked = zone([-188, 0, -4], [-182, 3, 4]);
  marks.jumped = zone([-175, 0, -4], [-169, 3, 4]);
  drawLadder(box, -180.54, 3.6, [1, 0], -5.6, 0.1, 'yellow');
  world.addLadder([-180.54, -5.6, 3.1], [-179.74, 0.3, 4.1], [1, 0]);
  sign(-179.4, -4.6, 3.9, Math.PI, 'TRY AGAIN', '', 2.0, '#e8b423');
  door(-167.4, -4, 4, 0, 3.2, 'door1');

  // ── 2. Ladder climb and platform hop ─────────────────────────────────────
  drawLadder(box, -163, 0, [-1, 0], 0, 5, 'iron');
  world.addLadder([-163.9, 0, -1.0], [-163.0, 5.3, 1.0], [-1, 0]);
  box([-162.6, 4.7, -3], [-159, 5, 3], 'grating');
  marks.ladderTop = zone([-162.6, 5.0, -3], [-159, 6.6, 3]);
  box([-156.6, 4.7, -3], [-151, 5, 3], 'grating');
  marks.hopped = zone([-156.6, 5.0, -3], [-151, 6.6, 3]);
  boxc(-154, 0, 0, 1.2, 1.2, 1.2, 'crate');
  boxc(-155.4, 0, 1.6, 1.2, 2.3, 1.2, 'crate');
  door(-149.4, -6, 6, 5, 9.5, 'door2');

  // ── 3. Crate climb to the catwalk ────────────────────────────────────────
  boxc(-145.5, 5, 0, 1.4, 1.2, 1.4, 'crate');
  boxc(-144, 5, 1.2, 1.4, 2.3, 1.4, 'crate');
  boxc(-142.4, 5, 0, 1.4, 3.4, 1.4, 'crate');
  boxc(-140.8, 5, -1.2, 1.4, 4.5, 1.4, 'crate');
  box([-140, 9.5, -1.2], [-134.5, 9.8, 1.2], 'grating');
  marks.catwalk = zone([-140, 9.8, -1.4], [-134.5, 11.4, 1.4]);

  // ── 4. Sprint and vault ──────────────────────────────────────────────────
  // the catwalk carries on into the next hall; its walls become railings
  const CE = -126;       // where the catwalk ends: 6.6 m short of the door
  box([-134.5, 9.5, -1.2], [CE, 9.8, 1.2], 'grating');
  for (const z of [-1.25, 1.25]) {
    box([-134.5, 9.8, z - 0.05], [CE - 4, 10.9, z + 0.05], 'wall');
    box([CE - 4, 9.8, z - 0.05], [CE, 10.8, z + 0.05], 'rail', { render: false });
    box([CE - 4, 10.7, z - 0.04], [CE, 10.8, z + 0.04], 'rail', { solid: false });
    box([CE - 4, 10.2, z - 0.03], [CE, 10.3, z + 0.03], 'rail', { solid: false });
    for (let x = CE - 4; x <= CE; x += 2) box([x - 0.04, 9.8, z - 0.04], [x + 0.04, 10.8, z + 0.04], 'rail', { solid: false });
  }
  box([CE - 0.1, 9.8, -1.3], [CE, 10.8, 1.3], 'rail', { render: false });
  box([CE - 0.1, 10.7, -1.3], [CE, 10.8, 1.3], 'rail', { solid: false });
  box([CE - 0.1, 10.2, -1.3], [CE, 10.3, 1.3], 'rail', { solid: false });
  for (const z of [-1.2, 0, 1.2]) box([CE - 0.1, 9.8, z - 0.04], [CE, 10.8, z + 0.04], 'rail', { solid: false });
  // 3: something holding it up - posts down to the floor, with cross-braces
  for (let x = -133; x <= CE - 0.5; x += 3) {
    for (const z of [-1.1, 1.1]) box([x - 0.08, 7, z - 0.08], [x + 0.08, 9.5, z + 0.08], 'metal');
    box([x - 0.05, 8.1, -1.1], [x + 0.05, 8.2, 1.1], 'metal', { solid: false });
  }
  sign(CE - 2.5, 10.5, -1.45, 0, 'VAULT THE RAIL', '', 2.4, '#e8b423');
  marks.vaulted = zone([-133.5, 7.0, -9], [-118.5, 8.8, 9]);

  door(-117.85, -2.4, 2.4, 6.6, 9.4, 'door4');

  // ── 5. Crouch and crawl ──────────────────────────────────────────────────
  box([-110, 8.1, -2.4], [-102, 9.4, 2.4], 'cont_grey');
  box([-102, 7.7, -2.4], [-94, 9.4, 2.4], 'cont_blue');
  sign(-111, 8.5, 0, -Math.PI / 2, 'CROUCH', '', 2.2, '#e8b423');
  sign(-103, 8.1, 0, -Math.PI / 2, 'CRAWL', '', 2.2, '#e8b423');
  marks.crawled = zone([-94, 7.0, -2], [-90.5, 7.9, 2]);
  // the grate: the floor gives way into the weapons wing below
  box([-90, 6.6, -2.4], [-87, 7, -1.0], 'grating');
  box([-90, 6.6, 1.0], [-87, 7, 2.4], 'grating');
  // a walled shaft down to the weapons wing, with a landing to break the fall
  box([-90.4, 3.4, -1.4], [-90, 6.6, 1.4], 'wall');
  box([-86.6, 3.4, -1.4], [-86.2, 6.6, 1.4], 'wall');
  box([-90.4, 3.4, -1.4], [-86.2, 6.6, -1.0], 'wall');
  box([-90.4, 3.4, 1.0], [-86.2, 6.6, 1.4], 'wall');
  box([-89.6, 3.4, -0.9], [-88.4, 3.7, 0.9], 'crate');      // a crate to land on

  // the end of the tunnel, with the sign on it
  box([-86.4, 6.6, -2.8], [-86, 9.4, 2.8], 'wall');
  sign(-86.45, 7.25, 0, -Math.PI / 2, 'MIND THE GAP', '', 2.2, '#7fd07f');
  marks.dropped = zone([-92, -1, -3], [-86, 5.5, 3]);

  level.sections = S;
  sinkAll(level, marks, from, COURSE_DY);
  level.tutorialSpawn = [-194, COURSE_DY, 0];
  level.tutorialYaw = -Math.PI / 2;
  world.spawn = { pos: [-194, COURSE_DY, 0], yaw: -Math.PI / 2 };
  return marks;
}
