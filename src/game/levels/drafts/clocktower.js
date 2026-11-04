// FRONTLINE - Level 108, the Clock Tower (first draft, M6.130; THE PEACE, second). The second footman talked: the
// service has one more card to play. On the first morning of the talks, a marksman in the clock tower of Morra's town
// hall will be looking across the water at the treaty house's terrace, where the delegates take their coffee. Get to
// the top of the tower before the coffee is served. Take the marksman alive, and his orders with him.
const W = 40, H = 30;
export default {
  id: 'clocktower', no: 108, title: 'The Clock Tower', place: 'the town hall, Morra village',
  where: 'The town hall, Morra village. 08:40, the first morning of the talks, coffee at nine.',
  brief: [
    ['The job', 'The second footman talked. The service has one more card to play. On the first morning of the talks a <b>marksman</b> in the <b>clock tower</b> of Morra\'s town hall will be looking across the water at the treaty house\'s terrace, where the delegates take their coffee. Get to the top of the tower before the coffee is served. <b>Take the marksman alive</b>. If you can, be there <b>inside four minutes</b>.'],
    ['The place', 'The town hall stands on the north side of the village square: the <b>council chamber</b> downstairs, and the <b>tower</b> at its east end. Inside the tower, one stair climbs a flight to each floor, to the bell loft and then the <b>clock room</b> at the top, behind the clock\'s face. You come in from the square, south-west.'],
    ['Security', 'The service has men in the square and in the council chamber, and one on every floor of the tower. The marksman has a spotter beside him. There is no alarm in a village town hall, only the clock.'],
    ['Objectives', '<b>Take the marksman alive</b> (the clock room, the top of the tower). Take his <b>orders</b> (the council chamber). If you can, <b>inside four minutes</b>. Out across the square, south-west.'],
  ],
  epilogue: {
    success: 'At nine the delegates take their coffee on the terrace in the sunshine, and nobody in the clock tower is looking at them. The marksman\'s orders are signed by the head of the north\'s security service, and by the afternoon he has resigned.',
    partial: 'The marksman never fired, but he got away. The service will say he was never there.',
  },
  time: { date: [17, 6, 2027], hour: 8, minute: 40 }, night: false, faction: 'red',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.62, 0.66, 0.72, 40, 240], ambient: [0.55, 0.57, 0.6] },
  extractName: 'the square, south-west', extract: { x: 2, y: 28, floor: 'G', van: [0, -6] },
  outside: { backdrop: 'hills', mat: 'concrete', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'plaster', wallTint: [0.92, 0.88, 0.78], floor: 'wood', ceil: 'wood', lampPower: 0.5, lampColour: [1, 0.92, 0.8], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 8, 10, 24, 20],                        // the council chamber
        ['room', 26, 12, 32, 18],                       // the tower's foot
      ], after: [
        ['cells', [[16, 21], [25, 15]], 'D'],
        ['cells', [[12, 21], [20, 21], [7, 15], [33, 15]], 'W'],
        ['room', 11, 13, 21, 13, 'T'], ['room', 11, 17, 21, 17, 'Y'], ['cells', [[23, 11]], 'T'], ['cells', [[9, 19]], 'H'],
        ['cells', [[31, 13]], 'C'],
        // the square's fountain, benches and market stalls
        ['cells', [[18, 25]], 'M'], ['cells', [[10, 24], [26, 24], [32, 27], [6, 26], [36, 22]], 'C'],
      ] },
    },
    1: {
      y: 4, wallH: 3.6, wall: 'plaster', wallTint: [0.92, 0.88, 0.78], floor: 'wood', ceil: 'wood', lampPower: 0.4, lampColour: [1, 0.92, 0.8], lampEvery: 5,
      carve: { size: [W, H], ops: [['room', 26, 12, 32, 18]], after: [
        ['cells', [[29, 11], [29, 19], [33, 15]], 'W'], ['cells', [[28, 17]], 'C'],
      ] },
    },
    2: {
      y: 8, wallH: 3.4, wall: 'wood', wallTint: [0.5, 0.42, 0.34], floor: 'wood', ceil: 'wood', lampPower: 0.35, lampColour: [1, 0.92, 0.8], lampEvery: 5,
      carve: { size: [W, H], ops: [['room', 26, 12, 32, 18]], after: [
        ['cells', [[28, 11], [30, 11], [33, 15], [25, 15]], 'W'], ['cells', [[29, 15]], 'M'], ['cells', [[27, 12]], 'T'],
      ] },
    },
  },
  stairs: [
    { x: 26, y: 17, dir: 'N', len: 5, w: 2, from: 'G', to: '1' },
    { x: 30, y: 13, dir: 'S', len: 5, w: 2, from: '1', to: '2' },
  ],
  extra(kit) {
    const { box, mid } = kit;
    // the clock's face on the tower's south side, and its roof
    box([mid(29) - 1.1, 9, 19 * 1.5 + 0.02], [mid(29) + 1.1, 11.2, 19 * 1.5 + 0.1], 'paint', { tint: [0.95, 0.95, 0.9], solid: false });
    box([26 * 1.5 - 0.4, 11.4, 12 * 1.5 - 0.4], [33 * 1.5 + 0.4, 11.8, 19 * 1.5 + 0.4], 'wood', { tint: [0.3, 0.22, 0.18] });
  },
  start: { x: 2, y: 27, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'chamber', label: 'Morra town hall - the council chamber', at: [8, 10, 24, 20] },
    { id: 'foot', label: 'Morra town hall - the tower\'s foot', at: [26, 12, 32, 18] },
    { id: 'loft', label: 'Morra town hall - the bell loft', at: [26, 12, 32, 18], floor: '1' },
    { id: 'clock', label: 'Morra town hall - the clock room', at: [26, 12, 32, 18], floor: '2' },
    { id: 'square', label: 'Morra', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'mark', at: [27, 15, '2'], arms: 'dmr', rank: 'specialist', temper: 'cowardly', name: 'The marksman', tint: [0.3, 0.3, 0.28], yaw: 0 },
    { id: 'spot', at: [28, 13, '2'], arms: 'pistol', temper: 'steady' },
    { id: 'loft1', at: [28, 16, '1'], arms: 'smg', temper: 'steady' },
    { id: 'foot1', at: [30, 16, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'ch1', at: [14, 15, 'G'], route: [[9, 15], [22, 15]], arms: 'pistol' },
    { id: 'ch2', at: [22, 11, 'G'], arms: 'carbine', rank: 'officer', temper: 'steady' },
    { id: 'sq1', at: [24, 26, 'G'], route: [[14, 27], [36, 27]], arms: 'carbine' },
  ],
  civilians: [
    { id: 'baker', at: [30, 24, 'G'], yaw: Math.PI, title: 'The baker, setting up her stall', tint: [1.1, 1.0, 0.95], says: ['Men in the tower since six. The clock\'s ten minutes slow and nobody has come to wind it.'] },
  ],
  pickups: [{ id: 'orders', name: 'The marksman\'s orders', what: 'the orders', at: [23, 11, 'G'], table: true, colour: [0.85, 0.8, 0.65] }],
  intel: [
    { id: 'chart', at: [27, 12, '2'], kind: 'Chart', title: 'A range card in the clock room', text: ['The treaty house\'s terrace across the water, with its distances pencilled in, and a row of small circles where the chairs are.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'capture', ref: 'mark', text: 'Take the marksman alive (the clock room, the top of the tower)' },
    { id: 'o2', kind: 'take', ref: 'orders', text: 'Take his orders (the council chamber)' },
    { id: 'o3', kind: 'quick', secs: 240, text: 'Inside four minutes', optional: true },
  ],
};
