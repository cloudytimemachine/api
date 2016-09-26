var config = require('./config');
var http = require('http');
var db = require('./db');
require('http-shutdown').extend();

var api = module.exports = {};
var log;

api.name = 'healthz';

var requestHandler = function(req, res) {
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

api.init = function init (app, callback) {
  log = app.log.child({module: api.name});
  api.server = http.createServer(requestHandler).withShutdown();
  log.info('Initializing /healthz endpoint');
  return api.server.listen(config.healthPort, callback);
};

api.close = function close(callback) {
  api.server.shutdown(callback);
}
