// FRONTLINE - Level 101, the Skerries (first draft, M6.123; the start of THE ISLANDS). Hollen is free, but the garrison's
// commander got away by sea to the Skerry islands, where the reds still hold the strait: a radar station on the outer
// skerry watches every boat that tries it. Take Ghost's boat across at night, blind the radar so that Ghost's boats can
// follow, and bring back the station's codebook.
const W = 72, H = 40;
export default {
  id: 'skerries', no: 101, title: 'The Skerries', place: 'the Skerry islands, off Hollen',
  where: 'The Skerry strait. 00:50, a long swell, the radar turning on the outer skerry.',
  brief: [
    ['The job', 'Hollen is free, but the garrison\'s <b>commander</b> got away by sea to the <b>Skerry islands</b>, where the reds still hold the strait. A <b>radar station</b> on the outer skerry watches every boat that tries to cross. Take <b>Ghost\'s boat</b> across. <b>Blind the radar</b>, so that Ghost\'s boats can follow. Bring back the station\'s <b>codebook</b>. If you can, <b>without the alarm</b>.'],
    ['The place', 'The mainland jetty is west, with Ghost\'s boat beside it. The <b>strait</b> lies between, with a red <b>patrol launch</b> going round it. On the skerry, east, are the <b>radar station</b> and the crew\'s hut south of it, where the codebook is kept.'],
    ['Security', 'A camera on the station and its alarm, both on the station\'s console with the radio. The engineer is at the radar. Men walk the skerry\'s shore. The launch has a man on its bow with a lamp.'],
    ['Objectives', '<b>Blind the radar</b> (the station). Take the <b>codebook</b> (the crew\'s hut). If you can, <b>without the alarm</b>. Back across to the mainland jetty, west.'],
  ],
  epilogue: {
    success: 'The radar on the outer skerry turns all night and sees nothing, and by dawn Ghost\'s boats are in the strait. The codebook says where the commander went: the old sea fort on Holme Skerry, the last island before open sea.',
    partial: 'Across and back, but the radar still sees, or the codebook stayed on the skerry. Ghost\'s boats will have to wait for weather.',
  },
  time: { date: [1, 6, 2027], hour: 0, minute: 50 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.08, 0.1, 0.13, 30, 200], ambient: [0.2, 0.22, 0.28] },
  extractName: 'the mainland jetty', extract: { x: 3, y: 20, floor: 'G', van: [1, 6] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.2, wall: 'concrete2', wallTint: [0.62, 0.64, 0.62], floor: 'concrete', ceil: 'metal', lampPower: 0.6, lampColour: [0.95, 0.95, 1], lampEvery: 5,
      channel: 3, surf: 0.5,
      carve: { size: [W, H], ops: [
        ['room', 58, 14, 66, 22],                       // the radar station
        ['room', 60, 28, 66, 32],                       // the crew's hut
      ], after: [
        // the strait
        ['room', 14, 0, 52, H - 1, '~'],
        ['cells', [[57, 18], [59, 30]], 'D'], ['cells', [[62, 13], [67, 16], [62, 23], [67, 30]], 'W'],
        ['cells', [[59, 15], [64, 15], [60, 21]], 'T'], ['cells', [[65, 21]], 'M'],
        ['cells', [[65, 31]], 'T'], ['cells', [[61, 31]], 'Y'],
        // the mainland's rocks and the skerry's
        ['cells', [[6, 8], [10, 30], [4, 34], [8, 14], [56, 8], [68, 6], [56, 36], [70, 24], [55, 26]], 'r'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C, D } = kit;
    // (M6.125.1) the strait's two headlands, north and south, in the ground outside the map: the only way across is by boat
    for (const [z0, z1] of [[-15, -0.05], [D + 0.05, D + 15]]) box([14 * C - 1, -0.5, z0], [53 * C + 1, 5, z1], 'rock', { tint: [0.45, 0.46, 0.44], noClimb: true });
    // the radar's mast and dish on the station's roof
    box([mid(62) - 0.15, 3.2, mid(18) - 0.15], [mid(62) + 0.15, 6.2, mid(18) + 0.15], 'metal', { tint: [0.5, 0.5, 0.52] });
    box([mid(62) - 1.4, 6.2, mid(18) - 0.1], [mid(62) + 1.4, 7.0, mid(18) + 0.1], 'metal', { tint: [0.7, 0.7, 0.72], solid: false });
    for (const [x, y] of [[12, 20], [56, 18], [58, 30]]) level.lights.push({ pos: [mid(x), 3.5, mid(y)], range: 10, intensity: 0.7, color: [0.95, 0.95, 1], street: true });
  },
  vehicles: [
    { id: 'ghostboat', kind: 'boat', at: [16, 20], yaw: -Math.PI / 2, paint: 'ghost', hp: 600 },
    { id: 'launch', kind: 'boat', at: [30, 8], yaw: -Math.PI / 2, paint: 'olive', hp: 600, loop: true, speed: 4, tune: { turn: 1.7 },
      path: [[30, 8], [40, 8], [44, 20], [40, 32], [30, 32], [26, 20], [30, 8]],
      crew: [{ id: 'pb_helm', at: [-0.4, 0.6] }, { id: 'pb_bow', at: [0, -2.2] }] },
  ],
  start: { x: 10, y: 20, floor: 'G', yaw: -Math.PI / 2 },
  testFroms: [[55, 20]],                                // (M6.125.1) for the kit test: the skerry's shore, where the boat lands you
  zones: [
    { id: 'station', label: 'The Skerries - the radar station', at: [58, 14, 66, 22] },
    { id: 'hut', label: 'The Skerries - the crew\'s hut', at: [60, 28, 66, 32] },
    { id: 'skerry', label: 'The Skerries - the outer skerry', at: [53, 0, W - 1, H - 1] },
    { id: 'strait', label: 'The Skerry strait', at: [14, 0, 52, H - 1] },
    { id: 'jetty', label: 'The mainland jetty', at: [0, 0, 13, H - 1] },
  ],
  guards: [
    { id: 'pb_helm', at: [30, 8, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'pb_bow', at: [30, 7, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'rad', at: [60, 17, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [63, 20, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'st1', at: [64, 17, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'sh1', at: [54, 20, 'G'], route: [[54, 4], [54, 36]], arms: 'carbine' },
    { id: 'sh2', at: [69, 20, 'G'], route: [[69, 4], [69, 36]], arms: 'carbine', dog: true },
    { id: 'ht1', at: [63, 30, 'G'], arms: 'smg' },
  ],
  pickups: [{ id: 'codes', name: 'The station\'s codebook', what: 'the codebook', at: [65, 31, 'G'], table: true, colour: [0.2, 0.25, 0.35] }],
  devices: [
    { id: 'c-stn', kind: 'camera', at: [57, 13, 'G'], face: [-1, -1], net: 'skerry' },
    { id: 'a-stn', kind: 'alarm', at: [67, 20, 'G'], face: [1, 0], net: 'skerry' },
  ],
  terminals: [
    { id: 'sec', name: 'the station\'s console', at: [59, 15, 'G'], face: [0, 1], time: 6, net: 'skerry' },
    { id: 'radar', name: 'the radar\'s set', at: [64, 15, 'G'], face: [0, 1], time: 8, verb: 'Blind', doing: 'Blinding',
      said: 'The radar\'s screen shows the strait empty, and will go on showing it empty until somebody looks out of the window.' },
  ],
  intel: [
    { id: 'log', at: [60, 21, 'G'], kind: 'Log', title: 'The station\'s plot', text: ['Every boat in the strait for a month, plotted and timed. Last night\'s entry: "One launch, Holme Skerry, the commander aboard. Not to be reported."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'radar', text: 'Blind the radar (the station)' },
    { id: 'o2', kind: 'take', ref: 'codes', text: 'Take the codebook (the crew\'s hut)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
