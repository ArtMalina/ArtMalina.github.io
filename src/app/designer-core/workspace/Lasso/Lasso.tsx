import { Draggable, SelectingLasso } from '@designer-core/shared/wrappers/MouseStreams';
import { WrappedBlock } from '@designer-core/shared/wrappers/ConnectedBlock';

// import BoxBlock from '@designer-core/shared/blocks/Box';

import { storageServices, emptyStorageSelectors } from './services';

import { blockFactory } from '@designer-core/shared/config';
import { BlockType } from '@designer-core/shared/blocks/types';
import { BaseBoxProps } from '@designer-core/shared/types';


const Component = Draggable(
    SelectingLasso(
        WrappedBlock(blockFactory.getBlock<BaseBoxProps>(BlockType.Box))
    ),
    storageServices,
    emptyStorageSelectors,
    { modifiers: ['no-frame'] }
);

export default Component;
