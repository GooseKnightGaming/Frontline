// FRONTLINE - Level 6, the Bank (first draft). Rhys: "a bank with a vault". The Yellows
// are in the Merchants' Exchange Bank after hours, cutting their way to the vault - and in the vault,
// box 114, is a dossier with Ghost's name on it.
export default {
  id: 'bank', no: 6, title: 'The Bank', place: 'the Merchants\' Exchange Bank',
  where: 'The Merchants\' Exchange Bank, Corn Street. 23:05, the night of a heist.',
  brief: [
    ['The place', 'A grand banking hall on the ground floor (marble, pillars, the tellers\' counter), the manager\'s office off the lobby; offices and the security room upstairs; the basement corridor, the counting room and the vault below. The staff stair is in the back corridor, behind the tellers; the basement stair is through the door at the hall\'s north-east corner.'],
    ['The Yellows', 'Twelve of them, on every floor. Their safe-cracker is still at the vault door - it has not given yet.'],
    ['Objectives', 'Hack the <b>security terminal</b> upstairs: it opens the vault\'s steel doors. Take the <b>dossier</b> from safe-deposit box 114 in the vault. Optionally, bring out <b>Mr Osei</b>, the night manager, held in his office.'],
    ['Doors', 'The vault door will not give to anything you carry: the terminal opens it. Other locked doors give to a kick.'],
  ],
  // (M6.83) how it ends (the debrief; the case board's story so far)
  epilogue: {
    success: "Box 114's dossier leaves the Merchants' Exchange in Ghost's hands, not the Yellows'. Mr Osei is home by morning, and he says he never wants to work nights again.",
    partial: "The Yellows have some of what they came for. Ghost will meet that dossier again somewhere.",
  },
  time: { date: [24, 7, 2026], hour: 23, minute: 5 }, night: true, faction: 'yellow',
  extractName: 'the van on Corn Street', safeName: 'the van on Corn Street',
  outside: { backdrop: 'city', mat: 'asphalt', margin: 20 },
  floors: {
    B: {
      y: -4.0, wallH: 3.6, wall: 'concrete2', floor: 'concrete', ceil: 'concrete2', lampColour: [0.85, 0.9, 1], lampPower: 0.8,
      carve: { size: [42, 30], ops: [
        ['room', 36, 5, 39, 15],                       // the stair's foot
        ['room', 20, 14, 35, 18],                      // the basement corridor
        ['room', 22, 4, 34, 12],                       // the vault
        ['room', 4, 14, 18, 20],                       // the counting room
      ], after: [
        ['cell', 28, 13, 'V'], ['cell', 29, 13, 'V'], ['cell', 19, 16, 'D'], ['cell', 36, 16, 'D'],
        ['cells', [[23, 5], [23, 7], [23, 9], [23, 11], [33, 5], [33, 7], [33, 9], [33, 11], [26, 4], [30, 4]], 'H'],
        ['cells', [[8, 16], [12, 16], [8, 18], [12, 18]], 'T'], ['cells', [[15, 15], [16, 15], [5, 19]], 'C'],
        ['cells', [[25, 17], [32, 15]], 'C'],
      ] },
    },
    G: {
      y: 0, wallH: 4.0, wall: 'plaster', wallTint: [0.95, 0.9, 0.82], floor: 'marble', ceil: 'plaster', lampPower: 1.1,
      carve: { size: [42, 30], ops: [
        ['room', 4, 1, 35, 2],                         // the back corridor (the staff stair goes up at its west end)
        ['room', 4, 4, 35, 18],                        // the banking hall
        ['room', 37, 4, 39, 14],                       // the basement stair
        ['room', 15, 20, 24, 22],                      // the lobby
        ['room', 4, 20, 12, 24],                       // the manager's office
        ['room', 27, 20, 35, 24],                      // the waiting room
      ], after: [
        ['room', 8, 9, 31, 9, 'K'], ['cell', 19, 9, '.'], ['cell', 20, 9, '.'],      // the tellers' counter
        ['cells', [[8, 13], [14, 13], [25, 13], [31, 13], [8, 6], [31, 6]], 'P'],
        ['cell', 19, 3, 'D'], ['cell', 36, 5, 'D'], ['cell', 19, 19, 'D'], ['cell', 20, 19, 'D'], ['cell', 8, 19, 'L'], ['cell', 31, 19, 'D'],
        ['cell', 19, 23, 'D'], ['cell', 20, 23, 'D'],
        ['cells', [[16, 23], [17, 23], [22, 23], [23, 23], [6, 25], [9, 25], [29, 25], [33, 25]], 'W'],
        ['cells', [[12, 15], [17, 15], [22, 15], [27, 15], [12, 6], [26, 6]], 'T'],
        ['cells', [[6, 21], [28, 21], [30, 21], [32, 21]], 'Z'], ['cells', [[10, 21]], 'T'],
      ] },
    },
    1: {
      y: 4.2, wallH: 3.2, wall: 'plaster', wallTint: [0.9, 0.88, 0.84], floor: 'carpet', ceil: 'plaster',
      carve: { size: [42, 30], ops: [
        ['room', 5, 1, 12, 2],                         // the stairwell
        ['room', 2, 1, 4, 8], ['room', 2, 6, 35, 8],   // landing, and the office corridor
        ['room', 14, 1, 20, 4], ['room', 22, 1, 28, 4], ['room', 30, 1, 35, 4],
        ['room', 4, 10, 14, 16],                       // the security room
        ['room', 18, 10, 35, 16],                      // the directors' office
      ], after: [
        ['cell', 17, 5, 'D'], ['cell', 25, 5, 'D'], ['cell', 32, 5, 'D'], ['cell', 9, 9, 'L'], ['cell', 26, 9, 'D'],
        ['cells', [[16, 2], [18, 3], [24, 2], [26, 3], [32, 2], [34, 3]], 'T'], ['cells', [[20, 13], [24, 12], [28, 14], [32, 12]], 'T'],
        ['cells', [[6, 15], [13, 15], [5, 11]], 'H'], ['cells', [[30, 15], [33, 15]], 'Z'],
        ['cells', [[18, 17], [24, 17], [30, 17], [8, 17], [11, 17]], 'W'],
      ] },
    },
  },
  stairs: [
    { x: 12, y: 1, dir: 'W', len: 8, w: 2, from: 'G', to: '1' },
    { x: 37, y: 13, dir: 'N', len: 8, w: 2, from: 'B', to: 'G' },
  ],
  start: { x: 19, y: 27, floor: 'G', yaw: 0, van: [-5, 1] },
  zones: [
    { id: 'hall', label: 'The Bank - the banking hall', at: [4, 4, 35, 18], floor: 'G' },
    { id: 'manager', label: 'The Bank - the manager\'s office', at: [4, 20, 12, 24], floor: 'G' },
    { id: 'security', label: 'The Bank - the security room', at: [4, 10, 14, 16], floor: '1' },
    { id: 'vault', label: 'The Bank - the vault', at: [22, 4, 34, 12], floor: 'B' },
    { id: 'counting', label: 'The Bank - the counting room', at: [4, 14, 18, 20], floor: 'B' },
  ],
  guards: [
    { id: 'b1', at: [10, 15, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'b2', at: [28, 16, 'G'], route: [[6, 16], [33, 16]], arms: 'carbine' },
    { id: 'b3', at: [20, 6, 'G'], arms: 'revolver', rank: 'officer', temper: 'steady' },
    { id: 'b4', at: [20, 21, 'G'], arms: 'smg' },
    { id: 'b5', at: [20, 7, '1'], route: [[3, 7], [34, 7]], arms: 'smg' },
    { id: 'b6', at: [8, 13, '1'], arms: 'pistol', temper: 'steady' },
    { id: 'b7', at: [26, 13, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'b8', at: [33, 3, '1'], arms: 'smg' },
    { id: 'b9', at: [28, 16, 'B'], route: [[21, 16], [35, 16]], arms: 'smg', rank: 'sergeant' },
    { id: 'b10', at: [29, 15, 'B'], arms: 'pistol', rank: 'specialist', temper: 'steady', name: 'the safe-cracker' },
    { id: 'b11', at: [10, 17, 'B'], arms: 'smg', temper: 'cowardly' },
    { id: 'b12', at: [38, 14, 'B'], arms: 'carbine', temper: 'steady' },
  ],
  hostages: [{ id: 'osei', name: 'Mr Osei', at: [6, 22, 'G'] }],
  pickups: [{ id: 'dossier', name: 'The dossier from box 114', what: 'the dossier', at: [28, 8, 'B'], colour: [0.75, 0.2, 0.15] }],
  terminals: [{ id: 'security', name: 'the security terminal', at: [9, 12, '1'], face: [0, -1], time: 6, reveal: 30,
    said: 'Security terminal: the vault\'s steel doors are open, and the cameras put every Yellow on your radar for 30 seconds.' }],
  // (M6.68) papers to read: lore, not needed to finish
  intel: [
    { id: 'rota', at: [10, 21, 'G'], h: 0.78, kind: 'Note', title: 'A note on the manager\'s desk', text: ['Mr Osei - the gentlemen from the Exchange will call after closing to "inspect" box 114. Let them in and stay in your office.', 'You will be paid for the extra hours. Do not put them on your timesheet.'] },
    { id: 'count', at: [8, 16, 'B'], h: 0.78, kind: 'Tally', title: 'The counting room\'s tally', text: ['Tonight\'s count, signed by two clerks. A third line, in a different pen: "Box 114 - not to be counted."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'security', text: 'Hack the security terminal (first floor)' },
    { id: 'o2', kind: 'take', ref: 'dossier', text: 'Take the dossier from box 114 (the vault)' },
    { id: 'o3', kind: 'rescue', ref: 'osei', text: 'Bring out Mr Osei, the night manager', optional: true },
  ],
};
