// FRONTLINE - who is against whom (M6.17.5, Rhys: in the casino's
// Businessman's Suite "a Yellow Team of 3: Boss, and his two bodyguards. They
// are NOT naturally hostile towards YOU. Reds are naturally hostile to You AND
// Yellows ... You can therefore talk to the Yellows if you wish [OR, you may
// attack them, in which case they WILL become hostile towards YOU - They will
// forgive non-lethal takedowns AND stray bullets in cross-fires, but if it
// appears hostile, they will retaliate]").
//
// A level's relations: { [faction]: { you: bool, [faction]: bool } } - who each
// side goes for. With none (every level before the casino) every guard is
// against you and no one else, as before. Pure: tested in node.

import { SENSE } from './guard.js';

// does guard g go for this other guard?
export function hostileTo(g, other, rel) {
  if (!rel || !other || other === g || other.dead || other.dormant) return false;   // (M6.18.8: not one not yet there)
  const r = rel[g.faction];
  return !!(r && r[other.faction]);
}
// does guard g go for you? (a side that starts at peace with you can be turned)
export function hostileToYou(g, rel) {
  if (!rel) return true;
  if (g.provoked) return true;
  const r = rel[g.faction];
  return !r || r.you !== false;
}

// another guard, as a guard sees him: what the senses and the aim need (as
// they need of you)
export function foeView(o) {
  return {
    pos: o.pos, eye: o.eye, chest: [o.pos[0], o.pos[1] + 1.15, o.pos[2]],
    stance: 0, speed: o.speed || 0, noise: (o.speed || 0) > 2.5 ? 0.6 : 0, box: o.box(),
    solid: o.target && o.target.solid, guard: o,
  };
}

// Who guard g is up against this moment: you, another guard, or no one.
//   you: your view (or null when you are down); guards: everyone; rel: the
//   level's relations; ctx: what canSee needs (world, smokes, dark).
// Kept for a moment once chosen (g.foeT), so he does not flick between
// targets every frame; a guard who hurt him is the first he goes for.
export function pickFoe(g, you, guards, rel, ctx, dt) {
  if (!rel) return you;
  // (M6.17.10) the man he was fighting has fallen: remember it (Guard.think says so, and stands down)
  // (M6.17.11, Rhys: still one "Where did they go?" after a red died) or the one he was
  // fighting until he lost sight of him a moment before: still his man (g.lastFoe)
  const was = g.foe && g.foe !== 'you' ? g.foe : (g.foe === 'you' ? null : g.lastFoe);
  if (was && was.dead) { g.foeDown = was; g.foe = null; g.lastFoe = null; g.foeT = 0; }
  const youOk = !!you && hostileToYou(g, rel);
  g.foeT = (g.foeT || 0) - (dt || 0);
  const stillGood = (f) => f && (f === 'you' ? youOk : !f.dead && hostileTo(g, f, rel));
  if (g.foeT > 0 && stillGood(g.foe)) return g.foe === 'you' ? you : foeView(g.foe);
  g.foeT = 0.3;
  // the nearest enemy guard he can see
  let best = null, bd = Infinity;
  for (const o of guards) {
    if (!hostileTo(g, o, rel)) continue;
    const d = Math.hypot(o.pos[0] - g.pos[0], o.pos[1] - g.pos[1], o.pos[2] - g.pos[2]);
    if (d > SENSE.range || d >= bd) continue;
    if (!g.canSee([o.pos[0], o.pos[1] + 1.15, o.pos[2]], ctx)) continue;
    best = o; bd = d;
  }
  // you, if you are nearer and he is against you
  if (youOk) {
    const dy = Math.hypot(you.pos[0] - g.pos[0], you.pos[1] - g.pos[1], you.pos[2] - g.pos[2]);
    // (what he can see of you counts: you behind him, nearer, do not draw him off one in front)
    if (!best || (g.seeing && g.foe === 'you') || (dy < bd && g.canSee(you.chest, ctx))) { g.foe = 'you'; g.lastFoe = null; return you; }
  }
  if (best) { g.foe = best; g.lastFoe = best; return foeView(best); }
  // no one in sight: whoever last hurt him, if he is against them
  if (g.hurtBy && g.hurtBy !== 'you' && stillGood(g.hurtBy)) { g.foe = g.hurtBy; g.lastFoe = g.hurtBy; return foeView(g.hurtBy); }
  g.foe = null;
  return null;
}

// How the Yellows stand with you: 'calm', or 'hostile' once you have given
// them reason. What they forgive: a non-lethal takedown; a stray round in a
// fire-fight with reds (a warning the first time, and the second; a third
// is no accident). What they do not: killing one of them, a round into them
// with no reds about to explain it, a gun held on them.
export const STANDING = { strays: 2, strayWindow: 40, aimWarn: 2.0, aimHostile: 5.0, aimRange: 14 };
export class Standing {
  constructor() { this.state = 'calm'; this.strays = []; this.aimT = 0; this.warned = false; this.why = null; }
  get hostile() { return this.state === 'hostile'; }
  turn(why) { if (this.state !== 'hostile') { this.state = 'hostile'; this.why = why; } return 'hostile'; }
  // one of them hit by your round. lethal: it killed him. crossfire: reds
  // about (in a fight, near him or near you). now: the mission clock.
  shot(lethal, crossfire, now) {
    if (this.hostile) return 'hostile';
    if (lethal) return this.turn('killed');
    if (!crossfire) return this.turn('shot');
    this.strays = this.strays.filter((t) => now - t < STANDING.strayWindow);
    this.strays.push(now);
    return this.strays.length > STANDING.strays ? this.turn('strays') : 'forgiven';
  }
  // taken down by hand: forgiven if he lives; a blade is not forgiven
  takenDown(lethal) {
    if (this.hostile) return 'hostile';
    return lethal ? this.turn('killed') : 'forgiven';
  }
  // a gun held on one of them (aiming, within range, a clear line): a
  // warning, then they act. Returns 'warn' once, 'hostile' when it comes to it.
  aim(dt, onThem) {
    if (this.hostile) return null;
    if (!onThem) { this.aimT = Math.max(0, this.aimT - dt * 0.5); if (this.aimT === 0) this.warned = false; return null; }
    this.aimT += dt;
    if (this.aimT >= STANDING.aimHostile) return this.turn('aimed');
    if (this.aimT >= STANDING.aimWarn && !this.warned) { this.warned = true; return 'warn'; }
    return null;
  }
}

// (M6.17.6, Rhys: "IF speak to them on the ground floor, they move out from
// the Businessman's Suite, and start fighting any Reds they see. They'll
// follow you up to the Cash Vault - There's something in a locket that they
// want in particular. Once they've got it, they'll head down the coil and out
// through the front door") The Yellows' errand, stage by stage:
//   idle -> (you talk to them) escort: they keep with you, fighting any reds
//   they see -> (one of them in sight of the
//   locket) locket: he goes and takes it -> leaving: down the coil, out of
//   the front door, along the street -> gone. Turned against you: off.
// (M6.17.7, Rhys: "they follow your exact steps around everywhere"; the boss
// "rushed ahead into a gunfight") they keep with you by the shortest way
// (Guard.followLead), his men in front, the boss furthest back.
export const JOB = { lag: [2.4, 3.4], bossLag: 5.0, sight: 7, reach: 1.8 };
export class YellowJob {
  constructor(yellows, locket, exit) { this.yellows = yellows; this.locket = locket; this.exit = exit; this.stage = 'idle'; this.way = { path: null, goal: null, t: -1e9, gen: 0 }; this.taker = null; this.left = 0; }
  alive() { return this.yellows.filter((y) => !y.dead && !y.away); }
  start() {
    if (this.stage !== 'idle') return false;
    this.stage = 'escort';
    let k = 0;
    for (const y of this.alive()) y.escort = { lead: true, way: this.way, lag: y.boss ? JOB.bossLag : JOB.lag[Math.min(k++, JOB.lag.length - 1)] };
    return true;
  }
  stop() { if (this.stage === 'gone') return; this.stage = 'off'; for (const y of this.yellows) y.escort = null; }
  // seesLocket(y): can he see it from where he is; find(a, b): a way there (nav)
  tick(seesLocket, find) {
    const ev = [], ys = this.alive();
    if (this.stage === 'idle' || this.stage === 'off' || this.stage === 'gone') return ev;
    if (!ys.length) { this.stage = 'gone'; return ev; }
    const pick = () => ys.find((y) => y.boss) || ys[0];
    // (M6.17.13, Rhys: "you should have the opportunity to take the locket for yourself, THEN
    // when you speak with a Yellow, they ask for it") yours already: when they reach its place
    // and see it empty, they know - and the boss will ask you (stage 'missing')
    const mine = this.locket.taken && this.locket.by === 'you';
    if (mine && (this.stage === 'escort' || this.stage === 'locket')) {
      const seen = this.stage === 'locket' || ys.find((y) => Math.hypot(y.pos[0] - this.locket.pos[0], y.pos[2] - this.locket.pos[2]) < JOB.sight && Math.abs(y.pos[1] - this.locket.pos[1]) < 1.5 && seesLocket(y));
      if (seen) {
        if (this.taker && this.taker.escort && this.taker.escort.goto) this.taker.escort = { lead: true, way: this.way, lag: JOB.bossLag };
        this.stage = 'missing'; ev.push({ type: 'missing', by: pick() });
      }
      return ev;
    }
    if (this.stage === 'escort') {
      // (M6.17.7) any of them may spot it (the boss walks at the back now); the boss goes for it
      const spot = this.locket.taken ? null : ys.find((y) => Math.hypot(y.pos[0] - this.locket.pos[0], y.pos[2] - this.locket.pos[2]) < JOB.sight && Math.abs(y.pos[1] - this.locket.pos[1]) < 1.5 && seesLocket(y));
      if (spot) {
        const t = pick();
        this.stage = 'locket'; this.taker = t; t.escort = { goto: [this.locket.pos[0], t.pos[1], this.locket.pos[2]], reach: JOB.reach };
        ev.push({ type: 'seen', by: spot });
      }
    } else if (this.stage === 'locket') {
      if (!this.taker || this.taker.dead) {
        this.taker = pick(); this.taker.escort = { goto: [this.locket.pos[0], this.taker.pos[1], this.locket.pos[2]], reach: JOB.reach };
      } else if (this.taker.escort && this.taker.escort.arrived) {
        this.locket.taken = true; this.locket.by = 'yellows'; this.stage = 'leaving';
        ev.push({ type: 'locket', by: this.taker });
        this.leave(find, this.taker);
      }
    } else if (this.stage === 'leaving') {
      for (const y of ys) {
        if (y.escort && y.escort.reached) { y.away = true; y.hidden = true; y.escort = null; y.target.solid.disabled = true; this.left++; ev.push({ type: 'left', by: y }); }
      }
      if (!this.alive().length) { this.stage = 'gone'; ev.push({ type: 'gone' }); }
    }
    return ev;
  }
  // (M6.17.13) the locket, handed over by you: theirs, and they go
  give(find) {
    if (this.stage === 'leaving' || this.stage === 'gone' || this.stage === 'off') return false;
    this.locket.taken = true; this.locket.by = 'yellows'; this.given = true;
    this.leave(find, this.alive().find((y) => y.boss) || this.alive()[0]);
    return true;
  }
  // (M6.17.13) "It wasn't in there" - believed: they give it up and go, empty-handed
  giveUp(find) {
    if (this.stage === 'leaving' || this.stage === 'gone' || this.stage === 'off') return false;
    this.gaveUp = true;
    this.leave(find, this.alive().find((y) => y.boss) || this.alive()[0]);
    return true;
  }
  // everyone out of the front door: the taker's way, and each man's own (find(a, b): a way there)
  leave(find, taker) {
    const ys = this.alive();
    this.stage = 'leaving';
    if (!taker) return;
    // a way out, in metre steps, from where each man stands
    const trail = (from) => {
      const path = find(from, this.exit);
      if (!path) return null;
      const out = [from.slice()];
      for (const q of path) {
        const p = out[out.length - 1], n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) / 1.0));
        for (let k = 1; k <= n; k++) out.push([p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n, p[2] + (q[2] - p[2]) * k / n]);
      }
      return out;
    };
    const out = trail(taker.pos) || [taker.pos.slice(), this.exit.slice()];
    this.exitTrail = out;
    // (M6.17.12, Rhys: "Upon taking the locket, the Yellows glorched up through the ceiling,
    // and THEN came down") all three had been given the boss's way out, from where HE
    // stood: a man a floor below walked straight up to its start. Each his own way now.
    for (const y of ys) y.escort = { path: y === taker ? out : (trail(y.pos) || out) };
  }
}

// What the Yellows say when you talk to them (E): the boss in turn, his men
// a word each. With the ledger in your hands, the boss says so.
export const YELLOW_TALK = {
  // (M6.17.6) the errand, asked of you; and on the way
  job: 'The reds took something of mine - a locket. It is in their Cash Vault, upstairs, behind steel doors. Get us in there and we will watch your back.',
  jobGuard: 'The boss wants his locket back. We go where you go.',
  // (M6.17.9, Rhys: "The Vault is upstairs. Keep Moving" sounded like orders
  // to a hostage - and was said on the vault's own floor, and above it) where
  // the vault is from where he stands: {vault}, filled in by vaultWhere
  escort: ['After you. We are right behind you.', '{vault}', 'While you are in there - the reds\' ledger is on the counting table. Ghost would want that.', 'We have your back.'],
  vault: {
    above: 'The vault is up on the second floor, if you can get us there.',
    here: 'The vault is on this floor - behind the steel doors along the ring.',
    below: 'We have come up past it - the vault is down on the second floor.',
    in: 'This is it. The locket should be in here somewhere.',
  },
  gotIt: 'At last. That is all we came for. We are leaving the way we came - good luck, friend.',
  // (M6.17.13, Rhys) the locket in your pocket: the boss asks for it - before the vault, or after he finds it empty
  ask: 'You have been in their vault. My locket - did you see it?',
  askMissing: 'It is gone. You were in here before us. Did you take my locket?',
  thanks: 'Good. That is all we came for. We are leaving - good luck, friend.',
  believed: 'Then the reds have moved it. It is not worth dying for. We are leaving.',
  caught: 'You lie to me? I watched you take it.',
  leaving: ['We are going. Mind yourself.', 'Out the front, and gone.'],
  boss: [
    'Easy, friend. We are not who you came for tonight.',
    'The reds bought this place with other people\'s money. Their books are upstairs - in the Cash Vault, behind the steel doors.',
    'A ledger like that, in the right hands, finishes them. I would not say no to it myself - but it is yours to take.',
    'Go on. We will keep our heads down. Mind where you shoot.',
  ],
  bossLedger: 'The ledger. Good. Make sure it reaches someone who can use it - and that the reds never see it again.',
  guard: ['Keep walking.', 'The boss says you are fine. Do not make him wrong.', 'Eyes front, pal.', 'Not our fight. Not yet.'],
  warn: ['Lower your weapon. Now.', 'Point that somewhere else.', 'Last warning - lower it!'],
  stray: ['Watch your fire!', 'Hey - we are on the same side of this!', 'Careful where you point that!'],
  turned: ['That is it - take him!', 'He is with them - drop him!', 'So that is how it is.'],
};

// (M6.17.13) your answers when the boss asks for his locket (your words, on the buttons - not his)
export const LOCKET_CHOICES = { give: 'Just keeping it safe - all yours.', deny: 'It wasn\'t in there.' };

// (M6.17.9) where the vault is, said from where he stands: dy = the vault's
// floor height less his; inVault: he is inside it
export function vaultWhere(dy, inVault) {
  const V = YELLOW_TALK.vault;
  if (inVault) return V.in;
  return dy > 1.5 ? V.above : dy < -1.5 ? V.below : V.here;
}
