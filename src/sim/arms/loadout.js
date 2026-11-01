// FRONTLINE - what you carry.
//
// Five slots: primary, backup, two utility, one gear. A slot takes anything of
// the right SIZE, not the right "category", so two sidearms, or a double
// helping of breaching charges, are legal loadouts. Real-world weapons are
// referred to by invented designations, close enough to be readable without
// borrowing anyone's trademarks.

export const SLOTS = ['primary', 'backup', 'utility1', 'utility2', 'gear'];
export const SLOT_TAKES = {
  primary: ['primary', 'backup'],   // nothing stops you carrying a sidearm as your main
  // (Rhys: "any gun in any slot, yes please") two snipers, two
  // pistols: legal, and paid for in weight and in what each is bad at
  backup: ['primary', 'backup'],
  utility1: ['utility'],
  utility2: ['utility'],
  gear: ['gear'],
};
export const SLOT_KEY = { 1: 'primary', 2: 'backup', 3: 'utility1', 4: 'utility2', 5: 'gear' };

import { SHEET } from './sheet.js';

// ── families: shared behaviour, different numbers ──────────────────────────
export const FAMILIES = {
  knife:   { kg: 0.4, kind: 'melee', size: 'backup', label: 'Blade' },
  pistol:  { kg: 1.0, kind: 'gun', size: 'backup', label: 'Sidearm' },
  smg:     { kg: 3.0, kind: 'gun', size: 'primary', label: 'Submachine gun' },
  rifle:   { kg: 3.6, kind: 'gun', size: 'primary', label: 'Assault rifle' },
  shotgun: { kg: 3.8, kind: 'gun', size: 'primary', label: 'Shotgun' },
  sniper:  { kg: 6.0, kind: 'gun', size: 'primary', label: 'Sniper rifle' },
  grenade: { kg: 0.45, kind: 'throwable', size: 'utility', label: 'Grenade' },
  charge:  { kg: 0.6, kind: 'placeable', size: 'utility', label: 'Charge' },
  aid:     { kg: 0.5, kind: 'usable', size: 'utility', label: 'Field aid' },
  gear:    { kg: 0.6, kind: 'gear', size: 'gear', label: 'Gear' },
  // (Rhys's sheet: the HAS-L3 and HLP-2) directed energy: no rounds, heat instead
  energy:  { kg: 3.5, kind: 'gun', size: 'primary', label: 'Energy weapon' },
  // (Rhys's Heavy) a launcher: a gun that fires something that bursts
  launcher: { kg: 6, kind: 'gun', size: 'primary', label: 'Launcher' },
  // (Rhys: "a 'Special' can be either additional gear OR a perk") never in a slot
  perk:    { kg: 0, kind: 'perk', size: 'special', label: 'Special' },
};

// ── the catalogue ──────────────────────────────────────────────────────────
// damage / rate (seconds between shots) / mag / reserve / reload seconds
// spread in radians from the hip, adsSpread when aiming, recoil per shot.
export const ITEMS = {
  // blades
  // `best` is the range a weapon is good to; past it, damage falls away
  KNIFE:    { name: 'Combat Knife', family: 'knife', damage: 55, rate: 0.55, range: 1.9, model: 'Dagger' },
  // sidearms
  // (Rhys: the V-27C and the PX9 "feel like reskins of the basic
  // pew-pew") each its own character now:
  // the PX9: the full-size service pistol. One round a press, but a heavy one;
  // it carries, and aimed it is the most precise sidearm you can carry. Slower
  // to bring up, a stiffer kick.
  PX9:      { name: 'PX9 Sidearm', family: 'pistol', pen: 1, damage: 30, best: 48, rate: 0.2, mag: 15, reserve: 60, reload: 1.6,
              spread: 0.011, adsSpread: 0.0028, recoil: 0.034, pull: 0.1, moveSpread: 0.034, draw: 0.32, model: 'Pistol_1',
              trait: 'Heavy rounds; precise when aimed; carries further' },
  V99:      { name: 'V99 Compact', kg: 0.8, family: 'pistol', pen: 1, damage: 21, best: 30, rate: 0.11, mag: 18, reserve: 72, reload: 1.35,
              spread: 0.013, adsSpread: 0.0045, recoil: 0.019, moveSpread: 0.03, model: 'Pistol_1' },
  // (Rhys's casino kit) a compact sidearm, quiet with its silencer
  // the V-27C: a compact machine pistol - three rounds a press, close in; quick
  // to draw and to reload, steady on the move, little kick a round - but the
  // burst spreads, and its rounds lose their force sooner
  V27C:     { name: 'V-27C Compact', kg: 0.8, family: 'pistol', pen: 1, damage: 19, best: 20, rate: 0.34, burst: 3, burstGap: 0.055, mag: 18, reserve: 72, reload: 1.1,
              spread: 0.015, adsSpread: 0.0055, recoil: 0.012, pull: 0.08, moveSpread: 0.012, bloom: 1.4, draw: 0.12, model: 'Pistol_1',
              trait: 'Three-round bursts; quick to draw and reload; steady on the move; short-ranged' },
  // (Rhys: the Yellows' boss "is equipped with a RV-357, which in-game will just be
  // called 'Revolver'") six heavy rounds, slow to fire and slower to reload (one at a time,
  // in effect), and it takes nothing: no silencer, no sight, no grip, no bigger cylinder
  RV357:    { name: 'Revolver', kg: 1.2, family: 'pistol', pen: 2, damage: 55, best: 40, rate: 0.5, mag: 6, reserve: 36, reload: 2.6, reloadOpen: 0.5, reloadEach: 0.35, revolver: true,
              spread: 0.013, adsSpread: 0.0035, recoil: 0.075, pull: 0.15, moveSpread: 0.045, draw: 0.35, noMods: true, model: 'Pistol_1',
              trait: 'Six heavy rounds; loaded a round at a time (fire to stop loading); takes no attachments' },
  DE50:     { name: 'DE50 Hand Cannon', kg: 2.0, family: 'pistol', pen: 2, damage: 62, best: 45, rate: 0.42, mag: 7, reserve: 28, reload: 2.0,
              spread: 0.016, adsSpread: 0.005, recoil: 0.085, moveSpread: 0.05, model: 'Pistol_1' },
  // (M6.20.10, from Rhys's weapons sheet) Palisade Arms' 9 mm service pistol
  PX19:     { name: 'PX-19 Service Pistol', family: 'pistol', kg: 0.9, pen: 1, damage: 27, best: 33, rate: 0.147, mag: 15, reserve: 60, reload: 1.5,
              spread: 0.012, adsSpread: 0.0035, recoil: 0.025, pull: 0.08, moveSpread: 0.03, draw: 0.25, model: 'Pistol_1',
              trait: 'A sidearm: quick to draw, quick to point, short on reach' },
  // (the sheet) Helix Applied Systems' 2-megawatt laser pistol: it never runs out, only gets too hot to hold
  HLP2:     { name: 'HLP-2 Laser Pistol', family: 'energy', size: 'backup', kg: 1.4, energy: true, beam: true, auto: true, pen: 2, damage: 25, best: 114,
              rate: 0.1, mag: 84, reserve: 0, reload: 3.4, quiet: 0.3, spread: 0.004, adsSpread: 0.001, recoil: 0.002, moveSpread: 0.012, draw: 0.3, model: 'Pistol_1',
              trait: 'A beam: no recoil, no ammunition - heat that builds. Overheated, it cools for 3.4 s' },
  // primaries
  K7:       { name: 'K7 Carbine', family: 'rifle', pen: 2, damage: 22, best: 120, rate: 0.085, mag: 30, reserve: 180, reload: 2.2,
              auto: true, spread: 0.016, adsSpread: 0.006, recoil: 0.022, pull: 0.55, moveSpread: 0.04, model: 'AR_1' },
  VR4:      { name: 'VR4 Battle Rifle', kg: 4.6, roundKg: 0.024, family: 'rifle', pen: 3, damage: 34, best: 150, rate: 0.14, mag: 20, reserve: 120, reload: 2.4,
              auto: true, spread: 0.014, adsSpread: 0.0045, recoil: 0.04, pull: 0.9, moveSpread: 0.045, model: 'AR_1' },
  // (the Fortress) a light machine gun: a long belt, heavy - slow to bring up and to reload
  KR90:     { name: 'KR-90 Light Machine Gun', kg: 8.0, family: 'rifle', pen: 3, damage: 24, best: 140, rate: 0.075, mag: 90, reserve: 270, reload: 5.2,
              auto: true, trait: 'A ninety-round belt; slow to reload', spread: 0.024, adsSpread: 0.009, recoil: 0.026, pull: 0.7, moveSpread: 0.07, model: 'AR_1' },
  // never a single round: the briefest press is three
  MP2:      { name: 'MP2 Machine Pistol', kg: 2.6, family: 'smg', pen: 1, damage: 16, best: 60, rate: 0.06, mag: 32, reserve: 192, reload: 1.9,
              auto: true, minBurst: 3, trait: 'Fully automatic - three rounds for the briefest press', spread: 0.022, adsSpread: 0.01, recoil: 0.014, pull: -0.8, moveSpread: 0.03, model: 'AR_1' },
  // (M6.20.10, the sheet) Veyra's PDW: between a pistol and a rifle
  V19P:     { name: 'V-19P PDW', family: 'smg', size: 'backup', kg: 2.3, pen: 1, damage: 20, best: 37, rate: 0.076, mag: 35, reserve: 180, reload: 1.7,
              auto: true, spread: 0.02, adsSpread: 0.008, recoil: 0.011, pull: 0.3, moveSpread: 0.022, draw: 0.2, model: 'AR_1',
              trait: 'Between a pistol and a rifle: handy indoors, weak past a corridor' },
  // (the sheet: Ironmark's "Doorknocker") a compact semi-automatic shotgun, eight pellets a shell
  IM8S:     { name: 'IM-8S Compact Shotgun', family: 'shotgun', kg: 3.2, pen: 1, damage: 10, pellets: 8, best: 20, rate: 0.36, mag: 8, reserve: 40, reload: 3.4,
              spread: 0.05, adsSpread: 0.035, recoil: 0.07, pull: 0.3, moveSpread: 0.03, draw: 0.3, model: 'AR_1',
              trait: 'Semi-automatic; eight pellets a shell: brutal close, next to nothing at range' },
  // (the sheet: Helix's "Torch") a compact laser carbine: a continuous beam until it overheats
  HASL3:    { name: 'HAS-L3 Laser Carbine', family: 'energy', kg: 3.8, energy: true, beam: true, auto: true, pen: 3, damage: 30, best: 211,
              rate: 0.1, mag: 103, reserve: 0, reload: 4.0, quiet: 0.35, spread: 0.003, adsSpread: 0.0008, recoil: 0.002, moveSpread: 0.01, draw: 0.35, model: 'AR_1',
              trait: 'A beam: no recoil, no drop, no ammunition - heat that builds. Ten seconds of it, then 4 s to cool' },
  // (Rhys: "If it's labelled as a 'Breaching Shotgun', I expect it to be able to
  // breach with a similar effect as C5") a heavy slug, short reach - and a door within 3 m,
  // shot, comes off its hinges as a charge would take it (any door: reinforced too)
  BR12:     { name: 'BR-12 Breaching Shotgun', family: 'shotgun', pen: 2, damage: 60, best: 15, rate: 0.9, mag: 5, reserve: 25, reload: 3.0,
              spread: 0.035, adsSpread: 0.02, recoil: 0.12, pull: 0.3, moveSpread: 0.05, breach: true, breachReach: 3,
              trait: 'Breaching: a door within 3 m comes off its hinges, as with C5', model: 'AR_1' },
  LR7:      { name: 'LR7 Marksman', family: 'sniper', pen: 3, damage: 95, best: 400, rate: 1.25, mag: 5, reserve: 25, reload: 3.0,
              spread: 0.03, adsSpread: 0.0004, recoil: 0.09, moveSpread: 0.08, zoom: 4, model: 'Sniper_1' },
  // (Rhys: the casino's marksman with "a VX-40 instead") a
  // semi-automatic marksman rifle: lighter rounds than the LR7, ten of them,
  // as fast as you can press
  VX40:     { name: 'VX-40 Marksman', kg: 5.0, family: 'sniper', pen: 3, damage: 58, best: 220, rate: 0.32, mag: 10, reserve: 50, reload: 2.5,
              spread: 0.024, adsSpread: 0.0008, recoil: 0.05, pull: 0.2, moveSpread: 0.06, zoom: 3, draw: 0.45, model: 'Sniper_1',
              trait: 'Semi-automatic; ten rounds; a 3x sight' },
  // (M6.20.10: the sheet's RV-90 "Vale", suppressed) four rounds, subsonic, and a variable sight:
  // , and . step it while aiming
  RV90S:    { name: 'RV-90S Suppressed Sniper', family: 'sniper', kg: 5.0, pen: 3, damage: 90, best: 380, rate: 1.5, mag: 4, reserve: 40, reload: 3.0,
              quiet: 0.25, integral: true, zoom: 4, zooms: [4, 8], spread: 0.026, adsSpread: 0.0005, recoil: 0.07, pull: 0.2, moveSpread: 0.07, draw: 0.45, model: 'Sniper_1',
              trait: 'The RV-90, suppressed: one shot at distance, quietly; a variable 4x/8x scope (, and . while aiming)' },
  LR7X:     { name: 'LR7X Anti-Materiel', kg: 13.0, roundKg: 0.115, family: 'sniper', pen: 4, damage: 150, best: 600, rate: 1.9, mag: 3, reserve: 15, reload: 3.8,
              spread: 0.035, adsSpread: 0.0004, recoil: 0.16, moveSpread: 0.1, zoom: 6, model: 'Sniper_1' },
  // (M6.20.10, the sheet: Kestrel's "Mule") one rocket at a time, reloadable at length; with Vehicle
  // Targeting it locks on to a vehicle close enough in the sight, and follows it
  KDMR3:    { name: 'KD-MR3 Multi-role Launcher', family: 'launcher', kg: 6.5, roundKg: 2.4, pen: 4, launcher: true, breach: true, speed: 48, blast: 5, damage: 234,
              rate: 3.5, mag: 1, reserve: 4, reload: 4.6, spread: 0.008, adsSpread: 0.002, recoil: 0.16, pull: 0.2, moveSpread: 0.05, zoom: 2, draw: 0.6, model: 'Grenade_1',
              trait: 'Vehicles and fortifications - and doors, off their hinges: one rocket, bursting where it lands. Reloadable, at length' },
  // utility
  // NB: the pack's "Grenade_1/2/3" are grenade LAUNCHERS (1.8 m long); only
  // "Grenade" is a grenade. Kept for later: they will do for the launchers.
  FRAG:     { name: 'Frag Grenade', family: 'grenade', count: 3, fuse: 3.0, throw: 17, blast: 7.5, damage: 110, model: 'Grenade' },
  // (M6.28, the roadmap's "EMP grenade") the pulse in a grenade: electronics out a while - no one hurt
  EMPGREN:  { name: 'EMP Grenade', family: 'grenade', kg: 0.5, count: 2, fuse: 2.0, throw: 17, blast: 6, damage: 0, emp: true, model: 'Grenade',
              note: 'A pulse, not a blast: cameras, turrets, lights, alarms, night vision and engines in its reach go out a while; a maglock burns open for good. Hurts no one.' },
  // (M6.29, Rhys: "trackers and remote cameras - placed, they report the enemies in that area; or stuck to one
  // person, his exact whereabouts") thrown: stuck to a man, he is on your radar wherever he goes; on the
  // ground, anyone within 12 m of it is
  TRACKER:  { name: 'Tracker', family: 'grenade', kg: 0.2, count: 3, fuse: 0.4, throw: 15, blast: 0, damage: 0, sticky: true, tracker: true, model: 'Grenade',
              note: 'Throw it: stuck to a man, he shows on your radar wherever he goes; on the ground or a wall, anyone within 12 m of it does (for two minutes).' },
  FLASH:    { name: 'Flashbang', family: 'grenade', count: 2, fuse: 1.8, throw: 17, blast: 9, damage: 0, blind: 4.5, model: 'Grenade' },
  SMOKE:    { name: 'Smoke Grenade', family: 'grenade', count: 2, fuse: 1.4, throw: 16, blast: 8, damage: 0, smoke: 18, model: 'Grenade' },
  // (Rhys's classes: "Standard Issue Grenades, NOT Frags") a smaller blast than a frag
  SERVICE:  { name: 'Service Grenade', family: 'grenade', kg: 0.4, count: 2, fuse: 3.2, throw: 17, blast: 6, damage: 95, model: 'Grenade',
              trait: 'Standard issue: a smaller blast than a frag' },
  // stuns: blinds and deafens for a moment, and barely hurts
  CONCUSS:  { name: 'Concussion Grenade', family: 'grenade', kg: 0.4, count: 2, fuse: 2.0, throw: 17, blast: 7, damage: 18, blind: 2.6, model: 'Grenade',
              trait: 'Stuns whoever is near it for a few seconds; little harm' },
  // sticks to whoever (or whatever) it hits, and burns
  INCEND:   { name: 'Sticky Incendiary', family: 'grenade', kg: 0.5, count: 3, fuse: 2.5, throw: 15, blast: 3.5, damage: 40, sticky: true, gas: 'fire', burn: 10, model: 'Grenade',
              trait: 'Sticks where it lands - or to whoever it hits - and burns' },
  NERVE:    { name: 'Neurotoxic Gas Grenade', family: 'grenade', kg: 0.5, count: 2, fuse: 1.6, throw: 16, blast: 6, damage: 0, gas: 'nerve', smoke: 14, model: 'Grenade',
              trait: 'A cloud that kills whoever breathes it - you too, without a gas mask' },
  // (the Jump Trooper's) burst where they land: made to be dropped from above
  AIRINC:   { name: 'Air-drop Incendiary', family: 'grenade', kg: 0.6, count: 2, fuse: 8, impact: true, throw: 9, blast: 5, damage: 50, gas: 'fire', burn: 14, model: 'Grenade',
              trait: 'Bursts on landing, and the ground burns: drop it from above' },
  AIRFLARE: { name: 'Air-drop Illumination', family: 'grenade', kg: 0.4, count: 2, fuse: 8, impact: true, throw: 9, blast: 0, damage: 0, flare: 30, model: 'Grenade',
              trait: 'A flare that lights up the ground it lands on for half a minute' },
  // charges are placed one after another and set off together (Rhys:
  // chainable explosives): fire places the next, right mouse sets them all off
  C5:       { name: 'C5 Charge', family: 'charge', count: 2, fuse: 0, throw: 9, blast: 6, damage: 180, breach: true, chain: true, insulated: true, model: 'Grenade' },
  // (Rhys: "insulated" and "non-insulated" explosives) C5 is insulated - only your key sets it off; mines
  // are not: a blast near enough (sympathy: metres) sets them off too, whatever caused it
  REMOTE:   { name: 'Remote Mine', family: 'charge', count: 3, fuse: 0, throw: 9, blast: 5, damage: 160, chain: true, sympathy: 6, model: 'Grenade' },
  PROXMINE: { name: 'Proximity Mine', family: 'charge', count: 3, fuse: 0, throw: 9, blast: 4.5, damage: 150, chain: true, prox: 1.8, arm: 2.5, sympathy: 6, model: 'Grenade' },
  // (Rhys: "Lures (Remote-Activated Lure Devices)") placed like a
  // charge and set off the same way - from wherever you are - it makes a noise
  // the reds come to look into: three bursts of an alarm's chirp
  LURE:     { name: 'Lure Device', family: 'charge', count: 2, fuse: 0, throw: 9, blast: 0, damage: 0, chain: true, lure: true, noise: 1.3, model: 'Grenade' },
  // (the Heavy's) anti-vehicle: people walk over it; a vehicle does not
  LANDMINE: { name: 'Landmine', family: 'charge', kg: 1.5, count: 4, fuse: 0, throw: 6, blast: 6, damage: 300, chain: true, prox: 2.6, arm: 3, vehicleOnly: true, sympathy: 6, model: 'Grenade',
              trait: 'Anti-vehicle: only a vehicle sets it off' },
  // (the Medic's) patches you up and tops up your guns
  AIDPACK:  { name: 'Health & Ammo Pack', family: 'aid', kg: 0.8, count: 4, heals: 35, ammo: true, useTime: 1.6, model: 'Grenade',
              trait: 'Heals some, and a magazine more for each gun you carry' },
  // (the Pilot's) never used up, but slow: stand by a vehicle and use it
  REPAIRKIT: { name: 'Vehicle Repair Kit', family: 'aid', kg: 3, count: 1, repair: 0.15, endless: true, useTime: 3, model: 'Grenade',
              trait: 'By a vehicle: three seconds\' work mends a sixth of it. Never runs out' },
  MEDKIT:   { name: 'Field Medkit', family: 'aid', count: 2, heals: 60, useTime: 2.4, model: 'Grenade' },
  // (Rhys: Room 201) one use, and it puts you right at once
  MEDKIT_FULL: { name: 'Trauma Kit', family: 'aid', count: 1, heals: 100, useTime: 0.3, model: 'Grenade' },
  // gear
  // (Rhys's Trooper: "allows them to carry more spare ammo ... reduces weight-cost of ammo")
  WEBBING:  { name: 'Load-Bearing Webbing', family: 'gear', kg: 1.2, ammoCarry: 1.5, ammoKg: 0.5,
              note: 'Half as many spare rounds again, and they weigh half as much.' },
  // (the Jump Trooper's) "self-fuelling jetpack, but fuel regens slowly"
  JUMPPACK: { name: 'Jump Pack', family: 'gear', kg: 9, jet: true,
              note: 'Hold SPACE in the air to fly up. It refuels slowly, on the ground. It steers a little.' },
  NVG:      { name: 'Night Vision Goggles', family: 'gear', nightSight: 1, flashResist: -0.6,
              note: 'V to see in the dark. A flash while they are down is far worse.' },
  IRGOGS:   { name: 'Thermal Goggles', family: 'gear', heatSight: 1, flashResist: 0.2,
              note: 'Warm bodies show through smoke and dark.' },
  UVGOGS:   { name: 'UV Goggles', family: 'gear', uvSight: 1,
              note: 'Shows marks, prints and traces others leave behind.' },
  // the electromagnetic scanner: wiring, bugs, live devices, radios
  EMFSCAN:  { name: 'EMF Scanner', family: 'gear', emfSight: 1,
              note: 'Shows wiring, hidden devices and live electronics through walls.' },
  // (the Research Facility) all four in one visor: V steps through them
  MULTIVIS: { name: 'Multi-spectrum Visor', kg: 1.0, family: 'gear', nightSight: 1, heatSight: 1, uvSight: 1, emfSight: 1, flashResist: -0.3,
              note: 'V steps through night vision, thermal, UV and EMF.' },
  SHADES:   { name: 'Tinted Visor', family: 'gear', glare: 1, flashResist: 0.25,
              note: 'Cuts glare and sunlight. Barely helps against a flashbang.' },
  GASMASK:  { name: 'Gas Mask', kg: 0.8, family: 'gear', gas: true, muffled: 0.5,
              note: 'Gas does nothing to you. You hear less through it.' },
  // SPACE in a fall opens it: a steerable canopy down
  PARACHUTE: { name: 'Parachute Pack', kg: 3.0, family: 'gear', chute: true,
              note: 'Jump from high up, then SPACE to open it. Steer with the mouse; W to glide on, S to hang back.' },
  LENSES:   { name: 'Polarised Lenses', family: 'gear', flashResist: 0.85,
              note: 'Flashbangs barely register.' },
  INTEL:    { name: 'Intel Device', family: 'gear', marks: true,
              note: 'Anyone you have seen stays marked on your compass.' },
  LOCKKIT:  { name: 'Lockpicks', family: 'gear', picks: true, note: 'Hold E at an ordinary locked door: it opens in a few seconds, quietly (not maglocks, vaults or reinforced doors).' },
  // (Rhys: two "Trauma Kits") the gear one, renamed; the Trauma Kit is the one-use utility (Room 201's)
  MEDGEAR:  { name: 'Haemostatic Dressings', kg: 1.2, family: 'gear', healRate: 2.2, note: 'You recover from wounds faster.' },
  // specials: issued for a mission, or by your class - outside the five slots
  CAMO:     { name: 'Special Camouflage', family: 'perk', kg: 1.0, camo: 0.6, note: 'Harder to see with the naked eye - all the more when prone.' },
  QID:      { name: 'Quick Intel Device', family: 'perk', kg: 0.3, hackSpeed: 2, note: 'Hacking and downloading take half the time.' },
  // (Rhys's roadmap: "taken over at a terminal or with a hacking kit") hold E at a camera or turret, close by
  HACKKIT:  { name: 'Hacking Kit', family: 'perk', kg: 0.8, hackKit: true, note: 'Hold E at a camera, turret, maglock keypad, lighting panel or alarm, close by: disable it, reprogram it to ignore you, or take it over. Slower than a security terminal.' },
  // (M6.29) Q Branch's gadgets - signed out at his bench in Ghost HQ, carried on every mission as a Special
  QRELAY:   { name: 'Long-Arm Relay', family: 'perk', kg: 0.9, hackKit: true, hackReach: 10, q: true, note: 'A hacking kit with a dish: hack a camera, turret, lock or panel from up to 10 m away - in sight of it.' },
  QSPOOF:   { name: 'Loop Spoofer', family: 'perk', kg: 0.4, camSlow: 3, q: true, note: 'Feeds the cameras a loop: they take three times as long to make you out.' },
  QSCRAMBLE: { name: 'Trace Scrambler', family: 'perk', kg: 0.5, traceMul: 0.4, q: true, note: 'Bounces your hacks round the world: a trace takes two and a half times as long.' },
  QSNAKE:   { name: 'Snake Camera', family: 'perk', kg: 0.3, snakeCam: true, q: true, note: 'Crouch at a shut door and press E: a camera on a cable slides under it, and you see the other side. Move, or E, to stop.' },
  QSKELETON: { name: 'Skeleton Card', family: 'perk', kg: 0.1, maglockCard: true, q: true, note: 'Swipe it at a maglock\'s keypad (hold E, 2 s): the door is yours - quietly, and no trace.' },
  LOCKON:   { name: 'Vehicle Targeting', family: 'perk', lockOn: 45, note: 'Aim a launcher at a vehicle within 45 m: it locks on, and the rocket follows it.' },
  AUTOREPAIR: { name: 'Auto-Repair', family: 'perk', autoRepair: 0.02, note: 'A vehicle you are driving slowly mends itself.' },
  CUSHION:  { name: 'Cushioned Landing', family: 'perk', fallMul: 0.3, note: 'Falls hurt far less.' },
  // (M6.29, M7's "diving gear (rebreathers, closed-circuit)") a closed-circuit rebreather: no bubbles, and air
  // for as long as you like under water
  REBREATHER: { name: 'Rebreather', kg: 2.8, family: 'gear', breathMul: 0, note: 'Closed-circuit diving set: under water as long as you like, and no bubbles to give you away.' },
  // (M6.28, the roadmap's "hacking suit") a suit woven with a mesh that scatters a camera's sensor: they
  // cannot make you out at all (people can, as ever); heavy and warm
  HACKSUIT: { name: 'Hacking Suit', kg: 2.4, family: 'gear', camBlind: true, note: 'Cameras cannot make you out at all - guards still can. Heavy.' },
  DEMOKIT:  { name: 'Demolition Kit', kg: 1.5, family: 'gear', blastBonus: 0.3, note: 'Your charges do more, and arm faster.' },
};
// Rhys's weapons sheet (sheet.js, written from docs/Frontline_Weapons.xlsx): every weapon on it
// joins the catalogue - except those already here by hand (the class kit), which keep their tuning
for (const [id, it] of Object.entries(SHEET)) if (!ITEMS[id]) ITEMS[id] = it;

// Ammunition: not carried in a slot, taken from a crate straight into reserve.
// (Rhys: "carried ammo ... should have weight") kilograms a round - real
// figures: a 9 mm or 5.56 round is about 12 g, a full-power rifle round 25 g,
// a shotgun shell 40 g; a weapon can say otherwise (the LR7X's are 115 g)
export const ROUND_KG = { AMMO_PISTOL: 0.012, AMMO_RIFLE: 0.012, AMMO_SNIPER: 0.025, AMMO_SHELLS: 0.04, AMMO_ROCKET: 2.4 };
export const AMMO = {
  AMMO_PISTOL: { name: 'Pistol Ammunition', families: ['pistol'], rounds: 60 },
  AMMO_RIFLE:  { name: 'Rifle Ammunition', families: ['rifle', 'smg'], rounds: 150 },
  AMMO_SNIPER: { name: 'Sniper Ammunition', families: ['sniper'], rounds: 25 },
  AMMO_SHELLS: { name: 'Shotgun Shells', families: ['shotgun'], rounds: 20 },
  AMMO_ROCKET: { name: 'Rockets', families: ['launcher'], rounds: 2 },
};

// What a round can get through (a weapon's `pen`) against how tough a surface
// is. Glass 1, thin walls 2, toughened glass 3, bulletproof glass cannot be
// shot through at all, and nor can ordinary walls.
export const TOUGHNESS = { glass: 1, thin: 2, toughened: 3 };
export const PASS_DAMAGE = { glass: 0.85, thin: 0.6, toughened: 0.5 };

// ── mods: found in crates, fitted at Logistics or at a bench ───────────────
export const MODS = {
  SILENCER:  { tag: 'silenced', name: 'Silencer', kg: 0.3, fits: ['pistol', 'smg', 'rifle', 'sniper'], quiet: 0.25, damage: -0.1, group: 'barrel',
               note: 'Much quieter. Slightly less punch.' },
  SCOPE2:    { tag: 'scoped 2x', name: '2x Optic', kg: 0.2, fits: ['pistol', 'smg', 'rifle', 'shotgun'], zoom: 2, adsSpread: -0.3,
               note: 'A modest sight for close work.' },
  SCOPE8:    { tag: 'scoped 8x', name: '8x Scope', kg: 0.6, fits: ['sniper'], zoom: 8, adsSpread: -0.5, moveSpread: 0.4,
               note: 'Reach out further. Harder to use on the move.' },
  GRIP:      { tag: 'foregrip', name: 'Foregrip', kg: 0.25, fits: ['smg', 'rifle', 'shotgun'], recoil: -0.3, moveSpread: -0.25, pull: -0.4,
               clashes: ['EXTMAG'],
               note: 'Steadier, especially in bursts.' },
  EXTMAG:    { tag: 'extended magazine', name: 'Extended Magazine', kg: 0.25, fits: ['pistol', 'smg', 'rifle', 'sniper'], mag: 0.5, reload: 0.15,
               note: 'Half again as many rounds; a moment longer to change.' },
  // grenade fills: what is in the tin
  FILL_CS:   { tag: 'CS fill', name: 'CS Fill', fits: ['grenade'], only: 'SMOKE', gas: 'cs',
               note: 'Tear gas. It clears a room without breaking it.' },
  FILL_WP:   { tag: 'phosphorous fill', name: 'Phosphorous Fill', fits: ['grenade'], only: 'SMOKE', gas: 'wp', damage: 45,
               note: 'Burns. Neither cover nor conscience survives it.' },
};

// (Rhys: listed in YOUR GEAR "as (silenced), (scoped) or whatever
// else may apply") what a weapon's mods make it, in a word or two each
// the prompt over a crate: never what is in it
export const cratePrompt = (c) => 'E  Open ' + (c && c.infinite && c.label ? c.label : 'crate');
export const modTags = (mods) => (mods || []).map((m) => (MODS[m] && MODS[m].tag) || null).filter(Boolean);
export const withTags = (name, mods) => { const t = modTags(mods); return t.length ? name + ' (' + t.join(', ') + ')' : name; };

export function itemSize(id) {
  const it = ITEMS[id];
  if (!it) return null;
  return it.size || FAMILIES[it.family].size;     // a laser pistol is an energy weapon the size of a sidearm
}
// A carried item's key (Rhys: a double helping is a double helping).
// The same item in two slots is two things - two pistols with a magazine each,
// two pairs of smoke grenades, each with its own mods. The first slot holding
// an item keys it by its id, as always; a second copy is "id@slot".
export function baseId(key) { return key ? String(key).split('@')[0] : key; }
export function itemKind(id) {
  const it = ITEMS[baseId(id)];
  return it ? FAMILIES[it.family].kind : null;
}
// (Rhys: "guns have weight, and weight should affect you") an
// item's weight in kilograms: the family's, unless the item says otherwise;
// grenades, charges and kits weigh what one does times how many you carry
// and its rounds: not those in the magazine (Rhys: carried ammo "that
// isn't in your current magazines"), the spare ones - a gun's reserve
export function ammoKindOfItem(id) {
  const it = ITEMS[baseId(id)];
  return it ? Object.keys(AMMO).find((k) => AMMO[k].families.indexOf(it.family) >= 0) || null : null;
}
export function roundKg(id) {
  const it = ITEMS[baseId(id)];
  if (!it) return 0;
  return it.roundKg != null ? it.roundKg : ROUND_KG[ammoKindOfItem(id)] || 0;
}
// opts: { count, reserve, mods, ammoKg } - what is actually there; without them, a full issue
export function itemWeight(id, opts) {
  const it = ITEMS[baseId(id)];
  if (!it) return 0;
  opts = opts || {};
  const each = it.kg != null ? it.kg : (FAMILIES[it.family].kg || 0);
  let kg = it.count ? each * (opts.count != null ? opts.count : it.count) : each;
  if (it.mag) kg += roundKg(id) * (opts.reserve != null ? opts.reserve : it.reserve || 0) * (opts.ammoKg != null ? opts.ammoKg : 1);
  for (const m of opts.mods || []) kg += (MODS[m] && MODS[m].kg) || 0;
  return kg;
}
// What a load does to you. Up to LOAD_FREE kg you carry it without noticing;
// past it, every kilo slows you, tires you sooner on a sprint and makes you a
// little louder - to a floor of 78% speed at LOAD_HEAVY and beyond. (
// rounds and mods weigh now, so the free allowance went up: the standard kit,
// with its spare magazines, is 10.3 kg)
export const LOAD_FREE = 11, LOAD_HEAVY = 26;
export function loadEffect(kg) {
  const over = Math.max(0, Math.min(1, (kg - LOAD_FREE) / (LOAD_HEAVY - LOAD_FREE)));
  return { kg, over, speed: 1 - 0.22 * over, drain: 1 + 0.9 * over, noise: 1 + 0.35 * over,
           label: over <= 0 ? 'Light' : over < 0.34 ? 'Moderate' : over < 0.67 ? 'Heavy' : 'Very heavy' };
}
export function fits(id, slot) {
  const size = itemSize(id);
  return !!size && (SLOT_TAKES[slot] || []).indexOf(size) >= 0;
}
// The slot an item would go in by default (primary prefers primary, and a
// sidearm goes to backup unless backup is taken and primary is free).
export function defaultSlot(id, current) {
  const size = itemSize(id);
  if (size === 'primary') return 'primary';
  if (size === 'gear') return 'gear';
  if (size === 'utility') return current && !current.utility1 ? 'utility1' : (current && current.utility1 && !current.utility2 ? 'utility2' : 'utility1');
  if (size === 'backup') {
    if (current && !current.backup) return 'backup';
    if (current && !current.primary) return 'primary';
    return 'backup';
  }
  return null;
}

// Numbers for an item once its mods are fitted.
export function statsOf(id, mods) {
  const base = ITEMS[id];
  if (!base) return null;
  const out = Object.assign({}, base);
  out.mods = (mods || []).slice();
  for (const m of out.mods) {
    const mod = MODS[m];
    if (!mod) continue;
    if (mod.damage) out.damage = Math.round((out.damage || 0) * (1 + mod.damage) * (mod.damage > 1 ? 0 : 1) + (mod.damage > 1 ? mod.damage : 0));
    if (mod.zoom) out.zoom = mod.zoom;
    if (mod.adsSpread && out.adsSpread) out.adsSpread *= (1 + mod.adsSpread);
    if (mod.spread && out.spread) out.spread *= (1 + mod.spread);
    if (mod.moveSpread && out.moveSpread) out.moveSpread *= (1 + mod.moveSpread);
    if (mod.recoil && out.recoil) out.recoil *= (1 + mod.recoil);
    if (mod.pull && out.pull) out.pull *= (1 + mod.pull);
    if (mod.mag && out.mag) out.mag = Math.round(out.mag * (1 + mod.mag));
    if (mod.reload && out.reload) out.reload *= (1 + mod.reload);
    if (mod.quiet) out.quiet = mod.quiet;
    if (mod.gas) out.gas = mod.gas;
  }
  return out;
}
export function modFits(modId, itemId) {
  const mod = MODS[modId], it = ITEMS[itemId];
  if (!mod || !it) return false;
  if (it.noMods) return false;                     // the Revolver, as it comes, and nothing else
  if (mod.only && mod.only !== itemId) return false;
  if (it.integral && mod.quiet) return false;      // it has one built in
  return mod.fits.indexOf(it.family) >= 0;
}

// ── the loadout itself ─────────────────────────────────────────────────────
export class Loadout {
  constructor(start) {
    this.slots = { primary: null, backup: null, utility1: null, utility2: null, gear: null };
    this.mods = {};                  // slot -> [modId]
    // (Rhys: a mission that needs an item "grants you a 'Special' slot
    // specifically for that item ... which doesn't interfere with your loadout")
    this.specials = [];              // item ids: the mission's first, then your class's
    if (start) for (const [slot, id] of Object.entries(start)) this.put(slot, id);
  }
  get(slot) { return this.slots[slot] || null; }
  list() { return SLOTS.map((s) => this.slots[s]).filter(Boolean); }
  has(id) { return SLOTS.some((s) => this.slots[s] === id); }
  slotOf(id) { return SLOTS.find((s) => this.slots[s] === id) || null; }
  // what the arsenal calls the item in a slot: its id, or id@slot for a second copy
  keyOf(slot) {
    const id = this.slots[slot];
    if (!id) return null;
    return SLOTS.find((s) => this.slots[s] === id) === slot ? id : id + '@' + slot;
  }
  keys() { return SLOTS.map((s) => this.keyOf(s)).filter(Boolean); }
  slotOfKey(key) {
    if (!key) return null;
    const at = String(key).indexOf('@');
    if (at >= 0) { const slot = key.slice(at + 1); return this.slots[slot] === key.slice(0, at) ? slot : null; }
    return this.slotOf(key);
  }
  // Put an item in a slot; returns whatever was displaced (or false if it won't fit).
  put(slot, id, mods) {
    if (!SLOTS.includes(slot)) return false;
    if (id && !fits(id, slot)) return false;
    const out = this.slots[slot] ? { id: this.slots[slot], mods: this.mods[slot] || [] } : null;
    this.slots[slot] = id || null;
    this.mods[slot] = id ? (mods || []).filter((m) => modFits(m, id)) : [];
    return out;
  }
  take(slot) { return this.put(slot, null); }
  fit(slot, modId) {
    const id = this.slots[slot];
    if (!id || !modFits(modId, id)) return false;
    const list = this.mods[slot] || (this.mods[slot] = []);
    if (list.includes(modId)) return false;
    // one optic and one fill at a time
    // one per slot on the weapon, and some simply do not go together
    const group = (m) => MODS[m].group || (MODS[m].zoom ? 'optic' : MODS[m].gas ? 'fill' : m);
    const g = group(modId);
    const bad = (MODS[modId].clashes || []);
    const clash = list.find((m) => group(m) === g || bad.indexOf(m) >= 0 || (MODS[m].clashes || []).indexOf(modId) >= 0);
    if (clash) list.splice(list.indexOf(clash), 1);
    list.push(modId);
    return clash || true;
  }
  unfit(slot, modId) {
    const list = this.mods[slot] || [];
    const i = list.indexOf(modId);
    if (i < 0) return false;
    list.splice(i, 1);
    return true;
  }
  get special() { return this.specials[0] || null; }
  set special(id) { this.specials = id ? [id] : []; }
  // ars (an Arsenal), when given: what is actually left - rounds, grenades, the pouch
  weight(ars) {
    const ammoKg = this.gearTrait('ammoKg') || 1;
    let kg = 0;
    for (const s of SLOTS) {
      const id = this.slots[s];
      if (!id) continue;
      const a = ars && ars.ammo ? ars.ammo[this.keyOf(s)] : null;
      kg += itemWeight(id, { count: a && a.count !== undefined ? a.count : null, reserve: a && a.reserve !== undefined ? a.reserve : null, mods: this.mods[s], ammoKg });
    }
    for (const id of this.specials) kg += itemWeight(id);
    if (ars && ars.spare) for (const [k, n] of Object.entries(ars.spare)) kg += (ROUND_KG[k] || 0) * (n || 0) * ammoKg;
    return kg;
  }
  statsFor(slot) {
    const id = this.slots[slot];
    return id ? statsOf(id, this.mods[slot]) : null;
  }
  // What the gear slot (and the Special slot, if a mission gave you one) is doing for you.
  gearTrait(name) {
    const id = this.slots.gear;
    const g = id ? ITEMS[id] : null;
    const v = g ? g[name] : undefined;
    if (v !== undefined) return v;
    for (const id of this.specials) { const sp = ITEMS[id]; if (sp && sp[name] !== undefined) return sp[name]; }
    return undefined;
  }
}

// Picking a weapon up from the floor: the slot it goes in - an
// empty one it fits first, then the one in your hands if it fits, then the
// first it fits - and, once it is in, which slot you are holding: the same
// as before, unless that was the one it replaced (then the new weapon).
// any gun goes in either slot now, so with both full it takes the
// place of one its own size - a rifle the rifle's, a pistol the pistol's - the
// one in your hands if both are; failing that, the one in your hands.
export function pickupSlot(lo, item, handSlot) {
  const WS = ['primary', 'backup'];
  const empty = WS.find((s) => fits(item, s) && !lo.get(s));
  if (empty) return empty;
  const same = WS.filter((s) => fits(item, s) && itemSize(lo.get(s)) === itemSize(item));
  if (same.length) return same.includes(handSlot) ? handSlot : same[0];
  if (handSlot && fits(item, handSlot)) return handSlot;
  return WS.find((s) => fits(item, s)) || null;
}
export const holdAfterPickup = (slot, handSlot) => handSlot || slot;

// ── crates: what you swap out stays in the crate ──────────────────────────
export class Crate {
  constructor(kind, contents, pos) {
    this.kind = kind;                 // 'weapon' | 'gear'
    this.items = (contents || []).slice();
    this.pos = pos || [0, 0, 0];
    this.open = false;
  }
  // (Rhys: swap a spent box in, take it back out - full again,
  // for ever) A box left here keeps what was left in it. Taking one hands
  // over a full box while there is one, then the part-used ones.
  // How many you get with the next `id` taken out (and that box is spoken for).
  takeCount(id) {
    const full = (ITEMS[id] && ITEMS[id].count) || 1;
    this.left = this.left || {};
    const spent = this.left[id] || [];
    const fullBoxes = this.items.filter((x) => x === id).length - spent.length;
    if (fullBoxes > 0) return full;
    return spent.length ? spent.pop() : 0;
  }
  // a box left in the crate, with `count` still in it
  leave(id, count) {
    const full = (ITEMS[id] && ITEMS[id].count) || 1;
    if (count === undefined || count >= full) return;
    this.left = this.left || {};
    (this.left[id] = this.left[id] || []).push(Math.max(0, count));
  }
  // (Rhys: "where's my silencer gone? [a modded weapon should list and retain
  // its mods when in the crate too]") a weapon left here keeps what was fitted to it, and
  // goes back out with it. this.fitted[id]: a list of mod lists, one per modded copy.
  modsOf(id) { return (this.fitted && this.fitted[id]) || []; }
  // what came out of a slot, put in the crate (an endless crate keeps only its mods)
  store(out) {
    if (!out || !out.id) return;
    if (!this.infinite) this.items.push(out.id);
    if (out.mods && out.mods.length) { this.fitted = this.fitted || {}; (this.fitted[out.id] = this.fitted[out.id] || []).push(out.mods.slice()); }
  }
  // the copies of `id` in here, in the order they come out: each one's mods and,
  // for a box, how many are in it
  copies(id) {
    const n = this.infinite ? 1 : this.items.filter((x) => x === id).length;
    const mods = this.modsOf(id).slice().reverse();
    const it = ITEMS[id], full = it && it.count !== undefined ? it.count : undefined;
    const spent = ((this.left && this.left[id]) || []).slice().reverse(), fullBoxes = n - spent.length;
    const out = [];
    for (let k = 0; k < n; k++) out.push({ mods: mods[k] || [], count: full === undefined || this.infinite ? undefined : (k < fullBoxes ? full : spent[k - fullBoxes]) });
    return out;
  }
  // the mods that come out with the next `id` taken (a modded copy first: it is yours)
  takeMods(id) { const l = this.fitted && this.fitted[id]; return l && l.length ? l.pop() : []; }
  // Swap the item in `slot` for `id` from the crate. The old one is left here.
  swap(loadout, slot, id) {
    if (id && !this.infinite && !this.items.includes(id)) return { ok: false, why: 'not in this crate' };
    if (id && !fits(id, slot)) return { ok: false, why: 'does not fit that slot' };
    const mods = id ? this.takeMods(id) : [];
    const displaced = loadout.put(slot, id, mods);
    if (displaced === false) { if (mods.length) (this.fitted[id] = this.fitted[id] || []).push(mods); return { ok: false, why: 'does not fit that slot' }; }
    if (id && !this.infinite) this.items.splice(this.items.indexOf(id), 1);
    this.store(displaced);
    return { ok: true, took: id, left: displaced ? displaced.id : null };
  }
}

// ── classes (Rhys: "B(i) to B(ii) with A(i) for a 'quick-select'") ──
// A class is a starting point, not a cage: it fills the five slots, and gives its
// Special (a piece of kit or a perk) for as long as you are that class - change
// any slot afterwards and you keep it. Rhys's first draft, with the gaps filled.
// (Rhys: the "MASSIVE dropdown list ... is a bit TOO much"; "restrict what each class can
// actually have [maybe Sniper Rifles can only be wielded by Marksmen; Shotguns CAN'T be wielded by
// Marksmen or Troopers]") each class has what it may carry: `guns` go in either weapon slot (so two
// of the class's rifles is still a loadout), `utility` in either utility slot, `gear` in the gear slot.
// `arms`: what one of them carries when he is not you - a comrade or an enemy (guard.js ARMS).
export const CLASSES = [
  { id: 'TROOPER', name: 'Trooper', role: 'Standard footsoldier. The backbone of any army.', arms: 'carbine',
    kit: { primary: 'K7', backup: 'PX19', utility1: 'SERVICE', utility2: 'CONCUSS', gear: 'WEBBING' },
    guns: ['K7', 'VR4', 'MP2', 'V19P', 'PX19', 'PX9', 'V99', 'V27C', 'DE50', 'RV357', 'KNIFE'],
    utility: ['SERVICE', 'FRAG', 'CONCUSS', 'FLASH', 'SMOKE', 'C5', 'MEDKIT'],
    gear: ['WEBBING', 'LENSES', 'NVG', 'IRGOGS', 'SHADES', 'GASMASK'] },
  { id: 'RECON', name: 'Recon', role: 'Essential for scouting out new locations, and for long-range shots.', arms: 'rv90s',
    kit: { primary: 'RV90S', backup: 'V27C', utility1: 'SERVICE', utility2: 'PROXMINE', gear: 'NVG', mods: { backup: ['SILENCER'] } }, special: 'CAMO',
    guns: ['RV90S', 'LR7', 'VX40', 'LR7X', 'V27C', 'PX19', 'PX9', 'V99', 'V19P', 'KNIFE'],
    utility: ['SERVICE', 'FRAG', 'SMOKE', 'FLASH', 'PROXMINE', 'REMOTE', 'LURE'],
    gear: ['NVG', 'IRGOGS', 'MULTIVIS', 'SHADES', 'INTEL', 'LENSES'] },
  { id: 'HEAVY', name: 'Heavy', role: 'Very useful for taking down vehicles.', arms: 'launcher',
    kit: { primary: 'KDMR3', backup: 'PX19', utility1: 'INCEND', utility2: 'LANDMINE', gear: null }, special: 'LOCKON',
    guns: ['KDMR3', 'KR90', 'VR4', 'BR12', 'PX19', 'PX9', 'DE50', 'RV357', 'KNIFE'],
    utility: ['INCEND', 'LANDMINE', 'FRAG', 'SERVICE', 'C5', 'REMOTE', 'SMOKE'],
    gear: ['WEBBING', 'DEMOKIT', 'LENSES', 'GASMASK'] },
  { id: 'MEDIC', name: 'Medic', role: 'Supports the team: heals them, and carries extra ammunition.', arms: 'im8s',
    kit: { primary: 'IM8S', backup: 'PX19', utility1: 'C5', utility2: 'AIDPACK', gear: 'MEDGEAR' },
    guns: ['IM8S', 'BR12', 'MP2', 'V19P', 'K7', 'PX19', 'PX9', 'V27C', 'V99', 'KNIFE'],
    utility: ['AIDPACK', 'MEDKIT', 'MEDKIT_FULL', 'SMOKE', 'FLASH', 'C5'],
    gear: ['MEDGEAR', 'GASMASK', 'LENSES', 'WEBBING'] },
  { id: 'SPY', name: 'Spy', role: 'Infiltrates enemy lines - ideally without being detected. Retrieves information from hard-to-reach, heavily fortified places.', arms: 'v19p',
    kit: { primary: 'V19P', backup: 'V27C', utility1: 'LURE', utility2: 'NERVE', gear: 'GASMASK', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } }, special: 'QID',
    guns: ['V19P', 'MP2', 'V27C', 'PX19', 'V99', 'PX9', 'KNIFE'],
    utility: ['LURE', 'NERVE', 'SMOKE', 'FLASH', 'CONCUSS', 'REMOTE', 'EMPGREN', 'TRACKER'],
    gear: ['GASMASK', 'LOCKKIT', 'INTEL', 'EMFSCAN', 'UVGOGS', 'NVG', 'MULTIVIS', 'HACKSUIT'] },
  { id: 'PILOT', name: 'Pilot', role: 'Trained to fly and steer aircraft and watercraft - and to keep them going.', arms: 'smg',
    kit: { primary: 'MP2', backup: 'PX19', utility1: 'REPAIRKIT', utility2: 'SMOKE', gear: 'PARACHUTE' }, special: 'AUTOREPAIR',
    guns: ['MP2', 'V19P', 'K7', 'PX19', 'PX9', 'V99', 'KNIFE'],
    utility: ['REPAIRKIT', 'SMOKE', 'FLASH', 'MEDKIT', 'SERVICE'],
    gear: ['PARACHUTE', 'NVG', 'SHADES', 'LENSES', 'REBREATHER'] },
  { id: 'JUMP', name: 'Jump Trooper', tag: 'Experimental', role: 'Shock troops who drop in from above - and leave as quickly as they came.', arms: 'hasl3',
    kit: { primary: 'HASL3', backup: 'HLP2', utility1: 'AIRINC', utility2: 'AIRFLARE', gear: 'JUMPPACK' }, special: 'CUSHION',
    guns: ['HASL3', 'IM8S', 'BR12', 'HLP2', 'PX19', 'DE50', 'KNIFE'],
    utility: ['AIRINC', 'AIRFLARE', 'FRAG', 'SERVICE', 'CONCUSS'],
    gear: ['JUMPPACK'] },
];
// what a class may put in a slot (null: no class - anything that fits)
export function classAllows(cls, slot) {
  if (!cls) return null;
  return slot === 'primary' || slot === 'backup' ? cls.guns : slot === 'gear' ? cls.gear : cls.utility;
}
// (Rhys: "comrades and enemies should also have classes, and should have the default loadouts")
// the mix a battle side fields when its level does not say: mostly troopers, one of each of the rest
// (the Jump Troopers are experimental: not on the field yet)
export const BATTLE_MIX = ['TROOPER', 'RECON', 'TROOPER', 'MEDIC', 'HEAVY', 'TROOPER', 'SPY', 'PILOT'];
export const classById = (id) => CLASSES.find((c) => c.id === id) || null;
