// FRONTLINE - camera height smoothing.
// The body moves in hard little steps (a stair, a crate edge); the eyes should
// not. The camera height follows the body on a critically damped spring: it
// speeds up and slows down smoothly instead of lunging at each step. Fast
// vertical movement (jumps, falls) tightens the spring so nothing feels
// floaty, and anything like a teleport is taken instantly.
export class CamSmoother {
  constructor() { this.y = null; this.v = 0; }
  reset() { this.y = null; this.v = 0; }
  update(dt, targetY, vy) {
    if (this.y === null || Math.abs(targetY - this.y) > 1.6) { this.y = targetY; this.v = 0; return this.y; }
    const k = Math.min(1, Math.abs(vy || 0) / 1.6);
    const smoothTime = 0.17 + (0.018 - 0.17) * k;
    const omega = 2 / smoothTime, x = omega * dt;
    const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = this.y - targetY;
    const temp = (this.v + omega * change) * dt;
    this.v = (this.v - omega * temp) * e;
    this.y = targetY + (change + temp) * e;
    return this.y;
  }
}
