// FRONTLINE - Level 70, the Relay Peaks (first draft, M6.89; the end of the camps). Ghost means to empty the rest of
// the north's camps in one night, and the camps' guards would call the army back over three radio relays on the
// Kessock ridge. Cut all three - west, middle and east - before the night's first raids go in, six minutes from now.
const W = 64, H = 42;
export default {
  id: 'relays', no: 70, title: 'The Relay Peaks', place: 'the Kessock ridge, in the north',
  where: 'The Kessock ridge. 00:50, clear, cold, the stars out. The raids go in at 00:56.',
  brief: [
    ['The job', 'Tonight Ghost empties the rest of the north\'s camps, all at once. The camps\' guards would call the army back over <b>three radio relays</b> on the Kessock ridge. <b>Cut all three</b>: the <b>west</b>, the <b>middle</b> and the <b>east</b> relay hut. The raids go in at 00:56, so if you can, have all three cut <b>inside six minutes</b>. Hale and Moss are with you.'],
    ['The place', 'A bare ridge, with rocks for cover and not much else. The middle hut is just above you to the north, and the west and east huts are out along the ridge. It is all in the open, under a sky full of stars.'],
    ['Security', 'A camera on each hut and the alarm on the middle one. The radio and the console are in the middle hut, the engineer in the east hut. Each hut has its men, and patrols walk the ridge between them.'],
    ['Objectives', 'Cut the <b>west</b>, <b>middle</b> and <b>east</b> relays. If you can, do it <b>inside six minutes</b>. Back down the ridge, south.'],
  ],
  epilogue: {
    success: 'At 00:56 the raids go in on nine camps at once, and not one of their telephones or radios reaches anyone. By morning the north\'s camps are empty and the army is still asleep in its barracks.',
    partial: 'Some of the relays stayed up. At two of the camps the army came, and Ghost had to leave people behind.',
  },
  time: { date: [26, 2, 2027], hour: 0, minute: 50 }, night: true, faction: 'red', requires: 'HACKKIT',
  relations: { red: { you: true, ghost: true }, ghost: { you: false, red: true } },
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.14, 0.16, 0.22, 40, 260], ambient: [0.26, 0.28, 0.36] },
  extractName: 'down the ridge, south', extract: { x: 32, y: 40, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'grass', margin: 16 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'concrete2', wallTint: [0.6, 0.6, 0.58], floor: 'concrete', ceil: 'concrete2', lampPower: 0.6, lampColour: [0.95, 0.95, 1], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 6, 6, 12, 10],                         // the west relay hut
        ['room', 29, 22, 35, 26],                       // the middle relay hut
        ['room', 51, 6, 57, 10],                        // the east relay hut
      ], after: [
        ['cells', [[9, 11], [32, 27], [54, 11]], 'D'],
        ['cells', [[5, 8], [13, 8], [28, 24], [36, 24], [50, 8], [58, 8]], 'W'],
        ['cells', [[7, 7], [11, 9]], 'T'], ['cells', [[30, 23], [34, 25]], 'T'], ['cells', [[52, 7], [56, 9]], 'T'],
        ['cells', [[11, 7]], 'M'], ['cells', [[34, 23]], 'M'], ['cells', [[56, 7]], 'M'],
        // the ridge's rocks
        ['cells', [[20, 30], [26, 33], [38, 33], [44, 30], [16, 18], [24, 14], [40, 14], [48, 18], [8, 22], [56, 22], [14, 4], [50, 3], [32, 12], [20, 8], [44, 8], [32, 35]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid } = kit;
    // the relay masts over the huts, a red lamp each
    for (const [x, y] of [[9, 8], [32, 24], [54, 8]]) {
      box([mid(x) - 0.25, 3, mid(y) - 0.25], [mid(x) + 0.25, 16, mid(y) + 0.25], 'metal', { tint: [0.6, 0.6, 0.62] });
      level.lights.push({ pos: [mid(x), 16.5, mid(y)], range: 10, intensity: 1.3, color: [1, 0.2, 0.15] });
      level.lights.push({ pos: [mid(x), 4, mid(y) + 5], range: 10, intensity: 0.8, color: [0.95, 0.95, 1], street: true });
    }
  },
  start: { x: 32, y: 40, floor: 'G', yaw: 0 },
  zones: [
    { id: 'west', label: 'The Kessock ridge - the west relay', at: [6, 6, 12, 10] },
    { id: 'mid', label: 'The Kessock ridge - the middle relay', at: [29, 22, 35, 26] },
    { id: 'east', label: 'The Kessock ridge - the east relay', at: [51, 6, 57, 10] },
    { id: 'ridge', label: 'The Kessock ridge', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'hale', at: [31, 41, 'G'], faction: 'ghost', ally: true, name: 'Hale', arms: 'carbine', temper: 'steady', tint: [0.45, 0.6, 1.35] },
    { id: 'moss', at: [33, 41, 'G'], faction: 'ghost', ally: true, name: 'Moss', arms: 'smg', temper: 'bold', tint: [0.4, 0.55, 1.3] },
    { id: 'rad', at: [31, 25, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'm1', at: [33, 29, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'w1', at: [9, 9, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'w2', at: [9, 13, 'G'], arms: 'smg', temper: 'bold' },
    { id: 'eng', at: [54, 9, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'e1', at: [54, 13, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'r1', at: [20, 20, 'G'], route: [[12, 15], [25, 20]], arms: 'carbine', dog: true },
    { id: 'r2', at: [44, 20, 'G'], route: [[39, 20], [52, 15]], arms: 'carbine' },
    { id: 'r3', at: [32, 8, 'G'], route: [[16, 6], [48, 6]], arms: 'smg' },
  ],
  devices: [
    { id: 'c-west', kind: 'camera', at: [13, 11, 'G'], face: [1, 1], net: 'kessock' },
    { id: 'c-mid', kind: 'camera', at: [36, 27, 'G'], face: [1, 1], net: 'kessock' },
    { id: 'c-east', kind: 'camera', at: [50, 11, 'G'], face: [-1, 1], net: 'kessock' },
    { id: 'a-ridge', kind: 'alarm', at: [28, 26, 'G'], face: [-1, 0], net: 'kessock' },
  ],
  terminals: [
    { id: 'sec', name: 'the middle hut\'s console', at: [30, 23, 'G'], face: [0, 1], time: 6, net: 'kessock' },
    { id: 'rw', name: 'the west relay', at: [11, 9, 'G'], face: [0, -1], time: 6, verb: 'Cut', doing: 'Cutting', said: 'The west relay is dead.' },
    { id: 'rm', name: 'the middle relay', at: [34, 25, 'G'], face: [0, -1], time: 6, verb: 'Cut', doing: 'Cutting', said: 'The middle relay is dead.' },
    { id: 're', name: 'the east relay', at: [56, 9, 'G'], face: [0, -1], time: 6, verb: 'Cut', doing: 'Cutting', said: 'The east relay is dead.' },
  ],
  intel: [
    { id: 'log', at: [7, 7, 'G'], kind: 'Log', title: 'The west hut\'s log', text: ['Signals from the camps: nightly, "all quiet". Signals to the army: none for a month.', 'Someone has written: "They will not believe us when it is not quiet."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'rw', text: 'Cut the west relay' },
    { id: 'o2', kind: 'hack', ref: 'rm', text: 'Cut the middle relay' },
    { id: 'o3', kind: 'hack', ref: 're', text: 'Cut the east relay' },
    { id: 'o4', kind: 'quick', secs: 360, text: 'All three inside six minutes', optional: true },
  ],
};
