import * as React from 'react';
import { MouseStreamContainer } from '@designer-core/shared/wrappers/MouseStreams';
import { ROOT_GUID } from '@designer-core/shared/types';
import ContainerBlock from '@designer-core/shared/blocks/Container';
import { blockFactory } from '@designer-core/shared/config';
import { BlockType, ContainerProps } from '@designer-core/shared/blocks/types';

interface IStartContainer {
    setRef: (ref: HTMLDivElement | null) => void;
}

const ContainerBlock2 = blockFactory.getBlock<ContainerProps>(BlockType.Container);

const StartWorkspaceBlock = MouseStreamContainer(ContainerBlock);

const Result = (props: React.PropsWithChildren<IStartContainer>) => {
    return <StartWorkspaceBlock { ...props } guid={ ROOT_GUID } classModifiers={ ['silver-bordered', 'relative-hidden'] }>
        { props.children }
    </StartWorkspaceBlock>
};

export default Result;
