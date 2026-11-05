// FRONTLINE - Level 115, the Caravan (first draft, M6.137; the end of THE BUYER). Kray's diary said Tuesday, inland, the
// Bir Sahra well: his caravan camps there on its way south with the last of the north's crates, and Kray comes out
// to see it off himself. Get into the camp before dawn. Take Kray alive in his tent, and stop the lead lorry, which
// carries the crates, before it is out of the camp.
const W = 60, H = 40;
export default {
  id: 'caravan', no: 115, title: 'The Caravan', place: 'the Bir Sahra well',
  where: 'The Bir Sahra well, inland of the Dry Coast. 04:40, the stars going out, the engines being warmed.',
  brief: [
    ['The job', 'Kray\'s diary said Tuesday, inland, the <b>Bir Sahra well</b>. His <b>caravan</b> camps there on its way south with the last of the north\'s crates, and Kray comes out to see it off himself. Get into the camp before dawn. <b>Take Kray alive</b> in his tent. <b>Stop the lead lorry</b>, which carries the crates, before it is out of the camp.'],
    ['The place', 'The <b>well</b> is in the middle of the camp, with the caravan\'s lorries drawn up round it and the <b>lead lorry</b> on the east side, facing out. <b>Kray\'s tent</b> is the big one, north. The drivers\' tents are west and the guards\' south. You come in over the dunes from the west.'],
    ['Security', 'No alarm and no console out here, only the caravan\'s guards, and a lookout on the ridge east with a rifle. The lead lorry leaves in about four minutes, or at once if its crew are shot at.'],
    ['Objectives', '<b>Take Kray alive</b> (his tent). <b>Stop the lead lorry</b> before it is out of the camp, east. Back over the dunes, west.'],
  ],
  epilogue: {
    success: 'Anselm Kray rides out of Bir Sahra in the back of his own lorry, tied to his own crates. By the end of the summer there is nobody left on the Dry Coast who will sell the north\'s rifles, because there is nobody left to buy from.',
    partial: 'Kray or his crates, not both. Somewhere south the trade goes on, a little smaller.',
  },
  time: { date: [27, 7, 2027], hour: 4, minute: 40 }, night: true, faction: 'red',
  startLoadout: { primary: 'LR7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SCOPE8'], backup: ['SILENCER'] } },
  atmos: { fog: [0.3, 0.26, 0.26, 40, 240], ambient: [0.36, 0.32, 0.34] },
  extractName: 'the dunes, west', extract: { x: 2, y: 20, floor: 'G', van: [0, 8] },
  outside: { backdrop: 'hills', mat: 'desert', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 2.6, wall: 'paint', wallTint: [0.85, 0.78, 0.6], floor: 'wood', ceil: 'paint', lampPower: 0.45, lampColour: [1, 0.8, 0.55], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 24, 6, 34, 11],                        // Kray's tent
        ['room', 10, 14, 15, 18],                       // a drivers' tent
        ['room', 10, 22, 15, 26],                       // another
        ['room', 22, 30, 28, 34],                       // the guards' tent
        ['room', 32, 30, 38, 34],                       // another
      ], after: [
        ['cells', [[29, 12], [16, 16], [16, 24], [25, 29], [35, 29]], 'D'],
        ['cells', [[26, 8], [32, 8]], 'Y'], ['cells', [[29, 7]], 'T'], ['cells', [[33, 10]], 'T'], ['cells', [[25, 10]], 'H'],
        ['cells', [[11, 15], [11, 17], [11, 23], [11, 25]], 'Y'],
        ['cells', [[23, 31], [27, 31], [33, 31], [37, 31]], 'Y'], ['cells', [[25, 33]], 'T'],
        // the well, the other lorries drawn up round it, crates and water drums
        ['cells', [[29, 20]], 'M'], ['room', 22, 16, 23, 18, 'C'], ['room', 22, 22, 23, 24, 'C'], ['room', 35, 16, 36, 17, 'C'],
        ['cells', [[18, 20], [6, 8], [48, 8], [30, 26]], 'B'], ['cells', [[40, 26], [6, 32], [48, 32]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { level, mid } = kit;
    for (const [x, y] of [[29, 18], [29, 13], [19, 20], [30, 28]]) level.lights.push({ pos: [mid(x), 2.6, mid(y)], range: 8, intensity: 0.75, color: [1, 0.75, 0.45] });
  },
  vehicles: [
    { id: 'leadlorry', kind: 'car', model: 'lightUtility', paint: 'olive', at: [40, 20], yaw: -Math.PI / 2, path: [[40, 20], [48, 20], [56, 20], [59, 20]],
      speed: 7, goal: 'escape', wait: 240, hp: 620, name: 'The lead lorry',
      crew: [{ id: 'ld', at: [-0.42, 0.15] }, { id: 'lm', at: [0.42, 0.15] }] },
  ],
  start: { x: 2, y: 19, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'tent', label: 'Bir Sahra - Kray\'s tent', at: [24, 6, 34, 11] },
    { id: 'well', label: 'Bir Sahra - the well', at: [20, 14, 40, 27] },
    { id: 'guards', label: 'Bir Sahra - the guards\' tents', at: [22, 30, 38, 34] },
    { id: 'sahra', label: 'Bir Sahra', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'kray', at: [30, 9, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Anselm Kray', tint: [0.9, 0.85, 0.75] },
    { id: 'kg1', at: [28, 10, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'kg2', at: [29, 13, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'ld', at: [40, 20, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'lm', at: [41, 20, 'G'], arms: 'carbine', temper: 'bold' },
    { id: 'w1', at: [26, 20, 'G'], route: [[20, 20], [33, 20]], arms: 'carbine' },
    { id: 'g1', at: [25, 32, 'G'], arms: 'carbine' },
    { id: 'g2', at: [30, 37, 'G'], route: [[18, 37], [44, 37]], arms: 'carbine', dog: true },
    { id: 'look', at: [52, 14, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady', yaw: Math.PI / 2 },
  ],
  civilians: [
    { id: 'driver', at: [13, 16, 'G'], yaw: Math.PI / 2, title: 'A driver, awake early', tint: [0.9, 0.8, 0.65], says: ['I drive what they load. This time it is guns. Last time it was oranges. I liked the oranges.'] },
  ],
  intel: [
    { id: 'ledger', at: [29, 7, 'G'], kind: 'Ledger', title: 'Kray\'s ledger, on his camp table', text: ['Every crate since the spring, bought from the north and sold in the south. The last line: "Bir Sahra - forty - final."'] },
    { id: 'route', at: [25, 33, 'G'], kind: 'Map', title: 'The caravan\'s route', text: ['South from Bir Sahra for six days, to a name with a ring round it and the word "paid".'] },
  ],
  objectives: [
    { id: 'o1', kind: 'capture', ref: 'kray', text: 'Take Kray alive (his tent)' },
    { id: 'o2', kind: 'stop', ref: 'leadlorry', text: 'Stop the lead lorry before it is out of the camp' },
  ],
};
