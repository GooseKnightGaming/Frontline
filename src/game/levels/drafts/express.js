// FRONTLINE - Level 86, the Night Express (first draft, M6.108; THE SAINTS, second). The man the raid at Kelder Abbey
// was waiting for - the "identifier", who knows the saints' faces - is going north on the night express with his
// album of photographs, to walk the train with the customs men at the frontier halt and point out St Corin, who is in
// the next carriage but one. Go aboard at the halt in a customs officer's coat. Take the identifier alive, and take his
// album, before the train moves on.
const W = 92, H = 20;
export default {
  id: 'express', no: 86, title: 'The Night Express', place: 'the frontier halt at Ostrava Gap',
  where: 'The frontier halt at Ostrava Gap. 02:40, the night express stopped for the customs check, steam in the lamplight.',
  brief: [
    ['The job', 'The man the raid at Kelder Abbey was waiting for, the <b>identifier</b>, is on the <b>night express</b> going north, with an <b>album of photographs</b>. At the frontier halt he will walk the train with the customs men and point out <b>St Corin</b>, who is two carriages behind him. Go aboard at the halt. <b>Take the identifier alive</b>. Take his <b>album</b>. If you can, <b>without the alarm</b>, and before the train moves on.'],
    ['The place', 'Six carriages along the platform. From the west: the <b>guard\'s van</b>, the dining car, three sleeping cars, and the baggage car. The <b>identifier\'s compartment</b> is in the third sleeping car. The customs hut is on the far side of the platform. You go aboard in a <b>customs officer\'s coat</b>. There are a dozen of them on the platform tonight.'],
    ['Security', 'A camera on the platform, the customs hut\'s alarm. The console, the radio and the engineer are in the <b>guard\'s van</b>. The identifier keeps an escort, and the reds have a man in every carriage.'],
    ['Objectives', '<b>Take the identifier alive</b> (the third sleeping car). Take the <b>album</b> (his compartment). If you can, <b>without the alarm</b>. Off the train and away along the platform, west.'],
  ],
  epilogue: {
    success: 'The night express goes north twenty minutes late with one customs officer fewer and one passenger more asleep than he should be. St Corin wakes at the other end of the line with nobody waiting for him, and the album full of saints\' faces is on Ghost\'s desk by morning.',
    partial: 'The identifier or his album, not both. Somewhere north of the gap, someone still knows St Corin\'s face.',
  },
  time: { date: [5, 5, 2027], hour: 2, minute: 40 }, night: true, faction: 'red', requires: 'HACKKIT', startDisguise: 'red',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.14, 0.15, 0.18, 22, 150], ambient: [0.25, 0.25, 0.3] },
  extractName: 'the platform, west', extract: { x: 1, y: 12, floor: 'G', van: [1, 5] },
  outside: { backdrop: 'hills', mat: 'concrete', margin: 12 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'metal', wallTint: [0.3, 0.38, 0.32], floor: 'carpet', ceil: 'wood', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 4, 4, 13, 8],                          // the guard's van
        ['room', 15, 4, 28, 8],                         // the dining car
        ['room', 30, 4, 43, 8],                         // the first sleeping car
        ['room', 45, 4, 58, 8],                         // the second sleeping car
        ['room', 60, 4, 73, 8],                         // the third sleeping car
        ['room', 75, 4, 86, 8],                         // the baggage car
        ['room', 40, 16, 50, 18],                       // the customs hut
      ], after: [
        // the gangways between the carriages, the doors to the platform, the hut's door
        ['cells', [[14, 6], [29, 6], [44, 6], [59, 6], [74, 6]], 'D'],
        ['cells', [[8, 9], [22, 9], [37, 9], [52, 9], [67, 9], [80, 9], [45, 15]], 'D'],
        ['cells', [[18, 9], [26, 9], [33, 9], [41, 9], [48, 9], [56, 9], [63, 9], [71, 9], [18, 3], [26, 3], [37, 3], [52, 3], [67, 3]], 'W'],
        // the van's console and stove, the dining car's tables, the sleeping cars' berths, the baggage
        ['cells', [[5, 5]], 'T'], ['cells', [[12, 5]], 'M'],
        ['cells', [[17, 4], [20, 4], [23, 4], [26, 4]], 'T'],
        ['cells', [[31, 4], [34, 4], [38, 4], [42, 4], [46, 4], [49, 4], [53, 4], [57, 4], [61, 4], [64, 4], [68, 4]], 'Y'],
        ['cells', [[70, 4]], 'T'],
        ['cells', [[77, 4], [79, 5], [83, 4], [85, 7]], 'C'],
        ['cells', [[42, 17]], 'T'], ['cells', [[49, 17]], 'M'],
        ['cells', [[20, 17], [60, 17], [84, 16], [6, 17]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the carriages' roofs and the rails under them
    box([3 * C, 3, 3 * C], [88 * C, 3.4, 10 * C], 'metal', { tint: [0.22, 0.28, 0.24] });
    for (const z of [3.4, 9.6]) box([0, 0, z * C], [W * C, 0.12, z * C + 0.15], 'metal', { tint: [0.4, 0.4, 0.42], solid: false });
    for (const x of [6, 22, 38, 54, 70, 86]) level.lights.push({ pos: [mid(x), 3.6, mid(13)], range: 10, intensity: 0.8, color: [1, 0.85, 0.6], street: true });
  },
  start: { x: 1, y: 13, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'van', label: 'The Night Express - the guard\'s van', at: [4, 4, 13, 8] },
    { id: 'dining', label: 'The Night Express - the dining car', at: [15, 4, 28, 8] },
    { id: 'sl1', label: 'The Night Express - the first sleeping car', at: [30, 4, 43, 8] },
    { id: 'sl2', label: 'The Night Express - the second sleeping car', at: [45, 4, 58, 8] },
    { id: 'sl3', label: 'The Night Express - the third sleeping car', at: [60, 4, 73, 8] },
    { id: 'bag', label: 'The Night Express - the baggage car', at: [75, 4, 86, 8] },
    { id: 'hut', label: 'Ostrava Gap - the customs hut', at: [40, 16, 50, 18] },
    { id: 'halt', label: 'Ostrava Gap', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'ident', at: [66, 6, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The identifier', tint: [0.32, 0.3, 0.28] },
    { id: 'esc', at: [69, 7, 'G'], arms: 'smg', temper: 'steady' },
    { id: 's2', at: [50, 8, 'G'], route: [[46, 8], [57, 8]], arms: 'pistol' },
    { id: 's1', at: [36, 7, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'd1', at: [21, 6, 'G'], arms: 'carbine' },
    { id: 'rad', at: [7, 6, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [11, 7, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'bg', at: [81, 6, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'p1', at: [40, 12, 'G'], route: [[12, 12], [84, 12]], arms: 'carbine' },
    { id: 'h1', at: [46, 17, 'G'], arms: 'pistol', rank: 'specialist', temper: 'steady' },
  ],
  civilians: [
    { id: 'corin', at: [55, 5, 'G'], yaw: Math.PI, title: 'A passenger who cannot sleep', tint: [0.6, 0.55, 0.5], says: ['Customs again? They have been up and down this train twice. I am going to my sister\'s. I am always going to my sister\'s.'] },
    { id: 'cond', at: [25, 7, 'G'], yaw: Math.PI / 2, title: 'The dining car attendant', tint: [1.0, 1.0, 1.05], says: ['The gentleman in the third sleeper ordered tea for two and drank both. He has been looking at photographs all night.'] },
    { id: 'pass', at: [33, 7, 'G'], yaw: -Math.PI / 2, title: 'A sleepy commercial traveller', tint: [0.8, 0.7, 0.6], says: ['Twenty minutes, they said. It is always forty.'] },
  ],
  pickups: [{ id: 'album', name: 'The identifier\'s album', what: 'the album', at: [70, 4, 'G'], table: true, colour: [0.45, 0.25, 0.2] }],
  devices: [
    { id: 'c-plat', kind: 'camera', at: [39, 15, 'G'], face: [-1, -1], net: 'gap' },
    { id: 'a-gap', kind: 'alarm', at: [51, 17, 'G'], face: [1, 0], net: 'gap' },
  ],
  terminals: [{ id: 'sec', name: 'the guard\'s van console', at: [5, 5, 'G'], face: [0, 1], time: 6, net: 'gap' }],
  intel: [
    { id: 'manifest', at: [42, 17, 'G'], kind: 'Manifest', title: 'The customs manifest', text: ['Every passenger on the express, and against one name in the second sleeping car, in pencil: "the identifier to confirm".'] },
    { id: 'ticket', at: [17, 4, 'G'], kind: 'Ticket', title: 'A ticket left on a dining table', text: ['Varnholm to the north, first class, one way. On the back: "Kelder - nothing. Corin on the express."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'capture', ref: 'ident', text: 'Take the identifier alive (the third sleeping car)' },
    { id: 'o2', kind: 'take', ref: 'album', text: 'Take the album (his compartment)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
