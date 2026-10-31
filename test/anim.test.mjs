// FRONTLINE - animation choice tests.
import { readFileSync } from 'fs';
import { pickClip, poseFor, CLIPS, MODEL_CLIPS, DERIVED, ONCE } from '../src/sim/people/anim.js';
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n + ': ' + e.message); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const base = { mode: 'walk', stance: 0, speed: 0, forward: 0, strafe: 0, onGround: true, vy: 0,
  armed: true, melee: false, aiming: false, firing: false, dashing: false, hurt: false, dead: false };
const pick = (o) => pickClip(Object.assign({}, base, o));

// the clips are poses written in code (src/sim/people/poses.js): every name the picker can ask for is there
import { CLIP, poseAt, JOINTS } from '../src/sim/people/poses.js';
const inModel = new Set(Object.keys(CLIP));

T('every clip the picker knows is written as poses, and the copies come from real clips', () => {
  for (const c of MODEL_CLIPS) A(inModel.has(c), 'no poses for: ' + c);
  for (const [name, [from]] of Object.entries(DERIVED)) A(inModel.has(from) && inModel.has(name), name + ' copies a missing clip ' + from);
  for (const c of ONCE) A(inModel.has(c) && !CLIP[c].loop, 'one-shot clip missing or looping: ' + c);
});
T('the poses: every joint, every clip, numbers all the way through', () => {
  for (const name of Object.keys(CLIP)) for (const t of [0, 0.1, 0.37, 1.3, 9]) {
    const P = poseAt(name, t);
    for (const j of JOINTS) A(P.j[j] && P.j[j].length === 3 && P.j[j].every(Number.isFinite), name + ' ' + j + ' at ' + t);
    A(P.hip.every(Number.isFinite) && Number.isFinite(P.pitch), name + ' hip/pitch at ' + t);
  }
});
T('the poses mean what they say: dead is on his back on the floor, the crawl is face down, a crouch is low', () => {
  const d = poseAt('Death01', 5);
  A(d.pitch < -80 && d.hip[1] < -0.7, 'death: pitch ' + d.pitch + ', hips ' + d.hip[1]);
  const c = poseAt('Crawl_Loop', 0.4);
  A(c.pitch > 80 && c.hip[1] < -0.7, 'crawl: pitch ' + c.pitch);
  A(poseAt('Crouch_Idle_Loop', 1).hip[1] < -0.3, 'crouch');
  A(poseAt('Walk_Loop', 0.25).j.thigh_l[0] !== poseAt('Walk_Loop', 0.75).j.thigh_l[0], 'walking moves the legs');
  // the backward walk is the forward walk run backwards
  A(Math.abs(poseAt('Walk_Back', 0.3).j.thigh_l[0] - poseAt('Walk_Loop', 0.7).j.thigh_l[0]) < 1e-9, 'walking backwards');
  // a loop wraps; a one-shot holds its last frame
  A(Math.abs(poseAt('Jog_Fwd_Loop', 0.1).j.thigh_r[0] - poseAt('Jog_Fwd_Loop', 0.1 + CLIP.Jog_Fwd_Loop.len).j.thigh_r[0]) < 1e-9, 'loops wrap');
  A(poseAt('Roll', 3).pitch === poseAt('Roll', 30).pitch, 'one-shots hold');
});
T('every clip it can ask for exists, at a sensible speed', () => {
  const cases = [{}, { speed: 2 }, { speed: 4.3, forward: 1 }, { speed: 7.2, forward: 1 }, { speed: 4, forward: -1 },
    { speed: 1.5, forward: -1 }, { speed: 6, strafe: 1 }, { speed: 6, strafe: -1 }, { speed: 8, firing: true, forward: 1 },
    { firing: true }, { aiming: true }, { melee: true }, { melee: true, firing: true }, { armed: false },
    { armed: false, firing: true }, { onGround: false, vy: 5 }, { onGround: false, vy: -8 }, { mode: 'swim' },
    { mode: 'swim', speed: 3 }, { mode: 'ladder', speed: 3 }, { mode: 'ladder' }, { mode: 'traverse', traverseDur: 0.5 },
    { dashing: true, strafe: 1 }, { dashing: true, rolling: true }, { hurt: true }, { dead: true },
    { stance: 1 }, { stance: 1, speed: 2, forward: 1 }, { stance: 1, speed: 2, forward: -1 }, { stance: 2 }, { stance: 2, speed: 1 }];
  for (const c of cases) {
    const r = pick(c);
    A(CLIPS.includes(r.clip), 'unknown clip "' + r.clip + '" for ' + JSON.stringify(c));
    A(r.speed > 0 && r.speed < 3, 'silly playback speed ' + r.speed + ' for ' + JSON.stringify(c));
  }
});
T('standing still: idle, pistol stance armed, aiming and firing', () => {
  A(pick({ armed: false }).clip === 'Idle_Loop', 'unarmed idle');
  A(pick({}).clip === 'Pistol_Idle_Loop', 'armed idle: ' + pick({}).clip);
  A(pick({ aiming: true }).clip === 'Pistol_Aim_Neutral', 'aiming');
  A(pick({ firing: true }).clip === 'Pistol_Shoot', 'firing');
});
T('walking, jogging and sprinting use their own cycles, paced by speed', () => {
  A(pick({ speed: 1.5, forward: 1 }).clip === 'Walk_Loop', 'walk');
  A(pick({ speed: 4.3, forward: 1 }).clip === 'Jog_Fwd_Loop', 'your walk speed is a jog');
  A(pick({ speed: 7.2, forward: 1 }).clip === 'Sprint_Loop', 'sprint');
  A(pick({ speed: 7.2, forward: 1 }).speed > pick({ speed: 6, forward: 1 }).speed, 'faster plays faster');
});
T('backwards plays the cycle in reverse; sideways turns the body the way you go', () => {
  A(pick({ speed: 3.4, forward: -1 }).clip === 'Jog_Back', 'backwards');
  A(DERIVED.Jog_Back[1] < 0, 'the back cycles must be registered reversed');
  const r = pick({ speed: 5, strafe: 1 });
  A(r.clip === 'Jog_Fwd_Loop' && Math.abs(r.turn - Math.PI / 2) < 1e-6, 'right: body turned right ' + JSON.stringify(r));
  const l = pick({ speed: 5, strafe: -1 });
  A(Math.abs(l.turn + Math.PI / 2) < 1e-6, 'left: body turned left');
  const bl = pick({ speed: 3, forward: -1, strafe: -1 });
  A(bl.clip === 'Jog_Back' && Math.abs(bl.turn - Math.PI / 4) < 1e-6, 'back-left: reversed, turned 45 deg ' + JSON.stringify(bl));
  A(!pick({}).turn, 'standing still does not turn');
});
T('crouch and prone have real poses now: no squashing the body', () => {
  A(pick({ stance: 1 }).clip === 'Crouch_Idle_Loop', 'crouched still');
  A(pick({ stance: 1, speed: 2, forward: 1 }).clip === 'Crouch_Fwd_Loop', 'crouch walk');
  A(pick({ stance: 1, speed: 2, forward: -1 }).clip === 'Crouch_Back', 'crouch backwards');
  A(pick({ stance: 2, speed: 1 }).clip === 'Crawl_Loop', 'prone crawl');
  A(pick({ stance: 2 }).clip === 'Crawl_Loop' && pick({ stance: 2 }).speed < 0.1, 'lying still is nearly still');
  for (const st of [0, 1, 2]) A(poseFor(st, 'walk').scaleY === 1, 'squashed at stance ' + st);
});
T('in the air, swimming, climbing and on ladders are all covered', () => {
  A(pick({ onGround: false, vy: 5 }).clip === 'Jump_Start', 'rising');
  A(pick({ onGround: false, vy: -3 }).clip === 'Jump_Loop', 'falling');
  A(pick({ mode: 'swim', speed: 2 }).clip === 'Swim_Fwd_Loop', 'swimming');
  A(pick({ mode: 'swim' }).clip === 'Swim_Idle_Loop', 'treading water');
  A(pick({ mode: 'ladder', speed: 3 }).clip === 'Ladder_Loop', 'ladder');
  const quick = pick({ mode: 'traverse', traverseDur: 0.3 }), slow = pick({ mode: 'traverse', traverseDur: 0.9 });
  A(quick.clip === 'ClimbUp_1m' && quick.speed > slow.speed, 'the climb is timed to the move');
});
T('strikes: a knife slashes one way then back, fists jab then cross, a gun is swung', () => {
  const k1 = pick({ strike: { kind: 'knife', n: 1 } }), k2 = pick({ strike: { kind: 'knife', n: 2 } });
  A(k1.clip !== k2.clip && /^Sword_Regular/.test(k1.clip) && /^Sword_Regular/.test(k2.clip), 'knife: ' + k1.clip + ' then ' + k2.clip);
  A(k1.restart === 1 && k2.restart === 2 && !k1.loop, 'each strike restarts and plays once');
  const p1 = pick({ armed: false, strike: { kind: 'punch', n: 1 } }), p2 = pick({ armed: false, strike: { kind: 'punch', n: 2 } });
  A(/^Punch_/.test(p1.clip) && p1.clip !== p2.clip, 'punches alternate: ' + p1.clip + ', ' + p2.clip);
  A(pick({ strike: { kind: 'bash', n: 1 } }).clip === 'Melee_Hook', 'a gun is swung');
  A(pick({ speed: 5, forward: 1, strike: { kind: 'knife', n: 3 } }).clip.startsWith('Sword_Regular'), 'strikes on the move too');
  A(pick({ mode: 'ladder', speed: 2, strike: { kind: 'knife', n: 1 } }).clip === 'Ladder_Loop', 'no striking from a ladder');
  // Rhys, M5.17.0: punching should work crouched too, without standing up
  for (const kind of ['punch', 'knife', 'bash']) for (const n of [1, 2]) {
    const c = pick({ stance: 1, strike: { kind, n } });
    A(c.clip.startsWith('Crouch_') && CLIPS.includes(c.clip), 'crouched ' + kind + ': ' + c.clip);
  }
  A(pick({ stance: 2, strike: { kind: 'punch', n: 1 } }).clip === 'Crawl_Loop', 'lying prone, no stand-up punch');
});
T('death and hits interrupt everything', () => {
  A(pick({ dead: true, speed: 8 }).clip === 'Death01', 'death wins');
  A(pick({ hurt: true, speed: 8 }).clip === 'Hit_Chest', 'a hit interrupts');
  A(ONCE.includes('Death01'), 'death plays once and holds');
});

console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + ')' : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
