// FRONTLINE - checkpoints (M6.46): the debrief of a failed first draft offers a retry keeping what was done; the
// runtime puts it back. (Source checks: the runtime needs a browser.)
import { readFileSync } from 'fs';
let n = 0, bad = 0;
const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL', m); } };
const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
ok(html.includes('id="mend-cp"'), 'the button');
ok(/level\.draft && m\.result === 'failed' \? cpDone\(\)/.test(rt), 'offered only when a first draft failed');
ok(/sessionStorage\.setItem\(CP_KEY/.test(rt) && /sessionStorage\.removeItem\(CP_KEY\)/.test(rt), 'kept for the reload, and used once');
ok(/cp\.level === level\.draft && Date\.now\(\) - \(cp\.at \|\| 0\) < 30 \* 60 \* 1000/.test(rt), 'only for the same mission, and not stale');
ok(/cp\.terminals\.includes\(t\.id\)\) t\.done = true/.test(rt) && /cp\.pickups\.includes\(p\.id\)\) \{ p\.taken = true/.test(rt), 'what was done is done');
// it is put back after the things to take are drawn (so they can be hidden)
ok(rt.indexOf("p.ent = e; p.mat = pm;") < rt.indexOf("cp.pickups.includes(p.id)"), 'after the pickups are drawn');
console.log(bad ? `${bad} of ${n} FAILED` : `ALL ${n} PASSED`);
if (bad) process.exit(1);
