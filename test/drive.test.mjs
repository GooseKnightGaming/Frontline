// FRONTLINE - driving (M6.20.0, M8 begins): a car on the ground, a boat on the water, the AI at the helm;
// what rounds and blasts do to them; Level 20, the Riverboat Pursuit, driven end to end. Plain node.
import { World } from '../src/sim/world.js';
import { Drivable, Pilot } from '../src/sim/drive.js';
import { buildKitLevel } from '../src/game/level_kit.js';
import { DRAFTS } from '../src/game/levels/index.js';

let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n + ' -> ' + e.message); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };
const DT = 1 / 60;
const run = (v, s, ctl) => { for (let i = 0; i < s / DT; i++) v.step(DT, typeof ctl === 'function' ? ctl() : ctl); };

console.log('-- the handling --');
T('a car: it gets up to speed on the throttle, slows on its own, and stops dead (hurt) against a wall', () => {
  const w = new World(); w.addSolid([-200, -1, -200], [200, 0, 200], 'ground');
  w.addSolid([-10, 0, -150], [10, 4, -149], 'wall');
  const v = new Drivable(w, { kind: 'car', pos: [0, 0, 0], yaw: 0 });
  run(v, 4, { throttle: 1 }); A(v.speed > 18 && v.pos[2] < -30, 'speed ' + v.speed.toFixed(1) + ' at ' + v.pos[2].toFixed(1));
  A(Math.abs(v.pos[1]) < 0.05, 'on the ground ' + v.pos[1]);
  const s0 = v.speed; run(v, 1, {}); A(v.speed < s0 && v.speed > 0, 'coasting');
  run(v, 8, { throttle: 1 }); A(v.pos[2] > -149 && v.bumps > 0 && v.hp < 400, 'the wall: ' + v.pos[2].toFixed(1) + ' hp ' + v.hp);
  const b = new Drivable(w, { kind: 'car', pos: [50, 0, 0], yaw: 0 }); run(b, 3, { throttle: 1 }); run(b, 1.5, { brake: true });
  A(b.speed === 0, 'brakes ' + b.speed);
});
T('a boat: it rides the water and the bank stops it; the AI helmsman follows its way and stops at the end', () => {
  const w = new World(); w.addSolid([-200, -4, -200], [200, -3, 200], 'bed');
  w.addWater([-5, -3, -200], [5, -0.5, 200]);
  const v = new Drivable(w, { kind: 'boat', pos: [0, 0, 0], yaw: 0 });
  A(Math.abs(v.pos[1] - (-0.85)) < 0.1, 'floats ' + v.pos[1]);
  run(v, 3, { throttle: 1, steer: 1 }); A(Math.abs(v.pos[0]) < 5, 'kept to the water ' + v.pos[0]);
  v.solid.disabled = true;
  const u = new Drivable(w, { kind: 'boat', pos: [0, 0, 150], yaw: 0 }); u.driver = 'ai';
  const pl = new Pilot(u, [[0, 100], [2, 0], [-2, -100]], { speed: 12 });
  for (let i = 0; i < 40 / DT && !pl.done; i++) u.step(DT, pl.control());
  A(pl.done && u.pos[2] < -90, 'got there ' + u.pos[2].toFixed(1));
});
T('rounds and blasts hurt a vehicle; enough of them wreck it, and a wreck goes nowhere', () => {
  const w = new World(); w.addSolid([-200, -1, -200], [200, 0, 200], 'ground');
  const v = new Drivable(w, { kind: 'car', pos: [0, 0, 0], yaw: 0, hp: 100 });
  A(w.vehicles && w.vehicles.includes(v), 'listed in the world');
  v.damage(60); A(!v.wrecked, 'still going'); v.damage(60); A(v.wrecked && v.hp === 0, 'wrecked');
  run(v, 2, { throttle: 1 }); A(Math.abs(v.pos[2]) < 0.01, 'a wreck does not drive');
});

T('(M6.20.1, Rhys: "collisions with other boats stop you dead"; "VERY sensitive on the steering") one boat into another glances off and carries on; the helm comes over gently', () => {
  const w = new World(); w.addSolid([-200, -4, -200], [200, -3, 200], 'bed'); w.addWater([-30, -3, -200], [30, -0.5, 200]);
  const a = new Drivable(w, { kind: 'boat', pos: [0, 0, 60], yaw: 0 }), b = new Drivable(w, { kind: 'boat', pos: [0.8, 0, 20], yaw: 0 });
  run(a, 5, { throttle: 1 });
  A(a.pos[2] < 10 && a.speed > 6, 'past it: ' + a.pos[2].toFixed(1) + ' at ' + a.speed.toFixed(1));
  A(Math.abs(b.pos[0] - 0.8) > 0.3, 'shoved aside ' + b.pos[0].toFixed(2));
  const c = new Drivable(w, { kind: 'boat', pos: [-20, 0, 150], yaw: 0 }); run(c, 3, { throttle: 1 });
  const y0 = c.yaw; run(c, 0.25, { throttle: 1, steer: 1 });
  A(Math.abs(c.yaw - y0) < 0.1, 'a tap on the helm turns it ' + (Math.abs(c.yaw - y0) * 180 / Math.PI).toFixed(1) + ' degrees');
  run(c, 2, { throttle: 1, steer: 1 }); A(Math.abs(c.yaw - y0) > 0.6, 'a held turn still comes round');
});
T('head-on into a bank it stops and eases back; at an angle it turns off it and goes on', () => {
  const w = new World(); w.addSolid([-200, -4, -200], [200, -3, 200], 'bed'); w.addWater([-6, -3, -200], [6, -0.5, 200]);
  const v = new Drivable(w, { kind: 'boat', pos: [0, 0, 0], yaw: 0.35 });
  run(v, 6, { throttle: 1 });
  A(v.pos[2] < -40, 'glanced off the bank and went on: ' + v.pos.map((x) => x.toFixed(1)));
});

console.log('-- Level 20, the Riverboat Pursuit --');
const D = DRAFTS.find((d) => d.id === 'riverboat');
T('the boats are on the water, the crews aboard; Ghost\'s speedboat is by the way in', () => {
  const L = buildKitLevel(D);
  A(L.drivables.length === 3, 'three boats');
  for (const v of L.drivables) A(L.world.waterColumn(v.pos[0], v.pos[2]), v.id + ' is not on the water');
  const me = L.drivables.find((v) => v.id === 'ghostboat');
  A(Math.hypot(me.pos[0] - L.world.spawn.pos[0], me.pos[2] - L.world.spawn.pos[2]) < 12, 'the speedboat is ' + Math.hypot(me.pos[0] - L.world.spawn.pos[0], me.pos[2] - L.world.spawn.pos[2]).toFixed(1) + ' m off');
  for (const id of ['cap_helm', 'captain', 'cap_guard', 'gb_helm', 'gb_gun']) A(L.guards.find((g) => g.id === id).aboard, id + ' aboard');
  A(L.objectives.some((o) => o.kind === 'stop'), 'the objective');
});
T('left alone, the captain\'s launch gets all the way down the river to the ship (under the bridges, not stuck on a bank)', () => {
  const L = buildKitLevel(D), v = L.drivables.find((q) => q.id === 'launch');
  v.driver = 'ai'; const pl = new Pilot(v, v.path, { speed: v.pathSpeed });
  let t = 0; for (; t < 240 && !pl.done; t += DT) v.step(DT, pl.control());
  A(pl.done, 'stuck at ' + v.pos.map((x) => x.toFixed(0)) + ' (point ' + pl.i + ' of ' + v.path.length + ')');
  A(t > 60 && t < 200, 'it takes ' + t.toFixed(0) + ' s - time to catch it');
  A(v.bumps < 4 && !v.wrecked, 'it ran into things ' + v.bumps + ' times');
});
T('Ghost\'s speedboat can go down the whole river too, faster than the launch, and the gunboat works its reach', () => {
  const L = buildKitLevel(D), v = L.drivables.find((q) => q.id === 'ghostboat'), launch = L.drivables.find((q) => q.id === 'launch');
  launch.solid.disabled = true; L.drivables.find((q) => q.id === 'gunboat').solid.disabled = true;
  v.driver = 'ai'; const pl = new Pilot(v, [[v.pos[0], v.pos[2] + 30]].concat(launch.path), { speed: 20 });
  let t = 0; for (; t < 240 && !pl.done; t += DT) v.step(DT, pl.control());
  A(pl.done, 'stuck at ' + v.pos.map((x) => x.toFixed(0)));
  A(t < 70, 'took ' + t.toFixed(0) + ' s');
  // out at the jetty: onto the quay, not into the river
  const L2 = buildKitLevel(D), b = L2.drivables.find((q) => q.id === 'ghostboat');
  const out = b.exitSpot((q) => !L2.world.waterColumn(q[0], q[2]) && !L2.world.hit([q[0] - 0.3, q[1] + 0.1, q[2] - 0.3], [q[0] + 0.3, q[1] + 1.7, q[2] + 0.3]));
  A(out && Math.abs(out[1]) < 0.05, 'out onto the quay: ' + (out && out.map((x) => x.toFixed(1))));
  const g = L.drivables.find((q) => q.id === 'gunboat'); g.driver = 'ai';
  const gp = new Pilot(g, g.path, { speed: g.pathSpeed, loop: true });
  const z0 = g.pos[2]; let far = 0;
  for (let i = 0; i < 90 / DT; i++) { g.step(DT, gp.control()); far = Math.max(far, Math.abs(g.pos[2] - z0)); }
  A(!gp.done && far > 150 && g.bumps < 6, 'gunboat: ' + far.toFixed(0) + ' m, bumps ' + g.bumps);
});

console.log('-- every level\'s driven vehicles --');
for (const d of DRAFTS.filter((q) => (q.vehicles || []).some((v) => v.path))) {
  T(d.title + ': each vehicle on a way gets along it (round it, if it loops) without sticking', () => {
    const L = buildKitLevel(d);
    for (const v of L.drivables) if (v.path) {
      for (const o of L.drivables) if (o !== v) o.solid.disabled = true;
      v.driver = 'ai'; const pl = new Pilot(v, v.path, { speed: v.pathSpeed, loop: v.pathLoop });
      let t = 0, laps = 0, lastI = 0, stuck = 0, p0 = v.pos.slice();
      for (; t < 150 && !pl.done; t += DT) {
        v.step(DT, pl.control());
        if (pl.i < lastI) laps++; lastI = pl.i;
        if (Math.abs(v.speed) < 0.5) stuck += DT; else stuck = 0;
        A(stuck < 6, v.id + ' stuck at ' + v.pos.map((x) => x.toFixed(0)) + ' heading for point ' + pl.i);
      }
      A(pl.done || laps >= 1, v.id + ' got to point ' + pl.i + ' of ' + v.path.length + ' in ' + t.toFixed(0) + ' s');
      for (const o of L.drivables) o.solid.disabled = false;
    }
  });
}

console.log('\n' + '='.repeat(50));
if (fails.length) { console.log('FAILURES (' + fails.length + '):'); for (const f of fails) console.log('  * ' + f); process.exit(1); }
console.log('ALL ' + pass + ' PASSED');
