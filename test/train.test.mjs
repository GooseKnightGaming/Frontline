// FRONTLINE - Level 4, the Night Train (M6.18.0): the station, the train, the journey. Plain node.
import { buildTrain, carriages, doorSpans, inTrain, inCoach, TrainRun, RUN, ROUTE, sectionAt, CAR, FLOOR, TRAIN_X0, STAFF_TALK, STAFF_VOICE, STAFF_SAY, NEWSPAPER, NOSE, departures, nearestSeat, BODY, TERMINUS, HIJACK, HIJACK_TALK, HIJACK_VOICE } from '../src/game/level_train.js';
import { SPOKEN, SPOKEN_SETS, setOfVoice } from '../src/game/spoken.js';
import { existsSync } from 'fs';
import { RULES } from '../src/sim/story.js';
import { Player, blankInput } from '../src/sim/player.js';
import { matrixLetters } from '../src/game/matrix_font.js';
import { ResScaler } from '../src/sim/perf.js';
import { pickFoe } from '../src/sim/factions.js';
import { NavGrid } from '../src/sim/nav.js';
import { readFileSync } from 'fs';
import { pickClip } from '../src/sim/anim.js';
import { MATRIX } from '../src/game/textures.js';

let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n + ' -> ' + e.message); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
const L = buildTrain();
// a body's room at p (feet): nothing solid in a 0.6 m box from 0.3 m up to 1.7 m
const clear = (w, p) => !w.hit([p[0] - 0.3, p[1] + 0.3, p[2] - 0.3], [p[0] + 0.3, p[1] + 1.7, p[2] + 0.3]);
const walk = (w, pts) => {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], n = Math.ceil(Math.hypot(b[0] - a[0], b[2] - a[2]) / 0.25);
    for (let k = 0; k <= n; k++) { const p = [a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n, a[2] + (b[2] - a[2]) * k / n]; if (!clear(w, p)) return p; }
  }
  return null;
};

console.log('\n-- THE STATION --');
T('you arrive in the street outside Novomir Central, unarmed, facing its doors (Rhys: "starts with you arriving at the station")', () => {
  const sp = L.world.spawn.pos;
  A(sp[0] < L.concourse.x0 && Math.abs(sp[1]) < 0.01, 'not outside the station: ' + sp);
  A(Math.abs(L.world.spawn.yaw + Math.PI / 2) < 1e-6, 'not facing the station');
  const k = L.startLoadout;
  A(k && ['primary', 'backup', 'utility1', 'utility2', 'gear'].every((s) => k[s] === null), 'not unarmed: ' + JSON.stringify(k));
  A(L.signs.some((s) => s.text === 'НОВОМИР СЕНТРАЪЛЫ' && s.sub === 'Novomir Central'), 'no name over the door');
});
T('the departures board says where to go - in Cyrillic, English beneath: the 21:40 to Belyagorsk, Platform 3; four platforms, their barriers signed (M6.18.1, Rhys)', () => {
  const cyr = (t) => /[\u0400-\u04ff]/.test(t);
  A(L.signs.some((s) => /21:40\s+\u0411\u0415\u041b\u042f\u0413\u041e\u0420\u0421\u041a\s+\u041f\u0418\u042f\u0422\u0424\u041e\u030f\u041c\u0410 3/.test(s.text) && /Belyagorsk - Platform 3/.test(s.sub)), 'the board');
  for (const n of ['1', '2', '3', '4']) A(L.signs.some((s) => s.text === '\u041f\u0418\u042f\u0422\u0424\u041e\u030f\u041c\u0410 ' + n), 'no barrier sign for ' + n);
  for (const n of ['1', '2', '3', '4']) A(L.signs.filter((s) => s.text === n).length >= 3, 'platform ' + n + ' unsigned');
  A(L.platforms && [1, 2, 3, 4].every((k) => L.platforms[k]), 'four platforms');
  A(L.signs.filter((s) => s.station && /[A-Za-z]{3}/.test(s.text)).length === 0, 'a station sign in Latin letters: ' + L.signs.filter((s) => s.station && /[A-Za-z]{3}/.test(s.text)).map((s) => s.text));
  A(L.signs.filter((s) => s.station && cyr(s.text)).length >= 6, 'too few in Cyrillic');
  // a local train standing at Platform 1/2
  A(L.movers[0].pieces.filter((p) => p.mat === 'paint' && p.tint && p.tint[0] < 0.3 && p.tint[1] > 0.4 && p.max[0] - p.min[0] > 19).length === 3, 'no local train');
});
T('a ticket inspector at every one of the four gates; each gate shut until shown a ticket; the wrong one sends you to Platform 3 (M6.18.2, Rhys: "a Ticket Inspector at all 4 platforms")', () => {
  A(L.gates && ['1', '2', '3', '4'].every((k) => L.gates[k]) && L.ticketGate === L.gates['3'], 'four gates');
  for (const k of ['1', '2', '3', '4']) {
    const g = L.gates[k], n = (L.npcs || []).find((q) => q.id === 'inspector' + k);
    A(!g.open && !g.solid.disabled && n && n.kind === 'inspector' && n.platform === k, 'gate or inspector ' + k);
    const gm = (g.z[0] + g.z[1]) / 2;
    A(Math.hypot(n.pos[0] - g.x, n.pos[2] - gm) < 2.2, 'inspector ' + k + ' is not at his gate');
    const route = [[g.x - 3, FLOOR, gm], [g.x + 1.5, FLOOR, gm]];
    A(walk(L.world, route), 'through shut gate ' + k);
    g.solid.disabled = true; const open = !walk(L.world, route); g.solid.disabled = false;
    A(open, 'not through open gate ' + k);
    A(L.pieces.some((p) => p.prop === 'gate' + k), 'gate ' + k + '\'s leaf cannot hide');
    if (k !== '3') A(/Platform 3|platform three/i.test(STAFF_TALK['wrong' + k]), 'inspector ' + k + ' does not redirect: ' + STAFF_TALK['wrong' + k]);
  }
  const g = L.ticketGate, xb = TRAIN_X0 - 4;
  A(walk(L.world, [[xb - 6, FLOOR, 3.2], [xb + 2, FLOOR, 3.2]]) && walk(L.world, [[xb - 6, FLOOR, 6.8], [xb + 2, FLOOR, 6.8]]), 'round the gate');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/'E  Show your ticket'/.test(rt) && /gateOpen\(\); speak\(n, STAFF_TALK\.checked\)/.test(rt) && /speak\(n, STAFF_TALK\.tickets\)/.test(rt), 'no inspecting');
  A(/if \(n\.platform !== '3'\) \{ speak\(n, STAFF_TALK\['wrong' \+ n\.platform\]\); return; \}/.test(rt), 'the wrong gate opens');
  // every line recorded, in every voice that says it, and in the set its voice loads with
  const setOf = { st1: 'staff', st2: 'staff2', st3: 'kiosk', sva: 'pa' };
  for (const [k, t] of Object.entries(STAFF_TALK)) {
    const id = SPOKEN[t]; A(id, 'not recorded: ' + t);
    for (const v of STAFF_VOICE[k] || []) A(existsSync(new URL('../assets/voices/spoken_' + v + '_' + id + '.mp3', import.meta.url)) && (SPOKEN_SETS[setOf[v]] || []).includes(id), 'no ' + v + ' file for: ' + t);
  }
  // each inspector speaks in a voice his lines are recorded in
  for (const n of L.npcs.filter((q) => q.kind === 'inspector')) for (const k of ['tickets', 'police', n.platform === '3' ? 'checked' : 'wrong' + n.platform]) A(STAFF_VOICE[k].includes(n.voice), n.id + ' has no ' + n.voice + ' for ' + k);
  A(STAFF_VOICE.kiosk.includes(L.npcs.find((q) => q.id === 'vendor').voice), 'the vendor\'s voice');
});
T('a way in: up the steps, across the concourse, through Platform 3\'s gate, along the platform to a door of Coach 3, and in', () => {
  const C = carriages().find((c) => c.id === 'C'), d = doorSpans(C)[0], dx = (d[0] + d[1]) / 2;
  const con = L.concourse, xb = TRAIN_X0 - 4;
  L.ticketGate.solid.disabled = true;           // (your ticket shown)
  const blocked = walk(L.world, [[con.x0 + 1, FLOOR, 6], [xb - 5, FLOOR, 4.9], [xb + 2, FLOOR, 4.9], [dx, FLOOR, 4.6], [dx, FLOOR, 2.2], [dx, FLOOR, 0], [dx + 3, FLOOR, 0]]);
  L.ticketGate.solid.disabled = false;
  A(!blocked, 'blocked at ' + (blocked && blocked.map((v) => v.toFixed(1))));
  A(inTrain([dx + 3, FLOOR, 0]) && !inTrain([dx, FLOOR, 4.6]), 'inTrain');
});

console.log('\n-- THE TRAIN --');
T('six vehicles, back to front: the guard\'s van, coaches D and C (standard), B (buffet), A (first class), the locomotive - joined by gangways you can walk', () => {
  const cs = carriages();
  A(cs.map((c) => c.id).join(',') === 'van,D,C,B,A,loco', cs.map((c) => c.id));
  for (let i = 1; i < cs.length; i++) A(Math.abs(cs[i].x0 - cs[i - 1].x1 - CAR.gap) < 1e-9, 'a gap between ' + cs[i - 1].id + ' and ' + cs[i].id);
  // down the aisle from the van's front to first class's front end: open (the gangway doors opened)
  for (const dr of L.swingDoors) if (!dr.locked) dr.set(true, 1);
  const blocked = walk(L.world, [[cs[0].x1 - 3, FLOOR, 0], [cs[4].x1 - 1.2, FLOOR, 0]]);
  for (const dr of L.swingDoors) if (!dr.locked) dr.set(false, 1);
  A(!blocked, 'the aisle is blocked at ' + (blocked && blocked.map((v) => v.toFixed(1))));
  // the cab is locked
  const cab = L.swingDoors.find((d) => d.def.label === 'cab door');
  A(cab && cab.locked, 'the cab is open');
  // (M6.18.2, Rhys kicked it open with F) reinforced: no kick opens it, only a breach
  A(cab.def.build === 'reinforced', 'the cab door can be kicked in');
});
T('each coach has its doors on the platform side, open at the station: their leaves hidden, not solid', () => {
  for (const c of carriages().filter((c) => c.id !== 'loco')) A(doorSpans(c).length === 2, c.id);
  A(L.trainDoors.hidden && L.trainDoors.spans.length === 10 && L.trainDoors.spans.every((s) => s.solid.disabled), 'the doors');
  A(L.pieces.filter((p) => p.prop === 'trainDoors').length === 20, 'their leaves are not their own to hide');
  const rd = readFileSync(new URL('../src/game/render.js', import.meta.url), 'utf8');
  A(/level\[name\]\.taken \|\| level\[name\]\.hidden/.test(rd), 'render cannot hide them');
});
T('furnished: seats two and two in C and D, first class at tables, the buffet counter, the van\'s cages, the cab\'s desk', () => {
  A(L.firstClass && L.buffet && L.cab, 'missing a fit-out');
  const C = carriages().find((c) => c.id === 'C');
  const seats = L.pieces.filter((p) => p.mat === 'paint' && p.min[0] > C.x0 && p.max[0] < C.x1 && p.max[1] - p.min[1] < 0.5 && p.min[1] === FLOOR);
  A(seats.length >= 30, seats.length + ' seats in Coach C');
});

console.log('\n-- THE RUN --');
T('the 21:40 leaves at 21:40 by the clock: you arrive at 21:36; a warning half a minute before; aboard, the doors close and it pulls away to top speed; not aboard, you have missed it; aboard early, sit and the time passes (M6.18.1, Rhys)', () => {
  const r = new TrainRun(), ev = [];
  A(r.clock() === '21:36:00', r.clock());
  while (r.state === 'waiting' && r.t < 600) { r.step(0.1, r.t > 100); ev.push(...r.events); r.events.length = 0; }
  A(Math.abs(r.t - RUN.departAt) < 0.11 && r.clock().startsWith('21:40'), 'left at ' + r.clock());
  while (r.state !== 'running') { r.step(0.1, true); ev.push(...r.events); r.events.length = 0; }
  A(ev.map((e) => e.type).join(',') === 'warn,close,depart', ev.map((e) => e.type));
  for (let i = 0; i < 1200; i++) r.step(0.1, true);
  A(r.speed === RUN.top && r.dist > 2000, 'speed ' + r.speed + ', ' + r.dist.toFixed(0) + ' m');
  // not aboard at 21:40: gone without you
  const m = new TrainRun(), mev = [];
  while (m.t < RUN.departAt + 1) { m.step(0.1, false); mev.push(...m.events); m.events.length = 0; }
  A(m.state === 'missed' && mev.some((e) => e.type === 'missed') && m.dist === 0, 'not missed: ' + m.state);
  // aboard early: sit, and it is nearly time
  // (M6.18.2, Rhys: "you should actually sit - for at least a moment") the time runs fast while you sit, not at a jump
  const e = new TrainRun(); e.step(30, true);
  A(e.sit() && e.t === 30, 'sitting jumped the clock');
  e.step(1, true); A(Math.abs(e.t - (30 + RUN.sitPace)) < 1e-9, 'sitting did not speed the time: ' + e.t);
  for (let i = 0; i < 100; i++) e.step(0.1, true);
  A(e.state === 'waiting' && !e.fast && e.t < RUN.departAt && e.t > RUN.departAt - RUN.sitTo - 1, 'sat past the time, or not to it: ' + e.t);
  const u = new TrainRun(); u.step(30, true); u.sit(); u.unsit(); u.step(1, true);
  A(Math.abs(u.t - 31) < 1e-9, 'stood up, and the time still ran fast');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/'E  Take your seat and wait for 21:40'/.test(rt) && /nearestSeat\(level\.seats, player\.pos, level\.hijacked \? \['C', 'D'\] : null\)/.test(rt) && /const waits = level\.trainRun\.sit\(\);/.test(rt) && /rt\.fail\('You missed the 21:40 to Belyagorsk\.'\)/.test(rt), 'the game does not let you sit, or miss it');
  A(inCoach([carriages()[2].x0 + 5, FLOOR, 0], 'C') && !inCoach([carriages()[3].x0 + 5, FLOOR, 0], 'C'), 'Coach 3');
});
T('the world streams past: the station slides back; tunnel under the city, then country, then the hills\' tunnel; the track always under you', () => {
  A(sectionAt(100) === 'station' && sectionAt(1000) === 'tunnel' && sectionAt(5000) === 'country' && sectionAt(9500) === 'tunnel' && sectionAt(20000) === 'country', 'the route');
  const run = L.trainRun, M = (id) => L.movers.filter((m) => m.id.startsWith(id));
  // at the station: no tiles shown; the station where it was built
  A(M('station')[0].at()[0] === 0 && M('track').every((m) => m.at()[1] < -100), 'tiles at the station');
  run.state = 'running';
  const at = (dist, kind) => { run.dist = dist; return M(kind).map((m) => m.at()).filter((p) => p[1] > -100); };
  // under the city: tunnel tiles round the train, no country
  const tun = at(1000, 'tunnel'), cty = at(1000, 'country'), trk = at(1000, 'track');
  A(tun.length >= 8 && !cty.length, 'under the city: ' + tun.length + ' tunnel, ' + cty.length + ' country');
  const cs = carriages(), front = cs[cs.length - 1].x1;
  A(tun.some((p) => p[0] <= TRAIN_X0) && tun.some((p) => p[0] + 30 >= front), 'the tunnel does not cover the train');
  A(trk.some((p) => p[0] <= TRAIN_X0) && trk.some((p) => p[0] + 40 >= front), 'no track under the train');
  // out in the country
  A(at(5000, 'country').length >= 3 && !at(5000, 'tunnel').length, 'the country');
  A(M('station')[0].at()[0] === -5000, 'the station did not slide away');
  // signs and lights of the station go with it
  A(L.signs.filter((s) => s.station).every((s) => s.follow()[0] === -5000) && L.lights.filter((l) => l.station).every((l) => l.follow()[0] === -5000), 'the station\'s signs and lamps stayed behind');
  run.state = 'waiting'; run.dist = 0;
});
T('the game\'s side: the run ticks with you aboard; the doors shut and turn solid; the station\'s solids go when it leaves; the top line follows it', () => {
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/run\.step\(dt, player\.mode !== 'dead' && inTrain\(player\.pos\)\)/.test(rt), 'no run');
  A(/level\.trainDoors\.hidden = false;\s+for \(const d of level\.trainDoors\.spans\) d\.solid\.disabled = false;/.test(rt), 'the doors do not shut');
  A(/for \(const sld of level\.stationSolids \|\| \[\]\) sld\.disabled = true;/.test(rt), 'the station stays solid');
  A(/'Find your train: the 21:40 to Belyagorsk \(the departures board\)'/.test(rt), 'no top line');
  const rd = readFileSync(new URL('../src/game/render.js', import.meta.url), 'utf8');
  A(/for \(const s of signHolders\) if \(s\.follow\)/.test(rd) && /for \(const l of lampEntities\) if \(l\.follow\)/.test(rd), 'signs and lamps cannot follow');
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/const TRAIN = \/\[\?&\]level=4\\b\//.test(main) && /TRAIN \? buildTrain\(\{ express: /.test(main) && /THE NIGHT TRAIN/.test(main), 'not in the game');
  A(/id="t-train"/.test(readFileSync(new URL('../src/index.html', import.meta.url), 'utf8')), 'not on the title screen');
  const o = RULES.train.outcome({ run: { state: 'running', boarded: true, dist: 4200 } });
  const om = RULES.train.outcome({ run: { state: 'missed', boarded: false, dist: 0 } });
  A(om.missed && RULES.train.grade(om) === 'failed' && /missed it/.test(RULES.train.lines(om)[0].text), 'missing it');
  A(o.boarded && o.departed && RULES.train.lines(o).some((l) => /4\.2 km/.test(l.text)), 'the debrief');
});

console.log('\n-- M6.18.1 --');
T('a bullet nose on the locomotive, and a way to see out of the front: through the cab door\'s glass, down the middle of the engine room, out of the windscreen (Rhys)', () => {
  const cs = carriages(), loco = cs[cs.length - 1];
  A(L.nose && L.nose.x0 === loco.x1 && L.nose.x1 - L.nose.x0 === NOSE.len, 'no nose');
  // a smooth shell (M6.18.1: slices showed as steps): wide and deep at the cab, a point at the tip
  const shell = L.pieces.find((p) => p.nosePart === 'body'), tipPart = L.pieces.find((p) => p.nosePart === 'warn');
  shell.quads = shell.quads.concat(tipPart.quads);
  A(shell && shell.quads.length > 200, 'no shell');
  const vs = shell.quads.flatMap((q) => q.v), base = vs.filter((v) => v[0] < loco.x1 + 0.01), tip = vs.filter((v) => v[0] > loco.x1 + NOSE.len * 0.97);
  const span = (list, k) => Math.max(...list.map((v) => v[k])) - Math.min(...list.map((v) => v[k]));
  A(span(base, 2) > 2.5 && span(tip, 2) < span(base, 2) * 0.35 && span(tip, 1) < span(base, 1) * 0.35, 'it does not taper to a point');
  // every face turned outwards
  // every face turned outwards: away from the nose's middle line at that point
  const inward = shell.quads.filter((q) => {
    const c = q.v.reduce((a, v) => [a[0] + v[0] / 4, a[1] + v[1] / 4, a[2] + v[2] / 4], [0, 0, 0]);
    const t = (c[0] - loco.x1) / NOSE.len, mid = NOSE.at(Math.min(1, t)).mid;
    return q.n[1] * (c[1] - mid) + q.n[2] * c[2] < 0;
  });
  A(!inward.length, 'faces turned inwards: ' + inward.length);
  const cab = L.swingDoors.find((d) => d.def.label === 'cab door');
  A(cab.def.mat === 'glass' && cab.locked, 'the cab door');
  // a clear line of sight from first class's front, through the cab door (glass), out of the windscreen (glass)
  const A1 = cs[cs.length - 2], eye = [A1.x1 - 2, FLOOR + 1.6, 0], dir = [1, 0, 0];
  const hit = L.world.raycast(eye, dir, 60, (q) => q.glass || q.tag === 'hdoor');
  A(!hit, 'something in the way: ' + (hit && [hit.solid.tag, hit.t.toFixed(1)]));
});
T('the city round the station: streets of lit blocks on every side, a road and its lamps, the station\'s front and clock tower, and the tunnel\'s mouth ahead - all going with the station (Rhys: "a city scenery around where the station is")', () => {
  const sp = L.movers[0].pieces, blocks = sp.filter((p) => p.mat === 'facade');
  A(blocks.length >= 30, blocks.length + ' blocks');
  const con = L.concourse;
  A(blocks.some((b) => b.max[0] < con.x0 - 10) && blocks.some((b) => b.max[2] < -20) && blocks.some((b) => b.min[2] > 20), 'not on every side');
  A(blocks.some((b) => b.min[0] < con.x0 && b.max[1] >= 14 && b.min[1] >= 6.9), 'no station front');
  A(sp.some((p) => p.min[0] >= 259 && p.max[1] >= 20 && p.min[2] > 3), 'no tunnel mouth');
});

console.log('\n-- M6.18.2 --');
T('seated: you sit in your seat - eyes low, held there a moment whatever you press; then a step stands you up, into the aisle (Rhys: "you should actually sit - for at least a moment")', () => {
  const p = new Player(L.world), s = L.yourSeat, DT = 1 / 60;
  A(s && inCoach(s.pos, 'C') && inCoach(s.back, 'C'), 'no seat in Coach 3');
  A(clear(L.world, s.back), 'nowhere to stand up to');
  p.pos = s.back.slice(); for (let i = 0; i < 30; i++) p.step(DT, Object.assign(blankInput(), { yaw: s.yaw }));
  const standEye = p.eyeHeight;
  p.sit(s.pos, s.back);
  const go = Object.assign(blankInput(), { yaw: s.yaw, moveZ: 1 });
  for (let i = 0; i < 60; i++) p.step(DT, go);
  A(p.seated && p.pos.every((v, k) => Math.abs(v - s.pos[k]) < 1e-9) && p.eyeHeight < standEye - 0.3, 'not sat for a moment');
  for (let i = 0; i < 40 && p.seated; i++) p.step(DT, go);
  A(!p.seated && Math.hypot(p.pos[0] - s.back[0], p.pos[2] - s.back[2]) < 1 && p.eyeHeight === standEye, 'did not stand up into the aisle');
});
T('the kiosk: a vendor behind the counter; coffee or the evening paper (Rhys: "pick up (and drink/read) a coffee and a newspaper")', () => {
  const v = L.npcs.find((q) => q.id === 'vendor');
  A(v && v.kind === 'vendor', 'no vendor');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/'A coffee, please\.  \(' \+ PRICES\.coffee/.test(rt) && /'The evening paper\.  \(' \+ PRICES\.paper/.test(rt) && /rt\.read\(NEWSPAPER\)/.test(rt), 'nothing to buy');
  A(/if \(S\.dialog\) return;/.test(rt), 'the pointer is taken back while the paper is open');
});
T('the paper is in Severian - Cyrillic, its own language (its letter Ӧ), not Russian or Ukrainian; English at a press (Rhys)', () => {
  const P = NEWSPAPER, sev = [P.masthead, P.date, P.weather, ...P.stories.flatMap((s) => [s.h, s.t])].join(' ');
  A(P.stories.length >= 3 && P.stories.every((s) => s.en && s.ten), 'stories');
  A(/[Ѐ-ӿ]/.test(P.masthead) && (sev.match(/[Ѐ-ӿ]/g) || []).length > 300, 'not in Cyrillic');
  A(/Ӧ|ӧ/.test(sev), 'no Severian letter');
  A(!/[іїєґІЇЄҐъЪ]/.test(sev), 'Ukrainian or Russian letters');
  A(!/(^|[\s,.«])(и|это|что|нет|года)([\s,.»]|$)/i.test(sev), 'Russian words');
  A(/Front of Memory/.test(P.stories.map((s) => s.ten).join(' ')) && /Dravets/.test(P.stories[0].ten), 'not tonight\'s news');
});
T('a ticket inspector can be knocked down - and one who sees it calls the police, who arrest you if you are still at the station (Rhys: "you should be ABLE to, but that causes the others to turn on you")', () => {
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/tn\.down = true; tn\.fell = S\.time; tn\.solid\.disabled = true; m\.takedowns\+\+;/.test(rt), 'no takedown');
  A(/'F  Knock him down'/.test(rt), 'no prompt');
  A(/speak\(w, STAFF_TALK\.police\)/.test(rt) && /rt\.fail\('The station police arrested you at Novomir Central\.'\)/.test(rt), 'no police');
  A(/if \(run\.state === 'waiting'\) \{\s+npcAlarm\(\);/.test(rt), 'the police come for you on the train');
  A(/gateNear\(\)\) return 'E  Open the gate'/.test(rt), 'his gate cannot be opened');
  // a witness sees past his own body to the one down (M6.18.2: his own solid hid it, and nobody called)
  A(/o\.solid\.person = true;/.test(rt) && /\(q\) => q\.person \|\| q\.glass/.test(rt), 'the witness is blind');
  A(/\[0\.4, 1\.3\]/.test(rt), 'him going down is not seen');
  const ins = L.npcs.filter((n) => n.kind === 'inspector'), sees = (a, b) => {
    const e = [a.pos[0], a.pos[1] + 1.6, a.pos[2]], t = [b.pos[0], b.pos[1] + 1.3, b.pos[2]], d = Math.hypot(t[0] - e[0], t[1] - e[1], t[2] - e[2]);
    return !L.world.raycast(e, [(t[0] - e[0]) / d, (t[1] - e[1]) / d, (t[2] - e[2]) / d], d - 0.3, (q) => q.person || q.glass);
  };
  A(ins.every((b) => ins.some((a) => a !== b && sees(a, b))), 'an inspector nobody can see');
});
T('a densely built city: blocks shoulder to shoulder along the streets, no gaps a building wide (Rhys: "a proper densely packed hustle-and-bustle city")', () => {
  A(L.cityBlocks >= 200, L.cityBlocks + ' blocks');
  const blocks = L.movers[0].pieces.filter((p) => p.mat === 'facade' && p.max[1] > 6);
  // along the street outside the station front, going down x: no gap over 6 m between buildings
  const con = L.concourse;
  const row = blocks.filter((b) => b.max[0] < con.x0 - 14 && b.max[0] > con.x0 - 140 && b.min[2] > -60 && b.max[2] < 60);
  A(row.length >= 20, row.length + ' blocks across the street');
});

console.log('\n-- M6.18.3 --');
T('the railway\'s people speak plain English again; only the announcer has a Severian voice (M6.18.3, Rhys: "not keen on the Russified accents... the Tannoy Announcer is perfect")', () => {
  for (const k of Object.keys(STAFF_TALK)) A(STAFF_VOICE[k].every((v) => k === 'depart' || k === 'arrive' ? v === 'sva' : /^st\d$/.test(v)), k + ': ' + STAFF_VOICE[k]);
  A(L.npcs.filter((n) => n.voice).every((n) => /^st\d$/.test(n.voice)), 'someone still has the accent');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/voice: 'sva'/.test(rt) && !/'sv[123]'/.test(rt), 'the announcer');
  A(STAFF_SAY.depart.every((t) => /[Ѐ-ӿ]{3}/.test(t) && !/[A-Za-z]/.test(t)), 'the announcement\'s spelling');
});
T('the announcement: in Severian first, then in English (Rhys)', () => {
  const d = STAFF_TALK.depart, i = d.search(/[A-Za-z]/);
  A(i > 40 && /^[^A-Za-z]*Белягорск-е/.test(d) && /Please stand clear of the doors\.$/.test(d), 'not Severian then English: ' + d);
  A(Array.isArray(STAFF_SAY.depart) && STAFF_SAY.depart.length === 2, 'not two halves');
});

T('the departures board is a dot-matrix that runs with the clock: the next trains, the 21:40 marked departing, gone once she has gone; Severian, then English (Rhys: "shouldn\'t it be a matrix board?")', () => {
  const b = L.signs.find((q) => q.board);
  A(b && b.station && b.follow, 'no board');
  const r = new TrainRun();
  let rows = departures(r, false);
  A(rows[0][0] === 'ЛАЖАХ' && rows[0][1] === '21:36', 'the clock: ' + rows[0]);
  A(/^21:40\s+БЕЛЯГОРСК$/.test(rows[1][0]) && rows[1][1].endsWith('3') && rows.length === 5, 'the 21:40 first: ' + JSON.stringify(rows));
  A(/Belyagorsk/.test(departures(r, true)[1][0]) && departures(r, true)[0][0] === 'DEPARTURES', 'no English page');
  while (r.t < RUN.departAt - 10) r.step(1, true);
  A(/LEAVING/.test(departures(r, true)[1][0]) && departures(r, false)[0][1] === '21:39', 'not marked departing: ' + JSON.stringify(departures(r, true)));
  while (r.state !== 'running') r.step(0.5, true);
  for (let i = 0; i < 200; i++) r.step(1, true);
  A(!departures(r, true).some((q) => /Belyagorsk/.test(q[0])) && /Kirova/.test(departures(r, true)[1][0]), 'she is still on it after leaving');
  const rd = readFileSync(new URL('../src/game/render.js', import.meta.url), 'utf8'), tx = readFileSync(new URL('../src/game/textures.js', import.meta.url), 'utf8');
  A(/if \(s\.board\) \{ const rows = s\.board\(\), key = JSON\.stringify\(rows\); if \(key !== s\.shown\)/.test(rd) && /export function makeMatrixSign/.test(tx), 'not drawn as a matrix');
});
T('the street ends both ways in buildings standing across it, its sides solid; the city lit by nothing but its windows (Rhys: "buildings that appear to sit IN the street")', () => {
  A(L.streetEnds && L.streetEnds.length === 2, 'no ends');
  for (const [x, z] of [[-72, -60], [-75, 73]]) {
    A(L.movers[0].pieces.some((p) => p.mat === 'facade' && p.min[0] <= x && p.max[0] >= x && p.min[2] <= z && p.max[2] >= z), 'no building at ' + x + ', ' + z);
    A(L.world.hit([x - 0.3, 0.3, z - 0.3], [x + 0.3, 1.7, z + 0.3]), 'you can walk into it at ' + x + ', ' + z);
  }
  // along the street, no way off it into the buildings
  const sp = L.world.spawn.pos;
  A(L.world.hit([sp[0] - 9, 0.3, sp[2] - 0.3], [sp[0] - 8.4, 1.7, sp[2] + 0.3]), 'through the far side of the street');
  A(!walk(L.world, [[sp[0], 0, sp[2]], [sp[0], 0, sp[2] - 40]]), 'cannot walk up the street');
  A(L.movers[0].pieces.filter((p) => p.mat === 'facade' && p.unlit).length >= 300, 'the city is lit by the lamps');
  const rd = readFileSync(new URL('../src/game/render.js', import.meta.url), 'utf8');
  A(/m\.useLighting = false;/.test(rd) && /moverChunks\(m\.pieces\)/.test(rd), 'the city costs the frame rate');
  A(L.noSunShadow === true && /lc\.castShadows = q !== 'low' && !level\.noSunShadow;/.test(rd), 'the moon casting shadows nobody sees');
  A(L.lampCap === 5 && /if \(level\.lampCap\) this\.lampBudget = Math\.min\(this\.lampBudget, level\.lampCap\);/.test(rd), 'ten lamps on every pixel (M6.18.3: ~20 fps in the train)');
});

T('the debrief names the Night Train, not the hotel (M6.18.3, Rhys\'s screenshot)', () => {
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/level\.trainRun \? 'Level 4 &middot; The Night Train'/.test(rt), 'Riverside Hotel');
});

T('you cannot walk off down the line: a fence past the platforms, the line\'s sides walled; the tunnel dark inside, not open to the sky (M6.18.3, Rhys fell off the world\'s end)', () => {
  const xe = L.lineEnd;
  A(xe && walk(L.world, [[xe - 3, 0, 0], [xe + 3, 0, 0]]) && walk(L.world, [[xe - 3, 0, -9], [xe + 3, 0, -9]]) && walk(L.world, [[xe - 3, 0, 12], [xe + 3, 0, 12]]), 'down the line past the fence');
  A(walk(L.world, [[60, 0, 17], [60, 0, 26]]) && walk(L.world, [[60, 0, -15], [60, 0, -24]]), 'off the side of the line');
  const sp = L.movers[0].pieces;
  const cap = L.movers.find((m) => m.id === 'tunnelcap');
  A(cap && cap.pieces.some((p) => p.min[0] >= 300 && p.tint[0] < 0.05 && p.max[1] >= 5.6) && cap.at()[1] === 0, 'the tunnel is open at the end');
  // (M6.18.8, Rhys: "a massive wall of concrete that phases through the train") not there once she moves
  L.trainRun.state = 'running'; A(cap.at()[1] < -100, 'the tunnel\'s end meets the train'); L.trainRun.state = 'waiting';
  // the fence leaves our line clear to draw (the train goes that way)
  A(!sp.some((p) => Math.abs(p.min[0] - xe) < 0.2 && p.min[2] < 1.6 && p.max[2] > -1.6), 'a fence drawn across our own line');
  // and the station's solids, the fence's among them, go when she leaves
  A(L.stationSolids.some((q) => q.min[0] < xe && q.max[0] > xe && q.min[2] < 0 && q.max[2] > 0), 'the fence is not the station\'s');
});
T('Severian\'s letters drawn on the board, each one its own shape - Ȍ ȍ О̏ Ъ ъ Є є Ї і Ԏ ԏ Џ џ Ѕ ѕ Ѵ ѵ Ԁ ԁ Ӧ - and in the game\'s own fonts everywhere else (M6.18.3, Rhys)', () => {
  const want = 'Ȍ ȍ О̏ Ъ ъ Є є Ї і Ԏ ԏ Џ џ Ѕ ѕ Ѵ ѵ Ԁ ԁ Ӧ ӧ'.split(' ');
  for (const w of want) {
    const L1 = matrixLetters(w);
    A(L1.length === 1 && L1[0].known, 'no shape for ' + w);
    if (/[ȌȍО̏]/.test(w)) A(L1[0].accents.length === 1 && L1[0].accents[0][0] === '#..#.', w + ' without its double grave');
    if (/[ЇӦӧ]/.test(w)) A(L1[0].accents.length === 1, w + ' without its dots');
  }
  // distinct where they should be
  const shape = (c) => matrixLetters(c)[0].rows.join('');
  for (const [a, b] of [['Ъ', 'Ь'], ['Є', 'Э'], ['Џ', 'Ц'], ['Ѵ', 'V'], ['Ԁ', 'D'], ['Ԏ', 'T'], ['Є', 'E']]) A(shape(a) !== shape(b), a + ' looks like ' + b);
  // every letter the board shows has a shape
  const r = new TrainRun();
  for (const en of [false, true]) for (const row of departures(r, en)) for (const t of row) A(matrixLetters(t).every((l) => l.known), 'no shape in: ' + t);
  // the fonts: in the game, declared, and used by the signs, the subtitles and the paper
  for (const f of ['NotoSans-Regular', 'NotoSans-Bold', 'NotoSans-CondensedBold', 'NotoSerif-Regular', 'NotoSerif-Bold']) A(existsSync(new URL('../assets/fonts/' + f + '.woff2', import.meta.url)), 'no font ' + f);
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8'), tx = readFileSync(new URL('../src/game/textures.js', import.meta.url), 'utf8'), rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8'), main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/@font-face \{ font-family: 'Severia Sans Condensed'; src: url\('assets\/fonts\/NotoSans-CondensedBold\.woff2'\)/.test(html) && /Arial, 'Severia Sans', sans-serif/.test(html), 'not declared');
  A(/bold \$\{size\}px 'Severia Sans Condensed'/.test(tx) && /font-family:\\'Severia Serif\\'/.test(rt), 'the signs or the paper not in them');
  A(/document\.fonts\.load\(f/.test(main), 'the signs are drawn before the fonts come');
  A(/said = '<span class="sev">' \+ said \+ '<\/span>'/.test(rt) && /\.sev \{ font-family: 'Severia Sans'/.test(html), 'subtitles in Severian set in a font without its accents');
});

console.log('\n-- M6.18.5 --');
T('E sits you in the free seat nearest you - in Coach 3\'s seating only, not by its doors nor in Coach 4 (M6.18.6); a tie goes to port (left, going forward); again whenever you stand, until the hijack (Rhys)', () => {
  const C = carriages().find((c) => c.id === 'C'), D = carriages().find((c) => c.id === 'D');
  const inC = L.seats.filter((q) => q.coach === 'C');
  A(inC.length >= 60, inC.length + ' seats');
  for (const q of inC) A(inCoach(q.pos, 'C') && clear(L.world, q.back), 'a seat with nowhere to stand: ' + q.pos);
  for (const q of inC.filter((_, i) => i % 7 === 0)) {
    const at = [q.pos[0] + (q.yaw < 0 ? 0.3 : -0.3), FLOOR, q.pos[2] * 0.9];
    A(nearestSeat(L.seats, at) === q, 'not the nearest seat at ' + at.map((v) => v.toFixed(2)));
  }
  const row = inC.find((q) => q.side === 'port' && q.where === 'aisle'), mid = [row.pos[0], FLOOR, 0];
  const pick = nearestSeat(L.seats, mid);
  A(pick.side === 'port' && pick.where === 'aisle', 'a tie went ' + pick.side);
  row.taken = true; A(nearestSeat(L.seats, mid) !== row, 'sat on someone'); row.taken = false;
  // (M6.18.6, Rhys: "it should only force seating if you're in Coach 3 AND in the seating aisle - NOT next to the doors")
  A(!nearestSeat(L.seats, [D.x0 + 8, FLOOR, 0]), 'Coach 4 sits you down');
  for (const x of [C.x0 + 1, C.x0 + 2, C.x1 - 1, C.x1 - 2]) A(!nearestSeat(L.seats, [x, FLOOR, 0]), 'by the doors at ' + (x - C.x0).toFixed(1));
  A(nearestSeat(L.seats, [C.x0 + 3, FLOOR, 0]), 'not in the seating');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/if \(level\.trainRun && \(!level\.hijacked \|\| level\.hijack\.done\) && !player\.seated && nearestSeat\(level\.seats, player\.pos, level\.hijacked \? \['C', 'D'\] : null\) && player\.mode === 'walk'\)/.test(rt) && /'E  Sit down'/.test(rt), 'cannot sit again once moving');
  A(/const seat = level\.trainRun && \(!level\.hijacked \|\| level\.hijack\.done\) && !player\.seated && player\.mode === 'walk' \? nearestSeat\(level\.seats, player\.pos, level\.hijacked \? \['C', 'D'\] : null\)/.test(rt), 'E does not sit you again once moving');
  A(L.hijacked === false, 'no hijack flag');
});
T('no red bar across the doorways: the band stops either side of each door (Rhys)', () => {
  const C = carriages().find((c) => c.id === 'C');
  const band = L.pieces.filter((p) => p.tint && p.tint[0] === 0.8 && p.tint[1] === 0.12 && p.min[1] === 1.55 && p.min[2] >= CAR.half - 0.01);
  for (const [d0, d1] of doorSpans(C)) A(!band.some((b) => b.min[0] < d1 - 0.01 && b.max[0] > d0 + 0.01), 'a band across the door at ' + d0);
  A(band.some((b) => b.min[0] >= C.x0 - 0.01 && b.max[0] <= C.x1 + 0.01), 'no band at all');
});
T('one body for the whole train: every vehicle roofed with the same rounded section, the nose lofted from it at the cab - not a box with a beak (Rhys)', () => {
  const cs = carriages();
  for (const c of cs) A(L.pieces.some((p) => p.quads && Math.abs(p.min[0] - c.x0) < 1e-6 && Math.abs(p.max[0] - c.x1) < 1e-6 && p.max[1] > CAR.roof + 0.2), 'no rounded roof on ' + c.id);
  const loco = cs[cs.length - 1], body = L.pieces.find((p) => p.nosePart === 'body');
  // at the cab the nose's section is the body's: full width, floor to crown
  const base = body.quads.flatMap((q) => q.v).filter((v) => v[0] < loco.x1 + 0.01);
  const span = (k) => Math.max(...base.map((v) => v[k])) - Math.min(...base.map((v) => v[k]));
  A(span(2) > CAR.half * 2 - 0.05 && Math.max(...base.map((v) => v[1])) > BODY.top - 0.05 && Math.min(...base.map((v) => v[1])) < BODY.bottom + 0.05, 'the nose does not start as the body: ' + span(2).toFixed(2));
  // the roof rakes down through the windscreen: lower and lower to the tip
  let last = Infinity;
  for (const t of [0, 0.2, 0.4, 0.6, 0.8, 0.95]) { const f = NOSE.at(t); A(f.top < last + 1e-9 && f.w <= CAR.half + 1e-9, 'it rises again at ' + t); last = f.top; }
  A(['body', 'band', 'warn', 'glass'].every((k) => L.nose.parts[k] > 0), 'its parts: ' + JSON.stringify(L.nose.parts));
});

console.log('\n-- M6.18.6 --');
T('the journey ends: about 18 minutes from 21:40, the announcement (Severian, then English) as it nears, braking, and to a stop at Belyagorsk - Alyejka Azvestya (Rhys: "15-20 mins feels reasonable")', () => {
  const r = new TrainRun(), ev = [];
  r.t = RUN.departAt - 1;
  for (let i = 0; i < 30000 && r.state !== 'arrived'; i++) { r.step(0.1, true); for (const e of r.events) ev.push([e.type, r.t, r.dist, r.speed]); r.events.length = 0; }
  const mins = (r.t - RUN.departAt) / 60;
  A(r.state === 'arrived' && r.dist === RUN.arrive && r.speed === 0 && mins > 15 && mins < 20, r.state + ' after ' + mins.toFixed(1) + ' min');
  A(ev.map((e) => e[0]).join(',') === 'warn,close,depart,approach,brake,arrive', ev.map((e) => e[0]));
  const ap = ev.find((e) => e[0] === 'approach'), ar = ev.find((e) => e[0] === 'arrive');
  A(ar[1] - ap[1] > 45 && ar[1] - ap[1] < 150, 'announced ' + (ar[1] - ap[1]).toFixed(0) + ' s before');
  A(/^лаксъскава Белягорск - Алєйка Азвестя/.test(STAFF_TALK.arrive) && /where this train terminates/.test(STAFF_TALK.arrive) && STAFF_VOICE.arrive[0] === 'sva', 'the announcement');
  const id = SPOKEN[STAFF_TALK.arrive];
  A(id && existsSync(new URL('../assets/voices/spoken_sva_' + id + '.mp3', import.meta.url)) && SPOKEN_SETS.pa.includes(id), 'not recorded');
  // ?express: the same journey, eight times as quick
  const x = new TrainRun(); x.express = 8; x.t = RUN.departAt - 1;
  for (let i = 0; i < 30000 && x.state !== 'arrived'; i++) { x.step(0.1, true); x.events.length = 0; }
  A(x.state === 'arrived' && (x.t - RUN.departAt) / 60 < 4, 'express: ' + ((x.t - RUN.departAt) / 60).toFixed(1));
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/buildTrain\(\{ express: \/\[\?&\]express\\b\/\.test\(location\.search\) \}\)/.test(main), 'no ?express');
});
T('Belyagorsk: its platform on the doors\' side, under a canopy, its name in Cyrillic and English; there only as you come in (solid only once in); the armed police along it, facing the train', () => {
  const A1 = L.arrival, cs = carriages();
  A(A1 && A1.x0 < cs[0].x0 && A1.x1 > cs[cs.length - 1].x1 && A1.z0 > CAR.half && A1.z0 < CAR.half + 0.3, 'the platform');
  A(L.signs.filter((q) => q.arrival && q.text === TERMINUS.sev && q.sub === TERMINUS.en).length >= 4, 'its name');
  const run = L.trainRun, mv = L.movers.find((m) => m.id === 'arrival');
  run.dist = 0; A(mv.at()[1] < -100, 'there from the start');
  run.dist = RUN.arrive - 500; A(mv.at()[0] === 500 && mv.at()[1] === 0, 'not sliding in');
  run.dist = RUN.arrive; A(mv.at()[0] === 0, 'not where it stops');
  run.dist = 0;
  A(L.arrivalSolids.length && L.arrivalSolids.every((q) => q.disabled), 'solid before you are there');
  // with its solids on: from each coach's door, out onto the platform
  for (const q of L.arrivalSolids) q.disabled = false;
  for (const d of L.trainDoors.spans) d.solid.disabled = true;
  const C = cs.find((c) => c.id === 'C'), dx = (doorSpans(C)[0][0] + doorSpans(C)[0][1]) / 2;
  const blocked = walk(L.world, [[dx, FLOOR, 0], [dx, FLOOR, 2.2], [dx, FLOOR, 5]]);
  for (const q of L.arrivalSolids) q.disabled = true;
  A(!blocked, 'cannot step off: ' + (blocked && blocked.map((v) => v.toFixed(1))));
  const police = L.npcs.filter((n) => n.kind === 'police');
  A(police.length >= 6 && police.every((n) => n.pos[2] > A1.z0 && n.pos[2] < A1.z1 && Math.abs(n.yaw) < 1e-9 && n.follow && n.arrival), 'the police');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/if \(e\.type === 'arrive'\) \{\s+level\.trainDoors\.hidden = true;/.test(rt) && /for \(const sld of level\.arrivalSolids \|\| \[\]\) sld\.disabled = false;/.test(rt), 'the doors do not open');
  A(/run\.state === 'arrived' && A && !m\.done && player\.mode === 'walk' && !inTrain\(player\.pos\) && player\.pos\[2\] > A\.z0/.test(rt) && /rt\.endHotel\(outcome\(\)\)/.test(rt), 'stepping off does not end it');
  A(/n\.kind !== 'police' &&/.test(rt), 'the police are to be talked to / knocked down');
  A(/for \(const n of npcs\) if \(!n\.arrival\) n\.solid\.disabled = true;/.test(rt), 'Novomir\'s inspectors stand invisible on the platform at Belyagorsk');
});
T('the debrief: in at Belyagorsk is a success; no trophy for the time (Rhys: "timing the player feels a little unfair"); the clock stays', () => {
  const o = RULES.train.outcome({ run: { state: 'arrived', boarded: true, dist: RUN.arrive } });
  A(o.arrived && RULES.train.grade(o) === 'success' && RULES.train.lines(o).every((l) => l.ok), 'not a success');
  const mid = RULES.train.outcome({ run: { state: 'braking', boarded: true, dist: 30000 } });
  A(RULES.train.grade(mid) === 'partial' && /30 km of 31/.test(RULES.train.lines(mid)[1].text), 'on the way');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/level\.trainRun \? \[\] :/.test(rt), 'a trophy for the train');
});
T('the nose is solid - you cannot stand inside it (Rhys) - and the cab still sees out over it', () => {
  const loco = carriages()[carriages().length - 1];
  for (const t of [0.1, 0.3, 0.5, 0.7]) {
    const x = loco.x1 + t * NOSE.len;
    A(L.world.hit([x - 0.3, 0.3, -0.3], [x + 0.3, 1.7, 0.3]), 'room to stand in the nose at ' + t);
  }
});

T('a frame rate held low brings the drawing resolution down a step at a time - High no lower than 0.8 of a pixel - and never up and down (Rhys: "massive frame-rate drop from Low to High")', () => {
  const r = new ResScaler(); r.reset(1.5, 0.8);
  const run = (fps, n) => { let last = null; for (let i = 0; i < n; i++) { const v = r.sample(fps); if (v !== null) last = v; } return last; };
  A(run(60, 20) === null && r.ratio === 1.5, 'came down at 60 fps');
  A(run(40, 3) === null && run(40, 1) === 1.4, 'not after two seconds low');
  run(30, 100); A(r.ratio === 0.8, 'past the floor: ' + r.ratio);
  run(60, 100); A(r.ratio === 0.8, 'climbed back');
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8'), rd = readFileSync(new URL('../src/game/render.js', import.meta.url), 'utf8');
  A(/const r = resScaler\.sample\(S\.fps\); if \(r !== null\) app\.graphicsDevice\.maxPixelRatio = r;/.test(main) && /this\.ratioFloor = q === 'low' \? 0\.75 : Math\.min\(this\.ratioCap, 0\.8\);/.test(rd), 'not in the game');
});

console.log('\n-- M6.18.7: THE HIJACK --');
const H7 = () => {
  const L7 = buildTrain(), nav = new NavGrid(L7.world, L7.navFloors, L7.navLinks), DT = 1 / 60;
  for (const sd of L7.stationSolids) sd.disabled = true;                 // (under way: the station gone)
  const youAt = (pos) => ({ pos, eye: [pos[0], pos[1] + 1.66, pos[2]], chest: [pos[0], pos[1] + 1.0, pos[2]], stance: 0, speed: 0, noise: 0,
    box: [[pos[0] - 0.32, pos[1], pos[2] - 0.32], [pos[0] + 0.32, pos[1] + 1.8, pos[2] + 0.32]] });
  const ctx = (you) => ({ world: L7.world, nav, guards: L7.guards, doors: L7.swingDoors, noises: [], random: Math.random, bark: () => {}, alarm: () => {}, you });
  const wake = () => { for (const g of L7.hijackers) { g.dormant = false; g.target.solid.disabled = false; } };
  return { L7, nav, DT, youAt, ctx, wake };
};
T('six of them, the Front of Memory, in grey: two in the locomotive, two in first class over the Minister, one in the buffet, one in the van - not there at all until the hijack (Rhys: "6 hijackers")', () => {
  const hs = L.hijackers, cs = carriages();
  A(hs.length === HIJACK.total && hs.every((g) => g.side === 'front' && g.faction === 'red' && g.dormant && g.target.solid.disabled), 'the six');
  const where = (g) => cs.find((c) => g.pos[0] > c.x0 && g.pos[0] < c.x1).id;
  A(hs.map(where).sort().join(',') === 'A,A,B,loco,loco,van', hs.map(where));
  A(hs.filter((g) => g.holds).every((g) => where(g) === 'A') && hs.filter((g) => g.holds).length === 2, 'who holds the Minister');
  for (const g of hs) A(clear(L.world, g.pos), g.id + ' stands in something');
  const mn = L.npcs.find((n) => n.kind === 'minister'), tg = L.npcs.find((n) => n.kind === 'trainguard');
  A(mn && inCoach(mn.pos, 'A') && mn.onTrain && tg && inCoach(tg.pos, 'van') && tg.onTrain, 'the Minister and the guard');
  A(!hs[0].canBeTakenDown([hs[0].pos[0] - 1, FLOOR, hs[0].pos[2]], L.world), 'a dormant one can be taken down');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/if \(g\.dormant\) continue;/.test(rt) && /const visible = shown\[i\] && !g\.dormant;/.test(rt), 'drawn or moving before the hijack');
  A(/t\.guard && t\.guard\.dormant/.test(readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8')), 'on the radar before the hijack');
});
T('the hijack comes just out of the city tunnel, about two minutes in (Rhys); the Front\'s man on the tannoy; your seat no longer yours; the cab door locked (M6.18.8: they lock themselves in); none appears in front of your eyes', () => {
  const r = new TrainRun(); r.t = RUN.departAt - 1;
  while (r.dist < HIJACK.at) { r.step(0.1, true); r.events.length = 0; }
  const mins = (r.t - RUN.departAt) / 60;
  A(mins > 1.4 && mins < 2.4 && sectionAt(HIJACK.at - 1) === 'tunnel' && sectionAt(HIJACK.at + 1) === 'country', 'at ' + mins.toFixed(2) + ' min');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/if \(level\.hijackers && !level\.hijacked && run\.moving && run\.dist >= HIJACK\.at\) hijackNow\(\);/.test(rt), 'no trigger');
  A(/level\.hijacked = true;[^]*?for \(const g of level\.hijackers\) \{ if \(seenByYou\(g\)\) g\.wakeLater = true; else wakeHijacker\(g\); \}/.test(rt) && /if \(cab\) \{ cab\.set\(false, 1\); cab\.locked = true;/.test(rt) && /if \(player\.seated\) player\.stand\(\);/.test(rt) && /speak\(frontPA, HIJACK_TALK\.hijack\)/.test(rt), 'the hijack');
  for (const [k, t] of Object.entries(HIJACK_TALK)) for (const v of HIJACK_VOICE[k]) {
    const id = SPOKEN[t]; A(id && existsSync(new URL('../assets/voices/spoken_' + v + '_' + id + '.mp3', import.meta.url)) && SPOKEN_SETS[setOfVoice(v)].includes(id), 'not recorded: ' + k);
  }
});
T('in the train they patrol, see you, and come for you - through the gangways (their paths found coach to coach)', () => {
  const S = H7(); S.wake();
  const cs = carriages(), C = cs.find((c) => c.id === 'C');
  // every one of them can reach Coach 3's aisle
  for (const g of S.L7.hijackers) { const p = S.nav.find(g.pos, [C.x0 + 6, FLOOR, 0.05]); A(p && p.length, g.id + ' has no way to Coach 3'); }
  // the buffet's man walks his beat
  const b = S.L7.hijackers.find((g) => g.id === 'fm_buffet'), x0 = b.pos[0];
  let far = 0;
  for (let i = 0; i < 60 * 25; i++) { b.step(S.DT, S.ctx(null)); far = Math.max(far, b.pos[0] - x0); }
  A(far > 10 && inTrain(b.pos), 'he did not walk the buffet: ' + far.toFixed(1));
  // stand in his way, in plain sight: he sees you and fights
  const S2 = H7(); S2.wake(); const b2 = S2.L7.hijackers.find((g) => g.id === 'fm_buffet');
  const you = S2.youAt([b2.pos[0] + 5, FLOOR, 0.05]);
  for (let i = 0; i < 60 * 4; i++) { b2.step(S2.DT, S2.ctx(you)); b2.events.length = 0; }
  A(b2.state === 'alert', 'he did not see you: ' + b2.state);
  // the van's man, his back to you as you come in from Coach 4: yours to take down
  const v = S2.L7.hijackers.find((g) => g.id === 'fm_van');
  A(v.canBeTakenDown([v.pos[0] + 1.0, FLOOR, v.pos[2]], S2.L7.world), 'the van\'s man cannot be taken from behind');
});
T('the Minister: held by the two in first class; a fight there burns a short fuse; at Belyagorsk they kill him if still standing - a partial result, and the story branches (Rhys)', () => {
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/const holders = \(\) => \(level\.hijackers \|\| \[\]\)\.filter\(\(g\) => g\.holds && !g\.dead && !g\.dormant\);/.test(rt), 'holders');
  A(/if \(H\.fuse > HIJACK\.fuse\) killMinister\(/.test(rt) && HIJACK.fuse > 5 && HIJACK.fuse < 30, 'the fuse');
  A(/if \(level\.hijacked && level\.hijack\.minister === 'alive' && holders\(\)\.length\) killMinister\(/.test(rt), 'killed at Belyagorsk');
  const base = { run: { state: 'arrived', boarded: true, dist: RUN.arrive } };
  const alive = RULES.train.outcome(Object.assign({ hijack: { happened: true, down: 6, total: 6, minister: 'alive' } }, base));
  const dead = RULES.train.outcome(Object.assign({ hijack: { happened: true, down: 2, total: 6, minister: 'dead' } }, base));
  A(RULES.train.grade(alive) === 'success' && alive.front === 'rooted out', 'protected: ' + RULES.train.grade(alive));
  A(RULES.train.grade(dead) === 'partial' && dead.front === 'holds Belyagorsk', 'killed: ' + RULES.train.grade(dead));
  A(RULES.train.lines(dead).some((l) => /Minister Dravets — killed/.test(l.text)) && RULES.train.lines(alive).some((l) => /6 of 6 down/.test(l.text) && l.ok), 'the debrief lines');
});
T('the guard: trusts you once he has seen you take one of them down; "help me take this train back"; his sidearm only if you have no weapon; then he fights beside you (M6.18.8, Rhys)', () => {
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/if \(!H\.trust\) \{ speak\(n, HIJACK_TALK\.guardAsk\); return; \}/.test(rt) && /H\.asked = true; speak\(n, HIJACK_TALK\.guardTrust\);/.test(rt), 'trust first');
  A(/armed = !!\(lo && \(lo\.slots\.primary \|\| lo\.slots\.backup\)\);\s+if \(!armed\) \{\s+H\.gave = true; speak\(n, HIJACK_TALK\.guardGive\);\s+dropAt\(ARMS\.pistol\.item/.test(rt), 'the pistol to an armed man (Rhys: "no point him giving you a weapon if you\'ve just picked one up")');
  A(/joinGuard\(n\);/.test(rt) && /g\.escort = \{ lead: true, lag: 2\.2 \};/.test(rt), 'he does not come with you');
  A(/if \(tg && !tg\.down && \(g\.id === 'fm_van' \|\| seesNpc\(tg, g\)\)\)/.test(rt), 'trust');
  // the ally: on your side and theirs against him; not in your casualties
  const g = L.allyGuard;
  A(g && g.faction === 'ally' && g.dormant && L.relations.ally.red && L.relations.ally.you === false && L.relations.red.ally && L.relations.red.you, 'the sides');
  A(/if \(g\.side === 'ally'\) \{[^}]*level\.hijack\.guardKilledByYou = true;/.test(rt) && /continue;\s+\}/.test(rt), 'counted as yours');
  A(/const radio = \(key, once\) => \{\s+if \(level\.offDuty\) return;/.test(rt) && /const control = \(text\) => \{\s+if \(level\.offDuty\) return;/.test(rt) && /const intercept = \(key\) => level\.offDuty \? null/.test(rt) && L.offDuty, 'Control on the radio, off duty (Rhys)');
  // (M6.18.8) the van's man does not fight the guard before the guard has joined you (he was going for him)
  { const S = H7(); S.wake(); const v = S.L7.hijackers.find((h) => h.id === 'fm_van');
    for (let i = 0; i < 60 * 4; i++) { v.step(S.DT, S.ctx(null)); v.events.length = 0; }
    const S2 = H7(); S2.wake();
    const v2 = S2.L7.hijackers.find((h) => h.id === 'fm_van');
    const f = pickFoe(v2, null, S2.L7.guards, S2.L7.relations, S2.ctx(null), 1 / 60);
    A(!f, 'he goes for the guard still at his desk'); }
  // and he can follow you from his van to Coach 3
  const S = H7(), a = S.L7.allyGuard; a.dormant = false; a.target.solid.disabled = false; a.escort = { lead: true, lag: 2.2 };
  const C = carriages().find((c) => c.id === 'C'), lead = [C.x0 + 6, FLOOR, 0.05];
  const c = Object.assign(S.ctx(null), { lead });
  for (let i = 0; i < 60 * 40; i++) a.step(S.DT, c);
  A(Math.hypot(a.pos[0] - lead[0], a.pos[2] - lead[2]) < 4, 'he did not keep up: ' + a.pos.map((v) => v.toFixed(1)));
});
T('the Minister talks; the buffet has its steward (tea, a sandwich) who hides once it starts (Rhys)', () => {
  const st = L.npcs.find((n) => n.kind === 'steward');
  A(st && inCoach(st.pos, 'B') && clear(L.world, st.pos), 'no steward');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/speak\(n, !level\.hijacked \? HIJACK_TALK\.minPre : level\.hijack\.minister === 'alive' && holders\(\)\.length \? HIJACK_TALK\.minHeld : HIJACK_TALK\.minSaved\)/.test(rt), 'the Minister');
  A(/'A tea, please\.  \(' \+ PRICES\.tea/.test(rt) && /if \(level\.hijacked\) \{ speak\(n, HIJACK_TALK\.stewHide\); return; \}/.test(rt), 'the buffet');
});
T('Belyagorsk in so many minutes counts down with the clock, minute for minute (Rhys: "how can one minute contain four different minutes?")', () => {
  const r = new TrainRun(); r.t = RUN.departAt - 30;
  const arrive = r.t + r.eta();
  let worst = 0;
  for (let i = 0; i < 30000 && r.state !== 'arrived'; i++) { r.step(0.1, true); r.events.length = 0; worst = Math.max(worst, Math.abs(r.t + r.eta() - arrive)); }
  A(r.state === 'arrived' && Math.abs(r.t - arrive) < 2 && worst < 3, 'the estimate wanders by ' + worst.toFixed(1) + ' s');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/const mins = Math\.max\(1, Math\.ceil\(run\.eta\(\) \/ 60\)\);/.test(rt), 'the top line guesses');
});
T('the announcements fit the screen: long lines wrap, Severian over English (Rhys: "the subtitles run over the screen-edge")', () => {
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8'), rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(!/#bark \{[^}]*white-space: nowrap/.test(html) && /max-width: min\(900px, 88vw\)/.test(html), 'still one long line');
  A(/said = said\.replace\(' \\u2014 ', '<br>'\);/.test(rt), 'not two lines');
});

console.log('\n-- M6.18.9 --');
T('the seats: a cushion just over a step high, nothing to climb - you walk the aisle, not along the seats (Rhys)', () => {
  const C = carriages().find((c) => c.id === 'C');
  const seats = L.pieces.filter((p) => p.mat === 'paint' && p.min[0] > C.x0 && p.max[0] < C.x1 && p.min[1] === FLOOR && p.max[1] - p.min[1] < 0.5 && p.max[1] - p.min[1] > 0.4);
  A(seats.length >= 30 && seats.every((p) => p.max[1] - FLOOR > 0.45 + 0.02), 'a step onto a seat: ' + (seats[0] && (seats[0].max[1] - FLOOR)));
  // from the aisle, walking sideways into a row: you stay on the floor
  const p = new Player(L.world), DT = 1 / 60, row = L.seats.find((q) => q.coach === 'C');
  p.pos = [row.pos[0], FLOOR, 0]; for (let i = 0; i < 20; i++) p.step(DT, Object.assign(blankInput(), { yaw: 0 }));
  for (let i = 0; i < 90; i++) p.step(DT, Object.assign(blankInput(), { yaw: 0, moveZ: 1, sprint: true }));     // yaw 0: towards -z, the port seats
  A(p.pos[1] < FLOOR + 0.05, 'up on the seats: ' + p.pos.map((v) => v.toFixed(2)));
  const w = L.world.solids.find((q) => Math.abs(q.max[1] - (FLOOR + 0.48)) < 1e-6 && q.min[0] > C.x0 && q.max[0] < C.x1);
  A(w && w.noClimb, 'a seat to climb');
});
T('the buffet and the kiosk are paid for, from your own money; the steward\'s sandwiches run out; coffee, tea and food keep you going, they do not heal (Rhys)', () => {
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/const PRICES = \{ coffee: 15, tea: 12, sandwich: 30, paper: 40 \};/.test(rt) && /if \(rt\.grosh < n\) \{ showHint\('Not enough money on you\.'\); return false; \}/.test(rt), 'free');
  A(/rt\.sandwiches--; speak\(n, rt\.sandwiches \? HIJACK_TALK\.stewSandwichOne : HIJACK_TALK\.stewSandwich\);/.test(rt) && /if \(!rt\.sandwiches\) \{ speak\(n, HIJACK_TALK\.stewSoldOut\); return; \}/.test(rt), 'the last one, every time');
  A(!/player\.health = 100;/.test(rt), 'still healing');
  // the buffs, in the player: a coffee - stamina lasts and returns; fed - mending sooner and quicker
  const run = (buff) => { const p = new Player(L.world); p.pos = [carriages()[2].x0 + 6, FLOOR, 0]; if (buff) p.buffs = { awake: buff === 'awake' ? 600 : 0, fed: buff === 'fed' ? 600 : 0 };
    for (let i = 0; i < 60 * 3; i++) p.step(1 / 60, Object.assign(blankInput(), { yaw: Math.PI / 2, moveZ: 1, sprint: true })); return p; };
  A(run('awake').stamina > run(null).stamina + 5, 'a coffee does nothing');
  const hurt = (buff) => { const p = new Player(L.world); p.pos = [carriages()[2].x0 + 6, FLOOR, 0]; p.buffs = { awake: 0, fed: buff ? 600 : 0 }; p.hurt ? p.hurt(40) : (p.health = 60, p.sinceDamage = 0);
    for (let i = 0; i < 60 * 6; i++) p.step(1 / 60, blankInput()); return p.health; };
  A(hurt(true) > hurt(false) + 5, 'fed mends no quicker: ' + hurt(true) + ' / ' + hurt(false));
  for (const k of ['stewSandwichOne', 'stewSoldOut']) A(existsSync(new URL('../assets/voices/spoken_st6_' + SPOKEN[HIJACK_TALK[k]] + '.mp3', import.meta.url)), 'not recorded: ' + k);
});
T('the Minister: the fuse burns only for a fight in first class itself, and the two over him hold their ground (Rhys: "the Minister died before there was anything I could do")', () => {
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/fighting = hs\.some\(\(g\) => g\.state === 'alert' && \(g\.seeing \|\| inA\(player\.pos\) \|\| \(ally && !ally\.dormant && !ally\.dead && inA\(ally\.pos\)\)\)\);/.test(rt), 'any alarm on the train');
  A(L.hijackers.filter((g) => g.holds).every((g) => g.temper === 'steady'), 'they run to the shouting');
  A(HIJACK.fuse >= 15, 'the fuse');
});
T('the guard: yours to kill only by accident - not a takedown target - and his death by your hand is on the debrief, no clean success; no Yellows shouted on the train', () => {
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/if \(g\.side === 'ally' \|\| !g\.canBeTakenDown/.test(rt), 'the guard can be taken down');
  const o = RULES.train.outcome({ run: { state: 'arrived', boarded: true, dist: RUN.arrive }, hijack: { happened: true, down: 6, total: 6, minister: 'alive', guardKilled: true } });
  A(RULES.train.grade(o) === 'partial' && RULES.train.lines(o).some((l) => /guard \u2014 killed by you/.test(l.text) && !l.ok), 'no consequence');
  A(/const foeSide = level\.trainRun \? 'none'/.test(rt) && /misnames\(text\)/.test(rt), 'Yellows on the train');      // (M6.19.6: one rule now for every side's name)
  A(L.signs.some((q) => q.text === '5') && !L.signs.some((q) => q.text === '\u0411'), 'the van is Б');
});

T('the nose from its cab: the hood ahead laid again inside, its faces turned in (lit as the outside), the windscreen opaque from outside (Rhys: "what\'s going on with the nose now?")', () => {
  const inner = L.pieces.filter((p) => /Inner$/.test(p.nosePart || ''));
  A(inner.length && inner.every((p) => p.quads.every((q) => q.inward)), 'no hood seen from the cab');
  // (M6.18.10, Rhys: "still looks weird from inside the driver's cab") the hollow under the glass closed: a deck
  // at the window's sill, inside the shell; and the shell's walls above it laid inside too (no track seen through)
  const deck = L.pieces.find((p) => p.nosePart === 'deck');
  A(deck && deck.quads.length > 5 && deck.quads.every((q) => q.v.every((v) => Math.abs(v[1] - NOSE.glass[0]) < 1e-9 && Math.abs(v[2]) <= NOSE.at((v[0] - L.nose.x0) / NOSE.len).w + 1e-6)), 'no deck under the glass');
  A(inner.some((p) => p.quads.some((q) => Math.abs(q.n[2]) > 0.8 && q.n[1] < 0.15 && (q.v[0][0] - L.nose.x0) / NOSE.len < NOSE.deckTo)), 'the sides seen through from the cab');
  const glass = L.pieces.find((p) => p.nosePart === 'glass');
  A(glass && glass.mat === 'paint' && glass.tint[0] < 0.1 && !L.pieces.some((p) => p.twoSided), 'the windscreen shows the hollow inside');
  const rd = readFileSync(new URL('../src/game/render.js', import.meta.url), 'utf8');
  A(/const fwd = \(cr\[0\] \* n\[0\] \+ cr\[1\] \* n\[1\] \+ cr\[2\] \* n\[2\] >= 0\) !== !!q\.inward;/.test(rd), 'inward faces not wound inward');
});

console.log('\n-- M6.18.10 --');
T('the six down, the rest of the journey passes: on at top speed to just short of Belyagorsk\'s announcement, the clock moved on to match (Rhys: "waiting around for 18 mins is going to feel like AGES")', () => {
  const r = new TrainRun(); r.t = RUN.departAt - 1; const ev = [];
  for (let i = 0; i < 400 && r.dist < 6000; i++) { r.step(0.5, true); ev.push(...r.events.splice(0)); }
  A(r.state === 'running' && Math.abs(r.speed - RUN.top) < 0.01, 'not at top speed: ' + r.speed);
  const eta0 = r.eta(), t0 = r.t, gone = r.skipAhead();
  A(gone > 600 && Math.abs(r.t - t0 - gone) < 1e-6, 'skipped ' + gone);
  A(Math.abs(r.eta() - (eta0 - gone)) < 1, 'the minutes do not add up: ' + eta0 + ' - ' + gone + ' vs ' + r.eta());
  A(r.left > RUN.approach + 100 && !r.approached, 'skipped past the announcement');
  A(r.skipAhead() === 0, 'skips twice');
  for (let i = 0; i < 2000 && r.state !== 'arrived'; i++) { r.step(0.5, true); ev.push(...r.events.splice(0)); }
  A(r.state === 'arrived' && ev.some((e) => e.type === 'approach') && ev.some((e) => e.type === 'brake'), 'no arrival after it');
  const w = new TrainRun(); A(w.skipAhead() === 0 && w.dist === 0, 'skips at the platform');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/if \(H\.done && !H\.skipped && !rt\.skip\) \{ H\.rest \+= dt; if \(H\.rest >= HIJACK\.rest\) startSkip\(\); \}/.test(rt), 'never passes unless you sit');
  A(/if \(level\.hijacked && startSkip\(\)\)/.test(rt) && /Take a seat \(E\): the rest of the journey can pass/.test(rt), 'sitting down does not pass it');
  A(/run\.skipAhead\(\);/.test(rt) && /getElementById\('fade'\)/.test(rt) && /if \(rt\.skip\) skipTick\(dt\);/.test(rt), 'no fade');
  A(HIJACK.rest >= 30 && HIJACK.rest <= 90, 'the wait');
  const d = L.seats.find((q) => q.coach === 'D');
  A(!nearestSeat(L.seats, [d.pos[0], FLOOR, 0]) && nearestSeat(L.seats, [d.pos[0], FLOOR, 0], ['C', 'D']).coach === 'D', 'Coach 4\'s seats, once it is over');
});
T('the guard calls for help on the tannoy from his van - and is cut off; the radar points to the van until he is with you (Rhys: "something should happen that *causes* you to want to head to the Guard\'s Van first")', () => {
  A(HIJACK.call > 10 && HIJACK.call < 40, 'when');
  // (M6.18.11, Rhys: a hostage "wouldn't make an announcement like that") calm - comply, no heroes - and coded
  A(/comply/.test(HIJACK_TALK.guardPA) && /hero/.test(HIJACK_TALK.guardPA) && /Inspector Pesak please come to the guard's van/.test(HIJACK_TALK.guardPA) && !/got me|please -$/.test(HIJACK_TALK.guardPA), 'the line');
  A(HIJACK_VOICE.guardPA[0] === 'gpa' && setOfVoice('gpa') && SPOKEN_SETS[setOfVoice('gpa')].includes(SPOKEN[HIJACK_TALK.guardPA]), 'not in its set');
  A(existsSync(new URL('../assets/voices/spoken_gpa_' + SPOKEN[HIJACK_TALK.guardPA] + '.mp3', import.meta.url)), 'not recorded');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/if \(!\(tg && !tg\.down && !H\.trust && !H\.joined && vanMan && !vanMan\.dead && !near\) \|\| H\.since > HIJACK\.call \+ 30\) H\.called = 'no';\s*else if \(speak\(guardPA, HIJACK_TALK\.guardPA\)\) \{/.test(rt), 'the call');
  A(/There is no Inspector Pesak - it is the railway\\'s call for help/.test(rt) && !/audio\.shot\(\{ family: 'pistol' \}, 0\.35\)/.test(rt), 'the code not explained, or still shot');
  A(/level\.hijack\.called === true && !level\.hijack\.joined && !level\.hijack\.done\) \{\s*const tg = npcs\.find\(\(n\) => n\.kind === 'trainguard' && !n\.down && !n\.gone\);\s*if \(tg\) return \[tg\.pos\[0\], tg\.pos\[2\]\];/.test(rt), 'the radar');
  A(L.hijack.since === 0 && L.hijack.called === false, 'state');
});
T('the van\'s crates are the railway\'s parcels for Belyagorsk, not Ghost Logistics (Rhys: "nothing to do with Ghost")', () => {
  const parcels = L.pieces.filter((p) => p.mat === 'parcel');
  A(parcels.length >= 2, 'no parcels');
  const tx = readFileSync(new URL('../src/game/textures.js', import.meta.url), 'utf8');
  const body = tx.slice(tx.indexOf('  parcel(g, w, h, r) {'), tx.indexOf('  barrel(g, w, h, r) {'));
  A(/\\u0411\\u0415\\u041b\\u042f\\u0413\\u041e\\u0420\\u0421\\u041a/.test(body) && !/GHOST/.test(body), 'the stencil');
  const rd = readFileSync(new URL('../src/game/render.js', import.meta.url), 'utf8');
  A(/parcel: +\{ scale: 1\.2/.test(rd), 'no material');
  const lt = readFileSync(new URL('../src/game/level_train.js', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8'), mn = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  A(/body\.offduty #zone::before \{ content: 'OFF DUTY  \/\/  '; \}/.test(html) && /if \(level\.offDuty\) document\.body\.classList\.add\('offduty'\);/.test(mn), 'GHOST TRAINING over the train');
  A(!/'crate'\)/.test(lt.slice(lt.indexOf("the guard's van: cages of parcels"), lt.indexOf("the guard's van: cages of parcels") + 600)), 'Ghost crates in the van');
});

console.log('\n-- M6.18.11 --');
T('signs read the right way round from both sides - Belyagorsk\'s, seen from the train, were mirrored (Rhys: "printed backwards")', () => {
  const rd = readFileSync(new URL('../src/game/render.js', import.meta.url), 'utf8');
  A(/m\.cull = pc\.CULLFACE_BACK;/.test(rd) && /for \(const turn of \[0, 180\]\) \{\s*const side = new pc\.Entity\(\);\s*side\.setLocalEulerAngles\(0, turn, 0\);/.test(rd) && !/m\.cull = pc\.CULLFACE_NONE;      \/\/ readable from both sides/.test(rd), 'one face, two-sided: mirrored from behind');
  const arr = L.signs.filter((q) => q.arrival && q.text === TERMINUS.sev);
  A(arr.length && arr.every((q) => q.yaw === Math.PI), 'Belyagorsk\'s names face the platform, not the train');
});
T('the departures board: every line within its lamps, the lamps within its housing (Rhys: "the numbers slightly overhang the actual board")', () => {
  const r = new TrainRun();
  for (const [st, t] of [['waiting', 0], ['waiting', 230], ['running', 300]]) for (const en of [false, true]) {
    r.state = st; r.t = t;
    for (const [l, rt] of departures(r, en)) {
      const w = 3 + matrixLetters(l).length * 6 + 6 + matrixLetters(rt).length * 6 - 1 + 3;
      A(w <= MATRIX.cols, 'a line runs over: ' + l + ' | ' + rt + ' (' + w + ')');
    }
  }
  const lt = readFileSync(new URL('../src/game/level_train.js', import.meta.url), 'utf8');
  const sg = L.signs.find((q) => q.board), m = lt.match(/sbox\(\[CON\.x0 \+ 8\.05, ([\d.]+), ([\d.]+)\], \[CON\.x0 \+ 8\.3, ([\d.]+), ([\d.]+)\]/);
  A(sg && m && +m[1] < sg.pos[1] && +m[3] > sg.pos[1] + sg.h && +m[2] < sg.pos[2] - sg.w / 2 && +m[4] > sg.pos[2] + sg.w / 2, 'the board wider than its housing');
});
T('the Minister sits in his seat (Rhys): the sitting pose, alive; slumped in it, dead', () => {
  const mn = L.npcs.find((n) => n.kind === 'minister');
  A(mn.sitting && pickClip({ sitting: true, dead: false, mode: 'walk', stance: 0 }).clip === 'Driving_Loop' && pickClip({ sitting: true, seated: true, dead: true }).seated, 'standing');
  const rt = readFileSync(new URL('../src/game/mission_runtime.js', import.meta.url), 'utf8');
  A(/sitting: !!o\.sitting, seated: !!\(o\.sitting && o\.down\)/.test(rt) && /if \(!n\.sitting\) n\.yaw = /.test(rt), 'not passed to his body');
  const A1 = carriages().find((c) => c.id === 'A');
  A(Math.abs(mn.pos[0] - (A1.x0 + 17.7 - 0.32)) < 1e-6 && mn.yaw === Math.PI / 2, 'not at his seat');
});
T('the nose from inside: the hood cut cleanly along the windscreen\'s foot, not in steps (Rhys: "jaggedy"); the cab desk not to be climbed', () => {
  const x1 = L.nose.x0, wsF = (t) => 1.95 + 0.62 * Math.pow(Math.max(0, (t - NOSE.windscreen[0]) / (NOSE.windscreen[1] - NOSE.windscreen[0])), 1.4);
  let cut = 0;
  for (const p of L.pieces.filter((q) => ['body', 'bodyInner', 'warn', 'warnInner'].includes(q.nosePart))) for (const q of p.quads) {
    if (q.cut) cut++;
    for (const v of q.v) { const t = (v[0] - x1) / NOSE.len; if (t >= NOSE.windscreen[0] && t <= NOSE.windscreen[1]) A(v[1] <= wsF(t) + 1e-6, 'a face over the glass at t ' + t.toFixed(3)); }
  }
  A(cut > 10, 'no faces cut: ' + cut);
  const lt = readFileSync(new URL('../src/game/level_train.js', import.meta.url), 'utf8');
  A(/box\(\[c\.x1 - 2\.2, FLOOR, -H\], \[c\.x1 - 1\.4, FLOOR \+ 0\.85, H\], 'metal', \{ tint: \[[\d., ]+\], noClimb: true \}\);/.test(lt), 'the desk climbable');
});

console.log('\n' + '='.repeat(50));
console.log(fails.length ? 'FAILURES (' + fails.length + '):\n' + fails.map((f) => '  * ' + f).join('\n') : 'ALL ' + pass + ' PASSED');
process.exit(fails.length ? 1 : 0);
