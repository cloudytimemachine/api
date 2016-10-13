var config = require('./config.global');

config.bunyan.streams = [
  {
    level: process.env.LOG_LEVEL || 'error',
    stream: process.stderr
  }
];

config.rethinkdb = {
  host: process.env.RETHINKDB_PROXY_SERVICE_HOST || process.env.RETHINKDB_SERVICE_HOST || 'localhost',
  port: process.env.RETHINKDB_PROXY_SERVICE_PORT || process.env.RETHINKDB_SERVICE_POST || 28015,
  db: 'wayback_test',
  table: 'snapshots',
  silent: true
};

config.bunyan.src = true;

module.exports = config;
