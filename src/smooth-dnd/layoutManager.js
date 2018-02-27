import * as Utils from './utils';
import { translationValue, visibilityValue, extraSizeForInsertion, containersInDraggable } from './constants';



const horizontalMap = {
  size: 'offsetWidth',
  distanceToParent: 'offsetLeft',
  translate: 'transform',
  begin: 'left',
  end: 'right',
  dragPosition: 'x',
  scrollSize: 'scrollWidth',
  offsetSize: 'offsetWidth',
  scrollValue: 'scrollLeft',
  scale: 'scaleX',
  setSize: 'width',
  setters: {
    'translate': (val) => `translate3d(${val}px, 0, 0)`
  }
}

const verticalMap = {
  size: 'offsetHeight',
  distanceToParent: 'offsetTop',
  translate: 'transform',
  begin: 'top',
  end: 'bottom',
  dragPosition: 'y',
  scrollSize: 'scrollHeight',
  offsetSize: 'offsetHeight',
  scrollValue: 'scrollTop',
  scale: 'scaleY',
  setSize: 'height',
  setters: {
    'translate': (val) => `translate3d(0,${val}px, 0)`
  }
}

function orientationDependentProps(map) {
  function get(obj, prop) {
    const mappedProp = map[prop];
    return obj[mappedProp || prop];
  }

  function set(obj, prop, value) {
    obj[map[prop]] = map.setters[prop] ? map.setters[prop](value) : value;
  }

  return { get, set };
}

export default function layoutManager(containerElement, orientation, onScroll) {
  containerElement[extraSizeForInsertion] = 0;
  const map = orientation === 'horizontal' ? horizontalMap : verticalMap;
  const propMapper = orientationDependentProps(map);
  const values = {};
  let registeredScrollListener = onScroll;

  window.addEventListener('resize', function() {
    invalidateContainerRectangles(containerElement);
    // invalidateContainerScale(containerElement);
  });

  setTimeout(() => {
    invalidate();
  }, 10);
  invalidate();

  const scrollListener = Utils.listenScrollParent(containerElement, map.scrollSize, map.offsetSize, function() {
    invalidateContainerRectangles(containerElement);
    registeredScrollListener && registeredScrollListener();
  });
  function invalidate() {
    invalidateContainerRectangles(containerElement);
    invalidateContainerScale(containerElement);
  }

  function invalidateContainerRectangles(containerElement) {
    const { right, left, bottom, top } = containerElement.getBoundingClientRect();
    values.rect = { right, left, bottom, top };
    values.visibleRect = Utils.getVisibleRect(containerElement);
  }

  function invalidateContainerScale(containerElement) {
    values.scaleX = (values.rect.right - values.rect.left) / containerElement.offsetWidth;
    values.scaleY = (values.rect.bottom - values.rect.top) / containerElement.offsetHeight;
  }

  function getContainerRectangles() {
    return {
      rect: values.rect,
      visibleRect: values.visibleRect
    }
  }

  function getBeginEndOfContainer() {
    const begin = propMapper.get(values.rect, 'begin');
    const end = propMapper.get(values.rect, 'end');
    return { begin, end };
  }

  function getContainerScale() {
    return { scaleX: values.scaleX, scaleY: values.scaleY };
  }

  function getSize(element) {
    return propMapper.get(element, 'size') * propMapper.get(values, 'scale');
  }

  function getDistanceToOffsetParent(element) {
    const distance = propMapper.get(element, 'distanceToParent') + (element[translationValue] || 0);
    return distance * propMapper.get(values, 'scale');
  }

  function getBeginEnd(element) {
    const begin = getDistanceToOffsetParent(element) + propMapper.get(values.rect, 'begin') - propMapper.get(containerElement, 'scrollValue');
    return {
      begin,
      end: begin + getSize(element) * propMapper.get(values, 'scale')
    };
  }

  function setSize(element, size) {
    propMapper.set(element, 'setSize', size);
  }

  function getAxisValue(position) {
    return propMapper.get(position, 'dragPosition');
  }

  function updateDescendantContainerRects(container, translation, mapper) {
    const rect = container.layout.getContainerRectangles().rect;
    const begin = mapper.get(rect, 'begin') + translation;
    const end = mapper.get(rect, 'end') + translation;
    mapper.set(rect, 'begin', begin);
    mapper.set(rect, 'end', end);

    if (container.childContainers) {
      container.childContainers.forEach(p => updateDescendantContainerRects(p, translation, mapper));
    }
  }

  function setTranslation(element, translation) {
    if (getTranslation(element) !== translation) {
      propMapper.set(element.style, 'translate', translation);
      element[translationValue] = translation;

      if (element[containersInDraggable]) {
        element[containersInDraggable].forEach(p => {
          updateDescendantContainerRects(p, translation, propMapper);
        });
      }
    }
  }

  function getTranslation(element) {
    return element[translationValue];
  }

  function setVisibility(element, isVisible) {
    if (element[visibilityValue] === undefined || element[visibilityValue] !== isVisible) {
      element.style.visibility = isVisible ? 'visible' : 'hidden';
      element[visibilityValue] = isVisible;
    }
  }

  function isVisible(element) {
    return element[visibilityValue] === undefined || element[visibilityValue];
  }

  function isInVisibleRect(x, y) {
    const { left, top, right, bottom } = values.visibleRect;
    if (orientation === 'vertical') {
      return x > left && x < right && y > top && y < bottom + containerElement[extraSizeForInsertion];
    } else {
      return x > left && x < right + containerElement[extraSizeForInsertion] && y > top && y < bottom;
    }
  }

  function setScrollListener(callback) {
    registeredScrollListener = callback;
  }

  function getTopLeftOfElementBegin(begin) {
    let top = 0;
    let left: 0;
    if (orientation === 'horizontal') {
      left = begin;
      top = values.rect.top;
    } else {
      left = values.rect.left;
      top = begin;
    }

    return {
      top, left
    };
  }

  function getScrollSize(element) {
    return propMapper.get(element, 'scrollSize');
  }

  function getScrollValue(element) {
    return propMapper.get(element, 'scrollValue');
  }

  function dispose() {
    if (scrollListener) {
      scrollListener.dispose();
    }
  }

  function getPosition(position) {
    return isInVisibleRect(position.x, position.y) ? getAxisValue(position) : null;
  }

  return {
    getSize,
    //getDistanceToContainerBegining,
    getContainerRectangles,
    getBeginEndOfContainer,
    getBeginEnd,
    getAxisValue,
    setTranslation,
    getTranslation,
    setVisibility,
    isVisible,
    isInVisibleRect,
    dispose,
    getContainerScale,
    setScrollListener,
    setSize,
    getTopLeftOfElementBegin,
    getScrollSize,
    getScrollValue,
    invalidate,
    getPosition,
  }
}