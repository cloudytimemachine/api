var $ = require('jquery');

var CaptureInformation = React.createClass({
   loadCaptureFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log(data);
        this.setState({data: data});
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
    var data = JSON.stringify(this.state.data['capture']);
    return(
      <div> {data} </div>
      );
  }
});


var CaptureScreen = React.createClass({
  render: function() {
    return(
      <div className="captureScreen">
        <img src="https://storage.googleapis.com/waybackmachine_default/google.com/_1471289737912.png" />
        <CaptureInformation url={this.props.url} />
      </div>
      );
  }

});

var captureURL = "/api/capture/" + window.location.pathname.split('/')[2];

ReactDOM.render(
  <CaptureScreen url={captureURL} />, document.getElementById('capture'));
