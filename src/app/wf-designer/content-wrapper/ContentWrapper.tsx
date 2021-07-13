import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './home';
import About from './about';

const ContentWrapper = (WorkspaceComponent: React.ComponentType): React.FC =>
    () => {
        return (
            <div className="container content-box">
                <Switch>
                    <Route exact path="/" component={ Home } />
                    <Route exact path="/about" component={ About } />
                    <Route exact path="/workspace" component={ WorkspaceComponent } />
                </Switch>
            </div>
        );
    };

export default ContentWrapper;
