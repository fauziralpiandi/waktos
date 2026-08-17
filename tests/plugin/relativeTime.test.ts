import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import Waktos from "../../src";
import relativeTime from "../../src/plugin/relativeTime";
import { asUtc } from "../helpers";

describe("relative time", () => {
  beforeAll(() => {
    Waktos.extend(relativeTime);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows day differences both ways", () => {
    const earlier = asUtc("2026-02-20T00:00:00.000Z");
    const later = asUtc("2026-02-22T00:00:00.000Z");

    expect(later.from(earlier)).toBe("in 2 days");
    expect(earlier.from(later)).toBe("2 days ago");
  });

  it("rounds short differences toward zero", () => {
    const base = asUtc("2026-02-20T00:00:00.000Z");

    expect(asUtc("2026-02-20T01:59:59.000Z").from(base)).toBe("in 1 hour");
    expect(asUtc("2026-02-20T00:01:59.000Z").from(base)).toBe("in 1 minute");
    expect(asUtc("2026-02-19T23:59:10.000Z").from(base)).toBe("50 seconds ago");
  });

  it("uses fake time for fromNow", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-20T00:00:00.000Z"));

    const future = asUtc("2026-02-22T00:00:00.000Z");

    expect(future.fromNow()).toBe("in 2 days");
  });
});
