// FRONTLINE - Level 117, Dancourt & Fils (first draft, M6.139; THE BANKER, second). The slips were paid out at a
// private bank in Lessar, Dancourt & Fils, three rooms behind a brass plate. Go in by night with night vision. Put out
// the banking hall's lights from the guard office's console, copy the bank's index of accounts, and take Kray's own
// account book from the vault - every crate he ever sold, priced and paid.
const W = 50, H = 36;
export default {
  id: 'dancourt', no: 117, title: 'Dancourt & Fils', place: 'Dancourt & Fils, Lessar', windows: false,
  where: 'Dancourt & Fils, Lessar. 02:20, the street dark, one lamp burning in the partners\' room.',
  brief: [
    ['The job', 'The slips were paid out at a private bank in Lessar, <b>Dancourt & Fils</b>, three rooms behind a brass plate. Go in by night with <b>night vision</b>. <b>Copy the index of accounts</b> on the banking hall\'s ledger machine. Take <b>Kray\'s account book</b> from the <b>vault</b>: every crate he ever sold, priced and paid. If you can, <b>without the alarm</b>.'],
    ['The place', 'The <b>lobby</b> is on the south side, and the <b>banking hall</b> behind it. The <b>vault</b> is off the hall, east, behind a maglocked door, with a second door into the <b>partners\' room</b>. The guard office is east of the partners\' room. You come in from the street, south-west. You have <b>night vision</b>.'],
    ['Security', 'A camera in the lobby, the vault\'s maglock (the night clerk carries the card), the alarm, and the <b>banking hall\'s lights</b>, all on the console in the guard office with the radio and the engineer. Put the lights out and the men in the hall see only what is close.'],
    ['Objectives', '<b>Copy the index</b> (the banking hall). Take <b>Kray\'s account book</b> (the vault). If you can, <b>without the alarm</b>. Out to the street, south-west.'],
  ],
  epilogue: {
    success: 'Dancourt & Fils opens at nine as always, with its index and Kray\'s book on Ghost\'s desk instead of in its vault. By noon its accounts are frozen in four countries, and Mr Dancourt has gone up the mountain to his house above the snow line, by the cable car, to think.',
    partial: 'The index or the book, not both. Dancourt will move his money somewhere further away.',
  },
  time: { date: [10, 8, 2027], hour: 2, minute: 20 }, night: true, dark: true, startGear: 'NVG', faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'NVG', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.06, 0.06, 0.09, 25, 160], ambient: [0.16, 0.16, 0.2] },
  extractName: 'the street, south-west', extract: { x: 2, y: 34, floor: 'G', van: [0, -7] },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 4, wall: 'marble', wallTint: [0.6, 0.5, 0.4], floor: 'marble', ceil: 'plaster', lampPower: 0.75, lampColour: [1, 0.92, 0.8], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 10, 8, 30, 18],                        // the banking hall
        ['room', 10, 20, 30, 28],                       // the lobby
        ['room', 32, 8, 38, 14],                        // the strongroom
        ['room', 32, 16, 38, 22],                       // the partners' room
        ['room', 40, 18, 46, 26],                       // the guardroom
      ], after: [
        ['cells', [[20, 29], [20, 19], [31, 11], [35, 15], [31, 21], [39, 20], [43, 27]], 'D'],
        ['cells', [[14, 29], [26, 29], [9, 13], [47, 22], [35, 23]], 'W'],
        // the counting hall's crates and tables, the lobby's counter, the strongroom's shelves, the office, the guardroom
        ['room', 13, 10, 13, 16, 'C'], ['room', 17, 10, 17, 16, 'C'], ['room', 23, 10, 23, 16, 'C'], ['cells', [[12, 9], [27, 17]], 'T'],
        ['room', 13, 22, 17, 22, 'T'], ['room', 23, 22, 27, 22, 'T'],
        ['room', 33, 9, 33, 13, 'H'], ['room', 37, 9, 37, 13, 'H'], ['cells', [[35, 10]], 'T'],
        ['cells', [[36, 18]], 'T'], ['cells', [[33, 21]], 'H'],
        ['cells', [[41, 19]], 'T'], ['cells', [[45, 25]], 'Y'],
        ['cells', [[4, 30], [36, 32], [24, 33], [6, 12]], 'B'],
      ] },
    },
  },
  extra(kit) {
    const { level, mid, CELL: C } = kit;
    for (const [x, y] of [[20, 31], [8, 32], [32, 31], [44, 30]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 11, intensity: 0.8, color: [1, 0.9, 0.75], street: true });
    level.signs.push({ pos: [mid(20), 4.3, 29 * C + C + 0.13], yaw: 0, w: 5, h: 0.8, text: 'DANCOURT & FILS', sub: 'Banquiers', col: '#3a2a10' });
  },
  start: { x: 2, y: 33, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'hall', label: 'Dancourt & Fils - the banking hall', at: [10, 8, 30, 18] },
    { id: 'lobby', label: 'Dancourt & Fils - the lobby', at: [10, 20, 30, 28] },
    { id: 'strong', label: 'Dancourt & Fils - the vault', at: [32, 8, 38, 14] },
    { id: 'office', label: 'Dancourt & Fils - the partners\' room', at: [32, 16, 38, 22] },
    { id: 'guard', label: 'Dancourt & Fils - the guard office', at: [40, 18, 46, 26] },
    { id: 'street', label: 'Lessar', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'junior', at: [35, 19, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The junior partner, working late', tint: [0.3, 0.28, 0.25] },
    { id: 'vo', at: [26, 12, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', card: 'mint', name: 'The night clerk' },
    { id: 'ch1', at: [20, 15, 'G'], route: [[11, 15], [29, 15]], arms: 'smg' },
    { id: 'ch2', at: [15, 9, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'lb1', at: [14, 25, 'G'], arms: 'carbine' },
    { id: 'lb2', at: [26, 25, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'rad', at: [43, 20, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [44, 24, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'st1', at: [30, 32, 'G'], route: [[16, 32], [44, 32]], arms: 'carbine' },
  ],
  pickups: [{ id: 'kraybook', name: 'Kray\'s account book', what: 'Kray\'s account book', at: [35, 10, 'G'], table: true, colour: [0.85, 0.8, 0.6] }],
  devices: [
    { id: 'c-lobby', kind: 'camera', at: [9, 29, 'G'], face: [1, -1], net: 'mint' },
    { id: 'm-vault', kind: 'lock', at: [31, 11, 'G'], net: 'mint' },
    { id: 'l-hall', kind: 'lights', at: [9, 16, 'G'], face: [1, 0], area: [10, 8, 30, 18], name: 'the banking hall', net: 'mint' },
    { id: 'a-mint', kind: 'alarm', at: [31, 25, 'G'], face: [-1, 0], net: 'mint' },
  ],
  terminals: [
    { id: 'sec', name: 'the guard office console', at: [41, 19, 'G'], face: [0, 1], time: 6, net: 'mint' },
    { id: 'index', name: 'the ledger machine', at: [27, 17, 'G'], face: [0, -1], time: 8, reveal: 15, verb: 'Copy', doing: 'Copying',
      said: 'The bank\'s index of accounts, every name and number, copied onto Ghost\'s film. Every man in the bank is on your radar for 15 seconds.' },
  ],
  intel: [
    { id: 'tally', at: [12, 9, 'G'], kind: 'Note', title: 'A note on a clerk\'s desk', text: ['"Mr K.\'s account: no statements by post. Mr K. collects in person, or sends the man in grey."'] },
    { id: 'memo', at: [36, 18, 'G'], kind: 'Memo', title: 'A memo on the partners\' desk', text: ['From Mr Dancourt: "If anybody asks after K., I am at the house on the mountain. Nobody is to ask."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'index', text: 'Copy the index of accounts (the banking hall)' },
    { id: 'o2', kind: 'take', ref: 'kraybook', text: 'Take Kray\'s account book (the vault)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
