// FRONTLINE - Rhys's weapons sheet in the game: the catalogue, who carries what, darts,
// and the weapons a run brings home (node; localStorage is stubbed).
const store = {};
global.localStorage = { getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
global.sessionStorage = { v: {}, getItem(k) { return this.v[k] ?? null; }, setItem(k, x) { this.v[k] = String(x); } };
const { ITEMS, FAMILIES, statsOf } = await import('../src/sim/arms/loadout.js');
const { SHEET, MAKERS } = await import('../src/sim/arms/sheet.js');
const { issued, ISSUE, KINDS } = await import('../src/sim/arms/issue.js');
const { Guard } = await import('../src/sim/people/guard.js');
const { World } = await import('../src/sim/world/world.js');
const { Arsenal, makeTarget } = await import('../src/sim/arms/weapons.js');
const Saves = await import('../src/game/core/saves.js');
const { readFileSync } = await import('fs');
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const src = (f) => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');

T('every weapon on the sheet is in the game: 84, from ten makers', () => {
  A(Object.keys(SHEET).length === 84, Object.keys(SHEET).length + ' on the sheet');
  A(Object.keys(MAKERS).length === 10, Object.keys(MAKERS).length + ' makers');
  const missing = Object.keys(SHEET).filter((id) => !ITEMS[id]);
  A(!missing.length, 'not in the catalogue: ' + missing.join(' '));
});
T('the class kit keeps its hand tuning', () => {
  A(!ITEMS.PX19.sheet && ITEMS.PX19.damage === 27 && ITEMS.PX19.name === 'PX-19 Service Pistol', 'PX-19 overwritten');
  A(!ITEMS.HASL3.sheet && !ITEMS.KDMR3.sheet && !ITEMS.RV357.sheet, 'class kit overwritten');
});
T('each one is a working weapon: family, figures, a model', () => {
  for (const [id, it] of Object.entries(ITEMS)) {
    if (!it.sheet) continue;
    A(FAMILIES[it.family] && FAMILIES[it.family].kind === 'gun', id + ': family ' + it.family);
    A(it.damage >= 0 && it.rate > 0 && it.mag >= 1 && it.reload > 0 && it.best > 0, id + ': figures');
    A(it.spread > 0 && it.adsSpread > 0 && it.adsSpread <= it.spread, id + ': spread');
    A(['AR_1', 'Pistol_1', 'Sniper_1', 'Grenade_1'].includes(it.model) && it.like && it.length > 0, id + ': model');
    A(it.unlock === 'field' || it.unlock === 'mission', id + ': unlock ' + it.unlock);
    A(statsOf(id), id + ': no stats');
  }
});
T('shotguns spread pellets; beams run on heat; launchers burst', () => {
  A(ITEMS.RV12.pellets === 8 && ITEMS.RV12.damage > 0, 'no pellets');
  A(ITEMS.IM12B.breach && !ITEMS.IM12B.pellets, 'the breaching shotgun does not breach');
  A(ITEMS.HASL1.energy && ITEMS.HASL1.beam && ITEMS.HASL1.reserve === 0, 'no beam');
  A(ITEMS.NSR4.launcher && ITEMS.NSR4.blast > 0 && ITEMS.SGL12.launcher, 'no launchers');
  A(ITEMS.NX3.family === 'sniper' && !ITEMS.NX3.energy, 'the coil rifle is not a rifle');
});
T('the sheet\'s standard issue is found in the field; the rest is earned', () => {
  const field = Object.values(SHEET).filter((it) => it.unlock === 'field').length;
  A(field === 61, field + ' in the field');
  A(SHEET.HASL1.unlock === 'mission' && SHEET.PA95.unlock === 'mission' && SHEET.NSHM2.unlock === 'mission', 'specials not earned');
});
T('each side carries its own makers\' weapons, of the kind it fights with', () => {
  for (const f of Object.keys(ISSUE)) for (const a of Object.keys(KINDS)) for (let i = 0; i < 12; i++) {
    const id = issued(f, a, 'g' + i);
    if (!id) continue;
    A(ISSUE[f].includes(SHEET[id].maker) && KINDS[a].includes(SHEET[id].kind) && SHEET[id].unlock === 'field', f + ' ' + a + ' got ' + id);
  }
  A(issued('red', 'carbine', 'x') && issued('red', 'carbine', 'x') === issued('red', 'carbine', 'x'), 'not steady');
  A(issued('red', 'shotgun', 'x') === null && issued('yellow', 'revolver', 'x') === null && issued('staff', 'pistol', 'x') === null, 'a special weapon was swapped');
});
T('a guard carries (and so drops) his side\'s weapon; the hotel\'s breacher keeps his', () => {
  const w = new World();
  const g = new Guard(w, { id: 'lobby', pos: [0, 0, 0], faction: 'red', arms: 'carbine' });
  A(SHEET[g.item] && ISSUE.red.includes(SHEET[g.item].maker), 'carries ' + g.item);
  const b = new Guard(w, { id: 'door', pos: [5, 0, 0], faction: 'red', arms: 'shotgun' });
  A(b.item === 'BR12', 'the breacher carries ' + b.item);
  const h = new Guard(w, { id: 'mg', pos: [9, 0, 0], faction: 'red', arms: 'hmg' });
  A(h.item === null, 'the HMG man carries ' + h.item);
  A(/if \(!inHeli && g\.item\) dropAt\(g\.item/.test(src('game/levels/mission_runtime.js')), 'the drop is not his weapon');
});
T('a tranquilliser dart knocks out - it does not kill, even in the head', () => {
  const w = new World(), a = new Arsenal(w);
  let held = statsOf('PA9T');
  Object.defineProperty(a, 'weapon', { get: () => held });
  const t = makeTarget(w, [-0.3, 0, 4.8], [0.3, 1.8, 5.2], { hp: 100 });
  a.hitTarget(t, [0, 1.7, 4.8], 5, [0, 0, 1]);
  A(t.down && !t.lethalHit, 'down ' + t.down + ', lethal ' + t.lethalHit);
  const t2 = makeTarget(w, [3, 0, 4.8], [3.6, 1.8, 5.2], { hp: 100 });
  held = statsOf('AR16');
  a.hitTarget(t2, [3.3, 1.0, 4.8], 5, [0, 0, 1]);
  A(t2.lethalHit, 'a bullet is not lethal');
});
T('what a run brings home is its own, carried in its save, gone when erased', () => {
  A(Saves.addArmoury(1, ['AR16', 'NS44', 'AR16']).join() === 'AR16,NS44', 'added');
  A(Saves.addArmoury(1, ['AR16']).length === 0 && Saves.loadArmoury(2).length === 0, 'leaked or doubled');
  const snap = Saves.snapshot({ loadout: { slots: {} }, armoury: Saves.loadArmoury(1) });
  A(Saves.importCode(Saves.exportCode(snap)).data.armoury.join() === 'AR16,NS44', 'not in the save');
  Saves.clearSlot(1); A(Saves.loadArmoury(1).length === 0, 'not erased');
});
T('Logistics and the Quartermaster: only what this run has brought home; the debrief says so', () => {
  const mn = src('game/main.js'), rt = src('game/levels/mission_runtime.js');
  A(/!ITEMS\[id\]\.sheet \|\| home\.has\(id\)/.test(mn), 'unlocked() hands out the whole sheet');
  A(/Saves\.addArmoury\(Saves\.currentSlot\(\), taken\)/.test(rt) && /m\.result === 'failed' \? \[\]/.test(rt), 'captures not kept');
  A(/'Weapons captured'/.test(rt), 'the debrief does not say');
});

{
  const { REWARDS, rewardFor } = await import('../src/sim/play/rewards.js');
  const { DRAFTS } = await import('../src/game/levels/drafts/index.js');
  T('every one of the sheet\'s Unlock weapons comes from completing one mission', () => {
    const want = Object.keys(ITEMS).filter((id) => ITEMS[id].sheet && ITEMS[id].unlock === 'mission').sort();
    const given = Object.values(REWARDS).slice().sort();
    A(JSON.stringify(want) === JSON.stringify(given), 'given ' + given.join(' ') + ' / wanted ' + want.join(' '));
    const levels = new Set(['mission0', 'hotel', 'factory', 'casino', 'train'].concat(DRAFTS.map((d) => d.id)));
    const odd = Object.keys(REWARDS).filter((k) => !levels.has(k));
    A(!odd.length, 'no such mission: ' + odd.join(' '));
  });
  T('only for completing it: not for failing, not for withdrawing', () => {
    A(rewardFor('hotel', 'success') === 'PA9T' && rewardFor('hotel', 'partial') === 'PA9T', 'not given');
    A(rewardFor('hotel', 'failed') === null && rewardFor('beachhead', 'success', true) === null && rewardFor('factory_battle', 'success') === null, 'given wrongly');
    A(/rewardFor\(key, m\.result, B && B\.retreated\)/.test(src('game/levels/mission_runtime.js')) && /'Weapon earned'/.test(src('game/levels/mission_runtime.js')), 'the debrief does not give it');
  });
}
{
  const { pulse, EMP } = await import('../src/sim/arms/emp.js');
  const { Drivable } = await import('../src/sim/vehicles/drive.js');
  T('the EMP: night vision and torches dark, turrets blind, engines dead - in reach, for a while', () => {
    const w = new World();
    const near = new Guard(w, { id: 'n', pos: [3, 0, 0], faction: 'red', sees: 'nvg' });
    const far = new Guard(w, { id: 'f', pos: [40, 0, 0], faction: 'red', sees: 'nvg' });
    const tur = { turret: { pos: [0, 2, 5] } }, car = { pos: [-4, 0, 0] };
    const hit = pulse([0, 1, 0], { guards: [near, far], turrets: [tur], vehicles: [car] });
    A(hit.guards === 1 && hit.turrets === 1 && hit.vehicles === 1, JSON.stringify(hit));
    A(near.jammed === EMP.secs && !far.jammed && tur.turret.jammed === EMP.secs && car.stalled === EMP.secs, 'timers not set');
    A(!near.darkSees(20, 0) && far.darkSees(20, 0), 'his night vision still works');
    A(ITEMS.VDEMP.emp && ITEMS.VDEMP.damage === 0, 'the launcher is not an EMP');
    A(/emp: !!w\.emp/.test(src('sim/arms/weapons.js')) && /empPulse\(ev\.pos/.test(src('game/main.js')), 'the blast does not pulse');
    A(/q\.jammed > 0/.test(src('game/levels/ranges.js')) && /this\.stalled > 0/.test(src('sim/vehicles/drive.js')), 'turrets or engines ignore it');
  });
}
{
  const { gunShape, _parts } = await import('../src/game/draw/gun_models.js');
  T('the weapons drawn in code: shotguns, SMGs, machine guns, launchers and energy weapons each look like what they are', () => {
    const want = { IM8S: 'shotgun', PA14: 'shotgun', MP2: 'smg', IM8: 'mpistol', KR90: 'lmg', NSHM2: 'hmg', NSR4: 'rocket', PA40GL: 'gl', AGL6: 'drum', HASL1: 'beam', HLP2: 'beampistol' };
    for (const [id, shape] of Object.entries(want)) A(gunShape(id) === shape, id + ' is ' + gunShape(id));
    for (const id of ['PX9', 'AR16', 'K7', 'LR7', 'PA95']) A(gunShape(id) === null, id + ' lost its model');
    for (const sh of new Set(Object.values(want))) { const P = _parts(sh, 0.9); A(P && P.length >= 4 && P.every(([k, s]) => s.every((v) => v > 0)), sh); }
    const wv = src('game/draw/weapons_view.js');
    A(/codedHolder\(id, 'weapon_'\)/.test(wv) && /codedHolder\(id, 'carry_'\)/.test(wv), 'not used');
  });
}
{
  const { DROP, MUZZLE } = await import('../src/sim/arms/weapons.js');
  T('bullet drop: a long shot falls - aim a little high; close in, it flies true; a beam never falls', () => {
    const w = new World(), a = new Arsenal(w);
    let held = statsOf('LR7');
    Object.defineProperty(a, 'weapon', { get: () => held });
    const near = makeTarget(w, [-0.5, 0.5, -20.3], [0.5, 2.5, -19.7], { hp: 999 });
    const far = makeTarget(w, [9.5, -2, -300.3], [10.5, 5, -299.7], { hp: 999 });
    const h1 = a.traceDrop([0, 1.5, 0], [0, 0, -1], 400);
    A(h1 && h1.target === near && Math.abs(h1.point[1] - 1.5) < 0.01, 'close in, it fell');
    const h2 = a.traceDrop([10, 1.5, 0], [0, 0, -1], 400);
    const fall = 1.5 - h2.point[1];
    A(h2 && h2.target === far && fall > 0.3 && fall < 1.2 && Math.abs(h2.dist - 300) < 1, 'at 300 m it fell ' + fall.toFixed(2) + ' (dist ' + (h2 && h2.dist.toFixed(1)) + ')');
    held = statsOf('HASL1');
    const h3 = a.traceDrop([10, 1.5, 0], [0, 0, -1], 400);
    A(h3 && Math.abs(h3.point[1] - 1.5) < 0.01, 'a beam fell');
    A(MUZZLE.sniper > MUZZLE.pistol && DROP.g > 9, 'figures');
  });
}
console.log(fails.length ? '\nFAILURES (' + fails.length + '):\n' + fails.map((f) => '  * ' + f).join('\n') : '\nALL ' + pass + ' PASSED');
