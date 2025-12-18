import { describe, it, expect } from 'vitest';
import waktos from 'waktos';
import relativeTime from 'waktos/plugin/relativeTime';

waktos.plugin(relativeTime);

describe('Plugin: Relative Time', () => {
  const now = waktos();

  it('from (future)', () => {
    const future = now.add(10, 'minute');

    // "Now" relative to "Future" is in the past
    expect(now.from(future)).toBe('10 minutes ago');
    // "Future" relative to "Now" is in the future
    expect(future.from(now)).toBe('in 10 minutes');
  });

  it('from (past)', () => {
    const past = now.sub(5, 'hour');

    // "Now" relative to "Past" is in the future
    expect(now.from(past)).toBe('in 5 hours');
    // "Past" relative to "Now" is in the past
    expect(past.from(now)).toBe('5 hours ago');
  });

  it('thresholds', () => {
    // Under 5 seconds -> "now" (singular unit in en-US)
    expect(now.from(now.add(4, 'second'))).toBe('now');
    // 44s -> a few seconds ago
    expect(now.from(now.add(44, 'second'))).toBe('a few seconds ago');
    // 45s -> a minute. Using future.from(now) to get "in ..."
    expect(now.add(45, 'second').from(now)).toBe('in a minute');
    // 45 minutes -> an hour
    expect(now.add(45, 'minute').from(now)).toBe('in an hour');
    // 22 hours -> a day
    expect(now.add(22, 'hour').from(now)).toBe('in a day');
    // 30 days -> a month
    expect(now.add(30, 'day').from(now)).toBe('in a month');
    // 12 months -> a year
    expect(now.add(12, 'month').from(now)).toBe('in a year');
  });

  it('aliases', () => {
    const target = now.add(1, 'day');

    expect(now.to(target)).toBe('in a day');
    expect(now.until(target)).toBe('in a day');
    expect(target.since(now)).toBe('in a day');
  });
});
