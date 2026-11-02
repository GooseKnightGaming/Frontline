// FRONTLINE - Level 12, the Assassination (first draft). Rhys: "work your way to a
// vantage point in one building and take aim at a senior Red/Yellow from there" - a target who keeps a
// routine, a second building in sight of the first, a marksman rifle, and a way out once the shot is taken.
// Market Square, Varnholm: Colonel Draven Rusk takes his meetings at the reds' consulate; across the
// square, the office block nobody has finished building looks straight into his window.
const W = 60, H = 50;
export default {
  id: 'vantage', no: 12, title: 'The Assassination', place: 'Market Square',
  where: 'Market Square, Varnholm. 10:15, a clear, still morning.',
  brief: [
    ['The place', 'Market Square: on its west side the unfinished Halloran Building, four floors of bare concrete, its east face still open over the square; on the east side the reds\' consulate, three floors. Between them the square - the fountain, the market stalls, the trees.'],
    ['The target', '<b>Colonel Draven Rusk</b>. His office is on the consulate\'s top floor, its window on the square. He keeps to his desk, and every little while goes to the window and stands there. He wears his <b>white dress uniform</b> - and through your sights, a man\'s name shows when you have him.'],
    ['Your kit', 'An LR7 marksman rifle, a silenced V-27C, smoke and a flashbang. The top floor of the Halloran Building looks into his window across the square - about forty-five metres.'],
    ['Objectives', 'Get to the <b>vantage point</b> (the Halloran Building\'s top floor). <b>Stop Colonel Rusk</b>. Then get out: the shot will bring everyone in the square running. Optionally, take the consulate\'s <b>visitors\' book</b> from its front desk.'],
  ],
  time: { date: [13, 8, 2026], hour: 10, minute: 15 }, faction: 'red',
  startLoadout: { primary: 'LR7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES' },
  extractName: 'the van in Tanner\'s Lane',
  outside: { backdrop: 'city', mat: 'concrete2', margin: 14 },
  legend: {
    // a market stall: a counter and an awning over it
    s(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h, cy, cz - 0.4], [cx + h, cy + 0.95, cz + 0.4], 'wood'); k.box([cx - h, cy + 2.2, cz - 0.7], [cx + h, cy + 2.3, cz + 0.7], 'cloth', { solid: false, tint: [(x * 37 % 10) / 10 + 0.3, 0.4, 0.35] }); },
    // the fountain's basin
    o(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h, cy, cz - h], [cx + h, cy + 0.7, cz + h], 'marble', { tint: [0.8, 0.8, 0.78] }); },
  },
  floors: {
    G: {
      y: 0, wallH: 3.4, wall: 'concrete2', floor: 'concrete', ceil: 'concrete2', lampPower: 0.8,
      carve: { size: [W, H], walls: false, ops: [
        // the Halloran Building, ground floor: hoardings round a site entrance at the back (west)
        ['text', 2, 17, ['###############', '#.............#', '#..C......C...#', '#.............#', '#....P.....P..#', '#.............#', 'D.............#', '#.............#', '#.............D', '#.............#', '#....P.....P..#', '#.............#', '#..C.....B....#', '#.............#', '#.............#', '#.............#', '#.............#', '#.............#', '###############']],
        // the consulate
        ['text', 42, 16, [
          '###############',
          '#.....#.......#',
          '#..T..D.......#',
          '#.....#...Z...#',
          '###D###.......#',
          '#.............#',
          '#..KKK....Z...#',
          'W.............#',
          'W.............D',
          'W.............#',
          'D.............#',
          'D.............#',
          'W.............#',
          '###D###.......#',          // (Rhys: doors that stick out of the walls - the back room had no front wall)
          '#.....#.......#',
          '#..H..D...T...#',
          '#.....#.......#',
          '###############',
        ]],
        // the square: the fountain, the stalls, trees and benches
        ['room', 27, 24, 30, 27, 'o'], ['cells', [[20, 19], [22, 19], [24, 19], [34, 19], [36, 19], [20, 33], [22, 33], [24, 33], [34, 33], [36, 33]], 's'],
        ['cells', [[19, 15], [29, 15], [38, 15], [19, 38], [29, 38], [38, 38]], 't'], ['cells', [[26, 40], [31, 12]], 'v'],
      ] },
    },
    1: { y: 3.6, wallH: 3.2, wall: 'concrete2', floor: 'concrete', ceil: 'concrete2', lampPower: 0.8,
      carve: { size: [W, H], walls: false, ops: [
        ['text', 2, 17, ['###############', '#.............#', '#.............#', '#.............#', '#....P.....P..#', '#.............#', '#.............#', '#.............#', '#.............#', '#.............#', '#....P.....P..#', '#.............#', '#.............#', '#.............#', '#.............#', '#.............#', '#.............#', '#.............#', '###############']],
        ['text', 42, 16, ['###############', '#.....#.......#', '#..T..D...T...#', '#.....#.......#', '###D###.......#', '#.............#', '#.............#', 'W.....H.H.....#', 'W.............#', 'W.............#', 'W.............#', 'W.............#', 'W.............#', '###D###.H.....#', '#.............#', '#..T..D...T...#', '#.....#.......#', '###############']],
      ] },
    },
    2: { y: 7.0, wallH: 3.2, wall: 'concrete2', floor: 'concrete', ceil: 'concrete2', lampPower: 0.8,
      carve: { size: [W, H], walls: false, ops: [
        ['text', 2, 17, ['###############', '#.............#', '#.............#', '#.............#', '#....P.....P..#', '#.............=', '#.............=', '#.............=', '#.............=', '#.............=', '#....P.....P..=', '#.............=', '#.............=', '#.............#', '#.............#', '#.............#', '#.............#', '#.............#', '###############']],
        // the consulate's top floor: Colonel Rusk's office (west, on the square), the anteroom, a meeting room
        ['text', 42, 16, ['###############', '#.............#', '#...T.....T...#', '#.............#', '#######D#######', '#.....#.......#', '#.....#...T...#', 'W.....#.......#', 'W.....D.......#', 'W..T..#.......#', 'W.....#.......#', 'W.....#.Z.....#', '#.....#.......#', '#######D##.####', '#.............#', '#...T.....T...#', '#.............#', '###############']],
      ] },
    },
    3: { y: 10.4, wallH: 3.0, roof: false, wall: 'concrete2', floor: 'concrete', lamps: false,
      carve: { size: [W, H], walls: false, ops: [
        ['text', 2, 17, ['###############', '#.............#', '#..C..........#', '#.............#', '#....P.....P..#', '#.............=', '#.............=', '#.............=', '#.............=', '#.............=', '#....P.....P..=', '#.............=', '#.............=', '#.............=', '#.............#', '#.........B...#', '#.............#', '#.............#', '###############']],
      ] },
    },
  },
  stairs: [
    { x: 4, y: 33, dir: 'N', len: 5, w: 1, from: 'G', to: '1' },
    { x: 6, y: 29, dir: 'S', len: 5, w: 1, from: '1', to: '2' },
    { x: 4, y: 33, dir: 'N', len: 5, w: 1, from: '2', to: '3' },
    { x: 54, y: 31, dir: 'N', len: 5, w: 1, from: 'G', to: '1' },
    { x: 52, y: 31, dir: 'N', len: 5, w: 1, from: '1', to: '2' },
  ],
  start: { x: -4, y: 26, floor: 'G', yaw: -Math.PI / 2, van: [-4, 0] },
  reach: [{ id: 'vantage', name: 'The vantage point', at: [8, 21, 15, 30], floor: '3' }],
  zones: [
    { id: 'halloran', label: 'Market Square - the Halloran Building', at: [2, 17, 16, 35] },
    { id: 'halloran3', label: 'The Halloran Building - the top floor', at: [2, 17, 16, 35], floor: '3' },
    { id: 'consulate', label: 'Market Square - the consulate', at: [42, 16, 56, 33] },
    { id: 'office', label: 'The consulate - Colonel Rusk\'s office', at: [43, 21, 47, 28], floor: '2' },
  ],
  guards: [
    { id: 'v1', at: [9, 25, 'G'], route: [[4, 19], [14, 19], [14, 33], [4, 33]], arms: 'carbine' },
    { id: 'v2', at: [10, 22, '1'], arms: 'pistol', temper: 'cowardly' },
    { id: 'v3', at: [8, 31, '2'], arms: 'carbine', temper: 'steady' },
    { id: 'v4', at: [28, 22, 'G'], route: [[18, 22], [38, 22], [38, 30], [18, 30]], arms: 'carbine' },
    { id: 'v5', at: [33, 36, 'G'], route: [[18, 36], [40, 36]], arms: 'smg' },
    { id: 'v6', at: [40, 26, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'v7', at: [40, 18, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'v8', at: [48, 23, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'v9', at: [52, 28, 'G'], route: [[44, 28], [55, 28]], arms: 'carbine' },
    { id: 'v10', at: [50, 22, '1'], route: [[50, 22], [55, 22], [55, 30], [50, 30]], arms: 'smg' },
    { id: 'v11', at: [50, 25, '2'], arms: 'smg', rank: 'sergeant', temper: 'steady' },
    { id: 'rusk', at: [45, 24, '2'], route: [[45, 24, 9], [43, 25, 12]], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'Colonel Draven Rusk', tint: [1.75, 1.75, 1.8] },      // (his white dress uniform - the one to look for)
  ],
  pickups: [{ id: 'book', name: 'The visitors\' book', what: 'the visitors\' book', at: [45, 22, 'G'], table: false, h: 1.12, colour: [0.25, 0.3, 0.5] }],
  // (M6.68) papers to read: lore, not needed to finish
  intel: [
    { id: 'diary', at: [45, 25, '2'], h: 0.78, kind: 'Diary', title: 'Colonel Rusk\'s desk diary', text: ['10:00 the consul. 10:20 the balcony - the square to see me. 11:00 the car.', 'In the margin, underlined: "Same as every Tuesday."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'reach', ref: 'vantage', text: 'Get to the vantage point (the Halloran Building, top floor)' },
    { id: 'o2', kind: 'kill', ref: 'rusk', text: 'Stop Colonel Rusk' },
    { id: 'o3', kind: 'take', ref: 'book', text: 'Take the visitors\' book (the consulate)', optional: true },
  ],
};
