import * as Utils from './utils'
import * as constants from './constants';
import { ghostClass } from './constants';

const grabEvents = ['mousedown'];
const moveEvents = ['mousemove'];
const releaseEvents = ['mouseup'];

let dragListeningContainers = null;
let grabbedElement = null;
let ghostInfo = null;
let draggableInfo = null;
let containers = [];
let isDragging = false;

function listenEvents() {
  addGrabListeners();
}

function addGrabListeners() {
  grabEvents.forEach(e => {
    window.document.addEventListener(e, onMouseDown);
  });
}

function addMoveListeners() {
  moveEvents.forEach(e => {
    window.document.addEventListener(e, onMouseMove);
  });
}

function removeMoveListeners() {
  moveEvents.forEach(e => {
    window.document.removeEventListener(e, onMouseMove);
  });
}

function addReleaseListeners() {
  releaseEvents.forEach(e => {
    window.document.addEventListener(e, onMouseUp);
  });
}

function removeReleaseListeners() {
  releaseEvents.forEach(e => {
    window.document.removeEventListener(e, onMouseUp);
  });
}

function getGhostElement(element, { x, y }, { scaleX = 1, scaleY = 1 }) {
  const { left, top, right, bottom } = element.getBoundingClientRect();
  const midX = left + ((right - left) / 2);
  const midY = top + ((bottom - top) / 2);
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.pointerEvents = 'none';
  div.style.left = left + 'px';
  div.style.top = top + 'px';
  div.style.width = right - left + 'px';
  div.style.height = bottom - top + 'px';
  div.style.overflow = 'hidden';
  div.className = constants.ghostClass;
  const clone = element.cloneNode(true);
  clone.style.width = ((right - left) / scaleX) + 'px';
  clone.style.height = ((bottom - top) / scaleY) + 'px';
  clone.style.transform = `scale3d(${scaleX || 1}, ${scaleY || 1}, 1)`;
  clone.style.transformOrigin = '0 0 0';
  clone.style.margin = '0px';
  div.appendChild(clone);

  return {
    ghost: div,
    centerDelta: { x: midX - x, y: midY - y },
    positionDelta: { left: left - x, top: top - y },
    clientWidth: right - left,
    clientHeight: bottom - top
  };
}

function getDraggableInfo(draggableElement) {
  const container = containers.filter(p => Utils.hasParent(draggableElement, p.element))[0];
  const draggableIndex = container.draggables.indexOf(draggableElement);
  return {
    container,
    element: draggableElement,
    elementIndex: draggableIndex,
    payload: container.getChildPayload(draggableIndex),
    targetElement: null,
    position: { x: 0, y: 0 },
    groupName: container.groupName
  }
}

function handleDropAnimation(callback) {
  function endDrop() {
    Utils.removeClass(ghostInfo.ghost, 'animated');
    document.body.removeChild(ghostInfo.ghost);
    callback();
  }

  function animateGhostToPosition({ top, left }) {
    Utils.addClass(ghostInfo.ghost, 'animated');
    ghostInfo.ghost.style.left = left + 'px';
    ghostInfo.ghost.style.top = top + 'px';
    setTimeout(function() {
      endDrop();
    }, 300);
  }

  if (draggableInfo.targetElement) {
    const container = containers.filter(p => p.element === draggableInfo.targetElement)[0];
    const dragResult = container.getDragResult();
    animateGhostToPosition(dragResult.shadowBeginEnd.rect);
  } else {
    const container = containers.filter(p => p === draggableInfo.container)[0];
    const { removedIndex } = container.getDragResult();
    const layout = container.layout;
    // drag ghost to back
    const dragSize = layout.getSize(removedIndex);
    container.getTranslateCalculator(removedIndex, removedIndex, dragSize);
    const prevDraggableEnd = removedIndex > 0 ? layout.getBeginEnd(container.draggables[removedIndex - 1]).end : layout.getBeginEndOfContainer().begin;
    animateGhostToPosition(layout.getTopLeftOfElementBegin(prevDraggableEnd));
  }
}

function onMouseDown(e) {
  if (!isDragging) {
    grabbedElement = Utils.getParent(e.target, '.' + constants.wrapperClass);
    if (grabbedElement) {
      addMoveListeners();
      addReleaseListeners();
    }
  }
}

function onMouseUp(e) {
  removeMoveListeners();
  removeReleaseListeners();

  if (draggableInfo) {
    handleDropAnimation(() => {
      (dragListeningContainers || []).forEach(p => {
        // call handle drop function of the container if it is either source or target of drag event
        if (p === draggableInfo.container || p.element === draggableInfo.targetElement) {
          p.handleDrop(draggableInfo);
        }
      });

      dragListeningContainers = null;
      grabbedElement = null;
      ghostInfo = null;
      draggableInfo = null;
      isDragging = false;
    });
  }
}

function onMouseMove(e) {
  e.preventDefault();
  if (!draggableInfo) {
    isDragging = true;
    // first move after grabbing  draggable
    draggableInfo = getDraggableInfo(grabbedElement);
    ghostInfo = getGhostElement(grabbedElement, { x: e.clientX, y: e.clientY }, draggableInfo.container.getScale());
    draggableInfo.position = {
      x: e.clientX + ghostInfo.centerDelta.x,
      y: e.clientY + ghostInfo.centerDelta.y
    };

    document.body.appendChild(ghostInfo.ghost);

    dragListeningContainers = containers.filter(p => p.isDragRelevant(draggableInfo));
  } else {
    // just update ghost position && draggableInfo position
    ghostInfo.ghost.style.left = `${e.clientX + ghostInfo.positionDelta.left}px`;
    ghostInfo.ghost.style.top = `${e.clientY + ghostInfo.positionDelta.top}px`;
    draggableInfo.position.x = e.clientX + ghostInfo.centerDelta.x;
    draggableInfo.position.y = e.clientY + ghostInfo.centerDelta.y;
    draggableInfo.clientWidth = ghostInfo.clientWidth;
    draggableInfo.clientHeight = ghostInfo.clientHeight;
  }

  dragListeningContainers.forEach(p => p.handleDrag(draggableInfo));
}

function Mediator() {
  listenEvents();
  return {
    register: function(container) {
      containers.push(container);
    }
  };
}

export default Mediator();



