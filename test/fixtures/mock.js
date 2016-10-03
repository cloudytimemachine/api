var Queue = require('bull');
var async = require('async');
var urls = require('./urls');
var _ = require('lodash');
var config = require('../../lib/config');

var redisHost = config.redis.host;
var redisPort = config.redis.port;
var reqQueueName = config.bull.requestQueue;
var resQueueName = config.bull.responseQueue;

var api = module.exports = {};

var shotQueue;
var responseQueue;

api.start = function (callback) {
  var ready = false;
  function onReady () {
    if (ready) {
      return callback();
    }
    ready = true;
  }

  shotQueue = Queue(reqQueueName, redisPort, redisHost);
  shotQueue.once('ready', onReady);
  responseQueue = Queue(resQueueName, redisPort, redisHost);
  responseQueue.once('ready', onReady);

  shotQueue.process(1, function (job, done) {
    var data = job.data;

    var results = _.clone(urls[data.requestedUrl]);
    if (!results) {
      responseQueue.add({
        id: data.id,
        status: 'FAILED',
        error: 'Unable to snapshot url'
      });
      return done(new Error('Unable to process'));
    }
    results.id = data.id;
    results.status = 'SUCCESSFUL';
    responseQueue.add(results);
    return done();
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
