// FRONTLINE - glass that breaks (M6.33): a kit window is a pane of its own, linked to its solid; a round through
// ordinary glass reports the pane, and once it is broken (its solid disabled) nothing meets it.
import { DRAFTS } from '../src/game/levels/drafts/index.js';
import { buildKitLevel } from '../src/game/levels/kit.js';
import { Arsenal } from '../src/sim/arms/weapons.js';
import { Loadout } from '../src/sim/arms/loadout.js';
import { readFileSync } from 'fs';
let n = 0, bad = 0;
const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL', m); } };
const L = buildKitLevel(DRAFTS.find((d) => d.id === 'embassy'));
ok(L.panes.length > 4, 'the embassy has panes: ' + L.panes.length);
const pn = L.panes[0];
ok(pn.solid && pn.solid.glass && pn.solid.pane === pn && L[('pane0')] === pn, 'a pane knows its solid');
ok(L.pieces.some((p) => p.pane === 'pane0') && !L.pieces.some((p) => p.prop === 'pane0'), 'and is drawn with the panes (one mesh, rebuilt as they break)');
const rsrc = readFileSync(new URL('../src/game/draw/render.js', import.meta.url), 'utf8');
ok(/const panePieces = level\.pieces\.filter\(\(p\) => p\.pane/.test(rsrc) && /drawPanes\(\)/.test(rsrc), 'render draws them together');
ok(pn.takes === 1, 'ordinary glass breaks at the first round');
// a round straight through it, from a metre and a half off, square on
const s = pn.solid, c = [(s.min[0] + s.max[0]) / 2, (s.min[1] + s.max[1]) / 2, (s.min[2] + s.max[2]) / 2];
const thin = s.max[0] - s.min[0] < s.max[2] - s.min[2] ? 0 : 2;
const from = c.slice(); from[thin] -= 1.5; const dir = [0, 0, 0]; dir[thin] = 1;
const a = new Arsenal(L.world, { loadout: new Loadout({ primary: 'K7' }), start: 'K7' });
a.events.length = 0; a.trace(from, dir, 6);
ok(a.events.some((e) => e.type === 'pierce' && e.solid === s), 'the round goes through the pane, and says so');
s.disabled = true; a.events.length = 0; a.trace(from, dir, 6);
ok(!a.events.some((e) => e.solid === s), 'broken, nothing meets it');
ok(!L.world.raycast(from, dir, 3, null) || L.world.raycast(from, dir, 3, null).solid !== s, 'nor does a look');
const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
ok(/pn\.hits >= pn\.takes/.test(main) && /ev\.solid\.disabled = true/.test(main), 'main breaks it');
// (M6.52) a spec's own glass: the museum's display cases are panes too (kit.pane)
const M = buildKitLevel(DRAFTS.find((d) => d.id === 'museum'));
const cases = M.panes.filter((q) => q.solid.max[1] - q.solid.min[1] < 0.9);
ok(cases.length >= 12, 'the museum\'s cases are panes: ' + cases.length);
console.log(bad ? `${bad} of ${n} FAILED` : `ALL ${n} PASSED`);
if (bad) process.exit(1);
