// FRONTLINE - the operative's body.
// Pure simulation: no graphics, no browser. Input goes in, a new state comes
// out, so every rule here can be tested exactly.
//
// Units: metres, seconds, metres/second. Y is up. Yaw 0 looks toward -Z.

// the parachute: sinks at `sink` m/s, glides at `glide` plus
// `push` for W (minus for S), slips sideways at `slip`; opens once you are
// falling faster than `openBelow`
export const CHUTE = { sink: 3.4, glide: 3.6, push: 2.6, slip: 1.6, settle: 1.8, brake: 2.2, openBelow: 2.5, repack: 12 };
// (Rhys: "My parachute failed to open the second time?") It was one
// a deployment, and nothing said so. (Rhys: "there should be
// something you have to DO to pack it again... but whatever that thing is, it
// takes time to do") You repack it yourself: on your feet, keeping still,
// holding E - CHUTE.repack seconds of it, which keep if you let go or move
// and come back to it. state: { used, repack } - the game's; o: { holding,
// still, onGround, open }. Returns 'repacked' the moment it is ready,
// 'packing' while you work at it, else null.
export function repackChute(state, o, dt) {
  if (!state.used || o.open || !o.onGround || !o.still || !o.holding) return null;
  state.repack = (state.repack || 0) + dt;
  if (state.repack < CHUTE.repack) return 'packing';
  state.used = false; state.repack = 0;
  return 'repacked';
}
// (Rhys: "It seems to change its mind about whether it can be packed
// in a single keystroke or if you have to ... hold E for 12 seconds") Two
// causes: Resume from the pause menu handed you a fresh pack (main.js), and a
// key the browser never saw released - E held while a screenshot was taken -
// stayed "held", repacking with no one holding it. A hold counts only from a
// press made while repacking is on offer, and ends the moment E is up or the
// offer goes; then it takes a fresh press. g: { was, on } - kept between frames.
export function packGrip(g, eDown, offered) {
  const fresh = eDown && !g.was;
  g.was = eDown;
  if (!eDown || !offered) g.on = false;
  else if (fresh) g.on = true;
  return !!g.on;
}
// how the pack stands, for YOUR GEAR
export const chuteLabel = (state) => !state || !state.used ? 'packed' : state.repack > 0 ? 'unpacked - repacking, ' + Math.floor(100 * state.repack / CHUTE.repack) + '%' : 'unpacked';
// the Jump Pack: 2.2 s of thrust in a tank (about 10 m up); it refills, on the ground, in 14 s
export const JET = { burn: 2.2, refill: 14, restBefore: 1, thrust: 9, climb: 5.5, drift: 6, steer: 2.2 };
export const P = {
  radius: 0.32,
  height: 1.80, crouchHeight: 1.15, proneHeight: 0.62,
  eye: 1.64, crouchEye: 0.98, proneEye: 0.42, seatEye: 1.24, seatHold: 1.5,
  proneSpeed: 1.1,
  dashSpeed: 9.5, dashTime: 0.22, dashCost: 25, dashCooldown: 0.9,
  walk: 4.3, sprint: 7.2, crouchSpeed: 2.1, aimMul: 0.6, backMul: 0.8,
  accelGround: 55, accelAir: 9, friction: 14,
  gravity: 21, jump: 6.6,              // apex about 1.04 m
  stepUp: 0.45,
  vaultMax: 1.25,                      // low obstacles you can hop over
  vaultDepthMax: 0.7,                  // ... if they are this thin or less (walls, rails - not crates)
  mantleMax: 2.35,                     // highest ledge you can haul yourself onto (from your feet)
  mantleAirReach: 2.0,                 // arms up, in the air: what you can catch hold of                 .5 m)
  mantleWaterReach: 2.0,               // reach from the water, hauling out over an edge
  fallSafe: 11.5, fallDmg: 9,          // m/s of impact before it hurts; damage per m/s over
  swim: 3.0, swimFast: 4.6,
  breathMax: 25, breathRegen: 10, drownDmg: 12,
  proneShuffle: 1.9,                   // sprinting while prone: a quick shuffle
  staminaMax: 100, staminaFloor: -30, sprintDrain: 12, staminaRegen: 20, staminaDelay: 0.8,
  jumpCost: 8, mantleCost: 10, sprintResume: 25,
  ladderSpeed: 3.2,
  regenDelay: 5, regenRate: 5,         // recovery after a short breather: empty to full in ~20 s
  peekEye: 1.52,                       // how high your eyes get when peeking over cover
  leanReach: 0.6,                      // how far your head goes out round a corner
  leanRate: 7,                         // and how quickly
  peekRate: 5.5,                       // how quickly you rise and settle
  crouchSprint: 3.6,                   // faster than crouching, slower than sprinting
  crouchJump: 5.8,                     // a slightly lower hop from a crouch
  // how much noise each way of moving makes (0 silent .. 1 loud) - for listening guards later
  noise: { still: 0, prone: 0.05, crouch: 0.15, crouchSprint: 0.4, walk: 0.5, sprint: 1, swim: 0.3, land: 1 },
  autoTraverseMax: 1.3,                // sprinting into anything this high or lower goes over it by itself
  lowClimbCost: 4,
  // Parkour. Sprint at a wall and press SPACE: you run a step or two up it
  // (the kick) and reach for the top. Apex of the kick is about 1.4 m, so with
  // the air reach you can catch a ledge about 3.4 m up - and no higher.
  wallKick: 7.7, wallKickCost: 12,
  runUpTime: 0.25,                     // sprinting this long counts as a run-up
  overDepthMax: 0.7,                   // walls this thin can be gone over, not just onto
  overDropMax: 3.3,                    // ... if the far side is no further down than this
};

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export function forwardOf(yaw) { return [-Math.sin(yaw), 0, -Math.cos(yaw)]; }
export function rightOf(yaw) { return [Math.cos(yaw), 0, -Math.sin(yaw)]; }

export function blankInput() {
  return { moveX: 0, moveZ: 0, jump: false, jumpPressed: false, sprint: false,
    crouch: false, aim: false, yaw: 0, pitch: 0 };
}

export class Player {
  constructor(world) {
    this.world = world;
    this.reset();
  }

  reset() {
    const sp = this.world.spawn;
    this.pos = sp.pos.slice();
    this.vel = [0, 0, 0];
    this.yaw = sp.yaw; this.pitch = 0;
    this.h = P.height;
    this.stance = 0;              // 0 standing, 1 crouched, 2 prone
    this.crouching = false;       // kept as "not standing", for everything that asks
    this.dashT = 0; this.dashCd = 0;
    this.peek = 0;                // 0 crouched, 1 risen to shoot over cover
    this.lean = 0;                // -1 leaning left round a corner, +1 right
    this.onGround = false;
    this.mode = 'walk';           // walk | swim | ladder | traverse | dead
    this.chute = false;           // under an open parachute
    // what you carry weighs on you: the game sets this from the loadout (loadEffect)
    this.load = { speed: 1, drain: 1, noise: 1 };
    this.parachute = this.parachute || false;   // carrying one, not yet used (the game sets it from the gear slot)
    this.traverse = null;         // {kind, legs, pts, t, dur}
    this.runFor = 0;              // how long you have been sprinting forward on the ground
    this.ladder = null;
    this.health = 100; this.stamina = P.staminaMax; this.breath = P.breathMax;
    this.exhausted = false;
    this.sinceDamage = 99; this.sinceStamina = 99;
    this.airTime = 0; this.fallPeak = this.pos[1];
    this.events = [];             // things the presentation layer may want to react to
    this.prevCrouch = false;
    this.noise = 0;
    this.prompt = '';
    this.time = 0;
    this.lastLanding = 0;
    this.settle();
  }

  // Put the feet on whatever is below the spawn point.
  settle() {
    const g = this.world.groundBelow(this.pos[0], this.pos[1] + 0.5, this.pos[2], P.radius);
    if (g > -Infinity) this.pos[1] = g;
    this.onGround = true;
  }

  box(pos, h) {
    pos = pos || this.pos; h = h === undefined ? this.h : h;
    const r = P.radius;
    return [[pos[0] - r, pos[1], pos[2] - r], [pos[0] + r, pos[1] + h, pos[2] + r]];
  }
  free(pos, h) { const b = this.box(pos, h); return !this.world.hit(b[0], b[1]); }

  // Crouched and aiming: you lift your head and weapon over the cover in
  // front of you, without standing up (you stay a small target).
  get eyeHeight() {
    if (this.seated) return P.seatEye;
    const base = this.stance === 2 ? P.proneEye : this.stance === 1 ? P.crouchEye : P.eye;
    if (this.stance !== 1 || this.peek <= 0) return base;
    return base + (P.peekEye - P.crouchEye) * this.peek;
  }
  // sit down at pos (a seat's front edge, on the floor), facing yaw; stand() gets up
  // (back: where to stand up to - the aisle beside it, out of the seat's own solid)
  sit(pos, back) { this.setStance(0); this.seated = { pos: pos.slice(), back: (back || pos).slice(), hold: P.seatHold }; this.pos = pos.slice(); this.vel = [0, 0, 0]; }
  stand() { if (this.seated) this.pos = this.seated.back.slice(); this.seated = null; }
  // How far you could raise your head here: nothing overhead may stop you.
  peekRoom() {
    const r = P.radius * 0.6, x = this.pos[0], z = this.pos[2];
    const top = this.pos[1] + P.peekEye + 0.12;
    if (this.world.hit([x - r, this.pos[1] + P.crouchHeight, z - r], [x + r, top, z + r])) return 0;
    return 1;
  }
  get stanceHeight() { return this.stance === 2 ? P.proneHeight : this.stance === 1 ? P.crouchHeight : P.height; }
  // Change stance if there is room for it. Returns true if it happened.
  setStance(n) {
    if (n === this.stance) return true;
    if (n !== 1) { this.peek = 0; this.lean = 0; }
    const h = n === 2 ? P.proneHeight : n === 1 ? P.crouchHeight : P.height;
    if (h > this.h && !this.free(this.pos, h)) return false;
    this.stance = n; this.h = h; this.crouching = n > 0;
    return true;
  }
  lookDir() { const cp = Math.cos(this.pitch); return [-Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp]; }
  // Where the eyes are: over the body, or leaned out round a corner.
  get eyePos() {
    const o = this.leanOffset();
    return [this.pos[0] + o[0], this.pos[1] + (this.mode === 'swim' ? P.eye : this.eyeHeight), this.pos[2] + o[1]];
  }
  leanOffset() {
    if (!this.lean) return [0, 0];
    const f = forwardOf(this.yaw);
    // your right hand, from the way you face
    const rx = -f[2], rz = f[0];
    return [rx * this.lean * P.leanReach, rz * this.lean * P.leanReach];
  }
  // Crouched and aiming, face-on to a wall near its edge: find which side
  // you could lean out to see past it, and how far.
  cornerLean() {
    if (this.stance !== 1 || this.mode !== 'walk' || !this.onGround) return 0;
    const f = forwardOf(this.yaw);
    const fx = f[0], fz = f[2];
    const y = this.pos[1] + P.crouchEye;
    const eye = [this.pos[0], y, this.pos[2]];
    const ahead = this.world.raycast(eye, [fx, 0, fz], 1.1);
    if (!ahead) return 0;                          // nothing in front: nothing to lean round
    const rx = -fz, rz = fx;
    for (const reach of [0.3, 0.45, 0.6]) {
      for (const side of [1, -1]) {
        const ox = eye[0] + rx * side * reach, oz = eye[2] + rz * side * reach;
        const r = 0.12;
        if (this.world.hit([ox - r, y - r, oz - r], [ox + r, y + r, oz + r])) continue;   // head in the wall
        const past = this.world.raycast([ox, y, oz], [fx, 0, fz], 2.5);
        if (!past || past.t > 1.6) {
          // clear of the edge: go a little further so the shot has room, if
          // that does not put your head into something else
          const more = Math.min(P.leanReach, reach + 0.15);
          const mx = eye[0] + rx * side * more, mz = eye[2] + rz * side * more;
          const roomy = !this.world.hit([mx - r, y - r, mz - r], [mx + r, y + r, mz + r]);
          return side * ((roomy ? more : reach) / P.leanReach);
        }
      }
    }
    return 0;
  }

  // Water state helpers ------------------------------------------------------
  waterInfo() {
    const col = this.world.waterColumn(this.pos[0], this.pos[2]);
    if (!col) return null;
    const surface = col.max[1];
    const depthAtFeet = surface - this.pos[1];
    if (depthAtFeet <= 0) return null;
    // (the casino's roof pool: the floors under it counted as its deep end) below its bottom is not in it
    if (this.pos[1] < col.min[1] - 0.5) return null;
    const eyeY = this.pos[1] + P.eye;
    return { vol: col, surface, depthAtFeet, eyeUnder: eyeY < surface, floor: col.min[1] };
  }
  get underwater() {
    const w = this.waterInfo();
    return !!(w && this.pos[1] + (this.mode === 'swim' ? P.eye : this.eyeHeight) < w.surface);
  }

  damage(n, why, from) {
    if (this.mode === 'dead' || n <= 0) return;
    if (this.skills && this.skills.tough && why !== 'fall') n *= this.skills.tough;     // (M6.29) Hard to Kill
    this.health = Math.max(0, this.health - n);
    this.sinceDamage = 0;
    this.events.push({ type: 'hurt', amount: n, why });
    if (this.health <= 0) {
      // which way the body goes down: away from whatever hit it
      const look = this.lookDir();
      this.deathFace = from
        ? (look[0] * (from[0] - this.pos[0]) + look[2] * (from[2] - this.pos[2]) > 0 ? 1 : -1)
        : (why === 'fell' ? 1 : -1);
      this.mode = 'dead';
      this.vel = [0, 0, 0];
      this.events.push({ type: 'died', why });
    }
  }

  // Main step ----------------------------------------------------------------
  step(dt, input) {
    this.time += dt;
    this.prompt = '';
    this.yaw = input.yaw; this.pitch = input.pitch;
    // which way your keys are taking you, flat (for shoving people)
    {
      const mx = input.moveX || 0, mz = input.moveZ || 0, f = [-Math.sin(this.yaw), -Math.cos(this.yaw)], r = [Math.cos(this.yaw), -Math.sin(this.yaw)];
      const ix = f[0] * mz + r[0] * mx, iz = f[1] * mz + r[1] * mx, il = Math.hypot(ix, iz);
      this.intent = il > 0.1 ? [ix / il, iz / il] : null;
    }
    if (this.mode === 'dead') return;
    // at the wheel: where the driver's seat is, moving as it moves
    if (this.driving) {
      const v = this.driving, st = v.seat(), f = [-Math.sin(v.yaw), -Math.cos(v.yaw)];
      this.pos = [st[0], st[1] - 0.55, st[2]]; this.vel = [f[0] * v.speed, 0, f[1] * v.speed];
      this.onGround = true; this.mode = 'walk'; this.stance = 0; this.sprinting = false;
      this.noise = Math.abs(v.speed) > 2 ? 0.9 : 0.4; this.airTime = 0; this.fallPeak = this.pos[1];
      this.sinceDamage += dt;
      return;
    }
    // (Rhys: "when you sit in the train, you should actually sit") seated: held in the
    // seat, eyes at a sitting height; any step, a jump or a crouch stands you up again
    if (this.seated) {
      // (Rhys: "for at least a moment") the first moment seated, you stay seated whatever you press
      this.seated.hold = Math.max(0, this.seated.hold - dt);
      if (this.seated.hold <= 0 && (Math.hypot(input.moveX || 0, input.moveZ || 0) > 0.1 || input.jumpPressed || input.crouch)) { this.stand(); }
      else { this.pos = this.seated.pos.slice(); this.vel = [0, 0, 0]; this.onGround = true; this.noise = 0; return; }
    }

    this.sinceDamage += dt;
    // (Rhys: food and drink "heal you... but you won't have taken any damage while it's available")
    // not healing: a coffee or a tea keeps you going (stamina lasts, comes back quicker); a meal, a while
    // after, mends you quicker when you are hurt. buffs: seconds left of each
    const B = this.buffs || (this.buffs = { awake: 0, fed: 0 });
    B.awake = Math.max(0, B.awake - dt); B.fed = Math.max(0, B.fed - dt);
    if (this.sinceDamage > (B.fed > 0 ? P.regenDelay * 0.5 : P.regenDelay) && this.health < 100) this.health = Math.min(100, this.health + P.regenRate * (B.fed > 0 ? 2 : 1) * dt);

    if (this.mode === 'traverse') { this.stepTraverse(dt); return; }

    const water = this.waterInfo();
    const swimming = water && water.depthAtFeet > 1.25 && !(this.onGround && water.depthAtFeet < 1.4);
    if (this.mode === 'ladder') this.stepLadder(dt, input);
    else if (swimming) { if (this.chute) { this.chute = false; this.events.push({ type: 'chute', open: false }); } if (this.mode !== 'swim') this.enterWater(water); this.stepSwim(dt, input, water); }
    else { if (this.mode === 'swim') this.mode = 'walk'; this.stepWalk(dt, input, water); }

    // breath
    if (this.mode !== 'dead') {
      if (this.underwater) {
        this.breath -= dt * (this.breathMul === undefined ? 1 : this.breathMul);     // (M6.29) a rebreather: slowly, or not at all
        if (this.breath <= 0) { this.breath = 0; this.damage(P.drownDmg * dt, 'drowned'); }
      } else this.breath = Math.min(P.breathMax, this.breath + P.breathRegen * dt);
    }
  }

  // Standing / walking / falling ----------------------------------------------
  stepWalk(dt, input, water) {
    // C cycles the stance: stand -> crouch -> prone -> stand.
    const wantCrouch = !!input.crouch;
    // a quick tap counts even if the key was down and up between frames
    const crouchEdge = !!input.crouchPressed || (wantCrouch && !this.prevCrouch);
    if (crouchEdge) {
      if (this.onGround) {
        const next = this.stance === 0 ? 1 : this.stance === 1 ? 2 : 0;
        if (!this.setStance(next) && next === 0) {
          // no room to stand from prone: settle for a crouch, or stay down
          if (!this.setStance(1)) this.prompt = 'No room to move';
        }
      } else if (this.stance === 0) this.setStance(1);   // tuck in mid-air
    } else if (!wantCrouch && this.stance === 1 && !input.crouchCycle) {
      // holding C and letting go behaves like a simple crouch
      if (!this.setStance(0)) this.prompt = 'No room to stand';
    }

    // crouching in mid-air cuts a jump short
    const crouchPressed = crouchEdge;
    this.prevCrouch = wantCrouch;
    if (crouchPressed && !this.onGround && this.vel[1] > 0) {
      this.vel[1] = 0;
      this.events.push({ type: 'jumpcut' });
    }

    // peeking over cover: crouched, aiming, on your feet and with headroom
    const wantPeek = this.stance === 1 && !!input.aim && this.onGround && this.mode === 'walk' ? this.peekRoom() : 0;
    const k = 1 - Math.exp(-dt * P.peekRate);
    this.peek += (wantPeek - this.peek) * k;
    if (this.peek < 0.01) this.peek = 0;
    if (this.peek > 0.998) this.peek = 1;
    // and round a corner: the same aim, when the wall ahead has an edge
    const wantLean = input.aim ? this.cornerLean() : 0;
    this.lean += (wantLean - this.lean) * (1 - Math.exp(-dt * P.leanRate));
    if (Math.abs(this.lean) < 0.01) this.lean = 0;
    if (this.stance === 1 && wantPeek && this.peek > 0.5) this.prompt = this.prompt || '';

    // stamina
    const moving = Math.abs(input.moveX) + Math.abs(input.moveZ) > 0.1;
    const runDir = input.moveZ > 0.1 || Math.abs(input.moveX) > 0.5;
    // (Rhys: "you can 'sprint' while skydiving?") a sprint is on your feet: not falling, not under a canopy
    let sprinting = input.sprint && moving && runDir && !input.aim && !this.exhausted && !this.chute && (this.onGround || (this.airTime || 0) < 0.4);
    const strafeRun = sprinting && input.moveZ <= 0.1;
    if (sprinting) {
      this.stamina -= P.sprintDrain * (this.crouching ? 0.75 : 1) * (this.buffs && this.buffs.awake > 0 ? 0.6 : 1) * (this.load ? this.load.drain : 1) * dt; this.sinceStamina = 0;
      if (this.stamina <= P.staminaFloor) { this.stamina = P.staminaFloor; this.exhausted = true; sprinting = false; }
      else if (this.stamina < 0) this.exhausted = true;
    } else {
      this.sinceStamina += dt;
      if (this.sinceStamina > P.staminaDelay) this.stamina = Math.min(P.staminaMax, this.stamina + P.staminaRegen * (this.buffs && this.buffs.awake > 0 ? 1.5 : 1) * ((this.skills && this.skills.wind) || 1) * dt);
    }
    if (this.stamina < 0) this.exhausted = true;                        // whatever spent it
    if (this.exhausted && this.stamina >= 0) this.exhausted = false;   // back to zero and you may go again
    this.sprinting = sprinting;
    this.crouchSprinting = sprinting && this.crouching;
    // a run-up: measured by time, not speed, because pressing into a wall
    // stops you dead while you are still very much running at it
    if (this.onGround) this.runFor = sprinting && input.moveZ > 0.5 && this.stance === 0 ? this.runFor + dt : 0;
    this.noise = !moving ? P.noise.still : this.stance === 2 ? P.noise.prone
      : this.stance === 1 ? (sprinting ? P.noise.crouchSprint : P.noise.crouch)
      : sprinting ? P.noise.sprint : P.noise.walk;
    if (moving && this.load) this.noise *= this.load.noise;   // a heavy kit rattles
    if (moving && this.skills) this.noise *= this.skills.ghost || 1;     // (M6.29) Light Feet

    // a sideways dash: tap sprint while stepping left or right
    this.dashCd = Math.max(0, this.dashCd - dt);
    const fwd = forwardOf(this.yaw), rgt = rightOf(this.yaw);
    if (this.dashT > 0) {
      this.dashT -= dt;
      this.moveH(0, this.vel[0] * dt);
      this.moveH(2, this.vel[2] * dt);
      this.vel[1] -= P.gravity * dt;
      this.moveV(this.vel[1] * dt);
      this.noise = P.noise.sprint;
      if (this.dashT <= 0) { this.vel[0] *= 0.35; this.vel[2] *= 0.35; }
      return;
    }
    // either order: tap sprint while stepping aside, or step aside while sprinting
    const backRoll = input.sprintPressed && input.moveZ < -0.5 && Math.abs(input.moveX) < 0.5;
    const dashAsked = (input.sprintPressed && Math.abs(input.moveX) > 0.5) ||
      (input.strafePressed && input.sprint) || backRoll;
    if (dashAsked && this.onGround && this.stance !== 2 &&
        Math.abs(input.moveZ) < 0.6 && this.stamina > 0 && this.dashCd <= 0) {
      const dir = Math.sign(input.moveX) || (input.strafePressed === 'right' ? 1 : -1);
      if (backRoll) {
        // a roll backwards, out of trouble
        this.vel[0] = -fwd[0] * P.dashSpeed * 0.85;
        this.vel[2] = -fwd[2] * P.dashSpeed * 0.85;
        this.rolling = true;
      } else {
        this.rolling = false;
        this.vel[0] = rgt[0] * dir * P.dashSpeed + fwd[0] * input.moveZ * 2;
        this.vel[2] = rgt[2] * dir * P.dashSpeed + fwd[2] * input.moveZ * 2;
      }
      this.dashT = P.dashTime; this.dashCd = P.dashCooldown;
      this.stamina = Math.max(P.staminaFloor, this.stamina - P.dashCost); this.sinceStamina = 0;
      this.events.push({ type: 'dash', dir });
      return;
    }

    // desired horizontal velocity
    const f = fwd, r = rgt;
    let mz = input.moveZ, mx = input.moveX;
    const len = Math.hypot(mx, mz);
    if (len > 1) { mx /= len; mz /= len; }
    let speed = this.stance === 2 ? (sprinting ? P.proneShuffle : P.proneSpeed)
      : this.stance === 1 ? (sprinting ? P.crouchSprint : P.crouchSpeed)
      : sprinting ? P.sprint : P.walk;
    if (this.load) speed *= this.load.speed;   // weight
    if (strafeRun) speed *= 0.82;          // quick, but not a full forward sprint
    if (this.stamina < 0) speed *= 0.55;   // winded: everything is a slog
    if (input.aim) speed *= P.aimMul;
    if (mz < 0) speed *= P.backMul;
    if (water) speed *= 0.6;                      // wading
    const wx = (f[0] * mz + r[0] * mx) * speed;
    const wz = (f[2] * mz + r[2] * mx) * speed;
    const accel = this.onGround ? P.accelGround : P.accelAir;
    this.vel[0] = approach(this.vel[0], wx, accel * dt);
    this.vel[2] = approach(this.vel[2], wz, accel * dt);
    if (this.onGround && !moving) {
      const k = Math.max(0, 1 - P.friction * dt);
      this.vel[0] *= k; this.vel[2] *= k;
    }

    // traversal / jump
    // running at a thin wall takes you over it and down the far side; walking
    // up to it and pressing SPACE puts you on top, as before
    const running = !!input.sprint && input.moveZ > 0.5 && this.stance === 0;
    const ledge = this.findLedge(this.onGround ? P.mantleMax : P.mantleAirReach, { over: running });
    if (ledge && this.onGround) this.prompt = ledge.kind === 'vault' ? 'SPACE  Vault' : ledge.kind === 'over' ? 'SPACE  Over' : 'SPACE  Climb';
    // too high to reach from the ground, but you are running at it: run up it
    // it needs the breath to finish: a kick you cannot follow with a grab is wasted
    const canKick = !ledge && this.onGround && running && sprinting && this.runFor >= P.runUpTime &&
      this.stamina > P.wallKickCost && this.wallAhead();
    if (canKick) this.prompt = 'SPACE  Run up';
    if (canKick && input.jumpPressed) {
      const fk = forwardOf(this.yaw);
      this.vel = [fk[0] * 0.8, P.wallKick, fk[2] * 0.8];      // still leaning into it
      this.onGround = false;
      this.runFor = 0;
      this.stamina = Math.max(P.staminaFloor, this.stamina - P.wallKickCost); this.sinceStamina = 0;
      this.events.push({ type: 'wallkick' });
      // no return: the rest of this step moves you as a jump would
    }
    // sprinting straight at something waist-high takes it in stride
    const autoMax = input.autoVaultMax === undefined ? P.autoTraverseMax : input.autoVaultMax;
    if (ledge && sprinting && !this.crouching && input.moveZ > 0.5 && ledge.rise <= autoMax && this.stamina > 0) {
      this.startTraverse(ledge, true); return;
    }
    if (input.jumpPressed) {
      if (ledge && (this.onGround || input.moveZ > 0.1) && this.stamina > 0) { this.startTraverse(ledge, sprinting); return; }
      if (this.onGround && this.stance !== 0) {
        // SPACE from a crouch or from prone gets you on your feet - no
        // crouch-jumping. From prone with a low roof, settle for a crouch.
        if (!this.setStance(0) && this.stance === 2) this.setStance(1);
        if (this.stance !== 0 && this.stance !== 1) this.prompt = 'No room to stand';
      } else if (this.onGround) {
        if (this.stamina > 0) {
          this.vel[1] = this.stance === 1 ? P.crouchJump : P.jump; this.onGround = false;
          this.stamina = Math.max(P.staminaFloor, this.stamina - P.jumpCost); this.sinceStamina = 0;
          this.events.push({ type: 'jump' });
        }
      }
    } else if (!this.onGround && ledge && input.moveZ > 0.1 && this.vel[1] < 2.2 && this.stamina > 0) {
      // Jump and grab: reach a ledge in mid-air and haul yourself up. You do
      // not have to hold SPACE - coming at it while moving forward is enough,
      // the way you would put your hands out.
      this.startTraverse(ledge); return;
    }

    // ladders: walk into one while facing it
    const b = this.box();
    const lad = this.world.ladderAt(b[0], b[1]);
    // (Rhys) which ladder you were already standing in last step: W
    // only catches hold of one you are already in if you are heading for its
    // wall - with it behind you, W walks you away from it
    const entered = lad && lad !== this.ladderVol;
    this.ladderVol = lad || null;
    if (lad) {
      const dot = -(f[0] * lad.face[0] + f[2] * lad.face[1]);
      const facing = dot > 0.35;
      // walking into it from behind or the side counts too: you are put on the
      // climbing face either way
      const sideOn = Math.abs(dot) <= 0.35 || dot < -0.35;
      // backing down onto a ladder from the top: you face the wall, as when climbing
      const backing = facing && input.moveZ < -0.1 && this.pos[1] > lad.min[1] + 1.5;
      // the way your keys are taking you, and whether that is towards the wall
      const rg = rightOf(this.yaw);
      const mv = [f[0] * input.moveZ + rg[0] * input.moveX, f[2] * input.moveZ + rg[2] * input.moveX];
      const ml = Math.hypot(mv[0], mv[1]);
      const toWall = ml > 0.1 && -(mv[0] * lad.face[0] + mv[1] * lad.face[1]) / ml > 0.35;
      // at the top, walking forward means walking away onto the platform
      const grabbing = (toWall || (entered && (facing || sideOn))) && input.moveZ > 0.1 && this.pos[1] < lad.max[1] - 1.0;
      // (the factory's hatches) from the floor above, walking into a
      // ladder's top - any way round - takes hold of it, turned to face the
      // wall, ready to go down: rather than dropping through the hatch
      const fromTop = entered && this.onGround && this.pos[1] > lad.max[1] - 0.8 && ml > 0.1;
      if (grabbing || backing || fromTop) {
        // line up in the ladder's column, if there is room
        const spot = this.pos.slice();
        spot[0] = (lad.min[0] + lad.max[0]) / 2; spot[2] = (lad.min[2] + lad.max[2]) / 2;
        if (this.free(spot, P.height) || this.free(spot)) {
          this.pos = spot;
          // turn to face the wall, however you arrived
          this.yaw = Math.atan2(lad.face[0], lad.face[1]);
          this.setStance(0);          // you climb standing, whatever you were doing before
          this.mode = 'ladder'; this.ladder = lad; this.vel = [0, 0, 0];
          return;
        }
      }
      // only offer the climb when pressing forward would actually work
      const straightOn = -(f[0] * lad.face[0] + f[2] * lad.face[1]) > 0.6;
      if (this.onGround && straightOn && this.pos[1] < lad.max[1] - 1.0) {
        const spot = this.pos.slice();
        spot[0] = (lad.min[0] + lad.max[0]) / 2; spot[2] = (lad.min[2] + lad.max[2]) / 2;
        if (this.free(spot, P.height) || this.free(spot)) this.prompt = 'W  Climb ladder';
      }
    }

    // (Rhys: a parachute, to jump off the casino's roof and come
    // down by the jeep) falling, with the pack on: SPACE opens it. Under the
    // canopy you sink slowly and glide the way you face - W to glide on, S to
    // hang back, A and D to slip sideways; the mouse steers.
    const jetReady = this.jetPack && (this.jetFuel || 0) > 0.05;
    if (!this.onGround && this.parachute && !this.chute && !jetReady && this.vel[1] < -CHUTE.openBelow && this.airTime > 0.25) {
      this.prompt = 'SPACE  Open parachute';
      if (input.jumpPressed) { this.chute = true; this.parachute = false; this.events.push({ type: 'chute', open: true }); }
    }
    // a pack still being repacked: say so, rather than leave SPACE doing nothing
    else if (!this.onGround && !this.parachute && !this.chute && this.chuteRepacking && this.vel[1] < -CHUTE.openBelow && this.airTime > 0.25) this.prompt = 'Your parachute is not packed  -  repack it on the ground (hold E)';
    if (this.chute) {
      const k = Math.min(1, dt * CHUTE.settle), rg2 = rightOf(this.yaw);
      const glide = CHUTE.glide + CHUTE.push * (input.moveZ || 0), slip = CHUTE.slip * (input.moveX || 0);
      const want = [f[0] * glide + rg2[0] * slip, f[2] * glide + rg2[2] * slip];
      this.vel[0] += (want[0] - this.vel[0]) * k; this.vel[2] += (want[1] - this.vel[2]) * k;
      this.vel[1] += (-CHUTE.sink - this.vel[1]) * Math.min(1, dt * CHUTE.brake);
      const fallSpeed = -this.vel[1];
      this.moveH(0, this.vel[0] * dt);
      this.moveH(2, this.vel[2] * dt);
      const landed = this.moveV(this.vel[1] * dt);
      this.airTime += dt;
      if (landed || this.onGround) {
        this.chute = false; this.airTime = 0;
        this.events.push({ type: 'chute', open: false }, { type: 'land', speed: fallSpeed });
      }
      return;
    }

    // (Rhys: the Jump Pack - "self-fuelling jetpack, but fuel regens slowly. SOME directional
    // control, but mainly for escaping situations quickly") SPACE held in the air: up, and a little steering
    if (this.jetPack) {
      if (this.jetFuel === undefined) this.jetFuel = 1;
      this.jetting = !this.onGround && !!input.jump && this.jetFuel > 0 && this.airTime > 0.12 && this.mode === 'walk';
      if (this.jetting) {
        this.jetFuel = Math.max(0, this.jetFuel - dt / JET.burn);
        this.vel[1] = Math.min(JET.climb, this.vel[1] + (P.gravity + JET.thrust) * dt);
        const fj = forwardOf(this.yaw), rj = rightOf(this.yaw);
        const wx = (fj[0] * (input.moveZ || 0) + rj[0] * (input.moveX || 0)) * JET.drift, wz = (fj[2] * (input.moveZ || 0) + rj[2] * (input.moveX || 0)) * JET.drift;
        this.vel[0] += (wx - this.vel[0]) * Math.min(1, dt * JET.steer); this.vel[2] += (wz - this.vel[2]) * Math.min(1, dt * JET.steer);
        this.noise = Math.max(this.noise || 0, 0.8);
      } else if (this.onGround) {
        this.jetRest = (this.jetRest || 0) + dt;
        if (this.jetRest > JET.restBefore) this.jetFuel = Math.min(1, this.jetFuel + dt / JET.refill);
      }
      if (this.jetting) this.jetRest = 0;
    } else this.jetting = false;

    // gravity and movement
    this.vel[1] -= P.gravity * dt;
    if (this.vel[1] < -45) this.vel[1] = -45;
    const wasGround = this.onGround;
    const fallSpeed = -this.vel[1];
    this.moveH(0, this.vel[0] * dt);
    this.moveH(2, this.vel[2] * dt);
    const landed = this.moveV(this.vel[1] * dt);

    if (!this.onGround) {
      this.airTime += dt;
      if (wasGround && this.vel[1] <= 0) this.snapDown();
    } else this.airTime = 0;

    if (landed) {
      const w = this.waterInfo();
      if (fallSpeed > P.fallSafe && !(w && w.depthAtFeet > 0.9)) {
        let dmg = (fallSpeed - P.fallSafe) * P.fallDmg;
        if (input.crouch) dmg *= 0.8;             // tuck and roll
        if (this.fallMul !== undefined) dmg *= this.fallMul;   // Cushioned Landing
        this.damage(dmg, 'fell');
      }
      this.events.push({ type: 'land', speed: fallSpeed });
    }
  }

  // Walking down stairs should stick to them rather than float off each step.
  snapDown() {
    const g = this.world.groundBelow(this.pos[0], this.pos[1], this.pos[2], P.radius - 0.02);
    if (g > -Infinity && this.pos[1] - g <= P.stepUp + 0.01) {
      this.pos[1] = g; this.vel[1] = 0; this.onGround = true;
    }
  }

  moveH(axis, d) {
    if (!d) return;
    this.pos[axis] += d;
    const b = this.box();
    const hits = this.world.hits(b[0], b[1]);
    if (!hits.length) return;
    // try stepping up onto low things
    // (Rhys: down the spiral stairs you could "sort of walk down the
    // handrail instead") a rail is never stepped up onto: going down, the rail
    // of the tread two or three below stands under half a metre above your feet
    if (this.onGround && !hits.some((s) => s.person || s.tag === 'rail')) {    // nobody steps up onto a person
      let top = -Infinity;
      for (const s of hits) top = Math.max(top, s.max[1]);
      const rise = top - this.pos[1];
      if (rise > 0 && rise <= P.stepUp) {
        const up = [this.pos[0], top + 1e-4, this.pos[2]];
        if (this.free(up)) { this.pos[1] = top + 1e-4; return; }
      }
    }
    for (const s of hits) {
      if (d > 0) this.pos[axis] = Math.min(this.pos[axis], s.min[axis] - P.radius - 1e-4);
      else this.pos[axis] = Math.max(this.pos[axis], s.max[axis] + P.radius + 1e-4);
    }
    this.vel[axis] = 0;
  }

  // Returns true on landing this frame.
  moveV(d) {
    this.pos[1] += d;
    const b = this.box();
    const hits = this.world.hits(b[0], b[1]);
    const was = this.onGround;
    if (!hits.length) {
      // still standing? probe a hair below
      const pb = this.box([this.pos[0], this.pos[1] - 0.02, this.pos[2]]);
      this.onGround = d <= 0 && !!this.world.hit(pb[0], pb[1]);
      if (this.onGround) this.vel[1] = Math.max(0, this.vel[1]);
      return !was && this.onGround;
    }
    // Only what you were above before this step can be landed on, and only
    // what was over your head can stop you rising. Anything else overlapping
    // you moved into you - a guard walking into you - and pushes you aside.
    // (that used to lift you onto his head, then through each floor
    // above in turn, and onto the roof.) People are never stood on.
    if (d <= 0) {
      const before = this.pos[1] - d;
      let top = -Infinity; const into = [];
      for (const s of hits) {
        if (!s.person && s.max[1] <= before + 0.02) top = Math.max(top, s.max[1]);
        else into.push(s);
      }
      if (into.length) this.pushOut(into);
      if (top > -Infinity) {
        this.pos[1] = top;
        this.vel[1] = 0;
        this.onGround = true;
        return !was;
      }
      const pb = this.box([this.pos[0], this.pos[1] - 0.02, this.pos[2]]);
      this.onGround = !!this.world.hits(pb[0], pb[1]).some((s) => !s.person);
      if (this.onGround) this.vel[1] = Math.max(0, this.vel[1]);
      return !was && this.onGround;
    }
    const headBefore = this.pos[1] - d + this.h;
    let bottom = Infinity; const into = [];
    for (const s of hits) {
      if (!s.person && s.min[1] >= headBefore - 0.02) bottom = Math.min(bottom, s.min[1]);
      else into.push(s);
    }
    if (into.length) this.pushOut(into);
    if (bottom < Infinity) { this.pos[1] = bottom - this.h - 1e-4; this.vel[1] = 0; }
    return false;
  }

  // Out of anything that has moved into you, sideways, the shortest way.
  pushOut(solids) {
    for (const s of solids) {
      const [lo, hi] = this.box();
      const ox = Math.min(hi[0] - s.min[0], s.max[0] - lo[0]);
      const oz = Math.min(hi[2] - s.min[2], s.max[2] - lo[2]);
      if (ox <= 0 || oz <= 0) continue;
      const cx = (s.min[0] + s.max[0]) / 2, cz = (s.min[2] + s.max[2]) / 2;
      if (ox < oz) this.pos[0] += (this.pos[0] < cx ? -1 : 1) * (ox + 1e-3);
      else this.pos[2] += (this.pos[2] < cz ? -1 : 1) * (oz + 1e-3);
    }
  }

  // Ledges ---------------------------------------------------------------------
  // Something climbable right in front of you, chest high: what a run-up kicks off.
  wallAhead() {
    const f = forwardOf(this.yaw), r = P.radius;
    const X = this.pos[0], Y = this.pos[1], Z = this.pos[2];
    const ax = X + f[0] * (r - 0.02), az = Z + f[2] * (r - 0.02);
    const bx = X + f[0] * (r + 0.45), bz = Z + f[2] * (r + 0.45);
    const hits = this.world.hits([Math.min(ax, bx) - 0.1, Y + 0.6, Math.min(az, bz) - 0.1],
      [Math.max(ax, bx) + 0.1, Y + 1.7, Math.max(az, bz) + 0.1]);
    return hits.length > 0 && !hits.some((s) => s.noClimb);
  }

  // Looks straight ahead for something to vault over or climb onto.
  // opts.over: running, so a thin wall is gone over rather than stood on.
  findLedge(reach, opts) {
    const f = forwardOf(this.yaw);
    const r = P.radius, W = this.world;
    const X = this.pos[0], Y = this.pos[1], Z = this.pos[2];
    const at = (d) => [X + f[0] * d, Z + f[2] * d];
    // a slice from the front of the body to just over half a metre ahead
    const [ax, az] = at(r - 0.02), [bx, bz] = at(r + 0.55);
    const lo = [Math.min(ax, bx) - 0.12, Y + 0.3, Math.min(az, bz) - 0.12];
    const hi = [Math.max(ax, bx) + 0.12, Y + reach, Math.max(az, bz) + 0.12];
    const hits = W.hits(lo, hi);
    if (!hits.length) return null;
    // The ledge is the top of what stands in front of you, stacked from the
    // bottom up; something higher, above a gap (the wall over a window), is
    // not part of it - the check for room above the ledge deals with it.
    let top = -Infinity;
    const stack = hits.slice().sort((p, q) => p.min[1] - q.min[1]);
    for (const s of stack) {
      if (top > -Infinity && s.min[1] > top + 0.05) break;
      if (s.noClimb) return null;      // wire: nothing to get hold of
      top = Math.max(top, s.max[1]);
    }
    const rise = top - Y;
    if (rise <= P.stepUp || rise > reach) return null;
    // where along the facing direction the top surface starts and ends
    const solidAt = (d) => { const [qx, qz] = at(d); return !!W.hit([qx - 0.04, top - 0.05, qz - 0.04], [qx + 0.04, top - 0.01, qz + 0.04]); };
    let start = -1, end = -1;
    for (let d = r - 0.02; d <= r + 3.2; d += 0.04) {
      if (solidAt(d)) { if (start < 0) start = d; end = d; }
      else if (start >= 0) break;
    }
    if (start < 0 || start > r + 0.6) return null;
    const depth = end - start + 0.04;
    // a real ledge: nothing solid just above that top
    const [sx, sz] = at(start + 0.04);
    if (W.hit([sx - 0.12, top + 0.02, sz - 0.12], [sx + 0.12, top + 1.0, sz + 0.12])) return null;
    // head room on the way up
    if (W.hit([X - r, Y, Z - r], [X + r, top + 1.0, Z + r])) return null;

    // vault: low and thin, with somewhere to land on the far side
    if (rise <= P.vaultMax && depth <= P.vaultDepthMax) {
      const [lx, lz] = at(end + 0.04 + r + 0.12);
      const land = [lx, Y, lz];
      if (this.free(land, P.height) && !W.hit([Math.min(X, lx) - r, top + 0.05, Math.min(Z, lz) - r], [Math.max(X, lx) + r, top + 0.9, Math.max(Z, lz) + r])) {
        return { kind: 'vault', top, land, rise, depth };
      }
    }
    // over: taller than a vault but still thin - hands on top, swing the legs
    // over and drop down the far side, if there is somewhere sensible to land
    if (opts && opts.over && rise > P.vaultMax && depth <= P.overDepthMax) {
      const [lx, lz] = at(end + 0.04 + r + 0.15);
      const g = W.groundBelow(lx, top - 0.05, lz, r);
      const clear = !W.hit([Math.min(X, lx) - r, top + 0.05, Math.min(Z, lz) - r], [Math.max(X, lx) + r, top + 1.0, Math.max(Z, lz) + r]);
      if (g > -Infinity && top - g <= P.overDropMax && clear && this.free([lx, g, lz], P.height)) {
        const [cx, cz] = at((start + end) / 2);
        return { kind: 'over', top, land: [lx, g, lz], crest: [cx, top + 0.02, cz], rise, depth, drop: top - g };
      }
    }
    // climb onto it, standing if there is room, crouched if not
    for (let push = 0.05; push <= 0.65; push += 0.1) {
      const [tx, tz] = at(start + r + push - 0.1);
      const t = [tx, top + 1e-4, tz];
      if (!solidAt(start + r + push - 0.1) && !solidAt(start + push)) continue;
      if (this.free(t, P.height)) return { kind: 'climb', top, land: t, rise, crouch: false };
      if (this.free(t, P.crouchHeight)) return { kind: 'climb', top, land: t, rise, crouch: true };
    }
    return null;
  }

  startTraverse(ledge, running) {
    const from = this.pos.slice();
    // a traversal is one or more legs, each a smooth curve through a corner
    let legs;
    if (ledge.kind === 'vault') {
      const mid = [(from[0] + ledge.land[0]) / 2, ledge.top + 0.25, (from[2] + ledge.land[2]) / 2];
      legs = [{ pts: [from, mid, ledge.land.slice()], dur: running ? 0.34 : 0.42 }];
    } else if (ledge.kind === 'over') {
      // up onto the top, then out and down the far side
      const up = [from[0], ledge.top + 0.05, from[2]];
      const out = [ledge.land[0], ledge.top + 0.12, ledge.land[2]];
      legs = [
        { pts: [from, up, ledge.crest.slice()], dur: 0.2 + ledge.rise * 0.1 },
        { pts: [ledge.crest.slice(), out, ledge.land.slice()], dur: 0.22 + ledge.drop * 0.07 },
      ];
    } else {
      const up = [from[0], ledge.top + 0.05, from[2]];
      legs = [{ pts: [from, up, ledge.land.slice()], dur: (running ? 0.22 : 0.35) + ledge.rise * (running ? 0.12 : 0.18) }];
    }
    const dur = legs.reduce((a, l) => a + l.dur, 0);
    // pts: from, a middle, and where you end up (the last leg's end)
    const pts = [from, legs[0].pts[1], legs[legs.length - 1].pts[2]];
    this.mode = 'traverse';
    this.traverse = { kind: ledge.kind, legs, pts, t: 0, dur, crouch: !!ledge.crouch, keep: forwardOf(this.yaw),
      running: !!running, drop: ledge.drop || 0 };
    const low = ledge.rise <= P.autoTraverseMax;
    this.stamina = Math.max(P.staminaFloor, this.stamina - (ledge.kind === 'vault' ? 3 : low ? P.lowClimbCost : P.mantleCost));
    this.sinceStamina = 0;
    this.vel = [0, 0, 0];
    if (ledge.crouch) this.setStance(1);
    this.events.push({ type: ledge.kind });
  }

  stepTraverse(dt) {
    const tr = this.traverse;
    tr.t += dt;
    // which leg we are on, and how far along it
    let t = Math.min(tr.t, tr.dur), leg = tr.legs[tr.legs.length - 1], k = 1;
    for (const l of tr.legs) {
      if (t <= l.dur) { leg = l; k = l.dur > 0 ? t / l.dur : 1; break; }
      t -= l.dur;
    }
    const [a, b, c] = leg.pts;
    // one smooth curve through the corner: no kink half way, so the camera
    // never jolts on a vault or a crate climb
    const u = ease(k), iu = 1 - u;
    this.pos = [
      iu * iu * a[0] + 2 * iu * u * b[0] + u * u * c[0],
      iu * iu * a[1] + 2 * iu * u * b[1] + u * u * c[1],
      iu * iu * a[2] + 2 * iu * u * b[2] + u * u * c[2],
    ];
    if (tr.t >= tr.dur) {
      this.pos = tr.pts[2].slice();
      this.mode = 'walk';
      this.onGround = true;
      this.traverse = null;
      this.airTime = 0;
      // keep running: a sprint vault or climb hands its speed straight back
      const carry = tr.running ? P.sprint : tr.kind === 'vault' || tr.kind === 'over' ? 3.5 : 0;
      this.vel[0] = tr.keep[0] * carry; this.vel[2] = tr.keep[2] * carry;
      if (tr.running) { this.sprinting = true; }
      // dropping down the far side of a wall lands like a drop
      if (tr.kind === 'over' && tr.drop > 0.6) this.events.push({ type: 'land', speed: Math.sqrt(2 * P.gravity * tr.drop) });
      this.moveV(-0.01);
    }
  }

  // Ladders --------------------------------------------------------------------
  stepLadder(dt, input) {
    const lad = this.ladder;
    this.ladderVol = lad;           // stepping off at the foot, you are still standing in it
    // W always climbs, S always descends. There is no sideways on a ladder.
    const climb = input.moveZ;
    this.vel = [0, climb * P.ladderSpeed, 0];
    // what could we step onto from here? (facing the wall, then either side)
    const wallYaw = Math.atan2(lad.face[0], lad.face[1]);
    const saveYaw = this.yaw;
    let step = null;
    for (const dy of [0, Math.PI / 2, -Math.PI / 2]) {
      this.yaw = wallYaw + dy;
      const l = this.findLedge(P.mantleWaterReach);
      if (l && l.kind === 'climb' && !l.crouch) { step = l; break; }
    }
    this.yaw = saveYaw;
    if (input.jumpPressed && step) { this.ladder = null; this.startTraverse(step); return; }
    if (input.crouch && !this.prevCrouch) {  // let go, without cycling the stance
      this.prevCrouch = true;
      this.mode = 'walk'; this.ladder = null;
      this.vel = [lad.face[0] * 0.8, 0, lad.face[1] * 0.8];
      return;
    }
    this.moveV(this.vel[1] * dt);
    // at the very top, carry on up onto whatever the ladder leads to
    if (climb > 0 && step && this.pos[1] > lad.max[1] - 1.2 && step.top > this.pos[1]) {
      this.ladder = null; this.startTraverse(step); return;
    }
    const b = this.box();
    if (!this.world.ladderAt(b[0], b[1]) || (climb < 0 && this.onGround)) {
      this.mode = 'walk'; this.ladder = null;
      return;
    }
    this.prompt = step ? 'W/S  Climb   SPACE  Step off   C  Let go' : 'W/S  Climb   C  Let go';
  }

  // Water ----------------------------------------------------------------------
  enterWater(w) {
    this.mode = 'swim';
    this.crouching = false; this.h = P.height;
    const impact = -this.vel[1];
    this.vel[1] *= 0.3;
    this.vel[0] *= 0.5; this.vel[2] *= 0.5;
    this.events.push({ type: 'splash', speed: impact });
  }

  stepSwim(dt, input, w) {
    const eyeY = this.pos[1] + P.eye;
    const atSurface = eyeY > w.surface - 0.35;
    const f = forwardOf(this.yaw), r = rightOf(this.yaw);
    // a ladder out of the water: swim into it (Rhys: the river's
    // ladders did nothing - only walking checked for ladders)
    {
      const b = this.box();
      const lad = this.world.ladderAt(b[0], b[1]);
      if (lad) {
        const dot = -(f[0] * lad.face[0] + f[2] * lad.face[1]);
        if (dot > -0.35 && this.pos[1] < lad.max[1] - 1.0) {
          const spot = this.pos.slice();
          spot[0] = (lad.min[0] + lad.max[0]) / 2; spot[2] = (lad.min[2] + lad.max[2]) / 2;
          if (input.moveZ > 0.1 && (this.free(spot, P.height) || this.free(spot))) {
            this.pos = spot;
            this.yaw = Math.atan2(lad.face[0], lad.face[1]);
            this.setStance(0);
            this.mode = 'ladder'; this.ladder = lad; this.vel = [0, 0, 0];
            return;
          }
          if (dot > 0.6) this.prompt = 'W  Climb ladder';
        }
      }
    }
    const fast = input.sprint && this.stamina > 0;
    const speed = fast ? P.swimFast : P.swim;
    if (fast) { this.stamina -= P.sprintDrain * 0.7 * dt; this.sinceStamina = 0; }
    else { this.sinceStamina += dt; if (this.sinceStamina > P.staminaDelay) this.stamina = Math.min(P.staminaMax, this.stamina + P.staminaRegen * dt); }
    this.sprinting = fast;

    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const diving = input.crouch || (input.moveZ > 0.1 && this.pitch < -0.45);
    let tx, ty, tz;
    if (atSurface && !diving) {
      // paddle along the top, bobbing at the surface
      tx = (f[0] * input.moveZ + r[0] * input.moveX) * speed * 0.8;
      tz = (f[2] * input.moveZ + r[2] * input.moveX) * speed * 0.8;
      const want = w.surface - P.eye + 0.12;
      ty = (want - this.pos[1]) * 6;
    } else {
      // underwater: swim where you look
      tx = (f[0] * cp * input.moveZ + r[0] * input.moveX) * speed;
      tz = (f[2] * cp * input.moveZ + r[2] * input.moveX) * speed;
      ty = sp * input.moveZ * speed + (input.jump ? speed * 0.8 : 0) - (input.crouch ? speed * 0.8 : 0);
      if (!input.jump && !input.crouch && Math.abs(input.moveZ) < 0.1) ty += 0.35;   // gentle float
    }
    const k = Math.min(1, dt * 4);
    this.vel[0] += (tx - this.vel[0]) * k;
    this.vel[1] += (ty - this.vel[1]) * k;
    this.vel[2] += (tz - this.vel[2]) * k;

    // climbing out: swim at a wall and press jump
    const ledge = this.findLedge(P.mantleWaterReach);
    if (ledge && atSurface) {
      this.prompt = 'SPACE  Climb out';
      if (input.jumpPressed) { this.startTraverse({ ...ledge, kind: 'climb' }); return; }
    } else if (atSurface && input.jumpPressed && !this.onGround) {
      this.vel[1] = 2.2;   // a little hop at the surface
    }

    this.onGround = false;
    this.moveH(0, this.vel[0] * dt);
    this.moveH(2, this.vel[2] * dt);
    this.moveV(this.vel[1] * dt);
    // never rise out of the water by swimming alone
    if (this.pos[1] + P.eye > w.surface + 0.3) { this.pos[1] = w.surface + 0.3 - P.eye; if (this.vel[1] > 0) this.vel[1] = 0; }
  }
}

function approach(v, target, delta) {
  if (v < target) return Math.min(target, v + delta);
  if (v > target) return Math.max(target, v - delta);
  return v;
}
function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function lerp3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
export { clamp };

// The camera's eye follows the body's (S.eye in main.js), a moment
// behind - smooth through stance changes and peeking.
export const EYE_FOLLOW = 12;
export function followEye(cur, target, dt) { return cur + (target - cur) * Math.min(1, dt * EYE_FOLLOW); }
// Where a round starts: where you see from (the camera's eye) - unless that is
// stale or far off (a teleport), then the body's eyes.
export function shotOrigin(eyePos, viewEye) {
  const v = viewEye, e = eyePos;
  return v && Math.hypot(v[0] - e[0], v[1] - e[1], v[2] - e[2]) < 0.8 ? v.slice() : e;
}

