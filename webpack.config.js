const path = require('path')

const mode = process.env.NODE_ENV || 'production'

module.exports = {
  entry: './src/main',
  devtool: mode == 'development' ? 'inline-source-map' : false,
  mode,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    path: path.resolve(__dirname, './public'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    port: 9831,
    disableHostCheck: true,
    contentBase: './public',
    watchContentBase: true,
    noInfo: false,
    overlay: true
  }
}
