module.exports = {
  plugins: ['standard'],
  env: {
    es6: true,
    node: true,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['./src/ts.js'],
    },
    {
      files: ['*.js', '*.jsx'],
      extends: ['./src/js.js'],
    },
  ],
}
