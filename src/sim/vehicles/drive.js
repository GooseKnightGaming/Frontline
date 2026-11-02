// FRONTLINE - driving (the start of M8: "the Riverboat Pursuit, vehicle missions").
//
// A drivable thing - a car, a jeep, a boat - is a heading and a speed, steered and throttled; its body is
// a box in the world that moves with it (people stop against it, rounds hit it). Arcade handling: it goes
// where it points, turns as fast as its speed lets it, slows on its own, bounces off what it hits. A car
// keeps to the ground under it (it climbs a kerb, drops off a ledge); a boat keeps to the water (the
// bank stops it as a wall does), and rides its surface. Pure: tested in node.
//
// def: { kind: 'car' | 'jeep' | 'boat', pos, yaw, id, model, paint, hp }
// step(dt, ctl): ctl = { throttle: -1..1, steer: -1..1 (+ right), brake: bool }

export const KINDS = {
  //        top speed, reverse, accel, brake, drag (per m/s), rolling, turn (rad/s at speed), [w, h, l], seat [x, y, z] (local: -z ahead)
  car:  { max: 28, rev: 7, accel: 8, brake: 20, drag: 0.012, roll: 1.4, turn: 1.3, size: [1.9, 1.5, 4.5], seat: [-0.42, 0.55, 0.15], ground: true },
  jeep: { max: 24, rev: 7, accel: 9, brake: 18, drag: 0.016, roll: 1.6, turn: 1.35, size: [2.1, 1.9, 4.6], seat: [-0.45, 0.85, 0.1], ground: true },
  // a business jet on the ground: slow to turn, quick on a straight; its box is the fuselage (the wings are high)
  jet:  { max: 40, rev: 2, accel: 6, brake: 10, drag: 0.004, roll: 0.6, turn: 0.55, size: [2.4, 3.0, 15], seat: [-0.4, 1.2, -5.0], ground: true },
  boat: { max: 22, rev: 4, accel: 6, brake: 8, drag: 0.03, roll: 0.9, turn: 0.8, size: [2.2, 1.3, 6.0], seat: [-0.4, 0.54, 0.65], ground: false },
};

const K_GROUND = (v) => v.K.ground;
const fwd = (yaw) => [-Math.sin(yaw), -Math.cos(yaw)];

export class Drivable {
  constructor(world, def) {
    this.world = world;
    this.id = def.id || 'vehicle';
    this.kind = def.kind || 'car';
    this.K = Object.assign({}, KINDS[this.kind], def.tune || {});
    this.model = def.model || null; this.paint = def.paint || null;
    this.pos = def.pos.slice(); this.yaw = def.yaw || 0;
    this.speed = 0; this.vy = 0; this.steer = 0;
    this.hp = def.hp || 400; this.maxHp = this.hp; this.wrecked = false;
    this.bumps = 0; this.lastBump = null;
    this.driver = null;                     // who is driving: 'you', a guard, or no one
    const [w, h, l] = this.K.size;
    this.solid = world.addSolid([this.pos[0] - w / 2, this.pos[1], this.pos[2] - w / 2], [this.pos[0] + w / 2, this.pos[1] + h, this.pos[2] + w / 2], 'vehicle', { noClimb: true });
    this.solid.mobile = true; this.solid.vehicle = this;
    (world.vehicles || (world.vehicles = [])).push(this);
    if (!this.K.ground) this.float();
    this.place();
  }
  // where along its length it is tested: three squares down its middle, each as wide as the vehicle
  probes(x, z, yaw) {
    const [w, , l] = this.K.size, f = fwd(yaw), n = Math.max(2, Math.round(l / w) + 1), out = [];
    for (let i = 0; i < n; i++) { const t = (i / (n - 1) - 0.5) * (l - w); out.push([x + f[0] * t, z + f[1] * t]); }
    return out;
  }
  // its box, for the world: round the probes
  place() {
    const [w, h] = this.K.size, ps = this.probes(this.pos[0], this.pos[2], this.yaw), r = w / 2;
    const xs = ps.map((p) => p[0]), zs = ps.map((p) => p[1]);
    this.solid.min = [Math.min(...xs) - r, this.pos[1] + 0.25, Math.min(...zs) - r];
    this.solid.max = [Math.max(...xs) + r, this.pos[1] + h, Math.max(...zs) + r];
  }
  // what it would hit, standing at (x, y, z) turned yaw: the first solid that is not itself (or its driver's)
  blocked(x, y, z, yaw) {
    const [w, h] = this.K.size, r = w / 2 - 0.05;
    for (const [px, pz] of this.probes(x, z, yaw)) {
      const hs = this.world.hits([px - r, y + (this.K.ground ? 0.45 : 0.3), pz - r], [px + r, y + h, pz + r]);
      const s = hs.find((q) => q !== this.solid && !q.rider && !(this.ignore && this.ignore(q)));
      if (s) return s;
      if (!this.K.ground && !this.world.waterColumn(px, pz)) return { tag: 'bank' };
    }
    return null;
  }
  // a boat sits on the water's surface, rocking a little
  float() {
    const w = this.world.waterColumn(this.pos[0], this.pos[2]);
    if (w) this.pos[1] = w.max[1] - 0.35 + Math.sin((this.t || 0) * 1.7) * 0.04 - (this.sink || 0);
  }
  step(dt, ctl) {
    ctl = ctl || {};
    this.t = (this.t || 0) + dt;
    const K = this.K;
    // an EMP: the engine dies for a while (it rolls on, steering, but nothing drives it)
    if (this.stalled > 0) { this.stalled = Math.max(0, this.stalled - dt); ctl = Object.assign({}, ctl, { throttle: 0 }); }
    if (this.wrecked) { ctl = { throttle: 0, steer: 0, brake: true }; if (!K_GROUND(this)) this.sink = Math.min(0.9, (this.sink || 0) + dt * 0.12); }     // (a wrecked boat settles low in the water)
    const th = Math.max(-1, Math.min(1, ctl.throttle || 0));
    // throttle: forward, or backward - braking first when it is going the other way
    if (th > 0.05) this.speed += (this.speed < 0 ? K.brake : K.accel * (1 - Math.max(0, this.speed) / K.max * 0.6)) * th * dt;
    else if (th < -0.05) this.speed += (this.speed > 0 ? -K.brake : -K.accel * 0.6) * -th * dt;
    // what slows it: rolling (or the water), and the air
    const slow = (K.roll + K.drag * this.speed * this.speed + (ctl.brake ? K.brake : 0)) * dt;
    if (Math.abs(this.speed) <= slow && Math.abs(th) < 0.05) this.speed = 0;
    else if (Math.abs(th) < 0.05 || ctl.brake) this.speed -= Math.sign(this.speed) * Math.min(Math.abs(this.speed), slow);
    this.speed = Math.max(-K.rev, Math.min(K.max, this.speed));
    // steering: the wheels (or the rudder) come round over a moment; it turns as fast as its speed lets it
    // (Rhys: "VERY sensitive on the steering") the helm comes over gently, and turns less at full speed
    this.steer += ((ctl.steer || 0) - this.steer) * Math.min(1, dt * 2.8);
    const grip = Math.min(1, Math.abs(this.speed) / 5) * (1 - 0.35 * Math.min(1, Math.abs(this.speed) / K.max)) * (ctl.brake && this.K.ground ? 1.35 : 1);
    this.yaw -= this.steer * K.turn * grip * Math.sign(this.speed || 1) * dt;
    // on: where it points, unless something is in the way
    const f = fwd(this.yaw), d = this.speed * dt;
    let nx = this.pos[0] + f[0] * d, nz = this.pos[2] + f[1] * d;
    let ny = this.pos[1];
    if (K.ground) {
      // the ground under it: it climbs what it can step onto, falls off what it cannot
      let g = -Infinity;
      for (const [px, pz] of this.probes(nx, nz, this.yaw)) g = Math.max(g, this.world.groundBelow(px, this.pos[1] + 0.6, pz, K.size[0] / 2 - 0.1));
      if (g > -Infinity && g <= this.pos[1] + 0.6 && g >= this.pos[1] - 0.05) { ny = g; this.vy = 0; }
      else { this.vy -= 18 * dt; ny = Math.max(g, this.pos[1] + this.vy * dt); if (ny === g) this.vy = 0; }
    }
    let hit = this.blocked(nx, ny, nz, this.yaw);
    if (hit) {
      const impact = Math.abs(this.speed);
      this.lastBump = { speed: impact, what: hit };
      // (Rhys: "collisions with other boats stop you dead, and really difficult to continue on") another
      // vehicle is shoved aside - the two of you glance off each other - rather than stopping you like a wall
      // a man in the way of a vehicle going at any pace is knocked down - hard enough, killed
      if (hit.person && impact > 4) {
        const t = (this.world.targets || []).find((q) => q.solid === hit);
        if (t && !t.down) {
          t.hp -= impact * 9; t.lastBy = this.driver === 'you' ? 'you' : null;
          if (t.hp <= 0) { t.hp = 0; t.down = true; t.lethalHit = true; t.downBy = 'vehicle'; }
          this.speed *= 0.8; this.lastRunOver = t;
        }
      }
      const other = hit.vehicle && hit.vehicle !== this ? hit.vehicle : null;
      if (other) {
        // shoved mostly sideways, off the line you are on, and a little on ahead
        const ax = other.pos[0] - this.pos[0], az = other.pos[2] - this.pos[2], side = [-f[1], f[0]];
        const sg = Math.sign(ax * side[0] + az * side[1]) || 1, pv = [side[0] * sg * 0.85 + f[0] * 0.5, side[1] * sg * 0.85 + f[1] * 0.5];
        const pl = Math.hypot(pv[0], pv[1]), shove = Math.max(0.12, Math.abs(d) * 1.2);
        for (const k of [1, 0.5]) {
          const ox = other.pos[0] + pv[0] / pl * shove * k, oz = other.pos[2] + pv[1] / pl * shove * k;
          if (!other.blocked(ox, other.pos[1], oz, other.yaw)) { other.pos[0] = ox; other.pos[2] = oz; other.place(); break; }
        }
        other.speed *= 0.9; if (impact > 3) this.bumps++;
        if (impact > 7) { other.damage((impact - 7) * 4); this.damage((impact - 7) * 2); }
        hit = this.blocked(nx, ny, nz, this.yaw);
        if (!hit) this.speed *= 0.85;
      }
    }
    if (hit) {
      const impact = Math.abs(this.speed);
      // along the wall if it can; else turned a little off it (a glancing blow); else it stops, and eases back
      const far = Math.abs(d) * 0.3;          // (a slide that hardly moves it is no slide: it went in head-on)
      const sx = Math.abs(nx - this.pos[0]) < far || this.blocked(nx, ny, this.pos[2], this.yaw) ? null : [nx, this.pos[2]];
      const sz = !sx && Math.abs(nz - this.pos[2]) >= far && !this.blocked(this.pos[0], ny, nz, this.yaw) ? [this.pos[0], nz] : null;
      let turned = null;
      if (!sx && !sz) for (const dy of [0.12, -0.12, 0.25, -0.25, 0.45, -0.45]) {
        const f2 = fwd(this.yaw + dy), tx = this.pos[0] + f2[0] * d * 0.7, tz = this.pos[2] + f2[1] * d * 0.7;
        if (!this.blocked(tx, ny, tz, this.yaw + dy)) { turned = [tx, tz, dy]; break; }
      }
      if (sx || sz) {
        // along it: it keeps most of its way on, and comes round to run alongside
        [nx, nz] = sx || sz;
        if (this.speed > 0) { let dd = Math.atan2(-(nx - this.pos[0]), -(nz - this.pos[2])) - this.yaw; while (dd > Math.PI) dd -= 2 * Math.PI; while (dd < -Math.PI) dd += 2 * Math.PI; this.yaw += Math.max(-0.04, Math.min(0.04, dd)); }
        this.speed *= 0.975;
      } else if (impact > 3) this.bumps++;      // (a knock, not a scrape along)
      if (sx || sz) { /* done above */ }
      else if (turned) { nx = turned[0]; nz = turned[1]; this.yaw += turned[2]; this.speed *= Math.abs(turned[2]) < 0.2 ? 0.93 : Math.abs(turned[2]) < 0.3 ? 0.82 : 0.65; }
      else { nx = this.pos[0]; nz = this.pos[2]; this.speed = -this.speed * 0.15; }
      if (impact > 9 && !(sx || sz)) this.damage((impact - 9) * (turned ? 3 : 6));
    }
    this.pos[0] = nx; this.pos[1] = ny; this.pos[2] = nz;
    if (!K.ground) this.float();
    this.place();
  }
  damage(n) {
    if (this.wrecked) return;
    this.hp -= n;
    if (this.hp <= 0) { this.hp = 0; this.wrecked = true; }
  }
  // the driver's seat, in the world
  seat() {
    const [sx, sy, sz] = this.K.seat, c = Math.cos(this.yaw), s = Math.sin(this.yaw);
    return [this.pos[0] + sx * c + sz * s, this.pos[1] + sy, this.pos[2] - sx * s + sz * c];
  }
  // somewhere to step out: beside the driver's door, else the other side, else behind
  exitSpot(free) {
    const c = Math.cos(this.yaw), s = Math.sin(this.yaw), w = this.K.size[0] / 2 + 0.7, l = this.K.size[2] / 2 + 0.8;
    for (const [lx, lz] of [[-w, 0], [w, 0], [-w - 1.4, 0], [w + 1.4, 0], [0, l], [0, -l]]) {
      const p = [this.pos[0] + lx * c + lz * s, this.pos[1] + (this.K.ground ? 0 : 0.35), this.pos[2] - lx * s + lz * c];
      // (out of a boat onto the bank: up onto the quay, if it is within a step or two)
      const g = this.world.groundBelow(p[0], this.pos[1] + 2.4, p[2], 0.3);
      if (g !== null && g > p[1] && g < this.pos[1] + 2.4) p[1] = g;
      if (!free || free(p)) return p;
    }
    return null;
  }
  get kmh() { return Math.round(Math.abs(this.speed) * 3.6); }
}

// An AI driver: along a list of points ([x, z]), at a speed it is told; slowing for the bends
export class Pilot {
  constructor(v, path, opts) {
    this.v = v; this.path = path; this.i = 0; this.speed = (opts && opts.speed) || 14; this.done = false; this.loop = !!(opts && opts.loop);
  }
  control() {
    const v = this.v;
    if (this.done || v.wrecked || !v.driver) return { throttle: 0, steer: 0, brake: true };
    let p = this.path[this.i];
    const f = fwd(v.yaw);
    // (on to the next point once this one is close - or already behind it, so a wide turn does not circle back)
    const passed = (q) => { const dx = q[0] - v.pos[0], dz = q[1] - v.pos[2], dd = Math.hypot(dx, dz); return dd < Math.max(6, Math.abs(v.speed) * 0.6) || (dd < 30 && dx * f[0] + dz * f[1] < 0 && this.i + 1 < this.path.length && ahead(this.path[this.i + 1])); };
    // (M6.70) ...but only a missed corner: the point after it ahead. A point behind with the next behind too is the way
    // back (a short loop's return leg) - turn round for it, do not skip the lot
    function ahead(q) { return (q[0] - v.pos[0]) * f[0] + (q[1] - v.pos[2]) * f[1] > 0; }
    while (p && passed(p)) {
      this.i++;
      if (this.i >= this.path.length) { if (this.loop) this.i = 0; else { this.done = true; return { throttle: 0, steer: 0, brake: true }; } }
      p = this.path[this.i];
    }
    const want = Math.atan2(-(p[0] - v.pos[0]), -(p[1] - v.pos[2]));
    let d = want - v.yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    const steer = Math.max(-1, Math.min(1, -d * 2.2));
    const dist = Math.hypot(p[0] - v.pos[0], p[1] - v.pos[2]);
    let target = this.speed * (1 - Math.min(0.75, Math.abs(d)));
    if (Math.abs(d) > 0.5) target = Math.min(target, 2 + dist * 0.35);      // (a sharp turn close by: slow for it)
    return { throttle: v.speed < target ? 1 : v.speed > target + 2 ? -0.4 : 0.2, steer, brake: false };
  }
}
