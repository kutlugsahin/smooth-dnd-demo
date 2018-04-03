import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './app.css';
import '../demo.css';
import pages from '../pages';

class App extends Component {
	constructor() {
		super();
		this.toggleNav = this.toggleNav.bind(this);
		this.renderMenu = this.renderMenu.bind(this);
		this.openCode = this.openCode.bind(this);
		this.state = {
			navOpen: true,
			selectedPage: pages[0].pages[0]
		};
	}
	render() {
		const Page = this.state.selectedPage.page;
		return (
			<div className="app">
				<div className={`nav-button ${this.state.navOpen ? 'open' : ''}`} onClick={this.toggleNav}>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
				<div className={`navigator ${this.state.navOpen ? '' : 'closed'}`}>
					<div className="navigator-content">
						<div className="navigator-header">
							<h3>react-smooth-dnd</h3>
							<div className="divider"></div>
						</div>
						<div>
							{this.renderMenu()}
						</div>
					</div>
				</div>
				<div className="content">
					<div className={`header ${this.state.navOpen ? 'open' : ''}`}>
						{this.state.selectedPage.title}
						<div className="source-code" onClick={this.openCode}>
							<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZml0PSIiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiIGZvY3VzYWJsZT0iZmFsc2UiPgogICAgPHBhdGggZmlsbD0ibm9uZSIgZD0iTTAgMGgyNHYyNEgwVjB6Ij48L3BhdGg+CiAgICA8cGF0aCBkPSJNOS40IDE2LjZMNC44IDEybDQuNi00LjZMOCA2bC02IDYgNiA2IDEuNC0xLjR6bTUuMiAwbDQuNi00LjYtNC42LTQuNkwxNiA2bDYgNi02IDYtMS40LTEuNHoiIGZpbGw9IiNGRkYiPjwvcGF0aD4KPC9zdmc+Cg==" alt="" />	
							<span>source</span>
						</div>
					</div>
					<div className="demo">
						<Page />
					</div>
				</div>
			</div>
		);
	}

	renderMenu() {
		return pages.map(section => {
			return (
				<div className="menu-section">
					<h4>{section.title}</h4>
					<ul>
						{section.pages.map(page => {
							return (
								<li className={`${this.state.selectedPage === page ? 'selected': ''}`} onClick={() => { this.setState({ selectedPage: page }); }}>{page.title}</li>
							);
						})}
					</ul>
				</div>
			);
		});
	}

	toggleNav() {
		this.setState({
			navOpen: !this.state.navOpen
		});
	}

	openCode() {
		const url = this.state.selectedPage.url;
		window.open(url, 'none');
	}
}

App.propTypes = {

};

export default App;