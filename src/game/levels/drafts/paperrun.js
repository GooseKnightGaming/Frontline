// FRONTLINE - Level 96, the Paper Run (first draft, M6.118; the end of THE PRESS). The Courier is printed: ten thousand
// copies, the saints on the front page. Hollen is under curfew, and the reds have every street patrolled until five.
// The newsstands open at six. Carry the bundles through the town in the dark and leave one at each of the three
// stands, so that when Hollen wakes, it reads.
const W = 64, H = 48;
export default {
  id: 'paperrun', no: 96, title: 'The Paper Run', place: 'Hollen, under curfew',
  where: 'Hollen, under curfew. 04:40, the streets empty but for the patrols, the Courier printed.',
  brief: [
    ['The job', 'The Courier is printed: ten thousand copies, with the saints on the front page. Hollen is under <b>curfew</b>, and the reds patrol every street until five. The newsstands open at six. Carry the bundles through the town and leave one at each of the <b>three newsstands</b>, so that when Hollen wakes, it reads. If you can, inside <b>five minutes</b>, before the patrols double at the change of shift.'],
    ['The place', 'Hollen\'s old town is a grid of blocks with the <b>market square</b> in the middle. The stands are on the <b>north street</b> by the bank, on the <b>east road</b>, and at the <b>south side of the square</b>. You start in the south-west corner, by the printers\' van.'],
    ['Security', 'Foot patrols on the long streets, a dog in the square, and an officer watching it. Nobody is allowed out. Anyone in the street is a curfew-breaker, and the patrols shoot first and ask the corpse.'],
    ['Objectives', 'Leave a bundle at the <b>north stand</b>, the <b>east stand</b> and the <b>square\'s stand</b>. If you can, inside <b>five minutes</b>. Back to the van, south-west.'],
  ],
  epilogue: {
    success: 'At six the stands open, and the Courier is on all three. By seven there is a queue at each. By eight the reds are collecting copies, and by nine they have stopped, because there are not enough of them to collect ten thousand of anything.',
    partial: 'Some of the stands got their bundles. Hollen reads the Courier in some of its streets, and passes it on in the others.',
  },
  time: { date: [18, 5, 2027], hour: 4, minute: 40 }, night: true, faction: 'red',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.15, 0.15, 0.19, 25, 170], ambient: [0.27, 0.27, 0.32] },
  extractName: 'the printers\' van, south-west', extract: { x: 3, y: 45, floor: 'G', van: [4, 1] },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'concrete2', wallTint: [0.6, 0.6, 0.6], floor: 'asphalt', ceil: 'concrete2', lampPower: 0.6, lampColour: [1, 0.88, 0.7], lampEvery: 5,
      carve: { size: [W, H], ops: [], after: [
        // the old town's blocks (solid; drawn below), the market square open in the middle
        ['room', 6, 6, 16, 14, 'J'], ['room', 22, 6, 32, 14, 'J'], ['room', 38, 6, 48, 14, 'J'],
        ['room', 6, 20, 16, 28, 'J'], ['room', 38, 20, 48, 28, 'J'],
        ['room', 6, 34, 16, 42, 'J'], ['room', 22, 34, 32, 42, 'J'], ['room', 38, 34, 48, 42, 'J'],
        // the three newsstands
        ['cells', [[19, 10], [52, 24], [27, 31], [56, 44]], 'T'],
        // the square's fountain, the benches, the bins
        ['cells', [[27, 24]], 'M'], ['cells', [[24, 21], [24, 27], [4, 12], [35, 44], [19, 38]], 'B'], ['cells', [[30, 27], [30, 21], [60, 40], [52, 8], [58, 18]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    const blocks = [[6, 6, 16, 14], [22, 6, 32, 14], [38, 6, 48, 14], [6, 20, 16, 28], [38, 20, 48, 28], [6, 34, 16, 42], [22, 34, 32, 42], [38, 34, 48, 42]];
    blocks.forEach(([x0, y0, x1, y1], i) => box([x0 * C, 0, y0 * C], [(x1 + 1) * C, 7 + (i % 3) * 2.5, (y1 + 1) * C], 'concrete2', { tint: [0.55 + (i % 2) * 0.1, 0.52, 0.5] }));
    for (const [x, y] of [[19, 4], [35, 4], [19, 17], [35, 17], [19, 31], [35, 31], [19, 45], [35, 45], [52, 17], [52, 31], [3, 17], [3, 31], [60, 4], [60, 45]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 10, intensity: 0.75, color: [1, 0.88, 0.7], street: true });
  },
  start: { x: 3, y: 46, floor: 'G', yaw: 0 },
  zones: [
    { id: 'square', label: 'Hollen - the market square', at: [22, 20, 32, 28] },
    { id: 'north', label: 'Hollen - the north street', at: [0, 0, W - 1, 5] },
    { id: 'east', label: 'Hollen - the east road', at: [49, 0, W - 1, H - 1] },
    { id: 'town', label: 'Hollen', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'o1', at: [27, 21, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', yaw: Math.PI },
    { id: 'sq', at: [27, 26, 'G'], route: [[23, 26], [31, 26]], arms: 'carbine', dog: true },
    { id: 'p1', at: [19, 24, 'G'], route: [[19, 2], [19, 40]], arms: 'carbine' },
    { id: 'p2', at: [30, 17, 'G'], route: [[4, 17], [60, 17]], arms: 'carbine' },
    { id: 'p3', at: [35, 30, 'G'], route: [[35, 2], [35, 46]], arms: 'smg' },
    { id: 'p4', at: [40, 31, 'G'], route: [[22, 31], [60, 31]], arms: 'carbine' },
    { id: 'p5', at: [52, 10, 'G'], route: [[52, 2], [52, 22]], arms: 'carbine', temper: 'steady' },
    { id: 'p6', at: [30, 3, 'G'], route: [[8, 3], [48, 3]], arms: 'pistol' },
  ],
  terminals: [
    { id: 'standN', name: 'the north stand', at: [19, 10, 'G'], face: [1, 0], time: 2, verb: 'Leave', doing: 'Leaving', said: 'A bundle of Couriers under the north stand\'s shutter.' },
    { id: 'standE', name: 'the east stand', at: [52, 24, 'G'], face: [-1, 0], time: 2, verb: 'Leave', doing: 'Leaving', said: 'A bundle of Couriers under the east stand\'s shutter.' },
    { id: 'standS', name: 'the square\'s stand', at: [27, 31, 'G'], face: [0, 1], time: 2, verb: 'Leave', doing: 'Leaving', said: 'A bundle of Couriers under the square\'s stand, right under the officer\'s nose.' },
  ],
  intel: [
    { id: 'curfew', at: [56, 44, 'G'], kind: 'Notice', title: 'The curfew notice on a board by the east road', text: ['By order: nobody in the streets between ten and five. Newspapers to be sold only as passed. The notice has been pasted over the Courier\'s old masthead.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'standN', text: 'Leave a bundle at the north stand (by the bank)' },
    { id: 'o2', kind: 'hack', ref: 'standE', text: 'Leave a bundle at the east stand (the east road)' },
    { id: 'o3', kind: 'hack', ref: 'standS', text: 'Leave a bundle at the square\'s stand (its south side)' },
    { id: 'o4', kind: 'quick', secs: 300, text: 'Inside five minutes', optional: true },
  ],
};
