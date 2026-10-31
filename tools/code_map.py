# FRONTLINE - remakes docs/CODE_MAP.md from each source file's opening comment.
#   python3 tools/code_map.py        (from the repository's root)
import os, re
FOLDERS = {
    'src/game': 'The game in the browser',
    'src/game/core': 'Input, sound, music, voices, saves',
    'src/game/draw': 'Drawing: the scene, people, weapons, vehicles, the HUD pictures',
    'src/game/levels': 'The levels and what runs them',
    'src/game/levels/drafts': 'The first-draft levels (specs for the level kit)',
    'src/sim/people': 'People: you, guards, hostages, what they know',
    'src/sim/world': 'The world: shapes, doors, lifts, paths, light',
    'src/sim/arms': 'Weapons and loadouts',
    'src/sim/play': 'Missions, story, the training course, battles',
    'src/sim/vehicles': 'Driving',
}
def summary(path):
    txt = []
    for ln in open(path, encoding='utf8').read().split('\n')[:12]:
        s = ln.strip()
        if s.startswith('//'):
            s = s[2:].strip()
            if not s and txt: break
            if s: txt.append(s)
        elif txt: break
    t = re.sub(r'^FRONTLINE\s*-\s*', '', ' '.join(txt))
    return (t[:230] + '…') if len(t) > 230 else t
out = ['# Frontline - where the code is', '',
       "Made from each file's opening comment by `python3 tools/code_map.py`. The rules (`src/sim/`) never draw; the game (`src/game/`) draws and plays them.", '']
for d, title in FOLDERS.items():
    out += [f'## `{d}/` - {title}', '', '| File | Lines | What it is |', '|---|---|---|']
    for f in sorted(os.listdir(d)):
        p = os.path.join(d, f)
        if f.endswith('.js'):
            n = sum(1 for _ in open(p, encoding='utf8'))
            out.append(f"| `{f}` | {n} | {summary(p).replace('|', '/')} |")
    out.append('')
open('docs/CODE_MAP.md', 'w').write('\n'.join(out))
print('docs/CODE_MAP.md written')
