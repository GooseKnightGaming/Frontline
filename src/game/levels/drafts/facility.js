// FRONTLINE - Level 11, the Research Facility (first draft). Rhys: "maps/scenarios
// that justify the other Visions [IR, UV, EMF]" - and of a research facility, "a fantastic idea for all
// 3": thermal through the cold store's mist, UV for the lab's spill trail to the missing scientist, EMF
// for the shielded room where the data is kept; and the plant room's hot pipes and steam.
// Halden Research Station: the reds hold it; Dr Ilse Brandt slipped away when they came.
const W = 52, H = 42;
export default {
  id: 'facility', no: 11, title: 'The Research Facility', place: 'Halden Research Station',
  where: 'Halden Research Station, on the fen. 03:40, the power on emergency lighting.',
  brief: [
    ['The place', 'One storey and a plant room under it. Labs along the north side (the chemistry lab, the CAVE lab, the cold store), the service corridor in front of them, offices, the staff room and decontamination in the middle, the main corridor, the lobby. The stair down to the plant room is in decontamination.'],
    ['Your kit', 'The <b>multi-spectrum visor</b>: V steps through night vision, <b>thermal</b> (warm bodies and hot pipes, through mist and smoke), <b>UV</b> (traces people leave) and <b>EMF</b> (wiring and hidden electronics, through walls).'],
    ['The reds', 'Fourteen, all over the station - two of them in the cold store, where the refrigeration has filled the room with mist.'],
    ['Security', 'Cameras watch the corridors and the lobby - one that sees you raises the alarm - and turrets guard decontamination and the data room. They all run from the <b>security terminal</b> in the west office: hack it (hold E) to disable them, have them ignore you, or turn the turrets on the reds. Hack for too long and they trace you. Your <b>hacking kit</b> (this mission\'s Special) takes them one at a time, up close - more slowly.'],
    ['The specialists', 'The officer in the security office carries the <b>radio</b>: if he sees you, a few seconds and every red in the station is coming - drop him first. And the station\'s <b>engineer</b> (in the staff room) goes to the security terminal to put a hacked system back on: stop him, or hack it again.'],
    ['The building', 'Decontamination\'s two doors are <b>maglocked</b>: no kick opens them - hack the system, use the kit on a keypad, or blow them. The corridors\' <b>lights</b> are on the same system: put them out and the reds see only what is close (night vision sees it all). And while the <b>alarm</b> is live, one shout sets off the siren and the whole station comes. And not every camera is where you can see it: there are <b>pinhole cameras</b> in the walls - EMF shows them.'],
    ['Objectives', 'Find <b>Dr Ilse Brandt</b>: she cut her hand in the chemistry lab as she ran - under UV, the spill trail shows the way. Bring her out. Take the <b>sample case</b> from the cold store. Find the shielded data room - EMF shows where its wiring goes - and hack its <b>data terminal</b>.'],
  ],
  time: { date: [11, 8, 2026], hour: 3, minute: 40 }, night: true, startGear: 'MULTIVIS', faction: 'red', requires: 'HACKKIT',
  extractName: 'the van in the car park',
  outside: { backdrop: 'woods', mat: 'asphalt', margin: 16 },
  // the shielded room's door looks like the wall it is set in
  doorSkins: { 'G:43,13': { build: 'sturdy', locked: true, mat: 'plaster', label: 'a panel in the wall' } },
  floors: {
    B: {
      y: -4.2, wallH: 3.8, wall: 'concrete2', floor: 'concrete', ceil: 'concrete2', lampPower: 0.45, lampColour: [1, 0.55, 0.35], lampEvery: 10,
      carve: { size: [W, H], ops: [
        ['room', 36, 17, 49, 24],                      // the stair's foot, and the plant room beyond
        ['room', 30, 25, 49, 34],
        ['room', 46, 36, 49, 39],                      // the crawlspace behind the boilers
      ], after: [
        ['cells', [[33, 27], [37, 27], [41, 27], [33, 32], [37, 32]], 'M'], ['cells', [[44, 30], [45, 30]], 'B'], ['cells', [[31, 33], [32, 33]], 'C'],
        ['cell', 47, 35, 'L'],
      ] },
    },
    G: {
      y: 0, wallH: 3.2, wall: 'plaster', wallTint: [0.88, 0.9, 0.92], floor: 'concrete', floorTint: [0.85, 0.87, 0.9], ceil: 'plaster', lampPower: 0.55, lampColour: [0.9, 0.95, 1], lampEvery: 9,
      carve: { size: [W, H], ops: [
        ['room', 2, 2, 11, 12], ['room', 13, 2, 23, 12], ['room', 25, 2, 35, 12], ['room', 37, 2, 49, 12],   // the labs, the cold store, the data room
        ['room', 2, 14, 49, 16],                       // the service corridor
        ['room', 2, 18, 9, 24], ['room', 13, 18, 18, 24], ['room', 20, 18, 29, 24], ['room', 33, 18, 35, 24], ['room', 37, 18, 49, 24],
        ['room', 11, 17, 11, 25], ['room', 31, 17, 31, 25],    // cross passages
        ['room', 2, 26, 49, 28],                       // the main corridor
        ['room', 20, 30, 31, 36],                      // the lobby
      ], after: [
        ['cells', [[6, 13], [18, 13], [30, 13], [6, 17], [15, 17], [25, 17], [34, 17], [42, 17], [15, 25], [25, 25], [42, 25], [6, 25]], 'D'],
        ['cell', 43, 13, 'L'],                          // the shielded room's door - a panel in the wall
        ['cells', [[25, 29], [26, 29], [25, 37], [26, 37]], 'D'],
        ['cells', [[21, 37], [22, 37], [29, 37], [30, 37], [1, 4], [1, 8], [50, 20]], 'W'],
        ['cells', [[4, 5], [8, 5], [4, 9], [8, 9]], 'K'], ['cells', [[15, 4], [21, 4], [15, 10], [21, 10]], 'M'], ['cells', [[18, 7]], 'T'],
        ['cells', [[26, 3], [28, 3], [30, 3], [32, 3], [34, 3], [26, 11], [28, 11], [30, 11], [32, 11], [34, 11]], 'H'], ['cells', [[30, 7]], 'T'],
        ['cells', [[39, 4], [42, 4], [45, 4], [48, 4], [39, 10], [42, 10], [45, 10], [48, 10]], 'M'],
        ['cells', [[4, 20], [8, 22], [16, 21], [23, 20], [27, 22], [44, 21]], 'T'], ['cells', [[24, 22], [28, 20]], 'Z'],
        ['cells', [[22, 33], [29, 33]], 'K'], ['cells', [[23, 31], [28, 31]], 'Z'],
      ] },
    },
  },
  stairs: [{ x: 40, y: 20, dir: 'E', len: 6, w: 2, from: 'B', to: 'G' }],
  start: { x: 25, y: 40, floor: 'G', yaw: 0, van: [-5, 1] },
  extra(kit) {
    const { mark, mid, CELL } = kit;
    const yB = -4.2;
    // UV: Dr Brandt's blood, drop by drop, from the chemistry lab's bench to the crawlspace door
    // (Rhys's "UV blood drops" screenshots: drops hung in the air over the stairwell) each drop is laid on
    // whatever is under it - the floor, a stair tread, the floor below - and the trail goes the way she went: along
    // the corridor, round the stairwell to the top step, down the stairs, through the plant room
    const { world } = kit;
    const drop = (x, y, hint, r) => {
      const cx = x * CELL + CELL / 2, cz = y * CELL + CELL / 2, g = world.groundBelow(cx, hint + 0.6, cz, 0.05);
      const gy = g === null || g < hint - 1.5 ? hint : g;
      mark('uv', [cx - r, gy + 0.012, cz - r * 0.8], [cx + r, gy + 0.02, cz + r * 0.8]);
    };
    for (const [x, y] of [[7, 7], [6, 10], [6, 12], [6, 13], [6, 15], [9, 15], [11, 15], [11, 18], [11, 21], [11, 24], [11, 27], [16, 27], [21, 27], [26, 27], [31, 27], [36, 27], [41, 27], [42, 25], [43, 23.4], [45, 22.6], [46.4, 21.2]]) drop(x, y, 0, 0.2);
    for (const x of [45.2, 44.1, 43.0, 41.9, 40.8]) drop(x, 20.6, yB + (x + 0.5 - 40) / 6 * -yB, 0.15);         // down the stairs
    for (const [x, y] of [[39.4, 21], [40.6, 22.6], [44, 22.8], [47, 25], [47, 28], [47, 31], [47, 34]]) drop(x, y, yB, 0.12);
    mark('uv', [mid(47) - 0.2, yB + 0.9, mid(35) - CELL / 2 - 0.12], [mid(47) + 0.15, yB + 1.15, mid(35) - CELL / 2 - 0.1]);      // a handprint on the crawlspace door
    // EMF: the shielded room's cabling, from the security office along the service corridor's ceiling, through the false wall
    const yc = 3.05;
    mark('emf', [mid(15) - 0.05, yc - 0.06, mid(17) - 0.05], [mid(15) + 0.05, yc, mid(15) + 0.05]);
    mark('emf', [mid(15) - 0.05, yc - 0.06, mid(15) - 0.05], [mid(43) + 0.05, yc, mid(15) + 0.05]);
    mark('emf', [mid(43) - 0.05, yc - 0.06, mid(11) - 0.05], [mid(43) + 0.05, yc, mid(15) + 0.05]);
    mark('emf', [mid(43) - 0.06, 0.2, mid(13) - 0.15], [mid(43) + 0.06, yc, mid(13) + 0.15]);
    mark('emf', [mid(39) - 0.3, 0.8, mid(4) - 0.3], [mid(48) + 0.3, 2.1, mid(4) + 0.3]);       // the racks, live
    // and the staff room's bugs - someone has been listening
    for (const [x, y] of [[21, 18.6], [29, 23.4]]) mark('emf', [mid(x) - 0.06, 2.3, mid(y) - 0.04], [mid(x) + 0.06, 2.42, mid(y) + 0.04]);
    // thermal: the plant room's pipes (along its ceiling, down to the boilers), the boilers themselves; and the
    // hot-water pipe along the main corridor's ceiling
    for (const [x0, z0, x1, z1] of [[30, 26, 49, 26], [30, 33, 49, 33], [36, 18, 36, 34]]) mark('heat', [mid(x0) - 0.08, yB + 3.3, mid(z0) - 0.08], [mid(x1) + 0.08, yB + 3.5, mid(z1) + 0.08]);
    for (const [x, y] of [[33, 27], [37, 27], [41, 27], [33, 32], [37, 32]]) mark('heat', [mid(x) - 0.6, yB + 0.1, mid(y) - 0.6], [mid(x) + 0.6, yB + 1.5, mid(y) + 0.6], { warm: true });
    mark('heat', [mid(2), 3.0, mid(26.5) - 0.06], [mid(49), 3.12, mid(26.5) + 0.06], { warm: true });
    // the cold store's mist: thick in normal sight and night vision, nothing to thermal
    for (let x = 25; x <= 35; x += 2) for (let y = 2; y <= 12; y += 2) mark('mist', [x * CELL, 0.0, y * CELL], [Math.min(36, x + 2) * CELL - 0.1, 2.6, Math.min(13, y + 2) * CELL - 0.1]);
    // steam from a leaking valve in the plant room
    mark('mist', [mid(44) - 1.2, yB, mid(26) - 1.2], [mid(44) + 1.2, yB + 3.4, mid(26) + 1.2]);
  },
  zones: [
    { id: 'chem', label: 'Halden - the chemistry lab', at: [2, 2, 11, 12] },
    { id: 'cave', label: 'Halden - the CAVE lab', at: [13, 2, 23, 12] },
    { id: 'cold', label: 'Halden - the cold store', at: [25, 2, 35, 12] },
    { id: 'data', label: 'Halden - the shielded data room', at: [37, 2, 49, 12] },
    { id: 'security', label: 'Halden - the security office', at: [13, 18, 18, 24] },
    { id: 'staff', label: 'Halden - the staff room', at: [20, 18, 30, 24] },
    { id: 'decon', label: 'Halden - decontamination', at: [37, 18, 49, 24] },
    { id: 'plant', label: 'Halden - the plant room', at: [30, 17, 49, 34], floor: 'B' },
  ],
  guards: [
    { id: 'h1', at: [25, 33, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'h2', at: [10, 27, 'G'], route: [[3, 27], [48, 27]], arms: 'smg' },
    { id: 'h3', at: [30, 15, 'G'], route: [[3, 15], [48, 15]], arms: 'carbine' },
    { id: 'h4', at: [28, 6, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'h5', at: [33, 9, 'G'], route: [[27, 5], [33, 5], [33, 10], [27, 10]], arms: 'carbine' },
    { id: 'h6', at: [7, 8, 'G'], arms: 'pistol' },
    { id: 'h7', at: [18, 8, 'G'], arms: 'carbine', rank: 'sergeant' },
    { id: 'h8', at: [16, 21, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },      // the radio: stop him before he calls it in
    { id: 'h9', at: [43, 7, 'G'], arms: 'shotgun', temper: 'steady' },
    { id: 'h10', at: [45, 21, 'G'], arms: 'smg' },
    { id: 'h11', at: [40, 30, 'B'], route: [[31, 29], [48, 29]], arms: 'carbine' },
    { id: 'h12', at: [38, 23, 'B'], arms: 'pistol', temper: 'cowardly' },
    { id: 'h13', at: [5, 21, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'h14', at: [27, 22, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },                  // the station's engineer: he puts a hacked system back on
  ],
  hostages: [{ id: 'brandt', name: 'Dr Ilse Brandt', she: true, at: [48, 38, 'B'] }],
  pickups: [{ id: 'samples', name: 'The sample case', what: 'the sample case', at: [30, 7, 'G'], table: false, h: 0.8, colour: [0.85, 0.85, 0.9] }],
  // (Rhys's roadmap: hacking and control) the station's security: cameras down the corridors and in the
  // lobby, a turret in decontamination and one in the data room - all on one network, whose terminal is
  // in the west office. Hack it: disable them, have them ignore you, or turn the turrets on the reds.
  devices: [
    { id: 'c-lobby', kind: 'camera', at: [24, 36, 'G'], face: [0, -1], net: 'halden' },
    { id: 'c-main-w', kind: 'camera', at: [2, 27, 'G'], face: [1, 0], net: 'halden' },
    { id: 'c-main-e', kind: 'camera', at: [49, 27, 'G'], face: [-1, 0], net: 'halden' },
    { id: 'c-serv-w', kind: 'camera', at: [2, 15, 'G'], face: [1, 0], net: 'halden' },
    { id: 'c-serv-e', kind: 'camera', at: [49, 15, 'G'], face: [-1, 0], net: 'halden' },
    { id: 't-decon', kind: 'turret', at: [48, 23, 'G'], face: [-1, -1], net: 'halden' },
    { id: 't-data', kind: 'turret', at: [45, 11, 'G'], face: [-1, -1], net: 'halden' },
    // (M6.28) decontamination's doors maglocked (the way down to the plant room); the corridors' lights;
    // the alarm, by the staff room
    { id: 'm-decon-s', kind: 'lock', at: [42, 25, 'G'], net: 'halden' },
    { id: 'm-decon-n', kind: 'lock', at: [42, 17, 'G'], net: 'halden' },
    { id: 'l-main', kind: 'lights', at: [3, 28, 'G'], face: [0, -1], area: [2, 26, 49, 28], name: 'the main corridor', net: 'halden' },
    { id: 'l-serv', kind: 'lights', at: [48, 14, 'G'], face: [0, 1], area: [2, 14, 49, 16], name: 'the service corridor', net: 'halden' },
    { id: 'a-bell', kind: 'alarm', at: [26, 26, 'G'], face: [0, 1], net: 'halden' },
    // and two pinhole cameras, in the walls - EMF finds them
    { id: 'c-pin-cave', kind: 'camera', at: [13, 2, 'G'], face: [1, 1], net: 'halden', hidden: true },
    { id: 'c-pin-staff', kind: 'camera', at: [29, 18, 'G'], face: [-1, 1], net: 'halden', hidden: true },
  ],
  terminals: [{ id: 'sec', name: 'the security terminal', at: [3, 23, 'G'], face: [1, 0], time: 6, net: 'halden' },
    { id: 'data', name: 'the data terminal', at: [44, 8, 'G'], face: [0, -1], time: 8, reveal: 30,
    said: 'Data terminal: the station\'s research is copied to your device - and the cameras put every red on your radar for 30 seconds.' }],
  objectives: [
    { id: 'o1', kind: 'rescue', ref: 'brandt', text: 'Find Dr Ilse Brandt and bring her out' },
    { id: 'o2', kind: 'take', ref: 'samples', text: 'Take the sample case (the cold store)' },
    { id: 'o3', kind: 'hack', ref: 'data', text: 'Hack the data terminal (the shielded room)' },
    { id: 'o4', kind: 'clear', text: 'Clear the reds out', optional: true },
  ],
};
