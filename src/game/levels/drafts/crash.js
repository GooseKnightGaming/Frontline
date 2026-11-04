// FRONTLINE - Level 91, the Crash Site (first draft, M6.113; the start of THE WINTER ROAD). With the Kiln Road's
// lorries watched, Ghost tried the air: a transport flying the last of the saints' papers north over the Skarn forest.
// It came down in the snow. The reds' search party found the wreck first and has the crew - the pilot in their camp,
// the navigator in the forester's hut - and is about to open the plane. Bring the crew out and take the flight bag
// from the wreck before the reds do.
const W = 60, H = 44;
export default {
  id: 'crash', no: 91, title: 'The Crash Site', place: 'the Skarn forest',
  where: 'The Skarn forest. 07:30, snow falling, the wreck still smoking among the pines.',
  brief: [
    ['The job', 'With the Kiln Road watched, Ghost tried the air: a <b>transport</b> flying the last of the saints\' papers north over the Skarn forest. It came down in the snow. The reds\' <b>search party</b> found the wreck first and has the crew. Bring out the <b>pilot</b> (their camp) and the <b>navigator</b> (the forester\'s hut). Take the <b>flight bag</b> from the wreck before they open the plane. If you can, inside <b>five minutes</b>.'],
    ['The place', 'The <b>wreck</b> lies in the middle of the clearing, its tail broken open on the east side. The reds\' <b>camp</b> is in the north-west corner, the <b>forester\'s hut</b> south-east. The rest is pines and snow. You come in from the east.'],
    ['Security', 'There is no alarm and no radio worth the name out here, only the search party: a dozen reds spread between the wreck, the camp and the hut. They are cold and tired, and they think the crew were the only ones out here.'],
    ['Objectives', 'Bring out the <b>pilot</b> (the camp) and the <b>navigator</b> (the hut). Take the <b>flight bag</b> (the wreck). If you can, inside five minutes. Out the way you came, east.'],
  ],
  epilogue: {
    success: 'The crew walk out of the Skarn forest on their own feet, and the flight bag goes north by another road. The reds open the wreck at noon and find a great deal of snow.',
    partial: 'Not everyone came out of the forest, or the bag stayed in the wreck. The papers will have to go another way.',
  },
  time: { date: [11, 5, 2027], hour: 7, minute: 30 }, night: false, faction: 'red', weather: 'snow',
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.7, 0.72, 0.76, 25, 180], ambient: [0.55, 0.57, 0.62] },
  extractName: 'the forest, east', extract: { x: 58, y: 7, floor: 'G', van: [-1, 6] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'metal', wallTint: [0.55, 0.58, 0.55], floor: 'metal', ceil: 'metal', lampPower: 0.4, lampColour: [0.95, 0.95, 1], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 24, 18, 40, 21],                       // the wreck's fuselage
        ['room', 6, 6, 12, 10],                         // the camp's command tent
        ['room', 46, 30, 54, 36],                       // the forester's hut
      ], after: [
        ['cells', [[41, 20], [41, 19], [12, 11], [46, 29]], 'D'],
        ['cells', [[28, 17], [33, 17], [37, 17], [28, 22], [33, 22], [37, 22], [9, 5], [55, 33]], 'W'],
        ['cells', [[26, 19]], 'T'], ['cells', [[30, 21], [36, 18]], 'C'],
        ['cells', [[8, 7]], 'T'], ['cells', [[11, 9]], 'M'],
        ['cells', [[48, 31]], 'T'], ['cells', [[53, 35]], 'H'],
        // the pines and the wreck's scattered pieces
        ['cells', [[4, 16], [8, 24], [14, 30], [6, 36], [18, 40], [16, 14], [20, 8], [28, 4], [36, 8], [44, 6], [52, 10], [50, 18],
          [44, 26], [36, 30], [26, 34], [30, 40], [42, 40], [56, 40], [22, 26], [18, 20], [48, 22], [56, 14]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, mid, CELL: C } = kit;
    // the wings, broken, in the snow either side of the fuselage
    box([29 * C, 0, 12 * C], [32 * C, 0.6, 17 * C], 'metal', { tint: [0.55, 0.58, 0.55] });
    box([30 * C, 0, 23 * C], [33 * C, 0.5, 28 * C], 'metal', { tint: [0.5, 0.53, 0.5] });
    box([mid(23) - 0.3, 0, mid(19) - 1.2], [mid(23) + 0.4, 3.4, mid(19) + 1.2], 'metal', { tint: [0.35, 0.36, 0.35], solid: false });
  },
  start: { x: 58, y: 8, floor: 'G', yaw: Math.PI / 2 },
  zones: [
    { id: 'wreck', label: 'The Skarn forest - the wreck', at: [24, 18, 40, 21] },
    { id: 'camp', label: 'The Skarn forest - the reds\' camp', at: [2, 2, 16, 14] },
    { id: 'hut', label: 'The Skarn forest - the forester\'s hut', at: [46, 30, 54, 36] },
    { id: 'forest', label: 'The Skarn forest', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'off', at: [9, 8, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The search party\'s officer' },
    { id: 'c1', at: [10, 13, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'c2', at: [4, 8, 'G'], route: [[4, 3], [4, 14]], arms: 'carbine' },
    { id: 'wk1', at: [32, 24, 'G'], route: [[24, 24], [40, 24]], arms: 'carbine' },
    { id: 'wk2', at: [32, 15, 'G'], route: [[24, 15], [40, 15]], arms: 'smg' },
    { id: 'wk3', at: [38, 20, 'G'], arms: 'pistol', rank: 'specialist', temper: 'cowardly', name: 'The red mechanic' },
    { id: 'h1', at: [51, 32, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'h2', at: [50, 38, 'G'], route: [[44, 38], [56, 38]], arms: 'carbine', dog: true },
    { id: 'f1', at: [14, 34, 'G'], route: [[10, 34], [24, 34]], arms: 'dmr', rank: 'specialist' },
    { id: 'f2', at: [22, 4, 'G'], route: [[18, 4], [40, 4]], arms: 'carbine' },
  ],
  hostages: [
    { id: 'pilot', name: 'The pilot', at: [7, 9, 'G'] },
    { id: 'nav', name: 'The navigator', she: true, at: [52, 34, 'G'] },
  ],
  pickups: [{ id: 'bag', name: 'The flight bag', what: 'the flight bag', at: [26, 19, 'G'], table: true, colour: [0.3, 0.3, 0.25] }],
  intel: [
    { id: 'logbook', at: [8, 7, 'G'], kind: 'Log', title: 'The search party\'s log', text: ['07:10 - wreck found, two crew taken. 07:20 - waiting for the cutters to open the hold. Orders: nothing to be moved until the colonel\'s man arrives.'] },
    { id: 'chart', at: [48, 31, 'G'], kind: 'Chart', title: 'The navigator\'s chart, taken from her', text: ['The route north in pencil, and at its end a circle around a name: Fennick\'s Pass.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'rescue', ref: 'pilot', text: 'Bring out the pilot (the reds\' camp)' },
    { id: 'o2', kind: 'rescue', ref: 'nav', text: 'Bring out the navigator (the forester\'s hut)' },
    { id: 'o3', kind: 'take', ref: 'bag', text: 'Take the flight bag (the wreck)' },
    { id: 'o4', kind: 'quick', secs: 300, text: 'Inside five minutes', optional: true },
  ],
};
