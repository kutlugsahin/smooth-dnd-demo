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

class Nested extends Component {
  constructor() {
    super();

    const items = generateItems(30, (_, i) => ({
      id: i, type: 'draggable', data: `Container 1 Draggable - ${i}`
    }));

    const items2 = generateItems(5, (_, i) => ({
      id: i, type: 'draggable', data: `Container 2 Draggable - ${i}`
    }));

    const items3 = generateItems(4, (_, i) => ({
      id: i, type: 'draggable', data: `Container 3 Draggable - ${i}`
    }));

    items[5] = {
      id: 5, type: 'container', items: items2
    }

    items[9] = {
      id: 9, type: 'container', items: items3
    }

    this.state = {
      items
    }
  }
  render() {
    return (
      <div>
        <div className="simple-page" style={{border: '1px solid #ddd'}}>
          <Container>
            {this.state.items.map(p => {
              if (p.type === 'draggable') {
                return (
                  <Draggable key={p.id}>
                    <div className="draggable-item">
                      {p.data}
                    </div>
                  </Draggable>
                );
              } else {
                return (
                  <Draggable key={p.id}>
                    <div style={{padding: '20px 20px', backgroundColor: '#888'}}>
                      <Container>
                        {p.items.map(q => {
                          return (
                            <Draggable key={q.id}>
                              <div className="draggable-item">
                                {q.data}
                              </div>
                            </Draggable>
                          );
                        })}
                      </Container>
                    </div>
                  </Draggable>
                )
              }
            })}
          </Container>
        </div>
      </div>
    );
  }
}

Nested.propTypes = {

};

export default Nested;