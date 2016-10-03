var config = require('./config');
var routes = require('./routes');
var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var path = require('path');
var bunyan = require('bunyan');
var log = bunyan.createLogger(config.bunyan);
require('http-shutdown').extend();

var api = module.exports = {};

api.start = function start (callback) {
  var app = api.app = express();
  app.exit = api.start; // Make this available to subclasses on error
  app.log = log;
  app.use(require('express-bunyan-logger')(config.bunyan));
  app.use(bodyParser.json());

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    req.log.error({
      err: err
    }, 'Error responding to request');
    res.status();
    res.json(err.status || 500, {
      message: err.message,
      error: {}
    });
  });

  routes(app);

  async.forEachSeries(config.modules, function eachMod (mod, cb) {
    mod = path.join(__dirname, '/', mod);
    log.info({
      mod: mod
    }, 'loading module');
    mod = require(mod);
    mod.init(app, function moduleLoaded (err) {
      if (!err) {
        log.info({
          moduleName: mod.name
        }, 'loaded module');
      }
      cb(err);
    });
  }, function (err) {
    if (err) {
      return callback(err);
    }
    api.server = app.listen(config.port, function () {
      var host = api.server.address().address;
      var port = api.port = api.server.address().port;
      log.info({
        host: host,
        port: port
      }, 'App is now listening for incoming http requests');
      return callback(null);
    }).withShutdown();
  });
};

api.stop = function stop (callback) {
  log.info('Stopping application server');

  if (api.server) {
    api.server.shutdown(function onShutdown () {
      log.info('HTTP server stopped');
      api.server = null;
      api.app = null;

      async.forEachSeries(config.modules, function eachMod (mod, cb) {
        mod = path.join(__dirname, '/', mod);
        log.info({
          mod: mod
        }, 'unloading module');
        mod = require(mod);
        mod.close(function moduleUnloaded () {
          log.info({
            moduleName: mod.name
          }, 'closed module');
          cb();
        });
      }, callback);
    });
  }
};
