module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
    },
    env: {
        browser: true,
        node: true,
        es2021: true,
    },
    ignorePatterns: [
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
    plugins: [
        '@typescript-eslint',
        'react',
        'react-hooks',
        'jsx-a11y',
        'prettier',
        'unused-imports',
        'import',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:react-hooks/recommended',
        'prettier',
    ],
    settings: {
        react: { version: 'detect' },
    },
    rules: {
        // Next/React
        'react/prop-types': 'off',
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/self-closing-comp': 'warn',

        // Hooks
        'react-hooks/exhaustive-deps': 'off',

        // Accessibility
        'jsx-a11y/click-events-have-key-events': 'warn',
        'jsx-a11y/interactive-supports-focus': 'warn',

        // Prettier
        'prettier/prettier': ['warn', { tabWidth: 4 }],

        // Unused imports/vars
        'no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'warn',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { args: 'after-used', ignoreRestSiblings: false, argsIgnorePattern: '^_.*?$' },
        ],

        // Import ordering
        'import/order': [
            'warn',
            {
                groups: [
                    'type',
                    'builtin',
                    'object',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index',
                ],
                pathGroups: [
                    { pattern: '~/**', group: 'external', position: 'after' },
                ],
                'newlines-between': 'always',
            },
        ],
    },
};
