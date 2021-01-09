const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const PATHS = {
  entryPoint: path.resolve(__dirname, 'src/tridi.ts'),
  dist: path.resolve(__dirname, 'dist/js'),
};

module.exports = {
  mode: 'production', // suppress warning
  entry: {
    tridi: PATHS.entryPoint,
    'tridi.min': PATHS.entryPoint,
  },
  output: {
    path: PATHS.dist,
    filename: '[name].js',
    library: 'Tridi',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'awesome-typescript-loader',
      exclude: /node_modules/,
    }],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js$/,
        parallel: true,
        terserOptions: {
          format: {
            comments: /License/i,
          },
          parse: {},
          compress: {},
          mangle: {
            toplevel: true,
          },
          output: null,
          toplevel: false,
          nameCache: null,
        },
      }),
    ],
  },
};
