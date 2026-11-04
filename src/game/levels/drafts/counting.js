// FRONTLINE - Level 73, the Counting House (first draft, M6.95; the coast, after the Winter Ball). The paymaster's
// money moves through Lund & Harl, an old counting house on Kessin's quay: his receipts in its strongroom, his office
// upstairs. A month of watching every coin is over - Ghost closes the coast tonight, starting here. Take the receipts,
// take the paymaster alive, and (if you can) copy the ledger room's books.
const W = 46, H = 36;
export default {
  id: 'counting', no: 73, title: 'The Counting House', place: 'Lund & Harl, the quay, Kessin',
  where: 'Lund & Harl\'s counting house, Kessin quay. 20:40, after hours, the paymaster working late.',
  brief: [
    ['The job', 'The paymaster from the Winter Ball runs the coast\'s money through <b>Lund &amp; Harl</b>, an old counting house on Kessin\'s quay. Ghost has watched every coin for a month, and tonight it closes the coast, starting here. Take his <b>receipts</b> from the <b>strongroom</b> in the basement. Take the <b>paymaster</b> alive in his office upstairs. If you can, <b>copy the books</b> in the ledger room as well.'],
    ['The place', 'Ground floor: the <b>counting hall</b>, the cashiers\' office, the <b>ledger room</b>, the porters\' lodge, the clients\' room and the chief clerk\'s office. A stair up to the partners\' room, the <b>paymaster\'s office</b> and the clerks\' room. A plain stair down to the <b>strongroom</b> (maglocked, and the chief clerk has the card) and the coal cellar.'],
    ['Security', 'Cameras on every floor, the strongroom maglocked, the alarm. The radio is in the porters\' lodge, the engineer in the coal cellar. Two of the house\'s own clerks are working late. They are not reds.'],
    ['Objectives', 'Take the <b>receipts</b> (the strongroom). Take the <b>paymaster</b> alive (his office, upstairs). If you can, <b>copy the books</b> (the ledger room). Out by the quay, east.'],
  ],
  epilogue: {
    success: 'The receipts, the books and the paymaster himself: by midnight the coast\'s money has nowhere to go, and by morning every account it ran through is frozen. The reds\' agents on the coast wake up to find they are working for nothing.',
    partial: 'Some of the money is stopped, and some of it is not. The paymaster\'s friends will move the rest before the banks open.',
  },
  time: { date: [4, 4, 2027], hour: 20, minute: 40 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'rain',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.12, 0.13, 0.16, 20, 150], ambient: [0.25, 0.26, 0.3] },
  extractName: 'the quay, east', extract: { x: 43, y: 17, floor: 'G' },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    B: {
      y: -3.6, wallH: 3.2, wall: 'concrete2', floor: 'concrete', ceil: 'concrete2', lampColour: [0.85, 0.9, 1], lampPower: 0.7, lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 22, 4, 28, 12],                        // the stair's foot
        ['room', 8, 14, 37, 18],                        // the basement corridor
        ['room', 8, 4, 20, 12],                         // the strongroom
        ['room', 30, 4, 37, 12],                        // the coal cellar
      ], after: [
        ['cells', [[25, 13], [14, 13], [33, 13]], 'D'],
        ['cells', [[10, 6], [10, 9], [18, 6], [18, 9]], 'H'], ['cells', [[13, 8]], 'T'],
        ['room', 32, 6, 35, 7, 'M'], ['cells', [[31, 11]], 'T'],
        ['cells', [[12, 17], [30, 15]], 'C'],
      ] },
    },
    G: {
      y: 0, wallH: 3.4, wall: 'plaster', wallTint: [0.85, 0.82, 0.74], floor: 'marble', ceil: 'plaster', lampPower: 0.7, lampColour: [1, 0.9, 0.75], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 8, 14, 37, 20],                        // the counting hall
        ['room', 8, 4, 20, 12],                         // the cashiers' office
        ['room', 22, 4, 28, 12],                        // the stair hall
        ['room', 30, 4, 37, 12],                        // the ledger room
        ['room', 8, 22, 22, 30],                        // the clients' room
        ['room', 24, 22, 28, 30],                       // the porters' lodge
        ['room', 30, 22, 37, 30],                       // the chief clerk's office
      ], after: [
        ['cells', [[14, 13], [25, 13], [33, 13], [15, 21], [26, 21], [33, 21], [7, 17], [38, 17]], 'D'],
        ['room', 10, 9, 18, 9, 'K'], ['cells', [[12, 6], [16, 6]], 'T'],                        // the cashiers' office's counter
        ['cells', [[32, 6], [35, 9]], 'T'], ['cells', [[31, 10], [36, 5]], 'H'],
        ['room', 10, 25, 20, 25, 'Y'], ['room', 10, 28, 20, 28, 'Y'],                            // the clients' room's benches
        ['cells', [[26, 24]], 'T'], ['cells', [[25, 28]], 'K'],
        ['cells', [[32, 24], [35, 27]], 'T'],
        ['cells', [[12, 16], [33, 18]], 'M'],
      ] },
    },
    1: {
      y: 3.6, wallH: 3.2, wall: 'plaster', wallTint: [0.82, 0.8, 0.72], floor: 'wood', ceil: 'plaster', lampPower: 0.55, lampColour: [1, 0.9, 0.75], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 22, 4, 28, 12],                        // the landing
        ['room', 8, 14, 37, 20],                        // the corridor
        ['room', 8, 4, 20, 12],                         // the partners' room
        ['room', 30, 4, 37, 12],                        // the paymaster's office
        ['room', 8, 22, 22, 30],                        // the board room
        ['room', 24, 22, 37, 30],                       // the clerks' room
      ], after: [
        ['cells', [[25, 13], [14, 13], [33, 13], [15, 21], [30, 21]], 'D'],
        ['cells', [[10, 6], [17, 9]], 'T'], ['cells', [[19, 5]], 'H'],
        ['cells', [[33, 7], [35, 10]], 'T'], ['cells', [[36, 5]], 'H'],
        ['room', 11, 26, 19, 26, 'T'],
        ['cells', [[26, 24], [30, 24], [34, 24], [26, 28], [30, 28], [34, 28]], 'T'],
      ] },
    },
  },
  stairs: [
    { x: 23, y: 11, dir: 'N', len: 5, w: 2, from: 'G', to: '1' },
    { x: 26, y: 11, dir: 'N', len: 5, w: 2, from: 'B', to: 'G' },
  ],
  extra(kit) {
    const { level, mid } = kit;
    for (const [x, y] of [[4, 12], [4, 24], [41, 12], [41, 24], [22, 33]]) level.lights.push({ pos: [mid(x), 5, mid(y)], range: 14, intensity: 0.9, color: [1, 0.88, 0.7], street: true });
    level.signs.push({ pos: [mid(38.5), 3.9, mid(17)], yaw: -Math.PI / 2, w: 3.8, h: 0.7, text: 'LUND & HARL', sub: 'Est. 1812', col: '#22281e' });
  },
  start: { x: 44, y: 26, floor: 'G', yaw: 0 },
  zones: [
    { id: 'hall', label: 'The Counting House - the counting hall', at: [8, 14, 37, 20] },
    { id: 'cash', label: 'The Counting House - the cashiers\' office', at: [8, 4, 20, 12] },
    { id: 'stair', label: 'The Counting House - the stair hall', at: [22, 4, 28, 12] },
    { id: 'ledg', label: 'The Counting House - the ledger room', at: [30, 4, 37, 12] },
    { id: 'clients', label: 'The Counting House - the clients\' room', at: [8, 22, 22, 30] },
    { id: 'lodge', label: 'The Counting House - the porters\' lodge', at: [24, 22, 28, 30] },
    { id: 'chief', label: 'The Counting House - the chief clerk\'s office', at: [30, 22, 37, 30] },
    { id: 'part', label: 'The Counting House - the partners\' room', at: [8, 4, 20, 12], floor: '1' },
    { id: 'pay', label: 'The Counting House - the paymaster\'s office', at: [30, 4, 37, 12], floor: '1' },
    { id: 'board', label: 'The Counting House - the board room', at: [8, 22, 22, 30], floor: '1' },
    { id: 'clerks', label: 'The Counting House - the clerks\' room', at: [24, 22, 37, 30], floor: '1' },
    { id: 'up', label: 'The Counting House - the first floor', at: [0, 0, W - 1, H - 1], floor: '1' },
    { id: 'strong', label: 'The Counting House - the strongroom', at: [8, 4, 20, 12], floor: 'B' },
    { id: 'coal', label: 'The Counting House - the coal cellar', at: [30, 4, 37, 12], floor: 'B' },
    { id: 'base', label: 'The Counting House - the basement', at: [0, 0, W - 1, H - 1], floor: 'B' },
    { id: 'quay', label: 'Kessin quay', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'pay', at: [34, 8, '1'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The paymaster', tint: [0.2, 0.2, 0.25] },
    { id: 'pb', at: [32, 10, '1'], arms: 'smg', temper: 'steady' },
    { id: 'c1', at: [20, 17, '1'], route: [[9, 17], [36, 17]], arms: 'carbine' },
    { id: 'chief', at: [33, 26, 'G'], arms: 'pistol', rank: 'specialist', temper: 'cowardly', card: 'lund', name: 'The chief clerk' },
    { id: 'h1', at: [20, 17, 'G'], route: [[9, 17], [36, 17]], arms: 'carbine' },
    { id: 'ca', at: [14, 7, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'rad', at: [26, 27, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'door', at: [40, 15, 'G'], yaw: 0, arms: 'carbine', temper: 'steady' },
    { id: 'eng', at: [34, 10, 'B'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'b1', at: [20, 16, 'B'], route: [[9, 16], [36, 16]], arms: 'carbine' },
  ],
  civilians: [
    { id: 'clerk1', at: [28, 26, '1'], yaw: 0, title: 'A clerk working late', tint: [0.85, 0.85, 0.95], says: ['Mr Lund would turn in his grave. Half the accounts in this house are his now - the gentleman upstairs.', 'The chief clerk carries the strongroom card. He takes it home with him, even.'] },
    { id: 'clerk2', at: [12, 26, 'G'], yaw: Math.PI / 2, title: 'A junior clerk', tint: [0.9, 0.9, 0.85], says: ['The books are in the ledger room. Every penny in and out, in red ink for his.'] },
  ],
  pickups: [{ id: 'receipts', name: 'The paymaster\'s receipts', what: 'the receipts', at: [13, 8, 'B'], table: true, colour: [0.85, 0.8, 0.6] }],
  devices: [
    { id: 'c-hall', kind: 'camera', at: [8, 14, 'G'], face: [1, 1], net: 'lund' },
    { id: 'c-up', kind: 'camera', at: [37, 14, '1'], face: [-1, 1], net: 'lund' },
    { id: 'c-base', kind: 'camera', at: [37, 14, 'B'], face: [-1, 1], net: 'lund' },
    { id: 'm-strong', kind: 'lock', at: [14, 13, 'B'], net: 'lund' },
    { id: 'a-lund', kind: 'alarm', at: [22, 21, 'G'], face: [0, -1], net: 'lund' },
  ],
  terminals: [
    { id: 'sec', name: 'the porters\' lodge console', at: [26, 24, 'G'], face: [0, 1], time: 6, net: 'lund' },
    { id: 'books', name: 'the ledger room\'s books', at: [32, 6, 'G'], face: [0, 1], time: 8, verb: 'Copy', doing: 'Copying',
      said: 'Every account the paymaster ran through Lund & Harl, in red ink, copied.' },
  ],
  intel: [
    { id: 'memo', at: [35, 10, '1'], kind: 'Memo', title: 'A memo on the paymaster\'s desk', text: ['The ball went well. Hollis says nobody looked twice. Next month as usual.'] },
    { id: 'ledger', at: [35, 9, 'G'], kind: 'Page', title: 'A page from the day book', text: ['"Receipts to strongroom, not to be entered." Initialled by the chief clerk, who has initialled nothing else all year.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'receipts', text: 'Take the receipts (the strongroom, the basement)' },
    { id: 'o2', kind: 'capture', ref: 'pay', text: 'Take the paymaster alive (his office, upstairs)' },
    { id: 'o3', kind: 'hack', ref: 'books', text: 'Copy the books (the ledger room)', optional: true },
  ],
};
