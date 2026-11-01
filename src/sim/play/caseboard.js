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
export const caseOpen = (have) => (have || []).length >= CASE_NEEDS;
