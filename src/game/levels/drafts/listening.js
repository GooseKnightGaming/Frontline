// FRONTLINE - Level 35, the Listening Station (first draft, M6.28: a level built round hacking and
// control). Skarvik signals station, on the cliffs: the reds' ears. Its program, LANTERN, is what traced
// Ghost's hacks back to Yard 7 - and the archive under it holds everything it has gathered on Ghost.
//
// Two security networks: the perimeter's (the gate's turrets, the cameras on the building's front, the
// forecourt's floodlights - run from the gatehouse) and the core's (cameras, pinhole cameras, laser
// tripwires, maglocks, the turrets in the server hall, the corridor's and the hall's lights, the alarm -
// run from the security office, itself maglocked). An engineer and a radio operator.
const W = 56, H = 46;
export default {
  id: 'listening', no: 35, title: 'The Listening Station', place: 'Skarvik signals station',
  where: 'Skarvik signals station, on the cliffs. 02:15, a clear night, the dishes turning.',
  brief: [
    ['Why', 'LANTERN, the program that runs here, is what traced our hacks back to Yard 7. Everything it has gathered on Ghost is in the station\'s <b>archive</b>, in the basement. Wipe it - then turn LANTERN round on its owners: once it is, no trace of theirs will find Yard 7 again.'],
    ['The place', 'The gatehouse and the fence first, the forecourt beyond them. The station: the lobby (south), the corridor across it; the <b>operations room</b> (north-west), the <b>security office</b> (north, middle), the <b>comms room</b> (north-east); the canteen and the stairwell (south). Down the stairs: the <b>server hall</b>, the archive (behind its maglock) and the plant room.'],
    ['Security', 'Two networks. The <b>perimeter</b>: two turrets covering the gate, cameras on the station\'s front, the forecourt\'s floodlights - run from the <b>gatehouse</b>. The <b>core</b>: cameras (and <b>pinhole cameras</b> - EMF shows them), <b>laser tripwires</b> (night vision or UV show the beams - under them on your belly), the security office and the archive <b>maglocked</b>, two turrets in the server hall, the corridor\'s and the hall\'s lights, and the <b>alarm</b> - run from the <b>security office</b>. You carry a <b>hacking kit</b> and the multi-spectrum visor. Hack too long and LANTERN traces you - again.'],
    ['The reds', 'Sixteen. The duty officer in the security office has the <b>radio</b>; the station\'s <b>engineer</b> is in the plant room and will put a hacked network back on. <b>Major Vass</b>, who runs LANTERN, is in the comms room. And there is a <b>medic</b> (the canteen): he brings knocked-out men round.'],
    ['Objectives', '<b>Wipe Ghost\'s file</b> at the archive terminal. <b>Turn LANTERN round</b> at the mainframe (the server hall). Take the <b>intercept log</b> from the operations room. Optionally, stop Major Vass.'],
  ],
  time: { date: [3, 11, 2026], hour: 2, minute: 15 }, night: true, faction: 'red', requires: 'HACKKIT', startGear: 'MULTIVIS',
  extractName: 'the road south',
  outside: { backdrop: 'hills', mat: 'asphalt', margin: 14 },
  floors: {
    B: {
      y: -4.2, wallH: 3.1, wall: 'concrete2', floor: 'concrete', ceil: 'concrete2', lampPower: 0.55, lampColour: [0.75, 0.85, 1], lampEvery: 9,
      carve: { size: [W, H], ops: [
        ['room', 30, 8, 47, 29],                       // the server hall (the stairs come down at its south end)
        ['room', 9, 8, 28, 18],                        // the archive
        ['room', 9, 20, 28, 29],                       // the plant room
      ], after: [
        ['cell', 29, 12, 'D'],                         // the archive's door (maglocked)
        ['cell', 29, 24, 'D'], ['cell', 18, 19, 'L'],
        ['cells', [[32, 10], [33, 10], [34, 10], [35, 10], [40, 10], [41, 10], [42, 10], [43, 10],
          [32, 13], [33, 13], [34, 13], [35, 13], [40, 13], [41, 13], [42, 13], [43, 13],
          [32, 16], [33, 16], [34, 16], [35, 16], [40, 16], [41, 16], [42, 16], [43, 16],
          [32, 19], [33, 19], [34, 19], [35, 19], [40, 19], [41, 19], [42, 19], [43, 19],
          [32, 22], [33, 22], [34, 22], [35, 22], [40, 22], [41, 22], [42, 22], [43, 22]], 'H'],     // the racks
        ['cells', [[11, 10], [11, 13], [11, 16], [16, 10], [16, 13], [16, 16], [24, 10], [24, 13], [24, 16]], 'H'],   // the archive's tape stacks
        ['cells', [[12, 22], [16, 22], [12, 27], [16, 27]], 'M'], ['cells', [[24, 26], [25, 26]], 'B'],
      ] },
    },
    G: {
      y: 0, wallH: 3.4, wall: 'concrete2', wallTint: [0.8, 0.82, 0.85], floor: 'concrete', floorTint: [0.8, 0.82, 0.85], ceil: 'plaster', lampPower: 0.6, lampColour: [0.9, 0.95, 1], lampEvery: 9,
      carve: { size: [W, H], ops: [
        ['room', 9, 7, 20, 18], ['room', 22, 7, 29, 18], ['room', 31, 7, 46, 18],     // operations, security, comms
        ['room', 9, 20, 46, 22],                                                    // the corridor
        ['room', 9, 24, 20, 29], ['room', 22, 24, 33, 29], ['room', 35, 24, 46, 29], // the canteen, the lobby, the stairwell
        ['room', 25, 36, 30, 39],                                                   // the gatehouse
      ], after: [
        ['cells', [[15, 19], [25, 19], [38, 19], [44, 19], [15, 23], [27, 23], [28, 23], [40, 23], [21, 26], [27, 30], [28, 30], [27, 35], [27, 40]], 'D'],
        ['cells', [[8, 12], [8, 26], [47, 12], [47, 26], [12, 6], [17, 6], [35, 6], [41, 6], [24, 30], [31, 30], [25, 35], [30, 35]], 'W'],
        ['cells', [[12, 10], [14, 10], [16, 10], [12, 13], [14, 13], [16, 13]], 'M'], ['cells', [[16, 16]], 'T'],   // operations: the consoles
        ['cells', [[28, 8], [28, 10]], 'H'], ['cells', [[26, 13]], 'T'],                                                          // security
        ['cells', [[33, 8], [36, 8], [39, 8], [42, 8], [45, 8]], 'M'], ['cells', [[38, 14], [41, 14]], 'T'], ['cells', [[34, 16]], 'Z'],   // comms
        ['cells', [[12, 26], [16, 26], [12, 28], [16, 28]], 'T'], ['cells', [[19, 25]], 'K'],                                    // the canteen
        ['cells', [[24, 25], [25, 25], [26, 25]], 'K'], ['cells', [[32, 28]], 'Z'],                                              // the lobby's desk
        ['cells', [[26, 38]], 'T'],                                                                                             // the gatehouse
      ] },
    },
  },
  stairs: [{ x: 38, y: 26, dir: 'E', len: 6, w: 2, from: 'B', to: 'G' }],
  start: { x: 28, y: 44, floor: 'G', yaw: 0 },
  extra(kit) {
    const { box, level, CELL: C, mid } = kit;
    // the fence round the forecourt (the gate in it by the gatehouse), the dishes on the roof, the mast
    for (const [x0, x1] of [[2, 25], [31, 53]]) box([x0 * C, 0, 33 * C + 0.6], [x1 * C, 3.0, 33 * C + 0.7], 'metal', { tint: [0.45, 0.47, 0.5], shootThrough: true });
    box([2 * C, 0, 3 * C], [2 * C + 0.1, 3.0, 33 * C + 0.7], 'metal', { tint: [0.45, 0.47, 0.5], shootThrough: true });
    box([53 * C, 0, 3 * C], [53 * C + 0.1, 3.0, 33 * C + 0.7], 'metal', { tint: [0.45, 0.47, 0.5], shootThrough: true });
    box([2 * C, 0, 3 * C], [53 * C, 3.0, 3 * C + 0.1], 'metal', { tint: [0.45, 0.47, 0.5], shootThrough: true });
    for (const [x, z, r] of [[14, 12, 2.6], [40, 12, 3.2]]) {
      const cx = mid(x), cz = mid(z), top = 3.6;
      box([cx - 0.5, top, cz - 0.5], [cx + 0.5, top + 1.6, cz + 0.5], 'metal', { tint: [0.6, 0.62, 0.65] });
      box([cx - r, top + 1.6, cz - r * 0.3], [cx + r, top + 1.6 + r * 1.4, cz + r * 0.3], 'paint', { tint: [0.92, 0.93, 0.95] });     // the dish
      box([cx - r * 0.75, top + 1.6 + r * 0.2, cz - r * 0.75], [cx + r * 0.75, top + 1.6 + r * 1.2, cz + r * 0.75], 'paint', { solid: false, tint: [0.88, 0.9, 0.92] });
    }
    box([mid(28) - 0.3, 3.6, mid(9) - 0.3], [mid(28) + 0.3, 22, mid(9) + 0.3], 'metal', { tint: [0.7, 0.2, 0.15] });       // the mast
    level.lights.push({ pos: [mid(28), 21, mid(9)], range: 6, intensity: 1.2, color: [1, 0.15, 0.1], street: true });
    level.signs.push({ pos: [mid(27.5), 2.9, 30 * C + C + 0.14], yaw: 0, w: 3.4, h: 0.6, text: 'SKARVIK', sub: 'Signals station', col: '#2a3340' });
    // the forecourt's floodlights
    for (const x of [10, 45]) { box([mid(x) - 0.15, 0, mid(31) - 0.15], [mid(x) + 0.15, 7, mid(31) + 0.15], 'metal', { tint: [0.5, 0.5, 0.52] }); level.lights.push({ pos: [mid(x), 6.8, mid(31)], range: 22, intensity: 1.0, color: [0.95, 0.97, 1], street: true }); }
  },
  zones: [
    { id: 'archive', label: 'Skarvik - the archive', at: [9, 8, 28, 18], floor: 'B' },
    { id: 'plant', label: 'Skarvik - the plant room', at: [9, 20, 28, 29], floor: 'B' },
    { id: 'servers', label: 'Skarvik - the server hall', at: [30, 8, 47, 29], floor: 'B' },
    { id: 'ops', label: 'Skarvik - the operations room', at: [9, 7, 20, 18] },
    { id: 'security', label: 'Skarvik - the security office', at: [22, 7, 29, 18] },
    { id: 'comms', label: 'Skarvik - the comms room', at: [31, 7, 46, 18] },
    { id: 'corridor', label: 'Skarvik - the corridor', at: [9, 20, 46, 22] },
    { id: 'canteen', label: 'Skarvik - the canteen', at: [9, 24, 20, 29] },
    { id: 'lobby', label: 'Skarvik - the lobby', at: [22, 24, 33, 29] },
    { id: 'stairs', label: 'Skarvik - the stairwell', at: [35, 24, 46, 29] },
    { id: 'gate', label: 'Skarvik - the gatehouse', at: [25, 36, 30, 39] },
    { id: 'forecourt', label: 'Skarvik - the forecourt', at: [2, 3, 53, 33] },
    { id: 'all', label: 'Skarvik signals station', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'vass', at: [40, 11, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'Major Vass', tint: [1.1, 0.5, 0.46] },
    { id: 'duty', at: [26, 15, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'o1', at: [13, 11, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'o2', at: [18, 12, 'G'], route: [[10, 8], [19, 8], [19, 17], [10, 17]], arms: 'smg' },
    { id: 'c1', at: [35, 12, 'G'], arms: 'carbine' },
    { id: 'p1', at: [20, 21, 'G'], route: [[10, 21], [45, 21]], arms: 'carbine' },
    { id: 'l1', at: [29, 27, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'k1', at: [14, 27, 'G'], arms: 'pistol', temper: 'cowardly', role: 'medic' },
    { id: 's1', at: [45, 28, 'G'], arms: 'shotgun' },
    { id: 'f1', at: [20, 32, 'G'], route: [[5, 32], [50, 32]], arms: 'carbine' },
    { id: 'gh', at: [28, 37, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'v1', at: [38, 12, 'B'], route: [[38, 9], [38, 28]], arms: 'smg' },
    { id: 'v2', at: [45, 20, 'B'], arms: 'carbine', rank: 'sergeant', temper: 'steady' },
    { id: 'v3', at: [31, 15, 'B'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'a1', at: [14, 14, 'B'], arms: 'carbine' },
    { id: 'eng', at: [20, 25, 'B'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
  ],
  pickups: [{ id: 'log', name: 'The intercept log', what: 'the log', at: [16, 16, 'G'], table: false, h: 0.8, colour: [0.85, 0.8, 0.5] }],
  devices: [
    // the perimeter: run from the gatehouse
    { id: 't-gate-w', kind: 'turret', at: [23, 31, 'G'], face: [0, 1], net: 'fence' },
    { id: 't-gate-e', kind: 'turret', at: [32, 31, 'G'], face: [0, 1], net: 'fence' },
    { id: 'c-front-w', kind: 'camera', at: [20, 31, 'G'], face: [0, 1], net: 'fence' },
    { id: 'c-front-e', kind: 'camera', at: [36, 31, 'G'], face: [0, 1], net: 'fence' },
    // the core: run from the security office
    { id: 'c-corr-w', kind: 'camera', at: [9, 20, 'G'], face: [1, 0], net: 'core' },
    { id: 'c-corr-e', kind: 'camera', at: [46, 22, 'G'], face: [-1, 0], net: 'core' },
    { id: 'c-lobby', kind: 'camera', at: [33, 24, 'G'], face: [-1, 1], net: 'core' },
    { id: 'c-hall-n', kind: 'camera', at: [30, 8, 'B'], face: [1, 1], net: 'core' },
    { id: 'c-hall-s', kind: 'camera', at: [47, 29, 'B'], face: [-1, -1], net: 'core' },
    { id: 'c-pin-archive', kind: 'camera', at: [28, 8, 'B'], face: [-1, 1], net: 'core', hidden: true },
    { id: 'c-pin-comms', kind: 'camera', at: [46, 7, 'G'], face: [-1, 1], net: 'core', hidden: true },
    { id: 't-hall-n', kind: 'turret', at: [46, 9, 'B'], face: [-1, 1], net: 'core' },
    { id: 't-hall-s', kind: 'turret', at: [31, 28, 'B'], face: [1, -1], net: 'core' },
    { id: 'm-security', kind: 'lock', at: [25, 19, 'G'], net: 'core' },
    { id: 'm-archive', kind: 'lock', at: [29, 12, 'B'], net: 'core' },
    { id: 'z-corr', kind: 'laser', at: [34, 20, 'G'], to: [34, 22], net: 'core' },
    { id: 'z-aisle', kind: 'laser', at: [37, 17, 'B'], to: [39, 17], net: 'core' },
    { id: 'z-archive', kind: 'laser', at: [30, 11, 'B'], to: [30, 13], net: 'core' },
    { id: 'l-corr', kind: 'lights', at: [10, 22, 'G'], face: [0, -1], area: [9, 20, 46, 22], name: 'the corridor', net: 'core' },
    { id: 'l-hall', kind: 'lights', at: [30, 26, 'B'], face: [1, 0], area: [30, 8, 47, 29], name: 'the server hall', net: 'core' },
    { id: 'a-bell', kind: 'alarm', at: [30, 20, 'G'], face: [0, 1], net: 'core' },
  ],
  terminals: [
    { id: 'sec-gate', name: 'the gatehouse console', at: [29, 37, 'G'], face: [0, -1], time: 5, net: 'fence' },
    { id: 'sec-core', name: 'the security office\'s console', at: [23, 9, 'G'], face: [1, 0], time: 6, net: 'core' },
    { id: 'archive', name: 'the archive terminal', at: [20, 12, 'B'], face: [0, 1], time: 8, reveal: 20, verb: 'Wipe', doing: 'Wiping',
      said: 'The archive: every file LANTERN ever opened on Ghost - names, places, Yard 7 - wiped, and the backups with it. The cameras put every red on your radar for 20 seconds.' },
    { id: 'mainframe', name: 'the mainframe', at: [45, 26, 'B'], face: [-1, 0], time: 9, reveal: 30, verb: 'Turn round', doing: 'Turning LANTERN round',
      said: 'LANTERN turned round: its next trace goes back down the reds\' own lines. Whoever listens to them is listening to us now. Every red on your radar for 30 seconds.' },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'archive', text: 'Wipe Ghost\'s file (the archive terminal, the basement)' },
    { id: 'o2', kind: 'hack', ref: 'mainframe', text: 'Turn LANTERN round (the mainframe, the server hall)' },
    { id: 'o3', kind: 'take', ref: 'log', text: 'Take the intercept log (the operations room)' },
    { id: 'o4', kind: 'kill', ref: 'vass', text: 'Stop Major Vass', optional: true },
  ],
};
