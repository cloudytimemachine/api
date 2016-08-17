var React = require('react');

var Capture = React.createClass({
  render: function() {
    var timeAgo =  moment(this.props.createdAt).fromNow();
    var captureLink = '/capture/' + this.props.id;
    return(
      <tr className="capture">
        <td>{timeAgo}</td>
        <td>{this.props.href}</td>
        <td>{this.props.path}</td>
        <td><a href={captureLink}><img src={this.props.originalImage} width="200px" /></a></td>
      </tr>
      );
  }
});
module.exports = Capture;
