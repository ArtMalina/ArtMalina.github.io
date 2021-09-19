import React from 'react'
import { BaseBoxProps, DragFrameBlockProps, ActiveLevels } from '@designer-core/shared/types';

const SelectedFrameBlock = <TProps extends BaseBoxProps>(props: React.PropsWithChildren<DragFrameBlockProps & TProps>) => {

    const propsLevel = props.activeLevel || ActiveLevels.None;

    let isFramed =
        propsLevel === ActiveLevels.InGroup
        || propsLevel === ActiveLevels.MoveInGroup
        || propsLevel === ActiveLevels.HoverInGroup
        || propsLevel === ActiveLevels.MoveByHandInGroup;

    const delta = isFramed ? 10 : 0;
    const width = props.size[0] + delta;
    const height = props.size[1] + delta;

    let [marginLeft, marginTop] = [-delta / 2, -delta / 2];

    return <div className={ `block_frame block_frame--${isFramed ? 'selected' : 'not-selected'}` } style={ { width, height, marginLeft, marginTop } }>
        { props.children }
    </div>
}

export default SelectedFrameBlock;
