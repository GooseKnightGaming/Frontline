// FRONTLINE - Level 122, the Quarry (first draft, M6.144; the start of THE ESCAPE). Kray was convicted on the Friday and
// sprung on the Saturday: his friends stopped the prison van on the Lessar road and took him off it. They are swapping
// cars in the old Merle quarry. Kray himself is already gone, in the first car, but the second is still loading, and
// the man who planned it all is with it. Stop the second car, and take the planner alive.
const W = 56, H = 40;
export default {
  id: 'quarry', no: 122, title: 'The Quarry', place: 'the old Merle quarry',
  where: 'The old Merle quarry. 16:40, a hot afternoon, dust in the air from the getaway.',
  brief: [
    ['The job', 'Kray was convicted on the Friday and sprung on the Saturday. His friends stopped the prison van on the Lessar road and took him off it. They are <b>swapping cars</b> in the old Merle quarry. Kray himself is already gone in the first car. The <b>second car</b> is still loading, and <b>the man who planned it all</b> is with it. <b>Stop the second car</b>. <b>Take the planner alive</b>.'],
    ['The place', 'The quarry floor is a pit with rock walls on three sides and the road out on the east. The <b>prison van</b> stands abandoned in the middle. The <b>second car</b> is by the old crusher house, facing the road out. The quarry office is on the north rim, with the stores beside it. You come down the old haul road from the west.'],
    ['Security', 'There is no alarm in a dead quarry, only Kray\'s friends: men on the rim with rifles and men at the car. The car leaves in a little under three minutes, or the moment its crew are shot at.'],
    ['Objectives', '<b>Stop the second car</b> before it is out on the road, east. <b>Take the planner alive</b> (by the car or in the office). Back up the haul road, west.'],
  ],
  epilogue: {
    success: 'The second car never leaves the quarry, and the planner talks all the way back to Lessar. He says Kray is making for the Vintners\' country, to a house nobody has ever connected with him.',
    partial: 'The car or the planner, not both. Somewhere ahead of Ghost, Kray is putting distance between them.',
  },
  time: { date: [28, 8, 2027], hour: 16, minute: 40 }, night: false, faction: 'red',
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.72, 0.66, 0.56, 40, 260], ambient: [0.62, 0.58, 0.52] },
  extractName: 'the haul road, west', extract: { x: 2, y: 20, floor: 'G', van: [4, -3] },
  outside: { backdrop: 'hills', mat: 'desert', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 3.4, wall: 'concrete2', wallTint: [0.7, 0.66, 0.58], floor: 'concrete', ceil: 'metal', lampPower: 0.5, lampColour: [1, 0.92, 0.8], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 30, 24, 38, 30],                       // the crusher house
        ['room', 14, 4, 22, 8],                         // the quarry office
        ['room', 26, 4, 32, 8],                         // the stores
      ], after: [
        // the pit's rock walls: north and south, the haul road in from the west and the road out east
        ['room', 0, 0, W - 1, 1, 'J'], ['room', 0, 38, W - 1, H - 1, 'J'],
        ['room', 0, 2, 9, 15, 'J'], ['room', 0, 25, 9, 37, 'J'],
        ['cells', [[18, 9], [29, 9], [34, 23]], 'D'], ['cells', [[13, 6], [23, 6], [39, 27]], 'W'],
        ['cells', [[15, 5], [21, 7]], 'T'], ['cells', [[17, 7]], 'H'], ['room', 27, 5, 31, 5, 'C'],
        ['cells', [[33, 27], [36, 26]], 'M'], ['cells', [[31, 29]], 'T'],
        // spoil heaps, blocks of stone, the old rail of the tubs
        ['cells', [[16, 16], [22, 22], [26, 14], [18, 30], [44, 12], [46, 30], [40, 18], [12, 20], [24, 34], [36, 34]], 'r'],
      ] },
    },
  },
  extra(kit) {
    const { box, CELL: C } = kit;
    for (const [x0, y0, x1, y1] of [[0, 0, W, 2], [0, 38, W, H], [0, 2, 10, 16], [0, 25, 10, 38]]) box([x0 * C, 0, y0 * C], [x1 * C, 9, y1 * C], 'concrete2', { tint: [0.62, 0.58, 0.5] });
  },
  vehicles: [
    { id: 'prisonvan', kind: 'car', model: 'lightUtility', paint: 'grey', at: [24, 20], yaw: 0, hp: 560 },
    { id: 'car2', kind: 'car', model: 'lightUtility', paint: 'black', at: [42, 22], yaw: -Math.PI / 2, path: [[42, 22], [48, 22], [52, 20], [55, 20]],
      speed: 8, goal: 'escape', wait: 170, hp: 560, name: 'The second car',
      crew: [{ id: 'cd', at: [-0.42, 0.15] }, { id: 'cm', at: [0.42, 0.15] }] },
  ],
  start: { x: 2, y: 20, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'crusher', label: 'The quarry - the crusher house', at: [30, 24, 38, 30] },
    { id: 'office', label: 'The quarry - the office', at: [14, 4, 22, 8] },
    { id: 'floor', label: 'The quarry - the pit', at: [10, 2, 55, 37] },
    { id: 'merle', label: 'The old Merle quarry', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'cd', at: [42, 22, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'cm', at: [43, 22, 'G'], arms: 'carbine', temper: 'bold' },
    { id: 'plan', at: [18, 6, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The planner', tint: [0.5, 0.45, 0.4] },
    { id: 'of1', at: [20, 5, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'cr1', at: [34, 26, 'G'], arms: 'carbine' },
    { id: 'pt1', at: [30, 16, 'G'], route: [[14, 16], [48, 16]], arms: 'carbine' },
    { id: 'rim1', at: [46, 4, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'rim2', at: [44, 34, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'vn', at: [26, 21, 'G'], arms: 'pistol', temper: 'steady' },
  ],
  hostages: [{ id: 'warder', name: 'The prison van\'s warder', at: [31, 29, 'G'] }],
  intel: [
    { id: 'map', at: [15, 5, 'G'], kind: 'Map', title: 'A road map in the office', text: ['The Lessar road, the quarry, and a line drawn north-east into the Vintners\' country, ending at a house marked only "V.".'] },
  ],
  objectives: [
    { id: 'o1', kind: 'stop', ref: 'car2', text: 'Stop the second car before it is out on the road, east' },
    { id: 'o2', kind: 'capture', ref: 'plan', text: 'Take the planner alive (the office)' },
    { id: 'o3', kind: 'rescue', ref: 'warder', text: 'Bring out the van\'s warder (the crusher house)', optional: true },
  ],
};
