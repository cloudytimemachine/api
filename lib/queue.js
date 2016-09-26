var Queue = require('bull');
var db = require('./db');
var redisHost = process.env.REDIS_SERVICE_HOST || '127.0.0.1';
var api = module.exports = {};

api.name = 'queue';

var async = require('async');

var shotQueue, responseQueue;
var log;

api.init = function (app, callback) {
  log = app.log.child({module: api.name});
  shotQueue = Queue('webshot request', 6379, redisHost);
  responseQueue = Queue('webshot finished', 6379, redisHost);

  responseQueue.process(10, function onSuccess (job, done) {
    log.info({
      data: job.data
    }, 'Screenshot was successful');
    db.writeCapture(job.data, function (err) {
      if (err) {
        log.info({
          err: err,
          data: job.data
        }, 'Error inserting job data into db');
      } else {
        log.info({
          data: job.data
        }, 'Job data inserted into db');
      }
      return done();
    });
  });

  return callback();
};

api.close = function close (callback) {
  async.parallel([
    function (cb) {
      if (shotQueue) {
        log.info('closing shotQueue');
        return shotQueue.close().then(cb);
      }
      return cb();
    },
    function (cb) {
      if (responseQueue) {
        log.info('closing responseQueue');
        return responseQueue.close().then(cb);
      }
      return cb();
    }
  ], function () {
    log.info('queues have been closed');
    shotQueue = null;
    responseQueue = null;
    return callback();
  });
};

api.queue = function queue (url) {
  log.info({
    url: url
  }, 'Queing request to process');
  shotQueue.add({url: url});
};

api.requestQueueCount = function requestQueueCount (callback) {
  shotQueue.count().then(function (results) {
    log.info({
      results: results
    }, 'current requestQueueCount');
    return callback(null, results);
  }).catch(function (err) {
    log.error({
      err: err
    }, 'Error getting the current requestQueueCount');
    return callback(err);
  });
};
