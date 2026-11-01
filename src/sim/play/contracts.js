// FRONTLINE - contracts (M6.41): replay work from Ghost HQ's board. Three at a time, each a mission you have
// already played and a way of doing it - unseen, without a kill, against the clock, by the head. Done (the mission
// a success, and done that way), it pays experience and a new one takes its place. Which ones come up follows from
// the slot's own count of contracts taken (seeded), so the board is the same each time you look until you act.

export const TERMS = {
  ghost:    { name: 'Unseen', text: 'Never spotted', xp: 160, met: (m) => (m.spotted || 0) === 0 },
  mercy:    { name: 'No kills', text: 'Nobody killed - knock them out, or go round them', xp: 150, met: (m) => (m.kills || 0) === 0 },
  quick:    { name: 'Against the clock', text: 'Done inside {mins} minutes', xp: 120, met: (m, c) => (m.time || 0) <= c.mins * 60 },
  heads:    { name: 'Headhunter', text: 'Five headshots or more', xp: 110, met: (m) => (m.headshots || 0) >= 5 },
  hands:    { name: 'Hands on', text: 'Three takedowns or more', xp: 120, met: (m) => (m.takedowns || 0) >= 3 },
  sharp:    { name: 'Sharpshooter', text: 'Accuracy of 60% or better (ten rounds or more)', xp: 110, met: (m) => (m.shotsFired || 0) >= 10 && (m.shotsHit || 0) / m.shotsFired >= 0.6 },
};
export const BOARD = 3;
// a little generator from a number: the same seed, the same contracts
const rng = (seed) => { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };

// the contract numbered n, from the missions you can take it on
export function contractFor(n, levels) {
  if (!levels || !levels.length) return null;
  const r = rng(n + 1), keys = Object.keys(TERMS);
  const level = levels[Math.floor(r() * levels.length)], term = keys[Math.floor(r() * keys.length)];
  const c = { n, level, term, xp: TERMS[term].xp };
  if (term === 'quick') c.mins = 6 + Math.floor(r() * 7);           // six to twelve minutes
  return c;
}
// the board: state { next, open: [n...] } - the open contracts, made up to three
export function boardOf(state, levels) {
  const st = { next: (state && state.next) || 0, open: ((state && state.open) || []).slice() };
  while (st.open.length < BOARD) st.open.push(st.next++);
  return { state: st, contracts: st.open.map((n) => contractFor(n, levels)).filter(Boolean) };
}
export const describe = (c) => TERMS[c.term].text.replace('{mins}', c.mins);
// a mission just finished: which of the open contracts it pays (and the board without them)
export function settle(state, levels, levelId, result, m) {
  const { state: st, contracts } = boardOf(state, levels);
  if (result !== 'success') return { state: st, paid: [] };
  const paid = contracts.filter((c) => c.level === levelId && TERMS[c.term].met(m, c));
  st.open = st.open.filter((n) => !paid.some((c) => c.n === n));
  return { state: boardOf(st, levels).state, paid };
}
