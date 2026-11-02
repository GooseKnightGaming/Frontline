// FRONTLINE - the level kit (Rhys: "put together ALL the other levels I've asked for,
// so that I can play through the game and give pointers on each individual level").
//
// Every first-draft level is a spec (src/game/levels/*.js): floors drawn as rows of characters,
// one character a square (spec.cell metres, 1.5 by default), north up; who is there and what to
// do. buildKitLevel(spec) turns it into a level the game already knows how to run - walls,
// doors, cover, stairs, ladders, water, lamps, guards, hostages, things to take, terminals to
// hack, zones - with the 'draft' rules (src/sim/play/story.js): a list of objectives, then back to
// where you came in.
//
// The squares (any floor):
//   '#' wall          'W' wall with a window      'D' door        'L' locked door (kick it)
//   'R' reinforced door (charge/breaching shotgun)  'V' vault door (reinforced; a terminal opens it)
//   'Q' a blast door: nothing you carry opens it - its controls (a terminal) do
//   '.' floor         ' ' nothing (outdoors on the ground floor: the ground; above: open air)
//   'O' a hole in this floor (a drop; stairs and ladders make their own)
//   'C' crates        'B' barrels      'T' a table     'K' a counter (chest high, solid)
//   'H' shelving (tall)  'P' a pillar   'M' a machine   'Y' a bed      'Z' a sofa
//   '~' water: a channel, waist deep, below the floor  '=' a low railing (a channel's edge)
//   '+' a headstone   'X' a tomb (chest high)   'g' grass (outdoors)   'h' hedge   't' a tree
//   'f' a fence (outdoors, tall)   'r' rubble    'v' a car    'w' a low wall (outdoors, cover)
//   'u' a duct: crawl height (prone), solid over it
//   ':' an archway: an opening in a wall with no door (the wall over it from door height)
//   'J' solid, built by the spec itself (a plinth, a block): closes a building like a wall, builds nothing
// A spec may add its own: spec.legend[ch] = (kit, x, y, floor) => { ... }.
// Pure enough to be built in node (the tests do): no engine, no browser.

import { World } from '../../sim/world/world.js';
import { SwingDoor, hangDoors } from '../../sim/world/doors.js';
import { Guard, GUARD, TEMPER, ARMS, RANKS } from '../../sim/people/guard.js';
import { Hostage } from '../../sim/people/hostage.js';
import { drawLadder } from '../draw/ladders.js';
import { NavGrid } from '../../sim/world/nav.js';
import { Drivable } from '../../sim/vehicles/drive.js';
import { classById, BATTLE_MIX } from '../../sim/arms/loadout.js';

export const KIT = { cell: 1.5, wallT: 0.22, wallH: 3.2, slab: 0.2, doorH: 2.15, lampEvery: 8, stepRise: 0.19 };
const WALLISH = new Set(['#', 'W', 'D', 'L', 'R', 'V', 'Q', ':']);
const DOORISH = new Set(['D', 'L', 'R', 'V', 'Q', ':']);
// squares that are not floor of this storey (open to what is below, or not built)
const NOFLOOR = new Set([' ', 'O', '~']);

export const cellOf = (rows, x, y) => (rows[y] && rows[y][x]) || ' ';

// the squares that are inside: everything the edge of the map cannot reach without crossing a wall
export function insideOf(rows) {
  const h = rows.length, w = Math.max(0, ...rows.map((r) => r.length));
  const out = new Set(), q = [];
  const key = (x, y) => x + ',' + y;
  for (let x = -1; x <= w; x++) { q.push([x, -1]); q.push([x, h]); }
  for (let y = -1; y <= h; y++) { q.push([-1, y]); q.push([w, y]); }
  while (q.length) {
    const [x, y] = q.pop();
    if (x < -1 || y < -1 || x > w || y > h || out.has(key(x, y))) continue;
    if (WALLISH.has(cellOf(rows, x, y)) || cellOf(rows, x, y) === 'J') continue;      // ('J': solid, built by the spec - a plinth)
    out.add(key(x, y));
    q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  const inside = new Set();
  for (let y = 0; y < h; y++) for (let x = 0; x < rows[y].length; x++) if (!out.has(key(x, y)) && !WALLISH.has(cellOf(rows, x, y))) inside.add(key(x, y));
  return inside;
}
// rooms: the inside squares, in walled-off pieces
export function roomsOf(rows, inside) {
  const seen = new Set(), list = [];
  for (const k of inside) {
    if (seen.has(k)) continue;
    const cells = [], q = [k];
    while (q.length) {
      const c = q.pop();
      if (seen.has(c) || !inside.has(c)) continue;
      seen.add(c); cells.push(c);
      const [x, y] = c.split(',').map(Number);
      q.push((x + 1) + ',' + y, (x - 1) + ',' + y, x + ',' + (y + 1), x + ',' + (y - 1));
    }
    list.push(cells.map((c) => c.split(',').map(Number)));
  }
  return list;
}
// doorways: runs of one or two door squares in a wall; axis 'x' a wall running east-west
export function doorsOf(rows) {
  const used = new Set(), list = [];
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
    const c = cellOf(rows, x, y);
    if (!DOORISH.has(c) || c === ':' || used.has(x + ',' + y)) continue;
    const ew = WALLISH.has(cellOf(rows, x - 1, y)) || WALLISH.has(cellOf(rows, x + 1, y));
    const run = [];
    let cx = x, cy = y;
    while (cellOf(rows, cx, cy) === c && run.length < 2) { run.push([cx, cy]); used.add(cx + ',' + cy); if (ew) cx++; else cy++; }
    list.push({ code: c, axis: ew ? 'x' : 'z', cells: run });
  }
  return list;
}

// a floor drawn by carving: rooms and corridors cut out of solid, a wall a square
// thick put round whatever was cut (8-way), then the 'after' marks (doors in those walls, furniture).
//   { size: [w, h], ops: [['room', x0, y0, x1, y1, ch = '.'], ['cell', x, y, ch], ...], walls: true, after: [...] }
//   'room' fills a rectangle (corners inclusive); 'cell' one square; 'hline'/'vline' a run
export function carve(c) {
  const [w, h] = c.size, g = [];
  for (let y = 0; y < h; y++) g.push(new Array(w).fill(c.base || ' '));
  const put = (x, y, ch) => { if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = ch; };
  const apply = (op) => {
    const [k, ...a] = op;
    if (k === 'room') { const [x0, y0, x1, y1, ch] = a; for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) put(x, y, ch || '.'); }
    else if (k === 'cell') put(a[0], a[1], a[2]);
    else if (k === 'cells') for (const [x, y] of a[0]) put(x, y, a[1]);
    else if (k === 'text') { const [x0, y0, lines] = a; lines.forEach((ln, j) => { for (let i = 0; i < ln.length; i++) if (ln[i] !== '?') put(x0 + i, y0 + j, ln[i]); }); }
  };
  for (const op of c.ops || []) apply(op);
  if (c.walls !== false) {
    const cut = (x, y) => y >= 0 && y < h && x >= 0 && x < w && g[y][x] !== ' ' && g[y][x] !== '#';
    const add = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (g[y][x] !== ' ') continue;
      let n = false;
      for (let dy = -1; dy <= 1 && !n; dy++) for (let dx = -1; dx <= 1 && !n; dx++) if ((dx || dy) && cut(x + dx, y + dy)) n = true;
      if (n) add.push([x, y]);
    }
    for (const [x, y] of add) g[y][x] = '#';
  }
  for (const op of c.after || []) apply(op);
  return g.map((r) => r.join(''));
}

// (Rhys: "wonky buildings") a floor or a ceiling as slabs: in strips along each row, but a wall
// square on the building's edge (a neighbour with no slab) is cut back to the wall's own outer face - a
// slab ran on half a square past every outside wall, a ledge round every storey. has(x, y): slab here;
// edge(x, y): an outside wall square. Returns [x0, x1, z0, z1] boxes (metres).
export function slabBoxes(nx, nz, has, edge, CELL, T) {
  const out = [];
  const mid = (i) => (i + 0.5) * CELL;
  const ext = (x, y) => {
    if (!edge(x, y)) return [x * CELL, (x + 1) * CELL, y * CELL, (y + 1) * CELL];
    return [has(x - 1, y) ? x * CELL : mid(x) - T / 2, has(x + 1, y) ? (x + 1) * CELL : mid(x) + T / 2,
      has(x, y - 1) ? y * CELL : mid(y) - T / 2, has(x, y + 1) ? (y + 1) * CELL : mid(y) + T / 2];
  };
  for (let y = 0; y < nz; y++) {
    let cur = null;
    for (let x = 0; x <= nx; x++) {
      const e = x < nx && has(x, y) ? ext(x, y) : null;
      if (cur && e && Math.abs(e[0] - cur[1]) < 1e-6 && Math.abs(e[2] - cur[2]) < 1e-6 && Math.abs(e[3] - cur[3]) < 1e-6) { cur[1] = e[1]; continue; }
      if (cur) out.push(cur);
      cur = e ? e.slice() : null;
    }
  }
  return out;
}

// (Rhys: "lots of missing walls", "mown grass under buildings") a floor's rows tidied before they
// are built: a wall drawn corner to corner (a curve, a slant) is filled in at each step - else the two
// squares only touch at a corner, the building is open there, and inside is reckoned outdoors (no floor,
// no ceiling, the grass showing); and a one-square slot of nothing between two walls (two rooms carved
// side by side) is filled - else it is a gap to the sky. protect: 'x,y' squares never to be filled.
export function tidyRows(rows, protect, ground, blocked) {
  const g = rows.map((r) => r.split('')), h = g.length;
  const at = (x, y) => (g[y] && g[y][x]) || ' ';
  const wall = (x, y) => WALLISH.has(at(x, y));
  const ok = (x, y, codes) => g[y] && x >= 0 && x < g[y].length && codes.includes(g[y][x]) && !(protect && protect.has(x + ',' + y));
  let n = 0;
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h - 1; y++) for (let x = 0; x < g[y].length; x++) for (const dx of [1, -1]) {
      if (!wall(x, y) || !wall(x + dx, y + 1) || wall(x + dx, y) || wall(x, y + 1)) continue;
      // the step's corner: nothing (outside) first, else a floor square
      const opts = [[x + dx, y], [x, y + 1]];
      const pick = opts.find(([a, b]) => ok(a, b, ' ')) || opts.find(([a, b]) => ok(a, b, '.'));
      if (pick) { g[pick[1]][pick[0]] = '#'; n++; }
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < g[y].length; x++) {
      if (!ok(x, y, ' ')) continue;
      if ((wall(x - 1, y) && wall(x + 1, y)) || (wall(x, y - 1) && wall(x, y + 1))) { g[y][x] = '#'; n++; }
    }
  }
  // (Rhys: "doors into non-existent rooms", "back doors out to the infinite void") a door must
  // open onto somewhere both ways: floor (or, on the ground storey, the outdoors) - never a wall, a hole,
  // or nothing in the air. One that does not is moved along its wall to the nearest place it does; failing
  // that it is walled up.
  // (blocked: squares a door may not open onto - a stair's steps, its hole in the floor above)
  const open = (x, y) => { const c = at(x, y); return !WALLISH.has(c) && c !== 'O' && c !== '~' && c !== 'J' && (ground || c !== ' ') && !(blocked && blocked.has(x + ',' + y)); };
  // (Rhys: "lots of tables/counters/etc impede doors") nothing standing in a doorway's way, either side
  const FURN = 'TKHYZMCBX';
  const clearFront = (x, y) => {
    const ew = wall(x - 1, y) || wall(x + 1, y);
    for (const [a, b] of ew ? [[x, y - 1], [x, y + 1]] : [[x - 1, y], [x + 1, y]]) if (g[b] && FURN.includes(at(a, b))) { g[b][a] = '.'; n++; }
  };
  const sidesOk = (x, y) => {
    const ew = wall(x - 1, y) || wall(x + 1, y);
    return ew ? open(x, y - 1) && open(x, y + 1) && !(wall(x, y - 1) || wall(x, y + 1)) : open(x - 1, y) && open(x + 1, y);
  };
  for (let y = 0; y < h; y++) for (let x = 0; x < g[y].length; x++) {
    const c = at(x, y);
    if (!'DLRVQ'.includes(c) || c === ' ' || (protect && protect.has('door:' + x + ',' + y))) continue;
    if (sidesOk(x, y)) { clearFront(x, y); continue; }
    // part of a double door whose other leaf is fine: leave the pair be
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => at(x + a, y + b) === c && sidesOk(x + a, y + b))) continue;
    const alongX = wall(x - 1, y) || wall(x + 1, y);          // (its own wall: along it first)
    g[y][x] = '#';
    let best = null, bd = 99;
    for (let yy = y - 2; yy <= y + 2; yy++) for (let xx = x - 2; xx <= x + 2; xx++) {
      if (!g[yy] || at(xx, yy) !== '#') continue;
      g[yy][xx] = c;
      const d = Math.abs(xx - x) + Math.abs(yy - y) + ((alongX ? yy !== y : xx !== x) ? 0.5 : 0);
      if (sidesOk(xx, yy) && d < bd) { bd = d; best = [xx, yy]; }
      g[yy][xx] = '#';
    }
    if (best) { g[best[1]][best[0]] = c; clearFront(best[0], best[1]); }
    n++;
  }
  return { rows: g.map((r) => r.join('')), filled: n };
}

// (Rhys: "an aversion to windows?") an outside wall between a room and the outdoors gets a window
// every third square along it (not beside a door, not at a corner); not underground, nor on walls taller
// than a storey (a curtain wall, a sea wall). ground: the ground storey (outdoors is what is not inside).
const INDOORS = new Set(['.', 'T', 'K', 'H', 'Y', 'Z', 'M', 'P', 'C', 'B']);
export function autoWindows(rows, ground, protect) {
  const g = rows.map((r) => r.split('')), ins = insideOf(rows);
  const at = (x, y) => (g[y] && g[y][x]) || ' ';
  const indoor = (x, y) => INDOORS.has(at(x, y)) && ins.has(x + ',' + y);
  const outdoor = (x, y) => !WALLISH.has(at(x, y)) && at(x, y) !== 'J' && (ground ? !ins.has(x + ',' + y) : at(x, y) === ' ');
  const plain = (x, y) => at(x, y) === '#';
  let n = 0;
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[y].length; x++) {
    if (!plain(x, y) || (protect && protect.has(x + ',' + y))) continue;
    const ew = plain(x - 1, y) && plain(x + 1, y) && !WALLISH.has(at(x, y - 1)) && !WALLISH.has(at(x, y + 1));
    const ns = plain(x, y - 1) && plain(x, y + 1) && !WALLISH.has(at(x - 1, y)) && !WALLISH.has(at(x + 1, y));
    if (ew && x % 3 === 1 && ((indoor(x, y - 1) && outdoor(x, y + 1)) || (indoor(x, y + 1) && outdoor(x, y - 1)))) { g[y][x] = 'W'; n++; }
    else if (ns && y % 3 === 1 && ((indoor(x - 1, y) && outdoor(x + 1, y)) || (indoor(x + 1, y) && outdoor(x - 1, y)))) { g[y][x] = 'W'; n++; }
  }
  return { rows: g.map((r) => r.join('')), added: n };
}

export function buildKitLevel(spec) {
  for (const k of Object.keys(spec.floors)) if (spec.floors[k].carve && !spec.floors[k].rows) spec.floors[k].rows = carve(spec.floors[k].carve);
  // tidied once (the spec's rows are kept tidied: building again changes nothing)
  if (!spec._tidied && spec.tidy !== false) {
    spec._tidied = true;
    const prot = {};
    const P = (f, x, y) => { const k = f || '_'; (prot[k] = prot[k] || new Set()).add(x + ',' + y); };
    for (const l of spec.ladders || []) { P(l.to, l.x, l.y); P(l.from, l.x, l.y); if (l.off) P(l.to, l.off[0], l.off[1]); }
    for (const st of spec.stairs || []) { const [dx, dy] = DIRS[st.dir]; for (let i = -1; i <= st.len; i++) for (let j = 0; j < (st.w || 1); j++) { const px = st.x + dx * i + (dx ? 0 : j), py = st.y + dy * i + (dy ? 0 : j); P(st.to, px, py); P(st.from, px, py); } }
    for (const q of [].concat(spec.guards || [], spec.hostages || [], spec.pickups || [], spec.terminals || [])) if (q.at) P(q.at[2], q.at[0], q.at[1]);
    for (const q of [spec.start, spec.extract].filter(Boolean)) P(q.floor, q.x, q.y);
    // (Rhys: "a door that opens onto a drop onto the stairs", "floating table on the stairs") a stair's
    // steps (but its foot) and its hole above are no place for a door to open onto, nor for furniture
    const blk = {}, B = (f, x, y) => { (blk[f] = blk[f] || new Set()).add(x + ',' + y); };
    const fblk = {}, F2 = (f, x, y) => { (fblk[f] = fblk[f] || new Set()).add(x + ',' + y); };
    for (const st of spec.stairs || []) {
      const [dx, dy] = DIRS[st.dir];
      for (let i = 0; i < st.len; i++) for (let j = 0; j < (st.w || 1); j++) { const px = st.x + dx * i + (dx ? 0 : j), py = st.y + dy * i + (dy ? 0 : j); B(st.to, px, py); if (i > 0) B(st.from, px, py); F2(st.from, px, py); F2(st.to, px, py); }
    }
    for (const k of Object.keys(spec.floors)) {
      const Fk0 = spec.floors[k];
      if (fblk[k]) Fk0.rows = Fk0.rows.map((r, y) => r.split('').map((ch, x) => ('TKHYZMCBX'.includes(ch) && fblk[k].has(x + ',' + y) ? '.' : ch)).join(''));
    }
    for (const k of Object.keys(spec.floors)) {
      const set = new Set([...(prot[k] || []), ...(prot._ || [])]);
      const Fk = spec.floors[k], gyK = (spec.outside || {}).y || 0, isGk = Math.abs(Fk.y - gyK) < 0.01;
      Fk.rows = tidyRows(Fk.rows, set, isGk, blk[k]).rows;
      if (spec.windows !== false && Fk.windows !== false && Fk.y > gyK - 0.5 && (Fk.wallH || KIT.wallH) <= 4.6) Fk.rows = autoWindows(Fk.rows, isGk, set).rows;
    }
  }
  const S = Object.assign({}, KIT, spec.kit || {});
  const CELL = spec.cell || S.cell;
  const world = new World();
  const pieces = [], signs = [], lamps = [], water = [], lights = [], crates = [], props = [], vehicles = [];
  const level = { world, pieces, signs, lamps, water, lights, crates, props, vehicles, securityTurrets: [], surfaces: [],
    swingDoors: [], guards: [], zones: {}, rules: 'draft', draft: spec.id, title: spec.title, spec,
    requires: spec.requires || null,
    weather: spec.weather || null,           // (M6.30) 'rain' | 'wind' | 'snow': its sound; rain or snow falling where it is open to the sky         // a Special the mission issues (the hacking kit, for its cameras and turrets)
    atmos: spec.atmos || null, missionTime: spec.time || { date: [1, 8, 2026], hour: 14, minute: 0 }, startGear: spec.startGear || null,
    night: !!spec.night, dark: !!spec.dark, bake: spec.bake !== false, lampCap: spec.lampCap || 6,
    navFloors: [], navLinks: [], navCap: spec.navCap || 120000, testNavCap: spec.testNavCap || 0, chaseMax: spec.chaseMax || 0, objectives: [], pickups: [], terminals: [], hostages: [], reach: [] };
  if (spec.startLoadout) level.startLoadout = spec.startLoadout;
  if (spec.relations) level.relations = spec.relations;
  if (spec.noSunShadow) level.noSunShadow = true;
  const box = (min, max, mat, opts) => {
    opts = opts || {};
    const p = { min, max, mat, uv: opts.uv || 'world', tag: opts.tag, tint: opts.tint };
    if (opts.render !== false) pieces.push(p);
    let s = null;
    if (opts.solid !== false) s = world.addSolid(min, max, opts.tag || mat, { noClimb: opts.noClimb, glass: opts.glass, shootThrough: opts.shootThrough, tough: opts.tough });
    return opts.wantSolid ? s : p;
  };
  const panes = level.panes = [];
  // (M6.33) a pane of glass that breaks: ordinary at the first round through it, toughened at the third, bulletproof
  // never (M6.52: a spec's own glass too - kit.pane - the museum's display cases)
  const paneBox = (min, max, tg) => {
    const pg = box(min, max, tg >= 3 ? 'glassB' : tg >= 1 ? 'glassT' : 'glass', { glass: true, tough: tg, wantSolid: true });
    if (tg < 3 && pg) {
      const name = 'pane' + panes.length, pane = { solid: pg, takes: tg >= 1 ? 3 : 1, hits: 0, hidden: false, pos: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2] };
      pg.pane = pane; panes.push(pane); level[name] = pane; pieces[pieces.length - 1].pane = name;
    }
    return pg;
  };
  const mid = (i) => (i + 0.5) * CELL;
  const floors = spec.floors;
  const keys = Object.keys(floors).sort((a, b) => floors[a].y - floors[b].y);
  const W = Math.max(...keys.map((k) => Math.max(...floors[k].rows.map((r) => r.length)))) * CELL;
  const D = Math.max(...keys.map((k) => floors[k].rows.length)) * CELL;
  level.size = [W, D];
  // the floor meant when none is named: the one at ground level (else the lowest)
  const K0 = keys.find((k) => Math.abs(floors[k].y - ((spec.outside || {}).y || 0)) < 0.01) || keys[0];
  const at = (x, y, f) => [mid(x), floors[f || K0].y, mid(y)];
  // what only a vision shows: kind 'uv' | 'emf' | 'heat' (warm: dimmer) | 'mist' (seen through by thermal)
  level.marks = [];
  const mark = (kind, a, b, opts) => { level.marks.push(Object.assign({ kind, min: [0, 1, 2].map((i) => Math.min(a[i], b[i])), max: [0, 1, 2].map((i) => Math.max(a[i], b[i])) }, opts || {})); };
  const kit = { spec, level, world, box, CELL, mid, at, floors, S, W, D, mark, pane: paneBox };

  // ── the ground: outdoors round it all ──
  const og = spec.outside || {};
  const margin = og.margin === undefined ? 24 : og.margin;
  const gy = og.y || 0;
  // what stands round it, beyond the fence: a city's blocks, or woods
  if (og.backdrop) {
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const ring = (fn) => {
      const e = margin + 2;
      for (let x = -e; x < W + e; ) { const w = 10 + rnd() * 14; fn(x, -e - 14, Math.min(w, W + e - x), 14); fn(x, D + e, Math.min(w, W + e - x), 14); x += w + 2; }
      for (let z = -e; z < D + e; ) { const w = 10 + rnd() * 14; fn(-e - 14, z, 14, Math.min(w, D + e - z)); fn(W + e, z, 14, Math.min(w, D + e - z)); z += w + 2; }
    };
    if (og.backdrop === 'city') ring((x, z, w, d) => box([x, gy, z], [x + w, gy + 8 + rnd() * 26, z + d], 'facade', { tint: [0.7 + rnd() * 0.3, 0.7 + rnd() * 0.25, 0.7 + rnd() * 0.2] }));
    if (og.backdrop === 'woods') ring((x, z, w, d) => { for (let i = 0; i < 3; i++) { const tx = x + rnd() * w, tz = z + rnd() * d, h = 6 + rnd() * 6; box([tx - 0.3, gy, tz - 0.3], [tx + 0.3, gy + h * 0.5, tz + 0.3], 'wood', { tint: [0.4, 0.3, 0.2], solid: false }); box([tx - 2.5, gy + h * 0.35, tz - 2.5], [tx + 2.5, gy + h, tz + 2.5], 'hedge', { solid: false }); } });
    if (og.backdrop === 'hills') ring((x, z, w, d) => box([x, gy - 1, z], [x + w, gy + 3 + rnd() * 10, z + d], 'rock', { solid: false }));
  }
  const groundKey = keys.find((k) => Math.abs(floors[k].y - gy) < 0.01);
  const gHoles = new Set((og.holes || []).map(([x, y]) => x + ',' + y));
  // water on the ground storey (a lake, a pool) is holed through the ground too
  if (groundKey) floors[groundKey].rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '~') gHoles.add(x + ',' + y); });
  if (og.fence !== false && margin > 2) {
    const e = margin - 1;
    for (const [a, b] of [[[-e, -e], [W + e, -e]], [[-e, D + e], [W + e, D + e]], [[-e, -e], [-e, D + e]], [[W + e, -e], [W + e, D + e]]]) {
      box([Math.min(a[0], b[0]) - 0.06, gy, Math.min(a[1], b[1]) - 0.06], [Math.max(a[0], b[0]) + 0.06, gy + (og.fenceH || 3), Math.max(a[1], b[1]) + 0.06], og.fenceMat || 'brick', { noClimb: true });
    }
  }

  // holes made by stairs and ladders in the floor above
  const holes = {};
  const hole = (f, x, y) => { (holes[f] = holes[f] || new Set()).add(x + ',' + y); };
  for (const st of spec.stairs || []) { const [dx, dy] = DIRS[st.dir]; for (let i = 0; i < st.len; i++) for (let j = 0; j < (st.w || 1); j++) { const [px, py] = [st.x + dx * i + (dx ? 0 : j), st.y + dy * i + (dy ? 0 : j)]; hole(st.to, px, py); } }
  for (const l of spec.ladders || []) hole(l.to, l.x, l.y);
  // (Rhys: "the Shaft Ladder doesn't connect anymore") a ladder up through more than one storey's
  // height (the mine's shaft): no ceiling over it on the floor it starts from, nor any floor or ceiling of a
  // storey in between
  const shaft = {};
  const openUp = (f, x, y) => { (shaft[f] = shaft[f] || new Set()).add(x + ',' + y); };
  for (const l of spec.ladders || []) {
    const yA = floors[l.from].y, yB = floors[l.to].y;
    for (const k of Object.keys(floors)) { const yk = floors[k].y; if (yk >= yA - 0.01 && yk < yB - 0.01) openUp(k, l.x, l.y); if (yk > yA + 0.01 && yk < yB - 0.01) hole(k, l.x, l.y); }
  }

  // which squares each storey floors (computed first: a storey's ceiling is wherever none above floors it)
  const floorSet = {};
  for (const key of keys) {
    const F = floors[key], rows = F.rows, set = new Set(), isG = Math.abs(F.y - gy) < 0.01, ins = insideOf(rows);
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
      const code = cellOf(rows, x, y);
      if (holes[key] && holes[key].has(x + ',' + y)) continue;
      if (NOFLOOR.has(code)) continue;
      if (isG && !ins.has(x + ',' + y) && !WALLISH.has(code) && !F.solidFloor) continue;
      set.add(x + ',' + y);
    }
    floorSet[key] = set;
  }
  // the ground, holed where stairs or a hatch go down through it
  if (og.ground !== false) {
    if (groundKey && holes[groundKey]) for (const k of holes[groundKey]) gHoles.add(k);
    const gm = og.mat || 'asphalt', nx = Math.ceil(W / CELL), nz = Math.ceil(D / CELL);
    box([-margin, gy - 1, -margin], [W + margin, gy, 0], gm, { tint: og.tint });
    box([-margin, gy - 1, nz * CELL], [W + margin, gy, D + margin], gm, { tint: og.tint });
    box([-margin, gy - 1, 0], [0, gy, nz * CELL], gm, { tint: og.tint });
    box([nx * CELL, gy - 1, 0], [W + margin, gy, nz * CELL], gm, { tint: og.tint });
    // (Rhys: "mown grass under buildings?") under a building's own floor the ground stops short
    // of it (no grass to show through, or fight with it); outdoors, and under its outside walls, as ever
    const gRows = groundKey ? floors[groundKey].rows : null, gFloor = groundKey ? floorSet[groundKey] : new Set();
    const lowered = (x, y) => gFloor.has(x + ',' + y) && !(gRows && WALLISH.has(cellOf(gRows, x, y)) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => !gFloor.has((x + a) + ',' + (y + b))));
    const gTop = (x, y) => (gHoles.has(x + ',' + y) ? null : lowered(x, y) ? gy - (floors[groundKey].slab || S.slab) - 0.02 : gy);
    for (let y = 0; y < nz; y++) {
      let x = 0;
      while (x < nx) {
        const t = gTop(x, y);
        if (t === null) { x++; continue; }
        let e = x; while (e + 1 < nx && gTop(e + 1, y) === t) e++;
        box([x * CELL, gy - 1, y * CELL], [(e + 1) * CELL, t, (y + 1) * CELL], gm, { tint: og.tint });
        x = e + 1;
      }
    }
  }
  const info = {};
  for (const key of keys) {
    const F = floors[key], rows = F.rows, y0 = F.y, wallH = F.wallH || S.wallH;
    const c = (x, y) => cellOf(rows, x, y);
    const wallMat = F.wall || spec.wall || 'brick', floorMat = F.floor || spec.floorMat || 'concrete', ceilMat = F.ceil || spec.ceil || 'concrete2';
    const T = S.wallT;
    // walls: a post in each wall square, half a wall out to each wall neighbour
    const wallBox = (min, max, code) => {
      if (code === 'W') {
        // a window: wall to 1.0, glass to 2.3, wall over it
        box([min[0], min[1], min[2]], [max[0], y0 + 1.0, max[2]], wallMat, { tint: F.wallTint });
        // (Rhys: Rusk "behind bulletproof glass") ordinary glass: a round goes through it (F.glassTough: tougher)
        const tg = F.glassTough === undefined ? 0 : F.glassTough;
        // (M6.33; the roadmap's "glass that breaks") a pane of its own: ordinary glass shatters at the first round
        // through it, toughened at the third; bulletproof never. A broken pane is a way through, over the sill.
        paneBox([min[0], y0 + 1.0, min[2]], [max[0], y0 + 2.3, max[2]], tg);
        // bulletproof glass sits in a heavy steel frame
        if (tg >= 3) { const along = max[0] - min[0] > max[2] - min[2]; for (const yy of [y0 + 1.0, y0 + 2.22]) box([min[0] - (along ? 0 : 0.03), yy, min[2] - (along ? 0.03 : 0)], [max[0] + (along ? 0 : 0.03), yy + 0.08, max[2] + (along ? 0.03 : 0)], 'metal', { tint: [0.25, 0.27, 0.28], solid: false }); }
        box([min[0], y0 + 2.3, min[2]], [max[0], max[1], max[2]], wallMat, { tint: F.wallTint });
      } else box(min, max, wallMat, { tint: F.wallTint });
    };
    // walls in runs: one box along each straight run of wall squares (and of window squares),
    // reaching half a square into a wall-ish neighbour at either end - not a post and four stubs a square
    const solidW = (x, y) => { const k = c(x, y); return WALLISH.has(k) && !DOORISH.has(k); };
    const top = y0 + wallH;
    const done = new Set();
    for (let y = 0; y < rows.length; y++) {
      let x = 0; const len = rows[y].length;
      while (x < len) {
        if (!solidW(x, y)) { x++; continue; }
        const code = c(x, y) === 'W' ? 'W' : '#';
        let e = x; while (e + 1 < len && solidW(e + 1, y) && (c(e + 1, y) === 'W' ? 'W' : '#') === code) e++;
        const horiz = e > x || WALLISH.has(c(x - 1, y)) || WALLISH.has(c(e + 1, y));
        if (horiz) {
          const a0 = mid(x) - (WALLISH.has(c(x - 1, y)) ? CELL / 2 : T / 2), a1 = mid(e) + (WALLISH.has(c(e + 1, y)) ? CELL / 2 : T / 2);
          wallBox([a0, y0, mid(y) - T / 2], [a1, top, mid(y) + T / 2], code);
          for (let i = x; i <= e; i++) done.add(i + ',' + y);
        }
        x = e + 1;
      }
    }
    for (let x = 0; x < W / CELL + 1; x++) {
      let y = 0;
      while (y < rows.length) {
        if (!solidW(x, y)) { y++; continue; }
        const code = c(x, y) === 'W' ? 'W' : '#';
        let e = y; while (e + 1 < rows.length && solidW(x, e + 1) && (c(x, e + 1) === 'W' ? 'W' : '#') === code) e++;
        const vert = e > y || WALLISH.has(c(x, y - 1)) || WALLISH.has(c(x, e + 1));
        if (vert) {
          // the run's ends: where a horizontal run already fills the square, start at its face
          const up = WALLISH.has(c(x, y - 1)), dn = WALLISH.has(c(x, e + 1));
          const b0 = done.has(x + ',' + y) ? mid(y) + T / 2 : mid(y) - (up ? CELL / 2 : T / 2);
          const b1 = done.has(x + ',' + e) ? mid(e) - T / 2 : mid(e) + (dn ? CELL / 2 : T / 2);
          if (b1 > b0) wallBox([mid(x) - T / 2, y0, b0], [mid(x) + T / 2, top, b1], code);
          // (Rhys: "still lots of open walls") a run's end square that a cross wall already fills,
          // with more wall beyond it (a window, a door, another run): the half square past the cross wall,
          // out to that neighbour - it was left open, a gap the height of the storey at every such corner
          if (up && done.has(x + ',' + y)) wallBox([mid(x) - T / 2, y0, mid(y) - CELL / 2], [mid(x) + T / 2, top, mid(y) - T / 2], code);
          if (dn && done.has(x + ',' + e)) wallBox([mid(x) - T / 2, y0, mid(e) + T / 2], [mid(x) + T / 2, top, mid(e) + CELL / 2], code);
          for (let i = y; i <= e; i++) done.add(x + ',' + i);
        } else if (!done.has(x + ',' + y)) wallBox([mid(x) - T / 2, y0, mid(y) - T / 2], [mid(x) + T / 2, top, mid(y) + T / 2], code);
        y = e + 1;
      }
    }
    // doors: a leaf a square, a double door a pair; over each, the wall to the top
    for (const d of doorsOf(rows)) {
      const a0 = (d.axis === 'x' ? d.cells[0][0] : d.cells[0][1]) * CELL, a1 = a0 + d.cells.length * CELL;
      const atW = d.axis === 'x' ? mid(d.cells[0][1]) : mid(d.cells[0][0]);
      if (d.axis === 'x') box([a0, y0 + S.doorH + 0.05, atW - T / 2], [a1, y0 + wallH, atW + T / 2], wallMat, { tint: F.wallTint });
      else box([atW - T / 2, y0 + S.doorH + 0.05, a0], [atW + T / 2, y0 + wallH, a1], wallMat, { tint: F.wallTint });
      // the jambs: the wall either side of a leaf narrower than the square
      const leafW = Math.min(CELL - 0.3, 1.1), pad = (CELL - leafW) / 2;
      const jamb = (p0, p1) => { if (d.axis === 'x') box([p0, y0, atW - T / 2], [p1, y0 + S.doorH + 0.05, atW + T / 2], wallMat, { tint: F.wallTint }); else box([atW - T / 2, y0, p0], [atW + T / 2, y0 + S.doorH + 0.05, p1], wallMat, { tint: F.wallTint }); };
      const b0 = a0 + (d.cells.length === 1 ? pad : 0.1), b1 = a1 - (d.cells.length === 1 ? pad : 0.1);
      jamb(a0, b0); jamb(b1, a1);
      const skin = (spec.doorSkins || {})[key + ':' + d.cells[0].join(',')];
      const opts = skin ? Object.assign({ mat: F.doorMat || 'door', build: 'domestic', label: 'door' }, skin) : d.code === 'Q' ? { build: 'reinforced', locked: true, mat: 'armour', thick: 0.3, label: 'blast door', vault: true, blastDoor: true } : d.code === 'V' ? { build: 'reinforced', locked: true, mat: 'armour', thick: 0.12, label: 'vault door', vault: true }
        : d.code === 'R' ? { build: 'reinforced', locked: true, mat: 'armour', thick: 0.08, label: 'reinforced door' }
        : d.code === 'L' ? { build: 'sturdy', locked: true, mat: F.doorMat || 'door', label: 'locked door' }
        : { mat: F.doorMat || 'door', build: F.doorBuild || 'domestic', label: 'door' };
      const leaf = (h0, h1, pair, seal) => level.swingDoors.push(new SwingDoor(world, Object.assign({
        plane: d.axis === 'x' ? 'z' : 'x', at: atW, wall: [atW - T / 2, atW + T / 2], from: h0, to: h1, y0, h: S.doorH, pair, seal,
      }, opts)));
      if (d.cells.length === 1) leaf(b0 + 0.02, b1 - 0.02, undefined, [0.02, 0.02, 0.05]);
      else { const pair = key + ':' + d.cells[0].join(','); leaf(b0 + 0.02, (b0 + b1) / 2 - 0.01, pair, [0.02, 0.01, 0.05, 1]); leaf(b1 - 0.02, (b0 + b1) / 2 + 0.01, pair, [0.02, 0.01, 0.05]); }
    }
    // archways (':'): an opening with no door - the wall over it, from door height up
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
      if (c(x, y) !== ':') continue;
      const ew = WALLISH.has(c(x - 1, y)) || WALLISH.has(c(x + 1, y));
      if (ew) box([x * CELL, y0 + S.doorH + 0.05, mid(y) - T / 2], [(x + 1) * CELL, y0 + wallH, mid(y) + T / 2], wallMat, { tint: F.wallTint });
      else box([mid(x) - T / 2, y0 + S.doorH + 0.05, y * CELL], [mid(x) + T / 2, y0 + wallH, (y + 1) * CELL], wallMat, { tint: F.wallTint });
    }
    // the floor (not on the ground storey's outdoor squares: the ground is there): in strips
    const isGround = Math.abs(y0 - gy) < 0.01;
    // underground there is no outdoors: every square that is not wall is inside (its ceiling, its lamps)
    const inside = y0 < gy - 0.5 ? new Set() : insideOf(rows);
    if (y0 < gy - 0.5) for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) { const k2 = c(x, y); if (!WALLISH.has(k2) && !NOFLOOR.has(k2) && k2 !== 'J') inside.add(x + ',' + y); }
    const slab = F.slab || S.slab;
    const hasFloor = (x, y) => floorSet[key].has(x + ',' + y);      // (outdoors on the ground storey: the ground)
    const nxF = Math.max(...rows.map((r) => r.length));
    const outerWall = (has) => (x, y) => WALLISH.has(c(x, y)) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => !has(x + a, y + b));
    for (const [x0, x1, z0, z1] of slabBoxes(nxF, rows.length, hasFloor, outerWall(hasFloor), CELL, T)) box([x0, y0 - slab, z0], [x1, y0 + (isGround ? 0.02 : 0), z1], floorMat, { tint: F.floorTint });
    // the ceiling / roof over this storey wherever the storey above does not floor it (F.roof false:
    // open to the sky; true: roofed all over)
    const aboves = keys.filter((k) => floors[k].y > y0 + 0.5 && floors[k].y <= y0 + wallH + 0.6);
    const ceiled = new Set();          // where a ceiling was built: the only places a lamp may hang
    if (F.roof !== false) {
      const top = y0 + wallH;
      const floored = (xx, yy) => F.roof !== true && aboves.some((k) => floorSet[k].has(xx + ',' + yy));
      const over = keys.filter((k) => floors[k].y > y0 && floors[k].y <= y0 + wallH + 2.5).map((k) => holes[k]).filter(Boolean).concat(Math.abs(y0 + wallH - gy) < 1.5 ? [gHoles] : []);
      const open = (xx, yy) => (F.noRoof || []).some(([a, b, c2, d]) => xx >= a && xx <= c2 && yy >= b && yy <= d);
      const under = (xx, yy) => yy >= 0 && yy < rows.length && xx >= 0 && (inside.has(xx + ',' + yy) || WALLISH.has(c(xx, yy))) && !over.some((hs) => hs.has(xx + ',' + yy)) && !floored(xx, yy) && !open(xx, yy) && !(shaft[key] && shaft[key].has(xx + ',' + yy));
      for (const [x0, x1, z0, z1] of slabBoxes(nxF, rows.length, under, outerWall(under), CELL, T)) box([x0, top, z0], [x1, top + 0.25, z1], ceilMat, { tint: F.ceilTint });
      for (let yy = 0; yy < rows.length; yy++) for (let xx = 0; xx < rows[yy].length; xx++) if (under(xx, yy)) ceiled.add(xx + ',' + yy);
      // under the storey above's floor is a ceiling too (the lounge under the mezzanine was left dark)
      const nearUp = aboves.filter((k) => Math.abs(floors[k].y - top) < 0.6), flUp = (xx, yy) => nearUp.some((k) => floorSet[k].has(xx + ',' + yy));
      for (let yy = 0; yy < rows.length; yy++) for (let xx = 0; xx < rows[yy].length; xx++) if (inside.has(xx + ',' + yy) && flUp(xx, yy) && [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([a, b]) => flUp(xx + a, yy + b))) ceiled.add(xx + ',' + yy);
    }
    // water: a channel below the floor, waist deep, its sides and bed
    const wet = [];
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) if (c(x, y) === '~') wet.push([x, y]);
    if (wet.length) {
      const deep = F.channel || 1.3, bed = y0 - deep, surf = y0 - (F.surf !== undefined ? F.surf : deep * 0.4);
      for (let y = 0; y < rows.length; y++) {
        let x = 0; const len = rows[y].length;
        while (x < len) {
          if (c(x, y) !== '~') { x++; continue; }
          let e = x; while (e + 1 < len && c(e + 1, y) === '~') e++;
          box([x * CELL, bed - 0.3, y * CELL], [(e + 1) * CELL, bed, (y + 1) * CELL], F.bedMat || 'concrete2', { tint: [0.5, 0.48, 0.4] });
          water.push({ x0: x * CELL, x1: (e + 1) * CELL, z0: y * CELL, z1: (y + 1) * CELL, y: surf, flow: F.flow || [1, 0], sewer: !!F.sewer });
          world.addWater([x * CELL, bed, y * CELL], [(e + 1) * CELL, surf, (y + 1) * CELL]);
          x = e + 1;
        }
      }
      // the channel's walls: where a wet square meets a dry one
      for (const [x, y] of wet) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (c(x + dx, y + dy) === '~') continue;
        const x0 = dx > 0 ? (x + 1) * CELL : dx < 0 ? x * CELL - 0.15 : x * CELL, x1 = dx > 0 ? (x + 1) * CELL + 0.15 : dx < 0 ? x * CELL : (x + 1) * CELL;
        const z0 = dy > 0 ? (y + 1) * CELL : dy < 0 ? y * CELL - 0.15 : y * CELL, z1 = dy > 0 ? (y + 1) * CELL + 0.15 : dy < 0 ? y * CELL : (y + 1) * CELL;
        box([x0, bed, z0], [x1, y0 - slab, z1], F.bedMat || 'concrete2', { tint: [0.55, 0.53, 0.46] });
      }
      // (Rhys: "fell in water - no way out?") water too far below its edge to climb out of: an iron
      // ladder up the side every so often
      if (y0 - surf > 0.55 && F.waterLadders !== false) {
        let nL = 0;
        for (const [x, y] of wet) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const n2 = c(x + dx, y + dy);
          if (n2 === '~' || WALLISH.has(n2) || nL >= 40 || (x * 3 + y * 5 + dx * 2 + dy) % 9 !== 0) continue;
          if (!(isGround ? true : floorSet[key].has((x + dx) + ',' + (y + dy)))) continue;
          const wx = mid(x) + dx * (CELL / 2 - 0.03), wz = mid(y) + dy * (CELL / 2 - 0.03), face = [-dx, -dy];
          drawLadder(box, wx, wz, face, bed, y0 + 0.9, 'iron');
          const vol = face[0] ? [[face[0] > 0 ? wx : wx - 0.8, bed, wz - 0.5], [face[0] > 0 ? wx + 0.8 : wx, y0 + 0.3, wz + 0.5]]
            : [[wx - 0.5, bed, face[1] > 0 ? wz : wz - 0.8], [wx + 0.5, y0 + 0.3, face[1] > 0 ? wz + 0.8 : wz]];
          world.addLadder(vol[0], vol[1], face);
          nL++;
        }
      }
    }
    // flat things laid on the ground (spec.decals: { ch: { mat, tint } }; grass 'g' always): a strip a row
    const decals = Object.assign({ g: { mat: 'lawn' } }, spec.decals || {});
    for (let y = 0; y < rows.length; y++) {
      let x = 0; const len = rows[y].length;
      while (x < len) {
        const d = decals[c(x, y)];
        if (!d) { x++; continue; }
        let e = x; while (e + 1 < len && c(e + 1, y) === c(x, y)) e++;
        box([x * CELL, y0, y * CELL], [(e + 1) * CELL, y0 + 0.03, (y + 1) * CELL], d.mat, { solid: false, tint: d.tint });
        x = e + 1;
      }
    }
    // the furniture, cover and outdoor things: one square at a time
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
      const code = c(x, y);
      if (decals[code]) continue;
      const fn = (spec.legend && spec.legend[code]) || FURNISH[code];
      if (fn) fn(kit, x, y, key);
    }
    // lamps: one every S.lampEvery metres or so in each room (F.lamps false: none - torches only)
    const roomList = roomsOf(rows, inside);
    // (Rhys: "lights sitting on steps on the stairs", "floating lights?") a lamp only where there is a
    // ceiling to hang it from - not over a stair (its hole), not under the open sky
    if (F.lamps !== false) for (const all of roomList) {
      const cells = all.filter(([a, b]) => ceiled.has(a + ',' + b));
      if (cells.length < 2) continue;
      const xs = cells.map((p) => p[0]), ys = cells.map((p) => p[1]);
      const [x0, x1, yy0, yy1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      const every = (F.lampEvery || S.lampEvery) / CELL;
      const nx = Math.max(1, Math.round((x1 - x0 + 1) / every)), ny = Math.max(1, Math.round((yy1 - yy0 + 1) / every));
      const spots = [];
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
        const tx = x0 + (i + 0.5) * (x1 - x0 + 1) / nx - 0.5, ty = yy0 + (j + 0.5) * (yy1 - yy0 + 1) / ny - 0.5;
        const best = cells.reduce((b, p) => (Math.hypot(p[0] - tx, p[1] - ty) < Math.hypot(b[0] - tx, b[1] - ty) ? p : b));
        if (!spots.some((s) => s[0] === best[0] && s[1] === best[1])) spots.push(best);
      }
      for (const [lx, ly] of spots) {
        // (under the storey above's floor: its slab's underside, if that is lower than the walls' top)
        const upK = aboves.find((k) => floorSet[k].has(lx + ',' + ly) && floors[k].y - (floors[k].slab || S.slab) < y0 + wallH);
        const yc = upK ? floors[upK].y - (floors[upK].slab || S.slab) : y0 + wallH;
        lights.push({ pos: [mid(lx), yc - 0.4, mid(ly)], range: F.lampRange || 11, intensity: F.lampPower || 0.95, color: F.lampColour || [1, 0.93, 0.8] });
        box([mid(lx) - 0.5, yc - 0.1, mid(ly) - 0.15], [mid(lx) + 0.5, yc, mid(ly) + 0.15], 'lamp', { solid: false });
      }
    }
    // (Rhys: "visible void" - at night the buildings' outsides were black shapes) on a night level, a lamp
    // on the outside of a building's walls every so often, over the ground beside them
    if (isGround && spec.night && spec.wallLamps !== false && !spec.dark) {
      let nW = 0;
      for (let y = 0; y < rows.length && nW < 48; y++) for (let x = 0; x < rows[y].length && nW < 48; x++) {
        if (c(x, y) !== '#' || (x * 5 + y * 3) % 7 !== 0) continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ox = x + dx, oy = y + dy, oc = c(ox, oy);
          if (WALLISH.has(oc) || inside.has(ox + ',' + oy) || NOFLOOR.has(oc) && oc !== ' ' || oc === '~') continue;
          if (!(inside.has((x - dx) + ',' + (y - dy)))) continue;          // a building's outside wall: inside on the far side
          const fx = mid(x) + dx * (T / 2 + 0.12), fz = mid(y) + dy * (T / 2 + 0.12), hy = Math.min(y0 + wallH - 0.4, y0 + 3.0);
          box([fx - (dx ? 0.1 : 0.22), hy - 0.12, fz - (dy ? 0.1 : 0.22)], [fx + (dx ? 0.1 : 0.22), hy + 0.06, fz + (dy ? 0.1 : 0.22)], 'lamp', { solid: false });
          lights.push({ pos: [fx + dx * 0.4, hy - 0.2, fz + dy * 0.4], range: 10, intensity: 0.9, color: [1, 0.85, 0.6], street: true });
          nW++; break;
        }
      }
    }
    // (the ground's: the map and a little round it - out to where you come in; wider, and a guard's search runs out)
    const stc = [mid(spec.start.x), mid(spec.start.y)];
    let bb = [-1, -1, W + 1, D + 1];
    if (!isGround && floorSet[key].size) { const xs = [], ys = []; for (const k2 of floorSet[key]) { const [a, b] = k2.split(',').map(Number); xs.push(a); ys.push(b); } bb = [Math.min(...xs) * CELL - 2, Math.min(...ys) * CELL - 2, (Math.max(...xs) + 1) * CELL + 2, (Math.max(...ys) + 1) * CELL + 2]; }
    level.navFloors.push({ y: y0, bounds: isGround ? [Math.min(-3, stc[0] - 6), Math.min(-3, stc[1] - 6), Math.max(W + 3, stc[0] + 6), Math.max(D + 3, stc[1] + 6)] : bb });
    info[key] = { rows, inside, rooms: roomList };
  }
  level.floorInfo = info;

  // ── stairs: straight flights, a step every S.stepRise, between two floors ──
  for (const st of spec.stairs || []) {
    const [dx, dy] = DIRS[st.dir], w = st.w || 1;
    const yA = floors[st.from].y, yB = floors[st.to].y, run = st.len * CELL, n = Math.max(2, Math.ceil((yB - yA) / S.stepRise));
    const sx = st.x * CELL + (dx < 0 ? CELL : 0), sz = st.y * CELL + (dy < 0 ? CELL : 0);      // the foot's edge
    const across = (dx ? [st.y * CELL, (st.y + w) * CELL] : [st.x * CELL, (st.x + w) * CELL]);
    for (let i = 0; i < n; i++) {
      const a = i / n * run, b = (i + 1) / n * run, top = yA + (i + 1) / n * (yB - yA);
      const p0 = dx ? sx + dx * a : sz + dy * a, p1 = dx ? sx + dx * b : sz + dy * b;
      const lo = Math.min(p0, p1), hi = Math.max(p0, p1);
      if (dx) box([lo, yA, across[0]], [hi, top, across[1]], st.mat || 'concrete2');
      else box([across[0], yA, lo], [across[1], top, hi], st.mat || 'concrete2');
    }
    const cA = (across[0] + across[1]) / 2;
    const foot = dx ? [sx - dx * 0.5, yA, cA] : [cA, yA, sz - dy * 0.5], head = dx ? [sx + dx * (run + 0.5), yB, cA] : [cA, yB, sz + dy * (run + 0.5)];
    // (a ramp across a terrace is walked onto from the side: its own ends for the guards)
    level.navLinks.push({ a: st.navFoot ? [mid(st.navFoot[0]), yA, mid(st.navFoot[1])] : foot, b: st.navHead ? [mid(st.navHead[0]), yB, mid(st.navHead[1])] : head });
  }
  // a stairwell has a light of its own, over its middle (they were the darkest places in a building)
  for (const st of spec.stairs || []) {
    if (st.noLight) continue;
    const [dx, dy] = DIRS[st.dir], w = st.w || 1, Ft = floors[st.to], Ff = floors[st.from];
    if (Ft.y < Ff.y) continue;
    const mx = mid(st.x + dx * (st.len - 1) / 2 + (dx ? 0 : (w - 1) / 2)), mz = mid(st.y + dy * (st.len - 1) / 2 + (dy ? 0 : (w - 1) / 2));
    lights.push({ pos: [mx, Ft.y + Math.min(2.4, (Ft.wallH || S.wallH) - 0.4), mz], range: 9, intensity: 0.7, color: Ft.lampColour || Ff.lampColour || [1, 0.93, 0.8] });
  }
  // (Rhys: "weird gaps behind staircases") a stairwell is railed round on the floor above, but for
  // the way off the top; and where it goes down through the ground, its sides are lined, not the grass
  for (const st of spec.stairs || []) {
    if (st.noRail) continue;
    const [dx, dy] = DIRS[st.dir], w = st.w || 1, Ft = floors[st.to], yT = Ft.y;
    const cellsH = new Set();
    for (let i = 0; i < st.len; i++) for (let j = 0; j < w; j++) cellsH.add((st.x + dx * i + (dx ? 0 : j)) + ',' + (st.y + dy * i + (dy ? 0 : j)));
    const lining = st.to === groundKey && Ft.y > floors[st.from].y;
    for (const k2 of cellsH) {
      const [hx, hy] = k2.split(',').map(Number);
      for (const [ex, ey] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nk = (hx + ex) + ',' + (hy + ey);
        if (cellsH.has(nk)) continue;
        const off = ex === dx && ey === dy;                      // the head of the stair: the way off
        const x0 = ex > 0 ? (hx + 1) * CELL - 0.04 : ex < 0 ? hx * CELL : hx * CELL, x1 = ex > 0 ? (hx + 1) * CELL : ex < 0 ? hx * CELL + 0.04 : (hx + 1) * CELL;
        const z0 = ey > 0 ? (hy + 1) * CELL - 0.04 : ey < 0 ? hy * CELL : hy * CELL, z1 = ey > 0 ? (hy + 1) * CELL : ey < 0 ? hy * CELL + 0.04 : (hy + 1) * CELL;
        if (lining && !off) box([x0, gy - 1.02, z0], [x1, gy - (Ft.slab || S.slab), z1], floors[st.from].wall || spec.wall || 'brick', { tint: floors[st.from].wallTint, solid: false });
        if (off || !floorSet[st.to].has(nk) || WALLISH.has(cellOf(Ft.rows, hx + ex, hy + ey))) continue;
        // (Rhys: black slabs round the stairwells) a railing: a rail along the top, one halfway, a post
        // at each end - and an unseen solid for the lot
        const cxr = (x0 + x1) / 2, czr = (z0 + z1) / 2, alongX = x1 - x0 > z1 - z0;
        const rl = (ya, yb) => box(alongX ? [x0, yT + ya, czr - 0.025] : [cxr - 0.025, yT + ya, z0], alongX ? [x1, yT + yb, czr + 0.025] : [cxr + 0.025, yT + yb, z1], 'metal', { tint: [0.42, 0.43, 0.46], solid: false });
        rl(0.95, 1.0); rl(0.48, 0.52);
        for (const e2 of [0, 1]) { const px = alongX ? (e2 ? x1 - 0.05 : x0 + 0.05) : cxr, pz = alongX ? czr : (e2 ? z1 - 0.05 : z0 + 0.05); box([px - 0.025, yT, pz - 0.025], [px + 0.025, yT + 1.0, pz + 0.025], 'metal', { tint: [0.42, 0.43, 0.46], solid: false }); }
        box([x0, yT, z0], [x1, yT + 1.0, z1], 'metal', { render: false, shootThrough: true });
      }
    }
  }
  // ── ladders: up a wall through a hatch in the floor above ──
  for (const l of spec.ladders || []) {
    const yA = floors[l.from].y, yB = floors[l.to].y;
    const [bx, by] = l.back;            // the wall behind it, as a direction from its square
    const cx = mid(l.x), cz = mid(l.y);
    const wx = cx + bx * (CELL / 2 - S.wallT / 2), wz = cz + by * (CELL / 2 - S.wallT / 2);
    const face = [-bx, -by];
    drawLadder(box, wx, wz, face, yA, yB + 0.9, 'iron');
    const vol = face[0]
      ? [[face[0] > 0 ? wx : wx - 0.8, yA, wz - 0.5], [face[0] > 0 ? wx + 0.8 : wx, yB + 0.3, wz + 0.5]]
      : [[wx - 0.5, yA, face[1] > 0 ? wz : wz - 0.8], [wx + 0.5, yB + 0.3, face[1] > 0 ? wz + 0.8 : wz]];
    world.addLadder(vol[0], vol[1], face);
    const off = l.off || [l.x - bx, l.y - by];
    level.navLinks.push({ a: [(vol[0][0] + vol[1][0]) / 2, yA, (vol[0][2] + vol[1][2]) / 2], b: [mid(off[0]), yB, mid(off[1])], ladder: true });
  }

  // ── where you come in, and leave ──
  const st = spec.start;
  const sp0 = [mid(st.x), floors[st.floor || keys.find((k) => Math.abs(floors[k].y) < 0.01) || keys[0]].y, mid(st.y)];
  // a start in the air (the drop): so high over its square
  if (st.alt) sp0[1] += st.alt;
  world.spawn = { pos: sp0, yaw: st.yaw || 0 };
  // the way out need not be the way in (spec.extract)
  const ex = spec.extract || st;
  const sp = [mid(ex.x), floors[ex.floor || keys.find((k) => Math.abs(floors[k].y) < 0.01) || keys[0]].y, mid(ex.y)];
  level.apcZone = { x0: sp[0] - 2.4, x1: sp[0] + 2.4, z0: sp[2] - 2.4, z1: sp[2] + 2.4, pos: sp.slice() };
  level.extraction = { pos: sp.slice(), radius: 2.4 };
  level.policeZone = { x0: sp[0] - 3, x1: sp[0] + 3, z0: sp[2] - 3, z1: sp[2] + 3 };
  level.safeName = spec.safeName || spec.extractName || 'your way in';
  level.extractName = spec.extractName || 'your way in';
  level.settledHint = 'All done. Back to ' + level.extractName + ' to extract.';
  box([sp[0] - 0.6, sp[1] + 0.01, sp[2] - 0.6], [sp[0] + 0.6, sp[1] + 0.025, sp[2] + 0.6], 'hazard', { solid: false });
  world.addZone([sp[0] - 3, sp[1], sp[2] - 3], [sp[0] + 3, sp[1] + 3, sp[2] + 3], 'way_in', spec.title + ' - ' + level.extractName);
  if (spec.vehicle !== false) vanAt(kit, sp, ex.van || [4, 0]);
  // portals: step into one and you are moved on by its shift, seamlessly where the two places
  // are built alike (the drugged level's endless corridor); `off` names a pickup that, once taken, closes it
  // (Rhys: "I need MORE non-Euclidean geometry!") a portal may also put you somewhere else turned
  // round: to: [x, y, floor] (the square it puts you in), turn (radians, about the up axis); heading [dx, dy]:
  // only when you are going that way; times: it works so many times, then is a plain doorway
  level.portals = (spec.portals || []).map((p) => {
    const F = floors[p.at[4] || K0];
    const box = [[p.at[0] * CELL, F.y - 0.5, p.at[1] * CELL], [(p.at[2] + 1) * CELL, F.y + 3, (p.at[3] + 1) * CELL]];
    const o = { box, shift: p.shift ? [p.shift[0] * CELL, p.shift[2] || 0, p.shift[1] * CELL] : [0, 0, 0], off: p.off || null, on: p.on || null, yaw: p.yaw || 0, times: p.times || 0, used: 0, heading: p.heading || null, said: p.said || null };
    if (p.to) { o.from = [(box[0][0] + box[1][0]) / 2, F.y, (box[0][2] + box[1][2]) / 2]; o.to = [mid(p.to[0]), floors[p.to[2] || K0].y, mid(p.to[1])]; o.turn = p.turn || 0; }
    return o;
  });
  if (spec.offDuty) level.offDuty = true;
  if (spec.drugged) level.drugged = spec.drugged;

  // ── named zones (the HUD's place name) ──
  for (const z of spec.zones || []) {
    const F = floors[z.floor || K0];
    world.addZone([z.at[0] * CELL, F.y - 0.5, z.at[1] * CELL], [(z.at[2] + 1) * CELL, F.y + (F.wallH || S.wallH), (z.at[3] + 1) * CELL], z.id, z.label);
  }

  // ── guards ──
  const fits = (p, r, h) => !world.hit([p[0] - r, p[1] + 0.05, p[2] - r], [p[0] + r, p[1] + h, p[2] + r]);
  const free = (p, r, h) => {
    r = r || GUARD.radius; h = h || GUARD.height;
    if (fits(p, r, h)) return p;
    for (let rr = 0.25; rr <= 2.5; rr += 0.25) for (let a = 0; a < 16; a++) {
      const q = [p[0] + Math.cos(a / 16 * Math.PI * 2) * rr, p[1], p[2] + Math.sin(a / 16 * Math.PI * 2) * rr];
      if (fits(q, r, h)) return q;
    }
    return p;
  };
  kit.free = free;
  const clearDist = (p, yaw) => { const e = [p[0], p[1] + GUARD.eye, p[2]], d = [-Math.sin(yaw), 0, -Math.cos(yaw)]; const h = world.raycast(e, d, 30, (q) => q.glass); return h ? h.t : 30; };
  for (const gd of spec.guards || []) {
    const [gx, gyy, gf] = gd.at;
    const pos = free([mid(gx), floors[gf || K0].y, mid(gyy)]);
    const route = gd.route ? gd.route.map(([rx, ry, rp]) => (rp === undefined ? [mid(rx), mid(ry)] : [mid(rx), mid(ry), rp])) : null;
    let yaw = gd.yaw;
    if (yaw === undefined) {
      if (route && route.length > 1) yaw = Math.atan2(-(route[1][0] - pos[0]), -(route[1][1] - pos[2]));
      else { let bd = -1; yaw = 0; for (let i = 0; i < 8; i++) { const y = i * Math.PI / 4, cd = clearDist(pos, y); if (cd > bd) { bd = cd; yaw = y; } } }
    }
    const g = new Guard(world, { id: gd.id, pos, yaw, route, faction: gd.faction || spec.faction || 'red', rank: RANKS[gd.rank] ? gd.rank : 'guard', arms: ARMS[gd.arms] ? gd.arms : 'carbine', temper: TEMPER[gd.temper] ? gd.temper : 'bold', sees: gd.sees || (spec.dark ? (gd.rank === 'officer' || gd.rank === 'specialist' ? 'nvg' : 'torch') : null), fleeOn: gd.fleeOn, role: gd.role, card: gd.card, shield: gd.shield });
    g.floorKey = gf || K0;
    if (gd.name) g.name = gd.name;
    if (gd.tint) g.tint = gd.tint;          // a man who should stand out: his own colours
    if (gd.objective === false) g.objective = false;
    if (gd.target) g.isTarget = true;
    if (gd.dog) g.hasDog = true;
    // (M6.30) a reserve: not here yet - called in by the radio operator or the siren, from where he is placed
    if (gd.reserve) { g.reserve = true; g.dormant = true; g.target.solid.disabled = true; g.objective = false; }          // (M6.30) a dog handler: his dog at his heel (sim/people/dog.js)
    // (M6.29) a marksman's perches: where he moves to, one after another, once he has given his place away
    if (gd.perches) g.perches = gd.perches.map(([px, py, pf]) => free([mid(px), floors[pf || gf || K0].y, mid(py)]));
    level.guards.push(g);
  }
  // a patrol walks straight from point to point: each leg laid along the guards' own way round (the
  // nav grid), so a route drawn corner to corner follows the corridors rather than the walls
  if (level.guards.some((g) => g.route)) {
    const nav = new NavGrid(world, level.navFloors, level.navLinks); nav.maxSteps = level.navCap;
    for (const g of level.guards) {
      if (!g.route || g.route.length < 2) continue;
      const out = [], y = g.pos[1];
      const pts = g.route;
      for (let i = 0; i < pts.length; i++) {
        const a = i === 0 ? [g.pos[0], y, g.pos[2]] : [pts[i - 1][0], y, pts[i - 1][1]], b = [pts[i][0], y, pts[i][1]];
        const path = nav.find(a, b);
        if (path && path.length > 2 && path.every((q) => Math.abs(q[1] - y) < 0.3)) for (const q of path.slice(1, -1)) out.push([q[0], q[2]]);
        out.push(pts[i].slice());
      }
      // and back round from the last to the first
      const pb = nav.find([pts[pts.length - 1][0], y, pts[pts.length - 1][1]], [pts[0][0], y, pts[0][1]]);
      if (pb && pb.length > 2 && pb.every((q) => Math.abs(q[1] - y) < 0.3)) for (const q of pb.slice(1, -1)) out.push([q[0], q[2]]);
      // the first point of the loop comes round again after the last: start the loop at the original first
      g.route = out; g.leg = g.route.length > 1 ? 1 : 0;
    }
  }
  // ── hostages: bound where they are held; brought out to where you came in ──
  for (const h of spec.hostages || []) {
    const pos = free(at(h.at[0], h.at[1], h.at[2]), 0.3, 1.1);
    const q = new Hostage(world, { id: h.id, label: h.name, pos, yaw: 0 });
    q.name = h.name; q.she = !!h.she; q.floorKey = h.at[2] || K0;
    level.hostages.push(q);
  }
  // ── things to take ──
  for (const p of spec.pickups || []) {
    const base = at(p.at[0], p.at[1], p.at[2]), h = p.h === undefined ? 0.95 : p.h;
    if (p.table !== false) box([base[0] - 0.45, base[1], base[2] - 0.3], [base[0] + 0.45, base[1] + h - 0.02, base[2] + 0.3], p.tableMat || 'wood');
    level.pickups.push({ id: p.id, name: p.name, what: p.what || p.name, pos: [base[0], base[1] + h, base[2]], taken: false, colour: p.colour || [0.85, 0.8, 0.55] });
  }
  // ── terminals: a desk and a screen; holding E at one hacks it (opens the vault doors) ──
  for (const t of spec.terminals || []) {
    const base = at(t.at[0], t.at[1], t.at[2]), f = t.face || [0, 1];
    if (t.look === 'stone') {
      // an old mechanism: a stone drum carved with glyphs, on a plinth
      box([base[0] - 0.55, base[1], base[2] - 0.55], [base[0] + 0.55, base[1] + 0.8, base[2] + 0.55], 'rock', { tint: [0.6, 0.55, 0.45] });
      box([base[0] - 0.45, base[1] + 0.8, base[2] - 0.45], [base[0] + 0.45, base[1] + 1.3, base[2] + 0.45], 'marble', { tint: [0.75, 0.65, 0.4] });
    } else {
      box([base[0] - 0.6, base[1], base[2] - 0.35], [base[0] + 0.6, base[1] + 0.76, base[2] + 0.35], 'metal', { tint: [0.35, 0.37, 0.4] });
      box([base[0] - 0.3 - f[0] * 0.1, base[1] + 0.76, base[2] - 0.05 - f[1] * 0.1], [base[0] + 0.3 - f[0] * 0.1, base[1] + 1.2, base[2] + 0.05 - f[1] * 0.1], 'screen', { solid: false });
    }
    level.terminals.push({ id: t.id, name: t.name || 'the terminal', label: t.name || 'the terminal', said: t.said, pos: [base[0], base[1], base[2]], time: t.time || 6, reveal: t.reveal || 30, done: false, verb: t.verb || null, doing: t.doing || null,
      net: t.net || null });             // a security terminal: hacking it hacks its network's cameras and turrets
  }
  // ── defence systems (sim/world/devices.js): cameras high on a wall, turrets on a pedestal ──
  //   spec.devices: [{ id, kind: 'camera' | 'turret', at: [x, y, floor], face: [dx, dy] (the way it looks), net, owner }]
  //   M6.28: kind 'laser' (at, to: the squares at either end of the beam, across a passage; h: its height),
  //   kind 'lock' (at: the door's square), 'lights' (at: the panel's square, face: away from its
  //   wall, area: [x0, y0, x1, y1] the squares it lights, name: where), 'alarm' (at, face: as a camera's)
  level.devices = [];
  for (const d of spec.devices || []) {
    const F = floors[d.at[2] || K0], base = at(d.at[0], d.at[1], d.at[2]), f = d.face || [0, 1], fl = Math.hypot(f[0], f[1]) || 1;
    const yaw = Math.atan2(-f[0] / fl, -f[1] / fl);
    let pos, extra = {};
    if (d.kind === 'lock') {
      // a maglock (M6.28): on the door in that square (both leaves of a pair) - a security door now,
      // no kick will open it; its keypad on the jamb beside it, seen from both sides
      const c = [mid(d.at[0]), F.y, mid(d.at[1])];
      const leaves = level.swingDoors.filter((q) => Math.abs(q.def.y0 - F.y) < 0.5 && Math.hypot(q.centre[0] - c[0], q.centre[2] - c[2]) < CELL * 0.95);
      for (const q of leaves) Object.assign(q.def, { build: 'reinforced', maglock: true, label: 'security door' }), q.locked = true;
      const q0 = leaves[0];
      if (q0) {
        const along = Math.max(...leaves.map((q) => Math.max(q.def.from, q.def.to))) + 0.13;
        pos = q0.def.plane === 'x' ? [q0.def.at, F.y + 1.3, along] : [along, F.y + 1.3, q0.def.at];
      } else pos = [c[0], F.y + 1.3, c[2]];
      extra = { doors: leaves, plane: q0 ? q0.def.plane : 'z' };
    } else if (d.kind === 'laser') {
      // a tripwire (M6.28): from the far side of one square to the far side of the other, across the passage
      const b0 = at(d.to[0], d.to[1], d.at[2]), dx = Math.sign(b0[0] - base[0]), dz = Math.sign(b0[2] - base[2]);
      const a = [base[0] - dx * CELL / 2, F.y, base[2] - dz * CELL / 2], b = [b0[0] + dx * CELL / 2, F.y, b0[2] + dz * CELL / 2];
      const h = d.h || 0.75;
      pos = [a[0], F.y + h, a[2]];
      extra = { a, b, h, floorY: F.y };
    } else if (d.kind === 'lights' || d.kind === 'alarm') {
      // a breaker panel at chest height, or the alarm's bell high up: on the wall behind the square
      const back = CELL * 0.45, y = d.kind === 'alarm' ? F.y + (F.wallH || S.wallH) - 0.5 : F.y + 1.45;
      pos = [base[0] - f[0] / fl * back, y, base[2] - f[1] / fl * back];
      if (d.kind === 'lights') {
        const a = d.area || [d.at[0], d.at[1], d.at[0], d.at[1]];
        extra.area = [[a[0] * CELL, F.y - 0.5, a[1] * CELL], [(a[2] + 1) * CELL, F.y + (F.wallH || S.wallH), (a[3] + 1) * CELL]];
      }
    } else if (d.kind === 'camera') {
      // on the wall behind it, just under the ceiling
      const back = CELL * 0.42, y = F.y + (F.wallH || S.wallH) - 0.35;
      pos = [base[0] - f[0] / fl * back, y, base[2] - f[1] / fl * back];
      if (!d.hidden) box([pos[0] - 0.06, y + 0.05, pos[2] - 0.06], [pos[0] + 0.06, y + 0.35, pos[2] + 0.06], 'metal', { solid: false });   // its bracket (a pinhole camera has none)
    } else {
      pos = [base[0], F.y + 1.35, base[2]];
      box([base[0] - 0.28, F.y, base[2] - 0.28], [base[0] + 0.28, F.y + 1.05, base[2] + 0.28], 'metal', { tint: [0.4, 0.42, 0.45] });   // its pedestal
    }
    level.devices.push(Object.assign({ id: d.id, kind: d.kind, pos, yaw, net: d.net || null, owner: d.owner || spec.faction || 'red', name: d.name || null, hidden: !!d.hidden }, extra));
  }
  // ── places to reach ──
  for (const r of spec.reach || []) {
    const F = floors[r.floor || K0];
    level.reach.push({ id: r.id, name: r.name, box: [[r.at[0] * CELL, F.y - 0.5, r.at[1] * CELL], [(r.at[2] + 1) * CELL, F.y + 2.5, (r.at[3] + 1) * CELL]], done: false });
  }
  // radiation: sources (spec.radiation: [{ at: [x, y], r: squares, rate: hp a second at the heart of it,
  // floor }]) - the dose falls off with the square of the distance out to r
  level.radiation = (spec.radiation || []).map((q) => ({ pos: [mid(q.at[0]), floors[q.floor || K0].y, mid(q.at[1])], r: q.r * CELL, rate: q.rate, name: q.name || null }));
  level.objectives = (spec.objectives || []).map((o) => Object.assign({ optional: false }, o));
  // ── a battle: two sides, each a pool of guards (its field) standing for its whole reserve ──
  //   spec.battle: { you: side, timer, teams: { side: { name, faction, reserve, field, arms: [..],
  //     spawns: [[x, y, floor]], lanes: [[[x, y, floor], ...], ...] } } } - a lane: where his side pushes,
  //     point by point (the last, the other side's end)
  if (spec.battle) {
    const Bs = spec.battle, sides = Object.keys(Bs.teams);
    const P = (q) => [mid(q[0]), floors[q[2] || K0].y, mid(q[1])];
    level.rules = 'battle';
    level.battle = { def: { you: Bs.you, timer: Bs.timer, teams: {} }, pools: {}, spawns: {}, lanes: {}, spots: {} };
    for (const side of sides) {
      const t = Bs.teams[side], ally = side === Bs.you;
      level.battle.def.teams[side] = { name: t.name, short: t.short, faction: t.faction, reserve: t.reserve };
      level.battle.spawns[side] = t.spawns.map(P);
      level.battle.lanes[side] = t.lanes.map((ln) => ln.map(P));
      const n = (t.field || 10) - (ally ? 1 : 0), pool = [];      // (you are one of your side's)
      for (let i = 0; i < n; i++) {
        const sp = level.battle.spawns[side][i % t.spawns.length];
        const pos = free([sp[0] + ((i * 0.7) % 2) - 1, sp[1], sp[2] + ((i * 1.3) % 2) - 1]);
        // (Rhys: "comrades and enemies should also have classes, and should have the default
        // loadouts") each man a class, in the side's mix (BATTLE_MIX unless the level says), armed as it is
        const mix = t.classes || BATTLE_MIX, cls = classById(mix[i % mix.length]);
        const arms = cls ? cls.arms : (t.arms || ['carbine'])[i % (t.arms || ['carbine']).length];
        const g = new Guard(world, { id: 'b_' + side + '_' + i, pos, yaw: t.yaw || 0, faction: t.faction, rank: i === 0 ? 'sergeant' : 'guard', arms, temper: i % 4 === 3 ? 'steady' : 'bold' });
        if (cls) { g.cls = cls.id; g.clsName = cls.name; }
        g.floorKey = t.spawns[i % t.spawns.length][2] || K0;
        g.battleSide = side;
        if (ally) { g.side = 'ally'; g.title = t.name; g.objective = false; }
        level.guards.push(g); pool.push(g);
      }
      level.battle.pools[side] = pool;
      // where the next men come on: free spots round each of the side's spawns
      level.battle.spots[side] = level.battle.spawns[side].flatMap((sp) => [[0, 0], [1.2, 0], [-1.2, 0], [0, 1.2], [0, -1.2], [1.2, 1.2]].map(([a, b]) => free([sp[0] + a, sp[1], sp[2] + b])));
    }
    if (!spec.relations) {
      const fa = Bs.teams[Bs.you].faction, fe = Bs.teams[sides.find((x) => x !== Bs.you)].faction;
      level.relations = { [fe]: { you: true, [fa]: true }, [fa]: { you: false, [fe]: true } };
    }
  }
  // water that runs: whoever swims in it is carried (spec.currents: [{ at: [x0, y0, x1, y1, floor], v: [vx, vz] }])
  level.currents = (spec.currents || []).map((c) => { const F = floors[c.at[4] || K0]; return { box: [[c.at[0] * CELL, F.y - 6, c.at[1] * CELL], [(c.at[2] + 1) * CELL, F.y + 0.5, (c.at[3] + 1) * CELL]], v: c.v }; });

  // things to drive: spec.vehicles: [{ id, kind: 'car' | 'jeep' | 'boat', at: [x, y, floor], yaw, model,
  // paint, hp, path: [[x, y], ...] (an AI drives it there), speed, crew: [{ id, at: [across, along] }] (guards
  // riding it - the first drives), goal: 'escape' (gets away if it reaches the end) }]
  level.drivables = (spec.vehicles || []).map((vd) => {
    // one on a way with no place given starts at its first point, and with no heading given faces
    // along its way
    const at = vd.at || (vd.path ? [vd.path[0][0], vd.path[0][1]] : [0, 0]);
    const F = floors[at[2] || K0];
    let yaw = vd.yaw;
    if (yaw === undefined && vd.path) { const q = vd.path.find((p) => Math.hypot(p[0] - at[0], p[1] - at[1]) > 0.5) || vd.path[0]; yaw = Math.atan2(-(q[0] - at[0]), -(q[1] - at[1])); }
    const v = new Drivable(world, { id: vd.id, kind: vd.kind, pos: [mid(at[0]), F.y, mid(at[1])], yaw: yaw || 0, model: vd.model, paint: vd.paint, hp: vd.hp, tune: vd.tune });      // (M6.70) tune: a vehicle's own handling (a nimble launch)
    v.path = vd.path ? vd.path.map(([x, y]) => [mid(x), mid(y)]) : null;
    v.pathSpeed = vd.speed || 14; v.pathLoop = !!vd.loop; v.traffic = !!vd.traffic; v.wait = vd.wait || 0; v.holdOn = vd.holdOn || null; v.crew = (vd.crew || []).map((c) => ({ id: c.id, at: c.at.slice() })); v.goal = vd.goal || null; v.name = vd.name || null;
    // (boats on their own ways do not foul each other - they pass, as if they had seen each other coming)
    if (v.path) v.ignore = (q) => !!(q.vehicle && q.vehicle.path);
    return v;
  });
  // (crews aboard from the start: where they ride, their bodies not in the way of their own boat)
  for (const v of level.drivables) for (const c of v.crew) {
    const g = level.guards.find((q) => q.id === c.id);
    if (!g) continue;
    const cc = Math.cos(v.yaw), sn = Math.sin(v.yaw);
    g.pos[0] = v.pos[0] + c.at[0] * cc + c.at[1] * sn; g.pos[1] = v.pos[1] + 0.25; g.pos[2] = v.pos[2] - c.at[0] * sn + c.at[1] * cc;
    g.yaw = v.yaw; g.home = { pos: g.pos.slice(), yaw: g.yaw }; g.aboard = v;
    if (g.target) g.target.solid.rider = v;
    if (g.moveBody) g.moveBody();
  }
  // (M6.54) people who are not guards (spec.civilians: [{ id, at: [x, y, floor], yaw, title, tint, says: [...] }]):
  // standing at their work, solid, to talk to (a line of their own) - or to knock down, which they will not forget
  level.npcs = level.npcs || [];
  for (const c of spec.civilians || []) {
    const F = floors[c.at[2] || K0];
    level.npcs.push({ id: c.id, kind: 'civilian', title: c.title || 'A civilian', pos: [mid(c.at[0]), F.y, mid(c.at[1])], yaw: c.yaw || 0, tint: c.tint || [1.25, 1.25, 1.25], says: c.says || null, sitting: !!c.sitting });
  }
  // (M6.58) papers to read (spec.intel: [{ id, at: [x, y, floor], kind, title, text: [...], h }]): lore, not needed to
  // finish - E reads one, the debrief counts them (main.js's intel, as at the Riverside Hotel). On a table (h 0.78)
  // unless h says otherwise; a sheet of paper drawn where it lies.
  if (spec.intel && spec.intel.length) {
    level.intel = level.intel || [];
    for (const it of spec.intel) {
      const F = floors[it.at[2] || K0], h = it.h === undefined ? 0.78 : it.h, x = mid(it.at[0]), z = mid(it.at[1]);
      box([x - 0.15, F.y + h, z - 0.11], [x + 0.15, F.y + h + 0.02, z + 0.11], 'paper', { solid: false });
      level.intel.push({ id: it.id, kind: it.kind || 'Paper', title: it.title, text: it.text, pos: [x, F.y + h, z], floorY: F.y, found: false, room: it.room || it.title });
    }
  }
  // (M6.49) the floor plans, for the mission map: each floor's rows as built
  level.plan = { cell: CELL, floors: Object.keys(floors).map((k) => ({ key: k, y: floors[k].y, rows: floors[k].rows.slice() })) };
  if (spec.extra) spec.extra(kit);
  hangDoors(world, level.swingDoors);
  // what to bake: the map, and a little round it
  level.bakeRegion = [-4, -4, W + 4, D + 4];
  return level;
}

export const DIRS = { E: [1, 0], W: [-1, 0], S: [0, 1], N: [0, -1] };

// the Ghost van, parked by where you come in (the way out)
function vanAt(kit, sp, off) {
  // (Rhys: "did the van crash through a wall?") parked where it fits: the offset asked for if the
  // van is clear of everything there, else the nearest spot round the way in that is - along or across
  const { box, world } = kit, y = sp[1];
  const fits = (x, z, ax) => { const hx = ax ? 2.5 : 1.1, hz = ax ? 1.1 : 2.5; return !world.hit([x - hx, y + 0.3, z - hz], [x + hx, y + 2.4, z + hz]); };
  const tries = [[off[0], off[1], false]];
  for (const r of [4, 5, 6, 7, 8]) for (let a = 0; a < 16; a++) { const t = a / 16 * Math.PI * 2; tries.push([Math.cos(t) * r, Math.sin(t) * r, false], [Math.cos(t) * r, Math.sin(t) * r, true]); }
  const [ox, oz, ax] = tries.find(([a, b, c]) => fits(sp[0] + a, sp[2] + b, c)) || tries[0];
  drawVan(box, sp[0] + ox, y, sp[2] + oz, ax, [0.18, 0.2, 0.22]);
}
// (Rhys: "all vehicles need a proper going over") a van: a box body with a sloped bonnet, a windscreen
// and side windows, bumpers, lights, four wheels under arches. ax: lying along x (else along z); front to +.
export function drawVan(box, x, y, z, ax, col) {
  const P = (a, b, c) => (ax ? [x + c, y + b, z + a] : [x + a, y + b, z + c]);       // (across, up, along)
  const B = (a0, b0, c0, a1, b1, c1, mat, o) => { const p = P(a0, b0, c0), q = P(a1, b1, c1); box([Math.min(p[0], q[0]), p[1], Math.min(p[2], q[2])], [Math.max(p[0], q[0]), q[1], Math.max(p[2], q[2])], mat, o); };
  const dark = { tint: [0.06, 0.06, 0.07], solid: false };
  B(-1.0, 0.45, -2.5, 1.0, 2.35, 1.4, 'paint', { tint: col });                             // the body
  B(-1.0, 0.45, 1.4, 1.0, 1.25, 2.45, 'paint', { tint: col });                             // the bonnet
  B(-0.98, 1.25, 1.4, 0.98, 2.15, 1.75, 'paint', { tint: col.map((v) => v * 0.9) });       // the cab's front
  B(-0.9, 1.35, 1.74, 0.9, 2.05, 1.78, 'glass', { solid: false });                          // the windscreen
  for (const s2 of [-1, 1]) B(s2 * 1.0, 1.4, 0.4, s2 * 1.02, 2.0, 1.6, 'glass', { solid: false });   // the cab's side windows
  B(-1.05, 0.35, 2.45, 1.05, 0.7, 2.6, 'paint', dark); B(-1.05, 0.35, -2.65, 1.05, 0.7, -2.5, 'paint', dark);   // bumpers
  for (const s2 of [-0.7, 0.7]) { B(s2 - 0.18, 0.95, 2.45, s2 + 0.18, 1.1, 2.47, 'lamp', { solid: false }); B(s2 - 0.15, 0.9, -2.52, s2 + 0.15, 1.15, -2.5, 'paint', { tint: [0.8, 0.08, 0.05], solid: false }); }
  B(-0.25, 1.6, -2.52, 0.25, 2.1, -2.5, 'paint', { tint: col.map((v) => v * 0.7), solid: false });       // the back doors' join
  for (const [s2, c2] of [[-1, -1.6], [1, -1.6], [-1, 1.65], [1, 1.65]]) B(s2 * 0.82, 0, c2 - 0.38, s2 * 1.04, 0.76, c2 + 0.38, 'tyre', { solid: false });
  B(-0.9, 0.1, -2.4, 0.9, 0.45, 2.3, 'paint', dark);                                        // the underside
}

// the furniture, by square
const FURNISH = {
  C(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), v = (x * 7 + y * 13) % 3; if (v === 0) k.box([cx - 0.6, cy, cz - 0.6], [cx + 0.6, cy + 1.15, cz + 0.6], 'cargo'); else if (v === 1) { k.box([cx - 0.6, cy, cz - 0.55], [cx + 0.5, cy + 0.9, cz + 0.55], 'cargo'); k.box([cx - 0.4, cy + 0.9, cz - 0.4], [cx + 0.3, cy + 1.6, cz + 0.3], 'cargo'); } else k.box([cx - 0.55, cy, cz - 0.65], [cx + 0.55, cy + 1.2, cz + 0.65], 'cargo'); },
  B(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 0.55, cy, cz - 0.3], [cx + 0.05, cy + 0.95, cz + 0.3], 'barrel'); k.box([cx + 0.05, cy, cz - 0.05], [cx + 0.6, cy + 0.95, cz + 0.55], 'barrel'); },
  T(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 0.6, cy + 0.72, cz - 0.45], [cx + 0.6, cy + 0.78, cz + 0.45], 'wood'); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.box([cx + a * 0.52 - 0.04, cy, cz + b * 0.38 - 0.04], [cx + a * 0.52 + 0.04, cy + 0.72, cz + b * 0.38 + 0.04], 'wood', { solid: false }); k.box([cx - 0.55, cy, cz - 0.4], [cx + 0.55, cy + 0.72, cz + 0.4], 'wood', { render: false }); },
  K(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h, cy, cz - h + 0.15], [cx + h, cy + 1.05, cz + h - 0.15], 'wood'); k.box([cx - h, cy + 1.05, cz - h + 0.1], [cx + h, cy + 1.1, cz + h - 0.1], 'marble', { solid: false }); },
  // (M6.30) shelving: what is on each shelf in two lots, each its own colour and height (books, boxes, files)
  H(k, x, y, f) {
    const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2;
    k.box([cx - h + 0.05, cy, cz - 0.3], [cx + h - 0.05, cy + 2.1, cz + 0.3], 'metal', { tint: [0.45, 0.47, 0.5] });
    const TINTS = [[0.55, 0.18, 0.15], [0.18, 0.3, 0.5], [0.6, 0.5, 0.3], [0.2, 0.4, 0.25], [0.75, 0.72, 0.65], [0.35, 0.25, 0.4]];
    [0.5, 1.1, 1.7].forEach((yy, i) => {
      const s0 = (x * 7 + y * 11 + i * 5) % TINTS.length, s1 = (s0 + 2 + i) % TINTS.length, split = -0.1 + ((x + y + i) % 3) * 0.12;
      k.box([cx - h + 0.15, cy + yy, cz - 0.25], [cx + split, cy + yy + 0.26 + ((x + i) % 2) * 0.05, cz + 0.25], 'parcel', { solid: false, tint: TINTS[s0] });
      k.box([cx + split + 0.04, cy + yy, cz - 0.25], [cx + h - 0.15, cy + yy + 0.22 + ((y + i) % 2) * 0.08, cz + 0.25], 'parcel', { solid: false, tint: TINTS[s1] });
    });
  },
  P(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), F = k.floors[f]; k.box([cx - 0.3, cy, cz - 0.3], [cx + 0.3, cy + (F.wallH || k.S.wallH), cz + 0.3], F.pillar || 'concrete2'); },
  // (M6.30) a machine: its panel - a screen and a lamp - on the face away from the nearer wall, a vent strip
  M(k, x, y, f) {
    const [cx, cy, cz] = k.at(x, y, f);
    k.box([cx - 0.65, cy, cz - 0.65], [cx + 0.65, cy + 1.6, cz + 0.65], 'metal'); k.box([cx - 0.2, cy + 1.6, cz - 0.2], [cx + 0.2, cy + 2.2, cz + 0.2], 'metal', { tint: [0.5, 0.5, 0.5] });
    const sz = (y % 2) ? 1 : -1;
    k.box([cx - 0.4, cy + 0.95, cz + sz * 0.65 - 0.01], [cx + 0.15, cy + 1.35, cz + sz * 0.65 + 0.01], 'screen', { solid: false });
    k.box([cx + 0.28, cy + 1.2, cz + sz * 0.65 - 0.015], [cx + 0.38, cy + 1.3, cz + sz * 0.65 + 0.015], 'lamp', { solid: false });
    k.box([cx - 0.5, cy + 0.2, cz + sz * 0.65 - 0.01], [cx + 0.5, cy + 0.35, cz + sz * 0.65 + 0.01], 'metal', { solid: false, tint: [0.12, 0.12, 0.13] });
  },
  // (M6.30) a bed: the frame, the mattress, a pillow at the head, the blanket over the foot
  Y(k, x, y, f) {
    const [cx, cy, cz] = k.at(x, y, f), col = [[0.25, 0.32, 0.5], [0.5, 0.22, 0.2], [0.3, 0.42, 0.3], [0.55, 0.5, 0.42]][(x + y) % 4];
    k.box([cx - 0.5, cy, cz - 0.7], [cx + 0.5, cy + 0.5, cz + 0.7], 'fabric', { tint: [0.8, 0.8, 0.85] }); k.box([cx - 0.5, cy, cz - 0.75], [cx + 0.5, cy + 0.95, cz - 0.65], 'wood');
    k.box([cx - 0.38, cy + 0.5, cz - 0.62], [cx + 0.38, cy + 0.62, cz - 0.3], 'fabric', { solid: false, tint: [0.95, 0.95, 0.97] });
    k.box([cx - 0.52, cy + 0.42, cz - 0.15], [cx + 0.52, cy + 0.56, cz + 0.72], 'fabric', { solid: false, tint: col });
  },
  // (M6.30) a sofa: seat, back, and an arm at each end
  Z(k, x, y, f) {
    const [cx, cy, cz] = k.at(x, y, f);
    k.box([cx - 0.65, cy, cz - 0.4], [cx + 0.65, cy + 0.45, cz + 0.4], 'fabric', { tint: [0.55, 0.35, 0.3] }); k.box([cx - 0.65, cy + 0.45, cz + 0.2], [cx + 0.65, cy + 0.9, cz + 0.4], 'fabric', { tint: [0.5, 0.32, 0.28] });
    for (const sx of [-1, 1]) k.box([cx + sx * 0.65 - 0.1, cy, cz - 0.4], [cx + sx * 0.65 + 0.1, cy + 0.62, cz + 0.4], 'fabric', { solid: false, tint: [0.47, 0.3, 0.26] });
  },
  '='(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h, cy, cz - 0.04], [cx + h, cy + 1.0, cz + 0.04], 'metal', { tint: [0.5, 0.45, 0.2], shootThrough: true }); },
  '+'(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), s = ((x * 31 + y * 17) % 5) / 10; k.box([cx - 0.35, cy, cz - 0.08], [cx + 0.35, cy + 0.8 + s, cz + 0.08], 'concrete2', { tint: [0.75, 0.75, 0.72] }); k.box([cx - 0.35, cy, cz + 0.08], [cx + 0.35, cy + 0.08, cz + 1.0], 'lawn', { solid: false, tint: [0.6, 0.75, 0.5] }); },
  X(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 0.5, cy, cz - 0.6], [cx + 0.5, cy + 1.05, cz + 0.6], 'marble', { tint: [0.7, 0.7, 0.68] }); k.box([cx - 0.55, cy + 1.05, cz - 0.65], [cx + 0.55, cy + 1.15, cz + 0.65], 'marble', { tint: [0.6, 0.6, 0.58] }); },
  g(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h, cy, cz - h], [cx + h, cy + 0.03, cz + h], 'lawn', { solid: false }); },
  h(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h, cy, cz - h], [cx + h, cy + 1.6, cz + h], 'hedge'); },
  t(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 0.2, cy, cz - 0.2], [cx + 0.2, cy + 3.2, cz + 0.2], 'wood', { tint: [0.45, 0.32, 0.22] }); k.box([cx - 1.4, cy + 2.6, cz - 1.4], [cx + 1.4, cy + 5.2, cz + 1.4], 'hedge', { solid: false }); },
  // iron railings: bars, a rail along the top (one solid, unseen, for the lot)
  f(k, x, y, f) {
    const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2, rows = k.floors[f].rows;
    const ns = ['f'].includes(cellOf(rows, x, y - 1)) || ['f'].includes(cellOf(rows, x, y + 1)), ew = ['f'].includes(cellOf(rows, x - 1, y)) || ['f'].includes(cellOf(rows, x + 1, y));
    const alongZ = ns && !ew;
    const bar = (a, b) => (alongZ ? k.box([cx - 0.02, cy, cz + a], [cx + 0.02, cy + 2.2, cz + b], 'metal', { solid: false, tint: [0.12, 0.12, 0.13] }) : k.box([cx + a, cy, cz - 0.02], [cx + b, cy + 2.2, cz + 0.02], 'metal', { solid: false, tint: [0.12, 0.12, 0.13] }));
    for (let i = 0; i < 4; i++) { const a = -h + 0.15 + i * 0.36; bar(a, a + 0.04); }
    if (alongZ) { k.box([cx - 0.03, cy + 2.05, cz - h], [cx + 0.03, cy + 2.12, cz + h], 'metal', { solid: false, tint: [0.12, 0.12, 0.13] }); k.box([cx - 0.04, cy, cz - h], [cx + 0.04, cy + 2.4, cz + h], 'metal', { render: false, noClimb: true }); }
    else { k.box([cx - h, cy + 2.05, cz - 0.03], [cx + h, cy + 2.12, cz + 0.03], 'metal', { solid: false, tint: [0.12, 0.12, 0.13] }); k.box([cx - h, cy, cz - 0.04], [cx + h, cy + 2.4, cz + 0.04], 'metal', { render: false, noClimb: true }); }
  },
  // a street lamp: a post, its arm, and a light
  l(k, x, y, f) {
    const [cx, cy, cz] = k.at(x, y, f);
    k.box([cx - 0.08, cy, cz - 0.08], [cx + 0.08, cy + 4.2, cz + 0.08], 'metal', { tint: [0.2, 0.21, 0.22] });
    k.box([cx - 0.25, cy + 4.1, cz - 0.25], [cx + 0.25, cy + 4.3, cz + 0.25], 'lamp', { solid: false });
    k.level.lights.push({ pos: [cx, cy + 4.0, cz], range: 16, intensity: 1.5, color: [1, 0.8, 0.55], street: true });
  },
  r(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), v = (x * 5 + y * 3) % 3; k.box([cx - 0.6, cy, cz - 0.5], [cx + 0.4 + v * 0.1, cy + 0.5 + v * 0.25, cz + 0.6], 'concrete2', { tint: [0.6, 0.58, 0.55] }); k.box([cx - 0.2, cy + 0.4, cz - 0.3], [cx + 0.5, cy + 0.9 + v * 0.2, cz + 0.2], 'brick', { solid: false }); },
  // a parked car: body, cabin with its glass, wheels, lights - lying along the street (x) unless a
  // neighbour square says otherwise
  v(k, x, y, f) {
    const [cx, cy, cz] = k.at(x, y, f), col = [[0.5, 0.1, 0.1], [0.15, 0.2, 0.45], [0.6, 0.6, 0.62], [0.12, 0.12, 0.12], [0.2, 0.35, 0.22]][(x * 3 + y) % 5];
    const ax = (x * 7 + y) % 2 === 0, P = (a, b, c) => (ax ? [cx + c, cy + b, cz + a] : [cx + a, cy + b, cz + c]);
    const B = (a0, b0, c0, a1, b1, c1, mat, o) => { const p = P(a0, b0, c0), q = P(a1, b1, c1); k.box([Math.min(p[0], q[0]), p[1], Math.min(p[2], q[2])], [Math.max(p[0], q[0]), q[1], Math.max(p[2], q[2])], mat, o); };
    B(-0.85, 0.3, -2.05, 0.85, 0.95, 2.05, 'paint', { tint: col });
    B(-0.78, 0.95, -1.1, 0.78, 1.45, 0.75, 'paint', { tint: col.map((v) => v * 0.85) });
    B(-0.72, 1.0, 0.74, 0.72, 1.4, 0.78, 'glass', { solid: false }); B(-0.72, 1.0, -1.14, 0.72, 1.4, -1.1, 'glass', { solid: false });
    for (const s2 of [-1, 1]) B(s2 * 0.78, 1.02, -1.0, s2 * 0.8, 1.38, 0.65, 'glass', { solid: false });
    for (const [s2, c2] of [[-1, -1.3], [1, -1.3], [-1, 1.3], [1, 1.3]]) B(s2 * 0.7, 0, c2 - 0.33, s2 * 0.88, 0.62, c2 + 0.33, 'tyre', { solid: false });
    for (const s2 of [-0.55, 0.55]) { B(s2 - 0.16, 0.65, 2.04, s2 + 0.16, 0.8, 2.07, 'lamp', { solid: false }); B(s2 - 0.14, 0.65, -2.07, s2 + 0.14, 0.8, -2.04, 'paint', { tint: [0.8, 0.08, 0.05], solid: false }); }
  },
  // a duct: crawl-height, the rest of the square solid over it (go prone: a way round for you, not for them)
  u(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2, F = k.floors[f]; k.box([cx - h, cy + 0.75, cz - h], [cx + h, cy + (F.wallH || k.S.wallH), cz + h], 'metal', { tint: [0.45, 0.47, 0.5] }); },
  w(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h, cy, cz - h + 0.3], [cx + h, cy + 1.1, cz + h - 0.3], 'brick'); },
};
