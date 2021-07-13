import { RendererType, BlockType, ContainerProps } from './types';

import { renderBlockTypes as renderAnchorTypes } from './Anchor';
import { renderBlockTypes as renderBoxTypes } from './Box';
import { renderBlockTypes as renderContainerTypes } from './Container';
import { renderBlockTypes as renderDragFrameTypes } from './DragFrame';
import { renderBlockTypes as renderMagnetCornerTypes } from './MagnetCornerFrame';
import { renderBlockTypes as renderMagnetBorderTypes } from './MagnetFrame';
import { renderBlockTypes as renderSelectedFrameTypes } from './SelectedFrame';


type RenderTypeBlock<T> = [RendererType, React.ComponentType<T>];


type BlockByType<T> = { [key: string]: RenderTypeBlock<T>[] };

const blocks: BlockByType<any> = {
    [BlockType.Anchor]: renderAnchorTypes,
    [BlockType.Box]: renderBoxTypes,
    [BlockType.Container]: renderContainerTypes,
    [BlockType.DragFrame]: renderDragFrameTypes,
    [BlockType.MagnetCornerFrame]: renderMagnetCornerTypes,
    [BlockType.MagnetBorderFrame]: renderMagnetBorderTypes,
    [BlockType.SelectedFrame]: renderSelectedFrameTypes,
};

const EmptyBlock: React.ComponentType = () => null;

export interface IBlockFactory {
    getBlock<TProps>(blockType: BlockType): React.ComponentType<TProps>;
    getBlock(blockType: BlockType): React.ComponentType<ContainerProps>;
}

export const factory = (renderType: RendererType): IBlockFactory => {
    return {
        getBlock: <T>(blockType: BlockType): React.ComponentType<T> => {
            const typedBlocks: RenderTypeBlock<T>[] = blocks[blockType] || [renderType, EmptyBlock] as RenderTypeBlock<T>;
            const typedBlock = typedBlocks[0][1];
            return typedBlock;
            // const blockRenders = blocks
            //     .filter(([_blockType]) => _blockType === blockType)
            //     .map<RenderTypeBlock<T>>(
            //         ([_blockType, renderTypes]) =>
            //             renderTypes.find(([_renderType]) => _renderType === renderType) || [renderType, EmptyBlock] as RenderTypeBlock<T>
            //     );
            // return blockRenders[0] ? blockRenders[0][1] : EmptyBlock;
        }
    };
}; 
