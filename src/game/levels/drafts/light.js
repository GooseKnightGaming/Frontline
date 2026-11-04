// FRONTLINE - Level 71, the Skarra Light (first draft, M6.91; a tower of four floors). The reds' supply ships still
// come into Kessin at night, guided past the Skarra rocks by the old lighthouse, which the reds took over and keep
// lit for them. One is due tonight. Climb the tower, put the light out so that she turns back, and take the signals
// book from the watch room. The real keeper is shut in his cottage.
const W = 40, H = 36;
export default {
  id: 'light', no: 71, title: 'The Skarra Light', place: 'the Skarra lighthouse, off Kessin',
  where: 'The Skarra lighthouse. 23:30, a heavy sea, a supply ship\'s lights on the horizon.',
  brief: [
    ['The job', 'The reds\' supply ships still come into Kessin at night, guided past the Skarra rocks by the old <b>lighthouse</b>, which the reds have taken over. One is due tonight. Climb the tower and <b>put the light out</b> in the lamp room at the top, so she turns back. Take the <b>signals book</b> from the watch room below it. If you can, bring out the <b>keeper</b>. They have shut him in his cottage.'],
    ['The place', 'The tower has four floors: the store at the bottom, the keeper\'s room, the <b>watch room</b>, and the <b>lamp room</b> at the top. One stair climbs inside it, a flight to each floor. The <b>keeper\'s cottage</b> is to the west, the <b>boathouse</b> to the south-east, and you come in from the boathouse slip.'],
    ['Security', 'Cameras on the tower and the boathouse, the alarm. The radio and the console are in the boathouse, the engineer in the tower\'s store. Men on every floor of the tower, and a dog on the rocks.'],
    ['Objectives', '<b>Put out the light</b> (the lamp room, the top). Take the <b>signals book</b> (the watch room). If you can, bring out the <b>keeper</b> (the cottage). Out by the boathouse slip.'],
  ],
  epilogue: {
    success: 'The Skarra light goes dark at 23:41. The supply ship\'s captain will not risk the rocks blind, and she turns for home. The signals book tells Ghost when the next three were due. None of them come.',
    partial: 'The light went out late, or the book stayed in the watch room. The ship got in, or the next one will.',
  },
  time: { date: [28, 2, 2027], hour: 23, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'wind',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.12, 0.14, 0.18, 25, 180], ambient: [0.24, 0.26, 0.32] },
  extractName: 'the boathouse slip', extract: { x: 37, y: 33, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'concrete2', margin: 12 },
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'concrete2', wallTint: [0.85, 0.85, 0.82], floor: 'concrete', ceil: 'concrete2', lampPower: 0.6, lampColour: [1, 0.88, 0.65], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 16, 10, 22, 16],                       // the tower's store
        ['room', 4, 22, 12, 28],                        // the keeper's cottage
        ['room', 26, 24, 34, 30],                       // the boathouse
      ], after: [
        ['cells', [[19, 17], [13, 25], [30, 23]], 'D'],
        ['cells', [[15, 13], [23, 13], [8, 21], [8, 29], [26, 27]], 'W'],
        ['cells', [[21, 11]], 'C'], ['cells', [[21, 15]], 'M'],
        ['cells', [[6, 24], [10, 27]], 'T'], ['cells', [[6, 27]], 'Y'],
        ['cells', [[28, 26], [32, 28]], 'T'], ['cells', [[33, 25]], 'M'],
        // the rocks round the tower
        ['cells', [[10, 6], [28, 6], [6, 16], [32, 16], [14, 32], [24, 33], [18, 22], [36, 20]], 'C'],
      ] },
    },
    1: {
      y: 4, wallH: 3.6, wall: 'concrete2', wallTint: [0.85, 0.85, 0.82], floor: 'wood', ceil: 'wood', lampPower: 0.5, lampColour: [1, 0.88, 0.65], lampEvery: 5,
      carve: { size: [W, H], ops: [['room', 16, 10, 22, 16]], after: [
        ['cells', [[15, 13], [23, 13], [19, 9], [19, 17]], 'W'], ['cells', [[18, 16]], 'Y'],
      ] },
    },
    2: {
      y: 8, wallH: 3.6, wall: 'concrete2', wallTint: [0.85, 0.85, 0.82], floor: 'wood', ceil: 'wood', lampPower: 0.5, lampColour: [1, 0.88, 0.65], lampEvery: 5,
      carve: { size: [W, H], ops: [['room', 16, 10, 22, 16]], after: [
        ['cells', [[15, 13], [23, 13], [19, 9], [19, 17]], 'W'], ['cells', [[19, 10]], 'T'],
      ] },
    },
    3: {
      y: 12, wallH: 3, wall: 'metal', wallTint: [0.3, 0.32, 0.35], floor: 'metal', ceil: 'metal', lampPower: 0.4, lampColour: [1, 0.95, 0.8], lampEvery: 5,
      carve: { size: [W, H], ops: [['room', 16, 10, 22, 16]], after: [
        ['cells', [[15, 12], [15, 14], [23, 12], [23, 14], [18, 9], [20, 9], [18, 17], [20, 17]], 'W'], ['cells', [[19, 13]], 'M'],
      ] },
    },
  },
  stairs: [
    { x: 16, y: 15, dir: 'N', len: 5, w: 2, from: 'G', to: '1' },
    { x: 20, y: 11, dir: 'S', len: 5, w: 2, from: '1', to: '2' },
    { x: 16, y: 15, dir: 'N', len: 5, w: 2, from: '2', to: '3' },
  ],
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the tower rises above the store; the great lamp at the top, lit
    box([15 * C, 15, 9 * C], [24 * C, 15.4, 18 * C], 'metal', { tint: [0.25, 0.27, 0.3] });
    level.lights.push({ pos: [mid(19), 13.5, mid(13)], range: 30, intensity: 2.2, color: [1, 0.95, 0.75] });
    for (const [x, y] of [[19, 19], [30, 32], [8, 30], [36, 30]]) level.lights.push({ pos: [mid(x), 4, mid(y)], range: 11, intensity: 0.8, color: [1, 0.88, 0.65], street: true });
  },
  start: { x: 37, y: 33, floor: 'G', yaw: Math.PI / 2 },
  zones: [
    { id: 'store', label: 'The Skarra Light - the store', at: [16, 10, 22, 16] },
    { id: 'room', label: 'The Skarra Light - the keeper\'s room', at: [16, 10, 22, 16], floor: '1' },
    { id: 'watch', label: 'The Skarra Light - the watch room', at: [16, 10, 22, 16], floor: '2' },
    { id: 'lamp', label: 'The Skarra Light - the lamp room', at: [16, 10, 22, 16], floor: '3' },
    { id: 'cottage', label: 'The Skarra Light - the keeper\'s cottage', at: [4, 22, 12, 28] },
    { id: 'boat', label: 'The Skarra Light - the boathouse', at: [26, 24, 34, 30] },
    { id: 'rock', label: 'The Skarra Light', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'eng', at: [21, 13, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 't1', at: [21, 12, '1'], arms: 'carbine', temper: 'steady' },
    { id: 't2', at: [17, 11, '2'], arms: 'smg', temper: 'steady' },
    { id: 't3', at: [21, 15, '3'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The lamp officer' },
    { id: 'rad', at: [27, 25, 'G'], yaw: Math.PI / 2, arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'bh', at: [32, 25, 'G'], yaw: 0, arms: 'carbine', temper: 'bold' },
    { id: 'p1', at: [19, 20, 'G'], route: [[6, 20], [34, 20]], arms: 'carbine', dog: true },
    { id: 'p2', at: [8, 12, 'G'], route: [[8, 4], [8, 18]], arms: 'carbine' },
    { id: 'p3', at: [30, 10, 'G'], route: [[30, 4], [30, 18]], arms: 'smg' },
    { id: 'ct', at: [11, 23, 'G'], arms: 'pistol', temper: 'cowardly' },
  ],
  hostages: [{ id: 'keeper', name: 'The keeper', at: [9, 25, 'G'] }],
  pickups: [{ id: 'book', name: 'The signals book', what: 'the signals book', at: [19, 10, '2'], table: true, colour: [0.3, 0.3, 0.45] }],
  devices: [
    { id: 'c-tower', kind: 'camera', at: [23, 17, 'G'], face: [-1, 1], net: 'skarra' },
    { id: 'c-boat', kind: 'camera', at: [25, 23, 'G'], face: [-1, -1], net: 'skarra' },
    { id: 'a-skarra', kind: 'alarm', at: [25, 31, 'G'], face: [-1, 0], net: 'skarra' },
  ],
  terminals: [
    { id: 'sec', name: 'the boathouse console', at: [28, 26, 'G'], face: [0, 1], time: 6, net: 'skarra' },
    { id: 'lamp', name: 'the lamp\'s controls', at: [21, 13, '3'], face: [-1, 0], time: 8, verb: 'Put out', doing: 'Putting out',
      said: 'The great lamp dies, and the Skarra rocks are dark. Out on the sea, the supply ship\'s lights slow, stop and swing away.' },
  ],
  intel: [
    { id: 'logbook', at: [10, 27, 'G'], kind: 'Log', title: 'The keeper\'s own log', text: ['Forty years of weather, ships and lamp hours in one hand. The last entry is a week old: "Visitors. They say they will keep the light for me."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'lamp', text: 'Put out the light (the lamp room, the top of the tower)' },
    { id: 'o2', kind: 'take', ref: 'book', text: 'Take the signals book (the watch room)' },
    { id: 'o3', kind: 'rescue', ref: 'keeper', text: 'Bring out the keeper (the cottage)', optional: true },
  ],
};
