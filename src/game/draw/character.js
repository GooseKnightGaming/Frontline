// FRONTLINE - the people you see: you in third person, every guard, hostage and passer-by.
// Drawn in code (Rhys: "I'd actually prefer the characters code-drawn rather than from asset-packs"): a
// low-poly body on a skeleton of joints (draw/puppet.js), moved by poses written in code (sim/people/poses.js),
// with the clip for the moment chosen by sim/people/anim.js. Hats, goggles and the weapon in hand are added here.

import { pickClip, poseFor } from '../../sim/people/anim.js';
import { poseAt, blend } from '../../sim/people/poses.js';
import { makeBody, applyPose } from './puppet.js';
// (Rhys's screenshots: people across the casino floor came out as
// black cut-outs) the level is lit by its baked light; people only by the
// few lamps switched on near the camera and the scene's ambient - which on a
// night level is dim (0.15). Their own ambient is lifted towards a daylight
// level's (0.42), so someone in the middle of a big room is still seen.
export const FILL = { target: 0.42, most: 3 };
export function fillFor(ambient) {
  const lum = 0.2126 * ambient[0] + 0.7152 * ambient[1] + 0.0722 * ambient[2];
  return Math.max(1, Math.min(FILL.most, FILL.target / Math.max(0.01, lum)));
}
let fillK = 1;
const FILLED = new Set();
function fill(pc, m) {
  if (!m || FILLED.has(m)) return;
  FILLED.add(m);
  if (fillK > 1) { m.ambientTint = true; m.ambient = new pc.Color(fillK, fillK, fillK); m.update(); }
}
// called once the level's light is known (main.js)
export function characterFill(pc, ambient) {
  fillK = fillFor(ambient);
  for (const m of FILLED) { m.ambientTint = fillK > 1; m.ambient = new pc.Color(fillK, fillK, fillK); m.update(); }
  return fillK;
}

// Headgear, built from simple shapes (the low-poly look): rank at a glance.
// Built facing +z, like the body; the origin sits on the crown of the head.
const HAT_MATS = {};
function hatMat(pc, hex) {
  if (HAT_MATS[hex]) return HAT_MATS[hex];
  const m = new pc.StandardMaterial();
  const c = parseInt(hex.slice(1), 16);
  m.diffuse = new pc.Color(((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255);
  m.gloss = 0.25; m.useMetalness = true; m.metalness = 0;
  if (hex === '#2aff5a') { m.emissive = new pc.Color(0.2, 1, 0.35); m.emissiveIntensity = 1.4; }   // a goggle lens's faint green glow
  m.update();
  fill(pc, m);
  return (HAT_MATS[hex] = m);
}
// how far up the head bone's own axis the crown is (0.2 m straight up floated)
const HAT_UP = 0.15;
function makeHat(pc, kind) {
  const hat = new pc.Entity('hat_' + kind);
  const part = (type, hex, pos, scale, rot) => {
    const e = new pc.Entity();
    e.addComponent('render', { type, material: hatMat(pc, hex), castShadows: false });
    e.setLocalPosition(pos[0], pos[1], pos[2]); e.setLocalScale(scale[0], scale[1], scale[2]);
    if (rot) e.setLocalEulerAngles(rot[0], rot[1], rot[2]);
    hat.addChild(e);
  };
  if (kind === 'cap') {                 // a knit cap: the rank and file
    part('cylinder', '#2a2c2b', [0, 0.0, -0.01], [0.205, 0.1, 0.225]);
    part('sphere', '#2a2c2b', [0, 0.045, -0.01], [0.2, 0.09, 0.22]);
  } else if (kind === 'beret') {        // a sergeant's beret, pulled to one side
    // (Rhys: the head poked up through it - it was a flat disc at the
    // brow) a soft dome over the crown, on a headband, slumped to his right
    part('cylinder', '#4a1010', [0, -0.025, -0.005], [0.215, 0.035, 0.228]);
    part('sphere', '#5a1414', [0.03, 0.03, -0.005], [0.27, 0.13, 0.27], [0, 0, -10]);
    part('box', '#c9a43a', [-0.06, -0.01, 0.108], [0.03, 0.035, 0.01]);
  } else if (kind === 'peaked') {       // an officer's peaked cap: crown, band, visor, badge
    part('cylinder', '#3a0e0e', [0, 0.02, -0.005], [0.25, 0.075, 0.26]);
    part('cylinder', '#111111', [0, -0.03, 0], [0.215, 0.04, 0.225]);
    part('box', '#0d0d0d', [0, -0.042, 0.115], [0.17, 0.012, 0.08], [-12, 0, 0]);
    part('box', '#d8b44a', [0, 0.0, 0.12], [0.035, 0.035, 0.008]);
  } else if (kind === 'tactical') {     // a specialist's close-fitting tactical cap, dark olive, short brim
    part('cylinder', '#2c3424', [0, 0.0, -0.01], [0.215, 0.09, 0.23]);
    part('sphere', '#2c3424', [0, 0.04, -0.01], [0.21, 0.08, 0.23]);
    part('box', '#20261a', [0, -0.03, 0.11], [0.16, 0.012, 0.07], [-8, 0, 0]);
  }
  // night-vision goggles on a head mount, down over the eyes
  // (Rhys: nobody seemed to wear them) bigger, further out in front
  // of the face, with the lenses' green glow - you can spot them now
  // the goggles are their own piece (see makeGoggles): they stay on
  // his head when the hat is knocked off - Rhys: they vanished from corpses
  return hat;
}
function makeGoggles(pc) {
  const hat = new pc.Entity('goggles');
  const part = (type, hex, pos, scale, rot) => {
    const e = new pc.Entity();
    e.addComponent('render', { type, material: hatMat(pc, hex), castShadows: false });
    e.setLocalPosition(pos[0], pos[1], pos[2]); e.setLocalScale(scale[0], scale[1], scale[2]);
    if (rot) e.setLocalEulerAngles(rot[0], rot[1], rot[2]);
    hat.addChild(e);
  };
  {
    // the strap round the back of the head: seen from behind, in third person
    part('cylinder', '#161616', [0, -0.085, -0.005], [0.215, 0.035, 0.235], [8, 0, 0]);
    part('box', '#141414', [0, -0.11, 0.17], [0.16, 0.065, 0.07]);
    for (const x of [-0.042, 0.042]) {
      part('cylinder', '#0b0b0b', [x, -0.115, 0.225], [0.045, 0.07, 0.045], [90, 0, 0]);
      part('cylinder', '#2aff5a', [x, -0.115, 0.262], [0.036, 0.006, 0.036], [90, 0, 0]);
    }
    part('box', '#141414', [0, -0.04, 0.13], [0.035, 0.1, 0.03], [-20, 0, 0]);
  }
  return hat;
}

// where the body sits, for the code-drawn body: treading water the head is just under the surface (your feet
// are 1.52 m below it, player.js), the front crawl lies flat just beneath it; lying prone the pose is on the floor
export const PUPPET_SWIM = { still: -0.12, moving: 0.42 };

export class Operative {
  // opts.tint: [r, g, b] multiplies the uniform's colour (a faction's); opts.hat, opts.goggles, opts.shadows;
  // opts.colours: { skin, hair, top, ... } to dress someone differently. (url: no longer used - nothing to load)
  constructor(pc, app, url, opts) {
    this.opts = opts || {};
    this.pc = pc; this.app = app;
    this.root = new pc.Entity('operative');
    app.root.addChild(this.root);
    const b = makeBody(pc, app, this.opts);
    this.puppet = b;
    this.body = b.body;
    this.root.addChild(this.body);
    fill(pc, b.material);
    this.hand = b.joints.hand_r;
    this.knuckle = b.knuckle;
    this.headBone = b.joints.head;
    this.scale = 1;
    this.turn = 0;
    this.cur = null; this.t = 0; this.speed = 1;
    this.from = null; this.blendT = 0; this.blendLen = 0;
    if (this.opts.hat) { this.hat = makeHat(pc, this.opts.hat); this.root.addChild(this.hat); }
    if (this.opts.goggles) { this.goggles = makeGoggles(pc); this.root.addChild(this.goggles); }
    applyPose(pc, b, poseAt('Idle_Loop', 0));
    this.ready = true;
  }

  get enabled() { return this.root.enabled; }
  set enabled(v) { this.root.enabled = v; }

  play(want) {
    // a strike asked for again (a second slash) starts again from the top
    if (want.restart !== undefined && want.restart !== this.lastRestart) {
      this.lastRestart = want.restart;
      this.switchTo(want.clip, 0.06);
      this.speed = want.speed || 1;
      return;
    }
    if (want.clip === this.cur) { this.speed = want.speed === 0 ? 0 : want.speed || 1; return; }
    this.switchTo(want.clip, 0.15);
    this.speed = Math.max(1, want.speed || 1);
  }
  // start a clip from its beginning, blending from wherever the body is now
  switchTo(clip, over) {
    this.from = this.pose || null;
    this.cur = clip; this.t = 0;
    this.blendT = this.blendLen = this.from ? over : 0;
  }
  // the pose now: the clip at its time, blended in from the last one
  step(dt) {
    this.t += dt * this.speed;
    let P = poseAt(this.cur || 'Idle_Loop', this.t);
    if (this.blendT > 0 && this.from) {
      this.blendT = Math.max(0, this.blendT - dt);
      P = blend(this.from, P, 1 - this.blendT / this.blendLen);
    }
    this.pose = P;
    applyPose(this.pc, this.puppet, P);
  }

  // (Rhys: in third person, where are my goggles?) worn when the
  // gear slot holds night vision; made the first time they are wanted
  setGoggles(on) {
    if (on && !this.goggles) { this.goggles = makeGoggles(this.pc); this.root.addChild(this.goggles); }
    if (this.goggles && this.goggles.enabled !== !!on) this.goggles.enabled = !!on;
  }

  // pos: world position of the feet, yaw in radians, state for the picker
  update(dt, state, pos, yaw) {
    if (!this.ready) return;
    const want = pickClip(state);
    this.play(want);
    // a slump: the fall stopped part-way, where a wall behind him caught him
    // (state.slump: seconds into the death clip to hold at)
    if (want.clip === 'Death01' && state.slump !== undefined && state.slump !== null && this.t >= state.slump) this.speed = 0;
    this.step(dt);
    const pose = poseFor(state.stance, state.mode, want.clip === 'Swim_Fwd_Loop');
    // the code-drawn body's own heights: poses lie down and swim for themselves
    if (state.mode === 'swim') pose.lower = want.clip === 'Swim_Fwd_Loop' ? PUPPET_SWIM.moving : PUPPET_SWIM.still;
    else if (state.stance === 2) pose.lower = 0;
    // on a ladder you face the wall, not the way the camera is looking
    if (pose.faceWall && state.ladderFace !== null && state.ladderFace !== undefined) yaw = state.ladderFace;
    // moving sideways, the body turns towards where it is going - smoothly
    const wantTurn = want.turn || 0;
    let d = wantTurn - this.turn;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    this.turn += d * Math.min(1, dt * 10);
    this.root.setPosition(pos[0], pos[1] + pose.lower, pos[2]);
    // viewTurn: tests only, to look at the body side-on from the chase camera
    // dead in a seat: slumped forward over it
    this.root.setEulerAngles(pose.pitch + (want.seated ? 14 : 0), (yaw - this.turn + (this.viewTurn || 0)) * 180 / Math.PI + 180, 0);
    // (Rhys: hats floated, off-centre) the hat sits on the crown of
    // the head and tilts with it: placed along the head bone's own up axis
    // (found once, standing: whichever of its axes points most nearly up),
    // turned to face where he faces.
    if (this.headBone && (this.hat || this.goggles)) {
      const hb = this.headBone, h = hb.getPosition(), a = yaw - this.turn + (this.viewTurn || 0);
      const m4 = hb.getWorldTransform();
      const axes = [m4.getX(new this.pc.Vec3()), m4.getY(new this.pc.Vec3()), m4.getZ(new this.pc.Vec3())].map((v) => v.normalize());
      if (this.upAxis === undefined && !state.dead) {
        let best = 1, bs = -2, sg = 1;
        axes.forEach((v, i) => { if (Math.abs(v.y) > bs) { bs = Math.abs(v.y); best = i; sg = Math.sign(v.y) || 1; } });
        this.upAxis = best; this.upSign = sg;
      }
      const up = axes[this.upAxis === undefined ? 1 : this.upAxis].clone().mulScalar(this.upSign || 1);
      const fw = new this.pc.Vec3(-Math.sin(a), 0, -Math.cos(a));
      // forward, square to that up
      const f2 = fw.clone().sub(up.clone().mulScalar(fw.dot(up))).normalize();
      const rt = new this.pc.Vec3().cross(up, f2).normalize();
      // the hat is built with its front (the visor) along +z: +z goes where he faces
      const zf = f2, xr = new this.pc.Vec3().cross(up, zf).normalize();
      const mm = new this.pc.Mat4();
      mm.data.set([xr.x, xr.y, xr.z, 0, up.x, up.y, up.z, 0, zf.x, zf.y, zf.z, 0, 0, 0, 0, 1]);
      const q = new this.pc.Quat().setFromMat4(mm);
      void rt;
      const crown = (k) => [h.x + up.x * k, h.y + up.y * k, h.z + up.z * k];
      if (this.goggles) { const c = crown(HAT_UP); this.goggles.setPosition(c[0], c[1], c[2]); this.goggles.setRotation(q); }
      if (this.hat && !state.dead) { const c = crown(HAT_UP); this.hat.setPosition(c[0], c[1], c[2]); this.hat.setRotation(q); }
    }
    // the hat sits on the crown of the head, wherever the head has gone
    if (this.hat && this.headBone && state.dead) {
      const h = this.headBone.getPosition(), a = yaw - this.turn + (this.viewTurn || 0);
      if (state.dead) {
        // knocked off as he falls: on the floor beyond his head, crown up
        if (!this.hatDown) this.hatDown = { t: 0 };
        this.hatDown.t = Math.min(1, this.hatDown.t + dt * 1.5);
        const floorY = pos[1] + 0.04;
        // beyond his head if he fell full length; in front of him if a wall caught him
        const away = state.slump !== undefined && state.slump !== null ? -0.55 : 0.35;
        const tx = h.x + Math.sin(yaw) * away, tz = h.z + Math.cos(yaw) * away;
        const k = this.hatDown.t;
        this.hat.setPosition(h.x + (tx - h.x) * k, Math.max(floorY, h.y + 0.2 - k * 2), h.z + (tz - h.z) * k);
        this.hat.setEulerAngles(0, a * 180 / Math.PI + 180 + 40 * k, 25 * (1 - k));
      }
    }
    if (!state.dead) this.hatDown = null;
    this.body.setLocalScale(1, pose.scaleY, 1);
    // Both hands are busy on a ladder, swimming or hauling yourself up: the
    // weapon is slung (hidden) rather than held pointing somewhere odd.
    const busy = state.mode === 'ladder' || state.mode === 'swim' || state.mode === 'traverse' || state.dead;   // (the fallen do not hold a gun)
    if (this.carry) this.carry.enabled = !busy;
    // held in the palm - between the wrist and the knuckles - not at the wrist
    if (this.carry && this.hand && !busy) {
      const w = this.hand.getPosition(), k = this.knuckle ? this.knuckle.getPosition() : w;
      const h = { x: w.x + (k.x - w.x) * 0.6, y: w.y + (k.y - w.y) * 0.6, z: w.z + (k.z - w.z) * 0.6 };
      this.carry.setPosition(h.x, h.y, h.z);
      // the weapon points down its local -z, as it does on the camera in first
      // person; the body model faces +z and needs its 180, the weapon does not
      this.carry.setEulerAngles(pose.pitch * 0.6, (yaw - this.turn + (this.viewTurn || 0)) * 180 / Math.PI, 0);
    }
  }
}
