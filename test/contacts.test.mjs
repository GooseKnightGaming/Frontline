// FRONTLINE - radar knowledge tests: what you can sense, and what you remember.
import { World } from '../src/sim/world/world.js';
import { sense, Tracker, fade, MEMORY, RADAR_RANGES } from '../src/sim/people/contacts.js';
import { buildTraining } from '../src/game/levels/yard7.js';

let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };

// you at the origin, eyes 1.6 m up, looking north (-z)
const me = { eye: [0, 1.6, 0], yaw: 0 };
const flat = () => { const w = new World(); w.addSolid([-200, -1, -200], [200, 0, 200], 'ground'); return w; };

console.log('\n-- SENSES --');
T('someone in front of you in the open is seen', () => {
  A(sense(flat(), me, { pos: [0, 1, -20] }) === 'sight', 'should be seen');
});
T('someone behind you is not seen', () => {
  A(sense(flat(), me, { pos: [0, 1, 20] }) === null, 'should not be seen');
});
T('a wall hides them; glass does not', () => {
  const w = flat(); w.addSolid([-5, 0, -10.2], [5, 4, -10], 'wall');
  A(sense(w, me, { pos: [0, 1, -20] }) === null, 'seen through a wall');
  const g = flat(); g.addSolid([-5, 0, -10.2], [5, 4, -10], 'glass', { glass: true });
  A(sense(g, me, { pos: [0, 1, -20] }) === 'sight', 'not seen through glass');
});
T('their own body does not hide them', () => {
  const w = flat(); const body = w.addSolid([-0.4, 0, -20.4], [0.4, 1.8, -19.6], 'target');
  A(sense(w, me, { pos: [0, 0.9, -20], solid: body }) === 'sight', 'hidden by itself');
});
T('close by, you know they are there whichever way you face', () => {
  A(sense(flat(), me, { pos: [0, 1, 2] }) === 'near', 'should sense someone right behind you');
});
T('a turret firing behind a wall is heard, not seen - and not from too far', () => {
  const w = flat(); w.addSolid([-5, 0, 9.8], [5, 4, 10], 'wall');
  A(sense(w, me, { pos: [0, 1, 25], loud: 1 }) === 'sound', 'should hear it');
  A(sense(w, me, { pos: [0, 1, 25], loud: 0 }) === null, 'silent: should not know');
  A(sense(w, me, { pos: [0, 1, 80], loud: 1 }) === null, 'heard from 80 m');
});
T('goggles that see heat report it as heat, so the radar can show it apart', () => {
  A(sense(flat(), me, { pos: [0, 1, -20] }, { thermal: true }) === 'heat', 'should be heat');
});

console.log('\n-- MEMORY --');
T('lose sight of someone and they stay where you last knew they were, fading', () => {
  const tr = new Tracker();
  tr.update(0.1, [{ id: 'a', kind: 'enemy', pos: [1, 0, 1], how: 'sight' }]);
  A(tr.list()[0].live, 'should be live');
  tr.update(5, []);
  const k = tr.list()[0];
  A(k && !k.live && k.pos[0] === 1, 'should be remembered where last seen');
  A(fade(k) < 1 && fade(k) > 0.5, 'should be fading: ' + fade(k));
});
T('an old memory is dropped; seeing them again makes them live again', () => {
  const tr = new Tracker();
  tr.update(0.1, [{ id: 'a', kind: 'enemy', pos: [1, 0, 1], how: 'sight' }]);
  tr.update(MEMORY - 1, []);
  tr.update(0.1, [{ id: 'a', kind: 'enemy', pos: [3, 0, 3], how: 'sight' }]);
  A(tr.list()[0].live && tr.list()[0].pos[0] === 3, 'should be live at the new place');
  tr.update(MEMORY + 0.5, []);
  A(tr.list().length === 0, 'should be forgotten');
});
T('someone downed is forgotten at once', () => {
  const tr = new Tracker();
  tr.update(0.1, [{ id: 'a', kind: 'enemy', pos: [0, 0, 0], how: 'sight' }]);
  tr.forget('a');
  A(tr.list().length === 0, 'still there');
});
T('three radar ranges, close to wide', () => {
  A(RADAR_RANGES.length === 3 && RADAR_RANGES[0] < RADAR_RANGES[1] && RADAR_RANGES[1] < RADAR_RANGES[2], String(RADAR_RANGES));
});

console.log('\n-- IN THE COURSE --');
const L = buildTraining();
const pistol = L.groups.pistol;
T('from the pistol firing line, looking down the range, you see its targets', () => {
  const eye = [-105, -16 + 1.6, 15.2];
  const seen = pistol.filter((t) => sense(L.world, { eye, yaw: Math.PI }, { pos: t.centre, solid: t.solid }) === 'sight');
  A(seen.length >= 4, 'saw ' + seen.length + ' of ' + pistol.length);
});
// (from the link room itself you can see one target, straight down the short
// corridor and out across the firing line - which is true, so it is allowed)
T('from the corridor at the foot of the stairs, behind walls, you know nothing of them', () => {
  const eye = [-78, -16 + 1.6, 0];
  const any = pistol.filter((t) => sense(L.world, { eye, yaw: Math.PI }, { pos: t.centre, solid: t.solid }));
  A(any.length === 0, 'sensed ' + any.length + ' through walls');
});

console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + ')' : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
