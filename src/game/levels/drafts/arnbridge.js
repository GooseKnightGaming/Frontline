// FRONTLINE - Level 68, the Arn Bridge (first draft, M6.87; built round allies - two Ghost operatives with you).
// The council's minutes named the north's labour camps, and Ghost has emptied the nearest one. Its people are in four
// lorries coming south, and the only way is the Arn bridge. The reds hold the north end. Take it with the two
// operatives Ghost has sent with you, cut the post's telephone, and hold the north end while the lorries cross.
const W = 50, H = 40;
export default {
  id: 'arnbridge', no: 68, title: 'The Arn Bridge', place: 'the Arn bridge, in the north',
  where: 'The Arn bridge. 05:40, before dawn, the lorries an hour behind you.',
  brief: [
    ['The job', 'The council\'s minutes named the north\'s labour camps, and Ghost has emptied the nearest. Its people are coming south in four lorries, and the only way is the <b>Arn bridge</b>. The reds hold its north end. You are not alone this time: <b>two Ghost operatives</b>, Hale and Moss, are with you. They keep with you and fight whoever fights you. Cut the post\'s <b>telephone</b>. Then <b>hold the north end</b> for the <b>ninety seconds</b> the lorries take to cross.'],
    ['The place', 'The river runs east to west, and the bridge crosses it in the middle. You come in from the south bank. At the north end are the reds\' <b>post</b> (the telephone, the radio) and a bunker each side of the road. Their barracks are up the road north, and that is where the rest of them will come from.'],
    ['Security', 'The post\'s camera on the bridge and its alarm. The radio and the engineer are in the post. The bunkers each have a man, and there are patrols on the north bank. Once the hold starts they will come down the road, and round both sides.'],
    ['Objectives', 'Cut the <b>telephone</b> (the post, north end). <b>Hold the north end of the bridge</b> while the lorries cross. If you can, bring <b>Hale and Moss</b> home too.'],
  ],
  epilogue: {
    success: 'Four lorries over the Arn at first light, two hundred people in them, and all three of you on the last one. The reds\' barracks hear nothing until the telephone is mended, and by then the lorries are in the hills.',
    partial: 'The lorries got over, but not all of it went to plan. Ghost counts its people when you are back.',
  },
  time: { date: [22, 2, 2027], hour: 5, minute: 40 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'snow',
  relations: { red: { you: true, ghost: true }, ghost: { you: false, red: true } },
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.28, 0.31, 0.38, 25, 180], ambient: [0.3, 0.32, 0.4] },
  extractName: 'the south bank', extract: { x: 25, y: 38, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.2, wall: 'concrete2', wallTint: [0.62, 0.62, 0.6], floor: 'concrete', ceil: 'concrete2', lampPower: 0.7, lampColour: [0.95, 0.95, 1], lampEvery: 6,
      channel: 4, surf: 0.6,
      carve: { size: [W, H], ops: [
        ['room', 30, 8, 36, 12],                        // the post
        ['room', 16, 10, 19, 12],                       // the west bunker
        ['room', 31, 2, 34, 4],                         // the east bunker, up the bank
      ], after: [
        // the river, and the bridge (x 22 - 27) over it
        ['room', 2, 16, 21, 23, '~'], ['room', 28, 16, 47, 23, '~'],
        ['room', 21, 16, 21, 23, '='], ['room', 28, 16, 28, 23, '='],
        ['room', 2, 15, 20, 15, '='], ['room', 29, 15, 47, 15, '='], ['room', 2, 24, 20, 24, '='], ['room', 29, 24, 47, 24, '='],
        // (walls a square out from each room)
        ['cells', [[29, 10], [18, 13], [32, 5]], 'D'],
        ['cells', [[33, 7], [37, 10], [15, 11], [33, 1]], 'W'],
        ['cells', [[31, 9], [35, 11]], 'T'], ['cells', [[35, 9]], 'M'],
        // sandbags and crates on both banks, for cover on the way across and in the hold
        ['cells', [[20, 13], [29, 13], [23, 9], [26, 9], [14, 6], [38, 6], [24, 4], [20, 27], [29, 27], [16, 31], [34, 31]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    for (const x of [21, 28]) box([x * C + 0.1, -4, 16 * C], [x * C + C - 0.1, -0.05, 24 * C], 'concrete2', { tint: [0.5, 0.5, 0.52] });
    for (const [x, y] of [[24, 14], [24, 25], [33, 14], [17, 8], [25, 3], [25, 35]]) level.lights.push({ pos: [mid(x), 5, mid(y)], range: 13, intensity: 1, color: [0.95, 0.95, 1], street: true });
  },
  start: { x: 24, y: 36, floor: 'G', yaw: 0 },
  zones: [
    { id: 'post', label: 'The Arn bridge - the post', at: [30, 8, 36, 12] },
    { id: 'bridge', label: 'The Arn bridge', at: [21, 15, 28, 24] },
    { id: 'north', label: 'The Arn bridge - the north end', at: [0, 0, W - 1, 14] },
    { id: 'south', label: 'The Arn bridge - the south bank', at: [0, 0, W - 1, H - 1] },
  ],
  reach: [
    { id: 'end', name: 'The north end of the bridge', at: [20, 8, 29, 14], hold: 90, after: 'phone',
      said: 'Ninety seconds: the last lorry is over the bridge and away into the hills. Back over the bridge, the three of you.' },
  ],
  guards: [
    // yours
    { id: 'hale', at: [23, 37, 'G'], faction: 'ghost', ally: true, name: 'Hale', arms: 'carbine', temper: 'steady', tint: [0.45, 0.6, 1.35] },
    { id: 'moss', at: [26, 37, 'G'], faction: 'ghost', ally: true, name: 'Moss', arms: 'smg', temper: 'bold', tint: [0.4, 0.55, 1.3] },
    // theirs
    { id: 'b1', at: [17, 11, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'b2', at: [32, 3, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'rad', at: [33, 11, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [34, 9, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'n1', at: [24, 14, 'G'], route: [[10, 14], [40, 14]], arms: 'carbine' },
    { id: 'n2', at: [25, 6, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'w1a', at: [24, 1, 'G'], arms: 'carbine', reserve: true, wave: 1 }, { id: 'w1b', at: [26, 1, 'G'], arms: 'smg', reserve: true, wave: 1 },
    { id: 'w2a', at: [4, 6, 'G'], arms: 'carbine', reserve: true, wave: 2 }, { id: 'w2b', at: [45, 6, 'G'], arms: 'carbine', reserve: true, wave: 2 },
    { id: 'w3a', at: [8, 1, 'G'], arms: 'shotgun', reserve: true, wave: 3 }, { id: 'w3b', at: [42, 1, 'G'], arms: 'smg', reserve: true, wave: 3 },
  ],
  devices: [
    { id: 'c-bridge', kind: 'camera', at: [29, 14, 'G'], face: [-1, 1], net: 'arn' },
    { id: 'a-arn', kind: 'alarm', at: [29, 12, 'G'], face: [-1, 0], net: 'arn' },
  ],
  terminals: [
    { id: 'sec', name: 'the post\'s console', at: [35, 11, 'G'], face: [-1, 0], time: 6, net: 'arn' },
    { id: 'phone', name: 'the post\'s telephone', at: [31, 9, 'G'], face: [1, 0], time: 6, verb: 'Cut', doing: 'Cutting',
      said: 'The line is dead. The barracks will not hear it from the post. Now take the north end and hold it while the lorries come over.' },
  ],
  intel: [
    { id: 'log', at: [35, 11, 'G'], kind: 'Log', title: 'The post\'s log', text: ['Lorries north: none. Lorries south: none. "The camp road is closed to all traffic until further notice."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'phone', text: 'Cut the post\'s telephone (the north end)' },
    { id: 'o2', kind: 'reach', ref: 'end', text: 'Hold the north end while the lorries cross' },
  ],
};
