import { describe, it, expect } from 'vitest';
import waktos from 'waktos';
import calendarMath from 'waktos/plugin/calendarMath';
import 'waktos/locale/en-us';

waktos.plugin(calendarMath);

describe('Plugin: Calendar Math', () => {
  it('isLeapYear', () => {
    expect(waktos('2020-01-01').isLeapYear()).toBe(true);
    expect(waktos('2021-01-01').isLeapYear()).toBe(false);
    expect(waktos('2000-01-01').isLeapYear()).toBe(true); // Century leap
    expect(waktos('1900-01-01').isLeapYear()).toBe(false); // Century non-leap
  });

  it('daysInYear', () => {
    expect(waktos('2020-01-01').daysInYear()).toBe(366);
    expect(waktos('2021-01-01').daysInYear()).toBe(365);
  });

  it('daysInMonth', () => {
    expect(waktos('2023-01-15').daysInMonth()).toBe(31);
    expect(waktos('2023-02-15').daysInMonth()).toBe(28);
    expect(waktos('2024-02-15').daysInMonth()).toBe(29); // Leap
    expect(waktos('2023-04-15').daysInMonth()).toBe(30);
  });

  it('dayOfYear', () => {
    expect(waktos('2023-01-01').dayOfYear()).toBe(1);
    expect(waktos('2023-02-01').dayOfYear()).toBe(32);
    expect(waktos('2023-12-31').dayOfYear()).toBe(365);
    expect(waktos('2024-12-31').dayOfYear()).toBe(366); // Leap
  });

  it('weekOfYear (ISO 8601)', () => {
    // Standard week
    expect(waktos('2023-01-04').weekOfYear()).toBe(1); // First week of 2023
    // Cross-year boundaries
    // Jan 1, 2023 is Sunday. Week 1 starts Jan 2? No, ISO says week 1 contains Jan 4.
    // 2023 starts on Sunday. Jan 1 is part of Week 52 of 2022.
    expect(waktos('2023-01-01').weekOfYear()).toBe(52);
    // Dec 31, 2023 is Sunday. It's the last day of Week 52.
    expect(waktos('2023-12-31').weekOfYear()).toBe(52);
    // 2024 (Leap year starting Monday)
    expect(waktos('2024-01-01').weekOfYear()).toBe(1);
    expect(waktos('2024-12-30').weekOfYear()).toBe(1); // Monday, part of Week 1 2025
  });

  it('weeksInYear (ISO 8601)', () => {
    expect(waktos('2023-01-01').weeksInYear()).toBe(52);
    expect(waktos('2020-01-01').weeksInYear()).toBe(53); // Leap year starting Wednesday -> 53 weeks
    expect(waktos('2026-01-01').weeksInYear()).toBe(53); // Starts on Thursday -> 53 weeks
  });
});
