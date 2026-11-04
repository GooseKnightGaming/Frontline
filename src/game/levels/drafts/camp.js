// FRONTLINE - Level 69, Camp Ostrava (first draft, M6.88; with Hale and Moss again). The first camp's people are over
// the Arn. The minutes named a second, smaller and further north, where the council kept the people it wanted kept
// quiet. Four of them are in its huts tonight. Go in with Hale and Moss, open the huts, bring the four out to the
// lorry at the gate, and take the camp's register: the names of everyone who was ever kept here.
const W = 56, H = 46;
export default {
  id: 'camp', no: 69, title: 'Camp Ostrava', place: 'Camp Ostrava, in the far north',
  where: 'Camp Ostrava. 02:00, deep snow, the searchlights turning.',
  brief: [
    ['The job', 'The council\'s minutes named a second camp, <b>Camp Ostrava</b>, where it kept the people it wanted kept quiet. <b>Four</b> of them are in its huts tonight. Go in with <b>Hale and Moss</b>. Open the huts and bring the four out to the <b>lorry at the gate</b>. The huts are maglocked, and the <b>warden</b> carries the card. Take the camp\'s <b>register</b> from the commandant\'s office: the name of everyone ever kept here. If you can, take the <b>commandant</b> alive.'],
    ['The place', 'A wall all round, with the gate on the south side. Along the west side are the three <b>prisoners\' huts</b>. In the middle is the kitchen. Along the east side are the <b>commandant\'s office</b> and the guards\' barracks.'],
    ['Security', 'Cameras on the yard, the hut doors maglocked, the alarm. The radio and the security console are in the commandant\'s office, the engineer in the barracks. A marksman stands in the north-east corner. Hale and Moss keep with you and fight whoever fights you.'],
    ['Objectives', '<b>Bring the four prisoners out</b> (the huts, west). Take the <b>register</b> (the commandant\'s office). If you can, take the <b>commandant</b> alive. Out by the gate, where the lorry waits.'],
  ],
  epilogue: {
    success: 'Four people walk out of Camp Ostrava into the back of a lorry, and the register goes with them: nine hundred names in six years. Ghost has a list to work through now, and some of the people on it are still alive.',
    partial: 'Not everyone came out, or the register stayed behind. The camp will be emptied by the reds before Ghost can come back, and nobody will say where its people went.',
  },
  time: { date: [24, 2, 2027], hour: 2, minute: 0 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'snow',
  relations: { red: { you: true, ghost: true }, ghost: { you: false, red: true } },
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.28, 0.31, 0.38, 25, 180], ambient: [0.3, 0.32, 0.4] },
  extractName: 'the lorry at the gate', extract: { x: 27, y: 44, floor: 'G', van: [6, 1] },
  outside: { backdrop: 'woods', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'wood', wallTint: [0.45, 0.4, 0.34], floor: 'wood', ceil: 'wood', lampPower: 0.55, lampColour: [1, 0.85, 0.6], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 6, 6, 14, 12],                         // hut 1
        ['room', 6, 17, 14, 23],                        // hut 2
        ['room', 6, 28, 14, 34],                        // hut 3
        ['room', 24, 6, 32, 12],                        // the kitchen
        ['room', 40, 6, 48, 12],                        // the commandant's office
        ['room', 40, 17, 48, 25],                       // the guards' barracks
      ], after: [
        // the camp's wall, its gate (x 26 - 28) on the south side
        ['room', 2, 2, 53, 2, 'J'], ['room', 2, 2, 2, 41, 'J'], ['room', 53, 2, 53, 41, 'J'], ['room', 2, 41, 25, 41, 'J'], ['room', 29, 41, 53, 41, 'J'],
        // (walls a square out from each room)
        ['cells', [[15, 9], [15, 20], [15, 31], [28, 13], [39, 9], [39, 21]], 'D'],
        ['cells', [[10, 5], [10, 16], [10, 27], [5, 9], [5, 20], [5, 31], [28, 5], [44, 5], [49, 9], [49, 21], [44, 26]], 'W'],
        ['room', 7, 7, 7, 11, 'Y'], ['room', 13, 7, 13, 11, 'Y'], ['room', 7, 18, 7, 22, 'Y'], ['room', 13, 18, 13, 22, 'Y'], ['room', 7, 29, 7, 33, 'Y'], ['room', 13, 29, 13, 33, 'Y'],
        ['room', 25, 8, 31, 8, 'K'], ['cells', [[27, 11], [30, 11]], 'T'],
        ['cells', [[42, 8], [46, 10]], 'T'], ['cells', [[47, 7]], 'H'],
        ['room', 41, 19, 41, 24, 'Y'], ['room', 47, 19, 47, 24, 'Y'], ['cells', [[44, 23]], 'M'],
        // the yard: woodpiles and the roll-call posts
        ['cells', [[20, 16], [34, 16], [20, 30], [34, 30], [27, 22], [44, 32], [44, 37], [10, 38]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    for (const [x0, y0, x1, y1] of [[2, 2, 54, 3], [2, 2, 3, 42], [53, 2, 54, 42], [2, 41, 26, 42], [29, 41, 54, 42]]) box([x0 * C, 0, y0 * C], [x1 * C, 3.2, y1 * C], 'concrete2', { tint: [0.5, 0.5, 0.52] });
    for (const [x, y] of [[27, 16], [20, 26], [34, 26], [27, 38], [44, 14], [10, 14], [10, 25], [27, 44]]) level.lights.push({ pos: [mid(x), 5, mid(y)], range: 13, intensity: 0.95, color: [1, 0.9, 0.7], street: true });
  },
  start: { x: 22, y: 44, floor: 'G', yaw: 0 },
  zones: [
    { id: 'h1', label: 'Camp Ostrava - hut 1', at: [6, 6, 14, 12] },
    { id: 'h2', label: 'Camp Ostrava - hut 2', at: [6, 17, 14, 23] },
    { id: 'h3', label: 'Camp Ostrava - hut 3', at: [6, 28, 14, 34] },
    { id: 'kit', label: 'Camp Ostrava - the kitchen', at: [24, 6, 32, 12] },
    { id: 'cmd', label: 'Camp Ostrava - the commandant\'s office', at: [40, 6, 48, 12] },
    { id: 'bar', label: 'Camp Ostrava - the guards\' barracks', at: [40, 17, 48, 25] },
    { id: 'yard', label: 'Camp Ostrava', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'hale', at: [21, 45, 'G'], faction: 'ghost', ally: true, name: 'Hale', arms: 'carbine', temper: 'steady', tint: [0.45, 0.6, 1.35] },
    { id: 'moss', at: [23, 45, 'G'], faction: 'ghost', ally: true, name: 'Moss', arms: 'smg', temper: 'bold', tint: [0.4, 0.55, 1.3] },
    { id: 'cmdt', at: [44, 9, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The commandant' },
    { id: 'rad', at: [42, 11, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'warden', at: [20, 20, 'G'], route: [[18, 8], [18, 34]], arms: 'smg', rank: 'sergeant', temper: 'steady', card: 'ostrava', name: 'The warden' },
    { id: 'eng', at: [44, 21, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'bk1', at: [42, 22, 'G'], arms: 'carbine', temper: 'bold' },
    { id: 'bk2', at: [46, 19, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'mk', at: [51, 4, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'y1', at: [30, 26, 'G'], route: [[22, 26], [50, 26]], arms: 'carbine', dog: true },
    { id: 'y2', at: [36, 35, 'G'], route: [[20, 37], [50, 37]], arms: 'carbine' },
    { id: 'gt', at: [27, 39, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'kt', at: [28, 10, 'G'], arms: 'pistol', temper: 'cowardly' },
  ],
  hostages: [
    { id: 'pr1', name: 'A prisoner', at: [10, 9, 'G'] },
    { id: 'pr2', name: 'A prisoner', she: true, at: [10, 20, 'G'] },
    { id: 'pr3', name: 'A prisoner', at: [10, 31, 'G'] },
    { id: 'pr4', name: 'An old man', at: [12, 31, 'G'] },
  ],
  pickups: [{ id: 'register', name: 'The camp register', what: 'the register', at: [42, 8, 'G'], table: true, colour: [0.45, 0.35, 0.25] }],
  devices: [
    { id: 'c-yard', kind: 'camera', at: [23, 13, 'G'], face: [-1, 1], net: 'ostrava' },
    { id: 'c-gate', kind: 'camera', at: [30, 40, 'G'], face: [-1, -1], net: 'ostrava' },
    { id: 'm-h1', kind: 'lock', at: [15, 9, 'G'], net: 'ostrava' },
    { id: 'm-h2', kind: 'lock', at: [15, 20, 'G'], net: 'ostrava' },
    { id: 'm-h3', kind: 'lock', at: [15, 31, 'G'], net: 'ostrava' },
    { id: 'a-camp', kind: 'alarm', at: [39, 14, 'G'], face: [-1, 0], net: 'ostrava' },
  ],
  terminals: [{ id: 'sec', name: 'the commandant\'s console', at: [46, 10, 'G'], face: [-1, 0], time: 6, net: 'ostrava' }],
  intel: [
    { id: 'roll', at: [27, 11, 'G'], kind: 'Roll', title: 'The kitchen\'s roll', text: ['Rations for four in the huts, for thirty in the barracks. Somebody has crossed out "four" and written "too many".'] },
    { id: 'order', at: [46, 10, 'G'], h: 0.78, kind: 'Orders', title: 'Orders from the council', text: ['The camp is to be closed by the spring and its people moved further north. Its register goes to the council, and nowhere else.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'rescue', text: 'Bring the four prisoners out (the huts, west)' },
    { id: 'o2', kind: 'take', ref: 'register', text: 'Take the register (the commandant\'s office)' },
    { id: 'o3', kind: 'capture', ref: 'cmdt', text: 'Take the commandant alive', optional: true },
  ],
};
