process.env.NODE_ENV = 'TESTING';

var app = require('../lib');
var should = require('should');
var request = require('superagent');
var async = require('async');
var _ = require('lodash');

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
        .post('localhost:' + app.port + '/api/snapshots')
        .send(snapshotRequest)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          should.exist(res.body);
          var body = res.body;
          should.exist(body.id);
          should.exist(body.status);
          body.status.should.equal('PENDING');
          should.exist(body.createdAt);
          var createdAt = new Date(body.createdAt);
          createdAt.getTime().should.be.approximately(new Date().getTime(), 1000);
          should.exist(body.host);
          body.host.should.equal('xkcd.com');
          should.exist(body.path);
          body.path.should.equal('/');
          should.exist(body.requestedUrl);
          body.requestedUrl.should.equal('http://xkcd.com');
          should.not.exist(body.originalImage);
          should.not.exist(body.thumbnailImage);
          return done();
        });
    });
  });
  // PENDING vs IN_PROGRESS vs FAILED vs SUCCESSFUL
  describe('GET /api/snapshots/:snapshotId', function () {
    describe('failed', function () {
      var id;
      before(function (done) {
        var snapshotRequest = {
          requestedUrl: 'doesnotexist.com'
        };
        request
          .post('localhost:' + app.port + '/api/snapshots')
          .send(snapshotRequest)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res);
            should.exist(res.body);
            var body = res.body;
            should.exist(body.id);
            id = body.id;
            should.exist(body.status);
            body.status.should.equal('PENDING');
            return setTimeout(done, 50);
          });
      });

      it('Should have FAILED status', function (done) {
        request
          .get('localhost:' + app.port + '/api/snapshots/' + id)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res);
            should.exist(res.body);
            var body = res.body;
            should.exist(body.id);
            id = body.id;
            should.exist(body.status);
            body.status.should.equal('FAILED');
            body.updatedAt.should.not.equal(body.createdAt);
            done();
          });
      });
    });

    describe('success', function () {
      var id;
      before(function (done) {
        var snapshotRequest = {
          requestedUrl: 'xkcd.com'
        };
        request
          .post('localhost:' + app.port + '/api/snapshots')
          .send(snapshotRequest)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res);
            should.exist(res.body);
            var body = res.body;
            should.exist(body.id);
            id = body.id;
            should.exist(body.status);
            body.status.should.equal('PENDING');
            return setTimeout(done, 50);
          });
      });

      it('Should have SUCCESSFUL status', function (done) {
        request
          .get('localhost:' + app.port + '/api/snapshots/' + id)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res);
            should.exist(res.body);
            var body = res.body;
            should.exist(body.id);
            id = body.id;
            should.exist(body.status);
            body.status.should.equal('SUCCESSFUL');
            should.exist(body.originalImage);
            should.exist(body.thumbnailImage);
            body.updatedAt.should.not.equal(body.createdAt);
            done();
          });
      });
    });
  });

  describe('GET /api/snapshots', function () {
    // Need to implement and test additional parameters
    it('it should return last 10 screenshots', function (done) {
      request
        .get('localhost:' + app.port + '/api/snapshots')
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res);
          should.exist(res.body);
          var body = res.body;
          body.should.be.an.Array();
          body.length.should.be.belowOrEqual(10);
          _.each(body, function eachSnapshot (snapshot) {
            should.exist(snapshot.id);
            should.exist(snapshot.status);
            should.exist(snapshot.createdAt);
            should.exist(snapshot.updatedAt);
            should.exist(snapshot.host);
            should.exist(snapshot.path);
            should.exist(snapshot.requestedUrl);
          });

          return done();
        });
    });
  });
  // PENDING vs IN_PROGRESS vs FAILED vs SUCCESSFUL
  describe('GET /api/snapshots/:snapshotId', function () {
    describe('failed', function () {
      var id;
      before(function (done) {
        var snapshotRequest = {
          requestedUrl: 'doesnotexist.com'
        };
        request
          .post('localhost:' + app.port + '/api/snapshots')
          .send(snapshotRequest)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res);
            should.exist(res.body);
            var body = res.body;
            should.exist(body.id);
            id = body.id;
            should.exist(body.status);
            body.status.should.equal('PENDING');
            return setTimeout(done, 50);
          });
      });

      it('Should have FAILED status', function (done) {
        request
          .get('localhost:' + app.port + '/api/snapshots/' + id)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res);
            should.exist(res.body);
            var body = res.body;
            should.exist(body.id);
            id = body.id;
            should.exist(body.status);
            body.status.should.equal('FAILED');
            done();
          });
      });
    });

    describe('success', function () {
      var id;
      before(function (done) {
        var snapshotRequest = {
          requestedUrl: 'xkcd.com'
        };
        request
          .post('localhost:' + app.port + '/api/snapshots')
          .send(snapshotRequest)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res);
            should.exist(res.body);
            var body = res.body;
            should.exist(body.id);
            id = body.id;
            should.exist(body.status);
            body.status.should.equal('PENDING');
            return setTimeout(done, 50);
          });
      });

      it('Should have SUCCESSFUL status', function (done) {
        request
          .get('localhost:' + app.port + '/api/snapshots/' + id)
          .end(function (err, res) {
            should.not.exist(err);
            should.exist(res);
            should.exist(res.body);
            var body = res.body;
            should.exist(body.id);
            id = body.id;
            should.exist(body.status);
            body.status.should.equal('SUCCESSFUL');
            should.exist(body.originalImage);
            should.exist(body.thumbnailImage);
            done();
          });
      });
    });
  });
});
