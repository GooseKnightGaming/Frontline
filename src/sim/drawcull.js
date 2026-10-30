// FRONTLINE - who gets drawn (M6.13.5, Rhys: "an enemy spawn in behind me
// from absolutely nowhere"). Nobody spawns mid-mission: the guard was there all
// along, just not drawn. Bodies were drawn only within 8 m, or within 42 m on
// your own floor - so a guard on the stairs, or across a stairwell or the
// atrium a floor away, was invisible until he came within 8 m, and then popped
// in. Now the floor test is only the cheap first answer: a guard who fails it
// but is in plain sight (a clear line from your eye to his head or chest) is
// drawn too. Sight is re-checked a few at a time (the hotel has ~3900 boxes),
// and a guard once seen stays drawn a moment, so nobody flickers.
// Pure logic: no engine.

export const DRAW = {
  near: 8,        // always drawn this close (round a corner, about to appear)
  far: 42,        // never drawn beyond (unless shown on purpose)
  show: 60,       // `alwaysShow` reach (the captain on the helicopter's ladder)
  floor: 2.5,     // same floor: feet within this
  perFrame: 2,    // sight checks a frame
  linger: 1.2,    // seconds a seen guard stays drawn after the line is lost (M6.17.11: was 0.6)
};

const seeThrough = (s) => s.person || s.target || s.glass || s.shootThrough;

// a clear line from eye to any of `points` (each [x, y, z])?
export function inSight(world, eye, points) {
  for (const p of points) {
    const dx = p[0] - eye[0], dy = p[1] - eye[1], dz = p[2] - eye[2], d = Math.hypot(dx, dy, dz);
    if (d < 1e-6) return true;
    const hit = world.raycast(eye, [dx / d, dy / d, dz / d], d - 0.05, seeThrough);
    if (!hit) return true;
  }
  return false;
}

// where a man can be seen from: head, chest, hips, and his shoulders (across the line of sight)
export function sightPoints(p, eye) {
  const dx = p[0] - eye[0], dz = p[2] - eye[2], d = Math.hypot(dx, dz) || 1, sx = -dz / d * 0.28, sz = dx / d * 0.28;
  return [[p[0], p[1] + 1.6, p[2]], [p[0], p[1] + 1.1, p[2]], [p[0], p[1] + 0.7, p[2]],
    [p[0] + sx, p[1] + 1.35, p[2] + sz], [p[0] - sx, p[1] + 1.35, p[2] - sz]];
}

export class DrawCull {
  constructor(world) { this.world = world; this.last = new Map(); this.i = 0; }
  // people: [{ pos, hidden, alwaysShow }]; feetY: your feet; eye: where you look from.
  // Returns an array of booleans, one per person.
  frame(people, eye, feetY, dt) {
    const out = new Array(people.length).fill(false), maybe = [];
    people.forEach((g, k) => {
      if (g.hidden) return;
      const d = Math.hypot(g.pos[0] - eye[0], g.pos[2] - eye[2]);
      // (M6.17.11) drawn by the cheap test, he counts as seen: when he steps out of it (past 8 m,
      // or you go up a stair) he stays drawn until his sight is checked, not hidden till then
      if (d < DRAW.near || (Math.abs(g.pos[1] - feetY) < DRAW.floor && d < DRAW.far) || (g.alwaysShow && d < DRAW.show)) { out[k] = true; this.last.set(k, DRAW.linger); return; }
      if (d < DRAW.far) maybe.push(k);
    });
    // a few sight checks a frame, round robin over those in reach
    for (let n = 0; n < Math.min(DRAW.perFrame, maybe.length); n++) {
      const k = maybe[(this.i + n) % maybe.length], p = people[k].pos;
      // (M6.17.11, Rhys: a red in the restaurant "became invisible for a moment") his head and
      // chest behind a lamp, a shelf or a pillar, the rest of him in plain view: hidden. Now his
      // head, chest, hips and either shoulder - any one in sight and he is drawn
      if (inSight(this.world, eye, sightPoints(p, eye))) this.last.set(k, DRAW.linger);
    }
    this.i = maybe.length ? (this.i + DRAW.perFrame) % maybe.length : 0;
    for (const k of maybe) {
      const t = this.last.get(k);
      if (t > 0) { out[k] = true; this.last.set(k, t - dt); }
    }
    for (const k of [...this.last.keys()]) if (!maybe.includes(k) && !out[k]) this.last.delete(k);
    return out;
  }
}
