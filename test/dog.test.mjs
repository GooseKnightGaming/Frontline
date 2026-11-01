// FRONTLINE - the guard dog (M6.30): it smells you, barks, runs at you and bites; walls cut its nose to close by.
import { makeDog, DOG } from '../src/sim/people/dog.js';
import { World } from '../src/sim/world/world.js';
import { Guard } from '../src/sim/people/guard.js';
import { buildKitLevel } from '../src/game/levels/kit.js';
import { DRAFTS } from '../src/game/levels/drafts/index.js';
import { readFileSync } from 'fs';
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const run = (d, secs, ctx) => { for (let i = 0; i < Math.round(secs * 60); i++) d.step(1 / 60, ctx); };

T('at heel: it keeps by its handler', () => {
  const w = new World(), h = new Guard(w, { id: 'h', pos: [0, 0, 0] });
  const d = makeDog(w, { pos: [5, 0, 5], handler: h });
  run(d, 4, { world: w, you: { pos: [40, 0, 40], dead: false } });
  A(Math.hypot(d.pos[0] - h.pos[0], d.pos[2] - h.pos[2]) < 2.2 && d.state === 'heel', 'it wandered: ' + d.pos.map((v) => v.toFixed(1)));
});
T('it smells you near - barks once to raise the alarm, runs at you, bites', () => {
  const w = new World(), h = new Guard(w, { id: 'h', pos: [0, 0, 0] });
  const d = makeDog(w, { pos: [1, 0, 0], handler: h });
  let alarms = 0, bites = 0;
  const ctx = { world: w, you: { pos: [7, 0, 0], dead: false }, alarm: () => alarms++, bite: () => bites++ };
  run(d, 3, ctx);
  A(d.state === 'alert' && alarms === 1, 'state ' + d.state + ', alarms ' + alarms);
  A(bites >= 1, 'no bite');
  A(d.events.some((e) => e.type === 'bark'), 'no bark');
});
T('a wall between: it smells you only close by', () => {
  const w = new World(); w.addSolid([3, 0, -5], [3.3, 3, 5], 'wall');
  const d = makeDog(w, { pos: [0, 0, 0] });
  A(!d.smells({ pos: [6, 0, 0] }, w) && d.smells({ pos: [6, 0, 0] }, null), 'smelt through the wall');
  A(d.smells({ pos: [2.5, 0, 0] }, w), 'not even close by');
  A(!d.smells({ pos: [20, 0, 0] }, null), 'from too far');
});
T('shot or darted, it goes down', () => {
  const w = new World(), d = makeDog(w, { pos: [0, 0, 0] });
  d.target.down = true; d.target.downBy = 'shot'; d.target.lethalHit = false;
  run(d, 0.1, { world: w, you: { pos: [1, 0, 0] } });
  A(d.dead && d.asleep && d.solid.disabled, 'still up');
});
T('in the levels: the handlers have their dogs; the runtime steps and draws them', () => {
  for (const id of ['listening', 'yacht', 'prison']) A(buildKitLevel(DRAFTS.find((x) => x.id === id)).guards.some((g) => g.hasDog), id + ': no dog');
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(/guards\.filter\(\(g\) => g\.hasDog\)\.map/.test(rt) && /dogsStep\(simDt\); drawDogs\(simDt\)/.test(rt), 'not in the runtime');
});
console.log(fails.length ? '\nFAILURES (' + fails.length + '):\n' + fails.map((f) => '  * ' + f).join('\n') : '\nALL ' + pass + ' PASSED');
