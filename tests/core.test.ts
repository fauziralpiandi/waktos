import { describe, expect, it } from "vitest";
import Waktos, { type Duration, type Plugin } from "../src";
import { asUtc } from "./helpers";

describe("core", () => {
  it("gets now with system defaults", () => {
    const before = Date.now();
    const now = Waktos.now();
    const after = Date.now();
    const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;

    expect(now.valueOf()).toBeGreaterThanOrEqual(before);
    expect(now.valueOf()).toBeLessThanOrEqual(after);
    expect(now.context().locale).toBe(systemLocale);
    expect(now.context().zone).toBe(
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
  });

  it("creates utc and local values", () => {
    const systemZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const source = "2005-04-26T03:04:05.006Z";

    const utc = Waktos.utc(source);
    const local = Waktos.local(source);

    expect(utc.context().zone).toBe("UTC");
    expect(utc.toISOString()).toBe("2005-04-26T03:04:05.006Z");

    expect(local.context().zone).toBe(systemZone);
    expect(local.toISOString()).toBe("2005-04-26T03:04:05.006Z");

    expect(() => Waktos.utc(undefined as unknown as string)).toThrow(TypeError);
    expect(() => Waktos.local(undefined as unknown as string)).toThrow(
      TypeError
    );
  });

  it("parses timestamps and rejects bad numbers", () => {
    expect(Waktos.from(1_735_787_045_000).toISOString()).toBe(
      "2025-01-02T03:04:05.000Z"
    );
    expect(Waktos.from(1.25).toISOString()).toBe("1970-01-01T00:00:00.001Z");
    expect(Waktos.from(-1).toISOString()).toBe("1969-12-31T23:59:59.999Z");
    expect(() => Waktos.from(Number.NaN)).toThrow(RangeError);
    expect(() => Waktos.from(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  it("validates input and copies instances", () => {
    const base = asUtc("2005-04-26T03:04:05.006Z");
    const copied = Waktos.from(base);
    const systemZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;

    expect(copied.valueOf()).toBe(base.valueOf());
    expect(copied.context().locale).toBe(systemLocale);
    expect(copied.context().zone).toBe(systemZone);
  });

  it("validates input with Waktos.isValid", () => {
    const base = asUtc("2005-04-26T03:04:05.006Z");

    expect(Waktos.isValid(base)).toBe(true);
    expect(Waktos.isValid("2005-04-26T03:04:05Z")).toBe(true);
    expect(Waktos.isValid(123_456)).toBe(true);
    expect(Waktos.isValid(new Date("2005-04-26T03:04:05.006Z"))).toBe(true);

    expect(Waktos.isValid("garbage")).toBe(false);
    expect(Waktos.isValid(undefined)).toBe(false);
    expect(Waktos.isValid(Number.NaN)).toBe(false);
    expect(Waktos.isValid(new Date("invalid"))).toBe(false);
    expect(Waktos.isValid({ valueOf: () => 1 })).toBe(false);
  });

  it("stays immutable", () => {
    const original = asUtc("2005-04-26T00:00:00.000Z");
    const localized = original.locale("id");
    const zoned = original.zone("Asia/Jakarta");
    const local = original.local();
    const added = original.add({ day: 1, hours: 2 });

    expect(original.toISOString()).toBe("2005-04-26T00:00:00.000Z");
    expect(localized.context().locale).toBe("id");
    expect(zoned.context().zone).toBe("Asia/Jakarta");
    expect(local.valueOf()).toBe(original.valueOf());
    expect(added.valueOf()).not.toBe(original.valueOf());
    expect(original.context().zone).toBe("UTC");
  });

  it("can switch back to local zone", () => {
    const systemZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const utc = asUtc("2026-02-20T00:00:00.000Z");

    const local = utc.local();

    expect(local.context().zone).toBe(systemZone);
    expect(local.valueOf()).toBe(utc.valueOf());
  });

  it("requires ordinal plugin before calling Waktos.ordinal", () => {
    expect(() => Waktos.ordinal("en-US", (value) => String(value))).toThrow(
      Error
    );
  });

  it("handles epoch and negative time", () => {
    const epoch = Waktos.from(0);
    expect(epoch.toISOString()).toBe("1970-01-01T00:00:00.000Z");

    const past = epoch.add({ millisecond: -1 });
    expect(past.toISOString()).toBe("1969-12-31T23:59:59.999Z");
  });

  it("installs plugins once", () => {
    let installs = 0;
    const plugin: Plugin = () => {
      installs += 1;
    };

    expect(Waktos.extend(plugin)).toBe(Waktos);
    expect(Waktos.extend(plugin)).toBe(Waktos);
    expect(installs).toBe(1);
    expect(() => Waktos.extend(42 as unknown as Plugin)).toThrow(TypeError);
  });

  it("compares before, after, and same", () => {
    const base = asUtc("2026-02-20T00:00:00.000Z");
    const later = asUtc("2026-02-21T00:00:00.000Z");
    const same = asUtc("2026-02-20T00:00:00.000Z");

    expect(base.isBefore(later)).toBe(true);
    expect(later.isAfter(base)).toBe(true);
    expect(base.isSame(same)).toBe(true);
    expect(base.isAfter(later)).toBe(false);
    expect(base.isBefore(same)).toBe(false);
  });

  it("returns string and Date outputs", () => {
    const value = asUtc("2005-04-26T03:04:05.006Z");

    expect(value.toString()).toBe("2005-04-26T03:04:05.006+00:00");
    expect(value.toJSON()).toBe("2005-04-26T03:04:05.006Z");
    expect(JSON.stringify(value)).toBe('"2005-04-26T03:04:05.006Z"');
    expect(JSON.stringify({ value })).toBe(
      '{"value":"2005-04-26T03:04:05.006Z"}'
    );

    const asDate = value.toDate();
    expect(asDate).toBeInstanceOf(Date);
    expect(asDate.toISOString()).toBe("2005-04-26T03:04:05.006Z");
  });

  it("calculates diffs by unit", () => {
    const base = asUtc("2026-02-20T00:00:00.000Z");
    const later = asUtc("2026-02-20T01:30:15.250Z");

    expect(later.diff(base, "millisecond")).toBe(5_415_250);
    expect(later.diff(base, "second")).toBeCloseTo(5_415.25, 12);
    expect(later.diff(base, "minute")).toBeCloseTo(90.25416666666666, 12);
    expect(later.diff(base, "hour")).toBeCloseTo(1.504236111111111, 12);
    expect(later.diff(base, "day")).toBeCloseTo(0.06267650462962963, 12);
    expect(later.diff(base, "minutes")).toBeCloseTo(90.25416666666666, 12);
    expect(later.diff(base, "days")).toBeCloseTo(0.06267650462962963, 12);
  });

  it("rejects invalid units", () => {
    const value = asUtc("2026-02-20T00:00:00.000Z");
    const other = asUtc("2026-02-19T00:00:00.000Z");

    expect(() => value.diff(other, "week" as never)).toThrow(RangeError);
    expect(() => value.add({ week: 1 } as unknown as Duration)).toThrow(
      RangeError
    );
    expect(() => value.subtract({ quarter: 1 } as unknown as Duration)).toThrow(
      RangeError
    );
  });
});
