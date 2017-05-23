module.exports = {
  parser: 'sugarss',
  plugins: {
    'postcss-import': {},
    'postcss-cssnext': {},
  },
  env: {
    production: {
      cssnano: { autoprefixer: false },
    },
  },
}
