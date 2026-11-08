"""Build chapter-5/data/{manifest,fields,questions}.json from the page images, Lesson 5-1's audited data
(pages 143-146) and the parts in chapter-5/data/parts/. Run: python tools/build-chapter5.py
"""
import json, sys, glob, os
sys.path.insert(0, os.path.dirname(__file__))
from chapter5_sections import SECTIONS
from pathlib import Path
root = Path(__file__).resolve().parents[1]
c5 = root / 'chapter-5/data'
pages_meta = json.loads((c5 / 'pages.json').read_text())
l51 = root / 'lesson-5-1/data'
m51 = json.loads((l51 / 'manifest.json').read_text())
fields = {p['number']: [] for p in pages_meta['pages']}
questions = {p['number']: [] for p in pages_meta['pages']}
headings = {p['number']: '' for p in pages_meta['pages']}
titles = {'5-1': m51['title']}
# Lesson 5-1: reuse the audited GML-005 data unchanged.
for p, fs in json.loads((l51 / 'fields.json').read_text()).items(): fields[p] = fs
for p, qs in json.loads((l51 / 'questions.json').read_text()).items(): questions[p] = qs
for p in m51['pages']: headings[p['number']] = p['section']
owned = {}
for path in sorted(glob.glob(str(c5 / 'parts/*.json'))):
    part = json.loads(open(path).read())
    for sid, s in part.get('sections', {}).items(): titles[sid] = s['title']
    for p, page in part.get('pages', {}).items():
        if p in owned: raise SystemExit(f'page {p} is in both {owned[p]} and {path}')
        if p in ('143', '144', '145', '146'): raise SystemExit(f'{path}: pages 143-146 come from lesson-5-1/data')
        owned[p] = path
        fields[p] = page.get('fields', []); questions[p] = page.get('questions', []); headings[p] = page.get('heading', '')
manifest = {
    'book': 'chapter-5', 'title': 'Unit 5 · Multiply Multi-Digit Whole Numbers',
    'sourceUrl': m51['sourceUrl'], 'sourceSha256': pages_meta['sourceSha256'], 'sourcePages': pages_meta['sourcePages'],
    'sourceDimensions': [612, 792], 'render': m51['render'] + '; losslessly recompressed (identical pixels)',
    'sections': [{**s, 'title': titles.get(s['id'], '')} for s in SECTIONS],
    'pages': [{**p, 'heading': headings[p['number']], 'section': next(s['id'] for s in SECTIONS if p['number'] in s['pages'])} for p in pages_meta['pages']],
}
for name, data in (('manifest', manifest), ('fields', fields), ('questions', questions)):
    (c5 / f'{name}.json').write_text(json.dumps(data, indent=1, ensure_ascii=False) + '\n')
print('built:', sum(len(q) for q in questions.values()), 'questions on', sum(1 for q in questions.values() if q), 'pages; parts:', len(set(owned.values())))
