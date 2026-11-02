// FRONTLINE - Level 42, Kaldberg (first draft, M6.31): the last mission of the case (sim/play/caseboard.js).
// The reds' council - the people behind LANTERN, the guidance systems, the embassy's money and the strike force
// - meets tonight in a hunting lodge high in the Kaldberg pass. Record them; take the strike order; and, if you
// can, stop the Chairman. Every system the reds have: cameras and pinholes, lasers, maglocks, turrets, lights, the
// alarm; dogs in the snow, a marksman on the gallery, a shield at the study door, the radio, an engineer, a medic,
// a reserve in the garage. Snow falling.
const W = 56, H = 46;
export default {
  id: 'kaldberg', no: 42, title: 'Kaldberg', place: 'the lodge at Kaldberg',
  where: 'The hunting lodge in the Kaldberg pass. 23:00, snow falling, the council in session.',
  brief: [
    ['The case', 'Everything we have turned up points here. The council - the people LANTERN answers to, who bought the guidance systems, who pay through the embassy and who have a strike force ready for tomorrow - meets tonight at Kaldberg.'],
    ['The way in', 'On foot, through the pines at the south-west corner of the drive. Two dogs work the drive and the ridge; the posts at the door have turrets either side of them.'],
    ['The place', 'A hunting lodge on the pass. Ground floor: the <b>great hall</b> (the council at its long table), the kitchen and stores (west), the <b>security room</b> (east - maglocked), the entrance hall, the boot room, the garage (south-east). Up the stair in the entrance hall: the <b>gallery</b> round the great hall, guest rooms (west), the <b>Chairman\'s study</b> (east - maglocked). Outside: the drive, the guard posts, the helipad on the ridge (north) - your way out.'],
    ['Security', 'All of it, run from the security room: cameras (and pinholes - EMF), lasers across the gallery, the two maglocks, turrets on the drive, the great hall\'s lights, the alarm. A <b>radio</b>, an <b>engineer</b>, a <b>medic</b>, a <b>shield</b> at the study door, a <b>marksman</b> on the gallery, two <b>dogs</b> on the drive, a <b>reserve</b> in the garage. The Chairman carries a keycard.'],
    ['Objectives', '<b>Record the council</b> (the terminal on the gallery over the great hall). Take the <b>strike order</b> from the Chairman\'s study. Optionally, stop <b>the Chairman</b>. Out by the helipad on the ridge.'],
  ],
  // (M6.33) how the case ends (the debrief)
  epilogue: {
    success: 'The tape goes out at dawn - every name on it, every order. By noon the guidance units are seized at the border, the embassy on Linden Row is closed, and the strike force for the twenty-first never leaves its barracks. The council at Kaldberg will not meet again. Case closed.',
    partial: 'You are out, and the council will never sit easy at Kaldberg again. But not everything came home with you - and somewhere, men with money and a strike force are counting what they still have. The case is not quite closed.',
  },
  time: { date: [20, 12, 2026], hour: 23, minute: 0 }, night: true, faction: 'red', requires: 'HACKKIT', startGear: 'MULTIVIS', weather: 'snow',
  atmos: { fog: [0.6, 0.63, 0.7, 30, 220], ambient: [0.36, 0.38, 0.46] },
  extractName: 'the helipad on the ridge', extract: { x: 27, y: 3, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'concrete', tint: [0.9, 0.92, 0.95], margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 4.6, wall: 'wood', wallTint: [0.5, 0.38, 0.26], floor: 'wood', floorTint: [0.45, 0.32, 0.22], ceil: 'wood', lampPower: 0.85, lampColour: [1, 0.8, 0.55], lampEvery: 7,
      carve: { size: [W, H], ops: [
        ['room', 18, 10, 36, 24],                       // the great hall
        ['room', 10, 10, 16, 24],                       // the kitchen and stores
        ['room', 38, 10, 45, 24],                       // the security room
        ['room', 18, 26, 36, 31],                       // the entrance hall
        ['room', 10, 26, 16, 31],                       // the boot room
        ['room', 38, 26, 45, 31],                       // the garage
      ], after: [
        ['cells', [[26, 25], [27, 25], [17, 17], [37, 17], [17, 28], [37, 28], [26, 32], [27, 32], [41, 32]], 'D'],
        ['cells', [[20, 9], [24, 9], [30, 9], [34, 9], [9, 14], [9, 20], [46, 14], [46, 20], [20, 32], [33, 32]], 'W'],
        ['room', 22, 16, 32, 18, 'T'],                  // the council's long table
        ['cells', [[27, 11]], 'P'], ['cells', [[20, 22], [34, 22]], 'Z'],
        ['room', 11, 11, 15, 11, 'K'], ['cells', [[11, 17], [11, 20], [15, 23]], 'H'],
        ['cells', [[40, 11], [42, 11], [44, 11]], 'M'], ['cells', [[41, 16]], 'T'],
        ['cells', [[40, 29], [43, 29]], 'v'], ['cells', [[12, 28], [14, 30]], 'H'],
        // outside: the drive's walls, the guard posts' sandbags, crates by the helipad, the pines
        ['cells', [[22, 36], [23, 36], [31, 36], [32, 36], [8, 34], [46, 34]], 'w'], ['cells', [[22, 4], [32, 4]], 'C'],
        ['cells', [[4, 8], [5, 18], [4, 28], [6, 40], [50, 8], [51, 18], [50, 30], [49, 40], [14, 42], [40, 43], [3, 3], [52, 3]], 't'],
      ] },
    },
    1: {
      y: 4.8, wallH: 3.2, wall: 'wood', wallTint: [0.5, 0.38, 0.26], floor: 'wood', floorTint: [0.45, 0.32, 0.22], ceil: 'wood', lampPower: 0.7, lampColour: [1, 0.8, 0.55], lampEvery: 7,
      carve: { size: [W, H], ops: [
        ['room', 18, 10, 36, 24],                       // the gallery (its middle open to the hall)
        ['room', 10, 10, 16, 24],                       // the guest rooms
        ['room', 38, 10, 45, 18], ['room', 38, 20, 45, 24],   // the Chairman's study; his bedroom
        ['room', 18, 26, 36, 31],                       // the landing over the entrance hall
      ], after: [
        ['room', 20, 12, 34, 22, 'O'],
        ['room', 20, 11, 34, 11, '='], ['room', 20, 23, 34, 23, '='], ['room', 19, 12, 19, 22, '='], ['room', 35, 12, 35, 22, '='],
        ['cells', [[26, 25], [17, 13], [17, 21], [37, 14], [37, 22]], 'D'],
        ['room', 10, 17, 16, 17, '#'], ['cell', 13, 17, 'D'],
        ['cells', [[11, 12], [11, 22]], 'Y'], ['cells', [[44, 22]], 'Y'],
        ['cells', [[41, 12], [44, 12]], 'H'], ['cells', [[42, 16]], 'T'], ['cells', [[39, 16]], 'Z'],
      ] },
    },
  },
  stairs: [{ x: 34, y: 30, dir: 'N', len: 4, w: 2, from: 'G', to: '1' }],
  start: { x: 2, y: 44, floor: 'G', yaw: 0 },   // in the pines at the drive's south-west corner, out of the dogs' noses
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the helipad on the ridge, its H; the lodge's chimney (outside the north wall); snow on the ground
    box([22 * C, 0, 1 * C], [33 * C, 0.03, 7 * C], 'concrete2', { solid: false, tint: [0.75, 0.77, 0.8] });
    for (const [x0, z0, x1, z1] of [[25.5, 2.5, 26, 6], [29, 2.5, 29.5, 6], [26, 4, 29, 4.5]]) box([x0 * C, 0.03, z0 * C], [x1 * C, 0.05, z1 * C], 'hazard', { solid: false });
    box([mid(27) - 0.8, 0, mid(8) - 0.6], [mid(27) + 0.8, 12, mid(8) + 0.6], 'rock', { tint: [0.6, 0.6, 0.62] });
    level.lights.push({ pos: [mid(27.5), 4, mid(4)], range: 18, intensity: 1.2, color: [0.9, 0.95, 1], street: true });
    level.signs.push({ pos: [mid(26.5), 3.6, 32 * C + C + 0.14], yaw: 0, w: 3.6, h: 0.6, text: 'KALDBERG', sub: 'Jagdhaus', col: '#2a2018' });
  },
  zones: [
    { id: 'hall', label: 'Kaldberg - the great hall', at: [18, 10, 36, 24] },
    { id: 'gallery', label: 'Kaldberg - the gallery', at: [18, 10, 36, 24], floor: '1' },
    { id: 'study', label: 'Kaldberg - the Chairman\'s study', at: [38, 10, 45, 18], floor: '1' },
    { id: 'guests', label: 'Kaldberg - the guest rooms', at: [10, 10, 16, 24], floor: '1' },
    { id: 'landing', label: 'Kaldberg - the landing', at: [18, 26, 36, 31], floor: '1' },
    { id: 'secroom', label: 'Kaldberg - the security room', at: [38, 10, 45, 24] },
    { id: 'kitchen', label: 'Kaldberg - the kitchen', at: [10, 10, 16, 24] },
    { id: 'entrance', label: 'Kaldberg - the entrance hall', at: [18, 26, 36, 31] },
    { id: 'garage', label: 'Kaldberg - the garage', at: [38, 26, 45, 31] },
    { id: 'pad', label: 'Kaldberg - the helipad', at: [20, 0, 34, 7] },
    { id: 'pass', label: 'The Kaldberg pass', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'chair', at: [27, 15, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The Chairman', tint: [0.95, 0.95, 1.0], card: 'kaldberg' },
    { id: 'cm1', at: [23, 15, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'A councillor' },
    { id: 'cm2', at: [31, 19, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'A councillor' },
    { id: 'hg1', at: [19, 12, 'G'], arms: 'smg', temper: 'steady' }, { id: 'hg2', at: [35, 23, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'gal', at: [20, 10, '1'], arms: 'dmr', rank: 'specialist', temper: 'steady', perches: [[20, 10, '1'], [36, 18, '1'], [27, 24, '1']] },
    { id: 'gp', at: [27, 24, '1'], route: [[18, 24], [36, 24], [36, 10], [18, 10]], arms: 'carbine' },
    { id: 'sh', at: [36, 14, '1'], arms: 'pistol', temper: 'steady', shield: true },
    { id: 'sec', at: [42, 20, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [44, 14, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'cook', at: [13, 13, 'G'], arms: 'pistol', temper: 'cowardly', role: 'medic' },
    { id: 'door', at: [22, 29, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'd1', at: [30, 38, 'G'], route: [[16, 38], [48, 38]], arms: 'carbine', dog: true },
    { id: 'd2', at: [40, 6, 'G'], route: [[8, 6], [48, 6]], arms: 'carbine', dog: true },
    { id: 'post1', at: [22, 35, 'G'], arms: 'carbine', temper: 'steady' }, { id: 'post2', at: [32, 35, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'rv1', at: [40, 27, 'G'], arms: 'carbine', reserve: true }, { id: 'rv2', at: [42, 27, 'G'], arms: 'smg', reserve: true },
    { id: 'rv3', at: [40, 30, 'G'], arms: 'carbine', reserve: true }, { id: 'rv4', at: [44, 30, 'G'], arms: 'shotgun', reserve: true },
  ],
  pickups: [{ id: 'order', name: 'The strike order', what: 'the strike order', at: [42, 16, '1'], table: false, h: 0.8, colour: [0.85, 0.2, 0.15] }],
  devices: [
    { id: 'c-entrance', kind: 'camera', at: [18, 26, 'G'], face: [1, 1], net: 'kaldberg' },
    { id: 'c-hall', kind: 'camera', at: [36, 10, 'G'], face: [-1, 1], net: 'kaldberg' },
    { id: 'c-landing', kind: 'camera', at: [36, 31, '1'], face: [-1, -1], net: 'kaldberg' },
    { id: 'c-study', kind: 'camera', at: [38, 10, '1'], face: [1, 1], net: 'kaldberg' },
    { id: 'c-pin-gal', kind: 'camera', at: [18, 10, '1'], face: [1, 1], net: 'kaldberg', hidden: true },
    { id: 'c-pin-sec', kind: 'camera', at: [45, 24, 'G'], face: [-1, -1], net: 'kaldberg', hidden: true },
    { id: 't-drive-w', kind: 'turret', at: [21, 34, 'G'], face: [1, 1], net: 'kaldberg' },
    { id: 't-drive-e', kind: 'turret', at: [33, 34, 'G'], face: [-1, 1], net: 'kaldberg' },
    { id: 'm-study', kind: 'lock', at: [37, 14, '1'], net: 'kaldberg' },
    { id: 'm-sec', kind: 'lock', at: [37, 17, 'G'], net: 'kaldberg' },
    { id: 'z-gal-w', kind: 'laser', at: [18, 17, '1'], to: [19, 17], net: 'kaldberg' },
    { id: 'z-gal-e', kind: 'laser', at: [35, 17, '1'], to: [36, 17], net: 'kaldberg' },
    { id: 'l-hall', kind: 'lights', at: [36, 23, 'G'], face: [-1, 0], area: [18, 10, 36, 24], name: 'the great hall', net: 'kaldberg' },
    { id: 'a-lodge', kind: 'alarm', at: [27, 26, 'G'], face: [0, 1], net: 'kaldberg' },
  ],
  terminals: [
    { id: 'sec', name: 'the security room\'s console', at: [39, 22, 'G'], face: [1, 0], time: 6, net: 'kaldberg' },
    { id: 'rec', name: 'the gallery\'s recorder', at: [27, 10, '1'], face: [0, 1], time: 10, reveal: 30, verb: 'Record the council at', doing: 'Recording',
      said: 'The council, on tape: every name, every order - LANTERN, the guidance units, the money, the strike tomorrow. Ghost has them. Every red in the lodge on your radar for 30 seconds.' },
  ],
  // (M6.58) papers to read: lore, not needed to finish
  intel: [
    { id: "roster", at: [41, 16, "G"], kind: "Duty roster", title: "Duty roster - the lodge", text: ["Drive: two men and the dogs. Gallery: the marksman. Study door: the shield.", "The council is not to be disturbed for any reason between eleven and one."] },
    { id: "agenda", at: [24, 17, "G"], kind: "Agenda", title: "The council's agenda", text: ["1. The guidance units - delivery. 2. The embassy's accounts. 3. Tomorrow.", "Item 3 has no notes beside it. Someone has underlined it twice."] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'rec', text: 'Record the council (the recorder on the gallery)' },
    { id: 'o2', kind: 'take', ref: 'order', text: 'Take the strike order (the Chairman\'s study)' },
    { id: 'o3', kind: 'kill', ref: 'chair', text: 'Stop the Chairman', optional: true },
  ],
};
