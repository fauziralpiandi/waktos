import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cjsPath = resolve(rootDir, "dist/index.cjs");
const esmPath = resolve(rootDir, "dist/index.mjs");

describe("dist imports", () => {
  beforeAll(() => {
    if (existsSync(cjsPath) && existsSync(esmPath)) return;
    execSync("pnpm exec tsup", { cwd: rootDir, stdio: "pipe" });
  });

  it("works with require()", () => {
    const requireFn: (id: string) => unknown = createRequire(import.meta.url);
    const mod = requireFn(cjsPath);

    expect(typeof mod).toBe("function");
    expect(typeof (mod as { now?: unknown }).now).toBe("function");
  });

  it("works with import()", async () => {
    const mod = (await import(pathToFileURL(esmPath).href)) as {
      default?: unknown;
    };
    const defaultExport = mod.default;

    expect(typeof defaultExport).toBe("function");
    expect(typeof (defaultExport as { now?: unknown }).now).toBe("function");
  });
});
