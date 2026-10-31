// FRONTLINE - which animation the body should be playing.
//
// The operative is the Universal Base Character on Quaternius's 65-bone rig,
// with clips from the Universal Animation Library 1 and 2 (CC0). Those have
// real crouching, swimming, climbing and jumping, but no strafing or walking
// backwards: sideways, the body turns towards where it is going and plays the
// forward cycle; backwards, it plays the cycle in reverse (the _Back clips are
// the same tracks registered at negative speed by character.js). Pure logic:
// the renderer plays what this returns.

// clips in the model (tools/build_operative.mjs puts exactly these in)
export const MODEL_CLIPS = ['Idle_Loop', 'Walk_Loop', 'Jog_Fwd_Loop', 'Sprint_Loop', 'Crouch_Idle_Loop',
  'Crouch_Fwd_Loop', 'Swim_Idle_Loop', 'Swim_Fwd_Loop', 'Jump_Start', 'Jump_Loop', 'Jump_Land', 'Roll',
  'Death01', 'Hit_Chest', 'Pistol_Idle_Loop', 'Pistol_Aim_Neutral', 'Pistol_Shoot', 'Pistol_Reload',
  'Punch_Jab', 'Punch_Cross', 'Sword_Attack', 'Sword_Idle', 'Interact', 'Driving_Loop', 'Idle_Talking_Loop',
  'ClimbUp_1m', 'LayToIdle', 'OverhandThrow', 'Hit_Knockback', 'Idle_FoldArms_Loop',
  'Sword_Regular_A', 'Sword_Regular_B', 'Melee_Hook',
  // made by tools/build_operative.mjs from parts of other clips: the front
  // crawl's arms on the walk's legs for a ladder; the swim, damped, for a crawl
  'Ladder_Loop', 'Crawl_Loop',
  // strikes from a crouch: the strike's upper body on the crouch's legs
  'Crouch_Punch_Jab', 'Crouch_Punch_Cross', 'Crouch_Sword_Regular_A', 'Crouch_Sword_Regular_B', 'Crouch_Melee_Hook'];
// copies registered by the renderer: the cycles reversed, for walking backwards
export const DERIVED = { Walk_Back: ['Walk_Loop', -1], Jog_Back: ['Jog_Fwd_Loop', -1],
  Crouch_Back: ['Crouch_Fwd_Loop', -1] };
export const CLIPS = MODEL_CLIPS.concat(Object.keys(DERIVED));
// clips that play once and hold (everything else loops)
export const ONCE = ['Jump_Start', 'Jump_Land', 'Roll', 'Death01', 'Hit_Chest', 'Pistol_Shoot', 'Pistol_Reload',
  'Punch_Jab', 'Punch_Cross', 'Sword_Attack', 'Interact', 'ClimbUp_1m', 'LayToIdle', 'OverhandThrow', 'Hit_Knockback',
  'Sword_Regular_A', 'Sword_Regular_B', 'Melee_Hook',
  'Crouch_Punch_Jab', 'Crouch_Punch_Cross', 'Crouch_Sword_Regular_A', 'Crouch_Sword_Regular_B', 'Crouch_Melee_Hook'];
// strikes: a knife slashes one way then back, fists jab then cross, and a
// weapon is swung as a hook (a rifle butt, a pistol whip)
const STRIKE = { knife: ['Sword_Regular_A', 'Sword_Regular_B'], punch: ['Punch_Jab', 'Punch_Cross'], bash: ['Melee_Hook', 'Melee_Hook'] };
const CLIMB_LEN = 0.67;            // seconds of ClimbUp_1m at normal speed

// the pace (m/s) at which each cycle's feet do not slide
const PACE = { walk: 1.6, jog: 4.2, sprint: 7.0, crouch: 1.5, swim: 1.6, prone: 1.2 };
const pace = (speed, p) => Math.max(0.5, Math.min(1.7, speed / p));

// state: {mode, stance, speed, forward, strafe, onGround, vy, armed, melee,
//         aiming, firing, hurt, dead, dashing, rolling, diving, traverseKind, traverseDur}
// returns {clip, loop, speed, turn?} - turn: radians the body faces to the
// right of where you look (moving sideways)
export function pickClip(s) {
  // dead in a seat: the sitting pose, held still
  if (s.dead && s.seated) return { clip: 'Driving_Loop', loop: true, speed: 0, seated: true };
  // (Rhys: "the Minister needs to sit down in his seat") alive in a seat: upright, still
  if (s.sitting && !s.dead) return { clip: 'Driving_Loop', loop: true, speed: 0 };
  // staggering back into the seat first: the knock-back
  if (s.dead && s.hurt2) return { clip: 'Hit_Knockback', loop: false, speed: 1.6 };
  if (s.dead) return { clip: 'Death01', loop: false, speed: 1 };
  if (s.hurt) return { clip: 'Hit_Chest', loop: false, speed: 1 };
  // a strike: restart names this one, so a second slash plays again from the top
  // (crouched, the same strike on crouched legs; lying prone, no strike to show)
  if (s.strike && s.mode !== 'swim' && s.mode !== 'ladder' && s.stance !== 2) {
    const pair = STRIKE[s.strike.kind] || STRIKE.punch;
    const clip = (s.stance === 1 ? 'Crouch_' : '') + pair[s.strike.n % 2];
    return { clip, loop: false, speed: 1.5, restart: s.strike.n };
  }
  if (s.dashing) {
    // a roll backwards is a forward roll with the body turned round
    if (s.rolling) return { clip: 'Roll', loop: false, speed: 1.4, turn: Math.PI };
    return { clip: 'Jog_Fwd_Loop', loop: true, speed: 1.6, turn: (s.strafe >= 0 ? 1 : -1) * Math.PI / 2 };
  }

  const moving = s.speed > 0.4;
  // hauling yourself over or onto something, timed to the move itself
  if (s.mode === 'traverse') {
    const dur = s.traverseDur || 0.5;
    return { clip: 'ClimbUp_1m', loop: false, speed: Math.max(0.6, Math.min(2.5, CLIMB_LEN / dur)), climbing: true };
  }
  if (s.mode === 'ladder') {
    const climbing = Math.abs(s.speed) > 0.2;
    return { clip: 'Ladder_Loop', loop: true, speed: climbing ? Math.max(0.5, Math.min(1.6, Math.abs(s.speed) / 2.4)) : 0.05, ladder: true };
  }
  if (!s.onGround && s.mode !== 'swim') {
    if (s.diving) return { clip: 'Roll', loop: false, speed: 1.1 };
    return s.vy > 1.5 ? { clip: 'Jump_Start', loop: false, speed: 1.3, airborne: true }
      : { clip: 'Jump_Loop', loop: true, speed: 1, airborne: true };
  }
  if (s.mode === 'swim') {
    return moving ? { clip: 'Swim_Fwd_Loop', loop: true, speed: pace(s.speed, PACE.swim), swim: true }
      : { clip: 'Swim_Idle_Loop', loop: true, speed: 1, swim: true };
  }
  // prone: the swimming body with its strokes cut right down - a creep
  if (s.stance === 2) {
    return { clip: 'Crawl_Loop', loop: true, speed: moving ? pace(s.speed, PACE.prone) : 0.05, prone: true };
  }

  // which way you are going, relative to where you look
  const ang = Math.atan2(s.strafe || 0, s.forward || 0);       // 0 ahead, +pi/2 right
  const back = moving && Math.abs(ang) > 1.75;
  const turn = !moving ? 0 : back ? ang - Math.sign(ang) * Math.PI : ang;

  if (s.stance === 1) {
    if (!moving) return { clip: 'Crouch_Idle_Loop', loop: true, speed: 1 };
    return { clip: back ? 'Crouch_Back' : 'Crouch_Fwd_Loop', loop: true, speed: pace(s.speed, PACE.crouch), turn, crouch: 1 };
  }
  if (!moving) {
    if (s.firing) return { clip: 'Pistol_Shoot', loop: false, speed: 1.4 };
    if (s.aiming && s.armed) return { clip: 'Pistol_Aim_Neutral', loop: true, speed: 1 };
    if (s.melee) return { clip: 'Sword_Idle', loop: true, speed: 1 };
    if (s.armed) return { clip: 'Pistol_Idle_Loop', loop: true, speed: 1 };
    return { clip: 'Idle_Loop', loop: true, speed: 1 };
  }
  if (back) {
    const jog = s.speed > 2.6;
    return { clip: jog ? 'Jog_Back' : 'Walk_Back', loop: true, speed: pace(s.speed, jog ? PACE.jog : PACE.walk), turn };
  }
  if (s.speed > 5.4) return { clip: 'Sprint_Loop', loop: true, speed: pace(s.speed, PACE.sprint), turn };
  if (s.speed > 2.6) return { clip: 'Jog_Fwd_Loop', loop: true, speed: pace(s.speed, PACE.jog), turn };
  return { clip: 'Walk_Loop', loop: true, speed: pace(s.speed, PACE.walk), turn };
}

// Where the body sits, for what the clips do not cover. The clips crouch and
// swim for themselves now, so no squashing: only lifts and the ladder facing.
//   lower: metres the model is raised (swimming: the body floats at the top)
// Floating, your feet are 1.52 m below the surface (player.js). Treading
// water is upright, so the head bone wants to sit just under the waterline;
// the front crawl lies flat, just beneath it. Measured in a browser.
export const SWIM_LIFT = { still: 1.15, moving: 1.32 };
export function poseFor(stance, mode, moving) {
  if (mode === 'ladder') return { lower: 0, pitch: 0, scaleY: 1, faceWall: true };
  if (mode === 'swim') return { lower: moving ? SWIM_LIFT.moving : SWIM_LIFT.still, pitch: 0, scaleY: 1 };
  if (stance === 2) return { lower: 0.2, pitch: 0, scaleY: 1 };
  return { lower: 0, pitch: 0, scaleY: 1 };
}

// Read the state the picker wants out of a player and arsenal.
export function stateOf(player, arsenal, input) {
  const w = arsenal && arsenal.weapon;
  return {
    mode: player.mode,
    stance: player.stance,
    speed: player.mode === 'ladder' ? Math.abs(player.vel[1]) : Math.hypot(player.vel[0], player.vel[2]),
    ladderFace: player.ladder ? Math.atan2(player.ladder.face[0], player.ladder.face[1]) : null,
    forward: input ? input.moveZ : 0,
    strafe: input ? input.moveX : 0,
    onGround: player.onGround,
    vy: player.vel[1],
    armed: !!(w && w.kind === 'gun'),
    melee: !!(w && w.kind === 'melee'),
    aiming: !!(input && input.aim),
    firing: !!(arsenal && arsenal.cool > 0 && arsenal.recoil > 0.001),
    dashing: player.dashT > 0,
    traverseKind: player.traverse ? player.traverse.kind : null,
    traverseDur: player.traverse ? player.traverse.dur : 0,
    rolling: !!player.rolling,
    // a running leap, or a jump from a height, turns into a dive
    diving: !player.onGround && player.airTime > 0.12 &&
      (player.sprinting || player.vel[1] < -7) && (player.fallFrom === undefined || player.fallFrom > 2.5),
    hurt: false,
    dead: player.mode === 'dead',
    deathFace: player.deathFace,
  };
}
