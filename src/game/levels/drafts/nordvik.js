// FRONTLINE - Level 66, Nordvik (first draft, M6.84). Over the pass, the first town of the north: Nordvik, where the
// frontier's couriers come and go by the morning train. One came in on today's. Nobody south of the hills knows
// where the council meets; he does, and he is going there now. Follow him through the town - in a red uniform,
// among all the other red uniforms - and take the station's telegraph log, which says who he wires.
const W = 60, H = 40;
export default {
  id: 'nordvik', no: 66, title: 'Nordvik', place: 'Nordvik, beyond the Vashka hills',
  where: 'Nordvik, the station and the high street. 09:15, a hard bright frost, the morning train in.',
  brief: [
    ['The job', 'A <b>courier</b> came in on the morning train, and he is going to the council\'s house: the place nobody south of the hills has found. <b>Follow him</b>. Keep within forty metres, not close enough for him to notice you, and do not let him see you watching. Take the <b>telegraph log</b> from the station office as well. It says who he wires, and who wires him.'],
    ['The place', 'The <b>station</b> at the west end of the high street, the shops and houses along it, and the hill at the east end up to the <b>council\'s house</b> behind its wall. It is broad daylight and the street is full. You are <b>dressed as one of them</b>.'],
    ['Security', 'Patrols in the street and men on the council\'s gate. A red uniform walking the high street at nine in the morning is nothing to look at. A red uniform walking two steps behind the same man for ten minutes is.'],
    ['Objectives', '<b>Follow the courier</b> to the council\'s house. Take the <b>telegraph log</b> (the station office). Out by the station, west, when you are done.'],
  ],
  epilogue: {
    success: 'The council\'s house is at the top of Nordvik\'s hill, behind a wall nobody in the town will talk about. The telegraph log says the council meets there in three days, all of them. Ghost will be there too.',
    partial: 'The courier, or the log, but not both. Ghost knows part of the way to the council, and the council may know that Ghost is looking.',
  },
  time: { date: [16, 2, 2027], hour: 9, minute: 15 }, night: false, faction: 'red', startDisguise: 'red',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.7, 0.74, 0.8, 50, 300], ambient: [0.6, 0.62, 0.68] },
  extractName: 'the station, west', extract: { x: 1, y: 20, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'concrete2', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.4, wall: 'brick', wallTint: [0.6, 0.55, 0.5], floor: 'wood', ceil: 'plaster', lampPower: 0.45, lampColour: [1, 0.9, 0.75], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 3, 4, 14, 14],                         // the station
        ['room', 18, 4, 26, 14],                        // the bakery and the house over it
        ['room', 29, 4, 37, 14],                        // the hotel
        ['room', 3, 25, 14, 34],                        // the post office
        ['room', 18, 25, 26, 34],                       // the chemist's
        ['room', 29, 25, 37, 34],                       // the bank
        ['room', 46, 2, 56, 10],                        // the council's house
      ], after: [
        // (walls a square out from each room)
        ['cells', [[9, 15], [22, 15], [33, 15], [9, 24], [22, 24], [33, 24], [51, 11]], 'D'],
        ['room', 5, 7, 12, 7, 'K'], ['cells', [[5, 12], [12, 12]], 'T'], ['cells', [[13, 5]], 'H'],
        ['room', 19, 7, 25, 7, 'K'], ['cells', [[31, 7], [35, 7], [31, 12], [35, 12]], 'T'],
        ['room', 5, 28, 12, 28, 'K'], ['room', 20, 28, 24, 28, 'K'], ['room', 30, 28, 36, 28, 'K'],
        ['cells', [[48, 4], [54, 4], [51, 8]], 'T'],
        // the high street: market barrows and benches along its edges, clear of the middle
        ['cells', [[17, 17], [28, 17], [40, 17], [17, 23], [28, 23], [40, 23], [47, 16], [42, 9]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the council's wall round its house and garden, its gate on the south side
    box([44 * C, 0, 0], [45 * C, 3, 11 * C], 'concrete2', { tint: [0.55, 0.53, 0.5] });
    box([57 * C, 0, 0], [58 * C, 3, 11 * C], 'concrete2', { tint: [0.55, 0.53, 0.5] });
    level.signs.push({ pos: [mid(9), 3.6, 15 * C + 0.12], yaw: 0, w: 3.6, h: 0.7, text: 'NORDVIK', sub: 'Station', col: '#2a2a3a' });
  },
  start: { x: 4, y: 21, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'station', label: 'Nordvik - the station', at: [3, 4, 14, 14] },
    { id: 'hotel', label: 'Nordvik - the hotel', at: [29, 4, 37, 14] },
    { id: 'house', label: 'Nordvik - the council\'s house', at: [46, 2, 56, 10] },
    { id: 'hill', label: 'Nordvik - the hill', at: [40, 0, W - 1, 15] },
    { id: 'street', label: 'Nordvik - the high street', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    // the courier: out of the station, along the high street, up the hill to the council's gate - and he waits there
    { id: 'courier', at: [9, 17, 'G'], route: [[9, 17], [9, 20], [24, 20, 5], [40, 20], [44, 20], [44, 14], [51, 13, 1e9]],
      arms: 'pistol', rank: 'specialist', temper: 'cowardly', name: 'The courier', tint: [0.3, 0.3, 0.35] },
    { id: 'st1', at: [8, 9, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'p1', at: [20, 21, 'G'], route: [[16, 21], [42, 21]], arms: 'carbine' },
    { id: 'p2', at: [30, 19, 'G'], route: [[42, 19], [16, 19]], arms: 'carbine' },
    { id: 'gate1', at: [49, 12, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'gate2', at: [53, 12, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'hs', at: [51, 6, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'hotel', at: [33, 10, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady' },
  ],
  civilians: [
    { id: 'porter', at: [12, 17, 'G'], yaw: Math.PI, title: 'A railway porter', tint: [0.6, 0.55, 0.45], says: ['The man in grey? Every Tuesday. Never carries his own bag up the hill and never tips.'] },
    { id: 'baker', at: [22, 9, 'G'], yaw: 0, title: 'The baker', tint: [1.1, 1.05, 0.95], says: ['Up the hill? Nobody goes up the hill. Bread\'s left at the gate.'] },
    { id: 'woman', at: [30, 22, 'G'], yaw: 0, title: 'A woman with a basket', tint: [0.9, 0.8, 0.85], says: ['They have had the big house since the autumn. Lights on all night, cars at all hours.', 'You are not from here. Neither are they.'] },
    { id: 'clerk', at: [8, 30, 'G'], yaw: 0, title: 'A post office clerk', tint: [0.85, 0.85, 0.95], says: ['Telegrams? The station has its own office. Not ours.'] },
  ],
  pickups: [{ id: 'log', name: 'The telegraph log', what: 'the telegraph log', at: [12, 12, 'G'], table: true, colour: [0.85, 0.82, 0.7] }],
  intel: [
    { id: 'timetable', at: [5, 12, 'G'], kind: 'Timetable', title: 'A timetable, marked', text: ['The 08:50 from the pass, every Tuesday, circled. Beside it, in pencil: "car to the hill - no car".'] },
    { id: 'menu', at: [31, 12, 'G'], kind: 'Bill', title: 'A hotel bill', text: ['Rooms for eleven, three nights from the 19th, "the council\'s guests". Paid in advance.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'tail', ref: 'courier', range: 40, near: 4, lose: 15, text: 'Follow the courier to the council\'s house',
      said: 'The courier is at the council\'s gate on the hill, and they let him in without a word. Now you know where it is.' },
    { id: 'o2', kind: 'take', ref: 'log', text: 'Take the telegraph log (the station office)' },
  ],
};
