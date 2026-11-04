// FRONTLINE - Level 77, the Cliff Cottage (first draft, M6.98; the end of HOLLIS). The face on the beach was one Ghost
// knew: Hollis is one of Ghost's own, a clerk in Yard 7's armoury, and the letter in his cottage says he told the reds
// when Yard 7 moves its armoury. He goes back to the cottage tonight to send them the date. Take him alive before he
// does - with Hale and Moss, quietly - and take his radio's code book from the attic.
const W = 44, H = 34;
export default {
  id: 'cottage', no: 77, title: 'The Cliff Cottage', place: 'Hollis\'s cottage, on the Kessin cliffs',
  where: 'Hollis\'s cottage, the Kessin cliffs. 23:50, wind off the sea, a light on in the attic.',
  brief: [
    ['The job', 'The face on the beach was one Ghost knew. <b>Hollis</b> is one of Ghost\'s own, a clerk in Yard 7\'s armoury. He is going to send the reds the date Yard 7 moves its armoury, on the radio in his <b>attic</b>, at midnight. <b>Take him alive</b> before he does. Take his radio\'s <b>code book</b> as well. If you can, do it <b>without the alarm</b>: his reds have one. Hale and Moss are with you.'],
    ['The place', 'The cottage on the cliff top: the <b>kitchen</b> and the <b>parlour</b> downstairs, the bedroom upstairs, and a ladder-stair up to the <b>attic</b> where the radio is. A shed and a garden wall. The lane runs behind it, and you come up the lane.'],
    ['Security', 'Three of the reds\' men keep Hollis company, plus a camera on the lane and an alarm in the shed. The radio and the console are in the shed, the engineer in the kitchen.'],
    ['Objectives', '<b>Take Hollis alive</b> (the attic). Take the <b>code book</b> (the attic). If you can, <b>without the alarm</b>. Out down the lane.'],
  ],
  epilogue: {
    success: 'Hollis comes back to Yard 7 in the back of a Ghost van, and nobody there says a word to him on the way down to the cells. The armoury moves on the 12th, as planned, and the reds are waiting at the wrong place.',
    partial: 'Hollis is taken, or his code book is, but not cleanly. Whatever he sent before you got to him, Ghost will have to assume they heard it.',
  },
  time: { date: [10, 4, 2027], hour: 23, minute: 50 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'wind',
  relations: { red: { you: true, ghost: true }, ghost: { you: false, red: true } },
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.1, 0.11, 0.15, 25, 170], ambient: [0.22, 0.23, 0.29] },
  extractName: 'the lane', extract: { x: 40, y: 32, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'brick', wallTint: [0.75, 0.72, 0.66], floor: 'wood', ceil: 'wood', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 14, 10, 20, 18],                       // the kitchen
        ['room', 22, 10, 30, 18],                       // the parlour
        ['room', 34, 22, 39, 26],                       // the shed
      ], after: [
        ['cells', [[21, 14], [17, 19], [27, 19], [33, 24]], 'D'],
        ['cells', [[13, 13], [17, 9], [25, 9], [31, 14], [36, 21]], 'W'],
        ['room', 15, 11, 15, 15, 'K'], ['cells', [[18, 16]], 'T'],
        ['cells', [[24, 12], [28, 16]], 'T'], ['cells', [[29, 11]], 'H'],
        ['cells', [[36, 23], [38, 25]], 'T'],
        // the garden wall's stones, the lane's hedge
        ['cells', [[10, 22], [16, 26], [24, 28], [30, 22], [8, 12], [40, 14], [34, 6]], 'C'],
      ] },
    },
    1: {
      y: 3.4, wallH: 2.8, wall: 'brick', wallTint: [0.75, 0.72, 0.66], floor: 'wood', ceil: 'wood', lampPower: 0.5, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      carve: { size: [W, H], ops: [['room', 14, 10, 30, 18]], after: [
        ['cells', [[17, 9], [25, 9], [13, 14], [31, 14]], 'W'], ['cells', [[16, 11], [16, 16]], 'Y'], ['cells', [[28, 12]], 'H'],
      ] },
    },
    2: {
      y: 6.6, wallH: 2.4, wall: 'wood', wallTint: [0.5, 0.42, 0.34], floor: 'wood', ceil: 'wood', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      carve: { size: [W, H], ops: [['room', 18, 11, 26, 17]], after: [
        ['cells', [[22, 10], [22, 18]], 'W'], ['cells', [[24, 12], [20, 16]], 'T'], ['cells', [[25, 15]], 'M'],
      ] },
    },
  },
  stairs: [
    { x: 23, y: 17, dir: 'N', len: 4, w: 2, from: 'G', to: '1' },
    { x: 19, y: 12, dir: 'S', len: 4, w: 2, from: '1', to: '2' },
  ],
  extra(kit) {
    const { level, mid } = kit;
    level.lights.push({ pos: [mid(22), 8, mid(14)], range: 10, intensity: 0.8, color: [1, 0.85, 0.6] });
    for (const [x, y] of [[40, 28], [36, 20]]) level.lights.push({ pos: [mid(x), 4, mid(y)], range: 10, intensity: 0.7, color: [1, 0.85, 0.6], street: true });
  },
  start: { x: 41, y: 33, floor: 'G', yaw: 0 },
  zones: [
    { id: 'kitchen', label: 'The Cliff Cottage - the kitchen', at: [14, 10, 20, 18] },
    { id: 'parlour', label: 'The Cliff Cottage - the parlour', at: [22, 10, 30, 18] },
    { id: 'bed', label: 'The Cliff Cottage - upstairs', at: [14, 10, 30, 18], floor: '1' },
    { id: 'attic', label: 'The Cliff Cottage - the attic', at: [18, 11, 26, 17], floor: '2' },
    { id: 'shed', label: 'The Cliff Cottage - the shed', at: [34, 22, 39, 26] },
    { id: 'garden', label: 'The Cliff Cottage', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'hale', at: [40, 33, 'G'], faction: 'ghost', ally: true, name: 'Hale', arms: 'carbine', temper: 'steady', tint: [0.45, 0.6, 1.35] },
    { id: 'moss', at: [42, 33, 'G'], faction: 'ghost', ally: true, name: 'Moss', arms: 'smg', temper: 'bold', tint: [0.4, 0.55, 1.3] },
    { id: 'hollis', at: [22, 14, '2'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Hollis', tint: [0.45, 0.6, 1.0] },
    { id: 'eng', at: [17, 13, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'pr', at: [26, 14, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'up', at: [27, 15, '1'], arms: 'smg', temper: 'steady' },
    { id: 'rad', at: [37, 24, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'gd', at: [16, 24, 'G'], route: [[8, 24], [22, 24]], arms: 'carbine', dog: true },
  ],
  pickups: [{ id: 'codes', name: 'Hollis\'s code book', what: 'the code book', at: [24, 12, '2'], table: true, colour: [0.3, 0.35, 0.3] }],
  devices: [
    { id: 'c-lane', kind: 'camera', at: [33, 21, 'G'], face: [-1, -1], net: 'hollis' },
    { id: 'a-shed', kind: 'alarm', at: [33, 26, 'G'], face: [-1, 0], net: 'hollis' },
  ],
  terminals: [{ id: 'sec', name: 'the shed console', at: [38, 25, 'G'], face: [-1, 0], time: 6, net: 'hollis' }],
  intel: [
    { id: 'pass', at: [18, 16, 'G'], kind: 'Pass', title: 'A Yard 7 pass, on the kitchen table', text: ['"J. Hollis. Armoury clerk." The photograph is a younger man, smiling.'] },
    { id: 'draft', at: [20, 16, '2'], kind: 'Draft', title: 'A message, written out to send', text: ['ARMOURY MOVES 12TH. ROAD NOT RAIL. ESCORT SIX.', 'Underneath, crossed out: "This is the last one."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'capture', ref: 'hollis', text: 'Take Hollis alive (the attic)' },
    { id: 'o2', kind: 'take', ref: 'codes', text: 'Take the code book (the attic)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
