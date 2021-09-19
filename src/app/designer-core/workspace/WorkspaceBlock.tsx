import React from 'react';

import { BaseBoxProps } from '@designer-core/shared/types';
// import ContainerBlock from '@designer-core/shared/blocks/Container';
// import BoxBlock from '@designer-core/shared/blocks/Box';
import { blockFactory } from '@designer-core/shared/config';
import { BlockType, ContainerProps } from '@designer-core/shared/blocks/types';

const BoxBlock = blockFactory.getBlock<BaseBoxProps>(BlockType.Box);
const ContainerBlock = blockFactory.getBlock<ContainerProps>(BlockType.Container);

const WorkspaceBlock = (props: React.PropsWithChildren<BaseBoxProps>) => {

    const { size, xy } = props;

    return (
        !!size[0] && !!size[1]
            ? <BoxBlock { ...props } classModifiers={ ['silver-bordered'] }>
                <ContainerBlock style={ { width: size[0], height: size[1] } }>
                    { props.children }
                </ContainerBlock>
                <div style={ { fontSize: '12px', position: 'absolute', bottom: 2, right: 2 } }>
                    <div>sx={ size[0] }</div>
                    <div>sy= { size[1] }</div>
                </div>
                <div style={ { fontSize: '12px', position: 'absolute', bottom: 2, left: 2 } }>
                    <div>x={ xy[0] }</div>
                    <div>y= { xy[1] }</div>
                </div>
            </BoxBlock>
            : null
    );
};

export default WorkspaceBlock;
