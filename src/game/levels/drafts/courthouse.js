// FRONTLINE - Level 121, the Courthouse (first draft, M6.143; the end of THE WITNESSES). Marta Lind gave her evidence,
// and the case is nearly won - but one of the jurors has been bought, and Ghost's people say the money goes through an
// usher. Go into the Lessar courthouse in the lunch recess. Mark the usher who carries the money, take his payments
// book from the robing room, and read the jury room's telephone log at the clerk's switchboard.
const W = 50, H = 34;
export default {
  id: 'courthouse', no: 121, title: 'The Courthouse', place: 'the Lessar courthouse',
  where: 'The Lessar courthouse. 13:10, the lunch recess, the jury out.',
  brief: [
    ['The job', 'Marta Lind gave her evidence, and the case is nearly won. But one of the <b>jurors</b> has been bought, and Ghost\'s people say the money goes through an <b>usher</b>. Go into the courthouse in the lunch recess. <b>Mark the usher</b> who carries the money. Take his <b>payments book</b> from the robing room. Read the jury room\'s <b>telephone log</b> at the clerk\'s switchboard. If you can, <b>without the alarm</b>.'],
    ['The place', 'The <b>courtroom</b> is in the middle, with the public gallery\'s benches. The judges\' chambers and the <b>jury room</b> are east of it. The <b>records office</b> and the <b>robing room</b> are west, and the <b>entrance hall</b> south. You come in by the side door, south-west.'],
    ['Security', 'A camera in the entrance hall and the court\'s alarm, both on the clerk\'s console in the records office with the switchboard. The radio is with the court police sergeant, and the engineer is in the boiler room. The court police are honest, and armed. The usher\'s friends are not honest.'],
    ['Objectives', '<b>Mark the usher</b> (the courtroom). Take the <b>payments book</b> (the robing room). Read the <b>telephone log</b> (the records office). If you can, <b>without the alarm</b>. Out by the side door, south-west.'],
  ],
  epilogue: {
    success: 'The juror is excused on the Wednesday "for reasons of health", and the usher\'s payments book is read into the record on the Thursday. Brandt, Kray and Dancourt are found guilty on the Friday, on every count, by eleven jurors and a new twelfth.',
    partial: 'Part of it. The bought juror stays on the jury, and the case is closer than it should be.',
  },
  time: { date: [24, 8, 2027], hour: 13, minute: 10 }, night: false, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.6, 0.62, 0.66, 40, 240], ambient: [0.55, 0.56, 0.6] },
  extractName: 'the side door, south-west', extract: { x: 2, y: 32, floor: 'G', van: [7, 0] },
  outside: { backdrop: 'city', mat: 'concrete', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 4.5, wall: 'marble', wallTint: [0.88, 0.86, 0.8], floor: 'marble', ceil: 'plaster', lampPower: 0.65, lampColour: [1, 0.95, 0.85], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 14, 6, 34, 20],                        // the courtroom
        ['room', 36, 6, 42, 12],                        // the judges' chambers
        ['room', 36, 14, 42, 20],                       // the jury room
        ['room', 6, 6, 12, 12],                         // the records office
        ['room', 6, 14, 12, 20],                        // the robing room
        ['room', 14, 22, 34, 28],                       // the entrance hall
        ['room', 39, 25, 45, 29],                       // the boiler room
      ], after: [
        ['cells', [[24, 21], [35, 9], [35, 17], [13, 9], [13, 17], [14, 21], [24, 29], [9, 21], [38, 27]], 'D'],
        // the bench, the witness box, the dock, the gallery's benches
        ['room', 20, 7, 28, 7, 'K'], ['cells', [[30, 9]], 'T'], ['room', 16, 9, 17, 10, 'K'],
        ['room', 16, 14, 22, 14, 'Y'], ['room', 26, 14, 32, 14, 'Y'], ['room', 16, 17, 22, 17, 'Y'], ['room', 26, 17, 32, 17, 'Y'],
        ['cells', [[39, 7]], 'T'], ['room', 41, 8, 41, 11, 'H'],
        ['room', 37, 17, 41, 17, 'T'], ['cells', [[41, 15]], 'T'],
        ['cells', [[7, 7], [11, 11]], 'T'], ['room', 7, 9, 7, 11, 'H'],
        ['cells', [[11, 15]], 'T'], ['room', 7, 15, 7, 19, 'H'],
        ['room', 18, 24, 30, 24, 'Y'], ['cells', [[33, 27]], 'T'],
        ['cells', [[44, 28]], 'M'],
        ['cells', [[4, 28], [47, 31], [20, 31], [30, 31], [46, 6]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { level, mid, CELL: C } = kit;
    level.signs.push({ pos: [mid(24), 4.6, 29 * C + C + 0.13], yaw: 0, w: 6, h: 0.8, text: 'LESSAR COURTS OF JUSTICE', sub: 'Fiat justitia', col: '#2a2a2a' });
  },
  start: { x: 2, y: 30, floor: 'G', yaw: 0 },
  zones: [
    { id: 'court', label: 'The courthouse - the courtroom', at: [14, 6, 34, 20] },
    { id: 'chambers', label: 'The courthouse - the judges\' chambers', at: [36, 6, 42, 12] },
    { id: 'jury', label: 'The courthouse - the jury room', at: [36, 14, 42, 20] },
    { id: 'records', label: 'The courthouse - the records office', at: [6, 6, 12, 12] },
    { id: 'robing', label: 'The courthouse - the robing room', at: [6, 14, 12, 20] },
    { id: 'hall', label: 'The courthouse - the entrance hall', at: [14, 22, 34, 28] },
    { id: 'lessar', label: 'Lessar', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'usher', at: [24, 12, 'G'], route: [[18, 12], [31, 12]], arms: 'pistol', rank: 'specialist', temper: 'cowardly', name: 'The usher', tint: [0.2, 0.2, 0.22] },
    { id: 'uf1', at: [10, 17, 'G'], arms: 'pistol', temper: 'steady', tint: [0.3, 0.3, 0.35] },
    { id: 'uf2', at: [39, 18, 'G'], arms: 'pistol', temper: 'steady', tint: [0.3, 0.3, 0.35] },
    { id: 'rad', at: [24, 26, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio', name: 'The court police sergeant' },
    { id: 'cp1', at: [30, 23, 'G'], route: [[16, 23], [33, 23]], arms: 'pistol' },
    { id: 'clerk', at: [9, 9, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'eng', at: [42, 27, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
  ],
  civilians: [
    { id: 'juror', at: [38, 15, 'G'], yaw: Math.PI / 2, title: 'A juror, eating sandwiches', tint: [1.0, 0.95, 0.9], says: ['We are not supposed to talk about the case. The man in the corner has not talked about anything else.'] },
    { id: 'judge', at: [38, 9, 'G'], yaw: Math.PI / 2, title: 'The judge, at lunch', tint: [0.3, 0.3, 0.35], says: ['If you are from the press, go away. If you are not, go away more quietly.'] },
    { id: 'pub', at: [20, 15, 'G'], yaw: Math.PI, title: 'A member of the public, keeping her seat', tint: [1.1, 1.0, 1.0], says: ['I have not missed a day of it. That usher is in and out of the jury room like a postman.'] },
  ],
  pickups: [{ id: 'paybook', name: 'The usher\'s payments book', what: 'the payments book', at: [11, 15, 'G'], table: true, colour: [0.2, 0.2, 0.25] }],
  devices: [
    { id: 'c-hall', kind: 'camera', at: [14, 28, 'G'], face: [1, -1], net: 'court' },
    { id: 'a-court', kind: 'alarm', at: [35, 25, 'G'], face: [1, 0], net: 'court' },
  ],
  terminals: [
    { id: 'sec', name: 'the clerk\'s console', at: [7, 7, 'G'], face: [0, 1], time: 6, net: 'court' },
    { id: 'phone', name: 'the court switchboard', at: [11, 11, 'G'], face: [0, -1], time: 6, verb: 'Read', doing: 'Reading',
      said: 'The jury room\'s calls, every lunch: the same number, a café by the river. Ghost knows whose café.' },
  ],
  intel: [
    { id: 'list', at: [41, 15, 'G'], kind: 'List', title: 'The jury\'s seating list', text: ['Twelve names. Beside the ninth, very small, a pencilled "£".'] },
    { id: 'bench', at: [30, 9, 'G'], kind: 'Note', title: 'The judge\'s note on the bench', text: ['"Ask the usher why he is always in the jury room."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'identify', refs: ['usher'], text: 'Mark the usher (the courtroom)' },
    { id: 'o2', kind: 'take', ref: 'paybook', text: 'Take the payments book (the robing room)' },
    { id: 'o3', kind: 'hack', ref: 'phone', text: 'Read the telephone log (the records office)' },
    { id: 'o4', kind: 'quiet', text: 'Without the alarm', optional: true },
  ],
};
