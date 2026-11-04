// FRONTLINE - Level 120, the Motorcade (first draft, M6.142; THE WITNESSES, second). Marta Lind has to reach the Lessar
// courthouse by nine, and the only road in from the safe house runs along the river embankment. The men who came for
// her at the tenement have two more tries planned on it: the old customs barrier, and the bridge at the fish market,
// which has a gun on its toll house. Drive her in.
const W = 130, H = 24;
export default {
  id: 'motorcade', no: 120, title: 'The Motorcade', place: 'the river embankment, Lessar',
  where: 'The river embankment, Lessar. 08:30, a grey morning, Marta Lind in the back seat.',
  brief: [
    ['The job', '<b>Marta Lind</b> has to reach the <b>Lessar courthouse</b> by nine, and the only road in from the safe house runs along the <b>river embankment</b>. The men who came for her at the tenement have <b>two more tries</b> planned on it: the old customs barrier, and the bridge at the fish market, which has a <b>gun</b> on its toll house. Drive her in. If you can, get there <b>inside three and a half minutes</b>.'],
    ['The place', 'One road east along the embankment, with the river wall on one side and the warehouses on the other. The <b>customs barrier</b> is halfway along. The <b>fish market bridge</b> comes after it, with the toll house and its gun. Then the courthouse steps, where Ghost is waiting.'],
    ['Security', 'The toll house\'s gun, its camera and its alarm are on the toll house console, with the radio and the engineer. The barrier is just men and a lorry across the road. A car at speed is hard to stop. You can also stop, go round on foot, and turn the gun on them.'],
    ['Objectives', '<b>Reach the courthouse</b> (the east end). If you can, <b>inside three and a half minutes</b>.'],
  ],
  epilogue: {
    success: 'The car pulls up at the courthouse steps at five to nine with two bullet holes in its boot and Marta Lind unhurt in the back. She walks up the steps on her own, and the court rises at nine for the first witness.',
    partial: 'She got there late and shaken, but she got there. The court waits for her.',
  },
  time: { date: [19, 8, 2027], hour: 8, minute: 30 }, night: false, faction: 'red', requires: 'HACKKIT', weather: 'rain',
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.5, 0.52, 0.56, 40, 240], ambient: [0.48, 0.5, 0.54] },
  extractName: 'the courthouse steps', extract: { x: 126, y: 12, floor: 'G' },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 12 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'concrete2', wallTint: [0.62, 0.62, 0.6], floor: 'concrete', ceil: 'concrete2', lampPower: 0.6, lampColour: [0.95, 0.95, 1], lampEvery: 5,
      channel: 4, surf: 0.6,
      carve: { size: [W, H], ops: [
        ['room', 80, 3, 86, 7],                         // the second roadblock's hut
        ['room', 120, 3, 126, 7],                       // Ghost's post
      ], after: [
        // the cliff on the east, the sea's edge on the west
        ['room', 0, 0, 79, 1, 'J'], ['room', 87, 0, 119, 1, 'J'], ['room', 0, 22, W - 1, 23, 'J'],
        ['cells', [[83, 8], [123, 8]], 'D'], ['cells', [[79, 5], [87, 5], [119, 5]], 'W'],
        ['cells', [[81, 4], [85, 6]], 'T'], ['cells', [[85, 4]], 'M'], ['cells', [[121, 4], [125, 6]], 'T'],
        // the first try (the customs barrier): sandbags, a gap in the middle
        ['cells', [[40, 9], [40, 10], [40, 15], [40, 16]], 'C'],
        // the second (the fishing village): the same, and the village's sheds
        ['cells', [[78, 9], [78, 10], [78, 15], [78, 16]], 'C'],
        ['cells', [[20, 17], [30, 6], [52, 18], [64, 5], [96, 18], [104, 6], [112, 17], [8, 5]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    for (const [x0, x1] of [[0, 80], [87, 120]]) box([x0 * C, 0, 0], [x1 * C, 12, 2 * C], 'concrete2', { tint: [0.45, 0.45, 0.48] });
    box([0, 0, 22 * C], [W * C, 1.2, H * C], 'concrete2', { tint: [0.4, 0.42, 0.45] });
    for (const x of [40, 78]) box([x * C, 1.0, 11 * C], [x * C + 0.2, 1.12, 15 * C], 'paint', { tint: [0.9, 0.2, 0.15], solid: false });
    for (const [x, y] of [[40, 8], [40, 17], [78, 8], [78, 17], [123, 9]]) level.lights.push({ pos: [mid(x), 4, mid(y)], range: 12, intensity: 0.8, color: [0.95, 0.95, 1], street: true });
  },
  vehicles: [
    { id: 'ghostjeep', kind: 'jeep', model: 'armouredJeep', paint: 'grey', at: [5, 12], yaw: -Math.PI / 2, hp: 1000 },
  ],
  start: { x: 3, y: 15, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'block1', label: 'The embankment - the customs barrier', at: [34, 2, 46, 21] },
    { id: 'block2', label: 'The embankment - the fish market bridge', at: [74, 2, 90, 21] },
    { id: 'lines', label: 'The embankment - the courthouse', at: [116, 2, W - 1, 21] },
    { id: 'road', label: 'The river embankment, Lessar', at: [0, 0, W - 1, H - 1] },
  ],
  reach: [{ id: 'lines', name: 'The courthouse steps', at: [120, 9, 128, 20] }],
  guards: [
    { id: 'a1', at: [39, 11, 'G'], arms: 'carbine', temper: 'steady', yaw: Math.PI / 2 },
    { id: 'a2', at: [39, 14, 'G'], arms: 'smg', temper: 'bold', yaw: Math.PI / 2 },
    { id: 'a3', at: [42, 18, 'G'], arms: 'carbine', yaw: Math.PI / 2 },
    { id: 'b1', at: [77, 11, 'G'], arms: 'carbine', temper: 'steady', yaw: Math.PI / 2 },
    { id: 'b2', at: [77, 14, 'G'], arms: 'smg', temper: 'bold', yaw: Math.PI / 2 },
    { id: 'b3', at: [80, 17, 'G'], arms: 'carbine', temper: 'steady', yaw: Math.PI / 2 },
    { id: 'rad', at: [82, 6, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [84, 4, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'pt', at: [60, 12, 'G'], route: [[50, 12], [70, 12]], arms: 'carbine' },
    { id: 'sn', at: [100, 12, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady', yaw: Math.PI / 2 },
  ],
  devices: [
    { id: 't-block', kind: 'turret', at: [80, 8, 'G'], face: [-1, 1], net: 'coast' },
    { id: 'c-block', kind: 'camera', at: [74, 9, 'G'], face: [-1, 1], net: 'coast' },
    { id: 'a-block', kind: 'alarm', at: [87, 7, 'G'], face: [1, 0], net: 'coast' },
  ],
  terminals: [{ id: 'sec', name: 'the toll house console', at: [81, 4, 'G'], face: [0, 1], time: 6, net: 'coast' }],
  intel: [
    { id: 'order', at: [85, 6, 'G'], kind: 'Note', title: 'A note in the toll house', text: ['"Grey saloon, Ghost driving, the woman in the back. Not the driver. The woman."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'reach', ref: 'lines', text: 'Reach the courthouse (the east end)' },
    { id: 'o2', kind: 'quick', secs: 210, text: 'Inside three and a half minutes', optional: true },
  ],
};
