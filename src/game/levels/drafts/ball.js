// FRONTLINE - Level 72, the Winter Ball (first draft, M6.92; disguise, a crowd and marking). Varnholm's Opera House
// holds its winter ball, and the reds' paymaster for the whole coast is a guest - with two of the agents he pays, who
// meet him there because nobody looks twice at anyone at a ball. Go in as a red officer among the guests, mark the
// three of them, and take the guest list from the manager's office: the names they came under.
const W = 48, H = 36;
export default {
  id: 'ball', no: 72, title: 'The Winter Ball', place: 'the Opera House, Varnholm',
  where: 'The Opera House, Varnholm. 21:30, the winter ball, two hundred guests and a band.',
  brief: [
    ['The job', 'The reds\' <b>paymaster</b> for the whole coast is at the Opera House\'s winter ball, and so are <b>two of the agents</b> he pays. They meet there because nobody looks twice at anyone at a ball. You go in <b>dressed as a red officer</b>, one more uniform among the guests. <b>Mark all three</b>: aim at each for a second. Then take the <b>guest list</b> from the manager\'s office. It has the names they came under.'],
    ['The place', 'The <b>ballroom</b> (the band, the dancing, the bar along its south wall), the <b>foyer</b> east of it with the stair up to the <b>private rooms</b>. The cloakroom and the <b>manager\'s office</b> are behind the ballroom, to the south. You come in at the front doors, east.'],
    ['Security', 'Reds on the doors and among the guests, and the house\'s own stewards. A uniform among two hundred guests is nothing to look at. A uniform staring at the same man across the room for too long is.'],
    ['Objectives', '<b>Mark the paymaster and his two agents</b>. Take the <b>guest list</b> (the manager\'s office). Out by the front doors.'],
  ],
  epilogue: {
    success: 'Three faces and three false names, and Ghost lets them all go home from the ball. The paymaster\'s money goes on moving for another month, and every coin of it is watched. Then Ghost closes the coast in a single night.',
    partial: 'One of them noticed, or the list was not where it should have been. The paymaster will not go to another ball.',
  },
  time: { date: [3, 3, 2027], hour: 21, minute: 30 }, night: true, faction: 'red', startDisguise: 'red',
  startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
  atmos: { fog: [0.12, 0.12, 0.15, 25, 160], ambient: [0.3, 0.28, 0.3] },
  extractName: 'the front doors', extract: { x: 46, y: 16, floor: 'G' },
  outside: { backdrop: 'city', mat: 'asphalt', margin: 14 },
  floors: {
    G: {
      y: 0, wallH: 5, wall: 'plaster', wallTint: [0.9, 0.82, 0.7], floor: 'marble', ceil: 'plaster', lampPower: 0.9, lampColour: [1, 0.85, 0.6], lampEvery: 4,
      carve: { size: [W, H], ops: [
        ['room', 8, 8, 32, 24],                         // the ballroom
        ['room', 34, 8, 42, 24],                        // the foyer
        ['room', 8, 26, 16, 30],                        // the cloakroom
        ['room', 18, 26, 26, 30],                       // the manager's office
      ], after: [
        // (walls a square out; the rooms share theirs)
        ['cells', [[33, 12], [33, 20], [43, 16], [12, 25], [22, 25]], 'D'],
        ['room', 11, 23, 29, 23, 'K'],                  // the bar along the south wall
        ['room', 10, 9, 14, 10, 'M'],                   // the band's stand
        ['cells', [[36, 10], [40, 10]], 'H'],
        ['cells', [[10, 28], [14, 28]], 'H'], ['cells', [[20, 28], [24, 27]], 'T'], ['cells', [[25, 29]], 'H'],
      ] },
    },
    1: {
      y: 5.4, wallH: 3.2, wall: 'plaster', wallTint: [0.85, 0.75, 0.65], floor: 'wood', ceil: 'plaster', lampPower: 0.6, lampColour: [1, 0.85, 0.6], lampEvery: 4,
      carve: { size: [W, H], ops: [['room', 34, 8, 42, 24]], after: [
        ['room', 34, 16, 42, 16, '#'], ['cell', 39, 16, 'D'],             // two private rooms off the landing
        ['cells', [[37, 10], [40, 13]], 'T'], ['cells', [[41, 9]], 'H'],
      ] },
    },
  },
  stairs: [{ x: 35, y: 23, dir: 'N', len: 5, w: 2, from: 'G', to: '1' }],
  extra(kit) {
    const { level, mid } = kit;
    for (const [x, y] of [[44, 12], [44, 20]]) level.lights.push({ pos: [mid(x), 5, mid(y)], range: 12, intensity: 1, color: [1, 0.85, 0.6], street: true });
    level.signs.push({ pos: [mid(43) + 0.8, 6, mid(16)], yaw: -Math.PI / 2, w: 4.6, h: 0.8, text: 'OPERA HOUSE', sub: 'The Winter Ball', col: '#3a1a1a' });
  },
  start: { x: 46, y: 16, floor: 'G', yaw: Math.PI / 2 },
  zones: [
    { id: 'ball', label: 'The Opera House - the ballroom', at: [8, 8, 32, 24] },
    { id: 'foyer', label: 'The Opera House - the foyer', at: [34, 8, 42, 24] },
    { id: 'boxes', label: 'The Opera House - the private rooms', at: [34, 8, 42, 24], floor: '1' },
    { id: 'office', label: 'The Opera House - the manager\'s office', at: [18, 26, 26, 30] },
    { id: 'cloak', label: 'The Opera House - the cloakroom', at: [8, 26, 16, 30] },
    { id: 'street', label: 'The Opera House', at: [0, 0, W - 1, H - 1] },
  ],
  guards: [
    // the three: the paymaster upstairs, an agent dancing, an agent at the bar
    { id: 'pay', at: [38, 11, '1'], arms: 'pistol', rank: 'officer', temper: 'cowardly', name: 'The paymaster', tint: [0.2, 0.2, 0.25] },
    { id: 'ag1', at: [20, 15, 'G'], route: [[16, 13], [26, 13], [26, 19], [16, 19]], arms: 'pistol', temper: 'cowardly', name: 'An agent (dancing)', tint: [0.55, 0.15, 0.2] },
    { id: 'ag2', at: [24, 22, 'G'], arms: 'pistol', temper: 'steady', name: 'An agent (at the bar)', tint: [0.25, 0.3, 0.45] },
    { id: 'd1', at: [44, 13, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'd2', at: [44, 19, 'G'], arms: 'carbine', temper: 'steady' },
    { id: 'f1', at: [38, 20, 'G'], arms: 'smg', temper: 'steady' },
    { id: 'b1', at: [30, 10, 'G'], arms: 'pistol', rank: 'officer', temper: 'steady' },
    { id: 'u1', at: [38, 20, '1'], arms: 'smg', temper: 'steady' },
    { id: 'o1', at: [21, 29, 'G'], arms: 'pistol', temper: 'cowardly' },
  ],
  civilians: [
    { id: 'g1', at: [14, 16, 'G'], yaw: 0, title: 'A guest', tint: [1.2, 1.0, 1.1], says: ['Have you seen the paymaster? Upstairs, in a private room, as if he were royalty.'] },
    { id: 'g2', at: [18, 17, 'G'], yaw: Math.PI, title: 'A guest', tint: [0.9, 1.1, 1.2], says: ['The band is dreadful. The champagne is not.'] },
    { id: 'g3', at: [28, 16, 'G'], yaw: Math.PI / 2, title: 'A guest', tint: [1.25, 1.15, 0.8], says: ['The man in red at the bar has been drinking water all night. Who comes to a ball to drink water?'] },
    { id: 'g4', at: [22, 11, 'G'], yaw: 0, title: 'A guest', tint: [1.1, 0.9, 0.95], says: ['My husband says not to talk to the officers. I said I would talk to whom I like.'] },
    { id: 'g5', at: [12, 20, 'G'], yaw: -Math.PI / 2, title: 'A guest', tint: [1.0, 1.05, 0.95], says: ['The woman in dark red has danced with nobody twice.'] },
    { id: 'st', at: [38, 14, 'G'], yaw: Math.PI / 2, title: 'A steward', tint: [1.3, 1.3, 1.3], says: ['The manager keeps the guest list in his office, behind the cloakroom. He has gone home.'] },
    { id: 'bar', at: [20, 22, 'G'], yaw: 0, title: 'The barman', tint: [1.3, 1.3, 1.25], says: ['Water, sir? He has asked for nothing else.'] },
  ],
  pickups: [{ id: 'list', name: 'The guest list', what: 'the guest list', at: [20, 28, 'G'], table: true, colour: [0.95, 0.92, 0.85] }],
  intel: [
    { id: 'card', at: [24, 27, 'G'], kind: 'Card', title: 'A dance card', text: ['Every dance taken by the same name, "Mr Hollis". Nobody at the ball is called Hollis.'] },
    { id: 'note', at: [40, 13, '1'], kind: 'Note', title: 'A note in a private room', text: ['Thursday as usual. Bring the receipts, not the money. Never the money.'] },
  ],
  objectives: [
    { id: 'o1', kind: 'identify', refs: ['pay', 'ag1', 'ag2'], text: 'Mark the paymaster and his two agents (aim at each for a second)' },
    { id: 'o2', kind: 'take', ref: 'list', text: 'Take the guest list (the manager\'s office)' },
  ],
};
