import { SlidersHorizontal } from 'lucide-react';

interface Props {
  attendeesStr: string;
  attendeesError?: string;
  onAttendeesChange: (v: string) => void;
  equipmentOptions: string[];
  selectedEquipment: string[];
  onEquipmentToggle: (item: string) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

export default function RoomFilterPanel({
  attendeesStr,
  attendeesError,
  onAttendeesChange,
  equipmentOptions,
  selectedEquipment,
  onEquipmentToggle,
  hasActiveFilters,
  onClear,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Number of attendees</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={attendeesStr}
            onChange={(e) => onAttendeesChange(e.target.value)}
            aria-invalid={attendeesError ? true : undefined}
            aria-describedby={attendeesError ? 'attendees-error' : undefined}
            className={[
              'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-sky-400',
              attendeesError ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300',
            ].join(' ')}
          />
          {attendeesError && (
            <span id="attendees-error" className="mt-1 block text-xs font-medium text-red-600">
              {attendeesError}
            </span>
          )}
        </label>

        <fieldset>
          <legend className="mb-1 text-sm font-medium text-slate-700">Required equipment</legend>
          <div className="flex flex-wrap gap-2">
            {equipmentOptions.map((item) => {
              const checked = selectedEquipment.includes(item);
              return (
                <label
                  key={item}
                  className={[
                    'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors',
                    'focus-within:ring-2 focus-within:ring-sky-400',
                    checked
                      ? 'border-sky-500 bg-sky-50 text-sky-800'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400',
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onEquipmentToggle(item)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                  />
                  {item}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
