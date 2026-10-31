// FRONTLINE - Level 10, the Mineshaft and the open pit (first draft). Rhys (after M6.17.8):
// "a working or abandoned mine - timbered tunnels, a cage lift down the shaft, ore carts on rails, a
// pumping station, and the open pit where it has been bored down: a gigantic gaping hole, its sides
// terraced with haul roads spiralling down". Kessock Quarry: worked out, sold on - to the Yellows.
// The pit is cut in terraces (four metres each), joined by ramps; the mine's tunnels run from its floor
// to the shaft, sixteen metres down under the headframe. (The cage lift is a ladder in this draft.)
const W = 80, H = 72, C = 1.5;
// a terrace: the ring between two squares of the pit (corners inclusive)
const ring = (o, i) => { const out = []; for (let y = o; y <= 70 - o; y++) for (let x = o; x <= 70 - o; x++) if (!(x >= i && x <= 70 - i && y >= i && y <= 70 - i)) out.push([x, y]); return out; };
// the pit: 18..52 (35 squares) at the top; terraces at -4 (18..52), -8 (23..47), -12 (28..42); its floor at -16 (32..38)
const T1 = ring(18, 23), T2 = ring(23, 28), T3 = ring(28, 32);
const pitHoles = []; for (let y = 18; y <= 52; y++) for (let x = 18; x <= 52; x++) pitHoles.push([x, y]);

export default {
  id: 'mine', no: 10, title: 'The Mineshaft', place: 'Kessock Quarry',
  where: 'Kessock Quarry, up on the moor. 11:20, bright and windy.',
  brief: [
    ['The place', 'The quarry yard: the site office, the workshop, the headframe over the old shaft. Beside it the open pit, cut down in terraces four metres at a time, ramps between them, to its floor sixteen metres down. From the pit floor the mine runs east under the yard: the haulage tunnel with its rails, the ore chamber, the pumping station, and the shaft - a long ladder up to the headframe.'],
    ['The Yellows', 'Fourteen of them: in the yard, on the terraces, and below ground.'],
    ['Objectives', 'Take the Yellows\' <b>arms manifest</b> from the site office. Find <b>Dr Mira Kovač</b>, the surveyor they took, in the pumping station, and bring her up to the van. Clearing them out is optional.'],
    ['Watch your step', 'The terrace edges are four-metre drops. Underground it is dark: night vision is in your kit.'],
  ],
  time: { date: [6, 8, 2026], hour: 11, minute: 20 }, startGear: 'NVG', faction: 'yellow',
  extractName: 'the van at the quarry gate',
  outside: { backdrop: 'hills', mat: 'desert', margin: 14, holes: pitHoles },
  legend: {
    // rails along the haulage tunnel (two thin strips), and an ore cart on them
    n(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; for (const dz of [-0.35, 0.35]) k.box([cx - h, cy, cz + dz - 0.03], [cx + h, cy + 0.08, cz + dz + 0.03], 'metal', { solid: false, tint: [0.4, 0.38, 0.36] }); },
    u(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f); k.box([cx - 0.7, cy + 0.2, cz - 0.5], [cx + 0.7, cy + 1.1, cz + 0.5], 'metal', { tint: [0.35, 0.3, 0.25] }); k.box([cx - 0.6, cy + 1.0, cz - 0.4], [cx + 0.6, cy + 1.2, cz + 0.4], 'rock', { solid: false }); },
    // a timber set: posts each side and a cap over the tunnel
    m(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - 0.12, cy, cz - h], [cx + 0.12, cy + 2.9, cz - h + 0.25], 'wood'); k.box([cx - 0.12, cy, cz + h - 0.25], [cx + 0.12, cy + 2.9, cz + h], 'wood'); },
  },
  floors: {
    M: {
      y: -16, wallH: 4.0, wall: 'rock', floor: 'rock', floorTint: [0.8, 0.75, 0.68], ceil: 'rock', lampPower: 0.5, lampColour: [1, 0.85, 0.6], lampEvery: 12,
      noRoof: [[32, 32, 38, 38]],
      carve: { size: [W, H], ops: [
        ['room', 32, 32, 38, 38],                      // the pit floor
        ['room', 39, 35, 63, 36],                      // the haulage tunnel, east under the yard
        ['room', 44, 26, 54, 32], ['room', 49, 33, 50, 34],   // the ore chamber
        ['room', 55, 39, 62, 46], ['room', 58, 37, 59, 38],   // the pumping station
        ['room', 64, 32, 68, 38],                      // the shaft bottom
      ], after: [
        ['room', 40, 35, 62, 35, 'n'], ['cells', [[44, 35], [57, 35]], 'u'],
        ['cells', [[42, 36], [46, 36], [52, 36], [56, 36], [61, 36]], 'm'],
        ['cells', [[46, 28], [52, 30], [48, 31]], 'u'], ['cells', [[45, 27], [53, 27], [53, 31]], 'C'],
        ['cells', [[56, 40], [58, 40], [60, 40], [56, 45]], 'M'], ['cells', [[61, 44], [61, 45]], 'B'],
        ['cell', 34, 39, ' '],                         // the ramp up to the terrace above goes out through here
      ] },
    },
    T3: { y: -12, wallH: 3, roof: false, lamps: false, floor: 'desert', floorTint: [0.78, 0.7, 0.6], carve: { size: [W, H], walls: false, ops: [['cells', T3, '.']] } },
    T2: { y: -8, wallH: 3, roof: false, lamps: false, floor: 'desert', floorTint: [0.82, 0.74, 0.64], carve: { size: [W, H], walls: false, ops: [['cells', T2, '.']] } },
    T1: { y: -4, wallH: 3, roof: false, lamps: false, floor: 'desert', floorTint: [0.86, 0.78, 0.68], carve: { size: [W, H], walls: false, ops: [['cells', T1, '.']] } },
    G: {
      y: 0, wallH: 3.6, wall: 'cladding', floor: 'concrete', ceil: 'metal', lampPower: 0.9,
      carve: { size: [W, H], walls: false, ops: [
        ['text', 60, 52, ['#########', '#.T...H.#', '#.......#', '#.T..T..D', '#.......#', '#H.....T#', '#########']],          // the site office
        ['text', 4, 56, ['#########', '#M..C...#', '#.......#', '#M..T..CD', '#.......#', '#B..M...#', '#########']],          // the workshop
        ['text', 63, 30, ['#######', '#.....#', '#.....#', '#.....D', '#.....#', '#.....#', '#######']],                      // the headframe house
        ['cells', [[58, 14], [62, 18], [10, 20], [8, 44], [66, 64], [30, 62], [40, 64]], 'r'],
        ['cells', [[12, 34], [56, 24], [24, 60]], 'v'], ['cells', [[14, 30], [60, 26], [26, 58], [50, 60]], 'C'],
      ] },
    },
  },
  // the ramps run along a terrace on its inner side, so the rest of it stays clear, and come out at its
  // corner onto the terrace above
  stairs: [
    { x: 48, y: 22, dir: 'N', len: 5, w: 2, from: 'T1', to: 'G' },
    { x: 43, y: 27, dir: 'N', len: 5, w: 2, from: 'T2', to: 'T1' },
    { x: 30, y: 38, dir: 'S', len: 5, w: 2, from: 'T3', to: 'T2' },
    { x: 34, y: 35, dir: 'S', len: 4, w: 1, from: 'M', to: 'T3' },
  ],
  ladders: [{ x: 66, y: 32, from: 'M', to: 'G', back: [0, -1] }],
  start: { x: 5, y: 36, floor: 'G', yaw: -Math.PI / 2, van: [-4, 0] },
  extra(kit) {
    // the pit's faces: rock walls round each terrace's outer edge, from it up to the one above -
    // gapped where a ramp comes up through them
    const { box, CELL } = kit, t = 1.0;
    const faces = [[18, 52, -4, 0, { n: [48, 49] }], [23, 47, -8, -4, { n: [43, 44] }], [28, 42, -12, -8, { s: [30, 31] }]];
    for (const [a, b, y0, y1, gap] of faces) {
      const x0 = a * CELL, x1 = (b + 1) * CELL;
      const run = (side, fixed, from, to, gp) => {
        // a face along one side, in pieces round its gap (rows/cols gp, inclusive)
        const segs = gp ? [[from, gp[0] * CELL], [(gp[1] + 1) * CELL, to]] : [[from, to]];
        for (const [p, q] of segs) {
          if (q <= p) continue;
          if (side === 'n') box([p, y0, fixed - t], [q, y1, fixed], 'rock');
          if (side === 's') box([p, y0, fixed], [q, y1, fixed + t], 'rock');
          if (side === 'w') box([fixed - t, y0, p], [fixed, y1, q], 'rock');
          if (side === 'e') box([fixed, y0, p], [fixed + t, y1, q], 'rock');
        }
      };
      run('n', x0, x0 - t, x1 + t, gap.n); run('s', x1, x0 - t, x1 + t, gap.s);
      run('w', x0, x0, x1, gap.w); run('e', x1, x0, x1, gap.e);
    }
    // (Rhys: "still a gaping void" on the pit floor) the ramp's way out through the pit floor's south wall
    // left the space under its landing open to the sky: rock under it, up to the terrace
    box([34 * CELL - 0.7, -16, 39 * CELL + 0.5], [35 * CELL + 0.7, -12.02, 40 * CELL], 'rock');
    // the shaft: a rock-lined well from the mine's roof to the ground, round the ladder
    const sx = 66 * CELL, sz = 32 * CELL;
    box([sx - 0.2, -12, sz - 0.3], [sx, -1, sz + CELL + 0.3], 'rock'); box([sx + CELL, -12, sz - 0.3], [sx + CELL + 0.2, -1, sz + CELL + 0.3], 'rock');
    box([sx, -12, sz + CELL], [sx + CELL, -1, sz + CELL + 0.2], 'rock'); box([sx, -12, sz - 0.3], [sx + CELL, -1, sz - 0.1], 'rock');
  },
  zones: [
    { id: 'office', label: 'Kessock Quarry - the site office', at: [60, 52, 68, 58], floor: 'G' },
    { id: 'pitfloor', label: 'Kessock Quarry - the pit floor', at: [32, 32, 38, 38], floor: 'M' },
    { id: 'tunnel', label: 'The mine - the haulage tunnel', at: [39, 35, 63, 36], floor: 'M' },
    { id: 'ore', label: 'The mine - the ore chamber', at: [44, 26, 54, 34], floor: 'M' },
    { id: 'pumps', label: 'The mine - the pumping station', at: [55, 37, 62, 46], floor: 'M' },
    { id: 'shaft', label: 'The mine - the shaft', at: [64, 32, 68, 38], floor: 'M' },
  ],
  guards: [
    { id: 'q1', at: [12, 38, 'G'], route: [[14, 30], [14, 64], [56, 64], [56, 14]], arms: 'carbine' },
    { id: 'q2', at: [64, 55, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'q3', at: [66, 34, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'q4', at: [8, 60, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'q5', at: [54, 20, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'q6', at: [20, 35, 'T1'], route: [[20, 20], [20, 50], [50, 50], [50, 20]], arms: 'carbine' },
    { id: 'q7', at: [35, 25, 'T2'], route: [[25, 25], [45, 25], [45, 45], [25, 45]], arms: 'smg' },
    { id: 'q8', at: [30, 30, 'T3'], arms: 'carbine', temper: 'steady' },
    { id: 'q9', at: [35, 33, 'M'], arms: 'shotgun', rank: 'sergeant', temper: 'steady' },
    { id: 'q10', at: [50, 36, 'M'], route: [[40, 36], [62, 36]], arms: 'smg' },
    { id: 'q11', at: [49, 29, 'M'], arms: 'carbine' },
    { id: 'q12', at: [58, 43, 'M'], arms: 'pistol', rank: 'officer', temper: 'steady' },
    { id: 'q13', at: [60, 41, 'M'], arms: 'smg', temper: 'steady' },
    { id: 'q14', at: [66, 36, 'M'], arms: 'carbine' },
  ],
  hostages: [{ id: 'kovac', name: 'Dr Mira Kovač', she: true, at: [57, 44, 'M'] }],
  pickups: [{ id: 'manifest', name: 'The Yellows\' arms manifest', what: 'the manifest', at: [62, 53, 'G'], table: false, h: 0.8, colour: [0.85, 0.75, 0.3] }],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'manifest', text: 'Take the arms manifest (the site office)' },
    { id: 'o2', kind: 'rescue', ref: 'kovac', text: 'Bring Dr Mira Kovač out' },
    { id: 'o3', kind: 'clear', text: 'Clear the Yellows out', optional: true },
  ],
};
