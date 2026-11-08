import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultWindow, fmtTime, parseTime } from '@/lib/time';

describe('time parsing and formatting', () => {
  test('parses HH:MM into whole minutes', () => {
    assert.equal(parseTime('00:00'), 0);
    assert.equal(parseTime('09:30'), 570);
    assert.equal(parseTime('23:59'), 1439);
  });

  test('rejects malformed or out-of-range times', () => {
    for (const bad of ['9:30', '24:00', '24:01', '12:60', '', 'noon']) {
      assert.equal(parseTime(bad), null, `expected "${bad}" to be rejected`);
    }
  });

  test('accepts 24:00 only when the end-of-day flag is set', () => {
    assert.equal(parseTime('24:00'), null);
    assert.equal(parseTime('24:00', true), 1440);
  });

  test('formats 1440 as 24:00 instead of wrapping to 00:00', () => {
    assert.equal(fmtTime(1440), '24:00');
    assert.equal(fmtTime(0), '00:00');
  });
});

describe('default window clamping', () => {
  test('a mid-morning default is 30 to 90 minutes after now', () => {
    assert.deepEqual(defaultWindow(540), { start: 570, end: 630 });
  });

  test('a late-evening default keeps end at 24:00 and never wraps to 00:00', () => {
    assert.deepEqual(defaultWindow(1380), { start: 1410, end: 1440 });
  });

  test('at 23:59 the default start stays inside the day', () => {
    assert.deepEqual(defaultWindow(1439), { start: 1439, end: 1440 });
  });
});
