import js from '@eslint/js'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Correção: importar os plugins corretamente com `.default`
const typescript = (await import('@typescript-eslint/eslint-plugin')).default
const tsParser = (await import('@typescript-eslint/parser')).default
const react = (await import('eslint-plugin-react')).default
const reactHooks = (await import('eslint-plugin-react-hooks')).default

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended,

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
    },
  },

  {
    files: ['**/*.jsx', '**/*.tsx'],
    languageOptions: {
      globals: {
        React: 'readonly',
      },
    },
    plugins: {
      react: react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
    },
  },

  {
    ignores: ['.next/**', 'build/**', 'out/**', 'next-env.d.ts'],
  },
]
