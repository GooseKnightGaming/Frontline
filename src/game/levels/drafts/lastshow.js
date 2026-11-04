// FRONTLINE - Level 127, the Last Performance (first draft, M6.149; the end of THE CIRCUS). Lena Pask told Ghost
// everything, and the Circus Orlov is playing its last night of the season on the Lessar common again before it goes
// east. Ghost will be in the audience. Take the ringmaster alive in the middle of his own finale, and his ledger from
// his wagon: the list of every message the circus ever carried, and for whom.
const W = 56, H = 42;
export default {
  id: 'lastshow', no: 127, title: 'The Last Performance', place: 'the Circus Orlov, on the Lessar common',
  where: 'The Circus Orlov, on the Lessar common. 21:20, the last night of the season, the finale beginning.',
  brief: [
    ['The job', 'Lena Pask told Ghost everything, and the <b>Circus Orlov</b> is playing its <b>last night</b> of the season on the Lessar common before it goes east. Ghost will be in the audience. <b>Take the ringmaster alive</b> in the middle of his own finale. Take his <b>ledger</b> from his wagon: every message the circus ever carried, and for whom.'],
    ['The place', 'The common as before: the <b>big top</b> with the ringmaster in the ring, the <b>wagons</b> behind it, north, with <b>his</b> at the east end, the menagerie west and the ticket booth south. You come in with the crowd, <b>dressed as one of the circus hands</b>.'],
    ['Security', 'The circus knows something is wrong since the winter quarters went quiet. It has doubled its men and put two of them in the ring with the ringmaster. The camera, the alarm and the radio are where they were.'],
    ['Objectives', '<b>Take the ringmaster alive</b> (the ring). Take his <b>ledger</b> (his wagon). If you can, <b>without the alarm</b>. Out with the crowd, south.'],
  ],
  epilogue: {
    success: 'The ringmaster leaves his own ring in the middle of the finale, and the band plays on, because nobody has told it to stop. The ledger is the circus\'s whole history, and every name in it is now on a list of Ghost\'s. The Circus Orlov goes east without him, and carries nothing but clowns.',
    partial: 'The ringmaster or his ledger, not both. The circus goes east, and some of what it carries goes with it.',
  },
  time: { date: [20, 9, 2027], hour: 21, minute: 20 }, night: true, faction: 'red', requires: 'HACKKIT', startDisguise: 'red',
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
        ['room', 24, 19, 32, 19, 'K'], ['room', 24, 25, 32, 25, 'K'], ['room', 24, 20, 24, 24, 'K'], ['room', 32, 20, 32, 24, 'K'],
        ['room', 18, 16, 22, 16, 'Y'], ['room', 34, 16, 38, 16, 'Y'], ['room', 18, 28, 22, 28, 'Y'], ['room', 34, 28, 38, 28, 'Y'],
        ['room', 17, 18, 17, 26, 'Y'], ['room', 39, 18, 39, 26, 'Y'], ['cells', [[28, 15]], 'T'],
        ['cells', [[11, 5], [20, 5], [29, 5]], 'Y'], ['cells', [[42, 5]], 'T'], ['cells', [[38, 7]], 'H'],
        ['room', 4, 18, 4, 24, 'K'], ['room', 8, 18, 8, 24, 'K'],
        ['cells', [[25, 36]], 'T'], ['cells', [[31, 37]], 'Y'],
        // the generator lorry, the guy-ropes' pegs, the crowd's benches
        ['cells', [[48, 12]], 'M'], ['cells', [[46, 30], [12, 32], [44, 37], [6, 34], [50, 22], [14, 12]], 'C'],
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
    { id: 'ring', at: [28, 22, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The ringmaster', tint: [0.8, 0.1, 0.1] },
    { id: 'rg1', at: [26, 21, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'rg2', at: [30, 23, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'ch1', at: [20, 22, 'G'], arms: 'pistol' },
    { id: 'ch2', at: [36, 22, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'ch3', at: [28, 27, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'wg1', at: [34, 10, 'G'], route: [[12, 10], [46, 10]], arms: 'carbine' },
    { id: 'wg2', at: [41, 6, 'G'], arms: 'carbine', temper: 'steady' },
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
  pickups: [{ id: 'ledger', name: 'The ringmaster\'s ledger', what: 'the ledger', at: [42, 5, 'G'], table: true, colour: [0.6, 0.15, 0.15] }],
  devices: [
    { id: 'c-wag', kind: 'camera', at: [45, 9, 'G'], face: [-1, 1], net: 'orlov' },
    { id: 'a-orlov', kind: 'alarm', at: [33, 36, 'G'], face: [1, 0], net: 'orlov' },
  ],
  terminals: [{ id: 'sec', name: 'the ticket booth console', at: [25, 36, 'G'], face: [0, 1], time: 6, net: 'orlov' }],
  intel: [
    { id: 'letter', at: [28, 15, 'G'], kind: 'Programme', title: 'Tonight\'s programme on the bandstand', text: ['"The Grand Finale: the Ringmaster Presents". Somebody has written beside it: "for the last time".'] },
  ],
  objectives: [
    { id: 'o1', kind: 'capture', ref: 'ring', text: 'Take the ringmaster alive (the ring)' },
    { id: 'o2', kind: 'take', ref: 'ledger', text: 'Take the ledger (the ringmaster\'s wagon)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
