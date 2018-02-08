import LayoutManager from './layoutManager';
import { defaultGroupName, wrapperClass } from './constants';

const defaultProps = {
  groupName: '@@smooth-dnd-default-group@@',
  behaviour: 'move', // move | copy
  acceptGroups: ['@@smooth-dnd-default-group@@'],
  orientation: 'vertical', // vertical | horizontal
  getChildPayload: (index) => { return undefined }
};


const container = (element, props) => {

  function init(element, props) {

  }

  function wrapChildren(element) {
    Array.prototype.map.call(element.children, (child) => {
      let wrapper = child;
      if (!Utils.hasClass(child, wrapperClass)) {
        const div = document.createElement('div');
        div.className = `${wrapperClass} ${state.props.orientation}`;
        element.insertBefore(div, child);
        div.appendChild(child);
        wrapper = div;
      }
      return wrapper;
    });
  }

  function isDragRelevant({ groupName, acceptGroups }) {
    return function(draggableInfo) {
      return draggableInfo.container === this ||
        draggableInfo.container.props.groupName === this.props.groupName ||
        this.acceptGroups.indexOf(draggableInfo.container.props.groupName) > -1;
    }
  }

  function handleDrag(draggables) {
    return
  }
}

class Container {
  static defaultProps = {
    groupName: defaultGroupName,
    behaviour: 'move', // move | copy
    acceptGroups: [defaultGroupName],
    orientation: 'vertical', // vertical | horizontal
    getChildPayload: (index) => { return undefined; }
  }

  constructor(element, props) {
    this.init(props);
  }

  initProps(props) {
    const result = Object.assign({}, Container.defaultProps, props);
    if (result.groupName && !props.acceptGroups) {
      result.acceptGroups = [props.groupName];
    }
    return result;
  }

  init(element, props) {
    const props = this.initProps(props);
    const layout = layoutManager(element, props.orientation);
    const draggables = this.wrapChildren(element);

    this.handleDrag = this.handleDrag(draggables, layout);
    this.isDragRelevant = this.isDragRelevant(props);
    this.getDragInsertionIndex = this.getDragInsertionIndex(draggables, layout);
    this.findDraggebleAtPos = this.findDraggebleAtPos(layout);
  }

  wrapChildren(element) {
    return Array.prototype.map.call(element.children, child => {
      let wrapper = child;
      if (!Utils.hasClass(child, wrapperClass)) {
        const div = document.createElement('div');
        div.className = `${wrapperClass} ${state.props.orientation}`;
        element.insertBefore(div, child);
        div.appendChild(child);
        wrapper = div;
      }
      return wrapper;
    });
  }

  handleDrag(draggables, layout) {
    const draggableInfoHandler = compose(handleRemoveItem, handleAddItem, calculateTranslations);
    return (draggableInfo) => {
      return draggableInfoHandler(draggableInfo);
    }
  }

  onDragEnd(draggables, layout) {
    const dragHandler = this.handleDrag;
    return (draggingInfo) => {
      this.handleDrag = dragHandler;
    }
  }

  onDragStateChanged(draggables, layout) {

    return ()
  }

  getDragInsertionIndex(draggables, layout) {
    return (ghostBeginEnd, pos) => {
      if (!ghostBeginEnd) {
        return this.findDraggebleAtPos(draggables, pos);
      }

      if (pos < ghostBeginEnd.begin) {
        return this.findDraggebleAtPos(draggables, pos);
      } else if (pos > ghostBeginEnd.end) {
        return this.findDraggebleAtPos(draggables, pos) + 1;
      } else {
        return null;
      }
    }
  }

  handleDraggableInfo(container, draggables, layout) {
    const dragHandler = this.handleDrag(draggables, layout);
    let removeIndex = null;
    let addIndex = null;
    return (draggableInfo) => {
      if (draggableInfo.container === container) {

      }
    }
  }

  findDraggebleAtPos(layout) {
    const find = (draggables, pos, startIndex, endIndex) => {
      if (endIndex < startIndex) return null;
      // binary serach draggable
      if (startIndex === endIndex) {
        let { begin, end } = layout.getBeginEnd(draggables[startIndex])
        if (position >= begin && position <= end) {
          return startIndex;
        } else {
          return null;
        }
      } else {
        const middleIndex = Math.floor((endIndex + startIndex) / 2);
        const { begin, end } = layout.getBeginEnd(draggables[middleIndex])
        if (position < begin) {
          return find(position, startIndex, middleIndex - 1);
        } else if (position > end) {
          return find(position, middleIndex + 1, endIndex);
        } else {
          return middleIndex;
        }
      }
    }

    return (draggables, pos) => {
      return find(draggables, pos);
    }
  }

  getShadowBeginEnd(draggables, layout) {
    return (addIndex, removeIndex, elementSize) => {
      if (addIndex !== null) {
        let beforeIndex = addIndex - 1;
        let begin = 0;
        if (beforeIndex === removeIndex) {
          beforeIndex--;
        }
        if (beforeIndex > -1) {
          const beforeSize = layout.getSize(draggables[beforeIndex]);
          const beforeBounds = layout.getBeginEnd(draggables[beforeIndex]);
          if (elementSize < beforeSize) {
            const threshold = (beforeSize - elementSize) / 2;
            begin = beforeBounds.end - threshold;
          } else {
            begin = beforeBounds.end;
          }
        }

        let end = 10000;
        let afterIndex = addIndex;
        if (afterIndex === removeIndex) {
          afterIndex++;
        }
        if (afterIndex < draggables.length) {
          const afterSize = layout.getSize(draggables[afterIndex]);
          const afterBounds = layout.getBeginEnd(draggables[afterIndex]);
          if (elementSize < afterSize) {
            const threshold = (afterSize - elementSize) / 2;
            end = afterBounds.begin + threshold;
          } else {
            end = afterBounds.begin;
          }
        }

        return { begin, end };
      } else {
        return null;
      }
    }
  }

  handleRemoveItem({container, props, draggables, layout}) {
    let removedIndex = null;
    let elementSize = null;
    return function(draggingInfo) {
      if (removedIndex === null && draggingInfo.container === container && props.behaviour === 'move') {
        removedIndex = draggingInfo.elementIndex;
        layout.setVisibility(draggables[removedIndex], false);
      }
      if (elementSize === null) {
        elementSize = layout.getSize(draggingInfo.element);
      }
      return {
        pos: layout.isInVisibleRect(draggableInfo.position) ? layout.getAxisValue(draggingInfo.position) : null,
        removedIndex,
        elementSize
      };
    }
  }

  handleAddItem({draggables, layout}) {
    let addedIndex = null;
    let shadowBeginEnd = null;
    return function({ pos, removedIndex, elementSize }) {
      if (pos === null) {
        addedIndex = null;
      } else {
        const nextAddedIndex = getDragInsertionIndex(shadowBeginEnd, pos);
        if (addedIndex !== nextAddedIndex) {
          shadowBeginEnd = getShadowBeginEnd(nextAddedIndex, removedIndex, elementSize);
          addedIndex = nextAddedIndex;
        }
      }
      return {
        addedIndex,
        removedIndex,
        elementSize
      }
    }
  }

  calculateTranslations({draggables, layout}) {
    let prevAddIndex = null;
    let prevRemoveIndex = null;
    return function({ addedIndex, removedIndex, elementSize }) {
      if (addedIndex !== prevAddIndex || removedIndex !== prevRemoveIndex) {
        for (let index = 0; index < draggables.length; index++) {
          const draggable = draggables[index];
          let translate = 0;
          if (removedIndex !== null && removedIndex < index) {
            translate -= elementSize;
          }
          if (addedIndex !== null && addedIndex <= index) {
            translate += elementSize;
          }
          layout.setTranslation(draggable, translate);
        }
        prevAddIndex = addedIndex;
        prevRemoveIndex = removedIndex;
      }
      return {
        addedIndex: prevAddIndex,
        removedIndex: prevRemoveIndex
      }
    }
  }

  compose(options) {
    return function(...functions) {
      return function(data) {
        var composed = functions.reduce((returnedValue, fn) => {
          return fn(options)(value);
        });
      }
    }  
  }

  initProps(props) {
    
  }

  create(_element, props) {
    const element = _element;
    const props = initProps(props);
        
    
    return {
      handleDrag: 
    }
  }
}

