// FRONTLINE - Level 46, the Ministry of Supply (first draft, M6.48): where the blight's radio log led. The buyer was
// not a market but a ministry - the reds' Ministry of Supply, in Varnholm. By day, in a red officer's uniform:
// walk in through the front door with everyone else, and walk out with the order that bought the blight.
const W = 44, H = 34;
export default {
  id: 'ministry', no: 46, title: 'The Ministry of Supply', place: 'the Ministry of Supply, Varnholm',
  where: 'The Ministry of Supply, Varnholm. 14:20, a grey afternoon, the building at work.',
  brief: [
    ['The way in', 'By the front door, in broad daylight, <b>disguised</b> in a red officer\'s uniform. From a way off they take you for one of their own; close to (three or four metres; an officer, seven) they look twice. Walk, do not run; do not crouch; do not fire. If it goes, a downed red\'s uniform will do (E at him).'],
    ['The place', 'Ground floor: the <b>entrance hall</b>, the security desk, the post room, the canteen. First floor: the <b>open office</b>, the records room (laser-guarded). Second floor, up the back stair: the <b>Deputy Minister\'s office</b> (maglocked; his keycard), his secretary, the conference room.'],
    ['Security', 'Cameras in the hall, on the stairs and the second floor (they look longer at a uniform, but they look), the laser in the records room, the maglock, the alarm - run from the security desk in the hall. A radio at the desk; an engineer about the building.'],
    ['Objectives', 'Copy the <b>supply records</b> (the records room). Take the <b>order</b> - the one that bought the blight - from the Deputy Minister\'s safe. Out by the front door, the way you came.'],
  ],
  time: { date: [4, 1, 2027], hour: 14, minute: 20 }, night: false, faction: 'red', requires: 'HACKKIT', startDisguise: 'red',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'RCAM', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  extractName: 'the street, by the front door', extract: { x: 21, y: 32, floor: 'G' },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 16 },
  floors: {
    G: {
      y: 0, wallH: 4.0, wall: 'plaster', wallTint: [0.86, 0.84, 0.78], floor: 'marble', ceil: 'plaster', lampPower: 0.85, lampEvery: 7,
      carve: { size: [W, H], ops: [
        ['room', 14, 18, 28, 28],                       // the entrance hall
        ['room', 4, 18, 12, 28],                        // the post room
        ['room', 30, 18, 40, 28],                       // the canteen
        ['room', 4, 4, 40, 16],                         // the back corridor and the service yard door
      ], after: [
        ['cells', [[20, 29], [21, 29], [22, 29], [13, 23], [29, 23], [21, 17], [8, 17], [35, 17]], 'D'],
        ['cells', [[16, 29], [26, 29], [3, 22], [41, 22], [6, 29], [36, 29]], 'W'],
        ['room', 16, 20, 19, 20, 'K'], ['cells', [[25, 20], [17, 25], [25, 25]], 'Z'], ['cells', [[21, 22], [21, 25]], 'P'],
        ['cells', [[5, 19], [7, 19], [9, 19], [11, 19]], 'H'], ['cells', [[6, 24], [10, 24]], 'T'],
        ['cells', [[32, 21], [35, 21], [38, 21], [32, 25], [35, 25]], 'T'], ['room', 31, 27, 39, 27, 'K'],
        ['room', 6, 6, 9, 8, 'C'], ['cells', [[34, 6], [36, 6], [38, 6]], 'M'],
        ['cells', [[15, 32], [28, 32]], 'v'], ['cells', [[10, 31], [32, 31]], 't'],
      ] },
    },
    1: {
      y: 4.2, wallH: 3.4, wall: 'plaster', wallTint: [0.88, 0.86, 0.8], floor: 'wood', floorTint: [0.55, 0.42, 0.3], ceil: 'plaster', lampPower: 0.8, lampEvery: 7,
      carve: { size: [W, H], ops: [
        ['room', 4, 18, 40, 28],                        // the open office
        ['room', 4, 4, 18, 16],                         // the records room
        ['room', 20, 4, 40, 16],                        // the landing and the back stair's corridor
      ], after: [
        ['cells', [[11, 17], [30, 17]], 'D'],
        ['cells', [[3, 22], [41, 22], [10, 29], [20, 29], [30, 29], [3, 10]], 'W'],
        ['cells', [[8, 21], [12, 21], [16, 21], [24, 21], [28, 21], [32, 21], [36, 21], [8, 25], [12, 25], [16, 25], [28, 25], [32, 25], [36, 25]], 'T'],
        ['cells', [[6, 6], [6, 9], [6, 12], [10, 6], [10, 9], [10, 12], [14, 6], [14, 12]], 'H'], ['cells', [[16, 9]], 'M'],
      ] },
    },
    2: {
      y: 7.8, wallH: 3.4, wall: 'plaster', wallTint: [0.9, 0.87, 0.8], floor: 'wood', floorTint: [0.45, 0.3, 0.22], ceil: 'plaster', lampPower: 0.8, lampEvery: 7,
      carve: { size: [W, H], ops: [
        ['room', 4, 4, 40, 10],                         // the corridor
        ['room', 4, 12, 20, 28],                        // the conference room
        ['room', 22, 12, 30, 28],                       // the secretary's office
        ['room', 32, 12, 40, 28],                       // the Deputy Minister's office
      ], after: [
        ['cells', [[12, 11], [26, 11], [31, 20]], 'D'],      // (the Deputy Minister's only door is from his secretary's)
        ['cells', [[3, 18], [41, 16], [41, 24], [10, 29], [36, 29]], 'W'],
        ['room', 8, 16, 16, 18, 'T'], ['room', 8, 22, 16, 24, 'T'],
        ['cells', [[24, 15], [28, 25]], 'T'], ['cells', [[24, 26]], 'H'],
        ['cells', [[36, 16]], 'T'], ['cells', [[34, 25], [38, 25]], 'Z'], ['cells', [[39, 13], [39, 27]], 'H'],
      ] },
    },
  },
  stairs: [
    { x: 20, y: 15, dir: 'E', len: 6, w: 2, from: 'G', to: '1' },      // the main stair, off the back corridor
    { x: 38, y: 9, dir: 'W', len: 6, w: 2, from: '1', to: '2' },       // the back stair, up to the Deputy Minister's floor
  ],
  start: { x: 21.5, y: 32, floor: 'G', yaw: 0 },
  zones: [
    { id: 'hall', label: 'The Ministry - the entrance hall', at: [14, 18, 28, 28] },
    { id: 'post', label: 'The Ministry - the post room', at: [4, 18, 12, 28] },
    { id: 'canteen', label: 'The Ministry - the canteen', at: [30, 18, 40, 28] },
    { id: 'back', label: 'The Ministry - the back corridor', at: [4, 4, 40, 16] },
    { id: 'office', label: 'The Ministry - the open office', at: [4, 18, 40, 28], floor: '1' },
    { id: 'records', label: 'The Ministry - the records room', at: [4, 4, 18, 16], floor: '1' },
    { id: 'landing', label: 'The Ministry - the first floor', at: [0, 0, W - 1, H - 1], floor: '1' },
    { id: 'conf', label: 'The Ministry - the conference room', at: [4, 12, 20, 28], floor: '2' },
    { id: 'sec', label: 'The Ministry - the secretary\'s office', at: [22, 12, 30, 28], floor: '2' },
    { id: 'dm', label: 'The Ministry - the Deputy Minister\'s office', at: [32, 12, 40, 28], floor: '2' },
    { id: 'top', label: 'The Ministry - the second floor', at: [0, 0, W - 1, H - 1], floor: '2' },
    { id: 'street', label: 'Varnholm - Ministry Square', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'dm', at: [36, 18, '2'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The Deputy Minister', tint: [0.95, 0.95, 1.0], card: 'ministry' },
    { id: 'sec2', at: [27, 15, '2'], arms: 'pistol', temper: 'cowardly' },
    { id: 'c2', at: [20, 7, '2'], route: [[5, 7], [39, 7]], arms: 'smg', temper: 'steady' },
    { id: 'desk', at: [18, 21, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'door', at: [24, 27, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'hall2', at: [26, 21, 'G'], route: [[15, 21], [27, 21]], arms: 'smg' },
    { id: 'post', at: [8, 22, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'cant', at: [34, 23, 'G'], arms: 'pistol', temper: 'cowardly', role: 'medic' },
    { id: 'eng', at: [36, 8, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'o1', at: [20, 23, '1'], route: [[6, 23], [38, 23]], arms: 'pistol', rank: 'sergeant' },
    { id: 'o2', at: [34, 27, '1'], arms: 'smg', temper: 'steady' },
    { id: 'rec', at: [8, 14, '1'], arms: 'carbine', temper: 'steady' },
  ],
  // (M6.54) the Ministry at work: clerks who take you for one of the officers
  civilians: [
    { id: 'clerk1', at: [10, 22, '1'], yaw: 0, title: 'A clerk', tint: [1.1, 1.05, 0.95], says: ['Sir.', 'The Deputy Minister is in a meeting, sir. He doesn\'t like to be disturbed.'] },
    { id: 'clerk2', at: [30, 22, '1'], yaw: Math.PI, title: 'A clerk', tint: [0.95, 1.0, 1.1], says: ['Records are on the north side, sir - you\'ll need a reason to go in.', 'Sir.'] },
    { id: 'recept', at: [17, 19, 'G'], yaw: Math.PI, title: 'The receptionist', tint: [1.2, 1.0, 1.05], says: ['Good afternoon, sir. Sign the book on your way out.', 'Second floor is by the back stair, sir.'] },
    { id: 'cook', at: [35, 26, 'G'], yaw: Math.PI, title: 'The canteen cook', tint: [1.35, 1.35, 1.3], says: ['Soup\'s off. There\'s bread.', 'Officers eat upstairs, usually.'] },
  ],
  pickups: [{ id: 'order', name: 'The supply order', what: 'the order', at: [38, 16, '2'], table: false, h: 0.85, colour: [0.85, 0.75, 0.4] }],
  devices: [
    { id: 'c-hall', kind: 'camera', at: [14, 18, 'G'], face: [1, 1], net: 'ministry' },
    { id: 'c-stair', kind: 'camera', at: [27, 16, 'G'], face: [-1, -1], net: 'ministry' },
    { id: 'c-off', kind: 'camera', at: [40, 18, '1'], face: [-1, 1], net: 'ministry' },
    { id: 'c-top', kind: 'camera', at: [40, 4, '2'], face: [-1, 1], net: 'ministry' },
    { id: 'c-pin-dm', kind: 'camera', at: [32, 28, '2'], face: [1, -1], net: 'ministry', hidden: true },
    { id: 'z-rec', kind: 'laser', at: [4, 10, '1'], to: [18, 10], net: 'ministry' },
    { id: 'm-dm', kind: 'lock', at: [31, 20, '2'], net: 'ministry' },
    { id: 'a-hall', kind: 'alarm', at: [28, 19, 'G'], face: [-1, 0], net: 'ministry' },
  ],
  terminals: [
    { id: 'sec', name: 'the security desk\'s console', at: [17, 21, 'G'], face: [0, -1], time: 6, net: 'ministry' },
    { id: 'records', name: 'the supply records', at: [16, 9, '1'], face: [-1, 0], time: 9, reveal: 20, verb: 'Copy', doing: 'Copying',
      said: 'The supply records: every tonne of grain the reds expect to have next year - and the blight, ordered to make sure their neighbours have none. Every red here on your radar for 20 seconds.' },
  ],
  // (M6.58) papers to read: lore, not needed to finish
  intel: [
    { id: "diary", at: [24, 15, "2"], kind: "Diary", title: "The secretary's desk diary", text: ["Tuesday: the Deputy Minister - lunch with Count M. No note to be kept.", "Thursday: the invoice to go through Supply, not Agriculture. Do NOT copy to the Minister."] },
    { id: "memo", at: [8, 25, "1"], kind: "Memo", title: "Memo - to all staff, first floor", text: ["Visitors to the records room must be signed in by a section head. No exceptions.", "Someone has added in pencil: \"except for the Deputy Minister, apparently\"."] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'records', text: 'Copy the supply records (the records room, the first floor)' },
    { id: 'o2', kind: 'take', ref: 'order', text: 'Take the supply order (the Deputy Minister\'s office, the second floor)' },
  ],
};
