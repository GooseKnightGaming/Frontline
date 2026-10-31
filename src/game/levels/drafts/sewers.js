// FRONTLINE - Level 5, the Sewers (first draft). Rhys: "a proper, full map set in the
// sewers, not just a partial of a different map". The reds have been moving guns under the city;
// a water engineer who found their depot has not come back up.
export default {
  id: 'sewers', no: 5, title: 'The Sewers', place: 'the sewers',
  where: 'Under the old city, 01:20. The storm outfall off Canal Street, and the tunnels beyond it.',
  brief: [
    ['The place', 'Victorian brick: an outfall chamber down a flight of steps from the street, the main tunnel running east with its channel down the middle (shin deep - wade it or use the bridges), a great overflow chamber, the pump room, and south of it all the old maintenance depot the reds have made their own. Dark: night vision is in your kit.'],
    ['The reds', 'Eleven of them, with torches - you will see those coming. The officer in the depot wears night vision.'],
    ['Objectives', 'Find <b>Dalia Brennan</b>, the city water engineer, and bring her back up to the van; take the reds\' <b>shipment manifest</b> from the depot office. Clearing the reds out is optional.'],
    ['Doors', 'The depot\'s back room is locked - kick it in.'],
  ],
  time: { date: [18, 7, 2026], hour: 1, minute: 20 }, night: true, dark: true, startGear: 'NVG', faction: 'red',
  extractName: 'the van on Canal Street', safeName: 'the van on Canal Street',
  outside: { backdrop: 'city', mat: 'asphalt', margin: 18 },
  floors: {
    S: {
      y: -4.8, wallH: 3.8, wall: 'brick', wallTint: [0.75, 0.62, 0.5], floor: 'concrete2', floorTint: [0.6, 0.58, 0.52], ceil: 'brick', ceilTint: [0.55, 0.45, 0.38],
      channel: 0.4, sewer: true, flow: [1, 0], lampPower: 1.0, lampRange: 12, lampColour: [1, 0.78, 0.5], lampEvery: 9,      // (Rhys: "VERY dark")
      carve: { size: [48, 36], ops: [
        ['room', 3, 1, 14, 5],                         // the outfall chamber (the steps come down into it from the east)
        ['room', 3, 6, 5, 6],
        ['room', 3, 7, 46, 11], ['room', 3, 9, 46, 9, '~'],   // the main tunnel and its channel
        ['room', 18, 3, 28, 15], ['room', 18, 9, 28, 9, '~'],  // the overflow chamber
        ['cells', [[20, 5], [26, 5], [20, 13], [26, 13]], 'P'],
        ['room', 34, 1, 45, 5],                        // the pump room
        ['room', 8, 13, 14, 18],                       // a storeroom off the tunnel
        ['room', 22, 16, 25, 23], ['room', 23, 16, 23, 23, '~'],   // the south branch down to the depot
        ['room', 12, 25, 32, 33],                      // the maintenance depot
        ['room', 18, 25, 18, 29, '#'], ['room', 12, 30, 18, 30, '#'],   // its office (north-west)
        ['room', 26, 25, 26, 29, '#'], ['room', 26, 29, 32, 29, '#'],   // its back room (north-east)
        ['room', 44, 12, 46, 26], ['room', 34, 27, 46, 29],            // the east passage round to the depot's side door
      ], after: [
        ['cells', [[10, 9], [33, 9], [41, 9]], '.'],   // bridges over the channel
        ['cell', 39, 6, 'D'], ['cell', 11, 12, 'D'], ['cell', 24, 24, 'D'], ['cell', 25, 24, 'D'],
        ['cell', 18, 27, 'D'], ['cell', 26, 27, 'L'], ['cell', 33, 28, 'D'],
        ['cells', [[36, 2], [38, 2], [40, 2], [42, 2]], 'M'],
        ['cells', [[9, 14], [10, 14], [13, 17], [12, 17], [9, 17]], 'C'], ['cells', [[13, 14]], 'B'],
        ['cells', [[20, 27], [21, 27], [22, 31], [25, 31], [15, 32], [29, 32], [20, 32], [30, 31]], 'C'], ['cells', [[23, 28], [14, 33]], 'B'],
        ['cells', [[14, 26], [16, 28]], 'T'], ['cells', [[13, 28]], 'H'],
        ['cells', [[28, 13], [29, 13]], 'C'], ['cells', [[45, 18]], 'B'],
      ] },
    },
    G: {
      y: 0, wallH: 3, lamps: false,
      carve: { size: [48, 36], walls: false, ops: [
        ['room', 5, 1, 14, 1, 'f'], ['room', 5, 4, 14, 4, 'f'], ['cells', [[5, 2], [5, 3]], 'f'],
        ['cells', [[19, 4], [22, 4], [26, 0], [30, 4]], 'v'],
        // (Rhys: "I struggled to see the Sewer Entrance even with Nightvision") Canal Street's lamps,
        // one over the steps down
        ['cells', [[15, 0], [15, 5], [9, 0], [24, 0], [32, 5], [4, 5]], 'l'],
      ] },
    },
  },
  stairs: [{ x: 6, y: 2, dir: 'E', len: 8, w: 2, from: 'S', to: 'G' }],
  start: { x: 17, y: 2, floor: 'G', yaw: Math.PI / 2, van: [3, 3] },
  zones: [
    { id: 'outfall', label: 'The Sewers - the outfall chamber', at: [3, 1, 14, 6], floor: 'S' },
    { id: 'tunnel', label: 'The Sewers - the main tunnel', at: [3, 7, 46, 11], floor: 'S' },
    { id: 'overflow', label: 'The Sewers - the overflow chamber', at: [18, 3, 28, 15], floor: 'S' },
    { id: 'pumps', label: 'The Sewers - the pump room', at: [34, 1, 45, 5], floor: 'S' },
    { id: 'depot', label: 'The Sewers - the maintenance depot', at: [12, 25, 32, 33], floor: 'S' },
  ],
  guards: [
    { id: 's1', at: [4, 8, 'S'], route: [[4, 8], [16, 8]], arms: 'carbine' },
    { id: 's2', at: [23, 6, 'S'], arms: 'pistol', temper: 'steady' },
    { id: 's3', at: [25, 14, 'S'], route: [[19, 14], [27, 14], [27, 4], [19, 4]], arms: 'carbine' },
    { id: 's4', at: [40, 4, 'S'], arms: 'shotgun', temper: 'steady' },
    { id: 's5', at: [30, 10, 'S'], route: [[30, 10], [45, 10]], arms: 'smg' },
    { id: 's6', at: [24, 20, 'S'], arms: 'carbine', temper: 'steady' },
    { id: 's7', at: [20, 29, 'S'], arms: 'pistol', rank: 'officer', temper: 'steady' },
    { id: 's8', at: [28, 32, 'S'], route: [[14, 32], [31, 32]], arms: 'carbine', rank: 'sergeant' },
    { id: 's9', at: [25, 27, 'S'], arms: 'smg', temper: 'steady' },
    { id: 's10', at: [45, 20, 'S'], route: [[45, 13], [45, 28], [36, 28]], arms: 'carbine' },
    { id: 's11', at: [11, 15, 'S'], arms: 'pistol', temper: 'cowardly' },
  ],
  hostages: [{ id: 'engineer', name: 'Dalia Brennan', she: true, at: [30, 26, 'S'] }],
  pickups: [{ id: 'manifest', name: 'The shipment manifest', what: 'the manifest', at: [14, 26, 'S'], table: false, h: 0.8 }],
  objectives: [
    { id: 'o1', kind: 'rescue', ref: 'engineer', text: 'Bring Dalia Brennan out' },
    { id: 'o2', kind: 'take', ref: 'manifest', text: 'Take the shipment manifest' },
    { id: 'o3', kind: 'clear', text: 'Clear the reds out', optional: true },
  ],
};
