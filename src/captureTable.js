var React = require('react');
var SearchForm = require('./searchForm');
var QueueStatusBox = require('./queueStatusBox');
var CaptureList = require('./captureList');
var $ = require('jquery');

var CaptureTable = React.createClass({
  loadCapturesFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log(data);
        this.setState({data: data['captures']});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleSearchSubmit: function(url) {
    console.log(url);
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: url,
      success: function(data) {
//        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return { data: [] };
  },
  componentDidMount: function() {
    this.loadCapturesFromServer();
    setInterval(this.loadCapturesFromServer, this.props.pollInterval);
  },
  render: function() {
    return(
      <div className="captureTable">
        <SearchForm onSearchSubmit={this.handleSearchSubmit} />
        <QueueStatusBox url="/api/queue" pollInterval={2000} data={this.state.data}/>
        <ul>
          <CaptureList data={this.state.data}/>
        </ul>
      </div>
      );
  }
});

module.exports = CaptureTable;
