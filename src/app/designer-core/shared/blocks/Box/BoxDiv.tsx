import React from 'react'
import './BoxDiv.scss';
import { BaseBoxProps } from '@designer-core/shared/types';

const BoxDiv = (props: React.PropsWithChildren<BaseBoxProps>) => {
    const classModifiers = props.classModifiers || [];
    const classBlocks = props.classBlocks || [];
    const classElements = props.classElements || [];
    const handlers = props.handlers || {};
    const modifiers = [...classModifiers].map(t => `block--${t}`).join(' ');
    const block = classBlocks[0] || '';
    const elements = [...classElements].map(t => block && `${block}_${t}`).join(' ');
    const style = props.style || {};

    return <div
        { ...handlers }
        className={ `box-item box-item--div${block ? ' ' + block : ''}${modifiers ? ' ' + modifiers : ''}${elements ? ' ' + elements : ''}` }
        style={ { left: props.position[0], top: props.position[1], width: props.size[0], height: props.size[1], ...style } }
    >
        { props.children }
    </div>;
}

export default BoxDiv;
