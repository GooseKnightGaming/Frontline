// FRONTLINE - Level 90, the Kiln Road Garage (first draft, M6.112; the end of THE WARNING). The paymaster's
// switchboard calls went to a garage on the Kiln Road, where Ghost keeps the lorries that carry its people out. The
// driver's ledger entries say the reds have it tonight: they are in there now, copying the lorries' route book and
// marking every lorry for the roadblocks. Clear the reds out of the garage, and take the route book back before they
// can send it on.
const W = 44, H = 32;
export default {
  id: 'garage', no: 90, title: 'The Kiln Road Garage', place: 'the garage on the Kiln Road, Varnholm',
  where: 'The garage on the Kiln Road, Varnholm. 01:50, Ghost\'s lorries in the workshop, the reds\' car in the yard.',
  brief: [
    ['The job', 'The paymaster\'s calls went to a <b>garage on the Kiln Road</b>, where Ghost keeps the lorries that carry its people out. The ledger says the reds have it tonight. They are in there now, copying the lorries\' <b>route book</b> and marking every lorry for the roadblocks. <b>Clear the reds out of the garage</b>. Take the <b>route book</b> back before they can send it on.'],
    ['The place', 'The <b>workshop</b> with Ghost\'s lorries in it, the <b>office</b> on its east side where the route book is kept, and the store behind the office. The yard is south, with the gate east. You come in over the back wall, south-west.'],
    ['Security', 'None of the garage\'s own: Ghost keeps it quiet. There are eight reds inside and in the yard, with an officer in the office. They have no alarm here and no radio. If one of them gets away, the route book is as good as gone.'],
    ['Objectives', '<b>Clear the reds out</b> (all of them). Take the <b>route book</b> (the office). Out over the back wall, south-west.'],
  ],
  epilogue: {
    success: 'Ghost\'s lorries leave the Kiln Road the next night by roads the reds have never seen. The route book is rewritten from the first page, and the warning gets through: the saints, and everyone after them.',
    partial: 'The route book came back, but someone got away with what was in it. Every road in it is closed to Ghost now.',
  },
  time: { date: [9, 5, 2027], hour: 1, minute: 50 }, night: true, faction: 'red',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.14, 0.14, 0.17, 25, 160], ambient: [0.26, 0.26, 0.3] },
  extractName: 'the back wall, south-west', extract: { x: 1, y: 30, floor: 'G', van: [1, -5] },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 4.5, wall: 'concrete2', wallTint: [0.6, 0.6, 0.58], floor: 'concrete', ceil: 'metal', lampPower: 0.6, lampColour: [1, 0.9, 0.75], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 8, 8, 26, 20],                         // the workshop
        ['room', 28, 8, 34, 14],                        // the office
        ['room', 28, 16, 34, 20],                       // the store
      ], after: [
        ['cells', [[17, 21], [18, 21], [27, 11], [27, 18], [31, 21]], 'D'],
        ['cells', [[12, 7], [22, 7], [7, 14], [31, 7], [35, 11], [35, 18]], 'W'],
        // the workshop's benches and pit, the office's desk, the store's shelves
        ['room', 9, 9, 13, 9, 'T'], ['cells', [[25, 19]], 'M'],
        ['cells', [[30, 9]], 'T'], ['cells', [[33, 13]], 'H'],
        ['room', 33, 17, 33, 19, 'H'], ['cells', [[29, 19]], 'C'],
        // the yard: oil drums, tyres, the reds' car's corner
        ['cells', [[10, 25], [24, 27], [32, 24], [38, 29], [6, 22], [40, 22]], 'B'],
      ] },
    },
  },
  extra(kit) {
    const { level, mid } = kit;
    for (const [x, y] of [[17, 23], [31, 23], [41, 26]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 11, intensity: 0.75, color: [1, 0.9, 0.75], street: true });
  },
  vehicles: [
    { id: 'lorryA', kind: 'car', model: 'lightUtility', paint: 'olive', at: [13, 15], yaw: 0, hp: 560 },
    { id: 'lorryB', kind: 'car', model: 'lightUtility', paint: 'grey', at: [20, 15], yaw: 0, hp: 560 },
    { id: 'redcar', kind: 'car', model: 'lightUtility', paint: 'black', at: [36, 27], yaw: Math.PI / 2, hp: 560 },
  ],
  start: { x: 2, y: 29, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'shop', label: 'The garage - the workshop', at: [8, 8, 26, 20] },
    { id: 'office', label: 'The garage - the office', at: [28, 8, 34, 14] },
    { id: 'store', label: 'The garage - the store', at: [28, 16, 34, 20] },
    { id: 'kiln', label: 'The Kiln Road', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'off', at: [31, 11, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The officer copying the route book' },
    { id: 'st1', at: [31, 18, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'w1', at: [11, 11, 'G'], arms: 'smg' },
    { id: 'w2', at: [17, 18, 'G'], route: [[10, 18], [24, 18]], arms: 'carbine' },
    { id: 'w3', at: [23, 11, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'y1', at: [24, 24, 'G'], route: [[12, 24], [38, 24]], arms: 'carbine' },
    { id: 'y2', at: [40, 27, 'G'], arms: 'carbine', temper: 'steady', yaw: -Math.PI / 2 },
    { id: 'y3', at: [34, 29, 'G'], arms: 'smg', temper: 'bold' },
  ],
  pickups: [{ id: 'book', name: 'The route book', what: 'the route book', at: [30, 9, 'G'], table: true, colour: [0.2, 0.3, 0.2] }],
  intel: [
    { id: 'marks', at: [12, 9, 'G'], kind: 'Chalk', title: 'Chalk on the workshop bench', text: ['The lorries\' numbers, and beside each one the name of a roadblock. Somebody has been here before tonight.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'clear', text: 'Clear the reds out of the garage' },
    { id: 'o2', kind: 'take', ref: 'book', text: 'Take the route book (the office)' },
  ],
};
