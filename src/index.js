import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Vanilla from './Vanilla';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Vanilla />, document.getElementById('root'));
registerServiceWorker();
