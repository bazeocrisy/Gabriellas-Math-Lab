"""Verify every Chapter 5 page image against the supplied PDF, pixel for pixel. Read-only.
Run: python tools/audit-chapter5-source.py   (requires PyMuPDF)
"""
from pathlib import Path
import hashlib, json
import pymupdf as fitz
root = Path(__file__).resolve().parents[1]
src = root / 'lesson-5-1/assets/source.pdf'
meta = json.loads((root / 'chapter-5/data/pages.json').read_text())
assert hashlib.sha256(src.read_bytes()).hexdigest() == meta['sourceSha256']
doc = fitz.open(src)
assert len(doc) == meta['sourcePages'] == 38
for page in meta['pages']:
    expected = doc[page['pdfPage'] - 1].get_pixmap(matrix=fitz.Matrix(3, 3), alpha=False)
    actual = fitz.Pixmap(str(root / 'chapter-5' / page['asset']))
    assert (expected.width, expected.height) == (actual.width, actual.height), page['number']
    assert expected.samples == actual.samples, f"Changed pixels: {page['number']}"
    print(f"PASS PDF {page['pdfPage']} -> printed {page['number']}: identical pixels, {actual.width} x {actual.height}")
