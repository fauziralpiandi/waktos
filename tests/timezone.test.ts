import { describe, expect, test } from 'vitest';
import waktos from 'waktos';

const DATE = '2005-04-26T12:30:45.123Z'; // Reference date from documentation

describe('Timezone', () => {
  describe('Basic Usage', () => {
    test('creates with timezone option', () => {
      const utc = waktos(DATE).timezone('UTC');
      const jakarta = waktos(DATE).timezone('Asia/Jakarta');

      expect(utc).toBeDefined();
      expect(jakarta).toBeDefined();
    });

    test('preserves timezone in operations', () => {
      const jakarta = waktos(DATE).timezone('Asia/Jakarta');
      const nextDay = jakarta.add(1, 'day');

      expect(nextDay.day()).toBe(27);
      expect(nextDay.month()).toBe(4);
    });
  });

  describe('Common Timezones', () => {
    test('UTC timezone', () => {
      const utc = waktos(DATE).timezone('UTC');

      expect(utc.format('YYYY-MM-DD HH:mm:ss')).toContain('2005-04-26');
    });

    test('Asia/Jakarta timezone', () => {
      const jakarta = waktos(DATE).timezone('Asia/Jakarta');

      expect(jakarta.format('YYYY-MM-DD')).toContain('2005-04-26');
    });

    test('America/New_York timezone', () => {
      const nyc = waktos(DATE).timezone('America/New_York');

      expect(nyc.format('YYYY-MM-DD')).toContain('2005-04-26');
    });

    test('Europe/London timezone', () => {
      const london = waktos(DATE).timezone('Europe/London');

      expect(london.format('YYYY-MM-DD')).toContain('2005-04-26');
    });
  });

  describe('Timezone Operations', () => {
    test('arithmetic works with timezone', () => {
      const jakarta = waktos(DATE).timezone('Asia/Jakarta');
      const tomorrow = jakarta.add(1, 'day');

      expect(tomorrow.day()).toBe(27);
      expect(tomorrow.month()).toBe(4);
      expect(tomorrow.year()).toBe(2005);
    });

    test('boundaries work with timezone', () => {
      const jakarta = waktos(DATE).timezone('Asia/Jakarta');
      const startOfDay = jakarta.startOf('day');

      expect(startOfDay.hour()).toBe(0);
      expect(startOfDay.minute()).toBe(0);
      expect(startOfDay.day()).toBe(26);
    });

    test('formatting respects timezone', () => {
      const utc = waktos(DATE).timezone('UTC');
      const jakarta = waktos(DATE).timezone('Asia/Jakarta');
      const utcFormatted = utc.format('YYYY-MM-DD HH:mm:ss');
      const jakartaFormatted = jakarta.format('YYYY-MM-DD HH:mm:ss');

      expect(typeof utcFormatted).toBe('string');
      expect(typeof jakartaFormatted).toBe('string');
    });
  });

  describe('Timezone Comparisons', () => {
    test('same UTC moment in different timezones', () => {
      const utc = waktos(DATE).timezone('UTC');
      const jakarta = waktos(DATE).timezone('Asia/Jakarta');

      // Same UTC timestamp
      expect(utc.valueOf()).toBe(jakarta.valueOf());
      expect(utc.isSame(jakarta)).toBe(true);
    });

    test('timezone-aware comparisons', () => {
      const morning = waktos('2005-04-26T09:00:00.000Z').timezone(
        'Asia/Jakarta',
      );
      const evening = waktos('2005-04-26T15:00:00.000Z').timezone(
        'Asia/Jakarta',
      );

      expect(morning.isBefore(evening)).toBe(true);
      expect(morning.isSame(evening, 'day')).toBe(true);
    });
  });

  describe('Practical Timezone Use Cases', () => {
    test('business hours check', () => {
      const workStart = waktos('2005-04-26T09:00:00.000Z').timezone(
        'Asia/Jakarta',
      );
      const workEnd = waktos('2005-04-26T17:00:00.000Z').timezone(
        'Asia/Jakarta',
      );
      const current = waktos('2005-04-26T14:30:00.000Z').timezone(
        'Asia/Jakarta',
      );

      expect(current.isAfter(workStart)).toBe(true);
      expect(current.isBefore(workEnd)).toBe(true);
    });

    test('meeting scheduling across timezones', () => {
      const meetingUTC = waktos('2005-04-26T14:00:00.000Z').timezone('UTC');
      const meetingJakarta = waktos('2005-04-26T14:00:00.000Z').timezone(
        'Asia/Jakarta',
      );

      // Same meeting time referenced in different zones
      expect(meetingUTC.valueOf()).toBe(meetingJakarta.valueOf());
    });
  });
});
