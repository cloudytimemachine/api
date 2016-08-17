var React = require('react');
var $ = require('jquery');

var QueueStatusBox = React.createClass({
  getInitialState: function() {
    return { data: [] };
  },
  componentDidMount: function() {
    this.loadQueueLen();
    setInterval(this.loadQueueLen, this.props.pollInterval);
  },
  loadQueueLen: function() {
    $.ajax({
        url: this.props.url,
        dataType: 'json',
        cache: false,
        success: function(data) {
          console.log(data)
          this.setState({data: data});
          console.log(this.state.data)
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
    });
  },
  render: function() {
    return(
      <div className="queueStatusBox">
        Current queue length: {this.state.data['queueLength']}
      </div>
    );
  }
});

module.exports = QueueStatusBox;
