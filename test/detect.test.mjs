// FRONTLINE - M6 stage 2: guards notice you. Run against the real Level 0.
import { Player } from '../src/sim/people/player.js';
import { buildMission0, FLOORS } from '../src/game/levels/mission0.js';
import { NavGrid } from '../src/sim/world/nav.js';
import { SENSE } from '../src/sim/people/guard.js';

let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const DT = 1 / 60;
let NAV = null;
const setup = () => {
  const L = buildMission0();
  const nav = new NavGrid(L.world, L.navFloors, L.navLinks);
  const barks = [];
  const ctx = (you, noises) => ({ world: L.world, nav, guards: L.guards, doors: L.swingDoors, noises: noises || [],
    bark: (g, t, key) => barks.push(g.id + ': ' + key + ': ' + t),
    alarm: (from, pos) => { for (const g of L.guards) if (g !== from && !g.dead && Math.hypot(g.pos[0] - from.pos[0], g.pos[2] - from.pos[2]) < SENSE.call && Math.abs(g.pos[1] - from.pos[1]) < 2.2) { g.awareness = Math.max(g.awareness, 0.7); g.stim = pos.slice(); g.state = 'search'; g.path = null; g.stateT = 0; } },
    you });
  return { L, nav, barks, ctx };
};
// you, standing (or crouched) at a spot, doing nothing
const youAt = (pos, o) => {
  o = o || {};
  const h = o.stance === 1 ? 1.2 : o.stance === 2 ? 0.5 : 1.8;
  return { pos, eye: [pos[0], pos[1] + h - 0.14, pos[2]], chest: [pos[0], pos[1] + h * 0.55, pos[2]],
    stance: o.stance || 0, speed: o.speed || 0, noise: o.noise || 0,
    box: [[pos[0] - 0.32, pos[1], pos[2] - 0.32], [pos[0] + 0.32, pos[1] + h, pos[2] + 0.32]] };
};
const run = (S, g, you, secs, noises) => { for (let i = 0; i < Math.round(secs / DT); i++) g.step(DT, S.ctx(you, i === 0 ? noises : [])); };

console.log('\n-- SIGHT --');
T('stand in front of a guard and he sees you: an alert inside two seconds', () => {
  const S = setup(); const g = S.L.guards.find((x) => x.id === 'security');
  g.yaw = Math.PI; g.home.yaw = Math.PI;                    // facing south, into the room
  run(S, g, youAt([16, 0, 8.3]), 2);
  A(g.state === 'alert', 'state ' + g.state + ' awareness ' + g.awareness.toFixed(2));
  A(S.barks.some((b) => /: alert: /.test(b)), 'no shout: ' + S.barks.join(' / '));
});
T('behind him, still and quiet, he has no idea', () => {
  const S = setup(); const g = S.L.guards.find((x) => x.id === 'security');
  g.yaw = 0; g.home.yaw = 0;                                  // facing north
  run(S, g, youAt([16, 0, 6.5]), 3);
  A(g.awareness < 0.05 && g.state === 'patrol', 'awareness ' + g.awareness.toFixed(2));
});
T('a shut door hides you; open it and he sees you', () => {
  const S = setup(); const g = S.L.guards.find((x) => x.id === 'security');
  g.yaw = Math.PI; g.home.yaw = Math.PI;
  run(S, g, youAt([15.5, 0, 10.8]), 2);
  A(g.awareness < 0.05, 'seen through a shut door: ' + g.awareness.toFixed(2));
  const d = S.L.swingDoors.find((x) => Math.abs(x.def.at - 9) < 0.01 && x.def.from < 16 && x.def.from > 14.9);
  d.set(true, 1);
  run(S, g, youAt([15.5, 0, 10.8]), 2);
  A(g.awareness > 0.4, 'not seen through the open door: ' + g.awareness.toFixed(2));
});
T('crouched, you take longer to make out than standing', () => {
  const a = setup(), b = setup();
  const ga = a.L.guards.find((x) => x.id === 'security'), gb = b.L.guards.find((x) => x.id === 'security');
  for (const g of [ga, gb]) { g.yaw = Math.PI; g.home.yaw = Math.PI; }
  run(a, ga, youAt([16, 0, 8.3]), 0.4);
  run(b, gb, youAt([16, 0, 8.3], { stance: 1 }), 0.4);
  A(gb.awareness < ga.awareness * 0.75, 'standing ' + ga.awareness.toFixed(2) + ' vs crouched ' + gb.awareness.toFixed(2));
});

T('creep up right behind him, crouched, and he has no idea (Rhys)', () => {
  const S = setup(); const g = S.L.guards.find((x) => x.id === 'security');
  g.yaw = 0; g.home.yaw = 0; g.lookT = 0;                     // facing north; you come up from the south
  for (let i = 0; i < 60 * 4; i++) {
    const z = 6.5 - (i / 240) * 2.6;                           // from 3.3 m behind to 0.7 m behind
    g.step(DT, S.ctx(youAt([16, 0, z], { stance: 1, speed: 0.9, noise: 0.15 })));
  }
  A(g.awareness < 0.02 && g.state === 'patrol', 'he sensed you: ' + g.awareness.toFixed(2) + ' ' + g.state);
  run(S, g, youAt([16, 0, 3.9], { stance: 0 }), 3);            // and standing still right behind him
  A(g.awareness < 0.02, 'standing still behind him: ' + g.awareness.toFixed(2));
});

console.log('\n-- HEARING --');
T('sprinting behind him: he hears it, turns, and goes to look where you were', () => {
  const S = setup(); const g = S.L.guards.find((x) => x.id === 'security');
  g.yaw = 0; g.home.yaw = 0;
  run(S, g, youAt([18, 0, 7], { speed: 7, noise: 1 }), 0.8);
  A(g.state === 'suspicious' || g.state === 'search', 'state ' + g.state);
  run(S, g, youAt([30, 0, 10.5]), 8);                         // you have gone; he goes to where you were
  A(Math.hypot(g.pos[0] - 18, g.pos[2] - 7) < 1.5 || g.state === 'return', 'he did not come looking: ' + g.pos.map((v) => v.toFixed(1)) + ' ' + g.state);
});
T('crouch-walking behind him, he does not hear you', () => {
  const S = setup(); const g = S.L.guards.find((x) => x.id === 'security');
  g.yaw = 0; g.home.yaw = 0;
  run(S, g, youAt([18.5, 0, 7.5], { speed: 1.5, noise: 0.15 }), 3);
  A(g.awareness < 0.05, 'heard a crouch-walk at 4 m: ' + g.awareness.toFixed(2));
});
T('a shot is heard across the floor, far less through the floors above', () => {
  const S = setup();
  const lobby = S.L.guards.find((x) => x.id === 'lobby'), upstairs = S.L.guards.find((x) => x.id === 'server-left');
  const shot = [{ pos: [24, 1.5, 10.5], loud: 1 }];
  run(S, lobby, youAt([30, 0, 10.5]), DT, shot);
  run(S, upstairs, youAt([30, 0, 10.5]), DT, shot);
  A(lobby.awareness >= 0.6, 'the lobby guard (20 m, same floor) should hear it: ' + lobby.awareness.toFixed(2));
  A(upstairs.awareness < 0.3, 'two floors up should not: ' + upstairs.awareness.toFixed(2));
});
T('a silenced shot is not heard from across the building', () => {
  const S = setup(); const lobby = S.L.guards.find((x) => x.id === 'lobby');
  run(S, lobby, youAt([30, 0, 10.5]), DT, [{ pos: [24, 1.5, 10.5], loud: 0.25 }]);
  A(lobby.awareness < 0.3, 'heard a silenced shot at 20 m: ' + lobby.awareness.toFixed(2));
});

console.log('\n-- SEARCHING --');
T('he searches through a shut door, up the stairs if need be, and then goes back to his post', () => {
  const S = setup(); const g = S.L.guards.find((x) => x.id === 'security');
  g.temper = 'bold';                                           // (he is steady by nature: this one goes)
  g.awareness = 0.7; g.stim = [22.2, FLOORS[1], 2.4]; g.state = 'search'; g.since = 0;   // up on the first-floor landing
  run(S, g, youAt([38, 0, 18]), 25);
  A(g.state === 'return' || g.state === 'patrol', 'still ' + g.state + ' at ' + g.pos.map((v) => v.toFixed(1)));
  A(S.L.swingDoors.some((d) => d.open && Math.abs(d.def.at - 9) < 0.01 && d.def.from > 14.9 && d.def.from < 16), 'he should have opened the office door');
  run(S, g, youAt([38, 0, 18]), 30);
  A(g.state === 'patrol' && Math.hypot(g.pos[0] - 16, g.pos[2] - 3.2) < 1 && Math.abs(g.pos[1]) < 0.1, 'not back at his post: ' + g.pos.map((v) => v.toFixed(1)) + ' ' + g.state);
});
T('an alerted guard shouts, and the guards within earshot come searching', () => {
  const S = setup(); const g = S.L.guards.find((x) => x.id === 'server-left');
  const buddy = S.L.guards.find((x) => x.id === 'server-right'), far = S.L.guards.find((x) => x.id === 'lobby');
  run(S, g, youAt([18.6, FLOORS[2], 5.5]), 2);
  A(g.state === 'alert', 'the server guard should see you: ' + g.state + ' ' + g.awareness.toFixed(2));
  A(buddy.state === 'search' || buddy.state === 'alert', 'his partner should come: ' + buddy.state);
  A(far.state === 'patrol', 'two floors down should not: ' + far.state);
});
T('a colleague found lying on the floor starts a search', () => {
  const S = setup(); const g = S.L.guards.find((x) => x.id === 'server-left'), d = S.L.guards.find((x) => x.id === 'ops-patrol');
  d.pos = [18.6, FLOORS[2], 7.5]; d.target.down = true; d.step(DT);
  g.yaw = 0;                                                   // looking north, at the body
  run(S, g, youAt([38, 0, 18]), 1);
  A(g.state === 'search' && S.barks.some((b) => /: (manDown|wake): /.test(b)), g.state + ' / ' + S.barks.join(' | '));
});

T('three bodies in sight at once: one shout, not three (M6.8.1, "Medic!" over and over)', () => {
  const S = setup(); const g = S.L.guards.find((x) => x.id === 'server-left');
  const bodies = ['ops-patrol', 'server-right', 'security'].map((id) => S.L.guards.find((x) => x.id === id));
  bodies.forEach((d, i) => { d.pos = [17.6 + i, FLOORS[2], 7.5]; d.target.down = true; d.step(DT); });
  g.yaw = 0;
  run(S, g, youAt([38, 0, 18]), 1);
  const shouts = S.barks.filter((b) => b.startsWith(g.id + ': ') && /: (manDown|wake): /.test(b));
  A(bodies.every((d) => g.found.has(d)), 'he did not take them all in');
  A(shouts.length === 1, shouts.length + ' shouts: ' + S.barks.join(' | '));
});

console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + ')' : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
