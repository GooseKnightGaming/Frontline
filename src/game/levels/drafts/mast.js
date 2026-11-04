// FRONTLINE - Level 62, the Hesk Hill Transmitter (first draft, M6.79; built round holding a place - a reach with
// `hold`, and reserves that come in waves). Ghost has the five chiefs' names and faces. Now the city should hear
// them. The reds hold Radio Varnholm's transmitter on Hesk Hill; patch Ghost's tape into it and hold the transmitter
// hall while it plays - ninety seconds - however many of them come up the hill.
const W = 48, H = 40;
export default {
  id: 'mast', no: 62, title: 'The Hesk Hill Transmitter', place: 'Radio Varnholm\'s transmitter, Hesk Hill',
  where: 'The transmitter on Hesk Hill, above Varnholm. 06:55, five minutes before the morning news.',
  brief: [
    ['The job', 'Ghost has the five chiefs\' names and faces, and the city should hear them. The reds hold <b>Radio Varnholm\'s transmitter</b> on Hesk Hill. <b>Patch Ghost\'s tape</b> into it at the control room desk. Then <b>hold the transmitter hall</b> for the <b>ninety seconds</b> the tape runs. They will know at once, and they will come up the hill for you in waves. The seconds add up: step out and the count waits for you.'],
    ['The place', 'The transmitter building on the hilltop: the <b>transmitter hall</b> (the big valves, the north door), the <b>control room</b> and the studio south of it. The mast beside it. A guard hut by the road, and the gate at the bottom of the drive, south, where they will come from.'],
    ['Security', 'Guards on the hill and in the building, a camera on the drive, the alarm. The radio is in the guard hut, the engineer in the control room. The station\'s own night engineer is shut in the studio.'],
    ['Objectives', '<b>Patch the tape</b> into the transmitter (the control room). <b>Hold the transmitter hall</b> for ninety seconds. If you can, bring out the <b>night engineer</b> (the studio). Out over the north side of the hill.'],
  ],
  epilogue: {
    success: 'At seven o\'clock, instead of the news, Varnholm hears five names and what they have done. By noon there are crowds outside two of their houses. By evening the reds\' paper is printing a denial, which is the first time it has ever printed their names.',
    partial: 'Some of it went out before the transmitter went quiet. Enough for rumours, not enough for crowds.',
  },
  time: { date: [10, 2, 2027], hour: 6, minute: 55 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'wind',
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.25, 0.27, 0.33, 25, 190], ambient: [0.3, 0.31, 0.37] },
  extractName: 'the north side of the hill', extract: { x: 24, y: 1, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 4, wall: 'concrete2', wallTint: [0.72, 0.72, 0.7], floor: 'concrete', ceil: 'concrete2', lampPower: 0.7, lampColour: [0.95, 0.95, 1], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 16, 12, 32, 18],                       // the transmitter hall
        ['room', 16, 20, 24, 24],                       // the control room
        ['room', 26, 20, 32, 24],                       // the studio
        ['room', 4, 30, 10, 35],                        // the guard hut
      ], after: [
        // (walls a square out from each room; the three rooms share theirs)
        ['cells', [[24, 11], [20, 19], [29, 19], [20, 25], [29, 25], [11, 32]], 'D'],
        ['cells', [[19, 11], [29, 11], [15, 15], [33, 15], [15, 22], [33, 22], [7, 29]], 'W'],
        // the transmitter's valves and cabinets, the control desk, the studio
        ['room', 18, 14, 21, 15, 'M'], ['room', 27, 14, 30, 15, 'M'], ['cells', [[24, 17]], 'C'],
        ['room', 18, 21, 22, 21, 'K'], ['cells', [[23, 24]], 'T'],
        ['cells', [[28, 21], [31, 23]], 'T'], ['cells', [[27, 24]], 'H'],
        ['cells', [[6, 32], [9, 34]], 'T'],
        // the hillside: rocks and sandbags for cover on the way up, and round the building
        ['cells', [[12, 10], [36, 10], [12, 27], [36, 27], [18, 30], [30, 30], [24, 33], [14, 37], [34, 37], [40, 20], [8, 20]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the mast: a lattice tower beside the building, its lamp
    box([mid(38) - 0.5, 0, mid(15) - 0.5], [mid(38) + 0.5, 40, mid(15) + 0.5], 'metal', { tint: [0.75, 0.3, 0.2] });
    level.lights.push({ pos: [mid(38), 40.5, mid(15)], range: 12, intensity: 1.4, color: [1, 0.2, 0.15] });
    for (const [x, y] of [[24, 9], [24, 27], [10, 28], [24, 36]]) level.lights.push({ pos: [mid(x), 5, mid(y)], range: 14, intensity: 1, color: [0.95, 0.95, 1], street: true });
    level.signs.push({ pos: [mid(24), 4.5, 26 * C - 0.12], yaw: Math.PI, w: 3.8, h: 0.7, text: 'RADIO VARNHOLM', sub: 'Hesk Hill', col: '#22283a' });
  },
  start: { x: 24, y: 1, floor: 'G', yaw: Math.PI },
  zones: [
    { id: 'hall', label: 'Hesk Hill - the transmitter hall', at: [16, 12, 32, 18] },
    { id: 'ctl', label: 'Hesk Hill - the control room', at: [16, 20, 24, 24] },
    { id: 'studio', label: 'Hesk Hill - the studio', at: [26, 20, 32, 24] },
    { id: 'hut', label: 'Hesk Hill - the guard hut', at: [4, 30, 10, 35] },
    { id: 'hill', label: 'Hesk Hill', at: [0, 0, W - 1, H - 1] },
  ],
  reach: [
    { id: 'tx', name: 'The transmitter hall', at: [17, 13, 31, 17], hold: 90, after: 'patch',
      said: 'Ninety seconds. The tape has run, and all of Varnholm heard it.' },
  ],
  guards: [
    { id: 'eng', at: [22, 23, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'tx1', at: [24, 13, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'tx2', at: [30, 17, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'rad', at: [7, 33, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'h1', at: [24, 8, 'G'], route: [[10, 8], [38, 8]], arms: 'carbine', dog: true },
    { id: 'h2', at: [14, 20, 'G'], route: [[13, 10], [13, 28]], arms: 'carbine' },
    { id: 'h3', at: [35, 20, 'G'], route: [[35, 10], [35, 28]], arms: 'carbine' },
    { id: 'gt', at: [24, 37, 'G'], arms: 'carbine', temper: 'steady' },
    // the waves: up the drive from the gate, then round both sides, then over the top
    { id: 'w1a', at: [22, 38, 'G'], arms: 'carbine', reserve: true, wave: 1 }, { id: 'w1b', at: [26, 38, 'G'], arms: 'smg', reserve: true, wave: 1 },
    { id: 'w2a', at: [4, 38, 'G'], arms: 'carbine', reserve: true, wave: 2 }, { id: 'w2b', at: [44, 38, 'G'], arms: 'carbine', reserve: true, wave: 2 },
    { id: 'w2c', at: [44, 30, 'G'], arms: 'shotgun', reserve: true, wave: 2 },
    { id: 'w3a', at: [4, 4, 'G'], arms: 'smg', reserve: true, wave: 3 }, { id: 'w3b', at: [44, 4, 'G'], arms: 'carbine', reserve: true, wave: 3 },
    { id: 'w3c', at: [30, 2, 'G'], arms: 'dmr', rank: 'specialist', reserve: true, wave: 3 },
  ],
  hostages: [{ id: 'nighteng', name: 'The night engineer', at: [30, 22, 'G'] }],
  devices: [
    { id: 'c-drive', kind: 'camera', at: [25, 26, 'G'], face: [0, 1], net: 'hesk' },
    { id: 'a-hesk', kind: 'alarm', at: [15, 18, 'G'], face: [-1, 0], net: 'hesk' },
  ],
  terminals: [
    { id: 'sec', name: 'the guard hut console', at: [6, 32, 'G'], face: [0, 1], time: 6, net: 'hesk' },
    { id: 'patch', name: 'the control desk', at: [17, 23, 'G'], face: [1, 0], time: 8, verb: 'Patch in', doing: 'Patching',
      said: 'Ghost\'s tape is in and the transmitter takes it. Now hold the transmitter hall while it runs: ninety seconds.' },
  ],
  intel: [
    { id: 'log', at: [23, 24, 'G'], kind: 'Log', title: 'The transmitter log', text: ['Every bulletin approved by the Office before it goes out. The morning news "to be read as written".', 'The night engineer has written in the margin: "Read as written. Written by whom?"'] },
    { id: 'post', at: [9, 34, 'G'], kind: 'Orders', title: 'Orders for the guard hut', text: ['If the transmitter is interfered with, the gate calls the barracks. Twenty men, ten minutes.', 'Somebody has added: "Twenty if they are sober."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'patch', text: 'Patch the tape into the transmitter (the control room)' },
    { id: 'o2', kind: 'reach', ref: 'tx', text: 'Hold the transmitter hall while the tape runs' },
    { id: 'o3', kind: 'rescue', ref: 'nighteng', text: 'Bring out the night engineer (the studio)', optional: true },
  ],
};
