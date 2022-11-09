/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        mocha: true,
    },
    extends: ['airbnb', 'plugin:node/recommended', 'plugin:prettier/recommended'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: 'babel-eslint',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: ['node', 'prettier'],
    rules: {
        'prettier/prettier': 'off',
        'spaced-comment': ['error', 'always', { exceptions: ['*'] }],
        indent: ['error', 4],
        'max-depth': ['warn', 5],
        complexity: [
            'warn',
            {
                max: 8,
            },
        ],
        'max-len': ['warn', 120],
        'max-params': ['warn', 7],
        'max-lines-per-function': ['warn', 120],
        'node/no-unsupported-features/es-syntax': 'off',
        'no-shadow': 'off',
        'no-unused-expressions': 0,
        'prefer-promise-reject-errors': 'off'
    },
};
