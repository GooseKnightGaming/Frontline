// FRONTLINE - Level 0 tests: walk every way in, climb to the top, the doors,
// the guards and the mission's rules. Plain node.
import { Player, P, blankInput } from '../src/sim/player.js';
import { buildMission0, FLOORS } from '../src/game/level_mission0.js';
import { Mission, kickOpens, DOWNLOAD_TIME, awardsButton } from '../src/sim/mission.js';
import { readFileSync } from 'fs';
import { GUARD, Guard, raiseAlarm, FALL_CURVE } from '../src/sim/guard.js';
import { World } from '../src/sim/world.js';
import { Arsenal } from '../src/sim/weapons.js';
import { NavGrid } from '../src/sim/nav.js';
import { Loadout } from '../src/sim/loadout.js';
import { buildTraining } from '../src/game/level_training.js';
import { buildHotel } from '../src/game/level_hotel.js';
import { chooseSwing, SwingDoor } from '../src/sim/doors.js';

let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const DT = 1 / 60;
const YAW = { N: 0, S: Math.PI, E: -Math.PI / 2, W: Math.PI / 2 };
const fresh = () => buildMission0();
const at = (L, pos, yaw) => { const p = new Player(L.world); p.pos = pos.slice(); p.vel = [0, 0, 0]; p.yaw = yaw; p.settle(); return p; };
// walk a list of legs: [yaw, seconds, extra input]
const walk = (p, legs) => {
  let prev = false;
  for (const [yaw, secs, extra] of legs) {
    for (let i = 0; i < Math.round(secs / DT); i++) {
      const src = typeof extra === 'function' ? extra(i * DT, p) : extra;
      const x = Object.assign(blankInput(), { yaw, moveZ: 1 }, src || {});
      p.yaw = yaw;
      x.jumpPressed = !!x.jump && !prev; prev = !!x.jump;
      p.step(DT, x);
    }
  }
  return p;
};
const inside = (p, x0, x1, z0, z1, y) => p.pos[0] > x0 && p.pos[0] < x1 && p.pos[2] > z0 && p.pos[2] < z1 && Math.abs(p.pos[1] - y) < 0.3;

console.log('\n-- WAYS IN --');
T('you start at the van, on the street, facing the building', () => {
  const L = fresh(); const p = at(L, L.world.spawn.pos, L.world.spawn.yaw);
  A(p.pos[0] < -6 && Math.abs(p.pos[1]) < 0.05, 'spawn: ' + p.pos);
});
T('the front: across the road, open the glass doors, and into the lobby', () => {
  const L = fresh(); const p = at(L, [-1.2, 0, 10], YAW.E);
  for (const d of L.frontDoors) A(d.use(p.pos, p.box()) === 'opened', 'a front door would not open');
  walk(p, [[YAW.E, 1.5]]);
  A(inside(p, 0.5, 12, 0, 20, 0), 'not in the lobby: ' + p.pos.map((v) => v.toFixed(1)));
});
T('the back: the shutter is down, but the steel door beside it opens into the loading bay', () => {
  const L = fresh();
  const shut = at(L, [42, 0, 14], YAW.W);
  walk(shut, [[YAW.W, 1.5]]);
  A(shut.pos[0] > 40.2, 'walked through the shutter: ' + shut.pos[0].toFixed(2));
  const p = at(L, [41.2, 0, 17.5], YAW.W);
  A(L.backDoor.use(p.pos, p.box()) === 'opened', 'the back door would not open');
  walk(p, [[YAW.W, 1.5]]);
  A(inside(p, 34.2, 40, 0, 20, 0), 'not in the bay: ' + p.pos.map((v) => v.toFixed(1)));
});
T('the fire escape: up the ladder, onto the landing, and vault in at the window', () => {
  const L = fresh(); const p = at(L, [-0.85, 0, 19], YAW.N);
  walk(p, [[YAW.N, 6, (t, pl) => ({ moveZ: pl.mode === 'ladder' || pl.pos[1] < FLOORS[1] - 0.2 ? 1 : 0 })]]);   // climb, and stop at the top
  A(p.pos[1] > FLOORS[1] - 0.2, 'did not climb to the landing: y=' + p.pos[1].toFixed(2) + ' mode=' + p.mode);
  walk(p, [[YAW.N, 1.2, (t, pl) => ({ moveZ: pl.pos[2] > 15.2 ? 1 : 0 })], [YAW.E, 2.5, (t, pl) => ({ moveZ: pl.pos[0] < 1.2 || pl.traverse ? 1 : 0, jump: /SPACE/.test(pl.prompt || '') })]]);
  A(inside(p, 0.3, 21, 0, 20, FLOORS[1]), 'not in the open-plan office: ' + p.pos.map((v) => v.toFixed(1)) + ' ' + p.mode);
});

console.log('\n-- UP THE STAIRS --');
T('ground to first: along the corridor, into the stairwell and up the first flight', () => {
  const L = fresh(); const p = at(L, [22.2, 0, 10.5], YAW.N);
  walk(p, [[YAW.N, 3.6]]);
  A(Math.abs(p.pos[1] - FLOORS[1]) < 0.05 && p.pos[2] < 3.6, 'not at the top of flight one: ' + p.pos.map((v) => v.toFixed(2)));
});
T('first to second: round the landing and up the second flight', () => {
  const L = fresh(); const p = at(L, [22.2, FLOORS[1], 2.6], YAW.E);
  walk(p, [[YAW.N, 1.5, (t, pl) => ({ moveZ: pl.pos[2] > 0.8 ? 1 : 0 })], [YAW.E, 1.5, (t, pl) => ({ moveZ: pl.pos[0] < 26.8 ? 1 : 0 })], [YAW.S, 3.8]]);
  A(Math.abs(p.pos[1] - FLOORS[2]) < 0.05 && p.pos[2] > 6.5, 'not on the second floor: ' + p.pos.map((v) => v.toFixed(2)));
});
T('from the first floor you can walk out of the stairwell to the corridor, between the flights', () => {
  const L = fresh(); const p = at(L, [24.5, FLOORS[1], 2.5], YAW.S);
  walk(p, [[YAW.S, 2.2]]);
  A(inside(p, 21, 34, 9, 12, FLOORS[1]), 'not in the first-floor corridor: ' + p.pos.map((v) => v.toFixed(2)));
});
T('the second floor is only reached by the stairs: no way up from outside', () => {
  const L = fresh();
  // no ladder reaches it, and its outer wall has no openings
  A(L.world.ladders.every((l) => l.max[1] < FLOORS[2]), 'a ladder reaches the second floor');
  const p = at(L, [-0.85, 0, 19], YAW.N);
  walk(p, [[YAW.N, 6]]);
  A(p.pos[1] < FLOORS[2] - 1, 'climbed past the first floor');
});

console.log('\n-- THE QUIET WAY IN (M6.6.2) --');
T('the ceiling duct: crate, duct, crouch along above the hall, drop into the server room', () => {
  const L = fresh(); const p = at(L, [34.5, FLOORS[2], 4.3], YAW.N);
  walk(p, [[YAW.N, 1.6, (t, pl) => ({ jump: t < 0.1, moveZ: pl.pos[1] < FLOORS[2] + 1.0 ? 1 : 0 })]]);   // onto the crate, and stop
  A(p.pos[1] > FLOORS[2] + 1.0, 'not on the crate: y=' + p.pos[1].toFixed(2));
  walk(p, [[YAW.W, 2.4, (t) => ({ jump: t > 0.2 && t < 0.3, moveZ: 1 })]]);           // up into the duct
  A(p.pos[1] > FLOORS[2] + 1.9, 'not in the duct: ' + p.pos.map((v) => v.toFixed(2)));
  walk(p, [[YAW.W, 12, (t, pl) => ({ moveZ: pl.pos[0] > 23.7 ? 1 : 0 })], [YAW.S, 8, (t, pl) => ({ moveZ: pl.pos[1] > FLOORS[2] + 0.5 ? 1 : 0 })]]);
  A(Math.abs(p.pos[1] - FLOORS[2]) < 0.05 && p.pos[0] > 14.2 && p.pos[0] < 25.8 && p.pos[2] > 11.2 && p.pos[2] < 15.8,
    'not dropped into the server room: ' + p.pos.map((v) => v.toFixed(2)) + ' stance ' + p.stance + ' touching ' + L.world.hits(...p.box([p.pos[0] - 0.05, p.pos[1] + 0.01, p.pos[2]])).map((s) => s.tag + '@' + s.min.map((v) => v.toFixed(2)) + '..' + s.max.map((v) => v.toFixed(2))).join(' '));
});
T('guards walk under the duct: it does not block them', () => {
  const L = fresh(); const nav = new NavGrid(L.world, L.navFloors, L.navLinks);
  A(nav.find([23.7, FLOORS[2], 9], [23.7, FLOORS[2], 5]), 'no way under the duct');
});
T('the way from the stairs to the comms room is out of sight of the two at the server room door', () => {
  const L = fresh();
  const pair = L.guards.filter((g) => /^server-/.test(g.id));
  const ctx = { world: L.world, guards: L.guards };
  // from the top of the stairs, east and then south to the kitchenette door
  const path = [];
  for (let x = 27.2; x <= 36; x += 0.4) path.push([x, 7.4]);                // along to the comms room door
  for (let z = 7.0; z >= 4.4; z -= 0.4) path.push([36, z]);                 // and in
  for (const [x, z] of path) {
    const you = { pos: [x, FLOORS[2], z], eye: [x, FLOORS[2] + 1.0, z], chest: [x, FLOORS[2] + 0.66, z], stance: 1, speed: 1.5 };
    for (const g of pair) A(g.visibility(Object.assign({ you }, ctx)) === 0, g.id + ' sees you at ' + x.toFixed(1) + ', ' + z.toFixed(1));
  }
});
T('smoke grenades lie on a desk on the ground floor, to be found (Rhys)', () => {
  const L = fresh();
  A(L.smokeBox && L.smokeBox.items.filter((i) => i === 'SMOKE').length === 2 && L.smokeBox.pos[1] < 2, 'no smoke on the ground floor');
});

console.log('\n-- DOORS --');
T('sixteen doors: glass at the front, steel at the back; the server room\'s reinforced and locked; the guard room\'s locked', () => {
  const L = fresh();
  A(L.swingDoors.length === 16, 'doors: ' + L.swingDoors.length);
  A(L.frontDoors.length === 2 && L.frontDoors.every((d) => d.def.mat === 'glass'), 'front doors');
  A(L.backDoor.def.build === 'sturdy' && L.backDoor.def.mat === 'metal', 'back door');
  A(L.serverDoor.def.build === 'reinforced' && L.serverDoor.locked, 'server door');
  A(L.guardRoomDoor.locked && L.guardRoomDoor.def.build === 'domestic', 'guard room door');
  A(L.serverDoor.solid.tough === undefined, 'rounds should not go through the reinforced door');
});
T('a locked door will not open with E; the keycard opens the server room', () => {
  const L = fresh(); const d = L.serverDoor;
  const p = at(L, [20, FLOORS[2], 9.8], YAW.S);
  A(d.use(p.pos, p.box()) === 'locked', 'should be locked');
  d.unlock();
  A(d.use(p.pos, p.box()) === 'opened', 'should open once unlocked');
});
T('kicking: an ordinary door usually gives; a reinforced one never does', () => {
  const L = fresh();
  A(kickOpens(L.guardRoomDoor, 0.5) && !kickOpens(L.guardRoomDoor, 0.95), 'domestic odds');
  for (const r of [0, 0.01, 0.2]) A(!kickOpens(L.serverDoor, r), 'a reinforced door gave to a kick');
});
T('a breach flings a door open away from you; a charge blows the reinforced one off', () => {
  const L = fresh();
  const gd = L.guardRoomDoor;
  A(gd.breach([5.5, FLOORS[2], 13], 'kick') === 'opened' && gd.open && !gd.locked, 'guard room door should fly open');
  A(gd.side === 1, 'it should swing into the room (+z), away from you');
  const sd = L.serverDoor;
  A(sd.breach([20, FLOORS[2], 9], 'blast') === 'blown' && sd.solid.disabled, 'server door should be blown off');
  A(sd.breach([20, FLOORS[2], 9], 'kick') === 'blown', 'a reinforced door can only go one way');
  const p = at(L, [20, FLOORS[2], 9.8], YAW.S);
  walk(p, [[YAW.S, 1.5]]);
  A(p.pos[2] > 11.4, 'should walk into the server room: z=' + p.pos[2].toFixed(2));
});

T('the secure door, opened with the keycard, shuts again from wherever you stand by it', () => {
  const L = fresh(); const d = L.serverDoor;
  for (const z of [9.5, 10.0, 10.4, 12.2]) {
    d.set(false, 1); d.unlock();
    const p = at(L, [20, FLOORS[2], z], z < 11 ? YAW.S : YAW.N);
    A(d.use(p.pos, p.box()) === 'opened', 'open from z=' + z);
    A(d.use(p.pos, p.box()) === 'shut', 'shut from z=' + z);
  }
});
T('a door blown by a charge is gone: it can never be shut, and nothing offers to (Rhys)', () => {
  const L = fresh(); const d = L.serverDoor;
  d.breach([20, FLOORS[2], 9.5], 'blast');
  const p = at(L, [20, FLOORS[2], 9.8], YAW.S);
  A(d.use(p.pos, p.box()) === 'blown' && d.blown && d.solid.disabled, 'a blown door answered E');
  const gd = L.guardRoomDoor;
  A(gd.breach([5.5, FLOORS[2], 13], 'blast') === 'blown' && gd.solid.disabled, 'an ordinary door blasted should go too');
});
T('a kicked-open door can be pushed shut again', () => {
  const L = fresh(); const d = L.guardRoomDoor;
  d.breach([5.5, FLOORS[2], 13], 'kick');
  const p = at(L, [5.5, FLOORS[2], 13.2], YAW.S);
  A(d.use(p.pos, p.box()) === 'shut', 'should shut');
});

console.log('\n-- GUARDS --');
T('eleven guards, all red, none inside a wall or a desk', () => {
  const L = fresh();
  A(L.guards.length === 11 && L.guards.every((g) => g.faction === 'red'), 'guards');
  for (const g of L.guards) {
    const [lo, hi] = g.box(); lo[1] += 0.05;
    const hits = L.world.hits(lo, hi).filter((s) => !s.target);
    A(!hits.length, g.id + ' stands in ' + hits.map((h) => h.tag).join(','));
  }
});
T('a patrolling guard walks his route and pauses at each point', () => {
  const L = fresh(); const g = L.guards.find((x) => x.id === 'lobby');
  const z0 = g.pos[2];
  for (let i = 0; i < 60 * 3; i++) g.step(DT);
  A(g.pos[2] > z0 + 3, 'should have walked south: z=' + g.pos[2].toFixed(2));
  for (let i = 0; i < 60 * 12; i++) g.step(DT);
  A(Math.abs(g.pos[2] - 16) < 0.1 || g.wait > 0 || g.leg === 0, 'reached the end and turned back');
});
T('his body moves with him, so you shoot where he is', () => {
  const L = fresh(); const g = L.guards.find((x) => x.id === 'bay');
  for (let i = 0; i < 60 * 4; i++) g.step(DT);
  A(Math.abs(g.target.centre[2] - g.pos[2]) < 1e-6 && g.target.solid.min[2] < g.pos[2], 'target left behind');
});
T('shot down, he dies and stays down, and no longer blocks the way', () => {
  const L = fresh(); const g = L.guards[0];
  g.target.hp = 0; g.target.down = true;
  g.step(DT);
  A(g.dead && g.target.solid.disabled && g.animState().dead, 'should be dead');
  const pos = g.pos.slice(); g.step(1);
  A(g.pos[2] === pos[2], 'a dead guard walked');
});

console.log('\n-- PEOPLE ARE NOT FURNITURE (M6.0.2 glitches) --');
// the lobby guard patrols x 4 from z 4 to 16; stand in his way
T('a guard walking into you no longer lifts you onto him and up through the floors', () => {
  const L = fresh(); const g = L.guards.find((x) => x.id === 'lobby');
  const p = at(L, [4, 0, 8], YAW.N);
  let highest = 0;
  for (let i = 0; i < 60 * 8; i++) {
    g.step(DT);                                    // no blockers: the worst case, he walks right on
    p.step(DT, Object.assign(blankInput(), { yaw: YAW.N }));
    highest = Math.max(highest, p.pos[1]);
  }
  A(highest < 0.05, 'you were lifted to y=' + highest.toFixed(2));
  A(Math.abs(p.pos[0] - 4) > 0.5 || Math.abs(p.pos[2] - 8) > 0.5, 'you should have been pushed aside: ' + p.pos.map((v) => v.toFixed(2)));
});
T('a guard waits rather than walk into you', () => {
  const L = fresh(); const g = L.guards.find((x) => x.id === 'lobby');
  const p = at(L, [4, 0, 8], YAW.N);
  for (let i = 0; i < 60 * 8; i++) g.step(DT, [p.box()]);
  const [a0, a1] = g.box(), [b0, b1] = p.box();
  const overlap = a0[0] < b1[0] && a1[0] > b0[0] && a0[2] < b1[2] && a1[2] > b0[2];
  A(!overlap && g.pos[2] < 8, 'he walked into you: guard z=' + g.pos[2].toFixed(2));
});
T('you cannot climb or vault a guard (Rhys: no climbing people)', () => {
  const L = fresh(); const g = L.guards.find((x) => x.id === 'security');
  const p = at(L, [g.pos[0], 0, g.pos[2] + 0.75], YAW.N);
  A(!p.findLedge(P.mantleMax) && !p.findLedge(P.mantleMax, { over: true }), 'offered a climb onto a person');
  walk(p, [[YAW.N, 1.5, (t, pl) => ({ jump: t > 0.1 && t < 0.2 })]]);
  A(p.pos[1] < 1.0, 'got on top of him: y=' + p.pos[1].toFixed(2));
});
T('dropped onto a guard, you slide off his head to the floor', () => {
  // in the open: indoors the rooms are too low for you to fit above his head
  const w = new World(); w.addSolid([-20, -1, -20], [20, 0, 20], 'ground');
  const g = new Guard(w, { id: 'g', pos: [0, 0, 0] });
  const p = new Player(w); p.pos = [0.05, 3, 0.05]; p.vel = [0, 0, 0]; p.yaw = 0; p.onGround = false;
  for (let i = 0; i < 60 * 2; i++) p.step(DT, Object.assign(blankInput(), { yaw: 0 }));
  A(p.pos[1] < 0.05, 'stood on his head: y=' + p.pos[1].toFixed(2));
});

// where a fallen body lies: the clip falls backwards, about 1.6 m behind him
const bodyMid = (g) => [g.pos[0] + Math.sin(g.yaw) * 0.88, g.pos[2] + Math.cos(g.yaw) * 0.88];
T('guards shot on one spot in the open: none moved, none slumped on the others - they fall full length (Rhys)', () => {
  const L = fresh(); const five = L.guards.slice(0, 5);
  five.forEach((g, i) => { g.pos = [3 + i * 0.1, 0, 9]; g.yaw = 0; g.moveBody(); });   // open lobby floor
  const where = five.map((g) => g.pos.slice());
  for (const g of five) { g.target.down = true; g.step(DT, { world: L.world, guards: L.guards }); }
  five.forEach((g, i) => A(g.pos[0] === where[i][0] && g.pos[2] === where[i][2], 'body ' + i + ' was moved'));
  A(five.every((g) => g.slump === null), 'someone slumped with no wall behind him: ' + five.map((g) => g.slump));
});
T('a guard with his back to a shut door slumps against it, not through it (Rhys)', () => {
  const L = fresh(); const g = L.guards.find((x) => x.id === 'server-left');
  g.pos = [20, FLOORS[2], 10.3]; g.yaw = 0; g.moveBody();          // the server room door is 0.45 m behind him
  g.target.down = true; g.step(DT, { world: L.world, guards: L.guards });
  A(g.pos[2] === 10.3, 'his body was moved');
  A(g.slump !== null, 'he should slump');
  // where the held fall leaves his head: short of the door
  const c = FALL_CURVE; let back = 0;
  for (let i = 1; i < c.length; i++) if (g.slump <= c[i][0]) { back = c[i - 1][1] + (c[i][1] - c[i - 1][1]) * (g.slump - c[i - 1][0]) / (c[i][0] - c[i - 1][0]); break; }
  A(back < 0.45, 'his head goes ' + back.toFixed(2) + ' m back: through the door');
});
T('on the stairs, a guard never hangs in the air: he falls along the step or holds short of the drop', () => {
  const L = fresh(); const g = L.guards.find((x) => x.id === 'lobby');
  // the first flight, two-thirds of the way up, facing up the flight (he falls back down it)
  g.pos = [22.2, 0.225 * 10, 5.5]; g.yaw = 0; g.moveBody();
  const g0 = g.pos[1];
  g.target.down = true; g.step(DT, { world: L.world, guards: L.guards });
  const room = g.levelRoom(g.yaw, L.world);
  A(g.slump !== null || room >= 1.3, 'full-length fall over a drop: slump ' + g.slump + ', level room ' + room.toFixed(2));
  A(g.pos[1] === g0, 'his body was moved');
});
T('the FLOOR 2 sign hangs clear of the ceiling duct, at the same height as the others', () => {
  const L = fresh();
  const sg = L.signs.find((x) => x.text === 'FLOOR 2'), s1 = L.signs.find((x) => x.text === 'FLOOR 1');
  A(sg && s1, 'signs missing');
  A(Math.abs((sg.pos[1] - FLOORS[2]) - (s1.pos[1] - FLOORS[1])) < 1e-6, 'FLOOR 2 hangs at a different height to FLOOR 1');
  A(sg.pos[0] - sg.w / 2 > 24.4 + 0.05, 'the sign reaches x ' + (sg.pos[0] - sg.w / 2).toFixed(2) + ': into the duct wall at 24.4');
});
T('a guard walking past does not open the locked reinforced door; once the keycard has unlocked it, he may', () => {
  const L = fresh(); const g = L.guards[0], sd = L.serverDoor;
  const c = sd.centre;
  g.pos = [c[0], sd.def.y0, c[2] - 0.6];
  g.openDoors({ doors: L.swingDoors });
  A(!sd.open && sd.locked, 'a guard opened the locked reinforced door');
  sd.unlock();
  g.openDoors({ doors: L.swingDoors });
  A(sd.open, 'an unlocked door should open for a guard');
});
T('the stair links run along the nosings: a guard on a flight is never inside the concrete', () => {
  const L = fresh();
  for (const l of L.navLinks) {
    for (let i = 0; i <= 40; i++) {
      const t = i / 40, x = l.a[0] + (l.b[0] - l.a[0]) * t, y = l.a[1] + (l.b[1] - l.a[1]) * t, z = l.a[2] + (l.b[2] - l.a[2]) * t;
      const top = L.world.groundBelow(x, y + 2, z, 0.02);      // along his centre line
      A(top <= y + 0.02, 'link ' + JSON.stringify(l.a) + ' -> ' + JSON.stringify(l.b) + ': at z ' + z.toFixed(2) + ' his feet (' + y.toFixed(2) + ') are ' + (top - y).toFixed(2) + ' m inside a step');
    }
  }
});
T('a locked reinforced door is a wall to a guard: no route through it until it is unlocked or blown', () => {
  const L = fresh(); const nav = new NavGrid(L.world, L.navFloors, L.navLinks), sd = L.serverDoor;
  const out = [20, FLOORS[2], 9.4], inside = [20, FLOORS[2], 12.6];
  nav.syncDoors(L.swingDoors);
  A(nav.find(out, inside) === null, 'a route through the locked reinforced door');
  A(nav.find(inside, out) === null, 'a route out through the locked reinforced door');
  sd.unlock(); nav.syncDoors(L.swingDoors);
  A(nav.find(out, inside), 'no route once it is unlocked');
  const L2 = fresh(); const nav2 = new NavGrid(L2.world, L2.navFloors, L2.navLinks);
  nav2.syncDoors(L2.swingDoors); L2.serverDoor.breach([20, FLOORS[2], 9.4], 'blast'); nav2.syncDoors(L2.swingDoors);
  A(nav2.find(out, inside), 'no route once it is blown');
});
T('in the open, a guard falls full length', () => {
  const L = fresh(); const g = L.guards.find((x) => x.id === 'lobby');
  g.pos = [4, 0, 10]; g.yaw = 0; g.moveBody();
  g.target.down = true; g.step(DT, { world: L.world, guards: L.guards });
  A(g.slump === null, 'slumped in the open: ' + g.slump);
});
T('guards answering an alarm each take their own spot round it', () => {
  const L = fresh(); const at = [20, FLOORS[2], 9];
  const answered = raiseAlarm(L.guards, { pos: at, rank: 'officer' }, at);
  A(answered.length >= 2, 'not enough answered: ' + answered.length);
  for (let i = 0; i < answered.length; i++) for (let j = i + 1; j < answered.length; j++) {
    const a = answered[i].stim, b = answered[j].stim;
    A(Math.hypot(a[0] - b[0], a[2] - b[2]) > 1.0, 'two sent to the same spot');
  }
});

console.log('\n-- KNOCKED OUT, OR DEAD --');
// the security-office guard stands at his post; strike him from just in front
const strikeTest = (kit, how, times) => {
  const L = fresh(); const g = L.guards.find((x) => x.id === 'security');
  const ars = new Arsenal(L.world, { loadout: new Loadout(kit) });
  ars.reset(ars.loadout);
  const eye = [g.pos[0], 1.5, g.pos[2] + 1.0], dir = [0, 0, -1];
  for (let i = 0; i < times && !g.target.down; i++) {
    ars.cool = 0; ars.reloading = 0;
    if (how === 'bash') ars.bash(eye, dir); else ars.fire(eye, dir, {});
  }
  g.step(DT);
  const m = new Mission({}); if (g.dead) m.guardDown(g);
  return { g, m };
};
T('pistol-whipped, he is knocked out - not a casualty (Rhys: non-lethal)', () => {
  const { g, m } = strikeTest({ backup: 'PX9' }, 'bash', 6);
  A(g.dead && g.knockedOut, 'should be knocked out: dead=' + g.dead + ' ko=' + g.knockedOut);
  A(m.knockouts === 1 && m.kills === 0, 'counted as ' + m.kills + ' kills, ' + m.knockouts + ' knockouts');
});
T('a rifle butt takes two blows, and a strike hits like a strike, not like the rifle\'s bullet', () => {
  const { g } = strikeTest({ primary: 'K7' }, 'bash', 1);
  A(!g.dead && Math.abs(g.target.hp - 30) < 1e-6, 'one butt should take 30 of 60: hp=' + g.target.hp);
  const two = strikeTest({ primary: 'K7' }, 'bash', 2);
  A(two.g.dead && two.g.knockedOut, 'two should knock him out');
});
T('bare fists knock out too', () => {
  const { g } = strikeTest({}, 'fire', 12);
  A(g.dead && g.knockedOut, 'fists: dead=' + g.dead + ' ko=' + g.knockedOut);
});
T('a knife or a bullet is a casualty', () => {
  const k = strikeTest({ backup: 'KNIFE' }, 'fire', 4);
  A(k.g.dead && !k.g.knockedOut && k.m.kills === 1, 'knife: ko=' + k.g.knockedOut);
  const s = strikeTest({ backup: 'PX9' }, 'fire', 8);
  A(s.g.dead && !s.g.knockedOut, 'shot: ko=' + s.g.knockedOut);
});
T('shot and then clubbed down still counts as a casualty', () => {
  const L = fresh(); const g = L.guards.find((x) => x.id === 'security');
  const ars = new Arsenal(L.world, { loadout: new Loadout({ backup: 'PX9' }) }); ars.reset(ars.loadout);
  const eye = [g.pos[0], 1.5, g.pos[2] + 1.0], dir = [0, 0, -1];
  ars.cool = 0; ars.fire(eye, dir, {});
  A(g.target.lethalHit, 'the shot should have hit');
  for (let i = 0; i < 6 && !g.target.down; i++) { ars.cool = 0; ars.bash(eye, dir); }
  g.step(DT);
  A(g.dead && !g.knockedOut, 'a bullet wound, then a knockout, should not count as clean');
});
T('knocking everyone out still earns No Casualties', () => {
  const m = new Mission({});
  for (let i = 0; i < 10; i++) m.guardDown({ id: 'g' + i, knockedOut: true });
  m.fileDone = true; m.extract();
  A(m.trophies().some((t) => t.id === 'no_casualties') && m.knockouts === 10, 'should earn it');
});

console.log('\n-- HEADSHOTS --');
const shootAt = (kit, eyeY, back, how) => {
  const L = fresh(); const g = L.guards.find((x) => x.id === 'security');
  const ars = new Arsenal(L.world, { loadout: new Loadout(kit) }); ars.reset(ars.loadout);
  ars.cool = 0; ars.reloading = 0;
  const eye = [g.pos[0], eyeY, g.pos[2] + back], dir = [0, 0, -1];
  if (how === 'bash') ars.bash(eye, dir); else ars.fire(eye, dir, {});
  g.step(DT);
  return g;
};
T('a pistol round to the face, point blank, kills outright (Rhys)', () => {
  const g = shootAt({ backup: 'PX9' }, 1.68, 1.0);
  A(g.dead && g.target.headshot && !g.knockedOut, 'dead=' + g.dead + ' hp=' + g.target.hp);
});
T('the same round to the chest does not', () => {
  const g = shootAt({ backup: 'PX9' }, 1.2, 1.0);
  A(!g.dead && g.target.hp > 0, 'a body shot killed him');
});
T('even the weakest gun, the MP2, kills with a headshot', () => {
  const g = shootAt({ primary: 'MP2' }, 1.68, 1.0);
  A(g.dead && g.target.headshot, 'MP2: hp=' + g.target.hp);
});
T('a rifle butt to the head is still only a knockout blow', () => {
  const g = shootAt({ primary: 'K7' }, 1.68, 1.0, 'bash');
  A(!g.dead && Math.abs(g.target.hp - 30) < 1e-6, 'hp=' + g.target.hp);
});

console.log('\n-- THE MISSION --');
T('the file downloads while you hold E, keeps its progress, and completes', () => {
  const m = new Mission({});
  for (let i = 0; i < 60; i++) m.download(DT);
  const part = m.file;
  A(part > 0.2 && part < 0.3 && !m.fileDone, 'one second in: ' + part);
  for (let i = 0; i < 60 * DOWNLOAD_TIME; i++) m.download(DT);
  A(m.fileDone && /Get out/.test(m.objective), 'should be done: ' + m.objective);
});
T('you cannot leave without the file; with it, the van ends the mission', () => {
  const m = new Mission({});
  A(!m.extract() && !m.done, 'left without the file');
  m.fileDone = true;
  A(m.extract() && m.done, 'should complete');
});
T('No Casualties: earned only if nobody was killed, and only once the mission is done', () => {
  const clean = new Mission({}); A(clean.trophies().length === 0, 'awarded before the end');
  clean.fileDone = true; clean.extract();
  A(clean.trophies().some((t) => t.id === 'no_casualties'), 'a clean run should earn it');
  const messy = new Mission({}); messy.guardDown({ id: 'x' }); messy.time = 400; messy.fileDone = true; messy.extract();
  A(!messy.trophies().length, 'earned despite a kill');
});
T('Quick Work: done inside five minutes, kills or not; not at five minutes or more', () => {
  const fast = new Mission({}); fast.time = 299; fast.guardDown({ id: 'x' }); fast.fileDone = true; fast.extract();
  A(fast.trophies().some((t) => t.id === 'quick_work'), 'should earn Quick Work');
  const slow = new Mission({}); slow.time = 300; slow.fileDone = true; slow.extract();
  A(!slow.trophies().some((t) => t.id === 'quick_work'), 'earned Quick Work at five minutes');
  const failed = new Mission({}); failed.time = 10; failed.result = 'failed';
  A(!failed.trophies().length, 'earned on a failed run');
});
T('the front doors: a pair, and the nearest one is not always the first', () => {
  const L = fresh(); const p = at(L, [-1.2, 0, 10.7], YAW.E);
  A(L.frontDoors.every((d) => d.def.pair === 'front'), 'pair tag');
  const nearest = L.frontDoors.filter((d) => d.near(p.pos)).sort((a, b) => Math.abs(a.centre[2] - p.pos[2]) - Math.abs(b.centre[2] - p.pos[2]))[0];
  A(nearest === L.frontDoors[1], 'the second leaf should be the nearest at z 10.7');
});
T('Unseen: the file taken before anyone saw you; being wondered about is allowed', () => {
  const clean = new Mission({ guards: 11 });
  clean.download(60); clean.spotted = 2; clean.extract();                 // seen only after the file was yours
  A(clean.trophies().some((t) => t.id === 'unseen'), 'should earn Unseen');
  const seen = new Mission({ guards: 11 });
  seen.spotted = 1; seen.download(60); seen.extract();
  A(!seen.trophies().some((t) => t.id === 'unseen'), 'earned Unseen after being seen');
});
T('No Witnesses: every guard down, killed or knocked out', () => {
  const m = new Mission({ guards: 3 });
  m.guardDown({ id: 'a', knockedOut: true }); m.guardDown({ id: 'b', target: {} });
  m.download(60); m.extract();
  A(!m.trophies().some((t) => t.id === 'no_witnesses'), 'two of three should not do');
  const all = new Mission({ guards: 3 });
  all.guardDown({ id: 'a', knockedOut: true }); all.guardDown({ id: 'b', target: {} }); all.guardDown({ id: 'c', knockedOut: true });
  all.download(60); all.extract();
  A(all.trophies().some((t) => t.id === 'no_witnesses'), 'all three down should');
});
T('Sharpshooter: every kill a headshot - and there has to be a kill', () => {
  const m = new Mission({ guards: 11 });
  m.guardDown({ id: 'a', target: { headshot: true } }); m.guardDown({ id: 'b', target: { headshot: true } });
  m.guardDown({ id: 'c', knockedOut: true });                                   // a knockout does not spoil it
  m.download(60); m.extract();
  A(m.trophies().some((t) => t.id === 'sharpshooter'), 'two headshot kills should earn it');
  const miss = new Mission({ guards: 11 });
  miss.guardDown({ id: 'a', target: { headshot: true } }); miss.guardDown({ id: 'b', target: { headshot: false } });
  miss.download(60); miss.extract();
  A(!miss.trophies().some((t) => t.id === 'sharpshooter'), 'a body-shot kill should spoil it');
  const none = new Mission({ guards: 11 }); none.download(60); none.extract();
  A(!none.trophies().some((t) => t.id === 'sharpshooter'), 'no kills, no Sharpshooter');
});
T('nothing is awarded before the mission is over', () => {
  const m = new Mission({ guards: 1 }); m.guardDown({ id: 'a', target: { headshot: true } }); m.download(60);
  A(m.trophies().length === 0, 'awarded early: ' + m.trophies().map((t) => t.id));
});
T('the debrief\'s figures: accuracy, and the favourite weapon (the one that put most down)', () => {
  const m = new Mission({ guards: 11 });
  for (let i = 0; i < 8; i++) m.shot('K7', i < 2);
  for (let i = 0; i < 3; i++) m.shot('PX9', true);
  m.downedWith('PX9'); m.downedWith('hands'); m.downedWith('hands');
  A(Math.abs(m.accuracy - 5 / 11) < 1e-9, 'accuracy ' + m.accuracy);
  A(m.favourite === 'hands', 'favourite ' + m.favourite);
  const quiet = new Mission({ guards: 11 });
  A(quiet.accuracy === null && quiet.favourite === null, 'no shots, no figures');
});
T('dying fails the mission: a failed debrief, and no trophies for it', () => {
  const m = new Mission({ guards: 11 });
  m.download(60);
  A(m.fail('Killed in action') && m.done && m.result === 'failed', 'should fail');
  A(!m.extract() && m.trophies().length === 0, 'a failed run earned something');
});
T('a hint shows once', () => {
  const m = new Mission({});
  A(m.hint('radar') && !m.hint('radar'), 'hints repeat');
});

// (M6.13.6, Rhys: "the doors on other levels and in Yard 7 ALSO need to be
// made gapless, and to work the same as Riverside Hotel")
const LEVELS = () => [['Meridian House', buildMission0()], ['Yard 7', buildTraining()], ['the hotel', buildHotel()]];
T('every hinged door on every level is hung one way, with room for its open leaf (M6.13.6)', () => {
  for (const [name, L] of LEVELS()) {
    A(L.swingDoors.length, name + ': no doors');
    const mine = new Set(L.swingDoors.map((d) => d.solid));
    for (const d of L.swingDoors) {
      A(d.def.swingTo === 1 || d.def.swingTo === -1, name + ': a two-way door at ' + d.centre.map((v) => v.toFixed(1)));
      const [mn, mx] = d.openBox(d.def.swingTo);
      const inWay = L.world.hits(mn.map((v) => v + 0.02), mx.map((v) => v - 0.02)).filter((s) => !mine.has(s) && !s.person && !s.target && !s.ghost);
      A(!inWay.length, name + ': the open leaf at ' + d.centre.map((v) => v.toFixed(1)) + ' runs into ' + inWay.map((s) => s.tag).join());
    }
  }
});
T('every shut door on every level is drawn gapless: to its jambs, its lintel, and the other leaf of a pair (M6.13.6)', () => {
  for (const [name, L] of LEVELS()) {
    const drawnAt = (pt) => L.pieces.some((q) => q.min && pt.every((v, i) => v >= q.min[i] - 1e-6 && v <= q.max[i] + 1e-6));
    for (const d of L.swingDoors) {
      const sl = d.def.seal, where = name + ' ' + d.centre.map((v) => v.toFixed(1));
      A(sl, where + ': no seal');
      const dir = Math.sign(d.def.to - d.def.from), y = d.def.y0 + 1.0;
      const pt = (along, yy) => { const p = [0, yy, 0]; p[d.n] = d.def.at; p[d.a] = along; return p; };
      const hingeEdge = d.def.from - dir * sl[0], latchEdge = d.def.to + dir * sl[1], top = d.def.y0 + d.def.h + sl[2];
      A(drawnAt(pt(hingeEdge - dir * 0.005, y)), where + ': a gap at the hinge jamb');
      A(drawnAt(pt((d.def.from + d.def.to) / 2, top + 0.005)), where + ': a gap under the lintel (leaf drawn to ' + top.toFixed(3) + ')');
      if (d.def.pair) {
        const o = L.swingDoors.find((q) => q !== d && q.def.pair === d.def.pair);
        const oLatch = o.def.to + Math.sign(o.def.to - o.def.from) * o.def.seal[1];
        A(Math.abs(oLatch - latchEdge) < 1e-6, where + ': the pair\'s leaves do not meet (' + latchEdge + ' / ' + oLatch + ')');
        A([d, o].filter((q) => q.def.seal[3]).length === 1, where + ': no single strip over the join');
      } else A(drawnAt(pt(latchEdge + dir * 0.005, y)), where + ': a gap at the latch jamb');
    }
  }
});
T('Meridian House\'s doors swing as the hotel\'s do: in from outside, into the rooms off the corridors (M6.13.6)', () => {
  const L = buildMission0();
  A(L.frontDoors.every((d) => d.def.swingTo === 1), 'the front doors do not swing in');
  A(L.backDoor.def.swingTo === -1, 'the back door does not swing in');
  A(L.serverDoor.def.swingTo === 1, 'the server room door does not swing into the server room');
  A(L.guardRoomDoor.def.swingTo === 1, 'the guard room door does not swing into the guard room');
  // and from the corridor it opens the way it is hung, whichever side you stand
  const d = L.swingDoors.find((q) => !q.locked && !q.def.pair && q.def.y0 === 0 && q.def.plane === 'z');
  for (const off of [-0.9, 0.9]) {
    d.set(false, d.side);
    const pos = d.centre.slice(); pos[1] = 0; pos[2] += off;
    A(d.use(pos, null) === 'opened' && d.side === d.def.swingTo, 'from ' + off + ' it swung ' + d.side);
  }
});
T('every Meridian House door off a corridor swings INTO its room, not out into the corridor (M6.13.7, Rhys)', () => {
  const L = buildMission0();
  // [wall plane, at, y0, along-the-wall centre] -> which way is into the room
  const want = [
    ['z', 9, 0, 15.5, -1], ['z', 9, 0, 30.5, -1], ['x', 34, 0, 10.5, 1], ['z', 12, 0, 16.5, 1], ['z', 12, 0, 28.5, 1],
    ['z', 9, 3.6, 30.5, -1], ['x', 34, 3.6, 10.5, 1], ['z', 12, 3.6, 26.5, 1],
    ['z', 7, 7.2, 6, -1], ['z', 7, 7.2, 36, -1], ['z', 11, 7.2, 20, 1], ['z', 15, 7.2, 5.5, 1], ['z', 15, 7.2, 34.5, 1],
  ];
  for (const [plane, at, y0, mid, side] of want) {
    const d = L.swingDoors.find((q) => q.def.plane === plane && Math.abs(q.def.at - at) < 0.01 && Math.abs(q.def.y0 - y0) < 0.01 && Math.abs((q.def.from + q.def.to) / 2 - mid) < 0.1);
    A(d, 'no door at ' + [plane, at, y0, mid]);
    A(d.def.swingTo === side, 'the door at ' + plane + '=' + at + ' (' + mid + ', floor y ' + y0 + ') swings ' + d.def.swingTo + ', into the corridor');
  }
});
T('chooseSwing: between a long corridor and an office, the door swings into the office - though the corridor is narrower (M6.13.7)', () => {
  const w = new World();
  w.addSolid([-30, -0.1, -30], [30, 0, 30], 'floor');
  // the wall at x = 0 with the doorway; the corridor on -x: 3 m wide, 40 m long
  w.addSolid([-0.1, 0, -20], [0.1, 2.5, -0.5], 'wall'); w.addSolid([-0.1, 0, 0.5], [0.1, 2.5, 20], 'wall'); w.addSolid([-0.1, 2.1, -0.5], [0.1, 2.5, 0.5], 'lintel');
  w.addSolid([-3.1, 0, -20], [-3, 2.5, 20], 'wall');
  // the office on +x: 6 x 6, closed
  w.addSolid([0.1, 0, -3.1], [6.1, 2.5, -3], 'wall'); w.addSolid([0.1, 0, 3], [6.1, 2.5, 3.1], 'wall'); w.addSolid([6, 0, -3.1], [6.1, 2.5, 3.1], 'wall');
  const d = new SwingDoor(w, { plane: 'x', at: 0, wall: [-0.1, 0.1], from: -0.48, to: 0.48, y0: 0, h: 2.08 });
  A(chooseSwing(w, d) === 1, 'swung into the corridor');
  // and a desk in the office does not change it (the flood passes over furniture)
  w.addSolid([2, 0, -2], [4, 0.75, 2], 'desk');
  A(chooseSwing(w, d) === 1, 'a desk made the office look smaller than it is - or bigger');
});
T('chooseSwing: a door with a wall hard by on one side swings to the other; with no room either side it stays two-way', () => {
  const w = new World();
  w.addSolid([-5, -0.1, -5], [5, 0, 5], 'floor');
  const d = new SwingDoor(w, { plane: 'x', at: 0, wall: [-0.1, 0.1], from: -0.48, to: 0.48, y0: 0, h: 2 });
  A(chooseSwing(w, d) !== undefined, 'open floor: no swing');
  const block = w.addSolid([0.2, 0, -0.6], [0.6, 1.5, -0.3], 'cabinet');        // in the +x arc, by the hinge
  A(chooseSwing(w, d) === -1, 'swung into the cabinet: ' + chooseSwing(w, d));
  w.addSolid([-0.6, 0, -0.6], [-0.2, 1.5, -0.3], 'cabinet');
  A(chooseSwing(w, d) === undefined, 'no room either side, but hung anyway');
  block.disabled = true;
  // a small room on +x (walls close round), the open on -x: it swings into the room
  w.addSolid([0.1, 0, -1.6], [2.2, 2.5, -1.5], 'w'); w.addSolid([0.1, 0, 1.5], [2.2, 2.5, 1.6], 'w'); w.addSolid([2.2, 0, -1.6], [2.3, 2.5, 1.6], 'w');
  w.solids.find((s) => s.tag === 'cabinet' && !s.disabled && s.min[0] < 0).disabled = true;
  A(chooseSwing(w, d) === 1, 'did not swing into the small room');
});
T('the debrief: trophies and accolades are on a page 2, a button away - and no page 2 when there is nothing (M6.13.6, Rhys)', () => {
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
  const p1 = html.indexOf('id="mend-p1"'), p2 = html.indexOf('id="mend-p2"'), tr = html.indexOf('id="mend-trophies"'), st = html.indexOf('id="mend-stats"');
  A(p1 > 0 && p2 > p1 && st > p1 && st < p2, 'the stats are not on page 1');
  A(tr > p2, 'the trophies are not on page 2');
  A(/id="mend-page"/.test(html), 'no button to turn the page');
  A(awardsButton([], new Set()) === null, 'a page 2 with nothing on it');
  const all = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const b = awardsButton(all, new Set(['b']));
  A(/\(3\)/.test(b) && /1 new/.test(b), 'the button reads ' + b);
  A(!/new/.test(awardsButton(all, new Set())), 'says new when nothing is');
  const js = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/awardsButton\(all, isNew\)/.test(js) && /mend-p2/.test(js), 'the debrief does not page');
});
console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + ')' : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
