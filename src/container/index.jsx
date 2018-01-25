import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Draggable from '../draggable';

class Container extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const style = {
      ...this.props.style
    };
    const className = `${this.props.className || ''} react-smooth-dnd-container`;

    return (
      <div
        ref={(elem) => { this.container = elem; }}
        style={style}
        className={className}>
        { this.props.items.map(this.props.itemRenderer) }
      </div>
    )
  }
}

Container.propTypes = {
  orientation: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.instanceOf(Draggable)),
  style: PropTypes.shape(),
  className: PropTypes.string,
  itemRenderer: PropTypes.func
}

Container.defaultProps = {
  orientation: 'vertical',
  items: []
}

export default Container;