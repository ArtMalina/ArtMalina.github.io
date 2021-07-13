import { BehaviorSubject } from 'rxjs';
import { Position } from './types';

export enum UIPrimitive {
    Root = 'root',
    CircleBlock = 'circle',
    RectangleBlock = 'rectangle',
    ConditionBlock = 'condition',
    TimerBlock = 'timer'
}

export interface IControlData {
    guid: string;
    id?: string | number;
    position: [number, number];
    size: [number, number];
    style?: React.CSSProperties,
    classType: string;
    uiType: UIPrimitive;
}

export interface IRenderer {
    absoluteOffset: Position;
}

export interface IState {
    root$: BehaviorSubject<IControlData>;
    controls$: BehaviorSubject<IControlData[]>;
}
