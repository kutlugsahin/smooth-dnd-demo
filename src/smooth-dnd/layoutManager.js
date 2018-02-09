import * as Utils from './utils';
import { translationValue, visibilityValue } from './constants';



const horizontalMap = {
  size: 'clientWidth',
  distanceToParent: 'offsetLeft',
  translate: 'transform',
  begin: 'left',
  dragPosition: 'x',
  scale: 'scaleX',
  setters: {
    'translate': (val) => `translate3d(${val}px, 0, 0)`
  }
}

const verticalMap = {
  size: 'clientHeight',
  distanceToParent: 'offsetTop',
  translate: 'transform',
  begin: 'top',
  dragPosition: 'y',
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
  const propMapper = orientationDependentProps(orientation === 'horizontal' ? horizontalMap : verticalMap);
  const values = {};

  invalidateContainerRectangles(containerElement);
  invalidateContainerScale(containerElement);

  const scrollListener = Utils.listenScrollParent(containerElement, function() {
    invalidateContainerRectangles(containerElement);
    onScroll && onScroll();
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

  function getContainerScale() {
    return { scaleX: values.scaleX, scaleY: values.scaleY };
  }

  function getSize(element) {
    return propMapper.get(element, 'size') * propMapper.get(values, 'scale');
  }

  function getDistanceToContainerBegining(element) {
    const distance = propMapper.get(element, 'distanceToParent') + (element[translationValue] || 0);
    return distance * propMapper.get(values, 'scale');
  }

  function getBeginEnd(element) {
    const begin = getDistanceToContainerBegining(element) + propMapper.get(values.rect, 'begin');
    return {
      begin,
      end: begin + getSize(element) * propMapper.get(values, 'scale')
    }
  }

  function getAxisValue(position) {
    return propMapper.get(position, 'dragPosition');
  }

  function setTranslation(element, translation) {
    if (getTranslation(element) !== translation) {
      propMapper.set(element.style, 'translate', translation);
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

  function dispose() {
    if (scrollListener) {
      scrollListener.dispose();
    }
  }

  return {
    getSize,
    getDistanceToContainerBegining,
    getContainerRectangles,
    getBeginEnd,
    getAxisValue,
    setTranslation,
    getTranslation,
    setVisibility,
    isVisible,
    isInVisibleRect,
    dispose,
    getContainerScale
  }
}