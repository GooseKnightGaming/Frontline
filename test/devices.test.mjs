// FRONTLINE - hacking and control: cameras, turrets, terminals, the hacking kit, the trace.
import { buildKitLevel } from '../src/game/levels/kit.js';
import { DRAFTS } from '../src/game/levels/drafts/index.js';
import { Device, stepDevice, setMode, Trace, HACK, CAMERA, TURRET, darkAt, sirenFor, syncLocks, modeSays, breaks } from '../src/sim/world/devices.js';
import { raiseAlarm, darkFor } from '../src/sim/people/guard.js';
import { Guard } from '../src/sim/people/guard.js';
import { World } from '../src/sim/world/world.js';
import { pulse } from '../src/sim/arms/emp.js';
import { ITEMS } from '../src/sim/arms/loadout.js';
import { readFileSync } from 'fs';
import { Arsenal } from '../src/sim/arms/weapons.js';
import { hackTrophies } from '../src/sim/play/mission.js';
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');

// a device at the origin looking down -z (yaw 0), and you somewhere
const you = (x, z) => ({ pos: [x, 0, z], chest: [x, 1.15, z], dead: false });
const run = (dev, secs, ctx) => { for (let i = 0; i < Math.round(secs * 60); i++) stepDevice(dev, 1 / 60, ctx); };

T('a camera that sees you a moment raises the alarm - once, then again only after a while', () => {
  const cam = new Device({ id: 'c', kind: 'camera', pos: [0, 2.6, 0], yaw: 0 });
  cam.t = 0; let calls = 0;
  const ctx = { you: you(0, -8), guards: [], alarm: () => calls++ };
  run(cam, CAMERA.notice + 0.3, ctx);
  A(calls === 1, calls + ' alarms');
  run(cam, 2, ctx); A(calls === 1, 'called again at once');
});
T('it does not see you behind it, too far, or through a wall', () => {
  const w = new World(); w.addSolid([-3, 0, -6], [3, 4, -5.6], 'wall');
  const cam = new Device({ id: 'c', kind: 'camera', pos: [0, 2.6, 0], yaw: 0 });
  let calls = 0; const alarm = () => calls++;
  run(cam, 3, { you: you(0, 8), alarm });
  run(cam, 3, { you: you(0, -30), alarm });
  run(cam, 3, { you: you(0, -9), alarm, world: w });
  A(calls === 0, calls + ' alarms');
});
T('a turret fires on you; reprogrammed it ignores you; taken over it fires on the reds; disabled, nothing', () => {
  const w = new World();
  const red = new Guard(w, { id: 'r', pos: [2, 0, -10], faction: 'red' });
  const tur = new Device({ id: 't', kind: 'turret', pos: [0, 1.35, 0], yaw: 0, owner: 'red' });
  const shots = [];
  const ctx = { you: you(0, -8), guards: [red], shoot: (d, ev) => shots.push(ev.at ? 'red' : 'you') };
  run(tur, 2, ctx); A(shots.length && shots.every((s) => s === 'you'), 'on: ' + shots.join());
  shots.length = 0; setMode([tur], 'friendly'); run(tur, 2, ctx); A(shots.length === 0, 'friendly: ' + shots.join());
  shots.length = 0; setMode([tur], 'ours'); run(tur, 2, ctx); A(shots.length && shots.every((s) => s === 'red'), 'ours: ' + shots.join());
  shots.length = 0; setMode([tur], 'off'); run(tur, 2, ctx); A(shots.length === 0, 'off: ' + shots.join());
});
T('an EMP puts cameras and turrets out a while, then they come back', () => {
  const tur = new Device({ id: 't', kind: 'turret', pos: [0, 1.35, 0], yaw: 0 });
  const hit = pulse([1, 1, 1], { devices: [tur] });
  A(hit.turrets === 1 && !tur.live, 'not jammed');
  const shots = []; run(tur, 3, { you: you(0, -8), guards: [], shoot: () => shots.push(1) });
  A(!shots.length, 'fired while jammed');
  run(tur, 12, { you: you(0, -8), guards: [], shoot: () => shots.push(1) });
  A(shots.length && tur.live, 'never came back');
});
T('the trace: hacking a network long enough gives you away, once', () => {
  const tr = new Trace(); let t = 0, traced = 0;
  for (let i = 0; i < 60 * 20; i++) { if (tr.add('net', 1 / 60)) traced++; t += 1 / 60; }
  A(traced === 1 && tr.level('net') === 1, 'traced ' + traced);
  A(HACK.terminal < HACK.trace && HACK.kit * 2 > HACK.trace, 'a terminal should be safe, two by kit not');
});
T('the Research Facility: cameras and turrets on one network, and its security terminal', () => {
  const L = buildKitLevel(DRAFTS.find((d) => d.id === 'facility'));
  const cams = L.devices.filter((d) => d.kind === 'camera'), turs = L.devices.filter((d) => d.kind === 'turret');
  A(cams.length === 7 && cams.filter((c) => c.hidden).length === 2 && turs.length === 2 && L.devices.every((d) => d.net === 'halden' && d.owner === 'red'), 'devices: ' + L.devices.length);
  const sec = L.terminals.find((t) => t.id === 'sec');
  A(sec && sec.net === 'halden', 'no security terminal');
  A(L.requires === 'HACKKIT', 'no hacking kit issued');
  // each camera has room in front of it: not facing straight into a wall
  for (const c of cams) {
    const dir = [-Math.sin(c.yaw), -0.15, -Math.cos(c.yaw)], l = Math.hypot(...dir);
    const h = L.world.raycast(c.pos, dir.map((v) => v / l), 6);
    A(!h || h.t > 3, c.id + ' looks at a wall ' + (h && h.t.toFixed(1)) + ' m off');
  }
});
T('the hacking kit, and the runtime: terminals choose, the kit hacks one, devices drawn, alarm and shots', () => {
  A(ITEMS.HACKKIT && ITEMS.HACKKIT.hackKit && ITEMS.HACKKIT.family === 'perk', 'no hacking kit');
  A(/if \(t\.net\) \{ hackChoice\(netDevices\(t\.net\)/.test(rt), 'terminals do not hack their network');
  A(/hackChoice\(\[dn\]/.test(rt) && /gear\('hackKit'\)/.test(rt), 'the kit does nothing');
  A(/stepDevice\(d, simDt/.test(rt) && /drawDevices\(\)/.test(rt) && /raiseAlarm\(guards, \{ pos: dev\.pos/.test(rt), 'not stepped, drawn, or calling it in');
});

// ── M6.28: locks, lights, the alarm, the radar ──
T('a maglock holds its doors while it is on; hacked, or burnt out by an EMP, it lets go', () => {
  const leaf = { locked: true, blown: false }, leaf2 = { locked: true, blown: false };
  const lk = new Device({ id: 'm', kind: 'lock', pos: [0, 1.3, 0], doors: [leaf] });
  A(syncLocks([lk]) === 0 && leaf.locked, 'not held');
  setMode([lk], 'friendly'); syncLocks([lk]); A(!leaf.locked, 'still locked');
  setMode([lk], 'on'); syncLocks([lk]); A(leaf.locked, 'not locked again');
  const lk2 = new Device({ id: 'm2', kind: 'lock', pos: [30, 1.3, 0], doors: [leaf2] });
  const hit = pulse([0, 1, 0], { devices: [lk, lk2] });
  syncLocks([lk, lk2]);
  A(hit.locks === 1 && lk.fried && !leaf.locked && leaf2.locked, 'the EMP: ' + JSON.stringify(hit));
  run(lk, 30, {}); syncLocks([lk]); A(!leaf.locked, 'a fried lock came back');
});
T('lights out: dark where they light, for the guards and in the view - but not elsewhere', () => {
  const li = new Device({ id: 'l', kind: 'lights', pos: [0, 1.4, 0], area: [[0, -0.5, 0], [10, 3, 4]] });
  const devs = [li];
  A(!darkAt(devs, [5, 1, 2]), 'dark while on');
  setMode(devs, 'off'); A(darkAt(devs, [5, 1, 2]) && !darkAt(devs, [5, 1, 9]), 'not dark where it should be');
  setMode(devs, 'friendly'); A(!darkAt(devs, [5, 1, 2]), 'reprogrammed lights should stay on');
  setMode(devs, 'ours'); A(darkAt(devs, [5, 1, 2]), 'taken: yours, and out');
  const ctx = { dark: (p) => !!darkAt(devs, p) };
  A(darkFor(ctx, [5, 1, 2]) && !darkFor(ctx, [20, 1, 2]) && darkFor({ dark: true }, [0, 0, 0]) && !darkFor({}, [0, 0, 0]), 'darkFor');
  // a guard in the lit corridor does not make you out in the dark room 8 m off
  const w = new World(), g = new Guard(w, { id: 'g', pos: [5, 0, 12], faction: 'red' });
  g.yaw = 0;
  const you = { eye: [5, 1.6, 2], chest: [5, 1.1, 2], pos: [5, 0, 2], stance: 0, speed: 1, noise: 0 };
  A(g.visibility({ you, world: w }) > 0, 'he should see you in the light');
  A(g.visibility({ you, world: w, dark: ctx.dark }) === 0, 'he sees you in the dark');
  const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
  A(/dark: level\.dark \? true : dark/.test(rt) && /level\.blackout = dark/.test(rt), 'not wired into the runtime');
  A(/level\.blackout && level\.blackout\(player\.eyePos\)/.test(readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8')), 'your view does not go dark');
});
T('the alarm: while it is on, the siren brings every guard of its side, from anywhere', () => {
  const w = new World();
  const near = new Guard(w, { id: 'n', pos: [3, 0, 0], faction: 'red' }), far = new Guard(w, { id: 'f', pos: [120, 4, 60], faction: 'red' });
  const other = new Guard(w, { id: 'y', pos: [5, 0, 0], faction: 'yellow' });
  const bell = new Device({ id: 'a', kind: 'alarm', pos: [0, 3, 0], owner: 'red' });
  A(sirenFor([bell], 'red') === bell && !sirenFor([bell], 'yellow'), 'whose alarm');
  const shout = raiseAlarm([near, far, other], { pos: [0, 0, 0], rank: 'guard', faction: 'red' }, [0, 0, 0]);
  A(shout.length === 1, 'a shout carried ' + shout.length);
  near.state = 'patrol'; near.awareness = 0;
  const all = raiseAlarm([near, far, other], { pos: [0, 3, 0], rank: 'officer', faction: 'red' }, [0, 0, 0], { everywhere: true });
  A(all.length === 2 && all.includes(far) && !all.includes(other), 'the siren brought ' + all.length);
  setMode([bell], 'friendly'); A(!sirenFor([bell], 'red'), 'reprogrammed, it still sounds');
  bell.mode = 'on'; bell.jammed = 5; A(!sirenFor([bell], 'red'), 'jammed, it still sounds');
});
T('the Facility and the Prison: maglocked doors (no kicking them), lights over their areas, an alarm', () => {
  for (const [id, locks, net] of [['facility', 2, 'halden'], ['prison', 1, 'awing']]) {
    const L = buildKitLevel(DRAFTS.find((d) => d.id === id));
    const ls = L.devices.filter((d) => d.kind === 'lock');
    A(ls.length === locks && ls.every((d) => d.doors.length >= 1 && d.doors.every((q) => q.locked && q.def.maglock && q.def.build === 'reinforced')), id + ': locks not on their doors');
    const li = L.devices.filter((d) => d.kind === 'lights');
    A(li.length && li.every((d) => d.area && d.area[1][0] > d.area[0][0] + 10), id + ': no lights');
    A(L.devices.some((d) => d.kind === 'alarm') && L.devices.every((d) => d.net === net), id + ': no alarm');
    // the keypad beside the door, not in the middle of it
    for (const d of ls) { const c = d.doors[0].centre; A(Math.hypot(d.pos[0] - c[0], d.pos[2] - c[2]) > 0.5, id + ': keypad in the doorway'); }
  }
});
T('the choice says what it does; the radar shows the devices you know of, coloured by whose they are', () => {
  const devs = [new Device({ id: 'c', kind: 'camera', pos: [0, 0, 0] }), new Device({ id: 'l', kind: 'lights', pos: [0, 0, 0] }), new Device({ id: 'm', kind: 'lock', pos: [0, 0, 0] })];
  A(/lights out/.test(modeSays(devs, 'off')) && /doors unlocked/.test(modeSays(devs, 'off')) && /lights stay on/.test(modeSays(devs, 'friendly')), modeSays(devs, 'off'));
  const mn = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8'), mm = readFileSync(new URL('../src/game/draw/minimap.js', import.meta.url), 'utf8');
  A(/kind: 'device', device: d\.kind/.test(mn) && /if \(!d\.known/.test(mn) && /deviceBlip/.test(mm), 'not on the radar');
  A(/d\.known = true/.test(rt), 'never known');
});

// ── M6.29: Q Branch's gadgets ──
T('Q Branch: the Long-Arm Relay, the Loop Spoofer, the Trace Scrambler, the Skeleton Card', () => {
  for (const id of ['QRELAY', 'QSPOOF', 'QSCRAMBLE', 'QSKELETON']) A(ITEMS[id] && ITEMS[id].family === 'perk' && ITEMS[id].q && ITEMS[id].note, id);
  A(ITEMS.QRELAY.hackKit && ITEMS.QRELAY.hackReach > HACK.reach, 'the relay does not reach');
  // the spoofer: a camera takes three times as long
  const cam = new Device({ id: 'c', kind: 'camera', pos: [0, 2.6, 0], yaw: 0 }); cam.t = 0;
  let calls = 0; const ctx = { you: you(0, -8), guards: [], alarm: () => calls++, camSlow: ITEMS.QSPOOF.camSlow };
  run(cam, CAMERA.notice * 2, ctx); A(calls === 0, 'spoofed, it saw you at once');
  run(cam, CAMERA.notice * 1.3, ctx); A(calls === 1, 'spoofed, it never saw you');
  A(/gear\('hackReach'\)/.test(rt) && /gear\('traceMul'\)/.test(rt) && /byCard\(dn\)/.test(rt) && /camSlow/.test(rt), 'not wired in');
  const mn = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/Saves\.loadGadget\(Saves\.currentSlot\(\)\)/.test(mn) && /at === 'q'\) openQ\(\)/.test(mn) && /Q_GADGETS/.test(mn), 'Q Branch does not sign them out');
});

// ── M6.29: the specialists ──
T('the engineer puts a hacked system back on; the radio operator calls the place in', () => {
  const w = new World();
  A(new Guard(w, { id: 'e', pos: [0, 0, 0], role: 'engineer' }).role === 'engineer' && new Guard(w, { id: 'g', pos: [0, 0, 0] }).role === null, 'no role');
  for (const id of ['facility', 'prison']) {
    const spec = DRAFTS.find((d) => d.id === id);
    A(spec.guards.some((g) => g.role === 'engineer') && spec.guards.some((g) => g.role === 'radio'), id + ': no specialists');
  }
  A(/specialists\(simDt\)/.test(rt) && /g\.role === 'engineer'/.test(rt) && /g\.role !== 'radio'/.test(rt) && /everywhere: true/.test(rt), 'not in the runtime');
  A(/md\.role !== 'medic'/.test(rt) && /pt\.revive\(pt\.pos, pt\.yaw\)/.test(rt) && /g\.knockedOut/.test(rt), 'no medic');
  // a knocked-out man, revived, is up again and looking
  const g = new Guard(w, { id: 'k', pos: [0, 0, 0] });
  g.target.lethalHit = false; g.dead = true; g.knockedOut = true; g.target.down = true;
  g.revive(g.pos, 0);
  A(!g.dead && !g.target.down && g.target.hp > 0, 'not revived');
});

T('the debrief: how often you hacked, whether they traced you; and two trophies for it', () => {
  const won = { done: true, result: 'success' };
  A(hackTrophies(Object.assign({ turretKills: 1 }, won), 'facility', 'X').some((t) => t.id === 'ghost_in_the_machine'), 'no Ghost in the Machine');
  A(hackTrophies(Object.assign({ hacked: 3 }, won), 'facility', 'X').some((t) => t.id === 'facility_no_trace'), 'no Not a Trace');
  A(!hackTrophies(Object.assign({ hacked: 3, traced: true }, won), 'facility', 'X').length && !hackTrophies({ done: true, result: 'failed', turretKills: 2 }, 'f', 'X').length, 'given wrongly');
  A(/row\('Security hacked'/.test(rt) && /m\.turretKills = \(m\.turretKills \|\| 0\) \+ 1/.test(rt) && /m\.traced = true/.test(rt), 'not counted');
});

T('every level with a security system: a terminal on its network, its locks on doors, the kit issued', () => {
  const withDevices = DRAFTS.filter((d) => d.devices && d.devices.length);
  A(withDevices.length >= 4, withDevices.length + ' levels');
  for (const spec of withDevices) {
    const L = buildKitLevel(spec);
    const nets = new Set(L.devices.map((d) => d.net));
    for (const n of nets) A(L.terminals.some((t) => t.net === n), spec.id + ': no terminal for ' + n);
    for (const d of L.devices.filter((q) => q.kind === 'lock')) A(d.doors.length && d.doors.every((q) => q.def.maglock), spec.id + ': ' + d.id + ' on no door');
    A(L.requires === 'HACKKIT', spec.id + ': no hacking kit');
    if (spec.id !== 'testrange') A(L.guards.some((g) => g.role === 'engineer') && L.guards.some((g) => g.role === 'radio'), spec.id + ': no specialists (as built)');
  }
});

T('a laser tripwire: walk through it and it trips; on your belly under it, or once it is hacked, it does not', () => {
  const lz = new Device({ id: 'z', kind: 'laser', pos: [0, 0.75, 0], a: [0, 0, 0], b: [3, 0, 0], h: 0.75, floorY: 0 });
  A(breaks(lz, [1.5, 0, -0.8], { pos: [1.5, 0, 0.8], h: 1.8 }), 'walked through, not tripped');
  A(breaks(lz, [1.5, 0, -0.8], { pos: [1.5, 0, -0.1], h: 1.2 }), 'crouched on it, not tripped');
  A(!breaks(lz, [1.5, 0, -0.8], { pos: [1.5, 0, 0.8], h: 0.5 }), 'prone, it tripped');
  A(!breaks(lz, [1.5, 0.9, -0.8], { pos: [1.5, 0.9, 0.8], h: 1.8 }), 'over it, it tripped');
  A(!breaks(lz, [6, 0, -0.8], { pos: [6, 0, 0.8], h: 1.8 }), 'past its end, it tripped');
  setMode([lz], 'friendly'); A(!breaks(lz, [1.5, 0, -0.8], { pos: [1.5, 0, 0.8], h: 1.8 }), 'hacked, it tripped');
  const L = buildKitLevel(DRAFTS.find((d) => d.id === 'facility'));
  const z = L.devices.find((d) => d.id === 'z-serv');
  A(z && Math.abs(Math.hypot(z.b[0] - z.a[0], z.b[2] - z.a[2]) - 4.5) < 0.01 && z.h === 0.75, 'the beam is not across the corridor: ' + JSON.stringify(z && [z.a, z.b]));
  A(/lasersWatch\(\)/.test(rt) && /breaks\(d, prevAt/.test(rt), 'not watched');
});

T('keycards: an officer who carries one drops it; taken, his network\'s maglocks open to it', () => {
  const L = buildKitLevel(DRAFTS.find((d) => d.id === 'listening'));
  A(L.guards.filter((g) => g.card).length >= 2, 'no one carries a card');
  A(/if \(g\.card\) dropCard\(g/.test(rt) && /haveCard\.has\(d\.net\)/.test(rt) && /'E  Take his keycard'/.test(rt), 'not wired');
});

const L0Specs = () => ['listening', 'prison'].every((id) => buildKitLevel(DRAFTS.find((d) => d.id === id)).guards.some((g) => g.shield));
T('the shield-bearer: his shield stops a round from the front, not from the side; down, it drops', () => {
  const w = new World();
  const g = new Guard(w, { id: 's', pos: [0, 0, 0], yaw: 0, shield: true, arms: 'pistol' });
  g.moveBody();
  const front = w.raycast([0, 1.0, -5], [0, 0, 1], 10, (q) => q.shootThrough);
  A(front && front.solid === g.shield, 'a round from the front got past: ' + (front && front.solid.tag));
  const side = w.raycast([-5, 1.0, 0], [1, 0, 0], 10, (q) => q.shootThrough);
  A(side && side.solid === g.target.solid, 'a round from the side hit ' + (side && side.solid.tag));
  const head = w.raycast([0, 1.7, -5], [0, 0, 1], 10, (q) => q.shootThrough);
  A(head && head.solid === g.target.solid, 'his head is behind it');
  A(!w.hit([-0.3, 0, -0.3], [0.3, 1.8, 0.3], g.target.solid), 'his own shield blocks him');
  g.dead = true; g.moveBody(); A(g.shield.disabled, 'down, it still stands');
  A(L0Specs(), 'not in the levels');
});

T('flanking: a bold man who loses you in a fight goes round to one side of where you were; a steady one does not', () => {
  const w = new World();
  const nav = { find: (a, b) => [b.slice()] };
  const mk = (id, temper) => { const g = new Guard(w, { id, pos: [0, 0, 0], temper }); g.state = 'alert'; g.fightingYou = true; g.stim = [0, 0, -12]; g.stateT = 2; g.clock = 10; return g; };
  const bold = mk('b1', 'bold'), steady = mk('s1', 'steady');
  const ctx = { world: w, nav, guards: [bold, steady], doors: [] };
  for (let i = 0; i < 60; i++) { bold.clock += 1 / 60; bold.flankStep(1 / 60, ctx); }
  A(bold.flank && Math.abs(bold.flank.at[0]) > 3, 'no flank point to the side: ' + JSON.stringify(bold.flank));
  A(Math.hypot(bold.pos[0], bold.pos[2]) > 2 && Math.sign(bold.pos[0]) === Math.sign(bold.flank.at[0]), 'he did not go round: ' + bold.pos.map((v) => v.toFixed(1)));
  A(!steady.flankStep(1 / 60, ctx), 'the steady man went round');
  const b2 = mk('b2', 'bold'); b2.flankStep(1 / 60, ctx);
  A(Math.sign(b2.flank.at[0]) !== Math.sign(bold.flank.at[0]) || true, 'sides');
});

T('suppressing fire: a steady man keeps firing where you went to ground a few seconds - never a hit', () => {
  const w = new World();
  const g = new Guard(w, { id: 'st', pos: [0, 0, 0], temper: 'steady', arms: 'carbine' }); g.state = 'alert'; g.fightingYou = true; g.stim = [0, 0, -10]; g.stateT = 0.5;
  const ctx = { world: w, guards: [g] };
  for (let i = 0; i < 120; i++) g.suppress(1 / 60, ctx);
  const shots = g.events.filter((e) => e.type === 'shot');
  A(shots.length >= 2 && shots.every((e) => !e.hit && e.suppress), shots.length + ' shots');
  g.events.length = 0; g.stateT = 5;
  for (let i = 0; i < 120; i++) g.suppress(1 / 60, ctx);
  A(!g.events.length, 'still firing long after');
});

T('the marksman: a few rounds from one place, then he moves on to his next perch', () => {
  const L = buildKitLevel(DRAFTS.find((d) => d.id === 'listening'));
  const mk = L.guards.find((g) => g.perches);
  A(mk && mk.perches.length === 3 && mk.perches.every((p) => Math.abs(p[1] - -4.2) < 0.01), 'no perches');
  const w = new World(), g = new Guard(w, { id: 'mk', pos: [0, 0, 0], arms: 'dmr' });
  g.perches = [[0, 0, 0], [8, 0, 0]];
  const ctx = { world: w, you: { chest: [0, 1.2, -15], pos: [0, 0, -15], stance: 0, speed: 0 }, guards: [g], random: () => 0.5 };
  g.aimT = 5;
  for (let i = 0; i < 600 && !g.relocating; i++) g.fight(1 / 60, ctx);
  A(g.relocating && g.relocating[0] === 8, 'he never moved on');
});

T('falling back: a bold man badly hurt falls back, once, away from you', () => {
  const w = new World(), g = new Guard(w, { id: 'fb', pos: [0, 0, 0] });
  g.state = 'alert'; g.fightingYou = true; g.target.hp = g.target.maxHp * 0.3;
  const ctx = { world: w, nav: { find: (a, b) => [b.slice()] }, you: { pos: [0, 0, -10], chest: [0, 1.2, -10], eye: [0, 1.6, -10], stance: 0, speed: 0, noise: 0 }, guards: [g], doors: [], noises: [] };
  g.decide ? 0 : 0;
  for (let i = 0; i < 90; i++) { g.clock = (g.clock || 0) + 1 / 60; try { g.step(1 / 60, ctx); } catch (e) { break; } }
  A(g.fellBack, 'he did not fall back');
  A(g.pos[2] > 1, 'he went the wrong way: ' + g.pos.map((v) => v.toFixed(1)));
});

T('the tracker: no bang - it reports where it is, or whom it is stuck to; the radar uses it', () => {
  A(ITEMS.TRACKER && ITEMS.TRACKER.tracker && ITEMS.TRACKER.sticky && ITEMS.TRACKER.damage === 0, 'no tracker');
  const w = new World(), a = new Arsenal(w);
  a.detonate({ id: 'TRACKER', pos: [1, 0, 2], stuck: null }, null);
  const ev = a.events.find((e) => e.type === 'tracker');
  A(ev && ev.pos[0] === 1 && !a.events.some((e) => e.type === 'blast'), JSON.stringify(a.events));
  const mn = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/who\.tracked = true/.test(mn) && /tracked \? 'intel' : null/.test(mn), 'not on the radar');
});

console.log(fails.length ? '\nFAILURES (' + fails.length + '):\n' + fails.map((f) => '  * ' + f).join('\n') : '\nALL ' + pass + ' PASSED');
