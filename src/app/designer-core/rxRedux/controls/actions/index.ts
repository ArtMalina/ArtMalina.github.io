import { ActionName, ActionFunc } from '../../storeTypes';
import { Position } from '@designer-core/shared/types';

export const UPDATE_ROOT_POSITION = 'update-root-position' as ActionName;
export const UPDATE_CONTROL_POSITION = 'update-control-position' as ActionName;

export const updateRootPosition: ActionFunc<Position> = (payload) => {
    return { payload, type: UPDATE_ROOT_POSITION };
};
