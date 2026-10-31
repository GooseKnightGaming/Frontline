// FRONTLINE - noticing a struggling frame rate (pure logic, tested in node).
// Rhys plays in Low Quality on a Chromebook; a new player on a slow machine
// would not know the setting exists. If the frame rate stays low for a
// while in play (not in menus, not during the first few seconds while
// things load and settle), offer Low Quality - once. The answer is kept.
export class FpsWatch {
  constructor(o) {
    this.o = Object.assign({ below: 20, hold: 8, grace: 6 }, o || {});
    this.t = 0; this.low = 0; this.done = false;
  }
  // dt: seconds this frame. ctx: { quality, paused, asked }.
  // Returns true on the one frame the offer should be made.
  step(dt, ctx) {
    if (this.done || ctx.asked || ctx.quality === 'low') return false;
    if (ctx.paused) return false;                 // time in menus does not count
    this.t += dt;
    if (this.t < this.o.grace) return false;
    const fps = 1 / Math.max(dt, 1e-3);
    // slow frames build up; good ones wear it down twice as fast, so a
    // few bad moments (a bake, a big fight) are not enough
    this.low = fps < this.o.below ? this.low + dt : Math.max(0, this.low - dt * 2);
    if (this.low >= this.o.hold) { this.done = true; return true; }
    return false;
  }
}

// (Rhys: "massive frame-rate drop from Low Qual to High Qual" - the pixels: High draws up
// to 1.5 per screen pixel, Low 0.75) a frame rate held under `low` for `hold` samples (half a second
// each) brings the drawing resolution down a step, never under `floor`; it does not climb back
// (with the screen's refresh as a ceiling, 60 cannot tell us there is room to spare)
export class ResScaler {
  constructor(o) { o = o || {}; this.low = o.low || 45; this.hold = o.hold || 4; this.step = o.step || 0.1; this.reset(1, 1); }
  reset(cap, floor) { this.ratio = cap; this.floor = Math.min(cap, floor); this.n = 0; }
  // one sample of the frame rate; returns the new ratio when it changes, else null
  sample(fps) {
    if (!(fps > 0)) return null;
    this.n = fps < this.low ? this.n + 1 : 0;
    if (this.n < this.hold || this.ratio <= this.floor + 1e-9) return null;
    this.n = 0;
    this.ratio = Math.max(this.floor, Math.round((this.ratio - this.step) * 100) / 100);
    return this.ratio;
  }
}
