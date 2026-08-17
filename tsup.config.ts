import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/plugin/*.ts"],
  format: ["cjs", "esm"],
  target: "es2020",
  dts: true,
  clean: true,
  minify: true,
  // sourcemap: true,
  splitting: false,
  treeshake: true,
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".mjs" };
  }
});
