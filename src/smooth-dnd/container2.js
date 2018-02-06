const draggable = (element, propMapper) => {
  const data = {
    element,
    isHidden: false,
    translation: 0,
    propMapper
  }
  return {
    getElement: () => data.element,
    isVisible: () => data.isVisible,
    setVisibility: (isVisible) => {
      if (isVisible === data.isHidden) {
        data.element.style.visibility: isVisible ? 'visible' : 'hidden'
      }
    },
    setPropMapper: (mapper) => {
      data.propMapper = mapper;
    },
    setTranslation: (translation) => {
      if (translation !== data.translation) {
        data.translation = translation;
        data.propMapper(data.element.style, 'translate', translation);
      }
    },
    getSize: () => data.propMapper(data.element, 'size');
  }
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

const defaultProps = {
  groupName: '@@smooth-dnd-default-group@@',
  behaviour: 'move', // move | copy
  acceptGroups: ['@@smooth-dnd-default-group@@'],
  orientation: 'vertical', // vertical | horizontal
  getChildPayload: (index) => { return undefined }
};


const container = (element, props) => {
  const state = {
    draggableInfo: null,
    removedIndex: null,
    addedIndex: null,
    visibleRect: null,
    orientationDependentProps: null;
  };

  const init = (element, props)  => {
    state.containerElement = element;
    setProps(props || defaultProps);
    wrapChildren();
  }

  const setProps = (props) => {
    state.props = Object.assign({}, defaultProps, props);
    if (props.groupName && !props.acceptGroups) {
      state.props.acceptGroups = [props.groupName];
    }

    state.orientationDependentProps = new OrientationDependentProps(this.props.orientation);
  }

  const getProp = (obj, prop) => {
    return state.orientationDependentProps.get(obj, prop);
  }

  const setProp = (obj, prop, val) => {
    state.orientationDependentProps.set(obj, prop, val);
  }

  const wrapChildren = () => {
    // wrap children if they are not
    Array.prototype.map.call(elements.containerElement.children, (child, index) => {
      let wrapper = child;
      if (!Utils.hasClass(child, 'smooth-dnd-draggable-wrapper')) {
        const div = document.createElement('div');
        div.className = `smooth-dnd-draggable-wrapper ${state.props.orientation}`;
        elements.containerElement.insertBefore(div, child);
        div.appendChild(child);
        wrapper = div;
      }
      elements.draggables[index] = wrapper;
    });
  }

  const deregisterEvents() => {
    scrollables.forEach((p) => {
      p.removeEventListener('scroll', this.onScrollPositionChanged);
    });
    this.scrollables = [];
  }

  const registerEvents = () => {
    onScrollPositionChanged();
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
      console.log(addIndex, removeIndex);
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
    } else {
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


  const updateDraggableProps = (draggables, addIndex, removeIndex) => {
    if (removeIndex !== null && removeIndex !== undefined) {
      draggables[removeIndex].setVisibility(false);
    }

    for (let index = 0; index < draggables.length; index++) {
      var draggable = draggables[index];
      let translation = 0;
      if (removeIndex != null && removeIndex < index) {
        translation -= size
      }
      if (addIndex !== null && addIndex < index) {
        translation += size;
      }
      if (index !== removeIndex) {
        draggables[index].setVisibility(true);
      }
      draggable.setTranslation(translation);
    }
  }
}

export const C => {
  var a = con
}


const cont = (element, props) => {
  const state = {
    element
    props,
    draggables: []
  };

  const wrapChildren = (element) => {
    Array.prototype.map.call(this.containerElement.children, (child, index) => {
      let wrapper = child;
      if (!Utils.hasClass(child, 'smooth-dnd-draggable-wrapper')) {
        const div = document.createElement('div');
        div.className = `smooth-dnd-draggable-wrapper ${this.props.orientation}`;
        this.containerElement.insertBefore(div, child);
        div.appendChild(child);
        wrapper = div;
      }
      this.draggables[index] = draggable(div);
    });
  }

  const setProps = (props) => {
    state.props = props;
  }

  const handleDrag = (draggingInfo) => {
    state.draggingInfo = draggingInfo;
  }

  

  const getShadowBeginEnd = (draggables) => {

  }
}