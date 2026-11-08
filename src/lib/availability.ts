import { END_OF_DAY, fmtTime } from '@/lib/time';
import type { AvailabilityResult, Booking, CheckRequest, Room } from '@/lib/types';

/** True when [start,end) and [otherStart,otherEnd) overlap. Touching endpoints do NOT overlap. */
function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Evaluate a booking request against all acceptance criteria.
 * Pure function: never mutates rooms or bookings.
 */
export function checkAvailability(
  req: CheckRequest,
  rooms: Room[],
  bookings: Booking[],
  currentMinutes: number,
): AvailabilityResult {
  const { start, end, roomId } = req;

  // AC1: whole-minute interval, start strictly after the simulated current time.
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    return { status: 'unavailable', reason: 'Please enter valid start and end times.' };
  }
  if (start < 0 || end > END_OF_DAY) {
    return { status: 'unavailable', reason: 'Times must be between 00:00 and 24:00.' };
  }
  if (start >= end) {
    return { status: 'unavailable', reason: 'Start time must be earlier than end time.' };
  }
  if (start <= currentMinutes) {
    return { status: 'unavailable', reason: 'Start time must be later than the current time.' };
  }

  // AC2: max 120-minute duration.
  if (end - start > 120) {
    return { status: 'unavailable', reason: 'Bookings cannot be longer than 120 minutes.' };
  }

  const room = rooms.find((r) => r.id === roomId);
  if (!room) {
    return { status: 'unavailable', reason: 'Please select a valid room.' };
  }

  // AC3: blocked room.
  if (room.blocked) {
    return {
      status: 'unavailable',
      reason: `${room.name} is currently blocked and cannot be booked.`,
    };
  }

  // AC4: no overlap with existing bookings (touching endpoints allowed).
  const conflict = bookings
    .filter((b) => b.roomId === roomId)
    .find((b) => overlaps({ start, end }, { start: b.start, end: b.end }));

  if (conflict) {
    return {
      status: 'unavailable',
      reason: `Overlaps existing booking "${conflict.title}" (${fmtTime(conflict.start)}–${fmtTime(conflict.end)}).`,
    };
  }

  return {
    status: 'available',
    message: `${room.name} is available from ${fmtTime(start)} to ${fmtTime(end)}.`,
  };
}
