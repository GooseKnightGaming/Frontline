// FRONTLINE - Level 82, the Funfair (first draft, M6.104; a mirror maze that will not let you through). The reds'
// couriers in Varnholm leave their messages in the Hall of Mirrors at the spring funfair, at the end of its maze,
// where nobody without the trick ever gets to. Mark the man who comes to watch the drop, find the trick - the maze's
// own plan, in the attendant's booth - and take the message from the room at the end.
const W = 48, H = 36;
export default {
  id: 'funfair', no: 82, title: 'The Funfair', place: 'the spring funfair, Varnholm common',
  where: 'The spring funfair on Varnholm common. 21:40, the lights on, the crowds thinning.',
  brief: [
    ['The job', 'The reds\' couriers leave their messages in the <b>Hall of Mirrors</b> at the spring funfair, in a room at the end of its maze. Nobody gets there without the trick. <b>Mark the contact</b> who comes to watch the drop. Find the trick: the <b>maze\'s plan</b>, in the attendant\'s booth. Then take the <b>message</b> from the room at the end.'],
    ['The place', 'The common is full of stalls, a carousel, and the <b>Hall of Mirrors</b> along its north side. Its corridor goes on further than it should, and you always end up back where you started. The <b>attendant\'s booth</b> is south-west, the fair\'s office and the generator south-east. You go in <b>dressed as one of them</b>. Plenty of reds come to the fair off duty.'],
    ['Security', 'The fair\'s camera on the Hall of Mirrors and its alarm, both in the office, with the radio. The engineer is at the generator. The contact watches the hall\'s door from the stalls.'],
    ['Objectives', '<b>Mark the contact</b> (by the stalls). Take the <b>maze\'s plan</b> (the attendant\'s booth). Take the <b>message</b> (the room at the end of the maze). Out the way you came, south.'],
  ],
  epilogue: {
    success: 'The message says where the next drop will be, and the contact\'s face says who will come for it. Ghost is waiting at the next fair, and the one after.',
    partial: 'The maze kept its secret, or the contact walked away unseen. The couriers will find another hall of mirrors.',
  },
  time: { date: [24, 4, 2027], hour: 21, minute: 40 }, night: true, faction: 'red', requires: 'HACKKIT', startDisguise: 'red', disguiseName: 'OFF DUTY',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.14, 0.12, 0.16, 25, 170], ambient: [0.3, 0.26, 0.3] },
  extractName: 'the common, south', extract: { x: 24, y: 35, floor: 'G' },
  outside: { backdrop: 'city', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.4, wall: 'paint', wallTint: [0.9, 0.5, 0.6], floor: 'wood', ceil: 'paint', lampPower: 0.9, lampColour: [1, 0.8, 0.9], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 10, 8, 37, 14],                        // the Hall of Mirrors' corridor
        ['room', 39, 8, 45, 14],                        // the room at the end
        ['room', 4, 20, 8, 24],                         // the attendant's booth
        ['room', 30, 26, 36, 30],                       // the fair's office
        ['room', 40, 26, 44, 30],                       // the generator hut
      ], after: [
        ['cells', [[9, 11], [38, 11], [9, 22], [33, 25], [42, 25]], 'D'],
        ['cells', [[42, 12]], 'T'], ['cells', [[6, 21]], 'T'], ['cells', [[32, 28], [35, 27]], 'T'], ['cells', [[42, 28]], 'M'],
        // the stalls, the carousel's ring of horses, the benches
        ['room', 14, 20, 16, 20, 'T'], ['room', 20, 20, 22, 20, 'T'], ['room', 14, 30, 16, 30, 'T'],
        ['cells', [[26, 19], [28, 19], [30, 20], [30, 22], [28, 23], [26, 23], [24, 22], [24, 20]], 'M'],
        ['cells', [[12, 26], [20, 27], [38, 20], [44, 19], [6, 30]], 'B'],
      ] },
    },
  },
  portals: [
    // the maze: step past the corridor's far end and you are back near its door - until you know the trick
    { at: [35, 9, 36, 13, 'G'], shift: [-24, 0], off: 'plan', said: 'The mirrors again. Further than it looked.' },
  ],
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the mirrors down the corridor's walls
    for (let x = 11; x < 37; x += 2) for (const z of [8.05, 14.95]) box([x * C, 0.3, z * C], [x * C + C * 0.9, 2.8, z * C + 0.04], 'glassB', { solid: false });
    for (const [x, y] of [[18, 17], [28, 17], [20, 25], [36, 23], [24, 33], [10, 18]]) level.lights.push({ pos: [mid(x), 4, mid(y)], range: 11, intensity: 1.1, color: [1, 0.75, 0.9], street: true });
    level.signs.push({ pos: [mid(23.5), 4.1, 15 * C + 0.12], yaw: 0, w: 5, h: 0.8, text: 'HALL OF MIRRORS', sub: 'Find your way out!', col: '#6a1a4a' });
  },
  start: { x: 24, y: 34, floor: 'G', yaw: 0 },
  zones: [
    { id: 'hall', label: 'The Funfair - the Hall of Mirrors', at: [10, 8, 37, 14] },
    { id: 'end', label: 'The Funfair - the room at the end', at: [39, 8, 45, 14] },
    { id: 'booth', label: 'The Funfair - the attendant\'s booth', at: [4, 20, 8, 24] },
    { id: 'office', label: 'The Funfair - the fair\'s office', at: [30, 26, 36, 30] },
    { id: 'fair', label: 'The Funfair', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'contact', at: [21, 19, 'G'], arms: 'pistol', rank: 'specialist', temper: 'cowardly', name: 'The contact', tint: [0.4, 0.3, 0.3], yaw: 0 },
    { id: 'rad', at: [34, 28, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [41, 27, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'end1', at: [43, 10, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'f1', at: [18, 24, 'G'], route: [[10, 24], [40, 24]], arms: 'pistol' },
    { id: 'f2', at: [34, 18, 'G'], route: [[34, 17], [34, 23]], arms: 'pistol', temper: 'bold' },
  ],
  civilians: [
    { id: 'att', at: [7, 23, 'G'], yaw: Math.PI / 2, title: 'The maze attendant', tint: [1.1, 1.0, 0.8], says: ['The maze? The plan\'s pinned up in my booth. Mind you don\'t tell the customers.', 'Gentlemen in red go in and come out again, every night. Funny sort of fun.'] },
    { id: 'c1', at: [15, 21, 'G'], yaw: 0, title: 'A stallholder', tint: [1.2, 1.0, 0.9], says: ['Three throws a penny. The man by the coconut stall has been watching that door all evening.'] },
    { id: 'c2', at: [27, 21, 'G'], yaw: Math.PI, title: 'A child with a balloon', tint: [1.3, 1.1, 1.2], says: ['The mirror place goes on for ever! I went in three times and came out the same door!'] },
    { id: 'c3', at: [12, 28, 'G'], yaw: 0, title: 'A courting couple', tint: [1.1, 1.2, 1.3], says: ['We are leaving before the soldiers start singing.'] },
    { id: 'c4', at: [38, 22, 'G'], yaw: -Math.PI / 2, title: 'The carousel man', tint: [0.9, 0.9, 1.1], says: ['Last ride at ten. After that it\'s just the generator and the drunks.'] },
  ],
  pickups: [
    { id: 'plan', name: 'The maze\'s plan', what: 'the maze\'s plan', at: [6, 21, 'G'], table: true, colour: [0.9, 0.85, 0.6] },
    { id: 'msg', name: 'The courier\'s message', what: 'the message', at: [42, 12, 'G'], table: true, colour: [0.95, 0.95, 0.9] },
  ],
  devices: [
    { id: 'c-hall', kind: 'camera', at: [9, 15, 'G'], face: [1, 1], net: 'fair' },
    { id: 'a-fair', kind: 'alarm', at: [29, 25, 'G'], face: [0, -1], net: 'fair' },
  ],
  terminals: [{ id: 'sec', name: 'the fair\'s office console', at: [32, 28, 'G'], face: [0, -1], time: 6, net: 'fair' }],
  intel: [
    { id: 'takings', at: [35, 27, 'G'], kind: 'Takings', title: 'The fair\'s takings book', text: ['Hall of Mirrors: four pennies tonight. Yet nine men have gone in. The manager has stopped asking.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'identify', refs: ['contact'], text: 'Mark the contact (by the stalls)' },
    { id: 'o2', kind: 'take', ref: 'plan', text: 'Take the maze\'s plan (the attendant\'s booth)' },
    { id: 'o3', kind: 'take', ref: 'msg', text: 'Take the message (the room at the end of the maze)' },
  ],
};
