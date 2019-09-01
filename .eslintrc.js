module.exports = {
  root: true,
  env: {
    commonjs: true,
    es6: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  plugins: ['prettierx'],
  extends: [
    'eslint:recommended',
    'plugin:prettierx/standardx'
  ]
}
