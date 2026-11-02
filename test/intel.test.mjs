// FRONTLINE - papers to read in the first drafts (M6.58): each on something, on a real floor, with words.
import { DRAFTS } from '../src/game/levels/drafts/index.js';
import { buildKitLevel } from '../src/game/levels/kit.js';
let n = 0, bad = 0;
const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL', m); } };
let count = 0;
for (const d of DRAFTS.filter((q) => q.intel && q.intel.length)) {
  const L = buildKitLevel(d);
  ok(L.intel.length === d.intel.length, d.id + ': all built');
  for (const it of L.intel) {
    count++;
    const under = L.world.groundBelow(it.pos[0], it.pos[1] + 0.05, it.pos[2], 0.05);
    ok(under !== null && Math.abs(under - it.pos[1]) < 0.12, d.id + ': ' + it.id + ' lies on something (' + under + ' vs ' + it.pos[1].toFixed(2) + ')');
    ok(it.title && it.kind && it.text.length, d.id + ': ' + it.id + ' has words');
  }
}
ok(count >= 16, 'papers: ' + count);
console.log(bad ? `${bad} of ${n} FAILED` : `ALL ${n} PASSED`);
if (bad) process.exit(1);
