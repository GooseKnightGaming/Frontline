// FRONTLINE - Level 81, the Border Run (first draft, M6.103; a drive). The north knows now: its colonel taken, its
// staff marked, its spring stood down in his name. It has shut the valley road behind you. The copies of Strand's
// spring plan have to reach Ghost's people over the eastern frontier by morning, and the only way is down the valley
// road in a borrowed jeep - through the roadblock at the bridge, and on to the frontier.
const W = 110, H = 24;
export default {
  id: 'borderrun', no: 81, title: 'The Border Run', place: 'the Vashka valley road',
  where: 'The Vashka valley road. 05:50, first light, the road shut behind you.',
  brief: [
    ['The job', 'The north knows now, and it has shut the valley road. The copies of Strand\'s spring plan have to reach Ghost\'s people over the <b>eastern frontier</b> by morning. There is a <b>jeep</b> at the motor pool\'s back gate, where you are. Drive it down the valley road, <b>through the roadblock</b> at the bridge, and <b>on to the frontier</b>. If you can, get there <b>inside three minutes</b>, before they close the frontier too.'],
    ['The place', 'One road east along the valley floor, with rock walls on both sides. Halfway along is the <b>roadblock</b>: barriers, sandbags, a <b>turret</b> on its hut and a camera. Past it are the bridge and the long straight to the <b>frontier post</b>, which is Ghost\'s.'],
    ['Security', 'The roadblock\'s turret, its camera and the alarm, all on the hut\'s console. Its radio and its engineer are in the hut. A jeep at full speed is a hard thing to stop, and you can also go round on foot and turn the turret on them.'],
    ['Objectives', '<b>Reach the frontier</b> (the east end of the valley). If you can, <b>inside three minutes</b>.'],
  ],
  epilogue: {
    success: 'The jeep rolls up to Ghost\'s frontier post with its windscreen gone and the spring plan safe on the back seat. By breakfast it is on its way to every capital that needs to read it.',
    partial: 'The plan got through, late and the hard way. It still gets read.',
  },
  time: { date: [20, 4, 2027], hour: 5, minute: 50 }, night: false, faction: 'red', requires: 'HACKKIT', weather: 'snow',
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.62, 0.65, 0.7, 50, 300], ambient: [0.5, 0.52, 0.58] },
  extractName: 'the frontier post', extract: { x: 106, y: 12, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'asphalt', margin: 12 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'concrete2', wallTint: [0.62, 0.62, 0.6], floor: 'concrete', ceil: 'concrete2', lampPower: 0.6, lampColour: [0.95, 0.95, 1], lampEvery: 5,
      channel: 4, surf: 0.6,
      carve: { size: [W, H], ops: [
        ['room', 62, 3, 68, 7],                         // the roadblock's hut
        ['room', 100, 3, 106, 7],                       // the frontier post (Ghost's)
      ], after: [
        // the valley's rock walls
        ['room', 0, 0, 61, 1, 'J'], ['room', 69, 0, 99, 1, 'J'], ['room', 0, 22, W - 1, 23, 'J'],
        ['cells', [[65, 8], [103, 8]], 'D'], ['cells', [[61, 5], [69, 5], [99, 5]], 'W'],
        ['cells', [[63, 4], [67, 6]], 'T'], ['cells', [[67, 4]], 'M'], ['cells', [[101, 4], [105, 6]], 'T'],
        // the river under the bridge (x 74 - 78), the bridge itself the road
        ['room', 74, 2, 78, 8, '~'], ['room', 74, 16, 78, 21, '~'],
        // the roadblock: sandbags across the road, a gap in the middle
        ['cells', [[60, 9], [60, 10], [60, 15], [60, 16]], 'C'],
        ['cells', [[20, 17], [34, 6], [46, 18], [88, 6], [94, 18], [10, 5]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    for (const [x0, x1] of [[0, 62], [69, 100]]) box([x0 * C, 0, 0], [x1 * C, 12, 2 * C], 'concrete2', { tint: [0.5, 0.5, 0.53] });
    box([0, 0, 22 * C], [W * C, 12, H * C], 'concrete2', { tint: [0.5, 0.5, 0.53] });
    box([60 * C, 1.0, 11 * C], [60 * C + 0.2, 1.12, 15 * C], 'paint', { tint: [0.9, 0.2, 0.15], solid: false });
    for (const [x, y] of [[60, 8], [60, 17], [103, 9]]) level.lights.push({ pos: [mid(x), 4, mid(y)], range: 12, intensity: 0.8, color: [0.95, 0.95, 1], street: true });
  },
  vehicles: [
    { id: 'ghostjeep', kind: 'jeep', model: 'armouredJeep', paint: 'olive', at: [5, 12], yaw: -Math.PI / 2, hp: 900 },
  ],
  start: { x: 3, y: 15, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'block', label: 'The valley road - the roadblock', at: [56, 2, 70, 21] },
    { id: 'bridge', label: 'The valley road - the bridge', at: [72, 2, 80, 21] },
    { id: 'post', label: 'The valley road - the frontier post', at: [96, 2, W - 1, 21] },
    { id: 'road', label: 'The Vashka valley road', at: [0, 0, W - 1, H - 1] },
  ],
  reach: [{ id: 'frontier', name: 'The frontier', at: [100, 9, 108, 20] }],
  guards: [
    { id: 'rb1', at: [59, 11, 'G'], arms: 'carbine', temper: 'steady', yaw: Math.PI / 2 },
    { id: 'rb2', at: [59, 14, 'G'], arms: 'smg', temper: 'bold', yaw: Math.PI / 2 },
    { id: 'rb3', at: [62, 17, 'G'], arms: 'carbine', temper: 'steady', yaw: Math.PI / 2 },
    { id: 'rad', at: [64, 6, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [66, 4, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'pt', at: [40, 12, 'G'], route: [[30, 12], [52, 12]], arms: 'carbine' },
    { id: 'br', at: [82, 12, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady', yaw: Math.PI / 2 },
  ],
  devices: [
    { id: 't-block', kind: 'turret', at: [62, 8, 'G'], face: [-1, 1], net: 'valley' },
    { id: 'c-block', kind: 'camera', at: [56, 9, 'G'], face: [-1, 1], net: 'valley' },
    { id: 'a-block', kind: 'alarm', at: [69, 7, 'G'], face: [1, 0], net: 'valley' },
  ],
  terminals: [{ id: 'sec', name: 'the roadblock\'s console', at: [63, 4, 'G'], face: [0, 1], time: 6, net: 'valley' }],
  intel: [
    { id: 'order', at: [67, 6, 'G'], kind: 'Orders', title: 'Orders for the roadblock', text: ['Nothing east until further notice. Anything that does not stop, the turret stops.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'reach', ref: 'frontier', text: 'Reach the frontier (the east end of the valley)' },
    { id: 'o2', kind: 'quick', secs: 180, text: 'Inside three minutes', optional: true },
  ],
};
