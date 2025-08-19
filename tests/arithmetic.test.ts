import { describe, expect, test } from 'vitest';
import waktos from '..';

const DATE = '2005-04-26T12:30:45.123Z';

describe('Arithmetic', () => {
  const date = waktos(DATE);

  describe('Addition', () => {
    test('adds years', () => {
      expect(date.add(1, 'year').year()).toBe(2006);
      expect(date.add(5, 'year').year()).toBe(2010);
    });

    test('adds months', () => {
      expect(date.add(1, 'month').month()).toBe(5);
      expect(date.add(3, 'month').month()).toBe(7);
    });

    test('adds days', () => {
      expect(date.add(1, 'day').day()).toBe(27);
      expect(date.add(5, 'day').day()).toBe(1); // May 1st
    });

    test('adds time units', () => {
      expect(date.add(1, 'hour').hour()).toBe(13);
      expect(date.add(30, 'minute').minute()).toBe(0); // 12:30 + 30min = 13:00
      expect(date.add(15, 'second').second()).toBe(0); // 45 + 15 = 60 = 0 next minute
    });

    test('adds weeks', () => {
      const result = date.add(1, 'week');

      expect(result.day()).toBe(3); // May 3rd
      expect(result.month()).toBe(5);
    });
  });

  describe('Subtraction', () => {
    test('subtracts years', () => {
      expect(date.sub(1, 'year').year()).toBe(2004);
      expect(date.sub(5, 'year').year()).toBe(2000);
    });

    test('subtracts months', () => {
      expect(date.sub(1, 'month').month()).toBe(3);
      expect(date.sub(2, 'month').month()).toBe(2);
    });

    test('subtracts days', () => {
      expect(date.sub(1, 'day').day()).toBe(25);
      expect(date.sub(5, 'day').day()).toBe(21);
    });

    test('subtracts time units', () => {
      expect(date.sub(1, 'hour').hour()).toBe(11);
      expect(date.sub(30, 'minute').minute()).toBe(0); // 12:30 - 30min = 12:00
      expect(date.sub(15, 'second').second()).toBe(30); // 45 - 15 = 30
    });
  });

  describe('Shift (Alias)', () => {
    test('shift positive = add', () => {
      const added = date.add(3, 'day');
      const shifted = date.shift(3, 'day');

      expect(added.valueOf()).toBe(shifted.valueOf());
    });

    test('shift negative = subtract', () => {
      const subtracted = date.sub(3, 'day');
      const shifted = date.shift(-3, 'day');

      expect(subtracted.valueOf()).toBe(shifted.valueOf());
    });
  });

  describe('Chaining', () => {
    test('chains multiple operations', () => {
      const result = date.add(1, 'year').add(2, 'month').add(5, 'day');

      expect(result.year()).toBe(2006);
      expect(result.month()).toBe(7); // July
      expect(result.day()).toBe(1); // July 1st
    });

    test('preserves immutability in chains', () => {
      const original = waktos(DATE);
      const chained = original.add(1, 'year').sub(1, 'month');

      expect(original.year()).toBe(2005);
      expect(original.month()).toBe(4);
      expect(chained.year()).toBe(2006);
      expect(chained.month()).toBe(3);
    });
  });
});
