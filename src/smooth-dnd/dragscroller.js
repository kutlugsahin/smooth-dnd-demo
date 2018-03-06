import { isScrolling } from './utils';

const maxSpeed = 500; // px/s
const minSpeed = 50; // px/s

function getScrollableParent(element, axis) {
  let current = element;
  while (current) {
    if (isScrolling(current)) {
      return current;
    }
    current = current.parentElement;
  }
}

function requestFrame(element, layout) {
  let isAnimating = false;
  let request = null;
  let startTime = null;
  let direction = null;
  let speed = null;

  function animate(_direction, _speed) {
    direction = _direction;
    speed = _speed;
    isAnimating = true;
    if(isAnimating){
      start();
    }
  }

  function start() {
    request = requestAnimationFrame((timestamp) => {
      if (startTime === null) { startTime = timestamp };
      const timeDiff = timestamp - startTime;
      startTime = timestamp;
      let distanceDiff = (timeDiff / 1000) * speed;
      distanceDiff = direction === 'begin' ? (0 - distanceDiff) : distanceDiff;
      layout.setScrollValue(element, layout.getScrollValue(element) + distanceDiff);
      start();
    });
  }

  function stop() {
    if (isAnimating) {
      cancelAnimationFrame(request);
      isAnimating = false;
      startTime = null;
      request = null;
    }
  }

  return {
    animate,
    stop
  }
}


function getAutoScrollInfo(layout, pos, elementSize) {
  const { begin, end } = layout.getBeginEndOfContainerVisibleRect();
  const moveDistance = elementSize / 2;
  if (end - pos < moveDistance) {
    return {
      direction: 'end',
      speedFactor: (moveDistance - (end - pos)) / moveDistance
    }
  } else if (pos - begin < moveDistance) {
    return {
      direction: 'begin',
      speedFactor: (moveDistance - (pos - begin)) / moveDistance
    }
  }
}


export default ({ element, layout, options }) => {
  let lastPos = null;
  const axis = options.orientation === 'vertical' ? 'Y' : 'X';
  let scrollableParent = getScrollableParent(element, axis);
  let animator = requestFrame(element, layout);
  return ({ draggableInfo, dragResult }) => {
    if (dragResult.pos !== null) {
      if (lastPos === null) {
        scrollableParent = getScrollableParent(element, axis);
        animator.stop();
        animator = requestFrame(element, layout);
      }
      const autoScrollInfo = getAutoScrollInfo(layout, dragResult.pos, dragResult.elementSize);
      if (autoScrollInfo) {
        animator.animate(autoScrollInfo.direction, autoScrollInfo.speedFactor * maxSpeed);
      } else {
        animator.stop();
      }
    }

    lastPos = dragResult.pos;
    return null;
  }
}