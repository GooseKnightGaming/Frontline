// FRONTLINE - Level 54, Hollin Mill (first draft, M6.72). The reds' papers - passes, ration cards, travel permits -
// have been turning up perfect, and nobody at the Ministry printed them. They come from Hollin Mill, a paper mill
// on the millrace outside Varnholm: the reds took it over with its own printers, and its engraver makes the plates.
// Stop the press, take the plates, and get the engraver out.
const W = 50, H = 36;
export default {
  id: 'mill', no: 54, title: 'Hollin Mill', place: 'Hollin Mill, on the millrace outside Varnholm',
  where: 'Hollin Mill, the millrace road. 23:40, rain on the roofs.',
  brief: [
    ['The job', 'The reds\' forged papers (passes, ration cards, travel permits) are perfect, and they all come from <b>Hollin Mill</b>. The reds have its printers working nights and its <b>engraver</b> making the plates. <b>Jam the press</b>, take the <b>printing plates</b>, and bring the engraver, <b>Mr Arno Pell</b>, out.'],
    ['The place', 'The millrace runs east to west across the site; one <b>footbridge</b> crosses it, from the gatehouse (south) to the mill yard. North of it: the <b>press hall</b>, with the <b>drying loft</b> over it; the <b>engraver\'s shop</b> and the <b>mill office</b> east of it; the <b>warehouse</b> at the east end. The water wheel still turns.'],
    ['Security', 'Cameras on the yard and in the loft, the engraver\'s shop maglocked (the foreman\'s keycard), the alarm. The radio is in the mill office, the engineer in the press hall. A dog on the south bank. The printers are not reds; they do as they are told.'],
    ['Objectives', '<b>Jam the press</b> (the press hall). Take the <b>printing plates</b> (the engraver\'s shop). Optionally, bring <b>Mr Pell</b> out: they keep him in the warehouse. Out by the gate, south.'],
  ],
  epilogue: {
    success: 'The press is jammed and the plates are gone. Within a week the reds\' papers are being stopped at every checkpoint in the city, because a forger is only as good as his plates. Mr Pell is somewhere safe, and he is making something else now.',
    partial: 'The mill is hurt, not stopped. The reds will have the press running again, or new plates cut, within the month.',
  },
  time: { date: [20, 1, 2027], hour: 23, minute: 40 }, night: true, faction: 'red', requires: 'HACKKIT', weather: 'rain',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.12, 0.13, 0.15, 18, 120], ambient: [0.23, 0.24, 0.28] },
  extractName: 'the gate, south', extract: { x: 25, y: 35, floor: 'G' },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 12 },
  floors: {
    G: {
      y: 0, wallH: 4, wall: 'brick', wallTint: [0.55, 0.42, 0.36], floor: 'concrete', ceil: 'wood', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 6,
      channel: 3, surf: 0.5,
      carve: { size: [W, H], ops: [
        ['room', 4, 4, 22, 16],                         // the press hall
        ['room', 27, 4, 35, 10],                        // the engraver's shop
        ['room', 27, 13, 35, 16],                       // the mill office
        ['room', 40, 4, 46, 16],                        // the warehouse
        ['room', 20, 28, 30, 32],                       // the gatehouse
      ], after: [
        // (the walls are a square out from each room: doors and windows go on them)
        ['cells', [[14, 17], [23, 8], [26, 7], [36, 5], [26, 15], [43, 17], [25, 27], [25, 33]], 'D'],      // (the shop: the front maglocked, a back door east; a lane two wide between the buildings - one square wide is filled in)
        ['cells', [[8, 3], [16, 3], [3, 8], [3, 12], [32, 3], [36, 7], [36, 15], [47, 8], [47, 12], [19, 30], [31, 30]], 'W'],
        // the millrace: one footbridge (x 25)
        ['room', 2, 21, 24, 24, '~'], ['room', 26, 21, 47, 24, '~'],
        ['room', 2, 20, 24, 20, '='], ['room', 26, 20, 47, 20, '='], ['room', 2, 25, 24, 25, '='], ['room', 26, 25, 47, 25, '='],
        // inside: the presses and the paper stacks, the engraver's benches, the office desks, the warehouse's bales
        ['room', 8, 7, 11, 8, 'M'], ['room', 15, 7, 18, 8, 'M'], ['cells', [[20, 6]], 'K'],
        ['cells', [[9, 13], [13, 13], [17, 13], [21, 13]], 'C'],
        ['cells', [[32, 6], [34, 9]], 'T'], ['cells', [[29, 9]], 'K'],
        ['cells', [[30, 15], [34, 14]], 'T'],
        ['cells', [[41, 6], [42, 6], [45, 6], [41, 13], [45, 13], [46, 13]], 'C'], ['cells', [[44, 10]], 'Y'],
        ['cells', [[22, 30], [28, 31]], 'T'],
        // the yard: stacked bales, a cart
        ['cells', [[6, 18], [38, 18], [18, 26], [34, 26]], 'C'],
      ] },
    },
    1: {
      y: 4.2, wallH: 3, wall: 'brick', wallTint: [0.55, 0.42, 0.36], floor: 'wood', ceil: 'wood', lampPower: 0.4, lampColour: [1, 0.85, 0.6], lampEvery: 6,
      carve: { size: [W, H], ops: [
        ['room', 4, 4, 22, 16],                         // the drying loft
      ], after: [
        ['cells', [[8, 3], [16, 3], [3, 8], [3, 12], [12, 17], [20, 17], [23, 10]], 'W'],
        ['room', 10, 6, 20, 6, 'K'], ['room', 10, 11, 20, 11, 'K'],             // the drying racks
        ['cells', [[20, 14]], 'T'],
      ] },
    },
  },
  stairs: [{ x: 5, y: 14, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the water wheel at the millrace's east end, and the footbridge's handrails
    box([47 * C + 0.2, -2.5, 21 * C + 0.3], [48 * C - 0.2, 3.2, 25 * C - 0.3], 'wood', { tint: [0.28, 0.22, 0.17] });
    for (const z of [0.1, C - 0.15]) box([25 * C + z, 0, 20 * C], [25 * C + z + 0.05, 1.05, 26 * C], 'metal', { tint: [0.45, 0.45, 0.48], solid: false });
    for (const [x, y] of [[14, 19], [26, 18], [43, 19], [25, 26], [8, 26], [42, 26]]) level.lights.push({ pos: [mid(x), 4.5, mid(y)], range: 12, intensity: 0.85, color: [1, 0.85, 0.6], street: true });
  },
  start: { x: 46, y: 34, floor: 'G', yaw: 0 },
  zones: [
    { id: 'press', label: 'Hollin Mill - the press hall', at: [4, 4, 22, 16] },
    { id: 'loft', label: 'Hollin Mill - the drying loft', at: [4, 4, 22, 16], floor: '1' },
    { id: 'shop', label: 'Hollin Mill - the engraver\'s shop', at: [27, 4, 35, 10] },
    { id: 'office', label: 'Hollin Mill - the mill office', at: [27, 13, 35, 16] },
    { id: 'ware', label: 'Hollin Mill - the warehouse', at: [40, 4, 46, 16] },
    { id: 'gate', label: 'Hollin Mill - the gatehouse', at: [20, 28, 30, 32] },
    { id: 'race', label: 'Hollin Mill - the millrace', at: [2, 20, 47, 25] },
    { id: 'yard', label: 'Hollin Mill', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'fore', at: [13, 10, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', card: 'mill', name: 'The foreman' },
    { id: 'eng', at: [21, 9, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'ph', at: [10, 15, 'G'], route: [[6, 15], [21, 15]], arms: 'smg' },
    { id: 'loft1', at: [8, 9, '1'], route: [[6, 9], [21, 9]], arms: 'carbine' },
    { id: 'loft2', at: [20, 13, '1'], arms: 'carbine', temper: 'steady' },
    { id: 'rad', at: [32, 15, 'G'], arms: 'pistol', rank: 'specialist', temper: 'steady', role: 'radio' },
    { id: 'shop1', at: [30, 7, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'wh', at: [43, 9, 'G'], arms: 'carbine', temper: 'bold' },
    { id: 'y1', at: [20, 19, 'G'], route: [[3, 19], [47, 19]], arms: 'carbine' },
    { id: 'bridge', at: [25, 26, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 's1', at: [10, 26, 'G'], route: [[3, 26], [47, 26]], arms: 'carbine', dog: true },
    { id: 'gh', at: [24, 30, 'G'], arms: 'pistol' },
  ],
  // (the mill's own printers: kept on to work the press)
  civilians: [
    { id: 'printer', at: [12, 9, 'G'], yaw: Math.PI, title: 'A printer', tint: [0.8, 0.75, 0.65], says: ['We print what they give us. Passes, mostly. Ration cards on Thursdays.', 'Jam the press? The big lever on the control desk, then the feed. They\'ll need a fitter from the city to clear it.'] },
    { id: 'printer2', at: [17, 10, 'G'], yaw: 0, title: 'A printer', tint: [0.75, 0.8, 0.85], says: ['Mr Pell cuts the plates. They keep him in the warehouse at night, so he cannot go home and tell anyone.', 'Please be quick. The foreman counts us every hour.'] },
  ],
  hostages: [{ id: 'pell', name: 'Mr Arno Pell', at: [44, 11, 'G'] }],
  pickups: [{ id: 'plates', name: 'The printing plates', what: 'the plates', at: [32, 6, 'G'], table: true, colour: [0.7, 0.62, 0.45] }],
  devices: [
    { id: 'c-yard', kind: 'camera', at: [3, 18, 'G'], face: [1, -1], net: 'mill' },
    { id: 'c-yard2', kind: 'camera', at: [38, 19, 'G'], face: [-1, -1], net: 'mill' },
    { id: 'c-loft', kind: 'camera', at: [22, 4, '1'], face: [-1, 1], net: 'mill' },
    { id: 'm-shop', kind: 'lock', at: [26, 7, 'G'], net: 'mill' },
    { id: 'a-mill', kind: 'alarm', at: [20, 17, 'G'], face: [0, 1], net: 'mill' },
  ],
  terminals: [
    { id: 'sec', name: 'the mill office console', at: [35, 15, 'G'], face: [-1, 0], time: 6, net: 'mill' },
    { id: 'press', name: 'the press controls', at: [20, 5, 'G'], face: [0, 1], time: 8, verb: 'Jam', doing: 'Jamming',
      said: 'The big lever, then the feed. The press grinds, shudders and stops, with a sheet half through it. Nobody prints anything here tonight.' },
  ],
  intel: [
    { id: 'orders', at: [30, 15, 'G'], kind: 'Order book', title: 'The mill\'s order book', text: ['No customers\' names, only quantities: four thousand travel permits, ten thousand ration cards, "passes as required".', 'Collected every Friday. Paid for by nobody.'] },
    { id: 'pell', at: [34, 9, 'G'], kind: 'Note', title: 'A note under the engraver\'s lamp', text: ['I have cut a flaw into every plate: one hair out of place in the crest, where no checkpoint guard would ever look.', 'Ghost would know where to look. - A.P.'] },
    { id: 'rota', at: [20, 14, '1'], kind: 'Rota', title: 'The loft\'s rota', text: ['Two men up here at all times, "for the fire risk". The fire risk is the men from the press hall having a smoke.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'press', text: 'Jam the press (the press hall)' },
    { id: 'o2', kind: 'take', ref: 'plates', text: 'Take the printing plates (the engraver\'s shop)' },
    { id: 'o3', kind: 'rescue', ref: 'pell', text: 'Bring Mr Pell out (the warehouse)', optional: true },
  ],
};
