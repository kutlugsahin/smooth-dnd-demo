import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Tryout from './Tryout';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Tryout />, document.getElementById('root'));
registerServiceWorker();
