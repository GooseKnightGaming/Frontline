// FRONTLINE - trophies: hidden achievements. Nothing lists what exists; you
// find out by earning one. Each save slot is its own run (Rhys: "each save
// slot is its own run"), so each slot has its own trophies, kept in the
// browser under the slot's number and carried in its save (and transfer code).

import { currentSlot, TROPHIES } from './saves.js';

// before slots had their own: one set for the whole browser - it goes to slot 1
const LEGACY = 'frontline.trophies.v1';
function migrate() {
  try {
    const old = localStorage.getItem(LEGACY);
    if (old === null) return;
    if (localStorage.getItem(TROPHIES(0)) === null) localStorage.setItem(TROPHIES(0), old);
    localStorage.removeItem(LEGACY);
  } catch (e) { /* private window */ }
}
migrate();               // at once, before a new game looks for an empty slot

// a slot's trophies as stored: { id: { name, about, at } }
export function raw(n) {
  migrate();
  try { return JSON.parse(localStorage.getItem(TROPHIES(n === undefined ? currentSlot() : n)) || '{}') || {}; } catch (e) { return {}; }
}
// put a slot's trophies back (from a save or a transfer code)
export function restore(n, have) {
  try { localStorage.setItem(TROPHIES(n), JSON.stringify(have || {})); } catch (e) { /* private window */ }
}

// the ones this slot has, oldest first
export function earned(n) {
  return Object.entries(raw(n)).map(([id, t]) => Object.assign({ id }, t)).sort((a, b) => (a.at || 0) - (b.at || 0));
}

// award a list to this slot; returns only those that are new
export function earn(list, n) {
  const slot = n === undefined ? currentSlot() : n;
  const have = raw(slot), fresh = [];
  for (const t of list || []) {
    if (have[t.id]) continue;
    have[t.id] = { name: t.name, about: t.about, at: Date.now() };
    fresh.push(t);
  }
  restore(slot, have);
  return fresh;
}
