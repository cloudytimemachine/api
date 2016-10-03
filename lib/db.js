var async = require('async');
var config = require('./config');
var rethinkdbdash = require('rethinkdbdash');
var _ = require('lodash');
var r;
var api = module.exports = {};

api.name = 'db';

var db = config.rethinkdb.db;
var table = config.rethinkdb.table;

api.status = 'uninitialized';

var log;

api.close = function (callback) {
  log.info('Closing rethinkdb connection');
  r.getPoolMaster().drain();
  return callback();
};

api.init = function (app, callback) {
  log = app.log.child({
    module: api.name
  });

  r = rethinkdbdash(config.rethinkdb);
  r.getPoolMaster().on('log', function (message) {
    log.info(message);
  });
  r.getPoolMaster().on('healthy', function (healthy) {
    if (healthy === true) {
      api.status = 'HEALTHY';
      log.info('Rethinkdb pool is healthy');
    } else {
      api.status = 'UNHEALTHY';
      log.warn('Rethinkdb pool is unhealthy');
    }
  });
  async.waterfall([
    function (callback) {
      r.dbList()
        .contains(db)
        .do(function (databaseExists) {
          return r.branch(
            databaseExists,
            { dbs_created: 0 },
            r.dbCreate(db)
          );
        })
        .run()
        .then(function () {
          log.info('Database exists');
          return callback();
        })
        .error(callback);
    },
    function (callback) {
      r.tableList()
        .contains(table)
        .do(function (tableExists) {
          return r.branch(
            tableExists,
            { tables_created: 0 },
            r.tableCreate(table)
          );
        })
        .run()
        .then(function () {
          log.info('captures table exists');
          return callback();
        })
        .error(callback);
    },
    function (callback) {
      r.table(table)
        .indexList()
        .contains('domain')
        .do(function (indexExists) {
          return r.branch(
            indexExists,
            { indexes_created: 0 },
            r.table(table).indexCreate('domain')
          );
        })
        .run()
        .then(function () {
          log.info('domain index exists');
          return callback();
        })
        .error(callback);
    },
    function (callback) {
      r.table(table)
        .indexList()
        .contains('createdAt')
        .do(function (indexExists) {
          return r.branch(
            indexExists,
            { indexes_created: 0 },
            r.table(table).indexCreate('createdAt')
          );
        })
        .run()
        .then(function () {
          log.info('createdAt index exists');
          return callback();
        })
        .error(callback);
    }
  ], function (err) {
    if (err) {
      return callback(err);
    }
    api.status = 'HEALTHY';
    log.info('Database connection up and running');
    return callback();
  });
};

api.getSnapshots = function getSnapshots (opts, callback) {
  r.table(table)
    .orderBy(r.desc('createdAt'))
    .limit(10)
    .run()
    .then(function (results) {
      return callback(null, results);
    })
    .error(callback);
};

api.getSnapshot = function getSnapshot (id, callback) {
  r.table(table)
    .get(id)
    .run()
    .then(function (snapshot) {
      return callback(null, snapshot);
    })
    .error(callback);
};

api.createSnapshot = function createSnapshot (data, callback) {
  var keys = ['id', 'status', 'host', 'path', 'requestedUrl'];
  var record = _.pick(data, keys);
  record.createdAt = new Date();
  record.updatedAt = record.createdAt;
  log.info({
    originalData: data,
    record: record
  }, 'about to create snapshot record');
  r.table(table)
    .insert(record)
    .run()
    .then(function onInsert () {
      return callback(null, record);
    })
    .error(callback);
};

api.updateSnapshot = function updateSnapshot (data, callback) {
  if (!data.id) {
    log.error({
      data: data
    }, 'Unable to updateSnapshot, no id');
    return callback(new Error('Unable to update snapshot, no id'));
  }
  var keys = ['status', 'originalImage', 'thumbnailImage'];
  var record = _.pick(data, keys);
  record.updatedAt = new Date();
  log.info({
    id: data.id,
    data: data,
    record: record
  }, 'about to update screenshot record');
  r.table(table)
    .get(data.id)
    .update(record)
    .run()
    .then(function () {
      log.info({
        id: data.id,
        data: data,
        record: record
      }, 'Succesfully updated screenshot record');
      return callback(null);
    })
    .error(callback);
};
