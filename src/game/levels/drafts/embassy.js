// FRONTLINE - Level 40, the Embassy (first draft, M6.30: a level built round the disguise). The reds' embassy
// on Linden Row, the night of its autumn reception. You go in as one of them - in a red officer's uniform - and
// walk among them: from a way off they take you for one of their own; close to, they look twice. The cipher room
// upstairs, the ambassador's office, and what is in his safe.
const W = 46, H = 36;
export default {
  id: 'embassy', no: 40, title: 'The Embassy', place: 'the embassy on Linden Row',
  where: 'The embassy on Linden Row. 21:15, the autumn reception in full swing.',
  brief: [
    ['The way in', 'You go in <b>disguised</b>, in a red officer\'s uniform: from a way off the reds take you for one of their own. Close to (four metres; an officer, eight) they look twice. Do not crouch, do not run, and do not fire - a shot gives you away. If it goes, it goes: a downed red\'s uniform will do as well (E at him).'],
    ['The place', 'Ground floor: the <b>reception hall</b> (the party), the cloakroom and the lobby, the kitchen and the service corridor behind. Up the grand stair: the <b>first-floor offices</b>, the <b>cipher room</b> (maglocked), the <b>ambassador\'s office</b> (maglocked). Down the service stair: the basement - the security room and the archive.'],
    ['Security', 'Cameras over the hall, the stair and the first-floor corridor (they look longer at a uniform, but they look), a laser across the archive, the two maglocks, the alarm - run from the <b>security room</b> in the basement. The ambassador carries a <b>keycard</b>; there is a <b>dog</b> with the man on the back gate, a <b>radio</b> in the security room, an <b>engineer</b> in the basement.'],
    ['Objectives', 'Copy the <b>cipher keys</b> at the cipher room\'s terminal. Take the <b>ledger</b> from the ambassador\'s office. There is a trophy for doing it with no one seeing through your disguise.'],
  ],
  time: { date: [6, 12, 2026], hour: 21, minute: 15 }, night: true, faction: 'red', requires: 'HACKKIT', startDisguise: 'red',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'RCAM', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  extractName: 'the car on Linden Row',
  outside: { backdrop: 'city', mat: 'asphalt', margin: 16 },
  floors: {
    B: {
      y: -3.8, wallH: 3.0, wall: 'concrete2', floor: 'concrete', ceil: 'concrete2', lampPower: 0.6, lampEvery: 8,
      carve: { size: [W, H], ops: [
        ['room', 4, 4, 20, 14],                          // the archive
        ['room', 22, 4, 40, 14],                         // the security room
        ['room', 4, 16, 40, 18],                         // the basement corridor
        ['room', 34, 20, 40, 26],                        // the service stair's foot
      ], after: [
        ['cells', [[12, 15], [30, 15], [37, 19]], 'D'],
        ['cells', [[6, 6], [6, 9], [6, 12], [10, 6], [10, 9], [10, 12], [14, 6], [14, 9], [14, 12], [18, 6], [18, 12]], 'H'],
        ['cells', [[25, 6], [27, 6], [29, 6]], 'M'], ['cells', [[34, 10], [36, 12]], 'T'],
      ] },
    },
    G: {
      y: 0, wallH: 4.2, wall: 'plaster', wallTint: [0.92, 0.88, 0.8], floor: 'marble', ceil: 'plaster', lampPower: 0.95, lampColour: [1, 0.88, 0.7], lampEvery: 7,
      carve: { size: [W, H], ops: [
        ['room', 4, 4, 28, 22],                          // the reception hall
        ['room', 30, 4, 40, 12],                         // the kitchen
        ['room', 30, 14, 40, 26],                        // the service corridor and stair
        ['room', 4, 24, 16, 31],                         // the cloakroom
        ['room', 18, 24, 28, 31],                        // the lobby
      ], after: [
        ['cells', [[29, 8], [29, 18], [17, 27], [22, 23], [23, 23], [22, 32], [23, 32], [41, 20], [35, 13]], 'D'],
        ['cells', [[3, 8], [3, 13], [3, 18], [8, 3], [14, 3], [20, 3], [26, 3], [19, 32], [26, 32]], 'W'],
        ['cells', [[8, 8], [8, 17], [14, 12], [20, 8], [20, 17]], 'T'], ['room', 6, 21, 12, 21, 'K'],          // the hall's tables; the bar
        ['cells', [[11, 8], [11, 17], [24, 12]], 'P'],
        ['room', 32, 5, 38, 5, 'K'], ['cells', [[34, 9], [37, 9]], 'K'],                                           // the kitchen
        ['cells', [[6, 26], [6, 28], [6, 30], [10, 26], [10, 30]], 'H'],                                            // the cloakroom's rails
        ['cells', [[20, 26], [26, 26]], 'Z'],
      ] },
    },
    1: {
      y: 4.4, wallH: 3.4, wall: 'plaster', wallTint: [0.9, 0.86, 0.78], floor: 'wood', floorTint: [0.55, 0.38, 0.26], ceil: 'plaster', lampPower: 0.8, lampColour: [1, 0.88, 0.7], lampEvery: 7,
      carve: { size: [W, H], ops: [
        ['room', 4, 14, 40, 16],                         // the first-floor corridor
        ['room', 4, 4, 14, 12], ['room', 16, 4, 26, 12],  // offices
        ['room', 28, 4, 40, 12],                         // the ambassador's office
        ['room', 4, 18, 18, 26],                         // the cipher room
        ['room', 20, 18, 28, 26],                        // the landing (the grand stair comes up here)
        ['room', 30, 18, 40, 26],                        // the service stair's head
      ], after: [
        ['cells', [[9, 13], [21, 13], [34, 13], [11, 17], [24, 17], [35, 17]], 'D'],
        ['cells', [[3, 8], [3, 22], [8, 3], [21, 3], [33, 3], [38, 3]], 'W'],
        ['cells', [[7, 7], [10, 9], [19, 7], [23, 9]], 'T'], ['cells', [[34, 8]], 'T'], ['cells', [[38, 6], [38, 10]], 'H'], ['cells', [[31, 10]], 'Z'],
        ['cells', [[6, 20], [9, 20], [12, 20], [15, 20]], 'M'], ['cells', [[6, 25], [15, 25]], 'H'],
      ] },
    },
  },
  stairs: [
    { x: 23, y: 22, dir: 'N', len: 7, w: 2, from: 'G', to: '1', skip: false },     // the grand stair, from the hall up to the landing
    { x: 36, y: 25, dir: 'N', len: 6, w: 2, from: 'B', to: 'G' },                  // the service stair down
    { x: 38, y: 25, dir: 'N', len: 6, w: 2, from: 'G', to: '1' },                  // and up
  ],
  start: { x: 22.5, y: 34, floor: 'G', yaw: 0 },
  zones: [
    { id: 'hall', label: 'The embassy - the reception hall', at: [4, 4, 28, 22] },
    { id: 'kitchen', label: 'The embassy - the kitchen', at: [30, 4, 40, 12] },
    { id: 'service', label: 'The embassy - the service corridor', at: [30, 14, 40, 26] },
    { id: 'cloaks', label: 'The embassy - the cloakroom', at: [4, 24, 16, 31] },
    { id: 'lobby', label: 'The embassy - the lobby', at: [18, 24, 28, 31] },
    { id: 'amb', label: 'The embassy - the ambassador\'s office', at: [28, 4, 40, 12], floor: '1' },
    { id: 'cipher', label: 'The embassy - the cipher room', at: [4, 18, 18, 26], floor: '1' },
    { id: 'first', label: 'The embassy - the first floor', at: [0, 0, W - 1, H - 1], floor: '1' },
    { id: 'archive', label: 'The embassy - the archive', at: [4, 4, 20, 14], floor: 'B' },
    { id: 'secroom', label: 'The embassy - the security room', at: [22, 4, 40, 14], floor: 'B' },
    { id: 'base', label: 'The embassy - the basement', at: [0, 0, W - 1, H - 1], floor: 'B' },
    { id: 'row', label: 'Linden Row', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'amb', at: [34, 6, '1'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The ambassador', tint: [0.95, 0.95, 1.0], card: 'linden' },
    { id: 'h1', at: [10, 12, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'h2', at: [18, 15, 'G'], route: [[6, 15], [26, 15]], arms: 'pistol' },
    { id: 'h3', at: [26, 6, 'G'], arms: 'smg', rank: 'officer', temper: 'steady' },
    { id: 'door', at: [23, 28, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'k1', at: [35, 7, 'G'], arms: 'pistol', temper: 'cowardly', role: 'medic' },
    { id: 'gate', at: [42, 22, 'G'], route: [[42, 14], [42, 30]], arms: 'carbine', dog: true },
    { id: 'c1', at: [22, 15, '1'], route: [[6, 15], [39, 15]], arms: 'smg' },
    { id: 'c2', at: [12, 22, '1'], arms: 'pistol', temper: 'steady' },
    { id: 'c3', at: [27, 23, '1'], arms: 'carbine', rank: 'sergeant', temper: 'steady' },
    { id: 'sr', at: [32, 9, 'B'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'sr2', at: [36, 6, 'B'], arms: 'smg', shield: true, temper: 'steady' },
    { id: 'eng', at: [20, 17, 'B'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'ar', at: [8, 8, 'B'], arms: 'carbine' },
  ],
  pickups: [{ id: 'ledger', name: 'The ambassador\'s ledger', what: 'the ledger', at: [34, 8, '1'], table: false, h: 0.8, colour: [0.5, 0.15, 0.12] }],
  devices: [
    { id: 'c-hall', kind: 'camera', at: [4, 4, 'G'], face: [1, 1], net: 'linden' },
    { id: 'c-stair', kind: 'camera', at: [28, 18, '1'], face: [-1, -1], net: 'linden' },
    { id: 'c-corr', kind: 'camera', at: [40, 14, '1'], face: [-1, 0], net: 'linden' },
    { id: 'c-pin-amb', kind: 'camera', at: [40, 4, '1'], face: [-1, 1], net: 'linden', hidden: true },
    { id: 'm-cipher', kind: 'lock', at: [11, 17, '1'], net: 'linden' },
    { id: 'm-amb', kind: 'lock', at: [34, 13, '1'], net: 'linden' },
    { id: 'z-archive', kind: 'laser', at: [12, 4, 'B'], to: [12, 14], net: 'linden' },
    { id: 'a-bell', kind: 'alarm', at: [16, 22, 'G'], face: [0, -1], net: 'linden' },
  ],
  terminals: [
    { id: 'sec', name: 'the security room\'s console', at: [24, 10, 'B'], face: [1, 0], time: 6, net: 'linden' },
    { id: 'keys', name: 'the cipher machine', at: [9, 24, '1'], face: [0, -1], time: 8, reveal: 20, verb: 'Copy the keys from', doing: 'Copying',
      said: 'The cipher keys, copied: every message this embassy sends this month, ours to read. The cameras put every red on your radar for 20 seconds.' },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'keys', text: 'Copy the cipher keys (the cipher room, the first floor)' },
    { id: 'o2', kind: 'take', ref: 'ledger', text: 'Take the ambassador\'s ledger (his office, the first floor)' },
  ],
};
