import { fmtTime } from '@/lib/time';
import type { AvailabilityResult, Booking, Room } from '@/lib/types';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Props {
  result: AvailabilityResult | null;
  durationLabel: string;
  room: Room | undefined;
  bookings: Booking[];
}

export default function ResultPanel({ result, durationLabel, room, bookings }: Props) {
  if (!result) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <Clock className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        <p className="text-sm text-slate-400">
          Select a room and time range, then check availability.
        </p>
      </div>
    );
  }

  const available = result.status === 'available';

  return (
    <div
      className={[
        'rounded-xl border p-5 transition-all duration-300',
        available
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-red-200 bg-red-50',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        {available ? (
          <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
        )}
        <div className="min-w-0 flex-1">
          <p
            className={[
              'text-lg font-semibold',
              available ? 'text-emerald-800' : 'text-red-800',
            ].join(' ')}
          >
            {available ? 'Available' : 'Unavailable'}
          </p>
          <p
            className={[
              'mt-0.5 text-sm',
              available ? 'text-emerald-700' : 'text-red-700',
            ].join(' ')}
          >
            {available ? result.message : result.reason}
          </p>
          {room && (
            <p className="mt-2 text-xs text-slate-500">
              Duration: {durationLabel} &middot; Room capacity: {room.capacity}
            </p>
          )}
        </div>
      </div>

      {room && bookings.length > 0 && (
        <div className="mt-4 border-t border-slate-200/70 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Existing bookings — {room.name}
          </p>
          <ul className="space-y-1">
            {bookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between text-xs text-slate-600">
                <span className="truncate">{b.title}</span>
                <span className="ml-2 flex-shrink-0 font-mono text-slate-400">
                  {fmtTime(b.start)}–{fmtTime(b.end)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
