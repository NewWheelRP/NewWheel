const CracoEsbuildPlugin = require('craco-esbuild');
const path = require('path');

module.exports = {
  plugins: [
    {
      plugin: CracoEsbuildPlugin,
      options: {
        esbuildLoaderOptions: {
          // Optional.
          loader: 'tsx',
          target: 'es2021'
        },
        esbuildMinimizerOptions: {
          // Optional.
          target: 'es2021',
          css: true, // if true, OptimizeCssAssetsWebpackPlugin will also be replaced by esbuild.
        },
        skipEsbuildJest: false, // Optional. Set to true if you want to use babel for jest tests,
        esbuildJestOptions: {
          loaders: {
            '.ts': 'ts',
            '.tsx': 'tsx',
          },
        },
      },
    },
  ],
  webpack: {
    configure: (webpackConfig) => {
      // Because CEF has issues with loading source maps properly atm,
      // lets use the best we can get in line with `eval-source-map`
      if (webpackConfig.mode === 'development' && process.env.IN_GAME_DEV) {
        webpackConfig.devtool = 'eval-source-map'
        webpackConfig.output.path = path.join(__dirname, 'build')
      }

      return webpackConfig
    }
  },

  devServer: (devServerConfig) => {
    if (process.env.IN_GAME_DEV) {
      // Used for in-game dev mode
      devServerConfig.devMiddleware.writeToDisk = true
    }

    return devServerConfig
  }
};