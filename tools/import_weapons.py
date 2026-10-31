#!/usr/bin/env python3
"""FRONTLINE - Rhys's weapons sheet (docs/Frontline_Weapons.xlsx) into the game.

Writes src/sim/arms/sheet.js: one catalogue entry per row, in the game's own terms.
Run it again whenever the sheet changes:  python3 tools/import_weapons.py

How the sheet's columns become the game's figures:
  Damage       per shot (a shotgun's is shared out over its 8 pellets; 0 = non-lethal: a dart
               or stun round that knocks out instead)
  Rate (rpm)   seconds between shots = 60 / rpm; 0 is a continuous beam (energy: heat, not rounds)
  Magazine, Reserve, Reload (s), Penetration: as they are
  Effective range (m)   `best`: past it damage falls away
  Recoil       the sheet's service rifle is 0.5; scaled per family to the game's kick
  Spread (mrad)         from the hip; aiming cuts it (a marksman's sight much more)
  Noise        relative to a rifle at 1.0 (`quiet`)
  Slot         Secondary fits the backup slot; the two Utility launchers do too
  Unlock       Standard -> found or captured in the field (guards carry them); Unlock -> earned
               from a mission (which mission: Rhys to say)
Weapons already in the game under the same designation (the class kit: PX-19, HLP-2, V-19P,
IM-8S, HAS-L3, KD-MR3, VX-40, RV-357, V-27C) keep their hand-tuned entries; the rest come from here.
"""
import json, re, sys
import openpyxl

SRC = 'docs/Frontline_Weapons.xlsx'
OUT = 'src/sim/arms/sheet.js'

# sheet family -> game family, weight (kg), model, how it is held, length (m), draw (s), moving spread
KIND = {
    'Anti-materiel':     ('sniper', 13.0, 'Sniper_1', 'SNIPER', 1.40, 0.6, 0.10),
    'Sniper rifle':      ('sniper', 6.0, 'Sniper_1', 'SNIPER', 1.15, 0.45, 0.08),
    'Marksman rifle':    ('sniper', 5.0, 'Sniper_1', 'SNIPER', 1.00, 0.45, 0.06),
    'Assault rifle':     ('rifle', 3.6, 'AR_1', 'RIFLE', 0.80, 0.35, 0.04),
    'Carbine':           ('rifle', 3.2, 'AR_1', 'RIFLE', 0.72, 0.3, 0.04),
    'Battle rifle':      ('rifle', 4.4, 'AR_1', 'RIFLE', 0.95, 0.4, 0.045),
    'Light machine gun': ('rifle', 7.5, 'AR_1', 'RIFLE', 1.05, 0.6, 0.07),
    'Machine gun':       ('rifle', 11.0, 'AR_1', 'RIFLE', 1.15, 0.7, 0.08),
    'Heavy machine gun': ('rifle', 24.0, 'AR_1', 'RIFLE', 1.50, 1.0, 0.12),
    'SMG':               ('smg', 2.8, 'AR_1', 'RIFLE', 0.60, 0.25, 0.028),
    'PDW':               ('smg', 2.3, 'AR_1', 'RIFLE', 0.50, 0.2, 0.022),
    'Machine pistol':    ('smg', 1.6, 'Pistol_1', 'PISTOL', 0.30, 0.15, 0.02),
    'Pistol':            ('pistol', 0.9, 'Pistol_1', 'PISTOL', 0.21, 0.25, 0.03),
    'Revolver':          ('pistol', 1.2, 'Pistol_1', 'PISTOL', 0.25, 0.35, 0.045),
    'Shotgun':           ('shotgun', 3.6, 'AR_1', 'RIFLE', 0.95, 0.3, 0.03),
    'Grenade launcher':  ('launcher', 3.0, 'Grenade_1', 'SNIPER', 0.70, 0.5, 0.05),
    'Rocket launcher':   ('launcher', 6.5, 'Grenade_1', 'SNIPER', 1.10, 0.6, 0.05),
    'Launcher':          ('launcher', 3.5, 'Grenade_1', 'SNIPER', 0.80, 0.5, 0.05),
    'Energy':            ('energy', 3.8, 'AR_1', 'RIFLE', 0.90, 0.35, 0.01),
}
KICK = {'rifle': 0.047, 'smg': 0.047, 'pistol': 0.08, 'shotgun': 0.08, 'sniper': 0.062, 'launcher': 0.1, 'energy': 0.1}

def ident(short):
    return re.sub(r'[^A-Za-z0-9]', '', short).upper()

def title(t):
    t = t.split(' / ')[0].strip()
    return ' '.join(w[:1].upper() + w[1:] for w in t.split(' '))

def r3(v):
    return float('%.4g' % v)

def entry(r):
    (maker, formal, short, nick, typ, fam, slot, cal, dmg, rpm, mag, res, rel, rng, pen, rec, spr, noise,
     _dps, _empty, unlock, role, _notes) = r[:23]
    fam = fam.strip()
    game, kg, model, like, length, draw, move = KIND[fam]
    it = {'name': short + ' ' + title(typ), 'maker': maker, 'nick': (nick or '').split(' / ')[0], 'sheet': True, 'kind': fam.strip(),
          'unlock': 'field' if (unlock or '').strip() == 'Standard' else 'mission'}
    low = typ.lower()
    rpm = float(rpm or 0); dmg = float(dmg or 0); spr = float(spr or 0); rec = float(rec or 0)
    beam = fam == 'Energy' and rpm == 0
    if fam == 'Energy' and not beam:
        # the plasma shotgun and the coil/electromagnetic rifles: rounds, not heat
        if 'shotgun' in low: game, kg, model, like, length = 'shotgun', 4.2, 'AR_1', 'RIFLE', 0.95
        else: game, kg, model, like, length, draw, move = 'sniper', 7.0, 'Sniper_1', 'SNIPER', 1.2, 0.5, 0.07
    it['family'] = game
    if slot == 'Secondary' and game not in ('pistol',): it['size'] = 'backup'
    if slot == 'Utility': it['size'] = 'backup'          # (the game's utility slots hold things thrown or placed)
    it['kg'] = kg
    it['pen'] = int(pen or 0) or 1
    nonlethal = dmg == 0 and fam != 'Launcher'
    if nonlethal:
        it['nonLethal'] = True; it['damage'] = 120          # one dart or stun round puts a man down - asleep
    elif game == 'shotgun' and 'breach' not in low and 'slug' not in low:
        it['pellets'] = 8; it['damage'] = max(1, round(dmg / 8))
    else:
        it['damage'] = int(round(dmg))
    it['best'] = int(round(float(rng or 0)))
    if beam:
        it.update({'energy': True, 'beam': True, 'auto': True, 'rate': 0.1, 'mag': int(mag), 'reserve': 0})
    else:
        it['rate'] = r3(60.0 / rpm) if rpm else 1.0
        it['mag'] = int(mag or 1); it['reserve'] = int(res or 0)
        if game in ('rifle', 'smg') and rpm >= 300: it['auto'] = True
        if 'automatic grenade' in low: it['auto'] = True
    it['reload'] = float(rel or 0) or 0.1
    if game == 'sniper':
        it['spread'] = 0.032 if fam == 'Anti-materiel' else 0.024
        it['adsSpread'] = r3(max(0.0004, spr * 0.0005))
        it['zoom'] = 6 if fam == 'Anti-materiel' else (4 if float(rng) > 300 else 3)
        if fam == 'Sniper rifle' and float(rng) > 400: it['zooms'] = [4, 8]
    elif beam:
        it['spread'] = 0.003; it['adsSpread'] = 0.0008
    elif game == 'shotgun':
        it['spread'] = r3(max(0.02, spr * 0.0019)); it['adsSpread'] = r3(it['spread'] * 0.7)
    else:
        it['spread'] = r3(max(0.004, spr * 0.0024)); it['adsSpread'] = r3(it['spread'] * 0.35)
    it['recoil'] = r3(max(0.002, rec * KICK[game]))
    it['moveSpread'] = move; it['draw'] = draw
    if noise is not None and abs(float(noise) - 1.0) > 0.01: it['quiet'] = r3(float(noise))
    if game == 'launcher':
        rocket = 'rocket' in low or 'anti-armour' in low
        it.update({'launcher': True, 'speed': 48 if rocket else 32, 'blast': 5 if rocket else 4.5, 'roundKg': 2.4 if rocket else 0.23})
        if rocket: it['breach'] = True
        if fam == 'Launcher':           # the EMP launcher: no blast of fire - its pulse is still to come
            it.update({'damage': 0, 'blast': 6, 'emp': True})
    if 'breach' in low: it.update({'breach': True, 'breachReach': 3})
    if fam == 'Anti-materiel': it['roundKg'] = 0.115
    if game == 'shotgun' and int(mag or 0) == 2: it['double'] = True
    it['model'] = model; it['like'] = like; it['length'] = length
    trait = '“' + it['nick'] + '” – ' + maker + '. ' + (role or '').strip()
    if it.get('emp'): trait += ' (Its pulse - shutting down electronics - is still to come.)'
    if nonlethal: trait += ' Non-lethal: knocks out.'
    it['trait'] = trait
    return ident(short), it

def main():
    wb = openpyxl.load_workbook(SRC, data_only=True)
    rows = [r for r in wb['Weapons'].iter_rows(min_row=2, values_only=True) if r[2]]
    out, makers = {}, {}
    for r in rows:
        k, it = entry(r)
        if k in out: sys.exit('two weapons called ' + k)
        out[k] = it
        makers.setdefault(it['maker'], []).append(k)
    styles = {}
    legend = list(wb['Legend'].iter_rows(values_only=True))
    for a, b in legend:
        if a in makers: styles[a] = b
    lines = ['// FRONTLINE - Rhys\'s weapons sheet (docs/Frontline_Weapons.xlsx), in the game\'s terms.',
             '// WRITTEN BY tools/import_weapons.py - change the sheet and run that, not this file.',
             '// (How the sheet\'s columns become these figures: the top of tools/import_weapons.py.)',
             '//   unlock: \'field\'   found or captured in the field - guards carry them (sim/arms/issue.js)',
             '//           \'mission\' earned from a mission (which: Rhys to say)',
             '', '// each maker\'s house style', 'export const MAKERS = ' + json.dumps(styles, ensure_ascii=False, indent=2) + ';', '',
             'export const SHEET = {']
    for maker, ids in makers.items():
        lines.append('  // ' + maker)
        for k in ids:
            lines.append('  ' + k + ': ' + json.dumps(out[k], ensure_ascii=False, separators=(', ', ': ')) + ',')
    lines.append('};')
    open(OUT, 'w').write('\n'.join(lines) + '\n')
    print(len(out), 'weapons from', len(makers), 'makers ->', OUT)

if __name__ == '__main__':
    main()
