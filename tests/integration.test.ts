import { describe, expect, test } from 'vitest';
import waktos from 'waktos';
import 'waktos/locale/id-id';
import 'waktos/locale/fr-fr';

// Fixed Timestamp: 2023-12-25T12:00:00Z
const FIXED_TIMESTAMP = 1703505600000;

describe('Comprehensive Core API Tests', () => {
  describe('Scenario 1: Default (No Locale, No Timezone)', () => {
    // Falls back to system locale/timezone (or UTC if system is obscure)
    // We can't strictly assert the output without knowing the runner's env,
    // but we can assert consistency and types.

    test('Creation', () => {
      const date = waktos(FIXED_TIMESTAMP);

      expect(date.valueOf()).toBe(FIXED_TIMESTAMP);
      expect(waktos.isValid(date)).toBe(true);
    });

    test('Getters return numbers', () => {
      const date = waktos(FIXED_TIMESTAMP);

      expect(typeof date.year()).toBe('number');
      expect(typeof date.month()).toBe('number'); // 1-12
      expect(typeof date.day()).toBe('number');
    });

    test('Manipulation (Immutability)', () => {
      const date = waktos(FIXED_TIMESTAMP);
      const nextDay = date.add(1, 'day');

      expect(date.valueOf()).toBe(FIXED_TIMESTAMP); // Original unchanged
      expect(nextDay.valueOf()).toBe(FIXED_TIMESTAMP + 86400000); // Added 24h (approx)
    });
  });

  describe('Scenario 2: Timezone Only (Asia/Tokyo)', () => {
    const TZ = 'Asia/Tokyo'; // UTC+9
    // Expected: 2023-12-25 21:00:00

    test('Creation & Getters', () => {
      const date = waktos(FIXED_TIMESTAMP).timezone(TZ);

      expect(date.year()).toBe(2023);
      expect(date.month()).toBe(12);
      expect(date.day()).toBe(25);
      expect(date.hour()).toBe(21); // 12 + 9
      expect(date.minute()).toBe(0);
    });

    test('Formatting matches Timezone', () => {
      const date = waktos(FIXED_TIMESTAMP).timezone(TZ);

      // ISO format with offset
      expect(date.format('YYYY-MM-DD HH:mm:ss Z')).toBe(
        '2023-12-25 21:00:00 +09:00',
      );
    });

    test('Setters respect Timezone', () => {
      const date = waktos(FIXED_TIMESTAMP).timezone(TZ); // 21:00
      const nextHour = date.hour(22); // Set to 22:00 JST

      expect(nextHour.hour()).toBe(22);
      expect(nextHour.format('HH:mm Z')).toBe('22:00 +09:00');
      // UTC check: 22:00 JST is 13:00 UTC
      expect(nextHour.valueOf()).toBe(FIXED_TIMESTAMP + 3600000);
    });
  });

  describe('Scenario 3: Locale Only (id-id)', () => {
    const LOCALE = 'id-id';

    test('Formatting (Month Names)', () => {
      const date = waktos(FIXED_TIMESTAMP).locale(LOCALE);

      // "Desember" is Indonesian for December
      expect(date.format('MMMM')).toBe('Desember');
    });

    test('Formatting (Day Names)', () => {
      const date = waktos(FIXED_TIMESTAMP).locale(LOCALE);

      // 25 Dec 2023 is Monday -> "Senin"
      expect(date.format('dddd')).toBe('Senin');
    });

    test('Default Format', () => {
      // Just ensure it doesn't crash and returns string
      const date = waktos(FIXED_TIMESTAMP).locale(LOCALE);

      expect(typeof date.toString()).toBe('string');
    });
  });

  describe('Scenario 4: Both Locale and Timezone (fr-fr, America/New_York)', () => {
    const LOCALE = 'fr-fr';
    const TZ = 'America/New_York'; // UTC-5
    // Expected: 2023-12-25 07:00:00

    test('Creation & Getters', () => {
      const date = waktos(FIXED_TIMESTAMP).locale(LOCALE).timezone(TZ);

      expect(date.hour()).toBe(7); // 12 - 5
    });

    test('Formatting (Localized + Timezone)', () => {
      const date = waktos(FIXED_TIMESTAMP).locale(LOCALE).timezone(TZ);

      // French uses lowercase for months usually, but let's check day
      // Monday -> Lundi
      expect(date.format('dddd HH:mm')).toBe('lundi 07:00');
      expect(date.format('Z')).toBe('-05:00');
    });

    test('StartOf Year (Timezone aware)', () => {
      // Start of year in NY: 2023-01-01 00:00:00 EST
      const date = waktos(FIXED_TIMESTAMP).locale(LOCALE).timezone(TZ);
      const startYear = date.startOf('year');

      expect(startYear.format('YYYY-MM-DD HH:mm:ss')).toBe(
        '2023-01-01 00:00:00',
      );
      expect(startYear.year()).toBe(2023);
      expect(startYear.month()).toBe(1);
    });
  });

  describe('Scenario 5: UTC Mode', () => {
    test('Creation via waktos.utc()', () => {
      const date = waktos.utc(FIXED_TIMESTAMP);

      expect(date.hour()).toBe(12); // Must be 12 (UTC)
      expect(date.format('Z')).toBe('Z'); // Or Z, depending on format
    });

    test('Parsing string in UTC mode', () => {
      // Input without Z, should be treated as UTC
      const date = waktos.utc('2023-12-25 12:00:00');

      expect(date.valueOf()).toBe(FIXED_TIMESTAMP);
      expect(date.hour()).toBe(12);
    });

    test('Parsing local string in non-UTC mode (Control)', () => {
      // Just to verify the difference
      // '2023-12-25 12:00:00' in system local time != UTC 12:00 (unless sys is UTC)
      // We assume system is NOT UTC for this test to be meaningful, but if it is, they are equal.
      // We'll just check logic flow.
      const local = waktos('2023-12-25 12:00:00');
      const utc = waktos.utc('2023-12-25 12:00:00');
      // If local TZ is not UTC, these timestamps must differ
      const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (systemTz !== 'UTC') {
        expect(local.valueOf()).not.toBe(utc.valueOf());
      }
    });
  });
});
