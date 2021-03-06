module.exports = {
  parser: 'babel-eslint',
  extends: [
    'airbnb',
    'plugin:flowtype/recommended',
  ],
  plugins: [
    'flowtype',
  ],
  env: {
    browser: true,
    node: true,
  },
  rules: {
    semi: ['error', 'never'],
    'no-unexpected-multiline': 'error',
    'no-nested-ternary': 0,
    'space-unary-ops': ['error', {
      words: true,
      nonwords: false,
      overrides: {
        '!': true,
      },
    }],
    'no-unused-vars': [
      'error', {
        argsIgnorePattern: '^_$',
      },
    ],
    'no-console': 'warn',
    'react/prop-types': 0,
    'react/sort-comp': ['error', {
      order: [
        'type-annotations',
        'static-methods',
        'lifecycle',
        '/^on.+$/',
        '/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/',
        'everything-else',
        '/^render.+$/',
        'render',
      ],
    }],
  },
}
