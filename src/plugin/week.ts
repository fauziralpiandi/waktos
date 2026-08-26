import type Waktos from "..";
import type { Plugin } from "..";

declare module ".." {
  interface Extensions {
    startOfWeek(): Waktos;
    endOfWeek(): Waktos;
    isWeekend(): boolean;
  }
}

const DEFAULT_FIRST_DAY = 1;
const DEFAULT_WEEKEND = [6, 7];

const isoWeekday = (year: number, month: number, day: number): number => {
  const dayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return dayIndex === 0 ? 7 : dayIndex;
};

const startOfWeekStamp = (dayStamp: number, firstDay: number): number => {
  const date = new Date(dayStamp);
  const shift =
    (isoWeekday(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate()
    ) -
      firstDay +
      7) %
    7;
  date.setUTCDate(date.getUTCDate() - shift);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const week: Plugin = (waktos, api) => {
  const w = waktos.prototype;
  if ("startOfWeek" in w && "endOfWeek" in w && "isWeekend" in w) {
    return;
  }

  const dayMs = api.constants.MS_DAY;

  const weekInfo = (locale: string) => {
    try {
      const localeInfo = new Intl.Locale(
        api.normalizeLocale(locale)
      ) as Intl.Locale & {
        getWeekInfo?: () => { firstDay?: number; weekend?: number[] };
        weekInfo?: { firstDay?: number; weekend?: number[] };
      };
      const weekInfo =
        typeof localeInfo.getWeekInfo === "function"
          ? localeInfo.getWeekInfo()
          : localeInfo.weekInfo;
      return {
        firstDay:
          typeof weekInfo?.firstDay === "number"
            ? weekInfo.firstDay
            : DEFAULT_FIRST_DAY,
        weekend:
          Array.isArray(weekInfo?.weekend) && weekInfo.weekend.length > 0
            ? weekInfo.weekend
            : DEFAULT_WEEKEND
      };
    } catch {
      return { firstDay: DEFAULT_FIRST_DAY, weekend: DEFAULT_WEEKEND };
    }
  };

  const descriptors: PropertyDescriptorMap = {};

  if (!("startOfWeek" in w)) {
    descriptors.startOfWeek = {
      value(this: Waktos) {
        const { locale, zone } = this.context();
        const timestamp = this.valueOf();
        const wall = api.parseZoneParts(timestamp, zone, locale);
        const dayStamp = Date.UTC(wall.year, wall.month - 1, wall.day);
        const startStamp = startOfWeekStamp(
          dayStamp,
          weekInfo(locale).firstDay
        );
        const boundary = new Date(startStamp);

        const utcTimestamp = api.wallToUtc(
          {
            year: boundary.getUTCFullYear(),
            month: boundary.getUTCMonth() + 1,
            day: boundary.getUTCDate(),
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
          },
          zone,
          locale,
          timestamp
        );

        return waktos.from(utcTimestamp).locale(locale).zone(zone);
      }
    };
  }

  if (!("endOfWeek" in w)) {
    descriptors.endOfWeek = {
      value(this: Waktos) {
        const { locale, zone } = this.context();
        const timestamp = this.valueOf();
        const wall = api.parseZoneParts(timestamp, zone, locale);
        const dayStamp = Date.UTC(wall.year, wall.month - 1, wall.day);
        const startStamp = startOfWeekStamp(
          dayStamp,
          weekInfo(locale).firstDay
        );
        const endStamp = startStamp + 6 * dayMs;
        const boundary = new Date(endStamp);

        const utcTimestamp = api.wallToUtc(
          {
            year: boundary.getUTCFullYear(),
            month: boundary.getUTCMonth() + 1,
            day: boundary.getUTCDate(),
            hour: 23,
            minute: 59,
            second: 59,
            millisecond: 999
          },
          zone,
          locale,
          timestamp
        );

        return waktos.from(utcTimestamp).locale(locale).zone(zone);
      }
    };
  }

  if (!("isWeekend" in w)) {
    descriptors.isWeekend = {
      value(this: Waktos) {
        const { locale, zone } = this.context();
        const wall = api.parseZoneParts(this.valueOf(), zone, locale);
        return weekInfo(locale).weekend.includes(
          isoWeekday(wall.year, wall.month, wall.day)
        );
      }
    };
  }

  if (Object.keys(descriptors).length > 0) {
    Object.defineProperties(w, descriptors);
  }
};

export default week;
