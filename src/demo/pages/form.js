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

const fields = [
	{ name: 'Full Name', type: 'full-name', render: () => <input type="text" /> },
	{ name: 'Email', type: 'email', render: () => <input type="text" /> },
	{ name: 'Text Area', type: 'text-area', render: () => <textarea /> },
	{
		name: 'Options', type: 'options', render: () => (
			<select>
				<option value="1">Option 1</option>	
				<option value="2" selected>Option 2</option>	
				<option value="3">Option 3</option>	
				<option value="4">Option 4</option>	
			</select>
		)},
];

class Form extends Component {
	constructor() {
		super();
		this.generateForm = this.generateForm.bind(this);
		this.onFieldSelected = this.onFieldSelected.bind(this);
		this.onDrop = this.onDrop.bind(this);

		this.state = {
			form,
			selectedId: null
		};
	}

	render() {
		return (
			<div className="form-demo">
				<div className="form-fields-panel">
					<Container behaviour="copy" groupName="form" getChildPayload={(index) => fields[index]}>
						{fields.map(p => {
							return (
								<Draggable>
									<div className="form-field">
										{p.name}
									</div>
								</Draggable>
							);
						})}
					</Container>
				</div>
				<div className="form">
					<Container style={{ paddingBottom: '200px' }} groupName="form" shouldAnimateDrop={({ payload }) => !payload}
						onDrop={this.onDrop}
						nonDragAreaSelector=".field">
						{this.generateForm(this.state.form)}
					</Container>
				</div>
			</div>
		);
	}

	onDrop(dropResult) {
		if (dropResult.removedIndex !== null) {
			return this.setState({ form: applyDrag(this.state.form, dropResult) });
		} else {
			const newForm = [...this.state.form];
			newForm.splice(dropResult.addedIndex, 0, {
				id: newForm.length,
				label: dropResult.payload.name,
				element: dropResult.payload.render()
			});

			this.setState({
				form: newForm,
				selectedId: newForm.length -1
			});
		}
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