import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE_ROOMS } from '@/lib/data';
import { filterRooms, getEquipmentOptions, parseAttendeeCount } from '@/lib/filterRooms';

const ids = (rooms: { id: string }[]) => rooms.map((r) => r.id);

describe('F1: capacity must be at least the attendee count', () => {
  test('a room with exactly enough capacity matches', () => {
    assert.ok(ids(filterRooms(SAMPLE_ROOMS, { attendees: 40, equipment: [] })).includes('R2'));
  });

  test('a room with insufficient capacity does not match', () => {
    assert.ok(!ids(filterRooms(SAMPLE_ROOMS, { attendees: 41, equipment: [] })).includes('R2'));
  });

  test('no room matches when attendees exceed every capacity', () => {
    assert.deepEqual(filterRooms(SAMPLE_ROOMS, { attendees: 201, equipment: [] }), []);
  });
});

describe('F2: every requested equipment item must be present', () => {
  test('Projector and Whiteboard together match only Newton Lab', () => {
    assert.deepEqual(
      ids(filterRooms(SAMPLE_ROOMS, { attendees: 1, equipment: ['Projector', 'Whiteboard'] })),
      ['R2'],
    );
  });

  test('a room with only one of the requested items does not match', () => {
    assert.deepEqual(
      ids(filterRooms(SAMPLE_ROOMS, { attendees: 1, equipment: ['Microphone', 'Whiteboard'] })),
      [],
    );
  });
});

describe('F3: blocked rooms stay visible in the filtered list', () => {
  test('with no restrictions every catalog room is returned, including blocked ones', () => {
    const all = filterRooms(SAMPLE_ROOMS, { attendees: 1, equipment: [] });
    assert.deepEqual(ids(all), ['R1', 'R2', 'R3', 'R4', 'R5']);
    assert.equal(all.find((r) => r.id === 'R3')?.blocked, true);
  });
});

describe('F4: empty results and attendee parsing', () => {
  test('parseAttendeeCount rejects zero, negatives, decimals and text', () => {
    for (const bad of ['', '0', '-1', '1.5', 'abc', '1e2']) {
      assert.equal(parseAttendeeCount(bad), null, `expected "${bad}" to be rejected`);
    }
  });

  test('parseAttendeeCount accepts whole numbers with surrounding spaces', () => {
    assert.equal(parseAttendeeCount('1'), 1);
    assert.equal(parseAttendeeCount(' 40 '), 40);
  });
});

describe('F5 support: equipment choices derive from the catalog', () => {
  test('equipment options are unique and sorted', () => {
    assert.deepEqual(getEquipmentOptions(SAMPLE_ROOMS), [
      'Microphone',
      'Projector',
      'Video conferencing',
      'Whiteboard',
    ]);
  });
});
