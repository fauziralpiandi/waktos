import { MILLISECONDS_IN_SECOND } from './constants';

export function diffInSeconds(date1: Date, date2: Date): number {
  const diffMs = date2.getTime() - date1.getTime();
  return Math.floor(Math.abs(diffMs) / MILLISECONDS_IN_SECOND);
}

export function formatRelativeSeconds(
  seconds: number,
  isPast: boolean = true,
): string {
  return isPast ? 'just now' : 'in a moment';
}
