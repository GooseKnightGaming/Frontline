// FRONTLINE - Level 74, Kessin Harbour (first draft, M6.96; the coast). With the paymaster taken and his money stopped,
// his agents on the coast run - two motor boats at the Kessin agents' moorings, fuelled and crewed, to slip out of the
// harbour mouth before dawn. Stop both boats before they are out of the harbour, and take the agents' cash book from
// their house on the quay.
const W = 52, H = 40;
export default {
  id: 'harbour', no: 74, title: 'Kessin Harbour', place: 'the agents\' moorings, Kessin harbour',
  where: 'Kessin harbour, the north quay. 04:30, a calm sea, the boats\' engines warm.',
  brief: [
    ['The job', 'With the paymaster taken, his agents on the coast are running. <b>Two motor boats</b> are at their moorings on the north quay, fuelled and crewed, waiting to slip out of the harbour mouth to the south. <b>Stop both</b> before they are out: a helmsman down will do it, or a wreck. Take the agents\' <b>cash book</b> from their house on the quay. It names who they were paying.'],
    ['The place', 'Along the north quay are the <b>harbour master\'s office</b>, the <b>agents\' house</b> and the boat shed. The boats are moored in the basin below the quay, and the harbour mouth is due south. You come in along the west quay.'],
    ['Security', 'Patrols on the quay, cameras on the buildings, the alarm. The radio is in the harbour master\'s office, the engineer in the boat shed. The first boat goes in about two minutes, the second a minute after.'],
    ['Objectives', '<b>Stop the first boat</b>. <b>Stop the second boat</b>. Take the <b>cash book</b> (the agents\' house). Out along the west quay.'],
  ],
  epilogue: {
    success: 'Neither boat clears the harbour mouth, and the cash book names forty-one people on the coast who took the reds\' money. Some of them are surprised to find out who they were working for.',
    partial: 'One boat got out, or the cash book stayed on the quay. The agents who got away will be somebody else\'s problem in another harbour.',
  },
  time: { date: [5, 4, 2027], hour: 4, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.1, 0.12, 0.16, 25, 180], ambient: [0.22, 0.24, 0.3] },
  extractName: 'the west quay', extract: { x: 1, y: 10, floor: 'G' },
  outside: { backdrop: 'city', mat: 'concrete', margin: 12 },
  floors: {
    G: {
      y: 0, wallH: 3.4, wall: 'brick', wallTint: [0.55, 0.5, 0.45], floor: 'wood', ceil: 'plaster', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 6,
      channel: 4, surf: 0.6,
      carve: { size: [W, H], ops: [
        ['room', 6, 3, 16, 8],                          // the harbour master's office
        ['room', 20, 3, 30, 8],                         // the agents' house
        ['room', 34, 3, 46, 8],                         // the boat shed
      ], after: [
        ['cells', [[11, 9], [25, 9], [40, 9]], 'D'],
        ['cells', [[8, 2], [14, 2], [22, 2], [28, 2], [36, 2], [44, 2], [5, 5], [47, 5]], 'W'],
        ['cells', [[8, 5], [14, 7]], 'T'], ['cells', [[15, 4]], 'H'],
        ['cells', [[23, 5], [27, 7]], 'T'], ['cells', [[29, 4]], 'Y'],
        ['cells', [[36, 5], [44, 5]], 'M'], ['cells', [[42, 7]], 'T'],
        // the basin, out to the harbour mouth (south); the quay's edge railed but at the moorings
        ['room', 2, 12, 49, H - 1, '~'], ['room', 2, 11, 49, 11, '='], ['cells', [[20, 11], [21, 11], [34, 11], [35, 11]], '.'],
        ['cells', [[4, 10], [17, 10], [31, 10], [48, 10]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { level, mid } = kit;
    for (const [x, y] of [[11, 10], [25, 10], [40, 10], [1, 12]]) level.lights.push({ pos: [mid(x), 5, mid(y)], range: 14, intensity: 1, color: [1, 0.85, 0.6], street: true });
  },
  vehicles: [
    { id: 'boat1', kind: 'boat', at: [20, 15], yaw: Math.PI, paint: 'white', hp: 520, path: [[20, 15], [20, 24], [22, 32], [22, 39]],
      speed: 9, goal: 'escape', wait: 120, name: 'The first boat',
      crew: [{ id: 'h1', at: [-0.4, 0.6] }, { id: 'a1', at: [0, -2.2] }] },
    { id: 'boat2', kind: 'boat', at: [35, 15], yaw: Math.PI, paint: 'olive', hp: 520, path: [[35, 15], [35, 24], [32, 32], [32, 39]],
      speed: 9, goal: 'escape', wait: 180, name: 'The second boat',
      crew: [{ id: 'h2', at: [-0.4, 0.6] }, { id: 'a2', at: [0, -2.2] }] },
  ],
  start: { x: 2, y: 4, floor: 'G', yaw: Math.PI },
  zones: [
    { id: 'hm', label: 'Kessin harbour - the harbour master\'s office', at: [6, 3, 16, 8] },
    { id: 'house', label: 'Kessin harbour - the agents\' house', at: [20, 3, 30, 8] },
    { id: 'shed', label: 'Kessin harbour - the boat shed', at: [34, 3, 46, 8] },
    { id: 'basin', label: 'Kessin harbour - the basin', at: [2, 12, 49, H - 1] },
    { id: 'quay', label: 'Kessin harbour - the north quay', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'h1', at: [20, 15, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'a1', at: [20, 16, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'h2', at: [35, 15, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'a2', at: [35, 16, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'rad', at: [13, 6, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio', name: 'The harbour master' },
    { id: 'hs', at: [25, 6, 'G'], arms: 'smg', temper: 'bold' },
    { id: 'eng', at: [40, 6, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'q1', at: [30, 10, 'G'], route: [[16, 10], [46, 10]], arms: 'carbine', dog: true },
    { id: 'q2', at: [44, 0, 'G'], route: [[18, 0], [50, 0]], arms: 'carbine' },
  ],
  pickups: [{ id: 'cash', name: 'The agents\' cash book', what: 'the cash book', at: [23, 5, 'G'], table: true, colour: [0.35, 0.25, 0.2] }],
  devices: [
    { id: 'c-hm', kind: 'camera', at: [17, 9, 'G'], face: [1, 1], net: 'kessinq' },
    { id: 'c-shed', kind: 'camera', at: [47, 9, 'G'], face: [-1, 1], net: 'kessinq' },
    { id: 'a-harb', kind: 'alarm', at: [31, 9, 'G'], face: [0, 1], net: 'kessinq' },
  ],
  terminals: [{ id: 'sec', name: 'the harbour master\'s console', at: [8, 5, 'G'], face: [0, 1], time: 6, net: 'kessinq' }],
  intel: [
    { id: 'tide', at: [14, 7, 'G'], kind: 'Tide table', title: 'The harbour master\'s tide table', text: ['High water 04:40. Two boats out, "fishing". Neither has a net aboard.'] },
    { id: 'note', at: [27, 7, 'G'], kind: 'Note', title: 'A note in the agents\' house', text: ['If the paymaster does not telephone by four, we go. Do not wait for the others.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'stop', ref: 'boat1', text: 'Stop the first boat before it is out of the harbour' },
    { id: 'o2', kind: 'stop', ref: 'boat2', text: 'Stop the second boat before it is out of the harbour' },
    { id: 'o3', kind: 'take', ref: 'cash', text: 'Take the cash book (the agents\' house)' },
  ],
};
