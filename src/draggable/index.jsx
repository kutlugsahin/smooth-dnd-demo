import React, { Component } from "react";
import PropTypes from 'prop-types';
import './style.css';

export default class extends Component {
  static propTypes = {
    dragType: PropTypes.string, // copy, move
    payload: PropTypes.any,
  }

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    return (
      <div className="react-smooth-dnd-draggable">
        {this.props.children}
      </div>
    )
  }
}