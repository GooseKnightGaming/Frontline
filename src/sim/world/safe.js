// FRONTLINE - a safe with a combination dial (Rhys: "a 4-digit
// number that has to be cycled to, like a proper circular-tumbler safe - or
// blow the door off").
//
// Pure logic. The dial turns a notch at a time through 0-9; each number of
// the combination is set in turn; all four right and the handle turns. A
// wrong one is only found out at the end, and you start again. The tumbler
// gives a heavier click when the dial sits on the number it is waiting for -
// a careful ear can crack it without the code. A breaching charge close by
// takes the door off.

export const SAFE = { digits: 4, blastReach: 1.8 };

export class Safe {
  constructor(code) {
    this.code = (code || [0, 0, 0, 0]).slice(0, SAFE.digits);
    this.dial = 0;
    this.entered = [];
    this.open = false;
    this.blown = false;
    this.events = [];               // { type: 'click', on } for sound
  }
  turn(dir) {
    if (this.open) return this.dial;
    this.dial = ((this.dial + (dir > 0 ? 1 : -1)) % 10 + 10) % 10;
    this.events.push({ type: 'click', on: this.dial === this.code[this.entered.length] });
    return this.dial;
  }
  // set the number under the pointer: 'next', 'open' or 'wrong'
  set() {
    if (this.open) return 'open';
    this.entered.push(this.dial);
    if (this.entered.length < this.code.length) return 'next';
    const ok = this.entered.every((d, i) => d === this.code[i]);
    this.entered = [];
    if (ok) { this.open = true; return 'open'; }
    return 'wrong';
  }
  // a blast at pos: only a breaching charge, and only close, takes the door off
  blast(pos, at, breach) {
    if (this.open || !breach) return false;
    if (Math.hypot(pos[0] - at[0], pos[1] - at[1], pos[2] - at[2]) > SAFE.blastReach) return false;
    this.open = true; this.blown = true;
    return true;
  }
}

// Is this camera's feed glitching just now? (the combination hides in
// the cameras.) A camera given a number of the code (c.clue) tears for under
// half a second every six to eight seconds; in the tear its number shows
// faintly in the picture (the clock's seconds were too subtle).
// Others never glitch.
export const GLITCH = { long: 0.45 };
export function cameraGlitch(c, t) {
  if (!c || c.clue === undefined || c.clue === null) return false;
  const period = 6 + (c.n % 4) * 0.8;
  return ((t + c.n * 1.7) % period) < GLITCH.long;
}

// Where on the feed a camera's glitch number shows, as [left%, top%]
// of the picture - each camera its own spot (the hint ring goes round it).
export function glitchSpot(c) { return [18 + (c.n * 23) % 60, 25 + (c.n * 17) % 45]; }
