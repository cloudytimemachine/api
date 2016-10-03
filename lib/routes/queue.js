var express = require('express');
var queue = require('../queue');

var router = module.exports = express.Router();

router.get('/', function (req, res) {
  queue.requestQueueCount(function (err, queueLength) {
    if (err) {
      res.statusCode = 500;
      return res.end(new Error('Error getting queue length'));
    }
    res.json({ queueLength: queueLength });
  });
});
