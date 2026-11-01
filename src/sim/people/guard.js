// FRONTLINE - a guard (M6). Stage 1: he exists. Stage 2: he notices you.
//
// Pure logic, like the player. A guard walks a patrol route or stands at a
// post. He has an awareness of you from 0 to 1, filled by what he sees and
// hears, and a state that follows from it:
//
//   patrol      his route or post, unaware
//   suspicious  stops, turns to what he noticed ("Hm?")
//   search      walks to where you were (not where you are), looks about
//   return      walks back to his post or route
//   alert       he has seen you properly: faces you, weapon up, calls out -
//               and the guards near him come searching. (Fighting: stage 3.)
//
// Sight: a cone, a range, a clear line (glass does not block it; walls,
// doors, partitions and desks do), and how easy you are to see - distance,
// the middle of his view or the edge, standing / crouched / prone, still or
// sprinting. Hearing: your footsteps (player.noise), gunfire, blasts, kicks,
// less through walls and much less through floors. He also notices a
// colleague lying on the floor.
//
// His body is a shootable target (the range system), so every weapon, blast
// and the radar already know how to deal with him.

import { issued } from '../arms/issue.js';
import { makeTarget } from '../arms/weapons.js';

// an escort's paces: you walk at 4.3 m/s, so they must be able to
// run to keep up; how far off his way he lets you get before finding another
// (a jog of 3.8 m/s within 8 m of his place left him 10-13 m behind
// you at a walk) his pace rises with how far behind he is: your walking pace
// about 1.5 m back from his place, up to a run
export const ESCORT = { walk: 2.4, run: 5.4, gain: 1.2, drift: 2.5, replan: 1.2, out: 3.4 };
// (M6.30) a disguise: how much of you a man of that side makes out - from a way off, close to, and how much
// worse it is for you crouching or running (no one in uniform does); within `sees` metres (an officer's further) he looks twice
export const DISGUISE = { far: 0.12, close: 0.55, odd: 2.5, sees: 4, officerSees: 8 };
export const GUARD = {
  walk: 1.5,           // m/s on patrol: an unhurried walk
  search: 2.2,         // m/s going to look
  turn: 4,             // rad/s
  pause: 3,            // seconds at each point of a route
  hp: 60,
  radius: 0.3, height: 1.8,
  head: 0.3,           // the top 0.3 m is his head (a headshot)
  eye: 1.65,
};

export const SENSE = {
  range: 28,           // metres he can see anyone at all
  inner: 0.6,          // radians either side: the middle of his view
  outer: 1.05,         // radians either side: the edge of it
  fill: 1.1,           // awareness per second at an easy sight (10 m, standing, dead ahead: about a second)
  rivalFill: 3,        // times as fast for another side's man (a red, to a Yellow; a Yellow, to a red)
  decay: 0.12,         // per second, once nothing has caught his attention for a while
  hold: 1.5,           // seconds before it starts to fade
  suspicious: 0.3,
  search: 0.6,
  hearing: 16,         // metres at which a sprint (noise 1) is heard in the open
  shots: 30,           // metres at which a shot (loud 1) is heard
  lookAbout: 6,        // seconds spent looking round where he searched
  lost: 4,             // seconds after losing sight of you before he goes looking
  flankAfter: 1.2,     // (M6.29) a bold man who has lost sight of you in a fight waits this long, then goes round
  flankWide: 5,        // how far to the side of where you were he goes
  flankSpeed: 3.2,     // m/s, going round
  suppressFor: 3,      // seconds a steady man keeps firing where you went to ground
  perchShots: 5,       // rounds a marksman fires from one place before he moves to his next perch
  fallBackAt: 0.4,     // a bold man under this much of his health falls back, once,
  fallBack: 7,         // this far, away from you
  call: 20,            // metres a shout carries on the same floor (8 through a floor)
};

const STANCE_SEEN = [1, 0.55, 0.3];

// Stage 3: he fights. A carbine, fired in short bursts once he has you.
export const FIGHT = {
  react: 0.55,         // seconds between seeing you properly and the first shot
  gap: 0.11,           // seconds between rounds in a burst
  burst: [3, 5],       // rounds per burst
  pause: [0.6, 1.3],   // seconds between bursts
  mag: 30, reload: 2.4,
  damage: 9,           // a hit on you (yours hit harder: this is a game you should win)
  hitBase: 0.6,        // the chance of a hit at close range, standing still in the open
};

// What each weapon does in a guard's hands (his figures; yours are in loadout.js).
//   near/far: metres where his aim starts to fall off, and where it bottoms out
export const ARMS = {
  carbine:  { item: 'K7',  model: 'AR_1',     gap: 0.11, burst: [3, 5], pause: [0.6, 1.3], mag: 30, reload: 2.4, damage: 9,  near: 8,  far: 36, react: 0.55 },
  pistol:   { item: 'PX9', model: 'Pistol_1', gap: 0.35, burst: [1, 2], pause: [0.5, 1.0], mag: 12, reload: 1.8, damage: 11, near: 6,  far: 22, react: 0.45 },
  marksman: { item: 'LR7', model: 'Sniper_1', gap: 1.2,  burst: [1, 1], pause: [1.2, 1.8], mag: 5,  reload: 3.0, damage: 26, near: 25, far: 70, react: 0.9 },
  // the semi-automatic marksman rifle: lighter rounds, two or three in quick succession
  dmr:      { item: 'VX40', model: 'Sniper_1', gap: 0.45, burst: [1, 3], pause: [1.0, 1.5], mag: 10, reload: 2.5, damage: 17, near: 18, far: 55, react: 0.75 },
  // the Yellows: the boss's revolver - slow, heavy, near; his men's machine pistols
  revolver: { item: 'RV357', model: 'Pistol_1', gap: 0.6, burst: [1, 2], pause: [0.8, 1.3], mag: 6, reload: 2.6, damage: 16, near: 8, far: 26, react: 0.5 },
  smg:      { item: 'MP2', model: 'AR_1', gap: 0.07, burst: [4, 7], pause: [0.7, 1.2], mag: 32, reload: 1.9, damage: 7, near: 7, far: 26, react: 0.5 },
  // (the hotel) one heavy round at a time: deadly close, little use
  // across a room. No shotgun model yet: he carries the carbine's. (and drops a BR-12)
  // (the Fortress) machine guns of every weight, and rockets: the LMG carried, long bursts; the
  // HMG on its mount (he does not leave it); the rocket a slow round that bursts where it lands
  lmg:      { item: 'KR90', model: 'AR_1', gap: 0.08, burst: [7, 12], pause: [0.8, 1.4], mag: 90, reload: 5.0, damage: 8, near: 10, far: 45, react: 0.6 },
  hmg:      { item: null, model: 'AR_1', gap: 0.1, burst: [10, 16], pause: [0.9, 1.5], mag: 200, reload: 6.0, damage: 13, near: 12, far: 65, react: 0.7 },
  rocket:   { item: null, model: 'Sniper_1', gap: 3.0, burst: [1, 1], pause: [3.5, 5.5], mag: 1, reload: 4.5, damage: 0, near: 12, far: 60, react: 1.0, rocket: true },
  shotgun:  { item: 'BR12', model: 'AR_1',     gap: 0.9,  burst: [1, 1], pause: [0.7, 1.1], mag: 6,  reload: 3.2, damage: 22, near: 4,  far: 14, react: 0.5 },
  // (Rhys: comrades and enemies have classes, with their default loadouts) the classes' guns
  rv90s:    { item: 'RV90S', model: 'Sniper_1', gap: 1.5,  burst: [1, 1], pause: [1.3, 2.0], mag: 4,  reload: 3.0, damage: 28, near: 25, far: 75, react: 0.9, quiet: 0.25 },
  launcher: { item: 'KDMR3', model: 'Sniper_1', gap: 3.5,  burst: [1, 1], pause: [4.0, 6.0], mag: 1,  reload: 4.6, damage: 0,  near: 12, far: 60, react: 1.0, rocket: true },
  im8s:     { item: 'IM8S', model: 'AR_1',      gap: 0.36, burst: [1, 2], pause: [0.6, 1.0], mag: 8,  reload: 3.4, damage: 20, near: 5,  far: 16, react: 0.5 },
  v19p:     { item: 'V19P', model: 'AR_1',      gap: 0.08, burst: [3, 6], pause: [0.6, 1.1], mag: 35, reload: 1.7, damage: 7,  near: 7,  far: 26, react: 0.5 },
  hasl3:    { item: 'HASL3', model: 'AR_1',     gap: 0.1,  burst: [5, 10], pause: [0.8, 1.3], mag: 103, reload: 4.0, damage: 8, near: 10, far: 45, react: 0.55, quiet: 0.35 },
};
// Rank shows in the hat (all one uniform, so you can tell they are one side);
// an officer's shout carries further.
export const RANKS = {
  guard:    { hat: 'cap',    call: 1 },
  sergeant: { hat: 'beret',  call: 1.2 },
  officer:  { hat: 'peaked', call: 1.6 },
  specialist: { hat: 'tactical', call: 1.2 },      // the hotel's marksmen and the man at the window
};
// Temperament: a bold guard comes running to trouble; a steady one holds his
// station - he turns to face it and waits, and only goes if it is close.
export const TEMPER = {
  bold:   { answer: 1.5, leave: 99 },
  steady: { answer: 0.6, leave: 7 },
  // (Rhys: P9 "runs away at first injury"; P13 flees) he answers
  // only what is close, and the first time he is hurt he runs
  cowardly: { answer: 0.4, leave: 4, flees: true },
};

// In the dark (the hotel with its power cut): a guard sees by what
// he carries. Night vision: as by day, but a flashbang through it is far
// worse. A torch: only what its beam falls on, and anything right beside him.
// Neither: only what is right beside him.
export const DARK = { beam: 0.42, beamRange: 22, close: 4, nvgFlash: 1.6 };

// What guards say: a few ways of saying each thing, so they do not sound like
// one tape. (Spoken by the voice system; shown as subtitles as well.)
export const LINES = {
  suspicious: ['Hm? Who\'s there?', 'What was that?', 'Hello?', 'Did you hear something?'],
  search: ['I\'m going to take a look.', 'Something\'s not right. Checking it out.', 'Hold on... I\'ll look.'],
  nothing: ['Must have been nothing.', 'Nothing here. Back to it.', 'Probably the pipes again.'],
  alert: ['There! Intruder!', 'Contact! We have an intruder!', 'Got you! Over here!'],
  lost: ['Where did they go? Spread out!', 'Lost them. Keep your eyes open!', 'They\'re here somewhere. Search!'],
  manDown: ['Man down! We have an intruder!', 'Someone got to him! Search the floor!'],
  wake: ['Hey - wake up! Someone\'s here.', 'He\'s out cold! Find who did this!'],
  reload: ['Reloading!', 'Changing mag!', 'Cover me, reloading!'],
  hit: ['Argh!', 'I\'m hit!', 'Agh - hit!'],
  shotAt: ['Taking fire!', 'Where is that coming from?!'],
  hold: ['Holding here.', 'Hold position!'],
  flashed: ['Argh - my eyes!', 'I can\'t see!', 'Flashbang! I\'m blind!'],
  backup: ['Need backup here!', 'Requesting backup!'],
  radio: ['Control, contact! All units, converge on my position!', 'Control, we have an intruder - send everyone!'],
  fixing: ['Someone has been in the security system. Resetting it.', 'The system is down - I will get it back up.'],
  fixed: ['Security is back online.', 'There. The system is back up.'],
  medic: ['Man down - I am going to him!', 'Hold on - I am coming!'],
  relocate: ['Moving!', 'Changing position!'],
  fallback: ['Falling back!', 'I am hit - falling back!'],
  revived: ['Easy. You are all right. Who did this?', 'Up you get. Slowly.'],
  coming: ['On my way!', 'Coming!'],
  flee: ['I\'m out of here!', 'No - no more!', 'Fall back! Fall back!'],
  // once the building is on alert, the easy-going lines give way to these
  // (Rhys: "Probably the pipes again" in the middle of a firefight)
  suspiciousAlert: ['Movement!', 'Was that them?', 'Over there?'],
  searchAlert: ['Checking it.', 'Moving to check.', 'On it.'],
  nothingAlert: ['Clear here. Keep looking.', 'Nothing. Stay sharp.', 'They\'re still in the building. Eyes open.'],
  // a red who has seen Yellows, not you
  down: ['Got one!', 'Yellow down!', 'He\'s down.'],
  alertRival: ['Yellows! Take them down!', 'It\'s the Yellows - open fire!', 'Yellows on the floor!'],
};
// (Rhys: the Yellow boss "keeps shouting up lines like 'Target Engaged'")
// the Yellows have their own words (and none of the reds' recordings: their
// lines go out under keys of their own). A key with no Yellow line: they say nothing.
export const YELLOW_LINES = {
  alert: ['Reds! Cover the boss!', 'Here they come - drop them!', 'Reds, on the left!'],
  alertYou: ['So that is how it is.', 'He is with them - drop him!'],
  hit: ['Argh!', 'I am hit!', 'Ah - they got me!'],
  reload: ['Reloading!', 'Changing mag - cover me!'],
  manDown: ['They got one of ours!', 'Man down - the reds did this!'],
  flashed: ['I cannot see!', 'Flash - my eyes!'],
  lost: ['Where did they go?', 'Lost them. Stay close, boss.'],
  down: ['Got him.', 'Red down.', 'He is down. Stay sharp.', 'That is one less.'],
  shotAt: ['Incoming!', 'Down - they are shooting!'],
};
// A shout: guards within earshot come to look where he saw you. An officer's
// shout carries further; bold guards answer from further off; a floor
// between them cuts it to 40%. (Steady ones who answer still hold their
// station if it is far from it - see searchStep.)
// (Rhys: reds from the bar and the vault's anteroom wandered the coil) a shout about
// a fight with the Yellows (opts.rival) brings only those on his floor; a shout about you
// brings men from other floors too - by the stairs, not the coil (answering is not a chase)
// is it dark at p? ctx.dark: true (the whole place, the hotel's power cut), or (M6.28, a lighting
// circuit hacked out) a test of the place
export const darkFor = (ctx, p) => typeof ctx.dark === 'function' ? ctx.dark(p) : !!ctx.dark;
export function raiseAlarm(guards, from, pos, opts) {
  const rival = !!(opts && opts.rival);
  const everywhere = !!(opts && opts.everywhere);     // the siren (M6.28): every man of his side, on every floor
  const call = SENSE.call * (RANKS[from.rank] || RANKS.guard).call;
  const answered = [];
  for (const g of guards) {
    if (g === from || g.dead || g.state === 'alert' || g.state === 'flee') continue;
    if (from.faction && g.faction !== from.faction) continue;            // a shout brings his own side, not the other
    // (Rhys: the roof guards gathered at the top of the ladder) a man
    // who holds his floor (the roof's sentries) does not leave it for a shout
    // from another floor - he fights whoever comes up
    if ((g.holdFloor || rival) && Math.abs(g.pos[1] - from.pos[1]) > 2.2) continue;
    const reach = call * (TEMPER[g.temper] || TEMPER.bold).answer * (Math.abs(g.pos[1] - from.pos[1]) > 2.2 ? 0.4 : 1);
    if (!everywhere && Math.hypot(g.pos[0] - from.pos[0], g.pos[2] - from.pos[2]) > reach) continue;
    g.awareness = Math.max(g.awareness, 0.7);
    // each takes his own spot round it (Rhys: two guards stood inside each other)
    // the first at the spot, then six round a close ring, then a wider one
    const k = answered.length, ring = k <= 6 ? 1 : 2, i = ring === 1 ? k - 1 : k - 7;
    const ang = (i * Math.PI / 3) + (ring === 2 ? Math.PI / 6 : 0), r = ring === 1 ? 1.6 : 3.0;
    g.stim = k === 0 ? pos.slice() : [pos[0] + Math.sin(ang) * r, pos[1], pos[2] + Math.cos(ang) * r];
    g.since = 0;
    g.state = 'search'; g.stateT = 0; g.path = null; g.holding = false; g.pursuit = false;      // answering a shout is not a chase: no coil for it
    answered.push(g);
  }
  return answered;
}

// The death clip, measured in a browser: seconds in -> metres his head has
// gone back from where his feet are. For the first 0.7 s his knees buckle;
// then he topples; from 1.27 s he lies full length, head 1.2 m back.
export const FALL_CURVE = [[0.72, 0], [0.767, 0.116], [0.967, 0.7], [1.067, 1.0], [1.167, 1.187], [1.267, 1.214]];
// the moment to hold the fall so his head stops `room` metres back (null: no need)
export function slumpTime(room) {
  const c = FALL_CURVE;
  if (room >= c[c.length - 1][1]) return null;
  if (room <= c[0][1]) return c[0][0];
  for (let i = 1; i < c.length; i++) {
    if (room <= c[i][1]) {
      const [t0, d0] = c[i - 1], [t1, d1] = c[i];
      return t0 + (t1 - t0) * (room - d0) / (d1 - d0);
    }
  }
  return null;
}

// one of the ways of saying it - never the same as last time, if there is a choice
export function lineFor(key, rand, avoid) {
  const list = LINES[key] || [key];
  let pick = list[Math.floor((rand || Math.random)() * list.length) % list.length];
  if (pick === avoid && list.length > 1) pick = list[(list.indexOf(pick) + 1) % list.length];
  return pick;
}
// the alert version of a line, when the building is on alert
export const ON_ALERT = { suspicious: 'suspiciousAlert', search: 'searchAlert', nothing: 'nothingAlert' };

// The chance that one of his rounds hits you, from how he sees you.
// d: distance; you: { stance, speed }; exposed: 1 if he sees your chest and
// eye, 0.5 if only one; warm: how long he has been shooting at you.
export function hitChance(d, you, exposed, warm, arms) {
  const a = arms || ARMS.carbine;
  const far = d <= a.near ? 1 : Math.max(0.2, 1 - (d - a.near) / (a.far - a.near));
  const stance = [1, 0.75, 0.55][you.stance || 0];
  const move = you.speed > 5 ? 0.55 : you.speed > 2 ? 0.8 : 1;
  const settle = Math.min(1, 0.45 + warm * 0.35);
  return FIGHT.hitBase * far * stance * move * exposed * settle;
}

export class Guard {
  // def: { id, pos: [x, y, z], yaw, route: [[x, z], ...] (optional), pause, faction }
  constructor(world, def) {
    this.id = def.id || 'guard';
    this.faction = def.faction || 'red';
    this.rank = def.rank || 'guard';
    this.armsName = def.arms || 'carbine';
    this.arms = ARMS[this.armsName];
    // the weapon he carries (and drops): his side's, from Rhys's weapons sheet (sim/arms/issue.js)
    this.item = def.item !== undefined ? def.item : (issued(this.faction, this.armsName, this.id) || (this.arms && this.arms.item) || null);
    this.temper = def.temper || 'bold';
    // (M6.29, the roadmap's specialists) 'engineer': puts a hacked security system back on, at its
    // terminal; 'radio': once he has seen you, calls the whole place in unless he is stopped first;
    // 'medic': goes to a man knocked out and brings him round (the dead stay dead)
    this.role = def.role || null;
    this.card = def.card || null;               // (M6.28) the network whose maglocks his keycard opens (dropped when he goes down)
    // (M6.28, the roadmap's "a heavy with a shield") a ballistic shield carried in front of him: it stops
    // rounds from the front (not his head over it, nor anything from the side or behind); bodies pass it
    if (def.shield) {
      this.shield = world.addSolid([0, -999, 0], [0.1, -998.9, 0.1], 'shield', { shotOnly: true });
      this.shield.mobile = true; this.shield.person = true; this.shield.shieldOf = this;
    }
    this.sees = def.sees || null;               // 'nvg' | 'torch' | null: what he sees by in the dark
    this.fleeOn = def.fleeOn || 'hurt';         // a coward runs when hurt - or, some, at the first sign of trouble
    this.pos = def.pos.slice();
    this.yaw = def.yaw || 0;
    this.home = { pos: def.pos.slice(), yaw: this.yaw };
    this.route = def.route || null;           // null: he stands at his post
    this.pauseFor = def.pause === undefined ? GUARD.pause : def.pause;
    this.leg = this.route && this.route.length > 1 ? 1 : 0;   // he starts at the first point, heading for the next
    this.wait = this.route ? 0 : 1e9;
    this.speed = 0;
    this.dead = false;
    this.lookT = Math.random() * 6;
    // what he knows
    this.awareness = 0;
    this.state = 'patrol';
    this.stateT = 0;
    this.stim = null;                         // where his attention is
    this.since = 99;                          // seconds since anything caught his attention
    this.seeing = false;                      // can he see you this moment?
    this.path = null; this.pathI = 0;
    this.found = new Set();                   // colleagues he has found lying down
    this.events = [];                         // shots fired, for the game to draw and hear
    this.ammo = this.arms.mag; this.fireT = 0; this.burstLeft = 0; this.reloadT = 0; this.aimT = 0;
    this.lastHp = def.hp || GUARD.hp;
    this.exposed = 0;
    const b = this.box();
    this.target = makeTarget(world, b[0], b[1], { hp: def.hp || GUARD.hp, respawn: 1e9, score: 10 });
    this.target.guard = this;                 // so the range drawing leaves him alone
    this.target.headY = this.pos[1] + GUARD.height - GUARD.head;
    // a person: not climbed, vaulted or stood on
    this.target.solid.person = true;
    this.target.solid.noClimb = true;
  }

  // battle mode: a man down, brought back on as the next man in his place - the same body,
  // at his side's end, fresh (a side's few guards stand for its whole reserve). route: his lane, or none
  revive(pos, yaw, push) {
    this.pos = pos.slice(); this.yaw = yaw || 0; this.home = { pos: pos.slice(), yaw: this.yaw };
    this.route = null; this.leg = 0; this.wait = 1e9; this.push = push || null;
    this.dead = false; this.knockedOut = false; this.state = 'patrol'; this.stateT = 0; this.speed = 0;
    this.awareness = 0; this.stim = null; this.since = 99; this.seeing = false; this.exposed = 0;
    this.path = null; this.pathI = 0; this.pathGoal = null; this.repathAt = 0; this.found = new Set(); this.events.length = 0;
    this.ammo = this.arms.mag; this.fireT = 0; this.burstLeft = 0; this.reloadT = 0; this.aimT = 0;
    this.seat = null; this.seatFrom = null; this.seatTo = null; this.slump = null; this.climbing = false;
    this.cowering = false; this.dazed = false; this.blindT = 0; this.deafT = 0; this.fled = false; this.fleeTo = null;
    this.foe = null; this.lastFoe = null; this.foeDown = null; this.foeT = 0; this.hurtBy = null; this.takenDownBy = null;
    this.fightingYou = false; this.pursuit = false; this.holding = false; this.fumbleT = 0; this.wayOf = null; this.wayGen = -1;
    this.dropped = false; this.counted = false; this.deadT = 0;
    this.fellBack = false; this.relocating = null; this.flank = null; this.shotsHere = 0;
    const t = this.target;
    t.down = false; t.hp = t.maxHp; t.lethalHit = false; t.lastBy = null; t.downBy = null; t.headshot = false; t.solid.disabled = false;
    this.lastHp = t.hp;
    this.target.headY = this.pos[1] + GUARD.height - GUARD.head;
    this.moveBody();
  }

  box(pos) {
    const r = GUARD.radius, [x, y, z] = pos || this.pos;
    return [[x - r, y, z - r], [x + r, y + GUARD.height, z + r]];
  }
  get eye() { return [this.pos[0], this.pos[1] + GUARD.eye, this.pos[2]]; }

  // ctx: { world, nav, you: { pos, eye, chest, stance, speed, noise, box }, noises: [{ pos, loud }],
  //        guards, doors, bark(guard, text), alarm(guard, pos) } - or just blockers (stage 1 callers)
  step(dt, ctx) {
    if (this.dead) { this.sinkIntoSeat(dt); return; }
    if (this.jammed > 0) this.jammed = Math.max(0, this.jammed - dt);       // an EMP: his goggles or torch dark a while (sim/arms/emp.js)
    if (this.away) return;                        // gone: out of the front door and away
    this.clock = (this.clock || 0) + dt;
    if (Array.isArray(ctx) || !ctx) ctx = { blockers: ctx || [] };
    if (this.target.down) { this.die(ctx); return; }
    if (!ctx.you) this.seeing = false;          // you are down (or gone): nothing to see
    // he takes things in fifteen times a second - plenty, and ten guards'
    // worth of sight lines every frame would cost a Chromebook dearly
    this.senseT = (this.senseT || 0) + dt;
    if (ctx.you && (this.senseT >= 1 / 15 || (ctx.noises && ctx.noises.length))) { this.perceive(this.senseT, ctx); this.senseT = 0; }
    this.think(dt, ctx);
    this.moveBody();
  }

  // ── Senses ───────────────────────────────────────────────────────────────
  perceive(dt, ctx) {
    const you = ctx.you;
    // hit and still standing: he knows it came from you, and turns to find you
    if (this.target.hp < this.lastHp) {
      this.lastHp = this.target.hp;
      this.say(ctx, 'hit');
      this.awareness = Math.max(this.awareness, 0.95);
      this.stim = you.pos.slice(); this.since = 0;
      if ((TEMPER[this.temper] || TEMPER.bold).flees && !this.fled) { this.flee(ctx); return; }
      // (Rhys: shot on the roof, the captain ran back down) one who
      // has already run keeps running - he does not turn round to hunt you
      if (this.state !== 'alert' && this.state !== 'flee') { this.state = 'search'; this.stateT = 0; this.path = null; this.pursuit = this.target.lastBy === 'you'; }
    }
    const v = this.visibility(ctx);
    this.seeing = v > 0;
    let noticed = false;
    if (v > 0) {
      // (Rhys: "Yellows were very slow to react to a Red's presence") another
      // side's man in the open is no sneaking intruder: noticed three times as fast
      const rival = you && you.guard ? SENSE.rivalFill : 1;
      this.awareness = Math.min(1, this.awareness + v * SENSE.fill * rival * dt);
      this.stim = you.pos.slice(); noticed = true;
    }
    // your footsteps
    if (you.noise > 0) {
      // loudness carries with its square: a sprint 16 m, a walk 4 m, a
      // crouch-walk under half a metre - creep up behind him and he hears nothing
      const reach = you.noise * you.noise * SENSE.hearing * this.muffle(you.pos, ctx) * (this.deafT > 0 ? 0.15 : 1);
      if (this.dist3(you.pos) < reach) {
        const cap = this.seeing ? 1 : 0.62;             // a sound alone never tells him it is you
        this.awareness = Math.max(this.awareness, Math.min(cap, this.awareness + 0.9 * dt * you.noise));
        if (!this.seeing) this.stim = you.pos.slice();
        noticed = true;
      }
    }
    // gunfire, blasts, a door kicked in
    for (const n of ctx.noises || []) {
      const reach = n.loud * SENSE.shots * this.muffle(n.pos, ctx, n.loud) * (this.deafT > 0 ? 0.3 : 1);
      if (this.dist3(n.pos) < reach) {
        this.awareness = Math.max(this.awareness, n.loud >= 0.5 ? 0.7 : 0.45);
        if (!this.seeing) this.stim = n.pos.slice();
        noticed = true;
      }
    }
    // a colleague on the floor (several at once: one shout, not one each)
    let shouted = false;
    for (const g of ctx.guards || []) {
      if (g === this || !g.dead || this.found.has(g)) continue;
      // (Rhys: "Man down - the reds did this" with all three Yellows standing) a body
      // of the other side is no colleague of his: a Yellow seeing a dead red says nothing of it
      if (g.faction && this.faction && g.faction !== this.faction) continue;
      if (this.canSee([g.pos[0], g.pos[1] + 0.3, g.pos[2]], ctx, SENSE.range * 0.6)) {
        this.found.add(g);
        this.awareness = Math.max(this.awareness, 0.75);
        this.stim = g.pos.slice(); noticed = true;
        if (!shouted) { this.say(ctx, g.knockedOut ? 'wake' : 'manDown'); shouted = true; }
        if (ctx.alarm) ctx.alarm(this, g.pos);
      }
    }
    if (noticed) this.since = 0;
    else {
      this.since += dt;
      if (this.since > SENSE.hold && this.state !== 'alert') this.awareness = Math.max(0, this.awareness - SENSE.decay * dt);
    }
  }

  // how much he makes of you this moment: 0 if he cannot see you at all
  visibility(ctx) {
    const you = ctx.you;
    if (this.blindT > 0) { this.exposed = 0; return 0; }   // flashed: he sees nothing
    let best = 0, seen = 0;
    for (const p of [you.eye, you.chest]) {
      const d = this.dist3(p);
      if (d > SENSE.range) continue;
      const ang = this.angleTo(p);
      if (ang > SENSE.outer) continue;                  // behind him is behind him (Rhys: no sixth sense)
      if (darkFor(ctx, p) && !this.darkSees(d, ang)) continue;
      if (!this.clearTo(p, d, ctx)) continue;
      const cone = ang < SENSE.inner ? 1 : ang < SENSE.outer ? 0.45 : 0.3;
      const far = Math.max(0.15, Math.min(1.4, 1.4 - d / 20));
      const stance = STANCE_SEEN[you.stance || 0];
      const move = you.speed > 5 ? 1.3 : you.speed < 0.3 ? 0.75 : 1;
      // Special Camouflage: harder to make out with the naked eye, all the more prone
      const camo = you.camo ? (you.stance === 2 ? you.camo * 0.75 : you.camo) : 1;
      // (M6.30) in one of his own side's uniforms: from any way off you are one of them - close to, he looks
      // twice (an officer from further); crouching or running gives you away sooner
      let disguise = 1;
      if (you.disguise && you.disguise === this.faction) {
        const close = d < (this.rank === 'officer' ? DISGUISE.officerSees : DISGUISE.sees);
        disguise = (close ? DISGUISE.close : DISGUISE.far) * (you.stance > 0 || you.speed > 5 ? DISGUISE.odd : 1);
      }
      best = Math.max(best, cone * far * stance * move * camo * disguise);
      seen++;
    }
    this.exposed = seen >= 2 ? 1 : seen === 1 ? 0.5 : 0;
    return best;
  }

  canSee(p, ctx, range) {
    const d = this.dist3(p), ang = this.angleTo(p);
    return d < (range || SENSE.range) && ang < SENSE.outer && (!darkFor(ctx, p) || this.darkSees(d, ang)) && this.clearTo(p, d, ctx);
  }
  // in the dark: can he make out something d metres off, ang off his nose?
  darkSees(d, ang) {
    if (d < DARK.close) return true;
    if (this.jammed > 0) return false;
    if (this.sees === 'nvg') return true;
    if (this.sees === 'torch') return ang < DARK.beam && d < DARK.beamRange;
    return false;
  }
  angleTo(p) {
    const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
    const dx = p[0] - this.pos[0], dz = p[2] - this.pos[2], l = Math.hypot(dx, dz) || 1;
    return Math.acos(Math.max(-1, Math.min(1, (dx * fx + dz * fz) / l)));
  }
  clearTo(p, d, ctx) {
    const e = this.eye, dir = [(p[0] - e[0]) / d, (p[1] - e[1]) / d, (p[2] - e[2]) / d];
    // a smoke cloud in the way hides whatever is behind it
    for (const c of ctx.smokes || []) {
      const v = [c.pos[0] - e[0], c.pos[1] - e[1], c.pos[2] - e[2]];
      const along = Math.max(0, Math.min(d, v[0] * dir[0] + v[1] * dir[1] + v[2] * dir[2]));
      const off = Math.hypot(v[0] - dir[0] * along, v[1] - dir[1] * along, v[2] - dir[2] * along);
      if (off < c.r) return false;
    }
    const hit = ctx.world.raycast(e, dir, d, (s) => s.glass || s.person || s.shootThrough || s === this.target.solid);
    return !hit || hit.t > d - 0.35;
  }
  // how well a sound carries to him: a floor between you smothers it, a wall
  // dulls it - footsteps a lot, a gunshot much less (loud: how loud it was)
  muffle(p, ctx, loud) {
    if (Math.abs(p[1] - this.pos[1]) > 2.2) return 0.3;
    const q = [p[0], p[1] + 1, p[2]], d = this.dist3(q);
    if (d < 0.5) return 1;
    return this.clearTo(q, d, ctx) ? 1 : loud >= 0.5 ? 0.8 : 0.5;
  }
  dist3(p) { return Math.hypot(p[0] - this.pos[0], (p[1] - this.pos[1]) * 1.5, p[2] - this.pos[2]); }

  // A flashbang went off at pos. With a clear line to it he is blinded - the
  // nearer, the longer, and worse if he was looking at it - and deafened a
  // little longer. A wall between them spares him. (Rhys: flashbangs alerted
  // guards but did not disorient them.)
  flash(pos, radius, blind, ctx) {
    if (this.dead) return 0;
    const e = this.eye, d = Math.hypot(pos[0] - e[0], pos[1] - e[1], pos[2] - e[2]);
    if (d > radius) return 0;
    if (d > 0.5 && !this.clearTo(pos, d, ctx)) return 0;
    const facing = this.angleTo(pos) < SENSE.outer ? 1 : 0.55;
    const t = blind * Math.sqrt(1 - d / radius) * facing * (darkFor(ctx, this.pos) && this.sees === 'nvg' ? DARK.nvgFlash : 1);
    if (t < 0.4) return 0;
    this.blindT = Math.max(this.blindT || 0, t);
    this.deafT = Math.max(this.deafT || 0, t * 1.3);
    this.seeing = false;
    this.awareness = Math.max(this.awareness, 0.8);
    this.stim = pos.slice(); this.since = 0;
    this.say(ctx, 'flashed');
    return t;
  }

  // ── What he does about it ───────────────────────────────────────────────
  setState(s, ctx, key) {
    if (this.state === s) return;
    this.state = s; this.stateT = 0; this.path = null; this.holding = false;
    // a search straight out of a fight is a pursuit: it may change floors
    // (Rhys: the two reds STILL on the coil - "they DON'T do it if you don't meet
    // the Yellows") a fight with a Yellow, lost sight of, had counted as a chase too: only you do
    if (s === 'search') this.pursuit = key === 'lost' && !!this.fightingYou;
    else if (s !== 'alert') this.pursuit = false;
    if (key) this.say(ctx, key);
  }
  say(ctx, key) {
    if (!ctx.bark) return;
    const rival = ctx.you && ctx.you.guard;            // up against another guard, not you
    if (this.faction === 'yellow' && ctx.yellowLines) {
      const k = key === 'alert' && !rival ? 'alertYou' : key, list = YELLOW_LINES[k];
      if (!list) return;
      ctx.bark(this, list[Math.floor((ctx.random || Math.random)() * list.length) % list.length], 'y_' + k);
      return;
    }
    if (key === 'alert' && rival) key = 'alertRival';
    if (ctx.alerted && ON_ALERT[key]) key = ON_ALERT[key];
    ctx.bark(this, lineFor(key, ctx.random, ctx.lastLine && ctx.lastLine[key]), key);
  }

  think(dt, ctx) {
    this.stateT += dt;
    this.speed = 0;
    if (this.deafT > 0) this.deafT -= dt;
    if (this.blindT > 0) {
      // staggering, hands to his face: no looking, no shooting, no walking
      this.blindT -= dt;
      this.dazed = true;
      if (this.blindT <= 0) {
        this.dazed = false;
        // sight back: he goes to where it came from
        if (this.state !== 'alert' && this.state !== 'flee') { this.state = 'search'; this.stateT = 0; this.path = null; }
      }
      return;
    }
    this.dazed = false;
    const a = this.awareness;
    // seen properly: an alert
    if (this.seeing && a >= 1 && this.state !== 'alert' && this.state !== 'flee' && this.fleeOn === 'alert' && (TEMPER[this.temper] || {}).flees && !this.fled) { this.flee(ctx); return; }
    if (this.seeing && a >= 1 && this.state !== 'alert' && this.state !== 'flee') {
      this.fightingYou = !ctx.you.guard;
      this.setState('alert', ctx, 'alert');
      this.aimT = 0;
      if (ctx.alarm) ctx.alarm(this, ctx.you.pos, { rival: !!ctx.you.guard });
    }
    // (Rhys: the Yellows "move out from the Businessman's Suite, and
    // start fighting any Reds they see. They'll follow you up to the Cash
    // Vault ... and out through the front door") an escort: unless he is in a
    // fight, he keeps with you - or walks where he has been told to
    // a fallen foe is news only to a man still in the fight: not saved up for later
    if (this.foeDown && this.state !== 'alert') this.foeDown = null;
    if (this.escort && this.state !== 'alert' && this.state !== 'flee') { if (this.state !== 'escort') { this.state = 'escort'; this.stateT = 0; this.path = null; } this.escortStep(dt, ctx); return; }
    switch (this.state) {
      case 'patrol':
        if (a >= SENSE.search) this.setState('search', ctx, 'search');
        else if (a >= SENSE.suspicious) this.setState('suspicious', ctx, 'suspicious');
        else this.patrol(dt, ctx);
        break;
      case 'suspicious':
        if (this.stim) this.turnTo(this.faceAngle(this.stim), dt);
        if (a >= SENSE.search || (this.stateT > 2.5 && a >= SENSE.suspicious)) this.setState('search', ctx, 'search');
        else if (a < 0.1 && this.stateT > 3) this.setState('return', ctx, 'nothing');
        break;
      case 'search':
        this.searchStep(dt, ctx);
        break;
      case 'return':
        if (a >= SENSE.suspicious) { this.setState('suspicious', ctx, 'suspicious'); break; }
        if (this.goTo(this.home.pos, GUARD.walk, dt, ctx)) {
          this.state = 'patrol'; this.stateT = 0;
          if (!this.route) this.yaw = this.home.yaw;
        }
        break;
      case 'flee':
        // a planned way out (the captain's): step by step
        if (this.escape && this.escapeI < this.escape.length) { this.escapeStep(dt, ctx); break; }
        // running from you: to the furthest spot he knows, then he cowers there
        // (he shoots back only if you come right up to him)
        if (this.fleeTo && this.goTo(this.fleeTo, GUARD.search * 1.4, dt, ctx)) { this.fleeTo = null; this.cowering = true; }
        if (this.cowering && this.seeing && this.dist3(ctx.you.pos) < 6) { this.turnTo(this.faceAngle(ctx.you.pos), dt * 2); this.fight(dt, ctx); }
        else if (this.cowering && ctx.you) this.turnTo(this.faceAngle(ctx.you.pos), dt);
        break;
      case 'alert':
        // (M6.29, "a marksman who relocates") a marksman who has given his place away moves on to his next perch
        // (M6.29, "fall back") a bold man badly hurt in a fight with you falls back - once - away from you
        if (!this.fellBack && this.fightingYou && this.temper === 'bold' && ctx.nav && ctx.you && this.target.hp < this.target.maxHp * SENSE.fallBackAt) {
          this.fellBack = true;
          const dx = this.pos[0] - ctx.you.pos[0], dz = this.pos[2] - ctx.you.pos[2], d = Math.hypot(dx, dz) || 1;
          this.relocating = [this.pos[0] + dx / d * SENSE.fallBack, this.pos[1], this.pos[2] + dz / d * SENSE.fallBack]; this.path = null;
          this.say(ctx, 'fallback');
        }
        if (this.relocating) { if (this.goTo(this.relocating, SENSE.flankSpeed, dt, ctx)) { this.relocating = null; this.shotsHere = 0; this.path = null; } else break; }
        if (this.seeing) { this.fightingYou = !ctx.you.guard; this.turnTo(this.faceAngle(ctx.you.pos), dt * 2); this.stateT = 0; this.flank = null; this.fight(dt, ctx); }
        else {
          this.aimT = 0;
          this.reloading(dt, ctx);
          // (M6.29, the roadmap's "guards that flank") a bold man fighting you, who has lost you behind
          // something, does not stand and wait: he goes round - to one side of where you were (each man
          // his own side), then on to where you were
          if (this.flankStep(dt, ctx)) break;
          // (M6.29, "suppress") a steady man keeps firing where you went to ground, a few seconds, to pin you there
          this.suppress(dt, ctx);
          // (Rhys: when a red was killed the Yellows said "Lost him" / "Where
          // did he go?") the one he was fighting is down, not gone: he says so, and stands
          // down - back to the escort, or back to his post - with no searching for a dead man
          if (this.foeDown) {
            this.foeDown = null;
            this.say(ctx, 'down');
            if (this.escort) { this.state = 'escort'; this.stateT = 0; this.path = null; }
            else { this.awareness = Math.min(this.awareness, 0.5); this.setState('return', ctx); }
            break;
          }
          if (this.stateT > SENSE.lost) {
            this.awareness = 0.8;
            this.setState('search', ctx, 'lost');
          }
        }
        break;
    }
  }

  // escort: e.goto - walk there (nav). (Rhys: the Yellows
  // "follow your exact steps around everywhere ... they need to not do that;
  // also, they're much slower than you") e.lead - keep with you by the
  // shortest way, not the way you went: straight at you while the floor
  // between is open (the nav grid: furniture is in the way, as it is for you),
  // otherwise along a found way, shared by the three of them (e.way) and found
  // afresh only when you have moved well off its end. e.path - walk a way
  // given (out of the building).
  escortStep(dt, ctx) {
    const e = this.escort;
    if (e.goto) {
      // in arm's reach of it is there (you in front of the plinth had kept the boss waiting behind you)
      if (e.reach && Math.hypot(e.goto[0] - this.pos[0], e.goto[2] - this.pos[2]) < e.reach && Math.abs(e.goto[1] - this.pos[1]) < 1) { this.speed = 0; this.turnTo(this.faceAngle(e.goto), dt); e.arrived = true; return; }
      if (this.goTo(e.goto, GUARD.search, dt, ctx)) e.arrived = true;
      return;
    }
    if (e.lead) { this.followLead(dt, e, ctx); return; }
    if (e.path && this.walkWay(dt, e.path, ESCORT.out, ctx)) e.reached = true;
  }
  followLead(dt, e, ctx) {
    const you = ctx.lead;
    if (!you) return 'there';
    const flat = Math.hypot(you[0] - this.pos[0], you[2] - this.pos[2]);
    const nav = ctx.nav;
    // (on a floor himself: half way up a stair, the floor above is not his to cross)
    const same = Math.abs(you[1] - this.pos[1]) < 0.6 && (!nav || !!nav.onFloor(this.pos));
    const sees = same && this.walkable(this.pos, [you[0], this.pos[1], you[2]], ctx);
    if (sees && flat <= e.lag) {
      this.speed = 0; this.wayGen = -1; this.spread(dt, ctx);
      if (flat > 0.3) this.turnTo(this.faceAngle(you), dt);
      return 'there';
    }
    const pace = (left) => Math.min(ESCORT.run, ESCORT.walk + Math.max(0, left - e.lag) * ESCORT.gain);
    if (sees) { this.stepTo([you[0], this.pos[1], you[2]], pace(flat), dt, ctx, flat - e.lag); this.wayGen = -1; return false; }
    // round a corner, up a floor: the way. One way, found by whichever of
    // them needs it first, for all three while they keep together; (
    // two had followed a way found from where the third stood, and fell a
    // floor behind) one who is not near it finds his own.
    const shared = e.way || (e.way = { path: null, goal: null, t: -1e9, gen: 0 });
    const own = this.ownWay || (this.ownWay = { path: null, goal: null, t: -1e9, gen: 0, own: true });
    const keep = (w) => {
      if (!nav) { w.path = [you.slice()]; w.goal = you.slice(); w.gen++; return; }
      const off = !w.goal || Math.hypot(you[0] - w.goal[0], (you[1] - w.goal[1]) * 2, you[2] - w.goal[2]);
      if (w.path && off > 0.8 && off <= ESCORT.drift) {
        // a step or two on from its end, in plain sight of it: the way only grows
        const end = w.path[w.path.length - 1];
        if (Math.abs(end[1] - you[1]) < 0.6 && this.walkable(end, [you[0], end[1], you[2]], ctx)) { w.path.push([you[0], end[1], you[2]]); w.goal = you.slice(); }
      }
      const stale = !w.path || Math.hypot(you[0] - w.goal[0], (you[1] - w.goal[1]) * 2, you[2] - w.goal[2]) > ESCORT.drift;
      if (stale && this.clock - w.t > ESCORT.replan && (!ctx.pathBudget || ctx.pathBudget.left-- > 0)) {
        w.t = this.clock;
        const p = nav.find(this.pos, you);
        if (p && p.length) { w.path = p; w.goal = you.slice(); w.gen++; }
      }
    };
    let w = this.onOwn ? own : shared;
    keep(w);
    if (!w.path) { this.speed = 0; return false; }
    if (this.wayOf !== w || this.wayGen !== w.gen) {
      // onto the way: the nearest point of it
      this.wayOf = w; this.wayGen = w.gen; this.wayI = 0;
      let bd = Infinity;
      for (let j = 0; j < w.path.length; j++) { const q = w.path[j], d = Math.hypot(q[0] - this.pos[0], (q[1] - this.pos[1]) * 2, q[2] - this.pos[2]); if (d < bd) { bd = d; this.wayI = j; } }
      const q = w.path[this.wayI];
      const near = bd < 2.5 && (Math.abs(q[1] - this.pos[1]) > 0.1 || this.walkable(this.pos, q, ctx));
      if (!w.own && !near) { this.onOwn = true; own.t = -1e9; own.path = null; this.wayOf = null; return false; }
      if (w.own && near && shared.path && shared.gen !== this.leftShared) { this.onOwn = false; this.leftShared = shared.gen; }
    }
    // how far he is from you along the way (to its point ahead, along it, and on from its end to you)
    const P = w.path, q0 = P[Math.min(this.wayI, P.length - 1)], end = P[P.length - 1];
    let left = Math.hypot(q0[0] - this.pos[0], q0[1] - this.pos[1], q0[2] - this.pos[2]);
    for (let j = this.wayI; j + 1 < P.length; j++) left += Math.hypot(P[j + 1][0] - P[j][0], P[j + 1][1] - P[j][1], P[j + 1][2] - P[j][2]);
    left += Math.hypot(you[0] - end[0], you[1] - end[1], you[2] - end[2]);
    // (all three had stood on the one spot at the way's end) each stops at his own distance
    // (never stopped half way up a stair: on it, he carries on to its end)
    const onStair = nav && !nav.onFloor(this.pos) && (() => { const o = nav.onLink(this.pos); return o && !o.l.via; })();
    if (left <= e.lag && !onStair) { this.speed = 0; this.spread(dt, ctx); return 'there'; }
    this.leftToYou = left;
    // in single file, not walking through the man in front
    let sp = pace(left);
    for (const o of ctx.guards || []) {
      if (o === this || o.dead || o.away || !o.escort || !o.escort.lead || !(o.leftToYou < left)) continue;
      if (Math.hypot(o.pos[0] - this.pos[0], (o.pos[1] - this.pos[1]) * 2, o.pos[2] - this.pos[2]) < 0.8) sp = Math.min(sp, (o.speed || 0) * 0.8);
    }
    this.walkWay(dt, P, sp, ctx, true);
    return false;
  }
  // standing about: not on top of another man (Rhys: two Yellows "collided")
  spread(dt, ctx) {
    if (ctx.nav && !ctx.nav.onFloor(this.pos)) return;          // not on a stair or the ramp's slope
    for (const o of ctx.guards || []) {
      if (o === this || o.dead || o.away || Math.abs(o.pos[1] - this.pos[1]) > 0.5) continue;
      let dx = this.pos[0] - o.pos[0], dz = this.pos[2] - o.pos[2], d = Math.hypot(dx, dz);
      if (d >= 0.75) continue;
      if (d < 1e-3) { const a = (this.id > o.id ? 1 : -1) * 1.3 + this.yaw; dx = Math.cos(a); dz = Math.sin(a); d = 1; }
      const step = Math.min(0.75 - d, 0.9 * dt), to = [this.pos[0] + dx / d * step, this.pos[1], this.pos[2] + dz / d * step];
      if (this.walkable(this.pos, to, ctx)) { this.pos[0] = to[0]; this.pos[2] = to[2]; }
    }
  }
  // can he walk straight from a to b (one floor)? The nav grid's cells are
  // half a metre: a line between open cells can still clip a table's corner,
  // so his body's width is tried against what is really there, at the knee
  // and at the waist (a door is not in the way: he opens it)
  walkable(a, b, ctx) {
    if (Math.abs(a[1] - b[1]) > 0.1) return false;
    if (ctx.nav && !ctx.nav.clearLine(a, b)) return false;
    if (!ctx.world) return true;
    const dx = b[0] - a[0], dz = b[2] - a[2], len = Math.hypot(dx, dz);
    if (len < 0.05) return true;
    const ux = dx / len, uz = dz / len, side = GUARD.radius;
    const skip = (q) => q.person || q.target || q.tag === 'hdoor' || q.shotOnly || q === this.target.solid;
    for (const off of [-side, 0, side]) for (const h of [0.45, 1.0]) {
      const o = [a[0] - uz * off, a[1] + h, a[2] + ux * off];
      if (ctx.world.raycast(o, [ux, 0, uz], len, skip)) return false;
    }
    return true;
  }
  // along pts from this.wayI, cutting ahead wherever the floor is open; true at the end
  walkWay(dt, pts, speed, ctx, keepI) {
    if (!keepI && this.wayPts !== pts) { this.wayPts = pts; this.wayI = 0; }
    if (!pts.length) return true;
    let i = Math.min(this.wayI || 0, pts.length - 1);
    const at = (q) => Math.hypot(q[0] - this.pos[0], (q[1] - this.pos[1]) * 2, q[2] - this.pos[2]);
    // past a point once on it - or nearly, if the next is in a clear line (no cutting a table's corner)
    while (i + 1 < pts.length && (at(pts[i]) < 0.12 || (at(pts[i]) < 0.5 && this.walkable(this.pos, pts[i + 1], ctx)))) i++;
    if (ctx.nav) for (let j = Math.min(pts.length - 1, i + 6); j > i; j--) {
      if (Math.abs(pts[j][1] - this.pos[1]) < 0.05 && Math.abs(pts[i][1] - this.pos[1]) < 0.05 && this.walkable(this.pos, pts[j], ctx)) { i = j; break; }
    }
    this.wayI = i;
    if (i === pts.length - 1 && at(pts[i]) < 0.35) { this.speed = 0; return true; }
    this.stepTo(pts[i], speed, dt, ctx);
    return false;
  }
  // a step toward q (climbing as he goes); stops short by `short` metres if given
  stepTo(q, speed, dt, ctx, room) {
    const dx = q[0] - this.pos[0], dy = q[1] - this.pos[1], dz = q[2] - this.pos[2], d = Math.hypot(dx, dy, dz);
    if (d < 1e-3) return;
    if (Math.hypot(dx, dz) > 0.05) this.turnTo(Math.atan2(-dx, -dz), dt * 2);
    this.openDoors(ctx);
    const stepLen = Math.min(d, speed * dt, room === undefined ? Infinity : Math.max(0, room));
    const nx = this.pos[0] + dx / d * stepLen, nz = this.pos[2] + dz / d * stepLen;
    if (this.bumps(nx, nz, ctx)) return;
    this.pos[0] = nx; this.pos[1] += dy / d * stepLen; this.pos[2] = nz;
    // off a stair's end onto the floor: on it, not a hand's breadth above or below
    if (ctx.nav && Math.abs(dy) > 1e-3) { const c = ctx.nav.onFloor(this.pos); if (c && Math.abs(q[1] - ctx.nav.floors[c.f].y) < 1e-3) this.pos[1] = q[1]; }
    this.speed = speed;
  }

  // ── Stage 4: takedowns ───────────────────────────────────────────────────
  // Can you take him down from where you stand? Close (1.5 m), on his level,
  // and either behind him (outside 110 degrees of where he looks) while he has
  // not got you in his sights - or he is blinded, when any side will do.
  canBeTakenDown(you, world) {
    if (this.dead || this.dormant) return false;      // (not yet there - the train's hijackers)
    if (Math.abs(you[1] - this.pos[1]) > 1) return false;
    const dx = you[0] - this.pos[0], dz = you[2] - this.pos[2], d = Math.hypot(dx, dz);
    if (d > 1.5 || d < 0.05) return false;
    // your arm has to reach him: not through a shut door, a wall or a pane of glass
    if (world) {
      const from = [you[0], you[1] + 0.9, you[2]], to = [this.pos[0], this.pos[1] + 0.9, this.pos[2]];
      const len = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
      const dir = [(to[0] - from[0]) / len, (to[1] - from[1]) / len, (to[2] - from[2]) / len];
      const hit = world.raycast(from, dir, Math.max(0.05, len - 0.1), (s) => s.person || s === this.target.solid);
      if (hit) return false;
    }
    if (this.dazed) return true;
    if (this.state === 'alert' || this.seeing) return false;
    const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
    return Math.acos(Math.max(-1, Math.min(1, (dx * fx + dz * fz) / d))) > 1.92;
  }
  // taken down: lethal with a blade, otherwise choked out (knocked out)
  takenDown(lethal) {
    this.target.hp = 0; this.target.down = true;
    this.target.downBy = lethal ? 'blade' : 'fist';
    if (lethal) this.target.lethalHit = true;
    this.takenDownBy = lethal ? 'knife' : 'hands';
  }

  // ── Stage 3: shooting ────────────────────────────────────────────────────
  // He has you in sight: after a moment to react, bursts, with pauses, until
  // the magazine is empty; then a reload (and he says so).
  fight(dt, ctx) {
    this.aimT += dt;
    if (this.reloading(dt, ctx)) return;
    const A = this.arms;
    if (this.aimT < A.react) return;
    this.fireT -= dt;
    if (this.fireT > 0) return;
    const rand = ctx.random || Math.random;
    if (this.burstLeft <= 0) this.burstLeft = A.burst[0] + Math.floor(rand() * (A.burst[1] - A.burst[0] + 1));
    const shot = this.shoot(ctx, rand);
    this.ammo--;
    if (shot === 'blocked') return;
    this.burstLeft--;
    if (this.perches && this.perches.length && (this.shotsHere = (this.shotsHere || 0) + 1) >= SENSE.perchShots && this.burstLeft <= 0) {
      this.perchI = ((this.perchI || 0) + 1) % this.perches.length;
      this.relocating = this.perches[this.perchI].slice(); this.path = null; this.say(ctx, 'relocate');
    }
    if (this.ammo <= 0) { this.reloadT = A.reload; this.say(ctx, 'reload'); this.burstLeft = 0; return; }
    this.fireT = this.burstLeft > 0 ? A.gap : A.pause[0] + rand() * (A.pause[1] - A.pause[0]);
  }
  reloading(dt) {
    if (this.reloadT <= 0) return false;
    this.reloadT -= dt;
    if (this.reloadT <= 0) this.ammo = this.arms.mag;
    return this.reloadT > 0;
  }
  // one round: at you, a hit or a miss nearby (the game draws the tracer,
  // hurts you, and marks where a miss lands)
  shoot(ctx, rand) {
    const you = ctx.you;
    const from = [this.pos[0] - Math.sin(this.yaw) * 0.45, this.pos[1] + 1.4, this.pos[2] - Math.cos(this.yaw) * 0.45];
    const d = this.dist3(you.chest);
    // (Rhys: "it seems they can shoot me through bulletproof glass?")
    // He sees through glass (sight passes it), and a hit was rolled on that
    // alone. Now the round has to get there: anything it cannot go through
    // between his muzzle and you - bulletproof glass, a wall - stops it, and
    // he holds his fire a moment, seeing it strike the pane.
    const dir = [you.chest[0] - from[0], you.chest[1] - from[1], you.chest[2] - from[2]], len = Math.hypot(...dir) || 1;
    const way = dir.map((v) => v / len);
    const own = this.target && this.target.solid, theirs = you.solid;
    const block = ctx.world.raycast(from, way, len - 0.35, (s) => s.person || s.shootThrough || s === own || s === theirs || s.target || (s.tough !== undefined && s.tough <= 1));
    if (block) {
      const at = [from[0] + way[0] * block.t, from[1] + way[1] * block.t, from[2] + way[2] * block.t];
      this.events.push({ type: 'shot', from, to: at, hit: false, blocked: true, solid: block.solid, damage: 0, noise: 1, arms: this.armsName, at: you.guard || null });
      this.burstLeft = 0; this.fireT = 1.2 + rand() * 0.8;
      return 'blocked';
    }
    const hit = rand() < hitChance(d, you, this.exposed || 0.5, this.aimT - this.arms.react, this.arms);
    // a miss goes past you: up to a metre and a bit off, further the further he is
    const spread = hit ? 0 : 0.5 + Math.min(1.2, d * 0.04);
    const to = hit ? you.chest.slice() : [you.chest[0] + (rand() - 0.5) * 2 * spread, you.chest[1] + (rand() - 0.3) * spread, you.chest[2] + (rand() - 0.5) * 2 * spread];
    this.events.push({ type: 'shot', from, to, hit, damage: hit ? this.arms.damage : 0, noise: 1, arms: this.armsName, at: you.guard || null });
  }

  suppress(dt, ctx) {
    if (ctx.flank === false || this.temper !== 'steady' || !this.fightingYou || this.foeDown || !this.stim || this.stateT > SENSE.suppressFor) return;
    if (this.reloadT > 0 || this.ammo <= 0) return;
    this.fireT -= dt;
    if (this.fireT > 0) return;
    const A = this.arms, rand = ctx.random || Math.random;
    if (this.burstLeft <= 0) this.burstLeft = A.burst[0] + Math.floor(rand() * (A.burst[1] - A.burst[0] + 1));
    this.turnTo(this.faceAngle(this.stim), dt * 2);
    const from = [this.pos[0] - Math.sin(this.yaw) * 0.45, this.pos[1] + 1.4, this.pos[2] - Math.cos(this.yaw) * 0.45];
    const to = [this.stim[0] + (rand() - 0.5) * 1.6, this.stim[1] + 0.6 + rand() * 0.9, this.stim[2] + (rand() - 0.5) * 1.6];
    // into whatever you went behind: the round stops there
    const dir = [to[0] - from[0], to[1] - from[1], to[2] - from[2]], len = Math.hypot(...dir) || 1;
    const block = ctx.world.raycast(from, dir.map((v) => v / len), len, (s) => s.person || s.shootThrough || s === (this.target && this.target.solid) || s.target);
    const at = block ? [from[0] + dir[0] / len * block.t, from[1] + dir[1] / len * block.t, from[2] + dir[2] / len * block.t] : to;
    this.events.push({ type: 'shot', from, to: at, hit: false, blocked: !!block, solid: block ? block.solid : null, damage: 0, noise: 1, arms: this.armsName, at: null, suppress: true });
    this.ammo--; this.burstLeft--;
    if (this.ammo <= 0) { this.reloadT = A.reload; this.say(ctx, 'reload'); this.burstLeft = 0; return; }
    this.fireT = this.burstLeft > 0 ? A.gap : A.pause[0] + rand() * (A.pause[1] - A.pause[0]);
  }
  flankStep(dt, ctx) {
    if (ctx.flank === false || this.temper !== 'bold' || !this.fightingYou || this.foeDown || !this.stim || !ctx.nav || this.escort || this.holdFloor) return false;
    if (this.stateT < SENSE.flankAfter) return false;
    if (!this.flank) {
      // which side: his own, by his name (so two men go two ways)
      let h = 0; for (let i = 0; i < this.id.length; i++) h = (h * 31 + this.id.charCodeAt(i)) | 0;
      const side = h & 1 ? 1 : -1;
      const dx = this.stim[0] - this.pos[0], dz = this.stim[2] - this.pos[2], d = Math.hypot(dx, dz) || 1;
      const px = -dz / d * side, pz = dx / d * side;
      const at = [this.stim[0] + px * SENSE.flankWide - dx / d * 1.5, this.stim[1], this.stim[2] + pz * SENSE.flankWide - dz / d * 1.5];
      this.flank = { at, done: false, side };
      this.path = null;
    }
    const goal = this.flank.done ? this.stim : this.flank.at;
    const there = this.goTo(goal, SENSE.flankSpeed, dt, ctx);
    if (there) { if (!this.flank.done) { this.flank.done = true; this.path = null; } else return false; }
    // a way round that cannot be found: give it up, and wait as before
    if (!this.path && this.repathAt > this.clock + 1.5 && !this.flank.done) { this.flank.done = true; }
    return true;
  }

  searchStep(dt, ctx) {
    if (!this.stim) { this.setState('return', ctx); return; }
    // a steady man does not leave his station for something far off: he faces
    // it, weapon ready, and waits for it to come to him
    const steady = this.temper === 'steady';
    if (Math.hypot(this.stim[0] - this.home.pos[0], this.stim[2] - this.home.pos[2]) > TEMPER[this.temper].leave ||
        (steady && Math.abs(this.stim[1] - this.home.pos[1]) > 2)) {
      if (Math.hypot(this.pos[0] - this.home.pos[0], this.pos[2] - this.home.pos[2]) > 0.6) { this.goTo(this.home.pos, GUARD.search, dt, ctx); return; }
      if (!this.holding) { this.holding = true; this.say(ctx, 'hold'); }
      this.turnTo(this.faceAngle(this.stim), dt);
      if (this.stateT > SENSE.lookAbout * 1.5 && this.since > SENSE.lookAbout) {
        this.awareness = Math.min(this.awareness, 0.2);
        this.state = 'patrol'; this.stateT = 0; this.path = null;
        if (!this.route) this.yaw = this.home.yaw;
      }
      return;
    }
    // somewhere new caught his ear or eye: go there instead
    if (this.path && this.pathGoal && Math.hypot(this.stim[0] - this.pathGoal[0], this.stim[2] - this.pathGoal[2]) > 2.5) this.path = null;
    const arrived = this.goTo(this.stim, GUARD.search, dt, ctx);
    if (!arrived) return;
    // look about where you were
    this.lookT += dt;
    this.turnTo(this.yaw + 1.2, dt * 0.5);
    if (this.stateT > SENSE.lookAbout && this.since > SENSE.lookAbout * 0.5) {
      this.awareness = Math.min(this.awareness, 0.2);
      this.setState('return', ctx, 'nothing');
    }
  }

  // (Rhys: "happy for Reds to be able to follow you up/down the coil and across
  // floors") everyone may take the coil again; a red keeps off it only by having no reason
  // to be on it - none starts or patrols there. (The nav still offers opts.noRamp.)
  // (Rhys: two reds "randomly on the coil ... SO far from their posts") but a noise
  // or a glimpse is not reason enough to set off round the coil: a search keeps off it - only
  // a man after you (out of a fight with you, or shot by you: this.pursuit) takes it,
  // and anyone going back to his post. Stairs are another matter (Level 0's searches use them).
  navOpts() { return this.faction !== 'yellow' && (this.state === 'search' || this.state === 'suspicious') && !this.pursuit ? { noRamp: true } : null; }

  // walk a found path to a point; true once there (or if there is no way)
  goTo(p, speed, dt, ctx) {
    if (Math.hypot(p[0] - this.pos[0], p[2] - this.pos[2]) < 0.6 && Math.abs(p[1] - this.pos[1]) < 1) return true;
    if (!this.path) {
      // route-finding is the dearest thing a guard does: at most one route in
      // the whole building per frame (ctx.pathBudget), and he re-plans at most
      // once a second; until then he stands (Rhys: frame rate)
      if (ctx.nav) {
        if (this.clock < (this.repathAt || 0)) return false;
        // (Rhys: "Hit 1 FPS") on a big map, a man does not plan a route to somewhere far off - and one that
        // found no way waits a while before he tries again (a search with no answer is the dearest of all)
        if (ctx.chaseMax && Math.hypot(p[0] - this.pos[0], p[2] - this.pos[2]) > ctx.chaseMax) { this.repathAt = this.clock + 2; return false; }
        if (ctx.pathBudget) { if (ctx.pathBudget.left <= 0) return false; ctx.pathBudget.left--; }
        this.repathAt = this.clock + 1;
      }
      this.path = ctx.nav ? ctx.nav.find(this.pos, p, this.navOpts()) : [p.slice()];
      this.pathI = 0; this.pathGoal = p.slice();
      if (!this.path || !this.path.length) { this.path = null; if (ctx.nav) this.repathAt = this.clock + 4 + ((this.clock * 7.3) % 2); return true; }
    }
    const q = this.path[Math.min(this.pathI, this.path.length - 1)];
    const dx = q[0] - this.pos[0], dy = q[1] - this.pos[1], dz = q[2] - this.pos[2];
    const flat = Math.hypot(dx, dz), d = Math.hypot(flat, dy);
    if (d < 0.15) {
      this.pathI++;
      if (this.pathI >= this.path.length) { this.path = null; return true; }
      return false;
    }
    if (flat > 0.05) this.turnTo(Math.atan2(-dx, -dz), dt);
    this.openDoors(ctx);
    const step = Math.min(d, speed * dt);
    const nx = this.pos[0] + dx / d * step, nz = this.pos[2] + dz / d * step;
    if (this.bumps(nx, nz, ctx)) return false;              // you are in his way: he waits
    this.pos[0] = nx; this.pos[1] += dy / d * step; this.pos[2] = nz;
    this.speed = speed;
    return false;
  }

  // shut doors in reach open as he walks up to them
  openDoors(ctx) {
    for (const d of ctx.doors || []) {
      if (d.open || d.blown) continue;
      const c = d.centre;
      if (Math.abs(c[1] - (this.pos[1] + 1.04)) > 1.3) continue;
      // a locked reinforced door is for the keycard or a charge: a guard walking past does not open it
      if (d.locked && d.def.build === 'reinforced') continue;
      if (Math.hypot(c[0] - this.pos[0], c[2] - this.pos[2]) < 1.0) { d.unlock(); d.use(this.pos, this.box()); }
    }
  }

  bumps(nx, nz, ctx) {
    const r = GUARD.radius, y = this.pos[1];
    const boxes = (ctx.blockers || []).concat(ctx.you && ctx.you.box ? [ctx.you.box] : []);
    return boxes.some(([lo, hi]) => nx + r > lo[0] && nx - r < hi[0] && nz + r > lo[2] && nz - r < hi[2] && y + GUARD.height > lo[1] && y < hi[1]);
  }

  patrol(dt, ctx) {
    // battle mode: on to the next point of his lane, at a run; there, it is his post
    if (this.push) {
      if (this.goTo(this.push, GUARD.search, dt, ctx)) { this.home = { pos: this.pos.slice(), yaw: this.yaw }; this.push = null; }
      return;
    }
    if (this.route) {
      if (this.wait > 0) {
        this.wait -= dt;
        if (this.wait <= 0) this.leg = (this.leg + 1) % this.route.length;
      } else {
        const [tx, tz] = this.route[this.leg];
        const dx = tx - this.pos[0], dz = tz - this.pos[2];
        const d = Math.hypot(dx, dz);
        if (d < 0.05) { const pp = this.route[this.leg][2]; this.wait = pp !== undefined ? pp : this.pauseFor; }   // a point may say how long he stays there
        else {
          this.turnTo(Math.atan2(-dx, -dz), dt);
          const stepLen = Math.min(d, GUARD.walk * dt);
          const nx = this.pos[0] + (dx / d) * stepLen, nz = this.pos[2] + (dz / d) * stepLen;
          if (!this.bumps(nx, nz, ctx)) { this.pos[0] = nx; this.pos[2] = nz; this.speed = GUARD.walk; }
        }
      }
    } else {
      // at a post: a slow look one way, then the other
      this.lookT += dt;
      this.turnTo(this.home.yaw + Math.sin(this.lookT * 0.35) * 0.6, dt * 0.4);
    }
  }

  // a coward hurt: he runs - to the point of his own round, or of
  // the open floor, furthest from you - and cowers there
  flee(ctx) {
    this.fled = true;
    // (Rhys) a man with a planned way out takes it: the captain runs
    // through the reinforced door, slams and locks it behind him, and climbs
    // to the roof - he never walks through a locked door, and it is locked by
    // the time you get there
    if (this.escape && this.escape.length) {
      this.escapeI = 0; this.fleeTo = null; this.cowering = false;
      this.state = 'flee'; this.stateT = 0; this.path = null;
      this.say(ctx, 'flee');
      return;
    }
    const you = (ctx.you && ctx.you.pos) || this.pos;
    const cands = (this.route || []).map(([x, z]) => [x, this.pos[1], z]).concat([this.home.pos]);
    if (ctx.nav && ctx.nav.reachableFar) { const f = ctx.nav.reachableFar(this.pos, you); if (f) cands.push(f); }
    // (Rhys: the cowards did not run) the furthest spot he can
    // actually get to - the open floor includes rooms he has no way into
    cands.sort((a, b) => Math.hypot(b[0] - you[0], b[2] - you[2]) - Math.hypot(a[0] - you[0], a[2] - you[2]));
    let best = null;
    for (const c of cands.slice(0, 5)) {
      if (Math.hypot(c[0] - this.pos[0], c[2] - this.pos[2]) < 3) continue;
      if (!ctx.nav) { best = c; break; }
      const path = ctx.nav.find(this.pos, c, this.navOpts());
      if (path && path.length) { best = c; this.path = path; this.pathI = 0; this.pathGoal = c.slice(); break; }
    }
    this.fleeTo = best; this.cowering = !best;
    this.state = 'flee'; this.stateT = 0;
    if (!best) this.path = null;
    this.say(ctx, 'flee');
  }

  // one step of a planned way out: { to }, { door, open }, { door, lock },
  // { climb: top y, at: [x, z], exit: [x, y, z] }, ending where he cowers
  escapeStep(dt, ctx) {
    const st = this.escape[this.escapeI];
    const next = () => { this.escapeI++; this.path = null; if (this.escapeI >= this.escape.length) this.cowering = true; };
    // (Rhys: there is really not a lot of time to catch him) a man
    // may run at his own pace (escapeSpeed), and fumble with a key (fumble s)
    if (st.to) { if (this.goTo(st.to, this.escapeSpeed || GUARD.search * 1.4, dt, ctx)) next(); return; }
    if (st.door) {
      const d = st.door;
      if (d.blown) { next(); return; }
      if (st.open && st.fumble && (this.fumbleT = (this.fumbleT || 0) + dt) < st.fumble) { this.speed = 0; this.turnTo(this.faceAngle(d.centre), dt); return; }
      if (st.open) { d.unlock(); if (!d.open) d.use(this.pos, this.box()); next(); return; }
      if (st.lock) {
        if (d.open) d.set(false, d.side);
        d.locked = true;
        this.events.push({ type: 'slam', pos: d.centre.slice() });
        next(); return;
      }
    }
    if (st.climb !== undefined) {
      this.climbing = true;
      this.pos[0] = st.at[0]; this.pos[2] = st.at[1];
      this.turnTo(st.face || this.yaw, dt * 3);
      this.pos[1] = Math.min(st.climb, this.pos[1] + (st.rate || 1.3) * dt);
      this.speed = 0;
      if (this.pos[1] >= st.climb - 1e-6) { this.climbing = false; this.pos = st.exit.slice(); next(); }
      return;
    }
    next();
  }

  faceAngle(p) { return Math.atan2(-(p[0] - this.pos[0]), -(p[2] - this.pos[2])); }

  // yaw 0 looks toward -z, as the player's does
  turnTo(want, dt) {
    let d = want - this.yaw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    this.yaw += Math.max(-GUARD.turn * dt, Math.min(GUARD.turn * dt, d));
  }

  moveBody() {
    const [lo, hi] = this.box(), t = this.target;
    t.solid.min = lo.slice(); t.solid.max = hi.slice();
    t.min = lo.slice(); t.max = hi.slice();
    t.centre = [this.pos[0], this.pos[1] + GUARD.height / 2, this.pos[2]];
    t.headY = this.pos[1] + GUARD.height - GUARD.head;      // above this is his head
    if (this.shield) this.placeShield();
  }
  // the shield: 0.45 m in front of him, 0.7 wide, from his knees to his chin - as a box square to the world
  // (the world's solids do not turn), so a little wider than the shield when he faces a diagonal
  placeShield() {
    const s = this.shield;
    if (this.dead) { s.disabled = true; return; }
    s.disabled = false;
    const f = [-Math.sin(this.yaw), -Math.cos(this.yaw)], r = [Math.cos(this.yaw), -Math.sin(this.yaw)];
    const cx = this.pos[0] + f[0] * 0.45, cz = this.pos[2] + f[1] * 0.45;
    const hx = Math.abs(r[0]) * 0.35 + Math.abs(f[0]) * 0.04, hz = Math.abs(r[1]) * 0.35 + Math.abs(f[1]) * 0.04;
    s.min = [cx - hx, this.pos[1] + 0.3, cz - hz]; s.max = [cx + hx, this.pos[1] + 1.5, cz + hz];
  }

  // Down, one way or the other: knocked out if nothing that kills (a round, a
  // blade, a blast) ever touched him, dead otherwise.
  // Where he falls. The death clip falls backwards, the body lying about
  // 1.5 m behind where he stood, facing. He falls the way that has room -
  // no wall, door or other body in the way - trying his own facing first,
  // then turning a little, then a lot; if nothing is clear, he is moved to
  // clear ground next to where he stood. (Rhys: bodies heaped inside one
  // another, and an arm through a shut door.)
  static fallSpan() { return 1.6; }
  // How far behind him the floor stays level with his feet. On a
  // stair the floor rises or drops away behind him, and a body held at flat-
  // floor height then hangs in the air over the lower steps.
  levelRoom(yaw, world) {
    const bx = Math.sin(yaw), bz = Math.cos(yaw), L = Guard.fallSpan();
    if (!world || !world.groundBelow) return L;
    for (let d = 0.2; d <= L; d += 0.2) {
      const g = world.groundBelow(this.pos[0] + bx * d, this.pos[1] + 0.5, this.pos[2] + bz * d, 0.1);
      if (!(Math.abs(g - this.pos[1]) < 0.12)) return d - 0.2;
    }
    return L;
  }
  fallClear(yaw, ctx) {
    const bx = Math.sin(yaw), bz = Math.cos(yaw), L = Guard.fallSpan();
    if (ctx.world && this.levelRoom(yaw, ctx.world) < L - 0.3) return false;
    if (ctx.world) {
      const hit = ctx.world.raycast([this.pos[0], this.pos[1] + 0.35, this.pos[2]], [bx, 0, bz], L + 0.25,
        (s) => s.person || s === this.target.solid);
      if (hit && hit.t < L + 0.25) return false;
    }
    const mid = [this.pos[0] + bx * L * 0.55, this.pos[2] + bz * L * 0.55];
    for (const o of ctx.guards || []) {
      if (o === this || !o.dead || Math.abs(o.pos[1] - this.pos[1]) > 1) continue;
      const om = [o.pos[0] + Math.sin(o.yaw) * L * 0.55, o.pos[2] + Math.cos(o.yaw) * L * 0.55];
      if (Math.hypot(mid[0] - om[0], mid[1] - om[1]) < 1.0) return false;
      if (Math.hypot(this.pos[0] - o.pos[0], this.pos[2] - o.pos[2]) < 0.7) return false;
    }
    return true;
  }
  // Where he goes down, without ever moving his body (Rhys: slump against
  // the wall rather than teleport a corpse). With room behind him - allowing
  // a small twist as he goes - he falls full length. Without it, he slumps
  // against whatever caught him: the death clip is held at the moment his
  // head would reach it.
  settleFall(ctx) {
    this.slump = null;
    // room behind him, clear of walls and of other bodies (a small twist allowed)
    // (on a stair the floor is uneven behind him: turn further, to fall along the step)
    const uneven = ctx.world && this.levelRoom(this.yaw, ctx.world) < Guard.fallSpan() - 0.3;
    for (const t of uneven ? [0, 0.4, -0.4, 1.0, -1.0, 1.6, -1.6] : [0, 0.4, -0.4]) if (this.fallClear(this.yaw + t, ctx)) { this.yaw += t; return; }
    // Only a wall or a door catches a falling man; a colleague on the floor
    // does not - he falls across him (Rhys: guards sat slumped on bodies).
    const walls = { world: ctx.world, guards: [] };
    if (this.fallClear(this.yaw, walls)) return;
    const w = Math.min(this.roomBehind(this.yaw, walls), this.levelRoom(this.yaw, ctx.world));
    this.slump = slumpTime(w - 0.22);
  }
  // how far behind him the first thing is: a wall at his hips or his back, or
  // a colleague already lying there
  roomBehind(yaw, ctx) {
    const bx = Math.sin(yaw), bz = Math.cos(yaw);
    let w = 2;
    if (ctx.world) for (const h of [0.35, 1.0]) {
      const hit = ctx.world.raycast([this.pos[0], this.pos[1] + h, this.pos[2]], [bx, 0, bz], 2,
        (s) => s.person || s === this.target.solid);
      if (hit) w = Math.min(w, hit.t);
    }
    for (const o of ctx.guards || []) {
      if (o === this || !o.dead || Math.abs(o.pos[1] - this.pos[1]) > 1) continue;
      const L = Guard.fallSpan() * 0.55, m = [o.pos[0] + Math.sin(o.yaw) * L, o.pos[2] + Math.cos(o.yaw) * L];
      const vx = m[0] - this.pos[0], vz = m[1] - this.pos[2], along = vx * bx + vz * bz;
      if (along > 0 && Math.abs(vx * bz - vz * bx) < 0.5) w = Math.min(w, Math.max(0.3, along - 0.3));
    }
    return w;
  }

  // dying beside a seat: a stumble back into it, eased, the body
  // turning to sit as it goes
  sinkIntoSeat(dt) {
    const a = this.seatFrom, b = this.seatTo;
    if (!a || !b || a.t >= 1) return;
    a.t = Math.min(1, a.t + dt / SEAT.time);
    const e = a.t * a.t * (3 - 2 * a.t);
    for (let i = 0; i < 3; i++) this.pos[i] = a.pos[i] + (b.pos[i] - a.pos[i]) * e;
    let d = b.yaw - a.yaw; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
    this.yaw = a.yaw + d * e;
  }
  get seated() { return !!(this.seat && (!this.seatFrom || this.seatFrom.t >= 0.35)); }

  die(ctx) {
    ctx = Array.isArray(ctx) ? { guards: ctx } : (ctx || {});
    // (Rhys: "if an enemy is reasonably next to a stool when killed,
    // he should end up sitting on the stool") slumped in it, not on the floor
    const seat = ctx.seats ? seatFor(this, ctx.seats) : null;
    if (seat) {
      seat.taken = true; this.seat = seat;
      const f = [-Math.sin(seat.yaw), -Math.cos(seat.yaw)];
      // (Rhys: "the teleportation from where he was standing then over
      // to the nearest chair... that didn't feel right") he staggers into it:
      // from where he stood to the seat, and down, over SEAT.time
      this.seatFrom = { pos: this.pos.slice(), yaw: this.yaw, t: 0 };
      this.seatTo = { pos: [seat.pos[0] + f[0] * SEAT.feet, seat.top - SEAT.hips, seat.pos[2] + f[1] * SEAT.feet], yaw: seat.yaw };
      this.slump = null;
    } else this.settleFall(ctx);
    this.knockedOut = !this.target.lethalHit;
    this.dead = true;
    this.speed = 0;
    this.state = 'down';
    this.target.solid.disabled = true;        // the body does not block the doorway
  }

  // what the animation picker wants to know
  animState() {
    return { mode: this.climbing ? 'ladder' : 'walk', stance: 0, speed: this.speed, forward: this.speed > 0 ? 1 : 0, strafe: 0,
      onGround: true, vy: 0, armed: true, melee: false, aiming: this.state === 'alert', firing: false,   // a steady aim reads better than a flicker
      dashing: false, hurt: !!this.dazed, dead: this.dead, slump: this.dead ? this.slump : null, seated: !!(this.dead && this.seated), hurt2: !!(this.dead && this.seat && !this.seated) };
  }
}

// (Rhys: the captain's pistol hung in mid-air where he died, in the
// helicopter's door) where something dropped at p comes to rest: straight
// down onto the first thing under it (people and the like aside).
// a seat for a man who has just gone down: the nearest one beside
// him on his own floor, not already taken. Seated (the operative's sitting
// clip), his hips are SEAT.hips over his feet and SEAT.feet behind them.
export const SEAT = { reach: 0.8, hips: 0.47, feet: 0.32, time: 0.55 };
export function seatFor(g, seats) {
  let best = null, bd = SEAT.reach;
  for (const s of seats) {
    if (s.taken || Math.abs(s.pos[1] - g.pos[1]) > 0.3) continue;
    const d = Math.hypot(s.pos[0] - g.pos[0], s.pos[2] - g.pos[2]);
    if (d < bd) { bd = d; best = s; }
  }
  return best;
}

export function groundBelow(world, p, maxDrop) {
  const r = world.raycast([p[0], p[1] + 0.3, p[2]], [0, -1, 0], (maxDrop || 60) + 0.3, (s) => s.person || s.target || s.disabled);
  return r ? [p[0], p[1] + 0.3 - r.t, p[2]] : p.slice();
}
