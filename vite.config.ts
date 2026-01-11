import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import glob from 'fast-glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const entries = glob
  .sync(['src/index.ts', 'src/locale/*.ts', 'src/plugin/*.ts'])
  .reduce((acc, file) => {
    const name = path.relative('src', file).replace(/\.ts$/, '');
    acc[name] = path.resolve(__dirname, file);
    return acc;
  }, {});

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      outDir: 'dist',
      staticImport: true,
      insertTypesEntry: true,
    }),
  ],
  build: {
    target: 'es2021',
    outDir: 'dist',
    emptyOutDir: true,
    minify: true,
    lib: {
      entry: entries,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          dir: 'dist',
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          chunkFileNames: 'chunks/[name]-[hash].cjs',
          dir: 'dist',
        },
      ],
      external: (id) => id.includes('node_modules'),
    },
    sourcemap: false,
  },
});
