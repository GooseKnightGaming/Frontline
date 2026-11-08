// FRONTLINE - the world (M7.0.0): which regions Ghost knows, and how hot each one is.
//
// Rhys (8 Nov 2026): "Driven for real for the first mission in any of the ten regions of the world. Once the
// region is established as 'known', unlock fast-travel as a choice on the map." and "Heat? Yes, please."
//
// - A region is KNOWN once you have driven into it (the journey: src/game/world/journeys.js). Until then the first
//   job there starts with the drive; after it, the map table sends you straight there by van or helicopter.
//   'elsewhere' (the Ward, the test range) is never driven to: there is no road to nowhere.
// - HEAT (0 - 100) is how hard the reds in a region are looking for Ghost. An alarm, bodies, a failed job raise
//   it; quiet work brings it down, and every job done anywhere lets the other regions cool a little. A hot region's
//   reds notice you sooner (noticeFactor, applied to the guards' awareness like the difficulty).
// Pure: no storage, no DOM. The save (src/game/core/saves.js) keeps the state; main.js and the mission runtime
// call these.

export const NO_DRIVE = ['elsewhere'];
export const HEAT_MAX = 100;

export function emptyWorld() { return { known: [], heat: {}, visits: {} }; }

export function normalise(w) {
  const o = w && typeof w === 'object' ? w : {};
  return { known: Array.isArray(o.known) ? o.known.slice() : [], heat: o.heat && typeof o.heat === 'object' ? { ...o.heat } : {}, visits: o.visits && typeof o.visits === 'object' ? { ...o.visits } : {} };
}

export const isKnown = (w, region) => NO_DRIVE.includes(region) || normalise(w).known.includes(region);
export const needsDrive = (w, region) => !!region && !isKnown(w, region);

export function markKnown(w, region) {
  const o = normalise(w);
  if (region && !o.known.includes(region)) o.known.push(region);
  return o;
}

export const heatOf = (w, region) => Math.max(0, Math.min(HEAT_MAX, (normalise(w).heat[region] || 0)));

// how much a mission's ending moves its region's heat
//   r: { result: 'success'|'partial'|'failed', alarm: bool, kills: n, civilians: n (hurt or killed), seen: bool }
export function heatChange(r) {
  let d = 0;
  if (r.alarm) d += 20;
  d += Math.min(24, 3 * (r.kills || 0));
  d += 10 * (r.civilians || 0);
  if (r.result === 'failed') d += 10;
  const quiet = !r.alarm && !(r.kills > 0) && !(r.civilians > 0);
  if (quiet && r.result === 'success') d -= 15;
  else if (quiet) d -= 5;
  return d;
}

// a mission ended in `region`: its heat moves, and every other region cools by 3
export function afterMission(w, region, r) {
  const o = normalise(w);
  for (const k of Object.keys(o.heat)) if (k !== region) o.heat[k] = Math.max(0, o.heat[k] - 3);
  if (region) {
    o.heat[region] = Math.max(0, Math.min(HEAT_MAX, (o.heat[region] || 0) + heatChange(r)));
    o.visits[region] = (o.visits[region] || 0) + 1;
  }
  return o;
}

// the reds' awareness fills this much faster in a region this hot (x1 cold, x1.6 at the top)
export const noticeFactor = (heat) => 1 + Math.max(0, Math.min(HEAT_MAX, heat || 0)) * 0.006;

export function heatLabel(heat) {
  const h = heat || 0;
  return h < 15 ? 'COLD' : h < 40 ? 'WATCHED' : h < 70 ? 'HUNTED' : 'MANHUNT';
}

export function heatNote(heat) {
  const h = heat || 0;
  return h < 15 ? 'Nobody here is looking for Ghost.'
    : h < 40 ? 'The reds here have heard of Ghost. They look a little harder.'
    : h < 70 ? 'The reds here are looking for Ghost. They notice sooner.'
    : 'Every red here has Ghost\'s description. They notice very fast. Quiet work elsewhere will cool it.';
}
