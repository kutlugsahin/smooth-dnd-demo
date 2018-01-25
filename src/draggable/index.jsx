import React, { Component } from "react";
import './style.css';

export default class extends Component {
  constructor(props) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    
    this.state = {
      isPressed: false,
      isDragging: false
    }
  }

  render() {
    return (
      <div className="react-smooth-dnd-draggable"
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
      >
        {this.props.children}
      </div>
    )
  }

  onMouseDown(event) {
    this.setState({
      isPressed: true
    });
  }

  onMouseUp(event) {

  }

  onMouseMove(event) {

  }
}