import React, { Component } from 'react';
import container from './smooth-dnd/container';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: Array(50).fill().map((p, i) => i),
      items2: 'Array(50).fill(undefined)'.split('').map((p, i) => i),
    };

    this.dragStyle = {
      height: '50px',
      textAlign: 'center',
      border: '1px solid #ccc',
      vertialAlign: 'middle',
      lineHeight: '50px',
      backgroundColor: "white",
      marginTop: '-1px'
    }
  }

  componentDidMount() {
    window.container = new container(this.container);
  }


  render() {
    // return (
    //   <div style={{ width: '510px', height: '800px', overflowY:'auto', transform: 'scale3d(1,1,1)', backgroundColor: '#ccc', margin:'100px' }}>
    //     <div ref={e => { this.container = e; }}>
    //       {this.state.items.map(p => (
    //         <div style={Object.assign({},this.dragStyle, {height: `${50 + (Math.random() * 200)}px`})} key={p}>Draggable {p}</div>
    //       ))}
    //     </div>
    //   </div>
    // )
    return (
      <div style={{ width: '510px', height: '800px', overflowY: 'auto', transform: 'scale3d(1,1,1)', backgroundColor: '#ccc', margin: '100px' }}>
        <div ref={e => this.container = e}>
          <div style={{ border: '1px solid #ccc', backgroundColor: '#fff', height: '30px' }}>D1</div>
          <div style={{ border: '1px solid #ccc', backgroundColor: '#fff', height: '100px' }}>D2</div>
          <div style={{ border: '1px solid #ccc', backgroundColor: '#fff', height: '30px' }}>D3</div>
        </div>
      </div>
    )
  }
}