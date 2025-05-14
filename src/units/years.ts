import { getDaysInMonth } from './days';

export function diffInYears(date1: Date, date2: Date): number {
  const d1 = new Date(
    Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate()),
  );
  const d2 = new Date(
    Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate()),
  );
  const isPast = d2.getTime() > d1.getTime();
  const [earlier, later] = isPast ? [d1, d2] : [d2, d1];

  let years = later.getFullYear() - earlier.getFullYear();

  if (
    earlier.getMonth() === 1 &&
    earlier.getDate() === 29 &&
    later.getMonth() === 1 &&
    later.getDate() === 28 &&
    Math.abs(later.getFullYear() - earlier.getFullYear()) === 1
  ) {
    return isPast ? 1 : -1;
  }

  const earlierMonth = earlier.getMonth();
  const laterMonth = later.getMonth();

  if (laterMonth < earlierMonth) {
    years--;
  } else if (laterMonth === earlierMonth) {
    const earlierDay = earlier.getDate();
    const laterDay = later.getDate();

    if (
      laterDay < earlierDay &&
      !(
        laterDay === getDaysInMonth(later.getFullYear(), laterMonth) &&
        earlierDay === getDaysInMonth(earlier.getFullYear(), earlierMonth)
      )
    ) {
      years--;
    }
  }

  return isPast ? years : -years;
}

export function formatRelativeYears(
  years: number,
  isPast: boolean = true,
): string {
  if (years === 0) {
    return 'this year';
  }
  if (years === 1) {
    return isPast ? 'a year ago' : 'next year';
  }
  if (years === 3) {
    return isPast ? '3 years ago' : 'in 3 years';
  }
  return isPast ? `${years} years ago` : `in ${years} years`;
}
