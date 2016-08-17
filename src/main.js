var React = require('react');
var CaptureTable = require('./captureTable');

ReactDOM.render(
  <CaptureTable url="/api/captures" pollInterval={2000}/> , document.getElementById('content'));
