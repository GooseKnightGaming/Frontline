// FRONTLINE - Level 56, Varnholm Town Hall (first draft, M6.74; the end of the forgers' trail). The Holm Bridge
// register says who paid for the mill's papers: the reds' Office of Movement, in the old town hall, where the city's
// passes are issued - and taken away. Its quartermaster's ledger names everyone who was paid. And in the basement, in
// the records vault, are the real passes they confiscated from ordinary people and called forgeries.
const W = 46, H = 36;
export default {
  id: 'townhall', no: 56, title: 'Varnholm Town Hall', place: 'the Office of Movement, Varnholm Town Hall',
  where: 'Varnholm Town Hall, the Office of Movement. 19:10, after hours, sleet.',
  brief: [
    ['The job', 'The Holm Bridge register shows who paid for the mill\'s papers: the reds\' <b>Office of Movement</b>, in the old town hall. Upstairs, the <b>quartermaster\'s ledger</b> names everyone who was paid. Take it. In the basement <b>records vault</b> are the <b>real passes</b> the office confiscated from ordinary people and called forgeries. Bring them out, so they can go back to their owners.'],
    ['The place', 'Ground floor: the long <b>hall</b>, the <b>pass office</b> (counters), the <b>registry</b>, the porters\' lodge, the waiting room, the clerk\'s office. A grand stair up to the first floor (the <b>Controller\'s office</b>, the <b>quartermaster\'s office</b>, the typing pool) and a plain one down to the basement (the <b>records vault</b>, maglocked; the boiler room).'],
    ['Security', 'Cameras on every floor, the vault maglocked (the registrar has the card), the alarm. The radio is in the porters\' lodge, the engineer down in the boiler room. Two of the town hall\'s own staff are still at work. They are not reds.'],
    ['Objectives', 'Take the <b>quartermaster\'s ledger</b> (first floor). Take the <b>confiscated passes</b> (the basement vault). If you can, <b>restore the records</b> in the registry, so the confiscations are struck out. Out by the east street.'],
  ],
  epilogue: {
    success: 'The ledger goes to the newspapers and the passes go back to their owners, a thousand of them, one by one, at a table in the market square. The Office of Movement closes its doors "for reorganisation", and it does not open them again.',
    partial: 'Half of it. Either the people who were paid are still unnamed, or the people who were robbed are still waiting. The Office of Movement will be open again on Monday.',
  },
  time: { date: [27, 1, 2027], hour: 19, minute: 10 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'snow',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'RCAM', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.2, 0.22, 0.27, 25, 170], ambient: [0.28, 0.29, 0.34] },
  extractName: 'the east street', extract: { x: 43, y: 33, floor: 'G' },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    B: {
      y: -3.6, wallH: 3.2, wall: 'concrete2', floor: 'concrete', ceil: 'concrete2', lampColour: [0.85, 0.9, 1], lampPower: 0.7, lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 22, 4, 28, 12],                        // the stair's foot
        ['room', 8, 14, 37, 18],                        // the basement corridor
        ['room', 8, 4, 20, 12],                         // the records vault
        ['room', 30, 4, 37, 12],                        // the boiler room
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
        ['room', 8, 14, 37, 20],                        // the hall
        ['room', 8, 4, 20, 12],                         // the pass office
        ['room', 22, 4, 28, 12],                        // the stair hall
        ['room', 30, 4, 37, 12],                        // the registry
        ['room', 8, 22, 22, 30],                        // the waiting room
        ['room', 24, 22, 28, 30],                       // the porters' lodge
        ['room', 30, 22, 37, 30],                       // the clerk's office
      ], after: [
        ['cells', [[14, 13], [25, 13], [33, 13], [15, 21], [26, 21], [33, 21], [7, 17], [38, 17]], 'D'],
        ['room', 10, 9, 18, 9, 'K'], ['cells', [[12, 6], [16, 6]], 'T'],                        // the pass office's counter
        ['cells', [[32, 6], [35, 9]], 'T'], ['cells', [[31, 10], [36, 5]], 'H'],
        ['room', 10, 25, 20, 25, 'Y'], ['room', 10, 28, 20, 28, 'Y'],                            // the waiting room's benches
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
        ['room', 8, 4, 20, 12],                         // the quartermaster's office
        ['room', 30, 4, 37, 12],                        // the Controller's office
        ['room', 8, 22, 22, 30],                        // the meeting room
        ['room', 24, 22, 37, 30],                       // the typing pool
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
    level.signs.push({ pos: [mid(5.5), 3.9, mid(17)], yaw: Math.PI / 2, w: 3.8, h: 0.7, text: 'TOWN HALL', sub: 'Office of Movement', col: '#3a2a22' });
  },
  start: { x: 2, y: 17, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'hall', label: 'Varnholm Town Hall - the hall', at: [8, 14, 37, 20] },
    { id: 'pass', label: 'Varnholm Town Hall - the pass office', at: [8, 4, 20, 12] },
    { id: 'stair', label: 'Varnholm Town Hall - the stair hall', at: [22, 4, 28, 12] },
    { id: 'reg', label: 'Varnholm Town Hall - the registry', at: [30, 4, 37, 12] },
    { id: 'wait', label: 'Varnholm Town Hall - the waiting room', at: [8, 22, 22, 30] },
    { id: 'lodge', label: 'Varnholm Town Hall - the porters\' lodge', at: [24, 22, 28, 30] },
    { id: 'clerk', label: 'Varnholm Town Hall - the clerk\'s office', at: [30, 22, 37, 30] },
    { id: 'corr1', label: 'Varnholm Town Hall - the first floor', at: [8, 14, 37, 20], floor: '1' },
    { id: 'qm', label: 'Varnholm Town Hall - the quartermaster\'s office', at: [8, 4, 20, 12], floor: '1' },
    { id: 'ctl', label: 'Varnholm Town Hall - the Controller\'s office', at: [30, 4, 37, 12], floor: '1' },
    { id: 'meet', label: 'Varnholm Town Hall - the meeting room', at: [8, 22, 22, 30], floor: '1' },
    { id: 'typing', label: 'Varnholm Town Hall - the typing pool', at: [24, 22, 37, 30], floor: '1' },
    { id: 'land', label: 'Varnholm Town Hall - the first floor', at: [0, 0, W - 1, H - 1], floor: '1' },
    { id: 'vault', label: 'Varnholm Town Hall - the records vault', at: [8, 4, 20, 12], floor: 'B' },
    { id: 'boil', label: 'Varnholm Town Hall - the boiler room', at: [30, 4, 37, 12], floor: 'B' },
    { id: 'base', label: 'Varnholm Town Hall - the basement', at: [0, 0, W - 1, H - 1], floor: 'B' },
    { id: 'street', label: 'Varnholm Town Hall - the street', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'ctl', at: [34, 8, '1'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The Controller' },
    { id: 'qm', at: [12, 8, '1'], arms: 'pistol', temper: 'cowardly', name: 'The quartermaster' },
    { id: 'c1', at: [20, 17, '1'], route: [[9, 17], [36, 17]], arms: 'smg' },
    { id: 'tp', at: [30, 26, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'reg', at: [33, 9, 'G'], arms: 'pistol', rank: 'specialist', temper: 'steady', card: 'hall', name: 'The registrar' },
    { id: 'h1', at: [20, 17, 'G'], route: [[9, 17], [36, 17]], arms: 'carbine' },
    { id: 'po', at: [14, 7, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'rad', at: [26, 27, 'G'], arms: 'pistol', temper: 'steady', role: 'radio' },
    { id: 'door', at: [40, 17, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'st', at: [22, 33, 'G'], route: [[2, 33], [43, 33]], arms: 'carbine', dog: true },
    { id: 'eng', at: [34, 10, 'B'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'b1', at: [20, 16, 'B'], route: [[9, 16], [36, 16]], arms: 'carbine' },
  ],
  civilians: [
    { id: 'cleaner', at: [28, 18, 'G'], yaw: 0, title: 'A cleaner', tint: [0.75, 0.85, 0.75], says: ['Thirty years I\'ve cleaned this hall. I never saw so many people turned away from it.', 'The registrar keeps the vault card in his top pocket. He pats it, like a dog.'] },
    { id: 'clerk', at: [33, 26, 'G'], yaw: Math.PI, title: 'A town clerk', tint: [0.85, 0.85, 0.95], says: ['They took the real passes and kept them downstairs. Then they sold people the forged ones.', 'The registry will strike out a confiscation if the order is entered. I could never get near it.'] },
  ],
  pickups: [
    { id: 'ledger', name: 'The quartermaster\'s ledger', what: 'the ledger', at: [10, 6, '1'], table: true, colour: [0.5, 0.2, 0.15] },
    { id: 'passes', name: 'The confiscated passes', what: 'the passes', at: [13, 8, 'B'], table: true, colour: [0.85, 0.8, 0.6] },
  ],
  devices: [
    { id: 'c-hall', kind: 'camera', at: [8, 14, 'G'], face: [1, 1], net: 'hall' },
    { id: 'c-corr1', kind: 'camera', at: [37, 14, '1'], face: [-1, 1], net: 'hall' },
    { id: 'c-base', kind: 'camera', at: [37, 14, 'B'], face: [-1, 1], net: 'hall' },
    { id: 'm-vault', kind: 'lock', at: [14, 13, 'B'], net: 'hall' },
    { id: 'a-hall', kind: 'alarm', at: [22, 21, 'G'], face: [0, -1], net: 'hall' },
  ],
  terminals: [
    { id: 'sec', name: 'the porters\' lodge console', at: [26, 24, 'G'], face: [0, 1], time: 6, net: 'hall' },
    { id: 'records', name: 'the registry', at: [32, 6, 'G'], face: [0, 1], time: 8, verb: 'Restore', doing: 'Restoring',
      said: 'One order, entered against every confiscation in the book: "Returned to owner." The register is right again.' },
  ],
  intel: [
    { id: 'quota', at: [17, 9, '1'], kind: 'Memo', title: 'A memo to the quartermaster', text: ['Confiscations this month: four hundred and twelve. Replacement passes sold: four hundred and nine.', 'The Controller asks about the other three.'] },
    { id: 'queue', at: [12, 6, 'G'], kind: 'Notice', title: 'A notice on the counter', text: ['Passes found to be forgeries will be confiscated. A replacement may be bought at the second window. Cash only.'] },
    { id: 'ctl', at: [35, 10, '1'], kind: 'Letter', title: 'A letter on the Controller\'s desk', text: ['The bridge has stopped reading the blue cards. Someone knows about the flaw. Burn the mill\'s account book and say nothing to the quartermaster.', 'He talks.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'ledger', text: 'Take the quartermaster\'s ledger (first floor)' },
    { id: 'o2', kind: 'take', ref: 'passes', text: 'Take the confiscated passes (the basement vault)' },
    { id: 'o3', kind: 'hack', ref: 'records', text: 'Restore the records (the registry)', optional: true },
  ],
};
