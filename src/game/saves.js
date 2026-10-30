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
    // (M6.13.8) the story so far: how each mission ended (src/sim/story.js)
    story: g.story ? JSON.parse(JSON.stringify(g.story)) : null,
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
export function clearSlot(n) { try { localStorage.removeItem(KEY(n)); return true; } catch (e) { return false; } }

export function describe(s) {
  if (!s) return { title: 'Empty', detail: 'No saved game' };
  const mins = Math.floor((s.playtime || 0) / 60);
  const when = new Date(s.at || Date.now());
  const day = when.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  const carry = s.loadout && s.loadout.slots ? (s.loadout.slots.primary || 'unarmed') : 'unarmed';
  return {
    title: s.name || 'Operative',
    detail: `${day} \u00b7 ${mins < 1 ? 'under a minute' : mins + ' min'} \u00b7 ${s.score || 0} pts \u00b7 ${carry}`,
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

// (M6.13.8) Which slot this browser tab is playing, so a mission page (a page
// of its own) writes its outcome into the save you deployed from.
const CUR = 'frontline.slot';
export function setCurrentSlot(n) { try { sessionStorage.setItem(CUR, String(n)); } catch (e) { /* private window */ } }
export function currentSlot() {
  try { const n = parseInt(sessionStorage.getItem(CUR), 10); return n >= 0 && n < SLOTS ? n : 0; } catch (e) { return 0; }
}
// (M6.13.8) Each slot's story under a key of its own, so a mission can write
// its outcome even when that slot has never been saved; a save carries a copy
// (and so does a transfer code), put back when the save is loaded.
const STORY = (n) => 'frontline.story.' + n;
export function loadStory(n) { try { return JSON.parse(localStorage.getItem(STORY(n)) || 'null'); } catch (e) { return null; } }
export function saveStory(n, story) { try { localStorage.setItem(STORY(n), JSON.stringify(story)); return true; } catch (e) { return false; } }
