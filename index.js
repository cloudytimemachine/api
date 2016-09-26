var app = require('./lib');

app.start(function onStart (err) {
  if (err) {
    console.error(err);
    process.exit();
  }
  console.log('Application started');
  process.on('SIGTERM', function onSIGTERM () {
    app.stop(function () {
      process.exit(0);
    });
  });
});
