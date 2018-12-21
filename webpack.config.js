const webpack = require('webpack')
const webpackNodeExternals = require('webpack-node-externals')
const path = require('path')

const version = require('./package.json').version

const config = {
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  externals: {
    'chart.js': 'Chart'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015'],
      }
    }]
  },
  plugins: [
    new webpack.ProvidePlugin({
      Chart: 'chart.js'
    }),
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true,
      compress: {
        warnings: false
      }
    })
  ]
}

const dist = Object.assign({}, config, {
  entry: {
    'chartjs-plugin-timeline': './src/index.js',
    'chartjs-plugin-timeline.min': './src/index.js'
  },
  output: {
    path: './dist',
    filename: '[name].js'
  }
})

module.exports = [
  dist
]
