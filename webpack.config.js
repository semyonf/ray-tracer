const path = require('path')

module.exports = {
  entry: './src/main',
  devtool: 'inline-source-map',
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
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
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
