import { describe, expect, it } from "vitest";
import Waktos, { type DateInput } from "../src";

describe("parse input", () => {
  it("parses ISO strings with offsets", () => {
    expect(Waktos.from("2005-04-26T03:04:05Z").valueOf()).toBe(
      Date.parse("2005-04-26T03:04:05Z")
    );
    expect(Waktos.from("2005-04-26T03:04:05.1Z").valueOf()).toBe(
      Date.parse("2005-04-26T03:04:05.100Z")
    );
    expect(Waktos.from("2005-04-26T03:04:05.12Z").valueOf()).toBe(
      Date.parse("2005-04-26T03:04:05.120Z")
    );
    expect(Waktos.from("2005-04-26T03:04:05.123Z").valueOf()).toBe(
      Date.parse("2005-04-26T03:04:05.123Z")
    );
    expect(Waktos.from("2005-04-26T03:04:05.123+07:30").valueOf()).toBe(
      Date.parse("2005-04-25T19:34:05.123Z")
    );
    expect(Waktos.from("2005-04-26T03:04:05.123-0230").valueOf()).toBe(
      Date.parse("2005-04-26T05:34:05.123Z")
    );
    expect(Waktos.from(" 2005-04-26T03:04:05Z ").valueOf()).toBe(
      Date.parse("2005-04-26T03:04:05Z")
    );
  });

  it("parses local date-time strings", () => {
    const expected = new Date(2005, 3, 26, 3, 4, 5, 6).getTime();
    expect(Waktos.from("2005-04-26T03:04:05.006").valueOf()).toBe(expected);
  });

  it("accepts numbers and Date", () => {
    expect(Waktos.from(123_456).valueOf()).toBe(123_456);
    expect(
      Waktos.from(new Date("2005-04-26T03:04:05.006Z").valueOf()).valueOf()
    ).toBe(1_114_484_645_006);
  });

  it("rejects timestamps outside the native Date range", () => {
    const maxTimestamp = 8.64e15;

    expect(Waktos.isValid(maxTimestamp)).toBe(true);
    expect(Waktos.isValid(maxTimestamp + 1)).toBe(false);
    expect(Waktos.isValid(-maxTimestamp - 1)).toBe(false);
    expect(() => Waktos.from(maxTimestamp + 1)).toThrow(RangeError);
    expect(() => Waktos.from(maxTimestamp).add({ millisecond: 1 })).toThrow(
      RangeError
    );
  });

  it("rejects bad strings", () => {
    expect(() => Waktos.from("")).toThrow(TypeError);
    expect(() => Waktos.from("   ")).toThrow(TypeError);

    const invalid = [
      "2005-00-26T00:00:00Z",
      "2005-04-00T00:00:00Z",
      "2005-04-26T24:00:00Z",
      "2005-04-26T23:60:00Z",
      "2005-04-26T23:00:60Z",
      "2005-04-26T23:00:00+24:00",
      "2005-04-26T23:00:00+00:60",
      "2024-02-30",
      "garbage"
    ];

    for (const value of invalid) {
      expect(() => Waktos.from(value)).toThrow(RangeError);
    }
  });

  it("rejects bad non-string input", () => {
    expect(() => Waktos.from(null as unknown as DateInput)).toThrow(TypeError);
    expect(() => Waktos.from(undefined as unknown as DateInput)).toThrow(
      TypeError
    );
    expect(() => Waktos.from(Number.NaN)).toThrow(RangeError);
    expect(() => Waktos.from(new Date("invalid"))).toThrow(RangeError);
    expect(() =>
      Waktos.from({
        valueOf: () => 7_654_321
      } as unknown as DateInput)
    ).toThrow(TypeError);
    expect(() =>
      Waktos.from({
        valueOf: () => Number.NaN
      } as unknown as DateInput)
    ).toThrow(TypeError);
  });
});

describe("parse input edge cases", () => {
  it("parses valid values", () => {
    expect(Waktos.from(42).valueOf()).toBe(42);
    expect(Waktos.from("2005-04-26T03:04:05Z").valueOf()).toBe(
      Date.parse("2005-04-26T03:04:05Z")
    );
  });

  it("rejects object input", () => {
    expect(() =>
      Waktos.from({
        valueOf: () => 42
      } as unknown as DateInput)
    ).toThrow(TypeError);
  });
});
