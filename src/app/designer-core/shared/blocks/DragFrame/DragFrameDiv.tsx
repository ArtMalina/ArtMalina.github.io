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

    return <div className={ `block_frame block_frame--${isFrame ? 'drag' : 'no-drag'}` } style={ updStyle }>
        { props.children }
    </div>
}

export default DragFrameDiv;
