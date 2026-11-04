// FRONTLINE - Level 88, the Safe House (first draft, M6.110; the start of THE WARNING). Major Kade's files said where
// the warned saints would run to: Ghost's safe house, the farm at Lindqvist's Ford, where a lorry comes for them
// tonight. They also said the reds already have a squad on the way there. Get to the farm first with Hale and Moss,
// hold the farmhouse until the lorry comes, and take the squad's leader alive - he knows who gave the reds the farm.
const W = 50, H = 40;
export default {
  id: 'safehouse', no: 88, title: 'The Safe House', place: 'the farm at Lindqvist\'s Ford',
  where: 'The farm at Lindqvist\'s Ford. 19:40, dusk, the saints in the kitchen, the lorry an hour out.',
  brief: [
    ['The job', 'Major Kade\'s files said where the warned saints would run: Ghost\'s <b>safe house</b>, the farm at Lindqvist\'s Ford, where a lorry comes for them tonight. They also said the reds already have a <b>squad</b> on the way there. Get to the farm first with <b>Hale and Moss</b>. <b>Hold the farmhouse</b> until the lorry comes. <b>Take the squad\'s leader alive</b>. He knows who gave the reds the farm.'],
    ['The place', 'The <b>farmhouse</b> in the middle of its yard: the front room and the kitchen, where the saints are waiting. The <b>barn</b> is east, the woods to the north and west. The ford road comes up from the south, where you are.'],
    ['Security', 'Two of the squad\'s scouts are already in the woods. The rest come in three lots, from the north, then the east, then the west, with the <b>leader</b> in the last. There is no alarm and no radio here, only the reds and the dark coming on.'],
    ['Objectives', '<b>Hold the farmhouse</b> until the lorry comes (two minutes). <b>Take the squad\'s leader alive</b> (with the last of them, from the west). Out by the ford road, south.'],
  ],
  epilogue: {
    success: 'The lorry comes up the ford road with its lights off and goes down it again with eleven saints in the back. The squad\'s leader rides with them, tied, and before the border he has said who gave the reds the farm.',
    partial: 'The saints got away, but the squad\'s leader did not come with them. Somebody gave the reds Lindqvist\'s Ford, and they are still giving.',
  },
  time: { date: [7, 5, 2027], hour: 19, minute: 40 }, night: false, faction: 'red',
  relations: { red: { you: true, ghost: true }, ghost: { you: false, red: true } },
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.42, 0.36, 0.34, 30, 200], ambient: [0.45, 0.4, 0.4] },
  extractName: 'the ford road, south', extract: { x: 24, y: 38, floor: 'G', van: [5, 0] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.2, wall: 'plaster', wallTint: [0.85, 0.8, 0.7], floor: 'wood', ceil: 'wood', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      carve: { size: [W, H], ops: [
        ['room', 18, 14, 24, 22],                       // the front room
        ['room', 26, 14, 30, 22],                       // the kitchen
        ['room', 34, 12, 42, 24],                       // the barn
      ], after: [
        ['cells', [[21, 23], [25, 18], [33, 18], [28, 13]], 'D'],
        ['cells', [[17, 16], [17, 20], [21, 13], [19, 23], [31, 16], [31, 20], [28, 23]], 'W'],
        ['cells', [[20, 15], [23, 21]], 'H'], ['cells', [[19, 18]], 'T'],
        ['room', 27, 17, 29, 17, 'T'], ['cells', [[29, 21]], 'M'],
        ['cells', [[36, 14], [40, 14], [36, 22], [41, 21]], 'C'], ['cells', [[38, 18]], 'M'],
        // the yard: the well, a cart, the woodpile; the woods' edge
        ['cells', [[24, 28]], 'M'], ['cells', [[14, 26], [32, 28], [12, 12], [44, 28], [30, 8], [18, 8], [8, 20], [8, 30], [42, 8]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { level, mid } = kit;
    for (const [x, y] of [[21, 25], [32, 18]]) level.lights.push({ pos: [mid(x), 3.2, mid(y)], range: 9, intensity: 0.8, color: [1, 0.85, 0.6], street: true });
  },
  start: { x: 24, y: 36, floor: 'G', yaw: 0 },
  zones: [
    { id: 'front', label: 'The farm - the front room', at: [18, 14, 24, 22] },
    { id: 'kitchen', label: 'The farm - the kitchen', at: [26, 14, 30, 22] },
    { id: 'barn', label: 'The farm - the barn', at: [34, 12, 42, 24] },
    { id: 'ford', label: 'Lindqvist\'s Ford', at: [0, 0, W - 1, H - 1] },
  ],
  reach: [
    { id: 'farm', name: 'The farmhouse', at: [18, 14, 30, 22], hold: 120,
      said: 'Headlights on the ford road, then none: the lorry. The saints are going out of the back door. You held it.' },
  ],
  guards: [
    { id: 'hale', at: [23, 37, 'G'], faction: 'ghost', ally: true, name: 'Hale', arms: 'carbine', temper: 'steady', tint: [0.45, 0.6, 1.35] },
    { id: 'moss', at: [25, 37, 'G'], faction: 'ghost', ally: true, name: 'Moss', arms: 'smg', temper: 'bold', tint: [0.4, 0.55, 1.3] },
    { id: 'sc1', at: [6, 10, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'sc2', at: [46, 6, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'w1a', at: [24, 2, 'G'], arms: 'carbine', reserve: true, wave: 1 }, { id: 'w1b', at: [20, 3, 'G'], arms: 'smg', reserve: true, wave: 1 },
    { id: 'w2a', at: [47, 16, 'G'], arms: 'carbine', reserve: true, wave: 2 }, { id: 'w2b', at: [47, 21, 'G'], arms: 'shotgun', reserve: true, wave: 2 },
    { id: 'w2c', at: [46, 30, 'G'], arms: 'carbine', reserve: true, wave: 2 },
    { id: 'w3a', at: [2, 16, 'G'], arms: 'carbine', reserve: true, wave: 3 }, { id: 'w3b', at: [3, 25, 'G'], arms: 'smg', reserve: true, wave: 3 },
    { id: 'sql', at: [2, 20, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', reserve: true, wave: 3, name: 'The squad\'s leader', tint: [0.3, 0.3, 0.28] },
  ],
  civilians: [
    { id: 'st1', at: [27, 19, 'G'], yaw: Math.PI, title: 'St Brannoc', tint: [0.5, 0.42, 0.35], says: ['You again. I am starting to think you are my guardian angel. Do not tell the abbot.'] },
    { id: 'st2', at: [29, 15, 'G'], yaw: Math.PI / 2, title: 'St Corin', tint: [0.6, 0.55, 0.5], says: ['I never did get to my sister\'s.'] },
    { id: 'st3', at: [28, 20, 'G'], yaw: -Math.PI / 2, title: 'The farmer\'s wife', tint: [0.9, 0.8, 0.75], says: ['Eleven of them in my kitchen and not one will eat. Keep the door shut, if you please.'] },
  ],
  intel: [
    { id: 'map', at: [19, 18, 'G'], kind: 'Map', title: 'A map on the front room table', text: ['The lorry\'s road, in Ghost\'s hand. And in another hand, in red, the same road, with a cross where it meets the ford.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'reach', ref: 'farm', text: 'Hold the farmhouse until the lorry comes' },
    { id: 'o2', kind: 'capture', ref: 'sql', text: 'Take the squad\'s leader alive (the last of them, from the west)' },
  ],
};
