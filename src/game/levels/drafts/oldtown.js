// FRONTLINE - Level 111, Saren Old Town (first draft, M6.133; THE SMUGGLERS, second). The inspector signs for the
// crates, but somebody pays him, and every Friday night he walks to them through the old town to be paid. Follow him
// through the lanes, close enough not to lose him and not so close that he notices, to the smugglers' warehouse. Mark
// the buyer who meets him there, and take the smugglers' price list.
const W = 60, H = 44;
const BLOCKS = [[6, 6, 16, 14], [22, 6, 34, 14], [40, 6, 52, 14], [6, 20, 16, 30], [22, 20, 30, 30], [36, 20, 52, 30], [22, 34, 30, 40], [36, 34, 52, 40]];
export default {
  id: 'oldtown', no: 111, title: 'Saren Old Town', place: 'the old town, Port Saren',
  where: 'The old town, Port Saren. 21:50, Friday, the lanes full of the evening\'s smells.',
  brief: [
    ['The job', 'The inspector signs for the crates, but somebody pays him, and every Friday night he walks to them through the <b>old town</b> to be paid. <b>Follow him</b> through the lanes, close enough not to lose him and not so close that he notices, to the smugglers\' <b>warehouse</b>. <b>Mark the buyer</b> who meets him there. Take the smugglers\' <b>price list</b>.'],
    ['The place', 'The old town is a knot of tall houses with lanes between them. The inspector comes up from the customs house at the north-west and goes wherever he goes. The smugglers\' <b>warehouse</b> is somewhere in the lower town. You start at the top of the town, north-west.'],
    ['Security', 'The harbour police walk the long lanes, and they are paid too. Inside the warehouse the smugglers keep their own men. The inspector looks behind him, now and then.'],
    ['Objectives', '<b>Follow the inspector</b> to where he goes. <b>Mark the buyer</b> (the warehouse). Take the <b>price list</b> (the warehouse). Back to the top of the town, north-west.'],
  ],
  epilogue: {
    success: 'The price list says what a crate of the north\'s rifles costs in Port Saren on a Friday, and who pays it. The buyer is a man Ghost has wanted for some years, from some way further south.',
    partial: 'The inspector led Ghost somewhere, but not everything was found there. The smugglers will change their warehouse.',
  },
  time: { date: [9, 7, 2027], hour: 21, minute: 50 }, night: true, faction: 'red',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.2, 0.17, 0.18, 25, 170], ambient: [0.34, 0.3, 0.3] },
  extractName: 'the top of the town', extract: { x: 3, y: 2, floor: 'G', van: [0, 6] },
  outside: { backdrop: 'city', mat: 'concrete', margin: 14 },
  windows: false,
  floors: {
    G: {
      y: 0, wallH: 4, wall: 'plaster', wallTint: [0.92, 0.82, 0.66], floor: 'concrete', ceil: 'wood', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 6, 35, 16, 40],                        // the smugglers' warehouse
      ], after: [
        ...BLOCKS.map(([x0, y0, x1, y1]) => ['room', x0, y0, x1, y1, 'J']),
        ['cells', [[17, 37]], 'D'], ['cells', [[11, 34], [5, 38]], 'W'],
        ['room', 8, 38, 8, 40, 'C'], ['room', 11, 38, 11, 40, 'C'], ['cells', [[15, 36]], 'T'], ['cells', [[13, 40]], 'T'],
        // the lanes' café tables, carts and steps
        ['cells', [[19, 10], [56, 10], [33, 24], [26, 42]], 'B'], ['cells', [[36, 4], [3, 24], [56, 36], [4, 12]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    BLOCKS.forEach(([x0, y0, x1, y1], i) => box([x0 * C, 0, y0 * C], [(x1 + 1) * C, 8 + (i % 3) * 2, (y1 + 1) * C], 'plaster', { tint: [0.92 - (i % 2) * 0.1, 0.8, 0.64] }));
    for (const [x, y] of [[19, 4], [19, 17], [34, 17], [34, 31], [19, 32], [3, 17], [56, 17], [55, 4]]) level.lights.push({ pos: [mid(x), 4.2, mid(y)], range: 9, intensity: 0.75, color: [1, 0.85, 0.6], street: true });
  },
  start: { x: 3, y: 3, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'ware', label: 'The old town - the smugglers\' warehouse', at: [6, 35, 16, 40] },
    { id: 'old', label: 'The old town, Port Saren', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'insp', at: [19, 3, 'G'], route: [[19, 3, 20], [19, 17], [34, 17], [34, 32], [19, 32], [19, 37, 1e9]],
      arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The inspector', tint: [0.3, 0.32, 0.4] },
    { id: 'buyer', at: [12, 37, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The buyer', tint: [0.55, 0.45, 0.35] },
    { id: 'wh1', at: [8, 36, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'wh2', at: [14, 39, 'G'], arms: 'carbine' },
    { id: 'pol1', at: [44, 32, 'G'], route: [[36, 32], [56, 32]], arms: 'pistol' },
    { id: 'pol2', at: [56, 22, 'G'], route: [[56, 16], [56, 34]], arms: 'carbine' },
  ],
  civilians: [
    { id: 'cafe', at: [20, 11, 'G'], yaw: Math.PI / 2, title: 'A café owner, stacking chairs', tint: [1.1, 1.0, 0.9], says: ['The customs gentleman? Every Friday, down to the warehouses, always the long way round.'] },
    { id: 'kid', at: [33, 26, 'G'], yaw: 0, title: 'A boy with a dog', tint: [1.2, 1.1, 1.0], says: ['The big shed by the water has men in it who give you a coin to go away.'] },
  ],
  pickups: [{ id: 'prices', name: 'The smugglers\' price list', what: 'the price list', at: [15, 36, 'G'], table: true, colour: [0.9, 0.85, 0.7] }],
  intel: [
    { id: 'chalk', at: [13, 40, 'G'], kind: 'Tally', title: 'A chalk tally on a crate', text: ['Forty crates, "agricultural". Thirty-eight sold. Two put aside, "for the inspector\'s pension".'] },
  ],
  objectives: [
    { id: 'o1', kind: 'tail', ref: 'insp', range: 40, near: 5, lose: 16, text: 'Follow the inspector to where he goes',
      said: 'The inspector knocks at a warehouse door in the lower town, and is let in. Now Ghost knows where he is paid.' },
    { id: 'o2', kind: 'identify', refs: ['buyer'], text: 'Mark the buyer (the warehouse)' },
    { id: 'o3', kind: 'take', ref: 'prices', text: 'Take the price list (the warehouse)' },
  ],
};
