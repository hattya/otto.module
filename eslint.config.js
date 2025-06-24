const { defineConfig } = require('eslint/config');
const js = require('@eslint/js');
const globals = require('globals');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([{
  extends: compat.extends('eslint:recommended', 'airbnb-base'),
  languageOptions: {
    sourceType: 'script',
  },
}, {
  files: ['lib/**/*.js'],
  rules: {
    // Best Practices
    'no-else-return': 'off',
    'no-eval': 'off',
    'no-param-reassign': 'off',
    'no-unused-expressions': 'warn',
    'vars-on-top': 'off',
    'yoda': 'off',

    // Strict Mode
    'strict': ['error', 'global'],

    // Stylistic Issues
    'max-len': 'off',
    'no-mixed-operators': 'off',
    'no-multi-assign': 'off',
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
    'space-before-function-paren': ['error', 'never'],

    // ECMAScript 6
    'no-var': 'off',
    'object-shorthand': 'off',
    'prefer-destructuring': 'off',
    'prefer-rest-params': 'off',
    'prefer-template': 'off',

    // plugin: import
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
}, {
  files: ['test/**/*.js'],
  languageOptions: {
    globals: { ...globals.jest },
  },
}]);
