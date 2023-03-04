module.exports = {
  "env": {
    "es2021": true,
    "node": true
  },
  "extends": [
    'airbnb',
    'airbnb-typescript/base'
  ],
  "overrides": [
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.test.json"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
  }
}
