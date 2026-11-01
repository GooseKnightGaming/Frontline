// FRONTLINE - defence systems: cameras and turrets, and hacking them (Rhys's roadmap, "Hacking and
// control": "Defence systems - turrets, cameras, door locks, lights, alarms - can be taken over at a
// terminal or with a hacking kit: take control (fire on their owners), reprogram (ignore you), or
// disable; a hack takes time and makes noise, and can be interrupted or traced").
//
// Every device belongs to a side (`owner`, a faction) and to a network (`net`): a security terminal
// on that network hacks all of it at once; a hacking kit hacks one device, up close, more slowly.
// A device's mode:
//   'on'        working for its owner: a camera raises the alarm when it sees you, a turret fires on you
//   'off'       disabled
//   'friendly'  reprogrammed to ignore you (and still not to fire on its owners)
//   'ours'      taken over: a turret fires on its owners; a camera stays quiet
// An EMP (emp.js) puts any of them out for a while (`jammed`).
// M6.28: three more kinds, which do nothing on their own but say how the place is:
//   'lock'    a maglock on a door (`doors`, its leaves): locked while it is on and live; disabled,
//             reprogrammed or taken, it lets go. An EMP fries it open for good (it fails safe).
//   'lights'  a lighting circuit over an area (`area`, a world box): out when disabled or taken
//             (yours to keep dark), or a while after an EMP. In the dark a guard sees only what is
//             close (or what his night vision or torch shows him) - and your own screen goes dark too.
//   'alarm'   the alarm: while one is on, a shout or a camera that sees you sets off the siren,
//             and every guard of its side comes. Disabled, reprogrammed or taken, it stays quiet.
//   'laser'   a tripwire beam across a passage (`a` to `b`, `h` above the floor): break it and the
//             alarm goes up where you are. Unseen by the naked eye - night vision and UV show it;
//             under it on your belly, or over it, and it never knows. Hacked in any way, it is off.
// Pure: no drawing. The runtime steps them and turns what they ask for into alarms and shots.

import { hostileToYou } from '../people/factions.js';

export const CAMERA = { range: 16, half: 0.55, notice: 1.1, again: 9, sweep: 0.5, sweepRate: 0.35 };
export const TURRET = { range: 20, half: 1.3, turn: 2.2, gap: 0.11, burst: [4, 7], pause: [0.9, 1.4], damage: 9, near: 6, far: 26, sweepRate: 0.5 };
export const HACK = {
  terminal: 6,      // seconds at a security terminal (the network's every device)
  kit: 9,           // seconds with a hacking kit, at the device itself
  reach: 2.4,       // how close the kit has to be (across the ground)
  trace: 8,         // seconds of hacking a network before its owners trace it - and come looking (a terminal's 6 s is safe; two devices by kit are not)
};
export const SIREN = { again: 45, secs: 5 };   // how long before it can sound again; how long it wails
export const MODES = {
  off: 'Disable',
  friendly: 'Reprogram: ignore me',
  ours: 'Take control',
};

const wrap = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
// the yaw that faces from a to b (the game's: forward is -z at yaw 0)
const yawTo = (a, b) => Math.atan2(-(b[0] - a[0]), -(b[2] - a[2]));

export class Device {
  // def: { id, kind: 'camera' | 'turret', pos: [x, y, z] (its eye), yaw, net, owner }
  constructor(def) {
    this.id = def.id; this.kind = def.kind; this.pos = def.pos.slice();
    this.yaw = def.yaw || 0; this.net = def.net || null; this.owner = def.owner || 'red';
    this.doors = def.doors || [];           // a lock: the door leaves it holds
    this.area = def.area || null;           // lights: the box they light [[x0, y0, z0], [x1, y1, z1]]
    this.name = def.name || null;           // what it is called in the hints (the lights: where)
    this.fried = false;                     // a lock an EMP has burnt out: open for good
    this.hidden = !!def.hidden;             // (M6.28) a pinhole camera: seen only by EMF
    this.a = def.a || null; this.b = def.b || null; this.h = def.h || 0.75;   // a laser: its ends (world, on the floor) and height
    this.floorY = def.floorY === undefined ? null : def.floorY;
    this.mode = 'on'; this.jammed = 0;
    this.look = 0;                 // where it points now, off its base yaw
    this.t = Math.random() * 10;   // its own clock, for the idle sweep
    this.seenT = 0; this.cool = 0; this.target = null;
    this.burst = 0; this.gapT = 0; this.pauseT = 0;
    this.spotted = false;          // a camera, the moment it calls the alarm
  }
  get live() { return this.mode !== 'off' && !(this.jammed > 0) && !this.fried; }
  get facing() { return this.yaw + this.look; }
  // does it go for you, as things stand?
  againstYou(rel) { return this.mode === 'on' && hostileToYou({ faction: this.owner }, rel); }
  // does it go for this guard?
  againstGuard(g, rel) {
    if (g.dead || g.dormant) return false;
    if (this.mode !== 'ours') return false;
    return g.faction === this.owner || hostileToYou(g, rel);
  }
}

// can it see p (horizontal angle within half of where it points, in range, nothing in the way)?
function sees(dev, p, range, half, world) {
  const dx = p[0] - dev.pos[0], dy = p[1] - dev.pos[1], dz = p[2] - dev.pos[2], d = Math.hypot(dx, dy, dz);
  if (d > range || d < 0.01) return false;
  if (Math.abs(wrap(yawTo(dev.pos, p) - dev.facing)) > half) return false;
  if (!world) return true;
  const dir = [dx / d, dy / d, dz / d];
  const from = [dev.pos[0] + dir[0] * 0.4, dev.pos[1] + dir[1] * 0.4, dev.pos[2] + dir[2] * 0.4];
  const hit = world.raycast(from, dir, d - 0.4, (s) => s.person || s.target);
  return !hit || hit.t >= d - 0.8;
}

// One step. ctx: { world, rel, you: { pos, chest, dead }, guards,
//   alarm(dev, pos) - a camera calls it in; shoot(dev, { to, hit, damage, at }) - a turret's round }
export function stepDevice(dev, dt, ctx) {
  dev.t += dt; dev.spotted = false;
  if (dev.cool > 0) dev.cool -= dt;
  if (dev.jammed > 0) dev.jammed = Math.max(0, dev.jammed - dt);
  if (!dev.live) { dev.seenT = 0; dev.target = null; dev.burst = 0; return; }
  if (dev.kind !== 'camera' && dev.kind !== 'turret') return;     // locks, lights, alarms: only a state
  const you = ctx.you;
  if (dev.kind === 'camera') {
    dev.look = Math.sin(dev.t * CAMERA.sweepRate) * CAMERA.sweep;
    const watching = you && !you.dead && dev.againstYou(ctx.rel) && sees(dev, you.chest, CAMERA.range, CAMERA.half, ctx.world);
    dev.seenT = watching ? dev.seenT + dt : Math.max(0, dev.seenT - dt * 0.5);
    if (watching && dev.seenT >= CAMERA.notice * (ctx.camSlow || 1) && dev.cool <= 0) {
      dev.cool = CAMERA.again; dev.spotted = true;
      if (ctx.alarm) ctx.alarm(dev, you.pos.slice());
    }
    return;
  }
  // a turret: the nearest it may fire on and can see, within its arc of the base yaw
  const pick = [];
  if (you && !you.dead && dev.againstYou(ctx.rel)) pick.push({ who: 'you', p: you.chest });
  for (const g of ctx.guards || []) if (dev.againstGuard(g, ctx.rel)) pick.push({ who: g, p: [g.pos[0], g.pos[1] + 1.2, g.pos[2]] });
  let best = null, bd = Infinity;
  for (const c of pick) {
    const off = Math.abs(wrap(yawTo(dev.pos, c.p) - dev.yaw));
    if (off > TURRET.half) continue;
    const d = Math.hypot(c.p[0] - dev.pos[0], c.p[1] - dev.pos[1], c.p[2] - dev.pos[2]);
    if (d >= bd || d > TURRET.range) continue;
    // in sight of its base arc (it can turn to it)
    const keep = dev.look; dev.look = wrap(yawTo(dev.pos, c.p) - dev.yaw);
    const ok = sees(dev, c.p, TURRET.range, 0.2, ctx.world);
    dev.look = keep;
    if (ok) { best = c; bd = d; }
  }
  dev.target = best ? best.who : null;
  if (!best) {
    dev.look += (Math.sin(dev.t * TURRET.sweepRate) * TURRET.half * 0.7 - dev.look) * Math.min(1, dt * 2);
    dev.burst = 0;
    return;
  }
  // turn to it, then fire in bursts
  const want = wrap(yawTo(dev.pos, best.p) - dev.yaw), diff = wrap(want - dev.look);
  dev.look += Math.sign(diff) * Math.min(Math.abs(diff), TURRET.turn * dt);
  if (Math.abs(wrap(want - dev.look)) > 0.08) return;
  if (dev.pauseT > 0) { dev.pauseT -= dt; return; }
  if (dev.burst <= 0) dev.burst = TURRET.burst[0] + Math.floor(Math.random() * (TURRET.burst[1] - TURRET.burst[0] + 1));
  dev.gapT -= dt;
  if (dev.gapT > 0) return;
  dev.gapT = TURRET.gap;
  const k = Math.max(0, Math.min(1, (bd - TURRET.near) / (TURRET.far - TURRET.near)));
  const hit = Math.random() < 0.75 - 0.6 * k;
  if (ctx.shoot) ctx.shoot(dev, { to: best.p.slice(), hit, damage: TURRET.damage, at: best.who === 'you' ? null : best.who });
  dev.burst--;
  if (dev.burst <= 0) dev.pauseT = TURRET.pause[0] + Math.random() * (TURRET.pause[1] - TURRET.pause[0]);
}

// a hack's outcome, on one device or a network's every device; returns how many changed
export function setMode(devices, mode) {
  let n = 0;
  for (const d of devices) if (d.mode !== mode && !d.broken) { d.mode = mode; d.seenT = 0; d.target = null; d.burst = 0; n++; }
  return n;
}

// the trace on a network: seconds of hacking build it; full, its owners know where you are
export class Trace {
  constructor() { this.t = {}; this.done = {}; }
  // dt of hacking on net; true the moment it is traced
  add(net, dt) {
    if (!net || this.done[net]) return false;
    this.t[net] = (this.t[net] || 0) + dt;
    if (this.t[net] >= HACK.trace) { this.done[net] = true; return true; }
    return false;
  }
  level(net) { return net ? Math.min(1, (this.t[net] || 0) / HACK.trace) : 0; }
}

// ── locks, lights, alarms: what they say about the place ──
// a lock holds its doors while it is on and live
export const holds = (dev) => dev.kind === 'lock' && dev.mode === 'on' && dev.live;
// lights are out: disabled or taken over, or jammed a while
export const lightsOut = (dev) => dev.kind === 'lights' && (dev.mode === 'off' || dev.mode === 'ours' || dev.jammed > 0);
const within = (b, p) => p[0] >= b[0][0] && p[0] <= b[1][0] && p[1] >= b[0][1] && p[1] <= b[1][1] && p[2] >= b[0][2] && p[2] <= b[1][2];
// is it dark at p (a circuit over it is out)?
export function darkAt(devices, p) {
  for (const d of devices) if (d.kind === 'lights' && d.area && lightsOut(d) && within(d.area, p)) return d;
  return null;
}
// is there an alarm that would sound for this side?
export function sirenFor(devices, owner) {
  return devices.find((d) => d.kind === 'alarm' && d.mode === 'on' && d.live && (!owner || d.owner === owner)) || null;
}
// set each lock's doors by it: locked while it holds, free once it lets go (a door blown open stays open)
export function syncLocks(devices) {
  let changed = 0;
  for (const d of devices) {
    if (d.kind !== 'lock') continue;
    const want = holds(d);
    for (const leaf of d.doors) if (!leaf.blown && leaf.locked !== want) { leaf.locked = want; changed++; }
  }
  return changed;
}
// what a hack's choice does to these devices, in words (for the choice itself)
export function modeSays(devices, mode) {
  const has = (k) => devices.some((d) => d.kind === k);
  const bits = [];
  if (has('camera')) bits.push(mode === 'on' ? '' : mode === 'friendly' ? 'cameras ignore you' : mode === 'ours' ? 'cameras yours' : 'cameras off');
  if (has('turret')) bits.push(mode === 'friendly' ? 'turrets hold fire on you' : mode === 'ours' ? 'turrets fire on the reds' : 'turrets off');
  if (has('lock')) bits.push('doors unlocked');
  if (has('lights')) bits.push(mode === 'friendly' ? 'lights stay on' : 'lights out');
  if (has('alarm')) bits.push('the alarm silent');
  if (has('laser')) bits.push('the lasers off');
  return bits.filter(Boolean).join(', ');
}

// ── a laser tripwire: is it armed, and did you just break it? ──
export const armed = (dev) => dev.kind === 'laser' && dev.mode === 'on' && dev.live;
// you: { pos, h (how tall you stand now) }; prev: where you were a moment ago. True if your body crosses
// the beam's line: near enough to it across the ground, and the beam between your feet and your head
export function breaks(dev, prev, you) {
  if (!armed(dev) || !dev.a || !dev.b) return false;
  const y = (dev.floorY === null ? dev.a[1] : dev.floorY) + dev.h;
  if (you.pos[1] > y || you.pos[1] + you.h < y) return false;
  // the segment a-b, against the path prev-pos (both across the ground): do they cross, or are you on it?
  const near = (p) => {
    const ax = dev.b[0] - dev.a[0], az = dev.b[2] - dev.a[2], l2 = ax * ax + az * az || 1;
    const t = Math.max(0, Math.min(1, ((p[0] - dev.a[0]) * ax + (p[2] - dev.a[2]) * az) / l2));
    return Math.hypot(p[0] - (dev.a[0] + ax * t), p[2] - (dev.a[2] + az * t));
  };
  if (near(you.pos) < 0.28) return true;
  const side = (p) => (dev.b[0] - dev.a[0]) * (p[2] - dev.a[2]) - (dev.b[2] - dev.a[2]) * (p[0] - dev.a[0]);
  const s0 = side(prev), s1 = side(you.pos);
  return s0 * s1 < 0 && near(prev) < 1.2 && near(you.pos) < 1.2;
}
