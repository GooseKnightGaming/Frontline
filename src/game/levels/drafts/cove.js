// FRONTLINE - Level 76, Hollis's Cove (first draft, M6.98; the first of HOLLIS). A name kept turning up: "Mr Hollis"
// on the dance card at the Winter Ball, "Hollis says nobody looked twice" on the paymaster's desk, "Hollis's cove - do
// not fire" on the battery's range card. Nobody in the reds' files is called Hollis. Tonight a red boat puts in at
// the cove under the Kessin cliffs, and somebody comes down the path to meet it. Mark him, follow him back up to
// wherever he goes, and take the boat's manifest.
const W = 50, H = 44;
export default {
  id: 'cove', no: 76, title: 'Hollis\'s Cove', place: 'a cove under the Kessin cliffs',
  where: 'A cove under the Kessin cliffs. 01:10, low tide, no moon.',
  brief: [
    ['The job', 'A name keeps turning up: <b>"Mr Hollis"</b> on the dance card at the Winter Ball, "Hollis says nobody looked twice" on the paymaster\'s desk, "Hollis\'s cove - do not fire" on the battery\'s range card. Nobody in the reds\' files is called Hollis. Tonight a red boat puts in at that cove, and somebody comes down the cliff path to meet it. <b>Mark him</b> on the beach. <b>Follow him</b> back up to wherever he goes. Take the boat\'s <b>manifest</b> from the boathouse.'],
    ['The place', 'A shingle beach between two headlands, with a stone <b>boathouse</b> at its east end. The <b>cliff path</b> climbs from the beach to the top in switchbacks. At the top are a lane and a <b>cottage</b>. You are on the west headland, looking down.'],
    ['Security', 'The boat\'s crew on the beach and a lookout on the east headland. Hollis brings a man of his own. No cameras, no alarm. Out here, being heard is what gets you seen.'],
    ['Objectives', '<b>Mark Hollis</b> on the beach. <b>Follow him</b> to where he goes. Take the <b>manifest</b> (the boathouse). Out over the west headland.'],
  ],
  epilogue: {
    success: 'Hollis goes up the path to a cottage on the cliff top, lets himself in with his own key, and puts the kettle on. Ghost knows his face now, and his door. The face is one Ghost has seen before: in Yard 7.',
    partial: 'Hollis is half a shape on a dark beach, or he got away up the path. Whoever he is, he will be more careful now.',
  },
  time: { date: [9, 4, 2027], hour: 1, minute: 10 }, night: true, faction: 'red',
  startLoadout: { primary: 'LR7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SCOPE8'], backup: ['SILENCER'] } },
  atmos: { fog: [0.08, 0.09, 0.12, 25, 180], ambient: [0.2, 0.21, 0.27] },
  extractName: 'the west headland', extract: { x: 2, y: 2, floor: 'G' },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'concrete2', wallTint: [0.55, 0.55, 0.52], floor: 'concrete', ceil: 'wood', lampPower: 0.5, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      channel: 3, surf: 0.5,
      carve: { size: [W, H], ops: [
        ['room', 38, 30, 44, 35],                       // the boathouse
        ['room', 30, 4, 36, 9],                         // the cottage on the cliff top
      ], after: [
        ['cells', [[37, 32], [33, 10]], 'D'],
        ['cells', [[41, 29], [45, 33], [29, 6], [37, 6]], 'W'],
        ['cells', [[40, 31], [43, 34]], 'T'], ['cells', [[31, 5], [35, 8]], 'T'],
        // the sea to the south, the shingle beach above it
        ['room', 0, 38, W - 1, H - 1, '~'],
        // the headlands' rocks, the path's edges
        ['cells', [[10, 30], [16, 34], [24, 33], [30, 30], [20, 22], [26, 18], [22, 12], [14, 8], [8, 16], [44, 22], [46, 12]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { level, mid } = kit;
    level.lights.push({ pos: [mid(41), 3.5, mid(36)], range: 10, intensity: 0.7, color: [1, 0.85, 0.6] });
    level.lights.push({ pos: [mid(33), 3.5, mid(11)], range: 9, intensity: 0.6, color: [1, 0.85, 0.6] });
  },
  vehicles: [{ id: 'redboat', kind: 'boat', at: [30, 39], yaw: Math.PI / 2, paint: 'olive', hp: 600 }],
  start: { x: 3, y: 4, floor: 'G', yaw: Math.PI },
  zones: [
    { id: 'boat', label: 'Hollis\'s Cove - the boathouse', at: [38, 30, 44, 35] },
    { id: 'cottage', label: 'Hollis\'s Cove - the cottage', at: [30, 4, 36, 9] },
    { id: 'beach', label: 'Hollis\'s Cove - the beach', at: [0, 28, W - 1, H - 1] },
    { id: 'path', label: 'Hollis\'s Cove - the cliff path', at: [0, 10, W - 1, 27] },
    { id: 'top', label: 'Hollis\'s Cove - the cliff top', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    // Hollis: on the beach with the boat's captain a while, then back up the switchbacks to the cottage
    { id: 'hollis', at: [28, 36, 'G'], route: [[28, 36], [29, 36, 45], [28, 28], [16, 26], [28, 20], [18, 16], [33, 12], [33, 11, 1e9]],
      arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Hollis', tint: [0.45, 0.6, 1.0] },
    { id: 'hman', at: [26, 35, 'G'], arms: 'carbine', temper: 'steady', name: 'Hollis\'s man' },
    { id: 'capt', at: [30, 36, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', name: 'The boat\'s captain' },
    { id: 'cr1', at: [33, 36, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'cr2', at: [24, 37, 'G'], arms: 'smg', temper: 'bold' },
    { id: 'bh', at: [41, 33, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'look', at: [46, 18, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady', yaw: Math.PI },
  ],
  pickups: [{ id: 'manifest', name: 'The boat\'s manifest', what: 'the manifest', at: [40, 31, 'G'], table: true, colour: [0.85, 0.82, 0.7] }],
  intel: [
    { id: 'tide', at: [43, 34, 'G'], kind: 'Tide table', title: 'A tide table, marked', text: ['Low water 01:00 circled. "H. meets the boat. Nobody else on the beach."'] },
    { id: 'cup', at: [35, 8, 'G'], kind: 'Letter', title: 'A letter on the cottage table', text: ['Addressed to "Mr Hollis, by hand". Inside, one line: "Yard 7 is moving its armoury on the 12th. Tell them nothing else."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'identify', refs: ['hollis'], text: 'Mark Hollis on the beach (aim at him for a second)' },
    { id: 'o2', kind: 'tail', ref: 'hollis', range: 45, near: 5, lose: 18, text: 'Follow Hollis to where he goes',
      said: 'Hollis lets himself into the cottage on the cliff top with his own key. Now Ghost knows where he lives.' },
    { id: 'o3', kind: 'take', ref: 'manifest', text: 'Take the manifest (the boathouse)' },
  ],
};
