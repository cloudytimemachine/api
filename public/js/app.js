// app.js

var SearchForm = React.createClass({
  getInitialState: function() {
    return { url: '' };
  },
  handleURLChange: function(e) {
    this.setState({ url: e.target.value });
  },
  handleSubmit: function(e) {
    console.log('here');
    e.preventDefault();
    var url = this.state.url.trim();
    if (!url) {
      return;
    }
    this.props.onSearchSubmit({ url: url});
    this.setState({ url: '' });
  },
  render: function() {
    return(
      <form className="searchForm form-inline" onSubmit={this.handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          placeholder="Page to archive..."
          value={ this.state.url }
          onChange={ this.handleURLChange }
          className="form-control"
        />
        <input type="submit" value="Submit" className="btn btn-primary"/>
        </div>
      </form>
    );
  }
});

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

var CaptureList = React.createClass({
  render: function() {
    var captureNodes = this.props.data.map(function(capture) {
      return (
        <Capture key={capture.id} href={capture.href} createdAt={capture.createdAt} path={capture.path} originalImage={capture.originalImage}></Capture>
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

var Capture = React.createClass({
  render: function() {
    var timeAgo =  moment(this.props.createdAt).fromNow();
    return(
      <tr className="capture">
        <td>{timeAgo}</td>
        <td>{this.props.href}</td>
        <td>{this.props.path}</td>
        <td><a href={this.props.originalImage}><img src={this.props.originalImage} width="200px" /></a></td>
      </tr>
      );
  }
});

ReactDOM.render(
  <CaptureTable url="/api/captures" pollInterval={2000}/> , document.getElementById('content')
);

