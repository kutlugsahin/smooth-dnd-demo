import React, { Component } from 'react';
import container from './smooth-dnd/container';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: 'Array(50).fill(undefined)'.split('').map((p, i) => i),
      items2: 'Array(50).fill(undefined)'.split('').map((p, i) => i),
    };

    this.dragStyle = {
      height: '50px',
      textAlign: 'center',
      border: '1px solid #ccc',
      vertialAlign: 'middle',
      lineHeight: '50px',
      backgroundColor: "white",
      margin: '5px'
    }
  }

  componentDidMount() {
    window.container = new container(this.container);
  }
  

  render() {
    return (
      <div style={{ width: '510px', height: '800px', overflowY:'auto', transform: 'scale3d(.5,.5,1)' }}>
        <div ref={e => { this.container = e; }} style={{ width: '500px'}}>
          {this.state.items.map(p => (
            <div style={this.dragStyle} key={p}>Draggable {p}</div>
          ))}
        </div>
      </div>
    )
  }
}