import React, { Component } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';
import { applyDrag, generateItems } from './utils';
const groupStyle = {
	marginLeft: '50px',
	flex: 1
};

class DynamicContainers extends Component {
	constructor() {
		super();

		this.state = {
			items1: generateItems(15, (i) => ({ id: '1' + i, data: `Draggable 1 - ${i}` })),
			items2: generateItems(15, (i) => ({ id: '2' + i, data: `Draggable 2 - ${i}` })),
			popupOpen: false,
		};
	}
	render() {
		return (
			<div style={ { display: 'flex', justifyContent: 'stretch', marginTop: '50px', marginRight: '50px' } }>
				<div style={ groupStyle }>
					<Container getGhostParent={ () => document.body } groupName="1" getChildPayload={ i => this.state.items1[i] } onDrop={ e => this.setState({ items1: applyDrag(this.state.items1, e) }) }>
						{
							this.state.items1.map(p => {
								return (
									<Draggable key={ p.id }>
										<div className="draggable-item">
											{ p.data }
										</div>
									</Draggable>
								);
							})
						}
					</Container>
				</div>
				<div style={ groupStyle }>
					<div className="popup-container-button"
						onMouseEnter={ () => this.setState({ popupOpen: true }) }
						onMouseLeave={ () => this.setState({ popupOpen: false }) }
					>
						'HoverMe'
						{this.renderPopupContainer()}
					</div>
				</div>				
			</div>
		);
	}

	renderPopupContainer() {
		if (this.state.popupOpen) {
			return (
				<div className="popup-container">
					<Container getGhostParent={() => document.body} groupName="1" getChildPayload={ i => this.state.items2[i] } onDrop={ e => this.setState({ items2: applyDrag(this.state.items2, e) }) }>
						{
							this.state.items2.map(p => {
								return (
									<Draggable key={ p.id }>
										<div className="draggable-item">
											{ p.data }
										</div>
									</Draggable>
								);
							})
						}
					</Container>
				</div>
			);
		}

		return null;
	}
}

DynamicContainers.propTypes = {

};

export default DynamicContainers;