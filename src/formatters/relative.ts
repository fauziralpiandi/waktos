import { DateInput, RelativeOptions, ValidDate } from '../types';
import { dateValidator } from '../utils/validation';

const diff = (tDate: Date, now: Date): string => {
  const diffMs = now.getTime() - tDate.getTime();
  const isPast = diffMs >= 0;
  const absDiffMs = Math.abs(diffMs);
  const minutes = Math.floor(absDiffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 60) {
    return isPast ? 'just now' : 'in a moment';
  }

  if (hours < 24) {
    return isPast ? 'a few hours ago' : 'in a few hours';
  }

  if (days === 1) {
    return isPast ? 'yesterday' : 'tomorrow';
  }

  if (days >= 2 && days <= 6) {
    return isPast ? `${days} days ago` : `in ${days} days`;
  }

  if (weeks === 1) {
    return isPast ? 'a week ago' : 'next week';
  }

  if (weeks >= 2 && weeks <= 3) {
    return isPast ? `${weeks} weeks ago` : `in ${weeks} weeks`;
  }

  // Special case for almost a month
  if (days >= 28 && days < 30 && isPast) {
    return 'a month ago';
  }

  if (months === 1) {
    return isPast ? 'a month ago' : 'next month';
  }

  if (months >= 2 && months <= 11) {
    return isPast ? `${months} months ago` : `in ${months} months`;
  }

  if (years === 1) {
    return isPast ? 'a year ago' : 'next year';
  }

  return isPast ? `${years} years ago` : `in ${years} years`;
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

    // Special timezone handling—
    // for accurate "wall clock" time differences
    if (timezone) {
      const targetDateStr = targetDate.toLocaleString('en-US', {
        timeZone: timezone,
      });
      const nowStr = now.toLocaleString('en-US', { timeZone: timezone });
      return diff(new Date(targetDateStr), new Date(nowStr));
    }

    return diff(targetDate, now);
  } catch (_) {
    return 'Invalid date';
  }
}
