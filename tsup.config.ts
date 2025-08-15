import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/locale/*.ts', 'src/plugin/*.ts'],
  format: ['esm', 'cjs'],
  target: 'ES2021',
  outDir: 'dist',
  bundle: true,
  clean: true,
  dts: true,
  minify: true,
  sourcemap: false, // dev
  splitting: false,
  treeshake: true,
  esbuildOptions(options) {
    options.supported = {
      'dynamic-import': true,
    };
  },
});
