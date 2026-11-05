// FRONTLINE - Level 107, the Treaty House (first draft, M6.129; the start of THE PEACE). The north has asked for terms.
// The talks are to be at Lake Morra, in the old Ostberg house, in two days, and the north's own security service still
// has the house until then. Ghost's people say the service means to hear every word: three microphones are already
// in, and the man who put them there is on the house staff. Go in by night. Take out the three microphones, and mark
// the man who planted them.
const W = 50, H = 38;
export default {
  id: 'treaty', no: 107, title: 'The Treaty House', place: 'the Ostberg house, Lake Morra',
  where: 'The Ostberg house, Lake Morra. 01:00, two days before the talks, the house being made ready.',
  brief: [
    ['The job', 'The north has asked for terms. The talks will be at <b>Lake Morra</b>, in the old <b>Ostberg house</b>, in two days, and the north\'s own security service has the house until then. Ghost\'s people say the service means to hear every word. <b>Three microphones</b> are already in, and the man who put them there is on the house staff. Go in by night. <b>Take out the three microphones</b>. <b>Mark the man</b> who planted them. If you can, <b>without the alarm</b>.'],
    ['The place', 'The <b>great hall</b>, where the talks will be, is on the north side with its long table. The <b>salon</b> and the <b>library</b> are south of it, the kitchens east, and the staff hall beyond the kitchens. The lake is to the west, and you come in along its shore.'],
    ['Security', 'Cameras on the terrace and the hall, and the alarm, all on the console in the staff hall with the radio. The engineer is in the kitchens. The service\'s men walk the house and the terrace. The staff are not reds.'],
    ['Objectives', 'Take out the microphones in the <b>great hall</b>, the <b>salon</b> and the <b>library</b>. <b>Mark the man who planted them</b> (the staff). If you can, <b>without the alarm</b>. Out along the lake shore, west.'],
  ],
  epilogue: {
    success: 'The talks open at Lake Morra with nobody listening who was not invited. The man from the staff serves the soup on the first day, and is not there on the second.',
    partial: 'Some of the microphones are out, or the man who planted them is not known. Both sides at the table choose their words very carefully.',
  },
  time: { date: [15, 6, 2027], hour: 1, minute: 0 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.12, 0.14, 0.18, 25, 170], ambient: [0.24, 0.26, 0.31] },
  extractName: 'the lake shore, west', extract: { x: 2, y: 34, floor: 'G', van: [6, 2] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 4, wall: 'plaster', wallTint: [0.9, 0.86, 0.8], floor: 'wood', ceil: 'plaster', lampPower: 0.6, lampColour: [1, 0.9, 0.75], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 12, 8, 38, 16],                        // the great hall
        ['room', 12, 18, 22, 26],                       // the salon
        ['room', 24, 18, 38, 26],                       // the library
        ['room', 40, 10, 46, 22],                       // the kitchens
        ['room', 40, 24, 46, 30],                       // the staff hall
      ], after: [
        ['cells', [[17, 17], [31, 17], [23, 22], [39, 13], [43, 23], [17, 27], [43, 31]], 'D'],
        ['cells', [[11, 12], [20, 7], [30, 7], [11, 22], [31, 27]], 'W'],
        // the great hall's long table and chairs, the salon's sofas and lamp, the library's shelves and phone table
        ['room', 18, 12, 32, 12, 'T'], ['cells', [[14, 9], [36, 15]], 'H'],
        ['room', 14, 20, 14, 24, 'Y'], ['cells', [[20, 25]], 'T'], ['cells', [[16, 19]], 'T'],
        ['room', 25, 19, 37, 19, 'H'], ['cells', [[34, 24]], 'T'], ['cells', [[28, 23]], 'T'],
        ['room', 41, 11, 45, 11, 'T'], ['cells', [[45, 20]], 'M'],
        ['cells', [[41, 25]], 'T'], ['cells', [[45, 29]], 'Y'],
        // the terrace's urns and the shore's boats
        ['cells', [[8, 6], [8, 30], [26, 32], [42, 4], [4, 18], [36, 30]], 'B'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    box([0, -0.05, 0], [3 * C, 0.02, H * C], 'glassB', { tint: [0.3, 0.4, 0.5], solid: false });
    for (const [x, y] of [[10, 10], [10, 24], [25, 29], [44, 33]]) level.lights.push({ pos: [mid(x), 4, mid(y)], range: 10, intensity: 0.7, color: [1, 0.9, 0.75], street: true });
  },
  start: { x: 2, y: 30, floor: 'G', yaw: 0 },
  zones: [
    { id: 'hall', label: 'The Ostberg house - the great hall', at: [12, 8, 38, 16] },
    { id: 'salon', label: 'The Ostberg house - the salon', at: [12, 18, 22, 26] },
    { id: 'lib', label: 'The Ostberg house - the library', at: [24, 18, 38, 26] },
    { id: 'kitch', label: 'The Ostberg house - the kitchens', at: [40, 10, 46, 22] },
    { id: 'staff', label: 'The Ostberg house - the staff hall', at: [40, 24, 46, 30] },
    { id: 'morra', label: 'Lake Morra', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'spy', at: [42, 15, 'G'], arms: 'pistol', rank: 'specialist', temper: 'cowardly', name: 'The second footman', tint: [0.95, 0.95, 0.95] },
    { id: 'h1', at: [25, 10, 'G'], route: [[14, 10], [36, 10]], arms: 'smg' },
    { id: 'h2', at: [25, 14, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 's1', at: [18, 22, 'G'], arms: 'pistol' },
    { id: 'l1', at: [31, 21, 'G'], route: [[26, 21], [36, 21]], arms: 'carbine' },
    { id: 'rad', at: [43, 27, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [44, 19, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 't1', at: [24, 5, 'G'], route: [[10, 5], [40, 5]], arms: 'carbine', dog: true },
    { id: 't2', at: [30, 29, 'G'], route: [[24, 29], [38, 29]], arms: 'carbine' },
  ],
  civilians: [
    { id: 'butler', at: [44, 12, 'G'], yaw: Math.PI / 2, title: 'The butler', tint: [0.4, 0.4, 0.45], says: ['Forty years in this house. The second footman arrived a fortnight ago with a letter from the service, and cannot fold a napkin.'] },
    { id: 'maid', at: [16, 24, 'G'], yaw: 0, title: 'A housemaid, dusting', tint: [1.1, 1.0, 1.0], says: ['Somebody has been at the lamp in here. It was never that heavy.'] },
  ],
  devices: [
    { id: 'c-terr', kind: 'camera', at: [11, 27, 'G'], face: [-1, 1], net: 'ostberg' },
    { id: 'c-hall', kind: 'camera', at: [12, 8, 'G'], face: [1, 1], net: 'ostberg' },
    { id: 'a-ost', kind: 'alarm', at: [39, 26, 'G'], face: [-1, 0], net: 'ostberg' },
  ],
  terminals: [
    { id: 'sec', name: 'the staff hall console', at: [41, 25, 'G'], face: [0, 1], time: 6, net: 'ostberg' },
    { id: 'micH', name: 'the microphone under the long table', at: [25, 12, 'G'], face: [0, 1], time: 4, verb: 'Remove', doing: 'Removing', said: 'A microphone the size of a button, wired under the long table. Out.' },
    { id: 'micS', name: 'the microphone in the salon lamp', at: [20, 25, 'G'], face: [0, -1], time: 4, verb: 'Remove', doing: 'Removing', said: 'The salon lamp\'s base had a microphone in it. Not any more.' },
    { id: 'micL', name: 'the microphone in the library telephone', at: [34, 24, 'G'], face: [0, -1], time: 4, verb: 'Remove', doing: 'Removing', said: 'The library telephone listened even with the receiver down. It has stopped.' },
  ],
  intel: [
    { id: 'seating', at: [28, 23, 'G'], kind: 'Plan', title: 'The seating plan, in the library', text: ['Both delegations, chair by chair. Beside the north\'s chief delegate, in the service\'s hand: "Watch who he looks at."'] },
    { id: 'letter', at: [16, 19, 'G'], kind: 'Letter', title: 'A letter on the salon\'s writing desk', text: ['To the second footman, from the service: "Three, as agreed. Check them nightly. Destroy this."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'micH', text: 'Take out the microphone in the great hall' },
    { id: 'o2', kind: 'hack', ref: 'micS', text: 'Take out the microphone in the salon' },
    { id: 'o3', kind: 'hack', ref: 'micL', text: 'Take out the microphone in the library' },
    { id: 'o4', kind: 'identify', refs: ['spy'], text: 'Mark the man who planted them (the staff)' },
    { id: 'o5', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
