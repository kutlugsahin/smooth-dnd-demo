import React, { Component } from 'react';
import { Container, Draggable, constants } from 'react-smooth-dnd';
import { applyDrag, generateItems } from './utils';

class DynamicContainers extends Component {
	constructor() {
		super();
		this.renderContainer = this.renderContainer.bind(this);

		this.state = {
			items1: generateItems(45, (i) => ({ id: '1' + i, data: `Draggable 1 - ${i}` })),
			items2: generateItems(25, (i) => ({ id: '2' + i, data: `Draggable 2 - ${i}` })),
			items3: generateItems(25, (i) => ({ id: '3' + i, data: `Draggable 3 - ${i}` })),
			items4: generateItems(25, (i) => ({ id: '4' + i, data: `Draggable 4 - ${i}` })),
			popup1Open: false,
			popup2Open: false,
		};
	}

	renderContainer(listName, getList, autoScroll = true) {
		return (
			<div className={`dynamic-container-holder`}>
				<Container autoScrollEnabled={autoScroll} getGhostParent={() => document.body} groupName="1" getChildPayload={i => getList()[i]} onDrop={e => this.setState({ [listName]: applyDrag(getList(), e) })}>
					{
						getList().map(p => {
							return (
								<Draggable key={p.id}>
									<div className="draggable-item">
										{p.data}
									</div>
								</Draggable>
							);
						})
					}
				</Container>
			</div>
		)
	}

	render() {
		return (
			<div style={{ display: 'flex', justifyContent: 'stretch', height: '100%' }}>
				<div className="dynamic-left-pane">
					{this.renderContainer('items1', () => this.state.items1)}
				</div>
				<div className="dynamic-right-pane">
					<div className="dynamic-menu-container">
						<div className="popup-container-button"
							onMouseEnter={() => this.setState({ popup1Open: true })}
							onMouseLeave={() => this.setState({ popup1Open: false })}
						>
							Make Container Visible
							<div className={`popup-container ${this.state.popup1Open ? 'open' : ''}  ${constants.preventAutoScrollClass}`}>
								{this.renderContainer('items2', () => this.state.items2)}
							</div>
						</div>
						<div className="popup-container-button"
							onMouseEnter={() => this.setState({ popup2Open: true })}
							onMouseLeave={() => this.setState({ popup2Open: false })}
						>
							Mount New Container
							{this.state.popup2Open ? <div className={`popup-container ${this.state.popup2Open ? 'open' : ''}`}>
								{this.renderContainer('items3', () => this.state.items3)}
							</div> : null}
						</div>
					</div>
					<div className="dynamic-right-content">
						{this.renderContainer('items4', () => this.state.items4)}
					</div>
				</div>
			</div>
		);
	}
}

DynamicContainers.propTypes = {

};

export default DynamicContainers;