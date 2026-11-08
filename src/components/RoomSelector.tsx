import type { Room } from '@/lib/types';
import { Ban, Users, MapPin } from 'lucide-react';

interface Props {
  rooms: Room[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function RoomSelector({ rooms, selectedId, onSelect }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => {
        const active = room.id === selectedId;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelect(room.id)}
            aria-pressed={active}
            className={[
              'rounded-xl border p-4 text-left transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
              active
                ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
              room.blocked ? 'opacity-70' : '',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{room.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {room.building}
                </p>
              </div>
              {room.blocked ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  <Ban className="h-3 w-3" /> Blocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  <Users className="h-3 w-3" /> {room.capacity}
                </span>
              )}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              {room.equipment.length > 0 ? room.equipment.join(' · ') : 'No equipment listed'}
            </p>
          </button>
        );
      })}
    </div>
  );
}
