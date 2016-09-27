var express = require('express');
var queue = require('../queue');

var router = module.exports = express.Router();

router.get('/', function (req, res) {
  queue.requestQueueCount(function (err, count) {
    queueLength = count;
    if (err) {
      res.statusCode = 500;
      return res.end(J);
    }
    res.json({ queueLength });
  });
});
