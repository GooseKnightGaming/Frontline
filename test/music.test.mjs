// FRONTLINE - the music's files are all there (M6.123.1: every track but two had been looked for with underscores
// for spaces, and so never played).
import { existsSync } from 'node:fs';
import { TRACKS } from '../src/game/core/music.js';
let fails = 0;
const ok = (c, what) => { console.log((c ? '  PASS  ' : '  FAIL  ') + what); if (!c) fails++; };
for (const [k, t] of Object.entries(TRACKS)) ok(existsSync(new URL('../assets/music/' + t.file, import.meta.url)), 'the ' + k + ' track\'s file is there (' + t.file + ')');
console.log(fails ? 'FAILURES (' + fails + ')' : 'ALL PASSED');
process.exit(fails ? 1 : 0);
