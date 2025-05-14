import { AbsoluteOptions, DateInput, ValidDate, FormatStyle } from '../types';
import { dateValidator } from '../utils/validation';
import { formatOrdinal } from '../utils/ordinal';

const FORMAT: Record<FormatStyle, Partial<Intl.DateTimeFormatOptions>> = {
  short: { month: 'numeric', day: 'numeric', year: 'numeric' },
  medium: { month: 'short', day: 'numeric', year: 'numeric' },
  long: { month: 'long', day: 'numeric', year: 'numeric' },
  full: { month: 'long', day: 'numeric', year: 'numeric', weekday: 'long' },
};

const CACHE = new Map<string, Intl.DateTimeFormat>();

export function absolute(date: DateInput, opts: AbsoluteOptions = {}): string {
  if (!dateValidator.isValid(date)) return 'Invalid date';

  try {
    const d = date instanceof Date ? date : new Date(date as ValidDate);
    const {
      format = 'medium',
      includeTime = false,
      includeWeekday = false,
      includeOrdinal = false,
      timezone,
    } = opts;
    const key = `${format}-${includeTime}-${includeWeekday}-${timezone || ''}`;

    let dtf = CACHE.get(key);

    if (!dtf) {
      const dtfOpts = { ...FORMAT[format] };

      if (timezone) {
        try {
          new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(
            new Date(),
          );
          dtfOpts.timeZone = timezone;
        } catch (_) {
          // Invalid timezone, continue without setting it
        }
      }

      if (includeWeekday && format !== 'full') dtfOpts.weekday = 'long';

      if (includeTime) {
        dtfOpts.hour = 'numeric';
        dtfOpts.minute = 'numeric';
        dtfOpts.hour12 = true;
      }

      dtf = new Intl.DateTimeFormat('en-US', dtfOpts);
      CACHE.set(key, dtf);
    }

    let formatted = dtf.format(d);

    if (includeOrdinal) {
      const day = d.getDate();
      formatted = formatted.replace(
        new RegExp(`\\b${day}\\b`),
        formatOrdinal(day),
      );
    }

    return formatted;
  } catch (_) {
    return 'Invalid date';
  }
}
