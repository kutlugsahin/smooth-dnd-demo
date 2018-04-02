import React, { Component } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';
import { applyDrag, generateItems } from './utils';

const groupStyle = {
  margin: '50px',
  overflowX: 'auto',
  // border: '1px solid #ccc'
};

class SimpleHorizontal extends Component {
  constructor() {
    super();
    this.state = {
      items: generateItems(15, (i) => ({ id: '2' + i, data: `Draggable - ${i}` })),
    };
  }
  render() {
    return (
      <div>
        <div style={groupStyle}>
          <Container orientation="horizontal" onDrop={e => this.setState({ items: applyDrag(this.state.items, e) })}>
            {
              this.state.items.map(p => {
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

export default SimpleHorizontal;