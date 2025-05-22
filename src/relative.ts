import { type FormatOptions } from './index';
import { getLocaleMessages } from './locales';

function createDateFromParts(parts: Intl.DateTimeFormatPart[]): Date {
  const normalizeDigits = (str: string): string => {
    return str.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, match => {
      const code = match.charCodeAt(0);

      // Arabic (٠-٩)
      if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
      // Persian (۰-۹)
      if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0);

      return match;
    });
  };

  const getPartValue = (type: string): number => {
    const part = parts.find(p => p.type === type);
    const normalizedValue = normalizeDigits(part?.value ?? '0');

    return parseInt(normalizedValue, 10) ?? 0;
  };

  const year = getPartValue('year');
  const month = getPartValue('month') - 1; // JS months: 0-11
  const day = getPartValue('day');
  const hour = getPartValue('hour');
  const minute = getPartValue('minute');
  const second = getPartValue('second');

  return new Date(year, month, day, hour, minute, second);
}

function getMonthDiff(startDate: Date, endDate: Date): number {
  // Accounts for partial months
  // by comparing both year and month
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();

  return yearDiff * 12 + monthDiff;
}

export function relative(
  date: Date | number | string,
  options: FormatOptions = {},
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const { timezone = 'UTC', locale = 'en-US' } = options;

  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }

  try {
    const now = new Date();
    const messages = getLocaleMessages(locale);
    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false, // Internally for calculations
    });

    const nowParts = formatter.formatToParts(now);
    const nowTimezone = createDateFromParts(nowParts);
    const dateParts = formatter.formatToParts(dateObj);
    const dateTimezone = createDateFromParts(dateParts);

    const diffMs = nowTimezone.getTime() - dateTimezone.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = getMonthDiff(dateTimezone, nowTimezone);
    const diffYear = Math.floor(diffMonth / 12);

    // Human-centric threshold cascade
    if (diffSec < 60) return messages.justNow;
    if (diffMin < 60) return messages.minutesAgo(diffMin);
    if (diffHour < 24) return messages.hoursAgo(diffHour);
    if (diffDay === 1) return messages.yesterday;
    if (diffDay < 7) return messages.daysAgo(diffDay);
    if (diffWeek === 1) return messages.lastWeek;
    if (diffWeek < 4) return messages.weeksAgo(diffWeek);
    if (diffMonth === 1) return messages.lastMonth;
    if (diffMonth < 12) return messages.monthsAgo(diffMonth);
    if (diffYear === 1) return messages.lastYear;

    return messages.yearsAgo(diffYear);
  } catch (error) {
    throw new Error(
      `Error calculating relative time: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
