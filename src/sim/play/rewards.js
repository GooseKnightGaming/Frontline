// FRONTLINE - the weapons a mission gives you for completing it (Rhys: "Most new weapons are
// found/captured in the field. Some are from completing particular missions").
//
// The sheet's Unlock weapons (sheet.js, unlock: 'mission'), one per mission. A FIRST PASS for
// Rhys to change: each is matched to its mission's feel. Complete the mission (not failed, not
// withdrawn from) and the weapon is at Logistics in Ghost HQ from then on, for that save slot.
// Like trophies, nothing says beforehand what a mission gives.

export const REWARDS = {
  mission0: 'RV22S',      // Level 0, the Training Mission: a quiet .22 to start with
  hotel: 'PA9T',          // the Riverside Hotel: the tranquilliser pistol - hostages, quietly
  factory: 'IM12B',       // the Derelict Factory: the breaching shotgun
  casino: 'KDC4',         // the Casino: a machine pistol that hides under a dinner jacket
  train: 'KDNL2',         // the Night Train: the stun carbine - a full carriage, no killing
  sewers: 'HPC',          // the Sewers: the plasma shotgun, for tunnels
  manor: 'NSM1',          // the Manor House: the lever-action, from the gun room
  mine: 'KDHX',           // the Mineshaft
  facility: 'VARX1',      // the Research Facility: an experimental energy weapon
  vantage: 'NSH14',       // the Assassination: the long-range anti-materiel rifle
  campus: 'HASL1',        // the Campus
  shipyard: 'IM120',      // the Shipyard
  fortress: 'NSHM2',      // the Fortress: its heavy machine gun
  beachhead: 'PA95',      // the Beachhead (a battle won)
  ruins: 'NXLR2',         // the Desolated City: the long-range laser
  wasteland: 'HX9',       // the Nuclear Wasteland: the electromagnetic rifle
  temple: 'VAR7',         // the Ancient Temple
  bunkers: 'BR50AM',      // Bunkers and Open Ground
  airport: 'VDEMP',       // the Airport: the EMP launcher
  spaceport: 'NX3',       // the Space Port: the prototype coil weapon
  subway: 'KDSL4',        // the Subway: the squad laser
};

// what completing this mission gives - an item id, or null (failed, withdrawn, or none set)
export function rewardFor(mission, result, withdrew) {
  if (!mission || result === 'failed' || withdrew) return null;
  return REWARDS[mission] || null;
}
