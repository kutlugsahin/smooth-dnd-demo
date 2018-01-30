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
    this.setContainerState = this.setContainerState.bind(this);
    this.setWrapperSizes = this.setWrapperSizes.bind(this);
    this.getWrapperSizes = this.getWrapperSizes.bind(this);
    this.saveState = this.saveState.bind(this);
    this.wrappers = [];
    this.draggables = [];
    this.state = {
      dispatch: -1,
      attach: -1,
      animate: true,
      size: 56
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
    this.containerVisibleRect = { x: left, y: top, width, height };
  }

  handleInbound(draggingContext, x, y) {
    const diff = getDragDistanceToContainerBeginning(x, y, this);
    const attachedSize = this.getElementSize(draggingContext.element);
    const wrapperSizes = this.getWrapperSizes();
    let totalSize = 0;
    let index = 0;
    for (let i = 0; i < wrapperSizes.length; i++) {
      const [start, end] = wrapperSizes[i];
      if (diff <= start) {
        break;
      } else {
        index++;
      }
    }

    this.setContainerState({
      attach: index,
      size: attachedSize
    });
  }

  handleOutbound(draggingContext) {
    const { element } = draggingContext;
    const dispatchIndex = this.wrappers.indexOf(element);
    this.setContainerState({
      dispatch: dispatchIndex,
      size: this.getElementSize(element)
    });
  }

  getElementSize(element) {
    return this.props.orientation === 'horizontal' ? element.clientWidth : element.clientHeight;
  }

  setContainerState(state) {
    if ((state.attach !== undefined && this.state.attach !== state.attach) ||
      (state.dispatch !== undefined && this.state.dispatch !== state.dispatch)) {
      this.setWrapperSizes(Object.assign({}, this.state, state));
      console.log(state);
    }
    this.setState(state);
  }

  setWrapperSizes({ attach, dispatch, size }) {
    const wrapperSizes = [...this.wrappers.map(this.getElementSize)];
    if (dispatch > -1) {
      wrapperSizes.splice(dispatch, 1);
    }

    let total = 0;
    const result = [];
    for (let i = 0; i < wrapperSizes.length; i++) {
      const currentSize = wrapperSizes[i];
      if (attach > -1 && i === attach) {
        total += size;
      } else {
        result.push([total, total + currentSize]);
        total += currentSize;
      }
    }

    console.log(attach, dispatch);
    console.log(result.slice(0, 4));

    this.wrapperSizes = result;
  }

  getWrapperSizes() {
    return this.wrapperSizes || this.wrappers.reduce((acc, wrapper, i) => {
      if (i === 0) {
        acc.push([0, this.getElementSize(wrapper)]);
      } else {
        acc.push([acc[i - 1][1], acc[i - 1][1] + this.getElementSize(wrapper)])
      }
      return acc;
    }, []);
  }

  saveState(draggingContext) {
    if (this.props.onDragEnd) {
      this.props.onDragEnd(this.state.dispatch,
        this.state.attach > this.state.dispatch ? this.state.attach - 1 : this.state.attach,
        draggingContext.payload);
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
      transform: `translate3d(0, ${translate}px, 0)`,
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