import { describe, expect, it } from "vitest";
import Waktos from "../src";
import { asUtc } from "./helpers";

describe("calendar and time zone", () => {
  it("handles month and year edges", () => {
    const jan31 = asUtc("2026-01-31T10:00:00.000Z");
    const feb29 = asUtc("2028-02-29T10:00:00.000Z");
    const mar31 = asUtc("2026-03-31T10:00:00.000Z");

    expect(jan31.add({ month: 1 }).toISOString()).toBe(
      "2026-02-28T10:00:00.000Z"
    );
    expect(mar31.subtract({ month: 1 }).toISOString()).toBe(
      "2026-02-28T10:00:00.000Z"
    );
    expect(feb29.add({ year: 1 }).toISOString()).toBe(
      "2029-02-28T10:00:00.000Z"
    );
  });

  it("adds mixed units", () => {
    const start = asUtc("2026-02-20T00:00:00.000Z");
    const result = start.add({
      day: 1,
      hours: 2,
      minutes: 30,
      seconds: 15,
      milliseconds: 250
    });

    expect(result.toISOString()).toBe("2026-02-21T02:30:15.250Z");
  });

  it("counts full months and years", () => {
    const feb28 = asUtc("2026-02-28T00:00:00.000Z");
    const leapDay = asUtc("2028-02-29T00:00:00.000Z");

    expect(asUtc("2026-03-27T00:00:00.000Z").diff(feb28, "month")).toBe(0);
    expect(asUtc("2026-03-28T00:00:00.000Z").diff(feb28, "month")).toBe(1);
    expect(asUtc("2029-02-27T00:00:00.000Z").diff(leapDay, "year")).toBe(0);
    expect(asUtc("2029-02-28T00:00:00.000Z").diff(leapDay, "year")).toBe(1);
  });

  it("keeps local clock when adding months", () => {
    const local = Waktos.from("2026-01-31T03:00:00Z").zone("Asia/Jakarta");
    const nextMonth = local.add({ month: 1 });

    expect(local.format("YYYY-MM-DD HH:mm")).toBe("2026-01-31 10:00");
    expect(nextMonth.format("YYYY-MM-DD HH:mm")).toBe("2026-02-28 10:00");
  });

  it("rounds backward year diff to zero", () => {
    const leapDay = asUtc("2028-02-29T00:00:00.000Z");
    const nextYear = asUtc("2029-02-28T00:00:00.000Z");

    expect(leapDay.diff(nextYear, "year")).toBe(0);
  });

  it("keeps wall time through DST", () => {
    const d = Waktos.from("2026-03-07T22:00:00Z").zone("America/New_York");
    expect(d.format("HH:mm")).toBe("17:00");

    const nextDay = d.add({ day: 1 });
    expect(nextDay.format("HH:mm")).toBe("17:00");
    expect(nextDay.format("YYYY-MM-DD")).toBe("2026-03-08");

    const fallBefore = Waktos.from("2026-11-01T05:30:00Z").zone(
      "America/New_York"
    );
    expect(fallBefore.format("HH:mm")).toBe("01:30");
    expect(fallBefore.format("Z")).toBe("-04:00");

    const fallAfter = fallBefore.add({ hour: 1 });
    expect(fallAfter.format("HH:mm")).toBe("01:30");
    expect(fallAfter.format("Z")).toBe("-05:00");
  });

  it("handles spring forward gap", () => {
    const beforeGap = Waktos.from("2026-03-07T07:30:00Z").zone(
      "America/New_York"
    );
    expect(beforeGap.format("YYYY-MM-DD HH:mm Z")).toBe(
      "2026-03-07 02:30 -05:00"
    );

    const nextDay = beforeGap.add({ day: 1 });
    expect(nextDay.format("YYYY-MM-DD HH:mm Z")).toBe(
      "2026-03-08 03:30 -04:00"
    );
  });

  it("handles repeated fall back hour", () => {
    const beforeFallback = Waktos.from("2026-10-31T05:30:00Z").zone(
      "America/New_York"
    );
    expect(beforeFallback.format("YYYY-MM-DD HH:mm Z")).toBe(
      "2026-10-31 01:30 -04:00"
    );

    const repeated = beforeFallback.add({ day: 1 });
    expect(repeated.format("YYYY-MM-DD HH:mm Z")).toBe(
      "2026-11-01 01:30 -04:00"
    );

    const second = Waktos.from("2026-11-01T06:30:00Z").zone("America/New_York");
    expect(second.format("YYYY-MM-DD HH:mm Z")).toBe("2026-11-01 01:30 -05:00");
    expect(second.subtract({ day: 1 }).format("YYYY-MM-DD HH:mm Z")).toBe(
      "2026-10-31 01:30 -04:00"
    );
  });

  it("keeps jakarta clock when adding a day", () => {
    const jakarta = Waktos.from("2024-03-09T19:30:00Z").zone("Asia/Jakarta");
    expect(jakarta.format("YYYY-MM-DD HH:mm Z")).toBe(
      "2024-03-10 02:30 +07:00"
    );

    const nextDay = jakarta.add({ day: 1 });
    expect(nextDay.format("YYYY-MM-DD HH:mm Z")).toBe(
      "2024-03-11 02:30 +07:00"
    );
  });

  it("works with non-hour time zone offsets", () => {
    const d = Waktos.from("2026-01-01T10:00:00Z");

    const kathmandu = d.zone("Asia/Kathmandu");
    expect(kathmandu.format("HH:mm Z")).toBe("15:45 +05:45");

    const kolkata = d.zone("Asia/Kolkata");
    expect(kolkata.format("HH:mm Z")).toBe("15:30 +05:30");
  });

  it("handles far time zone offsets", () => {
    const d = Waktos.from("2026-01-01T10:00:00Z");

    const kiritimati = d.zone("Pacific/Kiritimati");
    expect(kiritimati.format("YYYY-MM-DD HH:mm")).toBe("2026-01-02 00:00");

    const pagoPago = d.zone("Pacific/Pago_Pago");
    expect(pagoPago.format("YYYY-MM-DD HH:mm")).toBe("2025-12-31 23:00");
  });

  it("handles leap year date shifts", () => {
    const leapDay = Waktos.from("2024-02-29T10:00:00Z");
    expect(leapDay.add({ year: 1 }).format("YYYY-MM-DD")).toBe("2025-02-28");
    expect(leapDay.add({ year: 4 }).format("YYYY-MM-DD")).toBe("2028-02-29");
  });

  it("creates wall times in an IANA zone", () => {
    const jakarta = Waktos.zoned("2026-01-02T09:30", "Asia/Jakarta");

    expect(jakarta.context().zone).toBe("Asia/Jakarta");
    expect(jakarta.toISOString()).toBe("2026-01-02T02:30:00.000Z");
    expect(() => Waktos.zoned("2026-01-02T09:30Z", "Asia/Jakarta")).toThrow(
      RangeError
    );
  });

  it("disambiguates repeated and nonexistent wall times", () => {
    const zone = "America/New_York";
    const fold = "2026-11-01T01:30";
    const gap = "2026-03-08T02:30";

    expect(Waktos.zoned(fold, zone).toISOString()).toBe(
      "2026-11-01T05:30:00.000Z"
    );
    expect(Waktos.zoned(fold, zone, "earlier").toISOString()).toBe(
      "2026-11-01T05:30:00.000Z"
    );
    expect(Waktos.zoned(fold, zone, "later").toISOString()).toBe(
      "2026-11-01T06:30:00.000Z"
    );
    expect(() => Waktos.zoned(fold, zone, "reject")).toThrow(RangeError);

    expect(Waktos.zoned(gap, zone).toISOString()).toBe(
      "2026-03-08T07:30:00.000Z"
    );
    expect(Waktos.zoned(gap, zone, "earlier").toISOString()).toBe(
      "2026-03-08T06:30:00.000Z"
    );
    expect(Waktos.zoned(gap, zone, "later").toISOString()).toBe(
      "2026-03-08T07:30:00.000Z"
    );
    expect(() => Waktos.zoned(gap, zone, "reject")).toThrow(RangeError);
  });

  it("normalizes time zone names correctly", () => {
    const d = Waktos.now();

    expect(d.zone("utc").context().zone).toBe("UTC");
    expect(d.zone("Etc/UTC").context().zone).toBe("UTC");
    expect(() => d.zone("Mars/Base_Alpha")).toThrow(RangeError);
    expect(() => d.zone(" ")).toThrow(TypeError);
  });
});
