// eslint.config.mjs

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import next from 'eslint-config-next';

const config = [
  js.configs.recommended,
  ...next,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
  {
    ignores: [
      'node_modules/',
      '.next/',
      'dist/',
      'out/',
      'build/',
      'coverage/',
      'public/',
    ],
  },
];

export default config;
