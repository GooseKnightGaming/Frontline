// FRONTLINE - Level 97, the Opera (first draft, M6.119; the start of THE GENERAL). The Courier's front page named the
// man above Major Kade: General Brandt, who signed the crosses. He is untouchable in his headquarters, and never anywhere
// else - except the Hollen Opera on its opening night, in the east box. Go in as one of his officers. Mark his three
// bodyguards, so Ghost knows every face round him, and take his diary from his coat in the cloakroom: it says where he
// sleeps.
const W = 48, H = 40;
export default {
  id: 'opera', no: 97, title: 'The Opera', place: 'the Hollen Opera House',
  where: 'The Hollen Opera House, opening night. 20:10, the second act, every seat full.',
  brief: [
    ['The job', 'The Courier\'s front page named the man above Major Kade: <b>General Brandt</b>, who signed the crosses. He is untouchable in his headquarters, and never anywhere else, except the <b>Hollen Opera</b> on its opening night, in the east box. Go in as one of his officers. <b>Mark his three bodyguards</b>, so that Ghost knows every face round him. Take his <b>diary</b> from his coat in the <b>cloakroom</b>: it says where he sleeps.'],
    ['The place', 'The <b>foyer</b> on the south side, with a stair up to the <b>crush bar</b> and the <b>boxes</b> above the stalls on either side. The <b>auditorium</b> and the stage are in the middle, and the <b>cloakroom</b> is beside the stage door, east. The manager\'s office is off the foyer. You are <b>dressed as one of them</b>, and half the stalls are red tonight.'],
    ['Security', 'A camera in the foyer and the house alarm, both on the manager\'s console, with the radio. The engineer is in the office. The General\'s bodyguards are a man in his box, a man in the box opposite with a view of his, and a man in the foyer who watches the stair.'],
    ['Objectives', '<b>Mark the three bodyguards</b> (the east box, the west box, the foyer). Take the <b>diary</b> (the cloakroom). If you can, <b>without the alarm</b>. Out by the front doors, south.'],
  ],
  epilogue: {
    success: 'The General hears the last act through and goes home to bed, where his diary says he will be. Ghost knows the three faces round him now, and the road to his door. He has perhaps a week left of opening nights.',
    partial: 'Part of it. Ghost knows some of the faces round the General, or where he sleeps, but not both.',
  },
  time: { date: [20, 5, 2027], hour: 20, minute: 10 }, night: true, faction: 'red', requires: 'HACKKIT', startDisguise: 'red', disguiseName: 'ONE OF HIS OFFICERS',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.16, 0.13, 0.13, 25, 160], ambient: [0.32, 0.28, 0.28] },
  extractName: 'the front doors, south', extract: { x: 25, y: 38, floor: 'G', van: [6, 0] },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3.6, wall: 'paint', wallTint: [0.6, 0.18, 0.2], floor: 'carpet', ceil: 'plaster', lampPower: 0.75, lampColour: [1, 0.85, 0.6], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 16, 8, 34, 26],                        // the auditorium and the stage
        ['room', 16, 28, 34, 34],                       // the foyer
        ['room', 36, 8, 42, 14],                        // the cloakroom
        ['room', 36, 28, 42, 34],                       // the manager's office
      ], after: [
        ['cells', [[20, 27], [30, 27], [25, 35], [35, 10], [35, 31]], 'D'],
        ['cells', [[15, 30], [20, 35], [30, 35], [43, 31], [43, 11]], 'W'],
        // the stage's piano and scenery, the stalls' rows (an aisle down the middle)
        ['cells', [[25, 10]], 'M'], ['cells', [[19, 9], [31, 9]], 'C'],
        ['room', 18, 15, 23, 15, 'Y'], ['room', 27, 15, 32, 15, 'Y'], ['room', 18, 18, 23, 18, 'Y'], ['room', 27, 18, 32, 18, 'Y'],
        ['room', 18, 21, 23, 21, 'Y'], ['room', 27, 21, 32, 21, 'Y'], ['room', 18, 24, 23, 24, 'Y'], ['room', 27, 24, 32, 24, 'Y'],
        // the foyer's bar and the office; the cloakroom's rails and counter
        ['room', 17, 29, 19, 29, 'T'], ['cells', [[37, 29], [41, 33]], 'T'], ['cells', [[41, 29]], 'M'],
        ['room', 37, 9, 37, 13, 'H'], ['cells', [[40, 12]], 'T'],
        ['cells', [[8, 36], [42, 37], [10, 20], [44, 20]], 'C'],
      ] },
    },
    1: {
      y: 3.8, wallH: 3, wall: 'paint', wallTint: [0.6, 0.18, 0.2], floor: 'carpet', ceil: 'plaster', lampPower: 0.55, lampColour: [1, 0.85, 0.6], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 16, 28, 34, 34],                       // the crush bar
        ['room', 16, 12, 19, 26],                       // the west box
        ['room', 31, 12, 34, 26],                       // the east box (the General's)
      ], after: [
        ['cells', [[18, 27], [32, 27]], 'D'],
        // the boxes' fronts, open over the stalls
        ['cells', [[20, 14], [20, 17], [20, 20], [20, 23], [30, 14], [30, 17], [30, 20], [30, 23]], 'W'],
        ['room', 17, 29, 21, 29, 'T'], ['cells', [[33, 13]], 'T'],
      ] },
    },
  },
  stairs: [{ x: 32, y: 33, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { level, mid, CELL: C } = kit;
    for (const [x, y] of [[25, 37], [14, 37], [36, 37]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 11, intensity: 0.9, color: [1, 0.88, 0.7], street: true });
    level.lights.push({ pos: [mid(25), 3.0, mid(10)], range: 9, intensity: 1.2, color: [1, 0.92, 0.8] });
    level.signs.push({ pos: [mid(25), 4.2, 35 * C + C + 0.13], yaw: 0, w: 6, h: 0.8, text: 'HOLLEN OPERA', sub: 'Opening Night', col: '#4a1a1a' });
  },
  start: { x: 25, y: 37, floor: 'G', yaw: 0 },
  zones: [
    { id: 'aud', label: 'The Opera - the auditorium', at: [16, 8, 34, 26] },
    { id: 'foyer', label: 'The Opera - the foyer', at: [16, 28, 34, 34] },
    { id: 'cloak', label: 'The Opera - the cloakroom', at: [36, 8, 42, 14] },
    { id: 'office', label: 'The Opera - the manager\'s office', at: [36, 28, 42, 34] },
    { id: 'bar', label: 'The Opera - the crush bar', at: [16, 28, 34, 34], floor: '1' },
    { id: 'wbox', label: 'The Opera - the west box', at: [16, 12, 19, 26], floor: '1' },
    { id: 'ebox', label: 'The Opera - the General\'s box', at: [31, 12, 34, 26], floor: '1' },
    { id: 'street', label: 'Hollen', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'vey', at: [33, 16, '1'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'General Brandt', tint: [0.25, 0.22, 0.2], yaw: Math.PI / 2 },
    { id: 'bg1', at: [32, 20, '1'], arms: 'smg', rank: 'specialist', temper: 'steady', name: 'A bodyguard (the General\'s box)' },
    { id: 'bg2', at: [18, 16, '1'], arms: 'pistol', rank: 'specialist', temper: 'steady', name: 'A bodyguard (the west box)' },
    { id: 'bg3', at: [27, 31, 'G'], arms: 'pistol', rank: 'specialist', temper: 'steady', name: 'A bodyguard (the foyer)' },
    { id: 'rad', at: [39, 30, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'eng', at: [38, 33, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'cl1', at: [39, 10, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'u1', at: [25, 30, '1'], route: [[22, 30], [29, 30]], arms: 'pistol' },
  ],
  civilians: [
    { id: 'diva', at: [25, 11, 'G'], yaw: Math.PI, title: 'The soprano', tint: [1.3, 1.1, 1.0], says: ['I have sung for three governments in this house. They all sit in the same box.'] },
    { id: 'usher', at: [24, 32, 'G'], yaw: 0, title: 'An usher', tint: [0.9, 0.2, 0.2], says: ['The General\'s coat is in the cloakroom, sir, on its own rail. Nobody touches the General\'s coat.'] },
    { id: 'a1', at: [19, 16, 'G'], yaw: 0, title: 'A lady in the stalls', tint: [1.2, 1.0, 1.1], says: ['Shh.'] },
    { id: 'a2', at: [29, 19, 'G'], yaw: 0, title: 'A colonel in the stalls, asleep', tint: [0.6, 0.5, 0.4], says: ['Mm? Is it the interval?'] },
    { id: 'a3', at: [21, 22, 'G'], yaw: 0, title: 'A critic with a notebook', tint: [1.0, 1.0, 0.9], says: ['The tenor is flat and the General is early. Neither is news.'] },
  ],
  pickups: [{ id: 'diary', name: 'The General\'s diary', what: 'the diary', at: [40, 12, 'G'], table: true, colour: [0.35, 0.12, 0.12] }],
  devices: [
    { id: 'c-foyer', kind: 'camera', at: [16, 34, 'G'], face: [1, -1], net: 'opera' },
    { id: 'a-opera', kind: 'alarm', at: [35, 28, 'G'], face: [1, 0], net: 'opera' },
  ],
  terminals: [{ id: 'sec', name: 'the manager\'s console', at: [37, 29, 'G'], face: [0, 1], time: 6, net: 'opera' }],
  intel: [
    { id: 'prog', at: [17, 29, 'G'], kind: 'Programme', title: 'A programme on the bar', text: ['"In the presence of General Brandt." Somebody has drawn a small cross beside his name, and then rubbed it out.'] },
    { id: 'seating', at: [33, 13, '1'], kind: 'Card', title: 'A card in the General\'s box', text: ['The box\'s seating, in his aide\'s hand: the General, his guard, and "Major K. - absent".'] },
  ],
  objectives: [
    { id: 'o1', kind: 'identify', refs: ['bg1', 'bg2', 'bg3'], text: 'Mark the three bodyguards (the east box, the west box, the foyer)' },
    { id: 'o2', kind: 'take', ref: 'diary', text: 'Take the General\'s diary (the cloakroom)' },
    { id: 'o3', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
