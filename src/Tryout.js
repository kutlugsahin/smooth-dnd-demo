import React, { Component } from 'react';

export default class extends Component {
  render() {
    return (
      <div style={{ width: '500px', height: '500px',  overflowY: 'auto'}}>
        <div id="a" style={{
          width: '500px',
          height: '1000px',
          overflow: 'auto',
          backgroundColor: 'yellow'
        }}>
        </div>
      </div>
    );  
  }
}

const getIntersection = (rect1, rect2) => {
  return {
    left: Math.max(rect1.left, rect2.left),
    top: Math.max(rect1.top, rect2.top),
    right: Math.min(rect1.right, rect2.right),
    bottom: Math.min(rect1.bottom, rect2.bottom),
  }
}

const getVisibleRect = (element) => {
  let currentElement = element;
  let rect = element.getBoundingClientRect();
  currentElement = element.parentElement;
  while (currentElement) {
    rect = getIntersection(rect, currentElement.getBoundindClientRect())
  }
  return rect;
}

const listenScrollParent = (element, clb) => {
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