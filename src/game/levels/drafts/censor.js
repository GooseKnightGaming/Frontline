// FRONTLINE - Level 95, the Censor's Office (first draft, M6.117; THE PRESS, second). The Courier is set again, but no
// newspaper in the north prints a word the censor has not passed, and his office in Hollen holds the blacklist of
// every editor who has ever tried. Go in by night. Send the Courier's front page out on the censor's own teleprinter,
// to every newsroom on the wire, as passed. Take the blacklist, and take the censor alive.
const W = 48, H = 34;
export default {
  id: 'censor', no: 95, title: 'The Censor\'s Office', place: 'the Office of Press Standards, Hollen',
  where: 'The Office of Press Standards, Hollen. 01:30, the teleprinters chattering in an empty building.',
  brief: [
    ['The job', 'The Courier is set again, but no newspaper in the north prints a word the <b>censor</b> has not passed. His office in Hollen holds the <b>blacklist</b> of every editor who has ever tried. <b>Send the Courier\'s front page</b> on the censor\'s own <b>teleprinter</b>, to every newsroom on the wire, stamped as passed. Take the <b>blacklist</b>. <b>Take the censor alive</b>: he is working late.'],
    ['The place', 'Downstairs, the <b>front office</b> and the <b>teleprinter room</b>, with a stair up from the back. Upstairs, the <b>censor\'s office</b> and the <b>archive</b>. There is a yard behind with a gate on the east side, where you are.'],
    ['Security', 'A camera on the yard and the alarm, both on the duty clerk\'s console in the teleprinter room, with the radio. The engineer is in the yard\'s boiler house. The censor keeps a guard on his door.'],
    ['Objectives', '<b>Send the front page</b> (the teleprinter room). Take the <b>blacklist</b> (the archive, upstairs). <b>Take the censor alive</b> (his office, upstairs). If you can, <b>without the alarm</b>. Out by the yard gate, east.'],
  ],
  epilogue: {
    success: 'By breakfast the Courier\'s front page is on every newsroom\'s wire in the north, passed by the censor himself. Half the north\'s newspapers print it before anyone thinks to ask. The censor spends the morning explaining the stamp, and the blacklist goes to the editors on it.',
    partial: 'Part of it. Some of the newsrooms printed the front page, and some of them waited to be told.',
  },
  time: { date: [17, 5, 2027], hour: 1, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.18, 0.19, 0.23, 25, 160], ambient: [0.28, 0.28, 0.33] },
  extractName: 'the yard gate, east', extract: { x: 46, y: 24, floor: 'G', van: [0, 5] },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'concrete2', wallTint: [0.7, 0.7, 0.68], floor: 'tile', ceil: 'plaster', lampPower: 0.7, lampColour: [0.95, 0.95, 1], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 10, 6, 18, 14],                        // the front office
        ['room', 20, 6, 26, 14],                        // the teleprinter room
        ['room', 34, 20, 39, 24],                       // the boiler house
      ], after: [
        ['cells', [[14, 5], [19, 10], [23, 15], [36, 19]], 'D'],
        ['cells', [[11, 5], [17, 5], [27, 10], [13, 15], [40, 22]], 'W'],
        ['room', 11, 7, 13, 7, 'T'], ['cells', [[16, 13]], 'H'], ['cells', [[11, 12]], 'T'],
        ['room', 21, 7, 23, 7, 'K'], ['cells', [[21, 9]], 'T'], ['cells', [[21, 12]], 'T'],
        ['cells', [[38, 23]], 'M'],
        ['cells', [[10, 27], [24, 29], [30, 18], [42, 28], [6, 18]], 'B'],
      ] },
    },
    1: {
      y: 3.8, wallH: 3.2, wall: 'plaster', wallTint: [0.8, 0.78, 0.74], floor: 'carpet', ceil: 'plaster', lampPower: 0.45, lampColour: [1, 0.9, 0.75], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 10, 6, 16, 14],                        // the censor's office
        ['room', 18, 6, 26, 14],                        // the archive
      ], after: [
        ['cells', [[17, 10]], 'D'],
        ['cells', [[13, 5], [19, 5], [23, 5], [27, 11]], 'W'],
        ['cells', [[13, 9]], 'T'], ['cells', [[11, 13]], 'H'],
        ['room', 19, 13, 23, 13, 'H'], ['room', 19, 7, 21, 7, 'H'], ['cells', [[21, 10]], 'T'],
      ] },
    },
  },
  stairs: [{ x: 25, y: 12, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { level, mid } = kit;
    for (const [x, y] of [[14, 3], [30, 3], [22, 18], [44, 24], [36, 30]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 11, intensity: 0.8, color: [0.95, 0.95, 1], street: true });
  },
  start: { x: 46, y: 23, floor: 'G', yaw: Math.PI / 2 },
  zones: [
    { id: 'front', label: 'Press Standards - the front office', at: [10, 6, 18, 14] },
    { id: 'tele', label: 'Press Standards - the teleprinter room', at: [20, 6, 26, 14] },
    { id: 'cens', label: 'Press Standards - the censor\'s office', at: [10, 6, 16, 14], floor: '1' },
    { id: 'arch', label: 'Press Standards - the archive', at: [18, 6, 26, 14], floor: '1' },
    { id: 'boil', label: 'Press Standards - the boiler house', at: [34, 20, 39, 24] },
    { id: 'hollen', label: 'Hollen', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'cens', at: [12, 10, '1'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The censor', tint: [0.3, 0.3, 0.34] },
    { id: 'door', at: [19, 9, '1'], arms: 'smg', temper: 'steady' },
    { id: 'ar1', at: [23, 11, '1'], arms: 'pistol' },
    { id: 'rad', at: [22, 10, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio', name: 'The duty clerk' },
    { id: 'fo1', at: [15, 9, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'eng', at: [36, 22, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'yd1', at: [24, 18, 'G'], route: [[12, 18], [32, 18]], arms: 'carbine' },
    { id: 'st1', at: [24, 2, 'G'], route: [[8, 2], [40, 2]], arms: 'carbine' },
  ],
  pickups: [{ id: 'black', name: 'The blacklist', what: 'the blacklist', at: [21, 10, '1'], table: true, colour: [0.15, 0.15, 0.15] }],
  devices: [
    { id: 'c-yard', kind: 'camera', at: [27, 15, 'G'], face: [1, 1], net: 'press' },
    { id: 'a-press', kind: 'alarm', at: [19, 15, 'G'], face: [0, 1], net: 'press' },
  ],
  terminals: [
    { id: 'sec', name: 'the duty clerk\'s console', at: [21, 12, 'G'], face: [0, -1], time: 6, net: 'press' },
    { id: 'wire', name: 'the teleprinter', at: [21, 9, 'G'], face: [0, 1], time: 8, verb: 'Send', doing: 'Sending',
      said: 'The Courier\'s front page goes out on the wire to every newsroom in the north, stamped PASSED.' },
  ],
  intel: [
    { id: 'stamp', at: [13, 9, '1'], kind: 'Stamp', title: 'The censor\'s stamp, on his desk', text: ['PASSED FOR PUBLICATION, and a signature. There are three hundred sheets beside it waiting for it, and none of them is news.'] },
    { id: 'wiremap', at: [11, 12, 'G'], kind: 'List', title: 'The wire\'s list of newsrooms', text: ['Eighty-one newsrooms, from Hollen to the coast. Beside each, the name of its editor, and beside some of those, the word "careful".'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'wire', text: 'Send the front page (the teleprinter room)' },
    { id: 'o2', kind: 'take', ref: 'black', text: 'Take the blacklist (the archive, upstairs)' },
    { id: 'o3', kind: 'capture', ref: 'cens', text: 'Take the censor alive (his office, upstairs)' },
    { id: 'o4', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
