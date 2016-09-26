var r = require('rethinkdb');
var async = require('async');
var config = require('./config');

var api = module.exports = {};

api.name = 'db';

var conn;
var db = config.rethinkdb.db;
var table = config.rethinkdb.table;

var log;

api.close = function (callback) {
  log.info('Closing rethinkdb connection');
  conn.close(callback);
};

api.init = function (app, callback) {
  log = app.log.child({
    module: api.name
  });
  async.waterfall([
    function (callback) {
      r.connect(config.rethinkdb.conn, function (err, c) {
        if (err) {
          log.info(err);
          return callback(err);
        }
        conn = c;
        return callback();
      });
    },
    function (callback) {
      r.dbList().contains(db)
        .do(function (databaseExists) {
          return r.branch(
            databaseExists,
            { dbs_created: 0 },
            r.dbCreate(db)
          );
        }).run(conn, function (err, res) {
          if (err) {
            return callback(err);
          }
          conn.use(db);
          log.info('using wayback db');
          return callback();
        });
    },
    function (callback) {
      r.tableList().contains(table)
        .do(function (tableExists) {
          return r.branch(
            tableExists,
            { tables_created: 0 },
            r.tableCreate(table)
          );
        }).run(conn, function (err, res) {
          if (err) {
            return callback(err);
          }
          log.info('captures table exists');
          return callback();
        });
    },
    function (callback) {
      r.table(table).indexList().contains('domain')
        .do(function (indexExists) {
          return r.branch(
            indexExists,
            { indexes_created: 0 },
            r.table(table).indexCreate('domain')
          );
        }).run(conn, function (err, res) {
          if (err) {
            return callback(err);
          }
          log.info('domain index exists');
          return callback();
        });
    },
    function (callback) {
      r.table(table).indexList().contains('createdAt')
        .do(function (indexExists) {
          return r.branch(
            indexExists,
            { indexes_created: 0 },
            r.table(table).indexCreate('createdAt')
          );
        }).run(conn, function (err, res) {
          if (err) {
            return callback(err);
          }
          log.info('createdAt index exists');
          return callback();
        });
    }
  ], function (err) {
    if (err) {
      return callback(err);
    }
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
