// FRONTLINE - the story so far (Rhys: "time to make Mission
// Objectives independent from Mission Completion").
//
// A mission no longer fails because an objective went wrong: a hostage killed,
// the captain away in his helicopter - those are outcomes, and the story goes
// on from them. Only your own death fails a mission (and walking away having
// achieved nothing at all). What happened is written into your save, mission by
// mission, for later missions to read: the captain escaped - you meet him
// again; killed - Lieutenant Varga takes over; each hostage brought out - what
// they bring with them.
// Pure logic: no engine, no browser.

import { battleRules } from './battle.js';

// How the Riverside Hotel ended, from the people in it.
//   hostages: [{ id, name, state }]  (state: held | following | waiting | rescued | dead)
//   cap: { stage, dead, knockedOut, fled }  (CaptainRun's stage and his guard)
export function hotelOutcome(hostages, cap) {
  const fate = (h) => h.state === 'rescued' ? 'rescued' : h.state === 'dead' ? 'killed' : 'left behind';
  const people = (hostages || []).map((h) => ({ id: h.id, name: h.name || h.id, fate: fate(h) }));
  let captain = 'at large';
  if (cap) {
    if (cap.stage === 'takeoff' || cap.stage === 'gone') captain = 'escaped';
    else if (cap.knockedOut) captain = 'knocked out';
    else if (cap.dead) captain = 'killed';
    else if (cap.stage === 'stranded') captain = 'stranded';
  }
  const rescued = people.filter((p) => p.fate === 'rescued').length;
  const stopped = captain === 'killed' || captain === 'knocked out';
  return { mission: 'riverside', hostages: people, captain, rescued, stopped };
}

// Is everything settled - every hostage out or dead, and the captain stopped
// or gone? Then reaching the jeep ends it; otherwise leaving is your choice.
export function hotelSettled(o) {
  return o.hostages.every((p) => p.fate !== 'left behind') && (o.stopped || o.captain === 'escaped');
}

// The grade: everything done - success; something done - complete, with
// losses; nothing at all - failed (you walked away).
export function grade(o) {
  const all = o.rescued === o.hostages.length && o.stopped;
  if (all) return 'success';
  if (o.rescued > 0 || o.stopped) return 'partial';
  return 'failed';
}

// What the debrief says about each objective, line by line.
export function outcomeLines(o) {
  const lines = o.hostages.map((p) => ({ ok: p.fate === 'rescued', text: p.name + ' — ' + p.fate }));
  lines.push({ ok: o.stopped, text: 'The captain — ' + o.captain });
  return lines;
}

// Written into a save: story.missions[id] is the latest outcome of that
// mission; story.log keeps every attempt that ended (newest last, the last 20).
export function recordOutcome(save, o, result, at) {
  const s = save || {};
  const story = s.story = s.story || { missions: {}, log: [] };
  story.missions = story.missions || {}; story.log = story.log || [];
  const entry = Object.assign({ result, at: at || Date.now() }, o);
  story.missions[o.mission] = entry;
  story.log.push({ mission: o.mission, result, at: entry.at });
  if (story.log.length > 20) story.log.splice(0, story.log.length - 20);
  return s;
}

// ── Clearing a building of one side (M6.14.0 the Derelict Factory: flush the
// yellows out; M6.15.0 the Casino: the reds) ──
// guards: [{ dead, knockedOut }]. Down = killed or knocked out.
export function clearOutcome(guards, mission) {
  const gs = guards || [];
  const knockedOut = gs.filter((g) => g.dead && g.knockedOut).length;
  const killed = gs.filter((g) => g.dead && !g.knockedOut).length;
  const down = killed + knockedOut;
  return { mission, total: gs.length, down, killed, knockedOut, cleared: gs.length > 0 && down === gs.length };
}
export const factoryOutcome = (guards) => clearOutcome(guards, 'factory');
// the rules for clearing a place: side (plural: 'yellows'), task, where ('the factory')
function clearRules(mission, side, task, where) {
  const one = side.replace(/s$/, '');
  return {
    outcome: (c) => clearOutcome(c.guards, mission),
    settled: (o) => o.cleared,
    grade: (o) => (o.cleared ? 'success' : o.down > 0 ? 'partial' : 'failed'),
    lines: (o) => [{ ok: o.cleared, text: task + ' \u2014 ' + o.down + ' of ' + o.total + ' down' + (o.knockedOut ? ' (' + o.knockedOut + ' knocked out)' : '') }],
    undone: (o) => (o.total - o.down) + ' ' + (o.total - o.down === 1 ? one : side) + ' still in ' + where,
  };
}

// the casino; (Rhys) its objectives now:
//   1. Find the ledger - the main task (in the Cash Vault)
//   2. Team up with the Yellows - optional
//   3. Help the Yellows find their locket - only once teamed up
// Clearing the reds out is no longer one of them: it is a trophy (Clean Sweep).
// c.job: the Yellows' errand, 'idle' (never asked) .. 'escort' | 'locket' |
// 'leaving' | 'gone', or 'off' (they turned on you).
export function casinoOutcome(c) {
  const o = clearOutcome(c.guards, 'casino');
  o.ledger = !!c.ledger;
  o.job = c.job || 'idle';
  o.teamed = o.job !== 'idle';
  o.locket = !!c.locket;
  // the locket taken by you; what you told the boss: 'gave', 'lied' (believed) or 'caught'
  o.locketMine = !!c.locketMine; o.locketAnswer = c.locketAnswer || null;
  // a Yellow the reds killed is not one you put down: counted apart
  // (Rhys: "they were caught in an explosion, it wasn't deliberate") one caught in your blast is counted apart too
  o.yellows = c.yellows ? (() => {
    const mine = (g) => g.dead && (!g.target || !g.target.lastBy || g.target.lastBy === 'you' || g.takenDownBy);
    const blast = (g) => mine(g) && !g.takenDownBy && !!g.target && g.target.downBy === 'blast';
    return { total: c.yellows.length, down: c.yellows.filter((g) => mine(g) && !blast(g)).length, killed: c.yellows.filter((g) => mine(g) && !blast(g) && !g.knockedOut).length,
      blast: c.yellows.filter(blast).length, lost: c.yellows.filter((g) => g.dead && !mine(g)).length, away: c.yellows.filter((g) => g.away).length };
  })() : null;
  // the errand over, one way or another: the locket taken, the Yellows gone or turned, or none left standing
  o.jobOver = !o.teamed || o.locket || !!o.locketAnswer || o.job === 'gone' || o.job === 'off' || (o.yellows ? o.yellows.total - o.yellows.down - o.yellows.blast - o.yellows.lost <= 0 : false);
  return o;
}
function casinoRules() {
  return {
    outcome: casinoOutcome,
    // nothing left to do: the ledger yours, and the Yellows' errand (if you took it on) over
    settled: (o) => o.ledger && o.jobOver,
    grade: (o) => (o.ledger ? 'success' : o.locket || o.down > 0 ? 'partial' : 'failed'),
    lines: (o) => [
      { ok: o.ledger, text: 'Find the reds\' ledger \u2014 ' + (o.ledger ? 'recovered from the Cash Vault' : 'left in the Cash Vault') },
      o.teamed ? { ok: true, text: 'Team up with the Yellows (optional) \u2014 done' } : { ok: true, neutral: true, text: 'Team up with the Yellows (optional) \u2014 not taken up' },
      !o.teamed ? { ok: true, neutral: true, text: 'Help the Yellows find their locket \u2014 not teamed up' + (o.locketMine ? '; the locket is in your pocket' : '') }
        : o.locketMine && o.locketAnswer === 'lied' ? { ok: true, neutral: true, text: 'Help the Yellows find their locket \u2014 kept it for yourself; they believed it was not there' }
        : o.locketMine && o.locketAnswer === 'caught' ? { ok: false, text: 'Help the Yellows find their locket \u2014 kept it for yourself, and they caught you lying' }
        : o.locketMine ? { ok: true, neutral: true, text: 'Help the Yellows find their locket \u2014 it is in your pocket' }
        : { ok: o.locket, text: 'Help the Yellows find their locket \u2014 ' + (o.locket ? (o.locketAnswer === 'gave' ? 'handed over by you' : 'found') + (o.yellows && o.yellows.away ? ', and ' + o.yellows.away + ' of ' + o.yellows.total + ' got away with it' : '') : o.job === 'off' ? 'they turned on you' : 'not found') },
      { ok: true, neutral: true, text: 'Reds down \u2014 ' + o.down + ' of ' + o.total + (o.knockedOut ? ' (' + o.knockedOut + ' knocked out)' : '') },
    ]
      .concat(o.yellows && o.yellows.lost ? [{ ok: true, neutral: true, text: 'The Yellows \u2014 ' + o.yellows.lost + ' killed by the reds' }] : [])
      .concat(o.yellows && o.yellows.blast ? [{ ok: true, neutral: true, text: 'The Yellows \u2014 ' + o.yellows.blast + ' caught in your blast' }] : [])
      .concat(o.yellows && o.yellows.down ? [{ ok: false, text: 'The Yellows in the Businessman\'s Suite \u2014 ' + o.yellows.down + ' of ' + o.yellows.total + ' down by your hand' + (o.yellows.killed ? ' (' + o.yellows.killed + ' killed)' : '') }] : []),
    undone: (o) => [!o.ledger ? 'the ledger still in the Cash Vault' : '', !o.jobOver ? 'the Yellows still after their locket' : ''].filter(Boolean).join(', '),
  };
}

// ── the first-draft levels (src/game/levels/kit.js): a list of objectives ──
// c.objectives: [{ id, kind, text, optional, done, failed, status }] as the runtime sees them now;
// c.guards: the ones you were sent for (for the counts and the trophies)
export function draftOutcome(c) {
  const o = clearOutcome(c.guards, c.draftId || 'draft');
  o.objectives = (c.objectives || []).map((x) => ({ id: x.id, kind: x.kind, text: x.text, optional: !!x.optional, done: !!x.done, failed: !!x.failed, status: x.status || (x.done ? 'done' : x.failed ? 'failed' : 'not done') }));
  return o;
}
export const draftRules = {
  outcome: draftOutcome,
  // nothing left to settle: every objective that is not optional done - or past doing
  settled: (o) => o.objectives.filter((x) => !x.optional).every((x) => x.done || x.failed),
  grade: (o) => {
    const req = o.objectives.filter((x) => !x.optional);
    if (req.length && req.every((x) => x.done)) return 'success';
    if (o.objectives.some((x) => x.done) || o.down > 0) return 'partial';
    return 'failed';
  },
  lines: (o) => o.objectives.map((x) => (x.optional && !x.done ? { ok: true, neutral: true, text: x.text + ' (optional) \u2014 ' + x.status } : { ok: x.done, text: x.text + (x.optional ? ' (optional)' : '') + ' \u2014 ' + x.status })),
  undone: (o) => o.objectives.filter((x) => !x.optional && !x.done && !x.failed).map((x) => x.text[0].toLowerCase() + x.text.slice(1)).join(', '),
};

// Each mission's rules, for the runtime: how it stands now, whether there is
// nothing left to settle (then reaching the extraction ends it), the grade,
// the debrief's lines, and what is still undone (the withdraw prompt).
export const RULES = {
  riverside: {
    outcome: (c) => hotelOutcome(c.hostages, c.cap),
    settled: hotelSettled,
    grade,
    lines: outcomeLines,
    undone(o) {
      const inside = o.hostages.filter((p) => p.fate === 'left behind').length;
      return [inside ? inside + (inside === 1 ? ' hostage' : ' hostages') + ' still inside' : '', !o.stopped && o.captain !== 'escaped' ? 'the captain ' + o.captain : ''].filter(Boolean).join(', ');
    },
  },
  factory: clearRules('factory', 'yellows', 'Flush the yellows out', 'the factory'),
  casino: casinoRules(),
  draft: draftRules,
  battle: battleRules,
  // the Night Train, first part: the station, the train, the journey - nothing
  // to settle yet (what goes wrong comes next); c.run: the TrainRun
  train: {
    outcome: (c) => ({ mission: 'train', boarded: !!(c.run && c.run.boarded && c.run.state !== 'missed'), missed: !!(c.run && c.run.state === 'missed'),
      departed: !!(c.run && ['running', 'braking', 'arrived'].includes(c.run.state)), arrived: !!(c.run && c.run.state === 'arrived'), dist: c.run ? c.run.dist : 0,
      hijack: !!(c.hijack && c.hijack.happened), guardKilled: !!(c.hijack && c.hijack.guardKilled), minister: c.hijack ? c.hijack.minister : 'alive', hijackDown: c.hijack ? c.hijack.down : 0, hijackTotal: c.hijack ? c.hijack.total : 0,
      // what comes next (Rhys): the Front rooted out - or holding Belyagorsk
      front: c.hijack && c.hijack.happened ? (c.hijack.minister === 'alive' ? 'rooted out' : 'holds Belyagorsk') : null }),
    settled: (o) => o.arrived,
    // in at Belyagorsk: the journey done. (Rhys) the Minister killed is a partial
    // result - and the story branches: alive, the Front are rooted out; dead, they take Belyagorsk
    // the train's guard dead by your hand: no clean success either
    grade: (o) => (o.arrived ? (o.minister === 'dead' || o.guardKilled ? 'partial' : 'success') : o.departed ? 'partial' : 'failed'),
    lines: (o) => [{ ok: o.boarded && !o.missed, text: 'Board the 21:40 to Belyagorsk \u2014 ' + (o.missed ? 'missed it' : o.boarded ? 'aboard' : 'not aboard') },
      ...(o.hijack ? [{ ok: o.minister === 'alive', text: 'Protect Minister Dravets \u2014 ' + (o.minister === 'alive' ? 'alive' : 'killed') },
        { ok: o.hijackDown === o.hijackTotal, neutral: o.hijackDown < o.hijackTotal, text: 'The Front of Memory \u2014 ' + o.hijackDown + ' of ' + o.hijackTotal + ' down' },
        ...(o.guardKilled ? [{ ok: false, text: 'The train\'s guard \u2014 killed by you' }] : [])] : []),
      { ok: o.arrived, text: 'Arrive at Belyagorsk - Alyejka Azvestya \u2014 ' + (o.arrived ? 'arrived' : Math.round(o.dist / 1000 * 10) / 10 + ' km of 31') }],
    undone: () => 'the journey',
  },
};
