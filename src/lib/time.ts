export const END_OF_DAY = 24 * 60;

const CLOCK_PATTERN = /^(\d{2}):(\d{2})$/;

/** Parses "HH:MM" into whole minutes. "24:00" is accepted only when allowEndOfDay is set. */
export function parseTime(value: string, allowEndOfDay = false): number | null {
  const match = CLOCK_PATTERN.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (minutes > 59) return null;
  if (hours === 24 && minutes === 0) return allowEndOfDay ? END_OF_DAY : null;
  if (hours > 23) return null;
  return hours * 60 + minutes;
}

/** Formats whole minutes in [0, 1440] as "HH:MM" without wrapping 1440 to "00:00". */
export function fmtTime(min: number): string {
  const hours = Math.floor(min / 60);
  const minutes = min % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Default 30–90 minute window after the simulated time, clamped so it stays inside the day. */
export function defaultWindow(nowMinutes: number): { start: number; end: number } {
  return {
    start: Math.min(nowMinutes + 30, END_OF_DAY - 1),
    end: Math.min(nowMinutes + 90, END_OF_DAY),
  };
}
