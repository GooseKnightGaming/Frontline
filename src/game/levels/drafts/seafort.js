// FRONTLINE - Level 102, Holme Skerry (first draft, M6.124; THE ISLANDS, second). The radar station's plot said where
// the garrison's commander went: the old sea fort on Holme Skerry, the last island before open sea, with what is left
// of Hollen's garrison round him. Cross from the outer skerry by boat, take the commander alive in his quarters at the
// top of the keep, and take the garrison's roll, which says who is still loyal to whom.
const W = 60, H = 44;
export default {
  id: 'seafort', no: 102, title: 'Holme Skerry', place: 'the sea fort on Holme Skerry',
  where: 'The sea fort on Holme Skerry. 02:30, the tide high round the walls, one lamp lit in the keep.',
  brief: [
    ['The job', 'The radar station\'s plot said where the garrison\'s <b>commander</b> went: the old <b>sea fort</b> on Holme Skerry, the last island before open sea, with what is left of Hollen\'s garrison round him. Cross from the outer skerry, by boat or along the causeway, which is awash at high tide. <b>Take the commander alive</b> in his quarters at the top of the <b>keep</b>. Take the <b>garrison\'s roll</b> from the barracks. If you can, <b>without the alarm</b>.'],
    ['The place', 'You start on the outer skerry, west, with Ghost\'s boat in the water beside you and the old <b>causeway</b> running east to the fort, awash with the tide. The fort fills Holme Skerry. The <b>keep</b> is in the middle, with the commander\'s quarters upstairs. The <b>barracks</b> are south-west of it and the magazine south-east, with the ramparts round the edge.'],
    ['Security', 'A camera on the keep and the fort\'s alarm, both on the console in the keep with the radio. The engineer is in the magazine. Men walk the ramparts, and the commander keeps a man with him.'],
    ['Objectives', '<b>Take the commander alive</b> (the keep, upstairs). Take the <b>garrison\'s roll</b> (the barracks). If you can, <b>without the alarm</b>. Back across to the outer skerry, west.'],
  ],
  epilogue: {
    success: 'The commander crosses the strait in the bottom of Ghost\'s boat, and the roll says that most of his garrison have been waiting for an excuse. In the morning, Ghost sends them one.',
    partial: 'The commander or the roll, not both. Holme Skerry\'s garrison will hold out a little longer, for want of being told it can stop.',
  },
  time: { date: [2, 6, 2027], hour: 2, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.08, 0.1, 0.13, 30, 200], ambient: [0.2, 0.22, 0.28] },
  extractName: 'the outer skerry', extract: { x: 2, y: 25, floor: 'G', van: [0, 8] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'concrete2', wallTint: [0.6, 0.58, 0.54], floor: 'concrete', ceil: 'wood', lampPower: 0.55, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      channel: 3, surf: 0.5,
      carve: { size: [W, H], ops: [
        ['room', 26, 14, 36, 22],                       // the keep
        ['room', 22, 27, 30, 33],                       // the barracks
        ['room', 34, 27, 40, 33],                       // the magazine
      ], after: [
        // the sea round Holme Skerry (the outer skerry, x 0 - 4, where you start)
        ['room', 5, 0, W - 1, 7, '~'], ['room', 5, 37, W - 1, H - 1, '~'], ['room', 5, 8, 17, 20, '~'], ['room', 5, 24, 17, 36, '~'], ['room', 45, 8, W - 1, 36, '~'],
        ['cells', [[31, 23], [26, 26], [37, 26]], 'D'],
        ['cells', [[25, 18], [37, 16], [29, 13], [33, 13], [21, 30], [41, 30]], 'W'],
        ['cells', [[29, 15]], 'T'], ['cells', [[27, 21]], 'H'],
        ['cells', [[24, 29]], 'T'], ['room', 23, 32, 29, 32, 'Y'],
        ['cells', [[36, 28], [39, 32]], 'C'], ['cells', [[38, 29]], 'M'],
        // the ramparts' guns and the rocks
        ['cells', [[20, 12], [42, 12], [20, 35], [42, 35], [31, 10], [2, 12], [3, 32]], 'C'],
      ] },
    },
    1: {
      y: 3.8, wallH: 3, wall: 'concrete2', wallTint: [0.6, 0.58, 0.54], floor: 'wood', ceil: 'wood', lampPower: 0.45, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      carve: { size: [W, H], ops: [['room', 26, 14, 36, 22]], after: [
        ['cells', [[29, 13], [33, 13], [25, 18], [37, 18], [29, 23]], 'W'],
        ['cells', [[28, 15]], 'T'], ['cells', [[27, 20]], 'Y'], ['cells', [[31, 21]], 'H'],
      ] },
    },
  },
  stairs: [{ x: 34, y: 21, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { level, mid } = kit;
    for (const [x, y] of [[31, 24], [19, 22], [43, 22]]) level.lights.push({ pos: [mid(x), 3.6, mid(y)], range: 10, intensity: 0.7, color: [1, 0.85, 0.6], street: true });
  },
  vehicles: [{ id: 'ghostboat', kind: 'boat', at: [10, 16], yaw: -Math.PI / 2, paint: 'ghost', hp: 600 }],
  start: { x: 2, y: 22, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'keep', label: 'Holme Skerry - the keep', at: [26, 14, 36, 22] },
    { id: 'quarters', label: 'Holme Skerry - the commander\'s quarters', at: [26, 14, 36, 22], floor: '1' },
    { id: 'barr', label: 'Holme Skerry - the barracks', at: [22, 27, 30, 33] },
    { id: 'mag', label: 'Holme Skerry - the magazine', at: [34, 27, 40, 33] },
    { id: 'fort', label: 'Holme Skerry', at: [18, 8, 44, 36] },
    { id: 'outer', label: 'The outer skerry', at: [0, 0, 4, H - 1] },
  ],
  guards: [
    { id: 'cmdr', at: [30, 17, '1'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The garrison commander', tint: [0.3, 0.3, 0.28] },
    { id: 'aide', at: [32, 19, '1'], arms: 'smg', temper: 'steady' },
    { id: 'rad', at: [28, 16, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'kg', at: [30, 20, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'eng', at: [37, 30, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'b1', at: [27, 30, 'G'], arms: 'carbine' },
    { id: 'r1', at: [31, 9, 'G'], route: [[22, 9], [40, 9]], arms: 'carbine' },
    { id: 'r2', at: [31, 35, 'G'], route: [[22, 35], [40, 35]], arms: 'carbine' },
    { id: 'r3', at: [43, 22, 'G'], route: [[43, 12], [43, 32]], arms: 'dmr', rank: 'specialist', temper: 'steady' },
  ],
  pickups: [{ id: 'roll', name: 'The garrison\'s roll', what: 'the roll', at: [24, 29, 'G'], table: true, colour: [0.8, 0.75, 0.6] }],
  devices: [
    { id: 'c-keep', kind: 'camera', at: [25, 23, 'G'], face: [-1, 1], net: 'holme' },
    { id: 'a-holme', kind: 'alarm', at: [37, 20, 'G'], face: [1, 0], net: 'holme' },
  ],
  terminals: [{ id: 'sec', name: 'the keep\'s console', at: [29, 15, 'G'], face: [0, 1], time: 6, net: 'holme' }],
  intel: [
    { id: 'letter', at: [28, 15, '1'], kind: 'Letter', title: 'A letter on the commander\'s table', text: ['To his wife, unfinished: "The men are quiet. I think they are waiting to see which of us blinks first. I would give a great deal to blink."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'capture', ref: 'cmdr', text: 'Take the commander alive (the keep, upstairs)' },
    { id: 'o2', kind: 'take', ref: 'roll', text: 'Take the garrison\'s roll (the barracks)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
