import React, { useMemo } from 'react';
import SelectedFrameBlock from '@designer-core/shared/blocks/SelectedFrame';
import { BoxProps, DragFrameProps, Position, BaseBoxProps } from '@designer-core/shared/types';

import { WrappedBlock } from '@designer-core/shared/wrappers/ConnectedBlock';
import { BehaviorSubject } from 'rxjs';

const FrameBox = WrappedBlock(SelectedFrameBlock as React.ComponentType<BaseBoxProps>);

const SelectedFrameWrapper = <TProps extends BoxProps>(Component: React.ComponentType<TProps>) => {
    const ResultBlock = (props: React.PropsWithChildren<DragFrameProps & TProps>) => {
        const emptyPosition$ = useMemo(() => new BehaviorSubject<Position>([0, 0]), []);
        return <FrameBox { ...props } position$={ emptyPosition$ }>
            <Component { ...props }>{ props.children }</Component>
        </FrameBox>;
    };
    return ResultBlock;
}

export default SelectedFrameWrapper;
