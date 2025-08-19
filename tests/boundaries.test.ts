import { describe, expect, test } from 'vitest';
import waktos from '..';

const DATE = '2005-04-26T12:30:45.123Z'; // Reference date from documentation

describe('Boundaries', () => {
  const date = waktos(DATE);

  describe('Start Of', () => {
    test('startOf year', () => {
      const result = date.startOf('year');

      expect(result.year()).toBe(2005);
      expect(result.month()).toBe(1);
      expect(result.day()).toBe(1);
      expect(result.hour()).toBe(0);
      expect(result.minute()).toBe(0);
      expect(result.second()).toBe(0);
    });

    test('startOf month', () => {
      const result = date.startOf('month');

      expect(result.year()).toBe(2005);
      expect(result.month()).toBe(4);
      expect(result.day()).toBe(1);
      expect(result.hour()).toBe(0);
    });

    test('startOf day', () => {
      const result = date.startOf('day');

      expect(result.year()).toBe(2005);
      expect(result.month()).toBe(4);
      expect(result.day()).toBe(26);
      expect(result.hour()).toBe(0);
      expect(result.minute()).toBe(0);
    });

    test('startOf hour', () => {
      const result = date.startOf('hour');

      expect(result.hour()).toBe(12);
      expect(result.minute()).toBe(0);
      expect(result.second()).toBe(0);
    });

    test('startOf minute', () => {
      const result = date.startOf('minute');

      expect(result.minute()).toBe(30);
      expect(result.second()).toBe(0);
      expect(result.millisecond()).toBe(0);
    });

    test('startOf week', () => {
      const result = date.startOf('week');

      expect(result.day()).toBe(25); // Monday before April 26 (Tuesday)
      expect(result.month()).toBe(4);
      expect(result.hour()).toBe(0);
    });
  });

  describe('End Of', () => {
    test('endOf year', () => {
      const result = date.endOf('year');

      expect(result.year()).toBe(2005);
      expect(result.month()).toBe(12);
      expect(result.day()).toBe(31);
      expect(result.hour()).toBe(23);
      expect(result.minute()).toBe(59);
      expect(result.second()).toBe(59);
    });

    test('endOf month', () => {
      const result = date.endOf('month');

      expect(result.year()).toBe(2005);
      expect(result.month()).toBe(4);
      expect(result.day()).toBe(30); // April has 30 days
      expect(result.hour()).toBe(23);
    });

    test('endOf day', () => {
      const result = date.endOf('day');

      expect(result.day()).toBe(26);
      expect(result.hour()).toBe(23);
      expect(result.minute()).toBe(59);
      expect(result.second()).toBe(59);
    });

    test('endOf hour', () => {
      const result = date.endOf('hour');

      expect(result.hour()).toBe(12);
      expect(result.minute()).toBe(59);
      expect(result.second()).toBe(59);
    });

    test('endOf minute', () => {
      const result = date.endOf('minute');

      expect(result.minute()).toBe(30);
      expect(result.second()).toBe(59);
      expect(result.millisecond()).toBe(999);
    });

    test('endOf week', () => {
      const result = date.endOf('week');

      expect(result.day()).toBe(1); // Sunday after, which is May 1st
      expect(result.month()).toBe(5);
      expect(result.hour()).toBe(23);
    });
  });

  describe('Immutability', () => {
    test('boundary operations preserve original', () => {
      const original = waktos(DATE);
      const startOfDay = original.startOf('day');
      const endOfDay = original.endOf('day');

      expect(original.hour()).toBe(12);
      expect(startOfDay.hour()).toBe(0);
      expect(endOfDay.hour()).toBe(23);
    });
  });
});
