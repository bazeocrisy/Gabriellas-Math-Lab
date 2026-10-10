// Unit tests for the answer calculators in assets/practice.js. Run: npm test (from study-guides/).
const test = require('node:test');
const assert = require('node:assert');

globalThis.window = globalThis;
globalThis.document = { querySelectorAll: () => [] };
require('../assets/practice.js');
const { CALC, D, fmt } = globalThis.StudyMath;
const ans = (name, ...args) => CALC[name](...args)[0];

test('exact decimals: no floating-point error', () => {
  assert.strictEqual(fmt(D('0.1') + D('0.2')), '0.3');
  assert.strictEqual(fmt(D('4.735')), '4.735');
  assert.strictEqual(fmt(D('0.50')), '0.5');
  assert.strictEqual(fmt(D('3.05'), 2), '3.05');
});

test('whole-number part, part less than one, between', () => {
  assert.strictEqual(ans('whole', '15.48'), '15');
  assert.strictEqual(ans('decpart', '20.375'), '0.375');
  assert.strictEqual(ans('between', '4.735'), '4 and 5');
  assert.strictEqual(ans('between', '0.86'), '0 and 1');
});

test('place and value of a digit (the required 4.735 example)', () => {
  assert.strictEqual(ans('value', '4.735', '4'), '4');
  assert.strictEqual(ans('value', '4.735', '7'), '0.7');
  assert.strictEqual(ans('value', '4.735', '3'), '0.03');
  assert.strictEqual(ans('value', '4.735', '5'), '0.005');
  assert.strictEqual(ans('place', '4.735', '3'), 'hundredths');
  assert.strictEqual(ans('place', '26.4', '2'), 'tens');
  assert.strictEqual(ans('value', '12.48', '1'), '10');
  assert.strictEqual(ans('digit', '9.384', 'h'), '8');
  assert.throws(() => ans('value', '6.666', '6'), /exactly once/);
});

test('ten-times relationships', () => {
  assert.strictEqual(ans('convert', '3', 't', 'h'), '30');
  assert.strictEqual(ans('convert', '40', 'h', 't'), '4');
  assert.strictEqual(ans('convert', '1', 't', 'th'), '100');
  assert.strictEqual(ans('times', '0.7', '0.07'), '10');
  assert.strictEqual(ans('times', '0.5', '0.005'), '100');
});

test('expanded and standard form', () => {
  assert.strictEqual(ans('expanded', '4.735'), '4 + 0.7 + 0.03 + 0.005');
  assert.strictEqual(ans('expanded', '30.605'), '30 + 0.6 + 0.005');
  assert.strictEqual(ans('standard', '5', '+', '0.2', '+', '0.009'), '5.209');
  assert.strictEqual(ans('standard', '0.004 + 3 + 0.1'.replace(/ /g, '')), '3.104');
});

test('equivalent decimals and comparing', () => {
  assert.strictEqual(ans('same', '0.5', '0.50'), 'yes');
  assert.strictEqual(ans('same', '0.6', '0.06'), 'no');
  assert.strictEqual(ans('cmp', '0.8', '0.75'), '>');
  assert.strictEqual(ans('cmp', '0.25', '0.250'), '=');
});

test('word form', () => {
  assert.strictEqual(ans('words', '4.735'), 'four and seven hundred thirty-five thousandths');
  assert.strictEqual(ans('words', '0.07'), 'seven hundredths');
  assert.strictEqual(ans('words', '0.1'), 'one tenth');
  assert.strictEqual(ans('words', '16.08'), 'sixteen and eight hundredths');
  assert.strictEqual(ans('words', '0.209'), 'two hundred nine thousandths');
  assert.strictEqual(ans('fromwords', '6.08'), '6.08');
});

test('comparing and ordering (the required 0.8 and 0.75 example)', () => {
  assert.strictEqual(ans('cmp', '0.8', '0.75'), '>');
  assert.match(CALC.cmp('0.8', '0.75')[1], /tenths, 8 > 7/);
  assert.strictEqual(ans('cmp', '0.512', '0.52'), '<');
  assert.strictEqual(ans('cmp', '2.1', '1.99'), '>');
  assert.strictEqual(ans('order', 'asc', '0.5', '0.45', '0.405'), '0.405, 0.45, 0.5');
  assert.strictEqual(ans('order', 'desc', '1.2', '1.02', '1.202'), '1.202, 1.2, 1.02');
  assert.throws(() => ans('order', 'asc', '0.5', '0.50'), /different values/);
});
