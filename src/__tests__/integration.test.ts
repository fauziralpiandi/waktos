import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { relative } from '../index';

describe('integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2005-04-26T07:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('entire range of time differences', () => {
    const now = new Date();
    const timeRanges = [
      {
        label: 'seconds',
        date: new Date(now.getTime() - 1 * 1000),
        expected: /just now/,
      },
      {
        label: 'minutes',
        date: new Date(now.getTime() - 59 * 60 * 1000),
        expected: /59 minutes ago/,
      },
      {
        label: 'hours',
        date: new Date(now.getTime() - 23 * 60 * 60 * 1000),
        expected: /23 hours ago/,
      },
      {
        label: 'day',
        date: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        expected: /yesterday/,
      },
      {
        label: 'days',
        date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        expected: /6 days ago/,
      },
      {
        label: 'week',
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        expected: /last week/,
      },
      {
        label: 'weeks',
        date: new Date(now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000),
        expected: /2 weeks ago/,
      },
      {
        label: 'month',
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        expected: /last month/,
      },
      {
        label: 'months',
        date: new Date(now.getTime() - 2 * 30 * 24 * 60 * 60 * 1000),
        expected: /2 months ago/,
      },
      {
        label: 'year',
        date: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
        expected: /last year/,
      },
      {
        label: 'years',
        date: new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000),
        expected: /2 years ago/,
      },
    ];

    for (const { date, expected } of timeRanges) {
      const result = relative(date);
      if (expected instanceof RegExp) {
        expect(result).toMatch(expected);
      } else {
        expect(result).toBe(expected);
      }
    }
  });
});
