import React, { Component } from 'react';
import container from './smooth-dnd/container2';

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
    window.container = container(this.container, { groupName: '1' });
    window.container2 = container(this.container2, { groupName: '1' });
    window.container2 = container(this.container3, { groupName: '1' });
  }


  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ float: 'none', width: '510px', height: '800px', overflowY: 'auto', transform: 'scale3d(1,1,1)', backgroundColor: '#ccc', margin: '50px', border: '1px solid #ccc' }}>
          <div style={{ float: 'none', position: 'relative' }} ref={e => { this.container = e; }}>
            {this.state.items.map(p => (
              <div style={Object.assign({}, this.dragStyle, { height: `${50 + (Math.random() * 200)}px` })} key={p}>Draggable {p}</div>
            ))}
          </div>
        </div>
        <div style={{ float: 'none', width: '510px', height: '800px', overflowY: 'auto', transform: 'scale3d(1,1,1)', backgroundColor: '#ccc', margin: '50px', border: '1px solid #ccc' }}>
          <div style={{ float: 'none', position: 'relative' }} ref={e => { this.container2 = e; }}>
            {this.state.items.map(p => (
              <div style={Object.assign({}, this.dragStyle, { height: `${50 + (Math.random() * 0)}px` })} key={p}>Draggable {p}</div>
            ))}
          </div>
        </div>
        <div style={{ float: 'none', width: '510px', height: '800px', overflowY: 'auto', transform: 'scale3d(1,1,1)', backgroundColor: '#ccc', margin: '50px', border: '1px solid #ccc' }}>
          <div style={{ float: 'none', position: 'relative' }} ref={e => { this.container3 = e; }}>
            {this.state.items.map(p => (
              <div style={Object.assign({}, this.dragStyle, { height: `${50 + (Math.random() * 0)}px` })} key={p}>Draggable {p}</div>
            ))}
          </div>
        </div>
      </div>
    )
    // return (
    //   <div style={{ width: '510px', height: '800px', overflowY: 'auto', transform: 'scale3d(1,1,1)', backgroundColor: '#ccc', margin: '100px' }}>
    //     <div ref={e => this.container = e}>
    //       <div style={{ border: '1px solid #ccc', backgroundColor: '#fff', height: '30px' }}>D1</div>
    //       <div style={{ border: '1px solid #ccc', backgroundColor: '#fff', height: '100px' }}>D2</div>
    //       <div style={{ border: '1px solid #ccc', backgroundColor: '#fff', height: '30px' }}>D3</div>
    //     </div>
    //   </div>
    // )
  }
}