// FRONTLINE - hacking and control: cameras, turrets, terminals, the hacking kit, the trace.
import { buildKitLevel } from '../src/game/levels/kit.js';
import { DRAFTS } from '../src/game/levels/drafts/index.js';
import { Device, stepDevice, setMode, Trace, HACK, CAMERA, TURRET } from '../src/sim/world/devices.js';
import { Guard } from '../src/sim/people/guard.js';
import { World } from '../src/sim/world/world.js';
import { pulse } from '../src/sim/arms/emp.js';
import { ITEMS } from '../src/sim/arms/loadout.js';
import { readFileSync } from 'fs';
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
  A(cams.length === 5 && turs.length === 2 && L.devices.every((d) => d.net === 'halden' && d.owner === 'red'), 'devices: ' + L.devices.length);
  const sec = L.terminals.find((t) => t.id === 'sec');
  A(sec && sec.net === 'halden', 'no security terminal');
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
  A(/hackChoice\(\[dn\]/.test(rt) && /gearTrait\('hackKit'\)/.test(rt), 'the kit does nothing');
  A(/stepDevice\(d, simDt/.test(rt) && /drawDevices\(\)/.test(rt) && /raiseAlarm\(guards, \{ pos: dev\.pos/.test(rt), 'not stepped, drawn, or calling it in');
});

console.log(fails.length ? '\nFAILURES (' + fails.length + '):\n' + fails.map((f) => '  * ' + f).join('\n') : '\nALL ' + pass + ' PASSED');
