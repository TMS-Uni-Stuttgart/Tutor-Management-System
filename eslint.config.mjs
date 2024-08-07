import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import _import from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['node_modules'],
  },
  ...fixupConfigRules(
    compat.extends(
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/typescript',
      'plugin:prettier/recommended'
    )
  ),
  {
    plugins: {
      react: fixupPluginRules(react),
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: 'module',
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          args: 'none',
        },
      ],

      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          classes: true,
          variables: true,
          typedefs: true,
        },
      ],

      '@typescript-eslint/interface-name-prefix': 'off',

      '@typescript-eslint/explicit-module-boundary-types': [
        'warn',
        {
          allowedNames: ['renderLink'],
        },
      ],

      'constructor-super': 'error',
      'no-console': 'error',
      'no-fallthrough': 'error',
      'no-useless-rename': 'warn',

      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './client',
              from: './server/src',
            },
          ],
        },
      ],

      'import/no-unresolved': 'off',
      'import/no-named-as-default': 'off',

      'import/no-unused-modules': [
        'off',
        {
          unusedExports: true,
        },
      ],

      'react/display-name': 'off',

      'react/jsx-no-duplicate-props': [
        'warn',
        {
          ignoreCase: false,
        },
      ],

      'react/prop-types': [0],
      'prettier/prettier': 'warn',
    },
  },
];
