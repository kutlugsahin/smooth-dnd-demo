import React, { Component } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';
import { applyDrag, generateItems } from './utils';

class DragHandle extends Component {
  constructor() {
    super();
    this.state = {
      items: generateItems(50, (index) => {
        return {
          id: index,
          data: 'Draggable' + index
        };
      })
    };
  }
  render() {
    return (
      <div>
        <div className="simple-page">
          <Container dragHandleSelector=".column-drag-handle" onDrop={e => this.setState({ items: applyDrag(this.state.items, e) })}>
            {this.state.items.map(p => {
              return (
                <Draggable key={p.id}>
                  <div className="draggable-item">
                    <span className="column-drag-handle" style={{float:'left', padding:'0 10px'}}>&#x2630;</span>
                    {p.data}
                  </div>
                </Draggable>
              );
            })}
          </Container>
        </div>
      </div>
    );
  }
}

export default DragHandle;