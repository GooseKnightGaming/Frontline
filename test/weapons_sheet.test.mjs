// FRONTLINE - the weapon stats sheet (tools/weapons_sheet.mjs, M6.32): every gun and every attachment on it, and
// no figure left undefined.
import { weaponsSheet, isGun, isKit, isWorn, dps } from '../tools/weapons_sheet.mjs';
import { ITEMS, MODS } from '../src/sim/arms/loadout.js';
let n = 0, bad = 0;
const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL', m); } };
const html = weaponsSheet('TEST');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
for (const [id, it] of Object.entries(ITEMS)) {
  if (it.hidden) continue;
  if (isGun(it) || isKit(it) || isWorn(it)) ok(html.includes(esc(it.name)), 'on the sheet: ' + id);
  if (isGun(it)) ok(Number.isFinite(dps(it)), 'damage a second: ' + id);
}
for (const m of Object.values(MODS)) ok(html.includes(esc(m.name)), 'attachment: ' + m.name);
ok(!/undefined|NaN/.test(html), 'no undefined or NaN');
ok(html.includes('Frontline TEST'), 'carries the version');
ok(dps({ damage: 10, rate: 0.5, burst: 3 }) === 60, 'a burst counts every round');
ok(dps({ damage: 10, pellets: 8, rate: 1 }) === 80, 'a shotgun counts every pellet');
console.log(bad ? `${bad} of ${n} FAILED` : `ALL ${n} PASSED`);
if (bad) process.exit(1);
