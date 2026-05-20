const parser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const prettierPlugin = require('eslint-plugin-prettier');
const unusedImports = require('eslint-plugin-unused-imports');
const importPlugin = require('eslint-plugin-import');

module.exports = [
    {
        ignores: [
            '.now/**',
            '**/*.css',
            '.changeset/**',
            'dist/**',
            'esm/**',
            'public/**',
            'tests/**',
            'scripts/**',
            '*.config.js',
            '.DS_Store',
            'node_modules/**',
            'coverage/**',
            '.next/**',
            'build/**',
        ],
    },
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            parser,
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
            globals: {
                // standard globals
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            'jsx-a11y': jsxA11yPlugin,
            prettier: prettierPlugin,
            'unused-imports': unusedImports,
            import: importPlugin,
        },
        rules: {
            'react/prop-types': 'off',
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/self-closing-comp': 'warn',
            'react/jsx-sort-props': [
                'warn',
                { callbacksLast: true, shorthandFirst: true, noSortAlphabetically: false, reservedFirst: true },
            ],

            'react-hooks/exhaustive-deps': 'off',

            'jsx-a11y/click-events-have-key-events': 'warn',
            'jsx-a11y/interactive-supports-focus': 'warn',

            'prettier/prettier': ['warn', { tabWidth: 4 }],

            'no-unused-vars': 'off',
            'unused-imports/no-unused-imports': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { args: 'after-used', ignoreRestSiblings: false, argsIgnorePattern: '^_.*?$' },
            ],

            'import/order': [
                'warn',
                {
                    groups: ['type', 'builtin', 'object', 'external', 'internal', 'parent', 'sibling', 'index'],
                    pathGroups: [{ pattern: '~/**', group: 'external', position: 'after' }],
                    'newlines-between': 'always',
                },
            ],
        },
    },
];
