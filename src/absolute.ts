import { type FormatOptions } from './index';

export function absolute(
  date: Date | number | string,
  options: FormatOptions = {},
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const { timezone = 'UTC', locale = 'en-US' } = options;

  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }

  try {
    // System-specific defaults
    const formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      weekday: 'long',
      day: 'numeric',
      hour: undefined,
      minute: undefined,
      second: undefined,
      hour12: undefined,
      timeZone: timezone,
    });

    return formatter.format(dateObj);
  } catch (error) {
    throw new Error(
      `Error formatting date: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
