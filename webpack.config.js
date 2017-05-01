const path = require('path');

module.exports = {
  entry: {
    runnerboy: './games/runnerboy/game.js',
    catchstar: './games/catch-stars/catch-stars.js'
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    modules: ['node_modules']
  }
};
