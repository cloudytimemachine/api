var Queue = require('bull');
var db = require('./db');
var redisHost = process.env.REDIS_SERVICE_HOST || '127.0.0.1';
var api = module.exports = {};

api.name = 'queue';

var async = require('async');

var shotQueue, responseQueue;

api.init = function (app, callback) {
  shotQueue = Queue('webshot request', 6379, redisHost);
  responseQueue = Queue('webshot finished', 6379, redisHost);

  responseQueue.process(10, function onSuccess (job, done) {
    console.log('Screenshot was successful', job.data);
    db.writeCapture(job.data, function (err) {
      if (err) {
        console.log('Error inserting job data into db', err, job.data);
      } else {
        console.log('Job data inserted into db', job.data);
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
        console.log('closing shotQueue');
        return shotQueue.close().then(cb);
      }
      return cb();
    },
    function (cb) {
      if (responseQueue) {
        console.log('closing responseQueue');
        return responseQueue.close().then(cb);
      }
      return cb();
    }
  ], function () {
    console.log('queues have been closed');
    shotQueue = null;
    responseQueue = null;
    return callback();
  });
};

api.queue = function queue (url) {
  console.log('Queing request to process', url);
  shotQueue.add({url: url});
};

api.requestQueueCount = function requestQueueCount (callback) {
  shotQueue.count().then(function (results) {
    console.log(results);
    return callback(null, results);
  }).catch(function (err) {
    console.error(err);
    return callback(err);
  });
};
