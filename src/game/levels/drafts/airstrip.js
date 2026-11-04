// FRONTLINE - Level 113, the Airstrip (first draft, M6.135; the start of THE BUYER). The buyer from Gull Cove is a man
// Ghost has wanted for years: Anselm Kray, who sells to anybody, from somewhere on the Dry Coast. His plane comes and
// goes from a strip in the desert at Sand Hollow, and it is on the ground tonight to refuel. Drain the strip's fuel
// tank so that it cannot leave in a hurry, mark the pilot, and take the flight plan from the control hut.
const W = 56, H = 40;
export default {
  id: 'airstrip', no: 113, title: 'The Airstrip', place: 'the desert strip at Sand Hollow',
  where: 'The desert strip at Sand Hollow, the Dry Coast. 19:30, the sun down, the sand still hot.',
  brief: [
    ['The job', 'The buyer from Gull Cove is a man Ghost has wanted for years: <b>Anselm Kray</b>, who sells to anybody, from somewhere on the Dry Coast. His <b>plane</b> comes and goes from a strip in the desert at Sand Hollow, and it is on the ground tonight to refuel. <b>Drain the fuel tank</b> so that it cannot leave in a hurry. <b>Mark the pilot</b>. Take the <b>flight plan</b> from the control hut. If you can, <b>without the alarm</b>.'],
    ['The place', 'The strip runs east to west along the south of the map. The <b>hangar</b> is in the middle, with the plane in front of it, the <b>fuel tank</b> on its stand east of the hangar, and the <b>control hut</b> beyond. The crew\'s barracks are west. You come in over the dunes, north-west.'],
    ['Security', 'A camera on the hangar and the strip\'s alarm, both on the control hut\'s console with the radio. The engineer is at the generator behind the hangar. Kray\'s men walk the strip. The pilot sleeps in the hangar.'],
    ['Objectives', '<b>Drain the fuel tank</b> (east of the hangar). <b>Mark the pilot</b> (the hangar). Take the <b>flight plan</b> (the control hut). If you can, <b>without the alarm</b>. Back over the dunes, north-west.'],
  ],
  epilogue: {
    success: 'Kray\'s plane sits on the strip at Sand Hollow with dry tanks until noon, while its flight plan tells Ghost where it was going: a house on the coast at Cap Merrow, where Kray spends the summer.',
    partial: 'The plane got away, or the flight plan stayed in the hut. Kray will hear that somebody was asking after him.',
  },
  time: { date: [18, 7, 2027], hour: 19, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'LR7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SCOPE8'], backup: ['SILENCER'] } },
  atmos: { fog: [0.42, 0.32, 0.26, 40, 240], ambient: [0.48, 0.4, 0.36] },
  extractName: 'the dunes, north-west', extract: { x: 3, y: 2, floor: 'G', van: [7, 0] },
  outside: { backdrop: 'hills', mat: 'desert', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 5, wall: 'metal', wallTint: [0.75, 0.7, 0.6], floor: 'concrete', ceil: 'metal', lampPower: 0.6, lampColour: [1, 0.9, 0.75], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 20, 10, 34, 20],                       // the hangar
        ['room', 44, 12, 50, 18],                       // the control hut
        ['room', 6, 12, 14, 18],                        // the crew's barracks
        ['room', 24, 2, 28, 5],                         // the generator shed
      ], after: [
        ['cells', [[27, 21], [28, 21], [43, 15], [10, 19], [26, 6]], 'D'],
        ['cells', [[19, 15], [35, 13], [47, 11], [51, 15], [5, 15]], 'W'],
        ['room', 21, 11, 21, 15, 'H'], ['cells', [[32, 11]], 'Y'], ['cells', [[31, 19]], 'T'],
        ['cells', [[45, 13], [49, 17]], 'T'], ['cells', [[7, 13], [7, 17], [13, 13], [13, 17]], 'Y'], ['cells', [[11, 15]], 'T'],
        ['cells', [[26, 3]], 'M'],
        // the fuel tank on its stand, oil drums, the windsock, the dunes' rocks
        ['cells', [[39, 16]], 'T'], ['cells', [[38, 14], [40, 14]], 'C'],
        ['cells', [[8, 6], [16, 4], [36, 4], [48, 4], [4, 26], [52, 26], [16, 24], [40, 24]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the strip's paint, the plane on its apron, the tank
    box([0, 0.01, 30 * C], [W * C, 0.03, 36 * C], 'asphalt', { tint: [0.3, 0.3, 0.3], solid: false });
    box([25 * C, 0.6, 23 * C], [31 * C, 2.2, 25 * C], 'metal', { tint: [0.85, 0.85, 0.8] });
    box([22 * C, 1.6, 23.6 * C], [34 * C, 1.8, 24.4 * C], 'metal', { tint: [0.85, 0.85, 0.8], solid: false });
    box([mid(39) - 1, 0.8, mid(16) - 2.4], [mid(39) + 1, 2.6, mid(16) - 0.8], 'metal', { tint: [0.6, 0.55, 0.3] });
    for (const [x, y] of [[27, 22], [43, 20], [10, 21], [20, 32], [40, 32]]) level.lights.push({ pos: [mid(x), 5, mid(y)], range: 13, intensity: 0.85, color: [1, 0.9, 0.75], street: true });
  },
  start: { x: 3, y: 3, floor: 'G', yaw: Math.PI },
  zones: [
    { id: 'hangar', label: 'Sand Hollow - the hangar', at: [20, 10, 34, 20] },
    { id: 'hut', label: 'Sand Hollow - the control hut', at: [44, 12, 50, 18] },
    { id: 'barr', label: 'Sand Hollow - the barracks', at: [6, 12, 14, 18] },
    { id: 'strip', label: 'Sand Hollow', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'pilot', at: [31, 12, 'G'], arms: 'pistol', rank: 'specialist', temper: 'cowardly', name: 'Kray\'s pilot', tint: [0.5, 0.45, 0.35] },
    { id: 'hg1', at: [27, 17, 'G'], route: [[22, 17], [33, 17]], arms: 'smg' },
    { id: 'rad', at: [47, 15, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [27, 4, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'br1', at: [10, 14, 'G'], arms: 'carbine' },
    { id: 'tk1', at: [39, 18, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'st1', at: [28, 27, 'G'], route: [[12, 27], [48, 27]], arms: 'carbine' },
    { id: 'st2', at: [36, 33, 'G'], route: [[8, 33], [52, 33]], arms: 'dmr', rank: 'specialist', temper: 'steady' },
  ],
  pickups: [{ id: 'plan', name: 'The flight plan', what: 'the flight plan', at: [49, 17, 'G'], table: true, colour: [0.9, 0.88, 0.75] }],
  devices: [
    { id: 'c-hangar', kind: 'camera', at: [35, 21, 'G'], face: [1, 1], net: 'sand' },
    { id: 'a-sand', kind: 'alarm', at: [43, 13, 'G'], face: [-1, 0], net: 'sand' },
  ],
  terminals: [
    { id: 'sec', name: 'the control hut console', at: [45, 13, 'G'], face: [0, 1], time: 6, net: 'sand' },
    { id: 'pump', name: 'the fuel tank\'s drain cock', at: [39, 16, 'G'], face: [0, 1], time: 6, verb: 'Drain', doing: 'Draining',
      said: 'The strip\'s fuel runs out into the sand, and the sand drinks it.' },
  ],
  intel: [
    { id: 'log', at: [31, 19, 'G'], kind: 'Log', title: 'The pilot\'s log', text: ['Sand Hollow, Cap Merrow, Sand Hollow, Cap Merrow, every week since spring. Once, the north. Once, further south than the map goes.'] },
    { id: 'roster', at: [11, 15, 'G'], kind: 'Roster', title: 'The crew\'s roster', text: ['Eight men, a pilot and a cook. Beside the cook\'s name: "Not to fly. Not to be told anything."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'pump', text: 'Drain the fuel tank (east of the hangar)' },
    { id: 'o2', kind: 'identify', refs: ['pilot'], text: 'Mark the pilot (the hangar)' },
    { id: 'o3', kind: 'take', ref: 'plan', text: 'Take the flight plan (the control hut)' },
    { id: 'o4', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
