const path = require('path');

module.exports = {
  entry: {
    cubesroad: './games/cubes-road/game.js',
    runnerboy: './games/runnerboy/game.js',
    catchstar: './games/catch-stars/catch-stars.js',
    'network-test': './games/network-example/network-test.js'
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    modules: ['node_modules']
  }
};
