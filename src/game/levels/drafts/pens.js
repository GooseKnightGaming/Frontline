// FRONTLINE - Level 51, the Kessin Pens (first draft, M6.61; built round swimming - the rebreather, deep water, a
// patrol boat). The reds' patrol-boat base in Kessin harbour, where the Dalmar Star was to unload: their boats
// watch the river all the way up to Varnholm. Swim the basin by night - under the patrol boat's searchlight, not in
// it - climb out at the pens, and take their patrol schedules: with them, Ghost's boats go where the reds' do not.
const W = 52, H = 40;
export default {
  id: 'pens', no: 51, title: 'The Kessin Pens', place: 'the patrol-boat pens, Kessin harbour',
  where: 'The patrol-boat pens, Kessin harbour. 01:20, a still night, the water black.',
  brief: [
    ['The way in', 'By water. You go in from the <b>south quay</b> with a <b>rebreather</b>: under the surface as long as you like, and no bubbles. The basin is deep - dive (C, or look down) and swim. A <b>patrol boat</b> goes round the basin with a man on its bow; stay under when it passes. Climb out (Space at an edge) at the <b>pens</b>, north.'],
    ['The place', 'The <b>pens</b> along the north side: the boat shed (two boats on their slips), the <b>duty office</b> (the patrol schedules, the console), the <b>workshop</b>, the barracks room. Quays east and west, a crane, stacks of crates.'],
    ['Security', 'Cameras on the quays and in the boat shed, the duty office maglocked (the duty officer\'s keycard), the alarm. The radio is in the duty office; an engineer in the workshop. A dog on the east quay.'],
    ['Objectives', 'Copy the <b>patrol schedules</b> (the duty office). Take the <b>codebook</b> (the barracks room). Out the way you came - into the water, and south.'],
  ],
  time: { date: [14, 1, 2027], hour: 1, minute: 20 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'MP2', backup: 'V27C', utility1: 'SMOKE', utility2: 'RCAM', gear: 'REBREATHER', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.08, 0.1, 0.13, 20, 160], ambient: [0.22, 0.24, 0.3] },
  extractName: 'the south quay', extract: { x: 25, y: 37, floor: 'G' },
  outside: { backdrop: 'city', mat: 'concrete', margin: 12 },
  floors: {
    G: {
      y: 0, wallH: 6, wall: 'metal', wallTint: [0.5, 0.52, 0.55], floor: 'concrete', ceil: 'metal', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 8,
      channel: 4.5, surf: 0.5,
      carve: { size: [W, H], ops: [
        ['room', 4, 2, 20, 9],                          // the boat shed
        ['room', 22, 2, 30, 9],                         // the duty office
        ['room', 32, 2, 40, 9],                         // the workshop
        ['room', 42, 2, 48, 9],                         // the barracks room
      ], after: [
        ['cells', [[12, 10], [13, 10], [26, 10], [36, 10], [45, 10], [21, 5], [31, 5], [41, 5]], 'D'],
        ['cells', [[24, 1], [28, 1], [34, 1], [38, 1], [44, 1], [47, 1]], 'W'],
        // the boat shed's slips: water inside it
        ['room', 6, 4, 9, 9, '~'], ['room', 14, 4, 17, 9, '~'],
        ['cells', [[24, 4], [28, 4]], 'T'], ['cells', [[29, 8]], 'H'], ['cells', [[34, 4], [38, 4], [36, 8]], 'M'], ['cells', [[39, 7]], 'T'],
        ['cells', [[43, 4], [47, 4], [43, 8]], 'Y'], ['cells', [[46, 8]], 'T'],
        // the basin: deep water from the pens' quay to the south quay, quays east and west
        ['room', 4, 13, 47, 32, '~'],
        ['room', 4, 12, 47, 12, '='], ['room', 4, 33, 47, 33, '='], ['cells', [[25, 33], [26, 33], [12, 12], [13, 12], [25, 12], [26, 12], [36, 12]], '.'],      // gaps in the rails: where you climb out
        ['room', 2, 14, 2, 30, 'C'], ['cells', [[50, 16], [50, 22], [50, 28]], 'C'], ['cells', [[49, 34], [3, 35], [12, 36], [40, 36]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { box, level, mid, CELL: C } = kit;
    // the crane on the east quay; the quay lamps
    box([mid(49) - 0.4, 0, mid(12) - 0.4], [mid(49) + 0.4, 18, mid(12) + 0.4], 'metal', { tint: [0.7, 0.5, 0.15] });
    box([mid(40), 17.5, mid(12) - 0.3], [mid(50), 18.2, mid(12) + 0.3], 'metal', { tint: [0.7, 0.5, 0.15], solid: false });
    for (const [x, y] of [[8, 11], [30, 11], [46, 11], [10, 34], [40, 34]]) level.lights.push({ pos: [mid(x), 5, mid(y)], range: 14, intensity: 1, color: [1, 0.85, 0.6], street: true });
  },
  vehicles: [
    // the patrol boat: round the basin, a man on its bow
    { id: 'patrol', kind: 'boat', at: [10, 16], yaw: -Math.PI / 2, paint: 'olive', hp: 600, loop: true, speed: 5,
      path: [[10, 16], [42, 16], [43, 22], [42, 29], [10, 29], [9, 22], [10, 16]],
      crew: [{ id: 'pb_helm', at: [-0.4, 0.6] }, { id: 'pb_bow', at: [0, -2.2] }] },
  ],
  start: { x: 25, y: 37, floor: 'G', yaw: 0 },
  zones: [
    { id: 'shed', label: 'The Kessin Pens - the boat shed', at: [4, 2, 20, 9] },
    { id: 'office', label: 'The Kessin Pens - the duty office', at: [22, 2, 30, 9] },
    { id: 'work', label: 'The Kessin Pens - the workshop', at: [32, 2, 40, 9] },
    { id: 'barr', label: 'The Kessin Pens - the barracks room', at: [42, 2, 48, 9] },
    { id: 'basin', label: 'Kessin harbour - the basin', at: [4, 13, 47, 32] },
    { id: 'harbour', label: 'Kessin harbour', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'pb_helm', at: [10, 16, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'pb_bow', at: [10, 17, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'duty', at: [26, 6, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio', card: 'pens' },
    { id: 'eng', at: [37, 6, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'shed1', at: [11, 6, 'G'], arms: 'carbine' },
    { id: 'q1', at: [25, 11, 'G'], route: [[5, 11], [46, 11]], arms: 'carbine' },
    { id: 'w1', at: [2, 32, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'e1', at: [49, 24, 'G'], route: [[49, 14], [49, 31]], arms: 'carbine', dog: true },
    { id: 'bar', at: [45, 6, 'G'], arms: 'smg', temper: 'bold' },
  ],
  pickups: [{ id: 'codebook', name: 'The codebook', what: 'the codebook', at: [46, 8, 'G'], table: true, colour: [0.2, 0.3, 0.6] }],
  devices: [
    { id: 'c-quay', kind: 'camera', at: [4, 11, 'G'], face: [1, 1], net: 'pens' },
    { id: 'c-quay2', kind: 'camera', at: [47, 11, 'G'], face: [-1, 1], net: 'pens' },
    { id: 'c-shed', kind: 'camera', at: [20, 2, 'G'], face: [-1, 1], net: 'pens' },
    { id: 'm-off', kind: 'lock', at: [26, 10, 'G'], net: 'pens' },
    { id: 'a-pens', kind: 'alarm', at: [31, 10, 'G'], face: [0, 1], net: 'pens' },
  ],
  terminals: [
    { id: 'sec', name: 'the duty office console', at: [23, 8, 'G'], face: [1, 0], time: 6, net: 'pens' },
    { id: 'sched', name: 'the patrol schedules', at: [27, 6, 'G'], face: [0, 1], time: 8, reveal: 20, verb: 'Copy', doing: 'Copying',
      said: 'The patrol schedules: every boat, every night, from here to Varnholm - and where they never go. Every red here on your radar for 20 seconds.' },
  ],
  intel: [
    { id: 'orders', at: [24, 4, 'G'], kind: 'Orders', title: 'Standing orders - the duty office', text: ['Patrols round the basin every four minutes, the river every two hours. Searchlight on at all times on the water.', 'Divers are a fairy tale. Nobody swims in this harbour in January. - The duty officer'] },
  ],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'sched', text: 'Copy the patrol schedules (the duty office)' },
    { id: 'o2', kind: 'take', ref: 'codebook', text: 'Take the codebook (the barracks room)' },
  ],
};
