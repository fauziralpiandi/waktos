import type Waktos from "..";
import type { DateInput, Plugin } from "..";

export type Inclusion = "[]" | "[)" | "(]" | "()";

declare module ".." {
  interface Extensions {
    clamp(min: DateInput | Waktos, max: DateInput | Waktos): Waktos;
    isBetween(
      start: DateInput | Waktos,
      end: DateInput | Waktos,
      inclusion?: Inclusion
    ): boolean;
    overlaps(
      end: DateInput | Waktos,
      otherStart: DateInput | Waktos,
      otherEnd: DateInput | Waktos,
      inclusion?: Inclusion
    ): boolean;
  }
}

interface Span {
  low: number;
  high: number;
  includeLow: boolean;
  includeHigh: boolean;
}

function normalizeInclusion(inclusion: unknown): Inclusion {
  if (
    inclusion === undefined ||
    inclusion === "[]" ||
    inclusion === "[)" ||
    inclusion === "(]" ||
    inclusion === "()"
  ) {
    return inclusion ?? "[]";
  }
  throw new RangeError("Invalid range inclusion.");
}

function swapInclusion(inclusion: Inclusion): Inclusion {
  return inclusion === "[)" ? "(]" : inclusion === "(]" ? "[)" : inclusion;
}

function normalizeRange(
  startTimestamp: number,
  endTimestamp: number,
  inclusion: Inclusion
): Span {
  const needsSwap = startTimestamp > endTimestamp;
  const low = needsSwap ? endTimestamp : startTimestamp;
  const high = needsSwap ? startTimestamp : endTimestamp;
  const normalizedMode = needsSwap ? swapInclusion(inclusion) : inclusion;

  return {
    low,
    high,
    includeLow: normalizedMode.startsWith("["),
    includeHigh: normalizedMode.endsWith("]")
  };
}

function rangesOverlap(left: Span, right: Span): boolean {
  const leftEmpty =
    left.low === left.high && !(left.includeLow && left.includeHigh);
  const rightEmpty =
    right.low === right.high && !(right.includeLow && right.includeHigh);
  if (leftEmpty || rightEmpty) return false;

  const leftBefore =
    left.high < right.low ||
    (left.high === right.low && !(left.includeHigh && right.includeLow));
  if (leftBefore) return false;

  const rightBefore =
    right.high < left.low ||
    (right.high === left.low && !(right.includeHigh && left.includeLow));
  if (rightBefore) return false;

  return true;
}

const range: Plugin = (waktos, api) => {
  const w = waktos.prototype;
  if ("clamp" in w && "isBetween" in w && "overlaps" in w) {
    return;
  }

  const parseInput = (input: DateInput): number => api.parseInput(input);
  const resolveTimestamp = (value: DateInput | Waktos): number => {
    return value instanceof waktos ? value.valueOf() : parseInput(value);
  };

  const descriptors: PropertyDescriptorMap = {};

  if (!("clamp" in w)) {
    descriptors.clamp = {
      value(this: Waktos, min: DateInput | Waktos, max: DateInput | Waktos) {
        const minTimestamp = resolveTimestamp(min);
        const maxTimestamp = resolveTimestamp(max);
        if (minTimestamp > maxTimestamp)
          throw new RangeError("Invalid clamp range.");

        const current = this.valueOf();
        const clamped = Math.min(Math.max(current, minTimestamp), maxTimestamp);
        if (clamped === current) return this;

        const { locale, zone } = this.context();
        return waktos.from(clamped).locale(locale).zone(zone);
      }
    };
  }

  if (!("isBetween" in w)) {
    descriptors.isBetween = {
      value(
        this: Waktos,
        start: DateInput | Waktos,
        end: DateInput | Waktos,
        inclusion?: Inclusion
      ) {
        const mode = normalizeInclusion(inclusion);
        const current = this.valueOf();

        const { low, high, includeLow, includeHigh } = normalizeRange(
          resolveTimestamp(start),
          resolveTimestamp(end),
          mode
        );

        const lowerCheck = includeLow ? current >= low : current > low;
        if (!lowerCheck) return false;

        return includeHigh ? current <= high : current < high;
      }
    };
  }

  if (!("overlaps" in w)) {
    descriptors.overlaps = {
      value(
        this: Waktos,
        end: DateInput | Waktos,
        otherStart: DateInput | Waktos,
        otherEnd: DateInput | Waktos,
        inclusion?: Inclusion
      ) {
        const mode = normalizeInclusion(inclusion);

        const left = normalizeRange(
          this.valueOf(),
          resolveTimestamp(end),
          mode
        );
        const right = normalizeRange(
          resolveTimestamp(otherStart),
          resolveTimestamp(otherEnd),
          mode
        );

        return rangesOverlap(left, right);
      }
    };
  }

  if (Object.keys(descriptors).length > 0) {
    Object.defineProperties(w, descriptors);
  }
};

export default range;
