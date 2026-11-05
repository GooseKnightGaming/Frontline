// FRONTLINE - the level kit and the first-draft levels (M6.19.0). Plain node.
import { buildKitLevel, carve, insideOf, doorsOf, KIT } from '../src/game/levels/kit.js';
import { DRAFTS } from '../src/game/levels/drafts/index.js';
import { NavGrid } from '../src/sim/world/nav.js';
import { RULES } from '../src/sim/play/story.js';
import { readFileSync } from 'fs';
import { ARMS } from '../src/sim/people/guard.js';
import { ITEMS } from '../src/sim/arms/loadout.js';
import { WEAPONS } from '../src/sim/arms/weapons.js';

let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n + ' -> ' + e.message); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };

console.log('-- the kit --');
T('carving: rooms cut out of solid, a wall a square thick round them, doors set in after', () => {
  const rows = carve({ size: [8, 6], ops: [['room', 1, 1, 3, 3], ['room', 5, 1, 6, 3]], after: [['cell', 4, 2, 'D']] });
  A(rows[0] === '########' && rows[2] === '#...D..#' && rows[4] === '########' && rows[5] === '        ', JSON.stringify(rows));
  A(insideOf(rows).has('2,2') && !insideOf(rows).has('0,5'), 'inside');
  A(doorsOf(rows).length === 1 && doorsOf(rows)[0].axis === 'z', 'the door');
});
T('the draft rules: success with every objective done; partial with some; settled once nothing is left that can be done', () => {
  const o = (a) => RULES.draft.outcome({ guards: [{ dead: true }, { dead: false }], objectives: a });
  const all = o([{ id: 'a', done: true }, { id: 'b', done: true }, { id: 'c', optional: true }]);
  A(RULES.draft.grade(all) === 'success' && RULES.draft.settled(all), 'all done');
  const some = o([{ id: 'a', done: true }, { id: 'b', failed: true }]);
  A(RULES.draft.grade(some) === 'partial' && RULES.draft.settled(some), 'some');
  const none = o([{ id: 'a' }]);
  A(!RULES.draft.settled(none) && RULES.draft.grade(none) === 'partial', 'a guard down is something');
  A(RULES.draft.lines(all).length === 3 && RULES.draft.lines(all)[2].neutral, 'lines');
});

console.log('\n-- the drafts --');
const ids = new Set();
for (const d of DRAFTS) {
  T('Level ' + d.no + ' (' + d.title + '): builds; everyone where they can stand; every objective reachable from the way in', () => {
    A(!ids.has(d.id) && /^[a-z][a-z0-9_]*$/.test(d.id), 'id'); ids.add(d.id);
    const L = buildKitLevel(d);
    A(d.battle ? L.rules === 'battle' && L.battle && L.draft === d.id : L.rules === 'draft' && L.draft === d.id && L.objectives.length, 'rules');
    A(L.pieces.length < (d.pieceBudget || 9000), 'pieces: ' + L.pieces.length);
    A(Math.abs(L.extraction.pos[1]) < 0.01, 'the way out is not on the ground (the jeep zone wants y 0)');
    const nav = new NavGrid(L.world, L.navFloors, L.navLinks); nav.maxSteps = L.testNavCap || L.navCap;
    const st = d.start.alt ? L.extraction.pos : L.world.spawn.pos;      // (a start in the air: from where you land - the way out)
    // (M6.19.2) from the way in - or from wherever a portal puts you
    const froms = [st].concat((L.portals || []).map((q) => [(q.box[0][0] + q.box[1][0]) / 2 + q.shift[0], q.box[0][1] + 0.5 + q.shift[1], (q.box[0][2] + q.box[1][2]) / 2 + q.shift[2]]))
      // (M6.125.1) and from where a boat puts you ashore (the Skerries: the boat is the only way across)
      .concat((d.testFroms || []).map(([x, y]) => [(x + 0.5) * (d.cell || 1.5), 0.1, (y + 0.5) * (d.cell || 1.5)]));
    const reach = (p, what) => { A(froms.some((f) => { const path = nav.find(f, p); return path && path.length; }), 'no way to ' + what + ' at ' + p.map((v) => v.toFixed(1)).join(',')); };
    for (const g of L.guards) {
      if (g.aboard) continue;                                        // (M6.20.0) a boat's crew rides it
      const below = L.world.groundBelow(g.pos[0], g.pos[1] + 0.3, g.pos[2], 0.2);
      A(below !== null && Math.abs(below - g.pos[1]) < 0.35, g.id + ' is not standing on anything (' + below + ')');
      reach(g.pos, g.id);
      // a patrol walks straight from point to point: every leg clear of walls (and the first from his post)
      if (g.route) {
        const pts = [[g.pos[0], g.pos[2]]].concat(g.route.map((r) => [r[0], r[1]])).concat(g.route.length > 1 ? [[g.route[0][0], g.route[0][1]]] : []);
        for (let i = 1; i < pts.length; i++) {
          const [ax, az] = pts[i - 1], [bx, bz] = pts[i], dd = Math.hypot(bx - ax, bz - az);
          if (dd < 0.1) continue;
          for (const hh of [1.75]) {           // (walls: low cover a man brushes past is not the question)
            const hit = L.world.raycast([ax, g.pos[1] + hh, az], [(bx - ax) / dd, 0, (bz - az) / dd], dd, (q) => q.tag === 'hdoor' || q.person || q.target);
            A(!hit, g.id + "'s patrol leg " + i + ' runs into something at ' + (hit && hit.t.toFixed(1)) + ' m (' + [ax, az, bx, bz].map((v) => (v / L.spec.cell || v / 1.5).toFixed(1)).join(',') + ')');
          }
        }
      }
    }
    // (M6.19.5) a battle: every point of every lane reachable from its side's spawns, and every spawn spot free
    if (L.battle) for (const side of Object.keys(L.battle.lanes)) {
      for (const sp of L.battle.spots[side]) { const below = L.world.groundBelow(sp[0], sp[1] + 0.3, sp[2], 0.2); A(below !== null && Math.abs(below - sp[1]) < 0.35, side + ' spawn spot not on anything'); }
      L.battle.lanes[side].forEach((ln, i) => ln.forEach((p, j) => {
        const path = nav.find(L.battle.spawns[side][0], p);
        A(path && path.length, side + ' lane ' + i + ' point ' + j + ' (' + [p[0] / L.spec.cell, p[2] / L.spec.cell].join(',') + ') unreachable');
      }));
    }
    for (const h of L.hostages) reach(h.pos, 'hostage ' + h.id);
    const floorUnder = (y) => L.navFloors.reduce((b, f) => (f.y <= y + 0.05 && f.y > b ? f.y : b), -99);
    for (const p of L.pickups) reach([p.pos[0], floorUnder(p.pos[1] - 0.3), p.pos[2]], 'pickup ' + p.id);
    for (const t of L.terminals) reach(t.pos, 'terminal ' + t.id);
    for (const o of L.objectives) {
      if (o.kind === 'take') A(L.pickups.some((p) => p.id === o.ref), o.id + ': no pickup ' + o.ref);
      if (o.kind === 'hack') A(L.terminals.some((p) => p.id === o.ref), o.id + ': no terminal ' + o.ref);
      if (o.kind === 'kill') A(L.guards.some((g) => g.id === o.ref), o.id + ': no target ' + o.ref);
      if (o.kind === 'rescue') A(!o.ref || L.hostages.some((h) => h.id === o.ref), o.id + ': no hostage ' + o.ref);
      if (o.kind === 'reach') A(L.reach.some((r) => r.id === o.ref), o.id + ': nowhere ' + o.ref);
    }
    A(d.brief.length >= 3 && d.where && d.title, 'the briefing');
  });
}

T('blast doors: no charge moves one, its controls (a terminal) do (Rhys: "blast doors that ordinary C5 cannot breach")', () => {
  const L = buildKitLevel(DRAFTS.find((d) => d.id === 'shipyard'));
  const bd = L.swingDoors.filter((d) => d.def.blastDoor);
  A(bd.length >= 2 && bd.every((d) => d.def.vault && d.locked), 'no blast doors');
  A(bd[0].breach([0, 0, 0], 'blast') === 'held' && bd[0].locked && !bd[0].blown, 'a charge moved it');
  bd[0].unlock(); A(!bd[0].locked, 'the controls do not open it');
});
T('the Fortress\'s guns: light and heavy machine guns, rockets that burst where they land; the KR-90 to take up', () => {
  A(ARMS.lmg && ARMS.lmg.item === 'KR90' && ITEMS.KR90 && ITEMS.KR90.mag === 90, 'no LMG');
  A(ARMS.hmg && ARMS.hmg.burst[0] >= 10 && ARMS.rocket && ARMS.rocket.rocket && WEAPONS.ROCKET.blast > 4, 'no HMG or rocket');
  const F = DRAFTS.find((d) => d.id === 'fortress');
  A(['lmg', 'hmg', 'rocket'].every((a) => F.guards.some((g) => g.arms === a)), 'the Fortress has not all three');
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(/arsenal\.detonate\(\{ id: 'ROCKET', pos: at \}, player\)/.test(rt) && /if \(!inHeli && g\.item\) dropAt/.test(rt), 'rockets do not burst, or an HMG man drops nothing gracefully');
});
T('the Drop: you start in the air, a parachute in your gear; the way out is the helicopter pad', () => {
  const d = DRAFTS.find((q) => q.id === 'drop'), L = buildKitLevel(d);
  A(L.world.spawn.pos[1] > 100 && d.startLoadout.gear === 'PARACHUTE', 'not in the air, or no parachute');
  A(Math.hypot(L.extraction.pos[0] - L.world.spawn.pos[0], L.extraction.pos[2] - L.world.spawn.pos[2]) > 80, 'the pad is where you start');
  // the hold's floor under the spawn, open at the ramp end
  A(L.world.groundBelow(L.world.spawn.pos[0], L.world.spawn.pos[1] + 0.2, L.world.spawn.pos[2], 0.2) > 159, 'no floor in the hold');
});
T('the drafts are numbered in order from 5, on a title-screen list of their own', () => {
  DRAFTS.forEach((d, i) => A(d.no === 5 + i, d.id + ' is ' + d.no));
  const mn = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8'), html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
  A(/id="t-drafts"/.test(html) && /id="drafts-list"/.test(html) && /goDraft\(b\.dataset\.id\)/.test(mn), 'no list');
  A(/const level = DRAFT \? buildKitLevel\(DRAFT\)/.test(mn), 'not built');
});
T('the drafts\' crates are plain freight, not Ghost Logistics; railings are bars, not the range fence', () => {
  const kit = readFileSync(new URL('../src/game/levels/kit.js', import.meta.url), 'utf8');
  A(!/'crate'/.test(kit) && /'cargo'/.test(kit), 'Ghost crates');
  for (const d of DRAFTS) A(!buildKitLevel(d).pieces.some((p) => p.mat === 'fence' || p.mat === 'crate'), d.id + ': fence or crate');
});

console.log('\n' + '='.repeat(50));
// (M6.75) following a man: the Old Market's Controller walks to the café's back room and stays (his last point's
// pause), and the runtime counts the objective
T('the Old Market: a man to follow - a route that ends where he stays, and the runtime knows the objective', () => {
  const d = DRAFTS.find((q) => q.id === 'market'), o = d.objectives.find((q) => q.kind === 'tail'), g = d.guards.find((q) => q.id === o.ref);
  const last = g.route[g.route.length - 1];
  A(last[2] >= 1e6 && last[0] >= 41 && last[0] <= 48 && last[1] >= 4 && last[1] <= 10, 'he ends in the back room, and stays: ' + last);
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(/o\.kind === 'tail'/.test(rt) && /he made you/.test(rt) && /you lost him/.test(rt), 'the runtime');
});
T('the Varna Star: a man wanted alive (objective kind capture) - the runtime counts tied or knocked out, and killed as failed', () => {
  const d = DRAFTS.find((q) => q.id === 'varna'), o = d.objectives.find((q) => q.kind === 'capture');
  A(o && d.guards.some((g) => g.id === o.ref), 'the handler');
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(/o\.kind === 'capture'/.test(rt) && /g\.tied \|\| \(g\.dead && g\.knockedOut\)/.test(rt), 'the runtime');
});
T('Ravensholt Lodge: men to mark (objective kind identify) - every ref a guard, the runtime counts the marked', () => {
  const d = DRAFTS.find((q) => q.id === 'lodge'), o = d.objectives.find((q) => q.kind === 'identify');
  A(o && o.refs.length === 5 && o.refs.every((id) => d.guards.some((g) => g.id === id)), 'the chiefs');
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(/o\.kind === 'identify'/.test(rt) && / marked'/.test(rt), 'the runtime');
});
T('the Hesk Hill Transmitter: a place to hold (reach with hold, after a terminal), reserves in three waves', () => {
  const d = DRAFTS.find((q) => q.id === 'mast'), L = buildKitLevel(d), z = L.reach.find((q) => q.id === 'tx');
  A(z && z.hold === 90 && z.after === 'patch' && L.terminals.some((t) => t.id === 'patch'), 'the hold');
  const ws = L.guards.filter((g) => g.reserve && g.wave).map((g) => g.wave);
  A([1, 2, 3].every((k) => ws.includes(k)), 'waves: ' + ws);
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(/z\.held \+= simDt/.test(rt) && /g\.wave === k/.test(rt), 'the runtime');
});
T('epilogues: each has a success and an in-part ending; the case board tells the story so far (M6.82)', () => {
  const ep = DRAFTS.filter((d) => d.epilogue);
  A(ep.length >= 44 && ep.every((d) => typeof d.epilogue.success === 'string' && d.epilogue.success.length > 40 && typeof d.epilogue.partial === 'string'), 'epilogues: ' + ep.length);
  A(/THE STORY SO FAR/.test(readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8')), 'the case board');
});
T('the Vashka Pass: done quietly (objective kind quiet) - the siren marks it, the runtime counts it', () => {
  const d = DRAFTS.find((q) => q.id === 'pass');
  A(d.objectives.some((o) => o.kind === 'quiet' && o.optional) && d.reach.some((r) => r.id === 'over'), 'the pass');
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(/rt\.sirenRung = true/.test(rt) && /o\.kind === 'quiet'/.test(rt), 'the runtime');
});
T('a first draft with an alarm, done without it ringing, earns Never Rang (M6.87)', () => {
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(/_never_rang', name: 'Never Rang: '/.test(rt) && /!rt\.sirenRung && devices\.some\(\(d\) => d\.kind === 'alarm'\)/.test(rt), 'the trophy');
});
T('allies (M6.87): the Arn Bridge\'s Hale and Moss are yours - side ally, escorts, not objectives; their side at war with the reds', () => {
  const d = DRAFTS.find((q) => q.id === 'arnbridge'), L = buildKitLevel(d);
  const al = L.guards.filter((g) => g.side === 'ally');
  A(al.length === 2 && al.every((g) => g.escort && g.escort.lead && g.objective === false && g.faction === 'ghost'), 'the allies');
  A(L.relations && L.relations.ghost.red && L.relations.red.ghost && L.relations.ghost.you === false, 'relations');
});
T('against the clock (objective kind quick, M6.89): the Relay Peaks - three relays, six minutes', () => {
  const d = DRAFTS.find((q) => q.id === 'relays'), q = d.objectives.find((o) => o.kind === 'quick');
  A(q && q.secs === 360 && q.optional && d.objectives.filter((o) => o.kind === 'hack').length === 3, 'the relays');
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(/r\.kind !== 'quick'/.test(rt) && /m\.time > o\.secs/.test(rt), 'the runtime');
});
T('a prisoner who fights (M6.93): the Prison\'s Venn waits as a dormant ally until she is freed', () => {
  const L = buildKitLevel(DRAFTS.find((q) => q.id === 'prison')), g = L.guards.find((q) => q.id === 'venn_gun');
  A(g && g.dormant && g.side === 'ally' && g.freedFrom === 'venn' && L.hostages.some((h) => h.id === 'venn'), 'Venn');
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(/g\.freedFrom === hq\.id/.test(rt) && /hq\.armedGuard = gun/.test(rt), 'the runtime');
});
console.log(fails.length ? 'FAILURES (' + fails.length + '):\n' + fails.map((f) => '  * ' + f).join('\n') : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
