// FRONTLINE - training course tests.
import { Player, P, blankInput, forwardOf } from '../src/sim/people/player.js';
import { buildTraining } from '../src/game/levels/yard7.js';
import { Course, movementSteps } from '../src/sim/play/course.js';
import { World } from '../src/sim/world/world.js';
import { Arsenal, makeTarget } from '../src/sim/arms/weapons.js';
import { Loadout } from '../src/sim/arms/loadout.js';
import * as W from '../src/sim/play/course.js';
import { stepRanges } from '../src/game/levels/ranges.js';
import { readFileSync } from 'fs';
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const DT = 1 / 60;
const L = buildTraining();
const DY = -16;                       // the course sits this far below the yard
const newRun = () => {
  const world = L.world;
  for (const s of world.solids) if (/^door\d/.test(s.tag || '')) s.disabled = false;
  const p = new Player(world);
  p.pos = L.tutorialSpawn.slice(); p.vel = [0, 0, 0]; p.settle();
  const c = new Course(world, movementSteps(L.marks));
  return { p, c };
};
const at = (p, pos, yaw) => { p.pos = pos.slice(); p.vel = [0, 0, 0]; p.mode = 'walk'; p.yaw = yaw || 0; p.settle(); };
const run = (p, c, secs, inp) => {
  let prev = false;
  for (let i = 0; i < Math.round(secs / DT); i++) {
    const src = typeof inp === 'function' ? inp(i * DT, p, c) : inp;
    const x = Object.assign(blankInput(), { yaw: p.yaw, pitch: p.pitch }, src);
    x.jumpPressed = !!x.jump && !prev; prev = !!x.jump;
    p.step(DT, x);
    c.update(p, null, DT);
  }
};
const YAW = { E: -Math.PI / 2, W: Math.PI / 2, N: 0, S: Math.PI };

T('the course starts at its own spawn with a first instruction', () => {
  const { p, c } = newRun();
  A(Math.abs(p.pos[0] + 194) < 1 && p.onGround, 'spawn: ' + p.pos.map((v) => v.toFixed(1)));
  A(/W A S D/.test(c.text), 'first instruction: ' + c.text);
  A(c.section === 'movement', 'section: ' + c.section);
});
T('walking forward completes the first step', () => {
  const { p, c } = newRun();
  p.yaw = YAW.E;
  run(p, c, 3, { moveZ: 1, yaw: YAW.E });
  A(c.step && c.step.id === 'jump', 'did not advance: ' + (c.step && c.step.id));
});
T('the doors stay shut until their step is done', () => {
  const { p, c } = newRun();
  const door1 = L.world.solids.filter((s) => s.tag === 'door1');
  A(door1.length && !door1[0].disabled, 'door 1 should start shut');
  p.yaw = YAW.E;
  run(p, c, 14, (t) => ({ moveZ: 1, yaw: YAW.E, sprint: t > 2 && t < 6, jump: t > 3.4 && t < 3.7 }));
  // where exactly it gets to depends on how the run goes; what matters is
  // that it is past the jump and the door behind it has opened
  A(c.step && !['walk', 'jump'].includes(c.step.id), 'should be past the jump: ' + (c.step && c.step.id));
  A(door1[0].disabled, 'door 1 should be open once the gap is jumped');
});
T('falling in the trench is not a dead end - there is a ladder out', () => {
  const { p, c } = newRun();
  p.pos = [-180.1, -5.5 + DY, 3.6]; p.vel = [0, 0, 0]; p.yaw = YAW.W; p.settle();
  run(p, c, 9, { moveZ: 1, yaw: YAW.W });
  A(p.pos[1] > DY - 1, 'could not climb out: y=' + p.pos[1].toFixed(2));
});
T('skipping the movement section opens every one of its doors', () => {
  const { p, c } = newRun();
  A(c.skipSection('movement'), 'nothing to skip');
  A(c.done, 'the course should be finished');
  for (const tag of ['door1', 'door2', 'door4']) {
    const d = L.world.solids.filter((s) => s.tag === tag);
    A(d.length && d.every((s) => s.disabled), tag + ' is still shut');
  }
});
T('each section of the course is reachable from the one before', () => {
  // the geometry: every marked area must be somewhere you can stand
  const { p } = newRun();
  for (const [name, z] of Object.entries(L.marks)) {
    const mid = [(z[0][0] + z[1][0]) / 2, Math.max(z[0][1], 0) + 0.05, (z[0][2] + z[1][2]) / 2];
    p.pos = mid.slice(); p.vel = [0, 0, 0];
    A(p.free(p.pos) || p.free(p.pos, P.crouchHeight) || p.free(p.pos, P.proneHeight),
      name + ' is inside something (not even room to crawl)');
  }
});
T('the course lets out into Yard 7 through the west gateway', () => {
  const { p, c } = newRun();
  c.skipAll();
  // the way out runs through the weapons wing and up the east corridor
  p.pos = [-66, 0, 30]; p.vel = [0, 0, 0]; p.yaw = YAW.N; p.settle();
  run(p, c, 14, { moveZ: 1, yaw: YAW.N, sprint: true });
  A(p.pos[2] < 2, 'did not reach the gateway: z=' + p.pos[2].toFixed(1));
  run(p, c, 6, { moveZ: 1, yaw: YAW.E });
  A(p.pos[0] > -59.6, 'did not get into the yard: x=' + p.pos[0].toFixed(1));
});
T('the crawl steps read the course\'s own height, not absolute metres', () => {
  // this broke when the course was sunk: the tests said "above 6 m"
  const { p, c } = newRun();
  while (c.step && c.step.id !== 'crouch') c.advance();
  const tunnel = L.marks.crawled;
  // lying down in the tunnel completes the crawl
  at(p, [(tunnel[0][0] + tunnel[1][0]) / 2, tunnel[0][1], 0], YAW.E);
  p.setStance(1); p.setStance(2);
  c.update(p, null, 0.2);
  A(c.step.id === 'stand', 'crawling should lead to standing up: ' + c.step.id);
  // and standing up completes the next
  p.setStance(0);
  c.update(p, null, 0.2);
  A(c.step.id === 'drop', 'standing up should lead to the drop: ' + c.step.id);
});
T('the weapons half: every range has targets, a weapon crate, and a door', () => {
  const { weaponsSteps, downFraction } = W;
  const steps = weaponsSteps(L);
  A(steps.length >= 10, 'steps: ' + steps.length);
  for (const g of ['pistol', 'rifle', 'sniper', 'grenade', 'turret']) {
    A((L.groups[g] || []).length > 0, 'no targets for ' + g);
  }
  for (const tag of ['wdoor1', 'wdoor2', 'wdoor3', 'wdoor4', 'wdoor5']) {
    A(L.world.solids.some((s) => s.tag === tag), tag + ' missing');
  }
  for (const want of ['PX9', 'K7', 'LR7', 'FRAG']) {
    A(L.crates.some((c) => c.items.length === 1 && c.items[0] === want), 'no single-item crate for ' + want);
  }
});
T('a range door opens only when enough of its targets are down', () => {
  const { weaponsSteps } = W;
  const c = new Course(L.world, weaponsSteps(L));
  const door = L.world.solids.filter((s) => s.tag === 'wdoor1');
  for (const s of door) s.disabled = false;
  for (const t of L.groups.pistol) { t.down = false; t.hp = t.maxHp; }
  const p = new Player(L.world);
  const fakeArsenal = { owned: { PX9: true } };
  c.update(p, fakeArsenal, 0.1);                    // picking it up is step one
  A(c.step.id === 'pistol-range', 'step: ' + c.step.id);
  L.groups.pistol[0].down = true;
  c.update(p, fakeArsenal, 0.1);
  A(c.step.id === 'pistol-range' && !door[0].disabled, 'one target should not open the door');
  for (const t of L.groups.pistol) t.down = true;
  c.update(p, fakeArsenal, 0.1);
  A(door[0].disabled, 'clearing the range should open the door');
  A(c.step.id === 'rifle-get', 'next step: ' + c.step.id);
});
T('the turrets can actually be shot from the cover you are given', () => {
  for (const turret of L.turrets) {
    // from behind each low wall, leaning out
    let hit = false;
    for (const from of [[-262, 1.64 + DY, 47], [-252, 1.64 + DY, 55], [-260, 1.64 + DY, 63]]) {
      const c = turret.centre;
      const d = [c[0] - from[0], c[1] - from[1], c[2] - from[2]];
      const len = Math.hypot(d[0], d[1], d[2]);
      const r = L.world.raycast(from, d.map((v) => v / len), len + 0.5);
      if (r && r.solid.target === turret) { hit = true; break; }
    }
    A(hit, 'a turret at ' + turret.centre.map((v) => v.toFixed(0)) + ' cannot be hit from cover');
  }
});
T('the turrets watch the whole of their bay, and nowhere else', () => {
  const p = new Player(L.world);
  const seen = (pos) => {
    p.pos = pos.slice(); p.vel = [0, 0, 0];
    for (const t of L.turrets) { t.down = false; t.turret.seen = 0; t.turret.reload = 0; }
    stepRanges(L, p, { events: [] }, 0.1, 1);
    return L.turrets.some((t) => t.turret.canSee);
  };
  A(seen([-258, DY, 52]), 'standing in the open in the bay, a turret should see you');
  A(!seen([-249, DY, 33]), 'behind the baffle, no turret should see you');
  A(!seen([-104, DY, 14]), 'in another part of the building, the turrets should not care');
});
T('the turret bay has a safe corner, and cover to peek from', () => {
  const p = new Player(L.world);
  const safe = L.marks.turretSafe;
  const mid = [(safe[0][0] + safe[1][0]) / 2, DY + 0.05, (safe[0][2] + safe[1][2]) / 2];
  p.pos = mid.slice();
  A(p.free(p.pos), 'the safe corner is inside something');
  const turret = L.turrets[0].turret;
  // from the safe corner the turret cannot reach you
  const eye = [mid[0], mid[1] + 1.64, mid[2]];
  const d = [eye[0] - turret.pos[0], eye[1] - turret.pos[1], eye[2] - turret.pos[2]];
  const dist = Math.hypot(d[0], d[1], d[2]);
  A(dist > 20, 'the safe corner should be well back: ' + dist.toFixed(1));
  // and there is low cover in the bay
  A(L.world.solids.some((s) => s.min[0] < -245 && s.max[1] > 1 + DY && s.max[1] < 1.3 + DY && s.min[2] > 40 && s.max[2] < 70),
    'no low wall to hide behind');
  // and the safe corner must really be safe: no turret may see into it
  for (const turret of L.turrets) {
    for (const spot of [[-249, 1.64 + DY, 33], [-248, 1.64 + DY, 34.5], [-250.5, 1.64 + DY, 32]]) {
      const q = turret.turret.pos;
      const d = [spot[0] - q[0], spot[1] - q[1], spot[2] - q[2]];
      const len = Math.hypot(d[0], d[1], d[2]);
      const u = d.map((v) => v / len);
      // look from outside the housing, as the turret does
      const from = [q[0] + u[0] * 0.8, q[1] + u[1] * 0.8, q[2] + u[2] * 0.8];
      const r = L.world.raycast(from, u, len - 0.8);
      A(r && r.t < len - 1.2, 'a turret can see the safe corner at ' + spot.join(','));
    }
  }
});
T('moving targets actually move, and stop when they are down', () => {
  const mover = L.groups.rifle.find((t) => t.track);
  A(mover, 'no moving target');
  const p = new Player(L.world);
  const x0 = mover.centre[0];
  stepRanges(L, p, { events: [] }, 0.1, 3.2);
  A(Math.abs(mover.centre[0] - x0) > 0.05, 'it did not move');
  A(mover.solid.min[0] < mover.centre[0] && mover.solid.max[0] > mover.centre[0], 'its collision did not follow');
  mover.down = true;
  const x1 = mover.centre[0];
  stepRanges(L, p, { events: [] }, 0.1, 9.9);
  A(mover.centre[0] === x1, 'a downed target should stay put');
});

T('the firing line has wire you cannot climb or vault', () => {
  const p = new Player(L.world);
  // stand at the pistol line, facing the range
  at(p, [-104, DY, 14.6], Math.PI);
  const ledge = p.findLedge(2.35);
  A(!ledge, 'the wire should offer nothing to climb: ' + JSON.stringify(ledge && ledge.kind));
  run(p, new Course(L.world, []), 3, (t2) => ({ moveZ: 1, yaw: Math.PI, sprint: true, jump: Math.floor(t2 * 4) % 2 === 0 }));
  A(p.pos[2] < 16, 'got into the gallery over the line: z=' + p.pos[2].toFixed(1));
});
T('the corridor is walled wherever no gallery opens', () => {
  const p = new Player(L.world);
  for (const x of [-84.8, -125.6, -177, -85.5]) {
    p.pos = [x, DY + 0.1, 15.5]; p.vel = [0, 0, 0]; p.mode = 'walk'; p.settle();
    run(p, new Course(L.world, []), 2.5, { moveZ: 1, yaw: Math.PI, sprint: true });
    A(p.pos[1] > DY - 1, 'fell out of the world at x=' + x + ' (ended ' + p.pos.map((v) => v.toFixed(1)) + ')');
  }
});
T('a pistol cannot clear the sniper gallery: range tells', () => {
  const w = new World();
  w.addSolid([-10, -1, -10], [10, 0, 500], 'ground');
  w.spawn = { pos: [0, 0, 0], yaw: 0 };
  // one target per shot, or a near one would stop the far shot
  const shoot = (id, dist) => {
    const w2 = new World();
    w2.addSolid([-10, -1, -10], [10, 0, 500], 'ground');
    w2.spawn = { pos: [0, 0, 0], yaw: 0 };
    const t = makeTarget(w2, [-0.5, 1, -dist], [0.5, 2, -dist + 0.1], { hp: 400 });
    const l = new Loadout({ primary: 'K7' });
    l.put('primary', id);
    const a = new Arsenal(w2, { loadout: l, start: id });
    for (let i = 0; i < 60; i++) a.step(1 / 60, null);
    const before = t.hp;
    a.cool = 0;
    a.fire([0, 1.6, 0], [0, 0, -1], { aim: true });
    return before - t.hp;
  };
  const pistolNear = shoot('PX9', 20), pistolFar = shoot('PX9', 120);
  const rifleFar = shoot('LR7', 120);
  A(pistolNear > 20, 'a pistol should be fine up close: ' + pistolNear.toFixed(1));
  A(pistolFar < pistolNear * 0.35, `a pistol at 120 m: ${pistolFar.toFixed(1)} vs ${pistolNear.toFixed(1)} up close`);
  A(rifleFar > 80, 'a marksman rifle should not fall off at 120 m: ' + rifleFar.toFixed(1));
});

console.log('\n-- THE LINK ROOM DOOR, AND THE DESERT --');
const linkDoor = () => L.swingDoors.find((d) => d.def.plane === 'x' && Math.abs(d.def.at + 83.8) < 0.01);
const runNoCourse = (p, secs, inp) => { for (let i = 0; i < Math.round(secs / DT); i++) p.step(DT, Object.assign(blankInput(), { yaw: p.yaw }, inp)); };
const walkE = (from, secs) => {
  const p = new Player(L.world); at(p, from, YAW.E);
  runNoCourse(p, secs || 3, { moveZ: 1, yaw: YAW.E });
  return p;
};
T('there is an ordinary door between the link room and the stairs, and it starts shut', () => {
  const d = linkDoor();
  A(d, 'no door at x -83.8');
  d.set(false, 1);
  const p = walkE([-87, DY, 0]);
  A(p.pos[0] < -84.1, 'walked through a shut door: x=' + p.pos[0].toFixed(2));
});
T('the door opens (pushed from the link room), and you can walk through to the stairs', () => {
  const d = linkDoor(); d.set(false, 1);
  const p = new Player(L.world); at(p, [-85, DY, 0], YAW.E);
  A(d.near(p.pos), 'should be in reach');
  A(d.use(p.pos, p.box()) === 'opened' && d.side === 1, 'should swing east, away from you: ' + d.side);
  runNoCourse(p, 3, { moveZ: 1, yaw: YAW.E });
  A(p.pos[0] > -78, 'should reach the corridor: x=' + p.pos[0].toFixed(2));
  // (M6.13.6, Rhys: doors work the same as the hotel's) hung one way: from the
  // stairs side it is pulled towards you - the same way - and a step back clears its swing
  d.set(false, 1);
  A(d.def.swingTo === 1, 'not hung to swing east, into the corridor: ' + d.def.swingTo);
  const q = new Player(L.world); at(q, [-82.6, DY, 0], YAW.W);
  A(d.use(q.pos, q.box()) === 'opened' && d.side === 1, 'from the stairs side it swung ' + d.side + ', not the way it is hung');
  d.set(false, 1);
  const back = d.stepClear([-83.3, DY, -0.2], 0.3);
  A(back && back[0] > -83.3 + 0.3, 'standing in its swing, no step back: ' + JSON.stringify(back));
});
T('you cannot shut the door on yourself', () => {
  const d = linkDoor(); d.set(true, 1);
  const p = new Player(L.world); at(p, [-83.8, DY, 0], YAW.E);
  A(d.use(p.pos, p.box()) === 'blocked', 'shut while standing in the doorway');
  at(p, [-85.2, DY, 0], YAW.E);
  A(d.use(p.pos, p.box()) === 'shut', 'should shut once you step out');
});
T('the door is drawn turning the right way: shut along the wall, open flat against it', () => {
  const d = linkDoor();
  d.set(false, 1); d.swing = 0;
  A(Math.abs(Math.sin(d.yaw())) < 1e-6 && Math.cos(d.yaw()) > 0.99, 'shut should point +z (hinge to latch): ' + d.yaw());
  d.set(true, 1); d.swing = 1;
  A(Math.abs(Math.sin(d.yaw()) - 1) < 1e-6, 'open east should point +x: ' + d.yaw());
  d.set(true, -1); d.swing = 1;
  A(Math.abs(Math.sin(d.yaw()) + 1) < 1e-6, 'open west should point -x: ' + d.yaw());
  d.set(false, 1); d.swing = 0;
});
T('a round goes through the door, as through a thin wall', () => {
  const d = linkDoor(); d.set(false, 1);
  A(d.solid.tough === 2, 'door toughness: ' + d.solid.tough);
});
T('signs point the way to the weapons range, facing their readers', () => {
  const byWall = L.signs.find((s) => /WEAPONS RANGE/.test(s.text) && Math.abs(s.pos[0] + 84.03) < 0.05);
  A(byWall && Math.abs(byWall.yaw + Math.PI / 2) < 1e-6, 'sign beside the door, facing into the link room (-x)');
  A(/\u2192/.test(byWall.text) && byWall.pos[2] > 0.7, 'with an arrow, on the right-hand side of the door');
  const stairs = L.signs.find((s) => /WEAPONS RANGE/.test(s.text) && s.pos[0] > -83.6 && s.pos[0] < -83.5);
  A(stairs && Math.abs(stairs.yaw - Math.PI / 2) < 1e-6 && /left/.test(stairs.sub), 'sign on the stairs side, facing +x');
});
T('starting at the weapons half puts you in the link room, not on the tunnel roof', () => {
  const p = new Player(L.world);
  p.pos = L.weaponsStart.pos.slice(); p.settle();
  A(Math.abs(p.pos[1] - DY) < 0.01, 'should stand on the link room floor: y=' + p.pos[1].toFixed(2));
});
T('the desert meets the stairwell block on every side, and does not cut into it', () => {
  const covered = (x, z) => L.pieces.some((q) => q.mat === 'desert' && q.max[1] <= -0.4 && q.max[1] > -0.6 &&
    x >= q.min[0] && x <= q.max[0] && z >= q.min[2] && z <= q.max[2]);
  // Rhys's three rectangles, sampled every half metre
  const holes = [];
  for (let x = -76.9; x <= -61.1; x += 0.5) for (let z = -4.9; z <= 7.9; z += 0.5) {
    const inShell = x > -74.4 && x < -60 && z > -3.6 && z < 3.6;
    if (!inShell && !covered(x, z)) holes.push(x.toFixed(1) + ',' + z.toFixed(1));
    if (inShell && covered(x + 0.01, z) && x > -74.3 && z > -3.5 && z < 3.5) holes.push('inside ' + x.toFixed(1) + ',' + z.toFixed(1));
  }
  A(!holes.length, holes.length + ' bad samples, e.g. ' + holes.slice(0, 5).join(' '));
});

T('every range target and turret in Yard 7 knows its range and stays down once down (M6.13.7, Rhys)', () => {
  const ts = Object.values(buildTraining().groups || {}).flat();     // a fresh one: earlier tests shoot these
  A(ts.length > 10, 'only ' + ts.length + ' range targets');
  for (const t of ts) {
    A(t.lane && t.lane === t.group, 'a target in ' + t.group + ' has lane ' + t.lane);
    A(t.respawn >= 1e6 && t.down === false, 'a target in ' + t.group + ' comes back after ' + t.respawn + ' s');
  }
  A(ts.some((t) => t.lane === 'turret'), 'no turret targets');
});
T('"Back to the start of this section" puts you on the course floor where the section starts - not on the range\'s roof (M6.13.7, Rhys)', () => {
  const L2 = buildTraining(), ss = L2.sectionStarts;
  A(ss && ss.movement && ss.weapons, 'no section starts');
  for (const [k, st] of Object.entries(ss)) {
    const p = new Player(L2.world); p.pos = st.pos.slice(); p.vel = [0, 0, 0]; p.settle();
    A(Math.abs(p.pos[1] - DY) < 0.3, k + ': you land at y ' + p.pos[1].toFixed(2) + ', not on the course floor (' + DY + ')');
    A(p.free(p.pos, p.h), k + ': you start inside something');
  }
  const w = ss.weapons.pos;
  A(w[0] > -94 && w[0] < -84 && Math.abs(w[2]) < 4, 'the weapons half does not start in the link room: ' + w);
  const src = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(!/player\.pos = \[-?\d/.test(src), 'main.js still puts you at a position of its own');
  A((src.match(/sectionStarts/g) || []).length >= 3, 'not every way into a section uses sectionStarts');
});
console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + ')' : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
