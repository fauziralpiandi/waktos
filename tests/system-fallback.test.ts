import { afterEach, describe, expect, it, vi } from "vitest";

const DTF_ORIG = Intl.DateTimeFormat;

function breakDtf(): typeof Intl.DateTimeFormat {
  const broken = function DateTimeFormat() {
    throw new Error("Broken");
  };
  return broken as unknown as typeof Intl.DateTimeFormat;
}

describe("system fallback", () => {
  afterEach(() => {
    Object.defineProperty(Intl, "DateTimeFormat", {
      value: DTF_ORIG
    });
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("uses fallback when Intl fails", async () => {
    Object.defineProperty(Intl, "DateTimeFormat", {
      value: breakDtf()
    });

    vi.resetModules();
    const module = await import("../src");
    const context = module.default.now().context();

    expect(context.locale).toBe("en-US");
    expect(context.zone).toBe("UTC");
  });
});
