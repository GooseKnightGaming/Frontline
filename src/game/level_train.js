// FRONTLINE - Level 4, the Night Train (M6.18.0, Rhys: "An intercity train that has
// underground sections. It travels between two fictional cities in a fictional
// country 'somewhere near the former USSR'... You're off duty, enjoying yourself...
// [it] definitely starts with you arriving at the station, finding the platform,
// and boarding the train.")
//
// Severia: its capital Novomir, and Belyagorsk, a day's ride east. You are off duty
// and unarmed, on the 21:40 Novomir - Belyagorsk intercity, service 207.
//
// What goes wrong (a hijack; someone important aboard; the train to be taken back,
// the passengers kept safe) comes next. This first part is the station, the train
// and the journey: arrive at Novomir Central, find your platform on the departures
// board, board, and the train leaves - through the city's tunnels and out across the
// country in the dark.
//
// The train never moves. The world does: the station (a mover, sliding back as the
// train pulls out), and the track, tunnels and country streaming past in tiles
// (movers too, recycled). Inside, everything is still, so walking, shooting and the
// guards work as anywhere else. Night hides that the moving world carries no light
// of its own beyond its lamps.
//
// Axes: the track runs along x, the train's front towards +x; Platform 3 (ours) is
// on its +z side. Track coordinate s: where along the line; the train's run is
// level.trainRun.dist metres from the station.

import { World } from '../sim/world.js';
import { SwingDoor } from '../sim/doors.js';
import { Guard } from '../sim/guard.js';
import { quadsBox } from '../sim/curves.js';
import { CANON, PROVISIONAL } from './severian.js';

export const TRAIN_TIME = { date: [3, 11, 2026], hour: 21, minute: 36 };
export const FLOOR = 1.0;                  // the carriages' floor, level with the platforms
export const CAR = { half: 1.45, wall: 0.08, ceil: 3.25, roof: 3.5, gap: 1.6 };
export const WIN = { sill: 1.85, head: 2.75 };
// the carriages, back to front (x grows towards the locomotive)
export const CARS = [
  { id: 'van', name: 'Guard\'s van', len: 18 },
  // (M6.18.1) numbered, as Severian coaches are: 1 at the front
  { id: 'D', no: '4', name: 'Coach 4 - standard', len: 24 },
  { id: 'C', no: '3', name: 'Coach 3 - standard', len: 24 },
  { id: 'B', no: '2', name: 'Coach 2 - buffet', len: 24 },
  { id: 'A', no: '1', name: 'Coach 1 - first class', len: 24 },
  { id: 'loco', name: 'Locomotive', len: 18 },
];
export const TRAIN_X0 = -34;
// what the railway's people say (recorded: src/game/spoken.js). (M6.18.3, Rhys: "they should have some sort of
// accent") their English is a Severian's - spoken from a Cyrillic spelling of how they say it (STAFF_SAY);
// the announcement in Severian first, then in English (Rhys's own words for it, until his Severian comes)
// (M6.18.3) the departures board (a dot-matrix: textures.js makeMatrixSign): the clock and the next
// four trains, the 21:40 marked boarding, then departing; `en` its English page
export const DEPARTURES = [
  { t: 21 * 60 + 40, sev: 'БЕЛЯГОРСК', en: 'Belyagorsk', p: '3', you: true },
  // (M6.20.14) Rhys's names
  { t: 21 * 60 + 52, sev: CANON.kirova.toUpperCase(), en: 'Kirova', p: '4' },
  { t: 22 * 60 + 10, sev: CANON.portOstrel.toUpperCase(), en: 'Port Ȍstrel', p: '1' },
  { t: 22 * 60 + 31, sev: CANON.northQuay.toUpperCase(), en: 'North Quay', p: '4' },
  { t: 23 * 60 + 5, sev: CANON.kirova.toUpperCase(), en: 'Kirova', p: '4' },
];
export function departures(run, en) {
  const c = run.clock(), now = TRAIN_TIME.hour * 60 + TRAIN_TIME.minute + run.t / 60;
  const hm = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.floor(m % 60)).padStart(2, '0');
  // (M6.20.12, Rhys's Severian) лажах, departures; остаъви, leaving; Пл., platform
  const rows = [[en ? 'DEPARTURES' : CANON.departures.toUpperCase(), c.slice(0, 5)]];
  for (const d of DEPARTURES.filter((q) => q.t >= Math.floor(now) || (q.you && run.state === 'waiting')).slice(0, 4)) {
    // (M6.18.11, Rhys: the board's letters overhanging it) every row within the lamps: "LEAVING", "Pl."
    const due = d.you && (run.state !== 'waiting' || now >= d.t - RUN.warn / 60) ? (en ? ' LEAVING' : ' ' + CANON.leaving.toUpperCase()) : '';
    rows.push([hm(d.t) + '  ' + (en ? d.en : d.sev) + due, (en ? 'Pl. ' : CANON.platformShort + ' ') + d.p]);
  }
  return rows;
}
// (M6.18.5) the free seat nearest you in the coach you are in; a tie (within 5 cm) goes to the port
// side (Rhys: "if equidistant, port-side takes priority over starboard"): port is the left going forward, -z
// (M6.18.6, Rhys: E "triggers throughout Coaches 3 and 4, meaning you can't open the doors" - only
// in Coach 3, AND in the seating, not by the doors): between its vestibules
export function inSaloon(pos, id) {
  const c = carriages().find((q) => q.id === id);
  return !!c && inTrain(pos) && pos[0] > c.x0 + 2.3 && pos[0] < c.x1 - 2.3;
}
// (M6.18.10: the six down, any coach's seats - 'C' and 'D' - for the rest of the journey)
export function nearestSeat(seats, pos, coaches) {
  let best = null, bd = Infinity;
  const at = (coaches || ['C']).find((c) => inSaloon(pos, c));
  if (!at) return null;
  for (const s of seats || []) {
    if (s.taken || s.coach !== at) continue;
    const d = Math.hypot(s.pos[0] - pos[0], s.pos[2] - pos[2]);
    const take = !best || d < bd - 0.05 || (Math.abs(d - bd) <= 0.05 && (s.side === 'port' && best.side !== 'port' || (s.side === best.side && d < bd)));
    if (take) { best = s; bd = d; }
  }
  return best;
}
// (M6.18.7, Rhys: "the hijack should happen just at the end of the tunnel - about 2 mins into the
// journey"; "6 hijackers"; the Minister dead is a partial result that changes what comes next)
export const HIJACK = { at: 2100, fuse: 15, total: 6,
  // (M6.18.10, Rhys: "something should happen that *causes* you to want to head to the Guard's Van first")
  // the guard on the tannoy this long after the Front's - cut off; and (the six down) this long before the
  // rest of the journey passes without you having to sit down for it
  call: 18, rest: 45 };
// (M6.18.8, Rhys: the guard "should say ... help me take the train back safely", then - seeing you unarmed -
// his sidearm; and he fights beside you. The Minister talks; the buffet has its steward)
export const HIJACK_TALK = {
 "guardPA": "Ladies and gentlemen, this is your guard speaking. This train is now under the control of the Front of Memory. Please comply with their instructions. Nobody needs to be a hero tonight - stay in your seats, and we will all get back in one piece. Would Inspector Pesak please come to the guard's van. Inspector Pesak to the guard's van. Thank you.",
 "hijack": "Attention, passengers. This train is now in the hands of the Front of Memory. Stay in your seats, and no one will be hurt. Minister Dravets - you will not be opening any hospital tomorrow.",
 "guardAsk": "Who are you? Stay back. I am the guard - and they took the train from under me.",
 "guardTrust": "Thank you. I can see you are on our side. Help me take this train back - safely.",
 "guardGive": "You have no weapon? Here - my sidearm. Take it. I have the rifle from the van's locker.",
 "guardJoin": "You are armed already. Good - I will take the rifle from the locker. Lead on.",
 "guardWith": "I am with you. Go on.",
 "minPre": "Good evening. Going all the way to Belyagorsk? So am I - there is a hospital to open.",
 "minHeld": "Please - do as they say. Nobody needs to die tonight.",
 "minSaved": "You saved my life. Whoever you are, Belyagorsk will not forget it.",
 "stewHello": "Good evening. Tea, coffee, something to eat?",
 "stewTea": "One tea. The sugar is on the side.",
 "stewSandwich": "Cheese and pickle - the last one.",
 "stewHide": "Not now - get down!",
 "stewSandwichOne": "Cheese and pickle. Enjoy.",
 "stewSoldOut": "Sorry - that was the last sandwich."
};
export const HIJACK_VOICE = {"guardPA": ["gpa"], "hijack": ["fm1"], "guardAsk": ["st4"], "guardTrust": ["st4"], "guardGive": ["st4"], "guardJoin": ["st4"], "guardWith": ["st4"], "minPre": ["st5"], "minHeld": ["st5"], "minSaved": ["st5"], "stewHello": ["st6"], "stewTea": ["st6"], "stewSandwich": ["st6"], "stewHide": ["st6"], "stewSandwichOne": ["st6"], "stewSoldOut": ["st6"]};
export const STAFF_TALK = {
  tickets: 'Tickets, please.',
  checked: 'The 21:40 to Belyagorsk. Coach 3. Have a good journey.',
  after: 'Platform 3, straight through. She leaves at 21:40.',
  // (M6.20.12) Rhys's Severian for it (severian.js), then the English
  depart: CANON.departing + '. ' + CANON.standClear + '. — The 21:40 to Belyagorsk is about to depart. Please stand clear of the doors.',
  // (M6.18.2) at the wrong gate: sent on to Platform 3
  wrong1: 'This is Platform 1, for Port Ostrel. Belyagorsk is Platform 3.',
  wrong2: 'Platform 2 is closed tonight. You want Platform 3.',
  wrong4: 'This is Platform 4, for Kirova. Belyagorsk is Platform 3.',
  // (M6.18.2) one of them knocked down where another can see
  police: 'Police! Somebody call the police!',
  // (M6.18.6) the train's own announcement, coming into Belyagorsk (Severian first, as at Novomir)
  // (M6.20.14) the arrival: PROVISIONAL Severian (severian.js) from Rhys's words, then the English
  arrive: PROVISIONAL.arriving + '. — Welcome to Belyagorsk - Alyejka Azvestya, where this train terminates.',
  // the kiosk
  kiosk: 'Coffee? A paper?',
  // (M6.20.12, Rhys: "He should say 'dzhen# zvjiecho\"r...' the first time, but then switch to English once he realises you aren't Severian")
  kioskSev: CANON.kioskHello + ' — Good evening. You want coffee, or a paper?',
  coffee: 'One coffee. Mind, it is hot.',
  paper: 'The evening paper. Here you are.',
};
// who says which (voices: st1 and st2 the inspectors, st3 the kiosk; sva the announcer, a Severian voice.
// M6.18.3: the accented inspectors and vendor tried and dropped - Rhys: "not keen"; the announcer "perfect")
export const STAFF_VOICE = { tickets: ['st1', 'st2'], checked: ['st1'], after: ['st1'], depart: ['sva'], arrive: ['sva'], wrong1: ['st2'], wrong2: ['st2'], wrong4: ['st1'], police: ['st1', 'st2'], kiosk: ['st3'], kioskSev: ['st3'], coffee: ['st3'], paper: ['st3'] };
// how the announcement is said (what its recording was made from: tools/voices/gen_sev.py)
export const STAFF_SAY = {
 "depart": ["древ васдат-оден и зорок до Белягорск-е ра веск. стайат безпино ѵ жвԁ, прешже.", "Зе твенти-ван форти ту Белягорск из эбаут ту дипарт. Плиз, стэнд клиа оф зе дорз."]
,
 "arrive": ["лаксъскава Белягорск - Алєйка Азвестя. то̏ва древ виънеш.", "Велкам ту Белягорск, Алейка Азвестя, вэр зис трейн тёрминейтс."]
};
// (M6.18.2, Rhys: the kiosk's newspaper, "printed in Cyrillic and in the Severian language, NOT
// Russian, Ukrainian, etc") tonight's Novomirski Vesnik. Severian: a Slavic tongue of its own,
// written in Cyrillic with its own letter Ӧ. English beside it for the reader who asks.
export const NEWSPAPER = {
  // (M6.20.12, Rhys: "Keep the paper in English for now, I'll update later"; dated "Tue 8 Nov 2002" - out of
  // step with the game's night on purpose, to keep it plainly fictional). The Severian below is the old
  // placeholder, not shown: Rhys's own text will replace it
  englishOnly: true,
  masthead: 'НОВОМИРСКИ ВЕСНИК', mastheadEn: 'The Novomir Herald',
  date: 'ВТОРНИК, 3. НОЕМВРЯ 2026 · ЦЕНА 40 ГРОШ', dateEn: 'Tuesday, 8 November 2002 · Price 40 grosh',
  stories: [
    { h: 'МИНИСТЕР ДРАВЕЦ ПӦТУЕ ДО БЕЛЯГОРСКА', en: 'Minister Dravets travels to Belyagorsk',
      t: 'Министер за Белягорску провинцию, Тамаш Дравец, пӧтуе тей ночи вечерным поездом до Белягорска, де ютро одкрые нову болницу. Влада очекуе протести.',
      ten: 'The Minister for Belyagorsk Province, Tamash Dravets, travels tonight on the evening train to Belyagorsk, where tomorrow he opens a new hospital. The government expects protests.' },
    { h: 'ФРОНТ ПАМЕНИ: «ВОЛБЫ БЫЛЕ УКРАДЕНЕ»', en: 'Front of Memory: "The election was stolen"',
      t: 'Група, ктора се называ Фронт Памени, обвинява владу, же сфалшовала летошне волбы в Белягорской провинции а же «вымазуе нашу историю». Влада одмита вшетко.',
      ten: 'A group calling itself the Front of Memory accuses the government of rigging this year\'s election in Belyagorsk Province, and of "erasing our history". The government denies everything.' },
    { h: 'ПОМНИК ГОРСКИМ БОЕВНИКАМ ОДСТРАНЕН', en: 'Monument to the Mountain Fighters taken down',
      t: 'В Белягорску в понеделок одстранили помник з року 1952. Градоначалник: «Ӧн был в злом стану.» Пред мэстом стояли сто люди в тишини.',
      ten: 'In Belyagorsk on Monday the monument of 1952 was taken down. The mayor: "It was in poor condition." A hundred people stood before it in silence.' },
  ],
  weather: 'ВРЕМЕ: СНЕГ ПО ПОЛНОЧИ, −9°', weatherEn: 'Weather: snow after midnight, -9°',
};
// your seat: Coach 3
export const inCoach = (p, id) => { const c = carriages().find((q) => q.id === id); return !!c && p[0] > c.x0 && p[0] < c.x1 && Math.abs(p[2]) < CAR.half && p[1] > FLOOR - 0.3 && p[1] < CAR.ceil; };               // the back of the guard's van
// the run: how the train pulls away (m/s, m/s/s); doors close this long after you board
// (M6.18.1, Rhys: "So you have 9 minutes to find and board your train? What happens if you
// take too long? And ... if you board it well before the scheduled departure time?") the 21:40
// leaves at 21:40 by the mission clock: you arrive at 21:36, four minutes to find it. Aboard
// early, take your seat and the time passes. Not aboard at 21:40: it goes without you.
export const RUN = { top: 30, accel: 0.55, departAt: 240, warn: 30, sitTo: 20, sitPace: 20,
  // (M6.18.6, Rhys: the destination, "Belyagorsk - Alyejka Azvestya, where the Armed Police are waiting";
  // "about 15-20 mins") 31 km at up to 108 km/h: about 18 minutes from 21:40; braking at 0.6 m/s2
  arrive: 31000, decel: 0.6, approach: 2400,
  // (M6.18.10) the six down, the rest of the journey skipped to this far short of Belyagorsk's announcement
  skipShort: 400 };
// (M6.18.6) the end of the line
export const TERMINUS = { sev: (CANON.belyagorsk + ' - ' + CANON.alyejkaAzvestya).toUpperCase(), en: 'Belyagorsk - Alyejka Azvestya' };
// the line, by track coordinate: what lies outside (after the station)
export const ROUTE = [
  [0, 260, 'station'],
  [260, 2100, 'tunnel'],                  // under the city
  [2100, 9000, 'country'],
  [9000, 10600, 'tunnel'],                // through the hills
  [10600, 30400, 'country'],
  [30400, 33000, 'arrival'],              // (M6.18.6) Belyagorsk: its own station, no countryside tiles
  [33000, 1e9, 'country'],
];
export const sectionAt = (s) => (ROUTE.find(([a, b]) => s >= a && s < b) || ROUTE[ROUTE.length - 1])[2];

// where each carriage stands: [{ id, name, x0, x1 }]
export function carriages() {
  let x = TRAIN_X0;
  return CARS.map((c) => { const o = Object.assign({}, c, { x0: x, x1: x + c.len }); x += c.len + CAR.gap; return o; });
}
// the doors in each passenger carriage's platform side: [x0, x1] pairs
export function doorSpans(c) {
  if (c.id === 'loco') return [];
  return [[c.x0 + 0.6, c.x0 + 1.7], [c.x1 - 1.7, c.x1 - 0.6]];
}
// inside the train (any carriage or the gangways between): the floor box
export function inTrain(p) {
  const cs = carriages();
  return p[1] > FLOOR - 0.3 && p[1] < CAR.ceil && Math.abs(p[2]) < CAR.half - 0.02 && p[0] > cs[0].x0 && p[0] < cs[cs.length - 1].x1;
}

// The run, by the mission clock (t: seconds since 21:36): the doors open until 21:40; a
// warning half a minute before; at 21:40 the doors close - with you aboard it pulls away,
// faster and faster up to top speed; without you, it is gone ('missed').
// dist: metres from the station.
export class TrainRun {
  constructor() { this.state = 'waiting'; this.t = 0; this.dist = 0; this.speed = 0; this.events = []; this.boarded = false; }
  step(dt, aboard) {
    this.t += dt;
    // sitting and waiting: the minutes pass at RUN.sitPace times over, until it is nearly time
    if (this.fast && this.state === 'waiting') { this.t = Math.max(this.t, Math.min(this.fast, this.t + dt * (RUN.sitPace - 1))); if (this.t >= this.fast) this.fast = null; }
    if (aboard) this.boarded = true;
    if (this.state === 'waiting') {
      if (this.t >= RUN.departAt - RUN.warn && !this.warned) { this.warned = true; this.events.push({ type: 'warn' }); }
      if (this.t >= RUN.departAt) {
        if (aboard) { this.state = 'closing'; this.closeT = 0; this.events.push({ type: 'close' }); }
        else { this.state = 'missed'; this.events.push({ type: 'missed' }); }
      }
    } else if (this.state === 'closing') {
      this.closeT += dt;
      if (this.closeT > 3) { this.state = 'running'; this.events.push({ type: 'depart' }); }
    } else if (this.state === 'running' || this.state === 'braking') {
      // (M6.18.6) away to top speed; then, near Belyagorsk, braking to stop at its platform
      const k = this.express || 1, left = RUN.arrive - this.dist;
      if (!this.approached && left < Math.max(RUN.approach, this.speed * 80)) { this.approached = true; this.events.push({ type: 'approach' }); }
      if (this.state === 'running' && left <= this.speed * this.speed / (2 * RUN.decel * k) + 1) { this.state = 'braking'; this.events.push({ type: 'brake' }); }
      if (this.state === 'running') this.speed = Math.min(RUN.top * k, this.speed + RUN.accel * k * dt);
      else this.speed = Math.min(this.speed, Math.sqrt(2 * RUN.decel * k * Math.max(0, left)));
      this.dist = Math.min(RUN.arrive, this.dist + this.speed * dt);
      if (this.state === 'braking' && (RUN.arrive - this.dist < 0.05 || this.speed < 0.02)) {
        this.dist = RUN.arrive; this.speed = 0; this.state = 'arrived'; this.events.push({ type: 'arrive' });
      }
    }
  }
  // (M6.18.8, Rhys: "how can one minute contain four different minutes?") seconds to Belyagorsk as
  // the train will really run it: up to top speed, on at it, then braking to the platform
  eta() {
    if (this.state === 'arrived') return 0;
    const k = this.express || 1, top = RUN.top * k, a = RUN.accel * k, d = RUN.decel * k, left = this.left, v = this.speed;
    if (this.state === 'braking') return v > 0.01 ? 2 * left / v : 0;
    const before = this.state === 'running' ? 0 : Math.max(0, RUN.departAt - this.t) + 3;
    const tUp = (top - v) / a, sUp = (top * top - v * v) / (2 * a), sDown = top * top / (2 * d);
    if (sUp + sDown <= left) return before + tUp + (left - sUp - sDown) / top + top / d;
    // never reaches top speed: up to vp, straight down again
    const vp = Math.sqrt((2 * a * d * left + d * v * v) / (a + d));
    return before + (vp - v) / a + vp / d;
  }
  // (M6.18.10, Rhys: "waiting around for 18 mins is going to feel like AGES") the six down: the rest of
  // the journey passes in a moment - on at top speed to just short of where Belyagorsk is announced,
  // the clock moved on by the time that would have taken. Seconds skipped (0 if there is nothing to skip)
  skipAhead() {
    if (this.state !== 'running' || this.approached) return 0;
    const to = RUN.arrive - Math.max(RUN.approach, this.speed * 80) - RUN.skipShort;
    if (to <= this.dist + 1) return 0;
    const v = Math.max(this.speed, 1), gone = (to - this.dist) / v;
    this.dist = to; this.t += gone; return gone;
  }
  // under way: moving, or come to rest at the far end
  get moving() { return this.state === 'running' || this.state === 'braking' || this.state === 'arrived'; }
  // how far to go, and (at this speed, or the top) about how long
  get left() { return Math.max(0, RUN.arrive - this.dist); }
  // aboard early: sit down, and the clock runs on - quickly, while you sit (M6.18.2, Rhys: "you
  // should actually sit - for at least a moment") - to just before 21:40; stand, and it runs as ever
  sit() { if (this.state !== 'waiting' || this.t >= RUN.departAt - RUN.sitTo) return false; this.fast = RUN.departAt - RUN.sitTo; return true; }
  unsit() { this.fast = null; }
  // the time, as the station clock shows it
  clock() {
    const s = Math.floor(TRAIN_TIME.hour * 3600 + TRAIN_TIME.minute * 60 + this.t);
    const p = (v) => String(v).padStart(2, '0');
    return p(Math.floor(s / 3600) % 24) + ':' + p(Math.floor(s / 60) % 60) + ':' + p(s % 60);
  }
  get doorsOpen() { return this.state === 'waiting'; }
  get section() { return sectionAt(this.dist); }
}

export function buildTrain(opts) {
  const world = new World();
  const pieces = [], signs = [], lamps = [], water = [], lights = [], crates = [], props = [], vehicles = [];
  const run = new TrainRun();
  // (M6.18.6) ?express: the journey eight times as fast, to try the arrival without the wait
  if (opts && opts.express) run.express = 8;
  const level = { world, pieces, signs, lamps, water, lights, crates, props, vehicles, securityTurrets: [], surfaces: [],
    swingDoors: [], guards: [], zones: {}, seats: [], hijacked: false, train: true, rules: 'train', night: true,
    // (M6.18.8) off duty: no Control on the radio; and who is against whom - the Front against you and
    // the train's guard, he (your ally once he joins you) against them
    offDuty: true, relations: { red: { you: true, ally: true }, ally: { you: false, red: true } },
    missionTime: TRAIN_TIME, startGear: null, bake: false, lampCap: 5, noSunShadow: true, movers: [], trainRun: run,
    // (Rhys: "You enter the mission completely unarmed - you're off duty, after all")
    startLoadout: { primary: null, backup: null, utility1: null, utility2: null, gear: null } };
  // the train's own: drawn as the level, solid
  const box = (min, max, mat, opts) => {
    opts = opts || {};
    const p = { min, max, mat, uv: opts.uv || 'world', tag: opts.tag, tint: opts.tint };
    if (opts.prop) p.prop = opts.prop;
    if (opts.render !== false) pieces.push(p);
    if (opts.solid !== false) world.addSolid(min, max, opts.tag || mat, { noClimb: opts.noClimb, glass: opts.glass, shootThrough: opts.shootThrough });
    return p;
  };
  // the station's: drawn on the station's mover, solid only while the train stands in it
  const stationPieces = [], stationSolids = [];
  const sbox = (min, max, mat, opts) => {
    opts = opts || {};
    if (opts.render !== false) stationPieces.push({ min, max, mat, uv: 'world', tint: opts.tint, unlit: opts.unlit || undefined });
    if (opts.solid !== false) stationSolids.push(world.addSolid(min, max, 'station', { noClimb: opts.noClimb, glass: opts.glass }));
  };
  const follow = () => [-run.dist, 0, 0];
  const ssign = (pos, yaw, w, h, text, sub, col) => signs.push({ pos, yaw, w, h, text, sub: sub || '', col: col || '#e8e2d0', follow, station: true });
  const slight = (pos, range, intensity, color) => lights.push({ pos, range, intensity, color: color || [1, 0.9, 0.75], follow, station: true });

  const cars = carriages();
  level.carriages = cars;
  const XB = TRAIN_X0 - 4;                  // the buffer stops, behind the train
  const XF = cars[cars.length - 1].x1 + 30; // the platforms' far end

  // ── the station: Novomir Central, a terminus ──
  // (M6.18.1, Rhys: "the signage should probably be in cyrillic" - Cyrillic first, a line of
  // Latin under it, as a capital's terminus would; "if you can see Platforms 3 & 4, shouldn't
  // there be at least some indication that other platforms exist?" - 1 and 2 are here too;
  // "a city scenery around where the station is please")
  // the concourse across the platforms' ends, at platform height, and the street below its doors
  const CON = { x0: XB - 26, x1: XB - 2, z0: -16, z1: 20 };
  sbox([CON.x0 - 80, -1, -90], [XF + 200, 0, 100], 'concrete2');                         // the ground round about
  sbox([CON.x0, 0, CON.z0], [XB + 2, FLOOR, CON.z1], 'marble');                           // the concourse floor
  // its walls: the street side with a wide way in, the two ends; above them the station's front
  sbox([CON.x0 - 0.3, 0, CON.z0], [CON.x0, 7, 3], 'cladding');
  sbox([CON.x0 - 0.3, 0, 9], [CON.x0, 7, CON.z1], 'cladding');
  sbox([CON.x0 - 0.3, 4.2, 3], [CON.x0, 7, 9], 'cladding');
  sbox([CON.x0, 0, CON.z0 - 0.3], [XB + 2, 7, CON.z0], 'cladding');
  sbox([CON.x0, 0, CON.z1], [XB + 2, 7, CON.z1 + 0.3], 'cladding');
  sbox([CON.x0, 7, CON.z0], [XB + 2, 7.3, CON.z1], 'plaster', { solid: false });           // its ceiling
  sbox([CON.x0 - 0.6, 7, CON.z0 - 0.6], [XB + 2, 15, CON.z1 + 0.6], 'facade', { solid: false });   // the front, up over the concourse
  sbox([CON.x0 - 1.2, 15, CON.z0 - 1.2], [XB + 2.5, 15.6, CON.z1 + 1.2], 'cladding', { solid: false });
  // a clock tower over the door
  sbox([CON.x0 - 0.8, 15.6, 3], [CON.x0 + 5, 24, 9], 'cladding', { solid: false });
  sbox([CON.x0 - 0.85, 19.5, 4.5], [CON.x0 - 0.8, 22.5, 7.5], 'lamp', { solid: false });
  // steps up from the street to the doors
  for (let k = 0; k < 5; k++) sbox([CON.x0 - 2.5 + k * 0.5, 0, 3], [CON.x0 + 0.01, (k + 1) * FLOOR / 5, 9], 'marble');
  // the name over the way in, outside
  ssign([CON.x0 - 0.65, 9.5, 6], -Math.PI / 2, 12, 1.6, CANON.novomirCentral.toUpperCase(), 'Novomir Central', '#e8b423');
  // the departures board, facing you as you come in
  // (M6.18.3, Rhys: "shouldn't it be a matrix board, rather than a stationary sign?") the departures
  // board: a dot-matrix of amber lamps - the clock, the next trains, the 21:40 marked as she goes;
  // in Severian, and every few seconds in English
  signs.push({ pos: [CON.x0 + 8, 3.5, 6], yaw: -Math.PI / 2, w: 6.4, h: 2.0, text: '21:40  БЕЛЯГОРСК  ' + CANON.platform.toUpperCase() + ' 3', sub: '21:40 Belyagorsk - Platform 3', col: '#ffb326', follow, station: true, board: () => departures(run, Math.floor(Date.now() / 7000) % 2 === 1) });
  // (M6.18.11, Rhys: "the numbers slightly overhang the actual board") its housing a frame round the lamps
  sbox([CON.x0 + 8.05, 3.32, 2.68], [CON.x0 + 8.3, 5.72, 9.32], 'metal', { tint: [0.1, 0.1, 0.12] });
  // a kiosk, benches
  // (M6.18.2, Rhys: "from the Kafe-Gazety, you should be able to pick up (and drink/read) a coffee
  // and a newspaper") a stall open at the front: its counter, the vendor behind it, the urn, the papers
  const KX = CON.x0 + 3, KZ = CON.z1 - 3.5;
  sbox([KX, FLOOR, KZ], [KX + 4, FLOOR + 1.05, KZ + 0.5], 'wood');                       // the counter
  sbox([KX - 0.1, FLOOR + 1.05, KZ - 0.1], [KX + 4.1, FLOOR + 1.1, KZ + 0.6], 'marble', { solid: false });
  sbox([KX, FLOOR, KZ + 0.5], [KX + 0.1, FLOOR + 2.4, CON.z1 - 0.3], 'wood');
  sbox([KX + 3.9, FLOOR, KZ + 0.5], [KX + 4, FLOOR + 2.4, CON.z1 - 0.3], 'wood');
  sbox([KX, FLOOR + 2.4, KZ - 0.2], [KX + 4, FLOOR + 2.55, CON.z1 - 0.3], 'wood', { solid: false });
  sbox([KX + 0.5, FLOOR + 1.1, KZ + 0.1], [KX + 0.85, FLOOR + 1.55, KZ + 0.4], 'metal', { solid: false, tint: [0.75, 0.75, 0.78] });   // the urn
  for (let k = 0; k < 4; k++) sbox([KX + 1.6 + k * 0.5, FLOOR + 1.1, KZ + 0.05], [KX + 2.0 + k * 0.5, FLOOR + 1.13, KZ + 0.4], 'paper', { solid: false });   // the papers
  // (M6.20.12, Rhys's Severian) ко̏фиъ, газети
  ssign([KX + 2, FLOOR + 2.6, KZ - 0.25], Math.PI, 3.8, 0.5, (CANON.coffee + ' · ' + CANON.newspapers).toUpperCase(), 'Coffee · newspapers', '#c9d4d8');
  for (const z of [-11, -7, -3]) sbox([CON.x0 + 4, FLOOR, z - 0.25], [CON.x0 + 7, FLOOR + 0.45, z + 0.25], 'wood');
  // the barriers to the platforms: a line across the concourse, a gate for each platform, each
  // manned (M6.18.2, Rhys: "shouldn't there really be a Ticket Inspector at all 4 platforms? (And if
  // you try to go to the wrong one, they redirect you to Platform 3)"): shut until he lets you by
  // (M6.20.12, Rhys's Severian: "not in service" is обслувани нє - not закворына, closed)
  const gates = [[-13.6, -10.2, '1', '22:10 ' + CANON.portOstrel + ' · Port Ȍstrel'], [-5.8, -2.4, '2', CANON.notInService + ' · Not in service'],
    [2.4, 7.4, '3', '21:40 Белягорск · Belyagorsk'], [11.4, 15.6, '4', '21:52 Кирова · Kirova']];
  const GX = XB - 3, bar = (z0, z1) => sbox([GX, FLOOR, z0], [GX + 0.3, FLOOR + 1.1, z1], 'metal', { tint: [0.3, 0.32, 0.36] });
  level.gates = {};
  level.npcs = [];
  let zz = CON.z0;
  for (const [g0, g1, pn, sub] of gates) {
    bar(zz, g0);
    const gm = (g0 + g1) / 2, gz = [gm - 0.5, gm + 0.5];
    bar(g0, gz[0]); bar(gz[1], g1);
    pieces.push({ min: [GX + 0.08, FLOOR + 0.2, gz[0] + 0.05], max: [GX + 0.22, FLOOR + 1.0, gz[1] - 0.05], mat: 'paint', uv: 'world', tint: [0.75, 0.12, 0.1], prop: 'gate' + pn });
    const gs = world.addSolid([GX, FLOOR, gz[0]], [GX + 0.3, FLOOR + 1.6, gz[1]], 'gate', { noClimb: true });
    level['gate' + pn] = level.gates[pn] = { platform: pn, open: false, hidden: false, solid: gs, z: gz, x: GX + 0.15 };
    // his lectern, and him beside it, on the concourse side, facing you as you come
    sbox([GX - 1.6, FLOOR, gz[1] + 0.2], [GX - 0.9, FLOOR + 1.1, gz[1] + 0.9], 'wood');
    level.npcs.push({ id: 'inspector' + pn, kind: 'inspector', platform: pn, title: 'Ticket inspector', pos: [GX - 1.25, FLOOR, gm], yaw: Math.PI / 2, tint: [0.45, 0.6, 1.35], hat: 'cap', voice: pn === '1' || pn === '2' ? 'st2' : 'st1' });
    ssign([GX + 0.15, FLOOR + 2.4, gm], -Math.PI / 2, 2.8, 0.6, CANON.platform.toUpperCase() + ' ' + pn, sub, '#f2c14e');
    zz = g1;
  }
  bar(zz, CON.z1);
  level.ticketGate = level.gates['3'];
  // the kiosk's vendor, behind his counter
  level.npcs.push({ id: 'vendor', kind: 'vendor', title: 'Kiosk', pos: [KX + 2.6, FLOOR, KZ + 1.1], yaw: 0, tint: [1.3, 1.25, 1.1], voice: 'st3' });
  for (const z of [-8, 2, 12]) slight([CON.x0 + 10, 6.4, z], 16, 1.0, [1, 0.92, 0.78]);
  for (const z of [-12, -4, 6, 16]) sbox([CON.x0 + 6, 6.95, z - 0.4], [CON.x0 + 14, 7.0, z + 0.4], 'lamp', { solid: false });

  // the platforms: 1 and 2 (across a track with a local train standing in it), 3 (ours), 4
  const P3 = { z0: CAR.half + 0.1, z1: 8 }, P4 = { z0: 11.2, z1: 16 };
  const P2 = { z0: -6.6, z1: -(CAR.half + 0.1) }, P1 = { z0: -15, z1: -10.2 };
  for (const P of [P1, P2, P3, P4]) {
    sbox([XB - 2.5, 0, P.z0], [XF, FLOOR, P.z1], 'concrete');
    for (const edge of [P.z0, P.z1]) {
      if (Math.abs(edge) > 15.5) continue;
      const inner = edge === P.z0 ? [P.z0, P.z0 + 0.35] : [P.z1 - 0.35, P.z1];
      sbox([XB - 2.5, FLOOR, inner[0]], [XF, FLOOR + 0.005, inner[1]], 'paint', { solid: false, tint: [0.9, 0.75, 0.1] });   // the yellow line
    }
  }
  // Platform 2's side to our train is fenced off: it is worked from its far face only
  sbox([XB - 2.5, FLOOR, -1.85], [XF, FLOOR + 1.1, -1.75], 'metal', { tint: [0.25, 0.27, 0.3] });
  // the far sides: walls
  sbox([XB - 2.5, 0, -15.4], [XF, 6, -15], 'brick');
  sbox([XB - 2.5, 0, 16], [XF, 6, 16.4], 'brick');
  // the train shed: a roof on columns over the first stretch of the platforms
  const SH = XB + 70;
  sbox([XB - 2.5, 9, -15.4], [SH, 9.3, 16.4], 'metal', { solid: false, tint: [0.2, 0.21, 0.24] });
  for (let x = XB + 6; x < SH; x += 12) {
    for (const z of [-12.6, -4.2, 5.5, 13.6]) sbox([x - 0.18, FLOOR, z - 0.18], [x + 0.18, 9, z + 0.18], 'metal', { tint: [0.25, 0.27, 0.3] });
    slight([x, 7.5, 6.5], 12, 0.9, [1, 0.95, 0.85]);
    for (const z of [-12.6, -4.2, 6.5, 13.6]) sbox([x - 0.4, 8.2, z - 0.9], [x + 0.4, 8.3, z + 0.9], 'lamp', { solid: false });
  }
  // lamp posts down the open platforms beyond the shed
  for (let x = SH + 8; x < XF - 4; x += 16) {
    for (const z of [-12.6, -4.2, 6.9, 13.6]) {
      sbox([x - 0.07, FLOOR, z - 0.1], [x + 0.07, FLOOR + 4, z + 0.1], 'metal', { tint: [0.2, 0.2, 0.22] });
      sbox([x - 0.25, FLOOR + 3.9, z - 0.35], [x + 0.25, FLOOR + 4.05, z + 0.35], 'lamp', { solid: false });
    }
    slight([x, FLOOR + 3.6, 6.8], 10, 0.7, [1, 0.85, 0.6]);
  }
  // platform signs and benches
  for (let x = XB + 10; x < XF - 10; x += 30) {
    ssign([x, FLOOR + 2.6, -12.6], 0, 1.6, 0.5, '1', CANON.portOstrel + ' · Port Ȍstrel', '#f2c14e');
    ssign([x, FLOOR + 2.6, -4.2], 0, 1.6, 0.5, '2', '', '#f2c14e');
    ssign([x, FLOOR + 2.6, 5.5], 0, 1.6, 0.5, '3', 'Белягорск · Belyagorsk', '#f2c14e');
    ssign([x, FLOOR + 2.6, 13.6], 0, 1.6, 0.5, '4', 'Кирова · Kirova', '#f2c14e');
    sbox([x + 4, FLOOR, 6.4], [x + 6, FLOOR + 0.45, 6.9], 'wood');
  }
  // the tracks: ours (0), the local's (-8.4), Platform 4's (9.6); buffer stops at their ends
  const TRACKS = [0, -8.4, 9.6];
  for (const z of TRACKS) {
    sbox([XB - 0.6, 0, z - 1.2], [XB, 1.3, z + 1.2], 'paint', { tint: [0.75, 0.12, 0.08] });
    for (const dz of [-0.72, 0.72]) sbox([XB, 0.15, z + dz - 0.04], [XF + 200, 0.3, z + dz + 0.04], 'metal', { solid: false, tint: [0.45, 0.42, 0.4] });
  }
  // a local train standing at Platform 1/2, dark, out of service
  for (let k = 0; k < 3; k++) {
    const x0 = XB + 2 + k * 21.5, x1 = x0 + 20, z = -8.4;
    sbox([x0, 0.55, z - 1.45], [x1, 3.4, z + 1.45], 'paint', { tint: [0.28, 0.42, 0.3] });
    for (const sg of [-1, 1]) for (let x = x0 + 1; x < x1 - 2; x += 2.4) sbox([x, 1.9, z + sg * 1.46 - 0.01], [x + 1.8, 2.7, z + sg * 1.46 + 0.01], 'glass', { solid: false });
    sbox([x0, 1.5, z - 1.47], [x1, 1.62, z + 1.47], 'paint', { solid: false, tint: [0.85, 0.75, 0.2] });
  }
  // ── the city round about (M6.18.2, Rhys: "a long empty street with buildings to the side but a
  // massive gap along the way - please fill it with buildings, like a proper densely packed
  // 'hustle-and-bustle' city"): a grid of blocks on every side, streets between, taller towards
  // the middle, a tower here and there; the station, its street and the line kept clear ──
  const block = (x0, z0, x1, z1, h) => { sbox([x0, 0, z0], [x1, h, z1], 'facade', { solid: false, unlit: true }); sbox([x0 - 0.3, h, z0 - 0.3], [x1 + 0.3, h + 0.5, z1 + 0.3], 'cladding', { solid: false, unlit: true }); };
  const SX = CON.x0 - 16;                                       // the far side of the street in front
  // (M6.18.3, Rhys: "buildings that appear to sit IN the street" at about z -60 and 73) the street is short:
  // it ends both ways in a building across it, the town packed round
  const STREET = [-47, 59];
  const keep = [[SX, -19, XF + 200, 21], [SX - 1, STREET[0], CON.x0 - 2, STREET[1]]];   // the station and the line; the street
  const clearOf = (x0, z0, x1, z1) => !keep.some(([a0, b0, a1, b1]) => x0 < a1 && x1 > a0 && z0 < b1 && z1 > b0);
  let k = 0;
  level.cityBlocks = 0;
  for (let gx = CON.x0 - 150; gx < 300; gx += 34) for (let gz = -150; gz < 160; gz += 30) {
    // each grid square: two or three buildings side by side, a street round them
    const parts = 2 + (k % 2);
    for (let i = 0; i < parts; i++, k++) {
      const w = 26 / parts, x0 = gx + i * w + 0.5, x1 = x0 + w - 1, z0 = gz, z1 = gz + 22 + (k % 3) * 1.5;
      if (!clearOf(x0, z0, x1, z1)) continue;
      const far = Math.hypot(x0 - 40, z0) / 260;
      const h = 9 + ((k * 7919) % 23) + (far < 0.5 ? 6 : 0) + ((k % 17) === 0 ? 28 : 0);
      block(x0, z0, x1, z1, h);
      level.cityBlocks++;
    }
  }
  // across each end of the street, buildings standing in it (and solid: the street ends here)
  level.streetEnds = [];
  for (const [z0, z1, h] of [[STREET[0] - 22, STREET[0], 24], [STREET[1], STREET[1] + 24, 30]]) {
    for (const [x0, x1, dh] of [[SX - 8, SX + 7, 0], [SX + 7.5, CON.x0 + 6, 9]]) {
      block(x0, z0, x1, z1, h + dh);
      stationSolids.push(world.addSolid([x0, 0, z0], [x1, h + dh, z1], 'station', { noClimb: true }));
      level.cityBlocks++;
    }
    level.streetEnds.push([z0, z1]);
  }
  // the street's sides are its buildings' fronts: solid, and built up to it on the station's side too
  stationSolids.push(world.addSolid([SX - 1, 0, STREET[0]], [SX + 0.4, 30, STREET[1]], 'station', { noClimb: true }));
  for (const [z0, z1] of [[STREET[0], -19.5], [21.5, STREET[1]]]) {
    block(CON.x0 - 2, z0, CON.x0 + 18, z1, 16 + (z0 > 0 ? 6 : 0));
    stationSolids.push(world.addSolid([CON.x0 - 2, 0, z0], [CON.x0 + 18, 30, z1], 'station', { noClimb: true }));
    level.cityBlocks++;
  }
  // the road in front and its pavements, lamps along it
  sbox([SX + 0.5, 0, STREET[0]], [CON.x0 - 3, 0.02, STREET[1]], 'concrete2', { solid: false, tint: [0.25, 0.25, 0.27] });
  for (let z = STREET[0] + 4; z < STREET[1]; z += 18) {
    for (const x of [SX + 1, CON.x0 - 3.5]) {
      sbox([x - 0.08, 0, z - 0.08], [x + 0.08, 6, z + 0.08], 'metal', { tint: [0.15, 0.15, 0.17] });
      sbox([x - 0.3, 5.9, z - 0.3], [x + 0.3, 6.05, z + 0.3], 'lamp', { solid: false });
    }
  }
  slight([CON.x0 - 6, 5.5, 6], 18, 0.9, [1, 0.8, 0.55]);
  // the buildings right beside the station and along the line, close up to its walls
  for (const side of [-1, 1]) {
    const zIn = side < 0 ? -18 : 20, zOut = side < 0 ? -24 : 26;
    for (let x = CON.x0, j = 0; x < 255; j++) {
      const w = 14 + (j * 5) % 9, h = 10 + (j * 13) % 22;
      block(x, Math.min(zIn, zOut), x + w, Math.max(zIn, zOut), h);
      level.cityBlocks++;
      x += w + 1;
    }
  }
  // the line goes under the city: the tunnel's mouth across the tracks, 260 m out
  const TM = 260;
  sbox([TM, 0, -60], [TM + 2, 22, -3.4], 'concrete', { solid: false });
  sbox([TM, 0, 3.4], [TM + 2, 22, 60], 'concrete', { solid: false });
  sbox([TM, 5.6, -3.4], [TM + 2, 22, 3.4], 'concrete', { solid: false });
  sbox([TM - 0.1, 5.2, -3.6], [TM, 5.6, 3.6], 'paint', { solid: false, tint: [0.75, 0.6, 0.15] });
  // (M6.18.3, Rhys walked down the line, into the tunnel, saw sky through it and fell off the world's end)
  // the tunnel goes on into the dark - walls, a roof, black at its end - and you cannot follow the line
  // out of the station: its sides walled where the buildings stand, a fence across past the platforms
  sbox([TM + 2, 0, -3.6], [TM + 60, 5.6, -3.4], 'concrete', { solid: false });
  sbox([TM + 2, 0, 3.4], [TM + 60, 5.6, 3.6], 'concrete', { solid: false });
  sbox([TM + 2, 5.6, -3.6], [TM + 60, 5.8, 3.6], 'concrete', { solid: false });
  // (M6.18.8, Rhys: "a massive wall of concrete that phases through the train" - this black end, across
  // the line, met the train as the station slid back) its own mover, there only while she stands
  const LINE_END = XF + 24;
  // (a fence either side of our own line - the train goes that way: there, only a solid you cannot see)
  for (const [z0, z1] of [[-16.5, -2.2], [2.2, 18.5]]) {
    for (let z = z0; z <= z1 + 0.01; z += (z1 - z0) / 6) sbox([LINE_END - 0.05, 0, z - 0.05], [LINE_END + 0.05, 2.2, z + 0.05], 'metal', { solid: false, tint: [0.2, 0.2, 0.22] });
    for (const y of [0.7, 1.4, 2.1]) sbox([LINE_END - 0.03, y, z0], [LINE_END + 0.03, y + 0.06, z1], 'metal', { solid: false, tint: [0.3, 0.3, 0.32] });
  }
  stationSolids.push(world.addSolid([LINE_END - 0.2, 0, -19], [LINE_END + 0.2, 4, 21], 'station', { noClimb: true }));
  for (const z of [-18.2, 20.2]) stationSolids.push(world.addSolid([CON.x1, 0, z - 0.2], [LINE_END, 12, z + 0.2], 'station', { noClimb: true }));
  level.lineEnd = LINE_END;
  level.movers.push({ id: 'station', pieces: stationPieces, at: () => [-run.dist, run.dist > 4000 ? -1000 : 0, 0] });
  level.movers.push({ id: 'tunnelcap', pieces: [{ min: [TM + 60, 0, -3.6], max: [TM + 60.2, 5.8, 3.6], mat: 'paint', uv: 'world', tint: [0.02, 0.02, 0.02] }],
    at: () => run.state === 'waiting' || run.state === 'missed' ? [0, 0, 0] : [0, -1000, 0] });
  level.stationSolids = stationSolids;
  level.concourse = CON;
  level.platform3 = P3;
  level.platforms = { 1: P1, 2: P2, 3: P3, 4: P4 };

  // the street outside, where you come
  const sp = [CON.x0 - 8, 0, 6];
  world.spawn = { pos: sp, yaw: -Math.PI / 2 };                 // facing +x: the station
  // (yaw: 0 looks to -z, -PI/2 to +x)

  // ── the train ──
  const H = CAR.half, Wt = CAR.wall, inZ = H - Wt;
  const coachTint = [0.16, 0.22, 0.34], stripe = [0.8, 0.12, 0.1];
  level.trainDoors = { hidden: true, spans: [] };              // their leaves shown only when shut
  for (const c of cars) {
    const loco = c.id === 'loco';
    // the floor (solid down to the bogies) and the roof
    box([c.x0, 0.55, -H], [c.x1, FLOOR, H], 'metal', { tint: [0.12, 0.12, 0.13] });
    box([c.x0, FLOOR, -inZ], [c.x1, FLOOR + 0.01, inZ], 'carpet', { solid: false, tint: c.id === 'A' ? [0.35, 0.12, 0.14] : c.id === 'van' ? [0.3, 0.3, 0.3] : [0.18, 0.2, 0.3] });
    box([c.x0, CAR.ceil, -H], [c.x1, CAR.roof, H], 'paint', { tint: [0.55, 0.57, 0.6], render: false });
    roofShell(c.x0, c.x1, [0.55, 0.57, 0.6], level);
    box([c.x0, CAR.ceil - 0.02, -inZ], [c.x1, CAR.ceil, inZ], 'plaster', { solid: false });
    // the sides: the platform side (+z) with its doors, the other plain; windows along both
    const doors = doorSpans(c);
    for (const sgn of [1, -1]) {
      const z0 = sgn > 0 ? inZ : -H, z1 = sgn > 0 ? H : -inZ;
      // runs of wall along x: broken by doors (platform side) and windows
      const cuts = (sgn > 0 ? doors : []).slice().sort((a, b) => a[0] - b[0]);
      let x = c.x0;
      const runs = [];
      for (const [d0, d1] of cuts) { runs.push([x, d0]); x = d1; }
      runs.push([x, c.x1]);
      for (const [a, b] of runs) {
        // below the windows, above them, and the window posts every 2 m with glass between
        box([a, FLOOR, z0], [b, WIN.sill, z1], 'paint', { tint: coachTint });
        box([a, WIN.head, z0], [b, CAR.ceil, z1], 'paint', { tint: coachTint });
        if (loco) { box([a, WIN.sill, z0], [b, WIN.head, z1], 'paint', { tint: coachTint }); continue; }
        for (let px = a; px < b - 0.01; px += 2.2) {
          const q = Math.min(b, px + 0.3);
          box([px, WIN.sill, z0], [q, WIN.head, z1], 'paint', { tint: coachTint });
          if (q < b - 0.05) box([q, WIN.sill, (z0 + z1) / 2 - 0.01], [Math.min(b, px + 2.2), WIN.head, (z0 + z1) / 2 + 0.01], 'glass', { glass: true, noClimb: true });
        }
      }
      // the red band along the outside
      // (M6.18.5, Rhys: "why do the coaches have a red bar across their doors?") broken by each doorway
      for (const [a, b] of runs) box([a, 1.55, sgn > 0 ? H : -H - 0.01], [b, 1.7, sgn > 0 ? H + 0.01 : -H], 'paint', { solid: false, tint: stripe });
      // the doors themselves: leaves seen (and solid) only while shut
      if (sgn > 0) for (const [d0, d1] of doors) {
        box([d0, FLOOR, H - 0.03], [d1, 3.0, H], 'paint', { tint: [0.75, 0.12, 0.1], solid: false, prop: 'trainDoors' });
        box([d0 + 0.15, 1.9, H - 0.035], [d1 - 0.15, 2.7, H + 0.005], 'glass', { solid: false, prop: 'trainDoors' });
        box([d0, 3.0, z0], [d1, CAR.ceil, z1], 'paint', { tint: coachTint });
        const s = world.addSolid([d0, FLOOR, H - 0.06], [d1, 3.0, H], 'traindoor', { noClimb: true });
        s.disabled = true;
        level.trainDoors.spans.push({ x0: d0, x1: d1, solid: s });
      }
    }
    // the ends: a wall with a gangway door through it (the van's back, the loco's front: shut)
    for (const [ex, out] of [[c.x0, -1], [c.x1, 1]]) {
      const outer = (out < 0 && c === cars[0]) || (out > 0 && loco);
      const t0 = out < 0 ? ex : ex - 0.1, t1 = out < 0 ? ex + 0.1 : ex;
      if (outer && loco) { nose(c, box, level); continue; }
      if (outer) { box([t0, FLOOR, -H], [t1, CAR.ceil, H], 'paint', { tint: coachTint }); continue; }
      box([t0, FLOOR, -H], [t1, CAR.ceil, -0.5], 'paint', { tint: [0.6, 0.6, 0.62] });
      box([t0, FLOOR, 0.5], [t1, CAR.ceil, H], 'paint', { tint: [0.6, 0.6, 0.62] });
      box([t0, 3.0, -0.5], [t1, CAR.ceil, 0.5], 'paint', { tint: [0.6, 0.6, 0.62] });
    }
    // the coach's letter on its side, by the doors
    // (M6.18.9, Rhys: is the guard's van "Б"? - it was my shorthand for багажный, baggage) numbered on, as the rest are: 5
    if (!loco) signs.push({ pos: [c.x0 + 2.6, 2.3, H + 0.02], yaw: 0, w: 0.5, h: 0.5, text: c.id === 'van' ? '5' : c.no, sub: '', col: '#f2f2f2' });
    // its lights: a strip down the ceiling, and one lamp to light it
    // (two thin strips along the ceiling's edges: one broad one down the middle glared like a beam)
    for (const z of [-0.75, 0.75]) box([c.x0 + 1, CAR.ceil - 0.04, z - 0.04], [c.x1 - 1, CAR.ceil - 0.02, z + 0.04], 'neon', { solid: false, tint: c.id === 'A' ? [0.5, 0.42, 0.32] : [0.42, 0.44, 0.46] });
    for (const f of loco ? [0.5] : [0.28, 0.72]) lights.push({ pos: [c.x0 + (c.x1 - c.x0) * f, CAR.ceil - 0.35, 0], range: 11, intensity: 1.15, color: c.id === 'A' ? [1, 0.88, 0.7] : [0.95, 0.97, 1] });
    fitCarriage(c, box, level);
  }
  // the gangways between: floor, sides and roof across the gap
  for (let i = 0; i + 1 < cars.length; i++) {
    const a = cars[i].x1, b = cars[i + 1].x0;
    box([a, 0.55, -0.6], [b, FLOOR, 0.6], 'metal', { tint: [0.15, 0.15, 0.16] });
    box([a, FLOOR, -0.62], [b, 3.0, -0.5], 'fabric', { tint: [0.08, 0.08, 0.09] });
    box([a, FLOOR, 0.5], [b, 3.0, 0.62], 'fabric', { tint: [0.08, 0.08, 0.09] });
    box([a, 3.0, -0.62], [b, 3.1, 0.62], 'fabric', { tint: [0.08, 0.08, 0.09] });
  }
  // the cab: shut off from first class by a locked door
  const loco = cars[cars.length - 1], A = cars[cars.length - 2];
  level.swingDoors.push(new SwingDoor(world, { plane: 'x', at: loco.x0 + 0.05, wall: [loco.x0, loco.x0 + 0.1], from: -0.48, to: 0.48, y0: FLOOR, h: 2.0, build: 'reinforced', locked: true, mat: 'glass', label: 'cab door' }));
  // and the gangway doors between coaches: ordinary doors, both ways
  for (const c of cars) {
    if (c.id === 'loco') continue;
    for (const [ex, out] of [[c.x0, -1], [c.x1, 1]]) {
      if ((out < 0 && c === cars[0]) || (out > 0 && c === A)) continue;
      const at = out < 0 ? ex + 0.05 : ex - 0.05;
      level.swingDoors.push(new SwingDoor(world, { plane: 'x', at, wall: [at - 0.05, at + 0.05], from: -0.48, to: 0.48, y0: FLOOR, h: 2.0, mat: 'door', label: 'gangway door' }));
    }
  }

  // ── the line: tiles of track, tunnel and country, streaming past ──
  streamTiles(level, run);
  arrivalStation(level, run, world, cars);
  hijackers(level, world, cars);

  // where you are, by name (the radar's corner)
  for (const c of cars) world.addZone([c.x0, FLOOR - 0.5, -H], [c.x1, CAR.ceil, H], 'car_' + c.id, 'The 21:40 - ' + c.name);
  world.addZone([CON.x0, 0, CON.z0], [XB, 7, CON.z1], 'concourse', 'Novomir Central - the concourse');
  world.addZone([XB, 0, P3.z0], [XF, 9, P3.z1], 'platform3', 'Novomir Central - Platform 3');
  world.addZone([XB, 0, P4.z0], [XF, 9, P4.z1], 'platform4', 'Novomir Central - Platform 4');

  // the guards' floor (none yet): the train and platform 3, one level
  level.navFloors = [{ y: FLOOR, bounds: [TRAIN_X0 - 2, -2, cars[cars.length - 1].x1 + 2, 9] }];
  level.navLinks = [];
  return level;
}

// (M6.18.1, Rhys: "a more... 'train-shaped' train (not a British 'square-nosed' train, but a
// more aerodynamic 'bullet-nosed' one)") the locomotive's front: a deep windscreen across the
// cab, and below it a long nose that tapers to a rounded point; a visor over the glass.
// Built in slices along x, each as wide and as high as the nose is there.
// (M6.18.5, Rhys: "a box with a beak added as an afterthought rather than an intentionally designed
// aerodynamic intercity train") one body section for the whole train - flat sides, a rounded roof
// (a superellipse: BODY) - every coach roofed with it, and the nose lofted from that same section
// at the cab, the roof raking down through a wraparound windscreen into a long, low, rounded snout.
export const BODY = { yc: 2.15, hy: 1.6, p: 8, bottom: 0.55, top: 3.75 };
// a point of the section at angle a (0: the right side, PI/2: the roof's crown), scaled
const sect = (a, w, mid, hh, p) => {
  const c = Math.cos(a), s = Math.sin(a), e = 2 / p;
  return [w * Math.sign(c) * Math.pow(Math.abs(c), e), mid + hh * Math.sign(s) * Math.pow(Math.abs(s), e)];
};
export const NOSE = {
  len: 10, slices: 30, ring: 64, glass: [1.75, 3.05], windscreen: [0.02, 0.33], deckTo: 0.55,
  // the nose's shape at t (0 at the cab, 1 at the tip): half-width, bottom, top, squareness
  at(t) {
    const H = CAR.half;
    const w = H * Math.pow(Math.max(0, 1 - Math.pow(t, 2.6)), 0.5);
    const bottom = BODY.bottom + 0.22 * t * t, top = 1.02 + (BODY.top - 1.02) * Math.pow(1 - t, 1.9);
    return { w, bottom, top, mid: (bottom + top) / 2, hh: (top - bottom) / 2, p: BODY.p - 5.4 * Math.pow(t, 0.7) };
  },
};
// quads lofted between rings (each a list of points), faces turned away from each ring's middle
function loftQuads(rings, mids, open) {
  const quads = [];
  for (let i = 0; i + 1 < rings.length; i++) {
    const A0 = rings[i], A1 = rings[i + 1], m = A0.length;
    for (let j = 0; j < (open ? m - 1 : m); j++) {
      const j1 = (j + 1) % m, v = [A0[j], A1[j], A1[j1], A0[j1]];
      const e1 = [v[1][0] - v[0][0], v[1][1] - v[0][1], v[1][2] - v[0][2]], e2 = [v[3][0] - v[0][0], v[3][1] - v[0][1], v[3][2] - v[0][2]];
      let nn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
      const l = Math.hypot(...nn);
      if (l < 1e-9) continue;                                  // the tip, closed to a line
      nn = nn.map((q) => q / l);
      const c = v.reduce((acc, q) => [acc[0] + q[0] / 4, acc[1] + q[1] / 4, acc[2] + q[2] / 4], [0, 0, 0]);
      const cy = (mids[i] + mids[i + 1]) / 2;
      if (nn[1] * (c[1] - cy) + nn[2] * c[2] < 0) { v.reverse(); nn = nn.map((q) => -q); }
      quads.push({ v, n: nn, j, i });
    }
  }
  return quads;
}
// the roof over a vehicle, x0..x1: the section above the ceiling, its ends closed
function roofShell(x0, x1, tint, level) {
  const H = CAR.half, pts = [];
  for (let j = 0; j <= 24; j++) {
    const a = j / 24 * Math.PI, [z, y] = sect(a, H, BODY.yc, BODY.hy, BODY.p);
    if (y >= CAR.ceil - 1e-6) pts.push([z, y]);
  }
  // from the ceiling's edge on one side, over, to the other
  const ring = (x) => [[x, CAR.ceil, H], ...pts.map(([z, y]) => [x, y, z]), [x, CAR.ceil, -H]];
  const quads = loftQuads([ring(x0), ring(x1)], [BODY.yc, BODY.yc], true);
  // its ends: a fan from the middle of the ceiling's line
  for (const [x, nx] of [[x0, -1], [x1, 1]]) {
    const r = ring(x), c = [x, CAR.ceil, 0];
    for (let j = 0; j + 1 < r.length; j++) {
      const v = nx > 0 ? [c, r[j], r[j + 1], r[j + 1]] : [c, r[j + 1], r[j], r[j]];
      quads.push({ v, n: [nx, 0, 0] });
    }
  }
  level.pieces.push(Object.assign({ quads, mat: 'paint', uv: 'world', tint }, quadsBox(quads)));
}
function nose(c, box, level) {
  const H = CAR.half, x1 = c.x1, body = [0.16, 0.22, 0.34], red = [0.8, 0.12, 0.1], warn = [0.92, 0.72, 0.12];
  // the cab's front, inside the shell: wall below the windscreen, the glass, the wall above
  box([x1 - 0.1, FLOOR, -H], [x1, NOSE.glass[0], H], 'paint', { tint: body });
  box([x1 - 0.06, NOSE.glass[0], -H + 0.25], [x1 - 0.04, NOSE.glass[1], H - 0.25], 'glass', { glass: true, noClimb: true });
  for (const z of [-H, H - 0.25]) box([x1 - 0.1, NOSE.glass[0], z], [x1, NOSE.glass[1], z + 0.25], 'paint', { tint: body });
  box([x1 - 0.1, NOSE.glass[1], -H], [x1, CAR.ceil, H], 'paint', { tint: body });
  const n = NOSE.slices, L = NOSE.len, R = NOSE.ring, rings = [], mids = [];
  // a section's points spaced evenly round its outline (by angle, its flat sides got few, and big faces)
  const evenRing = (f) => {
    const dense = [];
    for (let k = 0; k < 720; k++) dense.push(sect(k / 720 * Math.PI * 2, f.w, f.mid, f.hh, f.p));
    const cum = [0];
    for (let k = 1; k <= 720; k++) { const a = dense[k - 1], b = dense[k % 720]; cum.push(cum[k - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
    const per = cum[720], out = [];
    for (let j = 0, k = 0; j < R; j++) {
      const want = j / R * per;
      while (cum[k + 1] < want) k++;
      const u = (want - cum[k]) / Math.max(1e-9, cum[k + 1] - cum[k]), a = dense[k], b = dense[(k + 1) % 720];
      out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
    }
    return out;
  };
  const ringT = [];
  for (let i = 0; i <= n; i++) {
    // stations closer together towards the tip, where it curves most
    const t = 1 - Math.pow(1 - i / n, 1.35), f = NOSE.at(t);
    ringT.push(t);
    rings.push(evenRing(f).map(([z, y]) => [x1 + t * L, y, z])); mids.push(f.mid);
  }
  const all = loftQuads(rings, mids, false);
  // each face its part: the windscreen (glass, wrapping round the top of the rake), the red band
  // carried on from the coaches' sides, a yellow warning panel at the tip, the rest the body
  const part = (q) => {
    const cx = q.v.reduce((a, v) => a + v[0], 0) / 4, cy = q.v.reduce((a, v) => a + v[1], 0) / 4, cz = q.v.reduce((a, v) => a + v[2], 0) / 4;
    const t = (cx - x1) / L, f = NOSE.at(t);
    const up = (cy - f.mid) / f.hh, side = f.w > 0.01 ? Math.abs(cz) / f.w : 0;
    if (ringT[q.i] >= 0.86) return 'warn';                // (by ring: a clean line round the snout)
    return 'body';
  };
  const parts = { body: [], band: [], warn: [], glass: [] };
  // (M6.18.8) a face wholly under the windscreen is left out: from the cab you look out through the glass
  const wsEdgeF = (t) => 1.95 + 0.62 * Math.pow(Math.max(0, (t - NOSE.windscreen[0]) / (NOSE.windscreen[1] - NOSE.windscreen[0])), 1.4);
  const underGlass = (q) => q.v.every((v) => { const t = (v[0] - x1) / L; return t >= NOSE.windscreen[0] && t <= NOSE.windscreen[1] && v[1] > wsEdgeF(t) + 0.02; });
  // (M6.18.11, Rhys: "the train's nose appears jaggedy from the inside") a face across the windscreen's
  // foot is cut along it, not kept or dropped whole: a clean edge where the hood meets the glass
  // (how far under the glass's foot a point is: before the glass starts, a steep wall - kept - so the
  // measure runs on without a jump; the crossing on an edge found by halving, the foot being a curve)
  const below = (v) => {
    const t = (v[0] - x1) / L, w0 = NOSE.windscreen[0];
    if (t > NOSE.windscreen[1]) return 1;
    return (t < w0 ? wsEdgeF(w0) + (w0 - t) * 100 : wsEdgeF(t)) - v[1];
  };
  const lerp3 = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
  const cross = (a, b) => { let lo = 0, hi = 1; const sa = below(a) >= 0; for (let k = 0; k < 24; k++) { const mid = (lo + hi) / 2; if ((below(lerp3(a, b, mid)) >= 0) === sa) lo = mid; else hi = mid; } return lerp3(a, b, sa ? lo : hi); };
  const clip = (vs) => {
    const out = [];
    for (let k = 0; k < vs.length; k++) {
      const a = vs[k], b = vs[(k + 1) % vs.length], fa = below(a), fb = below(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) out.push(cross(a, b));
    }
    return out;
  };
  for (const q of all) {
    if (underGlass(q)) continue;
    const vs = q.v.every((v) => below(v) >= 0) ? q.v : clip(q.v);
    if (vs.length < 3) continue;
    // (a cut face of 3-5 corners as quads: a fan from its first corner, a triangle its last corner twice)
    for (let k = 1; k + 1 < vs.length; k += 2) parts[part(q)].push({ v: [vs[0], vs[k], vs[k + 1], vs[Math.min(k + 2, vs.length - 1)]], n: q.n, cut: vs !== q.v });
  }
  // the red band, carried on from the coaches' sides and swept down the snout: a strip laid on the
  // surface where the section passes its height (each side)
  const zAt = (f, y) => { const u = Math.abs((y - f.mid) / f.hh); return u >= 1 ? null : f.w * Math.pow(1 - Math.pow(u, f.p), 1 / f.p) + 0.012; };
  for (const sg of [-1, 1]) for (let i = 0; i < 40; i++) {
    const ta = i / 40 * 0.7, tb = (i + 1) / 40 * 0.7, fa = NOSE.at(ta), fb = NOSE.at(tb);
    const lo = (t) => 1.55 - 0.75 * t * t, hi = (t) => 1.7 - 0.75 * t * t;
    const za0 = zAt(fa, lo(ta)), za1 = zAt(fa, hi(ta)), zb0 = zAt(fb, lo(tb)), zb1 = zAt(fb, hi(tb));
    if ([za0, za1, zb0, zb1].some((z) => z === null)) break;
    const v = [[x1 + ta * L, lo(ta), sg * za0], [x1 + tb * L, lo(tb), sg * zb0], [x1 + tb * L, hi(tb), sg * zb1], [x1 + ta * L, hi(ta), sg * za1]];
    parts.band.push({ v: sg > 0 ? v : v.slice().reverse(), n: [0, 0, sg] });
  }
  // the windscreen: laid over the top of the rake, its lower edge a smooth line rising towards the
  // front until it meets the roof (rings of the section's upper arc, above that line)
  const wsEdge = (t) => 1.95 + 0.62 * Math.pow(Math.max(0, (t - NOSE.windscreen[0]) / (NOSE.windscreen[1] - NOSE.windscreen[0])), 1.4);
  const arcs = [], amids = [];
  for (let i = 0; i <= 24; i++) {
    const t = NOSE.windscreen[0] + (NOSE.windscreen[1] - NOSE.windscreen[0]) * i / 24, f = NOSE.at(t), ye = wsEdge(t);
    if (ye >= f.top - 0.02) break;
    const u = Math.max(0, (ye - f.mid) / f.hh), aLo = Math.asin(Math.min(1, Math.pow(u, f.p / 2))), arc = [];
    for (let j = 0; j <= 16; j++) {
      const a = aLo + (Math.PI - 2 * aLo) * j / 16, [z, y] = sect(a, f.w * 1.006 + 0.004, f.mid, f.hh * 1.006 + 0.004, f.p);
      arc.push([x1 + t * L, y, z]);
    }
    arcs.push(arc); amids.push(f.mid);
  }
  for (const q of loftQuads(arcs, amids, true)) parts.glass.push({ v: q.v, n: q.n });
  // the windscreen dark from outside (and, its faces turned outwards, not there at all from inside: the cab sees out)
  // (M6.18.9, Rhys: "what's going on with the nose now?") the cab sits inside the nose's shell, so from it
  // the hood ahead was only ever seen from within - culled (M6.18.7), or drawn two-sided and dark, the
  // glass showing the hollow inside from without (M6.18.8). Now: the windscreen opaque and dark from
  // outside (its faces outwards: from inside, not there - the cab sees out); and the hood's top laid
  // again as an inner skin, its faces turned in but lit as the outside is - from the cab, the hood
  // (M6.18.10, Rhys: "the nose still looks weird from inside the driver's cab") through the cab's window you
  // looked down into the hollow shell - its sides culled from within - and saw the track under a hood that
  // floated. Now a deck at the window's sill closes it (the desk-top under the raked glass), and the shell's
  // walls above that deck are laid inside too: from the cab, the glass, the sides, and the hood beyond
  const inner = {};
  for (const k of ['body', 'band', 'warn']) inner[k] = parts[k].filter((q) => {
    const c = q.v.reduce((a, v) => [a[0] + v[0] / 4, a[1] + v[1] / 4, a[2] + v[2] / 4], [0, 0, 0]), t = (c[0] - x1) / L;
    return (t > NOSE.windscreen[0] && q.n[1] > 0.15) || (t < NOSE.deckTo && c[1] > NOSE.glass[0] - 0.05);
  }).map((q) => ({ v: q.v, n: q.n, inward: true }));
  const deck = [], D = NOSE.glass[0];
  for (let i = 0; i < 24; i++) {
    const ta = NOSE.deckTo * i / 24, tb = NOSE.deckTo * (i + 1) / 24, za = zAt(NOSE.at(ta), D), zb = zAt(NOSE.at(tb), D);
    if (za === null) break;
    const wa = Math.max(0, za - 0.03), wb = zb === null ? 0 : Math.max(0, zb - 0.03);
    deck.push({ v: [[x1 + ta * L, D, -wa], [x1 + ta * L, D, wa], [x1 + tb * L, D, wb], [x1 + tb * L, D, -wb]], n: [0, 1, 0] });
    if (zb === null) break;
  }
  if (deck.length) level.pieces.push(Object.assign({ quads: deck, mat: 'paint', uv: 'world', tint: [0.1, 0.1, 0.12], nosePart: 'deck' }, quadsBox(deck)));
  for (const [k, tint, mat] of [['body', body, 'paint'], ['band', red, 'paint'], ['warn', warn, 'paint'], ['glass', [0.03, 0.045, 0.07], 'paint']]) {
    if (parts[k].length) level.pieces.push(Object.assign({ quads: parts[k], mat, uv: 'world', tint, nosePart: k }, quadsBox(parts[k])));
    if (inner[k] && inner[k].length) level.pieces.push(Object.assign({ quads: inner[k], mat, uv: 'world', tint, nosePart: k + 'Inner' }, quadsBox(inner[k])));
  }
  // headlamps either side, low on the snout; a dark frame line under the windscreen
  for (const sg of [-1, 1]) {
    const t = 0.8, f = NOSE.at(t), [z, y] = sect(sg > 0 ? -0.35 : Math.PI + 0.35, f.w, f.mid, f.hh, f.p);
    box([x1 + t * L - 0.25, y - 0.06, z - 0.16], [x1 + t * L + 0.25, y + 0.06, z + 0.16], 'lamp', { solid: false });
  }
  // (M6.18.6, Rhys stood inside the nose and saw the cab's box) the nose is solid: steps of boxes
  // inside its shell, none of them drawn
  for (let i = 0; i < 12; i++) {
    const ta = i / 12, tb = (i + 1) / 12, f = NOSE.at(tb), fa = NOSE.at(ta);
    // (no higher than the windscreen's foot where it is: the cab still sees out over them)
    const top = Math.min(fa.top, tb <= NOSE.windscreen[1] + 0.1 ? 1.9 : fa.top);
    box([x1 + ta * L, f.bottom, -Math.max(f.w, 0.15)], [x1 + tb * L, top, Math.max(f.w, 0.15)], 'paint', { render: false, noClimb: true, tag: 'nose' });
  }
  level.nose = { x0: x1, x1: x1 + L, parts: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, v.length])) };
}

// The inside of each coach (seats, tables, the buffet counter, the van's cages)
function fitCarriage(c, box, level) {
  const H = CAR.half - CAR.wall, seat = [0.22, 0.3, 0.55], first = [0.55, 0.14, 0.16];
  const saloon = [c.x0 + 2.4, c.x1 - 2.4];
  // a vestibule partition at each end of a passenger coach, an open way through the middle
  if (c.id !== 'loco' && c.id !== 'van') for (const x of [c.x0 + 2.2, c.x1 - 2.2]) {
    box([x - 0.04, FLOOR, -H], [x + 0.04, CAR.ceil, -0.55], 'paint', { tint: [0.7, 0.7, 0.72] });
    box([x - 0.04, FLOOR, 0.55], [x + 0.04, CAR.ceil, H], 'paint', { tint: [0.7, 0.7, 0.72] });
  }
  const chair = (x, z0, z1, face, tint) => {
    // a seat: its base, and its back on the side it faces away from
    // (painted, not 'fabric': that cloth is red of itself, and tinted it came out brown)
    // (M6.18.9, Rhys: "you can easily end up running on top of the seats") a cushion just over a step
    // high, and nothing to climb: you walk the aisle, not along the seats
    box([x - 0.25, FLOOR, z0], [x + 0.25, FLOOR + 0.48, z1], 'paint', { tint, noClimb: true });
    const bx = face > 0 ? x - 0.32 : x + 0.22;
    box([bx, FLOOR, z0], [bx + 0.1, FLOOR + 1.12, z1], 'paint', { tint: tint.map((v) => v * 0.8), noClimb: true });
  };
  if (c.id === 'C' || c.id === 'D') {
    // standard: two and two, an aisle down the middle; a table bay in the middle of each half
    let k = 0;
    for (let x = saloon[0] + 0.5; x < saloon[1] - 0.3; x += 0.95, k++) {
      const face = k % 8 === 3 ? -1 : 1;
      for (const [z0, z1] of [[-H + 0.02, -0.45], [0.45, H - 0.02]]) chair(x, z0, z1, face, seat);
      // (M6.18.2) yours: a window seat in Coach 3, facing the way you go
      // (M6.18.5, Rhys: "you should sit in whichever available seat you're physically closest to") every
      // seat its own place: two each side of the aisle, window and aisle, facing the way its row faces
      for (const [zc, side, where] of [[-H + 0.25, 'port', 'window'], [-0.68, 'port', 'aisle'], [0.68, 'starboard', 'aisle'], [H - 0.25, 'starboard', 'window']]) {
        const seat = { coach: c.id, no: c.no, side, where, pos: [x - 0.08 * face, FLOOR, zc], back: [x, FLOOR, 0], yaw: face > 0 ? -Math.PI / 2 : Math.PI / 2, taken: false };
        level.seats.push(seat);
        if (c.id === 'C' && k === 5 && side === 'port' && where === 'window') level.yourSeat = seat;
      }
      if (k % 8 === 3) for (const [z0, z1] of [[-H + 0.05, -0.5], [0.5, H - 0.05]]) box([x + 0.32, FLOOR + 0.72, z0], [x + 0.62, FLOOR + 0.76, z1], 'wood', { solid: false });
    }
    // luggage racks over the seats
    for (const sgn of [-1, 1]) box([saloon[0], 2.75, sgn > 0 ? H - 0.45 : -H], [saloon[1], 2.78, sgn > 0 ? H : -H + 0.45], 'metal', { solid: false, tint: [0.6, 0.6, 0.62] });
  } else if (c.id === 'A') {
    // first class: one and two, bays of four round a table; a compartment at the front end
    for (let x = saloon[0] + 0.6; x < saloon[1] - 3.2; x += 2.2) {
      for (const [z0, z1] of [[-H + 0.02, -0.5], [0.6, H - 0.02]]) {
        chair(x, z0, z1, 1, first); chair(x + 1.5, z0, z1, -1, first);
        box([x + 0.45, FLOOR, (z0 + z1) / 2 - 0.05], [x + 1.05, FLOOR + 0.7, (z0 + z1) / 2 + 0.05], 'metal', { tint: [0.3, 0.3, 0.3] });
        box([x + 0.4, FLOOR + 0.72, z0 + 0.05], [x + 1.1, FLOOR + 0.77, z1 - 0.05], 'wood');
      }
    }
    level.firstClass = { x0: saloon[0], x1: saloon[1] };
  } else if (c.id === 'B') {
    // the buffet: the counter along one side, the urn and the till; leaning tables on the other
    const x0 = c.x0 + 6, x1 = c.x0 + 15;
    box([x0, FLOOR, -H], [x1, FLOOR + 1.05, -0.55], 'wood');
    box([x0, FLOOR + 1.05, -H], [x1, FLOOR + 1.1, -0.5], 'marble', { solid: false });
    box([x0 + 1, FLOOR + 1.1, -1.25], [x0 + 1.4, FLOOR + 1.6, -0.95], 'metal', { tint: [0.75, 0.75, 0.78] });
    box([x0 + 5, FLOOR + 1.1, -0.95], [x0 + 5.5, FLOOR + 1.35, -0.65], 'metal', { tint: [0.1, 0.1, 0.1] });
    box([x0, FLOOR, -H], [x1, CAR.ceil, -H + 0.05], 'wood', { solid: false });
    for (let x = c.x0 + 5; x < c.x1 - 4; x += 3) {
      box([x - 0.05, FLOOR, 0.9], [x + 0.05, FLOOR + 1.05, 1.0], 'metal', { tint: [0.3, 0.3, 0.3] });
      box([x - 0.45, FLOOR + 1.05, 0.65], [x + 0.45, FLOOR + 1.1, H - 0.02], 'wood');
    }
    level.buffet = { x0, x1 };
  } else if (c.id === 'van') {
    // the guard's van: cages of parcels, bicycles, the guard's desk
    for (let x = c.x0 + 2; x < c.x1 - 6; x += 4) {
      box([x, FLOOR, -H], [x + 2.6, FLOOR + 1.6, -0.6], 'parcel');
      box([x + 0.5, FLOOR, 0.7], [x + 2.2, FLOOR + 1.1, H], 'parcel');
    }
    box([c.x1 - 4, FLOOR, -H], [c.x1 - 2.5, FLOOR + 0.78, -0.7], 'wood');
  } else if (c.id === 'loco') {
    // the engine room, a narrow way past it on one side, and the cab at the front
    // (M6.18.1, Rhys: "I'd like to be able to see out of the front window too") the engine room
    // to one side, a way straight down the middle: from first class, through the cab door's
    // glass, along it and out of the windscreen over the nose
    box([c.x0 + 1.5, FLOOR, -H], [c.x1 - 4, 3.0, -0.6], 'metal', { tint: [0.25, 0.28, 0.3] });
    box([c.x0 + 1.5, FLOOR, 0.75], [c.x1 - 4, 3.0, H], 'metal', { tint: [0.25, 0.28, 0.3] });
    // (M6.18.11: the desk offered "SPACE Climb", and lay black in the dark cab, its dials adrift over it)
    box([c.x1 - 2.2, FLOOR, -H], [c.x1 - 1.4, FLOOR + 0.85, H], 'metal', { tint: [0.3, 0.32, 0.35], noClimb: true });
    box([c.x1 - 2.25, FLOOR + 0.85, -1.2], [c.x1 - 1.6, FLOOR + 0.9, 1.2], 'screen', { solid: false });
    // (M6.18.8, Rhys: "what are those blocks?") the traction equipment's cabinets: doors, handles,
    // their lamps, the warning plates; the cab's desk: its screens and dials, the driver's seat
    for (const sgn of [-1, 1]) {
      const zf = sgn < 0 ? -0.6 : 0.75, zo = zf + sgn * -0.012;
      for (let x = c.x0 + 1.7, k = 0; x < c.x1 - 4.4; x += 1.25, k++) {
        box([x, FLOOR + 0.15, Math.min(zf, zo)], [x + 1.1, 2.85, Math.max(zf, zo)], 'paint', { solid: false, tint: [0.32, 0.36, 0.38] });
        box([x + 0.9, FLOOR + 1.0, Math.min(zf, zo) - 0.03 * -sgn], [x + 0.95, FLOOR + 1.35, Math.max(zf, zo) + 0.03 * -sgn], 'metal', { solid: false, tint: [0.7, 0.7, 0.72] });
        box([x + 0.15, 2.5, Math.min(zf, zo) - 0.02 * -sgn], [x + 0.25, 2.58, Math.max(zf, zo) + 0.02 * -sgn], 'neon', { solid: false, tint: k % 3 ? [0.2, 0.9, 0.3] : [0.95, 0.5, 0.1] });
        if (k % 2 === 0) level.signs.push({ pos: [x + 0.55, 2.0, zf - sgn * 0.02], yaw: sgn < 0 ? 0 : Math.PI, w: 0.42, h: 0.26, text: '25 kV', sub: '', col: '#f2c14e' });
      }
    }
    box([c.x1 - 2.2, FLOOR + 0.9, -1.0], [c.x1 - 1.9, FLOOR + 1.05, -0.6], 'screen', { solid: false });
    box([c.x1 - 2.2, FLOOR + 0.9, 0.6], [c.x1 - 1.9, FLOOR + 1.05, 1.0], 'screen', { solid: false });
    for (const z of [-0.3, 0, 0.3]) box([c.x1 - 2.05, FLOOR + 0.9, z - 0.03], [c.x1 - 1.99, FLOOR + 0.912, z + 0.03], 'neon', { solid: false, tint: [0.3, 0.8, 1.0] });
    box([c.x1 - 2.6, FLOOR + 0.85, -0.06], [c.x1 - 2.5, FLOOR + 1.2, 0.06], 'metal', { solid: false, tint: [0.15, 0.15, 0.15] });
    box([c.x1 - 3.3, FLOOR, -0.3], [c.x1 - 2.75, FLOOR + 0.5, 0.3], 'paint', { tint: [0.15, 0.15, 0.17] });
    box([c.x1 - 3.4, FLOOR + 0.5, -0.3], [c.x1 - 3.3, FLOOR + 1.3, 0.3], 'paint', { solid: false, tint: [0.15, 0.15, 0.17] });
    level.cab = { x0: c.x1 - 4, x1: c.x1, controls: [c.x1 - 1.8, FLOOR, 0] };
  }
}

// The world outside, after the station: track (always), tunnel walls or country,
// in tiles that come round again. Each is a mover; a tile not in its section is
// put out of sight below the world.
// (M6.18.6) Belyagorsk - Alyejka Azvestya: built where it stands when the train has stopped in it
// (the train's own coordinates), drawn sliding in as you arrive (offset = how far still to go);
// solid only once you are in. Its platform on the doors' side; a canopy, lamps, its name; and
// along the platform, the armed police, waiting
function arrivalStation(level, run, world, cars) {
  const pieces = [], solids = [], H = CAR.half;
  const off = () => RUN.arrive - run.dist;
  const follow = () => { const o = off(); return [o, o > 2600 ? -1000 : 0, 0]; };
  const box = (min, max, mat, opts) => {
    opts = opts || {};
    pieces.push({ min, max, mat, uv: 'world', tint: opts.tint, unlit: opts.unlit || undefined });
    if (opts.solid !== false) { const sd = world.addSolid(min, max, 'station', { noClimb: true }); sd.disabled = true; solids.push(sd); }
  };
  const X0 = TRAIN_X0 - 18, X1 = cars[cars.length - 1].x1 + NOSE.len + 30, PZ = H + 0.15, PB = 11;
  // the platform, its edge, the yellow line
  box([X0, 0, PZ], [X1, FLOOR, PB], 'concrete2', { tint: [0.55, 0.53, 0.5] });
  box([X0, FLOOR, PZ + 0.5], [X1, FLOOR + 0.01, PZ + 0.62], 'paint', { solid: false, tint: [0.85, 0.7, 0.1] });
  // the canopy over it, on columns; its back wall with the station's windows
  box([X0, 6.2, PZ - 0.3], [X1, 6.5, PB + 0.4], 'metal', { solid: false, tint: [0.3, 0.32, 0.36] });
  for (let x = X0 + 6; x < X1; x += 14) box([x - 0.15, FLOOR, PB - 1.4], [x + 0.15, 6.2, PB - 1.1], 'metal', { tint: [0.2, 0.22, 0.25] });
  box([X0, 0, PB], [X1, 9, PB + 0.4], 'facade', {});
  // the other side of the line: a retaining wall, and the town above it
  box([X0, 0, -4.4], [X1, 3.2, -4.0], 'concrete', { solid: false, tint: [0.4, 0.38, 0.36] });
  for (let x = X0, j = 0; x < X1; j++) {
    const w = 14 + (j * 7) % 10, h = 10 + (j * 11) % 18;
    pieces.push({ min: [x, 0, -26], max: [x + w, h, -6], mat: 'facade', uv: 'world', unlit: true });
    x += w + 2;
  }
  for (let x = X0, j = 0; x < X1; j++) {
    const w = 16 + (j * 5) % 9, h = 12 + (j * 13) % 16;
    pieces.push({ min: [x, 0, PB + 0.4], max: [x + w, h, PB + 20], mat: 'facade', uv: 'world', unlit: true });
    x += w + 1;
  }
  // the ends of the platform: railings
  for (const x of [X0, X1]) box([x - 0.05, FLOOR, PZ], [x + 0.05, FLOOR + 1.1, PB], 'metal', { tint: [0.2, 0.2, 0.22] });
  // its name, along the canopy, and lamps under it
  // (M6.18.11, Rhys: "the signage at Belyagorsk Station is printed backwards" - seen from the train, its
  // back) every sign now has a true face on both sides (render.js); this one faces the train
  for (let x = X0 + 12; x < X1 - 6; x += 28) level.signs.push({ pos: [x, FLOOR + 3.1, PB - 1.25], yaw: Math.PI, w: 4.2, h: 0.7, text: TERMINUS.sev, sub: TERMINUS.en, col: '#f2c14e', follow, arrival: true });
  for (let x = X0 + 10; x < X1; x += 24) {
    pieces.push({ min: [x - 0.5, 6.1, 4.5], max: [x + 0.5, 6.2, 6.5], mat: 'lamp', uv: 'world' });
    level.lights.push({ pos: [x, 5.6, 5.5], range: 14, intensity: 1.0, color: [1, 0.9, 0.72], follow, arrival: true });
  }
  level.movers.push({ id: 'arrival', pieces, at: follow });
  level.arrivalSolids = solids;
  level.arrival = { x0: X0, x1: X1, z0: PZ, z1: PB };
  // the armed police: along the platform, by the coaches' doors, facing the train
  const doors = cars.filter((c) => c.id !== 'loco').flatMap((c) => doorSpans(c));
  doors.filter((_, i) => i % 2 === 0 || i === doors.length - 1).slice(0, 8).forEach((d, i) => {
    level.npcs.push({ id: 'police' + i, kind: 'police', title: 'Armed police', pos: [(d[0] + d[1]) / 2 + (i % 2 ? 1.2 : -1.2), FLOOR, 3.3 + (i % 3) * 0.5], yaw: 0,
      tint: [0.24, 0.34, 0.22], hat: 'cap', voice: 'st2', arrival: true, follow });   // (militia green: not Ghost's black, not the Front's grey)
  });
}

// (M6.18.7) the Front of Memory's six, aboard as passengers until the end of the city tunnel: two
// in the locomotive (one at the controls, one along the engine room), two in first class with the
// Minister (their officer at his side, one walking the aisle), one in the buffet, one in the van
// over its guard. Grey (Ghost is black). Till then not there at all (`dormant`).
// The Minister, Tamash Dravets, in first class's front bay; the train's guard in the van, with a
// sidearm he will part with once he has seen you take one of them down.
function hijackers(level, world, cars) {
  const C = Object.fromEntries(cars.map((c) => [c.id, c]));
  const A = C.A, B = C.B, L = C.loco, V = C.van, Z = 0.05;
  const back = Math.PI / 2, fwd = -Math.PI / 2;     // facing the rear (-x), facing forward (+x)
  const defs = [
    { id: 'fm_cab', pos: [L.x1 - 3.0, FLOOR, 0.85], yaw: fwd, arms: 'smg', rank: 'guard' },
    { id: 'fm_engine', pos: [L.x0 + 1.2, FLOOR, Z], yaw: back, arms: 'pistol', rank: 'guard', route: [[L.x0 + 1.2, Z], [L.x1 - 4.4, Z]] },
    { id: 'fm_officer', pos: [A.x0 + 17.0, FLOOR, Z], yaw: back, arms: 'smg', rank: 'officer', holds: true },
    { id: 'fm_first', pos: [A.x0 + 3.2, FLOOR, Z], yaw: fwd, arms: 'carbine', rank: 'guard', holds: true, route: [[A.x0 + 3.2, Z], [A.x0 + 15.2, Z]] },
    { id: 'fm_buffet', pos: [B.x0 + 3.0, FLOOR, Z], yaw: fwd, arms: 'shotgun', rank: 'guard', route: [[B.x0 + 3.0, Z], [B.x1 - 3.0, Z]] },
    { id: 'fm_van', pos: [V.x0 + 2.6, FLOOR, Z], yaw: back, arms: 'pistol', rank: 'guard' },
  ];
  level.hijackers = defs.map((d) => {
    // (M6.18.9) the two over the Minister hold their ground: they do not go running to every shout
    const g = new Guard(world, { id: d.id, pos: d.pos, yaw: d.yaw, route: d.route || null, faction: 'red', rank: d.rank, arms: d.arms, temper: d.holds ? 'steady' : 'bold' });
    g.side = 'front'; g.title = 'Front of Memory'; g.holds = !!d.holds;
    g.dormant = true; g.target.solid.disabled = true;
    level.guards.push(g);
    return g;
  });
  // (M6.18.8, Rhys: "then he becomes your fighting ally") the guard, as a fighting man: there once he joins you
  const ally = new Guard(world, { id: 'ally_guard', pos: [V.x0 + 1.0, FLOOR, -0.05], yaw: fwd, faction: 'ally', rank: 'guard', arms: 'carbine', temper: 'bold' });
  ally.side = 'ally'; ally.title = 'The train\'s guard'; ally.dormant = true; ally.target.solid.disabled = true; ally.objective = false;
  level.guards.push(ally);
  level.allyGuard = ally;
  level.hijack = { done: false, minister: 'alive', fuse: 0, trust: false, gave: false, joined: false, since: 0, called: false, rest: 0, skipped: false };
  // the Minister, in the front bay, facing back down the coach; and the guard, at the back of his van
  // (M6.18.11, Rhys: "the Minister needs to sit down in his seat") in it: the bay's rear-facing seat (A.x0 +
  // 17.7, its cushion FLOOR + 0.48), his feet SEAT.feet in front of it, under the table
  level.npcs.push({ id: 'minister', kind: 'minister', title: 'Minister Dravets', pos: [A.x0 + 17.7 - 0.32, FLOOR, -0.93], yaw: back, tint: [1.15, 1.05, 0.85], onTrain: true, sitting: true });
  // (M6.18.8, Rhys: "there's no-one to sell the food in the buffet car") its steward, at the counter's end
  level.npcs.push({ id: 'steward', kind: 'steward', title: 'Buffet', pos: [B.x0 + 15.7, FLOOR, -0.95], yaw: 0, tint: [1.3, 1.28, 1.25], voice: 'st6', onTrain: true });
  level.npcs.push({ id: 'trainguard', kind: 'trainguard', title: 'The train\'s guard', pos: [V.x0 + 1.0, FLOOR, -0.05], yaw: fwd, tint: [0.45, 0.6, 1.35], hat: 'cap', voice: 'st4', onTrain: true });
}

function streamTiles(level, run) {
  const kinds = [
    { kind: 'track', L: 40, n: 12, back: 160, pieces: trackTile(40) },
    { kind: 'tunnel', L: 30, n: 14, back: 140, pieces: tunnelTile(30) },
    { kind: 'country', L: 120, n: 6, back: 300, pieces: countryTile(120) },
  ];
  level.tiles = kinds;
  for (const t of kinds) {
    for (let i = 0; i < t.n; i++) {
      level.movers.push({ id: t.kind + i, pieces: t.pieces, at: () => {
        const base = Math.floor((run.dist - t.back) / t.L) + i, s = base * t.L, x = s - run.dist;
        // the track is everywhere past the station's own; the rest only in its section
        const show = s > 120 && (t.kind === 'track' || sectionAt(s) === t.kind || sectionAt(s + t.L) === t.kind) && run.moving;
        return show ? [x, 0, 0] : [x, -500, 0];
      } });
    }
  }
}
function trackTile(L) {
  const p = [];
  for (const dz of [-0.72, 0.72]) p.push({ min: [0, 0.15, dz - 0.04], max: [L, 0.3, dz + 0.04], mat: 'metal', uv: 'world', tint: [0.45, 0.42, 0.4] });
  for (let x = 0.3; x < L; x += 0.65) p.push({ min: [x, 0.05, -1.25], max: [x + 0.22, 0.15, 1.25], mat: 'wood', uv: 'world', tint: [0.3, 0.25, 0.2] });
  p.push({ min: [0, -0.2, -2.2], max: [L, 0.05, 2.2], mat: 'concrete2', uv: 'world', tint: [0.35, 0.33, 0.3] });
  return p;
}
function tunnelTile(L) {
  const p = [];
  for (const sgn of [-1, 1]) p.push({ min: [0, -0.2, sgn > 0 ? 3.0 : -3.4], max: [L, 5.2, sgn > 0 ? 3.4 : -3.0], mat: 'concrete', uv: 'world', tint: [0.32, 0.3, 0.28] });
  p.push({ min: [0, 5.2, -3.4], max: [L, 5.6, 3.4], mat: 'concrete', uv: 'world', tint: [0.25, 0.24, 0.22] });
  // a lamp on each wall, and cables along it: what you see flash past
  for (const sgn of [-1, 1]) {
    p.push({ min: [L * 0.3, 3.4, sgn > 0 ? 2.9 : -3.0], max: [L * 0.3 + 0.5, 3.6, sgn > 0 ? 3.0 : -2.9], mat: 'lamp', uv: 'world' });
    p.push({ min: [0, 2.2, sgn > 0 ? 2.95 : -3.0], max: [L, 2.26, sgn > 0 ? 3.0 : -2.95], mat: 'metal', uv: 'world', tint: [0.1, 0.1, 0.1] });
  }
  return p;
}
function countryTile(L) {
  const p = [];
  // the ground either side, a fence, telegraph poles, trees, and far off the lit windows of a village
  p.push({ min: [0, -0.4, -60], max: [L, -0.1, -2.2], mat: 'lawn', uv: 'world', tint: [0.25, 0.3, 0.22] });
  p.push({ min: [0, -0.4, 2.2], max: [L, -0.1, 60], mat: 'lawn', uv: 'world', tint: [0.25, 0.3, 0.22] });
  for (let x = 10; x < L; x += 40) {
    p.push({ min: [x, -0.1, 4.6], max: [x + 0.25, 7.5, 4.85], mat: 'wood', uv: 'world', tint: [0.25, 0.2, 0.15] });
    p.push({ min: [x - 0.6, 7.0, 4.6], max: [x + 0.85, 7.15, 4.85], mat: 'wood', uv: 'world', tint: [0.25, 0.2, 0.15] });
  }
  for (const [x, z, h] of [[18, -9, 6], [47, -14, 8], [71, 12, 7], [96, -7, 5], [104, 21, 9], [30, 26, 6]]) {
    p.push({ min: [x - 0.2, -0.1, z - 0.2], max: [x + 0.2, h * 0.4, z + 0.2], mat: 'wood', uv: 'world', tint: [0.2, 0.15, 0.1] });
    p.push({ min: [x - 1.6, h * 0.35, z - 1.6], max: [x + 1.6, h, z + 1.6], mat: 'hedge', uv: 'world' });
  }
  for (const [x, z] of [[25, -45], [33, -47], [60, -42], [85, 48], [92, 44], [10, 52]]) {
    p.push({ min: [x - 3, -0.1, z - 2], max: [x + 3, 4.5, z + 2], mat: 'paint', uv: 'world', tint: [0.12, 0.11, 0.1] });
    p.push({ min: [x - 1.2, 1.8, z + (z > 0 ? -2.05 : 2.0)], max: [x - 0.4, 2.6, z + (z > 0 ? -2.0 : 2.05)], mat: 'lamp', uv: 'world' });
    p.push({ min: [x + 0.6, 1.8, z + (z > 0 ? -2.05 : 2.0)], max: [x + 1.4, 2.6, z + (z > 0 ? -2.0 : 2.05)], mat: 'lamp', uv: 'world' });
  }
  return p;
}
