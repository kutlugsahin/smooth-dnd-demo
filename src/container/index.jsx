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
    this.previewRemoveItem = this.previewRemoveItem.bind(this);
    this.previewAddItem = this.previewAddItem.bind(this);
    this.resetPreview = this.resetPreview.bind(this);
    this.wrappers = [];
    this.draggables = [];
    this.state = {
      previewRemoveItemIndex: null,
      previewAddItemIndex: null,
      animate: true
    }
  }

  previewAddItem(index, size) {
    if (this.state.previewAddItemIndex !== index || this.state.size !== size) {
      this.setContainerState({ previewAddItemIndex: index, size });
    }
  }

  previewRemoveItem(index) {
    if (this.state.previewRemoveItemIndex !== index) {
      this.setContainerState({ previewRemoveItemIndex: index });
    }
  }

  resetPreview() {
    this.setContainerState({ previewAddItemIndex: null, previewRemoveItemIndex: null });
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

  // handleInbound(draggingContext, x, y) {
  //   let index = 0;
  //   const diff = getDragDistanceToContainerBeginning(x, y, this);
  //   const draggingElementSize = this.getElementSize(draggingContext.element);
  //   const wrapperSizes = this.getWrapperSizes();
  //   if (this.state.previewAddItemIndex !== null) {
  //     let totalSize = 0;
  //     for (let i = 0; i < wrapperSizes.length; i++) {
  //       const [start, end] = wrapperSizes[i];
  //       if (this.state.previewAddItemIndex < i) {
  //         if (diff >= start && diff < end) {
  //           index = i;
  //           break;
  //         }
  //       } else if (this.state.previewAddItemIndex === i) {
  //         if (diff < start) {
  //           index = i;
  //         } else {
  //           index = i + 1;
  //         }
  //         break;
  //       } else {
  //         if (diff < end) {
  //           index = i;
  //           break;
  //         }
  //       }

  //       index++;
  //     }
  //   } else if (this.state.previewRemoveItemIndex !== null) {
  //     index = this.state.previewRemoveItemIndex;
  //   } else {
  //     for (let i = 0; i < wrapperSizes.length; i++) {
  //       const [start, end] = wrapperSizes[i];
  //       if (diff >= start && diff <= end) {
  //         if (diff < (end - start) / 2) {
  //           index = i;
  //         } else {
  //           index = i + 1;
  //         }
  //         break;
  //       }
  //       index++;
  //     }
  //   }

  //   this.previewAddItem(index, draggingElementSize);
  // }

  handleInbound(draggingContext, x, y) {
    let index = 0;
    const diff = getDragDistanceToContainerBeginning(x, y, this);
    const draggingElementSize = this.getElementSize(draggingContext.element);
    const wrapperSizes = this.getWrapperSizes();
    
    if (this.state.previewAddItemIndex !== null) {
      
    } else if (this.state.previewRemoveItemIndex !== null) {
      index = this.state.previewRemoveItemIndex;
    } else {
      for (let i = 0; i < wrapperSizes.length; i++) {
        const [start, end] = wrapperSizes[i];
        if (diff >= start && diff <= end) {
          if (diff < (end - start) / 2) {
            index = i;
          } else {
            index = i + 1;
          }
          break;
        }
        index++;
      }
    }

    this.previewAddItem(index, draggingElementSize);
  }

  handleOutbound(draggingContext) {
    const { element } = draggingContext;
    const previewRemoveItemIndex = this.wrappers.indexOf(element);
    this.previewRemoveItem(previewRemoveItemIndex);
  }

  getElementSize(element) {
    return this.props.orientation === 'horizontal' ? element.clientWidth : element.clientHeight;
  }

  setContainerState(state) {
    if ((state.previewAddItemIndex !== undefined && this.state.previewAddItemIndex !== state.previewAddItemIndex) ||
      (state.previewRemoveItemIndex !== undefined && this.state.previewRemoveItemIndex !== state.previewRemoveItemIndex)) {
      this.setWrapperSizes(Object.assign({}, this.state, state));
    }
    this.setState(state);
  }

  setWrapperSizes({ previewAddItemIndex, previewRemoveItemIndex, size }) {
    const wrapperSizes = [...this.wrappers.map(this.getElementSize)];
    if (previewRemoveItemIndex !== null) {
      wrapperSizes.splice(previewRemoveItemIndex, 1);
    }

    let total = 0;
    const result = [];
    for (let i = 0; i < wrapperSizes.length; i++) {
      const currentSize = wrapperSizes[i];
      if (previewAddItemIndex > -1 && i === previewAddItemIndex) {
        // result.push([total, total + currentSize + size]);
        total += size;
      } else {
        result.push([total, total + currentSize]);
        total += currentSize;
      }
    }

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
      this.props.onDragEnd(this.state.previewRemoveItemIndex,
        this.state.previewAddItemIndex, // > this.state.previewRemoveItemIndex ? this.state.previewAddItemIndex - 1 : this.state.previewAddItemIndex,
        draggingContext.payload);
    }

    this.setState({
      previewAddItemIndex: null,
      previewRemoveItemIndex: null,
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
    const { previewAddItemIndex, previewRemoveItemIndex } = this.state;
    let translate = 0;
    const previewAddItemVisibleIndex = previewAddItemIndex !== null ?
      (previewRemoveItemIndex !== null && previewRemoveItemIndex < previewAddItemIndex ?
        previewAddItemIndex + 1 : previewAddItemIndex) : null;

    if (previewAddItemVisibleIndex !== null && previewAddItemVisibleIndex <= index) {
      translate = size;
    }

    if (previewRemoveItemIndex !== null && previewRemoveItemIndex < index) {
      translate -= this.getElementSize(this.wrappers[index]);
    }

    return {
      transition: animate ? 'transform 0.2s ease' : 'transform 0s ease',
      transform: `translate3d(0, ${translate}px, 0)`,
      visibility: previewRemoveItemIndex !== null && previewRemoveItemIndex === index ? 'hidden' : 'visible'
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