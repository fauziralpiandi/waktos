import { describe, expect, it } from "vitest";
import Waktos from "../src";
import { asUtc } from "./helpers";

describe("formatting", () => {
  it("formats basic tokens", () => {
    const value = asUtc("2005-04-26T03:04:05.006Z");

    expect(value.format("YYYY YY Q MM M DD D HH H hh h mm m ss s SSS")).toBe(
      "2005 05 2 04 4 26 26 03 3 03 3 04 4 05 5 006"
    );
    expect(value.format("X x [x] Z ZZ")).toBe(
      "1114484645 1114484645006 x +00:00 +0000"
    );
  });

  it("keeps escaped text intact", () => {
    const value = asUtc("2005-04-26T03:04:05.006Z");
    expect(value.format("[YYYY] YYYY [at] HH:mm")).toBe("YYYY 2005 at 03:04");
  });

  it("shows non-utc offsets", () => {
    const value = Waktos.from("2005-04-26T03:04:05.006Z").zone("Asia/Jakarta");

    expect(value.format("Z ZZ")).toBe("+07:00 +0700");
  });

  it("rejects bad patterns", () => {
    const value = asUtc("2005-04-26T03:04:05.006Z");
    expect(() => value.format("" as string)).toThrow(TypeError);
    expect(() => value.format(undefined as unknown as string)).toThrow(
      TypeError
    );
  });
});
