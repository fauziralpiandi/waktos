import type Waktos from "..";
import type { Plugin } from "..";
import type { CanonicalUnit, DateParts, Unit } from "../types";

declare module ".." {
  interface Extensions {
    startOf(unit: Unit): Waktos;
    endOf(unit: Unit): Waktos;
  }
}

function withBoundary(
  source: DateParts,
  unit: CanonicalUnit,
  edge: "start" | "end",
  monthEnd: (year: number, month: number, utc: boolean) => number
): DateParts {
  const next: DateParts = { ...source };
  const end = edge === "end";

  switch (unit) {
    case "year":
      next.month = end ? 12 : 1;
      next.day = end ? 31 : 1;
      next.hour = end ? 23 : 0;
      next.minute = end ? 59 : 0;
      next.second = end ? 59 : 0;
      next.millisecond = end ? 999 : 0;
      return next;
    case "month":
      next.day = end ? monthEnd(next.year, next.month, true) : 1;
      next.hour = end ? 23 : 0;
      next.minute = end ? 59 : 0;
      next.second = end ? 59 : 0;
      next.millisecond = end ? 999 : 0;
      return next;
    case "day":
      next.hour = end ? 23 : 0;
      next.minute = end ? 59 : 0;
      next.second = end ? 59 : 0;
      next.millisecond = end ? 999 : 0;
      return next;
    case "hour":
      next.minute = end ? 59 : 0;
      next.second = end ? 59 : 0;
      next.millisecond = end ? 999 : 0;
      return next;
    case "minute":
      next.second = end ? 59 : 0;
      next.millisecond = end ? 999 : 0;
      return next;
    case "second":
      next.millisecond = end ? 999 : 0;
      return next;
    case "millisecond":
      return next;
  }
}

const boundary: Plugin = (waktos, api) => {
  const w = waktos.prototype;
  if ("startOf" in w && "endOf" in w) return;

  const monthEnd = (year: number, month: number, utc: boolean): number =>
    api.monthEnd(year, month, utc);

  const resolveBoundary = (
    source: Waktos,
    unit: Unit,
    edge: "start" | "end"
  ): Waktos => {
    const normalizedUnit = api.normalizeUnit(unit);
    if (normalizedUnit === "millisecond") return source;

    const { locale, zone } = source.context();
    const timestamp = source.valueOf();
    const boundaryTimestamp = api.wallToUtc(
      withBoundary(
        api.parseZoneParts(timestamp, zone, locale),
        normalizedUnit,
        edge,
        monthEnd
      ),
      zone,
      locale,
      timestamp
    );
    return waktos.from(boundaryTimestamp).locale(locale).zone(zone);
  };

  Object.defineProperties(w, {
    startOf: {
      value(this: Waktos, unit: Unit) {
        return resolveBoundary(this, unit, "start");
      }
    },
    endOf: {
      value(this: Waktos, unit: Unit) {
        return resolveBoundary(this, unit, "end");
      }
    }
  });
};

export default boundary;
