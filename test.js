var urls = require('./websites.json');
var async = require('async');
var request = require('request');

async.each(urls, function(url, cb) {
  request.post({url: 'http://localhost:3001/api/archives', form: {url: url}}, cb)
});
