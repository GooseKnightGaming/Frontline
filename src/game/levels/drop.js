// FRONTLINE - Level 17, the Drop (M6.19.4, first draft). Rhys: "a sky-dive / paratrooper mission - or
// at least a mission that starts with a jump from a plane, a helicopter or the like". You start in the
// hold of a transport over the sea, its ramp down: walk off it, and SPACE opens your parachute (steer
// with the mouse, W and S to glide on or hang back, A and D to slip sideways). Skarra: a radar station
// on a rock in the northern sea, which must be blind before the fleet comes past at dawn.
const W = 92, H = 72;
const sea = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const dx = (x - 50) / 38, dy = (y - 36) / 28;
  if (dx * dx + dy * dy > 1) sea.push([x, y]);
}
const fence = [];
for (let x = 30; x <= 66; x++) { fence.push([x, 17]); if (x < 46 || x > 50) fence.push([x, 51]); }
for (let y = 18; y <= 50; y++) { fence.push([30, y]); fence.push([66, y]); }
export default {
  id: 'drop', no: 17, title: 'The Drop', place: 'Skarra',
  where: 'Over the northern sea, 05:50 - the transport\'s ramp down, the rock of Skarra ahead, its radar station on the top.',
  brief: [
    ['The jump', 'You start in the transport\'s hold, the ramp open ahead of you. Walk off it. Falling, <b>SPACE opens your parachute</b>; the mouse steers, W glides on, S hangs back, A and D slip sideways. Land on the rock - not in the sea, though you can swim if you must.'],
    ['The place', 'The radar station inside its fence: the control building, the barracks, the generator shed, the stores, the radar mast. The helicopter pad at the island\'s eastern end, where you will be picked up.'],
    ['The reds', 'Twelve, on the station and round the island.'],
    ['Objectives', 'Hack the <b>radar control terminal</b> (the control building) - the station goes blind. Take the <b>coastal defence plans</b> from the station chief\'s office. Then to the helicopter pad.'],
  ],
  time: { date: [9, 9, 2026], hour: 5, minute: 50 }, faction: 'red',
  startLoadout: { primary: 'K7', backup: 'PX9', utility1: 'C5', utility2: 'SMOKE', gear: 'PARACHUTE' },
  extractName: 'the helicopter pad', vehicle: false,
  outside: { mat: 'lawn', tint: [0.7, 0.8, 0.6], margin: 40, fence: false, backdrop: 'hills' },
  decals: { k: { mat: 'asphalt' }, p: { mat: 'concrete2', tint: [0.75, 0.72, 0.66] } },
  floors: {
    G: {
      y: 0, wallH: 3.4, wall: 'cladding', floor: 'concrete', ceil: 'metal', channel: 3.0, lampPower: 0.8,
      carve: { size: [W, H], walls: false, ops: [
        ['text', 36, 22, ['#############', '#.....#.....#', '#..T..D..T..#', '#.....#.....#', '###D######D##', '#...........#', '#..KKK..H.H.#', '#...........#', '######D######']],
        ['text', 52, 22, ['###########', '#Y.Y.Y.Y.Y#', '#.........#', '#Y.Y.Y.Y.Y#', '#.........D', '#..T...T..#', '###########']],
        ['text', 36, 38, ['#######', '#M.M.M#', '#.....#', '#M...MD', '#######']],
        ['text', 45, 38, ['######', '#C.C.#', '#....#', 'D..C.#', '######']],
        ['cells', fence, 'f'],
        ['room', 47, 51, 49, 66, 'p'], ['room', 50, 60, 80, 61, 'p'], ['room', 74, 52, 79, 57, 'k'],
        ['cells', [[20, 30], [24, 44], [70, 30], [72, 44], [14, 40], [82, 36], [34, 60], [60, 14], [40, 12], [26, 22]], 'r'],
        ['cells', [[33, 20], [34, 20], [63, 47], [62, 47], [40, 48], [56, 34]], 'C'],
        ['cells', sea, '~'],
      ] },
    },
  },
  start: { x: 8, y: 36, floor: 'G', alt: 160, yaw: -Math.PI / 2 },
  extract: { x: 76, y: 54, floor: 'G' },      // (the pad's middle, near enough)
  extra(kit) {
    const { box, mid } = kit;
    // the transport's hold, high over the sea, its ramp open to the east
    const x = mid(8), z = mid(36), y = 160;
    box([x - 14, y - 0.3, z - 2.2], [x + 2.5, y, z + 2.2], 'metal', { tint: [0.35, 0.37, 0.35] });
    box([x - 14, y, z - 2.4], [x + 2.5, y + 3.0, z - 2.2], 'metal', { tint: [0.4, 0.42, 0.4] });
    box([x - 14, y, z + 2.2], [x + 2.5, y + 3.0, z + 2.4], 'metal', { tint: [0.4, 0.42, 0.4] });
    box([x - 14, y + 3.0, z - 2.4], [x + 2.5, y + 3.3, z + 2.4], 'metal', { tint: [0.4, 0.42, 0.4] });
    box([x - 14.3, y, z - 2.4], [x - 14, y + 3.0, z + 2.4], 'metal', { tint: [0.4, 0.42, 0.4] });
    box([x + 2.5, y - 0.6, z - 2.0], [x + 6.5, y - 0.4, z + 2.0], 'metal', { tint: [0.3, 0.32, 0.3], solid: false });      // the ramp, down
    kit.level.lights.push({ pos: [x - 6, y + 2.6, z], range: 12, intensity: 0.8, color: [1, 0.35, 0.3] });                    // the hold's red light
    // (M6.19.6, Rhys: "Helipad? Oh... that didn't look like a helipad") the pad: a raised concrete deck, a
    // yellow ring and the H on it, lamps at its corners, a windsock
    {
      const cx = mid(76.5), cz = mid(54.5), r = 3.6;
      box([cx - 4.8, 0, cz - 4.8], [cx + 4.8, 0.03, cz + 4.8], 'concrete2', { tint: [0.55, 0.56, 0.58], solid: false });
      for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; box([x - 0.3, 0.03, z - 0.3], [x + 0.3, 0.045, z + 0.3], 'paint', { tint: [1, 0.82, 0.1], solid: false }); }
      box([cx - 1.3, 0.03, cz - 1.6], [cx - 0.85, 0.045, cz + 1.6], 'paint', { tint: [1, 1, 1], solid: false });
      box([cx + 0.85, 0.03, cz - 1.6], [cx + 1.3, 0.045, cz + 1.6], 'paint', { tint: [1, 1, 1], solid: false });
      box([cx - 0.85, 0.03, cz - 0.22], [cx + 0.85, 0.045, cz + 0.22], 'paint', { tint: [1, 1, 1], solid: false });
      for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        box([cx + dx * 4.5 - 0.12, 0, cz + dz * 4.5 - 0.12], [cx + dx * 4.5 + 0.12, 0.45, cz + dz * 4.5 + 0.12], 'paint', { tint: [0.3, 1, 0.4], solid: false });
        kit.level.lights.push({ pos: [cx + dx * 4.5, 0.8, cz + dz * 4.5], range: 6, intensity: 0.6, color: [0.4, 1, 0.5] });
      }
      box([cx + 5.6, 0, cz - 5.4], [cx + 5.7, 4.0, cz - 5.3], 'metal', { tint: [0.6, 0.6, 0.62] });
      box([cx + 5.7, 3.4, cz - 5.42], [cx + 6.9, 3.8, cz - 5.28], 'cloth', { tint: [1, 0.45, 0.1], solid: false });
    }
    // the radar mast and its dish
    box([mid(57) - 0.6, 0, mid(41) - 0.6], [mid(57) + 0.6, 18, mid(41) + 0.6], 'metal', { tint: [0.6, 0.62, 0.64] });
    box([mid(57) - 4, 17, mid(41) - 0.4], [mid(57) + 4, 21, mid(41) + 0.4], 'metal', { tint: [0.85, 0.86, 0.88], solid: false });
  },
  zones: [
    { id: 'control', label: 'Skarra - the control building', at: [36, 22, 48, 30] },
    { id: 'office', label: 'Skarra - the station chief\'s office', at: [42, 22, 48, 25] },
    { id: 'barracks', label: 'Skarra - the barracks', at: [52, 22, 62, 28] },
    { id: 'gen', label: 'Skarra - the generator shed', at: [36, 38, 42, 42] },
    { id: 'pad', label: 'Skarra - the helicopter pad', at: [74, 52, 79, 57] },
  ],
  guards: [
    { id: 'k1', at: [48, 49, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'k2', at: [40, 34, 'G'], route: [[32, 34], [64, 34], [64, 48], [32, 48]], arms: 'smg' },
    { id: 'k3', at: [40, 20, 'G'], route: [[32, 19], [64, 19]], arms: 'carbine' },
    { id: 'k4', at: [39, 24, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady' },
    { id: 'k5', at: [42, 28, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'k6', at: [56, 25, 'G'], arms: 'carbine' },
    { id: 'k7', at: [59, 27, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'k8', at: [38, 40, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'k9', at: [70, 54, 'G'], route: [[66, 58], [80, 58]], arms: 'carbine' },
    { id: 'k10', at: [24, 36, 'G'], route: [[18, 30], [26, 46]], arms: 'dmr', rank: 'specialist' },
    { id: 'k11', at: [52, 45, 'G'], arms: 'lmg', temper: 'steady' },
    { id: 'k12', at: [60, 12, 'G'], arms: 'carbine' },
  ],
  pickups: [{ id: 'plans', name: 'The coastal defence plans', what: 'the plans', at: [45, 24, 'G'], table: false, h: 0.8, colour: [0.5, 0.7, 0.9] }],
  terminals: [{ id: 'radar', name: 'the radar control terminal', at: [43, 28, 'G'], face: [0, -1], time: 7, reveal: 30,
    said: 'Radar control: Skarra is blind - and its own screens put every red on your radar for 30 seconds.' }],
  objectives: [
    { id: 'o1', kind: 'hack', ref: 'radar', text: 'Hack the radar control terminal (the control building)' },
    { id: 'o2', kind: 'take', ref: 'plans', text: 'Take the coastal defence plans (the station chief\'s office)' },
  ],
};
