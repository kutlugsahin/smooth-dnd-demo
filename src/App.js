import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.elements = Array(100).fill().map((p, i) => ({
      id: i,
      text: "element " + i
    }));
    this.items = [];
    this.lastSlidedIndex = -1;
  }

  componentDidMount() {
    this.container.addEventListener('scroll', (e) => {
      console.log(this.container.scrollTop);
      // console.log(this.items[0].getBoundingClientRect());
    });

    this.items.forEach(p => {
      p.style.transition = "transform .3 ease";
    })

    this.containerRect = this.container.getBoundingClientRect();

    const f = (function(e) {
      const y = e.clientY - this.containerRect.top + this.container.scrollTop;

      if ((e.clientY > this.containerRect.top) || e.clientY < (this.containerRect.top + this.containerRect.height)) {
        let res = -1;
        this.items.reduce((totalHeight, element, index) => {
          if (y >= totalHeight && y <= totalHeight + element.clientHeight) {
            const diff = y - totalHeight;
            if (diff < element.clientHeight / 2) {
              res = index;
            } else {
              res = index + 1;
            }
          } else {
            return totalHeight + element.clientHeight;
          }
        }, 0);

        this.slideFromIndex(this.items, res, 200);
      }
    }).bind(this);
    window.addEventListener('mousemove', f)
  }
  

  render() {
    return (
      <div className="App">
        <div className="container" ref={e => this.container = e}>
          {
            this.elements.map(p => (
              <div ref={(elem) => {
                this.items[p.id] = elem;
              }} className={'item'} key={p.id}>{p.text}</div>
            ))
          }  
        </div>
      </div>
    );
  }

  slideFromIndex(elements, index, height) {
    this.lastSlidedIndex = index;
    window.requestAnimationFrame(e => {
      elements.forEach((e, i) => {
        if (i < index) {
          e.style.transform = "translateY(0px)";
        }
        else {
          e.style.transform = `translateY(${height}px)`;
        }
      });
    })  
  }
}

export default App;
