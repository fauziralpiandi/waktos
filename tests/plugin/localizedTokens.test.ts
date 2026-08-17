import { beforeAll, describe, expect, it } from "vitest";
import Waktos from "../../src";
import localizedTokens from "../../src/plugin/localizedTokens";
import { asUtc } from "../helpers";

describe("localized tokens", () => {
  beforeAll(() => {
    Waktos.extend(localizedTokens);
  });

  it("renders month and weekday names", () => {
    const value = asUtc("2005-04-26T15:04:05.000Z");

    expect(value.format("MMMM")).toBe("April");
    expect(value.format("MMM")).toBe("Apr");
    expect(value.format("dddd")).toBe("Tuesday");
    expect(value.format("ddd")).toBe("Tue");
  });

  it("renders day period and time zone names", () => {
    const value = asUtc("2005-04-26T15:04:05.000Z");

    expect(value.format("A")).toBe("PM");
    expect(value.format("a")).toBe("pm");
    expect(value.format("B")).not.toBe("B");
    expect(value.format("b")).not.toBe("b");
    expect(value.format("z")).not.toBe("z");
    expect(value.format("zz")).not.toBe("zz");
  });

  it("keeps escaped tokens as-is", () => {
    const value = asUtc("2005-04-26T15:04:05.000Z");
    expect(value.format("[MMMM] MMMM")).toBe("MMMM April");
  });
});
