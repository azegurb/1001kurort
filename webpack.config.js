var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  devtool: 'cheap-module-eval-source-map',
    
  entry: [
    'webpack-hot-middleware/client',
    'babel-polyfill',
    './client/index',
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },

  plugins: [  
    //new BundleAnalyzerPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NormalModuleReplacementPlugin(
      /Bundles.js/,
      './AsyncBundles.js'
    ),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),    
  ],

  module: {

    loaders: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        include: [
          path.resolve(__dirname, 'client'),
        ],
        loader: "eslint-loader",
      },
      {
        test: /\.js$/,        
        include: [
          path.resolve(__dirname, 'client'),
        ],
        loaders: ['react-hot-loader', 'babel-loader'],     
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.json$/, loader: 'json-loader' }
    ],

  },
}