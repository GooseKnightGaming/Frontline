// FRONTLINE - Level 104, the Mint (first draft, M6.126; the start of THE GOLD). With the Skerries gone, the reds know
// the north is lost, and they mean to take its gold with them: the reserve in the Hollen Mint, eleven tons of it, to
// be moved by night to somewhere nobody will find. The treasurer has the plan, and the strongroom has the manifest.
// Mark the treasurer, so that Ghost can follow him, and take the shipping manifest from the strongroom.
const W = 50, H = 36;
export default {
  id: 'mint', no: 104, title: 'The Mint', place: 'the Hollen Mint', windows: false,
  where: 'The Hollen Mint. 23:20, the counting hall lit, crates stacked to the ceiling.',
  brief: [
    ['The job', 'With the Skerries gone, the reds know that the north is lost, and they mean to take its <b>gold</b> with them: the reserve in the <b>Hollen Mint</b>, eleven tons of it, to be moved by night to somewhere nobody will find. <b>Mark the treasurer</b>, so that Ghost can follow him. Take the <b>shipping manifest</b> from the <b>strongroom</b>. If you can, <b>without the alarm</b>.'],
    ['The place', 'The <b>lobby</b> is on the south side, with the <b>counting hall</b> behind it full of crates. The <b>strongroom</b> is off the counting hall, east, behind a maglocked door. A second door leads from it into the <b>treasurer\'s office</b>. The guardroom is east of the office. You come in from the street, south-west.'],
    ['Security', 'A camera in the lobby, the strongroom\'s maglock (the vault officer carries the card) and the alarm, all on the console in the guardroom, with the radio and the engineer. The treasurer\'s office opens into the strongroom too.'],
    ['Objectives', '<b>Mark the treasurer</b> (his office). Take the <b>manifest</b> (the strongroom). If you can, <b>without the alarm</b>. Out to the street, south-west.'],
  ],
  epilogue: {
    success: 'The manifest says the gold goes by rail on Thursday, in a train of eleven wagons marked "machine parts". The treasurer goes home that night with a face Ghost knows now, and does not see who follows him.',
    partial: 'Half of it. Ghost knows the gold is moving, but not when, or not who is moving it.',
  },
  time: { date: [6, 6, 2027], hour: 23, minute: 20 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.18, 0.18, 0.22, 25, 160], ambient: [0.28, 0.28, 0.32] },
  extractName: 'the street, south-west', extract: { x: 2, y: 34, floor: 'G', van: [0, -7] },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 4, wall: 'marble', wallTint: [0.85, 0.83, 0.78], floor: 'marble', ceil: 'plaster', lampPower: 0.75, lampColour: [1, 0.92, 0.8], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 10, 8, 30, 18],                        // the counting hall
        ['room', 10, 20, 30, 28],                       // the lobby
        ['room', 32, 8, 38, 14],                        // the strongroom
        ['room', 32, 16, 38, 22],                       // the treasurer's office
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
        ['cells', [[4, 30], [36, 32], [24, 33], [6, 12]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { level, mid, CELL: C } = kit;
    for (const [x, y] of [[20, 31], [8, 32], [32, 31], [44, 30]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 11, intensity: 0.8, color: [1, 0.9, 0.75], street: true });
    level.signs.push({ pos: [mid(20), 4.3, 29 * C + C + 0.13], yaw: 0, w: 5, h: 0.8, text: 'HOLLEN MINT', sub: 'Est. 1811', col: '#2a2a1a' });
  },
  start: { x: 2, y: 33, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'hall', label: 'The Mint - the counting hall', at: [10, 8, 30, 18] },
    { id: 'lobby', label: 'The Mint - the lobby', at: [10, 20, 30, 28] },
    { id: 'strong', label: 'The Mint - the strongroom', at: [32, 8, 38, 14] },
    { id: 'office', label: 'The Mint - the treasurer\'s office', at: [32, 16, 38, 22] },
    { id: 'guard', label: 'The Mint - the guardroom', at: [40, 18, 46, 26] },
    { id: 'street', label: 'Hollen', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'treas', at: [35, 19, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The treasurer', tint: [0.3, 0.28, 0.25] },
    { id: 'vo', at: [26, 12, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', card: 'mint', name: 'The vault officer' },
    { id: 'ch1', at: [20, 15, 'G'], route: [[11, 15], [29, 15]], arms: 'smg' },
    { id: 'ch2', at: [15, 9, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'lb1', at: [14, 25, 'G'], arms: 'carbine' },
    { id: 'lb2', at: [26, 25, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'rad', at: [43, 20, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [44, 24, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'st1', at: [30, 32, 'G'], route: [[16, 32], [44, 32]], arms: 'carbine' },
  ],
  pickups: [{ id: 'manifest', name: 'The shipping manifest', what: 'the manifest', at: [35, 10, 'G'], table: true, colour: [0.85, 0.8, 0.6] }],
  devices: [
    { id: 'c-lobby', kind: 'camera', at: [9, 29, 'G'], face: [1, -1], net: 'mint' },
    { id: 'm-vault', kind: 'lock', at: [31, 11, 'G'], net: 'mint' },
    { id: 'a-mint', kind: 'alarm', at: [31, 25, 'G'], face: [-1, 0], net: 'mint' },
  ],
  terminals: [{ id: 'sec', name: 'the guardroom console', at: [41, 19, 'G'], face: [0, 1], time: 6, net: 'mint' }],
  intel: [
    { id: 'tally', at: [12, 9, 'G'], kind: 'Tally', title: 'The counting hall\'s tally', text: ['Eleven tons, four hundred and six bars, counted three times. On the last count, in a different hand: "four hundred and five".'] },
    { id: 'memo', at: [36, 18, 'G'], kind: 'Memo', title: 'A memo on the treasurer\'s desk', text: ['"Machine parts, eleven wagons, Thursday. The usual crew. Not the usual line."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'identify', refs: ['treas'], text: 'Mark the treasurer (his office)' },
    { id: 'o2', kind: 'take', ref: 'manifest', text: 'Take the manifest (the strongroom)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
