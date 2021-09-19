import { StorageSelector, MsgSelector, MsgService } from '@designer-core/shared/helpers/storage';
import { IState, IControlData } from '@designer-core/shared/stateTypes';
import { BehaviorSubject } from 'rxjs';


const dataSelector: StorageSelector<IState, null, BehaviorSubject<IControlData>> = (store) => (/* ident for other selectors */) => {
    return store.state.root$;
};

export const storageServices: MsgService<IState, any>[] = [];
export const emptyStorageSelectors: MsgSelector<IState, any, any>[] = [];

export const storageSelectors: MsgSelector<IState, any, BehaviorSubject<IControlData>>[] = [
    ['observerable-data', dataSelector]
];
