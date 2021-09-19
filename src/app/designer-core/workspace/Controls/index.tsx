import React, { useMemo, useEffect, useRef } from 'react';

import { IState, IControlData } from '@designer-core/shared/stateTypes';

import ResultControl, { Props as ControlProps } from './Control';
import ControlsContainer, { Props } from './Controls';

import { BehaviorSubject } from 'rxjs';
import { Position, ActiveLevels } from '@designer-core/shared/types';
import { useStorage, MsgService } from '@designer-core/shared/helpers/storage';
import { storageSelectors } from './Control/services';

export type ControlsCntProps = Props;


const MemoisedControl = React.memo(ResultControl);

export interface IControlsContainerProps {
    offsetPosition$: BehaviorSubject<Position>;
}

const ResultControls = (props: IControlsContainerProps) => {


    const { offsetPosition$ } = props;

    const emptyServicesRef = useRef<MsgService<IState, any>[]>([]);
    const storage = useStorage<IState>('stored-workspace', emptyServicesRef.current, storageSelectors);

    const innerControls$ = useMemo<BehaviorSubject<ControlProps[]>>(() => new BehaviorSubject<ControlProps[]>([]), []);

    useEffect(() => {

        const [oX, oY] = offsetPosition$.getValue();

        const controls = storage.get<null, IControlData[]>('controls') as IControlData[];

        innerControls$.next(
            controls.map<ControlProps>(
                t => ({
                    guid: t.guid,
                    name: `${t.uiType}-${t.guid}`,
                    activeLevel$: new BehaviorSubject<ActiveLevels>(ActiveLevels.None),
                    xy$: new BehaviorSubject([t.position[0], t.position[1]]),
                    position$: new BehaviorSubject([t.position[0], t.position[1]]),
                    size$: new BehaviorSubject([t.size[0], t.size[1]]),
                    style: t.style,
                    offsetPosition$: new BehaviorSubject([oX, oY]),
                })
            )
        );


    }, [storage, innerControls$, offsetPosition$]);

    return <ControlsContainer
        component={ MemoisedControl }
        controls$={ innerControls$ }
        offsetPosition$={ new BehaviorSubject([0, 0]) }
    />;
};

export default ResultControls;
