// FRONTLINE - Level 44, the Grain Terminal (first draft, M6.43): after the Glasshouse. The blight Varn bred is
// going out tonight - in a van from the grain terminal on the river, to be loaded with the export grain at dawn.
// Stop the van before it is out of the gate; find out from the shipping office where it was going.
const W = 56, H = 40;
export default {
  id: 'grain', no: 44, title: 'The Grain Terminal', place: 'the grain terminal on the river',
  where: 'The grain terminal on the river. 03:40, a hard wind off the water.',
  brief: [
    ['The job', 'What the Glasshouse was growing is a <b>blight</b> - for wheat, bred to order. It leaves the grain terminal tonight, in a van, for the export grain at dawn. <b>Stop the van</b> before it is out of the east gate. And find out where it was going: copy the <b>manifest</b> in the shipping office.'],
    ['The van', 'Parked at the warehouse\'s loading door, its driver and his mate at the cab. It goes in about two minutes - down to the quay road, then east along it to the gate. Shoot the driver, wreck it, or be at the gate before it.'],
    ['The place', 'The <b>warehouse</b> (north-west), its stacks and the loading door on its south side. The <b>silos</b> (north-east), four of them, too tall to see over. The <b>shipping office</b> (east, by the gate). The quay along the south, the river past it. You come in from the west, along the quay.'],
    ['Security', 'Cameras on the warehouse and the office, the office\'s alarm - its console in the office - and floodlights on the quay. A radio in the office, an engineer about the yard, a dog with the man on the quay road.'],
    ['Objectives', '<b>Stop the van</b>. Copy the <b>manifest</b> (the shipping office). Out the way you came, to the west.'],
  ],
  time: { date: [29, 12, 2026], hour: 3, minute: 40 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'wind',
  atmos: { fog: [0.12, 0.14, 0.17, 30, 200], ambient: [0.26, 0.28, 0.32] },
  extractName: 'the quay, to the west', extract: { x: 2, y: 34, floor: 'G' },
  outside: { backdrop: 'city', mat: 'concrete', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 7, wall: 'metal', wallTint: [0.55, 0.58, 0.6], floor: 'concrete', ceil: 'metal', lampPower: 0.7, lampEvery: 8,
      carve: { size: [W, H], ops: [
        ['room', 6, 6, 30, 22],                         // the warehouse
        ['room', 38, 20, 48, 26],                       // the shipping office
      ], after: [
        ['cells', [[18, 23], [19, 23], [26, 23], [27, 23], [37, 23], [43, 27]], 'D'],
        ['cells', [[10, 5], [20, 5], [5, 12], [5, 18], [49, 22], [40, 19], [46, 19]], 'W'],
        // the warehouse's stacks
        ['room', 9, 8, 12, 10, 'C'], ['room', 9, 14, 12, 16, 'C'], ['room', 16, 8, 18, 12, 'C'], ['room', 22, 8, 27, 9, 'C'],
        ['room', 22, 14, 24, 18, 'C'], ['cells', [[14, 19], [15, 19], [28, 12], [28, 13]], 'B'],
        ['cells', [[13, 13], [20, 15], [26, 13]], 'P'],
        // the office
        ['cells', [[40, 22], [42, 22]], 'T'], ['cells', [[46, 21], [46, 23]], 'H'], ['cells', [[44, 25]], 'Z'],
        // the quay: bollards (low walls), crates, the river's edge (a low wall along it)
        ['room', 0, 37, W - 1, 37, 'w'],
        ['cells', [[8, 33], [16, 33], [34, 33], [42, 33]], 'C'], ['cells', [[12, 27], [32, 27], [47, 31]], 'B'],
        ['cells', [[2, 2], [33, 2], [52, 4], [52, 16], [2, 24]], 't'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the four silos: too tall to see over, a catwalk between their tops (not reachable: a skyline)
    for (const [x, y] of [[38, 6], [43, 6], [38, 12], [43, 12]]) box([x * C, 0, y * C], [(x + 3) * C, 22, (y + 3) * C], 'concrete2', { tint: [0.72, 0.7, 0.66] });
    box([38 * C, 21, 7.3 * C], [46 * C, 21.4, 7.7 * C], 'metal', { solid: false });
    // the floodlights on the quay
    for (const x of [10, 26, 42]) level.lights.push({ pos: [mid(x), 7, mid(35)], range: 20, intensity: 1.1, color: [1, 0.95, 0.85], street: true });
    level.signs.push({ pos: [mid(18.5), 6.2, 22 * C + C + 0.14], yaw: 0, w: 4.2, h: 0.7, text: 'TERMINAL 3', sub: 'Export grain', col: '#2b3a2b' });
  },
  vehicles: [
    // the blight's van: at the loading door, then down to the quay road and east, out of the gate
    { id: 'van', kind: 'car', model: 'lightUtility', paint: 'white', at: [22.5, 26], yaw: Math.PI, path: [[22.5, 26], [22.5, 30], [40, 30], [50, 30], [W + 2, 30], [W + 8, 30]],
      speed: 11, goal: 'escape', wait: 120, hp: 520, name: 'The blight van',
      crew: [{ id: 'drv', at: [-0.42, 0.15] }, { id: 'mate', at: [0.42, 0.15] }] },
  ],
  start: { x: 1, y: 34, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'wh', label: 'The grain terminal - the warehouse', at: [6, 6, 30, 22] },
    { id: 'office', label: 'The grain terminal - the shipping office', at: [38, 20, 48, 26] },
    { id: 'silos', label: 'The grain terminal - the silos', at: [36, 4, 48, 16] },
    { id: 'quay', label: 'The grain terminal - the quay', at: [0, 28, W - 1, H - 1] },
    { id: 'yard', label: 'The grain terminal', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'drv', at: [22, 26, 'G'], arms: 'smg', temper: 'steady', name: 'The driver' },
    { id: 'mate', at: [23, 26, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'w1', at: [14, 12, 'G'], route: [[8, 12], [28, 12], [28, 20], [8, 20]], arms: 'carbine' },
    { id: 'w2', at: [20, 20, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'door', at: [26, 25, 'G'], arms: 'carbine', rank: 'sergeant', temper: 'steady' },
    { id: 's1', at: [35, 10, 'G'], route: [[35, 4], [35, 17], [49, 17], [49, 4]], arms: 'carbine' },
    { id: 'clerk', at: [41, 24, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', role: 'radio' },
    { id: 'o2', at: [45, 22, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'eng', at: [32, 18, 'G'], route: [[32, 18], [34, 25]], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'gate', at: [52, 27, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'q1', at: [30, 32, 'G'], route: [[14, 32], [48, 32]], arms: 'carbine', dog: true },
  ],
  devices: [
    { id: 'c-wh', kind: 'camera', at: [6, 22, 'G'], face: [1, -1], net: 'terminal' },
    { id: 'c-dock', kind: 'camera', at: [30, 22, 'G'], face: [-1, -1], net: 'terminal' },
    { id: 'c-off', kind: 'camera', at: [48, 20, 'G'], face: [-1, 1], net: 'terminal' },
    { id: 'a-off', kind: 'alarm', at: [38, 24, 'G'], face: [1, 0], net: 'terminal' },
  ],
  terminals: [
    { id: 'sec', name: 'the office\'s security console', at: [47, 25, 'G'], face: [-1, 0], time: 6, net: 'terminal' },
    { id: 'manifest', name: 'the shipping office\'s manifest', at: [40, 21, 'G'], face: [0, 1], time: 7, reveal: 25, verb: 'Copy', doing: 'Copying',
      said: 'The manifest: the van\'s load to go aboard the Dalmar Star, for Kessin - and the next consignment already booked, for the spring. Every red here on your radar for 25 seconds.' },
  ],
  objectives: [
    { id: 'o1', kind: 'stop', ref: 'van', text: 'Stop the blight van before it is out of the east gate' },
    { id: 'o2', kind: 'hack', ref: 'manifest', text: 'Copy the manifest (the shipping office)' },
  ],
};
