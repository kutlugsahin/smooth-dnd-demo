import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Draggable from '../draggable';
import Mediator from '../mediator';
import './style.css'

const debounce = (func, wait, immediate = true) => {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

const getDragDistanceToContainerBeginning = (x, y, container) => {
  const containerRect = container.containerRect;
  const orientation = container.props.orientation || 'vertical';
  const rect = container.containerRect;
  if (orientation === 'vertical') {
    return y - rect.y;
  } else {
    return x - rect.x;
  }
}

class Container extends Component {
  constructor(props) {
    super(props);
    this.onScroll = debounce(this.onScroll.bind(this), 100);
    this.getTranslateStyleForElement = this.getTranslateStyleForElement.bind(this);
    this.watchClientRect = this.watchClientRect.bind(this);
    this.stopWatchingClientRect = this.stopWatchingClientRect.bind(this);
    this.handleInbound = this.handleInbound.bind(this);
    this.handleOutbound = this.handleOutbound.bind(this);
    this.getElementSize = this.getElementSize.bind(this);
    this.saveState = this.saveState.bind(this);
    this.wrappers = [];
    this.draggables = [];
    this.state = {
      dispatch: -1,
      attach: -1,
      animate: true
    }
  }

  componentDidMount() {
    Mediator.register(this);
    window.container = this;
  }


  watchClientRect() {
    this.onScroll();
    window.document.addEventListener('scroll', this.onScroll);
  }

  stopWatchingClientRect() {
    window.document.removeEventListener('scroll', this.onScroll);
  }

  onScroll() {
    const { left, top, width, height } = this.container.getBoundingClientRect();
    this.containerRect = { x: left, y: top, width, height };
    this.containerVisibleRect = { x:left, y:top, width, height };
  }

  handleInbound(draggingContext, x, y) {
    const diff = getDragDistanceToContainerBeginning(x, y, this);
    const attachedSize = this.getElementSize(draggingContext.element);
    let totalSize = 0;
    let index = -1;
    for (let i = 0; i < this.wrappers.length; i++){
      const wrapper = this.wrappers[i];
      const wrapperSize = this.getElementSize(wrapper)
      if (diff > totalSize && diff <= totalSize + wrapperSize) {
        if (diff < totalSize + (wrapperSize / 2)) {
          index = i;
        } else {
          index = i + 1;
        }
        break;
      } else {
        totalSize += wrapperSize;
      }
    }

    if (this.state.attach !== index || this.state.size !== attachedSize) {
      this.setState({
        attach: index,
        size: attachedSize
      });
    }
  }

  handleOutbound(draggingContext) {
    const { element } = draggingContext;
    const dispatchIndex = this.wrappers.indexOf(element);
    this.setState({
      dispatch: dispatchIndex,
      size: this.getElementSize(element)
    });
  }

  getElementSize(element) {
    return this.props.orientation === 'horizontal' ? element.clientWidth : element.clientHeight;
  }

  saveState(draggingContext) {
    if (this.props.onDragEnd) {
      this.props.onDragEnd(this.state.dispatch, this.state.attach > this.state.dispatch ? this.state.attach -1: this.state.at);      
    }

    this.setState({
      attach: -1,
      dispatch: -1,
      animate: false
    });

    setTimeout(() => {
      this.setState({
        animate: true
      })
    }, 10);
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
              style={this.getTranslateStyleForElement(index, this.state.size, this.state.animate)}
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

    if (dispatch > -1 && dispatch < index) {
      translate -= size;
    }

    return {
      transition: animate ? 'transform 0.2s ease' : 'transform 0s ease',
      transform: `translateY(${translate}px)`,
      visibility: +dispatch > -1 && +dispatch === index ? 'hidden' : 'visible'
    };
  }
}

Container.propTypes = {
  orientation: PropTypes.string,
  style: PropTypes.shape(),
  className: PropTypes.string,
  group: PropTypes.string,
  onDragEnd: PropTypes.func
}

Container.defaultProps = {
  orientation: 'vertical',
  items: []
}

export default Container;