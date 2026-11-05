# FRONTLINE - a probe, not part of the suite: play levels through to their debrief by forcing each objective done.
# Serve the repo (python3 -m http.server 8123), then: python3 test/finish_probe.py <file with level ids, space-separated>
# Prints each level's objectives (Y done, N not, opt optional) and the debrief's first words. Tails and battles are not handled.
import asyncio, json, sys
from playwright.async_api import async_playwright
ids = open(sys.argv[1]).read().split()
JS = """() => { const M = FL.mission(), L = FL.level, G = FL.guards || [];
  for (const o of L.objectives || []) {
    if (o.kind === 'hack') { const t = L.terminals.find(q => q.id === o.ref); if (t) t.done = true; }
    if (o.kind === 'take') { const p = L.pickups.find(q => q.id === o.ref); if (p) p.taken = true; }
    if (o.kind === 'identify') for (const id of o.refs) { const g = G.find(q => q.id === id); if (g) g.tracked = true; }
    if (o.kind === 'capture') { const g = G.find(q => q.id === o.ref); if (g) g.tied = true; }
    if (o.kind === 'kill') { const g = G.find(q => q.id === o.ref); if (g) g.dead = true; }
    if (o.kind === 'reach') { const z = L.reach.find(q => q.id === o.ref); if (z) z.done = true; }
    if (o.kind === 'stop') { const v = (L.drivables || []).find(q => q.id === o.ref); if (v) v.wrecked = true; }
    if (o.kind === 'rescue') for (const h of (FL.hostages || L.hostages || [])) if (!o.ref || h.id === o.ref) h.state = 'rescued';
    if (o.kind === 'clear') for (const g of G) if (g.side !== 'ally' && g.objective !== false) g.dead = true;
  }
  for (let s = 0; s < 30; s++) M.tick(1/30, 1/30, true);
  const objs = M.objectives().map(o => o.kind + ':' + (o.done ? 'Y' : o.optional ? 'opt' : 'N'));
  const v = (L.van || L.extraction).pos; FL.pose([v[0], v[1], v[2]], 0, 0);
  for (let s = 0; s < 60; s++) M.tick(1/30, 1/30, true);
  const r = document.getElementById('mend-result'); return [objs.join(' '), r ? r.textContent.slice(0, 40) : 'no debrief']; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        for lid in ids:
            pg = await b.new_page(viewport={'width':480,'height':270}); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
            try:
                await pg.goto('http://localhost:8123/index.html?level=%s&touch=1' % lid, timeout=300000)
                await pg.wait_for_function('window.FL !== undefined', timeout=300000); await pg.wait_for_timeout(1500)
                await pg.click('#b-begin', timeout=120000, force=True); await pg.wait_for_timeout(2500)
                res = await pg.evaluate(JS)
            except Exception as e: res = 'EXC ' + str(e)[:120]
            print(lid, json.dumps(res), errs[:2], flush=True)
            await pg.close()
        await b.close()
asyncio.run(main())
