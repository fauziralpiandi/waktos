import { beforeAll, describe, expect, it } from "vitest";
import Waktos from "../../src";
import ordinalFormat from "../../src/plugin/ordinalFormat";
import { asUtc } from "../helpers";

describe("ordinal format", () => {
  beforeAll(() => {
    Waktos.extend(ordinalFormat);
    Waktos.ordinal("en-US", (n) => {
      const value = n % 100;
      return `${String(n)}${
        value >= 11 && value <= 13
          ? "th"
          : (["th", "st", "nd", "rd"][n % 10] ?? "th")
      }`;
    });
  });

  it("renders ordinal day and month tokens", () => {
    expect(asUtc("2026-01-01T00:00:00.000Z").format("Do")).toBe("1st");
    expect(asUtc("2026-01-02T00:00:00.000Z").format("Do")).toBe("2nd");
    expect(asUtc("2026-01-03T00:00:00.000Z").format("Do")).toBe("3rd");
    expect(asUtc("2026-01-04T00:00:00.000Z").format("Do")).toBe("4th");
    expect(asUtc("2026-11-01T00:00:00.000Z").format("Mo")).toBe("11th");
  });

  it("falls back to language for regional locale", () => {
    const value = asUtc("2026-01-21T00:00:00.000Z").locale("en-US");
    expect(value.format("Do")).toBe("21st");
  });

  it("keeps unknown ordinal tokens unchanged", () => {
    expect(asUtc("2005-04-26T00:00:00.000Z").format("fo")).toBe("fo");
  });

  it("keeps escaped ordinal text", () => {
    expect(asUtc("2026-01-01T00:00:00.000Z").format("[Do] Do")).toBe("Do 1st");
  });

  it("rejects non-function handlers", () => {
    expect(() =>
      Waktos.ordinal(
        "en-US",
        "not-a-function" as unknown as (value: number) => string
      )
    ).toThrow(TypeError);
  });
});
