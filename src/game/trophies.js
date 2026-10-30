// FRONTLINE - trophies: hidden achievements. Nothing lists what exists; you
// find out by earning one. Kept in the browser, like settings, across every
// save slot (a trophy is yours, not the slot's).

const KEY = 'frontline.trophies.v1';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
}

// the ones you have, oldest first
export function earned() {
  return Object.entries(read()).map(([id, t]) => Object.assign({ id }, t)).sort((a, b) => (a.at || 0) - (b.at || 0));
}

// award a list; returns only those that are new
export function earn(list) {
  const have = read(), fresh = [];
  for (const t of list || []) {
    if (have[t.id]) continue;
    have[t.id] = { name: t.name, about: t.about, at: Date.now() };
    fresh.push(t);
  }
  try { localStorage.setItem(KEY, JSON.stringify(have)); } catch (e) { /* private mode */ }
  return fresh;
}
