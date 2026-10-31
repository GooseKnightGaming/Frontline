// FRONTLINE - the minimap.
//
// Drawn on a small canvas from the level's own collision boxes, so it can
// never disagree with the world. North stays at the top; you rotate.

export const MAP_RANGE = 46;      // metres shown from the middle to the edge, at the normal zoom

export function classOf(solid) {
  const tag = solid.tag || '';
  if (/^w?door\d/.test(tag)) return solid.disabled ? 'doorOpen' : 'door';
  if (tag === 'crate' || tag === 'target') return tag;
  if (tag === 'ladder' || tag === 'rail' || tag === 'hazard' || tag === 'lamp') return null;
  if (tag === 'chair' || tag === 'banquette' || tag === 'table' || tag === 'slot' || tag === 'wc' || tag === 'bar' || solid.shotOnly) return null;   // furniture is not walls
  if (solid.max[1] - solid.min[1] < 0.5) return null;     // floors and kerbs
  return 'wall';
}

// Which solids are worth drawing: near you, and at your height.
export function visible(world, pos, range) {
  const out = [];
  // only the solids near you, from the world's grid when it has one
  const each = world._near ? (fn) => world._near(pos[0] - range, pos[2] - range, pos[0] + range, pos[2] + range, fn) : (fn) => world.solids.forEach(fn);
  each((s) => {
    if (s.max[1] < pos[1] - 0.5 || s.min[1] > pos[1] + 3) return;
    if (s.max[0] < pos[0] - range || s.min[0] > pos[0] + range) return;
    if (s.max[2] < pos[2] - range || s.min[2] > pos[2] + range) return;
    const k = classOf(s);
    if (k) out.push({ s, k });
  });
  return out.sort((a, b) => a.s._i - b.s._i);
}

const COLOURS = {
  you: '#ffffff', ally: '#6cc4e8', enemy: '#e05050', objective: '#e8c02a', interest: '#9aa4ae', heat: '#ff9a3c',
  ring: 'rgba(232,180,35,0.35)', face: 'rgba(120,200,255,0.10)',
};

// A radar, not a map: contacts around you, turned so that you always face up.
export function draw(ctx, size, level, player, opts) {
  opts = opts || {};
  const range = opts.range || MAP_RANGE;
  const r = size / 2;
  const yaw = opts.yaw || 0;
  const px = player.pos[0], pz = player.pos[2];
  // world -> radar: rotate so your heading is up
  // screen right is your right hand, screen up is where you are looking
  const cos = Math.cos(yaw), sin = Math.sin(yaw);
  const place = (x, z) => {
    const dx = x - px, dz = z - pz;
    const rx = dx * cos - dz * sin;      // along your right
    const ry = dx * sin + dz * cos;      // ahead of you (screen up is negative)
    return [r + (rx / range) * (r - 8), r + (ry / range) * (r - 8)];
  };
  // where a compass point sits on the rim, using the same turn
  const rim = (dx, dz) => {
    const sx = dx * cos - dz * sin, sy = dx * sin + dz * cos;
    const len = Math.hypot(sx, sy) || 1;
    return [r + (sx / len) * (r - 9), r + (sy / len) * (r - 9)];
  };
  const inside = (p) => Math.hypot(p[0] - r, p[1] - r) < r - 6;

  ctx.clearRect(0, 0, size, size);
  ctx.beginPath(); ctx.arc(r, r, r - 1, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(8,11,14,0.66)'; ctx.fill();
  // the wedge you can see
  ctx.beginPath(); ctx.moveTo(r, r);
  ctx.arc(r, r, r - 4, -Math.PI / 2 - 0.62, -Math.PI / 2 + 0.62);
  ctx.closePath(); ctx.fillStyle = COLOURS.face; ctx.fill();
  // range rings
  ctx.strokeStyle = COLOURS.ring; ctx.lineWidth = 1;
  for (const k of [0.33, 0.66, 1]) { ctx.beginPath(); ctx.arc(r, r, (r - 4) * k, 0, Math.PI * 2); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(r, 4); ctx.lineTo(r, size - 4); ctx.moveTo(4, r); ctx.lineTo(size - 4, r);
  ctx.strokeStyle = 'rgba(232,180,35,0.16)'; ctx.stroke();

  const blip = (p, colour, shape) => {
    ctx.fillStyle = colour;
    if (shape === 'ring') {
      // heard, not seen: a ring, since you only know roughly where
      ctx.strokeStyle = colour; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(p[0], p[1], 4.5, 0, Math.PI * 2); ctx.stroke();
    } else if (shape === 'hollow') {
      // where they were: an outline, fading as the memory ages
      ctx.strokeStyle = colour; ctx.lineWidth = 1.3;
      ctx.strokeRect(p[0] - 3, p[1] - 3, 6, 6);
    } else if (shape === 'diamond') {
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(Math.PI / 4);
      ctx.fillRect(-3.4, -3.4, 6.8, 6.8); ctx.restore();
    } else if (shape === 'chevron') {
      ctx.save(); ctx.translate(p[0], p[1]);
      ctx.beginPath(); ctx.moveTo(0, -4.5); ctx.lineTo(3.5, 4); ctx.lineTo(0, 1.8); ctx.lineTo(-3.5, 4);
      ctx.closePath(); ctx.fill(); ctx.restore();
    } else ctx.fillRect(p[0] - 3, p[1] - 3, 6, 6);
  };
  // contacts: allies, enemies, things of interest, and the objective
  // A contact is drawn by what you know: seen (solid), felt by heat (orange),
  // heard (a ring), or remembered (an outline where they were, fading).
  for (const c of opts.contacts || []) {
    const p = place(c.pos[0], c.pos[2]);
    if (!inside(p)) continue;
    const remembered = c.live === false;
    ctx.globalAlpha = remembered ? 0.25 + 0.6 * (c.fade === undefined ? 1 : c.fade) : 1;
    // a guard's state shows in his colour: amber when he is wondering, bright
    // red with a ring when he has seen you
    const wary = c.state === 'suspicious' || c.state === 'search';
    // a Yellow at peace with you: yellow, a diamond
    if (c.kind === 'neutral') { blip(p, '#f2d43a', 'diamond'); continue; }
    const colour = c.kind === 'ally' ? COLOURS.ally : c.kind === 'enemy' ? (c.how === 'heat' ? COLOURS.heat : wary ? '#e8b423' : c.state === 'alert' ? '#ff3030' : COLOURS.enemy) : COLOURS.interest;
    if (c.state === 'alert' && !remembered) { ctx.strokeStyle = '#ff3030'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, Math.PI * 2); ctx.stroke(); }
    if (c.kind === 'ally') blip(p, colour, 'chevron');
    else if (remembered) blip(p, colour, 'hollow');
    else if (c.how === 'sound') blip(p, colour, 'ring');
    else blip(p, colour, 'square');
    ctx.globalAlpha = 1;
  }
  if (opts.objective) {
    let p = place(opts.objective[0], opts.objective[1]);
    // an objective off the edge is pinned to it, so you know which way to go
    const d = Math.hypot(p[0] - r, p[1] - r);
    if (d > r - 8) { const k = (r - 8) / d; p = [r + (p[0] - r) * k, r + (p[1] - r) * k]; }
    blip(p, COLOURS.objective, 'diamond');
  }
  // you, always pointing up
  blip([r, r], COLOURS.you, 'chevron');
  ctx.strokeStyle = 'rgba(232,180,35,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(r, r, r - 1, 0, Math.PI * 2); ctx.stroke();
  // how far the edge is, at the bottom of the dial
  if (opts.label) {
    ctx.fillStyle = 'rgba(232,180,35,0.75)'; ctx.font = '9px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(opts.label, r, size - 20);
  }
  // the cardinal letters ride round the edge as you turn
  ctx.fillStyle = '#e8b423'; ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const [name, dx, dz] of [['N', 0, -1], ['E', 1, 0], ['S', 0, 1], ['W', -1, 0]]) {
    const p = rim(dx, dz);
    ctx.fillStyle = name === 'N' ? '#e8b423' : 'rgba(232,180,35,0.5)';
    ctx.fillText(name, p[0], p[1]);
  }
}

// The compass strip across the top of the screen: a heading and the marks.
export function heading(yaw) {
  let deg = ((-yaw * 180) / Math.PI) % 360;
  if (deg < 0) deg += 360;
  const names = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return { deg: Math.round(deg) % 360 || 0, name: names[Math.round(deg / 45) % 8] };
}
