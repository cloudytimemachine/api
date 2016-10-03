process.env.NODE_ENV = 'TESTING';

var app = require('../lib');
var should = require('should');
var request = require('superagent');
var baseUrl;

describe('Application', function () {
  this.timeout(10000);
  before(function (callback) {
    app.start(function () {
      baseUrl = 'localhost:' + app.port;
      return callback();
    });
  });
  after(function (callback) {
    baseUrl = null;
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
      .get(baseUrl)
      .end(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        return done();
      });
  });

  it('should have a health endpoint', function (done) {
    request
      .get(baseUrl + '/healthz')
      .end(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        var body = res.body;
        should.exist(body.message);
        body.message.should.equal('OK');
        should.exist(body.db);
        body.db.should.equal('HEALTHY');
        return done();
      });
  });
});
