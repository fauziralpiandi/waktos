import type { Constructor, DateTimeComponents, Factory, Waktos } from '..';
import type { Locale, Weekday } from '../locale';

declare module '..' {
  interface Waktos {
    isToday(): boolean;
    isYesterday(): boolean;
    isTomorrow(): boolean;
    isWeekday(): boolean;
    isWeekend(): boolean;
    quarterOfYear(): number;
    startOfQuarter(): Waktos;
    endOfQuarter(): Waktos;
  }
}

interface BusinessTime extends Waktos {
  _timestamp: number;
  _locale: Locale;
  _timezone: string;
  _extractComponents(): Pick<DateTimeComponents, 'year' | 'month' | 'day'>;
}

export default function plugin(
  constructor: Constructor,
  waktos: Factory,
): void {
  const w = constructor.prototype;

  Object.assign(w, {
    isToday(this: BusinessTime): boolean {
      const today = waktos
        .createInstance(Date.now(), this._locale, this._timezone)
        .startOf('day');
      const current = waktos
        .createInstance(this._timestamp, this._locale, this._timezone)
        .startOf('day');

      return today.valueOf() === current.valueOf();
    },

    isYesterday(this: BusinessTime): boolean {
      return this.isToday() ? false : this.add(1, 'day').isToday();
    },

    isTomorrow(this: BusinessTime): boolean {
      return this.isToday() ? false : this.sub(1, 'day').isToday();
    },

    isWeekday(this: BusinessTime): boolean {
      const { year, month, day } = this._extractComponents();
      const dayOfWeek = new Date(year, month - 1, day).getDay() as Weekday; // 0=Sunday, 6=Saturday
      const weekend = this._locale.calendar.weekend ?? [0, 6];

      return !weekend.includes(dayOfWeek);
    },

    isWeekend(this: BusinessTime): boolean {
      return !this.isWeekday();
    },

    quarterOfYear(this: BusinessTime): number {
      const { month } = this._extractComponents();

      return Math.ceil(month / 3);
    },

    startOfQuarter(this: BusinessTime): Waktos {
      const { year, month } = this._extractComponents();
      const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;

      return waktos
        .createInstance(this._timestamp, this._locale, this._timezone)
        .set({
          year,
          month: quarterStartMonth,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        });
    },

    endOfQuarter(this: BusinessTime): Waktos {
      const { year, month } = this._extractComponents();
      const quarterEndMonth = Math.floor((month - 1) / 3) * 3 + 3;

      return waktos
        .createInstance(this._timestamp, this._locale, this._timezone)
        .set({
          year,
          month: quarterEndMonth + 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        })
        .sub(1, 'millisecond'); // tick tock, end of quarter
    },
  });
}
