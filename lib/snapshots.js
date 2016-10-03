var queue = require('./queue');
var uuid = require('uuid');
var url = require('url');
var db = require('./db');

var api = module.exports = {};

api.name = 'snapshots';

var log;

api.init = function init (app, callback) {
  log = app.log.child({module: api.name});
  log.info('Initializing');
  return callback();
};

api.close = function close (callback) {
  // No action necessary
  return callback();
};

api.createSnapshot = function createSnapshot (requestedUrl, callback) {
  requestedUrl = requestedUrl.toLowerCase();
  if (requestedUrl.indexOf('http://') !== 0 && requestedUrl.indexOf('https://') !== 0) {
    requestedUrl = 'http://' + requestedUrl;
  }
  var parsed = url.parse(requestedUrl);
  var snapshot = {
    id: uuid.v4(),
    status: 'PENDING',
    host: parsed.host,
    path: parsed.path,
    requestedUrl: requestedUrl
  };
  db.createSnapshot(snapshot, function onCreate (err, record) {
    if (err) {
      log.error({
        err: err,
        snapshot: snapshot
      }, 'Unable to create snapshot due to database error');
      return callback(new Error('Unable to create snapshot. DB Error'));
    }
    queue.queue(record);
    return callback(null, record);
  });
};

api.getSnapshot = function getSnapshot (id, callback) {
  return db.getSnapshot(id, callback);
};

api.getSnapshots = function getSnapshots (opts, callback) {
  return db.getSnapshots(opts, callback);
};
