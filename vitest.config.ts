import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'waktos',
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    benchmark: {
      include: ['**/*.bench.ts'],
    },
  },
});
