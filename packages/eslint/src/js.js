module.exports = {
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'standard'],
  rules: {
    'max-len': [
      'error',
      {
        code: 100,
        tabWidth: 2,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'comma-dangle': ['error', 'always-multiline'],
  },
}
