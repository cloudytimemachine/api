var React = require('react');
var Capture = require('./capture')

var CaptureList = React.createClass({
  render: function() {
    var captureNodes = this.props.data.map(function(capture) {
      return (
        <Capture id={capture.id} href={capture.href} createdAt={capture.createdAt} path={capture.path} originalImage={capture.originalImage}></Capture>
        );
    });
    return (
      <div className="captureList">
      <div className="table-responsive">
      <table className="table">
        <thead>
        <tr>
          <th>Taken</th>
          <th>URL</th>
          <th>Path</th>
          <th>Image</th>
        </tr>
        </thead>
        <tbody>
        {captureNodes}
        </tbody>
      </table>
      </div>
      </div>
    );
  }
});

module.exports = CaptureList;
