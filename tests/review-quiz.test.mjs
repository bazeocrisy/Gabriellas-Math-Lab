import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const quiz = JSON.parse(fs.readFileSync(new URL('../chapter-5/review/quiz.json', import.meta.url)));
const Q = quiz.questions;
test('24 questions: 8 multiple choice, 8 fill in the blank, 8 true or false, unique ids', () => {
  assert.equal(Q.length, 24);
  for (const t of ['mc', 'fill', 'tf']) assert.equal(Q.filter((q) => q.type === t).length, 8, t);
  assert.equal(new Set(Q.map((q) => q.id)).size, 24);
});
test('every question has a hint, an explanation and a Unit 5 lesson', () => {
  for (const q of Q) { assert.ok(q.q && q.hint && q.why, q.id); assert.match(q.lesson, /^5-[1-7]$/, q.id); }
});
test('answer keys are well formed', () => {
  for (const q of Q) {
    if (q.type === 'mc') { assert.equal(q.options.length, 4, q.id); assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, q.id); assert.equal(new Set(q.options).size, 4, q.id); }
    if (q.type === 'tf') assert.equal(typeof q.answer, 'boolean', q.id);
    if (q.type === 'fill') assert.match(q.answer, /^[\d,]+$/, q.id);
  }
});
test('arithmetic behind each checked answer is right (independent re-computation)', () => {
  const num = (s) => Number(String(s).replace(/,/g, ''));
  const exp = { q1: 100000, q2: 7000, q3: 16000, q4: 364, q5: 5300, q6: 3240, q8: 100, q9: 4, q10: 60000, q11: 4800, q12: 7176, q13: 918, q14: 12000, q15: 2160, q16: 9640 };
  const byId = Object.fromEntries(Q.map((q) => [q.id, q]));
  assert.equal(10 ** 5, exp.q1); assert.equal(7 * 10 ** 3, exp.q2); assert.equal(400 * 40, exp.q3); assert.equal(26 * 14, exp.q4); assert.equal(53 * 100, exp.q5);
  assert.equal(135 * 24, exp.q6); assert.equal(10 ** 2, exp.q8); assert.equal(6 * 10 ** 4, exp.q10); assert.equal(48 * 100, exp.q11); assert.equal(312 * 23, exp.q12);
  assert.equal(34 * 27, exp.q13); assert.equal(600 + 80 + 210 + 28, exp.q13); assert.equal(600 * 20, exp.q14); assert.equal(144 * 15, exp.q15); assert.equal(1205 * 8, exp.q16);
  for (const id of ['q2', 'q5', 'q6', 'q8']) assert.equal(num(byId[id].options[byId[id].answer]), exp[id], id);
  assert.equal(byId.q1.options[byId.q1.answer], '10 × 10 × 10 × 10 × 10');
  assert.ok(byId.q3.options[byId.q3.answer].endsWith('16,000')); assert.ok(byId.q4.options[byId.q4.answer].split(' + ').map(num).reduce((a, b) => a + b) === exp.q4);
  for (const id of ['q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16']) assert.equal(num(byId[id].answer), exp[id], id);
  const tf = { q17: 10 ** 3 === 30, q18: 25 * 10 ** 2 === 2500, q19: true, q20: 46 * 12 === 552, q21: false, q22: 300 * 40 === 1200, q23: 100 + 50 + 80 + 40 === 18 * 15, q24: 3 * 10 ** 4 === 30000 };
  for (const [id, v] of Object.entries(tf)) assert.equal(byId[id].answer, v, id);
});
