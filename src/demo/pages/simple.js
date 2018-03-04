import React, { Component } from 'react';
import Container from '../../react-smooth-dnd/Container';
import Draggable from '../../react-smooth-dnd/Draggable';

function generateItems(count, creator) {
  return Array(count).fill().map(creator);
}

class Simple extends Component {
  constructor() {
    super();
    this.state = {
      items: generateItems(50, (_, index) => {
        return {
          id: index,
          data: 'Draggable' + index
        }
      })
    }
  }
  render() {
    return (
      <div>
        <div className="simple-page">
          <Container>
            {this.state.items.map(p => {
              return (
                <Draggable key={p.id}>
                  <div className="draggable-item">
                    {p.data}
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

class SimpleScroller extends Component {
  constructor() {
    super();
    this.state = {
      items: generateItems(50, (_, index) => {
        return {
          id: index,
          data: 'Draggable' + index
        }
      })
    }
  }
  render() {
    return (
      <div>
        <div className="simple-page-scroller">
          <Container>
            {this.state.items.map(p => {
              return (
                <Draggable key={p.id}>
                  <div className="draggable-item">
                    {p.data}
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

export {
  Simple,
  SimpleScroller
}