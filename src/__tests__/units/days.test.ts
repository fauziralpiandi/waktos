import { describe, it, expect } from 'vitest';
import {
  isLeapYear,
  getDaysInMonth,
  getDaysInYear,
  diffInDays,
} from '../../units/days';

describe('days unit', () => {
  describe('isLeapYear', () => {
    it('should correctly identify leap years', () => {
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(2004)).toBe(true);
      expect(isLeapYear(2008)).toBe(true);
      expect(isLeapYear(2012)).toBe(true);
      expect(isLeapYear(2016)).toBe(true);
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2024)).toBe(true);
    });

    it('should correctly identify non-leap years', () => {
      expect(isLeapYear(1900)).toBe(false);
      expect(isLeapYear(2100)).toBe(false);
      expect(isLeapYear(2001)).toBe(false);
      expect(isLeapYear(2002)).toBe(false);
      expect(isLeapYear(2003)).toBe(false);
      expect(isLeapYear(2005)).toBe(false);
    });
  });

  describe('getDaysInMonth', () => {
    it('should return correct days for each month in a non-leap year', () => {
      const year = 2023;
      expect(getDaysInMonth(year, 0)).toBe(31);
      expect(getDaysInMonth(year, 1)).toBe(28);
      expect(getDaysInMonth(year, 2)).toBe(31);
      expect(getDaysInMonth(year, 3)).toBe(30);
      expect(getDaysInMonth(year, 4)).toBe(31);
      expect(getDaysInMonth(year, 5)).toBe(30);
      expect(getDaysInMonth(year, 6)).toBe(31);
      expect(getDaysInMonth(year, 7)).toBe(31);
      expect(getDaysInMonth(year, 8)).toBe(30);
      expect(getDaysInMonth(year, 9)).toBe(31);
      expect(getDaysInMonth(year, 10)).toBe(30);
      expect(getDaysInMonth(year, 11)).toBe(31);
    });

    it('should return 29 days for February in a leap year', () => {
      expect(getDaysInMonth(2020, 1)).toBe(29);
      expect(getDaysInMonth(2024, 1)).toBe(29);
    });

    it('should throw an error for invalid month values', () => {
      expect(() => getDaysInMonth(2023, -1)).toThrow();
      expect(() => getDaysInMonth(2023, 12)).toThrow();
    });
  });

  describe('getDaysInYear', () => {
    it('should return 365 for a non-leap year', () => {
      expect(getDaysInYear(2023)).toBe(365);
      expect(getDaysInYear(2021)).toBe(365);
      expect(getDaysInYear(2022)).toBe(365);
    });

    it('should return 366 for a leap year', () => {
      expect(getDaysInYear(2020)).toBe(366);
      expect(getDaysInYear(2024)).toBe(366);
      expect(getDaysInYear(2000)).toBe(366);
    });
  });

  describe('diffInDays', () => {
    it('should calculate difference in days correctly', () => {
      const date1 = new Date(2023, 0, 1);
      const date2 = new Date(2023, 0, 1);
      expect(diffInDays(date1, date2)).toBe(0);

      const date3 = new Date(2023, 0, 2);
      expect(diffInDays(date1, date3)).toBe(1);

      const date4 = new Date(2023, 1, 1);
      expect(diffInDays(date1, date4)).toBe(31);

      const date5 = new Date(2024, 0, 1);
      expect(diffInDays(date1, date5)).toBe(365);

      const date6 = new Date(2025, 0, 1);
      expect(diffInDays(date5, date6)).toBe(366);
    });
  });
});
