class Store {
  constructor() {
    this.containers = {};
    this.draggable = {
      
    }

    this.registerListeners = this.registerListeners.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMouse = this.onMouseUp.bind(this);
  }

  registerListeners() {
    window.document.body.addEventListener('mousedown', this.onMouseDown);
  }


  register(container, groupname) {
    if (groupname) {
      if (!this.containers[groupname]) {
        this.containers[groupname] = [];
      }
      this.containers[groupname].push(container);
    }
  }

  startDragging(draggable, fromcontainer, groupname) {
    
  }

  cancelDragging() {
    
  }

  completeDragging() {
    
  }
}