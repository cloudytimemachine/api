process.env.NODE_ENV = 'TESTING';

var app = require('../lib');
var should = require('should');
var request = require('superagent');
var async = require('async');

var mock = require('./fixtures/mock');

describe('/snapshots', function () {
  before(function (callback) {
    async.parallel([
      async.apply(app.start),
      async.apply(mock.start)
    ], callback);
  });
  after(function (callback) {
    async.parallel([
      async.apply(app.stop),
      async.apply(mock.stop)
    ], callback);
  });

  describe('POST /api/snapshots', function () {
    // valid URLS, invalid URLS, missing data, extra data
    it('it should start a snapshot and return placeholder', function (done) {
      var snapshotRequest = {
        requestedUrl: 'xkcd.com'
      };
      request
        .post('localhost:' + app.port + '/snapshots')
        .send(snapshotRequest)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          console.log(res);
          should.exist(res.id);
          should.exist(res.status);
          res.status.should.equal('PENDING');
          should.exist(res.createdAt);
          res.createdAt.should.be.approximately(new Date());
          should.exist(res.domain);
          res.domain.should.equal('xkcd.com');
          should.exist(res.path);
          res.path.should.equal('/');
          should.exist(res.requestedUrl);
          res.requestedUrl.should.equal('http://xkcd.com/');
          should.not.exist(res.originalImage);
          should.not.exist(res.thumbnailImage);
          return done();
        });
    });
  });
  // PENDING vs IN_PROGRESS vs FAILED vs SUCCESSFUL
  describe('GET /snapshots/:snapshotId');
});
