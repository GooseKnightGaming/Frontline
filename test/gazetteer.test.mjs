// FRONTLINE - the gazetteer (M6.125.3): every level placed in a region of the world, every region real
import { DRAFTS } from '../src/game/levels/drafts/index.js';
import { REGIONS, PLACES, levelsIn } from '../src/game/world/gazetteer.js';
let fails = 0;
const A = (ok, msg) => { if (!ok) { fails++; console.log('  FAIL  ' + msg); } };
for (const d of DRAFTS) A(PLACES[d.id] && REGIONS[PLACES[d.id].region], `level ${d.no} ${d.id} has no region in the gazetteer (src/game/world/gazetteer.js)`);
for (const id of Object.keys(PLACES)) A(DRAFTS.some((d) => d.id === id), `the gazetteer places ${id}, which is no level`);
for (const r of Object.keys(REGIONS)) A(levelsIn(r).length > 0, `region ${r} has no levels`);
const guesses = Object.keys(PLACES).filter((id) => PLACES[id].guess).length;
if (fails) { console.log(fails + ' failed'); process.exit(1); }
console.log(`  PASS  the gazetteer: ${DRAFTS.length} levels in ${Object.keys(REGIONS).length} regions (${guesses} placed by a guess, for Rhys to confirm)`);
