import webpack from 'webpack';
import precss from 'precss'
import autoprefixer from 'autoprefixer'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'

import * as Remove from '../utils/remove'
import ManifestPlugin from '../manifest/plugin'

// NOTE: Style preprocessors
// If you want to use any of style preprocessor, add related npm package + loader and uncomment following line
const styleLoaders = {
  'css': 'postcss-loader',
  'less': 'less-loader',
  'scss|sass': 'sass-loader'
};

function makeStyleLoaders() {
  return Object.keys(styleLoaders).map(function(ext) {
    // TODO: Autoprefixer just for webkit. You can guess why :D
    var prefix = 'css-loader?sourceMap&root=../assets'
    var loader = 'style-loader!' + prefix + '!' + styleLoaders[ext];;

    return {
      test: new RegExp('\\.(' + ext + ')$'),
      loader: loader
    };
  });
}


// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = function(Manifest) {
  return {
    // This makes the bundle appear split into separate modules in the devtools.
    // We don't use source maps here because they can be confusing:
    // https://github.com/facebookincubator/create-react-app/issues/343#issuecomment-237241875
    // You may want 'cheap-module-source-map' instead if you prefer source maps.
    devtool: 'eval',
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    // The first two entry points enable "hot" CSS and auto-refreshes for JS.
    entry: {},
    output: {
      path: Manifest.buildPath,
      filename: '[name].js',
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: 'https://localhost:3001/'
    },

    resolve: {
      root: [
        Manifest.src
      ],
      // These are the reasonable defaults supported by the Node ecosystem.
      // We also include JSX as a common component filename extension to support
      // some tools, although we do not recommend using it, see:
      // https://github.com/facebookincubator/create-react-app/issues/290
      extensions: ['.js', '.json', '.jsx', ''],
      alias: {
        // Support React Native Web
        // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
        'react-native': 'react-native-web'
      }
    },


    module: {

      loaders: [
        ...makeStyleLoaders(),

        {
          test: /\.(js|jsx)?$/,
          loader: 'babel-loader',
          query: {
            babelrc: false,
            cacheDirectory: true,
            plugins: [ "transform-decorators-legacy" ],
            presets: [ "react", "es2015", "es2016", "es2017", "stage-0" ]
          }
        },

        // JSON is not enabled by default in Webpack but both Node and Browserify
        // allow it implicitly so we also enable it.
        {
          test: /\.json$/,
          loader: 'json'
        },

        {
          test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)/,
          loader: "url-loader?limit=1000000&name=[name]-[hash].[ext]"
        }
      ]
    },

    // We use PostCSS for autoprefixing only.
    postcss: function() {
      return [
        autoprefixer({
          browsers: [
            'last 10 Chrome versions'
          ]
        }),
      ];
    },

    plugins: [
      new ManifestPlugin(Manifest),
      new webpack.DefinePlugin({
        "global.GENTLY": false,
        "process.env.APP_ENV": JSON.stringify(process.env.APP_ENV),
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        "process.env.IS_BROWSER": JSON.stringify(process.env.IS_BROWSER)
      }),
      // This is necessary to emit hot updates (currently CSS only):
      new webpack.HotModuleReplacementPlugin(),
      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      // See https://github.com/facebookincubator/create-react-app/issues/240
      new CaseSensitivePathsPlugin()
    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }
  }
}
