import sys
from openpyxl import load_workbook
from PIL import Image, ImageDraw, ImageFont
COL = {'W':(74,79,85),'G':(169,214,240),'D':(176,122,69),'L':(232,145,58),'R':(192,57,43),'S':(242,209,107),'A':(179,157,219),
       'C':(217,195,160),'E':(124,196,127),'X':(46,158,79),'O':(245,196,0),'K':(255,230,128),'T':(77,182,172),'H':(230,179,230),
       'V':(143,163,184),'~':(91,155,213)}
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 9)
except: font = ImageFont.load_default()
def cell_colour(v):
    u = v.upper().strip()
    if u in COL: return COL[u]
    if u.startswith('P') and (len(u) == 1 or u[1:].split()[0].isdigit()): return (229,115,115)
    if u.startswith('R') and len(u) > 1 and u[1:].isdigit(): return (248,200,200)
    return None
f, out = sys.argv[1], sys.argv[2]
wb = load_workbook(f, data_only=True)
names = [n for n in wb.sheetnames if n.startswith('Floor') or n in ('Basement', 'Roof', 'Roof Terrace')]
S = 16
for n in names:
    ws = wb[n]
    img = Image.new('RGB', (S * 62, S * 60), 'white'); d = ImageDraw.Draw(img)
    for row in ws.iter_rows(min_row=2):
        for c in row:
            if c.column < 2 or c.value in (None, ''): continue
            x, y = c.column - 2, c.row - 2
            v = str(c.value)
            col = cell_colour(v)
            X, Y = S + x * S, S + y * S
            if col: d.rectangle([X, Y, X + S - 1, Y + S - 1], fill=col)
            if col is None or len(v) <= 3:
                d.text((X + 1, Y + 3), v[:3], fill=(0, 0, 0) if col is None or sum(col) > 380 else (255, 255, 255), font=font)
    for i in range(0, 60, 5):
        d.text((S + i * S, 2), str(i), fill=(120, 0, 0), font=font); d.text((0, S + i * S + 3), str(i), fill=(120, 0, 0), font=font)
        d.line([(S + i * S, S), (S + i * S, S * 60)], fill=(225, 225, 225)); d.line([(S, S + i * S), (S * 62, S + i * S)], fill=(225, 225, 225))
    img.save(f'{out}_{n.replace(" ", "_")}.png')
    print('drew', n)
