// FRONTLINE - the world (M7.0.0): regions known and their heat (sim/play/world.js), and the journeys - the first drive
// into each region (game/world/journeys.js) - each one building, and its road open from the van to the region's edge.
import * as World from '../src/sim/play/world.js';
import { makeJourney, ROADS, JOURNEY_REGIONS } from '../src/game/world/journeys.js';
import { REGIONS, PLACES } from '../src/game/world/gazetteer.js';
import { buildKitLevel } from '../src/game/levels/kit.js';
import { NavGrid } from '../src/sim/world/nav.js';

let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n + ' -> ' + e.message); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };

console.log('-- the world: known regions --');
T('a new run knows nothing: every region but nowhere needs the drive first', () => {
  const w = World.emptyWorld();
  for (const r of Object.keys(REGIONS)) A(World.needsDrive(w, r) === (r !== 'elsewhere'), r);
});
T('driven into, a region is known: no more drive, and it stays known', () => {
  let w = World.markKnown(World.emptyWorld(), 'north');
  A(!World.needsDrive(w, 'north') && World.needsDrive(w, 'kessin'), 'north known, kessin not');
  w = World.markKnown(w, 'north'); A(w.known.filter((q) => q === 'north').length === 1, 'once');
});
T('a bad save reads as an empty world', () => { A(World.normalise(null).known.length === 0 && World.normalise({ known: 3 }).known.length === 0); });

console.log('-- the world: heat --');
T('an alarm and bodies heat a region; a quiet success cools it; other regions cool a little', () => {
  let w = World.emptyWorld();
  w = World.afterMission(w, 'varnholm', { result: 'success', alarm: true, kills: 4 });
  A(World.heatOf(w, 'varnholm') === 32, 'alarm 20 + 4 kills 12 = ' + World.heatOf(w, 'varnholm'));
  w = World.afterMission(w, 'kessin', { result: 'success', alarm: false, kills: 0 });
  A(World.heatOf(w, 'varnholm') === 29 && World.heatOf(w, 'kessin') === 0, 'elsewhere cools by 3; quiet never below 0');
  w = World.afterMission(w, 'varnholm', { result: 'success' });
  A(World.heatOf(w, 'varnholm') === 14, 'a quiet success: -15 -> ' + World.heatOf(w, 'varnholm'));
});
T('heat stays 0 - 100, and a hot region notices sooner (x1 cold, x1.6 at the top)', () => {
  let w = World.emptyWorld();
  for (let i = 0; i < 10; i++) w = World.afterMission(w, 'north', { result: 'failed', alarm: true, kills: 9, civilians: 2 });
  A(World.heatOf(w, 'north') === 100, 'capped');
  A(World.noticeFactor(0) === 1 && Math.abs(World.noticeFactor(100) - 1.6) < 1e-9 && World.noticeFactor(500) === World.noticeFactor(100), 'factor');
  A(World.heatLabel(0) === 'COLD' && World.heatLabel(20) === 'WATCHED' && World.heatLabel(50) === 'HUNTED' && World.heatLabel(90) === 'MANHUNT', 'labels');
});

console.log('-- the journeys --');
T('every region a job can be in has a road (nowhere has none)', () => {
  for (const r of Object.keys(REGIONS)) A(r === 'elsewhere' ? !ROADS[r] : !!ROADS[r], r);
  for (const id of Object.keys(PLACES)) A(PLACES[id].region === 'elsewhere' || JOURNEY_REGIONS.includes(PLACES[id].region), id);
});
for (const r of JOURNEY_REGIONS) {
  T('the road into ' + REGIONS[r].name + ': builds; the van at the start; the road open on foot from the van to the end; the stop reachable', () => {
    const spec = makeJourney(r, 'pass');
    A(spec && spec.journey.region === r && spec.journey.to === 'pass', 'its journey');
    const L = buildKitLevel(spec);
    A(L.drivables.length === 1 && L.drivables[0].id === 'ghostvan', 'the van');
    const nav = new NavGrid(L.world, L.navFloors, L.navLinks); nav.maxSteps = L.testNavCap || L.navCap;
    const C = spec.cell || 1.5, at = (x, y) => [(x + 0.5) * C, 0.05, (y + 0.5) * C];
    const from = at(spec.start.x, spec.start.y);
    for (const [x, y, what] of [[146, 12, 'the end'], [70, 9, 'the stop\'s door'], [69, 5, 'the person at the stop']]) {
      const p = nav.find(from, at(x, y)); A(p && p.length, 'no way to ' + what);
    }
    // the carriageway clear for the van: nothing solid on rows 10 - 13 from end to end (above the tarmac)
    for (let x = 1; x < 149; x++) for (let y = 10; y <= 13; y++) {
      const hs = L.world.hits([(x + 0.2) * C, 0.2, (y + 0.2) * C], [(x + 0.8) * C, 1.6, (y + 0.8) * C]).filter((s) => !s.person && !s.target && s.tag !== 'vehicle' && !s.rider);
      A(!hs.length, 'something on the road at [' + x + ',' + y + ']: ' + hs.map((s) => s.tag).join(','));
    }
  });
}

console.log(fails.length ? '\n' + fails.length + ' FAILED:\n' + fails.join('\n') : '\nall ' + pass + ' passed');
if (fails.length) process.exit(1);
