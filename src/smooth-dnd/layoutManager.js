import * as Utils from './utils';
import { translationValue, visibilityValue } from './constants';



const horizontalMap = {
  size: 'offsetWidth',
  distanceToParent: 'offsetLeft',
  translate: 'transform',
  begin: 'left',
  dragPosition: 'x',
  scrollSize: 'scrollWidth',
  offsetSize: 'offsetWidth',
  scrollValue: 'scrollLeft',
  scale: 'scaleX',
  setters: {
    'translate': (val) => `translate3d(${val}px, 0, 0)`
  }
}

const verticalMap = {
  size: 'offsetHeight',
  distanceToParent: 'offsetTop',
  translate: 'transform',
  begin: 'top',
  dragPosition: 'y',
  scrollSize: 'scrollHeight',
  offsetSize: 'offsetHeight',
  scrollValue: 'scrollTop',
  scale: 'scaleY',
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
    obj[map[prop]] = map.setters[prop](value);
  }

  return { get, set };
}

export default function layoutManager(containerElement, orientation, onScroll) {
  const map = orientation === 'horizontal' ? horizontalMap : verticalMap;
  const propMapper = orientationDependentProps(map);
  const values = {};
  let registeredScrollListener = onScroll;

  window.addEventListener('resize', function() {
    invalidateContainerRectangles(containerElement);
    // invalidateContainerScale(containerElement);
  });

  setTimeout(() => {
    invalidateContainerRectangles(containerElement);
    invalidateContainerScale(containerElement);
  }, 10);
  invalidateContainerRectangles(containerElement);
  invalidateContainerScale(containerElement);

  const scrollListener = Utils.listenScrollParent(containerElement, map.scrollSize, map.offsetSize, function() {
    invalidateContainerRectangles(containerElement);
    registeredScrollListener && registeredScrollListener();
  });

  function invalidateContainerRectangles(containerElement) {
    values.rect = containerElement.getBoundingClientRect();
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
    return { begin: propMapper.get(values.rect, 'begin'), end: propMapper.get(values.rect, 'end') };
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

  function getAxisValue(position) {
    return propMapper.get(position, 'dragPosition');
  }

  function setTranslation(element, translation) {
    if (getTranslation(element) !== translation) {
      propMapper.set(element.style, 'translate', translation);
      element[translationValue] = translation;
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

  function isInVisibleRect({ x, y }) {
    const { left, top, right, bottom } = values.visibleRect;
    return x > left && x < right && y > top && y < bottom;
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

  function dispose() {
    if (scrollListener) {
      scrollListener.dispose();
    }
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
    getTopLeftOfElementBegin
  }
}