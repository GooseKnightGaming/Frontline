// FRONTLINE - Level 37, the Archive (first draft, M6.29). From Rhys's environment-pack concept sheet:
// "Library/Archive". The Halloran Library after dark: the Yellows are in, they have its security, and their
// safe-cracker is at the rare books vault - after the Halloran Codex, which a red courier used as a dead drop
// for a microfilm that is now in the stacks below. Get the codex before they do; copy the film.
//
// The reading room - two storeys of shelves round an open floor, a gallery round it up a stair - the rooms
// off it (the librarian's office, the vault, the conservation lab, the map room, the catalogue room), and the
// stacks under it all.
const W = 50, H = 40;
const grid = (ch) => Array.from({ length: H }, () => new Array(W).fill(ch));
const B = grid(' '), G = grid(' '), F1 = grid(' ');
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const ring = (g, x0, y0, x1, y1, ch) => { for (let x = x0; x <= x1; x++) { put(g, x, y0, ch); put(g, x, y1, ch); } for (let y = y0; y <= y1; y++) { put(g, x0, y, ch); put(g, x1, y, ch); } };

// ── the ground floor: the building x 5-44, y 2-37
ring(G, 5, 2, 44, 37, '#'); fill(G, 6, 3, 43, 36, '.');
for (let x = 6; x <= 43; x++) { put(G, x, 9, '#'); put(G, x, 29, '#'); }
for (let y = 3; y <= 8; y++) { put(G, 19, y, '#'); put(G, 30, y, '#'); }
for (let y = 30; y <= 36; y++) { put(G, 18, y, '#'); put(G, 31, y, '#'); }
for (const [x, y] of [[12, 9], [24, 9], [37, 9], [12, 29], [24, 29], [25, 29], [38, 29], [18, 33], [31, 33], [24, 37], [25, 37]]) put(G, x, y, 'D');
for (const [x, y] of [[5, 14], [5, 20], [5, 26], [44, 14], [44, 20], [44, 26], [9, 37], [14, 37], [35, 37], [40, 37]]) put(G, x, y, 'W');
// the reading room: its shelves in bays along the walls, the long tables down the middle, the pillars
for (const y of [12, 16, 20, 24]) { fill(G, 9, y, 12, y, 'H'); fill(G, 37, y, 40, y, 'H'); }
for (const y of [13, 18, 23]) { fill(G, 18, y, 21, y, 'T'); fill(G, 28, y, 31, y, 'T'); }
for (const [x, y] of [[16, 12], [33, 12], [16, 26], [33, 26]]) put(G, x, y, 'P');
fill(G, 23, 26, 26, 26, 'K');                                                    // the issue desk
// the vault (x 20-29, y 3-8): rare books on shelves; the office (west) and the conservation lab (east)
for (const x of [21, 24, 27]) fill(G, x, 4, x, 7, 'H');
put(G, 8, 5, 'T'); put(G, 15, 4, 'H'); put(G, 16, 4, 'H');
fill(G, 33, 5, 36, 5, 'K'); put(G, 40, 7, 'T');
// the map room (west of the entrance) and the catalogue room (east): the stair down to the stacks is there
for (const [x, y] of [[8, 31], [8, 34], [12, 31], [12, 34]]) put(G, x, y, 'T');
fill(G, 33, 31, 34, 31, 'H'); fill(G, 41, 31, 42, 31, 'H');

// ── the gallery (1): round the reading room, its middle open to the floor below
ring(F1, 5, 9, 44, 29, '#'); fill(F1, 6, 10, 43, 28, '.');
fill(F1, 9, 13, 40, 25, 'O');
for (let x = 9; x <= 40; x++) { put(F1, x, 12, '='); put(F1, x, 26, '='); }
for (let y = 13; y <= 25; y++) { put(F1, 8, y, '='); put(F1, 41, y, '='); }
for (const x of [14, 20, 26, 32, 38]) { put(F1, x, 10, 'H'); put(F1, x + 1, 10, 'H'); }
for (const y of [14, 18, 22]) { put(F1, 43, y, 'H'); }
for (const [x, y] of [[5, 15], [5, 22], [44, 15], [44, 22]]) put(F1, x, y, 'W');

// ── the stacks (B): rolling shelves, row after row; the microfilm room; the stair up to the catalogue room
ring(B, 5, 9, 44, 37, '#'); fill(B, 6, 10, 43, 36, '.');
for (let x = 6; x <= 43; x++) put(B, x, 29, '#');
put(B, 38, 29, 'D'); put(B, 12, 29, 'D');
for (let y = 11; y <= 27; y += 2) { fill(B, 8, y, 18, y, 'H'); fill(B, 22, y, 32, y, 'H'); }
fill(B, 36, 11, 43, 11, 'H');
for (let y = 30; y <= 36; y++) put(B, 18, y, '#'); put(B, 18, 33, 'D');
fill(B, 8, 31, 10, 31, 'M'); put(B, 14, 34, 'T');                               // the microfilm room (west)

const stairs = [
  { x: 6, y: 27, dir: 'N', len: 5, w: 2, from: 'G', to: '1' },                  // up to the gallery, the reading room's south-west corner
  { x: 36, y: 35, dir: 'E', len: 5, w: 2, from: 'B', to: 'G' },                 // down to the stacks, from the catalogue room
];

export default {
  id: 'archive', no: 37, title: 'The Archive', place: 'the Halloran Library',
  where: 'The Halloran Library, Chancery Square. 01:20, rain on the skylights.',
  brief: [
    ['The place', 'The <b>reading room</b>: two storeys of shelves round an open floor, the <b>gallery</b> up the stair in its south-west corner. Off it: the <b>librarian\'s office</b> (north-west - the security console), the <b>rare books vault</b> (north), the <b>conservation lab</b> (north-east); the map room and the catalogue room either side of the entrance hall. Down the stair in the catalogue room: the <b>stacks</b>, and the microfilm room.'],
    ['The Yellows', 'Thirteen. They are in, they have the library\'s security, and their safe-cracker is at the vault door. A red courier hid a microfilm inside the <b>Halloran Codex</b> - the Yellows want the film, we want both.'],
    ['Security', 'All the Yellows\' now: cameras in the reading room and the entrance hall (and a <b>pinhole</b> in the vault - EMF), a <b>laser</b> across the vault\'s approach, the vault <b>maglocked</b>, the reading room\'s <b>lights</b>, the alarm, and a turret of theirs in the stacks - run from the librarian\'s office. You carry a <b>hacking kit</b>. Their lookout has the <b>radio</b>; their technician is an <b>engineer</b>; there is a <b>medic</b>, and a <b>marksman</b> on the gallery.'],
    ['Objectives', 'Take the <b>Halloran Codex</b> from the vault. <b>Copy the microfilm</b> in the stacks\' microfilm room. Optionally, free <b>Mr Abernethy</b>, the night librarian, tied up in the conservation lab.'],
  ],
  // (M6.82) how it ends (the debrief; the case board's story so far)
  epilogue: {
    success: "The microfilm is copied and the Codex is safe before the Yellows' safe-cracker gets the vault open. The red courier's dead drop is burned for good.",
    partial: "The Yellows got something out of the Halloran Library tonight. Ghost will have to find out what.",
  },
  time: { date: [19, 11, 2026], hour: 1, minute: 20 }, night: true, faction: 'yellow', requires: 'HACKKIT', startGear: 'MULTIVIS', weather: 'rain',
  extractName: 'the van on Chancery Square',
  outside: { backdrop: 'city', mat: 'asphalt', margin: 16 },
  floors: {
    B: { y: -3.6, wallH: 3.0, wall: 'concrete2', floor: 'concrete', ceil: 'concrete2', lampPower: 0.5, lampColour: [0.95, 0.85, 0.65], lampEvery: 8, rows: B.map((r) => r.join('')) },
    G: { y: 0, wallH: 3.8, wall: 'plaster', wallTint: [0.85, 0.8, 0.7], floor: 'wood', floorTint: [0.6, 0.45, 0.3], ceil: 'plaster', lampPower: 0.55, lampColour: [1, 0.85, 0.6], lampEvery: 8, rows: G.map((r) => r.join('')) },
    1: { y: 4.0, wallH: 3.4, wall: 'plaster', wallTint: [0.85, 0.8, 0.7], floor: 'wood', floorTint: [0.6, 0.45, 0.3], ceil: 'plaster', lampPower: 0.5, lampColour: [1, 0.85, 0.6], lampEvery: 9, rows: F1.map((r) => r.join('')) },
  },
  stairs,
  start: { x: 24.5, y: 39, floor: 'G', yaw: 0 },
  extra(kit) {
    const { level, mid } = kit;
    level.signs.push({ pos: [mid(24.5), 3.2, 38 * 1.5 + 0.14], yaw: 0, w: 4.2, h: 0.7, text: 'THE HALLORAN LIBRARY', sub: 'Founded 1871', col: '#2a2418' });
  },
  zones: [
    { id: 'vault', label: 'The Halloran - the rare books vault', at: [20, 3, 29, 8] },
    { id: 'office', label: 'The Halloran - the librarian\'s office', at: [6, 3, 18, 8] },
    { id: 'lab', label: 'The Halloran - the conservation lab', at: [31, 3, 43, 8] },
    { id: 'gallery', label: 'The Halloran - the gallery', at: [6, 10, 43, 28], floor: '1' },
    { id: 'reading', label: 'The Halloran - the reading room', at: [6, 10, 43, 28] },
    { id: 'maps', label: 'The Halloran - the map room', at: [6, 30, 17, 36] },
    { id: 'catalogue', label: 'The Halloran - the catalogue room', at: [32, 30, 43, 36] },
    { id: 'film', label: 'The Halloran - the microfilm room', at: [6, 30, 17, 36], floor: 'B' },
    { id: 'stacks', label: 'The Halloran - the stacks', at: [6, 10, 43, 36], floor: 'B' },
    { id: 'hall', label: 'The Halloran - the entrance hall', at: [19, 30, 30, 36] },
    { id: 'all', label: 'Chancery Square', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'cracker', at: [24, 10, 'G'], arms: 'pistol', temper: 'cowardly', name: 'The safe-cracker', card: 'halloran' },
    { id: 'tech', at: [10, 6, 'G'], arms: 'pistol', temper: 'cowardly', role: 'engineer' },
    { id: 'look', at: [24, 33, 'G'], arms: 'smg', rank: 'officer', temper: 'steady', role: 'radio' },
    { id: 'r1', at: [14, 20, 'G'], route: [[14, 11], [14, 28], [35, 28], [35, 11]], arms: 'carbine' },
    { id: 'r2', at: [25, 15, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'r3', at: [41, 18, 'G'], arms: 'smg' },
    { id: 'gal', at: [20, 11, '1'], arms: 'dmr', rank: 'specialist', temper: 'steady', perches: [[20, 11, '1'], [42, 20, '1'], [30, 27, '1']] },
    { id: 'g2', at: [10, 27, '1'], route: [[7, 27], [42, 27], [42, 11], [7, 11]], arms: 'carbine' },
    { id: 'lab1', at: [36, 7, 'G'], arms: 'carbine' },
    { id: 'med', at: [10, 33, 'G'], arms: 'pistol', temper: 'cowardly', role: 'medic' },
    { id: 's1', at: [20, 20, 'B'], route: [[20, 12], [20, 28], [34, 28], [34, 12]], arms: 'smg' },
    { id: 's2', at: [40, 25, 'B'], arms: 'carbine', temper: 'steady' },
    { id: 's3', at: [12, 33, 'B'], arms: 'carbine' },
  ],
  hostages: [{ id: 'abernethy', name: 'Mr Abernethy', at: [41, 4, 'G'] }],
  pickups: [{ id: 'codex', name: 'The Halloran Codex', what: 'the codex', at: [25, 6, 'G'], h: 0.9, colour: [0.55, 0.35, 0.2] }],
  devices: [
    { id: 'c-read-w', kind: 'camera', at: [6, 10, 'G'], face: [1, 1], net: 'halloran', owner: 'yellow' },
    { id: 'c-read-e', kind: 'camera', at: [43, 28, 'G'], face: [-1, -1], net: 'halloran', owner: 'yellow' },
    { id: 'c-hall', kind: 'camera', at: [19, 36, 'G'], face: [1, -1], net: 'halloran', owner: 'yellow' },
    { id: 'c-pin-vault', kind: 'camera', at: [29, 3, 'G'], face: [-1, 1], net: 'halloran', owner: 'yellow', hidden: true },
    { id: 't-stacks', kind: 'turret', at: [42, 13, 'B'], face: [-1, 1], net: 'halloran', owner: 'yellow' },
    { id: 'm-vault', kind: 'lock', at: [24, 9, 'G'], net: 'halloran', owner: 'yellow' },
    { id: 'z-vault', kind: 'laser', at: [21, 11, 'G'], to: [27, 11], net: 'halloran', owner: 'yellow' },
    { id: 'l-read', kind: 'lights', at: [7, 28, 'G'], face: [0, -1], area: [6, 10, 43, 28], name: 'the reading room', net: 'halloran', owner: 'yellow' },
    { id: 'a-bell', kind: 'alarm', at: [24, 30, 'G'], face: [0, 1], net: 'halloran', owner: 'yellow' },
  ],
  terminals: [
    { id: 'sec', name: 'the library\'s security console', at: [15, 7, 'G'], face: [0, -1], time: 6, net: 'halloran' },
    { id: 'film', name: 'the microfilm reader', at: [9, 33, 'B'], face: [0, -1], time: 8, reveal: 20, verb: 'Copy', doing: 'Copying',
      said: 'The microfilm, copied: the courier\'s whole route, every drop and every name. The cameras put every Yellow on your radar for 20 seconds.' },
  ],
  // (M6.59) papers to read: lore, not needed to finish
  intel: [
    { id: "archivist", at: [8, 5, "G"], kind: "Note", title: "A note on the archivist's desk", text: ["The courier came again on Tuesday. Same reels, same boxes, same \"do not catalogue\".", "I have started keeping a list of what they take out. It is not in this drawer."] },
    { id: "timetable", at: [14, 34, "B"], kind: "Timetable", title: "The courier's timetable", text: ["Monday - the archive. Wednesday - the tower. Friday - the embassy, Linden Row.", "Every third week, a drive north: Kaldberg. No stops."] },
  ],
  objectives: [
    { id: 'o1', kind: 'take', ref: 'codex', text: 'Take the Halloran Codex (the rare books vault)' },
    { id: 'o2', kind: 'hack', ref: 'film', text: 'Copy the microfilm (the stacks\' microfilm room)' },
    { id: 'o3', kind: 'rescue', ref: 'abernethy', text: 'Free Mr Abernethy (the conservation lab)', optional: true },
  ],
};
