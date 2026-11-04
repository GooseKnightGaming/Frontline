// FRONTLINE - Level 87, the Studio (first draft, M6.109; the end of THE SAINTS). Every photograph in the identifier's
// album has the same stamp on its back: Halvard's Photographic Studio, Kiln Street, Varnholm. The studio is a front for
// the reds' counter-intelligence, and its upstairs holds the files behind the crosses. At dawn Major Kade, who ordered
// the crosses, drives the negatives north. Take the saints' files from upstairs, and stop Kade's car before it is out
// of the yard.
const W = 48, H = 34;
export default {
  id: 'studio', no: 87, title: 'The Studio', place: 'Halvard\'s Photographic Studio, Kiln Street, Varnholm',
  where: 'Halvard\'s Photographic Studio, Kiln Street, Varnholm. 05:20, the street still dark, a car warming up in the yard.',
  brief: [
    ['The job', 'Every photograph in the identifier\'s album has the same stamp on its back: <b>Halvard\'s Photographic Studio</b>, Kiln Street. The studio is a front for the reds\' counter-intelligence. Its upstairs holds the <b>files</b> behind the crosses. At dawn <b>Major Kade</b>, who ordered the crosses, drives the negatives north. Take the <b>saints\' files</b> from upstairs. <b>Stop Kade\'s car</b> before it is out of the yard. If you can, <b>without the alarm</b>.'],
    ['The place', 'The studio fronts Kiln Street on the north side: the shop, and the back room behind it, where a stair goes up. Upstairs are the <b>darkroom</b> and the <b>files</b>. The <b>yard</b> is behind the studio, with Kade\'s car in it, and it opens east onto the road. You come in from the alley, west.'],
    ['Security', 'A camera on the yard, and the alarm. The console and the radio are in the back room, the engineer at the yard\'s generator. Kade leaves in about <b>four minutes</b>, or the moment the alarm goes.'],
    ['Objectives', 'Take the <b>saints\' files</b> (upstairs). <b>Stop Kade\'s car</b> before it is out of the yard, east. If you can, <b>without the alarm</b>. Out by the alley, west.'],
  ],
  epilogue: {
    success: 'Kade\'s car never leaves Kiln Street, and the files behind the crosses go to Ghost instead of the north. Every saint with a cross is warned by Sunday. Mr Halvard opens his shop on Monday and takes photographs of weddings.',
    partial: 'The files or the negatives, not both. Some of the saints will have to be moved, and quickly.',
  },
  time: { date: [6, 5, 2027], hour: 5, minute: 20 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.2, 0.21, 0.25, 25, 160], ambient: [0.3, 0.3, 0.35] },
  extractName: 'the alley, west', extract: { x: 1, y: 24, floor: 'G', van: [1, 5] },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'paint', wallTint: [0.7, 0.66, 0.58], floor: 'wood', ceil: 'plaster', lampPower: 0.6, lampColour: [1, 0.88, 0.7], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 10, 6, 18, 14],                        // the shop
        ['room', 20, 6, 26, 14],                        // the back room
      ], after: [
        ['cells', [[14, 5], [19, 10], [23, 15]], 'D'],
        ['cells', [[11, 5], [17, 5], [9, 10], [27, 10], [13, 15]], 'W'],
        ['cells', [[12, 7], [16, 13]], 'T'], ['cells', [[11, 12]], 'H'],
        ['cells', [[21, 8]], 'T'], ['cells', [[21, 13]], 'M'],
        // the yard: the generator, crates and a handcart; the street's benches
        ['cells', [[30, 20]], 'M'], ['cells', [[10, 27], [36, 28], [24, 30], [40, 17], [6, 18]], 'C'],
        ['cells', [[30, 2], [40, 3]], 'C'],
      ] },
    },
    1: {
      y: 3.8, wallH: 3.2, wall: 'plaster', wallTint: [0.8, 0.76, 0.7], floor: 'wood', ceil: 'plaster', lampPower: 0.45, lampColour: [0.9, 0.3, 0.25], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 10, 6, 16, 14],                        // the darkroom
        ['room', 18, 6, 26, 14],                        // the files
      ], after: [
        ['cells', [[17, 10]], 'D'],
        ['cells', [[19, 5], [23, 5], [27, 11], [20, 15]], 'W'],
        ['room', 11, 7, 15, 7, 'T'], ['cells', [[12, 12]], 'T'],
        ['room', 19, 13, 23, 13, 'H'], ['cells', [[21, 9]], 'T'],
      ] },
    },
  },
  stairs: [{ x: 25, y: 12, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { level, mid, CELL: C } = kit;
    for (const [x, y] of [[14, 3], [30, 3], [22, 18], [38, 22], [4, 24]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 11, intensity: 0.8, color: [1, 0.88, 0.7], street: true });
    level.signs.push({ pos: [mid(14), 3.0, 5 * C - 0.13], yaw: Math.PI, w: 4, h: 0.7, text: 'HALVARD', sub: 'Photographic Studio - Portraits - Weddings', col: '#3a2a1a' });
  },
  vehicles: [
    { id: 'kadecar', kind: 'car', model: 'lightUtility', paint: 'black', at: [18, 24], yaw: -Math.PI / 2, path: [[18, 24], [30, 24], [44, 24], [W + 2, 24], [W + 8, 24]],
      speed: 9, goal: 'escape', wait: 240, hp: 560, name: 'Major Kade\'s car',
      crew: [{ id: 'drv', at: [-0.42, 0.15] }, { id: 'kade', at: [0.42, 0.15] }] },
  ],
  start: { x: 2, y: 23, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'shop', label: 'The Studio - the shop', at: [10, 6, 18, 14] },
    { id: 'back', label: 'The Studio - the back room', at: [20, 6, 26, 14] },
    { id: 'dark', label: 'The Studio - the darkroom', at: [10, 6, 16, 14], floor: '1' },
    { id: 'files', label: 'The Studio - the files', at: [18, 6, 26, 14], floor: '1' },
    { id: 'yard', label: 'The Studio - the yard', at: [8, 16, 46, 32] },
    { id: 'kiln', label: 'Kiln Street', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'shop1', at: [15, 10, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'back1', at: [23, 11, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'rad', at: [22, 9, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'dev', at: [13, 10, '1'], arms: 'pistol', rank: 'specialist', temper: 'cowardly', name: 'The developer' },
    { id: 'fl1', at: [21, 11, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'eng', at: [31, 21, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'yd1', at: [26, 18, 'G'], route: [[12, 18], [40, 18]], arms: 'carbine' },
    { id: 'st1', at: [24, 2, 'G'], route: [[8, 2], [44, 2]], arms: 'carbine' },
  ],
  civilians: [
    { id: 'halvard', at: [12, 9, 'G'], yaw: Math.PI / 2, title: 'Mr Halvard, the photographer', tint: [0.9, 0.85, 0.8], says: ['They pay the rent and use the darkroom. I take the weddings and do not go upstairs. I have not been upstairs since the winter.'] },
  ],
  pickups: [{ id: 'files', name: 'The saints\' files', what: 'the files', at: [21, 9, '1'], table: true, colour: [0.85, 0.8, 0.65] }],
  devices: [
    { id: 'c-yard', kind: 'camera', at: [27, 15, 'G'], face: [1, 1], net: 'kiln' },
    { id: 'a-kiln', kind: 'alarm', at: [19, 15, 'G'], face: [0, 1], net: 'kiln' },
  ],
  terminals: [{ id: 'sec', name: 'the back room console', at: [21, 8, 'G'], face: [0, 1], time: 6, net: 'kiln' }],
  intel: [
    { id: 'neg', at: [12, 12, '1'], kind: 'Negatives', title: 'A strip of negatives drying', text: ['Faces, one after another, taken from across a street. On the clip, in pencil: "for the Major - crosses confirmed".'] },
    { id: 'order', at: [16, 13, 'G'], kind: 'Order', title: 'An order under the shop counter', text: ['The negatives to go north with Major Kade at dawn. The prints to be burned. The files to follow by rail.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'files', text: 'Take the saints\' files (upstairs)' },
    { id: 'o2', kind: 'stop', ref: 'kadecar', text: 'Stop Major Kade\'s car before it is out of the yard' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
