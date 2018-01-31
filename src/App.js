import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Container from './container';
import Draggable from './draggable';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: Array(50).fill(undefined).map((p, i) => i),
      items2: Array(50).fill(undefined).map((p, i) => i),
    };
  }

  render() {
    this.container = (
      <Container
        onDragEnd={(from, to, payload) => {
          const result = [...this.state.items];
          const removed = from > -1 ? result.splice(from, 1) : null;;
          result.splice(to, 0, from ? removed: payload);
          this.setState({
            items: result
          })
        }} 
        style={{ width: '200px', height: '1000px' }}>
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
          window.container.setState({
            attach: e.target.value
          });
        }} />
        <input type="text" onChange={e => {
          window.container.setState({
            dispatch: e.target.value
          });
        }} />
        <div style={{ float: "left" }}>
          {this.container}
        </div>  
        <div style={{float: "left", marginLeft: '40px'}}>
          <Container
            onDragEnd={(from, to, payload) => {
              const result = [...this.state.items2];
              const removed = from > -1 ? result.splice(from, 1) : null;;
              result.splice(to, 0, from ? removed : payload);
              this.setState({
                items2: result
              })
            }}
            style={{ width: '200px', height: '1000px' }}>
            {this.state.items2.map((p, index) => {
              return (
                <Draggable key={index} payload={p}>
                  <div className="item">
                    <span>Draggeble2 {p}</span>
                  </div>
                </Draggable>
              )
            })}
          </Container>
        </div>
      </div>
    );
  }
}

export default App;
