import React, { Component } from "react";
import { Container, Draggable } from "react-smooth-dnd";
import { applyDrag, generateItems } from "./utils";

const groupStyle = {
  margin: "50px",
  overflowX: "auto"
  // border: '1px solid #ccc'
};

class Nested extends Component {
  constructor() {
    super();

    this.containerOnDrop = this.containerOnDrop.bind(this);
    this.containerOnDrop2 = this.containerOnDrop2.bind(this);

    const items = generateItems(30, i => ({
      id: i,
      type: "draggable",
      data: `Container 1 Draggable - ${i}`
    }));

    const items2 = generateItems(10, i => ({
      id: i,
      type: "draggable",
      data: `Container 2 Draggable - ${i}`
    }));

    items2[3] = {
      id: 3,
      type: "container",
      items: generateItems(4, i => ({
        id: i,
        type: "draggable",
        data: `Container 4 Draggable - ${i}`
      }))
    };

    const items3 = generateItems(4, i => ({
      id: i,
      type: "draggable",
      data: `Container 3 Draggable - ${i}`
    }));

    items[5] = {
      id: 5,
      type: "container",
      items: items2
    };

    items[9] = {
      id: 9,
      type: "container",
      items: items3
    };

    this.state = {
      items
    };
  }
  render() {
    return (
      <div>
        <div className="simple-page">
          <Container onDrop={this.containerOnDrop}>
            {this.state.items.map((p, i) => {
              if (p.type === "draggable") {
                return (
                  <Draggable key={i}>
                    <div className="draggable-item">{p.data}</div>
                  </Draggable>
                );
              } else {
                return (
                  <Draggable key={i}>
                    <div
                      style={{
                        padding: "20px 20px",
                        marginTop: "2px",
                        marginBottom: "2px",
                        border: "1px solid rgba(0,0,0,.125)",
                        backgroundColor: "#fff",
                        cursor: "move"
                      }}
                    >
                      <h4>Sortable List</h4>
                      <div style={{ cursor: "default" }}>
                        <Container onDrop={e => this.containerOnDrop2(i, e)}>
                          {p.items.map((q, j) => {
                            if (q.type === "draggable") {
                              return <Draggable key={j}>
                                  <div className="draggable-item" style={{ backgroundColor: "cornsilk" }}>
                                    {q.data}
                                  </div>
                                </Draggable>;
                            } else {
                              return <Draggable key={j}>
                                  <div style={{ padding: "20px 20px", marginTop: "2px", marginBottom: "2px", border: "1px solid rgba(0,0,0,.125)", backgroundColor: "cornsilk", cursor: "move" }}>
                                    <h4>
                                      Sortable
                                      List
                                    </h4>
                                    <div style={{ cursor: "default" }}>
                                      <Container onDrop={e => this.containerOnDrop3(i, j, e)}>
                                        {q.items.map(
                                          (
                                            t,
                                            y
                                          ) => {
                                            return (
                                              <Draggable
                                                key={
                                                  y
                                                }
                                              >
                                                <div
                                                  className="draggable-item"
                                                  style={{
                                                    backgroundColor:
                                                      "ghostwhite"
                                                  }}
                                                >
                                                  {
                                                    t.data
                                                  }
                                                </div>
                                              </Draggable>
                                            );
                                          }
                                        )}
                                      </Container>
                                    </div>
                                  </div>
                                </Draggable>;
                            }
                          })}
                        </Container>
                      </div>
                    </div>
                  </Draggable>
                );
              }
            })}
          </Container>
        </div>
      </div>
    );
  }

  containerOnDrop(e) {
    this.setState({
      items: applyDrag(this.state.items, e)
    });
  }

  containerOnDrop2(id, e) {
    const newItems = [...this.state.items];
    newItems[id].items = applyDrag(newItems[id].items, e);
    this.setState({
      items: newItems
    });
  }

  containerOnDrop3(id1, id2, e) {
    const newItems = [...this.state.items];
    newItems[id1].items[id2].items = applyDrag(
      newItems[id1].items[id2].items,
      e
    );
    this.setState({
      items: newItems
    });
  }
}

Nested.propTypes = {};

export default Nested;
