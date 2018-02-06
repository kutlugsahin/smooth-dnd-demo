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

  const elements = {
    containerElement: null,
    shadowElement: null,
    draggables: []
  }

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
    this.scrollables.forEach(p => {
      p.removeEventListener('scroll', this.onScrollPositionChanged);
    });
    this.scrollables = [];
  }
}

export const C => {
  var a = con
}