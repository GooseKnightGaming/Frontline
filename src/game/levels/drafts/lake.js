// FRONTLINE - Level 93, the Frozen Lake (first draft, M6.115; the end of THE WINTER ROAD). Over Fennick's Pass, the
// flight bag has one last stage: Lake Orsa, frozen hard, where a Ghost plane will land on the ice at the flares and
// take it the rest of the way. The reds have a post in the boathouse, and a snowcat on the shore road that will run
// for the town the moment anything moves on the lake. Light the two landing flares, stop the snowcat before it is off
// the shore road, and meet the plane in the middle of the ice.
const W = 60, H = 40;
export default {
  id: 'lake', no: 93, title: 'The Frozen Lake', place: 'Lake Orsa, beyond the Skarn',
  where: 'Lake Orsa, beyond the Skarn. 03:20, the lake frozen white, a plane\'s engine somewhere in the cloud.',
  brief: [
    ['The job', 'Over Fennick\'s Pass the flight bag has one last stage: <b>Lake Orsa</b>, frozen hard, where a Ghost <b>plane</b> will land on the ice at the flares and take it the rest of the way. Light the <b>two landing flares</b>. <b>Stop the snowcat</b> on the shore road before it gets to the town. Then <b>meet the plane</b> in the middle of the ice.'],
    ['The place', 'The lake fills the middle of the map. The <b>flares</b> are in their boxes on the ice, west and east of the landing ground. The reds\' <b>boathouse</b> post is on the north shore. The <b>shore road</b> runs along the south side, with the snowcat at its east end. It goes west to the town.'],
    ['Security', 'There is no alarm out here and no console, only the boathouse\'s men, a patrol on the ice and the <b>snowcat</b>. It leaves for the town in a little over three minutes, or the moment its crew are shot at.'],
    ['Objectives', 'Light the <b>west flare</b> and the <b>east flare</b> (on the ice). <b>Stop the snowcat</b> (the shore road). <b>Meet the plane</b> (the middle of the ice). Out by the west shore.'],
  ],
  epilogue: {
    success: 'The plane comes down between the flares, takes the flight bag and one cold passenger, and is gone into the cloud before the boathouse has its boots on. The saints\' papers reach the north\'s last free press by dawn, and are printed by noon.',
    partial: 'The plane came and went, but the town knows. The road north of Lake Orsa will be closed by morning.',
  },
  time: { date: [13, 5, 2027], hour: 3, minute: 20 }, night: true, faction: 'red', weather: 'snow',
  startLoadout: { primary: 'LR7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { primary: ['SCOPE8'], backup: ['SILENCER'] } },
  atmos: { fog: [0.3, 0.32, 0.38, 30, 220], ambient: [0.34, 0.36, 0.42] },
  extractName: 'the west shore', extract: { x: 1, y: 14, floor: 'G', van: [1, -6] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.2, wall: 'wood', wallTint: [0.5, 0.42, 0.34], floor: 'wood', ceil: 'wood', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 44, 4, 52, 9],                         // the boathouse
      ], after: [
        ['cells', [[48, 10], [43, 7]], 'D'], ['cells', [[46, 3], [50, 3], [53, 6]], 'W'],
        ['cells', [[45, 5], [51, 8]], 'T'], ['cells', [[49, 5]], 'M'],
        // the flares' boxes on the ice
        ['cells', [[18, 20], [42, 20]], 'T'],
        // the shore's rocks and the reeds; the road's verges
        ['cells', [[6, 6], [26, 6], [56, 14], [12, 31], [36, 31], [56, 28]], 'r'], ['cells', [[14, 4], [36, 4], [4, 28], [24, 30], [48, 30], [6, 16]], 't'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the ice: a pale sheet over the lake's middle
    box([8 * C, 0, 11 * C], [52 * C, 0.04, 28 * C], 'glassB', { tint: [0.85, 0.9, 1], solid: false });
    for (const [x, y] of [[48, 12], [54, 34]]) level.lights.push({ pos: [mid(x), 3.5, mid(y)], range: 10, intensity: 0.7, color: [1, 0.85, 0.6], street: true });
  },
  vehicles: [
    { id: 'snowcat', kind: 'car', model: 'lightUtility', paint: 'white', at: [54, 34], yaw: Math.PI / 2, path: [[54, 34], [40, 34], [20, 34], [2, 34], [-8, 34]],
      speed: 7, goal: 'escape', wait: 200, hp: 620, name: 'The snowcat',
      crew: [{ id: 'sd1', at: [-0.42, 0.15] }, { id: 'sd2', at: [0.42, 0.15] }] },
  ],
  start: { x: 2, y: 14, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'boat', label: 'Lake Orsa - the boathouse', at: [44, 4, 52, 9] },
    { id: 'ice', label: 'Lake Orsa - the ice', at: [8, 11, 51, 27] },
    { id: 'road', label: 'Lake Orsa - the shore road', at: [0, 32, W - 1, 36] },
    { id: 'orsa', label: 'Lake Orsa', at: [0, 0, W - 1, H - 1] },
  ],
  reach: [{ id: 'plane', name: 'The plane', at: [26, 17, 34, 23], after: 'flareE', said: 'The plane comes down between the flares in a spray of snow. The door opens; a hand reaches for the bag.' }],
  guards: [
    { id: 'sd1', at: [54, 34, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'sd2', at: [55, 34, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'bh1', at: [47, 6, 'G'], arms: 'carbine', rank: 'officer', temper: 'steady' },
    { id: 'bh2', at: [50, 7, 'G'], arms: 'smg' },
    { id: 'bh3', at: [48, 12, 'G'], arms: 'carbine', temper: 'steady', yaw: 0 },
    { id: 'ip1', at: [30, 14, 'G'], route: [[16, 14], [44, 14]], arms: 'carbine' },
    { id: 'ip2', at: [30, 26, 'G'], route: [[16, 26], [44, 26]], arms: 'carbine', dog: true },
    { id: 'rd1', at: [30, 37, 'G'], route: [[20, 37], [50, 37]], arms: 'dmr', rank: 'specialist' },
  ],
  terminals: [
    { id: 'flareW', name: 'the west flare', at: [18, 20, 'G'], face: [1, 0], time: 3, verb: 'Light', doing: 'Lighting', said: 'The west flare burns red on the ice.' },
    { id: 'flareE', name: 'the east flare', at: [42, 20, 'G'], face: [-1, 0], time: 3, verb: 'Light', doing: 'Lighting', said: 'The east flare burns red on the ice. Somewhere in the cloud, the engine changes its note.' },
  ],
  intel: [
    { id: 'orders', at: [45, 5, 'G'], kind: 'Orders', title: 'The boathouse\'s orders', text: ['Anything on the lake, the snowcat goes to the town at once. Do not fire on aircraft. Report them.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'flareW', text: 'Light the west flare (on the ice)' },
    { id: 'o2', kind: 'hack', ref: 'flareE', text: 'Light the east flare (on the ice)' },
    { id: 'o3', kind: 'stop', ref: 'snowcat', text: 'Stop the snowcat before it is off the shore road, west' },
    { id: 'o4', kind: 'reach', ref: 'plane', text: 'Meet the plane (the middle of the ice)' },
  ],
};
