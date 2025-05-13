import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['esm'],
  entry: ['src/index.ts'],
  target: 'es2017',
  outDir: 'dist',
  dts: true,
  clean: true,
  minify: true,
  splitting: true,
  treeshake: true,
});
