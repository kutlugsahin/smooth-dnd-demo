import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Draggable from '../draggable';
import Mediator from '../mediator';
import './style.css'

const debounce = (fn, delay) => {
  let timer = null;
  return (...params) => {
    const self = this;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(self, params);
    }, delay);
  }
}

class Container extends Component {
  constructor(props) {
    super(props);
    this.onScroll = debounce(this.onScroll, 100).bind(this);
    this.getTranslateStyleForElement = this.getTranslateStyleForElement.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.watchClientRect = this.watchClientRect.bind(this);
    this.stopWatchingClientRect = this.stopWatchingClientRect.bind(this);
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


  watchClientRect() {
    const { x, y, width, height } = this.container.getBoundingClientRect();
    this.containerRect = { x, y, width, height };
    window.document.addEventListener('scroll', this.onScroll);
  }

  stopWatchingClientRect() {
    window.document.removeEventListener('scroll', this.onScroll);
  }

  onScroll(e) {
    const { x, y, width, height } = this.container.getBoundingClientRect();
    this.containerRect = { x, y, width, height };
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
  group: PropTypes.string
}

Container.defaultProps = {
  orientation: 'vertical',
  items: []
}

export default Container;