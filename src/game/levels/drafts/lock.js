// FRONTLINE - Level 53, Varnholm Lock (first draft, M6.66; the end of the river trail). The codes case from the
// roofs holds the reds' river signal codes for the month. Their signal station at Varnholm Lock gives every boat on
// the river its orders, and works the lock between the river and the estuary. With the codes, send their patrol
// boats a stand-down for the night and open the lock: Ghost's boats go through to the sea, and the reds' do not
// follow.
const W = 56, H = 40;
export default {
  id: 'lock', no: 53, title: 'Varnholm Lock', place: 'the lock and signal station, Varnholm',
  where: 'Varnholm Lock, on the river below the old quarter. 02:10, river mist.',
  brief: [
    ['The job', 'The codes case from the roofs held the reds\' <b>river signal codes</b>. Their <b>signal station</b> at Varnholm Lock gives every patrol boat its orders, and works the lock. Use the codes: send their boats a <b>stand-down</b> for tonight, then <b>open the lock gates</b>. Ghost\'s boats go through to the sea while the reds\' boats sit at their moorings.'],
    ['The place', 'The river runs east to west through the lock: one chamber, a gate at each end, and a walkway on top of each gate. These are the only ways across. North bank: the <b>control house</b> (the gate controls downstairs, the <b>signal room</b> upstairs), the radio hut, the barracks hut. South bank: the <b>lock-keeper\'s cottage</b> and a warehouse.'],
    ['Security', 'Cameras on the north bank, the control house maglocked (the lockmaster\'s keycard), the alarm. The radio is in the radio hut, and there\'s an engineer with it. A patrol launch goes round the west reach with a man on its bow. The lock-keeper and his wife are not reds; they\'re told to stay indoors.'],
    ['Objectives', 'Send the <b>stand-down</b> (the signal room, upstairs in the control house). <b>Open the lock gates</b> (the control house, downstairs). Out by Ghost\'s boat, at the west jetty on the south bank.'],
  ],
  epilogue: {
    success: 'By three the gates stand open and the river runs level through the lock. Ghost\'s boats go through without lights, one after another, and are at sea by first light. The reds\' patrol boats stay at their moorings until dawn, as ordered. The river is open.',
    partial: 'One of the two is done, and one is not: either the patrol boats are still out, or the lock is still shut. Ghost\'s boats wait for another night, and the reds will have changed their codes by then.',
  },
  time: { date: [17, 1, 2027], hour: 2, minute: 10 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.14, 0.15, 0.17, 12, 95], ambient: [0.24, 0.25, 0.29] },
  extractName: 'Ghost\'s boat at the west jetty', extract: { x: 3, y: 27, floor: 'G' },
  outside: { backdrop: 'city', mat: 'concrete', margin: 12 },
  floors: {
    G: {
      y: 0, wallH: 3.4, wall: 'brick', wallTint: [0.6, 0.5, 0.45], floor: 'concrete', ceil: 'plaster', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 6,
      channel: 4.5, surf: 0.5,
      carve: { size: [W, H], ops: [
        ['room', 20, 4, 35, 12],                        // the control house
        ['room', 39, 5, 46, 11],                        // the radio hut
        ['room', 5, 4, 15, 11],                         // the barracks hut
        ['room', 23, 28, 31, 34],                       // the lock-keeper's cottage
        ['room', 38, 28, 50, 35],                       // the warehouse
      ], after: [
        ['cells', [[27, 13], [36, 10], [42, 12], [10, 12], [27, 27], [44, 27]], 'D'],      // (the control house: the front maglocked, a side door east)
        ['cells', [[24, 3], [31, 3], [19, 8], [8, 3], [12, 3], [43, 4], [22, 31], [32, 31], [37, 31]], 'W'],
        // the river: the west reach, the lock's chamber, the east reach; the gates (x 21 and x 34) are the ways across
        ['room', 2, 16, 20, 23, '~'], ['room', 22, 18, 33, 21, '~'], ['room', 35, 16, 53, 23, '~'],
        ['room', 2, 15, 20, 15, '='], ['room', 35, 15, 53, 15, '='], ['room', 2, 24, 20, 24, '='], ['room', 35, 24, 53, 24, '='],
        ['room', 22, 17, 33, 17, '='], ['room', 22, 22, 33, 22, '='],
        ['cells', [[10, 15], [45, 15], [4, 24], [12, 24], [46, 24]], '.'],          // gaps in the rails: steps down to the water
        // inside: the gate controls, the barracks' bunks, the cottage, the warehouse's crates
        ['cells', [[33, 6], [25, 10]], 'T'], ['cells', [[29, 6]], 'K'],
        ['cells', [[7, 6], [7, 9], [13, 6], [13, 9]], 'Y'],
        ['cells', [[40, 7], [43, 7]], 'T'], ['cells', [[45, 9]], 'M'],
        ['cells', [[25, 30], [29, 33]], 'T'], ['cells', [[30, 30]], 'Y'],
        ['cells', [[40, 30], [41, 30], [46, 30], [40, 33], [47, 33], [48, 33]], 'C'],
        // outside: bollards, stacked crates on the quays
        ['cells', [[17, 13], [38, 13], [18, 25], [52, 25], [6, 13], [14, 25]], 'C'],
      ] },
    },
    1: {
      y: 3.6, wallH: 3, wall: 'brick', wallTint: [0.6, 0.5, 0.45], floor: 'wood', ceil: 'plaster', lampPower: 0.45, lampColour: [1, 0.85, 0.6], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 20, 4, 35, 12],                        // the signal room
      ], after: [
        ['cells', [[24, 13], [28, 13], [32, 13], [24, 3], [31, 3], [36, 8]], 'W'],
        ['cells', [[29, 5], [33, 10]], 'T'], ['cells', [[26, 10]], 'K'],
      ] },
    },
  },
  stairs: [{ x: 21, y: 10, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the two gates: black timber below each walkway, a handrail each side of it
    for (const gx of [21, 34]) {
      box([gx * C + 0.2, -4.5, 16 * C], [gx * C + C - 0.2, -0.05, 24 * C], 'wood', { tint: [0.25, 0.2, 0.16] });
      for (const z of [0.1, C - 0.15]) box([gx * C + z, 0, 16 * C], [gx * C + z + 0.05, 1.05, 24 * C], 'metal', { tint: [0.75, 0.7, 0.2], solid: false });
    }
    // the signal mast on the control house
    box([mid(33) - 0.15, 6.6, mid(5) - 0.15], [mid(33) + 0.15, 13, mid(5) + 0.15], 'metal', { tint: [0.5, 0.5, 0.55] });
    level.lights.push({ pos: [mid(33), 13.2, mid(5)], range: 10, intensity: 1.2, color: [1, 0.3, 0.25] });
    for (const [x, y] of [[18, 14], [37, 14], [21, 25], [36, 25], [4, 26], [52, 13]]) level.lights.push({ pos: [mid(x), 5, mid(y)], range: 13, intensity: 0.9, color: [1, 0.85, 0.6], street: true });
  },
  vehicles: [
    // the patrol launch: round and round the west reach, a man on its bow (a small launch: it turns tight)
    { id: 'patrol', kind: 'boat', at: [6, 17], yaw: -Math.PI / 2, paint: 'olive', hp: 600, loop: true, speed: 4, tune: { turn: 1.7 },
      path: [[6, 17], [15, 17], [18, 19.5], [15, 22], [6, 22], [3, 19.5], [6, 17]],
      crew: [{ id: 'pb_helm', at: [-0.4, 0.6] }, { id: 'pb_bow', at: [0, -2.2] }] },
  ],
  start: { x: 54, y: 37, floor: 'G', yaw: 0 },
  zones: [
    { id: 'control', label: 'Varnholm Lock - the control house', at: [20, 4, 35, 12] },
    { id: 'signal', label: 'Varnholm Lock - the signal room', at: [20, 4, 35, 12], floor: '1' },
    { id: 'radio', label: 'Varnholm Lock - the radio hut', at: [38, 5, 45, 11] },
    { id: 'barr', label: 'Varnholm Lock - the barracks hut', at: [5, 4, 15, 11] },
    { id: 'cottage', label: 'Varnholm Lock - the lock-keeper\'s cottage', at: [23, 28, 31, 34] },
    { id: 'ware', label: 'Varnholm Lock - the warehouse', at: [38, 28, 50, 35] },
    { id: 'gates', label: 'Varnholm Lock - the lock', at: [21, 15, 34, 24] },
    { id: 'river', label: 'Varnholm Lock - the river', at: [2, 15, 53, 24] },
    { id: 'out', label: 'Varnholm Lock', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'pb_helm', at: [6, 17, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'pb_bow', at: [6, 18, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'lm', at: [30, 9, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', card: 'lock', name: 'The lockmaster' },
    { id: 'sig', at: [27, 7, '1'], arms: 'pistol', rank: 'specialist', temper: 'cowardly', name: 'The signaller' },
    { id: 'sig2', at: [32, 9, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'rad', at: [42, 9, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [39, 9, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'gate_e', at: [34, 20, 'G'], route: [[34, 14], [34, 25]], arms: 'carbine' },
    { id: 'gate_w', at: [21, 18, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'n1', at: [16, 14, 'G'], route: [[3, 14], [52, 14]], arms: 'smg' },
    { id: 's1', at: [35, 26, 'G'], route: [[8, 26], [44, 26]], arms: 'carbine', dog: true },
    { id: 'bk', at: [10, 8, 'G'], arms: 'smg', temper: 'bold' },
    { id: 'wh', at: [44, 32, 'G'], route: [[40, 32], [48, 32]], arms: 'carbine' },
  ],
  // (the lock-keeper and his wife: not reds, and not happy to have them)
  civilians: [
    { id: 'keeper', at: [27, 31, 'G'], yaw: 0, title: 'The lock-keeper', tint: [0.85, 0.75, 0.6], says: ['Thirty years I\'ve worked this lock. Now I\'m not allowed in my own control house.', 'The gate controls are downstairs. The big wheel first, then the lever. They won\'t have changed it. They don\'t know how.', 'The lockmaster keeps the door card on his belt.'] },
    { id: 'wife', at: [25, 32, 'G'], yaw: Math.PI / 2, title: 'The lock-keeper\'s wife', tint: [0.95, 0.8, 0.85], says: ['Keep your voice down. The one with the dog comes past the window.', 'Whatever you\'re doing, be quick about it.'] },
  ],
  devices: [
    { id: 'c-north', kind: 'camera', at: [18, 14, 'G'], face: [1, 1], net: 'lock' },
    { id: 'c-gate', kind: 'camera', at: [37, 14, 'G'], face: [-1, 1], net: 'lock' },
    { id: 'c-sig', kind: 'camera', at: [35, 12, '1'], face: [-1, -1], net: 'lock' },
    { id: 'm-ctl', kind: 'lock', at: [27, 13, 'G'], net: 'lock' },
    { id: 'a-lock', kind: 'alarm', at: [33, 13, 'G'], face: [0, 1], net: 'lock' },
  ],
  terminals: [
    { id: 'sec', name: 'the radio hut console', at: [45, 7, 'G'], face: [-1, 0], time: 6, net: 'lock' },
    { id: 'standdown', name: 'the signal desk', at: [29, 6, '1'], face: [0, 1], time: 8, reveal: 20, verb: 'Send', doing: 'Sending',
      said: 'The stand-down goes out in their own codes: every patrol boat on the river to its moorings until dawn. Every red here is on your radar for 20 seconds.' },
    { id: 'gates', name: 'the gate controls', at: [33, 7, 'G'], face: [-1, 0], time: 10, verb: 'Open', doing: 'Opening',
      said: 'The wheel, then the lever. Somewhere under the walkways the gates start to move, and the river comes through.' },
  ],
  intel: [
    { id: 'log', at: [25, 10, 'G'], kind: 'Log', title: 'The lock log', text: ['Every boat through the lock, by name and hour. The last three nights are all red patrol boats, and one barge, "Kessin, papers in order".', 'The keeper\'s hand stops on the 3rd. After that the writing is someone else\'s.'] },
    { id: 'orders', at: [33, 10, '1'], kind: 'Orders', title: 'Orders for the signal room', text: ['A stand-down is valid only in the month\'s codes. The codes are carried by hand from the old quarter and nobody else sees them.', 'If the case does not arrive, keep every boat on the river and wake the lockmaster.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'standdown', text: 'Send the stand-down (the signal room, upstairs)' },
    { id: 'o2', kind: 'hack', ref: 'gates', text: 'Open the lock gates (the control house, downstairs)' },
  ],
};
