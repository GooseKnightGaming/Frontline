// FRONTLINE - saved game tests (node; localStorage is stubbed).
const store = {};
global.localStorage = { getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
const S = await import('../src/game/core/saves.js');
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const game = { name: 'Rhys', playtime: 754.6, score: 120,
  loadout: { slots: { primary: 'K7', backup: 'PX9', utility1: 'FRAG', utility2: null, gear: 'LENSES' }, mods: { primary: ['EXTMAG'] } },
  found: ['K7', 'PX9'], place: [1.234567, 0, 30.5], yaw: 1.5708 };

T('three slots, empty to begin with', () => {
  A(S.listSlots().length === 3 && S.listSlots().every((s) => s === null), 'not empty');
  A(S.describe(null).title === 'Empty', 'empty description');
});
T('a save can be written, described, read back and erased', () => {
  A(S.saveSlot(1, S.snapshot(game)), 'write failed');
  const all = S.listSlots();
  A(all[0] === null && all[1] && all[2] === null, 'wrong slot');
  A(all[1].score === 120 && all[1].loadout.slots.primary === 'K7', 'contents lost');
  const d = S.describe(all[1]);
  A(d.title === 'Rhys' && /12 min/.test(d.detail) && /120 pts/.test(d.detail), 'description: ' + d.detail);
  S.clearSlot(1);
  A(S.listSlots()[1] === null, 'erase failed');
});
T('a transfer code carries the save intact', () => {
  const snap = S.snapshot(game);
  const code = S.exportCode(snap);
  A(/^FL1\./.test(code.replace(/\s+/g, '')), 'code shape: ' + code.slice(0, 12));
  const back = S.importCode(code);
  A(back.ok, 'refused its own code: ' + back.why);
  A(JSON.stringify(back.data) === JSON.stringify(snap), 'the save changed in transit');
});
T('line breaks and stray spaces in a pasted code are forgiven', () => {
  const code = S.exportCode(S.snapshot(game));
  A(S.importCode('  ' + code.replace(/\n/g, ' \n ') + '  ').ok, 'whitespace broke it');
});
T('a damaged or foreign code is refused, not loaded', () => {
  const code = S.exportCode(S.snapshot(game)).replace(/\s+/g, '');
  const broken = code.slice(0, 20) + (code[20] === 'A' ? 'B' : 'A') + code.slice(21);
  const r = S.importCode(broken);
  A(!r.ok && /damaged/.test(r.why), 'a typo should be caught: ' + JSON.stringify(r));
  A(!S.importCode('hello').ok, 'nonsense accepted');
  A(!S.importCode('TDRz.abc.1234').ok, 'another game\u2019s code accepted');
});
T('a save from a newer version is refused politely', () => {
  const snap = S.snapshot(game); snap.v = 99;
  const code = S.exportCode(snap);
  const r = S.importCode(code);
  A(!r.ok && /newer/.test(r.why), 'should refuse: ' + JSON.stringify(r));
});
T('the story travels with a save and its transfer code; each slot keeps its own (M6.13.8)', () => {
  const story = { missions: { riverside: { result: 'partial', captain: 'escaped', hostages: [{ id: 'H1', name: 'Dr Imogen Hale', fate: 'rescued' }] } }, log: [{ mission: 'riverside', result: 'partial', at: 1 }] };
  const snap = S.snapshot(Object.assign({}, game, { story }));
  A(snap.story && snap.story.missions.riverside.captain === 'escaped', 'the snapshot dropped the story');
  story.missions.riverside.captain = 'killed';
  A(snap.story.missions.riverside.captain === 'escaped', 'the snapshot shares the story object rather than copying it');
  const back = S.importCode(S.exportCode(snap));
  A(back.ok && back.data.story && back.data.story.missions.riverside.hostages[0].name === 'Dr Imogen Hale', 'the transfer code lost the story');
  A(S.snapshot(game).story === null, 'a save with no story invented one');
  S.saveStory(1, { missions: { riverside: { result: 'success' } }, log: [] });
  A(S.loadStory(1).missions.riverside.result === 'success' && S.loadStory(2) === null, 'the slots share a story');
  global.sessionStorage = { v: {}, getItem(k) { return this.v[k] ?? null; }, setItem(k, x) { this.v[k] = String(x); } };
  S.setCurrentSlot(2); A(S.currentSlot() === 2, 'the slot in play is not remembered');
  S.setCurrentSlot(9); A(S.currentSlot() === 0, 'a slot out of range was believed');
});
console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + ')' : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
