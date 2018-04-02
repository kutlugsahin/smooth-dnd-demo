import React, { Component } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';
import { applyDrag, generateItems } from './utils';
const groupStyle = {
  marginLeft: '50px',
  flex: 1
};

class Groups extends Component {
  constructor() {
    super();

    this.state = {
      items1: generateItems(15, (i) => ({ id: '1' + i, data: `Draggable 1 - ${i}` })),
      items2: generateItems(15, (i) => ({ id: '2' + i, data: `Draggable 2 - ${i}` })),
      items3: generateItems(15, (i) => ({ id: '3' + i, data: `Draggable 3 - ${i}` })),
      items4: generateItems(15, (i) => ({ id: '4' + i, data: `Draggable 4 - ${i}` })),
    };
  }
  render() {
    return (
      <div style={{ display: 'flex', justifyContent: 'stretch', marginTop: '50px', marginRight: '50px' }}>
        <div style={groupStyle}>
          <Container groupName="1" getChildPayload={i => this.state.items1[i]} onDrop={e => this.setState({ items1: applyDrag(this.state.items1, e) })}>
            {
              this.state.items1.map(p => {
                return (
                  <Draggable key={p.id}>
                    <div className="draggable-item">
                      {p.data}
                    </div>
                  </Draggable>
                );
              })
            }
          </Container>
        </div>
        <div style={groupStyle}>
          <Container groupName="1" getChildPayload={i => this.state.items2[i]} onDrop={e => this.setState({ items2: applyDrag(this.state.items2, e) })}>
            {
              this.state.items2.map(p => {
                return (
                  <Draggable key={p.id}>
                    <div className="draggable-item">
                      {p.data}
                    </div>
                  </Draggable>
                );
              })
            }
          </Container>
        </div>
        <div style={groupStyle}>
          <Container groupName="1" getChildPayload={i => this.state.items3[i]} onDrop={e => this.setState({ items3: applyDrag(this.state.items3, e) })}>
            {
              this.state.items3.map(p => {
                return (
                  <Draggable key={p.id}>
                    <div className="draggable-item">
                      {p.data}
                    </div>
                  </Draggable>
                );
              })
            }
          </Container>
        </div>
        <div style={groupStyle}>
          <Container groupName="1" getChildPayload={i => this.state.items4[i]} onDrop={e => this.setState({ items4: applyDrag(this.state.items4, e) })}>
            {
              this.state.items4.map(p => {
                return (
                  <Draggable key={p.id}>
                    <div className="draggable-item">
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

Groups.propTypes = {

};

export default Groups;