// FRONTLINE - Level 89, the Railway Hotel (first draft, M6.111; THE WARNING, second). The squad's leader said who gave
// the reds Lindqvist's Ford: one of Ghost's own lorry drivers, paid by the reds' paymaster in Varnholm, who keeps a
// room at the Railway Hotel and meets his men in its bar. Go in as a waiter. Find out from the switchboard whom the
// paymaster rings, take his payment ledger from his room upstairs, and mark the driver when he comes in for his money.
const W = 52, H = 34;
export default {
  id: 'railhotel', no: 89, title: 'The Railway Hotel', place: 'the Railway Hotel, Varnholm',
  where: 'The Railway Hotel, Varnholm. 22:15, the last train in, the bar full of red officers.',
  brief: [
    ['The job', 'The squad\'s leader said who gave the reds Lindqvist\'s Ford: one of Ghost\'s own <b>lorry drivers</b>, paid by the reds\' <b>paymaster</b>, who keeps a room at the <b>Railway Hotel</b> and meets his men in its bar. Go in as a waiter. Find out at the <b>switchboard</b> whom the paymaster rings. Take his <b>payment ledger</b> from his room upstairs. <b>Mark the driver</b> when he comes in for his money.'],
    ['The place', 'Downstairs are the <b>lobby</b>, the <b>bar</b> and the <b>switchboard room</b>, with the kitchens east. The guest rooms are upstairs, and the <b>paymaster\'s room</b> is the one at the east end. You come in by the kitchens\' yard. You are <b>dressed as one of them</b>: half the bar is red tonight.'],
    ['Security', 'A camera in the lobby and the hotel\'s alarm, both on the porter\'s console in the switchboard room. The reds\' radio man drinks in the bar, and the engineer is in the kitchens. The paymaster has a man on his door.'],
    ['Objectives', 'Find out at the <b>switchboard</b> whom he rings. Take the <b>ledger</b> (his room, upstairs). <b>Mark the driver</b> (the bar). Out by the kitchens\' yard.'],
  ],
  epilogue: {
    success: 'The ledger has the driver\'s name, his price, and the dates he was paid. Ghost has a word with the driver in a quiet room, and the reds\' paymaster finds that every man on his books has gone quiet.',
    partial: 'Part of it. The paymaster will move rooms, and the driver will be careful.',
  },
  time: { date: [8, 5, 2027], hour: 22, minute: 15 }, night: true, faction: 'red', requires: 'HACKKIT', startDisguise: 'red', disguiseName: 'A WAITER',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.16, 0.15, 0.18, 25, 160], ambient: [0.3, 0.28, 0.32] },
  extractName: 'the kitchens\' yard', extract: { x: 50, y: 26, floor: 'G', van: [-1, 5] },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'paint', wallTint: [0.78, 0.7, 0.6], floor: 'carpet', ceil: 'plaster', lampPower: 0.8, lampColour: [1, 0.88, 0.7], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 16, 8, 34, 14],                        // the lobby
        ['room', 16, 16, 24, 22],                       // the bar
        ['room', 26, 16, 34, 22],                       // the switchboard room
        ['room', 40, 10, 47, 22],                       // the kitchens
      ], after: [
        ['cells', [[25, 15], [20, 15], [30, 15], [35, 11], [39, 16], [25, 7], [44, 23]], 'D'],
        ['cells', [[20, 7], [30, 7], [15, 11], [15, 19], [35, 19], [43, 9], [48, 16]], 'W'],
        ['cells', [[18, 9], [32, 9]], 'H'], ['cells', [[33, 13]], 'T'],
        ['room', 17, 17, 17, 21, 'K'], ['cells', [[20, 19], [22, 21]], 'T'],
        ['cells', [[28, 17]], 'T'], ['cells', [[33, 21]], 'H'],
        ['room', 42, 12, 45, 12, 'T'], ['cells', [[46, 20]], 'M'], ['cells', [[42, 18]], 'T'],
        ['cells', [[44, 28], [36, 30], [10, 26], [48, 6]], 'B'],
      ] },
    },
    1: {
      y: 3.8, wallH: 3.2, wall: 'paint', wallTint: [0.82, 0.76, 0.66], floor: 'carpet', ceil: 'plaster', lampPower: 0.55, lampColour: [1, 0.88, 0.7], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 16, 8, 34, 11],                        // the corridor
        ['room', 16, 13, 22, 22],                       // room 1
        ['room', 24, 13, 28, 22],                       // room 2
        ['room', 30, 13, 34, 22],                       // the paymaster's room
      ], after: [
        ['cells', [[19, 12], [26, 12], [32, 12]], 'D'],
        ['cells', [[19, 23], [26, 23], [32, 23], [15, 17], [35, 17], [20, 7], [30, 7]], 'W'],
        ['cells', [[19, 18], [26, 18], [32, 18]], 'T'], ['cells', [[17, 21], [27, 21], [33, 21]], 'Y'],
      ] },
    },
  },
  stairs: [{ x: 32, y: 13, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { level, mid, CELL: C } = kit;
    for (const [x, y] of [[25, 5], [44, 25], [12, 18], [38, 28]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 11, intensity: 0.8, color: [1, 0.88, 0.7], street: true });
    level.signs.push({ pos: [mid(25), 4.2, 7 * C - 0.13], yaw: Math.PI, w: 5, h: 0.8, text: 'RAILWAY HOTEL', sub: 'Varnholm - Est. 1889', col: '#3a1a1a' });
  },
  start: { x: 49, y: 27, floor: 'G', yaw: Math.PI / 2 },
  zones: [
    { id: 'lobby', label: 'The Railway Hotel - the lobby', at: [16, 8, 34, 14] },
    { id: 'bar', label: 'The Railway Hotel - the bar', at: [16, 16, 24, 22] },
    { id: 'switch', label: 'The Railway Hotel - the switchboard room', at: [26, 16, 34, 22] },
    { id: 'kitchens', label: 'The Railway Hotel - the kitchens', at: [40, 10, 47, 22] },
    { id: 'rooms', label: 'The Railway Hotel - the guest rooms', at: [16, 8, 34, 22], floor: '1' },
    { id: 'street', label: 'Varnholm', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'driver', at: [21, 18, 'G'], arms: 'pistol', temper: 'cowardly', name: 'The lorry driver', tint: [0.4, 0.45, 0.35] },
    { id: 'pay', at: [31, 16, '1'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The paymaster', tint: [0.3, 0.26, 0.24] },
    { id: 'door', at: [31, 10, '1'], arms: 'smg', temper: 'steady' },
    { id: 'up1', at: [22, 9, '1'], route: [[17, 9], [28, 9]], arms: 'pistol' },
    { id: 'rad', at: [18, 20, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'b1', at: [23, 17, 'G'], arms: 'pistol' },
    { id: 'lb1', at: [24, 12, 'G'], route: [[17, 12], [31, 12]], arms: 'carbine' },
    { id: 'port', at: [30, 20, 'G'], arms: 'pistol', temper: 'cowardly', name: 'The night porter' },
    { id: 'eng', at: [45, 14, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'yd', at: [40, 26, 'G'], route: [[30, 26], [40, 26]], arms: 'carbine' },
  ],
  civilians: [
    { id: 'clerk', at: [26, 9, 'G'], yaw: Math.PI, title: 'The desk clerk', tint: [1.0, 0.95, 0.9], says: ['Room nine? The gentleman does not like to be disturbed. He takes his calls on the switchboard, never in his room.'] },
    { id: 'cook', at: [43, 18, 'G'], yaw: 0, title: 'The cook', tint: [1.1, 1.1, 1.1], says: ['New, are you? Trays go up the back stair of the lobby. Room nine tips. Nobody else does.'] },
    { id: 'bar1', at: [19, 21, 'G'], yaw: -Math.PI / 2, title: 'A railwayman at the bar', tint: [0.7, 0.65, 0.6], says: ['That one by the table comes in every Friday, has one drink, goes upstairs and comes down richer.'] },
  ],
  pickups: [{ id: 'ledger', name: 'The paymaster\'s ledger', what: 'the ledger', at: [32, 18, '1'], table: true, colour: [0.3, 0.2, 0.15] }],
  devices: [
    { id: 'c-lobby', kind: 'camera', at: [16, 8, 'G'], face: [1, 1], net: 'hotel' },
    { id: 'a-hotel', kind: 'alarm', at: [35, 15, 'G'], face: [1, 0], net: 'hotel' },
  ],
  terminals: [
    { id: 'sec', name: 'the porter\'s console', at: [33, 13, 'G'], face: [-1, 0], time: 6, net: 'hotel' },
    { id: 'board', name: 'the switchboard', at: [28, 17, 'G'], face: [0, 1], time: 7, reveal: 15, verb: 'Read', doing: 'Reading',
      said: 'Room nine\'s calls, every one: the barracks, the station, and a garage on the Kiln Road where Ghost\'s lorries are kept. Every red in the hotel is on your radar for 15 seconds.' },
  ],
  intel: [
    { id: 'bill', at: [42, 18, 'G'], kind: 'Bill', title: 'Room nine\'s bill', text: ['Paid in cash, a month in advance. Under "extras": "one bottle, Fridays, for the driver".'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'board', text: 'Read the switchboard (the switchboard room)' },
    { id: 'o2', kind: 'take', ref: 'ledger', text: 'Take the ledger (the paymaster\'s room, upstairs)' },
    { id: 'o3', kind: 'identify', refs: ['driver'], text: 'Mark the driver (the bar)' },
  ],
};
