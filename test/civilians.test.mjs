// FRONTLINE - civilians in the first drafts (M6.54): built where they stand, standing on something, with words.
import { DRAFTS } from '../src/game/levels/drafts/index.js';
import { buildKitLevel } from '../src/game/levels/kit.js';
import { readFileSync } from 'fs';
let n = 0, bad = 0;
const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL', m); } };
for (const d of DRAFTS.filter((q) => q.civilians && q.civilians.length)) {
  const L = buildKitLevel(d), cs = L.npcs.filter((q) => q.kind === 'civilian');
  ok(cs.length === d.civilians.length, d.id + ': all built');
  for (const c of cs) {
    const g = L.world.groundBelow(c.pos[0], c.pos[1] + 0.3, c.pos[2], 0.2);
    ok(g !== null && Math.abs(g - c.pos[1]) < 0.35, d.id + ': ' + c.id + ' stands on something');
    ok(!L.world.hit([c.pos[0] - 0.25, c.pos[1] + 0.1, c.pos[2] - 0.25], [c.pos[0] + 0.25, c.pos[1] + 1.7, c.pos[2] + 0.25]), d.id + ': ' + c.id + ' is not inside anything');
    ok(c.says && c.says.length, d.id + ': ' + c.id + ' has something to say');
    for (const gd of d.guards) for (const p of gd.route || []) ok(!(p[0] === Math.floor(c.pos[0] / 1.5) && p[1] === Math.floor(c.pos[2] / 1.5)), d.id + ': ' + c.id + ' not on ' + gd.id + '\'s route corner');
  }
}
const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
ok(/n\.kind === 'civilian'/.test(rt) && /m\.civiliansHit/.test(rt), 'talked to, and counted when knocked down');
ok(/n\.kind === 'civilian' && Math\.hypot\(n\.pos\[0\] - ev\.from\[0\], n\.pos\[2\] - ev\.from\[2\]\) < 30\) n\.cower = true/.test(rt) && /stance: o\.cower \? 1 : 0/.test(rt), 'a shot near them and they get down');
console.log(bad ? `${bad} of ${n} FAILED` : `ALL ${n} PASSED`);
if (bad) process.exit(1);
