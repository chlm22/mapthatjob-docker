const test = require('node:test');
const assert = require('node:assert/strict');
const { cleanLocation, InvalidInput } = require('../validate');

test('cleanLocation allows valid city names', () => {
  const result = cleanLocation('Ann Arbor, MI', 'Fallback');
  assert.strictEqual(result, 'Ann Arbor, MI');
});

test('cleanLocation uses fallback when empty', () => {
  const result = cleanLocation('', 'Detroit, Michigan');
  assert.strictEqual(result, 'Detroit, Michigan');
});

test('cleanLocation throws InvalidInput on dangerous characters', () => {
  assert.throws(() => {
    cleanLocation('<script>alert("hack")</script>', 'Fallback');
  }, InvalidInput);
});

test('cleanLocation enforces maximum length', () => {
  const longString = 'A'.repeat(101);
  assert.throws(() => {
    cleanLocation(longString, 'Fallback');
  }, InvalidInput);
});