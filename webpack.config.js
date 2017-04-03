var path = require('path');

module.exports = {
  entry: './runnerboy/game.js',
  output: {
    filename: 'runnerboy-bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    modules: ['node_modules']
  }
};
