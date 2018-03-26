import React, { Component } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';
import { applyDrag } from './utils';

function generateItems(count, creator) {
	return Array(count).fill().map(creator);
}

const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

class Cards extends Component {
	constructor() {
		super();

		this.onColumnDrop = this.onColumnDrop.bind(this);
		this.onCardDrop = this.onCardDrop.bind(this);
		this.state = {
			items1: generateItems(5, (_, i) => ({ id: '1' + i, data: `Draggable 1 - ${i}` })),
			items2: generateItems(5, (_, i) => ({ id: '2' + i, data: `Draggable 2 - ${i}` })),
			items3: generateItems(5, (_, i) => ({ id: '3' + i, data: `Draggable 3 - ${i}` })),
			items4: generateItems(5, (_, i) => ({ id: '4' + i, data: `Draggable 4 - ${i}` })),

			scene: {
				type: 'container',
				props: {
					orientation: 'horizontal'
				},
				children: generateItems(4, (_, i) => ({
					id: `column${i}`,
					type: 'container',
					props: {
						orientation: 'vertical',
						className: 'card-container'
					},
					children: generateItems(+(Math.random() * 10).toFixed() + 5, (_, j) => ({
						type: 'draggable',
						id: `${i}${j}`,
						props: {
							className: 'card'
						},
						data: lorem.slice(0, Math.floor(Math.random() * 150) + 30)
					}))
				}))
			}
		};
	}


	render() {
		return (
			<div className="card-scene">
				<Container orientation="horizontal" onDrop={this.onColumnDrop}>
					{this.state.scene.children.map((column) => {
						return (
							<Draggable key={column.id}>
								<div className={column.props.className}>
									<div>ToDo</div>	
									<Container {...column.props} groupName="col"
										onDrop={e => this.onCardDrop(column.id, e)}
										getChildPayload={index => column.children[index]}>
										{column.children.map(card => {
											return (
												<Draggable key={card.id}>
													<div {...card.props}>
														<p>
															{card.data}
														</p>	
													</div>
												</Draggable>
											);
										})}
									</Container>
								</div>
							</Draggable>
						);
					})}
				</Container>
			</div>
		);
	}


	onColumnDrop(dropResult) {
		const scene = Object.assign({}, this.state.scene);
		scene.children = applyDrag(scene.children, dropResult);
		this.setState({
			scene
		});
	}	

	onCardDrop(columnId, dropResult) {
		const scene = Object.assign({}, this.state.scene);
		const column = scene.children.find(p => p.id === columnId);
		const columnIndex = scene.children.indexOf(column);

		const newColumn = Object.assign({}, column);
		newColumn.children = applyDrag(newColumn.children, dropResult);
		scene.children.splice(columnIndex, 1, newColumn);

		this.setState({
			scene
		});
	}
}

export default Cards;