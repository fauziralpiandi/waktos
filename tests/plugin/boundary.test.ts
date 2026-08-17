import { beforeAll, describe, expect, it } from "vitest";
import Waktos from "../../src";
import boundary from "../../src/plugin/boundary";
import { asUtc } from "../helpers";

describe("boundary", () => {
  beforeAll(() => {
    Waktos.extend(boundary);
  });

  it("gets startOf and endOf in UTC", () => {
    const value = asUtc("2026-02-20T12:34:56.789Z");

    expect(value.startOf("year").toISOString()).toBe(
      "2026-01-01T00:00:00.000Z"
    );
    expect(value.endOf("year").toISOString()).toBe("2026-12-31T23:59:59.999Z");

    expect(value.startOf("month").toISOString()).toBe(
      "2026-02-01T00:00:00.000Z"
    );
    expect(value.endOf("month").toISOString()).toBe("2026-02-28T23:59:59.999Z");

    expect(value.startOf("day").toISOString()).toBe("2026-02-20T00:00:00.000Z");
    expect(value.endOf("day").toISOString()).toBe("2026-02-20T23:59:59.999Z");

    expect(value.startOf("hour").toISOString()).toBe(
      "2026-02-20T12:00:00.000Z"
    );
    expect(value.endOf("hour").toISOString()).toBe("2026-02-20T12:59:59.999Z");

    expect(value.startOf("minute").toISOString()).toBe(
      "2026-02-20T12:34:00.000Z"
    );
    expect(value.endOf("minute").toISOString()).toBe(
      "2026-02-20T12:34:59.999Z"
    );

    expect(value.startOf("second").toISOString()).toBe(
      "2026-02-20T12:34:56.000Z"
    );
    expect(value.endOf("second").toISOString()).toBe(
      "2026-02-20T12:34:56.999Z"
    );

    expect(value.startOf("days").toISOString()).toBe(
      "2026-02-20T00:00:00.000Z"
    );
    expect(value.endOf("months").toISOString()).toBe(
      "2026-02-28T23:59:59.999Z"
    );
  });

  it("stays immutable", () => {
    const value = asUtc("2026-02-20T12:34:56.789Z");
    const next = value.startOf("day");

    expect(next.toISOString()).toBe("2026-02-20T00:00:00.000Z");
    expect(value.toISOString()).toBe("2026-02-20T12:34:56.789Z");
    expect(value.startOf("millisecond")).toBe(value);
    expect(value.endOf("millisecond")).toBe(value);
  });

  it("keeps time zone on DST days", () => {
    const ny = Waktos.from("2026-03-08T16:30:00Z").zone("America/New_York");

    expect(ny.startOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")).toBe(
      "2026-03-08 00:00:00.000 -05:00"
    );
    expect(ny.endOf("day").format("YYYY-MM-DD HH:mm:ss.SSS Z")).toBe(
      "2026-03-08 23:59:59.999 -04:00"
    );
  });

  it("rejects invalid units", () => {
    const value = asUtc("2026-02-20T12:34:56.789Z");

    expect(() => value.startOf("week" as never)).toThrow(RangeError);
    expect(() => value.endOf("quarter" as never)).toThrow(RangeError);
  });
});
