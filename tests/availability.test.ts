import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { checkAvailability } from '@/lib/availability';
import { SAMPLE_BOOKINGS, SAMPLE_ROOMS } from '@/lib/data';
import type { AvailabilityResult } from '@/lib/types';

const m = (hours: number, minutes = 0) => hours * 60 + minutes;

function check(roomId: string, start: number, end: number, now: number): AvailabilityResult {
  return checkAvailability({ roomId, start, end }, SAMPLE_ROOMS, SAMPLE_BOOKINGS, now);
}

describe('AC1: start strictly after simulated now, whole minutes, 24:00 end only', () => {
  test('rejects a start equal to the simulated current time', () => {
    const result = check('R4', m(9), m(10), m(9));
    assert.deepEqual(result, {
      status: 'unavailable',
      reason: 'Start time must be later than the current time.',
    });
  });

  test('accepts a start one minute after the simulated current time', () => {
    assert.equal(check('R4', m(9, 1), m(10), m(9)).status, 'available');
  });

  test('rejects fractional minutes', () => {
    const result = check('R4', m(9) + 0.5, m(10), m(8));
    assert.deepEqual(result, {
      status: 'unavailable',
      reason: 'Please enter valid start and end times.',
    });
  });

  test('accepts 24:00 as an end and displays it without wrapping', () => {
    const result = check('R4', m(23), 1440, m(9));
    assert.equal(result.status, 'available');
    assert.match(result.status === 'available' ? result.message : '', /to 24:00\.$/);
  });

  test('rejects an end beyond 24:00', () => {
    assert.deepEqual(check('R4', m(23, 30), 1441, m(9)), {
      status: 'unavailable',
      reason: 'Times must be between 00:00 and 24:00.',
    });
  });
});

describe('AC2: maximum 120 minutes inclusive', () => {
  test('accepts exactly 120 minutes', () => {
    assert.equal(check('R4', m(9), m(11), m(8)).status, 'available');
  });

  test('rejects 121 minutes', () => {
    assert.deepEqual(check('R4', m(9), m(11, 1), m(8)), {
      status: 'unavailable',
      reason: 'Bookings cannot be longer than 120 minutes.',
    });
  });
});

describe('AC4: overlap with existing bookings of the selected room', () => {
  test('touching endpoints are allowed on both sides', () => {
    assert.equal(check('R1', m(10, 30), m(11), m(8)).status, 'available');
    assert.equal(check('R1', m(8, 30), m(9), m(8)).status, 'available');
  });

  test('a one-minute overlap is rejected and names the conflicting booking', () => {
    const result = check('R1', m(10, 29), m(11), m(8));
    assert.equal(result.status, 'unavailable');
    assert.match(
      result.status === 'unavailable' ? result.reason : '',
      /^Overlaps existing booking "Intro to Algorithms"/,
    );
  });

  test('bookings are scoped by room ID', () => {
    assert.equal(check('R2', m(15), m(16), m(8)).status, 'unavailable');
    assert.equal(check('R4', m(15), m(16), m(8)).status, 'available');
  });
});

describe('AC3: blocked rooms are never available', () => {
  test('a free slot in a blocked room is still unavailable', () => {
    assert.deepEqual(check('R3', m(12), m(13), m(9)), {
      status: 'unavailable',
      reason: 'Da Vinci Studio is currently blocked and cannot be booked.',
    });
  });
});

describe('AC5: check only, no mutation of inputs', () => {
  test('checking leaves rooms and bookings unchanged', () => {
    const rooms = structuredClone(SAMPLE_ROOMS);
    const bookings = structuredClone(SAMPLE_BOOKINGS);
    checkAvailability({ roomId: 'R1', start: m(10), end: m(11) }, rooms, bookings, m(8));
    assert.deepEqual(rooms, SAMPLE_ROOMS);
    assert.deepEqual(bookings, SAMPLE_BOOKINGS);
  });

  test('an unknown room is rejected', () => {
    assert.deepEqual(check('R99', m(10), m(11), m(8)), {
      status: 'unavailable',
      reason: 'Please select a valid room.',
    });
  });
});
