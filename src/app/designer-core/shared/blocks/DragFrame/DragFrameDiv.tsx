import React from 'react'
import { DragFrameBlockProps, ActiveLevels, BaseBoxProps } from '@designer-core/shared/types';

const DragFrameDiv = <TProps extends BaseBoxProps>(props: React.PropsWithChildren<DragFrameBlockProps & TProps>) => {

    const { size, activeLevel } = props;

    const isFrame = activeLevel !== ActiveLevels.None && activeLevel !== ActiveLevels.InGroup;

    const delta = isFrame ? 20 : 0;

    const [width, height] = [size[0] + delta, size[1] + delta];
    const [marginLeft, marginTop] = [-delta / 2, -delta / 2];

    const borderWidth = 4;

    const updStyle: React.CSSProperties = {
        width,
        height,
        marginLeft,
        marginTop,
        borderWidth,
        padding: isFrame ? delta / 2 - borderWidth : 0,
    };

    console.log('drag base frame', props);

    const modifiers = props.classModifiers ? props.classModifiers.map(t => `block_frame--${t}`).join(' ') : '';

    return <div className={ `block_frame block_frame--${isFrame ? 'drag' : 'no-drag'}${modifiers ? ' ' + modifiers : ''}` } style={ updStyle }>
        { isFrame && <div className="block_frame__border--crop" style={ { position: 'absolute', marginLeft, marginTop: delta / 2, width: size[0] + delta / 2 + 2, height: size[1] - delta, borderWidth, borderStyle: 'none solid' } }></div> }
        { isFrame && <div className="block_frame__border--crop" style={ { position: 'absolute', marginTop, marginLeft: delta / 2, height: size[1] + delta / 2 + 2, width: size[0] - delta, borderWidth, borderStyle: 'solid none' } }></div> }
        { props.children }
    </div>
}

export default DragFrameDiv;
