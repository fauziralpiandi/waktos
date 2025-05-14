import { describe, it, expect } from 'vitest';
import { diffInYears, formatRelativeYears } from '../../units/years';

describe('years unit', () => {
  describe('diffInYears', () => {
    it('should calculate difference in years correctly', () => {
      const date1 = new Date(2023, 0, 15);
      const date2 = new Date(2023, 6, 20);
      expect(diffInYears(date1, date2)).toBe(0);

      const date3 = new Date(2024, 0, 15);
      expect(diffInYears(date1, date3)).toBe(1);

      const date4 = new Date(2028, 0, 15);
      expect(diffInYears(date1, date4)).toBe(5);

      const date5 = new Date(2023, 11, 31);
      const date6 = new Date(2024, 0, 1);
      expect(diffInYears(date5, date6)).toBe(0);

      const date7 = new Date(2023, 0, 15);
      const date8 = new Date(2024, 0, 15);
      expect(diffInYears(date7, date8)).toBe(1);

      const date9 = new Date(2023, 11, 31);
      const date10 = new Date(2024, 0, 1);
      expect(diffInYears(date9, date10)).toBe(0);

      const date11 = new Date(2023, 0, 15);
      const date12 = new Date(2020, 0, 15);
      expect(diffInYears(date11, date12)).toBe(-3);

      const date13 = new Date(2020, 1, 29);
      const date14 = new Date(2021, 1, 28);
      expect(diffInYears(date13, date14)).toBe(1);
    });
  });

  describe('formatRelativeYears', () => {
    it('should format years correctly', () => {
      expect(formatRelativeYears(0, true)).toBe('this year');
      expect(formatRelativeYears(1, true)).toBe('a year ago');
      expect(formatRelativeYears(2, true)).toBe('2 years ago');
      expect(formatRelativeYears(10, true)).toBe('10 years ago');
      expect(formatRelativeYears(0, false)).toBe('this year');
      expect(formatRelativeYears(1, false)).toBe('next year');
      expect(formatRelativeYears(2, false)).toBe('in 2 years');
      expect(formatRelativeYears(10, false)).toBe('in 10 years');
    });
  });
});
