var healthz = require('./healthz');
var snapshots = require('./snapshots');
var queue = require('./queue');

/* eslint-disable no-unused-vars */
var pkginfo = require('pkginfo')(module);
/* eslint-enable no-unused-vars */

module.exports = function (app) {
  app.get('/version', function getVersion (req, res) {
    res.send(module.exports.version);
  });

  app.get('/healthz', healthz);

  app.get('/', function (req, res) {
    res.send(module.exports.version);
  });

  app.use('/snapshots', snapshots);
  app.use('/queue', queue);
};
