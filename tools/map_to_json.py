# FRONTLINE - turn one of Rhys's map spreadsheets into JSON the game reads.
#   python3 tools/map_to_json.py maps/Frontline_Map_Riverside_Hotel.xlsx src/game/levels/maps/riverside.json
# Each floor becomes rows of one-letter codes (the Key tab: W wall, G glass,
# D door, L locked, R reinforced, S stairs, A ladder, C cover, E way in,
# X extraction, O objective, K item, T terminal, H hostage, V vehicle,
# ~ water, P guard post, . open). Longer text (room names, UP/DN, route
# marks R1...) goes in a list of labels with where it was written.
import sys, json
from openpyxl import load_workbook
src, out = sys.argv[1], sys.argv[2]
wb = load_workbook(src, data_only=True)
floors, labels = {}, []
names = [n for n in wb.sheetnames if n.startswith('Floor') or n in ('Basement', 'Roof', 'Roof Terrace')]
for n in names:
    ws = wb[n]
    key = {'Basement': 'B', 'Roof': 'R', 'Roof Terrace': 'RT'}.get(n, n.replace('Floor ', ''))
    cells = {}
    for row in ws.iter_rows(min_row=2):
        for c in row:
            if c.column < 2 or c.value in (None, ''): continue
            x, y, v = c.column - 2, c.row - 2, str(c.value).strip()
            u = v.upper()
            if not u: continue
            if len(u) == 1: cells[(x, y)] = u
            elif u[0] == 'P' and u[1:].replace(' ', '').isalnum() and any(ch.isdigit() for ch in u):
                cells[(x, y)] = 'P'; labels.append([v, key, x, y])
            else: labels.append([v, key, x, y])
    w = max([x for x, _ in cells] + [0]) + 1
    h = max([y for _, y in cells] + [0]) + 1
    floors[key] = [''.join(cells.get((x, y), '.') for x in range(w)) for y in range(h)]
# the Guards tab (M6.10.0): one row per guard - id, floor, post, patrol, rank,
# weapon, temperament, notes. A post typed as "17, 10" can arrive as a date
# (Sheets reads it as 17 October): day = x, month = y.
guards = []
if 'Guards' in wb.sheetnames:
    import datetime
    for row in wb['Guards'].iter_rows(min_row=4, values_only=True):
        gid = row[0]
        if not gid or not str(gid).strip().upper().startswith('P') or not any(ch.isdigit() for ch in str(gid)): continue
        fl = row[1]
        fl = str(int(fl)) if isinstance(fl, float) else str(fl).strip()
        post = row[2]
        if isinstance(post, (datetime.date, datetime.datetime)): post = [post.day, post.month]
        elif post: post = [int(v) for v in str(post).replace(' ', '').split(',')[:2]]
        else: post = None
        guards.append({'id': str(gid).strip().upper().replace(' ', ''), 'floor': fl, 'post': post, 'patrol': row[3] or '',
                       'rank': (row[4] or 'guard').strip().lower(), 'weapon': (row[5] or 'carbine').strip().lower(),
                       'temper': (row[6] or 'bold').strip().lower(), 'notes': row[7] or ''})
json.dump({'source': src.split('/')[-1], 'floors': floors, 'labels': labels, 'guards': guards}, open(out, 'w'), indent=0)
print('wrote', out, {k: (len(v[0]) if v else 0, len(v)) for k, v in floors.items()}, len(labels), 'labels')
