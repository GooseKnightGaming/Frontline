// FRONTLINE - Level 48, the Varnholm Museum (first draft, M6.51): a night in the museum. The Ministry's records
// say the reds paid for the blight with something they did not own: the Halvard Codex, lent to the museum by a
// neighbour - and due to leave for a buyer tomorrow. Take it back before it goes. Lasers, cases of glass, a
// gallery round the great hall: a quiet job, if you keep it one.
const W = 46, H = 36;
export default {
  id: 'museum', no: 48, title: 'The Varnholm Museum', place: 'the Varnholm Museum',
  where: 'The Varnholm Museum. 02:30, closed, its galleries lit low.',
  brief: [
    ['The job', 'The reds paid for the blight with something they did not own: the <b>Halvard Codex</b>, a neighbour\'s, on loan to the museum - and sold. It leaves tomorrow. Take it back. And find out who it was sold to: the <b>loan register</b> in the curator\'s office.'],
    ['The place', 'You come in by the <b>loading dock</b> at the back (north). Ground floor: the <b>great hall</b> (its statues; a gallery round it upstairs), the east and west galleries, the <b>security office</b> by the front doors. Upstairs: the gallery round the hall, the <b>curator\'s office</b> (west), and the <b>special exhibition</b> (east - maglocked) where the Codex is, in its case.'],
    ['Security', 'Laser tripwires across the galleries (on your belly under them, or hack them); the display cases are glass, and a round through one breaks it - loudly; cameras (a pinhole in the special exhibition - EMF), the maglock, the alarm - all from the security office. The night staff are reds tonight; one has a radio, one is an engineer.'],
    ['Objectives', 'Take the <b>Halvard Codex</b> (the special exhibition). Copy the <b>loan register</b> (the curator\'s office). Out by the loading dock.'],
  ],
  // (M6.82) how it ends (the debrief; the case board's story so far)
  epilogue: {
    success: "The Halvard Codex leaves the Varnholm Museum in Ghost's hands, not the buyer's. The loan register goes with it. One name in it does not add up: the night curator who signed the book out.",
    partial: "The Codex or the register, not both. The buyer will know by morning that someone else came for it.",
  },
  time: { date: [8, 1, 2027], hour: 2, minute: 30 }, night: true, faction: 'red', requires: 'HACKKIT', startGear: 'MULTIVIS',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'LURE', gear: 'MULTIVIS', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  extractName: 'the loading dock', extract: { x: 22, y: 1, floor: 'G' },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 5.2, wall: 'plaster', wallTint: [0.88, 0.85, 0.78], floor: 'marble', ceil: 'plaster', lampPower: 0.55, lampColour: [1, 0.9, 0.75], lampEvery: 7,
      carve: { size: [W, H], ops: [
        ['room', 14, 10, 31, 27],                       // the great hall
        ['room', 4, 10, 12, 27],                        // the west gallery
        ['room', 33, 10, 41, 27],                       // the east gallery
        ['room', 4, 4, 41, 8],                          // the back corridor, and the loading dock's door
        ['room', 14, 29, 31, 32],                       // the foyer and the security office
      ], after: [
        ['cells', [[22, 3], [23, 3], [22, 9], [23, 9], [13, 14], [13, 23], [32, 14], [32, 23], [22, 28], [23, 28], [22, 33], [23, 33], [8, 9], [37, 9]], 'D'],
        ['room', 26, 29, 26, 32, '#'], ['cell', 26, 30, 'D'],                                 // the security office, off the foyer
        ['cells', [[3, 14], [3, 22], [42, 14], [42, 22], [18, 33], [27, 33]], 'W'],
        // the hall's statues (solid squares, drawn in extra); the galleries' cases ('c', below)
        ['cells', [[18, 14], [27, 14], [18, 23], [27, 23], [22, 18], [23, 18]], 'J'],
        ['cells', [[6, 12], [10, 12], [6, 17], [10, 17], [6, 22], [10, 22], [35, 12], [39, 12], [35, 17], [39, 17], [35, 22], [39, 22]], 'c'],
        ['cells', [[28, 31], [30, 31]], 'M'], ['cells', [[29, 30]], 'T'], ['room', 16, 30, 20, 30, 'K'],
        ['room', 6, 5, 9, 6, 'C'], ['cells', [[36, 6], [38, 6]], 'C'],
      ] },
    },
    1: {
      y: 5.4, wallH: 3.6, wall: 'plaster', wallTint: [0.88, 0.85, 0.78], floor: 'wood', floorTint: [0.45, 0.32, 0.22], ceil: 'plaster', lampPower: 0.5, lampColour: [1, 0.9, 0.75], lampEvery: 7,
      carve: { size: [W, H], ops: [
        ['room', 14, 10, 31, 27],                       // the gallery round the great hall
        ['room', 4, 10, 12, 27],                        // the curator's office
        ['room', 33, 10, 41, 27],                       // the special exhibition
      ], after: [
        ['room', 16, 12, 29, 25, 'O'],
        ['room', 16, 11, 29, 11, '='], ['room', 16, 26, 29, 26, '='], ['room', 15, 12, 15, 25, '='], ['room', 30, 12, 30, 25, '='],
        ['cells', [[13, 18], [32, 18]], 'D'],
        ['cells', [[3, 14], [3, 22], [42, 14], [42, 22]], 'W'],
        ['cells', [[6, 13], [9, 13]], 'T'], ['cells', [[5, 24], [7, 24], [9, 24], [11, 24]], 'H'], ['cells', [[10, 20]], 'Z'],
        ['cells', [[35, 13], [39, 13], [35, 24], [39, 24]], 'c'],
      ] },
    },
  },
  legend: {
    // a display case: a stand, and a glass box on it that a round will break
    c(k, x, y, f) {
      const [cx, cy, cz] = k.at(x, y, f);
      k.box([cx - 0.45, cy, cz - 0.45], [cx + 0.45, cy + 0.9, cz + 0.45], 'wood', { tint: [0.35, 0.25, 0.18] });
      k.pane([cx - 0.4, cy + 0.9, cz - 0.4], [cx + 0.4, cy + 1.6, cz + 0.4], 0);      // (a round through it, and it goes - loudly)
    },
  },
  stairs: [{ x: 31, y: 26, dir: 'N', len: 4, w: 1, from: 'G', to: '1' }],      // the hall's stair, up to the gallery (its south-east corner)
  start: { x: 22.5, y: 1, floor: 'G', yaw: Math.PI },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the Codex's plinth in the special exhibition
    box([mid(37) - 0.6, 5.4, mid(18) - 0.6], [mid(37) + 0.6, 6.4, mid(18) + 0.6], 'marble', { tint: [0.9, 0.9, 0.88] });
    // the hall's statues on their plinths
    for (const [x, y] of [[18, 14], [27, 14], [18, 23], [27, 23], [22, 18], [23, 18]]) {
      box([x * C + 0.1, 0, y * C + 0.1], [(x + 1) * C - 0.1, 1.1, (y + 1) * C - 0.1], 'marble', { tint: [0.8, 0.79, 0.75] });
      box([mid(x) - 0.3, 1.1, mid(y) - 0.25], [mid(x) + 0.3, 3.0, mid(y) + 0.25], 'marble', { tint: [0.92, 0.91, 0.88] });
      box([mid(x) - 0.18, 3.0, mid(y) - 0.18], [mid(x) + 0.18, 3.4, mid(y) + 0.18], 'marble', { tint: [0.92, 0.91, 0.88] });
    }
    level.signs.push({ pos: [mid(22.5), 4.2, 33 * C + C + 0.14], yaw: 0, w: 4.4, h: 0.7, text: 'VARNHOLM MUSEUM', sub: 'Est. 1871', col: '#2b2a24' });
  },
  zones: [
    { id: 'hall', label: 'The Museum - the great hall', at: [14, 10, 31, 27] },
    { id: 'west', label: 'The Museum - the west gallery', at: [4, 10, 12, 27] },
    { id: 'east', label: 'The Museum - the east gallery', at: [33, 10, 41, 27] },
    { id: 'back', label: 'The Museum - the back corridor', at: [4, 4, 41, 8] },
    { id: 'foyer', label: 'The Museum - the foyer', at: [14, 29, 31, 32] },
    { id: 'gallery', label: 'The Museum - the gallery', at: [14, 10, 31, 27], floor: '1' },
    { id: 'curator', label: 'The Museum - the curator\'s office', at: [4, 10, 12, 27], floor: '1' },
    { id: 'special', label: 'The Museum - the special exhibition', at: [33, 10, 41, 27], floor: '1' },
    { id: 'dock', label: 'The Museum - the loading dock', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'sec', at: [30, 30, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio', card: 'museum' },
    { id: 'fy', at: [18, 31, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'h1', at: [20, 20, 'G'], route: [[15, 11], [30, 11], [30, 26], [15, 26]], arms: 'carbine' },
    { id: 'w1', at: [8, 15, 'G'], route: [[8, 11], [8, 26]], arms: 'pistol' },
    { id: 'e1', at: [37, 20, 'G'], route: [[37, 26], [37, 11]], arms: 'pistol' },
    { id: 'eng', at: [30, 6, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'g1', at: [22, 10, '1'], route: [[14, 10], [31, 10], [31, 27], [14, 27]], arms: 'carbine' },
    { id: 'sp', at: [34, 26, '1'], arms: 'smg', temper: 'steady' },
    { id: 'cur', at: [6, 20, '1'], arms: 'pistol', temper: 'cowardly', rank: 'officer', name: 'The night curator' },
  ],
  pickups: [{ id: 'codex', name: 'The Halvard Codex', what: 'the Codex', at: [37, 18, '1'], table: false, h: 1.0, colour: [0.65, 0.45, 0.2] }],
  devices: [
    { id: 'c-hall', kind: 'camera', at: [31, 10, 'G'], face: [-1, 1], net: 'museum' },
    { id: 'c-foyer', kind: 'camera', at: [14, 29, 'G'], face: [1, 1], net: 'museum' },
    { id: 'c-gal', kind: 'camera', at: [14, 27, '1'], face: [1, -1], net: 'museum' },
    { id: 'c-pin-sp', kind: 'camera', at: [41, 27, '1'], face: [-1, -1], net: 'museum', hidden: true },
    { id: 'z-west', kind: 'laser', at: [4, 19, 'G'], to: [12, 19], net: 'museum' },
    { id: 'z-east', kind: 'laser', at: [33, 19, 'G'], to: [41, 19], net: 'museum' },
    { id: 'z-sp', kind: 'laser', at: [33, 15, '1'], to: [41, 15], net: 'museum' },
    { id: 'm-sp', kind: 'lock', at: [32, 18, '1'], net: 'museum' },
    { id: 'a-hall', kind: 'alarm', at: [22, 27, 'G'], face: [0, -1], net: 'museum' },
  ],
  terminals: [
    { id: 'secd', name: 'the security office\'s console', at: [28, 30, 'G'], face: [0, 1], time: 6, net: 'museum' },
    { id: 'register', name: 'the loan register', at: [7, 13, '1'], face: [0, 1], time: 8, reveal: 20, verb: 'Copy', doing: 'Copying',
      said: 'The loan register: the Codex, "returned to lender" in a hand that is not the curator\'s - and the buyer\'s name under it. Every red here on your radar for 20 seconds.' },
  ],
  // (M6.58) papers to read: lore, not needed to finish
  intel: [
    { id: "night", at: [29, 30, "G"], kind: "Night log", title: "The night security log", text: ["01:00 - all galleries checked. 01:30 - the curator in the special exhibition again, \"cataloguing\".", "02:00 - told to leave the special exhibition off the round tonight. By whom? Not written down."] },
    { id: "letter", at: [9, 13, "1"], kind: "Letter", title: "Letter - to the night curator", text: ["Tobias - the lender wants the Codex home by spring. Please make sure the paperwork is in order.", "Under it, in another hand: \"It will be returned. To someone.\""] },
  ],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'codex', text: 'Take the Halvard Codex (the special exhibition, upstairs)' },
    { id: 'o2', kind: 'hack', ref: 'register', text: 'Copy the loan register (the curator\'s office, upstairs)' },
  ],
};
