// FRONTLINE - the skills tree (M6.29): experience from missions, points, ranks, and what they do.
const store = {};
global.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
global.sessionStorage = { v: {}, getItem(k) { return this.v[k] ?? null; }, setItem(k, x) { this.v[k] = String(x); } };
const { XP, SKILLS, xpFor, pointsAt, pointsLeft, train, effects } = await import('../src/sim/play/skills.js');
const Saves = await import('../src/game/core/saves.js');
const { Player, blankInput } = await import('../src/sim/people/player.js');
const { World } = await import('../src/sim/world/world.js');
const { readFileSync } = await import('fs');
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const src = (f) => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');

T('experience: more for success, for each objective and each new trophy; a point every so much', () => {
  A(xpFor({ result: 'success', objectives: 3, trophies: 1 }) === XP.success + 3 * XP.objective + XP.trophy, 'sums');
  A(xpFor({ result: 'failed' }) < xpFor({ result: 'partial' }) && xpFor({ battle: true, won: true }) > xpFor({ battle: true, won: false }), 'order');
  A(pointsAt(XP.perPoint * 2 + 1) === 2 && pointsAt(0) === 0, 'points');
});
T('training: a point a rank, no more than a skill has, no more than you have', () => {
  let s = { xp: XP.perPoint * 2, ranks: {} };
  s = train(s, 'hacker'); A(s && s.ranks.hacker === 1 && pointsLeft(s) === 1, 'first');
  s = train(s, 'hacker'); A(s.ranks.hacker === 2 && pointsLeft(s) === 0, 'second');
  A(train(s, 'tough') === null, 'trained with no points');
  A(train({ xp: XP.perPoint * 9, ranks: { breacher: SKILLS.breacher.ranks } }, 'breacher') === null, 'past full');
  A(train({ xp: 9999, ranks: {} }, 'nonsense') === null, 'no such skill');
});
T('what ranks do: multipliers that grow with rank (1 at none)', () => {
  const none = effects({ ranks: {} }), full = effects({ ranks: { hacker: 3, ghost: 3, tough: 3, reload: 3 } });
  A(Object.values(none).every((v) => v === 1), 'rank 0 changes something');
  A(full.hacker > 1 && full.ghost < 1 && full.tough < 1 && full.reload < 1, JSON.stringify(full));
});
T('per run, in the save slot; erased with it', () => {
  Saves.addXp(2, 400); A(Saves.loadSkills(2).xp === 400 && Saves.loadSkills(3).xp === 0, 'leaked');
  Saves.clearSlot(2); A(Saves.loadSkills(2).xp === 0, 'not erased');
});
T('Hard to Kill: you take less damage (not from a fall)', () => {
  const w = new World(); w.addSolid([-10, -1, -10], [10, 0, 10], 'floor');
  const p = new Player(w); p.pos = [0, 0, 0]; p.skills = effects({ ranks: { tough: 3 } });
  p.damage(50, 'shot'); A(Math.abs(p.health - (100 - 50 * SKILLS.tough.mul(3))) < 1e-6, 'health ' + p.health);
});
T('wired in: the debrief gives experience; the menu trains; the hacks, the kicks, the spread, the reloads use it', () => {
  const rt = src('game/levels/mission_runtime.js'), mn = src('game/main.js'), wp = src('sim/arms/weapons.js');
  A(/Saves\.addXp\(Saves\.currentSlot\(\), rt\.xpGained\)/.test(rt) && /row\('Experience'/.test(rt), 'no experience');
  A(/player\.skills\.hacker/.test(rt) && /player\.skills\.breacher/.test(rt) && /player\.skills\.shadow/.test(rt), 'not in the runtime');
  A(/function drawSkills/.test(mn) && /trainSkill\(/.test(mn) && /applySkills\(Saves\.currentSlot\(\)\)/.test(mn), 'no Skills tab');
  A(/this\.skills\.steady/.test(wp) && /this\.skills\.reload/.test(wp), 'not in the arsenal');
});
T('the rebreather: under water, no breath lost', () => {
  const w = new World(); w.addSolid([-10, -6, -10], [10, -5, 10], 'floor'); w.addWater([-10, -5, -10], [10, 0, 10]);
  for (const mul of [1, 0]) {
    const p = new Player(w); p.pos = [0, -5, 0]; p.mode = 'swim'; p.breathMul = mul;
    for (let i = 0; i < 120; i++) p.step(1 / 60, Object.assign(blankInput(), { yaw: 0, pitch: -1 }));
    A(mul ? p.breath < 24.5 : p.breath >= 24.99, 'breath ' + p.breath.toFixed(2) + ' with ' + mul);
  }
});
console.log(fails.length ? '\nFAILURES (' + fails.length + '):\n' + fails.map((f) => '  * ' + f).join('\n') : '\nALL ' + pass + ' PASSED');
