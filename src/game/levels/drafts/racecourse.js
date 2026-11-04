// FRONTLINE - Level 116, the Racecourse (first draft, M6.138; the start of THE BANKER). Kray's money never touched a
// bank anyone could name. It went through a private banker in Lessar, Mr Ivo Dancourt, by way of the racecourse:
// winning slips bought for cash at the Lessar Cup and paid out clean at his bank a week later. Go to the Cup. Mark
// Dancourt's courier at the bookmakers' rail, and take the week's slips from the stewards' room.
const W = 64, H = 40;
export default {
  id: 'racecourse', no: 116, title: 'The Racecourse', place: 'the Lessar racecourse',
  where: 'The Lessar racecourse, Cup day. 14:30, the third race off, the stands roaring.',
  brief: [
    ['The job', 'Kray\'s money never touched a bank anyone could name. It went through a private banker in Lessar, <b>Mr Ivo Dancourt</b>, by way of the racecourse: <b>winning slips</b> bought for cash at the Lessar Cup and paid out clean at his bank a week later. Go to the Cup. <b>Mark Dancourt\'s courier</b> at the bookmakers\' rail. Take the week\'s <b>slips</b> from the stewards\' room. If you can, <b>without the alarm</b>.'],
    ['The place', 'The <b>grandstand</b> is along the north side, with the <b>stewards\' room</b> at its east end and the <b>weighing room</b> at its west end. The <b>bookmakers\' rail</b> runs along the lawn in front of it, and the track is beyond the rail, south. It is broad daylight and the lawn is full. You go in <b>dressed as one of Dancourt\'s men</b>: there are a dozen of them here.'],
    ['Security', 'A camera on the stewards\' room and the course\'s alarm, both on the console in the weighing room with the radio. The engineer is at the tote board. Dancourt\'s men are on the lawn in good suits. The course police are not his, but they will not ask questions either.'],
    ['Objectives', '<b>Mark the courier</b> (the bookmakers\' rail). Take the <b>slips</b> (the stewards\' room). If you can, <b>without the alarm</b>. Out by the car park, west.'],
  ],
  epilogue: {
    success: 'The week\'s slips are worth eleven thousand on Kray\'s account, and every one is stamped with the stewards\' seal in the same hand. The courier goes to the bank on Monday with an empty case, and Ghost watches who opens the door to him.',
    partial: 'Half of it. Ghost knows the courier, or holds the slips, but cannot yet tie them to the bank.',
  },
  time: { date: [7, 8, 2027], hour: 14, minute: 30 }, night: false, faction: 'red', requires: 'HACKKIT', startDisguise: 'red',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.72, 0.75, 0.8, 50, 300], ambient: [0.62, 0.63, 0.66] },
  extractName: 'the car park, west', extract: { x: 2, y: 20, floor: 'G', van: [0, 6] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 4, wall: 'paint', wallTint: [0.95, 0.95, 0.92], floor: 'wood', ceil: 'wood', lampPower: 0.5, lampColour: [1, 0.95, 0.85], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 16, 6, 46, 12],                        // the grandstand's hall
        ['room', 48, 6, 54, 12],                        // the stewards' room
        ['room', 8, 6, 14, 12],                         // the weighing room
        ['room', 56, 16, 60, 19],                       // the tote board's hut
      ], after: [
        ['cells', [[24, 13], [38, 13], [47, 9], [15, 9], [51, 13], [11, 13], [58, 20]], 'D'],
        ['room', 18, 8, 44, 8, 'Y'], ['cells', [[20, 11], [42, 11]], 'T'],
        ['cells', [[52, 7]], 'T'], ['cells', [[50, 11]], 'H'],
        ['cells', [[9, 7]], 'T'], ['cells', [[13, 11]], 'Y'],
        ['cells', [[59, 17]], 'M'],
        // the bookmakers' boards along the rail, the rail itself, the lawn's tables
        ['room', 14, 22, 50, 22, 'K'], ['cells', [[18, 19], [24, 19], [30, 19], [36, 19], [42, 19]], 'T'],
        ['cells', [[20, 16], [32, 16], [44, 16], [10, 18], [54, 24]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the track's turf beyond the rail, and the stand's roof
    box([0, 0.01, 23 * C], [W * C, 0.03, 34 * C], 'grass', { tint: [0.5, 0.75, 0.4], solid: false });
    box([15 * C, 4, 5 * C], [47 * C, 4.4, 15 * C], 'paint', { tint: [0.3, 0.45, 0.35] });
    level.signs.push({ pos: [mid(31), 4.8, 13 * C + C + 0.13], yaw: 0, w: 6, h: 0.8, text: 'THE LESSAR CUP', sub: 'Third race - 14:30', col: '#2a4a2a' });
  },
  start: { x: 2, y: 19, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'stand', label: 'Lessar - the grandstand', at: [16, 6, 46, 12] },
    { id: 'stewards', label: 'Lessar - the stewards\' room', at: [48, 6, 54, 12] },
    { id: 'weigh', label: 'Lessar - the weighing room', at: [8, 6, 14, 12] },
    { id: 'rail', label: 'Lessar - the bookmakers\' rail', at: [14, 14, 50, 21] },
    { id: 'course', label: 'The Lessar racecourse', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'courier', at: [30, 18, 'G'], arms: 'pistol', rank: 'specialist', temper: 'cowardly', name: 'Dancourt\'s courier', tint: [0.4, 0.4, 0.45], yaw: Math.PI },
    { id: 'dm1', at: [26, 17, 'G'], arms: 'pistol', temper: 'steady', tint: [0.3, 0.3, 0.35] },
    { id: 'dm2', at: [36, 17, 'G'], arms: 'pistol', temper: 'steady', tint: [0.3, 0.3, 0.35] },
    { id: 'sw1', at: [51, 9, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The senior steward' },
    { id: 'rad', at: [11, 9, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [58, 18, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'cp1', at: [30, 14, 'G'], route: [[17, 14], [45, 14]], arms: 'carbine' },
    { id: 'cp2', at: [40, 10, 'G'], route: [[20, 10], [44, 10]], arms: 'pistol' },
  ],
  civilians: [
    { id: 'b1', at: [18, 20, 'G'], yaw: Math.PI, title: 'A bookmaker', tint: [1.1, 1.0, 0.9], says: ['The quiet gent in grey? Cash on every favourite, every race, and never smiles when they win.'] },
    { id: 'b2', at: [36, 20, 'G'], yaw: Math.PI, title: 'Another bookmaker', tint: [1.0, 1.0, 1.1], says: ['Odds on the grey, evens the field, and I would not stand next to that fellow in the suit if I were you.'] },
    { id: 'p1', at: [22, 15, 'G'], yaw: 0, title: 'A lady in a large hat', tint: [1.3, 1.1, 1.2], says: ['My husband has lost the car. Not on a horse, I mean he has actually lost it.'] },
    { id: 'p2', at: [44, 15, 'G'], yaw: 0, title: 'A racegoer, delighted', tint: [1.0, 1.1, 1.0], says: ['Twenty to one! Twenty to one! I shall never work again!'] },
    { id: 'p3', at: [12, 17, 'G'], yaw: -Math.PI / 2, title: 'A jockey, between rides', tint: [1.2, 0.6, 0.6], says: ['The stewards\' room has had a locked drawer since Easter. Stewards do not lock drawers.'] },
  ],
  pickups: [{ id: 'slips', name: 'The week\'s winning slips', what: 'the slips', at: [52, 7, 'G'], table: true, colour: [0.95, 0.9, 0.7] }],
  devices: [
    { id: 'c-stew', kind: 'camera', at: [55, 13, 'G'], face: [-1, 1], net: 'lessar' },
    { id: 'a-lessar', kind: 'alarm', at: [47, 11, 'G'], face: [1, 0], net: 'lessar' },
  ],
  terminals: [{ id: 'sec', name: 'the weighing room console', at: [9, 7, 'G'], face: [0, 1], time: 6, net: 'lessar' }],
  intel: [
    { id: 'card', at: [20, 11, 'G'], kind: 'Racecard', title: 'A racecard left in the stand', text: ['Every favourite circled in the same blue pencil, and in the margin a bank\'s telephone number with no name.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'identify', refs: ['courier'], text: 'Mark the courier (the bookmakers\' rail)' },
    { id: 'o2', kind: 'take', ref: 'slips', text: 'Take the slips (the stewards\' room)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
