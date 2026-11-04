// FRONTLINE - Level 79, the Hunting Party (first draft, M6.101; the first of THE COLONEL). The ambush orders at the
// wrong bridge named the officer in the north who planned it: Colonel Strand. On Sundays he hunts in the Vashka woods
// with a party of his officers and a few men to beat for them, spread out through the trees. Take him alive out there,
// away from his headquarters, with Hale and Moss - quietly, if you can - and take his map case from the hunting hut.
const W = 60, H = 46;
export default {
  id: 'hunt', no: 79, title: 'The Hunting Party', place: 'the Vashka woods',
  where: 'The Vashka woods. 08:30, a Sunday, frost on the bracken, shots in the distance.',
  brief: [
    ['The job', 'The ambush orders named the officer who planned them: <b>Colonel Strand</b>. On Sundays he hunts in the <b>Vashka woods</b> with his officers, spread out through the trees, beaters going ahead of them. <b>Take him alive</b> out there, away from his headquarters. Take his <b>map case</b> from the hunting hut too. If you can, do it <b>without the alarm</b>: there is a field telephone and a siren at the hut. Hale and Moss are with you.'],
    ['The place', 'Pine woods on a slope. There is a clearing in the middle with the <b>hunting hut</b>. The guns are spread along a line through the trees, and the beaters walk towards them from the east. Strand walks his own stretch of it with his loader, north of the hut.'],
    ['Security', 'The officers are armed and so are the beaters. A siren and a camera at the hut. The field telephone and its console are in the hut, and the engineer is with the trucks on the track, west. Gunfire is normal out here this morning, but a man screaming is not.'],
    ['Objectives', '<b>Take Colonel Strand alive</b> (north of the hut). Take his <b>map case</b> (the hunting hut). If you can, <b>without the alarm</b>. Out through the woods, south.'],
  ],
  epilogue: {
    success: 'Colonel Strand misses his Sunday lunch and his Monday staff meeting, and by Tuesday his headquarters has stopped pretending he is ill. His map case has the north\'s whole plan for the spring.',
    partial: 'The colonel, or his map case, but not both. The north will know by evening that someone came for him in the woods.',
  },
  time: { date: [18, 4, 2027], hour: 8, minute: 30 }, night: false, faction: 'red', requires: 'HACKKIT', weather: 'snow',
  relations: { red: { you: true, ghost: true }, ghost: { you: false, red: true } },
  startLoadout: { primary: 'LR7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SCOPE8'], backup: ['SILENCER'] } },
  atmos: { fog: [0.72, 0.75, 0.8, 30, 200], ambient: [0.55, 0.57, 0.62] },
  extractName: 'the woods, south', extract: { x: 30, y: 45, floor: 'G' },
  outside: { backdrop: 'woods', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'wood', wallTint: [0.45, 0.36, 0.28], floor: 'wood', ceil: 'wood', lampPower: 0.5, lampColour: [1, 0.9, 0.75], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 27, 20, 33, 25],                       // the hunting hut
      ], after: [
        ['cells', [[30, 26], [26, 22]], 'D'], ['cells', [[34, 22], [30, 19]], 'W'],
        ['cells', [[28, 21], [32, 24], [28, 24]], 'T'], ['cells', [[32, 21]], 'M'],
        // the trucks on the track (west), a woodpile, the line's butts
        ['cells', [[4, 20], [4, 24], [12, 10], [20, 8], [40, 8], [48, 10], [14, 30], [44, 32], [24, 36], [38, 38]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid } = kit;
    const pines = [[6, 4], [14, 3], [24, 4], [36, 3], [46, 4], [54, 6], [3, 12], [18, 13], [28, 12], [40, 14], [52, 13], [8, 18], [20, 19],
      [44, 20], [56, 19], [10, 27], [22, 28], [38, 28], [50, 27], [6, 34], [18, 35], [30, 33], [42, 35], [54, 34], [12, 41], [26, 41], [36, 42], [48, 41]];
    for (const [x, y] of pines) {
      box([mid(x) - 0.2, 0, mid(y) - 0.2], [mid(x) + 0.2, 3, mid(y) + 0.2], 'wood', { tint: [0.3, 0.22, 0.15] });
      box([mid(x) - 1.1, 2.4, mid(y) - 1.1], [mid(x) + 1.1, 6.5, mid(y) + 1.1], 'paint', { tint: [0.14, 0.26, 0.17], solid: false });
    }
  },
  start: { x: 30, y: 44, floor: 'G', yaw: 0 },
  zones: [
    { id: 'hut', label: 'The Vashka woods - the hunting hut', at: [27, 20, 33, 25] },
    { id: 'line', label: 'The Vashka woods - the line', at: [0, 0, W - 1, 18] },
    { id: 'track', label: 'The Vashka woods - the track', at: [0, 0, 8, H - 1] },
    { id: 'woods', label: 'The Vashka woods', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'hale', at: [29, 45, 'G'], faction: 'ghost', ally: true, name: 'Hale', arms: 'carbine', temper: 'steady', tint: [0.45, 0.6, 1.35] },
    { id: 'moss', at: [31, 45, 'G'], faction: 'ghost', ally: true, name: 'Moss', arms: 'smg', temper: 'bold', tint: [0.4, 0.55, 1.3] },
    // Strand walks his stretch of the line with his loader
    { id: 'strand', at: [30, 10, 'G'], route: [[22, 10], [38, 10]], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'Colonel Strand', tint: [0.3, 0.32, 0.28] },
    { id: 'loader', at: [31, 11, 'G'], route: [[23, 11], [39, 11]], arms: 'carbine', temper: 'steady', name: 'The colonel\'s loader' },
    { id: 'o1', at: [12, 14, 'G'], route: [[8, 14], [18, 14]], arms: 'carbine', rank: 'officer', temper: 'bold' },
    { id: 'o2', at: [48, 14, 'G'], route: [[42, 15], [54, 15]], arms: 'carbine', rank: 'officer', temper: 'bold' },
    { id: 'bt1', at: [54, 26, 'G'], route: [[54, 30], [54, 18]], arms: 'smg' },
    { id: 'bt2', at: [46, 30, 'G'], route: [[46, 34], [46, 22]], arms: 'carbine' },
    { id: 'rad', at: [29, 23, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'hk', at: [32, 22, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'eng', at: [3, 22, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'drv', at: [5, 26, 'G'], arms: 'carbine', temper: 'steady' },
  ],
  pickups: [{ id: 'maps', name: 'The colonel\'s map case', what: 'the map case', at: [28, 21, 'G'], table: true, colour: [0.45, 0.3, 0.2] }],
  devices: [
    { id: 'c-hut', kind: 'camera', at: [34, 26, 'G'], face: [1, 1], net: 'vashkaw' },
    { id: 'a-hut', kind: 'alarm', at: [26, 26, 'G'], face: [-1, 1], net: 'vashkaw' },
  ],
  terminals: [{ id: 'sec', name: 'the hut\'s field console', at: [32, 24, 'G'], face: [-1, 0], time: 6, net: 'vashkaw' }],
  intel: [
    { id: 'game', at: [28, 24, 'G'], kind: 'Game book', title: 'The hunt\'s game book', text: ['Last Sunday: two boar, one deer, and "Major Ilic, a beater, by mistake". The colonel has written "unfortunate" in the margin.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'capture', ref: 'strand', text: 'Take Colonel Strand alive (north of the hut)' },
    { id: 'o2', kind: 'take', ref: 'maps', text: 'Take the map case (the hunting hut)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
