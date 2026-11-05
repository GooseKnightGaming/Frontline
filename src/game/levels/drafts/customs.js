// FRONTLINE - Level 110, the Customs House (first draft, M6.132; the start of THE SMUGGLERS, a new case). The war in
// the north is over, and Ghost has new work in the south: Port Saren, where the guns the north no longer needs are
// coming ashore by the crate and going on to whoever pays. Somebody in the Saren customs house is letting them
// through. Go in at night. Mark the inspector who signs the crates through, and take the seizure book from the
// bonded store: it shows what was seized, and what was let go again.
const W = 50, H = 34;
export default {
  id: 'customs', no: 110, title: 'The Customs House', place: 'the customs house, Port Saren',
  where: 'The customs house, Port Saren. 22:30, a warm night, a ship from the north in the roads.',
  brief: [
    ['The job', 'The war in the north is over, and Ghost has new work in the south. In <b>Port Saren</b> the guns the north no longer needs are coming ashore by the crate and going on to whoever pays. Somebody in the <b>customs house</b> is letting them through. Go in at night. <b>Mark the inspector</b> who signs the crates through. Take the <b>seizure book</b> from the bonded store: it shows what was seized, and what was let go again. If you can, <b>without the alarm</b>.'],
    ['The place', 'The <b>long room</b>, where cargo is declared, runs along the harbour side. The <b>inspector\'s office</b> is at its east end, and behind it is the <b>bonded store</b>, full of seized crates. The guardroom is on the west end, and there is a yard behind. You come in from the quay, south-west.'],
    ['Security', 'A camera in the long room and the alarm, both on the guardroom\'s console with the radio. The engineer is in the yard\'s pump house. The night shift are customs men, but they are being paid by the same people as the inspector, and they shoot like it.'],
    ['Objectives', '<b>Mark the inspector</b> (his office). Take the <b>seizure book</b> (the bonded store). If you can, <b>without the alarm</b>. Out to the quay, south-west.'],
  ],
  epilogue: {
    success: 'The seizure book shows two hundred crates seized this year and a hundred and ninety let go, every release signed by the same hand. The inspector keeps signing for a week, with Ghost reading over his shoulder, and every crate he signs for is followed.',
    partial: 'Ghost knows the inspector\'s face, or what he let go, but not both. The crates keep coming ashore.',
  },
  time: { date: [2, 7, 2027], hour: 22, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.2, 0.18, 0.2, 30, 180], ambient: [0.32, 0.3, 0.32] },
  extractName: 'the quay, south-west', extract: { x: 2, y: 31, floor: 'G', van: [0, -6] },
  outside: { backdrop: 'city', mat: 'concrete', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 4, wall: 'plaster', wallTint: [0.95, 0.88, 0.72], floor: 'tile', ceil: 'wood', lampPower: 0.7, lampColour: [1, 0.9, 0.7], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 10, 20, 34, 26],                       // the long room
        ['room', 36, 20, 42, 26],                       // the inspector's office
        ['room', 36, 10, 46, 18],                       // the bonded store
        ['room', 2, 20, 8, 26],                         // the guardroom
        ['room', 16, 8, 21, 12],                        // the pump house
      ], after: [
        ['cells', [[22, 27], [35, 23], [39, 19], [9, 23], [5, 19], [18, 13], [41, 9]], 'D'],
        ['cells', [[14, 27], [30, 27], [39, 27], [47, 14]], 'W'],
        // the long room's counters and benches, the office, the bonded store's crates, the guardroom
        ['room', 12, 22, 20, 22, 'T'], ['room', 24, 22, 32, 22, 'T'], ['room', 12, 25, 16, 25, 'Y'],
        ['cells', [[40, 22]], 'T'], ['cells', [[41, 25]], 'H'],
        ['room', 38, 12, 38, 16, 'C'], ['room', 42, 12, 42, 16, 'C'], ['cells', [[45, 11]], 'T'],
        ['cells', [[3, 21]], 'T'], ['cells', [[7, 25]], 'Y'],
        ['cells', [[19, 9]], 'M'],
        // the yard and the quay: bollards, nets, crates
        ['cells', [[26, 14], [10, 14], [24, 31], [48, 22]], 'B'], ['cells', [[30, 6], [44, 30], [12, 30]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    box([0, -0.05, 32 * C], [W * C, 0.02, H * C + 3], 'glassB', { tint: [0.2, 0.35, 0.45], solid: false });
    for (const [x, y] of [[22, 29], [8, 29], [38, 29], [30, 15]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 11, intensity: 0.8, color: [1, 0.9, 0.7], street: true });
    level.signs.push({ pos: [mid(22), 4.2, 27 * C + C + 0.13], yaw: 0, w: 5, h: 0.8, text: 'PORT SAREN CUSTOMS', sub: 'Declare all goods', col: '#1a3a4a' });
  },
  start: { x: 2, y: 30, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'long', label: 'The customs house - the long room', at: [10, 20, 34, 26] },
    { id: 'office', label: 'The customs house - the inspector\'s office', at: [36, 20, 42, 26] },
    { id: 'bond', label: 'The customs house - the bonded store', at: [36, 10, 46, 18] },
    { id: 'guard', label: 'The customs house - the guardroom', at: [2, 20, 8, 26] },
    { id: 'saren', label: 'Port Saren', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'insp', at: [39, 23, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The inspector', tint: [0.3, 0.32, 0.4] },
    { id: 'lr1', at: [22, 24, 'G'], route: [[11, 24], [33, 24]], arms: 'pistol' },
    { id: 'lr2', at: [28, 21, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'bs1', at: [40, 14, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'rad', at: [5, 23, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'gr1', at: [3, 24, 'G'], arms: 'carbine' },
    { id: 'eng', at: [18, 10, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'yd1', at: [30, 15, 'G'], route: [[24, 15], [34, 15]], arms: 'carbine', dog: true },
    { id: 'qy1', at: [30, 30, 'G'], route: [[16, 30], [46, 30]], arms: 'carbine' },
  ],
  pickups: [{ id: 'book', name: 'The seizure book', what: 'the seizure book', at: [45, 11, 'G'], table: true, colour: [0.2, 0.25, 0.4] }],
  devices: [
    { id: 'c-long', kind: 'camera', at: [10, 20, 'G'], face: [1, 1], net: 'saren' },
    { id: 'a-saren', kind: 'alarm', at: [35, 21, 'G'], face: [-1, 0], net: 'saren' },
  ],
  terminals: [{ id: 'sec', name: 'the guardroom console', at: [3, 21, 'G'], face: [0, 1], time: 6, net: 'saren' }],
  intel: [
    { id: 'manifest', at: [40, 22, 'G'], kind: 'Manifest', title: 'A ship\'s manifest on the inspector\'s desk', text: ['"Agricultural machinery, forty crates." Stamped CLEARED, with the inspector\'s initials, the day before the ship arrived.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'identify', refs: ['insp'], text: 'Mark the inspector (his office)' },
    { id: 'o2', kind: 'take', ref: 'book', text: 'Take the seizure book (the bonded store)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
