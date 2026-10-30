// FRONTLINE - every recorded voice file the game names exists, and is credited.
import { existsSync, readFileSync } from 'fs';
import { RECORDED, RADIO, INTERCEPT, Voices } from '../src/game/voice.js';
import { SFX } from '../src/game/audio.js';
import { SPOKEN, SPOKEN_VOICES, spokenVoice } from '../src/game/spoken.js';
import { LINES, YELLOW_LINES } from '../src/sim/guard.js';
import { YELLOW_TALK } from '../src/sim/factions.js';
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const dir = new URL('../assets/voices/', import.meta.url);
T('every recorded line and radio call has its file', () => {
  const files = Object.values(RECORDED).flat().map((t) => t.file).concat(Object.values(RADIO).map((r) => r.file));
  for (const f of files) A(existsSync(new URL(f, dir)), 'missing assets/voices/' + f);
});
T('every recorded line says what it says: a subtitle for each', () => {
  for (const [k, list] of Object.entries(RECORDED)) for (const t of list) A(t.text && t.text.length > 1, k + ' ' + t.file);
});
T('every recorded sound effect has its file, and is credited', () => {
  const sfx = new URL('../assets/sfx/', import.meta.url);
  for (const f of Object.values(SFX).flat()) A(existsSync(new URL(f, sfx)), 'missing assets/sfx/' + f);
  A(/Kenney/.test(readFileSync(new URL('CREDITS.txt', sfx), 'utf8')), 'sfx credits');
});
T('every radio call has a subtitle', () => {
  for (const [k, r] of Object.entries(RADIO)) A(r.text && r.text.length > 3, k);
});
T('the voices are credited, with their licences', () => {
  const c = readFileSync(new URL('CREDITS.txt', dir), 'utf8');
  A(/VoiceBosch/.test(c) && /CC BY-SA 4\.0/.test(c) && /Kurt/.test(c) && /CC BY 3\.0/.test(c) && /Kenney/.test(c), 'credits incomplete');
});
T('the same words are not said twice within 8 s, by anyone (M6.8.1, "Medic!" over and over)', () => {
  const played = [];
  const audio = { playSample: (n) => played.push(n), hasSample: () => true, loadSample: () => {} };
  const v = new Voices({}, audio);
  let t = 0; v.now = () => t;
  A(v.say('g1', 'x', 'manDown', 1) === 'Medic!', 'first call not said');
  t = 1600; A(v.say('g2', 'x', 'manDown', 1) === null, 'a second guard said Medic! again');
  t = 3200; A(v.say('g3', 'x', 'wake', 1) === null, 'the knocked-out call (the same recording) got through');
  t = 4800; A(v.say('g1', 'x', 'reload', 1) === 'Reloading!', 'a different line was held up');
  t = 9000; A(v.say('g2', 'x', 'manDown', 1) === 'Medic!', 'still held back after 8 s');
  A(played.length === 3, 'played ' + played.length);
});
T('lines with several takes rotate and are not held up', () => {
  const audio = { playSample: () => {}, hasSample: () => true, loadSample: () => {} };
  const v = new Voices({}, audio);
  let t = 0; v.now = () => t;
  const a = v.say('g1', 'x', 'hit', 1); t = 1600;
  const b = v.say('g1', 'x', 'hit', 1);
  A(a && b && a !== b, a + ' / ' + b);
});
T('the pilot and Red One are heard, not just read: every overheard line has its file, a speaker and a subtitle (M6.13.5, Rhys)', () => {
  for (const [k, r] of Object.entries(INTERCEPT)) {
    A(existsSync(new URL(r.file, dir)), 'missing assets/voices/' + r.file);
    A(r.who && r.text && r.text.length > 3, k);
  }
  A(Object.values(INTERCEPT).filter((r) => r.who === 'Pilot').length >= 4, 'the pilot has too few lines');
  const c = readFileSync(new URL('CREDITS.txt', dir), 'utf8');
  A(/intercept_/.test(c) && /LibriTTS/.test(c) && /CC BY 4\.0/.test(c), 'the overheard voices are not credited');
});
T('overheard lines load with the rest, play in turn with Control\'s, and each subtitle names its speaker as it plays', () => {
  const loaded = [], played = [], shown = [];
  const audio = { playSample: (n) => played.push(n), hasSample: () => true, loadSample: (n) => loaded.push(n) };
  const v = new Voices({}, audio);
  v.preload();
  A(Object.values(INTERCEPT).every((r) => loaded.includes('voice_' + r.file)), 'not preloaded');
  v.intercept('inside', (t, who) => shown.push(who + ': ' + t));
  v.intercept('twoMin', (t, who) => shown.push(who + ': ' + t));
  v.tick(0.016);
  A(played.length === 1 && played[0] === 'voice_' + INTERCEPT.inside.file, 'first: ' + played.join());
  A(shown[0] === 'Red One: ' + INTERCEPT.inside.text, 'subtitle ' + shown[0]);
  v.tick(0.5); A(played.length === 1, 'the pilot talked over Red One');
  for (let i = 0; i < 100; i++) v.tick(0.1);
  A(played.length === 2 && shown[1].startsWith('Pilot: '), 'the pilot never answered: ' + shown.join(' | '));
  const quiet = new Voices({ voices: false }, audio), n = played.length, s2 = [];
  quiet.intercept('down', (t) => s2.push(t)); quiet.tick(0.1);
  A(played.length === n && s2.length === 1, 'voices off: still played, or no subtitle');
});
T('the browser\'s speech: a voice on this machine before a network one, nothing left waiting in its queue, woken as the mission loads (M6.17.7, Rhys: "Still a significant delay")', () => {
  const said = [];
  let cancels = 0;
  const synth = { pending: false, speaking: false, getVoices: () => [
    { name: 'Google UK English Female', lang: 'en-GB', localService: false },
    { name: 'Chrome OS UK English 1', lang: 'en-GB', localService: true },
    { name: 'Google US English', lang: 'en-US', localService: false },
  ], speak: (u) => said.push(u), cancel: () => { cancels++; } };
  globalThis.window = { speechSynthesis: synth };
  globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
  try {
    const v = new Voices({}, null);
    let t = 0; v.now = () => t;
    v.preload();
    A(said.length === 1 && said[0].volume === 0, 'not woken as it loads');
    v.preload(); A(said.length === 1, 'woken twice');
    for (const who of ['a', 'b', 'c', 'd', 'e']) { t += 9000; v.say(who, 'line ' + who, 'talk', 1); }
    A(said.slice(1).every((u) => u.voice && u.voice.localService), 'a network voice was used: ' + said.map((u) => u.voice && u.voice.name).join());
    synth.pending = true; t += 9000;
    const c0 = cancels; v.say('f', 'after the queue', 'talk', 1);
    A(cancels === c0 + 1, 'the stale queue was not cleared');
    A(new Voices({ voices: false }, null).warm() === undefined, 'warm');
  } finally { delete globalThis.window; delete globalThis.SpeechSynthesisUtterance; }
});
T('every guard\'s and Yellow\'s line is recorded, in every voice that says it - no waiting on the browser\'s speech (M6.17.10, Rhys: "still a significant delay between subtitle and audio")', () => {
  const said = [...Object.values(LINES).flat(), ...Object.values(YELLOW_LINES).flat(),
    ...Object.values(YELLOW_TALK).flatMap((v) => typeof v === 'string' ? [v] : Array.isArray(v) ? v : Object.values(v)).flat().filter((t) => !/\{/.test(t))];
  const missing = said.filter((t) => !SPOKEN[t]);
  A(!missing.length, 'not recorded: ' + JSON.stringify(missing.slice(0, 5)));
  const yl = said.slice(Object.values(LINES).flat().length);
  for (const [lines, voices] of [[Object.values(LINES).flat(), SPOKEN_VOICES.red], [yl, SPOKEN_VOICES.yellow]]) for (const t of lines) for (const v of voices) A(existsSync(new URL('spoken_' + v + '_' + SPOKEN[t] + '.mp3', dir)), 'missing spoken_' + v + '_' + SPOKEN[t] + '.mp3 (' + t + ')');
  A(/spoken_\*\.mp3/.test(readFileSync(new URL('CREDITS.txt', dir), 'utf8')), 'the recorded lines are not credited');
  // each man keeps one voice: the boss his own, the others one of two
  A(spokenVoice({ id: 'yb', boss: true }, true) === 'yb' && spokenVoice({ id: 'r7' }, false) === spokenVoice({ id: 'r7' }, false) && /^r[12]$/.test(spokenVoice({ id: 'r7' }, false)), 'voices not fixed per man');
});
T('a recorded line plays and shows together; not loaded yet, it is fetched and the browser says it this once', () => {
  const played = [], loaded = [], shown = [];
  let have = false;
  const audio = { playSample: (n) => played.push(n), hasSample: () => have, loadSample: (n) => loaded.push(n) };
  const v = new Voices({}, audio);
  let t = 0; v.now = () => t;
  const line = YELLOW_LINES.down[0], id = SPOKEN[line];
  v.say('y1', line, 'y_down', 1, (w) => shown.push(w), 'yg1');
  A(loaded.includes('voice_spoken_yg1_' + id) && !played.length, 'not fetched on first use');
  A(shown.length === 1, 'without the browser\'s speech the words still go up');
  have = true; t = 20000;
  v.say('y1', line, 'y_down', 1, (w) => shown.push(w), 'yg1');
  A(played[0] === 'voice_spoken_yg1_' + id && shown.length === 2 && shown[1] === line, 'the recording did not play with its words: ' + JSON.stringify(played));
  loaded.length = 0; v.preloadSpoken(['red']);
  A(loaded.length && loaded.every((n) => /^voice_spoken_r[12]_/.test(n)), 'a level without Yellows loads their voices');
  // only files that are there: nothing asked for that would not be found
  loaded.length = 0; v.preloadSpoken(['yellow', 'red']);
  for (const n of loaded) A(existsSync(new URL(n.replace('voice_', '') + '.mp3', dir)), 'asks for a file that is not there: ' + n);
  loaded.length = 0; played.length = 0; have = false; t = 40000; v.say('r9', line, 'y_down', 1, null, 'r1');
  A(!loaded.length && !played.length, 'a red voice fetched a Yellow line it never recorded');
});

T('the recordings load a few at a time, not all 260 at the start of the level (M6.17.11, Rhys: "FPS drops massively at the start")', () => {
  const loaded = [], timers = [], real = globalThis.setTimeout;
  const audio = { playSample: () => {}, hasSample: () => false, loadSample: (n) => loaded.push(n) };
  const v = new Voices({}, audio);
  globalThis.setTimeout = (f, ms) => { timers.push([f, ms]); return 0; };
  let n;
  try {
    n = v.preloadSpoken(['yellow', 'red'], 0.15);
    A(n > 200 && loaded.length === 1 && timers.length === 1 && timers[0][1] === 150, 'all at once: ' + loaded.length + ' of ' + n);
    for (let i = 0; i < 5; i++) timers.shift()[0]();
    A(loaded.length === 6, 'not one a step: ' + loaded.length);
  } finally { globalThis.setTimeout = real; }
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/preloadSpoken\(level\.train \? \['staff', 'staff2', 'kiosk', 'pa', 'guard', 'front', 'minister', 'steward', 'red'\] : rel \? \['yellow', 'red'\] : \['red'\], 0\.15\)/.test(rt), 'the mission still loads them all at once');
});

console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + ')' : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
