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
ok(!trailDone(cx, ['codex:museum']) && trailDone(cx, cx.steps.map((b) => trailMark(cx, b.level))), 'the Codex done when both are');
const k = byId[FINAL];
ok(k && k.guards.some((g) => g.card) && k.guards.some((g) => g.dog) && k.guards.some((g) => g.reserve) && k.guards.some((g) => g.shield), 'Kaldberg uses the specialists');
ok(k && ['camera', 'turret', 'lock', 'laser', 'lights', 'alarm'].every((kind) => k.devices.some((d) => d.kind === kind)), 'Kaldberg has every kind of device');

console.log(bad ? `${bad} of ${n} FAILED` : `ALL ${n} PASSED`);
if (bad) process.exit(1);
