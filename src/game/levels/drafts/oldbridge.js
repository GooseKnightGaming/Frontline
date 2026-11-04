// FRONTLINE - Level 124, the Old Bridge (first draft, M6.146; the end of THE ESCAPE). "Boat Thursday, the old bridge,
// midnight." Kray is waiting under the old bridge on the Vintners' river for the boat that will take him downriver and
// out of reach for good. It is Thursday, and nearly midnight. Take Kray alive before he is aboard, and stop the boat
// before it is away downriver.
const W = 60, H = 40;
export default {
  id: 'oldbridge', no: 124, title: 'The Old Bridge', place: 'the old bridge on the Vintners\' river',
  where: 'The old bridge on the Vintners\' river. 23:50, Thursday, a boat\'s lamp on the water.',
  brief: [
    ['The job', '"Boat Thursday, the old bridge, midnight." <b>Kray</b> is waiting at the <b>old bridge</b> on the Vintners\' river for the <b>boat</b> that will take him downriver and out of reach for good. It is Thursday, and nearly midnight. <b>Take Kray alive</b> before he is aboard. <b>Stop the boat</b> before it is away downriver, west.'],
    ['The place', 'The river runs east to west across the south of the map. The <b>old bridge</b> crosses it in the middle. Kray waits on the <b>north bank</b> by the bridge steps, with the boatmen\'s hut beside him. The <b>boat</b> is on the water, west of the bridge. The toll keeper\'s cottage is at the north end of the bridge. You come in along the towpath, north-east.'],
    ['Security', 'No alarm and no console, only Kray\'s friends: men on the bridge and the bank, and a man with a rifle at the cottage window. The boat leaves in a little over three minutes, or at once if its crew are shot at.'],
    ['Objectives', '<b>Take Kray alive</b> (the north bank, by the bridge). <b>Stop the boat</b> before it is away downriver, west. Back along the towpath, north-east.'],
  ],
  epilogue: {
    success: 'The boat stays tied up under the old bridge, and Anselm Kray goes back to Lessar in the back of a Ghost car, this time to stay. He has nobody left to buy from, nobody left to sell to, and nobody left to spring him.',
    partial: 'Kray or the boat, not both. If he is on the river, he is a long way down it by now.',
  },
  time: { date: [2, 9, 2027], hour: 23, minute: 50 }, night: true, faction: 'red',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.1, 0.11, 0.15, 25, 170], ambient: [0.22, 0.23, 0.28] },
  extractName: 'the towpath, north-east', extract: { x: 57, y: 3, floor: 'G', van: [0, 8] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 3.2, wall: 'concrete2', wallTint: [0.62, 0.6, 0.55], floor: 'wood', ceil: 'wood', lampPower: 0.5, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      channel: 3, surf: 0.5,
      carve: { size: [W, H], ops: [
        ['room', 20, 14, 25, 18],                       // the boatmen's hut
        ['room', 32, 10, 38, 16],                       // the toll keeper's cottage
      ], after: [
        // the river, with the old bridge across it (x 27 - 30)
        ['room', 0, 24, 26, 32, '~'], ['room', 31, 24, W - 1, 32, '~'],
        ['cells', [[22, 19], [35, 17]], 'D'], ['cells', [[19, 16], [26, 16], [39, 13], [35, 9]], 'W'],
        ['cells', [[21, 15]], 'T'], ['cells', [[24, 17]], 'Y'],
        ['cells', [[33, 11]], 'T'], ['cells', [[37, 15]], 'Y'], ['cells', [[36, 11]], 'H'],
        // the bridge's parapets, the bank's mooring posts, the towpath's willows
        ['room', 27, 25, 27, 31, 'K'], ['room', 30, 25, 30, 31, 'K'],
        ['cells', [[12, 22], [18, 22], [40, 22], [48, 22], [10, 10], [46, 8], [24, 6], [52, 16], [14, 36], [44, 36]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    box([27 * C, 0, 24 * C], [31 * C, 0.4, 33 * C], 'concrete2', { tint: [0.5, 0.48, 0.44], solid: false });
    for (const [x, y] of [[28, 22], [22, 21], [35, 19], [56, 5]]) level.lights.push({ pos: [mid(x), 3.4, mid(y)], range: 9, intensity: 0.7, color: [1, 0.85, 0.6], street: true });
  },
  vehicles: [
    { id: 'kboat', kind: 'boat', at: [20, 28], yaw: Math.PI / 2, paint: 'white', hp: 560, path: [[20, 28], [12, 28], [4, 28], [1, 28]],
      speed: 7, goal: 'escape', wait: 200, name: 'Kray\'s boat',
      crew: [{ id: 'bh', at: [-0.4, 0.6] }, { id: 'bm', at: [0, -2.2] }] },
  ],
  start: { x: 57, y: 4, floor: 'G', yaw: Math.PI / 2 },
  zones: [
    { id: 'bank', label: 'The old bridge - the north bank', at: [16, 18, 34, 23] },
    { id: 'hut', label: 'The old bridge - the boatmen\'s hut', at: [20, 14, 25, 18] },
    { id: 'cottage', label: 'The old bridge - the toll keeper\'s cottage', at: [32, 10, 38, 16] },
    { id: 'bridge', label: 'The old bridge', at: [27, 24, 30, 32] },
    { id: 'river', label: 'The Vintners\' river', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'kray', at: [26, 21, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Anselm Kray', tint: [0.9, 0.85, 0.75] },
    { id: 'bh', at: [20, 28, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'bm', at: [20, 27, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'kf1', at: [24, 21, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'kf2', at: [28, 27, 'G'], arms: 'carbine', temper: 'bold' },
    { id: 'kf3', at: [23, 16, 'G'], arms: 'pistol' },
    { id: 'rif', at: [34, 12, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady', name: 'The man at the window' },
    { id: 'tp1', at: [44, 20, 'G'], route: [[36, 20], [54, 20]], arms: 'carbine' },
    { id: 'tp2', at: [30, 36, 'G'], route: [[18, 36], [50, 36]], arms: 'carbine', dog: true },
  ],
  intel: [
    { id: 'chart', at: [21, 15, 'G'], kind: 'Chart', title: 'The boatmen\'s river chart', text: ['Downriver for two nights, then the estuary and a ship with no name. "Passenger: one. Luggage: none. Paid."'] },
    { id: 'toll', at: [33, 11, 'G'], kind: 'Ledger', title: 'The toll keeper\'s book', text: ['No tolls taken since the spring. Under tonight\'s date: "Paid to look the other way, by the gentleman. Twice the usual."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'capture', ref: 'kray', text: 'Take Kray alive (the north bank, by the bridge)' },
    { id: 'o2', kind: 'stop', ref: 'kboat', text: 'Stop Kray\'s boat before it is away downriver, west' },
  ],
};
