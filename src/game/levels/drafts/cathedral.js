// FRONTLINE - Level 84, St Aldric's Tower (first draft, M6.106; the end of THE DROPS). Dr Sauer's star charts had it
// on their backs: the couriers' drops are run by one man, the "Sexton", from the bell tower of St Aldric's cathedral,
// where the last drop of every month is left in the bell chamber. Climb the tower, take the Sexton alive in the clock
// room, and take the month's drop from among the bells.
const W = 44, H = 34;
export default {
  id: 'cathedral', no: 84, title: 'St Aldric\'s Tower', place: 'the bell tower of St Aldric\'s cathedral, Varnholm',
  where: 'St Aldric\'s cathedral, Varnholm. 00:30, after the last service, the nave dark but for candles.',
  brief: [
    ['The job', 'Dr Sauer\'s star charts had it written on their backs. The couriers\' drops are run by one man, the <b>Sexton</b>, from the <b>bell tower</b> of St Aldric\'s. The last drop of every month is left in the <b>bell chamber</b>. Climb the tower. <b>Take the Sexton alive</b> in the clock room. Take the month\'s <b>drop</b> from among the bells. If you can, do it <b>without the alarm</b>.'],
    ['The place', 'The <b>nave</b>, the vestry to the south, and the <b>tower</b> at the west end. Inside the tower, one stair climbs a flight to each floor: the ringing chamber, the <b>clock room</b>, and the <b>bell chamber</b> at the top. You come in by the north door.'],
    ['Security', 'A camera on the nave, the alarm. The console and the radio are in the vestry, the engineer at the foot of the tower. There are men on every floor of the tower and a lookout among the bells. The verger and one late worshipper are still in the nave. They are not reds.'],
    ['Objectives', '<b>Take the Sexton alive</b> (the clock room). Take the <b>drop</b> (the bell chamber). If you can, <b>without the alarm</b>. Out by the north door.'],
  ],
  epilogue: {
    success: 'The Sexton comes down his own tower in the dark, and the month\'s drop names every courier still working in the city. By Sunday the cathedral\'s bells ring for an ordinary service, and that is all they ring for.',
    partial: 'The Sexton or the drop, not both. The couriers will need a new tower, and they will find one.',
  },
  time: { date: [30, 4, 2027], hour: 0, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.1, 0.1, 0.13, 25, 170], ambient: [0.22, 0.22, 0.27] },
  extractName: 'the north door', extract: { x: 18, y: 6, floor: 'G' },
  outside: { backdrop: 'city', mat: 'concrete2', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 6, wall: 'concrete2', wallTint: [0.75, 0.72, 0.66], floor: 'marble', ceil: 'wood', lampPower: 0.5, lampColour: [1, 0.85, 0.55], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 6, 10, 30, 22],                        // the nave
        ['room', 32, 13, 38, 19],                       // the tower's foot
        ['room', 6, 24, 14, 30],                        // the vestry
      ], after: [
        ['cells', [[18, 9], [31, 16], [10, 23]], 'D'],
        ['cells', [[10, 9], [26, 9], [10, 23], [26, 23], [5, 16]], 'W'],
        ['room', 10, 12, 10, 20, 'Y'], ['room', 14, 12, 14, 20, 'Y'], ['room', 18, 12, 18, 20, 'Y'], ['room', 22, 12, 22, 20, 'Y'],
        ['cells', [[28, 16]], 'M'], ['cells', [[27, 13], [27, 19]], 'K'],
        ['cells', [[37, 14]], 'C'], ['cells', [[37, 18]], 'M'],
        ['cells', [[8, 26], [12, 29]], 'T'], ['cells', [[13, 25]], 'H'],
        ['cells', [[4, 6], [34, 6], [40, 24], [20, 28], [30, 28]], 'C'],
      ] },
    },
    1: {
      y: 4, wallH: 3.6, wall: 'concrete2', wallTint: [0.75, 0.72, 0.66], floor: 'wood', ceil: 'wood', lampPower: 0.45, lampColour: [1, 0.85, 0.55], lampEvery: 5,
      carve: { size: [W, H], ops: [['room', 32, 13, 38, 19]], after: [
        ['cells', [[35, 12], [35, 20], [39, 16]], 'W'], ['cells', [[34, 19]], 'Y'],
      ] },
    },
    2: {
      y: 8, wallH: 3.6, wall: 'concrete2', wallTint: [0.75, 0.72, 0.66], floor: 'wood', ceil: 'wood', lampPower: 0.45, lampColour: [1, 0.85, 0.55], lampEvery: 5,
      carve: { size: [W, H], ops: [['room', 32, 13, 38, 19]], after: [
        ['cells', [[35, 12], [35, 20], [39, 16]], 'W'], ['cells', [[35, 13]], 'T'], ['cells', [[38, 16]], 'M'],
      ] },
    },
    3: {
      y: 12, wallH: 3.2, wall: 'wood', wallTint: [0.45, 0.38, 0.3], floor: 'wood', ceil: 'wood', lampPower: 0.35, lampColour: [1, 0.85, 0.55], lampEvery: 5,
      carve: { size: [W, H], ops: [['room', 32, 13, 38, 19]], after: [
        ['cells', [[34, 12], [36, 12], [34, 20], [36, 20], [31, 15], [31, 17], [39, 15], [39, 17]], 'W'], ['cells', [[35, 16]], 'M'], ['cells', [[37, 14]], 'T'],
      ] },
    },
  },
  stairs: [
    { x: 32, y: 18, dir: 'N', len: 5, w: 2, from: 'G', to: '1' },
    { x: 36, y: 14, dir: 'S', len: 5, w: 2, from: '1', to: '2' },
    { x: 32, y: 18, dir: 'N', len: 5, w: 2, from: '2', to: '3' },
  ],
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    box([31 * C, 15.2, 12 * C], [40 * C, 15.5, 21 * C], 'wood', { tint: [0.3, 0.24, 0.2] });
    box([mid(35) - 0.8, 13, mid(16) - 0.8], [mid(35) + 0.8, 14.6, mid(16) + 0.8], 'metal', { tint: [0.6, 0.5, 0.25], solid: false });
    for (const [x, y] of [[12, 16], [24, 16]]) level.lights.push({ pos: [mid(x), 1.2, mid(y)], range: 6, intensity: 0.6, color: [1, 0.75, 0.4] });
    for (const [x, y] of [[18, 7], [34, 8], [10, 32]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 12, intensity: 0.8, color: [1, 0.88, 0.7], street: true });
  },
  start: { x: 18, y: 4, floor: 'G', yaw: Math.PI },
  zones: [
    { id: 'nave', label: 'St Aldric\'s - the nave', at: [6, 10, 30, 22] },
    { id: 'vestry', label: 'St Aldric\'s - the vestry', at: [6, 24, 14, 30] },
    { id: 'foot', label: 'St Aldric\'s - the tower\'s foot', at: [32, 13, 38, 19] },
    { id: 'ring', label: 'St Aldric\'s - the ringing chamber', at: [32, 13, 38, 19], floor: '1' },
    { id: 'clock', label: 'St Aldric\'s - the clock room', at: [32, 13, 38, 19], floor: '2' },
    { id: 'bells', label: 'St Aldric\'s - the bell chamber', at: [32, 13, 38, 19], floor: '3' },
    { id: 'close', label: 'St Aldric\'s', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'sexton', at: [37, 14, '2'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The Sexton', tint: [0.2, 0.2, 0.22] },
    { id: 'cg', at: [33, 14, '2'], arms: 'smg', temper: 'steady' },
    { id: 'rg', at: [37, 15, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'look', at: [37, 18, '3'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'eng', at: [36, 18, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'n1', at: [20, 11, 'G'], route: [[8, 11], [28, 11]], arms: 'carbine' },
    { id: 'n2', at: [26, 21, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'rad', at: [10, 27, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'out1', at: [30, 6, 'G'], route: [[22, 6], [40, 6]], arms: 'carbine' },
  ],
  civilians: [
    { id: 'verger', at: [25, 14, 'G'], yaw: Math.PI / 2, title: 'The verger', tint: [0.9, 0.9, 0.95], says: ['They go up the tower every night as if they owned it. They say they are winding the clock. The clock was wound on Sunday.'] },
    { id: 'woman', at: [12, 18, 'G'], yaw: 0, title: 'An old woman, praying', tint: [0.85, 0.8, 0.85], says: ['I come every night. They leave me alone. I leave them alone. God sees all of it.'] },
  ],
  pickups: [{ id: 'drop', name: 'The month\'s drop', what: 'the drop', at: [37, 14, '3'], table: true, colour: [0.9, 0.85, 0.7] }],
  devices: [
    { id: 'c-nave', kind: 'camera', at: [6, 10, 'G'], face: [1, 1], net: 'aldric' },
    { id: 'a-aldric', kind: 'alarm', at: [31, 21, 'G'], face: [-1, 0], net: 'aldric' },
  ],
  terminals: [{ id: 'sec', name: 'the vestry console', at: [8, 26, 'G'], face: [0, 1], time: 6, net: 'aldric' }],
  intel: [
    { id: 'roster', at: [35, 13, '2'], kind: 'Roster', title: 'The Sexton\'s roster', text: ['Every courier in the city by a saint\'s name, and the night each one comes. Next to some of the saints, a cross.'] },
    { id: 'hymn', at: [12, 29, 'G'], kind: 'Hymn sheet', title: 'A hymn sheet in the vestry', text: ['The numbers of the hymns are not hymns. They are grid references.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'capture', ref: 'sexton', text: 'Take the Sexton alive (the clock room)' },
    { id: 'o2', kind: 'take', ref: 'drop', text: 'Take the drop (the bell chamber, the top of the tower)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
