import React, { Component } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';
import { applyDrag, generateItems } from './utils';


class DropZone extends Component {
	constructor() {
		super();
		this.onDrop = this.onDrop.bind(this);
		this.dragEnter = this.dragEnter.bind(this);
		this.dragLeave = this.dragLeave.bind(this);

		this.state = {
			zones: [1, 0, 0, 0],
			classes: ['', '', '', '']
		};
	}
	render() {
		return (
			<div className="drop-zone">
				{this.state.zones.map((p, i) => {
					return (
						<div className={`drop-zone-container ${this.state.classes[i]}`}>
							<Container
								style={{ height: '100%' }}
								groupName="1"
								behaviour="drop-zone"
								onDrop={e => this.onDrop(i, e)}
								onDragEnter={() => this.dragEnter(i)}
								onDragLeave={() => this.dragLeave(i)}>
								{p ? (
									<Draggable>
										<div className="drop-zone-draggable">
											Draggable
									</div>
									</Draggable>
								) : null}
							</Container>
						</div>
					);
				})}
			</div>
		);
	}

	onDrop(containerIndex, dropresult) {
		const { addedIndex, removedIndex, payload } = dropresult;
		if (addedIndex !== null || removedIndex !== null) {
			const zones = [...this.state.zones];
			if (removedIndex !== null) {
				zones[containerIndex] = 0;
			}
			if (addedIndex !== null) {
				zones[containerIndex] = 1;
			}
			this.setState({
				zones
			});
		}

		const classes = [...this.state.classes];
		classes[containerIndex] = '';
		this.setState({
			classes
		});
	}

	dragEnter(i) {
		const classes = [...this.state.classes];
		classes[i] = 'hover';
		this.setState({
			classes
		});
	}

	dragLeave(i) {
		const classes = [...this.state.classes];
		classes[i] = '';
		this.setState({
			classes
		});
	}
}

export default DropZone;