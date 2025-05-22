import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['esm'],
  entry: ['src/index.ts'],
  target: 'ES2020',
  outDir: 'dist',
  dts: true,
  clean: true,
  minify: true,
  splitting: true,
  treeshake: true,
  esbuildOptions(options) {
    options.charset = 'utf8';
  },
});
