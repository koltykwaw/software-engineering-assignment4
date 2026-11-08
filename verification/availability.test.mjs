import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const source = resolve(process.env.SMART_CAMPUS_SOURCE ?? 'src');
const { checkAvailability } = await import(pathToFileURL(resolve(source, 'lib/availability.ts')).href);

const rooms = Object.freeze([
  Object.freeze({ id: 'R1', name: 'Athena Hall', blocked: false, capacity: 120 }),
  Object.freeze({ id: 'R2', name: 'Newton Lab', blocked: false, capacity: 40 }),
  Object.freeze({ id: 'R3', name: 'Da Vinci Studio', blocked: true, capacity: 25 }),
]);
const bookings = Object.freeze([
  Object.freeze({ id: 'B1', roomId: 'R1', title: 'Class', start: 600, end: 660 }),
]);
const now = 540;

function check(start, end, roomId = 'R1') {
  return checkAvailability({ roomId, start, end }, rooms, bookings, now);
}

test('AC1 rejects a reversed interval', () => assert.match(check(570, 560).reason, /earlier than end/i));
test('AC1 rejects an equal start and end', () => assert.match(check(570, 570).reason, /earlier than end/i));
test('AC1 rejects a start before now', () => assert.match(check(539, 570).reason, /current time/i));
test('AC1 rejects a start equal to now', () => assert.match(check(540, 570).reason ?? '', /current time/i));
test('AC1 rejects fractional minutes', () => assert.match(check(570.5, 585).reason ?? '', /valid start and end/i));
test('AC1 rejects a missing time', () => assert.match(check(NaN, 585).reason, /valid start and end/i));
test('AC1 accepts an end at 1440', () => assert.equal(check(1410, 1440).status, 'available'));
test('AC1 rejects an end past 1440', () => assert.match(check(1410, 1441).reason, /between/i));
test('AC2 allows exactly 120 minutes', () => assert.equal(check(720, 840).status, 'available'));
test('AC2 rejects 121 minutes', () => assert.match(check(720, 841).reason, /120 minutes/i));
test('AC3 and F3 reject a blocked room during a free slot', () => assert.match(check(570, 585, 'R3').reason, /blocked/i));
test('AC4 allows both touching endpoints', () => {
  assert.equal(check(570, 600).status, 'available');
  assert.equal(check(660, 690).status, 'available');
});
test('AC4 rejects a one-minute overlap', () => assert.match(check(570, 601).reason, /overlaps/i));
test('AC4 only considers bookings for the chosen room', () => {
  assert.equal(check(610, 640, 'R1').status, 'unavailable');
  assert.equal(check(610, 640, 'R2').status, 'available');
});
test('AC5 does not mutate request, room or booking data across repeated checks', () => {
  const request = Object.freeze({ start: 610, end: 640, roomId: 'R1' });
  const before = structuredClone({ request, rooms, bookings });
  assert.deepEqual(checkAvailability(request, rooms, bookings, now), checkAvailability(request, rooms, bookings, now));
  assert.deepEqual({ request, rooms, bookings }, before);
});
