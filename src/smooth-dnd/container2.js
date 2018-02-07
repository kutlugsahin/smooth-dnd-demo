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
    let addIndex = null;
    let removeIndex = null;
    return (draggableInfo) => {
      
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
    return (ghostBeginEnd, position) => {
      const pos = layout.getAxisValue(position);
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
    return (removeIndex) => {
      const elementSize = layout.getSize(draggables[removeIndex]);
      return (addIndex) => {
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
  }
}