import { hasClass, addClass, removeClass, addChildAt, removeChildAt } from './utils';
import {
  wrapperClass,
  animationClass,
  containersInDraggable
} from './constants';


export function domDropHandler({ element, draggables, layout, options }) {
  return (dropResult, onDropEnd) => {
    const { removedIndex, addedIndex, payload, droppedElement } = dropResult;
    if (removedIndex !== null) {
      removeChildAt(element, removedIndex);
      draggables.splice(removedIndex, 1);
    }

    if (addedIndex !== null) {
      const wrapper = document.createElement('div');
      wrapper.className = `${wrapperClass} ${options.orientation} ${animationClass} `;
      wrapper.appendChild(droppedElement.cloneNode(true));
      wrapper[containersInDraggable] = [];
      addChildAt(element, wrapper, addedIndex);
      if (addedIndex >= draggables.length) {
        draggables.push(wrapper);
      } else {
        draggables.splice(addedIndex, 0, wrapper);
      }
    }

    if (onDropEnd) {
      onDropEnd(dropResult);
    }
  }
}

export function reactDropHandler() {
  const handler = ({ element, draggables, layout, options }) => {
    return (dropResult, onDropEnd) => {
      if (onDropEnd) {
        onDropEnd(dropResult);
      }
      const { removedIndex, addedIndex } = dropResult;
      setTimeout(() => {
        for (var i = 0; i < element.children.length; i++) {
          draggables[i] = element.children[i];
        }

        for (var i = 0; i < draggables.length - element.children.length; i++) {
          draggables.pop();
        }
        
      }, 10);
    }
  }

  return {
    handler
  }
}