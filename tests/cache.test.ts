import { describe, expect, it } from "vitest";
import { Cache } from "../src/cache";

describe("cache", () => {
  it("rejects invalid capacity", () => {
    expect(() => new Cache<string, number>(0)).toThrow(RangeError);
    expect(() => new Cache<string, number>(-1)).toThrow(RangeError);
    expect(() => new Cache<string, number>(1.5)).toThrow(RangeError);
  });

  it("evicts oldest entry at limit", () => {
    const cache = new Cache<string, number>(2);

    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);

    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe(2);
    expect(cache.get("c")).toBe(3);
  });

  it("marks entries as recently used", () => {
    const cache = new Cache<string, number>(2);

    cache.set("a", 1);
    cache.set("b", 2);

    expect(cache.get("a")).toBe(1);

    cache.set("c", 3);

    expect(cache.get("a")).toBe(1);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBe(3);
  });

  it("updates keys and refreshes order", () => {
    const cache = new Cache<string, number>(2);

    cache.set("a", 1);
    cache.set("b", 2);

    cache.set("a", 100);

    cache.set("c", 3);

    expect(cache.get("a")).toBe(100);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBe(3);
  });

  it("works with capacity 1", () => {
    const cache = new Cache<string, number>(1);

    cache.set("a", 1);
    expect(cache.get("a")).toBe(1);

    cache.set("b", 2);
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe(2);
  });

  it("keeps cached undefined values", () => {
    const cache = new Cache<string, number | undefined>(2);

    cache.set("a", undefined);
    cache.set("b", 2);

    expect(cache.get("a")).toBeUndefined();

    cache.set("c", 3);

    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBe(3);
  });
});
