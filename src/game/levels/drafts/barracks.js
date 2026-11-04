// FRONTLINE - Level 41, the Barracks (first draft, M6.30). From Rhys's location boards (part 2): "training
// barracks". Camp Dravik, where the reds train their own special forces: four barrack huts round a parade
// ground, the mess hall, the armoury, the headquarters hut, the assault course and the firing range - and a
// watchtower over it all. Dawn, reveille not yet sounded. Mostly in the open: dogs, a marksman in the tower,
// patrols, a reserve in the guardroom by the gate.
const W = 64, H = 56;
const hut = (x0, y0, x1, y1) => ['room', x0, y0, x1, y1];
export default {
  id: 'barracks', no: 41, title: 'The Barracks', place: 'Camp Dravik',
  where: 'Camp Dravik, the reds\' training camp in the pine forest. 05:10, first light, reveille at half past.',
  brief: [
    ['The place', 'A fenced camp in the forest. Round the <b>parade ground</b> (the middle): four <b>barrack huts</b> (west), the <b>mess hall</b> (north), the <b>armoury</b> (east - maglocked), the <b>headquarters hut</b> (south-east - its office maglocked). The <b>assault course</b> (north-west) and the <b>firing range</b> (north-east) beyond; the <b>watchtower</b> by the parade ground; the guardroom at the gate (south).'],
    ['The reds', 'Most still asleep in the huts - leave them be, and they stay that way. Awake: the patrols, two <b>dog handlers</b>, a <b>marksman</b> in the watchtower who moves when he gives himself away, the guardroom (a <b>radio</b>), the armourer (an <b>engineer</b>). If it goes loud, the guardroom\'s <b>reserve</b> turns out - and the alarm wakes the huts.'],
    ['Objectives', 'Photograph the <b>training plans</b> in the headquarters office (hack the planning terminal). Take the <b>prototype rifle</b> from the armoury. Optionally, get out with no one sounding the alarm.'],
  ],
  // (M6.82) how it ends (the debrief; the case board's story so far)
  epilogue: {
    success: "Camp Dravik's rolls and training plans go to Ghost, and the reds' special forces have no secrets left about who they are or what they train for.",
    partial: "Part of what was wanted at Dravik. Their instructors will rewrite the plans.",
  },
  time: { date: [12, 12, 2026], hour: 5, minute: 10 }, faction: 'red', requires: 'HACKKIT',
  atmos: { fog: [0.55, 0.6, 0.66, 40, 260], ambient: [0.42, 0.45, 0.52] },
  extractName: 'the forest track, south',
  outside: { backdrop: 'woods', mat: 'grass', margin: 16 },
  floors: {
    G: {
      y: 0, wallH: 3.0, wall: 'wood', wallTint: [0.55, 0.48, 0.38], floor: 'wood', floorTint: [0.6, 0.5, 0.38], ceil: 'wood', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 8,
      carve: { size: [W, H], ops: [
        hut(6, 16, 15, 20), hut(6, 22, 15, 26), hut(6, 28, 15, 32), hut(6, 34, 15, 38),     // the barrack huts
        hut(22, 6, 40, 12),                                                              // the mess hall
        hut(48, 18, 56, 26),                                                             // the armoury
        hut(46, 34, 56, 42),                                                             // the headquarters hut
        hut(28, 46, 34, 50),                                                             // the guardroom by the gate
      ], after: [
        ['cells', [[16, 18], [16, 24], [16, 30], [16, 36], [31, 13], [47, 22], [51, 33], [31, 45]], 'D'],
        ['cells', [[10, 15], [10, 21], [10, 27], [10, 33], [26, 5], [36, 5], [57, 21], [57, 38]], 'W'],
        ['cells', [[8, 17], [12, 17], [8, 19], [12, 19], [8, 23], [12, 23], [8, 25], [12, 25], [8, 29], [12, 29], [8, 31], [12, 31], [8, 35], [12, 35], [8, 37], [12, 37]], 'Y'],   // bunks
        ['room', 24, 8, 30, 8, 'T'], ['room', 33, 8, 38, 8, 'T'], ['room', 24, 11, 30, 11, 'T'], ['room', 33, 11, 38, 11, 'K'],   // the mess's tables, its servery
        ['cells', [[49, 19], [51, 19], [53, 19], [55, 19], [49, 25], [51, 25], [53, 25], [55, 25]], 'H'],    // the armoury's racks
        ['cells', [[48, 36], [52, 36]], 'T'], ['cells', [[55, 40]], 'H'], ['room', 46, 38, 56, 38, '#'], ['cell', 50, 38, 'D'],   // HQ: the front office; the planning office behind
        ['cells', [[30, 48]], 'T'],
        // outside: the parade ground's edge, the assault course (walls to vault, logs), the range's butts, sandbags
        ['cells', [[4, 4], [6, 6], [8, 4], [10, 6], [12, 4], [14, 6]], 'w'], ['cells', [[5, 9], [9, 9], [13, 9]], 'r'],
        ['cells', [[46, 4], [48, 4], [50, 4], [52, 4], [54, 4], [56, 4]], 'w'], ['cells', [[44, 10], [58, 10]], 'C'],
        ['cells', [[24, 22], [24, 30], [38, 22], [38, 30], [20, 40], [42, 44]], 'C'], ['cells', [[44, 30], [26, 40]], 'B'],
        ['cells', [[18, 4], [19, 4], [20, 4]], 'v'],
        ['cells', [[2, 12], [3, 20], [2, 28], [3, 44], [60, 14], [61, 30], [60, 48], [20, 52], [44, 52], [5, 50], [58, 52]], 't'],
      ] },
    },
    T: { y: 6.0, wallH: 1.2, roof: false, lamps: false, floor: 'wood', floorTint: [0.5, 0.42, 0.32],
      carve: { size: [W, H], walls: false, ops: [['room', 40, 13, 43, 16, '.'], ['room', 40, 13, 43, 13, '='], ['room', 40, 13, 40, 16, '='], ['room', 43, 13, 43, 16, '=']] } },   // (open at its south side, where the ladder comes up)
  },
  ladders: [{ x: 41, y: 17, from: 'G', to: 'T', back: [0, -1], off: [41, 15] }],
  start: { x: 31, y: 55, floor: 'G', yaw: 0 },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the camp's fence (the gate by the guardroom), the watchtower's legs and roof, the parade ground, the flagpole
    for (const [x0, x1] of [[1, 27], [36, 62]]) box([x0 * C, 0, 44 * C], [x1 * C, 2.6, 44 * C + 0.08], 'metal', { tint: [0.4, 0.42, 0.4], shootThrough: true });
    box([1 * C, 0, 1 * C], [1 * C + 0.08, 2.6, 44 * C], 'metal', { tint: [0.4, 0.42, 0.4], shootThrough: true });
    box([62 * C, 0, 1 * C], [62 * C + 0.08, 2.6, 44 * C], 'metal', { tint: [0.4, 0.42, 0.4], shootThrough: true });
    box([1 * C, 0, 1 * C], [62 * C, 2.6, 1 * C + 0.08], 'metal', { tint: [0.4, 0.42, 0.4], shootThrough: true });
    for (const [x, z] of [[40, 13], [43.9, 13], [40, 16.9], [43.9, 16.9]]) box([x * C, 0, z * C], [x * C + 0.15, 6.0, z * C + 0.15], 'wood', { tint: [0.4, 0.32, 0.22] });
    box([40 * C - 0.3, 8.2, 13 * C - 0.3], [44 * C + 0.3, 8.4, 17 * C + 0.3], 'wood', { tint: [0.35, 0.28, 0.2], solid: false });
    box([20 * C, 0, 16 * C], [40 * C, 0.02, 32 * C], 'concrete2', { solid: false, tint: [0.62, 0.62, 0.6] });
    box([mid(30) - 0.06, 0, mid(24) - 0.06], [mid(30) + 0.06, 9, mid(24) + 0.06], 'metal', { tint: [0.8, 0.8, 0.8] });
    box([mid(30) + 0.06, 7.6, mid(24) - 0.02], [mid(30) + 1.4, 8.5, mid(24) + 0.02], 'paint', { solid: false, tint: [0.75, 0.12, 0.1] });
    level.lights.push({ pos: [mid(41.5), 7.6, mid(14.5)], range: 26, intensity: 1.1, color: [1, 0.95, 0.85], street: true });
  },
  zones: [
    { id: 'tower', label: 'Camp Dravik - the watchtower', at: [40, 13, 43, 16], floor: 'T' },
    { id: 'huts', label: 'Camp Dravik - the barrack huts', at: [6, 16, 15, 38] },
    { id: 'mess', label: 'Camp Dravik - the mess hall', at: [22, 6, 40, 12] },
    { id: 'armoury', label: 'Camp Dravik - the armoury', at: [48, 18, 56, 26] },
    { id: 'hqoffice', label: 'Camp Dravik - the planning office', at: [46, 39, 56, 42] },
    { id: 'hq', label: 'Camp Dravik - the headquarters hut', at: [46, 34, 56, 42] },
    { id: 'gate', label: 'Camp Dravik - the guardroom', at: [28, 46, 34, 50] },
    { id: 'parade', label: 'Camp Dravik - the parade ground', at: [18, 14, 44, 34] },
    { id: 'course', label: 'Camp Dravik - the assault course', at: [2, 2, 17, 12] },
    { id: 'range', label: 'Camp Dravik - the firing range', at: [44, 2, 60, 12] },
    { id: 'camp', label: 'Camp Dravik', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    // asleep in the huts (sat on their bunks - they wake to the alarm)
    { id: 's1', at: [9, 18, 'G'], arms: 'carbine', temper: 'steady' }, { id: 's2', at: [11, 24, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 's3', at: [9, 30, 'G'], arms: 'smg', temper: 'steady' }, { id: 's4', at: [11, 36, 'G'], arms: 'carbine', temper: 'steady' },
    // awake
    { id: 'p1', at: [20, 20, 'G'], route: [[19, 15], [19, 39], [43, 39], [43, 15]], arms: 'carbine', dog: true },
    { id: 'p2', at: [59, 20, 'G'], route: [[59, 6], [59, 41]], arms: 'carbine', dog: true },
    { id: 'p3', at: [30, 14, 'G'], route: [[22, 14], [40, 14]], arms: 'smg' },
    { id: 'tw', at: [41, 14, 'T'], arms: 'dmr', rank: 'specialist', temper: 'steady', perches: [[41, 14, 'T'], [42, 16, 'T'], [40, 15, 'T']] },
    { id: 'cook', at: [35, 10, 'G'], arms: 'pistol', temper: 'cowardly', role: 'medic' },
    { id: 'arm', at: [52, 22, 'G'], arms: 'pistol', temper: 'steady', role: 'engineer' },
    { id: 'off', at: [52, 41, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'Colonel Raske', card: 'dravik' },
    { id: 'clerk', at: [49, 35, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'gd', at: [31, 48, 'G'], arms: 'carbine', rank: 'sergeant', temper: 'steady', role: 'radio' },
    { id: 'rv1', at: [29, 47, 'G'], arms: 'carbine', reserve: true }, { id: 'rv2', at: [33, 47, 'G'], arms: 'smg', reserve: true },
    { id: 'rv3', at: [29, 49, 'G'], arms: 'carbine', reserve: true }, { id: 'rv4', at: [33, 49, 'G'], arms: 'shotgun', reserve: true },
  ],
  pickups: [{ id: 'rifle', name: 'The prototype rifle', what: 'the rifle', at: [52, 24, 'G'], h: 0.9, colour: [0.25, 0.27, 0.3] }],
  devices: [
    { id: 'c-armoury', kind: 'camera', at: [48, 18, 'G'], face: [1, 1], net: 'dravik' },
    { id: 'c-hq', kind: 'camera', at: [46, 34, 'G'], face: [1, 1], net: 'dravik' },
    { id: 'm-armoury', kind: 'lock', at: [47, 22, 'G'], net: 'dravik' },
    { id: 'm-office', kind: 'lock', at: [50, 38, 'G'], net: 'dravik' },
    { id: 'l-hq', kind: 'lights', at: [56, 35, 'G'], face: [-1, 0], area: [46, 34, 56, 42], name: 'the headquarters hut', net: 'dravik' },
    { id: 'a-camp', kind: 'alarm', at: [31, 49, 'G'], face: [0, -1], net: 'dravik' },
  ],
  terminals: [
    { id: 'sec', name: 'the guardroom\'s console', at: [33, 48, 'G'], face: [-1, 0], time: 6, net: 'dravik' },
    { id: 'plans', name: 'the planning terminal', at: [48, 41, 'G'], face: [0, -1], time: 8, reveal: 25, verb: 'Photograph the plans on', doing: 'Photographing',
      said: 'The training plans: who they are training, for what, and when it is to be. The camp\'s radios put every red on your radar for 25 seconds.' },
  ],
  // (M6.59) papers to read: lore, not needed to finish
  intel: [
    { id: "mess", at: [24, 8, "G"], kind: "Notice", title: "Notice - the mess hall", text: ["The strike company will parade at 05:00 on the twenty-first, full kit.", "Destination will be given on the trucks. No letters home this week."] },
    { id: "schedule", at: [48, 36, "G"], kind: "Schedule", title: "Training schedule - the HQ office", text: ["Week 1: drills. Week 2: the course, by night. Week 3: \"the lodge exercise\" - to be run as if for real.", "Signed for the council. The signature is a single initial."] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'plans', text: 'Photograph the training plans (the headquarters hut\'s planning office)' },
    { id: 'o2', kind: 'take', ref: 'rifle', text: 'Take the prototype rifle (the armoury)' },
  ],
};
