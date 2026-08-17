import { describe, expect, it } from "vitest";
import Waktos from "../src";
import * as runtimeExports from "../src";

describe("exports", () => {
  it("exposes as default export", () => {
    expect(Waktos).toBeTypeOf("function");
  });

  it("keeps runtime exports simple", () => {
    expect(Object.keys(runtimeExports)).toEqual(["default"]);
    expect((runtimeExports as Record<string, unknown>).Waktos).toBeUndefined();
  });
});
