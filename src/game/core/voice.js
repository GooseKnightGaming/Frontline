// FRONTLINE - voices.
//
// For now the browser speaks the lines itself (the Web Speech API, which
// Chrome and ChromeOS have built in): each speaker gets his own voice, pitch
// and pace from his name, so a guard always sounds like himself, and the
// volume falls off with distance. It sounds synthetic - it is a stand-in.
// Real recordings replace it line by line: put the files in assets/voices/
// and list them in RECORDED under the line's key (e.g. alert: ['alert_1.mp3'])
// and those play instead, through the game's own audio.

// Each recorded line with its own words, so the subtitle matches what is heard.
// Where a kind of line has recordings, they are used instead of the
// synthetic voice.
import { SPOKEN, SPOKEN_VOICES, SPOKEN_SETS, setOfVoice } from './spoken.js';

export const RECORDED = {
  // a guard hit and still standing: wordless grunts (Kurt, "Soldier Voice Acting", CC BY 3.0)
  hit: [{ file: 'hit_1.mp3', text: 'Argh!' }, { file: 'hit_2.mp3', text: 'Ngh!' }, { file: 'hit_3.mp3', text: 'Agh!' }],
  // the rest: Kenney, "Voiceover Pack", CC0 (male voice)
  alert: [{ file: 'war_target_engaged.ogg', text: 'Target engaged!' }, { file: 'war_look_out.ogg', text: 'Look out!' }],
  reload: [{ file: 'war_reloading.ogg', text: 'Reloading!' }],
  manDown: [{ file: 'war_medic.ogg', text: 'Medic!' }],
  wake: [{ file: 'war_medic.ogg', text: 'Medic!' }],
  shotAt: [{ file: 'war_get_down.ogg', text: 'Get down!' }, { file: 'war_cover_me.ogg', text: 'Cover me!' }],
  backup: [{ file: 'war_call_for_backup.ogg', text: 'Call for backup!' }],
  coming: [{ file: 'war_go_go_go.ogg', text: 'Go, go, go!' }],
  hold: [{ file: 'war_hold.ogg', text: 'Hold!' }],
};

// Your handler on the radio ("Control"): recorded lines played at mission
// moments, with a subtitle. VoiceBosch, "Radio Soldier", CC-BY-SA 4.0.
export const RADIO = {
  entering:  { file: 'radio_entering.mp3', text: 'Entering hostile territory.' },
  goodLuck:  { file: 'radio_good_luck.mp3', text: 'You\'re on your own. Good luck.' },
  secured:   { file: 'radio_objective_secured.mp3', text: 'Objective secured.' },
  extract:   { file: 'radio_extraction.mp3', text: 'Get to the extraction point.' },
  done:      { file: 'radio_accomplished.mp3', text: 'Mission accomplished.' },
  moving:    { file: 'radio_enemy_moving.mp3', text: 'Enemy on the move.' },
  six:       { file: 'radio_watch_six.mp3', text: 'Watch your six.' },
  hostiles:  { file: 'radio_hostiles.mp3', text: 'Hostiles inbound.' },
  tango:     { file: 'radio_tango_down.mp3', text: 'Tango down.' },
  neutral:   { file: 'radio_neutralized.mp3', text: 'Target neutralised.' },
  goodWork:  { file: 'radio_good_work.mp3', text: 'Good work, soldier.' },
};

// (Rhys: "I'd like audio for the Chopper Pilot, not just subtitles")
// The reds' own radio, overheard: the captain ("Red One") and his pilot.
// Synthetic voices (Piper, LibriTTS speakers - see assets/voices/CREDITS.txt),
// filtered to sound like a radio. They share Control's queue, so nobody talks
// over anybody, and each subtitle goes up as its line plays.
export const INTERCEPT = {
  inside:   { who: 'Red One', file: 'intercept_redone_inside.mp3', text: 'Bird, Red One - they\'re inside. Roof, now!' },
  twoMin:   { who: 'Pilot', file: 'intercept_pilot_two_minutes.mp3', text: 'Copy, Red One. Two minutes - then I\'m gone.' },
  thirty:   { who: 'Pilot', file: 'intercept_pilot_thirty.mp3', text: 'Thirty seconds, Red One!' },
  hangOn:   { who: 'Pilot', file: 'intercept_pilot_hang_on.mp3', text: 'Got you, Red One. Hang on.' },
  timesUp:  { who: 'Pilot', file: 'intercept_pilot_times_up.mp3', text: 'Time\'s up, Red One. I\'m out.' },
  down:     { who: 'Pilot', file: 'intercept_pilot_down.mp3', text: 'Red One is down - I\'m out of here.' },
};

// how much a line matters: a more important one cuts across a lesser one
export const PRIORITY = { alert: 3, hit: 3, manDown: 3, wake: 3, shotAt: 2, lost: 2, reload: 2, backup: 2, coming: 1, hold: 1, alertRival: 3, y_alert: 3, y_alertYou: 3, y_hit: 3, y_manDown: 3, y_shotAt: 2, y_reload: 2, y_lost: 2, talk: 3, down: 2, y_down: 2, radio: 3, fixing: 2, fixed: 2 };

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export const SPEECH_WAIT = 1.6;      // seconds to wait for the browser's speech to start before showing the words anyway

export class Voices {
  constructor(settings, audio) {
    this.settings = settings; this.audio = audio;
    this.synth = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis : null;
    this.list = [];
    this.until = 0; this.priority = 0;
    this.now = () => performance.now();
    this.heard = {};                 // words -> when last said
    if (this.synth) {
      const load = () => { this.list = this.synth.getVoices().filter((v) => /^en/i.test(v.lang)); };
      load();
      this.synth.onvoiceschanged = load;
    }
  }

  // who: the speaker (a guard's id); key: the kind of line; volume 0..1
  // (Rhys: "a noticeable delay between text appearing on screen and
  // the corresponding audio") shown(words): called when the words are heard -
  // at once for a recording; for the browser's speech, when it starts to
  // speak (it can take a second to), or after SPEECH_WAIT if it never says.
  say(who, text, key, volume, shown, voiceId) {
    const show = (w) => { if (shown) shown(w); return w; };
    if (this.settings.voices === false) return show(text);
    const pri = PRIORITY[key] || 1, now = this.now();
    const busy = now < this.until;
    if (busy && pri <= this.priority) return null;        // do not talk over something as important
    const vol = Math.max(0, Math.min(1, (volume === undefined ? 1 : volume)));
    const takes = RECORDED[key];
    if (takes && takes.length && this.audio && this.audio.playSample) {
      this.lastTake = this.lastTake || {};
      let take = takes[hash(who + Math.floor(now)) % takes.length];
      if (take === this.lastTake[key] && takes.length > 1) take = takes[(takes.indexOf(take) + 1) % takes.length];
      this.lastTake[key] = take;
      const name = 'voice_' + take.file;
      if (this.saidLately(take.text, now)) return null;
      if (this.audio.hasSample(name)) {
        this.heard[take.text] = now;
        if (this.settings.voices !== false) this.audio.playSample(name, { gain: vol });
        this.until = now + 1400; this.priority = pri;
        return show(take.text);                             // the words actually said
      }
      this.audio.loadSample(name, 'assets/voices/' + take.file);     // ready next time; spoken for now
    }
    if (this.saidLately(text, now)) return null;
    this.heard[text] = now;
    // a recorded line in this speaker's voice, if there is one: it starts the moment
    // its words go up (the browser's speech can take a second or more, and the words waited for it)
    const sid = voiceId && SPOKEN[text] && (SPOKEN_SETS[setOfVoice(voiceId)] || []).includes(SPOKEN[text]) ? SPOKEN[text] : null;
    if (sid && this.audio && this.audio.playSample) {
      const name = 'voice_spoken_' + voiceId + '_' + sid;
      if (this.audio.hasSample(name)) {
        if (this.synth && (this.synth.speaking || this.synth.pending)) this.synth.cancel();
        this.audio.playSample(name, { gain: vol });
        this.priority = pri; this.until = now + 500 + text.length * 55;
        return show(text);
      }
      this.audio.loadSample(name, 'assets/voices/spoken_' + voiceId + '_' + sid + '.mp3');
    }
    if (!this.synth) return show(text);
    // (Rhys: "Still a significant delay between the subtitles and the
    // audio lines") anything still waiting its turn in the browser's speech
    // queue is stale by now: dropped, so this line is not said late behind it
    if (busy || this.synth.pending || this.synth.speaking) this.synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const h = hash(who);
    const voice = this.voiceFor(h);
    if (voice) u.voice = voice;
    u.pitch = 0.7 + (h % 7) * 0.06;                         // 0.70 .. 1.06
    u.rate = 0.95 + ((h >>> 3) % 5) * 0.05;                  // 0.95 .. 1.15
    u.volume = vol * (this.settings.volume === undefined ? 1 : this.settings.volume);
    let started = false;
    const begin = () => { if (started) return; started = true; show(text); };
    u.onstart = begin;
    u.onerror = begin;
    if (shown) setTimeout(begin, SPEECH_WAIT * 1000);
    this.synth.speak(u);
    this.priority = pri;
    this.until = now + 500 + text.length * 65;
    return text;
  }

  // a voice for a speaker: one on this machine where there is one -
  // Chrome's "Google UK English" voices are fetched over the network, a second
  // or more before a word is heard - British first, otherwise any English
  voiceFor(h) {
    const local = this.list.filter((v) => v.localService);
    const base = local.length ? local : this.list;
    const gb = base.filter((v) => /GB|UK/i.test(v.lang + ' ' + v.name));
    const pool = gb.length ? gb : base;
    return pool.length ? pool[h % pool.length] : null;
  }
  // the browser's speech is slowest the first time: woken with a silent word
  // as the mission loads, so the first line said is not the slow one
  warm() {
    if (!this.synth || this.warmed || this.settings.voices === false || typeof SpeechSynthesisUtterance === 'undefined') return;
    this.warmed = true;
    const u = new SpeechSynthesisUtterance(' ');
    const v = this.voiceFor(0); if (v) u.voice = v;
    u.volume = 0;
    this.synth.speak(u);
  }

  // The same words twice within 8 s, from anyone, is one too many (
  // Rhys: "Medic!" over and over). Urgent lines skip the mission's turn-
  // taking, and "Medic!" is the only recording for both a man down and a man
  // knocked out - so a heap of bodies, found by guard after guard, got it
  // every time. Lines with several takes rotate and are not held up.
  saidLately(words, now) { return now - (this.heard[words] === undefined ? -1e9 : this.heard[words]) < 8000; }

  // every recorded file, loaded as soon as the audio is running
  // the recorded lines for the voices this level uses ('yellow', 'red')
  // (Rhys: "FPS drops massively at the start of the level") all 260 at once - fetched,
  // decoded and scanned for their silence in the first seconds - is a stall; now a trickle, one
  // every `gap` seconds (0: all at once, as the tests ask). A line wanted before its turn is
  // fetched there and then by say().
  preloadSpoken(sets, gap) {
    if (!this.audio || !this.audio.loadSample) return 0;
    const list = [];
    for (const set of sets) for (const id of SPOKEN_SETS[set] || []) for (const v of SPOKEN_VOICES[set] || []) list.push('spoken_' + v + '_' + id);
    const one = (f) => this.audio.loadSample('voice_' + f, 'assets/voices/' + f + '.mp3');
    if (!gap) { list.forEach(one); return list.length; }
    let i = 0;
    const next = () => { if (i < list.length) { one(list[i++]); setTimeout(next, gap * 1000); } };
    next();
    return list.length;
  }
  preload() {
    this.warm();
    if (!this.audio || !this.audio.loadSample) return;
    for (const list of Object.values(RECORDED)) for (const t of list) this.audio.loadSample('voice_' + t.file, 'assets/voices/' + t.file);
    for (const r of [...Object.values(RADIO), ...Object.values(INTERCEPT)]) this.audio.loadSample('voice_' + r.file, 'assets/voices/' + r.file);
  }

  // The handler on the radio: lines queue up and play in turn, each once it
  // has loaded, with a pause between. show(text) puts up the subtitle.
  radio(key, show) {
    const r = RADIO[key];
    if (!r) return;
    this.radioQ = this.radioQ || [];
    this.radioQ.push({ r, show, waited: 0 });
  }
  // the reds' radio, overheard: show(text, who) puts up the subtitle
  intercept(key, show) {
    const r = INTERCEPT[key];
    if (!r) return;
    this.radioQ = this.radioQ || [];
    this.radioQ.push({ r, show, waited: 0, gain: 0.85 });
  }
  tick(dt) {
    const q = this.radioQ;
    if (!q || !q.length) return;
    this.radioGap = (this.radioGap || 0) - dt;
    if (this.radioGap > 0) return;
    const next = q[0], name = 'voice_' + next.r.file;
    const ready = this.audio && this.audio.hasSample(name);
    next.waited += dt;
    if (!ready && next.waited < 3) return;                   // give it a moment to load
    q.shift();
    if (ready && this.settings.voices !== false) this.audio.playSample(name, { gain: next.gain || 0.9, room: false });
    if (next.show) next.show(next.r.text, next.r.who);
    this.radioGap = 1.1 + next.r.text.length * 0.07;          // roughly the line's length, and a breath
  }

  stop() { if (this.synth) this.synth.cancel(); this.until = 0; this.radioQ = []; }
}
