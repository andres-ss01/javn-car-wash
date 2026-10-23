import test from 'node:test'; import assert from 'node:assert/strict';
import { isEmail, isPhone, isPlate, isPassword, isYear } from '../js/utils/validators.js';
import { money, pick, hhmm } from '../js/utils/format.js';
test('validadores', () => {
  assert.ok(isEmail('a@b.mx')); assert.ok(!isEmail('a@b')); assert.ok(isPhone('4421234567')); assert.ok(!isPhone('123'));
  assert.ok(isPlate('ABC-123')); assert.ok(!isPlate('A1')); assert.ok(isPassword('12345678')); assert.ok(!isPassword('123')); assert.ok(isYear('2020')); assert.ok(!isYear('1800'));
});
test('formato', () => { assert.equal(money(1500), '$1,500'); assert.equal(pick({ b: 2 }, 'a', 'b'), 2); assert.equal(hhmm('2026-10-26 15:30:00'), '15:30'); });
