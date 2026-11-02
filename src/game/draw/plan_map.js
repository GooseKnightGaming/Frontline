// FRONTLINE - the mission map (M6.49; the roadmap's "mission maps"): a floor plan of the floor you are on, drawn
// from the rows the level was built from (level.plan, kit.js), with you, what is left to do, the way out, and the
// devices you know of. Toggled with B (or PLAN on a touch screen); the game goes on underneath.

const COL = {
  wall: '#3a4048', window: '#6c8fa6', door: '#9b7a4e', floor: '#c9cdd2', outside: '#7d8a74', water: '#4d7ea3',
  hole: '#22262b', stuff: '#a7acb2', rail: '#8a9097', you: '#e8b423', obj: '#e05050', out: '#5ec26a', dev: '#6cc4e8',
};
const WALLS = new Set(['#', 'J', 'R', 'V', 'Q', 'L']);
const STUFF = new Set(['C', 'B', 'T', 'K', 'H', 'P', 'M', 'Y', 'Z', 'X', '+', 'w', 'v', 'f', 'h', 'r', 't', 'u']);
export function cellColour(ch, ground) {
  if (WALLS.has(ch)) return COL.wall;
  if (ch === 'W') return COL.window;
  if (ch === 'D' || ch === ':') return COL.door;
  if (ch === '~') return COL.water;
  if (ch === 'O') return COL.hole;
  if (ch === '=') return COL.rail;
  if (ch === ' ' || ch === 'g' || ch === 'p') return ground ? COL.outside : null;
  if (STUFF.has(ch)) return COL.stuff;
  return COL.floor;
}
// the floor you are on: the highest one at or below your feet (a little give for stairs)
export function floorAt(plan, y) {
  const fs = plan.floors.slice().sort((a, b) => a.y - b.y);
  let best = fs[0];
  for (const f of fs) if (f.y <= y + 0.8) best = f;
  return best;
}
// draw it: marks { you: { x, z, yaw }, objectives: [[x, y, z]], out: [x, z], devices: [{ x, y, z }] }
export function drawPlan(ctx, W, H, plan, y, marks) {
  const f = floorAt(plan, y), rows = f.rows, nx = Math.max(...rows.map((r) => r.length)), ny = rows.length;
  const ground = f.y === Math.min(...plan.floors.map((q) => q.y));
  const top = marks.top || 0;      // (room for the touch screen's top row of buttons)
  const s = Math.max(2, Math.floor(Math.min((W - 20) / nx, (H - 54 - top) / ny))), ox = Math.floor((W - s * nx) / 2), oy = top + 34 + Math.floor((H - 54 - top - s * ny) / 2);
  ctx.fillStyle = 'rgba(10,13,17,0.92)'; ctx.fillRect(0, 0, W, H);
  for (let r = 0; r < ny; r++) for (let c = 0; c < rows[r].length; c++) {
    const col = cellColour(rows[r][c], ground);
    if (!col) continue;
    ctx.fillStyle = col; ctx.fillRect(ox + c * s, oy + r * s, s, s);
  }
  const C = plan.cell, px = (x) => ox + (x / C) * s, pz = (z) => oy + (z / C) * s;
  const onFloor = (yy) => Math.abs(floorAt(plan, yy).y - f.y) < 0.01;
  const dot = (x, z, col, r) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px(x), pz(z), r, 0, Math.PI * 2); ctx.fill(); };
  for (const d of marks.devices || []) if (onFloor(d.y)) dot(d.x, d.z, COL.dev, Math.max(2, s * 0.35));
  for (const o of marks.objectives || []) if (onFloor(o[1])) { ctx.strokeStyle = COL.obj; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px(o[0]), pz(o[2]), Math.max(5, s * 0.9), 0, Math.PI * 2); ctx.stroke(); dot(o[0], o[2], COL.obj, Math.max(2, s * 0.35)); }
  if (marks.out && ground) { ctx.fillStyle = COL.out; const a = px(marks.out[0]), b = pz(marks.out[1]), k = Math.max(5, s); ctx.fillRect(a - k / 2, b - k / 2, k, k); }
  if (marks.you) {
    const { x, z, yaw } = marks.you, a = px(x), b = pz(z), k = Math.max(7, s * 1.3);
    ctx.save(); ctx.translate(a, b); ctx.rotate(-yaw); ctx.fillStyle = COL.you;
    ctx.beginPath(); ctx.moveTo(0, -k); ctx.lineTo(k * 0.6, k * 0.7); ctx.lineTo(0, k * 0.35); ctx.lineTo(-k * 0.6, k * 0.7); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  ctx.fillStyle = '#e8b423'; ctx.font = '600 13px sans-serif'; ctx.textAlign = 'left';
  const names = { G: 'GROUND FLOOR', B: 'BASEMENT' };
  const fname = (q) => names[q.key] || 'FLOOR ' + q.key;
  // what is left to do on other floors, said
  const else_ = [...new Set((marks.objectives || []).filter((o) => !onFloor(o[1])).map((o) => fname(floorAt(plan, o[1]))))];
  ctx.fillText(fname(f) + '   -   you (yellow), still to do (red), the way out (green), devices you know of (blue)', 12, top + 20);
  if (else_.length) { ctx.fillStyle = '#e05050'; ctx.fillText('Still to do elsewhere: ' + else_.join(', ').toLowerCase(), 12, H - 10); }
  return f;
}
