import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
  ...nextVitals,

  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
    }
  }
]);
