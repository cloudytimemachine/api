var async = require('async');
var config = require('./config');
var rethinkdbdash = require('rethinkdbdash');
var r;
var api = module.exports = {};

api.name = 'db';

var conn;
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

  r = rethinkdbdash(config.rethinkdb)
  r.getPoolMaster().on('log', function(message) {
    log.info(message);
  });
  r.getPoolMaster().on('healthy', function(healthy) {
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
        .run(function () {
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

api.getCaptures = function getCaptures (opts, callback) {
  r.table(table)
    .orderBy(r.desc('createdAt'))
    .limit(100)
    .run(conn, function (err, cursor) {
      if (err) {
        return callback(err);
      }
      cursor.toArray(function (err, result) {
        if (err) {
          return callback(err);
        }
        return callback(null, result);
      });
    });
};

api.getCapture = function getCapture (opts, callback) {
  r.table(table)
    .get(opts['id'])
    .run(conn, function (err, cursor) {
      if (err) {
        return callback(err);
      }
      return callback(null, cursor);
    });
};

api.writeCapture = function writeCapture (data, callback) {
  log.info({
    data: data
  }, 'about to create data record');
  r.table(table).insert(data).run(conn, callback);
};
