import { IState, IControlData } from '@designer-core/shared/stateTypes';
import { BoxProps } from '@designer-core/shared/types';

import { combineSelectors } from '../../helpers';
import { SelectorMap } from '../../storeTypes';
import { EMPTY } from 'rxjs';

const OffsetPositionMapper: SelectorMap<IState, BoxProps> = (state, props) => {
    const { offsetPosition$ } = props;
    const [addx, addy] = offsetPosition$.getValue();
    const { position } = state.root$.getValue();
    console.log('OffsetPositionMapper-lasso: root>', position, offsetPosition$.getValue());
    props.offsetPosition$.next([position[0] + addx, position[1] + addy]);
};

const selector = (state: IState, props: BoxProps) =>
    combineSelectors<IState, IControlData, BoxProps>(state.root$, 'lasso', [OffsetPositionMapper])(state, props);


export default selector;
