// FRONTLINE - Level 67, the Council House (first draft, M6.85; the end of the north). The telegraph log said it: the
// council meets at its house on Nordvik's hill in three days, all of them. Tonight. Four members round the table, and
// the chairman who signs himself "N". Mark the four, take the chairman alive, and take the minutes of the meeting.
const W = 50, H = 40;
export default {
  id: 'council', no: 67, title: 'The Council House', place: 'the council\'s house, on Nordvik\'s hill',
  where: 'The council\'s house, Nordvik. 22:40, the meeting in session, snow on the garden.',
  brief: [
    ['The job', 'The reds\' <b>council</b> of the north meets tonight at its house on the hill: the council that sent the handler and the five. <b>Mark the four members</b> round the table in the <b>council room</b>. Aim at each for a second, through the windows if need be. <b>Take the chairman alive</b>: he signs himself "N", and he is in his study upstairs until he comes down to close the meeting. Take the <b>minutes</b> of the meeting from the secretary\'s desk.'],
    ['The place', 'A walled garden on the hilltop, its <b>gate</b> on the south side. The house: the <b>council room</b> (the long table, its windows on the garden), the hall and the secretary\'s office downstairs; the <b>chairman\'s study</b> and the bedrooms upstairs. The guardhouse is by the gate.'],
    ['Security', 'Guards in the garden and the house, a dog, cameras on the house, the alarm. The radio is in the guardhouse, the engineer in the cellar office. A dead member cannot be watched, and a dead chairman cannot talk.'],
    ['Objectives', '<b>Mark the four council members</b>. <b>Take the chairman alive</b> (his study, upstairs). Take the <b>minutes</b> (the secretary\'s office). Out by the gate, south.'],
  ],
  epilogue: {
    success: 'The council of the north does not meet again. Four faces on Ghost\'s file and the chairman in Ghost\'s hands; the minutes of the meeting name every operation they had planned for the spring. In Varnholm the spring is quiet.',
    partial: 'Some of the council, or the minutes, not all of it. The ones Ghost missed will find somewhere new to meet, and somebody new to sign as N.',
  },
  time: { date: [19, 2, 2027], hour: 22, minute: 40 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'snow',
  startLoadout: { primary: 'LR7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SCOPE8'], backup: ['SILENCER'] } },
  atmos: { fog: [0.3, 0.33, 0.4, 30, 200], ambient: [0.32, 0.34, 0.42] },
  extractName: 'the gate, south', extract: { x: 25, y: 39, floor: 'G', van: [5, 1] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'plaster', wallTint: [0.85, 0.82, 0.76], floor: 'wood', ceil: 'plaster', lampPower: 0.75, lampColour: [1, 0.88, 0.65], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 12, 8, 26, 16],                        // the council room
        ['room', 28, 8, 34, 16],                        // the hall
        ['room', 36, 8, 40, 16],                        // the secretary's office
        ['room', 20, 30, 28, 34],                       // the guardhouse
      ], after: [
        // the garden wall all round, its gate (x 24 - 26) in the south side
        ['room', 2, 2, 47, 2, 'J'], ['room', 2, 2, 2, 37, 'J'], ['room', 47, 2, 47, 37, 'J'], ['room', 2, 37, 23, 37, 'J'], ['room', 27, 37, 47, 37, 'J'],
        // (walls a square out from each room; the house's three share theirs)
        ['cells', [[27, 12], [35, 12], [31, 17], [24, 29], [19, 32]], 'D'],
        ['cells', [[15, 17], [19, 17], [23, 17], [11, 10], [11, 14], [15, 7], [23, 7], [38, 17], [41, 12]], 'W'],
        // the long table; the hall's stand; the secretary's desks
        ['room', 15, 11, 23, 13, 'T'], ['cells', [[25, 9]], 'K'], ['cells', [[29, 9], [33, 15]], 'H'],
        ['cells', [[37, 10], [39, 14]], 'T'], ['cells', [[39, 9]], 'H'],
        ['cells', [[22, 32], [26, 33]], 'T'], ['cells', [[27, 31]], 'M'],
        // the garden: hedges and urns
        ['cells', [[8, 22], [16, 24], [34, 24], [42, 22], [8, 30], [42, 30], [14, 34], [36, 34]], 'C'],
      ] },
    },
    1: {
      y: 3.8, wallH: 3.0, wall: 'plaster', wallTint: [0.84, 0.8, 0.74], floor: 'wood', ceil: 'plaster', lampPower: 0.55, lampColour: [1, 0.88, 0.65], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 12, 8, 22, 16],                        // the chairman's study
        ['room', 24, 8, 34, 16],                        // the landing and bedrooms
      ], after: [
        ['cells', [[23, 12]], 'D'],
        ['cells', [[15, 17], [19, 17], [11, 12], [15, 7], [19, 7], [27, 17], [31, 17], [35, 12]], 'W'],
        ['cells', [[16, 11], [20, 14]], 'T'], ['cells', [[13, 9]], 'H'],
        ['cells', [[26, 10], [32, 10], [26, 15]], 'Y'],
      ] },
    },
  },
  stairs: [{ x: 32, y: 15, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    for (const [x0, y0, x1, y1] of [[2, 2, 48, 3], [2, 2, 3, 38], [47, 2, 48, 38], [2, 37, 24, 38], [27, 37, 48, 38]]) box([x0 * C, 0, y0 * C], [x1 * C, 3, y1 * C], 'concrete2', { tint: [0.55, 0.53, 0.5] });
    box([11 * C, 7, 7 * C], [42 * C, 7.3, 18 * C], 'wood', { tint: [0.3, 0.22, 0.18] });
    for (const [x, y] of [[19, 19], [31, 19], [25, 27], [25, 36], [8, 6], [42, 6]]) level.lights.push({ pos: [mid(x), 4, mid(y)], range: 12, intensity: 0.9, color: [1, 0.88, 0.65], street: true });
  },
  start: { x: 6, y: 39, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'room', label: 'The Council House - the council room', at: [12, 8, 26, 16] },
    { id: 'hall', label: 'The Council House - the hall', at: [28, 8, 34, 16] },
    { id: 'sec', label: 'The Council House - the secretary\'s office', at: [36, 8, 40, 16] },
    { id: 'study', label: 'The Council House - the chairman\'s study', at: [12, 8, 22, 16], floor: '1' },
    { id: 'beds', label: 'The Council House - upstairs', at: [24, 8, 34, 16], floor: '1' },
    { id: 'guard', label: 'The Council House - the guardhouse', at: [20, 30, 28, 34] },
    { id: 'garden', label: 'The Council House - the garden', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'm1', at: [16, 10, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'A council member (the army)', tint: [0.35, 0.4, 0.3] },
    { id: 'm2', at: [20, 10, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'A council member (the treasury)', tint: [0.3, 0.3, 0.35] },
    { id: 'm3', at: [16, 14, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'A council member (the police)', tint: [0.25, 0.3, 0.4] },
    { id: 'm4', at: [22, 14, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'A council member (the railways)', tint: [0.45, 0.35, 0.3] },
    { id: 'chair', at: [18, 12, '1'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The chairman, "N"', tint: [0.2, 0.2, 0.22] },
    { id: 'cr', at: [25, 14, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'hl', at: [30, 11, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'up', at: [28, 12, '1'], route: [[25, 12], [33, 12]], arms: 'smg' },
    { id: 'g1', at: [10, 20, 'G'], route: [[5, 20], [44, 20]], arms: 'carbine', dog: true },
    { id: 'g2', at: [44, 28, 'G'], route: [[44, 5], [44, 34]], arms: 'carbine' },
    { id: 'g3', at: [6, 28, 'G'], route: [[5, 5], [5, 34]], arms: 'carbine' },
    { id: 'gate', at: [25, 36, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'rad', at: [22, 31, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [38, 12, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
  ],
  civilians: [
    { id: 'secretary', at: [38, 14, 'G'], yaw: Math.PI, title: 'The council\'s secretary', tint: [0.9, 0.85, 0.95], says: ['I take the minutes. That is all I do. I do not even read them.', 'The chairman comes down to close the meeting. He has not come down yet.'] },
  ],
  pickups: [{ id: 'minutes', name: 'The minutes of the meeting', what: 'the minutes', at: [37, 10, 'G'], table: true, colour: [0.9, 0.88, 0.8] }],
  devices: [
    { id: 'c-front', kind: 'camera', at: [26, 17, 'G'], face: [-1, 1], net: 'council' },
    { id: 'c-side', kind: 'camera', at: [41, 17, 'G'], face: [1, 1], net: 'council' },
    { id: 'a-council', kind: 'alarm', at: [28, 17, 'G'], face: [0, 1], net: 'council' },
  ],
  terminals: [{ id: 'sec', name: 'the guardhouse console', at: [26, 33, 'G'], face: [0, -1], time: 6, net: 'council' }],
  intel: [
    { id: 'agenda', at: [39, 14, 'G'], kind: 'Agenda', title: 'Tonight\'s agenda', text: ['1. Varnholm. 2. Who answers for Varnholm. 3. The spring.', 'Under item 2, in the chairman\'s hand: "Not me."'] },
    { id: 'letter', at: [20, 14, '1'], kind: 'Letter', title: 'A letter on the chairman\'s desk', text: ['From Varnholm, unsigned: "They know your initial. They will know your name by spring."', 'The chairman has written across it: "Then let them come."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'identify', refs: ['m1', 'm2', 'm3', 'm4'], text: 'Mark the four council members (aim at each for a second)' },
    { id: 'o2', kind: 'capture', ref: 'chair', text: 'Take the chairman alive (his study, upstairs)' },
    { id: 'o3', kind: 'take', ref: 'minutes', text: 'Take the minutes (the secretary\'s office)' },
  ],
};
