import { describe, it, expect } from 'vitest';
import { dateValidator } from '../../utils/validation';

describe('DateValidation', () => {
  describe('isValid', () => {
    it('should return true for valid Date objects', () => {
      expect(dateValidator.isValid(new Date())).toBe(true);
      expect(dateValidator.isValid(new Date('2025-01-01'))).toBe(true);
    });

    it('should return true for valid timestamp numbers', () => {
      expect(dateValidator.isValid(Date.now())).toBe(true);
      expect(dateValidator.isValid(1609459200000)).toBe(true); // 2021-01-01
    });

    it('should return true for valid date strings', () => {
      expect(dateValidator.isValid('2025-01-01')).toBe(true);
      expect(dateValidator.isValid('January 1, 2025')).toBe(true);
      expect(dateValidator.isValid('2025-01-01T00:00:00.000Z')).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(dateValidator.isValid(new Date('invalid-date'))).toBe(false);
      expect(dateValidator.isValid('not-a-date')).toBe(false);
      expect(dateValidator.isValid('2025-13-01')).toBe(false); // Invalid month
    });

    it('should return false for null or undefined values', () => {
      expect(dateValidator.isValid(null)).toBe(false);
      expect(dateValidator.isValid(undefined)).toBe(false);
    });
  });
});
