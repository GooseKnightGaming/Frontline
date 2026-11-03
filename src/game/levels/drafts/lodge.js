// FRONTLINE - Level 61, Ravensholt Lodge (first draft, M6.78; built round marking - objective kind 'identify').
// With the handler taken, the reds' regional chiefs meet to choose who runs Varnholm now: five of them, at a hunting
// lodge in the hills, and nobody in Ghost knows their faces. Mark every one of them - aim at each for a second - and
// take the seating plan, which has their names. Do it quietly: five frightened men never meet in the same place twice.
const W = 56, H = 44;
export default {
  id: 'lodge', no: 61, title: 'Ravensholt Lodge', place: 'Ravensholt Lodge, in the Vashka hills',
  where: 'Ravensholt Lodge, in the hills above Varnholm. 20:30, snow, the lodge lit up.',
  brief: [
    ['The job', 'With the handler gone, the reds\' <b>five regional chiefs</b> are meeting at Ravensholt Lodge to choose who runs Varnholm now. Nobody in Ghost knows their faces. <b>Mark all five</b>: aim at each for a second, through a window if need be, and each goes on Ghost\'s file. Then take the <b>seating plan</b> from the study upstairs. It has their names. If you can, <b>tap the lodge telephone</b> in the study as well.'],
    ['The place', 'The lodge: the <b>great hall</b> (the chiefs at dinner, its windows on the snow), the kitchen and the gun room off it, the <b>study</b> and the guest rooms upstairs, the terrace on the south side. A staff hut south-west, the garage south-east. Woods round it, and you come in through them from the south.'],
    ['Security', 'Guards round the lodge and in it, a dog, cameras on the lodge, the alarm. The radio is in the staff hut, the engineer in the garage. A dead chief is no use to Ghost, because a dead man cannot be watched. They only need to be marked.'],
    ['Objectives', '<b>Mark the five chiefs</b>. Take the <b>seating plan</b> (the study, upstairs). If you can, <b>tap the telephone</b> (the study). Out the way you came, south.'],
  ],
  epilogue: {
    success: 'Five faces and five names on Ghost\'s file by morning. Three of the chiefs are arrested within the month, one of them on the steps of his own bank. The other two are watched instead, which is worth more. Nobody runs Varnholm for the reds now.',
    partial: 'Some of the faces, or the names but not the faces. The chiefs who were missed will hear of it, and they will not come to a lodge in the hills again.',
  },
  time: { date: [8, 2, 2027], hour: 20, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'snow',
  startLoadout: { primary: 'LR7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SCOPE8'], backup: ['SILENCER'] } },
  atmos: { fog: [0.3, 0.33, 0.4, 30, 200], ambient: [0.32, 0.34, 0.42] },
  extractName: 'the woods, south', extract: { x: 27, y: 42, floor: 'G' },
  outside: { backdrop: 'woods', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'wood', wallTint: [0.55, 0.4, 0.28], floor: 'wood', ceil: 'wood', lampPower: 0.8, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 16, 10, 34, 20],                       // the great hall
        ['room', 36, 10, 44, 16],                       // the kitchen
        ['room', 36, 18, 44, 20],                       // the gun room
        ['room', 4, 30, 12, 36],                        // the staff hut
        ['room', 44, 30, 52, 36],                       // the garage
      ], after: [
        // (walls a square out from each room; the kitchen and gun room share the hall's east wall)
        ['cells', [[25, 9], [25, 21], [35, 13], [35, 19], [40, 9], [8, 29], [48, 29]], 'D'],
        ['cells', [[19, 9], [31, 9], [19, 21], [31, 21], [15, 13], [15, 17], [45, 13], [45, 19]], 'W'],
        // the hall: the dinner table down the middle, the hearth, sideboards
        ['room', 22, 14, 29, 15, 'T'], ['room', 17, 11, 19, 11, 'K'], ['cells', [[33, 11], [33, 19]], 'H'],
        ['cells', [[38, 12], [42, 12], [42, 15]], 'T'], ['cells', [[38, 15]], 'K'],
        ['room', 37, 19, 43, 19, 'H'],
        ['cells', [[6, 32], [10, 35]], 'T'], ['cells', [[11, 31]], 'M'],
        ['cells', [[46, 32], [50, 32]], 'M'], ['cells', [[51, 35]], 'T'],
        // the woodpile, the terrace's benches
        ['cells', [[14, 24], [36, 24], [8, 20], [48, 20], [20, 38], [34, 38]], 'C'],
      ] },
    },
    1: {
      y: 3.8, wallH: 3.0, wall: 'wood', wallTint: [0.55, 0.4, 0.28], floor: 'wood', ceil: 'wood', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 16, 10, 24, 20],                       // the study
        ['room', 26, 10, 34, 20],                       // the guest rooms
      ], after: [
        ['cells', [[25, 15]], 'D'],
        ['cells', [[19, 9], [22, 9], [19, 21], [22, 21], [15, 13], [29, 9], [32, 9], [29, 21], [32, 21], [35, 15]], 'W'],
        ['cells', [[22, 12], [22, 17]], 'T'], ['cells', [[17, 11]], 'H'],
        ['cells', [[28, 12], [32, 12], [28, 18], [32, 18]], 'Y'],
      ] },
    },
  },
  stairs: [{ x: 17, y: 19, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the woods: pines round the clearing
    const pines = [[3, 4], [8, 6], [48, 5], [53, 9], [2, 14], [53, 16], [3, 24], [52, 25], [15, 34], [21, 30], [33, 31], [39, 35], [16, 40], [38, 40], [3, 40], [52, 41], [45, 3], [10, 2]];
    for (const [x, y] of pines) {
      box([mid(x) - 0.2, 0, mid(y) - 0.2], [mid(x) + 0.2, 3, mid(y) + 0.2], 'wood', { tint: [0.3, 0.22, 0.15] });
      box([mid(x) - 1.1, 2.4, mid(y) - 1.1], [mid(x) + 1.1, 6.5, mid(y) + 1.1], 'paint', { tint: [0.12, 0.24, 0.16], solid: false });
    }
    // the lodge's roof
    box([15 * C, 7, 9 * C], [36 * C, 7.3, 22 * C], 'wood', { tint: [0.3, 0.2, 0.15] });
    for (const [x, y] of [[25, 7], [25, 23], [8, 27], [48, 27], [40, 7]]) level.lights.push({ pos: [mid(x), 4, mid(y)], range: 12, intensity: 0.9, color: [1, 0.85, 0.6], street: true });
  },
  start: { x: 27, y: 42, floor: 'G', yaw: 0 },
  zones: [
    { id: 'hall', label: 'Ravensholt Lodge - the great hall', at: [16, 10, 34, 20] },
    { id: 'kitchen', label: 'Ravensholt Lodge - the kitchen', at: [36, 10, 44, 16] },
    { id: 'guns', label: 'Ravensholt Lodge - the gun room', at: [36, 18, 44, 20] },
    { id: 'study', label: 'Ravensholt Lodge - the study', at: [16, 10, 24, 20], floor: '1' },
    { id: 'guest', label: 'Ravensholt Lodge - the guest rooms', at: [26, 10, 34, 20], floor: '1' },
    { id: 'hut', label: 'Ravensholt Lodge - the staff hut', at: [4, 30, 12, 36] },
    { id: 'garage', label: 'Ravensholt Lodge - the garage', at: [44, 30, 52, 36] },
    { id: 'terrace', label: 'Ravensholt Lodge - the terrace', at: [14, 22, 36, 25] },
    { id: 'woods', label: 'Ravensholt Lodge - the woods', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    // the five chiefs: three at dinner, one on the terrace with a cigar, one upstairs in the study
    { id: 'ch1', at: [23, 13, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The chief from Kessin', tint: [0.3, 0.3, 0.35] },
    { id: 'ch2', at: [27, 16, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The chief from Drosk', tint: [0.45, 0.3, 0.25] },
    { id: 'ch3', at: [30, 13, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The chief from the Arn valley', tint: [0.35, 0.4, 0.3] },
    { id: 'ch4', at: [20, 23, 'G'], route: [[18, 23], [32, 23]], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The chief from Teskel', tint: [0.5, 0.45, 0.4] },
    { id: 'ch5', at: [20, 13, '1'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The chief from the coast', tint: [0.25, 0.3, 0.4] },
    { id: 'hg1', at: [33, 17, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'hg2', at: [18, 17, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'up1', at: [30, 15, '1'], route: [[27, 15], [33, 15]], arms: 'carbine' },
    { id: 'p1', at: [25, 7, 'G'], route: [[13, 7], [38, 7]], arms: 'carbine', dog: true },
    { id: 'p2', at: [13, 15, 'G'], route: [[13, 5], [13, 26]], arms: 'carbine' },
    { id: 'p3', at: [47, 15, 'G'], route: [[47, 5], [47, 26]], arms: 'carbine' },
    { id: 'p4', at: [25, 27, 'G'], route: [[10, 27], [42, 27]], arms: 'smg' },
    { id: 'rad', at: [8, 33, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [48, 34, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
  ],
  civilians: [
    { id: 'cook', at: [40, 14, 'G'], yaw: Math.PI, title: 'The lodge\'s cook', tint: [1.1, 1.1, 1.05], says: ['Five for dinner and not one of them has eaten. They keep looking at the windows.', 'The one upstairs takes his on a tray. He has the papers with him.'] },
  ],
  pickups: [{ id: 'plan', name: 'The seating plan', what: 'the seating plan', at: [22, 12, '1'], table: true, colour: [0.9, 0.88, 0.8] }],
  devices: [
    { id: 'c-north', kind: 'camera', at: [15, 9, 'G'], face: [-1, -1], net: 'lodge' },
    { id: 'c-south', kind: 'camera', at: [35, 21, 'G'], face: [1, 1], net: 'lodge' },
    { id: 'a-lodge', kind: 'alarm', at: [24, 21, 'G'], face: [0, 1], net: 'lodge' },
  ],
  terminals: [
    { id: 'sec', name: 'the staff hut console', at: [6, 32, 'G'], face: [0, 1], time: 6, net: 'lodge' },
    { id: 'phone', name: 'the lodge telephone', at: [22, 17, '1'], face: [0, -1], time: 8, verb: 'Tap', doing: 'Tapping',
      said: 'A tap on the line. Whoever they ring tonight, Ghost hears it too.' },
  ],
  intel: [
    { id: 'menu', at: [38, 12, 'G'], kind: 'Menu', title: 'Tonight\'s menu', text: ['Venison, five covers. "No staff in the hall after the soup."'] },
    { id: 'letter', at: [10, 35, 'G'], kind: 'Letter', title: 'A letter in the staff hut', text: ['The guests arrive separately and leave separately. Nobody uses a name. If you hear one, forget it.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'identify', refs: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'], text: 'Mark the five chiefs (aim at each for a second)' },
    { id: 'o2', kind: 'take', ref: 'plan', text: 'Take the seating plan (the study, upstairs)' },
    { id: 'o3', kind: 'hack', ref: 'phone', text: 'Tap the telephone (the study)', optional: true },
  ],
};
