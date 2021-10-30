import React from 'react'
import { BoxProps, DragFrameProps } from '@designer-core/shared/types';
import './Anchor.scss';

const AnchorDiv = <TProps extends BoxProps>(props: React.PropsWithChildren<DragFrameProps & TProps>) => {
    let [marginLeft, marginTop] = [0, 0];
    const handlers = props.handlers || {};
    const modifiers = props.classModifiers || [];
    const icon = props.icon;
    return (
        <div
            { ...handlers }
            className={ `block_anchor${modifiers.length ? ' ' + modifiers.map(t => `block_anchor--${t}`).join(' ') : ''}` }
            style={ { marginLeft, marginTop } }>
            { icon }
        </div>
    );
}

export default AnchorDiv;
