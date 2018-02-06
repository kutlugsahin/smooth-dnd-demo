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
    const mappedProp = this.map[prop];
    return obj[mappedProp || prop];
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
    this.getProp = this.getProp.bind(this);
    this.setProp = this.setProp.bind(this);
    this.onScrollPositionChanged = this.onScrollPositionChanged.bind(this);
    this.wrapChildren = this.wrapChildren.bind(this);
    this.setItemStates = this.setItemStates.bind(this);
    this.getElementSize = this.getElementSize.bind(this);
    this.setDraggableVisibility = this.setDraggableVisibility.bind(this);
    this.calculateMouseOverIndex = this.calculateMouseOverIndex.bind(this);
    this.findDraggableIndexInPosition = this.findDraggableIndexInPosition.bind(this);
    this.getElementBeginEnd = this.getElementBeginEnd.bind(this);
    this.getShadowBounds = this.getShadowBounds.bind(this);
    this.getNextAddIndex = this.getNextAddIndex.bind(this);
    this.getRemoveIndex = this.getRemoveIndex.bind(this);
    this.isInBoundaries = this.isInBoundaries.bind(this);
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

  getProp(obj, prop) {
    return this.orientationDependentProps.get(obj, prop);
  }

  setProp(obj, prop, val) { 
    this.orientationDependentProps.set(obj, prop, val);
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
    const isDragInside = this.isDragInside(draggableInfo.position)
    
    if (isDragInside) {
      draggableInfo.targetContainer = this;
    } else {
      if (draggableInfo.targetContainer === this) {
        draggableInfo.targetContainer = null;
      }
    }

    const isThisSourceContainer = draggableInfo.container === this

    const removeIndex = this.getRemoveIndex(draggableInfo, isThisSourceContainer, this.props.behaviour);
    let addIndex = this.state.addedIndex;

    if (isDragInside) {
      if (this.state.addedIndex != null) {
        const draggingAxisPosition = this.getProp(draggableInfo.position, 'dragPosition');
        if (!this.isInBoundaries(draggingAxisPosition, this.shadowBeginEnd)) {
          addIndex = this.getNextAddIndex(this.state.addedIndex, this.calculateMouseOverIndex(draggingAxisPosition), true)
        }
      } else {
        addIndex = removeIndex;
      }
    } else {
      addIndex = null;
    }

    if (this.state.addedIndex !== addIndex || this.state.removedIndex !== removeIndex) {
      this.setItemStates(removeIndex, addIndex, this.getProp(draggableInfo, 'size'));
      this.shadowBeginEnd = this.getShadowBounds();
      //this.drawShadowRect(this.shadowBeginEnd);
    }
  }

  isInBoundaries(position, beginEnd) {
    return beginEnd && position > beginEnd.begin && position < beginEnd.end;
  }

  getNextAddIndex(prevAddIndex, mouseOverIndex, isDragInside) {
    if (!isDragInside) return null;
    if (mouseOverIndex === null) return prevAddIndex;

    if (prevAddIndex !== null) {
      if (prevAddIndex <= mouseOverIndex) {
        return mouseOverIndex + 1;
      }
      return mouseOverIndex;
    } else{
      return mouseOverIndex;
    }
  }

  getRemoveIndex(draggableInfo, fromSelf, behaviour) {
    if (fromSelf && behaviour === 'move') {
      if (draggableInfo && draggableInfo.elementIndex > -1) {
        return draggableInfo.elementIndex;
      }
    }

    return null;
  }

  // handle drop of the relavent drag operation
  // drop can be in or out of the container
  handleDrop() {
    const isDroppedIn = this.state.draggableInfo.targetContainer === this;
    this.drawShadowRect(null);
    this.setItemStates(null, null);
  }

  onScrollPositionChanged() {
    this.getContainerScale(this.getContainerRectangles().rect);
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
        const translation = currentDirection === 1 ? size :
          currentDirection === 0 ? 0 : 0 - size;
        this.setProp(draggable.style, 'translate', translation);
        draggable[draggableBegin] = translation;
      }
    }

    this.state.addedIndex = addedIndex;
    this.state.removedIndex = removedIndex;
  }

  getShadowBounds() {
    if (this.state.addedIndex !== null) {
      const shadowSize = this.getProp(this.state.draggableInfo, 'size');
      let beforeIndex = this.state.addedIndex - 1;
      let begin = 0;
      if (beforeIndex === this.state.removedIndex) {
        beforeIndex--;
      }
      if (beforeIndex > -1) {
        const beforeSize = this.getProp(this.draggables[beforeIndex], 'size');
        const beforeBounds = this.getElementBeginEnd(this.draggables[beforeIndex]);
        if (shadowSize < beforeSize) {
          const threshold = (beforeSize - shadowSize) / 2;
          begin = beforeBounds.end - threshold;
        } else {
          begin = beforeBounds.end;
        }
      }

      let end = 10000;
      let afterIndex = this.state.addedIndex;
      if (afterIndex === this.state.removedIndex) {
        afterIndex++;
      }
      if (afterIndex < this.draggables.length) {
        const afterSize = this.getProp(this.draggables[afterIndex], 'size');
        const afterBounds = this.getElementBeginEnd(this.draggables[afterIndex]);
        if (shadowSize < afterSize) {
          const threshold = (afterSize - shadowSize) / 2;
          end = afterBounds.begin + threshold;
        } else {
          end = afterBounds.begin;
        }
      }

      return { begin, end };
    } else {
      return null;
    }
  }

  drawShadowRect(shadowBeginEnd) {
    if (!shadowBeginEnd) {
      if (this.shadowDiv) {
        this.shadowDiv.parentElement.removeChild(this.shadowDiv);
        this.shadowDiv = null;
      }
    } else {
      const { begin, end } = shadowBeginEnd;
      if (!this.shadowDiv) {
        this.shadowDiv = document.createElement('div');
        this.shadowDiv.style.position = 'fixed';
        this.shadowDiv.style.backgroundColor = '#abc';
        document.body.appendChild(this.shadowDiv);
      }

      this.shadowDiv.style.left = this.rect.left + 'px';
      this.shadowDiv.style.top = begin + 'px';
      this.shadowDiv.style.width = this.rect.right - this.rect.left + 'px';
      this.shadowDiv.style.height = end - begin + 'px'
    }
  }

  calculateMouseOverIndex(position) {
    return this.findDraggableIndexInPosition(position, 0, this.draggables.length - 1);
  }

  findDraggableIndexInPosition(position, startIndex, endIndex) {
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
      const { begin, end } = this.getElementBeginEnd(this.draggables[middleIndex])      
      if (position < begin) {
        return this.findDraggableIndexInPosition(position, startIndex, middleIndex - 1);
      } else if (position > end) {
        return this.findDraggableIndexInPosition(position, middleIndex + 1, endIndex);
      } else {
        return middleIndex;
      }
    }
  }

  findSortIndex(position) {
    let shadowPosition = this.getProp(this.state.draggableInfo.element, 'size') / 2;
    let visibleIndexBeforeShadow = this.state.removedIndex === this.state.addedIndex - 1 ? this.state.removedIndex - 1 : this.state.addedIndex - 1;
    if (visibleIndexBeforeShadow > -1){
      shadowPosition += this.getElementBeginEnd(this.draggables[visibleIndexBeforeShadow]).end;
    }
  }

  getElementBeginEnd(element) {
    const scale = this.getProp(this, 'scale') || 1;
    const begin =
      ((this.getProp(element, 'distanceToParent') +
        (element[draggableBegin] || 0)) * scale) +
      this.getProp(this.rect, 'begin');
    
    const end = begin + (this.getElementSize(element) * scale);
    return {
      begin, end
    };
  }

  getElementSize(element) {
    return this.getProp(element, 'size');
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