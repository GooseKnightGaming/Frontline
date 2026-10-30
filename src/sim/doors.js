// FRONTLINE - ordinary doors: a leaf on a hinge, opened and shut with E.
//
// Pure logic, like the rest of src/sim. Collision is axis-aligned boxes, so
// a door is only ever in one of two places as far as bodies and bullets are
// concerned: across its doorway (shut) or flat against the wall beside it
// (open). The swing in between is drawn, not simulated - it takes a third of
// a second, and nothing is allowed to be where the leaf is going.
//
// A door is described by the wall it sits in:
//   plane: 'x' (the wall runs along z at x = at) or 'z' (along x at z = at)
//   wall:  [near, far] - the wall's thickness along the normal
//   from:  the hinge edge, along the wall;  to: the latch edge
//   y0, h: the bottom of the leaf and its height

export const SWING_TIME = 0.35;       // seconds to swing open or shut
export const REACH = 1.6;             // how close you need to be to use one

export class SwingDoor {
  constructor(world, def) {
    // build: 'domestic' (kicks open easily), 'sturdy', or 'reinforced' (no
    // kick opens it; a charge or its key does). locked: E will not open it.
    this.def = Object.assign({ thick: 0.06, tough: 2, label: 'door', build: 'domestic', mat: 'door' }, def);
    this.locked = !!this.def.locked;
    this.blown = false;
    this.n = this.def.plane === 'x' ? 0 : 2;       // the wall's normal
    this.a = 2 - this.n;                             // along the wall
    this.open = false;
    this.side = 1;                                   // which way it swung, along the normal
    this.swing = 0;                                  // 0 shut .. 1 open, for drawing
    // a domestic door stops a body but not a rifle round
    this.solid = world.addSolid(...this.shutBox(), 'hdoor', { tough: this.def.tough });
  }

  get width() { return Math.abs(this.def.to - this.def.from); }
  get centre() {
    const c = [0, this.def.y0 + this.def.h / 2, 0];
    c[this.n] = this.def.at; c[this.a] = (this.def.from + this.def.to) / 2;
    return c;
  }

  shutBox() {
    const d = this.def, min = [0, d.y0, 0], max = [0, d.y0 + d.h, 0];
    min[this.n] = d.at - d.thick / 2; max[this.n] = d.at + d.thick / 2;
    // (M6.17.11, Rhys: the Yellows saw the reds through the Tournament Room's locked doors)
    // the two leaves of a pair met with a 2 cm slit between them - and the officer inside
    // stands on its line. The latch edge now reaches 2 cm past it: a pair overlaps, a
    // single door tucks into its jamb.
    const over = 0.02 * Math.sign(d.to - d.from);
    min[this.a] = Math.min(d.from, d.to + over); max[this.a] = Math.max(d.from, d.to + over);
    return [min, max];
  }
  // flat against the wall on one side, standing out from the hinge edge
  openBox(side) {
    const d = this.def, min = [0, d.y0, 0], max = [0, d.y0 + d.h, 0];
    if (side > 0) { min[this.n] = d.wall[1]; max[this.n] = d.wall[1] + this.width; }
    else { min[this.n] = d.wall[0] - this.width; max[this.n] = d.wall[0]; }
    const dir = Math.sign(d.to - d.from);
    const edge = [d.from, d.from + dir * d.thick];
    min[this.a] = Math.min(...edge); max[this.a] = Math.max(...edge);
    return [min, max];
  }

  // within reach, and roughly level with it
  near(pos) {
    const c = this.centre;
    if (pos[1] < this.def.y0 - 1 || pos[1] > this.def.y0 + this.def.h) return false;
    return Math.hypot(pos[0] - c[0], pos[2] - c[2]) < REACH;
  }

  // Open it away from whoever is using it, or shut it. body: [min, max] of
  // the person, who must not be standing where the leaf is going.
  // Returns 'opened', 'shut' or 'blocked'.
  use(pos, body) {
    if (this.blown) return 'blown';            // nothing left to open or shut
    if (this.locked) return 'locked';
    const overlaps = (b) => body && body[0][0] < b[1][0] && body[1][0] > b[0][0] &&
      body[0][1] < b[1][1] && body[1][1] > b[0][1] && body[0][2] < b[1][2] && body[1][2] > b[0][2];
    if (this.open) {
      const b = this.shutBox();
      if (overlaps(b)) return 'blocked';
      this.set(false, this.side, b);
      return 'shut';
    }
    // (M6.13.0, Rhys: "most doors IRL only open one way") a door hung to
    // swing one way opens that way only, pulled or pushed
    if (this.def.swingTo) {
      const b = this.openBox(this.def.swingTo);
      if (overlaps(b)) return 'blocked';
      this.set(true, this.def.swingTo, b);
      return 'opened';
    }
    // away from you; the other way if you are standing in its path
    const away = pos[this.n] < this.def.at ? 1 : -1;
    for (const side of [away, -away]) {
      const b = this.openBox(side);
      if (!overlaps(b)) { this.set(true, side, b); return 'opened'; }
    }
    return 'blocked';
  }

  unlock() { this.locked = false; }

  // (M6.13.0) Pulling a one-way door towards you: where to step so the leaf
  // swings past you - straight back from the doorway until you are clear of
  // its arc (the leaf's length from the hinge, plus your own width). null if
  // you are already clear, or it does not swing your way.
  stepClear(pos, r) {
    const st = this.def.swingTo;
    if (!st) return null;
    const off = (pos[this.n] - this.def.at) * st;           // how far out on its swing side
    if (off <= 0) return null;
    const dir = Math.sign(this.def.to - this.def.from);
    const u = (pos[this.a] - this.def.from) * dir;          // along the leaf from the hinge
    const R = this.width + (r || 0.3) + 0.05;
    if (u > R || u < -(r || 0.3)) return null;
    // (a step back, not a retreat: at most 1.1 m - the last of the swing
    // brushes past you rather than marching you across the corridor)
    const need = Math.min(1.1, Math.sqrt(Math.max(0, R * R - Math.max(0, u) * Math.max(0, u))));
    if (off >= need) return null;
    const to = pos.slice(); to[this.n] = this.def.at + st * need;
    return to;
  }

  // (M6.13.0, Rhys: open it, come through, shut it - one move) Where to walk
  // to slip through this doorway (both leaves of a pair, if `pair`): a step
  // in line with the opening, then on through to the far side.
  slipPath(pos, pair) {
    const ds = [this].concat(pair || []);
    const lo = Math.min(...ds.map((d) => Math.min(d.def.from, d.def.to))), hi = Math.max(...ds.map((d) => Math.max(d.def.from, d.def.to)));
    const mid = (lo + hi) / 2, side = pos[this.n] < this.def.at ? 1 : -1;      // the far side from you
    const y = this.def.y0;
    const pt = (off) => { const p = [0, y, 0]; p[this.a] = mid; p[this.n] = this.def.at + side * off; return p; };
    return [pt(-0.75), pt(0.95)];
  }

  // Forced open. how: 'kick' - the latch breaks, it flies open away from you,
  // and it can be pushed shut again; 'blast' - a charge takes it off its
  // hinges, gone for good, and it can never be shut (Rhys, M6.0.3). A
  // reinforced door can only be blasted.
  // Force this door, and its other leaf with it if it is one of a pair
  // (M6.9.3, Rhys: forcing one of a locked pair should force both).
  breachWith(all, from, how) {
    this.breach(from, how);
    if (!this.def.pair) return;
    for (const d of all || []) if (d !== this && d.def.pair === this.def.pair && !d.blown) d.breach(from, how);
  }
  breach(from, how) {
    // (M6.19.4, Rhys: "massive closing blast doors that ordinary C5 cannot breach") nothing you carry opens one:
    // its controls do (or a way round)
    if (this.def.blastDoor) return 'held';
    this.locked = false;
    if (how === 'blast' || this.def.build === 'reinforced') {
      this.blown = true; this.open = true; this.swing = 1;
      this.solid.disabled = true;
      return 'blown';
    }
    const away = from[this.n] < this.def.at ? 1 : -1;
    this.set(true, away);
    this.swing = Math.max(this.swing, 0.6);          // it flies, rather than swings
    return 'opened';
  }

  set(open, side, box) {
    this.open = open; this.side = side;
    box = box || (open ? this.openBox(side) : this.shutBox());
    this.solid.min = box[0].slice(); this.solid.max = box[1].slice();
  }

  step(dt) {
    const want = this.open ? 1 : 0;
    const k = dt / SWING_TIME;
    this.swing = want > this.swing ? Math.min(want, this.swing + k) : Math.max(want, this.swing - k);
  }

  // The leaf's turn about the hinge for drawing, in radians, with the model's
  // local +z running from the hinge to the latch edge. Yaw 0 points +z and
  // +pi/2 points +x (the sign convention used everywhere else).
  yaw() {
    const d = this.def, dir = Math.sign(d.to - d.from);
    const along = [0, 0]; along[this.a === 0 ? 0 : 1] = dir;        // [x, z]
    const out = [0, 0]; out[this.n === 0 ? 0 : 1] = this.side;
    const shut = Math.atan2(along[0], along[1]);
    let open = Math.atan2(out[0], out[1]);
    // the short way round
    while (open - shut > Math.PI) open -= Math.PI * 2;
    while (open - shut < -Math.PI) open += Math.PI * 2;
    const u = this.swing * this.swing * (3 - 2 * this.swing);
    return shut + (open - shut) * u;
  }

  // the hinge, for placing the drawn leaf
  hinge() {
    const h = [0, this.def.y0, 0];
    h[this.n] = this.def.at; h[this.a] = this.def.from;
    return h;
  }
}

// (M6.13.6, Rhys: the doors on the other levels should work the same as the
// Riverside Hotel's) Which way to hang a door built by hand rather than from a
// map: into the room - the smaller of the two spaces it joins, as the hotel's
// doors do (into a room off a corridor, in from outside) - and only to a side
// where the open leaf has clear wall to lie against.
// (M6.13.7, Rhys: in Meridian House the doors opened OUT into the corridor)
// "smaller" had been judged by how near the walls are, and a corridor 3 m
// wide is nearer-walled than an office; now it is floor area: a flood out
// from each side of the doorway, just under the lintel (over the furniture),
// stopped by walls and by the shut doors. A corridor runs on into the lobby
// and the stairs; an office is closed. Both sides past the cap (the street,
// a range hall): the nearer walls decide, as before.
// Returns 1 or -1, or undefined (it stays a two-way door) if neither side has
// room. People and targets are not obstacles.
export const FLOOD = { cell: 0.5, cap: 2400 };
export function chooseSwing(world, door, doors, cache) {
  const mine = new Set((doors || [door]).map((d) => d.solid));
  const static_ = (s) => !s.disabled && !mine.has(s) && !s.person && !s.target && !s.ghost;
  const roomFor = (side) => {
    const [mn, mx] = door.openBox(side);
    const e = 0.02, lo = mn.map((v) => v + e), hi = mx.map((v) => v - e);
    return !world.hits(lo, hi).some(static_);
  };
  const ok = [1, -1].filter(roomFor);
  if (!ok.length) return undefined;
  if (ok.length === 1) return ok[0];
  const c = door.centre, n = door.n, a = door.a;
  // a thin band just under the lintel: walls and shut doors stop it, desks do not
  const y0 = door.def.y0 + Math.min(1.95, door.def.h - 0.12), y1 = y0 + 0.06;
  const C = FLOOD.cell, h = C * 0.45;
  // (M6.14.0, the factory's 69 doors took 2.7 s) the band's blocked cells,
  // marked once - every wall and shut door rasterised onto the 0.5 m grid -
  // and shared by every door on that floor (cache: one per hangDoors)
  const bandKey = y0.toFixed(2);
  let grid = cache && cache[bandKey];
  if (!grid) {
    grid = new Set();
    for (const s of world.solids) {
      if (s.disabled || s.person || s.target || s.ghost || !(s.max[1] > y0 && s.min[1] < y1)) continue;
      const i0 = Math.floor((s.min[0] - h) / C) + 1, i1 = Math.ceil((s.max[0] + h) / C) - 1;
      const k0 = Math.floor((s.min[2] - h) / C) + 1, k1 = Math.ceil((s.max[2] + h) / C) - 1;
      if ((i1 - i0 + 1) * (k1 - k0 + 1) > 400000) continue;       // nothing that big stands in a band under a lintel
      for (let i = i0; i <= i1; i++) for (let k = k0; k <= k1; k++) grid.add(i + ',' + k);
    }
    if (cache) cache[bandKey] = grid;
  }
  const blocked = (x, z) => grid.has(Math.round(x / C) + ',' + Math.round(z / C));
  const area = (side) => {
    const o = [c[0], 0, c[2]]; o[n] = side > 0 ? door.def.wall[1] + C : door.def.wall[0] - C;
    const seen = new Set(), q = [[Math.round(o[0] / C), Math.round(o[2] / C)]];
    if (blocked(q[0][0] * C, q[0][1] * C)) return 0;
    seen.add(q[0].join(','));
    for (let i = 0; i < q.length; i++) {
      if (seen.size >= FLOOD.cap) return Infinity;
      const [i0, k0] = q[i];
      for (const [di, dk] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const key = (i0 + di) + ',' + (k0 + dk);
        if (seen.has(key) || blocked((i0 + di) * C, (k0 + dk) * C)) continue;
        seen.add(key); q.push([i0 + di, k0 + dk]);
      }
    }
    return seen.size;
  };
  const A1 = area(1), A2 = area(-1);
  if (A1 !== A2) return A1 < A2 ? 1 : -1;
  // as open as each other: the side with the nearer walls
  const enclosed = (side) => {
    const o = [c[0], door.def.y0 + 1.3, c[2]]; o[n] = side > 0 ? door.def.wall[1] + 0.4 : door.def.wall[0] - 0.4;
    let sum = 0;
    for (let k = -3; k <= 3; k++) {
      const ang = k * Math.PI / 8, dir = [0, 0, 0];
      dir[n] = side * Math.cos(ang); dir[a] = Math.sin(ang);
      const hit = world.raycast(o, dir, 30, (s) => !static_(s));
      sum += hit ? hit.t : 30;
    }
    return sum;
  };
  return enclosed(1) <= enclosed(-1) ? 1 : -1;
}
// hang every door in `doors` that has no swing of its own
export function hangDoors(world, doors) {
  const cache = {};
  for (const d of doors) if (d.def.swingTo === undefined && !d.def.twoWay) d.def.swingTo = chooseSwing(world, d, doors, cache);
}

// (M6.13.0, Rhys: "open it, come through, close it - all in one swift move")
// Started when E opens a door. Keep E held a moment and you walk on through,
// in line with the opening, and pull it shut behind you; let go first and it
// was only opening a door. Also, for a one-way door pulled towards you, the
// small step back out of its swing (`back`). Moves the player directly, each
// step only into free space; step() returns 'through', 'cancel', 'blocked',
// 'stepped' or null (still going).
export const SLIP_HOLD = 0.3;
export class DoorMove {
  constructor(door, pair, back) {
    this.door = door; this.pair = pair || []; this.back = back || null;
    this.t = 0; this.stage = back ? 'back' : 'wait'; this.i = 0; this.path = null;
  }
  // true while it is moving you (your own walking is set aside)
  get moving() { return this.stage === 'go' || this.stage === 'back'; }
  walk(player, q, speed, dt) {
    const dx = q[0] - player.pos[0], dz = q[2] - player.pos[2], d = Math.hypot(dx, dz);
    if (d < 0.02) return true;
    const s = Math.min(d, speed * dt), np = [player.pos[0] + dx / d * s, player.pos[1], player.pos[2] + dz / d * s];
    if (!player.free(np, player.h)) return null;
    player.pos = np; player.vel[0] = 0; player.vel[2] = 0;
    return d - s < 0.02;
  }
  step(dt, player, held) {
    if (this.stage === 'back') {
      const r = this.walk(player, this.back, 3.2, dt);
      if (r === null || (this.t += dt) > 0.6 || r) { this.stage = 'wait'; this.t = 0; return held ? null : 'stepped'; }
      return null;
    }
    if (this.stage === 'wait') {
      if (!held) return 'cancel';
      if ((this.t += dt) < SLIP_HOLD) return null;
      this.path = this.door.slipPath(player.pos, this.pair);
      this.stage = 'go'; this.i = 0;
    }
    const speed = player.stance === 2 ? 0.9 : player.stance === 1 ? 1.5 : 2.3;
    const r = this.walk(player, this.path[this.i], speed, dt);
    if (r === null) return 'blocked';
    if (r && ++this.i >= this.path.length) {
      // through: pull it (and its pair) shut behind you
      for (const d of [this.door].concat(this.pair)) if (d.open && !d.blown) d.use(player.pos, player.box());
      this.stage = 'done';
      return 'through';
    }
    return null;
  }
}
