import { describe, it, expect } from 'vitest';
import waktos from 'waktos';
import comparison from 'waktos/plugin/comparison';
import 'waktos/locale/en-us';

waktos.plugin(comparison);

describe('Plugin: Comparison', () => {
  it('diff', () => {
    const start = waktos('2023-01-01T10:00:00');
    const end = waktos('2023-01-01T12:30:00');

    expect(start.diff(end, 'hour')).toBe(2); // truncated
    expect(end.diff(start, 'hour')).toBe(-2);
    expect(start.diff(end, 'minute')).toBe(150);

    // Month diff
    const m1 = waktos('2023-01-31');
    const m2 = waktos('2023-03-01');

    expect(m1.diff(m2, 'month')).toBe(1); // Not quite 2 months

    const m3 = waktos('2023-03-31');

    expect(m1.diff(m3, 'month')).toBe(2);
  });

  it('isSameOrBefore / isSameOrAfter', () => {
    const date = waktos('2023-05-20');

    expect(date.isSameOrBefore('2023-05-20')).toBe(true);
    expect(date.isSameOrBefore('2023-05-21')).toBe(true);
    expect(date.isSameOrBefore('2023-05-19')).toBe(false);
    expect(date.isSameOrAfter('2023-05-20')).toBe(true);
    expect(date.isSameOrAfter('2023-05-19')).toBe(true);
    expect(date.isSameOrAfter('2023-05-21')).toBe(false);
  });

  it('isWithin', () => {
    const date = waktos('2023-05-20');
    const target = waktos('2023-05-22');

    expect(date.isWithin(2, 'day', target)).toBe(true);
    expect(date.isWithin(1, 'day', target)).toBe(false);
  });

  it('isBetween', () => {
    const start = '2023-01-01';
    const end = '2023-01-10';
    const target = waktos('2023-01-05');
    const boundaryStart = waktos('2023-01-01');
    const boundaryEnd = waktos('2023-01-10');

    // Default inclusivity '[]' (inclusive)
    expect(target.isBetween(start, end)).toBe(true);
    expect(boundaryStart.isBetween(start, end)).toBe(true);
    expect(boundaryEnd.isBetween(start, end)).toBe(true);
    // '()' (exclusive)
    expect(target.isBetween(start, end, undefined, '()')).toBe(true);
    expect(boundaryStart.isBetween(start, end, undefined, '()')).toBe(false);
    expect(boundaryEnd.isBetween(start, end, undefined, '()')).toBe(false);
    // '[)' (start inclusive, end exclusive)
    expect(boundaryStart.isBetween(start, end, undefined, '[)')).toBe(true);
    expect(boundaryEnd.isBetween(start, end, undefined, '[)')).toBe(false);
    // '(]' (start exclusive, end inclusive)
    expect(boundaryStart.isBetween(start, end, undefined, '(]')).toBe(false);
    expect(boundaryEnd.isBetween(start, end, undefined, '(]')).toBe(true);
  });
});
