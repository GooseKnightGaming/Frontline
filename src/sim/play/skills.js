// FRONTLINE - the skills tree (M6.29; the roadmap's M7 "Skills tree"). Each run earns experience from its
// missions and battles; every so much experience is a skill point, spent at Ghost HQ (the training board by
// the operations table, or the menu's Skills tab) on ranks in eight skills. Pure: the numbers and what they
// come to; the game applies the multipliers (player.skills, arsenal.skills).

export const XP = {
  success: 120, partial: 70, failed: 25, battleWon: 100, battleLost: 40,
  objective: 30,            // each objective done
  trophy: 60,               // each trophy new to the run
  perPoint: 300,            // experience for each skill point
};

// rank r of each: what it does (a multiplier, 1 at rank 0)
export const SKILLS = {
  hacker:   { name: 'Hacker', ranks: 3, about: 'Hacking - terminals, devices, downloads - goes 15% faster a rank.', mul: (r) => 1 + 0.15 * r },
  ghost:    { name: 'Light Feet', ranks: 3, about: 'You make 12% less noise moving, a rank.', mul: (r) => 1 - 0.12 * r },
  shadow:   { name: 'Shadow', ranks: 3, about: 'Guards take 8% longer to make you out, a rank.', mul: (r) => 1 - 0.08 * r },
  steady:   { name: 'Steady Hands', ranks: 3, about: 'Your rounds spread 10% less, a rank.', mul: (r) => 1 - 0.1 * r },
  reload:   { name: 'Quick Hands', ranks: 3, about: 'Reloading takes 10% less time, a rank.', mul: (r) => 1 - 0.1 * r },
  tough:    { name: 'Hard to Kill', ranks: 3, about: 'You take 8% less damage, a rank.', mul: (r) => 1 - 0.08 * r },
  wind:     { name: 'Second Wind', ranks: 3, about: 'Your stamina comes back 20% faster, a rank.', mul: (r) => 1 + 0.2 * r },
  breacher: { name: 'Breacher', ranks: 2, about: 'Kicks land 25% harder, a rank: sturdy doors give sooner.', mul: (r) => 1 + 0.25 * r },
};

// experience from one mission or battle
export function xpFor(r) {
  let xp = 0;
  if (r.battle) xp += r.won ? XP.battleWon : XP.battleLost;
  else xp += r.result === 'success' ? XP.success : r.result === 'partial' ? XP.partial : XP.failed;
  xp += (r.objectives || 0) * XP.objective + (r.trophies || 0) * XP.trophy;
  return xp;
}
// points earned in all, at so much experience
export const pointsAt = (xp) => Math.floor((xp || 0) / XP.perPoint);
// what is left to spend
export function pointsLeft(state) {
  const spent = Object.values(state.ranks || {}).reduce((a, b) => a + b, 0);
  return pointsAt(state.xp) - spent;
}
// spend a point on a skill: the new state, or null if it cannot be
export function train(state, id) {
  const s = SKILLS[id];
  if (!s) return null;
  const r = (state.ranks || {})[id] || 0;
  if (r >= s.ranks || pointsLeft(state) <= 0) return null;
  return Object.assign({}, state, { ranks: Object.assign({}, state.ranks, { [id]: r + 1 }) });
}
// the multipliers, by skill id
export function effects(state) {
  const out = {};
  for (const [id, s] of Object.entries(SKILLS)) out[id] = s.mul(((state && state.ranks) || {})[id] || 0);
  return out;
}
