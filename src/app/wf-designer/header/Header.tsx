import React from 'react';
import './Header.scss';

export type HeaderProps = {
    title: string;
};

const Header: React.FC<HeaderProps> = (props) => {
    return (
        <nav>
            <div className="flex-item">
                <h1>{ props.title }</h1>
            </div>
            <div className="links-container">
                { React.Children.map(props.children, (Child) => <div className="link-item">{ Child }</div>) }
            </div>
        </nav>
    );
};

export default Header;
