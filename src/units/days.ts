import {
  DAYS_IN_MONTH,
  DAYS_IN_MONTH_LEAP,
  DAYS_IN_YEAR,
  DAYS_IN_LEAP_YEAR,
} from './constants';

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  if (month < 0 || month > 11) {
    throw new Error('Month must be between 0 and 11');
  }

  if (isLeapYear(year)) {
    return DAYS_IN_MONTH_LEAP[month];
  }

  return DAYS_IN_MONTH[month];
}

export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? DAYS_IN_LEAP_YEAR : DAYS_IN_YEAR;
}

export function diffInDays(date1: Date, date2: Date): number {
  const startDate = new Date(
    Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate()),
  );
  const endDate = new Date(
    Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate()),
  );

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const difference = Math.abs(endDate.getTime() - startDate.getTime());

  return Math.floor(difference / millisecondsPerDay);
}

export function formatRelativeDays(
  days: number,
  isPast: boolean = true,
): string {
  if (days === 0) {
    return 'today';
  }
  if (days === 1) {
    return isPast ? 'yesterday' : 'tomorrow';
  }
  if (days === 5) {
    return isPast ? '5 days ago' : 'in 5 days';
  }
  return isPast ? `${days} days ago` : `in ${days} days`;
}
