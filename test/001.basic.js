var app = require('../lib');
var should = require('should');
var request = require('superagent');

describe('server', function () {
  before(function (callback) {
    app.start(callback);
  });
  after(function (callback) {
    this.timeout(10000);
    app.stop(callback);
  });

  it('should expose port it is listening on', function () {
    should.exist(app.port);
  });

  it('should default to listening on port 3001', function () {
    app.port.should.equal(3001);
  });

  it('should open http server on port 3001', function (done) {
    request
      .get('localhost:' + app.port)
      .end(function (err, res) {
        return done(err);
      });
  });
});
