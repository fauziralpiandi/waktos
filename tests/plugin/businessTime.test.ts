import { describe, it, expect } from 'vitest';
import waktos from 'waktos';
import businessTime from 'waktos/plugin/businessTime';
import 'waktos/locale/en-us';

waktos.plugin(businessTime);

describe('Plugin: Business Time', () => {
  const now = Date.now();

  it('isToday', () => {
    expect(waktos(now).isToday()).toBe(true);
    expect(waktos(now).sub(1, 'day').isToday()).toBe(false);
    expect(waktos(now).add(1, 'day').isToday()).toBe(false);
  });

  it('isYesterday', () => {
    const yesterday = waktos(now).sub(1, 'day');

    expect(yesterday.isYesterday()).toBe(true);
    expect(waktos(now).isYesterday()).toBe(false);
  });

  it('isTomorrow', () => {
    const tomorrow = waktos(now).add(1, 'day');

    expect(tomorrow.isTomorrow()).toBe(true);
    expect(waktos(now).isTomorrow()).toBe(false);
  });

  it('isWeekday / isWeekend', () => {
    // Fixed date: Friday, Oct 27, 2023
    const friday = waktos('2023-10-27');

    expect(friday.format('dddd')).toBe('Friday');
    expect(friday.isWeekday()).toBe(true);
    expect(friday.isWeekend()).toBe(false);

    // Fixed date: Saturday, Oct 28, 2023
    const saturday = waktos('2023-10-28');

    expect(saturday.format('dddd')).toBe('Saturday');
    expect(saturday.isWeekday()).toBe(false);
    expect(saturday.isWeekend()).toBe(true);

    // Fixed date: Sunday, Oct 29, 2023
    const sunday = waktos('2023-10-29');

    expect(sunday.format('dddd')).toBe('Sunday');
    expect(sunday.isWeekday()).toBe(false);
    expect(sunday.isWeekend()).toBe(true);
  });

  it('quarterOfYear', () => {
    expect(waktos('2023-01-01').quarterOfYear()).toBe(1);
    expect(waktos('2023-03-31').quarterOfYear()).toBe(1);
    expect(waktos('2023-04-01').quarterOfYear()).toBe(2);
    expect(waktos('2023-06-30').quarterOfYear()).toBe(2);
    expect(waktos('2023-07-01').quarterOfYear()).toBe(3);
    expect(waktos('2023-10-01').quarterOfYear()).toBe(4);
    expect(waktos('2023-12-31').quarterOfYear()).toBe(4);
  });

  it('startOfQuarter', () => {
    const q2 = waktos('2023-05-15T10:00:00');
    const start = q2.startOfQuarter();

    expect(start.format('YYYY-MM-DD HH:mm:ss')).toBe('2023-04-01 00:00:00');
    expect(start.quarterOfYear()).toBe(2);
  });

  it('endOfQuarter', () => {
    const q2 = waktos('2023-05-15T10:00:00');
    const end = q2.endOfQuarter();

    expect(end.format('YYYY-MM-DD HH:mm:ss.SSS')).toBe(
      '2023-06-30 23:59:59.999',
    );
    expect(end.quarterOfYear()).toBe(2);
  });
});
