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
// (M6.73) the forgers: the mill that printed the reds' papers, and the bridge where Pell's flaw read them
export const FORGERS = [
  { level: 'mill', title: 'Hollin Mill', text: 'The press jammed, the plates taken - and Mr Pell\'s flaw in every one of them.' },
  { level: 'holm', title: 'The Holm Bridge', text: 'The register copied: three hundred forged passes, read by the flaw.' },
  { level: 'townhall', title: 'Varnholm Town Hall', text: 'The quartermaster\'s ledger, and the real passes out of the vault - back to their owners.' },
];
// (M6.76) the handler: followed from the market, and his orders undone one by one
export const HANDLER = [
  { level: 'market', title: 'The Old Market', text: 'The Controller followed to the café\'s back room - and the handler\'s orders taken.' },
  { level: 'power', title: 'Holm Power Station', text: 'The grid locked out: no blackout. And the blackout order, naming the cargo.' },
  { level: 'docks', title: 'The Docks Yard', text: 'Both lorries stopped, the city\'s gold back - and the loading list, naming a ship.' },
  { level: 'varna', title: 'The Varna Star', text: 'The handler taken alive aboard her, and his forty names copied from her bridge.' },
];
// (M6.81) the five: marked at the lodge, named on the air and in the paper, the last two stopped at the airfield
export const FIVE = [
  { level: 'lodge', title: 'Ravensholt Lodge', text: 'Five chiefs marked through the lodge\'s windows, and their names on the seating plan.' },
  { level: 'mast', title: 'The Hesk Hill Transmitter', text: 'The names on the air: ninety seconds, held.' },
  { level: 'gazette', title: 'The Varnholm Courier', text: 'The names in the paper: the presses saved, the edition out.' },
  { level: 'airfield', title: 'Kessin Airfield', text: 'The last two stopped at the airfield: the jet grounded, the Kessin man taken alive.' },
];
// (M6.85) the north: over the pass, the courier followed through Nordvik, the council in its house
export const NORTH = [
  { level: 'pass', title: 'The Vashka Pass', text: 'Over the frontier, and its register copied: sixty couriers in two years.' },
  { level: 'nordvik', title: 'Nordvik', text: 'The courier followed through the town to the council\'s gate on the hill.' },
  { level: 'council', title: 'The Council House', text: 'The four marked, the chairman "N" taken alive, the minutes taken.' },
];
// (M6.88) the camps: the first camp's people over the Arn, the four out of Ostrava
export const CAMPS = [
  { level: 'arnbridge', title: 'The Arn Bridge', text: 'The north end held while four lorries crossed: two hundred people out of the first camp.' },
  { level: 'camp', title: 'Camp Ostrava', text: 'Four out of the huts and into the lorry, and the camp\'s register with them.' },
  { level: 'relays', title: 'The Relay Peaks', text: 'All three relays cut: the rest of the camps emptied in one night, and not one call got out.' },
];
// (M6.95) the coast: the paymaster marked at the ball, and his money stopped
export const COAST = [
  { level: 'ball', title: 'The Winter Ball', text: 'The paymaster and his two agents marked among the dancers.' },
  { level: 'counting', title: 'The Counting House', text: 'The receipts out of the strongroom, and the paymaster taken alive at his desk.' },
  { level: 'harbour', title: 'Kessin Harbour', text: 'Both boats stopped in the basin, and the agents\' cash book taken.' },
  { level: 'battery', title: 'The Kessin Battery', text: 'The guns locked out and the bunker held while Ghost\'s boats came and went.' },
];
// (M6.98) Hollis: a name on a dance card, a face on a beach, and one of Ghost's own
export const HOLLIS = [
  { level: 'cove', title: 'Hollis\'s Cove', text: 'Hollis marked on the beach and followed home: one of Ghost\'s own.' },
  { level: 'cottage', title: 'The Cliff Cottage', text: 'Hollis taken alive in his attic before he could send the date, and his code book with him.' },
  { level: 'wrongbridge', title: 'The Wrong Bridge', text: 'The reds\' ambush party cleared from the wrong bridge while the armoury went by road.' },
];
// (M6.102) the colonel: taken on his shoot, and his spring plan stood down in his own name
export const COLONEL = [
  { level: 'hunt', title: 'The Hunting Party', text: 'Colonel Strand taken alive in the Vashka woods, and his map case with him.' },
  { level: 'northhq', title: 'Northern Headquarters', text: 'His staff marked, and the spring plan stood down in his own name.' },
  { level: 'borderrun', title: 'The Border Run', text: 'The spring plan driven down the valley road and over the frontier.' },
];
// (M6.106) the drops: the couriers' messages followed from a hall of mirrors to a bell tower
export const DROPS = [
  { level: 'funfair', title: 'The Funfair', text: 'The contact marked, and the message taken from the end of a maze nobody finishes.' },
  { level: 'observatory', title: 'The Observatory', text: 'Dr Sauer brought down from Kessock Peak, and her star charts with her.' },
  { level: 'cathedral', title: 'St Aldric\'s Tower', text: 'The Sexton taken in his own clock room, and the month\'s drop from among the bells.' },
];
export const TRAILS = [
  { id: 'blight', title: 'THE BLIGHT', steps: BLIGHT, stamp: 'HARVEST SAVED', colour: '#5a9a3a' },
  { id: 'codex', title: 'THE CODEX', steps: CODEX, stamp: 'RETURNED', colour: '#3a7ab0' },
  { id: 'river', title: 'THE RIVER', steps: RIVER, stamp: 'RIVER OPEN', colour: '#2a8a8a' },
  { id: 'forgers', title: 'THE FORGERS', steps: FORGERS, stamp: 'NOT VALID', colour: '#9a6a2a' },
  { id: 'handler', title: 'THE HANDLER', steps: HANDLER, stamp: 'DISMISSED', colour: '#7a3a8a' },
  { id: 'five', title: 'THE FIVE', steps: FIVE, stamp: 'EXPOSED', colour: '#b0503a' },
  { id: 'north', title: 'THE NORTH', steps: NORTH, stamp: 'ADJOURNED', colour: '#4a6a9a' },
  { id: 'camps', title: 'THE CAMPS', steps: CAMPS, stamp: 'EMPTIED', colour: '#6a8a5a' },
  { id: 'coast', title: 'THE COAST', steps: COAST, stamp: 'PAID OFF', colour: '#3a7a8a' },
  { id: 'hollis', title: 'HOLLIS', steps: HOLLIS, stamp: 'TURNED', colour: '#8a3a4a' },
  { id: 'colonel', title: 'THE COLONEL', steps: COLONEL, stamp: 'STOOD DOWN', colour: '#5a5a7a' },
  { id: 'drops', title: 'THE DROPS', steps: DROPS, stamp: 'RUNG OUT', colour: '#8a6a3a' },
];
export const trailMark = (trail, level) => trail.id + ':' + level;
// the marks a mission's being done adds (any trail it is a step of)
export const trailSteps = (level) => TRAILS.filter((t) => t.steps.some((b) => b.level === level)).map((t) => trailMark(t, level));
export const trailDone = (trail, have) => trail.steps.every((b) => (have || []).includes(trailMark(trail, b.level)));
export const trailBegun = (trail, have) => trail.steps.some((b) => (have || []).includes(trailMark(trail, b.level)));
