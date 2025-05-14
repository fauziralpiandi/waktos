import { getDaysInMonth } from './days';

export function diffInMonths(date1: Date, date2: Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const isPast = d2.getTime() > d1.getTime();
  const [earlier, later] = isPast ? [d1, d2] : [d2, d1];

  let months =
    (later.getFullYear() - earlier.getFullYear()) * 12 +
    (later.getMonth() - earlier.getMonth());

  if (
    earlier.getMonth() === 0 &&
    earlier.getDate() > 28 &&
    later.getMonth() === 1 &&
    later.getFullYear() === earlier.getFullYear()
  ) {
    if (
      later.getDate() === getDaysInMonth(later.getFullYear(), later.getMonth())
    ) {
      return 1;
    }
    return 0;
  }

  if (later.getDate() < earlier.getDate()) {
    const maxDaysInLaterMonth = getDaysInMonth(
      later.getFullYear(),
      later.getMonth(),
    );
    if (earlier.getDate() <= maxDaysInLaterMonth) {
      months--;
    }
  }

  if (
    earlier.getDate() ===
      getDaysInMonth(earlier.getFullYear(), earlier.getMonth()) &&
    later.getDate() === getDaysInMonth(later.getFullYear(), later.getMonth())
  ) {
    months =
      (later.getFullYear() - earlier.getFullYear()) * 12 +
      (later.getMonth() - earlier.getMonth());
  }

  return isPast ? months : -months;
}

export function formatRelativeMonths(
  months: number,
  isPast: boolean = true,
): string {
  if (months === 0) {
    return 'this month';
  }
  if (months === 1) {
    return isPast ? 'a month ago' : 'next month';
  }
  if (months === 6) {
    return isPast ? '6 months ago' : 'in 6 months';
  }
  return isPast ? `${months} months ago` : `in ${months} months`;
}
