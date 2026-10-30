// FRONTLINE - battle mode (M6.19.5, Rhys's Beachhead sheet: "Battle Map; 10 minute timer; 100
// reserve units per team; ends at the timer or when one team has zero in reserve AND zero in the
// field"). Two sides, each with a reserve: every man sent onto the field - you included, each time
// you go back in - is paid for out of it. A few at a time are on the field (the rest wait their
// turn), each side pushing along its lanes towards the other's end. Pure: tested in node.
//
// def: { timer, you: side, teams: { side: { name, faction, reserve, field } } }

export const BATTLE = {
  timer: 600,          // seconds
  reserve: 100,        // men a side
  field: 10,           // on the field at once (a side's pool of guards)
  corpse: 9,           // seconds a man lies where he fell before the next comes on in his place
  youBack: 5,          // seconds before you go back in
  hold: [2, 7],        // seconds a man holds each point of his lane before he pushes on
};

export class Battle {
  constructor(def) {
    this.timer = def.timer || BATTLE.timer;
    this.time = 0;
    this.you = def.you || 'ghost';
    this.teams = {};
    for (const [side, t] of Object.entries(def.teams)) {
      this.teams[side] = { side, name: t.name || side, short: t.short || t.name || side, faction: t.faction || side, reserve: t.reserve === undefined ? BATTLE.reserve : t.reserve, field: 0, lost: 0, kills: 0 };
    }
    this.youDown = 0; this.youKills = 0; this.youOut = false;
    this.endedBy = null;
    this.retreated = false;
  }
  // (M6.20.11, Rhys: "You can't win a battle if you ran away halfway through, even if you were doing
  // better than your opponent") withdrawing ends it with no result: not won, not lost
  retreat() { if (!this.over) this.retreated = true; }
  get left() { return Math.max(0, this.timer - this.time); }
  tick(dt) { if (!this.over) this.time += dt; }
  // one more onto the field, paid for out of the reserve (false: none left)
  send(side) {
    const t = this.teams[side];
    if (!t || t.reserve <= 0 || this.over) return false;
    t.reserve--; t.field++;
    return true;
  }
  // one of a side's men down: off the field; by: the side that did it (or 'you')
  down(side, by) {
    const t = this.teams[side];
    if (!t) return;
    t.field = Math.max(0, t.field - 1); t.lost++;
    const k = by === 'you' ? this.teams[this.you] : this.teams[by];
    if (k && k !== t) k.kills++;
    if (by === 'you') this.youKills++;
  }
  // a side's strength: reserve and field together
  strength(side) { const t = this.teams[side]; return t ? t.reserve + t.field : 0; }
  // the side out of men (nothing in reserve, nobody on the field), if any
  get beaten() { return Object.keys(this.teams).find((s) => this.strength(s) <= 0) || null; }
  get over() { return this.time >= this.timer || !!this.beaten || this.youOut || this.retreated; }
  // how it stands: 'win' | 'draw' | 'lose' for your side - or 'retreat', if you withdrew
  result() {
    if (this.retreated) return 'retreat';
    const sides = Object.keys(this.teams), mine = this.you, them = sides.find((s) => s !== mine);
    const b = this.beaten;
    if (b) return b === mine ? 'lose' : 'win';
    const a = this.strength(mine), o = this.strength(them);
    return a > o ? 'win' : a < o ? 'lose' : 'draw';
  }
  clock() { const s = Math.ceil(this.left), m = Math.floor(s / 60); return m + ':' + String(s % 60).padStart(2, '0'); }
  snapshot() {
    const teams = {};
    for (const [k, t] of Object.entries(this.teams)) teams[k] = Object.assign({}, t);
    return { teams, you: this.you, time: this.time, timer: this.timer, over: this.over, result: this.result(), beaten: this.beaten, youDown: this.youDown, youKills: this.youKills, youOut: this.youOut, retreated: this.retreated };
  }
}

// (for the debrief and the rules) a battle's outcome, from its snapshot
export function battleOutcome(c) {
  const b = c.battle;
  const o = { mission: c.draftId || 'battle', battle: b, objectives: [], total: 0, down: b ? b.youKills : 0, killed: b ? b.youKills : 0, knockedOut: 0, cleared: false };
  return o;
}
export const battleRules = {
  outcome: battleOutcome,
  settled: (o) => !!(o.battle && o.battle.over),
  grade: (o) => (!o.battle ? 'failed' : o.battle.result === 'win' ? 'success' : o.battle.result === 'draw' ? 'partial' : 'failed'),
  lines: (o) => {
    const b = o.battle; if (!b) return [];
    const mine = b.teams[b.you], them = Object.values(b.teams).find((t) => t.side !== b.you);
    if (b.retreated) {
      const left = (t) => (t.reserve + t.field) + ' of ' + (t.reserve + t.field + t.lost) + ' left';
      return [
        { ok: false, neutral: true, text: 'The battle — withdrawn from, at ' + Math.floor((b.timer - b.time) / 60) + ':' + String(Math.ceil(b.timer - b.time) % 60).padStart(2, '0') + ' on the clock: no result' },
        { ok: true, neutral: true, text: mine.name + ' — ' + left(mine) + ', ' + mine.kills + ' of theirs down' },
        { ok: true, neutral: true, text: them.name + ' — ' + left(them) + ', ' + them.kills + ' of yours down' },
        { ok: true, neutral: true, text: 'You — ' + b.youKills + ' down by your hand, ' + (b.youDown ? 'down ' + b.youDown + (b.youDown === 1 ? ' time' : ' times') : 'never down') },
      ];
    }
    const how = b.youOut ? 'you were out of men' : b.beaten ? (b.beaten === b.you ? mine.name + ' ran out of men' : them.name + ' ran out of men') : 'the clock ran out';
    const res = b.result === 'win' ? 'won' : b.result === 'draw' ? 'drawn' : 'lost';
    const left = (t) => (t.reserve + t.field) + ' of ' + (t.reserve + t.field + t.lost) + ' left';
    return [
      { ok: b.result === 'win', neutral: b.result === 'draw', text: 'The battle — ' + res + ' (' + how + ')' },
      { ok: true, neutral: true, text: mine.name + ' — ' + left(mine) + ', ' + mine.kills + ' of theirs down' },
      { ok: true, neutral: true, text: them.name + ' — ' + left(them) + ', ' + them.kills + ' of yours down' },
      { ok: true, neutral: true, text: 'You — ' + b.youKills + ' down by your hand, ' + (b.youDown ? 'down ' + b.youDown + (b.youDown === 1 ? ' time' : ' times') : 'never down') },
    ];
  },
  undone: () => 'the battle',
};
