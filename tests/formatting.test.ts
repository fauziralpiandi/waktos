import { describe, expect, test } from 'vitest';
import waktos from 'waktos';

const DATE = '2005-04-26T12:30:45.123Z'; // Reference date from documentation

describe('Formatting', () => {
  const date = waktos(DATE);

  describe('Basic', () => {
    test('default format', () => {
      const result = date.format();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('toString methods', () => {
      expect(typeof date.toString()).toBe('string');
      expect(typeof date.toDateString()).toBe('string');
      expect(typeof date.toTimeString()).toBe('string');
    });
  });

  describe('Custom Tokens', () => {
    test('year tokens', () => {
      expect(date.format('YYYY')).toBe('2005');
      expect(date.format('YY')).toBe('05');
    });

    test('month tokens', () => {
      expect(date.format('MM')).toBe('04');
      expect(date.format('M')).toBe('4');
    });

    test('day tokens', () => {
      expect(date.format('DD')).toBe('26');
      expect(date.format('D')).toBe('26');
    });

    test('time tokens', () => {
      expect(date.format('HH')).toBe('12');
      expect(date.format('mm')).toBe('30');
      expect(date.format('ss')).toBe('45');
      expect(date.format('SSS')).toBe('123');
    });

    test('combined patterns', () => {
      expect(date.format('YYYY-MM-DD')).toBe('2005-04-26');
      expect(date.format('HH:mm:ss')).toBe('12:30:45');
      expect(date.format('YYYY-MM-DD HH:mm:ss')).toBe('2005-04-26 12:30:45');
    });
  });

  describe('Literal Text', () => {
    test('handles literal brackets', () => {
      expect(date.format('[Year:] YYYY')).toBe('Year: 2005');
      expect(date.format('YYYY [年] MM [月]')).toBe('2005 年 04 月');
      expect(date.format('[Today is] YYYY-MM-DD')).toBe('Today is 2005-04-26');
    });

    test('multiple literals', () => {
      expect(date.format('[Year:] YYYY [Month:] MM')).toBe(
        'Year: 2005 Month: 04',
      );
    });
  });

  describe('Common Use Cases', () => {
    test('ISO format', () => {
      expect(date.format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')).toBe(
        '2005-04-26T12:30:45.123Z',
      );
    });

    test('readable format', () => {
      expect(date.format('YYYY-MM-DD HH:mm')).toBe('2005-04-26 12:30');
    });

    test('filename safe format', () => {
      expect(date.format('YYYY-MM-DD[_]HH[-]mm[-]ss')).toBe(
        '2005-04-26_12-30-45',
      );
    });
  });
});
