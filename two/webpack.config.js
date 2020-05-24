const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { spawn } = require('child_process')

const isDev = process.env.NODE_ENV === 'development'
const pathResolve = (...v) => path.resolve(__dirname, ...v)
const fs = require('fs')
const {name, version} = JSON.parse(fs.readFileSync('./package.json'))

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: isDev ? ['./webpack/entry.js', 'webpack-hot-middleware/client'] : './webpack/entry.js', // If webpack-hot-middleware isn't exist, HMR will not work.
  output: {
    path: pathResolve('dist'),
    publicPath: '/',
    filename: isDev ? '[name].js' : 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
            },
          },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(js|jsx)$/,
        include: [
          path.join(__dirname, 'node_modules', '@hashsnap'),
          path.resolve('src'),
        ],
        use: {
          loader: 'babel-loader'
        },
      },
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader'
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 0,
              name: 'assets/[hash].[ext]'
            },
          },
        ],
      },
    ],
  },
  devtool: isDev ? 'inline-source-map' : false,
  target: 'web',
  plugins: [
    new CleanWebpackPlugin({ default: ['dist'] }),
    new HtmlWebpackPlugin({ template: 'public/index.html' }),
    new MiniCssExtractPlugin({
      filename: 'assets/[name].[hash].css',
      chunkFilename: 'assets/[id].[hash].css',
    }),
    new webpack.ProvidePlugin({
      $: [pathResolve('providers/query-selector.js'), '$'],
      $$: [pathResolve('providers/query-selector.js'), '$$'],
      isDev: [pathResolve('providers/is-dev.js'), 'default'],
      isElectron: [pathResolve('providers/is-electron.js'), 'default'],
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProgressPlugin(),
  ],
  resolve: {
    extensions: ['.js'],
    alias: {
      '~': pathResolve('src'),
      // components: pathResolve('src/components'),
      // modules: pathResolve('src/modules'),
      // reducers: path.resolve(__dirname, 'src/reducers'),
    },
  },
  optimization: {
    minimize: !isDev,
    minimizer: isDev ? [] : [
      new TerserPlugin({
        terserOptions: {
          compress: {drop_console: true}, // removed comments also.
        }
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
}
