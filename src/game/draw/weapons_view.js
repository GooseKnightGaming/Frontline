// FRONTLINE - the visible side of weapons: the thing in your hands, the
// targets on the range, grenades in the air, muzzle flashes and blasts.

import { baseId, ITEMS } from '../../sim/arms/loadout.js';

// Where each weapon sits in view: [x, y, z] at the hip, and aimed.
const HOLD = {
  KNIFE:     { pos: [0.20, -0.20, -0.36], ads: [0.10, -0.14, -0.30], rot: [4, 8, 6], scale: 1.0 },
  PISTOL:    { pos: [0.17, -0.17, -0.40], ads: [0.0, -0.20, -0.34], rot: [0, 2, 0], scale: 1.0 },
  RIFLE:     { pos: [0.20, -0.20, -0.42], ads: [0.0, -0.22, -0.36], rot: [0, 2, 0], scale: 1.0 },
  SNIPER:    { pos: [0.21, -0.19, -0.44], ads: [0.0, -0.21, -0.38], rot: [0, 2, 0], scale: 1.0 },
  GRENADE:   { pos: [0.26, -0.30, -0.50], ads: [0.18, -0.24, -0.46], rot: [0, 0, 0], scale: 1.0 },
  FLASHBANG: { pos: [0.26, -0.30, -0.50], ads: [0.18, -0.24, -0.46], rot: [0, 0, 0], scale: 1.0 },
};
const MODELS = ['Dagger', 'Pistol_1', 'AR_1', 'Sniper_1', 'Grenade', 'Grenade_1', 'Grenade_2'];
const LIKE = [['PX9', 'PISTOL'], ['V99', 'PISTOL'], ['V27C', 'PISTOL'], ['VX40', 'SNIPER'], ['RV357', 'PISTOL'], ['DE50', 'PISTOL'], ['K7', 'RIFLE'], ['VR4', 'RIFLE'],
  ['MP2', 'RIFLE'], ['LR7', 'SNIPER'], ['LR7X', 'SNIPER'], ['FRAG', 'GRENADE'], ['FLASH', 'FLASHBANG'],
  ['SMOKE', 'FLASHBANG'], ['C5', 'GRENADE'], ['MEDKIT', 'GRENADE'],
  // the classes' kit
  ['PX19', 'PISTOL'], ['HLP2', 'PISTOL'], ['V19P', 'RIFLE'], ['IM8S', 'RIFLE'], ['HASL3', 'RIFLE'], ['RV90S', 'SNIPER'], ['KDMR3', 'SNIPER'],
  ['SERVICE', 'GRENADE'], ['CONCUSS', 'FLASHBANG'], ['INCEND', 'GRENADE'], ['NERVE', 'FLASHBANG'], ['AIRINC', 'GRENADE'], ['AIRFLARE', 'FLASHBANG'],
  ['LANDMINE', 'GRENADE'], ['AIDPACK', 'GRENADE'], ['REPAIRKIT', 'GRENADE']];
// These models are not built to metres, so each is measured and scaled to a
// real length (the longest side, in metres).
const REAL_LENGTH = { KNIFE: 0.30, PISTOL: 0.22, RIFLE: 0.72, SNIPER: 1.05, GRENADE: 0.11, FLASHBANG: 0.11,
  PX9: 0.22, V99: 0.20, V27C: 0.17, VX40: 0.98, RV357: 0.25, DE50: 0.26, K7: 0.72, VR4: 0.80, MP2: 0.58, LR7: 1.05, LR7X: 1.20,
  FRAG: 0.11, FLASH: 0.11, SMOKE: 0.11, C5: 0.16, MEDKIT: 0.18,
  PX19: 0.2, HLP2: 0.3, V19P: 0.5, IM8S: 0.65, HASL3: 0.85, RV90S: 0.92, KDMR3: 1.1,
  SERVICE: 0.11, CONCUSS: 0.11, INCEND: 0.12, NERVE: 0.12, AIRINC: 0.13, AIRFLARE: 0.13, LANDMINE: 0.3, AIDPACK: 0.2, REPAIRKIT: 0.3 };
// the catalogue ids are held the same way as the originals
for (const [id, like] of LIKE) if (!HOLD[id]) HOLD[id] = HOLD[like];
// Rhys's weapons sheet: each held like its kind, at its own length (sim/arms/sheet.js)
for (const [id, it] of Object.entries(ITEMS)) {
  if (it.like && !HOLD[id]) HOLD[id] = HOLD[it.like];
  if (it.length && !REAL_LENGTH[id]) REAL_LENGTH[id] = it.length;
}

// Measure a loaded model in its own units, so it can be scaled to metres and
// turned the right way round: these packs do not agree on units or on which
// way a weapon points.
function measure(entity) {
  let min = null, max = null;
  for (const r of entity.findComponents('render')) for (const mi of r.meshInstances) {
    const b = mi.aabb, c = b.center, h = b.halfExtents;
    const lo = [c.x - h.x, c.y - h.y, c.z - h.z], hi = [c.x + h.x, c.y + h.y, c.z + h.z];
    if (!min) { min = lo; max = hi; } else for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], lo[i]); max[i] = Math.max(max[i], hi[i]); }
  }
  if (!min) return { size: [1, 1, 1], centre: [0, 0, 0], long: 2, axis: 2 };
  const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  const centre = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  const axis = size[0] >= size[1] && size[0] >= size[2] ? 0 : size[1] >= size[2] ? 1 : 2;
  return { size, centre, long: size[axis] || 1, axis };
}
// The top of a measured model above its own centre, in metres once
// scaled: after faceForward, the model's height is its Y (or, for a model
// long along Y and tipped forward, its Z).
export function sightTop(m, s) { return (m.axis === 1 ? m.size[2] : m.size[1]) * s / 2; }
// (Rhys: "can we SEE a silencer attached to a weapon when they are")
// What its mods look like on a weapon, in the holder's frame (forward -z; the
// model reaches 0.65 of its length ahead of the holder, its top `top` above):
// a suppressor on the muzzle, a sight on top, a grip under the front, a longer
// magazine. Each: { mod, shape: 'cyl' (along z) | 'box', pos, size }.
// (Rhys: "can we also please see scopes ... including when alt-aiming,
// if the scope has iron-sight or a reticule, that'd be nice to look through")
// What you see through a weapon's sight when you aim: 'cross' (a long scope:
// fine crosshairs and range marks), 'chevron' (a marksman's 3x), 'dot' (a 2x
// optic's red dot over the iron sights) or 'none' (iron sights alone).
export function scopeKind(w) {
  if (!w || w.kind !== 'gun') return 'none';
  const z = w.zoom || 1, mods = w.mods || [];
  if (mods.includes('SCOPE8') || z >= 4) return 'cross';
  if (z >= 3) return 'chevron';
  if (mods.includes('SCOPE2') || z >= 2) return 'dot';
  return 'none';
}
export function attachmentsFor(mods, len, top, family, zoom) {
  const out = [], pistol = family === 'pistol', muzzle = -0.65 * len, bore = top * 0.45;
  // a rifle that comes with its own sight (the marksman rifles) carries it, unless one is fitted instead
  mods = (mods || []).slice();
  if ((zoom || 1) > 2 && !mods.some((m) => /^SCOPE/.test(m))) mods.push((zoom || 1) >= 4 ? 'SCOPE8' : 'SCOPE3');
  for (const m of mods) {
    if (m === 'SILENCER') {
      const L = pistol ? 0.12 : 0.17, r = pistol ? 0.016 : 0.021;
      out.push({ mod: m, shape: 'cyl', pos: [0, bore, muzzle - L / 2 + 0.008], size: [r, L] });
    } else if (m === 'SCOPE2' || m === 'SCOPE8' || m === 'SCOPE3') {
      const L = m === 'SCOPE8' ? 0.26 : m === 'SCOPE3' ? 0.18 : 0.1, r = m === 'SCOPE8' ? 0.021 : m === 'SCOPE3' ? 0.019 : 0.016;
      out.push({ mod: m, shape: 'cyl', pos: [0, top + r + 0.012, -0.15 * len], size: [r, L] });
      out.push({ mod: m, shape: 'box', pos: [0, top + 0.006, -0.15 * len], size: [0.016, 0.014, L * 0.5] });
    } else if (m === 'GRIP') {
      out.push({ mod: m, shape: 'box', pos: [0, -top - 0.04, -0.38 * len], size: [0.026, 0.08, 0.03] });
    } else if (m === 'EXTMAG') {
      out.push({ mod: m, shape: 'box', pos: [0, -top - (pistol ? 0.03 : 0.06), pistol ? 0.02 : -0.1 * len], size: [pistol ? 0.024 : 0.03, pistol ? 0.07 : 0.13, pistol ? 0.03 : 0.05] });
    }
  }
  return out;
}
// Where an aimed gun sits (Rhys: "it jumps up just enough to now
// miss"): its top edge just under the middle of the screen, dead centre, so
// lining up its sights lines up the round. Before, it sat 22 degrees below
// the crosshair and the eye went to the sights. A scoped weapon (zoom) keeps
// its old place, out of the magnified picture.
export function adsPlace(hold, top, zoom, len) {
  if (zoom > 1 || top == null) return hold.ads;
  // and far enough out that its back end is not a block against your eye
  // (the model spans 0.65 of its length ahead of the holder, 0.35 behind)
  const z = Math.min(hold.ads[2], -(0.35 * (len || 0.3) + 0.24));
  return [0, -(top + 0.004), z];
}
// Rotation that points a model's long axis away from the camera.
function faceForward(axis) {
  if (axis === 0) return [0, 90, 0];      // long along X
  if (axis === 1) return [-90, 0, 0];     // long along Y (the knife)
  return [0, 0, 0];                       // already along Z
}

export class WeaponView {
  constructor(pc, app, cam, arsenal) {
    this.pc = pc; this.app = app; this.cam = cam; this.arsenal = arsenal;
    this.models = {};
    this.held = {};              // one entity per weapon, parented to the camera
    this.kick = 0; this.kickRot = 0; this.sway = [0, 0];
    this.flash = null; this.flashT = 0;
    this.targets = [];
    this.projectiles = new Map();
    this.shake = 0;
    this.ready = false;
    this.loadAll();
    this.makeFlash();
  }

  loadAll() {
    const { pc, app } = this;
    let left = MODELS.length;
    for (const name of MODELS) {
      const asset = new pc.Asset(name, 'container', { url: 'assets/weapons/' + name + '.glb' });
      asset.once('load', () => {
        this.models[name] = asset;
        if (--left === 0) { this.ready = true; this.refresh(); }
      });
      asset.once('error', () => { if (--left === 0) { this.ready = true; this.refresh(); } });
      app.assets.add(asset);
      app.assets.load(asset);
    }
  }

  makeFlash() {
    const { pc, app } = this;
    const m = new pc.StandardMaterial();
    m.emissive = new pc.Color(1, 0.82, 0.45); m.emissiveIntensity = 10;
    m.diffuse = new pc.Color(0, 0, 0);
    m.blendType = pc.BLEND_ADDITIVE; m.depthWrite = false; m.cull = pc.CULLFACE_NONE;
    m.update();
    const e = new pc.Entity('flash');
    e.addComponent('render', { type: 'plane', material: m, castShadows: false });
    e.setLocalEulerAngles(90, 0, 0);
    e.enabled = false;
    this.cam.addChild(e);
    this.flash = e;
  }

  // Build (once loaded) the entity for a weapon and keep it parented to the camera.
  entityFor(id, modelName) {
    if (this.held[id]) return this.held[id];
    const asset = this.models[modelName];
    if (!asset) return null;
    const pc = this.pc;
    // holder: where the weapon is held. inner: the model, measured, turned
    // forward, centred on itself and scaled to a real length.
    const holder = new pc.Entity('weapon_' + id);
    const inner = asset.resource.instantiateRenderEntity({ castShadows: false });
    holder.addChild(inner);
    const m = measure(inner);
    const s = (REAL_LENGTH[id] || 0.3) / m.long;
    const turn = faceForward(m.axis);
    inner.setLocalEulerAngles(turn[0], turn[1], turn[2]);
    inner.setLocalScale(s, s, s);
    // after turning, the model's own centre has moved; pull it back to the grip
    const c = m.centre.map((v) => v * s);
    const off = m.axis === 0 ? [-c[2], -c[1], c[0]] : m.axis === 1 ? [-c[0], c[2], -c[1]] : [-c[0], -c[1], -c[2]];
    inner.setLocalPosition(off[0], off[1], off[2] - (REAL_LENGTH[id] || 0.3) * 0.15);
    const hold = HOLD[baseId(id)] || HOLD.PISTOL;
    holder.setLocalEulerAngles(hold.rot[0], hold.rot[1], hold.rot[2]);
    holder.enabled = false;
    this.cam.addChild(holder);
    this.scaleOf = this.scaleOf || {};
    this.scaleOf[id] = s;
    // how far the top of the weapon (its sights) stands above the
    // holder, once turned and scaled: aiming puts that edge on the crosshair
    this.topOf = this.topOf || {};
    this.topOf[id] = sightTop(m, s);
    this.held[id] = holder;
    holder.modSig = '';
    return holder;
  }

  // A weapon model of its own, not tied to the camera: for a guard's hands.
  // Built and turned exactly as the one you hold, so it sits the same way.
  // a weapon's mods, made visible on it: rebuilt when they change
  dress(holder, id, mods, top, zoom) {
    const pc = this.pc, sig = (mods || []).join(',') + '|' + (zoom || 1);
    if (holder.modSig === sig) return;
    holder.modSig = sig;
    for (const c of holder.children.filter((k) => k.name === 'att')) c.destroy();
    if (!this.attMat) {
      const m = new pc.StandardMaterial(); m.diffuse = new pc.Color(0.07, 0.07, 0.08); m.useMetalness = true; m.metalness = 0.6; m.gloss = 0.45; m.update();
      this.attMat = m;
    }
    const it = ITEMS[baseId(id)] || {};
    for (const a of attachmentsFor(mods, REAL_LENGTH[id] || REAL_LENGTH[baseId(id)] || 0.3, top || 0.03, it.family, zoom)) {
      const e = new pc.Entity('att');
      e.addComponent('render', { type: a.shape === 'cyl' ? 'cylinder' : 'box', material: this.attMat, castShadows: false });
      e.setLocalPosition(a.pos[0], a.pos[1], a.pos[2]);
      if (a.shape === 'cyl') { e.setLocalEulerAngles(90, 0, 0); e.setLocalScale(a.size[0] * 2, a.size[1], a.size[0] * 2); }
      else e.setLocalScale(a.size[0], a.size[1], a.size[2]);
      holder.addChild(e);
    }
  }

  spawnModel(id, modelName, mods) {
    const asset = this.models[modelName];
    if (!asset) return null;
    const pc = this.pc;
    const holder = new pc.Entity('carry_' + id);
    const inner = asset.resource.instantiateRenderEntity({ castShadows: false });
    holder.addChild(inner);
    const m = measure(inner);
    const s = (REAL_LENGTH[id] || 0.3) / m.long;
    const turn = faceForward(m.axis);
    inner.setLocalEulerAngles(turn[0], turn[1], turn[2]);
    inner.setLocalScale(s, s, s);
    const c = m.centre.map((v) => v * s);
    const off = m.axis === 0 ? [-c[2], -c[1], c[0]] : m.axis === 1 ? [-c[0], c[2], -c[1]] : [-c[0], -c[1], -c[2]];
    inner.setLocalPosition(off[0], off[1], off[2] - (REAL_LENGTH[id] || 0.3) * 0.15);
    const hold = HOLD[baseId(id)] || HOLD.PISTOL;
    holder.setLocalEulerAngles(hold.rot[0], hold.rot[1], hold.rot[2]);
    holder.modSig = '';
    const z0 = (ITEMS[baseId(id)] || {}).zoom;
    if ((mods && mods.length) || z0 > 2) this.dress(holder, id, mods, sightTop(m, s), z0);
    return holder;
  }

  // In third person the weapon belongs to the body, not the camera.
  setThird(on, body) {
    this.body = body || this.body;
    if (this.third === on && !this.pendingThird) return;
    this.pendingThird = false;
    this.third = on;
    for (const [id, e] of Object.entries(this.held)) {
      // the arm is a squashed box, which would distort the weapon, so it hangs
      // off the body itself at roughly hand height
      const hand = on && body ? (body.root || body) : this.cam;
      if (e.parent !== hand) { e.parent.removeChild(e); hand.addChild(e); }
      e.setLocalScale(1, 1, 1);
      if (on) {
        // the hand bone is small and rotated, so undo its scale and sit in the grip
        if (body && body.hand) {
          e.setLocalScale(1, 1, 1);      // placed each frame by the operative
        } else {
          e.setLocalPosition(0.3, 1.15, -0.34);
          e.setLocalEulerAngles(0, 0, 0);
        }
      }
    }
  }

  modelFor(id) {
    const def = this.arsenal.def ? this.arsenal.def(id) : null;
    return (def && def.model) || MODEL_BY_ID[baseId(id)] || 'Pistol_1';
  }
  refresh() {
    for (const id of Object.keys(this.arsenal.owned)) this.entityFor(id, this.modelFor(id));
  }

  // Called every frame: place the weapon, sway it, and fade the muzzle flash.
  // an energy weapon's beam: a thin bright line from just below your eye to where it struck
  showBeam(from, to, colour) {
    const pc = this.pc;
    if (!this.beamE) {
      const m = new pc.StandardMaterial(); m.diffuse = new pc.Color(0, 0, 0); m.emissive = new pc.Color(1, 0.25, 0.2); m.emissiveIntensity = 3;
      m.blendType = pc.BLEND_ADDITIVE; m.depthWrite = false; m.update();
      this.beamMat = m;
      this.beamE = new pc.Entity('beam'); const r = new pc.Entity(); r.addComponent('render', { type: 'box', material: m, castShadows: false });
      r.setLocalPosition(0, 0, -0.5); this.beamE.addChild(r); this.beamE.r = r; this.app.root.addChild(this.beamE);
    }
    // (Rhys: "the beam appears to shoot from the middle of your body rather than from the barrel")
    // from the muzzle - where the flash sits, at the end of the barrel - in first person
    let f = [from[0], from[1] - 0.12, from[2]];
    if (!this.third && this.flash) { const m = this.flash.getPosition(); f = [m.x, m.y, m.z]; }
    const len = Math.hypot(to[0] - f[0], to[1] - f[1], to[2] - f[2]);
    this.beamE.setPosition(f[0], f[1], f[2]);
    this.beamE.lookAt(to[0], to[1], to[2]);
    this.beamE.r.setLocalScale(0.012, 0.012, len); this.beamE.r.setLocalPosition(0, 0, -len / 2);
    this.beamE.enabled = true; this.beamT = 0.12;
  }
  tick(dt, opts) {
    const a = this.arsenal;
    if (this.beamE && (this.beamT -= dt) <= 0) this.beamE.enabled = false;
    const id = a.current;
    // anything newly carried (a crate swap) gets its model made on the spot
    if (id && !this.held[id] && this.ready) { this.entityFor(id, this.modelFor(id)); if (this.third) this.setThird(true, this.body); }
    for (const k of Object.keys(this.held)) this.held[k].enabled = (k === id);
    const e = this.held[id];
    if (e && a.weapon) this.dress(e, id, a.weapon.mods, this.topOf && this.topOf[id], (ITEMS[baseId(id)] || {}).zoom);
    // looking through a scope, the weapon is not between you and it
    if (e && opts.scoped) e.enabled = false;
    if (this.third) {
      // held by the body: no sway, no view kick
      if (this.flash) this.flash.enabled = false;
      this.kick = Math.max(0, this.kick - dt * 5.5);
      this.shake = Math.max(0, this.shake - dt * 2.2);
      return;
    }
    this.kick = Math.max(0, this.kick - dt * 5.5);
    this.kickRot = Math.max(0, this.kickRot - dt * 6);
    this.flashT = Math.max(0, this.flashT - dt);
    this.shake = Math.max(0, this.shake - dt * 2.2);
    if (this.flash) {
      const w = a.weapon;
      const on = this.flashT > 0 && !!w && w.kind === 'gun';
      this.flash.enabled = on;
      if (on) {
        const s = 0.05 + this.flashT * 0.7;      // a few centimetres, not a screen
        this.flash.setLocalScale(s, 1, s * 0.7);
      }
    }
    if (!e) return;
    const hold = HOLD[baseId(id)] || HOLD.PISTOL;
    const gun = !!(a.weapon && a.weapon.kind === 'gun');
    const base = opts.aim ? (gun ? adsPlace(hold, this.topOf && this.topOf[id], a.weapon.zoom || 1, REAL_LENGTH[id] || REAL_LENGTH[baseId(id)]) : hold.ads) : hold.pos;
    // sway: the weapon lags behind where you look, and bobs when you walk
    const target = [-opts.turn[0] * 0.03, -opts.turn[1] * 0.03];
    this.sway[0] += (target[0] - this.sway[0]) * Math.min(1, dt * 9);
    this.sway[1] += (target[1] - this.sway[1]) * Math.min(1, dt * 9);
    const bob = opts.bob * (opts.aim ? 0.25 : 1);
    const reload = a.reloading > 0 ? Math.sin((1 - a.reloading / 3) * Math.PI) * 0.12 : 0;
    const drawT = Math.max(0, a.cool - (a.weapon && a.weapon.rate || 0));
    e.setLocalPosition(
      base[0] + this.sway[0] + Math.cos(opts.bobPhase) * bob * 0.01,
      base[1] + this.sway[1] + Math.abs(Math.sin(opts.bobPhase)) * bob * 0.012 - this.kick * 0.03 - reload - drawT * 0.25,
      base[2] + this.kick * 0.06,
    );
    // aimed, the barrel points straight down the line of sight (at the hip it is turned in a touch)
    const aimed = opts.aim && gun;
    e.setLocalEulerAngles((aimed ? 0 : hold.rot[0]) - this.kickRot * (aimed ? 3 : 7), aimed ? 0 : hold.rot[1], hold.rot[2] + reload * 40);
    if (this.flash) {
      // at the end of the barrel: the weapon's own length ahead of the grip
      const len = REAL_LENGTH[id] || 0.3;
      this.flash.setLocalPosition(base[0], base[1] + (aimed ? -0.01 : 0.03), base[2] - len * 0.95);
    }
  }

  // a heavy round kicks harder: the Revolver's barrel climbs
  onShot(strength) { const k = Math.min(2.6, strength || 1); this.kick = k; this.kickRot = k; this.flashT = 0.045 * Math.min(1.8, k); }
  onSwing() { this.kick = 1; this.kickRot = 1.4; }
  onBlast(strength) { this.shake = Math.max(this.shake, strength); }

  // What a blast looks like: fire and dust for a frag, a white burst for a
  // flashbang, a cloud that hangs about for smoke (tinted by its fill).
  addBlast(ev) {
    const pc = this.pc;
    this.puffs = this.puffs || [];
    const smoke = ev.smoke > 0;
    const tint = ev.gas === 'cs' ? [0.85, 0.95, 0.7] : ev.gas === 'wp' ? [1, 0.85, 0.7] : ev.gas === 'fire' ? [1, 0.5, 0.16] : ev.gas === 'nerve' ? [0.72, 0.86, 0.42] : [0.82, 0.84, 0.86];
    const n = smoke ? 9 : 5;
    for (let i = 0; i < n; i++) {
      const m = new pc.StandardMaterial();
      if (ev.flash) { m.emissive = new pc.Color(1, 1, 0.92); m.emissiveIntensity = 8; m.diffuse = new pc.Color(0, 0, 0); }
      else if (smoke) { m.diffuse = new pc.Color(tint[0], tint[1], tint[2]); m.emissive = new pc.Color(tint[0] * 0.2, tint[1] * 0.2, tint[2] * 0.2); }
      else { m.emissive = new pc.Color(1, 0.55, 0.18); m.emissiveIntensity = 4; m.diffuse = new pc.Color(0.1, 0.09, 0.08); }
      m.blendType = pc.BLEND_NORMAL; m.depthWrite = false; m.opacity = smoke ? 0.72 : 0.9;
      m.cull = pc.CULLFACE_NONE; m.update();
      const e = new pc.Entity('puff');
      e.addComponent('render', { type: 'sphere', material: m, castShadows: false });
      const spread = smoke ? ev.radius * 0.55 : ev.radius * 0.3;
      e.setPosition(ev.pos[0] + (Math.random() - 0.5) * spread,
        ev.pos[1] + (smoke ? Math.random() * 1.2 : Math.random() * 0.6),
        ev.pos[2] + (Math.random() - 0.5) * spread);
      this.app.root.addChild(e);
      this.puffs.push({ e, m, t: 0,
        life: ev.flash ? 0.35 : smoke ? ev.smoke : 1.1,
        from: smoke ? 0.6 : ev.radius * 0.25,
        to: smoke ? ev.radius * (0.8 + Math.random() * 0.5) : ev.radius * (0.7 + Math.random() * 0.5),
        rise: smoke ? 0.35 : 1.2, hold: smoke ? 0.75 : 0.15, fade: ev.flash ? 0.9 : 0.72 });
    }
  }
  tickBlasts(dt) {
    if (!this.puffs || !this.puffs.length) return;
    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i];
      p.t += dt;
      const k = Math.min(1, p.t / p.life);
      const grow = Math.min(1, p.t / (p.life * (1 - p.hold) + 1e-3));
      const s = p.from + (p.to - p.from) * Math.sqrt(grow);
      p.e.setLocalScale(s, s, s);
      const q = p.e.getPosition();
      p.e.setPosition(q.x, q.y + p.rise * dt, q.z);
      p.m.opacity = Math.max(0, p.fade * (1 - Math.pow(k, 2)));
      p.m.update();
      if (k >= 1) { p.e.destroy(); this.puffs.splice(i, 1); }
    }
  }

  // A bullet mark: a small dark disc on whatever was hit, fading after a while.
  addMark(point, solid, dir) {
    const pc = this.pc;
    this.marks = this.marks || [];
    // which face was hit? the one the point is sitting on
    const gaps = [[Math.abs(point[0] - solid.min[0]), 0, -1], [Math.abs(point[0] - solid.max[0]), 0, 1],
      [Math.abs(point[1] - solid.min[1]), 1, -1], [Math.abs(point[1] - solid.max[1]), 1, 1],
      [Math.abs(point[2] - solid.min[2]), 2, -1], [Math.abs(point[2] - solid.max[2]), 2, 1]];
    gaps.sort((a, b) => a[0] - b[0]);
    const [, axis, sign] = gaps[0];
    if (!this.markMat) {
      const m = new pc.StandardMaterial();
      m.diffuse = new pc.Color(0.06, 0.05, 0.05);
      m.emissive = new pc.Color(0.04, 0.03, 0.02);
      m.blendType = pc.BLEND_NORMAL; m.depthWrite = false; m.opacity = 0.9;
      m.cull = pc.CULLFACE_NONE; m.update();
      this.markMat = m;
    }
    const e = new pc.Entity('mark');
    const m = this.markMat.clone(); m.update();
    e.addComponent('render', { type: 'plane', material: m, castShadows: false });
    const off = 0.012;
    e.setPosition(point[0] + (axis === 0 ? sign * off : 0), point[1] + (axis === 1 ? sign * off : 0),
      point[2] + (axis === 2 ? sign * off : 0));
    e.setEulerAngles(axis === 1 ? (sign > 0 ? 0 : 180) : 90, axis === 2 ? 0 : 90, 0);
    const s = 0.05 + Math.random() * 0.03;
    e.setLocalScale(s, 1, s);
    this.app.root.addChild(e);
    this.marks.push({ e, m, t: 0, life: 14 });
    // a wall only holds so many
    while (this.marks.length > 60) { const old = this.marks.shift(); old.e.destroy(); }
  }
  tickMarks(dt) {
    if (!this.marks || !this.marks.length) return;
    for (let i = this.marks.length - 1; i >= 0; i--) {
      const k = this.marks[i];
      k.t += dt;
      if (k.t > k.life * 0.6) { k.m.opacity = Math.max(0, 0.9 * (1 - (k.t - k.life * 0.6) / (k.life * 0.4))); k.m.update(); }
      if (k.t >= k.life) { k.e.destroy(); this.marks.splice(i, 1); }
    }
  }

  // ── range targets ────────────────────────────────────────────────────────
  // A target is a cut-out figure: the shape of a person, not a board with a
  // person printed on it. The stand stays put; only the figure falls.
  buildTargets(world, textures) {
    const { pc, app } = this;
    const mat = new pc.StandardMaterial();
    mat.diffuseMap = textures.silhouette || textures.target;
    mat.opacityMap = textures.silhouette || textures.target;
    mat.opacityMapChannel = 'a';
    mat.alphaTest = 0.5;                  // cut out, not see-through
    mat.cull = pc.CULLFACE_NONE;          // the same figure from behind
    mat.gloss = 0.1; mat.update();
    const post = new pc.StandardMaterial();
    post.diffuse = new pc.Color(0.2, 0.22, 0.24); post.update();
    for (const t of world.targets || []) {
      if (t.guard || t.hostage) continue;   // people are drawn as people, not range boards (hostages too)
      const sx = t.max[0] - t.min[0], sy = t.max[1] - t.min[1], sz = t.max[2] - t.min[2];
      const wide = Math.max(sx, sz);
      // the figure, on a hinge at its feet
      const holder = new pc.Entity('target');
      holder.setPosition(t.centre[0], t.min[1], t.centre[2]);
      const face = new pc.Entity();
      face.addComponent('render', { type: 'plane', material: mat, castShadows: true });
      // a plane lies flat; stand it up, facing along the target's own axis
      face.setLocalEulerAngles(90, t.axis === 'x' ? 90 : 0, 0);
      face.setLocalScale(wide, 1, sy);
      face.setLocalPosition(0, sy / 2, 0);
      holder.addChild(face);
      app.root.addChild(holder);
      // the stand: a base plate and a short upright, which do not fall. Static
      // targets have theirs built into the level (merged, so they cost nothing);
      // only a target that slides needs its own.
      if (!t.turret && t.track) {
        const stand = new pc.Entity('stand');
        stand.addComponent('render', { type: 'box', material: post, castShadows: false });
        stand.setLocalScale(0.06, Math.max(0.2, t.min[1] + 0.18), 0.06);
        stand.setPosition(t.centre[0], Math.max(0.2, t.min[1] + 0.18) / 2, t.centre[2]);
        app.root.addChild(stand);
        const base = new pc.Entity('stand-base');
        base.addComponent('render', { type: 'box', material: post, castShadows: false });
        base.setLocalScale(0.5, 0.04, 0.3);
        base.setPosition(t.centre[0], 0.02, t.centre[2]);
        app.root.addChild(base);
        this.targets.push({ t, holder, angle: 0, stand, base });
      } else if (t.turret) {
        // A turret you can recognise: a ceiling mount, a turning head with a
        // barrel and a red eye, and a laser when it has you.
        face.enabled = false;
        const dark = new pc.StandardMaterial(); dark.diffuse = new pc.Color(0.16, 0.17, 0.19); dark.metalness = 0.6; dark.useMetalness = true; dark.gloss = 0.5; dark.update();
        const eyeMat = new pc.StandardMaterial(); eyeMat.emissive = new pc.Color(1, 0.12, 0.08); eyeMat.emissiveIntensity = 4; eyeMat.diffuse = new pc.Color(0, 0, 0); eyeMat.update();
        const laserMat = new pc.StandardMaterial(); laserMat.emissive = new pc.Color(1, 0.1, 0.08); laserMat.emissiveIntensity = 3;
        laserMat.diffuse = new pc.Color(0, 0, 0); laserMat.blendType = pc.BLEND_ADDITIVE; laserMat.depthWrite = false; laserMat.update();
        const part = (parent, sx, sy, sz, x, y, z, m) => {
          const e = new pc.Entity(); e.addComponent('render', { type: 'box', material: m || dark, castShadows: true });
          e.setLocalScale(sx, sy, sz); e.setLocalPosition(x, y, z); parent.addChild(e); return e;
        };
        const q = t.turret.pos;
        const mount = new pc.Entity('turret'); mount.setPosition(q[0], q[1], q[2]); app.root.addChild(mount);
        part(mount, 0.25, 1.6, 0.25, 0, 1.0, 0);                 // the arm up to the ceiling
        const head = new pc.Entity('turret-head'); mount.addChild(head);
        part(head, 0.8, 0.5, 0.9, 0, 0, 0);                      // the body
        part(head, 0.14, 0.14, 0.7, -0.18, -0.02, -0.7);         // twin barrels
        part(head, 0.14, 0.14, 0.7, 0.18, -0.02, -0.7);
        const eye = part(head, 0.22, 0.22, 0.06, 0, 0.1, -0.46, eyeMat);
        const laser = part(head, 0.025, 0.025, 1, 0, 0.1, -0.5, laserMat);
        laser.enabled = false;
        this.targets.push({ t, holder, angle: 0, turret: { mount, head, eye, eyeMat, laser, dead: false } });
      } else {
        this.targets.push({ t, holder, angle: 0 });
      }
    }
  }
  tickTargets(dt, eyePos) {
    for (const v of this.targets) {
      if (v.turret) { this.tickTurret(v, dt, eyePos); continue; }
      const want = v.t.down ? 82 * (v.t.fall || -1) : 0;
      v.angle += (want - v.angle) * Math.min(1, dt * 9);
      // fall away from the firing line: about X for a target facing along z,
      // about Z for one facing along x
      if (v.t.axis === 'x') v.holder.setLocalEulerAngles(0, 0, v.angle);
      else v.holder.setLocalEulerAngles(v.angle, 0, 0);
      // a target on a track has to be drawn where it has slid to, stand and all
      v.holder.setPosition(v.t.centre[0], v.t.min[1], v.t.centre[2]);
      if (v.stand) {
        const p = v.stand.getPosition();
        v.stand.setPosition(v.t.centre[0], p.y, v.t.centre[2]);
        v.base.setPosition(v.t.centre[0], 0.02, v.t.centre[2]);
      }
      v.t.solid.disabled = v.t.down;
    }
  }

  // Ghost's own security turrets: the same head, sweeping, never firing on
  // Ghost or its allies. Their eye shows green, so friend and foe differ.
  buildSecurity(list) {
    const { pc, app } = this;
    this.security = [];
    const dark = new pc.StandardMaterial(); dark.diffuse = new pc.Color(0.16, 0.17, 0.19); dark.useMetalness = true; dark.metalness = 0.6; dark.gloss = 0.5; dark.update();
    const eyeMat = new pc.StandardMaterial(); eyeMat.emissive = new pc.Color(0.2, 1, 0.35); eyeMat.emissiveIntensity = 3; eyeMat.diffuse = new pc.Color(0, 0, 0); eyeMat.update();
    const part = (parent, sx, sy, sz, x, y, z, m) => {
      const e = new pc.Entity(); e.addComponent('render', { type: 'box', material: m || dark, castShadows: true });
      e.setLocalScale(sx, sy, sz); e.setLocalPosition(x, y, z); parent.addChild(e); return e;
    };
    for (const s of list || []) {
      const mount = new pc.Entity('security-turret'); mount.setPosition(s.pos[0], s.pos[1], s.pos[2]); app.root.addChild(mount);
      part(mount, 0.3, 0.3, 0.9, 0, 0, 0.45);                  // the bracket back to the frame
      const head = new pc.Entity(); mount.addChild(head);
      part(head, 0.7, 0.45, 0.8, 0, -0.35, 0);
      part(head, 0.12, 0.12, 0.6, -0.15, -0.37, -0.6); part(head, 0.12, 0.12, 0.6, 0.15, -0.37, -0.6);
      part(head, 0.2, 0.2, 0.06, 0, -0.25, -0.42, eyeMat);
      this.security.push({ head, phase: Math.random() * 6 });
    }
  }
  tickSecurity(dt) {
    for (const s of this.security || []) {
      s.phase += dt;
      // a slow sweep across the apron, looking out into the yard
      s.head.setLocalEulerAngles(-12, 180 + Math.sin(s.phase * 0.5) * 60, 0);
    }
  }

  // A turret turns to follow you, shows its laser while it has you, and when
  // destroyed it slumps, goes dark and smokes.
  tickTurret(v, dt, eyePos) {
    const T = v.turret, q = v.t.turret;
    if (v.t.down) {
      if (!T.dead) {
        T.dead = true;
        T.laser.enabled = false;
        T.eyeMat.emissiveIntensity = 0; T.eyeMat.emissive = new this.pc.Color(0.1, 0.1, 0.1); T.eyeMat.update();
        this.addBlast({ pos: q.pos.slice(), radius: 2.2, smoke: 14, damage: 0 });
        this.addBlast({ pos: q.pos.slice(), radius: 1.4, damage: 1 });
      }
      // slumped, nose down
      const e = T.head.getLocalEulerAngles();
      T.head.setLocalEulerAngles(Math.min(55, e.x + dt * 90), e.y, Math.min(20, e.z + dt * 30));
      return;
    }
    if (!eyePos) return;
    // it aims at your chest, not your eyes
    const d = [eyePos[0] - q.pos[0], eyePos[1] - 0.55 - q.pos[1], eyePos[2] - q.pos[2]];
    const len = Math.hypot(d[0], d[1], d[2]) || 1;
    // when it cannot see you it sweeps slowly; when it can, it points at you
    let yaw, pitch;
    if (q.canSee) {
      yaw = Math.atan2(-d[0], -d[2]) * 180 / Math.PI;
      pitch = Math.asin(d[1] / len) * 180 / Math.PI;
    } else {
      T.sweep = (T.sweep || 0) + dt;
      yaw = Math.sin(T.sweep * 0.6) * 55; pitch = -18;
    }
    T.head.setLocalEulerAngles(pitch, yaw, 0);
    T.laser.enabled = !!q.canSee;
    if (q.canSee) {
      // a thin beam that stops just short of you, so it never fills the view
      const beam = Math.max(0.5, len - 1.1);
      T.laser.setLocalScale(0.012, 0.012, beam);
      T.laser.setLocalPosition(0, 0.1, -0.46 - beam / 2);
    }
    // the eye brightens as it locks, and dims while it reloads
    T.eyeMat.emissiveIntensity = q.reload > 0 ? 0.8 : q.canSee ? 6 : 3;
    T.eyeMat.update();
  }

  // ── grenades in the air ──────────────────────────────────────────────────
  tickProjectiles() {
    const { pc, app } = this;
    const live = new Set();
    for (const p of this.arsenal.projectiles) {
      live.add(p);
      let e = this.projectiles.get(p);
      if (!e && p.rocket) {
        // a rocket: a dark body and a bright motor, pointed the way it flies
        e = new pc.Entity('rocket');
        const m = new pc.StandardMaterial(); m.diffuse = new pc.Color(0.25, 0.27, 0.22); m.emissive = new pc.Color(1, 0.55, 0.15); m.emissiveIntensity = 0.6; m.update();
        const body = new pc.Entity(); body.addComponent('render', { type: 'box', material: m }); body.setLocalScale(0.09, 0.09, 0.5);
        e.addChild(body); app.root.addChild(e); this.projectiles.set(p, e);
      }
      if (p.rocket) {
        e.setPosition(p.pos[0], p.pos[1], p.pos[2]);
        e.lookAt(p.pos[0] + p.vel[0], p.pos[1] + p.vel[1], p.pos[2] + p.vel[2]);
        continue;
      }
      if (!e) {
        const model = (this.arsenal.def && this.arsenal.def(p.id) || {}).model;
        const asset = this.models[model || 'Grenade'];
        e = asset ? asset.resource.instantiateRenderEntity({ castShadows: true }) : new pc.Entity('nade');
        if (asset) { const s = 0.11 / measure(e).long; e.setLocalScale(s, s, s); }
        if (!asset) {
          const m = new pc.StandardMaterial(); m.diffuse = new pc.Color(0.2, 0.25, 0.2); m.update();
          e.addComponent('render', { type: 'sphere', material: m });
          e.setLocalScale(0.18, 0.18, 0.18);
        }
        app.root.addChild(e);
        this.projectiles.set(p, e);
      }
      e.setPosition(p.pos[0], p.pos[1], p.pos[2]);
      p.spin = (p.spin || 0) + 9;
      e.setEulerAngles(p.spin, p.spin * 0.7, 0);
    }
    for (const [p, e] of this.projectiles) if (!live.has(p)) { e.destroy(); this.projectiles.delete(p); }
  }
}

const MODEL_BY_ID = { KNIFE: 'Dagger', PISTOL: 'Pistol_1', RIFLE: 'AR_1', SNIPER: 'Sniper_1', GRENADE: 'Grenade_1', FLASHBANG: 'Grenade_2' };
export { MODEL_BY_ID, HOLD };
