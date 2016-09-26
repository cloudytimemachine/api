var Queue = require('bull');
var async = require('async');
var urls = require('./urls');

var redisHost = process.env.REDIS_SERVICE_HOST || '127.0.0.1';

var api = module.exports = {};

var shotQueue;
var responseQueue;

api.start = function () {
  shotQueue = Queue('webshot request', 6379, redisHost);
  responseQueue = Queue('webshot finished', 6379, redisHost);

  shotQueue.process(1, function (job, done) {
    console.log('queue request to process ', job.data.url);

    var results = urls[job.data.url];
    done(null, results);
  });
};

api.stop = function (callback) {
  async.parallel([
    function (cb) {
      if (shotQueue) {
        return shotQueue.close().then(cb);
      }
      return cb();
    },
    function (cb) {
      if (responseQueue) {
        return responseQueue.close().then(cb);
      }
      return cb();
    }
  ], function () {
    shotQueue = null;
    responseQueue = null;
    return callback();
  });
};
