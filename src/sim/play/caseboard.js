// FRONTLINE - the case (M6.31): what the newer missions turn up, put together on the board in Ghost HQ. Each
// clue comes from one thing done on one mission (a terminal hacked, a thing taken) and brought home (the mission
// not failed). Enough of them, and Ghost knows where the reds' council meets - and the last mission opens:
// Level 42, Kaldberg.

export const CASE = [
  { id: 'research', level: 'facility', ref: 'data', title: 'Halden\'s research', text: 'A guidance system - and the order for it came from Varn Dynamics.' },
  { id: 'lantern', level: 'listening', ref: 'mainframe', title: 'LANTERN\'s logs', text: 'Its orders do not come from any ministry: they come from a council that meets in secret.' },
  { id: 'corwen', level: 'yacht', ref: 'files', title: 'Corwen\'s files', text: 'The guidance units are shipped on - to a lodge in the mountains, at Kaldberg.' },
  { id: 'varn', level: 'tower', ref: 'mail', title: 'Varn\'s mail', text: 'The money for them comes through the embassy on Linden Row.' },
  { id: 'cipher', level: 'embassy', ref: 'keys', title: 'The embassy\'s cipher traffic', text: 'The council meets at Kaldberg, on the twentieth.' },
  { id: 'film', level: 'archive', ref: 'film', title: 'The courier\'s microfilm', text: 'Every drop on his route leads up the same valley, to Kaldberg.' },
  { id: 'plans', level: 'barracks', ref: 'plans', title: 'The training plans', text: 'A strike force, to be ready for the twenty-first - the day after the council.' },
  { id: 'payload', level: 'spaceport', ref: 'arming', title: 'The payload\'s orders', text: 'Signed by the same council: the satellite was theirs.' },
];
export const CASE_NEEDS = 5;           // clues to find where the council meets
export const FINAL = 'kaldberg';

// the clue a mission gives, if what it asks was done: ids of terminals done and pickups taken
export function cluesFrom(levelId, done) {
  return CASE.filter((c) => c.level === levelId && done.includes(c.ref)).map((c) => c.id);
}
export const caseOpen = (have) => (have || []).filter((id) => CASE.some((c) => c.id === id)).length >= CASE_NEEDS;
// (M6.40) and closed: the last mission done (kept on the board as its own mark, 'closed')
export const CLOSED = 'closed';
export const caseClosed = (have) => (have || []).includes(CLOSED);

// (M6.45) the second case on the board: the blight - what Varn grew, followed to where it was going. Each step a
// mission done (a success or near enough), kept on the board as its own mark ('blight:<level>').
export const BLIGHT = [
  { level: 'glasshouse', title: 'The Glasshouse', text: 'Varn\'s research: a blight for wheat, bred to order.' },
  { level: 'grain', title: 'The Grain Terminal', text: 'The van stopped; the manifest names the Dalmar Star, for Kessin.' },
  { level: 'dalmar', title: 'The Dalmar Star', text: 'The blight off her, and her radio log: the buyer named.' },
  { level: 'ministry', title: 'The Ministry of Supply', text: 'The order that bought it, signed - and the supply records that say why.' },
  { level: 'embankment', title: 'The Halvard Embankment', text: 'The man who signed for it, stopped on his way to the border.' },
];
export const blightMark = (level) => 'blight:' + level;
export const blightStep = (level) => BLIGHT.some((b) => b.level === level) ? blightMark(level) : null;
export const blightDone = (have) => BLIGHT.every((b) => (have || []).includes(blightMark(b.level)));

// (M6.54) the trails on the board: the blight, and the Codex after it. Each a list of missions done, marked
// '<trail>:<level>'; stamped when every step is. TRAILS[0] is the blight above.
export const CODEX = [
  { level: 'museum', title: 'The Varnholm Museum', text: 'The Halvard Codex taken back; the loan register says who it was "returned" to.' },
  { level: 'hospital', title: 'St Brannoc\'s', text: 'Tobias Marle, brought out - and with him the name of the man who bought it.' },
  { level: 'villa', title: 'The Villa Merrow', text: 'The bill of sale from the Count\'s safe, and his catalogue of everything else.' },
];
// (M6.66) the river: the pens' schedules, the codes off the roofs, and the lock opened with them
export const RIVER = [
  { level: 'pens', title: 'The Kessin Pens', text: 'The patrol schedules: every boat on the river, and where they never go.' },
  { level: 'rooftops', title: 'The Rooftops', text: 'The codes case, taken from the courier on the tallest roof.' },
  { level: 'lock', title: 'Varnholm Lock', text: 'The stand-down sent in their own codes, and the lock opened to the sea.' },
];
export const TRAILS = [
  { id: 'blight', title: 'THE BLIGHT', steps: BLIGHT, stamp: 'HARVEST SAVED', colour: '#5a9a3a' },
  { id: 'codex', title: 'THE CODEX', steps: CODEX, stamp: 'RETURNED', colour: '#3a7ab0' },
  { id: 'river', title: 'THE RIVER', steps: RIVER, stamp: 'RIVER OPEN', colour: '#2a8a8a' },
];
export const trailMark = (trail, level) => trail.id + ':' + level;
// the marks a mission's being done adds (any trail it is a step of)
export const trailSteps = (level) => TRAILS.filter((t) => t.steps.some((b) => b.level === level)).map((t) => trailMark(t, level));
export const trailDone = (trail, have) => trail.steps.every((b) => (have || []).includes(trailMark(trail, b.level)));
export const trailBegun = (trail, have) => trail.steps.some((b) => (have || []).includes(trailMark(trail, b.level)));
