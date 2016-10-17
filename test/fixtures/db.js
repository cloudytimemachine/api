var fixtures = require('./db_test_data.js');
var config = require('../../lib/config');
var rethinkdbdash = require('rethinkdbdash');
var r;

var table = config.rethinkdb.table;

var api = module.exports = {};

api.start = function (app, callback) {
  r = rethinkdbdash(config.rethinkdb);
  r.table(table)
    .insert(fixtures)
    .run()
    .then(function () {
      callback();
    })
    .error(callback);
};

api.stop = function (app, callback) {
  r.table(table)
    .delete()
    .run()
    .then(function () {
      callback();
    })
    .error(callback);
};
