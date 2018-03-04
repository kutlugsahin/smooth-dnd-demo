import React, { Component } from 'react';
import Container from '../../react-smooth-dnd/Container';
import Draggable from '../../react-smooth-dnd/Draggable';

function generateItems(count, creator) {
  return Array(count).fill().map(creator);
}

const groupStyle = {
  marginLeft: '50px',
  flex: 1
} 

class Groups extends Component {
  constructor() {
    super();

    this.state = {
      items1: generateItems(15, (_, i) => ({ id: i, data: `Draggable 1 - ${i}` })),
      items2: generateItems(15, (_, i) => ({ id: i, data: `Draggable 2 - ${i}` })),
      items3: generateItems(15, (_, i) => ({ id: i, data: `Draggable 3 - ${i}` })),
      items4: generateItems(15, (_, i) => ({ id: i, data: `Draggable 4 - ${i}` })),
    }
  }
  render() {
    return (
      <div style={{display:'flex', justifyContent:'stretch', marginTop:'50px', marginRight:'50px'}}>
        <div style={groupStyle}>
          <Container groupName="1">
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
          <Container groupName="1">
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
          <Container groupName="1">
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
          <Container groupName="1">
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