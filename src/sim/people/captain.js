// FRONTLINE - stopping the captain (Rhys: "time for the 'Stop the
// Captain' objective"). The Riverside Hotel's captain (P13) runs for his
// helicopter: through the roof door he locks behind him, up the ladder,
// across the roof to his post (P13A) - all guard.js's `escape`. Then this:
// he walks to the rope ladder hanging from the helicopter, climbs it, and
// sits in the open door while the rotors wind up; then it lifts and flies
// north. Stop him - dead or knocked out - any time before it lifts, and the
// objective is done (the helicopter, empty, leaves anyway). Once it lifts with
// him aboard, he has escaped. He also goes at 23:30, seen or not: his orders
// say the aircraft waits for no one (the intel in Room 203).
// (Rhys) The helicopter's side: the moment he runs it has its order,
// and it waits two minutes for him - not on the roof by then, it goes without
// him (and he is stranded up there, still to be stopped). Take him down ON the
// roof and it goes at once; down anywhere else, it waits out its two minutes.
// On the roof he keeps making for it - he may stop to shoot at you, then runs on.
// Pure logic: no engine. heli: { pos: [x, y, z], t } (level_hotel.js) - this
// moves it, and the drawn model follows its pos.

export const HELI = {
  // (Rhys: there is really not a lot of time to catch him)
  // (Rhys: about 90 s from slamming the roof door to lifting off)
  signal: 35,         // seconds at his post waving the helicopter in, before he goes to it
  walk: 2.0,          // m/s, post to the rope ladder
  climb: 0.7,         // m/s up the rope ladder
  spool: 22,          // seconds sitting in the door before it lifts: your last chance
  wait: 120,          // from his running: how long the helicopter waits for him
  hurry: 30,          // the pilot calls the last thirty seconds
  shoot: 2.5,         // seconds he stops to fire at you, when he sees you on the roof
  shootRest: 6,       // and how long he runs on before he will stop again
  shootRange: 25,
  rise: 2.2,          // m/s straight up, at first
  away: 16,           // m/s north once clear
  gone: 14,           // seconds after lifting: out of sight
  ladderZ: 1.15,      // the rope ladder hangs this far along +z from the helicopter's middle
  seat: [0, 0.5, 0.55],
};
export const LEAVE_AT = { hour: 23, minute: 30 };

export class CaptainRun {
  constructor(guard, heli, roofY) {
    this.g = guard; this.heli = heli; this.roofY = roofY;
    this.stage = guard ? 'hotel' : 'none';    // hotel | signal | toLadder | climb | aboard | takeoff | gone | stopped | stranded
    this.since = null;                         // seconds since he ran (the helicopter's two minutes)
    this.shootT = 0; this.restT = 0;
    this.t = 0; this.flyT = 0;
    this.home = heli ? heli.pos.slice() : null;
    this.events = [];
  }
  get foot() { return [this.heli.pos[0], this.roofY, this.heli.pos[2] + HELI.ladderZ]; }
  get seat() { return [this.heli.pos[0] + HELI.seat[0], this.heli.pos[1] + HELI.seat[1], this.heli.pos[2] + HELI.seat[2]]; }
  get stopped() { return this.stage === 'stopped' || (!!this.g && this.g.dead && this.stage !== 'takeoff' && this.stage !== 'gone'); }
  get onRoof() { return ['signal', 'toLadder', 'climb', 'aboard'].includes(this.stage) || (this.stage === 'hotel' && !!this.g && Math.abs(this.g.pos[1] - this.roofY) < 0.5); }
  // the helicopter goes: now (or after `delay` seconds), without him
  leaveEmpty(delay) { if (!this.heli.leaving) { this.heli.leaving = true; this.flyT = -(delay || 0); this.events.push({ type: 'heliLeft' }); } }
  get escaped() { return this.stage === 'takeoff' || this.stage === 'gone'; }
  // how fast the rotor turns, 0.4 (idling) .. 1 (flying), for drawing
  get spin() { return this.stage === 'aboard' ? 0.4 + 0.6 * Math.min(1, this.t / HELI.spool) : this.stage === 'takeoff' || this.stage === 'gone' || this.heli.leaving ? 1 : 0.4; }

  // now: { hour, minute } on the mission's clock (or null)
  step(dt, ctx) {
    const g = this.g, h = this.heli;
    if (!g || !h || this.stage === 'none') return;
    ctx = ctx || {};
    // the empty helicopter, leaving once he is down
    if (h.leaving) this.fly(dt);
    if (this.stage === 'stopped') {
      // shot in the open door: he goes with it, slumped in the cabin
      if (this.deadAboard) { g.pos = this.seat; g.moveBody && g.moveBody(); if (this.flyT > HELI.gone) g.hidden = true; }
      // down somewhere else after he ran: it waits out its two minutes, then goes
      if (this.waitOut && this.since !== null) { this.since += dt; if (this.since >= HELI.wait) { this.waitOut = false; this.leaveEmpty(0); } }
      return;
    }
    if (this.stage === 'gone') return;
    if (this.stage === 'takeoff') {
      this.fly(dt);
      g.pos = this.seat; g.moveBody && g.moveBody();
      if (this.flyT > HELI.gone) { this.stage = 'gone'; g.hidden = true; if (g.target) g.target.solid.disabled = true; this.events.push({ type: 'gone' }); }
      return;
    }
    // the helicopter's two minutes, from his running
    if (this.since !== null) this.since += dt;
    // stopped: dead or knocked out before the helicopter lifted
    if (g.dead) {
      const roof = this.onRoof;
      if (this.stage === 'climb') { g.pos = this.foot; g.climbing = false; g.moveBody && g.moveBody(); }   // he falls off the ladder
      this.deadAboard = this.stage === 'aboard';
      this.stage = 'stopped'; g.alwaysShow = false;
      this.events.push({ type: 'stopped' });
      // seen to fall on the roof: it goes at once; anywhere else it waits out its time
      if (roof) this.leaveEmpty(0);
      else this.waitOut = true;
      return;
    }
    // stranded: it left without him - he is still there to be stopped
    if (this.stage === 'stranded') return;
    // its time is up and he is not aboard: it goes without him
    if (this.since !== null && this.since >= HELI.wait && !h.leaving && this.stage !== 'aboard') {
      if (this.stage === 'climb') { g.pos = this.foot; g.climbing = false; }
      this.leaveEmpty(0);
      this.stage = 'stranded'; g.alwaysShow = false; g.moveBody && g.moveBody();
      this.events.push({ type: 'stranded' });
      return;
    }
    // the pilot's last call: thirty seconds left, and he is not aboard
    if (this.since !== null && !this.hurried && this.since >= HELI.wait - HELI.hurry && this.stage !== 'aboard') { this.hurried = true; this.events.push({ type: 'hurry' }); }
    // his orders: at 23:30 he goes, whatever is happening
    if (this.stage === 'hotel' && ctx.now && (ctx.now.hour > LEAVE_AT.hour || (ctx.now.hour === LEAVE_AT.hour && ctx.now.minute >= LEAVE_AT.minute)) && !g.fled && g.flee) {
      g.flee(ctx.guardCtx || {});
      this.events.push({ type: 'leaving' });
    }
    if (this.stage === 'hotel') {
      if (g.fled && !this.toldFled) { this.toldFled = true; this.since = 0; this.events.push({ type: 'fleeing' }); }
      if (g.escape && g.escapeI >= g.escape.length) { this.stage = 'signal'; this.t = 0; this.events.push({ type: 'boarding' }); }
      return;
    }
    // on the roof he is the run's: still fleeing, and where it puts him
    // (nothing else - a search, a chase - walks him back to the ladder)
    if (g.state !== 'flee' && g.state !== 'down') g.state = 'flee';
    if (this.stage === 'signal') { if (!this.hold) this.hold = g.pos.slice(); g.pos = this.hold.slice(); }
    // seeing you on the roof, he may stop and fire for a moment, then go on
    const gc = ctx.guardCtx, you = gc && gc.you;
    if (this.restT > 0) this.restT -= dt;
    const sees = you && g.seeing && Math.hypot(you.pos[0] - g.pos[0], you.pos[2] - g.pos[2]) < HELI.shootRange && (this.stage === 'signal' || this.stage === 'toLadder');
    if (this.shootT <= 0 && sees && this.restT <= 0) this.shootT = HELI.shoot;
    if (this.shootT > 0) {
      this.shootT -= dt;
      if (this.shootT <= 0) this.restT = HELI.shootRest;
      if (you) { g.turnTo(g.faceAngle(you.pos), dt * 2); if (g.seeing && g.fight) g.fight(dt, gc); }
      g.speed = 0;
      if (this.stage === 'signal') this.t += dt;     // (his waving goes on meanwhile)
      g.alwaysShow = true; g.moveBody && g.moveBody();
      return;
    }
    if (this.stage === 'signal') {
      // at his post, waving the helicopter in
      this.t += dt; g.speed = 0;
      if (this.t >= HELI.signal) this.stage = 'toLadder';
      g.moveBody && g.moveBody();
      return;
    }
    g.alwaysShow = true;
    if (this.stage === 'toLadder') {
      const f = this.foot, dx = f[0] - g.pos[0], dz = f[2] - g.pos[2], d = Math.hypot(dx, dz);
      const s = Math.min(d, HELI.walk * dt);
      if (d > 1e-6) { g.pos[0] += dx / d * s; g.pos[2] += dz / d * s; g.yaw = Math.atan2(-dx, -dz); }
      g.pos[1] = this.roofY; g.speed = HELI.walk;
      if (d - s < 0.05) { this.stage = 'climb'; g.pos = f.slice(); g.yaw = Math.PI; }   // facing the ladder (north)
    } else if (this.stage === 'climb') {
      g.climbing = true; g.speed = 0;
      const top = this.seat[1];
      g.pos[0] = this.foot[0]; g.pos[2] = this.foot[2];
      g.pos[1] = Math.min(top, g.pos[1] + HELI.climb * dt);
      if (g.pos[1] >= top - 1e-6) { g.climbing = false; this.stage = 'aboard'; this.t = 0; this.events.push({ type: 'aboard' }); }
    } else if (this.stage === 'aboard') {
      this.t += dt;
      g.pos = this.seat; g.speed = 0; g.yaw = 0;              // in the open door, looking out (south, at the roof)
      if (this.t >= HELI.spool) { this.stage = 'takeoff'; this.flyT = 0; this.events.push({ type: 'escaped' }); }
    }
    g.moveBody && g.moveBody();
  }
  // up, then away north (and out of sight)
  fly(dt) {
    const h = this.heli;
    this.flyT += dt;
    if (this.flyT <= 0) return;
    if (this.flyT < 3) h.pos[1] += HELI.rise * dt;
    else { h.pos[1] += HELI.rise * 0.5 * dt; h.pos[2] -= HELI.away * Math.min(1, (this.flyT - 3) / 3) * dt; }
  }
}
