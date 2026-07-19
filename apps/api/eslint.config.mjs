import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import checkFile from 'eslint-plugin-check-file';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';

// Flat config = an ordered array of config objects. 
// Order matters: a later object overrides an earlier one. 
// Each object says which files it targets (`files`, omit = all) and which rules it (de)activates (`rules`).
export default defineConfig(
  // Baseline JS rules from the ESLint team. Everything below builds on top of this.
  eslint.configs.recommended,

  // TS rules that DO need type info. Stronger but slower.
  // Requires the `parserOptions.project` option set in the next block.
  tseslint.configs.recommendedTypeChecked,

  // Feeds tsconfig.json to the parser so the type-checked rules above can read types.
  // import.meta.dirname is the directory of folder that contains the eslint.config.mjs file.
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // — File naming  ─────
  // e.g. `create-car.request.dto.ts` ✓   `createCar.dto.ts` ✗
  {
    files: ['src/**/*.ts'],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        { '**/*.ts': 'KEBAB_CASE' },
        // ignore the role suffix (.request.dto / .guard / …) — only the base name is checked
        { ignoreMiddleExtensions: true },
      ],
    },
  },

  // ──— Import order ──────────────────────────────
  // 'warn' (not 'error') so it is auto-fixable guidance and never blocks `start:dev`'s lint gate.
  // Groups are separated by a blank line and sorted A→Z within each group:
  //   import { join } from 'path';                  // builtin
  //   import { Injectable } from '@nestjs/common';  // external
  //   import { BOOKING_STATUS } from 'src/...';     // internal (see pathGroups)
  //   import { helper } from './helper';            // parent/sibling/index
  {
    files: ['src/**/*.ts'],
    plugins: { import: importPlugin },
    rules: {
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [{ pattern: 'src/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  // ─── Symbol naming ─────────────────────────────
  // Conservative on purpose: only high-signal selectors, so it does not flood on external object
  // shapes / DTO fields. 'warn' so it guides without blocking the build.
  {
    files: ['src/**/*.ts'],
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
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'classMethod', format: ['camelCase'] },
      ],
    },
  },

  // Turns off every formatting rule that conflicts with Prettier, handing formatting to Prettier. 
  // Placed it last so it can override the above.
  eslintConfigPrettier,

  // Paths ESLint never looks at
  globalIgnores(['node_modules', 'dist', 'eslint.config.mjs', 'src/prisma/generated']),
);
