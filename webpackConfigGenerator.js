const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BabiliPlugin = require('babili-webpack-plugin');

module.exports = function generateConfig(type) {
  const configurations =  [
    {
      entry: './src/content_script.js',
      output: {
        path: path.resolve(__dirname, `./build/${type}/`),
        filename: 'content_script.js'
      },
      plugins: [
        new CopyWebpackPlugin([
          { from: 'icons', to: 'icons' },
          { from: 'popup', to: 'popup' },
          { from: 'options', to: 'options' },
          {
            from:
              type === 'firefox' ? 'manifest.firefox.json' : 'manifest.json',
            to: 'manifest.json'
          }
        ])
      ]
    }
  ];
  if (process.env.NODE_ENV === 'production') {
    configurations.forEach(config => {
      // http://vue-loader.vuejs.org/en/workflow/production.html
      config.plugins = (config.plugins || []).concat([
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: '"production"'
          }
        }),
        new BabiliPlugin(),
        new webpack.LoaderOptionsPlugin({
          minimize: true
        })
      ]);
    });
  }
  return configurations;
};
