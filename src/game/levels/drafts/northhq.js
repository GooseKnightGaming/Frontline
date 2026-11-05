// FRONTLINE - Level 80, Northern Headquarters (first draft, M6.102; the end of THE COLONEL). Strand's map case held
// the north's plan for the spring, and his headquarters does not yet know he is gone. Go in with Hale and Moss while it
// still thinks he is ill. Mark his three staff officers upstairs, send the spring plan's stand-down from the signals
// room in Strand's own name, and hold the signals room while it goes out to every unit in the north.
const W = 52, H = 40;
export default {
  id: 'northhq', no: 80, title: 'Northern Headquarters', place: 'the north\'s headquarters, the Vashka valley',
  where: 'The north\'s headquarters, the Vashka valley. 05:10, snow, the colonel "ill in his quarters".',
  brief: [
    ['The job', 'Strand\'s map case held the north\'s <b>plan for the spring</b>, and his headquarters does not yet know he is gone. Go in with <b>Hale and Moss</b> while it still thinks he is ill. <b>Mark his three staff officers</b> in their offices upstairs. In the <b>signals room</b>, send the spring plan\'s <b>stand-down</b> in Strand\'s own name. Then <b>hold the signals room</b> while it goes out to every unit in the north.'],
    ['The place', 'A walled compound in the valley with its gate on the south side. The headquarters building: the hall, the <b>signals room</b> and the map room downstairs, the <b>staff officers\' offices</b> upstairs. The barracks are east, the motor pool west.'],
    ['Security', 'Cameras on the yard and the hall, the alarm. The console and the radio are in the guardroom by the gate, the engineer in the motor pool. Once the stand-down starts going out, the barracks will come for the signals room.'],
    ['Objectives', '<b>Mark the three staff officers</b> (upstairs). <b>Send the stand-down</b> (the signals room). <b>Hold the signals room</b> while it goes out. Out by the gate.'],
  ],
  epilogue: {
    success: 'The stand-down goes out to forty units in Strand\'s name, and forty units stand down. By the time the north works out what happened, the spring has come and gone. Three staff officers are on Ghost\'s file, and none of them sleeps well again.',
    partial: 'Part of the stand-down went out before the signals room was lost. Some of the north stood down and some of it did not, and the north will spend the spring arguing about which.',
  },
  time: { date: [20, 4, 2027], hour: 5, minute: 10 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'snow',
  relations: { red: { you: true, ghost: true }, ghost: { you: false, red: true } },
  startLoadout: { primary: 'LR7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { primary: ['SCOPE8'], backup: ['SILENCER'] } },
  atmos: { fog: [0.3, 0.33, 0.4, 30, 200], ambient: [0.32, 0.34, 0.42] },
  extractName: 'the gate, south', extract: { x: 26, y: 39, floor: 'G', van: [5, 1] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'concrete2', wallTint: [0.66, 0.66, 0.64], floor: 'concrete', ceil: 'concrete2', lampPower: 0.7, lampColour: [0.95, 0.95, 1], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 16, 8, 34, 14],                        // the hall
        ['room', 16, 16, 24, 22],                       // the signals room
        ['room', 26, 16, 34, 22],                       // the map room
        ['room', 40, 10, 47, 22],                       // the barracks
        ['room', 4, 12, 11, 20],                        // the motor pool
        ['room', 20, 30, 26, 34],                       // the guardroom
      ], after: [
        // the compound's wall, its gate (x 25 - 27) on the south side
        ['room', 2, 2, 49, 2, 'J'], ['room', 2, 2, 2, 37, 'J'], ['room', 49, 2, 49, 37, 'J'], ['room', 2, 37, 24, 37, 'J'], ['room', 28, 37, 49, 37, 'J'],
        ['cells', [[25, 15], [20, 15], [30, 15], [35, 11], [39, 16], [12, 16], [23, 29], [25, 23]], 'D'],
        ['cells', [[20, 7], [30, 7], [15, 11], [15, 19], [35, 19], [43, 9], [48, 16], [3, 16], [23, 35]], 'W'],
        ['room', 17, 17, 17, 21, 'K'], ['cells', [[22, 17], [22, 21]], 'T'], ['cells', [[23, 19]], 'M'],
        ['room', 28, 18, 32, 19, 'T'], ['cells', [[33, 21]], 'H'],
        ['room', 41, 11, 41, 21, 'Y'], ['room', 46, 11, 46, 21, 'Y'],
        ['cells', [[6, 14], [9, 14], [6, 18]], 'M'], ['cells', [[10, 19]], 'T'],
        ['cells', [[21, 31], [25, 33]], 'T'],
        ['cells', [[18, 26], [10, 28], [8, 6]], 'B'], ['cells', [[32, 26], [42, 28], [44, 5]], 'C'],
      ] },
    },
    1: {
      y: 3.8, wallH: 3.2, wall: 'plaster', wallTint: [0.8, 0.8, 0.76], floor: 'wood', ceil: 'plaster', lampPower: 0.55, lampColour: [1, 0.9, 0.75], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 16, 8, 34, 11],                        // the landing and corridor
        ['room', 16, 13, 22, 22],                       // office 1
        ['room', 24, 13, 28, 22],                       // office 2
        ['room', 30, 13, 34, 22],                       // office 3
      ], after: [
        ['cells', [[19, 12], [26, 12], [32, 12]], 'D'],
        ['cells', [[19, 23], [26, 23], [32, 23], [15, 17], [35, 17], [20, 7], [30, 7]], 'W'],
        ['cells', [[19, 18], [26, 18], [32, 18]], 'T'], ['cells', [[17, 21], [27, 21], [33, 21]], 'H'],
      ] },
    },
  },
  stairs: [{ x: 32, y: 13, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    for (const [x0, y0, x1, y1] of [[2, 2, 50, 3], [2, 2, 3, 38], [49, 2, 50, 38], [2, 37, 25, 38], [28, 37, 50, 38]]) box([x0 * C, 0, y0 * C], [x1 * C, 3.2, y1 * C], 'concrete2', { tint: [0.5, 0.5, 0.52] });
    for (const [x, y] of [[25, 25], [12, 24], [40, 25], [26, 36], [36, 6]]) level.lights.push({ pos: [mid(x), 5, mid(y)], range: 13, intensity: 0.95, color: [0.95, 0.95, 1], street: true });
  },
  start: { x: 8, y: 39, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'hall', label: 'Northern HQ - the hall', at: [16, 8, 34, 14] },
    { id: 'sig', label: 'Northern HQ - the signals room', at: [16, 16, 24, 22] },
    { id: 'map', label: 'Northern HQ - the map room', at: [26, 16, 34, 22] },
    { id: 'offices', label: 'Northern HQ - the staff officers\' offices', at: [16, 8, 34, 22], floor: '1' },
    { id: 'barr', label: 'Northern HQ - the barracks', at: [40, 10, 47, 22] },
    { id: 'motor', label: 'Northern HQ - the motor pool', at: [4, 12, 11, 20] },
    { id: 'guard', label: 'Northern HQ - the guardroom', at: [20, 30, 26, 34] },
    { id: 'yard', label: 'Northern HQ', at: [0, 0, W - 1, H - 1] },
  ],
  reach: [
    { id: 'hold', name: 'The signals room', at: [17, 17, 23, 21], hold: 75, after: 'standdown',
      said: 'Seventy-five seconds, and the last unit in the north has acknowledged. The spring plan is stood down.' },
  ],
  guards: [
    { id: 'hale', at: [7, 39, 'G'], faction: 'ghost', ally: true, name: 'Hale', arms: 'carbine', temper: 'steady', tint: [0.45, 0.6, 1.35] },
    { id: 'moss', at: [9, 39, 'G'], faction: 'ghost', ally: true, name: 'Moss', arms: 'smg', temper: 'bold', tint: [0.4, 0.55, 1.3] },
    { id: 'so1', at: [19, 16, '1'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'A staff officer (operations)', tint: [0.3, 0.32, 0.28] },
    { id: 'so2', at: [26, 16, '1'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'A staff officer (intelligence)', tint: [0.25, 0.3, 0.35] },
    { id: 'so3', at: [32, 16, '1'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'A staff officer (supply)', tint: [0.4, 0.32, 0.26] },
    { id: 'sg1', at: [20, 19, 'G'], arms: 'pistol', rank: 'specialist', temper: 'cowardly', name: 'The duty signaller' },
    { id: 'hl1', at: [25, 11, 'G'], route: [[17, 11], [29, 11]], arms: 'carbine' },
    { id: 'mp1', at: [30, 20, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'up1', at: [25, 9, '1'], route: [[17, 9], [33, 9]], arms: 'smg' },
    { id: 'rad', at: [24, 32, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'gt', at: [26, 36, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'eng', at: [8, 16, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'y1', at: [36, 26, 'G'], route: [[14, 26], [46, 26]], arms: 'carbine', dog: true },
    { id: 'w1a', at: [43, 14, 'G'], arms: 'carbine', reserve: true, wave: 1 }, { id: 'w1b', at: [44, 18, 'G'], arms: 'smg', reserve: true, wave: 1 },
    { id: 'w2a', at: [43, 20, 'G'], arms: 'carbine', reserve: true, wave: 2 }, { id: 'w2b', at: [44, 12, 'G'], arms: 'shotgun', reserve: true, wave: 2 },
    { id: 'w2c', at: [6, 6, 'G'], arms: 'carbine', reserve: true, wave: 2 },
  ],
  devices: [
    { id: 'c-yard', kind: 'camera', at: [15, 23, 'G'], face: [-1, 1], net: 'northhq' },
    { id: 'c-hall', kind: 'camera', at: [16, 8, 'G'], face: [1, 1], net: 'northhq' },
    { id: 'a-hq', kind: 'alarm', at: [35, 15, 'G'], face: [1, 0], net: 'northhq' },
  ],
  terminals: [
    { id: 'sec', name: 'the guardroom console', at: [21, 31, 'G'], face: [0, 1], time: 6, net: 'northhq' },
    { id: 'standdown', name: 'the signals desk', at: [22, 17, 'G'], face: [0, 1], time: 8, verb: 'Send', doing: 'Sending',
      said: 'The stand-down starts going out in Strand\'s name, unit by unit. Hold the signals room until the last one has acknowledged: seventy-five seconds.' },
  ],
  intel: [
    { id: 'plan', at: [28, 18, 'G'], kind: 'Plan', title: 'The spring plan, on the map room table', text: ['Forty units, three axes, one date: the first of May. Every pin on the map is a town.'] },
    { id: 'note', at: [26, 18, '1'], kind: 'Note', title: 'A note in the intelligence office', text: ['The colonel has not been seen since Sunday. Tell the men he is ill. Tell the north nothing yet.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'identify', refs: ['so1', 'so2', 'so3'], text: 'Mark the three staff officers (upstairs)' },
    { id: 'o2', kind: 'hack', ref: 'standdown', text: 'Send the stand-down (the signals room)' },
    { id: 'o3', kind: 'reach', ref: 'hold', text: 'Hold the signals room while it goes out' },
  ],
};
