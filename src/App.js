import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Container from './container';
import Draggable from './draggable';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: Array(50).fill(undefined).map((p, i) => i)
    };
  }

  render() {
    this.container = (
      <Container
        onDragEnd={(from, to) => {
          const result = [...this.state.items];
          const removed = result.splice(from, 1);
          result.splice(to, 0, removed);
          this.setState({
            items: result
          })
        }} 
        style={{ width: '700px', height: '1000px' }}>
        {this.state.items.map((p, index) => {
          return (
            <Draggable key={index} payload={p}>
              <div className="item">
                <span>Draggeble {p}</span>
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
