import { describe, it, expect } from 'vitest';
import { convertToTimezone, adjustForDst } from '../../units/timezone';
import { waktos } from '../../index';

describe('timezone unit', () => {
  describe('convertToTimezone', () => {
    it('should convert dates to specified timezone', () => {
      const date = new Date(Date.UTC(2023, 0, 1, 12, 0, 0));

      const utcDate = convertToTimezone(date, 'UTC');
      expect(utcDate.getUTCHours()).toBe(12);

      const estDate = convertToTimezone(date, 'America/New_York');
      expect(estDate.getHours()).toBe(7);
    });

    it('handles invalid timezones gracefully', () => {
      const date = new Date(Date.UTC(2023, 0, 1, 12, 0, 0));

      expect(() => {
        convertToTimezone(date, 'Invalid/Timezone');
      }).not.toThrow();

      const result = convertToTimezone(date, 'Invalid/Timezone');
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('adjustForDst', () => {
    it('should adjust both dates to the same timezone', () => {
      const date1 = new Date(Date.UTC(2023, 0, 1, 12, 0, 0));
      const date2 = new Date(Date.UTC(2023, 6, 1, 12, 0, 0));

      const [adjustedDate1, adjustedDate2] = adjustForDst(
        date1,
        date2,
        'America/New_York',
      );

      expect(adjustedDate1.getHours()).toBe(7);
      expect(adjustedDate2.getHours()).toBe(8);
    });

    it('handles DST transitions correctly', () => {
      // March 12, 2023 - Spring forward (2am → 3am)
      const beforeSpringForward = new Date('2023-03-12T01:30:00-05:00'); // 1:30 AM EST
      const afterSpringForward = new Date('2023-03-12T03:30:00-04:00'); // 3:30 AM EDT (2 hrs later)

      // Test that the difference is calculated correctly (should be 2 hours)
      const [adjustedBefore, adjustedAfter] = adjustForDst(
        beforeSpringForward,
        afterSpringForward,
        'America/New_York',
      );

      const hoursDiff =
        (adjustedAfter.getTime() - adjustedBefore.getTime()) / (60 * 60 * 1000);
      expect(hoursDiff).toBe(2);

      // November 5, 2023 - Fall back (2am → 1am)
      const beforeFallBack = new Date('2023-11-04T12:00:00-04:00'); // Noon day before DST change EDT
      const afterFallBack = new Date('2023-11-05T12:00:00-05:00'); // Noon day of DST change EST

      const [adjustedBeforeFall, adjustedAfterFall] = adjustForDst(
        beforeFallBack,
        afterFallBack,
        'America/New_York',
      );

      const dayDiff = Math.round(
        (adjustedAfterFall.getTime() - adjustedBeforeFall.getTime()) /
          (60 * 60 * 1000),
      );
      expect(dayDiff).toBe(24);
    });
  });

  describe('waktos with timezone handling', () => {
    it('handles invalid timezones gracefully in formatters', () => {
      const date = new Date('2023-05-15T12:00:00Z');

      expect(() => {
        waktos.absolute(date, { timezone: 'Invalid/Zone', includeTime: true });
      }).not.toThrow();

      // Formatters should still work with invalid timezones by using system timezone
      // But we can't test exact output since we don't know system timezone in test env
      // So we'll just test that it returns a string and not an error
      const result = waktos.absolute(date, {
        timezone: 'Invalid/Zone',
        includeTime: true,
      });
      expect(typeof result).toBe('string');
      expect(result).not.toBe('Invalid date');

      const now = new Date('2023-05-20T12:00:00Z');
      expect(() => {
        waktos.relative(date, { timezone: 'Invalid/Zone', now });
      }).not.toThrow();

      const relResult = waktos.relative(date, {
        timezone: 'Invalid/Zone',
        now,
      });
      expect(typeof relResult).toBe('string');
      expect(relResult).not.toBe('Invalid date');
    });
  });
});
