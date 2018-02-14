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
    rect = getIntersection(rect, currentElement.getBoundingClientRect());
    currentElement = currentElement.parentElement;
  }
  return rect;
}

export const listenScrollParent = (element, scrollSizeName, offsetSizeName, clb) => {
  let scrollers = [];
  const dispose = () => {
    scrollers.forEach(p => {
      p.removeEventListener('scroll', clb);
    });
    window.removeEventListener('scroll', clb);
  }

  setTimeout(function() {
    let currentElement = element;
    while (currentElement) {
      if (currentElement[scrollSizeName] > currentElement[offsetSizeName]) {
        currentElement.addEventListener('scroll', clb);
        scrollers.push(currentElement);
      }
      currentElement = currentElement.parentElement;
    }

    window.addEventListener('scroll', clb);
  }, 10);

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
    current = current.parentElement;
  }
  return false;
}

export const getParent = (element, selector) => {
  let current = element;
  while (current) {
    if (current.matches(selector)) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
}

export const hasClass = (element, cls) => {
  return element.className.split(' ').map(p => p).indexOf(cls) > -1;
}

export const addClass = (element, cls) => {
  const classes = element.className.split(' ').map(p => p);
  classes.push(cls);
  element.className = classes.join(' ');
}

export const removeClass = (element, cls) => {
  const classes = element.className.split(' ').map(p => p).filter(p => p !== cls);
  element.className = classes.join(' ');
}

export const debounce = (fn, delay, immediate) => {
  let timer = null;
  return (...params) => {
    if (timer) {
      clearTimeout(timer);
    }
    if (immediate && !timer) {
      fn.call(this, ...params);
    } else {
      timer = setTimeout(() => {
        timer = null;
        fn.call(this, ...params);
      }, delay);
    }
  }
}