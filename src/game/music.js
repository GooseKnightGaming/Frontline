// FRONTLINE - music.
//
// Tracks are streamed, not bundled: nothing is fetched until it is wanted, so
// starting the game does not wait on a download. One track plays at a time and
// the changeover is a fade, so it never cuts.

// Rhys's notes on each piece decided where it sits.
export const TRACKS = {
  title:   { file: 'Black_Vortex.mp3',           name: 'Black Vortex' },           // title: deep and epic
  opening: { file: 'Burn_The_World_Waltz_.mp3',  name: 'Burn The World Waltz' },   // quieter opening theme
  course:  { file: 'Breakdown.mp3',              name: 'Breakdown' },              // learning to move
  range:   { file: 'Ready_Aim_Fire.mp3',         name: 'Ready Aim Fire' },         // amped-up agent
  yard:    { file: 'Iron_Bacon.mp3',             name: 'Iron Bacon' },             // knocking about
  tension: { file: 'Failing_Defense.mp3',        name: 'Failing Defense' },        // something is wrong
  action:  { file: 'Five_Armies.mp3',            name: 'Five Armies' },            // a real fight
  chase:   { file: 'Movement_Proposition.mp3',   name: 'Movement Proposition' },   // do not let him get away
  brief:   { file: 'Black_Vortex.mp3',           name: 'Black Vortex' },           // briefings
  complex: { file: 'The_Complex.mp3',            name: 'The Complex' },            // that facility
  battle:  { file: 'Mechanolith.mp3',            name: 'Mechanolith' },            // major battle
  loop:    { file: 'Zap_Beat.mp3',               name: 'Zap Beat' },               // simple loop
  down:    { file: 'Hero_Down.mp3',              name: 'Hero Down' },              // death, and the credits
};
// every one of these is by Kevin MacLeod (incompetech.com), CC BY 4.0
export const CREDIT = 'Music by Kevin MacLeod (incompetech.com), licensed CC BY 4.0';

export class Music {
  constructor(settings, base) {
    this.settings = settings || {};
    this.base = base || 'assets/music/';
    this.players = {};
    this.now = null;
    this.failed = false;
  }
  get volume() { return this.settings.music === undefined ? 0.35 : this.settings.music; }
  setVolume(v) {
    this.settings.music = v;
    if (this.now && this.players[this.now]) this.players[this.now].volume = v;
  }
  player(key) {
    if (this.players[key]) return this.players[key];
    const t = TRACKS[key];
    if (!t) return null;
    try {
      const a = new window.Audio(this.base + t.file);
      a.loop = true;
      a.preload = 'none';
      a.volume = 0;
      this.players[key] = a;
      return a;
    } catch (e) { this.failed = true; return null; }
  }
  // Fade to a track. Calling it with what is already playing does nothing.
  play(key) {
    if (this.failed || key === this.now) return;
    const next = key ? this.player(key) : null;
    const prev = this.now ? this.players[this.now] : null;
    this.now = key || null;
    if (prev) this.fade(prev, 0, 900, true);
    if (next) {
      next.volume = 0;
      const go = next.play();
      if (go && go.catch) go.catch(() => { /* the browser wants a click first */ });
      this.fade(next, this.volume, 1200, false);
    }
  }
  stop() { this.play(null); }
  fade(el, to, ms, stopAtEnd) {
    const from = el.volume, start = Date.now();
    clearInterval(el._fade);
    el._fade = setInterval(() => {
      const k = Math.min(1, (Date.now() - start) / ms);
      el.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k >= 1) {
        clearInterval(el._fade);
        if (stopAtEnd) { try { el.pause(); el.currentTime = 0; } catch (e) { /* ignore */ } }
      }
    }, 60);
  }
}

// Which track suits the situation. Kept separate so it can be tested.
export function pickTrack(state) {
  if (!state.playing) return 'title';
  if (state.dead) return 'down';
  if (state.underFire) return 'action';
  if (state.section === 'weapons') return 'range';
  if (state.section === 'movement') return 'course';
  if (state.alerted) return 'tension';
  return 'yard';
}
