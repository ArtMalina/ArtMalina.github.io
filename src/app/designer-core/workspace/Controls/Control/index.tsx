import React from 'react';

import ControlBlock, { ControlProps } from './ControlBlock';

import { Draggable, Magnetable, Selectable, Resizable } from '@designer-core/shared/wrappers/MouseStreams';

import ConnectedBlock from '@designer-core/shared/wrappers/ConnectedBlock';
import { BaseBoxProps } from '@designer-core/shared/types';

// import BoxBlock from '@designer-core/shared/blocks/Box';

import { blockFactory } from '@designer-core/shared/config';
import { BlockType } from '@designer-core/shared/blocks/types';


import { storageServices, storageSelectors } from './services';


export type Props = ControlProps;

type BaseNamedBoxProps = BaseBoxProps & { name: string };

const BoxBlock = blockFactory.getBlock<BaseNamedBoxProps>(BlockType.Box);


const DisplayedControlBlock = (props: BaseNamedBoxProps) => {
    return <BoxBlock { ...props } >
        <ControlBlock { ...props } position={ [0, 0] } />
    </BoxBlock>;
};


const ResultControl = Draggable(
    Magnetable(
        Selectable(
            Resizable(
                ConnectedBlock(DisplayedControlBlock as React.ComponentType<BaseBoxProps>),
                storageServices,
                []
            )
        ),
        storageServices,
        storageSelectors
    ),
    storageServices,
    []
);

export default ResultControl;
