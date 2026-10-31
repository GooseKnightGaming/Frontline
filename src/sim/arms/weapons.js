// FRONTLINE - weapons (simulation only: no graphics, fully testable).
// Five basic weapons for training: knife, pistol, assault rifle, sniper,
// grenades and flashbangs. Everything here is deliberately simple; the feel
// gets tuned later.

import { ITEMS, FAMILIES, AMMO, SLOTS, SLOT_KEY, Loadout, statsOf, itemKind, baseId } from './loadout.js';

// a round to the head arriving with at least this much damage kills outright
export const HEADSHOT_KILL = 15;

// Is it a headshot? Where the round went in, or - for a round travelling
// upward - where it goes in the next 30 cm inside him (Rhys: shot a
// guard up through the chin and it did not seem to affect him; the round
// went in just under the head line, so it counted as a body hit). A round
// coming down or level is judged where it went in, as before.
export function reachesHead(t, point, dir, depth) {
  if (!t || t.headY === undefined || !point) return false;
  if (point[1] >= t.headY) return true;
  if (!dir || !(dir[1] > 0) || !t.min || !t.max) return false;
  let go = depth === undefined ? 0.3 : depth;
  for (let i = 0; i < 3; i++) {            // stop where it leaves his box
    if (Math.abs(dir[i]) < 1e-9) continue;
    go = Math.min(go, ((dir[i] > 0 ? t.max[i] : t.min[i]) - point[i]) / dir[i]);
  }
  return point[1] + dir[1] * Math.max(0, go) >= t.headY;
}
export { ITEMS, MODS, Loadout, Crate, SLOTS, SLOT_KEY } from './loadout.js';

// Kept for the older tests and for anything still naming weapons directly.
export const WEAPONS = {
  KNIFE: { name: 'Combat Knife', kind: 'melee', slot: 1, damage: 55, rate: 0.55, range: 1.9, arc: 0.7, model: 'Dagger' },
  PISTOL: { name: 'Sidearm', kind: 'gun', slot: 2, damage: 26, rate: 0.16, mag: 15, reserve: 60, reload: 1.5,
    spread: 0.012, adsSpread: 0.004, recoil: 0.028, moveSpread: 0.03, muzzle: 380, model: 'Pistol_1' },
  RIFLE: { name: 'Assault Rifle', kind: 'gun', slot: 3, damage: 22, rate: 0.085, mag: 30, reserve: 180, reload: 2.2,
    auto: true, spread: 0.016, adsSpread: 0.006, recoil: 0.022, moveSpread: 0.04, muzzle: 720, model: 'AR_1' },
  SNIPER: { name: 'Sniper Rifle', kind: 'gun', slot: 4, damage: 95, rate: 1.25, mag: 5, reserve: 25, reload: 3.0,
    spread: 0.03, adsSpread: 0.0004, recoil: 0.09, moveSpread: 0.08, zoom: 4, muzzle: 860, model: 'Sniper_1' },
  GRENADE: { name: 'Frag Grenade', kind: 'throwable', slot: 5, count: 3, fuse: 3.0, throw: 17,
    blast: 7.5, damage: 110, model: 'Grenade_1' },
  // a guard's rocket, bursting where it lands (fired by the Fortress's launchers, not carried)
  ROCKET: { name: 'Rocket', kind: 'throwable', slot: 5, count: 0, fuse: 0, throw: 0, blast: 5.5, damage: 85, model: 'Grenade_1' },
  FLASHBANG: { name: 'Flashbang', kind: 'throwable', slot: 5, count: 2, fuse: 1.8, throw: 17,
    blast: 9, damage: 0, blind: 4.5, model: 'Grenade_2' },
};

// Deterministic random, so spread patterns can be tested.
function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; a >>>= 0; return a / 4294967296; };
}

// a fire lingers (an incendiary's `burn` seconds), and sets alight whoever is in it: he burns
// as long as he stays in it and BURN.after seconds more
export const BURN = { rate: 20, after: 4 };
const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };

// Z / X: a press of a quick-use key is a tap or a hold. A hold only
// means something - set off what you placed - when there is something placed;
// otherwise the tap acts at once, on the press, for no wait.
export const QUICK = { hold: 0.45 };
export function quickKey(st, down, dt, holdable) {
  if (down) {
    if (!st.down) { st.down = true; st.t = 0; st.fired = !holdable; return holdable ? null : 'tap'; }
    st.t += dt;
    if (holdable && !st.fired && st.t >= QUICK.hold) { st.fired = true; return 'hold'; }
    return null;
  }
  if (st.down) { st.down = false; if (!st.fired) { st.fired = true; return 'tap'; } }
  return null;
}

export class Arsenal {
  constructor(world, opts) {
    opts = opts || {};
    this.world = world;
    this.rand = rng(opts.seed || 12345);
    this.loadout = opts.loadout || null;   // when set, what you carry comes from here
    this.owned = {};            // which weapons you have found
    this.ammo = {};             // {mag, reserve} or {count}
    this.current = null;
    this.cool = 0;              // time until the next shot
    this.reloading = 0;
    this.recoil = 0;            // upward kick, decays
    this.spreadBloom = 0;
    this.projectiles = [];      // thrown grenades in flight
    this.events = [];
    this.shots = 0;
    this.blind = 0;             // how long the player is dazzled
    this.time = 0;
    if (this.loadout) {
      for (const id of this.loadout.keys()) this.give(id);
      this.noteSlots();
      this.select(opts.start || this.loadout.keyOf('primary') || this.loadout.keyOf('backup') || this.loadout.keys()[0]);
    } else {
      for (const id of opts.give || ['KNIFE']) this.give(id);
      this.select(opts.start || 'KNIFE');
    }
  }

  def(id) {
    if (!id) return null;
    if (this.loadout) {
      const slot = this.loadout.slotOfKey(id);
      if (slot) {
        const st = this.loadout.statsFor(slot);
        if (st) {
          const out = Object.assign({}, st, { kind: FAMILIES[st.family].kind, slot });
          // a variable sight: whichever step it is set to
          if (out.zooms && !(st.mods || []).some((m) => m.startsWith('SCOPE'))) out.zoom = out.zooms[(this.zoomAt && this.zoomAt[id]) || 0] || out.zoom;
          return out;
        }
      }
    }
    const b = baseId(id);
    if (ITEMS[b]) return Object.assign({}, statsOf(b), { kind: FAMILIES[ITEMS[b].family].kind });
    return WEAPONS[id] || null;
  }

  // The loadout changed (a crate, or Logistics): carry what it now says.
  // opts.keep: an ordinary crate swap - a pouch you put down keeps what is left in it,
  // so swapping it back cannot refill it. Without it (the Quartermaster, the
  // loadout screen, a new mission) a re-equipped pouch comes full, as before.
  reset(loadout, opts) {
    if (loadout) this.loadout = loadout;
    const list = this.loadout ? this.loadout.keys() : [];
    if (!(opts && opts.keep)) this.stash = {};
    this.stash = this.stash || {};
    this.owned = {};
    // (Rhys: C5 back to 0 after a swap) What a slot holds keeps its
    // own rounds, whatever it is now called. A second copy is "C5@utility2"
    // while the first is in utility1; take the first out and the second becomes
    // plain "C5" - which used to pick up the spent first copy's count (0) and
    // drop its own. So the ammunition follows the slot, not the name.
    const prev = this.slotAmmo || {}, claimed = new Set(), moved = {};
    if (this.loadout) for (const slot of SLOTS) {
      const id = this.loadout.slots[slot], key = this.loadout.keyOf(slot), was = prev[slot];
      if (id && was && was.id === id && was.ammo) { moved[key] = was.ammo; claimed.add(was.ammo); }
    }
    const old = this.ammo;
    this.ammo = Object.assign({}, moved);
    // anything left over that no slot claimed: keep it under its name for give()
    // (a gun's rounds, as before), unless that name now belongs to a moved slot
    for (const [k, a] of Object.entries(old)) if (!claimed.has(a) && !this.ammo[k]) this.ammo[k] = a;
    for (const id of list) this.give(id);
    for (const id of Object.keys(this.ammo)) {
      if (this.owned[id]) continue;
      if (opts && opts.keep && this.ammo[id].count !== undefined) this.stash[id] = this.ammo[id].count;
      delete this.ammo[id];
    }
    this.noteSlots();
    if (!this.owned[this.current] || itemKind(this.current) === 'gear') {
      this.current = null;
      const next = list.find((id) => itemKind(id) !== 'gear');
      if (next) this.select(next);
    } else {
      // a mod may have changed the magazine size
      const w = this.def(this.current), a = this.ammo[this.current];
      if (w && a && a.mag > w.mag) a.mag = w.mag;
    }
    this.reloading = 0;
    this.cool = Math.max(this.cool, 0.35);
  }

  // (Rhys: a crate said "C5 Charge - 2 carried" whether two were in
  // the pouch, one was stuck to a wall, or none were left) what a slot actually
  // holds now: a gun's rounds in the magazine and spare, a pouch's count and
  // how many of it are out there placed and waiting
  slotReadout(slot) {
    const key = this.loadout && this.loadout.keyOf(slot);
    if (!key) return null;
    const w = this.def(key), a = this.ammo[key];
    if (!w || !a) return null;
    if (a.mag !== undefined) {
      const text = `${a.mag}/${w.mag} in the magazine, ${a.reserve} spare`;
      return { mag: a.mag, magSize: w.mag, reserve: a.reserve, text };
    }
    if (a.count !== undefined) {
      const placed = this.liveCharges(key).length;
      const of = w.count || a.count;
      let text = a.count <= 0 ? 'none left' : a.count > of ? `${a.count} left` : `${a.count} of ${of} left`;
      if (placed) text += `, ${placed} placed`;
      return { count: a.count, of, placed, text };
    }
    return null;
  }

  // which ammunition belongs to which slot, for the next reset
  noteSlots() {
    this.slotAmmo = {};
    if (this.loadout) for (const slot of SLOTS) { const id = this.loadout.slots[slot]; if (id) this.slotAmmo[slot] = { id, ammo: this.ammo[this.loadout.keyOf(slot)] }; }
  }
  // more of what a slot already holds - a second box of C5 into the
  // C5 slot - adds to its count, rather than swapping like for like
  restock(slot) {
    const key = this.loadout && this.loadout.keyOf(slot), w = key && this.def(key), a = key && this.ammo[key];
    if (!w || !a || a.count === undefined) return 0;
    a.count += w.count || 1;
    this.events.push({ type: 'ammo', id: key, rounds: w.count || 1 });
    return w.count || 1;
  }

  give(id) {
    const w = this.def(id);
    if (!w) return false;
    const fresh = !this.owned[id];
    this.owned[id] = true;
    if (w.kind === 'gun') this.ammo[id] = this.ammo[id] || { mag: w.mag, reserve: Math.round(w.reserve * this.carryMul()) };
    if (w.kind !== 'gun' && w.kind !== 'melee' && !this.ammo[id]) {
      const left = this.stash && this.stash[id] !== undefined ? Math.min(this.stash[id], w.count) : w.count;
      if (this.stash) delete this.stash[id];
      this.ammo[id] = { count: left };
    }
    if (fresh) { this.useSpareFor(id); this.events.push({ type: 'found', id, name: w.name }); }
    return fresh;
  }
  has(id) { return !!this.owned[id]; }
  // step a variable sight in (+1) or out (-1); true if there was one to step
  stepZoom(dir) {
    const w = this.weapon;
    if (!w || !w.zooms) return false;
    this.zoomAt = this.zoomAt || {};
    const i = (this.zoomAt[this.current] || 0) + dir;
    this.zoomAt[this.current] = Math.max(0, Math.min(w.zooms.length - 1, i));
    this.events.push({ type: 'zoomStep', zoom: w.zooms[this.zoomAt[this.current]] });
    return true;
  }
  get weapon() { return this.current ? this.def(this.current) : null; }
  get ammoNow() { return this.ammo[this.current] || null; }

  select(id) {
    if (!this.owned[id] || this.current === id) return false;
    this.current = id;
    this.reloading = 0;
    this.burstLeft = 0;
    const dw = this.def(id);
    this.cool = Math.max(this.cool, (dw && dw.draw) || 0.25);       // time to bring it up (its own)
    this.events.push({ type: 'draw', id });
    return true;
  }
  // 1-5 pick a slot. With a loadout that is the slot itself; without one
  // (the older tests) it falls back to each weapon's own slot number.
  selectSlot(n) {
    if (this.loadout) {
      const slot = SLOT_KEY[n];
      const id = this.loadout.keyOf(slot);
      if (itemKind(id) === 'gear') return false;     // gear is worn, not held
      if (!id) {
        // an empty primary or backup is still a choice: bare hands
        if (slot !== 'primary' && slot !== 'backup') return false;
        if (this.current === null) return false;
        this.current = null; this.cool = Math.max(this.cool, 0.2);
        this.events.push({ type: 'draw', id: null });
        return true;
      }
      return this.select(id);
    }
    const ids = Object.keys(WEAPONS).filter((id) => WEAPONS[id].slot === n && this.owned[id]);
    if (!ids.length) return false;
    const i = ids.indexOf(this.current);
    return this.select(ids[(i + 1) % ids.length]);
  }

  reload() {
    const w = this.weapon;
    if (!w || w.kind !== 'gun' || this.reloading > 0) return false;
    const a = this.ammoNow;
    // an energy weapon has no rounds: R vents it - it cools, all at once, for the full time
    if (w.energy) { if (a.mag >= w.mag) return false; this.reloading = w.reload; this.burstLeft = 0; this.events.push({ type: 'vent', id: this.current }); return true; }
    if (a.mag >= w.mag || a.reserve <= 0) return false;
    // (Rhys: the Revolver not "revolvery") one round at a time into the cylinder
    this.reloading = w.reloadEach ? (w.reloadOpen || 0) + w.reloadEach : w.reload;
    this.burstLeft = 0;
    this.events.push({ type: 'reload', id: this.current });
    return true;
  }

  // Fire (or swing, or throw). eye = [x,y,z], dir = unit vector, opts.moving
  // and opts.aim change accuracy. Returns what happened.
  fire(eye, dir, opts) {
    opts = opts || {};
    const w = this.weapon;
    if ((!w || itemKind(this.current) === 'gear') && this.cool <= 0) {
      // bare hands
      this.cool = 0.45;
      this.punchDamage = 14;
      this.blow = 'fist';
      const hit = this.trace(eye, norm(dir), 1.5);
      this.blow = 'shot';
      this.events.push({ type: 'swing', hit, fists: true });
      return { hit, melee: true, fists: true };
    }
    // loading a revolver round by round: a press fires what is in it, and stops the loading
    if (w && w.reloadEach && this.reloading > 0 && this.ammoNow && this.ammoNow.mag > 0 && this.cool <= 0) { this.reloading = 0; this.events.push({ type: 'reloaded', id: this.current }); }
    if (!w || this.cool > 0 || this.reloading > 0) return null;
    if (w.kind === 'melee') return this.melee(eye, dir, opts);
    if (w.kind === 'usable') return this.useAid(opts);
    if (w.kind === 'placeable') return this.placeCharge(eye, dir, opts);
    if (w.kind === 'throwable') return this.throwOne(eye, dir, opts);
    const a = this.ammoNow;
    const cont = this.burstLeft > 0;              // the rest of a burst, fired by the gun
    // too hot: it cuts out, and cools for its full time before it fires again
    if (w.energy && a.mag <= 0) {
      if (this.reloading <= 0) { this.reloading = w.reload; this.events.push({ type: 'overheat', id: this.current }); }
      return null;
    }
    if (a.mag <= 0) {
      this.burstLeft = 0;
      if (cont) return null;
      // your hands do it for you, but it still takes time - switching may be quicker
      if (a.reserve > 0) { this.reload(); this.events.push({ type: 'autoreload', id: this.current }); }
      else this.events.push({ type: 'empty' });
      this.cool = 0.25;
      return null;
    }
    a.mag--;
    if (w.burst) {
      this.burstLeft = cont ? this.burstLeft - 1 : w.burst - 1;
      if (a.mag <= 0) this.burstLeft = 0;
      this.cool = this.burstLeft > 0 ? w.burstGap : w.rate;
    } else {
      this.cool = w.rate;
      // (Rhys: the MP2 - "single-shots... from a machinegun?") a machine
      // pistol fires a short burst for even the briefest press; held, it keeps on
      if (w.minBurst) {
        this.burstLeft = cont ? this.burstLeft - 1 : opts.fresh ? w.minBurst - 1 : 0;
        if (a.mag <= 0) this.burstLeft = 0;
      }
    }
    this.shots++;
    this.lastShotAt = this.time;
    // accuracy: aiming helps, moving and repeated fire hurt
    let spread = opts.aim ? w.adsSpread : w.spread;
    // a shaky hand from rapid fire counts much less when you are aiming
    spread += this.spreadBloom * (opts.aim ? 0.3 : 1) + (opts.moving ? w.moveSpread * (opts.aim ? 0.4 : 1) : 0);
    this.spreadBloom = Math.min(w.spread * 3, this.spreadBloom + w.spread * 0.7 * (w.bloom || 1));
    this.recoil += w.recoil * (opts.aim ? 0.75 : 1);
    const d = this.scatter(dir, spread);
    // a launcher: the round is a rocket, flying until it meets something
    if (w.launcher) {
      const sp = w.speed || 40;
      const lock = opts.lock && !opts.lock.wrecked ? opts.lock : null;
      this.projectiles.push({ id: this.current, rocket: true, impact: true, grav: 1.2, homing: lock, fuse: 6, spin: 0,
        pos: [eye[0] + d[0] * 0.6, eye[1] + d[1] * 0.6 - 0.05, eye[2] + d[2] * 0.6], vel: [d[0] * sp, d[1] * sp, d[2] * sp] });
      this.lastNoise = 1.2;
      this.events.push({ type: 'shot', id: this.current, dir: d, from: eye.slice(), hit: null, spread, noise: 1.2, rocket: true, locked: !!lock });
      return { rocket: true, dir: d };
    }
    const hit = this.trace(eye, d, 400);
    // a shotgun's pellets: the rest of the shell, each its own way
    if (w.pellets > 1) for (let k = 1; k < w.pellets; k++) {
      const pd = this.scatter(dir, Math.max(spread, w.adsSpread || 0.03));
      const ph = this.trace(eye, pd, 120);
      if (ph) this.events.push({ type: 'pellet', id: this.current, dir: pd, from: eye.slice(), hit: ph });
    }
    if (w.beam) this.events.push({ type: 'beam', id: this.current, from: eye.slice(), to: hit ? hit.point : [eye[0] + d[0] * 120, eye[1] + d[1] * 120, eye[2] + d[2] * 120] });
    // how far the shot carries: a suppressed pistol is not a rifle on automatic
    const base = w.auto ? 1 : w.family === 'sniper' ? 1.1 : 0.75;
    const loud = (w.quiet !== undefined ? w.quiet : 1) * base;
    this.lastNoise = loud;
    this.events.push({ type: 'shot', id: this.current, dir: d, from: eye.slice(), hit, spread, noise: loud });
    // a breaching round: a door it meets close by is taken off, as a charge takes it
    if (w.breach) {
      const h = this.world.raycast(eye, d, w.breachReach || 3, (s) => s.person || s.target || s.glass || s.shotOnly);
      if (h && h.solid.tag === 'hdoor') this.events.push({ type: 'breachShot', id: this.current, pos: [eye[0] + d[0] * h.t, eye[1] + d[1] * h.t, eye[2] + d[2] * h.t] });
    }
    return { hit, dir: d };
  }

  scatter(dir, spread) {
    if (spread <= 0) return norm(dir);
    const up = Math.abs(dir[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const rx = norm([up[1] * dir[2] - up[2] * dir[1], up[2] * dir[0] - up[0] * dir[2], up[0] * dir[1] - up[1] * dir[0]]);
    const ry = [rx[1] * dir[2] - rx[2] * dir[1], rx[2] * dir[0] - rx[0] * dir[2], rx[0] * dir[1] - rx[1] * dir[0]];
    const ang = this.rand() * Math.PI * 2, mag = Math.sqrt(this.rand()) * spread;
    const ox = Math.cos(ang) * mag, oy = Math.sin(ang) * mag;
    return norm([dir[0] + rx[0] * ox + ry[0] * oy, dir[1] + rx[1] * ox + ry[1] * oy, dir[2] + rx[2] * ox + ry[2] * oy]);
  }

  // One bullet: the nearest thing along the line. A thin wall or a pane of
  // glass it can beat, it goes through - losing some of its force - and
  // carries on to whatever is behind.
  trace(o, d, maxDist) {
    const w = this.weapon;
    const pen = (w && w.pen) || 0;
    let from = o.slice(), left = maxDist, travelled = 0, keep = 1;
    let r = null;
    for (let passes = 0; passes < 4; passes++) {
      r = this.world.raycast(from, d, left, (q) => q.shootThrough);   // through the gaps in a railing
      if (!r) return null;
      const s2 = r.solid;
      if (s2.target || s2.tough === undefined || pen < s2.tough) break;
      // through it: find where the round comes out, and go on from there
      const entry = [from[0] + d[0] * r.t, from[1] + d[1] * r.t, from[2] + d[2] * r.t];
      let out = Infinity;
      for (let i = 0; i < 3; i++) {
        if (Math.abs(d[i]) < 1e-6) continue;
        const face = d[i] > 0 ? s2.max[i] : s2.min[i];
        out = Math.min(out, (face - entry[i]) / d[i]);
      }
      out = Math.max(0, out) + 0.01;
      this.events.push({ type: 'pierce', point: entry, glass: !!s2.glass, solid: s2 });
      keep *= s2.glass ? (s2.tough >= 3 ? 0.5 : 0.85) : 0.6;
      travelled += r.t + out;
      left -= r.t + out;
      from = [entry[0] + d[0] * out, entry[1] + d[1] * out, entry[2] + d[2] * out];
      if (left <= 0) return null;
      r = null;
    }
    if (!r) return null;
    const dist = travelled + r.t;
    const point = [from[0] + d[0] * r.t, from[1] + d[1] * r.t, from[2] + d[2] * r.t];
    const target = r.solid.target || null;
    this.passKeep = keep;
    // a probe - placing a charge - looks, it does not strike
    if (target && !this.probing) this.hitTarget(target, point, dist, d);
    // a round into a vehicle: it takes some of it (enough of them and it is wrecked)
    if (!target && !this.probing && r.solid.vehicle && w) { r.solid.vehicle.damage((w.damage || 20) * keep * 0.5); this.events.push({ type: 'vehicleHit', vehicle: r.solid.vehicle, point }); }
    this.passKeep = 1;
    r = { t: dist, solid: r.solid };
    const charge = this.probing ? null : this.chargeNear(point, 0.45);
    if (charge) { charge.fuse = 0.001; this.events.push({ type: 'shotCharge', id: charge.id }); }
    return { point, dist: r.t, solid: r.solid, target };
  }

  hitTarget(t, point, dist, dir) {
    if (t.down) return;
    // it goes over the way the round was travelling
    if (dir) t.fall = t.axis === 'x' ? -Math.sign(dir[0] || 1) : Math.sign(dir[2] || 1);
    const w = this.weapon;
    // how it was struck: a round or a blade can kill; a fist, a pistol-whip
    // or a rifle butt only knocks someone down (Rhys: non-lethal disablement)
    const blow = this.blow || 'shot';
    // bare hands, or anything without a damage figure, still land a blow; a
    // strike with a gun hits like a strike, not like its bullet
    let dmg = blow === 'bash' ? (this.punchDamage || 14) : (w && w.damage) || this.punchDamage || 14;
    // (Rhys's sheet: the tranquilliser pistol, the stun carbine) a non-lethal round knocks out, as a fist does
    const sleeper = blow === 'shot' && w && w.nonLethal;
    if ((blow === 'shot' && !sleeper) || blow === 'blade') t.lethalHit = true;
    // what it lost going through things on the way
    dmg *= (this.passKeep === undefined ? 1 : this.passKeep);
    // past its useful range a round arrives with far less behind it
    if (w && w.best && dist > w.best) {
      const over = (dist - w.best) / w.best;
      dmg *= Math.max(0.12, 1 - over * 0.8);
    }
    // A headshot (Rhys): a round that arrives with real force - after range
    // falloff - kills outright; a weak one does triple. Blows to the head from
    // a fist, a pistol-whip or a rifle butt stay non-lethal.
    const head = blow === 'shot' && !sleeper && reachesHead(t, point, dir);
    if (head) dmg = dmg >= HEADSHOT_KILL ? t.hp + 1 : dmg * 3;
    t.hp -= dmg;
    if (t.hp <= 0) { t.down = true; t.downAt = this.time; t.downBy = blow; t.headshot = head; this.events.push({ type: 'target', target: t, point, killed: true }); }
    else this.events.push({ type: 'target', target: t, point, killed: false, head });
  }

  melee(eye, dir, opts) {
    const w = this.weapon;
    this.cool = w.rate;
    this.blow = 'blade';                   // a knife can kill
    const hit = this.trace(eye, norm(dir), w.range);
    this.blow = 'shot';
    this.events.push({ type: 'swing', hit });
    return { hit, melee: true };
  }

  // (Rhys: "Z and X ... Instead of having to switch back to 3 or 4 to
  // use a utility device ... throw grenades without putting away your weapon")
  // Use what is in a utility slot without changing what is in your hands:
  // how 'tap' throws a grenade, places a charge or mine, or uses a medkit;
  // 'hold' sets off every charge of that kind you have placed.
  quickUse(slot, eye, dir, opts, how) {
    const key = this.loadout && this.loadout.keyOf(slot);
    if (!key || !this.owned[key]) return null;
    const w = this.def(key);
    if (!w) return null;
    if (how === 'hold') return w.kind === 'placeable' ? this.detonateAll(key) : null;
    if (this.cool > 0 || this.reloading > 0) return null;
    const prev = this.current;
    this.current = key;
    let r = null;
    try {
      if (w.kind === 'throwable') r = this.throwOne(eye, norm(dir), opts || {});
      else if (w.kind === 'placeable') {
        const a = this.ammo[key];
        if (a && a.count > 0) r = this.placeCharge(eye, norm(dir), opts || {});
        else this.events.push({ type: this.liveCharges(key).length ? 'holdToBlow' : 'empty', id: key });
      } else if (w.kind === 'usable') r = this.useAid(opts || {});
    } finally {
      // back to what you were holding (a throw that ran you out of grenades
      // must not leave you holding nothing, either)
      if (prev !== key && (prev === null || this.owned[prev])) this.current = prev;
      this.burstLeft = 0;
    }
    if (r) this.events.push({ type: 'quick', id: key, slot });
    return r;
  }

  // A medkit patches you up (or, later, whoever you are standing over).
  useAid(opts) {
    const w = this.weapon, a = this.ammoNow, who = (opts && opts.on) || (opts && opts.player);
    if (!a || a.count <= 0) { this.events.push({ type: 'empty' }); return null; }
    // the Vehicle Repair Kit: by a vehicle, a while's work; never used up
    if (w.repair) {
      const at = who && who.pos;
      const v = at && (this.world.vehicles || []).filter((q) => !q.wrecked && q.hp < (q.maxHp || q.hp))
        .find((q) => Math.hypot(q.pos[0] - at[0], q.pos[2] - at[2]) < 4.5);
      if (!v) { this.events.push({ type: 'noVehicle' }); return null; }
      this.cool = w.useTime || 3;
      v.hp = Math.min(v.maxHp || v.hp, v.hp + (v.maxHp || 400) * w.repair);
      this.events.push({ type: 'repair', id: this.current, vehicle: v });
      return { used: true, repaired: v };
    }
    // the Health & Ammo Pack: a magazine more for each gun, as well as the patching up
    const roomFor = () => this.loadout ? this.loadout.keys().filter((k) => {
      const g = this.def(k), q = this.ammo[k];
      return g && g.kind === 'gun' && q && q.reserve < Math.round((g.reserve || 0) * 1.5 * this.carryMul());
    }) : [];
    if (who && who.health >= 100 && !(w.ammo && roomFor().length)) { this.events.push({ type: 'noneed' }); return null; }
    if (w.ammo) for (const k of roomFor()) {
      const g = this.def(k), q = this.ammo[k];
      q.reserve = Math.min(Math.round((g.reserve || 0) * 1.5 * this.carryMul()), q.reserve + g.mag);
    }
    a.count--;
    this.cool = w.useTime || 2;
    if (who) { who.health = Math.min(100, who.health + (w.heals || 50)); who.sinceDamage = 0; }
    this.events.push({ type: 'aid', id: this.current, heals: w.heals || 50 });
    if (a.count <= 0) this.fallBack();
    return { used: true };
  }

  // A charge is placed where you are looking. Charges chain: each
  // press places another while you have any, and right mouse (detonateAll)
  // sets every one of that kind off together; with none left to place, a
  // press sets them off too. A proximity mine arms itself after a moment and
  // goes off when someone comes near (not you: it knows you).
  liveCharges(key) { return this.projectiles.filter((p) => p.placed && p.id === (key || this.current)); }
  detonateAll(key) {
    const live = this.liveCharges(key);
    if (!live.length) return null;
    this.cool = Math.max(this.cool, 0.5);
    for (const p of live) p.fuse = 0.001;
    this.events.push({ type: 'detonate', id: key || this.current, count: live.length });
    return { detonated: live.length };
  }
  placeCharge(eye, dir, opts) {
    const w = this.weapon, a = this.ammoNow;
    const live = this.liveCharges();
    const left = a ? a.count : 0;
    if (live.length && (!w.chain || left <= 0)) return this.detonateAll();
    if (left <= 0) { this.events.push({ type: 'empty' }); return null; }
    // (Rhys: placing a C5 on a red killed him outright) finding where
    // it goes is a look, not a blow: placed on a person, it sticks to him -
    // and goes where he goes - until you set it off
    this.probing = true;
    const hit = this.trace(eye, dir, 3.2);
    this.probing = false;
    if (!hit) { this.events.push({ type: 'nowhere' }); this.cool = 0.3; return null; }
    a.count--;
    this.cool = 0.8;
    const p = { id: this.current, placed: true, fuse: 999, spin: 0,
      pos: [hit.point[0] - dir[0] * 0.08, hit.point[1] - dir[1] * 0.08, hit.point[2] - dir[2] * 0.08], vel: [0, 0, 0] };
    if (hit.target && hit.target.centre) {
      p.stuck = hit.target;
      p.offset = [p.pos[0] - hit.target.centre[0], p.pos[1] - hit.target.centre[1], p.pos[2] - hit.target.centre[2]];
    }
    if (w.prox) { p.prox = w.prox; p.armT = w.arm || 0; }
    this.projectiles.push(p);
    this.events.push({ type: 'placed', id: this.current, pos: p.pos.slice(), count: live.length + 1, on: p.stuck || null });
    return { placed: true };
  }

  // ── ammunition lying around ─────────────────────────────────────────────
  // the kind of rounds a weapon fires
  ammoKindOf(id) {
    const it = ITEMS[baseId(id)];
    if (!it) return null;
    return Object.keys(AMMO).find((k) => AMMO[k].families.indexOf(it.family) >= 0) || null;
  }
  // (Rhys: swapping guns lost all the ammunition he had gathered)
  // Putting a gun down: the rounds that are not in its magazine go in your
  // pouch (up to what it holds), ready for whatever fires them. Returns what
  // was in the magazine - that stays with the gun.
  stow(key) {
    const a = key && this.ammo[key];
    if (!a || a.mag === undefined) return 0;
    const kind = this.ammoKindOf(key);
    if (kind && a.reserve > 0) {
      this.spare = this.spare || {};
      this.spare[kind] = Math.min(this.spareCap(kind), (this.spare[kind] || 0) + a.reserve);
      a.reserve = 0;
    }
    return a.mag;
  }
  ammoFits(kindId) {
    const a = AMMO[kindId];
    if (!a) return [];
    return Object.keys(this.owned).filter((id) => {
      const it = ITEMS[baseId(id)];
      return it && a.families.indexOf(it.family) >= 0;
    });
  }
  // Rounds are small: take them whether or not you are carrying the weapon.
  // What you cannot use now goes in your pouch until you find something that
  // fires it. Each kind has a carrying limit.
  spareCap(kindId) { return Math.round((AMMO[kindId] ? AMMO[kindId].rounds : 0) * 3 * this.carryMul()); }
  // (Rhys: "you'll need a way to dump it ... so that you don't accidentally end up
  // overencumbered just by picking up corpse-ammo") every gun's spare rounds down to a full issue, and the
  // pouch emptied: what was left, by kind of round ({ AMMO_RIFLE: 120, ... }); `dry` only counts it
  dumpSpare(dry) {
    const out = {};
    for (const [k, a] of Object.entries(this.ammo)) {
      const w = a && a.reserve !== undefined ? this.def(k) : null;
      if (!w || w.energy) continue;
      const issue = Math.round((w.reserve || 0) * this.carryMul()), extra = a.reserve - issue, kind = this.ammoKindOf(k);
      if (extra > 0 && kind) { out[kind] = (out[kind] || 0) + extra; if (!dry) a.reserve = issue; }
    }
    for (const [kind, n] of Object.entries(this.spare || {})) if (n > 0) { out[kind] = (out[kind] || 0) + n; if (!dry) this.spare[kind] = 0; }
    return out;
  }
  // Load-Bearing Webbing: half as many spare rounds again
  carryMul() { return (this.loadout && this.loadout.gearTrait('ammoCarry')) || 1; }
  canTakeAmmo(kindId) {
    const a = AMMO[kindId];
    if (!a) return false;
    this.spare = this.spare || {};
    const roomInGuns = this.ammoFits(kindId).some((id) => {
      const w = this.def(id), have = this.ammo[id];
      return have && have.reserve < (w.reserve || 0) * 1.5 * this.carryMul();
    });
    return roomInGuns || (this.spare[kindId] || 0) < this.spareCap(kindId);
  }
  takeAmmo(kindId) {
    const a = AMMO[kindId];
    if (!a || !this.canTakeAmmo(kindId)) return 0;
    this.spare = this.spare || {};
    let left = a.rounds, given = 0;
    for (const id of this.ammoFits(kindId)) {
      const w = this.def(id), have = this.ammo[id];
      if (!have) continue;
      const cap = Math.round((w.reserve || 0) * 1.5 * this.carryMul());
      const want = Math.min(left, Math.max(0, cap - have.reserve));
      have.reserve += want; given += want; left -= want;
    }
    if (left > 0) {
      const room = Math.max(0, this.spareCap(kindId) - (this.spare[kindId] || 0));
      const kept = Math.min(left, room);
      this.spare[kindId] = (this.spare[kindId] || 0) + kept;
      given += kept;
    }
    if (given) this.events.push({ type: 'ammo', id: kindId, rounds: given });
    return given;
  }
  // The Quartermaster's restock: every weapon you carry full, every pouch full.
  restockAll() {
    let n = 0;
    for (const id of Object.keys(this.ammo)) {
      const w = this.def(id), a = this.ammo[id];
      if (!w || !a) continue;
      if (a.mag !== undefined && w.mag) { a.mag = w.mag; a.reserve = Math.round((w.reserve || 0) * 1.5 * this.carryMul()); n++; }
      if (a.count !== undefined) { a.count = w.count || a.count; n++; }
    }
    this.reloading = 0;
    this.spare = {};
    this.events.push({ type: 'ammo', id: 'all', rounds: n });
    return n || 1;
  }

  // picking up a weapon empties the right pouch into it
  useSpareFor(id) {
    this.spare = this.spare || {};
    const it = ITEMS[baseId(id)];
    if (!it || !this.ammo[id]) return 0;
    for (const kind of Object.keys(AMMO)) {
      if (AMMO[kind].families.indexOf(it.family) < 0) continue;
      const have = this.spare[kind] || 0;
      if (!have) continue;
      const w = this.def(id), cap = Math.round((w.reserve || 0) * 1.5 * this.carryMul());
      const want = Math.min(have, Math.max(0, cap - this.ammo[id].reserve));
      this.ammo[id].reserve += want;
      this.spare[kind] = have - want;
      if (want) this.events.push({ type: 'ammo', id: kind, rounds: want, fromPouch: true });
      return want;
    }
    return 0;
  }

  // ── placed charges: pick them up again, or shoot them ───────────────────
  chargeNear(pos, range) {
    let best = null, bestD = range || 1.6;
    for (const p of this.projectiles) {
      if (!p.placed) continue;
      const d = Math.hypot(p.pos[0] - pos[0], p.pos[1] - pos[1], p.pos[2] - pos[2]);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best;
  }
  // room in its pouch for one placed and picked back up?
  canTakeBack(p) { const a = this.ammo[p.id], w = this.def(p.id); return !(a && a.count !== undefined && w && w.count && a.count >= w.count); }
  disarm(p, player) {
    const i = this.projectiles.indexOf(p);
    if (i < 0) return false;
    // (Rhys: "I managed to end up with 3 Lures") one picked back up went into the
    // pouch however full it was - a pouch refilled meanwhile came to more than it holds. A
    // full pouch has no room: it stays where it is.
    if (!this.canTakeBack(p)) { this.events.push({ type: 'pouchFull', id: p.id }); return false; }
    const a = this.ammo[p.id];
    this.projectiles.splice(i, 1);
    if (a && a.count !== undefined) a.count++;        // back in your pouch
    this.events.push({ type: 'disarmed', id: p.id });
    return true;
  }

  // Out of ordnance: back to your primary, then your backup.
  fallBack() {
    if (this.loadout) {
      const next = this.loadout.keyOf('primary') || this.loadout.keyOf('backup');
      if (next) { this.select(next); return; }
      this.current = null;
      return;
    }
    const next = ['RIFLE', 'PISTOL', 'SNIPER', 'KNIFE'].find((id) => this.owned[id]);
    if (next) this.select(next);
  }

  // A blow with whatever is in your hands: quiet, and always available.
  bash(eye, dir) {
    if (this.cool > 0) return null;
    const w = this.weapon;
    this.cool = 0.5;
    this.punchDamage = w && w.kind === 'gun' ? 30 : 14;
    this.blow = w && w.kind === 'melee' ? 'blade' : w && w.kind === 'gun' ? 'bash' : 'fist';
    const hit = this.trace(eye, norm(dir), 1.6);
    this.blow = 'shot';
    this.events.push({ type: 'bash', hit, noise: 0.25 });
    return { hit, melee: true, bash: true };
  }

  throwOne(eye, dir, opts) {
    const w = this.weapon;
    const a = this.ammoNow;
    if (a.count <= 0) { this.events.push({ type: 'empty' }); return null; }
    a.count--;
    this.cool = 0.8;
    const speed = w.throw * (opts.short ? 0.45 : 1);
    this.projectiles.push({
      id: this.current, pos: [eye[0] + dir[0] * 0.4, eye[1] + dir[1] * 0.4, eye[2] + dir[2] * 0.4],
      vel: [dir[0] * speed, dir[1] * speed + 1.5, dir[2] * speed], fuse: w.fuse, spin: 0,
    });
    this.events.push({ type: 'throw', id: this.current, noise: 0.3 });
    this.lastNoise = 0.3;
    if (a.count <= 0) {
      // out of these: fall back to something you can still use
      const next = ['RIFLE', 'PISTOL', 'SNIPER', 'KNIFE'].find((id) => this.owned[id]);
      if (next) this.select(next);
    }
    return { thrown: true };
  }

  // Grenades in flight, fuses, blasts and blindness.
  step(dt, player) {
    this.time += dt;
    this.cool = Math.max(0, this.cool - dt);
    this.recoil *= Math.exp(-dt * 7);
    this.spreadBloom *= Math.exp(-dt * 2.2);
    this.blind = Math.max(0, this.blind - dt);
    // energy weapons cool when they are not firing - in your hands or slung - a full heat in
    // one and a half times their venting time
    if (this.time - (this.lastShotAt || -9) > 0.4) for (const [k, q] of Object.entries(this.ammo)) {
      const g = q && q.mag !== undefined ? this.def(k) : null;
      if (g && g.energy && q.mag < g.mag && !(k === this.current && this.reloading > 0)) q.mag = Math.min(g.mag, q.mag + g.mag / (g.reload * 1.5) * dt);
    }
    this.lastNoise = Math.max(0, (this.lastNoise || 0) - dt * 1.2);
    if (this.reloading > 0) {
      this.reloading -= dt;
      if (this.reloading <= 0) {
        this.reloading = 0;
        const w = this.def(this.current), a = this.ammoNow;
        if (w && w.kind === 'gun' && a && w.reloadEach) {
          // a round in; another, while there is room and rounds to put in
          if (a.reserve > 0 && a.mag < w.mag) { a.mag++; a.reserve--; this.events.push({ type: 'roundIn', id: this.current }); }
          if (a.reserve > 0 && a.mag < w.mag) this.reloading = w.reloadEach;
          else this.events.push({ type: 'reloaded', id: this.current });
        } else if (w && w.energy && a) {
          a.mag = w.mag;                                    // cooled
          this.events.push({ type: 'cooled', id: this.current });
        } else if (w && w.kind === 'gun' && a) {
          const want = Math.min(w.mag - a.mag, a.reserve);
          a.mag += want; a.reserve -= want;
          this.events.push({ type: 'reloaded', id: this.current });
        }
      }
    }
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (p.placed) {
        // stuck to someone: it rides on him
        if (p.stuck && p.stuck.centre) for (let a = 0; a < 3; a++) p.pos[a] = p.stuck.centre[a] + p.offset[a];
        if (p.prox && p.fuse > 900) {
          // a landmine: people walk over it; a vehicle sets it off
          const pw = p.vehicleOnly === undefined ? (p.vehicleOnly = !!(this.def(p.id) || {}).vehicleOnly) : p.vehicleOnly;
          const byVehicle = (this.world.vehicles || []).some((v) => !v.wrecked && Math.hypot(v.pos[0] - p.pos[0], v.pos[2] - p.pos[2]) < p.prox + 1.2 && Math.abs(v.pos[1] - p.pos[1]) < 2.5);
          if (p.armT > 0) { p.armT -= dt; if (p.armT <= 0) this.events.push({ type: 'armed', id: p.id, pos: p.pos.slice() }); }
          else if (pw ? byVehicle : (byVehicle || (this.world.targets || []).some((t) => !t.down && Math.hypot(t.centre[0] - p.pos[0], t.centre[2] - p.pos[2]) < p.prox && Math.abs(t.centre[1] - p.pos[1]) < 2))) {
            p.fuse = 0.15;                                   // a click, then it goes
            this.events.push({ type: 'tripped', id: p.id, pos: p.pos.slice() });
          }
        }
        p.fuse -= p.fuse < 900 ? dt : 0;
        if (p.fuse <= 0) { this.detonate(p, player); this.projectiles.splice(i, 1); }
        continue;
      }
      // stuck to someone, or to a wall: it stays there until it goes
      if (p.stuck && p.stuck.centre) { for (let a = 0; a < 3; a++) p.pos[a] = p.stuck.centre[a] + p.offset[a]; }
      if (p.stuck || p.fixed) { p.fuse -= dt; if (p.fuse <= 0) { this.detonate(p, player); this.projectiles.splice(i, 1); } continue; }
      // a rocket that has locked on turns after its vehicle
      if (p.homing && !p.homing.wrecked) {
        const h = p.homing, sp = Math.hypot(p.vel[0], p.vel[1], p.vel[2]) || 1;
        const want = norm([h.pos[0] - p.pos[0], h.pos[1] + 0.8 - p.pos[1], h.pos[2] - p.pos[2]]);
        const k = Math.min(1, dt * 4.5);
        const nd = norm([p.vel[0] / sp + (want[0] - p.vel[0] / sp) * k, p.vel[1] / sp + (want[1] - p.vel[1] / sp) * k, p.vel[2] / sp + (want[2] - p.vel[2] / sp) * k]);
        p.vel = [nd[0] * sp, nd[1] * sp, nd[2] * sp];
      }
      p.vel[1] -= (p.grav !== undefined ? p.grav : 19) * dt;
      const pw = this.def(p.id) || {};
      if (pw.impact) p.impact = true;               // air-drop grenades burst where they land
      // a sticky grenade, or a rocket, meeting someone
      if (pw.sticky || p.impact) {
        const t = (this.world.targets || []).find((q) => !q.down && q.centre && Math.hypot(q.centre[0] - p.pos[0], q.centre[1] - p.pos[1], q.centre[2] - p.pos[2]) < 0.75);
        const v = p.impact && (this.world.vehicles || []).find((q) => !q.wrecked && Math.hypot(q.pos[0] - p.pos[0], q.pos[2] - p.pos[2]) < 2.2 && p.pos[1] > q.pos[1] - 0.3 && p.pos[1] < q.pos[1] + 2.4);
        if (p.impact && (t || v)) { this.detonate(p, player); this.projectiles.splice(i, 1); continue; }
        if (t && pw.sticky) { p.stuck = t; p.offset = [p.pos[0] - t.centre[0], p.pos[1] - t.centre[1], p.pos[2] - t.centre[2]]; this.events.push({ type: 'stuck', id: p.id, target: t }); continue; }
      }
      let bounced = false;
      for (const ax of [0, 1, 2]) {
        const before = p.pos[ax];
        p.pos[ax] += p.vel[ax] * dt;
        const r = 0.09;
        const box = [[p.pos[0] - r, p.pos[1] - r, p.pos[2] - r], [p.pos[0] + r, p.pos[1] + r, p.pos[2] + r]];
        if (this.world.hit(box[0], box[1])) {
          p.pos[ax] = before;
          p.vel[ax] *= -0.35;
          for (const o of [0, 1, 2]) if (o !== ax) p.vel[o] *= 0.75;
          this.events.push({ type: 'bounce', pos: p.pos.slice() });
          bounced = true;
        }
      }
      if (bounced && p.impact) { this.detonate(p, player); this.projectiles.splice(i, 1); continue; }
      if (bounced && pw.sticky) { p.fixed = true; p.vel = [0, 0, 0]; }
      p.fuse -= dt;
      if (p.fuse <= 0) {
        this.detonate(p, player);
        this.projectiles.splice(i, 1);
      }
    }
    this.stepClouds(dt, player);
    // targets pop back up after a while
    for (const t of this.world.targets || []) {
      if (t.down && this.time - t.downAt > (t.respawn || 4)) { t.down = false; t.hp = t.maxHp; this.events.push({ type: 'targetUp', target: t }); }
    }
  }

  // clouds a grenade leaves: nerve gas (deadly to anyone breathing it - a gas mask
  // keeps you safe), and fire (a gas mask does nothing for that)
  stepClouds(dt, player) {
    this.clouds = (this.clouds || []).filter((c) => c.until > this.time);
    for (const c of this.clouds) {
      const rate = c.kind === 'nerve' ? 24 : c.kind === 'fire' ? 20 : 0;
      if (!rate) continue;
      const pos = c.on && c.on.centre ? c.on.centre : c.pos;
      for (const t of this.world.targets || []) {
        if (t.down || !t.centre) continue;
        const d = Math.hypot(t.centre[0] - pos[0], t.centre[2] - pos[2]);
        if (t !== c.on && (d > c.r || Math.abs(t.centre[1] - pos[1]) > 2.6)) continue;
        if (c.kind === 'nerve' && t.gasMask) continue;
        // (Rhys: "anyone who was caught in the blast of the fire should be on fire for a little longer")
        if (c.kind === 'fire') { t.onFire = this.time + BURN.after; continue; }
        t.hp -= rate * dt; t.lethalHit = true;
        if (t.hp <= 0) { t.down = true; t.downAt = this.time; t.downBy = c.kind; this.events.push({ type: 'target', target: t, point: t.centre.slice(), killed: true, blast: true }); }
      }
      if (player && player.pos && player.mode !== 'dead') {
        const d = Math.hypot(player.pos[0] - pos[0], player.pos[2] - pos[2]);
        const inside = d < c.r * (c.kind === 'fire' ? 0.75 : 1) && Math.abs(player.pos[1] + 1 - pos[1]) < 2.6;
        const masked = c.kind === 'nerve' && this.loadout && this.loadout.gearTrait('gas');
        if (inside && c.kind === 'fire') { this.youOnFire = this.time + BURN.after; this.burnFrom = pos.slice(); }
        else if (inside && !masked) { player.damage(rate * 0.7 * dt, 'gas', pos.slice()); this.inCloud = c.kind; }
      }
    }
    // whoever is alight burns - in the fire and for a while after it; a puff of flame on him now and then
    for (const t of this.world.targets || []) {
      if (t.down || !t.onFire || t.onFire <= this.time) continue;
      t.hp -= BURN.rate * dt; t.lethalHit = true;
      if ((t.flameT = (t.flameT || 0) - dt) <= 0) { t.flameT = 0.45; this.events.push({ type: 'flames', pos: t.centre.slice() }); }
      if (t.hp <= 0) { t.down = true; t.downAt = this.time; t.downBy = 'fire'; t.onFire = 0; this.events.push({ type: 'target', target: t, point: t.centre.slice(), killed: true, blast: true }); }
    }
    if (player && this.youOnFire > this.time && player.mode !== 'dead') {
      player.damage(BURN.rate * 0.7 * dt, 'fire', this.burnFrom || player.pos);
      if ((this.youFlameT = (this.youFlameT || 0) - dt) <= 0) { this.youFlameT = 0.5; this.events.push({ type: 'flames', pos: [player.pos[0], player.pos[1] + 0.9, player.pos[2]], you: true }); }
    }
  }

  detonate(p, player) {
    const w = this.def(p.id);
    // what it leaves behind: a cloud, a fire (on whoever it was stuck to), a flare
    if (w.gas === 'nerve' || w.gas === 'fire') {
      this.clouds = this.clouds || [];
      this.clouds.push({ kind: w.gas, pos: p.pos.slice(), r: w.gas === 'fire' ? Math.max(2.5, (w.blast || 4) * 0.7) : (w.blast || 6),
        until: this.time + (w.gas === 'fire' ? (w.burn || 6) : (w.smoke || 12)), on: p.stuck || null });
    }
    if (w.flare) this.events.push({ type: 'flare', id: p.id, pos: p.pos.slice(), until: this.time + w.flare, secs: w.flare });
    // a lure goes off as a noise, not a blast
    if (w.lure) { this.events.push({ type: 'lure', id: p.id, pos: p.pos.slice(), noise: w.noise || 1.3 }); return; }
    this.lastNoise = 1.6;
    this.events.push({ type: 'blast', id: p.id, pos: p.pos.slice(), radius: w.blast, noise: 1.6,
      flash: !!w.blind, blind: w.blind || 0, smoke: w.smoke || (w.gas === 'fire' ? w.burn || 6 : 0), gas: w.gas || null, damage: w.damage || 0, breach: !!w.breach });
    // (Rhys) a blast sets off the non-insulated explosives near it - remote and proximity mines, a moment
    // after (so a string of them goes off one after another); C5 and the like only go when you set them off
    if (w.damage > 0) for (const q of this.projectiles) {
      if (q === p || !q.placed) continue;
      const qw = this.def(q.id);
      if (!qw || !qw.sympathy || qw.insulated) continue;
      const dq = Math.hypot(q.pos[0] - p.pos[0], q.pos[1] - p.pos[1], q.pos[2] - p.pos[2]);
      if (dq <= Math.max(qw.sympathy, (w.blast || 0) * 0.8) && q.fuse > 0.14) { q.fuse = 0.14; q.chained = true; this.events.push({ type: 'chained', id: q.id, pos: q.pos.slice() }); }
    }
    // vehicles near the blast take it hard (a rocket or two wrecks a boat)
    if (w.damage > 0) for (const v of this.world.vehicles || []) {
      const dv = Math.hypot(v.pos[0] - p.pos[0], v.pos[1] + 0.6 - p.pos[1], v.pos[2] - p.pos[2]);
      if (dv < w.blast + 2) v.damage(w.damage * 2.6 * (1 - Math.max(0, dv - 2) / w.blast * 0.7));
    }
    // targets within the blast, if the blast can see them
    for (const t of this.world.targets || []) {
      if (t.down) continue;
      const c = t.centre;
      const d = Math.hypot(c[0] - p.pos[0], c[1] - p.pos[1], c[2] - p.pos[2]);
      if (d > w.blast) continue;
      const dir = norm([c[0] - p.pos[0], c[1] - p.pos[1], c[2] - p.pos[2]]);
      const r = this.world.raycast(p.pos, dir, d);
      if (r && !r.solid.target && r.t < d - 0.3) continue;      // something in the way
      if (w.damage > 0) {
        // a blast knocks it away from where it went off
        t.fall = t.axis === 'x' ? -Math.sign(dir[0] || 1) : Math.sign(dir[2] || 1);
        const fall = 1 - (d / w.blast) * 0.7;
        t.hp -= w.damage * fall;
        t.lethalHit = true;
        if (t.hp <= 0) { t.down = true; t.downAt = this.time; t.downBy = 'blast'; this.events.push({ type: 'target', target: t, point: c.slice(), killed: true, blast: true }); }
      }
    }
    // and the thrower
    if (player) {
      const e = player.eyePos;
      const d = Math.hypot(e[0] - p.pos[0], e[1] - p.pos[1], e[2] - p.pos[2]);
      if (d < w.blast) {
        const dir = norm([e[0] - p.pos[0], e[1] - p.pos[1], e[2] - p.pos[2]]);
        const r = this.world.raycast(p.pos, dir, d);
        const clear = !r || r.t > d - 0.4;
        if (clear) {
          if (w.damage > 0) player.damage(w.damage * (1 - (d / w.blast) * 0.75), 'blast', p.pos.slice());
          let resist = this.loadout ? (this.loadout.gearTrait('flashResist') || 0) : 0;
          // goggles that make a flash worse only do so while they are down
          if (resist < 0 && this.loadout.gearTrait('nightSight') && !this.gogglesDown) resist = 0;
          if (w.blind) {
            // facing it matters: looking away is much better
            const look = player.lookDir ? player.lookDir() : null;
            // dir points from the blast to you, so -dot is how squarely you face it
            const face = look ? -(look[0] * dir[0] + look[1] * dir[1] + look[2] * dir[2]) : 1;
            const k = Math.max(0, face);          // looking away: no blindness at all
            this.blind = Math.max(this.blind, w.blind * k * (1 - d / w.blast * 0.6) * (1 - resist));
          }
        }
      }
    }
  }
}

// A pop-up target: a box that can be shot, with a score value.
export function makeTarget(world, min, max, opts) {
  opts = opts || {};
  const solid = world.addSolid(min, max, 'target');
  const t = {
    solid, min: min.slice(), max: max.slice(), hp: opts.hp || 30, maxHp: opts.hp || 30,
    axis: (max[0] - min[0]) < (max[2] - min[2]) ? 'x' : 'z',   // which way it faces
    fall: opts.fall || -1,                                      // and which way it drops
    // (`??` - a score of 0 is a score; `|| 10` made it 10)
    // (Rhys: the ranges' targets stood up again far too fast, a cleared
    // range was never counted, the turrets came back - that comment had been put
    // in the middle of this line and switched off everything after it)
    score: opts.score ?? 10, down: false, downAt: -99, respawn: opts.respawn || 4, lane: opts.lane,
    centre: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
  };
  solid.target = t;
  (world.targets = world.targets || []).push(t);
  return t;
}
