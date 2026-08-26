import { beforeAll, describe, expect, it } from "vitest";
import Waktos from "../../src";
import week from "../../src/plugin/week";

const DAY_MS = 24 * 60 * 60 * 1000;

interface WeekInfo {
  firstDay: number;
  weekend: readonly number[];
}

const defaultWeekInfo: WeekInfo = {
  firstDay: 1,
  weekend: [6, 7]
};

const weekInfoFor = (locale: string): WeekInfo => {
  try {
    const localeInfo = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => {
        firstDay?: number;
        weekend?: number[];
      };
      weekInfo?: {
        firstDay?: number;
        weekend?: number[];
      };
    };
    const raw =
      typeof localeInfo.getWeekInfo === "function"
        ? localeInfo.getWeekInfo()
        : localeInfo.weekInfo;

    if (!raw) return defaultWeekInfo;

    const firstDay =
      typeof raw.firstDay === "number" && raw.firstDay >= 1 && raw.firstDay <= 7
        ? Math.trunc(raw.firstDay)
        : defaultWeekInfo.firstDay;
    const weekend = Array.isArray(raw.weekend)
      ? raw.weekend
          .filter(
            (value): value is number =>
              typeof value === "number" && value >= 1 && value <= 7
          )
          .map((value) => Math.trunc(value))
      : [...defaultWeekInfo.weekend];

    return {
      firstDay,
      weekend:
        weekend.length > 0 ? [...new Set(weekend)] : defaultWeekInfo.weekend
    };
  } catch {
    return defaultWeekInfo;
  }
};

const isoWeekday = (date: Date): number => {
  const weekday = date.getUTCDay();
  return weekday === 0 ? 7 : weekday;
};

const startOfWeekStamp = (timestamp: number, firstDay: number): number => {
  const date = new Date(timestamp);
  const delta = (isoWeekday(date) - firstDay + 7) % 7;
  date.setUTCDate(date.getUTCDate() - delta);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

describe("week", () => {
  beforeAll(() => {
    Waktos.extend(week);
  });

  it("gets start and end of week from locale settings", () => {
    const locale = "en-US";
    const value = Waktos.from("2026-02-18T15:04:05.006Z").locale(locale).utc();
    const info = weekInfoFor(locale);
    const dayStamp = Date.UTC(2026, 1, 18);
    const startStamp = startOfWeekStamp(dayStamp, info.firstDay);

    expect(value.startOfWeek().toISOString()).toBe(
      new Date(startStamp).toISOString()
    );
    expect(value.endOfWeek().toISOString()).toBe(
      new Date(startStamp + 7 * DAY_MS - 1).toISOString()
    );
  });

  it("returns different week boundaries for different locales", () => {
    const value = Waktos.from("2026-02-18T15:04:05.006Z").utc();

    const us = value.locale("en-US").startOfWeek().format("YYYY-MM-DD");
    const gb = value.locale("en-GB").startOfWeek().format("YYYY-MM-DD");
    const usInfo = weekInfoFor("en-US");
    const gbInfo = weekInfoFor("en-GB");

    if (usInfo.firstDay === gbInfo.firstDay) {
      expect(us).toBe(gb);
      return;
    }

    expect(us).not.toBe(gb);
  });

  it("detects weekend days by locale", () => {
    const locale = "en-US";
    const info = weekInfoFor(locale);
    const base = Waktos.from("2026-02-16T12:00:00.000Z").locale(locale).utc();

    for (let offset = 0; offset < 7; offset += 1) {
      const candidate = base.add({ day: offset });
      const weekday = isoWeekday(candidate.toDate());
      expect(candidate.isWeekend()).toBe(info.weekend.includes(weekday));
    }
  });

  it("keeps locale and zone on boundary results", () => {
    const value = Waktos.from("2026-02-18T15:04:05.006Z")
      .locale("id-ID")
      .zone("Asia/Jakarta");

    expect(value.startOfWeek().context()).toEqual({
      locale: "id-ID",
      zone: "Asia/Jakarta"
    });
    expect(value.endOfWeek().context()).toEqual({
      locale: "id-ID",
      zone: "Asia/Jakarta"
    });
  });
});
