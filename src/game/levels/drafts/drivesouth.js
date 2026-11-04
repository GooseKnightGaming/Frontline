// FRONTLINE - Level 99, the Drive South (first draft, M6.121; the end of THE GENERAL). The General is in the back of a
// borrowed jeep with his dispatch box on his knees, and the north has found out. Every road out of Hollen is closed but
// the coast road, and that has two roadblocks on it. Drive the General down the coast road, through both, to Ghost's
// lines at the river mouth.
const W = 130, H = 24;
export default {
  id: 'drivesouth', no: 99, title: 'The Drive South', place: 'the coast road south of Hollen',
  where: 'The coast road south of Hollen. 04:30, rain off the sea, the General in the back seat.',
  brief: [
    ['The job', 'The General is in the back of a <b>borrowed jeep</b> with his dispatch box on his knees, and the north has found out. Every road out of Hollen is closed except the <b>coast road</b>, which has <b>two roadblocks</b> on it. Drive the General down the coast road, through both of them, to <b>Ghost\'s lines</b> at the river mouth. If you can, get there <b>inside four minutes</b>.'],
    ['The place', 'One road south along the cliffs, with the sea on one side and rock on the other. The <b>first roadblock</b> is at the lighthouse turning. The <b>second</b> is at the fishing village, and has a <b>turret</b>. After that come the long straight to the river mouth and <b>Ghost\'s lines</b>.'],
    ['Security', 'The second roadblock\'s turret, camera and alarm are on its hut\'s console, with its radio and engineer. The first is just men and sandbags. A jeep at speed is hard to stop. You can also stop, go round on foot, and turn the turret on them.'],
    ['Objectives', '<b>Reach Ghost\'s lines</b> (the river mouth, the south end). If you can, <b>inside four minutes</b>.'],
  ],
  epilogue: {
    success: 'The jeep comes into Ghost\'s lines at the river mouth with the General asleep in the back, of all things. His dispatch box goes to the people who will try him, and the north gets a new general, who has read the Courier and has no wish to be the next.',
    partial: 'The General got through, late and the hard way. He still gets his trial.',
  },
  time: { date: [24, 5, 2027], hour: 4, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'rain',
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.2, 0.22, 0.27, 40, 240], ambient: [0.32, 0.34, 0.4] },
  extractName: 'Ghost\'s lines', extract: { x: 126, y: 12, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'asphalt', margin: 12 },
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
        // the first roadblock (the lighthouse turning): sandbags, a gap in the middle
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
    { id: 'ghostjeep', kind: 'jeep', model: 'armouredJeep', paint: 'olive', at: [5, 12], yaw: -Math.PI / 2, hp: 1000 },
  ],
  start: { x: 3, y: 15, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'block1', label: 'The coast road - the lighthouse turning', at: [34, 2, 46, 21] },
    { id: 'block2', label: 'The coast road - the fishing village', at: [74, 2, 90, 21] },
    { id: 'lines', label: 'The coast road - Ghost\'s lines', at: [116, 2, W - 1, 21] },
    { id: 'road', label: 'The coast road', at: [0, 0, W - 1, H - 1] },
  ],
  reach: [{ id: 'lines', name: 'Ghost\'s lines', at: [120, 9, 128, 20] }],
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
  terminals: [{ id: 'sec', name: 'the village roadblock\'s console', at: [81, 4, 'G'], face: [0, 1], time: 6, net: 'coast' }],
  intel: [
    { id: 'order', at: [85, 6, 'G'], kind: 'Orders', title: 'Orders for the coast road', text: ['The General\'s car is not to pass, whoever is driving it. If the General is in it, he is not to be harmed. Use your judgement.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'reach', ref: 'lines', text: 'Reach Ghost\'s lines (the river mouth, the south end)' },
    { id: 'o2', kind: 'quick', secs: 240, text: 'Inside four minutes', optional: true },
  ],
};
