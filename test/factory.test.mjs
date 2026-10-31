// FRONTLINE - Level 2, the Derelict Factory (M6.14.0): built from Rhys's map. Plain node.
import { buildFactory, factoryLadders, spawnPoints, factoryRows, yellowDefs, FS, F_FLOORS, YELLOW_COUNT } from '../src/game/levels/factory.js';
import MAP from '../src/game/levels/maps/factory.json' with { type: 'json' };
import { Player } from '../src/sim/people/player.js';
import { NavGrid } from '../src/sim/world/nav.js';
import { Mission, factoryTrophies } from '../src/sim/play/mission.js';
import { RULES, factoryOutcome, recordOutcome } from '../src/sim/play/story.js';
import { readFileSync } from 'fs';
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const t0 = Date.now();
const L = buildFactory();
const buildMs = Date.now() - t0;
const mid = (i) => (i + 0.5) * FS;
const step = (p, inp, n) => { for (let i = 0; i < n; i++) p.step(1 / 60, Object.assign({ moveX: 0, moveZ: 0, yaw: p.yaw, pitch: 0 }, inp)); };

T('Rhys\'s map came through: two floors of 60 x 60 squares, the corner spawns, eight ladders', () => {
  A(MAP.floors.G.length === 60 && MAP.floors['1'].length === 60 && MAP.floors.G.every((r) => r.length === 60), 'floor sizes');
  const sp = spawnPoints();
  A(sp.filter((s) => s.side === 'ghost').length === 4 && sp.filter((s) => s.side === 'yellow').length === 4, 'spawns: ' + JSON.stringify(sp));
  A(factoryLadders().length === 8 && factoryLadders().every((l) => l.off), 'ladders: ' + JSON.stringify(factoryLadders()));
});
T('built quickly enough to load, with its lamps kept to a bakeable number', () => {
  A(buildMs < 1500, 'built in ' + buildMs + ' ms');
  A(L.lights.length > 30 && L.lights.length <= 90, L.lights.length + ' lamps');
});
T('you start standing free in the north-west corner, inside your way out', () => {
  const p = new Player(L.world); p.pos = L.world.spawn.pos.slice(); p.settle();
  A(Math.abs(p.pos[1]) < 0.05 && p.free(p.pos, p.h), 'stuck at the start: ' + p.pos);
  const z = L.apcZone;
  A(p.pos[0] > z.x0 && p.pos[0] < z.x1 && p.pos[2] > z.z0 && p.pos[2] < z.z1, 'the start is not in the extraction zone');
  A(p.pos[0] < 15 && p.pos[2] < 15, 'not the north-west corner: ' + p.pos);
});
T('the building is shut all round: from inside, every way out meets a wall', () => {
  for (const y of [0, F_FLOORS[1]]) for (let a = 0; a < 32; a++) {
    const d = [Math.cos(a / 32 * Math.PI * 2), 0, Math.sin(a / 32 * Math.PI * 2)];
    const h = L.world.raycast([45, y + 1.2, 45], d, 200, (s) => s.glass);
    A(h && h.t < 70, 'a way out at floor ' + y + ', heading ' + a);
  }
});
T('every ladder takes you up to the first floor, and back down from its top (M6.14.0: walking into the hatch takes hold of it)', () => {
  for (const l of L.ladders) {
    const yaw = Math.atan2(l.face[0], l.face[1]);
    const p = new Player(L.world);
    p.pos = [mid(l.x) + l.face[0] * 0.3, 0, mid(l.y) + l.face[1] * 0.3]; p.settle(); p.yaw = yaw;
    let got = false;
    for (let i = 0; i < 60 * 10 && !(got && p.mode === 'walk' && Math.abs(p.pos[1] - F_FLOORS[1]) < 0.05); i++) { step(p, { moveZ: 1, yaw }, 1); if (p.mode === 'ladder') got = true; }
    step(p, {}, 60);
    A(got && Math.abs(p.pos[1] - F_FLOORS[1]) < 0.05 && p.mode === 'walk', 'ladder ' + [l.x, l.y] + ': not up - ' + p.pos.map((v) => v.toFixed(2)) + ' ' + p.mode);
    // down: from the square you step off by, walk into the hatch
    const q = new Player(L.world);
    q.pos = [mid(l.off[0]), F_FLOORS[1], mid(l.off[1])]; q.settle();
    const toHole = Math.atan2(-(mid(l.x) - q.pos[0]), -(mid(l.y) - q.pos[2]));
    q.yaw = toHole;
    let held = false;
    for (let i = 0; i < 60 * 3 && !held; i++) { step(q, { moveZ: 1, yaw: toHole }, 1); if (q.mode === 'ladder') held = true; }
    A(held && q.pos[1] > F_FLOORS[1] - 0.5, 'ladder ' + [l.x, l.y] + ': walking into the hatch did not take hold (' + q.mode + ' at y ' + q.pos[1].toFixed(2) + ')');
    for (let i = 0; i < 60 * 6 && q.mode === 'ladder'; i++) step(q, { moveZ: -1, yaw: q.yaw }, 1);
    A(q.mode === 'walk' && Math.abs(q.pos[1]) < 0.1, 'ladder ' + [l.x, l.y] + ': not down - ' + q.pos.map((v) => v.toFixed(2)) + ' ' + q.mode);
  }
});
T('eleven yellows, in yellow, two at each of their corners; the patrols walk routes that exist', () => {
  A(L.guards.length === YELLOW_COUNT && L.guards.every((g) => g.faction === 'yellow'), L.guards.length + ' guards');
  const nav = new NavGrid(L.world, L.navFloors, L.navLinks); nav.syncDoors(L.swingDoors);
  const start = L.world.spawn.pos;
  // every yellow outside the core can be reached from where you start (upstairs ones by the ladders)
  for (const g of L.guards.filter((q) => Math.hypot(q.pos[0] - 45, q.pos[2] - 45) > 10)) A(nav.find(start, g.pos), 'you cannot reach ' + g.id + ' at ' + g.pos.map((v) => v.toFixed(1)));
  for (const g of L.guards.filter((q) => q.route)) {
    for (const [x, z] of g.route) A(nav.find(g.pos, [x, g.pos[1], z]), g.id + ' cannot walk his route to ' + [x, z]);
    A(nav.find(start, g.pos), 'you cannot reach ' + g.id + ' from the start');
  }
  for (const g of L.guards) A(L.world.hit([g.pos[0] - 0.3, g.pos[1] + 0.05, g.pos[2] - 0.3], [g.pos[0] + 0.3, g.pos[1] + 1.7, g.pos[2] + 0.3]) === g.target.solid || !L.world.hits([g.pos[0] - 0.3, g.pos[1] + 0.05, g.pos[2] - 0.3], [g.pos[0] + 0.3, g.pos[1] + 1.7, g.pos[2] + 0.3]).some((s) => s !== g.target.solid && !s.person), g.id + ' stands inside something');
});
T('the core is shut behind reinforced doors: its yellows out of reach until a charge opens one', () => {
  const nav = new NavGrid(L.world, L.navFloors, L.navLinks); nav.syncDoors(L.swingDoors);
  const core = L.guards.find((g) => g.rank === 'officer');
  A(core && !nav.find(L.world.spawn.pos, core.pos), 'the core\'s officer can be walked to through locked reinforced doors');
  const rd = L.swingDoors.filter((d) => d.def.build === 'reinforced' && d.def.y0 === 0);
  A(rd.length >= 4 && rd.every((d) => d.locked), 'the core\'s ground-floor doors: ' + rd.length);
  for (const d of rd.filter((q) => q.def.pair === rd[0].def.pair)) d.breach(L.world.spawn.pos, 'blast');
  nav.syncDoors(L.swingDoors);
  A(nav.find(L.world.spawn.pos, core.pos), 'blown open, still no way in to the core');
});
T('every door hung one way, with room for its leaf', () => {
  const mine = new Set(L.swingDoors.map((d) => d.solid));
  for (const d of L.swingDoors) {
    A(d.def.swingTo === 1 || d.def.swingTo === -1, 'a two-way door at ' + d.centre.map((v) => v.toFixed(1)));
    const [mn, mx] = d.openBox(d.def.swingTo);
    A(!L.world.hits(mn.map((v) => v + 0.02), mx.map((v) => v - 0.02)).some((s) => !mine.has(s) && !s.person && !s.target), 'a leaf runs into something at ' + d.centre.map((v) => v.toFixed(1)));
  }
});
T('the objective: flush the yellows out - graded, remembered; trophies only for a mission that ended well', () => {
  const R = RULES.factory, gs = (n, ko) => Array.from({ length: 11 }, (_, i) => ({ dead: i < n, knockedOut: i < ko }));
  const none = R.outcome({ guards: gs(0, 0) }), some = R.outcome({ guards: gs(6, 2) }), all = R.outcome({ guards: gs(11, 11) });
  A(!R.settled(none) && R.grade(none) === 'failed', 'nothing done');
  A(!R.settled(some) && R.grade(some) === 'partial' && some.down === 6 && some.knockedOut === 2, 'six down: ' + JSON.stringify(some));
  A(R.settled(all) && R.grade(all) === 'success', 'all down');
  A(/6 of 11/.test(R.lines(some)[0].text) && /5 yellows still/.test(R.undone(some)), R.lines(some)[0].text + ' / ' + R.undone(some));
  A(recordOutcome({}, all, 'success').story.missions.factory.cleared === true, 'not recorded');
  const m = new Mission({ id: 'factory', guards: 11 }); Object.assign(m, { done: true, result: 'success', kills: 0, knockouts: 11, spotted: 0, headshots: 0 });
  const ids = factoryTrophies(m, gs(11, 11)).map((t) => t.id).sort().join(' ');
  A(ids === 'factory_no_casualties factory_unseen', 'trophies: ' + ids);
  m.result = 'failed'; A(factoryTrophies(m, gs(11, 11)).length === 0, 'trophies for a failed run');
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
  A(/id="t-factory"/.test(html), 'no way to the factory from the title screen');
});
console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + ')' : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
