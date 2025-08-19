import { describe, expect, test } from 'vitest';
import waktos from '..';

const DATE = '2005-04-26T12:30:45.123Z'; // Reference date from documentation

describe('Comparison - Happy Path', () => {
  const baseDate = waktos(DATE);
  const earlierDate = waktos('2005-04-25T12:30:45.123Z'); // Day before
  const laterDate = waktos('2005-04-27T12:30:45.123Z'); // Day after
  const sameDate = waktos(DATE); // Exact same

  describe('Basic Comparisons', () => {
    test('isBefore works correctly', () => {
      expect(baseDate.isBefore(laterDate)).toBe(true);
      expect(baseDate.isBefore(earlierDate)).toBe(false);
      expect(baseDate.isBefore(sameDate)).toBe(false);
    });

    test('isAfter works correctly', () => {
      expect(baseDate.isAfter(earlierDate)).toBe(true);
      expect(baseDate.isAfter(laterDate)).toBe(false);
      expect(baseDate.isAfter(sameDate)).toBe(false);
    });

    test('isSame works correctly', () => {
      expect(baseDate.isSame(sameDate)).toBe(true);
      expect(baseDate.isSame(earlierDate)).toBe(false);
      expect(baseDate.isSame(laterDate)).toBe(false);
    });
  });

  describe('Unit-based Comparisons', () => {
    const sameDayLater = waktos('2005-04-26T18:00:00.000Z'); // Same day, different time
    const sameMonthDifferentDay = waktos('2005-04-15T10:00:00.000Z'); // Same month, different day
    const sameYearDifferentMonth = waktos('2005-07-01T10:00:00.000Z'); // Same year, different month

    test('compares by day unit', () => {
      expect(baseDate.isSame(sameDayLater, 'day')).toBe(true);
      expect(baseDate.isSame(sameMonthDifferentDay, 'day')).toBe(false);
    });

    test('compares by month unit', () => {
      expect(baseDate.isSame(sameDayLater, 'month')).toBe(true);
      expect(baseDate.isSame(sameMonthDifferentDay, 'month')).toBe(true);
      expect(baseDate.isSame(sameYearDifferentMonth, 'month')).toBe(false);
    });

    test('compares by year unit', () => {
      expect(baseDate.isSame(sameDayLater, 'year')).toBe(true);
      expect(baseDate.isSame(sameMonthDifferentDay, 'year')).toBe(true);
      expect(baseDate.isSame(sameYearDifferentMonth, 'year')).toBe(true);

      const differentYear = waktos('2006-04-26T12:30:45.123Z');

      expect(baseDate.isSame(differentYear, 'year')).toBe(false);
    });

    test('compares by time units', () => {
      const sameHour = waktos('2005-04-26T12:45:00.000Z');
      const sameMinute = waktos('2005-04-26T12:30:50.000Z');

      expect(baseDate.isSame(sameHour, 'hour')).toBe(true);
      expect(baseDate.isSame(sameMinute, 'minute')).toBe(true);
    });
  });

  describe('Input Type Flexibility', () => {
    test('accepts Date objects', () => {
      const dateObj = new Date('2005-04-27T12:30:45.123Z');

      expect(baseDate.isBefore(dateObj)).toBe(true);
      expect(baseDate.isAfter(dateObj)).toBe(false);
    });

    test('accepts timestamp numbers', () => {
      const timestamp = new Date('2005-04-25T12:30:45.123Z').getTime();

      expect(baseDate.isAfter(timestamp)).toBe(true);
      expect(baseDate.isBefore(timestamp)).toBe(false);
    });

    test('accepts ISO strings', () => {
      expect(baseDate.isBefore('2005-04-27T12:30:45.123Z')).toBe(true);
      expect(baseDate.isAfter('2005-04-25T12:30:45.123Z')).toBe(true);
    });
  });

  describe('Practical Use Cases', () => {
    test('birthday comparison', () => {
      const birthday = waktos('2005-04-26T00:00:00.000Z');
      const today = waktos('2024-04-26T15:30:00.000Z');

      expect(birthday.isBefore(today)).toBe(true);
      expect(birthday.isSame(today, 'day')).toBe(false); // Different years
    });

    test('same day different times', () => {
      const morning = waktos('2005-04-26T08:00:00.000Z');
      const evening = waktos('2005-04-26T20:00:00.000Z');

      expect(morning.isBefore(evening)).toBe(true);
      expect(morning.isSame(evening, 'day')).toBe(true);
    });

    test('week comparison', () => {
      const startOfWeek = waktos('2005-04-25T00:00:00.000Z'); // Monday
      const endOfWeek = waktos('2005-05-01T23:59:59.999Z'); // Sunday

      expect(baseDate.isSame(startOfWeek, 'week')).toBe(true);
      expect(baseDate.isSame(endOfWeek, 'week')).toBe(true);
    });
  });
});
