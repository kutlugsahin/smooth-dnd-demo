// const grabEvents = ['mousedown'];
// const moveEvents = ['mousemove'];
// const dropEvents = ['mouseup'];

import * as Utils from './utils';

class Container {
  constructor(element, props) {
    this.setProps = this.setProps.bind(this);
    this.init = this.init.bind(this);
    this.registerEvents = this.registerEvents.bind(this);
    this.deregisterEvents = this.deregisterEvents.bind(this);
    this.handleDragAtPosition = this.handleDragAtPosition.bind(this);
    this.onDragRelativePositionChanged = this.onDragRelativePositionChanged.bind(this);
    this.onScrollPositionChanged = this.onScrollPositionChanged.bind(this);
    this.containerElement && this.init(element, props);

    this.draggingInfo = null;
    this.removedIndex = null;
    this.addedIndex = null;
    this.visibleRect = null;
  }

  init(element, props) {
    this.containerElement = element;
    this.setProps(props);
    this.visibleRect = Utils.getVisibleRect(this.containerElement);
  }

  setProps(props) {
    this.props = Object.assign({}, Container.defaultProps, props);
    if (props.groupName && !props.acceptGroups) {
      props.acceptGroups = [props.groupName];
    }
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

  handleDragAtPosition(draggingInfo, positioninViewPort) {
    
  }

  onScrollPositionChanged() {
    
  }
}

Container.defaultProps = {
  groupName: '@@smooth-dnd-default-group@@',
  behaviour: 'move', // move | copy
  acceptGroups: ['@@smooth-dnd-default-group@@'],
  orientation: 'vertical', // vertical | horizontal
}