// FRONTLINE - Severian (M6.20.12, Rhys's draft): what is in the game is his, spelled as he spelled it.
import { CANON, negate } from '../src/game/core/severian.js';
import { readFileSync } from 'fs';
let pass = 0; const fails = [];
const T = (n, f) => { try { f(); pass++; console.log('  PASS  ' + n); } catch (e) { fails.push(n + ' -> ' + e.message); console.log('  FAIL  ' + n + ' :: ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m); };
T('О̏ stays О + the double grave, never Ӧ or plain О', () => {
  A(CANON.coffee === 'ко̏фиъ' && CANON.tonight.includes('о̏'), 'normalised');
  A(!Object.values(CANON).some((w) => /ӧ/i.test(w)), 'the fallback Ӧ used');
});
T('the negative particle: by the last vowel of the word before it, /a/ counted front', () => {
  A(negate('обслувани') === 'обслувани нє', negate('обслувани'));
  A(negate('пиятфо̏ма ваъ обслувани') === 'пиятфо̏ма ваъ обслувани нє', 'the phrase');
  A(negate('ча') === 'ча нє' && negate('ко̏фиъ') === 'ко̏фиъ нє', 'a and i');
  A(negate('шниъг') === 'шниъг нє', 'a consonant: the vowel before it');
  A(negate('рох') === 'рох ня' && negate('но̏ԏч') === 'но̏ԏч ня' && negate('полнотч') === 'полнотч ня', 'o, ɔ');
  A(negate('ы') === 'ы ня' && negate('у') === 'у ня', 'ɨ, u');
});
T('the station uses it: the kiosk, platform 2 not in service (not "closed"), Port Ȍstrel', () => {
  const s = readFileSync(new URL('../src/game/levels/train.js', import.meta.url), 'utf8');
  A(/CANON\.coffee \+ ' · ' \+ CANON\.newspapers/.test(s) && /CANON\.notInService \+ ' · Not in service'/.test(s), 'signs');
  A(!/КОФЕ|ГАЗЕТЫ|Не работает/.test(s), 'the placeholder is still there');
  A(/en: 'Port Ȍstrel'/.test(s), 'Port Ostrel');
});
T('(M6.20.12, Rhys\'s answers) the board, the platforms, the announcement, the kiosk, the paper', async () => {});
import('../src/game/levels/train.js').then((L) => {
  T('the board says лажах and остаъви, Пл. for platform; the signs ПИЯТФО̏МА', () => {
    const run = { clock: () => '21:39:40', t: 220, state: 'waiting' };
    const rows = L.departures(run, false);
    A(rows[0][0] === 'ЛАЖАХ', rows[0][0]);
    A(rows.some((r) => / ОСТАЪВИ$/.test(r[0])) && rows.slice(1).every((r) => /^Пл\. \d$/.test(r[1])), JSON.stringify(rows));
    A(rows.every((r) => [...(r[0] + '  ' + r[1]).normalize('NFC')].length <= 32), 'a row overhangs the board');
    const src = readFileSync(new URL('../src/game/levels/train.js', import.meta.url), 'utf8');
    A(!/ПЛАТФОРМА|ОДХОДИ/.test(src) && /CANON\.platform\.toUpperCase\(\) \+ ' ' \+ pn/.test(src), 'old platform word');
    A(CANON.platform === 'пиятфо̏ма' && !/р/.test(CANON.platform), 'the platform word has an р');
  });
  T('the 21:40 is announced in Rhys\'s words, recorded; the kiosk greets you in Severian once, then English', () => {
    A(L.STAFF_TALK.depart.startsWith('древ васдат-оден и зорок до Белягорск-е ра веск. стайат безпино ѵ жвԁ, прешже.'), L.STAFF_TALK.depart);
    A(L.STAFF_TALK.kioskSev.startsWith('џенъ звїечо̏р. чочԏ ко̏фиъ ѕ газети'), 'kiosk');
    const sp = readFileSync(new URL('../src/game/core/spoken.js', import.meta.url), 'utf8');
    A(sp.includes(L.STAFF_TALK.depart) && sp.includes(L.STAFF_TALK.kioskSev) && !sp.includes('Пойиз до васдат'), 'recordings');
    const rt = readFileSync(new URL('../src/game/levels/mission_runtime.js', import.meta.url), 'utf8');
    A(/const first = !rt\.kioskMet; rt\.kioskMet = true;/.test(rt), 'kiosk');
    A(L.NEWSPAPER.englishOnly && /Tuesday, 8 November 2002/.test(L.NEWSPAPER.dateEn), 'the paper');
  });
  T('(M6.20.14) Rhys\'s place names on the board and signs; Белягорск-е; the arrival from his words, marked provisional', () => {
    const run = { clock: () => '21:39:40', t: 0, state: 'waiting' };
    const names = L.DEPARTURES.map((d) => d.sev);
    A(names.includes('ХАОН ВЕН О̏СТРЕЛ') && names.includes('НАВАРЕЖНОН ВАЪТАК') && names.includes('КИРОВА'), names.join());
    A(L.TERMINUS.sev === 'БЕЛЯГОРСК - АЛЄЙКА АЗВЕСТЯ', L.TERMINUS.sev);
    A(L.departures(run, false).every((r) => [...(r[0] + '  ' + r[1]).normalize('NFC')].length <= 32), 'a row overhangs');
    A(!/Беляорск/.test(L.STAFF_TALK.depart), 'the slip');
    A(L.STAFF_TALK.arrive.startsWith('лаксъскава Белягорск - Алєйка Азвестя. то̏ва древ виънеш.'), L.STAFF_TALK.arrive);
    const sv = readFileSync(new URL('../src/game/core/severian.js', import.meta.url), 'utf8');
    A(/confirmed by Rhys/.test(sv) && /arriving: /.test(sv.slice(sv.indexOf('PROVISIONAL'))), 'not marked confirmed');
  });
  T('corrections: лошлъ, конє, мїлён', () => { A(CANON.bad === 'лошлъ' && CANON.horse === 'конє' && CANON.million === 'мїлён', 'words'); A(negate('ё') === 'ё ня' && negate('ї') === 'ї нє', 'composed letters'); });
  done();
});
function done() {
console.log('\n' + '='.repeat(50));
if (fails.length) { console.log('FAILURES (' + fails.length + '):'); for (const f of fails) console.log('  * ' + f); process.exit(1); }
console.log('ALL ' + pass + ' PASSED');
}
