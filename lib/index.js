var config = require('./config');
var routes = require('./routes');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var async = require('async');
var path = require('path');

var api = module.exports = {};

api.start = function start (callback) {
  var app = api.app = express();
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(function (error, request, response, next) {
    response.status(error.status || 500);
    response.json({ error: error.message });
  });

  app.use(routes);

  async.forEachSeries(config.modules, function eachMod (mod, cb) {
    mod = path.join(__dirname, '/', mod);
    console.log('loading module: ', mod);
    mod = require(mod);
    mod.init(app, function moduleLoaded (err) {
      if (!err) {
        console.log('loaded module: ', mod.name);
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
      console.log('App is listening on http://%s:%s', host, port);
      return callback(null);
    });
  });
};

api.stop = function stop (callback) {
  console.log('Stopping application server');

  api.server.close(function () {
    console.log('HTTP server stopped');
    api.server = null;
    api.app = null;

    async.forEachSeries(config.modules, function eachMod (mod, cb) {
      mod = path.join(__dirname, '/', mod);
      console.log('unloading module: ', mod);
      mod = require(mod);
      mod.close(function moduleUnloaded () {
        console.log('closed module: ', mod.name);
        cb();
      });
    }, callback);
  });
};
