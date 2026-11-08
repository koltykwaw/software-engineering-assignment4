import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { checkAvailability } from '@/lib/availability';
import { SAMPLE_BOOKINGS, SAMPLE_ROOMS } from '@/lib/data';
import { filterRooms } from '@/lib/filterRooms';

describe('sample fixtures', () => {
  test('catalog has five rooms with equipment, one blocked room and seven bookings', () => {
    assert.deepEqual(
      SAMPLE_ROOMS.map((r) => r.id),
      ['R1', 'R2', 'R3', 'R4', 'R5'],
    );
    assert.equal(SAMPLE_ROOMS.filter((r) => r.blocked).length, 1);
    assert.ok(SAMPLE_ROOMS.every((r) => r.equipment.length > 0));
    assert.equal(SAMPLE_BOOKINGS.length, 7);
    assert.ok(SAMPLE_BOOKINGS.some((b) => b.roomId === 'R3'));
  });

  test('filtering and checking leave the fixtures unchanged', () => {
    const before = JSON.stringify([SAMPLE_ROOMS, SAMPLE_BOOKINGS]);
    filterRooms(SAMPLE_ROOMS, { attendees: 10, equipment: ['Projector'] });
    checkAvailability({ roomId: 'R1', start: 630, end: 660 }, SAMPLE_ROOMS, SAMPLE_BOOKINGS, 480);
    checkAvailability({ roomId: 'R3', start: 720, end: 780 }, SAMPLE_ROOMS, SAMPLE_BOOKINGS, 540);
    assert.equal(JSON.stringify([SAMPLE_ROOMS, SAMPLE_BOOKINGS]), before);
  });
});
