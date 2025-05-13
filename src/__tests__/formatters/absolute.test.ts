import { describe, it, expect } from 'vitest';
import { DateInput } from '../../types';
import { absolute } from '../../formatters/absolute';

describe('absolute', () => {
  // Use a fixed date for consistent test results
  const testDate = new Date('2025-05-10T12:30:45Z');

  describe('formats dates with different format options', () => {
    it('handles various format types correctly', () => {
      const formatTests = [
        {
          format: undefined,
          expected: /May 10, 2025/,
        },
        {
          format: 'short',
          expected: /5\/10\/2025/,
        },
        {
          format: 'medium',
          expected: /May 10, 2025/,
        },
        {
          format: 'long',
          expected: /May 10, 2025/,
        },
        {
          format: 'full',
          expected: /Saturday, May 10, 2025/,
        },
      ] as const;

      formatTests.forEach(({ format, expected }) => {
        const result = absolute(testDate, { format });
        expect(result).toMatch(expected);
      });
    });

    it('supports additional formatting options', () => {
      const withTime = absolute(testDate, { includeTime: true });
      expect(withTime).toMatch(/\d{1,2}:\d{2}/);
      expect(withTime).toMatch(/(AM|PM)/);

      const withWeekday = absolute(testDate, { includeWeekday: true });
      expect(withWeekday).toMatch(/Saturday/);

      const withOrdinal = absolute(testDate, { includeOrdinal: true });
      expect(withOrdinal).toMatch(/10th/);
    });

    it('combines multiple formatting options correctly', () => {
      const result = absolute(testDate, {
        format: 'full',
        includeTime: true,
        includeOrdinal: true,
      });

      expect(result).toMatch(/Saturday/);
      expect(result).toMatch(/May/);
      expect(result).toMatch(/10th/);
      expect(result).toMatch(/2025/);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
      expect(result).toMatch(/(AM|PM)/);
    });
  });

  describe('handles different input types and edge cases', () => {
    it('accepts various valid date inputs', () => {
      const timestamp = testDate.getTime();
      expect(absolute(timestamp)).toMatch(/May 10, 2025/);

      const isoString = testDate.toISOString();
      expect(absolute(isoString)).toMatch(/May 10, 2025/);
    });

    it('handles invalid date inputs gracefully', () => {
      const invalidInputs: Array<DateInput> = ['invalid-date', null, undefined];

      invalidInputs.forEach(input => {
        expect(absolute(input)).toBe('Invalid date');
      });
    });
  });
});
