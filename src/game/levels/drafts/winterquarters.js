// FRONTLINE - Level 126, Winter Quarters (first draft, M6.148; THE CIRCUS, second). The route book's last page: the
// Circus Orlov's winter quarters, the old Hesse farm in the hills, where the messages are sent on. The circus sends them
// with a transmitter hidden in its steam organ, and one of its acrobats who tried to leave is locked in the horse barn.
// Silence the organ's transmitter, and bring the acrobat out.
const W = 56, H = 40;
export default {
  id: 'winterquarters', no: 126, title: 'Winter Quarters', place: 'the Circus Orlov\'s winter quarters, the Hesse farm',
  where: 'The Hesse farm, the Circus Orlov\'s winter quarters. 02:00, frost, the circus\'s wagons drawn up in the yard.',
  brief: [
    ['The job', 'The route book\'s last page gave the Circus Orlov\'s <b>winter quarters</b>: the old Hesse farm in the hills, where the messages are sent on. The circus sends them with a <b>transmitter</b> hidden in its <b>steam organ</b>. One of its acrobats, <b>Lena Pask</b>, tried to leave, and is locked in the <b>horse barn</b>. <b>Silence the transmitter</b>. <b>Bring Lena out</b>. If you can, <b>without the alarm</b>.'],
    ['The place', 'The <b>great barn</b>, where the organ is kept, is in the middle of the yard. The <b>horse barn</b> is east and the <b>farmhouse</b>, where the circus\'s men sleep, is west. The wagons are drawn up in the yard. You come in over the fields, south.'],
    ['Security', 'A camera on the yard and the farm\'s alarm, both on the console in the farmhouse with the radio. The engineer is with the organ, keeping its boiler warm. The circus\'s men walk the yard with a dog.'],
    ['Objectives', '<b>Silence the transmitter</b> (the steam organ, the great barn). <b>Bring Lena out</b> (the horse barn). If you can, <b>without the alarm</b>. Out over the fields, south.'],
  ],
  epilogue: {
    success: 'The steam organ plays no more messages, and Lena Pask tells Ghost everything about the Circus Orlov over breakfast. It is a great deal. The circus will give one last performance, and Ghost will be in the audience.',
    partial: 'The organ or the acrobat, not both. The circus will know someone was in its winter quarters.',
  },
  time: { date: [14, 9, 2027], hour: 2, minute: 0 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.16, 0.16, 0.2, 25, 170], ambient: [0.26, 0.26, 0.3] },
  extractName: 'the fields, south', extract: { x: 28, y: 38, floor: 'G', van: [10, 0] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 5, wall: 'wood', wallTint: [0.55, 0.38, 0.28], floor: 'wood', ceil: 'wood', lampPower: 0.55, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 20, 8, 34, 20],                        // the great barn
        ['room', 40, 10, 48, 22],                       // the horse barn
        ['room', 4, 8, 13, 16],                         // the farmhouse
      ], after: [
        ['cells', [[27, 21], [27, 7], [39, 16], [14, 12], [8, 17]], 'D'],
        ['cells', [[19, 14], [35, 12], [49, 16], [3, 12]], 'W'],
        // the organ on its cart, wagons stored in the barn, the horse barn's stalls, the farmhouse
        ['room', 25, 10, 29, 11, 'M'], ['cells', [[27, 12]], 'T'], ['room', 22, 16, 23, 18, 'C'], ['room', 31, 16, 32, 18, 'C'],
        ['room', 41, 11, 41, 21, 'K'], ['room', 47, 11, 47, 21, 'K'], ['cells', [[44, 12]], 'T'],
        ['cells', [[5, 9]], 'T'], ['cells', [[12, 15]], 'Y'], ['cells', [[9, 9]], 'H'],
        // the wagons in the yard, the hay, the troughs
        ['room', 16, 26, 18, 27, 'C'], ['room', 24, 26, 26, 27, 'C'], ['room', 32, 26, 34, 27, 'C'],
        ['cells', [[44, 28], [10, 24], [50, 6], [6, 32], [48, 34]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { level, mid } = kit;
    for (const [x, y] of [[27, 23], [38, 16], [14, 18], [27, 5]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 10, intensity: 0.75, color: [1, 0.85, 0.6], street: true });
  },
  start: { x: 20, y: 38, floor: 'G', yaw: 0 },
  zones: [
    { id: 'barn', label: 'Winter quarters - the great barn', at: [20, 8, 34, 20] },
    { id: 'horse', label: 'Winter quarters - the horse barn', at: [40, 10, 48, 22] },
    { id: 'house', label: 'Winter quarters - the farmhouse', at: [4, 8, 13, 16] },
    { id: 'hesse', label: 'The Hesse farm', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'eng', at: [27, 13, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer', name: 'The organ\'s stoker' },
    { id: 'b1', at: [24, 14, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'hb1', at: [44, 19, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'rad', at: [7, 11, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'fh1', at: [10, 13, 'G'], arms: 'carbine' },
    { id: 'yd1', at: [27, 24, 'G'], route: [[14, 24], [40, 24]], arms: 'carbine', dog: true },
    { id: 'yd2', at: [37, 6, 'G'], route: [[18, 5], [50, 5]], arms: 'carbine' },
  ],
  hostages: [{ id: 'lena', name: 'Lena Pask', she: true, at: [44, 14, 'G'] }],
  devices: [
    { id: 'c-yard', kind: 'camera', at: [19, 21, 'G'], face: [-1, 1], net: 'hesse' },
    { id: 'a-hesse', kind: 'alarm', at: [14, 9, 'G'], face: [1, 0], net: 'hesse' },
  ],
  terminals: [
    { id: 'sec', name: 'the farmhouse console', at: [5, 9, 'G'], face: [0, 1], time: 6, net: 'hesse' },
    { id: 'organ', name: 'the steam organ\'s transmitter', at: [27, 12, 'G'], face: [0, 1], time: 7, verb: 'Silence', doing: 'Silencing',
      said: 'Behind the organ\'s pipes, a transmitter keyed to its drum. Its valves come out in your hand. The organ will only play tunes now.' },
  ],
  intel: [
    { id: 'roll', at: [44, 12, 'G'], kind: 'Note', title: 'A note pinned in the horse barn', text: ['"Pask: to stay until she remembers what she owes us." Underneath, in a child\'s hand: "she owes us nothing".'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'organ', text: 'Silence the transmitter (the steam organ, the great barn)' },
    { id: 'o2', kind: 'rescue', ref: 'lena', text: 'Bring Lena Pask out (the horse barn)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
