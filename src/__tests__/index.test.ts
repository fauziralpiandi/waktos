import { describe, it, expect } from 'vitest';
import { waktos, relative, absolute, getOrdinal } from '../index';

describe('waktos API', () => {
  const testDate = new Date('2025-05-10T12:30:45Z');

  describe('named exports', () => {
    it('exports relative function', () => {
      expect(typeof relative).toBe('function');
      expect(relative(new Date())).toBeTypeOf('string');
    });

    it('exports absolute function', () => {
      expect(typeof absolute).toBe('function');
      expect(absolute(new Date())).toBeTypeOf('string');
    });

    it('exports getOrdinal function', () => {
      expect(typeof getOrdinal).toBe('function');
      expect(getOrdinal(1)).toBe('st');
    });
  });

  describe('namespace export', () => {
    it('exports waktos namespace function with object properties', () => {
      expect(typeof waktos).toBe('function');
      expect(waktos).not.toBeNull();
    });

    it('provides relative function in namespace', () => {
      expect(typeof waktos.relative).toBe('function');
      expect(waktos.relative(testDate)).toBeTypeOf('string');
    });

    it('provides absolute function in namespace', () => {
      expect(typeof waktos.absolute).toBe('function');
      expect(waktos.absolute(testDate)).toBeTypeOf('string');
    });

    it('provides getOrdinal function in namespace', () => {
      expect(typeof waktos.getOrdinal).toBe('function');
      expect(waktos.getOrdinal(1)).toBe('st');
    });

    it('ensures namespace functions work the same as direct exports', () => {
      const date = new Date();
      expect(waktos.relative(date)).toBe(relative(date));
      expect(waktos.absolute(date)).toBe(absolute(date));
      expect(waktos.getOrdinal(21)).toBe(getOrdinal(21));
    });
  });

  describe('instance API', () => {
    it('creates a valid instance with a date and supports both format types', () => {
      const instance = waktos(testDate);
      expect(instance).not.toBeNull();
      expect(instance.format('relative')).toBeTypeOf('string');
      expect(instance.format('absolute')).toBeTypeOf('string');

      const relativeWithOptions = instance.format('relative', {
        now: new Date('2025-05-09T12:30:45Z'),
      });
      expect(relativeWithOptions).toBe('tomorrow');

      const absoluteWithOptions = instance.format('absolute', {
        format: 'full',
        includeTime: true,
      });
      expect(absoluteWithOptions).toMatch(/Saturday, May 10, 2025/);
    });

    it('supports instance methods for all formatting utilities', () => {
      const instance = waktos(testDate);
      const relativeResult = instance.relative();
      expect(relativeResult).toBeTypeOf('string');
      expect(relativeResult).toBe(relative(testDate));

      const customNow = new Date('2025-05-09T12:30:45Z');
      expect(instance.relative({ now: customNow })).toBe('tomorrow');

      const absoluteResult = instance.absolute();
      expect(absoluteResult).toBeTypeOf('string');
      expect(absoluteResult).toBe(absolute(testDate));

      const absoluteWithOptions = instance.absolute({
        format: 'full',
        includeTime: true,
      });
      expect(absoluteWithOptions).toMatch(/Saturday, May 10, 2025/);
      expect(absoluteWithOptions).toMatch(/\d{1,2}:\d{2}/);
      expect(instance.getOrdinal(21)).toBe('st');
    });
  });
});
