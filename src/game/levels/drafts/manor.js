// FRONTLINE - Level 9, the Manor House and its estate (first draft). Rhys (after M6.17.8):
// "the full estate - the house with its servants' quarters (back stairs, the servants' corridors...
// the kitchens below stairs), the family's rooms above, a library, gallery, chapel, cellars; the
// grounds: gardens, stables, a gatehouse, a walled kitchen garden, outbuildings; and a private forest
// behind it... The back stairs and servants' passages are the hidden way through the house."
// Ashcombe Park: Sir Julian Harrow, arms broker, is selling to the reds tonight.
const W = 90, H = 84;
// the forest behind the house: trees scattered over the north, paths through them, the gamekeeper's hut
const trees = [];
{ let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 1; y < 24; y += 2) for (let x = 1; x < W - 1; x += 3) { const tx = x + Math.floor(r() * 2), ty = y + Math.floor(r() * 2); if (Math.abs(tx - 45) > 1 && Math.abs(ty - 12) > 1 && !(tx > 18 && tx < 28 && ty > 4 && ty < 12) && r() < 0.62) trees.push([tx, ty]); } }

export default {
  id: 'manor', no: 9, title: 'The Manor House', place: 'Ashcombe Park',
  where: 'Ashcombe Park, the Harrow estate. 21:15, midsummer - the last of the light.',
  brief: [
    ['The place', 'The house: the entrance hall and its grand stair, the library and drawing room (west), the dining room (east), the servants\' hall behind - its back stairs going down to the kitchens and cellars and up to the servants\' corridor on the first floor. Upstairs, the family\'s bedrooms and the long gallery. Outside: the gatehouse and the drive, the formal gardens, the chapel, the stables, the walled kitchen garden, and the forest behind the house with the gamekeeper\'s hut.'],
    ['Who is here', 'Sir Julian Harrow\'s private security - fourteen reds, at the gate, in the grounds and in the house. Harrow himself is upstairs, in the long gallery.'],
    ['Objectives', 'Take Harrow\'s <b>sales ledger</b> from the library. Hack the <b>terminal in the butler\'s pantry</b> (the cellars) to open the strongroom, and take the <b>prototype</b> from it. Optionally, stop <b>Sir Julian Harrow</b>.'],
    ['The back way', 'The servants\' stairs and passages go from the cellars to the first floor without crossing the family\'s rooms - and the kitchen door, round the back, is the servants\' own way in.'],
  ],
  // (M6.83) how it ends (the debrief; the case board's story so far)
  epilogue: {
    success: "Harrow's sales ledger names every buyer of every prototype he has sold, and the latest one never left his strongroom. Sir Julian is very quiet at his club that weekend.",
    partial: "Part of Harrow's business is exposed. He has friends who will make the rest go away.",
  },
  time: { date: [21, 6, 2026], hour: 21, minute: 15 }, night: true, faction: 'red',
  extractName: 'the van outside the gatehouse',
  outside: { backdrop: 'woods', mat: 'lawn', margin: 14 },
  decals: { p: { mat: 'concrete2', tint: [0.78, 0.74, 0.66] } },
  legend: {
    // a stall in the stables
    s(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h, cy, cz - 0.06], [cx + h, cy + 1.4, cz + 0.06], 'wood'); },
    // a painting on the gallery wall, a statue in the garden
    j(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 0.35, cy, cz - 0.35], [cx + 0.35, cy + 0.9, cz + 0.35], 'marble'); k.box([cx - 0.2, cy + 0.9, cz - 0.2], [cx + 0.2, cy + 2.3, cz + 0.2], 'marble', { tint: [0.9, 0.9, 0.88] }); },
    a(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 0.7, cy, cz - 0.45], [cx + 0.7, cy + 1.0, cz + 0.45], 'marble'); },
    q(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h + 0.05, cy, cz - 0.25], [cx + h - 0.05, cy + 0.45, cz + 0.25], 'wood'); k.box([cx - h + 0.05, cy + 0.45, cz + 0.15], [cx + h - 0.05, cy + 0.95, cz + 0.25], 'wood'); },
  },
  floors: {
    C: {
      y: -3.6, wallH: 2.6, wall: 'brick', wallTint: [0.8, 0.72, 0.62], floor: 'concrete2', ceil: 'brick', lampPower: 0.6, lampColour: [1, 0.8, 0.55],
      carve: { size: [W, H], ops: [
        ['room', 38, 31, 52, 40],                      // the kitchens below stairs
        ['room', 31, 31, 36, 40],                      // the wine cellar
        ['room', 54, 31, 59, 35],                      // the butler's pantry
        ['room', 54, 37, 59, 40],                      // the strongroom
        ['room', 38, 42, 52, 45],                      // the servants' passage, to the area steps
        ['room', 53, 44, 56, 45],
      ], after: [
        ['cell', 37, 35, 'D'], ['cell', 53, 33, 'D'], ['cell', 56, 36, 'V'], ['cell', 45, 41, 'D'],
        ['room', 40, 32, 50, 32, 'K'], ['cells', [[44, 36], [47, 36]], 'T'], ['cells', [[32, 32], [32, 34], [32, 36], [32, 38], [35, 32], [35, 34], [35, 36], [35, 38]], 'H'],
        ['cells', [[58, 32], [55, 32]], 'H'], ['cells', [[56, 39], [58, 39]], 'H'], ['cells', [[50, 43], [40, 44]], 'C'],
      ] },
    },
    G: {
      y: 0, wallH: 4.0, wall: 'plaster', wallTint: [0.95, 0.9, 0.8], floor: 'wood', ceil: 'plaster', lampPower: 1.0, lampColour: [1, 0.85, 0.65],
      carve: { size: [W, H], walls: false, ops: [
        // the house (walls drawn round its rooms below)
        ['text', 30, 30, [
          '###############################',
          '#........#.........#..........#',
          '#........#.........#..........#',
          '#...Z....#.........#....T.....#',
          '#........#.........#..........#',
          '#..Z..Z..D.........D..........#',
          '#........#.........#..........#',
          '#...T....#.........#..........#',
          '#........#.........#..........#',
          '#........####DD#####..........#',
          '###D######.........#####D######',
          '#.H.H.H..#..j...j..#..........#',
          '#........#.........#..TTTTTT..#',
          '#..T.....D.........D..........#',
          '#........#.........#..TTTTTT..#',
          '#.H.H.H..#..j...j..#..........#',
          '#........#.........#..........#',
          '#..Z.....#.........#..........#',
          '#........#.........#..........#',
          '#####W#W####W#DD#W#####W#W#####',
        ]],
        ['cells', [[30, 33], [30, 37], [60, 33], [60, 37], [30, 43], [30, 46], [60, 43], [60, 46]], 'W'],
        ['cell', 45, 30, 'D'],                          // the servants' door, round the back
        // the chapel (east), the stables, the gatehouse, the walled kitchen garden (west)
        ['text', 66, 38, ['#########', '#.......#', '#...a...#', '#.......#', '#.qq.qq.#', '#.......#', '#.qq.qq.#', '#.......#', '#.qq.qq.#', '#.......#', '####D####']],
        ['text', 64, 54, ['##############', '#.s.s.s.s.s..#', '#............D', '#.s.s.s.s.s..#', '#..C......B..#', '##############']],
        ['text', 40, 72, ['####...####', '#..#...#..#', '#..D...D..#', '####...####']],
        ['text', 8, 30, [
          '#################',
          '#ggg.ggg.ggg.ggg#',
          '#...............#',
          '#ggg.ggg.ggg.ggg#',
          '#...............#',
          '#ggg.ggg.ggg.ggg#',
          '#...............D',
          '#ggg.ggg.ggg.ggg#',
          '#...............#',
          '#ggg.ggg.ggg.ggg#',
          '#################',
        ]],
        // the gamekeeper's hut, in the forest
        ['text', 19, 5, ['#######', '#.....#', '#..T..D', '#.....#', '#######']],
        // the estate's railings, the drive and paths, the parterre, the forest
        ['room', 0, 26, 89, 26, 'f'], ['room', 0, 83, 89, 83, 'f'], ['room', 0, 26, 0, 83, 'f'], ['room', 89, 26, 89, 83, 'f'],
        ['room', 43, 26, 47, 26, ' '], ['room', 43, 83, 47, 83, ' '],
        ['room', 44, 50, 46, 82, 'p'], ['room', 44, 13, 46, 29, 'p'], ['room', 4, 12, 86, 12, 'p'], ['room', 20, 50, 70, 51, 'p'],
        ['cells', [[36, 55], [37, 55], [38, 55], [36, 59], [37, 59], [38, 59], [36, 63], [37, 63], [38, 63], [52, 55], [53, 55], [54, 55], [52, 59], [53, 59], [54, 59], [52, 63], [53, 63], [54, 63]], 'h'],
        ['cells', [[40, 57], [50, 57], [40, 61], [50, 61], [45, 66]], 'j'],
        ['cells', trees, 't'],
      ] },
    },
    1: {
      y: 4.2, wallH: 3.6, wall: 'plaster', wallTint: [0.92, 0.88, 0.82], floor: 'carpet', ceil: 'plaster', lampPower: 0.9, lampColour: [1, 0.85, 0.65],
      carve: { size: [W, H], walls: false, ops: [
        ['text', 30, 30, [
          '###############################',
          '#........#.........#..........#',
          '#...Y....#.........#....j.....#',
          '#........#..#####..#..........#',
          '#........#..#...#..#..........#',
          '#........D..#.Y.D..D..........#',
          '###D######..#...#..#....j.....#',
          '#........#..#####..#..........#',
          '#...Y....#.........#..........#',
          '#........##DD#######..........#',
          '#........#.........#..........#',
          '#........#.........#....j.....#',
          '#........#.........#..........#',
          '#...Z....D.........D..........#',
          '#........#.........#..........#',
          '#...Y....#.........#....j.....#',
          '#........#.........#..........#',
          '#........#.........#..........#',
          '#........#.........#..........#',
          '#####W#W####W####W######W#W####',
        ]],
      ] },
    },
  },
  stairs: [
    { x: 44, y: 47, dir: 'N', len: 6, w: 2, from: 'G', to: '1' },      // the grand stair
    { x: 42, y: 38, dir: 'N', len: 5, w: 1, from: 'C', to: 'G' },      // the back stairs, down to the kitchens
    { x: 48, y: 37, dir: 'N', len: 5, w: 1, from: 'G', to: '1' },      // and up to the servants' corridor (its foot one square in from the wall, so it can be walked onto)
    { x: 54, y: 46, dir: 'N', len: 0, w: 1, from: 'C', to: 'G', skip: true },
  ].filter((s) => !s.skip),
  start: { x: 45, y: 87, floor: 'G', yaw: 0, van: [-5, 2] },
  zones: [
    { id: 'hall', label: 'Ashcombe - the entrance hall', at: [40, 40, 49, 48], floor: 'G' },
    { id: 'library', label: 'Ashcombe - the library', at: [31, 41, 39, 48], floor: 'G' },
    { id: 'drawing', label: 'Ashcombe - the drawing room', at: [31, 31, 39, 39], floor: 'G' },
    { id: 'dining', label: 'Ashcombe - the dining room', at: [51, 41, 59, 48], floor: 'G' },
    { id: 'servants', label: 'Ashcombe - the servants\' hall', at: [40, 31, 49, 38], floor: 'G' },
    { id: 'gallery', label: 'Ashcombe - the long gallery', at: [50, 31, 59, 48], floor: '1' },
    { id: 'kitchens', label: 'Ashcombe - the kitchens below stairs', at: [38, 31, 52, 40], floor: 'C' },
    { id: 'pantry', label: 'Ashcombe - the butler\'s pantry', at: [54, 31, 59, 35], floor: 'C' },
    { id: 'chapel', label: 'Ashcombe - the chapel', at: [66, 38, 74, 48], floor: 'G' },
    { id: 'stables', label: 'Ashcombe - the stables', at: [64, 54, 77, 59], floor: 'G' },
    { id: 'kgarden', label: 'Ashcombe - the walled kitchen garden', at: [8, 30, 24, 40], floor: 'G' },
    { id: 'forest', label: 'Ashcombe - the forest', at: [0, 0, 89, 25], floor: 'G' },
  ],
  guards: [
    { id: 'm1', at: [42, 74, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'm2', at: [48, 74, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'm3', at: [45, 60, 'G'], route: [[34, 52], [56, 52], [56, 68], [34, 68]], arms: 'carbine' },
    { id: 'm4', at: [70, 56, 'G'], arms: 'smg' },
    { id: 'm5', at: [20, 35, 'G'], route: [[10, 32], [22, 32], [22, 38], [10, 38]], arms: 'pistol' },
    { id: 'm6', at: [45, 20, 'G'], route: [[45, 14], [45, 25], [70, 12], [20, 12]], arms: 'dmr', rank: 'specialist' },
    { id: 'm7', at: [45, 44, 'G'], arms: 'smg', rank: 'sergeant', temper: 'steady' },
    { id: 'm8', at: [35, 45, 'G'], arms: 'pistol' },
    { id: 'm9', at: [55, 44, 'G'], route: [[52, 42], [58, 42], [58, 47], [52, 47]], arms: 'carbine' },
    { id: 'm10', at: [45, 34, 'C'], arms: 'shotgun', temper: 'steady' },
    { id: 'm11', at: [56, 33, 'C'], arms: 'pistol', temper: 'cowardly' },
    { id: 'm12', at: [44, 32, '1'], route: [[40, 32], [47, 32]], arms: 'smg' },
    { id: 'm13', at: [54, 40, '1'], route: [[55, 32], [55, 47]], arms: 'carbine' },
    { id: 'harrow', at: [57, 44, '1'], arms: 'revolver', rank: 'officer', temper: 'cowardly', name: 'Sir Julian Harrow' },
  ],
  pickups: [
    { id: 'ledger', name: 'Harrow\'s sales ledger', what: 'the ledger', at: [34, 44, 'G'], colour: [0.45, 0.15, 0.12] },
    { id: 'prototype', name: 'The prototype', what: 'the prototype', at: [57, 38, 'C'], colour: [0.6, 0.65, 0.7] },
  ],
  terminals: [{ id: 'pantry', name: 'the terminal in the butler\'s pantry', at: [57, 34, 'C'], face: [0, -1], time: 5, reveal: 25,
    said: 'The pantry terminal: the strongroom door is unlocked, and the house cameras put every red on your radar for 25 seconds.' }],
  // (M6.68) papers to read: lore, not needed to finish
  intel: [
    { id: 'menu', at: [34, 37, 'G'], h: 0.78, kind: 'Card', title: 'A place card from the drawing room', text: ['"Sir Julian Harrow requests the pleasure." Six names below, four of them crossed out and written in again with titles added.', 'On the back: "The buyers arrive at nine. Sir Julian shows the ledger, nothing else."'] },
    { id: 'cook', at: [44, 36, 'C'], h: 0.78, kind: 'List', title: 'The cook\'s list', text: ['Dinner for eight. The guests\' drivers to be fed in the kitchen and kept there.', 'Underlined twice: "Nobody below stairs goes near the pantry door tonight."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'ledger', text: 'Take the sales ledger (the library)' },
    { id: 'o2', kind: 'hack', ref: 'pantry', text: 'Hack the terminal in the butler\'s pantry (the cellars)' },
    { id: 'o3', kind: 'take', ref: 'prototype', text: 'Take the prototype (the strongroom)' },
    { id: 'o4', kind: 'kill', ref: 'harrow', text: 'Stop Sir Julian Harrow', optional: true },
  ],
};
