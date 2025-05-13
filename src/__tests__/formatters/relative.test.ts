import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DateInput } from '../../types';
import { relative } from '../../formatters/relative';

describe('relative', () => {
  const fixedReferenceDate = new Date('2025-05-10T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedReferenceDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createDateWithOffset = (
    amount: number,
    unit:
      | 'seconds'
      | 'minutes'
      | 'hours'
      | 'days'
      | 'weeks'
      | 'months'
      | 'years',
    direction: 'past' | 'future' = 'past',
  ): Date => {
    const unitMultipliers = {
      seconds: 1000,
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000,
      months: 30 * 24 * 60 * 60 * 1000,
      years: 365 * 24 * 60 * 60 * 1000,
    };

    const offsetMilliseconds = amount * unitMultipliers[unit];
    const timeModifier = direction === 'past' ? -1 : 1;

    return new Date(
      fixedReferenceDate.getTime() + timeModifier * offsetMilliseconds,
    );
  };

  describe('formats time correctly across different units', () => {
    it('formats past dates with appropriate units and special cases', () => {
      // Time units with quantity
      const pastCases = [
        { amount: 5, unit: 'seconds', expected: 'just now' },
        { amount: 30, unit: 'seconds', expected: 'just now' },
        { amount: 1, unit: 'minutes', expected: 'just now' },
        { amount: 30, unit: 'minutes', expected: 'just now' },
        { amount: 1, unit: 'hours', expected: 'a few hours ago' },
        { amount: 5, unit: 'hours', expected: 'a few hours ago' },
        { amount: 1, unit: 'days', expected: 'yesterday' },
        { amount: 5, unit: 'days', expected: '5 days ago' },
        { amount: 7, unit: 'days', expected: 'a week ago' },
        { amount: 3, unit: 'weeks', expected: '3 weeks ago' },
        { amount: 1, unit: 'months', expected: 'a month ago' },
        { amount: 6, unit: 'months', expected: '6 months ago' },
        { amount: 1, unit: 'years', expected: 'a year ago' },
        { amount: 3, unit: 'years', expected: '3 years ago' },
      ] as const;

      pastCases.forEach(({ amount, unit, expected }) => {
        const pastDate = createDateWithOffset(amount, unit, 'past');
        expect(relative(pastDate)).toBe(expected);
      });
    });

    it('formats future dates with appropriate units and special cases', () => {
      const futureCases = [
        { amount: 5, unit: 'seconds', expected: 'in a moment' },
        { amount: 30, unit: 'seconds', expected: 'in a moment' },
        { amount: 1, unit: 'minutes', expected: 'in a moment' },
        { amount: 30, unit: 'minutes', expected: 'in a moment' },
        { amount: 1, unit: 'hours', expected: 'in a few hours' },
        { amount: 5, unit: 'hours', expected: 'in a few hours' },
        { amount: 1, unit: 'days', expected: 'tomorrow' },
        { amount: 5, unit: 'days', expected: 'in 5 days' },
        { amount: 7, unit: 'days', expected: 'next week' },
        { amount: 3, unit: 'weeks', expected: 'in 3 weeks' },
        { amount: 1, unit: 'months', expected: 'next month' },
        { amount: 6, unit: 'months', expected: 'in 6 months' },
        { amount: 1, unit: 'years', expected: 'next year' },
        { amount: 3, unit: 'years', expected: 'in 3 years' },
      ] as const;

      futureCases.forEach(({ amount, unit, expected }) => {
        const futureDate = createDateWithOffset(amount, unit, 'future');
        expect(relative(futureDate)).toBe(expected);
      });
    });
  });

  describe('handles special cases and options', () => {
    it('supports custom reference date parameter', () => {
      const jan1st2024 = new Date('2024-01-01T00:00:00Z');
      const jan2nd2024 = new Date('2024-01-02T00:00:00Z');

      expect(relative(jan2nd2024, { now: jan1st2024 })).toBe('tomorrow');
      expect(relative(jan1st2024, { now: jan2nd2024 })).toBe('yesterday');
    });

    it('returns appropriate message for invalid dates', () => {
      const invalidInputs: Array<{ input: DateInput; expected: string }> = [
        { input: 'invalid-date', expected: 'Invalid date' },
        { input: null, expected: 'Invalid date' },
        { input: undefined, expected: 'Invalid date' },
      ];

      invalidInputs.forEach(({ input, expected }) => {
        expect(relative(input)).toBe(expected);
      });
    });
  });
});
