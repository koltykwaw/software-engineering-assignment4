import type { Room, RoomFilter } from './types';

export function parseAttendeeCount(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const count = Number(trimmed);
  return count >= 1 ? count : null;
}

export function getEquipmentOptions(rooms: Room[]): string[] {
  return [...new Set(rooms.flatMap((room) => room.equipment))].sort((a, b) => a.localeCompare(b));
}

/** Keeps rooms with enough capacity and every requested item. Blocked rooms stay in the result. */
export function filterRooms(rooms: Room[], filter: RoomFilter): Room[] {
  return rooms.filter(
    (room) =>
      room.capacity >= filter.attendees &&
      filter.equipment.every((item) => room.equipment.includes(item)),
  );
}
