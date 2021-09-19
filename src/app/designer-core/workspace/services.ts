import { DataService, StorageSelector, MsgService, MsgSelector } from '@designer-core/shared/helpers/storage';
import { IState, IControlData } from '@designer-core/shared/stateTypes';
import { Position, GuidType } from '@designer-core/shared/types';

const positionService: DataService<IState, [GuidType, Position]> = (store) => ([_guid, value]) => {
    const root = store.state.root$.getValue();
    store.state.root$.next({ ...root, position: [value[0], value[1]] });
};
const sizeService: DataService<IState, [GuidType, Position]> = (store) => ([_guid, value]) => {
    const root = store.state.root$.getValue();
    store.state.root$.next({ ...root, size: [value[0], value[1]] })
};


const dataSelector: StorageSelector<IState, null, IControlData> = (store) => (/* ident for other selectors */) => {
    return store.state.root$.getValue();
};




export const storageServices: MsgService<IState, any>[] = [
    ['position', positionService],
    ['size', sizeService],
];

export const storageSelectors: MsgSelector<IState, any, any>[] = [
    ['data', dataSelector]
];
