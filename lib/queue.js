var Queue = require('bull');
var db = require('./db');
var config = require('./config');
var redisHost = config.redis.host;
var redisPort = config.redis.port;
var api = module.exports = {};

api.name = 'queue';

var async = require('async');

var shotQueue, responseQueue;
var log;

api.init = function (app, callback) {
  log = app.log.child({module: api.name});

  var ready = false;
  function onReady () {
    if (ready) {
      return callback();
    }
    ready = true;
  }

  shotQueue = Queue(config.bull.requestQueue, redisPort, redisHost);
  shotQueue.once('ready', onReady);
  shotQueue.on('error', function onShotQueueErr (err) {
    log.error({
      err: err
    }, 'Error in shotQueue');
  });

  responseQueue = Queue(config.bull.responseQueue, redisPort, redisHost);
  responseQueue.once('ready', onReady);

  responseQueue.on('error', function onResponseQueueErr (err) {
    log.error({
      err: err
    }, 'Error in responseQueue');
  });

  responseQueue.process(10, api._onResponseQueueMsg);
};

api._onResponseQueueMsg = function _onResponseQueueMsg (job, done) {
  var data = job.data;
  log.info({
    data: data
  }, 'Results from screenshot queue');
  if (!data.id) {
    return done();
  }
  db.updateSnapshot(data, function (err) {
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

// TODO: Do we want to pass the new additional data along the way
api.queue = function queue (request) {
  log.info(request, 'Queing request to process');
  shotQueue.add(request);
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
