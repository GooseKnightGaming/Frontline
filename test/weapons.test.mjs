// FRONTLINE - weapon tests (node, no browser).
import { World } from '../src/sim/world.js';
import { Player, P, blankInput, followEye, shotOrigin } from '../src/sim/player.js';
import { Arsenal, WEAPONS, makeTarget, reachesHead, HEADSHOT_KILL, quickKey, QUICK } from '../src/sim/weapons.js';
import { scopeSvg } from '../src/game/scope.js';
import { ARMS } from '../src/sim/guard.js';
import { SwingDoor } from '../src/sim/doors.js';
import { readFileSync } from 'fs';
import { adsPlace, sightTop, attachmentsFor, scopeKind } from '../src/game/weapons_view.js';
import { Loadout, Crate, ITEMS, MODS, statsOf, fits, defaultSlot, modFits, pickupSlot, holdAfterPickup, modTags, withTags, cratePrompt, loadEffect } from '../src/sim/loadout.js';

let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n + ' -> ' + e.message); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const near = (a, b, t) => Math.abs(a - b) <= t;
const DT = 1 / 60;
const range = () => {
  const w = new World();
  w.addSolid([-50, -1, -50], [50, 0, 50], 'ground');
  w.spawn = { pos: [0, 0, 0], yaw: 0 };
  return w;
};
const runA = (ar, secs, player) => { for (let i = 0; i < Math.round(secs / DT); i++) ar.step(DT, player); };
const N = [0, 0, -1];   // straight ahead (north)

console.log('\n-- HEADSHOTS --');
{
  const man = () => { const w = range(); const t = makeTarget(w, [-0.3, 0, -5.3], [0.3, 1.8, -4.7], { hp: 60, respawn: 1e9 }); t.headY = 1.5; return { w, t }; };
  const n = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
  T('a round in at the head counts; one in at the chest, level, does not', () => {
    const { t } = man();
    A(reachesHead(t, [0, 1.6, -4.7], [0, 0, -1]), 'the head');
    A(!reachesHead(t, [0, 1.3, -4.7], [0, 0, -1]), 'the chest counted');
  });
  T('up through the chin counts (M6.8.1); coming down under the head line does not', () => {
    const { t } = man();
    A(reachesHead(t, [0, 1.42, -4.7], n([0, 1, -1])), 'the chin, going up, did not count');
    A(!reachesHead(t, [0, 1.42, -4.7], n([0, -1, -1])), 'coming down counted');
    A(!reachesHead(t, [0, 1.0, -4.7], n([0, 0.2, -1])), 'a nearly level round into the belly counted');
  });
  T('crouched below him, a rifle round up under the chin kills', () => {
    const { w, t } = man();
    const a = new Arsenal(w, { give: ['KNIFE', 'RIFLE'] });
    a.select('RIFLE');
    const eye = [0, 0.9, -3.9];                       // crouched, just in front of him
    const aim = n([0, 1.44 - eye[1], -4.7 - eye[2]]);  // at the underside of his jaw
    A(WEAPONS.RIFLE.damage >= HEADSHOT_KILL, 'test needs a full-power round');
    const hit = a.trace(eye, aim, 50);
    A(hit && hit.target === t, 'missed him');
    A(t.down && t.headshot, 'he is still up: hp ' + t.hp.toFixed(0));
  });
}

console.log('\n-- CARRYING AND SWITCHING --');
T('you start with a knife and nothing else', () => {
  const a = new Arsenal(range());
  A(a.current === 'KNIFE' && !a.has('RIFLE'), a.current);
  A(!a.select('RIFLE'), 'selected a weapon it does not have');
});
T('finding a weapon lets you use it, and the slots pick it', () => {
  const a = new Arsenal(range());
  A(a.give('RIFLE') && a.has('RIFLE'), 'not given');
  A(!a.give('RIFLE'), 'given twice');
  A(a.selectSlot(3) && a.current === 'RIFLE', 'slot 3 should be the rifle: ' + a.current);
  A(a.selectSlot(1) && a.current === 'KNIFE', 'slot 1 should be the knife');
});
T('the grenade slot cycles between grenades and flashbangs', () => {
  const a = new Arsenal(range(), { give: ['KNIFE', 'GRENADE', 'FLASHBANG'] });
  A(a.selectSlot(5) && a.current === 'GRENADE', a.current);
  A(a.selectSlot(5) && a.current === 'FLASHBANG', a.current);
  A(a.selectSlot(5) && a.current === 'GRENADE', a.current);
});

console.log('\n-- SHOOTING --');
T('a shot uses a round, and the fire rate limits you', () => {
  const a = new Arsenal(range(), { give: ['RIFLE'], start: 'RIFLE' });
  runA(a, 0.3);
  A(a.fire([0, 1.6, 0], N, {}), 'first shot failed');
  A(a.ammoNow.mag === WEAPONS.RIFLE.mag - 1, 'ammo ' + a.ammoNow.mag);
  A(!a.fire([0, 1.6, 0], N, {}), 'fired again instantly');
  runA(a, WEAPONS.RIFLE.rate + 0.01);
  A(a.fire([0, 1.6, 0], N, {}), 'could not fire after the rate delay');
});
T('an empty magazine stops you, and reloading refills it from your reserve', () => {
  const a = new Arsenal(range(), { give: ['PISTOL'], start: 'PISTOL' });
  runA(a, 0.3);
  for (let i = 0; i < WEAPONS.PISTOL.mag; i++) { a.fire([0, 1.6, 0], N, {}); runA(a, WEAPONS.PISTOL.rate + 0.01); }
  A(a.ammoNow.mag === 0, 'mag ' + a.ammoNow.mag);
  A(!a.fire([0, 1.6, 0], N, {}), 'fired on empty');
  A(a.reloading > 0 && a.events.some((e) => e.type === 'autoreload'), 'pulling the trigger on empty should start a reload');
  runA(a, WEAPONS.PISTOL.reload * 0.6);
  A(a.ammoNow.mag === 0 && a.reloading > 0, 'reload was instant');
  runA(a, WEAPONS.PISTOL.reload);
  A(a.ammoNow.mag === WEAPONS.PISTOL.mag, 'mag after reload ' + a.ammoNow.mag);
  A(a.ammoNow.reserve === WEAPONS.PISTOL.reserve - WEAPONS.PISTOL.mag, 'reserve ' + a.ammoNow.reserve);
});
T('bullets stop at walls, at the right place', () => {
  const w = range();
  w.addSolid([-5, 0, -10.5], [5, 4, -10], 'wall');
  const a = new Arsenal(w, { give: ['SNIPER'], start: 'SNIPER' });
  runA(a, 0.5);
  const r = a.fire([0, 1.6, 0], N, { aim: true });
  A(r.hit && near(r.hit.point[2], -10, 0.05), 'hit at ' + JSON.stringify(r.hit && r.hit.point));
});
T('aiming is far more accurate than firing from the hip, and moving is worst', () => {
  const spread = (opts) => {
    const w = range();
    w.addSolid([-40, -20, -60.5], [40, 40, -60], 'wall');
    const a = new Arsenal(w, { give: ['RIFLE'], start: 'RIFLE', seed: 7 });
    let sum = 0, n = 0;
    for (let i = 0; i < 30; i++) {
      runA(a, WEAPONS.RIFLE.rate + 0.02);
      const r = a.fire([0, 1.6, 0], N, opts);
      if (r && r.hit) { sum += Math.hypot(r.hit.point[0], r.hit.point[1] - 1.6); n++; }
    }
    return sum / n;
  };
  const hip = spread({}), ads = spread({ aim: true }), run = spread({ moving: true });
  A(ads < hip * 0.6, `aimed ${ads.toFixed(2)} vs hip ${hip.toFixed(2)}`);
  A(run > hip * 1.4, `moving ${run.toFixed(2)} vs hip ${hip.toFixed(2)}`);
});
T('firing fast opens the group up, and it settles again', () => {
  const a = new Arsenal(range(), { give: ['RIFLE'], start: 'RIFLE' });
  runA(a, 0.3);
  for (let i = 0; i < 8; i++) { a.fire([0, 1.6, 0], N, {}); runA(a, WEAPONS.RIFLE.rate + 0.005); }
  const hot = a.spreadBloom;
  A(hot > WEAPONS.RIFLE.spread * 0.5, 'no bloom: ' + hot);
  runA(a, 2);
  A(a.spreadBloom < hot * 0.2, 'bloom did not settle: ' + a.spreadBloom);
});
T('each shot kicks the aim up, and it recovers', () => {
  const a = new Arsenal(range(), { give: ['SNIPER'], start: 'SNIPER' });
  runA(a, 0.5);
  a.fire([0, 1.6, 0], N, {});
  A(a.recoil > 0.05, 'no recoil: ' + a.recoil);
  runA(a, 1.5);
  A(a.recoil < 0.01, 'recoil stayed: ' + a.recoil);
});

console.log('\n-- TARGETS --');
T('a target takes hits, drops, scores, and pops back up', () => {
  const w = range();
  const t = makeTarget(w, [-0.5, 1, -12], [0.5, 2, -11.9], { hp: 30, score: 10 });
  const a = new Arsenal(w, { give: ['RIFLE'], start: 'RIFLE' });
  runA(a, 0.3);
  a.events.length = 0;
  a.fire([0, 1.6, 0], N, { aim: true });
  const hit = a.events.find((e) => e.type === 'target');
  A(hit && hit.target === t, 'no hit registered');
  A(t.hp < t.maxHp && !t.down, 'hp ' + t.hp);
  while (!t.down) { runA(a, WEAPONS.RIFLE.rate + 0.01); a.fire([0, 1.6, 0], N, { aim: true }); }
  A(t.down, 'target never dropped');
  runA(a, (t.respawn || 4) + 0.2);
  A(!t.down && t.hp === t.maxHp, 'target did not come back');
});
T('a target keeps everything it is given: its lane, how long it stays down (M6.13.7, Rhys: the ranges\' targets stood up too fast, cleared ranges went uncounted, the turrets came back)', () => {
  const w = range();
  const d = makeTarget(w, [-0.5, 1, -12], [0.5, 2, -11.9], {});
  A(d.down === false && d.downAt === -99 && d.respawn === 4 && d.score === 10, 'defaults lost: ' + JSON.stringify({ down: d.down, downAt: d.downAt, respawn: d.respawn, score: d.score }));
  const t = makeTarget(w, [-0.5, 1, -8], [0.5, 2, -7.9], { hp: 30, score: 0, respawn: 1e6, lane: 'pistol' });
  A(t.lane === 'pistol' && t.respawn === 1e6 && t.score === 0, 'given values lost: ' + JSON.stringify({ lane: t.lane, respawn: t.respawn, score: t.score }));
  const a = new Arsenal(w, { give: ['RIFLE'], start: 'RIFLE' });
  runA(a, 0.3);
  while (!t.down) { runA(a, WEAPONS.RIFLE.rate + 0.01); a.fire([0, 1.6, 0], N, { aim: true }); }
  runA(a, 60);
  A(t.down, 'a range target stood back up within a minute');
});
T('the knife only reaches things within arm\'s length', () => {
  const w = range();
  const near1 = makeTarget(w, [-0.4, 1, -1.6], [0.4, 1.9, -1.5], { hp: 200 });
  const a = new Arsenal(w);
  runA(a, 0.3);
  const r = a.fire([0, 1.6, 0], N, {});
  A(r && r.hit && r.hit.target === near1, 'knife missed something in front of it');
  const w2 = range();
  makeTarget(w2, [-0.4, 1, -4], [0.4, 1.9, -3.9], { hp: 200 });
  const a2 = new Arsenal(w2);
  runA(a2, 0.3);
  const r2 = a2.fire([0, 1.6, 0], N, {});
  A(!(r2 && r2.hit), 'knife reached 4 m');
});

console.log('\n-- GRENADES --');
T('a grenade flies, bounces, and goes off on its fuse', () => {
  const w = range();
  const a = new Arsenal(w, { give: ['GRENADE'], start: 'GRENADE' });
  runA(a, 0.3);
  a.fire([0, 1.6, 0], [0, 0.2, -1], {});
  A(a.projectiles.length === 1, 'not thrown');
  runA(a, 1.0);
  const p = a.projectiles[0];
  A(p && p.pos[2] < -5, 'did not travel: ' + JSON.stringify(p && p.pos));
  runA(a, WEAPONS.GRENADE.fuse);
  A(a.projectiles.length === 0, 'never exploded');
  A(a.events.some((e) => e.type === 'blast'), 'no blast event');
  A(a.events.some((e) => e.type === 'bounce'), 'never bounced off the ground');
});
T('a blast hurts targets nearby, less further out, and not through a wall', () => {
  const at = (dx, wall) => {
    const w = range();
    // the wall stands between the blast (x=0) and the target (x=dx)
    if (wall) w.addSolid([0.2, 0, -12], [0.35, 4, -10], 'wall');
    const t = makeTarget(w, [dx - 0.3, 0.5, -11.2], [dx + 0.3, 1.6, -11], { hp: 200 });
    const a = new Arsenal(w, { give: ['GRENADE'], start: 'GRENADE' });
    a.projectiles.push({ id: 'GRENADE', pos: [0, 0.3, -11], vel: [0, 0, 0], fuse: 0.01 });
    runA(a, 0.2);
    return 200 - t.hp;
  };
  const close = at(0.6, false), far = at(6.5, false), behind = at(0.6, true);
  A(close > 60, 'close damage ' + close.toFixed(0));
  A(far > 0 && far < close * 0.6, `far ${far.toFixed(0)} vs close ${close.toFixed(0)}`);
  A(behind === 0, 'damaged through a wall: ' + behind.toFixed(0));
});
T('your own grenade can hurt you; a wall protects you', () => {
  const hurtMe = (wall) => {
    const w = range();
    if (wall) w.addSolid([-4, 0, -2.2], [4, 4, -2], 'wall');
    const p = new Player(w);
    const a = new Arsenal(w, { give: ['GRENADE'], start: 'GRENADE' });
    a.projectiles.push({ id: 'GRENADE', pos: [0, 0.3, -3], vel: [0, 0, 0], fuse: 0.01 });
    runA(a, 0.2, p);
    return 100 - p.health;
  };
  A(hurtMe(false) > 30, 'own grenade did nothing');
  A(hurtMe(true) === 0, 'hurt through a wall');
});
T('a flashbang blinds instead of hurting, and facing away helps', () => {
  const blind = (look) => {
    const w = range();
    const p = new Player(w);
    p.lookDir = () => look;
    const a = new Arsenal(w, { give: ['FLASHBANG'], start: 'FLASHBANG' });
    a.projectiles.push({ id: 'FLASHBANG', pos: [0, 1.6, -3], vel: [0, 0, 0], fuse: 0.01 });
    runA(a, 0.1, p);
    return { blind: a.blind, hp: p.health };
  };
  const facing = blind([0, 0, -1]), away = blind([0, 0, 1]);
  A(facing.hp === 100, 'flashbang did damage');
  A(facing.blind > 2, 'not blinded: ' + facing.blind.toFixed(2));
  A(away.blind < facing.blind * 0.4, `away ${away.blind.toFixed(2)} vs facing ${facing.blind.toFixed(2)}`);
});
T('blindness wears off', () => {
  const a = new Arsenal(range());
  a.blind = 3;
  runA(a, 3.5);
  A(a.blind === 0, 'still blind: ' + a.blind);
});
T('throwing your last grenade switches you back to a weapon', () => {
  const a = new Arsenal(range(), { give: ['RIFLE', 'GRENADE'], start: 'GRENADE' });
  runA(a, 0.3);
  for (let i = 0; i < WEAPONS.GRENADE.count; i++) { a.fire([0, 1.6, 0], N, {}); runA(a, 1); }
  A(a.ammoNow === null || a.current !== 'GRENADE', 'still holding grenades: ' + a.current);
  A(a.current === 'RIFLE', 'did not fall back to the rifle: ' + a.current);
});

T('only a breaching charge\'s blast carries the breach flag (a smoke grenade\'s does not)', () => {
  const blastOf = (id) => {
    const w = range();
    w.addSolid([-2, 0, -3.2], [2, 3, -3], 'wall');
    const a = new Arsenal(w, { loadout: new Loadout({ utility1: id }), start: id });
    runA(a, 0.4);
    a.fire([0, 1.6, 0], N, {});
    if (id === 'C5') { runA(a, 1); a.detonateAll(); }   // a charge: placed, then set off
    runA(a, 3);
    return a.events.find((e) => e.type === 'blast');
  };
  for (const [id, want] of [['SMOKE', false], ['C5', true]]) {
    const ev = blastOf(id);
    A(ev, id + ': no blast event');
    A(ev.breach === want, id + ': breach ' + ev.breach + ', wanted ' + want);
  }
});

T('a C5 placed on a man sticks to him, unhurt, goes where he goes - and the blast is what kills him (M6.13.0, Rhys)', () => {
  const w = range();
  const t = makeTarget(w, [-0.3, 0, -2.3], [0.3, 1.8, -1.7], { hp: 60, respawn: 1e9 });
  t.centre = [0, 0.9, -2];
  const a = new Arsenal(w, { loadout: new Loadout({ utility1: 'C5' }), start: 'C5' });
  runA(a, 0.4);
  a.fire([0, 1.2, 0], N, {});
  A(!t.down && t.hp === 60, 'placing it hurt him: hp ' + t.hp);
  const ch = a.projectiles.find((p) => p.placed);
  A(ch && ch.stuck === t, 'it did not stick to him');
  // he walks off two metres; it goes with him
  t.centre = [2, 0.9, -2]; t.solid.min = [1.7, 0, -2.3]; t.solid.max = [2.3, 1.8, -1.7]; t.min = t.solid.min.slice(); t.max = t.solid.max.slice();
  runA(a, 0.5);
  A(Math.abs(ch.pos[0] - 2) < 0.4, 'the charge stayed behind: x ' + ch.pos[0].toFixed(2));
  a.detonateAll(); runA(a, 1);
  A(t.down, 'set off on him, it did not kill him');
});

T('a crate shows what a slot actually holds: C5 left and placed, a gun\'s magazine and spare (M6.17.10, Rhys)', () => {
  const w = range();
  w.addSolid([-2, 0, -2.2], [2, 3, -2], 'wall');
  const a = new Arsenal(w, { loadout: new Loadout({ primary: 'K7', utility1: 'C5' }), start: 'C5' });
  A(a.slotReadout('utility1').text === '2 of 2 left', 'full: ' + a.slotReadout('utility1').text);
  runA(a, 0.4); a.fire([0, 1.2, 0], N, {});
  const r1 = a.slotReadout('utility1');
  A(r1.count === 1 && r1.placed === 1 && r1.text === '1 of 2 left, 1 placed', 'one placed: ' + r1.text);
  runA(a, 1); a.fire([0, 1.4, 0], N, {});
  const r2 = a.slotReadout('utility1');
  A(r2.count === 0 && r2.placed === 2 && r2.text === 'none left, 2 placed', 'both placed: ' + r2.text);
  a.detonateAll(); runA(a, 1);
  A(a.slotReadout('utility1').text === 'none left', 'spent: ' + a.slotReadout('utility1').text);
  a.select('K7'); runA(a, 1); a.cool = 0; a.fire([0, 1.5, 0], N, { fresh: true });
  const g = a.slotReadout('primary');
  A(g.mag === g.magSize - 1 && /in the magazine/.test(g.text) && g.text.startsWith(g.mag + '/' + g.magSize), 'gun: ' + g.text);
  A(a.slotReadout('gear') === null, 'an empty slot said something');
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/\$\{id \? mineDetail\(slot, id\) :/.test(main) && /arsenal\.slotReadout\(slot\)/.test(main), 'the crate still shows the full count');
  A(/c\.copies\(id\)/.test(main), 'a pouch put down in a crate shows as full');
});

T('a weapon left in a crate keeps its mods, shows them, and goes back out with them - an ordinary crate and the Quartermaster (M6.17.11, Rhys: "where\'s my silencer gone?")', () => {
  const l = new Loadout({ backup: 'V27C', utility1: 'LURE' }); l.fit('backup', 'SILENCER');
  const c = new Crate('gear', ['PX9']);
  A(c.swap(l, 'backup', 'PX9').ok && l.get('backup') === 'PX9' && !(l.mods.backup || []).length, 'swap failed');
  const cp = c.copies('V27C');
  A(cp.length === 1 && cp[0].mods.includes('SILENCER') && withTags('V-27C', cp[0].mods) === 'V-27C (silenced)', 'the crate does not show the silencer: ' + JSON.stringify(cp));
  A(c.swap(l, 'backup', 'V27C').ok && l.get('backup') === 'V27C' && l.mods.backup.includes('SILENCER'), 'it came back without its silencer');
  A(!c.modsOf('V27C').length && c.items.includes('PX9'), 'the crate kept a ghost of it');
  // emptied into the crate ("None") and taken back
  c.store(l.put('backup', null)); A(c.copies('V27C')[0].mods.includes('SILENCER'), 'emptied: mods lost');
  A(c.swap(l, 'backup', 'V27C').ok && l.mods.backup.includes('SILENCER'), 'emptied and back: mods lost');
  // the Quartermaster: nothing goes on his shelf, but your silencer is waiting on the gun when you come back for it
  const q = new Crate('armoury', []); q.infinite = true;
  A(q.swap(l, 'backup', 'PX9').ok && l.get('backup') === 'PX9' && !q.items.length, 'the Quartermaster took stock');
  A(q.swap(l, 'backup', 'V27C').ok && l.mods.backup.includes('SILENCER'), 'the Quartermaster lost the silencer');
  // part-used boxes show what is in them, in the order they come out
  const b = new Crate('gear', ['C5']); b.items.push('C5'); b.leave('C5', 1);
  const cc = b.copies('C5'); A(cc.length === 2 && cc[0].count === 2 && cc[1].count === 1, 'boxes: ' + JSON.stringify(cc));
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/withTags\(label\(id\), loadout\.mods\[slot\]\)/.test(main) && /withTags\(label\(id\), copy\.mods\)/.test(main) && /c\.store\(out\)/.test(main) && /c\.swap\(loadout, crateSlot, id\);/.test(main), 'the crate screen does not show or keep them');
});
T('one placed and picked back up goes into the pouch only if there is room: never more than a full pouch (M6.17.11, Rhys: "I managed to end up with 3 Lures")', () => {
  const w = range(); w.addSolid([-2, 0, -2.2], [2, 3, -2], 'wall');
  const a = new Arsenal(w, { loadout: new Loadout({ utility1: 'LURE' }), start: 'LURE' });
  runA(a, 0.4); a.fire([0, 1.2, 0], N, {});
  const p = a.projectiles.find((q) => q.placed);
  A(p && a.ammo.LURE.count === 1, 'not placed');
  a.ammo.LURE.count = 2;                    // the pouch refilled meanwhile
  A(!a.canTakeBack(p) && a.disarm(p) === false && a.ammo.LURE.count === 2 && a.projectiles.includes(p), 'a full pouch took it: ' + a.ammo.LURE.count);
  a.ammo.LURE.count = 1;
  A(a.canTakeBack(p) && a.disarm(p) && a.ammo.LURE.count === 2 && !a.projectiles.includes(p), 'with room it did not come back');
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/arsenal\.canTakeBack\(charge\)/.test(main), 'the prompt does not say the pouch is full');
});

T('the BR-12 Breaching Shotgun breaches: a door within 3 m, shot, comes off as C5 would take it - further off, it does not (M6.17.15, Rhys)', () => {
  const mk = (z) => {
    const w = range();
    const d = new SwingDoor(w, { plane: 'z', at: z, wall: [z - 0.1, z + 0.1], from: -0.5, to: 0.5, y0: 0, h: 2.1, build: 'reinforced', locked: true });
    const a = new Arsenal(w, { loadout: new Loadout({ primary: 'BR12' }), start: 'BR12' });
    runA(a, 1); a.cool = 0; a.fire([0, 1.2, 0], N, { aim: true, fresh: true });
    return { d, ev: a.events.filter((e) => e.type === 'breachShot') };
  };
  const near = mk(-2.2), far = mk(-5);
  A(near.ev.length === 1 && Math.abs(near.ev[0].pos[2] - -2.2) < 0.2, 'no breach at 2.2 m');
  A(!far.ev.length, 'breached from 5 m');
  A(ITEMS.BR12 && ITEMS.BR12.family === 'shotgun' && /Breaching Shotgun/.test(ITEMS.BR12.name) && ITEMS.BR12.breach, 'no such gun');
  A(ARMS.shotgun.item === 'BR12', 'the reds\' shotguns drop something else');
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/if \(ev\.type === 'breachShot'\) \{ const b = \{ breach: true, pos: ev\.pos \};/.test(main), 'the round does nothing to the door');
});

console.log('\n-- LOADOUT --');

T('five slots, filled by size rather than by category', () => {
  const l = new Loadout({ primary: 'K7', backup: 'PX9', utility1: 'FRAG', utility2: 'FLASH', gear: 'LENSES' });
  A(l.get('primary') === 'K7' && l.get('gear') === 'LENSES', 'slots did not fill');
  A(l.put('primary', 'FRAG') === false, 'a grenade went in the primary slot');
  // (M6.20.8, Rhys: "any gun in any slot, yes please") - but not a grenade, and not gear
  A(l.put('backup', 'K7') !== false && l.get('backup') === 'K7', 'a carbine would not go in the backup slot');
  A(l.put('backup', 'FRAG') === false && l.put('primary', 'LENSES') === false, 'a grenade or gear went in a weapon slot');
  A(l.put('gear', 'PX9') === false, 'a pistol went in the gear slot');
});
T('two sidearms, or a double helping of charges, are legal', () => {
  const l = new Loadout({ primary: 'DE50', backup: 'PX9', utility1: 'C5', utility2: 'C5' });
  A(l.get('primary') === 'DE50' && l.get('backup') === 'PX9', 'two pistols refused');
  A(l.get('utility1') === 'C5' && l.get('utility2') === 'C5', 'double C5 refused');
});
T('a swapped item comes back to you', () => {
  const l = new Loadout({ primary: 'K7' });
  const out = l.put('primary', 'LR7');
  A(out && out.id === 'K7', 'did not hand back the carbine');
  A(l.get('primary') === 'LR7', 'did not take the marksman rifle');
});
T('weapon families differ in the ways you would expect', () => {
  const de = ITEMS.DE50, v99 = ITEMS.V99;
  A(de.damage > v99.damage * 2, 'the hand cannon should hit far harder');
  A(de.mag < v99.mag && de.recoil > v99.recoil && de.rate > v99.rate, 'the hand cannon should be slower, kickier, smaller');
  A(ITEMS.LR7X.damage > ITEMS.LR7.damage && ITEMS.LR7X.zoom > ITEMS.LR7.zoom, 'the anti-materiel rifle should out-reach the marksman');
  A(ITEMS.MP2.rate < ITEMS.K7.rate && ITEMS.MP2.damage < ITEMS.K7.damage, 'the machine pistol should be faster and weaker');
});

console.log('\n-- MODS --');
T('mods only fit what they were made for', () => {
  A(modFits('SCOPE8', 'LR7') && !modFits('SCOPE8', 'PX9'), '8x scope fitting');
  A(modFits('SILENCER', 'PX9') && !modFits('SILENCER', 'KNIFE'), 'silencer fitting');
  A(modFits('FILL_CS', 'SMOKE') && !modFits('FILL_CS', 'FRAG'), 'grenade fills');
});
T('a silencer quietens the shot and costs a little damage', () => {
  const plain = statsOf('K7'), quiet = statsOf('K7', ['SILENCER']);
  A(quiet.damage < plain.damage, 'damage unchanged: ' + quiet.damage);
  A(quiet.quiet < 1, 'not quieter');
});
T('an extended magazine holds more and takes longer to change', () => {
  const plain = statsOf('K7'), big = statsOf('K7', ['EXTMAG']);
  A(big.mag > plain.mag && big.reload > plain.reload, `${plain.mag}/${plain.reload} -> ${big.mag}/${big.reload}`);
});
T('one optic at a time; fitting a second takes the first off', () => {
  const l = new Loadout({ primary: 'LR7' });
  A(l.fit('primary', 'SCOPE8') === true, 'scope refused');
  A(l.fit('primary', 'EXTMAG') === true, 'magazine refused');
  A(l.fit('primary', 'SCOPE2') === false, '2x optic should not fit a sniper');
  A(l.mods.primary.includes('SCOPE8') && l.mods.primary.includes('EXTMAG'), 'mods lost: ' + l.mods.primary);
  A(l.statsFor('primary').zoom === 8, 'scope not applied');
});
T('what is in the tin: smoke, CS or phosphorous', () => {
  const l = new Loadout({ utility1: 'SMOKE' });
  A(l.statsFor('utility1').damage === 0, 'plain smoke should be harmless');
  l.fit('utility1', 'FILL_WP');
  A(l.statsFor('utility1').damage > 0 && l.statsFor('utility1').gas === 'wp', 'phosphorous fill did nothing');
  const was = l.fit('utility1', 'FILL_CS');
  A(was === 'FILL_WP', 'the old fill should come back out: ' + was);
  A(l.statsFor('utility1').gas === 'cs' && l.statsFor('utility1').damage === 0, 'CS should be harmless again');
});

T('(M6.20.8, Rhys) weight: two snipers are legal, and heavy; a light kit costs nothing', () => {
  const light = new Loadout({ primary: 'K7', backup: 'PX9', utility1: 'FRAG', utility2: 'FLASH', gear: 'LENSES' });
  const heavy = new Loadout({ primary: 'LR7X', backup: 'KR90', utility1: 'C5', utility2: 'REMOTE', gear: 'MULTIVIS' });
  A(heavy.get('backup') === 'KR90', 'the machine gun would not go in the second slot');
  const a = loadEffect(light.weight()), b = loadEffect(heavy.weight());
  A(a.speed === 1 && a.drain === 1, 'the standard kit is penalised: ' + light.weight());
  A(b.speed < 0.85 && b.drain > 1.5 && b.noise > 1, 'a heavy kit is not: ' + JSON.stringify(b));
  const two = new Loadout({ primary: 'LR7', backup: 'LR7' });
  A(two.keys().join() === 'LR7,LR7@backup', 'two of the same rifle are not two rifles: ' + two.keys());
  light.special = 'PARACHUTE';
  A(light.gearTrait('chute') === true && light.get('gear') === 'LENSES' && light.gearTrait('flashResist') === 0.85, 'the Special slot crowds the gear slot');
});
T('(M6.20.8) the weight slows you, tires you sooner and is heard', () => {
  const src = readFileSync(new URL('../src/sim/player.js', import.meta.url), 'utf8');
  A(/speed \*= this\.load\.speed/.test(src) && /this\.load\.drain/.test(src) && /this\.noise \*= this\.load\.noise/.test(src), 'the player ignores the load');
});

console.log('\n-- CRATES --');
T('(M6.17.1, Rhys) taking a weapon off a downed red does not take the one in your hands away', () => {
  // the casino: bare hands, the V-27C in hand; a K7 goes in the empty primary slot, and you still hold the V-27C
  const lo = new Loadout({ backup: 'V27C', utility1: 'LURE' });
  let hand = 'backup';
  let slot = pickupSlot(lo, 'K7', hand); lo.put(slot, 'K7');
  A(slot === 'primary' && holdAfterPickup(slot, hand) === 'backup', 'took ' + slot + ', holding ' + holdAfterPickup(slot, hand));
  // a pistol, with both full and the V-27C in hand: it takes the V-27C's place, and is in your hands
  slot = pickupSlot(lo, 'PX9', hand);
  A(slot === 'backup' && holdAfterPickup(slot, hand) === 'backup', 'pistol into ' + slot);
  // a rifle, with the pistol in hand: the rifle replaces the rifle; the pistol stays in your hands
  slot = pickupSlot(lo, 'VR4', 'backup');
  A(slot === 'primary' && holdAfterPickup(slot, 'backup') === 'backup', 'rifle into ' + slot + ', holding ' + holdAfterPickup(slot, 'backup'));
});
T('a crate swaps a weapon, and keeps what you leave behind', () => {
  const l = new Loadout({ primary: 'K7', backup: 'PX9' });
  const c = new Crate('weapon', ['LR7', 'DE50', 'MP2']);
  const r = c.swap(l, 'primary', 'LR7');
  A(r.ok && l.get('primary') === 'LR7', 'swap failed: ' + JSON.stringify(r));
  A(c.items.includes('K7') && !c.items.includes('LR7'), 'the crate did not keep the carbine: ' + c.items);
  const bad = c.swap(l, 'utility1', 'MP2');
  A(!bad.ok, 'a machine pistol went into a utility slot');
  const gone = c.swap(l, 'primary', 'K7');
  A(gone.ok && l.get('primary') === 'K7' && c.items.includes('LR7'), 'could not take it back');
});
T('you cannot take what is not in the crate', () => {
  const l = new Loadout({ primary: 'K7' });
  const c = new Crate('weapon', ['DE50']);
  A(!c.swap(l, 'primary', 'LR7').ok, 'took a rifle that was not there');
});

console.log('\n-- CARRYING WHAT THE LOADOUT SAYS --');
T('the arsenal holds exactly your loadout, and 1-5 pick the slots', () => {
  const l = new Loadout({ primary: 'K7', backup: 'KNIFE', utility1: 'FRAG', utility2: 'FLASH', gear: 'LENSES' });
  const a = new Arsenal(range(), { loadout: l });
  A(a.current === 'K7', 'did not start with the primary: ' + a.current);
  A(a.selectSlot(2) && a.current === 'KNIFE', 'slot 2: ' + a.current);
  A(a.selectSlot(3) && a.current === 'FRAG', 'slot 3: ' + a.current);
  A(a.selectSlot(4) && a.current === 'FLASH', 'slot 4: ' + a.current);
  A(!a.selectSlot(5), 'gear should not be something you hold');
  A(!a.has('LR7'), 'carrying something that is not in the loadout');
});
T('mods change how the weapon in your hands behaves', () => {
  const l = new Loadout({ primary: 'LR7' });
  l.fit('primary', 'EXTMAG');
  const a = new Arsenal(range(), { loadout: l });
  A(a.weapon.mag === statsOf('LR7', ['EXTMAG']).mag, 'the arsenal ignored the magazine: ' + a.weapon.mag);
});
T('polarised lenses take the sting out of a flashbang', () => {
  const blindWith = (gear) => {
    const w = range();
    const p = new Player(w);
    p.lookDir = () => [0, 0, -1];
    const l = new Loadout({ utility1: 'FLASH', gear: gear });
    const a = new Arsenal(w, { loadout: l });
    a.projectiles.push({ id: 'FLASH', pos: [0, 1.6, -3], vel: [0, 0, 0], fuse: 0.01 });
    runA(a, 0.1, p);
    return a.blind;
  };
  const bare = blindWith(null), lensed = blindWith('LENSES');
  A(bare > 2, 'not blinded without lenses: ' + bare.toFixed(2));
  A(lensed < bare * 0.3, `lenses did little: ${lensed.toFixed(2)} vs ${bare.toFixed(2)}`);
});
T('night vision goggles make a flash worse only while they are down (M6.9.24)', () => {
  const blindWith = (gear, down) => {
    const w = range();
    const p = new Player(w);
    p.lookDir = () => [0, 0, -1];
    const l = new Loadout({ utility1: 'FLASH', gear: gear });
    const a = new Arsenal(w, { loadout: l });
    a.gogglesDown = down;
    a.projectiles.push({ id: 'FLASH', pos: [0, 1.6, -3], vel: [0, 0, 0], fuse: 0.01 });
    runA(a, 0.1, p);
    return a.blind;
  };
  const bare = blindWith(null, false), up = blindWith('NVG', false), down = blindWith('NVG', true);
  A(Math.abs(up - bare) < 1e-6, `goggles pushed up should be like none: ${up.toFixed(2)} vs ${bare.toFixed(2)}`);
  A(down > bare * 1.4, `goggles down should be far worse: ${down.toFixed(2)} vs ${bare.toFixed(2)}`);
  A(ITEMS.NVG.name === 'Night Vision Goggles' && ITEMS.NVG.nightSight, 'the goggles should be called what they are');
});
T('putting a gun down keeps its loose rounds in your pouch, for the next gun that fires them (M6.10.3, Rhys)', () => {
  const w = range();
  const l = new Loadout({ primary: 'K7', backup: 'PX9' });
  const a = new Arsenal(w, { loadout: l });
  a.ammo.K7.reserve = 140; a.ammo.K7.mag = 21;
  const inMag = a.stow('K7');
  A(inMag === 21 && a.ammo.K7.reserve === 0, 'the magazine should stay with the gun, the rest come out: ' + inMag + ' / ' + a.ammo.K7.reserve);
  A(a.spare.AMMO_RIFLE === 140, 'not in the pouch: ' + JSON.stringify(a.spare));
  // swap to the marksman rifle and back to a carbine: the rounds come back
  l.put('primary', 'LR7'); a.reset(l, { keep: true });
  A(a.spare.AMMO_RIFLE === 140, 'lost on the way');
  // (a carbine from a crate comes with its own load; the pouch tops it up and keeps the rest)
  l.put('primary', 'K7'); a.reset(l, { keep: true });
  A(a.ammo.K7.reserve + (a.spare.AMMO_RIFLE || 0) === 180 + 140, 'rounds went missing: ' + a.ammo.K7.reserve + ' + ' + a.spare.AMMO_RIFLE);
  const t = new Loadout({ utility1: 'MEDKIT_FULL' }), b = new Arsenal(w, { loadout: t }), you = { health: 20 };
  b.select('MEDKIT_FULL'); b.useAid({ player: you });
  A(you.health === 100 && b.ammo.MEDKIT_FULL === undefined || you.health === 100, 'the trauma kit should put you right at once: ' + you.health);
});
T('C5 in both utility slots: swap the spent first one out, the second keeps its own count; more C5 adds to it (M6.10.4, Rhys)', () => {
  const w = range();
  const l = new Loadout({ primary: 'K7', utility1: 'C5', utility2: 'C5' });
  const a = new Arsenal(w, { loadout: l });
  a.ammo['C5'].count = 0;                       // the first box used up
  A(a.ammo['C5@utility2'].count === 2, 'the second box did not start full');
  l.put('utility1', 'FLASH'); a.reset(l, { keep: true });
  A(l.keyOf('utility2') === 'C5', 'expected the second box to be plain C5 now');
  A(a.ammo['C5'].count === 2, 'the second box lost its charges in the swap: ' + a.ammo['C5'].count);
  A(a.ammo['FLASH'].count === 2, 'the flashbangs did not arrive');
  a.ammo['C5'].count = 0;
  a.restock('utility2');
  A(a.ammo['C5'].count === 2, 'a restock did not add the box: ' + a.ammo['C5'].count);
  a.reset(l, { keep: true });
  A(a.ammo['C5'].count === 2 && a.ammo['K7'].mag === 30, 'a plain reset changed what you carry');
});
T('a box left in a crate keeps what was left in it: no swapping a spent box out and back in full (M6.11.0, Rhys)', () => {
  const c = new Crate('gear', ['C5', 'C5'], [0, 0, 0]);
  // a spent box put in: it stays spent
  c.items.push('C5'); c.leave('C5', 0);
  const take = (cr, id) => { const n = cr.takeCount(id); cr.items.splice(cr.items.indexOf(id), 1); return n; };   // as the crate screen does
  const got = [take(c, 'C5'), take(c, 'C5'), take(c, 'C5')];
  A(got.join() === '2,2,0', 'expected the two full boxes, then the spent one: ' + got);
  const d = new Crate('gear', ['FLASH'], [0, 0, 0]);
  d.items.push('FLASH'); d.leave('FLASH', 1);
  A(take(d, 'FLASH') === 2 && take(d, 'FLASH') === 1, 'a part-used box should come back part-used');
  const e = new Crate('gear', ['C5'], [0, 0, 0]); e.leave('C5', 2);
  A(take(e, 'C5') === 2 && !(e.left && e.left.C5 && e.left.C5.length), 'a full box is not "part-used"');
});
T('an empty weapon reloads itself, and switching is quicker', () => {
  const l = new Loadout({ primary: 'K7', backup: 'PX9' });
  const a = new Arsenal(range(), { loadout: l });
  runA(a, 0.3);
  a.ammoNow.mag = 0;
  a.fire([0, 1.6, 0], N, {});
  A(a.reloading > 2, 'no automatic reload: ' + a.reloading);
  const wait = a.reloading;
  A(a.selectSlot(2) && a.current === 'PX9', 'could not switch away mid-reload');
  A(a.cool < wait, 'switching should be quicker than waiting out the reload');
});

console.log('\n-- USING THINGS, NOT FIRING THEM --');
T('a medkit patches you up, and is not wasted when you are whole', () => {
  const w = range();
  const p = new Player(w);
  const l = new Loadout({ utility1: 'MEDKIT' });
  const a = new Arsenal(w, { loadout: l, start: 'MEDKIT' });
  runA(a, 0.4);
  a.fire([0, 1.6, 0], N, { on: p });
  A(a.ammoNow.count === ITEMS.MEDKIT.count, 'a full-health medkit should be refused');
  p.damage(70, 'test');
  a.cool = 0;
  a.fire([0, 1.6, 0], N, { on: p });
  A(p.health > 70 && a.ammoNow.count === ITEMS.MEDKIT.count - 1, 'health ' + p.health + ' left ' + a.ammoNow.count);
  A(a.cool > 1, 'using one should take a moment');
});
T('a charge is placed on what you are looking at, then set off', () => {
  const w = range();
  w.addSolid([-2, 0, -3.2], [2, 3, -3], 'wall');
  const t = makeTarget(w, [-0.5, 1, -2.9], [0.5, 2, -2.8], { hp: 200 });
  const l = new Loadout({ utility1: 'C5' });
  const a = new Arsenal(w, { loadout: l, start: 'C5' });
  runA(a, 0.4);
  a.fire([0, 1.6, 0], N, {});
  A(a.projectiles.length === 1 && a.projectiles[0].placed, 'nothing was placed');
  A(a.ammoNow.count === ITEMS.C5.count - 1, 'a charge should be used');
  runA(a, 3);
  A(a.projectiles.length === 1, 'it should wait, not tick down');
  // (M6.9.13) a second press places the second; with none left, a press sets them off
  a.cool = 0;
  a.fire([0, 1.6, 0], N, {});
  A(a.projectiles.length === 2 && a.ammoNow.count === 0, 'the second press did not place a second charge');
  runA(a, 1); a.cool = 0;
  a.fire([0, 1.6, 0], N, {});
  runA(a, 0.3);
  A(a.projectiles.length === 0 && t.hp < 200, 'they did not go off: hp ' + t.hp);
});
T('a crate swap cannot refill a pouch: put the empty charges down, take them back, still empty', () => {
  const run = (keep) => {
    const w = range();
    const l = new Loadout({ utility1: 'C5', utility2: 'FLASH' });
    const a = new Arsenal(w, { loadout: l, start: 'C5' });
    a.ammo.C5.count = 0;                                          // out of charges
    const c = new Crate('gear', ['SMOKE']);
    c.swap(l, 'utility1', 'SMOKE'); a.reset(l, keep ? { keep: true } : undefined);   // charges out, smoke in
    A(a.ammo.SMOKE && a.ammo.SMOKE.count === ITEMS.SMOKE.count, 'the smoke should come full');
    c.swap(l, 'utility1', 'C5'); a.reset(l, keep ? { keep: true } : undefined);      // and back again
    return a.ammo.C5 && a.ammo.C5.count;
  };
  A(run(true) === 0, 'swapped back to a full stock of charges: ' + run(true));
  A(run(false) === ITEMS.C5.count, 'without keep (the Quartermaster) the pouch should come full: ' + run(false));
});
T('with nothing in your hands you can still throw a punch', () => {
  const w = range();
  const t = makeTarget(w, [-0.4, 1, -1.2], [0.4, 1.9, -1.1], { hp: 200 });
  const l = new Loadout({ gear: 'LENSES' });
  const a = new Arsenal(w, { loadout: l });
  runA(a, 0.3);
  const r = a.fire([0, 1.6, 0], N, {});
  A(r && r.fists && t.hp < 200, 'no punch: fists=' + (r && r.fists) + ' hp ' + t.hp);
  const far = new World();
  far.addSolid([-30, -1, -30], [30, 0, 30]);
  makeTarget(far, [-0.4, 1, -3], [0.4, 1.9, -2.9], { hp: 200 });
  const a2 = new Arsenal(far, { loadout: new Loadout({}) });
  runA(a2, 0.3);
  const r2 = a2.fire([0, 1.6, 0], N, {});
  A(r2 && !r2.hit, 'fists should not reach 3 m');
});
T('looking away from a flashbang leaves you unblinded', () => {
  const blind = (look) => {
    const w = range();
    const p = new Player(w);
    p.lookDir = () => look;
    const a = new Arsenal(w, { loadout: new Loadout({ utility1: 'FLASH' }) });
    a.projectiles.push({ id: 'FLASH', pos: [0, 1.6, -3], vel: [0, 0, 0], fuse: 0.01 });
    runA(a, 0.1, p);
    return a.blind;
  };
  A(blind([0, 0, -1]) > 2, 'facing it should blind you');
  A(blind([0, 0, 1]) === 0, 'looking away should not: ' + blind([0, 0, 1]));
  A(blind([1, 0, 0]) < 0.6, 'side-on should be slight: ' + blind([1, 0, 0]));
});
T('the new gear is there to test with, and every slot can be left empty', () => {
  for (const g of ['NVG', 'IRGOGS', 'UVGOGS', 'SHADES', 'GASMASK', 'LENSES']) A(ITEMS[g], g + ' missing');
  A(ITEMS.NVG.flashResist < 0, 'night vision should make a flash worse');
  A(ITEMS.SHADES.flashResist < ITEMS.LENSES.flashResist, 'a tinted visor is not polarised lenses');
  const l = new Loadout({ primary: 'K7', gear: 'NVG' });
  A(l.put('primary', null) && l.get('primary') === null, 'a slot should take nothing');
  A(l.put('gear', null) && l.get('gear') === null, 'gear should be removable');
});

console.log('\n-- AMMUNITION AND PLACED CHARGES --');
T('an ammo crate refills only what its rounds fit', () => {
  const l = new Loadout({ primary: 'K7', backup: 'PX9' });
  const a = new Arsenal(range(), { loadout: l });
  a.ammo.K7.reserve = 0; a.ammo.PX9.reserve = 0;
  A(a.canTakeAmmo('AMMO_RIFLE'), 'rifle rounds should be useful');
  A(a.takeAmmo('AMMO_RIFLE') > 0 && a.ammo.K7.reserve > 0, 'rifle reserve not filled');
  A(a.ammo.PX9.reserve === 0, 'rifle rounds should not feed a pistol');
  // rounds you cannot use yet go in your pouch until you find the weapon
  A(a.takeAmmo('AMMO_SNIPER') > 0, 'sniper rounds should still be worth taking');
  A((a.spare.AMMO_SNIPER || 0) > 0, 'they should be kept: ' + JSON.stringify(a.spare));
  A(a.ammo.PX9.reserve === 0, 'sniper rounds should not feed a pistol either');
  l.put('primary', 'LR7');
  a.reset(l);
  A(a.ammo.LR7.reserve > ITEMS.LR7.reserve, 'the pouch should empty into the new rifle: ' + a.ammo.LR7.reserve);
  A((a.spare.AMMO_SNIPER || 0) < 25, 'the pouch should give up what fits: ' + JSON.stringify(a.spare));
  a.takeAmmo('AMMO_PISTOL');
  A(a.ammo.PX9.reserve > 0, 'pistol reserve not filled');
});
T('you cannot hoard ammunition without limit', () => {
  const a = new Arsenal(range(), { loadout: new Loadout({ primary: 'K7' }) });
  for (let i = 0; i < 12; i++) a.takeAmmo('AMMO_RIFLE');
  A(a.ammo.K7.reserve <= ITEMS.K7.reserve * 1.5 + 1, 'reserve ran away: ' + a.ammo.K7.reserve);
  A(!a.canTakeAmmo('AMMO_RIFLE'), 'a full reserve should refuse more');
});
T('a placed charge can be made safe and taken back', () => {
  const w = range();
  w.addSolid([-2, 0, -3.2], [2, 3, -3], 'wall');
  const a = new Arsenal(w, { loadout: new Loadout({ utility1: 'C5' }), start: 'C5' });
  runA(a, 0.4);
  a.fire([0, 1.6, 0], N, {});
  const before = a.ammoNow.count;
  const p = a.chargeNear([0, 0, -2.6], 1.8);
  A(p, 'no charge within reach');
  A(a.disarm(p) && a.projectiles.length === 0, 'not made safe');
  A(a.ammoNow.count === before + 1, 'it should go back in your pouch');
});
T('a charge can be shot to set it off', () => {
  const w = range();
  w.addSolid([-3, 0, -3.2], [3, 3, -3], 'wall');      // within arm's reach
  const t = makeTarget(w, [-0.5, 1, -2.9], [0.5, 2, -2.85], { hp: 200 });
  const l = new Loadout({ primary: 'K7', utility1: 'C5' });
  const a = new Arsenal(w, { loadout: l, start: 'C5' });
  runA(a, 0.4);
  a.fire([0, 1.6, 0], N, {});
  A(a.projectiles.length === 1, 'nothing placed');
  a.select('K7'); a.cool = 0;
  runA(a, 0.4);
  a.fire([0, 1.6, 0], N, { aim: true });
  runA(a, 0.3);
  A(a.projectiles.length === 0, 'the charge should have gone off');
  A(t.hp < 150, 'the blast should have hurt the target: ' + t.hp);
});

console.log('\n-- WHICH WAY TARGETS FALL --');
T('a target goes over the way the round was travelling', () => {
  const fallFrom = (from, dirZ) => {
    const w = range();
    const t = makeTarget(w, [-0.5, 1, -0.05], [0.5, 2, 0.05], { hp: 10 });
    const a = new Arsenal(w, { loadout: new Loadout({ primary: 'LR7' }), start: 'LR7' });
    runA(a, 0.4);
    a.fire(from, [0, 0, dirZ], { aim: true });
    return t.fall;
  };
  A(fallFrom([0, 1.5, 6], -1) === -1, 'shot from the +z side should knock it towards -z');
  A(fallFrom([0, 1.5, -6], 1) === 1, 'shot from the -z side should knock it towards +z');
});

console.log('\n-- THROUGH WALLS AND GLASS --');
const shootThrough = (weapon, surface) => {
  const w = range();
  const opts = {};
  if (surface === 'glass') { opts.tough = 1; opts.glass = true; }
  if (surface === 'thin') opts.tough = 2;
  if (surface === 'toughened') { opts.tough = 3; opts.glass = true; }
  if (surface === 'proof') opts.glass = true;          // no toughness: cannot be beaten
  if (surface !== 'none') w.addSolid([-2, 0, -5.06], [2, 3, -5], 'pane', opts);
  const t = makeTarget(w, [-0.5, 1, -8.05], [0.5, 2, -7.95], { hp: 500 });
  const l = new Loadout({ primary: 'K7' }); l.put('primary', weapon);
  const a = new Arsenal(w, { loadout: l, start: weapon });
  runA(a, 0.4);
  a.fire([0, 1.5, 0], N, { aim: true });
  return 500 - t.hp;
};
T('a pistol goes through glass but not a thin wall', () => {
  A(shootThrough('PX9', 'glass') > 15, 'pistol through glass: ' + shootThrough('PX9', 'glass'));
  A(shootThrough('PX9', 'thin') === 0, 'pistol through a thin wall');
});
T('a rifle goes through a thin wall, losing some of its force', () => {
  const open = shootThrough('K7', 'none'), thin = shootThrough('K7', 'thin');
  A(thin > 0 && thin < open, `rifle: open ${open}, through a thin wall ${thin}`);
});
T('toughened glass needs a battle rifle or a sniper', () => {
  A(shootThrough('K7', 'toughened') === 0, 'a carbine through toughened glass');
  A(shootThrough('LR7', 'toughened') > 0, 'a marksman rifle should get through');
});
T('bulletproof glass stops everything, however big', () => {
  for (const wpn of ['PX9', 'K7', 'LR7', 'LR7X']) A(shootThrough(wpn, 'proof') === 0, wpn + ' went through bulletproof glass');
});
T('ordinary walls stop everything', () => {
  const w = range();
  w.addSolid([-2, 0, -5.4], [2, 3, -5], 'wall');
  const t = makeTarget(w, [-0.5, 1, -8.05], [0.5, 2, -7.95], { hp: 500 });
  const a = new Arsenal(w, { loadout: new Loadout({ primary: 'LR7X' }), start: 'LR7X' });
  runA(a, 0.4);
  a.fire([0, 1.5, 0], N, { aim: true });
  A(t.hp === 500, 'an anti-materiel rifle went through a wall');
});


// ── a double helping is a double helping (M6.9.12, Rhys) ──
T('the same grenades in both utility slots: twice as many, each pair its own, each its own fill', () => {
  const lo = new Loadout({ primary: 'K7', utility1: 'SMOKE', utility2: 'SMOKE' });
  lo.fit('utility2', 'FILL_CS');
  const ar = new Arsenal(range(), { loadout: lo });
  A(lo.keyOf('utility1') === 'SMOKE' && lo.keyOf('utility2') === 'SMOKE@utility2', 'keys: ' + lo.keys());
  const n = ITEMS.SMOKE.count;
  A(ar.ammo.SMOKE.count === n && ar.ammo['SMOKE@utility2'].count === n, 'counts: ' + JSON.stringify(ar.ammo));
  A(!ar.def('SMOKE').gas && ar.def('SMOKE@utility2').gas === 'cs', 'the fill went on both or neither');
  ar.selectSlot(3); A(ar.current === 'SMOKE', 'slot 3 is ' + ar.current);
  ar.cool = 0; ar.throwOne([0, 1.6, 0], N, {});
  A(ar.ammo.SMOKE.count === n - 1 && ar.ammo['SMOKE@utility2'].count === n, 'throwing from slot 3 took from slot 4');
  ar.selectSlot(4); A(ar.current === 'SMOKE@utility2', 'slot 4 is ' + ar.current);
  A(ar.weapon.name === ITEMS.SMOKE.name, 'its name: ' + ar.weapon.name);
});
T('the same pistol as primary and backup: two pistols, a magazine each, mods each', () => {
  const lo = new Loadout({ primary: 'PX9', backup: 'PX9' });
  lo.fit('primary', 'EXTMAG');
  const ar = new Arsenal(range(), { loadout: lo });
  A(ar.current === 'PX9', 'starts on ' + ar.current);
  const big = ar.def('PX9').mag, small = ar.def('PX9@backup').mag;
  A(big > small && small === ITEMS.PX9.mag, 'mags: ' + big + ' / ' + small);
  ar.cool = 0; ar.fire([0, 1.6, 0], N, {});
  A(ar.ammo.PX9.mag === big - 1 && ar.ammo['PX9@backup'].mag === small, 'the shot came out of both');
  ar.selectSlot(2); A(ar.current === 'PX9@backup', 'slot 2 is ' + ar.current);
  // one in each slot, on a crate swap or a fresh loadout: no leftovers
  lo.put('backup', 'V99'); ar.reset(lo);
  A(!ar.ammo['PX9@backup'] && ar.ammo.V99 && ar.ammo.PX9, 'after the swap: ' + Object.keys(ar.ammo));
});

// ── chained charges and mines (M6.9.13, Rhys) ──
T('charges chain: place several, then right mouse sets them all off together', () => {
  const w = range();
  w.addSolid([-4, 0, -3.2], [4, 3, -3], 'wall');
  const a = new Arsenal(w, { loadout: new Loadout({ utility1: 'REMOTE' }), start: 'REMOTE' });
  runA(a, 0.4);
  for (const dx of [-0.6, 0, 0.6]) { a.cool = 0; a.fire([dx, 1.6, 0], N, {}); }
  A(a.liveCharges().length === 3 && a.ammoNow.count === 0, 'placed ' + a.liveCharges().length);
  runA(a, 2);
  A(a.liveCharges().length === 3, 'they went off by themselves');
  const r = a.detonateAll();
  runA(a, 0.3);
  A(r && r.detonated === 3 && a.events.filter((e) => e.type === 'blast').length === 3 && !a.projectiles.length, 'not all three went off');
});
T('a proximity mine arms after a moment, then goes off when someone comes near - not before', () => {
  const w = range();
  const a = new Arsenal(w, { loadout: new Loadout({ utility1: 'PROXMINE' }), start: 'PROXMINE' });
  runA(a, 0.4);
  a.fire([0, 1.6, 0], [0, -1, -0.3], {});                       // on the floor ahead
  A(a.liveCharges().length === 1, 'not placed');
  const m = a.projectiles[0];
  const t = makeTarget(w, [m.pos[0] - 0.3, 0, m.pos[2] - 0.3], [m.pos[0] + 0.3, 1.8, m.pos[2] + 0.3], { hp: 300 });
  runA(a, 1);
  A(a.projectiles.length === 1, 'it went off before it armed');
  runA(a, 2.5);
  A(!a.projectiles.length && t.hp < 300, 'it did not go off when armed with someone on it: hp ' + t.hp);
  // and it does not go off for you
  const w2 = range();
  const b = new Arsenal(w2, { loadout: new Loadout({ utility1: 'PROXMINE' }), start: 'PROXMINE' });
  runA(b, 0.4);
  b.fire([0, 1.6, 0], [0, -1, -0.3], {});
  runA(b, 5);
  A(b.projectiles.length === 1, 'it went off with only you about');
});
T('(M6.20.2, Rhys) mines are non-insulated: a blast near one sets it off, and it the next - C5 is insulated and stays put', () => {
  const w = range();
  const a = new Arsenal(w, { loadout: new Loadout({ utility1: 'REMOTE', utility2: 'C5' }), start: 'REMOTE' });
  runA(a, 0.4);
  a.fire([0, 1.6, 0], [0, -1, -0.3], {}); a.cool = 0;
  a.fire([4, 1.6, 0], [0, -1, -0.3], {}); a.cool = 0;
  a.fire([-12, 1.6, 0], [0, -1, -0.3], {}); a.cool = 0;         // and one well away
  const keys = Object.keys(a.ammo); const c5 = keys.find((k) => k.startsWith('C5'));
  a.selectSlot && a.ammo[c5] && (a.current = c5); a.fire([2, 1.6, 0], [0, -1, -0.3], {});   // a C5 among them
  const live0 = a.projectiles.length;
  A(live0 === 4, 'placed ' + live0);
  const first = a.projectiles.find((q) => Math.abs(q.pos[0]) < 0.5);
  a.detonate({ id: 'ROCKET', pos: [first.pos[0] - 1, first.pos[1], first.pos[2]] }, { eyePos: [100, 1.6, 100], damage() {} });
  runA(a, 1.5);
  const left = a.projectiles.map((q) => q.id.split('@')[0]);
  A(left.length === 2 && left.includes('C5') && left.includes('REMOTE'), 'left: ' + left);
  A(a.projectiles.find((q) => q.id.startsWith('REMOTE')).pos[0] < -10, 'the far mine went too');
  A(a.events.filter((e) => e.type === 'chained').length === 2, 'chained ' + a.events.filter((e) => e.type === 'chained').length);
});
T('aimed, a gun\'s top edge (its sights) sits on the crosshair, not 22 degrees below it (M6.12.3, Rhys: it jumped up and missed)', () => {
  const hold = { pos: [0.2, -0.2, -0.42], ads: [0, -0.22, -0.36] };
  const top = sightTop({ axis: 2, size: [0.06, 0.2, 1] }, 0.72);          // a rifle 0.72 m long, 0.144 m tall
  A(near(top, 0.072, 1e-9), 'top ' + top);
  const at = adsPlace(hold, top, 1, 0.72);
  // the angle from the eye down to the gun's top edge, at its back end and at its muzzle
  const back = at[2] + 0.35 * 0.72, muzzle = at[2] - 0.65 * 0.72;
  const below = (z) => Math.atan2(-(at[1] + top), -z) * 180 / Math.PI;
  A(at[0] === 0 && below(back) < 1.5 && below(muzzle) < 0.5, 'the sights are ' + below(back).toFixed(1) + ' / ' + below(muzzle).toFixed(1) + ' degrees below the crosshair');
  A(back < -0.2, 'its back end is ' + (-back).toFixed(2) + ' m from your eye: a block against it');
  const old = Math.atan2(0.22 - top, 0.36) * 180 / Math.PI;
  A(old > 15, 'the old hold was not the fault? ' + old.toFixed(1));
  A(adsPlace(hold, top, 4, 1.05) === hold.ads, 'a scoped weapon moved into the magnified picture');
});
T('crouched and aiming, you peek up - and the round starts where you see from, not ahead of the view (M6.13.0, Rhys)', () => {
  const w = new World();
  w.addSolid([-50, -1, -50], [50, 0, 50], 'floor');
  w.addSolid([-1, 0, -1.2], [1, 0.9, -1.0], 'cover');            // waist-high cover ahead
  const p = new Player(w, { pos: [0, 0, 0], yaw: 0 });
  for (let i = 0; i < 30; i++) p.step(DT, Object.assign(blankInput(), { crouch: true }));
  A(p.stance === 1, 'not crouched: ' + p.stance);
  let cam = p.eyeHeight, worst = 0, worstNew = 0;
  for (let i = 0; i < 40; i++) {
    p.step(DT, Object.assign(blankInput(), { crouch: true, aim: true }));
    cam = followEye(cam, p.eyeHeight, DT);
    const view = [p.pos[0], p.pos[1] + cam, p.pos[2]];
    worst = Math.max(worst, p.eyePos[1] - view[1]);
    worstNew = Math.max(worstNew, Math.abs(shotOrigin(p.eyePos, view)[1] - view[1]));
  }
  A(p.peek > 0.5, 'did not peek');
  A(worst > 0.08, 'the old origin was not ahead of the view? ' + worst.toFixed(3));
  A(worstNew < 1e-9, 'the round starts ' + worstNew.toFixed(3) + ' m off the view');
  A(shotOrigin([0, 1.6, 0], [30, 1.6, 0])[0] === 0 && shotOrigin([0, 1.6, 0], null)[1] === 1.6, 'a stale view was used');
});

console.log('\n-- M6.17.3: sidearms with their own characters; the VX-40 --');
// fire as the game does: a press, then the gun's own rounds while a burst runs
const press = (ar, frames, pressAt) => {
  let shots = 0, first = null, last = null;
  for (let f = 0; f < frames; f++) {
    const want = (pressAt || [0]).includes(f) || ar.burstLeft > 0;
    if (want && ar.fire([0, 1.5, 0], N, {})) { shots++; if (first === null) first = f; last = f; }
    ar.step(DT);
  }
  return { shots, first, last };
};
const sidearm = (id) => { const ar = new Arsenal(range(), { loadout: new Loadout({ backup: id }) }); runA(ar, 1); return ar; };
T('the V-27C: one press, three rounds in quick succession - then it waits for the next press', () => {
  const ar = sidearm('V27C'), r = press(ar, 90);
  A(r.shots === 3, r.shots + ' rounds from one press');
  A((r.last - r.first) * DT < 0.15, 'the burst took ' + ((r.last - r.first) * DT).toFixed(2) + ' s');
  A(ar.ammoNow.mag === ITEMS.V27C.mag - 3, 'mag ' + ar.ammoNow.mag);
  // and the PX9, the same press: one round
  const px = sidearm('PX9'), q = press(px, 90);
  A(q.shots === 1, 'the PX9 fired ' + q.shots + ' rounds from one press');
});
T('the V-27C\'s burst stops short when the magazine runs dry, and a reload ends it', () => {
  const ar = sidearm('V27C');
  ar.ammoNow.mag = 2;
  const r = press(ar, 60);
  A(r.shots === 2 && ar.burstLeft === 0, r.shots + ' rounds from 2, burst left ' + ar.burstLeft);
  const b = sidearm('V27C'); b.fire([0, 1.5, 0], N, {});
  A(b.burstLeft === 2, 'no burst under way');
  b.ammoNow.reserve = 50; b.ammoNow.mag = 10; b.cool = 0; b.reload();
  A(b.burstLeft === 0, 'reloading did not end the burst');
});
T('two sidearms, two characters: the PX9 hits harder, carries further and is steadier aimed; the V-27C is quicker to draw and reload and steadier on the move', () => {
  const P9 = ITEMS.PX9, V = ITEMS.V27C;
  A(P9.damage > V.damage * 1.4 && P9.best > V.best * 2 && P9.adsSpread < V.adsSpread * 0.6, 'the PX9 is not the heavier, longer, more precise gun');
  A(V.draw < P9.draw / 2 && V.reload < P9.reload - 0.3 && V.moveSpread < P9.moveSpread / 2, 'the V-27C is not the quicker, handier gun');
  A(V.damage * V.burst > P9.damage * 1.5, 'a burst is not more than a PX9 round at close quarters');
  // drawn: the V-27C is up and firing before the PX9
  const lo = new Loadout({ primary: 'PX9', backup: 'V27C' }), ar = new Arsenal(range(), { loadout: lo });
  runA(ar, 1); ar.selectSlot(2); A(Math.abs(ar.cool - V.draw) < 1e-9, 'V-27C draw ' + ar.cool);
  runA(ar, 1); ar.selectSlot(1); A(Math.abs(ar.cool - P9.draw) < 1e-9, 'PX9 draw ' + ar.cool);
  // and each says what it is, in YOUR GEAR
  A(P9.trait && V.trait && P9.trait !== V.trait, 'no traits');
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/d\.trait \?/.test(main) && /arsenal\.burstLeft > 0 \|\|/.test(main), 'the game does not show the trait or fire the burst');
});
T('the VX-40 Marksman: a semi-automatic marksman rifle, ten rounds, a press a round - and a guard can carry one', () => {
  const X = ITEMS.VX40, L7 = ITEMS.LR7;
  A(X && X.family === 'sniper' && !X.auto && !X.burst && X.mag === 10, 'not a ten-round semi-automatic');
  A(X.rate < L7.rate / 3 && X.damage < L7.damage && X.zoom >= 2, 'not lighter and quicker than the LR7');
  const ar = new Arsenal(range(), { loadout: new Loadout({ primary: 'VX40' }) }); runA(ar, 1);
  const r = press(ar, 60, [0, 20, 40]);
  A(r.shots === 3, r.shots + ' rounds from three presses a third of a second apart');
  A(ARMS.dmr && ARMS.dmr.item === 'VX40' && ARMS.dmr.mag === 10, 'no VX-40 for guards');
  const lvl = readFileSync(new URL('../src/game/level_casino.js', import.meta.url), 'utf8');
  A(/id: 'C12'[^\n]*arms: 'dmr'/.test(lvl), 'the casino\'s marksman does not carry the VX-40');
  const view = readFileSync(new URL('../src/game/weapons_view.js', import.meta.url), 'utf8');
  A(/\['VX40', 'SNIPER'\]/.test(view) && /\['V27C', 'PISTOL'\]/.test(view), 'no hold for the new weapons');
});

console.log('\n-- M6.17.4: mods you can see, and read --');
T('YOUR GEAR says what is fitted: "V-27C Compact (silenced)", "(scoped 8x)" and so on', () => {
  A(withTags('V-27C Compact', ['SILENCER']) === 'V-27C Compact (silenced)', withTags('V-27C Compact', ['SILENCER']));
  A(withTags('LR7 Marksman', ['SCOPE8', 'SILENCER']) === 'LR7 Marksman (scoped 8x, silenced)', withTags('LR7 Marksman', ['SCOPE8', 'SILENCER']));
  A(withTags('PX9 Sidearm', []) === 'PX9 Sidearm' && withTags('PX9 Sidearm') === 'PX9 Sidearm', 'a bare gun tagged');
  for (const [k, m] of Object.entries(MODS)) A(m.tag, k + ' has no tag');
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/withTags\(d\.name \|\| key, modList\)/.test(main), 'YOUR GEAR does not use the tags');
});
T('a silencer on the muzzle, a sight on top, a grip under the front: drawn where they belong, and kept up to date', () => {
  const len = 0.17, top = 0.03;
  const [sil] = attachmentsFor(['SILENCER'], len, top, 'pistol');
  A(sil && sil.shape === 'cyl', 'no silencer drawn');
  const back = sil.pos[2] + sil.size[1] / 2, front = sil.pos[2] - sil.size[1] / 2;
  A(Math.abs(back - (-0.65 * len)) < 0.02 && front < -0.65 * len - 0.08, 'the silencer is not on the muzzle: ' + back.toFixed(3) + '..' + front.toFixed(3));
  A(sil.pos[1] > 0 && sil.pos[1] < top, 'the silencer is not in line with the barrel');
  const sc = attachmentsFor(['SCOPE8'], 1.05, 0.05, 'sniper');
  A(sc.length && sc.every((a) => a.pos[1] >= 0.05), 'the scope is not on top');
  const gr = attachmentsFor(['GRIP'], 0.72, 0.06, 'rifle');
  A(gr.length && gr[0].pos[1] < -0.06 && gr[0].pos[2] < 0, 'the grip is not under the front');
  A(!attachmentsFor([], 0.2, 0.03, 'pistol').length, 'something drawn on a bare gun');
  const view = readFileSync(new URL('../src/game/weapons_view.js', import.meta.url), 'utf8');
  A(/if \(e && a\.weapon\) this\.dress\(e, id, a\.weapon\.mods/.test(view) && /spawnModel\(id, modelName, mods\)/.test(view), 'the held and dropped weapons are not dressed');
});
T('a weapon put down keeps its mods, and comes back with them when taken again', () => {
  const lo = new Loadout({ backup: 'V27C' }); lo.fit('backup', 'SILENCER');
  const out = lo.put('backup', 'PX9');
  A(out && out.id === 'V27C' && out.mods.includes('SILENCER'), 'the V-27C came out without its silencer');
  lo.put('backup', out.id, out.mods);
  A(lo.mods.backup.includes('SILENCER') && lo.statsFor('backup').quiet === MODS.SILENCER.quiet, 'taken back without it');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/lo\.put\(slot, d\.item, d\.mods\)/.test(rt) && /dropAt\(out\.id, model, d\.pos, inMag, out\.mods\)/.test(rt), 'the mission does not carry mods with dropped weapons');
});

console.log('\n-- M6.17.5: Z / X; the Revolver; crates; sights --');
T('Z / X: a grenade thrown from utility 1 without putting the gun away; the gun still in your hands, ready', () => {
  const lo = new Loadout({ primary: 'K7', backup: 'PX9', utility1: 'FRAG', utility2: 'C5' }), ar = new Arsenal(range(), { loadout: lo });
  runA(ar, 1);
  A(ar.current === 'K7', 'not holding the K7');
  const r = ar.quickUse('utility1', [0, 1.6, 0], N, {}, 'tap');
  A(r && r.thrown && ar.current === 'K7' && ar.ammo.FRAG.count === ITEMS.FRAG.count - 1, 'no throw, or the gun was put away: ' + ar.current);
  A(ar.projectiles.some((p) => p.id === 'FRAG' && !p.placed), 'no grenade in the air');
  // the last one thrown: still the gun, not bare hands
  ar.ammo.FRAG.count = 1; ar.cool = 0;
  ar.quickUse('utility1', [0, 1.6, 0], N, {}, 'tap');
  A(ar.current === 'K7' && ar.ammo.FRAG.count === 0, 'after the last grenade, holding ' + ar.current);
});
T('Z / X with a charge: a tap places one (and another); a hold sets them all off; nothing placed, no hold to wait for', () => {
  const w = range(); w.addSolid([-2, 0, -3], [2, 3, -2.5], 'wall');
  const lo = new Loadout({ primary: 'K7', utility2: 'C5' }), ar = new Arsenal(w, { loadout: lo });
  runA(ar, 1);
  A(ar.quickUse('utility2', [0, 1.5, 0], N, {}, 'tap').placed && ar.current === 'K7', 'the first did not go on the wall');
  runA(ar, 1);
  A(ar.quickUse('utility2', [0.5, 1.5, 0], N, {}, 'tap').placed && ar.liveCharges('C5').length === 2, 'a second tap did not place another');
  A(ar.quickUse('utility2', [0, 1.5, 0], N, {}, 'hold').detonated === 2, 'the hold did not set them off');
  // the key: a press with nothing placed acts at once; with charges placed it waits to see
  let st = {};
  A(quickKey(st, true, 1 / 60, false) === 'tap', 'nothing placed: not at once');
  A(quickKey(st, true, 1 / 60, false) === null && quickKey(st, false, 1 / 60, false) === null, 'acted twice');
  st = {}; let out = [];
  for (let t = 0; t < 0.2; t += 1 / 60) out.push(quickKey(st, true, 1 / 60, true));
  out.push(quickKey(st, false, 1 / 60, true));
  A(out.filter(Boolean).join() === 'tap', 'a short press with charges placed: ' + out.filter(Boolean).join());
  st = {}; out = [];
  for (let t = 0; t < QUICK.hold + 0.2; t += 1 / 60) out.push(quickKey(st, true, 1 / 60, true));
  out.push(quickKey(st, false, 1 / 60, true));
  A(out.filter(Boolean).join() === 'hold', 'a long press: ' + out.filter(Boolean).join());
});
T('Z / X with a medkit: used where you stand, the gun kept; Z and X bound out of the box, the old X-to-detonate stepping aside', () => {
  const lo = new Loadout({ primary: 'K7', utility1: 'MEDKIT' }), ar = new Arsenal(range(), { loadout: lo });
  runA(ar, 1);
  const me = { health: 40 };
  A(ar.quickUse('utility1', [0, 1.6, 0], N, { on: me }, 'tap') && me.health > 40 && ar.current === 'K7', 'the medkit was not used');
  const inp = readFileSync(new URL('../src/game/input.js', import.meta.url), 'utf8');
  A(/use1: \['KeyZ'\], use2: \['KeyX'\], detonate: \[\]/.test(inp), 'Z / X not bound');
  A(/out\.bindings\.detonate = out\.bindings\.detonate\.filter\(\(k\) => k !== 'KeyX'\)/.test(inp), 'an old saved X-to-detonate would fight X');
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/quickKey\(st, input\.held\('use' \+ n\)/.test(main) && /arsenal\.quickUse\(slot, shotEye\(\), aimDir\(\)/.test(main), 'the game does not use Z / X');
});
T('the Revolver: six heavy rounds, slow - and nothing fits it', () => {
  const R = ITEMS.RV357;
  A(R && R.name === 'Revolver' && R.family === 'pistol' && R.mag === 6 && R.damage > ITEMS.PX9.damage && R.rate > ITEMS.PX9.rate, 'not the Revolver');
  for (const m of ['SILENCER', 'SCOPE2', 'GRIP', 'EXTMAG']) A(!modFits(m, 'RV357'), m + ' fits the Revolver');
  const lo = new Loadout({ backup: 'RV357' });
  A(lo.fit('backup', 'SILENCER') === false && !lo.mods.backup.length, 'a silencer went on');
  A(modFits('SILENCER', 'PX9'), 'and the PX9 still takes one');
});
T('a crate says only "Open crate" - what is in it is found by opening it (the Quartermaster keeps his name)', () => {
  A(cratePrompt(new Crate('gear', ['C5'])) === 'E  Open crate', cratePrompt(new Crate('gear', ['C5'])));
  const c = new Crate('gear', ['FLASH']); c.label = 'Breaching charges';
  A(cratePrompt(c) === 'E  Open crate', 'the label shows: ' + cratePrompt(c));
  const q = new Crate('armoury', []); q.label = 'QUARTERMASTER'; q.infinite = true;
  A(cratePrompt(q) === 'E  Open QUARTERMASTER', cratePrompt(q));
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/: near \? cratePrompt\(near\)/.test(main) && /c\.infinite && c\.label \? c\.label : 'CRATE'/.test(main), 'the game still shows the label');
});
T('sights: the marksman rifles carry theirs; aiming through one shows its reticle - crosshairs, a chevron, a red dot - and iron sights stay as they are', () => {
  A(scopeKind(Object.assign({ kind: 'gun' }, statsOf('LR7'))) === 'cross' && scopeKind(Object.assign({ kind: 'gun' }, statsOf('VX40'))) === 'chevron', 'the rifles\' sights');
  A(scopeKind(Object.assign({ kind: 'gun' }, statsOf('K7', ['SCOPE2']))) === 'dot' && scopeKind(Object.assign({ kind: 'gun' }, statsOf('K7'))) === 'none', 'the 2x and iron sights');
  A(scopeKind(Object.assign({ kind: 'gun' }, statsOf('LR7', ['SCOPE8']))) === 'cross' && scopeKind(null) === 'none' && scopeKind({ kind: 'melee' }) === 'none', 'others');
  // the built-in sight drawn on the rifle; none added when one is fitted, none on a carbine
  A(attachmentsFor([], 0.98, 0.05, 'sniper', 3).some((a) => a.mod === 'SCOPE3' && a.pos[1] > 0.05), 'no sight on the VX-40');
  A(attachmentsFor(['SCOPE8'], 1.05, 0.05, 'sniper', 4).filter((a) => a.shape === 'cyl').length === 1, 'two sights on a scoped LR7');
  A(!attachmentsFor([], 0.72, 0.06, 'rifle', 1).length, 'a sight on a bare carbine');
  for (const k of ['cross', 'chevron', 'dot']) A(/^<svg/.test(scopeSvg(k)) && scopeSvg(k).endsWith('</svg>'), k + ': no picture');
  A(/mask/.test(scopeSvg('cross')) && !/mask/.test(scopeSvg('dot')), 'a dot should not black out the view');
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/drawScope\(scoped \? sk : sk === 'dot' \? 'dot' : 'none'\)/.test(main) && /scoped,/.test(main), 'the game does not show the sight');
  const view = readFileSync(new URL('../src/game/weapons_view.js', import.meta.url), 'utf8');
  A(/if \(e && opts\.scoped\) e\.enabled = false;/.test(view), 'the gun stays in the way of the scope');
});

console.log('\n-- M6.17.6: the MP2 and the Revolver --');
T('the MP2: the briefest press is three rounds; held, it runs on', () => {
  const ar = new Arsenal(range(), { loadout: new Loadout({ primary: 'MP2' }) }); runA(ar, 1);
  let shots = 0;
  for (let f = 0; f < 60; f++) { const want = f === 0 || ar.burstLeft > 0; if (want && ar.fire([0, 1.5, 0], N, { fresh: f === 0 })) shots++; ar.step(DT); }
  A(shots === 3, shots + ' rounds from a tap');
  const b = new Arsenal(range(), { loadout: new Loadout({ primary: 'MP2' }) }); runA(b, 1); let held = 0;
  for (let f = 0; f < 60; f++) { if (b.fire([0, 1.5, 0], N, { fresh: f === 0 })) held++; b.step(DT); }
  A(held >= 12, held + ' rounds in a second held');
  // a sidearm is untouched: one press, one round
  const c = new Arsenal(range(), { loadout: new Loadout({ backup: 'PX9' }) }); runA(c, 1); let one = 0;
  for (let f = 0; f < 60; f++) { const want = f === 0 || c.burstLeft > 0; if (want && c.fire([0, 1.5, 0], N, { fresh: f === 0 })) one++; c.step(DT); }
  A(one === 1, 'the PX9 fired ' + one);
});
T('the Revolver: loaded a round at a time - each heard - and a press mid-load fires what is in it', () => {
  const ar = new Arsenal(range(), { loadout: new Loadout({ backup: 'RV357' }) }); runA(ar, 1);
  ar.ammoNow.mag = 1;
  A(ar.reload(), 'no reload');
  let rounds = 0, done = false;
  for (let f = 0; f < 60 * 4 && !done; f++) { ar.step(DT); for (const e of ar.events) { if (e.type === 'roundIn') rounds++; if (e.type === 'reloaded') done = true; } ar.events.length = 0; }
  A(rounds === 5 && ar.ammoNow.mag === 6 && done, rounds + ' rounds in, mag ' + ar.ammoNow.mag);
  // again, interrupted after two rounds
  ar.ammoNow.mag = 0; ar.reload(); rounds = 0;
  for (let f = 0; f < 60 * 4 && rounds < 2; f++) { ar.step(DT); for (const e of ar.events) if (e.type === 'roundIn') rounds++; ar.events.length = 0; }
  ar.cool = 0;
  A(ar.fire([0, 1.5, 0], N, { fresh: true }) && ar.reloading === 0 && ar.ammoNow.mag === 1, 'firing did not stop the loading: mag ' + ar.ammoNow.mag + ', loading ' + ar.reloading);
  const au = readFileSync(new URL('../src/game/audio.js', import.meta.url), 'utf8'), main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/w && w\.revolver &&/.test(au) && /roundIn\(\) \{/.test(au) && /ev\.type === 'roundIn'\) audio\.roundIn\(\)/.test(main), 'no revolver sounds');
  A(/wview\.onShot\(arsenal\.weapon && arsenal\.weapon\.recoil/.test(main), 'the kick is the same for every gun');
});
console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + '):\n' + fails.map((f) => '  * ' + f).join('\n') : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
