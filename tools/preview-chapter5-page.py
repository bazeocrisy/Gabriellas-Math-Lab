"""Draw a part's answer boxes (blue), question crops (green) and ? buttons (red) over a page image.
Run: python tools/preview-chapter5-page.py chapter-5/data/parts/<name>.json 147 out.png
The output is for checking placement only; it is never used by the app.
"""
import json, sys
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
root = Path(__file__).resolve().parents[1]
part, p, out = json.load(open(sys.argv[1])), sys.argv[2], sys.argv[3]
im = Image.open(root / f'chapter-5/assets/page-{p}.png').convert('RGB')
pad = 160
W, H = im.size
canvas = Image.new('RGB', (W + 2 * pad, H), 'white'); canvas.paste(im, (pad, 0))
d = ImageDraw.Draw(canvas)
try: font = ImageFont.load_default(size=34)
except TypeError: font = None
page = part['pages'].get(p, {})
box = lambda r: [pad + r[0] * W, r[1] * H, pad + (r[0] + r[2]) * W, (r[1] + r[3]) * H]
for f in page.get('fields', []):
    d.rectangle(box(f['rect']), outline=(30, 90, 220), width=5); d.text((pad + f['rect'][0] * W + 6, f['rect'][1] * H + 4), f['id'], fill=(30, 90, 220), font=font)
for q in page.get('questions', []):
    d.rectangle(box(q['crop']), outline=(20, 160, 90), width=4)
    y = q['anchor'] * H; x = pad / 2 if q['side'] == 'left' else W + pad * 1.5
    d.ellipse([x - 45, y - 45, x + 45, y + 45], outline=(220, 30, 30), width=8); d.text((x - 30, y - 18), q['id'], fill=(220, 30, 30), font=font)
canvas.resize(((W + 2 * pad) // 2, H // 2)).save(out)
print('wrote', out)
