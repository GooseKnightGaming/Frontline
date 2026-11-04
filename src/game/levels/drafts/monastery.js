// FRONTLINE - Level 85, the Monastery (first draft, M6.107; the start of THE SAINTS). The Sexton's roster named every
// courier in Varnholm by a saint, and put a cross beside the ones the reds no longer trust. One of the crosses is
// "St Brannoc", who is Ghost's: an informant hiding with the brothers at Kelder Abbey. The reds got there first. Their
// raid holds the abbey tonight, and its commander is waiting for someone who can tell him which brother is Brannoc.
// Bring Brannoc out of the library before anyone does, and mark the raid's commander on the way.
const W = 46, H = 40;
export default {
  id: 'monastery', no: 85, title: 'Kelder Abbey', place: 'Kelder Abbey, in the hills above Varnholm',
  where: 'Kelder Abbey, in the hills above Varnholm. 03:10, rain, the reds\' trucks in the gatehouse yard.',
  brief: [
    ['The job', 'The Sexton\'s roster put a cross beside every courier the reds no longer trust. One of the crosses is <b>St Brannoc</b>, who is Ghost\'s: an informant hiding with the brothers at <b>Kelder Abbey</b>. The reds got there first. Their raid holds the abbey tonight, and they have Brannoc in the <b>library</b>, waiting for someone who can tell them who he is. <b>Bring Brannoc out</b>. <b>Mark the raid\'s commander</b>. If you can, <b>without the alarm</b>.'],
    ['The place', 'The <b>church</b> on the north side, the <b>library</b> west, the <b>refectory</b> east, where the reds keep the brothers, and the <b>dorter</b> south. The garth in the middle is open to the rain, and a lane runs into it from the hill path, past the library. The reds\' trucks and their console are in the <b>gatehouse</b>, south-east.'],
    ['Security', 'The reds brought a camera for the gatehouse yard, and a field alarm. Both are on the console in the gatehouse, with their radio and their engineer. The commander walks the garth. The brothers are not reds, and they will not fight anyone.'],
    ['Objectives', '<b>Bring Brannoc out</b> (the library). <b>Mark the commander</b> (the garth). If you can, <b>without the alarm</b>. Out the way you came, south-west.'],
  ],
  epilogue: {
    success: 'Brannoc walks down the hill in a borrowed habit, and the reds\' commander waits all night for a man who never comes. In the morning the raid leaves Kelder Abbey with nothing but a wet camera.',
    partial: 'Brannoc is out, but the abbey knows Ghost was there. The other saints with crosses will be harder to reach.',
  },
  time: { date: [3, 5, 2027], hour: 3, minute: 10 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'rain',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.16, 0.17, 0.2, 25, 160], ambient: [0.26, 0.27, 0.31] },
  extractName: 'the hill path, south-west', extract: { x: 4, y: 38, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 4.2, wall: 'concrete2', wallTint: [0.7, 0.68, 0.6], floor: 'tile', ceil: 'wood', lampPower: 0.5, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 10, 4, 34, 9],                         // the church
        ['room', 4, 12, 10, 24],                        // the library
        ['room', 34, 12, 40, 26],                       // the refectory
        ['room', 12, 30, 32, 34],                       // the dorter
        ['room', 36, 30, 42, 34],                       // the gatehouse
      ], after: [
        ['cells', [[22, 10], [11, 19], [33, 19], [22, 29], [39, 35]], 'D'],
        ['cells', [[16, 3], [28, 3], [3, 16], [3, 21], [41, 16], [41, 22], [16, 35], [28, 35]], 'W'],
        // the church's altar and pews, the library's presses, the refectory's long tables, the dorter's beds
        ['cells', [[22, 5]], 'M'], ['room', 14, 7, 18, 7, 'Y'], ['room', 26, 7, 30, 7, 'Y'],
        ['room', 5, 13, 5, 18, 'H'], ['room', 9, 20, 9, 23, 'H'], ['cells', [[7, 16]], 'T'],
        ['room', 37, 14, 37, 20, 'T'], ['cells', [[39, 24]], 'T'],
        ['cells', [[14, 32], [18, 32], [26, 32], [30, 32]], 'Y'],
        ['cells', [[38, 31]], 'T'], ['cells', [[41, 33]], 'M'],
        // the garth's well, the trucks in the gatehouse yard
        ['cells', [[22, 20]], 'M'], ['cells', [[38, 37], [42, 37]], 'C'],
        ['cells', [[6, 6], [40, 6], [2, 32], [44, 28]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { level, mid } = kit;
    for (const [x, y] of [[22, 11], [12, 28], [32, 28], [39, 36]]) level.lights.push({ pos: [mid(x), 3.5, mid(y)], range: 10, intensity: 0.7, color: [1, 0.85, 0.6], street: true });
  },
  start: { x: 4, y: 37, floor: 'G', yaw: 0 },
  zones: [
    { id: 'church', label: 'Kelder Abbey - the church', at: [10, 4, 34, 9] },
    { id: 'lib', label: 'Kelder Abbey - the library', at: [4, 12, 10, 24] },
    { id: 'refec', label: 'Kelder Abbey - the refectory', at: [34, 12, 40, 26] },
    { id: 'dorter', label: 'Kelder Abbey - the dorter', at: [12, 30, 32, 34] },
    { id: 'gate', label: 'Kelder Abbey - the gatehouse', at: [36, 30, 42, 34] },
    { id: 'garth', label: 'Kelder Abbey - the garth', at: [12, 12, 32, 27] },
    { id: 'abbey', label: 'Kelder Abbey', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'cmdr', at: [24, 18, 'G'], route: [[16, 18], [28, 18]], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The raid\'s commander', tint: [0.3, 0.28, 0.26] },
    { id: 'b1', at: [7, 14, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'r1', at: [35, 15, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'r2', at: [39, 21, 'G'], arms: 'carbine' },
    { id: 'g1', at: [20, 25, 'G'], route: [[14, 25], [30, 25]], arms: 'carbine' },
    { id: 'c1', at: [30, 6, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'd1', at: [22, 33, 'G'], route: [[14, 33], [30, 33]], arms: 'pistol' },
    { id: 'rad', at: [40, 32, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [37, 33, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'yd', at: [40, 37, 'G'], route: [[34, 37], [44, 37]], arms: 'carbine', dog: true },
  ],
  civilians: [
    { id: 'abbot', at: [36, 18, 'G'], yaw: -Math.PI / 2, title: 'The abbot', tint: [0.5, 0.42, 0.35], says: ['They want to know which of us is not one of us. I have told them that we are all sinners, and none of us is anyone else.'] },
    { id: 'monk', at: [38, 23, 'G'], yaw: Math.PI / 2, title: 'A young brother', tint: [0.5, 0.42, 0.35], says: ['Brother Bran was in the library when they came. He always is, at night.'] },
  ],
  hostages: [{ id: 'brannoc', name: 'Brannoc', at: [6, 23, 'G'] }],
  devices: [
    { id: 'c-yard', kind: 'camera', at: [35, 35, 'G'], face: [-1, 1], net: 'raid' },
    { id: 'a-raid', kind: 'alarm', at: [43, 32, 'G'], face: [1, 0], net: 'raid' },
  ],
  terminals: [{ id: 'sec', name: 'the raid\'s console', at: [38, 31, 'G'], face: [0, 1], time: 6, net: 'raid' }],
  intel: [
    { id: 'order', at: [39, 24, 'G'], kind: 'Orders', title: 'The raid\'s orders', text: ['Hold the abbey until the identifier arrives from Varnholm. Nobody leaves. Nobody is to be harmed until he is named.'] },
    { id: 'press', at: [7, 16, 'G'], kind: 'Book', title: 'A psalter in the library', text: ['Between the psalms, in pencil, a list of saints. Some of the names have crosses. Brannoc\'s is the last, and it is the newest.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'rescue', ref: 'brannoc', text: 'Bring Brannoc out (the library)' },
    { id: 'o2', kind: 'identify', refs: ['cmdr'], text: 'Mark the raid\'s commander (the garth)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
