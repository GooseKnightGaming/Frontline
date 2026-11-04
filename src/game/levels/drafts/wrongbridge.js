// FRONTLINE - Level 78, the Wrong Bridge (first draft, M6.99; after HOLLIS). Hollis's last message never went, but an
// earlier one did: the reds believe Yard 7's armoury moves by rail on the 12th, and they are dug in at the Arn rail
// bridge to meet it. The armoury goes by road. Ghost would rather the reds did not try again somewhere else - so,
// while they wait at the wrong bridge, go in behind them with Hale, Moss and Sergeant Venn and clear them out.
const W = 56, H = 40;
export default {
  id: 'wrongbridge', no: 78, title: 'The Wrong Bridge', place: 'the Arn rail bridge',
  where: 'The Arn rail bridge. 10:40, the morning of the 12th, a grey sky, the reds dug in and waiting for a train.',
  brief: [
    ['The job', 'The reds believe Yard 7\'s armoury moves by rail this morning, and they are dug in at the <b>Arn rail bridge</b> to meet it. It is going by road, and it is safe. Ghost would rather they did not simply try again somewhere else. So, while they wait at the wrong bridge, go in <b>behind them</b> with <b>Hale, Moss and Sergeant Venn</b> and <b>clear them out</b>. Take their <b>orders</b> from the command hut. If you can, take their <b>officer</b> alive.'],
    ['The place', 'The railway runs east to west along a cutting, and the bridge carries it over the river at the east end. The reds\' positions face the line: sandbagged pits along the cutting, a <b>command hut</b> and a machine-gun nest by the bridge. You come over the hill behind them, from the north.'],
    ['Security', 'All of them are watching the line, not the hill. Their radio is in the command hut, and that is the only way they can call anyone. There are no cameras out here.'],
    ['Objectives', '<b>Clear the reds out</b> of their positions. Take their <b>orders</b> (the command hut). If you can, take their <b>officer</b> alive. Out over the hill, north.'],
  ],
  epilogue: {
    success: 'By noon the reds\' ambush party is gone, every man of it, and their orders name the officer in the north who planned it. Yard 7\'s armoury reaches its new home that evening without a shot fired at it.',
    partial: 'Some of them got away down the line. They will tell whoever sent them that the armoury never came, and that someone else did.',
  },
  time: { date: [12, 4, 2027], hour: 10, minute: 40 }, night: false, faction: 'red',
  relations: { red: { you: true, ghost: true }, ghost: { you: false, red: true } },
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.55, 0.58, 0.62, 40, 260], ambient: [0.5, 0.52, 0.56] },
  extractName: 'over the hill, north', extract: { x: 28, y: 1, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'wood', wallTint: [0.45, 0.4, 0.34], floor: 'wood', ceil: 'wood', lampPower: 0.5, lampColour: [1, 0.9, 0.75], lampEvery: 5,
      channel: 4, surf: 0.6,
      carve: { size: [W, H], ops: [
        ['room', 22, 12, 28, 16],                       // the command hut
      ], after: [
        ['cells', [[25, 17]], 'D'], ['cells', [[21, 14], [29, 14], [25, 11]], 'W'],
        ['cells', [[23, 13], [27, 15]], 'T'], ['cells', [[27, 13]], 'M'],
        // the railway: rails along the cutting (y 24 - 25); the river under the bridge (east end)
        ['room', 0, 24, 45, 24, '='], ['room', 0, 27, 45, 27, '='],
        ['room', 46, 18, W - 1, H - 1, '~'], ['room', 46, 24, W - 1, 27, '.'],
        // their positions: sandbagged pits along the cutting's north side, the gun nest by the bridge
        ['cells', [[8, 21], [9, 21], [16, 21], [17, 21], [32, 21], [33, 21], [40, 20], [41, 20], [42, 20], [40, 21], [42, 21]], 'C'],
        // the hill behind: rocks, gorse
        ['cells', [[10, 8], [18, 5], [34, 6], [44, 9], [6, 14], [48, 12], [14, 15], [38, 15]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the bridge's girders over the river, the rails along the cutting
    for (const z of [24, 28]) box([46 * C, 0, z * C - 0.1], [W * C, 2.4, z * C + 0.1], 'metal', { tint: [0.45, 0.3, 0.25], solid: false });
    for (const z of [25.3, 26.7]) box([0, 0.02, z * C], [W * C, 0.1, z * C + 0.12], 'metal', { tint: [0.4, 0.4, 0.42], solid: false });
  },
  start: { x: 28, y: 2, floor: 'G', yaw: Math.PI },
  zones: [
    { id: 'hut', label: 'The Arn rail bridge - the command hut', at: [22, 12, 28, 16] },
    { id: 'line', label: 'The Arn rail bridge - the cutting', at: [0, 18, 45, 30] },
    { id: 'bridge', label: 'The Arn rail bridge - the bridge', at: [46, 18, W - 1, 30] },
    { id: 'hill', label: 'The Arn rail bridge - the hill', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'hale', at: [27, 1, 'G'], faction: 'ghost', ally: true, name: 'Hale', arms: 'carbine', temper: 'steady', tint: [0.45, 0.6, 1.35] },
    { id: 'moss', at: [29, 1, 'G'], faction: 'ghost', ally: true, name: 'Moss', arms: 'smg', temper: 'bold', tint: [0.4, 0.55, 1.3] },
    { id: 'venn', at: [28, 0, 'G'], faction: 'ghost', ally: true, name: 'Sergeant Venn', arms: 'carbine', temper: 'steady', tint: [0.5, 0.62, 1.3] },
    { id: 'off', at: [24, 14, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'Their officer', yaw: Math.PI },
    { id: 'rad', at: [26, 15, 'G'], arms: 'pistol', temper: 'cowardly', yaw: Math.PI },
    { id: 'p1', at: [8, 22, 'G'], arms: 'carbine', temper: 'steady', yaw: Math.PI },
    { id: 'p2', at: [9, 22, 'G'], arms: 'smg', temper: 'bold', yaw: Math.PI },
    { id: 'p3', at: [16, 22, 'G'], arms: 'carbine', temper: 'steady', yaw: Math.PI },
    { id: 'p4', at: [17, 22, 'G'], arms: 'carbine', temper: 'steady', yaw: Math.PI },
    { id: 'p5', at: [32, 22, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady', yaw: Math.PI },
    { id: 'p6', at: [33, 22, 'G'], arms: 'carbine', temper: 'bold', yaw: Math.PI },
    { id: 'mg1', at: [41, 21, 'G'], arms: 'smg', temper: 'steady', yaw: Math.PI },
    { id: 'mg2', at: [43, 22, 'G'], arms: 'shotgun', temper: 'bold', yaw: Math.PI },
    { id: 'rv', at: [36, 18, 'G'], route: [[4, 18], [44, 18]], arms: 'carbine' },
  ],
  pickups: [{ id: 'orders', name: 'The ambush orders', what: 'the orders', at: [23, 13, 'G'], table: true, colour: [0.85, 0.82, 0.7] }],
  intel: [
    { id: 'wire', at: [27, 15, 'G'], kind: 'Telegram', title: 'A telegram from the north', text: ['ARMOURY BY RAIL 12TH. TRAIN AT 11. TAKE IT AT THE ARN BRIDGE. HOLLIS IS SURE.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'clear', text: 'Clear the reds out of their positions' },
    { id: 'o2', kind: 'take', ref: 'orders', text: 'Take the ambush orders (the command hut)' },
    { id: 'o3', kind: 'capture', ref: 'off', text: 'Take their officer alive', optional: true },
  ],
};
