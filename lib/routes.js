var express = require('express');
var queue = require('./queue');
var router = express.Router();
var queue = require('./queue');
var async = require('async');
var db = require('./db');

module.exports = router;
var pkginfo = require('pkginfo')(module);

router.get('/version', function getVersion (req, res) {
  res.send(module.exports.version);
});

router.get('/healthz', function healthz (req, res) {
  // TODO: Wire up to whether Rethinkdb is up and running
  res.send();
});

router.get('/', function(req, res) {
  res.send(module.exports.version);
});

router.get('/api/capture/:captureID', function(req, res) {
  var params = req.params;
  var capture;
  async.parallel([
    function getCapture(callback) {
      db.getCapture({ id: params['captureID'] }, function(err, cap) {
        capture = cap;
        return callback(err);
      });
    }
  ], function(err) {
  if (err) {
    res.statusCode = 500;
    return res.end('oops');
  }
  res.json({ capture });
  })
});

router.get('/api/captures', function(req, res) {
  var captures;
  async.parallel([
    function getCaptures(callback) {
      db.getCaptures({}, function (err, cap) {
        captures = cap;
        return callback(err);
      });
    }
  ], function(err) {
  if (err) {
    res.statusCode = 500;
    return res.end('Oops');
  }
  res.json({ captures });
  })
});

router.get('/api/queue', function(req, res) {
  var queueLength;
  async.parallel([
    function getQueueLen(callback) {
      queue.requestQueueCount(function (err, count) {
        queueLength = count;
        return callback(err);
      });
    }
  ], function(err) {
  if (err) {
    res.statusCode = 500;
    return res.end('Oops');
  }
  res.json({ queueLength });
  })
});

router.post('/api/captures', function(req, res) {
  console.log('request to send some data', req.body);

  if (req.body.url) {
    queue.queue(req.body.url);
  }
  return res.json({
    url: req.body.url
  });
});

router.post('/', function(req, res) {
  // Need to do some verification of this data
  console.log('request to send some data', req.body);

  if (req.body.url) {
    queue.queue(req.body.url);
  }

  return res.json({
    url: req.body.url
  });
});
