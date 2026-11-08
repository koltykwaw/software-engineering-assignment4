import type { Booking, Room } from './types';

export const SAMPLE_ROOMS: Room[] = [
  {
    id: 'R1',
    name: 'Athena Hall',
    building: 'Block A',
    capacity: 120,
    equipment: ['Projector', 'Microphone'],
    blocked: false,
  },
  {
    id: 'R2',
    name: 'Newton Lab',
    building: 'Block B',
    capacity: 40,
    equipment: ['Projector', 'Whiteboard'],
    blocked: false,
  },
  {
    id: 'R3',
    name: 'Da Vinci Studio',
    building: 'Block C',
    capacity: 25,
    equipment: ['Whiteboard'],
    blocked: true,
  },
  {
    id: 'R4',
    name: 'Curie Seminar Room',
    building: 'Block A',
    capacity: 18,
    equipment: ['Whiteboard', 'Video conferencing'],
    blocked: false,
  },
  {
    id: 'R5',
    name: 'Tesla Auditorium',
    building: 'Block D',
    capacity: 200,
    equipment: ['Projector', 'Microphone', 'Video conferencing'],
    blocked: false,
  },
];

export const SAMPLE_BOOKINGS: Booking[] = [
  { id: 'B1', roomId: 'R1', title: 'Intro to Algorithms', start: 9 * 60, end: 10 * 60 + 30 },
  { id: 'B2', roomId: 'R1', title: 'Faculty Meeting', start: 14 * 60, end: 15 * 60 },
  { id: 'B3', roomId: 'R2', title: 'Physics Lab', start: 11 * 60, end: 12 * 60 + 30 },
  { id: 'B4', roomId: 'R4', title: 'Research Sync', start: 13 * 60, end: 14 * 60 },
  { id: 'B5', roomId: 'R5', title: 'Guest Lecture', start: 16 * 60, end: 17 * 60 + 30 },
  { id: 'B6', roomId: 'R2', title: 'Open Study', start: 15 * 60, end: 16 * 60 },
  { id: 'B7', roomId: 'R3', title: 'Robotics Workshop', start: 10 * 60, end: 11 * 60 },
];
