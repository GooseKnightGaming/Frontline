// FRONTLINE - Level 50, the Villa Merrow (first draft, M6.56): the end of the Codex. Marle gave Ghost the name: Count
// Aurel Merrow, who collects what is not his to collect, and who paid the reds in grain and blight for a book they had
// stolen to sell him. His villa on the lake, a summer party in winter - the lake frozen at its edges, the lanterns lit,
// half the city's money on the terrace. Go in as one of the reds' officers; come out with proof of the sale.
const W = 50, H = 40;
export default {
  id: 'villa', no: 50, title: 'The Villa Merrow', place: 'the Villa Merrow, on the lake',
  where: 'The Villa Merrow, on the lake. 20:30, the Count\'s winter party on the terrace.',
  brief: [
    ['The man', '<b>Count Aurel Merrow</b> bought the Halvard Codex from the reds - and paid for it with what bought the blight. Tonight he gives a party. Ghost wants the <b>bill of sale</b> from his study\'s safe, and the <b>catalogue</b> of everything else he has bought this way. What becomes of the Count is up to you.'],
    ['The way in', 'In a red officer\'s uniform, by the front gate, with the other guests - <b>disguised</b>. From a way off they take you for one of the reds\' own; close to, they look twice (an officer, from further). Walk; do not run, crouch or fire.'],
    ['The place', 'Ground floor: the <b>hall</b>, the <b>salon</b> and the <b>terrace</b> (the party, on the lake side - south), the kitchen (west). Upstairs: the <b>gallery</b> (his collection), the Count\'s <b>study</b> (east - maglocked; his keycard), the bedrooms. The <b>boathouse</b> on the lake shore, west.'],
    ['Security', 'Cameras in the hall and the gallery (and a pinhole in the study - EMF), the study\'s maglock, a laser across the gallery, the alarm - from the gatehouse. His own guards and the reds\' officers among the guests; a dog in the grounds.'],
    ['Objectives', 'Copy the <b>bill of sale</b> (the study\'s safe). Take the <b>catalogue</b> (the gallery). Optionally, stop the Count. Out by the front gate.'],
  ],
  epilogue: {
    success: 'The bill of sale reaches the neighbour\'s embassy by morning; the catalogue, three more. The Codex goes home under guard. Of the Count\'s collection, nine pieces in ten were never his - and by spring none of them are. Returned.',
    partial: 'The Codex is safe, and the Count knows he has been found out. But his catalogue - or his bill of sale - is still in the villa, and a man with that much money can still make things go away.',
  },
  time: { date: [11, 1, 2027], hour: 20, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT', startDisguise: 'red', weather: 'snow',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'RCAM', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.3, 0.34, 0.42, 30, 220], ambient: [0.34, 0.36, 0.44] },
  extractName: 'the front gate', extract: { x: 25, y: 1, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 4.2, wall: 'plaster', wallTint: [0.95, 0.9, 0.82], floor: 'marble', ceil: 'plaster', lampPower: 0.95, lampColour: [1, 0.85, 0.6], lampEvery: 7,
      carve: { size: [W, H], ops: [
        ['room', 18, 10, 32, 18],                       // the hall
        ['room', 18, 20, 32, 26],                       // the salon
        ['room', 8, 10, 16, 18],                        // the kitchen
        ['room', 34, 10, 42, 18],                       // the library
        ['room', 3, 4, 7, 7],                           // the gatehouse (by the gate, west of the drive)
      ], after: [
        ['cells', [[24, 9], [25, 9], [17, 14], [33, 14], [24, 19], [25, 19], [24, 27], [25, 27], [12, 19], [5, 8]], 'D'],
        ['cells', [[20, 9], [29, 9], [17, 22], [33, 22], [20, 27], [29, 27], [12, 9], [38, 9], [43, 14], [7, 14]], 'W'],
        ['cells', [[20, 12], [29, 12], [20, 16], [29, 16]], 'P'], ['cells', [[24, 13]], 'T'],
        ['cells', [[20, 22], [23, 24], [27, 22], [30, 24]], 'Z'], ['room', 21, 25, 29, 25, 'K'],
        ['room', 9, 11, 15, 11, 'K'], ['cells', [[10, 15], [14, 15]], 'T'],
        ['cells', [[35, 11], [37, 11], [39, 11], [41, 11], [35, 17], [37, 17], [39, 17], [41, 17]], 'H'], ['cells', [[38, 14]], 'T'],
        ['cells', [[4, 5]], 'M'],
        // the terrace (south, open, to the lake's edge): its balustrade; lanterns in extra; the lake below it
        ['room', 16, 28, 34, 28, '.'], ['room', 16, 31, 34, 31, '='], ['cells', [[16, 29], [16, 30], [34, 29], [34, 30]], '='],
        ['room', 0, 33, W - 1, H - 1, '~'], ['room', 4, 30, 9, 33, '.'],                         // the lake; the boathouse's slip
        ['cells', [[2, 12], [2, 22], [46, 6], [46, 24], [12, 3], [38, 3], [12, 26], [40, 28]], 't'],
        ['room', 0, 2, 22, 2, 'f'], ['room', 28, 2, W - 1, 2, 'f'],                             // the railings along the road, the gate between
        ['cells', [[30, 5], [34, 5], [38, 5]], 'v'],                                           // the guests' cars
      ] },
    },
    1: {
      y: 4.4, wallH: 3.4, wall: 'plaster', wallTint: [0.95, 0.9, 0.82], floor: 'wood', floorTint: [0.5, 0.36, 0.25], ceil: 'plaster', lampPower: 0.8, lampColour: [1, 0.85, 0.6], lampEvery: 7,
      carve: { size: [W, H], ops: [
        ['room', 18, 10, 32, 18],                       // the gallery
        ['room', 8, 10, 16, 18],                        // the bedrooms
        ['room', 34, 10, 42, 18],                       // the study
      ], after: [
        ['cells', [[17, 14], [33, 14]], 'D'],
        ['room', 8, 14, 16, 14, '#'], ['cell', 12, 14, 'D'],
        ['cells', [[20, 9], [29, 9], [20, 19], [29, 19], [7, 12], [43, 12], [43, 16]], 'W'],
        ['cells', [[20, 12], [24, 12], [28, 12], [20, 16], [24, 16], [28, 16]], 'c'],
        ['cells', [[10, 11], [10, 17]], 'Y'], ['cells', [[15, 11]], 'H'],
        ['cells', [[38, 12]], 'T'], ['cells', [[41, 17]], 'Z'], ['cells', [[35, 11], [36, 11]], 'H'],
      ] },
    },
  },
  legend: {
    // a case in the Count's gallery: a stand, and glass that breaks (kit.pane)
    c(k, x, y, f) {
      const [cx, cy, cz] = k.at(x, y, f);
      k.box([cx - 0.45, cy, cz - 0.45], [cx + 0.45, cy + 0.9, cz + 0.45], 'wood', { tint: [0.3, 0.2, 0.14] });
      k.pane([cx - 0.4, cy + 0.9, cz - 0.4], [cx + 0.4, cy + 1.6, cz + 0.4], 0);
    },
  },
  stairs: [{ x: 31, y: 17, dir: 'N', len: 5, w: 1, from: 'G', to: '1' }],       // the hall's stair (its east side)
  start: { x: 25, y: 0, floor: 'G', yaw: Math.PI },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the terrace's lanterns, the boathouse
    for (const x of [18, 22, 27, 32]) { box([mid(x) - 0.06, 0, mid(30) - 0.06], [mid(x) + 0.06, 2.2, mid(30) + 0.06], 'metal', { tint: [0.2, 0.2, 0.2] }); level.lights.push({ pos: [mid(x), 2.1, mid(30)], range: 8, intensity: 0.9, color: [1, 0.75, 0.45], street: true }); }
    box([3.5 * C, 0, 29.5 * C], [9.5 * C, 3.2, 29.9 * C], 'wood', { tint: [0.4, 0.3, 0.22] });
    box([3.5 * C, 3.2, 29.5 * C], [9.5 * C, 3.4, 34 * C], 'wood', { tint: [0.35, 0.25, 0.2], solid: false });
    level.signs.push({ pos: [mid(25), 3.2, 2 * C + C + 0.14], yaw: 0, w: 3.6, h: 0.6, text: 'VILLA MERROW', sub: 'Private', col: '#2a2a20' });
  },
  zones: [
    { id: 'hall', label: 'Villa Merrow - the hall', at: [18, 10, 32, 18] },
    { id: 'salon', label: 'Villa Merrow - the salon', at: [18, 20, 32, 26] },
    { id: 'kitchen', label: 'Villa Merrow - the kitchen', at: [8, 10, 16, 18] },
    { id: 'library', label: 'Villa Merrow - the library', at: [34, 10, 42, 18] },
    { id: 'terrace', label: 'Villa Merrow - the terrace', at: [16, 28, 34, 31] },
    { id: 'gate', label: 'Villa Merrow - the gatehouse', at: [3, 4, 7, 7] },
    { id: 'gallery', label: 'Villa Merrow - the gallery', at: [18, 10, 32, 18], floor: '1' },
    { id: 'study', label: 'Villa Merrow - the Count\'s study', at: [34, 10, 42, 18], floor: '1' },
    { id: 'beds', label: 'Villa Merrow - the bedrooms', at: [8, 10, 16, 18], floor: '1' },
    { id: 'lake', label: 'The lake', at: [0, 32, W - 1, H - 1] },
    { id: 'grounds', label: 'Villa Merrow - the grounds', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'count', at: [25, 29, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Count Merrow', tint: [0.95, 0.95, 1.0], card: 'merrow' },
    { id: 'bg1', at: [23, 29, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'bg2', at: [28, 29, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'off1', at: [21, 23, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady' },
    { id: 'hall1', at: [27, 15, 'G'], route: [[19, 15], [30, 15]], arms: 'pistol' },
    { id: 'gal', at: [22, 14, '1'], route: [[19, 14], [30, 14]], arms: 'carbine', temper: 'steady' },
    { id: 'st', at: [32, 14, '1'], arms: 'carbine', rank: 'sergeant', temper: 'steady' },
    { id: 'gh', at: [5, 6, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [12, 16, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'gate', at: [22, 3, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'dg', at: [44, 20, 'G'], route: [[44, 8], [44, 30]], arms: 'carbine', dog: true },
  ],
  civilians: [
    { id: 'g1', at: [20, 29, 'G'], yaw: Math.PI, title: 'A guest', tint: [0.4, 0.35, 0.55], says: ['The Count has the most extraordinary things. I never ask where they come from.', 'Cold for a terrace party, isn\'t it? He insists.'] },
    { id: 'g2', at: [30, 29, 'G'], yaw: Math.PI, title: 'A guest', tint: [1.2, 0.85, 0.4], says: ['He showed us a book upstairs earlier - older than the city, he said. Then he locked it away.', 'Officer.'] },
    { id: 'g3', at: [25, 22, 'G'], yaw: 0, title: 'A guest', tint: [0.35, 0.45, 0.6], says: ['Have you seen the gallery? He takes people up one at a time.', 'They say the study is wired like a bank.'] },
    { id: 'wt', at: [22, 24, 'G'], yaw: Math.PI / 2, title: 'A waiter', tint: [1.35, 1.35, 1.35], says: ['Mulled wine, sir?', 'The Count\'s study? Upstairs, east side. He keeps the key on him.'] },
  ],
  pickups: [{ id: 'cat', name: 'The Count\'s catalogue', what: 'the catalogue', at: [24, 14, '1'], table: false, h: 0.9, colour: [0.55, 0.15, 0.2] }],
  devices: [
    { id: 'c-hall', kind: 'camera', at: [18, 10, 'G'], face: [1, 1], net: 'merrow' },
    { id: 'c-gal', kind: 'camera', at: [32, 18, '1'], face: [-1, -1], net: 'merrow' },
    { id: 'c-pin-st', kind: 'camera', at: [42, 18, '1'], face: [-1, -1], net: 'merrow', hidden: true },
    { id: 'z-gal', kind: 'laser', at: [26, 10, '1'], to: [26, 18], net: 'merrow' },
    { id: 'm-st', kind: 'lock', at: [33, 14, '1'], net: 'merrow' },
    { id: 'a-hall', kind: 'alarm', at: [32, 12, 'G'], face: [-1, 0], net: 'merrow' },
  ],
  terminals: [
    { id: 'gsec', name: 'the gatehouse\'s console', at: [4, 7, 'G'], face: [0, -1], time: 6, net: 'merrow' },
    { id: 'sale', name: 'the study\'s safe', at: [42, 14, '1'], face: [-1, 0], time: 10, reveal: 20, verb: 'Open and copy', doing: 'Copying',
      said: 'The bill of sale: the Halvard Codex, for grain and a "treatment" - signed by the Count and a man from the Ministry of Supply. Every red here on your radar for 20 seconds.' },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'sale', text: 'Copy the bill of sale (the Count\'s study, upstairs)' },
    { id: 'o2', kind: 'take', ref: 'cat', text: 'Take the catalogue (the gallery, upstairs)' },
    { id: 'o3', kind: 'kill', ref: 'count', text: 'Stop Count Merrow', optional: true },
  ],
};
