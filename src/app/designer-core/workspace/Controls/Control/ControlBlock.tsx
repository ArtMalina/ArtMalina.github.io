import React from 'react';
import './Control.scss';

// import ContainerBlock from '@designer-core/shared/blocks/Container';
import { BoxProps, BaseBoxProps } from '@designer-core/shared/types';


import { blockFactory } from '@designer-core/shared/config';
import { BlockType, ContainerProps } from '@designer-core/shared/blocks/types';

const ContainerBlock = blockFactory.getBlock<ContainerProps>(BlockType.Container);

export interface ControlProps extends BoxProps {
    name: string;
}

const ControlBlock = (props: React.PropsWithChildren<BaseBoxProps & { name: string }>) => {

    const { xy, size } = props;

    return <ContainerBlock { ...props } classModifiers={ props.classModifiers ? ['orange-bordered', ...props.classModifiers] : ['orange-bordered'] }>
        <div className="content-wrapper" style={ props.style }>
            <div style={ { fontSize: '14px' } }>{ props.name }</div>
        </div>
        { props.children }
        <div style={ { fontSize: '12px', position: 'absolute', bottom: 2, right: 2 } }>
            <div>sx={ size[0] }</div>
            <div>sy= { size[1] }</div>
        </div>
        <div style={ { fontSize: '12px', position: 'absolute', bottom: 2, left: 2 } }>
            <div>x={ xy[0] }</div>
            <div>y= { xy[1] }</div>
        </div>
    </ContainerBlock>;
};

export default ControlBlock;
