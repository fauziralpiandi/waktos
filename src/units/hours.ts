import {
  MILLISECONDS_IN_SECOND,
  SECONDS_IN_MINUTE,
  MINUTES_IN_HOUR,
} from './constants';

export function diffInHours(date1: Date, date2: Date): number {
  const diffMs = date2.getTime() - date1.getTime();
  return Math.floor(
    Math.abs(diffMs) /
      (MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE * MINUTES_IN_HOUR),
  );
}

export function formatRelativeHours(
  hours: number,
  isPast: boolean = true,
): string {
  return isPast ? 'a few hours ago' : 'in a few hours';
}
