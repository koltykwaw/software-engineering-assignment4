export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
}

export interface RoomFilter {
  attendees: number;
  equipment: string[];
}

export interface Booking {
  id: string;
  roomId: string;
  title: string;
  start: number; // minutes from 00:00
  end: number; // minutes from 00:00
}

export type AvailabilityResult =
  | { status: 'available'; message: string }
  | { status: 'unavailable'; reason: string };

export interface CheckRequest {
  roomId: string;
  start: number;
  end: number;
}
