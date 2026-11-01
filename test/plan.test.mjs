// FRONTLINE - the mission map (draw/plan_map.js, M6.49): every first draft carries its floor plans; the right floor
// is chosen; the squares are coloured as they should be; drawing it does not throw.
import { DRAFTS } from '../src/game/levels/drafts/index.js';
import { buildKitLevel } from '../src/game/levels/kit.js';
import { cellColour, floorAt, drawPlan } from '../src/game/draw/plan_map.js';
import { readFileSync } from 'fs';
let n = 0, bad = 0;
const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL', m); } };
for (const id of ['ministry', 'dalmar', 'embassy', 'kaldberg']) {
  const L = buildKitLevel(DRAFTS.find((d) => d.id === id));
  ok(L.plan && L.plan.floors.length >= 1 && L.plan.floors.every((f) => f.rows.length > 4), id + ': plans');
  // a fake canvas that counts what is drawn
  let rects = 0; const noop = () => {};
  const ctx = { fillRect: () => rects++, beginPath: noop, arc: noop, fill: noop, stroke: noop, moveTo: noop, lineTo: noop, closePath: noop, save: noop, restore: noop, translate: noop, rotate: noop, fillText: noop };
  const f = drawPlan(ctx, 800, 400, L.plan, L.world.spawn.pos[1], { you: { x: L.world.spawn.pos[0], z: L.world.spawn.pos[2], yaw: 0 }, objectives: [[0, 0, 0]], out: [0, 0], devices: [] });
  ok(rects > 100 && f, id + ': drawn (' + rects + ' squares)');
}
const plan = { cell: 1.5, floors: [{ key: 'G', y: 0, rows: ['#'] }, { key: '1', y: 4.2, rows: ['#'] }, { key: 'B', y: -3.8, rows: ['#'] }] };
ok(floorAt(plan, 0).key === 'G' && floorAt(plan, 4.3).key === '1' && floorAt(plan, -3.7).key === 'B' && floorAt(plan, 3.0).key === 'G', 'the floor you are on');
ok(floorAt(plan, 3.6).key === '1', 'half way up a stair, the floor you are coming to');
ok(cellColour('#') !== cellColour('.') && cellColour('W') !== cellColour('#') && cellColour('D') !== cellColour('.'), 'walls, windows, doors, floor');
ok(cellColour(' ', true) && !cellColour(' ', false), 'outdoors on the ground floor; open air above');
const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
ok(/inp\.planPressed/.test(main) && /drawPlan\(pm\.getContext\('2d'\)/.test(main), 'wired to B');
console.log(bad ? `${bad} of ${n} FAILED` : `ALL ${n} PASSED`);
if (bad) process.exit(1);
