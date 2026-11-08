"""Render every page of the Chapter 5 source PDF exactly as Lesson 5-1 was rendered
(PyMuPDF 3x = 216 dpi, full page, PDF rotation honoured, no crop or retouch),
then compress losslessly with oxipng (pixels unchanged; verified by tools/audit-chapter5-source.py).
Run: python tools/render-chapter5.py   (requires PyMuPDF and pyoxipng; writes chapter-5/assets/page-NNN.png and data/pages.json)
"""
from pathlib import Path
import hashlib, json
import oxipng
import pymupdf as fitz
root = Path(__file__).resolve().parents[1]
src = root / 'lesson-5-1/assets/source.pdf'
out = root / 'chapter-5'
(out / 'assets').mkdir(parents=True, exist_ok=True)
doc = fitz.open(src)
pages = []
for i, page in enumerate(doc):
    printed = str(141 + i)
    pix = page.get_pixmap(matrix=fitz.Matrix(3, 3), alpha=False)
    path = out / f'assets/page-{printed}.png'
    pix.save(path)
    oxipng.optimize(path, level=2)
    pages.append({'number': printed, 'pdfPage': i + 1, 'asset': f'assets/page-{printed}.png', 'width': pix.width, 'height': pix.height,
                  'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
(out / 'data/pages.json').write_text(json.dumps({'sourceSha256': hashlib.sha256(src.read_bytes()).hexdigest(), 'sourcePages': len(doc), 'pages': pages}, indent=2))
print(len(pages), 'pages rendered')
