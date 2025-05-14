import { DateInput, RelativeOptions, ValidDate } from '../types';
import { dateValidator } from '../utils/validation';
import {
  diffInSeconds,
  formatRelativeSeconds,
  diffInMinutes,
  formatRelativeMinutes,
  diffInHours,
  formatRelativeHours,
  diffInDays,
  formatRelativeDays,
  diffInWeeks,
  formatRelativeWeeks,
  diffInMonths,
  formatRelativeMonths,
  diffInYears,
  formatRelativeYears,
  adjustForDst,
} from '../units';

const diff = (tDate: Date, now: Date): string => {
  const diffMs = now.getTime() - tDate.getTime();
  const isPast = diffMs >= 0;

  const seconds = diffInSeconds(isPast ? tDate : now, isPast ? now : tDate);

  if (seconds < 60) {
    return formatRelativeSeconds(seconds, isPast);
  }

  const minutes = diffInMinutes(isPast ? tDate : now, isPast ? now : tDate);

  if (minutes < 60) {
    return formatRelativeMinutes(minutes, isPast);
  }

  const hours = diffInHours(isPast ? tDate : now, isPast ? now : tDate);

  if (hours < 24) {
    return formatRelativeHours(hours, isPast);
  }

  const days = diffInDays(isPast ? tDate : now, isPast ? now : tDate);

  if (days < 7) {
    return formatRelativeDays(days, isPast);
  }

  const weeks = diffInWeeks(isPast ? tDate : now, isPast ? now : tDate);

  if (weeks <= 4) {
    return formatRelativeWeeks(weeks, isPast);
  }

  const months = diffInMonths(isPast ? tDate : now, isPast ? now : tDate);

  if (months < 12) {
    return formatRelativeMonths(months, isPast);
  }

  const years = diffInYears(isPast ? tDate : now, isPast ? now : tDate);
  return formatRelativeYears(years, isPast);
};

export function relative(
  date: DateInput,
  options: RelativeOptions = {},
): string {
  if (!dateValidator.isValid(date)) return 'Invalid date';

  try {
    const validDate = date as ValidDate;
    const targetDate =
      validDate instanceof Date ? validDate : new Date(validDate);
    const now = options.now || new Date();
    const timezone = options.timezone;

    if (timezone) {
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(
          new Date(),
        );
        const [targetTz, nowTz] = adjustForDst(targetDate, now, timezone);
        return diff(targetTz, nowTz);
      } catch (_) {
        return diff(targetDate, now);
      }
    }

    return diff(targetDate, now);
  } catch (_) {
    return 'Invalid date';
  }
}
