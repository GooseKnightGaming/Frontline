// FRONTLINE - an electromagnetic pulse (the sheet's VD-EMP "Blackout" launcher): it hurts no one,
// but for a while, within its reach, electronics stop - a guard's night vision or torch goes
// dark, a turret goes blind and quiet, an engine dies. Pure: the pulse only sets how long each
// stays out (`jammed`, `stalled`); each thing checks its own time.

export const EMP = { reach: 12, secs: 12 };

// guards, turrets (each { turret: { pos } }), vehicles (each { pos }) - what is in reach goes out
export function pulse(pos, things, reach, secs) {
  const R = reach || EMP.reach, T = secs || EMP.secs, hit = { guards: 0, turrets: 0, vehicles: 0 };
  const near = (p) => p && Math.hypot(p[0] - pos[0], p[1] - pos[1], p[2] - pos[2]) <= R;
  for (const g of things.guards || []) if (!g.dead && near(g.pos)) { g.jammed = Math.max(g.jammed || 0, T); hit.guards++; }
  for (const t of things.turrets || []) if (t.turret && !t.down && near(t.turret.pos)) { t.turret.jammed = Math.max(t.turret.jammed || 0, T); hit.turrets++; }
  for (const v of things.vehicles || []) if (near(v.pos)) { v.stalled = Math.max(v.stalled || 0, T); hit.vehicles++; }
  // a mission's cameras and turrets (sim/world/devices.js)
  for (const d of things.devices || []) if (d.mode !== 'off' && near(d.pos)) { d.jammed = Math.max(d.jammed || 0, T); if (d.kind === 'turret') hit.turrets++; else hit.cameras = (hit.cameras || 0) + 1; }
  return hit;
}
