// FRONTLINE - M6 stage 3: guards fight back. Run against the real Level 0.
import { buildMission0, FLOORS } from '../src/game/level_mission0.js';
import { NavGrid } from '../src/sim/nav.js';
import { FIGHT, hitChance, LINES, ARMS, raiseAlarm, RANKS, lineFor, ON_ALERT } from '../src/sim/guard.js';

let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const DT = 1 / 60;
const setup = (roll) => {
  const L = buildMission0();
  const nav = new NavGrid(L.world, L.navFloors, L.navLinks);
  const barks = [];
  const ctx = (you) => ({ world: L.world, nav, guards: L.guards, doors: L.swingDoors, noises: [], random: () => roll,
    bark: (g, t, key) => barks.push(key), alarm: () => {}, you });
  return { L, barks, ctx };
};
const youAt = (pos, o) => {
  o = o || {};
  const h = o.stance === 1 ? 1.2 : 1.8;
  return { pos, eye: [pos[0], pos[1] + h - 0.14, pos[2]], chest: [pos[0], pos[1] + h * 0.55, pos[2]],
    stance: o.stance || 0, speed: o.speed || 0, noise: 0,
    box: [[pos[0] - 0.32, pos[1], pos[2] - 0.32], [pos[0] + 0.32, pos[1] + h, pos[2] + 0.32]] };
};
// the security guard, turned to face into his office, and you in front of him
const facing = (roll) => {
  const S = setup(roll); const g = S.L.guards.find((x) => x.id === 'security');
  g.yaw = Math.PI; g.home.yaw = Math.PI;
  g.armsName = 'carbine'; g.arms = ARMS.carbine; g.ammo = ARMS.carbine.mag;   // these tests are about the carbine
  return { S, g };
};
const run = (S, g, you, secs) => { const shots = []; for (let i = 0; i < Math.round(secs / DT); i++) { g.step(DT, S.ctx(you)); shots.push(...g.events); g.events.length = 0; } return shots; };

console.log('\n-- HE SHOOTS --');
T('once he has you, a moment to react, then he fires', () => {
  const { S, g } = facing(0);
  const you = youAt([16, 0, 8.3]);
  const early = run(S, g, you, 1.2);                    // alert takes about a second
  A(g.state === 'alert', 'not alerted: ' + g.state);
  const t0 = g.aimT;
  A(early.length === 0 || t0 > FIGHT.react, 'fired before reacting');
  const shots = run(S, g, you, 1.5);
  A(shots.length >= 3, 'should have fired a burst: ' + shots.length);
  A(shots.every((s) => s.hit && s.damage === FIGHT.damage), 'with a sure hand every round should hit');
});
T('a shaky hand misses, and the misses go near you, not at you', () => {
  const { S, g } = facing(0.999);
  const you = youAt([16, 0, 8.3]);
  const shots = run(S, g, you, 3);
  A(shots.length > 0 && shots.every((s) => !s.hit), 'misses expected: ' + shots.length);
  A(shots.every((s) => Math.hypot(s.to[0] - you.chest[0], s.to[2] - you.chest[2]) < 2.5), 'a miss went wild');
});
T('he fires in bursts with pauses, reloads after thirty, and says so', () => {
  const { S, g } = facing(0);
  const shots = run(S, g, youAt([16, 0, 8.3]), 12);
  A(shots.length >= FIGHT.mag, 'not enough fire to empty a magazine: ' + shots.length);
  A(S.barks.includes('reload'), 'no reload call: ' + S.barks.join(','));
  A(shots.length < 12 / FIGHT.gap * 0.7, 'no pauses between bursts: ' + shots.length + ' rounds in 12 s');
});
T('(M6.16.0, Rhys) through bulletproof glass he sees you and fires - and every round stops in the glass', () => {
  const { S, g } = facing(0);
  const you = youAt([16, 0, 8.3]);
  const mid = [(g.pos[0] + you.pos[0]) / 2, (g.pos[2] + you.pos[2]) / 2];
  const along = Math.abs(you.pos[0] - g.pos[0]) > Math.abs(you.pos[2] - g.pos[2]) ? 'x' : 'z';
  const pane = along === 'z' ? S.L.world.addSolid([mid[0] - 3, 0, mid[1] - 0.05], [mid[0] + 3, 3, mid[1] + 0.05], 'glass', { glass: true })
    : S.L.world.addSolid([mid[0] - 0.05, 0, mid[1] - 3], [mid[0] + 0.05, 3, mid[1] + 3], 'glass', { glass: true });
  const shots = run(S, g, you, 4);
  A(g.state === 'alert' && shots.length > 0, 'he should still see you through the glass and shoot: ' + g.state + ', ' + shots.length);
  A(shots.every((s) => !s.hit && s.blocked && s.solid === pane), 'a round got through the bulletproof glass');
  // ordinary glass (it can be shot through) does not stop him
  pane.tough = 1;
  const more = run(S, g, you, 3);
  A(more.some((s) => s.hit), 'ordinary glass stopped every round');
});
T('behind a shut door he cannot see you, so he does not fire', () => {
  const { S, g } = facing(0);
  g.awareness = 1; g.state = 'alert'; g.stim = [15.5, 0, 10.8];
  const shots = run(S, g, youAt([15.5, 0, 10.8]), 3);
  A(shots.length === 0, 'fired through a shut door: ' + shots.length);
});
T('dead or knocked out, he stops', () => {
  const { S, g } = facing(0);
  const you = youAt([16, 0, 8.3]);
  run(S, g, you, 1.8);
  g.target.hp = 0; g.target.down = true;
  const shots = run(S, g, you, 2);
  A(g.dead && shots.length === 0, 'fired while down: ' + shots.length);
});

console.log('\n-- HOW WELL HE SHOOTS --');
T('closer is deadlier; crouched, prone, moving and half hidden are all safer', () => {
  const still = { stance: 0, speed: 0 };
  const near = hitChance(5, still, 1, 2), far = hitChance(28, still, 1, 2);
  A(near > far * 2.5, 'range: ' + near.toFixed(2) + ' vs ' + far.toFixed(2));
  A(hitChance(10, { stance: 1, speed: 0 }, 1, 2) < hitChance(10, still, 1, 2), 'crouching should help');
  A(hitChance(10, { stance: 2, speed: 0 }, 1, 2) < hitChance(10, { stance: 1, speed: 0 }, 1, 2), 'prone should help more');
  A(hitChance(10, { stance: 0, speed: 7 }, 1, 2) < hitChance(10, still, 1, 2) * 0.6, 'sprinting should help');
  A(hitChance(10, still, 0.5, 2) === hitChance(10, still, 1, 2) / 2, 'half hidden should halve it');
  A(hitChance(10, still, 1, 0) < hitChance(10, still, 1, 2), 'his first rounds should be less sure');
  A(near <= FIGHT.hitBase + 1e-9, 'never better than the base chance');
});

console.log('\n-- SHOT AT --');
T('shot from behind, he cries out and turns to find you', () => {
  const S = setup(0.5); const g = S.L.guards.find((x) => x.id === 'security');
  g.yaw = 0; g.home.yaw = 0;                           // facing north; you are south of him
  const you = youAt([16, 0, 7.5]);
  run(S, g, you, 0.1);
  g.target.hp -= 20;                                   // a round in the back
  run(S, g, you, 2.5);
  A(S.barks.includes('hit'), 'no cry: ' + S.barks.join(','));
  A(g.state === 'alert', 'should have turned and seen you: ' + g.state + ' yaw ' + g.yaw.toFixed(2));
});
T('a line is never the same as the last one of its kind, when there is a choice', () => {
  for (const k of Object.keys(LINES)) {
    if (LINES[k].length < 2) continue;
    for (const r of [0, 0.3, 0.6, 0.99]) { const last = lineFor(k, () => r); A(lineFor(k, () => r, last) !== last, k + ' repeated'); }
  }
});
T('once the building is on alert, "nothing here" lines give way to alert ones', () => {
  const S = setup(0.5); const g = S.L.guards[0];
  const calm = S.ctx(null), alert = Object.assign(S.ctx(null), { alerted: true });
  g.say(calm, 'nothing'); g.say(alert, 'nothing');
  A(S.barks[0] === 'nothing' && S.barks[1] === 'nothingAlert', S.barks.join(','));
  for (const k of Object.values(ON_ALERT)) A(LINES[k] && LINES[k].length >= 2, k);
  A(!LINES.nothingAlert.some((l) => /pipes|nothing\.$/i.test(l) && /pipes/i.test(l)), 'no pipes on alert');
});
T('every kind of line has a few ways of being said', () => {
  for (const [k, list] of Object.entries(LINES)) A(list.length >= 2, k + ' has only ' + list.length);
});

console.log('\n-- FLASHBANGS AND SMOKE --');
T('a flashbang in front of him: blind for seconds - no seeing you, no shooting - then he goes looking', () => {
  const { S, g } = facing(0);
  const bang = [16, 1, 5.5];                                      // 2.3 m in front of him
  const t = g.flash(bang, 9, 4.5, S.ctx(null));
  A(t > 2.5 && S.barks.includes('flashed'), 'blinded for ' + t.toFixed(2) + ' s; said ' + S.barks.join(','));
  // you walk right up in front of him: at no moment does he see you, or fire
  let sawYou = false; const shots = [];
  for (let i = 0; i < Math.round((t - 0.3) / DT); i++) { g.step(DT, S.ctx(youAt([16, 0, 8.3]))); sawYou = sawYou || g.seeing; shots.push(...g.events); g.events.length = 0; }
  A(!sawYou && shots.length === 0 && g.state !== 'alert', 'while blind he ' + (shots.length ? 'fired' : sawYou ? 'saw you' : 'was alerted'));
  A(g.animState().hurt, 'he should be staggering');
  run(S, g, youAt([38, 0, 18]), 1);                               // sight back; you have gone
  A(g.state === 'search' && !g.animState().hurt, 'after: ' + g.state);
});
T('a wall between him and the flash spares him; looking away helps', () => {
  const { S, g } = facing(0);
  A(g.flash([15.5, 1, 10.8], 9, 4.5, S.ctx(null)) === 0, 'blinded through the office wall and a shut door');
  const a = facing(0), b = facing(0);
  a.g.yaw = Math.PI; b.g.yaw = 0;                                 // one faces it, one has his back to it
  const toward = a.g.flash([16, 1, 6.5], 9, 4.5, a.S.ctx(null)), away = b.g.flash([16, 1, 6.5], 9, 4.5, b.S.ctx(null));
  A(toward > away * 1.5, 'facing ' + toward.toFixed(2) + ' vs away ' + away.toFixed(2));
});
T('he cannot see you through smoke', () => {
  const { S, g } = facing(0);
  const you = youAt([16, 0, 8.3]);
  const smoky = (y) => Object.assign(S.ctx(y), { smokes: [{ pos: [16, 1.5, 5.8], r: 2 }] });
  for (let i = 0; i < 120; i++) g.step(DT, smoky(you));
  A(g.awareness < 0.05, 'saw you through smoke: ' + g.awareness.toFixed(2));
  run(S, g, you, 2);                                               // the smoke clears
  A(g.state === 'alert', 'without smoke he should see you: ' + g.state);
});

console.log('\n-- TAKEDOWNS --');
T('behind him and unseen: a takedown; in front of him, or once he has you, no', () => {
  const S = setup(0.5); const g = S.L.guards.find((x) => x.id === 'security');
  g.yaw = 0;                                                   // looking north
  A(g.canBeTakenDown([16, 0, 4.3]), 'from right behind him');
  A(g.canBeTakenDown([16.9, 0, 4.0]), 'from behind and to the side');
  A(!g.canBeTakenDown([16, 0, 2.2]), 'from in front of him');
  A(!g.canBeTakenDown([16, 0, 5.5]), 'from 2.3 m away');
  A(!g.canBeTakenDown([16, 3.6, 4.3]), 'from the floor above');
  g.state = 'alert';
  A(!g.canBeTakenDown([16, 0, 4.3]), 'once he is alert');
});
T('a takedown needs a clear reach: not through a wall', () => {
  const S = setup(0.5); const g = S.L.guards.find((x) => x.id === 'security');
  g.yaw = 0;
  A(g.canBeTakenDown([16, 0, 4.3], S.L.world), 'from right behind him in the open');
  S.L.world.addSolid([15, 0, 4.12], [17, 2.5, 4.2], 'wall');   // a wall between you
  A(!g.canBeTakenDown([16, 0, 4.3], S.L.world), 'through a wall');
  A(g.canBeTakenDown([16, 0, 4.3]), 'with no world given it is as before');
});
T('a blinded guard can be taken down from any side', () => {
  const S = setup(0.5); const g = S.L.guards.find((x) => x.id === 'security');
  g.yaw = 0; g.dazed = true;
  A(g.canBeTakenDown([16, 0, 2.2]), 'from in front, while he is blind');
});
T('bare hands knock him out; a knife kills', () => {
  const a = setup(0.5).L.guards[0], b = setup(0.5).L.guards[0];
  a.takenDown(false); a.step(DT, {});
  b.takenDown(true); b.step(DT, {});
  A(a.dead && a.knockedOut && a.takenDownBy === 'hands', 'hands: ko=' + a.knockedOut);
  A(b.dead && !b.knockedOut && b.takenDownBy === 'knife', 'knife: ko=' + b.knockedOut);
});

console.log('\n-- ROUTES --');
T('route-finding is rationed: none left this frame, he waits; he re-plans at most once a second', () => {
  const S = setup(0.5); const g = S.L.guards.find((x) => x.id === 'security');
  g.temper = 'bold'; g.awareness = 0.7; g.stim = [30, 0, 10.5]; g.state = 'search'; g.since = 0;
  const c = Object.assign(S.ctx(youAt([38, 0, 18])), { pathBudget: { left: 0 } });
  g.step(DT, c);
  A(!g.path && g.pos[0] === 16, 'planned without a budget');
  const c2 = Object.assign(S.ctx(youAt([38, 0, 18])), { pathBudget: { left: 1 } });
  g.step(DT, c2);
  A(g.path && c2.pathBudget.left === 0, 'should plan and use the budget');
  g.path = null;
  const c3 = Object.assign(S.ctx(youAt([38, 0, 18])), { pathBudget: { left: 1 } });
  g.step(DT, c3);
  A(!g.path && c3.pathBudget.left === 1, 're-planned within a second');
});

console.log('\n-- RANKS, WEAPONS, TEMPERAMENT --');
T('every guard has a rank (a hat), a weapon and a temperament; there is an officer', () => {
  const S = setup(0.5);
  for (const g of S.L.guards) A(RANKS[g.rank] && ARMS[g.armsName] && (g.temper === 'bold' || g.temper === 'steady'), g.id);
  A(S.L.guards.some((g) => g.rank === 'officer'), 'no officer');
  A(new Set(S.L.guards.map((g) => g.armsName)).size === 3, 'weapons: ' + [...new Set(S.L.guards.map((g) => g.armsName))]);
  A(new Set(S.L.guards.map((g) => RANKS[g.rank].hat)).size === 3, 'hats should differ by rank');
});
const fireFor = (arms, secs) => {
  const { S, g } = facing(0);
  g.armsName = arms; g.arms = ARMS[arms]; g.ammo = ARMS[arms].mag;
  return run(S, g, youAt([16, 0, 8.3]), secs);
};
T('a pistol fires single shots, slower than a carbine; a marksman rifle slowest and hardest', () => {
  const car = fireFor('carbine', 4), pis = fireFor('pistol', 4), mar = fireFor('marksman', 4);
  A(car.length > pis.length && pis.length > mar.length && mar.length >= 1, 'rounds: carbine ' + car.length + ', pistol ' + pis.length + ', marksman ' + mar.length);
  A(mar[0].damage > pis[0].damage && pis[0].damage > car[0].damage, 'damage order');
});
T('a marksman stays sure at range where a pistol is hopeless', () => {
  const still = { stance: 0, speed: 0 };
  A(hitChance(30, still, 1, 2, ARMS.marksman) > hitChance(30, still, 1, 2, ARMS.pistol) * 2, 'marksman vs pistol at 30 m');
});
T('a steady guard holds his station for trouble far off; a bold one goes to it', () => {
  const S = setup(0.5); const g = S.L.guards.find((x) => x.id === 'security');   // steady, pistol
  const far = [30, 0, 10.5];
  g.awareness = 0.7; g.stim = far.slice(); g.state = 'search'; g.since = 0;
  run(S, g, youAt([38, 0, 18]), 6);
  A(Math.hypot(g.pos[0] - 16, g.pos[2] - 3.2) < 0.7, 'steady guard left his post: ' + g.pos.map((v) => v.toFixed(1)));
  const S2 = setup(0.5); const b = S2.L.guards.find((x) => x.id === 'security');
  b.temper = 'bold';
  b.awareness = 0.7; b.stim = far.slice(); b.state = 'search'; b.since = 0;
  run(S2, b, youAt([38, 0, 18]), 6);
  A(Math.hypot(b.pos[0] - 16, b.pos[2] - 3.2) > 3, 'bold guard did not go: ' + b.pos.map((v) => v.toFixed(1)));
});
T('an officer\'s shout brings more men than a guard\'s; bold ones answer from further off', () => {
  const S = setup(0.5);
  const officer = S.L.guards.find((x) => x.rank === 'officer');
  const byGuard = raiseAlarm(S.L.guards, Object.assign({}, officer, { rank: 'guard' }), officer.pos).length;
  const S2 = setup(0.5);
  const off2 = S2.L.guards.find((x) => x.rank === 'officer');
  const byOfficer = raiseAlarm(S2.L.guards, off2, off2.pos).length;
  A(byOfficer > byGuard, 'officer ' + byOfficer + ' vs guard ' + byGuard);
  // a guard shouting outside the server room: bold men answer from further than steady ones
  const L3 = setup(0.5).L, at = [20, FLOORS[2], 9];
  const answered = raiseAlarm(L3.guards, { pos: at, rank: 'guard' }, at);
  const dist = (g) => Math.hypot(g.pos[0] - at[0], g.pos[2] - at[2]);
  A(answered.some((g) => g.temper === 'bold' && dist(g) > 12), 'no bold guard answered from beyond 12 m');
  A(!answered.some((g) => g.temper === 'steady' && dist(g) > 12.01), 'a steady guard answered from too far');
});

console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + ')' : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
