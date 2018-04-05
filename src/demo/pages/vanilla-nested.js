import React, { Component } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';
import { applyDrag, generateItems } from './utils';
import container from 'smooth-dnd';

const groupStyle = {
  margin: '50px',
  overflowX: 'auto',
  // border: '1px solid #ccc'
};

class Nested extends Component {
  constructor() {
    super();

    this.childContainers = [];

    // this.containerOnDrop = this.containerOnDrop.bind(this);
    // this.containerOnDrop2 = this.containerOnDrop2.bind(this);

    const items = generateItems(30, (i) => ({
      id: i, type: 'draggable', data: `Container 1 Draggable - ${i}`
    }));

    const items2 = generateItems(5, (i) => ({
      id: i, type: 'draggable', data: `Container 2 Draggable - ${i}`
    }));

    const items3 = generateItems(4, (i) => ({
      id: i, type: 'draggable', data: `Container 3 Draggable - ${i}`
    }));

    items[5] = {
      id: 5, type: 'container', items: items2
    };

    items[9] = {
      id: 9, type: 'container', items: items3
    };

    this.state = {
      items
    };
  }

  componentDidMount() {
    container(this.parentContainer);
    this.childContainers.forEach(container);
  }
  

  render() {
    return (
      <div>
        <div className="simple-page" style={{ border: '1px solid #ddd' }}>
          <div ref={e => this.parentContainer = e}>
            {this.state.items.map((p, i) => {
              if (p.type === 'draggable') {
                return (
                  <div key={i}>
                    <div className="draggable-item">
                      {p.data}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={i}>
                    <div style={{ padding: '20px 20px', backgroundColor: '#888' }}>
                      <div ref={e => this.childContainers[i] = e}>
                        {p.items.map((q, j) => {
                          return (
                            <div key={j}>
                              <div className="draggable-item">
                                {q.data}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }
            })}  
          </div>
        </div>
      </div>
    );
  }
}

Nested.propTypes = {

};

export default Nested;