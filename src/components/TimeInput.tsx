import { useId } from 'react';

interface Props {
  label: string;
  value: string; // "HH:MM"
  onChange: (v: string) => void;
  allowEndOfDay?: boolean;
  error?: string;
}

export default function TimeInput({ label, value, onChange, allowEndOfDay = false, error }: Props) {
  const errorId = useId();
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type="text"
        autoComplete="off"
        maxLength={5}
        placeholder={allowEndOfDay ? '00:00 – 24:00' : 'HH:MM'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={[
          'w-full rounded-lg border bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-sky-400',
          error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300',
        ].join(' ')}
      />
      {error && (
        <span id={errorId} className="mt-1 block text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}
