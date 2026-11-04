// FRONTLINE - Level 94, the Bakery (first draft, M6.116; the start of THE PRESS). The saints' papers reached the north's
// last free press: the Hollen Courier, printed at night in the back of Arnesen's bakery. The reds know now. Their raid
// is in the bakery tonight, holding the editor among the presses while they wait for a lorry to take the presses
// away. Bring the editor out, and take the type formes of tomorrow's front page - without them nothing can be printed.
const W = 40, H = 30;
export default {
  id: 'bakery', no: 94, title: 'The Bakery', place: 'Arnesen\'s bakery, Hollen',
  where: 'Arnesen\'s bakery, Hollen. 04:10, the ovens lit, the reds\' van in the street.',
  brief: [
    ['The job', 'The saints\' papers reached the north\'s last free press: the <b>Hollen Courier</b>, printed at night in the back of <b>Arnesen\'s bakery</b>. The reds know now. Their raid is in the bakery tonight, holding the <b>editor</b> among the presses while they wait for a lorry to take the presses away. <b>Bring the editor out</b>. Take the <b>type formes</b> of tomorrow\'s front page. If you can, <b>without the alarm</b>.'],
    ['The place', 'The bakery\'s <b>shop</b> on the street, the <b>bakehouse</b> with its ovens behind it, and behind both the long <b>press room</b>, where the Courier is printed. There is an alley on the west side and a yard to the south. You come in from the east.'],
    ['Security', 'The raid brought no cameras, but its captain has a whistle and the street is full of his men. The baker is still at his ovens, because the reds want their bread.'],
    ['Objectives', '<b>Bring the editor out</b> (the press room). Take the <b>type formes</b> (the press room). If you can, <b>without the alarm</b>. Out the way you came, east.'],
  ],
  epilogue: {
    success: 'The reds\' lorry takes away three presses with nothing to print, and the editor sets tomorrow\'s front page again that night, in another cellar in another town. The Hollen Courier comes out a day late, with the saints on its front page.',
    partial: 'The editor is out, or the formes, not both. The Courier will be late, and thinner.',
  },
  time: { date: [15, 5, 2027], hour: 4, minute: 10 }, night: true, faction: 'red',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.18, 0.17, 0.2, 25, 150], ambient: [0.3, 0.28, 0.3] },
  extractName: 'the street, east', extract: { x: 38, y: 17, floor: 'G', van: [0, 6] },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.4, wall: 'paint', wallTint: [0.85, 0.78, 0.65], floor: 'tile', ceil: 'plaster', lampPower: 0.7, lampColour: [1, 0.85, 0.6], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 10, 6, 18, 12],                        // the shop
        ['room', 20, 6, 28, 12],                        // the bakehouse
        ['room', 10, 14, 28, 22],                       // the press room
      ], after: [
        ['cells', [[14, 5], [19, 9], [24, 13], [9, 18], [20, 23]], 'D'],
        ['cells', [[11, 5], [17, 5], [9, 9], [13, 23], [26, 23], [9, 15]], 'W'],
        ['room', 11, 7, 17, 7, 'T'], ['cells', [[16, 11]], 'H'],
        ['room', 26, 7, 27, 8, 'M'], ['cells', [[22, 11]], 'T'],
        // the presses, the type cases, the paper stacks
        ['cells', [[14, 17], [19, 17], [24, 19]], 'M'], ['room', 11, 15, 11, 17, 'H'], ['cells', [[26, 15]], 'T'], ['cells', [[16, 21], [27, 21]], 'C'],
        // the street, the alley, the yard
        ['cells', [[33, 3], [6, 3], [4, 24], [30, 27], [16, 27], [35, 22]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { level, mid, CELL: C } = kit;
    for (const [x, y] of [[14, 3], [30, 3], [5, 18], [24, 25], [36, 14]]) level.lights.push({ pos: [mid(x), 4.2, mid(y)], range: 10, intensity: 0.8, color: [1, 0.88, 0.7], street: true });
    level.signs.push({ pos: [mid(14), 3.0, 5 * C - 0.13], yaw: Math.PI, w: 4, h: 0.7, text: 'ARNESEN', sub: 'Bread - Cakes - Since 1902', col: '#5a3a1a' });
  },
  vehicles: [{ id: 'raidvan', kind: 'car', model: 'lightUtility', paint: 'grey', at: [35, 2], yaw: -Math.PI / 2, hp: 560 }],
  start: { x: 38, y: 16, floor: 'G', yaw: Math.PI / 2 },
  zones: [
    { id: 'shop', label: 'Arnesen\'s - the shop', at: [10, 6, 18, 12] },
    { id: 'bake', label: 'Arnesen\'s - the bakehouse', at: [20, 6, 28, 12] },
    { id: 'press', label: 'Arnesen\'s - the press room', at: [10, 14, 28, 22] },
    { id: 'hollen', label: 'Hollen', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'capt', at: [22, 20, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The raid\'s captain' },
    { id: 'pr1', at: [18, 15, 'G'], route: [[12, 15], [23, 15]], arms: 'smg' },
    { id: 'pr2', at: [13, 20, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'sh1', at: [13, 9, 'G'], arms: 'pistol' },
    { id: 'bk1', at: [22, 8, 'G'], arms: 'carbine', temper: 'cowardly' },
    { id: 'st1', at: [20, 3, 'G'], route: [[4, 3], [30, 3]], arms: 'carbine' },
    { id: 'al1', at: [6, 18, 'G'], route: [[6, 12], [6, 26]], arms: 'carbine' },
    { id: 'yd1', at: [16, 26, 'G'], route: [[8, 26], [28, 26]], arms: 'pistol', dog: true },
  ],
  civilians: [
    { id: 'baker', at: [25, 10, 'G'], yaw: 0, title: 'Mr Arnesen, the baker', tint: [1.2, 1.15, 1.1], says: ['Forty years I have baked bread here, and twelve of them I have printed a newspaper. The reds want their rolls at six. They will have them.'] },
  ],
  hostages: [{ id: 'editor', name: 'The editor', she: true, at: [12, 21, 'G'] }],
  pickups: [{ id: 'formes', name: 'The type formes', what: 'the formes', at: [26, 15, 'G'], table: true, colour: [0.4, 0.4, 0.45] }],
  intel: [
    { id: 'proof', at: [22, 11, 'G'], kind: 'Proof', title: 'A proof of tomorrow\'s front page', text: ['"THE SAINTS": every name, and what was done to them, and by whom. Under it, in the editor\'s hand: "Print it all."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'rescue', ref: 'editor', text: 'Bring the editor out (the press room)' },
    { id: 'o2', kind: 'take', ref: 'formes', text: 'Take the type formes (the press room)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
