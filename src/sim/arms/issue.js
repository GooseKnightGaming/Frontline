// FRONTLINE - what each side's guards carry, from Rhys's weapons sheet (sheet.js).
//
// (Rhys: "Most new weapons are found/captured in the field") the sheet's standard-issue
// weapons are in the enemy's hands: take one from a downed guard and bring it home, and
// it is yours at Logistics from then on. Each side buys from its own makers, so what you
// can capture depends on whom you fight. A guard's behaviour (how he fires: guard.js ARMS)
// is unchanged - only the weapon he carries, and drops, is his side's.
//
// Weapons with a part to play keep it: the hotel's breaching shotgun, the Yellow boss's
// revolver, the classes' kit, the Fortress's launchers - only the everyday kinds are issued.

import { SHEET } from './sheet.js';

// whom each side buys from
export const ISSUE = {
  red: ['Ironmark Industries', 'Blackridge Manufacturing', 'Northstar Ordnance'],
  yellow: ['Kestrel Dynamics', 'Rook & Vale Industries'],
  front: ['Veyra Defense Systems', 'Palisade Arms'],
  ally: ['Palisade Arms', 'Veyra Defense Systems'],
};
// a guard's way of fighting -> the kinds of weapon (the sheet's families) that suit it
export const KINDS = {
  carbine: ['Assault rifle', 'Carbine', 'Battle rifle'],
  pistol: ['Pistol'],
  marksman: ['Sniper rifle'],
  dmr: ['Marksman rifle'],
  smg: ['SMG', 'Machine pistol', 'PDW'],
  lmg: ['Light machine gun', 'Machine gun'],
};
const suits = (it, arms) => (KINDS[arms] || []).includes(it.kind) && !it.nonLethal;

// a steady choice from a list: the same guard always carries the same weapon
function pick(list, seed) {
  let h = 2166136261;
  for (const c of String(seed)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return list[(h >>> 0) % list.length];
}

// the weapon a guard of this side, fighting this way, carries - or null (keep his own)
export function issued(faction, arms, seed) {
  const makers = ISSUE[faction];
  if (!makers || !KINDS[arms]) return null;
  const ids = Object.keys(SHEET).filter((id) => SHEET[id].unlock === 'field' && makers.includes(SHEET[id].maker) && suits(SHEET[id], arms));
  return ids.length ? pick(ids, faction + ':' + seed) : null;
}
