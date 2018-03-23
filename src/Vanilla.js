import React, { Component } from 'react';
import container from 'smooth-dnd';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			items: Array(50).fill().map((p, i) => i),
			items2: Array(50).fill().map((p, i) => i),
		};

		this.dragStyle = {
			height: '50px',
			textAlign: 'center',
			border: '1px solid #ccc',
			vertialAlign: 'middle',
			lineHeight: '50px',
			backgroundColor: 'white',
			marginTop: '0px'
		};
	}

	componentDidMount() {
		window.container = container(this.container, { groupName: '1', behaviour: 'copy' });
		window.container2 = container(this.container2, { groupName: '1', dragHandleSelector: '.handle' });
		window.container3 = container(this.container3, { groupName: '1', dragBeginDelay: 50, animationDuration: 300, dragClass: 'ghost' });
		window.container4 = container(this.container4, { orientation: 'horizontal' });
	}


	render() {
		const childs = this.state.items.map(p => (
			<div style={Object.assign({}, this.dragStyle, { height: `${50 + (Math.random() * 200)}px` })} key={p}>Draggable {p}</div>
		));

		const horizontalChild = this.state.items.slice(0, 10).map(p => (
			<div style={Object.assign({}, this.dragStyle, {height: '100px', width: '150px' })} key={p}>Draggable {p}</div>
		));

		// childs.push(<div style={Object.assign({}, this.dragStyle, { height: `0px` })} key={'asdasds'}></div>);
		// horizontalChild.push(<div style={Object.assign({}, this.dragStyle, { width: `0px` })} key={'qqqqqqqq'}></div>);


		return (
			<div>
				<div style={{ display: 'flex', flexDirection: 'row' }}>
					<div style={{ float: 'none', width: '510px', transform: 'scale3d(1,1,1)', backgroundColor: '#ccc', margin: '50px', border: '1px solid #ccc' }}>
						<div style={{ float: 'none', position: 'relative', height: '800px', overflowY: 'auto' }} ref={e => { this.container = e; }}>
							{childs}
						</div>
					</div>
					<div style={{ width: '510px', height: '800px', overflowY: 'auto', transform: 'scale3d(1,1,1)', backgroundColor: '#ccc', margin: '50px', border: '1px solid #ccc' }}>
						<div tabIndex="-1" id="a" style={{ float: 'none', position: 'relative' }} ref={e => { this.container2 = e; }}>
							{this.state.items.map(p => (
								<div style={Object.assign({}, this.dragStyle, { margin: '2px 50px', backgroundColor: '#abc', height: `${50 + (Math.random() * 0)}px` })} key={p}>
									<div className="handle" style={{float: 'left',width: '30px', height:'30px', backgroundColor: '#345'}}></div>	
									Draggable {p}
								</div>
							))}
						</div>
					</div>
					<div style={{ float: 'none', width: '510px', height: '800px', overflowY: 'auto', transform: 'scale3d(1,1,1)', backgroundColor: '#ccc', margin: '50px', border: '1px solid #ccc' }}>
						<div style={{ float: 'none', position: 'relative', paddingBottom: '100px' }} ref={e => { this.container3 = e; }}>
							{this.state.items.map(p => (
								<div style={Object.assign({}, this.dragStyle, { height: `${50 + (Math.random() * 0)}px` })} key={p}>Draggable {p}</div>
							))}
						</div>
					</div>
				</div>

				<div style={{ overflowX: 'auto', backgroundColor: '#ccc', border: '1px solid #ccc', margin: '100px' }}>
					<div ref={e => { this.container4 = e; }}>
						{horizontalChild}
					</div>
				</div>


				{/* <div style={{ position: 'fixed', top: '100px', left: '100px', bottom: '100px', width: '300px', overflowY: 'auto', backgroundColor: '#ccc', border: '1px solid #ccc' }}>
					<div style={{ float: 'none', position: 'relative' }} ref={e => { this.container = e; }}>
						{childs}
					</div>
				</div>
				<div style={{ marginLeft: '500px', width: '400px', paddingBottom: '200px', height: '800px', overflow: 'auto' }} ref={e => { this.container3 = e; }}>
					{this.state.items2.map(p => (
						<div style={Object.assign({}, this.dragStyle, { margin: '1px', height: `${50 + (Math.random() * 0)}px` })} key={p}>Draggable {p}</div>
					))}
				</div> */}
			</div>
		);
		// return (
		//   <div style={{ width: '510px', height: '800px', overflowY: 'auto', transform: 'scale3d(1,1,1)', backgroundColor: '#ccc', margin: '100px' }}>
		//     <div ref={e => this.container = e}>
		//       <div style={{ border: '1px solid #ccc', backgroundColor: '#fff', height: '30px' }}>D1</div>
		//       <div style={{ border: '1px solid #ccc', backgroundColor: '#fff', height: '100px' }}>D2</div>
		//       <div style={{ border: '1px solid #ccc', backgroundColor: '#fff', height: '30px' }}>D3</div>
		//     </div>
		//   </div>
		// )
	}
}