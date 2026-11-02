// FRONTLINE - Level 55, the Holm Bridge (first draft, M6.73; after Hollin Mill). Mr Pell cut a flaw into every plate:
// one hair out of place in the crest. With it, Ghost can tell the reds' forged passes from real ones - and tonight a
// red agent crosses the Holm Bridge checkpoint on one, in a car with the mill's last delivery. Go in as one of the
// checkpoint's own, copy the register, take the forged passes, and do not let the car across.
const W = 44, H = 44;
export default {
  id: 'holm', no: 55, title: 'The Holm Bridge', place: 'the Holm Bridge checkpoint',
  where: 'The Holm Bridge checkpoint, on the Varnholm road. 05:30, before dawn, frost on the road.',
  brief: [
    ['The job', 'Mr Pell\'s flaw shows which passes are forged, and tonight a <b>red agent</b> crosses the <b>Holm Bridge</b> on one, with the mill\'s last delivery in his car. Copy the checkpoint\'s <b>register</b> to get every forged pass that has come through. Take the <b>forged passes</b> waiting for him in the customs house. And <b>stop his car</b> before it is over the bridge and away south.'],
    ['The place', 'The road runs north to south over the river by the <b>bridge</b>, the only way across. North end: the <b>customs house</b> (east of the road) and the barrier hut (west). South end: the guard hut and the barracks. The agent\'s car waits in the queue at the north barrier; when his papers are stamped, it goes.'],
    ['Cover', 'You go in <b>dressed as one of them</b>: a checkpoint inspector. It holds as long as you do not do anything an inspector would not. Cameras on the road, the alarm, the radio in the south hut, the engineer in the customs house.'],
    ['Objectives', '<b>Stop the agent\'s car</b> before it is over the bridge and away. <b>Copy the register</b> (the customs house). Take the <b>forged passes</b> (the customs house). Out on foot, south-west.'],
  ],
  epilogue: {
    success: 'The register runs to three hundred names, every one on a pass from Hollin Mill. By the end of the week the checkpoints have the flaw to look for, and the reds\' people in the city cannot travel, cannot draw rations and cannot get out. Their papers are worth nothing now.',
    partial: 'Some of it: the car, or the register, or the passes. The reds will learn their papers are being read, and they will find another engraver. Not as good as Pell, but good enough.',
  },
  time: { date: [24, 1, 2027], hour: 5, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT', startDisguise: 'red',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.16, 0.18, 0.22, 20, 150], ambient: [0.26, 0.28, 0.33] },
  extractName: 'the river path, south-west', extract: { x: 3, y: 42, floor: 'G' },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 12 },
  floors: {
    G: {
      y: 0, wallH: 3.2, wall: 'paint', wallTint: [0.7, 0.72, 0.66], floor: 'tile', floorTint: [0.6, 0.6, 0.58], ceil: 'plaster', lampPower: 0.65, lampColour: [0.95, 0.95, 1], lampEvery: 6,
      channel: 4, surf: 0.6,
      carve: { size: [W, H], ops: [
        ['room', 27, 6, 35, 12],                        // the customs house
        ['room', 12, 8, 17, 12],                        // the barrier hut
        ['room', 27, 31, 33, 35],                       // the guard hut
        ['room', 8, 31, 16, 37],                        // the barracks
      ], after: [
        // (walls a square out from each room)
        ['cells', [[26, 9], [30, 13], [18, 10], [26, 33], [17, 34]], 'D'],
        ['cells', [[31, 5], [36, 9], [26, 7], [11, 10], [30, 30], [34, 33], [12, 30], [7, 34]], 'W'],
        // the river, and the bridge (x 20 - 23) over it: rails along the bridge and along the banks
        ['room', 2, 18, 18, 25, '~'], ['room', 25, 18, 41, 25, '~'],
        ['room', 19, 18, 19, 25, '='], ['room', 24, 18, 24, 25, '='],
        ['room', 2, 17, 18, 17, '='], ['room', 25, 17, 41, 17, '='], ['room', 2, 26, 18, 26, '='], ['room', 25, 26, 41, 26, '='],
        ['cells', [[8, 17], [36, 26]], '.'],                                         // gaps: the steps down to the water
        // inside: the customs desks, the barrier hut's counter, the guard hut, the bunks
        ['cells', [[29, 8], [29, 11]], 'T'], ['cells', [[33, 11]], 'K'], ['cells', [[35, 7]], 'M'],
        ['cells', [[14, 10]], 'K'], ['cells', [[16, 9]], 'T'],
        ['cells', [[29, 33], [32, 32]], 'T'],
        ['cells', [[9, 33], [9, 36], [15, 33], [15, 36]], 'Y'], ['cells', [[12, 35]], 'T'],
        // the road's side: sandbags, a sentry box's crates
        ['cells', [[19, 14], [24, 14], [19, 28], [24, 28], [6, 6], [38, 39]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the barrier poles, north and south; the bridge's parapets are the rails
    box([19 * C, 1.0, 15 * C + 0.6], [21 * C, 1.12, 15 * C + 0.75], 'paint', { tint: [0.9, 0.2, 0.15], solid: false });
    box([23 * C, 1.0, 29 * C + 0.6], [25 * C, 1.12, 29 * C + 0.75], 'paint', { tint: [0.9, 0.2, 0.15], solid: false });
    for (const [x, y] of [[19, 13], [24, 13], [19, 29], [24, 29], [21, 21], [30, 15], [12, 28]]) level.lights.push({ pos: [mid(x), 5, mid(y)], range: 14, intensity: 1, color: [0.95, 0.95, 1], street: true });
    level.signs.push({ pos: [mid(21.5), 4.2, 15 * C], yaw: 0, w: 3.6, h: 0.7, text: 'HOLM BRIDGE', sub: 'Papers ready', col: '#3a3a3a' });
  },
  vehicles: [
    // the agent's car: in the queue at the north barrier; when his papers are stamped, south over the bridge and away
    { id: 'car', kind: 'car', paint: 'black', at: [21.5, 4], yaw: Math.PI, path: [[21.5, 4], [21.5, 15], [21.5, 28], [21.5, 40], [21.5, H + 2], [21.5, H + 8]],
      speed: 10, goal: 'escape', wait: 150, hp: 480, name: 'The agent\'s car',
      crew: [{ id: 'drv', at: [-0.42, 0.15] }, { id: 'agent', at: [0.42, 0.15] }] },
  ],
  start: { x: 3, y: 3, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'customs', label: 'The Holm Bridge - the customs house', at: [27, 6, 35, 12] },
    { id: 'hut', label: 'The Holm Bridge - the barrier hut', at: [12, 8, 17, 12] },
    { id: 'guard', label: 'The Holm Bridge - the guard hut', at: [27, 31, 33, 35] },
    { id: 'barr', label: 'The Holm Bridge - the barracks', at: [8, 31, 16, 37] },
    { id: 'bridge', label: 'The Holm Bridge', at: [19, 17, 24, 26] },
    { id: 'north', label: 'The Holm Bridge - the north end', at: [0, 0, W - 1, 16] },
    { id: 'south', label: 'The Holm Bridge - the south end', at: [0, 27, W - 1, H - 1] },
    { id: 'river', label: 'The Holm Bridge - the river', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'drv', at: [21, 4, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'agent', at: [22, 4, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The agent', tint: [0.25, 0.25, 0.3] },
    { id: 'chief', at: [31, 9, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The customs chief' },
    { id: 'eng', at: [34, 11, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'bar1', at: [20, 13, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'bar2', at: [15, 11, 'G'], arms: 'smg' },
    { id: 'br', at: [21, 20, 'G'], route: [[21, 16], [21, 27]], arms: 'carbine' },
    { id: 'n1', at: [10, 15, 'G'], route: [[3, 15], [40, 15]], arms: 'carbine' },
    { id: 'rad', at: [31, 34, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 's1', at: [23, 30, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 's2', at: [30, 28, 'G'], route: [[3, 28], [40, 28]], arms: 'smg', dog: true },
    { id: 'bk', at: [12, 34, 'G'], arms: 'carbine', temper: 'bold' },
  ],
  // (the queue: people with real papers, waiting)
  civilians: [
    { id: 'lorry', at: [17, 3, 'G'], yaw: -Math.PI / 2, title: 'A lorry driver', tint: [0.7, 0.6, 0.5], says: ['Two hours I\'ve been waiting. The black car in front went straight to the head of the queue.', 'Real papers, mine. Not that it matters to them.'] },
    { id: 'woman', at: [25, 2, 'G'], yaw: Math.PI / 2, title: 'A woman in the queue', tint: [0.9, 0.75, 0.8], says: ['They took my husband\'s pass and said it was forged. It was not forged. We\'ve had it ten years.', 'The man in the black car? They saluted him.'] },
  ],
  pickups: [{ id: 'passes', name: 'The forged passes', what: 'the passes', at: [29, 11, 'G'], table: true, colour: [0.85, 0.78, 0.55] }],
  devices: [
    { id: 'c-north', kind: 'camera', at: [25, 13, 'G'], face: [-1, 1], net: 'holm' },
    { id: 'c-south', kind: 'camera', at: [18, 30, 'G'], face: [1, -1], net: 'holm' },
    { id: 'a-holm', kind: 'alarm', at: [30, 13, 'G'], face: [0, 1], net: 'holm' },
  ],
  terminals: [
    { id: 'sec', name: 'the guard hut console', at: [32, 32, 'G'], face: [-1, 0], time: 6, net: 'holm' },
    { id: 'register', name: 'the checkpoint register', at: [29, 8, 'G'], face: [0, 1], time: 8, reveal: 20, verb: 'Copy', doing: 'Copying',
      said: 'Every pass through the Holm Bridge for a year, and with Pell\'s flaw to look for, three hundred of them are the mill\'s. Every red here is on your radar for 20 seconds.' },
  ],
  intel: [
    { id: 'standing', at: [16, 9, 'G'], kind: 'Orders', title: 'Standing orders, the barrier hut', text: ['Cars with the blue card in the window are not to be stopped, searched or entered in the book.', 'Anyone who asks why is to be sent to the customs chief.'] },
    { id: 'book', at: [12, 35, 'G'], kind: 'Letter', title: 'A letter on a bunk', text: ['They have us turning back people with good papers and waving through cars with none. Nobody here likes it.', 'Nobody here says so, either.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'stop', ref: 'car', text: 'Stop the agent\'s car before it is over the bridge and away' },
    { id: 'o2', kind: 'hack', ref: 'register', text: 'Copy the register (the customs house)' },
    { id: 'o3', kind: 'take', ref: 'passes', text: 'Take the forged passes (the customs house)' },
  ],
};
