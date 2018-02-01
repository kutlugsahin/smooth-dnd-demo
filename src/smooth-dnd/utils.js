export const getIntersection = (rect1, rect2) => {
  return {
    left: Math.max(rect1.left, rect2.left),
    top: Math.max(rect1.top, rect2.top),
    right: Math.min(rect1.right, rect2.right),
    bottom: Math.min(rect1.bottom, rect2.bottom),
  }
}

export const getVisibleRect = (element) => {
  let currentElement = element;
  let rect = element.getBoundingClientRect();
  currentElement = element.parentElement;
  while (currentElement) {
    rect = getIntersection(rect, currentElement.getBoundindClientRect())
  }
  return rect;
}

export const listenScrollParent = (element, clb) => {
  let scrollers = [];
  const dispose = () => {
    scrollers.forEach(p => {
      p.removeEventListener('scroll', clb);
    });
    window.removeEventListener('scroll', clb);
  }

  let currentElement = element;
  while (currentElement) {
    if (currentElement.scrollHeight > currentElement.offsetHeight) {
      currentElement.addEventListener('scroll', clb);
      scrollers.push(currentElement);
    }
    currentElement = currentElement.parentElement;
  }

  window.addEventListener('scroll', clb);

  return {
    dispose
  }
}

export const hasParent = (element, parent) => {
  let current = element;
  while (current) {
    if (current === parent) {
      return true;
    }
  }
  return false;
}

export const getParent = (element, selector) => {
  let current = element;
  while (current) {
    if (current.matches(selector)) { return current;}
  }

  return null;
}

export const hasClass = (element, cls) => {
  return element.className.split(' ').map(p => p).indexOf(cls) > -1;
}