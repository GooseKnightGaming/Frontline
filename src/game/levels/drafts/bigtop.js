// FRONTLINE - Level 125, the Big Top (first draft, M6.147; the start of THE CIRCUS). With Kray taken, his ledger named
// the people who carried his messages across borders that guns could not cross: the Circus Orlov, which tours every
// country on the map and is searched by none of them. Go to the show at Lessar. Mark the ringmaster's contact in the
// audience, and take the circus's route book from the ringmaster's wagon.
const W = 56, H = 42;
export default {
  id: 'bigtop', no: 125, title: 'The Big Top', place: 'the Circus Orlov, on the Lessar common',
  where: 'The Circus Orlov, on the Lessar common. 19:30, the evening show, the band playing.',
  brief: [
    ['The job', 'With Kray taken, his ledger named the people who carried his messages across borders that guns could not cross: the <b>Circus Orlov</b>, which tours every country on the map and is searched by none of them. Go to the show at Lessar. <b>Mark the ringmaster\'s contact</b> in the audience. Take the circus\'s <b>route book</b> from the ringmaster\'s wagon. If you can, <b>without the alarm</b>.'],
    ['The place', 'The <b>big top</b> is in the middle of the common, with its ring and its seats. The <b>wagons</b> stand in a line behind it, north, and the <b>ringmaster\'s wagon</b> is the painted one at the east end. The menagerie is west and the ticket booth south. You come in with the crowd, <b>dressed as one of the circus hands</b>.'],
    ['Security', 'The circus has its own men, and they are not jugglers. There is a camera on the wagons and an alarm, both on the console in the ticket booth with the radio. The engineer is at the generator lorry. The contact sits in the front row and watches the ringmaster, not the acts.'],
    ['Objectives', '<b>Mark the contact</b> (the front row). Take the <b>route book</b> (the ringmaster\'s wagon). If you can, <b>without the alarm</b>. Out with the crowd, south.'],
  ],
  epilogue: {
    success: 'The route book shows where the Circus Orlov will be for the rest of the year, and which towns get a performance nobody bought tickets for. The contact goes home after the show, and Ghost goes with him.',
    partial: 'Ghost knows the contact or the route, not both. The circus moves on tomorrow.',
  },
  time: { date: [9, 9, 2027], hour: 19, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT', startDisguise: 'red',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.2, 0.15, 0.18, 25, 170], ambient: [0.34, 0.28, 0.3] },
  extractName: 'the common, south', extract: { x: 28, y: 41, floor: 'G', van: [10, 0] },
  outside: { backdrop: 'city', mat: 'grass', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 6, wall: 'paint', wallTint: [0.85, 0.25, 0.22], floor: 'wood', ceil: 'paint', lampPower: 1.0, lampColour: [1, 0.85, 0.7], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 16, 14, 40, 30],                       // the big top
        ['room', 10, 4, 15, 8],                         // a wagon
        ['room', 19, 4, 24, 8],                         // a wagon
        ['room', 28, 4, 33, 8],                         // a wagon
        ['room', 37, 4, 44, 8],                         // the ringmaster's wagon
        ['room', 2, 16, 10, 26],                        // the menagerie
        ['room', 24, 35, 32, 38],                       // the ticket booth
      ], after: [
        ['cells', [[28, 13], [28, 31], [41, 22], [12, 9], [21, 9], [30, 9], [40, 9], [11, 21], [28, 34]], 'D'],
        // the ring (low wall), the seats round it, the band's stand
        ['room', 24, 19, 27, 19, 'K'], ['room', 29, 19, 32, 19, 'K'], ['room', 24, 25, 27, 25, 'K'], ['room', 29, 25, 32, 25, 'K'], ['room', 24, 20, 24, 24, 'K'], ['room', 32, 20, 32, 24, 'K'],
        ['room', 18, 16, 22, 16, 'Y'], ['room', 34, 16, 38, 16, 'Y'], ['room', 18, 28, 22, 28, 'Y'], ['room', 34, 28, 38, 28, 'Y'],
        ['room', 17, 18, 17, 26, 'Y'], ['room', 39, 18, 39, 26, 'Y'], ['cells', [[28, 15]], 'T'],
        ['cells', [[11, 5], [20, 5], [29, 5]], 'Y'], ['cells', [[42, 5]], 'T'], ['cells', [[38, 7]], 'H'],
        ['room', 4, 18, 4, 24, 'K'], ['room', 8, 18, 8, 24, 'K'],
        ['cells', [[25, 36]], 'T'], ['cells', [[31, 37]], 'Y'],
        // the generator lorry, the guy-ropes' pegs, the crowd's benches
        ['cells', [[48, 12]], 'M'], ['cells', [[46, 30], [12, 32], [44, 37], [6, 34], [50, 22], [14, 12]], 'B'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    box([28 * C - 0.15, 6, 22 * C - 0.15], [28 * C + 0.15, 11, 22 * C + 0.15], 'wood', { tint: [0.5, 0.4, 0.3] });
    level.lights.push({ pos: [mid(28), 5.5, mid(22)], range: 14, intensity: 1.4, color: [1, 0.92, 0.8] });
    for (const [x, y] of [[28, 10], [12, 14], [44, 14], [20, 38], [48, 30]]) level.lights.push({ pos: [mid(x), 4, mid(y)], range: 10, intensity: 0.9, color: [1, 0.8, 0.6], street: true });
    level.signs.push({ pos: [mid(28), 5, 31 * C + C + 0.13], yaw: 0, w: 6, h: 0.9, text: 'CIRCUS ORLOV', sub: 'Every Country - Every Night', col: '#6a1a1a' });
  },
  start: { x: 21, y: 40, floor: 'G', yaw: 0 },
  zones: [
    { id: 'tent', label: 'The Circus Orlov - the big top', at: [16, 14, 40, 30] },
    { id: 'wagons', label: 'The Circus Orlov - the wagons', at: [10, 4, 44, 8] },
    { id: 'rmwagon', label: 'The Circus Orlov - the ringmaster\'s wagon', at: [37, 4, 44, 8] },
    { id: 'zoo', label: 'The Circus Orlov - the menagerie', at: [2, 16, 10, 26] },
    { id: 'booth', label: 'The Circus Orlov - the ticket booth', at: [24, 35, 32, 38] },
    { id: 'common', label: 'The Lessar common', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'contact', at: [26, 18, 'G'], arms: 'pistol', rank: 'specialist', temper: 'cowardly', name: 'The contact (the front row)', tint: [0.4, 0.4, 0.45], yaw: Math.PI },
    { id: 'ring', at: [28, 22, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The ringmaster', tint: [0.8, 0.1, 0.1] },
    { id: 'ch1', at: [20, 22, 'G'], arms: 'pistol' },
    { id: 'ch2', at: [36, 22, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'wg1', at: [34, 10, 'G'], route: [[12, 10], [46, 10]], arms: 'carbine' },
    { id: 'rad', at: [27, 37, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [48, 14, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'zk', at: [6, 21, 'G'], arms: 'carbine', temper: 'steady', dog: true },
  ],
  civilians: [
    { id: 'clown', at: [30, 23, 'G'], yaw: Math.PI, title: 'A clown, between turns', tint: [1.3, 1.2, 1.2], says: ['Smile, they are watching. The ringmaster gets letters in every town, and nobody in this circus can read.'] },
    { id: 'aud1', at: [20, 17, 'G'], yaw: 0, title: 'A child with candyfloss', tint: [1.3, 1.1, 1.2], says: ['The man in the front row did not laugh at the elephant. Everybody laughs at the elephant.'] },
    { id: 'aud2', at: [36, 29, 'G'], yaw: Math.PI, title: 'A courting couple', tint: [1.1, 1.1, 1.2], says: ['We came for the trapeze. They cancelled the trapeze.'] },
    { id: 'aud3', at: [18, 26, 'G'], yaw: Math.PI / 2, title: 'A retired schoolmaster', tint: [0.9, 0.9, 0.85], says: ['I have seen this circus in four countries. The same act, the same faces, and the same man in the front row.'] },
  ],
  pickups: [{ id: 'route', name: 'The circus\'s route book', what: 'the route book', at: [42, 5, 'G'], table: true, colour: [0.6, 0.15, 0.15] }],
  devices: [
    { id: 'c-wag', kind: 'camera', at: [45, 9, 'G'], face: [-1, 1], net: 'orlov' },
    { id: 'a-orlov', kind: 'alarm', at: [33, 36, 'G'], face: [1, 0], net: 'orlov' },
  ],
  terminals: [{ id: 'sec', name: 'the ticket booth console', at: [25, 36, 'G'], face: [0, 1], time: 6, net: 'orlov' }],
  intel: [
    { id: 'letter', at: [28, 15, 'G'], kind: 'Letter', title: 'A letter on the bandstand', text: ['To the ringmaster, from a town further east: "The usual seats, the usual night. Bring the usual tickets."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'identify', refs: ['contact'], text: 'Mark the contact (the front row)' },
    { id: 'o2', kind: 'take', ref: 'route', text: 'Take the route book (the ringmaster\'s wagon)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
