// FRONTLINE - Level 105, the Goods Yard (first draft, M6.127; THE GOLD, second). "Not the usual line": the gold goes
// from the Mint to the Kessin goods yard by night, and out of it in two lorries, east, to where the reds have a ship
// waiting. Stop both lorries before they are out of the yard. The first can be held at the gate from the signal box,
// which works the yard's barrier. The second has to be stopped the hard way.
const W = 60, H = 36;
export default {
  id: 'goodsyard', no: 105, title: 'The Goods Yard', place: 'the Kessin goods yard',
  where: 'The Kessin goods yard. 02:10, Thursday, two lorries loading under the arc lamps.',
  brief: [
    ['The job', '"Not the usual line." The gold goes from the Mint to the <b>Kessin goods yard</b> by night, and out of it in <b>two lorries</b>, east, to where the reds have a ship waiting. <b>Stop both lorries</b> before they are out of the yard. The first can be <b>held at the gate</b> from the <b>signal box</b>, which works the yard\'s barrier. The second has to be stopped the hard way.'],
    ['The place', 'The <b>signal box</b> is in the north-west corner, the <b>warehouse</b> along the north side, and the yard office north-east. The lorries load in the open yard in the middle and leave by the east gate. You come in from the sidings, south-west.'],
    ['Security', 'A camera on the yard and the alarm, both on the yard office\'s console with the radio. The engineer is at the warehouse. The lorries leave in a little over three and four minutes, or the moment their crews are shot at.'],
    ['Objectives', '<b>Stop the first lorry</b> (hold it from the signal box, or stop it yourself). <b>Stop the second lorry</b>. If you can, <b>without the alarm</b>. Out by the sidings, south-west.'],
  ],
  epilogue: {
    success: 'Two lorries of "machine parts" stand in the Kessin goods yard at dawn with their engines cold, and eleven tons of the north\'s gold in their backs. The ship waiting for them sails at noon with nothing aboard.',
    partial: 'One lorry stopped, one away. Half the north\'s gold is going to sea.',
  },
  time: { date: [10, 6, 2027], hour: 2, minute: 10 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.16, 0.16, 0.2, 25, 170], ambient: [0.28, 0.28, 0.32] },
  extractName: 'the sidings, south-west', extract: { x: 2, y: 34, floor: 'G', van: [0, -6] },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 4.5, wall: 'brick', wallTint: [0.6, 0.45, 0.38], floor: 'concrete', ceil: 'metal', lampPower: 0.6, lampColour: [1, 0.9, 0.75], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 6, 6, 10, 10],                         // the signal box
        ['room', 20, 6, 40, 13],                        // the warehouse
        ['room', 46, 6, 52, 12],                        // the yard office
      ], after: [
        ['cells', [[8, 11], [30, 14], [24, 14], [49, 13]], 'D'],
        ['cells', [[11, 8], [26, 5], [34, 5], [41, 10], [45, 9], [53, 9]], 'W'],
        ['room', 7, 7, 9, 7, 'K'], ['cells', [[9, 9]], 'T'],
        ['room', 22, 8, 22, 12, 'C'], ['room', 27, 8, 27, 12, 'C'], ['room', 33, 8, 33, 12, 'C'], ['cells', [[38, 12]], 'M'], ['cells', [[36, 7]], 'T'],
        ['cells', [[48, 7], [51, 11]], 'T'],
        // the yard: rails, buffers, stacked sleepers
        ['cells', [[10, 18], [32, 31], [50, 30], [44, 18]], 'B'], ['cells', [[14, 30], [40, 30], [8, 24], [16, 16]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    for (const z of [29, 29.6, 33, 33.6]) box([0, 0, z * C], [W * C, 0.12, z * C + 0.12], 'metal', { tint: [0.4, 0.38, 0.36], solid: false });
    for (const [x, y] of [[20, 18], [36, 18], [28, 28], [52, 22]]) level.lights.push({ pos: [mid(x), 6, mid(y)], range: 14, intensity: 1, color: [1, 0.92, 0.8], street: true });
  },
  vehicles: [
    { id: 'lorry1', kind: 'car', model: 'lightUtility', paint: 'grey', at: [24, 20], yaw: -Math.PI / 2, path: [[24, 20], [36, 20], [48, 20], [W + 2, 20], [W + 8, 20]],
      speed: 8, goal: 'escape', wait: 200, hp: 620, name: 'The first lorry', holdOn: 'barrier',
      crew: [{ id: 'l1d', at: [-0.42, 0.15] }, { id: 'l1m', at: [0.42, 0.15] }] },
    { id: 'lorry2', kind: 'car', model: 'lightUtility', paint: 'olive', at: [20, 25], yaw: -Math.PI / 2, path: [[20, 25], [36, 25], [48, 25], [W + 2, 25], [W + 8, 25]],
      speed: 8, goal: 'escape', wait: 250, hp: 620, name: 'The second lorry',
      crew: [{ id: 'l2d', at: [-0.42, 0.15] }, { id: 'l2m', at: [0.42, 0.15] }] },
  ],
  start: { x: 2, y: 33, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'box', label: 'The goods yard - the signal box', at: [6, 6, 10, 10] },
    { id: 'ware', label: 'The goods yard - the warehouse', at: [20, 6, 40, 13] },
    { id: 'office', label: 'The goods yard - the yard office', at: [46, 6, 52, 12] },
    { id: 'yard', label: 'The Kessin goods yard', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'l1d', at: [24, 20, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'l1m', at: [25, 20, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'l2d', at: [20, 25, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'l2m', at: [21, 25, 'G'], arms: 'carbine', temper: 'bold' },
    { id: 'sig', at: [8, 9, 'G'], arms: 'pistol', temper: 'cowardly', name: 'The signalman' },
    { id: 'rad', at: [49, 9, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [37, 10, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'wh1', at: [30, 10, 'G'], arms: 'smg' },
    { id: 'y1', at: [36, 22, 'G'], route: [[28, 22], [52, 22]], arms: 'carbine' },
    { id: 'y2', at: [44, 22, 'G'], route: [[44, 16], [44, 28]], arms: 'carbine', dog: true },
  ],
  devices: [
    { id: 'c-yard', kind: 'camera', at: [45, 13, 'G'], face: [-1, 1], net: 'yard' },
    { id: 'a-yard', kind: 'alarm', at: [53, 11, 'G'], face: [1, 0], net: 'yard' },
  ],
  terminals: [
    { id: 'sec', name: 'the yard office console', at: [48, 7, 'G'], face: [0, 1], time: 6, net: 'yard' },
    { id: 'barrier', name: 'the barrier lever', at: [9, 9, 'G'], face: [0, -1], time: 4, verb: 'Drop', doing: 'Dropping',
      said: 'The east gate\'s barrier comes down across the yard road. The first lorry will not get through it.' },
  ],
  intel: [
    { id: 'waybill', at: [51, 11, 'G'], kind: 'Waybill', title: 'The yard\'s waybill', text: ['Two lorries, "machine parts", eleven tons. Destination: "the Skarn coast, pier four". Signed, the treasurer.'] },
    { id: 'roster', at: [36, 7, 'G'], kind: 'Roster', title: 'The warehouse roster', text: ['The night\'s gang, all reds. The yard\'s own men sent home with a day\'s pay and told not to come back till Monday.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'stop', ref: 'lorry1', text: 'Stop the first lorry (or hold it from the signal box)' },
    { id: 'o2', kind: 'stop', ref: 'lorry2', text: 'Stop the second lorry before it is out of the yard' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
