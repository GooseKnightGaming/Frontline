// FRONTLINE - Level 59, the Docks Yard (first draft, M6.76; the handler's second order). The blackout order said what
// the dark was for: two lorries from the docks with the Varnholm Exchange's reserve - the city's gold, "moved for
// safe keeping" - and the handler riding with the first. The lights stayed on, so the reds go anyway, at dawn, by
// the east gate. Stop both lorries before they are out of it.
const W = 56, H = 40;
export default {
  id: 'docks', no: 59, title: 'The Docks Yard', place: 'the docks yard, Varnholm',
  where: 'The docks yard, Varnholm. 05:50, before dawn, the lorries loaded.',
  brief: [
    ['The job', 'The blackout order named the cargo: the <b>Varnholm Exchange\'s reserve</b>, the city\'s gold, in two lorries in the docks yard. The lights stayed on, so they are going at dawn anyway, out of the <b>east gate</b>. The <b>handler</b> rides in the first. <b>Stop both lorries</b> before they are out of the gate: a driver down will do it, or a wreck. Take the <b>loading list</b> from the yard office. It says where the gold was going.'],
    ['The place', 'Two warehouses along the north side, the <b>yard office</b> at the north-east. The lorries are in the middle of the yard, facing the gate. The quay is along the south side, with deep water. You come in along the quay from the west.'],
    ['Security', 'Patrols in the yard, cameras on the warehouses, the alarm. The radio is in the yard office, the engineer in the east warehouse. The first lorry goes in about three minutes, the second a minute after it. Do not wait to be seen.'],
    ['Objectives', '<b>Stop the first lorry</b>. <b>Stop the second lorry</b>. Take the <b>loading list</b> (the yard office). If you can, stop the handler. Out along the quay, west.'],
  ],
  epilogue: {
    success: 'The Exchange\'s gold goes back to the Exchange under guard, and the loading list goes to Ghost. It names a ship, a captain and a port. The handler\'s third order is the ship.',
    partial: 'One lorry, not both, or the lorries but not the list. Half of the city\'s gold is somewhere the reds can reach it.',
  },
  time: { date: [3, 2, 2027], hour: 5, minute: 50 }, night: true, faction: 'red', requires: 'HACKKIT',
  startLoadout: { primary: 'K7', backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { primary: ['SILENCER'], backup: ['SILENCER'] } },
  atmos: { fog: [0.16, 0.17, 0.21, 22, 160], ambient: [0.26, 0.27, 0.32] },
  extractName: 'the quay, west', extract: { x: 1, y: 29, floor: 'G' },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 6, wall: 'metal', wallTint: [0.55, 0.58, 0.6], floor: 'concrete', ceil: 'metal', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 7,
      channel: 4, surf: 0.6,
      carve: { size: [W, H], ops: [
        ['room', 4, 4, 20, 14],                         // the west warehouse
        ['room', 25, 4, 40, 14],                        // the east warehouse
        ['room', 45, 4, 52, 10],                        // the yard office
      ], after: [
        // (walls a square out from each room; lanes two squares wide)
        ['cells', [[12, 15], [32, 15], [48, 11], [21, 9], [24, 9]], 'D'],
        // inside: crates in stacks, the office's desks
        ['room', 6, 6, 9, 7, 'C'], ['room', 14, 10, 18, 11, 'C'], ['room', 27, 6, 30, 7, 'C'], ['room', 35, 10, 38, 11, 'C'],
        ['cells', [[47, 6], [51, 6], [50, 9]], 'T'], ['cells', [[46, 9]], 'M'],
        // the quay: deep water along the south side
        ['room', 0, 33, W - 1, 39, '~'], ['room', 0, 32, W - 1, 32, '='], ['cells', [[8, 32], [30, 32]], '.'],
        // the yard's stacks (clear of the lorries' lanes, y 21 and y 24)
        ['cells', [[6, 18], [16, 18], [28, 18], [40, 18], [6, 28], [18, 28], [34, 28], [46, 28], [50, 16]], 'C'],
      ] },
    },
  },
  extra(kit) {
    const { level, mid } = kit;
    for (const [x, y] of [[10, 17], [28, 17], [44, 17], [14, 30], [38, 30], [54, 22]]) level.lights.push({ pos: [mid(x), 6, mid(y)], range: 16, intensity: 1, color: [1, 0.85, 0.6], street: true });
    level.signs.push({ pos: [mid(48.5), 3.4, mid(11) + 0.8], yaw: 0, w: 3.4, h: 0.6, text: 'YARD OFFICE', sub: 'All drivers report', col: '#3a3a2a' });
  },
  vehicles: [
    { id: 'lorry1', kind: 'car', model: 'lightUtility', paint: 'white', at: [24, 21], yaw: -Math.PI / 2, path: [[24, 21], [36, 21], [48, 21], [W + 2, 21], [W + 8, 21]],
      speed: 9, goal: 'escape', wait: 180, hp: 560, name: 'The first lorry',
      crew: [{ id: 'd1', at: [-0.42, 0.15] }, { id: 'handler', at: [0.42, 0.15] }] },
    { id: 'lorry2', kind: 'car', model: 'lightUtility', paint: 'grey', at: [16, 24], yaw: -Math.PI / 2, path: [[16, 24], [30, 24], [48, 24], [W + 2, 24], [W + 8, 24]],
      speed: 9, goal: 'escape', wait: 240, hp: 560, name: 'The second lorry',
      crew: [{ id: 'd2', at: [-0.42, 0.15] }, { id: 'm2', at: [0.42, 0.15] }] },
  ],
  start: { x: 1, y: 29, floor: 'G', yaw: -Math.PI / 2 },
  zones: [
    { id: 'west', label: 'The docks yard - the west warehouse', at: [4, 4, 20, 14] },
    { id: 'east', label: 'The docks yard - the east warehouse', at: [25, 4, 40, 14] },
    { id: 'office', label: 'The docks yard - the yard office', at: [45, 4, 52, 10] },
    { id: 'quay', label: 'The docks yard - the quay', at: [0, 30, W - 1, H - 1] },
    { id: 'yard', label: 'The docks yard', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'd1', at: [24, 21, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'handler', at: [25, 21, 'G'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The handler', tint: [0.55, 0.4, 0.3] },
    { id: 'd2', at: [16, 24, 'G'], arms: 'pistol', temper: 'steady' },
    { id: 'm2', at: [17, 24, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'y1', at: [30, 19, 'G'], route: [[8, 19], [50, 19]], arms: 'carbine' },
    { id: 'y2', at: [30, 26, 'G'], route: [[8, 26], [50, 26]], arms: 'carbine', dog: true },
    { id: 'gate', at: [53, 22, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'gate2', at: [53, 25, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'rad', at: [49, 7, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady', role: 'radio', name: 'The yard master' },
    { id: 'eng', at: [33, 8, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'w1', at: [12, 8, 'G'], arms: 'carbine', temper: 'bold' },
    { id: 'q1', at: [20, 30, 'G'], route: [[7, 30], [50, 30]], arms: 'smg' },
  ],
  civilians: [
    { id: 'docker', at: [10, 12, 'G'], yaw: 0, title: 'A docker', tint: [0.75, 0.7, 0.6], says: ['We loaded them at midnight. Heavy as sin, both. The foreman said it was "printing ink".', 'The first one goes when the man in the brown coat says so.'] },
  ],
  pickups: [{ id: 'list', name: 'The loading list', what: 'the loading list', at: [47, 6, 'G'], table: true, colour: [0.85, 0.82, 0.7] }],
  devices: [
    { id: 'c-west', kind: 'camera', at: [3, 16, 'G'], face: [1, 1], net: 'docks' },
    { id: 'c-east', kind: 'camera', at: [41, 16, 'G'], face: [-1, 1], net: 'docks' },
    { id: 'a-docks', kind: 'alarm', at: [44, 12, 'G'], face: [0, 1], net: 'docks' },
  ],
  terminals: [{ id: 'sec', name: 'the yard office console', at: [51, 9, 'G'], face: [-1, 0], time: 6, net: 'docks' }],
  intel: [
    { id: 'tally', at: [51, 6, 'G'], kind: 'Tally', title: 'The yard master\'s tally', text: ['Two lorries, forty boxes each. "Printing ink." Signed for by B.', 'Underneath, in another pen: "Nobody prints with ink that heavy."'] },
    { id: 'note', at: [50, 9, 'G'], kind: 'Note', title: 'A note pinned by the door', text: ['The Varna Star sails on the evening tide of the 4th. Her captain is paid half now and half in Kessin.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'stop', ref: 'lorry1', text: 'Stop the first lorry before it is out of the east gate' },
    { id: 'o2', kind: 'stop', ref: 'lorry2', text: 'Stop the second lorry before it is out of the east gate' },
    { id: 'o3', kind: 'take', ref: 'list', text: 'Take the loading list (the yard office)' },
    { id: 'o4', kind: 'kill', ref: 'handler', text: 'Stop the handler', optional: true },
  ],
};
