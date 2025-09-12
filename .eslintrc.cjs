module.exports = {
  extends: ['airbnb-base'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true,
  },
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['public/', 'node_modules/', '__tests__/', 'test/', 'mobile/', '*.html'],
  rules: {
    quotes: ['error', 'double'],
    semi: ['error', 'always'],
    'linebreak-style': 0,
    'no-console': 0,
  },
};
