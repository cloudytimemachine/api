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

var ArchiveTable = React.createClass({
  loadArchivesFromServer: function() {
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
        console.log('asdf');
        //this.setState({data: data});
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
    this.loadArchivesFromServer();
    setInterval(this.loadArchivesFromServer, this.props.pollInterval);
  },
  render: function() {
    return(
      <div className="archiveTable">
        <SearchForm onSearchSubmit={this.handleSearchSubmit} />
        <ul>
          <ArchiveList data={this.state.data}/>
        </ul>
      </div>
      );
  }
});

var ArchiveList = React.createClass({
  render: function() {
    var archiveNodes = this.props.data.map(function(archive) {
      return (
        <Archive key={archive.id} href={archive.href} createdAt={archive.createdAt} originalImage={archive.originalImage}></Archive>
        );
    });
    return (
      <div className="archiveList">
      <div className="table-responsive">
      <table className="table">
        <thead>
        <tr>
          <th>Taken</th>
          <th>URL</th>
          <th>Image</th>
        </tr>
        </thead>
        <tbody>
        {archiveNodes}
        </tbody>
      </table>
      </div>
      </div>
    );
  }
});

var Archive = React.createClass({
  render: function() {
    return(
      <tr className="archive">
        <td>{this.props.createdAt}</td>
        <td>{this.props.href}</td>
        <td><a href={this.props.originalImage}><img src={this.props.originalImage} width="200px" /></a></td>
      </tr>
      );
  }
});

ReactDOM.render(
  <ArchiveTable url="/api/archives" pollInterval={2000}/> , document.getElementById('content')
);

