import { diffInDays } from './days';
import { DAYS_IN_WEEK } from './constants';

export function diffInWeeks(date1: Date, date2: Date): number {
  const days = diffInDays(date1, date2);
  return Math.floor(days / DAYS_IN_WEEK);
}

export function formatRelativeWeeks(
  weeks: number,
  isPast: boolean = true,
): string {
  if (weeks === 1) {
    return isPast ? 'a week ago' : 'next week';
  }
  if (weeks === 4) {
    return isPast ? 'a month ago' : 'next month';
  }
  return isPast ? `${weeks} weeks ago` : `in ${weeks} weeks`;
}
