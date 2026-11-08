import { fmtTime } from '@/lib/time';
import type { Booking, Room } from '@/lib/types';

interface Props {
  room: Room | undefined;
  bookings: Booking[];
  candidate: { start: number; end: number } | null;
  currentMinutes: number | null;
}

const DAY_WIDTH = 100; // percent

export default function DayTimeline({ room, bookings, candidate, currentMinutes }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          {room ? `${room.name} — Today` : 'Select a room'}
        </h3>
        <span className="text-xs text-slate-400">00:00 → 24:00</span>
      </div>

      {/* Track */}
      <div className="relative h-10 w-full overflow-hidden rounded-md bg-slate-100">
        {/* Hour gridlines */}
        {Array.from({ length: 25 }, (_, h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 border-l border-slate-200"
            style={{ left: `${(h / 24) * DAY_WIDTH}%` }}
          />
        ))}

        {/* Existing bookings */}
        {bookings.map((b) => (
          <div
            key={b.id}
            className="absolute top-1 bottom-1 rounded bg-slate-400 px-1 text-[9px] leading-8 text-white overflow-hidden whitespace-nowrap"
            style={{
              left: `${(b.start / 1440) * DAY_WIDTH}%`,
              width: `${((b.end - b.start) / 1440) * DAY_WIDTH}%`,
            }}
            title={`${b.title} ${fmtTime(b.start)}–${fmtTime(b.end)}`}
          >
            {b.title}
          </div>
        ))}

        {/* Candidate interval */}
        {candidate && candidate.start < candidate.end && (
          <div
            className="absolute top-0 bottom-0 border-2 border-sky-500 bg-sky-300/40"
            style={{
              left: `${(candidate.start / 1440) * DAY_WIDTH}%`,
              width: `${((candidate.end - candidate.start) / 1440) * DAY_WIDTH}%`,
            }}
            title={`Candidate ${fmtTime(candidate.start)}–${fmtTime(candidate.end)}`}
          />
        )}

        {currentMinutes !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-orange-500"
            style={{ left: `${(currentMinutes / 1440) * DAY_WIDTH}%` }}
            title={`Now ${fmtTime(currentMinutes)}`}
          />
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-slate-400" /> Existing booking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border-2 border-sky-500 bg-sky-300/40" /> Candidate
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-0.5 bg-orange-500" /> Now
        </span>
      </div>
    </div>
  );
}
