// FRONTLINE - Level 103, the Last Battery (first draft, M6.125; the end of THE ISLANDS). With the commander taken, most
// of the Skerries' garrison put down their rifles at the first excuse. His own guard company did not: they hold the gun
// battery on the main island and say they will fire on anything in the strait. Land on the main island with Hale and
// Moss at first light, clear the die-hards out of the battery, and hoist the white flag on the command post so the
// other islands can see it.
const W = 60, H = 40;
export default {
  id: 'battery2', no: 103, title: 'The Last Battery', place: 'the gun battery on Storm Skerry',
  where: 'The gun battery on Storm Skerry. 05:40, first light, a cold wind off the sea.',
  brief: [
    ['The job', 'With the commander taken, most of the Skerries\' garrison put down their rifles at the first excuse. His own <b>guard company</b> did not. They hold the <b>gun battery</b> on Storm Skerry and say they will fire on anything in the strait. Land on the island with <b>Hale and Moss</b> at first light. <b>Clear the die-hards out</b> of the battery. <b>Hoist the white flag</b> on the command post, so the other islands can see it.'],
    ['The place', 'Storm Skerry\'s beach is west, where you land. Three <b>gun bunkers</b> stand along the north side of the island, and the <b>command post</b> with its flagstaff is south of them. The rest is rock and gorse.'],
    ['Security', 'None that matters now. There is no alarm left to ring and nobody left to ring it for. There are nine of them, and they know the island better than you do.'],
    ['Objectives', '<b>Clear the die-hards out</b> (all of them). <b>Hoist the white flag</b> (the command post). Back to the beach, west.'],
  ],
  epilogue: {
    success: 'The white flag goes up over Storm Skerry at six, and one by one the other islands answer it. By noon the Skerries are Ghost\'s, and the strait is open to anyone who wants to cross it. Hale says he never liked boats. Moss says that is because he cannot swim.',
    partial: 'The battery is quiet, but the flag never went up. The other islands will hold out until somebody tells them it is over.',
  },
  time: { date: [3, 6, 2027], hour: 5, minute: 40 }, night: false, faction: 'red',
  relations: { red: { you: true, ghost: true }, ghost: { you: false, red: true } },
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FRAG', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.5, 0.52, 0.56, 40, 220], ambient: [0.45, 0.46, 0.5] },
  extractName: 'the beach, west', extract: { x: 2, y: 24, floor: 'G', van: [0, 6] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'concrete2', wallTint: [0.58, 0.58, 0.55], floor: 'concrete', ceil: 'concrete2', lampPower: 0.5, lampColour: [0.95, 0.95, 1], lampEvery: 5,
      channel: 3, surf: 0.5,
      carve: { size: [W, H], ops: [
        ['room', 14, 8, 20, 12],                        // the west gun bunker
        ['room', 30, 6, 36, 10],                        // the middle gun bunker
        ['room', 44, 10, 50, 14],                       // the east gun bunker
        ['room', 28, 24, 36, 30],                       // the command post
      ], after: [
        // the sea round Storm Skerry
        ['room', 0, 0, W - 1, 2, '~'], ['room', 0, 37, W - 1, H - 1, '~'], ['room', 57, 3, W - 1, 36, '~'],
        ['cells', [[17, 13], [33, 11], [47, 15], [32, 23]], 'D'],
        ['cells', [[17, 7], [33, 5], [47, 9], [27, 27], [37, 27]], 'W'],
        ['cells', [[15, 9], [31, 7], [45, 11]], 'M'], ['cells', [[19, 11], [35, 9], [49, 13]], 'C'],
        ['cells', [[30, 25]], 'T'], ['cells', [[34, 29]], 'T'], ['cells', [[35, 25]], 'H'],
        // the gorse and the rocks
        ['cells', [[8, 8], [14, 20], [24, 32], [42, 32], [50, 30], [40, 4]], 'r'], ['cells', [[10, 30], [20, 15], [40, 22], [52, 22], [26, 14], [8, 16]], 't'],
      ] },
    },
  },
  extra(kit) {
    const { box, mid } = kit;
    // the guns' barrels out of the bunkers' slits, and the flagstaff
    for (const [x, y] of [[17, 6.5], [33, 4.5], [47, 8.5]]) box([mid(x) - 0.12, 1.6, mid(y) - 1.6], [mid(x) + 0.12, 1.85, mid(y) + 0.4], 'metal', { tint: [0.3, 0.32, 0.3], solid: false });
    box([mid(32) - 0.06, 3, mid(27) - 0.06], [mid(32) + 0.06, 8, mid(27) + 0.06], 'metal', { tint: [0.7, 0.7, 0.7], solid: false });
  },
  start: { x: 3, y: 20, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'west', label: 'Storm Skerry - the west bunker', at: [14, 8, 20, 12] },
    { id: 'mid', label: 'Storm Skerry - the middle bunker', at: [30, 6, 36, 10] },
    { id: 'east', label: 'Storm Skerry - the east bunker', at: [44, 10, 50, 14] },
    { id: 'post', label: 'Storm Skerry - the command post', at: [28, 24, 36, 30] },
    { id: 'storm', label: 'Storm Skerry', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'hale', at: [3, 19, 'G'], faction: 'ghost', ally: true, name: 'Hale', arms: 'carbine', temper: 'steady', tint: [0.45, 0.6, 1.35] },
    { id: 'moss', at: [3, 21, 'G'], faction: 'ghost', ally: true, name: 'Moss', arms: 'smg', temper: 'bold', tint: [0.4, 0.55, 1.3] },
    { id: 'g1', at: [17, 10, 'G'], arms: 'carbine', temper: 'bold' },
    { id: 'g2', at: [19, 9, 'G'], arms: 'smg', temper: 'bold' },
    { id: 'g3', at: [33, 8, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'g4', at: [31, 9, 'G'], arms: 'carbine', temper: 'bold' },
    { id: 'g5', at: [47, 12, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'g6', at: [46, 13, 'G'], arms: 'shotgun', temper: 'bold' },
    { id: 'cpt', at: [32, 27, 'G'], arms: 'pistol', rank: 'officer', temper: 'bold', name: 'The guard company\'s captain' },
    { id: 'g7', at: [34, 26, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'p1', at: [30, 18, 'G'], route: [[22, 18], [44, 18]], arms: 'carbine', temper: 'bold' },
  ],
  terminals: [
    { id: 'flag', name: 'the flagstaff\'s halyard', at: [30, 25, 'G'], face: [0, 1], time: 4, verb: 'Hoist', doing: 'Hoisting',
      said: 'The white flag goes up over Storm Skerry, and snaps out in the wind where every island can see it.' },
  ],
  intel: [
    { id: 'oath', at: [34, 29, 'G'], kind: 'Oath', title: 'The guard company\'s oath, pinned to the wall', text: ['"To the last man and the last round." Under it, in several hands: "Which last man?", "Not me", and "Ask the commander - oh."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'clear', text: 'Clear the die-hards out of the battery' },
    { id: 'o2', kind: 'hack', ref: 'flag', text: 'Hoist the white flag (the command post)' },
  ],
};
