import { IState } from '@designer-core/shared/stateTypes';
import { Position } from '@designer-core/shared/types';
import { ActionReducerTuple } from '../../storeTypes';

import { UPDATE_ROOT_POSITION } from '../actions';


export const UpdateRootPosition: ActionReducerTuple<IState, Position> = [
    UPDATE_ROOT_POSITION,
    (state: IState, payload: Position) => {
        console.log('UPDATE_ROOT_POSITION ->', payload);
        state.root$.next({ ...state.root$.getValue(), position: [payload[0], payload[1]] })
    }
];
