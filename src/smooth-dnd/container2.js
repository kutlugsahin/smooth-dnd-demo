import * as Utils from './utils';
import LayoutManager from './layoutManager';
import { defaultGroupName, wrapperClass } from './constants';
import layoutManager from './layoutManager';
import Mediator from './mediator2';
import './container.css';

const defaultOptions = {
  groupName: defaultGroupName,
  behaviour: 'move', // move | copy
  acceptGroups: [defaultGroupName],
  orientation: 'vertical', // vertical | horizontal
  getChildPayload: (index) => { return undefined; }
};

function initOptions(props = defaultOptions) {
  const result = Object.assign({}, defaultOptions, props);
  if (result.groupName && !props.acceptGroups) {
    result.acceptGroups = [props.groupName];
  }
  return result;
}

function isDragRelevant({element, options}) {
  return function(draggableInfo) {
    return draggableInfo.container.element === element ||
      draggableInfo.groupName === options.groupName ||
      options.acceptGroups.indexOf(draggableInfo.groupName) > -1;
  }
}

function wrapChildren(element, orientation) {
  return Array.prototype.map.call(element.children, child => {
    let wrapper = child;
    if (!Utils.hasClass(child, wrapperClass)) {
      const div = document.createElement('div');
      div.className = `${wrapperClass} ${orientation}`;
      element.insertBefore(div, child);
      div.appendChild(child);
      wrapper = div;
    }
    return wrapper;
  });
}

function getDragInsertionIndex({draggables, layout}) {
  const findDraggable = findDraggebleAtPos({layout});
  return (ghostBeginEnd, pos) => {
    if (!ghostBeginEnd) {
      return findDraggable(draggables, pos);
    }

    if (pos < ghostBeginEnd.begin) {
      return findDraggable(draggables, pos);
    } else if (pos > ghostBeginEnd.end) {
      return findDraggable(draggables, pos) + 1;
    } else {
      return null;
    }
  }
}

function findDraggebleAtPos({layout}) {
  const find = (draggables, pos, startIndex, endIndex) => {
    if (endIndex < startIndex) return null;
    // binary serach draggable
    if (startIndex === endIndex) {
      let { begin, end } = layout.getBeginEnd(draggables[startIndex])
      if (pos >= begin && pos <= end) {
        return startIndex;
      } else {
        return null;
      }
    } else {
      const middleIndex = Math.floor((endIndex + startIndex) / 2);
      const { begin, end } = layout.getBeginEnd(draggables[middleIndex])
      if (pos < begin) {
        return find(draggables, pos, startIndex, middleIndex - 1);
      } else if (pos > end) {
        return find(draggables, pos, middleIndex + 1, endIndex);
      } else {
        return middleIndex;
      }
    }
  }

  return (draggables, pos) => {
    return find(draggables, pos, 0, draggables.length - 1);
  }
}

function getShadowBeginEnd({draggables, layout}) {
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

function resetDraggables({ draggables, layout }) {
  return function() {
    for (let index = 0; index < draggables.length; index++) {      
      layout.setTranslation(draggables[index], 0);
      layout.setVisibility(draggables[index], true);
    }
  }
}

function setTargetContainer(draggableInfo, element) {
  if (element) {
    draggableInfo.targetElement = element;
  } else {
    if (draggableInfo.targetElement === element) {
      draggableInfo.targetElement = null;
    }
  }
}

function handleRemoveItem({ element, options, draggables, layout }) {
  let removedIndex = null;
  let elementSize = null;
  return function(draggableInfo) {
    if (removedIndex === null && draggableInfo.container.element === element && options.behaviour === 'move') {
      removedIndex = draggableInfo.elementIndex;
      layout.setVisibility(draggables[removedIndex], false);
    }
    if (elementSize === null) {
      elementSize = layout.getSize(draggableInfo.element);
    }
    const pos = layout.isInVisibleRect(draggableInfo.position) ? layout.getAxisValue(draggableInfo.position) : null;
    setTargetContainer(draggableInfo, pos ? element : null);
    return {
      pos,
      removedIndex,
      elementSize
    };
  }
}

function handleAddItem({ draggables, layout }) {
  let addedIndex = null;
  let shadowBeginEnd = null;
  const getNextAddedIndex = getDragInsertionIndex({draggables, layout});
  const getShadowBounds = getShadowBeginEnd({draggables, layout});
  return function({ pos, removedIndex, elementSize }) {
    if (pos === null) {
      addedIndex = null;
    } else {
      const nextAddedIndex = getNextAddedIndex(shadowBeginEnd, pos);
      if (addedIndex !== nextAddedIndex) {
        shadowBeginEnd = getShadowBounds(nextAddedIndex, removedIndex, elementSize);
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

function calculateTranslations({ draggables, layout }) {
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

function compose(options) {
  return function(...functions) {
    return function(data) {
      return functions.reduce((value, fn) => {
        return fn(options)(value);
      },data);
    }
  }
}

function handleDrag(options) {
  const draggableInfoHandler = compose(options)(handleRemoveItem, handleAddItem, calculateTranslations);
  return function(draggableInfo) {
    return draggableInfoHandler(draggableInfo);
  }
}

function handleDrop({ draggables, layout }) {
  const draggablesReset = resetDraggables({ draggables, layout });
  return function(draggableInfo) {
    draggablesReset();

    // handle drop
    // ...
  }
}

function getContainerProps(element, initialOptions) {
  const options = initOptions(initialOptions);
  const draggables = wrapChildren(element, options.orientation);
  const layout = layoutManager(element, options.orientation);
  return {
    element,
    draggables,
    options,
    layout
  };
}

function Container(element) {
  return function(options) {
    const props = getContainerProps(element, options);
    let dragHandler = handleDrag(props);
    let dropHandler = handleDrop(props);
    return {
      element,
      draggables: props.draggables,
      isDragRelevant: isDragRelevant(props),
      getScale: props.layout.getContainerScale,
      getChildPayload: props.options.getChildPayload,
      groupName: props.options.groupName,
      handleDrag: function(draggableInfo) {
        return dragHandler(draggableInfo);
      },
      handleDrop: function(draggableInfo) {
        dragHandler = handleDrag(props);
        return dropHandler(draggableInfo);
      }
    }
  }
}

export default function(element, options) {
  const containerIniter = Container(element);
  const container = containerIniter(options);
  Mediator.register(container);
  return {
    setOptions: containerIniter,
    dispose: () => {}
  }
}

