import { readFileSync } from 'fs';
// FRONTLINE - the case (sim/play/caseboard.js): every clue points at a real level and a real terminal or pickup;
// the final mission exists and is gated.
import { CASE, CASE_NEEDS, FINAL, cluesFrom, caseOpen, caseClosed, CLOSED, BLIGHT, blightMark, blightStep, blightDone, TRAILS, trailSteps, trailDone, trailMark } from '../src/sim/play/caseboard.js';
import { DRAFTS } from '../src/game/levels/drafts/index.js';

let n = 0, bad = 0;
const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL', m); } };

const byId = Object.fromEntries(DRAFTS.map((d) => [d.id, d]));
for (const c of CASE) {
  const d = byId[c.level];
  ok(d, `clue ${c.id}: level ${c.level} exists`);
  if (!d) continue;
  const refs = [...(d.terminals || []).map((t) => t.id), ...(d.pickups || []).map((p) => p.id)];
  ok(refs.includes(c.ref), `clue ${c.id}: ${c.level} has ${c.ref}`);
}
ok(new Set(CASE.map((c) => c.id)).size === CASE.length, 'clue ids unique');
ok(CASE_NEEDS <= CASE.length, 'enough clues to make the case');
ok(byId[FINAL], 'the final mission exists');
ok(byId[FINAL]?.weather === 'snow', 'Kaldberg is in the snow');
ok(!CASE.some((c) => c.level === FINAL), 'the final mission gives no clue');
ok(JSON.stringify(cluesFrom('embassy', ['keys', 'ledger'])) === '["cipher"]', 'cluesFrom picks the clue');
ok(cluesFrom('embassy', ['ledger']).length === 0, 'no clue if the thing was not done');
ok(!caseOpen([]) && !caseOpen(null) && !caseOpen(['a', 'b', 'c', 'd']), 'case shut under five');
ok(caseOpen(CASE.slice(0, 5).map((c) => c.id)), 'case open at five');
ok(!caseOpen(CASE.slice(0, 4).map((c) => c.id).concat([CLOSED, 'nonsense'])), 'only real clues count towards it');
ok(caseClosed([CLOSED]) && !caseClosed(CASE.map((c) => c.id)), 'closed only when Kaldberg is done');
// (M6.45) the blight's trail
ok(BLIGHT.every((b) => byId[b.level]), 'every step of the blight is a level');
ok(blightStep('grain') === 'blight:grain' && blightStep('embassy') === null, 'steps');
ok(!blightDone(['blight:glasshouse', 'blight:grain']) && blightDone(BLIGHT.map((b) => blightMark(b.level))), 'done when all three are');
ok(!caseOpen(BLIGHT.map((b) => blightMark(b.level)).concat(CASE.slice(0, 2).map((c) => c.id))), 'the blight\'s marks are not clues');
// (M6.54) the trails
ok(TRAILS.every((t) => t.steps.every((b) => byId[b.level])), 'every trail\'s steps are levels');
ok(JSON.stringify(trailSteps('museum')) === '["codex:museum"]' && trailSteps('grain')[0] === 'blight:grain' && !trailSteps('embassy').length, 'a mission\'s marks');
const cx = TRAILS.find((t) => t.id === 'codex');
ok(!trailDone(cx, ['codex:museum']) && trailDone(cx, cx.steps.map((b) => trailMark(cx, b.level))), 'the Codex done when all its steps are');
// (M6.66) the river: the pens, the roofs, the lock - and the lock's trophy
const rv = TRAILS.find((t) => t.id === 'river');
ok(rv && rv.steps.map((b) => b.level).join() === 'pens,rooftops,lock' && trailSteps('lock')[0] === 'river:lock', 'the river\'s steps');
ok(/level\.draft === 'lock' && m\.result === 'success'\) all\.push\(\{ id: 'river_open'/.test(readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8')), 'River Open');
// (M6.73) the forgers: the mill, the bridge
const fg = TRAILS.find((t) => t.id === 'forgers');
ok(fg && fg.steps.map((b) => b.level).join() === 'mill,holm,townhall' && trailDone(fg, ['forgers:mill', 'forgers:holm', 'forgers:townhall']) && !trailDone(fg, ['forgers:mill', 'forgers:holm']), 'the forgers');
// (M6.76) the handler
const hd = TRAILS.find((t) => t.id === 'handler');
ok(hd && hd.steps.map((b) => b.level).join() === 'market,power,docks,varna', 'the handler');
// (M6.81) the five
const fv = TRAILS.find((t) => t.id === 'five');
ok(fv && fv.steps.map((b) => b.level).join() === 'lodge,mast,gazette,airfield', 'the five');
// (M6.85) the north
const nt = TRAILS.find((t) => t.id === 'north');
ok(nt && nt.steps.map((b) => b.level).join() === 'pass,nordvik,council', 'the north');
// (M6.88) the camps
ok(TRAILS.find((t) => t.id === 'camps').steps.map((b) => b.level).join() === 'arnbridge,camp,relays', 'the camps');
// (M6.95) the coast
ok(TRAILS.find((t) => t.id === 'coast').steps.every((b) => byId[b.level]), 'the coast');
// (M6.98) Hollis
ok(TRAILS.find((t) => t.id === 'hollis').steps.map((b) => b.level).join() === 'cove,cottage,wrongbridge', 'Hollis');
// (M6.102) the colonel
ok(TRAILS.find((t) => t.id === 'colonel').steps.map((b) => b.level).join() === 'hunt,northhq,borderrun', 'the colonel');
const k = byId[FINAL];
ok(k && k.guards.some((g) => g.card) && k.guards.some((g) => g.dog) && k.guards.some((g) => g.reserve) && k.guards.some((g) => g.shield), 'Kaldberg uses the specialists');
ok(k && ['camera', 'turret', 'lock', 'laser', 'lights', 'alarm'].every((kind) => k.devices.some((d) => d.kind === kind)), 'Kaldberg has every kind of device');

console.log(bad ? `${bad} of ${n} FAILED` : `ALL ${n} PASSED`);
if (bad) process.exit(1);
