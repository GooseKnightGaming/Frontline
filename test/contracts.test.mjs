// FRONTLINE - contracts (sim/play/contracts.js, M6.41): the board, what pays, what does not.
import { TERMS, BOARD, contractFor, boardOf, settle, describe } from '../src/sim/play/contracts.js';
import { readFileSync } from 'fs';
let n = 0, bad = 0;
const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL', m); } };
const L = ['embassy', 'yacht', 'tower', 'archive'];
const b = boardOf(null, L);
ok(b.contracts.length === BOARD && b.state.next === BOARD, 'three on an empty board');
ok(JSON.stringify(boardOf(b.state, L).contracts) === JSON.stringify(b.contracts), 'the same board each time you look');
ok(b.contracts.every((c) => L.includes(c.level) && TERMS[c.term] && c.xp > 0), 'each a real level and term');
ok(!boardOf(null, []).contracts.length, 'no missions, no contracts');
for (let i = 0; i < 60; i++) { const c = contractFor(i, L); ok(!describe(c).includes('{') && (c.term !== 'quick' || (c.mins >= 6 && c.mins <= 12)), 'contract ' + i + ': ' + describe(c)); }
// one that pays: find an Unseen contract, and do it
let st = b.state, c = null;
for (let k = 0; k < 40 && !c; k++) { const bb = boardOf(st, L); c = bb.contracts.find((q) => q.term === 'ghost'); if (!c) { st = { next: bb.state.next, open: [] }; } }
ok(c, 'an Unseen contract turns up');
const m = { spotted: 0, kills: 4, time: 300, headshots: 0, takedowns: 0, shotsFired: 0, shotsHit: 0 };
let out = settle(st, L, c.level, 'partial', m); ok(!out.paid.length, 'a partial success pays nothing');
out = settle(st, L, c.level, 'success', Object.assign({}, m, { spotted: 2 })); ok(!out.paid.some((q) => q.n === c.n), 'seen: not paid');
out = settle(st, L, c.level === 'yacht' ? 'tower' : 'yacht', 'success', m); ok(!out.paid.some((q) => q.n === c.n), 'the wrong mission: not paid');
out = settle(st, L, c.level, 'success', m);
ok(out.paid.some((q) => q.n === c.n) && !out.state.open.includes(c.n) && out.state.open.length === BOARD, 'done: paid, and a new one in its place');
ok(TERMS.quick.met({ time: 359 }, { mins: 6 }) && !TERMS.quick.met({ time: 361 }, { mins: 6 }), 'the clock');
ok(TERMS.sharp.met({ shotsFired: 10, shotsHit: 6 }) && !TERMS.sharp.met({ shotsFired: 5, shotsHit: 5 }), 'sharpshooter needs ten rounds');
const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
ok(/settleContracts\(cst, cst\.levels, level\.draft, m\.result, m\)/.test(rt), 'the debrief settles them');
console.log(bad ? `${bad} of ${n} FAILED` : `ALL ${n} PASSED`);
if (bad) process.exit(1);
