// FRONTLINE - Level 15, the Shipyard (first draft). Rhys (after M6.13.1): "a shipyard /
// battleship - something with massive closing blast doors that ordinary C5 cannot breach (a heavier
// charge, the controls, or a way round)". Varrow Naval Yard: the reds' cruiser Ardent alongside the
// fitting-out quay, her warhead arming codes locked in the armoured citadel on her lower deck.
const W = 80, H = 62;
const water = []; for (let y = 44; y < H; y++) for (let x = 0; x < W; x++) if (!(x >= 10 && x <= 62 && y >= 44 && y <= 54)) water.push([x, y]);
const rail = []; for (let x = 10; x <= 62; x++) { rail.push([x, 44]); rail.push([x, 54]); } for (let y = 45; y <= 53; y++) { rail.push([10, y]); rail.push([62, y]); }
export default {
  id: 'shipyard', no: 15, title: 'The Shipyard', place: 'Varrow Naval Yard',
  where: 'Varrow Naval Yard, the fitting-out quay. 05:10, first light, a sea fret coming in.',
  brief: [
    ['The place', 'The quay: the workshop, the container stacks, the dock control tower, the gatehouse. Alongside, the cruiser <b>Ardent</b>: up the gangway to her main deck (her turrets fore and aft), into the superstructure - its stair up to the bridge, its hatch down to the lower deck: the engine room, the mess, the magazine, and amidships the <b>armoured citadel</b>.'],
    ['Blast doors', 'The citadel is shut by blast doors: <b>no charge you carry will move them</b>. The dock control tower\'s terminal (top floor) opens them. Or find another way in - the engine room\'s ventilation runs that way, low enough that you would have to crawl (go prone).'],
    ['The reds', 'Sixteen - on the quay, in the tower, aboard; a machine gunner on the deck.'],
    ['Objectives', 'Take the <b>warhead arming codes</b> from the citadel. Optionally, hack the dock controls; stop <b>Captain Volkov</b> on the bridge.'],
  ],
  time: { date: [27, 8, 2026], hour: 5, minute: 10 }, faction: 'red',
  extractName: 'the van at the yard gate',
  outside: { backdrop: 'city', mat: 'concrete2', margin: 12 },
  floors: {
    G: {
      y: 0, wallH: 3.4, wall: 'paint', wallTint: [0.45, 0.48, 0.5], floor: 'metal', floorTint: [0.55, 0.57, 0.6], ceil: 'metal', channel: 2.5, lampPower: 0.7, lampColour: [1, 0.92, 0.8], lampEvery: 9,
      carve: { size: [W, H], ops: [
        // the cruiser's lower deck
        ['room', 11, 45, 61, 53],
        ['room', 11, 48, 61, 48, '#'], ['room', 11, 50, 61, 50, '#'],      // the passage (row 49) between the compartments
        ['room', 23, 45, 23, 47, '#'], ['room', 33, 45, 33, 53, '#'], ['room', 45, 45, 45, 53, '#'], ['room', 23, 51, 23, 53, '#'],
        ['room', 24, 46, 32, 46, '#'], ['room', 24, 45, 32, 45, 'u'],          // the vent: along the hull from the engine room into the citadel
        ['room', 53, 45, 53, 47, '#'], ['room', 53, 51, 53, 53, '#'],
        // the quay's buildings: the workshop, the dock control tower, the gatehouse
        ['room', 4, 4, 24, 18], ['room', 66, 4, 74, 12], ['room', 74, 36, 78, 41],
      ], after: [
        ['cells', water, '~'],
        ['cell', 33, 49, 'Q'], ['cell', 45, 49, 'Q'], ['cell', 23, 45, '.'], ['cell', 33, 45, 'u'],
        ['cells', [[17, 48], [17, 50], [30, 48], [28, 50], [37, 48], [40, 50], [49, 48], [49, 50], [57, 48], [57, 50]], 'D'],
        ['cells', [[13, 46], [16, 46], [19, 46], [13, 52], [16, 52], [19, 52]], 'M'],
        ['cells', [[26, 52], [30, 52]], 'T'], ['cells', [[47, 46], [49, 46], [51, 46], [47, 52], [50, 52]], 'C'],
        ['cells', [[36, 46], [42, 46], [36, 52], [42, 52]], 'H'], ['cells', [[39, 46]], 'K'],
        ['cells', [[6, 6], [10, 6], [14, 6], [6, 16], [10, 16]], 'M'], ['cells', [[20, 8], [21, 8], [20, 14]], 'C'], ['cell', 14, 19, 'D'], ['cell', 15, 19, 'D'], ['cell', 25, 11, 'D'],
        ['cell', 70, 13, 'D'], ['cell', 73, 36, 'D'], ['cells', [[76, 38]], 'T'],
        ['cells', [[30, 30], [31, 30], [30, 31], [34, 34], [35, 34], [40, 30], [41, 30], [41, 31], [46, 34], [50, 30], [51, 30], [56, 34], [57, 34], [8, 34], [9, 34], [12, 30]], 'C'],
        ['cells', [[28, 6], [36, 6], [44, 6], [52, 6]], 'v'],
      ] },
    },
    1: {
      y: 3.6, wallH: 3.2, wall: 'paint', wallTint: [0.5, 0.53, 0.56], floor: 'metal', floorTint: [0.5, 0.52, 0.55], ceil: 'metal', lampPower: 0.7,
      carve: { size: [W, H], walls: false, ops: [
        ['room', 10, 44, 62, 54, '.'], ['cells', rail, '='], ['cell', 30, 44, '.'],
        ['text', 26, 46, ['###############', '#.............#', '#.............#', 'D.............D', '#.............#', '#.............#', '###############']],
        ['cells', [[44, 48], [48, 50], [20, 47]], 'C'],
        ['text', 66, 4, ['###########', '#.........#', '#..T...T..#', '#.........#', '#.........#', '#.........#', '#.........#', '#.........#', '#.........#', '###########']],
      ] },
    },
    2: {
      y: 7.0, wallH: 3.0, wall: 'paint', wallTint: [0.55, 0.58, 0.6], floor: 'carpet', floorTint: [0.4, 0.42, 0.45], ceil: 'metal', lampPower: 0.8,
      carve: { size: [W, H], walls: false, ops: [
        ['text', 27, 45, ['#############', '#...........#', 'W...T..T....W', 'W...........W', 'W.....K.....W', '#...........#', '#############']],
        ['text', 66, 4, ['###########', '#.........#', '#..KKK....W', '#.........#', '#.........W', '#.........#', '#.........W', '#.........#', '#.........#', '###########']],
      ] },
    },
  },
  stairs: [
    { x: 30, y: 40, dir: 'S', len: 4, w: 1, from: 'G', to: '1' },           // the gangway
    { x: 24, y: 51, dir: 'E', len: 5, w: 1, from: 'G', to: '1' },           // the hatch, up from the mess into the superstructure
    { x: 38, y: 47, dir: 'W', len: 5, w: 1, from: '1', to: '2' },           // up to the bridge
    { x: 67, y: 11, dir: 'N', len: 5, w: 1, from: 'G', to: '1' }, { x: 73, y: 5, dir: 'S', len: 5, w: 1, from: '1', to: '2' },     // the tower
  ],
  start: { x: 2, y: 30, floor: 'G', yaw: -Math.PI / 2, van: [-3, 2] },
  extra(kit) {
    const { box, CELL, mid } = kit;
    // her turrets, fore and aft, and the guns' barrels; the yard's cranes
    for (const [x, d] of [[16, 1], [56, -1]]) {
      box([mid(x) - 3, 3.6, mid(49) - 3], [mid(x) + 3, 6.4, mid(49) + 3], 'paint', { tint: [0.42, 0.45, 0.48] });
      for (const dz of [-0.9, 0.9]) box([mid(x) + d * 3, 4.6, mid(49) + dz - 0.2], [mid(x) + d * 10, 5.0, mid(49) + dz + 0.2], 'metal', { solid: false, tint: [0.3, 0.32, 0.34] });
    }
    for (const x of [28, 48]) { box([mid(x) - 0.6, 0, mid(41) - 0.6], [mid(x) + 0.6, 22, mid(41) + 0.6], 'paint', { tint: [0.85, 0.65, 0.1] }); box([mid(x) - 0.5, 21, mid(30)], [mid(x) + 0.5, 22.4, mid(52)], 'paint', { tint: [0.85, 0.65, 0.1], solid: false }); }
    // the machine gunner's nest on the foredeck: sandbags round a mounted gun
    box([mid(20) - 1.4, 3.6, mid(51) - 1.4], [mid(20) + 1.4, 4.5, mid(51) - 1.0], 'tarp', { tint: [0.6, 0.55, 0.4] });
    box([mid(20) - 1.4, 3.6, mid(51) + 1.0], [mid(20) + 1.4, 4.5, mid(51) + 1.4], 'tarp', { tint: [0.6, 0.55, 0.4] });
  },
  zones: [
    { id: 'quay', label: 'Varrow - the fitting-out quay', at: [0, 20, 79, 43] },
    { id: 'tower', label: 'Varrow - the dock control tower', at: [66, 4, 74, 12] },
    { id: 'towertop', label: 'The dock control tower - the control room', at: [66, 4, 76, 12], floor: '2' },
    { id: 'deck', label: 'Ardent - the main deck', at: [10, 44, 62, 54], floor: '1' },
    { id: 'bridge', label: 'Ardent - the bridge', at: [27, 45, 39, 51], floor: '2' },
    { id: 'engine', label: 'Ardent - the engine room', at: [11, 45, 22, 53] },
    { id: 'citadel', label: 'Ardent - the armoured citadel', at: [34, 45, 44, 53] },
    { id: 'lower', label: 'Ardent - the lower deck', at: [11, 45, 61, 53] },
  ],
  guards: [
    { id: 'y1', at: [40, 36, 'G'], route: [[6, 38], [72, 38]], arms: 'carbine' },
    { id: 'y2', at: [20, 26, 'G'], route: [[4, 24], [60, 24], [60, 30], [4, 30]], arms: 'smg' },
    { id: 'y3', at: [76, 39, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'y4', at: [10, 10, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'y5', at: [70, 8, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'y6', at: [70, 8, '1'], route: [[67, 6], [74, 6], [74, 11], [67, 11]], arms: 'smg' },
    { id: 'y7', at: [70, 10, '2'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'y8', at: [30, 41, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'y9', at: [20, 51, '1'], arms: 'lmg', rank: 'sergeant', temper: 'steady' },
    { id: 'y10', at: [50, 46, '1'], route: [[45, 46], [60, 46], [60, 52], [45, 52]], arms: 'carbine' },
    { id: 'y11', at: [33, 49, '1'], arms: 'smg', temper: 'steady' },
    { id: 'volkov', at: [33, 48, '2'], arms: 'revolver', rank: 'officer', temper: 'steady', name: 'Captain Volkov' },
    { id: 'y13', at: [16, 49, 'G'], route: [[12, 49], [32, 49]], arms: 'smg' },
    { id: 'y14', at: [39, 49, 'G'], arms: 'shotgun', temper: 'steady' },
    { id: 'y15', at: [55, 49, 'G'], route: [[46, 49], [60, 49]], arms: 'carbine' },
    { id: 'y16', at: [28, 52, 'G'], arms: 'pistol' },
  ],
  pickups: [{ id: 'codes', name: 'The warhead arming codes', what: 'the codes', at: [39, 46, 'G'], table: false, h: 1.12, colour: [0.9, 0.2, 0.2] }],
  terminals: [{ id: 'dock', name: 'the dock control terminal', at: [68, 6, '2'], face: [0, -1], time: 6, reveal: 30,
    said: 'Dock controls: the Ardent\'s citadel blast doors are open, and the yard cameras put every red on your radar for 30 seconds.' }],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'codes', text: 'Take the warhead arming codes (the citadel)' },
    { id: 'o2', kind: 'hack', ref: 'dock', text: 'Hack the dock controls (the tower)', optional: true },
    { id: 'o3', kind: 'kill', ref: 'volkov', text: 'Stop Captain Volkov (the bridge)', optional: true },
  ],
};
