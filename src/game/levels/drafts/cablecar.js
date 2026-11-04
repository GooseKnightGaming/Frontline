// FRONTLINE - Level 118, the Mountain (first draft, M6.140; the end of THE BANKER). Mr Dancourt has gone up the mountain
// to his house above the snow line, by the cable car, to think. Ride the last car up. Stop the winding gear at the top
// station, so that nobody comes up after you and nobody takes him down, and take Dancourt alive in his study.
const W = 56, H = 40;
export default {
  id: 'cablecar', no: 118, title: 'The Mountain', place: 'the Lessar mountain, above the snow line',
  where: 'The top station of the Lessar cable car. 21:10, snow, the last car swinging in.',
  brief: [
    ['The job', 'Mr Dancourt has gone up the mountain to his <b>house above the snow line</b>, by the cable car, to think. Ride the last car up. <b>Stop the winding gear</b> at the top station, so that nobody comes up after you and nobody takes him down. <b>Take Dancourt alive</b> in his study. If you can, <b>without the alarm</b>.'],
    ['The place', 'The <b>top station</b> is on the west side, where the car comes in, with the <b>gear house</b> beside it. The path climbs east through the snow to <b>Dancourt\'s chalet</b>: the hall, and his <b>study</b> beyond it. The guardhouse is below the chalet, south.'],
    ['Security', 'A camera on the path and the chalet\'s alarm, both on the guardhouse console with the radio. The engineer is in the gear house. Dancourt\'s men walk the path and the terrace, and one stands at his study door.'],
    ['Objectives', '<b>Stop the winding gear</b> (the gear house). <b>Take Dancourt alive</b> (his study). If you can, <b>without the alarm</b>. Back to the car, west.'],
  ],
  epilogue: {
    success: 'The cable car comes down the mountain at midnight with Mr Dancourt in it, under Ghost\'s coat. His bank, his index and Kray\'s book do the rest. By Christmas there is not a franc of the north\'s rifles left anywhere a banker can reach.',
    partial: 'Dancourt stayed on the mountain, or somebody came up after you. He will have his lawyers by morning.',
  },
  time: { date: [12, 8, 2027], hour: 21, minute: 10 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'snow',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.5, 0.52, 0.58, 25, 170], ambient: [0.4, 0.42, 0.48] },
  extractName: 'the cable car, west', extract: { x: 2, y: 20, floor: 'G', van: [0, 8] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'wood', wallTint: [0.6, 0.45, 0.32], floor: 'wood', ceil: 'wood', lampPower: 0.55, lampColour: [1, 0.85, 0.6], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 6, 16, 14, 24],                        // the top station
        ['room', 6, 6, 12, 12],                         // the gear house
        ['room', 30, 10, 37, 20],                       // the chalet's hall
        ['room', 39, 10, 46, 20],                       // the study
        ['room', 30, 26, 36, 30],                       // the guardhouse
      ], after: [
        ['cells', [[5, 20], [15, 20], [9, 13], [29, 15], [38, 15], [33, 25], [33, 21]], 'D'],
        ['cells', [[10, 25], [33, 9], [42, 9], [47, 15], [37, 28]], 'W'],
        ['room', 7, 17, 7, 23, 'K'], ['cells', [[12, 17]], 'T'],
        ['cells', [[8, 8]], 'M'], ['cells', [[11, 7]], 'T'],
        ['room', 31, 11, 31, 14, 'H'], ['cells', [[34, 18]], 'T'], ['cells', [[36, 11]], 'Y'],
        ['cells', [[44, 12]], 'T'], ['room', 45, 16, 45, 19, 'H'], ['cells', [[41, 19]], 'Y'],
        ['cells', [[31, 27]], 'T'], ['cells', [[35, 29]], 'Y'],
        // the path's pines and rocks in the snow
        ['cells', [[20, 14], [24, 22], [18, 28], [26, 8], [48, 26], [50, 8], [40, 32], [22, 34], [12, 32]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the cable, running off west from the station's roof, and the car's pylon
    box([-12 * C, 4.6, mid(20) - 0.04], [6 * C, 4.68, mid(20) + 0.04], 'metal', { tint: [0.3, 0.3, 0.3], solid: false });
    box([mid(3) - 1.2, 0.4, mid(20) - 1.4], [mid(3) + 1.2, 2.6, mid(20) + 1.4], 'paint', { tint: [0.75, 0.2, 0.15], solid: false });
    for (const [x, y] of [[16, 20], [28, 15], [34, 23], [10, 14]]) level.lights.push({ pos: [mid(x), 3.6, mid(y)], range: 10, intensity: 0.75, color: [1, 0.85, 0.6], street: true });
  },
  start: { x: 3, y: 20, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'station', label: 'The Mountain - the top station', at: [6, 16, 14, 24] },
    { id: 'gear', label: 'The Mountain - the gear house', at: [6, 6, 12, 12] },
    { id: 'hall', label: 'The Mountain - the chalet\'s hall', at: [30, 10, 37, 20] },
    { id: 'study', label: 'The Mountain - Dancourt\'s study', at: [39, 10, 46, 20] },
    { id: 'guard', label: 'The Mountain - the guardhouse', at: [30, 26, 36, 30] },
    { id: 'peak', label: 'The Lessar mountain', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'dancourt', at: [43, 14, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Mr Ivo Dancourt', tint: [0.4, 0.35, 0.3] },
    { id: 'sd', at: [36, 15, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'hl1', at: [33, 13, 'G'], arms: 'pistol' },
    { id: 'st1', at: [11, 20, 'G'], arms: 'carbine', temper: 'steady', name: 'The station attendant' },
    { id: 'eng', at: [10, 10, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'rad', at: [33, 28, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'pt1', at: [22, 18, 'G'], route: [[18, 18], [27, 18]], arms: 'carbine' },
    { id: 'pt2', at: [40, 24, 'G'], route: [[28, 23], [50, 23]], arms: 'carbine', dog: true },
  ],
  devices: [
    { id: 'c-path', kind: 'camera', at: [29, 21, 'G'], face: [-1, 1], net: 'peak' },
    { id: 'a-peak', kind: 'alarm', at: [37, 25, 'G'], face: [1, 0], net: 'peak' },
  ],
  terminals: [
    { id: 'sec', name: 'the guardhouse console', at: [31, 27, 'G'], face: [0, 1], time: 6, net: 'peak' },
    { id: 'gear', name: 'the winding gear\'s brake', at: [11, 7, 'G'], face: [0, 1], time: 5, verb: 'Stop', doing: 'Stopping',
      said: 'The winding gear groans and stops. Nothing goes up or down the Lessar mountain now until Ghost says so.' },
  ],
  intel: [
    { id: 'will', at: [44, 12, 'G'], kind: 'Letter', title: 'A letter on Dancourt\'s desk', text: ['To his son: "Whatever they say of me, I only ever counted other people\'s money. That is what a banker is for." Unfinished.'] },
    { id: 'timetable', at: [12, 17, 'G'], kind: 'Timetable', title: 'The cable car\'s timetable', text: ['Last car up 21:00. Last car down 21:30. Pencilled under it: "Mr D. - car held at the top all night."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'gear', text: 'Stop the winding gear (the gear house)' },
    { id: 'o2', kind: 'capture', ref: 'dancourt', text: 'Take Dancourt alive (his study)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
