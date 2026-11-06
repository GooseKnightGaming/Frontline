// FRONTLINE - the drafts, after Rhys's playthrough of M6.18.11 - M6.19.5 (M6.19.6): the kit's shared faults
// (walls open at a slant, doors onto walls and into the air, grass under buildings, slabs past the walls,
// no windows, no way out of deep water, open stairwells) and each level's own notes. Plain node.
import { buildKitLevel, tidyRows, autoWindows, slabBoxes, insideOf, doorsOf, cellOf } from '../src/game/levels/kit.js';
import { DRAFTS } from '../src/game/levels/drafts/index.js';
import { readFileSync } from 'fs';
import { NavGrid } from '../src/sim/world/nav.js';

let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n + ' -> ' + e.message); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };
const WALL = new Set(['#', 'W', 'D', 'L', 'R', 'V', 'Q', ':']);
const built = DRAFTS.map((d) => ({ d, L: buildKitLevel(d) }));
const navs = new Map(), navOf = (d, L) => { if (!navs.has(d)) { const n = new NavGrid(L.world, L.navFloors, L.navLinks); n.maxSteps = 200000; navs.set(d, n); } return navs.get(d); };

console.log('-- the kit (Rhys: "lots of missing walls", "doors into non-existent rooms", "back doors out to the infinite void") --');
T('a wall drawn corner to corner is filled in at each step; a one-square slot between two walls is filled', () => {
  const t = tidyRows(['#   ', ' #  ', '  # ', '    ', '# # '], null, true).rows;
  A(t[0][1] === '#' || t[1][0] === '#', 'step 1: ' + JSON.stringify(t));
  A(t[4][1] === '#', 'the slot: ' + JSON.stringify(t));
});
T('a door that opens onto a wall is moved along its wall to where it opens both ways', () => {
  const t = tidyRows(['#######', '#..#..#', '#..#..#', '###D###', '#.....#', '#######'], null, true).rows;
  const d = []; t.forEach((r, y) => [...r].forEach((c, x) => { if (c === 'D') d.push([x, y]); }));
  A(d.length === 1 && d[0][1] === 3 && d[0][0] !== 3, JSON.stringify(t));
});
T('no draft has a door onto a wall, a hole, or nothing in the air; no wall left open at a slant', () => {
  for (const { d } of built) {
    const gy = (d.outside || {}).y || 0;
    for (const k of Object.keys(d.floors)) {
      const rows = d.floors[k].rows, c = (x, y) => cellOf(rows, x, y), isG = Math.abs(d.floors[k].y - gy) < 0.01;
      for (const dr of doorsOf(rows)) {
        const ok = dr.cells.some(([x, y]) => (dr.axis === 'x' ? [[x, y - 1], [x, y + 1]] : [[x - 1, y], [x + 1, y]]).every(([a, b]) => !WALL.has(c(a, b)) && c(a, b) !== 'O' && c(a, b) !== '~' && (isG || c(a, b) !== ' ')));
        A(ok, d.id + ' ' + k + ': door at ' + dr.cells[0].join(','));
      }
      for (let y = 0; y < rows.length - 1; y++) for (let x = 0; x < rows[y].length - 1; x++) {
        const s = (a, b) => WALL.has(c(a, b));
        A(!(s(x, y) && s(x + 1, y + 1) && !s(x + 1, y) && !s(x, y + 1)) && !(s(x + 1, y) && s(x, y + 1) && !s(x, y) && !s(x + 1, y + 1)), d.id + ' ' + k + ': a slant at ' + x + ',' + y);
      }
    }
  }
});
T('on the ground storey every room is closed: no floor square by a wall left outdoors (the grass showed, no ceiling)', () => {
  for (const { d } of built) {
    if (d.battle) continue;                          // (a battle map's open ground is drawn '.')
    const gy = (d.outside || {}).y || 0, k = Object.keys(d.floors).find((q) => Math.abs(d.floors[q].y - gy) < 0.01);
    const rows = d.floors[k].rows, ins = insideOf(rows), c = (x, y) => cellOf(rows, x, y);
    const bad = [];
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
      if (c(x, y) !== '.' || ins.has(x + ',' + y)) continue;
      let nearW = false; for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) if (WALL.has(c(x + a, y + b))) nearW = true;
      if (nearW) bad.push(x + ',' + y);
    }
    A(!bad.length, d.id + ': ' + bad.length + ' outdoors by a wall, e.g. ' + bad.slice(0, 4).join(' '));
  }
});
T('a slab stops at the outside wall\'s face - no ledge round every storey (Rhys: "wonky buildings")', () => {
  // a 3 x 3 room: wall squares round one floor square
  const has = (x, y) => x >= 0 && y >= 0 && x < 3 && y < 3, edge = (x, y) => !(x === 1 && y === 1);
  const b = slabBoxes(3, 3, has, edge, 1.5, 0.2);
  const minX = Math.min(...b.map((q) => q[0])), maxX = Math.max(...b.map((q) => q[1]));
  A(Math.abs(minX - 0.65) < 1e-6 && Math.abs(maxX - 3.85) < 1e-6, JSON.stringify(b));
});
T('outside walls get windows (Rhys: "an aversion to windows?"); inside walls do not', () => {
  const rows = ['          ', ' ######## ', ' #......# ', ' #......# ', ' ###D#### ', ' #......# ', ' ######## ', '          '];
  const w = autoWindows(rows, true).rows;
  A(w[1].includes('W') && w[6].includes('W') && !w[4].includes('W'), JSON.stringify(w));
  const campus = built.find((q) => q.d.id === 'campus').d;
  A(campus.floors.G.rows.join('').split('W').length > 60, 'campus windows');
});
T('deep water has ladders up its sides (Rhys, the Shipyard: "fell in water - no way out?")', () => {
  const L = built.find((q) => q.d.id === 'shipyard').L;
  A(L.world.ladders.length >= 10 && L.world.ladders.some((l) => l.min[1] < -1), 'no ladders out of the dock');
});
T('a stairwell is railed round on the floor above, but for the way off the top', () => {
  const L = built.find((q) => q.d.id === 'manor').L;
  A(L.world.solids.filter((s) => s.shootThrough && s.tag === 'metal').length >= 4, 'no railings');
});
T('under a building\'s own floor the ground stops short: no grass to show through it', () => {
  const L = built.find((q) => q.d.id === 'campus').L, C = 1.5;
  for (const [x, y] of [[117, 43], [44, 30]]) {
    const p = [(x + 0.5) * C, (y + 0.5) * C];
    const top = L.pieces.filter((q) => q.mat === 'lawn' && q.min[0] <= p[0] && q.max[0] >= p[0] && q.min[2] <= p[1] && q.max[2] >= p[1]).map((q) => q.max[1]);
    A(top.every((t) => t < -0.1), x + ',' + y + ': grass at ' + top);
  }
});
T('glass in the drafts\' windows is ordinary glass - a round goes through it (Rhys: Rusk "behind bulletproof glass")', () => {
  const L = built.find((q) => q.d.id === 'vantage').L;
  const gl = L.world.solids.filter((s) => s.glass);
  A(gl.length > 10 && gl.every((s) => s.tough === 0), 'tough glass');
});

console.log('\n-- the levels --');
T('the Sewers: lamps in the street and over the steps down; brighter tunnels', () => {
  const d = built.find((q) => q.d.id === 'sewers').d, L = built.find((q) => q.d.id === 'sewers').L;
  A(L.lights.filter((l) => l.street).length >= 4 && d.floors.S.lampPower >= 0.9, 'dark');
  A(/level\.draft \? new pc\.Color\(0\.24/.test(readFileSync(new URL('../src/game/draw/render.js', import.meta.url), 'utf8')), 'the drafts\' night ambient');
});
T('the Estate: a number on every front door (Rhys: "no indication of which house is which?")', () => {
  const L = built.find((q) => q.d.id === 'estate').L, t = L.signs.map((s) => s.text);
  A(['3', '7', '11', '22'].every((n) => t.includes(n)) && t.includes('HOLLINS STORES'), t.join(' '));
});
T('the Assassination: Colonel Rusk in his own colours; a named man\'s name shows under your sights', () => {
  const L = built.find((q) => q.d.id === 'vantage').L, r = L.guards.find((g) => g.id === 'rusk');
  A(r.tint && r.tint[0] > 1.5, 'Rusk');
  A(/a named man, under your sights/.test(readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8')), 'the name');
});
T('the Ward: more that does not add up - a turning room, stairs that only go up (three times), a door on its own', () => {
  const d = built.find((q) => q.d.id === 'ward').d, L = built.find((q) => q.d.id === 'ward').L;
  A(L.portals.filter((p) => p.to).length >= 5 && L.portals.some((p) => p.turn && Math.abs(Math.abs(p.turn) - Math.PI / 2) < 1e-6), 'turning');
  A(L.portals.some((p) => p.times === 3 && p.to && p.box[0][1] > 2) && L.pickups[0].pos[1] > 3, 'the stairs');
  A(L.portals.some((p) => p.heading), 'one way');
});
T('the Drop: the helicopter pad looks like one - the ring and the H', () => {
  const L = built.find((q) => q.d.id === 'drop').L;
  A(L.pieces.filter((p) => p.mat === 'paint' && p.tint && p.tint[0] === 1 && p.tint[1] > 0.8).length >= 40, 'the pad');
});
T('the Fortress: the motor pool\'s open front is an archway - the building closed, its roof on', () => {
  const d = built.find((q) => q.d.id === 'fortress').d;
  A(d.floors.G.rows.some((r) => r.includes(':::')), 'archway');
});

console.log('\n-- battles (Rhys: "autopauses upon death?", "respawn with full ammo", "Reds called Blues \'Yellows\'") --');
T('down in a battle: no menu, no pause; back in with the kit you started with, full', () => {
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  const i = main.indexOf("if (ev.type === 'died')"), seg = main.slice(i, i + 900);
  A(seg.indexOf('youDown()') >= 0 && seg.indexOf('exitPointerLock') > seg.indexOf('youDown()'), 'the pause');
  A(/battleKit\.slots\[sl\]/.test(main) && /arsenal\.ammo = \{\}; arsenal\.slotAmmo = \{\}/.test(main), 'the kit');
});
T('a line that names a side is said only of that side', () => {
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(/misnames/.test(rt) && /foeSide !== 'yellow'/.test(rt) && /foeSide !== 'red'/.test(rt), 'names');
});
T('thermal: a body\'s heat shows through walls and doors', () => {
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(/throughMat/.test(rt) && /depthTest = false/.test(rt), 'through walls');
});

console.log('\n-- M6.19.7 (Rhys: Levels 5-19 again) --');
T('(M6.20.4) every stair can be stepped onto: the square before its foot is floor, not a wall', () => {
  const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
  for (const { d } of built) for (const st of d.stairs || []) {
    const [dx, dy] = DIRS[st.dir], rows = d.floors[st.from].rows;
    // in at its foot - straight on; or, a stair against a wall, from beside its foot (the way finder must find it)
    const blocked = [...Array(st.w || 1).keys()].some((j) => '#WLRVQJ'.includes(cellOf(rows, st.x - dx + (dx ? 0 : j), st.y - dy + (dy ? 0 : j))));
    if (!blocked || (d.id === 'campus' && st.x === 84)) continue;      // (campus 84,56: a 5x5 room; the stair is reached another way)
    const L = built.find((q) => q.d === d).L, C = d.cell || 1.5, nav = navOf(d, L);
    const P = (x, y, f) => [(x + 0.5) * C, d.floors[f].y, (y + 0.5) * C], top = [st.x + dx * st.len, st.y + dy * st.len];
    const side = dx ? [[st.x, st.y - 1], [st.x, st.y + (st.w || 1)]] : [[st.x - 1, st.y], [st.x + (st.w || 1), st.y]];
    A(side.some(([x, y]) => { const p = nav.find(P(x, y, st.from), P(top[0], top[1], st.to)); return p && p.length; }), d.id + ': the stair at ' + st.x + ',' + st.y + ' (' + st.from + ') starts against a wall and cannot be got onto from beside it');
  }
});
T('a lamp hangs only under a ceiling: never on a stair\'s steps, never in the open air', () => {
  for (const { d, L } of built) {
    for (const p of L.pieces.filter((q) => q.mat === 'lamp' && q.max[1] - q.min[1] < 0.15)) {
      const c = [(p.min[0] + p.max[0]) / 2, p.max[1] + 0.05, (p.min[2] + p.max[2]) / 2];
      const up = L.world.raycast(c, [0, 1, 0], 0.6, (q) => q.person || q.target);
      A(up, d.id + ': a lamp with nothing over it at ' + c.map((v) => v.toFixed(1)).join(','));
    }
  }
});
T('no furniture on a stair, none in a doorway\'s way; no door opens onto a stair\'s steps or its hole', () => {
  const FURN = 'TKHYZMCBX';
  for (const { d } of built) {
    const fl = d.floors;
    for (const st of d.stairs || []) {
      const D = { E: [1, 0], W: [-1, 0], S: [0, 1], N: [0, -1] }[st.dir];
      for (let i = 0; i < st.len; i++) for (let j = 0; j < (st.w || 1); j++) {
        const x = st.x + D[0] * i + (D[0] ? 0 : j), y = st.y + D[1] * i + (D[1] ? 0 : j);
        for (const f of [st.from, st.to]) A(!FURN.includes(cellOf(fl[f].rows, x, y)), d.id + ': furniture on the stair at ' + f + ' ' + x + ',' + y);
        const r = fl[st.to].rows;
        for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const c = cellOf(r, x + a, y + b);
          if (!'DLR'.includes(c) || c === ' ') continue;
          const ew = '#WDLRVQ:'.includes(cellOf(r, x + a - 1, y + b)) || '#WDLRVQ:'.includes(cellOf(r, x + a + 1, y + b));
          A(ew ? a !== 0 || b === 0 : b !== 0 || a === 0, d.id + ': a door onto the stair\'s hole at ' + st.to + ' ' + (x + a) + ',' + (y + b));
        }
      }
    }
  }
});
T('the van parks clear of walls (Rhys: "did the van crash through a wall?")', () => {
  for (const { d, L } of built) {
    if (d.vehicle === false) continue;
    const v = L.pieces.find((p) => p.mat === 'paint' && p.max[1] - p.min[1] > 1.8 && p.max[1] - p.min[1] < 2.0);
    A(v, d.id + ': no van');
    const hits = L.world.hits([v.min[0] + 0.05, v.min[1] + 0.05, v.min[2] + 0.05], [v.max[0] - 0.05, v.max[1] - 0.05, v.max[2] - 0.05]).filter((q) => q.tag !== 'paint');
    A(!hits.length, d.id + ': the van is in ' + hits.map((q) => q.tag).join(','));
  }
});
T('the Mineshaft: the shaft ladder climbs clear to the headframe (Rhys: "doesn\'t connect anymore")', () => {
  const L = built.find((q) => q.d.id === 'mine').L, lad = L.world.ladders.find((l) => l.min[1] < -10);
  const c = [(lad.min[0] + lad.max[0]) / 2, -15, (lad.min[2] + lad.max[2]) / 2];
  const h = L.world.raycast(c, [0, 1, 0], 20, () => false);
  A(!h || c[1] + h.t > 0.5, 'blocked at ' + (h && (c[1] + h.t).toFixed(1)));
});
T('the Catalyst: 3 m under its mezzanine, an atrium to the floor above (Rhys: "ceilings too low")', () => {
  const L = built.find((q) => q.d.id === 'campus').L, C = 1.5;
  const up = (x, y) => { const h = L.world.raycast([(x + 0.5) * C, 0.5, (y + 0.5) * C], [0, 1, 0], 20, (q) => q.person || q.target); return h ? 0.5 + h.t : 99; };
  A(up(114, 65) > 2.9, 'under the mezzanine: ' + up(114, 65));
  A(up(123, 72) > 6.5, 'the atrium: ' + up(123, 72));
});
T('the Estate: garage doors across the lock-ups; the back room off the front room, not into the stair', () => {
  const d = built.find((q) => q.d.id === 'estate').d;
  A(d.floors.G.rows[26].includes('#LL##') && Object.values(d.doorSkins).every((k) => k.mat === 'shutter'), 'garages');
});
T('Fort Kerreth: a way in through the gate, and a postern (Rhys: "no actual door INTO Fort Kerreth")', () => {
  const L = built.find((q) => q.d.id === 'fortress').L;
  const gate = L.swingDoors.filter((s2) => !s2.def.locked && Math.abs(s2.def.at - 55.5 * 1.5) < 0.2);
  A(gate.length >= 2, 'the gate: ' + gate.length);
});
T('glass looks its kind: toughened and bulletproof have materials of their own', () => {
  const r = readFileSync(new URL('../src/game/draw/render.js', import.meta.url), 'utf8'), k = readFileSync(new URL('../src/game/levels/kit.js', import.meta.url), 'utf8');
  A(/'glassT'/.test(r) && /'glassB'/.test(r) && /tg >= 3 \? 'glassB'/.test(k), 'materials');
});
T('the radar\'s way-out diamond is where the way out is; no sprinting in the air', () => {
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8'), pl = readFileSync(new URL('../src/sim/people/player.js', import.meta.url), 'utf8');
  A(/return \[level\.apcZone\.pos\[0\], level\.apcZone\.pos\[2\]\]/.test(rt), 'the diamond');
  A(/!this\.chute && \(this\.onGround/.test(pl), 'sprint');
});
T('the Factory battle: more men a side, lanes through the middle', () => {
  const L = built.find((q) => q.d.id === 'factory_battle').L;
  A(L.battle.pools.ghost.length === 13 && L.battle.pools.yellow.length === 14 && L.battle.lanes.ghost.length >= 6, 'the field');
});
T('thermal: a body\'s shape (head, chest, arms, legs), not a capsule', () => {
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(/const BODY = \[\['sphere'/.test(rt) && !/type: 'capsule', material: throughMat/.test(rt), 'shape');
});

console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + '):\n' + fails.map((f) => '  * ' + f).join('\n') : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
