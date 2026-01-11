import type {
  ComparisonUnit,
  Constructor,
  DateTimeComponents,
  Waktos,
} from '..';
import { TIME_UNITS } from '../constants';
import type { Locale } from '../locale';
import { type DateInput, parseInput } from '../utils';

declare module '..' {
  interface Waktos {
    diff(target: DateInput, unit?: ComparisonUnit): number;
    isSameOrBefore(target: DateInput, unit?: ComparisonUnit): boolean;
    isSameOrAfter(target: DateInput, unit?: ComparisonUnit): boolean;
    isWithin(range: number, unit: ComparisonUnit, target: DateInput): boolean;
    isBetween(
      start: DateInput,
      end: DateInput,
      unit?: ComparisonUnit,
      inclusivity?: Inclusivity,
    ): boolean;
  }
}

interface Comparison extends Waktos {
  _timestamp: number;
  _locale: Locale;
  _timezone: string;
  _extractComponents(): DateTimeComponents;
}

type Inclusivity = '[]' | '[)' | '(]' | '()';

function calculateDiff(
  sourceInstance: Comparison,
  targetTimestamp: number,
  unit: NonNullable<ComparisonUnit> = 'second',
): number {
  const diff = targetTimestamp - sourceInstance._timestamp;

  if (unit === 'month' || unit === 'year') {
    const sourceComponents = sourceInstance._extractComponents();
    const tempInstance = Object.create(sourceInstance) as Comparison;

    tempInstance._timestamp = targetTimestamp;

    const targetComponents = tempInstance._extractComponents();

    let months = (targetComponents.year - sourceComponents.year) * 12;

    months += targetComponents.month - sourceComponents.month;

    if (targetComponents.day < sourceComponents.day) months -= 1;

    return unit === 'year' ? Math.trunc(months / 12) : months;
  }

  const multiplier = TIME_UNITS[unit as keyof typeof TIME_UNITS];

  return Math.trunc(diff / multiplier) || 0; // avoid -0 edge case
}

export default function plugin(constructor: Constructor): void {
  const w = constructor.prototype;

  Object.assign(w, {
    diff(
      this: Comparison,
      target: DateInput,
      unit: ComparisonUnit = 'second',
    ): number {
      const targetTimestamp = parseInput(target);

      return calculateDiff(this, targetTimestamp, unit);
    },

    isSameOrBefore(
      this: Comparison,
      target: DateInput,
      unit?: ComparisonUnit,
    ): boolean {
      return this.isSame(target, unit) || this.isBefore(target, unit);
    },

    isSameOrAfter(
      this: Comparison,
      target: DateInput,
      unit?: ComparisonUnit,
    ): boolean {
      return this.isSame(target, unit) || this.isAfter(target, unit);
    },

    isWithin(
      this: Comparison,
      range: number,
      unit: NonNullable<ComparisonUnit>,
      target: DateInput,
    ): boolean {
      const targetTimestamp = parseInput(target);
      const diff = Math.abs(calculateDiff(this, targetTimestamp, unit));

      return diff <= range;
    },

    isBetween(
      this: Comparison,
      start: DateInput,
      end: DateInput,
      unit?: ComparisonUnit,
      inclusivity: Inclusivity = '[]',
    ): boolean {
      const startTimestamp = parseInput(start);
      const endTimestamp = parseInput(end);
      const actualStart = Math.min(startTimestamp, endTimestamp);
      const actualEnd = Math.max(startTimestamp, endTimestamp);
      const isAfterStart = inclusivity.startsWith('[')
        ? this.isSameOrAfter(actualStart, unit)
        : this.isAfter(actualStart, unit);
      const isBeforeEnd =
        inclusivity[1] === ']'
          ? this.isSameOrBefore(actualEnd, unit)
          : this.isBefore(actualEnd, unit);

      return isAfterStart && isBeforeEnd;
    },
  });
}
