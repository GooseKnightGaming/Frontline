// FRONTLINE - how a body moves, written in code: every clip the game asks for (by the names anim.js picks),
// as joint angles over time. Pure: no drawing (draw/puppet.js turns poses into a moving body).
//
// The skeleton: a body facing +z, standing on y = 0, 1.8 m tall.
//   pelvis (at 1.0 m) - spine - chest - neck - head
//   chest - upperarm_l/r - lowerarm_l/r - hand_l/r       (left is +x: he faces +z)
//   pelvis - thigh_l/r - calf_l/r - foot_l/r
// A pose is { j: { joint: [x, y, z] degrees }, hip: [dx, dy, dz] metres, pitch: degrees }: hip moves the pelvis,
// pitch tips the whole body forward about it (lying face down is +90, on your back -90).
//
// Angles, so the clips below read naturally (the helpers do the signs):
//   legs and arms hang down; swinging one forward is a negative x turn; a knee bends with +x, an elbow with -x;
//   the torso leans forward with +x; turning to his left is +y; an arm out to the side is +z on the left, -z on the right.

export const JOINTS = ['pelvis', 'spine', 'chest', 'neck', 'head',
  'upperarm_l', 'lowerarm_l', 'hand_l', 'upperarm_r', 'lowerarm_r', 'hand_r',
  'thigh_l', 'calf_l', 'foot_l', 'thigh_r', 'calf_r', 'foot_r'];

const TAU = Math.PI * 2;
const sin = Math.sin, cos = Math.cos;
const clamp01 = (t) => Math.max(0, Math.min(1, t));
const ease = (t) => { t = clamp01(t); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
// a value held at points in time, eased between: keys = [[t, v], ...]
function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let k = 1; k < keys.length; k++) {
    if (t <= keys[k][0]) {
      const [t0, v0] = keys[k - 1], [t1, v1] = keys[k];
      return mix(v0, v1, ease((t - t0) / (t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
}

// the pieces poses are made of
function base() { const j = {}; for (const n of JOINTS) j[n] = [0, 0, 0]; return { j, hip: [0, 0, 0], pitch: 0 }; }
const leg = (P, side, fwd, knee, foot) => {
  P.j['thigh_' + side] = [-fwd, 0, 0];
  P.j['calf_' + side] = [knee, 0, 0];
  // the foot kept flat to the ground unless told otherwise
  P.j['foot_' + side] = [foot === undefined ? fwd - knee : foot, 0, 0];
};
// an arm: fwd swings it forward, out lifts it from the side, elbow bends it, twist turns the upper arm
const arm = (P, side, fwd, out, elbow, twist) => {
  const s = side === 'l' ? 1 : -1;
  P.j['upperarm_' + side] = [-fwd, (twist || 0) * s, (out || 0) * s];
  P.j['lowerarm_' + side] = [-(elbow || 0), 0, 0];
};
const lean = (P, deg, turn) => { P.j.spine = [deg * 0.4, (turn || 0) * 0.4, 0]; P.j.chest = [deg * 0.6, (turn || 0) * 0.6, 0]; };
const look = (P, down, turn) => { P.j.neck = [down * 0.4, (turn || 0) * 0.4, 0]; P.j.head = [down * 0.6, (turn || 0) * 0.6, 0]; };

// standing still: breathing, arms easy at the sides
function idle(t) {
  const P = base(), b = sin(t * TAU / 3.2);
  lean(P, 1 + b * 1.2); look(P, 2);
  arm(P, 'l', 2, 7 + b, 10); arm(P, 'r', 2, 7 + b, 10);
  leg(P, 'l', 0, 2); leg(P, 'r', 0, 2);
  P.hip[1] = -0.01 + b * 0.004;
  return P;
}
// a stride: amp (degrees the thighs swing), knee lift, arms, lean, bob; t in cycles
function stride(c, o) {
  const P = base(), p = c * TAU;
  for (const [side, ph] of [['l', 0], ['r', Math.PI]]) {
    const q = p + ph, swing = sin(q);
    // the knee bends as the leg comes through, and a little as the foot lands
    const lift = Math.max(0, sin(q + 1.2));
    const fwd = o.amp * swing;
    const knee = o.knee * lift + 6;
    leg(P, side, fwd, knee, fwd - knee + (swing < 0 ? -8 * -swing : 6 * swing));
    // arms swing against the legs
    arm(P, side === 'l' ? 'r' : 'l', o.arms * swing, o.out, o.elbow + o.arms * 0.3 * Math.max(0, swing));
  }
  lean(P, o.lean, sin(p) * o.twist);
  look(P, -o.lean * 0.5);
  P.hip[1] = -o.bob * (0.5 + 0.5 * cos(p * 2)) - (o.sink || 0);
  return P;
}
const WALK = { amp: 24, knee: 34, arms: 18, out: 5, elbow: 12, lean: 3, twist: 6, bob: 0.025 };
const JOG = { amp: 40, knee: 78, arms: 34, out: 8, elbow: 80, lean: 9, twist: 10, bob: 0.045 };
const SPRINT = { amp: 54, knee: 100, arms: 55, out: 6, elbow: 88, lean: 16, twist: 14, bob: 0.06 };
const CROUCH_WALK = { amp: 22, knee: 30, arms: 12, out: 10, elbow: 40, lean: 22, twist: 5, bob: 0.02 };

// crouched: hips down, knees forward, leaning in
function crouch(P, sway) {
  P.hip[1] = -0.36;
  leg(P, 'l', 62 + sway, 112); leg(P, 'r', 52 - sway, 104);
  lean(P, 22); look(P, -14);
  return P;
}
function crouchIdle(t) {
  const P = base(), b = sin(t * TAU / 2.6);
  crouch(P, b);
  arm(P, 'l', 26, 14, 50); arm(P, 'r', 26, 14, 50);
  return P;
}
function crouchWalk(c) {
  const P = stride(c, CROUCH_WALK);
  const s = stride(c, CROUCH_WALK);
  P.hip[1] = -0.34 + s.hip[1];
  for (const side of ['l', 'r']) {
    const f = -s.j['thigh_' + side][0];
    leg(P, side, 57 + f * 0.8, 105 + Math.max(0, f) * 0.5);
  }
  lean(P, 24); look(P, -16);
  return P;
}

// arms for the weapon in hand
function pistolLow(P) { arm(P, 'r', 32, 6, 34, -10); arm(P, 'l', 26, 12, 46, 10); }
function aim(P, kick) {
  arm(P, 'r', 84 + (kick || 0), -2, 6, -6);
  arm(P, 'l', 74 + (kick || 0) * 0.8, -28, 32, 30);
  look(P, -2, 6);
  lean(P, 4, 8);
}

// strikes: right arm then left, a slash each way, a swung hook
function punch(t, side) {
  const P = idle(0), e = track([[0, 0], [0.12, 1], [0.3, 1], [0.45, 0]], t);
  arm(P, side === 'r' ? 'l' : 'r', 50, 10, 110);
  arm(P, side, mix(45, 88, e), side === 'r' ? -4 : 4, mix(115, 4, e));
  lean(P, 6, (side === 'r' ? 1 : -1) * mix(-6, 22, e));
  leg(P, 'l', 14, 14); leg(P, 'r', -10, 8);
  return P;
}
function slash(t, back) {
  const P = idle(0), e = track([[0, 0], [0.1, 0.15], [0.32, 1], [0.5, 1]], t);
  const across = back ? mix(-60, 70, e) : mix(70, -60, e);
  arm(P, 'r', 70, 20, 40, across);
  arm(P, 'l', 30, 14, 60);
  lean(P, 8, across * 0.3);
  leg(P, 'l', 12, 12); leg(P, 'r', -8, 8);
  return P;
}
function hook(t) {
  const P = idle(0), e = track([[0, 0], [0.18, 0.2], [0.38, 1], [0.6, 1]], t);
  arm(P, 'r', mix(30, 80, e), mix(60, -10, e), mix(80, 30, e), mix(-70, 40, e));
  arm(P, 'l', 40, 10, 90);
  lean(P, 8, mix(-25, 30, e));
  return P;
}

// a fall onto your back: hips drop, body tips, arms out
function death(t) {
  const P = base(), e = track([[0, 0], [0.25, 0.15], [0.95, 1]], t);
  P.pitch = -88 * e;
  P.hip[1] = -0.84 * track([[0, 0], [0.3, 0.2], [0.95, 1]], t);
  P.hip[2] = -0.25 * e;
  leg(P, 'l', mix(0, 20, e), mix(0, 30, e), 20); leg(P, 'r', mix(0, 8, e), mix(0, 10, e), 25);
  arm(P, 'l', mix(0, 40, e), mix(5, 70, e), mix(10, 30, e)); arm(P, 'r', mix(0, 20, e), mix(5, 80, e), mix(10, 20, e));
  look(P, mix(0, -10, e), 25 * e);
  return P;
}
// lying face down and creeping: elbows and knees
function crawl(c) {
  const P = base(), p = c * TAU;
  P.pitch = 88; P.hip[1] = -0.84; P.hip[2] = 0.1;
  for (const [side, ph] of [['l', 0], ['r', Math.PI]]) {
    const s = sin(p + ph);
    // thigh out and up, knee drawn in, arm reaching over the head
    P.j['thigh_' + side] = [-10 - 12 * Math.max(0, s), 0, (side === 'l' ? 1 : -1) * (10 + 18 * Math.max(0, s))];
    P.j['calf_' + side] = [20 + 40 * Math.max(0, s), 0, 0];
    P.j['foot_' + side] = [30, 0, 0];
    arm(P, side, 150 + 20 * s, 22, 70 - 30 * s);
  }
  look(P, -40);
  return P;
}
// swimming: treading water upright, or the front crawl laid flat
function tread(t) {
  const P = base(), p = t * TAU / 1.6;
  arm(P, 'l', 30 + 12 * sin(p), 45, 30, 20 * sin(p)); arm(P, 'r', 30 + 12 * sin(p), 45, 30, -20 * sin(p));
  leg(P, 'l', 20 + 20 * sin(p), 50 + 20 * sin(p), 30); leg(P, 'r', 20 - 20 * sin(p), 50 - 20 * sin(p), 30);
  look(P, -6);
  return P;
}
function frontCrawl(c) {
  const P = base(), p = c * TAU;
  P.pitch = 82;
  for (const [side, ph] of [['l', 0], ['r', Math.PI]]) {
    const a = (p + ph) % TAU;
    // the arm goes round: over the head, pulled down under the body, out of the water at the hip
    arm(P, side, (a / TAU) * 360 - 10, 14, a < Math.PI ? 20 : 60);
    const k = sin(p * 3 + ph);
    leg(P, side, 6 * k, 14 + 6 * k, 40);
  }
  look(P, -20, 25 * sin(p));
  return P;
}
// in the air: legs drawn up a little, arms out
function air(t) {
  const P = base(), b = sin(t * TAU / 0.9);
  leg(P, 'l', 34, 52, 10); leg(P, 'r', 16, 30, 10);
  arm(P, 'l', 22 + 4 * b, 38, 24); arm(P, 'r', 22 - 4 * b, 38, 24);
  lean(P, 6);
  return P;
}
function jumpStart(t) {
  const P = base(), e = track([[0, 0], [0.12, 1], [0.3, 0]], t);
  P.hip[1] = -0.18 * e;
  leg(P, 'l', 30 * e, 60 * e); leg(P, 'r', 30 * e, 60 * e);
  arm(P, 'l', mix(60, -20, e), 20, 20); arm(P, 'r', mix(60, -20, e), 20, 20);
  lean(P, 14 * e);
  return P;
}
function land(t) {
  const P = base(), e = track([[0, 1], [0.1, 1], [0.35, 0]], t);
  P.hip[1] = -0.22 * e;
  leg(P, 'l', 36 * e, 70 * e); leg(P, 'r', 36 * e, 70 * e);
  arm(P, 'l', 30 * e, 30 * e, 20); arm(P, 'r', 30 * e, 30 * e, 20);
  lean(P, 16 * e);
  return P;
}
// a forward roll: tucked tight, turning a full circle about the hips
function roll(t) {
  const P = base(), e = clamp01(t / 0.8);
  P.pitch = 360 * ease(e);
  P.hip[1] = -0.5 * sin(Math.PI * e);
  leg(P, 'l', 100, 130, 30); leg(P, 'r', 100, 130, 30);
  arm(P, 'l', 60, 10, 110); arm(P, 'r', 60, 10, 110);
  lean(P, 30); look(P, 30);
  return P;
}
// hauling yourself up onto something a metre high
function climbUp(t) {
  const P = base(), e = clamp01(t / 0.67);
  const reach = track([[0, 1], [0.35, 1], [0.75, 0.2], [1, 0]], e), push = track([[0, 0], [0.4, 0.2], [0.8, 1], [1, 0.4]], e);
  arm(P, 'l', mix(20, 160, reach), 12, mix(10, 60, push)); arm(P, 'r', mix(20, 160, reach), 12, mix(10, 60, push));
  leg(P, 'l', mix(10, 85, push), mix(20, 100, push)); leg(P, 'r', 10 * reach, 20);
  lean(P, mix(5, 30, push));
  return P;
}
// a ladder: hand over hand, a rung at a time
function ladder(c) {
  const P = base(), p = c * TAU;
  for (const [side, ph] of [['l', 0], ['r', Math.PI]]) {
    const s = sin(p + ph);
    arm(P, side, 140 + 25 * s, 10, 40 - 25 * s);
    leg(P, side, 35 + 25 * s, 60 + 30 * s, -10);
  }
  look(P, -10);
  return P;
}
// sitting (a seat, a driver's seat)
function sit(t) {
  const P = base();
  P.hip[1] = -0.48; P.hip[2] = -0.05;
  leg(P, 'l', 88, 86); leg(P, 'r', 84, 90);
  arm(P, 'l', 40, 8, 50); arm(P, 'r', 40, 8, 50);
  lean(P, -2 + sin(t * TAU / 4) * 1);
  return P;
}
function talk(t) {
  const P = idle(t), g = sin(t * TAU / 1.9), h = sin(t * TAU / 2.7 + 1);
  arm(P, 'r', 30 + 18 * Math.max(0, g), 10, 60 + 20 * g, -10);
  arm(P, 'l', 12 + 10 * Math.max(0, h), 8, 25 + 15 * h);
  look(P, 2 + 3 * g, 8 * h);
  return P;
}
function foldArms(t) {
  const P = idle(t);
  arm(P, 'l', 26, -14, 112, 40); arm(P, 'r', 30, -14, 108, 40);
  P.j.lowerarm_l[1] = -40; P.j.lowerarm_r[1] = 40;
  return P;
}
function reach(t) {
  const P = idle(0), e = track([[0, 0], [0.25, 1], [0.45, 1], [0.65, 0]], t);
  arm(P, 'r', mix(4, 72, e), 6, mix(10, 18, e));
  lean(P, 10 * e); look(P, 10 * e);
  return P;
}
function throwOver(t) {
  const P = idle(0), e = track([[0, 0], [0.3, 0.35], [0.5, 1], [0.7, 1]], t);
  const back = track([[0, 0], [0.3, 1], [0.5, 0], [0.7, 0]], t);
  arm(P, 'r', mix(10, 160, back) * (1 - e) + mix(160, 60, e) * e, 20, mix(30, 90, back) * (1 - e) + 10 * e);
  arm(P, 'l', mix(10, 70, back), 10, 20);
  lean(P, mix(-10, 22, e), mix(-20, 25, e));
  leg(P, 'l', 18, 14); leg(P, 'r', -12, 10);
  return P;
}
function hit(t, big) {
  const P = idle(0), e = track([[0, 0], [0.1, 1], [big ? 0.6 : 0.4, 0]], t);
  lean(P, -(big ? 24 : 14) * e); look(P, -10 * e);
  arm(P, 'l', -10 * e, 25 * e, 30); arm(P, 'r', -10 * e, 25 * e, 30);
  if (big) { P.hip[2] = -0.15 * e; leg(P, 'r', -20 * e, 15 * e); }
  return P;
}
function getUp(t) {
  const d = death(1), s = idle(t), e = ease(clamp01(t / 1.2));
  return blend(d, s, e);
}
function reload(t) {
  const P = idle(0), e = track([[0, 0], [0.2, 1], [0.95, 1], [1.2, 0]], t);
  arm(P, 'r', mix(30, 45, e), -6, mix(30, 80, e), -20 * e);
  arm(P, 'l', mix(20, 40 + 10 * sin(t * 12), e), 10, mix(40, 90, e), 30 * e);
  look(P, 18 * e);
  return P;
}

// every clip: its length (seconds at speed 1), whether it loops, and its pose at time t
export const CLIP = {
  Idle_Loop: { len: 3.2, loop: true, at: idle },
  Walk_Loop: { len: 1.0, loop: true, at: (t) => stride(t / 1.0, WALK) },
  Jog_Fwd_Loop: { len: 0.72, loop: true, at: (t) => stride(t / 0.72, JOG) },
  Sprint_Loop: { len: 0.56, loop: true, at: (t) => stride(t / 0.56, SPRINT) },
  Crouch_Idle_Loop: { len: 2.6, loop: true, at: crouchIdle },
  Crouch_Fwd_Loop: { len: 1.1, loop: true, at: (t) => crouchWalk(t / 1.1) },
  Swim_Idle_Loop: { len: 1.6, loop: true, at: tread },
  Swim_Fwd_Loop: { len: 1.4, loop: true, at: (t) => frontCrawl(t / 1.4) },
  Jump_Start: { len: 0.3, loop: false, at: jumpStart },
  Jump_Loop: { len: 0.9, loop: true, at: air },
  Jump_Land: { len: 0.35, loop: false, at: land },
  Roll: { len: 0.8, loop: false, at: roll },
  Death01: { len: 1.0, loop: false, at: death },
  Hit_Chest: { len: 0.4, loop: false, at: (t) => hit(t, false) },
  Hit_Knockback: { len: 0.6, loop: false, at: (t) => hit(t, true) },
  Pistol_Idle_Loop: { len: 3.2, loop: true, at: (t) => { const P = idle(t); pistolLow(P); return P; } },
  Pistol_Aim_Neutral: { len: 2, loop: true, at: (t) => { const P = idle(t); aim(P); return P; } },
  Pistol_Shoot: { len: 0.25, loop: false, at: (t) => { const P = idle(0); aim(P, track([[0, 0], [0.04, 9], [0.25, 0]], t)); return P; } },
  Pistol_Reload: { len: 1.2, loop: false, at: reload },
  Punch_Jab: { len: 0.45, loop: false, at: (t) => punch(t, 'l') },
  Punch_Cross: { len: 0.45, loop: false, at: (t) => punch(t, 'r') },
  Sword_Idle: { len: 3.2, loop: true, at: (t) => { const P = idle(t); arm(P, 'r', 34, 12, 64, -20); arm(P, 'l', 24, 12, 50); return P; } },
  Sword_Attack: { len: 0.5, loop: false, at: (t) => slash(t, false) },
  Sword_Regular_A: { len: 0.5, loop: false, at: (t) => slash(t, false) },
  Sword_Regular_B: { len: 0.5, loop: false, at: (t) => slash(t, true) },
  Melee_Hook: { len: 0.6, loop: false, at: hook },
  Interact: { len: 0.65, loop: false, at: reach },
  Driving_Loop: { len: 4, loop: true, at: sit },
  Idle_Talking_Loop: { len: 5.4, loop: true, at: talk },
  Idle_FoldArms_Loop: { len: 3.2, loop: true, at: foldArms },
  ClimbUp_1m: { len: 0.67, loop: false, at: climbUp },
  LayToIdle: { len: 1.2, loop: false, at: getUp },
  OverhandThrow: { len: 0.7, loop: false, at: throwOver },
  Ladder_Loop: { len: 1.0, loop: true, at: (t) => ladder(t / 1.0) },
  Crawl_Loop: { len: 1.3, loop: true, at: (t) => crawl(t / 1.3) },
};
// strikes from a crouch: the strike's upper body on crouched legs
for (const s of ['Punch_Jab', 'Punch_Cross', 'Sword_Regular_A', 'Sword_Regular_B', 'Melee_Hook']) {
  const c = CLIP[s];
  CLIP['Crouch_' + s] = { len: c.len, loop: false, at: (t) => { const P = c.at(t); const C = crouchIdle(0); for (const n of ['pelvis', 'thigh_l', 'calf_l', 'foot_l', 'thigh_r', 'calf_r', 'foot_r']) P.j[n] = C.j[n]; P.hip = C.hip; return P; } };
}
// the cycles played backwards, for walking backwards
for (const [name, from] of [['Walk_Back', 'Walk_Loop'], ['Jog_Back', 'Jog_Fwd_Loop'], ['Crouch_Back', 'Crouch_Fwd_Loop']]) {
  const c = CLIP[from];
  CLIP[name] = { len: c.len, loop: true, at: (t) => c.at(c.len - (t % c.len)) };
}

// a clip's pose at time t (seconds of the clip): loops wrap, the others hold their last frame
export function poseAt(name, t) {
  const c = CLIP[name] || CLIP.Idle_Loop;
  const tt = c.loop ? ((t % c.len) + c.len) % c.len : Math.max(0, Math.min(c.len, t));
  return c.at(tt);
}
// between two poses (k: 0 all a, 1 all b)
export function blend(a, b, k) {
  const P = base();
  for (const n of JOINTS) for (let i = 0; i < 3; i++) P.j[n][i] = mix(a.j[n][i], b.j[n][i], k);
  for (let i = 0; i < 3; i++) P.hip[i] = mix(a.hip[i], b.hip[i], k);
  P.pitch = mix(a.pitch, b.pitch, k);
  return P;
}
