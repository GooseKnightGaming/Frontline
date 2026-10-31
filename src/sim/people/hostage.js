// FRONTLINE - hostages (the Riverside Hotel: "found, freed,
// escorted to the police, kept alive").
// A hostage sits bound where the reds left him. E frees him (a moment's work,
// standing over him); then he follows you - the stairs, the corridors, out of
// the front doors - keeping a couple of metres back, and runs to catch up if
// you get ahead. E again tells him to wait where he is, or to come on. Bring
// him to the police cars in the street and he is safe. He can be shot - by you
// too: a stray round kills him the same as anyone.
// Pure logic: no engine.
import { makeTarget } from '../arms/weapons.js';

// how near the end of a ladder a hostage must be to take it
export const LADDER_TAKE = 0.7;
export const HOSTAGE = {
  radius: 0.3, height: 1.75,
  reach: 1.6,          // close enough to free him, or speak to him
  untie: 1.4,          // seconds to cut him loose
  keep: 2.2,           // how far behind you he walks
  run: 6,              // further than this and he hurries
  walk: 2.6, hurry: 4.6,
  hp: 30,
};

export class Hostage {
  constructor(world, def) {
    this.world = world;
    this.id = def.id;
    this.label = def.label || def.id;
    this.pos = def.pos.slice();
    this.yaw = def.yaw || 0;
    this.state = 'held';           // held | following | waiting | rescued | dead
    this.freeT = 0;                // how far through cutting him loose (0..1)
    this.clock = 0;
    this.path = null;
    this.speed = 0;
    const b = this.box();
    this.maxHp = def.hp || HOSTAGE.hp;
    this.target = makeTarget(world, b[0], b[1], { hp: this.maxHp, respawn: 1e9, score: 0 });
    this.target.solid.person = true;
    this.target.hostage = this;
    this.events = [];
  }

  box() {
    const r = HOSTAGE.radius, h = this.state === 'held' ? 1.1 : HOSTAGE.height;   // sitting, bound
    return [[this.pos[0] - r, this.pos[1], this.pos[2] - r], [this.pos[0] + r, this.pos[1] + h, this.pos[2] + r]];
  }
  moveBody() {
    const [lo, hi] = this.box(), t = this.target;
    t.solid.min = lo.slice(); t.solid.max = hi.slice();
    t.min = lo.slice(); t.max = hi.slice();
    t.centre = [this.pos[0], (lo[1] + hi[1]) / 2, this.pos[2]];
  }

  get alive() { return this.state !== 'dead'; }
  get free() { return this.state === 'following' || this.state === 'waiting'; }

  // within reach of you, on your floor
  near(you) {
    return Math.abs(you[1] - this.pos[1]) < 1.2 && Math.hypot(you[0] - this.pos[0], you[2] - this.pos[2]) < HOSTAGE.reach;
  }

  // E held over him: cutting him loose. Returns true the moment he is free.
  work(dt) {
    if (this.state !== 'held') return false;
    this.freeT = Math.min(1, this.freeT + dt / HOSTAGE.untie);
    if (this.freeT >= 1) {
      this.state = 'following';
      this.events.push({ type: 'freed', id: this.id });
      this.moveBody();
      return true;
    }
    return false;
  }
  // E let go before he was free: the cutting stops where it got to
  // E on a freed hostage: wait here / come on
  order() {
    if (this.state === 'following') { this.state = 'waiting'; this.path = null; this.speed = 0; this.events.push({ type: 'wait', id: this.id }); }
    else if (this.state === 'waiting') { this.state = 'following'; this.events.push({ type: 'follow', id: this.id }); }
  }

  // ctx: { nav, you: { pos }, safe: (pos) => bool, pathBudget }
  step(dt, ctx) {
    this.clock += dt;
    this.speed = 0;
    this.climbing = false;
    if (this.state === 'dead' || this.state === 'rescued') return;
    if (this.target.down || this.target.hp <= 0) {
      this.state = 'dead'; this.target.solid.disabled = true;
      this.events.push({ type: 'killed', id: this.id });
      return;
    }
    if (this.pos[1] < -3) this.wentSewer = true;                // (for the trophies)
    if (this.free && ctx.safe && ctx.safe(this.pos)) {
      this.unhurt = this.target.hp >= (this.maxHp || HOSTAGE.hp);
      this.state = 'rescued'; this.target.solid.disabled = true;
      this.events.push({ type: 'rescued', id: this.id });
      return;
    }
    if (this.state !== 'following' || !ctx.you) return;
    // (Rhys: he struggled to find the stairs) where you last stood on
    // open floor: when you are somewhere a route cannot start or end (a
    // ladder, part-way up a flight, the lift car), he heads for that
    let you = ctx.you.pos;
    if (ctx.nav && ctx.nav.cellAt) {
      const c = ctx.nav.cellAt(you);
      if (c && ctx.nav.isOpen(c)) this.lastYou = you.slice();
      else if (this.lastYou) you = this.lastYou;
    }
    // (Rhys: he took the stairs and met you at the bottom) the lift:
    // you in the car with its doors open on his floor - he walks in with you;
    // in it with you, he rides; you step out, he follows you out
    if (ctx.lift && this.liftStep(dt, ctx, you)) { this.moveBody(); return; }
    const d = Math.hypot(you[0] - this.pos[0], you[2] - this.pos[2]), dy = Math.abs(you[1] - this.pos[1]);
    if (d < HOSTAGE.keep && dy < 1.2 && !this.path) {
      // (Rhys: "they stand perfectly in the doorway so you can't
      // re-enter the lift") nobody waits in front of the lift's doors
      if (ctx.lift && this.clearOfLift(ctx, dt)) { this.moveBody(); return; }
      this.turnTo(Math.atan2(-(you[0] - this.pos[0]), -(you[2] - this.pos[2])), dt); return;
    }
    const speed = d > HOSTAGE.run || dy > 1.2 ? HOSTAGE.hurry : HOSTAGE.walk;
    // re-plan towards you at most twice a second, and when the old plan is used up
    // (not mid-flight on a stair: off the floors, a fresh plan has nowhere to start from)
    const onFloor = !ctx.nav || !ctx.nav.cellAt || (() => { const c = ctx.nav.cellAt(this.pos); return c && ctx.nav.isOpen(c) && Math.abs(ctx.nav.floors[c.f].y - this.pos[1]) < 0.2; })();
    if (!this.path || (this.clock > (this.repathAt || 0) && onFloor)) {
      if (ctx.nav && (!ctx.pathBudget || ctx.pathBudget.left > 0)) {
        if (ctx.pathBudget) ctx.pathBudget.left--;
        this.path = this.planTo(ctx, you);
        this.pathI = 0; this.repathAt = this.clock + 0.5;
        if (!this.path || !this.path.length) { this.path = null; return; }
      } else if (!ctx.nav) { this.path = [you.slice()]; this.pathI = 0; }
      else return;
    }
    let left = speed * dt;
    while (left > 0 && this.path && this.pathI < this.path.length) {
      const q = this.path[this.pathI];
      // stop short of you - but never part-way up a flight
      if (onFloor && this.pathI === this.path.length - 1 && Math.hypot(q[0] - this.pos[0], q[2] - this.pos[2]) < HOSTAGE.keep * 0.8) { this.path = null; break; }
      const dx = q[0] - this.pos[0], dyy = q[1] - this.pos[1], dz = q[2] - this.pos[2];
      const len = Math.hypot(dx, dyy, dz);
      if (len < 0.12) { this.pathI++; continue; }
      // (Rhys: on the roof, none of them would come back down) the end
      // of a ladder: close to it, he takes it - stepping onto it, rather than
      // being shoved about short of the exact spot by the others queueing for
      // it - and one at a time: someone already on it, he waits his turn
      const q2 = this.path[this.pathI + 1];
      const climbNext = q2 && Math.abs(q2[1] - q[1]) > Math.hypot(q2[0] - q[0], q2[2] - q[2]) * 1.5 && Math.abs(q2[1] - q[1]) > 1;
      if (climbNext && Math.hypot(dx, dz) < LADDER_TAKE && Math.abs(dyy) < 0.5) {
        const busy = (ctx.crowd || []).some((o) => o !== this && o.climbing && Math.hypot(o.pos[0] - q[0], o.pos[2] - q[2]) < 1.2);
        if (busy) { this.speed = 0; break; }
        this.pos = q.slice(); this.pathI++; this.climbing = true; continue;
      }
      const s = Math.min(len, left);
      // (Rhys: freed hostages walked through shut doors) he opens a
      // door he comes to; a locked one his route goes round already
      if (ctx.doors && this.blockedByDoor(this.pos[0] + dx / len * s, this.pos[2] + dz / len * s, ctx.doors, dt)) break;
      this.pos[0] += dx / len * s; this.pos[1] += dyy / len * s; this.pos[2] += dz / len * s;
      if (Math.hypot(dx, dz) > 0.05 && Math.abs(dyy) < Math.hypot(dx, dz) * 1.5) this.turnTo(Math.atan2(-dx, -dz), dt * 2);
      this.climbing = Math.abs(dyy) > Math.hypot(dx, dz) * 1.5;     // up or down a ladder
      left -= s;
      this.speed = speed;
    }
    if (this.path && this.pathI >= this.path.length) this.path = null;
    if (!this.path) this.climbing = false;          // off the ladder at the end of his route: the next may come
    this.moveBody();
  }

  // (Rhys: one hostage turned to face him but would not move) a
  // route to a point: from where he stands, or - if that is not open floor
  // (shoved against furniture, standing in a doorway) - from the nearest open
  // spot; failing both, and you close by on his floor, straight towards you
  planTo(ctx, to) {
    const nav = ctx.nav;
    let p = nav.find(this.pos, to);
    if (p && p.length) return p;
    const c = nav.nearestOpen && nav.nearestOpen(this.pos);
    if (c) {
      const c0 = nav.centre(c), rest = nav.find(c0, to);
      if (rest && rest.length) return [c0].concat(rest);
    }
    if (Math.abs(to[1] - this.pos[1]) < 0.6 && Math.hypot(to[0] - this.pos[0], to[2] - this.pos[2]) < 12) return [to.slice()];
    return null;
  }

  // The lift. True when it has dealt with him this step.
  liftStep(dt, ctx, you) {
    this.boarding = false;
    const L = ctx.lift, d = L.def.door, cz = (d.z0 + d.z1) / 2;
    const youIn = L.carries(ctx.you.pos), meIn = L.carries(this.pos);
    const open = L.doors > 0.85 && !L.moving;
    const outside = [d.x - 0.8, L.carY, cz];
    // (Rhys: getting in, someone ended up through the car's wall) he
    // makes for the corner of the car furthest from you, and never walks into you
    const corners = [[L.def.x0 + 0.32, L.def.z0 + 0.32], [L.def.x1 - 0.32, L.def.z0 + 0.32], [L.def.x0 + 0.32, L.def.z1 - 0.32], [L.def.x1 - 0.32, L.def.z1 - 0.32]]
      .filter(([x]) => x > d.x + 0.35);
    const yp = ctx.you.pos, far = (corners.length ? corners : [[(L.def.x0 + L.def.x1) / 2, (L.def.z0 + L.def.z1) / 2]])
      .sort((a, b) => Math.hypot(b[0] - yp[0], b[1] - yp[2]) - Math.hypot(a[0] - yp[0], a[1] - yp[2]))[0];
    const inside = [far[0], L.carY, far[1]];
    this.youPos = youIn ? yp : null;          // (only minding you inside the car; getting out, nothing stops him)
    if (meIn) {
      if (youIn) {
        // well in, clear of the doors, then he stands and rides
        this.path = null;
        if (!L.moving && Math.hypot(this.pos[0] - inside[0], this.pos[2] - inside[2]) > 0.1) this.straight(inside, HOSTAGE.walk, dt);
        else this.turnTo(Math.atan2(-(ctx.you.pos[0] - this.pos[0]), -(ctx.you.pos[2] - this.pos[2])), dt);
        return true;
      }
      // you have got out: out after you, through the doors - and on out to
      // one side of them, not to stand in the way
      if (!open) return true;
      this.straight(outside, HOSTAGE.walk, dt);
      if (!L.carries(this.pos)) this.liftAside = this.asideOfLift(ctx);
      return true;
    }
    if (!youIn || Math.abs(this.pos[1] - L.carY) > 0.6) return false;
    // you are in the car at his floor: to the doors (by his route), then in -
    // and the doors are held for him meanwhile (see holdFor)
    this.boarding = true;
    // (the landing is on the low-x side of the doors: at or past the outside
    // point, in line with the doorway, he goes on in)
    const atDoor = this.pos[0] > outside[0] - 0.45 && Math.abs(this.pos[2] - cz) < 0.9;
    if (!atDoor) {
      if (!this.liftPath || this.clock > (this.liftRepath || 0)) {
        this.liftPath = ctx.nav ? this.planTo(ctx, outside) : [outside];
        this.liftRepath = this.clock + 1;
      }
      if (!this.liftPath || !this.liftPath.length) return false;
      let q = this.liftPath[0];
      while (this.liftPath.length > 1 && Math.hypot(q[0] - this.pos[0], q[2] - this.pos[2]) < 0.15) { this.liftPath.shift(); q = this.liftPath[0]; }
      this.straight(q, HOSTAGE.hurry, dt, ctx.doors);
      return true;
    }
    if (open) this.straight(inside, HOSTAGE.walk, dt);
    return true;
  }
  // The landing in front of the lift's doors, on whichever floor
  // he is: { x0, x1, z0, z1 } or null when he is not by them.
  liftApron(L) {
    const d = L.def.door, fl = L.floorOf ? L.floorOf(this.pos) : -1;
    if (fl < 0) return null;
    return { x0: d.x - 1.1, x1: L.def.x0 + 0.02, z0: d.z0 - 0.35, z1: d.z1 + 0.35, y: L.floorY ? L.floorY(fl) : this.pos[1] };   // (the threshold too: that is where he stood)
  }
  // A spot on the landing beside the doors: the side nearer you, if it is
  // open floor (else the other; else straight back from them).
  asideOfLift(ctx) {
    const L = ctx.lift, d = L.def.door, cz = (d.z0 + d.z1) / 2, y = this.pos[1];
    const yp = ctx.you ? ctx.you.pos : this.pos;
    const spots = [[d.x - 0.75, y, d.z0 - 0.75], [d.x - 0.75, y, d.z1 + 0.75]]
      .sort((a, b) => Math.hypot(a[0] - yp[0], a[2] - yp[2]) - Math.hypot(b[0] - yp[0], b[2] - yp[2]));
    spots.push([d.x - 1.6, y, cz]);
    const nav = ctx.nav;
    for (const q of spots) {
      if (!nav || !nav.cellAt) return q;
      const c = nav.cellAt(q);
      if (c && nav.isOpen(c)) return q;
    }
    return null;
  }
  // Standing idle in front of the lift doors: step aside. True while moving.
  clearOfLift(ctx, dt) {
    const L = ctx.lift;
    if (L.carries(this.pos)) return false;
    const a = this.liftApron(L);
    const inApron = a && this.pos[0] > a.x0 && this.pos[0] < a.x1 && this.pos[2] > a.z0 && this.pos[2] < a.z1;
    if (!inApron && !this.liftAside) return false;
    if (inApron && !this.liftAside) this.liftAside = this.asideOfLift(ctx);
    const q = this.liftAside;
    // (a spot left over from long ago, or another floor: forget it)
    if (!q || Math.abs(q[1] - this.pos[1]) > 0.6 || (!inApron && Math.hypot(q[0] - this.pos[0], q[2] - this.pos[2]) > 2)) { this.liftAside = null; return false; }
    const done = this.straight(q, HOSTAGE.walk, dt, ctx.doors);
    if (done || Math.hypot(q[0] - this.pos[0], q[2] - this.pos[2]) < 0.08) { this.liftAside = null; return false; }
    return true;
  }
  // a straight step towards a point (no route): for the last metres into and out of the lift
  straight(q, speed, dt, doors) {
    const dx = q[0] - this.pos[0], dz = q[2] - this.pos[2], len = Math.hypot(dx, dz);
    if (len < 0.05) return true;
    const s = Math.min(len, speed * dt);
    // not into you: a step that would bring him within arm's length of you waits
    if (this.youPos) {
      const nx = this.pos[0] + dx / len * s, nz = this.pos[2] + dz / len * s;
      const before = Math.hypot(this.pos[0] - this.youPos[0], this.pos[2] - this.youPos[2]), after = Math.hypot(nx - this.youPos[0], nz - this.youPos[2]);
      if (after < 0.5 && after < before) return false;
    }
    if (doors && this.blockedByDoor(this.pos[0] + dx / len * s, this.pos[2] + dz / len * s, doors)) return false;
    this.pos[0] += dx / len * s; this.pos[2] += dz / len * s;
    if (Math.abs(q[1] - this.pos[1]) < 0.6) this.pos[1] += (q[1] - this.pos[1]) * Math.min(1, dt * 8);
    this.turnTo(Math.atan2(-dx, -dz), dt * 2);
    this.speed = speed;
    return len - s < 0.05;
  }

  // a shut door where he is about to step: open it if he can; true if it stops him
  blockedByDoor(nx, nz, doors, dt) {
    const r = HOSTAGE.radius;
    for (const d of doors) {
      if (d.open || d.blown) continue;
      const s = d.solid;
      if (!(nx + r > s.min[0] && nx - r < s.max[0] && nz + r > s.min[2] && nz - r < s.max[2] && this.pos[1] + 1 > s.min[1] && this.pos[1] < s.max[1])) continue;
      if (d.locked) return true;
      if (d.use(this.pos, this.box()) === 'opened') { this.events.push({ type: 'door', door: d }); this.doorStuck = 0; continue; }
      // (Rhys: a hostage turned to face him and would not move) a
      // door that will not swing for him (he is standing in its way, say):
      // after a moment he shoulders it open, rather than standing there for good
      this.doorStuck = (this.doorStuck || 0) + (dt || 0);
      if (this.doorStuck > 1.2 && d.set) { d.set(true, (d.def && d.def.swingTo) || d.side || 1); this.doorStuck = 0; this.events.push({ type: 'door', door: d }); continue; }
      return true;
    }
    return false;
  }

  turnTo(want, dt) {
    let d = want - this.yaw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    this.yaw += Math.sign(d) * Math.min(Math.abs(d), dt * 6);
  }

  // for the body: bound and seated, walking, or fallen
  animState() {
    return { mode: this.climbing ? 'ladder' : 'walk', stance: this.state === 'held' ? 1 : 0, speed: this.speed, forward: this.speed > 0 ? 1 : 0, strafe: 0,
      onGround: true, vy: 0, armed: false, melee: false, aiming: false, firing: false,
      dashing: false, hurt: false, dead: this.state === 'dead', slump: null };
  }
}

// Where the hostages are on the map: labels "Hostage 1", "Hostage 2"... (Pure.)
export function hostagePlaces(labels, S, FLOORS) {
  return labels.filter((l) => /^Hostage\s*\d+$/i.test(String(l[0]).trim()) && FLOORS[l[1]] !== undefined)
    .map((l) => ({ id: 'H' + String(l[0]).replace(/\D/g, ''), label: String(l[0]).trim(), floor: l[1], pos: [(l[2] + 0.5) * S, FLOORS[l[1]], (l[3] + 0.5) * S] }));
}

// A hostage on his way into the lift holds its doors: they stay
// open (and it does not leave) until he is in. Call before the lift's step.
export function holdLiftFor(lift, hostages, youPos) {
  if (!lift || lift.moving) return;
  // (Rhys: he would not leave the lift) and one who is in the car
  // following you, when you have got out: the doors stay open for him too
  const youIn = youPos && lift.carries(youPos);
  if ((hostages || []).some((h) => h.alive && ((h.boarding && Math.abs(h.pos[1] - lift.carY) < 0.6) || (h.state === 'following' && !youIn && youPos && lift.carries(h.pos))))) {
    lift.wantOpen = true;
    lift.dwellT = Math.max(lift.dwellT || 0, 0.8);
  }
}

// (Rhys: a hostage shoved off the embankment stood on the river
// like a saint) somewhere a person can be put: floor under his feet, and not
// in water. Shoves (and anything else that moves people by hand) check it.
export function standable(world, x, y, z) {
  const w = world.waterColumn && world.waterColumn(x, z);
  if (w && y < w.max[1] + 0.2 && y > w.min[1] - 0.5) return false;      // not under a pool's bottom (the casino's is on the roof)
  return world.hits([x - 0.12, y - 0.3, z - 0.12], [x + 0.12, y + 0.02, z + 0.12]).some((s) => !s.person && !s.target && !s.disabled);
}
// The police at the street (or anywhere): a zone in plan, at its own level -
// not the sewer under it (Rhys: one was rescued from the sewer).
export function inStreetZone(zone, p, floorY) {
  const y0 = floorY || 0;
  return !!zone && p[1] > y0 - 0.5 && p[1] < y0 + 1 && p[0] > zone.x0 && p[0] < zone.x1 && p[2] > zone.z0 && p[2] < zone.z1;
}

// ── shoving (Rhys: two people who walk into each other shove - so
// nobody is shut in for good, a determined player can shove a hostage where he
// wants him, and a guard shoved knows about it) ──────────────────────────────
// people: [{ pos, r, box?, push(dx, dz) }]. you: { pos, intent, r, strong }.
// Moves people apart where they overlap (each half the overlap), and pushes
// along your intent anyone you walk into. Each push is only made if the spot
// it goes to is clear of the world (fits). Returns the people you shoved.
export function shove(people, you, dt, fits) {
  const shoved = [];
  const sep = (a, b) => {
    const dx = b.pos[0] - a.pos[0], dz = b.pos[2] - a.pos[2], d = Math.hypot(dx, dz), want = a.r + b.r;
    if (d >= want || Math.abs(a.pos[1] - b.pos[1]) > 1.2) return;
    const nx = d > 1e-4 ? dx / d : 1, nz = d > 1e-4 ? dz / d : 0, k = (want - d) / 2;
    if (fits(a, -nx * k, -nz * k)) { a.pos[0] -= nx * k; a.pos[2] -= nz * k; }
    if (fits(b, nx * k, nz * k)) { b.pos[0] += nx * k; b.pos[2] += nz * k; }
  };
  for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) sep(people[i], people[j]);
  if (you && you.intent) {
    for (const p of people) {
      const dx = p.pos[0] - you.pos[0], dz = p.pos[2] - you.pos[2], d = Math.hypot(dx, dz);
      if (d > you.r + p.r + 0.15 || Math.abs(p.pos[1] - you.pos[1]) > 1.2 || d < 1e-4) continue;
      if ((dx * you.intent[0] + dz * you.intent[1]) / d < 0.4) continue;       // only who is in front of where you are going
      const s = (you.strong ? 3.6 : 2.4) * dt;
      // push straight on, and a little to the side you are both leaning
      const px = you.intent[0] * s + dx / d * s * 0.3, pz = you.intent[1] * s + dz / d * s * 0.3;
      if (fits(p, px, pz)) { p.pos[0] += px; p.pos[2] += pz; shoved.push(p); }
    }
  }
  return shoved;
}
