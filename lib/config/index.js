var config = module.exports = {};
require('pkginfo')(module);
var os = require('os');
var bunyan = require('bunyan');

config.modules = [
  'db',
  'queue'
];

config.redis = {
  host: process.env.REDIS_SERVICE_HOST || '127.0.0.1',
  port: process.env.REDIS_SERVICE_PORT || 6379
};

config.rethinkdb = {
  conn: {
    host: process.env.RETHINKDB_PROXY_SERVICE_HOST || process.env.RETHINKDB_SERVICE_HOST || 'localhost',
    port: process.env.RETHINKDB_PROXY_SERVICE_PORT || process.env.RETHINKDB_SERVICE_POST || 28015
  },
  db: 'wayback',
  table: 'snapshots',
  silent: true
};

config.info = {
  version: module.exports.version,
  name: module.exports.name,
  instance: os.hostname()
};

config.port = process.env.PORT || 3001;

config.modules = [
  'db',
  'queue'
];

// Whether or not to send pretified JSON via REST
config.jsonSpacing = 2;

config.serverOpts = {
  name: config.info.name,
  version: config.info.version,
  acceptable: ['application/json'],
  formatters: {
    'application/json': function formatFoo (req, res, body, cb) {
      if (body instanceof Error) {
        // snoop for RestError or HttpError, but don't rely on
        // instanceof
        res.statusCode = body.statusCode || 500;

        if (body.body) {
          body = body.body;
        } else {
          body = {
            message: body.message
          };
        }
      } else if (Buffer.isBuffer(body)) {
        body = body.toString('base64');
      }

      var data = JSON.stringify(body, null, config.jsonSpacing);

      res.setHeader('Content-Length', Buffer.byteLength(data));

      return cb(null, data);
    }
  }
};

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
