import * as Utils from './utils';
import LayoutManager from './layoutManager';
import { defaultGroupName, wrapperClass, animationClass } from './constants';
import layoutManager from './layoutManager';
import Mediator from './mediator2';
import './container.css';

let shadowDiv;

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

function isDragRelevant({ element, options }) {
  return function(draggableInfo) {
    return draggableInfo.container.element === element ||
      draggableInfo.groupName === options.groupName ||
      options.acceptGroups.indexOf(draggableInfo.groupName) > -1;
  }
}


function reorderDraggables({ draggables }) {
  return function(addedIndex, removedIndex, element) {
    if (removedIndex !== null || addedIndex !== null) {
      let removed = null;
      if (removedIndex != null) {
        removed = draggables[removedIndex].parentElement.removeChild(draggables[removedIndex]);
      }

      if (removed === null) {
        removed = element;
      }

      if (addedIndex !== null) {

      }
    }
  }
}

function wrapChild(child, orientation) {
  const div = document.createElement('div');
  div.className = `${wrapperClass} ${animationClass} ${orientation}`;
  child.parentElement.insertBefore(div, child);
  div.appendChild(child);
  return div;
}

function wrapChildren(element, orientation) {
  return Array.prototype.map.call(element.children, child => {
    let wrapper = child;
    if (!Utils.hasClass(child, wrapperClass)) {
      wrapper = wrapChild(child, orientation);
    }
    return wrapper;
  });
}

function getDragInsertionIndex({ draggables, layout }) {
  const findDraggable = findDraggebleAtPos({ layout });
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

function findDraggebleAtPos({ layout }) {
  const find = (draggables, pos, startIndex, endIndex) => {
    if (endIndex < startIndex) {
      return null;
    }
    // binary serach draggable
    if (startIndex === endIndex) {
      let { begin, end } = layout.getBeginEnd(draggables[startIndex])
      if (pos > begin && pos <= end) {
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

function getShadowBeginEnd({ draggables, layout }) {
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
    draggables.forEach(p => {
      Utils.removeClass(p, animationClass);
      layout.setTranslation(p, 0);
      layout.setVisibility(p, true);
    });

    setTimeout(() => {
      draggables.forEach(p => {
        Utils.addClass(p, animationClass);
      });
    });
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

function drawShadowRect(shadowBeginEnd, layout) {
  if (!shadowBeginEnd) {
    if (shadowDiv) {
      shadowDiv.parentElement.removeChild(shadowDiv);
      shadowDiv = null;
    }
  } else {
    const { begin, end } = shadowBeginEnd;
    if (!shadowDiv) {
      shadowDiv = document.createElement('div');
      shadowDiv.style.position = 'fixed';
      shadowDiv.style.backgroundColor = '#abc';
      document.body.appendChild(shadowDiv);
    }
    const rect = layout.getContainerRectangles().rect;

    shadowDiv.style.left = rect.left + 'px';
    shadowDiv.style.top = begin + 'px';
    shadowDiv.style.width = rect.right - rect.left + 'px';
    shadowDiv.style.height = end - begin + 'px'
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
    if (pos === null) {
      elementSize = null;
    }
    return {
      pos,
      removedIndex,
      elementSize,
      invalidateShadow: draggableInfo.invalidateShadow
    };
  }
}

function handleAddItem({ draggables, layout }) {
  let addedIndex = null;
  let shadowBeginEnd = null;
  const getNextAddedIndex = getDragInsertionIndex({ draggables, layout });
  const getShadowBounds = getShadowBeginEnd({ draggables, layout });
  const translate = calculateTranslations({ draggables, layout });
  return function({ pos, removedIndex, elementSize, invalidateShadow }) {
    if (pos === null) {
      addedIndex = null;
      shadowBeginEnd = null;
      translate({ addedIndex, removedIndex, elementSize });
    } else {
      if (invalidateShadow) {
        shadowBeginEnd = getShadowBounds(addedIndex, removedIndex, elementSize);
      }
      let nextAddedIndex = getNextAddedIndex(shadowBeginEnd, pos);
      if (nextAddedIndex === null) {
        nextAddedIndex = addedIndex;
      }
      if (addedIndex !== nextAddedIndex) {
        translate({ addedIndex: nextAddedIndex, removedIndex, elementSize });
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
          translate -= layout.getSize(draggables[removedIndex]);
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
    const hydratedFunctions = functions.map(p => p(options));
    return function(data) {
      return hydratedFunctions.reduce((value, fn) => {
        return fn(value);
      }, data);
    }
  }
}

function handleDrag(options) {
  const draggableInfoHandler = compose(options)(handleRemoveItem, handleAddItem);
  const scrollListener = scrollHandler(options, draggableInfoHandler);
  return function(draggableInfo) {
    return draggableInfoHandler(scrollListener(draggableInfo));
  }
}

function handleDropAnimation({ draggables, layout, options }) {
  return function(draggableInfo, addedIndex, onAnimationEnded) {
    onAnimationEnded();
  }
}

function handleDrop({ draggables, layout, options }) {
  const draggablesReset = resetDraggables({ draggables, layout });
  const animationHandler = handleDropAnimation({ draggables, layout, options });
  return function(draggableInfo, { addedIndex, removedIndex }) {
    animationHandler(draggableInfo, addedIndex, function() {
      draggablesReset();
      // handle drop
      // ...
      let actualAddIndex = addedIndex !== null ? (removedIndex < addedIndex ? addedIndex - 1 : addedIndex) : null;
      options.onDrop && options.onDrop(actualAddIndex, removedIndex, draggableInfo.payload, draggableInfo.element);
    })
  }
}

function scrollHandler(options, dragHandler) {
  let lastDraggableInfo = null;
  options.layout.setScrollListener(function() {
    if (lastDraggableInfo !== null) {
      lastDraggableInfo.invalidateShadow = true;
      dragHandler(lastDraggableInfo);
      lastDraggableInfo.invalidateShadow = false;
    }
  });
  return function(draggableInfo) {
    lastDraggableInfo = draggableInfo;
    return draggableInfo;
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
    let dragResult = null;
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
        dragResult = dragHandler(draggableInfo);
      },
      handleDrop: function(draggableInfo) {
        dragHandler = handleDrag(props);
        return dropHandler(draggableInfo, dragResult);
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
    dispose: () => { }
  }
}

