// FRONTLINE - M6.20.9: classes, and the kit they brought (Rhys's first draft):
// ammunition and mods weigh, rockets, pellets, sticky and gas grenades, landmines,
// the Health & Ammo Pack, the Repair Kit, variable sights, the Jump Pack and the specials.
import { World } from '../src/sim/world.js';
import { Player, blankInput } from '../src/sim/player.js';
import { Arsenal, makeTarget } from '../src/sim/weapons.js';
import { Drivable } from '../src/sim/drive.js';
import { Guard } from '../src/sim/guard.js';
import { Loadout, ITEMS, MODS, CLASSES, SLOTS, fits, itemWeight, loadEffect, modFits, classAllows, BATTLE_MIX } from '../src/sim/loadout.js';
import { Arsenal as Ars2, BURN } from '../src/sim/weapons.js';
import { Battle, battleRules } from '../src/sim/battle.js';
import { ARMS } from '../src/sim/guard.js';
import { buildKitLevel } from '../src/game/level_kit.js';
import { DRAFTS } from '../src/game/levels/index.js';
import { readFileSync } from 'fs';

let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n + ' -> ' + e.message); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const DT = 1 / 60;
const range = () => { const w = new World(); w.addSolid([-60, -1, -60], [60, 0, 60], 'ground'); w.spawn = { pos: [0, 0, 0], yaw: 0 }; return w; };
const runA = (ar, secs, player) => { for (let i = 0; i < Math.round(secs / DT); i++) ar.step(DT, player); };
const nobody = { eyePos: [500, 1.6, 500], pos: [500, 0, 500], damage() {}, mode: 'walk' };
const car = (w, pos) => { const v = new Drivable(w, { kind: 'car', pos, yaw: 0, id: 'c' + pos.join() }); w.vehicles = (w.vehicles || []).concat([v]); return v; };

console.log('\n-- WEIGHT: ROUNDS AND MODS (Rhys) --');
T('spare rounds weigh, at real weights; the ones in the magazine are the gun\'s', () => {
  A(Math.abs(itemWeight('K7') - (3.6 + 180 * 0.012)) < 1e-9, 'K7 ' + itemWeight('K7'));
  A(Math.abs(itemWeight('K7', { reserve: 0 }) - 3.6) < 1e-9, 'an empty K7 still weighs its rounds');
  A(itemWeight('LR7X') > 13 + 15 * 0.1, 'the anti-materiel rounds are light');
  const lo = new Loadout({ primary: 'K7', backup: 'PX9', utility1: 'FRAG', utility2: 'FLASH', gear: 'LENSES' });
  const ar = new Arsenal(range(), { loadout: lo });
  const full = lo.weight(ar);
  ar.ammo.K7.reserve = 0;
  A(Math.abs(full - lo.weight(ar) - 180 * 0.012) < 1e-6, 'firing off the reserve did not lighten you');
  ar.ammo.FRAG.count = 0;
  A(full - lo.weight(ar) > 3.5, 'the grenades you threw still weigh');
  ar.spare = { AMMO_RIFLE: 100 };
  A(lo.weight(ar) > full - 3.6, 'the pouch weighs nothing');
  A(loadEffect(full).speed === 1, 'the standard kit is penalised: ' + full.toFixed(2));
});
T('mods weigh too', () => {
  const lo = new Loadout({ primary: 'K7' });
  const a = lo.weight(); lo.fit('primary', 'SILENCER'); lo.fit('primary', 'SCOPE2');
  A(Math.abs(lo.weight() - a - 0.5) < 1e-9, 'silencer and optic added ' + (lo.weight() - a));
  A(Object.values(MODS).filter((m) => !m.gas).every((m) => m.kg > 0), 'a mod without weight');
});
T('Load-Bearing Webbing: half as many rounds again, at half the weight', () => {
  const lo = new Loadout({ primary: 'K7', gear: 'WEBBING' }), ar = new Arsenal(range(), { loadout: lo });
  A(ar.ammo.K7.reserve === 270, 'reserve ' + ar.ammo.K7.reserve);
  A(Math.abs(lo.weight(ar) - (3.6 + 1.2 + 270 * 0.012 * 0.5)) < 1e-6, 'weight ' + lo.weight(ar));
});

console.log('\n-- THE CLASSES --');
T('every class fills its slots with real items that fit, and its Special exists', () => {
  A(CLASSES.length === 7, 'classes: ' + CLASSES.length);
  for (const c of CLASSES) {
    for (const s of SLOTS) { const id = c.kit[s]; A(!id || (ITEMS[id] && fits(id, s)), c.name + ': ' + id + ' in ' + s); }
    for (const [s, ms] of Object.entries(c.kit.mods || {})) for (const m of ms) A(modFits(m, c.kit[s]), c.name + ': ' + m);
    A(!c.special || (ITEMS[c.special] && ITEMS[c.special].family === 'perk'), c.name + ' special ' + c.special);
    A(c.role, c.name + ' has no role');
  }
});
T('a class is paid for in weight: the Heavy is very heavy, the Recon light', () => {
  const w = (id) => { const c = CLASSES.find((q) => q.id === id), l = new Loadout(Object.fromEntries(SLOTS.map((s) => [s, c.kit[s]]))); l.specials = [c.special].filter(Boolean); return loadEffect(l.weight()); };
  A(w('HEAVY').speed < 0.85, 'the Heavy ' + JSON.stringify(w('HEAVY')));
  A(w('RECON').speed > 0.98, 'the Recon ' + JSON.stringify(w('RECON')));
});
T('specials stack: the mission\'s and the class\'s, neither taking the gear slot', () => {
  const lo = new Loadout({ gear: 'NVG' }); lo.specials = ['PARACHUTE', 'CAMO'];
  A(lo.gearTrait('chute') && lo.gearTrait('camo') === 0.6 && lo.gearTrait('nightSight') === 1, 'traits');
  A(lo.special === 'PARACHUTE', 'the first special');
});

console.log('\n-- THE NEW KIT --');
T('the KD-MR3: a rocket that flies, and bursts on what it meets', () => {
  const w = range(); w.addSolid([-3, 0, -30], [3, 4, -29], 'wall');
  const t = makeTarget(w, [-0.3, 0, -28.6], [0.3, 1.8, -28.1], { hp: 100, respawn: 1e9 });
  const a = new Arsenal(w, { loadout: new Loadout({ primary: 'KDMR3' }) }); runA(a, 0.7, nobody);
  const r = a.fire([0, 1.4, 0], [0, 0, -1], {});
  A(r && r.rocket && a.projectiles.length === 1, 'no rocket');
  runA(a, 1.2, nobody);
  A(!a.projectiles.length, 'still flying');
  A(t.down, 'the man by the wall was not caught: ' + t.hp);
  A(a.events.some((e) => e.type === 'blast'), 'no blast');
});
T('Vehicle Targeting: a locked rocket follows the vehicle', () => {
  const w = range(); const v = car(w, [12, 0, -30]);
  const a = new Arsenal(w, { loadout: new Loadout({ primary: 'KDMR3' }) }); runA(a, 0.7, nobody);
  const hp = v.hp;
  a.fire([0, 1.4, 0], [0, 0, -1], { lock: v });
  runA(a, 2, nobody);
  A(v.hp < hp * 0.5 || v.wrecked, 'the car was missed: ' + v.hp);
  const b = new Arsenal(w, { loadout: new Loadout({ primary: 'KDMR3' }) }); runA(b, 0.7, nobody); const v2 = car(w, [-12, 0, -30]); const hp2 = v2.hp;
  b.fire([0, 1.4, 0], [0, 0, -1], {});
  runA(b, 2, nobody);
  A(v2.hp === hp2, 'an unlocked rocket turned');
});
T('(M6.20.10, Rhys: "a compact shotgun") the IM-8S: eight pellets a shell', () => {
  const w = range(); const t = makeTarget(w, [-1, 0, -4], [1, 2, -3.6], { hp: 1000, respawn: 1e9 });
  const a = new Arsenal(w, { loadout: new Loadout({ primary: 'IM8S' }) }); runA(a, 0.7, nobody);
  A(ITEMS.IM8S.family === 'shotgun' && /Shotgun/.test(ITEMS.IM8S.name), 'not a shotgun');
  a.fire([0, 1, 0], [0, 0, -1], {});
  A(a.events.filter((e) => e.type === 'pellet').length >= 6, 'pellets ' + a.events.filter((e) => e.type === 'pellet').length);
  A(1000 - t.hp >= 10 * 6, 'damage ' + (1000 - t.hp));
});
T('(M6.20.10, Rhys: "laser-weapons") the HAS-L3 and HLP-2: a beam, no rounds - heat that builds, then cooling', () => {
  for (const id of ['HASL3', 'HLP2']) A(ITEMS[id].family === 'energy' && ITEMS[id].beam && /Laser/.test(ITEMS[id].name), id);
  A(fits('HLP2', 'backup') && fits('HASL3', 'primary'), 'slots');
  const w = range(); const t = makeTarget(w, [-1, 0, -30], [1, 2, -29.6], { hp: 1e6, respawn: 1e9 });
  const a = new Arsenal(w, { loadout: new Loadout({ primary: 'HASL3' }) }); runA(a, 0.7, nobody);
  let shots = 0;
  for (let i = 0; i < 60 * 14; i++) { if (a.fire([0, 1, 0], [0, 0, -1], {})) shots++; a.step(DT, nobody); }
  A(shots >= 100 && shots <= 106, 'shots before it overheated: ' + shots);
  A(a.events.some((e) => e.type === 'overheat') && a.events.some((e) => e.type === 'beam'), 'no overheat, or no beam');
  A(a.ammo.HASL3.reserve === 0 && itemWeight('HASL3') === ITEMS.HASL3.kg, 'it carries rounds');
  // cooling: it fires again after its venting time
  runA(a, 4.2, nobody);
  A(a.ammo.HASL3.mag === 103 && a.fire([0, 1, 0], [0, 0, -1], {}), 'still hot');
  // and a part-heated one cools by itself
  a.ammo.HASL3.mag = 50; runA(a, 3, nobody);
  A(a.ammo.HASL3.mag > 90, 'did not cool: ' + a.ammo.HASL3.mag);
  // R vents it
  a.ammo.HASL3.mag = 60; A(a.reload() && a.reloading === 4.0, 'no venting');
});
T('the RV-90S: a variable 4x/8x sight; it takes no silencer (it has one)', () => {
  const a = new Arsenal(range(), { loadout: new Loadout({ primary: 'RV90S' }) }); runA(a, 0.7, nobody);
  A(a.weapon.zoom === 4, 'zoom ' + a.weapon.zoom);
  A(a.stepZoom(1) && a.weapon.zoom === 8, 'did not step in');
  a.stepZoom(1); A(a.weapon.zoom === 8, 'stepped past 8x');
  a.stepZoom(-1); A(a.weapon.zoom === 4, 'did not step out');
  A(!modFits('SILENCER', 'RV90S') && a.weapon.quiet <= 0.25, 'silencer');
  const b = new Arsenal(range(), { loadout: new Loadout({ primary: 'K7' }) });
  A(!b.stepZoom(1), 'a fixed sight stepped');
});
T('the Sticky Incendiary sticks to whoever it hits, and burns him', () => {
  const w = range(); const t = makeTarget(w, [-0.3, 0, -4.3], [0.3, 1.8, -3.7], { hp: 100, respawn: 1e9 });
  const a = new Arsenal(w, { loadout: new Loadout({ utility1: 'INCEND' }), start: 'INCEND' }); runA(a, 0.7, nobody);
  a.fire([0, 1.2, 0], [0, 0.05, -1], {});
  runA(a, 0.6, nobody);
  const p = a.projectiles[0];
  A(p && p.stuck === t, 'it did not stick');
  runA(a, 8, nobody);
  A(t.down, 'he did not burn: ' + t.hp);
});
T('the Landmine: people walk over it; a vehicle sets it off', () => {
  const w = range(); const t = makeTarget(w, [-0.3, 0, -2.3], [0.3, 1.8, -1.7], { hp: 1000, respawn: 1e9 });
  const a = new Arsenal(w, { loadout: new Loadout({ utility1: 'LANDMINE' }), start: 'LANDMINE' }); runA(a, 0.7, nobody);
  a.fire([0, 1.6, 0], [0, -1, -1.2], {});
  A(a.projectiles.length === 1, 'not placed');
  const mp = a.projectiles[0].pos;
  t.centre = [mp[0], 0.9, mp[2]];
  runA(a, 5, nobody);
  A(a.projectiles.length === 1, 'a man set it off');
  const v = car(w, [mp[0] + 1, 0, mp[2]]); const hp = v.hp;
  runA(a, 0.5, nobody);
  A(!a.projectiles.length && v.hp < hp, 'the car did not');
});
T('Neurotoxic gas kills whoever breathes it; a gas mask keeps you alive in it', () => {
  const w = range(); const t = makeTarget(w, [-0.3, 0, -6.3], [0.3, 1.8, -5.7], { hp: 100, respawn: 1e9 });
  const mk = (gear) => new Arsenal(w, { loadout: new Loadout({ utility1: 'NERVE', gear }), start: 'NERVE' });
  const you = { pos: [0, 0, -5], eyePos: [0, 1.6, -5], mode: 'walk', hurt: 0, damage(n) { this.hurt += n; } };
  const a = mk('GASMASK');
  a.detonate({ id: 'NERVE', pos: [0, 0.3, -6] }, you);
  runA(a, 6, you);
  A(t.down, 'he breathed it and lived: ' + t.hp);
  A(you.hurt === 0, 'the mask let it in: ' + you.hurt);
  const b = mk(null); const you2 = Object.assign({}, you, { hurt: 0 });
  b.detonate({ id: 'NERVE', pos: [0, 0.3, -6] }, you2);
  runA(b, 2, you2);
  A(you2.hurt > 20, 'unmasked, you were barely touched: ' + you2.hurt);
});
T('the Air-drop Incendiary bursts where it lands; the Illumination leaves a flare', () => {
  const w = range();
  const a = new Arsenal(w, { loadout: new Loadout({ utility1: 'AIRINC', utility2: 'AIRFLARE' }), start: 'AIRINC' }); runA(a, 0.7, nobody);
  a.fire([0, 12, 0], [0, -1, 0], {});
  runA(a, 1.5, nobody);
  A(!a.projectiles.length && a.events.some((e) => e.type === 'blast'), 'it did not burst on landing');
  A((a.clouds || []).some((c) => c.kind === 'fire'), 'nothing burns');
  a.current = Object.keys(a.ammo).find((k) => k.startsWith('AIRFLARE')); a.cool = 0;
  a.fire([0, 12, 0], [0, -1, 0], {});
  runA(a, 1.5, nobody);
  A(a.events.some((e) => e.type === 'flare' && e.secs === 30), 'no flare');
});
T('the Concussion Grenade stuns: it carries a blinding, and hurts little', () => {
  const a = new Arsenal(range(), { loadout: new Loadout({ utility1: 'CONCUSS' }), start: 'CONCUSS' }); runA(a, 0.7, nobody);
  a.detonate({ id: 'CONCUSS', pos: [0, 0.3, -6] }, nobody);
  const b = a.events.find((e) => e.type === 'blast');
  A(b.flash && b.blind > 2 && b.damage < 25, JSON.stringify(b));
});
T('the Health & Ammo Pack: healed, and a magazine more for each gun', () => {
  const lo = new Loadout({ primary: 'IM8S', backup: 'PX19', utility2: 'AIDPACK' }), a = new Arsenal(range(), { loadout: lo }); runA(a, 0.7, nobody);
  const you = { health: 50, pos: [0, 0, 0] };
  a.ammo.IM8S.reserve = 10; a.ammo.PX19.reserve = 0;
  a.current = 'AIDPACK';
  a.fire([0, 1.6, 0], [0, 0, -1], { on: you, player: you });
  A(you.health === 85, 'health ' + you.health);
  A(a.ammo.IM8S.reserve === 18 && a.ammo.PX19.reserve === 15, 'ammo ' + a.ammo.IM8S.reserve + ' ' + a.ammo.PX19.reserve);
  // full health, low on rounds: still worth it
  you.health = 100; a.cool = 0;
  a.fire([0, 1.6, 0], [0, 0, -1], { on: you, player: you });
  A(a.ammo.IM8S.reserve === 26, 'refused at full health with room for rounds');
});
T('the Vehicle Repair Kit mends a vehicle beside you, and is never used up', () => {
  const w = range(); const v = car(w, [2, 0, 0]); v.damage(300);
  const a = new Arsenal(w, { loadout: new Loadout({ utility1: 'REPAIRKIT' }), start: 'REPAIRKIT' }); runA(a, 0.7, nobody);
  const you = { pos: [0, 0, 0], health: 100 };
  const was = v.hp;
  a.fire([0, 1.6, 0], [0, 0, -1], { on: you, player: you });
  A(v.hp > was && a.ammo.REPAIRKIT.count === 1, 'hp ' + v.hp + ' count ' + a.ammo.REPAIRKIT.count);
  A(a.cool >= 3, 'it was quick');
  const far = { pos: [30, 0, 0], health: 100 }; a.cool = 0;
  a.fire([30, 1.6, 0], [0, 0, -1], { on: far, player: far });
  A(a.events.some((e) => e.type === 'noVehicle'), 'it mended from 28 m away');
});

console.log('\n-- THE PLAYER --');
const ground = () => { const w = range(); return w; };
T('the Jump Pack: SPACE held in the air climbs, it runs dry, and refuels on the ground', () => {
  const p = new Player(ground()); p.jetPack = true; p.fallMul = 0.3;   // as the Jump Trooper: the way down without fuel hurts
  for (let i = 0; i < 30; i++) p.step(DT, blankInput());
  const inp = blankInput(); inp.jump = true; inp.jumpPressed = true;
  p.step(DT, inp); inp.jumpPressed = false;
  let top = 0;
  for (let i = 0; i < 180; i++) { p.step(DT, inp); top = Math.max(top, p.pos[1]); }
  A(top > 5, 'it climbed only ' + top.toFixed(2));
  A(p.jetFuel < 0.05, 'fuel ' + p.jetFuel);
  for (let i = 0; i < 60 * 20; i++) p.step(DT, blankInput());
  A(p.onGround && p.jetFuel > 0.95, 'not refuelled: ' + p.jetFuel);
  const q = new Player(ground());
  for (let i = 0; i < 30; i++) q.step(DT, blankInput());
  q.step(DT, Object.assign(blankInput(), { jump: true, jumpPressed: true }));
  let t2 = 0; for (let i = 0; i < 120; i++) { q.step(DT, Object.assign(blankInput(), { jump: true })); t2 = Math.max(t2, q.pos[1]); }
  A(t2 < 1.3, 'without one you flew: ' + t2);
});
T('Cushioned Landing: a fall that hurts hurts far less', () => {
  const drop = (mul) => {
    const w = range(); w.addSolid([-3, 0, -3], [3, 12, 3], 'tower');
    const p = new Player(w); p.pos = [0, 12, 0]; p.fallMul = mul; p.settle && p.settle();
    for (let i = 0; i < 20; i++) p.step(DT, blankInput());
    p.pos = [8, 12, 0]; p.vel = [0, 0, 0]; p.onGround = false;
    for (let i = 0; i < 180; i++) p.step(DT, blankInput());
    return 100 - p.health;
  };
  const hard = drop(undefined), soft = drop(0.3);
  A(hard > 10 && soft < hard * 0.4, 'hurt ' + hard.toFixed(1) + ' / cushioned ' + soft.toFixed(1));
});
T('Special Camouflage: harder to see, all the more prone', () => {
  const w = range();
  const g = new Guard(w, { pos: [0, 0, -10], yaw: Math.PI });
  const you = (camo, stance) => ({ pos: [0, 0, 0], eye: [0, 1.6, 0], chest: [0, 1, 0], stance, speed: 0, camo });
  const ctx = (y) => ({ world: w, you: y, smokes: [] });
  const plain = g.visibility(ctx(you(0, 0))), camo = g.visibility(ctx(you(0.6, 0)));
  A(plain > 0 && Math.abs(camo / plain - 0.6) < 1e-6, 'camo ' + camo + ' / ' + plain);
  const prone = g.visibility(ctx(you(0.6, 2))) / g.visibility(ctx(you(0, 2)));
  A(prone < 0.5, 'prone ' + prone);
});
T('wired up: the lock, the Quick Intel Device, Auto-Repair, the class picker', () => {
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/lock: S\.lock \|\| null/.test(main) && /gearTrait\('lockOn'\)/.test(main), 'the lock');
  A(/gearTrait\('hackSpeed'\)/.test(rt) && /gearTrait\('camo'\)/.test(rt), 'QID or camo');
  A(/gearTrait\('autoRepair'\)/.test(main), 'auto-repair');
  A(/data-class/.test(main) && /CLASSES\.map/.test(main), 'no class picker');
  A(/arsenal\.stepZoom\(/.test(main), 'the sight does not step');
});

console.log('\n-- M6.20.11: RHYS\'S NOTES --');
T('each class carries only what it may: a short list a slot, the class\'s own kit inside it, snipers only for the Recon', () => {
  for (const c of CLASSES) {
    for (const s of SLOTS) {
      const allow = classAllows(c, s);
      A(allow && allow.length <= 12, c.name + ' ' + s + ': ' + (allow && allow.length));
      A(allow.every((id) => ITEMS[id]), c.name + ' ' + s + ': unknown ' + allow.filter((id) => !ITEMS[id]));
      A(!c.kit[s] || allow.includes(c.kit[s]), c.name + ' cannot carry its own ' + c.kit[s]);
    }
    A(ARMS[c.arms] && (!ARMS[c.arms].item || ITEMS[ARMS[c.arms].item]), c.name + ' arms ' + c.arms);
  }
  const has = (cid, fam) => CLASSES.find((c) => c.id === cid).guns.some((id) => ITEMS[id].family === fam);
  A(CLASSES.filter((c) => c.guns.some((id) => ITEMS[id].family === 'sniper')).every((c) => c.id === 'RECON'), 'snipers outside the Recon');
  A(!has('TROOPER', 'shotgun') && !has('RECON', 'shotgun'), 'shotguns for the Trooper or the Recon');
});
T('comrades and enemies in a battle have classes, armed as their class is', () => {
  const L = buildKitLevel(DRAFTS.find((d) => d.id === 'beachhead'));
  const all = Object.values(L.battle.pools).flat();
  A(all.every((g) => g.cls && CLASSES.find((c) => c.id === g.cls).arms === g.armsName), 'a man without his class\'s gun');
  const kinds = new Set(all.map((g) => g.cls));
  A(kinds.has('TROOPER') && kinds.has('RECON') && kinds.has('HEAVY') && kinds.has('MEDIC'), 'the mix: ' + [...kinds]);
  A(!kinds.has('JUMP'), 'the experimental class on the field');
});
T('a retreat is neither a win nor a loss, however it stood', () => {
  const b = new Battle({ you: 'ghost', timer: 600, teams: { ghost: { name: 'Ghost', reserve: 100 }, red: { name: 'Reds', reserve: 100 } } });
  b.teams.red.reserve = 20; b.time = 200;
  A(b.result() === 'win', 'ahead');
  b.retreat();
  A(b.over && b.result() === 'retreat', 'result ' + b.result());
  const o = battleRules.outcome({ battle: b.snapshot() });
  A(battleRules.grade(o) !== 'success' && /withdrawn/.test(battleRules.lines(o)[0].text), 'graded ' + battleRules.grade(o) + ': ' + battleRules.lines(o)[0].text);
});
T('spare rounds can be put down - to a full issue, and the pouch emptied', () => {
  const lo = new Loadout({ primary: 'K7', backup: 'PX19' }), a = new Ars2(range(), { loadout: lo });
  a.ammo.K7.reserve = 270; a.spare = { AMMO_PISTOL: 40 };
  const before = lo.weight(a), dry = a.dumpSpare(true);
  A(dry.AMMO_RIFLE === 90 && dry.AMMO_PISTOL === 40 && a.ammo.K7.reserve === 270, 'dry run ' + JSON.stringify(dry));
  a.dumpSpare();
  A(a.ammo.K7.reserve === 180 && a.spare.AMMO_PISTOL === 0 && lo.weight(a) < before - 1.5, 'left ' + a.ammo.K7.reserve);
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/Leave your spare rounds here/.test(main) && /id="dump-ammo"/.test(main), 'no crate or gear-tab button');
});
T('a fire lingers, and whoever was caught in it burns on after he leaves it', () => {
  const w = range(); const t = makeTarget(w, [-0.3, 0, -6.3], [0.3, 1.8, -5.7], { hp: 200, respawn: 1e9 });
  const a = new Ars2(w, { loadout: new Loadout({ utility1: 'INCEND' }), start: 'INCEND' });
  a.detonate({ id: 'INCEND', pos: [0, 0.3, -6] }, nobody);
  A(a.clouds[0].until - a.time >= 10, 'the fire burns ' + (a.clouds[0].until - a.time) + ' s');
  runA(a, 0.5, nobody);
  A(t.onFire > a.time, 'he did not catch');
  // he walks out of it
  t.centre = [30, 0.9, 30];
  const hp = t.hp; runA(a, 3, nobody);
  A(hp - t.hp > BURN.rate * 2.5, 'he stopped burning when he left it: ' + (hp - t.hp));
  runA(a, 3, nobody); const hp2 = t.hp; runA(a, 1, nobody);
  A(t.hp === hp2 || t.down, 'he burns for ever');
  A(a.events.some((e) => e.type === 'flames'), 'no flames on him');
});
T('the KD-MR3 takes doors off their hinges', () => {
  const w = range(); w.addSolid([-3, 0, -12], [3, 4, -11], 'wall');
  const a = new Arsenal(w, { loadout: new Loadout({ primary: 'KDMR3' }) }); runA(a, 0.7, nobody);
  a.fire([0, 1.4, 0], [0, 0, -1], {}); runA(a, 1, nobody);
  const b = a.events.find((e) => e.type === 'blast');
  A(b && b.breach, 'the blast does not breach');
});
T('wired up: the class picker after every fall, the jump pack bar, the beam from the muzzle', () => {
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  const vw = readFileSync(new URL('../src/game/weapons_view.js', import.meta.url), 'utf8');
  A(/youDown\(\)\) \{ showClassPick\(\)/.test(main) && /S\.nextCls/.test(main) && /keepKit\(\)/.test(main), 'no class choice on falling');
  A(/\$\('jet'\)\.style\.display = jetShow/.test(main), 'no jump pack bar');
  A(/this\.flash\.getPosition\(\)/.test(vw), 'the beam starts in your middle');
  A(/classAllows\(S\.cls, slot\)/.test(main), 'the picker lists everything');
});

console.log('\n' + '='.repeat(50));
if (fails.length) { console.log('FAILURES (' + fails.length + '):'); for (const f of fails) console.log('  * ' + f); process.exit(1); }
console.log('ALL ' + pass + ' PASSED');
