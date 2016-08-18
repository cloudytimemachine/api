var $ = require('jquery');

var CaptureMetaInformation = React.createClass({
  render: function() {
    return(
      <div>
        <p>ID: {this.props.id}</p>
        <p>Created At: {this.props.createdAt}</p>
        <p>Domain: {this.props.domain}</p>
        <p>Path: {this.props.path}</p>
      </div>
      );
  }
});

var CaptureDetailScreen = React.createClass({
  loadCaptureFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log(data);
        this.setState({data: data['capture']});
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
    this.loadCaptureFromServer();
  },
  render: function() {
    var imgLink = this.state.data['originalImage'];
    return(
      <div>
       <img className="captureDetails" src={imgLink} />
       <CaptureMetaInformation
        createdAt={this.state.data['createdAt']}
        domain={this.state.data['domain']}
        path={this.state.data['path']}
        id={this.state.data['id']}
        />
      </div>
      );
  }
});

var captureURL = "/api/capture/" + window.location.pathname.split('/')[2];
ReactDOM.render(
  <CaptureDetailScreen url={captureURL} />, document.getElementById('capture'));
