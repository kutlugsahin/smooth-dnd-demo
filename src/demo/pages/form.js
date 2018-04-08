import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container, Draggable } from 'react-smooth-dnd';
import { applyDrag } from './utils';

const form = [
  {
    id: 0,
    element: <h2>Form Header</h2>
  }, {
    id: 1,
    label: 'Full Name',
    element: <div className="field-group"><input type="text" /><input type="text" /></div>
  }, {
    id: 2,
    label: 'Email',
    element: <input type="email" />
  }, {
    id: 3,
    label: 'Address',
    element: <textarea name="address" id="" cols="30" rows="10" />
  },
  {
    id: 5,
    label: 'Radio',
    element: (
      <div>
        <div><label><input type="radio" name="r" /> option 1</label></div>
        <div><label><input type="radio" name="r" /> option 2</label></div>
        <div><label><input type="radio" name="r" /> option 3</label></div>
        <div><label><input type="radio" name="r" /> option 4</label></div>
        <div><label><input type="radio" name="r" /> option 5</label></div>
      </div>
    )
  }, {
    id: 4,
    label: 'Options',
    element: (<select>
      <option value="1">Option 1</option>
      <option value="2" selected>Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
    </select>)
  }
  , {
    id: 6,
    label: 'Checkbox',
    element: (
      <div>
        <div><label><input type="checkbox" name="r" /> option 1</label></div>
        <div><label><input type="checkbox" name="r" /> option 2</label></div>
        <div><label><input type="checkbox" name="r" /> option 3</label></div>
        <div><label><input type="checkbox" name="r" /> option 4</label></div>
        <div><label><input type="checkbox" name="r" /> option 5</label></div>
      </div>
    )
  }, {
    id: 7,
    element: (
      <div>
        <button className="form-submit-button">Submit</button>
      </div>
    )
  }
];

class Form extends Component {
  constructor() {
    super();
    this.generateForm = this.generateForm.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {
      form
    };
  }

  render() {
    return (
      <div className="form-demo">
        <div className="form">
          <Container
            style={{ paddingBottom: '200px' }}
            dragClass="form-ghost"
            dropClass="form-ghost-drop"
            onDrop={this.onDrop}
            nonDragAreaSelector=".field">
            {this.generateForm(this.state.form)}
          </Container>
        </div>
      </div>
    );
  }

  onDrop(dropResult) {
    return this.setState({ form: applyDrag(this.state.form, dropResult) });
  }

  generateForm(form) {
    return form.map((item) => {
      return (
        <Draggable key={item.id}>
          <div
            className={`form-line`}>
            <div className="label">
              <span>{item.label}</span>
            </div>
            <div className="field">
              {item.element}
            </div>
          </div>
        </Draggable >
      );
    });
  }
}

export default Form;