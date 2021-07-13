import React, { useEffect, useMemo } from 'react';
import StoredLasso from './Lasso';
import { SELECTING_FRAME_GUID, ActiveLevels, Position } from '@designer-core/shared/types';
import { BehaviorSubject, Observable } from 'rxjs';
import { IControlData } from '@designer-core/shared/stateTypes';

import { storageSelectors, storageServices } from './services';
import { useStorage } from '@designer-core/shared/helpers/storage';


export interface Props {
    offsetPosition$: BehaviorSubject<Position>;
}


const ResultLasso: React.FC<Props> = (props: Props) => {

    const { offsetPosition$ } = props;
    const storage = useStorage('root-for-lasso', storageServices, storageSelectors);

    const activeLevel$ = useMemo(() => new BehaviorSubject<ActiveLevels>(ActiveLevels.None), []);
    const position$ = useMemo(() => new BehaviorSubject<Position>([0, 0]), []);
    const xy$ = useMemo(() => new BehaviorSubject<Position>([0, 0]), []);
    const size$ = useMemo(() => new BehaviorSubject<Position>([0, 0]), []);

    useEffect(() => {
        console.log('%c init effect inside result-lasso ', 'color: red; background-color: silver;');
        const [startX, startY] = offsetPosition$.getValue();
        const root$ = storage.get('observerable-data') as Observable<IControlData>;
        const rootSub = root$.subscribe(({ position }) => offsetPosition$.next([startX + position[0], startY + position[1]]));
        return () => rootSub.unsubscribe();
    }, [storage, offsetPosition$]);

    return <StoredLasso
        guid={ SELECTING_FRAME_GUID }
        activeLevel$={ activeLevel$ }
        offsetPosition$={ offsetPosition$ }
        position$={ position$ }
        xy$={ xy$ }
        size$={ size$ } />
};

export default ResultLasso;
