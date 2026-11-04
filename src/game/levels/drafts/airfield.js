// FRONTLINE - Level 64, Kessin Airfield (first draft, M6.81; the end of the five). The two chiefs Ghost chose to
// watch have run: after the Courier's front page, the chief from Kessin and the chief from Drosk mean to fly out of
// Kessin's little airfield before dawn, in a borrowed jet. The one from Drosk is aboard already. The one from Kessin
// is waiting in the lounge for the last of his papers. Hold the jet on the ground, and take the Kessin man alive.
const W = 62, H = 44;
const taxi = [[24, 24], [44, 24], [52, 27], [56, 32], [52, 37], [40, 38.5], [20, 38.5], [2, 38.5]];
export default {
  id: 'airfield', no: 64, title: 'Kessin Airfield', place: 'Kessin airfield',
  where: 'Kessin airfield, on the coast road. 05:20, before dawn, a jet on the apron with its engines warm.',
  brief: [
    ['The job', 'The two chiefs Ghost chose to watch are running. The <b>chief from Drosk</b> is aboard a jet on the apron, and it goes in a few minutes, with or without the other one. <b>Stop the jet</b>: ground it from the <b>control tower</b> (its cab, upstairs), or stop it any way you can before it is off the runway. The <b>chief from Kessin</b> is waiting in the terminal lounge. <b>Take him alive</b>. Take the <b>flight plan</b> from the tower too, if you can.'],
    ['The place', 'The <b>terminal</b> (the lounge, the office) along the north side, the <b>control tower</b> east of it, the hangar north-east. The apron in the middle, where the jet is, and the runway along the south side. It taxis east, round, and takes off west.'],
    ['Security', 'Guards round the apron, cameras on the terminal and the hangar, the alarm. The radio is in the terminal office, the engineer in the hangar. Their pilot will not stop for anything short of the tower.'],
    ['Objectives', '<b>Stop the jet</b> before it is away. <b>Take the chief from Kessin alive</b> (the lounge). If you can, take the <b>flight plan</b> (the tower). Out by the coast road, west.'],
  ],
  epilogue: {
    success: 'The jet sits on the apron with its engines off, and two of the five are in Ghost\'s hands, one of them talking already. The reds\' council in the north has stopped answering its telephone. The five are finished.',
    partial: 'One of the two got away, by air or on foot. He will turn up somewhere else with a new name, and Ghost will have to look for him all over again.',
  },
  time: { date: [12, 2, 2027], hour: 5, minute: 20 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'wind',
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.18, 0.19, 0.24, 30, 220], ambient: [0.28, 0.29, 0.34] },
  extractName: 'the coast road, west', extract: { x: 1, y: 18, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'asphalt', margin: 16 },
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'paint', wallTint: [0.8, 0.8, 0.78], floor: 'tile', floorTint: [0.62, 0.62, 0.6], ceil: 'plaster', lampPower: 0.7, lampColour: [0.95, 0.95, 1], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 6, 6, 18, 14],                         // the lounge
        ['room', 20, 6, 28, 14],                        // the terminal office
        ['room', 33, 6, 39, 12],                        // the tower's foot
        ['room', 45, 5, 57, 16],                        // the hangar
      ], after: [
        // (walls a square out; the lounge and office share one)
        ['cells', [[12, 15], [19, 10], [24, 15], [36, 13], [51, 17], [44, 10]], 'D'],
        ['cells', [[9, 5], [15, 5], [5, 10], [9, 15], [23, 5], [29, 10], [32, 9], [40, 9], [58, 10]], 'W'],
        ['cells', [[8, 8], [8, 12], [16, 8], [16, 12]], 'Y'], ['cells', [[12, 10]], 'T'],
        ['cells', [[22, 8], [26, 8]], 'T'], ['cells', [[27, 13]], 'H'],
        ['cells', [[47, 7], [55, 7], [47, 14], [55, 14]], 'C'], ['cells', [[50, 9]], 'M'], ['cells', [[56, 11]], 'T'],
        // the apron's things: fuel bowsers, steps, crates - clear of the taxiway
        ['cells', [[10, 20], [16, 28], [30, 30], [40, 19], [58, 22], [6, 30]], 'C'],
      ] },
    },
    1: {
      y: 4.2, wallH: 3.2, wall: 'paint', wallTint: [0.82, 0.82, 0.8], floor: 'tile', floorTint: [0.4, 0.45, 0.5], ceil: 'plaster', lampPower: 0.5, lampColour: [0.95, 0.95, 1], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 33, 6, 39, 12],                        // the tower's cab
      ], after: [
        ['cells', [[34, 5], [36, 5], [38, 5], [32, 8], [32, 10], [40, 8], [40, 10], [34, 13], [38, 13]], 'W'],
        ['room', 36, 7, 38, 7, 'K'], ['cells', [[38, 11]], 'T'],
      ] },
    },
  },
  stairs: [{ x: 34, y: 11, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the runway's lights along its edges; the tower's top
    for (let x = 2; x < W; x += 6) for (const y of [36, 41]) level.lights.push({ pos: [mid(x), 0.4, mid(y)], range: 5, intensity: 0.6, color: [1, 0.9, 0.5] });
    box([33 * C, 7.4, 6 * C], [40 * C, 7.7, 13 * C], 'metal', { tint: [0.35, 0.35, 0.38] });
    for (const [x, y] of [[12, 18], [24, 18], [36, 16], [51, 19], [30, 26]]) level.lights.push({ pos: [mid(x), 6, mid(y)], range: 16, intensity: 1, color: [0.95, 0.95, 1], street: true });
  },
  vehicles: [
    { id: 'jet', kind: 'jet', model: 'jet', paint: 'white', at: [24, 24], yaw: -Math.PI / 2, path: taxi, speed: 12, goal: 'escape', wait: 180, holdOn: 'tower', hp: 900, name: 'The jet',
      crew: [{ id: 'pilot', at: [-0.4, -5.0] }, { id: 'drosk', at: [0.3, -1.0] }] },
  ],
  start: { x: 1, y: 18, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'lounge', label: 'Kessin airfield - the lounge', at: [6, 6, 18, 14] },
    { id: 'office', label: 'Kessin airfield - the terminal office', at: [20, 6, 28, 14] },
    { id: 'tower', label: 'Kessin airfield - the tower', at: [33, 6, 39, 12] },
    { id: 'cab', label: 'Kessin airfield - the tower\'s cab', at: [33, 6, 39, 12], floor: '1' },
    { id: 'hangar', label: 'Kessin airfield - the hangar', at: [45, 5, 57, 16] },
    { id: 'runway', label: 'Kessin airfield - the runway', at: [0, 34, W - 1, H - 1] },
    { id: 'apron', label: 'Kessin airfield - the apron', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'pilot', at: [24, 24, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'drosk', at: [25, 24, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The chief from Drosk', tint: [0.45, 0.3, 0.25] },
    { id: 'kessin', at: [12, 9, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The chief from Kessin', tint: [0.3, 0.3, 0.35] },
    { id: 'bg', at: [15, 12, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'rad', at: [24, 11, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'tw', at: [37, 10, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'tw2', at: [37, 9, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'eng', at: [52, 12, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'a1', at: [20, 21, 'G'], route: [[6, 21], [42, 21]], arms: 'carbine', dog: true },
    { id: 'a2', at: [30, 32, 'G'], route: [[8, 32], [50, 32]], arms: 'carbine' },
    { id: 'a3', at: [44, 18, 'G'], route: [[44, 18], [60, 18]], arms: 'smg' },
  ],
  pickups: [{ id: 'plan', name: 'The flight plan', what: 'the flight plan', at: [38, 11, '1'], table: true, colour: [0.85, 0.85, 0.75] }],
  devices: [
    { id: 'c-term', kind: 'camera', at: [29, 15, 'G'], face: [-1, 1], net: 'kessin' },
    { id: 'c-hang', kind: 'camera', at: [44, 17, 'G'], face: [-1, 1], net: 'kessin' },
    { id: 'a-air', kind: 'alarm', at: [19, 15, 'G'], face: [0, 1], net: 'kessin' },
  ],
  terminals: [
    { id: 'sec', name: 'the terminal office console', at: [22, 8, 'G'], face: [0, 1], time: 6, net: 'kessin' },
    { id: 'tower', name: 'the tower\'s desk', at: [37, 8, '1'], face: [0, 1], time: 8, verb: 'Ground', doing: 'Grounding',
      said: 'The runway lights out, the jet told to hold where it is, and its pilot told why. It is not going anywhere.' },
  ],
  intel: [
    { id: 'manifest', at: [12, 10, 'G'], kind: 'Manifest', title: 'A passenger manifest', text: ['Two passengers, no names. "Personal luggage only." Under it, in pencil: "and a great deal of it".'] },
    { id: 'wire', at: [26, 8, 'G'], kind: 'Telegram', title: 'A telegram on the office desk', text: ['FROM THE NORTH. NO MORE MEETINGS. NO MORE TELEPHONES. COME HOME OR DO NOT COME AT ALL.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'stop', ref: 'jet', text: 'Stop the jet before it is off the runway' },
    { id: 'o2', kind: 'capture', ref: 'kessin', text: 'Take the chief from Kessin alive (the lounge)' },
    { id: 'o3', kind: 'take', ref: 'plan', text: 'Take the flight plan (the tower)', optional: true },
  ],
};
