import { beforeAll, describe, expect, it } from "vitest";
import Waktos from "../../src";
import range from "../../src/plugin/range";
import { asUtc } from "../helpers";

describe("range", () => {
  beforeAll(() => {
    Waktos.extend(range);
  });

  it("isBetween includes edges by default", () => {
    const value = asUtc("2026-02-20T00:00:00.000Z");

    expect(
      value.isBetween("2026-02-20T00:00:00.000Z", "2026-02-21T00:00:00.000Z")
    ).toBe(true);
    expect(
      value.isBetween("2026-02-19T00:00:00.000Z", "2026-02-20T00:00:00.000Z")
    ).toBe(true);
  });

  it("supports modes and reversed bounds", () => {
    const value = asUtc("2026-02-20T00:00:00.000Z");

    expect(
      value.isBetween(
        "2026-02-20T00:00:00.000Z",
        "2026-02-21T00:00:00.000Z",
        "()"
      )
    ).toBe(false);
    expect(
      value.isBetween(
        "2026-02-20T00:00:00.000Z",
        "2026-02-21T00:00:00.000Z",
        "[)"
      )
    ).toBe(true);
    expect(
      value.isBetween(
        "2026-02-21T00:00:00.000Z",
        "2026-02-20T00:00:00.000Z",
        "[)"
      )
    ).toBe(false);
  });

  it("clamps values and keeps locale/zone", () => {
    const value = asUtc("2026-02-20T12:00:00.000Z")
      .locale("id-ID")
      .zone("Asia/Jakarta");

    const min = asUtc("2026-02-20T13:00:00.000Z");
    const max = asUtc("2026-02-20T15:00:00.000Z");

    const clamped = value.clamp(min, max);
    expect(clamped.toISOString()).toBe("2026-02-20T13:00:00.000Z");
    expect(clamped.context()).toEqual({
      locale: "id-ID",
      zone: "Asia/Jakarta"
    });

    const inside = asUtc("2026-02-20T14:00:00.000Z");
    expect(inside.clamp(min, max)).toBe(inside);
  });

  it("overlaps includes touching edges", () => {
    const leftStart = asUtc("2026-02-20T10:00:00.000Z");
    const leftEnd = asUtc("2026-02-20T20:00:00.000Z");
    const rightStart = asUtc("2026-02-20T20:00:00.000Z");
    const rightEnd = asUtc("2026-02-21T00:00:00.000Z");

    expect(leftStart.overlaps(leftEnd, rightStart, rightEnd)).toBe(true);
    expect(leftStart.overlaps(leftEnd, rightStart, rightEnd, "[)")).toBe(false);
    expect(leftStart.overlaps(leftEnd, rightStart, rightEnd, "(]")).toBe(false);
    expect(leftStart.overlaps(leftEnd, rightStart, rightEnd, "()")).toBe(false);
  });

  it("supports reversed and zero-length ranges", () => {
    const point = asUtc("2026-02-20T20:00:00.000Z");
    const around = asUtc("2026-02-20T19:00:00.000Z");
    const aroundEnd = asUtc("2026-02-20T21:00:00.000Z");

    expect(
      asUtc("2026-02-20T20:00:00.000Z").overlaps(
        "2026-02-20T10:00:00.000Z",
        "2026-02-20T20:00:00.000Z",
        "2026-02-21T00:00:00.000Z",
        "[)"
      )
    ).toBe(true);

    expect(point.overlaps(point, around, aroundEnd, "[]")).toBe(true);
    expect(point.overlaps(point, around, aroundEnd, "()")).toBe(false);
  });

  it("rejects bad mode and bad clamp range", () => {
    const value = asUtc("2026-02-20T00:00:00.000Z");

    expect(() =>
      value.isBetween(
        "2026-02-20T00:00:00.000Z",
        "2026-02-21T00:00:00.000Z",
        "??" as never
      )
    ).toThrow(RangeError);

    expect(() =>
      value.clamp("2026-02-21T00:00:00.000Z", "2026-02-20T00:00:00.000Z")
    ).toThrow(RangeError);

    expect(() =>
      value.overlaps(
        "2026-02-20T01:00:00.000Z",
        "2026-02-20T02:00:00.000Z",
        "2026-02-20T03:00:00.000Z",
        "??" as never
      )
    ).toThrow(RangeError);
  });
});
