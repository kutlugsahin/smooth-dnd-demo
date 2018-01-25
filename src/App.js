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
      p.style.transition = "transform .3s ease";
    })

    this.containerRect = this.container.getBoundingClientRect();

    const f = (function(e) {
      const y = e.clientY - this.containerRect.top + this.container.scrollTop;

      if ((e.clientY > this.containerRect.top) || e.clientY < (this.containerRect.top + this.containerRect.height)) {
        let res = -1;
        let totalHeight = 0;
        for (let index = 0; index < this.items.length; index++){
          const element = this.items[index];
          if (y >= totalHeight && y <= totalHeight + element.clientHeight) {
            const diff = y - totalHeight;
            if (diff < element.clientHeight / 2 || this.lastSlidedIndex === index) {
              res = index;
            } else {
              res = index + 1;
            }
            break;
          } else {
            totalHeight += element.clientHeight;
          }
        }

        if (res !== this.lastSlidedIndex) {
          this.slideFromIndex(this.items, res, 50);
        }
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
              <div style={{overflow: 'hidden'}} ref={(elem) => {
                this.items[p.id] = elem;
              }} key={p.id}>
                <div className={'item'}>{p.text}</div>  
              </div>
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
