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
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  registerListeners() {
    window.document.body.addEventListener('mousedown', this.onMouseDown);
    window.document.body.addEventListener('mouseup', this.mouseup);
    window.document.body.addEventListener('mousemove', this.mousemove);
  }


  register(container, groupname) {
    if (groupname) {
      if (!this.containers[groupname]) {
        this.containers[groupname] = [];
      }
      this.containers[groupname].push(container);
    }
  }

  onMouseDown(e) {
    
  }

  onMouseUp(e) {
    
  }

  onMouseMove(e) {
    
  }
}

export default new Mediator();