const path = require('path');
var fs = require("fs");
var webpack = require("webpack");
var UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const PATHS = {
  dashboards: path.join(__dirname, 'dashboards'),
  build: path.join(__dirname, 'build'),
  jobs: path.join(__dirname, 'jobs'),
  widgets: path.join(__dirname, 'widgets'),
  styles: path.join(__dirname, 'styles'),
  rgl: path.join(__dirname, 'node_modules/react-grid-layout/css'),
  rrsz: path.join(__dirname, 'node_modules/react-resizable/css'),
  animate: path.join(__dirname, 'node_modules/animate.css/')
};

// grab all dashboards
var dashboardPaths = fs.readdirSync(PATHS.dashboards).reduce(function(map, filename) {
  map[path.basename(filename, '.jsx')] = path.join(PATHS.dashboards, filename);
  return map;
}, {});

var webConfig = {
  node: { fs: 'empty' },
  entry: dashboardPaths,
  target: 'web',
  output: { path: PATHS.build, filename: '[name].dashboard.bundle.js'},
  module: {
     rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
        // Enable caching for improved performance during development
        // It uses default OS directory by default. If you need something
        // more custom, pass a path to it. I.e., babel?cacheDirectory=<path>
          options: {cacheDirectory: true}
        },
        include: [PATHS.dashboards, PATHS.widgets],
      },
      {
        test: /\.(scss|css|min\.css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        include: [PATHS.styles, PATHS.widgets, PATHS.rgl, PATHS.rrsz, PATHS.animate]
      },
      // { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: {
          loader: "url-loader?limit=10000&mimetype=application/font-woff",
          options: { name: '[path][name].[ext]', publicPath: 'assets/' }
        }
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: {
          loader: "file-loader"
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({name: 'commons', filename: 'common.bundle.js'}),
    new webpack.EnvironmentPlugin({"NODE_ENV": 'production'}),
    new UglifyJsPlugin({
      sourceMap: false,
      uglifyOptions: {
        ecma:8,
        compress: {
          warnings: false
        }
      }
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.scss'],
    modules: [
      path.resolve(__dirname),
      'node_modules'
    ]
  }
};

module.exports = webConfig
