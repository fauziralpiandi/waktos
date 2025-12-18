import { describe, expect, test } from 'vitest';
import waktos from 'waktos';

const DATE = '2005-04-26T12:30:45.123Z';

describe('Core', () => {
  describe('Instance Creation', () => {
    test('creates from current time', () => {
      const now = waktos();

      expect(now).toBeDefined();
      expect(typeof now.valueOf()).toBe('number');
    });

    test('creates from string', () => {
      const date = waktos(DATE);

      expect(date.year()).toBe(2005);
      expect(date.month()).toBe(4);
      expect(date.day()).toBe(26);
    });

    test('creates from timestamp', () => {
      const timestamp = 1114518645123;
      const date = waktos(timestamp);

      expect(date.valueOf()).toBe(timestamp);
    });

    test('creates from Date object', () => {
      const dateObj = new Date(DATE);
      const date = waktos(dateObj);

      expect(date.valueOf()).toBe(dateObj.getTime());
    });
  });

  describe('Getters', () => {
    const date = waktos(DATE);

    test('gets date components', () => {
      expect(date.year()).toBe(2005);
      expect(date.month()).toBe(4);
      expect(date.day()).toBe(26);
      expect(date.hour()).toBe(12);
      expect(date.minute()).toBe(30);
      expect(date.second()).toBe(45);
      expect(date.millisecond()).toBe(123);
    });

    test('gets with method', () => {
      expect(date.get('year')).toBe(2005);
      expect(date.get('month')).toBe(4);
      expect(date.get('day')).toBe(26);
    });
  });

  describe('Setters', () => {
    const date = waktos(DATE);

    test('sets individual components', () => {
      expect(date.year(2024).year()).toBe(2024);
      expect(date.month(12).month()).toBe(12);
      expect(date.day(15).day()).toBe(15);
      expect(date.hour(18).hour()).toBe(18);
    });

    test('sets with object', () => {
      const result = date.set({ year: 2024, month: 12, day: 25 });

      expect(result.year()).toBe(2024);
      expect(result.month()).toBe(12);
      expect(result.day()).toBe(25);
    });

    test('preserves immutability', () => {
      const modified = date.year(2024);

      expect(date.year()).toBe(2005); // Original unchanged
      expect(modified.year()).toBe(2024); // New instance
    });
  });

  describe('Conversions', () => {
    const date = waktos(DATE);

    test('converts to primitives', () => {
      expect(date.valueOf()).toBe(1114518645123);
      expect(date.unix()).toBe(1114518645);
      expect(date.toJSON()).toBe(DATE);
    });

    test('converts to objects', () => {
      const obj = date.toObject();

      expect(obj.year).toBe(2005);
      expect(obj.month).toBe(4);
      expect(obj.day).toBe(26);
    });

    test('converts to array', () => {
      const arr = date.toArray();

      expect(arr).toEqual([2005, 4, 26, 12, 30, 45, 123]);
    });

    test('converts to Date object', () => {
      const dateObj = date.toDate();

      expect(dateObj).toBeInstanceOf(Date);
      expect(dateObj.getTime()).toBe(date.valueOf());
    });
  });
});
