import { DataService, MsgService, StorageSelector, MsgSelector } from '@designer-core/shared/helpers/storage';
import { IState, IControlData } from '@designer-core/shared/stateTypes';
import { Position, GuidType } from '@designer-core/shared/types';

const positionService: DataService<IState, [GuidType, Position]> = (store) => ([guid, value]) => {
    store.state.controls$.next(
        store.state.controls$.getValue().map(t => t.guid === guid ? { ...t, position: [value[0], value[1]] } : { ...t })
    );
};
const sizeService: DataService<IState, [GuidType, Position]> = (store) => ([guid, value]) => {
    store.state.controls$.next(
        store.state.controls$.getValue().map(t => t.guid === guid ? { ...t, size: [value[0], value[1]] } : { ...t })
    );
};

export const storageServices: MsgService<IState, [GuidType, Position]>[] = [
    ['position', positionService],
    ['size', sizeService],
];


const dataSelector: StorageSelector<IState, null, IControlData[]> = (store) => (/* ident for other selectors */) => {
    return store.state.controls$.getValue();
};

export const storageSelectors: MsgSelector<IState, any, IControlData | IControlData[]>[] = [
    ['controls', dataSelector]
];
