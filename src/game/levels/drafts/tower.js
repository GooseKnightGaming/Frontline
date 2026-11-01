// FRONTLINE - Level 38, the Tower (first draft, M6.29). From Rhys's environment-pack concept sheet: "Office
// (modular)". Varn Dynamics' headquarters, three floors round a stair core: a front company for the reds' arms
// money. The lobby, the cafe, the post room, the loading dock and the security office on the ground floor;
// open-plan offices on the first; the boardroom, the server room and Mr Varn's office on the top floor.
const W = 44, H = 34;
const core = ['room', 20, 13, 24, 21];
export default {
  id: 'tower', no: 38, title: 'The Tower', place: 'Varn Dynamics',
  where: 'Varn Dynamics, Ostergate business park. 22:30, the cleaners gone, the board still in session.',
  brief: [
    ['The place', 'Three floors round a <b>stair core</b> in the middle. <b>Ground</b>: the lobby (south, the way in), the cafe (west), the <b>security office</b> (east - maglocked), the post room and the <b>loading dock</b> (north; its doors open onto the yard, east). <b>First floor</b>: open-plan offices either side of the core. <b>Top floor</b>: the <b>boardroom</b> (north-west), the <b>server room</b> (south-west - maglocked), <b>Mr Varn\'s office</b> (east - maglocked).'],
    ['Varn Dynamics', 'Drones and guidance systems on paper; the reds\' money in fact. Tonight the board meets late. We want ears in that room, Varn\'s mail, and the prototype guidance unit in the server room.'],
    ['Security', 'Cameras in the lobby, on every floor\'s landing and in the server room; a turret guarding the servers; a <b>laser</b> across the top floor\'s corridor; three <b>maglocks</b>; the first floor\'s lights; the alarm - all run from the <b>security office</b>. You carry a <b>hacking kit</b>. Varn carries a <b>keycard</b>. The security chief has the <b>radio</b>; there is an <b>engineer</b> on the first floor, and a man with a <b>ballistic shield</b> on the top floor\'s landing.'],
    ['Objectives', '<b>Plant a bug</b> in the boardroom. <b>Copy Varn\'s mail</b> at his desk. Take the <b>prototype</b> from the server room. Optionally, stop <b>Mr Varn</b>.'],
  ],
  time: { date: [24, 11, 2026], hour: 22, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'rain',
  extractName: 'the van in the yard',
  outside: { backdrop: 'city', mat: 'asphalt', margin: 16 },
  floors: {
    G: {
      y: 0, wallH: 3.4, wall: 'plaster', wallTint: [0.9, 0.91, 0.93], floor: 'marble', ceil: 'plaster', lampPower: 0.8, lampColour: [0.95, 0.97, 1], lampEvery: 8,
      carve: { size: [W, H], ops: [
        ['room', 13, 23, 31, 30],                       // the lobby
        core,
        ['room', 3, 13, 18, 21],                        // the cafe
        ['room', 26, 13, 40, 21],                       // the security office
        ['room', 3, 3, 18, 11],                         // the post room
        ['room', 20, 3, 40, 11],                        // the loading dock
      ], after: [
        ['cells', [[22, 22], [15, 22], [28, 22], [10, 12], [30, 12], [22, 12], [21, 31], [22, 31], [41, 7], [41, 8]], 'D'],
        ['cells', [[15, 31], [18, 31], [25, 31], [28, 31], [2, 16], [2, 19], [42, 16], [42, 19]], 'W'],
        ['room', 18, 25, 25, 25, 'K'], ['cells', [[14, 28], [16, 28], [28, 28], [30, 28]], 'Z'],               // the reception desk; seats
        ['cells', [[6, 15], [10, 15], [14, 15], [6, 19], [10, 19]], 'T'], ['room', 4, 13, 8, 13, 'K'],       // the cafe
        ['cells', [[30, 14], [32, 14], [34, 14]], 'M'], ['cells', [[33, 19], [36, 19]], 'T'],                // the security office: its screens
        ['cells', [[5, 5], [5, 7], [5, 9], [9, 5], [9, 9], [14, 5], [14, 9]], 'H'],                          // the post room's racks
        ['cells', [[24, 5], [25, 5], [32, 4], [33, 4], [36, 9], [37, 9], [38, 9], [28, 8]], 'C'], ['cells', [[34, 6]], 'v'],   // the dock: crates, a van
      ] },
    },
    1: {
      y: 3.6, wallH: 3.4, wall: 'plaster', wallTint: [0.9, 0.91, 0.93], floor: 'carpet', floorTint: [0.45, 0.5, 0.58], ceil: 'plaster', lampPower: 0.7, lampColour: [0.95, 0.97, 1], lampEvery: 8,
      carve: { size: [W, H], ops: [
        core,
        ['room', 3, 3, 18, 21], ['room', 26, 3, 40, 21],    // the open-plan offices
        ['room', 20, 3, 24, 11],                            // the north landing
      ], after: [
        ['cells', [[19, 17], [25, 17], [22, 12], [19, 6], [25, 6]], 'D'],
        ['cells', [[2, 6], [2, 10], [2, 14], [2, 18], [42, 6], [42, 10], [42, 14], [42, 18], [8, 2], [14, 2], [30, 2], [36, 2]], 'W'],
        ['cells', [[5, 5], [8, 5], [11, 5], [14, 5], [5, 9], [8, 9], [11, 9], [14, 9], [5, 14], [8, 14], [11, 14], [14, 14], [5, 18], [8, 18], [11, 18]], 'T'],
        ['cells', [[29, 5], [32, 5], [35, 5], [38, 5], [29, 9], [32, 9], [35, 9], [38, 9], [29, 14], [32, 14], [35, 14], [38, 14], [32, 18], [35, 18]], 'T'],
        ['cells', [[17, 20], [27, 20], [39, 20]], 'H'],
      ] },
    },
    2: {
      y: 7.2, wallH: 3.4, wall: 'plaster', wallTint: [0.93, 0.92, 0.9], floor: 'wood', floorTint: [0.55, 0.4, 0.28], ceil: 'plaster', lampPower: 0.75, lampColour: [1, 0.92, 0.8], lampEvery: 8,
      carve: { size: [W, H], ops: [
        core,
        ['room', 3, 3, 18, 11],                         // the boardroom
        ['room', 3, 13, 18, 21],                        // the server room
        ['room', 26, 3, 40, 21],                        // Varn's office
        ['room', 20, 3, 24, 11],                        // the north landing
      ], after: [
        ['cells', [[22, 12], [19, 7], [19, 17], [25, 7]], 'D'],
        ['cells', [[2, 5], [2, 9], [42, 6], [42, 10], [42, 14], [42, 18], [8, 2], [14, 2], [32, 2], [36, 2]], 'W'],
        ['room', 7, 6, 14, 8, 'T'],                     // the boardroom's table
        ['cells', [[5, 15], [8, 15], [11, 15], [14, 15], [5, 19], [8, 19], [11, 19], [14, 19]], 'H'],         // the racks
        ['cells', [[34, 9], [35, 9], [36, 9]], 'T'], ['cells', [[29, 18], [31, 18]], 'Z'], ['cells', [[39, 4], [39, 5]], 'H'],
      ] },
    },
  },
  stairs: [
    { x: 21, y: 20, dir: 'N', len: 5, w: 2, from: 'G', to: '1' },
    { x: 23, y: 14, dir: 'S', len: 5, w: 2, from: '1', to: '2' },
  ],
  start: { x: 21.5, y: 33, floor: 'G', yaw: 0 },
  extra(kit) {
    const { level, mid } = kit;
    level.signs.push({ pos: [mid(21.5), 3.0, 31 * 1.5 + 1.5 + 0.14], yaw: 0, w: 4.0, h: 0.7, text: 'VARN DYNAMICS', sub: 'Guidance and control', col: '#1a2230' });
  },
  zones: [
    { id: 'board', label: 'Varn Dynamics - the boardroom', at: [3, 3, 18, 11], floor: '2' },
    { id: 'servers', label: 'Varn Dynamics - the server room', at: [3, 13, 18, 21], floor: '2' },
    { id: 'varn', label: 'Varn Dynamics - Mr Varn\'s office', at: [26, 3, 40, 21], floor: '2' },
    { id: 'top', label: 'Varn Dynamics - the top floor', at: [0, 0, W - 1, H - 1], floor: '2' },
    { id: 'first', label: 'Varn Dynamics - the first floor', at: [0, 0, W - 1, H - 1], floor: '1' },
    { id: 'lobby', label: 'Varn Dynamics - the lobby', at: [13, 23, 31, 30] },
    { id: 'cafe', label: 'Varn Dynamics - the cafe', at: [3, 13, 18, 21] },
    { id: 'security', label: 'Varn Dynamics - the security office', at: [26, 13, 40, 21] },
    { id: 'post', label: 'Varn Dynamics - the post room', at: [3, 3, 18, 11] },
    { id: 'dock', label: 'Varn Dynamics - the loading dock', at: [20, 3, 40, 11] },
    { id: 'core', label: 'Varn Dynamics - the stairs', at: [20, 13, 24, 21] },
    { id: 'park', label: 'Ostergate business park', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'varn', at: [35, 11, '2'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Mr Varn', tint: [0.9, 0.9, 0.95], card: 'varn' },
    { id: 'chief', at: [33, 17, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'desk', at: [21, 26, 'G'], arms: 'smg' },
    { id: 'l2', at: [29, 27, 'G'], route: [[14, 27], [30, 27]], arms: 'carbine' },
    { id: 'dock1', at: [27, 6, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'cafe1', at: [12, 17, 'G'], arms: 'pistol', temper: 'cowardly', role: 'medic' },
    { id: 'o1', at: [10, 12, '1'], route: [[4, 12], [17, 12]], arms: 'carbine' },
    { id: 'o2', at: [33, 12, '1'], route: [[27, 12], [39, 12]], arms: 'smg' },
    { id: 'eng', at: [7, 20, '1'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'o3', at: [22, 7, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'shield', at: [22, 9, '2'], arms: 'pistol', temper: 'steady', shield: true },
    { id: 'b1', at: [5, 4, '2'], arms: 'smg' },
    { id: 'b2', at: [16, 10, '2'], arms: 'carbine' },
    { id: 's1', at: [16, 17, '2'], arms: 'carbine', temper: 'steady' },
    { id: 'rv1', at: [36, 7, 'G'], arms: 'carbine', reserve: true }, { id: 'rv2', at: [38, 7, 'G'], arms: 'smg', reserve: true },   // the reserve, at the dock
    { id: 'v1', at: [28, 6, '2'], arms: 'dmr', rank: 'specialist', temper: 'steady', perches: [[28, 6, '2'], [39, 17, '2'], [28, 20, '2']] },
  ],
  pickups: [{ id: 'proto', name: 'The prototype guidance unit', what: 'the prototype', at: [17, 19, '2'], h: 0.9, colour: [0.6, 0.65, 0.7] }],
  devices: [
    { id: 'c-lobby', kind: 'camera', at: [13, 23, 'G'], face: [1, 1], net: 'varn' },
    { id: 'c-dock', kind: 'camera', at: [40, 3, 'G'], face: [-1, 1], net: 'varn' },
    { id: 'c-land1', kind: 'camera', at: [24, 3, '1'], face: [-1, 1], net: 'varn' },
    { id: 'c-land2', kind: 'camera', at: [20, 3, '2'], face: [1, 1], net: 'varn' },
    { id: 'c-servers', kind: 'camera', at: [3, 13, '2'], face: [1, 1], net: 'varn' },
    { id: 'c-pin-varn', kind: 'camera', at: [40, 3, '2'], face: [-1, 1], net: 'varn', hidden: true },
    { id: 't-servers', kind: 'turret', at: [4, 21, '2'], face: [1, -1], net: 'varn' },
    { id: 'm-security', kind: 'lock', at: [28, 22, 'G'], net: 'varn' },
    { id: 'm-servers', kind: 'lock', at: [19, 17, '2'], net: 'varn' },
    { id: 'm-varn', kind: 'lock', at: [25, 7, '2'], net: 'varn' },
    { id: 'z-top', kind: 'laser', at: [20, 5, '2'], to: [24, 5], net: 'varn' },
    { id: 'l-first', kind: 'lights', at: [18, 20, '1'], face: [-1, 0], area: [3, 3, 18, 21], name: 'the first floor\'s west offices', net: 'varn' },
    { id: 'a-bell', kind: 'alarm', at: [22, 23, 'G'], face: [0, 1], net: 'varn' },
  ],
  terminals: [
    { id: 'sec', name: 'the security office\'s console', at: [38, 14, 'G'], face: [0, 1], time: 6, net: 'varn' },
    { id: 'bug', name: 'the boardroom\'s phone', at: [15, 4, '2'], face: [0, 1], time: 5, verb: 'Plant a bug in', doing: 'Planting a bug in',
      said: 'The bug is in: every word said in the boardroom goes to Ghost from now on.' },
    { id: 'mail', name: 'Mr Varn\'s computer', at: [37, 10, '2'], face: [0, -1], time: 8, reveal: 25, verb: 'Copy the mail from', doing: 'Copying',
      said: 'Varn\'s mail, copied: every payment, and who it went to. The building\'s cameras put every red on your radar for 25 seconds.' },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'bug', text: 'Plant a bug in the boardroom (the top floor)' },
    { id: 'o2', kind: 'hack', ref: 'mail', text: 'Copy Varn\'s mail (his office, the top floor)' },
    { id: 'o3', kind: 'take', ref: 'proto', text: 'Take the prototype (the server room, the top floor)' },
    { id: 'o4', kind: 'kill', ref: 'varn', text: 'Stop Mr Varn', optional: true },
  ],
};
