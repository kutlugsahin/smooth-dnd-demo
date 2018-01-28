import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Container from './container';
import Draggable from './draggable';

class App extends Component {
  constructor(props) {
    super(props);

    this.items = Array(50).fill(undefined).map((p, i) => i);
  }

  render() {
    this.container = (
      <Container
        style={{ width: '700px', height: '1000px' }}>
        {this.items.map((p, index) => {
          return (
            <Draggable key={index} payload={p}>
              <div className="item">
                <span>Draggeble {index}</span>
              </div>
            </Draggable>
          )
        })}
      </Container>
    );
    return (
      <div className="App">
        <input type="text" onChange={e => {
          console.log(this.container);
          window.container.setState({
            attach: e.target.value
          });
        }} />
        <input type="text" onChange={e => {
          window.container.setState({
            dispatch: e.target.value
          });
        }} />
        {this.container}
      </div>
    );
  }
}

export default App;
