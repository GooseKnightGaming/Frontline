// FRONTLINE - Level 57, the Old Market (first draft, M6.75; built round following a man - objective kind 'tail').
// The Controller's letter at the Town Hall: "Someone knows about the flaw." He is going to tell the man he answers
// to - and he does it on foot, through the old market at Varnholm, early, among the stalls. Follow him there. Do not
// lose him, do not get close enough to be made, and find out who is waiting.
const W = 56, H = 40;
export default {
  id: 'market', no: 57, title: 'The Old Market', place: 'the old market, Varnholm',
  where: 'The old market, Varnholm. 07:40, a clear, cold morning, the stalls setting up.',
  brief: [
    ['The job', 'The Controller is going to report to the man he answers to, the reds\' <b>handler</b> in Varnholm. Nobody knows who that is. He goes on foot, through the <b>old market</b>. <b>Follow him</b>: keep within forty metres, but do not get close enough for him to make you, and do not let him see you watching. When he gets where he is going, take the <b>handler\'s orders</b>.'],
    ['The place', 'The market square, with its stalls and crates. Round it: the shops on the south side, the <b>Café Lindqvist</b> on the north side with its <b>back room</b>, and the reds\' <b>post</b> on the east side. You go in <b>dressed as one of them</b>; a red soldier in the market is nothing to look at.'],
    ['Security', 'Patrols in the square, a camera on the post, the alarm and the radio in the post. The stallholders are not reds.'],
    ['Objectives', '<b>Follow the Controller</b> to his meeting. Take the <b>handler\'s orders</b>. If you can, stop the <b>handler</b>. Out by the south-east corner.'],
  ],
  epilogue: {
    success: 'The handler is a coffee merchant called Brandvold, who has been "importing" for the reds for eleven years. His orders name the next three things they mean to do in Varnholm. Ghost has them first.',
    partial: 'You know where the Controller went, or what was waiting there, but not both. The handler will move on, and Varnholm will not see him in the market again.',
  },
  time: { date: [29, 1, 2027], hour: 7, minute: 40 }, night: false, faction: 'red', requires: 'HACKKIT', startDisguise: 'red',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.62, 0.66, 0.72, 40, 260], ambient: [0.55, 0.57, 0.62] },
  extractName: 'the south-east corner', extract: { x: 53, y: 38, floor: 'G' },
  outside: { backdrop: 'city', mat: 'concrete2', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.4, wall: 'brick', wallTint: [0.62, 0.5, 0.42], floor: 'wood', ceil: 'plaster', lampPower: 0.5, lampColour: [1, 0.9, 0.75], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 30, 4, 39, 10],                        // the Café Lindqvist
        ['room', 41, 4, 48, 10],                        // its back room
        ['room', 4, 4, 14, 10],                         // the bakery
        ['room', 17, 4, 27, 10],                        // the ironmonger's
        ['room', 46, 16, 52, 26],                       // the reds' post
        ['room', 4, 32, 14, 37],                        // the butcher's
        ['room', 18, 32, 27, 37],                       // the bookshop
      ], after: [
        // (walls a square out from each room; the café and its back room share one)
        ['cells', [[35, 11], [40, 7], [9, 11], [22, 11], [45, 21], [9, 31], [22, 31]], 'D'],
        // the market's stalls (counters) and crates, in rows across the square
        ['room', 10, 16, 12, 16, 'T'], ['room', 17, 16, 19, 16, 'T'], ['room', 24, 16, 26, 16, 'T'],
        ['room', 10, 25, 12, 25, 'T'], ['room', 17, 25, 19, 25, 'T'], ['room', 31, 25, 33, 25, 'T'],
        ['cells', [[13, 17], [20, 17], [27, 17], [13, 24], [20, 24], [34, 24], [40, 20], [40, 28]], 'C'],
        // inside: the café's tables, the back room's desk, the post's desks, the shops' counters
        ['cells', [[32, 6], [36, 6], [32, 9], [37, 9]], 'T'], ['cells', [[47, 5]], 'T'], ['cells', [[43, 9]], 'H'],
        ['cells', [[48, 18], [51, 23]], 'T'], ['cells', [[51, 18]], 'M'],
        ['room', 6, 7, 12, 7, 'K'], ['room', 19, 7, 25, 7, 'K'], ['room', 6, 34, 12, 34, 'K'], ['cells', [[20, 35], [25, 35]], 'H'],
      ] },
    },
  },
  extra(kit) {
    const { level, mid } = kit;
    for (const [x, y] of [[16, 21], [30, 21], [42, 30]]) level.lights.push({ pos: [mid(x), 5, mid(y)], range: 12, intensity: 0.5, color: [1, 0.92, 0.8], street: true });
    level.signs.push({ pos: [mid(35), 3.6, mid(11) + 0.8], yaw: 0, w: 4.2, h: 0.7, text: 'CAFÉ LINDQVIST', sub: 'Coffee - Tea - Pastries', col: '#2b3a4a' });
  },
  start: { x: 7, y: 37, floor: 'G', yaw: 0 },
  zones: [
    { id: 'cafe', label: 'The Old Market - the Café Lindqvist', at: [30, 4, 39, 10] },
    { id: 'back', label: 'The Old Market - the café\'s back room', at: [41, 4, 48, 10] },
    { id: 'post', label: 'The Old Market - the reds\' post', at: [46, 16, 52, 26] },
    { id: 'shops', label: 'The Old Market - the shops', at: [0, 0, W - 1, 12] },
    { id: 'south', label: 'The Old Market - the shops', at: [0, 31, 28, 39] },
    { id: 'square', label: 'The Old Market - the square', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    // the Controller: through the market, a word at two stalls, then into the café and its back room - and he stays
    { id: 'ctl', at: [3, 21, 'G'], route: [[3, 21], [15, 21, 6], [15, 29], [29, 29, 8], [29, 21], [35, 15], [35, 8], [39, 7], [45, 7, 1e9]],
      arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The Controller', tint: [0.3, 0.3, 0.35] },
    { id: 'handler', at: [46, 8, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The handler', tint: [0.55, 0.4, 0.3] },
    { id: 'hb', at: [42, 5, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'sq1', at: [22, 20, 'G'], route: [[8, 20], [40, 20]], arms: 'carbine' },
    { id: 'sq2', at: [36, 28, 'G'], route: [[22, 28], [44, 28]], arms: 'carbine' },
    { id: 'cafe1', at: [33, 7, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'rad', at: [49, 20, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [49, 24, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'pd', at: [44, 22, 'G'], arms: 'carbine', temper: 'bold' },
  ],
  civilians: [
    { id: 'fish', at: [11, 17, 'G'], yaw: Math.PI, title: 'A fishwife', tint: [0.8, 0.85, 0.9], says: ['The man in grey? He comes through every Friday. Never buys anything.', 'Pike, fresh this morning. No? Suit yourself.'] },
    { id: 'apples', at: [18, 24, 'G'], yaw: 0, title: 'An apple seller', tint: [0.9, 0.7, 0.6], says: ['Mind how close you walk behind people round here. They notice.', 'He always ends up at Lindqvist\'s. The back room, never the front.'] },
    { id: 'flowers', at: [32, 24, 'G'], yaw: 0, title: 'A flower seller', tint: [1.0, 0.85, 0.9], says: ['Lindqvist\'s back room has a man in it every Friday. Brown coat. Pays for everyone\'s coffee and drinks none.'] },
    { id: 'baker', at: [9, 8, 'G'], yaw: 0, title: 'The baker', tint: [1.1, 1.05, 0.95], says: ['First loaves are out. The soldiers take theirs for nothing.'] },
  ],
  pickups: [{ id: 'orders', name: 'The handler\'s orders', what: 'the orders', at: [47, 5, 'G'], table: true, colour: [0.8, 0.75, 0.6] }],
  devices: [
    { id: 'c-post', kind: 'camera', at: [45, 15, 'G'], face: [-1, 1], net: 'mkt' },
    { id: 'a-post', kind: 'alarm', at: [45, 24, 'G'], face: [-1, 0], net: 'mkt' },
  ],
  terminals: [{ id: 'sec', name: 'the post\'s console', at: [48, 18, 'G'], face: [0, 1], time: 6, net: 'mkt' }],
  intel: [
    { id: 'bill', at: [37, 9, 'G'], kind: 'Bill', title: 'A café bill', text: ['Every Friday, the back room: six coffees, four pastries, charged to "B.". Never paid. The owner has written: "Do not ask him."'] },
    { id: 'cash', at: [51, 23, 'G'], kind: 'Orders', title: 'Orders for the post', text: ['Friday mornings, no patrol goes into the café. Anyone who goes into the back room uninvited is to be held for the handler.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'tail', ref: 'ctl', range: 40, near: 4, lose: 15, text: 'Follow the Controller to his meeting',
      said: 'The Controller is in the café\'s back room with the man in the brown coat. That is the handler.' },
    { id: 'o2', kind: 'take', ref: 'orders', text: 'Take the handler\'s orders (the café\'s back room)' },
    { id: 'o3', kind: 'kill', ref: 'handler', text: 'Stop the handler', optional: true },
  ],
};
