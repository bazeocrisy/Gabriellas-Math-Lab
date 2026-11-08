"""Validate one Chapter 5 data part written by a page author.
Run: python tools/validate-chapter5-part.py chapter-5/data/parts/<name>.json
Schema:
{
  "sections": {"5-2": {"title": "Multiply by Powers of 10"}},          # titles for the section ids you own
  "pages": {
    "147": {
      "heading": "Be Curious",                                         # short page heading from the page itself
      "fields":    [{"id": "curious", "multi": true, "rect": [x, y, w, h]}],
      "questions": [{"id": "curious", "title": "Be Curious · Which doesn't belong?", "hint": "...",
                     "steps": ["...", "..."], "answer": "...", "openEnded": false,
                     "anchor": 0.70, "side": "right", "crop": [x, y, w, h],
                     "verified": true, "verification": "how the answer was checked"}]
    }
  }
}
All x, y, w, h, anchor values are fractions of the full page (0..1), measured on the page image.
"""
import json, sys
sys.path.insert(0, __import__('os').path.dirname(__file__))
from chapter5_sections import SECTIONS
part = json.load(open(sys.argv[1]))
ids = {s['id'] for s in SECTIONS}
owner = {p: s['id'] for s in SECTIONS for p in s['pages']}
errors = []
def err(m): errors.append(m)
def rect_ok(r): return isinstance(r, list) and len(r) == 4 and all(isinstance(n, (int, float)) and 0 <= n <= 1 for n in r) and r[0] + r[2] <= 1.0001 and r[1] + r[3] <= 1.0001 and r[2] > 0 and r[3] > 0
for sid, s in part.get('sections', {}).items():
    if sid not in ids: err(f'unknown section {sid}')
    if not isinstance(s.get('title'), str) or not s['title'].strip(): err(f'section {sid} needs a title')
for p, page in part.get('pages', {}).items():
    if p not in owner: err(f'page {p} is not in Chapter 5'); continue
    if not isinstance(page.get('heading'), str): err(f'{p}: heading missing')
    fids = [f.get('id') for f in page.get('fields', [])]
    if len(set(fids)) != len(fids): err(f'{p}: duplicate field ids')
    for f in page.get('fields', []):
        if not isinstance(f.get('id'), str) or not f['id']: err(f'{p}: field without id')
        if not rect_ok(f.get('rect')): err(f'{p} field {f.get("id")}: bad rect {f.get("rect")}')
        if not isinstance(f.get('multi'), bool): err(f'{p} field {f.get("id")}: multi must be true/false')
    qids = [q.get('id') for q in page.get('questions', [])]
    if len(set(qids)) != len(qids): err(f'{p}: duplicate question ids')
    for q in page.get('questions', []):
        n = f'{p} question {q.get("id")}'
        if q.get('id') not in fids: err(f'{n}: needs an answer field with the same id')
        for k in ('title', 'hint', 'answer', 'verification'):
            if not isinstance(q.get(k), str) or not q[k].strip(): err(f'{n}: {k} missing')
        if not isinstance(q.get('steps'), list) or not q['steps'] or not all(isinstance(x, str) and x.strip() for x in q['steps']): err(f'{n}: steps must be a non-empty list of strings')
        if q.get('verified') is not True: err(f'{n}: verified must be true (only publish checked answers)')
        if not isinstance(q.get('openEnded'), bool): err(f'{n}: openEnded must be true/false')
        if q.get('side') not in ('left', 'right'): err(f'{n}: side must be left or right')
        if not (isinstance(q.get('anchor'), (int, float)) and 0 <= q['anchor'] <= 1): err(f'{n}: anchor must be 0..1')
        if not rect_ok(q.get('crop')): err(f'{n}: bad crop')
if errors:
    print('\n'.join('FAIL ' + e for e in errors)); sys.exit(1)
print(f"PASS {sys.argv[1]}: {len(part.get('pages', {}))} pages, {sum(len(p.get('questions', [])) for p in part.get('pages', {}).values())} questions")
