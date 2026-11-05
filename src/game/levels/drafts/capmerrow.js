// FRONTLINE - Level 114, Cap Merrow (first draft, M6.136; THE BUYER, second). The flight plan led to Kray's summer
// house on the cliffs at Cap Merrow, where he entertains the people he sells to. Two of them are dining with him
// tonight. Mark both guests, so that Ghost knows who is still buying, and open the safe in his study: it holds his
// client list, which is worth more than the house.
const W = 52, H = 38;
export default {
  id: 'capmerrow', no: 114, title: 'Cap Merrow', place: 'Anselm Kray\'s house, Cap Merrow',
  where: 'Anselm Kray\'s house, Cap Merrow. 22:00, dinner on the terrace, the sea far below.',
  brief: [
    ['The job', 'The flight plan led to <b>Kray\'s summer house</b> on the cliffs at Cap Merrow, where he entertains the people he sells to. <b>Two guests</b> are dining with him tonight. <b>Mark both</b>, so that Ghost knows who is still buying. <b>Open the safe</b> in his study: it holds his <b>client list</b>, which is worth more than the house. If you can, <b>without the alarm</b>.'],
    ['The place', 'The <b>terrace</b> and the dining room face the sea, south. The <b>study</b> is in the east wing, and the drawing room and the guests\' rooms in the west wing. The garage and the guardhouse are on the drive, north. You come up the cliff path, south-west.'],
    ['Security', 'Cameras on the drive and the terrace, and the alarm, all on the guardhouse console with the radio. The engineer is in the garage. Kray\'s men are good, and paid to be. Kray himself is dining, and not tonight\'s job.'],
    ['Objectives', '<b>Mark the two guests</b> (at dinner). <b>Open the safe</b> (the study). If you can, <b>without the alarm</b>. Back down the cliff path, south-west.'],
  ],
  epilogue: {
    success: 'Kray\'s client list has forty names on it, and two of them had dinner with him tonight. The safe is shut again by morning and nobody in the house knows it was ever open. Kray goes inland to meet his caravan on Tuesday, exactly as his diary in the safe says he will.',
    partial: 'Part of it. Some of Kray\'s buyers are known now, but not all, and the list stays in the safe.',
  },
  time: { date: [21, 7, 2027], hour: 22, minute: 0 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.2, 0.2, 0.26, 30, 200], ambient: [0.32, 0.31, 0.36] },
  extractName: 'the cliff path, south-west', extract: { x: 2, y: 35, floor: 'G', van: [7, 0] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 3.8, wall: 'plaster', wallTint: [0.98, 0.95, 0.88], floor: 'marble', ceil: 'plaster', lampPower: 0.7, lampColour: [1, 0.9, 0.75], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 16, 14, 34, 22],                       // the dining room
        ['room', 36, 14, 44, 22],                       // the study
        ['room', 6, 14, 14, 22],                        // the drawing room
        ['room', 18, 4, 24, 9],                         // the garage
        ['room', 28, 4, 34, 9],                         // the guardhouse
      ], after: [
        ['cells', [[25, 23], [35, 18], [15, 18], [21, 10], [31, 10], [25, 13], [10, 23]], 'D'],
        ['cells', [[20, 23], [30, 23], [40, 23], [45, 18], [5, 18]], 'W'],
        ['room', 20, 17, 30, 17, 'T'], ['cells', [[17, 15], [33, 15]], 'H'],
        ['cells', [[42, 15]], 'T'], ['cells', [[38, 21]], 'T'], ['room', 43, 16, 43, 20, 'H'],
        ['room', 8, 16, 8, 20, 'Y'], ['cells', [[12, 15]], 'T'],
        ['cells', [[20, 6]], 'M'], ['cells', [[29, 5], [33, 8]], 'T'],
        // the terrace's tables and urns, the garden, the drive's cars
        ['cells', [[18, 26], [30, 26], [12, 28], [8, 8], [46, 10]], 'B'], ['cells', [[24, 27], [36, 27], [44, 28], [40, 6]], 't'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    box([0, -6, 31 * C], [W * C, -0.05, H * C], 'concrete2', { tint: [0.5, 0.48, 0.44], solid: false });
    for (const [x, y] of [[20, 25], [30, 25], [40, 25], [25, 11], [12, 25]]) level.lights.push({ pos: [mid(x), 3.6, mid(y)], range: 10, intensity: 0.8, color: [1, 0.88, 0.7], street: true });
  },
  vehicles: [{ id: 'kraycar', kind: 'car', model: 'lightUtility', paint: 'white', at: [38, 8], yaw: 0, hp: 560 }],
  start: { x: 2, y: 34, floor: 'G', yaw: 0 },
  zones: [
    { id: 'dining', label: 'Cap Merrow - the dining room', at: [16, 14, 34, 22] },
    { id: 'study', label: 'Cap Merrow - the study', at: [36, 14, 44, 22] },
    { id: 'drawing', label: 'Cap Merrow - the drawing room', at: [6, 14, 14, 22] },
    { id: 'guard', label: 'Cap Merrow - the guardhouse', at: [28, 4, 34, 9] },
    { id: 'terrace', label: 'Cap Merrow - the terrace', at: [6, 24, 46, 30] },
    { id: 'merrow', label: 'Cap Merrow', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'kray', at: [25, 16, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'Anselm Kray', tint: [0.9, 0.85, 0.75] },
    { id: 'guest1', at: [22, 18, 'G'], arms: 'pistol', rank: 'specialist', temper: 'cowardly', name: 'A guest (the man in grey)', tint: [0.5, 0.5, 0.52] },
    { id: 'guest2', at: [28, 18, 'G'], arms: 'pistol', rank: 'specialist', temper: 'cowardly', name: 'A guest (the man in blue)', tint: [0.35, 0.4, 0.6] },
    { id: 'dn1', at: [32, 20, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'sd1', at: [40, 18, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'dr1', at: [11, 18, 'G'], arms: 'pistol' },
    { id: 'rad', at: [31, 6, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [22, 7, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'tr1', at: [26, 28, 'G'], route: [[14, 28], [42, 28]], arms: 'carbine' },
    { id: 'dv1', at: [40, 11, 'G'], route: [[10, 11], [46, 11]], arms: 'carbine', dog: true },
  ],
  civilians: [
    { id: 'cook', at: [33, 21, 'G'], yaw: Math.PI, title: 'The cook', tint: [1.1, 1.1, 1.05], says: ['Fish again. Mr Kray\'s guests always want the fish and never eat it.'] },
  ],
  devices: [
    { id: 'c-drive', kind: 'camera', at: [27, 10, 'G'], face: [1, 1], net: 'merrow' },
    { id: 'c-terr', kind: 'camera', at: [15, 23, 'G'], face: [-1, 1], net: 'merrow' },
    { id: 'a-merrow', kind: 'alarm', at: [35, 21, 'G'], face: [1, 0], net: 'merrow' },
  ],
  terminals: [
    { id: 'sec', name: 'the guardhouse console', at: [29, 5, 'G'], face: [0, 1], time: 6, net: 'merrow' },
    { id: 'safe', name: 'the study safe', at: [42, 15, 'G'], face: [0, 1], time: 8, verb: 'Open', doing: 'Opening',
      said: 'The client list, forty names in Kray\'s small hand, photographed page by page and put back as it was.' },
  ],
  intel: [
    { id: 'diary', at: [38, 21, 'G'], kind: 'Diary', title: 'Kray\'s diary, on his desk', text: ['"Tuesday: inland, to the caravan at the Bir Sahra well. The last of the north\'s crates go south with it."'] },
    { id: 'menu', at: [12, 15, 'G'], kind: 'Card', title: 'A place card in the drawing room', text: ['"Mr Grey" and "Mr Blue". Kray does not let his guests give their names, even to each other.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'identify', refs: ['guest1', 'guest2'], text: 'Mark the two guests (at dinner)' },
    { id: 'o2', kind: 'hack', ref: 'safe', text: 'Open the safe (the study)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
