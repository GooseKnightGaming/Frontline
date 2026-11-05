// FRONTLINE - Level 106, Pier Four (first draft, M6.128; the end of THE GOLD). The gold never left the Kessin yard, but
// the treasurer did: he is aboard the reds' freighter at pier four on the Skarn coast, sailing at dawn with whatever he
// could carry - and the Mint's tally said four hundred and five bars where there had been four hundred and six. Go
// aboard from the pier. Take the treasurer alive in his cabin, and the ship's log from the bridge, which names every
// port the reds have ever sent their money to.
const W = 70, H = 30;
export default {
  id: 'pier', no: 106, title: 'Pier Four', place: 'pier four, the Skarn coast', windows: false,
  where: 'Pier four, the Skarn coast. 04:50, the freighter\'s engines warming, the tide on the turn.',
  brief: [
    ['The job', 'The gold never left the Kessin yard, but the <b>treasurer</b> did. He is aboard the reds\' <b>freighter</b> at pier four, sailing at dawn with whatever he could carry. The Mint\'s tally said four hundred and five bars where there had been four hundred and six. Go aboard from the pier. <b>Take the treasurer alive</b> in his cabin. Take the <b>ship\'s log</b> from the bridge: it names every port the reds have ever sent their money to.'],
    ['The place', 'The <b>pier</b> runs along the south side, with the freighter moored beside it and a <b>gangway</b> amidships. Aboard, from the west: the <b>hold</b>, the mess and the <b>cabins</b> aft, with the <b>bridge</b> above them, up a ladder-stair.'],
    ['Security', 'A camera on the gangway and the ship\'s alarm, both on the bridge\'s console. The radio is on the bridge too, and the engineer is in the hold. There are men on the pier, a man in every part of the ship, and the captain on his bridge.'],
    ['Objectives', '<b>Take the treasurer alive</b> (the cabins). Take the <b>ship\'s log</b> (the bridge). If you can, <b>without the alarm</b>. Off the ship and away along the pier, west.'],
  ],
  epilogue: {
    success: 'The freighter sails at dawn without its passenger, and the four hundred and sixth bar comes back to Hollen in the treasurer\'s suitcase. The ship\'s log goes to every port in it, and the reds\' money stops wherever it was.',
    partial: 'The treasurer or the log, not both. Somewhere a bank will go on taking the reds\' money for a while yet.',
  },
  time: { date: [11, 6, 2027], hour: 4, minute: 50 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.12, 0.14, 0.18, 25, 170], ambient: [0.24, 0.26, 0.3] },
  extractName: 'the pier, west', extract: { x: 1, y: 21, floor: 'G', van: [0, -2] },
  outside: { backdrop: 'hills', mat: 'concrete', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'metal', wallTint: [0.35, 0.38, 0.36], floor: 'metal', ceil: 'metal', lampPower: 0.55, lampColour: [1, 0.9, 0.75], lampEvery: 5,
      channel: 3, surf: 0.5,
      carve: { size: [W, H], ops: [
        ['room', 10, 6, 30, 16],                        // the hold
        ['room', 32, 6, 42, 16],                        // the mess
        ['room', 44, 6, 58, 16],                        // the cabins
      ], after: [
        // the sea round the ship and the pier
        ['room', 0, 0, W - 1, 3, '~'], ['room', 0, 4, 7, 17, '~'], ['room', 61, 4, W - 1, 17, '~'], ['room', 0, 25, W - 1, H - 1, '~'],
        ['cells', [[30, 17], [31, 11], [43, 11]], 'D'],
        ['cells', [[36, 17], [50, 17], [36, 5], [50, 5]], 'W'],
        // the hold's crates, the mess's tables, the cabins' bunks and the treasurer's trunk
        ['room', 13, 8, 13, 14, 'C'], ['room', 18, 8, 18, 14, 'C'], ['room', 23, 8, 23, 14, 'C'], ['cells', [[27, 14]], 'M'],
        ['room', 34, 9, 40, 9, 'T'], ['room', 34, 13, 40, 13, 'T'],
        ['cells', [[45, 7], [48, 7], [52, 7], [45, 15], [48, 15]], 'Y'], ['cells', [[52, 14]], 'T'], ['cells', [[54, 7]], 'H'],
        // the pier's bollards and crates
        ['cells', [[12, 23], [40, 23], [64, 21]], 'B'], ['cells', [[24, 23], [56, 23]], 'C'],
      ] },
    },
    1: {
      y: 3.2, wallH: 2.8, wall: 'metal', wallTint: [0.4, 0.42, 0.4], floor: 'wood', ceil: 'metal', lampPower: 0.45, lampColour: [1, 0.9, 0.75], lampEvery: 5,
      carve: { size: [W, H], ops: [['room', 44, 8, 58, 14]], after: [
        ['cells', [[46, 7], [50, 7], [54, 7], [43, 11], [46, 15], [50, 15]], 'W'],
        ['cells', [[46, 9], [48, 13]], 'T'], ['room', 50, 9, 52, 9, 'K'],
      ] },
    },
  },
  stairs: [{ x: 56, y: 15, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the hull below the deck line and the funnel aft
    box([9 * C, -1.5, 5 * C], [60 * C, 0, 18 * C], 'metal', { tint: [0.25, 0.12, 0.1], solid: false });
    box([mid(52) - 1, 6, mid(11) - 1], [mid(52) + 1, 9, mid(11) + 1], 'metal', { tint: [0.2, 0.2, 0.2] });
    for (const [x, y] of [[20, 20], [40, 20], [60, 20], [4, 22]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 11, intensity: 0.8, color: [1, 0.9, 0.75], street: true });
  },
  start: { x: 2, y: 20, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'hold', label: 'The freighter - the hold', at: [10, 6, 30, 16] },
    { id: 'mess', label: 'The freighter - the mess', at: [32, 6, 42, 16] },
    { id: 'cabins', label: 'The freighter - the cabins', at: [44, 6, 58, 16] },
    { id: 'bridge', label: 'The freighter - the bridge', at: [44, 8, 58, 14], floor: '1' },
    { id: 'pier', label: 'Pier four', at: [0, 18, W - 1, 24] },
    { id: 'coast', label: 'The Skarn coast', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'treas', at: [51, 13, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The treasurer', tint: [0.3, 0.28, 0.25] },
    { id: 'cab1', at: [47, 10, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'm1', at: [37, 11, 'G'], route: [[33, 11], [41, 11]], arms: 'pistol' },
    { id: 'h1', at: [20, 11, 'G'], route: [[11, 11], [29, 11]], arms: 'carbine' },
    { id: 'eng', at: [26, 15, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'capt', at: [48, 10, '1'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The captain' },
    { id: 'rad', at: [53, 12, '1'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'gw', at: [30, 19, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'p1', at: [40, 22, 'G'], route: [[16, 22], [66, 22]], arms: 'carbine' },
  ],
  pickups: [{ id: 'log', name: 'The ship\'s log', what: 'the log', at: [46, 9, '1'], table: true, colour: [0.3, 0.2, 0.12] }],
  devices: [
    { id: 'c-gang', kind: 'camera', at: [31, 17, 'G'], face: [0, 1], net: 'ship' },
    { id: 'a-ship', kind: 'alarm', at: [43, 17, 'G'], face: [0, 1], net: 'ship' },
  ],
  terminals: [{ id: 'sec', name: 'the bridge\'s console', at: [48, 13, '1'], face: [0, -1], time: 6, net: 'ship' }],
  intel: [
    { id: 'trunk', at: [52, 14, 'G'], kind: 'Trunk', title: 'The treasurer\'s trunk', text: ['Shirts, a passport in another name, and one bar of gold wrapped in a pullover, stamped with the Hollen Mint\'s crown.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'capture', ref: 'treas', text: 'Take the treasurer alive (the cabins)' },
    { id: 'o2', kind: 'take', ref: 'log', text: 'Take the ship\'s log (the bridge)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
