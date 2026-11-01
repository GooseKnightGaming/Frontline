// FRONTLINE - movement tests. Plain node, no browser.
import { World } from '../src/sim/world/world.js';
import { Player, P, blankInput, forwardOf, gripOf, GRIP_NEED } from '../src/sim/people/player.js';
import { Arsenal, makeTarget } from '../src/sim/arms/weapons.js';
import { Loadout } from '../src/sim/arms/loadout.js';
import { buildTraining, CONTAINER } from '../src/game/levels/yard7.js';
import { CamSmoother } from '../src/game/core/camsmooth.js';

let pass = 0; const fails = [];
const T = (name, fn) => { try { fn(); pass++; console.log('  PASS  ' + name); } catch (e) { fails.push(name + ' -> ' + e.message); console.log('  FAIL  ' + name + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const YAW = { N: 0, S: Math.PI, E: -Math.PI / 2, W: Math.PI / 2 };
const DT = 1 / 60;

function flat() {
  const w = new World();
  w.addSolid([-100, -1, -100], [100, 0, 100], 'ground');
  w.spawn = { pos: [0, 0, 0], yaw: 0 };
  return w;
}
function run(p, secs, inp) {
  const n = Math.round(secs / DT);
  let prevJump = false;
  for (let i = 0; i < n; i++) {
    const t = i * DT;
    const src = typeof inp === 'function' ? inp(t, p) : inp;
    const x = Object.assign(blankInput(), { yaw: p.yaw, pitch: p.pitch }, src);
    x.jumpPressed = !!x.jump && !prevJump;
    prevJump = !!x.jump;
    p.step(DT, x);
  }
}
const at = (p, pos, yaw) => { p.pos = pos.slice(); p.vel = [0, 0, 0]; p.yaw = yaw || 0; p.mode = 'walk'; p.traverse = null; p.ladder = null; p.crouching = false; p.h = P.height; p.onGround = false; run(p, 0.2, { yaw: p.yaw }); };

console.log('\n-- BASICS --');
T('the operative stands on the ground at spawn', () => {
  const p = new Player(flat());
  run(p, 0.5, {});
  A(p.onGround && near(p.pos[1], 0, 1e-3), 'not on the ground: y=' + p.pos[1]);
});
T('walking reaches walking speed, sprinting is faster and costs stamina', () => {
  const p = new Player(flat());
  run(p, 1, { moveZ: 1 });
  const walk = Math.hypot(p.vel[0], p.vel[2]);
  A(near(walk, P.walk, 0.05), 'walk speed ' + walk);
  A(p.pos[2] < -3, 'did not move forward (north): z=' + p.pos[2]);
  run(p, 1, { moveZ: 1, sprint: true });
  const sprint = Math.hypot(p.vel[0], p.vel[2]);
  A(near(sprint, P.sprint, 0.05) && p.stamina < P.staminaMax, 'sprint ' + sprint + ' stamina ' + p.stamina);
});
T('sprinting past empty leaves you winded, and slower, until you are back to zero', () => {
  const p = new Player(flat());
  run(p, 9.5, { moveZ: 1, sprint: true });
  A(p.stamina < 0 && p.exhausted, 'should be in the red: ' + p.stamina.toFixed(1));
  A(!p.sprinting, 'should not still be sprinting');
  const winded = Math.hypot(p.vel[0], p.vel[2]);
  run(p, 4, {});
  A(p.stamina >= 0 && !p.exhausted, 'should have recovered to zero: ' + p.stamina.toFixed(1));
  run(p, 1, { moveZ: 1 });
  A(Math.hypot(p.vel[0], p.vel[2]) > winded + 0.5, `should be quicker once recovered: ${winded.toFixed(1)} -> ${Math.hypot(p.vel[0], p.vel[2]).toFixed(1)}`);
  run(p, 0.3, { moveZ: 1, sprint: true });
  A(p.sprinting, 'could not sprint again after resting');
});
T('a last scrap of stamina is enough to act, and puts you in the red', () => {
  const p = new Player(flat());
  p.stamina = 2;
  let top = 0;
  run(p, 1, (t, pl) => { top = Math.max(top, pl.pos[1]); return { jump: t < 0.05 }; });
  A(top > 0.6, 'a jump with 2% left should still happen: ' + top.toFixed(2));
  A(p.stamina < 0 && p.exhausted, 'and should leave you winded: ' + p.stamina.toFixed(1));
});
T('walls stop you', () => {
  const w = flat(); w.addSolid([-5, 0, -3], [5, 3, -2]);
  const p = new Player(w);
  run(p, 3, { moveZ: 1 });
  A(p.pos[2] >= -2 + P.radius - 0.01 && p.pos[2] < -1.5, 'went through the wall: z=' + p.pos[2]);
});
T('a jump rises about a metre and lands again', () => {
  const p = new Player(flat());
  let top = 0;
  run(p, 1.2, (t, pl) => { top = Math.max(top, pl.pos[1]); return { jump: t < 0.05 }; });
  A(near(top, P.jump * P.jump / (2 * P.gravity), 0.08), 'apex ' + top);
  A(p.onGround, 'did not land');
});
T('stairs are climbed by walking; steps are too tall to need a jump', () => {
  const w = flat();
  for (let i = 0; i < 6; i++) w.addSolid([-1, 0, -1 - (i + 1) * 0.5], [1, (i + 1) * 0.4, -1 - i * 0.5]);
  const p = new Player(w);
  run(p, 3, (t, pl) => ({ moveZ: pl.pos[2] > -3.5 ? 1 : 0 }));
  A(near(p.pos[1], 2.4, 0.05), 'did not walk up the stairs: y=' + p.pos[1]);
});
T('crouching fits under a low roof, and you cannot stand until clear', () => {
  const w = flat();
  w.addSolid([-1.6, 0, -15], [-1.0, 2.4, -2]); w.addSolid([1.0, 0, -15], [1.6, 2.4, -2]);
  w.addSolid([-1.6, 1.25, -15], [1.6, 2.4, -2]);
  const p = new Player(w);
  run(p, 2, { moveZ: 1 });
  A(p.pos[2] > -2, 'walked under a 1.25 m roof standing: z=' + p.pos[2]);
  // one press of C and hold it: crouched all the way through
  run(p, 8, { moveZ: 1, crouch: true });
  A(p.stance === 1 && p.pos[2] < -14, 'could not crouch through: z=' + p.pos[2] + ' stance ' + p.stance);
  // still under the roof at the far end? then no standing up
  const p2 = new Player(w);
  run(p2, 4, { moveZ: 1, crouch: true });
  A(p2.pos[2] > -15, 'setup: should still be inside');
  run(p2, 0.3, { crouch: false });
  A(p2.crouching && p2.prompt === 'No room to stand', 'stood up under the roof');
  // out the other side, releasing C stands you up
  run(p, 0.4, { crouch: false });
  A(p.stance === 0, 'did not stand after leaving: stance ' + p.stance + ' z=' + p.pos[2]);
});

console.log('\n-- VAULTING AND CLIMBING --');
for (const [h, kind] of [[0.8, 'vault'], [1.25, 'vault'], [1.7, 'climb'], [2.2, 'climb']]) {
  T(`a ${h} m wall: ${kind}`, () => {
    const w = flat(); const d = kind === 'vault' ? 0.5 : 1.0;
    w.addSolid([-3, 0, -3 - d], [3, h, -3]);
    const p = new Player(w);
    run(p, 0.8, { moveZ: 1 });
    A(p.prompt.indexOf(kind === 'vault' ? 'Vault' : 'Climb') >= 0, 'prompt was "' + p.prompt + '"');
    let saw = '', done = false;
    run(p, 1.6, (t, pl) => { if (pl.traverse) saw = pl.traverse.kind; else if (saw) done = true; return { moveZ: done && kind === 'climb' ? 0 : 1, jump: t < 0.1 }; });
    A(saw === kind, 'did a ' + (saw || 'nothing'));
    if (kind === 'vault') A(p.pos[2] < -3 - d && near(p.pos[1], 0, 0.01), 'did not land beyond: ' + p.pos.map(v => v.toFixed(2)));
    else A(near(p.pos[1], h, 0.01), 'not on top: y=' + p.pos[1]);
  });
}
T('a container is too tall to climb from standing, but a running jump catches it', () => {
  const w = flat();
  w.addSolid([-4, 0, -8], [4, 2.59, -3], 'container');
  const stand = new Player(w);
  at(stand, [0, 0, -1.5], YAW.N);
  run(stand, 2, { moveZ: 1 });
  A(stand.pos[1] < 1, 'walking at it should not get you up: y=' + stand.pos[1].toFixed(2));
  // with a run-up and a jump, you catch the lip and haul yourself over
  const leap = new Player(w);
  at(leap, [0, 0, -1.5], YAW.N);
  let prev = false;
  run(leap, 1.4, (t) => {
    const inp = { moveZ: 1, yaw: YAW.N, sprint: true, jump: t > 0.2 && t < 0.3 };
    inp.jumpPressed = inp.jump && !prev; prev = inp.jump;
    return inp;
  });
  A(leap.pos[1] > 2.4, 'a running jump should catch it: y=' + leap.pos[1].toFixed(2));
});
T('jumping at a ledge and holding forward grabs it mid-air', () => {
  const w = flat(); w.addSolid([-3, 0, -4], [3, 2.3, -3]);
  const p = new Player(w);
  p.pos = [0, 0, -2.2];
  run(p, 2, (t, pl) => ({ moveZ: pl.pos[1] > 2 && !pl.traverse ? 0 : 1, jump: t < 1.0 }));
  A(near(p.pos[1], 2.3, 0.01), 'did not end up on the ledge: y=' + p.pos[1]);
});

console.log('\n-- FALLING --');
const dropTest = (h, landOn) => {
  const w = flat(); w.addSolid([-1, 0, -1], [1, h, 1]);
  if (landOn === 'water') { w.solids = w.solids.filter(s => s.tag !== 'ground'); w.addSolid([-20, -6, -20], [20, -5, 20]); w.addWater([-20, -5, -20], [20, -0.35, 20]); }
  const p = new Player(w);
  p.pos = [0, h, 0]; p.onGround = true;
  run(p, 3, { moveZ: 1 });
  return p;
};
T('a 3 m drop is harmless', () => { const p = dropTest(3); A(p.health === 100, 'health ' + p.health); });
T('a 6 m drop hurts', () => { const p = dropTest(6); A(p.health < 80 && p.health > 40, 'health ' + p.health); });
T('a 9 m drop hurts a lot', () => { const p = dropTest(9); A(p.health < 50 && p.health > 10, 'health ' + p.health); });
T('a 12 m drop leaves you on the edge of death', () => { const p = dropTest(12); A(p.health > 0 && p.health < 20, 'health ' + p.health); });
T('15 m kills', () => { const p = dropTest(15); A(p.mode === 'dead', 'survived with ' + p.health); });
T('12 m into deep water is harmless', () => { const p = dropTest(12, 'water'); A(p.health === 100 && p.mode === 'swim', 'health ' + p.health + ' mode ' + p.mode); });

console.log('\n-- WATER --');
const poolWorld = () => {
  const w = new World();
  w.addSolid([-30, -6, -30], [30, 0, -10]);           // deck north
  w.addSolid([-30, -6, 10], [30, 0, 30]);             // deck south
  w.addSolid([-30, -6, -10], [-10, 0, 10]); w.addSolid([10, -6, -10], [30, 0, 10]);
  w.addSolid([-10, -7, -10], [10, -5, 10]);           // pool floor
  w.addWater([-10, -5, -10], [10, -0.35, 10]);
  w.spawn = { pos: [0, 0, 14], yaw: 0 };
  return w;
};
T('walking into deep water swims', () => {
  const p = new Player(poolWorld());
  run(p, 3, { moveZ: 1 });
  A(p.mode === 'swim', 'mode ' + p.mode);
  A(!p.underwater, 'sank instead of floating');
});
T('diving goes under; breath runs out and then you drown', () => {
  const p = new Player(poolWorld());
  run(p, 3, { moveZ: 1 });
  run(p, 2, { crouch: true });
  A(p.underwater, 'did not dive');
  run(p, P.breathMax - 4, { crouch: true });
  A(p.breath > 0 && p.health === 100, 'breath ' + p.breath);
  run(p, 3, { crouch: true });
  A(p.breath === 0 && p.health < 100, 'no drowning: health ' + p.health);
  run(p, 20, { crouch: true });
  A(p.mode === 'dead', 'survived drowning');
});
T('surfacing refills your breath', () => {
  const p = new Player(poolWorld());
  run(p, 3, { moveZ: 1 });
  run(p, 10, { crouch: true });
  const low = p.breath;
  run(p, 6, { jump: true });
  run(p, 3, {});
  A(!p.underwater && p.breath >= Math.min(P.breathMax, low + 9), 'breath ' + low + ' -> ' + p.breath);
});
T('swimming follows your view downward', () => {
  const p = new Player(poolWorld());
  run(p, 3, { moveZ: 1 });
  const y0 = p.pos[1];
  run(p, 1.5, { moveZ: 1, pitch: -1.0 });
  A(p.pos[1] < y0 - 1.5, 'did not swim down: ' + y0 + ' -> ' + p.pos[1]);
});
T('you can climb out at the edge', () => {
  const p = new Player(poolWorld());
  run(p, 3, { moveZ: 1 });
  run(p, 8, { moveZ: 1 });
  A(p.prompt.indexOf('Climb out') >= 0, 'no prompt at the wall: ' + p.prompt + ' z=' + p.pos[2]);
  run(p, 2, (t) => ({ moveZ: 1, jump: t < 0.1 }));
  A(p.mode === 'walk' && near(p.pos[1], 0, 0.01), 'still in the water: ' + p.mode + ' y=' + p.pos[1]);
});

console.log('\n-- THE TRAINING FACILITY --');
const L = buildTraining();
T('spawn is clear and on the ground', () => {
  const p = new Player(L.world);
  A(p.free(p.pos), 'spawn inside something');
  run(p, 0.5, {});
  A(p.onGround && near(p.pos[1], 0, 0.01), 'spawn y ' + p.pos[1]);
});
T('the vault lane: vault the first three, climb the next two, the container needs the crate', () => {
  const p = new Player(L.world);
  at(p, [10, 0, 11], YAW.N);
  const kinds = [];
  run(p, 30, (t, pl) => {
    if (pl.traverse && kinds[kinds.length - 1] !== pl.traverse.kind + '@' + pl.traverse.pts[2][2].toFixed(0)) kinds.push(pl.traverse.kind + '@' + pl.traverse.pts[2][2].toFixed(0));
    return { moveZ: 1, jump: Math.floor(t * 4) % 2 === 0 };
  });
  const k = kinds.map(x => x.split('@')[0]);
  A(k.slice(0, 3).join() === 'vault,vault,vault', 'first three: ' + kinds.join(' '));
  A(k[3] === 'climb' && k[4] === 'climb', 'next two: ' + kinds.join(' '));
  A(p.pos[1] < 2.3, 'got onto the container without the crate: y=' + p.pos[1]);
  at(p, [8.4, 0, -18.8], YAW.N);
  let up = false;
  run(p, 6, (t, pl) => { if (pl.pos[1] > 2.5 && !pl.traverse) up = true; return { moveZ: up ? 0 : 1, jump: !up && Math.floor(t * 4) % 2 === 0 }; });
  A(near(p.pos[1], CONTAINER.h, 0.02), 'crate route failed: y=' + p.pos[1] + ' at ' + p.pos.map(v => v.toFixed(2)));
});
T('the crouch duct', () => {
  const p = new Player(L.world);
  at(p, [-12, 0, 16], YAW.N);
  run(p, 10, { moveZ: 1, crouch: true });
  A(p.pos[2] < -0.5, 'did not get through: z=' + p.pos[2]);
});
T('stairs to the catwalk, across it, and onto the far stack', () => {
  const p = new Player(L.world);
  at(p, [-30, 0, 8], YAW.N);
  run(p, 5, (t, pl) => ({ moveZ: pl.pos[1] < CONTAINER.h * 2 - 0.01 || pl.pos[2] > -2.5 ? 1 : 0 }));
  A(near(p.pos[1], CONTAINER.h * 2, 0.02), 'not at the top of the stairs: y=' + p.pos[1]);
  const cwz = L.world.solids.find(s => s.tag === 'grating' && s.min[0] < -28).min[2] + 0.8;
  at(p, [-27.5, CONTAINER.h * 2, cwz], YAW.E);
  run(p, 6, (t, pl) => ({ moveZ: pl.pos[0] < -10.8 ? 1 : 0 }));
  A(p.pos[0] > -12 && near(p.pos[1], CONTAINER.h * 2, 0.02), 'did not cross the catwalk: ' + p.pos.map(v => v.toFixed(2)));
  // then the crate and up onto the three-high stack
  const crate = L.world.solids.find(s => s.tag === 'crate' && near(s.min[1], CONTAINER.h * 2, 0.01));
  A(crate, 'no crate on the stack');
  at(p, [(crate.min[0] + crate.max[0]) / 2, CONTAINER.h * 2, crate.max[2] + 0.45], YAW.N);
  run(p, 1.5, (t, pl) => ({ moveZ: pl.pos[1] > CONTAINER.h * 2 + 0.5 && !pl.traverse ? 0 : 1, jump: t < 0.1 }));
  A(near(p.pos[1], CONTAINER.h * 2 + 1.1, 0.02), 'not on the crate: y=' + p.pos[1]);
  run(p, 3, (t, pl) => ({ yaw: YAW.E, moveZ: pl.pos[1] > CONTAINER.h * 2.9 && !pl.traverse ? 0 : 1, jump: t > 0.2 && t < 0.3 }));
  A(near(p.pos[1], CONTAINER.h * 3, 0.02), 'not on the three-high stack: y=' + p.pos[1] + ' at ' + p.pos.map(v => v.toFixed(2)));
});
T('the catwalk railing can be vaulted - and the drop hurts', () => {
  const p = new Player(L.world);
  const zRail = L.world.solids.find(s => s.tag === 'rail' && s.max[1] - s.min[1] > 0.9 && s.min[0] < -28 && s.max[0] > -13 && s.max[2] - s.min[2] < 0.1);
  A(zRail, 'no catwalk rail');
  const cwz = L.world.solids.find(s => s.tag === 'grating' && s.min[0] < -28).min[2] + 0.8;
  at(p, [-20, CONTAINER.h * 2, cwz], zRail.min[2] < cwz ? YAW.N : YAW.S);
  let vaulted = false;
  run(p, 4, (t, pl) => { if (pl.traverse) vaulted = true; return { moveZ: vaulted && !pl.traverse ? 0 : 1, jump: !vaulted && Math.floor(t * 4) % 2 === 0 }; });
  A(vaulted && p.pos[1] < 0.1 && p.health < 100, 'vaulted=' + vaulted + ' y=' + p.pos[1] + ' hp=' + p.health);
});
T('the tower ladder takes you to the 12 m platform', () => {
  const p = new Player(L.world);
  at(p, [27.4, 0, -36], YAW.E);
  run(p, 8, { moveZ: 1 });
  A(near(p.pos[1], 12.3, 0.05) && p.pos[0] > 28, 'not on the platform: ' + p.pos.map(v => v.toFixed(2)) + ' mode ' + p.mode);
});
T('diving off the 12 m board into the pool does no harm', () => {
  const p = new Player(L.world);
  at(p, [28.9, 12.3, -33.5], YAW.S);
  run(p, 5, { moveZ: 1 });
  A(p.mode === 'swim' && p.health === 100, 'mode ' + p.mode + ' hp ' + p.health + ' at ' + p.pos.map(v => v.toFixed(2)));
});
T('the drop platforms can all be climbed to the top', () => {
  for (const [i, h] of [[0, 3], [1, 6], [2, 9], [3, 12]]) {
    const p = new Player(L.world);
    const x = -30 - 9 + i * 6;
    at(p, [x, 0, -30 - 2.5 - Math.ceil((h - 0.3) / 1.1) - 1.2], YAW.S);
    let up = false;
    run(p, 25, (t, pl) => { if (pl.pos[1] > h - 0.05 && !pl.traverse) up = true; return { moveZ: up ? 0 : 1, jump: !up && Math.floor(t * 4) % 2 === 0 }; });
    A(near(p.pos[1], h, 0.02), h + ' m platform not reached: y=' + p.pos[1].toFixed(2) + ' z=' + p.pos[2].toFixed(2));
  }
});
T('a running jump at a high ledge grabs it and hauls you up', () => {
  const w = flat();
  // a gap, then a wall whose top is above head height
  w.addSolid([-6, 0, -9], [6, 2.4, -4], 'block');
  const p = new Player(w);
  at(p, [0, 0, -1.2], YAW.N);
  let prev = false;
  run(p, 1.4, (t) => {
    const inp = { moveZ: 1, yaw: YAW.N, sprint: true, jump: t > 0.35 && t < 0.45 };
    inp.jumpPressed = inp.jump && !prev; prev = inp.jump;
    return inp;
  });
  A(p.pos[1] > 2.2, 'should have got up onto the ledge: y=' + p.pos[1].toFixed(2));
});
T('but a ledge well above your reach is still out of reach', () => {
  const w = flat();
  w.addSolid([-6, 0, -9], [6, 4.2, -4], 'block');
  const p = new Player(w);
  at(p, [0, 0, -1.2], YAW.N);
  let prev = false;
  run(p, 2.5, (t) => {
    const inp = { moveZ: 1, yaw: YAW.N, sprint: true, jump: t > 0.35 && t < 0.45 };
    inp.jumpPressed = inp.jump && !prev; prev = inp.jump;
    return inp;
  });
  A(p.pos[1] < 1, 'a 4.2 m wall should not be climbable: y=' + p.pos[1].toFixed(2));
});

console.log('\n-- PARKOUR --');
// run north at something whose near face is at z = 0, pressing SPACE when the
// game offers it; returns the player and the events it produced
function parkour(solids, opts) {
  opts = opts || {};
  const w = flat();
  for (const [a, b] of solids) w.addSolid(a, b, opts.tag || 'wall');
  const p = new Player(w);
  at(p, [0, 0, opts.from || 7], YAW.N);
  const seen = [];
  let pressed = false;
  run(p, opts.secs || 3, (t, pl) => {
    for (const e of pl.events) seen.push(e.type);
    pl.events.length = 0;
    const offer = /SPACE/.test(pl.prompt || '');
    const jump = !pressed && offer && (!opts.only || new RegExp(opts.only).test(pl.prompt));
    if (jump) pressed = true;
    // keep pressing on until you are standing somewhere: letting go mid-air
    // would stop you grabbing, and the test would pass for the wrong reason
    const done = pl.onGround && !pl.traverse && (pl.pos[2] < -1.5 || pl.pos[1] > 1.4);
    return { moveZ: done ? 0 : 1, sprint: !opts.walk, yaw: YAW.N, jump };
  });
  return { p, seen };
}
T('walking up to a 1.8 m garden wall and pressing SPACE puts you on top of it', () => {
  const { p } = parkour([[[-3, 0, -0.3], [3, 1.8, 0]]], { walk: true, from: 1.2 });
  A(near(p.pos[1], 1.8, 0.02), 'should stand on it: y=' + p.pos[1].toFixed(2));
});
T('running at the same wall takes you over it and down the far side', () => {
  const { p, seen } = parkour([[[-3, 0, -0.3], [3, 1.8, 0]]]);
  A(seen.includes('over'), 'no over: ' + seen.join(','));
  A(near(p.pos[1], 0, 0.02) && p.pos[2] < -0.5, 'should be on the ground beyond: ' + p.pos.map((v) => v.toFixed(2)));
});
T('a 2.5 m wall is out of reach standing, but a run-up gets you over it', () => {
  const stand = parkour([[[-3, 0, -0.3], [3, 2.5, 0]]], { walk: true, from: 1.2 });
  A(stand.p.pos[1] < 1 && stand.p.pos[2] > 0, 'walking should not get you over: ' + stand.p.pos.map((v) => v.toFixed(2)));
  const { p, seen } = parkour([[[-3, 0, -0.3], [3, 2.5, 0]]]);
  A(seen.includes('wallkick'), 'no run-up: ' + seen.join(','));
  A(p.pos[2] < -0.5 && near(p.pos[1], 0, 0.02), 'should land beyond: ' + p.pos.map((v) => v.toFixed(2)));
});
T('a run-up gets you onto a 3.0 m block and a 3.3 m block', () => {
  for (const h of [3.0, 3.3]) {
    const { p, seen } = parkour([[[-3, 0, -3], [3, h, 0]]]);
    A(seen.includes('wallkick') && near(p.pos[1], h, 0.02), h + ' m: y=' + p.pos[1].toFixed(2) + ' ' + seen.join(','));
  }
});
// (M6.36; Rhys) surfaces hold you differently
T('grip: brick holds, wet brick less, steel less again, glass hardly at all', () => {
  A(gripOf('brick') === 1 && gripOf('brick', true) < 1 && gripOf('metal') < gripOf('brick', true) && gripOf('glass') < gripOf('metal'), 'order');
  A(gripOf('glass') < GRIP_NEED.runUp && gripOf('metal') >= GRIP_NEED.runUp && gripOf('glass') < GRIP_NEED.airCatch, 'thresholds');
});
T('a glass wall cannot be run up; a steel one can, a brick one as before', () => {
  const g = parkour([[[-3, 0, -3], [3, 3.0, 0]]], { tag: 'glassT' });
  A(!g.seen.includes('wallkick') && g.p.pos[1] < 0.5, 'glass: ' + g.seen.join(','));
  const m = parkour([[[-3, 0, -3], [3, 3.0, 0]]], { tag: 'metal' });
  A(m.seen.includes('wallkick') && near(m.p.pos[1], 3.0, 0.02), 'steel: ' + m.seen.join(',') + ' y=' + m.p.pos[1].toFixed(2));
});
T('you slide further stopping on steel than on concrete, and further still on wet steel', () => {
  const stop = (tag, wet) => {
    const w = new World(); w.addSolid([-100, -1, -100], [100, 0, 100], tag); w.spawn = { pos: [0, 0, 0], yaw: 0 };
    const p = new Player(w); at(p, [0, 0, 0], YAW.N); p.wet = !!wet;
    run(p, 1.5, { moveZ: 1, sprint: true, yaw: YAW.N });
    const z0 = p.pos[2]; run(p, 2, { yaw: YAW.N });
    return z0 - p.pos[2];
  };
  const c = stop('concrete'), m = stop('metal'), mw = stop('metal', true);
  A(m > c * 1.3 && mw > m, 'slides: concrete ' + c.toFixed(2) + ', steel ' + m.toFixed(2) + ', wet steel ' + mw.toFixed(2));
});
T('a 4.0 m wall is beyond even a run-up', () => {
  const { p, seen } = parkour([[[-3, 0, -3], [3, 4.0, 0]]]);
  A(seen.includes('wallkick'), 'should still try: ' + seen.join(','));
  A(p.pos[1] < 0.5, 'should not get up: y=' + p.pos[1].toFixed(2));
});
T('no run-up without a run: walking at a tall wall and pressing SPACE is only a jump', () => {
  const w = flat(); w.addSolid([-3, 0, -3], [3, 3.0, 0], 'wall');
  const p = new Player(w);
  at(p, [0, 0, 0.5], YAW.N);
  const seen = [];
  run(p, 1.5, (t, pl) => { for (const e of pl.events) seen.push(e.type); pl.events.length = 0; return { moveZ: 1, jump: t > 0.3 && t < 0.4 }; });
  A(!seen.includes('wallkick') && p.pos[1] < 0.5, 'kicked or climbed: ' + seen.join(',') + ' y=' + p.pos[1].toFixed(2));
});
T('you only go over a wall if the far side is safe to drop to; otherwise you stop on top', () => {
  // a parapet on the edge of a 5 m drop: ground here is a 5 m platform
  const w = new World();
  w.addSolid([-10, 4, 0], [10, 5, 10], 'roof');           // where you run, 5 m up
  w.addSolid([-10, -1, -10], [10, 0, 10], 'ground');      // the ground far below
  w.addSolid([-3, 5, -0.3], [3, 6.8, 0], 'parapet');
  const p = new Player(w);
  at(p, [0, 5, 7], YAW.N);
  let pressed = false; const seen = [];
  run(p, 3, (t, pl) => {
    for (const e of pl.events) seen.push(e.type); pl.events.length = 0;
    const jump = !pressed && /SPACE/.test(pl.prompt || ''); if (jump) pressed = true;
    return { moveZ: pl.pos[1] > 6.4 && !pl.traverse ? 0 : 1, sprint: true, yaw: YAW.N, jump };
  });
  A(!seen.includes('over') && near(p.pos[1], 6.8, 0.02), 'should stop on the parapet: y=' + p.pos[1].toFixed(2) + ' ' + seen.join(','));
});
T('Yard 7 parkour lane: run it, pressing SPACE when offered, and you end up on the 3.3 m block', () => {
  const p = new Player(L.world);
  at(p, [16.5, 0, 11], YAW.N);
  const seen = []; let prev = false; let top = 0; let rest = 0;
  run(p, 14, (t, pl) => {
    for (const e of pl.events) seen.push(e.type); pl.events.length = 0;
    const jump = /SPACE/.test(pl.prompt || '') && !prev; prev = /SPACE/.test(pl.prompt || '');
    if (pl.onGround) top = Math.max(top, pl.pos[1]);
    const done = pl.onGround && pl.pos[1] > 3.2;
    // get your breath back on top of the 3 m block, as anyone would
    if (pl.onGround && pl.pos[1] > 2.9 && pl.pos[1] < 3.1) rest += DT; 
    if (rest > 0 && rest < 2.5) { if (!(pl.onGround && pl.pos[1] > 2.9)) rest = 2.5; else return { yaw: YAW.N }; }
    return { moveZ: done ? 0 : 1, sprint: true, yaw: YAW.N, jump };
  });
  const n = (k) => seen.filter((x) => x === k).length;
  A(n('over') === 2, 'two walls gone over: ' + seen.join(','));
  A(n('wallkick') >= 2, 'run-ups: ' + seen.join(','));
  A(near(p.pos[1], 3.3, 0.02), 'on the 3.3 m block: ' + p.pos.map((v) => v.toFixed(2)) + ' ' + seen.join(','));
  A(p.health > 99, 'the lane should not hurt: ' + p.health.toFixed(1));
});
T('the vehicle dock: walk in under the shed, and the trucks are solid', () => {
  const p = new Player(L.world);
  at(p, [40, 0, 40], YAW.N);
  run(p, 5, { moveZ: 1 });
  A(p.pos[2] < 30, 'could not walk into the dock: z=' + p.pos[2].toFixed(1));
  // walking straight at a truck stops you at it
  at(p, [31.95, 0, 32], YAW.N);
  run(p, 4, { moveZ: 1 });
  A(p.pos[2] > 17 && p.pos[2] < 20, 'should stop at the back of the truck: z=' + p.pos[2].toFixed(1));
});
T('the ladder prompt only appears when pressing W would get you on', () => {
  const lad = L.world.ladders.find((l) => l.max[1] > 12);
  const cz = (lad.min[2] + lad.max[2]) / 2;
  const p = new Player(L.world);
  at(p, [lad.min[0] - 0.3, 0, cz], YAW.E);        // facing the wall
  run(p, 0.2, {});
  A(p.prompt.indexOf('Climb ladder') >= 0, 'no prompt when facing it: "' + p.prompt + '"');
  at(p, [lad.min[0] - 0.3, 0, cz], YAW.W);        // facing away
  run(p, 0.2, {});
  A(p.prompt.indexOf('Climb ladder') < 0, 'prompted while facing away: "' + p.prompt + '"');
  at(p, [lad.min[0] - 0.3, 0, cz], YAW.N);        // sideways
  run(p, 0.2, {});
  A(p.prompt.indexOf('Climb ladder') < 0, 'prompted while sideways: "' + p.prompt + '"');
});
T('off a ladder at its foot: with it behind you, W walks you away - it does not climb (M6.9.26, Rhys)', () => {
  const lad = L.world.ladders.find((l) => l.max[1] > 12);
  const cz = (lad.min[2] + lad.max[2]) / 2;
  const p = new Player(L.world);
  at(p, [lad.min[0] - 0.3, 0, cz], YAW.E);        // facing the wall: W climbs
  run(p, 0.5, { moveZ: 1 });
  A(p.mode === 'ladder', 'W facing the ladder did not climb: ' + p.mode);
  run(p, 1.0, { moveZ: -1 });                       // back down to the foot
  A(p.mode === 'walk' && p.onGround, 'did not step off at the foot: ' + p.mode);
  p.yaw = YAW.W;                                    // turn round, the ladder behind
  const x0 = p.pos[0];
  run(p, 0.6, { moveZ: 1, yaw: YAW.W });
  A(p.mode === 'walk' && p.pos[1] < 0.05 && p.pos[0] < x0 - 1.2, 'W climbed the ladder behind you: ' + p.mode + ' ' + p.pos.map((v) => v.toFixed(2)));
  // turned back to it, W climbs again
  at(p, [(lad.min[0] + lad.max[0]) / 2 - 0.2, 0, cz], YAW.W);
  run(p, 0.3, { moveZ: 1, yaw: YAW.W });
  A(p.mode === 'walk', 'climbed with it behind');
  run(p, 0.1, { yaw: YAW.E }); p.pos[0] = lad.min[0] - 0.1; run(p, 0.5, { moveZ: 1, yaw: YAW.E });
  A(p.mode === 'ladder', 'facing it again, W did not climb: ' + p.mode);
});
T('walking into a ladder from the side or from behind still puts you on it', () => {
  const lad = L.world.ladders.find((l) => l.max[1] > 12);
  const cx = (lad.min[0] + lad.max[0]) / 2, cz = (lad.min[2] + lad.max[2]) / 2;
  const p = new Player(L.world);
  at(p, [cx, 0, lad.min[2] - 0.6], YAW.S);         // alongside it, walking into it sideways-on
  let on = false; for (let i = 0; i < 60 && !on; i++) { run(p, 1 / 60, { moveZ: 1 }); on = p.mode === 'ladder'; }
  A(on, 'walking into it from the side did not put you on it: ' + p.pos.map((v) => v.toFixed(2)) + ' ' + p.mode);
  void cz;
});
T('the dash works whichever order Shift and the step key go down', () => {
  const dist = (order) => {
    const p = new Player(flat());
    const x0 = p.pos[0];
    if (order === 'shift-first') {
      run(p, 0.2, { sprint: true });                                  // Shift held first
      run(p, 0.35, (t) => ({ sprint: true, moveX: 1, strafePressed: t < 0.02 ? 'right' : null }));
    } else {
      run(p, 0.2, { moveX: 1 });                                      // D held first
      run(p, 0.35, (t) => ({ moveX: 1, sprint: t < 0.2, sprintPressed: t < 0.02 }));
    }
    return Math.abs(p.pos[0] - x0);
  };
  const a1 = dist('shift-first'), a2 = dist('key-first');
  A(a1 > 1.4, 'Shift then D did not dash: ' + a1.toFixed(2));
  A(a2 > 1.4, 'D then Shift did not dash: ' + a2.toFixed(2));
});
T('nothing climbable leads over the perimeter wall', () => {
  const p = new Player(L.world);
  at(p, [0, 30, 58], YAW.S);
  run(p, 4, { moveZ: 1 });
  A(p.pos[2] < 59.7, 'left the yard: z=' + p.pos[2]);
});

console.log('\n-- PLAYTEST 1 CHANGES --');
T('sprinting at a low wall vaults it without pressing anything', () => {
  const w = flat(); w.addSolid([-3, 0, -6.5], [3, 0.9, -6]);
  const p = new Player(w);
  let vaulted = false;
  run(p, 2.2, (t, pl) => { if (pl.traverse && pl.traverse.kind === 'vault') vaulted = true; return { moveZ: 1, sprint: true }; });
  A(vaulted && p.pos[2] < -6.5, 'no auto-vault: z=' + p.pos[2]);
  A(Math.hypot(p.vel[0], p.vel[2]) > P.sprint - 0.2, 'the vault killed the sprint: ' + Math.hypot(p.vel[0], p.vel[2]));
});
T('walking at a low wall does not vault it by itself', () => {
  const w = flat(); w.addSolid([-3, 0, -4.5], [3, 0.9, -4]);
  const p = new Player(w);
  run(p, 2.5, { moveZ: 1 });
  A(p.pos[2] > -4, 'walked over without asking: z=' + p.pos[2]);
});
T('sprinting does not auto-climb anything above waist height', () => {
  const w = flat(); w.addSolid([-3, 0, -5], [3, 2.0, -4]);
  const p = new Player(w);
  run(p, 2.5, { moveZ: 1, sprint: true });
  A(p.pos[1] < 0.1, 'auto-climbed a 2 m wall');
});
T('you can sprint straight up a staircase of crates', () => {
  // the 12 m drop-test steps: 1.1 m each
  const p = new Player(L.world);
  at(p, [-21, 0, -30 - 2.5 - 11 - 0.8], YAW.S);
  run(p, 10, (t, pl) => ({ moveZ: pl.pos[1] > 11.9 ? 0 : 1, sprint: true }));
  A(near(p.pos[1], 12, 0.02), 'did not run up: y=' + p.pos[1].toFixed(2));
});
T('ladders: W goes up, S goes down, and there is no sideways', () => {
  const p = new Player(L.world);
  at(p, [27.4, 0, -36], YAW.E);
  run(p, 0.5, { moveZ: 1 });
  A(p.mode === 'ladder', 'not on the ladder: ' + p.mode);
  const y0 = p.pos[1];
  run(p, 0.6, { moveZ: 1, pitch: -1.2 });
  A(p.pos[1] > y0 + 1.5, 'looking down while pressing W should still climb: ' + y0 + ' -> ' + p.pos[1]);
  const x0 = p.pos[0], z0 = p.pos[2], y1 = p.pos[1];
  run(p, 0.5, { moveX: 1 });
  A(p.pos[0] === x0 && p.pos[2] === z0 && p.pos[1] === y1, 'moved sideways on a ladder');
  run(p, 0.4, { moveZ: -1 });
  A(p.pos[1] < y1 - 1, 'S did not climb down');
});
T('the tower: Space at the 6 m platform steps you onto it', () => {
  const p = new Player(L.world);
  at(p, [27.4, 0, -36], YAW.E);
  run(p, 8, (t, pl) => ({ moveZ: pl.pos[1] < 5.2 ? 1 : 0 }));
  A(p.mode === 'ladder' && p.prompt.indexOf('Step off') >= 0, 'no step-off offered at 6 m: ' + p.mode + ' "' + p.prompt + '" y=' + p.pos[1].toFixed(2));
  run(p, 1.2, (t) => ({ jump: t < 0.05 }));
  A(near(p.pos[1], 6.3, 0.02) && p.mode === 'walk', 'not on the 6 m platform: y=' + p.pos[1].toFixed(2) + ' ' + p.mode);
});
T('with nothing beside you, Space does nothing; C lets go', () => {
  const p = new Player(L.world);
  at(p, [27.4, 0, -36], YAW.E);
  run(p, 1.2, { moveZ: 1 });
  const y = p.pos[1];
  run(p, 0.3, (t) => ({ jump: t < 0.05 }));
  A(p.mode === 'ladder' && near(p.pos[1], y, 0.001), 'Space did something with nowhere to go');
  run(p, 0.1, { crouch: true });
  A(p.mode === 'walk', 'C did not let go');
});
T('getting off at the top is one smooth movement', () => {
  const p = new Player(L.world);
  at(p, [27.4, 0, -36], YAW.E);
  const ys = [];
  run(p, 7, (t, pl) => { ys.push(pl.pos[1]); return { moveZ: 1 }; });
  A(near(p.pos[1], 12.3, 0.02) && p.pos[0] > 28, 'did not arrive on top: ' + p.pos.map(v => v.toFixed(2)));
  let worst = 0;
  for (let i = 1; i < ys.length; i++) worst = Math.max(worst, Math.abs(ys[i] - ys[i - 1]));
  A(worst < 0.15, 'a jolt of ' + worst.toFixed(3) + ' m in one frame');
});
T('from the top platform you can back onto the ladder and climb down', () => {
  const p = new Player(L.world);
  at(p, [28.6, 12.3, -36], YAW.E);   // facing east, toward the ladder's wall, backing off the edge
  run(p, 1.0, { moveZ: -1 });
  A(p.mode === 'ladder', 'did not get onto the ladder backing off: ' + p.mode + ' at ' + p.pos.map(v => v.toFixed(2)));
  run(p, 6, { moveZ: -1 });
  A(p.pos[1] < 0.05 && p.mode === 'walk' && p.health === 100, 'did not reach the ground safely: ' + p.pos[1] + ' hp ' + p.health);
});
T('health comes back after a short breather, and not too slowly', () => {
  const p = new Player(flat());
  p.damage(50, 'test');
  run(p, 4.5, {});
  A(p.health === 50, 'recovered too soon: ' + p.health);
  run(p, 3.5, {});
  A(p.health > 60 && p.health < 70, 'recovery rate off: ' + p.health.toFixed(1));
  p.health = 100; p.damage(90, 'test');
  run(p, 30, {});
  A(p.health === 100, 'not fully healed after 30 s: ' + p.health);
});
T('ladders: you are centred on the ladder when you climb', () => {
  const p = new Player(L.world);
  at(p, [27.4, 0, -35.65], YAW.E);
  run(p, 0.3, { moveZ: 1 });
  const lad = L.world.ladders.find((l) => l.max[1] > 12);
  const cx = (lad.min[0] + lad.max[0]) / 2, cz = (lad.min[2] + lad.max[2]) / 2;
  A(p.mode === 'ladder' && near(p.pos[0], cx, 0.01) && near(p.pos[2], cz, 0.01), 'not centred: ' + p.pos.map(v => v.toFixed(2)));
});
for (const [setting, max, h, expect] of [['off', 0, 0.9, false], ['waist', 1.3, 0.9, true], ['waist', 1.3, 1.8, false], ['high', 2.0, 1.8, true]]) {
  T(`sprint-vaulting "${setting}": a ${h} m obstacle is ${expect ? '' : 'not '}taken automatically`, () => {
    const w = flat(); w.addSolid([-3, 0, -7], [3, h, -6]);
    const p = new Player(w);
    let went = false;
    run(p, 2.5, (t, pl) => { if (pl.traverse) went = true; return { moveZ: 1, sprint: true, autoVaultMax: max }; });
    A(went === expect, 'traversed=' + went);
  });
}
T('crouching mid-jump cuts the jump short', () => {
  const p = new Player(flat());
  let full = 0, cut = 0;
  run(p, 1.2, (t, pl) => { full = Math.max(full, pl.pos[1]); return { jump: t < 0.05 }; });
  run(p, 1.2, (t, pl) => { cut = Math.max(cut, pl.pos[1]); return { jump: t < 0.05, crouch: t > 0.1 }; });
  A(cut < full * 0.7, 'full ' + full.toFixed(2) + ' vs cut ' + cut.toFixed(2));
  A(p.onGround, 'did not come down');
});
T('crouch-sprint: faster than crouching, slower than sprinting, quieter than walking', () => {
  const speed = (inp) => { const p = new Player(flat()); run(p, 1.5, Object.assign({ moveZ: 1 }, inp)); return [Math.hypot(p.vel[0], p.vel[2]), p.noise]; };
  const [cs, cn] = speed({ crouch: true, sprint: true });
  const [c, n1] = speed({ crouch: true });
  const [sp, n2] = speed({ sprint: true });
  const [wk, n3] = speed({});
  A(cs > c + 0.5 && cs < sp - 1, `speeds crouch ${c} crouch-sprint ${cs} sprint ${sp}`);
  A(n1 < cn && cn < n3 && n3 < n2, `noise crouch ${n1} crouch-sprint ${cn} walk ${n3} sprint ${n2}`);
});
T('crouch-sprinting does not auto-vault', () => {
  const w = flat(); w.addSolid([-3, 0, -5.5], [3, 0.6, -5]);
  const p = new Player(w);
  run(p, 3, { moveZ: 1, sprint: true, crouch: true });
  A(p.pos[2] > -5, 'crouch-sprint vaulted: z=' + p.pos[2]);
});

console.log('\n-- PLAYTEST 3 CHANGES --');
T('the container-stack ladder works (it was flush against the container)', () => {
  const lad = L.world.ladders.find((l) => l.min[0] < 0);
  const p = new Player(L.world);
  at(p, [lad.max[0] + 0.3, 0, (lad.min[2] + lad.max[2]) / 2], YAW.W);
  run(p, 0.4, { moveZ: 1 });
  A(p.mode === 'ladder', 'could not get on: ' + p.mode + ' prompt "' + p.prompt + '"');
  run(p, 3, { moveZ: 1 });
  A(p.pos[1] > 6, 'did not climb: y=' + p.pos[1].toFixed(2));
});
T('the climbing column is clear of anything solid', () => {
  for (const lad of L.world.ladders) {
    const cx = (lad.min[0] + lad.max[0]) / 2, cz = (lad.min[2] + lad.max[2]) / 2;
    const r = P.radius;
    // nothing solid may stand in the space you climb through
    for (let y = lad.min[1] + 0.6; y < lad.max[1] - 0.4; y += 1.2) {
      const hit = L.world.hit([cx - r, y, cz - r], [cx + r, y + 0.5, cz + r]);
      A(!hit, `something solid (${hit && hit.tag}) is in the climbing space at ${cx.toFixed(1)}, ${y.toFixed(1)}, ${cz.toFixed(1)}`);
    }
    continue;
    const rung = L.pieces.find((q) => q.mat === 'ladder' && q.min[0] < cx + 1.2 && q.max[0] > cx - 1.2 && q.min[2] < cz + 1 && q.max[2] > cz - 1);
    A(rung, 'no ladder rungs found near a ladder volume');
    const clear = cx - r > rung.max[0] || cx + r < rung.min[0] || cz - r > rung.max[2] || cz + r < rung.min[2];
    A(clear, 'the body overlaps the ladder it is climbing');
  }
});
T('stances cycle: stand, crouch, prone, stand', () => {
  const p = new Player(flat());
  const tap = () => { run(p, 0.1, { crouch: true, crouchCycle: true }); run(p, 0.1, { crouch: false, crouchCycle: true }); };
  A(p.stance === 0, 'starts standing');
  tap(); A(p.stance === 1 && near(p.h, P.crouchHeight, 1e-6), 'not crouched: ' + p.stance);
  tap(); A(p.stance === 2 && near(p.h, P.proneHeight, 1e-6), 'not prone: ' + p.stance);
  tap(); A(p.stance === 0, 'did not stand up: ' + p.stance);
});
T('prone is slow and silent; the shuffle is quicker but still slow', () => {
  const p = new Player(flat());
  const goProne = (q) => { run(q, 0.1, { crouch: true, crouchCycle: true }); run(q, 0.1, { crouchCycle: true });
    run(q, 0.1, { crouch: true, crouchCycle: true }); run(q, 0.1, { crouchCycle: true }); };
  goProne(p);
  A(p.stance === 2, 'not prone');
  run(p, 1.5, { moveZ: 1, crouchCycle: true });
  const crawl = Math.hypot(p.vel[0], p.vel[2]);
  A(crawl < P.crouchSpeed, 'crawling should be slow: ' + crawl.toFixed(2));
  A(p.noise < P.noise.crouch, 'prone noise ' + p.noise);
  // the shuffle: quicker than crawling, slower than a crouched walk
  run(p, 1.5, { moveZ: 1, sprint: true, crouchCycle: true });
  const shuffle = Math.hypot(p.vel[0], p.vel[2]);
  A(shuffle > crawl + 0.3, `the shuffle should beat crawling: ${crawl.toFixed(2)} -> ${shuffle.toFixed(2)}`);
  A(shuffle < P.crouchSpeed, 'but still be slow: ' + shuffle.toFixed(2));
  A(p.stance === 2, 'and you stay prone');
});
T('SPACE from a crouch or prone stands you up, it does not jump', () => {
  const p = new Player(flat());
  run(p, 0.1, { crouch: true, crouchCycle: true }); run(p, 0.1, { crouchCycle: true });
  A(p.stance === 1, 'not crouched');
  let top = p.pos[1];
  run(p, 0.6, (t, q) => { top = Math.max(top, q.pos[1]); return { jump: t < 0.05, crouchCycle: true }; });
  A(p.stance === 0, 'crouch + SPACE should stand you up: stance ' + p.stance);
  A(top < 0.3, 'and should not hop: rose ' + top.toFixed(2));
  // from prone it stands you up as well
  const q = new Player(flat());
  run(q, 0.1, { crouch: true, crouchCycle: true }); run(q, 0.1, { crouchCycle: true });
  run(q, 0.1, { crouch: true, crouchCycle: true }); run(q, 0.1, { crouchCycle: true });
  A(q.stance === 2, 'not prone');
  run(q, 0.6, (t) => ({ jump: t < 0.05, crouchCycle: true }));
  A(q.stance === 0, 'prone + SPACE should stand you up: stance ' + q.stance);
});
T('a prone soldier fits through the crawl pipe; a crouched one does not', () => {
  const p = new Player(L.world);
  at(p, [-20, 0, 14], YAW.N);
  run(p, 0.1, { crouch: true, crouchCycle: true }); run(p, 0.1, { crouchCycle: true });
  run(p, 4, { moveZ: 1, crouchCycle: true });
  A(p.pos[2] > 12.5, 'crouching got into the pipe: z=' + p.pos[2].toFixed(2));
  run(p, 0.1, { crouch: true, crouchCycle: true }); run(p, 0.1, { crouchCycle: true });
  A(p.stance === 2, 'not prone: ' + p.stance);
  run(p, 12, { moveZ: 1, crouchCycle: true });
  A(p.pos[2] < 6, 'prone did not crawl through: z=' + p.pos[2].toFixed(2));
});
T('jumping while prone stands you up instead of jumping', () => {
  const p = new Player(flat());
  run(p, 0.1, { crouch: true, crouchCycle: true }); run(p, 0.1, { crouchCycle: true });
  run(p, 0.1, { crouch: true, crouchCycle: true }); run(p, 0.1, { crouchCycle: true });
  A(p.stance === 2, 'not prone');
  run(p, 0.2, (t) => ({ jump: t < 0.05, crouchCycle: true }));
  A(p.stance === 0 && near(p.pos[1], 0, 0.01), 'stance ' + p.stance + ' y ' + p.pos[1]);
});
T('a sideways dash: quick, costs stamina, and has a cooldown', () => {
  const p = new Player(flat());
  const x0 = p.pos[0];
  run(p, 0.35, (t) => ({ moveX: 1, sprint: t < 0.1, sprintPressed: t < 0.02 }));
  const moved = Math.abs(p.pos[0] - x0);
  A(moved > 1.4, 'the dash barely moved: ' + moved.toFixed(2));
  A(p.stamina <= P.staminaMax - P.dashCost, 'no stamina spent: ' + p.stamina);
  A(p.dashCd > 0, 'no cooldown');
  const x1 = p.pos[0];
  run(p, 0.3, (t) => ({ moveX: 1, sprint: t < 0.1, sprintPressed: t < 0.02 }));
  A(Math.abs(p.pos[0] - x1) < moved * 0.8, 'dashed again during the cooldown');
});
T('a dash needs stamina and does not work prone', () => {
  const p = new Player(flat());
  p.stamina = -5;                       // in the red: nothing doing
  const x0 = p.pos[0];
  run(p, 0.3, (t) => ({ moveX: 1, sprint: t < 0.1, sprintPressed: t < 0.02 }));
  A(Math.abs(p.pos[0] - x0) < 1.2, 'dashed while winded');
  const q = new Player(flat());
  run(q, 0.1, { crouch: true, crouchCycle: true }); run(q, 0.1, { crouchCycle: true });
  run(q, 0.1, { crouch: true, crouchCycle: true }); run(q, 0.1, { crouchCycle: true });
  const qx = q.pos[0];
  run(q, 0.3, (t) => ({ moveX: 1, sprint: t < 0.1, sprintPressed: t < 0.02, crouchCycle: true }));
  A(Math.abs(q.pos[0] - qx) < 0.6, 'dashed while prone');
});
T('you climb a ladder standing, whatever you were doing before', () => {
  const lad = L.world.ladders.find((l) => l.max[1] > 12);
  const p = new Player(L.world);
  at(p, [lad.min[0] - 0.4, 0, (lad.min[2] + lad.max[2]) / 2], YAW.E);
  run(p, 0.1, { crouch: true, crouchCycle: true }); run(p, 0.1, { crouchCycle: true });
  run(p, 0.1, { crouch: true, crouchCycle: true }); run(p, 0.1, { crouchCycle: true });
  A(p.stance === 2, 'not prone before the ladder');
  run(p, 0.5, { moveZ: 1, crouchCycle: true });
  A(p.mode === 'ladder' && p.stance === 0, 'mode ' + p.mode + ' stance ' + p.stance);
});

console.log('\n-- PEEKING OVER COVER --');
// press C and keep holding it: one press, so the stance stays crouched
const crouchHold = (p) => run(p, 0.15, { crouch: true, crouchCycle: true });
T('crouched behind a low wall, your shot is blocked; aiming lifts you over it', () => {
  const w = flat();
  w.addSolid([-4, 0, -2.5], [4, 1.15, -2], 'crate');       // chest-high when crouched
  const p = new Player(w);
  crouchHold(p);
  A(p.stance === 1, 'not crouched');
  const ahead = () => {
    const e = p.eyePos, d = forwardOf(p.yaw);
    const r = w.raycast(e, [d[0], 0, d[2]], 30);
    return r ? r.t : Infinity;
  };
  const blocked = ahead();
  A(blocked < 3, 'the wall should block a crouched shot: ' + blocked);
  run(p, 1, { crouch: true, crouchCycle: true, aim: true });
  A(p.peek > 0.9 && p.stance === 1, 'did not peek: peek=' + p.peek.toFixed(2) + ' stance ' + p.stance);
  A(ahead() === Infinity, 'still blocked while peeking: ' + ahead());
  A(p.eyeHeight > P.crouchEye + 0.4, 'eyes barely moved: ' + p.eyeHeight.toFixed(2));
  // let go of aim and you drop back down
  run(p, 1, { crouch: true, crouchCycle: true });
  A(p.peek === 0 && ahead() < 3, 'did not settle back down: peek=' + p.peek);
});
T('you stay a small target while peeking (the body does not grow)', () => {
  const w = flat();
  w.addSolid([-4, 1.3, -3], [4, 2.6, -2], 'overhang');
  const p = new Player(w);
  crouchHold(p);
  run(p, 1, { crouch: true, crouchCycle: true, aim: true });
  A(near(p.h, P.crouchHeight, 1e-6), 'body height changed: ' + p.h);
});
T('no peeking where there is no headroom', () => {
  const w = flat();
  w.addSolid([-1.2, 1.3, -1.2], [1.2, 2.6, 1.2], 'roof');   // directly overhead
  const p = new Player(w);
  crouchHold(p);
  run(p, 1, { crouch: true, crouchCycle: true, aim: true });
  A(p.peek === 0, 'peeked through the roof above: ' + p.peek.toFixed(2));
  A(near(p.eyeHeight, P.crouchEye, 1e-6), 'eyes went through the roof');
});
T('standing up or going prone cancels the peek', () => {
  const p = new Player(flat());
  crouchHold(p);
  run(p, 1, { crouch: true, crouchCycle: true, aim: true });
  A(p.peek > 0.9, 'not peeking');
  run(p, 0.1, { crouchCycle: true, aim: true });                 // let go of C
  run(p, 0.2, { crouch: true, crouchCycle: true, aim: true });   // press again: prone
  A(p.stance === 2 && p.peek === 0, 'peek survived a stance change: ' + p.stance + ' ' + p.peek);
});

console.log('\n-- LEANING ROUND CORNERS --');
// a wall straight ahead that ends just to your right
const cornerWorld = (edgeSide) => {
  const w = flat();
  if (edgeSide > 0) w.addSolid([-6, 0, -1.0], [0.25, 3, -0.7], 'wall');   // ends at x 0.25
  else w.addSolid([-0.25, 0, -1.0], [6, 3, -0.7], 'wall');               // ends at x -0.25
  return w;
};
const crouchAim = (p, secs) => { run(p, 0.15, { crouch: true, crouchCycle: true }); run(p, secs, { crouch: true, crouchCycle: true, aim: true }); };
T('crouched at the edge of a wall, aiming leans you out past it', () => {
  const p = new Player(cornerWorld(1));
  crouchAim(p, 0.8);
  A(p.lean > 0.4, 'did not lean right round the edge: ' + p.lean.toFixed(2));
  A(p.eyePos[0] > 0.3, 'your eyes should be past the edge: x=' + p.eyePos[0].toFixed(2));
});
T('it leans the open way, whichever side that is', () => {
  const p = new Player(cornerWorld(-1));
  crouchAim(p, 0.8);
  A(p.lean < -0.4, 'should lean left: ' + p.lean.toFixed(2));
});
T('no lean in the middle of a long wall, or with nothing in front', () => {
  const w = flat(); w.addSolid([-6, 0, -1.0], [6, 3, -0.7], 'wall');
  const p = new Player(w); crouchAim(p, 0.8);
  A(p.lean === 0, 'leaned with no edge to lean round: ' + p.lean.toFixed(2));
  const q = new Player(flat()); crouchAim(q, 0.8);
  A(q.lean === 0, 'leaned with nothing there: ' + q.lean.toFixed(2));
});
T('letting go of aim brings you back, and the body never moves', () => {
  const p = new Player(cornerWorld(1));
  crouchAim(p, 0.8);
  const x = p.pos[0];
  A(Math.abs(x) < 0.01, 'the body moved: ' + x);
  run(p, 0.8, { crouch: true, crouchCycle: true });
  A(p.lean === 0, 'still leaning after letting go: ' + p.lean.toFixed(2));
});
T('a shot from the lean reaches what is round the corner', () => {
  const w = cornerWorld(1);
  const t = makeTarget(w, [0.4, 0.4, -4.05], [1.2, 1.4, -3.95], { hp: 200 });
  const p = new Player(w);
  crouchAim(p, 0.8);
  const a = new Arsenal(w, { loadout: new Loadout({ primary: 'K7' }), start: 'K7' });
  for (let i = 0; i < 30; i++) a.step(1 / 60, p);
  const e = p.eyePos, c = t.centre;
  const d = [c[0] - e[0], c[1] - e[1], c[2] - e[2]], len = Math.hypot(d[0], d[1], d[2]);
  a.fire(e, d.map((v) => v / len), { aim: true });
  A(t.hp < 200, 'the round did not get round the corner');
});

console.log('\n-- CAMERA --');
T('walking up stairs, the camera rises smoothly', () => {
  const w = flat();
  for (let i = 0; i < 12; i++) w.addSolid([-1, 0, -1 - (i + 1) * 0.55], [1, (i + 1) * 0.4, -1 - i * 0.55]);
  const p = new Player(w);
  const cam = new CamSmoother();
  let worst = 0, last = null, worstBody = 0, lastBody = null;
  run(p, 3, (t, pl) => {
    const y = cam.update(DT, pl.pos[1], pl.vel[1]);
    if (last !== null) worst = Math.max(worst, Math.abs(y - last));
    if (lastBody !== null) worstBody = Math.max(worstBody, Math.abs(pl.pos[1] - lastBody));
    last = y; lastBody = pl.pos[1];
    return { moveZ: pl.pos[2] > -7.3 ? 1 : 0 };
  });
  A(worstBody > 0.3, 'the body should step: ' + worstBody);
  A(worst < 0.07, 'camera jumped ' + worst.toFixed(3) + ' m in one frame');
});
T('sprinting up the crate stairs, the camera stays smooth', () => {
  const p = new Player(L.world);
  at(p, [-21, 0, -30 - 2.5 - 11 - 0.8], YAW.S);
  const cam = new CamSmoother();
  let worst = 0, last = null;
  run(p, 8, (t, pl) => {
    const y = cam.update(DT, pl.pos[1], pl.mode === 'traverse' ? 0 : pl.vel[1]);
    if (last !== null) worst = Math.max(worst, Math.abs(y - last));
    last = y;
    return { moveZ: pl.pos[1] > 11.9 ? 0 : 1, sprint: true };
  });
  A(near(p.pos[1], 12, 0.05), 'did not get up: ' + p.pos[1]);
  A(worst < 0.12, 'camera jumped ' + worst.toFixed(3) + ' m in one frame');
});
T('a jump is followed closely, not smeared', () => {
  const p = new Player(flat());
  const cam = new CamSmoother();
  let lag = 0;
  run(p, 1.2, (t, pl) => { const y = cam.update(DT, pl.pos[1], pl.vel[1]); lag = Math.max(lag, Math.abs(y - pl.pos[1])); return { jump: t < 0.05 }; });
  A(lag < 0.08, 'camera lagged the jump by ' + lag.toFixed(3));
});

console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + '):\n' + fails.map(f => '  * ' + f).join('\n') : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
