// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const checkFile = require('eslint-plugin-check-file');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

// Flat config = an ordered array of config objects.
// Order matters: a later object overrides an earlier one.
// Each object says which files it targets (`files`, omit = all) and which rules it (de)activates (`rules`).
module.exports = defineConfig([
  // Expo's preset — bundles ESLint recommended, TypeScript, React Hooks, React Native and import rules.
  // It does NOT enable type-checked rules (no parserOptions.project), so everything stays fast.
  // The blocks below reuse the plugins it brings (import, typescript-eslint), so they need no `plugins` key.
  expoConfig,

  // — File naming  ─────
  // e.g. `user-card.tsx` ✓   `UserCard.tsx` ✗
  {
    files: ['src/**/*.{ts,tsx}'],
    // skip expo-router routes (filenames are route conventions: [id].tsx, +not-found.tsx, _layout.tsx)
    // and any `_`-prefixed private/convention file.
    ignores: ['src/app/**', 'src/**/_*.{ts,tsx}'],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        { '**/*.{ts,tsx}': 'KEBAB_CASE' },
        // ignore the role suffix (.store / .type / …) — only the base name is checked
        { ignoreMiddleExtensions: true },
      ],
    },
  },

  // ─── Symbol naming ─────────────────────────────
  // Conservative on purpose: only high-signal selectors, so it does not flood on external object
  // shapes / API fields. 'warn' so it guides without blocking the build.
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'warn',
        // class / interface / type / enum / generic
        { selector: 'typeLike', format: ['PascalCase'] },
        // module-level const
        {
          selector: 'variable',
          modifiers: ['const', 'global'],
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        // PascalCase allowed so React components (`UserCard`) pass alongside plain helpers (`formatDate`)
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
      ],
    },
  },

  // ──— Import order ──────────────────────────────
  // 'warn' (not 'error') so it is auto-fixable guidance and never blocks the lint gate.
  // Groups are separated by a blank line and sorted A→Z within each group:
  //   import { useState } from 'react';              // external
  //   import { Button } from '@/components/...';     // internal (see pathGroups)
  //   import { styles } from './styles';             // parent/sibling/index
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          // `@/**` is our path alias — mark it internal so it isn't treated as external.
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  // Turns off every formatting rule that conflicts with Prettier, handing formatting to Prettier.
  // Placed it last so it can override the above.
  prettierRecommended,

  // Paths ESLint never looks at (object with only `ignores` = global ignore).
  {
    ignores: ['dist/*'],
  },
]);
