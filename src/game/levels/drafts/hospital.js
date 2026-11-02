// FRONTLINE - Level 49, St Brannoc's (first draft, M6.53): after the museum. The museum's loan register named the
// man who sold the Codex - and he has not lived to spend it: the night curator who signed it out, Tobias Marle, is
// in St Brannoc's under guard, "recovering" from a fall down the museum's stairs. He knows who bought it. Get him
// out before the men watching him decide he knows too much.
const W = 48, H = 34;
export default {
  id: 'hospital', no: 49, title: 'St Brannoc\'s', place: 'St Brannoc\'s Hospital',
  where: 'St Brannoc\'s Hospital, Varnholm. 03:50, the night shift, the wards dark.',
  brief: [
    ['The job', 'The night curator, <b>Tobias Marle</b>, signed the Halvard Codex out of the museum - and then "fell" down its stairs. He is in a side room on <b>Ward 4</b>, upstairs, with red guards on his door. He knows who bought the Codex. <b>Bring him out.</b> And take his <b>case notes</b> from the ward office: what they have been giving him.'],
    ['The place', 'In by the <b>ambulance bay</b> at the back (east). Ground floor: the bay, the corridor, <b>A&amp;E</b> (south), the <b>pharmacy</b> (north), the main stair. First floor: the long corridor, the <b>ward office</b>, Ward 4\'s bays and the <b>side rooms</b> at its west end.'],
    ['Security', 'Cameras in the corridors, a maglock on the side rooms (the guard sergeant\'s keycard), the alarm - from the porters\' office by the bay, where the reds have put their radio. They have a medic of their own with them.'],
    ['Objectives', '<b>Bring Tobias Marle out</b> (Ward 4\'s side rooms, upstairs). Take his <b>case notes</b> (the ward office). Out by the ambulance bay.'],
  ],
  time: { date: [9, 1, 2027], hour: 3, minute: 50 }, night: true, faction: 'red', requires: 'HACKKIT',
  extractName: 'the ambulance bay', extract: { x: 46, y: 16, floor: 'G' },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.4, wall: 'paint', wallTint: [0.85, 0.9, 0.88], floor: 'tile', floorTint: [0.7, 0.74, 0.72], ceil: 'plaster', lampPower: 0.6, lampColour: [0.85, 0.95, 1], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 4, 14, 42, 18],                        // the main corridor
        ['room', 4, 4, 18, 12],                         // the pharmacy
        ['room', 20, 4, 30, 12],                        // the main stair's hall
        ['room', 32, 4, 42, 12],                        // the porters' office
        ['room', 4, 20, 42, 30],                        // A&E
      ], after: [
        ['cells', [[43, 16], [43, 17], [11, 13], [25, 13], [37, 13], [10, 19], [24, 19], [36, 19]], 'D'],
        ['cells', [[3, 8], [3, 16], [3, 25], [10, 31], [24, 31], [36, 31], [10, 3], [36, 3]], 'W'],
        ['room', 6, 6, 6, 10, 'H'], ['room', 10, 6, 10, 10, 'H'], ['room', 14, 6, 14, 10, 'H'], ['room', 16, 11, 17, 11, 'K'],
        ['cells', [[35, 6], [39, 6]], 'T'], ['cells', [[34, 10]], 'Z'], ['cells', [[40, 10]], 'M'],
        ['cells', [[7, 22], [11, 22], [15, 22], [19, 22], [7, 28], [11, 28], [15, 28], [19, 28]], 'Y'],      // A&E's trolleys
        ['room', 26, 22, 32, 22, 'K'], ['cells', [[36, 24], [38, 28]], 'M'],
        ['cells', [[46, 12], [46, 22]], 'v'],                                                                  // ambulances in the bay
      ] },
    },
    1: {
      y: 3.6, wallH: 3.2, wall: 'paint', wallTint: [0.86, 0.9, 0.88], floor: 'tile', floorTint: [0.68, 0.72, 0.7], ceil: 'plaster', lampPower: 0.45, lampColour: [0.85, 0.95, 1], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 4, 14, 42, 18],                        // the long corridor
        ['room', 20, 4, 30, 12],                        // the stair's landing
        ['room', 32, 4, 42, 12],                        // the ward office
        ['room', 4, 4, 18, 12],                         // the side rooms (two)
        ['room', 4, 20, 42, 30],                        // Ward 4's bays
      ], after: [
        ['room', 11, 4, 11, 12, '#'], ['cell', 11, 8, 'D'],                                                // between the side rooms
        ['cells', [[8, 13], [25, 13], [37, 13], [10, 19], [24, 19], [36, 19]], 'D'],      // (the side rooms: one door, the west room's - maglocked)
        ['cells', [[3, 8], [3, 25], [10, 31], [24, 31], [36, 31], [43, 8], [43, 25]], 'W'],
        ['cells', [[6, 6], [14, 6]], 'Y'], ['cells', [[9, 10], [17, 10]], 'T'],
        ['cells', [[34, 6], [38, 6]], 'T'], ['cells', [[41, 10]], 'H'], ['cells', [[34, 11]], 'K'],
        ['cells', [[7, 22], [11, 22], [15, 22], [19, 22], [23, 22], [27, 22], [31, 22], [35, 22], [7, 28], [11, 28], [15, 28], [19, 28], [23, 28], [27, 28], [31, 28], [35, 28]], 'Y'],
      ] },
    },
  },
  stairs: [{ x: 22, y: 11, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  start: { x: 46, y: 18, floor: 'G', yaw: Math.PI / 2 },
  zones: [
    { id: 'corr', label: 'St Brannoc\'s - the main corridor', at: [4, 14, 42, 18] },
    { id: 'pharm', label: 'St Brannoc\'s - the pharmacy', at: [4, 4, 18, 12] },
    { id: 'stair', label: 'St Brannoc\'s - the main stair', at: [20, 4, 30, 12] },
    { id: 'porters', label: 'St Brannoc\'s - the porters\' office', at: [32, 4, 42, 12] },
    { id: 'ae', label: 'St Brannoc\'s - A&E', at: [4, 20, 42, 30] },
    { id: 'corr1', label: 'St Brannoc\'s - Ward 4\'s corridor', at: [4, 14, 42, 18], floor: '1' },
    { id: 'office', label: 'St Brannoc\'s - the ward office', at: [32, 4, 42, 12], floor: '1' },
    { id: 'side', label: 'St Brannoc\'s - the side rooms', at: [4, 4, 18, 12], floor: '1' },
    { id: 'ward', label: 'St Brannoc\'s - Ward 4', at: [4, 20, 42, 30], floor: '1' },
    { id: 'land', label: 'St Brannoc\'s - the first floor', at: [0, 0, W - 1, H - 1], floor: '1' },
    { id: 'bay', label: 'St Brannoc\'s - the ambulance bay', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'sgt', at: [16, 16, '1'], arms: 'smg', rank: 'sergeant', temper: 'steady', card: 'brannoc', name: 'The guard sergeant' },
    { id: 'door1', at: [9, 15, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'c1', at: [28, 16, '1'], route: [[19, 16], [41, 16]], arms: 'pistol' },
    { id: 'med', at: [36, 8, '1'], arms: 'pistol', temper: 'cowardly', role: 'medic' },
    { id: 'w4', at: [20, 25, '1'], route: [[6, 25], [40, 25]], arms: 'pistol', temper: 'cowardly' },
    { id: 'rad', at: [38, 8, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [8, 8, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'g1', at: [30, 16, 'G'], route: [[6, 16], [41, 16]], arms: 'carbine' },
    { id: 'ae1', at: [24, 25, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'st', at: [26, 8, 'G'], arms: 'carbine', temper: 'steady' },
  ],
  // (M6.54) the night staff: they will not stop you, and they would rather not be noticed
  civilians: [
    { id: 'nurse', at: [36, 9, '1'], yaw: Math.PI, title: 'The night sister', tint: [0.75, 0.95, 1.3], says: ['Side room one. They\'ve kept him sedated - more than he needs.', 'The sergeant has the card for his door. He never puts it down.', 'Go. I was in the sluice room. I saw nothing.'] },
    { id: 'doc', at: [30, 26, 'G'], yaw: 0, title: 'The duty doctor', tint: [1.35, 1.35, 1.35], says: ['If you are taking Marle, he cannot walk fast. Mind the stairs.', 'They brought him in with a broken arm and a story nobody believed.'] },
    { id: 'pt', at: [13, 23, '1'], yaw: Math.PI / 2, title: 'A patient', tint: [0.95, 0.9, 1.05], says: ['Is it morning yet?', 'The men in red keep walking up and down. Can\'t sleep.'] },
  ],
  hostages: [{ id: 'marle', name: 'Tobias Marle', at: [7, 8, '1'] }],
  pickups: [{ id: 'notes', name: 'Marle\'s case notes', what: 'the case notes', at: [38, 6, '1'], table: true, colour: [0.85, 0.85, 0.75] }],
  devices: [
    { id: 'c-corr', kind: 'camera', at: [4, 14, 'G'], face: [1, 1], net: 'brannoc' },
    { id: 'c-bay', kind: 'camera', at: [42, 18, 'G'], face: [-1, -1], net: 'brannoc' },
    { id: 'c-corr1', kind: 'camera', at: [42, 14, '1'], face: [-1, 1], net: 'brannoc' },
    { id: 'c-side', kind: 'camera', at: [4, 18, '1'], face: [1, -1], net: 'brannoc' },
    { id: 'm-side', kind: 'lock', at: [8, 13, '1'], net: 'brannoc' },
    { id: 'a-corr', kind: 'alarm', at: [24, 18, 'G'], face: [0, -1], net: 'brannoc' },
  ],
  terminals: [{ id: 'sec', name: 'the porters\' office console', at: [40, 6, 'G'], face: [-1, 0], time: 6, net: 'brannoc' }],
  // (M6.58) papers to read: lore, not needed to finish
  intel: [
    { id: "chart", at: [34, 6, "1"], kind: "Chart", title: "A drug chart - side room one", text: ["Patient: T. Marle. Admitted with a broken arm and bruising \"from a fall\".", "Sedation increased twice, by order of \"the gentlemen from the Ministry\". The night sister has written: \"Not on my ward.\""] },
    { id: "note", at: [9, 10, "1"], kind: "Note", title: "A note, folded small", text: ["If anyone reads this who is not one of them: the man who bought it is Merrow. The Count. Lake road.", "- T.M."] },
  ],
  objectives: [
    { id: 'o1', kind: 'rescue', ref: 'marle', text: 'Bring Tobias Marle out (Ward 4\'s side rooms, upstairs)' },
    { id: 'o2', kind: 'take', ref: 'notes', text: 'Take his case notes (the ward office, upstairs)' },
  ],
};
