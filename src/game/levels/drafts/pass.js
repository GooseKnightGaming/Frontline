// FRONTLINE - Level 65, the Vashka Pass (first draft, M6.84; the first of the north). The telegram at Kessin airfield
// came "FROM THE NORTH": the reds' council beyond the Vashka hills, who sent the handler and the five. Ghost goes
// north. The only road over the hills goes through the frontier post at the Vashka Pass: a wall across the pass, a
// gate, a post either side. Get through it, and copy the frontier register on the way - it lists every courier the
// north has sent south. Quietly, if you can: a frontier that has been rung will be waiting for you all the way north.
const W = 50, H = 44;
export default {
  id: 'pass', no: 65, title: 'The Vashka Pass', place: 'the frontier post at the Vashka Pass',
  where: 'The Vashka Pass, the frontier. 03:30, snow, the gate lamps on.',
  brief: [
    ['The job', 'The telegram came "from the north": the reds\' council beyond the Vashka hills. Ghost goes north, and the only road goes through the <b>frontier post</b> at the Vashka Pass. Get through it to the <b>north side of the pass</b>. On the way, copy the <b>frontier register</b> in the customs hut. It lists every courier the north has sent south. If you can, do it <b>without the alarm</b>. A frontier that has been rung will be waiting for you all the way north.'],
    ['The place', 'Rock walls either side of the pass, and a <b>wall</b> across it with one <b>gate</b> in the middle. South of the wall (your side): the <b>guard post</b>, with the radio and the security console. North of it: the <b>customs hut</b>, with the register and the engineer. The road goes on north, into the hills.'],
    ['Security', 'Cameras on the gate, both sides; the alarm; patrols along the wall on both sides, and a dog. The gate pair do not leave the gate.'],
    ['Objectives', 'Copy the <b>frontier register</b> (the customs hut, north of the wall). Reach the <b>north side of the pass</b>. If you can, do it <b>without the alarm</b>.'],
  ],
  epilogue: {
    success: 'Over the pass and into the north, with the frontier none the wiser. The register lists sixty couriers in two years, and three of them are still in Varnholm. Ghost picks them up the same week.',
    partial: 'Through the pass, but the frontier knows something went through it, or the register stays in the customs hut. The north will be waiting.',
  },
  time: { date: [15, 2, 2027], hour: 3, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'snow',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'RCAM', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.3, 0.33, 0.4, 25, 170], ambient: [0.32, 0.34, 0.42] },
  extractName: 'the road north', extract: { x: 25, y: 1, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.2, wall: 'wood', wallTint: [0.5, 0.42, 0.34], floor: 'wood', ceil: 'wood', lampPower: 0.7, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 15, 25, 21, 30],                       // the guard post (south)
        ['room', 29, 13, 35, 18],                       // the customs hut (north)
      ], after: [
        // the pass: rock either side, the wall across it (y 21) and its gate (x 24 - 26)
        ['room', 0, 0, 11, H - 1, 'J'], ['room', 39, 0, W - 1, H - 1, 'J'],
        ['room', 12, 21, 23, 21, 'J'], ['room', 27, 21, 38, 21, 'J'],
        // (walls a square out from each room)
        ['cells', [[18, 24], [28, 15]], 'D'],
        ['cells', [[22, 27], [14, 28], [32, 12], [36, 16]], 'W'],
        ['cells', [[16, 26], [20, 29]], 'T'], ['cells', [[16, 29]], 'Y'],
        ['cells', [[30, 14], [34, 17]], 'T'], ['cells', [[34, 14]], 'M'],
        // the road's sides: rocks, a woodpile, the barrier's posts
        ['cells', [[14, 38], [16, 35], [14, 34], [34, 32], [16, 10], [34, 7], [20, 38], [31, 39], [14, 18], [36, 24]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the rock walls of the pass, high and grey; the frontier wall, and the gate's barrier
    box([0, 0, 0], [12 * C, 14, H * C], 'concrete2', { tint: [0.45, 0.46, 0.5] });
    box([39 * C, 0, 0], [W * C, 14, H * C], 'concrete2', { tint: [0.45, 0.46, 0.5] });
    box([12 * C, 0, 21 * C], [24 * C, 4, 22 * C], 'concrete2', { tint: [0.6, 0.58, 0.55] });
    box([27 * C, 0, 21 * C], [39 * C, 4, 22 * C], 'concrete2', { tint: [0.6, 0.58, 0.55] });
    box([24 * C, 1.0, 21 * C + 0.6], [27 * C, 1.12, 21 * C + 0.75], 'paint', { tint: [0.9, 0.2, 0.15], solid: false });
    for (const [x, y] of [[23, 22], [27, 20], [18, 31], [32, 11], [25, 3], [25, 40]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 13, intensity: 1, color: [1, 0.88, 0.65], street: true });
    level.signs.push({ pos: [mid(25), 4.6, 22 * C + 0.1], yaw: 0, w: 4.2, h: 0.7, text: 'VASHKA PASS', sub: 'Frontier - papers ready', col: '#3a2a22' });
  },
  start: { x: 13, y: 42, floor: 'G', yaw: 0 },
  zones: [
    { id: 'post', label: 'The Vashka Pass - the guard post', at: [15, 25, 21, 30] },
    { id: 'customs', label: 'The Vashka Pass - the customs hut', at: [29, 13, 35, 18] },
    { id: 'north', label: 'The Vashka Pass - north of the wall', at: [12, 0, 38, 20] },
    { id: 'south', label: 'The Vashka Pass - south of the wall', at: [0, 0, W - 1, H - 1] },
  ],
  reach: [{ id: 'over', name: 'The north side of the pass', at: [13, 1, 37, 5] }],
  guards: [
    { id: 'g1', at: [24, 22, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'g2', at: [26, 20, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'rad', at: [19, 27, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio', name: 'The post commander' },
    { id: 'pst', at: [16, 28, 'G'], arms: 'smg', temper: 'bold' },
    { id: 's1', at: [20, 23, 'G'], route: [[13, 23], [37, 23]], arms: 'carbine', dog: true },
    { id: 's2', at: [30, 33, 'G'], route: [[30, 26], [30, 40]], arms: 'carbine' },
    { id: 'n1', at: [20, 19, 'G'], route: [[13, 19], [37, 19]], arms: 'carbine' },
    { id: 'eng', at: [32, 16, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'cus', at: [33, 14, 'G'], arms: 'pistol', rank: 'specialist', temper: 'steady' },
    { id: 'n2', at: [25, 9, 'G'], route: [[25, 6], [25, 17]], arms: 'smg' },
  ],
  devices: [
    { id: 'c-gate-s', kind: 'camera', at: [23, 22, 'G'], face: [1, 1], net: 'vashka' },
    { id: 'c-gate-n', kind: 'camera', at: [27, 20, 'G'], face: [0, -1], net: 'vashka' },
    { id: 'a-vashka', kind: 'alarm', at: [22, 24, 'G'], face: [0, 1], net: 'vashka' },
  ],
  terminals: [
    { id: 'sec', name: 'the guard post console', at: [16, 26, 'G'], face: [1, 0], time: 6, net: 'vashka' },
    { id: 'register', name: 'the frontier register', at: [30, 14, 'G'], face: [1, 0], time: 8, verb: 'Copy', doing: 'Copying',
      said: 'Two years of the frontier register: sixty couriers south, and the names they used. Ghost has them all.' },
  ],
  intel: [
    { id: 'rota', at: [20, 29, 'G'], kind: 'Rota', title: 'The post\'s rota', text: ['Gate: two men, always. Wall: one each side, walking. "Nobody crosses after dark without a pass from the north."'] },
    { id: 'pass', at: [34, 17, 'G'], kind: 'Pass', title: 'A pass from the north', text: ['"The bearer is to be given every help and asked no questions. By order of the Council." The signature is a single letter: N.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'register', text: 'Copy the frontier register (the customs hut)' },
    { id: 'o2', kind: 'reach', ref: 'over', text: 'Reach the north side of the pass' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
