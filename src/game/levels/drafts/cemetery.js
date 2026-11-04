// FRONTLINE - Level 7, the Cemetery and Crypt (first draft). Rhys: "a cemetery and crypt".
// The Yellows run their messages through a dead drop in the crypt under St Aldric's chapel; their
// courier, who dresses as a priest, keeps the cipher book down there.
// rows of graves in the four plots either side of the avenue
const graves = [];
for (const [x0, x1] of [[3, 20], [29, 46]]) for (const [y0, y1] of [[22, 28], [32, 41]]) for (let y = y0; y <= y1; y += 3) for (let x = x0; x <= x1; x += 2) graves.push([x, y]);
export default {
  id: 'cemetery', no: 7, title: 'Cemetery and Crypt', place: 'St Aldric\'s cemetery',
  where: 'St Aldric\'s cemetery, Highgate Rise. 02:10, a clear night and a full moon.',
  brief: [
    ['The place', 'A walled cemetery on a hill: rows of graves, the mausoleums of old families, an avenue of yews up to the chapel. Under the chapel, down the steps behind its altar, the crypt - tombs in the walls, the ossuary, and the room the Yellows use.'],
    ['The Yellows', 'Ten of them: lookouts among the graves, two at the chapel, the rest below. The courier, <b>"Brother Teodor"</b>, is in the crypt.'],
    ['Objectives', 'Take the Yellows\' <b>cipher book</b> from the crypt, and stop <b>Brother Teodor</b> - killed or knocked out. Clearing the rest is optional.'],
    ['Doors', 'Some mausoleums are locked: kick them in, or leave them be.'],
  ],
  // (M6.83) how it ends (the debrief; the case board's story so far)
  epilogue: {
    success: "The Yellows' cipher book is out of the crypt and Brother Teodor will not hold another meeting below St Aldric's. Their messages are Ghost's to read for a while.",
    partial: "The book or the brother, not both. The Yellows will change their cipher before the next full moon.",
  },
  time: { date: [2, 8, 2026], hour: 2, minute: 10 }, night: true, startGear: 'NVG', faction: 'yellow',
  extractName: 'the gate on Highgate Rise', safeName: 'the gate on Highgate Rise',
  outside: { backdrop: 'woods', mat: 'lawn', margin: 16, fenceMat: 'brick', fenceH: 2.4 },
  decals: { p: { mat: 'concrete2', tint: [0.75, 0.72, 0.66] } },
  legend: {
    // a gravel path square
    // a candle-lit altar
    a(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 0.7, cy, cz - 0.45], [cx + 0.7, cy + 1.0, cz + 0.45], 'marble', { tint: [0.85, 0.82, 0.75] }); k.level.lights.push({ pos: [cx, cy + 1.4, cz], range: 7, intensity: 0.7, color: [1, 0.75, 0.45] }); },
    // a pew
    q(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h + 0.05, cy, cz - 0.25], [cx + h - 0.05, cy + 0.45, cz + 0.25], 'wood'); k.box([cx - h + 0.05, cy + 0.45, cz + 0.15], [cx + h - 0.05, cy + 0.95, cz + 0.25], 'wood'); },
  },
  floors: {
    C: {
      y: -4.2, wallH: 3.0, wall: 'brick', wallTint: [0.6, 0.58, 0.55], floor: 'concrete2', floorTint: [0.55, 0.53, 0.5], ceil: 'brick', ceilTint: [0.5, 0.48, 0.45],
      lampPower: 0.45, lampRange: 8, lampColour: [1, 0.72, 0.4], lampEvery: 10,
      carve: { size: [50, 44], ops: [
        ['room', 28, 3, 33, 9],                        // the foot of the steps
        ['room', 18, 10, 32, 12],                      // the crossing passage
        ['room', 10, 10, 16, 30], ['room', 34, 10, 40, 30],   // the west and east galleries of tombs
        ['room', 18, 28, 32, 30],                      // the south passage
        ['room', 20, 14, 30, 24],                      // the ossuary
        ['room', 2, 18, 8, 24],                        // the Yellows' room (west)
        ['room', 42, 18, 47, 24],                      // the old vestry store (east)
      ], after: [
        ['cells', [[11, 12], [11, 15], [11, 18], [11, 21], [11, 24], [11, 27], [15, 13], [15, 16], [15, 22], [15, 25], [39, 12], [39, 15], [39, 18], [39, 21], [39, 24], [39, 27], [35, 13], [35, 16], [35, 22], [35, 25]], 'X'],
        ['cells', [[22, 16], [28, 16], [22, 22], [28, 22]], 'P'], ['cells', [[25, 19]], 'X'], ['cells', [[21, 23], [29, 15]], 'H'],
        ['cells', [[17, 11], [33, 11], [17, 29], [33, 29], [17, 10], [33, 10], [17, 30], [33, 30]], '.'],   // arches from the passages into the galleries
        ['cell', 25, 13, 'D'], ['cell', 25, 25, 'D'], ['cell', 9, 21, 'D'], ['cell', 41, 21, 'L'],
        ['cells', [[4, 20], [6, 22]], 'T'], ['cells', [[3, 23], [7, 19]], 'C'], ['cells', [[44, 19], [45, 23], [46, 20]], 'C'],
      ] },
    },
    G: {
      y: 0, wallH: 5.0, wall: 'brick', wallTint: [0.68, 0.64, 0.6], floor: 'concrete2', floorTint: [0.65, 0.63, 0.6], ceil: 'wood', lampPower: 0.6, lampColour: [1, 0.78, 0.5],
      carve: { size: [50, 44], walls: false, ops: [
        // the cemetery wall, with its gate on the south side
        ['room', 0, 0, 49, 0, 'f'], ['room', 0, 43, 49, 43, 'f'], ['room', 0, 0, 0, 43, 'f'], ['room', 49, 0, 49, 43, 'f'],
        ['room', 23, 43, 26, 43, ' '],
        // the avenue up to the chapel, and the cross paths
        ['room', 24, 16, 25, 42, 'p'], ['room', 3, 30, 46, 30, 'p'], ['room', 3, 20, 46, 20, 'p'],
        ['cells', [[22, 18], [27, 18], [22, 24], [27, 24], [22, 28], [27, 28], [22, 34], [27, 34], [22, 38], [27, 38]], 't'],
        // the chapel (its doors south, the altar north, the steps down behind it)
        ['text', 17, 2, [
          '################',
          '#..............#',
          '#.....a........#',
          '#..............#',
          '#..............#',
          '#..qqqq..qqqq..#',
          '#..............#',
          '#..qqqq..qqqq..#',
          '#..............#',
          '#..qqqq..qqqq..#',
          '#..............#',
          '#######DD#######',
        ]],
        ['cells', [[17, 5], [17, 9], [32, 5], [32, 9]], 'W'],
        ['cells', graves, '+'],
        // the mausoleums (Rhys: "doors into non-existent rooms" - they were cupboards: now a room
        // round a family tomb; and set down after the graves, which had knocked holes in their walls)
        ['text', 3, 3, ['#####', '#...#', '#.X.#', '#...#', '##D##']], ['text', 9, 3, ['#####', '#...#', '#.X.#', '#...#', '##L##']],
        ['text', 36, 3, ['#####', '#...#', '#.X.#', '#...#', '##D##']], ['text', 42, 3, ['#####', '#...#', '#.X.#', '#...#', '##L##']],
        ['text', 3, 34, ['##D##', '#...#', '#.X.#', '#...#', '#####']], ['text', 41, 34, ['##L##', '#...#', '#.X.#', '#...#', '#####']],
      ], after: [] },
    },
  },
  stairs: [{ x: 30, y: 9, dir: 'N', len: 6, w: 2, from: 'C', to: 'G' }],
  start: { x: 24, y: 46, floor: 'G', yaw: 0, van: [-6, 2] },
  zones: [
    { id: 'chapel', label: 'Cemetery - St Aldric\'s chapel', at: [17, 2, 32, 13], floor: 'G' },
    { id: 'ossuary', label: 'The crypt - the ossuary', at: [20, 14, 30, 24], floor: 'C' },
    { id: 'yroom', label: 'The crypt - the Yellows\' room', at: [2, 18, 8, 24], floor: 'C' },
    { id: 'galleries', label: 'The crypt - the galleries of tombs', at: [10, 10, 40, 30], floor: 'C' },
  ],
  guards: [
    { id: 'c1', at: [10, 27, 'G'], route: [[4, 30], [20, 30], [20, 22], [4, 22]], arms: 'carbine' },
    { id: 'c2', at: [40, 27, 'G'], route: [[46, 30], [30, 30], [30, 22], [46, 22]], arms: 'carbine' },
    { id: 'c3', at: [24, 15, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'c4', at: [21, 6, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'c5', at: [38, 12, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'c6', at: [25, 11, 'C'], route: [[19, 11], [31, 11]], arms: 'smg' },
    { id: 'c7', at: [13, 20, 'C'], route: [[13, 11], [13, 29]], arms: 'carbine' },
    { id: 'c8', at: [37, 20, 'C'], route: [[37, 29], [37, 11]], arms: 'carbine' },
    { id: 'c9', at: [25, 21, 'C'], arms: 'shotgun', temper: 'steady' },
    { id: 'teodor', at: [5, 21, 'C'], arms: 'revolver', rank: 'officer', temper: 'cowardly', fleeOn: 'hurt', name: 'Brother Teodor' },
  ],
  pickups: [{ id: 'cipher', name: 'The Yellows\' cipher book', what: 'the cipher book', at: [4, 20, 'C'], table: false, h: 0.8, colour: [0.8, 0.1, 0.08] }],      // (M6.19.7, Rhys: it "blends into the table" - red-bound now)
  // (M6.67) papers to read: lore, not needed to finish
  intel: [
    { id: 'rule', at: [6, 22, 'C'], h: 0.78, kind: 'Rule', title: 'The rule of the house, in Brother Teodor\'s hand', text: ['Brothers meet below on the night of the full moon. Nobody comes up the chapel steps after midnight.', 'The book stays in the crypt. It does not leave with anyone - not even with me.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'cipher', text: 'Take the cipher book (the crypt)' },
    { id: 'o2', kind: 'kill', ref: 'teodor', text: 'Stop Brother Teodor' },
    { id: 'o3', kind: 'clear', text: 'Clear the Yellows out', optional: true },
  ],
};
