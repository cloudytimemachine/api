var express = require('express');
var snapshots = require('../snapshots');

var router = module.exports = express.Router();

router.post('/', function (req, res, next) {
  // Need to do some better verification of this data
  if (!req.body || !req.body.requestedUrl) {
    var error = new Error('Invalid snapshot request');
    error.status = 400;
    return next(error);
  }
  var requestedUrl = req.body.requestedUrl;
  snapshots.createSnapshot(requestedUrl, function (err, snapshot) {
    if (err) {
      return next(err);
    }
    return res.json(snapshot);
  });
});

router.get('/:snapshotId', function (req, res) {
  var id = req.params.snapshotId;
  req.log.info({
    id: id
  }, 'Request to get a snapshot');
  snapshots.getSnapshot(id, function (err, snapshot) {
    if (err) {
      res.statusCode = 500;
      req.log.error({
        err: err,
        id: id
      }, 'Error requesting a snapshot');
      return res.end('oops');
    }
    res.json(snapshot);
  });
});

router.get('/', function (req, res) {
  req.log.info('Request to get all snapshots');
  snapshots.getSnapshots({}, function onGetSnapshots (err, snapshots) {
    if (err) {
      req.log.error({
        err: err
      }, 'Error getting all snapshots');
      res.statusCode = 500;
      return res.end('Oops');
    }
    res.json(snapshots);
  });
});
//
// router.get('/api/queue', function (req, res) {
//   var queueLength;
//   async.parallel([
//     function getQueueLen (callback) {
//       queue.requestQueueCount(function (err, count) {
//         queueLength = count;
//         return callback(err);
//       });
//     }
//   ], function (err) {
//     if (err) {
//       res.statusCode = 500;
//       return res.end('Oops');
//     }
//     res.json({ queueLength });
//   });
// });
//
// router.post('/api/captures', function (req, res) {
//   console.log('request to send some data', req.body);
//
//   if (req.body.url) {
//     queue.queue(req.body.url);
//   }
//   return res.json({
//     url: req.body.url
//   });
// });
