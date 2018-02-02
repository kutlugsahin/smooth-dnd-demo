// const grabEvents = ['mousedown'];
// const moveEvents = ['mousemove'];
// const dropEvents = ['mouseup'];

import mediator from './mediator';
import * as Utils from './utils';
import './draggable.css';

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
    begin: 'clientTop',
    translate: 'transform',
    setters: {
      'translate': (val) => `translate3d(${val}px, 0, 0)`
    }
  }

  static verticalMap = {
    size: 'clientHeight',
    begin: 'clientLeft',
    translate: 'transform',

    setters: {
      'translate' : (val) => `translate3d(0,${val}px, 0)`
    }
  }
  constructor(orientation) {
    this.map = orientation === 'horizontal' ?
    OrientationDependentProps.horizontalMap :
    OrientationDependentProps.verticalMap;
  }
  
  get(element, prop) {
    return element[this.map[prop]]
  }

  set(element, prop, value) {
    element[this.map[prop]] = this.map.setters[prop](value);
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
    this.containerElement && this.init(element, props);
    this.draggables = [];

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
    this.onScrollPositionChanged();
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
    if (this.scrollEventListener) {
      this.scrollEventListener.dispose();
      this.scrollEventListener = null;
    }
  }

  registerEvents() {
    if (!this.scrollEventListener) {
      this.scrollEventListener = Utils.listenScrollParent(this.containerElement, this.onScrollPositionChanged);
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
    } else {
      // remove target container if it is this
      if (draggableInfo.targetContainer === this) {
        draggableInfo.targetContainer = null;
      }
    }
  }

  // handle drop of the relavent drag operation
  // drop can be in or out of the container
  handleDrop() {
    const isDroppedIn = this.state.draggableInfo.targetContainer === this;
  }

  onScrollPositionChanged() {
    this.rect = this.containerElement.getBoundingClientRect();
    this.visibleRect = Utils.getVisibleRect(this.containerElement);
    if(this.draggableInfo){
      this.handleDrag(draggableInfo);
    }
  }

  setItemStates(removedIndex, addedIndex, size) {
    let { removedIndex: prevRemovedIndex, addedIndex: prevAddedIndex } = this.state;
    if (prevRemovedIndex === null) prevRemovedIndex = Number.MAX_SAFE_INTEGER;
    if (prevAddedIndex === null) prevAddedIndex = Number.MAX_SAFE_INTEGER;
    const currentAddedIndex = addedIndex || Number.MAX_SAFE_INTEGER;
    const currentRemovedIndex = removedIndex || Number.MAX_SAFE_INTEGER;

    if (prevRemovedIndex !== currentRemovedIndex) {
      if (prevRemovedIndex < Number.MAX_SAFE_INTEGER) {
        this.setDraggableVisibility(this.draggables[prevRemovedIndex], false);
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
        this.orientationDependentProps.set(draggable, 'translate', translation);
        draggable[draggableBegin] = translation;
      }
    }

    this.state.addedIndex = addedIndex;
    this.state.removedIndex = removedIndex;
  }

  calculateDragPosition() {
    const dragCenter = this.state.draggableInfo.position;
    
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