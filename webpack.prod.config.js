const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  
  devtool: 'source-map',
  
  entry: [
    'babel-polyfill',
    './client/index',
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },

  plugins: [
    new UglifyJsPlugin({
      uglifyOptions: {
        warnings: false,
        compress: {
          warnings: false,
          drop_console: true,
        },
        output: {
          comments: false,
          beautify: false,
        },
        toplevel: false,
        nameCache: null,
        ie8: false,
        keep_classnames: undefined,
        keep_fnames: false,
        safari10: false,
      }
    }),
    new webpack.NormalModuleReplacementPlugin(
      /Bundles.js/,
      './AsyncBundles.js'
    ),
    new webpack.NoEmitOnErrorsPlugin(),    
  ],

  module: {

    loaders: [
      {
        test: /\.js$/,        
        include: [
          path.resolve(__dirname, 'client'),
        ],
        loaders: ['babel-loader'],
      },
      { test: /\.css$/,  loader: 'style-loader!css-loader' },      
      { test: /\.json$/, loader: 'json-loader' }

    ],

  },
}