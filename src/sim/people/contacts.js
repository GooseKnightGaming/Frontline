// FRONTLINE - what you know about who is around you.
//
// The radar shows what YOU know, not what is true. A contact is on it while
// you can sense it - see it, hear it, or (later) pick up its heat through
// goggles - and when you lose it, it stays where you last knew it was,
// fading, until the memory is too old to trust. Pure logic: no engine.

export const RADAR_RANGES = [15, 46, 100];   // close, normal, wide (metres, middle to edge)
export const RADAR_NAMES = ['Close', 'Normal', 'Wide'];
export const MEMORY = 20;          // seconds a last-known position is kept
export const SIGHT = {
  range: 140,                      // metres: past this a figure is a dot you would not pick out
  halfAngle: 1.05,                 // radians either side of where you look (about 120 deg across)
  close: 2.5,                      // this near, you know they are there whichever way you face
};
export const HEARING = 40;         // metres a turret's fire carries, walls or not

// Can you sense this contact from where you are?
// c: { pos, solid (its own collider, which does not hide it), loud (0..1 now) }
// me: { eye, yaw } - yaw 0 looks toward -z, as in player.js
// opts.thermal: goggles that see heat. Heat goes through glass and smoke but
// not walls here; the one-wall-deep rule belongs with the goggles themselves.
// Returns 'sight', 'heat', 'sound', 'near' or null.
export function sense(world, me, c, opts) {
  opts = opts || {};
  const d = [c.pos[0] - me.eye[0], c.pos[1] - me.eye[1], c.pos[2] - me.eye[2]];
  const dist = Math.hypot(d[0], d[1], d[2]);
  if (dist < SIGHT.close) return 'near';
  if (c.loud && dist < HEARING * c.loud) return 'sound';
  if (dist > SIGHT.range) return null;
  // in front of you?
  const fx = -Math.sin(me.yaw), fz = -Math.cos(me.yaw);
  const flat = Math.hypot(d[0], d[2]) || 1;
  const ang = Math.acos(Math.max(-1, Math.min(1, (d[0] * fx + d[2] * fz) / flat)));
  if (ang > SIGHT.halfAngle) return null;
  // and nothing solid in the way (you see through glass; the contact's own
  // body does not hide it)
  const dir = [d[0] / dist, d[1] / dist, d[2] / dist];
  const hit = world.raycast(me.eye, dir, dist, (s) => s.glass || s === c.solid);
  if (hit && hit.t < dist - 0.3) return null;
  return opts.thermal ? 'heat' : 'sight';
}

// A memory of contacts: live while sensed, last-known when not.
export class Tracker {
  constructor() { this.known = new Map(); }

  // detections: [{ id, kind, pos, how }] - everything sensed this moment
  update(dt, detections) {
    const now = new Set();
    for (const s of detections) {
      now.add(s.id);
      const k = this.known.get(s.id) || { id: s.id };
      Object.assign(k, { kind: s.kind, pos: s.pos.slice(), how: s.how, state: s.state || null, live: true, age: 0 });
      this.known.set(s.id, k);
    }
    for (const [id, k] of this.known) {
      if (now.has(id)) continue;
      k.live = false; k.age += dt;
      if (k.age > MEMORY) this.known.delete(id);
    }
  }
  // someone you know is down is no longer a contact at all
  forget(id) { this.known.delete(id); }
  clear() { this.known.clear(); }
  list() { return [...this.known.values()]; }
}

// How to draw a contact: fading as its memory ages
export function fade(k) { return k.live ? 1 : Math.max(0, 1 - k.age / MEMORY); }
