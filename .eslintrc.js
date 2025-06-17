module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
    'build/',
    'node_modules/',
    '*.js.map',
    '*.d.ts.map',
  ],
};