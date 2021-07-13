import { IState, IControlData } from '@designer-core/shared/stateTypes';
import { BoxProps, DragFrameProps } from '@designer-core/shared/types';

import { combineSelectors } from '../../helpers';
import { SelectorMap } from '../../storeTypes';

type ManagedProps = BoxProps & Partial<DragFrameProps>;

const OffsetPositionMapper: SelectorMap<IState, ManagedProps> = (state, props) => {

    const { offsetPosition$ } = props;

    const { position } = state.root$.getValue();
    const [addx, addy] = offsetPosition$.getValue();

    console.log('1root offset:', position);

    props.offsetPosition$.next([position[0] + addx, position[1] + addy]);
};

const RootSizePositionMapper: SelectorMap<IState, ManagedProps> = (state, props) => {
    const { position, size } = state.root$.getValue();
    console.log('1root offset:', position);
    props.xy$.next([position[0], position[1]]);
    props.size$.next([size[0], size[1]]);
};


const selector = (state: IState, props: ManagedProps) =>
    combineSelectors<IState, IControlData, ManagedProps>(state.root$, 'root', [RootSizePositionMapper, OffsetPositionMapper])(state, props);


export default selector;
