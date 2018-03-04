import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Vanilla from './Vanilla';
import Nested from './Nested';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
