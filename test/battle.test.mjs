// FRONTLINE - battle mode (M6.19.5): the reserves, the clock, the result; a man brought back on; the
// Beachhead and the Factory's battle as Rhys drew them. Plain node.
import { Battle, BATTLE, battleRules } from '../src/sim/battle.js';
import { RULES } from '../src/sim/story.js';
import { buildKitLevel } from '../src/game/level_kit.js';
import { DRAFTS } from '../src/game/levels/index.js';
import { hostileTo, hostileToYou } from '../src/sim/factions.js';
import { readFileSync } from 'fs';
import MAP from '../src/game/maps/beachhead.json' with { type: 'json' };

let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n + ' -> ' + e.message); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };
const def = () => ({ you: 'ghost', timer: 600, teams: { ghost: { name: 'Ghost', reserve: 100 }, red: { name: 'The reds', reserve: 100 } } });

console.log('-- the rules (Rhys: "10 minute timer; 100 reserve units per team; ends at the timer or when one team has zero in reserve AND zero in the field") --');
T('every man on the field is paid for out of the reserve; a side with none left cannot send more', () => {
  const b = new Battle(def());
  for (let i = 0; i < 10; i++) A(b.send('ghost') && b.send('red'), 'send');
  A(b.teams.ghost.reserve === 90 && b.teams.ghost.field === 10 && b.strength('ghost') === 100, 'paid');
  b.down('red', 'you'); A(b.teams.red.field === 9 && b.teams.red.lost === 1 && b.youKills === 1 && b.teams.ghost.kills === 1 && b.strength('red') === 99, 'down by you');
  b.down('ghost', 'red'); A(b.teams.red.kills === 1 && b.youKills === 1, 'down by them');
  const c = new Battle({ you: 'ghost', teams: { ghost: { reserve: 1 }, red: { reserve: 5 } } });
  A(c.send('ghost') && !c.send('ghost'), 'nothing left to send');
});
T('it ends at the clock (more men left wins; level, a draw) - or when a side has nobody in reserve or on the field', () => {
  const b = new Battle(def()); b.send('ghost'); b.send('red');
  b.tick(300); A(!b.over && b.clock() === '5:00', 'mid ' + b.clock());
  b.tick(301); A(b.over && b.result() === 'draw', 'draw');
  const c = new Battle(def()); c.send('ghost'); c.send('red'); c.down('red', 'ghost'); c.tick(700); A(c.result() === 'win', 'win on the clock');
  const d = new Battle({ you: 'ghost', teams: { ghost: { reserve: 3 }, red: { reserve: 1 } } });
  d.send('ghost'); d.send('red'); A(!d.over, 'not yet: one of theirs still on the field');
  d.down('red', 'you'); A(d.over && d.beaten === 'red' && d.result() === 'win', 'beaten');
  const e = new Battle(def()); e.youOut = true; A(e.over, 'you out of men');
});
T('the debrief: won, drawn or lost - and how; both sides\' counts; your own', () => {
  const b = new Battle(def()); b.send('ghost'); b.send('red'); b.down('red', 'you'); b.tick(601);
  const o = RULES.battle.outcome({ battle: b.snapshot(), draftId: 'beachhead' });
  A(RULES.battle === battleRules && RULES.battle.settled(o) && RULES.battle.grade(o) === 'success', 'won');
  const ls = RULES.battle.lines(o);
  A(ls.length === 4 && /won \(the clock ran out\)/.test(ls[0].text) && /Ghost .* 100 of 100 left/.test(ls[1].text) && /1 down by your hand/.test(ls[3].text), JSON.stringify(ls));
  const l = new Battle(def()); l.send('ghost'); l.send('red'); l.down('ghost', 'red'); l.tick(601);
  A(RULES.battle.grade(RULES.battle.outcome({ battle: l.snapshot() })) === 'failed', 'lost');
});

console.log('\n-- the field --');
const beach = DRAFTS.find((d) => d.id === 'beachhead'), fb = DRAFTS.find((d) => d.id === 'factory_battle');
T('the Beachhead: Rhys\'s sheet - the river, the sea, the walls, gates and barricades, the ladders, the piers, the gun', () => {
  A(beach && beach.no === 18 && fb && fb.no === 19, 'numbers');
  const G = beach.floors.G.rows, F = beach.floors['1'].rows;
  A(G.length > MAP.floors.G.length && G[0].length === MAP.floors.G[0].length, 'size');
  A(G[30][28] === '~' && G[60][10] === '~' && G[56][28] === '~', 'the river (under the pier too) and the sea');
  A(G[22][11] === 'D' && G[15][11] === 'R' && G[29][11] === 'R' && G[10][52] === 'D' && G[23][43] === 'D', 'gates and barricades');
  A(F[20][11] === '.' && F[40][3] === '.' && F[56][30] === '.' && F[20][30] === ' ', 'the wall-walk, the bunker roof, the upper pier');
  const L = buildKitLevel(beach);
  A(L.rules === 'battle' && L.battle.def.teams.ghost.reserve === 100 && L.battle.def.teams.red.reserve === 100 && L.battle.def.timer === 600, 'the battle');
  A(L.battle.pools.ghost.length === 9 && L.battle.pools.red.length === 10, 'the field: ten a side, you one of Ghost\'s');
  A(L.battle.pools.ghost.every((g) => g.side === 'ally' && g.objective === false && g.faction === 'ally') && L.battle.pools.red.every((g) => g.faction === 'red'), 'sides');
  A(hostileTo(L.battle.pools.red[0], L.battle.pools.ghost[0], L.relations) && hostileTo(L.battle.pools.ghost[0], L.battle.pools.red[0], L.relations), 'they fight each other');
  A(hostileToYou(L.battle.pools.red[0], L.relations) && !hostileToYou(L.battle.pools.ghost[0], L.relations), 'and Ghost not you');
  A(L.cannons.length === 1 && Math.abs(L.cannons[0].pos[1] - 8.8) < 0.01, 'the gun on the bunker\'s roof');
  A(L.currents.length === 1 && L.currents[0].v[1] > 0, 'the river runs south');
  A(L.swingDoors.filter((d) => d.def.build === 'reinforced').length >= 4, 'barricades');
  // a wall drawn corner to corner is a wall: no diagonal step left open
  for (let y = 0; y < G.length - 1; y++) for (let x = 0; x < G[0].length - 1; x++) {
    const s = (a, b) => '#DR'.includes(G[b][a]);
    A(!(s(x, y) && s(x + 1, y + 1) && !s(x + 1, y) && !s(x, y + 1)) && !(s(x + 1, y) && s(x, y + 1) && !s(x, y) && !s(x + 1, y + 1)), 'a gap in the wall at ' + x + ',' + y);
  }
});
T('the Factory: Battle - Ghost and the Yellows, each at its two corners (the sheet\'s spawn points)', () => {
  const L = buildKitLevel(fb);
  A(L.rules === 'battle' && L.relations.yellow.ally && L.relations.ally.yellow && L.relations.ally.you === false, 'sides');
  A(L.battle.spawns.ghost.length === 4 && L.battle.spawns.yellow.length === 4 && L.navLinks.filter((l) => l.ladder).length === 8, 'spawns, ladders');
});
T('a man down is brought back on as the next: fresh, at his side\'s end', () => {
  const L = buildKitLevel(beach), g = L.battle.pools.red[0];
  g.target.hp = 0; g.target.down = true; g.target.lastBy = 'you'; g.step(0.1, {}); g.counted = true; g.dropped = true;
  A(g.dead && g.target.solid.disabled, 'down');
  const p = L.battle.spots.red[2];
  g.revive(p, 1, [10, 0, 10]);
  A(!g.dead && g.state === 'patrol' && g.target.hp === g.target.maxHp && !g.target.down && !g.target.solid.disabled && !g.counted && !g.dropped && g.target.lastBy === null, 'fresh');
  A(g.pos[0] === p[0] && g.push[0] === 10 && g.ammo === g.arms.mag && g.target.solid.min[0] < p[0], 'where');
});
T('the runtime: you down is not the end while your side has men; back in at your end; the step line; the gun', () => {
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8'), main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/youDown\(\)/.test(rt) && /missionRt\.youDown && missionRt\.youDown\(\)/.test(main) && /respawnYou\(\)/.test(main), 'respawn');
  A(/function battleTick/.test(rt) && /BATTLE\.corpse/.test(rt) && /g\.revive\(/.test(rt), 'the field');
  A(/E  Fire the gun/.test(rt), 'the gun');
  A(BATTLE.youBack > 0 && BATTLE.corpse > 0, 'consts');
});

console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + '):\n' + fails.map((f) => '  * ' + f).join('\n') : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
