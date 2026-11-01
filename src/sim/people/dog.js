// FRONTLINE - the guard dog (M6.30; the roadmap's specialists: "a dog handler"). A dog keeps at its
// handler's heel. It does not see as a man does - it smells: you, near enough, it knows about, in the dark,
// in camouflage, round a corner (a closed door or a wall between you and it cuts that to close by). It barks -
// every man of its side near enough comes - and it goes for you: running, then biting. It can be shot, or
// darted to sleep. A dog whose handler is down stays by him, growling at anyone who comes close.
// Pure: no drawing. ctx: { world, nav, you: { pos, dead }, guards, alarm(dog, pos), bite(dog, damage) }.

export const DOG = {
  hp: 35, radius: 0.3,
  walk: 1.6, run: 6.2,
  smell: 9,              // metres it knows you at, in the open
  smellBlocked: 3,       // ... through a wall or a shut door
  bite: 1.3, biteDamage: 11, biteEvery: 0.9,
  heel: 1.4,             // how close to its handler it keeps
  lose: 6,               // seconds after it loses you before it gives up and goes back to heel
  height: 0.75,
};

export class Dog {
  constructor(world, def) {
    this.id = def.id || 'dog';
    this.pos = def.pos.slice();
    this.yaw = def.yaw || 0;
    this.handler = def.handler || null;      // the guard it belongs to
    this.faction = (def.handler && def.handler.faction) || def.faction || 'red';
    this.state = 'heel';                     // heel | alert (barking, running at you) | down
    this.speed = 0; this.path = null; this.pathI = 0; this.repathAt = 0; this.clock = 0;
    this.biteT = 0; this.lostT = 0; this.barkT = 0; this.barked = false;
    this.dead = false; this.asleep = false;
    // its body: shot as anything else is (sim/arms/weapons.js targets)
    this.solid = world.addSolid([0, -999, 0], [0.1, -998.9, 0.1], 'dog');
    this.solid.mobile = true; this.solid.person = true;
    this.target = { solid: this.solid, min: [0, 0, 0], max: [0, 0, 0], hp: DOG.hp, maxHp: DOG.hp, axis: 'x', fall: 1, score: 0, down: false, downAt: -99, respawn: 1e9, centre: [0, 0, 0], dog: this };
    this.solid.target = this.target;
    (world.targets = world.targets || []).push(this.target);
    this.place();
  }
  place() {
    const r = DOG.radius, t = this.target;
    const lo = [this.pos[0] - r, this.pos[1], this.pos[2] - r], hi = [this.pos[0] + r, this.pos[1] + DOG.height, this.pos[2] + r];
    this.solid.min = lo; this.solid.max = hi; t.min = lo.slice(); t.max = hi.slice();
    t.centre = [this.pos[0], this.pos[1] + DOG.height / 2, this.pos[2]]; t.headY = this.pos[1] + DOG.height * 0.8;
  }
  // can it smell you from here?
  smells(you, world) {
    const dx = you.pos[0] - this.pos[0], dz = you.pos[2] - this.pos[2], d = Math.hypot(dx, dz);
    if (Math.abs(you.pos[1] - this.pos[1]) > 2 || d > DOG.smell) return false;
    if (d <= DOG.smellBlocked || !world) return true;
    const from = [this.pos[0], this.pos[1] + 0.5, this.pos[2]], dir = [dx / d, 0, dz / d];
    const hit = world.raycast(from, dir, d - 0.3, (s) => s.person || s.shootThrough || s.glass || s === this.solid);
    return !hit;
  }
  step(dt, ctx) {
    this.clock += dt;
    if (this.dead) return;
    if (this.target.down) { this.dead = true; this.asleep = this.target.downBy === 'shot' && this.target.lethalHit === false; this.state = 'down'; this.solid.disabled = true; this.speed = 0; return; }
    const you = ctx.you;
    this.barkT -= dt; this.biteT -= dt;
    const handlerDown = this.handler && (this.handler.dead || (this.handler.target && this.handler.target.down));
    const scent = you && !you.dead && this.smells(you, ctx.world);
    if (scent) {
      if (this.state !== 'alert') { this.state = 'alert'; this.barked = false; }
      this.lostT = 0; this.lastAt = you.pos.slice();
    } else if (this.state === 'alert') {
      this.lostT += dt;
      if (this.lostT > DOG.lose) { this.state = 'heel'; this.path = null; }
    }
    if (this.state === 'alert') {
      // the bark: once on finding you, then now and then while it has you
      if (scent && this.barkT <= 0) { this.barkT = 2.5; this.events.push({ type: 'bark', pos: this.pos.slice(), first: !this.barked }); if (!this.barked && ctx.alarm) ctx.alarm(this, you.pos.slice()); this.barked = true; }
      const goal = scent ? you.pos : this.lastAt;
      const d = Math.hypot(goal[0] - this.pos[0], goal[2] - this.pos[2]);
      // a dog whose handler is down guards him: it will not leave his side
      if (handlerDown && Math.hypot(this.handler.pos[0] - this.pos[0], this.handler.pos[2] - this.pos[2]) > 4) { this.go(this.handler.pos, DOG.run, dt, ctx); return; }
      if (scent && d < DOG.bite) {
        this.speed = 0; this.face(goal, dt);
        if (this.biteT <= 0) { this.biteT = DOG.biteEvery; this.events.push({ type: 'bite', pos: this.pos.slice() }); if (ctx.bite) ctx.bite(this, DOG.biteDamage); }
        return;
      }
      this.go(goal, DOG.run, dt, ctx);
      return;
    }
    // at heel: a little behind and to the side of its handler; or by him, where he lies
    if (this.handler) {
      const h = this.handler, back = handlerDown ? 0.8 : DOG.heel;
      const want = [h.pos[0] + Math.sin(h.yaw) * back + Math.cos(h.yaw) * 0.6, h.pos[1], h.pos[2] + Math.cos(h.yaw) * back - Math.sin(h.yaw) * 0.6];
      if (Math.hypot(want[0] - this.pos[0], want[2] - this.pos[2]) > 0.5) this.go(want, Math.max(DOG.walk, (h.speed || 0) * 1.1), dt, ctx);
      else { this.speed = 0; this.face([this.pos[0] - Math.sin(h.yaw), 0, this.pos[2] - Math.cos(h.yaw)], dt); }
    } else this.speed = 0;
  }
  face(p, dt) {
    const want = Math.atan2(-(p[0] - this.pos[0]), -(p[2] - this.pos[2]));
    let d = want - this.yaw; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
    this.yaw += Math.sign(d) * Math.min(Math.abs(d), 8 * dt);
  }
  // to p: straight when nothing is in the way, along a found way otherwise (re-found at most once a second)
  go(p, speed, dt, ctx) {
    const w = ctx.world, flat = Math.hypot(p[0] - this.pos[0], p[2] - this.pos[2]);
    if (flat < 0.2) { this.speed = 0; return; }
    let q = p;
    const from = [this.pos[0], this.pos[1] + 0.4, this.pos[2]], dir = [(p[0] - this.pos[0]) / flat, 0, (p[2] - this.pos[2]) / flat];
    const clear = !w || !w.raycast(from, dir, flat, (s) => s.person || s.target || s === this.solid);
    if (!clear && ctx.nav) {
      if (!this.path || this.clock > this.repathAt) { this.path = ctx.nav.find(this.pos, p) || null; this.pathI = 0; this.repathAt = this.clock + 1; }
      if (this.path && this.path.length) {
        while (this.pathI < this.path.length - 1 && Math.hypot(this.path[this.pathI][0] - this.pos[0], this.path[this.pathI][2] - this.pos[2]) < 0.4) this.pathI++;
        q = this.path[this.pathI];
      } else { this.speed = 0; return; }
    } else this.path = null;
    const dx = q[0] - this.pos[0], dz = q[2] - this.pos[2], d = Math.hypot(dx, dz) || 1;
    this.face(q, dt);
    const step = Math.min(d, speed * dt);
    // a shut door (or a wall) right ahead: it cannot open it - it waits there, scratching and barking
    if (w) { const h = w.raycast([this.pos[0], this.pos[1] + 0.4, this.pos[2]], [dx / d, 0, dz / d], step + DOG.radius + 0.05, (s) => s.person || s.target || s === this.solid || s.shotOnly); if (h) { this.speed = 0; this.blocked = true; return; } }
    this.blocked = false;
    this.pos[0] += dx / d * step; this.pos[2] += dz / d * step;
    if (q[1] !== undefined && Math.abs(q[1] - this.pos[1]) < 1.5) this.pos[1] += (q[1] - this.pos[1]) * Math.min(1, dt * 6);
    this.speed = speed;
    this.place();
  }
}
Dog.prototype.events = null;
export function makeDog(world, def) { const d = new Dog(world, def); d.events = []; return d; }
