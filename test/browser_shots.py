import asyncio, sys, json
from playwright.async_api import async_playwright
URL = 'file:///home/claude/fl-repo/index.html?test'
SHOTS = [
  ('spawn',      [0, 0, 30], 0, 0),
  ('vault_lane', [10, 0, 13], 0, -0.1),
  ('tower_pool', [30, 0, -8], 0, 0.15),
  ('catwalk',    [-24, 5.18, -2], 1.3, -0.15),
  ('containers', [-30, 0, -30], 0.6, 0.05),
]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 1280, 'height': 720})
        errs = []
        pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
        pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
        await pg.goto(URL)
        await pg.wait_for_function('window.FL !== undefined', timeout=30000)
        await pg.wait_for_timeout(1500)
        info = await pg.evaluate("({webgl: FL.app.graphicsDevice.isWebGL2, dev: FL.app.graphicsDevice.deviceType, draws: FL.app.stats ? FL.app.stats.drawCalls.total : -1})")
        print('device', info)
        for name, pos, yaw, pitch in SHOTS:
            await pg.evaluate(f"FL.pose({json.dumps(pos)}, {yaw}, {pitch}); FL.drive({{}}, 0.3);")
            await pg.wait_for_timeout(600)
            await pg.screenshot(path=f'/tmp/fl/{name}.png')
        # a moment under water
        await pg.evaluate("FL.pose([30, -3, -20], 0, 0.2); FL.player.mode='swim'; FL.drive({crouch:true}, 0.2);")
        await pg.wait_for_timeout(500)
        await pg.screenshot(path='/tmp/fl/underwater.png')
        print('state', await pg.evaluate("FL.state()"))
        print('errors', errs[:12])
        await b.close()
asyncio.run(main())
