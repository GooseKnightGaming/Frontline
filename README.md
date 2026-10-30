# Frontline

A browser espionage shooter by **GooseKnight Gaming**, built in [PlayCanvas](https://playcanvas.com).
Play it at **https://gooseknightgaming.github.io/Frontline/**.

## What's in this repository

| Where | What |
|---|---|
| `index.html`, `game.js`, `controls.html`, `bakecheck.*` | The built game, served by GitHub Pages. Made by `build.mjs`; don't edit them by hand. |
| `assets/` | Models, textures, sounds and music the game loads. |
| `src/` | The source. `src/sim/` is the game's rules with no graphics (tested in node); `src/game/` draws it, plays it and runs the levels. |
| `test/` | Automated tests: `node test/<name>.test.mjs` each; `test/browser.test.py` drives the real game in a browser. |
| `tools/` | Scripts used to make assets (the operative's model, voices, maps). |
| `maps/` | Rhys's map spreadsheets and concept boards. |
| `docs/` | The project notes: `FRONTLINE_PROJECT.md` (start here), `FRONTLINE_ROADMAP.md` (what is still to do), `FRONTLINE_HANDOVER.md` (every release and why). |

## Building

```
npm install
node build.mjs          # writes index.html, controls.html, game.js and the bake check here
for t in test/*.test.mjs; do node $t | tail -1; done
```

© GooseKnight Gaming. Third-party art and sound are credited in the game (Credits on the title screen).
