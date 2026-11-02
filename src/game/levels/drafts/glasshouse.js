// FRONTLINE - Level 43, the Glasshouse (first draft, M6.42; built round glass that breaks, M6.33, and grip, M6.37).
// Varn Dynamics' botanical research station on the edge of the city: a great glasshouse, its walls more window than
// wall, a steel catwalk round its roof, rain on the panes. The guidance systems are finished - but Varn grew
// something else here, and Ghost wants to know what. Every pane can go: a way in, a way through, a way out - and a
// noise.
const W = 46, H = 34;
export default {
  id: 'glasshouse', no: 43, title: 'The Glasshouse', place: 'the Varn glasshouse',
  where: 'Varn Dynamics\' research glasshouse, on the edge of the city. 01:10, raining.',
  brief: [
    ['The job', 'Varn\'s money is gone and its people are scattering - but the glasshouse is still running, and someone keeps paying for it. Take a <b>sample</b> from the growing room, and copy the <b>research server</b>.'],
    ['The place', 'The <b>glasshouse</b>: one great hall, beds and benches, a steel <b>catwalk</b> round its roof (up the stair in its south-east corner). East of it, the <b>lab</b> (the growing room, laser-guarded) and the <b>server room</b> (maglocked; the keycard is the head of research\'s). Upstairs over the lab, the <b>office</b> - the security console.'],
    ['Glass', 'Nearly every wall is a window, and every window will break: shoot one out and it is a way through, over the sill. It is loud - they will come to look - and a hall full of broken panes is a hall full of ways round. The catwalk is steel and the rain is on it: it is slippery when wet.'],
    ['Security', 'Cameras over the hall and the lab, a laser across the growing room, the maglock, the alarm - run from the office upstairs. A dog with the man on the grounds, a radio in the office.'],
    ['Objectives', 'Take the <b>sample</b> (the growing room). Copy the <b>research server</b> (the server room). Out by the van on the lane to the south.'],
  ],
  time: { date: [27, 12, 2026], hour: 1, minute: 10 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'rain',
  atmos: { fog: [0.2, 0.24, 0.26, 25, 180], ambient: [0.3, 0.34, 0.36] },
  extractName: 'the van on the lane', extract: { x: 23, y: 32, floor: 'G' },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 5.2, wall: 'concrete2', wallTint: [0.85, 0.88, 0.86], floor: 'tile', floorTint: [0.55, 0.6, 0.55], ceil: 'metal', lampPower: 0.75, lampColour: [0.85, 1, 0.9], lampEvery: 7,
      carve: { size: [W, H], ops: [
        ['room', 6, 6, 30, 24],                         // the glasshouse
        ['room', 32, 6, 40, 14],                        // the lab: the growing room
        ['room', 32, 16, 40, 24],                       // the server room
        ['room', 18, 26, 30, 29],                       // the lobby
      ], after: [
        // the glasshouse's walls: windows nearly all the way round
        ['cells', [[8, 5], [10, 5], [12, 5], [14, 5], [16, 5], [18, 5], [20, 5], [22, 5], [24, 5], [26, 5], [28, 5]], 'W'],
        ['cells', [[5, 8], [5, 10], [5, 12], [5, 14], [5, 16], [5, 18], [5, 20], [5, 22]], 'W'],
        ['cells', [[8, 25], [10, 25], [12, 25], [14, 25], [16, 25]], 'W'],
        ['cells', [[34, 5], [36, 5], [38, 5], [41, 8], [41, 12], [41, 18], [41, 22], [34, 25], [38, 25], [19, 30], [29, 30]], 'W'],
        ['cells', [[31, 10], [31, 20], [36, 15], [24, 25], [25, 25], [24, 30], [25, 30]], 'D'],
        // beds and benches
        ['room', 9, 9, 13, 10, 'K'], ['room', 9, 14, 13, 15, 'K'], ['room', 9, 19, 13, 20, 'K'],
        ['room', 17, 9, 21, 10, 'K'], ['room', 17, 19, 21, 20, 'K'],
        ['room', 25, 9, 27, 10, 'T'], ['room', 25, 19, 27, 20, 'T'],
        ['cells', [[15, 12], [15, 17], [23, 12], [23, 17]], 'P'],
        // the lab, the server room
        ['cells', [[33, 7], [35, 7], [37, 7], [39, 7]], 'H'], ['cells', [[34, 11], [38, 11]], 'T'],
        ['cells', [[33, 18], [35, 18], [37, 18], [39, 18], [33, 22], [35, 22]], 'M'],
        ['cells', [[20, 27], [28, 27]], 'Z'],
        // the grounds: a low wall along the lane, cars, trees, the van
        ['cells', [[3, 31], [4, 31], [5, 31], [41, 31], [42, 31], [43, 31]], 'w'], ['cells', [[8, 32], [37, 32]], 'v'],
        ['cells', [[2, 3], [2, 14], [2, 26], [44, 3], [44, 14], [44, 26], [12, 30], [33, 30]], 't'],
      ] },
    },
    1: {
      y: 5.4, wallH: 3.0, wall: 'concrete2', wallTint: [0.85, 0.88, 0.86], floor: 'metal', floorTint: [0.5, 0.52, 0.54], ceil: 'metal', lampPower: 0.6, lampColour: [0.85, 1, 0.9], lampEvery: 7,
      carve: { size: [W, H], ops: [
        ['room', 6, 6, 30, 24],                         // the catwalk (the hall's middle open below)
        ['room', 32, 6, 40, 14],                        // the office
        ['room', 32, 16, 40, 24],                       // the plant room
      ], after: [
        ['room', 8, 8, 28, 22, 'O'],
        ['room', 8, 7, 28, 7, '='], ['room', 8, 23, 28, 23, '='], ['room', 7, 8, 7, 22, '='], ['room', 29, 8, 29, 22, '='],
        ['cells', [[31, 10], [31, 20], [36, 15]], 'D'],
        ['cells', [[8, 5], [14, 5], [20, 5], [26, 5], [5, 10], [5, 16], [5, 22], [34, 5], [38, 5], [41, 10]], 'W'],
        ['cells', [[33, 7], [39, 7]], 'T'], ['cells', [[37, 12]], 'Z'], ['cells', [[33, 18], [37, 18], [33, 22]], 'M'],
      ] },
    },
  },
  stairs: [{ x: 30, y: 23, dir: 'N', len: 4, w: 1, from: 'G', to: '1' }],      // up to the catwalk, in the hall's south-east corner
  start: { x: 23, y: 33, floor: 'G', yaw: 0 },
  zones: [
    { id: 'hall', label: 'The Glasshouse - the hall', at: [6, 6, 30, 24] },
    { id: 'catwalk', label: 'The Glasshouse - the catwalk', at: [6, 6, 30, 24], floor: '1' },
    { id: 'lab', label: 'The Glasshouse - the growing room', at: [32, 6, 40, 14] },
    { id: 'server', label: 'The Glasshouse - the server room', at: [32, 16, 40, 24] },
    { id: 'office', label: 'The Glasshouse - the office', at: [32, 6, 40, 14], floor: '1' },
    { id: 'plant', label: 'The Glasshouse - the plant room', at: [32, 16, 40, 24], floor: '1' },
    { id: 'lobby', label: 'The Glasshouse - the lobby', at: [18, 26, 30, 29] },
    { id: 'grounds', label: 'The Varn grounds', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'head', at: [34, 9, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The head of research', tint: [0.95, 0.95, 1.0], card: 'varn' },
    { id: 'h1', at: [16, 22, 'G'], route: [[8, 22], [28, 22], [28, 8], [8, 8]], arms: 'carbine' },
    { id: 'h2', at: [19, 15, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'c1', at: [18, 6, '1'], route: [[6, 6], [30, 6], [30, 24], [6, 24]], arms: 'dmr', rank: 'specialist' },
    { id: 'lab', at: [38, 13, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'srv', at: [38, 21, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'off', at: [36, 9, '1'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [38, 20, '1'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'lob', at: [22, 28, 'G'], arms: 'carbine' },
    { id: 'grd', at: [10, 2, 'G'], route: [[3, 2], [43, 2], [43, 28]], arms: 'carbine', dog: true },
  ],
  pickups: [{ id: 'sample', name: 'The sample', what: 'the sample', at: [36, 11, 'G'], table: true, colour: [0.3, 0.85, 0.4] }],
  devices: [
    { id: 'c-hall', kind: 'camera', at: [6, 24, 'G'], face: [1, -1], net: 'varn' },
    { id: 'c-hall2', kind: 'camera', at: [30, 6, 'G'], face: [-1, 1], net: 'varn' },
    { id: 'c-lab', kind: 'camera', at: [40, 6, 'G'], face: [-1, 1], net: 'varn' },
    { id: 'c-pin-srv', kind: 'camera', at: [40, 24, 'G'], face: [-1, -1], net: 'varn', hidden: true },
    { id: 'z-lab', kind: 'laser', at: [32, 9, 'G'], to: [40, 9], net: 'varn' },
    { id: 'm-srv', kind: 'lock', at: [36, 15, 'G'], net: 'varn' },
    { id: 'a-hall', kind: 'alarm', at: [24, 25, 'G'], face: [0, -1], net: 'varn' },
  ],
  terminals: [
    { id: 'sec', name: 'the office\'s security console', at: [39, 13, '1'], face: [-1, 0], time: 6, net: 'varn' },
    { id: 'research', name: 'the research server', at: [36, 23, 'G'], face: [0, -1], time: 9, reveal: 25, verb: 'Copy', doing: 'Copying',
      said: 'The research, copied: not guidance systems this time - a blight, for crops, bred to order. Ghost will want to know who for. Every red here on your radar for 25 seconds.' },
  ],
  // (M6.58) papers to read: lore, not needed to finish
  intel: [
    { id: "lab", at: [34, 11, "G"], kind: "Rota", title: "Night rota - the growing room", text: ["Two on the lab door, one on the server room, all night. Nobody in after midnight without the head of research.", "Scrawled underneath: \"Since when do greenhouses need guards with rifles?\""] },
    { id: "office", at: [33, 7, "1"], kind: "Letter", title: "Letter - unsigned, on Varn paper", text: ["The money stops at the end of the month. The work does not. You will be paid from another account.", "A van will come for the first consignment. Do not be there when it does."] },
  ],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'sample', text: 'Take the sample (the growing room)' },
    { id: 'o2', kind: 'hack', ref: 'research', text: 'Copy the research server (the server room)' },
  ],
};
