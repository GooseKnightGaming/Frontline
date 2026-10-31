// FRONTLINE - Severian, from Rhys's reference (Severian.docx, Severian Cases.xlsx, the alphabet and
// romanisation sheet: his early draft, M6.20.12). The language's text lives here, kept apart from its
// English, exactly as Rhys spelled it - combining marks and all (О̏ is О + U+030F; never normalise it away).
//
// CANON: words and phrases Rhys has established. Use these.
// Anything in the game not drawn from CANON is still the old placeholder, until Rhys supplies the real
// form (listed in FRONTLINE_HANDOVER.md under M6.20.12) - nothing here is invented.

export const CANON = {
  coffee: 'ко̏фиъ',                 // ko"fi#
  newspapers: 'газети',             // gazeti: newspaper / newspapers
  inService: 'обслувани',           // running, in service, operational
  notInService: 'обслувани нє',     // not in service (NOT the same as закворына, closed)
  closed: 'закворына',              // inaccessible for use: closed, locked, disused
  tonight: 'то̏ванно̏ԏч',            // literally "this night"
  goodJourney: 'џенъ вияж',         // "Good journey!" - no verb "have" in it
  teaOrCoffee: 'чочԏ ча ѕ ко̏фиъ?', // "Would you like tea or coffee?"
  evening: 'звїечо̏р',
  night: 'но̏ԏч',
  midnight: 'полнотч',
  weather: 'времска',
  snow: 'шниъг',
  minutes: 'мїнуԏ',
  hour: 'хóран', hours: 'хóра',
  seconds: 'кшаъна',
  // (Rhys's answers) the station
  platform: 'пиятфо̏ма',            // no р: the long о̏ stands for it ("Platfo"rma" was a slip). Numbers in digits
  platformShort: 'Пл.',             // its short form - an л the long form lacks, as shorthands will
  departures: 'лажах',
  leaving: 'остаъви',
  train: 'древ',
  door: 'жвԁ',                      // door(s)
  safely: 'безпино',
  stand: 'стайат',
  please: 'прешже',
  bad: 'лошлъ',                     // loshl# - ъ, not ы
  horse: 'конє',                    // konje - є
  million: 'мїлён',
  // (Rhys) places
  north: 'ваътак', quay: 'наварежно', northQuay: 'Наварежнон Ваътак',
  port: 'хаон', portOstrel: 'Хаон вен О̏стрел',        // Port Ȍstrel: "port of Ȍstrel" (the genitive's вен)
  novomir: 'Новомир', central: 'сентраълы', novomirCentral: 'Новомир Сентраълы',
  belyagorsk: 'Белягорск', kirova: 'Кирова', alyejkaAzvestya: 'Алєйка Азвестя',
  welcome: 'лаксъскава',            // welcome (a greeting)
  terminates: 'виънеш',             // terminates, finishes
  // the 21:40's departure announcement, as Rhys wrote it (Белягорск-е - the г was a slip)
  departing: 'древ васдат-оден и зорок до Белягорск-е ра веск',
  standClear: 'стайат безпино ѵ жвԁ, прешже',
  // the kiosk's greeting, the first time (Rhys: then English, once he realises you are not Severian)
  kioskHello: 'џенъ звїечо̏р. чочԏ ко̏фиъ ѕ газети',
};
// (confirmed by Rhys, M6.20.15: "That looks right") the arrival announcement, built from his words:
// "Welcome to Belyagorsk - Alyejka Azvestya, where this train terminates" as a railway fragment: the greeting
// and the station's name; then "this train terminates" - то̏ва before its noun (as in то̏ванно̏ԏч), the verb
// last (as веск in the departure). No word for "where" or "to" is assumed.
export const PROVISIONAL = {
  arriving: CANON.welcome + ' ' + CANON.belyagorsk + ' - ' + CANON.alyejkaAzvestya + '. то̏ва ' + CANON.train + ' ' + CANON.terminates,
};

// the negative particle (Severian.docx 3.4): ня after a word whose last vowel is /o u ɨ ɔ/, нє after
// /a ɛ i/ - Severian counts /a/ a front vowel. A word ending in a consonant: its last vowel decides.
const BACK = new Set(['о', 'у', 'ы', 'ё', 'ю']), FRONT = new Set(['а', 'е', 'и', 'я', 'є', 'ї']);
export function negate(phrase) {
  const w = phrase.trim().split(/\s+/).pop().toLowerCase();
  const chars = [...w.normalize('NFC')];          // composed: ё ї й stay themselves (ё is /jo/, back)
  for (let i = chars.length - 1; i >= 0; i--) {
    const c = chars[i];
    if (c === '̏') continue;                                   // the double grave rides on о: о̏ /ɔ/ is back
    if (BACK.has(c)) return phrase + ' ня';
    if (FRONT.has(c)) return phrase + ' нє';
  }
  return null;                                                     // no vowel to go by: not established
}
