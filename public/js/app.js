
var data = [{"createdAt":"2016-08-13T22:21:52.529Z","domain":"github.com","filename":"github.com/_1471126912529.png","href":"http://github.com/","id":"2c7d432f-9ce6-4a1d-afbf-90a367d1b433","originalImage":"https://storage.googleapis.com/waybackmachine_default/github.com/_1471126912529.png","path":"/","requestedUrl":"http://github.com"},{"createdAt":"2016-08-13T22:04:57.631Z","domain":"google.com","filename":"google.com/_1471125897631.png","href":"http://google.com/","id":"4e6c076e-c751-4f72-b992-42082a02d3fe","originalImage":"https://storage.googleapis.com/waybackmachine_default/google.com/_1471125897631.png","path":"/","requestedUrl":"http://google.com"},{"createdAt":"2016-08-13T23:49:24.040Z","domain":"github.com","filename":"github.com/_1471132164040.png","href":"http://github.com/","id":"352e2289-dd23-470b-9003-212039e4f15e","originalImage":"https://storage.googleapis.com/waybackmachine_default/github.com/_1471132164040.png","path":"/","requestedUrl":"http://github.com"},{"createdAt":"2016-08-13T23:44:01.975Z","domain":"apple.com","filename":"apple.com/_1471131841975.png","href":"http://apple.com/","id":"236b77b1-67a9-4301-9bed-ec26aa5c16ac","originalImage":"https://storage.googleapis.com/waybackmachine_default/apple.com/_1471131841975.png","path":"/","requestedUrl":"http://apple.com"},{"createdAt":"2016-08-13T21:06:09.315Z","domain":"google.com","filename":"google.com/_1471122369315.png","href":"http://google.com/","id":"14d8c0b8-326b-44ce-bf6f-5acac0d93fa9","originalImage":"https://storage.googleapis.com/waybackmachine_default/google.com/_1471122369315.png","path":"/","requestedUrl":"http://google.com"}];

var SearchForm = React.createClass({
  getInitialState: function() {
    return { url: '' };
  },
  handleURLChange: function(e) {
    this.setState({ url: e.target.value });
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var url = this.state.url.trim();
    if (!url) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    this.setState({ url: '' });
  },
  render: function() {
    return(
      <form className="searchForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Page to archive..."
          value={ this.state.url }
          onChange={ this.handleURLChange }
        />
        <input type="submit" value="Submit" />
      </form>
    );
  }
});

var ArchiveTable = React.createClass({
  render: function() {
    return(
      <div className="archiveTable">
        <SearchForm />
        <ul>
          <ArchiveList data={this.props.data}/>
        </ul>
      </div>
      );
  }
});

var ArchiveList = React.createClass({
  render: function() {
    var archiveNodes = this.props.data.map(function(archive) {
      return (
        <Archive key={archive.id} href={archive.href} createdAt={archive.createdAt} filename={archive.filename}></Archive>
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
        <td>Time: {this.props.createdAt}</td>
        <td>Url: {this.props.href}</td>
        <td><img src={'https://storage.googleapis.com/waybackmachine_default/' + this.props.filename} width="200px" /></td>
      </tr>
      );
  }
});

ReactDOM.render(
  <ArchiveTable data={data}/> , document.getElementById('content')
);

