module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['prettier', 'standard-with-typescript'],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json']
  },
  rules: {
  }
}