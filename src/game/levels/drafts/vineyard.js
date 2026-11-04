// FRONTLINE - Level 123, the Vineyard (first draft, M6.145; THE ESCAPE, second). "V." was a vineyard in the Vintners'
// country, the house of a man called Varo, who turns out to be Kray's half-brother. Kray is not in the house. Varo's
// son is about to go to him with food and the news. Take the false passport waiting in the house for Kray, then
// follow the son through the vines to wherever Kray is hiding.
const W = 58, H = 40;
const ROWS = [];
for (let y = 10; y <= 30; y += 4) { ROWS.push(['room', 10, y, 24, y, 'K']); ROWS.push(['room', 29, y, 42, y, 'K']); }
export default {
  id: 'vineyard', no: 123, title: 'The Vineyard', place: 'the Varo vineyard, the Vintners\' country',
  where: 'The Varo vineyard, the Vintners\' country. 20:50, the vintage half in, the light going.',
  brief: [
    ['The job', '"V." was a vineyard in the Vintners\' country, the house of a man called <b>Varo</b>, who turns out to be <b>Kray\'s half-brother</b>. Kray is not in the house. Varo\'s <b>son</b> is about to go to him with food and the news. Take the <b>false passport</b> waiting in the house for Kray. Then <b>follow the son</b> through the vines to wherever Kray is hiding.'],
    ['The place', 'The <b>house</b> is in the north-west corner, with the winery beside it. The <b>vines</b> run in long rows across the middle, with a track down through them. The far side of the vineyard is east, and the river is beyond it. You come in along the river path, from the south.'],
    ['Security', 'Varo keeps men of his own on the house and the winery, and some of Kray\'s friends are with them now. The son is nervous and looks over his shoulder. If he sees you following, he will run, and Kray with him.'],
    ['Objectives', 'Take the <b>passport</b> (the house). <b>Follow the son</b> to where he goes. Back along the river path, south.'],
  ],
  epilogue: {
    success: 'The son leads Ghost through the vines to the old water mill on the river, where Kray is waiting for a boat that will now not come. Kray\'s false passport is in Ghost\'s pocket, and his photograph is on it.',
    partial: 'The son got there unfollowed, or the passport stayed in the house. Kray will be warned, or will have a way out.',
  },
  time: { date: [30, 8, 2027], hour: 20, minute: 50 }, night: true, faction: 'red',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.35, 0.28, 0.3, 30, 200], ambient: [0.36, 0.3, 0.32] },
  extractName: 'the river path, south', extract: { x: 20, y: 38, floor: 'G', van: [7, 0] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 3.4, wall: 'plaster', wallTint: [0.92, 0.84, 0.7], floor: 'tile', ceil: 'wood', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 2, 2, 6, 6],                           // the house
        ['room', 10, 2, 18, 6],                         // the winery
        ['room', 48, 31, 54, 37],                       // the old water mill
      ], after: [
        ...ROWS,
        ['cells', [[7, 4], [8, 7], [14, 7], [47, 34]], 'D'],
        ['cells', [[4, 1], [14, 1], [51, 30], [55, 34]], 'W'],
        ['cells', [[3, 3]], 'T'], ['cells', [[5, 5]], 'Y'],
        ['room', 11, 3, 17, 3, 'C'], ['cells', [[16, 5]], 'M'],
        ['cells', [[50, 32]], 'T'], ['cells', [[53, 36]], 'Y'], ['cells', [[52, 33]], 'M'],
        // carts and baskets of grapes along the track
        ['cells', [[27, 6], [46, 12], [46, 26], [4, 24], [16, 34], [36, 36]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    box([0, -0.05, 39 * C], [W * C, 0.02, H * C + 4], 'glassB', { tint: [0.2, 0.3, 0.35], solid: false });
    for (const [x, y] of [[8, 8], [26, 8], [44, 34], [8, 34]]) level.lights.push({ pos: [mid(x), 3.4, mid(y)], range: 9, intensity: 0.7, color: [1, 0.85, 0.6], street: true });
  },
  start: { x: 20, y: 37, floor: 'G', yaw: 0 },
  zones: [
    { id: 'house', label: 'The vineyard - Varo\'s house', at: [2, 2, 6, 6] },
    { id: 'winery', label: 'The vineyard - the winery', at: [10, 2, 18, 6] },
    { id: 'mill', label: 'The vineyard - the old water mill', at: [48, 31, 54, 37] },
    { id: 'vines', label: 'The Varo vineyard', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'son', at: [8, 8, 'G'], route: [[8, 34, 30], [26, 34], [26, 8], [44, 8], [44, 34], [49, 34, 1e9]],
      arms: 'pistol', temper: 'cowardly', name: 'Varo\'s son', tint: [0.7, 0.6, 0.5] },
    { id: 'varo', at: [4, 4, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'Varo' },
    { id: 'hs1', at: [9, 5, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'wn1', at: [13, 5, 'G'], arms: 'smg' },
    { id: 'kf1', at: [30, 4, 'G'], route: [[22, 4], [44, 4]], arms: 'carbine' },
    { id: 'kf2', at: [52, 20, 'G'], route: [[52, 8], [52, 28]], arms: 'carbine', dog: true },
    { id: 'kray', at: [51, 35, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Anselm Kray', tint: [0.9, 0.85, 0.75] },
  ],
  civilians: [
    { id: 'picker', at: [27, 20, 'G'], yaw: 0, title: 'A grape picker, late home', tint: [1.0, 0.9, 0.8], says: ['The boy takes a basket down to the old mill every night now. Nobody has milled anything there in twenty years.'] },
  ],
  pickups: [{ id: 'passport', name: 'The false passport', what: 'the passport', at: [3, 3, 'G'], table: true, colour: [0.2, 0.25, 0.5] }],
  intel: [
    { id: 'note', at: [50, 32, 'G'], kind: 'Note', title: 'A note in the mill', text: ['"Boat Thursday, the old bridge, midnight. Bring the passport. - K." It is Thursday.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'passport', text: 'Take the false passport (the house)' },
    { id: 'o2', kind: 'tail', ref: 'son', range: 40, near: 5, lose: 16, text: 'Follow Varo\'s son to where he goes',
      said: 'The son goes into the old water mill with his basket. Somebody inside says his name. It is Kray\'s voice.' },
  ],
};
