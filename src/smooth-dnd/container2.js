import LayoutManager from './layoutManager';
import { defaultGroupName, wrapperClass } from './constants';

const defaultProps = {
  groupName: '@@smooth-dnd-default-group@@',
  behaviour: 'move', // move | copy
  acceptGroups: ['@@smooth-dnd-default-group@@'],
  orientation: 'vertical', // vertical | horizontal
  getChildPayload: (index) => { return undefined }
};


const container = (element, props) => {

  function init(element, props) {

  }

  function wrapChildren(element) {
    Array.prototype.map.call(element.children, (child) => {
      let wrapper = child;
      if (!Utils.hasClass(child, wrapperClass)) {
        const div = document.createElement('div');
        div.className = `${wrapperClass} ${state.props.orientation}`;
        element.insertBefore(div, child);
        div.appendChild(child);
        wrapper = div;
      }
      return wrapper;
    });
  }

  function isDragRelevant({ groupName, acceptGroups }) {
    return function(draggableInfo) {
      return draggableInfo.container === this ||
        draggableInfo.container.props.groupName === this.props.groupName ||
        this.acceptGroups.indexOf(draggableInfo.container.props.groupName) > -1;
    }
  }

  function handleDrag(draggables) {
    return
  }
}

class Container {
  static defaultProps = {
    groupName: defaultGroupName,
    behaviour: 'move', // move | copy
    acceptGroups: [defaultGroupName],
    orientation: 'vertical', // vertical | horizontal
    getChildPayload: (index) => { return undefined; }
  }

  constructor(element, props) {
    this.init(props);
  }

  initProps(props) {
    const result = Object.assign({}, Container.defaultProps, props);
    if (result.groupName && !props.acceptGroups) {
      result.acceptGroups = [props.groupName];
    }
    return result;
  }

  init(element, props) {
    const props = this.initProps(props);
    const layout = layoutManager(element, props.orientation);
    const draggables = this.wrapChildren(element);

    this.handleDrag = this.handleDrag(draggables, layout);
    this.isDragRelevant = this.isDragRelevant(props);
    this.getDragInsertionIndex = this.getDragInsertionIndex(draggables, layout);
  }

  wrapChildren(element) {
    return Array.prototype.map.call(element.children, child => {
      let wrapper = child;
      if (!Utils.hasClass(child, wrapperClass)) {
        const div = document.createElement('div');
        div.className = `${wrapperClass} ${state.props.orientation}`;
        element.insertBefore(div, child);
        div.appendChild(child);
        wrapper = div;
      }
      return wrapper;
    });
  }

  handleDrag(draggables, layout) {
    return ghostRect => draggingInfo => {
      
    }
  }

  onDragEnd(draggables, layout) {
    return (draggingInfo) => {

    }
  }

  onDragStateChanged(draggables, layout) {
    const dragHandler = this.handleDrag(draggables, layout);

    return (addIndex, removeIndex) => {
      const getGhostRect = ...;
      this.handleDrag = dragHandler(ghostRect);
    }
  }

  getDragInsertionIndex(draggables, layout) {
    return (ghostRect, position, currentIndex) => {
      const pos = layout.getAxisValue(position);
      
    }
  }
}