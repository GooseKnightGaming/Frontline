// Builds the game into the repository's root, where GitHub Pages serves it: index.html, controls.html,
// game.js (the engine and the game in one script) and the bake check. assets/ is already here.
import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync, statSync, readFileSync, writeFileSync, readdirSync, cpSync } from 'fs';
await esbuild.build({
  entryPoints: ['src/game/main.js'], bundle: true, minify: true, format: 'iife',
  target: ['es2020'], outfile: 'game.js', legalComments: 'eof', logLevel: 'warning',
  external: ['node:worker_threads'],   // engine code for node only; never reached in a browser
});
// Stamp the build version onto the script's address, so no cache (browser,
// GitHub's CDN or a Chromebook) can serve yesterday's game.js.
const ver = (readFileSync('src/game/main.js', 'utf8').match(/const VERSION = '([^']+)'/) || [, 'dev'])[1];
let html = readFileSync('src/index.html', 'utf8');
html = html.replace('<script src="game.js"></script>', `<script src="game.js?v=${ver}"></script>`)
           .replace(/controls\.html/g, `controls.html?v=${ver}`).replace(/weapons\.html/g, `weapons.html?v=${ver}`)
           .replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta http-equiv="Cache-Control" content="no-cache">');
writeFileSync('index.html', html);
let ctl = readFileSync('src/controls.html', 'utf8').replace(/\{\{VER\}\}/g, ver);
writeFileSync('controls.html', ctl);
// (M6.32) the weapon stats sheet, from the catalogue itself
const { weaponsSheet } = await import('./tools/weapons_sheet.mjs');
writeFileSync('weapons.html', weaponsSheet(ver));
// the bake check: a standalone page to test this machine's lightmap baking
await esbuild.build({ entryPoints: ['tools/bake_check/check.js'], bundle: true, minify: true, format: 'iife', target: ['es2020'], outfile: 'bakecheck.js', logLevel: 'warning', external: ['node:worker_threads'] });
copyFileSync('tools/bake_check/bakecheck.html', 'bakecheck.html');
console.log('version', ver);
console.log('built game.js', (statSync('game.js').size / 1024 / 1024).toFixed(2) + ' MB');
