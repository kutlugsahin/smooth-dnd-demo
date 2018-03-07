import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './demo.css';
import pages from './pages';

class Navigator extends Component {
  render() {
    return (
      <ul className="demo-navigator">
        {pages.map((p,i) => <li key={i}><button onClick={() => this.props.onPage(p.type)}>{p.title}</button></li>)}
      </ul>
    );
  }
}

Navigator.propTypes = {

};

export default Navigator;