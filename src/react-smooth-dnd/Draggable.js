import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  wrapperClass,
  animationClass
} from '../smooth-dnd/constants';

class Draggable extends Component {  
  render() {
    return (
      <div className={`${wrapperClass} ${this.context.orientation} ${animationClass}`}>
        {this.props.children}
      </div>
    );
  }
}

Draggable.propTypes = {
  payload: PropTypes.object,
};

Draggable.contextTypes = {
  orientation: PropTypes.string
};

export default Draggable;