// FRONTLINE - running Level 0 in the game: the guards' bodies, the keycard,
// the terminal, breaching and bullet time, the hints, and the end.
// main.js calls in at a handful of points; the rules live in src/sim/play/mission.js.

import { diffOf, DIFFICULTY } from '../../sim/play/difficulty.js';
import { Mission, kickOpens, SLOWMO, hotelTrophies, factoryTrophies, casinoTrophies, clearTrophies, hackTrophies, awardsButton } from '../../sim/play/mission.js';
import { Operative } from '../draw/character.js';
import { NavGrid } from '../../sim/world/nav.js';
import { shove, standable, inStreetZone } from '../../sim/people/hostage.js';
import { CaptainRun, HELI } from '../../sim/people/captain.js';
import { RULES } from '../../sim/play/story.js';
import { Battle, BATTLE } from '../../sim/play/battle.js';
import { Pilot } from '../../sim/vehicles/drive.js';
import { DrawCull } from '../../sim/world/drawcull.js';
import { SENSE, RANKS, ARMS, LINES, YELLOW_LINES, raiseAlarm, lineFor, groundBelow } from '../../sim/people/guard.js';
import { Voices, PRIORITY } from '../core/voice.js';
import { ITEMS, baseId, fits, pickupSlot, holdAfterPickup, withTags } from '../../sim/arms/loadout.js';
import { pickFoe, hostileToYou, Standing, YELLOW_TALK, YellowJob, vaultWhere, LOCKET_CHOICES } from '../../sim/people/factions.js';
import { spokenVoice, SPOKEN, SPOKEN_SETS } from '../core/spoken.js';
import { inTrain, inCoach, nearestSeat, FLOOR as FLOOR_Y, HIJACK, HIJACK_TALK, STAFF_TALK, NEWSPAPER, RUN as TRAIN_RUN } from './train.js';
import * as Trophies from '../core/trophies.js';
import * as Saves from '../core/saves.js';
import { DRAFTS } from './drafts/index.js';
import { rewardFor } from '../../sim/play/rewards.js';
import { deviceView } from '../draw/devices_view.js';
import { makeTarget } from '../../sim/arms/weapons.js';
import { makeDog, DOG } from '../../sim/people/dog.js';
import { markIntrusion, downLantern } from './hq_security.js';
import { xpFor, pointsAt } from '../../sim/play/skills.js';
import { CASE, cluesFrom, caseOpen, FINAL, CLOSED, trailSteps, TRAILS, trailMark, trailDone } from '../../sim/play/caseboard.js';
import { settle as settleContracts, TERMS as CONTRACT_TERMS, describe as contractText } from '../../sim/play/contracts.js';
import { Device, stepDevice, setMode, Trace, HACK, MODES, SIREN, darkAt, sirenFor, syncLocks, modeSays, lightsOut, breaks } from '../../sim/world/devices.js';


const RED = [1.9, 0.72, 0.66];          // the reds' uniform: the field kit, tinted
const YELLOW = [1.75, 1.45, 0.45];       // the yellows' (the Derelict Factory): the same kit, tinted

const HINTS = {
  start: 'Three ways in: the front doors, the loading bay round the back, or the fire escape up the street side.',
  radar: 'Red squares on the radar are people you can sense. Lose them, and a fading outline shows where they were.',
  keycard: 'A security keycard. Something upstairs will open for it.',
  it: 'The network map: the private server is on the second floor, in the secure room. The only way up there is the stairs from the first floor.',
  fire: 'The fire escape: climb the ladder, then vault in through the window.',
  breach: 'A locked door. Kick it (F), or place a charge on it (select it, fire at the door, fire again to set it off). A door that gives buys you a moment of slow time.',
  serverNoCard: 'Reinforced and locked: no kick will open it. The keycard will - it is somewhere in the building - or a breaching charge.',
  serverCard: 'The keycard will open this: E at the door.',
  terminal: 'The private-network computer. Hold E to download the file.',
  file: 'Got it. Now get out - any way you like - back to the van.',
  duct: 'A duct in the ceiling: climb the crate and climb in, crouch along it above the guards, and drop through the hatch into the server room.',
  supply: 'Smoke grenades: E to swap one of your kit slots for them. Guards cannot see through smoke.',
  noticed: 'Someone is noticing you: the arc round your crosshair shows where. Amber, they are wondering; red, they have seen you. Break their line of sight, crouch, keep still - and they will lose interest.',
};

export function setupMission(ctx) {
  const { pc, app, level, player, input, audio, S, $, tracker, canvas, wview, settings, arsenal } = ctx;
  // Level 0 has its objectives (keycard, terminal, van); the hotel,
  // for now, has its guards only - its doors, keys and safe stay with main.js
  const L0 = !!level.mission0;
  // the guards you are sent to deal with: not the Yellows in the casino
  const targets = level.guards.filter((g) => g.objective !== false);
  const m = new Mission({ id: L0 ? 'level0' : level.draft ? level.draft : level.factory ? 'factory' : level.casino ? 'casino' : 'hotel', guards: targets.length });
  const guards = level.guards;
  // who is against whom (level.relations; none: everyone against you), and how the Yellows stand with you
  const rel = level.relations || null;
  // battle mode: the two sides' reserves and the clock; every man on the field paid for (you as well)
  const B = level.battle ? new Battle(level.battle.def) : null;
  const otherSide = (side) => Object.keys(B.teams).find((k) => k !== side);
  const battleOrders = (g, side, from) => {
    // a lane that starts near where he comes on (a side may come on at more than one end)
    const all = level.battle.lanes[side], p = from || g.pos;
    const d = (ln) => Math.hypot(ln[0][0] - p[0], ln[0][2] - p[2]), best = Math.min(...all.map(d));
    const ls = all.filter((ln) => d(ln) < best + 20);
    g.lane = ls[Math.floor(Math.random() * ls.length)]; g.laneI = 0; g.push = g.lane[0].slice();
    g.holdT = BATTLE.hold[0] + Math.random() * (BATTLE.hold[1] - BATTLE.hold[0]);
  };
  if (B) {
    B.send(B.you);
    for (const [side, pool] of Object.entries(level.battle.pools)) for (const g of pool) { B.send(side); battleOrders(g, side); }
  }
  const standing = rel ? new Standing() : null;
  const neutral = (g) => !!rel && !g.dead && !hostileToYou(g, rel);
  // the Yellows' errand: to the Cash Vault for the boss's locket, and out
  const job = rel && level.locket ? new YellowJob(level.guards.filter((g) => g.faction === 'yellow'), level.locket, level.yellowExit || [30, 0, 64]) : null;
  const cull = new DrawCull(level.world), hcull = new DrawCull(level.world);     // who is drawn
  // how guards find their way about (built once, about a tenth of a second)
  const nav = new NavGrid(level.world, level.navFloors, level.navLinks);
  if (level.navCap) nav.maxSteps = level.navCap;
  const noises = [];                  // this frame's gunfire, blasts, kicks
  const smokes = [];                  // clouds guards cannot see through, while they last
  let barkT = 0;
  const voices = new Voices(settings || {}, audio);
  const diff = () => diffOf(settings && settings.difficulty);          // (M6.39) how hard they are on you
  let rt_checkpoint = 0;                 // (M6.46) things done kept from a checkpoint
  // Guards take turns (Rhys: the chatter came thick and fast, and repeated).
  // Urgent calls (an alert, a hit, a man down) always go through; anything
  // else waits for a gap: 2.2 s between any two lines, 6 s before the same
  // man speaks again, 12 s before the same kind of line is used again.
  const lastLine = {}, lastKindT = {};
  let lastAnyT = -99;
  // (Rhys: "'Yellow Boss', 'Yellow Bodyguard' show up in Red Text") each side's name in its own colour
  const subtitle = (g, said, secs) => {
    // Severian (Cyrillic, its accents) set in the game's own font, whole - a screen font
    // without the accents would put the letter in one font and its accent, adrift, in another
    if (/[\u0300-\u036f\u0400-\u052f]/.test(said)) said = '<span class="sev">' + said + '</span>';
    // (Rhys: the announcement "runs over the screen-edge") Severian, then English, on two lines
    said = said.replace(' \u2014 ', '<br>');
    $('bark').innerHTML = '<span class="' + (g.faction === 'yellow' ? 'yellow' : g.faction === 'staff' ? 'staff' : g.faction === 'front' || g.side === 'front' ? 'front' : 'red') + '">' + speakerOf(g) + '</span> ' + said;
    $('bark').style.opacity = 1; barkT = secs;
  };
  const speakerOf = (g) => g.faction === 'staff' || g.faction === 'front' ? g.title : g.side === 'front' ? 'Front of Memory' : g.side === 'ally' ? g.title : g.faction === 'red' ? 'Red guard' : g.faction === 'yellow' ? (g.boss ? 'Yellow boss' : g.objective === false ? 'Yellow bodyguard' : 'Yellow') : 'Guard';
  const bark = (g, text, key) => {
    // you only hear what is said near you, and quieter the further off
    const d = Math.hypot(g.pos[0] - player.pos[0], (g.pos[1] - player.pos[1]) * 2, g.pos[2] - player.pos[2]);
    if (d > 26) return;
    const urgent = (PRIORITY[key] || 1) >= 3, t = m.time;
    if (!urgent && (t - lastAnyT < 2.2 || t - (g.lastSaidT || -99) < 6 || t - (lastKindT[key] || -99) < 12)) return;
    // no Yellows on the train: a line about them is put the plain way
    // (Rhys: "Reds called Blues 'Yellows'", "Yellows called Blues 'Reds'") a line that names a side
    // is only said of that side: up against anyone else (Ghost, you), the plain way
    const other = g.foe && g.foe !== 'you' ? g.foe : g.foeDown || g.lastFoe || null;
    const foeSide = level.trainRun ? 'none' : other ? other.faction : 'you';
    const misnames = (t) => (/yellow/i.test(t) && foeSide !== 'yellow') || (/\breds?\b/i.test(t) && foeSide !== 'red');
    if (misnames(text)) {
      const yk = key.startsWith('y_'), k2 = key === 'alertRival' ? 'alert' : key;
      const alt = ((yk ? YELLOW_LINES[k2.slice(2)] : LINES[k2]) || []).filter((x) => !misnames(x));
      if (!alt.length) return;
      text = alt[Math.floor(Math.random() * alt.length)]; key = k2;
    }
    lastAnyT = t; g.lastSaidT = t; lastKindT[key] = t; lastLine[key] = text;
    // the words go up as they are heard, not before
    // (M6.29) a Yellow saying one of the shared lines a Yellow voice has recorded (the specialists'): in his own voice
    const yv = key.startsWith('y_') || (g.faction === 'yellow' && (SPOKEN_SETS.yellow || []).includes(SPOKEN[text]));
    voices.say(g.id, text, key, Math.max(0.15, Math.min(1, 1.25 - d / 20)), (said) => subtitle(g, said, 2.8), spokenVoice(g, yv));
  };
  // said straight to you (talking to a Yellow): no waiting its turn
  const speak = (g, text) => voices.say(g.id, text, 'talk', 1, (said) => subtitle(g, said, 2.4 + said.length * 0.05), spokenVoice(g, true));
  // the handler on the radio, subtitled
  const control = (text) => {
    if (level.offDuty) return;                 // (Rhys: off duty - no feed from Ghost/Control)
    $('bark').innerHTML = '<span class="radio">Control</span> ' + text;
    $('bark').style.opacity = 1; barkT = 3.2;
  };
  // (Rhys: overhear the radio when the captain runs) anyone on the
  // reds' radio, subtitled
  const overheard = (who, text, secs) => {
    $('bark').innerHTML = '<span class="radio">' + who + ' (radio)</span> ' + text;
    $('bark').style.opacity = 1; barkT = secs || 3.4;
  };
  // ...and heard: their voices, queued with Control's
  const intercept = (key) => level.offDuty ? null : voices.intercept(key, (text, who) => overheard(who, text, 1.2 + text.length * 0.06));
  const radioOnce = new Set();
  const radio = (key, once) => {
    if (level.offDuty) return;
    if (once && radioOnce.has(key)) return;
    radioOnce.add(key);
    voices.radio(key, control);
  };

  // Stage 3: their shots. A tracer and a muzzle flash for each, heard by
  // distance; a hit hurts you, a miss snaps past and marks what it strikes.
  const glow = (r, g, b) => { const m = new pc.StandardMaterial(); m.emissive = new pc.Color(r, g, b); m.emissiveIntensity = 4; m.diffuse = new pc.Color(0, 0, 0); m.update(); return m; };
  const tracerMat = glow(1, 0.85, 0.45), flashMat = glow(1, 0.75, 0.35);
  const fx = [];
  const spark = (kind) => {
    const e = new pc.Entity(kind);
    e.addComponent('render', { type: kind === 'tracer' ? 'box' : 'sphere', material: kind === 'tracer' ? tracerMat : flashMat, castShadows: false });
    e.enabled = false; app.root.addChild(e);
    const f = { e, t: 0, kind }; fx.push(f); return f;
  };
  const show = (kind, from, to) => {
    const f = fx.find((x) => x.kind === kind && x.t <= 0) || spark(kind);
    f.t = kind === 'tracer' ? 0.05 : 0.04;
    f.e.enabled = true;
    if (kind === 'flash') { f.e.setPosition(from[0], from[1], from[2]); f.e.setLocalScale(0.16, 0.16, 0.16); return; }
    const len = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
    f.e.setPosition((from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2);
    f.e.lookAt(to[0], to[1], to[2]);
    f.e.setLocalScale(0.02, 0.02, Math.max(0.1, len));
  };
  const guardShot = (g, ev) => {
    const d = Math.hypot(ev.from[0] - player.pos[0], ev.from[1] - player.pos[1], ev.from[2] - player.pos[2]);
    // a rocket: a slow streak, and a burst where it lands - near you is enough
    if (ARMS[ev.arms] && ARMS[ev.arms].rocket) {
      audio.shot({ family: 'sniper' }, Math.max(0.2, Math.min(1, 1.1 - d / 50)));
      show('flash', ev.from);
      const dx = ev.to[0] - ev.from[0], dy = ev.to[1] - ev.from[1], dz = ev.to[2] - ev.from[2], l = Math.hypot(dx, dy, dz) || 1;
      const hitR = level.world.raycast(ev.from, [dx / l, dy / l, dz / l], l + 2, (s2) => s2.person || s2.target);
      const at = hitR ? [ev.from[0] + dx / l * (hitR.t - 0.2), ev.from[1] + dy / l * (hitR.t - 0.2), ev.from[2] + dz / l * (hitR.t - 0.2)] : ev.to.slice();
      later.push({ t: Math.min(1.2, l / 45), fn: () => { if (arsenal && arsenal.detonate) arsenal.detonate({ id: 'ROCKET', pos: at }, player); show('tracer', ev.from, at); } });
      noises.push({ pos: ev.from, loud: 1.4 });
      return;
    }
    audio.shot({ family: ev.arms === 'pistol' || ev.arms === 'revolver' ? 'pistol' : ev.arms === 'marksman' || ev.arms === 'dmr' ? 'sniper' : 'rifle' }, Math.max(0.12, Math.min(1, 1.1 - d / 45)));
    show('flash', ev.from); show('tracer', ev.from, ev.to);
    noises.push({ pos: ev.from, loud: 1 });                    // other guards hear it too
    // at another guard - a red at a Yellow, or the other way: his rounds hit harder
    // than at you (yours are meant to be a game you win; theirs on each other are not)
    if (ev.at) {
      const o = ev.at;
      if (ev.hit && !o.dead && !o.target.down) {
        o.target.hp -= ev.damage * GUNFIGHT;
        o.hurtBy = g; o.target.lastBy = g;
        if (o.target.hp <= 0) { o.target.hp = 0; o.target.down = true; o.target.lethalHit = true; o.target.downBy = 'shot'; }
      }
      return;
    }
    if (ev.hit) { player.damage(ev.damage * diff().damage, 'shot', ev.from); return; }
    if (!ev.blocked) audio.whizz();                 // a round stopped by the glass does not go past you
    // where the miss lands
    const dx = ev.to[0] - ev.from[0], dy = ev.to[1] - ev.from[1], dz = ev.to[2] - ev.from[2], l = Math.hypot(dx, dy, dz) || 1;
    const dir = [dx / l, dy / l, dz / l];
    const hit = level.world.raycast(ev.from, dir, 60, (s) => s.person);
    if (hit && hit.solid) {
      const s2 = hit.solid, t = s2.tag || '';
      const surf = s2.glass ? 'glass' : /metal|rail|cont/.test(t) ? 'metal' : /wood|crate|door|hdoor/.test(t) ? 'wood' : 'generic';
      if (s2.glassware) audio.glassware(hit.t + Math.hypot(ev.from[0] - player.pos[0], ev.from[2] - player.pos[2]) * 0.5);     // a bottle or a glass at the bar
      else audio.hitHard(hit.t + Math.hypot(ev.from[0] - player.pos[0], ev.from[2] - player.pos[2]) * 0.5, surf);
    }
    if (hit && hit.solid && wview && wview.addMark) {
      const point = hit.point || [ev.from[0] + dir[0] * hit.t, ev.from[1] + dir[1] * hit.t, ev.from[2] + dir[2] * hit.t];
      wview.addMark(point, hit.solid, dir);
    }
  };
  const GUNFIGHT = 2.6, STANDING_AIM = 14;
  // the Yellows turn on you: all of them, at once, and the boss says so
  const turnYellows = (said) => {
    if (job) job.stop();
    for (const y of guards) {
      if (y.faction !== 'yellow' || y.dead) continue;
      y.provoked = true; y.awareness = 1; y.stim = player.pos.slice(); y.since = 0; y.foeT = 0;
      if (y.state !== 'alert') { y.state = 'search'; y.stateT = 0; y.path = null; }
    }
    const b = guards.find((y) => y.faction === 'yellow' && !y.dead && y.boss) || guards.find((y) => y.faction === 'yellow' && !y.dead);
    if (b) speak(b, said || YELLOW_TALK.turned[Math.floor(Math.random() * YELLOW_TALK.turned.length)]);
  };
  // were there reds in it - a fight going on, near him or near you?
  const crossfire = (y) => guards.some((r) => r.faction === 'red' && !r.dead &&
    (r.state === 'alert' || r.state === 'search') &&
    (Math.hypot(r.pos[0] - y.pos[0], r.pos[2] - y.pos[2]) < 15 || Math.hypot(r.pos[0] - player.pos[0], r.pos[2] - player.pos[2]) < 15) &&
    Math.abs(r.pos[1] - y.pos[1]) < 4);
  // a Yellow struck by your round (lethal: it killed him)
  const yellowHit = (y) => {
    if (!standing || y.faction !== 'yellow') return;
    y.hurtBy = 'you';
    const was = standing.state, res = standing.shot(!!y.target.down, crossfire(y), m.time);
    if (res === 'hostile' && was !== 'hostile') turnYellows();
    else if (res === 'forgiven') speak(y.dead || y.target.down ? guards.find((q) => q.faction === 'yellow' && !q.dead && !q.target.down) || y : y, YELLOW_TALK.stray[Math.floor(Math.random() * YELLOW_TALK.stray.length)]);
  };
  const yellowNear = () => {
    if (!rel) return null;
    let best = null, bd = 2.2;
    for (const y of guards) {
      if (y.faction !== 'yellow' || !neutral(y) || y.target.down) continue;
      const d = Math.hypot(y.pos[0] - player.pos[0], y.pos[2] - player.pos[2]);
      if (d < bd && Math.abs(y.pos[1] - player.pos[1]) < 1) { bd = d; best = y; }
    }
    return best;
  };
  const talkTo = (y) => {
    y.turnTo && (y.yaw = Math.atan2(-(player.pos[0] - y.pos[0]), -(player.pos[2] - y.pos[2])));
    // the locket already in your pocket: asked for it, first thing
    if (job && level.locket && level.locket.by === 'you' && !rt.locketAnswer && standing && !standing.hostile &&
        (job.stage === 'idle' || job.stage === 'escort' || job.stage === 'missing')) {
      if (job.stage === 'idle') job.start();
      askLocket(y, job.stage === 'missing');
      return;
    }
    // the first word with them: their errand - and they come with you
    if (job && job.stage === 'idle' && standing && !standing.hostile) {
      job.start();
      speak(y, y.boss ? YELLOW_TALK.job : YELLOW_TALK.jobGuard);
      showHint('The Yellows are with you: they will follow you and fight any reds they see. Their boss wants a locket from the Cash Vault, upstairs.');
      return;
    }
    if (job && job.stage === 'escort') {
      y.talkE = (y.talkE || 0) + 1;
      let line = YELLOW_TALK.escort[(y.talkE - 1) % YELLOW_TALK.escort.length];
      if (line === '{vault}') {
        const z = level.zones && level.zones.cash_vault, p = y.pos;
        const inV = !!z && p[0] >= z[0][0] && p[0] <= z[1][0] && p[1] >= z[0][1] - 0.5 && p[1] <= z[1][1] && p[2] >= z[0][2] && p[2] <= z[1][2];
        line = vaultWhere((z ? z[0][1] : level.locket.pos[1]) - p[1], inV);
      }
      speak(y, line);
      return;
    }
    if (job && (job.stage === 'leaving' || job.stage === 'locket')) { speak(y, YELLOW_TALK.leaving[Math.floor(Math.random() * YELLOW_TALK.leaving.length)]); return; }
    if (y.boss) {
      if (level.ledger && level.ledger.taken) { speak(y, YELLOW_TALK.bossLedger); return; }
      y.talkI = y.talkI || 0;
      speak(y, YELLOW_TALK.boss[Math.min(y.talkI, YELLOW_TALK.boss.length - 1)]);
      y.talkI++;
    } else speak(y, YELLOW_TALK.guard[(y.talkI = ((y.talkI || 0) + 1)) % YELLOW_TALK.guard.length]);
  };
  // a first draft's things to take: drawn as small glowing boxes on their tables
  const pickupNear = () => (level.pickups || []).find((p) => !p.taken && Math.hypot(p.pos[0] - player.pos[0], p.pos[2] - player.pos[2]) < 1.5 && Math.abs(p.pos[1] - (player.pos[1] + 0.9)) < 1.1) || null;
  for (const p of level.pickups || []) {
    const pm = new pc.StandardMaterial(); pm.diffuse = new pc.Color(p.colour[0], p.colour[1], p.colour[2]); pm.emissive = new pc.Color(p.colour[0] * 0.35, p.colour[1] * 0.35, p.colour[2] * 0.35); pm.update();
    const e = new pc.Entity('pickup_' + p.id); e.addComponent('render', { type: 'box', material: pm, castShadows: false });
    e.setLocalScale(0.32, 0.06, 0.24); e.setPosition(p.pos[0], p.pos[1] + 0.03, p.pos[2]); app.root.addChild(e); p.ent = e; p.mat = pm;
  }
  // (M6.46) a checkpoint: a first draft failed (you down, most often) can be tried again keeping what you had done -
  // terminals done, things taken. Kept for the page's reload in sessionStorage, for half an hour.
  const CP_KEY = 'frontline.checkpoint';
  const cpDone = () => ({ terminals: (level.terminals || []).filter((t) => t.done).map((t) => t.id), pickups: (level.pickups || []).filter((p) => p.taken).map((p) => p.id) });
  if (level.draft) {
    let cp = null;
    try { cp = JSON.parse(sessionStorage.getItem(CP_KEY) || 'null'); sessionStorage.removeItem(CP_KEY); } catch (e) { cp = null; }
    if (cp && cp.level === level.draft && Date.now() - (cp.at || 0) < 30 * 60 * 1000) {
      for (const t of level.terminals || []) if (cp.terminals.includes(t.id)) t.done = true;
      for (const p of level.pickups || []) if (cp.pickups.includes(p.id)) { p.taken = true; if (p.ent) p.ent.enabled = false; }
      rt_checkpoint = cp.terminals.length + cp.pickups.length;
      setTimeout(() => { try { showHint('From your checkpoint: what you had done is still done (' + rt_checkpoint + (rt_checkpoint === 1 ? ' thing' : ' things') + ') - the rest is to do again.'); } catch (e) { /* not yet */ } }, 5000);
    }
  }
  // a fixed gun that swivels (the Beachhead's artillery): E fires a shell where you are looking;
  // then it must be loaded again. level.cannons: [{ pos, reload }]
  const cannonNear = () => (level.cannons || []).find((c) => Math.hypot(c.pos[0] - player.pos[0], c.pos[2] - player.pos[2]) < 2.2 && Math.abs(c.pos[1] - player.pos[1]) < 1.2) || null;
  const gunMat = (() => { const x = new pc.StandardMaterial(); x.diffuse = new pc.Color(0.2, 0.22, 0.2); x.metalness = 0.6; x.useMetalness = true; x.gloss = 0.4; x.update(); return x; })();
  for (const c of level.cannons || []) {
    c.t = 0;
    const e = new pc.Entity('cannon'); e.setPosition(c.pos[0], c.pos[1] + 1.25, c.pos[2]);
    const bar = new pc.Entity(); bar.addComponent('render', { type: 'cylinder', material: gunMat });
    bar.setLocalScale(0.32, 3.2, 0.32); bar.setLocalEulerAngles(90, 0, 0); bar.setLocalPosition(0, 0, -1.5); e.addChild(bar);
    const brk = new pc.Entity(); brk.addComponent('render', { type: 'box', material: gunMat });
    brk.setLocalScale(0.8, 0.7, 1.0); e.addChild(brk);
    app.root.addChild(e); c.ent = e; c.yaw = c.yaw || 0;
    e.setEulerAngles(0, c.yaw * 180 / Math.PI, 0);
  }
  const fireCannon = (c) => {
    if (c.t > 0) return;
    const d = S.aimNow && S.aimNow.dir ? S.aimNow.dir : [-Math.sin(player.yaw), 0, -Math.cos(player.yaw)];
    const from = [c.pos[0] - Math.sin(c.yaw) * 3.1, c.pos[1] + 1.25, c.pos[2] - Math.cos(c.yaw) * 3.1];
    const h = level.world.raycast(from, d, 260, (q) => q.glass);
    const t = h ? h.t - 0.3 : 260, at = [from[0] + d[0] * t, from[1] + d[1] * t, from[2] + d[2] * t];
    audio.shot({ family: 'sniper' }, 1); show('flash', from);
    noises.push({ pos: c.pos, loud: 2 });
    later.push({ t: Math.min(2, t / 90), fn: () => { if (arsenal && arsenal.detonate) arsenal.detonate({ id: 'ROCKET', pos: at }, player); show('tracer', from, at); } });
    c.t = c.reload || 8;
  };
  // what the other visions show: marks and traces under UV, wiring and devices to EMF, heat to
  // thermal (pipes, machines - and every living body, through smoke and mist); and mist that thermal sees through
  const glowMat = (c, k, alpha) => { const x = new pc.StandardMaterial(); x.diffuse = new pc.Color(0, 0, 0); x.emissive = new pc.Color(c[0], c[1], c[2]); x.emissiveIntensity = k; if (alpha) { x.opacity = alpha; x.blendType = pc.BLEND_NORMAL; x.depthWrite = false; } else { x.blendType = pc.BLEND_ADDITIVE; x.depthWrite = false; } x.useLighting = false; x.update(); return x; };
  const VIS = { uv: glowMat([0.75, 0.55, 1], 2.2), emf: glowMat([0.3, 1, 0.45], 2.4), heat: glowMat([1, 0.95, 0.85], 2.0), warm: glowMat([1, 0.7, 0.4], 1.2) };
  const visEnts = { uv: [], emf: [], heat: [], mist: [] };
  const mistMat = (() => { const x = new pc.StandardMaterial(); x.diffuse = new pc.Color(0.85, 0.88, 0.9); x.emissive = new pc.Color(0.45, 0.47, 0.5); x.opacity = 0.55; x.blendType = pc.BLEND_NORMAL; x.depthWrite = false; x.update(); return x; })();
  for (const mk of level.marks || []) {
    const e = new pc.Entity('mark'); e.addComponent('render', { type: 'box', material: mk.kind === 'mist' ? mistMat : mk.kind === 'heat' && mk.warm ? VIS.warm : VIS[mk.kind], castShadows: false });
    e.setPosition((mk.min[0] + mk.max[0]) / 2, (mk.min[1] + mk.max[1]) / 2, (mk.min[2] + mk.max[2]) / 2);
    e.setLocalScale(mk.max[0] - mk.min[0], mk.max[1] - mk.min[1], mk.max[2] - mk.min[2]);
    e.enabled = mk.kind === 'mist'; e.until = mk.until || null; app.root.addChild(e); visEnts[mk.kind].push(e);
  }
  // a body's heat, for thermal: a glow over each living person
  // (Rhys: "heat signatures aren't showing through doors/walls") a body's heat is seen through what
  // stands between - walls, doors, floors - out to 40 m: drawn over everything, not hidden behind it
  const throughMat = (() => { const x = glowMat([1, 0.62, 0.32], 1.3); x.depthTest = false; x.update(); return x; })();
  // (Rhys: "they still come out looking like... white-hot tampons, rather than human shapes") a body's
  // heat in a body's shape: head, chest, hips, arms, legs - turned the way he faces, lower when he kneels
  const BODY = [['sphere', [0, 1.6, 0], [0.26, 0.28, 0.26]], ['box', [0, 1.18, 0], [0.44, 0.56, 0.24]], ['box', [0, 0.86, 0], [0.36, 0.16, 0.22]],
    ['box', [-0.1, 0.41, 0], [0.15, 0.82, 0.17]], ['box', [0.1, 0.41, 0], [0.15, 0.82, 0.17]],
    ['box', [-0.29, 1.12, -0.06], [0.12, 0.6, 0.13]], ['box', [0.29, 1.12, -0.06], [0.12, 0.6, 0.13]]];
  const heatOf = guards.concat(level.hostages || []).map((who) => {
    const e = new pc.Entity('heat');
    for (const [type, at, sc] of BODY) { const c = new pc.Entity(); c.addComponent('render', { type, material: throughMat, castShadows: false }); c.setLocalPosition(at[0], at[1], at[2]); c.setLocalScale(sc[0], sc[1], sc[2]); e.addChild(c); }
    e.enabled = false; app.root.addChild(e); return { who, e };
  });
  const visionShow = () => {
    const v = S.playing ? S.vision : 'normal';
    for (const e of visEnts.uv) e.enabled = v === 'uv';
    for (const e of visEnts.emf) e.enabled = v === 'emf';
    for (const e of visEnts.heat) e.enabled = v === 'thermal';
    for (const e of visEnts.mist) e.enabled = v !== 'thermal' && !(e.until && level.pickups.some((q) => q.id === e.until && q.taken));
    for (const h of heatOf) {
      const live = v === 'thermal' && !(h.who.dead) && !h.who.dormant && h.who.state !== 'dead' && h.who.state !== 'rescued' && !h.who.gone && Math.hypot(h.who.pos[0] - player.pos[0], h.who.pos[1] - player.pos[1], h.who.pos[2] - player.pos[2]) < 40;
      h.e.enabled = live;
      if (live) { const crouch = h.who.state === 'held' ? 0.6 : 1; h.e.setPosition(h.who.pos[0], h.who.pos[1], h.who.pos[2]); h.e.setEulerAngles(0, (h.who.yaw || 0) * 180 / Math.PI, 0); h.e.setLocalScale(1, crouch, 1); }
    }
  };
  const ledgerNear = () => level.ledger && !level.ledger.taken && Math.hypot(level.ledger.pos[0] - player.pos[0], level.ledger.pos[2] - player.pos[2]) < 1.4 && Math.abs(level.ledger.pos[1] - (player.pos[1] + 0.8)) < 1.0;
  // (Rhys: "you should have the opportunity to take the locket for yourself, THEN when
  // you speak with a Yellow, they ask for it, and you can choose whether to give it over ... or
  // keep it for yourself ... (but beware of being caught out on that lie)")
  const locketNear = () => level.locket && !level.locket.taken && Math.hypot(level.locket.pos[0] - player.pos[0], level.locket.pos[2] - player.pos[2]) < 1.4 && Math.abs(level.locket.pos[1] - (player.pos[1] + 1.1)) < 1.0;
  const jobFind = (a, b) => { nav.syncDoors(level.swingDoors); return nav.find(a, b); };
  // people who are not guards: the railway's (the ticket inspectors, M6.18.2: one at every
  // gate), the kiosk's vendor - drawn, idle, solid, to talk to; and (Rhys: "CAN you takedown a
  // Ticket Inspector? you should be ABLE to, but that causes the others to turn on you") to knock down
  const npcs = (level.npcs || []).map((n) => {
    const o = Object.assign({ faction: 'staff', voice: 'st1', down: false }, n);
    o.animState = () => ({ mode: 'walk', stance: o.cower ? 1 : 0, speed: 0, forward: 0, strafe: 0, onGround: true, vy: 0, armed: false, melee: false, aiming: false, firing: false, dashing: false, hurt: false, dead: o.down, slump: null, sitting: !!o.sitting, seated: !!(o.sitting && o.down) });
    o.solid = level.world.addSolid([o.pos[0] - 0.25, o.pos[1], o.pos[2] - 0.25], [o.pos[0] + 0.25, o.pos[1] + 1.8, o.pos[2] + 0.25], 'npc');
    o.solid.person = true;                       // (as a guard's: seen past by a witness, not stood on)
    o.home = o.pos.slice();
    if (o.arrival) o.solid.disabled = true;      // Belyagorsk's police: there once you are
    return o;
  });
  const npcBodies = npcs.map((n) => new Operative(pc, app, null, { tint: n.tint || [1, 1, 1], shadows: false, hat: n.hat }));
  const npcNear = () => npcs.find((n) => !n.down && !n.gone && n.kind !== 'police' && Math.hypot(n.pos[0] - player.pos[0], n.pos[2] - player.pos[2]) < 2.2 && Math.abs(n.pos[1] - player.pos[1]) < 1) || null;
  const announcer = { id: 'pa', faction: 'staff', title: 'Station announcement', voice: 'sva', pos: player.pos };
  const frontPA = { id: 'fmpa', faction: 'front', title: 'Front of Memory (the train\'s tannoy)', voice: 'fm1', pos: player.pos };
  // the guard, on the tannoy from his van (his own voice, through the same speakers; M6.18.11 calm, coded)
  const guardPA = { id: 'gpa', faction: 'staff', title: 'The guard (the train\'s tannoy)', voice: 'gpa', pos: player.pos };
  const gateOpen = (g) => { g = g || level.ticketGate; if (!g || g.open) return; g.open = true; g.hidden = true; g.solid.disabled = true; audio.click && audio.click(); };
  // a gate whose inspector is down: you open it yourself
  const gateNear = () => Object.values(level.gates || {}).find((g) => !g.open && Math.hypot(g.x - player.pos[0], (g.z[0] + g.z[1]) / 2 - player.pos[2]) < 1.6 && npcs.some((n) => n.platform === g.platform && n.down)) || null;
  // what things cost, in grosh (the paper's masthead: 40), and what you carry - off duty, your own money
  const PRICES = { coffee: 15, tea: 12, sandwich: 30, paper: 40 };
  const pay = (n) => { if (rt.grosh === undefined) rt.grosh = 400; if (rt.grosh < n) { showHint('Not enough money on you.'); return false; } rt.grosh -= n; audio.click && audio.click(); return true; };
  const refresh = (k) => { player.buffs = player.buffs || { awake: 0, fed: 0 }; player.buffs[k] = 600; };
  // (M6.54) what a civilian says, if their spec gives them nothing of their own
  const CIVILIAN_SAYS = ['Please - I don\'t want any trouble.', 'I didn\'t see anything. I won\'t see anything.', 'They told us to keep working and keep quiet.', 'Are you... are you with them?'];
  const talkNpc = (n) => {
    if (!n.sitting) n.yaw = Math.atan2(-(player.pos[0] - n.pos[0]), -(player.pos[2] - n.pos[2]));   // (seated, he stays facing his table)
    if (n.kind === 'inspector') {
      if (n.platform !== '3') { speak(n, STAFF_TALK['wrong' + n.platform]); return; }
      if (level.ticketGate && !level.ticketGate.open) { gateOpen(); speak(n, STAFF_TALK.checked); }
      else speak(n, STAFF_TALK.after);
    } else if (n.kind === 'trainguard') {
      // (Rhys: the guard "can't tell you from a civilian hero or a hijacker until he sees you
      // do something") his pistol, once he has seen you take one of them down
      const H = level.hijack;
      if (!level.hijacked) { showHint('The train\'s guard, at the back of his van. Tickets are the inspectors\' business.'); return; }
      if (!H.trust) { speak(n, HIJACK_TALK.guardAsk); return; }
      if (H.asked) return;
      // (Rhys) thanks, and help me take her back; then - you unarmed - his sidearm; and he comes with you
      H.asked = true; speak(n, HIJACK_TALK.guardTrust);
      later.push({ t: 4.6, fn: () => {
        const lo = loadout(), armed = !!(lo && (lo.slots.primary || lo.slots.backup));
        if (!armed) {
          H.gave = true; speak(n, HIJACK_TALK.guardGive);
          dropAt(ARMS.pistol.item, ARMS.pistol.model, groundBelow(level.world, [player.pos[0], player.pos[1], player.pos[2]]), ARMS.pistol.mag * 3);
          showHint('The guard hands you his pistol - a PX9, and three magazines (E to take it) - and takes the rifle from the van\'s locker. He is with you.');
        } else { speak(n, HIJACK_TALK.guardJoin); showHint('The guard takes the rifle from the van\'s locker. He is with you.'); }
        joinGuard(n);
      } });
    } else if (n.kind === 'minister') {
      // (Rhys: "the Minister isn't very conversational")
      speak(n, !level.hijacked ? HIJACK_TALK.minPre : level.hijack.minister === 'alive' && holders().length ? HIJACK_TALK.minHeld : HIJACK_TALK.minSaved);
    } else if (n.kind === 'steward') {
      if (level.hijacked) { speak(n, HIJACK_TALK.stewHide); return; }
      speak(n, HIJACK_TALK.stewHello);
      // (Rhys: "is all the food, drink and newspaper free?" - and the last sandwich, every time)
      // paid for, from what you carry; two sandwiches left tonight; and what they do is not healing
      const left = rt.sandwiches === undefined ? (rt.sandwiches = 2) : rt.sandwiches;
      rt.choose('Buffet', 'Tea, coffee, something to eat?', [
        ['A tea, please.  (' + PRICES.tea + ' grosh)', () => { if (!pay(PRICES.tea)) return; speak(n, HIJACK_TALK.stewTea); refresh('awake'); showHint('Strong, stewed, and very welcome: you will keep going longer for a while. (' + PRICES.tea + ' grosh - ' + rt.grosh + ' left)'); }],
        [left ? 'A sandwich.  (' + PRICES.sandwich + ' grosh)' : 'A sandwich?', () => {
          if (!rt.sandwiches) { speak(n, HIJACK_TALK.stewSoldOut); return; }
          if (!pay(PRICES.sandwich)) return;
          rt.sandwiches--; speak(n, rt.sandwiches ? HIJACK_TALK.stewSandwichOne : HIJACK_TALK.stewSandwich); refresh('fed');
          showHint('Cheese and pickle, slightly squashed: fed, you will mend quicker for a while if you are hurt. (' + PRICES.sandwich + ' grosh - ' + rt.grosh + ' left)');
        }],
        ['Nothing, thanks.', () => {}],
      ]);
    } else if (n.kind === 'civilian') {
      // (M6.54) a civilian: a line of their own, said (no voice), a different one each time
      const says = n.says && n.says.length ? n.says : CIVILIAN_SAYS;
      n.saidI = ((n.saidI === undefined ? -1 : n.saidI) + 1) % says.length;
      showHint(n.title + ': \u201c' + (n.cower ? 'Please - please don\'t shoot. I\'ll stay down.' : says[n.saidI]) + '\u201d');
    } else if (n.kind === 'vendor') {
      // (Rhys) the first time, in Severian; once you have answered him (in English), English
      const first = !rt.kioskMet; rt.kioskMet = true;
      speak(n, first ? STAFF_TALK.kioskSev : STAFF_TALK.kiosk);
      rt.choose('Kiosk', first ? STAFF_TALK.kioskSev : 'Coffee? A paper?', [
        ['A coffee, please.  (' + PRICES.coffee + ' grosh)', () => { if (!pay(PRICES.coffee)) return; speak(n, STAFF_TALK.coffee); rt.coffees = (rt.coffees || 0) + 1; refresh('awake'); showHint('Hot, strong, and far too sweet - you will keep going longer for a while. (' + PRICES.coffee + ' grosh - ' + rt.grosh + ' left)'); }],
        ['The evening paper.  (' + PRICES.paper + ' grosh)', () => { if (!rt.paperBought && !pay(PRICES.paper)) return; rt.paperBought = true; speak(n, STAFF_TALK.paper); rt.read(NEWSPAPER); }],
        ['Nothing, thanks.', () => {}],
      ]);
    }
  };
  const npcPrompt = (n) => n.kind === 'trainguard' ? 'E  Talk to the guard' : n.kind === 'minister' ? 'E  Talk to the Minister' : n.kind === 'steward' ? (level.hijacked ? 'E  Talk to the steward' : 'E  Tea - coffee - sandwiches') : n.kind === 'inspector' ? (n.platform === '3' && level.ticketGate && !level.ticketGate.open ? 'E  Show your ticket' : n.platform !== '3' && !level.gates[n.platform].open ? 'E  Show your ticket' : 'E  Talk to the ticket inspector') : n.kind === 'vendor' ? 'E  Coffee - newspapers' : n.kind === 'civilian' ? 'E  Talk to ' + n.title.replace(/^(The|A) /, (w) => w.toLowerCase()) : 'E  Talk';
  // knocked down: his body falls; anyone of them who can see it shouts for the police,
  // and the station's police come for you - unless the train has taken you out of their reach
  const seesNpc = (a, b) => {
    // his body on the floor - or (a moment after) him going down, over his lectern
    return (b.fell === undefined || S.time - b.fell < 1.5 ? [0.4, 1.3] : [0.4]).some((hy) => {
      const e = [a.pos[0], a.pos[1] + 1.6, a.pos[2]], t = [b.pos[0], b.pos[1] + hy, b.pos[2]], d = Math.hypot(t[0] - e[0], t[1] - e[1], t[2] - e[2]);
      if (d > 30) return false;
      return !level.world.raycast(e, [(t[0] - e[0]) / d, (t[1] - e[1]) / d, (t[2] - e[2]) / d], d - 0.3, (q) => q.person || q.glass);
    });
  };
  const npcAlarm = () => {
    if (level.police) return;
    const down = npcs.filter((q) => q.down), w = npcs.find((q) => !q.down && q.kind === 'inspector' && down.some((d) => seesNpc(q, d)));
    if (!w) return;
    level.police = { t: 8, by: w.id };
    speak(w, STAFF_TALK.police);
    showHint('They have seen. The station\'s police are on their way.');
  };
  const takedownNpc = () => {
    if (player.mode !== 'walk') return null;
    return npcs.find((n) => !n.down && n.kind !== 'police' && !n.onTrain && Math.hypot(n.pos[0] - player.pos[0], n.pos[2] - player.pos[2]) < 1.3 && Math.abs(n.pos[1] - player.pos[1]) < 1) || null;
  };
  // the hijack. The six come out of hiding; the cab is theirs (its door open now); the
  // Minister is held in first class. While either of the two over him stands, a fight they are in
  // there (alert) burns a fuse of HIJACK.fuse seconds - and at Belyagorsk, they kill him regardless
  // the guard joins you: the man at his desk becomes a fighting man at your back
  const joinGuard = (n) => {
    const g = level.allyGuard; if (!g || level.hijack.joined) return;
    level.hijack.joined = true;
    n.gone = true; n.solid.disabled = true;
    g.pos = n.pos.slice(); g.home = { pos: n.pos.slice(), yaw: n.yaw }; g.yaw = n.yaw; g.moveBody && g.moveBody();
    g.dormant = false; g.target.solid.disabled = false;
    g.escort = { lead: true, lag: 2.2 };
  };
  const holders = () => (level.hijackers || []).filter((g) => g.holds && !g.dead && !g.dormant);
  const ministerNpc = () => npcs.find((n) => n.kind === 'minister');
  const killMinister = (why) => {
    const H = level.hijack, mn = ministerNpc();
    if (!H || H.minister !== 'alive') return;
    H.minister = 'dead'; if (mn) { mn.down = true; mn.solid.disabled = true; }
    audio.shot({ family: 'pistol' }, mn ? Math.max(0.15, Math.min(1, 1.1 - Math.hypot(mn.pos[0] - player.pos[0], mn.pos[2] - player.pos[2]) / 45)) : 0.5);
    showHint(why + ' The Front will take Belyagorsk for this.');
  };
  const seenByYou = (g) => {
    const e = player.eyePos, t = [g.pos[0], g.pos[1] + 1.1, g.pos[2]], d = Math.hypot(t[0] - e[0], t[1] - e[1], t[2] - e[2]);
    if (d < 2.5) return true;
    if (d > 30) return false;
    return !level.world.raycast(e, [(t[0] - e[0]) / d, (t[1] - e[1]) / d, (t[2] - e[2]) / d], d - 0.3, (q) => q.person || q.glass || q === g.target.solid);
  };
  const wakeHijacker = (g) => { g.dormant = false; g.wakeLater = false; g.target.solid.disabled = false; };
  const hijackNow = () => {
    level.hijacked = true;
    // (Rhys: "one of them spawned behind me") any you could see now comes out only once you cannot
    for (const g of level.hijackers) { if (seenByYou(g)) g.wakeLater = true; else wakeHijacker(g); }
    const cab = (level.swingDoors || []).find((d) => d.def.label === 'cab door');
    // (Rhys: "Front of Memory were kind enough to open the reinforced door for me") they lock
    // themselves in: the cab door stays shut and locked - breach it (the buffet man's BR-12)
    if (cab) { cab.set(false, 1); cab.locked = true; nav.syncDoors(level.swingDoors); }
    if (player.seated) player.stand();
    speak(frontPA, HIJACK_TALK.hijack);
    showHint('Out of the tunnel - and the Front of Memory have the train: six of them, two locked in the locomotive, Minister Dravets held in first class (Coach 1). You have no weapon. The guard in the van might help.');
  };
  const hijackTick = (dt, run) => {
    const H = level.hijack;
    for (const g of level.hijackers) if (g.wakeLater && !seenByYou(g)) wakeHijacker(g);
    // the guard trusts you once he has seen one of them go down (or has had one standing over him)
    const tg = npcs.find((n) => n.kind === 'trainguard');
    for (const g of level.hijackers) if (g.dead && !g.seenDown) {
      g.seenDown = true;
      if (tg && !tg.down && (g.id === 'fm_van' || seesNpc(tg, g))) { if (!H.trust) showHint('The guard saw that. He knows whose side you are on now.'); H.trust = true; }
    }
    if (H.minister === 'alive') {
      // (Rhys: "the Minister died before there was anything I could do") the fuse burns only for
      // a fight there, in first class - one of them seeing you, or you (or the guard) in the coach
      const inA = (p) => inCoach(p, 'A'), ally = level.allyGuard;
      const hs = holders(), fighting = hs.some((g) => g.state === 'alert' && (g.seeing || inA(player.pos) || (ally && !ally.dormant && !ally.dead && inA(ally.pos))));
      H.fuse = fighting ? H.fuse + dt : Math.max(0, H.fuse - dt * 0.5);
      if (fighting && !H.warned) { H.warned = true; showHint('A fight in first class - and the Minister is in their hands. Be quick.'); }
      if (H.fuse > HIJACK.fuse) killMinister('They have shot Minister Dravets.');
    }
    // a reason to go to the van first: the guard calls for help over the tannoy - and is cut off
    H.since += dt;
    const vanMan = level.hijackers.find((g) => g.id === 'fm_van');
    // (said once the tannoy is free - not over someone else's words)
    if (!H.called && H.since >= HIJACK.call) {
      const near = tg && Math.hypot(tg.pos[0] - player.pos[0], tg.pos[2] - player.pos[2]) < 8;
      if (!(tg && !tg.down && !H.trust && !H.joined && vanMan && !vanMan.dead && !near) || H.since > HIJACK.call + 30) H.called = 'no';
      else if (speak(guardPA, HIJACK_TALK.guardPA)) {
        H.called = true;
        // (Rhys: "a Guard taken hostage wouldn't make an announcement like that - he'd probably
        // encode something in an otherwise calm and peaceful message") calm, with a gun on him - and a call
        // for an inspector who does not exist: "Pesak" (sand), the railway's own Inspector Sands
        later.push({ t: 17.5, fn: () => {
          if (vanMan.dead || H.trust) return;
          showHint('There is no Inspector Pesak - it is the railway\'s call for help. The guard, in his van at the back of the train, with one of them over him.');
        } });
      }
    }
    if (!H.done && level.hijackers.every((g) => g.dead)) { H.done = true; audio.stepDone && audio.stepDone(); showHint((H.minister === 'alive' ? 'The last of the six is down. The Minister is safe, and the train is yours.' : 'The last of the six is down - too late for the Minister.') + ' Take a seat (E): the rest of the journey can pass.'); }
    // (Rhys: "waiting around for 18 mins is going to feel like AGES") the six down: sit, or
    // wait a while, and the rest of the journey passes
    if (H.done && !H.skipped && !rt.skip) { H.rest += dt; if (H.rest >= HIJACK.rest) startSkip(); }
  };
  // a fade to black; the train on, nearly to Belyagorsk; and back
  const startSkip = () => { const H = level.hijack; if (!H || H.skipped || rt.skip || level.trainRun.approached || level.trainRun.state !== 'running') return false; H.skipped = true; rt.skip = { t: 0 }; return true; };
  const skipTick = (dt) => {
    const sk = rt.skip, run = level.trainRun, el = typeof document !== 'undefined' && document.getElementById('fade');
    sk.t += dt;
    let k;
    if (sk.t < 1.2) k = sk.t / 1.2;
    else if (sk.t < 3.2) {
      k = 1;
      if (!sk.done) {
        sk.done = true;
        run.skipAhead();
        showHint('The rest of the journey passes quietly. ' + run.clock().slice(0, 5) + ' - Belyagorsk in ' + Math.max(1, Math.ceil(run.eta() / 60)) + ' minutes.');
      }
    } else if (sk.t < 4.7) k = 1 - (sk.t - 3.2) / 1.5;
    else { k = 0; rt.skip = null; }
    if (el) { el.style.opacity = Math.max(0, Math.min(1, k)).toFixed(3); el.style.display = k > 0 ? 'block' : 'none'; }
  };
  // the train's run: aboard (in the train), the doors close a while after; then away.
  // The station is drawn sliding back (its mover); its solids go once you are moving.
  const trainTick = (dt) => {
    const run = level.trainRun;
    run.step(dt, player.mode !== 'dead' && inTrain(player.pos));
    // an inspector asks, as you come up to him
    for (const n of npcs) if (n.kind === 'inspector' && !n.down && !n.asked && level.gates && !level.gates[n.platform].open && Math.hypot(n.pos[0] - player.pos[0], n.pos[2] - player.pos[2]) < 5) { n.asked = true; speak(n, STAFF_TALK.tickets); }
    // seen knocked down: the police; when they come (still at the station), the end of it
    if (run.state === 'waiting') {
      npcAlarm();
      if (level.police && (level.police.t -= dt) <= 0) { rt.fail('The station police arrested you at Novomir Central.'); return; }
    }
    // stood up from your seat: the time runs as ever
    if (!player.seated && run.fast) run.unsit();
    // out of the city tunnel: the Front of Memory take the train
    if (level.hijackers && !level.hijacked && run.moving && run.dist >= HIJACK.at) hijackNow();
    if (level.hijacked) hijackTick(dt, run);
    if (rt.skip) skipTick(dt);
    for (const e of run.events) {
      if (e.type === 'warn') speak(announcer, STAFF_TALK.depart);
      if (e.type === 'missed') { rt.fail('You missed the 21:40 to Belyagorsk.'); return; }
      if (e.type === 'close') {
        level.trainDoors.hidden = false;
        for (const d of level.trainDoors.spans) d.solid.disabled = false;
        audio.door && audio.door(false);
        showHint('The doors close.');
      }
      // coming into Belyagorsk; in; the doors open, the platform there to step onto
      if (e.type === 'approach') {
        speak(announcer, STAFF_TALK.arrive);
        // Belyagorsk's lights, and the police: whoever of them still holds the Minister kills him
        if (level.hijacked && level.hijack.minister === 'alive' && holders().length) killMinister('As the lights of Belyagorsk come up, the Front of Memory shoot Minister Dravets.');
      }
      if (e.type === 'arrive') {
        level.trainDoors.hidden = true;
        for (const d of level.trainDoors.spans) d.solid.disabled = true;
        for (const sld of level.arrivalSolids || []) sld.disabled = false;
        for (const n of npcs) if (n.arrival) n.solid.disabled = false;
        audio.door && audio.door(true);
        showHint('Belyagorsk - Alyejka Azvestya. The doors open. Armed police line the platform.');
      }
      if (e.type === 'depart') {
        for (const sld of level.stationSolids || []) sld.disabled = true;
        for (const g of Object.values(level.gates || {})) g.hidden = true;     // (their leaves are the train's to draw: they stay behind with the station)
        for (const n of npcs) if (!n.arrival) n.solid.disabled = true;           // Novomir's people stay at Novomir
        showHint('The 21:40 pulls out of Novomir Central, under the city and away east.');
      }
    }
    run.events.length = 0;
    // stepped off at Belyagorsk: the end of the line
    const A = level.arrival;
    if (run.state === 'arrived' && A && !m.done && player.mode === 'walk' && !inTrain(player.pos) && player.pos[2] > A.z0 && player.pos[1] > FLOOR_Y - 0.3) {
      rt.endHotel(outcome());
    }
  };
  // (Rhys: "Players will now expect to be able to use terminals (hacks, downloads,
  // etc) - so, let's not disappoint") the coil's security post: hold E at its screen and the
  // Cash Vault's steel doors unlock, and the guard rota puts every red on your radar a while
  const terminalNear = () => (level.terminals || []).find((t) => Math.hypot(t.pos[0] - player.pos[0], t.pos[2] - player.pos[2]) < 1.6 && Math.abs(t.pos[1] - player.pos[1] - 0.9) < 1.0) || null;
  const hacked = (t) => {
    // a security terminal: its network's cameras and turrets - yours to set (devices.js)
    if (t.net) { hackChoice(netDevices(t.net), 'Security terminal: ' + netDevices(t.net).length + ' cameras and turrets on its network.', () => { t.done = true; }); return; }
    t.done = true;
    // the vault's own doors only: the Tournament Room's stay locked - breach them
    for (const d of level.swingDoors) if (d.locked && d.def.vault) d.unlock();
    nav.syncDoors(level.swingDoors);
    level.revealT = t.reveal || 45;
    audio.confirm();
    showHint(t.said || ('Security terminal: the Cash Vault\'s own steel doors are unlocked (the Tournament Room\'s still need breaching), and the guard rota puts every red on your radar for ' + Math.round(level.revealT) + ' seconds.'));
  };
  const takeLocket = () => {
    level.locket.taken = true; level.locket.by = 'you'; m.locketMine = true; audio.pickup();
    // whoever of them saw you take it knows; the rest only suspect
    const ctxW = { world: level.world, smokes: [] };
    rt.locketSeenBy = guards.filter((y) => y.faction === 'yellow' && !y.dead && !y.away && !y.target.down &&
      y.canSee([level.locket.pos[0], level.locket.pos[1] + 0.1, level.locket.pos[2]], ctxW, 10)).map((y) => y.id);
    showHint(job && job.stage !== 'idle' ? 'The boss\'s locket - in your pocket. He will want it.' : 'A gold locket, in a velvet case. Someone wants this badly enough to keep it in a vault.');
  };
  // the boss asks; you answer with a click (the game waits)
  const askLocket = (y, missing) => {
    const boss = guards.find((q) => q.faction === 'yellow' && q.boss && !q.dead && !q.target.down) || y;
    const q = missing ? YELLOW_TALK.askMissing : YELLOW_TALK.ask;
    speak(boss, q);
    rt.choose(boss.title ? 'The Yellows\' boss' : 'The Yellows', q, [
      [LOCKET_CHOICES.give, () => answerLocket('give', boss)],
      [LOCKET_CHOICES.deny, () => answerLocket('deny', boss)],
    ]);
  };
  const answerLocket = (how, boss) => {
    if (how === 'give') {
      rt.locketAnswer = 'gave';
      job.give(jobFind); level.locket.by = 'yellows';
      speak(boss, YELLOW_TALK.thanks);
      showHint('You gave the boss his locket. The Yellows are leaving - down the coil and out of the front door.');
      return;
    }
    if (rt.locketSeenBy && rt.locketSeenBy.length) {
      // caught out: one of them watched you take it
      rt.locketAnswer = 'caught';
      if (standing) standing.turn('lied');
      turnYellows(YELLOW_TALK.caught);
      return;
    }
    rt.locketAnswer = 'lied';
    job.giveUp(jobFind);
    speak(boss, YELLOW_TALK.believed);
    showHint('They believed you. The Yellows are leaving empty-handed - and the locket stays in your pocket.');
  };
  let armed = false;
  // a shout: the guards within earshot come looking where he saw you
  // a shout: see raiseAlarm in guard.js (rank, temperament and floors decide who comes)
  // the man who shouts asks for backup, a moment after his first shout; the
  // first to answer says he is coming
  const later = [];
  const alarm = (from, pos, opts) => {
    if (neutral(from)) return [];                            // a Yellow at peace with you calls no one about you
    const answered = raiseAlarm(guards, from, pos, opts);
    if (!(opts && opts.rival)) siren(from.faction, pos);
    if (answered.length) {
      later.push({ t: 1.4, fn: () => bark(from, lineFor('backup'), 'backup') });
      const first = answered.find((g) => g.temper === 'bold') || answered[0];
      later.push({ t: 2.6, fn: () => bark(first, lineFor('coming'), 'coming') });
    }
    return answered;
  };
  // ── defence systems: cameras and turrets (sim/world/devices.js) ─────────────────────────────
  const devices = (level.devices || []).map((d) => new Device(d));
  level.liveDevices = devices;                             // (the EMP finds them here)
  // (M6.28) a camera or turret can be shot out: a small target round its head (no score, not a person)
  for (const d of devices) {
    if (d.kind !== 'camera' && d.kind !== 'turret') continue;
    const r = d.kind === 'camera' ? 0.14 : 0.3;
    d.shot = makeTarget(level.world, [d.pos[0] - r, d.pos[1] - r * 0.8, d.pos[2] - r], [d.pos[0] + r, d.pos[1] + r * 0.8, d.pos[2] + r], { hp: d.kind === 'camera' ? 12 : 70, score: 0, respawn: 1e9 });
    d.shot.device = d;
  }
  // (M6.29) the specialists: an engineer puts a hacked network back on at its terminal; a radio
  // operator, once he has seen you, calls the whole place in - unless he is stopped first
  const SPEC = { fix: 6, radio: 6, order: 3, heal: 5 };
  const specials = { fixT: {}, sentT: 0, radioed: false };
  const live = (g) => g && !g.dead && !g.dormant && !(g.target && g.target.down) && g.state !== 'flee';
  const specialists = (dt) => {
    specials.sentT -= dt;
    for (const t of level.terminals || []) {
      if (!t.net) continue;
      const net = netDevices(t.net), hacked = net.some((d) => !d.broken && d.mode !== 'on');
      if (!hacked) { delete specials.fixT[t.net]; continue; }
      const owner = (net[0] || {}).owner || 'red';
      const eng = guards.filter((g) => g.role === 'engineer' && g.faction === owner && live(g) && g.state !== 'alert')
        .sort((a, b) => Math.hypot(a.pos[0] - t.pos[0], a.pos[2] - t.pos[2]) - Math.hypot(b.pos[0] - t.pos[0], b.pos[2] - t.pos[2]))[0];
      if (!eng) { delete specials.fixT[t.net]; continue; }
      const at = Math.hypot(eng.pos[0] - t.pos[0], eng.pos[2] - t.pos[2]) < 1.9 && Math.abs(eng.pos[1] - t.pos[1]) < 1.5;
      if (!at) {
        delete specials.fixT[t.net];
        if (specials.sentT <= 0) {
          specials.sentT = SPEC.order;
          if (!eng.fixing) { eng.fixing = true; bark(eng, lineFor('fixing'), 'fixing'); showHint('An engineer is on his way to ' + (t.label || 'the security terminal') + ' to put the system back on.'); }
          eng.stim = [t.pos[0], t.pos[1], t.pos[2]]; eng.since = 0; eng.state = 'search'; eng.stateT = 0; eng.path = null; eng.pursuit = false;
        }
        continue;
      }
      specials.fixT[t.net] = (specials.fixT[t.net] || 0) + dt;
      if (specials.fixT[t.net] >= SPEC.fix) {
        delete specials.fixT[t.net];
        for (const d of net) if (!d.broken) { d.mode = 'on'; d.owner = owner; d.jammed = 0; }
        syncLocks(devices); nav.syncDoors(level.swingDoors);
        t.done = false; eng.fixing = false;
        bark(eng, lineFor('fixed'), 'fixed');
        showHint('The engineer has put the security system back on - cameras, turrets' + (net.some((d) => d.kind === 'lock') ? ', locks' : '') + ' and all.');
      }
    }
    // the medic: to the nearest man knocked out (not killed), and in a few seconds he is up again
    for (const md of guards) {
      if (md.role !== 'medic' || !live(md) || md.state === 'alert') continue;
      if (md.patient && (!md.patient.dead || !md.patient.knockedOut)) md.patient = null;
      if (!md.patient) {
        let best = null, bd = 30;
        for (const g of guards) {
          if (g === md || !g.dead || !g.knockedOut || g.tied || g.faction !== md.faction || g.gone || g.carried || guards.some((o) => o !== md && o.patient === g)) continue;
          const d = Math.hypot(g.pos[0] - md.pos[0], g.pos[2] - md.pos[2]) + Math.abs(g.pos[1] - md.pos[1]) * 4;
          if (d < bd) { bd = d; best = g; }
        }
        if (!best) continue;
        md.patient = best; md.healT = 0; bark(md, lineFor('medic'), 'medic');
      }
      const pt = md.patient, near = Math.hypot(pt.pos[0] - md.pos[0], pt.pos[2] - md.pos[2]) < 1.7 && Math.abs(pt.pos[1] - md.pos[1]) < 1.2;
      if (!near) {
        if ((md.orderT = (md.orderT || 0) - dt) <= 0) { md.orderT = SPEC.order; md.stim = pt.pos.slice(); md.since = 0; md.state = 'search'; md.stateT = 0; md.path = null; md.pursuit = false; }
        md.healT = 0; continue;
      }
      md.healT = (md.healT || 0) + dt;
      if (md.healT >= SPEC.heal) {
        pt.revive(pt.pos, pt.yaw);
        pt.awareness = 0.8; pt.state = 'search'; pt.stim = pt.pos.slice(); pt.since = 0; pt.stateT = 0;
        md.patient = null; md.healT = 0;
        bark(md, lineFor('revived'), 'revived');
        showHint('A medic has brought one of them round. Drop the medic first.');
      }
    }
    // the radio operator: seen you, and still standing - a few seconds and he has called it in
    for (const g of guards) {
      if (g.role !== 'radio' || g.radioed) continue;
      if (!live(g) || g.state !== 'alert') { g.radioT = 0; continue; }
      if (!g.radioT) { bark(g, lineFor('radio'), 'radio'); showHint('The radio operator is calling it in - stop him!'); }
      g.radioT = (g.radioT || 0) + dt;
      if (g.radioT >= SPEC.radio) {
        g.radioed = true;
        const came = raiseAlarm(guards, { pos: g.pos, rank: 'officer', faction: g.faction }, player.pos.slice(), { everywhere: true });
        callReserves(g.faction, player.pos.slice());
        showHint('He got through. Every ' + (g.faction === 'yellow' ? 'Yellow' : 'red') + ' in the place is coming' + (came.length ? ' - ' + came.length + ' of them.' : '.'));
      }
    }
  };
  // (M6.28) the laser tripwires: break one and they know where you are
  let prevAt = null;
  const lasersWatch = () => {
    const here = player.pos.slice();
    if (prevAt && player.mode !== 'dead') for (const d of devices) {
      if (d.kind !== 'laser' || (d.tripT || 0) > m.time) continue;
      if (!breaks(d, prevAt, { pos: here, h: player.stanceHeight || 1.8 })) continue;
      d.tripT = m.time + 8; d.known = true;
      m.spotted++;
      const came = raiseAlarm(guards, { pos: d.pos, rank: 'officer', faction: d.owner }, here);
      audio.deny && audio.deny();
      showHint('You broke a laser tripwire' + (came.length ? ' - ' + came.length + ' on the way.' : '.') + ' (Night vision or UV shows the beams; go under on your belly, or over.)');
      siren(d.owner, here);
    }
    prevAt = here;
  };
  // (M6.30) the guard dogs: each at its handler's heel (sim/people/dog.js); drawn here, a body of boxes,
  // its legs going as it runs
  const dogs = guards.filter((g) => g.hasDog).map((g) => makeDog(level.world, { id: g.id + '-dog', pos: [g.pos[0] + 0.7, g.pos[1], g.pos[2] + 0.9], yaw: g.yaw, handler: g }));
  level.dogs = dogs;
  const dogMat = (r, g2, b) => { const mt = new pc.StandardMaterial(); mt.diffuse = new pc.Color(r, g2, b); mt.gloss = 0.2; mt.update(); return mt; };
  const DOG_COAT = dogMat(0.22, 0.17, 0.12), DOG_DARK = dogMat(0.08, 0.07, 0.06), DOG_TAN = dogMat(0.55, 0.4, 0.24);
  const dogBits = (parent, sx, sy, sz, x, y, z, m) => { const e = new pc.Entity(); e.addComponent('render', { type: 'box', material: m, castShadows: true }); e.setLocalScale(sx, sy, sz); e.setLocalPosition(x, y, z); parent.addChild(e); return e; };
  for (const d of dogs) {
    const e = new pc.Entity('dog-' + d.id); app.root.addChild(e);
    dogBits(e, 0.26, 0.26, 0.72, 0, 0.52, 0, DOG_COAT);                    // the body
    dogBits(e, 0.22, 0.2, 0.3, 0, 0.58, 0.05, DOG_DARK);                   // the saddle
    dogBits(e, 0.17, 0.2, 0.2, 0, 0.66, -0.36, DOG_COAT);                  // the neck
    dogBits(e, 0.22, 0.22, 0.26, 0, 0.8, -0.48, DOG_COAT);                 // the head
    dogBits(e, 0.13, 0.11, 0.2, 0, 0.75, -0.68, DOG_TAN);                  // the muzzle
    dogBits(e, 0.06, 0.05, 0.03, 0, 0.79, -0.79, DOG_DARK);                // the nose
    for (const sx of [-0.07, 0.07]) dogBits(e, 0.05, 0.13, 0.04, sx, 0.97, -0.45, DOG_DARK);   // the ears
    d.tail = dogBits(e, 0.05, 0.05, 0.3, 0, 0.62, 0.48, DOG_COAT);
    d.legs = [[-0.09, -0.25], [0.09, -0.25], [-0.09, 0.25], [0.09, 0.25]].map(([lx, lz]) => {
      const hip = new pc.Entity(); hip.setLocalPosition(lx, 0.42, lz); e.addChild(hip);
      dogBits(hip, 0.07, 0.42, 0.08, 0, -0.21, 0, DOG_TAN); return hip;
    });
    d.ent = e; d.phase = Math.random() * 6;
  }
  const drawDogs = (dt) => {
    for (const d of dogs) {
      d.ent.setPosition(d.pos[0], d.pos[1], d.pos[2]);
      if (d.dead) { d.ent.setEulerAngles(0, d.yaw * 180 / Math.PI, 85); d.ent.setPosition(d.pos[0], d.pos[1] + 0.12, d.pos[2]); continue; }
      d.ent.setEulerAngles(0, d.yaw * 180 / Math.PI, 0);
      d.phase += dt * (d.speed > 3 ? 16 : d.speed > 0.2 ? 8 : 0);
      const sw = d.speed > 0.2 ? (d.speed > 3 ? 38 : 22) : 0;
      d.legs.forEach((leg, i) => leg.setLocalEulerAngles(Math.sin(d.phase + (i === 0 || i === 3 ? 0 : Math.PI)) * sw, 0, 0));
      d.tail.setLocalEulerAngles(d.state === 'alert' ? -35 : 10 + Math.sin(d.phase * 0.5) * 10, Math.sin(performance.now() / 120) * (d.state === 'alert' ? 5 : 25), 0);
    }
  };
  const dogsStep = (dt) => {
    if (!dogs.length) return;
    const you = { pos: player.pos, dead: player.mode === 'dead' };
    for (const d of dogs) {
      d.step(dt, { world: level.world, nav, you,
        alarm: (dog, pos) => { const came = raiseAlarm(guards, { pos: dog.pos, rank: 'guard', faction: dog.faction }, pos); siren(dog.faction, pos); if (!rt.dogHint) { rt.dogHint = true; showHint('A dog has your scent' + (came.length ? ' - ' + came.length + ' coming.' : '.') + ' It smells you in the dark and through camouflage; shoot it, or dart it.'); } },
        bite: (dog, dmg) => { player.damage(dmg * diff().damage, 'bitten', dog.pos); } });
      for (const ev of d.events.splice(0)) {
        const far = Math.max(0.1, Math.min(1, 1.2 - Math.hypot(ev.pos[0] - player.pos[0], ev.pos[2] - player.pos[2]) / 30));
        if (ev.type === 'bark') { audio.bark && audio.bark(far); noises.push({ pos: ev.pos, loud: 0.8 }); }
        if (ev.type === 'bite') audio.bite && audio.bite();
      }
    }
  };
  const brokenWatch = () => {
    for (const d of devices) if (d.shot && d.shot.down && !d.broken) {
      d.broken = true; d.mode = 'off';
      showHint((d.kind === 'camera' ? 'Camera' : 'Turret') + ' shot out.');
      noises.push({ pos: d.pos.slice(), loud: 0.6 });
    }
  };
  const trace = new Trace();
  const netDevices = (net) => devices.filter((d) => d.net === net);
  // (M6.30) the reserves: men not here yet, called in by the radio or the siren - they come in from where they
  // were placed (the gate, the road), straight for where you were
  const callReserves = (faction, pos) => {
    const rs = guards.filter((g) => g.reserve && g.dormant && g.faction === faction);
    if (!rs.length) return;
    for (const g of rs) { g.dormant = false; g.target.solid.disabled = false; g.awareness = 0.9; g.stim = pos.slice(); g.since = 0; g.state = 'search'; g.stateT = 0; g.path = null; g.pursuit = true; }
    later.push({ t: 2.5, fn: () => showHint('Reinforcements: ' + rs.length + ' more coming in.') });
  };
  // (M6.28) the alarm: while one is on, a shout or a camera sets off the siren - and every guard of
  // its side, anywhere in the place, comes to where you were seen
  const sir = { cool: 0, t: 0 };
  const siren = (faction, pos) => {
    if (!devices.length || sir.cool > 0) return;
    const bell = sirenFor(devices, faction || null);
    if (!bell) return;
    sir.cool = SIREN.again; sir.t = SIREN.secs; rt.sirenRung = true;      // (M6.84) for 'quiet': the alarm has sounded
    const came = raiseAlarm(guards, { pos: bell.pos, rank: 'officer', faction: bell.owner }, pos, { everywhere: true });
    callReserves(bell.owner, pos);
    if (audio.siren) audio.siren(SIREN.secs);
    showHint('The alarm is sounding - ' + (came.length ? came.length + ' more on the way.' : 'the whole place knows.') + (devices.some((d) => d.kind === 'alarm' && d.net) ? ' (Hack the security system to silence it.)' : ''));
  };
  // (M6.28) the lights: where a circuit is out, it is dark - for the guards (only what is close, or
  // what night vision shows them) and for you (level.blackout: your screen goes dark there too)
  const dark = devices.some((d) => d.kind === 'lights') ? (p) => !!darkAt(devices, p) : null;
  level.blackout = dark;
  const wasOut = new Set();
  const lightsWatch = () => {
    for (const d of devices) {
      if (d.kind !== 'lights') continue;
      const out = lightsOut(d);
      if (out && !wasOut.has(d)) {
        wasOut.add(d);
        // the guards under it: what was that?
        for (const g of guards) if (!g.dead && d.area && g.pos[0] >= d.area[0][0] && g.pos[0] <= d.area[1][0] && g.pos[2] >= d.area[0][2] && g.pos[2] <= d.area[1][2] && Math.abs(g.pos[1] - d.area[0][1]) < 3) g.awareness = Math.max(g.awareness || 0, 0.45);
        showHint('The lights are out' + (d.name ? ' in ' + d.name : '') + '. In the dark they see only what is close.');
      } else if (!out && wasOut.has(d)) { wasOut.delete(d); showHint('The lights are back on' + (d.name ? ' in ' + d.name : '') + '.'); }
    }
  };
  // a camera that sees you calls it in: the guards near it come to where you were
  const deviceAlarm = (dev, pos) => {
    const answered = raiseAlarm(guards, { pos: dev.pos, rank: 'officer', faction: dev.owner }, pos);
    audio.deny && audio.deny();
    showHint('A camera has seen you' + (answered.length ? ' - ' + answered.length + (answered.length === 1 ? ' guard is' : ' guards are') + ' on the way.' : '.'));
    siren(dev.owner, pos);
  };
  // a turret's round: at you, or (taken over) at a guard
  const deviceShot = (dev, ev) => {
    const d = Math.hypot(dev.pos[0] - player.pos[0], dev.pos[1] - player.pos[1], dev.pos[2] - player.pos[2]);
    const f = dev.facing, from = [dev.pos[0] - Math.sin(f) * 0.55, dev.pos[1], dev.pos[2] - Math.cos(f) * 0.55];
    audio.shot({ family: 'rifle' }, Math.max(0.12, Math.min(1, 1.1 - d / 45)));
    show('flash', from); show('tracer', from, ev.to);
    noises.push({ pos: from, loud: 1 });
    if (ev.at) {
      const o = ev.at;
      if (ev.hit && !o.dead && !o.target.down) {
        o.target.hp -= ev.damage * GUNFIGHT;
        o.awareness = 1;
        if (o.target.hp <= 0) { o.target.hp = 0; o.target.down = true; o.target.lethalHit = true; o.target.downBy = 'shot'; m.turretKills = (m.turretKills || 0) + 1; }
      }
      return;
    }
    if (ev.hit) player.damage(ev.damage * diff().damage, 'shot', from); else audio.whizz();
  };
  // the hack's choice, for a network or one device: disable, reprogram, take control
  const hackChoice = (list, said, then) => {
    audio.confirm();
    rt.choose('HACKED', said + ' What do you want them to do?', Object.entries(MODES).map(([mode, label]) => [label + (modeSays(list, mode) ? '  (' + modeSays(list, mode) + ')' : ''), () => {
      const n = setMode(list, mode);
      m.hacked = (m.hacked || 0) + 1;
      for (const d of list) d.known = true;
      if (then) then(mode);
      syncLocks(devices);
      showHint(mode === 'off' ? n + ' disabled.' : mode === 'friendly' ? n + ' reprogrammed: they ignore you now.' : n + ' taken over' + (list.some((d) => d.kind === 'turret') ? ': the turrets fire on their owners.' : '.'));
    }]), true);
  };
  // the hacking kit: a camera or turret within reach, not already yours
  // (M6.29) Q's Long-Arm Relay reaches further - in sight of it; his Skeleton Card opens a maglock's keypad
  const gear = (k) => arsenal && arsenal.loadout && arsenal.loadout.gearTrait(k);
  const deviceNear = () => {
    const kit = gear('hackKit'), card = gear('maglockCard') || haveCard.size > 0;
    if (!kit && !card) return null;
    const far = kit ? gear('hackReach') || HACK.reach : HACK.reach;
    let best = null, bd = far;
    for (const d of devices) {
      if (d.mode !== 'on' || d.broken || Math.abs(d.pos[1] - player.pos[1]) > (far > HACK.reach ? 5 : 3.5)) continue;
      if (!kit && (d.kind !== 'lock' || !(gear('maglockCard') || haveCard.has(d.net)))) continue;
      const h = Math.hypot(d.pos[0] - player.pos[0], d.pos[2] - player.pos[2]);
      if (h >= bd) continue;
      if (h > HACK.reach) {
        const e = player.eyePos, dx = d.pos[0] - e[0], dy = d.pos[1] - e[1], dz = d.pos[2] - e[2], dd = Math.hypot(dx, dy, dz);
        const hit = level.world.raycast(e, [dx / dd, dy / dd, dz / dd], dd, (q) => q.person || q.target || q.glass);
        if (hit && hit.t < dd - 0.5) continue;
      }
      bd = h; best = d;
    }
    return best;
  };
  // the card at a maglock: quick, quiet, no trace
  const byCard = (d) => d && d.kind === 'lock' && (gear('maglockCard') || haveCard.has(d.net)) && Math.hypot(d.pos[0] - player.pos[0], d.pos[2] - player.pos[2]) < HACK.reach;
  const deviceName = (d) => ({ camera: 'the camera', turret: 'the turret', lock: 'the maglock', lights: 'the lighting panel' + (d.name ? ' (' + d.name + ')' : ''), alarm: 'the alarm', laser: 'the laser\'s emitter' })[d.kind] || 'the device';
  level.deviceName = deviceName;
  // the trace: hacking a network long enough tells its owners where you are
  const traced = (net, where) => {
    if (!trace.add(net, simDtNow * (gear('traceMul') || 1))) return;
    markIntrusion('traced');                     // (M6.29) and they know where to find Yard 7 now
    m.traced = true;
    const answered = raiseAlarm(guards, { pos: where, rank: 'officer', faction: (netDevices(net)[0] || {}).owner || 'red' }, where);
    showHint('Traced! They know where the hack is coming from' + (answered.length ? ' - ' + answered.length + ' on the way.' : '.'));
  };
  let simDtNow = 0;
  // how they look (draw/devices_view.js): each with a light that says whose it is
  const devView = deviceView(pc, app, devices);
  const drawDevices = () => devView.draw(S.playing ? S.vision : 'normal');
  // (M6.28) the shield-bearers' shields: a dark slab with a viewing slit
  const shieldMat = (() => { const mt = new pc.StandardMaterial(); mt.diffuse = new pc.Color(0.12, 0.13, 0.15); mt.useMetalness = true; mt.metalness = 0.4; mt.gloss = 0.45; mt.update(); return mt; })();
  const slitMat = (() => { const mt = new pc.StandardMaterial(); mt.diffuse = new pc.Color(0.3, 0.4, 0.45); mt.opacity = 0.6; mt.blendType = pc.BLEND_NORMAL; mt.update(); return mt; })();
  const shields = guards.map((g) => {
    if (!g.shield) return null;
    const e = new pc.Entity('shield');
    const slab = new pc.Entity(); slab.addComponent('render', { type: 'box', material: shieldMat, castShadows: true }); slab.setLocalScale(0.7, 1.2, 0.06); e.addChild(slab);
    const slit = new pc.Entity(); slit.addComponent('render', { type: 'box', material: slitMat, castShadows: false }); slit.setLocalScale(0.34, 0.08, 0.07); slit.setLocalPosition(0, 0.42, 0); e.addChild(slit);
    app.root.addChild(e); return e;
  });
  const detect = $('detect').getContext('2d');
  // one uniform for the side; the officer's a shade darker; rank in the hat
  const bodies = guards.map((g) => new Operative(pc, app, null,
    { tint: g.tint ? g.tint : g.side === 'ally' ? [0.45, 0.6, 1.35] : g.side === 'front' ? (g.rank === 'officer' ? [0.95, 0.96, 1.02] : [1.3, 1.31, 1.38]) : g.faction === 'yellow' ? (g.rank === 'officer' ? [1.4, 1.1, 0.35] : YELLOW) : g.rank === 'officer' ? [1.35, 0.5, 0.46] : g.rank === 'specialist' ? [1.5, 0.62, 0.56] : RED, shadows: false,
      hat: (RANKS[g.rank] || RANKS.guard).hat, goggles: level.dark && g.sees === 'nvg' }));

  // Torches, in the dark (Rhys: floating balls of light; the light
  // went through walls and floors; and the frame rate fell to 11). Now a
  // torch is a small body clipped under the barrel of his gun with a lit lens,
  // and its beam a faint cone of light in the air - clipped where it meets a
  // wall - instead of a real lamp: nothing shines through anything, and it
  // costs next to nothing to draw.
  // (Rhys: the cones still poked through walls, and their glare
  // hid the scene - and the man holding the torch) No cone now: the beam is
  // where it lands - a soft pool of light on the first thing it meets, laid
  // flat on that surface - and the lens a small, dim glow (not a bloom).
  const lensMat = new pc.StandardMaterial();
  lensMat.diffuse = new pc.Color(0, 0, 0); lensMat.emissive = new pc.Color(1, 0.93, 0.75); lensMat.emissiveIntensity = 1.1; lensMat.update();
  const bodyMat = new pc.StandardMaterial(); bodyMat.diffuse = new pc.Color(0.06, 0.06, 0.06); bodyMat.update();
  // a soft round pool: bright in the middle, fading to nothing at the edge
  const poolTex = (() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const c2 = cv.getContext('2d'), gr = c2.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    c2.fillStyle = gr; c2.fillRect(0, 0, 64, 64);
    const t = new pc.Texture(app.graphicsDevice, { width: 64, height: 64, format: pc.PIXELFORMAT_RGBA8, mipmaps: true });
    t.setSource(cv); return t;
  })();
  const beamMat = new pc.StandardMaterial();
  beamMat.diffuse = new pc.Color(0, 0, 0); beamMat.emissive = new pc.Color(1, 0.92, 0.72); beamMat.emissiveMap = poolTex; beamMat.emissiveIntensity = 0.55;
  beamMat.opacityMap = poolTex; beamMat.opacityMapChannel = 'a';
  beamMat.blendType = pc.BLEND_ADDITIVE; beamMat.depthWrite = false; beamMat.cull = pc.CULLFACE_NONE; beamMat.update();
  const torches = level.dark ? guards.map((g) => {
    if (g.sees !== 'torch') return null;
    const root = new pc.Entity('torch');
    const body = new pc.Entity(); body.addComponent('render', { type: 'cylinder', material: bodyMat, castShadows: false });
    body.setLocalScale(0.045, 0.16, 0.045); body.setLocalEulerAngles(90, 0, 0); root.addChild(body);
    const lens = new pc.Entity(); lens.addComponent('render', { type: 'cylinder', material: lensMat, castShadows: false });
    lens.setLocalScale(0.04, 0.01, 0.04); lens.setLocalEulerAngles(90, 0, 0); lens.setLocalPosition(0, 0, -0.085); root.addChild(lens);
    root.enabled = false; app.root.addChild(root);
    // the pool lives in the world on its own, laid on whatever the beam meets
    const beam = new pc.Entity('torch_pool'); beam.addComponent('render', { type: 'plane', material: beamMat, castShadows: false });
    beam.enabled = false; app.root.addChild(beam);
    return { root, beam, lens };
  }) : [];

  // the keycard on the security desk
  const cardMat = new pc.StandardMaterial();
  cardMat.diffuse = new pc.Color(0.85, 0.82, 0.7); cardMat.emissive = new pc.Color(0.25, 0.22, 0.1); cardMat.update();
  const card = new pc.Entity('keycard');
  card.addComponent('render', { type: 'box', material: cardMat, castShadows: false });
  card.setLocalScale(0.086, 0.012, 0.054);
  if (L0) { card.setPosition(level.keycard.pos[0], level.keycard.pos[1] + 0.006, level.keycard.pos[2]); app.root.addChild(card); }

  // where to go once the file is yours: a glowing ring by the van
  const beaconMat = new pc.StandardMaterial();
  beaconMat.emissive = new pc.Color(1, 0.8, 0.2); beaconMat.emissiveIntensity = 2; beaconMat.diffuse = new pc.Color(0, 0, 0);
  beaconMat.blendType = pc.BLEND_ADDITIVE; beaconMat.depthWrite = false; beaconMat.update();
  const beacon = new pc.Entity('extraction');
  beacon.addComponent('render', { type: 'cylinder', material: beaconMat, castShadows: false });
  beacon.enabled = false;
  if (L0) {
    beacon.setPosition(level.van.pos[0], 0.03, level.van.pos[2]);
    beacon.setLocalScale(level.van.radius * 2, 0.02, level.van.radius * 2);
    app.root.addChild(beacon);
  }

  // the gun's barrel: whichever of its own axes points most the way he faces
  const placeTorch = (t, g, body) => {
    const fx = -Math.sin(g.yaw), fz = -Math.cos(g.yaw);
    let pos, dir;
    const gun = body && body.carry && body.carry.enabled !== false ? body.carry : null;
    if (gun) {
      const m4 = gun.getWorldTransform(), p = gun.getPosition();
      const ax = [m4.getX(new pc.Vec3()), m4.getY(new pc.Vec3()), m4.getZ(new pc.Vec3())].map((v) => v.normalize());
      let best = ax[2], bs = -2;
      for (const a of ax) for (const sg of [1, -1]) { const dd = (a.x * fx + a.z * fz) * sg; if (dd > bs) { bs = dd; best = a.clone().mulScalar(sg); } }
      dir = [best.x, best.y, best.z];
      pos = [p.x + dir[0] * 0.3, p.y + dir[1] * 0.3 - 0.04, p.z + dir[2] * 0.3];
    } else {
      dir = [fx, -0.12, fz];
      pos = [g.pos[0] + fx * 0.55, g.pos[1] + 1.35, g.pos[2] + fz * 0.55];
    }
    // (alert, he points it at you)
    if (g.state === 'alert' && player.pos) { const v = [player.pos[0] - pos[0], player.pos[1] + 1.2 - pos[1], player.pos[2] - pos[2]], l = Math.hypot(...v) || 1; dir = v.map((q) => q / l); }
    const l = Math.hypot(dir[0], dir[1], dir[2]) || 1; dir = dir.map((q) => q / l);
    t.root.setPosition(pos[0], pos[1], pos[2]);
    t.root.lookAt(pos[0] + dir[0], pos[1] + dir[1], pos[2] + dir[2]);
    // the beam lands on the first thing it meets: a pool there, flat on it,
    // nudged off the surface so it does not flicker into it
    const hit = level.world.raycast(pos, dir, 16, (s2) => s2.person || s2.glass || s2.shootThrough);
    const on = !!hit && t.root.enabled;
    if (t.beam.enabled !== on) t.beam.enabled = on;
    if (on) {
      const p = [pos[0] + dir[0] * hit.t, pos[1] + dir[1] * hit.t, pos[2] + dir[2] * hit.t];
      // which face it struck: the box side the point is nearest
      const b = hit.solid, faces = [[b.min[0], 0, -1], [b.max[0], 0, 1], [b.min[1], 1, -1], [b.max[1], 1, 1], [b.min[2], 2, -1], [b.max[2], 2, 1]];
      let n = [0, 1, 0], bd = 1e9;
      for (const [v, ax, sg] of faces) { const d = Math.abs(p[ax] - v); if (d < bd) { bd = d; n = [0, 0, 0]; n[ax] = sg; } }
      const r = Math.min(2.2, 0.25 + hit.t * 0.2);
      t.beam.setPosition(p[0] + n[0] * 0.02, p[1] + n[1] * 0.02, p[2] + n[2] * 0.02);
      // a plane faces +Y: turn it to face along n
      t.beam.setEulerAngles(n[2] ? 90 * n[2] : 0, 0, n[0] ? -90 * n[0] : n[1] < 0 ? 180 : 0);
      t.beam.setLocalScale(r * 2, 1, r * 2);
      // fainter the further it has to throw
      beamMat.emissiveIntensity = 0.55;
    }
    // looking into his torch: the lens shows a little brighter - never a bloom over him
    const eye = player.eyePos || player.pos, v = [eye[0] - pos[0], eye[1] - pos[1], eye[2] - pos[2]], dv = Math.hypot(...v) || 1;
    const facing = (v[0] * dir[0] + v[1] * dir[1] + v[2] * dir[2]) / dv > 0.9;
    if (t.lens) { const k = facing ? 1.5 : 1; t.lens.setLocalScale(0.04 * k, 0.01, 0.04 * k); }
  };
  // ── Weapons they drop (Rhys: universally, so you can take one - for
  // a swap, or fresh ammunition; and stolen weapons taken back to Ghost HQ are
  // how most of them unlock). A downed man's gun lies beside him; E takes it:
  // its rounds, if you carry the same weapon; otherwise a swap - yours is
  // left lying where his was, so you can change your mind.
  const drops = [];
  // a weapon put down keeps what was fitted to it (a silenced V-27C
  // swapped for a PX9, then taken back, had come back without its silencer)
  const dropAt = (item, model, pos, rounds, mods) => {
    const e = wview && wview.spawnModel ? wview.spawnModel(item, model, mods) : null;
    const d = { item, model, pos: pos.slice(), rounds, e, mods: (mods || []).slice() };
    if (e) {
      app.root.addChild(e);
      e.setPosition(pos[0], pos[1] + 0.06, pos[2]);
      e.setEulerAngles(0, Math.random() * 360, 90);          // on its side, any way round
    }
    drops.push(d);
    return d;
  };
  // (M6.30) disguises: a downed red's (or Yellow's) uniform, taken from him - his side take you for one of them
  // from a way off; close to, they look twice; a shot, or one of them seeing through it, ends it
  const bodyNear = () => guards.find((g) => g.dead && !g.stripped && !g.gone && (g.faction === 'red' || g.faction === 'yellow') && Math.abs(g.pos[1] - player.pos[1]) < 1.2 && Math.hypot(g.pos[0] - player.pos[0], g.pos[2] - player.pos[2]) < 1.6) || null;
  const takeUniform = (g) => {
    g.stripped = true; rt.disguise = g.faction; audio.pickup(); disguiseTag();
    showHint('His uniform: from a way off, the ' + (g.faction === 'yellow' ? 'Yellows' : 'reds') + ' take you for one of them. Close to, they look twice - officers from further. Do not crouch or run; a shot gives you away.');
  };
  const dropDisguise = (why) => { if (!rt.disguise) return; rt.disguise = null; rt.disguiseBlown = true; if (why) showHint(why); disguiseTag(); };
  // a small tag on the screen while you wear one
  const disguiseTag = () => {
    let el = document.getElementById('disguise-tag');
    if (!el) { el = document.createElement('div'); el.id = 'disguise-tag'; el.style.cssText = 'position:fixed;right:18px;top:236px;padding:3px 10px;font:600 12px sans-serif;letter-spacing:2px;border-radius:3px;pointer-events:none;z-index:5;display:none'; document.body.appendChild(el); }
    el.style.display = rt.disguise ? 'block' : 'none';
    if (rt.disguise) { el.textContent = 'DISGUISED - ' + (rt.disguise === 'yellow' ? 'YELLOW' : 'RED') + ' UNIFORM'; el.style.background = rt.disguise === 'yellow' ? 'rgba(232,180,35,0.85)' : 'rgba(200,50,40,0.85)'; el.style.color = '#111'; }
  };
  // (M6.30) the hold-up: come up behind a man who has not seen you, your gun on him from close by, and he
  // freezes, hands up. E questions him: where every one of his side is (your radar, a while), and his keycard if
  // he has one. Leave him - walk off, or keep your gun off him too long - and he raises the alarm.
  const HOLD = { reach: 5, behind: 1.9, keep: 7, leave: 10 };
  const holdUps = (dt) => {
    const aim = S.aimNow;
    for (const g of guards) {
      if (!g.heldUp) continue;
      if (g.dead || (g.target && g.target.down)) { g.heldUp = false; continue; }
      const d = Math.hypot(g.pos[0] - player.pos[0], g.pos[2] - player.pos[2]);
      g.heldT = (aimingAt(g) ? 0 : (g.heldT || 0) + dt);
      if (d > HOLD.leave || g.heldT > HOLD.keep || player.mode === 'dead') {
        g.heldUp = false; g.awareness = 1; g.stim = player.pos.slice(); g.since = 0; g.state = 'alert'; g.stateT = 0;
        alarm(g, player.pos.slice());
        showHint('He has his nerve back - and he is calling it in.');
      }
    }
    if (!aim || !aim.aim || player.mode === 'dead') return;
    const g = aimedGuard();
    if (!g || g.heldUp || g.questioned || g.dead || g.faction === 'staff' || g.neutral || g.state === 'alert' || g.awareness > 0.5) return;
    const dx = player.pos[0] - g.pos[0], dz = player.pos[2] - g.pos[2], d = Math.hypot(dx, dz);
    if (d > HOLD.reach) return;
    const off = Math.abs(((Math.atan2(-dx, -dz) - g.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    if (off < HOLD.behind) return;                                // he would have to be facing away from you
    g.heldUp = true; g.heldT = 0; g.path = null; g.speed = 0;
    bark(g, lineFor('surrender'), 'surrender');
    showHint('Hands up - he freezes. E: question him. Keep your gun on him, and stay close.');
  };
  const aimedGuard = () => {
    const aim = S.aimNow; if (!aim || !aim.dir) return null;
    const h = level.world.raycast(player.eyePos, aim.dir, 12, (q) => q.glass || q.shootThrough);
    return (h && h.solid && h.solid.target && h.solid.target.guard) || null;
  };
  const aimingAt = (g) => S.aimNow && S.aimNow.aim && aimedGuard() === g;
  const heldNear = () => guards.find((g) => g.heldUp && !g.questioned && Math.hypot(g.pos[0] - player.pos[0], g.pos[2] - player.pos[2]) < 2.2) || null;
  // (M6.32; the roadmap's "dialogue: 2-4 options an exchange") questioned, he answers what you ask - as much as his
  // nerve allows: a coward three things, most men two, a steady man one. Ask where his side are (the radar, 25 s),
  // where the thing you came for is (the radar's diamond, 45 s), what security is live (every device of theirs on
  // your radar, pinholes and all), or for his keycard. Then put him on the floor, hands behind his head (tied: out of
  // it, quietly, for good - no medic brings him round), or leave him (and he calls it in once you go).
  const ASKS = { cowardly: 3, steady: 1 };
  const OPENS = { cowardly: 'Don\'t shoot! Please - I\'ll tell you whatever you want!', steady: 'You won\'t get much out of me.' };
  const toldWhereOf = () => {
    for (const o of level.objectives || []) {
      if (o.optional) continue;
      const r = draftObjectives().find((q) => q.id === o.id);
      if (!r || r.done) continue;
      const t = o.kind === 'hack' ? level.terminals.find((q) => q.id === o.ref) : o.kind === 'take' ? level.pickups.find((q) => q.id === o.ref)
        : o.kind === 'kill' ? guards.find((q) => q.id === o.ref && !q.dead) : o.kind === 'rescue' ? hostages.find((h) => (!o.ref || h.id === o.ref) && h.state !== 'rescued' && h.state !== 'dead') : null;
      if (t && t.pos) return { pos: t.pos, what: t.what || (t.name && t.name !== 'the terminal' ? t.name : null) || (o.kind === 'kill' ? (t.name || 'the man you want') : o.kind === 'rescue' ? 'the prisoner' : 'what you came for') };
    }
    return null;
  };
  const tieUp = (g) => {
    g.heldUp = false; g.tied = true; g.takenDown(false); g.target.lastBy = 'you'; m.takedowns++; audio.confirm();
    if (standing && g.faction === 'yellow') { const was = standing.state; if (standing.takenDown(false) === 'hostile' && was !== 'hostile') turnYellows(); }
    showHint('He gets down, hands behind his head - and you tie him. He is out of it, quietly, and no one will bring him round.');
  };
  const question = (g) => {
    g.questioned = true; g.heldT = 0;
    let left = ASKS[g.temper] !== undefined ? ASKS[g.temper] : 2;
    const asked = new Set();
    const who = g.name || (g.rank === 'officer' ? 'The officer' : g.role ? 'The ' + g.role + (g.role === 'radio' ? ' operator' : '') : 'The guard');
    const ask = (said) => {
      if (g.dead || !g.heldUp) return;
      const opts = [];
      if (left > 0) {
        if (!asked.has('where')) opts.push(['Where are the rest of you?', () => {
          asked.add('where'); left--; level.revealT = Math.max(level.revealT || 0, 25);
          ask('All right - all right. Here, and here, and the rest of them over there.  (Every one of his side on your radar for 25 seconds.)');
        }]);
        const tw = toldWhereOf();
        if (tw && !asked.has('obj')) opts.push(['Where is ' + tw.what + '?', () => {
          asked.add('obj'); left--; rt.toldWhere = { pos: tw.pos, until: S.time + 45 };
          ask('That way. You can\'t miss it.  (On your radar for 45 seconds.)');
        }]);
        const devs = (level.liveDevices || []).filter((d) => !d.known);
        if (devs.length && !asked.has('sec')) opts.push(['What security is live?', () => {
          asked.add('sec'); left--; for (const d of level.liveDevices || []) d.known = true;
          ask('Cameras, the locks, all of it - and the little ones you won\'t see.  (Every device of theirs on your radar.)');
        }]);
        if (g.card && !asked.has('card')) opts.push(['Your keycard. Slowly.', () => {
          asked.add('card'); left--; haveCard.add(g.card); g.card = null; audio.pickup();
          ask('Here. Take it.  (His network\'s maglocks open to it now.)');
        }]);
      }
      opts.push(['On the floor. Hands behind your head.', () => tieUp(g)]);
      opts.push(['(Leave him)', () => showHint('You leave him with his hands up. He will call it in the moment you are gone - or take him down now.')]);
      const text = (said || OPENS[g.temper] || 'Easy - easy. What do you want?') + (left > 0 || !said ? '' : '  ...And that\'s all you\'re getting.');
      rt.choose(who, text, opts, true);
    };
    ask(null);
  };
  // keycards: dropped by the officers who carry them; taken, they open their network's maglocks (2 s, no trace)
  const cards = [], haveCard = new Set();
  const keyCardMat = (() => { const mt = new pc.StandardMaterial(); mt.diffuse = new pc.Color(0.9, 0.9, 0.92); mt.emissive = new pc.Color(0.25, 0.35, 0.5); mt.update(); return mt; })();
  const dropCard = (g, pos) => {
    const e = new pc.Entity('keycard'); e.addComponent('render', { type: 'box', material: keyCardMat, castShadows: false });
    e.setLocalScale(0.09, 0.01, 0.055); e.setPosition(pos[0], pos[1] + 0.02, pos[2]); e.setEulerAngles(0, Math.random() * 360, 0); app.root.addChild(e);
    cards.push({ net: g.card, pos: pos.slice(), e, taken: false });
  };
  const cardNear = () => cards.find((c) => !c.taken && Math.abs(c.pos[1] - player.pos[1]) < 1.2 && Math.hypot(c.pos[0] - player.pos[0], c.pos[2] - player.pos[2]) < 1.4) || null;
  const takeCard = (c) => { c.taken = true; c.e.enabled = false; haveCard.add(c.net); audio.pickup(); showHint('A keycard: his network\'s maglocks open to it now (hold E at a keypad) - quietly, and with no trace.'); };
  const dropNear = () => {
    let best = null, bd = 1.4;
    for (const d of drops) {
      if (Math.abs(d.pos[1] - player.pos[1]) > 1.2) continue;
      const dist = Math.hypot(d.pos[0] - player.pos[0], d.pos[2] - player.pos[2]);
      if (dist < bd) { bd = dist; best = d; }
    }
    return best;
  };
  const loadout = () => arsenal && arsenal.loadout;
  // the slot it would go in: the one in your hands if it fits, else the first that does
  // an empty slot it fits comes first: you are not made to put down what you carry
  const slotFor = (item) => { const lo = loadout(); return lo ? pickupSlot(lo, item, lo.slotOfKey(arsenal.current)) : null; };
  const nameOf = (id) => (ITEMS[baseId(id)] && ITEMS[baseId(id)].name) || id;
  const dropTip = (d) => {
    const lo = loadout(); if (!lo) return null;
    if (lo.has(d.item)) return 'E  Take its ammunition (' + nameOf(d.item) + ')';
    const slot = slotFor(d.item); if (!slot) return null;
    const mine = lo.get(slot);
    return 'E  Take the ' + withTags(nameOf(d.item), d.mods) + (mine ? '  (leave your ' + withTags(nameOf(mine), lo.mods[slot]) + ')' : '');
  };
  const takeDrop = (d) => {
    const lo = loadout(); if (!lo) return false;
    if (lo.has(d.item)) {
      const key = lo.keyOf(lo.slotOf(d.item)), a = arsenal.ammo[key];
      if (a && a.reserve !== undefined) {
        const w = arsenal.def(key), cap = Math.round((w.reserve || 0) * 1.5);
        const give = Math.max(0, Math.min(d.rounds, cap - a.reserve));
        a.reserve += give;
        // (Rhys: his K7 was full and more ammunition just vanished)
        // what will not fit in the gun goes in the pouch, up to what it holds
        const kind = arsenal.ammoKindOf && arsenal.ammoKindOf(key), extra = d.rounds - give;
        let kept = 0;
        if (kind && extra > 0) {
          arsenal.spare = arsenal.spare || {};
          kept = Math.max(0, Math.min(extra, arsenal.spareCap(kind) - (arsenal.spare[kind] || 0)));
          arsenal.spare[kind] = (arsenal.spare[kind] || 0) + kept;
        }
        if (give + kept === 0) { audio.deny(); showHint('Full: no room for more ' + nameOf(d.item) + ' rounds.'); return true; }
        arsenal.events.push({ type: 'ammo', id: key, rounds: give + kept, fromPouch: false });
      }
      if (d.e) d.e.destroy();
      drops.splice(drops.indexOf(d), 1);
      audio.pickup();
      return true;
    }
    const slot = slotFor(d.item); if (!slot) return false;
    // yours goes down with what is in its magazine; the rest of its rounds to your pouch
    const inMag = arsenal.stow ? arsenal.stow(lo.keyOf(slot)) : 0;
    const pouchBefore = Object.assign({}, arsenal.spare || {});
    const handSlot = lo.slotOfKey(arsenal.current);
    const out = lo.put(slot, d.item, d.mods);
    if (out === false) return false;
    arsenal.reset(lo, { keep: true });
    // (Rhys: taking a weapon from a downed red "shouldn't force-switch
    // your in-hand weapon") you keep hold of what you had; if it was the one you
    // put down, the new one is in your hands in its place
    { const want = lo.keyOf(holdAfterPickup(slot, handSlot)); if (want && want !== arsenal.current && arsenal.owned[want]) arsenal.select(want); }
    arsenal.spare = pouchBefore;                 // (a dropped gun is not a fresh load: the pouch is used below, once)
    // his comes with what it had - not a fresh full load - then your pouch tops it up
    const key = lo.keyOf(slot), a = arsenal.ammo[key], w = arsenal.def(key);
    if (a && a.mag !== undefined && w) { a.mag = Math.min(w.mag, d.rounds); a.reserve = Math.max(0, d.rounds - w.mag); }
    arsenal.useSpareFor && arsenal.useSpareFor(key);
    m.taken = m.taken || new Set(); m.taken.add(d.item);       // for Ghost HQ, later: weapons taken from the enemy
    if (d.e) d.e.destroy();
    drops.splice(drops.indexOf(d), 1);
    if (out && out.id) {
      const it = ITEMS[out.id];
      const model = it && it.model ? it.model : (out.id === 'PX9' ? 'Pistol_1' : out.id === 'LR7' ? 'Sniper_1' : 'AR_1');
      dropAt(out.id, model, d.pos, inMag, out.mods);
    }
    audio.pickup();
    return true;
  };

  // ── Hostages: bound where the reds left them; hold E to cut one
  // loose; he follows you; E again: wait / come on; the police cars in the
  // street are safety. A hostage killed - by anyone - is an outcome the story remembers (it used to end the mission).
  const hostages = level.hostages || [];
  // the captain and his helicopter: stop him before it lifts
  const capRun = (!L0 && level.captain && level.helicopter) ? new CaptainRun(level.captain, level.helicopter, level.captainEscape.post[1]) : null;
  const capStopped = () => !capRun || capRun.stopped;
  const clockNow = () => {
    const mt = level.missionTime || { hour: 22, minute: 47 };
    const mins = mt.hour * 60 + mt.minute + Math.floor((S.missionT || 0) / 60);
    return { hour: Math.floor(mins / 60) % 24, minute: mins % 60 };
  };
  const hbodies = hostages.map(() => new Operative(pc, app, null, { tint: [1.55, 1.38, 1.12], shadows: false }));
  const zone = level.policeZone;
  const inSafe = (p) => inStreetZone(zone, p);
  // (Rhys: in the lift his "E - tell him to wait" sat over the
  // floor buttons) in the car, the buttons have E; a hostage is not spoken to
  // (Rhys: in the lift you could not tell them anything) the
  // buttons have E only while you are looking at one; otherwise E is his
  const hostageNear = () => {
    const L = level.lift;
    if (L && L.carries(player.pos) && L.buttonAt(player.eyePos, player.lookDir())) return null;
    return hostages.find((h) => h.alive && h.state !== 'rescued' && h.near(player.pos)) || null;
  };
  const rescued = () => hostages.filter((h) => h.state === 'rescued').length;
  // by name, once the cast is settled (Dr Hale is "her")
  const whoIs = (h) => h.name || 'the hostage', him = (h) => (h.she ? 'her' : 'him'), He = (h) => (h.she ? 'She' : 'He');
  const hostageTip = (h) => {
    if (h.state === 'held') return h.freeT > 0 ? 'Hold E  Freeing ' + whoIs(h) + '... ' + Math.round(h.freeT * 100) + '%' : 'Hold E  Free ' + whoIs(h);
    if (h.state === 'following') return 'E  Tell ' + him(h) + ' to wait here';
    if (h.state === 'waiting') return 'E  Tell ' + him(h) + ' to follow you';
    return null;
  };
  // (Rhys: objectives independent of completion) how it stands, as the story will remember it
  // the mission's own rules: the hotel's, the factory's (src/sim/play/story.js)
  const rules = RULES[level.rules || 'riverside'];
  const outcome = () => rules.outcome({ battle: B ? B.snapshot() : null, objectives: level.draft ? draftObjectives() : null, draftId: level.draft, hostages, guards: targets, ledger: !!(level.ledger && level.ledger.taken), yellows: rel ? guards.filter((g) => g.faction === 'yellow') : null, locket: !!(level.locket && level.locket.taken && level.locket.by !== 'you'), locketMine: !!(level.locket && level.locket.by === 'you'), locketAnswer: rt.locketAnswer || null, job: job ? job.stage : 'idle', run: level.trainRun || null, hijack: level.hijackers ? { happened: !!level.hijacked, down: level.hijackers.filter((g) => g.dead).length, total: level.hijackers.length, minister: level.hijack.minister, guardKilled: !!level.hijack.guardKilledByYou } : null, cap: capRun ? { stage: capRun.stage, dead: capRun.g.dead, knockedOut: capRun.g.knockedOut, fled: capRun.g.fled } : null });
  // the battle, a frame on: the clock; the fallen, and the next men on in their place; each
  // man on along his lane when he has held his point long enough; the line at the top of the screen
  function battleTick(dt) {
    B.tick(dt);
    for (const [side, pool] of Object.entries(level.battle.pools)) for (const g of pool) {
      if (g.dead) {
        if (!g.bDown) { g.bDown = true; B.down(side, g.target.lastBy === 'you' || g.takenDownBy ? 'you' : otherSide(side)); }
        g.deadT = (g.deadT || 0) + dt;
        if (g.deadT > BATTLE.corpse && !B.over && B.send(side)) {
          const spots = level.battle.spots[side], p = spots[Math.floor(Math.random() * spots.length)];
          battleOrders(g, side, p);
          g.revive(p, Math.atan2(-(g.push[0] - p[0]), -(g.push[2] - p[2])), g.push);
          g.bDown = false;
        }
        continue;
      }
      if (!g.push && g.state === 'patrol' && (g.holdT -= dt) <= 0) {
        if (g.laneI < g.lane.length - 1) { g.laneI++; g.push = g.lane[g.laneI].slice(); }
        g.holdT = BATTLE.hold[0] + Math.random() * (BATTLE.hold[1] - BATTLE.hold[0]);
      }
    }
    const T = B.teams, mine = T[B.you], them = T[otherSide(B.you)];
    $('step').style.display = 'block';
    $('step').textContent = (rt.backT > 0 ? 'You are down - back in ' + Math.ceil(rt.backT) + '  -  ' : '') + B.clock() + '  -  ' + mine.short + ' ' + B.strength(B.you) + ' (' + mine.field + ' fighting)  -  ' + them.short + ' ' + B.strength(them.side) + ' (' + them.field + ' fighting)';
    if (rt.backT > 0) rt.backT -= dt;
    if (B.over && !m.done) rt.endHotel(outcome());
  }
  // a first-draft level's objectives, as they stand
  function draftObjectives() {
    const list = level.objectives.map((o) => {
      const r = { id: o.id, kind: o.kind, text: o.text, optional: o.optional, done: false, failed: false, status: '' };
      if (o.kind === 'clear') {
        const gs = targets.filter((g) => !o.faction || g.faction === o.faction), d = gs.filter((g) => g.dead).length;
        r.done = gs.length > 0 && d === gs.length; r.status = d + ' of ' + gs.length + ' down';
      } else if (o.kind === 'kill') {
        const g = guards.find((q) => q.id === o.ref);
        r.done = !!(g && g.dead); r.status = !g ? 'not here' : g.dead ? (g.knockedOut ? 'knocked out' : 'killed') : 'still standing';
      } else if (o.kind === 'take') {
        const p = level.pickups.find((q) => q.id === o.ref);
        r.done = !!(p && p.taken); r.status = r.done ? 'taken' : 'not found';
      } else if (o.kind === 'hack') {
        const t = level.terminals.find((q) => q.id === o.ref);
        r.done = !!(t && t.done); r.status = r.done ? 'done' : 'not done';
      } else if (o.kind === 'rescue') {
        const hs = o.ref ? hostages.filter((h) => h.id === o.ref) : hostages, ok = hs.filter((h) => h.state === 'rescued').length, dead = hs.filter((h) => h.state === 'dead').length;
        r.done = hs.length > 0 && ok === hs.length; r.failed = !r.done && ok + dead === hs.length;
        r.status = hs.length === 1 ? (ok ? 'brought out' : dead ? 'killed' : 'still inside') : ok + ' of ' + hs.length + ' brought out' + (dead ? ' (' + dead + ' killed)' : '');
      } else if (o.kind === 'reach') {
        const z = level.reach.find((q) => q.id === o.ref);
        r.done = !!(z && z.done); r.status = z && z.hold ? (r.done ? 'held' : Math.floor(z.held) + ' of ' + Math.round(z.hold) + ' s') : r.done ? 'reached' : 'not reached';
      } else if (o.kind === 'quiet') {
        // (M6.84) done the quiet way: the alarm never sounded (best as an optional one - it is 'done' until it rings)
        r.done = !rt.sirenRung; r.failed = !!rt.sirenRung; r.status = rt.sirenRung ? 'the alarm sounded' : 'no alarm yet';
      } else if (o.kind === 'identify') {
        // (M6.78) men to mark (main.js's marking: aim at one for a second, or a tracker on him) - every one, alive
        const gs = (o.refs || []).map((id) => guards.find((q) => q.id === id)).filter(Boolean), n = gs.filter((g) => g.tracked).length;
        const lost = gs.filter((g) => g.dead && !g.tracked).length;
        r.done = gs.length > 0 && n === gs.length; r.failed = !r.done && lost > 0;
        r.status = n + ' of ' + gs.length + ' marked' + (lost ? ' (' + lost + ' dead before he was)' : '');
      } else if (o.kind === 'capture') {
        // (M6.77) a man wanted alive: knocked out, or held up and tied - not killed
        const g = guards.find((q) => q.id === o.ref);
        r.done = !!(g && (g.tied || (g.dead && g.knockedOut))); r.failed = !!(g && g.dead && !g.knockedOut && !g.tied);
        r.status = !g ? 'not here' : r.done ? (g.tied ? 'tied up' : 'knocked out') : r.failed ? 'killed' : 'still free';
      } else if (o.kind === 'tail') {
        const t = (rt.tails || {})[o.id];
        r.done = !!(t && t.done); r.failed = !!(t && t.failed);
        r.status = r.done ? 'followed there' : r.failed ? t.why : t && t.lost > 0.5 ? 'losing him (' + Math.max(0, Math.ceil((o.lose || 15) - t.lost)) + ' s)' : t && t.d !== undefined ? Math.round(t.d) + ' m behind him' : 'follow him';
      } else if (o.kind === 'stop') {
        // a vehicle to stop: its driver down, or it wrecked - before it gets where it is going
        const v = (level.drivables || []).find((q) => q.id === o.ref);
        const stopped = !!v && (v.wrecked || v.crewDown || v.held);
        r.done = stopped; r.failed = !stopped && !!(v && v.escaped);
        r.status = !v ? 'not here' : stopped ? (v.wrecked ? 'wrecked' : 'stopped') : v.escaped ? 'got away' : Math.round(v.leftM || 0) + ' m from getting away';
      }
      return r;
    });
    // (M6.89) done against the clock (kind 'quick', o.secs): every required one done inside the time - an optional one
    for (const r of list) {
      if (r.kind !== 'quick') continue;
      const o = level.objectives.find((q) => q.id === r.id), q = rt.quick || (rt.quick = {});
      const rest = list.filter((x) => !x.optional && x.kind !== 'quick');
      if (!q[r.id] && rest.length && rest.every((x) => x.done) && m.time <= o.secs) q[r.id] = 'done';
      if (!q[r.id] && m.time > o.secs) q[r.id] = 'failed';
      r.done = q[r.id] === 'done'; r.failed = q[r.id] === 'failed';
      const left = Math.max(0, Math.ceil(o.secs - m.time));
      r.status = r.done ? 'done in time' : r.failed ? 'out of time' : Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0') + ' left';
    }
    return list;
  }
  const LEAVE_HOLD = 1.5;           // seconds of E at the jeep to withdraw with things still undone

  // ── Light bars (Rhys: blues'n'twos) ─────────────────────────────
  // Two lamps a car, flashing in turn - a double flash each - each car a little
  // out of step with the next. Glow only (no real light: it would cost frames).
  const lbMat = (r, g, b, k) => { const x = new pc.StandardMaterial(); x.diffuse = new pc.Color(0, 0, 0); x.emissive = new pc.Color(r, g, b); x.emissiveIntensity = k; x.update(); return x; };
  const LB = { blue: [lbMat(0.15, 0.35, 1, 3.2), lbMat(0.03, 0.06, 0.2, 1)], red: [lbMat(1, 0.08, 0.05, 3.2), lbMat(0.2, 0.02, 0.02, 1)] };
  const lbBase = lbMat(0.02, 0.02, 0.02, 0);
  const bars = (level.lightbars || []).map((lb, k) => {
    const root = new pc.Entity('lightbar');
    root.setPosition(lb.pos[0], lb.pos[1], lb.pos[2]);
    // (Rhys: the bars were sideways) a light bar runs ACROSS the car:
    // its length along local z here, so a car lying along x needs no turn
    if (lb.along === 'z') root.setEulerAngles(0, 90, 0);
    const base = new pc.Entity(); base.addComponent('render', { type: 'box', material: lbBase, castShadows: false });
    base.setLocalScale(0.34, 0.07, 1.28); base.setLocalPosition(0, -0.035, 0); root.addChild(base);
    const lamps = [-1, 1].map((s, i) => {
      const e = new pc.Entity(); e.addComponent('render', { type: 'box', material: LB[lb.colours[i]][1], castShadows: false });
      e.setLocalScale(0.3, 0.12, 0.56); e.setLocalPosition(0, 0.035, s * 0.33); root.addChild(e);
      return { e, c: lb.colours[i] };
    });
    app.root.addChild(root);
    return { lamps, phase: k * 0.19 };
  });
  let lbT = 0;
  const flashBars = (dt) => {
    lbT += dt;
    for (const b of bars) {
      const t = (lbT + b.phase) % 0.75;
      const on = [(t < 0.07) || (t > 0.14 && t < 0.21), (t > 0.375 && t < 0.445) || (t > 0.515 && t < 0.585)];
      b.lamps.forEach((l, i) => { const m = LB[l.c][on[i] ? 0 : 1], mi = l.e.render.meshInstances[0]; if (mi.material !== m) mi.material = m; });
    }
  };

  const near = (pos, r) => Math.hypot(pos[0] - player.pos[0], pos[2] - player.pos[2]) < r && Math.abs(pos[1] - player.pos[1]) < 1.5;
  const inZone = (z) => z && player.pos[0] >= z[0][0] && player.pos[0] <= z[1][0] &&
    player.pos[1] >= z[0][1] - 0.2 && player.pos[1] <= z[1][1] && player.pos[2] >= z[0][2] && player.pos[2] <= z[1][2];
  let hintT = 0;
  const hint = (id, text) => {
    if (!m.hint(id)) return;
    $('hint').textContent = text || HINTS[id];
    $('hint').style.opacity = 1;
    hintT = 9;
  };
  // a message that can come more than once (each hostage freed, each one safe)
  const showHint = (text) => { $('hint').textContent = text; $('hint').style.opacity = 1; hintT = 7; };
  // the nearest shut door within reach, on your level
  const doorAhead = () => {
    let best = null, bestD = 1.7;
    for (const d of level.swingDoors) {
      if (d.open || d.blown) continue;
      const c = d.centre;
      if (Math.abs(c[1] - (player.pos[1] + 1.04)) > 1.4) continue;
      const dist = Math.hypot(c[0] - player.pos[0], c[2] - player.pos[2]);
      if (dist < bestD) { bestD = dist; best = d; }
    }
    return best;
  };
  const slowmo = () => {
    S.slow = SLOWMO.seconds;
    m.breaches++;
    if (audio.slowmo) audio.slowmo();
  };

  const knifeOut = () => !!(arsenal && arsenal.weapon && arsenal.weapon.kind === 'melee');
  const takedownTarget = () => {
    if (player.mode !== 'walk' || player.stance === 2) return null;
    let best = null, bd = 9;
    for (const g of guards) {
      if (g.side === 'ally' || !g.canBeTakenDown(player.pos, level.world)) continue;
      const d = Math.hypot(g.pos[0] - player.pos[0], g.pos[2] - player.pos[2]);
      if (d < bd) { bd = d; best = g; }
    }
    return best;
  };

  const rt = {
    mission: m, bodies,
    // a newspaper to read: its front page in Severian, English at a press; the game waits
    read(paper) {
      let el = document.getElementById('paper');
      if (!el) {
        el = document.createElement('div'); el.id = 'paper'; el.className = 'overlay';
        document.body.appendChild(el);
      }
      let en = !!paper.englishOnly;           // in English only, for now (Rhys)
      const draw = () => {
        const P = paper;
        el.innerHTML = '<div class="card" style="width:min(720px,94vw);background:#efe9dc;color:#1d1b18;font-family:\'Severia Serif\',Georgia,serif;max-height:90vh;overflow:auto">' +
          '<div style="text-align:center;border-bottom:3px double #1d1b18;padding-bottom:6px"><div style="font-size:34px;font-weight:bold;letter-spacing:2px">' + (en ? P.mastheadEn : P.masthead) + '</div>' +
          '<div style="font-size:12px;letter-spacing:1px">' + (en ? P.dateEn : P.date) + '</div></div>' +
          P.stories.map((st, i) => '<div style="margin-top:12px' + (i ? ';border-top:1px solid #8a8274;padding-top:10px' : '') + '"><div style="font-size:' + (i ? 18 : 24) + 'px;font-weight:bold;line-height:1.15">' + (en ? st.en : st.h) + '</div><div style="font-size:14px;line-height:1.45;margin-top:5px">' + (en ? st.ten : st.t) + '</div></div>').join('') +
          '<div style="margin-top:12px;border-top:1px solid #8a8274;padding-top:6px;font-size:13px">' + (en ? P.weatherEn : P.weather) + '</div>' +
          '<div style="display:flex;gap:10px;margin-top:14px">' + (paper.englishOnly ? '' : '<button class="btn" id="paper-lang">' + (en ? 'Back to the Severian' : 'Read it in English') + '</button>') + '<button class="btn primary" id="paper-close">Put it down</button></div></div>';
        if (el.querySelector('#paper-lang')) el.querySelector('#paper-lang').onclick = () => { en = !en; audio.click(); draw(); };
        el.querySelector('#paper-close').onclick = () => {
          el.style.display = 'none'; S.dialog = false; audio.click();
          S.wantLock = S.time; input.requestLock();
          for (const ms of [400, 1100]) setTimeout(() => { if (S.playing && !S.menu && !S.dialog && !input.locked) input.requestLock(); }, ms);
        };
      };
      draw();
      S.dialog = true; el.style.display = 'flex'; rt.papers = (rt.papers || 0) + 1;
      if (document.pointerLockElement) document.exitPointerLock();
    },
    // a question with buttons: the game waits (S.dialog) and the pointer is freed until you answer
    choose(who, text, options, plain) {
      let el = document.getElementById('choice');
      if (!el) {
        el = document.createElement('div'); el.id = 'choice'; el.className = 'overlay';
        el.innerHTML = '<div class="card" style="width:min(560px,92vw)"><div class="brand" id="choice-who"></div><p id="choice-text" style="font-size:17px;line-height:1.45"></p><div id="choice-btns" style="display:flex;flex-direction:column;gap:10px;margin-top:14px"></div></div>';
        document.body.appendChild(el);
      }
      el.querySelector('#choice-who').textContent = who;
      el.querySelector('#choice-text').textContent = plain ? text : '\u201c' + text + '\u201d';
      const box = el.querySelector('#choice-btns'); box.innerHTML = '';
      for (const [label, fn] of options) {
        const b = document.createElement('button'); b.className = 'btn'; b.textContent = plain ? label : '\u201c' + label + '\u201d';
        // (Rhys: it "remains paused" after the answer) the pointer takes a moment to
        // come back, and the pause menu's watch (two seconds from the last ask) saw it free and
        // opened: now the ask is made afresh, and tried again as at the start
        b.onclick = () => {
          el.style.display = 'none'; S.dialog = false; audio.click(); fn();
          if (S.dialog) return;                        // the answer opened something else (the paper)
          S.wantLock = S.time; input.requestLock();
          for (const ms of [400, 1100]) setTimeout(() => { if (S.playing && !S.menu && !S.dialog && !input.locked) input.requestLock(); }, ms);
        };
        box.appendChild(b);
      }
      S.dialog = true; el.style.display = 'flex';
      if (document.pointerLockElement) document.exitPointerLock();
    },

    begin() {
      voices.preloadSpoken(level.train ? ['staff', 'staff2', 'kiosk', 'pa', 'guard', 'front', 'minister', 'steward', 'red'] : rel ? ['yellow', 'red'] : ['red'], 0.15);
      if (!L0) { voices.preload(); return; }
      hint('start');
      voices.preload();
      radio('entering', true); radio('goodLuck', true);
    },

    // bullet time: the world runs at a quarter speed while it lasts
    timeScale() { return S.slow > 0 ? SLOWMO.scale : 1; },

    tick(dt, simDt, active) {
      // the pouch keeps the guns you carry topped up, as far as they hold
      rt.pouchT = (rt.pouchT || 0) + dt;
      if (rt.pouchT > 0.5 && arsenal && arsenal.loadout && arsenal.useSpareFor) {
        rt.pouchT = 0;
        for (const k of arsenal.loadout.keys()) { const a = arsenal.ammo[k]; if (a && a.reserve !== undefined) arsenal.useSpareFor(k); }
      }
      if (S.slow > 0) S.slow = Math.max(0, S.slow - dt);
      if (S.kickMsg > 0) S.kickMsg -= dt;
      canvas.style.filter = S.slow > 0 ? 'saturate(0.35) contrast(1.15) brightness(0.95)' : '';
      if (hintT > 0) { hintT -= dt; if (hintT <= 0) $('hint').style.opacity = 0; }
      if (barkT > 0) { barkT -= dt; if (barkT <= 0) $('bark').style.opacity = 0; }
      voices.tick(dt);
      for (let i = later.length - 1; i >= 0; i--) { later[i].t -= dt; if (later[i].t <= 0) { const f = later[i].fn; later.splice(i, 1); f(); } }
      if (!active || m.done) return;
      m.update(simDt);
      const h = player.h || 1.8;
      nav.syncDoors(level.swingDoors);          // a locked reinforced door is a wall to guards
      const ctxG = {
        world: level.world, nav, guards, doors: level.swingDoors, bark, alarm, noises, seats: level.seats || null, yellowLines: !!rel,
        pathBudget: { left: 1 }, dark: level.dark ? true : dark || false, chaseMax: level.chaseMax || 0,
        alerted: m.spotted > 0 || m.shotsFired > 0 || m.breaches > 0 || m.kills > 0,
        lastLine,
        smokes: smokes.filter((c) => c.until > m.time),
        diff: diff(),
        you: { player: true, pos: player.pos, eye: player.eyePos, chest: [player.pos[0], player.pos[1] + h * 0.55, player.pos[2]],
          stance: player.stance, speed: Math.hypot(player.vel[0], player.vel[2]),
          // (M6.29) Shadow: guards slower to make you out, with or without the camouflage
          disguise: rt.disguise || null,
          camo: (() => { const c = (arsenal && arsenal.loadout && arsenal.loadout.gearTrait('camo')) || 0, sh = (player.skills && player.skills.shadow) || 1; return c ? c * sh : sh < 1 ? sh : 0; })(),
          noise: player.mode === 'dead' ? 0 : player.noise || 0, box: player.box() },
      };
      if (player.mode === 'dead' || m.done) ctxG.you = null;
      // where the Yellows keep with you: your feet, when you are on them
      ctxG.lead = ctxG.you && player.onGround ? player.pos : (job && job.lastLead) || null;
      if (job && ctxG.lead) job.lastLead = ctxG.lead.slice();
      // a gun held on a Yellow: a warning, then they act
      if (standing && !standing.hostile && S.aimNow && S.aimNow.aim && ctxG.you) {
        const e = player.eyePos, d = S.aimNow.dir;
        const hit = level.world.raycast(e, d, STANDING_AIM, (q) => q.glass || q.shootThrough || q === (player.solid || null));
        const y = hit && hit.solid && hit.solid.target && hit.solid.target.guard;
        const r = standing.aim(simDt, !!(y && y.faction === 'yellow' && !y.dead));
        if (r === 'warn') speak(y || guards.find((q) => q.faction === 'yellow' && !q.dead), YELLOW_TALK.warn[Math.floor(Math.random() * YELLOW_TALK.warn.length)]);
        if (r === 'hostile') turnYellows();
      }
      // the Night Train: its run - waiting for you, the doors, away
      if (level.trainRun) trainTick(simDt);
      for (const c of level.cannons || []) {
        if (c.t > 0) c.t -= simDt;
        if (cannonNear() === c && S.aimNow && S.aimNow.dir) { const d = S.aimNow.dir; c.yaw = Math.atan2(-d[0], -d[2]); c.ent.setEulerAngles(Math.asin(Math.max(-0.5, Math.min(0.5, d[1]))) * 180 / Math.PI, c.yaw * 180 / Math.PI, 0); }
      }
      // a terminal: progress while E is held, nothing lost if you let go - but walk away and it starts again
      simDtNow = simDt;
      { const tn = terminalNear(); if (tn && !tn.done && input.held('interact') && player.mode !== 'dead' && !S.dialog) { rt.hackT = (rt.hackT || 0) + simDt * ((arsenal && arsenal.loadout && arsenal.loadout.gearTrait('hackSpeed')) || 1) * ((player.skills && player.skills.hacker) || 1); if (tn.net) { traced(tn.net, tn.pos); if (Math.random() < simDt * 1.5) noises.push({ pos: tn.pos, loud: 0.35 }); } if (rt.hackT >= tn.time) { rt.hackT = 0; hacked(tn); } } else if (!tn) rt.hackT = 0; }
      // the hacking kit, at a camera or turret: slower, the same choice for that one
      { const dn = !terminalNear() && deviceNear(); if (dn && input.held('interact') && player.mode !== 'dead' && !S.dialog) { if (rt.kitDev !== dn) { rt.kitDev = dn; rt.kitT = 0; } const card = byCard(dn); rt.kitT += simDt * ((arsenal.loadout.gearTrait('hackSpeed')) || 1) * ((player.skills && player.skills.hacker) || 1); if (dn.net && !card) traced(dn.net, player.pos.slice()); if (card && rt.kitT >= 2) { rt.kitT = 0; rt.kitDev = null; setMode([dn], 'friendly'); syncLocks(devices); dn.known = true; audio.confirm(); showHint((haveCard.has(dn.net) ? 'The keycard' : 'Skeleton Card') + ': the maglock lets go.'); } else if (!card && rt.kitT >= HACK.kit) { rt.kitT = 0; rt.kitDev = null; hackChoice([dn], (gear('hackReach') ? 'Long-Arm Relay: ' : 'Hacking kit: ') + deviceName(dn) + '.'); } } else if (!dn) { rt.kitT = 0; rt.kitDev = null; } }
      // cameras and turrets
      if (dogs.length) { dogsStep(simDt); drawDogs(simDt); }
      if (devices.length) {
        const you = { pos: player.pos, chest: [player.pos[0], player.pos[1] + 1.15, player.pos[2]], dead: player.mode === 'dead' };
        const camSlow = gear('camBlind') ? 1e9 : gear('camSlow') || 1;
        for (const d of devices) stepDevice(d, simDt, { world: level.world, rel, you, guards, alarm: deviceAlarm, shoot: deviceShot, camSlow, disguise: rt.disguise || null });
        brokenWatch();
        specialists(simDt);
        lasersWatch();
        if (syncLocks(devices)) nav.syncDoors(level.swingDoors);
        lightsWatch();
        if (sir.cool > 0) sir.cool -= simDt;
        if (sir.t > 0) sir.t -= simDt;
        // what you know of them, for the radar: seen from near enough, or on a network you have hacked
        if ((rt.knowT = (rt.knowT || 0) + simDt) > 0.25) {
          rt.knowT = 0;
          const eye = player.eyePos;
          for (const d of devices) {
            if (d.known) continue;
            const dx = d.pos[0] - eye[0], dy = d.pos[1] - eye[1], dz = d.pos[2] - eye[2], dd = Math.hypot(dx, dy, dz);
            if (dd > 24) continue;
            if (S.vision === 'emf' || dd < 2) { d.known = true; continue; }
            if (d.hidden) continue;                     // a pinhole camera: only EMF finds it
            const h = level.world.raycast(eye, [dx / dd, dy / dd, dz / dd], dd, (q) => q.person || q.glass);
            if (!h || h.t > dd - 0.6) d.known = true;
          }
        }
        drawDevices();
      }
      if (job) {
        const evs = job.tick((y) => y.canSee([level.locket.pos[0], level.locket.pos[1] + 0.1, level.locket.pos[2]], ctxG, 8),
          (a, b) => { nav.syncDoors(level.swingDoors); return nav.find(a, b); });
        for (const e of evs) {
          if (e.type === 'locket') { speak(e.by, YELLOW_TALK.gotIt); showHint('The Yellows have their locket. They are leaving - down the coil and out of the front door.'); }
          if (e.type === 'missing') showHint('The locket\'s place is empty - and the Yellows know you have been in here. The boss wants a word (E).');
          if (e.type === 'gone') showHint(job.gaveUp ? 'The Yellows are gone - without their locket.' : 'The Yellows are gone, the locket with them.');
        }
      }
      holdUps(simDt);
      for (const g of guards) {
        if (g.dormant) continue;                     // the train's hijackers, before the hijack
        if (g.heldUp) { g.speed = 0; continue; }     // (M6.30) hands up: he does nothing
        const was = g.state;
        g.neutral = neutral(g);
        if (rel) {
          const foe = pickFoe(g, ctxG.you, guards, rel, ctxG, simDt);
          // (whoever he is up against, he does not walk through you)
          g.step(simDt, Object.assign({}, ctxG, { you: foe, blockers: ctxG.you && foe !== ctxG.you ? [ctxG.you.box] : [] }));
        } else g.step(simDt, ctxG);
        for (const ev of g.events) {
          if (ev.type === 'shot' && (ctxG.you || ev.at)) guardShot(g, ev);
          // the captain's door, slammed - heard by you; (Rhys:
          // everyone on the roof knew you were coming) not a noise his own men
          // come to look into: it was their captain
          if (ev.type === 'slam') audio.door(false);
        }
        g.events.length = 0;
        if (g.state === 'alert' && was !== 'alert' && (!rel || g.foe === 'you')) { m.spotted++; audio.deny(); radio(m.spotted === 1 ? 'moving' : 'six', m.spotted > 2); }
        // (M6.30) one of them has seen through it: the disguise is done
        if (rt.disguise && g.state === 'alert' && was !== 'alert' && g.foe === 'you' || (rt.disguise && g.state === 'alert' && was !== 'alert' && !rel && g.faction === rt.disguise)) dropDisguise('They have seen through your disguise.');
        if (g.dead && !g.dropped) {
          g.dropped = true;
          // (Rhys: a corpse "half hanging out of the sealed train doors") on the train he falls
          // along the aisle, not through its side
          if (level.trainRun && inTrain(g.pos)) { g.yaw = Math.cos(g.yaw) * 0 + (Math.sin(g.yaw) >= 0 ? Math.PI / 2 : -Math.PI / 2); g.pos[2] = Math.max(-0.5, Math.min(0.5, g.pos[2])); }
          // his gun falls beside him, with what was left in it and a spare magazine
          const side = [Math.cos(g.yaw) * 0.55, Math.sin(-g.yaw) * 0.55];
          // dead in the helicopter's door, his gun goes with him; anywhere
          // else it falls to the floor under where it left his hand
          const inHeli = capRun && g === capRun.g && capRun.stage === 'aboard';
          // (M6.28) his keycard, if he carries one: it opens his network's maglocks, quietly
          if (g.card) dropCard(g, groundBelow(level.world, [g.pos[0] - side[0], g.pos[1], g.pos[2] - side[1]]));
          if (!inHeli && g.item) dropAt(g.item, (ITEMS[g.item] && ITEMS[g.item].model) || g.arms.model, groundBelow(level.world, [g.pos[0] + side[0], g.pos[1], g.pos[2] + side[1]]), Math.max(0, g.ammo || 0) + g.arms.mag);
        }
        if (g.dead && !g.counted) {
          g.counted = true;
          if (g.side === 'ally' && B) continue;         // one of your side, in a battle: the count has him
          if (g.side === 'ally' && !level.hijack) { showHint((g.title || 'One of yours') + (g.target.lastBy === 'you' ? ' - shot by you.' : ' is down.')); continue; }      // (M6.87) a Ghost operative with you, in a first draft
          if (g.side === 'ally') {
            // (Rhys: "I 'accidentally' killed the Guard") by your hand, it is on the debrief
            if (g.target.lastBy === 'you') { level.hijack.guardKilledByYou = true; showHint('You have killed the train\'s guard.'); }
            else showHint('The guard is down.');
            continue;
          }
          // only those you were sent for count; one put down by the other side is down, but not by you
          const byOther = g.target.lastBy && g.target.lastBy !== 'you' && !g.takenDownBy;
          if (g.objective === false) { m.yellowsDown = (m.yellowsDown || 0) + 1; if (!g.knockedOut && !byOther) m.yellowsKilled = (m.yellowsKilled || 0) + 1; }
          else if (B && byOther) { /* (M6.19.5) a battle: down, but not by you */ }
          else { m.guardDown(g); if (!byOther) m.downedWith(baseId(g.takenDownBy || (arsenal && arsenal.current)) || 'hands'); }
        }
      }
      if (!L0) {
        // the captain's run for the helicopter
        if (capRun) {
          capRun.step(simDt, { now: clockNow(), guardCtx: ctxG });
          for (const ev of capRun.events) {
            if (ev.type === 'leaving') showHint('23:30 - the captain is leaving for his helicopter. Stop him.');
            if (ev.type === 'fleeing') {
              showHint('The captain is running - for the roof door on the third floor, and his helicopter. Stop him.');
              intercept('inside'); intercept('twoMin');
            }
            // the pilot, heard as well as read
            if (ev.type === 'hurry') intercept('thirty');
            if (ev.type === 'aboard') intercept('hangOn');
            if (ev.type === 'stranded') intercept('timesUp');
            if (ev.type === 'heliLeft' && capRun.stopped) intercept('down');
            if (ev.type === 'boarding') showHint('The captain is on the roof, making for the helicopter. Stop him before it lifts.');
            if (ev.type === 'aboard') showHint('He is in the helicopter and the rotors are winding up - stop him NOW.');
            if (ev.type === 'stranded') showHint('The helicopter has left without the captain - he is stranded on the roof. Stop him.');
            if (ev.type === 'heliLeft' && capRun.stopped) showHint('The helicopter is leaving, empty.');
            if (ev.type === 'stopped') { audio.stepDone && audio.stepDone(); showHint(hostages.length && rescued() < hostages.length ? 'The captain is down. Now the hostages.' : 'The captain is down. Back to the Ghost jeep.'); }
            // not a failure any more: an outcome - you will meet him again
            if (ev.type === 'escaped') showHint('The captain got away in his helicopter. That is not the end of it - nor of him.');
          }
          capRun.events.length = 0;
        }
        // the hostages: cut loose while E is held over one; then they follow
        const hn = hostageNear();
        if (hn && hn.state === 'held' && input.held('interact') && player.mode !== 'dead') hn.work(simDt);
        const hctx = { nav, you: ctxG.you, safe: inSafe, pathBudget: { left: 1 }, doors: level.swingDoors, lift: level.lift, crowd: hostages };
        for (const hq of hostages) {
          hq.step(simDt, hctx);
          for (const ev of hq.events) {
            // (M6.93) a prisoner who fights: freed, the ally waiting for him takes his place - and the prisoner goes with him
            const gun = ev.type === 'freed' && guards.find((g) => g.freedFrom === hq.id && g.dormant && !g.dead);
            if (gun) { gun.dormant = false; gun.target.solid.disabled = false; gun.pos = hq.pos.slice(); gun.home = { pos: hq.pos.slice(), yaw: gun.yaw }; gun.moveBody && gun.moveBody(); hq.armedGuard = gun; hq.target.solid.disabled = true; audio.stepDone && audio.stepDone(); showHint(whoIs(hq) + ' is free - and armed. ' + He(hq) + ' keeps with you and fights. Get ' + him(hq) + ' to ' + (level.safeName || 'the way out') + '.'); }
            else if (ev.type === 'freed') { audio.stepDone && audio.stepDone(); showHint(whoIs(hq) + ' is free. ' + He(hq) + ' will follow you: get ' + him(hq) + ' to ' + (level.safeName || 'the police cars in the street') + '. E tells ' + him(hq) + ' to wait, or to come on.'); }
            if (ev.type === 'rescued') { audio.stepDone && audio.stepDone(); showHint(whoIs(hq) + ' is safe with the police: ' + rescued() + ' of ' + hostages.length + '.'); }
            // not a failure any more: an outcome the story remembers
            if (ev.type === 'killed') showHint(whoIs(hq) + ' has been killed.');
          }
          hq.events.length = 0;
          // (M6.93) armed: where he goes, the prisoner is (out of sight, for the count); if he falls, so has the prisoner
          if (hq.armedGuard && hq.state !== 'rescued' && hq.state !== 'dead') {
            const g = hq.armedGuard;
            if (g.dead) { hq.state = 'dead'; showHint(whoIs(hq) + ' has been killed.'); }
            else { hq.pos[0] = g.pos[0]; hq.pos[1] = g.pos[1]; hq.pos[2] = g.pos[2]; hq.state = 'following'; }
          }
        }
        // (Rhys) shoving: freed hostages and guards push apart where
        // they meet, and you push whoever you walk into. A guard shoved knows
        // you are there.
        {
          const ppl = [];
          // (Rhys: shoved in the lift, a hostage ended up through its
          // wall) nobody in a MOVING lift car is shoved, nor shoves from it;
          // (Rhys: you can't even shove them out of the way) in a
          // car standing at a floor you can - but only within its walls, and
          // in or out only through its open doorway
          const Lf = level.lift;
          const inCar = (p) => Lf && Lf.moving && Lf.carries(p);
          const carOk = (p, x, z) => {
            if (!Lf || Math.abs(p.pos[1] - Lf.carY) > 1.2) return true;
            const D = Lf.def, r = p.r, wasIn = Lf.carries(p.pos);
            const nowIn = x > D.x0 && x < D.x1 && z > D.z0 && z < D.z1;
            const doorway = Lf.doors > 0.85 && !Lf.moving && z - r > D.door.z0 && z + r < D.door.z1;
            if (wasIn && nowIn) return (x - r > D.x0 || doorway) && x + r < D.x1 && z - r > D.z0 && z + r < D.z1;
            if (wasIn !== nowIn) return doorway;
            return true;
          };
          // not anyone on a ladder: shoved, he never got onto it
          for (const hq of hostages) if (hq.free && !hq.climbing && !inCar(hq.pos)) ppl.push({ pos: hq.pos, r: 0.3, who: hq, h: 1.75 });
          for (const g of guards) if (!g.dead && !g.dormant && !g.climbing && !inCar(g.pos)) ppl.push({ pos: g.pos, r: 0.32, who: g, h: 1.8 });
          const fitsAt = (p, dx, dz) => {
            const x = p.pos[0] + dx, z = p.pos[2] + dz, r = p.r, y = p.pos[1];
            const own = p.who.target && p.who.target.solid;
            if (!carOk(p, x, z)) return false;
            if (!standable(level.world, x, y, z)) return false;      // not into water, not off a ledge
            return !level.world.hits([x - r, y + 0.35, z - r], [x + r, y + p.h, z + r]).some((s2) => s2 !== own && !s2.person);
          };
          const youP = player.mode !== 'dead' && !inCar(player.pos) ? { pos: player.pos, intent: player.intent, r: 0.3, strong: player.sprinting } : null;
          const hit = shove(ppl, youP, simDt, fitsAt);
          for (const p of ppl) { if (p.who.moveBody) p.who.moveBody(); }
          for (const p of hit) {
            const g = p.who;
            if (guards.includes(g) && g.state !== 'flee') { g.awareness = Math.max(g.awareness, 1); g.stim = player.pos.slice(); g.since = 0; }
          }
        }
        // (Rhys: it cannot end the moment they are out - you would
        // never get to finish both objectives) the hostages safe, the mission
        // ends when you get back to the jeep
        const hostagesSafe = hostages.length && rescued() === hostages.length;
        // (Rhys: objectives independent of completion) nothing left
        // to settle - every hostage out or dead, the captain stopped or gone -
        // and the jeep ends it; with something still open, leaving is your
        // choice: E held at the jeep
        const now = outcome(), settled = rules.settled(now);
        const allSafe = hostagesSafe && capStopped();
        if (hostagesSafe && !rt.toldSafe) { rt.toldSafe = true; if (!capStopped()) showHint('All the hostages are safe. Now stop the captain - then back to the Ghost jeep.'); }
        if (settled && !rt.toldApc && !level.trainRun) { rt.toldApc = true; showHint(level.settledHint || (allSafe ? 'All the hostages are safe and the captain is stopped. Get back to the Ghost jeep to finish.' : 'Nothing more can be done here. Get back to the Ghost jeep.')); }
        const az = level.apcZone;
        const atJeep = az && player.mode !== 'dead' && inStreetZone(az, player.pos);
        // you start at your way out: withdrawing is offered only once you have been in
        if (!atJeep && az) rt.wentIn = true;
        if (atJeep && rt.wentIn && !settled && input.held('interact')) rt.leaveT = (rt.leaveT || 0) + dt; else rt.leaveT = 0;
        // (Rhys: "Retreat should be treated differently than a Win or Loss") leaving a battle before it is decided
        if (atJeep && (settled || rt.leaveT >= LEAVE_HOLD)) { if (B && !B.over) { B.retreat(); rt.endHotel(outcome()); return; } rt.endHotel(now); return; }
        // the hotel's guards, and the hints that go with them
        if (tracker.list().some((k) => k.live && k.kind === 'enemy')) hint('radar');
        if (guards.some((g) => !g.dead && g.awareness > 0.25)) hint('noticed');
        noises.length = 0;
        for (const ev of m.events) {
          if (ev.type === 'kill') radio(m.kills === 1 ? 'tango' : 'neutral', true);
          if (ev.type === 'knockout') radio('goodWork', true);
        }
        m.events.length = 0;
        if (level.draft) {
          // (M6.75) a man to follow (objective kind 'tail'): within range of him (o.range, 40 m) - not too close (o.near,
          // 4 m, for 3 s), not seen (his awareness of you past 0.7, or alerted) - until he is at his route's last point.
          // Out of range for o.lose (15 s) and you have lost him.
          for (const o of level.objectives || []) {
            if (o.kind !== 'tail') continue;
            const g = guards.find((q) => q.id === o.ref); if (!g) continue;
            const tl = rt.tails || (rt.tails = {}), s = tl[o.id] || (tl[o.id] = { lost: 0, close: 0, done: false, failed: false, why: '' });
            if (s.done || s.failed) continue;
            const who = g.name || 'He';
            if (g.dead) { s.failed = true; s.why = 'he is down'; showHint(who + ' is down - and where he was going, nobody will know now.'); continue; }
            const d = Math.hypot(g.pos[0] - player.pos[0], g.pos[2] - player.pos[2]) + Math.abs(g.pos[1] - player.pos[1]) * 2;
            s.d = d;
            // (M6.98) the clock on losing him runs only once you have been within range of him at all
            if (d <= (o.range || 40)) s.begun = true;
            s.lost = !s.begun ? 0 : d > (o.range || 40) ? s.lost + dt : Math.max(0, s.lost - dt);
            s.close = d < (o.near || 4) ? s.close + dt : Math.max(0, s.close - dt * 0.5);
            const end = g.route && g.route[g.route.length - 1];
            if (g.awareness > 0.7 || g.state === 'alert' || g.state === 'flee' || s.close > 3) { s.failed = true; s.why = 'he made you'; showHint(who + ' has seen you following him.'); }
            else if (s.lost > (o.lose || 15)) { s.failed = true; s.why = 'you lost him'; showHint('You have lost ' + (g.name || 'him') + '.'); }
            else if (end && g.leg === g.route.length - 1 && Math.hypot(g.pos[0] - end[0], g.pos[2] - end[1]) < 0.8) { s.done = true; audio.confirm(); showHint(o.said || who + ' is where he was going - and now you know where that is.'); }
            else if (s.lost > 0 && !s.warned) { s.warned = true; showHint('You are losing ' + (g.name || 'him') + ' - closer.'); }
            else if (s.lost === 0) s.warned = false;
          }
          // the vehicles others drive: along their way, their crews riding them
          for (const v of level.drivables || []) {
            if (!v.path && !(v.crew && v.crew.length)) continue;
            const crew = v.crew.map((c) => ({ c, g: guards.find((q) => q.id === c.id) })).filter((x) => x.g);
            const drv = crew[0] && crew[0].g;
            v.crewDown = !!drv && drv.dead;
            if (v.driver === 'you') {
              // (Rhys: "stealing another boat leaves their bodies floating there") taken, its crew's bodies go
              // with it - the helmsman's moved off the seat you are in, onto the deck behind
              if (!v.taken) { v.taken = true; for (const x of crew) if (Math.abs(x.c.at[0] - v.K.seat[0]) < 0.5 && Math.abs(x.c.at[1] - v.K.seat[2]) < 0.6) x.c.at = [0.35, 1.9]; }
            } else if (v.path) {
              if (!v.pilot) v.pilot = new Pilot(v, v.path, { speed: v.pathSpeed, loop: v.pathLoop });
              v.driver = v.traffic ? (!v.wrecked && !v.taken ? 'ai' : null) : drv && !drv.dead && !v.escaped && !v.taken ? 'ai' : null;      // (traffic drives itself)
              // one that waits (spec wait: seconds) sits with its engine running till then - or till its
              // crew is shot at, when it goes at once
              const early = v.wait && crew.some((x) => x.g.dead || (x.g.target && x.g.target.hp < x.g.target.maxHp));
              // one held by a terminal (spec holdOn: its id) stops where it is once that is done
              if (v.holdOn && !v.held && (level.terminals || []).some((t) => t.id === v.holdOn && t.done)) { v.held = true; showHint((v.name || 'It') + ' is held where it is.'); }
              if (v.held) { v.step(simDt, { throttle: 0, steer: 0, brake: true }); continue; }
              v.waited = (v.waited || 0) + simDt;
              v.step(simDt, v.wait && v.waited < v.wait && !early ? { throttle: 0, steer: 0, brake: true } : v.pilot.control());
            }
            // how far it still has to go
            if (v.pilot) { let left = 0, a = [v.pos[0], v.pos[2]]; for (let i = v.pilot.i; i < v.path.length; i++) { left += Math.hypot(v.path[i][0] - a[0], v.path[i][1] - a[1]); a = v.path[i]; } v.leftM = left; }
            if (v.pilot && v.pilot.done && v.goal === 'escape' && !v.crewDown && !v.wrecked && !v.escaped) { v.escaped = true; showHint((v.name || 'They') + ' got away.'); }
            for (const { c, g } of crew) {
              // (the fallen ride on with it, slumped where they were)
              const cc = Math.cos(v.yaw), sn = Math.sin(v.yaw), lx = c.at[0], lz = c.at[1];
              g.pos[0] = v.pos[0] + lx * cc + lz * sn; g.pos[1] = v.pos[1] + 0.25; g.pos[2] = v.pos[2] - lx * sn + lz * cc;
              if (!g.dead) { g.home = { pos: g.pos.slice(), yaw: g.yaw }; g.path = null; }
              if (g.moveBody && !g.dead) g.moveBody();
            }
          }
          // radiation: the dose here (hp a second), the Geiger counter clicking faster with it, the harm
          // taken a second at a time; a word the first time
          if (level.radiation && level.radiation.length && player.mode !== 'dead') {
            let rad = 0;
            for (const q of level.radiation) { const d = Math.hypot(player.pos[0] - q.pos[0], (player.pos[1] - q.pos[1]) * 0.5, player.pos[2] - q.pos[2]); if (d < q.r) rad += q.rate * (1 - d / q.r) * (1 - d / q.r); }
            rt.rad = rad;
            if (rad > 0.02) {
              if (Math.random() < Math.min(0.9, 0.08 + rad * 0.5) * simDt * 30) audio.geiger && audio.geiger();
              rt.radDose = (rt.radDose || 0) + rad * simDt;
              if (rt.radDose >= 1) { player.damage(Math.floor(rt.radDose), 'radiation'); rt.radDose -= Math.floor(rt.radDose); }
              if (!rt.radTold && rad > 0.3) { rt.radTold = true; showHint('Radiation - your counter is clicking. It hurts you while you are in it, and you will not heal till you are out.'); }
            }
          }
          // running water: whoever swims in it is carried along
          if (player.mode === 'swim') for (const c of level.currents || []) {
            const P = player.pos;
            if (P[0] > c.box[0][0] && P[0] < c.box[1][0] && P[2] > c.box[0][2] && P[2] < c.box[1][2] && P[1] > c.box[0][1] && P[1] < c.box[1][1]) {
              const nx = P[0] + c.v[0] * simDt, nz = P[2] + c.v[1] * simDt, r = 0.3;
              if (!level.world.hit([nx - r, P[1] + 0.1, nz - r], [nx + r, P[1] + 1.6, nz + r])) { P[0] = nx; P[2] = nz; }
              break;
            }
          }
          // portals: in one, and you are somewhere else (the same, or not)
          for (const pt of level.portals || []) {
            if (pt.off && level.pickups.some((q) => q.id === pt.off && q.taken)) continue;
            if (pt.on && !level.pickups.some((q) => q.id === pt.on && q.taken)) continue;
            if (pt.times && pt.used >= pt.times) continue;
            const P = player.pos;
            if (player.mode !== 'dead' && P[0] > pt.box[0][0] && P[0] < pt.box[1][0] && P[2] > pt.box[0][2] && P[2] < pt.box[1][2] && P[1] > pt.box[0][1] && P[1] < pt.box[1][1]) {
              // one that works only going one way
              if (pt.heading && player.vel[0] * pt.heading[0] + player.vel[2] * pt.heading[1] < 0.2) continue;
              pt.used++;
              if (pt.to) {
                // somewhere else, turned: where you stood in the doorway, turned about it, put down there
                const c = Math.cos(pt.turn), s2 = Math.sin(pt.turn), rx = P[0] - pt.from[0], rz = P[2] - pt.from[2];
                player.pos = [pt.to[0] + rx * c - rz * s2, pt.to[1] + (P[1] - pt.from[1]), pt.to[2] + rx * s2 + rz * c];
                const v = player.vel; player.vel = [v[0] * c - v[2] * s2, v[1], v[0] * s2 + v[2] * c];
                if (pt.turn) { input.yaw -= pt.turn; player.yaw = input.yaw; }
              } else player.pos = [P[0] + pt.shift[0], P[1] + pt.shift[1], P[2] + pt.shift[2]];
              if (pt.said) showHint(pt.said);
              if (pt.yaw) { input.yaw += pt.yaw; player.yaw = input.yaw; }
              if (S.prevPos) S.prevPos = null;
              if (player.settle) player.settle();
              break;
            }
          }
          // a first draft: the next thing to do, and how far the rest are
          for (const z of level.reach) if (!z.done && player.mode !== 'dead' && player.pos[0] > z.box[0][0] && player.pos[0] < z.box[1][0] && player.pos[2] > z.box[0][2] && player.pos[2] < z.box[1][2] && player.pos[1] > z.box[0][1] && player.pos[1] < z.box[1][1]) {
            if (!z.hold) { z.done = true; audio.stepDone && audio.stepDone(); showHint(z.name + ' - reached.'); continue; }
            // (M6.79) a place to hold: so many seconds in it (they add up - step out, and it waits), and the reserves
            // with a wave number come in as it goes: wave 1 at once, the rest spread through the hold
            if (z.after && !(level.terminals || []).some((t) => t.id === z.after && t.done)) { if (!z.toldAfter) { z.toldAfter = true; showHint(z.name + ': not yet - ' + ((level.terminals || []).find((t) => t.id === z.after) || { name: 'the terminal' }).name + ' first.'); } continue; }
            const waves = Math.max(0, ...guards.filter((g) => g.reserve && g.wave).map((g) => g.wave));
            const before = z.held; z.held += simDt;
            if (!z.started) { z.started = true; showHint(z.name + ': hold it - ' + Math.round(z.hold) + ' seconds.'); }
            for (let k = 1; k <= waves; k++) {
              const at = (k - 1) / waves * z.hold;
              if (before <= at && z.held > at) {
                const rs = guards.filter((g) => g.reserve && g.dormant && g.wave === k);
                for (const g of rs) { g.dormant = false; g.target.solid.disabled = false; g.awareness = 0.9; g.stim = player.pos.slice(); g.since = 0; g.state = 'search'; g.stateT = 0; g.path = null; g.pursuit = true; }
                if (rs.length) later.push({ t: 1.5, fn: () => showHint('They are coming for you: ' + rs.length + ' more.') });
              }
            }
            if (z.held >= z.hold) { z.done = true; audio.stepDone && audio.stepDone(); showHint(z.said || z.name + ' - held.'); }
          }
          if (B) { battleTick(simDt); return; }
          const os = now.objectives || [], next = os.find((x) => !x.optional && !x.done && !x.failed);
          const fol = hostages.filter((q) => q.free).length;
          $('step').style.display = 'block';
          $('step').textContent = settled ? 'All done  -  back to ' + level.extractName + ' to extract'
            : next.text + (next.status && next.kind !== 'take' && next.kind !== 'hack' && next.kind !== 'reach' ? ' (' + next.status + ')' : '') + (fol ? '  -  ' + fol + ' with you' : '') + '  -  ' + os.filter((x) => !x.optional && (x.done || x.failed)).length + ' of ' + os.filter((x) => !x.optional).length + ' done';
          for (const o of os) if (o.done && !rt['told_' + o.id]) { rt['told_' + o.id] = true; if (o.kind === 'clear' || o.kind === 'kill') { audio.stepDone && audio.stepDone(); showHint(o.text + ' - done.'); } }
        } else if (hostages.length) {
          const fol = hostages.filter((q) => q.free).length;
          $('step').style.display = 'block';
          // the pilot's two minutes, counting down
          const left = capRun && capRun.since !== null && !capRun.heli.leaving && !capStopped() && capRun.stage !== 'aboard' ? Math.max(0, Math.ceil(HELI.wait - capRun.since)) : null;
          const clock = left !== null ? '  -  helicopter leaves in ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0') : '';
          const capLine = clock + (capRun ? (capStopped() ? '  -  captain: stopped' : capRun.stage === 'aboard' ? '  -  CAPTAIN: IN THE HELICOPTER' : capRun.stage === 'stranded' ? '  -  captain: stranded on the roof' : capRun.stage === 'hotel' ? (capRun.g.fled ? '  -  captain: RUNNING' : '') : '  -  captain: on the roof') : '');
          const lost = hostages.filter((q) => q.state === 'dead').length;
          $('step').textContent = (allSafe ? 'All done  -  back to the jeep' : rescued() === hostages.length ? 'Hostages safe: all ' + hostages.length : 'Hostages safe: ' + rescued() + ' of ' + hostages.length + (lost ? ' (' + lost + ' killed)' : '') + (fol ? '  -  ' + fol + ' with you' : '')) + capLine;
        } else if (level.rules === 'train') {
          const run = level.trainRun, aboard = inTrain(player.pos);
          $('step').style.display = 'block';
          const mins = Math.max(1, Math.ceil(run.eta() / 60));
          const HJ = level.hijacked && level.hijack, hDown = HJ ? level.hijackers.filter((g) => g.dead).length : 0;
          const hjLine = HJ ? '  -  the Minister (Coach 1): ' + (HJ.minister === 'alive' ? (holders().length ? 'held' : 'safe') : 'dead') + (HJ.done ? '' : '  -  the Front: ' + hDown + ' of ' + HIJACK.total + ' down') : '';
          $('step').textContent = run.clock().slice(0, 5) + '  -  ' + (HJ && run.state !== 'arrived' ? (HJ.done ? 'The train is yours again' : 'The Front of Memory have the train') + hjLine + '  -  ' + (run.state === 'braking' ? 'arriving' : 'Belyagorsk in ' + mins + ' min') : run.state === 'running' || run.state === 'braking' ? 'On the 21:40 to Belyagorsk' + (run.section === 'tunnel' ? '  -  in the tunnels' : '') + '  -  ' + Math.round(run.speed * 3.6) + ' km/h  -  ' + (run.state === 'braking' ? 'arriving' : 'Belyagorsk in ' + mins + ' min')
            : run.state === 'arrived' ? 'Belyagorsk - Alyejka Azvestya  -  step off the train'
            : run.state === 'closing' ? 'The doors are closing'
            : aboard ? 'Aboard the 21:40 - Coach 3 is yours' : 'Find your train: the 21:40 to Belyagorsk (the departures board)');
        } else if (level.rules === 'casino') {
          // (Rhys) the ledger first; the Yellows' locket if you took their errand on
          $('step').style.display = 'block';
          const yl = now.teamed && !now.jobOver ? '  -  the Yellows: their locket, in the Cash Vault' : '';
          $('step').textContent = (settled ? 'All done  -  back to the jeep' : now.ledger ? 'The ledger is yours' + yl + '  -  hold E at the jeep to withdraw' : 'Find the reds\' ledger (the Cash Vault)' + yl);   // (M6.17.12, Rhys: no reds-down count on screen any more)
        } else if (level.rules === 'factory') {
          // the factory: how many yellows are still in it (the casino's reds)
          const side = ['yellows', 'Yellows', 'your way in'];
          $('step').style.display = 'block';
          $('step').textContent = now.cleared ? 'All the ' + side[0] + ' are down  -  back to ' + side[2] + ' to extract' : side[1] + ' down: ' + now.down + ' of ' + now.total + '  -  hold E at ' + side[2] + ' to withdraw';
        } else $('step').style.display = 'none';
        return;
      }
      // back at the van with the file: that is the end - no key needed
      beacon.enabled = m.fileDone && !m.done;
      if (beacon.enabled) beaconMat.emissiveIntensity = 1.4 + Math.sin(m.time * 4) * 0.8, beaconMat.update();
      if (m.fileDone && near(level.van.pos, level.van.radius)) { if (m.extract()) { rt.finish(); return; } }
      // the download goes on while E is held at the terminal
      if (!m.fileDone && near(level.terminal.pos, 1.7) && input.held('interact')) m.download(simDt);
      // the hints, each once, where they belong
      if (inZone(level.zones.itOffice)) hint('it');
      if (inZone(level.zones.fireEscape)) hint('fire');
      if (inZone(level.zones.duct)) hint('duct');
      if (level.smokeBox && near(level.smokeBox.pos, 2.6)) hint('supply');
      if (inZone(level.zones.guardRoomDoor) && level.guardRoomDoor.locked) hint('breach');
      if (inZone(level.zones.serverDoor) && !level.serverDoor.blown && level.serverDoor.locked) hint(m.keycard ? 'serverCard' : 'serverNoCard');
      if (near(level.terminal.pos, 2.2) && (level.serverDoor.open || level.serverDoor.blown)) hint('terminal');
      if (tracker.list().some((k) => k.live && k.kind === 'enemy')) hint('radar');
      if (guards.some((g) => !g.dead && g.awareness > 0.25)) hint('noticed');
      noises.length = 0;
      for (const ev of m.events) {
        if (ev.type === 'file') { hint('file'); audio.stepDone(); radio('secured', true); radio('extract', true); }
        if (ev.type === 'kill') radio(m.kills === 1 ? 'tango' : 'neutral', true);
        if (ev.type === 'knockout') radio('goodWork', true);
        if (ev.type === 'keycard') { hint('keycard'); audio.pickup(); }
      }
      m.events.length = 0;
      // the line at the top of the screen
      const pct = m.file > 0 && !m.fileDone ? '  ' + Math.round(m.file * 100) + '%' : '';
      $('step').style.display = 'block';
      $('step').textContent = m.objective + pct;
    },

    // every frame, drawn state
    // Guards on another floor, or far off, are neither drawn nor animated -
    // ten skinned bodies every frame cost Chromebooks dearly (Rhys: 10 fps).
    // Only the drawing stops: they still walk their routes.
    draw(dt) {
      visionShow();
      // (Rhys: the cipher book "blends into the table") a thing to take glows, and slowly pulses
      { const k = 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(m.time * 3)); for (const p of level.pickups || []) if (p.mat && !p.taken) { p.mat.emissive.set(p.colour[0] * k, p.colour[1] * k, p.colour[2] * k); p.mat.update(); } }
      // their guns, once the models have loaded: the same carbine you carry
      if (!armed && wview && wview.ready) {
        armed = true;
        bodies.forEach((b, i) => { const A = guards[i].arms, id = guards[i].item || A.item; const w = wview.spawnModel(id, (ITEMS[id] && ITEMS[id].model) || A.model);   // (M6.29) the weapon he actually carries (and drops)
          if (w) { app.root.addChild(w); b.carry = w; } });
      }
      for (const f of fx) if (f.t > 0) { f.t -= dt; if (f.t <= 0) f.e.enabled = false; }
      // (Rhys: on the cameras, guards blinked out partway round)
      // drawn by where you are looking from: a camera, while you watch one
      const cam = S.snakeCam || (S.cctv != null && level.cctv && level.cctv.cameras[S.cctv]);
      const eye = cam ? [cam.pos[0], S.snakeCam ? cam.pos[1] - 0.12 : cam.pos[1] - 2.2, cam.pos[2]] : player.pos;
      // (Rhys: "an enemy spawn in behind me from absolutely nowhere")
      // near, on your floor, or - new - in plain sight from where you look
      const sightEye = cam ? cam.pos : player.eyePos;
      const shown = cull.frame(guards, sightEye, eye[1], dt);
      guards.forEach((g, i) => {
        const visible = shown[i] && !g.dormant;
        if (bodies[i].enabled !== visible) bodies[i].enabled = visible;
        if (!visible && bodies[i].carry) bodies[i].carry.enabled = false;
        if (visible) bodies[i].update(dt, g.animState(), g.pos, g.yaw);
        // (M6.28) his shield, carried in front of him
        if (shields[i]) {
          const sh = shields[i], on = visible && !g.dead;
          if (sh.enabled !== on) sh.enabled = on;
          if (on) { sh.setPosition(g.pos[0] - Math.sin(g.yaw) * 0.45, g.pos[1] + 0.9, g.pos[2] - Math.cos(g.yaw) * 0.45); sh.setEulerAngles(0, g.yaw * 180 / Math.PI, 0); }
        }
        // his torch, under the barrel of his gun, pointing where it points
        const t = torches[i];
        if (t) {
          const on = visible && !g.dead;
          if (t.root.enabled !== on) t.root.enabled = on;
          if (on) placeTorch(t, g, bodies[i]);
          else if (t.beam.enabled) t.beam.enabled = false;
        }
      });
      npcs.forEach((n, i) => {
        // Belyagorsk's police are drawn with their platform, sliding in as you arrive
        const o = n.follow ? n.follow() : null, at = o ? [n.home[0] + o[0], n.home[1] + o[1], n.home[2] + o[2]] : n.pos;
        const b = npcBodies[i], vis = !n.gone && Math.hypot(at[0] - player.pos[0], at[2] - player.pos[2]) < 40 && (n.follow ? o[1] > -100 : n.onTrain || !level.trainRun || !level.trainRun.moving);
        if (b.enabled !== vis) b.enabled = vis;
        if (vis) b.update(dt, n.animState(), at, n.yaw);
      });
      const hshown = hcull.frame(hostages.map((hq) => ({ pos: hq.pos, hidden: hq.state === 'rescued' || !!hq.armedGuard })), sightEye, eye[1], dt);
      hostages.forEach((hq, i) => {
        const b = hbodies[i];
        const visible = hshown[i];
        if (b.enabled !== visible) b.enabled = visible;
        if (visible) b.update(dt, hq.animState(), hq.pos, hq.yaw);
      });
      flashBars(dt);
      if (L0) card.enabled = !m.keycard;
      rt.drawDetection();
    },

    prompt() {
      if (m.done) return null;
      // (Rhys: "I can't tell who's who on the assassination mission") a named man, under your sights: his name
      if (S.aimNow && S.aimNow.aim && player.mode !== 'dead') {
        const h = level.world.raycast(player.eyePos, S.aimNow.dir, 160, (q) => q.glass || q.shootThrough);
        const gg = h && h.solid && h.solid.target && h.solid.target.guard;
        if (gg && gg.name && !gg.dead) return gg.name;
      }
      const td = takedownTarget();
      if (td) return 'F  Take him down' + (knifeOut() ? ' (knife)' : '');
      const tdn = takedownNpc();
      if (tdn && !npcNear()) return 'F  Knock him down';
      const hn = hostageNear();
      if (hn) { const tip = hostageTip(hn); if (tip) return tip; }
      if (cardNear()) return 'E  Take his keycard';
      if (heldNear()) return 'E  Question him   (F  Take him down)';
      { const bn = bodyNear(); if (bn && !rt.disguise && !dropNear()) return 'E  Take his uniform (a disguise)'; }
      const dn = dropNear();
      if (dn) { const tip = dropTip(dn); if (tip) return tip; }
      if (ledgerNear()) return 'E  Take the ledger';
      { const pk = pickupNear(); if (pk) return 'E  Take ' + pk.what; }
      { const cn = cannonNear(); if (cn) return cn.t > 0 ? 'The gun is being loaded (' + Math.ceil(cn.t) + ')' : 'E  Fire the gun (where you are looking)'; }
      if (locketNear()) return 'E  Take the locket';
      const nn = npcNear();
      if (nn) return npcPrompt(nn);
      if (gateNear()) return 'E  Open the gate';
      // any free seat, the nearest; again whenever you like, until the train is taken
      if (level.trainRun && (!level.hijacked || level.hijack.done) && !player.seated && nearestSeat(level.seats, player.pos, level.hijacked ? ['C', 'D'] : null) && player.mode === 'walk') {
        return level.trainRun.state === 'waiting' && level.trainRun.t < TRAIN_RUN.departAt - TRAIN_RUN.sitTo ? 'E  Take your seat and wait for 21:40' : level.hijacked && !level.hijack.skipped ? 'E  Sit down for the rest of the journey' : 'E  Sit down';
      }
      if (player.seated) return 'Seated  -  move to stand up';
      const dk = !terminalNear() && deviceNear();
      if (dk && byCard(dk)) return rt.kitT > 0 && rt.kitDev === dk ? 'Swiping the card...  ' + Math.round(rt.kitT / 2 * 100) + '%' : 'Hold E  Swipe ' + (haveCard.has(dk.net) ? 'the keycard' : 'the Skeleton Card');
      if (dk) return rt.kitT > 0 && rt.kitDev === dk ? 'Hacking ' + deviceName(dk) + '...  ' + Math.round(rt.kitT / HACK.kit * 100) + '%' + (dk.net && trace.level(dk.net) > 0 ? '   (trace ' + Math.round(trace.level(dk.net) * 100) + '%)' : '') : 'Hold E  Hack ' + deviceName(dk) + (gear('hackReach') ? ' (Long-Arm Relay)' : ' (hacking kit)');
      const tn = terminalNear();
      if (tn && tn.net && !tn.done && rt.hackT > 0) return 'Hacking ' + (tn.label || 'the security terminal') + '...  ' + Math.round(rt.hackT / tn.time * 100) + '%' + (trace.level(tn.net) > 0 ? '   (trace ' + Math.round(trace.level(tn.net) * 100) + '%)' : '');
      if (tn) { const tnm = tn.label || 'the security terminal'; return tn.done ? tnm[0].toUpperCase() + tnm.slice(1) + ': done' : rt.hackT > 0 ? (tn.doing || 'Hacking') + ' ' + tnm + '...  ' + Math.round(rt.hackT / tn.time * 100) + '%' : 'Hold E  ' + (tn.verb || 'Hack') + ' ' + tnm; }
      const yn = yellowNear();
      if (yn) return 'E  Talk to ' + (yn.boss ? 'the boss' : 'his bodyguard');
      if (!L0) {
        // at the jeep with things still undone: you may go anyway
        const az = level.apcZone;
        if (az && rt.wentIn && inStreetZone(az, player.pos)) {
          const o = outcome();
          if (!rules.settled(o)) {
            const left = rules.undone(o);
            return (rt.leaveT > 0 ? 'Withdrawing... ' + Math.round(rt.leaveT / LEAVE_HOLD * 100) + '%' : 'Hold E  Withdraw now') + '  (' + left + ')';
          }
        }
        return null;
      }
      if (m.fileDone && near(level.van.pos, level.van.radius)) return 'E  Get in the van';
      if (!m.keycard && near(level.keycard.pos, 1.5)) return 'E  Take the keycard';
      if (!m.fileDone && near(level.terminal.pos, 1.7) && (level.serverDoor.open || level.serverDoor.blown)) return 'Hold E  Download the file';
      const d = doorAhead();
      if (d && d.locked) return d === level.serverDoor
        ? (m.keycard ? 'E  Use the keycard' : 'Locked (reinforced)')
        : 'Locked  -  F  Kick it open';
      return null;
    },

    // one of your rounds: counted for the debrief (a hit is a hit on a person)
    fired(ev) {
      const tg = ev.hit && ev.hit.target, g = tg && tg.guard;
      // (M6.30) a shot gives you away: no one in his uniform fires on his own side (a suppressed round only if it hits someone)
      if (rt.disguise && (!(arsenal.weapon && arsenal.weapon.quiet < 0.5) || g)) dropDisguise('Your shot gave you away - the disguise is no good now.');
      if (tg) tg.lastBy = 'you';
      m.shot(baseId(ev.id), !!(g && g.objective !== false));
      if (g && g.faction === 'yellow') yellowHit(g);
    },

    // gunfire, blasts and blows are heard (a silencer makes a shot quieter)
    hear(ev) {
      if (ev.type === 'shot') {
        noises.push({ pos: ev.from, loud: ev.noise === undefined ? 1 : ev.noise });
        // (M6.54) civilians who hear it get down, and stay down
        if ((ev.noise === undefined ? 1 : ev.noise) > 0.5) for (const n of npcs) if (n.kind === 'civilian' && Math.hypot(n.pos[0] - ev.from[0], n.pos[2] - ev.from[2]) < 30) n.cower = true;
        // a round that just misses a guard: he knows he is being shot at
        const reach = ev.hit && ev.hit.dist ? ev.hit.dist : 80;
        for (const g of guards) {
          if (g.dead || (ev.hit && ev.hit.target === g.target) || neutral(g)) continue;
          const c = g.target.centre, v = [c[0] - ev.from[0], c[1] - ev.from[1], c[2] - ev.from[2]];
          const along = v[0] * ev.dir[0] + v[1] * ev.dir[1] + v[2] * ev.dir[2];
          if (along < 0 || along > reach) continue;
          const off = Math.hypot(v[0] - ev.dir[0] * along, v[1] - ev.dir[1] * along, v[2] - ev.dir[2] * along);
          if (off > 1.4) continue;
          g.awareness = Math.max(g.awareness, 0.85); g.stim = ev.from.slice(); g.since = 0;
          if (g.state !== 'alert') { g.state = 'search'; g.stateT = 0; g.path = null; }
          if ((g.shotAtT || 0) < m.time) { g.shotAtT = m.time + 6; bark(g, lineFor('shotAt'), 'shotAt'); }
        }
      }
      else if (ev.type === 'blast') {
        noises.push({ pos: ev.pos, loud: ev.noise || 1.6 });
        // a flash blinds those who can see it; smoke hangs where it burst
        if (ev.flash) {
          const blind = (ev.blind || 4.5);
          const ctxF = { world: level.world, bark, smokes };
          for (const g of guards) g.flash(ev.pos, ev.radius || 9, blind, ctxF);
        }
        if (ev.smoke) smokes.push({ pos: [ev.pos[0], ev.pos[1] + 1, ev.pos[2]], r: 4.5, until: m.time + ev.smoke });
      }
      else if (ev.type === 'bash') noises.push({ pos: player.pos.slice(), loud: 0.25 });
      else if (ev.type === 'lure') noises.push({ pos: ev.pos.slice(), loud: ev.noise || 1.3 });     // they go and look
    },

    // Round the crosshair: an arc for each guard who is noticing you, on the
    // side he is on, amber filling to red as he makes you out.
    drawDetection() {
      const c = detect, S2 = 140, r = 50;
      c.clearRect(0, 0, S2, S2);
      if (m.done) return;
      const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw);
      for (const g of guards) {
        if (g.dead || g.awareness < 0.04 || g.neutral) continue;
        const dx = g.pos[0] - player.pos[0], dz = g.pos[2] - player.pos[2];
        const rel = Math.atan2(dx * -fz + dz * fx, dx * fx + dz * fz);     // 0 ahead, + to the right
        const a = g.state === 'alert' ? 1 : g.awareness;
        const col = g.state === 'alert' ? '255,48,48' : a >= SENSE.search ? '240,120,40' : '232,180,35';
        c.strokeStyle = 'rgba(' + col + ',' + (0.35 + 0.65 * a) + ')';
        c.lineWidth = 2 + 5 * a;
        c.beginPath();
        c.arc(S2 / 2, S2 / 2, r, rel - Math.PI / 2 - 0.28, rel - Math.PI / 2 + 0.28);
        c.stroke();
      }
    },

    // E: true if the mission took it
    interact() {
      if (!m.done) {
        const hn = hostageNear();
        if (hn && hn.free) { hn.order(); audio.click(); return true; }
        if (hn && hn.state === 'held') return true;            // freeing is a hold: E held, in tick
        { const cn = cardNear(); if (cn) { takeCard(cn); return true; } }
        { const hn = heldNear(); if (hn) { question(hn); return true; } }
        { const bn = !rt.disguise && !dropNear() && bodyNear(); if (bn) { takeUniform(bn); return true; } }
        const dn = dropNear(); if (dn && takeDrop(dn)) return true;
        // the reds' ledger, from the Cash Vault
        if (ledgerNear()) {
          level.ledger.taken = true; m.ledger = true; audio.pickup();
          showHint('The reds\' ledger: who paid them, whom they paid, and where the money went. Ghost will want this.');
          return true;
        }
        if (locketNear()) { takeLocket(); return true; }
        { const cn = cannonNear(); if (cn) { fireCannon(cn); return true; } }
        { const pk = pickupNear(); if (pk) { pk.taken = true; if (pk.ent) pk.ent.enabled = false; audio.pickup(); showHint(pk.name + ' - yours.'); return true; } }
        const nn = npcNear(); if (nn) { talkNpc(nn); return true; }
        { const g = gateNear(); if (g) { gateOpen(g); return true; } }
        const seat = level.trainRun && (!level.hijacked || level.hijack.done) && !player.seated && player.mode === 'walk' ? nearestSeat(level.seats, player.pos, level.hijacked ? ['C', 'D'] : null) : null;
        if (seat) {
          player.sit(seat.pos, seat.back); input.yaw = seat.yaw; input.pitch = -0.05;
          const waits = level.trainRun.sit();                 // still at the platform: the minutes pass
          if (level.hijacked && startSkip()) { rt.satOnce = true; return true; }   // the six down: the journey passes
          if (!rt.satOnce) showHint('You take ' + (seat.where === 'window' ? 'a window seat' : 'an aisle seat') + ' in Coach ' + seat.no + (waits ? ' and watch the platform. It is ' + level.trainRun.clock().slice(0, 5) + '.' : '.'));
          rt.satOnce = true;
          return true;
        }
        if (terminalNear()) return true;                        // held, in tick
        if (deviceNear()) return true;                          // the hacking kit: held, in tick
        const yn = yellowNear(); if (yn) { talkTo(yn); return true; }
      }
      if (!L0) { const az = level.apcZone; return !!(az && rt.wentIn && !m.done && inStreetZone(az, player.pos) && !rules.settled(outcome())); }   // held, in tick
      if (m.done) return true;
      if (m.fileDone && near(level.van.pos, level.van.radius)) { if (m.extract()) rt.finish(); return true; }
      if (!m.keycard && near(level.keycard.pos, 1.5)) { m.takeKeycard(); return true; }
      if (near(level.terminal.pos, 1.7) && (level.serverDoor.open || level.serverDoor.blown)) return true;   // held, not pressed
      const d = doorAhead();
      if (d === level.serverDoor && d.locked) {
        if (m.keycard) { d.unlock(); d.use(player.pos, player.box()); audio.confirm(); audio.door(true); }
        else { audio.deny(); hint('serverNoCard'); }
        return true;
      }
      if (d && d.locked) { audio.deny(); hint('breach'); return true; }
      return false;
    },

    // F at a shut door: a kick. True if there was a door to kick.
    kick() {
      if (m.done) return false;
      // one of the railway's people, knocked down
      const tn = !takedownTarget() && takedownNpc();
      if (tn) {
        tn.down = true; tn.fell = S.time; tn.solid.disabled = true; m.takedowns++;
        if (tn.kind === 'civilian') m.civiliansHit = (m.civiliansHit || 0) + 1;       // (M6.54) the debrief remembers
        S.strike = { kind: knifeOut() ? 'knife' : 'punch', n: ((S.strike && S.strike.n) || 0) + 1, t: 0.55 };
        audio.punch();
        return true;
      }
      // behind a guard who has not seen you (or one who is blinded): a takedown
      const td = takedownTarget();
      if (td) {
        const lethal = knifeOut();
        td.takenDown(lethal);
        m.takedowns++;
        td.target.lastBy = 'you';
        // a Yellow taken down: forgiven if he wakes up; a blade is not forgiven
        if (standing && td.faction === 'yellow') { const was = standing.state; if (standing.takenDown(lethal) === 'hostile' && was !== 'hostile') turnYellows(); }
        S.strike = { kind: lethal ? 'knife' : 'punch', n: ((S.strike && S.strike.n) || 0) + 1, t: 0.55 };
        if (lethal) audio.knife(true); else audio.punch();
        noises.push({ pos: player.pos.slice(), loud: 0.12 });     // a scuffle: heard only right beside you
        return true;
      }
      if (!L0) return false;                     // the hotel's doors: main.js kicks them
      const d = doorAhead();
      if (!d) return false;
      audio.bash();
      player.noise = Math.max(player.noise || 0, 0.8);
      noises.push({ pos: player.pos.slice(), loud: 0.6 });     // a kick is heard
      if (kickOpens(d, Math.random() / ((player.skills && player.skills.breacher) || 1))) {
        d.breachWith(level.swingDoors, player.pos, 'kick');
        audio.door(false);
        S.kickMsg = 0;                           // no stale 'It held' once it gives
        slowmo();
      } else {
        S.kickMsg = 1.2;
        audio.hitHard(1);
      }
      return true;
    },

    // a charge went off: any door close to it is breached
    onBlast(ev) {
      // only a breaching charge takes a door off: smoke, flash and frag do not
      if (!ev.breach || !L0) return;
      let any = false;
      for (const d of level.swingDoors) {
        if (d.blown) continue;
        const c = d.centre;
        if (Math.hypot(c[0] - ev.pos[0], c[1] - ev.pos[1], c[2] - ev.pos[2]) < 2.4) { d.breachWith(level.swingDoors, ev.pos, 'blast'); any = true; }
      }
      if (any && Math.hypot(ev.pos[0] - player.pos[0], ev.pos[2] - player.pos[2]) < 12) slowmo();
    },

    // where the radar's diamond points
    // (M6.49) for the mission map: where each thing still to do is (x, y, z)
    objectivesLeft() {
      if (!level.draft) return [];
      const out = [];
      for (const o of level.objectives || []) {
        const r = draftObjectives().find((q) => q.id === o.id);
        if (!r || r.done || r.failed) continue;
        const t = o.kind === 'hack' ? level.terminals.find((q) => q.id === o.ref) : o.kind === 'take' ? level.pickups.find((q) => q.id === o.ref)
          : (o.kind === 'kill' || o.kind === 'capture') ? guards.find((q) => q.id === o.ref && !q.dead) : o.kind === 'rescue' ? hostages.find((h) => (!o.ref || h.id === o.ref) && h.state !== 'rescued' && h.state !== 'dead')
          : o.kind === 'identify' ? guards.find((q) => (o.refs || []).includes(q.id) && !q.dead && !q.tracked)
          : o.kind === 'reach' ? (level.reach || []).find((q) => q.id === o.ref) : o.kind === 'tail' ? guards.find((q) => q.id === o.ref && !q.dead) : null;
        const p = t && (t.pos || (t.box && [(t.box[0][0] + t.box[1][0]) / 2, t.box[0][1], (t.box[0][2] + t.box[1][2]) / 2]));
        if (p) out.push(p);
      }
      return out;
    },
    objectivePos() {
      if (!L0 && !m.done && rules.settled(outcome()) && level.apcZone) return [level.apcZone.pos[0], level.apcZone.pos[2]];   // the jeep, on the radar (Rhys: the diamond "doesn't align with anything" - it was given x, y, z for x, z)
      // the train: the guard's van, once he has called for help, until he is with you
      if (level.trainRun && !m.done && level.hijacked && level.hijack.called === true && !level.hijack.joined && !level.hijack.done) {
        const tg = npcs.find((n) => n.kind === 'trainguard' && !n.down && !n.gone);
        if (tg) return [tg.pos[0], tg.pos[2]];
      }
      if (rt.toldWhere && rt.toldWhere.until > S.time && !m.done) return [rt.toldWhere.pos[0], rt.toldWhere.pos[2]];
      if (m.done || !L0) return null;
      if (m.fileDone) return [level.van.pos[0], level.van.pos[2]];
      return [level.terminal.pos[0], level.terminal.pos[2]];
    },

    objectives() { return level.draft ? draftObjectives() : null; },      // (M6.75) as they stand, for the tests
    finish() { rt.debrief(); },
    // the hotel ends at the jeep, however it went: graded, and remembered
    endHotel(o) {
      if (m.done) return;
      const r = rules.grade(o);
      m.done = true; m.result = r; rt.outcome = o;
      if (r === 'failed') m.failure = B ? (B.retreated ? 'You withdrew before it was decided' : 'The battle was lost') : 'Withdrew with nothing achieved';
      m.events.push({ type: 'complete' });
      if (ctx.recordOutcome) ctx.recordOutcome(o, r);
      rt.debrief();
    },
    // you down, in a battle: back in at your side's end a moment later, if your side has a man
    // left in reserve to send (true: handled - not the end of it)
    youDown() {
      if (!B || m.done) return false;
      B.youDown++; B.down(B.you, otherSide(B.you));
      rt.backT = BATTLE.youBack;
      later.push({ t: BATTLE.youBack, fn: () => {
        if (m.done) return;
        if (!B.send(B.you)) { B.youOut = true; rt.endHotel(outcome()); return; }
        const spots = level.battle.spots[B.you], p = spots[Math.floor(Math.random() * spots.length)];
        level.world.spawn = { pos: p.slice(), yaw: level.world.spawn.yaw };
        if (ctx.respawnYou) ctx.respawnYou();
        rt.backT = 0;
      } });
      return true;
    },
    // death, or anything else that ends it badly
    fail(why) { if (m.fail(why)) rt.debrief(); },

    // The debrief: how it went, what you did, what you earned (Rhys, M6.4.1:
    // success or failure, objectives, trophies; battle maps later add K/D).
    debrief() {
      const ok = m.result === 'success';
      // (Rhys: the train makes you wait for its events - "no accolade for quick completion"; none yet)
      const all = L0 ? m.trophies() : B ? [] : level.trainRun ? [] : level.draft ? clearTrophies(m, targets, level.draft, level.title, level.spec.place || 'the ' + level.title, 'enemy') : level.factory ? factoryTrophies(m, guards) : level.casino ? casinoTrophies(m, targets) : hotelTrophies(m, hostages, guards.length);
      if (devices.length && level.draft) all.push(...hackTrophies(m, level.draft, level.title));
      // (M6.33) the end of the case: Kaldberg done
      if (level.draft === FINAL && (m.result === 'success' || m.result === 'partial')) all.push({ id: 'case_closed', name: 'Case Closed', about: 'From the first clue to the council at Kaldberg: the reds\' council, on tape.' });
      if (level.draft === FINAL && m.result === 'success' && guards.some((g) => g.tied)) all.push({ id: 'kaldberg_rope', name: 'Tied Up Loose Ends', about: 'At Kaldberg, a man held up, questioned - and tied.' });
      // (M6.60) a first draft's papers, every one of them read; and the Codex home
      if (level.draft && level.intel && level.intel.length && level.intel.every((q) => q.found) && m.result !== 'failed') all.push({ id: level.draft + '_papers', name: 'Read Everything: ' + level.title, about: 'Every paper at ' + (level.spec.place || level.title) + ' read.' });
      if (level.draft === 'villa' && m.result === 'success') all.push({ id: 'codex_returned', name: 'Returned', about: 'The bill of sale and the catalogue out of the Villa Merrow: the Codex goes home.' });
      // (M6.72) every paper in every first draft read, and filed (saves.js loadPapers)
      if (level.draft && level.intel && level.intel.length) {
        const pp = Saves.loadPapers(Saves.currentSlot());
        if (DRAFTS.every((d) => !(d.intel || []).length || d.intel.every((q) => (pp[d.id] || []).includes(q.id)))) all.push({ id: 'archivist', name: 'The Archivist', about: 'Every paper in every mission read - the whole file, on the case board.' });
      }
      // (M6.73) the forgers' papers worth nothing: the Holm Bridge
      if (level.draft === 'holm' && m.result === 'success') all.push({ id: 'papers_void', name: 'Not Valid', about: 'The register, the passes and the agent\'s car: the reds\' papers are worth nothing now.' });
      // (M6.74) the passes home: Varnholm Town Hall
      if (level.draft === 'townhall' && m.result === 'success') all.push({ id: 'passes_home', name: 'Returned to Owner', about: 'The ledger out, and the confiscated passes with it: back to the people they were taken from.' });
      // (M6.76) the lights on, and the gold home
      if (level.draft === 'power' && m.result === 'success') all.push({ id: 'lights_on', name: 'Lights On', about: 'Holm Power Station\'s grid locked out: Varnholm does not go dark.' });
      if (level.draft === 'docks' && m.result === 'success') all.push({ id: 'gold_home', name: 'The Gold Stays', about: 'Both lorries stopped in the docks yard: the Exchange\'s reserve goes home.' });
      // (M6.77) the handler, alive
      if (level.draft === 'varna' && m.result === 'success') all.push({ id: 'handler_taken', name: 'Taken Alive', about: 'The handler, tied up aboard the Varna Star, and his forty names with him.' });
      // (M6.78) five faces on the file
      if (level.draft === 'lodge' && m.result === 'success') all.push({ id: 'five_faces', name: 'Five Faces', about: 'All five of the reds\' chiefs marked at Ravensholt Lodge, and their names with them.' });
      // (M6.79) the names on the air
      if (level.draft === 'mast' && m.result === 'success') all.push({ id: 'on_air', name: 'On the Air', about: 'The tape patched in on Hesk Hill, and the transmitter hall held for all ninety seconds.' });
      // (M6.80) the edition out
      if (level.draft === 'gazette' && m.result === 'success' && hostages.every((h) => h.state === 'rescued')) all.push({ id: 'stop_press', name: 'Stop Press', about: 'The Courier\'s special edition printed with the press hall held, and every one of the staff brought out.' });
      // (M6.81) the last two
      if (level.draft === 'airfield' && m.result === 'success') all.push({ id: 'grounded', name: 'Grounded', about: 'The jet held on the apron at Kessin, and the chief from Kessin taken alive.' });
      // (M6.83) the whole file: the case closed and every trail stamped, with this mission
      if (level.draft && m.result === 'success') { const hv = Saves.loadCase(Saves.currentSlot()); if (hv.includes(CLOSED) && TRAILS.every((t) => trailDone(t, hv))) all.push({ id: 'file_closed', name: 'Varnholm: File Closed', about: 'The case closed and every story trail stamped on the case board.' }); }
      // (M6.84) over the pass, and nobody rang
      if (level.draft === 'pass' && m.result === 'success' && !rt.sirenRung) all.push({ id: 'over_quiet', name: 'Over the Wall', about: 'Through the Vashka Pass with the register, and the frontier never rang its alarm.' });
      // (M6.85) the council, adjourned for good
      if (level.draft === 'council' && m.result === 'success') all.push({ id: 'adjourned', name: 'Meeting Adjourned', about: 'The council of the north marked, its chairman taken alive, its minutes taken.' });
      // (M6.88) the camps
      if (level.draft === 'arnbridge' && m.result === 'success' && guards.filter((g) => g.side === 'ally').every((g) => !g.dead)) all.push({ id: 'all_three', name: 'All Three Home', about: 'The Arn bridge held, and Hale and Moss on the last lorry with you.' });
      if (level.draft === 'camp' && m.result === 'success') all.push({ id: 'ostrava', name: 'Nine Hundred Names', about: 'The four out of Camp Ostrava, and its register with them.' });
      // (M6.89) the relays, in time
      if (level.draft === 'relays' && m.result === 'success' && rt.quick && rt.quick.o4 === 'done') all.push({ id: 'six_minutes', name: 'Six Minutes', about: 'All three relays on the Kessock ridge cut before the raids went in.' });
      // (M6.91) the light out
      if (level.draft === 'light' && m.result === 'success') all.push({ id: 'lights_out', name: 'Lights Out', about: 'The Skarra light put out from the top of its tower, and the supply ship turned for home.' });
      // (M6.92) three faces at the ball
      if (level.draft === 'ball' && m.result === 'success' && !rt.disguiseBlown) all.push({ id: 'last_dance', name: 'The Last Dance', about: 'All three marked at the Winter Ball, and nobody saw through the uniform.' });
      // (M6.95) the money stopped
      if (level.draft === 'counting' && m.result === 'success') all.push({ id: 'paid_off', name: 'Accounts Closed', about: 'The receipts out of Lund & Harl\'s strongroom, and the paymaster taken alive.' });
      // (M6.96) neither boat out
      if (level.draft === 'harbour' && m.result === 'success') all.push({ id: 'harbour_shut', name: 'Harbour Closed', about: 'Neither of the agents\' boats out of Kessin harbour, and their cash book taken.' });
      // (M6.97) the guns silent
      if (level.draft === 'battery' && m.result === 'success') all.push({ id: 'guns_silent', name: 'Silent Guns', about: 'The Kessin battery locked out and its bunker held while Ghost\'s boats came and went.' });
      // (M6.98) Hollis
      if (level.draft === 'cottage' && m.result === 'success') all.push({ id: 'hollis_taken', name: 'One of Our Own', about: 'Hollis taken alive in his attic, before the date went out.' });
      // (M6.99) the wrong bridge, cleared - and all four of you home
      if (level.draft === 'wrongbridge' && m.result === 'success' && guards.filter((g) => g.side === 'ally').every((g) => !g.dead)) all.push({ id: 'four_home', name: 'All Four Home', about: 'The wrong bridge cleared with Hale, Moss and Venn, and none of them lost.' });
      // (M6.101) the colonel, bagged
      if (level.draft === 'hunt' && m.result === 'success') all.push({ id: 'colonel_bagged', name: 'Bagged', about: 'Colonel Strand taken alive on his own Sunday shoot, and his map case with him.' });
      // (M6.102) the spring stood down
      if (level.draft === 'northhq' && m.result === 'success') all.push({ id: 'spring_off', name: 'The Spring Called Off', about: 'Three staff officers marked, and the north\'s spring plan stood down in its own colonel\'s name.' });
      // (M6.103) the border run, in time
      if (level.draft === 'borderrun' && m.result === 'success' && rt.quick && rt.quick.o2 === 'done') all.push({ id: 'border_run', name: 'Foot Down', about: 'Down the Vashka valley road and over the frontier inside three minutes.' });
      // (M6.104) through the mirrors
      if (level.draft === 'funfair' && m.result === 'success' && !rt.disguiseBlown) all.push({ id: 'mirrors', name: 'Smoke and Mirrors', about: 'Through the Hall of Mirrors to the message, the contact marked, and the uniform never doubted.' });
      // (M6.105) Dr Sauer home
      if (level.draft === 'observatory' && m.result === 'success') all.push({ id: 'stargazer', name: 'Back to the Stars', about: 'Dr Sauer brought down from Kessock Peak, and six months of the reds\' traffic with her.' });
      if (level.draft === 'cathedral' && m.result === 'success') all.push({ id: 'rungout', name: 'Rung Out', about: 'The Sexton down his own tower, and every courier in Varnholm named.' });
      if (level.draft === 'monastery' && m.result === 'success') all.push({ id: 'sanctuary', name: 'Sanctuary', about: 'Brannoc out of Kelder Abbey, and the raid none the wiser.' });
      if (level.draft === 'express' && m.result === 'success') all.push({ id: 'facesoff', name: 'No Faces', about: 'The identifier off the night express, and every saint\'s face in his album with him.' });
      // (M6.66) the river open: Varnholm Lock
      if (level.draft === 'lock' && m.result === 'success') all.push({ id: 'river_open', name: 'River Open', about: 'The stand-down sent and the lock opened: Ghost\'s boats through to the sea.' });
      // (M6.44) the blight's end: the Dalmar Star
      if (level.draft === 'dalmar' && m.result === 'success') all.push({ id: 'blight_ended', name: 'Harvest Saved', about: 'The blight off the Dalmar Star, and the radio log in Ghost\'s hands.' });
      // (M6.30) in a mission begun in disguise, the whole of it without anyone seeing through it
      // (M6.87) a first draft with an alarm, done and never rung
      if (level.draft && m.result === 'success' && !rt.sirenRung && devices.some((d) => d.kind === 'alarm')) all.push({ id: level.draft + '_never_rang', name: 'Never Rang: ' + level.title, about: 'Done at ' + (level.spec.place || level.title) + ' without the alarm ever sounding.' });
      if (level.spec && level.spec.startDisguise && !rt.disguiseBlown && (m.result === 'success' || m.result === 'partial')) all.push({ id: level.draft + '_plain_sight', name: 'In Plain Sight: ' + level.title, about: 'Done in disguise, from the door and back - no one saw through it.' });
      // (Level 35) LANTERN turned round: no trace finds Yard 7 again, this run
      if (level.draft === 'listening' && m.result !== 'failed' && (level.terminals || []).some((q) => q.id === 'mainframe' && q.done)) downLantern(Saves.currentSlot());
      const fresh = Trophies.earn(all);
      const isNew = new Set(fresh.map((x) => x.id));
      // the enemy's weapons you took and brought out (not when it failed): yours from now on, at Logistics
      const taken = [...(m.taken || [])].map(baseId).filter((id) => ITEMS[id] && ITEMS[id].sheet);
      const homeNew = m.result === 'failed' ? [] : Saves.addArmoury(Saves.currentSlot(), taken);
      // and the weapon this mission gives for completing it (sim/play/rewards.js), the first time
      const key = L0 ? 'mission0' : level.draft ? level.draft : level.factory ? 'factory' : level.casino ? 'casino' : level.trainRun ? 'train' : 'hotel';
      const prize = rewardFor(key, m.result, B && B.retreated);
      const earned = prize && ITEMS[prize] ? Saves.addArmoury(Saves.currentSlot(), [prize]) : [];
      const t = Math.floor(m.time), mm = Math.floor(t / 60), ss = String(t % 60).padStart(2, '0');
      const tick = (b) => b ? '<b class="ok">&#10003;</b>' : '<b class="no">&#10007;</b>';
      const row = (k, v) => '<div>' + k + ' <b>' + v + '</b></div>';
      // (M6.90) a grade for a first draft: done (3, in part 1), every optional one too (+2), no alarm (+1, where there
      // is one), no one killed (+1), every paper read (+1). S 7 and over, A 5 - 6, B 3 - 4, C below
      let grade = null;
      if (level.draft && !B && m.result !== 'failed') {
        const os = draftObjectives(), opt = os.filter((o) => o.optional);
        let pts = m.result === 'success' ? 3 : 1;
        if (opt.length && opt.every((o) => o.done)) pts += 2;
        if (devices.some((d) => d.kind === 'alarm') ? !rt.sirenRung : true) pts += 1;
        if (!m.kills) pts += 1;
        if (level.intel && level.intel.length && level.intel.every((q) => q.found)) pts += 1;
        grade = pts >= 7 ? 'S' : pts >= 5 ? 'A' : pts >= 3 ? 'B' : 'C';
        if (!rt.graded) { rt.graded = true; Saves.markGrade(Saves.currentSlot(), level.draft, grade); }
      }
      const fav = m.favourite, favName = fav === 'hands' ? 'Bare hands' : fav === 'knife' ? 'Knife (takedowns)' : (ITEMS[fav] && ITEMS[fav].name) || '\u2014';
      // (M6.28) onto the run's service record (the Trophies page shows it)
      if (!rt.recorded) {
        rt.recorded = true;
        Saves.addRecord(Saves.currentSlot(), B ? { battles: 1, battlesWon: ok ? 1 : 0, battleKills: m.kills, kills: m.kills, knockouts: m.knockouts, deaths: B.youDown || 0, shotsFired: m.shotsFired, shotsHit: m.shotsHit, headshots: m.headshots, secs: m.time, fav: fav && fav !== 'hands' ? fav : null }
          : { missions: 1, won: ok ? 1 : 0, partial: m.result === 'partial' ? 1 : 0, failed: m.result === 'failed' ? 1 : 0, kills: m.kills, knockouts: m.knockouts, takedowns: m.takedowns, shotsFired: m.shotsFired, shotsHit: m.shotsHit, headshots: m.headshots, spotted: m.spotted, secs: m.time, hacked: m.hacked || 0, traced: m.traced ? 1 : 0, rescued: hostages.length ? rescued() : 0, fav: fav && fav !== 'hands' ? fav : null });
        // (M6.29) experience, for the skills tree
        let done = 0;
        try { done = L0 ? (m.fileDone ? 1 : 0) + (ok ? 1 : 0) : rules.lines(rt.outcome || outcome()).filter((l) => l.ok && !l.neutral).length; } catch (e) { done = 0; }
        const before = pointsAt(Saves.loadSkills(Saves.currentSlot()).xp);
        rt.xpGained = xpFor({ battle: !!B, won: ok, result: m.result, objectives: done, trophies: fresh.length });
        const after = pointsAt(Saves.addXp(Saves.currentSlot(), rt.xpGained).xp);
        rt.newPoints = after - before;
        // (M6.31) the case: what this mission turned up, brought home
        if (level.draft && m.result !== 'failed') {
          const done = (level.terminals || []).filter((q) => q.done).map((q) => q.id).concat((level.pickups || []).filter((q) => q.taken).map((q) => q.id));
          const was = caseOpen(Saves.loadCase(Saves.currentSlot()));
          rt.newClues = Saves.addCase(Saves.currentSlot(), cluesFrom(level.draft, done));
          rt.caseMade = !was && caseOpen(Saves.loadCase(Saves.currentSlot()));
          // (M6.40) the last of it: the case closed
          if (level.draft === FINAL && m.result === 'success') Saves.addCase(Saves.currentSlot(), [CLOSED]);
          // (M6.45) the blight's trail, a step at a time
          if (trailSteps(level.draft).length) Saves.addCase(Saves.currentSlot(), trailSteps(level.draft));      // (M6.54) every trail it is a step of
        }
        // (M6.48) the mission list's tick: this draft's best result
        if (level.draft) Saves.markDone(Saves.currentSlot(), level.draft, m.result);
        // (M6.41) the contracts board: any open one this mission pays
        if (level.draft) {
          const cst = Saves.loadContracts(Saves.currentSlot());
          if (cst && cst.levels) {
            const out = settleContracts(cst, cst.levels, level.draft, m.result, m);
            out.state.levels = cst.levels; Saves.saveContracts(Saves.currentSlot(), out.state);
            rt.contractsPaid = out.paid;
            const xp = out.paid.reduce((a, c) => a + c.xp, 0);
            if (xp) { const b4 = pointsAt(Saves.loadSkills(Saves.currentSlot()).xp); rt.newPoints = (rt.newPoints || 0) + pointsAt(Saves.addXp(Saves.currentSlot(), xp).xp) - b4; rt.xpGained = (rt.xpGained || 0) + xp; }
          }
        }
      }
      $('mend-title').textContent = 'DEBRIEF';
      { const w = document.querySelector('#mend .brief-where'); if (w) w.innerHTML = L0 ? 'Level 0 &middot; Training Mission' : level.draft ? 'Level ' + level.spec.no + ' &middot; ' + level.title + ' (first draft)' : level.factory ? 'Level 2 &middot; Derelict Factory' : level.casino ? 'Level 3 &middot; Casino' : level.trainRun ? 'Level 4 &middot; The Night Train' : 'Level 1 &middot; Riverside Hotel'; }   // (the train's said the hotel)   // (it said Level 0 at the hotel)
      if (B) $('mend-result').innerHTML = B.retreated ? '<span class="part">WITHDREW</span> &mdash; a battle you leave is neither won nor lost'
        : ok ? '<span class="ok">BATTLE WON</span>' : m.result === 'partial' ? '<span class="part">BATTLE DRAWN</span>' : '<span class="no">BATTLE LOST</span> &mdash; ' + (m.failure || '');
      else $('mend-result').innerHTML = ok ? '<span class="ok">MISSION SUCCESSFUL</span>'
        : m.result === 'partial' ? '<span class="part">MISSION COMPLETE</span> &mdash; not everything went to plan'
        : '<span class="no">MISSION FAILED</span> &mdash; ' + (m.failure || '');
      $('mend-objectives').innerHTML = L0
        ? '<div>' + tick(m.fileDone) + ' Retrieve the file from the private-network computer</div>' +
          '<div>' + tick(ok) + ' Get back to the van</div>'
        // each hostage by name, and the captain: what became of them
        : rules.lines(rt.outcome || outcome()).map((l) => '<div>' + (l.neutral ? '<span style="color:#9aa">\u2013</span>' : tick(l.ok)) + ' ' + l.text + '</div>').join('');
      // (M6.33) a mission that ends a story says how it ended
      const epi = level.spec && level.spec.epilogue && m.result !== 'failed' ? level.spec.epilogue[m.result === 'success' ? 'success' : 'partial'] : null;
      $('mend-stats').innerHTML =
        (epi ? '<div style="font-style:italic;line-height:1.5;margin:0 0 10px;color:#e8d9a8">' + epi + '</div>' : '') +
        row('Time', mm + ':' + ss) +
        ((settings && settings.difficulty && settings.difficulty !== 'operative') ? row('Difficulty', diff().name) : '') +
        row('Enemy casualties', m.kills) +
        (B ? row('K/D', m.kills + ' / ' + (B.youDown || 0) + (B.youDown ? ' (' + (m.kills / B.youDown).toFixed(2) + ')' : '')) : '') +
        row('Knocked out', m.knockouts) +
        row('Takedowns', m.takedowns) +
        (m.civiliansHit ? row('Civilians knocked down', '<span class="no">' + m.civiliansHit + '</span>') : '') +
        row('Times spotted', m.spotted) +
        row('Accuracy', m.shotsFired ? Math.round(m.accuracy * 100) + '% (' + m.shotsHit + ' of ' + m.shotsFired + ' rounds)' : 'no shots fired') +
        (m.kills ? row('Headshots', m.headshots + ' of ' + m.kills) : '') +
        row('Favourite weapon', favName) +
        row('Doors breached', m.breaches) +
        (rt.newClues && rt.newClues.length ? row('The case', rt.newClues.map((id) => (CASE.find((c) => c.id === id) || {}).title).join(', ') + ' &mdash; on the board at Ghost HQ' + (rt.caseMade ? '. <b>Ghost knows where the council meets: Kaldberg.</b>' : '')) : '') +
        (rt.contractsPaid && rt.contractsPaid.length ? row('Contract' + (rt.contractsPaid.length > 1 ? 's' : ''), rt.contractsPaid.map((c) => CONTRACT_TERMS[c.term].name + ' (' + contractText(c) + ') +' + c.xp).join('; ')) : '') +
        (grade ? row('Grade', '<span style="font-size:20px;letter-spacing:2px">' + grade + '</span> <span style="opacity:0.7;font-weight:normal">(done, the optional ones, no alarm, no one killed, every paper)</span>') : '') +
        (rt.xpGained ? row('Experience', '+' + rt.xpGained + (rt.newPoints ? ' &mdash; ' + (rt.newPoints === 1 ? 'a skill point' : rt.newPoints + ' skill points') + ' to spend at Ghost HQ' : '')) : '') +
        (devices.length ? row('Security hacked', (m.hacked || 0) + (m.hacked === 1 ? ' time' : ' times') + (m.traced ? ' &mdash; <span class="no">traced</span>: they know where Yard 7 is' : m.hacked ? ' &mdash; never traced' : '')) : '') +
        (m.turretKills ? row('Downed by their own turrets', m.turretKills) : '') +
        (earned.length ? row('Weapon earned', ITEMS[earned[0]].name + ' &mdash; at Logistics in Ghost HQ') : '') +
        (homeNew.length ? row('Weapons captured', homeNew.map((id) => ITEMS[id].name).join(', ') + ' &mdash; at Logistics in Ghost HQ') : '') +
        (taken.length && m.result === 'failed' ? row('Weapons captured', 'none brought home') : '') +
        (hostages.length ? row('Hostages rescued', rescued() + ' of ' + hostages.length) : '') +
        // (M6.80) the story trails this mission is a step of: how far along each is, stamped when it is all done
        (level.draft ? TRAILS.filter((t) => t.steps.some((b) => b.level === level.draft)).map((t) => {
          const have = Saves.loadCase(Saves.currentSlot()), n = t.steps.filter((b) => have.includes(trailMark(t, b.level))).length;
          return row(t.title.charAt(0) + t.title.slice(1).toLowerCase(), trailDone(t, have) ? '<b style="color:' + t.colour + '">' + t.stamp + '</b> &mdash; all ' + t.steps.length + ' done' : n + ' of ' + t.steps.length + ' on the case board');
        }).join('') : '') +
        (level.intel && level.intel.length ? row('Intel found', level.intel.filter((q) => q.found).length + ' of ' + level.intel.length) : '') +
        // (Rhys: he could not find them all) where the rest were -
        // (Rhys: players should find them for themselves) a testing
        // aid only: shown with "Show frame rate & position" on
        (settings && settings.showFps && level.intel && level.intel.some((q) => !q.found) ? '<div style="font-size:12px;opacity:0.7;margin-top:4px">Intel missed: ' + level.intel.filter((q) => !q.found).map((q) => q.room.replace(/\s*\(.*\)/, '').replace('Dining Table', 'the penthouse')).join(', ') + '</div>' : '');
      $('mend-trophies').innerHTML = all.map((x) =>
        '<div class="trophy' + (isNew.has(x.id) ? '' : ' accolade') + '"><span>' + (isNew.has(x.id) ? 'TROPHY EARNED' : 'ACCOLADE') + '</span><b>' + x.name + '</b><i>' + x.about + '</i></div>').join('');
      // (Rhys) trophies and accolades on a page 2, a button away
      const label = awardsButton(all, isNew), pager = $('mend-page');
      const page = (n) => {
        $('mend-p1').style.display = n === 1 ? '' : 'none';
        $('mend-p2').style.display = n === 2 ? '' : 'none';
        pager.textContent = n === 1 ? label : '\u2039  Back to the debrief';
        pager.onclick = () => page(n === 1 ? 2 : 1);
      };
      pager.style.display = label ? 'block' : 'none';
      page(1);
      $('mend-again').textContent = ok ? 'Play again' : 'Restart the mission';
      // (M6.46) failed, with something done: try again from there
      { const cd = level.draft && m.result === 'failed' ? cpDone() : null, b = $('mend-cp');
        if (b) {
          b.style.display = cd && (cd.terminals.length || cd.pickups.length) ? 'block' : 'none';
          b.onclick = () => { try { sessionStorage.setItem(CP_KEY, JSON.stringify(Object.assign({ level: level.draft, at: Date.now() }, cd))); } catch (e) { /* private window */ } location.reload(); };
        } }
      if (fresh.length) audio.stepDone();
      if (ok) voices.radio('done', control);
      ctx.endMission();
    },
  };
  // (M6.30) a mission that starts you in their uniform (spec.startDisguise)
  if (level.spec && level.spec.startDisguise) { rt.disguise = level.spec.startDisguise; later.push({ t: 0.5, fn: () => disguiseTag() }); }
  return rt;
}
