// FRONTLINE - (M6.125.3) every patrol leg as walked, swept at foot height (0.12 - 0.5 m): what each guard walks through. node tools/patrol_check.mjs (slow: about 15 minutes)
import { buildKitLevel } from '../src/game/levels/kit.js';
import { DRAFTS } from '../src/game/levels/drafts/index.js';
const out = [];
const skip = (s) => s.person || s.target || s.tag === 'target' || s.ghost || s.rider || s.disabled || s.shotOnly || s.tag === 'hdoor' || s.tag === 'vehicle' || s.tag === 'lawn';
for (const d of DRAFTS) {
  let L; try { L = buildKitLevel(d); } catch (e) { continue; }
  const C = d.cell || 1.5;
  for (const g of L.guards || []) {
    const r = g.route; if (!r || r.length < 2 || g.aboard) continue;
    const y0 = g.pos[1]; const pts = r.map((q) => (Array.isArray(q) ? (q.length === 2 ? [q[0], y0, q[1]] : q) : q.pos)).filter(Boolean);
    const legs = pts.map((a, i) => [a, pts[(i + 1) % pts.length]]).slice(0, pts.length === 2 ? 1 : pts.length);
    const bad = new Set();
    for (const [a, b] of legs) {
      if (Math.abs((a[1] || 0) - (b[1] || 0)) > 0.4) continue;                     // a stair leg: the nav's business
      const n = Math.ceil(Math.hypot(b[0] - a[0], b[2] - a[2]) / 0.4);
      for (let i = 1; i < n; i++) {
        const t = i / n, x = a[0] + (b[0] - a[0]) * t, z = a[2] + (b[2] - a[2]) * t, y = a[1] + (b[1] - a[1]) * t;
        const hs = L.world.hits([x - 0.18, y + 0.12, z - 0.18], [x + 0.18, y + 0.5, z + 0.18]).filter((s) => !skip(s) && s.max[1] - y > 0.3);
        if (hs.length) { bad.add(`[${(x / C - 0.5).toFixed(0)},${(z / C - 0.5).toFixed(0)}] ${hs[0].tag} top ${(hs[0].max[1] - y).toFixed(2)}`); break; }
      }
    }
    if (bad.size) out.push(`${d.no} ${d.id}: ${g.id}'s patrol walks through ${[...bad].join('; ')}`);
  }
}
console.log(out.join('\n') || 'clean'); console.error(out.length);
