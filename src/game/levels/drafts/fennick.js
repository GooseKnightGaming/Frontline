// FRONTLINE - Level 92, Fennick's Pass (first draft, M6.114; THE WINTER ROAD, second). The navigator's chart ended at
// Fennick's Pass: the old mule track over the Skarn, the only way north the reds do not drive. They watch it all the
// same, from the old fort halfway up, whose floodlights cover the track. Take the fort's sector map - it shows every
// post the reds have on the mountain - and get the flight bag over to the far side of the pass. The floodlights are
// on the fort's console: put them out, and the reds on the track see only what is close.
const W = 72, H = 26;
export default {
  id: 'fennick', no: 92, title: 'Fennick\'s Pass', place: 'Fennick\'s Pass, over the Skarn',
  where: 'Fennick\'s Pass, over the Skarn. 23:40, hard frost, the fort\'s floodlights on the track.',
  brief: [
    ['The job', 'The navigator\'s chart ended at <b>Fennick\'s Pass</b>: the old mule track over the Skarn, the only way north the reds do not drive. They watch it all the same, from the <b>old fort</b> halfway up. Take the fort\'s <b>sector map</b>, which shows every post the reds have on the mountain. Get the flight bag over to the <b>far side of the pass</b>. If you can, <b>without the alarm</b>.'],
    ['The place', 'One track up the pass between walls of rock. The <b>fort</b> sits on its north side, halfway along, with its <b>floodlights</b> on the track. There is a <b>checkpoint</b> of sandbags further on, and past that the far side. You have <b>night vision</b>.'],
    ['Security', 'The fort\'s camera, its alarm, and the <b>floodlights</b>, all on the console inside the fort, with the radio and the engineer. Put the floodlights out, and the reds on the track see only what is close. A marksman watches the far end from the rocks.'],
    ['Objectives', 'Take the <b>sector map</b> (the fort). <b>Reach the far side</b> of the pass (the east end). If you can, <b>without the alarm</b>.'],
  ],
  epilogue: {
    success: 'The flight bag goes over Fennick\'s Pass on a mule called Ottilie, and the sector map shows Ghost every red post on the Skarn. The fort\'s floodlights come back on at two, over an empty track.',
    partial: 'Over the pass, but the fort knows someone went by. The reds will be on the mule tracks by morning.',
  },
  time: { date: [12, 5, 2027], hour: 23, minute: 40 }, night: true, dark: true, startGear: 'NVG', faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'NVG', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.06, 0.07, 0.1, 30, 200], ambient: [0.18, 0.19, 0.24] },
  extractName: 'the far side of the pass', extract: { x: 70, y: 17, floor: 'G', van: [-1, 4] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 12 },
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'concrete2', wallTint: [0.6, 0.58, 0.55], floor: 'concrete', ceil: 'concrete2', lampPower: 0.6, lampColour: [0.95, 0.95, 1], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 30, 5, 40, 10],                        // the fort
      ], after: [
        // the pass's rock walls
        ['room', 0, 0, W - 1, 1, 'J'], ['room', 0, 24, W - 1, 25, 'J'],
        ['cells', [[35, 11], [29, 8]], 'D'], ['cells', [[33, 4], [37, 4], [41, 7]], 'W'],
        ['cells', [[31, 6]], 'T'], ['cells', [[39, 9]], 'T'], ['cells', [[36, 6]], 'M'],
        // the checkpoint's sandbags, the track's boulders
        ['cells', [[50, 13], [50, 14], [50, 21], [50, 22]], 'C'],
        ['cells', [[8, 20], [16, 13], [24, 21], [44, 18], [58, 14], [62, 21], [12, 4], [54, 5], [22, 6]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    box([0, 0, 0], [W * C, 14, 2 * C], 'concrete2', { tint: [0.45, 0.45, 0.48] });
    box([0, 0, 24 * C], [W * C, 14, H * C], 'concrete2', { tint: [0.45, 0.45, 0.48] });
    for (const [x, y] of [[35, 12], [50, 17]]) level.lights.push({ pos: [mid(x), 4, mid(y)], range: 12, intensity: 0.9, color: [0.95, 0.95, 1], street: true });
  },
  start: { x: 2, y: 17, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'fort', label: 'Fennick\'s Pass - the fort', at: [30, 5, 40, 10] },
    { id: 'check', label: 'Fennick\'s Pass - the checkpoint', at: [46, 12, 56, 23] },
    { id: 'pass', label: 'Fennick\'s Pass', at: [0, 0, W - 1, H - 1] },
  ],
  reach: [{ id: 'far', name: 'The far side of the pass', at: [64, 12, 71, 23] }],
  guards: [
    { id: 'off', at: [33, 8, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady' },
    { id: 'rad', at: [34, 6, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [38, 7, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'gate', at: [35, 13, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 't1', at: [30, 15, 'G'], route: [[20, 15], [44, 15]], arms: 'carbine' },
    { id: 't2', at: [34, 20, 'G'], route: [[24, 20], [46, 20]], arms: 'carbine', dog: true },
    { id: 'k1', at: [52, 15, 'G'], arms: 'carbine', temper: 'steady', yaw: Math.PI / 2 },
    { id: 'k2', at: [52, 20, 'G'], arms: 'smg', temper: 'bold', yaw: Math.PI / 2 },
    { id: 'sn', at: [60, 13, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady', yaw: Math.PI / 2 },
  ],
  pickups: [{ id: 'map', name: 'The sector map', what: 'the sector map', at: [39, 9, 'G'], table: true, colour: [0.85, 0.8, 0.6] }],
  devices: [
    { id: 'c-fort', kind: 'camera', at: [29, 11, 'G'], face: [-1, 1], net: 'pass' },
    { id: 'l-track', kind: 'lights', at: [38, 11, 'G'], face: [0, 1], area: [20, 12, 52, 23], name: 'the track', net: 'pass' },
    { id: 'a-fort', kind: 'alarm', at: [41, 9, 'G'], face: [1, 0], net: 'pass' },
  ],
  terminals: [{ id: 'sec', name: 'the fort\'s console', at: [31, 6, 'G'], face: [0, 1], time: 6, net: 'pass' }],
  intel: [
    { id: 'roster', at: [36, 6, 'G'], kind: 'Roster', title: 'The fort\'s watch roster', text: ['Floodlights on from dusk. "The mule men have not used Fennick\'s since the war. Watch it anyway."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'map', text: 'Take the sector map (the fort)' },
    { id: 'o2', kind: 'reach', ref: 'far', text: 'Reach the far side of the pass (the east end)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
