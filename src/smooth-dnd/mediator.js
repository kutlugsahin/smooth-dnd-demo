import * as Utils from './utils'

const grabEvents = ['mousedown'];
const moveEvents = ['mousemove'];
const releaseEvents = ['mousedown'];

const draggableInfo = {
  element: null,
  container: null,
  payload: null,
  position: {x: 0, y: 0}
}

export class {
  constructor() {
    this.addGrabListeners = this.addGrabListeners.bind(this);
    this.addMoveListeners = this.addMoveListeners.bind(this);
    this.removeMoveListeners = this.removeMoveListeners.bind(this);
    this.addReleaseListeners = this.addReleaseListeners.bind(this);
    this.removeReleaseListeners = this.removeReleaseListeners.bind(this);

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
      window.document.addEventListener(e, onMouseDown);
    });
  }
  
  addMoveListeners() {
    moveEvents.forEach(e => {
      window.document.addEventListener(e, onMouseMove);
    });
  }

  removeMoveListeners() {
    moveEvents.forEach(e => {
      window.document.removeEventListener(e, onMouseMove);
    });
  }

  addReleaseListeners() {
    moveEvents.forEach(e => {
      window.document.addEventListener(e, onMouseUp);
    });
  }

  removeReleaseListeners() {
    moveEvents.forEach(e => {
      window.document.removeEventListener(e, onMouseUp);
    });
  }

  onMouseDown(e) {
    const draggable = Utils.getParent(e.target, 'smooth-dnd-draggable-wrapper');
    if (draggable) {
      container = this.containers.filter(p => hasParent(draggable, p.containerElement))[0];

      draggableInfo.container = container;
      draggableInfo.element = draggable;
      draggableInfo.payload = container.getChildPayload(container.containerElement.draggables.indexOf(draggable));
      draggableInfo.position.x = e.clientX;
      draggableInfo.position.y = e.clientY;

      this.addMoveListeners();
      this.addReleaseListeners();
      this.dragListeningContainers = this.containers.filter(p => p.isDragRelavent(draggableInfo));
    }
  }

  onMouseUp(e) {
    this.removeMoveListeners();
    this.removeReleaseListeners();
    this.dragListeningContainers.forEach(p => p.handleDrop(draggableInfo));
  }

  onMouseMove(e) {
    this.dragListeningContainers.forEach(p => p.handleDrag(draggableInfo));
  }
}