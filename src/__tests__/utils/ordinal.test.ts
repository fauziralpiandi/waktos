import { describe, it, expect } from 'vitest';
import { getOrdinal, formatOrdinal } from '../../utils/ordinal';

describe('getOrdinal', () => {
  describe('returns correct ordinal suffixes by rules', () => {
    it('returns "st" for numbers ending in 1 (not 11)', () => {
      const stNumbers = [1, 21, 101, 31, 41];
      stNumbers.forEach(num => {
        expect(getOrdinal(num)).toBe('st');
      });
    });

    it('returns "nd" for numbers ending in 2 (not 12)', () => {
      const ndNumbers = [2, 22, 102, 32, 42];
      ndNumbers.forEach(num => {
        expect(getOrdinal(num)).toBe('nd');
      });
    });

    it('returns "rd" for numbers ending in 3 (not 13)', () => {
      const rdNumbers = [3, 23, 103, 33, 43];
      rdNumbers.forEach(num => {
        expect(getOrdinal(num)).toBe('rd');
      });
    });

    it('returns "th" for numbers ending in 0, 4-9', () => {
      const thNumbers = [
        0, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
      ];
      thNumbers.forEach(num => {
        expect(getOrdinal(num)).toBe('th');
      });
    });

    it('returns "th" for teen numbers (11-13) and their multiples', () => {
      const teenNumbers = [11, 12, 13, 111, 112, 113, 211, 212, 213];
      teenNumbers.forEach(num => {
        expect(getOrdinal(num)).toBe('th');
      });
    });
  });

  it('returns empty string for negative numbers', () => {
    const negativeNumbers = [-1, -42, -100, -123];
    negativeNumbers.forEach(num => {
      expect(getOrdinal(num)).toBe('');
    });
  });
});

describe('formatOrdinal', () => {
  it('formats numbers with their correct ordinal suffixes', () => {
    const testCases = [
      { input: 1, expected: '1st' },
      { input: 2, expected: '2nd' },
      { input: 3, expected: '3rd' },
      { input: 4, expected: '4th' },
      { input: 11, expected: '11th' },
      { input: 21, expected: '21st' },
      { input: 102, expected: '102nd' },
      { input: 113, expected: '113th' },
      { input: 0, expected: '0th' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatOrdinal(input)).toBe(expected);
    });
  });
});
