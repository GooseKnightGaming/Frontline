// FRONTLINE - Level 109, the Signing (first draft, M6.131; the end of THE PEACE). The talks at Lake Morra have done what
// nobody thought they would: there is a treaty, and it is to be signed this afternoon in the Ostberg house's great hall.
// The service is finished, but its last die-hards are not, and they are coming to the house to stop the pens. Hold the
// great hall with Hale and Moss until the last signature is on the paper, and mark the man leading the attack.
const W = 50, H = 38;
export default {
  id: 'signing', no: 109, title: 'The Signing', place: 'the Ostberg house, Lake Morra',
  where: 'The Ostberg house, Lake Morra. 15:00, the treaty on the long table, the pens uncapped.',
  brief: [
    ['The job', 'The talks at Lake Morra have done what nobody thought they would. There is a <b>treaty</b>, and it is to be signed this afternoon in the Ostberg house\'s <b>great hall</b>. The service is finished, but its last die-hards are not, and they are coming to the house to stop the pens. <b>Hold the great hall</b> with <b>Hale and Moss</b> until the last signature is on the paper. <b>Mark the man leading the attack</b>.'],
    ['The place', 'The house as you left it: the <b>great hall</b> on the north side with the delegates at the long table, the salon and the library south of it, the kitchens and the staff hall east. The die-hards will come from the lake, from the drive and from the woods.'],
    ['Security', 'None of the house\'s own matters now. Every door is open and every guard has gone home. Four lots of die-hards are coming, and the <b>leader</b> is with the last of them.'],
    ['Objectives', '<b>Hold the great hall</b> until the treaty is signed (two and a half minutes). <b>Mark the leader</b> (with the last of them). Out along the lake shore, west.'],
  ],
  epilogue: {
    success: 'The last signature goes on the treaty at a quarter past three, with the windows of the great hall shot out and the delegates under the table. They sign it from there. The north is at peace by teatime, and the war that started in Varnholm is over.',
    partial: 'The treaty was signed, but the die-hards\' leader got away into the woods. Peace, with one man still at war.',
  },
  time: { date: [20, 6, 2027], hour: 15, minute: 0 }, night: false, faction: 'red',
  relations: { red: { you: true, ghost: true }, ghost: { you: false, red: true } },
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.62, 0.66, 0.72, 40, 240], ambient: [0.55, 0.57, 0.6] },
  extractName: 'the lake shore, west', extract: { x: 2, y: 34, floor: 'G', van: [0, -6] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 4, wall: 'plaster', wallTint: [0.9, 0.86, 0.8], floor: 'wood', ceil: 'plaster', lampPower: 0.6, lampColour: [1, 0.9, 0.75], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 12, 8, 38, 16],                        // the great hall
        ['room', 12, 18, 22, 26],                       // the salon
        ['room', 24, 18, 38, 26],                       // the library
        ['room', 40, 10, 46, 22],                       // the kitchens
        ['room', 40, 24, 46, 30],                       // the staff hall
      ], after: [
        ['cells', [[17, 17], [31, 17], [23, 22], [39, 13], [43, 23], [17, 27], [43, 31]], 'D'],
        ['cells', [[11, 12], [20, 7], [30, 7], [11, 22], [31, 27]], 'W'],
        // the great hall's long table and chairs, the salon's sofas and lamp, the library's shelves and phone table
        ['room', 18, 12, 32, 12, 'T'], ['cells', [[14, 9], [36, 15]], 'H'],
        ['room', 14, 20, 14, 24, 'Y'], ['cells', [[20, 25]], 'T'], ['cells', [[16, 19]], 'T'],
        ['room', 25, 19, 37, 19, 'H'], ['cells', [[34, 24]], 'T'], ['cells', [[28, 23]], 'T'],
        ['room', 41, 11, 45, 11, 'T'], ['cells', [[45, 20]], 'M'],
        ['cells', [[41, 25]], 'T'], ['cells', [[45, 29]], 'Y'],
        // the terrace's urns and the shore's boats
        ['cells', [[8, 6], [8, 30], [26, 32], [42, 4], [4, 18], [36, 30]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, CELL: C } = kit;
    box([0, -0.05, 0], [3 * C, 0.02, H * C], 'glassB', { tint: [0.3, 0.4, 0.5], solid: false });
  },
  start: { x: 25, y: 14, floor: 'G', yaw: 0 },
  zones: [
    { id: 'hall', label: 'The Ostberg house - the great hall', at: [12, 8, 38, 16] },
    { id: 'salon', label: 'The Ostberg house - the salon', at: [12, 18, 22, 26] },
    { id: 'lib', label: 'The Ostberg house - the library', at: [24, 18, 38, 26] },
    { id: 'kitch', label: 'The Ostberg house - the kitchens', at: [40, 10, 46, 22] },
    { id: 'staff', label: 'The Ostberg house - the staff hall', at: [40, 24, 46, 30] },
    { id: 'morra', label: 'Lake Morra', at: [0, 0, W - 1, H - 1] },
  ],
  reach: [
    { id: 'hall', name: 'The great hall', at: [12, 8, 38, 16], hold: 150,
      said: 'The last pen goes down on the long table. The treaty is signed, and the great hall is still yours.' },
  ],
  guards: [
    { id: 'hale', at: [22, 14, 'G'], faction: 'ghost', ally: true, name: 'Hale', arms: 'carbine', temper: 'steady', tint: [0.45, 0.6, 1.35] },
    { id: 'moss', at: [28, 14, 'G'], faction: 'ghost', ally: true, name: 'Moss', arms: 'smg', temper: 'bold', tint: [0.4, 0.55, 1.3] },
    { id: 'w1a', at: [4, 10, 'G'], arms: 'carbine', reserve: true, wave: 1 }, { id: 'w1b', at: [4, 22, 'G'], arms: 'smg', reserve: true, wave: 1 },
    { id: 'w2a', at: [24, 2, 'G'], arms: 'carbine', reserve: true, wave: 2 }, { id: 'w2b', at: [34, 2, 'G'], arms: 'shotgun', reserve: true, wave: 2 },
    { id: 'w2c', at: [14, 3, 'G'], arms: 'carbine', reserve: true, wave: 2 },
    { id: 'w3a', at: [48, 8, 'G'], arms: 'carbine', reserve: true, wave: 3 }, { id: 'w3b', at: [48, 32, 'G'], arms: 'smg', reserve: true, wave: 3 },
    { id: 'w4a', at: [30, 35, 'G'], arms: 'carbine', reserve: true, wave: 4 }, { id: 'w4b', at: [20, 35, 'G'], arms: 'dmr', reserve: true, wave: 4 },
    { id: 'lead', at: [25, 36, 'G'], arms: 'pistol', rank: 'officer', temper: 'bold', reserve: true, wave: 4, name: 'The die-hards\' leader', tint: [0.3, 0.28, 0.26] },
  ],
  civilians: [
    { id: 'del1', at: [20, 11, 'G'], yaw: Math.PI, title: 'The north\'s chief delegate', tint: [0.6, 0.55, 0.5], says: ['I have signed things under worse. Not much worse.'] },
    { id: 'del2', at: [30, 11, 'G'], yaw: Math.PI, title: 'Ghost\'s delegate', tint: [0.5, 0.6, 0.9], says: ['Keep them off us for two more minutes. There are a great many pages.'] },
    { id: 'butler', at: [36, 14, 'G'], yaw: Math.PI / 2, title: 'The butler', tint: [0.4, 0.4, 0.45], says: ['Tea will be served when the shooting stops, sir.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'reach', ref: 'hall', text: 'Hold the great hall until the treaty is signed' },
    { id: 'o2', kind: 'identify', refs: ['lead'], text: 'Mark the die-hards\' leader (with the last of them)' },
  ],
};
