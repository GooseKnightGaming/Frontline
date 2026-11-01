// FRONTLINE - Ghost HQ tests: under Yard 7, down the stairs to the operations hall.
import { Player, blankInput } from '../src/sim/people/player.js';
import { buildTraining } from '../src/game/levels/yard7.js';
import { HQ } from '../src/game/levels/hq.js';
import { readFileSync } from 'fs';
import { hqDevices, hijack, lockOut, boardRows, takeIntrusion, INTRUSION, downLantern } from '../src/game/levels/hq_security.js';
import { stepDevice } from '../src/sim/world/devices.js';
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const DT = 1 / 60;
const L = buildTraining();
const src = (f) => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');

// walk a player from waypoint to waypoint, as a person would: face it and go
function walk(p, points, secsEach) {
  for (const [tx, tz] of points) {
    for (let i = 0; i < Math.round((secsEach || 8) / DT); i++) {
      const dx = tx - p.pos[0], dz = tz - p.pos[2];
      if (Math.hypot(dx, dz) < 0.35) break;
      const yaw = Math.atan2(-dx, -dz);
      p.yaw = yaw;
      p.step(DT, Object.assign(blankInput(), { yaw, pitch: 0, moveZ: 1 }));
    }
  }
}
const fresh = (pos) => { const p = new Player(L.world); p.pos = pos.slice(); p.vel = [0, 0, 0]; p.settle(); return p; };

T('Ghost HQ is built under Yard 7', () => {
  A(L.hq === HQ, 'no level.hq');
  A(HQ.floor === -12, 'floor at ' + HQ.floor);
});
T('the hut stands on clear ground: nothing of the yard inside it', () => {
  const S = HQ.shaft, x0 = S.x0 - 0.5, x1 = S.x1 + 0.5, z0 = S.z0 - 5, z1 = S.z1 + 0.5;
  const inside = L.world.solids.filter((s) => s.min[1] < 3 && s.max[1] > 0.3 &&
    s.min[0] < x1 && s.max[0] > x0 && s.min[2] < z1 && s.max[2] > z0 &&
    !(s.min[0] >= x0 - 0.5 && s.max[0] <= x1 + 0.5 && s.min[2] >= S.z0 - 0.5 && s.max[2] <= S.z1 + 0.5));
  A(inside.length === 0, 'something of the yard in the way: ' + JSON.stringify(inside.slice(0, 3).map((s) => [s.tag, s.min, s.max])));
});
T('from the yard, through the hut door and down three flights, into the hall', () => {
  const p = fresh([-40.25, 0, 45]);
  walk(p, [[-40.25, 47], [-40.25, 50.5], [-27.6, 50.5], [-27.6, 54], [-40.4, 54], [-40.4, 50.5], [-27.6, 50.5], [-24, 52.2], [-13, 47.5]]);
  A(Math.abs(p.pos[1] - HQ.floor) < 0.2, 'ended at height ' + p.pos[1].toFixed(2));
  A(Math.hypot(p.pos[0] + 13, p.pos[2] - 47.5) < 0.6, 'ended at ' + p.pos.map((v) => v.toFixed(1)));
});
T('and back up again to the yard', () => {
  const p = fresh([-13, HQ.floor, 47.5]);
  walk(p, [[-24, 52.2], [-27.6, 50.5], [-40.4, 50.5], [-40.4, 54], [-27.6, 54], [-27.6, 50.5], [-40.25, 50.5], [-40.25, 47], [-40.25, 44]]);
  A(Math.abs(p.pos[1]) < 0.2 && p.pos[2] < 45, 'ended at ' + p.pos.map((v) => v.toFixed(1)));
});
T('you arrive back in the hall, on its floor', () => {
  const p = fresh(HQ.arrive.pos);
  for (let i = 0; i < 60; i++) p.step(DT, Object.assign(blankInput(), { yaw: HQ.arrive.yaw, pitch: 0 }));
  A(Math.abs(p.pos[1] - HQ.floor) < 0.1, 'standing at ' + p.pos[1].toFixed(2));
  const zone = L.world.zoneAt(p.pos[0], p.pos[1], p.pos[2]);
  A(zone && zone.label === 'Ghost HQ', 'zone ' + (zone && zone.label));
});
T('Logistics: a counter that never runs out', () => {
  const c = L.crates.find((k) => k.label === 'LOGISTICS');
  A(c && c.kind === 'armoury' && c.infinite, 'no Logistics crate');
  A(Math.abs(c.pos[1] - (HQ.floor + 0.5)) < 0.01, 'not on the hall floor');
});
T('the level buttons are at the operations table, not on the title screen', () => {
  const html = src('index.html');
  const title = html.slice(html.indexOf('<div id="title"'), html.indexOf('<div id="assign"'));
  const assign = html.slice(html.indexOf('<div id="assign"'), html.indexOf('<div id="drafts"'));
  for (const id of ['t-mission', 't-hotel', 't-factory', 't-casino', 't-train', 't-drafts']) {
    A(!title.includes('id="' + id + '"'), id + ' still on the title screen');
    A(assign.includes('id="' + id + '"'), id + ' not in the assignments');
  }
  A(/id="ride-van"/.test(assign) && /id="ride-heli"/.test(assign), 'no choice of van or helicopter');
});
T('coming back from a level lands you in Ghost HQ', () => {
  const mn = src('game/main.js');
  A(/goYard = \(\) => \{ location\.href = 'index\.html\?at=hq'/.test(mn), 'goYard does not go to the HQ');
  A(/AT_HQ && level\.hq/.test(mn) && /level\.hq\.arriveSafe : level\.hq\.arrive/.test(mn), 'no arrival in the hall');
  A(/'E  Assignments'/.test(mn) && /openAssignments\(\)/.test(mn), 'no assignments at the table');
});

// ── M6.29: the server room, Yard 7's turrets, an intrusion ──
global.sessionStorage = { v: {}, getItem(k) { return this.v[k] ?? null; }, setItem(k, x) { this.v[k] = String(x); }, removeItem(k) { delete this.v[k]; } };
T('the server room: through its doorway off the hall, to the security console', () => {
  const p = fresh(HQ.arrive.pos);
  const R = HQ.server, doorX = (R.x0 + R.x1) / 2;
  walk(p, [[HQ.hall.x1 - 1.6, HQ.hall.z0 + 1.2], [HQ.hall.x1 - 1.6, HQ.server.z1 - 0.8], [HQ.hall.x1 - 1.0, HQ.console[1] + 1.0], [HQ.console[0], HQ.console[1] + 1.0]], 10);
  A(Math.hypot(p.pos[0] - HQ.console[0], p.pos[2] - (HQ.console[1] + 1.0)) < 0.6 && Math.abs(p.pos[1] - HQ.floor) < 0.3, 'got to ' + p.pos.map((v) => v.toFixed(1)));
  A(L.signs.some((sg) => sg.board && /YARD 7/.test(sg.text)), 'no status board');
  A(L.cctv === undefined || L.cctv, 'cctv');
});
T('Yard 7\'s turrets are Ghost\'s - until an intrusion hands them to the reds; locked out, Ghost\'s again', () => {
  const devs = hqDevices(L);
  A(devs.length === 4 && devs.every((d) => d.owner === 'ghost' && d.mode === 'ours'), devs.length + ' turrets');
  const inHall = { pos: [HQ.ops[0] + 3.2, HQ.floor, HQ.ops[1] - 2.5], chest: [HQ.ops[0] + 3.2, HQ.floor + 1.15, HQ.ops[1] - 2.5], dead: false };
  const shots = []; const ctx = (you) => ({ world: L.world, you, guards: [], shoot: (d) => shots.push(d.id) });
  for (let i = 0; i < 180; i++) for (const d of devs) stepDevice(d, 1 / 60, ctx(inHall));
  A(!shots.length, 'Ghost\'s turrets fired on you');
  hijack(devs);
  for (let i = 0; i < 180; i++) for (const d of devs) stepDevice(d, 1 / 60, ctx(inHall));
  A(shots.some((id) => id.startsWith('hq-')), 'hijacked, they do not fire: ' + shots.join());
  // where you come home to one: out of their sight
  shots.length = 0;
  const safe = HQ.arriveSafe.pos, atSafe = { pos: safe, chest: [safe[0], safe[1] + 1.15, safe[2]], dead: false };
  for (let i = 0; i < 240; i++) for (const d of devs) stepDevice(d, 1 / 60, ctx(atSafe));
  A(!shots.length, 'they fire at the foot of the stairs: ' + shots.join());
  A(/INTRUSION/.test(boardRows(devs, true, 0)[0][0]) && /HOSTILE/.test(boardRows(devs, true, 0)[1][1]), 'the board does not say');
  lockOut(devs); shots.length = 0;
  for (let i = 0; i < 180; i++) for (const d of devs) stepDevice(d, 1 / 60, ctx(inHall));
  A(!shots.length && devs.every((d) => d.owner === 'ghost'), 'not locked out');
});
T('an intrusion follows a traced mission home - once; otherwise only now and then', () => {
  sessionStorage.setItem(INTRUSION.key, 'traced');
  A(takeIntrusion(0.99) === 'traced' && takeIntrusion(0.99) === null && takeIntrusion(0.01) === 'random', 'not as it should be');
  const rt = src('game/levels/mission_runtime.js'), mn = src('game/main.js');
  A(/markIntrusion\('traced'\)/.test(rt), 'a trace does not follow you home');
  A(/hqSec && hqSec\.active\) \{ audio\.deny/.test(mn) && /hqSec\.tip\(\)/.test(mn), 'the table still sends you out');
});

T('the Listening Station: once LANTERN is turned round, no intrusion finds Yard 7 again (that run)', () => {
  const store = {}; global.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
  downLantern(2);
  sessionStorage.setItem(INTRUSION.key, 'traced');
  A(takeIntrusion(0.01, 2) === null, 'still came');
  sessionStorage.setItem(INTRUSION.key, 'traced');
  A(takeIntrusion(0.99, 1) === 'traced', 'another run was spared too');
  A(/downLantern\(Saves\.currentSlot\(\)\)/.test(src('game/levels/mission_runtime.js')), 'never turned');
});

console.log(fails.length ? '\nFAILURES (' + fails.length + '):\n' + fails.map((f) => '  * ' + f).join('\n') : '\nALL ' + pass + ' PASSED');
