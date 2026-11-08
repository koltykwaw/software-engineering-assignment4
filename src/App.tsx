import { useMemo, useState } from 'react';
import { CalendarCheck, Clock, DoorOpen, Search, SlidersHorizontal } from 'lucide-react';
import RoomSelector from '@/components/RoomSelector';
import RoomFilterPanel from '@/components/RoomFilterPanel';
import TimeInput from '@/components/TimeInput';
import ResultPanel from '@/components/ResultPanel';
import DayTimeline from '@/components/DayTimeline';
import { checkAvailability } from '@/lib/availability';
import { SAMPLE_BOOKINGS, SAMPLE_ROOMS } from '@/lib/data';
import { filterRooms, getEquipmentOptions, parseAttendeeCount } from '@/lib/filterRooms';
import { defaultWindow, fmtTime, parseTime } from '@/lib/time';
import type { AvailabilityResult } from '@/lib/types';

const TIME_HINT = 'Use 24-hour HH:MM, for example 09:30.';

interface FieldErrors {
  start?: string;
  end?: string;
}

export default function App() {
  const [rooms] = useState(SAMPLE_ROOMS);
  const [bookings] = useState(SAMPLE_BOOKINGS);
  const [roomId, setRoomId] = useState(SAMPLE_ROOMS[0].id);
  const [attendeesStr, setAttendeesStr] = useState('1');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [currentStr, setCurrentStr] = useState('09:00');
  const [startStr, setStartStr] = useState('09:30');
  const [endStr, setEndStr] = useState('10:30');
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const current = parseTime(currentStr);
  const currentError = current === null ? TIME_HINT : undefined;

  const equipmentOptions = useMemo(() => getEquipmentOptions(rooms), [rooms]);
  const attendees = parseAttendeeCount(attendeesStr);
  const attendeesError = attendees === null ? 'Enter a whole number of 1 or more.' : undefined;
  const hasActiveFilters = attendeesStr.trim() !== '1' || equipment.length > 0;
  const matchedRooms = useMemo(
    () => (attendees === null ? [] : filterRooms(rooms, { attendees, equipment })),
    [rooms, attendees, equipment],
  );
  const activeRoomId = matchedRooms.some((r) => r.id === roomId)
    ? roomId
    : (matchedRooms[0]?.id ?? null);
  const room = useMemo(() => rooms.find((r) => r.id === activeRoomId), [rooms, activeRoomId]);
  const roomBookings = useMemo(
    () => (room ? bookings.filter((b) => b.roomId === room.id) : []),
    [bookings, room],
  );
  const canCheck = activeRoomId !== null && current !== null;

  const startMin = parseTime(startStr);
  const endMin = parseTime(endStr, true);
  const candidate =
    startMin !== null && endMin !== null && endMin > startMin
      ? { start: startMin, end: endMin }
      : null;
  const durationLabel = candidate ? `${candidate.end - candidate.start} min` : '—';

  function applyDefaultRange(nowMinutes: number) {
    const range = defaultWindow(nowMinutes);
    setStartStr(fmtTime(range.start));
    setEndStr(fmtTime(range.end));
    setFieldErrors({});
  }

  function handleCheck() {
    if (activeRoomId === null || current === null) return;
    const start = parseTime(startStr);
    const end = parseTime(endStr, true);
    const errors: FieldErrors = {};
    if (start === null) errors.start = TIME_HINT;
    if (end === null) errors.end = TIME_HINT;
    setFieldErrors(errors);
    if (start === null || end === null) {
      setResult({ status: 'unavailable', reason: 'Fix the highlighted times to check availability.' });
      return;
    }
    // AC5: check only — never mutate bookings.
    setResult(checkAvailability({ roomId: activeRoomId, start, end }, rooms, bookings, current));
  }

  function handleRoomSelect(id: string) {
    setRoomId(id);
    setResult(null);
  }

  function handleAttendeesChange(v: string) {
    setAttendeesStr(v);
    setResult(null);
  }

  function handleEquipmentToggle(item: string) {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
    setResult(null);
  }

  function handleClearFilters() {
    setAttendeesStr('1');
    setEquipment([]);
    setResult(null);
  }

  function handleStartChange(v: string) {
    setStartStr(v);
    setResult(null);
    setFieldErrors((prev) => ({ ...prev, start: undefined }));
  }

  function handleEndChange(v: string) {
    setEndStr(v);
    setResult(null);
    setFieldErrors((prev) => ({ ...prev, end: undefined }));
  }

  function handleCurrentChange(v: string) {
    setCurrentStr(v);
    setResult(null);
    const now = parseTime(v);
    if (now !== null) applyDefaultRange(now);
  }

  function handleReset() {
    setResult(null);
    if (current !== null) applyDefaultRange(current);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                Smart Campus Room Availability
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Check whether a campus room is free for your time slot.
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            Simulated current time:{' '}
            <span className="font-mono font-medium text-slate-600">
              {current === null ? '--:--' : fmtTime(current)}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: form */}
          <section className="lg:col-span-3 space-y-6">
            {/* Room filters */}
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <SlidersHorizontal className="h-4 w-4" /> Filter rooms
              </h2>
              <RoomFilterPanel
                attendeesStr={attendeesStr}
                attendeesError={attendeesError}
                onAttendeesChange={handleAttendeesChange}
                equipmentOptions={equipmentOptions}
                selectedEquipment={equipment}
                onEquipmentToggle={handleEquipmentToggle}
                hasActiveFilters={hasActiveFilters}
                onClear={handleClearFilters}
              />
            </div>

            {/* Room selection */}
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <DoorOpen className="h-4 w-4" /> Select a room
              </h2>
              {matchedRooms.length > 0 ? (
                <RoomSelector
                  rooms={matchedRooms}
                  selectedId={activeRoomId ?? ''}
                  onSelect={handleRoomSelect}
                />
              ) : (
                <div
                  role="status"
                  className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center"
                >
                  <p className="text-sm font-semibold text-slate-700">
                    {attendees === null ? 'Enter an attendee count to see rooms' : 'No rooms match these filters'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {attendees === null
                      ? 'Attendees must be a whole number of 1 or more.'
                      : 'Try fewer attendees or remove an equipment requirement.'}
                  </p>
                </div>
              )}
            </div>

            {/* Time selection */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <Clock className="h-4 w-4" /> Choose a time range
              </h2>
              <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <TimeInput
                  label="Current time (fictional)"
                  value={currentStr}
                  onChange={handleCurrentChange}
                  error={currentError}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TimeInput
                  label="Start time"
                  value={startStr}
                  onChange={handleStartChange}
                  error={fieldErrors.start}
                />
                <TimeInput
                  label="End time"
                  value={endStr}
                  onChange={handleEndChange}
                  allowEndOfDay
                  error={fieldErrors.end}
                />
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Max duration 120 minutes. Start must be later than the current time. End may be 24:00 (midnight).
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={!canCheck}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                >
                  <Search className="h-4 w-4" /> Check availability
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Timeline */}
            <DayTimeline
              room={room}
              bookings={roomBookings}
              candidate={candidate}
              currentMinutes={current}
            />
          </section>

          {/* Right: result */}
          <aside className="lg:col-span-2 space-y-4">
            <ResultPanel
              result={result}
              durationLabel={durationLabel}
              room={room}
              bookings={roomBookings}
            />

            {/* Quick rules */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
              <p className="mb-2 font-semibold text-slate-600">Booking rules</p>
              <ul className="space-y-1.5">
                <li>&bull; 00:00–24:00 range; start must be in the future.</li>
                <li>&bull; Maximum 120-minute duration.</li>
                <li>&bull; Blocked rooms cannot be booked.</li>
                <li>&bull; No overlap with existing bookings (touching allowed).</li>
                <li>&bull; Checking never modifies existing bookings.</li>
              </ul>
            </div>
          </aside>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          Fictional sample data &middot; Front-end demo only
        </footer>
      </main>
    </div>
  );
}
