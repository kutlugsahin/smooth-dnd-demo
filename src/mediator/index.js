const hasClass = (element, classname) => {
  return element.classList.contains(classname);
}

const parent = (element, classname) => {
  let current = element;
  while (current) {
    if (hasClass(current, classname)) return current;
    current = current.parentElement;
  }
  return null;
}


class Mediator {
  constructor() {
    this.containers = {};
    this.registerListeners = this.registerListeners.bind(this);
    this.getDraggableInfo = this.getDraggableInfo.bind(this);
    this.handleGrab = this.handleGrab.bind(this);
    this.handleRelease = this.handleRelease.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleDragMove = this.handleDragMove.bind(this);
    this.setDraggingContext = this.setDraggingContext.bind(this);
    this.appyDrawingContext = this.appyDrawingContext.bind(this);
    this.getAnimationFrame = this.getAnimationFrame.bind(this)();

    this.draggingContext = {
      isGrabbed: false,
      isDragging: false,
      fromContainer: null,
      toContainer: null,
      payload: null,
      element: null,
      draggedElement: null,
      draggingDelta: {
        x: null,
        y: null,
      },
      position: {
        x: null, y: null
      }
    }

    this.registerListeners();
  }

  getAnimationFrame() {
    let id = null;
    return (clb) => {
      if (id || !clb) {
        window.cancelAnimationFrame(id);
        if (!clb) return;
      }
      id = window.requestAnimationFrame(() => {
        id = null;
        clb();
      });
    }
  }

  setDraggingContext(props) {
    const previousContext = this.draggingContext;
    this.draggingContext = Object.assign({}, this.draggingContext, props);
    this.appyDrawingContext(this.draggingContext, previousContext);
  }

  appyDrawingContext(ctx, prevCtx) {
    if (ctx.isDragging) {
      if (!ctx.draggedElement) {
        // if dragging element is not created
        const computedStyle = window.getComputedStyle(ctx.element);
        const elementRect = ctx.element.getBoundingClientRect();
        const width = computedStyle['width'];
        const height = computedStyle['height'];
        const floater = document.createElement('div');
        floater.style.width = width;
        floater.style.height = height;
        floater.style.position = 'fixed';
        floater.appendChild(ctx.element.cloneNode(true));
        document.body.appendChild(floater);
        this.draggingContext.draggedElement = floater;
        this.draggingContext.draggingDelta = {
          x: elementRect.x - ctx.position.x,
          y: elementRect.y - ctx.position.y
        }
      }

      this.getAnimationFrame(() => {
        this.draggingContext.draggedElement.style.left = ctx.position.x + ctx.draggingDelta.x + 'px';
        this.draggingContext.draggedElement.style.top = ctx.position.y + ctx.draggingDelta.y + 'px';
      })

      this.handleDragMove();

    } else if (prevCtx.draggedElement) {
      document.body.removeChild(prevCtx.draggedElement);
      this.getAnimationFrame(null);
    }
  }

  handleDragMove() {
    const { fromContainer, position } = this.draggingContext;
    const groupName = fromContainer.props.group || 'defaultGroup';
  }

  registerListeners() {
    window.document.body.addEventListener('mousedown', this.handleGrab);
    window.document.body.addEventListener('mouseup', this.handleRelease);
    window.document.body.addEventListener('mousemove', this.handleMove);
  }


  register(container, groupname = 'defaultGroup') {
    if (groupname) {
      if (!this.containers[groupname]) {
        this.containers[groupname] = [];
      }
      this.containers[groupname].push(container);
    }
  }

  getDraggableInfo(draggablewrapper) {
    const containerWrapper = parent(draggablewrapper, 'react-smooth-dnd-container');
    let container = null;
    for (let containergroup in this.containers) {
      const containers = this.containers[containergroup];
      for (let i = 0; i < containers.length; i++){
        const ctn = containers[i];
        if (ctn.container === containerWrapper) {
          container = ctn;
          break;
        }
      }
    }

    const wrappers = container.wrappers;
    for (let i = 0; i < wrappers.length; i++) {
      const wrapper = wrappers[i];
      if (wrapper === draggablewrapper) {
        return {
          container,
          payload: container.draggables[i].props.payload
        }
      }
    }

    return null;
  }

  handleGrab(e) {
    e.preventDefault();
    const draggableWrapper = parent(e.target, 'react-smooth-dnd-draggable-wrapper');
    if (draggableWrapper) {
      this.setDraggingContext({ isGrabbed: true, element: draggableWrapper });
    }
  }

  handleRelease(e) {
    this.setDraggingContext({
      isGrabbed: false,
      isDragging: false,
      fromContainer: null,
      toContainer: null,
      payload: null,
      element: null,
      draggedElement: null,
      draggingDelta: {
        x: null,
        y: null
      },
      position: {
        x: null, y: null
      }
    });
  }

  handleMove(e) {
    e.preventDefault();
    if (this.draggingContext.isGrabbed && !this.draggingContext.isDragging) {
      const { container, payload } = this.getDraggableInfo(this.draggingContext.element);
      this.setDraggingContext({
        fromContainer: container,
        isDragging: true,
        payload,
        position: {
          x: e.clientX,
          y: e.clientY
        }
      });
    } else if (this.draggingContext.isDragging) {
      this.setDraggingContext({
        position: {
          x: e.clientX,
          y: e.clientY
        }
      });
    }
  }
}

export default new Mediator();