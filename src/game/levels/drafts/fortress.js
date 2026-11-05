// FRONTLINE - Level 16, the Fortress (first draft). Rhys: "a fortified compound
// bristling with automatic weapons and rockets - machine guns of every weight (SMGs, LMGs, mounted
// HMGs) and rocket launchers... walls, towers, gates and a yard to cross - the routes in around the
// guns, not through them." Fort Kerreth: the reds' mountain compound, and the launch keys inside it.
const W = 70, H = 64;
// the wall-walk: the top of the curtain wall all round, and the four towers' platforms
const walk = [];
for (let x = 10; x <= 59; x++) { walk.push([x, 10]); walk.push([x, 11]); walk.push([x, 52]); walk.push([x, 53]); }
for (let y = 12; y <= 51; y++) { walk.push([10, y]); walk.push([11, y]); walk.push([58, y]); walk.push([59, y]); }
const parapet = [];
for (let x = 7; x <= 62; x++) { parapet.push([x, 9]); parapet.push([x, 54]); }
for (let y = 10; y <= 53; y++) { parapet.push([9, y]); parapet.push([60, y]); }
export default {
  id: 'fortress', no: 16, title: 'The Fortress', place: 'Fort Kerreth',
  where: 'Fort Kerreth, high in the Vashka hills. 15:30, cold and clear.',
  brief: [
    ['The place', 'A curtain wall five metres high round a square yard, a tower at each corner, the main gate in the south wall. Inside: the barracks, the motor pool, the armoury, and the command bunker in the middle. Ladders up to the wall-walk inside each corner.'],
    ['The guns', 'Every weight of them: a heavy machine gun mounted on two of the towers, light machine guns on the walls and at the gate, rocket launchers on the wall-walk. They cover the approaches and the yard. Go round them, not through them: the old drainage culvert under the west wall is low - you will have to crawl - but it comes up inside, by the motor pool.'],
    ['Objectives', 'Take the <b>launch keys</b> from the command bunker. Optionally, hack the <b>signals terminal</b> in the armoury, and stop <b>Commander Brask</b>.'],
    ['New weapons', 'The KR-90 light machine gun: a ninety-round belt, slow to reload. Take one from a gunner who no longer needs it.'],
  ],
  epilogue: {
    success: "Fort Kerreth's keys go down the mountain with Ghost, and Commander Brask with them. The fort is just an old fort on a cold hill again.",
    partial: "Kerreth is quiet, but not entirely Ghost's. The hills will need watching.",
  },
  time: { date: [4, 9, 2026], hour: 15, minute: 30 }, faction: 'red', navCap: 160000,
  extractName: 'the van down the track',
  outside: { backdrop: 'hills', mat: 'desert', margin: 14 },
  decals: { _: { mat: 'concrete2', tint: [0.7, 0.68, 0.62] } },
  doorSkins: { 'G:34,55': { mat: 'armour', build: 'sturdy', label: 'gate' }, 'G:61,30': { mat: 'armour', build: 'sturdy', locked: true, label: 'postern' } },      // (the paved way through the wall, at the gate and the postern)
  floors: {
    G: {
      y: 0, wallH: 5.0, wall: 'concrete2', wallTint: [0.7, 0.68, 0.62], floor: 'concrete', ceil: 'concrete2', lampPower: 0.7, lampEvery: 10,
      carve: { size: [W, H], walls: false, ops: [
        // the curtain wall (two squares thick) and its towers
        ['room', 8, 8, 61, 9, '#'], ['room', 8, 54, 61, 55, '#'], ['room', 8, 8, 9, 55, '#'], ['room', 60, 8, 61, 55, '#'],
        ['room', 6, 6, 12, 12, '#'], ['room', 57, 6, 63, 12, '#'], ['room', 6, 51, 12, 57, '#'], ['room', 57, 51, 63, 57, '#'],
        ['room', 8, 8, 10, 10, '.'], ['room', 59, 8, 61, 10, '.'], ['room', 8, 53, 10, 55, '.'], ['room', 59, 53, 61, 55, '.'],
        // inside: the barracks (north-west), the motor pool (south-west), the armoury (north-east), the command bunker (the middle)
        ['text', 14, 13, ['###############', '#.Y.Y.Y.Y.Y.Y.#', '#.............#', '#.Y.Y.Y.Y.Y.Y.#', '#.............#', '#######D#######']],
        ['text', 14, 40, ['#############', '#...........#', '#..v....v...#', '#...........#', '#...........#', '#..v....v...#', '#...........#', '#####:::#####']],
        ['text', 44, 13, ['############', '#H.H.H.H.H.#', '#..........#', '#..........D', '#..T..H.H..#', '#..........#', '############']],
        ['text', 28, 26, ['##############', '#............#', '#..T......T..#', '#............#', '#......K.....#', '#............#', '#..T......T..#', '#............#', '######RR######']],
        // the gate, and the postern
        // (Rhys: "there seems to be no actual door INTO Fort Kerreth") the gate: a pair of gates in the
        // wall's outer face (they open), the passage through the wall behind them; and a postern in the east wall
        ['cell', 34, 54, '_'], ['cell', 35, 54, '_'], ['cell', 34, 55, 'D'], ['cell', 35, 55, 'D'],
        ['cell', 60, 30, '_'], ['cell', 61, 30, 'L'],
        // the culvert: under the west wall, crawl height
        ['room', 2, 46, 11, 46, 'u'], ['room', 2, 45, 11, 45, '#'], ['room', 2, 47, 11, 47, '#'],
        // cover in the yard, the hill outside
        ['cells', [[24, 22], [25, 22], [40, 22], [41, 22], [22, 34], [46, 34], [47, 34], [36, 40], [50, 44], [51, 44], [30, 48], [44, 49]], 'C'],
        ['cells', [[26, 36], [42, 38]], 'B'],
        ['cells', [[3, 30], [5, 20], [4, 58], [20, 60], [30, 2], [45, 3], [60, 60], [66, 30], [66, 44], [2, 6], [52, 61]], 'r'],
      ], after: [] },
    },
    1: {
      y: 5.2, wallH: 2.6, roof: false, lamps: false, wall: 'concrete2', floor: 'concrete', floorTint: [0.75, 0.72, 0.66],
      carve: { size: [W, H], walls: false, ops: [
        ['cells', walk, '.'], ['room', 6, 6, 12, 12, '.'], ['room', 57, 6, 63, 12, '.'], ['room', 6, 51, 12, 57, '.'], ['room', 57, 51, 63, 57, '.'],
        ['cells', parapet, '='],
        ['room', 6, 6, 12, 6, '='], ['room', 6, 6, 6, 12, '='], ['room', 57, 6, 63, 6, '='], ['room', 63, 6, 63, 12, '='],
        ['room', 6, 57, 12, 57, '='], ['room', 6, 51, 6, 57, '='], ['room', 57, 57, 63, 57, '='], ['room', 63, 51, 63, 57, '='],
      ] },
    },
  },
  ladders: [
    { x: 10, y: 15, from: 'G', to: '1', back: [-1, 0], off: [11, 15] }, { x: 59, y: 15, from: 'G', to: '1', back: [1, 0], off: [58, 15] },
    { x: 10, y: 48, from: 'G', to: '1', back: [-1, 0], off: [11, 48] }, { x: 59, y: 48, from: 'G', to: '1', back: [1, 0], off: [58, 48] },
  ],
  start: { x: 34, y: 70, floor: 'G', yaw: 0, van: [-4, 2] },
  extra(kit) {
    const { box, mid } = kit;
    // the heavy guns' mounts and their sandbags, on the north-west and north-east towers
    for (const [x, y] of [[9, 9], [60, 9]]) {
      box([mid(x) - 0.3, 5.2, mid(y) - 0.3], [mid(x) + 0.3, 6.1, mid(y) + 0.3], 'metal', { tint: [0.25, 0.27, 0.28] });
      box([mid(x) - 0.12, 6.0, mid(y) - 1.4], [mid(x) + 0.12, 6.25, mid(y)], 'metal', { solid: false, tint: [0.2, 0.2, 0.22] });
    }
    // the culvert's mouth, a grating outside the wall
    box([mid(2) - 0.7, 0, mid(46) - 0.8], [mid(2) - 0.6, 0.75, mid(46) + 0.8], 'grating', { solid: false });
  },
  zones: [
    { id: 'yard', label: 'Fort Kerreth - the yard', at: [10, 10, 59, 53] },
    { id: 'barracks', label: 'Fort Kerreth - the barracks', at: [14, 13, 28, 18] },
    { id: 'motor', label: 'Fort Kerreth - the motor pool', at: [14, 40, 26, 47] },
    { id: 'armoury', label: 'Fort Kerreth - the armoury', at: [44, 13, 55, 19] },
    { id: 'bunker', label: 'Fort Kerreth - the command bunker', at: [28, 26, 41, 34] },
    { id: 'walls', label: 'Fort Kerreth - the wall-walk', at: [6, 6, 63, 57], floor: '1' },
    { id: 'culvert', label: 'Fort Kerreth - the culvert', at: [2, 45, 13, 47] },
  ],
  guards: [
    { id: 'f1', at: [9, 9, '1'], arms: 'hmg', rank: 'sergeant', temper: 'steady' },
    { id: 'f2', at: [60, 9, '1'], arms: 'hmg', rank: 'sergeant', temper: 'steady' },
    { id: 'f3', at: [34, 52, '1'], arms: 'lmg', temper: 'steady' },
    { id: 'f4', at: [11, 30, '1'], route: [[11, 13], [11, 50]], arms: 'lmg' },
    { id: 'f5', at: [58, 30, '1'], route: [[58, 50], [58, 13]], arms: 'rocket', temper: 'steady' },
    { id: 'f6', at: [45, 53, '1'], arms: 'rocket', temper: 'steady' },
    { id: 'f7', at: [25, 10, '1'], route: [[13, 10], [56, 10]], arms: 'carbine' },
    { id: 'f8', at: [32, 51, 'G'], arms: 'lmg', temper: 'steady' },
    { id: 'f9', at: [37, 51, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'f10', at: [30, 22, 'G'], route: [[15, 22], [54, 22], [54, 37], [15, 37]], arms: 'smg' },
    { id: 'f11', at: [20, 15, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'f12', at: [24, 16, 'G'], arms: 'carbine' },
    { id: 'f13', at: [20, 43, 'G'], arms: 'smg' },
    { id: 'f14', at: [48, 16, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'f15', at: [32, 29, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'brask', at: [37, 30, 'G'], arms: 'revolver', rank: 'officer', temper: 'steady', name: 'Commander Brask' },
    { id: 'f17', at: [34, 60, 'G'], route: [[20, 60], [50, 60]], arms: 'carbine' },
    { id: 'f18', at: [50, 46, 'G'], arms: 'lmg' },
  ],
  pickups: [{ id: 'keys', name: 'The launch keys', what: 'the keys', at: [35, 30, 'G'], table: false, h: 1.12, colour: [0.95, 0.8, 0.2] }],
  terminals: [{ id: 'signals', name: 'the signals terminal', at: [48, 17, 'G'], face: [0, 1], time: 6, reveal: 35,
    said: 'Signals terminal: the fort\'s radio is down, and the guard rota puts every red on your radar for 35 seconds.' }],
  // (M6.71) papers to read: lore, not needed to finish
  intel: [
    { id: 'roll', at: [31, 28, 'G'], h: 0.78, kind: 'Roll', title: 'The yard\'s roll call', text: ['Every name answered but two, both marked "gone over the wall". Commander Brask has written beside them: "Find them."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'keys', text: 'Take the launch keys (the command bunker)' },
    { id: 'o2', kind: 'hack', ref: 'signals', text: 'Hack the signals terminal (the armoury)', optional: true },
    { id: 'o3', kind: 'kill', ref: 'brask', text: 'Stop Commander Brask', optional: true },
  ],
};
