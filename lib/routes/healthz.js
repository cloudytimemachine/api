var config = require('../config');
var db = require('../db');

module.exports = function healthz (req, res) {
  var response = config.info;

  var message = 'OK';
  var statusCode = 200;
  if (db.status !== 'HEALTHY') {
    message = 'Disconnected from database';
    statusCode = 500;
  }

  response.message = message;
  response.db = db.status;
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response));
};
