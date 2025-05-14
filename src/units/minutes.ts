import { MILLISECONDS_IN_SECOND, SECONDS_IN_MINUTE } from './constants';

export function diffInMinutes(date1: Date, date2: Date): number {
  const diffMs = date2.getTime() - date1.getTime();
  return Math.floor(
    Math.abs(diffMs) / (MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE),
  );
}

export function formatRelativeMinutes(
  minutes: number,
  isPast: boolean = true,
): string {
  return isPast ? 'just now' : 'in a moment';
}
