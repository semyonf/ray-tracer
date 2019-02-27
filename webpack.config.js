const path = require('path')

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'bundle.js'
  },
  devServer: {
    port: 9831,
    disableHostCheck: true,
    contentBase: './debug',
    watchContentBase: true,
    noInfo: false,
    overlay: true
  },
  devtool: '#source-map'
}
