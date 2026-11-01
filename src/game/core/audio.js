// FRONTLINE - sound, made in code.
//
// Nothing is downloaded: every sound is built from noise and tones at the
// moment it plays, so a suppressed weapon really is a different sound rather
// than a second recording, and a big room can be given a longer tail later.

// Recorded effects (Kenney, "Impact Sounds" and "RPG Audio", CC0), played
// where they exist; the synthesised sound stays as the fallback until they
// load, or if they never do.
const n5 = (k) => ['000', '001', '002', '003', '004'].map((i) => k + '_' + i + '.ogg');
const n3 = (k) => ['000', '001', '002'].map((i) => k + '_' + i + '.ogg');
export const SFX = {
  step_concrete: n5('footstep_concrete'), step_carpet: n5('footstep_carpet'), step_wood: n5('footstep_wood'),
  punch: n3('impactPunch_heavy'), flesh: n3('impactSoft_medium'),
  hit_metal: n3('impactMetal_light'), hit_glass: n3('impactGlass_light'), hit_wood: n3('impactWood_light'), hit_generic: n3('impactGeneric_light'),
  knife: ['knifeSlice.ogg', 'knifeSlice2.ogg'], draw_knife: ['drawKnife1.ogg', 'drawKnife2.ogg'],
  door_open: ['doorOpen_1.ogg', 'doorOpen_2.ogg'],
};

// seconds of near-silence at the head of a sound (below -40 dB)
export function leadingSilence(buf, threshold) {
  const th = threshold || 0.01, rate = buf.sampleRate, n = buf.length;
  let first = n;
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < Math.min(first, n); i++) if (Math.abs(d[i]) > th) { first = i; break; }
  }
  return first >= n ? 0 : first / rate;
}

export class Audio {
  constructor(settings) {
    this.settings = settings || {};
    this.ctx = null;
    this.ready = false;
    this.lastStep = 0;
  }
  // browsers only allow sound after the person has clicked something
  start() {
    if (this.failed) return;
    try {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { this.failed = true; return; }
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
      // a little room on everything, so shots do not sound like a click
      this.verb = this.ctx.createConvolver();
      this.verb.buffer = this.makeRoom(1.1, 2.6);
      this.verbGain = this.ctx.createGain();
      this.verbGain.gain.value = 0.28;
      this.verb.connect(this.verbGain);
      this.verbGain.connect(this.master);
      this.ready = true;
      // the water was recorded; everything else is made here
      this.loadSample('splash', 'assets/sfx/watersplash2.mp3');
      for (const list of Object.values(SFX)) for (const f of list) this.loadSample('sfx_' + f, 'assets/sfx/' + f);
      this.loadSample('swim1', 'assets/sfx/swimstroke1.mp3');
      this.loadSample('swim2', 'assets/sfx/swimstroke2.mp3');
    } catch (e) {
      // no audio device (or the browser refuses): the game plays on in silence
      this.failed = true; this.ready = false; this.ctx = null;
    }
  }
  get volume() { return this.settings.volume === undefined ? 0.7 : this.settings.volume; }
  setVolume(v) { this.settings.volume = v; if (this.master) this.master.gain.value = v; }

  // ── recorded sounds ──────────────────────────────────────────────────────
  // Some things are better recorded than synthesised. A sample is fetched once,
  // and anything that wants it before it arrives falls back to the made-up one.
  loadSample(name, url) {
    if (!this.ready || this.samples && this.samples[name] !== undefined) return;
    this.samples = this.samples || {};
    this.samples[name] = null;
    fetch(url).then((r) => r.arrayBuffer())
      .then((b) => this.ctx.decodeAudioData(b))
      .then((buf) => { this.samples[name] = buf; this.leads = this.leads || {}; this.leads[name] = leadingSilence(buf); })
      .catch(() => { this.samples[name] = false; });
  }
  hasSample(name) { return !!(this.samples && this.samples[name]); }
  playSample(name, o) {
    o = o || {};
    if (!this.hasSample(name)) return false;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.samples[name];
    src.playbackRate.value = o.rate || 1;
    const gain = this.ctx.createGain();
    gain.gain.value = o.gain === undefined ? 0.6 : o.gain;
    src.connect(gain); gain.connect(this.master);
    if (o.room !== false) gain.connect(this.verb);
    // (Rhys: "a noticeable delay between text appearing on screen and
    // the corresponding audio") the recordings open with up to half a second of
    // nothing: start where the sound starts
    src.start(t, Math.max(0, ((this.leads && this.leads[name]) || 0) - 0.02));
    return true;
  }

  // ── building blocks ──────────────────────────────────────────────────────
  makeRoom(seconds, decay) {
    const rate = this.ctx.sampleRate, len = Math.floor(rate * seconds);
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  noise(seconds) {
    const rate = this.ctx.sampleRate, len = Math.max(1, Math.floor(rate * seconds));
    const buf = this.ctx.createBuffer(1, len, rate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  // one burst of filtered noise
  burst(o) {
    if (!this.ready) return;
    const t = this.ctx.currentTime + (o.delay || 0);
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise(o.length);
    const filt = this.ctx.createBiquadFilter();
    filt.type = o.type || 'bandpass';
    filt.frequency.setValueAtTime(o.from, t);
    if (o.to) filt.frequency.exponentialRampToValueAtTime(Math.max(40, o.to), t + o.length);
    filt.Q.value = o.q === undefined ? 1 : o.q;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain), t + (o.attack || 0.004));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + o.length);
    src.connect(filt); filt.connect(gain); gain.connect(this.master);
    if (o.room !== false) gain.connect(this.verb);
    src.start(t); src.stop(t + o.length + 0.02);
  }
  // one tone, optionally sliding
  tone(o) {
    if (!this.ready) return;
    const t = this.ctx.currentTime + (o.delay || 0);
    const osc = this.ctx.createOscillator();
    osc.type = o.wave || 'sine';
    osc.frequency.setValueAtTime(o.from, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + o.length);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain), t + (o.attack || 0.006));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + o.length);
    osc.connect(gain); gain.connect(this.master);
    if (o.room) gain.connect(this.verb);
    osc.start(t); osc.stop(t + o.length + 0.02);
  }

  // ── the game's sounds ────────────────────────────────────────────────────
  // A gun: a crack, a body, and a tail. Suppressed, the crack goes and what is
  // left is the action working.
  // far: 0..1, how loud it arrives (someone else's gun across a room)
  shot(w, far) {
    const quiet = w && w.quiet !== undefined ? w.quiet : 1;
    // a laser: no bang - a short electric whine, a little higher for the pistol
    if (w && w.energy) {
      const g = 0.05 * (far === undefined ? 1 : far);
      this.tone({ wave: 'sawtooth', from: w.size === 'backup' ? 1500 : 1100, to: w.size === 'backup' ? 1300 : 900, length: 0.09, gain: g, room: false });
      return;
    }
    // each sidearm its own voice: the compact's snap, the service pistol's bark
    const big = w && w.revolver ? 1.25 : w && w.family === 'sniper' ? 1.35 : w && w.family === 'smg' ? 0.72 : w && w.family === 'pistol' ? (w.burst ? 0.62 : (w.damage || 0) >= 28 ? 0.95 : 0.8) : 1;
    // (Rhys: the Revolver not "revolvery") a boom with a ring to it, and the cylinder turning
    if (w && w.revolver && (w.quiet === undefined || w.quiet > 0.6)) {
      this.burst({ length: 0.22, from: 420, to: 90, gain: 0.5, q: 0.7, delay: 0.004 });
      this.tone({ wave: 'triangle', from: 1900, to: 1700, length: 0.18, gain: 0.04, delay: 0.01, room: true });
      this.burst({ length: 0.03, from: 3200, gain: 0.08, q: 4, delay: 0.16, room: false });
    }
    const g = 0.55 * big * (0.35 + quiet * 0.65) * (far === undefined ? 1 : far);
    if (quiet > 0.6) {
      // the crack: very short, very bright, and gone
      this.burst({ length: 0.012, from: 9000, to: 5000, gain: g * 1.25, q: 0.4, attack: 0.0008, room: false });
      this.burst({ length: 0.05, from: 5200, to: 1500, gain: g * 0.9, q: 0.5, attack: 0.001 });
      // and the report behind it, brief so it does not thud
      this.burst({ length: 0.09 * big, from: 900, to: 260, gain: g * 0.55, q: 0.9, delay: 0.006 });
    } else {
      this.burst({ length: 0.09 * big, from: 700, to: 220, gain: g * 0.5, q: 1, delay: 0.004 });
    }
    if (quiet > 0.6) this.tone({ wave: 'triangle', from: 150 * big, to: 60, length: 0.1, gain: g * 0.22, delay: 0.006, room: true });
    if (quiet <= 0.6) {
      // the suppressed sound: a dull thump and the working parts
      this.burst({ length: 0.07 * big, from: 900 / big, to: 300 / big, gain: 0.16, q: 1 });
      this.burst({ length: 0.05, from: 5200, gain: 0.05, q: 2, delay: 0.05 });
    }
  }
  roundIn() { this.burst({ length: 0.035, from: 2800, gain: 0.12, q: 3, room: false }); this.burst({ length: 0.02, from: 1400, gain: 0.08, q: 2, delay: 0.05, room: false }); }
  dryFire() { this.burst({ length: 0.03, from: 2600, gain: 0.12, q: 3, room: false }); }
  reload(stage) {
    if (stage === 'start') {
      this.burst({ length: 0.05, from: 1500, gain: 0.14, q: 2 });
      this.burst({ length: 0.06, from: 700, gain: 0.12, q: 2, delay: 0.22 });
    } else {
      this.burst({ length: 0.07, from: 1100, gain: 0.16, q: 2 });
      this.burst({ length: 0.05, from: 2400, gain: 0.12, q: 3, delay: 0.12 });
    }
  }
  bash() { this.burst({ length: 0.12, from: 600, to: 180, gain: 0.3, q: 1.2 }); }
  hitFlesh() { if (!this.sfx('flesh', 0.55)) this.burst({ length: 0.09, from: 420, to: 140, gain: 0.25, q: 1 }); }
  // a recorded effect, one of its takes at random, slightly varied in pitch;
  // false if it has not loaded (so the caller can synthesise instead)
  sfx(kind, gain, o) {
    const list = SFX[kind];
    if (!list || !this.ready) return false;
    const f = list[Math.floor(Math.random() * list.length)];
    return this.playSample('sfx_' + f, Object.assign({ gain, rate: 0.94 + Math.random() * 0.12 }, o || {}));
  }
  // a round striking something: surface 'metal', 'glass', 'wood' or anything else
  hitHard(dist, surface) {
    const d = Math.max(0.15, 1 - (dist || 0) / 90);
    if (this.sfx('hit_' + (surface || 'generic'), 0.5 * d) || this.sfx('hit_generic', 0.5 * d)) return;
    this.burst({ length: 0.07, from: 2600, to: 700, gain: 0.22 * d, q: 1.6 });
  }
  punch() { if (!this.sfx('punch', 0.6)) this.hitFlesh(); }
  knife(hit) { if (!this.sfx(hit ? 'knife' : 'knife', hit ? 0.5 : 0.3)) this.bash(); }
  drawKnife() { this.sfx('draw_knife', 0.4); }
  targetDown() { this.burst({ length: 0.22, from: 260, to: 90, gain: 0.3, q: 0.8 }); this.tone({ wave: 'square', from: 300, to: 160, length: 0.1, gain: 0.05 }); }
  // Footsteps: the surface changes the colour of the noise.
  step(kind, hard) {
    const now = this.ctx ? this.ctx.currentTime : 0;
    if (now - this.lastStep < 0.12) return;
    this.lastStep = now;
    const g = (hard ? 0.16 : 0.09);
    // recorded steps on concrete, carpet and wood; grating and water stay synthesised
    if ((kind === 'concrete' || kind === 'carpet' || kind === 'wood') && this.sfx('step_' + kind, hard ? 0.42 : 0.26, { room: false })) return;
    if (kind === 'water') this.burst({ length: 0.22, from: 1800, to: 500, gain: g * 1.4, q: 0.6 });
    // grating is a dull rattle, not a bell: no tone, low resonance
    else if (kind === 'metal') {
      this.burst({ length: 0.07, from: 1500, to: 520, gain: g * 0.85, q: 0.8 });
      this.burst({ length: 0.05, from: 420, to: 200, gain: g * 0.5, q: 0.9, delay: 0.012 });
    } else this.burst({ length: 0.08, from: 900, to: 260, gain: g, q: 1 });
  }
  land(speed) {
    const g = Math.min(0.4, 0.06 + speed * 0.02);
    this.burst({ length: 0.16, from: 420, to: 90, gain: g, q: 0.9 });
  }
  splash(big) {
    if (this.playSample('splash', { gain: big ? 0.8 : 0.45, rate: big ? 0.92 : 1.06 })) return;
    this.burst({ length: big ? 0.5 : 0.28, from: 2600, to: 400, gain: big ? 0.4 : 0.22, q: 0.6 });
    this.burst({ length: 0.7, from: 900, to: 200, gain: 0.12, q: 0.5, delay: 0.05 });
  }
  swim() {
    this.swimFlip = !this.swimFlip;
    if (this.playSample(this.swimFlip ? 'swim1' : 'swim2', { gain: 0.5, rate: 0.95 + Math.random() * 0.12 })) return;
    this.burst({ length: 0.3, from: 1200, to: 300, gain: 0.07, q: 0.6 });
  }
  // Hauling yourself over something: cloth and boots on concrete, not a chime.
  vault(big) {
    this.burst({ length: 0.26, from: 1400, to: 260, gain: big ? 0.16 : 0.11, q: 0.6 });
    this.burst({ length: 0.1, from: 300, to: 120, gain: big ? 0.2 : 0.13, q: 1.1, delay: big ? 0.2 : 0.14 });
  }
  blast(dist, flash) {
    const d = Math.max(0.12, 1 - (dist || 0) / 40);
    if (flash) {
      this.burst({ length: 0.3, from: 5000, to: 1200, gain: 0.5 * d, q: 0.5 });
      // the ring afterwards
      this.tone({ wave: 'sine', from: 4200, to: 3600, length: 2.6, gain: 0.08 * d, attack: 0.05 });
      this.tone({ wave: 'sine', from: 6300, to: 5200, length: 2.2, gain: 0.05 * d, attack: 0.05 });
    } else {
      this.burst({ length: 0.5, from: 700, to: 60, gain: 0.7 * d, q: 0.6 });
      this.tone({ wave: 'triangle', from: 90, to: 28, length: 0.7, gain: 0.5 * d, room: true });
      this.burst({ length: 1.2, from: 300, to: 80, gain: 0.12 * d, q: 0.4, delay: 0.06 });
    }
  }
  throwArc() { this.burst({ length: 0.12, from: 800, to: 2200, gain: 0.08, q: 1.5 }); }
  bounce() { this.burst({ length: 0.05, from: 1600, gain: 0.1, q: 3 }); }
  // A turret: the motor while it tracks, a lock, then the burst.
  turretTrack(on) {
    if (!this.ready) return;
    if (on && !this.motor) {
      this.motor = this.ctx.createOscillator();
      this.motorGain = this.ctx.createGain();
      this.motor.type = 'sawtooth';
      this.motor.frequency.value = 62;
      this.motorGain.gain.value = 0.0001;
      this.motorGain.gain.exponentialRampToValueAtTime(0.05, this.ctx.currentTime + 0.1);
      this.motor.connect(this.motorGain); this.motorGain.connect(this.master);
      this.motor.start();
    } else if (!on && this.motor) {
      const m = this.motor, g = this.motorGain;
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);
      m.stop(this.ctx.currentTime + 0.2);
      this.motor = null; this.motorGain = null;
    }
  }
  // (Rhys: "the 'Engine Revving' is footsteps") an engine: a low, rough note that climbs with the
  // revs, and - for a boat - the hiss of the wash. key: one voice per engine ('you', or the nearest other);
  // rev 0..1; gain 0 silences it (and it is stopped)
  engine(key, rev, gain, boat) {
    if (!this.ready) return;
    this.engines = this.engines || {};
    let e = this.engines[key];
    if (gain <= 0.001) { if (e) { const t = this.ctx.currentTime; e.g.gain.setTargetAtTime(0.0001, t, 0.08); e.a.stop(t + 0.4); e.b.stop(t + 0.4); e.n.stop(t + 0.4); delete this.engines[key]; } return; }
    if (!e) {
      const c = this.ctx, g = c.createGain(), a = c.createOscillator(), b = c.createOscillator(), lp = c.createBiquadFilter();
      a.type = 'sawtooth'; b.type = 'square'; lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.8;
      const ga = c.createGain(), gb = c.createGain(); ga.gain.value = 0.6; gb.gain.value = 0.25;
      a.connect(ga); b.connect(gb); ga.connect(lp); gb.connect(lp); lp.connect(g);
      // the wash: noise through a band of hiss
      const n = c.createBufferSource(); n.buffer = this.noise(2); n.loop = true;
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 0.6;
      const gn = c.createGain(); gn.gain.value = 0; n.connect(bp); bp.connect(gn); gn.connect(g);
      g.gain.value = 0.0001; g.connect(this.master);
      a.start(); b.start(); n.start();
      e = this.engines[key] = { g, a, b, n, gn, lp };
    }
    const t = this.ctx.currentTime, r = Math.max(0, Math.min(1, rev));
    e.a.frequency.setTargetAtTime(38 + 95 * r, t, 0.12);
    e.b.frequency.setTargetAtTime(19 + 48 * r + 1.5, t, 0.12);
    e.lp.frequency.setTargetAtTime(300 + 900 * r, t, 0.12);
    e.gn.gain.setTargetAtTime(boat ? 0.05 + 0.25 * r : 0.02, t, 0.2);
    e.g.gain.setTargetAtTime(gain * (0.55 + 0.45 * r), t, 0.1);
  }
  // getting in: a thump as you drop into the seat, the starter, the engine catching
  board(boat) {
    this.burst({ length: 0.14, from: 260, to: 90, gain: 0.25, q: 0.9 });
    if (boat) this.burst({ length: 0.4, from: 900, to: 300, gain: 0.06, q: 0.5, delay: 0.05 });
    this.tone({ wave: 'sawtooth', from: 30, to: 70, length: 0.45, gain: 0.07, delay: 0.25 });
  }
  // a Geiger counter's click
  geiger() { this.burst({ length: 0.008, from: 3500, gain: 0.09 + Math.random() * 0.05, q: 1.5, room: false }); }
  unboard() { this.burst({ length: 0.1, from: 320, to: 140, gain: 0.2, q: 1 }); }
  // the alarm (M6.28): a two-tone wail, rising and falling, for secs
  siren(secs) {
    const n = Math.max(1, Math.round((secs || 5) / 1.1));
    for (let i = 0; i < n; i++) {
      this.tone({ wave: 'sawtooth', from: 520, to: 880, length: 0.55, gain: 0.05, delay: i * 1.1, attack: 0.05 });
      this.tone({ wave: 'sawtooth', from: 880, to: 520, length: 0.55, gain: 0.05, delay: i * 1.1 + 0.55, attack: 0.02 });
    }
  }
  lockOn() {
    this.tone({ wave: 'square', from: 900, length: 0.06, gain: 0.09 });
    this.tone({ wave: 'square', from: 1200, length: 0.08, gain: 0.09, delay: 0.1 });
  }
  turretShot() { this.burst({ length: 0.06, from: 1800, to: 500, gain: 0.16, q: 1.2 }); }
  // interface
  // an ordinary door. Opening: the handle turns, the latch clicks free, and
  // the leaf moves air as it swings - no pitched creak (M5.15.0's sounded
  // like a cartoon). Shutting: the latch, then the thud (Rhys liked that one).
  door(opening) {
    if (opening && this.sfx('door_open', 0.55)) return;          // a real door (Kenney)
    if (opening) {
      this.burst({ length: 0.025, from: 1800, gain: 0.07, q: 5, room: false });                 // handle
      this.burst({ length: 0.03, from: 2600, gain: 0.09, q: 4, room: false, delay: 0.07 });     // latch free
      this.burst({ type: 'lowpass', length: 0.32, from: 700, to: 250, gain: 0.05, q: 0.5, attack: 0.12, delay: 0.1 });  // the swing
    } else {
      this.burst({ length: 0.03, from: 2400, gain: 0.1, q: 4, room: false });
      this.burst({ length: 0.12, from: 260, to: 90, gain: 0.3, q: 0.9, delay: 0.3 });
    }
  }
  // bullet time: a deep, slowing swell
  slowmo() {
    this.tone({ wave: 'sine', from: 140, to: 55, length: 1.4, gain: 0.14 });
    this.burst({ length: 0.5, from: 400, to: 90, gain: 0.12, q: 0.7 });
  }
  // the lift: a two-note chime on arriving, a soft rumble of doors
  liftDing() { this.tone({ wave: 'sine', from: 988, length: 0.35, gain: 0.07, room: true }); this.tone({ wave: 'sine', from: 784, length: 0.5, gain: 0.07, delay: 0.3, room: true }); }
  // a safe's dial: a light tick each notch, a heavier one on the right number
  tumbler(on) { this.tone({ wave: 'square', from: on ? 160 : 1100, length: on ? 0.05 : 0.025, gain: on ? 0.07 : 0.035, room: false }); }
  liftDoors() { this.burst({ length: 0.7, from: 260, to: 180, gain: 0.07, q: 0.7 }); }
  click() { this.burst({ length: 0.03, from: 2200, gain: 0.08, q: 3, room: false }); }
  confirm() { this.tone({ wave: 'sine', from: 700, length: 0.07, gain: 0.08 }); this.tone({ wave: 'sine', from: 1050, length: 0.09, gain: 0.07, delay: 0.07 }); }
  deny() { this.tone({ wave: 'square', from: 300, to: 180, length: 0.14, gain: 0.07 }); }
  pickup() { this.tone({ wave: 'triangle', from: 520, length: 0.07, gain: 0.08 }); this.tone({ wave: 'triangle', from: 780, length: 0.1, gain: 0.07, delay: 0.06 }); }
  // a round going past you: a sharp snap
  // (Rhys: "a specific one for bullets ricocheting off glass bottles
  // and wine glasses") the bright crack of the glass going, the tinkle of its
  // pieces landing, and a ring from a glass that stays whole
  glassware(dist) {
    const d = Math.max(0.12, 1 - (dist || 0) / 60);
    this.sfx('hit_glass', 0.35 * d);
    this.burst({ length: 0.09, from: 5200, to: 2600, gain: 0.2 * d, q: 2.5 });
    for (let i = 0; i < 7; i++) {
      const f = 2600 + Math.random() * 4200;
      this.tone({ wave: 'sine', from: f, to: f * (0.97 + Math.random() * 0.04), length: 0.05 + Math.random() * 0.1, gain: (0.025 + Math.random() * 0.03) * d, delay: 0.05 + i * 0.03 + Math.random() * 0.06, room: true });
    }
    this.tone({ wave: 'sine', from: 1760 + Math.random() * 600, length: 0.9, gain: 0.03 * d, delay: 0.01, room: true });
  }
  // a lure device going off: an alarm's chirp, three times
  lure(dist) {
    const d = Math.max(0.1, 1 - (dist || 0) / 70);
    for (let k = 0; k < 3; k++) {
      this.tone({ wave: 'square', from: 2300, to: 1700, length: 0.16, gain: 0.07 * d, delay: k * 0.42, room: true });
      this.tone({ wave: 'square', from: 2300, to: 1700, length: 0.16, gain: 0.07 * d, delay: k * 0.42 + 0.19, room: true });
    }
  }
  whizz() { this.burst({ length: 0.05, from: 3800, to: 1400, gain: 0.09, q: 2, room: false }); }
  hurt() { this.burst({ length: 0.2, from: 340, to: 120, gain: 0.22, q: 0.8 }); }
  died() { this.tone({ wave: 'sine', from: 220, to: 60, length: 1.4, gain: 0.25, room: true }); }
  stepDone() { this.tone({ wave: 'sine', from: 620, length: 0.09, gain: 0.08 }); this.tone({ wave: 'sine', from: 930, length: 0.12, gain: 0.07, delay: 0.09 }); }
}
