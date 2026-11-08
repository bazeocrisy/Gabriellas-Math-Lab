"""Verify protected rasters against the supplied PDF. Requires PyMuPDF.
Run: python tools/audit-lesson51-source.py
This audit reads assets; it never modifies them.
"""
from pathlib import Path
import hashlib
import json
import fitz
root = Path(__file__).resolve().parents[1] / 'lesson-5-1'
manifest = json.loads((root / 'data/manifest.json').read_text())
source = root / 'assets/source.pdf'
assert hashlib.sha256(source.read_bytes()).hexdigest() == manifest['sourceSha256']
doc = fitz.open(source)
assert len(doc) == 38
for page in manifest['pages']:
    expected = doc[page['pdfPage'] - 1].get_pixmap(matrix=fitz.Matrix(3, 3), alpha=False)
    actual = fitz.Pixmap(str(root / page['asset']))
    assert (expected.width, expected.height) == (actual.width, actual.height)
    assert expected.samples == actual.samples, f"Changed pixels: {page['number']}"
    print(f"PASS PDF {page['pdfPage']} → printed {page['number']}: zero differing raster samples, full 1836 × 2376 page")
