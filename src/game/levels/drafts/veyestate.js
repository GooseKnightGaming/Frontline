// FRONTLINE - Level 98, the Ravnsby Estate (first draft, M6.120; THE GENERAL, second). The General's diary said where he
// sleeps: not his headquarters but his own house at Ravnsby, an hour out of Hollen, behind its wall and its dogs. Go over
// the wall at three in the morning. Take the General alive from his bed, and his dispatch box from the study, and get
// him out to the car at the gate before the house knows.
const W = 52, H = 40;
export default {
  id: 'veyestate', no: 98, title: 'The Ravnsby Estate', place: 'the house at Ravnsby, outside Hollen',
  where: 'The house at Ravnsby, outside Hollen. 03:00, a clear frost, the dogs loose in the grounds.',
  brief: [
    ['The job', 'The General\'s diary said where he sleeps: his own house at <b>Ravnsby</b>, an hour out of Hollen, behind its wall and its dogs. Come in by the gate at three in the morning. <b>Take the General alive</b> from his bed. Take his <b>dispatch box</b> from the study. If you can, do it <b>without the alarm</b>.'],
    ['The place', 'A walled park with the gate on the south side. Downstairs in the house are the <b>hall</b>, the <b>study</b> and the dining room. Upstairs, the bedrooms, with the <b>General\'s</b> at the east end. The stables are east, the garage west.'],
    ['Security', 'Cameras on the drive and the hall and the house alarm, all on the console in the gatehouse with the radio. The engineer is in the garage. <b>Dogs</b> are loose in the grounds, and there is a man on the General\'s door.'],
    ['Objectives', '<b>Take the General alive</b> (his bedroom, upstairs). Take the <b>dispatch box</b> (the study). If you can, <b>without the alarm</b>. Out by the gate, south.'],
  ],
  epilogue: {
    success: 'The General leaves Ravnsby in his dressing gown, in the back of a car that is not his. His dispatch box has the orders for every cross, every one in his own hand. He will have plenty of time to read them again.',
    partial: 'The General or his dispatch box, not both. Without the other, it is his word against Ghost\'s, and his word has an army.',
  },
  time: { date: [24, 5, 2027], hour: 3, minute: 0 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.14, 0.15, 0.2, 30, 200], ambient: [0.25, 0.26, 0.32] },
  extractName: 'the gate, south', extract: { x: 26, y: 39, floor: 'G', van: [5, 1] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'plaster', wallTint: [0.88, 0.85, 0.78], floor: 'wood', ceil: 'plaster', lampPower: 0.55, lampColour: [1, 0.88, 0.7], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 16, 8, 34, 14],                        // the hall
        ['room', 16, 16, 24, 22],                       // the study
        ['room', 26, 16, 34, 22],                       // the dining room
        ['room', 40, 10, 47, 22],                       // the stables
        ['room', 4, 12, 11, 20],                        // the garage
        ['room', 20, 30, 26, 34],                       // the gatehouse
      ], after: [
        // the park wall, its gate (x 25 - 27) on the south side
        ['room', 2, 2, 49, 2, 'J'], ['room', 2, 2, 2, 37, 'J'], ['room', 49, 2, 49, 37, 'J'], ['room', 2, 37, 24, 37, 'J'], ['room', 28, 37, 49, 37, 'J'],
        ['cells', [[25, 15], [20, 15], [30, 15], [35, 11], [39, 16], [12, 16], [23, 29], [25, 23]], 'D'],
        ['cells', [[20, 7], [30, 7], [15, 11], [15, 19], [35, 19], [43, 9], [48, 16], [3, 16], [23, 35]], 'W'],
        ['room', 17, 17, 17, 21, 'H'], ['cells', [[21, 19]], 'T'], ['cells', [[23, 21]], 'K'],
        ['room', 28, 18, 32, 19, 'T'], ['cells', [[33, 21]], 'H'],
        ['room', 41, 11, 41, 21, 'Y'], ['room', 46, 13, 46, 19, 'C'],
        ['cells', [[6, 14], [9, 14]], 'M'], ['cells', [[10, 19]], 'T'],
        ['cells', [[21, 31], [25, 33]], 'T'],
        ['cells', [[18, 26], [32, 26], [10, 28], [42, 28], [8, 6], [44, 5], [14, 32], [38, 32]], 'C'],
      ] },
    },
    1: {
      y: 3.8, wallH: 3.2, wall: 'plaster', wallTint: [0.85, 0.8, 0.72], floor: 'carpet', ceil: 'plaster', lampPower: 0.4, lampColour: [1, 0.88, 0.7], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 16, 8, 34, 11],                        // the landing
        ['room', 16, 13, 22, 22],                       // the guest room
        ['room', 24, 13, 28, 22],                       // the dressing room
        ['room', 30, 13, 34, 22],                       // the General's bedroom
      ], after: [
        ['cells', [[19, 12], [26, 12], [32, 12]], 'D'],
        ['cells', [[19, 23], [26, 23], [32, 23], [15, 17], [35, 17], [20, 7], [30, 7]], 'W'],
        ['cells', [[17, 21], [33, 21]], 'Y'], ['cells', [[26, 18]], 'H'], ['cells', [[31, 18]], 'T'],
      ] },
    },
  },
  stairs: [{ x: 32, y: 13, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    for (const [x0, y0, x1, y1] of [[2, 2, 50, 3], [2, 2, 3, 38], [49, 2, 50, 38], [2, 37, 25, 38], [28, 37, 50, 38]]) box([x0 * C, 0, y0 * C], [x1 * C, 3, y1 * C], 'concrete2', { tint: [0.6, 0.58, 0.52] });
    for (const [x, y] of [[25, 25], [26, 36], [12, 24], [40, 25]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 11, intensity: 0.8, color: [1, 0.9, 0.75], street: true });
  },
  vehicles: [{ id: 'vcar', kind: 'car', model: 'lightUtility', paint: 'black', at: [8, 24], yaw: 0, hp: 560 }],
  start: { x: 44, y: 39, floor: 'G', yaw: Math.PI / 2 },
  zones: [
    { id: 'hall', label: 'Ravnsby - the hall', at: [16, 8, 34, 14] },
    { id: 'study', label: 'Ravnsby - the study', at: [16, 16, 24, 22] },
    { id: 'dining', label: 'Ravnsby - the dining room', at: [26, 16, 34, 22] },
    { id: 'upstairs', label: 'Ravnsby - upstairs', at: [16, 8, 34, 22], floor: '1' },
    { id: 'stables', label: 'Ravnsby - the stables', at: [40, 10, 47, 22] },
    { id: 'garage', label: 'Ravnsby - the garage', at: [4, 12, 11, 20] },
    { id: 'gate', label: 'Ravnsby - the gatehouse', at: [20, 30, 26, 34] },
    { id: 'park', label: 'Ravnsby', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'vey', at: [32, 19, '1'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'General Brandt', tint: [0.6, 0.55, 0.5] },
    { id: 'gd', at: [30, 10, '1'], arms: 'smg', rank: 'specialist', temper: 'steady' },
    { id: 'land', at: [22, 9, '1'], route: [[17, 9], [28, 9]], arms: 'pistol' },
    { id: 'hl1', at: [25, 11, 'G'], route: [[17, 11], [29, 11]], arms: 'carbine' },
    { id: 'st1', at: [19, 20, 'G'], arms: 'pistol', temper: 'cowardly', name: 'The aide' },
    { id: 'rad', at: [24, 32, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'gt', at: [26, 36, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'eng', at: [8, 16, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'd1', at: [30, 26, 'G'], route: [[14, 26], [36, 26]], arms: 'carbine', dog: true },
    { id: 'd2', at: [36, 5, 'G'], route: [[8, 5], [40, 5]], arms: 'carbine', dog: true },
  ],
  pickups: [{ id: 'box', name: 'The General\'s dispatch box', what: 'the dispatch box', at: [21, 19, 'G'], table: true, colour: [0.25, 0.15, 0.1] }],
  devices: [
    { id: 'c-drive', kind: 'camera', at: [15, 23, 'G'], face: [-1, 1], net: 'vey' },
    { id: 'c-hall', kind: 'camera', at: [16, 8, 'G'], face: [1, 1], net: 'vey' },
    { id: 'a-vey', kind: 'alarm', at: [35, 15, 'G'], face: [1, 0], net: 'vey' },
  ],
  terminals: [{ id: 'sec', name: 'the gatehouse console', at: [21, 31, 'G'], face: [0, 1], time: 6, net: 'vey' }],
  intel: [
    { id: 'letter', at: [31, 18, '1'], kind: 'Letter', title: 'A letter on the General\'s night table', text: ['From Major Kade, a week old: "The Courier has the names. Burn what you have. I will burn what I have." He has not burned anything.'] },
    { id: 'menu', at: [28, 18, 'G'], kind: 'Menu', title: 'Tomorrow\'s dinner, on the dining table', text: ['Eight covers. The guests are every general in the north, and the General has seated himself at the head.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'capture', ref: 'vey', text: 'Take the General alive (his bedroom, upstairs)' },
    { id: 'o2', kind: 'take', ref: 'box', text: 'Take the dispatch box (the study)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
