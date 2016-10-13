var fixtures = require('./db_test_data.js');
var config = require('../../lib/config');
var rethinkdbdash = require('rethinkdbdash');
var _ = require('lodash');
var r;

var table = config.rethinkdb.table;

var api = module.exports = {};

api.start = function () {
  r = rethinkdbdash(config.rethinkdb);
  _.each(fixtures, function (record) {
    console.log(record);
    r.table(table)
      .insert(record)
      .run()
      .error(function (err) {
        console.log(`Something went wrong during seeding: ${err}`);
      });
  });
};

api.stop = function () {
  // console.log('Dropping table.');
  r.tableDrop(table)
    .run()
    .error(function (err) {
      console.log(`Something went wrong during table deletion: ${err}`);
    });
};
