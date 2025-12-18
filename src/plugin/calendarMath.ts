import type { Constructor, DateTimeComponents, Waktos } from '..';
import type { Locale } from '../locale';
import { MILLISECOND } from '../constants';
import { leapYear } from '../utils';

declare module '..' {
  interface Waktos {
    dayOfYear(): number;
    daysInMonth(): number;
    daysInYear(): number;
    weekOfYear(): number;
    weeksInYear(): number;
    isLeapYear(): boolean;
  }
}

interface CalendarMath extends Waktos {
  _locale: Locale;
  _extractComponents(): Pick<DateTimeComponents, 'year' | 'month' | 'day'>;
}

function calculateDayOfYear(year: number, month: number, day: number): number {
  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (leapYear(year)) daysInMonths[1] = 29; // every 4 years, except century years, except every 400

  let dayOfYear = day;

  for (let i = 0; i < month - 1; i++) {
    dayOfYear += daysInMonths[i];
  }

  return dayOfYear;
}

function calculateDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function calculateDaysInYear(year: number): number {
  return leapYear(year) ? 366 : 365;
}

function calculateWeeksInYear(year: number): number {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const jan1Day = jan1.getUTCDay();

  return jan1Day === 4 || (leapYear(year) && jan1Day === 3) ? 53 : 52; // ISO 8601 week magic
}

/**
 * Calculates ISO 8601 week number. Week 1 contains January 4th.
 * Handles cross-year boundaries and different week start days.
 */
function calculateWeekOfYear(
  year: number,
  month: number,
  day: number,
  weekStart: number,
): number {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const jan1DayOfWeek = jan1.getUTCDay();
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const daysSinceJan1 = Math.floor(
    (targetDate.getTime() - jan1.getTime()) / MILLISECOND.DAY,
  );
  const adjustedJan1Day = (jan1DayOfWeek - weekStart + 7) % 7;
  const daysToFirstWeek = adjustedJan1Day === 0 ? 0 : 7 - adjustedJan1Day;

  if (daysSinceJan1 < daysToFirstWeek) {
    const prevYear = year - 1;
    const prevYearWeeks = calculateWeeksInYear(prevYear);

    return prevYearWeeks;
  }

  const weekNumber = Math.floor((daysSinceJan1 - daysToFirstWeek) / 7) + 1;
  const weeksInThisYear = calculateWeeksInYear(year);

  if (weekNumber > weeksInThisYear) return 1;

  return weekNumber;
}

export default function plugin(constructor: Constructor): void {
  const w = constructor.prototype;

  Object.assign(w, {
    dayOfYear(this: CalendarMath): number {
      const { year, month, day } = this._extractComponents();

      return calculateDayOfYear(year, month, day);
    },

    daysInMonth(this: CalendarMath): number {
      const { year, month } = this._extractComponents();

      return calculateDaysInMonth(year, month);
    },

    daysInYear(this: CalendarMath): number {
      const { year } = this._extractComponents();

      return calculateDaysInYear(year);
    },

    weekOfYear(this: CalendarMath): number {
      const { year, month, day } = this._extractComponents();
      const weekStart = this._locale.calendar.weekStart ?? 1;

      return calculateWeekOfYear(year, month, day, weekStart);
    },

    weeksInYear(this: CalendarMath): number {
      const { year } = this._extractComponents();

      return calculateWeeksInYear(year);
    },

    isLeapYear(this: CalendarMath): boolean {
      const { year } = this._extractComponents();

      return leapYear(year);
    },
  });
}
