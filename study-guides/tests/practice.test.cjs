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

test('rounding (half rounds up; carries through 9s)', () => {
  assert.strictEqual(ans('round', '4.735', 'whole'), '5');
  assert.strictEqual(ans('round', '4.735', 't'), '4.7');
  assert.strictEqual(ans('round', '4.735', 'h'), '4.74');
  assert.strictEqual(ans('round', '9.5', 'whole'), '10');
  assert.strictEqual(ans('round', '7.96', 't'), '8.0');
  assert.strictEqual(ans('round', '3.995', 'h'), '4.00');
});

test('adding and subtracting (the required 3.45 + 2.27 and 8.20 − 3.76 examples)', () => {
  assert.strictEqual(ans('add', '3.45', '2.27'), '5.72');
  assert.match(CALC.add('3.45', '2.27')[1], /Hundredths: 5 \+ 7 = 12, write 2, carry 1/);
  assert.strictEqual(ans('add', '4.6', '2.35'), '6.95');
  assert.strictEqual(ans('add', '2.45', '1.8', '0.75'), '5.00');
  assert.strictEqual(ans('sub', '8.20', '3.76'), '4.44');
  assert.match(CALC.sub('8.20', '3.76')[1], /Tenths \(2 became 1\): 1 < 7, regroup: 11 − 7 = 4/);
  assert.strictEqual(ans('sub', '5', '2.36'), '2.64');
  assert.strictEqual(ans('sub', '10.02', '4.65'), '5.37');
  assert.throws(() => CALC.sub('2.1', '3'), /</);
});

test('multiplying (the required 2.4 × 3 example)', () => {
  assert.strictEqual(ans('mul', '2.4', '3'), '7.2');
  assert.strictEqual(ans('mulg', '2.4', '3'), '7.2');
  assert.strictEqual(ans('mul', '0.3', '0.4'), '0.12');
  assert.strictEqual(ans('mula', '0.3', '0.4'), '0.12');
  assert.strictEqual(ans('mul', '2.5', '1.4'), '3.5');
  assert.strictEqual(ans('mul', '0.6', '0.05'), '0.03');
  assert.strictEqual(ans('x10', '3.45', '100'), '345');
  assert.strictEqual(ans('est', 'x', '4.8', '3.1'), '15');
});

test('dividing (the required 6.4 ÷ 2 example)', () => {
  assert.strictEqual(ans('div', '6.4', '2'), '3.2');
  assert.strictEqual(ans('divg', '6.4', '2'), '3.2');
  assert.match(CALC.divg('6.4', '2')[1], /64 tenths/);
  assert.strictEqual(ans('div', '7', '4'), '1.75');
  assert.strictEqual(ans('div', '4.8', '0.6'), '8');
  assert.strictEqual(ans('div', '4.2', '0.06'), '70');
  assert.strictEqual(ans('d10', '34.5', '100'), '0.345');
  assert.throws(() => CALC.div('1', '3'), /not exact/);
});

test('choose the operation', () => {
  assert.strictEqual(ans('opw', 'sub', '10', '6.45'), 'Subtract: 3.55');
  assert.strictEqual(ans('opw', 'div', '6', '0.75'), 'Divide: 8');
});
