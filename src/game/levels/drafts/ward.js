// FRONTLINE - Level 13, the drugged level (first draft; M6.19.6, Rhys: "The Ward is trippy -
// that's good. But it needs to be much better - I need MORE non-Euclidean Geometry!"). Rhys (after
// M6.17.8): "you have been drugged or poisoned, and the place stops adding up - a corridor longer inside
// than out, a door that opens back into the room you left..." Not the game's real world (Rhys): no
// Control, no Ghost - only what you had on you.
//
// What does not add up, in the order you are likely to meet it:
//   the corridor - step past either end and you are thirty squares back along it (till the antidote);
//   the cupboard - a hall inside, far bigger than the building could hold; its far door lets you out
//     in the ward where you woke;
//   the door that stands on its own in the hall - walk through it (southwards) and you are in the
//     corridor, at its west end, facing along it;
//   the turning room - four doors; out of three of them you come straight back in, through another
//     door, the room turned under you (the west door: once - then it lets you go);
//   the stairs that only go up - climb them and you are at their foot again; three times, then the
//     landing at the top is real - and the antidote is in the room off it;
//   the garden, out of the far end of the corridor - there once the antidote is in you.
const W = 100, H = 60, FY = 3.2;
const wards = [];
for (let k = 0; k <= 8; k++) wards.push(['room', 6 * k + 1, 4, 6 * k + 5, 10]);
const doors = []; for (let k = 0; k <= 8; k++) doors.push([6 * k + 3, 11]);
const beds = [], cabinets = [], chairs = [];
for (let k = 0; k <= 8; k++) { beds.push([6 * k + 2, 6]); cabinets.push([6 * k + 5, 5]); chairs.push([6 * k + 4, 9]); }
const windows = []; for (let x = 2; x <= 57; x += 3) windows.push([x, 14]);
// the turning room (interior 37..41 x 18..22), its four doors and the squares just beyond them
const TR = { N: [39, 17], E: [42, 20], S: [39, 23], W: [36, 20] };
export default {
  id: 'ward', no: 13, title: 'The Ward', place: 'the Ward', windows: false,
  where: 'Somewhere. A hospital, maybe. You do not remember coming here - and your head is not right.',
  brief: [
    ['What you know', 'Someone has put something in you. You woke in a ward, in a gown, a pistol still in your hand. The corridor outside goes on further than it should. The rooms are all the same room. Doors do not always go where doors go.'],
    ['Who is here', 'Orderlies - eight of them. They are not orderlies. Do not let them catch you.'],
    ['Objective', 'Find the <b>antidote</b>. It is up the stairs - if you can get to the top of them. Whatever is in you will not let you leave until you have it. Then find the <b>way out</b>.'],
    ['Not the real world', 'No Control on the radio, no Ghost. This is not a mission: it is a bad night.'],
  ],
  time: { date: [20, 8, 2026], hour: 3, minute: 33 }, night: true, faction: 'red', offDuty: true,
  startLoadout: { primary: null, backup: 'PX9', utility1: null, utility2: null, gear: null },
  drugged: { until: 'antidote' },
  extractName: 'the way out', vehicle: false,
  outside: { mat: 'lawn', margin: 12, fenceMat: 'hedge' },
  floors: {
    G: {
      y: 0, wallH: 3.0, wall: 'plaster', wallTint: [0.85, 0.92, 0.88], floor: 'wctile', floorTint: [0.85, 0.9, 0.88], ceil: 'plaster', lampPower: 0.6, lampColour: [0.85, 1, 0.9], lampEvery: 9, noRoof: [[52, 15, 58, 21]],
      carve: { size: [W, H], ops: wards.concat([
        ['room', 2, 12, 58, 13],                       // the corridor
        ['room', 29, 15, 31, 16],                      // the cupboard
        ['room', 61, 2, 69, 38],                       // the room that does not fit
        ['room', 52, 15, 58, 21, 'g'],                 // the garden, out of the far end
        // the turning room, the passage down to it from the corridor, the squares beyond its other doors
        ['room', 37, 18, 41, 22], ['room', 39, 15, 39, 16], ['cell', 43, 20, '.'], ['cell', 39, 24, '.'],
        // west of it, once it lets you go: the passage to the stairs
        ['room', 28, 20, 35, 20], ['room', 28, 21, 28, 22],
        // the stairs that only go up: the well, its bottom landing
        ['room', 26, 24, 30, 34],
      ]), after: [
        ['cells', doors, 'D'], ['cell', 30, 14, 'D'], ['cell', 55, 14, 'D'],
        ['cells', beds, 'Y'], ['cells', cabinets, 'H'], ['cells', chairs, 'T'],
        ['cells', windows.filter(([x]) => x < 28 || x > 32).filter(([x]) => x < 52 && x !== 38 && x !== 41), 'W'],
        ['cells', [[63, 8], [67, 8], [63, 16], [67, 16], [63, 24], [67, 24], [63, 32], [67, 32]], 'P'],
        ['cells', [[62, 12], [68, 20], [62, 28], [65, 6]], 'Y'], ['cells', [[63, 34]], 'T'],
        ['cell', 65, 39, 'D'],
        // the door that stands on its own in the hall
        ['cells', [[64, 20], [66, 20]], '#'], ['cell', 65, 20, 'D'],
        // the turning room's doors, and the corridor's door down to it
        ['cell', 39, 14, 'D'], ['cells', Object.values(TR), 'D'],
        ['cells', [[38, 21], [40, 19]], 'Y'], ['cell', 41, 18, 'T'],
        // the stairwell's door from the passage
        ['cell', 28, 23, 'D'],
      ] },
    },
    1: {
      y: FY, wallH: 3.0, wall: 'plaster', wallTint: [0.85, 0.92, 0.88], floor: 'wctile', floorTint: [0.85, 0.9, 0.88], ceil: 'plaster', lampPower: 0.6, lampColour: [0.85, 1, 0.9], lampEvery: 9,
      carve: { size: [W, H], ops: [
        ['room', 26, 24, 30, 34],                      // the top of the stairwell (the same well, a storey up)
        ['room', 24, 16, 32, 22],                      // the dispensary, off the landing
      ], after: [
        ['cell', 28, 23, 'D'],
        ['cells', [[25, 17], [26, 17], [27, 17], [29, 17], [30, 17], [31, 17]], 'H'], ['cell', 28, 19, 'T'],
      ] },
    },
  },
  // the stair up the well: its foot at the south end, its head at the north end of the floor above
  stairs: [{ x: 28, y: 32, dir: 'N', len: 6, w: 1, from: 'G', to: '1' }],
  start: { x: 21, y: 7, floor: 'G', yaw: Math.PI },
  extract: { x: 55, y: 19, floor: 'G' },
  portals: [
    // the corridor, both ways: step past its end and you are thirty squares back along it
    { at: [49, 12, 50, 13, 'G'], shift: [-30, 0], off: 'antidote' },
    { at: [10, 12, 11, 13, 'G'], shift: [30, 0], off: 'antidote' },
    // the cupboard: inside, the big room
    { at: [29, 16, 31, 16, 'G'], shift: [35, -11] },
    // the big room's far door: back into the ward where you woke
    { at: [64, 38, 66, 38, 'G'], shift: [-44, -30] },
    // the door on its own: through it southwards, and you are at the corridor's west end, facing along it
    { at: [65, 21, 65, 21, 'G'], to: [13, 12, 'G'], turn: -Math.PI / 2, heading: [0, 1] },
    // the turning room: out of the east door, in at the south door; out of the south, in at the west;
    // out of the west, in at the east - the once, and then it lets you go
    { at: [43, 20, 43, 20, 'G'], to: [39, 22, 'G'], turn: -Math.PI / 2, said: 'The same room.' },
    { at: [39, 24, 39, 24, 'G'], to: [37, 20, 'G'], turn: -Math.PI / 2, said: 'The same room. Again.' },
    { at: [35, 20, 35, 20, 'G'], to: [41, 20, 'G'], turn: 0, times: 1, said: 'The same room - and yet.' },
    // the stairs: at the top you are at the foot again - three times; then the landing is a landing
    { at: [26, 25, 30, 25, '1'], to: [28, 33, 'G'], turn: 0, times: 3, heading: [0, -1] },
  ],
  extra(kit) {
    const { mark, CELL } = kit;
    // the corridor's ends lost in a haze - the east one lifts once the antidote is in you
    mark('mist', [2 * CELL, 0, 12 * CELL], [9 * CELL, 3, 14 * CELL]);
    mark('mist', [51 * CELL, 0, 12 * CELL], [59 * CELL, 3, 14 * CELL], { until: 'antidote' });
  },
  zones: [
    { id: 'disp', label: 'The Ward - the dispensary', at: [24, 16, 32, 22], floor: '1' },
    { id: 'top', label: 'The Ward - the top of the stairs', at: [26, 24, 30, 34], floor: '1' },
    { id: 'corridor', label: 'The Ward - the corridor', at: [2, 12, 58, 13] },
    { id: 'hall', label: 'The Ward - the room that does not fit', at: [61, 2, 69, 38] },
    { id: 'turning', label: 'The Ward - the turning room', at: [37, 18, 41, 22] },
    { id: 'stairs', label: 'The Ward - the stairs that only go up', at: [26, 24, 30, 34] },
  ],
  guards: [
    { id: 'w1', at: [30, 13, 'G'], route: [[14, 13], [46, 13]], arms: 'pistol' },
    { id: 'w2', at: [64, 10, 'G'], route: [[62, 4], [68, 4], [68, 36], [62, 36]], arms: 'smg' },
    { id: 'w3', at: [66, 24, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'w4', at: [64, 30, 'G'], arms: 'shotgun', temper: 'steady' },
    { id: 'w5', at: [44, 7, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'w6', at: [8, 7, 'G'], arms: 'pistol' },
    { id: 'w7', at: [31, 20, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'w8', at: [28, 20, '1'], arms: 'smg', temper: 'steady' },
  ],
  // (M6.115.1) papers, at last: two of them, and neither of them helps
  intel: [
    { id: 'chart', at: [4, 9, 'G'], kind: 'Chart', title: 'The chart at the foot of your bed', text: ['Your name, in a hand you do not know. Under "dose", a number crossed out and written again, three times, each one larger.'] },
    { id: 'four', at: [41, 18, 'G'], kind: 'Note', title: 'A note on the table in the turning room', text: ['"Four doors. Three of them lie. The one that does not lies only once."'] },
  ],
  pickups: [{ id: 'antidote', name: 'The antidote', what: 'the antidote', at: [28, 19, '1'], table: false, h: 0.8, colour: [0.4, 0.95, 0.6] }],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'antidote', text: 'Find the antidote (up the stairs)' },
  ],
};
