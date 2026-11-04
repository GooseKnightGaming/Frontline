// FRONTLINE - Level 24, the Theatre (first draft). From Rhys's location boards: "Theatre -
// seating, stage / backstage, props and decor". The Grand, on Varnholm's Opera Street: the foyer with its
// box office and bar; the auditorium, two storeys high - the stalls below, the circle above, a box on each
// side; the stage, raised, through the proscenium; behind it the wings and backstage. Closed for a
// rehearsal - and for the reds' arms broker, who is selling from the royal box.
//
// Built as three storeys: G (the foyer and the stalls), 1 (the circle, the boxes, the upstairs bar), S (the
// stage and backstage, a metre up, its fly tower up to the auditorium's roof). A square is 1.5 m.
const CELL = 1.5, W = 34, H = 62;
const grid = () => Array.from({ length: H }, () => new Array(W).fill(' '));
const G = grid(), F1 = grid(), S = grid();
const put = (g, x, y, ch) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch; };
const fill = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch); };
const box = (g, x0, y0, x1, y1, ch) => { for (let x = x0; x <= x1; x++) { put(g, x, y0, ch); put(g, x, y1, ch); } for (let y = y0; y <= y1; y++) { put(g, x0, y, ch); put(g, x1, y, ch); } };

// ── G: the foyer (front) and the stalls ──
box(G, 4, 6, 29, 36, '#'); fill(G, 5, 7, 28, 35, '.');
for (const x of [11, 12, 21, 22]) put(G, x, 6, 'D');                       // the front doors
for (const x of [8, 14, 19, 25]) put(G, x, 6, 'W');
for (let x = 5; x <= 28; x++) put(G, x, 17, '#');                           // the foyer's back wall
for (const x of [9, 10, 23, 24]) put(G, x, 17, 'D');                        // into the stalls
fill(G, 13, 9, 15, 9, 'K'); fill(G, 20, 12, 25, 12, 'K');                    // the box office; the bar
put(G, 17, 8, 'P'); put(G, 17, 14, 'P');
// the stalls: rows of seats, with aisles down both sides and the middle
for (let y = 21; y <= 33; y += 2) for (let x = 7; x <= 26; x++) if (x < 15 || x > 18) put(G, x, y, 's');
// the proscenium: solid below the stage's front ('J': the stage's face, built in extra); the stage steps
// go up at either side through it
for (let x = 4; x <= 29; x++) put(G, x, 36, 'J');
put(G, 4, 36, '#'); put(G, 29, 36, '#');
// ── S: the stage (y 37-46) and backstage (48-56), a metre up; the landing outside the stage door ──
box(S, 4, 36, 29, 57, '#'); fill(S, 5, 37, 28, 56, '.');
for (let x = 8; x <= 25; x++) put(S, x, 36, 'J');                           // the stage's open front
for (const x of [6, 7, 26, 27]) put(S, x, 36, ':');                         // the steps' openings
put(S, 5, 36, '#'); put(S, 28, 36, '#');
for (let x = 5; x <= 28; x++) put(S, x, 47, '#');                           // the stage's back wall
for (const x of [6, 7, 26, 27]) put(S, x, 47, 'D');                         // the wings, through to backstage
for (let x = 5; x <= 28; x++) put(S, x, 50, '#');                           // the backstage corridor (48-49), rooms behind it
for (const x of [11, 17, 23]) put(S, x, 50, 'D');
for (const x of [14, 20]) for (let y = 51; y <= 56; y++) put(S, x, y, '#');
put(S, 16, 57, 'L'); put(S, 17, 57, 'L');                                  // the stage door (locked)
fill(S, 15, 58, 18, 58, '.');                                              // its landing
// the stage: the set (flats, a table and chairs), a piano; backstage: rails of costumes, the prop store
for (const [x, y] of [[10, 41], [22, 41]]) put(S, x, y, 'T');
put(S, 16, 44, 'Z'); put(S, 25, 39, 'M');
for (const x of [6, 7, 8, 9]) put(S, x, 55, 'H'); put(S, 12, 53, 'T');     // the dressing room: rails, the table
for (const [x, y] of [[16, 52], [18, 52], [16, 55], [18, 55]]) put(S, x, y, 'C');   // the prop store
put(S, 27, 52, 'H');                                   // the stage manager's office
// ── 1: the circle (18-23), the boxes along the sides (24-33), the upstairs bar and the office over the foyer ──
box(F1, 4, 6, 29, 36, '#'); fill(F1, 5, 7, 28, 35, 'O');
fill(F1, 5, 7, 28, 16, '.');
for (const x of [8, 14, 19, 25]) put(F1, x, 6, 'W');
for (let x = 5; x <= 28; x++) put(F1, x, 17, '#');
for (const x of [9, 10, 23, 24]) put(F1, x, 17, 'D');
for (let y = 7; y <= 16; y++) put(F1, 17, y, '#'); put(F1, 17, 12, 'D');   // the bar (west) and the office (east)
fill(F1, 8, 9, 13, 9, 'K'); put(F1, 22, 10, 'T'); put(F1, 26, 14, 'H');
fill(F1, 5, 18, 28, 23, '.');
for (let y = 19; y <= 23; y += 2) for (let x = 7; x <= 26; x++) if (x < 15 || x > 18) put(F1, x, y, 's');
fill(F1, 5, 24, 6, 33, '.'); fill(F1, 27, 24, 28, 33, '.');                  // the boxes
for (let x = 4; x <= 29; x++) put(F1, x, 36, '#');                          // the proscenium's top

const stairs = [
  { x: 5, y: 15, dir: 'N', len: 6, w: 2, from: 'G', to: '1' },             // up to the circle, from the foyer
  { x: 27, y: 15, dir: 'N', len: 6, w: 2, from: 'G', to: '1' },
  { x: 6, y: 34, dir: 'S', len: 2, w: 2, from: 'G', to: 'S' },             // up onto the stage
  { x: 26, y: 34, dir: 'S', len: 2, w: 2, from: 'G', to: 'S' },
  { x: 15, y: 60, dir: 'N', len: 2, w: 2, from: 'G', to: 'S' },            // the stage door's steps, outside
];

export default {
  id: 'theatre', no: 24, title: 'The Theatre', place: 'the Grand, Opera Street', cell: CELL, windows: false,
  where: 'The Grand Theatre, Opera Street, Varnholm. 20:15 - the house closed for a "rehearsal".',
  brief: [
    ['The place', 'The Grand: the foyer with its box office and bar; the auditorium, two storeys high - the stalls below, the circle above, a box on either side; the stage through the proscenium, a metre up, steps at each side; the wings and backstage behind it - the dressing room, the prop store, the stage manager\'s office - and the stage door onto the back alley (locked).'],
    ['The reds', 'The house is closed tonight for a rehearsal that is not one. <b>Daskova</b>, the reds\' arms broker, is selling from the <b>right-hand box</b> (on the circle) while her men watch the doors, the stalls and the stage.'],
    ['Objectives', 'Stop <b>Daskova</b>. Take her <b>manifest</b> - what is sold, to whom - from the stage manager\'s office backstage. Optionally, bring out <b>Mr Okafor</b>, the stage manager - they have him in the prop store.'],
  ],
  // (M6.83) how it ends (the debrief; the case board's story so far)
  epilogue: {
    success: "The Grand's rehearsal is over. Daskova's manifest says what she was selling and to whom, and Mr Okafor finally gets to show someone his list of dates.",
    partial: "Daskova's buyers are warned, or Okafor stays in the prop store a while longer. The house reopens on Saturday as if nothing happened.",
  },
  time: { date: [11, 10, 2026], hour: 20, minute: 15 }, faction: 'red', night: true,
  extractName: 'Opera Street, out of the front doors', navCap: 120000,
  outside: { backdrop: 'city', mat: 'asphalt', margin: 16 },
  legend: {
    // a theatre seat: red plush, a row of them makes a row (cover to the waist)
    s(k, x, y, f) { const [cx, cy, cz] = k.at(x, y, f), h = k.CELL / 2; k.box([cx - h, cy, cz - 0.3], [cx + h, cy + 0.45, cz + 0.25], 'cloth', { tint: [0.6, 0.08, 0.1] }); k.box([cx - h, cy + 0.45, cz + 0.2], [cx + h, cy + 0.95, cz + 0.32], 'cloth', { tint: [0.55, 0.07, 0.09] }); },
  },
  floors: {
    G: { y: 0, wallH: 4.3, wall: 'plaster', wallTint: [0.85, 0.72, 0.6], floor: 'carpet', floorTint: [0.55, 0.12, 0.14], ceil: 'plaster', ceilTint: [0.9, 0.85, 0.7], lampPower: 0.7, lampColour: [1, 0.85, 0.6], noRoof: [[5, 18, 28, 35]], rows: G.map((r) => r.join('')) },
    S: { y: 1.0, wallH: 7.8, wall: 'brick', wallTint: [0.5, 0.45, 0.42], floor: 'wood', floorTint: [0.35, 0.25, 0.18], ceil: 'metal', lampPower: 0.6, lampColour: [1, 0.9, 0.7], rows: S.map((r) => r.join('')) },
    1: { y: 4.5, wallH: 4.3, wall: 'plaster', wallTint: [0.85, 0.72, 0.6], floor: 'carpet', floorTint: [0.55, 0.12, 0.14], ceil: 'plaster', ceilTint: [0.85, 0.75, 0.55], lampPower: 0.6, lampColour: [1, 0.85, 0.6], rows: F1.map((r) => r.join('')) },
  },
  stairs,
  start: { x: 16, y: 2, floor: 'G', yaw: Math.PI },
  extract: { x: 16, y: 3, floor: 'G' },
  extra(kit) {
    const { box: bx, level, CELL: C } = kit;
    // under the stage and backstage: solid to the stage's floor (the stage's face, to the stalls)
    bx([4 * C, 0, 36 * C], [30 * C, 0.8, 58 * C], 'wood', { tint: [0.25, 0.17, 0.12] });
    bx([5 * C, 0.8, 36 * C], [29 * C, 1.0, 37 * C], 'wood', { tint: [0.35, 0.25, 0.18] });      // the stage's front edge
    bx([15 * C, 0, 58 * C], [19 * C, 0.8, 59 * C], 'concrete2');
    // the curtain, drawn back either side of the proscenium, and its pelmet; the footlights
    for (const [a, b] of [[8, 10], [24, 26]]) bx([a * C, 1.0, 36 * C + 0.2], [b * C, 8.6, 36 * C + 0.7], 'cloth', { tint: [0.6, 0.06, 0.08], solid: false });
    bx([8 * C, 6.4, 36 * C + 0.1], [26 * C, 8.6, 36 * C + 0.75], 'cloth', { tint: [0.58, 0.06, 0.08] });
    for (let x = 9; x <= 25; x += 2) bx([x * C, 1.0, 37 * C + 0.1], [x * C + 0.4, 1.12, 37 * C + 0.3], 'neon', { solid: false, tint: [1, 0.85, 0.5] });
    level.lights.push({ pos: [17 * C, 5, 41 * C], range: 14, intensity: 1.4, color: [1, 0.9, 0.7] });
    // the box fronts and the circle's front: a velvet-topped parapet
    for (const [x0, x1] of [[5, 7], [27, 29]]) bx([x0 * C, 4.5, 24 * C], [x1 * C, 5.5, 24 * C + 0.15], 'plaster', { tint: [0.85, 0.7, 0.4] });
    bx([7 * C - 0.15, 4.5, 24 * C], [7 * C, 5.5, 34 * C], 'plaster', { tint: [0.85, 0.7, 0.4] });
    bx([27 * C, 4.5, 24 * C], [27 * C + 0.15, 5.5, 34 * C], 'plaster', { tint: [0.85, 0.7, 0.4] });
    bx([7 * C, 4.5, 24 * C - 0.15], [27 * C, 5.5, 24 * C], 'plaster', { tint: [0.85, 0.7, 0.4] });
    // the chandelier
    bx([16 * C, 7.6, 27 * C], [18 * C, 8.6, 29 * C], 'lamp', { solid: false, tint: [1, 0.9, 0.6] });
    level.lights.push({ pos: [17 * C, 7.4, 28 * C], range: 18, intensity: 1.1, color: [1, 0.85, 0.6] });
    // the marquee over the front doors, and the name
    bx([9 * C, 4.0, 5 * C], [25 * C, 4.6, 6 * C - 0.11], 'paint', { tint: [0.15, 0.12, 0.1] });
    level.signs.push({ pos: [17 * C, 5.6, 6 * C - 0.13], yaw: Math.PI, w: 7, h: 1.2, text: 'THE GRAND', sub: 'tonight: closed for rehearsal', col: '#6a1a12' });
    level.lights.push({ pos: [17 * C, 4.0, 4 * C], range: 12, intensity: 1.3, color: [1, 0.8, 0.5] });
  },
  zones: [
    { id: 'boxR', label: 'The Grand - the right-hand box', at: [27, 24, 28, 33], floor: '1' },
    { id: 'boxL', label: 'The Grand - the left-hand box', at: [5, 24, 6, 33], floor: '1' },
    { id: 'circle', label: 'The Grand - the circle', at: [5, 18, 28, 35], floor: '1' },
    { id: 'bar1', label: 'The Grand - the circle bar', at: [5, 7, 28, 16], floor: '1' },
    { id: 'stage', label: 'The Grand - the stage', at: [5, 36, 28, 46], floor: 'S' },
    { id: 'back', label: 'The Grand - backstage', at: [5, 47, 28, 58], floor: 'S' },
    { id: 'stalls', label: 'The Grand - the stalls', at: [5, 18, 28, 35] },
    { id: 'foyer', label: 'The Grand - the foyer', at: [5, 7, 28, 16] },
    { id: 'all', label: 'Opera Street', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    { id: 'daskova', at: [28, 29, '1'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'Daskova', tint: [1.3, 1.2, 1.25] },
    { id: 'b1', at: [27, 26, '1'], arms: 'smg', temper: 'steady' },
    { id: 'b2', at: [6, 28, '1'], arms: 'dmr', rank: 'specialist', temper: 'steady' },
    { id: 'c1', at: [12, 20, '1'], route: [[6, 22], [27, 22]], arms: 'carbine' },
    { id: 'f1', at: [16, 11, 'G'], arms: 'pistol', temper: 'cowardly' },
    { id: 'f2', at: [22, 14, 'G'], arms: 'smg' },
    { id: 'f3', at: [24, 11, '1'], arms: 'carbine' },
    { id: 's1', at: [16, 27, 'G'], route: [[16, 19], [16, 34]], arms: 'carbine' },
    { id: 's2', at: [6, 30, 'G'], arms: 'shotgun', temper: 'steady' },
    { id: 'st1', at: [16, 40, 'S'], arms: 'lmg', temper: 'steady' },
    { id: 'st2', at: [10, 44, 'S'], route: [[8, 45], [25, 45]], arms: 'smg' },
    { id: 'bk1', at: [8, 48, 'S'], route: [[6, 49], [27, 49]], arms: 'carbine' },
    { id: 'bk2', at: [18, 54, 'S'], arms: 'pistol' },
  ],
  hostages: [{ id: 'okafor', name: 'Mr Okafor', at: [17, 53, 'S'] }],
  pickups: [{ id: 'manifest', name: 'Daskova\'s manifest', what: 'the manifest', at: [24, 54, 'S'], colour: [0.9, 0.85, 0.6] }],
  // (M6.67) papers to read: lore, not needed to finish
  intel: [
    { id: 'bill', at: [22, 10, '1'], h: 0.78, kind: 'Bar bill', title: 'A bar bill, unpaid', text: ['Twelve guests, the circle bar, "the rehearsal party". Champagne. Charged to an account in the name of D.', 'The barman has written on the back: "Again. Who do I send this to?"'] },
    { id: 'note', at: [12, 53, 'S'], h: 0.78, kind: 'Note', title: 'A note in the stage manager\'s hand', text: ['They come in through the stage door after the house is closed, and they are gone before the cleaners. Daskova does the talking.', 'I have kept a list of the dates. It is behind the fuse board. - J. Okafor'] },
  ],
  objectives: [
    { id: 'o1', kind: 'kill', ref: 'daskova', text: 'Stop Daskova (the right-hand box)' },
    { id: 'o2', kind: 'take', ref: 'manifest', text: 'Take the manifest (backstage, the stage manager\'s office)' },
    { id: 'o3', kind: 'rescue', ref: 'okafor', text: 'Bring Mr Okafor out (the prop store)', optional: true },
  ],
};
