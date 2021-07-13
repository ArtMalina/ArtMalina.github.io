import React, { useRef, useEffect } from 'react';
import './Block.scss';
import { ContainerProps } from '../types';

const ContainerDiv = (props: React.PropsWithChildren<ContainerProps>) => {
    const classModifiers = props.classModifiers || [];
    const handlers = props.handlers || {};
    const style = props.style || {};
    const modifiers = classModifiers.map(t => `block--${t}`).join(' ');
    const currentRef = useRef(null);
    useEffect(() => {
        if (currentRef.current && props.setRef) {
            props.setRef(currentRef.current);
        }
    }, [currentRef, props]);

    return <div
        { ...handlers }
        ref={ currentRef }
        className={ `container block ${modifiers}` }
        style={ { ...style } }
    >
        { props.children }
    </div>;
};

export default ContainerDiv;
