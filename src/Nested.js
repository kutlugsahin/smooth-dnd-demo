import React, { Component } from 'react';
import { Container, Draggable } from './react-smooth-dnd';

const itemCls = {
  height: '50px',
  border: '1px solid #ccc',
  margin: '5px',
  textAlign: 'center',
  backgroundColor: '#eee'
}

class Nested extends Component {
  render() {
    return (
      <div>
        <div>
          <Container groupName="1" getChildPayload={(index) => index} dragBeginDelay={200}>
            <Draggable><div style={itemCls}>Draggable</div></Draggable>
            <Draggable><div style={itemCls}>Draggable</div></Draggable>
            <Draggable><div style={itemCls}>Draggable</div></Draggable>
            <Draggable><div style={itemCls}>Draggable</div></Draggable>
            <Draggable><div style={itemCls}>Draggable</div></Draggable>
            <Draggable><div style={itemCls}>Draggable</div></Draggable>
            <Draggable><div style={itemCls}>Draggable</div></Draggable>
            <Draggable><div style={itemCls}>Draggable</div></Draggable>
            <Draggable><div style={itemCls}>Draggable</div></Draggable>
            <Draggable><div style={itemCls}>Draggable</div></Draggable>
            <Draggable style={{ padding: '10px', backgroundColor: '#abc' }}>
              <Container groupName="1" dragBeginDelay={200}>
                <div style={itemCls}>Draggable 1</div>
                <div style={itemCls}>Draggable 1 1</div>
                <div style={itemCls}>Draggable 1 2</div>
                <div style={itemCls}>Draggable 1 3</div>
                <div style={itemCls}>Draggable 1 4</div>
              </Container>
            </Draggable>
          </Container>
        </div>
      </div>
    );
  }
}

export default Nested;