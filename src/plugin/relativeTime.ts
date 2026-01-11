import type { Constructor, Waktos } from '..';
import { MILLISECOND } from '../constants';
import type { Locale, RelativeUnit } from '../locale';
import { type DateInput, parseInput } from '../utils';

declare module '..' {
  interface Waktos {
    from(source?: DateInput): string;
    since(source?: DateInput): string;
    to(target?: DateInput): string;
    until(target?: DateInput): string;
  }
}

interface RelativeTime extends Waktos {
  _timestamp: number;
  _locale: Locale;
}

const RELATIVE = {
  UNIT: [
    'second',
    'minute',
    'minute',
    'hour',
    'hour',
    'day',
    'day',
    'week',
    'week',
    'month',
  ],
  THRESHOLD: [
    44_000, 89_000, 2_640_000, 5_340_000, 75_600_000, 126_000_000, 518_400_000,
    691_200_000, 2_419_200_000, 2_505_600_000,
  ],
  DURATION: [2, 1, 0, 1, 0, 1, 0, 1, 0, 1], // 0 = calculate dynamically, 1+ = fixed count
  DIVISOR: [
    0,
    MILLISECOND.MINUTE,
    MILLISECOND.MINUTE,
    MILLISECOND.HOUR,
    MILLISECOND.HOUR,
    MILLISECOND.DAY,
    MILLISECOND.DAY,
    MILLISECOND.WEEK,
    MILLISECOND.WEEK,
    MILLISECOND.MONTH,
  ],
} as const;

function resolveTimeUnit(millisecond: number): [RelativeUnit, number] {
  if (millisecond === 0) return ['second', 1];

  for (let key = 0; key < RELATIVE.THRESHOLD.length; key++) {
    const threshold = RELATIVE.THRESHOLD[key];

    if (millisecond <= threshold) {
      const duration = RELATIVE.DURATION[key];
      const unit = RELATIVE.UNIT[key];
      const divisor = RELATIVE.DIVISOR[key];

      if (duration > 0) return [unit, duration];

      if (divisor > 0) {
        const count =
          unit === 'week'
            ? Math.max(2, Math.round(millisecond / divisor)) // "1 week" sounds weird
            : Math.max(1, Math.round(millisecond / divisor));

        return [unit, count];
      }

      return [unit, 1];
    }
  }

  const monthCount = Math.max(1, Math.round(millisecond / MILLISECOND.MONTH));

  return monthCount >= 12
    ? ['year', Math.max(1, Math.trunc(monthCount / 12))]
    : ['month', monthCount];
}

function relativeTime(source: number, target: number, locale: Locale): string {
  const diff = target - source;
  const absDiff = Math.abs(diff);

  if (absDiff <= 5000) {
    // under 5 seconds feels like "now" to humans
    const text = locale.format.relative.units.second.singular;

    return locale.rtl ? `\u202B${text}\u202C` : text;
  }

  const [unit, count] = resolveTimeUnit(absDiff);
  const unitConfig = locale.format.relative.units[unit];
  const text =
    count === 1
      ? unitConfig.singular
      : unitConfig.plural.replace(
          '[n]',
          locale.format.numeral?.(count) ?? String(count),
        );
  const template = (
    diff > 0 ? locale.format.relative.future : locale.format.relative.past
  ).replace('[s]', text);

  return locale.rtl ? `\u202B${template}\u202C` : template;
}

export default function plugin(constructor: Constructor): void {
  const w = constructor.prototype;

  Object.assign(w, {
    from(this: RelativeTime, source?: DateInput): string {
      return relativeTime(
        parseInput(source ?? Date.now()),
        this._timestamp,
        this._locale,
      );
    },

    since(this: RelativeTime, source?: DateInput): string {
      return this.from(source);
    },

    to(this: RelativeTime, target?: DateInput): string {
      return relativeTime(
        this._timestamp,
        parseInput(target ?? Date.now()),
        this._locale,
      );
    },

    until(this: RelativeTime, target?: DateInput): string {
      return this.to(target);
    },
  });
}
