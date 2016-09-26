var config = module.exports = {};
require('pkginfo')(module);
var os = require('os');
var bunyan = require('bunyan');

config.modules = [
  'db',
  'queue',
  'healthz'
];

config.redis = {
  host: process.env.REDIS_SERVICE_HOST || '127.0.0.1',
  port: process.env.REDIS_SERVICE_PORT || 6379
};

config.rethinkdb = {
  host: process.env.RETHINKDB_PROXY_SERVICE_HOST || process.env.RETHINKDB_SERVICE_HOST || 'localhost',
  port: process.env.RETHINKDB_PROXY_SERVICE_PORT || process.env.RETHINKDB_SERVICE_POST || 28015,
  db: 'wayback',
  table: 'snapshots',
  silent: true,
  cursor: true
};

config.info = {
  version: module.exports.version,
  name: module.exports.name,
  instance: os.hostname()
};

config.port = process.env.PORT || 3001;
config.healthPort = config.port + 1;

config.bunyan = {
  name: config.info.name,
  streams: [
    {
      level: process.env.LOG_LEVEL || 'info',
      stream: process.stdout
    }
  ],
  serializers: bunyan.stdSerializers,
  src: true
};
