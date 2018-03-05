export const getIntersection = (rect1, rect2) => {
  return {
    left: Math.max(rect1.left, rect2.left),
    top: Math.max(rect1.top, rect2.top),
    right: Math.min(rect1.right, rect2.right),
    bottom: Math.min(rect1.bottom, rect2.bottom),
  }
}

export const isScrolling(element, dimension){
  if(dimension){

  } else {
    const overflow = element.style.overflow;
    const overFlowAxis = element.style[`overflow${dimension}`];
    const general = overflow === 'auto' || overflow === 'scroll';
    const dimensionScroll = overFlowAxis === 'auto' || overFlowAxis === 'scroll';
  }
}

export const getVisibleRect = (element) => {
  let currentElement = element;
  let rect = element.getBoundingClientRect();
  currentElement = element.parentElement;
  while (currentElement) {
    if (currentElement.scrollHeight > currentElement.clientHeight) {
      if(currentElement.style.overflow)
      rect = getIntersection(rect, currentElement.getBoundingClientRect());
    }

    if (currentElement.scrollWidth > currentElement.clientWidth) {
      
    }
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
  const classes = element.className.split(' ').filter(p => p);
  if (classes.indexOf(cls) === -1) {
    classes.push(cls);
    element.className = classes.join(' ');
  }
}

export const removeClass = (element, cls) => {
  const classes = element.className.split(' ').filter(p => p && p !== cls);
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

export const removeChildAt = (parent, index) => {
  return parent.removeChild(parent.children[index]);
}

export const addChildAt = (parent, child, index) => {
  if (index >= parent.children.lenght) {
    parent.appendChild(child);
  } else {
    parent.insertBefore(child, parent.children[index]);
  }
}

export const isMobile = () => {
  if (navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
  ) {
    return true;
  }
  else {
    return false;
  }
}