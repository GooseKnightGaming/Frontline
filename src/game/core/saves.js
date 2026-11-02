// FRONTLINE - saved games.
//
// Three slots in the browser, plus a transfer code so a save can be carried to
// another device by hand. Codes are compressed and carry a checksum, so a
// mistyped one is refused rather than loading nonsense.

export const SLOTS = 3;
const KEY = (n) => 'frontline.save.' + n;
export const VERSION = 1;

// What a save holds. Kept small and explicit so old saves can be read later.
export function snapshot(g) {
  return {
    v: VERSION,
    name: g.name || 'Operative',
    at: Date.now(),
    playtime: Math.round(g.playtime || 0),
    score: g.score || 0,
    loadout: { slots: Object.assign({}, g.loadout.slots), mods: JSON.parse(JSON.stringify(g.loadout.mods || {})) },
    found: (g.found || []).slice(),
    place: (g.place || [0, 0, 30]).map((n) => Math.round(n * 100) / 100),
    yaw: Math.round((g.yaw || 0) * 1000) / 1000,
    course: g.course || null,       // { part, at } if a course was running
    // the story so far: how each mission ended (src/sim/play/story.js)
    story: g.story ? JSON.parse(JSON.stringify(g.story)) : null,
    // and the trophies this run has earned (core/trophies.js)
    trophies: g.trophies ? JSON.parse(JSON.stringify(g.trophies)) : null,
    // and the weapons this run has brought home (loadArmoury)
    armoury: g.armoury ? g.armoury.slice() : null,
  };
}

export function listSlots() {
  const out = [];
  for (let i = 0; i < SLOTS; i++) {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY(i)) || 'null'); } catch (e) { s = null; }
    out.push(s && s.v ? s : null);
  }
  return out;
}
export function saveSlot(n, data) {
  try { localStorage.setItem(KEY(n), JSON.stringify(data)); return true; } catch (e) { return false; }
}
export function loadSlot(n) { return listSlots()[n]; }
// erasing a slot ends its run: the save, its story and its trophies
export function clearSlot(n) {
  try { for (const k of [KEY(n), STORY(n), TROPHIES(n), ARMOURY(n), GADGET(n), RECORD(n), SKILLS(n), CASEB(n), CONTRACTS(n), DONE(n), PAPERS(n), 'frontline.lantern.' + n]) localStorage.removeItem(k); return true; } catch (e) { return false; }
}
// the first slot with no run in it, or -1
export function freeSlot() {
  const has = (k) => { try { return localStorage.getItem(k) !== null; } catch (e) { return false; } };
  return listSlots().findIndex((s, i) => !s && !loadStory(i) && !has(TROPHIES(i)));
}

export function describe(s) {
  if (!s) return { title: 'Empty', detail: 'No saved game' };
  const mins = Math.floor((s.playtime || 0) / 60);
  const when = new Date(s.at || Date.now());
  const day = when.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  const carry = s.loadout && s.loadout.slots ? (s.loadout.slots.primary || 'unarmed') : 'unarmed';
  return {
    title: s.name || 'Operative',
    detail: `${day} \u00b7 ${mins < 1 ? 'under a minute' : mins + ' min'} \u00b7 ${s.score || 0} pts \u00b7 ${carry}` +
      (s.trophies && Object.keys(s.trophies).length ? ` \u00b7 ${Object.keys(s.trophies).length} trophies` : ''),
  };
}

// ── transfer codes ─────────────────────────────────────────────────────────
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function toB64(bytes) {
  let out = '', i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + B64[(n >> 6) & 63] + B64[n & 63];
  }
  if (i < bytes.length) {
    const rem = bytes.length - i;
    const n = (bytes[i] << 16) | ((rem > 1 ? bytes[i + 1] : 0) << 8);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + (rem > 1 ? B64[(n >> 6) & 63] : '');
  }
  return out;
}
function fromB64(str) {
  const bytes = [];
  let buf = 0, bits = 0;
  for (const ch of str) {
    const v = B64.indexOf(ch);
    if (v < 0) continue;
    buf = (buf << 6) | v; bits += 6;
    if (bits >= 8) { bits -= 8; bytes.push((buf >> bits) & 255); }
  }
  return bytes;
}
function crc(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36).toUpperCase().slice(0, 4);
}
function bytesOf(str) {
  const u = unescape(encodeURIComponent(str));
  const out = new Array(u.length);
  for (let i = 0; i < u.length; i++) out[i] = u.charCodeAt(i) & 255;
  return out;
}
function strOf(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  try { return decodeURIComponent(escape(s)); } catch (e) { return s; }
}

export function exportCode(data) {
  const json = JSON.stringify(data);
  const body = toB64(bytesOf(json));
  const out = 'FL1.' + body + '.' + crc(body);
  return out.replace(/(.{1,48})/g, '$1\n').trim();
}
export function importCode(code) {
  const flat = String(code || '').replace(/\s+/g, '');
  const m = /^FL1\.([A-Za-z0-9\-_]+)\.([A-Z0-9]{4})$/.exec(flat);
  if (!m) return { ok: false, why: 'That does not look like a Frontline code.' };
  if (crc(m[1]) !== m[2]) return { ok: false, why: 'The code is damaged - check for a missing or changed character.' };
  let data = null;
  try { data = JSON.parse(strOf(fromB64(m[1]))); } catch (e) { return { ok: false, why: 'The code could not be read.' }; }
  if (!data || !data.v) return { ok: false, why: 'The code is not a saved game.' };
  if (data.v > VERSION) return { ok: false, why: 'That save is from a newer version of the game.' };
  return { ok: true, data };
}

// Which slot this browser tab is playing, so a mission page (a page
// of its own) writes its outcome into the save you deployed from.
const CUR = 'frontline.slot';
export function setCurrentSlot(n) { try { sessionStorage.setItem(CUR, String(n)); } catch (e) { /* private window */ } }
export function currentSlot() {
  try { const n = parseInt(sessionStorage.getItem(CUR), 10); return n >= 0 && n < SLOTS ? n : 0; } catch (e) { return 0; }
}
// Each slot's story under a key of its own, so a mission can write
// its outcome even when that slot has never been saved; a save carries a copy
// (and so does a transfer code), put back when the save is loaded.
const STORY = (n) => 'frontline.story.' + n;
// and its trophies (core/trophies.js reads and writes them)
export const TROPHIES = (n) => 'frontline.trophies.' + n;
// The weapons a run has brought home (Rhys: "Most new weapons are found/captured in the
// field. Some are from completing particular missions") - at Logistics and the
// Quartermaster from then on. Kept per slot, like the story: a mission page writes it.
// (M6.29) the gadget Q Branch has signed out to this run: carried on every mission as a Special
const GADGET = (n) => 'frontline.gadget.' + n;
export function loadGadget(n) { try { return localStorage.getItem(GADGET(n)) || null; } catch (e) { return null; } }
export function saveGadget(n, id) { try { if (id) localStorage.setItem(GADGET(n), id); else localStorage.removeItem(GADGET(n)); return true; } catch (e) { return false; } }
// (M6.28) the run's service record: every mission and battle added up (Rhys: "per match and over time")
const RECORD = (n) => 'frontline.record.' + n;
export const RECORD_SUMS = ['missions', 'won', 'partial', 'failed', 'battles', 'battlesWon', 'battleKills', 'kills', 'knockouts', 'takedowns', 'deaths', 'shotsFired', 'shotsHit', 'headshots', 'spotted', 'secs', 'hacked', 'traced', 'rescued'];
export function loadRecord(n) { try { return JSON.parse(localStorage.getItem(RECORD(n)) || 'null') || { favs: {} }; } catch (e) { return { favs: {} }; } }
// add one mission's or battle's numbers; fav: the weapon it was won with most
export function addRecord(n, r) {
  const rec = loadRecord(n);
  for (const k of RECORD_SUMS) rec[k] = (rec[k] || 0) + (r[k] || 0);
  rec.favs = rec.favs || {};
  if (r.fav) rec.favs[r.fav] = (rec.favs[r.fav] || 0) + 1;
  try { localStorage.setItem(RECORD(n), JSON.stringify(rec)); } catch (e) { /* private window */ }
  return rec;
}
// what it comes to: rates and the favourite
export function recordSummary(rec) {
  const fav = Object.entries(rec.favs || {}).sort((a, b) => b[1] - a[1])[0];
  return {
    accuracy: rec.shotsFired ? rec.shotsHit / rec.shotsFired : null,
    kd: rec.battles ? (rec.deaths ? (rec.battleKills || 0) / rec.deaths : null) : null,
    fav: fav ? fav[0] : null,
  };
}
// (M6.31) the case: clue ids found (sim/play/caseboard.js)
const CASEB = (n) => 'frontline.case.' + n;
export function loadCase(n) { try { return JSON.parse(localStorage.getItem(CASEB(n)) || '[]') || []; } catch (e) { return []; } }
export function addCase(n, ids) {
  const have = loadCase(n), fresh = (ids || []).filter((id, i, a) => !have.includes(id) && a.indexOf(id) === i);
  if (fresh.length) { try { localStorage.setItem(CASEB(n), JSON.stringify(have.concat(fresh))); } catch (e) { /* private window */ } }
  return fresh;
}
// (M6.41) the contracts board (sim/play/contracts.js): { next, open: [n...], levels: [ids] }
const CONTRACTS = (n) => 'frontline.contracts.' + n;
export function loadContracts(n) { try { return JSON.parse(localStorage.getItem(CONTRACTS(n)) || 'null') || null; } catch (e) { return null; } }
export function saveContracts(n, st) { try { localStorage.setItem(CONTRACTS(n), JSON.stringify(st)); } catch (e) { /* private window */ } }
// (M6.48) each first draft's best result this run: { id: 'success' | 'partial' | 'failed' }
const DONE = (n) => 'frontline.done.' + n;
const RANK = { failed: 1, partial: 2, success: 3 };
export function loadDone(n) { try { return JSON.parse(localStorage.getItem(DONE(n)) || '{}') || {}; } catch (e) { return {}; } }
// (M6.71) the papers read, kept: { levelId: [paperId, ...] } - the case board's file of them
const PAPERS = (n) => 'frontline.papers.' + n;
export function loadPapers(n) { try { return JSON.parse(localStorage.getItem(PAPERS(n)) || '{}') || {}; } catch (e) { return {}; } }
export function markPaper(n, level, id) {
  const d = loadPapers(n), l = d[level] || (d[level] = []);
  if (!l.includes(id)) { l.push(id); try { localStorage.setItem(PAPERS(n), JSON.stringify(d)); } catch (e) { /* private window */ } }
  return d;
}
export function markDone(n, id, result) {
  const d = loadDone(n);
  if ((RANK[result] || 0) > (RANK[d[id]] || 0)) { d[id] = result; try { localStorage.setItem(DONE(n), JSON.stringify(d)); } catch (e) { /* private window */ } }
  return d;
}
// (M6.29) the run's skills: experience earned, and the ranks bought with it (sim/play/skills.js)
const SKILLS = (n) => 'frontline.skills.' + n;
export function loadSkills(n) { try { return JSON.parse(localStorage.getItem(SKILLS(n)) || 'null') || { xp: 0, ranks: {} }; } catch (e) { return { xp: 0, ranks: {} }; } }
export function saveSkills(n, s) { try { localStorage.setItem(SKILLS(n), JSON.stringify(s)); return true; } catch (e) { return false; } }
export function addXp(n, xp) { const s = loadSkills(n); s.xp = (s.xp || 0) + (xp || 0); saveSkills(n, s); return s; }
const ARMOURY = (n) => 'frontline.armoury.' + n;
export function loadArmoury(n) { try { return JSON.parse(localStorage.getItem(ARMOURY(n)) || '[]') || []; } catch (e) { return []; } }
export function saveArmoury(n, ids) { try { localStorage.setItem(ARMOURY(n), JSON.stringify(ids || [])); return true; } catch (e) { return false; } }
// add some; returns only those that are new to this run
export function addArmoury(n, ids) {
  const have = loadArmoury(n), fresh = (ids || []).filter((id, i, a) => !have.includes(id) && a.indexOf(id) === i);
  if (fresh.length) saveArmoury(n, have.concat(fresh));
  return fresh;
}
export function loadStory(n) { try { return JSON.parse(localStorage.getItem(STORY(n)) || 'null'); } catch (e) { return null; } }
export function saveStory(n, story) { try { localStorage.setItem(STORY(n), JSON.stringify(story)); return true; } catch (e) { return false; } }
