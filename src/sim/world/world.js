// FRONTLINE - collision world.
// Everything solid is an axis-aligned box. That keeps movement exact,
// cheap on a Chromebook, and testable without a graphics card. Water and
// ladders are volumes the player can be inside.

const EPS = 1e-4;   // surfaces that merely touch are not overlapping
const CELL = 4, HUGE = 256;          // the grid's squares, metres; a solid over more of them is looked at always
// solids that move sideways once made: people (their bodies are targets), hinged doors, the range's targets
const MOBILE = new Set(['target', 'hdoor']);

export class World {
  constructor() {
    this.solids = [];   // {min:[x,y,z], max:[x,y,z], tag}
    this.water = [];    // {min, max}  surface = max[1]
    this.ladders = [];  // {min, max, face:[nx,nz]}  face points away from the wall, toward the climber
    this.zones = [];    // {min, max, id, label}  named areas (for prompts, tests, future triggers)
    this.spawn = { pos: [0, 0, 0], yaw: 0 };
  }

  addSolid(min, max, tag, opts) {
    const b = { min: min.slice(), max: max.slice(), tag: tag || '' };
    if (opts && opts.noClimb) b.noClimb = true;
    if (opts && opts.shootThrough) b.shootThrough = true;   // a railing's stop: it holds you, not a bullet or a look
    // how hard it is to shoot through: undefined means you cannot
    if (opts && opts.tough !== undefined) b.tough = opts.tough;
    if (opts && opts.glass) b.glass = true;
    // a ghost blocks bodies but not bullets (the barriers over firing lines)
    if (opts && opts.ghost) b.ghost = true;
    // something only a bullet meets: glasses on their racks, bottles
    // on their shelves - nobody walks into them, a round goes through them
    if (opts && opts.shotOnly) b.shotOnly = true;
    if (opts && opts.glassware) b.glassware = true;
    this.solids.push(b);
    return b;
  }
  addWater(min, max) { this.water.push({ min: min.slice(), max: max.slice() }); }
  addLadder(min, max, face) { this.ladders.push({ min: min.slice(), max: max.slice(), face: face.slice() }); }
  addZone(min, max, id, label) { this.zones.push({ min: min.slice(), max: max.slice(), id, label }); }

  // ── a grid over the ground, so a question about one spot looks
  // only at the solids near it: the casino, furnished, has over eight
  // thousand, and every guard, every step, every bullet and every look asked
  // about all of them. Solids that move sideways (people, the hinged doors,
  // targets) are kept apart and always looked at; the rest go into four-metre
  // squares as they are added. The answers are the same as a look at every
  // solid in turn - the first-added wins a tie, as before (tested).
  _index() {
    if (!this._grid) { this._grid = new Map(); this._mob = []; this._huge = []; this._n = 0; this._stamp = 0; }
    const S = this.solids;
    if (this._n === S.length) return;
    for (let i = this._n; i < S.length; i++) {
      const s = S[i];
      s._i = i;
      if (s.mobile || MOBILE.has(s.tag)) { this._mob.push(s); continue; }
      const x0 = Math.floor(s.min[0] / CELL), x1 = Math.floor(s.max[0] / CELL), z0 = Math.floor(s.min[2] / CELL), z1 = Math.floor(s.max[2] / CELL);
      if ((x1 - x0 + 1) * (z1 - z0 + 1) > HUGE) { this._huge.push(s); continue; }
      for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
        const k = x * 65536 + z;
        let l = this._grid.get(k); if (!l) { l = []; this._grid.set(k, l); }
        l.push(s);
      }
    }
    this._n = S.length;
  }
  // every solid that might overlap the ground from (x0, z0) to (x1, z1), each once
  _near(x0, z0, x1, z1, fn) {
    this._index();
    const st = ++this._stamp;
    for (const s of this._mob) fn(s);
    for (const s of this._huge) fn(s);
    const a0 = Math.floor(x0 / CELL), a1 = Math.floor(x1 / CELL), b0 = Math.floor(z0 / CELL), b1 = Math.floor(z1 / CELL);
    for (let x = a0; x <= a1; x++) for (let z = b0; z <= b1; z++) {
      const l = this._grid.get(x * 65536 + z);
      if (l) for (const s of l) { if (s._seen === st) continue; s._seen = st; fn(s); }
    }
  }
  // Does the box [min,max] overlap any solid? Returns the first hit or null.
  hit(min, max, skip) {
    let best = null;
    this._near(min[0], min[2], max[0], max[2], (s) => {
      if (s === skip || s.disabled || s.shotOnly || (best && s._i > best._i)) return;
      if (min[0] < s.max[0] - EPS && max[0] > s.min[0] + EPS &&
          min[1] < s.max[1] - EPS && max[1] > s.min[1] + EPS &&
          min[2] < s.max[2] - EPS && max[2] > s.min[2] + EPS) best = s;
    });
    return best;
  }
  // All solids overlapping a box (in the order they were added).
  hits(min, max) {
    const out = [];
    this._near(min[0], min[2], max[0], max[2], (s) => {
      if (s.disabled || s.shotOnly) return;
      if (min[0] < s.max[0] - EPS && max[0] > s.min[0] + EPS &&
          min[1] < s.max[1] - EPS && max[1] > s.min[1] + EPS &&
          min[2] < s.max[2] - EPS && max[2] > s.min[2] + EPS) out.push(s);
    });
    return out.sort((a, b) => a._i - b._i);
  }
  // The water volume containing a point (x,z inside, y below the surface), if any.
  waterAt(x, y, z) {
    for (const w of this.water) {
      if (x > w.min[0] && x < w.max[0] && z > w.min[2] && z < w.max[2] &&
          y > w.min[1] - 0.01 && y < w.max[1]) return w;
    }
    return null;
  }
  // Water column under (x,z) regardless of height.
  waterColumn(x, z) {
    for (const w of this.water) {
      if (x > w.min[0] && x < w.max[0] && z > w.min[2] && z < w.max[2]) return w;
    }
    return null;
  }
  ladderAt(min, max) {
    for (const l of this.ladders) {
      if (min[0] < l.max[0] && max[0] > l.min[0] &&
          min[1] < l.max[1] && max[1] > l.min[1] &&
          min[2] < l.max[2] && max[2] > l.min[2]) return l;
    }
    return null;
  }
  zoneAt(x, y, z) {
    for (const zn of this.zones) {
      if (x >= zn.min[0] && x <= zn.max[0] && y >= zn.min[1] && y <= zn.max[1] &&
          z >= zn.min[2] && z <= zn.max[2]) return zn;
    }
    return null;
  }
  // Highest solid top under a point, searching down from y. -Infinity if none.
  groundBelow(x, y, z, r) {
    r = r || 0;
    let best = -Infinity;
    this._near(x - r, z - r, x + r, z + r, (s) => {
      if (s.disabled || s.person || s.shotOnly) return;       // not the dead, not anyone's head
      if (x + r > s.min[0] && x - r < s.max[0] && z + r > s.min[2] && z - r < s.max[2] &&
          s.max[1] <= y + 1e-6 && s.max[1] > best) best = s.max[1];
    });
    return best;
  }
  // Simple ray march against solids (for aiming, prompts, sight).
  // skip(solid): optional - solids it returns true for are looked through
  // (sight passes glass, where a bullet may not).
  raycast(o, d, maxDist, skip) {
    let best = null, bestT = maxDist;
    const test = (s) => {
      if (s.disabled || s.ghost) return;
      let t0 = 0, t1 = bestT;
      for (let i = 0; i < 3; i++) {
        if (Math.abs(d[i]) < 1e-9) {
          if (o[i] < s.min[i] || o[i] > s.max[i]) return;
        } else {
          let a = (s.min[i] - o[i]) / d[i], b = (s.max[i] - o[i]) / d[i];
          if (a > b) { const t = a; a = b; b = t; }
          if (a > t0) t0 = a;
          if (b < t1) t1 = b;
          if (t0 > t1) return;
        }
      }
      if ((t0 < bestT || (t0 === bestT && best && s._i < best._i)) && !(skip && skip(s))) { bestT = t0; best = s; }
    };
    // along the ray square by square, nearest first, until a hit
    // nearer than the next square's edge
    this._index();
    const st = ++this._stamp;
    for (const s of this._mob) { s._seen = st; test(s); }
    for (const s of this._huge) { s._seen = st; test(s); }
    let cx = Math.floor(o[0] / CELL), cz = Math.floor(o[2] / CELL);
    const sx = d[0] > 0 ? 1 : -1, sz = d[2] > 0 ? 1 : -1;
    const ax = Math.abs(d[0]) > 1e-9, az = Math.abs(d[2]) > 1e-9;
    let tx = ax ? ((sx > 0 ? (cx + 1) * CELL : cx * CELL) - o[0]) / d[0] : Infinity;
    let tz = az ? ((sz > 0 ? (cz + 1) * CELL : cz * CELL) - o[2]) / d[2] : Infinity;
    const dtx = ax ? CELL / Math.abs(d[0]) : Infinity, dtz = az ? CELL / Math.abs(d[2]) : Infinity;
    let tIn = 0;
    for (let guard = 0; guard < 4096; guard++) {
      const l = this._grid.get(cx * 65536 + cz);
      if (l) for (const s of l) { if (s._seen === st) continue; s._seen = st; test(s); }
      // the next square: only if the ray reaches it before its best hit
      tIn = Math.min(tx, tz);
      if (tIn > bestT || tIn > maxDist) break;
      if (tx < tz) { cx += sx; tx += dtx; } else { cz += sz; tz += dtz; }
    }
    return best ? { solid: best, t: bestT } : null;
  }
  // the old way, every solid in turn - for the tests to check the grid against
  raycastAll(o, d, maxDist, skip) {
    let best = null, bestT = maxDist;
    for (const s of this.solids) {
      if (s.disabled || s.ghost) continue;
      let t0 = 0, t1 = bestT, ok = true;
      for (let i = 0; i < 3 && ok; i++) {
        if (Math.abs(d[i]) < 1e-9) {
          if (o[i] < s.min[i] || o[i] > s.max[i]) ok = false;
        } else {
          let a = (s.min[i] - o[i]) / d[i], b = (s.max[i] - o[i]) / d[i];
          if (a > b) { const t = a; a = b; b = t; }
          if (a > t0) t0 = a;
          if (b < t1) t1 = b;
          if (t0 > t1) ok = false;
        }
      }
      if (ok && t0 < bestT && !(skip && skip(s))) { bestT = t0; best = s; }
    }
    return best ? { solid: best, t: bestT } : null;
  }
}
