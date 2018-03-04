import React, { Component } from 'react';
import * as simples from './demo/pages/simple';
import Navigator from './demo/navigator';


class App extends Component {
  constructor(props) {
    super();
    this.state = {
      page: simples.Simple
    }
  }

  render() {
    const Page = this.state.page;
    return (
      <div className="app">
        <div className="nav-panel"><Navigator onPage={page => this.setState({ page })} /></div>
        <div className="demo-panel">
          <Page />
        </div>
      </div>
    );
  }
}

export default App;
