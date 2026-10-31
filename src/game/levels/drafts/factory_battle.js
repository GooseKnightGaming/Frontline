// FRONTLINE - Level 19, the Factory: Battle (first draft). Rhys's factory sheet was always a
// battle map (maps/Frontline_Battle_Map_Factory.xlsx: "Valid Spawn Point for Ghost / for Yellow" in the
// corner rooms) - Level 2 played it as a mission until there was a battle mode. Here it is as drawn:
// Ghost against the Yellows, two floors, the ring of corridors, the reinforced core; each side comes on
// at its two corners (diagonally opposite), ten minutes on the clock, a hundred men a side.
import MAP from '../maps/factory.json' with { type: 'json' };
import { factoryLadders } from '../factory.js';

// (Rhys: "sometimes it can be very hard to find... anyone at all") in a battle the locked doors stand
// unlocked (the halls round the core are on the way through), and more men a side are on the field at once
const conv = (key) => MAP.floors[key].map((r) => r.replace(/W/g, '#').replace(/G/g, 'W').replace(/[EA]/g, '.').replace(/L/g, 'D'));
const LADDERS = factoryLadders().map((l) => ({ x: l.x, y: l.y, from: 'G', to: '1', back: l.back, off: l.off || undefined }));

export default {
  id: 'factory_battle', no: 19, title: 'The Factory: Battle', place: 'the Derelict Factory', tidy: false, windows: false,      // (Rhys's map, as he drew it)
  where: 'The Derelict Factory, on the edge of Varnholm. 12:40, sunny - and a battle.',
  brief: [
    ['The battle', 'A battle, not a mission: <b>Ghost against the Yellows</b>, ten minutes on the clock and <b>a hundred men a side</b> in reserve. Each side comes on at its own two corners - Ghost the north-west and the south-east, the Yellows the other two. Every man who falls is replaced from the reserve, you as well; the side with more left when the clock runs out wins, and a side with no one left has lost.'],
    ['The ground', 'Rhys\'s factory as he drew it: the corner rooms, the ring of corridors round the outside, the halls and the reinforced core in the middle; two floors, joined by ladders.'],
    ['Your kit', 'A K7, a PX9, a C5 charge and grenades.'],
    ['The aim', 'Take the fight to their corners and keep more of Ghost on its feet than they do of theirs. Hold E where you start to withdraw.'],
  ],
  time: { date: [14, 7, 2026], hour: 12, minute: 40 }, faction: 'yellow', cell: 1.5,
  startLoadout: { primary: 'K7', backup: 'PX9', utility1: 'C5', utility2: 'FRAG', gear: 'LENSES' },
  extractName: 'Ghost\'s corner', vehicle: false, navCap: 200000,
  outside: { mat: 'concrete', margin: 20, fenceMat: 'brick', fenceH: 2.4, backdrop: 'city' },
  floors: {
    G: { y: 0, wallH: 3.3, wall: 'brick', floor: 'concrete', ceil: 'concrete2', doorMat: 'metal', doorBuild: 'sturdy', lampPower: 0.85, rows: conv('G') },
    1: { y: 3.6, wallH: 3.3, wall: 'brick', floor: 'concrete2', ceil: 'metal', doorMat: 'metal', doorBuild: 'sturdy', lampPower: 0.85, slab: 0.3, rows: conv('1') },
  },
  ladders: LADDERS,
  start: { x: 3, y: 3, floor: 'G', yaw: -Math.PI / 2 },
  battle: {
    you: 'ghost', timer: 600,
    teams: {
      ghost: {
        name: 'Ghost', short: 'Ghost', faction: 'ally', reserve: 100, field: 14, arms: ['carbine', 'smg', 'carbine', 'shotgun'],
        spawns: [[3, 2, 'G'], [56, 57, 'G'], [3, 2, '1'], [56, 57, '1']],
        lanes: [
          [[9, 7], [30, 7], [49, 8], [54, 3]],
          [[9, 8], [12, 30], [12, 51], [9, 52], [4, 56]],
          [[50, 52], [30, 52], [10, 51], [4, 56]],
          [[50, 51], [47, 30], [47, 8], [54, 3]],
          // through the middle: the halls round the core
          [[9, 8], [16, 8], [16, 10], [23, 19], [23, 22], [30, 22], [36, 22], [36, 19], [43, 10], [43, 8], [50, 7], [54, 3]],
          [[50, 51], [43, 51], [43, 49], [36, 40], [36, 37], [30, 37], [23, 37], [23, 40], [16, 49], [16, 51], [9, 51], [4, 56]],
        ],
      },
      yellow: {
        name: 'The Yellows', short: 'Yellows', faction: 'yellow', reserve: 100, field: 14, arms: ['carbine', 'smg', 'shotgun', 'carbine'],
        spawns: [[56, 2, 'G'], [3, 57, 'G'], [56, 2, '1'], [3, 57, '1']],
        lanes: [
          [[50, 7], [30, 8], [10, 7], [4, 3]],
          [[50, 8], [47, 30], [47, 51], [50, 52], [55, 56]],
          [[9, 52], [30, 51], [49, 52], [55, 56]],
          [[9, 51], [12, 30], [12, 8], [4, 3]],
          [[50, 7], [43, 8], [43, 10], [36, 19], [36, 22], [30, 22], [23, 22], [23, 19], [16, 10], [16, 8], [9, 7], [4, 3]],
          [[9, 52], [16, 51], [16, 49], [23, 40], [23, 37], [30, 37], [36, 37], [36, 40], [43, 49], [43, 51], [50, 52], [55, 56]],
        ],
      },
    },
  },
  zones: [
    { id: 'core1', label: 'The Factory - the core (upstairs)', at: [24, 24, 35, 35], floor: '1' },
    { id: 'up', label: 'The Factory - upstairs', at: [0, 0, 59, 59], floor: '1' },
    { id: 'nw', label: 'The Factory - the north-west room (Ghost)', at: [0, 0, 7, 6] },
    { id: 'se', label: 'The Factory - the south-east room (Ghost)', at: [52, 53, 59, 59] },
    { id: 'ne', label: 'The Factory - the north-east room (the Yellows)', at: [52, 0, 59, 6] },
    { id: 'sw', label: 'The Factory - the south-west room (the Yellows)', at: [0, 53, 7, 59] },
    { id: 'core', label: 'The Factory - the core', at: [24, 24, 35, 35] },
    { id: 'all', label: 'The Derelict Factory', at: [0, 0, 59, 59] },
  ],
  guards: [],
  objectives: [],
};
