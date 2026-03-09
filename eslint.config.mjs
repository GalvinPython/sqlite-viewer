import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import importPlugin from "eslint-plugin-import";
import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";

export default tseslint.config(
    {
        ignores: [
            ".now/**",
            "**/*.css",
            ".changeset/**",
            "dist/**",
            "esm/**",
            "public/**",
            "tests/**",
            "scripts/**",
            "*.config.js",
            ".DS_Store",
            "node_modules/**",
            "coverage/**",
            ".next/**",
            "build/**",
        ],
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        plugins: {
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
            "jsx-a11y": jsxA11yPlugin,
            prettier: prettierPlugin,
            "unused-imports": unusedImportsPlugin,
            import: importPlugin,
            "@next/next": nextPlugin,
        },
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.es2021,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: 2021,
                sourceType: "module",
            },
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs["core-web-vitals"].rules,

            // React
            "react/prop-types": "off",
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
            "react/self-closing-comp": "warn",
            "react/jsx-sort-props": [
                "warn",
                {
                    callbacksLast: true,
                    shorthandFirst: true,
                    noSortAlphabetically: false,
                    reservedFirst: true,
                },
            ],

            // React Hooks
            "react-hooks/exhaustive-deps": "off",

            // Accessibility
            "jsx-a11y/click-events-have-key-events": "warn",
            "jsx-a11y/interactive-supports-focus": "warn",

            // Prettier
            "prettier/prettier": ["warn", { tabWidth: 4 }],

            // Unused vars/imports
            "no-unused-vars": "off",
            "unused-imports/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "warn",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    args: "after-used",
                    ignoreRestSiblings: false,
                    argsIgnorePattern: "^_.*?$",
                },
            ],

            // Import ordering
            "import/order": [
                "warn",
                {
                    groups: [
                        "type",
                        "builtin",
                        "object",
                        "external",
                        "internal",
                        "parent",
                        "sibling",
                        "index",
                    ],
                    pathGroups: [
                        {
                            pattern: "~/**",
                            group: "external",
                            position: "after",
                        },
                    ],
                    "newlines-between": "always",
                },
            ],

            // Padding lines
            "padding-line-between-statements": [
                "warn",
                { blankLine: "always", prev: "*", next: "return" },
                {
                    blankLine: "always",
                    prev: ["const", "let", "var"],
                    next: "*",
                },
                {
                    blankLine: "any",
                    prev: ["const", "let", "var"],
                    next: ["const", "let", "var"],
                },
            ],
        },
    },
    // Must be last — disables formatting rules that conflict with Prettier
    eslintConfigPrettier,
);
