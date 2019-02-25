module.exports = {
  'root': true,
  'env': {
    'browser': true,
    'es6': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'no-console': [
      'warn'
    ],
    'arrow-parens': [
      'error',
      'as-needed'
    ],
    'max-len': [
      'warn',
      {
        'code': 80,
        'comments': 65,
        'ignoreUrls': true
      }
    ],
    'max-lines': [
      'warn',
      200
    ],
    'max-lines-per-function': [
      'warn', {
        'max': 35,
        'skipComments': true
      }
    ],
    'no-multiple-empty-lines': [
      'error',
      {
        'max': 1,
        'maxBOF': 0,
        'maxEOF': 1
      }
    ],
    'eol-last': [
      'error',
      'always'
    ]
  }
}
