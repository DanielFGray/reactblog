/* eslint-disable import/no-extraneous-dependencies,global-require */

const fs = require('fs')
const path = require('path')
const { map } = require('ramda')
const { DefinePlugin } = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const yaml = require('js-yaml')

const nodeEnv = process.env.NODE_ENV || 'development'
const devMode = nodeEnv.startsWith('dev')
const appMountId = 'root'

const config = yaml.safeLoad(fs.readFileSync('config.yaml', 'utf8'))

const outputDir = path.resolve(path.join(__dirname, config.outputDir))

const constants = {
  __MOUNT: config.appMountId,
  __DEV: devMode,
  __APPBASE: config.appBase,
}

const rules = [
  {
    test: /node_modules[\\/].*\.css$/,
    use: [
      devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
      'css-loader',
    ],
  },
  {
    exclude: /node_modules/,
    test: /\.(s|c)ss$/,
    use: [
      devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          modules: true,
        },
      },
      'postcss-loader',
    ],
  },
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      },
    ],
  },
]

const plugins = {
  extract: new MiniCssExtractPlugin({
    filename: '[name].[hash].css',
  }),
  html: new HtmlWebpackPlugin({
    template: 'src/html.ejs',
    inject: false,
    title: '[insert title]',
    appMountId,
    appBase: config.appBase.endsWith('/') ? config.appBase : `${config.appBase}/`,
    mobile: true,
  }),
}

const stats = {
  chunks: false,
  modules: false,
  colors: true,
  children: false,
}

const clientConfig = {
  mode: nodeEnv,
  entry: { main: './src/index' },
  target: 'web',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    filename: '[name].[hash].js',
    path: outputDir,
  },
  module: {
    rules,
  },
  plugins: [
    plugins.extract,
    plugins.html,
    new DefinePlugin(map(JSON.stringify, constants)),
  ],
  stats,
}

module.exports = [clientConfig]
