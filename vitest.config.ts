import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'waktos',
    environment: 'node',
    include: ['**/*.test.ts'],
    globals: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
        minForks: 1,
        maxForks: 4,
      },
    },
    benchmark: {
      include: ['**/*.bench.ts'],
    },
  },
});
