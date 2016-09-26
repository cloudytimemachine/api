var config = require('./config.global');

config.bunyan.streams = [
  {
    level: process.env.LOG_LEVEL || 'error',
    stream: process.stderr
  }
];
config.bunyan.src = true;

module.exports = config;
