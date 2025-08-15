import type { Constructor, DateTimeComponents, Waktos } from '..';
import type { Locale } from '../locale';

declare module '..' {
  interface Waktos {
    timeOfDay(): string;
  }
}

interface TimeOfDay extends Waktos {
  _timestamp: number;
  _locale: Locale;
  _timezone: string;
  _extractComponents(): Pick<DateTimeComponents, 'hour'>;
}

const resolveTimeOfDay = (hour: number, locale: Locale): string => {
  const normalizedHour = hour % 24;
  const ranges = locale.calendar.periods?.timeOfDay.ranges ?? [];
  const matchedRange = ranges.find(
    ({ start, end }) => normalizedHour >= start && normalizedHour < end,
  );

  if (matchedRange) return matchedRange.label;
  if (ranges[0]) return ranges[0].label;

  return '<timeOfDay>'; // better than nothing :D
};

export default function plugin(constructor: Constructor): void {
  const w = constructor.prototype;

  Object.assign(w, {
    timeOfDay(this: TimeOfDay): string {
      const { hour } = this._extractComponents();

      return resolveTimeOfDay(hour, this._locale);
    },
  });
}
