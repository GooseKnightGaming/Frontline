// FRONTLINE - finding a way through a building (for guards).
//
// Each floor is a grid of 0.5 m cells; a cell is open if a guard fits there
// standing on that floor (and there is floor under him). Doors count as open -
// a guard opens them as he goes - and so do other people. Floors are joined
// by links (the stairs): straight lines a guard walks, climbing as he goes.
// Paths are found with A* over all of it, then shortened wherever a straight
// walk is clear. Pure logic: no engine.

const CELL = 0.5;
const R = 0.2, H = 1.7;       // a guard's size, for fitting: a little slim, so 1 m doorways on a 0.5 m grid still let him through

export class NavGrid {
  // floors: [{ y, bounds: [x0, z0, x1, z1] }]; links: [{ a: [x,y,z], b: [x,y,z] }]
  constructor(world, floors, links) {
    this.world = world;
    this.floors = floors.map((f) => this.build(f));
    this.shut = new Set();          // cells filled by a locked reinforced door (see syncDoors)
    this.shutSig = '';
    this.links = [];
    for (const l of links || []) {
      const a = this.cellAt(l.a), b = this.cellAt(l.b);
      if (a && b) this.links.push({ a, b, pa: l.a, pb: l.b, via: l.via || null, ramp: !!l.ramp });
    }
  }

  // walls and furniture only: not doors (opened on the way), not people, not glass panes' absence
  blocks(s) { return !s.disabled && !s.person && s.tag !== 'hdoor' && !s.target && !s.shotOnly; }

  build(f) {
    const [x0, z0, x1, z1] = f.bounds;
    const nx = Math.ceil((x1 - x0) / CELL), nz = Math.ceil((z1 - z0) / CELL);
    // only what could stand in the way on this floor
    const inB = (s) => s.max[0] > x0 && s.min[0] < x1 && s.max[2] > z0 && s.min[2] < z1;
    const band = this.world.solids.filter((s) => inB(s) && this.blocks(s) && s.max[1] > f.y + 0.3 && s.min[1] < f.y + H);
    const under = this.world.solids.filter((s) => inB(s) && !s.disabled && !s.person && !s.target && !s.shotOnly && s.max[1] > f.y - 0.15 && s.max[1] <= f.y + 0.05);
    // (the hotel: thousands of solids a floor) sorted into 4 m
    // buckets, so each cell only tests what is near it - same answer, far quicker
    const B = 4, bx = Math.ceil((x1 - x0) / B) + 1, bz = Math.ceil((z1 - z0) / B) + 1;
    const bucket = (list) => {
      const g = Array.from({ length: bx * bz }, () => []);
      for (const s of list) {
        const i0 = Math.max(0, Math.floor((s.min[0] - R - x0) / B)), i1 = Math.min(bx - 1, Math.floor((s.max[0] + R - x0) / B));
        const k0 = Math.max(0, Math.floor((s.min[2] - R - z0) / B)), k1 = Math.min(bz - 1, Math.floor((s.max[2] + R - z0) / B));
        for (let i = i0; i <= i1; i++) for (let k = k0; k <= k1; k++) g[i + k * bx].push(s);
      }
      return g;
    };
    const bandB = bucket(band), underB = bucket(under);
    const open = new Uint8Array(nx * nz);
    for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
      const cx = x0 + (i + 0.5) * CELL, cz = z0 + (k + 0.5) * CELL;
      const bi = Math.min(bx - 1, Math.floor((cx - x0) / B)) + Math.min(bz - 1, Math.floor((cz - z0) / B)) * bx;
      const lo = [cx - R, f.y + 0.3, cz - R], hi = [cx + R, f.y + H, cz + R];
      let free = true;
      for (const s of bandB[bi]) {
        if (lo[0] < s.max[0] && hi[0] > s.min[0] && lo[2] < s.max[2] && hi[2] > s.min[2] && lo[1] < s.max[1] && hi[1] > s.min[1]) { free = false; break; }
      }
      if (!free) continue;
      let floor = false;
      for (const s of underB[bi]) if (cx >= s.min[0] && cx <= s.max[0] && cz >= s.min[2] && cz <= s.max[2]) { floor = true; break; }
      if (floor) open[i + k * nx] = 1;
    }
    return { y: f.y, x0, z0, nx, nz, open };
  }

  // which floor and cell a point is in (the floor nearest below it)
  cellAt(p) {
    let fi = -1, best = Infinity;
    this.floors.forEach((f, n) => { const d = p[1] - f.y; if (d > -0.6 && d < best) { best = d; fi = n; } });
    if (fi < 0) return null;
    const f = this.floors[fi];
    const i = Math.floor((p[0] - f.x0) / CELL), k = Math.floor((p[2] - f.z0) / CELL);
    if (i < 0 || k < 0 || i >= f.nx || k >= f.nz) return null;
    return { f: fi, i, k };
  }
  isOpen(c) {
    const f = this.floors[c.f];
    return c.i >= 0 && c.k >= 0 && c.i < f.nx && c.k < f.nz && f.open[c.i + c.k * f.nx] === 1 &&
      !(this.shut.size && this.shut.has(c.f * 1e6 + c.k * 1000 + c.i));
  }
  // Guards open ordinary doors as they go, so doors count as open - except a
  // locked reinforced door, which they do not open and so must not be
  // routed through. Cheap to call every frame: it only rebuilds when
  // a door's state has changed (unlocked, opened, blown).
  syncDoors(doors) {
    const shutNow = (doors || []).filter((d) => d.def.build === 'reinforced' && d.locked && !d.blown && !d.open);
    const sig = shutNow.map((d) => (doors.indexOf(d))).join(',');
    if (sig === this.shutSig) return;
    this.shutSig = sig; this.shut = new Set();
    for (const d of shutNow) {
      const c = d.centre, y = d.def.y0;
      let fi = -1, best = Infinity;
      this.floors.forEach((f, n) => { const dd = y - f.y; if (dd > -0.6 && dd < best) { best = dd; fi = n; } });
      if (fi < 0) continue;
      const f = this.floors[fi];
      const lo = Math.min(d.def.from, d.def.to) - 0.1, hi = Math.max(d.def.from, d.def.to) + 0.1;
      for (let i = 0; i < f.nx; i++) for (let k = 0; k < f.nz; k++) {
        const cx = f.x0 + (i + 0.5) * CELL, cz = f.z0 + (k + 0.5) * CELL;
        const along = d.a === 0 ? cx : cz, norm = d.n === 0 ? cx : cz;
        if (along >= lo && along <= hi && Math.abs(norm - d.def.at) <= 0.3) this.shut.add(fi * 1e6 + k * 1000 + i);
      }
    }
  }
  centre(c) { const f = this.floors[c.f]; return [f.x0 + (c.i + 0.5) * CELL, f.y, f.z0 + (c.k + 0.5) * CELL]; }

  // the nearest open cell to a point (a person standing by a desk, say)
  nearestOpen(p) {
    const c = this.cellAt(p);
    if (!c) return null;
    if (this.isOpen(c)) return c;
    for (let r = 1; r < 8; r++) for (let di = -r; di <= r; di++) for (let dk = -r; dk <= r; dk++) {
      if (Math.max(Math.abs(di), Math.abs(dk)) !== r) continue;
      const n = { f: c.f, i: c.i + di, k: c.k + dk };
      if (this.isOpen(n)) return n;
    }
    return null;
  }

  // A path from a to b: a list of points [x, y, z], or null if there is none
  // an open spot on p's floor, as far from `away` as can be found
  // (for a guard running from you)
  farFrom(p, away, minFromP) {
    const c = this.cellAt(p);
    if (!c) return null;
    const f = this.floors[c.f];
    let best = null, bd = -1;
    for (let i = 0; i < f.nx; i += 3) for (let k = 0; k < f.nz; k += 3) {
      if (!f.open[i + k * f.nx]) continue;
      const x = f.x0 + (i + 0.5) * CELL, z = f.z0 + (k + 0.5) * CELL;
      if (Math.hypot(x - p[0], z - p[2]) < (minFromP || 0)) continue;
      const d = Math.hypot(x - away[0], z - away[2]);
      if (d > bd) { bd = d; best = [x, f.y, z]; }
    }
    return best;
  }

  // the open spot he can actually walk to on his own floor (a flood
  // out from where he stands) that is furthest from `away` - for a coward
  // running from you
  reachableFar(p, away) {
    const s = this.nearestOpen(p);
    if (!s) return null;
    const f = this.floors[s.f];
    const seen = new Uint8Array(f.nx * f.nz), q = [s.i + s.k * f.nx];
    seen[q[0]] = 1;
    let best = null, bd = -1;
    for (let h = 0; h < q.length; h++) {
      const idx = q[h], i = idx % f.nx, k = (idx - i) / f.nx;
      const x = f.x0 + (i + 0.5) * CELL, z = f.z0 + (k + 0.5) * CELL;
      const d = Math.hypot(x - away[0], z - away[2]);
      if (d > bd) { bd = d; best = [x, f.y, z]; }
      for (const [di, dk] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = i + di, nk = k + dk;
        if (ni < 0 || nk < 0 || ni >= f.nx || nk >= f.nz) continue;
        const n = ni + nk * f.nx;
        if (seen[n] || !this.isOpen({ f: s.f, i: ni, k: nk })) continue;
        seen[n] = 1; q.push(n);
      }
    }
    return best;
  }

  // stairs and ladders by the cell at either end: key -> [[cell, length]]
  linkIndex() {
    if (this._links === this.links && this._linkIx) return this._linkIx;
    const key = (c) => c.f * 1e6 + c.k * 1000 + c.i, ix = new Map();
    const add = (k, e) => { if (!ix.has(k)) ix.set(k, []); ix.get(k).push(e); };
    for (const l of this.links) {
      // a link may be walked by way of points between (the casino's ramp): its length is theirs
      const pts = [l.pa].concat(l.via || [], [l.pb]);
      let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
      add(key(l.a), [l.b, len, l, false]); add(key(l.b), [l.a, len, l, true]);
    }
    this._links = this.links; this._linkIx = ix;
    return ix;
  }
  // (Rhys: the Yellows "ran outside" as he went up the coil; a red
  // "glorched through the wall ... dropping nearly a floor") someone part way
  // up the ramp or a stair is on no floor: taken to the nearest floor cell he
  // could be anywhere - the street outside the wall, the floor below. Now a
  // point on a link's way is a point on that way: the path goes along it, to
  // the end nearer where it is going, and from there as usual.
  onFloor(p) { const c = this.cellAt(p); return c && Math.abs(p[1] - this.floors[c.f].y) < 0.15 && this.isOpen(c) ? c : null; }
  onLink(p) {
    let best = null, bd = Infinity;
    for (const l of this.links) {
      const pts = [l.pa].concat(l.via || [], [l.pb]);
      // a way with points between is the ramp: 3.7 m wide, its line down the middle
      const reach = l.via ? 1.9 : 0.9;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dz = b[2] - a[2], len2 = dx * dx + dz * dz;
        let t = len2 > 1e-9 ? ((p[0] - a[0]) * dx + (p[2] - a[2]) * dz) / len2 : 0;
        t = Math.max(0, Math.min(1, t));
        const x = a[0] + dx * t, z = a[2] + dz * t, y = a[1] + (b[1] - a[1]) * t;
        if (Math.abs(p[1] - y) > 0.7) continue;
        const d = Math.hypot(p[0] - x, p[2] - z);
        if (d < reach && d < bd) { bd = d; best = { l, pts, i, at: [x, y, z] }; }
      }
    }
    return best;
  }
  // opts.noRamp: (Rhys: a red "shouldn't have been on the coil") the casino's
  // ramp is not his way between floors - his floor and the stairs are
  find(a, b, opts) {
    // on a link's way: off the floor, or on it but along the way's own stretch (the
    // coil runs level with the ground floor for its first metres - a man there was
    // sent back to its start, round and round)
    const on = (p) => { const o = this.onLink(p); return o && (!this.onFloor(p) || (o.i >= 2 && o.i <= o.pts.length - 2)) ? o : null; };
    const la = on(a), lb = on(b);
    if (!la && !lb) return this.findCells(a, b, opts);
    const last = (o) => o.pts.length - 1;
    // both on the same way: along it
    if (la && lb && la.l === lb.l) {
      const out = [a.slice()];
      if (lb.i > la.i) for (let k = la.i; k < lb.i; k++) out.push(la.pts[k].slice());
      else if (lb.i < la.i) for (let k = la.i - 1; k >= lb.i; k--) out.push(la.pts[k].slice());
      out.push(b.slice());
      return out;
    }
    // the coil runs level with a floor for a long way before it climbs
    // (and after): on or off it where it leaves the floor, not at the way's end
    // (two of the Yellows walked 65 m of level coil from its start, and fell behind)
    const flat = (q, end) => Math.abs(q[1] - end[1]) < 0.01;
    let head = [], from = a;
    if (la) {
      // off the way at the end nearer the height he is going to
      const lo = la.pts[0], hi = la.pts[last(la)];
      const toEnd = Math.abs(hi[1] - b[1]) < Math.abs(lo[1] - b[1]) || (Math.abs(hi[1] - b[1]) === Math.abs(lo[1] - b[1]) && la.i > la.pts.length / 2);
      head = [a.slice()];
      if (toEnd) { for (let k = la.i; k <= last(la); k++) { head.push(la.pts[k].slice()); if (flat(la.pts[k], hi) && this.onFloor(la.pts[k])) break; } }
      else { for (let k = la.i - 1; k >= 0; k--) { head.push(la.pts[k].slice()); if (flat(la.pts[k], lo) && this.onFloor(la.pts[k])) break; } }
      from = head[head.length - 1];
    }
    let tail = [], to = b;
    if (lb) {
      // onto the way at the end nearer the height he is coming from - where it leaves that floor
      const lo = lb.pts[0], hi = lb.pts[last(lb)];
      const fromEnd = Math.abs(hi[1] - from[1]) < Math.abs(lo[1] - from[1]);
      if (fromEnd) {
        let k = lb.i; while (k < last(lb) && !(flat(lb.pts[k], hi) && this.onFloor(lb.pts[k]))) k++;
        to = lb.pts[k]; for (let j = k - 1; j >= lb.i; j--) tail.push(lb.pts[j].slice());
      } else {
        let k = lb.i - 1; while (k > 0 && !(flat(lb.pts[k], lo) && this.onFloor(lb.pts[k]))) k--;
        to = lb.pts[k]; for (let j = k + 1; j < lb.i; j++) tail.push(lb.pts[j].slice());
      }
      tail.push(b.slice());
    }
    const mid = this.findCells(from, to, opts);
    if (!mid) return null;
    return head.concat(head.length ? mid.slice(1) : mid, tail);
  }
  findCells(a, b, opts) {
    const noRamp = !!(opts && opts.noRamp);
    const s = this.nearestOpen(a), t = this.nearestOpen(b);
    if (!s || !t) return null;
    // flat arrays over every floor's cells rather than Maps keyed by
    // objects: the same search, the same answer, several times quicker (the
    // street-level grid grew to take in all of the outside)
    const F = this.floors;
    if (!this._off) { this._off = []; let n = 0; for (const f of F) { this._off.push(n); n += f.nx * f.nz; } this._total = n; }
    const off = this._off, total = this._total;
    const idx = (c) => off[c.f] + c.k * F[c.f].nx + c.i;
    const cellOf = (g) => { let f = F.length - 1; while (off[f] > g) f--; const r = g - off[f], nx = F[f].nx; return { f, i: r % nx, k: Math.floor(r / nx) }; };
    // the working arrays are kept between searches; a cell not stamped with
    // this search's number counts as untouched (cost infinite, no parent, not closed)
    if (!this._G) { this._G = new Float64Array(total); this._came = new Int32Array(total); this._closed = new Uint8Array(total); this._stamp = new Uint32Array(total); this._gen = 0; }
    const gen = ++this._gen, Gb = this._G, cb = this._came, kb = this._closed, st = this._stamp;
    const touch = (n) => { if (st[n] !== gen) { st[n] = gen; Gb[n] = Infinity; cb[n] = -1; kb[n] = 0; } };
    const tc = this.centre(t);
    const h = (f, i, k) => { const fl = F[f]; return Math.hypot(fl.x0 + (i + 0.5) * CELL - tc[0], (fl.y - tc[1]) * 3, fl.z0 + (k + 0.5) * CELL - tc[2]); };
    // a binary heap of [priority, cell index]
    const hp = [], hi = [];
    const push = (pr, g) => { hp.push(pr); hi.push(g); let i = hp.length - 1; while (i > 0) { const j = (i - 1) >> 1; if (hp[j] <= hp[i]) break; [hp[i], hp[j]] = [hp[j], hp[i]]; [hi[i], hi[j]] = [hi[j], hi[i]]; i = j; } };
    const pop = () => {
      const top = hi[0], lp = hp.pop(), li = hi.pop();
      if (hp.length) {
        hp[0] = lp; hi[0] = li; let i = 0;
        for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < hp.length && hp[l] < hp[m]) m = l; if (r < hp.length && hp[r] < hp[m]) m = r; if (m === i) break; [hp[i], hp[m]] = [hp[m], hp[i]]; [hi[i], hi[m]] = [hi[m], hi[i]]; i = m; }
      }
      return top;
    };
    const open = (f, i, k) => { const fl = F[f]; return i >= 0 && k >= 0 && i < fl.nx && k < fl.nz && fl.open[i + k * fl.nx] === 1 && !(this.shut.size && this.shut.has(f * 1e6 + k * 1000 + i)); };
    const links = this.linkIndex(), key = (c) => c.f * 1e6 + c.k * 1000 + c.i;
    const s0 = idx(s), goal = idx(t);
    touch(s0); Gb[s0] = 0; push(h(s.f, s.i, s.k), s0);
    let steps = 0;
    const relax = (n, ng, from) => { touch(n); if (Gb[n] <= ng) return false; Gb[n] = ng; cb[n] = from; return true; };
    while (hp.length && steps++ < (this.maxSteps || 60000)) {   // (a big map may raise it)
      const cg = pop();
      if (cg === goal) break;
      touch(cg);
      if (kb[cg]) continue;
      kb[cg] = 1;
      const c = cellOf(cg), fl = F[c.f], gc = Gb[cg];
      for (let di = -1; di <= 1; di++) for (let dk = -1; dk <= 1; dk++) {
        if (!di && !dk) continue;
        const ni = c.i + di, nk = c.k + dk;
        if (!open(c.f, ni, nk)) continue;
        // no cutting corners round a wall's end
        if (di && dk && (!open(c.f, c.i + di, c.k) || !open(c.f, c.i, c.k + dk))) continue;
        const n = off[c.f] + nk * fl.nx + ni, ng = gc + (di && dk ? 1.414 : 1) * CELL;
        if (relax(n, ng, cg)) push(ng + h(c.f, ni, nk), n);
      }
      const out = links.get(key(c));
      if (out) for (const [lc, len, l, back] of out) { if (noRamp && l.ramp) continue; const n = idx(lc), ng = gc + len; if (relax(n, ng, cg)) { push(ng + h(lc.f, lc.i, lc.k), n); if (l.via) { this._viaBy = this._viaBy || new Map(); this._viaBy.set(n, { gen, from: cg, pts: back ? l.via.slice().reverse() : l.via }); } } }
    }
    const cameAt = (n) => (st[n] === gen ? cb[n] : -1);
    if (cameAt(goal) < 0 && s0 !== goal) return null;
    const cells = [t], vias = [null];
    let k = goal;
    while (k !== s0) {
      const v = this._viaBy && this._viaBy.get(k), from = cameAt(k);
      vias[vias.length - 1] = v && v.gen === gen && v.from === from ? v.pts : null;
      k = from; cells.push(cellOf(k)); vias.push(null);
    }
    cells.reverse(); vias.reverse();
    // a link's points between go in before the cell it arrives at
    const pts = [];
    cells.forEach((c, i) => { if (i > 0 && vias[i]) for (const q of vias[i]) pts.push(q.slice()); pts.push(this.centre(c)); });
    return this.smooth(pts, b);
  }

  // straight walks wherever the grid between two points is open (same floor)
  clearLine(p, q) {
    if (Math.abs(p[1] - q[1]) > 0.1) return false;
    const n = Math.ceil(Math.hypot(q[0] - p[0], q[2] - p[2]) / (CELL * 0.5));
    for (let i = 0; i <= n; i++) {
      const c = this.cellAt([p[0] + (q[0] - p[0]) * i / n, p[1] + 0.01, p[2] + (q[2] - p[2]) * i / n]);
      if (!c || !this.isOpen(c)) return false;
    }
    return true;
  }
  smooth(pts, end) {
    if (pts.length < 3) return pts;
    const out = [pts[0]];
    let i = 0;
    while (i < pts.length - 1) {
      let j = pts.length - 1;
      // never past a point at another height (a link's way between floors: the ramp)
      let k = i + 1; while (k < pts.length && Math.abs(pts[k][1] - pts[i][1]) < 0.05) k++;
      const most = Math.max(i + 1, k - 1);
      if (j > most) j = most;
      while (j > i + 1 && !this.clearLine(pts[i], pts[j])) j--;
      out.push(pts[j]); i = j;
    }
    return out;
  }
}
