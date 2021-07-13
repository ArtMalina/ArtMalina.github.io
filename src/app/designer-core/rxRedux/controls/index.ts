import { ROOT_GUID } from '@designer-core/shared/types';
import { BehaviorSubject } from 'rxjs';
import { UIPrimitive, IControlData, IState } from '@designer-core/shared/stateTypes';

import { UpdateRootPosition } from './reducers/root';

const UIStyles: { [key: string]: React.CSSProperties } = {
    [UIPrimitive.RectangleBlock]: { backgroundColor: '#213c58' }
};
const CONTROLS = [
    ...new Array(4)
        // ...new Array(53)
        // ...new Array(Math.round(Math.random() * 4 + 3))
        .fill(0)
        .map<IControlData>((_, i) => ({
            guid: `test-${i}`,
            classType: 'testClass',
            uiType: UIPrimitive.RectangleBlock,
            position: [Math.round(Math.random() * 450 + i * 20), Math.round(Math.random() * 250 + i * 20)],
            size: [Math.round(Math.random() * 150 + 80), Math.round(Math.random() * 90 + 70)],
            style: UIStyles[UIPrimitive.RectangleBlock]
        }))
];
const ROOT_CONTROL: IControlData = {
    guid: ROOT_GUID,
    classType: 'Root',
    position: [10, 10],
    size: [700, 500],
    uiType: UIPrimitive.Root
};


export const initialState: IState = {
    controls$: new BehaviorSubject<IControlData[]>([...CONTROLS]),
    root$: new BehaviorSubject<IControlData>({ ...ROOT_CONTROL }),
};


export default [UpdateRootPosition];
