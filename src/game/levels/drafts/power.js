// FRONTLINE - Level 58, Holm Power Station (first draft, M6.76; the handler's first order). The handler's orders
// name three things the reds mean to do in Varnholm. The first: a blackout. On the night of the 2nd, the city's power
// goes off from Holm Power Station for six hours, and in the dark they move whatever they want through the streets.
// Their men already run the station. Lock them out of the grid controls before the night comes.
const W = 58, H = 34;
export default {
  id: 'power', no: 58, title: 'Holm Power Station', place: 'Holm Power Station, on the river',
  where: 'Holm Power Station. 22:15, two nights before the blackout, the turbines running.',
  brief: [
    ['The job', 'The first of the handler\'s three orders: a <b>blackout</b>. Varnholm goes dark for six hours, from Holm Power Station, and the reds move what they like through the streets. Their men run the station already. In the <b>control room</b> upstairs, <b>lock them out of the grid controls</b>. Take the <b>blackout order</b> from the shift office: it says what they mean to move. And if you can, bring out the <b>chief engineer</b>, who would not do it. They have him shut in the turbine hall\'s store.'],
    ['The place', 'The <b>turbine hall</b> (three turbines, the noise of them), its store at the south-west corner; across the lane, the office block: the <b>shift office</b>, the stair hall and the locker room downstairs, and the <b>control room</b> over all three. The switchyard is east, transformers in rows.'],
    ['Security', 'Cameras on the yard and in the control room, the store maglocked (the sergeant\'s keycard), the alarm. The radio is in the shift office, and the engineer they brought is in the turbine hall. Two of the station\'s own men are still on shift. They are not reds.'],
    ['Objectives', '<b>Lock out the grid controls</b> (the control room, upstairs). Take the <b>blackout order</b> (the shift office). If you can, bring out <b>the chief engineer</b> (the store). Out the way you came, south-west.'],
  ],
  epilogue: {
    success: 'On the night of the 2nd, Varnholm\'s lights stay on. Three lorries wait in a yard by the docks until dawn, then go back the way they came, still loaded. The blackout order names what was in them, and Ghost goes to look.',
    partial: 'The lights may stay on, or they may not. Either way the reds know someone has been in their station, and the order they wrote will not be the order they keep.',
  },
  time: { date: [31, 1, 2027], hour: 22, minute: 15 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.1, 0.11, 0.14, 25, 170], ambient: [0.23, 0.24, 0.28] },
  extractName: 'the way you came, south-west', extract: { x: 2, y: 32, floor: 'G' },
  outside: { backdrop: 'city', mat: 'concrete', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.4, wall: 'concrete2', wallTint: [0.7, 0.7, 0.68], floor: 'concrete', ceil: 'metal', lampPower: 0.7, lampColour: [0.95, 0.95, 1], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 4, 4, 28, 20],                         // the turbine hall
        ['room', 4, 24, 12, 29],                        // its store
        ['room', 33, 4, 44, 10],                        // the shift office
        ['room', 33, 13, 38, 18],                       // the stair hall
        ['room', 41, 13, 44, 18],                       // the locker room
      ], after: [
        // (walls a square out from each room; lanes between the buildings two squares wide)
        ['cells', [[29, 8], [16, 21], [13, 26], [32, 6], [32, 16], [35, 19], [42, 19]], 'D'],
        // the turbines, the hall's benches and crates; the store's shelves
        ['room', 7, 9, 11, 12, 'M'], ['room', 14, 9, 18, 12, 'M'], ['room', 21, 9, 25, 12, 'M'],
        ['cells', [[6, 17], [12, 17], [20, 17], [26, 6]], 'C'], ['cells', [[27, 17]], 'T'],
        ['room', 5, 28, 11, 28, 'H'],
        ['cells', [[35, 6], [39, 6], [43, 9]], 'T'], ['cells', [[40, 9]], 'K'],
        ['cells', [[44, 14], [44, 17]], 'H'], ['cells', [[42, 16]], 'Y'],
        // the switchyard: transformers in rows
        ['cells', [[49, 5], [49, 9], [49, 13], [49, 17], [53, 5], [53, 9], [53, 13], [53, 17]], 'M'],
        ['cells', [[40, 24], [20, 25], [30, 28]], 'C'],
      ] },
    },
    1: {
      y: 3.8, wallH: 3.2, wall: 'concrete2', wallTint: [0.72, 0.72, 0.7], floor: 'tile', floorTint: [0.55, 0.58, 0.6], ceil: 'plaster', lampPower: 0.6, lampColour: [0.95, 0.95, 1], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 33, 4, 44, 18],                        // the control room
      ], after: [
        ['room', 37, 5, 43, 5, 'K'], ['cells', [[38, 9], [42, 9], [42, 15]], 'T'], ['cells', [[44, 12]], 'H'],
      ] },
    },
  },
  stairs: [{ x: 34, y: 17, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the turbine hall's chimney, and the switchyard's gantries
    box([mid(26) - 1.2, 3.4, mid(6) - 1.2], [mid(26) + 1.2, 22, mid(6) + 1.2], 'brick', { tint: [0.5, 0.4, 0.35] });
    for (const x of [49, 53]) box([mid(x) - 0.1, 0, 4 * C], [mid(x) + 0.1, 6, 4 * C + 0.2], 'metal', { tint: [0.6, 0.6, 0.62], solid: false });
    for (const [x, y] of [[30, 3], [30, 22], [47, 21], [16, 23], [2, 30], [51, 26]]) level.lights.push({ pos: [mid(x), 5.5, mid(y)], range: 15, intensity: 1, color: [0.95, 0.95, 1], street: true });
  },
  start: { x: 2, y: 32, floor: 'G', yaw: Math.PI },
  zones: [
    { id: 'hall', label: 'Holm Power Station - the turbine hall', at: [4, 4, 28, 20] },
    { id: 'store', label: 'Holm Power Station - the store', at: [4, 24, 12, 29] },
    { id: 'shift', label: 'Holm Power Station - the shift office', at: [33, 4, 44, 10] },
    { id: 'stair', label: 'Holm Power Station - the stair hall', at: [33, 13, 38, 18] },
    { id: 'lock', label: 'Holm Power Station - the locker room', at: [41, 13, 44, 18] },
    { id: 'ctl', label: 'Holm Power Station - the control room', at: [33, 4, 44, 18], floor: '1' },
    { id: 'yard', label: 'Holm Power Station - the switchyard', at: [46, 0, W - 1, H - 1] },
    { id: 'out', label: 'Holm Power Station', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'sgt', at: [16, 15, 'G'], route: [[6, 15], [27, 15]], arms: 'smg', rank: 'sergeant', temper: 'steady', card: 'holm', name: 'The sergeant' },
    { id: 'eng', at: [20, 7, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'th', at: [8, 6, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'rad', at: [41, 7, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'so', at: [36, 8, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The shift officer' },
    { id: 'c1', at: [40, 12, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'c2', at: [36, 15, '1'], route: [[34, 11], [43, 11]], arms: 'smg' },
    { id: 'lane', at: [30, 12, 'G'], route: [[30, 2], [30, 22]], arms: 'carbine' },
    { id: 'yd', at: [51, 11, 'G'], route: [[51, 3], [51, 20]], arms: 'carbine', dog: true },
    { id: 'p1', at: [20, 23, 'G'], route: [[15, 23], [45, 23]], arms: 'carbine' },
    { id: 'p2', at: [56, 15, 'G'], route: [[56, 3], [56, 28]], arms: 'smg' },
  ],
  civilians: [
    { id: 'fitter', at: [13, 17, 'G'], yaw: Math.PI, title: 'A fitter', tint: [0.9, 0.75, 0.4], says: ['Thirty years at Holm. They don\'t know a turbine from a teapot, but they know where the switches are.', 'The chief told them no. They put him in the store.'] },
    { id: 'clerk', at: [43, 15, 'G'], yaw: Math.PI / 2, title: 'A shift clerk', tint: [0.8, 0.85, 0.9], says: ['The control room locks out from its own desk, if you know the codes. The chief knows them. So did whoever taught their engineer.', 'The order\'s in the shift office. The officer reads it every hour as if it might have changed.'] },
  ],
  hostages: [{ id: 'chief', name: 'The chief engineer', at: [8, 26, 'G'] }],
  pickups: [{ id: 'order', name: 'The blackout order', what: 'the order', at: [35, 6, 'G'], table: true, colour: [0.85, 0.82, 0.7] }],
  devices: [
    { id: 'c-lane', kind: 'camera', at: [31, 2, 'G'], face: [-1, 1], net: 'holmps' },
    { id: 'c-yard', kind: 'camera', at: [46, 21, 'G'], face: [1, -1], net: 'holmps' },
    { id: 'c-ctl', kind: 'camera', at: [44, 18, '1'], face: [-1, -1], net: 'holmps' },
    { id: 'm-store', kind: 'lock', at: [13, 26, 'G'], net: 'holmps' },
    { id: 'a-ps', kind: 'alarm', at: [29, 14, 'G'], face: [1, 0], net: 'holmps' },
  ],
  terminals: [
    { id: 'sec', name: 'the shift office console', at: [43, 9, 'G'], face: [-1, 0], time: 6, net: 'holmps' },
    { id: 'grid', name: 'the grid controls', at: [38, 6, '1'], face: [0, 1], time: 10, reveal: 20, verb: 'Lock out', doing: 'Locking out',
      said: 'New codes on every breaker, and only Ghost has them. The city\'s power stays on whatever they do here. Every red here is on your radar for 20 seconds.' },
  ],
  intel: [
    { id: 'rota', at: [27, 17, 'G'], kind: 'Rota', title: 'The turbine hall\'s rota', text: ['The station\'s own men on days only, "for their safety". Ours on nights.'] },
    { id: 'note', at: [39, 6, 'G'], kind: 'Note', title: 'A note in the officer\'s hand', text: ['Six hours of dark from 23:00 on the 2nd. The lorries go from the docks at 23:30. The handler will be with the first.', 'If the chief will not do it, the engineer will. If the engineer will not, nobody needs to know.'] },
    { id: 'log', at: [42, 15, '1'], kind: 'Log', title: 'The control room log', text: ['Load steady. Load steady. Load steady.', 'Someone has added at the bottom: "For two more nights."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'grid', text: 'Lock out the grid controls (the control room, upstairs)' },
    { id: 'o2', kind: 'take', ref: 'order', text: 'Take the blackout order (the shift office)' },
    { id: 'o3', kind: 'rescue', ref: 'chief', text: 'Bring out the chief engineer (the store)', optional: true },
  ],
};
