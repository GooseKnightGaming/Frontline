// FRONTLINE - a lift: a car in a shaft, serving a list of floors, with
// sliding doors on every landing and on the car (M6.9.8, the Riverside
// Hotel's lift at (21, 35)).
//
// Pure logic, like the rest of src/sim. The car is a moving floor (and a
// roof, and a door) in the collision world. Riders are not pushed by the
// floor coming up under them - collision only ever resolves the way you came
// (M6.0.2) - so the game moves anyone standing in the car by the distance the
// car moved (`step` returns it; `carries` says who is aboard).
//
// def:
//   x0, x1, z0, z1   the car's inside, in plan
//   floors           [{ key, label, y }] from the bottom up
//   door             { x, z0, z1 }: the doorway, in the shaft's west wall at x
//                    (the car opens towards -x), z0..z1 along it
//   panel            { x, z, y }: the car's button panel, on its north wall
//   call             { x, z, dy }: the call button on each landing (dy up from the floor)

export const LIFT = {
  speed: 1.6,            // m/s, at full speed
  accel: 1.2,            // m/s², speeding up and slowing down
  doorTime: 0.9,         // s to slide fully open or shut
  dwell: 4,              // s the doors stay open with nobody in the way
  doorH: 2.1,            // the doorway's height
  reach: 1.6,            // how near a landing's doors the call button can be used
  roof: 2.45,            // the car's ceiling above its floor
  buttonGap: 0.16,       // between the panel's buttons, one above the other
  aimLimit: 0.62,     // (M6.10.1, Rhys: the button prompt did not always come up) a little more forgiving        // radians: how far off a button you may look and still press it
};

export class Lift {
  constructor(world, def) {
    this.def = def;
    this.world = world;
    this.at = 0;                     // the floor it is at (or last left)
    this.carY = def.floors[0].y;
    this.v = 0;                      // speed, up positive
    this.target = null;              // the floor it is going to
    this.queue = [];                 // floors asked for, in order
    this.doors = 0;                  // 0 shut .. 1 open (the doors at this.at)
    this.wantOpen = false;
    this.dwellT = 0;
    this.events = [];                // { type: 'ding' | 'doors', opening } for sound
    this.stopped = false;            // the emergency stop (M6.9.11): no more trips till it is reset
    const { x0, x1, z0, z1 } = def;
    // the car's floor and roof move with it
    this.floorSolid = world.addSolid([x0, this.carY - 0.12, z0], [x1, this.carY, z1], 'lift', { noClimb: true });
    this.roofSolid = world.addSolid([x0, this.carY + LIFT.roof, z0], [x1, this.carY + LIFT.roof + 0.1, z1], 'lift', { noClimb: true });
    // the car's door, just inside the shaft's wall
    const d = def.door;
    this.carDoorSolid = world.addSolid([d.x + 0.05, this.carY, d.z0], [d.x + 0.12, this.carY + LIFT.doorH, d.z1], 'liftdoor', { noClimb: true });
    // a door on every landing, in the wall itself
    this.landingSolids = def.floors.map((f) => world.addSolid([d.x - 0.1, f.y, d.z0], [d.x + 0.04, f.y + LIFT.doorH, d.z1], 'liftdoor', { noClimb: true }));
    this.sync();
  }

  get moving() { return this.target !== null; }
  floorY(i) { return this.def.floors[i].y; }

  // Is this point standing in the car? (x, z inside it; feet near its floor)
  carries(pos) {
    const { x0, x1, z0, z1 } = this.def;
    return pos[0] > x0 && pos[0] < x1 && pos[2] > z0 && pos[2] < z1 && pos[1] > this.carY - 0.3 && pos[1] < this.carY + 1.2;
  }
  // the floor a point is on, if it is level with one of them
  floorOf(pos) {
    for (let i = 0; i < this.def.floors.length; i++) if (Math.abs(pos[1] - this.floorY(i)) < 0.6) return i;
    return -1;
  }

  // Near a landing's call button, outside the shaft: which floor, or -1
  landingNear(pos) {
    const d = this.def.door, i = this.floorOf(pos);
    if (i < 0 || pos[0] > d.x) return -1;
    const cz = (d.z0 + d.z1) / 2;
    return Math.hypot(pos[0] - d.x, pos[2] - cz) < LIFT.reach ? i : -1;
  }

  // Ask for a floor (from a landing or the car). The floor it is already
  // standing at opens its doors.
  call(i) {
    if (i < 0 || i >= this.def.floors.length) return 'none';
    if (this.stopped && (this.moving || i !== this.at)) return 'stopped';
    if (!this.moving && i === this.at) {
      this.wantOpen = true; this.dwellT = LIFT.dwell;
      return 'here';
    }
    if (i === this.target || this.queue.includes(i)) return 'already';
    this.queue.push(i);
    // someone wants to go: don't hold the doors open the whole dwell
    if (!this.moving && this.wantOpen) this.dwellT = Math.min(this.dwellT, 1.2);
    return 'coming';
  }

  // The emergency stop: it finishes the trip it is on (nobody is left shut in
  // between floors), opens up there, and goes nowhere else till it is reset.
  setStopped(on) {
    this.stopped = !!on;
    if (this.stopped) this.queue = [];
    return this.stopped;
  }

  // The buttons in the car: where each one is (G at the bottom)
  buttons() {
    const p = this.def.panel;
    return this.def.floors.map((f, i) => ({ i, label: f.label, key: f.key, pos: [p.x, this.carY + p.y + i * LIFT.buttonGap, p.z] }));
  }
  // The button someone in the car is looking at, from their eye along dir
  // (the nearest to where they look, if near enough), or null
  buttonAt(eye, dir) {
    let best = null, bestA = LIFT.aimLimit;
    for (const b of this.buttons()) {
      const v = [b.pos[0] - eye[0], b.pos[1] - eye[1], b.pos[2] - eye[2]];
      const l = Math.hypot(v[0], v[1], v[2]);
      if (l < 0.05 || l > 2.2) continue;
      const cos = (v[0] * dir[0] + v[1] * dir[1] + v[2] * dir[2]) / (l * (Math.hypot(dir[0], dir[1], dir[2]) || 1));
      const a = Math.acos(Math.max(-1, Math.min(1, cos)));
      if (a < bestA) { bestA = a; best = b; }
    }
    return best;
  }

  // The doorway's box (car door to landing door, the full height), for
  // noticing someone standing in it
  doorwayBox() {
    const d = this.def.door, y = this.carY;
    return [[d.x - 0.35, y, d.z0], [d.x + 0.2, y + LIFT.doorH, d.z1]];
  }

  // One step. bodies: [[min, max], ...] of anyone who might be in the
  // doorway (the doors won't shut on them). Returns how far the car moved.
  step(dt, bodies) {
    const before = this.carY;
    this.prevY = this.carY;          // for drawing between steps, as the player is (M6.9.13)
    const blocked = () => {
      const [a, b] = this.doorwayBox();
      return (bodies || []).some(([mn, mx]) => mn[0] < b[0] && mx[0] > a[0] && mn[1] < b[1] && mx[1] > a[1] && mn[2] < b[2] && mx[2] > a[2]);
    };
    if (this.moving) {
      const goal = this.floorY(this.target), rest = goal - this.carY, dir = Math.sign(rest);
      // speed up, cruise, slow down in time to stop at the floor
      const brake = Math.sqrt(2 * LIFT.accel * Math.abs(rest));
      const speed = Math.min(LIFT.speed, Math.abs(this.v) + LIFT.accel * dt, brake + 0.05);
      this.v = dir * speed;
      const move = this.v * dt;
      if (Math.abs(move) >= Math.abs(rest)) {
        this.carY = goal; this.v = 0; this.at = this.target; this.target = null;
        this.wantOpen = true; this.dwellT = LIFT.dwell;
        this.events.push({ type: 'ding' });
      } else this.carY += move;
    } else {
      if (this.wantOpen && this.doors >= 1) {
        this.dwellT -= dt;
        if (this.dwellT <= 0) { if (blocked()) this.dwellT = 1; else this.wantOpen = false; }
      }
      // shutting on someone: back open (the doors' safety edge)
      if (!this.wantOpen && this.doors > 0 && blocked()) { this.wantOpen = true; this.dwellT = 2; }
      // doors shut and somewhere to go: go
      if (!this.wantOpen && this.doors <= 0 && this.queue.length) {
        const next = this.queue.shift();
        if (next === this.at) { this.wantOpen = true; this.dwellT = LIFT.dwell; }
        else this.target = next;
      }
    }
    const wasOpen = this.doors;
    const want = this.wantOpen && !this.moving ? 1 : 0;
    const k = dt / LIFT.doorTime;
    this.doors = want ? Math.min(1, this.doors + k) : Math.max(0, this.doors - k);
    if (this.doors > 1 - 1e-6) this.doors = 1;          // no creeping short of shut or open
    if (this.doors < 1e-6) this.doors = 0;
    if (wasOpen === 0 && this.doors > 0) this.events.push({ type: 'doors', opening: true });
    if (wasOpen === 1 && this.doors < 1) this.events.push({ type: 'doors', opening: false });
    this.sync();
    return this.carY - before;
  }

  // Put the solids where the car and doors are. A doorway is passable once
  // its doors are well open.
  sync() {
    const y = this.carY;
    this.floorSolid.min[1] = y - 0.12; this.floorSolid.max[1] = y;
    this.roofSolid.min[1] = y + LIFT.roof; this.roofSolid.max[1] = y + LIFT.roof + 0.1;
    this.carDoorSolid.min[1] = y; this.carDoorSolid.max[1] = y + LIFT.doorH;
    const open = this.doors > 0.6;
    this.carDoorSolid.disabled = open;
    this.landingSolids.forEach((s, i) => { s.disabled = open && !this.moving && i === this.at; });
  }

  // How far each door leaf has slid (0 shut .. its full travel), for drawing:
  // the landing doors at floor i, and the car's
  // where to draw the car: between its last two steps by the same fraction
  // as the player (M6.9.13, Rhys: in third person you floated going down and
  // sank into the floor going up - the car was drawn a step ahead of you)
  drawY(alpha) {
    if (this.prevY === undefined || alpha === undefined) return this.carY;
    return this.prevY + (this.carY - this.prevY) * Math.max(0, Math.min(1, alpha));
  }
  leafOpen(i) { return !this.moving && i === this.at ? this.doors : 0; }
}
