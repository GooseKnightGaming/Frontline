// FRONTLINE - Level 112, the Smugglers' Cove (first draft, M6.134; the end of THE SMUGGLERS). The price list named the
// cove where the crates come ashore: Gull Cove, east of Saren, under the cliffs. Tonight the last of the north's rifles
// go out from it again, south, in the smugglers' boat - and the one honest customs officer in Port Saren, who went to
// look, is tied up in their boathouse. Bring the officer out, and stop the boat before it is out of the cove.
const W = 56, H = 42;
export default {
  id: 'smugcove', no: 112, title: 'The Smugglers\' Cove', place: 'Gull Cove, east of Port Saren',
  where: 'Gull Cove, east of Port Saren. 01:40, a slack tide, the smugglers\' boat loading by lantern.',
  brief: [
    ['The job', 'The price list named the cove where the crates come ashore: <b>Gull Cove</b>, east of Saren, under the cliffs. Tonight the last of the north\'s rifles go out again, south, in the <b>smugglers\' boat</b>. The one honest customs officer in Port Saren went to look, and is tied up in their <b>boathouse</b>. <b>Bring the officer out</b>. <b>Stop the boat</b> before it is out of the cove.'],
    ['The place', 'The cliff path comes down from the west, where you are, to the beach. The <b>boathouse</b> stands on the beach, the <b>boat</b> is loading at the jetty beside it, and the cove opens to the sea southwards. The smugglers\' hut is up on the cliff to the east.'],
    ['Security', 'No alarm and no console, only the smugglers. There are men at the jetty and on the beach, and a lookout on the cliff with a rifle. The boat leaves in about three minutes, or at once if its crew are shot at.'],
    ['Objectives', 'Bring out the <b>customs officer</b> (the boathouse). <b>Stop the boat</b> before it is out of the cove. Back up the cliff path, west.'],
  ],
  epilogue: {
    success: 'The smugglers\' boat stays at the jetty with forty crates of the north\'s rifles in it, and the honest officer of customs signs the seizure himself. Port Saren\'s trade in guns is over, for this year at least.',
    partial: 'The officer is out, or the boat stopped, not both. The south will get some of the north\'s rifles after all.',
  },
  time: { date: [12, 7, 2027], hour: 1, minute: 40 }, night: true, faction: 'red',
  startLoadout: { primary: 'LR7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SCOPE8'], backup: ['SILENCER'] } },
  atmos: { fog: [0.1, 0.11, 0.15, 25, 180], ambient: [0.22, 0.23, 0.29] },
  extractName: 'the cliff path, west', extract: { x: 2, y: 6, floor: 'G', van: [0, 6] },
  outside: { backdrop: 'hills', mat: 'grass', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 3, wall: 'wood', wallTint: [0.55, 0.45, 0.35], floor: 'wood', ceil: 'wood', lampPower: 0.5, lampColour: [1, 0.85, 0.6], lampEvery: 5,
      channel: 3, surf: 0.5,
      carve: { size: [W, H], ops: [
        ['room', 18, 22, 26, 27],                       // the boathouse
        ['room', 44, 6, 50, 10],                        // the smugglers' hut on the cliff
      ], after: [
        // the sea to the south, the cove's water reaching up to the jetty
        ['room', 0, 33, W - 1, H - 1, '~'], ['room', 30, 24, 40, 32, '~'],
        ['cells', [[22, 28], [27, 25], [47, 11]], 'D'],
        ['cells', [[17, 24], [22, 21], [43, 8]], 'W'],
        ['room', 19, 23, 19, 26, 'C'], ['cells', [[25, 23]], 'T'],
        ['cells', [[46, 7]], 'T'], ['cells', [[49, 9]], 'Y'],
        // the jetty's crates, the beach's rocks and boats drawn up
        ['cells', [[28, 26], [28, 29], [42, 28], [12, 26], [8, 18], [16, 12], [30, 16], [38, 14], [24, 8], [52, 18], [6, 30]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { level, mid } = kit;
    for (const [x, y] of [[28, 24], [22, 30], [47, 12]]) level.lights.push({ pos: [mid(x), 3.2, mid(y)], range: 9, intensity: 0.75, color: [1, 0.85, 0.6], street: true });
  },
  vehicles: [
    { id: 'smugboat', kind: 'boat', at: [34, 26], yaw: Math.PI, paint: 'white', hp: 560, path: [[34, 26], [34, 32], [34, 38], [34, 46]],
      speed: 8, goal: 'escape', wait: 180, name: 'The smugglers\' boat',
      crew: [{ id: 'bh', at: [-0.4, 0.6] }, { id: 'bm', at: [0, -2.2] }] },
  ],
  start: { x: 2, y: 5, floor: 'G', yaw: Math.PI },
  zones: [
    { id: 'boathouse', label: 'Gull Cove - the boathouse', at: [18, 22, 26, 27] },
    { id: 'jetty', label: 'Gull Cove - the jetty', at: [28, 22, 41, 32] },
    { id: 'hut', label: 'Gull Cove - the smugglers\' hut', at: [44, 6, 50, 10] },
    { id: 'gull', label: 'Gull Cove', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'bh', at: [34, 26, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'bm', at: [34, 25, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'jt1', at: [28, 23, 'G'], arms: 'carbine', temper: 'bold' },
    { id: 'jt2', at: [41, 26, 'G'], arms: 'smg' },
    { id: 'bx1', at: [23, 25, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'bc1', at: [20, 30, 'G'], route: [[10, 30], [28, 30]], arms: 'carbine' },
    { id: 'look', at: [52, 14, 'G'], arms: 'dmr', rank: 'specialist', temper: 'steady', yaw: Math.PI / 2 },
    { id: 'hut1', at: [48, 8, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The smugglers\' master' },
  ],
  hostages: [{ id: 'officer', name: 'The customs officer', she: true, at: [24, 26, 'G'] }],
  intel: [
    { id: 'tide', at: [25, 23, 'G'], kind: 'Tables', title: 'A tide table on the boathouse bench', text: ['Every slack tide for the year, and against six of them a cross. Tonight\'s is the last cross.'] },
    { id: 'letter', at: [46, 7, 'G'], kind: 'Letter', title: 'A letter in the smugglers\' hut', text: ['From the buyer: "The last forty, then no more. The north is shut and the south is watching."'] },
  ],
  objectives: [
    { id: 'o1', kind: 'rescue', ref: 'officer', text: 'Bring out the customs officer (the boathouse)' },
    { id: 'o2', kind: 'stop', ref: 'smugboat', text: 'Stop the smugglers\' boat before it is out of the cove' },
  ],
};
