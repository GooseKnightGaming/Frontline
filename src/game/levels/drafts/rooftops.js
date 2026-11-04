// FRONTLINE - Level 52, the Rooftops (first draft, M6.62; built round the grappling line). The patrol schedules from
// the pens say the reds' river courier makes his hand-over tonight on the roofs of the old quarter in Varnholm, above
// the streets their patrols watch. Go over the roofs to him: planks and ladders between them, or the Grappling Line
// up any wall you can see the top of. Rain on the roofs - they are slippery.
const W = 52, H = 30;
// the buildings: footprint (cells) and roof height
const B = { A: [2, 8, 12, 20, 9], B: [15, 6, 24, 22, 12], C: [27, 8, 36, 20, 7], D: [39, 5, 48, 23, 15] };      // (no two roofs within a metre or so of each other's height: the nav takes the floor by it)
const roofFloor = (k, extra) => {
  const [x0, y0, x1, y1, y] = B[k];
  return { y, wallH: 1.1, roof: false, lamps: false, floor: 'concrete2', floorTint: [0.42, 0.42, 0.44], windows: false,
    carve: { size: [W, H], walls: false, ops: [['room', x0, y0, x1, y1]], after: [
      ['room', x0, y0, x1, y0, '='], ['room', x0, y1, x1, y1, '='], ['room', x0, y0, x0, y1, '='], ['room', x1, y0, x1, y1, '='],
      ...(extra || []),
    ] } };
};
export default {
  id: 'rooftops', no: 52, title: 'The Rooftops', place: 'the old quarter, Varnholm',
  where: 'The roofs of the old quarter, Varnholm. 00:40, rain.',
  brief: [
    ['The courier', 'The reds\' river courier hands over the month\'s <b>codes case</b> tonight - on the <b>tallest roof</b> in the old quarter (east), where nobody in the street can see. Take it.'],
    ['The roofs', 'Four of them, west to east, each a different height. Between them, <b>planks and ladders</b> the roofers left - or your <b>Grappling Line</b>: aim at a ledge or a wall\'s top within twenty metres and press jump. The rain is on the roofs: they are slippery, and a long way down.'],
    ['The streets', 'The reds\' patrols are in the streets below - and on the roofs, a few of the courier\'s men. Down from the tallest roof by its fire ladder, east; the van is in the street there.'],
    ['Objectives', 'Take the <b>codes case</b> (the tallest roof, east). Out by the van in the east street.'],
  ],
  // (M6.82) how it ends (the debrief; the case board's story so far)
  epilogue: {
    success: "The codes case is gone from the tallest roof before the courier's men know it. The reds will use those codes for another month, and Ghost will be reading every word.",
    partial: "The courier knows he was hit. The codes will be changed by the weekend.",
  },
  time: { date: [16, 1, 2027], hour: 0, minute: 40 }, night: true, faction: 'red', requires: 'QGRAPPLE', weather: 'rain',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.12, 0.13, 0.16, 25, 170], ambient: [0.24, 0.25, 0.3] },
  extractName: 'the van in the east street', extract: { x: 50, y: 27, floor: 'G' },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 12 },
  floors: {
    // the streets: the buildings' bodies solid (drawn in extra), the street round them
    G: {
      y: 0, wallH: 3, wall: 'brick', floor: 'asphalt', lampPower: 0.6, lamps: false, windows: false,
      carve: { size: [W, H], walls: false, ops: [], after: [
        ...Object.values(B).map(([x0, y0, x1, y1]) => ['room', x0, y0, x1, y1, 'J']),
        ['cells', [[26, 4], [38, 25], [50, 10]], 'v'], ['cells', [[1, 24], [25, 26], [49, 2]], 'C'],
      ] },
    },
    A: roofFloor('A', [['room', 12, 14, 14, 14, '.'], ['cells', [[5, 11], [9, 17]], 'C']]),          // a gap in the parapet, and a plank east, towards B
    B: roofFloor('B', [['cells', [[15, 14], [24, 10]], '.'], ['cells', [[18, 9], [21, 18], [17, 16]], 'C'], ['cell', 20, 12, 'M']]),        // (gaps for the ladders; a water tank)
    C: roofFloor('C', [['room', 25, 10, 27, 10, '.'], ['room', 36, 14, 38, 14, '.'], ['cells', [[30, 12], [33, 17]], 'C']]),     // planks west (to B) and east (to D), through gaps in the parapet
    D: roofFloor('D', [['cells', [[39, 14], [48, 14]], '.'], ['cells', [[42, 8], [45, 20]], 'C'], ['cells', [[44, 13], [43, 17]], 'T'], ['cell', 41, 18, 'M']]),
  },
  ladders: [
    { x: 14, y: 14, from: 'A', to: 'B', back: [1, 0], off: [16, 14] },      // up from A's plank to B
    { x: 25, y: 10, from: 'C', to: 'B', back: [-1, 0], off: [23, 10] },     // up from C's west plank to B
    { x: 38, y: 14, from: 'C', to: 'D', back: [1, 0], off: [40, 14] },      // up from C's east plank to D
    { x: 49, y: 14, from: 'G', to: 'D', back: [-1, 0], off: [47, 14] },     // D's fire ladder, down to the east street
  ],
  start: { x: 4, y: 14, floor: 'A', yaw: -Math.PI / 2 },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the buildings themselves, brick to their roofs; lit windows here and there
    const tints = { A: [0.55, 0.4, 0.32], B: [0.5, 0.48, 0.45], C: [0.6, 0.45, 0.35], D: [0.42, 0.42, 0.46] };
    for (const [k, [x0, y0, x1, y1, y]] of Object.entries(B)) {
      box([x0 * C, 0, y0 * C], [(x1 + 1) * C, y - 0.02, (y1 + 1) * C], 'brick', { tint: tints[k] });
      for (let yy = 2; yy < y - 1; yy += 3) for (let x = x0 + 1; x < x1; x += 3) {
        const lit = (x * 7 + yy * 3 + y0) % 4 === 0;
        box([x * C + 0.3, yy, y1 * C + C + 0.01], [x * C + 1.2, yy + 1.2, y1 * C + C + 0.04], lit ? 'screen' : 'glassB', { solid: false });
      }
    }
    // the planks over the gaps
    box([13 * C, 8.9, 14 * C + 0.2], [15 * C, 9.0, 15 * C - 0.2], 'wood', { tint: [0.45, 0.35, 0.25], solid: false });
    box([25 * C, 6.9, 10 * C + 0.2], [27 * C, 7.0, 11 * C - 0.2], 'wood', { tint: [0.45, 0.35, 0.25], solid: false });
    box([37 * C, 6.9, 14 * C + 0.2], [39 * C, 7.0, 15 * C - 0.2], 'wood', { tint: [0.45, 0.35, 0.25], solid: false });
    for (const [x, y] of [[14, 2], [26, 25], [38, 2], [51, 18]]) level.lights.push({ pos: [mid(x), 5, mid(y)], range: 14, intensity: 0.9, color: [1, 0.85, 0.6], street: true });
  },
  zones: [
    { id: 'a', label: 'The old quarter - the first roof', at: [2, 8, 12, 20], floor: 'A' },
    { id: 'b', label: 'The old quarter - the high roof', at: [15, 6, 24, 22], floor: 'B' },
    { id: 'c', label: 'The old quarter - the low roof', at: [27, 8, 36, 20], floor: 'C' },
    { id: 'd', label: 'The old quarter - the tallest roof', at: [39, 5, 48, 23], floor: 'D' },
    { id: 'street', label: 'The old quarter - the streets', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'courier', at: [44, 15, 'D'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The river courier', tint: [0.95, 0.95, 1.0] },
    { id: 'd1', at: [41, 10, 'D'], arms: 'carbine', temper: 'steady' },
    { id: 'd2', at: [46, 19, 'D'], route: [[41, 21], [46, 21], [46, 7], [41, 7]], arms: 'smg' },
    { id: 'b1', at: [20, 15, 'B'], yaw: -Math.PI / 2, arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'c1', at: [31, 15, 'C'], route: [[29, 10], [34, 10], [34, 18], [29, 18]], arms: 'carbine' },
    { id: 's1', at: [25, 2, 'G'], route: [[1, 2], [50, 2]], arms: 'carbine' },
    { id: 's2', at: [25, 27, 'G'], route: [[1, 27], [48, 27]], arms: 'carbine' },
    { id: 's3', at: [13, 2, 'G'], route: [[13, 2], [13, 26]], arms: 'smg' },
  ],
  pickups: [{ id: 'case', name: 'The codes case', what: 'the codes case', at: [44, 13, 'D'], table: true, colour: [0.25, 0.25, 0.3] }],
  intel: [
    { id: 'note', at: [43, 17, 'D'], h: 0.78, kind: 'Note', title: 'A note, under the case', text: ['Same time next month. Same roof. Do not use the stairs - the street patrols are not ours.', 'Burn this.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'case', text: 'Take the codes case (the tallest roof, east)' },
  ],
};
