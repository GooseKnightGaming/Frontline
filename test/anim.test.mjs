// FRONTLINE - animation choice tests.
import { readFileSync } from 'fs';
import { pickClip, poseFor, CLIPS, MODEL_CLIPS, DERIVED, ONCE } from '../src/sim/people/anim.js';
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n + ': ' + e.message); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const base = { mode: 'walk', stance: 0, speed: 0, forward: 0, strafe: 0, onGround: true, vy: 0,
  armed: true, melee: false, aiming: false, firing: false, dashing: false, hurt: false, dead: false };
const pick = (o) => pickClip(Object.assign({}, base, o));

// the clip names actually inside the model file
const glb = readFileSync(new URL('../assets/characters/Operative.glb', import.meta.url));
const json = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString());
const inModel = new Set((json.animations || []).map((a) => a.name));

T('the model carries every clip the picker knows, and the copies come from real clips', () => {
  for (const c of MODEL_CLIPS) A(inModel.has(c), 'missing from Operative.glb: ' + c);
  for (const [name, [from]] of Object.entries(DERIVED)) A(inModel.has(from), name + ' copies a missing clip ' + from);
  for (const c of ONCE) A(inModel.has(c), 'one-shot clip not in the model: ' + c);
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
