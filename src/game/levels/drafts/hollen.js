// FRONTLINE - Level 100, the Rising (first draft, M6.122; a battle). With the General on trial and the Courier on every
// stand, Hollen has had enough. The town rises on the morning of the trial, and Ghost comes in with it. A battle, not a
// mission: Ghost and the townspeople from the south-west, the reds' garrison from the north-east, through the old
// town's streets and across the market square where the curfew notices were pasted.
const W = 64, H = 48;
const BLOCKS = [[6, 6, 16, 14], [22, 6, 32, 14], [38, 6, 48, 14], [6, 20, 16, 28], [38, 20, 48, 28], [6, 34, 16, 42], [22, 34, 32, 42], [38, 34, 48, 42]];
export default {
  id: 'hollen', no: 100, title: 'The Rising', place: 'Hollen, the morning of the trial',
  where: 'Hollen, the morning of the General\'s trial. 09:00, bright and cold - and a battle.',
  brief: [
    ['The battle', 'A battle, not a mission: <b>Ghost and Hollen\'s people against the reds\' garrison</b>, eight minutes on the clock and <b>eighty men a side</b> in reserve. Ghost comes on from the south-west corner of the old town, and the reds from the north-east. Every man who falls is replaced from the reserve, you as well. The side with more left when the clock runs out wins, and a side with no one left has lost.'],
    ['The ground', 'Hollen\'s old town, the grid of blocks you crossed in the curfew, with the <b>market square</b> in the middle and long streets between the blocks. The reds hold the north-east, where the barracks are.'],
    ['Your kit', 'A K7, a V-27C, smoke and grenades.'],
    ['The aim', 'Take the streets and the square, and keep more of Ghost on its feet than they keep of theirs. Hold E where you start to withdraw.'],
  ],
  epilogue: {
    success: 'By noon the reds\' garrison has marched out of Hollen by the north road with its hands on its head, and the town rings every bell it has. The Courier\'s next front page is one word, and it is printed in red.',
    partial: 'The garrison held the north-east of the town, and the rest of it is Hollen\'s. It is a start.',
  },
  time: { date: [27, 5, 2027], hour: 9, minute: 0 }, faction: 'red',
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES' },
  extractName: 'Ghost\'s corner', vehicle: false,
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'concrete2', wallTint: [0.6, 0.6, 0.6], floor: 'concrete', ceil: 'concrete2', lampPower: 0.6, lampColour: [1, 0.88, 0.7], lampEvery: 5,
      carve: { size: [W, H], ops: [], after: [
        ...BLOCKS.map(([x0, y0, x1, y1]) => ['room', x0, y0, x1, y1, 'J']),
        // the square's fountain and benches, barricades in the streets, carts and crates
        ['cells', [[27, 24]], 'M'], ['cells', [[24, 21], [30, 27], [24, 27], [30, 21]], 'C'],
        ['cells', [[18, 24], [36, 24], [27, 17], [27, 31], [10, 17], [44, 31], [10, 31], [44, 17], [4, 24], [58, 24], [27, 4], [27, 45], [52, 8], [52, 40], [12, 45], [44, 3]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, CELL: C } = kit;
    BLOCKS.forEach(([x0, y0, x1, y1], i) => box([x0 * C, 0, y0 * C], [(x1 + 1) * C, 7 + (i % 3) * 2.5, (y1 + 1) * C], 'concrete2', { tint: [0.55 + (i % 2) * 0.1, 0.52, 0.5] }));
  },
  start: { x: 3, y: 45, floor: 'G', yaw: 0 },
  battle: {
    you: 'ghost', timer: 480,
    teams: {
      ghost: {
        name: 'Ghost and Hollen', short: 'Ghost', faction: 'ally', reserve: 80, field: 12, arms: ['carbine', 'smg', 'carbine', 'shotgun', 'dmr'],
        spawns: [[3, 45, 'G'], [4, 44, 'G'], [2, 43, 'G'], [5, 46, 'G']],
        lanes: [
          [[3, 44], [3, 31], [19, 31], [19, 17], [35, 17], [35, 3], [58, 3]],
          [[4, 45], [19, 45], [35, 45], [52, 45], [52, 31], [52, 17], [58, 3]],
          [[3, 44], [3, 17], [3, 3], [19, 3], [35, 3], [58, 3]],
          [[4, 45], [19, 45], [19, 31], [23, 31], [23, 22], [31, 22], [35, 17], [52, 17], [58, 3]],
        ],
      },
      red: {
        name: 'The reds\' garrison', short: 'Reds', faction: 'red', reserve: 80, field: 12, arms: ['carbine', 'smg', 'shotgun', 'carbine'],
        spawns: [[58, 3, 'G'], [57, 4, 'G'], [59, 5, 'G'], [56, 2, 'G']],
        lanes: [
          [[57, 3], [35, 3], [35, 17], [19, 17], [19, 31], [3, 31], [3, 45]],
          [[58, 4], [52, 17], [52, 31], [52, 45], [35, 45], [19, 45], [3, 45]],
          [[57, 3], [19, 3], [3, 3], [3, 17], [3, 45]],
          [[58, 4], [52, 17], [35, 17], [31, 22], [31, 27], [23, 27], [19, 31], [19, 45], [3, 45]],
        ],
      },
    },
  },
  zones: [
    { id: 'square', label: 'Hollen - the market square', at: [22, 20, 32, 28] },
    { id: 'sw', label: 'Hollen - the south-west (Ghost)', at: [0, 34, 5, H - 1] },
    { id: 'ne', label: 'Hollen - the north-east (the reds)', at: [49, 0, W - 1, 14] },
    { id: 'town', label: 'Hollen', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [],
  objectives: [],
};
