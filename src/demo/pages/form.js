import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container, Draggable } from 'react-smooth-dnd';
import { applyDrag } from './utils';

const form = [
	{
		id: 0,
		element: <h2>Form Header</h2>
	},{
		id: 1,
		label: 'Full Name',
		element: <input type="text" />
	}, {
		id: 2,
		label: 'Email',
		element: <input type="email" />
	}, {
		id: 3,
		label: 'Address',
		element: <textarea name="address" id="" cols="30" rows="10" />
	}
];

class Form extends Component {
	constructor() {
		super();
		this.generateForm = this.generateForm.bind(this);
		this.onFieldSelected = this.onFieldSelected.bind(this);

		this.state = {
			form,
			selectedId: null
		};
	}

	render() {
		return (
			<div className="form">
				<Container style={{paddingBottom: '200px'}}
					onDrop={e => this.setState({form: applyDrag(this.state.form, e)})}	
					nonDragAreaSelector=".field">
					{this.generateForm(this.state.form)}
				</Container>
			</div>
		);
	}

	generateForm(form) {
		return form.map((item, index) => {
			return (
				<Draggable key={item.id}>
					<div
						className={`form-line${this.state.selectedId === item.id ? ' selected' : ''}`}
						onMouseDown={e => this.onFieldSelected(item.id)}>
						<div className="label">
							<span>{item.label}</span>
						</div>
						<div className="field">
							{item.element}
						</div>
					</div>
				</Draggable>
			);
		});
	}

	onFieldSelected(id) {
		this.setState({
			selectedId: id
		});
	}
}


Form.propTypes = {

};


export default Form;