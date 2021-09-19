import React, { useState, useEffect, useRef } from 'react';

import { IState, IControlData } from '@designer-core/shared/stateTypes';

import WorkspaceContainerBlock from './WorkspaceBlock';
import StartWorkspaceBlock from './WorkspaceContainer';
import ConnectedBlock from '@designer-core/shared/wrappers/ConnectedBlock';

import StoredResultControls from './Controls';
import StoredLasso from './Lasso';

import {
    Draggable,
    Resizable,
} from '@designer-core/shared/wrappers/MouseStreams';

import { ROOT_GUID, BoxProps, Position, ActiveLevels } from '@designer-core/shared/types';
import { BehaviorSubject } from 'rxjs';

import { storageServices as STORAGE_SERVICES, storageSelectors as STORAGE_SELECTORS } from './services';
import { MsgService, useStorage } from '@designer-core/shared/helpers/storage';


export type WorkspaceProps = BoxProps;


const WorkspaceBlock = ConnectedBlock(WorkspaceContainerBlock);

const Workspace = (props: React.PropsWithChildren<WorkspaceProps>) => {

    return (
        <WorkspaceBlock { ...props }>
            <StoredResultControls offsetPosition$={ props.offsetPosition$ } />
            <StoredLasso offsetPosition$={ props.offsetPosition$ } />
            { props.children }
        </WorkspaceBlock>
    );
};


const DraggableWorkspaceBox = Draggable(
    Resizable(Workspace, STORAGE_SERVICES, []),
    STORAGE_SERVICES, []
);


//  workspace inside fixed Container
const StoredWorkspace: React.FC = () => {

    const emptyServicesRef = useRef<MsgService<IState, any>[]>([]);
    const storage = useStorage<IState>('stored-workspace', emptyServicesRef.current, STORAGE_SELECTORS);

    const [cntRef, setCntRef] = useState<HTMLElement | null>(null);
    const [absOffset, setAbsOffset] = useState<Position | null>(null);
    const absOffsetRef = useRef<Position | null>(null);


    useEffect(() => {
        if (cntRef && !absOffsetRef.current) {
            const rect: ClientRect = cntRef.getBoundingClientRect();
            absOffsetRef.current = [rect.left, rect.top];
            console.log('cntRef effect!', absOffsetRef.current);
            setAbsOffset([rect.left, rect.top]);
        }
    }, [cntRef, absOffsetRef]);

    useEffect(() => {
        return () => {
            console.log('destroy workspace!');
        };
    }, []);

    const rootData = storage.get<null, IControlData>('data') as IControlData;
    const { size, position } = rootData;

    console.log('%c render inside workspace', 'color: yellow; background-color: red');

    return <StartWorkspaceBlock setRef={ setCntRef }>
        {
            absOffset &&
            <DraggableWorkspaceBox
                xy$={ new BehaviorSubject([position[0], position[1]]) }
                position$={ new BehaviorSubject([position[0], position[1]]) }
                size$={ new BehaviorSubject([size[0], size[1]]) }
                activeLevel$={ new BehaviorSubject<ActiveLevels>(ActiveLevels.None) }
                offsetPosition$={ new BehaviorSubject([absOffset[0], absOffset[1]]) }
                guid={ ROOT_GUID } />
        }
    </StartWorkspaceBlock>;
};

export default StoredWorkspace;
