module.exports = {
  extends: ['airbnb-base', 'plugin:node/recommended', 'prettier'],
  eslintConfig: {
    parserOptions: {
      parser: 'babel-eslint',
      sourceType: 'module',
      allowImportExportEverywhere: true,
      ecmaVersion: 2015,
    },
  },
}
