// FRONTLINE - the Riverside Hotel's reds, from Rhys's map (M6.10.0).
// The Guards tab says who each man is (rank, weapon, temperament, notes);
// the floor sheets say where he stands (his P square) and the squares he
// walks (his route, R2, R3...). This turns both into guard definitions.
// Pure logic: no engine, no world.

// Which squares a route mark covers on a floor: { 'R2': [[x, y], ...] }
export function routeCells(labels, floor) {
  const out = {};
  for (const [t, fl, x, y] of labels) {
    if (fl !== floor) continue;
    const m = /^R(\d+)$/i.exec(String(t).trim());
    if (!m) continue;
    (out['R' + m[1]] = out['R' + m[1]] || []).push([x, y]);
  }
  return out;
}

// The posts on the map: { P1: { floor, x, y } }. "P13 A" is P13A.
export function mapPosts(labels) {
  const out = {};
  for (const [t, fl, x, y] of labels) {
    const id = String(t).toUpperCase().replace(/\s+/g, '');
    if (/^P\d+[A-Z]?$/.test(id)) out[id] = { floor: fl, x, y };
  }
  return out;
}

// Squares in walking order. A closed ring is walked round (clockwise or
// anticlockwise as the tab says, from the square nearest the post); an open
// line is walked to its end and back again. The post joins the route when it
// fits it (a square next to one end, or the gap in a ring), not as a branch.
// Returns squares in order (a ring does not repeat its first), and whether it
// loops.
export function orderRoute(cells, post, dir, others) {
  const key = (c) => c[0] + ',' + c[1];
  const set = new Map(cells.map((c) => [key(c), c]));
  const nb = (c) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => set.get((c[0] + dx) + ',' + (c[1] + dy))).filter(Boolean);
  // every post on this route (two men can share one - P7 and P8) fills its gap
  for (const q of [post].concat(others || [])) {
    if (!q || set.has(key(q))) continue;
    const touching = nb(q);
    // only if every square it touches would still have at most two neighbours
    if (touching.length && touching.length <= 2 && touching.every((c) => nb(c).length < 2)) set.set(key(q), q.slice());
  }
  const all = [...set.values()];
  if (all.length < 2) return { order: all, loop: false };
  const deg = new Map(all.map((c) => [key(c), nb(c).length]));
  const ends = all.filter((c) => deg.get(key(c)) === 1);
  const loop = ends.length === 0;
  const near = (list) => post ? list.reduce((b, c) => (Math.hypot(c[0] - post[0], c[1] - post[1]) < Math.hypot(b[0] - post[0], b[1] - post[1]) ? c : b)) : list[0];
  let start = loop ? near(all) : near(ends);
  const order = [start], seen = new Set([key(start)]);
  for (;;) {
    const next = nb(order[order.length - 1]).find((c) => !seen.has(key(c)));
    if (!next) break;
    order.push(next); seen.add(key(next));
  }
  if (loop && dir) {
    // shoelace on the map (x right, y down the sheet = south): positive is
    // clockwise as you look at the sheet
    let a = 0;
    for (let i = 0; i < order.length; i++) { const p = order[i], q = order[(i + 1) % order.length]; a += p[0] * q[1] - q[0] * p[1]; }
    const cw = a > 0;
    if ((dir === 'clockwise') !== cw) { const rest = order.slice(1).reverse(); order.length = 1; order.push(...rest); }
  }
  return { order, loop };
}

// Only the corners of a walk (where it changes direction), so a guard walks
// straight lines between them.
export function corners(order, loop) {
  if (order.length <= 2) return order.slice();
  const out = [];
  const n = order.length;
  for (let i = 0; i < n; i++) {
    if (!loop && (i === 0 || i === n - 1)) { out.push(order[i]); continue; }
    const a = order[(i - 1 + n) % n], b = order[i], c = order[(i + 1) % n];
    if ((b[0] - a[0]) !== (c[0] - b[0]) || (b[1] - a[1]) !== (c[1] - b[1])) out.push(b);
  }
  return out;
}

// what he can see by in the dark (M6.10.0, Rhys: night vision or a torch -
// one or the other): the better-equipped ranks wear goggles; the rest carry
// a torch (in the hand with a pistol, on the gun otherwise)
export function nightKit(rank, weapon) {
  return rank === 'specialist' || rank === 'officer' ? 'nvg' : 'torch';
}

// A temperament the sheet uses that the brain knows: cowardly stays cowardly.
const TEMPERS = new Set(['bold', 'steady', 'cowardly']);
const WEAPONS = new Set(['carbine', 'pistol', 'marksman', 'shotgun']);
const RANKS = new Set(['guard', 'sergeant', 'officer', 'specialist']);

// Everyone on the built floors, as guard definitions (positions in metres).
// map: the JSON; S: metres a square; FLOORS: storey heights by floor key.
export function hotelGuards(map, S, FLOORS, built) {
  const posts = mapPosts(map.labels);
  const defs = [];
  // the posts of everyone who walks each route, floor by floor
  const sharers = {};
  for (const row of map.guards || []) {
    const m = /\bR(\d+)\b/i.exec(row.patrol || ''), p = posts[row.id] || (row.post ? { x: row.post[0], y: row.post[1] } : null);
    if (m && p) (sharers[row.floor + ':R' + m[1]] = sharers[row.floor + ':R' + m[1]] || []).push([p.x, p.y]);
  }
  for (const row of map.guards || []) {
    if (/A$/.test(row.id)) continue;                 // P13A is P13, later, on the roof: his way out (coming)
    const floor = row.floor;
    if (built && !built.includes(floor)) continue;
    const p = posts[row.id] || (row.post ? { floor, x: row.post[0], y: row.post[1] } : null);
    if (!p) continue;
    const post = [p.x, p.y];
    const routeMark = /\bR(\d+)\b/i.exec(row.patrol || '');
    let route = null, loop = false;
    if (routeMark) {
      const cells = routeCells(map.labels, floor)['R' + routeMark[1]];
      if (cells && cells.length) {
        const dir = /anti-?clockwise/i.test(row.patrol) && !/clockwise until/i.test(row.patrol) ? 'anticlockwise' : /clockwise/i.test(row.patrol) ? 'clockwise' : null;
        const o = orderRoute(cells, post, dir, sharers[floor + ':R' + routeMark[1]]);
        loop = o.loop;
        let pts = corners(o.order, o.loop);
        // an open line is walked there and back
        if (!loop && pts.length > 1) pts = pts.concat(pts.slice(1, -1).reverse());
        route = pts.map(([x, y]) => [(x + 0.5) * S, (y + 0.5) * S]);
      }
    }
    const rank = RANKS.has(row.rank) ? row.rank : 'guard';
    const arms = WEAPONS.has(row.weapon) ? row.weapon : 'carbine';
    defs.push({
      id: row.id, floor, cell: post,
      pos: [(post[0] + 0.5) * S, FLOORS[floor], (post[1] + 0.5) * S],
      route, loop, rank, arms,
      temper: TEMPERS.has(row.temper) ? row.temper : 'bold',
      sees: nightKit(rank, arms),
      // (M6.10.1) "flees ... at first sign of danger" (P13): he runs when he sees you, not only when hurt
      fleeOn: /first sign|at the first/i.test(row.notes + ' ' + row.patrol) ? 'alert' : 'hurt',
      watch: /door/i.test(row.patrol + ' ' + row.notes) ? 'door' : /window/i.test(row.patrol + ' ' + row.notes) ? 'window' : null,
      notes: row.notes || '', patrol: row.patrol || '',
    });
  }
  return defs;
}
