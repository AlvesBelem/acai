import js from '@eslint/js'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const typescript = (await import('@typescript-eslint/eslint-plugin')).default
const tsParser = (await import('@typescript-eslint/parser')).default
const react = (await import('eslint-plugin-react')).default
const reactHooks = (await import('eslint-plugin-react-hooks')).default

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended,

  // 🧠 Ambiente Node.js para libs que usam process, db, fs, etc
  {
    files: ['src/lib/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        process: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {},
  },

  // 🧠 TypeScript (geral)
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

  // 🧠 React e React Hooks
  {
    files: ['**/*.tsx'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      globals: {
        React: 'readonly',
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
    },
  },

  // 🧹 Ignorar arquivos gerados
  {
    ignores: ['.next/**', 'build/**', 'out/**', 'next-env.d.ts'],
  },
]
