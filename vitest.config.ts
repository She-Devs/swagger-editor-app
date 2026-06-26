import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({  resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/tests/setup.ts',

  coverage: {
    provider: 'v8',
    include: ['src/**/*.{ts,tsx}'],
    exclude: [
      'src/**/*.test.{ts,tsx}',
      'src/**/*.spec.{ts,tsx}',
      'src/**/*.d.ts',
    ],

    thresholds: {
      statements: 80,
      branches: 50,
      functions: 50,
      lines: 50,
    },
  },
},
});
