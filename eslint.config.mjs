import js from '@eslint/js';
import globals from 'globals';
import nextVitals from 'eslint-config-next/core-web-vitals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const config = [
  {
    ignores: [
      '.next/**',
      '.next_backup_*/**',
      '.firebase/**',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'firebase-debug.log',
      '*.min.js',
    ],
  },
  ...nextVitals,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-useless-catch': 'off',
    },
  },
];

export default config;