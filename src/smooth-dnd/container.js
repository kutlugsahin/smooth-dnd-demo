// const grabEvents = ['mousedown'];
// const moveEvents = ['mousemove'];
// const dropEvents = ['mouseup'];

import * as Utils from './utils';

const draggableInfo = {
  element: null,
  container: null,
  payload: null,
  position: { x: 0, y: 0 }
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
    this.containerElement && this.init(element, props);
    this.draggables = [];

    this.state = {
      draggableInfo: null,
      removedIndex: null,
      addedIndex: null,
      visibleRect: null
    };
  }

  init(element, props) {
    this.containerElement = element;
    this.wrapChildren();
    this.setProps(props);
    this.onScrollPositionChanged();
  }

  setProps(props) {
    this.props = Object.assign({}, Container.defaultProps, props);
    if (props.groupName && !props.acceptGroups) {
      props.acceptGroups = [props.groupName];
    }
  }

  wrapChildren() {
    // wrap children if they are not
    Array.prototype.map.call(this.containerElement.children, (child, index) => {
      let wrapper = child;
      if (Utils.hasClass(child, 'smooth-dnd-draggable-wrapper')) {
        const div = document.createElement('div');
        div.className = `smooth-dnd-draggable-wrapper ${this.props.orientation}`;
        this.containerElement.insertBefore(div, div);
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
    this.scrollEventListener = Utils.listenScrollParent(this.containerElement, this.onScrollPositionChanged);
  }

  isDragRelevant(draggableInfo) {
    return draggerInfo.container === this ||
      draggableInfo.container.props.groupName === this.props.groupName ||
      this.acceptGroups.indexOf(draggableInfo.container.props.groupName) > -1;
  }

  isDragInside({ x, y }) {
    const { left, top, right, bottom } = this.visibleRect;
    return x > left && x < right && y > top && y < bottom;
  }

  handleDrag(draggableInfo) {
    this.state.draggableInfo = draggableInfo;
    // check if mouse is over container
    if (this.isDragInside(draggableInfo.position)) {
      draggableInfo.targetContainer = this;
      // handle drop in and reorder
    } else {
      // remove target container if it is this
      if (draggableInfo.targetContainer === this)
        draggableInfo.targetContainer = null;
    }
  }

  handleDrop() {
    
  }

  onScrollPositionChanged() {
    this.visibleRect = Utils.getVisibleRect(this.containerElement);
  }
}

Container.defaultProps = {
  groupName: '@@smooth-dnd-default-group@@',
  behaviour: 'move', // move | copy
  acceptGroups: ['@@smooth-dnd-default-group@@'],
  orientation: 'vertical', // vertical | horizontal
  getChildPayload: (index) => { return undefined }
}