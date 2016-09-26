var app = require('./lib');
var bunyan = require('bunyan');
var log = bunyan(require('./lib/config').bunyan);

app.start(function onStart (err) {
  if (err) {
    log.error(err);
    process.exit();
  }
  process.on('SIGTERM', function onSIGTERM () {
    log.info('received SIGTERM');
    app.stop(function () {
      log.info('Application stopped, exiting');
      setTimeout(function () {
        process.exit(0);
      }, 50);
    });
  });

  process.on('SIGINT', function onSIGTERM () {
    log.info('received SIGINT');
    app.stop(function () {
      log.info('Application stopped, exiting');
      setTimeout(function () {
        process.exit(0);
      }, 50);
    });
  });
});
