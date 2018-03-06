import React, { Component } from 'react';
import Container from '../../react-smooth-dnd/Container';
import Draggable from '../../react-smooth-dnd/Draggable';

function generateItems(count, creator) {
  return Array(count).fill().map(creator);
}

const groupStyle = {
  margin: '50px',
  overflowX: 'auto',
  // border: '1px solid #ccc'
}

class Horizontal extends Component {
  constructor() {
    super();

    this.state = {
      items1: generateItems(5, (_, i) => ({ id: i, data: `Source Draggable - ${i}` })),
      items2: generateItems(25, (_, i) => ({ id: i, data: `Draggable 2 - ${i}` })),
      items3: generateItems(25, (_, i) => ({ id: i, data: `Draggable 3 - ${i}` })),
      items4: generateItems(25, (_, i) => ({ id: i, data: `Draggable 4 - ${i}` })),
    }
  }
  render() {
    return (
      <div>
        <div style={groupStyle}>
          <Container groupName="1" orientation="horizontal">
            {
              this.state.items1.map(p => {
                return (
                  <Draggable key={p.id}>
                    <div className="draggable-item-horizontal">
                      {p.data}
                    </div>
                  </Draggable>
                );
              })
            }
          </Container>
        </div>
        <div style={groupStyle}>
          <Container groupName="1" orientation="horizontal">
            {
              this.state.items2.map(p => {
                return (
                  <Draggable key={p.id}>
                    <div className="draggable-item-horizontal">
                      {p.data}
                    </div>
                  </Draggable>
                );
              })
            }
          </Container>
        </div>
        <div style={groupStyle}>
          <Container groupName="1" orientation="horizontal">
            {
              this.state.items3.map(p => {
                return (
                  <Draggable key={p.id}>
                    <div className="draggable-item-horizontal">
                      {p.data}
                    </div>
                  </Draggable>
                );
              })
            }
          </Container>
        </div>
      </div>
    );
  }
}

Horizontal.propTypes = {

};

export default Horizontal;