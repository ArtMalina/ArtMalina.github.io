import React from 'react';
import { hot } from 'react-hot-loader';
import { NavLink } from 'react-router-dom';

import ContentWrapper from './content-wrapper';
import Header from './header';

import Designer from '@designer-core/App';

import './App.scss';

const ContentWithDesigner = ContentWrapper(Designer);

const App: React.FC = () => {
    return (
        <div className="App">
            <Header title="Designer">
                <NavLink activeClassName="link-item--active" exact activeStyle={ { color: 'orange' } } to="/">Home</NavLink> \\
                <NavLink activeClassName="link-item--active" activeStyle={ { color: 'orange' } } to="/about">About</NavLink> \\
                <NavLink activeClassName="link-item--active" activeStyle={ { color: 'orange' } } to="/workspace">Workspace</NavLink>
            </Header>
            <ContentWithDesigner />
        </div>
    );
}

export default hot(module)(App);
