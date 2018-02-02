import * as Utils from './utils'

const grabEvents = ['mousedown'];
const moveEvents = ['mousemove'];
const releaseEvents = ['mouseup'];

class Mediator {
  constructor() {
    this.addGrabListeners = this.addGrabListeners.bind(this);
    this.addMoveListeners = this.addMoveListeners.bind(this);
    this.removeMoveListeners = this.removeMoveListeners.bind(this);
    this.addReleaseListeners = this.addReleaseListeners.bind(this);
    this.removeReleaseListeners = this.removeReleaseListeners.bind(this);
    this.getGhostElement = this.getGhostElement.bind(this);
    this.getDraggableInfo = this.getDraggableInfo.bind(this);
    this.handleDropAnimation = this.handleDropAnimation.bind(this);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.containers = [];
    this.dragListeningContainers = null;

    this.listenEvents();
  }

  registerContainer(container) {
    if (this.containers.indexOf(container) === -1) {
      this.containers.push(container);
    }
  }

  listenEvents() {
    this.addGrabListeners();
  }

  addGrabListeners() {
    grabEvents.forEach(e => {
      window.document.addEventListener(e, this.onMouseDown);
    });
  }
  
  addMoveListeners() {
    moveEvents.forEach(e => {
      window.document.addEventListener(e, this. onMouseMove);
    });
  }

  removeMoveListeners() {
    moveEvents.forEach(e => {
      window.document.removeEventListener(e, this.onMouseMove);
    });
  }

  addReleaseListeners() {
    releaseEvents.forEach(e => {
      window.document.addEventListener(e, this.onMouseUp);
    });
  }

  removeReleaseListeners() {
    releaseEvents.forEach(e => {
      window.document.removeEventListener(e, this.onMouseUp);
    });
  }

  getGhostElement(element, { x, y }) {
    const { left, top, right, bottom } = element.getBoundingClientRect();
    const midX = right - left / 2;
    const midY = bottom - top / 2;
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.pointerEvents = 'none';
    div.style.left = left + 'px';
    div.style.top = top + 'px';
    div.style.width = right - left + 'px';
    div.style.height = bottom - top + 'px';
    div.appendChild(element.cloneNode(true));

    return {
      ghost: div,
      centerDelta: { x: midX - x, y: midY - y },
      positionDelta: { left: left - x, top: top - y }
    };
  }

  getDraggableInfo(draggableElement) {
    const container = this.containers.filter(p => Utils.hasParent(draggableElement, p.containerElement))[0];
    const draggableIndex = container.draggables.indexOf(draggableElement);
    container.state.removedIndex = draggableIndex;
    return {
      container,
      element: draggableElement,
      payload: container.props.getChildPayload(draggableIndex),
      targetContainer: null,
      position: {x: 0, y: 0}
    }
  }

  handleDropAnimation(callback) {
    document.body.removeChild(this.ghostInfo.ghost);
    callback();
  }

  onMouseDown(e) {
    this.grabbedElement = Utils.getParent(e.target, '.smooth-dnd-draggable-wrapper');
    if (this.grabbedElement) {
      this.addMoveListeners();
      this.addReleaseListeners();
    }
  }

  onMouseUp(e) {
    this.removeMoveListeners();
    this.removeReleaseListeners();
    
    if (this.draggableInfo) {
      this.handleDropAnimation(() => {
        (this.dragListeningContainers || []).forEach(p => {
          // call handle drop function of the container if it is either source or target of drag event
          if (p === this.draggableInfo.container || p === this.draggableInfo.targetContainer) {
            p.handleDrop(this.draggableInfo);
            p.deregisterEvents();
          }
        });

        this.dragListeningContainers = null;
        this.grabbedElement = null;
        this.ghostInfo = null;
        this.draggableInfo = null;
      });
    }
  }

  onMouseMove(e) {
    e.preventDefault();
    if (!this.draggableInfo) {
      // first move after grabbing  draggable
      this.ghostInfo = this.getGhostElement(this.grabbedElement, {x: e.clientX, y: e.clientY});
      document.body.appendChild(this.ghostInfo.ghost);

      this.draggableInfo = this.getDraggableInfo(this.grabbedElement);
      this.draggableInfo.position = {
        x: e.clientX + this.ghostInfo.centerDelta.x,
        y: e.clientY + this.ghostInfo.centerDelta.y
      };
      this.dragListeningContainers = this.containers.filter(p => p.isDragRelevant(this.draggableInfo));
      this.dragListeningContainers.forEach(p => p.registerEvents());
    } else {
     // just update ghost position && draggableInfo position
      this.ghostInfo.ghost.style.left = `${e.clientX + this.ghostInfo.positionDelta.left}px`; 
      this.ghostInfo.ghost.style.top = `${e.clientY + this.ghostInfo.positionDelta.top}px`; 
      this.draggableInfo.position.x = e.clientX + this.ghostInfo.centerDelta.x;
      this.draggableInfo.position.y = e.clientY + this.ghostInfo.centerDelta.y;
    }

    this.dragListeningContainers.forEach(p => p.handleDrag(this.draggableInfo));
  }
}

export default new Mediator();