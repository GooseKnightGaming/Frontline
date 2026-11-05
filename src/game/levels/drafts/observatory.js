// FRONTLINE - Level 83, the Observatory (first draft, M6.105; lights you can put out). The funfair's message named the
// next drop: the old observatory on Kessock Peak, where the reds have put a listening post under the dome, and keep
// the astronomer who lived there to work their receiver. Go in by night with night vision. The dome's lights are on
// the observatory's own console: put them out, and the reds in the dome see only what their torches show them. Copy
// the receiver's recordings, bring the astronomer out, and take the drop.
const W = 44, H = 36;
export default {
  id: 'observatory', no: 83, title: 'The Observatory', place: 'the observatory on Kessock Peak',
  where: 'The observatory on Kessock Peak. 01:30, a clear, cold night, the dome open to the stars.',
  brief: [
    ['The job', 'The funfair\'s message named the next drop: the old <b>observatory</b> on Kessock Peak. The reds have put a <b>listening post</b> under its dome, and they keep the astronomer who lived there, <b>Dr Elin Sauer</b>, to work their receiver. <b>Copy the receiver\'s recordings</b> in the dome. Bring <b>Dr Sauer</b> out. Take the courier\'s <b>drop</b> from the library.'],
    ['The place', 'The <b>dome</b> with the telescope and the receiver beside it. The <b>library</b> and the astronomer\'s rooms in the wing to the south. The generator and the guard hut by the road, and the road comes up the peak from the east. You have <b>night vision</b>.'],
    ['Security', 'Cameras, the dome\'s maglock (the duty officer has the card), the alarm, and the <b>dome\'s lights</b>, all on the guard hut\'s console. Put the lights out and the reds in the dome see only what their torches show. The radio is in the guard hut, the engineer at the generator.'],
    ['Objectives', '<b>Copy the recordings</b> (the dome). Bring <b>Dr Sauer</b> out (her rooms). Take the <b>drop</b> (the library). Out by the road, east.'],
  ],
  epilogue: {
    success: 'Dr Sauer goes down the mountain in the back of a Ghost car, still arguing about the telescope. The recordings are six months of the reds\' own traffic, and Ghost reads every word of it before the spring.',
    partial: 'Part of it: the doctor, or the recordings, or the drop. The reds will move their listening post somewhere without a telescope.',
  },
  time: { date: [27, 4, 2027], hour: 1, minute: 30 }, night: true, dark: true, startGear: 'NVG', faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'NVG', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.05, 0.06, 0.09, 30, 200], ambient: [0.16, 0.17, 0.22] },
  extractName: 'the road, east', extract: { x: 42, y: 18, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 4.5, wall: 'concrete2', wallTint: [0.82, 0.8, 0.76], floor: 'wood', ceil: 'metal', lampPower: 0.7, lampColour: [1, 0.9, 0.75], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 12, 6, 26, 16],                        // the dome
        ['room', 12, 18, 18, 26],                       // the library
        ['room', 20, 18, 26, 26],                       // the astronomer's rooms
        ['room', 32, 22, 38, 27],                       // the guard hut
        ['room', 32, 8, 37, 12],                        // the generator house
      ], after: [
        ['cells', [[15, 17], [23, 17], [19, 22], [27, 11], [23, 27], [35, 21], [34, 13]], 'D'],      // (the dome's east door maglocked; her rooms' own door south)
        ['cells', [[11, 11], [19, 5], [11, 22], [27, 22], [39, 24]], 'W'],
        // the telescope on its pier, the receiver's desk, the library's shelves and table, her rooms
        ['room', 18, 10, 20, 12, 'M'], ['cells', [[14, 8], [24, 8]], 'T'], ['cells', [[24, 14]], 'K'],
        ['room', 13, 19, 13, 25, 'H'], ['cells', [[16, 22]], 'T'],
        ['cells', [[22, 20], [25, 25]], 'T'], ['cells', [[25, 19]], 'Y'],
        ['cells', [[34, 24], [37, 26]], 'T'], ['cells', [[35, 10]], 'M'],
        ['cells', [[8, 4], [30, 4], [6, 28], [30, 31], [40, 14], [4, 16]], 'r'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    box([12 * C - 0.2, 4.5, 6 * C - 0.2], [27 * C + 0.2, 5.5, 17 * C + 0.2], 'metal', { tint: [0.55, 0.58, 0.6] });
    box([18 * C, 4.0, 10 * C], [21 * C, 4.6, 13 * C], 'metal', { tint: [0.3, 0.32, 0.36] });
  },
  start: { x: 42, y: 16, floor: 'G', yaw: Math.PI / 2 },
  zones: [
    { id: 'dome', label: 'The Observatory - the dome', at: [12, 6, 26, 16] },
    { id: 'lib', label: 'The Observatory - the library', at: [12, 18, 18, 26] },
    { id: 'rooms', label: 'The Observatory - Dr Sauer\'s rooms', at: [20, 18, 26, 26] },
    { id: 'hut', label: 'The Observatory - the guard hut', at: [32, 22, 38, 27] },
    { id: 'gen', label: 'The Observatory - the generator house', at: [32, 8, 37, 12] },
    { id: 'peak', label: 'Kessock Peak', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'duty', at: [22, 9, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', card: 'obs', name: 'The duty officer' },
    { id: 'rec', at: [15, 9, 'G'], arms: 'pistol', rank: 'specialist', temper: 'cowardly', name: 'The listener' },
    { id: 'dm', at: [16, 14, 'G'], route: [[14, 14], [24, 14]], arms: 'smg' },
    { id: 'lb', at: [15, 24, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'rad', at: [36, 24, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [33, 11, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'p1', at: [20, 30, 'G'], route: [[6, 30], [36, 30]], arms: 'carbine', dog: true },
    { id: 'p2', at: [6, 12, 'G'], route: [[6, 3], [6, 26]], arms: 'carbine' },
  ],
  hostages: [{ id: 'sauer', name: 'Dr Sauer', she: true, at: [23, 22, 'G'] }],
  pickups: [{ id: 'drop', name: 'The courier\'s drop', what: 'the drop', at: [16, 22, 'G'], table: true, colour: [0.9, 0.85, 0.7] }],
  devices: [
    { id: 'c-door', kind: 'camera', at: [28, 17, 'G'], face: [1, 1], net: 'obs' },
    { id: 'm-dome', kind: 'lock', at: [27, 11, 'G'], net: 'obs' },
    { id: 'l-dome', kind: 'lights', at: [12, 16, 'G'], face: [1, 0], area: [12, 6, 26, 16], name: 'the dome', net: 'obs' },
    { id: 'a-obs', kind: 'alarm', at: [31, 22, 'G'], face: [-1, 0], net: 'obs' },
  ],
  terminals: [
    { id: 'sec', name: 'the guard hut console', at: [34, 24, 'G'], face: [0, 1], time: 6, net: 'obs' },
    { id: 'recv', name: 'the receiver', at: [14, 8, 'G'], face: [0, 1], time: 8, reveal: 20, verb: 'Copy', doing: 'Copying',
      said: 'Six months of the reds\' traffic, every word the receiver heard. Every red on the peak is on your radar for 20 seconds.' },
  ],
  intel: [
    { id: 'log', at: [24, 8, 'G'], kind: 'Log', title: 'The observing log', text: ['Dr Sauer\'s hand, every clear night for twenty years. Then, three months ago, in another hand: "Telescope not required."'] },
    { id: 'letter', at: [22, 20, 'G'], kind: 'Letter', title: 'A letter on her desk, unsent', text: ['They have me listening to their radio instead of the sky. I have written down everything I heard, on the backs of my star charts.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'recv', text: 'Copy the recordings (the dome)' },
    { id: 'o2', kind: 'rescue', ref: 'sauer', text: 'Bring Dr Sauer out (her rooms)' },
    { id: 'o3', kind: 'take', ref: 'drop', text: 'Take the drop (the library)' },
  ],
};
