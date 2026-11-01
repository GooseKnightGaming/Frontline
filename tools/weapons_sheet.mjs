// FRONTLINE - the weapon stats sheet (M6.32; the roadmap's "weapon stats sheet, as a side document like the
// controls page"): written by build.mjs into weapons.html, straight from the catalogue in src/sim/arms/loadout.js,
// so it can never disagree with the game.
import { ITEMS, FAMILIES, MODS, itemWeight, CLASSES } from '../src/sim/arms/loadout.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fam = (it) => FAMILIES[it.family] || {};
export const isGun = (it) => fam(it).kind === 'gun' && !it.hidden;
export const isKit = (it) => ['throwable', 'placeable', 'usable'].includes(fam(it).kind);
export const isWorn = (it) => ['gear', 'perk'].includes(fam(it).kind);

// the figures shown, and how each is worked out
export const perShot = (it) => (it.damage || 0) * (it.pellets || 1);
// damage a second, sustained (a burst weapon: its burst every `rate` seconds)
export const dps = (it) => (it.rate ? perShot(it) * (it.burst || 1) / it.rate : 0);
const accuracy = (spread) => (spread ? Math.max(0, Math.min(100, Math.round(100 - Math.log10(spread / 0.0006) * 45))) : 100);
const order = ['pistol', 'smg', 'rifle', 'shotgun', 'sniper', 'energy', 'launcher', 'knife'];

function bar(v, max, label) {
  const w = max ? Math.max(3, Math.min(100, Math.round(v / max * 100))) : 0;
  return `<div class="bar" title="${esc(label)}"><i style="width:${w}%"></i><span>${esc(label)}</span></div>`;
}
const whoCarries = (id) => CLASSES.filter((c) => (c.guns || []).includes(id) || Object.values(c.kit || {}).includes(id)).map((c) => c.name || c.id);

export function weaponsSheet(ver) {
  const ids = Object.keys(ITEMS);
  const guns = ids.filter((id) => isGun(ITEMS[id]) || ITEMS[id].family === 'knife');
  const maxDmg = Math.max(...guns.map((id) => perShot(ITEMS[id])));
  const maxDps = Math.max(...guns.map((id) => dps(ITEMS[id])));
  const maxRange = Math.max(...guns.map((id) => ITEMS[id].best || ITEMS[id].range || 0));
  let body = '';
  for (const f of order) {
    const these = guns.filter((id) => ITEMS[id].family === f);
    if (!these.length) continue;
    body += `<h2 class="fam">${esc((FAMILIES[f].label || f).toUpperCase())} <span class="dim">(${these.length})</span></h2><div class="cards">`;
    for (const id of these) {
      const it = ITEMS[id], kg = itemWeight(id);
      const facts = [];
      if (it.mag) facts.push(it.energy ? `heat for ${it.mag} shots` : `${it.mag} rounds${it.reserve ? ' + ' + it.reserve : ''}`);
      if (it.reload) facts.push(`${it.energy ? 'cools' : 'reloads'} in ${it.reload} s`);
      if (it.burst) facts.push(`${it.burst}-round bursts`);
      else if (it.auto || (it.rate && it.rate < 0.1)) facts.push('automatic');
      if (it.pellets) facts.push(`${it.pellets} pellets`);
      if (it.pen) facts.push(`penetration ${it.pen}`);
      if (it.blast) facts.push(`blast ${it.blast} m`);
      if (it.quiet) facts.push('quiet');
      if (it.noMods) facts.push('no attachments');
      facts.push(`${kg.toFixed(1)} kg`);
      const carries = whoCarries(id);
      body += `<div class="card" data-n="${esc((it.name + ' ' + id + ' ' + (it.trait || '')).toLowerCase())}" data-dmg="${perShot(it)}" data-dps="${Math.round(dps(it))}" data-range="${it.best || it.range || 0}" data-kg="${kg.toFixed(2)}"><div class="nm">${esc(it.name)}<b>${esc(id)}</b></div>`
        + bar(perShot(it), maxDmg, `damage ${perShot(it)}${it.pellets ? ' (' + it.pellets + ' x ' + it.damage + ')' : ''}`)
        + bar(dps(it), maxDps, `${Math.round(dps(it))} a second`)
        + bar(it.best || it.range || 0, maxRange, `good to ${it.best || it.range || 0} m`)
        + (it.spread !== undefined ? bar(accuracy(it.adsSpread || it.spread), 100, `aimed accuracy ${accuracy(it.adsSpread || it.spread)}`) + bar(accuracy(it.spread), 100, `from the hip ${accuracy(it.spread)}`) : '')
        + (it.recoil !== undefined ? bar(Math.max(0, 100 - it.recoil * 900), 100, `steadiness ${Math.round(Math.max(0, 100 - it.recoil * 900))}`) : '')
        + `<div class="facts">${facts.map(esc).join(' &middot; ')}</div>`
        + (it.trait ? `<div class="trait">${esc(it.trait)}</div>` : '')
        + (carries.length ? `<div class="who">Carried by: ${carries.map(esc).join(', ')}</div>` : '')
        + '</div>';
    }
    body += '</div>';
  }
  // attachments
  body += '<h2>ATTACHMENTS</h2><table>';
  for (const [id, m] of Object.entries(MODS)) body += `<tr><td class="k">${esc(m.name)}</td><td>${esc(m.note || '')} <span class="dim">(${esc(m.fits.map((f) => FAMILIES[f] ? FAMILIES[f].label : f).join(', '))}${m.only ? ': ' + esc(ITEMS[m.only].name) + ' only' : ''})</span></td></tr>`;
  body += '</table>';
  // utilities
  body += '<h2>GRENADES, CHARGES AND AID</h2><table>';
  for (const id of ids.filter((i) => isKit(ITEMS[i]) && !ITEMS[i].hidden)) {
    const it = ITEMS[id], bits = [];
    if (it.count) bits.push(`${it.count} carried`);
    if (it.damage) bits.push(`damage ${it.damage}`);
    if (it.blast) bits.push(`${it.blast} m`);
    if (it.fuse) bits.push(`${it.fuse} s fuse`);
    if (it.heals) bits.push(`heals ${it.heals}`);
    if (it.blind) bits.push(`blinds ${it.blind} s`);
    if (it.smoke) bits.push(`smoke ${it.smoke} s`);
    if (it.sticky) bits.push('sticks');
    if (it.prox) bits.push(`trips at ${it.prox} m`);
    if (it.emp) bits.push('knocks out devices');
    body += `<tr><td class="k">${esc(it.name)}</td><td>${it.note ? esc(it.note) + ' ' : ''}<span class="dim">${esc(bits.join(' · '))}</span></td></tr>`;
  }
  body += '</table><h2>GEAR AND SPECIALS</h2><table>';
  for (const id of ids.filter((i) => isWorn(ITEMS[i]) && !ITEMS[i].hidden)) {
    const it = ITEMS[id];
    body += `<tr><td class="k">${esc(it.name)}</td><td>${esc(it.note || it.trait || '')} <span class="dim">(${esc(fam(it).label)}, ${itemWeight(id).toFixed(1)} kg)</span></td></tr>`;
  }
  body += '</table>';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Frontline ${esc(ver)} - Weapons</title>
<style>
 body{margin:0;background:#0d1014;color:#d7dce2;font-family:'Roboto Condensed',Arial,sans-serif;line-height:1.5}
 .wrap{max-width:980px;margin:0 auto;padding:28px 16px 60px}
 img{width:min(380px,80%);display:block;margin:0 auto 18px}
 h1{font-size:20px;letter-spacing:5px;color:#e8b423;margin:0 0 4px;text-align:center}
 p.sub{text-align:center;color:#8a939c;margin:0 0 22px;font-size:14px}
 h2{font-size:13px;letter-spacing:4px;color:#e8b423;margin:28px 0 10px;border-bottom:1px solid #2b333d;padding-bottom:5px}
 .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
 .card{background:#151a20;border:1px solid #232b34;border-radius:6px;padding:10px 12px}
 .nm{color:#fff;font-weight:700;margin-bottom:6px;display:flex;justify-content:space-between;gap:8px}
 .nm b{color:#5b646d;font-weight:400;font-size:11px;letter-spacing:1px}
 .bar{position:relative;height:19px;line-height:19px;background:#0d1014;border-radius:3px;margin:4px 0;overflow:hidden}
 .bar i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#8a6a10,#e8b423)}
 .bar span{position:relative;display:block;font-size:11.5px;padding-left:6px;color:#fff;text-shadow:0 1px 2px #000}
 .facts{font-size:12.5px;color:#aab3bc;margin-top:6px}
 .trait{font-size:12.5px;color:#d7dce2;margin-top:4px;font-style:italic}
 .who{font-size:11.5px;color:#6cc4e8;margin-top:4px}
 table{width:100%;border-collapse:collapse}
 td{padding:5px 8px;vertical-align:top;border-bottom:1px solid #1b2128;font-size:14px}
 td.k{width:210px;color:#fff;font-weight:600}
 .dim{color:#7d8790;font-size:12.5px}
 .tools{display:flex;gap:8px;flex-wrap:wrap;position:sticky;top:0;background:#0d1014;padding:8px 0;z-index:2}
 .tools input,.tools select{flex:1;min-width:180px;background:#151a20;color:#fff;border:1px solid #2b333d;border-radius:4px;padding:8px 10px;font:inherit;font-size:14px}
 a{color:#6cc4e8} .foot{margin-top:34px;text-align:center;color:#5b646d;font-size:12px}
 @media (max-width:560px){td.k{width:auto;white-space:normal}}
</style></head><body><div class="wrap">
<img src="assets/ui/frontline_badge.png" alt="Frontline">
<h1>WEAPONS AND KIT</h1>
<p class="sub" style="margin-bottom:6px">Frontline ${esc(ver)}</p>
<p class="sub">Straight from the game's own figures. Bars compare like with like across every weapon; "good to" is the range before a round starts to lose its force.</p>
<div class="tools"><input id="q" placeholder="Find a weapon (name, maker, trait)" autocomplete="off">
<select id="sort"><option value="">In catalogue order</option><option value="dmg">Most damage a shot</option><option value="dps">Most damage a second</option><option value="range">Longest reach</option><option value="kg">Lightest</option></select></div>
${body}
<script>
(function(){var q=document.getElementById('q'),so=document.getElementById('sort');
var groups=[].slice.call(document.querySelectorAll('.cards'));groups.forEach(function(g){[].slice.call(g.children).forEach(function(c,i){c.dataset.i=i;});});
function go(){var t=q.value.trim().toLowerCase(),k=so.value;groups.forEach(function(g){var cs=[].slice.call(g.children),shown=0;
cs.sort(function(a,b){if(!k)return a.dataset.i-b.dataset.i;return k==='kg'?a.dataset.kg-b.dataset.kg:b.dataset[k]-a.dataset[k];});
cs.forEach(function(c){g.appendChild(c);var on=!t||c.dataset.n.indexOf(t)>=0;c.style.display=on?'':'none';if(on)shown++;});
var h=g.previousElementSibling;if(h)h.style.display=shown?'':'none';g.style.display=shown?'':'none';});}
q.oninput=go;so.onchange=go;})();
</script>
<div class="foot">GooseKnight &middot; <a href="controls.html">controls</a> &middot; <a href="index.html">back to the game</a></div>
</div></body></html>`;
}
