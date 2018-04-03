const path = require('path')
const ora = require('ora')
const rm = require('rimraf')
const chalk = require('chalk')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const rootPath = path.resolve(__dirname)

const config = {
  mode: 'production',
  entry: {
    app: path.resolve(rootPath, 'src', 'index.js')
  },
  output: {
    filename: 'colorPicker.js',
    path: path.resolve(rootPath, 'dist'),
    library: {
      root: "ColorPicker",
      amd: "ColorPicker",
      commonjs: "ColorPicker"
    },
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [path.resolve(rootPath, 'src')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new UglifyJsPlugin({
      uglifyOptions: {
        ie8: true
      }
    })
  ]
}

new Promise(() => {
  // 构建全量压缩包
  let building = ora('building...')
  building.start()
  rm(path.resolve(rootPath, 'dist'), err => {
    if (err) throw (err)
    webpack(config, function (err, stats) {
      if (err) throw (err)
      building.stop()
      process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
      }) + '\n\n')
      console.log(chalk.cyan('  Build complete.\n'))
    })
  })
})