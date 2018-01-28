import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Draggable from '../draggable';
import Mediator from '../mediator';
import './style.css'

class Container extends Component {
  constructor(props) {
    super(props);
    this.calculateVisibleReact = this.calculateVisibleReact.bind(this);
    this.attachScrollEvents = this.attachScrollEvents.bind(this);
    this.getTranslateStyleForElement = this.getTranslateStyleForElement.bind(this);
    this.wrappers = [];
    this.draggables = [];
    this.state = {
      dispatch: -1,
      attach: -1,
      height: 56
    }
  }

  componentDidMount() {
    window.container = this;
    Mediator.register(this);
  }


  calculateVisibleReact() {
    this.containerRect = this.container.getBoundingClientRect();
  }

  attachScrollEvents() {

  }

  render() {
    const style = {
      ...this.props.style
    };
    const className = `${this.props.className || ''} react-smooth-dnd-container`;
    const draggables = this.draggables;

    return (
      <div
        ref={(elem) => { this.container = elem; }}
        style={style}
        className={className}>
        {this.props.children.map((child, index) => {
          draggables[index] = child;
          return (
            <div
              className="react-smooth-dnd-draggable-wrapper"
              style={this.getTranslateStyleForElement(index, this.state.height)}
              key={index}
              ref={(elem) => {
                this.wrappers[index] = elem;
              }}>{child}</div>
          )
        })}
      </div>
    )
  }

  getTranslateStyleForElement(index, size, animate = true) {
    const { attach, dispatch } = this.state;
    let translate = 0;
    if (attach > -1 && attach <= index) {
      translate = size;
    }

    if (dispatch > -1 && dispatch <= index) {
      translate -= size;
    }

    return {
      transition: animate ? 'transform 0.3s ease' : 'none',
      transform: `translateY(${translate}px)`,
      visibility: +dispatch === index ? 'hidden' : 'visible'
    };
  }
}

Container.propTypes = {
  orientation: PropTypes.string,
  style: PropTypes.shape(),
  className: PropTypes.string,
  itemRenderer: PropTypes.func
}

Container.defaultProps = {
  orientation: 'vertical',
  items: []
}

export default Container;