// FRONTLINE - the training course: one step at a time, with doors that open
// when you have shown you can do the thing.
//
// Pure logic. A step is done when its test passes; finishing a step opens the
// doors it names, and the next instruction appears.

export class Course {
  constructor(world, steps) {
    this.world = world;
    this.steps = steps || [];
    this.at = 0;
    this.done = false;
    this.events = [];
    this.openDoors(this.steps[0]);
  }
  get step() { return this.done ? null : this.steps[this.at] || null; }
  get text() { const s = this.step; return s ? s.text : ''; }
  get section() { const s = this.step; return s ? s.section : null; }

  openDoors(step) {
    if (!step || !step.opens) return;
    for (const tag of step.opens) this.setDoor(tag, true);
  }
  setDoor(tag, open) {
    for (const s of this.world.solids) if (s.tag === tag) s.disabled = open;
    for (const p of this.world.doorPieces || []) if (p.tag === tag) p.open = open;
  }

  // Everything behind you stays open; everything ahead stays shut.
  advance() {
    const s = this.steps[this.at];
    if (s && s.opens) for (const tag of s.opens) this.setDoor(tag, true);
    this.events.push({ type: 'step done', id: s && s.id });
    this.at++;
    if (this.at >= this.steps.length) { this.done = true; this.events.push({ type: 'course done' }); return; }
    this.events.push({ type: 'step', id: this.steps[this.at].id, text: this.steps[this.at].text });
  }

  // Skip a whole section (the pause menu offers this), opening its doors.
  skipSection(name) {
    let moved = false;
    while (!this.done && this.steps[this.at] && this.steps[this.at].section === name) { this.advance(); moved = true; }
    return moved;
  }
  skipAll() { while (!this.done) this.advance(); }

  update(player, arsenal, dt) {
    if (this.done) return;
    const s = this.steps[this.at];
    if (!s) { this.done = true; return; }
    let ok = false;
    if (s.zone) {
      const z = s.zone;
      const p = player.pos;
      ok = p[0] >= z[0][0] && p[0] <= z[1][0] && p[1] >= z[0][1] && p[1] <= z[1][1] && p[2] >= z[0][2] && p[2] <= z[1][2];
    }
    if (!ok && s.test) ok = !!s.test(player, arsenal, dt);
    if (ok) {
      s.heldFor = (s.heldFor || 0) + (dt || 0);
      if (s.heldFor >= (s.hold || 0)) this.advance();
    } else s.heldFor = 0;
  }
}

// How much of a group of targets is down.
export function downFraction(groups, name) {
  const list = (groups && groups[name]) || [];
  if (!list.length) return 0;
  return list.filter((t) => t.down).length / list.length;
}

// The weapons half: pick the thing up, then clear the range.
export function weaponsSteps(level) {
  const g = () => level.groups;
  const has = (id) => (p, arsenal) => !!(arsenal && arsenal.owned && arsenal.owned[id]);
  return [
    { id: 'pistol-get', section: 'weapons', text: 'Take the PX9 from the crate: stand at it and press E. A sidearm goes in your secondary slot - key 2.', test: has('PX9'), opens: [] },
    { id: 'pistol-range', section: 'weapons', text: 'Click to shoot. Clear the pistol range - hold ALT to aim, it matters.',
      test: () => downFraction(g(), 'pistol') >= 0.8, opens: ['wdoor1'] },
    { id: 'rifle-get', section: 'weapons', text: 'Take the K7 carbine: it fills your primary slot. Keys: 1 primary, 2 secondary, 3 and 4 utility.', test: has('K7'), opens: [] },
    { id: 'rifle-range', section: 'weapons', text: 'Clear the rifle range. Some of them move.',
      test: () => downFraction(g(), 'rifle') >= 0.8, opens: ['wdoor2'] },
    { id: 'sniper-get', section: 'weapons', text: 'Take the LR7 marksman rifle.', test: has('LR7'), opens: [] },
    { id: 'sniper-range', section: 'weapons', text: 'Clear the sniper range - all of them, bunkers included.',
      test: () => downFraction(g(), 'sniper') >= 1, opens: ['wdoor3'] },
    { id: 'nade-get', section: 'weapons', text: 'Take the frag grenades. They go in a utility slot - press 3 to hold them.', test: has('FRAG'), opens: [] },
    { id: 'nade-range', section: 'weapons', text: 'Four behind the glass. A grenade will reach the vent at their feet.',
      test: () => downFraction(g(), 'grenade') >= 1, opens: ['wdoor4'] },
    { id: 'turrets', section: 'weapons', text: 'Two turrets. Use the low walls: they cannot shoot what they cannot see, and they have to reload.',
      test: () => downFraction(g(), 'turret') >= 1, opens: ['wdoor5'] },
    { id: 'out', section: 'weapons', text: 'Training complete. Yard 7 is through the gate.',
      test: (p) => p.pos[0] > -70 && p.pos[2] < 4, opens: [] },
  ];
}

// The steps of the movement half. Geometry lives in level_tutorial.js; these
// only name the areas you have to reach and the doors that open behind you.
export function movementSteps(marks, withWeapons) {
  const at = (name) => marks[name];
  return [
    { id: 'walk', section: 'movement', text: 'Walk with W A S D. Look with the mouse.', zone: at('walked'), opens: [] },
    { id: 'jump', section: 'movement', text: 'Jump the gap with SPACE.', zone: at('jumped'), opens: ['door1'] },
    { id: 'ladder', section: 'movement', text: 'Climb the ladder: face it and press W.', zone: at('ladderTop'), opens: [] },
    { id: 'hop', section: 'movement', text: 'Hop the gap between the platforms.', zone: at('hopped'), opens: ['door2'] },
    { id: 'crates', section: 'movement', text: 'Climb the crates to the catwalk.', zone: at('catwalk'), opens: [] },
    { id: 'sprint', section: 'movement', text: 'Sprint with SHIFT, and vault the railing with SPACE.', zone: at('vaulted'), opens: ['door4'] },
    { id: 'crouch', section: 'movement', text: 'The tunnel gets low. Press C to crouch, and again to go prone.',
      zone: at('crawled'), test: (p) => p.pos[0] > -93 && p.pos[1] > at('crawled')[0][1] - 1.5, opens: [] },
    { id: 'stand', section: 'movement', text: 'Press C again to stand up.',
      test: (p) => p.stance === 0 && p.pos[0] > -100 && p.pos[1] > at('crawled')[0][1] - 1.5, opens: [] },
    { id: 'drop', section: 'movement', text: 'Drop through the grate.',
      zone: at('dropped'), test: (p) => p.pos[1] < at('dropped')[1][1] && p.pos[0] > -95 && p.pos[0] < -80,
      opens: withWeapons ? ['wdoor0'] : [] },
  ];
}
