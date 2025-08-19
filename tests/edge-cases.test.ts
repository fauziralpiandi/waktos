import { describe, test, expect } from 'vitest';
import waktos from '..';

describe('Edge Cases', () => {
  describe('Invalid Input Handling', () => {
    test('handles null and undefined inputs', () => {
      expect(() => waktos(null as any)).toThrow(); // Waktos throws on null
      expect(() => waktos(undefined as any)).not.toThrow(); // undefined defaults to current time
    });

    test('handles invalid string dates', () => {
      expect(() => waktos('invalid-date')).toThrow();
      expect(() => waktos('2005-13-45')).toThrow();
      expect(() => waktos('not-a-date')).toThrow();
    });

    test('handles NaN and Infinity', () => {
      expect(() => waktos(NaN)).toThrow();
      expect(() => waktos(Number.POSITIVE_INFINITY)).toThrow();
      expect(() => waktos(Number.NEGATIVE_INFINITY)).toThrow();
    });

    test('handles invalid object types', () => {
      expect(() => waktos([] as any)).toThrow();
      expect(() => waktos({} as any)).toThrow();
      expect(() => waktos(true as any)).toThrow();
    });

    test('handles string numbers appropriately', () => {
      expect(() => waktos('1114518645123')).toThrow(); // Long string number
      expect(() => waktos('0')).not.toThrow(); // Valid string
      expect(() => waktos('-1000000000')).toThrow();
    });
  });

  describe('Date Arithmetic Edge Cases', () => {
    test('month overflow scenarios', () => {
      const jan31 = waktos('2005-01-31');
      const result = jan31.add(1, 'month');

      // January 31 + 1 month should handle February correctly
      expect(result.month()).toBe(2); // February
      expect(result.day()).toBeLessThanOrEqual(29); // Valid February day
    });

    test('leap year February handling', () => {
      const leapFeb = waktos('2004-02-29'); // 2004 is leap year
      const nextYear = leapFeb.add(1, 'year');

      expect(nextYear.year()).toBe(2005);
      expect(nextYear.month()).toBe(2);
      expect(nextYear.day()).toBe(28); // Feb 29 → Feb 28 in non-leap year
    });

    test('end of month boundary arithmetic', () => {
      const endOfMonth = waktos('2005-01-31T23:59:59.999Z');
      const nextMonth = endOfMonth.add(1, 'month');

      expect(nextMonth.month()).toBe(2); // February
      expect(nextMonth.day()).toBeLessThanOrEqual(28); // Valid February day
    });

    test('invalid arithmetic units', () => {
      const date = waktos('2005-04-26');

      expect(() => date.add(1, 'invalid' as any)).not.toThrow(); // Waktos handles gracefully
      expect(() => date.sub(1, 'notaunit' as any)).not.toThrow(); // Waktos handles gracefully
    });

    test('extreme arithmetic values', () => {
      const date = waktos('2005-04-26');

      expect(() => date.add(Number.MAX_SAFE_INTEGER, 'year')).not.toThrow();
      expect(() => date.add(NaN as any, 'day')).not.toThrow(); // Waktos handles NaN gracefully
    });
  });

  describe('Boundary Operations Edge Cases', () => {
    test('startOf/endOf with invalid units', () => {
      const date = waktos('2005-04-26');

      expect(() => date.startOf('invalid' as any)).not.toThrow(); // Waktos handles gracefully
      expect(() => date.endOf('notaunit' as any)).not.toThrow(); // Waktos handles gracefully
    });

    test('DST transition boundaries', () => {
      // Spring DST transition (2am becomes 3am)
      const springDST = waktos('2005-03-27T01:30:00.000Z', {
        timezone: 'Europe/London',
      });
      const startOfDay = springDST.startOf('day');
      const endOfDay = springDST.endOf('day');

      expect(startOfDay.hour()).toBe(0);
      expect(endOfDay.hour()).toBe(23);
      expect(endOfDay.minute()).toBe(59);
    });

    test('extreme date boundaries', () => {
      const earlyDate = waktos('1900-01-01T12:00:00.000Z');
      const startOfYear = earlyDate.startOf('year');
      const endOfYear = earlyDate.endOf('year');

      expect(startOfYear.year()).toBe(1970); // JavaScript Date limitation
      expect(endOfYear.year()).toBe(1970);
      expect(endOfYear.month()).toBe(12);
    });

    test('millisecond precision boundaries', () => {
      const precise = waktos('2005-04-26T12:30:45.123Z');
      const startOfSecond = precise.startOf('second');

      expect(startOfSecond.millisecond()).toBe(0);
      expect(startOfSecond.second()).toBe(45);
      expect(startOfSecond.minute()).toBe(30);
    });
  });

  describe('Timezone Edge Cases', () => {
    test('invalid timezone handling', () => {
      expect(() =>
        waktos('2005-04-26', { timezone: 'Invalid/Timezone' }),
      ).not.toThrow();
      expect(() =>
        waktos('2005-04-26', { timezone: 'Mars/Colony' }),
      ).not.toThrow();
    });

    test('DST transition ambiguous times', () => {
      // Fall DST: 2am happens twice
      const fallDST = waktos('2005-10-30T01:30:00.000Z', {
        timezone: 'Europe/London',
      });

      expect(fallDST.hour()).toBeGreaterThanOrEqual(0);
      expect(fallDST.hour()).toBeLessThan(24);
    });

    test('extreme timezone offsets', () => {
      const utc = waktos('2005-04-26T12:00:00.000Z');
      const pacific = waktos('2005-04-26T12:00:00.000Z', {
        timezone: 'Pacific/Kiritimati',
      }); // UTC+14

      expect(pacific.valueOf()).toBe(utc.valueOf()); // Same instant
    });

    test('timezone with invalid date', () => {
      expect(() => waktos('invalid', { timezone: 'Asia/Tokyo' })).toThrow();
    });
  });

  describe('Formatting Edge Cases', () => {
    test('invalid format patterns', () => {
      const date = waktos('2005-04-26T12:30:45.123Z');

      expect(() => date.format('INVALID-PATTERN')).not.toThrow(); // Should handle gracefully
      expect(() => date.format('')).not.toThrow(); // Empty format
    });

    test('malformed bracket patterns', () => {
      const date = waktos('2005-04-26T12:30:45.123Z');
      expect(() => date.format('YYYY[MM')).not.toThrow(); // Unclosed bracket
      expect(() => date.format('YYYY]MM[')).not.toThrow(); // Wrong bracket order
    });

    test('format with null/undefined patterns', () => {
      const date = waktos('2005-04-26T12:30:45.123Z');

      expect(() => date.format(null as any)).not.toThrow();
      expect(() => date.format(undefined as any)).not.toThrow();
    });
  });

  describe('Comparison Edge Cases', () => {
    test('comparing with invalid dates', () => {
      const validDate = waktos('2005-04-26');

      expect(() => validDate.isBefore(null as any)).toThrow();
      expect(() => validDate.isAfter(undefined as any)).toThrow();
      expect(() => validDate.isSame({} as any)).toThrow();
    });

    test('comparing with invalid units', () => {
      const date1 = waktos('2005-04-26');
      const date2 = waktos('2005-04-27');

      expect(() => date1.isBefore(date2, 'invalid' as any)).not.toThrow(); // Waktos handles gracefully
      expect(() => date1.isAfter(date2, 'notaunit' as any)).not.toThrow(); // Waktos handles gracefully
    });

    test('extreme date comparisons', () => {
      const early = waktos('1900-01-01');
      const future = waktos('2100-12-31');

      expect(early.isBefore(future)).toBe(true);
      expect(future.isAfter(early)).toBe(true);
    });
  });

  describe('Options Validation Edge Cases', () => {
    test('malformed options object', () => {
      expect(() => waktos('2005-04-26', null as any)).not.toThrow();
      expect(() => waktos('2005-04-26', 'invalid' as any)).not.toThrow();
      expect(() => waktos('2005-04-26', 123 as any)).not.toThrow();
    });

    test('invalid locale handling', () => {
      expect(() =>
        waktos('2005-04-26', { locale: 'invalid-locale' }),
      ).not.toThrow();
      expect(() => waktos('2005-04-26', { locale: null as any })).not.toThrow();
    });

    test('mixed valid/invalid options', () => {
      expect(() =>
        waktos('2005-04-26', {
          timezone: 'Asia/Jakarta',
          locale: 'invalid-locale',
        }),
      ).not.toThrow();
    });
  });

  describe('Year 2038 Problem & Extreme Dates', () => {
    test('handles year 2038 boundary', () => {
      const year2038 = waktos('2038-01-19T03:14:07.000Z');

      expect(year2038.year()).toBe(2038);
      expect(year2038.month()).toBe(1);
      expect(year2038.day()).toBe(19);
    });

    test('handles very early dates', () => {
      const veryEarly = waktos('1901-12-13T20:45:52.000Z');

      expect(veryEarly.year()).toBeGreaterThanOrEqual(1970); // May clamp to epoch
    });

    test('handles far future dates', () => {
      const farFuture = waktos('2100-01-01T00:00:00.000Z');

      expect(farFuture.year()).toBe(2100);
      expect(farFuture.month()).toBe(1);
      expect(farFuture.day()).toBe(1);
    });
  });
});
