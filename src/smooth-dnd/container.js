// const grabEvents = ['mousedown'];
// const moveEvents = ['mousemove'];
// const dropEvents = ['mouseup'];

import mediator from './mediator';
import * as Utils from './utils';
import './container.css';

const translationValue = '__smooth_dnd_draggable_translation_value';
const draggableBegin = '__smooth_dnd_draggable_draggable_begining';
const draggableEnd = '__smooth_dnd_draggable_draggable_end';

const draggableInfo = {
  element: null,
  container: null,
  payload: null,
  position: { x: 0, y: 0 }
}

class OrientationDependentProps {
  static horizontalMap = {
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

  static verticalMap = {
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
  constructor(orientation) {
    this.map = orientation === 'horizontal' ?
      OrientationDependentProps.horizontalMap :
      OrientationDependentProps.verticalMap;
  }

  get(obj, prop) {
    return obj[this.map[prop]];
  }

  set(obj, prop, value) {
    obj[this.map[prop]] = this.map.setters[prop](value);
  }
}

class Container {
  constructor(element, props) {
    this.setProps = this.setProps.bind(this);
    this.init = this.init.bind(this);
    this.registerEvents = this.registerEvents.bind(this);
    this.deregisterEvents = this.deregisterEvents.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.onScrollPositionChanged = this.onScrollPositionChanged.bind(this);
    this.wrapChildren = this.wrapChildren.bind(this);
    this.setItemStates = this.setItemStates.bind(this);
    this.getElementSize = this.getElementSize.bind(this);
    this.setDraggableVisibility = this.setDraggableVisibility.bind(this);
    this.calculateDragPosition = this.calculateDragPosition.bind(this);
    this.findDraggableInPosition = this.findDraggableInPosition.bind(this);
    this.getElementBeginEnd = this.getElementBeginEnd.bind(this);
    this.containerElement && this.init(element, props);
    this.draggables = [];
    this.scrollables = [];

    this.state = {
      draggableInfo: null,
      removedIndex: null,
      addedIndex: null,
      visibleRect: null
    };

    mediator.registerContainer(this);
    this.init(element, props);
  }

  init(element, props) {
    this.containerElement = element;
    this.setProps(props || Container.defaultProps);
    this.wrapChildren();
  }

  setProps(props) {
    this.props = Object.assign({}, Container.defaultProps, props);
    if (props.groupName && !props.acceptGroups) {
      this.props.acceptGroups = [props.groupName];
    }

    this.orientationDependentProps = new OrientationDependentProps(this.props.orientation);
  }

  wrapChildren() {
    // wrap children if they are not
    Array.prototype.map.call(this.containerElement.children, (child, index) => {
      let wrapper = child;
      if (!Utils.hasClass(child, 'smooth-dnd-draggable-wrapper')) {
        const div = document.createElement('div');
        div.className = `smooth-dnd-draggable-wrapper ${this.props.orientation}`;
        this.containerElement.insertBefore(div, child);
        div.appendChild(child);
        wrapper = div;
      }
      this.draggables[index] = wrapper;
    });
  }

  deregisterEvents() {
    this.scrollables.forEach(p => {
      p.removeEventListener('scroll', this.onScrollPositionChanged);
    });
    this.scrollables = [];
  }

  registerEvents() {
    // if (!this.scrollEventListener) {
    //   this.scrollEventListener = Utils.listenScrollParent(this.containerElement, this.onScrollPositionChanged);
    // }
    this.onScrollPositionChanged();
    let current = this.containerElement;
    while (current) {
      if (current.scrollHeight > current.offsetHeight) {
        current.addEventListener('scroll', this.onScrollPositionChanged);
        this.scrollables.push(current);
      }
      current = current.parentElement;
    }
  }

  isDragRelevant(draggableInfo) {
    return draggableInfo.container === this ||
      draggableInfo.container.props.groupName === this.props.groupName ||
      this.acceptGroups.indexOf(draggableInfo.container.props.groupName) > -1;
  }

  isDragInside({ x, y }) {
    const { left, top, right, bottom } = this.visibleRect;
    return x > left && x < right && y > top && y < bottom;
  }

  // function to be called when the container is relavant to this drag
  // drag position can be in or out of the container
  handleDrag(draggableInfo) {
    this.state.draggableInfo = draggableInfo;
    // check if mouse is over container
    if (this.isDragInside(draggableInfo.position)) {
      draggableInfo.targetContainer = this;
      // handle drop in and reorder
      let addIndex = this.calculateDragPosition();
      let removeIndex = null;
      if (draggableInfo.container === this && this.props.behaviour === 'move') {
        removeIndex = draggableInfo.elementIndex;
        if (removeIndex < addIndex) addIndex++;
      }
      this.setItemStates(removeIndex, addIndex, this.orientationDependentProps.get(draggableInfo, 'size'));

    } else {
      // remove target container if it is this
      if (draggableInfo.targetContainer === this) {
        draggableInfo.targetContainer = null;
      }

      if (draggableInfo.container === this && this.props.behaviour === 'move') {
        this.setItemStates(draggableInfo.elementIndex, null, this.orientationDependentProps.get(draggableInfo, 'size'));        
      }
    }
  }

  // handle drop of the relavent drag operation
  // drop can be in or out of the container
  handleDrop() {
    const isDroppedIn = this.state.draggableInfo.targetContainer === this;
    this.setItemStates(null, null);
  }

  onScrollPositionChanged() {
    this.getContainerRectangles(this.getContainerRectangles().rect);
    if (this.state.draggableInfo) {
      this.handleDrag(this.state.draggableInfo);
    }
  }

  getContainerScale(boundingRect) {
    this.scaleX = (boundingRect.right - boundingRect.left) / this.containerElement.offsetWidth;
    this.scaleY = (boundingRect.bottom - boundingRect.top) / this.containerElement.offsetHeight;
    return { scaleX: this.scaleX, scaleY: this.scaleY };
  }

  getContainerRectangles() {
    this.rect = this.containerElement.getBoundingClientRect();
    this.visibleRect = Utils.getVisibleRect(this.containerElement);
    return { rect: this.rect, visibleRect: this.visibleRect };
  }

  setItemStates(removedIndex, addedIndex, size) {
    let { removedIndex: prevRemovedIndex, addedIndex: prevAddedIndex } = this.state;
    if (prevRemovedIndex === null) prevRemovedIndex = Number.MAX_SAFE_INTEGER;
    if (prevAddedIndex === null) prevAddedIndex = Number.MAX_SAFE_INTEGER;
    const currentAddedIndex = addedIndex != null ? addedIndex : Number.MAX_SAFE_INTEGER;
    const currentRemovedIndex = removedIndex !== null ? removedIndex : Number.MAX_SAFE_INTEGER;

    if (prevRemovedIndex !== currentRemovedIndex) {
      if (prevRemovedIndex < Number.MAX_SAFE_INTEGER) {
        this.setDraggableVisibility(this.draggables[prevRemovedIndex], true);
      }
      if (currentRemovedIndex < Number.MAX_SAFE_INTEGER) {
        this.setDraggableVisibility(this.draggables[currentRemovedIndex], false);
      }
    }

    for (let i = 0; i < this.draggables.length; i++) {
      var draggable = this.draggables[i];
      let prevDirection = (prevRemovedIndex < i ? -1 : 0) + (prevAddedIndex <= i ? 1 : 0);
      let currentDirection = (currentRemovedIndex < i ? -1 : 0) + (currentAddedIndex <= i ? 1 : 0)

      if (prevDirection !== currentDirection) {
        const translation = currentDirection === 1 ? this.getElementSize(draggable) :
          currentDirection === 0 ? 0 : 0 - this.getElementSize(draggable);
        this.orientationDependentProps.set(draggable.style, 'translate', translation);
        draggable[draggableBegin] = translation;
      }
    }

    this.state.addedIndex = addedIndex;
    this.state.removedIndex = removedIndex;
  }

  calculateDragPosition() {
    const dragCenter = this.state.draggableInfo.position;
    const dragPos = this.orientationDependentProps.get(this.state.draggableInfo.position, 'dragPosition');
    return this.findDraggableInPosition(dragPos, 0, this.draggables.length - 1);
  }

  findDraggableInPosition(position, startIndex, endIndex) {
    if (endIndex < startIndex) return null;
    // binary serach draggable
    if (startIndex === endIndex) {
      let { begin, end } = this.getElementBeginEnd(this.draggables[startIndex])
      if (position >= begin && position <= end) {
        return startIndex;
      } else {
        return null;
      }
    } else {
      const middleIndex = Math.floor((endIndex + startIndex) / 2);   
      let { begin, end } = this.getElementBeginEnd(this.draggables[middleIndex])      
      if (position < begin) {
        return this.findDraggableInPosition(position, startIndex, middleIndex - 1);
      } else if (position > end) {
        return this.findDraggableInPosition(position, middleIndex + 1, endIndex);
      } else {
        return middleIndex;
      }
    }
  }

  getElementBeginEnd(element) {
    const scale = this.orientationDependentProps.get(this, 'scale') || 1;
    const begin =
      ((this.orientationDependentProps.get(element, 'distanceToParent') +
        (element.translate || 0)) * scale) +
      this.orientationDependentProps.get(this.rect, 'begin');
    
    const end = begin + (this.getElementSize(element) * scale);
    return {
      begin, end
    };
  }

  getElementSize(element) {
    return this.orientationDependentProps.get(element, 'size');
  }

  setDraggableVisibility(draggable, isVisible) {
    draggable.style.visibility = isVisible ? 'visible' : 'hidden';
    draggable.style.pointerEvents = isVisible ? 'all' : 'none';
    // draggable.style[`${this.props.orientation === 'horizontal' ? 'width' : 'height'}`] = isVisible ? 'unset' : '0';
  }
}

Container.defaultProps = {
  groupName: '@@smooth-dnd-default-group@@',
  behaviour: 'move', // move | copy
  acceptGroups: ['@@smooth-dnd-default-group@@'],
  orientation: 'vertical', // vertical | horizontal
  getChildPayload: (index) => { return undefined }
}

export default Container;