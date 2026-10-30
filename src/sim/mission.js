// FRONTLINE - a mission: objectives, what you have found, how it ended.
// Pure logic. The level says where things are; this says what they mean.

export const DOWNLOAD_TIME = 4;       // seconds of holding E at the terminal
export const SLOWMO = { scale: 0.25, seconds: 1.5 };   // a successful breach

// how likely a kick is to open a door (a reinforced door never gives)
export const KICK = { domestic: 0.8, sturdy: 0.45, reinforced: 0 };

export class Mission {
  constructor(def) {
    this.def = def;
    this.keycard = false;
    this.file = 0;                    // 0..1, how much is downloaded
    this.fileDone = false;
    this.done = false;
    this.kills = 0;
    this.knockouts = 0;
    this.spotted = 0;              // how many times a guard saw you properly
    this.headshots = 0;            // kills that were headshots
    this.seenBeforeFile = null;    // had anyone seen you by the time the file was yours?
    this.guardCount = (def && def.guards) || 0;
    // for the debrief: how you shot, and with what
    this.shotsFired = 0; this.shotsHit = 0; this.takedowns = 0;
    this.byWeapon = {};            // id -> { shots, hits, downs }
    this.result = null;            // 'success' | 'failed'
    this.failure = null;           // why, if it failed
    this.time = 0;
    this.breaches = 0;
    this.seenHints = new Set();
    this.events = [];
  }

  // the line at the top of the screen
  get objective() {
    if (this.done) return 'Mission complete';
    if (this.fileDone) return 'Get out: back to the van';
    if (this.file > 0) return 'Downloading the file... stay at the terminal';
    return 'Retrieve the file from the private-network computer';
  }

  update(dt) { if (!this.done) this.time += dt; }

  takeKeycard() {
    if (this.keycard) return false;
    this.keycard = true;
    this.events.push({ type: 'keycard' });
    return true;
  }

  // hold E at the terminal: progress while held, nothing lost if you let go
  download(dt) {
    if (this.fileDone) return;
    this.file = Math.min(1, this.file + dt / DOWNLOAD_TIME);
    if (this.file >= 1) { this.fileDone = true; this.seenBeforeFile = this.spotted > 0; this.events.push({ type: 'file' }); }
  }

  // knocked out (fists, a pistol-whip, a rifle butt) is not a casualty
  guardDown(guard) {
    if (guard.knockedOut) { this.knockouts++; this.events.push({ type: 'knockout', id: guard.id }); }
    else {
      this.kills++;
      if (guard.target && guard.target.headshot) this.headshots++;
      this.events.push({ type: 'kill', id: guard.id });
    }
  }

  // a round fired, and whether it hit anyone (the debrief's accuracy)
  shot(weapon, hit) {
    this.shotsFired++; if (hit) this.shotsHit++;
    const w = this.byWeapon[weapon] = this.byWeapon[weapon] || { shots: 0, hits: 0, downs: 0 };
    w.shots++; if (hit) w.hits++;
  }
  // a guard put down with this weapon ('hands' and 'knife' for takedowns)
  downedWith(weapon) {
    const w = this.byWeapon[weapon] = this.byWeapon[weapon] || { shots: 0, hits: 0, downs: 0 };
    w.downs++;
  }
  get accuracy() { return this.shotsFired ? this.shotsHit / this.shotsFired : null; }
  // the weapon that put most people down; failing that, the one fired most
  get favourite() {
    let best = null, score = 0;
    for (const [id, w] of Object.entries(this.byWeapon)) {
      const sc = w.downs * 1000 + w.shots;
      if (sc > score) { score = sc; best = id; }
    }
    return best;
  }
  fail(why) {
    if (this.done) return false;
    this.done = true; this.result = 'failed'; this.failure = why;
    this.events.push({ type: 'failed', why });
    return true;
  }

  // back at the van with the file
  extract() {
    if (!this.fileDone || this.done) return false;
    this.done = true; this.result = 'success';
    this.events.push({ type: 'complete' });
    return true;
  }

  // Hidden achievements: only ever shown once earned
  trophies() {
    const out = [];
    if (!this.done || this.result !== 'success') return out;      // no trophies for a failed run
    if (this.kills === 0) out.push({ id: 'no_casualties', name: 'No Casualties', about: 'Completed the training mission without killing anyone.' });
    // (Rhys, M6.3.3) - "seen" means a guard made you out properly (red);
    // a guard wondering (amber) does not count
    if (this.seenBeforeFile === false) out.push({ id: 'unseen', name: 'Unseen', about: 'Downloaded the file without a single guard ever seeing you.' });
    if (this.guardCount > 0 && this.kills + this.knockouts >= this.guardCount) out.push({ id: 'no_witnesses', name: 'No Witnesses', about: 'Every guard in the building killed or taken down.' });
    if (this.kills > 0 && this.headshots === this.kills) out.push({ id: 'sharpshooter', name: 'Sharpshooter', about: 'Every kill a headshot.' });
    // (Rhys, M6.7.1) file and out the door within five minutes; kills irrelevant
    if (this.time < 300) out.push({ id: 'quick_work', name: 'Quick Work', about: 'Completed the training mission in under five minutes.' });
    // (knocking people out is allowed: unconscious is not a casualty)
    return out;
  }

  // a hint shows once, the first time you reach its place
  hint(id) {
    if (this.seenHints.has(id)) return false;
    this.seenHints.add(id);
    return true;
  }
}

// Kicking a door: roll (0..1, passed in so tests can decide) against the door's build.
export function kickOpens(door, roll) {
  const p = KICK[door.def.build || 'domestic'];
  return roll < p;
}

// ── The Riverside Hotel's trophies (M6.12.0, Rhys: at least one a mission;
// keep a headshots one and a time one everywhere there is more than one
// enemy; a pacifist run; "unseen" does not fit here - you have to be seen).
// hostages: [{ state, unhurt, rodeLift, wentSewer }]. (Pure.)
export const HOTEL_PAR = 600;          // ten minutes
export function hotelTrophies(m, hostages, guardCount) {
  const out = [];
  // (M6.13.8) a mission complete with losses earns them too - not a failed one
  if (!m.done || (m.result !== 'success' && m.result !== 'partial')) return out;
  const safe = (hostages || []).filter((h) => h.state === 'rescued');
  const allOut = safe.length && safe.length === (hostages || []).length;
  if (m.kills > 1 && m.headshots === m.kills) out.push({ id: 'hotel_sharpshooter', name: 'Sharpshooter: Riverside', about: 'Every kill at the Riverside Hotel a headshot.' });
  if (allOut && m.time < HOTEL_PAR) out.push({ id: 'hotel_quick', name: 'Swift Extraction', about: 'All the hostages out and back to the Ghost jeep in under ten minutes.' });
  if (m.kills === 0) out.push({ id: 'hotel_pacifist', name: 'Pacifist', about: 'The Riverside Hotel without a single casualty - takedowns only.' });
  if (safe.length && safe.length === (hostages || []).length && safe.every((h) => h.unhurt)) out.push({ id: 'hotel_unhurt', name: 'Not a Scratch', about: 'Every hostage brought out without a scratch on them.' });
  // (M6.12.1, Rhys: seven is a lot for one mission) four: headshots, time,
  // pacifist, and the hostages. Going Down (the lift), Down the Drain (the
  // sewer) and Clean Sweep are retired - kept here in case they come back:
  //   rodeLift / wentSewer on each hostage; kills + knockouts >= guardCount
  void guardCount;
  return out;
}

// (M6.13.6, Rhys: "Accolades probably need to be on a 'page 2' of the
// post-mission debriefs") The debrief's first page is how it went; trophies
// and accolades are a page of their own. The button that turns to it, from
// what was earned (all) and which of those are new (fresh ids): null if there
// is nothing to show, so there is no second page at all.
export function awardsButton(all, fresh) {
  const n = (all || []).length;
  if (!n) return null;
  const k = (all || []).filter((x) => fresh && fresh.has(x.id)).length;
  return 'Trophies & accolades (' + n + ')' + (k ? ' — ' + k + ' new' : '') + '  ›';
}

// ── The Derelict Factory's trophies (M6.14.0; Rhys's Info tab: No Casualties,
// Unseen, No Witnesses, Sharpshooter - "No Witnesses" is the objective itself,
// so three). On a mission complete, with losses or not - never a failed one.
// (M6.15.0) the same three for any place you clear: id 'factory', name 'Factory', place 'the Derelict Factory', one 'yellow'
export function clearTrophies(m, guards, id, name, place, one) {
  const out = [];
  if (!m.done || (m.result !== 'success' && m.result !== 'partial')) return out;
  const all = (guards || []).length > 0 && guards.every((g) => g.dead);
  if (all && m.kills === 0) out.push({ id: id + '_no_casualties', name: 'No Casualties: ' + name, about: 'Every ' + one + ' in ' + place + ' knocked out - not one killed.' });
  if (all && m.spotted === 0) out.push({ id: id + '_unseen', name: 'Unseen: ' + name, about: place[0].toUpperCase() + place.slice(1) + ' cleared without a ' + one + ' ever seeing you.' });
  if (m.kills > 1 && m.headshots === m.kills) out.push({ id: id + '_sharpshooter', name: 'Sharpshooter: ' + name, about: 'Every kill in ' + place + ' a headshot.' });
  return out;
}
export const factoryTrophies = (m, guards) => clearTrophies(m, guards, 'factory', 'Factory', 'the Derelict Factory', 'yellow');
// (M6.17.11, Rhys: clearing the reds out "no longer essential - can be a Trophy again")
export const casinoTrophies = (m, guards) => {     // guards: the reds only
  const out = clearTrophies(m, guards, 'casino', 'Casino', 'the Casino', 'red');
  if (m.done && (m.result === 'success' || m.result === 'partial')) {
    if ((guards || []).length && guards.every((g) => g.dead)) out.unshift({ id: 'casino_clean_sweep', name: 'Clean Sweep: Casino', about: 'Every red in the Casino down - killed or knocked out.' });
  }
  return out;
};
