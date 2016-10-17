var config = require('./config.global');

config.bunyan.streams = [
  {
    level: process.env.LOG_LEVEL || 'error',
    stream: process.stderr
  }
];

config.rethinkdb.db = 'wayback_test';

config.bunyan.src = true;

module.exports = config;
