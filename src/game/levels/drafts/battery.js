// FRONTLINE - Level 75, the Kessin Battery (first draft, M6.97; the end of the coast). The last of the paymaster's
// agents are to be taken off the coast by Ghost's own boats tonight, and the reds' coast battery on the Kessin cliffs
// would see them and fire. Go up with Hale and Moss, lock the guns out from the fire-control bunker, and hold the
// bunker while the boats come in and go out again.
const W = 50, H = 40;
export default {
  id: 'battery', no: 75, title: 'The Kessin Battery', place: 'the coast battery on the Kessin cliffs',
  where: 'The Kessin cliffs, the coast battery. 02:20, a moonless night, Ghost\'s boats an hour off.',
  brief: [
    ['The job', 'Ghost\'s boats come in tonight to take the last of the paymaster\'s agents off the coast, and the reds\' <b>coast battery</b> on the cliffs would see them and open fire. Go up with <b>Hale and Moss</b>. In the <b>fire-control bunker</b>, <b>lock the guns out</b>. Then <b>hold the bunker</b> for <b>ninety seconds</b> while the boats come in and go out again. If you can, take the <b>battery commander</b> alive.'],
    ['The place', 'Two <b>gun pits</b> on the cliff edge (north), the <b>fire-control bunker</b> between them, the <b>magazine</b> west and the barracks south-east. You come up the cliff path from the beach, south.'],
    ['Security', 'Cameras on the bunker and the barracks, the alarm. The radio and the console are in the barracks, the engineer in the magazine. Patrols on the clifftop. When the hold starts, more will come from the barracks and up the road.'],
    ['Objectives', '<b>Lock out the guns</b> (the fire-control bunker). <b>Hold the bunker</b> while the boats come and go. If you can, take the <b>commander</b> alive. Back down the cliff path.'],
  ],
  epilogue: {
    success: 'The guns stay silent, and below the cliffs Ghost\'s boats come and go in the dark with eleven people aboard. The coast is closed: no money, no agents, no paymaster.',
    partial: 'The boats got in and out, but not cleanly. One of them was hit on the way out. Everyone aboard lived, which is more than anyone expected.',
  },
  time: { date: [6, 4, 2027], hour: 2, minute: 20 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'wind',
  relations: { red: { you: true, ghost: true }, ghost: { you: false, red: true } },
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.1, 0.11, 0.15, 30, 200], ambient: [0.22, 0.23, 0.3] },
  extractName: 'the cliff path, south', extract: { x: 25, y: 38, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'concrete2', wallTint: [0.58, 0.58, 0.56], floor: 'concrete', ceil: 'concrete2', lampPower: 0.55, lampColour: [0.95, 0.95, 1], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 20, 8, 30, 14],                        // the fire-control bunker
        ['room', 4, 10, 10, 16],                        // the magazine
        ['room', 37, 22, 45, 29],                       // the barracks
      ], after: [
        ['cells', [[25, 15], [11, 13], [36, 25]], 'D'],
        ['cells', [[25, 7], [19, 11], [31, 11], [41, 21], [46, 25]], 'W'],
        ['room', 22, 9, 28, 9, 'K'], ['cells', [[22, 13], [28, 13]], 'T'], ['cells', [[29, 12]], 'H'],
        ['room', 5, 11, 9, 11, 'C'], ['cells', [[9, 15]], 'T'],
        ['room', 38, 23, 38, 28, 'Y'], ['cells', [[44, 23], [43, 28]], 'T'],
        // the gun pits on the cliff edge: the guns, sandbags round them
        ['room', 7, 3, 10, 4, 'M'], ['room', 40, 3, 43, 4, 'M'],
        ['cells', [[6, 6], [11, 6], [39, 6], [44, 6]], 'C'],
        // the clifftop: rocks, the road's sandbags
        ['cells', [[16, 20], [34, 20], [14, 28], [30, 31], [20, 34], [8, 24], [44, 33]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the guns' barrels over the cliff edge
    for (const x of [8.5, 41.5]) box([mid(x) - 0.2, 1.4, 0], [mid(x) + 0.2, 1.8, 3 * C], 'metal', { tint: [0.35, 0.36, 0.34] });
    for (const [x, y] of [[25, 17], [8, 18], [40, 19], [25, 33]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 12, intensity: 0.85, color: [0.95, 0.95, 1], street: true });
  },
  start: { x: 25, y: 38, floor: 'G', yaw: 0 },
  zones: [
    { id: 'bunker', label: 'The Kessin Battery - the fire-control bunker', at: [20, 8, 30, 14] },
    { id: 'mag', label: 'The Kessin Battery - the magazine', at: [4, 10, 10, 16] },
    { id: 'barr', label: 'The Kessin Battery - the barracks', at: [37, 22, 45, 29] },
    { id: 'pits', label: 'The Kessin Battery - the gun pits', at: [0, 0, W - 1, 7] },
    { id: 'top', label: 'The Kessin Battery', at: [0, 0, W - 1, H - 1] },
  ],
  reach: [
    { id: 'hold', name: 'The fire-control bunker', at: [21, 9, 29, 13], hold: 90, after: 'guns',
      said: 'Ninety seconds. Below the cliffs the boats are in, loaded, and away into the dark. Back down the path.' },
  ],
  guards: [
    { id: 'hale', at: [24, 39, 'G'], faction: 'ghost', ally: true, name: 'Hale', arms: 'carbine', temper: 'steady', tint: [0.45, 0.6, 1.35] },
    { id: 'moss', at: [26, 39, 'G'], faction: 'ghost', ally: true, name: 'Moss', arms: 'smg', temper: 'bold', tint: [0.4, 0.55, 1.3] },
    { id: 'cmdr', at: [26, 11, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The battery commander' },
    { id: 'fc', at: [23, 12, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'eng', at: [7, 14, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'rad', at: [41, 25, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'bk', at: [43, 26, 'G'], arms: 'carbine', temper: 'bold' },
    { id: 'g1', at: [8, 7, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'g2', at: [41, 7, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'p1', at: [25, 18, 'G'], route: [[12, 18], [38, 18]], arms: 'carbine', dog: true },
    { id: 'w1a', at: [44, 31, 'G'], arms: 'carbine', reserve: true, wave: 1 }, { id: 'w1b', at: [46, 30, 'G'], arms: 'smg', reserve: true, wave: 1 },
    { id: 'w2a', at: [2, 20, 'G'], arms: 'carbine', reserve: true, wave: 2 }, { id: 'w2b', at: [48, 12, 'G'], arms: 'shotgun', reserve: true, wave: 2 },
    { id: 'w2c', at: [2, 30, 'G'], arms: 'carbine', reserve: true, wave: 2 },
  ],
  devices: [
    { id: 'c-bunker', kind: 'camera', at: [31, 15, 'G'], face: [1, 1], net: 'battery' },
    { id: 'c-barr', kind: 'camera', at: [36, 21, 'G'], face: [-1, -1], net: 'battery' },
    { id: 'a-battery', kind: 'alarm', at: [19, 15, 'G'], face: [-1, 0], net: 'battery' },
  ],
  terminals: [
    { id: 'sec', name: 'the barracks console', at: [44, 23, 'G'], face: [-1, 0], time: 6, net: 'battery' },
    { id: 'guns', name: 'the fire-control table', at: [28, 13, 'G'], face: [-1, 0], time: 8, verb: 'Lock out', doing: 'Locking out',
      said: 'The guns are locked out at the table. They cannot lay a round on anything until Ghost says so. Now hold the bunker while the boats come in.' },
  ],
  intel: [
    { id: 'range', at: [22, 13, 'G'], kind: 'Range card', title: 'The battery\'s range card', text: ['Every cove on the coast with its bearing and range, in a careful hand. The commander has written in the last one himself: "Hollis\'s cove - do not fire."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'guns', text: 'Lock out the guns (the fire-control bunker)' },
    { id: 'o2', kind: 'reach', ref: 'hold', text: 'Hold the bunker while the boats come and go' },
    { id: 'o3', kind: 'capture', ref: 'cmdr', text: 'Take the battery commander alive', optional: true },
  ],
};
