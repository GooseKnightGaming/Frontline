// FRONTLINE - no gaps in the buildings (M6.125.2). Every first-draft level, every storey, against the pieces that are drawn:
//  1 the walls: rays through every wall square (straight across at seven points along it, and corner to corner) at
//    foot, chest and head height - no slits (the old fault: a corner where a run met a cross wall);
//  2 a ceiling over every square indoors, and 3 a floor under every square indoors upstairs (not over a stair, a
//    shaft, water, an atrium's void 'O', or a storey's noRoof / roof: false);
//  4 the band between one storey's wall tops and the next one's floor, from outside (the Airfield's 0.4 m slit).
// A shaft a level means to have is listed in OPEN below.
import { buildKitLevel, carve, insideOf, KIT, DIRS } from '../src/game/levels/kit.js';
import { DRAFTS } from '../src/game/levels/drafts/index.js';
let C = KIT.cell;
const only = process.argv[2];
const OPEN = { mine: ['M:[66,32]', 'G:[66,32]'] };        // the Mineshaft's ladder shaft, from the yard down to the bottom
const segHits = (P, a, b) => {
  for (const p of P) {
    let t0 = 0, t1 = 1, ok = true;
    for (let k = 0; k < 3 && ok; k++) {
      const d = b[k] - a[k];
      if (Math.abs(d) < 1e-9) { if (a[k] < p.min[k] || a[k] > p.max[k]) ok = false; continue; }
      let u = (p.min[k] - a[k]) / d, v = (p.max[k] - a[k]) / d; if (u > v) [u, v] = [v, u];
      t0 = Math.max(t0, u); t1 = Math.min(t1, v); if (t0 > t1) ok = false;
    }
    if (ok) return true;
  }
  return false;
};
const report = [];
for (const d of DRAFTS) {
  if (only && d.id !== only) continue;
  if (!d.floors) continue;
  C = d.cell || KIT.cell;
  let L; try { L = buildKitLevel(d); } catch (e) { report.push(d.no + ' ' + d.id + ': build failed ' + e.message); continue; }
  // index the pieces by cell
  const idx = new Map();
  for (const p of L.pieces) {
    if (!p.min || !p.max) continue;
    const x0 = Math.floor(p.min[0] / C) - 1, x1 = Math.floor(p.max[0] / C) + 1, z0 = Math.floor(p.min[2] / C) - 1, z1 = Math.floor(p.max[2] / C) + 1;
    if ((x1 - x0) * (z1 - z0) > 4000) { (idx.get('big') || idx.set('big', []).get('big')).push(p); continue; }
    for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) { const k = x + ',' + z; (idx.get(k) || idx.set(k, []).get(k)).push(p); }
  }
  const near = (x, z) => (idx.get(x + ',' + z) || []).concat(idx.get('big') || []);
  const hit = (a, b) => { const cx = Math.floor((a[0] + b[0]) / 2 / C), cz = Math.floor((a[2] + b[2]) / 2 / C); return segHits(near(cx, cz), a, b); };
  // the stairs' footprints (and the hole above them)
  const stairCells = new Set();
  for (const st of d.stairs || []) { const [dx, dy] = DIRS[st.dir]; for (let i = -1; i <= st.len; i++) for (let j = -1; j <= (st.w || 1); j++) stairCells.add((st.x + dx * i + (dx ? 0 : j)) + ',' + (st.y + dy * i + (dy ? 0 : j))); }
  const keys = Object.keys(d.floors).sort((a, b) => d.floors[a].y - d.floors[b].y);
  const found = { wall: [], ceil: [], floor: [] };
  for (const k of keys) {
    const F = d.floors[k]; if (!F.carve) continue;
    const FI = L.floorInfo && L.floorInfo[k]; if (!FI) continue;
    const rows = FI.rows; const inside = FI.inside instanceof Set ? FI.inside : insideOf(rows), y = F.y || 0, wh = F.wallH || KIT.wallH;
    const ch = (x, z) => (rows[z] && rows[z][x]) || ' ';
    const isWall = (x, z) => ch(x, z) === '#';
    // 1 walls: through every '#' between two open squares (straight and diagonal)
    for (let z = 0; z < rows.length; z++) for (let x = 0; x < rows[z].length; x++) {
      if (!isWall(x, z)) continue;
      for (const [dx, dz] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
        const ax = x - dx, az = z - dz, bx = x + dx, bz = z + dz;
        if (isWall(ax, az) || isWall(bx, bz) || ch(ax, az) === ' ' && ch(bx, bz) === ' ') continue;
        // one side indoors at least
        if (!inside.has(ax + ',' + az) && !inside.has(bx + ',' + bz)) continue;
        if (dx && dz && (isWall(x + dx, z) === false && isWall(x, z + dz) === false)) continue;   // a lone pillar: diagonals pass by
        // slide only where the wall carries on that way (a run's last square is walled to its middle)
        const along = (sgn) => dx && !dz ? isWall(x, z + sgn) || 'DW:'.includes(ch(x, z + sgn)) : isWall(x + sgn, z) || 'DW:'.includes(ch(x + sgn, z));
        const offs = dx && dz ? [0] : [-0.49, -0.33, -0.16, 0, 0.16, 0.33, 0.49].filter((o) => o === 0 || along(Math.sign(o)));
        let bad = null;
        for (const h of [0.4, 1.4, wh - 0.35]) for (const o of offs) {
          if (bad) break;
          const sx = dz && !dx ? o * C : 0, sz = dx && !dz ? o * C : 0;       // slide along the wall
          const a = [(ax + 0.5) * C + sx, y + h, (az + 0.5) * C + sz], b = [(bx + 0.5) * C + sx, y + h, (bz + 0.5) * C + sz];
          if (!hit(a, b)) bad = `${k}:[${x},${z}] ${dx && dz ? 'diag' : dx ? 'E-W' : 'N-S'} at +${h.toFixed(1)} off ${o}`;
        }
        if (bad) found.wall.push(bad);
      }
    }
    // 2 ceilings and 3 floors over and under every inside square (not over a stair)
    for (const key of inside) {
      if (stairCells.has(key)) continue;
      const [x, z] = key.split(',').map(Number); const c = ch(x, z);
      if ('Dd:~O'.includes(c)) continue;
      const cx = (x + 0.5) * C, cz = (z + 0.5) * C;
      const opened = (F.noRoof || []).some(([a, b, c2, dd]) => x >= a && x <= c2 && z >= b && z <= dd);
      if (!opened && F.roof !== false && !hit([cx, y + Math.min(2.2, wh - 0.3), cz], [cx, y + wh + 0.7, cz])) found.ceil.push(`${k}:[${x},${z}]`);
      if (k !== keys[0] && !hit([cx, y + 0.3, cz], [cx, y - 0.35, cz])) found.floor.push(`${k}:[${x},${z}]`);
    }
  }
  // 4 the band between one storey's wall tops and the next storey's floor, seen from outside
  found.band = [];
  for (let i = 0; i + 1 < keys.length; i++) {
    const F = d.floors[keys[i]], N = d.floors[keys[i + 1]], A = L.floorInfo[keys[i]], B = L.floorInfo[keys[i + 1]];
    if (!A || !B) continue;
    const top = (F.y || 0) + (F.wallH || KIT.wallH), bot = N.y || 0; if (bot - top < 0.06 || bot <= 0) continue;   // (underground: earth behind it)
    const ch = (r, x, z) => (r[z] && r[z][x]) || ' ';
    for (let z = 0; z < A.rows.length; z++) for (let x = 0; x < A.rows[z].length; x++) {
      if (ch(A.rows, x, z) !== '#') continue;
      const above = ch(B.rows, x, z); if (above === ' ') continue;
      for (const [dx, dz] of [[1, 0], [0, 1]]) {
        const o1 = ch(A.rows, x - dx, z - dz), o2 = ch(A.rows, x + dx, z + dz);
        const ins1 = A.inside.has ? A.inside.has((x - dx) + ',' + (z - dz)) : false, ins2 = A.inside.has ? A.inside.has((x + dx) + ',' + (z + dz)) : false;
        if (ins1 === ins2) continue;                         // an outside wall: indoors one side, out the other
        const h = (top + bot) / 2;
        const a = [(x - dx + 0.5) * C, h, (z - dz + 0.5) * C], b = [(x + dx + 0.5) * C, h, (z + dz + 0.5) * C];
        if (!hit(a, b)) { found.band.push(`${keys[i]}/${keys[i + 1]}:[${x},${z}] ${top.toFixed(2)}-${bot.toFixed(2)}`); }
      }
    }
  }
  const ok = OPEN[d.id] || [];
  for (const k of ['ceil', 'floor']) found[k] = found[k].filter((q) => !ok.includes(q));
  const n = found.wall.length + found.ceil.length + found.floor.length + found.band.length;
  if (n) report.push(`${d.no} ${d.id}: walls ${found.wall.length} [${found.wall.slice(0, 6).join('; ')}] ceilings ${found.ceil.length} [${found.ceil.slice(0, 6).join(' ')}] floors ${found.floor.length} [${found.floor.slice(0, 6).join(' ')}] bands ${found.band.length} [${found.band.slice(0, 5).join(' ')}]`);
}
if (report.length) { console.log('FAIL  gaps in the buildings:\n  ' + report.join('\n  ')); process.exit(1); }
console.log('  PASS  no gaps in the buildings: walls, ceilings, upper floors and the bands between storeys, in ' + DRAFTS.filter((d) => d.floors).length + ' levels');
