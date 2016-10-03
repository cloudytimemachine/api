var env = process.env.NODE_ENV;
var configFile = '';
if (env === 'TESTING') {
  configFile = './config.test';
} else {
  configFile = './config.global';
}
var config = require(configFile);
module.exports = config;
