import { describe, it, expect } from 'vitest';
import { diffInMonths, formatRelativeMonths } from '../../units/months';

describe('months unit', () => {
  describe('diffInMonths', () => {
    it('should calculate difference in months correctly', () => {
      const date1 = new Date(2023, 0, 15);
      const date2 = new Date(2023, 0, 20);
      expect(diffInMonths(date1, date2)).toBe(0);

      const date3 = new Date(2023, 1, 15);
      expect(diffInMonths(date1, date3)).toBe(1);

      const date4 = new Date(2023, 5, 15);
      expect(diffInMonths(date1, date4)).toBe(5);

      const date5 = new Date(2024, 0, 15);
      expect(diffInMonths(date1, date5)).toBe(12);

      const date6 = new Date(2023, 0, 31);
      const date7 = new Date(2023, 1, 15);
      expect(diffInMonths(date6, date7)).toBe(0);

      const date8 = new Date(2023, 0, 15);
      const date9 = new Date(2023, 2, 15);
      expect(diffInMonths(date8, date9)).toBe(2);

      const date10 = new Date(2023, 0, 31);
      const date11 = new Date(2023, 1, 28);
      expect(diffInMonths(date10, date11)).toBe(1);

      const date12 = new Date(2023, 5, 15);
      const date13 = new Date(2023, 2, 15);
      expect(diffInMonths(date12, date13)).toBe(-3);
    });
  });

  describe('formatRelativeMonths', () => {
    it('should format months correctly', () => {
      expect(formatRelativeMonths(0, true)).toBe('this month');
      expect(formatRelativeMonths(1, true)).toBe('a month ago');
      expect(formatRelativeMonths(2, true)).toBe('2 months ago');
      expect(formatRelativeMonths(12, true)).toBe('12 months ago');

      expect(formatRelativeMonths(0, false)).toBe('this month');
      expect(formatRelativeMonths(1, false)).toBe('next month');
      expect(formatRelativeMonths(2, false)).toBe('in 2 months');
      expect(formatRelativeMonths(12, false)).toBe('in 12 months');
    });
  });
});
