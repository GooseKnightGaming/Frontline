// FRONTLINE - Level 119, the Witness Flat (first draft, M6.141; the start of THE WITNESSES). Brandt, Kray and Dancourt
// are to be tried together in Lessar, and the case rests on a witness: Marta Lind, Kray's bookkeeper for nine years,
// in a Ghost safe flat on the top floor of a tenement in the old quarter. Somebody has sold the address. Get there
// before they do, with Hale and Moss, and hold her flat until the car comes to move her.
const W = 52, H = 40;
export default {
  id: 'witnessflat', no: 119, title: 'The Witness Flat', place: 'a tenement in Lessar\'s old quarter',
  where: 'A tenement in Lessar\'s old quarter. 23:40, rain, the street lamps out.',
  brief: [
    ['The job', 'Brandt, Kray and Dancourt are to be tried together in Lessar, and the case rests on a witness: <b>Marta Lind</b>, Kray\'s bookkeeper for nine years. She is in a Ghost safe flat on the <b>top floor</b> of a tenement in the old quarter, and somebody has sold the address. Get there before they do, with <b>Hale and Moss</b>. <b>Hold her flat</b> until the car comes to move her. <b>Mark the man leading them</b>.'],
    ['The place', 'A tenement round a courtyard, with the gate on the south side. Downstairs are the entrance hall, the laundry and the caretaker\'s rooms. <b>Upstairs</b>, along the landing, are three flats, and <b>hers</b> is the one at the east end, up the stair. The sheds are east, the coal yard west.'],
    ['Security', 'There is none of Ghost\'s here but you three. They are coming in four lots: from the gate, from the coal yard, over the sheds, and the last with their <b>leader</b>. They want her, not you.'],
    ['Objectives', '<b>Hold her flat</b> until the car comes (two minutes). <b>Mark the leader</b> (with the last of them). Out by the gate, south.'],
  ],
  epilogue: {
    success: 'The car comes at a quarter past midnight and Marta Lind goes down the stair between Hale and Moss with her coat over her head. She gives her evidence on Monday for six hours, and does not once look at the dock.',
    partial: 'She is out, but the man who sold her address is not known. Ghost will have to move her again, and again.',
  },
  time: { date: [16, 8, 2027], hour: 23, minute: 40 }, night: true, faction: 'red', weather: 'rain',
  relations: { red: { you: true, ghost: true }, ghost: { you: false, red: true } },
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.16, 0.16, 0.2, 25, 160], ambient: [0.26, 0.26, 0.3] },
  extractName: 'the gate, south', extract: { x: 26, y: 39, floor: 'G', van: [5, 1] },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'brick', wallTint: [0.6, 0.42, 0.36], floor: 'wood', ceil: 'concrete2', lampPower: 0.7, lampColour: [0.95, 0.95, 1], lampEvery: 5,
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
        ['cells', [[18, 26], [32, 26], [10, 28], [42, 28], [8, 6], [44, 5]], 'C'],
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
  start: { x: 32, y: 17, floor: '1', yaw: -Math.PI / 2 },
  zones: [
    { id: 'hall', label: 'The tenement - the entrance hall', at: [16, 8, 34, 14] },
    { id: 'laundry', label: 'The tenement - the laundry', at: [16, 16, 24, 22] },
    { id: 'caretaker', label: 'The tenement - the caretaker\'s rooms', at: [26, 16, 34, 22] },
    { id: 'flat', label: 'The tenement - her flat', at: [30, 13, 34, 22], floor: '1' },
    { id: 'upstairs', label: 'The tenement - upstairs', at: [16, 8, 34, 22], floor: '1' },
    { id: 'yard', label: 'Lessar, the old quarter', at: [0, 0, W - 1, H - 1] },
  ],
  reach: [
    { id: 'flat', name: 'Her flat', at: [30, 13, 34, 22], floor: '1', hold: 120,
      said: 'Headlights in the courtyard, twice: the car. Marta Lind goes down the stair between Hale and Moss. You held it.' },
  ],
  guards: [
    { id: 'hale', at: [31, 15, '1'], faction: 'ghost', ally: true, name: 'Hale', arms: 'carbine', temper: 'steady', tint: [0.45, 0.6, 1.35] },
    { id: 'moss', at: [33, 15, '1'], faction: 'ghost', ally: true, name: 'Moss', arms: 'smg', temper: 'bold', tint: [0.4, 0.55, 1.3] },
    { id: 'w1a', at: [25, 36, 'G'], arms: 'carbine', reserve: true, wave: 1 }, { id: 'w1b', at: [27, 36, 'G'], arms: 'smg', reserve: true, wave: 1 },
    { id: 'w2a', at: [6, 30, 'G'], arms: 'carbine', reserve: true, wave: 2 }, { id: 'w2b', at: [8, 32, 'G'], arms: 'shotgun', reserve: true, wave: 2 },
    { id: 'w3a', at: [43, 14, 'G'], arms: 'carbine', reserve: true, wave: 3 }, { id: 'w3b', at: [44, 18, 'G'], arms: 'smg', reserve: true, wave: 3 },
    { id: 'w4a', at: [24, 32, 'G'], arms: 'carbine', reserve: true, wave: 4 }, { id: 'w4b', at: [21, 31, 'G'], arms: 'dmr', reserve: true, wave: 4 },
    { id: 'lead', at: [25, 33, 'G'], arms: 'pistol', rank: 'officer', temper: 'bold', reserve: true, wave: 4, name: 'Their leader', tint: [0.3, 0.28, 0.26] },
  ],
  civilians: [
    { id: 'marta', at: [33, 20, '1'], yaw: -Math.PI / 2, title: 'Marta Lind', tint: [0.9, 0.85, 0.8], says: ['Nine years I kept his books. I can tell you what every one of those crates cost, to the penny. If I live till Monday.'] },
    { id: 'caretaker', at: [27, 17, 'G'], yaw: 0, title: 'The caretaker', tint: [0.8, 0.75, 0.7], says: ['Somebody paid me fifty to tell them which flat. I told them the wrong one. Then I telephoned your people.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'reach', ref: 'flat', text: 'Hold her flat until the car comes' },
    { id: 'o2', kind: 'identify', refs: ['lead'], text: 'Mark their leader (with the last of them)' },
  ],
};
