import React, { Component } from 'react';
import Container from './react-smooth-dnd/Container';
import Draggable from './react-smooth-dnd/Draggable';

const dragStyle = {
  height: '50px',
  textAlign: 'center',
  border: '1px solid #ccc',
  vertialAlign: 'middle',
  lineHeight: '50px',
  backgroundColor: 'white',
  marginTop: '0px'
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: Array(50).fill().map((p, i) => i)
    }
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  render() {
    return (
      <div style={{width: '500px', height:'900px', margin:'100px'}}>
        <Container style={{ height: '900px',overflowY: 'auto'}} onDropEnd={(...params) => { this.onDragEnd(...params); }}>
          {this.state.items.map((p,i) => {
            return (
              <Draggable key={p}>
                <div style={dragStyle}>Draggable {p}</div>
              </Draggable>
            );
           })}
        </Container>
      </div>
    );
  }

  onDragEnd(dragResult) {
    const newItems = [...this.state.items];
    let removed = null;
    if (dragResult.removedIndex !== null) {
      removed = newItems.splice(dragResult.removedIndex, 1)[0];
    }

    if (dragResult.addedIndex !== null) {
      newItems.splice(dragResult.addedIndex, 0, removed);
    }

    // this.setState({
    //   items: newItems
    // })
  }
}

export default App;
