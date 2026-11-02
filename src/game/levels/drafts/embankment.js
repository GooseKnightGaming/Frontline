// FRONTLINE - Level 47, the Halvard Embankment (first draft, M6.50): after the Ministry. The Deputy Minister who
// signed for the blight is running - a car along the Halvard embankment road at first light, an escort behind,
// to the border. You are on the ridge across the river with a scoped LR7: about a hundred and ten metres, the
// rounds dropping on the way. Stop him; then get back off the ridge before the far bank comes looking.
const W = 64, H = 100;
export default {
  id: 'embankment', no: 47, title: 'The Halvard Embankment', place: 'the Halvard ridge',
  where: 'The ridge over the Halvard embankment. 06:40, first light, still and cold.',
  brief: [
    ['The shot', 'The <b>Deputy Minister</b> is running for the border. His car comes along the <b>embankment road</b> across the river - from the east, a bodyguard beside his driver - in about a minute and a half. You are on the <b>ridge</b>, north of the river, with an <b>LR7 and an 8x scope</b>: the road is a hundred and ten metres off. Aim a little high - the rounds drop.'],
    ['The far bank', 'A checkpoint on the road, a watchtower with a marksman in it, men along the river wall. A footbridge crosses the river at its middle: when you fire, they will come over it. Shoot the driver and the car stops; shoot the minister and the job is done.'],
    ['Objectives', '<b>Stop the Deputy Minister</b>. Then back to the van behind the ridge, north.'],
  ],
  time: { date: [6, 1, 2027], hour: 6, minute: 40 }, faction: 'red',
  atmos: { fog: [0.62, 0.66, 0.72, 60, 420], ambient: [0.46, 0.48, 0.52] },
  startLoadout: { primary: 'LR7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { primary: ['SCOPE8'] } },
  extractName: 'the van behind the ridge', extract: { x: 40, y: 1, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'grass', margin: 16 },
  floors: {
    G: {
      y: 0, wallH: 3.2, wall: 'concrete2', floor: 'concrete', ceil: 'concrete2', lampPower: 0.6,
      carve: { size: [W, H], walls: false, ops: [], after: [
        ['room', 0, 5, W - 1, 33, 'J'],                // under the ridge: the hill itself (extra, below); behind it, the lane
        // the river, its walls, the footbridge at its middle
        ['room', 0, 62, W - 1, 76, '~'], ['room', 31, 62, 32, 76, '.'],
        ['room', 0, 61, 30, 61, '='], ['room', 33, 61, W - 1, 61, '='], ['room', 0, 77, 30, 77, 'w'], ['room', 33, 77, W - 1, 77, 'w'],
        // the far bank: the road, its checkpoint, crates and sandbags
        ['room', 26, 84, 34, 84, 'w'], ['room', 26, 89, 34, 89, 'w'], ['cells', [[26, 85], [26, 88], [34, 85], [34, 88]], 'w'],   // the checkpoint's sandbags (the road runs through it)
        ['cells', [[20, 81], [21, 81], [40, 81], [41, 81], [12, 80], [52, 80]], 'w'], ['cells', [[8, 90], [45, 91], [58, 90]], 'C'],
        ['cells', [[50, 90], [54, 90], [50, 94], [54, 94]], 'P'],      // the watchtower's legs
        ['cells', [[5, 96], [15, 97], [38, 97], [60, 96]], 't'],
      ] },
    },
    // the ridge: a shelf of hill three metres over the valley floor, trees and rocks along its crest
    R: {
      y: 3.2, wallH: 3, roof: false, lamps: false, floor: 'grass', floorTint: [0.45, 0.55, 0.35],
      carve: { size: [W, H], walls: false, ops: [['room', 0, 4, W - 1, 34]], after: [
        ['cells', [[4, 10], [9, 12], [15, 9], [21, 13], [27, 10], [37, 11], [43, 9], [49, 13], [55, 10], [60, 12], [6, 18], [18, 19], [46, 19], [58, 18]], 't'],
        ['cells', [[12, 15], [24, 16], [31, 15], [33, 15], [40, 16], [52, 15], [29, 30], [35, 30], [18, 31], [46, 31]], 'r'],      // (rocks along the crest: cover to shoot from)
      ] },
    },
    1: {
      y: 6, wallH: 1.2, roof: false, lamps: false, floor: 'wood', floorTint: [0.5, 0.42, 0.32],
      carve: { size: [W, H], walls: false, ops: [['room', 50, 90, 54, 94]], after: [['room', 50, 90, 54, 90, '='], ['room', 50, 94, 54, 94, '='], ['room', 50, 91, 50, 93, '='], ['room', 54, 91, 54, 93, '=']] },
    },
  },
  ladders: [{ x: 52, y: 95, from: 'G', to: '1', back: [0, -1], off: [52, 93] }],     // up the watchtower
  stairs: [
    { x: 32, y: 37, dir: 'N', len: 3, w: 2, from: 'G', to: 'R' },          // a path up the ridge from the valley (they will come up it)
    { x: 20, y: 1, dir: 'S', len: 3, w: 2, from: 'G', to: 'R' },           // and down its back to the lane and the van
  ],
  extra(kit) {
    const { box, CELL: C } = kit;
    box([0, 0, 5 * C], [W * C, 3.2, 34 * C], 'rock', { tint: [0.42, 0.45, 0.36] });      // the hill under the ridge
  },
  vehicles: [
    { id: 'car', kind: 'car', model: 'policeCar', paint: 'black', at: [W + 4, 86.5], yaw: Math.PI / 2, path: [[W + 4, 86.5], [W - 2, 86.5], [30, 86.5], [0, 86.5], [-7, 86.5]],
      speed: 8, goal: 'escape', wait: 90, hp: 480, name: 'The Deputy Minister\'s car',
      crew: [{ id: 'drv', at: [-0.42, 0.15] }, { id: 'e1', at: [0.42, 0.15] }, { id: 'dm', at: [0.42, 0.95] }] },
  ],
  start: { x: 32, y: 26, floor: 'R', yaw: Math.PI },
  zones: [
    { id: 'ridge', label: 'The Halvard ridge', at: [0, 0, W - 1, 34], floor: 'R' },
    { id: 'river', label: 'The Halvard river', at: [0, 61, W - 1, 77] },
    { id: 'check', label: 'The embankment - the checkpoint', at: [26, 84, 34, 89] },
    { id: 'tower', label: 'The embankment - the watchtower', at: [50, 90, 54, 94], floor: '1' },
    { id: 'road', label: 'The Halvard embankment', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'dm', at: [W - 3, 88, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The Deputy Minister', tint: [0.95, 0.95, 1.0] },
    { id: 'drv', at: [W - 3, 86, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'e1', at: [W - 3, 90, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'e2', at: [30, 90, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'tw', at: [52, 92, '1'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'ck1', at: [28, 86, 'G'], arms: 'carbine', rank: 'sergeant', temper: 'steady' },
    { id: 'ck2', at: [33, 85, 'G'], arms: 'carbine' },
    { id: 'w1', at: [12, 79, 'G'], route: [[4, 79], [28, 79]], arms: 'carbine' },
    { id: 'w2', at: [48, 79, 'G'], route: [[36, 79], [60, 79]], arms: 'carbine' },
    { id: 'fb', at: [32, 78, 'G'], arms: 'smg', temper: 'bold' },
    { id: 'r1', at: [20, 92, 'G'], arms: 'carbine', temper: 'bold' },
  ],
  objectives: [
    { id: 'o1', kind: 'kill', ref: 'dm', text: 'Stop the Deputy Minister (his car, on the embankment road)' },
  ],
};
