// FRONTLINE - Level 63, the Varnholm Courier (first draft, M6.80). The reds' answer to the broadcast: the city's
// paper, the Courier, was to print the five names in the morning edition, and tonight the reds have come to stop it -
// the staff held, the presses to be wrecked. Get there first: start the press, hold the press hall while the
// special edition runs, and get the staff out.
const W = 48, H = 36;
export default {
  id: 'gazette', no: 63, title: 'The Varnholm Courier', place: 'the Varnholm Courier, Fleet Row',
  where: 'The Varnholm Courier, Fleet Row. 02:10, the morning edition due on the press.',
  brief: [
    ['The job', 'The <b>Courier</b> was going to print the five names in the morning edition, and the reds have come to stop it. The staff are held and the presses are to be wrecked. <b>Start the press</b> (its control desk, the press hall\'s west end). Then <b>hold the press hall</b> for the <b>sixty seconds</b> the special edition takes. More of them will come in from the street. If you can, get the <b>staff</b> out: the editor upstairs, and two typesetters in the press hall.'],
    ['The place', 'The <b>press hall</b> on the ground floor (the big presses, the paper reels), the front office beside it with the stair up. Upstairs: the <b>newsroom</b> over the press hall and the <b>editor\'s office</b> over the front office. Fleet Row is north, and you come in from the yard, south.'],
    ['Security', 'The Courier\'s own camera in the press hall and its alarm, both in the reds\' hands now. Their radio is in the front office, and an engineer in the press hall is getting ready to wreck it.'],
    ['Objectives', '<b>Start the press</b> (the press hall). <b>Hold the press hall</b> while the edition runs. If you can, get the <b>staff</b> out. Out by the yard, south.'],
  ],
  epilogue: {
    success: 'Forty thousand copies of the Courier are on the streets by six, every one with the five names on the front page. By eight the reds\' own paper has sold out of nothing. The editor writes the next day\'s leader himself, about the night his presses were saved.',
    partial: 'A few thousand copies, or a few of the staff, not all of it. The reds will say the Courier made it up, and some people will believe them.',
  },
  time: { date: [11, 2, 2027], hour: 2, minute: 10 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'rain',
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.12, 0.13, 0.16, 20, 140], ambient: [0.24, 0.25, 0.3] },
  extractName: 'the yard, south', extract: { x: 18, y: 34, floor: 'G' },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 4, wall: 'brick', wallTint: [0.6, 0.48, 0.4], floor: 'concrete', ceil: 'metal', lampPower: 0.7, lampColour: [1, 0.9, 0.75], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 6, 12, 30, 22],                        // the press hall
        ['room', 32, 12, 42, 22],                       // the front office
      ], after: [
        // (walls a square out; the two share one)
        ['cells', [[31, 17], [18, 23], [37, 11], [43, 15]], 'D'],
        ['cells', [[10, 11], [18, 11], [26, 11], [5, 15], [5, 19], [10, 23], [26, 23], [43, 19], [34, 11], [40, 11]], 'W'],
        // the presses: two long machines down the hall, the paper reels, the control desk at the west end
        ['room', 11, 14, 25, 15, 'M'], ['room', 11, 19, 25, 19, 'M'], ['cells', [[28, 13], [28, 21], [8, 21]], 'C'], ['cells', [[7, 13]], 'K'],
        ['cells', [[36, 14], [40, 14]], 'T'], ['cells', [[41, 20]], 'H'], ['room', 37, 18, 40, 18, 'K'],
        // the street and the yard
        ['cells', [[8, 5], [24, 6], [38, 4], [12, 28], [28, 29], [40, 27]], 'C'],
      ] },
    },
    1: {
      y: 4.2, wallH: 3.2, wall: 'plaster', wallTint: [0.82, 0.8, 0.72], floor: 'wood', ceil: 'plaster', lampPower: 0.55, lampColour: [1, 0.9, 0.75], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 6, 12, 30, 22],                        // the newsroom
        ['room', 32, 12, 42, 22],                       // the editor's office
      ], after: [
        ['cells', [[31, 14]], 'D'],
        ['cells', [[10, 11], [18, 11], [26, 11], [5, 17], [10, 23], [26, 23], [43, 15], [43, 19], [38, 11]], 'W'],
        ['cells', [[9, 14], [13, 14], [17, 14], [21, 14], [25, 14], [9, 19], [13, 19], [17, 19], [21, 19], [25, 19]], 'T'],
        ['cells', [[39, 13], [41, 16]], 'T'], ['cells', [[42, 21]], 'H'],
      ] },
    },
  },
  stairs: [{ x: 34, y: 21, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { level, mid, CELL: C } = kit;
    for (const [x, y] of [[10, 8], [26, 8], [40, 8], [18, 26], [34, 26]]) level.lights.push({ pos: [mid(x), 5, mid(y)], range: 14, intensity: 0.9, color: [1, 0.88, 0.7], street: true });
    level.signs.push({ pos: [mid(18), 6.2, 11 * C - 0.12], yaw: Math.PI, w: 6, h: 1.0, text: 'THE VARNHOLM COURIER', sub: 'Since 1871', col: '#1e1e1e' });
  },
  start: { x: 18, y: 34, floor: 'G', yaw: 0 },
  zones: [
    { id: 'press', label: 'The Courier - the press hall', at: [6, 12, 30, 22] },
    { id: 'front', label: 'The Courier - the front office', at: [32, 12, 42, 22] },
    { id: 'news', label: 'The Courier - the newsroom', at: [6, 12, 30, 22], floor: '1' },
    { id: 'ed', label: 'The Courier - the editor\'s office', at: [32, 12, 42, 22], floor: '1' },
    { id: 'row', label: 'Fleet Row', at: [0, 0, W - 1, 10] },
    { id: 'yard', label: 'The Courier - the yard', at: [0, 0, W - 1, H - 1] },
  ],
  reach: [
    { id: 'hall', name: 'The press hall', at: [7, 13, 29, 21], hold: 60, after: 'press',
      said: 'Sixty seconds. The special edition is off the press, bundled and in the vans: forty thousand of it.' },
  ],
  guards: [
    { id: 'eng', at: [27, 17, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'p1', at: [9, 17, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'p2', at: [20, 17, 'G'], route: [[8, 17], [29, 17]], arms: 'carbine' },
    { id: 'rad', at: [38, 16, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio', name: 'The raid\'s officer' },
    { id: 'fo', at: [35, 13, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'n1', at: [15, 17, '1'], route: [[8, 17], [29, 17]], arms: 'carbine' },
    { id: 'n2', at: [36, 19, '1'], arms: 'smg', temper: 'bold' },
    { id: 'yd', at: [30, 30, 'G'], route: [[4, 30], [44, 30]], arms: 'carbine' },
    // more of them, in from Fleet Row while the edition runs
    { id: 'w1a', at: [16, 3, 'G'], arms: 'carbine', reserve: true, wave: 1 }, { id: 'w1b', at: [20, 3, 'G'], arms: 'smg', reserve: true, wave: 1 },
    { id: 'w2a', at: [45, 6, 'G'], arms: 'carbine', reserve: true, wave: 2 }, { id: 'w2b', at: [45, 26, 'G'], arms: 'shotgun', reserve: true, wave: 2 },
    { id: 'w2c', at: [2, 26, 'G'], arms: 'carbine', reserve: true, wave: 2 },
  ],
  hostages: [
    { id: 'editor', name: 'The editor', at: [39, 17, '1'] },
    { id: 'ts1', name: 'A typesetter', at: [9, 20, 'G'] },
    { id: 'ts2', name: 'A typesetter', she: true, at: [26, 20, 'G'] },
  ],
  devices: [
    { id: 'c-press', kind: 'camera', at: [30, 12, 'G'], face: [-1, 1], net: 'courier' },
    { id: 'a-courier', kind: 'alarm', at: [31, 21, 'G'], face: [1, 0], net: 'courier' },
  ],
  terminals: [
    { id: 'sec', name: 'the front office console', at: [36, 14, 'G'], face: [0, 1], time: 6, net: 'courier' },
    { id: 'press', name: 'the press\'s control desk', at: [7, 15, 'G'], face: [1, 0], time: 8, verb: 'Start', doing: 'Starting',
      said: 'The press thunders into life and the first copies come off it. Now hold the press hall until the run is done: sixty seconds.' },
  ],
  intel: [
    { id: 'proof', at: [21, 14, '1'], kind: 'Proof', title: 'The front page, in proof', text: ['THE FIVE. Their names, their towns, what they have done. The editor has initialled it: "Print it. All of it."'] },
    { id: 'orders', at: [40, 14, 'G'], kind: 'Orders', title: 'The raid\'s orders', text: ['The presses wrecked, the staff held until the morning edition is too late to print. No shooting unless they make you.', 'Someone has added: "They will make us."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'press', text: 'Start the press (the press hall\'s control desk)' },
    { id: 'o2', kind: 'reach', ref: 'hall', text: 'Hold the press hall while the edition runs' },
    { id: 'o3', kind: 'rescue', text: 'Get the staff out', optional: true },
  ],
};
