// FRONTLINE - Ghost Training Facility, "Yard 7".
// A grey-boxed container yard for learning to move: vault lane, climb wall,
// crouch duct, stairs and catwalk, a dive tower over a deep pool, drop
// platforms, and a weapons range that stays locked until there are weapons.
//
// Each piece is both a collider (sim) and a visual (render), so what you see
// is exactly what you stand on.

import { World } from '../../sim/world/world.js';
import { makeTarget } from '../../sim/arms/weapons.js';
import { Crate } from '../../sim/arms/loadout.js';
import { buildTutorial } from './course.js';
import { buildWeapons } from './ranges.js';
import { hangDoors } from '../../sim/world/doors.js';
import { drawLadder } from '../draw/ladders.js';

export const CONTAINER = { w20: 6.06, w40: 12.19, h: 2.59, d: 2.44 };

export function buildTraining() {
  const world = new World();
  const pieces = [];     // {min, max, mat, solid, uv}
  const signs = [];      // {pos, yaw, w, h, text, sub, col}
  const lamps = [];      // {pos}
  const water = [];      // render info for water surfaces

  const box = (min, max, mat, opts) => {
    opts = opts || {};
    const p = { min, max, mat, uv: opts.uv || 'world', tint: opts.tint };
    if (opts.render !== false) pieces.push(p);
    if (opts.solid !== false) world.addSolid(min, max, opts.tag || mat, { noClimb: opts.noClimb, tough: opts.tough, glass: opts.glass, ghost: opts.ghost });
    return p;
  };
  // a box by centre and size
  const boxc = (cx, cy, cz, sx, sy, sz, mat, opts) =>
    box([cx - sx / 2, cy, cz - sz / 2], [cx + sx / 2, cy + sy, cz + sz / 2], mat, opts);
  // a railing: an invisible thin collider plus posts and bars you can see through
  const railing = (min, max) => {
    box(min, max, 'rail', { render: false, tag: 'rail' });
    const alongX = (max[0] - min[0]) >= (max[2] - min[2]);
    const len = alongX ? max[0] - min[0] : max[2] - min[2];
    const y0 = min[1], y1 = max[1];
    const cx = (min[0] + max[0]) / 2, cz = (min[2] + max[2]) / 2;
    const bar = (y, t) => alongX
      ? box([min[0], y - t / 2, cz - 0.03], [max[0], y + t / 2, cz + 0.03], 'rail', { solid: false })
      : box([cx - 0.03, y - t / 2, min[2]], [cx + 0.03, y + t / 2, max[2]], 'rail', { solid: false });
    bar(y1 - 0.03, 0.06);
    bar(y0 + (y1 - y0) * 0.5, 0.04);
    const n = Math.max(1, Math.round(len / 1.5));
    for (let i = 0; i <= n; i++) {
      const t = min[alongX ? 0 : 2] + (len * i) / n;
      if (alongX) box([t - 0.03, y0, cz - 0.03], [t + 0.03, y1, cz + 0.03], 'rail', { solid: false });
      else box([cx - 0.03, y0, t - 0.03], [cx + 0.03, y1, t + 0.03], 'rail', { solid: false });
    }
  };
  const sign = (x, y, z, yaw, text, sub, w, col) => signs.push({ pos: [x, y, z], yaw, w: w || 3.2, h: (w || 3.2) * 0.34, text, sub: sub || '', col: col || '#e8b423' });

  // ── Ground, with a hole for the pool ─────────────────────────────────────
  const E = 60;                     // yard half-size
  const pool = { x0: 20, x1: 40, z0: -30, z1: -10, floor: -5, surface: -0.35 };
  box([-E, -6, -E], [pool.x0, 0, E], 'concrete');               // west of pool
  box([pool.x1, -6, -E], [E, 0, E], 'concrete');                // east of pool
  box([pool.x0, -6, -E], [pool.x1, 0, pool.z0], 'concrete');     // north of pool
  box([pool.x0, -6, pool.z1], [pool.x1, 0, E], 'concrete');      // south of pool
  // the floor steps down away from the dive tower: about 4 m under the boards,
  // 6 m at the far end
  const poolSteps = 5;
  for (let i = 0; i < poolSteps; i++) {
    const z0 = pool.z0 + ((pool.z1 - pool.z0) * i) / poolSteps;
    const z1 = pool.z0 + ((pool.z1 - pool.z0) * (i + 1)) / poolSteps;
    const depth = -4.0 - (2.0 * i) / (poolSteps - 1);
    box([pool.x0, depth - 1.2, z0], [pool.x1, depth, z1], 'pooltile');
  }
  // ladders at the near corners, so you can always climb out
  for (const x of [pool.x0 + 1.4, pool.x1 - 1.4]) {
    drawLadder(box, x, pool.z1 - 0.12, [0, -1], -2.6, 0.1, 'yellow');
    world.addLadder([x - 0.5, -2.6, pool.z1 - 0.95], [x + 0.5, 0.3, pool.z1 - 0.15], [0, -1]);
  }
  // pool lining (thin, flush with the hole walls, so the walls look tiled)
  box([pool.x0, pool.floor, pool.z0], [pool.x1, 0, pool.z0 + 0.02], 'pooltile', { solid: false });
  box([pool.x0, pool.floor, pool.z1 - 0.02], [pool.x1, 0, pool.z1], 'pooltile', { solid: false });
  box([pool.x0, pool.floor, pool.z0], [pool.x0 + 0.02, 0, pool.z1], 'pooltile', { solid: false });
  box([pool.x1 - 0.02, pool.floor, pool.z0], [pool.x1, 0, pool.z1], 'pooltile', { solid: false });
  // hazard edging round the pool
  box([pool.x0 - 0.4, 0, pool.z0 - 0.4], [pool.x1 + 0.4, 0.02, pool.z0], 'hazard', { solid: false });
  box([pool.x0 - 0.4, 0, pool.z1], [pool.x1 + 0.4, 0.02, pool.z1 + 0.4], 'hazard', { solid: false });
  box([pool.x0 - 0.4, 0, pool.z0], [pool.x0, 0.02, pool.z1], 'hazard', { solid: false });
  box([pool.x1, 0, pool.z0], [pool.x1 + 0.4, 0.02, pool.z1], 'hazard', { solid: false });
  world.addWater([pool.x0, pool.floor, pool.z0], [pool.x1, pool.surface, pool.z1]);
  water.push({ x0: pool.x0, x1: pool.x1, z0: pool.z0, z1: pool.z1, y: pool.surface, floor: pool.floor });
  world.addZone([pool.x0, pool.floor, pool.z0], [pool.x1, 2, pool.z1], 'pool', 'Dive pool - 4.6 m deep');

  // ── Perimeter wall ────────────────────────────────────────────────────────
  const WH = 5;
  box([-E - 1, 0, -E - 1], [E + 1, WH, -E], 'wall');
  // south wall, with a pair of hangar doors in it behind the vehicle dock
  const hx0 = 26, hx1 = 50;
  box([-E - 1, 0, E], [hx0, WH, E + 1], 'wall');
  box([hx1, 0, E], [E + 1, WH, E + 1], 'wall');
  box([hx0 - 0.8, 0, E - 0.5], [hx0, 7.8, E + 1], 'metal');                 // the frame
  box([hx1, 0, E - 0.5], [hx1 + 0.8, 7.8, E + 1], 'metal');
  box([hx0 - 0.8, 7, E - 0.5], [hx1 + 0.8, 7.8, E + 1], 'metal');
  box([hx0 - 0.8, WH, E], [hx0 - 0.8, 7, E + 1], 'wall', { render: false });
  for (const [a, b] of [[hx0, (hx0 + hx1) / 2 - 0.05], [(hx0 + hx1) / 2 + 0.05, hx1]]) {
    box([a, 0, E - 0.3], [b, 7, E], 'shutter');                               // two great leaves
    for (let x = a + 1.5; x < b; x += 3) box([x - 0.08, 0, E - 0.36], [x + 0.08, 7, E - 0.3], 'metal', { solid: false });
  }
  box([hx0, 0.02, E - 7], [hx1, 0.04, E - 0.4], 'hazard', { solid: false });  // keep-clear apron

  // west wall, with a gateway where the training course comes in
  box([-E - 1, 0, -E], [-E, WH, -3.4], 'wall');
  box([-E - 1, 0, 3.4], [-E, WH, E], 'wall');
  box([-E - 1, 3.2, -3.4], [-E, WH, 3.4], 'wall');
  box([E, 0, -E], [E + 1, WH, E], 'wall');
  // invisible height above the wall, so nothing climbed leads out of the yard
  box([-E - 1, WH, -E - 1], [E + 1, 60, -E], 'wall', { render: false });
  box([-E - 1, WH, E], [E + 1, 60, E + 1], 'wall', { render: false });
  box([-E - 1, WH, -E], [-E, 60, E], 'wall', { render: false });
  box([-E - 1, 0, -3.4], [-E, 3.2, 3.4], 'hazard', { solid: false, render: false });
  box([E, WH, -E], [E + 1, 60, E], 'wall', { render: false });
  // floodlight posts along the walls
  for (let i = -48; i <= 48; i += 24) {
    for (const [x, z] of [[i, -E + 1.2], [i, E - 1.2], [-E + 1.2, i], [E - 1.2, i]]) {
      if (x < -E + 2 && Math.abs(z) < 6) continue;      // keep the west gateway clear
      boxc(x, 0, z, 0.35, 9, 0.35, 'metal');
      lamps.push({ pos: [x, 9.1, z] });
    }
  }

  // ── Container stacks along the north wall ────────────────────────────────
  const C = CONTAINER;
  const cont = (x, level, z, len, colour, along) => {
    // along='x' means the long side runs east-west
    const y = level * C.h;
    const sx = along === 'x' ? len : C.d, sz = along === 'x' ? C.d : len;
    return boxc(x, y, z, sx, C.h, sz, 'cont_' + colour, { uv: 'fit', tag: 'container' });
  };
  const colours = ['blue', 'grey', 'orange', 'green', 'red', 'white'];
  let ci = 0;
  for (let x = -54; x <= -6; x += C.w40 + 0.3) {
    const high = 1 + ((ci * 7) % 3);
    for (let l = 0; l < high; l++) cont(x + C.w40 / 2, l, -56, C.w40, colours[(ci + l) % colours.length], 'x');
    ci++;
  }
  // west-side row of 20ft containers, one and two high
  for (let z = -40; z <= 40; z += C.w20 + 0.4) {
    if (Math.abs(z) < 7) { ci++; continue; }            // walkway from the training course
    cont(-56, 0, z, C.w20, colours[ci % colours.length], 'z');
    if ((ci % 3) !== 0) cont(-56, 1, z, C.w20, colours[(ci + 2) % colours.length], 'z');
    ci++;
  }

  // ── Welcome board by the spawn ────────────────────────────────────────────
  world.spawn = { pos: [0, 0, 30], yaw: 0 };
  // ── 1. Vault lane (east of spawn, running north) ──────────────────────────
  const vx = 10;
  box([vx - 3, 0, 12], [vx + 3, 0.02, 14], 'hazard', { solid: false });
  const lanes = [[8, 0.8], [2, 1.05], [-4, 1.25], [-10, 1.7], [-16, 2.2], [-22, C.h]];
  lanes.forEach(([z, h], i) => {
    const depth = i < 3 ? 0.5 : 1.0;
    boxc(vx, 0, z, 6, h, depth, i < 3 ? 'concrete2' : 'wall', { tag: 'lane' });
    // label on the face you run at
    sign(vx + 2.0, Math.max(0.05, h - 0.62), z + depth / 2 + 0.03, 0, h.toFixed(2) + ' m', '', 1.6,
      i < 3 ? '#7fd07f' : i < 5 ? '#e8b423' : '#e05050');
  });
  // the crate that makes the container climbable (flush against it)
  boxc(vx - 1.6, 0, -20.9, 1.2, 1.1, 1.2, 'crate');
  // lane edges
  box([vx - 3.3, 0, -24], [vx - 3, 0.6, 12], 'hazard');
  box([vx + 3, 0, -24], [vx + 3.3, 0.6, 12], 'hazard');

  // ── 1b. Parkour lane, beside the vault lane ───────────────────────────────
  // Sprint at each one and press SPACE. The thin walls you go over and drop
  // down the far side; the blocks you run up and haul yourself onto. The
  // last is out of reach on purpose, so you can feel where the limit is.
  {
    const kx = 16.5;
    box([kx - 2.5, 0, 12], [kx + 2.5, 0.02, 14], 'hazard', { solid: false });
    const walls = [
      [7, 1.8, 0.3, 'concrete2', '#7fd07f', 'Sprint + SPACE: over'],
      [-1, 2.5, 0.3, 'wall', '#e8b423', 'Run up and over'],
      [-9, 3.0, 2.0, 'wall', '#e07a2a', 'Run up'],
      [-17, 3.3, 2.0, 'wall', '#e07a2a', 'Run up: the limit'],
      [-25, 4.0, 1.0, 'wall', '#e05050', 'Out of reach'],
    ];
    for (const [z, h, depth, mat, col, note] of walls) {
      boxc(kx, 0, z, 5, h, depth, mat, { tag: 'parkour' });
      sign(kx + 1.4, Math.max(0.05, h - 0.9), z + depth / 2 + 0.03, 0, h.toFixed(2) + ' m', note, 1.8, col);
      // a step down off the back of the blocks, so getting down never hurts
      if (depth > 1) boxc(kx - 1.6, 0, z - depth / 2 - 0.6, 1.2, 1.4, 1.2, 'crate');
    }
    box([kx - 2.8, 0, -26], [kx - 2.5, 0.6, 12], 'hazard');
    box([kx + 2.5, 0, -26], [kx + 2.8, 0.6, 12], 'hazard');
  }

  // ── 2. Crouch duct (west of spawn) ────────────────────────────────────────
  const dx = -12;
  // floor-to-roof sides with a low roof between
  box([dx - 1.6, 0, 0], [dx - 1.0, 2.4, 15], 'metal');
  box([dx + 1.0, 0, 0], [dx + 1.6, 2.4, 15], 'metal');
  // the roof sits between the sides - overlapping boxes make surfaces flicker
  box([dx - 1.0, 1.25, 0], [dx + 1.0, 2.4, 15], 'cont_grey', { uv: 'world' });
  box([dx - 1.0, 0, 15.02], [dx + 1.0, 0.02, 16.2], 'hazard', { solid: false });

  // ── 3. Stairs to a catwalk between two container stacks ───────────────────
  const sx = -30, sz0 = 6;
  const topY = C.h * 2;
  const steps = Math.ceil(topY / 0.4);
  for (let i = 0; i < steps; i++) {
    const y1 = Math.min(topY, (i + 1) * (topY / steps));
    box([sx - 1, 0, sz0 - (i + 1) * 0.55], [sx + 1, y1, sz0 - i * 0.55], 'metal');
  }
  const sEnd = sz0 - steps * 0.55;
  // landing stack (two containers), then a catwalk east to another stack
  cont(sx, 0, sEnd - C.w20 / 2, C.w20, 'green', 'z');
  cont(sx, 1, sEnd - C.w20 / 2, C.w20, 'orange', 'z');
  const cwz = sEnd - C.w20 / 2;
  const cwx0 = sx + C.d / 2, cwx1 = sx + 18;
  box([cwx0, topY - 0.15, cwz - 0.8], [cwx1, topY, cwz + 0.8], 'grating');
  // railings (low enough to vault - you are meant to be able to leap off)
  railing([cwx0, topY, cwz - 0.85], [cwx1, topY + 1.0, cwz - 0.8]);
  railing([cwx0, topY, cwz + 0.8], [cwx1, topY + 1.0, cwz + 0.85]);
  for (let x = cwx0 + 2; x < cwx1; x += 4) boxc(x, 0, cwz, 0.25, topY - 0.15, 0.25, 'metal');
  // the catwalk lands on a two-high stack...
  cont(cwx1 + C.d / 2, 0, cwz, C.w20, 'blue', 'z');
  cont(cwx1 + C.d / 2, 1, cwz, C.w20, 'white', 'z');
  // ...beside a three-high one: a crate on top is the way up
  const bx = cwx1 + C.d + C.d / 2;
  cont(bx, 0, cwz, C.w20, 'grey', 'z');
  cont(bx, 1, cwz, C.w20, 'orange', 'z');
  cont(bx, 2, cwz, C.w20, 'red', 'z');
  boxc(cwx1 + C.d - 0.6, topY, cwz + 1.6, 1.2, 1.1, 1.2, 'crate');
  // and a ladder down (or up) the three-high stack's east face
  const lx = cwx1 + 2 * C.d + 0.02;
  drawLadder(box, lx, cwz, [1, 0], 0, C.h * 3, 'iron');
  // the climbing column stands clear of the ladder itself, so you never see through it
  world.addLadder([lx + 0.12, 0, cwz - 0.5], [lx + 0.92, C.h * 3 + 0.3, cwz + 0.5], [1, 0]);

  sign(bx, C.h * 3 + 0.6, cwz - 2.4, 0, '7.8 m', '', 2.6, '#e05050');

  // ── 4. Dive tower over the pool ───────────────────────────────────────────
  const tx0 = 28, tx1 = 32, tz0 = -38, tz1 = -34;
  for (const [x, z] of [[tx0, tz0], [tx1 - 0.4, tz0], [tx0, tz1 - 0.4], [tx1 - 0.4, tz1 - 0.4]]) {
    box([x, 0, z], [x + 0.4, 12.3, z + 0.4], 'metal');
  }
  for (const y of [6, 12]) {
    box([tx0, y, tz0], [tx1, y + 0.3, tz1], 'grating');                 // platform
    // board sticking out over the water (the water starts at z=-30); the two
    // boards sit side by side so a dive from the top never meets the lower one
    const bx0 = y === 12 ? 28.3 : 30.9, bx1 = bx0 + 1.2;
    box([bx0, y + 0.3, tz1 - 0.05], [bx1, y + 0.32, tz1], 'hazard', { solid: false });
    box([bx0, y + 0.1, tz1], [bx1, y + 0.3, pool.z0 + (y === 12 ? 6 : 3)], 'board');
    // back and side rails; the west rail has a gap where the ladder arrives
    railing([tx0, y + 0.3, tz0], [tx1, y + 1.3, tz0 + 0.08]);
    railing([tx0, y + 0.3, tz0], [tx0 + 0.08, y + 1.3, -36.7]);
    railing([tx0, y + 0.3, -35.3], [tx0 + 0.08, y + 1.3, tz1]);
    railing([tx1 - 0.08, y + 0.3, tz0], [tx1, y + 1.3, tz1]);
  }
  sign(30, 13.3, tz0 + 0.3, 0, '12 m', '', 1.8, '#7fd07f');
  sign(30, 7.3, tz0 + 0.3, 0, '6 m', '', 1.4, '#7fd07f');
  // ladder up the west side of the tower
  drawLadder(box, tx0 - 0.02, -36, [-1, 0], 0, 12.3, 'yellow');
  world.addLadder([tx0 - 1.02, 0, -36.5], [tx0 - 0.22, 12.6, -35.5], [-1, 0]);
  world.addZone([tx0, 0, tz0], [tx1, 13.5, tz1], 'tower', 'Dive tower');

  // ── 5. Drop platforms (fall-damage teaching) ──────────────────────────────
  const px = -30, pz = -30;
  const drops = [[3, '#7fd07f', 'safe'], [6, '#e8b423', 'hurts'], [9, '#e07a2a', 'hurts a lot'], [12, '#e05050', 'nearly fatal']];
  drops.forEach(([h, col, note], i) => {
    const x = px - 9 + i * 6;
    boxc(x, 0, pz, 4, h, 4, i % 2 ? 'wall' : 'concrete2');
    box([x - 2, h, pz + 1.7], [x + 2, h + 0.02, pz + 2], 'hazard', { solid: false });
    sign(x, h + 1.2, pz + 1.9, 0, h + ' m', '', 1.6, col);
    // stairs of blocks up the back so every top is reachable
    // tallest nearest the platform, stepping down away from it
    for (let s = 1; h - s * 1.1 > 0.3; s++) boxc(x, 0, pz - 2.5 - (s - 1), 3, h - s * 1.1, 1.0, 'crate');
  });

  // ── 5b. Crawl pipe: prone only ────────────────────────────────────────────
  const qx = -20;
  box([qx - 1.4, 0, 2], [qx - 0.8, 2.2, 13], 'metal');
  box([qx + 0.8, 0, 2], [qx + 1.4, 2.2, 13], 'metal');
  box([qx - 0.8, 0.75, 2], [qx + 0.8, 2.2, 13], 'cont_blue', { uv: 'world' });
  box([qx - 0.8, 0, 13.02], [qx + 0.8, 0.02, 14.0], 'hazard', { solid: false });

  // ── 6. Vehicle dock ─────────────────────────────────────────────────────
  // Where the weapons range used to be: an open shed with marked bays, two
  // personnel trucks and a rank of support motorcycles. They are props until
  // vehicles arrive (M8), but solid, so they are cover.
  const dx0 = 28, dx1 = 52, dz0 = 4, dz1 = 40;
  box([dx0, 0, dz0], [dx1, 0.03, dz1], 'concrete', { solid: false });          // the pad
  // an open-sided shed: a roof on posts over the truck bays
  const roofY = 5.2;
  box([dx0 + 1, roofY, dz0 + 1], [dx1 - 1, roofY + 0.3, dz0 + 21], 'metal');
  for (let x = dx0 + 1.2; x <= dx1 - 1.2; x += 5.5) {
    for (const z of [dz0 + 1.2, dz0 + 20.8]) box([x - 0.18, 0, z - 0.18], [x + 0.18, roofY, z + 0.18], 'metal');
  }
  box([dx0 + 1, 0, dz0 + 0.6], [dx1 - 1, 3.2, dz0 + 1], 'wall');               // back wall of the shed
  for (let x = dx0 + 4; x < dx1 - 2; x += 5.5) lamps.push({ pos: [x, roofY - 0.25, dz0 + 11] });
  // bay lines
  for (let x = dx0 + 1.2; x <= dx1 - 1.2; x += 5.5) box([x - 0.06, 0.03, dz0 + 2], [x + 0.06, 0.05, dz0 + 20], 'hazard', { solid: false });
  // a personnel truck, from boxes: cab, bed, canvas tilt, wheels
  // a truck: what you see is a Kenney model (props.js); what you bump into is
  // a box the same size, so it is still cover
  const props = [];
  const vehicles = [];        // built in code (vehicle_models.js)
  const truck = (x, z) => {
    boxc(x, 0, z - 0.4, 2.6, 3.0, 7.2, 'cont_green', { render: false });
    vehicles.push({ type: 'personnelTruck', pos: [x, 0, z - 0.4], yaw: 180, paint: 'olive' });
  };
  // in the middle of bays one and three, between the posts
  truck(dx0 + 1.2 + 2.75, dz0 + 11);
  truck(dx0 + 1.2 + 2.75 + 11, dz0 + 11);
  // a light 4x4 in bay two
  boxc(dx0 + 1.2 + 2.75 + 5.5, 0, dz0 + 12, 2.1, 2.2, 4.5, 'cont_green', { render: false });
  vehicles.push({ type: 'lightUtility', pos: [dx0 + 1.2 + 2.75 + 5.5, 0, dz0 + 12], yaw: 180, paint: 'sand' });
  // and a couple parked outside the shed
  // a second truck parked outside, and another 4x4
  boxc(dx0 + 22, 0, dz0 + 33.5, 2.6, 3.0, 7.2, 'cont_green', { render: false });
  vehicles.push({ type: 'personnelTruck', pos: [dx0 + 22, 0, dz0 + 33.5], yaw: 0, paint: 'sand' });
  // support motorcycles, in a rank beside the shed
  const bike = (x, z) => {
    boxc(x, 0, z, 0.7, 1.2, 2.1, 'cont_grey', { render: false });
    vehicles.push({ type: 'motorcycle', pos: [x, 0, z], yaw: 160, paint: 'olive' });
  };
  for (let i = 0; i < 3; i++) bike(dx0 + 5 + i * 2.2, dz0 + 27);
  box([dx0 + 3, 0.03, dz0 + 25], [dx0 + 12.5, 0.05, dz0 + 29.5], 'hazard', { solid: false });
  // fuel point and a tyre rack
  boxc(dx1 - 4, 0, dz0 + 27, 1.0, 1.8, 0.7, 'cont_red');
  boxc(dx1 - 4, 1.8, dz0 + 27, 0.4, 0.3, 0.3, 'metal', { solid: false });
  for (let i = 0; i < 4; i++) boxc(dx1 - 9 + i * 0.9, 0, dz0 + 33, 0.3, 0.8, 0.8, 'tyre');
  world.addZone([dx0, 0, dz0], [dx1, 6, dz1], 'dock', 'Vehicle dock');

  // ── Scattered cover crates and barrels ─────────────────────────────────────
  // a mix of markings, so no two stacks look the same
  const scatter = [[4, 2, 'crate_ghost'], [-5, -6, 'crate_upright'], [23, 4, 'crate'], [-20, 20, 'crate_fragile'],
    [22, 22, 'barrel'], [24, 21, 'barrel'], [-2, -18, 'barrel'], [23, -2, 'crate_ghost'],
    [8, -14, 'crate_upright'], [-14, 6, 'crate'], [-24, -18, 'crate_fragile']];
  for (const [x, z, m] of scatter) boxc(x, 0, z, m === 'barrel' ? 0.9 : 1.2, m === 'barrel' ? 1.1 : 1.2, m === 'barrel' ? 0.9 : 1.2, m);

  // ── Crates: press E at one to change what you carry ──────────────────────
  // What you swap out is left in the crate, so a choice costs something.
  const crates = [];
  const crate = (x, z, kind, items, label) => {
    const h = kind === 'gear' ? 0.85 : 1.0, w = kind === 'gear' ? 1.0 : 1.3;
    boxc(x, 0, z, w, h, w, kind === 'weapon' ? 'crate' : 'metal', { tag: 'crate' });
    box([x - w / 2, h, z - w / 2], [x + w / 2, h + 0.02, z + w / 2], 'hazard', { solid: false });
    sign(x, h + 0.55, z + w / 2 + 0.06, 0, label, '', 1.9, kind === 'gear' ? '#6cc4e8' : '#7fd07f');
    const c = new Crate(kind, items, [x, h / 2, z]);
    c.label = label;
    crates.push(c);
    return c;
  };
  // ammo lying about: each crate refills one family's reserve
  // a pointer at the spawn: the crates are behind you



  // ── Penetration booth: what goes through what ──────────────────────────
  // Four lanes, each with a different surface between you and a target.
  {
    const bx = 14, bz = 44;
    const lanes = [
      { x: bx - 6, kind: 'glass', label: 'GLASS', tough: 1 },
      { x: bx - 2, kind: 'thin', label: 'THIN WALL', tough: 2 },
      { x: bx + 2, kind: 'toughened', label: 'TOUGHENED', tough: 3 },
      { x: bx + 6, kind: 'proof', label: 'BULLETPROOF' },
    ];
    box([bx - 8.5, 0, bz + 10], [bx + 8.5, 4, bz + 10.5], 'wall');       // backstop
    box([bx - 8.5, 0, bz], [bx - 8, 4, bz + 10.5], 'wall');
    box([bx + 8, 0, bz], [bx + 8.5, 4, bz + 10.5], 'wall');
    boxc(bx, 0, bz - 0.4, 17, 0.95, 0.5, 'crate', { noClimb: true });     // the bench
    box([bx - 8.5, 0.95, bz - 0.5], [bx + 8.5, 1.22, bz - 0.42], 'fence', { noClimb: true });
    box([bx - 8.5, 1.22, bz - 0.6], [bx + 8.5, 1.32, bz - 0.32], 'rail', { noClimb: true });
    // and above it, a barrier you cannot see or cross, but can shoot through
    box([bx - 8.5, 1.32, bz - 0.5], [bx + 8.5, 4, bz - 0.42], 'barrier', { render: false, noClimb: true, ghost: true });
    for (const L of lanes) {
      // dividers so each lane is its own test
      box([L.x + 1.9, 0, bz + 1], [L.x + 2.1, 3, bz + 10], 'wall');
      const glass = L.kind !== 'thin';
      if (L.kind === 'thin') {
        // clear bulletproof glass all round, with a thin board where you aim
        const pz0 = bz + 4, pz1 = bz + 4.06;
        box([L.x - 1.8, 0, pz0], [L.x - 0.5, 3, pz1], 'glass', { glass: true });
        box([L.x + 0.5, 0, pz0], [L.x + 1.8, 3, pz1], 'glass', { glass: true });
        box([L.x - 0.5, 0, pz0], [L.x + 0.5, 1.05, pz1], 'glass', { glass: true });
        box([L.x - 0.5, 1.75, pz0], [L.x + 0.5, 3, pz1], 'glass', { glass: true });
        box([L.x - 0.5, 1.05, bz + 3.98], [L.x + 0.5, 1.75, bz + 4.1], 'crate', { tough: 2 });
      } else {
        const opts = { glass: true };
        if (L.tough !== undefined) opts.tough = L.tough;
        box([L.x - 1.8, 0, bz + 4], [L.x + 1.8, 3, bz + 4.06], 'glass', opts);
      }
      sign(L.x, 3.35, bz + 3.95, Math.PI, L.label, '', 1.9, glass ? '#6cc4e8' : '#e8b423');
      const t = makeTarget(world, [L.x - 0.45, 0.9, bz + 7.46], [L.x + 0.45, 1.8, bz + 7.54],
        { hp: 30, score: 10, lane: 'pen', respawn: 3 });
      t.penLane = L.kind;
    }
    sign(bx, 2.6, bz - 0.95, Math.PI, 'PENETRATION TEST', 'What goes through what', 3.6, '#7fd07f');
  }


  // ── The Quartermaster: an ammo dump and a counter where anything you have
  // unlocked can be drawn, free, and ammunition restocked without limit ────
  {
    const qx = -7, qz = 49;
    // the counter: an L of bar-top, with a gap to walk behind it
    box([qx - 4, 0, qz - 1.2], [qx + 3, 1.05, qz - 0.6], 'crate');
    box([qx - 4.1, 1.05, qz - 1.3], [qx + 3.1, 1.12, qz - 0.5], 'metal');
    box([qx + 3, 0, qz - 1.2], [qx + 3.6, 1.05, qz + 2.5], 'crate');
    box([qx + 2.9, 1.05, qz - 1.3], [qx + 3.7, 1.12, qz + 2.6], 'metal');
    // shelves of kit behind it, against the south side
    box([qx - 4, 0, qz + 3.6], [qx + 2.5, 2.6, qz + 4.1], 'metal');
    for (let y = 0.6; y < 2.6; y += 0.65) box([qx - 3.9, y, qz + 3.1], [qx + 2.4, y + 0.05, qz + 3.6], 'metal', { solid: false });
    for (let i = 0; i < 7; i++) boxc(qx - 3.4 + i * 0.9, 0.65 + (i % 3) * 0.65, qz + 3.35, 0.6, 0.35, 0.4, i % 2 ? 'cont_green' : 'crate', { solid: false });
    // a canopy over the counter on four posts
    for (const [px, pz] of [[qx - 4.2, qz - 1.6], [qx + 3.9, qz - 1.6], [qx - 4.2, qz + 4.3], [qx + 3.9, qz + 4.3]]) box([px - 0.1, 0, pz - 0.1], [px + 0.1, 3.2, pz + 0.1], 'metal');
    box([qx - 4.5, 3.2, qz - 1.9], [qx + 4.2, 3.35, qz + 4.6], 'tarp');
    lamps.push({ pos: [qx, 3.0, qz + 1] });
    sign(qx - 0.5, 2.2, qz - 1.62, Math.PI, 'QUARTERMASTER', 'Anything unlocked - free', 3.0, '#e8b423');
    // the counter itself is the crate you use (E), and it never runs out
    const q = new Crate('armoury', [], [qx - 0.5, 0.5, qz - 0.9]);
    q.label = 'QUARTERMASTER'; q.infinite = true;
    crates.push(q);
    // the ammo dump beside it: stacked ammunition boxes, pallets, sandbags
    const ax = qx - 10, az = qz + 1;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      box([ax - 1.3 + i * 1.3, 0, az - 1 + j * 1.1], [ax - 0.2 + i * 1.3, 0.14, az - 0.05 + j * 1.1], 'crate');     // pallets
      const marks = ['crate_ghost', 'crate_upright', 'crate_fragile', 'cont_green'];
      for (let k = 0; k < 2 + ((i + j) % 2); k++) boxc(ax - 0.75 + i * 1.3, 0.14 + k * 0.42, az - 0.52 + j * 1.1, 0.95, 0.4, 0.6, marks[(i + j + k) % marks.length]);
    }
    for (let i = 0; i < 9; i++) boxc(ax - 2.4 + (i % 5) * 0.9 + (i > 4 ? 0.45 : 0), (i > 4 ? 0.34 : 0), az + 1.8, 0.85, 0.34, 0.5, 'tarp');
    box([ax - 2.2, 0, az - 1.4], [ax + 2.4, 1.9, az + 1.3], 'tarp', { render: false });   // one box for the lot
    sign(ax, 2.2, az - 1.45, Math.PI, 'AMMUNITION DUMP', '', 3.0, '#e05050');
  }

  // ── Beyond the wall: a high desert plateau ───────────────────────────────
  // Everything here is far away and never walked on: a floor to the horizon,
  // ridges and mesas round the edge, and the road the trucks came in by.
  {
    // a ring of floor round the facility, never under it: the old single slab
    // sat above the pool's surface and inside the course's floors
    // The floor comes right up to the outside of the wall (61 m) and round
    // the stairwell's shell. Only the yard and that shell are left clear, or
    // the desert shows up inside them.
    const F = 61;
    // the stairwell's shell, exactly (x -74.4..-60, z -3.6..3.6): the old hole
    // was 5.6 m longer and 5 m wider, and left three strips of void round it
    const SX0 = -74.4, SZ0 = -3.6, SZ1 = 3.6;
    box([-900, -0.9, -900], [900, -0.5, -F], 'desert', { solid: false });
    box([-900, -0.9, F], [900, -0.5, 900], 'desert', { solid: false });
    box([F, -0.9, -F], [900, -0.5, F], 'desert', { solid: false });
    box([-900, -0.9, -F], [SX0, -0.5, F], 'desert', { solid: false });
    box([SX0, -0.9, -F], [-F, -0.5, SZ0], 'desert', { solid: false });
    box([SX0, -0.9, SZ1], [-F, -0.5, F], 'desert', { solid: false });
    // the access road, running north from the hangar doors out to nothing
    box([30, -0.48, 64], [46, -0.44, 900], 'asphalt', { solid: false });
    box([28.6, -0.47, 64], [30, -0.43, 900], 'desert', { solid: false });
    box([46, -0.47, 64], [47.4, -0.43, 900], 'desert', { solid: false });
    // ridges: a ring of low, long blocks, stepped so they read as hills
    let seed2 = 99991;
    const rnd2 = () => { seed2 = (seed2 * 16807) % 2147483647; return seed2 / 2147483647; };
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 14) {
      const d = 210 + rnd2() * 120;
      if (Math.abs(a - Math.PI / 2) < 0.4) continue;      // leave the road a way out
      const cx = Math.cos(a) * d, cz = Math.sin(a) * d;
      const w = 60 + rnd2() * 90, h = 12 + rnd2() * 26, dep = 30 + rnd2() * 40;
      const yaw = a + Math.PI / 2;
      const c = Math.cos(yaw), s = Math.sin(yaw);
      for (let k = 0; k < 3; k++) {
        const kw = w * (1 - k * 0.22), kd = dep * (1 - k * 0.25), ky = h * (k / 3);
        const ex = Math.abs(c) * kw / 2 + Math.abs(s) * kd / 2;
        const ez = Math.abs(s) * kw / 2 + Math.abs(c) * kd / 2;
        box([cx - ex, ky - 1, cz - ez], [cx + ex, ky + h / 3, cz + ez], k > 1 ? 'rock' : 'desert', { solid: false });
      }
    }
    // three mesas, further out and taller, to break the skyline
    for (const [mx, mz, mw, mh] of [[-420, -260, 170, 70], [380, -330, 210, 86], [120, 520, 190, 62]]) {
      for (let k = 0; k < 4; k++) {
        const kw = mw * (1 - k * 0.12);
        box([mx - kw / 2, (mh * k) / 4 - 2, mz - kw / 2], [mx + kw / 2, (mh * (k + 1)) / 4, mz + kw / 2], k > 2 ? 'rock' : 'desert', { solid: false });
      }
    }
    // a radio mast and a water tower on the near ridge, for a sense of scale
    for (let k = 0; k < 5; k++) box([-142 - 0.6 + k * 0.1, 8 + k * 7, 150 - 0.6 + k * 0.1, ], [-142 + 0.6 - k * 0.1, 15 + k * 7, 150 + 0.6 - k * 0.1], 'metal', { solid: false });
    box([96, 0, -160], [100, 22, -156], 'metal', { solid: false });
    box([92, 22, -164], [104, 30, -152], 'cont_grey', { solid: false });
  }

  // ── Perimeter gangway: a walkway round the inside of the wall, 5 m up, with
  // ladders up to it at several points ─────────────────────────────────────
  {
    const G = 5.0, gw = 1.0, E2 = E;
    const walk = (x0, z0, x1, z1) => box([x0, G - 0.2, z0], [x1, G, z1], 'grating');
    walk(-E2 + gw, -E2, E2 - gw, -E2 + gw);                 // north
    walk(-E2, -E2, -E2 + gw, E2);                           // west, full length (takes the corners)
    walk(E2 - gw, -E2, E2, E2);                             // east
    walk(-E2 + gw, E2 - gw, 24.4, E2);                      // south, either side of the hangar
    walk(51.6, E2 - gw, E2 - gw, E2);
    // brackets under it every few metres
    for (let t = -E2 + 3; t < E2; t += 6) {
      box([t - 0.06, G - 0.8, -E2], [t + 0.06, G - 0.2, -E2 + gw], 'metal', { solid: false });
      box([-E2, G - 0.8, t - 0.06], [-E2 + gw, G - 0.2, t + 0.06], 'metal', { solid: false });
      box([E2 - gw, G - 0.8, t - 0.06], [E2, G - 0.2, t + 0.06], 'metal', { solid: false });
      if (t < 24 || t > 52) box([t - 0.06, G - 0.8, E2 - gw], [t + 0.06, G - 0.2, E2], 'metal', { solid: false });
    }
    // ladders: [x, z, face] - the face points at the person climbing
    // (clear of the floodlight posts, which stand every 24 m along each wall)
    const ladders = [[-E2 + gw, 44, [1, 0]], [-E2 + gw, -44, [1, 0]], [44, -E2 + gw, [0, 1]],
      [E2 - gw, -30, [-1, 0]], [E2 - gw, 30, [-1, 0]], [-30, E2 - gw, [0, -1]], [56, E2 - gw, [0, -1]]];
    const gaps = [];
    for (const [lx, lz, f] of ladders) {
      if (f[0]) {
        const x = lx + (f[0] > 0 ? 0 : -0.08);
        drawLadder(box, f[0] > 0 ? lx : lx - 0.02, lz, f, 0, G, 'iron');
        // the climbing space starts in front of the rungs, not in them
        world.addLadder(f[0] > 0 ? [lx + 0.08, 0, lz - 0.5] : [lx - 0.88, 0, lz - 0.5], f[0] > 0 ? [lx + 0.88, G + 0.3, lz + 0.5] : [lx - 0.08, G + 0.3, lz + 0.5], f);
      } else {
        const z = lz + (f[1] > 0 ? 0 : -0.08);
        drawLadder(box, lx, f[1] > 0 ? lz : lz - 0.02, f, 0, G, 'iron');
        world.addLadder(f[1] > 0 ? [lx - 0.5, 0, lz + 0.08] : [lx - 0.5, 0, lz - 0.88], f[1] > 0 ? [lx + 0.5, G + 0.3, lz + 0.88] : [lx + 0.5, G + 0.3, lz - 0.08], f);
      }
      gaps.push([lx, lz]);
    }
    // railings on the inner edge, broken where a ladder comes up
    const rail = (x0, z0, x1, z1) => {
      box([x0, G, z0], [x1, G + 1.05, z1], 'rail', { render: false, noClimb: true });
      box([x0, G + 1.0, z0], [x1, G + 1.06, z1], 'rail', { solid: false });
      box([x0, G + 0.5, z0], [x1, G + 0.54, z1], 'rail', { solid: false });
    };
    const railRun = (axis, fixed, a0, a1) => {
      const stops = gaps.filter((g) => Math.abs((axis === 'x' ? g[1] : g[0]) - fixed) < 0.01).map((g) => (axis === 'x' ? g[0] : g[1])).sort((p, q) => p - q);
      let a = a0;
      for (const st of stops) { if (st - 0.6 > a) axis === 'x' ? rail(a, fixed - 0.04, st - 0.6, fixed + 0.04) : rail(fixed - 0.04, a, fixed + 0.04, st - 0.6); a = st + 0.6; }
      if (a < a1) axis === 'x' ? rail(a, fixed - 0.04, a1, fixed + 0.04) : rail(fixed - 0.04, a, fixed + 0.04, a1);
    };
    // and a fence on the wall side, so you cannot walk off outwards either
    const outer = (x0, z0, x1, z1) => {
      box([x0, G, z0], [x1, G + 1.4, z1], 'fence', { solid: false });
      box([x0 - 0.02, G + 1.35, z0 - 0.02], [x1 + 0.02, G + 1.42, z1 + 0.02], 'rail', { solid: false });
    };
    outer(-E2, -E2, E2, -E2 + 0.06);
    outer(-E2, -E2, -E2 + 0.06, E2);
    outer(E2 - 0.06, -E2, E2, E2);
    outer(-E2, E2 - 0.06, 24.4, E2);
    outer(51.6, E2 - 0.06, E2, E2);
    railRun('x', -E2 + gw, -E2 + gw, E2 - gw);
    railRun('z', -E2 + gw, -E2 + gw, E2 - gw);
    railRun('z', E2 - gw, -E2 + gw, E2 - gw);
    railRun('x', E2 - gw, -E2 + gw, 24.4);
    railRun('x', E2 - gw, 51.6, E2 - gw);
  }

  // ── A watchtower ─────────────────────────────────────────────────────────
  {
    const tx = -40, tz = 40, th = 12.0, hw = 1.8;
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box([tx + sx * hw - 0.12, 0, tz + sz * hw - 0.12], [tx + sx * hw + 0.12, th + 2.6, tz + sz * hw + 0.12], 'metal');
    for (const y of [2.3, 4.6]) {           // cross-bracing
      box([tx - hw, y, tz - hw - 0.05], [tx + hw, y + 0.1, tz - hw + 0.05], 'metal', { solid: false });
      box([tx - hw - 0.05, y, tz - hw], [tx - hw + 0.05, y + 0.1, tz + hw], 'metal', { solid: false });
      box([tx + hw - 0.05, y, tz - hw], [tx + hw + 0.05, y + 0.1, tz + hw], 'metal', { solid: false });
    }
    box([tx - hw - 0.2, th - 0.2, tz - hw - 0.2], [tx + hw + 0.2, th, tz + hw + 0.2], 'grating');
    // a waist-high wall round the platform, open where the ladder arrives
    box([tx - hw - 0.2, th, tz - hw - 0.2], [tx + hw + 0.2, th + 1.1, tz - hw], 'crate');
    box([tx - hw - 0.2, th, tz - hw], [tx - hw, th + 1.1, tz + hw + 0.2], 'crate');
    box([tx + hw, th, tz - hw], [tx + hw + 0.2, th + 1.1, tz + hw + 0.2], 'crate');
    box([tx - hw, th, tz + hw], [tx - 0.5, th + 1.1, tz + hw + 0.2], 'crate');
    box([tx + 0.5, th, tz + hw], [tx + hw, th + 1.1, tz + hw + 0.2], 'crate');
    box([tx - hw - 0.4, th + 2.6, tz - hw - 0.4], [tx + hw + 0.4, th + 2.8, tz + hw + 0.4], 'tarp');   // roof
    lamps.push({ pos: [tx, th + 2.5, tz] });
    // the ladder up the south face, climbed from the south
    drawLadder(box, tx, tz + hw + 0.2, [0, 1], 0, th, 'yellow');
    world.addLadder([tx - 0.5, 0, tz + hw + 0.28], [tx + 0.5, th + 0.3, tz + hw + 1.08], [0, 1]);

  }

  // security turrets on the hangar frame: Ghost's own, so they watch but do
  // not fire on Ghost or its allies
  const securityTurrets = [{ pos: [25.2, 6.4, E - 1.0] }, { pos: [50.8, 6.4, E - 1.0] }];

  const level = { world, pieces, signs, lamps, water, pool, crates, props, vehicles, securityTurrets,
    // Baked lighting: only what reaches underground - the course,
    // the galleries and the slabs over them. Rhys's Chromebook, M6.8.0 with
    // ?bake (the whole yard): 6.4 s to bake, the course at 31 fps against 15
    // live, the open yard about the same either way. So the sunlit yard
    // stays live and the time goes where the lamps are. ?bake=all bakes the
    // lot, to compare.
    bake: true, bakeRegion: [-275, -65, 65, 95], bakeCell: 40, bakeBelow: -0.5,
    bakeDensity: 5, bakeMaxRes: 512 };   // coarser than Meridian House: a quicker bake
  // the training course runs west of the yard and lets out into it
  buildTutorial(level);
  buildWeapons(level);
  // (Rhys: "Back to the start of this section" in Weapons Training put
  // him on the range's roof - it had its own spot, from before the course went
  // underground) where each part of the course starts: one place, for the
  // menu, the skip buttons and starting a section again
  level.sectionStarts = {
    movement: { pos: level.tutorialSpawn.slice(), yaw: level.tutorialYaw },
    weapons: { pos: level.weaponsStart.pos.slice(), yaw: level.weaponsStart.yaw },
  };
  // its doors hung one way, as at the hotel
  hangDoors(level.world, level.swingDoors || []);
  world.spawn = { pos: [0, 0, 30], yaw: 0 };      // Yard 7 is still the default
  return level;
}
