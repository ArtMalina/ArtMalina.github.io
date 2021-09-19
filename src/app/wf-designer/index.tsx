import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import App from './App';

import { BrowserRouter } from 'react-router-dom';

const run = () => {
    ReactDOM.render(
        <BrowserRouter basename="./">
            <App />
        </BrowserRouter>,
        document.getElementById('root')
    );
};

export default run;
