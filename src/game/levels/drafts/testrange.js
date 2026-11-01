// FRONTLINE - Level 39, Q's Test Range (first draft, M6.29; the roadmap's "breaching and hacking mechanics
// and training"). A short course of rooms in a disused warehouse Q Branch uses to try things out: each room
// one of the security systems, in turn, with a note on the wall saying what it is and how to beat it. Three
// reds from the range's own staff play the opposition (they shoot practice rounds - which still sting).
const W = 46, H = 22;
const rooms = [
  ['room', 2, 2, 8, 19],        // 1. the camera
  ['room', 10, 2, 16, 19],      // 2. the laser
  ['room', 18, 2, 24, 19],      // 3. the maglock (the far half behind it)
  ['room', 26, 2, 32, 19],      // 4. the lights
  ['room', 34, 2, 43, 19],      // 5. the turret and the terminal
];
export default {
  id: 'testrange', no: 39, title: 'Q\'s Test Range', place: 'Q Branch\'s test range',
  where: 'Shed 4, Holmwood trading estate - Q Branch\'s test range. Any time you like.',
  brief: [
    ['What this is', 'Q\'s range for the security systems: five rooms in a row, west to east, one system in each, a note on the wall of each saying what it is. Get to the far end and take the <b>test cell</b> from the last room. You carry a <b>hacking kit</b> and the multi-spectrum visor.'],
    ['1. A camera', 'It sweeps; let it see you for a second and it raises the alarm. Its light says whose it is: red, theirs. Go behind it, wait for it to look away - or hold E at it with the kit to disable it, have it ignore you, or take it over.'],
    ['2. A laser', 'A tripwire across the room, invisible to the eye: night vision or UV (V) shows it. Go under it on your belly (C until prone), or over it.'],
    ['3. A maglock', 'A security door: no kick opens it. The kit at its keypad (hold E), or blow it - or take the keycard from the man who carries one.'],
    ['4. The lights', 'Hack the panel and the room goes dark: the guards in it see only what is close. So do you, without night vision.'],
    ['5. A turret, and its terminal', 'The terminal by the door runs this room\'s turret and everything behind you. Hack it (hold E): disable, reprogram, or take control - then the turret fires on the reds. Hack too long and you are traced.'],
  ],
  time: { date: [1, 11, 2026], hour: 14, minute: 0 }, faction: 'red', requires: 'HACKKIT', startGear: 'MULTIVIS',
  extractName: 'the shed\'s door',
  outside: { backdrop: 'city', mat: 'asphalt', margin: 12 },
  floors: {
    G: {
      y: 0, wallH: 4.0, wall: 'concrete2', floor: 'concrete', ceil: 'metal', lampPower: 0.8, lampColour: [0.95, 0.97, 1], lampEvery: 7,
      carve: { size: [W, H], ops: rooms, after: [
        ['cells', [[5, 20], [9, 10], [17, 10], [25, 10], [33, 10]], 'D'],
        ['cells', [[4, 6], [6, 14], [13, 15], [29, 7], [29, 14], [37, 6], [40, 14]], 'C'],
        ['cells', [[42, 3]], 'T'],
      ] },
    },
  },
  start: { x: 5, y: 21, floor: 'G', yaw: 0 },
  extra(kit) {
    const { level, mid } = kit;
    const notes = [[5, 'CAMERA', 'Stay out of its sight - or hack it'], [13, 'LASER', 'V to see it - under it on your belly'], [21, 'MAGLOCK', 'Hold E at its keypad with the kit'], [29, 'LIGHTS', 'Hack the panel: in the dark they see little'], [38.5, 'TURRET', 'The terminal runs it - take control']];
    for (const [x, t, sub] of notes) level.signs.push({ pos: [mid(x), 2.6, 2 * 1.5 + 0.12], yaw: 0, w: 2.4, h: 0.6, text: t, sub, col: '#e8b423' });
  },
  zones: [
    { id: 'r1', label: 'Test range - 1. the camera', at: [2, 2, 8, 19] },
    { id: 'r2', label: 'Test range - 2. the laser', at: [10, 2, 16, 19] },
    { id: 'r3', label: 'Test range - 3. the maglock', at: [18, 2, 24, 19] },
    { id: 'r4', label: 'Test range - 4. the lights', at: [26, 2, 32, 19] },
    { id: 'r5', label: 'Test range - 5. the turret', at: [34, 2, 43, 19] },
    { id: 'all', label: 'Holmwood trading estate', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'keeper', at: [22, 5, 'G'], arms: 'pistol', temper: 'steady', card: 'range' },
    { id: 'dark', at: [29, 4, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'end', at: [40, 9, 'G'], arms: 'carbine', temper: 'steady' },
  ],
  pickups: [{ id: 'cell', name: 'The test cell', what: 'the test cell', at: [42, 3, 'G'], table: false, h: 0.8, colour: [0.35, 0.95, 1] }],
  devices: [
    { id: 'c-1', kind: 'camera', at: [8, 2, 'G'], face: [-1, 1], net: 'range' },
    { id: 'z-2', kind: 'laser', at: [13, 2, 'G'], to: [13, 19], net: 'range' },
    { id: 'm-3', kind: 'lock', at: [17, 10, 'G'], net: 'range' },
    { id: 'm-3b', kind: 'lock', at: [25, 10, 'G'], net: 'range' },
    { id: 'l-4', kind: 'lights', at: [26, 12, 'G'], face: [1, 0], area: [26, 2, 32, 19], name: 'room 4', net: 'range' },
    { id: 't-5', kind: 'turret', at: [42, 18, 'G'], face: [-1, -1], net: 'range' },
    { id: 'a-bell', kind: 'alarm', at: [38, 2, 'G'], face: [0, 1], net: 'range' },
  ],
  terminals: [{ id: 'sec', name: 'the range\'s terminal', at: [35, 12, 'G'], face: [1, 0], time: 5, net: 'range' }],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'cell', text: 'Take the test cell (room 5, at the far end)' },
    { id: 'o2', kind: 'hack', ref: 'sec', text: 'Hack the range\'s terminal (room 5)', optional: true },
  ],
};
